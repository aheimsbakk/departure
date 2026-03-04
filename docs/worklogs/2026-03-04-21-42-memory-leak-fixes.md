---
when: 2026-03-04T21:42:45Z
why: Eliminate memory leaks and resource-management bugs found during static analysis
what: Fix accumulating visibilitychange listeners, stale async callbacks, unbounded fetch races, innerHTML churn, and broken autocomplete Enter guard
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, memory-leak, fetch-loop, station-autocomplete, geocoder, sw-updater]
---

`fetch-loop.js`: hoisted `_visibilityHandler` to module scope and added `removeEventListener` before each re-registration, preventing stale handlers from stacking on every station change or settings apply. `station-autocomplete.js`: added `_destroyed` guards after every `await` in the search timer, threaded an `AbortController` through `searchStations` to cancel superseded in-flight requests, and exposed `isOpen()` to fix the Enter-key focus-advancement guard in `options/index.js` (was checking a private variable, always `true`). `sw-updater.js`: replaced `toast.innerHTML` in the setInterval callback with pre-created child elements updated via `textContent`. Bumped to v1.36.8.
