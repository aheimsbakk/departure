Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.34.7.

Current Goal: Fix Firefox SW update flow — countdown froze at 1s, page never reloaded.

Last 3 Changes:
- SW updater fix (v1.34.7): sw-updater.js now uses a single setInterval for both the countdown toast and the skipWaiting trigger — eliminates timer drift that caused Firefox (aggressive tab throttling) to freeze at 1s and never reload; reg.waiting re-queried at trigger time (not captured early) to fix stale-reference race; reload URL now includes ?t=<timestamp> cache-bust on both controllerchange and fallback paths; sw.js fetch uses cache:'reload' to get the real new version string
- Unified fetch loop (v1.34.7): fetch-loop.js single 1s interval drives departure countdowns + "update in" chip + fetch trigger; handlers.js startRefreshLoop calls updated to pass statusEl
- Dead code removed (v1.34.7): app.js t('live') status overwrite after initial fetch removed; stale comment updated

Next Steps:
- Deploy and confirm Firefox reloads correctly on next version bump
- Await user feedback or new feature requests
