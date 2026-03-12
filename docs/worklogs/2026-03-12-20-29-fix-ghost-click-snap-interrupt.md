---
when: 2026-03-12T20:29:56Z
why: iOS/Android ghost mousedown (~300ms after touchend) was hitting the snap-interrupt path in onPointerDown and cancelling the CSS snap-back transition mid-flight.
what: Suppress ghost-click mousedown during snap-back with a 600ms touch-end guard
model: opencode/claude-sonnet-4-6
tags: [bugfix, scroll-more, touch, ghost-click, mobile, ios, android]
---

Added `lastTouchEndAt` timestamp and `GHOST_CLICK_GUARD_MS = 600` to `src/app/scroll-more.js`. `onPointerEnd` now records the touch-end time; `onPointerDown` returns early for any `mousedown` arriving within 600ms of a touchend, preventing the synthetic ghost click from interrupting the 500ms CSS snap-back transition. Bumped to v1.37.30.
