---
when: 2026-03-10T19:11:42Z
why: Board content was scrolling behind the fixed footer when the departure list filled the screen, covering footer text from the bottom up.
what: Move footer clearance padding to .board so all scroll positions are covered (v1.37.4)
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, css, layout, footer]
---

Moved `padding-bottom: 80px` from `.app-root` (ineffective due to flexbox overflow) to `.board` in `layout.css`. This ensures every departure row and the scroll-more indicator always have 80px of clear space before the page end, preventing any content from sliding under the fixed footer at any scroll position or departure count. Also reverted the previous `.app-root` padding-bottom. Bumped to v1.37.4.
