---
when: 2026-03-08T21:57:44Z
why: Footer moved during scroll-drag lift and secondary text sizes were inconsistent on mobile
what: Rubber-band board lift + spring snap-back on overscroll; uniform clamp font sizes; footer detached from .board
model: github-copilot/claude-sonnet-4.6
tags: [scroll-loader, ux, mobile, css, font-size, footer]
---

Added progressive `translateY` rubber-band lift to `.board` during overscroll (wheel and touch), with a spring snap-back (`cubic-bezier(0.34, 1.56, 0.64, 1)`) on release or load trigger — giving clear visual feedback that the user is dragging the list up (`src/app/scroll-loader.js`). Fixed `.app-footer` displacement caused by CSS spec §9.3 (transformed ancestor becomes containing block for `position:fixed`): footer is now mounted as a direct `<body>` child instead of inside `.board` (`src/ui/ui.js`, `src/app/js`). Unified secondary text sizes — `.status-chip`, `.scroll-indicator-label`, and `.app-footer` all use `clamp(11px, calc(var(--large-scale) * 0.13), 13px)` so they match on every screen size (`src/css/header.css`, `src/css/scroll-loader.css`, `src/css/footer.css`). Bumped to v1.37.3.
