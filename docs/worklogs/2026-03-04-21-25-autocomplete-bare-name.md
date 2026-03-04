---
when: 2026-03-04T21:25:20Z
why: Autocomplete selection was saving the locality-qualified label ("Bergkrystallen, Oslo") as the station name instead of the bare stop name ("Bergkrystallen")
what: Use bare stop name on autocomplete selection; keep full label for dropdown display only
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, autocomplete, geocoder, station-name]
---

`searchStations` in `geocoder.js` now returns a `name` field (`p.name`, bare stop name) alongside the existing `title` field (`p.label`, locality-qualified). `selectCandidateIndex` in `station-autocomplete.js` writes `c.name` into the input box on selection, while the dropdown list continues to display `c.title`. Bumped to v1.36.6.
