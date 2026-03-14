---
when: 2026-03-14T20:15:30Z
why: Unify styling and keyboard interaction across GPS, favorites, and autocomplete lists for visual and behavioural consistency.
what: Standardise dropdown item padding, gap token, focus styles, and keyboard nav across all three list components
model: opencode/claude-sonnet-4-6
tags: [css, ui, accessibility, keyboard-nav, refactor]
---

Replaced `--autocomplete-item-gap` with a shared `--dropdown-item-gap: 4px` token in `tokens.css`; all three list menus now reference it. Item padding unified to `8px` across `gps-dropdown.css`, `header.css`, and `autocomplete.css`. Removed GPS dropdown `max-width` constraint. Added `:focus-visible { outline: none }` + `.highlighted` highlight rule to favorites and autocomplete items. Migrated autocomplete list from `<ul>/<li>` to `<div>/<button>` in `station-autocomplete.js` and `autocomplete.css`. Added ↑↓/Enter/ESC keyboard navigation to `gps-dropdown.js` via `highlightedIndex` state and `setHighlight()` helper. Bumped to v1.38.11.
