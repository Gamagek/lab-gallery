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

// Lowest Item Review Lab is an editorial review catalogue, not the merchant
// selling iPhone Duo. Keep the product as an article topic and do not publish
// Apple's offer/shipping/return policy as if it were our own merchant listing.
const applePath = path.join('pages', 'apple-duo.html');
let appleHtml = fs.readFileSync(applePath, 'utf8');
appleHtml = appleHtml.replace(
  '{"@type":"Product","@id":"https://reviews.lowestitem.com/pages/apple-duo.html#product","name":"iPhone Duo","brand":{"@type":"Brand","name":"Apple"},"category":"Foldable smartphone","description":"Apple\'s first foldable iPhone with 5.4-inch outer and 7.6-inch inner displays, A20 Pro, 48MP Dual Fusion camera system and iOS 27.","offers":{"@type":"Offer","url":"https://www.apple.com/iphone-duo/","priceCurrency":"USD","price":"1999","availability":"https://schema.org/PreOrder","seller":{"@type":"Organization","name":"Apple"}}}',
  '{"@type":"Thing","@id":"https://reviews.lowestitem.com/pages/apple-duo.html#product","name":"iPhone Duo","description":"Apple foldable iPhone covered by this editorial review, including specifications, release information, upgrade guidance and alternatives."}'
);
fs.writeFileSync(applePath, appleHtml);

// The discontinuation page is a NewsArticle, not a product-sales page.
// Mark mentioned phones as general article topics so Google does not expect
// offers/review/aggregateRating on each mentioned phone.
const newsPath = path.join('pages', 'iphone-17-pro-discontinued.html');
let newsHtml = fs.readFileSync(newsPath, 'utf8');
newsHtml = newsHtml.replaceAll('"@type":"Product","name":"iPhone 17 Pro"', '"@type":"Thing","name":"iPhone 17 Pro"');
newsHtml = newsHtml.replaceAll('"@type":"Product","name":"iPhone 17 Pro Max"', '"@type":"Thing","name":"iPhone 17 Pro Max"');
newsHtml = newsHtml.replaceAll('"@type":"Product","name":"iPhone 18 Pro"', '"@type":"Thing","name":"iPhone 18 Pro"');
fs.writeFileSync(newsPath, newsHtml);

// The Galaxy S26 vs iPhone 16 page is an editorial comparison, not a merchant
// listing for either phone. Keep both devices as article topics.
const comparePath = path.join('samsung-galaxy-s26-vs-iphone-16', 'index.html');
if (fs.existsSync(comparePath)) {
  let compareHtml = fs.readFileSync(comparePath, 'utf8');
  compareHtml = compareHtml.replaceAll('{"@type":"Product","name":"Samsung Galaxy S26","brand":{"@type":"Brand","name":"Samsung"}}', '{"@type":"Thing","name":"Samsung Galaxy S26"}');
  compareHtml = compareHtml.replaceAll('{"@type":"Product","name":"Apple iPhone 16","brand":{"@type":"Brand","name":"Apple"}}', '{"@type":"Thing","name":"Apple iPhone 16"}');
  fs.writeFileSync(comparePath, compareHtml);
}

// Site-wide guard: generated editorial pages sometimes carry a Product schema
// object from feed data. If it has no offer/review/rating, do not expose it as
// an invalid Google Product rich-result candidate.
function sanitizeEditorialProducts(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/\{\"@type\":\"Product\"([^{}]|\{[^{}]*\})*\}/g, block => {
    if (/\"offers\"|\"review\"|\"aggregateRating\"/.test(block)) return block;
    return block.replace('\"@type\":\"Product\"', '\"@type\":\"Thing\"');
  });
  fs.writeFileSync(file, html);
}

if (fs.existsSync('pages')) {
  for (const name of fs.readdirSync('pages')) {
    if (name.endsWith('.html')) sanitizeEditorialProducts(path.join('pages', name));
  }
}
sanitizeEditorialProducts(comparePath);

console.log('Applied custom editorial pages and sanitized unintended Product/Merchant rich-result candidates.');

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
