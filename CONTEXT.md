Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.24.

Current Goal: Stable mobile PWA experience across Chrome and Firefox.

Last 3 Changes:

- Scroll bounce fix (v1.37.24): Modified snapBack() in scroll-more.js to read actual board position (marginTop) at call time instead of using stale currentDeltaY — fixes bounce-back not animating after data loads when user releases finger
- Departure user-select none (v1.37.23): Added user-select/webkit-user-select none to .departure in departures.css — prevents browser text-selection gesture from claiming touches on departure text before pull-to-load-more JS handler can take ownership
- Bounce-back deferred snapBack fix (v1.37.22): Added snapBackPending flag in scroll-more.js; onPointerEnd defers snapBack() when fetch is in-flight; triggerLoadMore() finally block fires it after DOM is stable — fixes rAF stall on mobile that left board stuck after pull-to-load-more

Next Steps:

- Update src/sitemap.xml <lastmod> on release
- Run npm run format to apply Prettier to all 75 source files
