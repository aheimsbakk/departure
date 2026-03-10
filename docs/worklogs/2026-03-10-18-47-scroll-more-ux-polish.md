---
when: 2026-03-10T18:47:54Z
why: Remove jarring bounce-back, fix footer disappearing on background drag, and align indicator glyph sizes.
what: Remove bounce-back animation, fix overscroll footer flicker, equalise ▼/● indicator sizes (v1.37.2)
model: github-copilot/claude-sonnet-4.6
tags: [scroll-more, ux, css, bugfix]
---

Removed the bounce-back animation from pull-to-load-more (`scroll-more.js`), replacing `bounceBack()` with an instant `snapBack()` for a cleaner feel. Added `overscroll-behavior: none` to both `html` and `body` in `base.css` to prevent native iOS/Android elastic overscroll from hiding the fixed footer when dragging the background. Unified `.scroll-more-arrow` and `.scroll-more-dot` to the same `font-size: 1.1em` in `scroll-more.css` so the ▼ and ● indicators appear visually equal. Bumped to v1.37.2.
