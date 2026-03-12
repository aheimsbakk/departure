Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.30.

Current Goal: Stable mobile PWA experience across Chrome and Firefox.

Last 3 Changes:

- Ghost-click snap-interrupt fix (v1.37.30): iOS/Android synthetic mousedown ~300ms after touchend was hitting the snap-interrupt path and cancelling the CSS transition mid-flight; suppressed via lastTouchEndAt + 600ms guard in onPointerDown
- snapBack reflow fix (v1.37.29): Added offsetHeight reflow between .board--snapping class add and applyDisplacement() so CSS transition fires reliably on finger lift
- CSS transition snap-back (v1.37.28): Replaced rAF bounce-back loop with CSS transition on margin-top (.board--snapping); compositor-driven, immune to JS-thread stalls on mobile

Next Steps:

- Update src/sitemap.xml <lastmod> on release
- Run npm run format to apply Prettier to all 75 source files
