import { zipSync, unzlibSync, zlibSync } from 'fflate';

const signature = [137, 80, 78, 71, 13, 10, 26, 10];
const crcTable = Uint32Array.from({ length: 256 }, (_, n) => {
  for (let k = 0; k < 8; k++) n = (n & 1) ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const b of bytes) crc = crcTable[(crc ^ b) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function join(parts) {
  const result = new Uint8Array(parts.reduce((sum, p) => sum + p.length, 0));
  let offset = 0;
  for (const p of parts) { result.set(p, offset); offset += p.length; }
  return result;
}

// Recompress only the zlib stream. All non-IDAT chunks, bit depth, filters,
// palettes, colour profiles, EXIF and animation chunks remain byte-for-byte.
export function optimizePNG(bytes, maxInflatedBytes = 200 * 1024 * 1024) {
  if (!signature.every((b, i) => bytes[i] === b)) throw new Error('This is not a valid PNG file.');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const chunks = [], idat = [];
  let expectedMax = 0, sawEnd = false;
  for (let offset = 8; offset + 12 <= bytes.length;) {
    const length = view.getUint32(offset);
    const end = offset + length + 12;
    if (end > bytes.length) throw new Error('The PNG is incomplete.');
    const type = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
    if (type === 'IHDR') {
      if (length !== 13) throw new Error('Invalid PNG header.');
      const width = view.getUint32(offset + 8), height = view.getUint32(offset + 12);
      const depth = bytes[offset + 16], color = bytes[offset + 17];
      const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[color];
      if (!width || !height || !channels || ![1, 2, 4, 8, 16].includes(depth)) throw new Error('Unsupported PNG header.');
      // Adam7 can add scanline overhead; this bound is deliberately generous.
      expectedMax = (Math.ceil(width * channels * depth / 8) + 8) * height * 2 + 1024;
      if (!Number.isSafeInteger(expectedMax) || expectedMax > maxInflatedBytes) throw new Error('This PNG needs too much memory. Try a smaller image or use ZIP.');
    }
    const chunk = bytes.subarray(offset, end);
    chunks.push({ type, chunk });
    if (type === 'IDAT') idat.push(bytes.subarray(offset + 8, offset + 8 + length));
    offset = end;
    if (type === 'IEND') { sawEnd = true; if (offset < bytes.length) chunks.push({ type: 'TRAILER', chunk: bytes.subarray(offset) }); break; }
  }
  if (!sawEnd || !idat.length || !expectedMax) throw new Error('The PNG is incomplete.');
  // A fixed output bound prevents a malformed PNG from allocating arbitrary RAM.
  const decoded = unzlibSync(join(idat), { out: new Uint8Array(expectedMax) });
  const packed = zlibSync(decoded, { level: 9 });
  const replacement = new Uint8Array(packed.length + 12);
  const replacementView = new DataView(replacement.buffer);
  replacementView.setUint32(0, packed.length);
  replacement.set([73, 68, 65, 84], 4); replacement.set(packed, 8);
  replacementView.setUint32(packed.length + 8, crc32(replacement.subarray(4, packed.length + 8)));
  let inserted = false;
  const output = [bytes.subarray(0, 8)];
  for (const c of chunks) {
    if (c.type !== 'IDAT') output.push(c.chunk);
    else if (!inserted) { output.push(replacement); inserted = true; }
  }
  const result = join(output);
  return result.length < bytes.length ? result : bytes;
}

export function createZIP(files) {
  const entries = Object.create(null);
  const used = new Set();
  for (const file of files) {
    let clean = String(file.name).replace(/^.*[\\/]/, '').replace(/[\x00-\x1f]/g, '') || 'file';
    // Some ZIP implementations use ordinary objects internally. Avoid special
    // JavaScript property names without altering any original file bytes.
    if (['__proto__', 'constructor', 'prototype'].includes(clean)) clean = `file-${clean}`;
    let name = clean, n = 2;
    while (used.has(name)) name = `${n++}-${clean}`;
    used.add(name);
    entries[name] = [file.bytes, { level: 9, mtime: new Date('2020-01-01T00:00:00Z') }];
  }
  return zipSync(entries, { level: 9 });
}
