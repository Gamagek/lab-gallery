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
console.log('Applied custom Apple iPhone Duo and iPhone 17 Pro discontinuation pages.');

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
