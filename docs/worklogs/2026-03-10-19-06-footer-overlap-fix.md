---
when: 2026-03-10T19:06:09Z
why: With 21 departures loaded, the bottom of the board and scroll-more indicator were visually covered by the fixed footer.
what: Add padding-bottom to .app-root so board content always clears the fixed footer (v1.37.3)
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, css, layout, footer]
---

Added `padding-bottom: 80px` to `.app-root` in `layout.css` so that the board content (including the scroll-more indicator at 21 departures) never scrolls under the fixed footer. No JS changes. Bumped to v1.37.3.
