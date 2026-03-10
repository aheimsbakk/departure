Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.8.

Current Goal: Mobile UX polish on pull-to-load-more scroll feature.

Last 3 Changes:
- Bounce-back animation (v1.37.8): finger release triggers ease-out-cubic rAF animation (BOUNCE_DURATION_MS=600ms); tuneable via SCROLL_MORE in config.js
- Scroll-more config (v1.37.7): all tunables moved to SCROLL_MORE in config.js; removed padding-bottom from body and .board
- Firefox body min-height fix (v1.37.6): body min-height:100% → 100vh

Next Steps:
- Update src/sitemap.xml <lastmod> on release
