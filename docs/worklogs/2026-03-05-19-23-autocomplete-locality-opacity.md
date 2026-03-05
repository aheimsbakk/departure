---
when: 2026-03-05T19:23:43Z
why: Locality suffix in autocomplete (e.g. ", Oslo") should be visually de-emphasised now that bare names are used on selection
what: Render autocomplete locality suffix as a dimmed span at 50% opacity
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, ui, autocomplete, css]
---

`showCandidates` in `station-autocomplete.js` now splits each candidate into a full-opacity name span and a `.autocomplete-locality` suffix span. `autocomplete.css` sets `opacity: 0.5` on `.autocomplete-locality`. Bumped to v1.36.9.
