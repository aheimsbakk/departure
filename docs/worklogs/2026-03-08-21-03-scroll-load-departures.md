---
when: 2026-03-08T21:03:06Z
why: Allow users to temporarily load more departures by scrolling down, without altering the configured default
what: Add Fibonacci scroll-to-load feature for temporary departure count expansion (v1.37.0)
model: github-copilot/claude-sonnet-4.6
tags: [feature, scroll, departures, fibonacci, ui, i18n, service-worker]
---

Introduced `src/app/scroll-loader.js` (Fibonacci state machine with wheel/touch resistance) and `src/css/scroll-loader.css` (bouncing `⌄` indicator). Modified `fetch-loop.js` to accept an optional `numDepartures` override, `handlers.js` to reset displayed N on station/settings change, `ui.js` to inject the scroll indicator element, and `app.js` to wire the scroll loader after the fetch loop starts. Added `scrollLoadMore` and `scrollAtMax` i18n keys across all 12 languages, registered both new assets in `sw.js`, and fixed a missing `./app/scroll-loader.js` entry that was omitted from the service worker cache list.
