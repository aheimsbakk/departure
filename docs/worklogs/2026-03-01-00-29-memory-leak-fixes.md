---
when: 2026-03-01T00:29:40Z
why: Deep audit revealed 9 memory leak patterns causing unbounded listener accumulation and retained DOM nodes
what: Fix all memory leaks across station-dropdown, theme-toggle, panel-lifecycle, sw-updater, and options sub-modules
model: opencode/claude-sonnet-4-6
tags: [bugfix, memory, listeners, timers, cleanup]
---

Fixed 9 memory leak patterns across 8 files: added named `destroy()` methods to `station-dropdown.js` (document click + keydown), `theme-toggle.js` (MediaQueryList), `panel-lifecycle.js` (document keydown + toast timers), `station-autocomplete.js` (debounce + blur timers + `_destroyed` guard), and `transport-modes.js` (debounce timer); aggregated teardown in `options/index.js`; stored the ticker `setInterval` ID in `app.js`; and cancelled the SW update countdown/postMessage timers on `pagehide` in `sw-updater.js`. Bumped to v1.33.3.
