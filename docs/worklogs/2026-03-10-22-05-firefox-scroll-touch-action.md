---
when: 2026-03-10T22:05:32Z
why: Firefox mobile scroll was choppy because the browser stalled waiting for touchmove handlers to resolve preventDefault before advancing its scroll pipeline
what: Add touch-action pan-x to .board to eliminate Firefox mobile scroll jank
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, mobile, firefox, scroll, css]
---

Added `touch-action: pan-x` to `.board` in `src/css/scroll-more.css`. This tells Firefox (and all browsers) up-front that vertical touch gestures are owned by JS, removing the per-frame preventDefault handshake delay that caused jank. Chrome was unaffected because it predicts this heuristically; Firefox does not. Bumped to v1.37.19.
