Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.34.9.

Current Goal: Fix PWA stale data on resume after background/sleep.

Last 3 Changes:
- PWA wake-up fix (v1.34.9): fetch-loop.js tracks lastFetchAt (wall-clock ms); visibilitychange listener compares elapsed time vs FETCH_INTERVAL and triggers immediate doRefresh() if stale; app.js adds pageshow(event.persisted) guard for BFCache cold-start via full reload
- SW updater fix (v1.34.7): sw-updater.js single setInterval for countdown toast + skipWaiting; reg.waiting re-queried at trigger time; reload includes ?t=<timestamp> cache-bust
- Unified fetch loop (v1.34.7): single 1s interval drives departure countdowns + "update in" chip + fetch trigger

Next Steps:
- Deploy and test on a real device after leaving the PWA inactive for >FETCH_INTERVAL seconds
- Await user feedback or new feature requests
