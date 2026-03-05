---
when: 2026-03-04T19:49:57Z
why: Add GPS nearby-stop search so users can find the closest stop without typing a name
what: feat(gps): compass button with GPS nearby-stops dropdown (v1.36.0)
model: github-copilot/claude-sonnet-4.6
tags: [feature, gps, entur, geocoder, ui, i18n]
---

Introduced GPS nearby-stop search: a fixed top-left compass 🧭 button (`src/app/gps-bar.js`) requests browser geolocation, calls Entur Geocoder reverse API via `src/entur/gps-search.js` (`fetchNearbyStops`), and shows a temporary dropdown (`src/ui/gps-dropdown.js`, `src/css/gps-dropdown.css`) listing up to 7 nearby stops with mode emojis, name, and distance. Selecting a stop sets it as the current station. Toolbar layout updated in `src/css/toolbar.css`; GPS i18n keys added for `en` and `no` in `src/i18n/translations.js`; `src/entur/index.js`, `src/app.js`, `src/style.css`, and `src/sw.js` wired up accordingly. Unit tests added in `tests/entur.gps-nearby.test.mjs`. Bumped to v1.36.0.
