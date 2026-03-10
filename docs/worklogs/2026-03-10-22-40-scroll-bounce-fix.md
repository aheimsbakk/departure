---
when: 2026-03-10T22:40:23Z
why: Bounce-back animation failed intermittently after releasing the finger during a load-more fetch due to a rAF stall caused by a DOM mutation racing with the first animation frame.
what: Defer snapBack() until after renderDepartures() completes when a fetch is in-flight on pointer release
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, scroll-more, animation, mobile]
---

Added `snapBackPending` flag to `src/app/scroll-more.js`. When the user releases their finger while a load-more fetch is still in-flight, `onPointerEnd` now sets `snapBackPending = true` instead of calling `snapBack()` immediately. The `finally` block of `triggerLoadMore()` fires `snapBack()` once the DOM mutation from `renderDepartures()` has settled, preventing the mobile-browser compositor stall that kept the board stuck until the next touch. The flag is also cleared in `reset()` and `destroy()`. Bumped to v1.37.22.
