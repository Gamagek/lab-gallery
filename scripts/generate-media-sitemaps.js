const fs = require('fs');

const ORIGIN = 'https://reviews.lowestitem.com';
const TODAY = new Date().toISOString().slice(0, 10);

const R2 = 'https://pub-16ad521c710741b8abf9838e9bddac76.r2.dev';
const COMPARE_IMAGE = `${R2}/Samsung%20S%2026%20vs%20Iphone%2016%20specifications%2C%20reviews.png`;
const COMPARE_VIDEO = `${R2}/Lab%20review%201.mp4`;
const S26FE_VIDEO = `${R2}/Samsung%20S%2026%20FE%20review.mp4`;
const S26FE_IMAGE = 'https://images.samsung.com/is/image/samsung/assets/us/smartphones/galaxy-s26-fe/pdp-actual-size/S26_FE_See_Actual_Size_inch_PC_1440x547.jpg';

const esc = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const absoluteUrl = value => {
  const v = String(value || '').trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  return `${ORIGIN}${v.startsWith('/') ? v : `/${v}`}`;
};

let items = [];
try {
  const parsed = JSON.parse(fs.readFileSync('data.json', 'utf8'));
  if (Array.isArray(parsed)) items = parsed;
} catch (error) {
  console.warn('Could not parse data.json for media sitemap generation:', error.message);
}

const videoEntries = [
  {
    page: `${ORIGIN}/samsung-galaxy-s26-fe-review/`,
    thumbnail: S26FE_IMAGE,
    title: 'Samsung Galaxy S26 FE Smart Upgrade and Deal Review',
    description: 'Original Lowest Item Review Lab vertical promo introducing Samsung Galaxy S26 FE upgrade tips, review intelligence and current deal guidance.',
    content: S26FE_VIDEO,
    duration: 10,
    publicationDate: '2026-09-10'
  },
  {
    page: `${ORIGIN}/samsung-galaxy-s26-vs-iphone-16/`,
    thumbnail: COMPARE_IMAGE,
    title: 'Samsung Galaxy S26 vs iPhone 16 Review and Upgrade Analysis',
    description: 'Smartphone comparison video with specification review and smart upgrade guidance.',
    content: COMPARE_VIDEO,
    publicationDate: '2026-09-06'
  }
];

const imageEntries = [
  { page: `${ORIGIN}/samsung-galaxy-s26-fe-review/`, image: S26FE_IMAGE },
  { page: `${ORIGIN}/samsung-galaxy-s26-vs-iphone-16/`, image: COMPARE_IMAGE }
];

for (const item of items) {
  if (!item || !item.id || !item.url) continue;
  const page = `${ORIGIN}/pages/${encodeURIComponent(String(item.id))}.html`;
  const title = item.seoTitle || item.rawTitle || `Product Review ${item.id}`;
  const description = item.description || 'Product review media with smart upgrade analysis.';
  const poster = absoluteUrl(item.thumbnail || item.poster || item.image || (String(item.id) === '1' ? COMPARE_IMAGE : ''));
  const content = absoluteUrl(item.url);

  if (item.type === 'video' && poster) {
    videoEntries.push({ page, thumbnail: poster, title, description, content, publicationDate: TODAY });
  }

  if (item.type === 'image') {
    imageEntries.push({ page, image: content });
  }
}

const videoXmlEntry = v => `  <url>\n    <loc>${esc(v.page)}</loc>\n    <video:video>\n      <video:thumbnail_loc>${esc(v.thumbnail)}</video:thumbnail_loc>\n      <video:title>${esc(v.title)}</video:title>\n      <video:description>${esc(v.description)}</video:description>\n      <video:content_loc>${esc(v.content)}</video:content_loc>${v.duration ? `\n      <video:duration>${v.duration}</video:duration>` : ''}${v.publicationDate ? `\n      <video:publication_date>${esc(v.publicationDate)}</video:publication_date>` : ''}\n    </video:video>\n  </url>`;

const imageXmlEntry = i => `  <url>\n    <loc>${esc(i.page)}</loc>\n    <image:image>\n      <image:loc>${esc(i.image)}</image:loc>\n    </image:image>\n  </url>`;

const videoSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n${videoEntries.map(videoXmlEntry).join('\n')}\n</urlset>\n`;
fs.writeFileSync('video-sitemap.xml', videoSitemap);

const imageSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${imageEntries.map(imageXmlEntry).join('\n')}\n</urlset>\n`;
fs.writeFileSync('image-sitemap.xml', imageSitemap);

const mediaPages = new Map();
for (const i of imageEntries) {
  const x = mediaPages.get(i.page) || { images: [], videos: [] };
  x.images.push(i);
  mediaPages.set(i.page, x);
}
for (const v of videoEntries) {
  const x = mediaPages.get(v.page) || { images: [], videos: [] };
  x.videos.push(v);
  mediaPages.set(v.page, x);
}

const combinedEntries = [...mediaPages.entries()].map(([page, media]) => {
  const images = media.images.map(i => `    <image:image><image:loc>${esc(i.image)}</image:loc></image:image>`).join('\n');
  const videos = media.videos.map(v => `    <video:video><video:thumbnail_loc>${esc(v.thumbnail)}</video:thumbnail_loc><video:title>${esc(v.title)}</video:title><video:description>${esc(v.description)}</video:description><video:content_loc>${esc(v.content)}</video:content_loc>${v.duration ? `<video:duration>${v.duration}</video:duration>` : ''}${v.publicationDate ? `<video:publication_date>${esc(v.publicationDate)}</video:publication_date>` : ''}</video:video>`).join('\n');
  return `  <url>\n    <loc>${esc(page)}</loc>\n${[images, videos].filter(Boolean).join('\n')}\n  </url>`;
});

const mediaSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n${combinedEntries.join('\n')}\n</urlset>\n`;
fs.writeFileSync('media-sitemap.xml', mediaSitemap);

const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${ORIGIN}/sitemap.xml</loc><lastmod>${TODAY}</lastmod></sitemap>\n  <sitemap><loc>${ORIGIN}/review-sitemap.xml</loc><lastmod>${TODAY}</lastmod></sitemap>\n  <sitemap><loc>${ORIGIN}/video-sitemap.xml</loc><lastmod>${TODAY}</lastmod></sitemap>\n  <sitemap><loc>${ORIGIN}/image-sitemap.xml</loc><lastmod>${TODAY}</lastmod></sitemap>\n  <sitemap><loc>${ORIGIN}/media-sitemap.xml</loc><lastmod>${TODAY}</lastmod></sitemap>\n</sitemapindex>\n`;
fs.writeFileSync('sitemap-index.xml', sitemapIndex);
fs.writeFileSync('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap-index.xml\n`);

const s26Path = 'samsung-galaxy-s26-fe-review/index.html';
if (fs.existsSync(s26Path)) {
  let html = fs.readFileSync(s26Path, 'utf8');
  const marker = 'id="s26fe-promo-video-jsonld"';
  if (!html.includes(marker)) {
    const videoObject = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      '@id': `${ORIGIN}/samsung-galaxy-s26-fe-review/#promo-video`,
      name: 'Samsung Galaxy S26 FE Smart Upgrade and Deal Review',
      description: 'Original Lowest Item Review Lab promo showing Samsung Galaxy S26 FE smart upgrade tips, review intelligence and deal guidance.',
      thumbnailUrl: S26FE_IMAGE,
      contentUrl: S26FE_VIDEO,
      uploadDate: '2026-09-10T00:00:00+05:30',
      duration: 'PT10S',
      width: 720,
      height: 1280,
      isFamilyFriendly: true
    };
    const jsonLd = `<script id="s26fe-promo-video-jsonld" type="application/ld+json">${JSON.stringify(videoObject).replace(/</g, '\\u003c')}<\/script>`;
    html = html.replace('</head>', `${jsonLd}\n</head>`);
  }

  html = html.replace(
    'Click play when you want it — autoplay is disabled. The page first tries your original Lowest Item promo video. If that R2 object has not been uploaded yet, it automatically falls back to Samsung\'s official launch clip.',
    'Click play when you want it — autoplay is disabled. This original Lowest Item Review Lab promo is hosted in the site media library and supports the review, smart upgrade tips and deal guidance on this page.'
  );

  fs.writeFileSync(s26Path, html);
}

console.log(`Generated ${videoEntries.length} video entries and ${imageEntries.length} image entries with absolute media URLs.`);
