---
when: 2026-03-13T21:20:06Z
why: Resolve all medium-severity issues identified in ANALYZE.md to improve reliability and UX
what: Fix alert() in share-button, DEFAULTS race condition in fetch-loop, scrollMoreRef pagehide teardown
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, reliability, async, teardown, medium-severity]
---

Replaced blocking `alert()` calls in `src/ui/share-button.js` with a non-blocking `showButtonError()` helper that temporarily shows `⚠️` on the button. Snapshotted all `DEFAULTS` fields before the first `await` in `doRefresh` (`src/app/fetch-loop.js`) to eliminate TOCTOU race conditions. Added `_teardownScrollMoreRef` to `src/app.js` and wired it into `init()` and the `pagehide` handler alongside the existing dropdown/GPS teardowns. `ANALYZE.md` was fully refreshed with corrected line numbers and statuses for all 20 issues. Bumped to v1.38.3.
