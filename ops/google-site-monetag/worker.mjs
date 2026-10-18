const VERIFY = '<meta name="monetag" content="2cc0acc1fd02d70d710e75d874c636d3">';
const MULTITAG = '<script src="https://quge5.com/88/tag.min.js" data-zone="278011" async data-cfasync="false"></script>';
const SMARTLINK = 'https://www.profitableratecpmnetwork.com/bekcz354f?key=cf45856b1cb3dd1c888ed52638e864d8';
const MONETAG_SW = `self.options = {"domain":"5gvci.com","zoneId":11757217};
self.lary = "";
importScripts('https://5gvci.com/act/files/service-worker.min.js?r=sw');`;
const BANNER = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Advertisement</title><style>html,body{margin:0;padding:0;width:320px;height:50px;overflow:hidden}</style></head><body><script>atOptions={key:'a87d29bd0eb5876354f52929d3ef7d32',format:'iframe',height:50,width:320,params:{}};</script><script src="https://www.highrevenueformat.com/a87d29bd0eb5876354f52929d3ef7d32/invoke.js"></script></body></html>`;
const PLACEMENT = `<aside id="lowestitem-adsterra" aria-label="Advertisement" style="box-sizing:border-box;position:relative;z-index:1;margin:0 auto;padding:8px 0;max-width:100%;background:#f7f8fb;color:#283449;text-align:center;font:12px/1.5 system-ui,sans-serif"><span style="display:block;margin-bottom:4px">Advertisement</span><iframe src="https://google-site-monetag.gkasunc.workers.dev/adsterra/banner.html" title="Adsterra advertisement" width="320" height="50" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms" referrerpolicy="strict-origin-when-cross-origin" style="display:block;width:320px;max-width:100%;height:50px;border:0;margin:auto"></iframe><a href="${SMARTLINK}" target="_blank" rel="sponsored nofollow noopener noreferrer" style="display:inline-block;margin-top:4px;color:#214b7a">Sponsored offers · Adsterra ↗</a></aside>`;

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/sw.js') {
      return new Response(request.method === 'HEAD' ? null : MONETAG_SW, {headers:{'Content-Type':'application/javascript; charset=UTF-8','Cache-Control':'no-cache','Service-Worker-Allowed':'/'}});
    }
    if (url.pathname === '/adsterra/banner.html') {
      return new Response(request.method === 'HEAD' ? null : BANNER, {headers:{'Content-Type':'text/html; charset=UTF-8','Cache-Control':'public, max-age=300','X-Robots-Tag':'noindex, nofollow'}});
    }
    // A route Worker has an origin only on www.lowestitem.com. Provide a
    // useful ad preview on workers.dev instead of recursively fetching itself.
    if (url.hostname === 'google-site-monetag.gkasunc.workers.dev') {
      return new Response(request.method === 'HEAD' ? null : `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>Lowest Item advertising preview</title>${VERIFY}${MULTITAG}</head><body style="margin:0;font-family:system-ui,sans-serif">${PLACEMENT}<main style="max-width:800px;margin:40px auto;padding:20px"><h1>Lowest Item</h1><p>This Worker adds Monetag and Adsterra placements to Lowest Item.</p><p><a href="https://www.lowestitem.com/">Visit Lowest Item</a> · <a href="https://reviews.lowestitem.com/compare/">Compare products</a></p></main></body></html>`, {headers:{'Content-Type':'text/html; charset=UTF-8','X-Robots-Tag':'noindex, follow','Cache-Control':'no-cache'}});
    }
    let response;
    try {
      response = await fetch(request);
    } catch (error) {
      console.error(JSON.stringify({event:'lowestitem_origin_failed',message:String(error?.message || error)}));
      return new Response('The origin is temporarily unavailable.', {status:502});
    }
    if (!response.ok || request.method === 'HEAD' || !response.headers.get('content-type')?.includes('text/html')) return response;
    const rewritten = new HTMLRewriter()
      .on('head', {element(head){head.prepend(`${VERIFY}\n${MULTITAG}`, {html:true});}})
      .on('body', {element(body){body.prepend(PLACEMENT, {html:true});}})
      .transform(response);
    const headers = new Headers(rewritten.headers);
    headers.delete('content-length');
    headers.delete('etag');
    return new Response(rewritten.body, {status:rewritten.status,statusText:rewritten.statusText,headers});
  }
};
