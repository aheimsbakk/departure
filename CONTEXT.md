Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.1.

Current Goal: Mobile UX polish on pull-to-load-more scroll feature.

Last 3 Changes:
- Scroll-more UX fixes (v1.37.1): load-more fires during pull (not on release); ⯆ replaced with ▼ for mobile font compat; bounce animation uses transform (not margin-top) so siblings don't shift; footer moved out of .board to body to protect it from drag displacement
- Scroll-more feature (v1.37.0): pull-up gesture loads more departures (1→2→3→5→8→13→21 max); new scroll-more.js, scroll-more.css; fetch-loop.js supports numDeparturesOverride; handlers.js resets on station change; i18n keys added to all 12 languages
- Security fixes (v1.36.13): XSS fix in departure.js (innerHTML→DOM); deprecated escape/unescape replaced with TextEncoder/TextDecoder in share-button.js

Next Steps:
- Version bump and worklog on user wrap-up
- Update src/sitemap.xml <lastmod> on release
