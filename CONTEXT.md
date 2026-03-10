Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.36.13.

Current Goal: Scroll-more feature — pull-to-load-more departures with Fibonacci progression.

Last 3 Changes:
- Scroll-more feature (v1.36.13-dev): pull-up gesture loads more departures (1→2→3→5→8→13→21 max); new scroll-more.js, scroll-more.css; fetch-loop.js supports numDeparturesOverride; handlers.js resets on station change; i18n keys added to all 12 languages
- Security fixes (v1.36.13): XSS fix in departure.js (innerHTML→DOM); deprecated escape/unescape replaced with TextEncoder/TextDecoder in share-button.js; console.error→console.warn
- GPS mode reset (v1.36.12): selecting a stop from GPS dropdown always resets transport modes to ALL_TRANSPORT_MODES; stop modes remain display-only in the list

Next Steps:
- Version bump and worklog on user wrap-up
- Update src/sitemap.xml <lastmod> on release
