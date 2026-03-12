---
when: 2026-03-12T20:23:09Z
why: CSS transition snap-back was silently skipped because the browser batched the class addition and style change in the same flush, so transitionend never fired and the board stayed displaced until the next touch.
what: Force reflow between adding .board--snapping and setting target marginTop so the CSS transition fires reliably on finger lift
model: opencode/claude-sonnet-4-6
tags: [bugfix, scroll-more, css-transition, mobile, touch]
---

Added `boardEl.offsetHeight` reflow between `boardEl.classList.add('board--snapping')` and `applyDisplacement(targetDisplacement)` in `snapBack()` inside `src/app/scroll-more.js`. Without the forced reflow the browser collapsed both operations into a single style-flush, skipping the transition entirely and never firing `transitionend` — leaving the board displaced until the user touched the screen again. Bumped to v1.37.29.
