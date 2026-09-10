const fs = require('fs');
const path = require('path');

const ORIGIN = 'https://reviews.lowestitem.com';
const R2 = 'https://pub-16ad521c710741b8abf9838e9bddac76.r2.dev';
const APPLE_PAGE = `${ORIGIN}/pages/apple-duo.html`;
const APPLE_IMAGE = `${ORIGIN}/assets/iphone-duo-specs-alternatives.svg`;
const APPLE_VIDEO = `${R2}/Apple%20Duo.mp4`;
const NEWS_PAGE = `${ORIGIN}/pages/iphone-17-pro-discontinued.html`;
const NEWS_IMAGE = `${ORIGIN}/assets/iphone-17-pro-discontinued-news.svg`;

fs.mkdirSync('pages', { recursive: true });
fs.copyFileSync(path.join('templates', 'apple-duo.html'), path.join('pages', 'apple-duo.html'));
fs.copyFileSync(path.join('templates', 'iphone-17-pro-discontinued.html'), path.join('pages', 'iphone-17-pro-discontinued.html'));

// News articles should not create Product rich-result requirements merely because
// they mention a phone model.
const newsPath = path.join('pages', 'iphone-17-pro-discontinued.html');
let newsHtml = fs.readFileSync(newsPath, 'utf8');
newsHtml = newsHtml.replaceAll('"@type":"Product","name":"iPhone 17 Pro"', '"@type":"Thing","name":"iPhone 17 Pro"');
newsHtml = newsHtml.replaceAll('"@type":"Product","name":"iPhone 17 Pro Max"', '"@type":"Thing","name":"iPhone 17 Pro Max"');
newsHtml = newsHtml.replaceAll('"@type":"Product","name":"iPhone 18 Pro"', '"@type":"Thing","name":"iPhone 18 Pro"');
fs.writeFileSync(newsPath, newsHtml);

// The S26 FE is a real product review page, so keep Product markup and satisfy
// Google's Product snippet requirement with Samsung's visible current US price.
const s26Path = path.join('samsung-galaxy-s26-fe-review', 'index.html');
if (fs.existsSync(s26Path)) {
  let html = fs.readFileSync(s26Path, 'utf8');
  const oldProduct = '{"@type":"Product","@id":"https://reviews.lowestitem.com/samsung-galaxy-s26-fe-review/#product","name":"Samsung Galaxy S26 FE","brand":{"@type":"Brand","name":"Samsung"},"category":"Smartphone","description":"Galaxy S26 FE smartphone with a 6.7-inch Dynamic AMOLED 2X 120 Hz display, Exynos 2500, 50 MP main camera, 3x optical zoom, 4,900 mAh battery and One UI 9."}';
  const newProduct = '{"@type":"Product","@id":"https://reviews.lowestitem.com/samsung-galaxy-s26-fe-review/#product","name":"Samsung Galaxy S26 FE","brand":{"@type":"Brand","name":"Samsung"},"category":"Smartphone","description":"Galaxy S26 FE smartphone with a 6.7-inch Dynamic AMOLED 2X 120 Hz display, Exynos 2500, 50 MP main camera, 3x optical zoom, 4,900 mAh battery and One UI 9.","image":"https://images.samsung.com/is/image/samsung/assets/us/smartphones/galaxy-s26-fe/pdp-actual-size/S26_FE_See_Actual_Size_inch_PC_1440x547.jpg","offers":{"@type":"Offer","url":"https://www.samsung.com/us/smartphones/galaxy-s26-fe/buy/galaxy-s26-fe-128gb-unlocked-sku-sm-s741uzkaxaa/","price":"699.99","priceCurrency":"USD","seller":{"@type":"Organization","name":"Samsung"}}}';
  html = html.replace(oldProduct, newProduct);
  html = html.replace(
    '<b>Samsung US</b><p class="muted">Official unlocked pricing and promotions.</p>',
    '<b>Samsung US</b><p class="muted">Official unlocked 128 GB price: $699.99 at last verification. Promotions can change.</p>'
  );
  fs.writeFileSync(s26Path, html);
}

// Comparison pages discuss products but are not individual sales/listing pages.
const comparePath = path.join('samsung-galaxy-s26-vs-iphone-16', 'index.html');
if (fs.existsSync(comparePath)) {
  let html = fs.readFileSync(comparePath, 'utf8');
  html = html.replace(
    '{"@type":"Product","name":"Samsung Galaxy S26","brand":{"@type":"Brand","name":"Samsung"}}',
    '{"@type":"Thing","name":"Samsung Galaxy S26"}'
  );
  html = html.replace(
    '{"@type":"Product","name":"Apple iPhone 16","brand":{"@type":"Brand","name":"Apple"}}',
    '{"@type":"Thing","name":"Apple iPhone 16"}'
  );
  fs.writeFileSync(comparePath, html);
}

