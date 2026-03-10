---
when: 2026-03-10T22:10:49Z
why: Firefox mobile scroll was choppy due to the browser waiting per-frame for touchmove to resolve preventDefault; touch-action none must be scoped to the active pull gesture only to avoid breaking Chrome
what: Toggle touch-action none on .board--pulling only during an active upward pull gesture
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, mobile, firefox, scroll, css, touch]
---

Added `.board--pulling { touch-action: none }` to `src/css/scroll-more.css` and toggled the class in `src/app/scroll-more.js` exclusively when an upward pull is confirmed — applied in `onPointerMove` on first upward delta, removed in `onPointerEnd`, `reset()`, `destroy()`, and the bounce-interrupt branch of `onPointerDown`. This gives Firefox unambiguous touch ownership during the gesture without disabling native scroll for any other interaction. Bumped to v1.37.19.
