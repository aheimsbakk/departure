---
when: 2026-03-12T20:55:57Z
why: Users had no visual feedback when the pull-to-load-more threshold was crossed during a drag gesture on mobile.
what: Add accent-colored triggered state to scroll-more indicator when drag threshold is reached
model: opencode/claude-sonnet-4-6
tags: [enhancement, scroll-more, mobile, touch, ux, css]
---

Added `.scroll-more-indicator--triggered` class in `src/app/scroll-more.js`: applied on `onPointerMove` when `rawPullDistance` crosses `PULL_THRESHOLD`, removed on `onPointerEnd` before `triggerLoadMore` fires (load-on-release behaviour unchanged). Styled in `src/css/scroll-more.css`: arrow and label switch to `--accent` color at full opacity, bounce animation speeds up to 0.5 s as a "ready to load" cue. Bumped to v1.37.33.
