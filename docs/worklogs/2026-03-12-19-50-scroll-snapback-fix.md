---
when: 2026-03-12T19:50:28Z
why: Fix snapBack() skipping animation and currentDeltaY desync on pointer-down
what: Fix scroll-more snapBack target calculation and pointer-down state init
model: github-copilot/claude-opus-4.6
tags: [bugfix, scroll-more, animation]
---

Fixed two bugs in `src/app/scroll-more.js`. (1) `snapBack()` used `Math.max(start, min)` to compute the target, which collapsed to `start` when the board was between `minDisplacement` and `0`, causing an instant jump instead of an animated bounce-back — replaced with `Math.min(0, minDisplacement)` so the target is always the correct resting position. (2) `onPointerDown` zeroed `currentDeltaY` instead of reading the board's actual `marginTop`, desyncing JS state from the DOM after a clamped snapBack. Bumped to v1.37.26.
