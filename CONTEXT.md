Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.31.

Current Goal: Stable mobile PWA experience across Chrome and Firefox.

Last 3 Changes:

- Reflow placement + canvas size fix (v1.37.31): Moved offsetHeight reflow to onPointerEnd (between board--pulling removal and snapBack) so transition:none is flushed first; fixed isNearBottom() to use listEl.scrollHeight instead of stretched flex boardEl height
- Ghost-click snap-interrupt fix (v1.37.30): iOS/Android synthetic mousedown ~300ms after touchend suppressed via lastTouchEndAt + 600ms guard in onPointerDown
- snapBack reflow fix (v1.37.29): Added offsetHeight reflow so CSS transition fires reliably on finger lift

Next Steps:

- Update src/sitemap.xml <lastmod> on release
- Run npm run format to apply Prettier to all 75 source files
