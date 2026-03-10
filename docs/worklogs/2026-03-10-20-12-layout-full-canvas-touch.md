---
when: 2026-03-10T20:12:59Z
why: Touch drag only triggered over text; full-canvas touch surface needed
what: Expand .board to full viewport height so drag fires anywhere on screen
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, layout, touch, scroll-more, css]
---

Changed `.app-root` `align-items` from `center` to `stretch` and added `min-height: 100vh` + `justify-content: center` to `.board` in `src/css/layout.css`. The board now fills the full viewport height, making touch/mouse drag events fire on the entire canvas rather than only over the departure text. Content remains vertically centred when not overflowing; no extra space is added below the text when content overflows. Bumped to v1.37.10.
