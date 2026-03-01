---
when: 2026-03-01T16:59:58Z
why: README and BLUEPRINT were still describing the old disabled-heart behaviour after the remove-from-favorites feature shipped in v1.34.0
what: Update README.md and BLUEPRINT.md to reflect add/remove favorites toggle
model: github-copilot/claude-sonnet-4.6
tags: [docs, favorites, readme, blueprint]
---

Updated `README.md`: intro line now lists all 6 transport modes (bus, tram, metro, rail, ferry, coach); heart-button paragraph rewritten to explain the toggle (red = add, white/dark = remove, always clickable); "Using Favorites" section now documents removal. Updated `BLUEPRINT.md`: favorites bullet expanded to describe the add/remove toggle and the relevant functions; stale version reference corrected from `1.33.0` to `1.34.0`. No code changes; still v1.34.0.
