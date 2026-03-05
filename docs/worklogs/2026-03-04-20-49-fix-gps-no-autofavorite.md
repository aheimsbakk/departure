---
when: 2026-03-04T20:49:42Z
why: GPS stop selection was silently adding stops to favorites without user intent
what: Add handleGpsStationSelect that loads a stop without auto-saving to favorites
model: github-copilot/claude-sonnet-4.6
tags: [fix, gps, favorites, handlers]
---

Added `handleGpsStationSelect` to `src/app/handlers.js` — identical to `handleStationSelect` but omits the `addRecentStation` call, so GPS-picked stops load immediately without being added to the favorites list. `src/app.js` now wires `buildGpsBar` to this dedicated handler. The gray 🩶 heart button correctly reflects the unsaved state, letting the user choose to save explicitly. Bumped to v1.36.3.
