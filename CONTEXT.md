Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.23.

Current Goal: Stable mobile PWA experience across Chrome and Firefox.

Last 3 Changes:
- Departure user-select none (v1.37.23): Added user-select/webkit-user-select none to .departure in departures.css — prevents browser text-selection gesture from claiming touches on departure text before pull-to-load-more JS handler can take ownership
- Bounce-back deferred snapBack fix (v1.37.22): Added snapBackPending flag in scroll-more.js; onPointerEnd defers snapBack() when fetch is in-flight; triggerLoadMore() finally block fires it after DOM is stable — fixes rAF stall on mobile that left board stuck after pull-to-load-more
- Scroll debounce (v1.37.21): Added configurable DEBOUNCE_MS (600ms) to SCROLL_MORE in config.js; leading-edge guard in triggerLoadMore() prevents double-fires from rapid wheel/gesture re-entry; reset() clears the timestamp on station change

Next Steps:
- Update src/sitemap.xml <lastmod> on release
- Run npm run format to apply Prettier to all 75 source files
