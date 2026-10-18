# Advertising route Worker

`google-site-monetag` is attached to `www.lowestitem.com/*`. It adds the existing Monetag verification, MultiTag and service-worker endpoint to the Google Sites origin. This update adds one labelled Adsterra 320 × 50 banner and an explicit sponsored Smartlink. Binary responses are passed through. `/adsterra/banner.html` serves the isolated banner document. The workers.dev host serves a noindex preview rather than trying to fetch an undefined origin.

`reviews.lowestitem.com` and `review.lowestitem.com` instead point to Cloudflare Pages project `lab-gallery`, connected to **Gamagek/lab-gallery**, branch `main`. They are not served by this route Worker. The `Media-Seo` repository was not changed.

Before the 2026-10-18 update, the deployed Worker version was `411d6ecc-b848-4a5f-95b9-5e380101a7a5`. Its configuration had no bindings or static assets. Source and settings were downloaded before the change. Deploy the `worker.mjs` in this directory using its own Wrangler configuration, not the repository-root static-assets configuration. Do not alter routes, secrets, bindings or the Google Sites origin as part of an ad-code edit.

The Adsterra placement uses the zone and Smartlink supplied by the site owner. The network dashboard’s approval state, exclusions, revenue and impression counts require access to the publisher account; successful code installation does not establish those states.
