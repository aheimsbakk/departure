Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.7.

Current Goal: Mobile UX polish on pull-to-load-more scroll feature.

Last 3 Changes:
- Scroll-more config (v1.37.7): all tunables moved to SCROLL_MORE in config.js; removed padding-bottom from body and .board (eliminated confusing empty space below content)
- Firefox body min-height fix (v1.37.6): body min-height:100% → 100vh so padding-bottom:80px actually extends below content on Firefox
- Firefox footer fix (v1.37.5): padding-bottom:80px on body; isolation:isolate + -webkit-backdrop-filter on .app-footer for Firefox stacking

Next Steps:
- Update src/sitemap.xml <lastmod> on release
