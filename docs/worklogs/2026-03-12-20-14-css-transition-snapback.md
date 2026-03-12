---
when: 2026-03-12T20:14:04Z
why: rAF snap-back animation was stalled by mobile browser compositor after touch gestures, leaving the board displaced until next touch
what: Replace rAF bounce-back with CSS transition on margin-top for compositor-thread animation
model: opencode/claude-sonnet-4-6
tags: [bugfix, mobile, scroll-more, animation, css-transition, compositor]
---

Replaced the JS rAF ease-out-cubic snap-back loop with a CSS `transition: margin-top 500ms cubic-bezier(0.33,1,0.68,1)` on `.board--snapping`. The transition runs on the compositor thread and is immune to JS-thread stalls from touch gesture handling. Added `_snapEndHandler` (stable reference) for correct `transitionend` cleanup on interrupt/reset/destroy. Removed `bounceRafId`, `bounceCancelled`, `easeOutCubic`, and `postBounceLoadTimer`; replaced with `loadAfterSnap` flag and `interruptedSnap`. `sw.js` asset list verified complete. Files touched: `src/app/scroll-more.js`, `src/css/scroll-more.css`. Bumped to v1.37.28.
