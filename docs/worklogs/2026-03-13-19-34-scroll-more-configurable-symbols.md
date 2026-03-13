---
when: 2026-03-13T19:34:55Z
why: Allow operators to customise the scroll-more indicator symbols without touching JS logic
what: Add SYMBOL_ARROW and SYMBOL_MAX to SCROLL_MORE in config.js; reduce PULL_THRESHOLD to 200px; document scroll-more in README
model: github-copilot/claude-sonnet-4.6
tags: [config, scroll-more, ux, docs]
---

Added `SYMBOL_ARROW` (`▼`) and `SYMBOL_MAX` (`●`) keys to `SCROLL_MORE` in `src/config.js`; `src/app/scroll-more.js` now reads those values instead of hardcoding the characters. `PULL_THRESHOLD` reduced from 250 to 200 px per manual user edit. `README.md` gained a "Loading More Departures" section describing the gesture, Fibonacci step sequence, and symbol behaviour. Bumped to v1.38.0.
