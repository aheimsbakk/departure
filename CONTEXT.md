Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.38.7.

Current Goal: Stable mobile PWA experience across Chrome and Firefox.

Last 3 Changes:

- Fix autocomplete wipe + GPS dropdown click bugs introduced in 1c20fbb (v1.38.7): removed input-wipe guard block from station-autocomplete.js; removed stopsMap.clear() from gps-dropdown.js openWith(); added regression tests autocomplete-input-wipe.test.mjs and gps-dropdown-click.test.mjs; fixed ES module caching issue in run.mjs (static import + unhandledRejection safety net)
- Fix remaining ANALYZE.md open issues #9 and #10 (v1.38.4): footer DOM extracted into src/ui/footer.js (SRP §8 §13); gps-dropdown.js switched to event delegation with stopsMap (Rule §11); all 20 ANALYZE.md issues now resolved
- Fix all medium-severity ANALYZE.md issues (v1.38.3): alert() in share-button replaced with non-blocking showButtonError(); DEFAULTS race condition in fetch-loop fixed by snapshotting before first await; scrollMoreRef teardown added to pagehide handler in app.js; ANALYZE.md refreshed with corrected line numbers and statuses

Next Steps:

- All ANALYZE.md issues resolved; monitor for regressions on next analysis pass
