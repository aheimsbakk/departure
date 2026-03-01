---
when: 2026-03-01T19:55:34Z
why: After the countdown finished, the page did not reload because controllerchange could be missed and pagehide was cancelling the skipWaiting timeout.
what: Fix SW updater: move controllerchange listener before register(), add fallback reload, remove pagehide timer cancellation
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, service-worker, pwa, cache]
---

Moved the `controllerchange` listener to before `register()` in `src/app/sw-updater.js` so the event cannot be missed during async registration. Removed the `pagehide`/`_cancelTimers` pattern that was cancelling the `skipWaiting` timeout on navigation. Added a 2s fallback `setTimeout` after `skipWaiting` fires to guarantee a reload even if `controllerchange` is not received. Bumped to v1.34.5.
