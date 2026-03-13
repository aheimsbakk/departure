---
when: 2026-03-13T21:49:59Z
why: footer.js was missing from the service worker ASSETS cache list after being extracted from ui.js
what: Add ./ui/footer.js to sw.js ASSETS array
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, sw, pwa, footer]
---

Added `./ui/footer.js` to the `ASSETS` array in `src/sw.js` so the new footer module is cached by the PWA service worker and available offline. Bumped to v1.38.6.
