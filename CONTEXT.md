Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.34.10.

Current Goal: SEO hygiene — added sitemap and project rules.

Last 3 Changes:
- Sitemap (v1.34.10): added src/sitemap.xml (single URL, lastmod only); docs/PROJECT_RULES.md rule requires lastmod update on every src/ release
- PWA wake-up fix (v1.34.9): fetch-loop.js tracks lastFetchAt; visibilitychange triggers doRefresh() if stale; app.js pageshow guard for BFCache cold-start
- SW updater fix (v1.34.7): single setInterval for countdown toast + skipWaiting; reload with ?t=<timestamp> cache-bust

Next Steps:
- Update src/sitemap.xml <lastmod> on every future release
- Await user feedback or new feature requests
