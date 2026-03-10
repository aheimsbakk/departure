Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.21.

Current Goal: Stable mobile PWA experience across Chrome and Firefox.

Last 3 Changes:
- Scroll debounce (v1.37.21): Added configurable DEBOUNCE_MS (600ms) to SCROLL_MORE in config.js; leading-edge guard in triggerLoadMore() prevents double-fires from rapid wheel/gesture re-entry; reset() clears the timestamp on station change
- Firefox mobile scroll fix (v1.37.19): Toggle touch-action none via .board--pulling class only during active upward pull gesture — eliminates Firefox jank without affecting Chrome native scroll
- Chrome bg inline-style fix (v1.37.18): Set document.documentElement.style.backgroundColor directly in inline script (index.html) and applyTheme() (theme-toggle.js) to bypass CSS variable indirection that Chrome's compositor ignores for the address-bar gap

Next Steps:
- Update src/sitemap.xml <lastmod> on release
- Run npm run format to apply Prettier to all 75 source files
