Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.26.

Current Goal: Stable mobile PWA experience across Chrome and Firefox.

Last 3 Changes:

- Scroll snapBack logic fix (v1.37.26): Fixed snapBack() target calculation (Math.max→Math.min) so bounce-back animates correctly when content overflows; fixed onPointerDown reading actual marginTop instead of zeroing currentDeltaY
- Scroll bounce fix (v1.37.24): Modified snapBack() in scroll-more.js to read actual board position (marginTop) at call time instead of using stale currentDeltaY
- Departure user-select none (v1.37.23): Added user-select/webkit-user-select none to .departure in departures.css

Next Steps:

- Update src/sitemap.xml <lastmod> on release
- Run npm run format to apply Prettier to all 75 source files
