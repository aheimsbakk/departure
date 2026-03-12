---
when: 2026-03-12T19:04:00Z
why: Fix scroll-to-load bounce-back not animating after data loads
what: Modified snapBack() to read actual board position at call time instead of using stale currentDeltaY
model: opencode/minimax-m2.5
tags: [bugfix, scroll, mobile, ux]
---

Fixed scroll-to-load bounce-back issue where the list would stay in the new position after releasing the finger. The bug occurred because `snapBack()` used a stale position value captured at pointer-up time, but by the time the fetch completed and the animation started, the board had already shifted due to new departures being added. Now reads the actual `marginTop` at animation start time.
