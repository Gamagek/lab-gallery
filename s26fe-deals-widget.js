(()=>{
  if(document.getElementById('s26fe-deal-radar-widget')) return;
  const deals=[
    ['GQ Mobiles — Sri Lanka','From LKR 219,900','Sale from LKR 249,900; island-wide delivery advertised; delivery fee not published.','https://gqmobiles.lk/samsung/samsung-s26-fe-5g'],
    ['Nexel via ikman — Sri Lanka','LKR 219,900 • 256GB','COD stated for Colombo only; delivery fee not published. Verify stock before payment.','https://ikman.lk/en/ad/samsung-galaxy-s26-fe-8gb-256gb-brand-new-for-sale-colombo'],
    ['MoneySavingExpert / Giffgaff — UK','£649 • 256GB','Deal terms include a £10 goodybag condition if needed; linked-retailer shipping applies.','https://www.moneysavingexpert.com/cheap-mobile-finder/sim-free/samsung/galaxy-s26-fe/'],
    ['AT&T — US','$699.99 • 128GB','Full retail price; free shipping shown for eligible US delivery addresses.','https://www.att.com/buy/phones/samsung-galaxy-s26-fe.html'],
    ['Samsung US','$699.99 • 128GB','Official launch price; taxes and shipping excluded from displayed price.','https://www.samsung.com/us/smartphones/galaxy-s26-fe/buy/galaxy-s26-fe-128gb-unlocked-sku-sm-s741uzkaxaa'],
    ['Idealo — UK comparison','From £699 incl. delivery','Some indexed 128GB offers include delivery; retailer and delivery time vary.','https://www.idealo.co.uk/compare/213529231/samsung-galaxy-s26-fe.html'],
    ['Argos — UK','£699 • 128GB','Delivery/collection availability and any fee require postcode check.','https://www.argos.co.uk/product/9357905'],
    ['MediaMarkt — Spain','€799 • 128GB','VAT included; free shipping shown on indexed listing.','https://www.mediamarkt.es/es/product/_movil-samsung-galaxy-s26-fe-grafito-128gb-8gb-ram-67-dynamic-amoled-2x-fhd-exynos-2500-4900-mah-1672523.html'],
    ['Samsung Malaysia','RM2,899 RRP • 128GB','Eligible launch offers can reduce effective price; shipping not verified.','https://news.samsung.com/my/samsung-galaxy-s26-fe-delivering-the-latest-flagship-experience-focused-on-what-matters-most'],
    ['Samsung Singapore','S$1,018 RRP • 128GB','GST included; qualifying launch savings advertised; shipping not verified.','https://news.samsung.com/sg/samsung-galaxy-s26-fe-delivering-the-latest-flagship-experiences-focused-on-what-matter-most']
  ];
  const el=document.createElement('section');
  el.id='s26fe-deal-radar-widget';
  el.innerHTML=`<style>
  #s26fe-deal-radar-widget{width:min(1180px,calc(100% - 30px));margin:30px auto;padding:24px;border:1px solid rgba(136,186,255,.18);border-radius:22px;background:linear-gradient(180deg,rgba(16,38,77,.9),rgba(8,24,51,.92));color:#f7faff;box-shadow:0 24px 60px rgba(0,0,0,.25);font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
  #s26fe-deal-radar-widget h2{margin:0 0 6px;font-size:clamp(1.45rem,3vw,2.2rem)}
  #s26fe-deal-radar-widget p{color:#aec0dc}
  #s26fe-deal-radar-widget .s26fe-actions{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0 18px}
  #s26fe-deal-radar-widget .s26fe-btn{display:inline-flex;padding:11px 14px;border-radius:12px;text-decoration:none;font-weight:850;background:linear-gradient(135deg,#4ca8ff,#a774ff);color:white}
  #s26fe-deal-radar-widget details{border-top:1px solid rgba(255,255,255,.1);padding-top:14px}
  #s26fe-deal-radar-widget summary{cursor:pointer;font-weight:850;color:#fff}
  #s26fe-deal-radar-widget .s26fe-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:14px}
  #s26fe-deal-radar-widget .s26fe-deal{padding:13px;border:1px solid rgba(255,255,255,.09);border-radius:14px;background:rgba(255,255,255,.045)}
  #s26fe-deal-radar-widget .s26fe-deal b{display:block}.s26fe-deal small{display:block;color:#aec0dc;margin:5px 0}.s26fe-deal a{color:#8bd4ff;font-weight:800;text-decoration:none}
  @media(max-width:700px){#s26fe-deal-radar-widget .s26fe-grid{grid-template-columns:1fr}}
  </style>
  <div style="font-size:.78rem;font-weight:900;color:#baf7d7;text-transform:uppercase;letter-spacing:.06em">Latest release intelligence</div>
  <h2>Samsung Galaxy S26 FE — new September 2026 review + deal radar</h2>
  <p>Open the dedicated S26 FE review for official launch-video playback, smart upgrade-fit metrics, AI comparison, comments/reactions and the full deal analysis. Prices below were checked 10 Sep 2026; shipping is never guessed.</p>
  <div class="s26fe-actions"><a class="s26fe-btn" href="/samsung-galaxy-s26-fe-review/">Open S26 FE full review →</a></div>
  <details><summary>Show 10 current price/deal sources</summary><div class="s26fe-grid">${deals.map((d,i)=>`<div class="s26fe-deal"><b>${i+1}. ${d[0]}</b><strong>${d[1]}</strong><small>${d[2]}</small><a href="${d[3]}" target="_blank" rel="noopener noreferrer">Check live source ↗</a></div>`).join('')}</div></details>`;
  const target=document.querySelector('main')||document.body;
  target.appendChild(el);
})();
