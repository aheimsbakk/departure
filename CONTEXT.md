Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.28.

Current Goal: Stable mobile PWA experience across Chrome and Firefox.

Last 3 Changes:

- CSS transition snap-back (v1.37.28): Replaced rAF bounce-back loop with CSS transition on margin-top (.board--snapping); compositor-driven, immune to JS-thread stalls on mobile; triggerLoadMore fires from transitionend callback
- Mobile scroll load-after-bounce (v1.37.27): Touch path snaps back immediately on touchend, then loads after BOUNCE_DURATION_MS; removed snapBackPending
- Scroll snapBack logic fix (v1.37.26): Fixed snapBack() target calculation and onPointerDown reading actual marginTop

Next Steps:

- Update src/sitemap.xml <lastmod> on release
- Run npm run format to apply Prettier to all 75 source files
