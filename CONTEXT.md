Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.32.

Current Goal: Stable mobile PWA experience across Chrome and Firefox.

Last 3 Changes:

- Remove snap-back (v1.37.31): Stripped all drag displacement, snapBack, board--pulling/snapping, ghost-click guard from scroll-more.js and scroll-more.css; load fires on finger lift at threshold, no visual drag feedback
- Ghost-click snap-interrupt fix (v1.37.30): iOS/Android synthetic mousedown ~300ms after touchend was hitting the snap-interrupt path and cancelling the CSS transition mid-flight
- snapBack reflow fix (v1.37.29): Added offsetHeight reflow between .board--snapping class add and applyDisplacement() so CSS transition fires reliably on finger lift

Next Steps:

- Update src/sitemap.xml <lastmod> on release
- Run npm run format to apply Prettier to all 75 source files
