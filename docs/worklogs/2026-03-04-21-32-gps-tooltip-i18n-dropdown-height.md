---
when: 2026-03-04T21:32:59Z
why: GPS tooltip did not update on language change and both dropdowns showed a scrollbar at 8 items
what: Live-translate GPS tooltip on language change; increase GPS and favorites dropdown max-height to 420px
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, i18n, gps, dropdown, css]
---

Added `container.updateTooltip()` to `gps-dropdown.js` and wired it into `updateButtonTooltips` in `handlers.js` via a new `gpsRef` mutable-box (mirrors the existing `optsRef` pattern); `app.js` creates `gpsRef`, passes it to `wireHandlers`, and sets `gpsRef.current` after `buildGpsBar`. Also raised `max-height` from 336px to 420px in `gps-dropdown.css` and `header.css` to eliminate the spurious scrollbar. Bumped to v1.36.7.
