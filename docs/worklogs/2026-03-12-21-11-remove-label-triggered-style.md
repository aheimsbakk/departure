---
when: 2026-03-12T21:11:40Z
why: The label accent color was a redundant double cue alongside the arrow hint.
what: Remove .scroll-more-indicator--triggered label style rule from scroll-more.css
model: opencode/claude-sonnet-4-6
tags: [refactor, scroll-more, css, mobile]
---

Removed `.scroll-more-indicator--triggered .scroll-more-label` rule from `src/css/scroll-more.css` — only the arrow receives the accent color and fast-bounce cue on threshold. No JS changes required. Bumped to v1.37.34.
