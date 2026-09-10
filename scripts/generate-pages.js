const fs = require('fs');
const path = require('path');

const ORIGIN = 'https://reviews.lowestitem.com';
const MONETAG_VERIFY = '<meta name="monetag" content="2cc0acc1fd02d70d710e75d874c636d3">';
const MONETAG = '<script src="https://quge5.com/88/tag.min.js" data-zone="278011" async data-cfasync="false"></script>';
const GENERIC_POSTER = 'https://pub-16ad521c710741b8abf9838e9bddac76.r2.dev/Samsung%20S%2026%20vs%20Iphone%2016%20specifications%2C%20reviews.png';
const COMPARE_VIDEO = 'https://pub-16ad521c710741b8abf9838e9bddac76.r2.dev/Lab%20review%201.mp4';
const TODAY = new Date().toISOString().slice(0, 10);

const items = JSON.parse(fs.readFileSync('data.json', 'utf8'));
const gasUrl = process.env.GAS_URL || '';
fs.mkdirSync('pages', { recursive: true });

const esc = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');
const xml = esc;
const safeJson = value => JSON.stringify(value).replace(/</g, '\\u003c');

for (const item of items) {
  if (!item || !item.id) continue;
  const id = String(item.id);
  const title = item.seoTitle || item.rawTitle || `Product Review ${id}`;
  const description = item.description || `Product media review ${id} with specification breakdown and smart upgrade comparison tools.`;
  const keywords = item.keywords || '';
  const canonical = `${ORIGIN}/pages/${encodeURIComponent(id)}.html`;
  const isVideo = item.type === 'video';
  const poster = item.thumbnail || item.poster || item.image || (id === '1' ? GENERIC_POSTER : '');
  const media = isVideo
    ? `<video controls playsinline preload="metadata"${poster ? ` poster="${esc(poster)}"` : ''} style="width:100%;aspect-ratio:16/9;object-fit:contain;background:#020812;border-radius:16px"><source src="${esc(item.url)}" type="video/mp4"></video>`
    : `<img src="${esc(item.url)}" alt="${esc(item.alt || title)}" loading="eager" fetchpriority="high" style="width:100%;aspect-ratio:16/9;object-fit:contain;background:#020812;border-radius:16px">`;

  const graph = [
    { '@type': 'WebPage', '@id': canonical + '#webpage', url: canonical, name: title, dateModified: TODAY },
    { '@type': 'TechArticle', headline: title, description, mainEntityOfPage: { '@id': canonical + '#webpage' }, dateModified: TODAY, author: { '@type': 'Organization', name: 'Lowest Item Review Lab' }, publisher: { '@type': 'Organization', name: 'Lowest Item Review Lab', url: ORIGIN + '/' } },
    { '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'Review catalogue', item: ORIGIN + '/' }, { '@type': 'ListItem', position: 2, name: title, item: canonical } ] }
  ];
  if (isVideo && poster) graph.push({ '@type': 'VideoObject', name: title, description, thumbnailUrl: poster, contentUrl: item.url, uploadDate: TODAY });
  if (!isVideo) graph.push({ '@type': 'ImageObject', name: title, description, contentUrl: item.url });
  if (item.schema && typeof item.schema === 'object' && Object.keys(item.schema).length) graph.push(item.schema);

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
${MONETAG_VERIFY}
${MONETAG}
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="keywords" content="${esc(keywords)}">
<meta name="robots" content="index,follow,max-image-preview:large,max-video-preview:-1,max-snippet:-1">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="article"><meta property="og:site_name" content="Lowest Item Review Lab"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}">${poster ? `<meta property="og:image" content="${esc(poster)}">` : ''}
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}">${poster ? `<meta name="twitter:image" content="${esc(poster)}">` : ''}
<link rel="stylesheet" href="../style.css">
<script type="application/ld+json">${safeJson({ '@context': 'https://schema.org', '@graph': graph })}<\/script>
<style>body{background:#061022;color:#f7faff}.seo-page{width:min(900px,calc(100% - 26px));margin:30px auto}.seo-card{background:#0d1f40;border:1px solid #8bbcff2b;border-radius:20px;padding:20px;margin-bottom:16px}.seo-page a{color:#8bd4ff}.seo-page input{width:100%;padding:12px;border-radius:11px;border:1px solid #8bbcff2b;background:#07172f;color:#fff}.seo-page button{padding:11px 14px;border:0;border-radius:11px;background:linear-gradient(135deg,#4da9ff,#a674ff);color:#fff;font-weight:800;cursor:pointer}.seo-result{margin-top:12px}</style>
</head>
<body>
<main class="seo-page"><p><a href="/">← Browse all product reviews</a></p><article class="seo-card"><h1>${esc(title)}</h1><p>${esc(description)}</p>${media}</article><section class="seo-card"><h2>⚡ Smart Upgrade Intelligence</h2><p>Compare products, specifications, upgrade paths and practical value.</p><input id="compare-query-${esc(id)}" placeholder="e.g. this product vs another model"><p><button onclick="runComparison('${esc(id)}')">Compare & Analyze Upgrades</button></p><div id="comparison-result-${esc(id)}" class="seo-result"></div></section><section class="seo-card"><h2>Explore more</h2><p><a href="/samsung-galaxy-s26-fe-review/">Samsung Galaxy S26 FE review →</a></p><p><a href="/samsung-galaxy-s26-vs-iphone-16/">Galaxy S26 vs iPhone 16 comparison →</a></p></section></main>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script>async function runComparison(id){const q=document.getElementById('compare-query-'+id).value.trim(),o=document.getElementById('comparison-result-'+id);if(!q)return;o.textContent='⏳ Analyzing…';try{const r=await fetch(${JSON.stringify(gasUrl)},{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'compare',query:q})});const d=JSON.parse(await r.text());o.innerHTML=d.success?marked.parse(String(d.result||'')):'Error: '+String(d.error||'Analysis failed')}catch(e){o.textContent='Analysis error: '+e.message}}</script>
<script src="../s26fe-deals-widget.js" defer></script>
</body></html>`;
  fs.writeFileSync(path.join('pages', `${id}.html`), html);
}

const staticPages = [
  { loc: `${ORIGIN}/`, priority: '1.0', freq: 'weekly' },
  { loc: `${ORIGIN}/samsung-galaxy-s26-fe-review/`, priority: '0.9', freq: 'weekly' },
  { loc: `${ORIGIN}/samsung-galaxy-s26-vs-iphone-16/`, priority: '0.9', freq: 'weekly' }
];
const generatedPages = items.filter(x => x && x.id).map(x => ({ loc: `${ORIGIN}/pages/${encodeURIComponent(String(x.id))}.html`, priority: '0.7', freq: 'weekly' }));
const allPages = [...staticPages, ...generatedPages];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allPages.map(x => `  <url><loc>${xml(x.loc)}</loc><lastmod>${TODAY}</lastmod><changefreq>${x.freq}</changefreq><priority>${x.priority}</priority></url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync('sitemap.xml', sitemap);

