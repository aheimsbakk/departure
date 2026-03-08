Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.36.13.

Current Goal: Stable — no active feature work.

Last 3 Changes:
- Scroll-load departures (v1.36.13): Fibonacci overscroll expansion (1→2→3→5→8→13→21 max); ⌄ indicator with bounce animation; resistance (200px wheel / 80px touch); resets on station change, settings apply, or reload; new scroll-loader.js + scroll-loader.css; doRefresh accepts optional numDepartures override
- Security fixes (v1.36.13): XSS fix in departure.js (innerHTML→DOM); deprecated escape/unescape replaced with TextEncoder/TextDecoder in share-button.js; console.error→console.warn
- GPS mode reset (v1.36.12): selecting a stop from GPS dropdown always resets transport modes to ALL_TRANSPORT_MODES; stop modes remain display-only in the list

Next Steps:
- Update src/sitemap.xml <lastmod> on every future release
