---
when: 2026-03-12T20:36:42Z
why: CSS snap-back transition was still unreliable because the reflow was in the wrong place, and pull gesture felt unresponsive because isNearBottom() measured the stretched flex container instead of actual content.
what: Move offsetHeight reflow to onPointerEnd and fix isNearBottom() to use listEl.scrollHeight
model: opencode/claude-sonnet-4-6
tags: [bugfix, scroll-more, css-transition, mobile, touch, layout]
---

Two fixes in `src/app/scroll-more.js`. (1) Moved `offsetHeight` reflow from inside `snapBack()` to `onPointerEnd`, between `remove('board--pulling')` and `snapBack()` — the browser now flushes the `transition:none !important` removal before the snapping class is added, making the CSS transition fire reliably. (2) `isNearBottom()` now measures `listEl.scrollHeight` instead of `boardEl.getBoundingClientRect().height`; the `.board` flex item always stretches to `100vh` so the old check always fell through to the scroll-position path, causing the drag to feel unresponsive. Bumped to v1.37.31.
