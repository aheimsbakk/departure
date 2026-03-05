---
when: 2026-03-05T20:57:03Z
why: GPS stop selection should always show all transport modes, not inherit the previous filter
what: GPS dropdown selection now resets transport modes to ALL_TRANSPORT_MODES
model: github-copilot/claude-sonnet-4.6
tags: [gps, transport-modes, handlers]
---

`handleGpsStationSelect` in `handlers.js` now passes `ALL_TRANSPORT_MODES.slice()` instead of stripping modes or forwarding the stop's own subset; `ALL_TRANSPORT_MODES` added to the import. The stop's modes in `gps-dropdown.js` remain display-only (emoji badges in the list). Bumped to v1.36.12.
