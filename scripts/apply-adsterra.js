const fs = require('node:fs');
const path = require('node:path');

const SMARTLINK = 'https://www.profitableratecpmnetwork.com/bekcz354f?key=cf45856b1cb3dd1c888ed52638e864d8';
const placement = `<!-- adsterra-placement:start -->
<aside data-adsterra-placement aria-label="Advertisement" style="box-sizing:border-box;margin:18px auto;padding:12px 0;max-width:100%;text-align:center;font:12px/1.5 system-ui,sans-serif;clear:both">
<span style="display:block;margin-bottom:5px;opacity:.75">Advertisement</span>
<iframe src="https://google-site-monetag.gkasunc.workers.dev/adsterra/banner.html" title="Adsterra advertisement" width="320" height="50" loading="lazy" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms" referrerpolicy="strict-origin-when-cross-origin" style="display:block;width:320px;max-width:100%;height:50px;border:0;margin:0 auto;background:transparent"></iframe>
<a href="${SMARTLINK}" target="_blank" rel="sponsored nofollow noopener noreferrer" style="display:inline-block;margin-top:7px;color:inherit;text-decoration:underline">Sponsored offers · Adsterra ↗</a>
</aside>
<!-- adsterra-placement:end -->`;

const roots = ['index.html', 'all-reviews.html', 'pages', 'compare', 'samsung-galaxy-s26-fe-review', 'samsung-galaxy-s26-vs-iphone-16'];
let count = 0;
function apply(file) {
  if (!fs.existsSync(file)) return;
  if (fs.statSync(file).isDirectory()) {
    for (const name of fs.readdirSync(file)) apply(path.join(file, name));
    return;
  }
  if (!file.endsWith('.html')) return;
  let html = fs.readFileSync(file, 'utf8').replace(/\s*<!-- adsterra-placement:start -->[\s\S]*?<!-- adsterra-placement:end -->\s*/g, '');
  // One banner per document, outside shopping links and interactive controls.
  html = html.replace(/(<main\b[^>]*>)/i, `$1\n${placement}\n`);
  if (!html.includes('data-adsterra-placement')) html = html.replace(/(<body\b[^>]*>)/i, `$1\n${placement}\n`);
  fs.writeFileSync(file, html);
  count++;
}
for (const root of roots) apply(root);
console.log(`Applied one labelled Adsterra banner and explicit Smartlink to ${count} pages.`);