const reviewPages = allPages.filter(x => x.loc !== `${ORIGIN}/`);
const reviewSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${reviewPages.map(x => `  <url><loc>${xml(x.loc)}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync('review-sitemap.xml', reviewSitemap);

const mediaEntries = [];
mediaEntries.push(`  <url>\n    <loc>${ORIGIN}/samsung-galaxy-s26-vs-iphone-16/</loc>\n    <image:image><image:loc>${xml(GENERIC_POSTER)}</image:loc></image:image>\n    <video:video><video:thumbnail_loc>${xml(GENERIC_POSTER)}</video:thumbnail_loc><video:title>Samsung Galaxy S26 vs iPhone 16 Review and Upgrade Analysis</video:title><video:description>Smartphone comparison video with specification review and smart upgrade guidance.</video:description><video:content_loc>${xml(COMPARE_VIDEO)}</video:content_loc></video:video>\n  </url>`);
for (const item of items) {
  if (!item || !item.id || !item.url) continue;
  const loc = `${ORIGIN}/pages/${encodeURIComponent(String(item.id))}.html`;
  const title = item.seoTitle || item.rawTitle || `Product Review ${item.id}`;
  const description = item.description || 'Product review media with smart upgrade analysis.';
  const poster = item.thumbnail || item.poster || item.image || (String(item.id) === '1' ? GENERIC_POSTER : '');
  if (item.type === 'video' && poster) mediaEntries.push(`  <url>\n    <loc>${xml(loc)}</loc>\n    <video:video><video:thumbnail_loc>${xml(poster)}</video:thumbnail_loc><video:title>${xml(title)}</video:title><video:description>${xml(description)}</video:description><video:content_loc>${xml(item.url)}</video:content_loc></video:video>\n  </url>`);
  if (item.type === 'image') mediaEntries.push(`  <url>\n    <loc>${xml(loc)}</loc>\n    <image:image><image:loc>${xml(item.url)}</image:loc></image:image>\n  </url>`);
}
const mediaSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n${mediaEntries.join('\n')}\n</urlset>\n`;
fs.writeFileSync('media-sitemap.xml', mediaSitemap);

const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${ORIGIN}/sitemap.xml</loc><lastmod>${TODAY}</lastmod></sitemap>\n  <sitemap><loc>${ORIGIN}/media-sitemap.xml</loc><lastmod>${TODAY}</lastmod></sitemap>\n</sitemapindex>\n`;
fs.writeFileSync('sitemap-index.xml', sitemapIndex);

fs.writeFileSync('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap-index.xml\n`);
console.log(`Generated ${generatedPages.length} dynamic review pages and refreshed SEO sitemaps.`);
