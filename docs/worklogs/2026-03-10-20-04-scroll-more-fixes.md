---
when: 2026-03-10T20:04:01Z
why: Fix memory, state-desync, and animation jitter bugs in scroll-more; add Prettier tooling
what: scroll-more bug fixes (5 issues) + Prettier dev dependency
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, scroll-more, memory, prettier, tooling]
---

Fixed five issues in `src/app/scroll-more.js`: zeroing `currentDeltaY` when a bounce is cancelled mid-flight on pointer-down (jitter), advancing `tempCount` only after a successful fetch (state desync), cancelling the rAF and resetting `marginTop` in `reset()` (stale DOM reference), adding a double-init guard via `_activeInstance` to prevent duplicate `window` listeners, and clamping per-event `deltaY` to `WHEEL_THRESHOLD / 2` to normalise trackpad vs mouse-wheel behaviour. Added `prettier@3.5.3` as an exact dev dependency with `.prettierrc` (single quotes, semicolons, 2-space indent, printWidth 100) and `npm run format` / `npm run format:check` scripts. Bumped to v1.37.9.
