const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const {products,checked} = require('../content/comparisons.cjs');
const root = path.resolve(__dirname,'..');
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');

test('50 distinct, substantive comparisons have source dates, valid metadata and real images', () => {
  assert.equal(products.length,50);
  assert.equal(new Set(products.map(p=>p.slug)).size,50);
  const titles=new Set(), descriptions=new Set(), prose=new Set();
  for(const p of products){
    const file=`compare/${p.slug}/index.html`, html=read(file);
    const title=html.match(/<title>(.*?)<\/title>/)[1];
    const desc=html.match(/<meta name="description" content="([^"]+)"/)[1];
    assert(!titles.has(title),p.slug+' duplicate title');titles.add(title);
    assert(!descriptions.has(desc),p.slug+' duplicate description');descriptions.add(desc);
    const original=[p.why,p.tradeoff,p.verdict].join(' ');
    assert(original.split(/\s+/).length>=125,p.slug+' needs more distinct analysis');
    assert(!prose.has(original));prose.add(original);
    assert.equal((html.match(/<h1\b/g)||[]).length,1);
    assert((html.match(/<h2\b/g)||[]).length>=7);
    assert(html.includes(`rel="canonical" href="https://reviews.lowestitem.com/compare/${p.slug}/"`));
    assert(html.includes('max-image-preview:large'));
    assert.equal(p.checked,checked);
    assert.match(p.source,/^https:\/\//);assert.match(p.priceSource,/^https:\/\//);
    const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const article=graph['@graph'].find(x=>x['@type']==='Article');
    assert.equal(article.datePublished,checked);
    assert(!JSON.stringify(graph).includes('"aggregateRating"'));
    assert(!JSON.stringify(graph).includes('"offers"'));
    assert(html.includes('not a hands-on test'));
    for(const id of ['fit','prices','checks','offers','cost','decision','sources'])assert(html.includes(`id="${id}"`));
    for(const a of p.alternatives)assert(fs.existsSync(path.join(root,`compare/${a}/index.html`)));
    const png=fs.readFileSync(path.join(root,`assets/comparisons/${p.slug}.png`));
    assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630);
    assert(html.includes(`/assets/comparisons/${p.slug}.png`));
  }
});

test('every comparison and image is discoverable without JavaScript', () => {
  const hub=read('compare/index.html'), directory=read('all-reviews.html');
  for(const p of products){
    const loc=`https://reviews.lowestitem.com/compare/${p.slug}/`;
    assert(hub.includes(`href="/compare/${p.slug}/"`));
    assert(directory.includes(`href="/compare/${p.slug}/"`));
    for(const file of ['sitemap.xml','review-sitemap.xml','comparison-sitemap.xml','image-sitemap.xml','media-sitemap.xml'])assert(read(file).includes(`<loc>${loc}</loc>`),file+' '+p.slug);
    assert(read('image-sitemap.xml').includes(`<image:loc>https://reviews.lowestitem.com/assets/comparisons/${p.slug}.png</image:loc>`));
  }
  assert(read('index.html').includes('href="/compare/"'));
  assert(read('sitemap-index.xml').includes('/comparison-sitemap.xml'));
  assert(read('robots.txt').includes('sitemap-index.xml'));
});

test('Adsterra remains labelled, isolated, and separate from real retailer links', () => {
  for(const file of ['index.html','all-reviews.html','compare/index.html',...products.map(p=>`compare/${p.slug}/index.html`)]){
    const html=read(file);
    assert.equal((html.match(/data-adsterra-placement/g)||[]).length,1,file);
    assert(html.includes('quge5.com/88/tag.min.js'),file+' missing Monetag');
    assert(html.includes('rel="sponsored nofollow noopener noreferrer"'));
    assert(html.includes('sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"'));
    assert(!html.includes('allow-top-navigation'));
  }
  const banner=read('adsterra/banner.html');
  assert(banner.includes('a87d29bd0eb5876354f52929d3ef7d32/invoke.js'));
  assert(banner.includes("'height': 50"));assert(banner.includes("'width': 320"));
  assert(!read('assets/comparison.js').includes('profitableratecpmnetwork'));
  for(const p of products){const h=read(`compare/${p.slug}/index.html`);for(const host of ['www.amazon.com','www.ebay.com','www.aliexpress.com'])assert(h.includes(`https://${host}/`));}
});

test('comparison, directory and ad rebuilds are idempotent', () => {
  const files=['index.html','compare/index.html','all-reviews.html','sitemap.xml','comparison-sitemap.xml','image-sitemap.xml',`compare/${products[0].slug}/index.html`];
  const before=files.map(hash);
  for(const script of ['generate-comparisons.js','generate-crawl-directory.js','apply-adsterra.js'])execFileSync(process.execPath,[`scripts/${script}`],{cwd:root});
  assert.deepEqual(files.map(hash),before);
});
