Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.36.13.

Current Goal: Stable — no active feature work.

Last 3 Changes:
- Security fixes (v1.36.13): XSS fix in departure.js (innerHTML→DOM); deprecated escape/unescape replaced with TextEncoder/TextDecoder in share-button.js; console.error→console.warn
- GPS mode reset (v1.36.12): selecting a stop from GPS dropdown always resets transport modes to ALL_TRANSPORT_MODES; stop modes remain display-only in the list
- Move MODE_GRID to config.js (v1.36.11): exported from config.js, import updated in transport-modes.js; GPS stop selection no longer overrides transport modes

Next Steps:
- Update src/sitemap.xml <lastmod> on every future release
