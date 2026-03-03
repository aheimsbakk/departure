---
when: 2026-03-03T20:33:52Z
why: Make footer link emoji and README emoji configurable via UI_EMOJIS, and pin correct GitHub URL with anchor.
what: Add footerLink/footerReadme to UI_EMOJIS; update footer link URL with anchor; add footer-link tests
model: github-copilot/claude-sonnet-4.6
tags: [config, footer, emoji, tests]
---

Added `footerLink` (🔗) and `footerReadme` (📘) keys to `UI_EMOJIS` in `src/config.js`, replacing hardcoded emoji strings in `src/ui/ui.js`. Updated `DEFAULTS.GITHUB_URL` to include the `#kollektivsanntidorg` anchor fragment. Added `tests/footer-link.test.mjs` with 6 assertions covering the URL, config keys, and UI_EMOJIS references; registered it in `tests/run.mjs` before `sw.test.mjs` to avoid early `process.exit`. Bumped to v1.35.2.
