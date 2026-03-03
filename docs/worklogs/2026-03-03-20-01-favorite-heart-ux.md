---
when: 2026-03-03T20:01:36Z
why: Improve favorites heart UX with consistent gray/red states across all themes and clean up dead theme-detection code.
what: Refactor favorite heart button to gray (not saved) / red (saved), remove theme-split logic, match dropdown font sizes
model: github-copilot/claude-sonnet-4.6
tags: [ux, favorites, refactor, css]
---

Changed heart button states from red/white/black (theme-dependent) to gray 🩶 (not in favorites) and red ❤️ (in favorites) across all themes. Removed `heartSavedLight`/`heartSavedDark` config keys in favour of a single `heartSaved`, dropped the `theme` parameter and `isLight` branch from `updateFavoriteButton`, and cleaned up now-unused `getTheme` imports in `app.js`, `handlers.js`, and `action-bar.js`. Also removed the explicit `font-size: 0.9em` from `.station-dropdown-item` and `.station-dropdown-empty` in `header.css` so the favorites dropdown inherits its size like the autocomplete dropdown does. Updated `README.md` and `BLUEPRINT.md` to reflect the new heart behavior. Bumped to v1.35.0.
