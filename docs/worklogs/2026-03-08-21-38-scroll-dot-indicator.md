---
when: 2026-03-08T21:38:54Z
why: Replace the boxed arrow-down with a cleaner solid dot at the scroll-load maximum
what: Swap ⌄ box for ● dot at max 21 departures; add scroll-load section to README
model: github-copilot/claude-sonnet-4.6
tags: [ui, scroll-loader, docs, patch]
---

At max 21 departures the scroll-load indicator now shows a solid `●` dot instead of the boxed `⌄` arrow, making the end-of-list marker cleaner. `updateIndicator` in `src/app/scroll-loader.js` now swaps the arrow element's text content between `⌄` (active) and `●` (max). The border/padding box rules were removed from `src/css/scroll-loader.css`. `README.md` gained a new "Loading More Departures" section and a cross-reference in the Number of Departures setting. Bumped to v1.37.2.
