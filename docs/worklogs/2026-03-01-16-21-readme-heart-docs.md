---
when: 2026-03-01T16:21:43Z
why: README still described the heart as turning grey when saved, which was incorrect after the toggle feature was added
what: Corrected heart button docs and transport mode list in README; bumped to v1.33.4
model: github-copilot/claude-sonnet-4.6
tags: [docs, readme, favorites, heart-button]
---

Updated `README.md` ingress to list all six transport modes (bus, tram, metro, rail, water, coach) and rewrote the "Using Favorites" section to accurately describe the toggle heart: red = save, white/black (theme-dependent) = already saved, click to remove. No code was changed. Bumped version 1.33.3 → 1.33.4; also updated `CONTEXT.md`.
