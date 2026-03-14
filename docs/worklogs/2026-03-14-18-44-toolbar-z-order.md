---
when: 2026-03-14T18:44:06Z
why: Compass and share button should be covered by the options panel when it opens; theme and settings must always remain visible above it.
what: Split toolbar z-index so compass/share sit below options panel and theme/settings stay above
model: github-copilot/claude-sonnet-4.6
tags: [ui, z-index, toolbar, options-panel]
---

Added `--z-toolbar-low: 1100` token to `tokens.css` to establish a layer below `--z-options-panel: 1200`. Moved the share button out of `.global-gear` into its own `.share-bar` fixed container (z=1100, offset right 100px) in `action-bar.js` and `toolbar.css`; lowered `.gps-bar` from `--z-global-gear` to `--z-toolbar-low`. `.global-gear` retains `--z-global-gear: 1300` for theme and settings buttons, keeping them always visible. Bumped to v1.38.9.
