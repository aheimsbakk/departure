---
when: 2026-03-08T22:26:00Z
why: Inconsistent clamp-based font sizes and a platform-dependent scroll indicator glyph caused visual differences between mobile and desktop.
what: Replace clamp font-sizes with 12px; replace glyph-based scroll indicator with CSS-drawn shapes
model: github-copilot/claude-sonnet-4.6
tags: [css, fix, scroll-indicator, typography]
---

Replaced `font-size: clamp(11px, calc(var(--large-scale) * 0.13), 13px)` with `font-size: 12px` in `footer.css`, `header.css`, and `scroll-loader.css` for consistency. Replaced the `⌄`/`●` Unicode glyph approach in the scroll indicator with pure CSS `::after` shapes (border-trick triangle + `border-radius` circle), both sized for equal visual weight and set to `opacity: 0.5`; removed all `textContent` glyph assignments from `scroll-loader.js` and `ui.js`. Bumped to v1.37.4.
