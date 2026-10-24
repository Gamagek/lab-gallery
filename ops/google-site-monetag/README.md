# Advertising route Worker

`/compress/` now serves the browser-only image/video/ZIP tool from this repository's Cloudflare Pages assets. It rejects methods other than GET/HEAD; there is no upload or media-processing backend. The HTML uses the canonical `https://www.lowestitem.com/compress/`; scripts, styles and local Web Worker bundles are served directly by `reviews.lowestitem.com` to avoid route-Worker invocations for heavy assets. Video processing lazily downloads pinned `@ffmpeg/core@0.12.10` from jsDelivr (~32 MB) and runs single-threaded in the visitor's browser. SharedArrayBuffer/COOP/COEP are not required.

Rebuild with `npm run compressor:build`, then run `npm test`. Generated bundles are checked in because the existing Pages Git integration serves the repository without a build command. The compressor sitemap is `/compress/sitemap.xml`; a successful origin robots.txt response retains its original directives and gains this sitemap line. Existing home and review catalogues link to the tool. No D1, R2, Oracle, Portainer, DNS, route or secret changes are needed.

The compressor intentionally loads no advertising script into the page. Starting a job shows a closable, labelled Advertisement dialog once per session, with the existing owner-provided Smartlink opened only by its explicit sponsored link. Compression and downloads are never conditional on an ad click. The restrictive CSP also blocks the existing site's broad third-party ad scripts from running within the compressor.

`google-site-monetag` is attached to `www.lowestitem.com/*`. It adds the existing Monetag verification, MultiTag and service-worker endpoint to the Google Sites origin. This update adds one labelled Adsterra 320 × 50 banner and an explicit sponsored Smartlink. Binary responses are passed through. `/adsterra/banner.html` serves the isolated banner document. The workers.dev host serves a noindex preview rather than trying to fetch an undefined origin.

`reviews.lowestitem.com` and `review.lowestitem.com` instead point to Cloudflare Pages project `lab-gallery`, connected to **Gamagek/lab-gallery**, branch `main`. They are not served by this route Worker. The `Media-Seo` repository was not changed.

Before the 2026-10-18 update, the deployed Worker version was `411d6ecc-b848-4a5f-95b9-5e380101a7a5`. Its configuration had no bindings or static assets. Source and settings were downloaded before the change. Deploy the `worker.mjs` in this directory using its own Wrangler configuration, not the repository-root static-assets configuration. Do not alter routes, secrets, bindings or the Google Sites origin as part of an ad-code edit.

The Adsterra placement uses the zone and Smartlink supplied by the site owner. The network dashboard’s approval state, exclusions, revenue and impression counts require access to the publisher account; successful code installation does not establish those states.
