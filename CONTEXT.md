Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.38.4.

Current Goal: Stable mobile PWA experience across Chrome and Firefox.

Last 3 Changes:

- Fix remaining ANALYZE.md open issues #9 and #10 (v1.38.4): footer DOM extracted into src/ui/footer.js (SRP §8 §13); gps-dropdown.js switched to event delegation with stopsMap (Rule §11); all 20 ANALYZE.md issues now resolved
- Fix all medium-severity ANALYZE.md issues (v1.38.3): alert() in share-button replaced with non-blocking showButtonError(); DEFAULTS race condition in fetch-loop fixed by snapshotting before first await; scrollMoreRef teardown added to pagehide handler in app.js; ANALYZE.md refreshed with corrected line numbers and statuses
- Refresh ANALYZE.md for v1.38.1→v1.38.2 (v1.38.2): 11 issues marked fixed; 6 carried forward; 6 new issues added (alert() in share-button, hardcoded panel title, silent catch in geocoder+gps-search, split imports in app.js+handlers.js)

Next Steps:

- All ANALYZE.md issues resolved; monitor for regressions on next analysis pass
