---
when: 2026-03-13T20:19:32Z
why: Fix all High and Medium severity issues from static analysis report (ANALYZE.md)
what: Fix race conditions, resource leaks, crash vectors, and DRY violations across the SPA
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, race-condition, resource-leak, refactor, dry, security]
---

Fixed 11 High/Medium issues from ANALYZE.md in v1.38.1. Race condition in refresh loop fixed by calling `startRefreshLoop` before `doRefresh` in `handlers.js`. Module-level `_fallbackReloadId` in `sw-updater.js` ensures cross-closure cancellation; `controllerchange` uses `{ once: true }`. Resource leaks patched: `pagehide` teardown in `app.js` destroys both dropdowns; `gps-dropdown.js` adds 12 s hard-fallback to re-enable GPS button. `scroll-more.js` guards `cancelable` before `preventDefault`. `share-button.js` btoa spread replaced with safe `for...of`. Silent `catch` in `departure.js` now logs via `console.warn`. Dead `detectMode` raw-scan (~70 lines) removed from `departure.js`. Three duplicate `emojiForMode` implementations consolidated into new `src/ui/mode-utils.js`. Settings loader in `settings.js` replaced blind `Object.assign` with allowlist-based per-key validation. Bumped to 1.38.1.
