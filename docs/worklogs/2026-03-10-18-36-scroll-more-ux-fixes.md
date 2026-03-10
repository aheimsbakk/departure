---
when: 2026-03-10T18:36:32Z
why: Fix four mobile UX issues with the pull-to-load-more scroll feature
what: Seamless load-more trigger, compatible arrow glyph, isolated bounce animation, footer protection from board displacement
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, scroll-more, mobile, ux, css]
---

Bumped to v1.37.1. Four fixes in `src/app/scroll-more.js`, `src/css/scroll-more.css`, `src/ui/ui.js`, and `src/app.js`: (1) load-more now triggers during the pull gesture when the threshold is reached, not on finger release, via a `thresholdTriggered` guard in `onPointerMove`; (2) replaced the unsupported `⯆` glyph with `▼` (U+25BC) for universal mobile font coverage; (3) changed the bounce keyframes from `margin-top` to `transform: translateY()` with `display: inline-block` so only the arrow moves without shifting sibling text; (4) moved the footer element out of `.board` and appended it to `document.body` directly, isolating it from the board's `marginTop` drag displacement.
