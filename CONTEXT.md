Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.13.

Current Goal: Stable scroll-more feature with full-canvas touch surface.

Last 3 Changes:
- Firefox bounce-cancel guard (v1.37.13): Added bounceCancelled flag to rAF loop in scroll-more.js — stale frames dispatched after cancelAnimationFrame() on Firefox mobile now bail out immediately, preventing visual jump on touch-interrupt
- Bounce interrupt fix (v1.37.12): Touch during bounce-back now cancels animation and passes the gesture to the browser as native scroll, via new `interruptedBounce` flag in scroll-more.js
- Bounce-back fix (v1.37.11): 3 bugs fixed — stale marginTop on interrupted bounce, inline style residue after animation, displacement desync when DOM changes mid-gesture

Next Steps:
- Update src/sitemap.xml <lastmod> on release
- Run npm run format to apply Prettier to all 75 source files