// Last-line defence for future generated pages: if a Product JSON-LD object has
// none of offers/review/aggregateRating, it is not eligible for Google's Product
// snippet. Convert only that invalid Product object to a neutral Thing topic.
function sanitizeNode(node) {
  if (!node || typeof node !== 'object') return false;
  let changed = false;
  if (Array.isArray(node)) {
    for (const child of node) changed = sanitizeNode(child) || changed;
    return changed;
  }

  if (node['@type'] === 'Product' && !node.offers && !node.review && !node.aggregateRating) {
    const safe = {
      '@type': 'Thing',
      ...(node['@id'] ? { '@id': node['@id'] } : {}),
      ...(node.name ? { name: node.name } : {}),
      ...(node.description ? { description: node.description } : {}),
      ...(node.url ? { url: node.url } : {}),
      ...(node.image ? { image: node.image } : {})
    };
    for (const key of Object.keys(node)) delete node[key];
    Object.assign(node, safe);
    changed = true;
  }

  for (const value of Object.values(node)) changed = sanitizeNode(value) || changed;
  return changed;
}

function sanitizeJsonLdFile(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, 'utf8');
  let fileChanged = false;
  html = html.replace(/<script([^>]*type=["']application\/ld\+json["'][^>]*)>([\s\S]*?)<\/script>/gi, (full, attrs, raw) => {
    try {
      const data = JSON.parse(raw.trim());
      if (!sanitizeNode(data)) return full;
      fileChanged = true;
      return `<script${attrs}>${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
    } catch {
      return full;
    }
  });
  if (fileChanged) fs.writeFileSync(file, html);
}

const htmlTargets = [
  'index.html',
  s26Path,
  comparePath,
  ...fs.readdirSync('pages').filter(name => name.endsWith('.html')).map(name => path.join('pages', name))
];
for (const file of htmlTargets) sanitizeJsonLdFile(file);

console.log('Applied custom pages and sanitized Product rich-result markup site-wide.');

function insertBeforeClosing(file, marker, fragment, closingTag) {
  if (!fs.existsSync(file)) return;
  let text = fs.readFileSync(file, 'utf8');
  if (text.includes(marker)) return;
  text = text.replace(closingTag, `${fragment}\n${closingTag}`);
  fs.writeFileSync(file, text);
}

const videoEntry = `  <url>\n    <loc>${APPLE_PAGE}</loc>\n    <video:video>\n      <video:thumbnail_loc>${APPLE_IMAGE}</video:thumbnail_loc>\n      <video:title>Apple iPhone Duo Smart Review, Upgrade Tips and Cheaper Alternatives</video:title>\n      <video:description>Original Lowest Item Review Lab iPhone Duo video supporting verified specifications, buying guidance, smart upgrade analysis and lower-price alternatives.</video:description>\n      <video:content_loc>${APPLE_VIDEO}</video:content_loc>\n      <video:publication_date>2026-09-10</video:publication_date>\n    </video:video>\n  </url>`;
insertBeforeClosing('video-sitemap.xml', APPLE_VIDEO, videoEntry, '</urlset>');

const mediaEntry = `  <url>\n    <loc>${APPLE_PAGE}</loc>\n    <image:image><image:loc>${APPLE_IMAGE}</image:loc></image:image>\n    <video:video><video:thumbnail_loc>${APPLE_IMAGE}</video:thumbnail_loc><video:title>Apple iPhone Duo Smart Review, Upgrade Tips and Cheaper Alternatives</video:title><video:description>Original Lowest Item Review Lab iPhone Duo video with specifications, buying guidance and lower-price alternatives.</video:description><video:content_loc>${APPLE_VIDEO}</video:content_loc><video:publication_date>2026-09-10</video:publication_date></video:video>\n  </url>`;
insertBeforeClosing('media-sitemap.xml', APPLE_VIDEO, mediaEntry, '</urlset>');

const newsImageEntry = `  <url>\n    <loc>${NEWS_PAGE}</loc>\n    <image:image><image:loc>${NEWS_IMAGE}</image:loc></image:image>\n  </url>`;
insertBeforeClosing('image-sitemap.xml', NEWS_PAGE, newsImageEntry, '</urlset>');

const newsMediaEntry = `  <url>\n    <loc>${NEWS_PAGE}</loc>\n    <image:image><image:loc>${NEWS_IMAGE}</image:loc></image:image>\n  </url>`;
insertBeforeClosing('media-sitemap.xml', NEWS_PAGE, newsMediaEntry, '</urlset>');

console.log('Ensured custom Apple media metadata in image, video and combined media sitemaps.');
