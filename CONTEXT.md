Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.14.

Current Goal: Stable scroll-more feature with correct mobile layout.

Last 3 Changes:
- Mobile canvas bottom-space fix + i18n scroll label update (v1.37.14): Replaced min-height:100vh with flex:1 on .board (layout.css) to eliminate excess whitespace at bottom on mobile after scroll-more loads extra departures; updated scrollForMore key to "scroll for temporary more" across all 12 languages (translations.js)
- Firefox bounce-cancel guard (v1.37.13): Added bounceCancelled flag to rAF loop in scroll-more.js — stale frames dispatched after cancelAnimationFrame() on Firefox mobile now bail out immediately, preventing visual jump on touch-interrupt
- Bounce interrupt fix (v1.37.12): Touch during bounce-back now cancels animation and passes the gesture to the browser as native scroll, via new `interruptedBounce` flag in scroll-more.js

Next Steps:
- Update src/sitemap.xml <lastmod> on release
- Run npm run format to apply Prettier to all 75 source files
