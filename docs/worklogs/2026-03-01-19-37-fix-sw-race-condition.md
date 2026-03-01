---
when: 2026-03-01T19:37:21Z
why: Cache was not reliably cleared on update — force reload loaded new version, but subsequent normal reload served stale assets from old cache.
what: Fix SW update race condition by replacing SW_ACTIVATED postMessage with controllerchange event
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, service-worker, pwa, cache]
---

Removed the custom `SW_ACTIVATED` postMessage pattern from `src/sw.js` (activate handler) and replaced the `message` listener in `src/app/sw-updater.js` with a `controllerchange` listener. `controllerchange` is the browser-native signal that fires only after `clients.claim()` fully resolves — meaning old caches are guaranteed deleted before the page reloads. A `queueMicrotask` wrapper gives one extra tick for the activate `waitUntil` to fully settle before navigation. Bumped to v1.34.4.
