---
when: 2026-03-01T21:57:49Z
why: Two independent timers caused countdown/fetch drift and Firefox SW update to freeze at 1s without reloading.
what: Unify fetch/countdown loop and fix Firefox SW auto-update flow (v1.34.8)
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, fetch-loop, service-worker, firefox, timers]
---

Replaced the two-timer fetch loop (separate `setInterval` for refresh + `setInterval` for countdowns) with a single unified 1-second interval in `src/app/fetch-loop.js`; a `ticksUntilRefresh` counter decrements each tick and triggers `doRefresh()` exactly at zero — departure chips and "update in" chip now share one clock with no drift. Fixed `src/app/handlers.js` to pass `statusEl` to `startRefreshLoop` on station-change and settings-apply, and removed the dead `t('live')` status overwrite in `src/app/app.js`. Fixed `src/app/sw-updater.js` Firefox bug: countdown toast and `skipWaiting` now driven by a single `setInterval` (not separate `setTimeout`), `reg.waiting` re-queried at trigger time to avoid the stale-reference race, reload URL now includes `?t=<timestamp>` cache-bust, and `sw.js` is fetched with `cache:'reload'` for accurate new-version display. Added `tests/fetch-loop.test.mjs` and `tests/sw-updater.test.mjs`. Bumped to v1.34.8.
