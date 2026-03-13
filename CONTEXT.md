Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.38.3.

Current Goal: Stable mobile PWA experience across Chrome and Firefox.

Last 3 Changes:

- Fix all medium-severity ANALYZE.md issues (v1.38.3): alert() in share-button replaced with non-blocking showButtonError(); DEFAULTS race condition in fetch-loop fixed by snapshotting before first await; scrollMoreRef teardown added to pagehide handler in app.js; ANALYZE.md refreshed with corrected line numbers and statuses
- Refresh ANALYZE.md for v1.38.1→v1.38.2 (v1.38.2): 11 issues marked fixed; 6 carried forward; 6 new issues added (alert() in share-button, hardcoded panel title, silent catch in geocoder+gps-search, split imports in app.js+handlers.js)
- Fix ANALYZE.md High+Medium issues (v1.38.1): Race condition in refresh loop; pagehide teardown; GPS hard-fallback; sw-updater module-level \_fallbackReloadId; safe btoa for...of; console.warn on catch; dead detectMode removed; emojiForMode consolidated into mode-utils.js; settings allowlist validation

Next Steps:

- Fix remaining ANALYZE.md issues: silent catch in geocoder/gps-search (#4/#5), split imports in app.js+handlers.js (#1/#2/#15)
- Update src/sitemap.xml <lastmod> on release (issue #17)
