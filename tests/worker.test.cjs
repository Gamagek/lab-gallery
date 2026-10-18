const {test} = require('node:test');
const assert = require('node:assert/strict');

test('existing Monetag service worker and the new banner are independently available', async () => {
  const {default: worker} = await import('../ops/google-site-monetag/worker.mjs');
  const sw = await worker.fetch(new Request('https://www.lowestitem.com/sw.js'));
  assert.equal(sw.status, 200);
  assert.match(await sw.text(), /11757217/);
  const banner = await worker.fetch(new Request('https://www.lowestitem.com/adsterra/banner.html'));
  assert.equal(banner.status, 200);
  assert.match(await banner.text(), /a87d29bd0eb5876354f52929d3ef7d32\/invoke\.js/);
  assert.match(banner.headers.get('x-robots-tag'), /noindex/);
});

test('workers.dev is a preview and cannot recurse through fetch', async () => {
  const {default: worker} = await import('../ops/google-site-monetag/worker.mjs');
  const original = global.fetch;
  global.fetch = () => {throw new Error('Unexpected origin request');};
  try {
    const r = await worker.fetch(new Request('https://google-site-monetag.gkasunc.workers.dev/'));
    const html = await r.text();
    assert.equal(r.status, 200);
    assert.match(html, /quge5\.com\/88\/tag\.min\.js/);
    assert.match(html, /cf45856b1cb3dd1c888ed52638e864d8/);
    assert.match(html, /rel="sponsored nofollow noopener noreferrer"/);
    assert.doesNotMatch(html, /window\.open|location\.href\s*=/);
  } finally {global.fetch = original;}
});

test('non-HTML origin bodies are preserved byte for byte', async () => {
  const {default: worker} = await import('../ops/google-site-monetag/worker.mjs');
  const original = global.fetch;
  global.fetch = async () => new Response(new Uint8Array([0,255,10]), {headers:{'content-type':'image/png'}});
  try {
    const r = await worker.fetch(new Request('https://www.lowestitem.com/image.png'));
    assert.deepEqual(new Uint8Array(await r.arrayBuffer()), new Uint8Array([0,255,10]));
  } finally {global.fetch = original;}
});
