Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.2.

Current Goal: Mobile UX polish on pull-to-load-more scroll feature.

Last 3 Changes:
- Scroll-more UX polish (v1.37.2): removed bounce-back animation (snap back instantly); overscroll-behavior:none on html/body fixes footer flicker on background drag; ▼ and ● indicator glyphs unified to same font-size
- Scroll-more UX fixes (v1.37.1): load-more fires during pull (not on release); ⯆ replaced with ▼ for mobile font compat; bounce animation uses transform (not margin-top) so siblings don't shift; footer moved out of .board to body to protect it from drag displacement
- Scroll-more feature (v1.37.0): pull-up gesture loads more departures (1→2→3→5→8→13→21 max); new scroll-more.js, scroll-more.css; fetch-loop.js supports numDeparturesOverride; handlers.js resets on station change; i18n keys added to all 12 languages

Next Steps:
- Update src/sitemap.xml <lastmod> on release
