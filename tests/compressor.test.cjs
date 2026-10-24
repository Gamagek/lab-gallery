const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const sharp = require('sharp');
const { unzipSync, unzlibSync } = require('fflate');

function chunks(bytes) {
  const result = []; const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.length);
  for (let offset = 8; offset + 12 <= bytes.length;) {
    const length = view.getUint32(offset), type = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
    result.push({ type, raw: bytes.subarray(offset, offset + length + 12), data: bytes.subarray(offset + 8, offset + 8 + length) });
    offset += length + 12; if (type === 'IEND') break;
  }
  return result;
}
test('lossless PNG reduces an uncompressed PNG while preserving pixels, scanlines and all metadata chunks', async () => {
  const { optimizePNG } = await import('../src/compressor/codecs.mjs');
  const original = await sharp({ create: { width: 120, height: 90, channels: 4, background: '#687f4980' } }).withMetadata().png({ compressionLevel: 0 }).toBuffer();
  const output = optimizePNG(new Uint8Array(original));
  assert(output.length < original.length / 3);
  assert.deepEqual(await sharp(output).raw().toBuffer(), await sharp(original).raw().toBuffer());
  const before = chunks(original), after = chunks(output);
  assert.deepEqual(after.filter(x => x.type !== 'IDAT').map(x => Buffer.from(x.raw)), before.filter(x => x.type !== 'IDAT').map(x => Buffer.from(x.raw)));
  const inflate = items => unzlibSync(Buffer.concat(items.filter(x => x.type === 'IDAT').map(x => Buffer.from(x.data))));
  assert.deepEqual(inflate(after), inflate(before));
});
test('lossless PNG rejects oversized headers and malformed inputs before decompression', async () => {
  const { optimizePNG } = await import('../src/compressor/codecs.mjs');
  assert.throws(() => optimizePNG(new Uint8Array([1, 2, 3])), /valid PNG/);
  const png = await sharp({ create: { width: 10, height: 10, channels: 3, background: '#ffffff' } }).png().toBuffer();
  new DataView(png.buffer, png.byteOffset, png.length).setUint32(16, 0xffffffff);
  assert.throws(() => optimizePNG(png), /too much memory/);
});
test('ZIP extraction restores binary data, empty files and colliding names exactly', async () => {
  const { createZIP } = await import('../src/compressor/codecs.mjs');
  const a = new TextEncoder().encode('A useful document. '.repeat(1000)), b = new Uint8Array([0, 255, 1, 128]);
  const zip = createZIP([{ name: 'notes.txt', bytes: a }, { name: 'notes.txt', bytes: b }, { name: '../empty.bin', bytes: new Uint8Array() }, { name: '__proto__', bytes: b }]);
  const restored = unzipSync(zip);
  assert.deepEqual(restored['notes.txt'], a); assert.deepEqual(restored['2-notes.txt'], b); assert.deepEqual(restored['empty.bin'], new Uint8Array());
  assert.deepEqual(restored['file-__proto__'], b);
  assert(zip.length < a.length / 4);
});
test('compressor routes reject uploads and serve a canonical sitemap without contacting an origin', async () => {
  const { default: worker } = await import('../ops/google-site-monetag/worker.mjs');
  const original = global.fetch; global.fetch = () => { throw new Error('No origin call expected'); };
  try {
    const denied = await worker.fetch(new Request('https://www.lowestitem.com/compress/', { method: 'POST', body: 'private file' }));
    assert.equal(denied.status, 405); assert.equal(denied.headers.get('allow'), 'GET, HEAD');
    const redirect = await worker.fetch(new Request('https://www.lowestitem.com/compress'));
    assert.equal(redirect.status, 301); assert.equal(redirect.headers.get('location'), 'https://www.lowestitem.com/compress/');
    const sitemap = await worker.fetch(new Request('https://www.lowestitem.com/compress/sitemap.xml'));
    assert.equal(sitemap.status, 200); assert.match(await sitemap.text(), /<loc>https:\/\/www.lowestitem.com\/compress\/<\/loc>/);
    const head = await worker.fetch(new Request('https://www.lowestitem.com/compress/sitemap.xml', { method: 'HEAD' })); assert.equal(await head.text(), '');
  } finally { global.fetch = original; }
});
test('compressor proxy preserves binary bytes and never forwards cookies or file bodies', async () => {
  const { default: worker } = await import('../ops/google-site-monetag/worker.mjs');
  const original = global.fetch;
  global.fetch = async (url, options) => {
    assert.equal(String(url), 'https://lab-gallery.pages.dev/compress/icon.svg');
    assert.equal(options.method, 'GET'); assert.equal(options.body, undefined); assert.equal(options.headers, undefined);
    return new Response(new Uint8Array([0, 255, 7]), { headers: { 'Content-Type': 'image/svg+xml' } });
  };
  try { const response = await worker.fetch(new Request('https://www.lowestitem.com/compress/icon.svg?tracking=1', { headers: { Cookie: 'private=secret' } })); assert.deepEqual(new Uint8Array(await response.arrayBuffer()), new Uint8Array([0, 255, 7])); assert.match(response.headers.get('content-security-policy'), /frame-src 'none'/); }
  finally { global.fetch = original; }
});
test('static compressor metadata describes real features and has no media upload or advertising script', () => {
  const html = fs.readFileSync('compress/index.html', 'utf8');
  assert.equal((html.match(/<h1>/g) || []).length, 1);
  assert.match(html, /rel="canonical" href="https:\/\/www.lowestitem.com\/compress\/"/);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]); assert.equal(schema['@type'], 'WebApplication'); assert.equal(schema.offers.price, '0');
  assert.doesNotMatch(html, /aggregateRating|quge5\.com|highrevenueformat/);
  const js = fs.readFileSync('src/compressor/app.js', 'utf8'); assert.doesNotMatch(js, /FormData|XMLHttpRequest|sendBeacon|window\.open|method:\s*['"]POST/);
  assert.match(html, /rel="sponsored nofollow noopener noreferrer"/);
  assert.match(fs.readFileSync('_routes.json', 'utf8'), /"\/api\/\*"/);
});
