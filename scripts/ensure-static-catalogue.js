const fs = require('fs');

const path = 'data.json';
let items = [];
try {
  const parsed = JSON.parse(fs.readFileSync(path, 'utf8'));
  if (Array.isArray(parsed)) items = parsed;
} catch (error) {
  console.error('data.json must contain a JSON array:', error.message);
  process.exit(1);
}

const staticItems = [
  {
    id: 'apple-duo',
    type: 'image',
    url: '/assets/iphone-duo-specs-alternatives.svg',
    rawTitle: 'Apple iPhone Duo',
    seoTitle: 'Apple iPhone Duo Review 2026: Foldable Specs, Price, Smart Upgrade Tips & Cheaper Alternatives',
    description: 'Apple iPhone Duo review with verified foldable specifications, click-to-play original video, smart upgrade analysis, cheaper alternatives, buying options, comments and reactions.',
    keywords: 'iPhone Duo, Apple foldable iPhone, iPhone Duo review, iPhone Duo price, iPhone Duo alternatives, Pixel 10 Pro Fold, Galaxy Z Fold8, iPhone 18 Pro, foldable phone review',
    alt: 'iPhone Duo specifications and cheaper alternatives infographic',
    thumbnail: '/assets/iphone-duo-specs-alternatives.svg',
    cloudflareTitle: 'Apple iPhone Duo Review 2026'
  }
];

for (const entry of staticItems) {
  const index = items.findIndex(item => String(item?.id) === String(entry.id));
  if (index >= 0) items[index] = { ...items[index], ...entry };
  else items.push(entry);
}

fs.writeFileSync(path, JSON.stringify(items, null, 2) + '\n');
console.log('Ensured persistent catalogue entries:', staticItems.map(x => x.id).join(', '));
