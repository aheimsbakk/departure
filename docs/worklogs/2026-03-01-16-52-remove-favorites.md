---
when: 2026-03-01T16:52:42Z
why: Users need to be able to remove stations from favorites, not just add them
what: Add remove-from-favorites toggle to the heart button in all 12 supported languages
model: github-copilot/claude-sonnet-4.6
tags: [feature, favorites, i18n, ui, tests]
---

Added `removeFromFavorites(stopId, modes)` to `src/ui/station-dropdown.js` and updated `updateFavoriteButton()` in `src/ui/ui.js` to enable the heart button when a station is already in favorites (previously disabled) with a new "Remove from favorites" tooltip. `handleFavoriteToggle()` in `src/app/handlers.js` now toggles: removes if present, adds if not. New `removeFromFavorites` and `removedFromFavorites` i18n keys added to all 12 languages in `src/i18n/translations.js`. New test file `tests/remove-favorites.test.mjs` (10 tests) and updated `tests/favorites.test.mjs` reflect the new enabled-when-in-favorites behaviour. Bumped to v1.34.0.
