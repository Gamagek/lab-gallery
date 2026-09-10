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
  },
  {
    id: 'iphone-17-pro-discontinued',
    type: 'image',
    url: '/assets/iphone-17-pro-discontinued-news.svg',
    rawTitle: 'iPhone 17 Pro and iPhone 17 Pro Max Discontinued',
    seoTitle: 'iPhone 17 Pro & 17 Pro Max Discontinued After iPhone 18 Pro Launch: What Buyers Should Know',
    description: 'Apple lineup update covering the removal of iPhone 17 Pro and iPhone 17 Pro Max from the current Apple online lineup after the iPhone 18 Pro announcement, with official iPhone 18 Pro launch facts, upgrade guidance, smart analysis, comments and reactions.',
    keywords: 'iPhone 17 Pro discontinued, iPhone 17 Pro Max discontinued, iPhone 18 Pro launch, Apple September 2026, iPhone 18 Pro price, iPhone upgrade guide, Apple lineup update, iPhone news',
    alt: 'iPhone 17 Pro and iPhone 17 Pro Max discontinued after iPhone 18 Pro launch',
    thumbnail: '/assets/iphone-17-pro-discontinued-news.svg',
    cloudflareTitle: 'iPhone 17 Pro Discontinued After iPhone 18 Pro Launch'
  }
];

for (const entry of staticItems) {
  const index = items.findIndex(item => String(item?.id) === String(entry.id));
  if (index >= 0) items[index] = { ...items[index], ...entry };
  else items.push(entry);
}

fs.writeFileSync(path, JSON.stringify(items, null, 2) + '\n');
console.log('Ensured persistent catalogue entries:', staticItems.map(x => x.id).join(', '));
