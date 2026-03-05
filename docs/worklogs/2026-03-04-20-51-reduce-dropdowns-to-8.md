---
when: 2026-03-04T20:51:46Z
why: Reduce GPS and favorites dropdowns from 10 to 8 items per user request
what: Set GPS_MAX_RESULTS and NUM_FAVORITES to 8; update max-height CSS to 336px
model: github-copilot/claude-sonnet-4.6
tags: [config, gps, favorites, css, patch]
---

Changed `GPS_MAX_RESULTS` and `NUM_FAVORITES` from 10 to 8 in `src/config.js`. Updated `max-height` from `420px` to `336px` in `src/css/gps-dropdown.css` and `src/css/header.css` (proportional: 420 × 8/10). Bumped to v1.36.4.
