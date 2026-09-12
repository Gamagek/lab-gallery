const fs = require('fs');

const ORIGIN = 'https://reviews.lowestitem.com';
const TODAY = new Date().toISOString().slice(0, 10);
const MONETAG_VERIFY = '<meta name="monetag" content="2cc0acc1fd02d70d710e75d874c636d3">';
const MONETAG = '<script src="https://quge5.com/88/tag.min.js" data-zone="278011" async data-cfasync="false"></script>';

const esc = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

let items = [];
try {
  const parsed = JSON.parse(fs.readFileSync('data.json', 'utf8'));
  if (Array.isArray(parsed)) items = parsed;
} catch (error) {
  console.warn('Could not read data.json:', error.message);
}

const pages = [
  {
    title: 'Samsung Galaxy S26 FE Review 2026',
    url: '/samsung-galaxy-s26-fe-review/',
    type: 'Review + video',
    description: 'Specifications, AI and camera analysis, upgrade guidance, click-to-play promo and deal-check sources.'
  },
  {
    title: 'Samsung Galaxy S26 vs iPhone 16 Comparison',
    url: '/samsung-galaxy-s26-vs-iphone-16/',
    type: 'Comparison + video',
    description: 'Hardware, camera, battery, software, AI and upgrade comparison.'
  }
];

for (const item of items) {
  if (!item || !item.id) continue;
  pages.push({
    title: item.seoTitle || item.rawTitle || `Review ${item.id}`,
    url: `/pages/${encodeURIComponent(String(item.id))}.html`,
    type: item.type === 'video' ? 'Video review page' : 'Review / update page',
    description: item.description || 'Product review media with smart upgrade analysis.'
  });
}

const unique = [];
const seen = new Set();
for (const page of pages) {
  if (seen.has(page.url)) continue;
  seen.add(page.url);
  unique.push(page);
}

const listItems = unique.map((p, i) => ({
  '@type': 'ListItem',
  position: i + 1,
  name: p.title,
  url: ORIGIN + p.url
}));

const cards = unique.map(p => `
<article class="card">
  <div class="type">${esc(p.type)}</div>
  <h2><a href="${esc(p.url)}">${esc(p.title)}</a></h2>
  <p>${esc(p.description)}</p>
  <a class="open" href="${esc(p.url)}">Open page →</a>
</article>`).join('\n');

const directory = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
${MONETAG_VERIFY}
${MONETAG}
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>All Product Reviews & Comparisons | Lowest Item Review Lab</title>
<meta name="description" content="Browse every current Lowest Item Review Lab review, comparison, update and video page from one crawlable HTML directory.">
<meta name="robots" content="index,follow,max-image-preview:large,max-video-preview:-1,max-snippet:-1">
<link rel="canonical" href="${ORIGIN}/all-reviews.html">
<link rel="sitemap" type="application/xml" href="${ORIGIN}/sitemap-index.xml">
<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': `${ORIGIN}/all-reviews.html#page`,
      url: `${ORIGIN}/all-reviews.html`,
      name: 'All Product Reviews and Comparisons',
      description: 'Crawlable directory of Lowest Item Review Lab pages.'
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Review catalogue', item: `${ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: 'All reviews', item: `${ORIGIN}/all-reviews.html` }
      ]
    },
    {
      '@type': 'ItemList',
      name: 'Lowest Item Review Lab directory',
      itemListElement: listItems
    }
  ]
}).replace(/</g, '\\u003c')}<\/script>
<style>
:root{--bg:#061022;--card:#0d1f40;--line:#8bbcff2b;--text:#f7faff;--muted:#afc0dc;--blue:#4da9ff}*{box-sizing:border-box}body{margin:0;background:linear-gradient(180deg,#061022,#07152d);color:var(--text);font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;line-height:1.6}.wrap{width:min(1050px,calc(100% - 26px));margin:auto}.top{border-bottom:1px solid #ffffff12;background:#061022ef}.nav{min-height:64px;display:flex;align-items:center;justify-content:space-between}.nav a{color:#ddecff;text-decoration:none}.hero{padding:42px 0 20px}.hero h1{font-size:clamp(2rem,5vw,3.8rem);line-height:1.05;margin:8px 0}.muted{color:var(--muted)}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:13px;padding-bottom:40px}.card{background:linear-gradient(180deg,#10264ddd,#091a38ed);border:1px solid var(--line);border-radius:18px;padding:18px}.card h2{font-size:1.12rem;line-height:1.32}.card h2 a,.open{color:#8bd8ff}.card p{color:var(--muted)}.type{font-size:.75rem;color:#bff8d9}.footer{padding:25px 0 45px;color:var(--muted);border-top:1px solid #ffffff10}.footer a{color:#8bd8ff}@media(max-width:700px){.grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<header class="top"><div class="wrap nav"><a href="/"><b>Lowest Item Review Lab</b></a><a href="/sitemap-index.xml">XML sitemaps</a></div></header>
<main class="wrap"><section class="hero"><p><a href="/">← Main catalogue</a></p><h1>All reviews, comparisons and product updates</h1><p class="muted">This is the permanent HTML directory for current Lowest Item Review Lab pages. Every entry uses a normal crawlable link and descriptive anchor text.</p></section><section class="grid">${cards}</section></main>
<footer class="wrap footer">Directory refreshed ${TODAY}. <a href="/sitemap-index.xml">Sitemap index</a> · <a href="/image-sitemap.xml">Image sitemap</a> · <a href="/video-sitemap.xml">Video sitemap</a></footer>
</body>
</html>\n`;

fs.writeFileSync('all-reviews.html', directory);

function addToSitemap(path) {
  if (!fs.existsSync(path)) return;
  let xml = fs.readFileSync(path, 'utf8');
  const loc = `${ORIGIN}/all-reviews.html`;
  if (xml.includes(`<loc>${loc}</loc>`)) return;
  const entry = `  <url><loc>${loc}</loc><lastmod>${TODAY}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
  xml = xml.replace('</urlset>', `${entry}</urlset>`);
  fs.writeFileSync(path, xml);
}

addToSitemap('sitemap.xml');

console.log(`Generated all-reviews.html with ${unique.length} direct review links and added it to sitemap.xml.`);
