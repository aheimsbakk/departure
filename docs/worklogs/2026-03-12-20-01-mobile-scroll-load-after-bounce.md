---
when: 2026-03-12T20:01:41Z
why: Mobile touch snap-back did not reliably trigger when finger was lifted after new stations loaded
what: Refactor scroll-more touch path to snap back first, then load after bounce completes
model: opencode/claude-sonnet-4-6
tags: [bugfix, mobile, scroll-more, touch, raf]
---

Replaced the unreliable `snapBackPending` deferred-snap pattern with a two-phase touch strategy: `snapBack()` fires immediately on `touchend`, and `triggerLoadMore()` is called via `setTimeout(BOUNCE_DURATION_MS)` after the animation completes. Desktop mouse drag is unchanged (mid-gesture trigger). Added `postBounceLoadTimer` with cleanup in `reset()` and `destroy()` to prevent stale loads on station change. Only `src/app/scroll-more.js` was modified. Bumped to v1.37.27.
