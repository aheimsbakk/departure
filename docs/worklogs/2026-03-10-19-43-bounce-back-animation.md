---
when: 2026-03-10T19:43:41Z
why: Improve pull-to-load-more UX by animating the board back to origin instead of snapping instantly
what: Add ease-out-cubic rAF bounce-back animation on finger/mouse release in scroll-more
model: github-copilot/claude-sonnet-4.6
tags: [animation, scroll-more, ux, mobile]
---

Added `easeOutCubic` interpolation to `snapBack()` in `src/app/scroll-more.js`, driven by a `requestAnimationFrame` loop that smoothly returns `marginTop` to zero over `BOUNCE_DURATION_MS` (600 ms, tuneable in `SCROLL_MORE` in `src/config.js`). The rAF handle is tracked in `bounceRafId` and cancelled on new drag start or `destroy()`. Bumped to v1.37.8.
