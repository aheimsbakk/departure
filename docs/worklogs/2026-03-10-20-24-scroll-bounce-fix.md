---
when: 2026-03-10T20:24:44Z
why: Pull-up bounce-back did not restore vertical centering cleanly on phones when content was shorter than the viewport.
what: Fix three bounce-back bugs in scroll-more pull-to-load gesture
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, scroll-more, touch, animation, mobile]
---

Fixed three issues in `src/app/scroll-more.js` (bumped to v1.37.11). Added `clearDisplacement()` which uses `style.removeProperty('margin-top')` instead of setting `"0px"`, ensuring flexbox centering is fully restored after every gesture. Interrupting a mid-bounce with a new touch now immediately clears the inline marginTop so the board cannot get stuck at an intermediate offset. `onPointerEnd` now syncs `currentDeltaY` from the actual computed inline style before starting the bounce-back, preventing a visual jump when `triggerLoadMore` re-renders the DOM during the drag.
