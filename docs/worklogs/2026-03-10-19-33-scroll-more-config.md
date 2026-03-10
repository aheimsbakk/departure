---
when: 2026-03-10T19:33:39Z
why: Scroll-more tunables were magic numbers scattered in scroll-more.js; removing excess bottom padding that confused users.
what: Move all scroll-more constants to SCROLL_MORE in config.js; remove bottom padding from body and .board (v1.37.7)
model: github-copilot/claude-sonnet-4.6
tags: [refactor, config, scroll-more, css]
---

Added `SCROLL_MORE` export to `config.js` containing all pull-to-load-more tunables: `SCROLL_STEPS`, `PULL_THRESHOLD` (160px), `RESISTANCE` (0.4), `WHEEL_THRESHOLD` (500), `WHEEL_RESET_MS` (800), `MAX_HINT_DURATION` (4000). Updated `scroll-more.js` to import and reference `SCROLL_MORE` — no magic numbers remain in that file. Removed `padding-bottom: 80px` from both `body` (base.css) and `.board` (layout.css) to eliminate the confusing empty space below content. Bumped to v1.37.7.
