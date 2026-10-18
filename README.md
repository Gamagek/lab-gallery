# Lowest Item Review Lab

Cloudflare Pages serves `reviews.lowestitem.com` from this repository’s `main` branch. Existing media reviews remain in their current paths. The researched comparison collection is under `/compare/` with 50 separate product pages and a server-rendered directory.

Run `npm ci`, then `npm run comparisons` to regenerate the comparison pages, 1200 × 630 PNG graphics, crawl directory and labelled Adsterra placements. Run `npm test` before publishing. Source observations and distinct editorial text are in `content/comparisons.cjs`; manufacturer URLs are in `content/product-sources.json`. Prices are US starting-price snapshots checked on 2026-10-18, not a live retailer feed. Update the evidence and check date when refreshing prices. A normal rebuild does not pretend that prices were checked again.

The existing six-hour media workflow generates its original pages first and then rebuilds comparisons and advertising, so feed refreshes preserve this collection. Each comparison has a canonical URL, Article/Breadcrumb/ImageObject data, first-party image, sources, practical alternatives and a delivered-cost calculator. `comparison-sitemap.xml` is linked from the sitemap index; the image sitemap includes all 50 new graphics.

Monetag remains installed. Adsterra uses a labelled 320 × 50 sandboxed iframe and a separate sponsored Smartlink. Ordinary shopping links continue to the named manufacturer or retailer. No ad click is required to read a page.

The separate `www.lowestitem.com` route Worker is documented in `ops/google-site-monetag/`. Its source is also retained here for reproducible maintenance.
Static SEO media review gallery for laboratory testing and developing
