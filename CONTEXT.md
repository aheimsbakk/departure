Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.27.

Current Goal: Stable mobile PWA experience across Chrome and Firefox.

Last 3 Changes:

- Mobile scroll load-after-bounce (v1.37.27): Touch path now snaps back immediately on touchend, then calls triggerLoadMore() after BOUNCE_DURATION_MS; removes unreliable snapBackPending pattern
- Scroll snapBack logic fix (v1.37.26): Fixed snapBack() target calculation (Math.max→Math.min) so bounce-back animates correctly when content overflows; fixed onPointerDown reading actual marginTop instead of zeroing currentDeltaY
- Scroll bounce fix (v1.37.24): Modified snapBack() in scroll-more.js to read actual board position (marginTop) at call time instead of using stale currentDeltaY

Next Steps:

- Update src/sitemap.xml <lastmod> on release
- Run npm run format to apply Prettier to all 75 source files
