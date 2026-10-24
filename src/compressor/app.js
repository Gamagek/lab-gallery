import { FFmpeg } from '@ffmpeg/ffmpeg';

const $ = id => document.getElementById(id);
const MB = 1024 * 1024;
const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.deviceMemory && navigator.deviceMemory <= 4);
const maxTotal = (mobile ? 100 : 200) * MB;
const state = { mode: 'images', files: [], outputs: [], urls: new Set(), busy: false, abort: null, engine: null, engineURLs: [], sponsorSeen: false };
const imageExtensions = /\.(jpe?g|png|webp|avif|bmp)$/i;
const videoExtensions = /\.(mp4|mov|m4v|webm|mkv|avi|mpg|mpeg|ogv)$/i;
const imageNames = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'image/bmp': 'bmp' };
const fileSize = n => n < 1024 ? `${n} B` : n < MB ? `${(n / 1024).toFixed(1)} KB` : `${(n / MB).toFixed(1)} MB`;
const stem = name => name.replace(/\.[^.]+$/, '') || 'file';
const el = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; };
function objectURL(blob) { const url = URL.createObjectURL(blob); state.urls.add(url); return url; }
function checkCancel() { if (state.abort?.signal.aborted) throw new DOMException('Cancelled', 'AbortError'); }
function notice(text, error = false) { $('notice').hidden = !text; $('notice').textContent = text; $('notice').classList.toggle('error', error); }
function progress(label, percent, detail = 'Your file stays on this device.') {
  $('job-progress').hidden = false; $('progress-label').textContent = label; $('progress-detail').textContent = detail;
  if (percent === null) $('progress').removeAttribute('value'); else $('progress').value = Math.min(100, Math.max(0, percent));
}
function clearOutputs() {
  for (const url of state.urls) URL.revokeObjectURL(url);
  state.urls.clear(); state.outputs = [];
  $('result-list').replaceChildren(); $('result-summary').replaceChildren(); $('results').hidden = true;
}
function lock(busy) {
  state.busy = busy;
  for (const node of document.querySelectorAll('.tab, .settings select, #choose-files, #try-demo, #clear-files, .queue button')) node.disabled = busy;
  $('compress').disabled = busy || !state.files.length;
  $('cancel').hidden = !busy;
  if (!busy && $('image-mode').value === 'lossless') { $('image-format').disabled = true; $('image-size').disabled = true; }
  $('drop-zone').setAttribute('aria-disabled', String(busy));
  $('tool-panel').setAttribute('aria-busy', String(busy));
}
function renderQueue() {
  $('queue').replaceChildren();
  state.files.forEach((file, index) => {
    const row = el('div', 'queue-row'), info = el('div', 'queue-info');
    const name = el('span', 'file-name', file.name); name.title = file.name;
    info.append(name, el('span', 'size', fileSize(file.size)));
    const remove = el('button', '', '×'); remove.type = 'button'; remove.setAttribute('aria-label', `Remove ${file.name}`);
    remove.onclick = () => { if (state.busy) return; clearOutputs(); state.files.splice(index, 1); renderQueue(); };
    row.append(info, remove); $('queue').append(row);
  });
  $('compress').disabled = state.busy || !state.files.length;
}
function setMode(mode) {
  if (state.busy) return;
  state.mode = mode; state.files = []; clearOutputs(); notice(''); $('file-input').value = ''; $('job-progress').hidden = true;
  for (const tab of document.querySelectorAll('.tab')) { const active = tab.dataset.mode === mode; tab.classList.toggle('active', active); tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; }
  $('tool-panel').setAttribute('aria-labelledby', `tab-${mode}`);
  $('image-settings').hidden = mode !== 'images'; $('video-settings').hidden = mode !== 'video'; $('zip-settings').hidden = mode !== 'zip'; $('try-demo').hidden = mode !== 'images';
  const input = $('file-input'); input.multiple = mode !== 'video';
  const labels = {
    images: ['A little lighter looks good.', 'Drop your images here, or choose them from your device.', 'Choose images', 'JPG, PNG, WebP, AVIF, BMP · Up to 20 images · 20 MB per image', 'Compress images'],
    video: ['Big moments. Smaller files.', 'Choose one video. Keep this tab open while it is compressed.', 'Choose a video', `MP4, MOV, WebM & more · One video · Up to ${maxTotal / MB} MB`, 'Compress video'],
    zip: ['All your files. One neat package.', 'Drop files of any type to create a lossless ZIP archive.', 'Choose files', `Any file type · Up to 100 files · ${maxTotal / MB} MB total`, 'Create lossless ZIP']
  }[mode];
  $('drop-title').textContent = labels[0]; $('drop-copy').textContent = labels[1]; $('choose-files').textContent = `＋ ${labels[2]}`; $('format-help').textContent = labels[3]; $('compress').textContent = `${labels[4]} ↘`;
  input.accept = mode === 'images' ? 'image/jpeg,image/png,image/webp,image/avif,image/bmp' : mode === 'video' ? 'video/*,.mkv,.avi,.mov,.m4v' : '';
  $('device-limit').textContent = mode === 'images' ? `Processed one at a time · ${maxTotal / MB} MB total selection limit` : `Device memory guard: ${maxTotal / MB} MB total. Available RAM can impose a lower limit.`;
  renderQueue();
}
function addFiles(incoming) {
  if (state.busy) return;
  clearOutputs(); notice('');
  const problems = [];
  for (const file of Array.from(incoming)) {
    if (state.mode === 'images' && !imageExtensions.test(file.name)) { problems.push(`${file.name}: use ZIP to preserve unsupported images or animation.`); continue; }
    if (state.mode === 'video' && !videoExtensions.test(file.name) && !file.type.startsWith('video/')) { problems.push(`${file.name}: choose a video, or use ZIP for any other file.`); continue; }
    const perFile = state.mode === 'images' ? 20 * MB : maxTotal;
    if (!file.size && state.mode !== 'zip') { problems.push(`${file.name}: empty files are only supported in ZIP mode.`); continue; }
    if (file.size > perFile) { problems.push(`${file.name} exceeds the ${perFile / MB} MB limit.`); continue; }
    if (state.files.length >= (state.mode === 'video' ? 1 : state.mode === 'images' ? 20 : 100)) { problems.push('The selection is full. Remove a file to add another.'); break; }
    if (state.files.reduce((sum, f) => sum + f.size, 0) + file.size > maxTotal) { problems.push(`Keep the selection below ${maxTotal / MB} MB to protect device memory.`); continue; }
    if (!state.files.some(f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)) state.files.push(file);
  }
  if (problems.length) notice(problems.join(' '), true);
  renderQueue();
}
async function fetchBlob(url, type, signal) {
  const response = await fetch(url, { credentials: 'omit', signal });
  if (!response.ok) throw new Error('A compression component could not be downloaded. Check your connection and retry.');
  return URL.createObjectURL(new Blob([await response.arrayBuffer()], { type }));
}
async function codecJob(data, transfers = []) {
  checkCancel();
  const workerURL = await fetchBlob(new URL(__CODEC_WORKER__, import.meta.url), 'text/javascript', state.abort.signal);
  if (state.abort.signal.aborted) { URL.revokeObjectURL(workerURL); checkCancel(); }
  return new Promise((resolve, reject) => {
    let worker;
    const finish = () => { worker?.terminate(); URL.revokeObjectURL(workerURL); state.abort?.signal.removeEventListener('abort', abort); };
    const abort = () => { finish(); reject(new DOMException('Cancelled', 'AbortError')); };
    try {
      worker = new Worker(workerURL);
      worker.onmessage = ({ data: result }) => { finish(); result.ok ? resolve(result.bytes) : reject(new Error(result.error)); };
      worker.onerror = () => { finish(); reject(new Error('Your browser could not run the compression worker. Try a smaller file or a current browser.')); };
      state.abort.signal.addEventListener('abort', abort, { once: true }); worker.postMessage(data, transfers);
    } catch (error) { finish(); reject(error); }
  });
}
async function decodeImage(file) {
  if ('createImageBitmap' in window) {
    try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch { /* Browser image decoder fallback below. */ }
  }
  const url = URL.createObjectURL(file);
  try { return await new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error('This image could not be decoded. Try another format or use ZIP.')); image.src = url; }); }
  finally { URL.revokeObjectURL(url); }
}
async function checkStillImage(file) {
  const head = new Uint8Array(await file.slice(0, 128).arrayBuffer());
  if (head[0] === 137 && head[1] === 80 && head[2] === 78 && head[3] === 71) {
    for (let offset = 8, count = 0; offset + 12 <= file.size && count < 1000; count++) {
      const header = new Uint8Array(await file.slice(offset, offset + 8).arrayBuffer());
      const type = String.fromCharCode(...header.subarray(4, 8));
      if (type === 'acTL') throw new Error('This PNG is animated. Choose lossless PNG or ZIP to preserve its animation.');
      if (type === 'IDAT' || type === 'IEND') break;
      offset += new DataView(header.buffer).getUint32(0) + 12;
    }
  }
  if (String.fromCharCode(...head.subarray(0, 4)) === 'RIFF' && String.fromCharCode(...head.subarray(12, 16)) === 'VP8X' && (head[20] & 2)) throw new Error('This WebP is animated. Use ZIP to preserve every frame.');
  if (String.fromCharCode(...head.subarray(4, 8)) === 'ftyp' && String.fromCharCode(...head).includes('avis')) throw new Error('This AVIF contains an image sequence. Use ZIP to preserve it.');
}
async function compressImage(file, options) {
  if (options.mode === 'lossless') {
    if (!/\.png$/i.test(file.name)) return { blob: file, name: file.name, note: 'Original preserved exactly. Lossless image recompression is available for PNG; use ZIP for other exact originals.' };
    const bytes = new Uint8Array(await file.arrayBuffer()); checkCancel();
    const packed = await codecJob({ kind: 'png', bytes, maxInflatedBytes: (mobile ? 100 : 200) * MB }, [bytes.buffer]);
    return { blob: new Blob([packed], { type: 'image/png' }), name: file.name, note: 'Lossless PNG: identical image data and metadata. No resizing or quality changes.' };
  }
  await checkStillImage(file); checkCancel();
  const image = await decodeImage(file);
  let canvas;
  try {
    checkCancel();
    const width = image.width || image.naturalWidth, height = image.height || image.naturalHeight;
    if (width * height > (mobile ? 24 : 48) * 1e6) throw new Error('This image has too many pixels for safe browser processing. Use ZIP or resize it in a desktop app.');
    const scale = options.maxEdge ? Math.min(1, options.maxEdge / Math.max(width, height)) : 1;
    canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(width * scale)); canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext('2d'); if (!context) throw new Error('Your browser cannot create an image canvas.');
    if (options.format === 'image/jpeg') { context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height); }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, options.format, { high: .92, balanced: .80, small: .62 }[options.mode]));
    checkCancel(); if (!blob) throw new Error('Your browser could not encode this image. Try JPG or PNG.');
    const extension = imageNames[blob.type]; if (!extension) throw new Error('Your browser returned an unsupported output format.');
    return { blob, name: `${stem(file.name)}-smaller.${extension}`, note: `${canvas.width} × ${canvas.height} px · ${extension.toUpperCase()}${options.format !== blob.type ? ' (browser format fallback)' : ''}. Standard image conversion can change pixels and remove metadata.` };
  } finally { image.close?.(); if (canvas) { canvas.width = 0; canvas.height = 0; } }
}
function releaseEngine() {
  state.engine?.terminate(); state.engine = null;
  for (const url of state.engineURLs) URL.revokeObjectURL(url);
  state.engineURLs = [];
}
async function loadVideoEngine() {
  progress('Preparing the video engine…', null, 'First use downloads about 32 MB of software. No video is sent to a server.');
  const signal = state.abort.signal;
  const workerURL = await fetchBlob(new URL(__FFMPEG_WORKER__, import.meta.url), 'text/javascript', signal); state.engineURLs.push(workerURL); checkCancel();
  const coreURL = await fetchBlob('https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js', 'text/javascript', signal); state.engineURLs.push(coreURL); checkCancel();
  const wasmURL = await fetchBlob('https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm', 'application/wasm', signal); state.engineURLs.push(wasmURL); checkCancel();
  const engine = new FFmpeg(); state.engine = engine;
  await engine.load({ classWorkerURL: workerURL, coreURL, wasmURL }, { signal }); checkCancel();
  return engine;
}
async function compressVideo(file, options) {
  const engine = await loadVideoEngine();
  const extension = (file.name.match(/\.([a-z0-9]+)$/i)?.[1] || 'mp4').toLowerCase();
  const input = `input.${extension}`, output = 'output.mp4';
  let duration = 0, lastLog = '';
  engine.on('log', ({ message }) => { lastLog = message; const match = message.match(/Duration: (\d+):(\d+):([\d.]+)/); if (match) duration = +match[1] * 3600 + +match[2] * 60 + +match[3]; });
  engine.on('progress', ({ time, progress: fraction }) => { const percent = duration ? time / 1e6 / duration * 100 : fraction * 100; progress('Compressing video on your device…', Number.isFinite(percent) ? Math.min(99, percent) : null, 'Progress is approximate. Keep this tab open. You can cancel at any time.'); });
  try {
    progress('Reading your video locally…', null);
    const bytes = new Uint8Array(await file.arrayBuffer()); checkCancel(); await engine.writeFile(input, bytes); checkCancel();
    const filter = options.maxEdge ? `scale='min(${options.maxEdge},iw)':'min(${options.maxEdge},ih)':force_original_aspect_ratio=decrease:force_divisible_by=2,format=yuv420p` : 'scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p';
    progress('Compressing video on your device…', null, 'Video encoding can take several minutes. Keep this tab open.');
    const status = await engine.exec(['-i', input, '-map', '0:v:0', '-map', '0:a:0?', '-sn', '-dn', '-vf', filter, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', { high: '20', balanced: '24', small: '28' }[options.quality], '-threads', '1', '-c:a', 'aac', '-b:a', options.quality === 'small' ? '96k' : '128k', '-movflags', '+faststart', output]);
    checkCancel(); if (status !== 0) throw new Error(`This video could not be encoded. Its codec may be unsupported, the file may be damaged, or your device may be out of memory.${/memory|OOM/i.test(lastLog) ? ' Try a smaller video.' : ''}`);
    progress('Preparing your download…', 99);
    const data = await engine.readFile(output); checkCancel();
    return { blob: new Blob([data], { type: 'video/mp4' }), name: `${stem(file.name)}-smaller.mp4`, note: 'MP4 · H.264 + AAC · Lossy compression. Compare the result before replacing your original.' };
  } finally { releaseEngine(); }
}
function renderResult(original, result, originalSize = original.size) {
  checkCancel();
  const kept = state.mode !== 'zip' && result.blob.size >= originalSize;
  const blob = kept ? original : result.blob, name = kept ? original.name : result.name;
  const url = objectURL(blob), saved = originalSize - blob.size;
  const item = { originalSize, size: blob.size, saved }; state.outputs.push(item);
  const card = el('article', 'result-card'), info = el('div');
  info.append(el('h3', '', name));
  const sizes = el('div', 'result-sizes'); sizes.append(document.createTextNode(`${fileSize(originalSize)} → `), el('strong', '', fileSize(blob.size)));
  sizes.append(el('span', 'result-badge', saved > 0 ? `${(saved / Math.max(1, originalSize) * 100).toFixed(1)}% smaller` : saved < 0 ? 'Archive overhead' : 'Original size'));
  info.append(sizes, el('p', '', kept ? 'Already compact: your smaller original was kept unchanged.' : result.note));
  const download = el('a', 'button primary', state.mode === 'zip' ? 'Download ZIP ↓' : 'Download ↓'); download.href = url; download.download = name;
  card.append(info, download);
  if (state.mode === 'images') {
    const detail = el('details'), summary = el('summary', '', 'Compare original & result'); detail.append(summary);
    let created = false;
    detail.addEventListener('toggle', () => {
      if (!detail.open || created) return; created = true;
      const pair = el('div', 'preview-pair');
      for (const [caption, src] of [['Original', objectURL(original)], ['Result', url]]) { const figure = el('figure'), image = el('img'); image.src = src; image.alt = `${caption} preview of ${original.name}`; image.loading = 'lazy'; figure.append(el('figcaption', '', caption), image); pair.append(figure); }
      detail.append(pair);
    }); card.append(detail);
  }
  if (state.mode === 'video') { const video = el('video', 'result-video'); video.src = url; video.controls = true; video.preload = 'metadata'; video.playsInline = true; video.setAttribute('aria-label', 'Compressed video preview'); card.append(video); }
  $('result-list').append(card); $('results').hidden = false;
  const inputSize = state.outputs.reduce((sum, x) => sum + x.originalSize, 0), outputSize = state.outputs.reduce((sum, x) => sum + x.size, 0);
  $('result-summary').replaceChildren(el('span', '', `${state.outputs.length} ${state.mode === 'zip' ? 'archive' : 'file(s)'} ready`), el('strong', '', inputSize >= outputSize ? `${fileSize(inputSize - outputSize)} saved` : `${fileSize(outputSize - inputSize)} archive overhead`));
}
function showSponsorOnce() {
  try { if (state.sponsorSeen || sessionStorage.getItem('lowestitem-compress-sponsored-v1')) return; sessionStorage.setItem('lowestitem-compress-sponsored-v1', 'shown'); } catch { if (state.sponsorSeen) return; }
  state.sponsorSeen = true;
  if (typeof $('sponsor-dialog').showModal === 'function') $('sponsor-dialog').showModal();
}
async function start() {
  if (state.busy || !state.files.length) return;
  clearOutputs(); notice(''); state.abort = new AbortController(); lock(true); showSponsorOnce();
  let failures = 0;
  try {
    if (state.mode === 'zip') {
      progress('Reading files on your device…', null);
      const files = [];
      for (const file of state.files) { files.push({ name: file.name, bytes: new Uint8Array(await file.arrayBuffer()) }); checkCancel(); }
      progress('Creating a lossless ZIP…', null, 'All original bytes are preserved. Some file formats cannot shrink further.');
      const bytes = await codecJob({ kind: 'zip', files }, files.map(f => f.bytes.buffer)); checkCancel();
      const total = state.files.reduce((sum, f) => sum + f.size, 0);
      renderResult(state.files[0], { blob: new Blob([bytes], { type: 'application/zip' }), name: 'lowestitem-files.zip', note: `${state.files.length} original files preserved exactly. Extract the ZIP to restore them.` }, total);
    } else {
      const imageOptions = { mode: $('image-mode').value, format: $('image-format').value, maxEdge: +$('image-size').value };
      const videoOptions = { quality: $('video-quality').value, maxEdge: +$('video-size').value };
      for (let index = 0; index < state.files.length; index++) {
        checkCancel(); const file = state.files[index];
        progress(`Processing ${index + 1} of ${state.files.length}: ${file.name}`, state.mode === 'images' ? index / state.files.length * 100 : null);
        try { renderResult(file, state.mode === 'images' ? await compressImage(file, imageOptions) : await compressVideo(file, videoOptions)); }
        catch (error) { checkCancel(); failures++; notice(`${file.name}: ${error.message || String(error)}`, true); }
      }
    }
    progress(failures ? `Finished with ${failures} file(s) needing attention.` : 'All done. Your files never left this device.', 100, 'Download your results below. Your originals have not been changed.');
  } catch (error) {
    if (state.abort.signal.aborted || error.name === 'AbortError') { notice('Compression cancelled. Your original files are unchanged.'); $('job-progress').hidden = true; }
    else { notice(error.message || 'Compression failed. Try fewer or smaller files.', true); $('job-progress').hidden = true; }
  } finally { releaseEngine(); lock(false); }
}

for (const tab of document.querySelectorAll('.tab')) {
  tab.addEventListener('click', () => setMode(tab.dataset.mode));
  tab.addEventListener('keydown', event => { if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return; event.preventDefault(); const tabs = [...document.querySelectorAll('.tab')], current = tabs.indexOf(tab); const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; setMode(tabs[next].dataset.mode); tabs[next].focus(); });
}
$('choose-files').onclick = () => { if (!state.busy) $('file-input').click(); };
$('file-input').onchange = event => { addFiles(event.target.files); event.target.value = ''; };
for (const name of ['dragenter', 'dragover']) $('drop-zone').addEventListener(name, event => { event.preventDefault(); if (!state.busy) $('drop-zone').classList.add('dragging'); });
for (const name of ['dragleave', 'drop']) $('drop-zone').addEventListener(name, event => { event.preventDefault(); $('drop-zone').classList.remove('dragging'); if (name === 'drop') addFiles(event.dataTransfer.files); });
$('compress').onclick = start;
$('cancel').onclick = () => { state.abort?.abort(); releaseEngine(); };
$('clear-files').onclick = () => { if (state.busy) return; state.files = []; clearOutputs(); notice(''); $('job-progress').hidden = true; renderQueue(); };
for (const id of ['close-sponsor', 'skip-sponsor']) $(id).onclick = () => $('sponsor-dialog').close();
$('image-mode').onchange = () => { const lossless = $('image-mode').value === 'lossless'; $('image-format').disabled = lossless; $('image-size').disabled = lossless; $('image-quality-note').textContent = lossless ? 'PNG image data and metadata are preserved exactly. Other formats remain unchanged. Use ZIP to preserve every byte of any original file.' : 'Standard conversion is lossy for JPG and WebP; resizing reduces detail. JPG flattens transparency onto white. PNG conversion can also remove metadata.'; };
$('try-demo').onclick = async () => {
  if (state.busy) return;
  const canvas = document.createElement('canvas'); canvas.width = 1800; canvas.height = 1200;
  const ctx = canvas.getContext('2d'); const gradient = ctx.createLinearGradient(0, 0, 1800, 1200); gradient.addColorStop(0, '#c8df96'); gradient.addColorStop(.5, '#60845a'); gradient.addColorStop(1, '#183d32'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1800, 1200);
  ctx.fillStyle = '#d5f476'; ctx.beginPath(); ctx.arc(1350, 330, 180, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 100px system-ui'; ctx.fillText('A little lighter.', 130, 900); ctx.font = '36px system-ui'; ctx.fillText('A sample created on your device.', 138, 980);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png')); canvas.width = 0; canvas.height = 0;
  if (blob) addFiles([new File([blob], 'lowestitem-sample.png', { type: 'image/png' })]);
};
window.addEventListener('pagehide', () => { state.abort?.abort(); releaseEngine(); for (const url of state.urls) URL.revokeObjectURL(url); });
setMode('images');
