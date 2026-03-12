---
when: 2026-03-12T21:24:17Z
why: Version footer was not updated in the last main branch merge; BLUEPRINT.md still described the removed drag/snap-back scroll system
what: Bump patch to v1.37.35 and correct BLUEPRINT.md scroll-more documentation
model: opencode/claude-sonnet-4-6
tags: [version, blueprint, docs, patch]
---

Bumped version to 1.37.35 via `scripts/bump-version.sh patch` — syncing `src/config.js`, `src/sw.js`, and `package.json` so the app footer correctly reflects the latest release. Updated `BLUEPRINT.md` in three locations (user-facing features line 28, scroll-more.js arch line 48, scroll-more.css arch line 79, and version reference line 175) to replace stale drag-displacement/snap-back/marginTop/board--pulling/board--snapping descriptions with the current no-drag, threshold-fire, CSS bounce arrow + `--triggered` fast-bounce implementation. Updated `CONTEXT.md` to version 1.37.35.
