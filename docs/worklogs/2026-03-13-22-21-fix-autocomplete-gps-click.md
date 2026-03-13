---
when: 2026-03-13T22:21:17Z
why: Two bugs introduced in commit 1c20fbb broke autocomplete input and GPS station selection
what: fix autocomplete input-wipe guard and GPS stopsMap.clear() regression (v1.38.7)
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, autocomplete, gps, tests, regression]
---

Removed the erroneous input-wipe guard block from `src/ui/options/station-autocomplete.js` (lines 120–126) that cleared the field for users with no saved stop ID; removed `stopsMap.clear()` from `openWith()` in `src/ui/gps-dropdown.js` that wiped the map before the delegated click handler could use it. Added regression tests `tests/autocomplete-input-wipe.test.mjs` and `tests/gps-dropdown-click.test.mjs`; updated `tests/run.mjs` with static imports plus an `unhandledRejection` safety net for async tests. Bumped to v1.38.7.
