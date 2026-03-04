---
when: 2026-03-04T18:40:33Z
why: Chrome Android numeric keyboard fires blur but not keydown Enter, so changes to number-of-departures and fetch-interval were silently discarded on mobile
what: call applyChanges() on blur for number inputs in options panel
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, mobile, options-panel, ux]
---

Added `applyChanges()` at the end of both `blur` handlers for `inpNum` and `inpInt` in `src/ui/options/index.js`. The `diffOptions` guard inside `applyChanges` prevents spurious re-fetches when nothing changed. Bumped to v1.35.3.
