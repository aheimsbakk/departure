Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.38.2.

Current Goal: Stable mobile PWA experience across Chrome and Firefox.

Last 3 Changes:

- Refresh ANALYZE.md for v1.38.1→v1.38.2 (v1.38.2): 11 issues marked fixed; 6 carried forward; 6 new issues added (alert() in share-button, hardcoded panel title, silent catch in geocoder+gps-search, split imports in app.js+handlers.js)
- Fix ANALYZE.md High+Medium issues (v1.38.1): Race condition in refresh loop; pagehide teardown; GPS hard-fallback; sw-updater module-level \_fallbackReloadId; safe btoa for...of; console.warn on catch; dead detectMode removed; emojiForMode consolidated into mode-utils.js; settings allowlist validation
- Configurable scroll-more symbols (v1.38.0): Added SYMBOL_ARROW/SYMBOL_MAX to SCROLL_MORE in config.js; reduced PULL_THRESHOLD to 200px; scroll-more.js reads config instead of hardcoding; README documents scroll-more feature

Next Steps:

- Fix open ANALYZE.md issues: #18 alert() → toast, #20/#21 silent catch in geocoder/gps-search, #22/#23 split imports
- Update src/sitemap.xml <lastmod> on release (issue #17)
