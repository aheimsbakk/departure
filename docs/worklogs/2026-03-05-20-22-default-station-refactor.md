---
when: 2026-03-05T20:22:58Z
why: Clean up default-station seeding, consolidate duplicate station-select logic, fix share-link favorites leak, and align transport modes grid/label
what: Refactor default station handling, share link, handlers, and modes grid (v1.36.10)
model: github-copilot/claude-sonnet-4.6
tags: [refactor, favorites, share-link, transport-modes, i18n, handlers]
---

Replaced old `DEFAULT_FAVORITE` seeding behaviour with a pure `getDefaultStation()` function in `station-dropdown.js` — startup fallback reads the default without writing to localStorage. `getRecentStations()` is now a pure read returning `[]` on empty storage. Share links (`url-import.js`) no longer add the shared station to favorites. `handlers.js` gained a private `applyStation(station, addToFavorites)` helper eliminating ~30 lines of duplication between `handleStationSelect` and `handleGpsStationSelect`. Transport modes grid reordered to `[bus,tram],[coach,metro],[water,rail]` and EN label changed from "Rail" to "Train". Test assertions in `tests/favorites.test.mjs` corrected to match the current `DEFAULT_FAVORITE` (Oslo S / NSR:StopPlace:59872) and actual `updateFavoriteButton` API (no theme param). Bumped to v1.36.10.
