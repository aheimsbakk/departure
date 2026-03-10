---
when: 2026-03-10T20:46:38Z
why: Firefox mobile dispatches a stale rAF frame after cancelAnimationFrame(), causing a visual jump when touching during a bounce-back animation
what: Add bounceCancelled guard flag to rAF loop in scroll-more.js to prevent stale frames from firing on Firefox mobile
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, scroll-more, firefox, animation, rAF]
---

Added a `bounceCancelled` boolean flag to the rAF bounce-back loop in `src/app/scroll-more.js`. The flag is set `true` at every cancellation site (touch interrupt, reset, destroy) and checked at the top of every `step()` frame — stale frames bail out immediately without writing `marginTop`. This fixes a Firefox mobile-specific visual jump where the board would snap to a wrong position when touching during a bounce-back. Bumped to v1.37.13.
