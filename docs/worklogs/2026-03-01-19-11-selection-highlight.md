---
when: 2026-03-01T19:11:54Z
why: Selected text was unreadable in both dark and light themes due to missing ::selection styles
what: Add ::selection rule to base.css using existing highlight tokens
model: github-copilot/claude-sonnet-4.6
tags: [css, accessibility, theming, dark-mode, light-mode]
---

Added a `::selection` rule to `src/css/base.css` reusing the existing `--highlight-bg` and `--highlight-fg` design tokens, which already carry correct values for both dark (white bg / dark text) and light (dark bg / white text) themes. No new tokens were required. Bumped version to 1.34.3.
