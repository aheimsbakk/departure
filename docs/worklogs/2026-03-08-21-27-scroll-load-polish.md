---
when: 2026-03-08T21:27:00Z
why: Polish scroll-load UX — preserve temp count across timer refreshes, prevent accidental triggers, and clarify max-reached state visually
what: Scroll-load resistance doubled, API cooldown added, max indicator boxed, blink removed, translations updated
model: github-copilot/claude-sonnet-4.6
tags: [scroll-load, ux, i18n, bug-fix]
---

Timer-triggered refreshes now preserve the temporary departure count via `getDisplayedN()` in `fetch-loop.js`. Wheel resistance raised to 500 px, touch to 160 px, and an 800 ms API cooldown guards against burst fetches in `scroll-loader.js`. At max (21), the `⌄` arrow gains a boxed border and stops bouncing; the "scroll for more" label hides; a static accent-coloured hint ("for more change in ⚙️") appears on over-scroll attempts — no blinking. All 12 language translations updated. `handlers.js` now calls `updateIndicator` after every `resetDisplayedN` to prevent stale CSS state after station changes. Bumped to v1.37.1.
