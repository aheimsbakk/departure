---
when: 2026-03-14T19:12:55Z
why: compass and share button must be covered by the options panel while theme and settings buttons must always remain visible above it
what: fix toolbar z-order by splitting global-gear into settings-bar and share-bar with separate stacking contexts
model: github-copilot/claude-sonnet-4.6
tags: [css, z-index, toolbar, layout, bugfix]
---

Split the single `.global-gear` fixed container into two separate `position: fixed` elements: `.settings-bar` (theme + gear, `z-index: 1300`, always above options panel) and `.share-bar` (share button only, `z-index: 1100`, covered by panel). Added `--z-compass` and `--z-share` tokens to `tokens.css`. Share bar horizontal position is measured after first paint via `requestAnimationFrame` + `getBoundingClientRect` on `.settings-bar` so the 8px gap is always pixel-exact regardless of emoji rendering width. Bumped to v1.38.9. Files touched: `src/app/action-bar.js`, `src/css/toolbar.css`, `src/css/tokens.css`.
