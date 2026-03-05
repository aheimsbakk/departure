---
when: 2026-03-05T20:34:01Z
why: Make the transport modes grid layout configurable without touching UI code
what: Move MODE_GRID from transport-modes.js to config.js (v1.36.11)
model: github-copilot/claude-sonnet-4.6
tags: [refactor, config, transport-modes]
---

Moved `MODE_GRID` constant from `src/ui/options/transport-modes.js` into `src/config.js` as an exported constant, alongside `ALL_TRANSPORT_MODES`. Updated the import in `transport-modes.js` accordingly. Also fixed GPS dropdown station selection to preserve the current transport mode filter (only name and stopId are applied). Bumped to v1.36.11.
