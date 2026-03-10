---
when: 2026-03-10T20:36:32Z
why: Users could not interrupt a bounce-back animation to scroll normally; their touch was hijacked as a new pull-to-load-more drag.
what: Add interruptedBounce flag to pass-through the gesture that stops a bounce animation
model: github-copilot/claude-sonnet-4.6
tags: [scroll-more, ux, animation, touch]
---

Added `interruptedBounce` flag in `src/app/scroll-more.js`. When `onPointerDown` fires during an active bounce-back rAF, it now cancels the animation, clears displacement, sets the flag, and returns early without activating the pull-to-load-more tracker — the browser receives the gesture natively. `onPointerEnd` clears the flag; `reset()` also clears it. Bumped to v1.37.12.
