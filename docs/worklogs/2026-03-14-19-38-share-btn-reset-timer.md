---
when: 2026-03-14T19:38:32Z
why: Rapid clicks on the share button caused stacked setTimeout callbacks that restored to the wrong emoji, leaving the button permanently stuck on the checkmark.
what: Fix share button reset timer race condition on rapid clicks
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, share-button, timer, regression-test]
---

Fixed `src/ui/share-button.js` by introducing a single `_resetTimer` ref; both `showButtonError` and the click handler now call `clearTimeout(_resetTimer)` before re-arming, ensuring rapid clicks restart the 2-second window and always restore to `UI_EMOJIS.share`. Added regression test `tests/share-button-reset.test.mjs` (3 cases) and registered it in `tests/run.mjs`. Bumped to v1.38.10.
