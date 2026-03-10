Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.2.

Current Goal: Mobile UX polish on pull-to-load-more scroll feature.

Last 3 Changes:
- Restore pull-to-refresh (v1.37.2): overscroll-behavior:none → overscroll-behavior-y:none on body; keeps Chrome/Android pull-to-refresh working while still blocking elastic bounce that hid fixed footer
- Scroll-more UX polish (v1.37.2): removed bounce-back animation (snap back instantly); overscroll-behavior fixes footer flicker on background drag; ▼ and ● indicator glyphs unified to same font-size
- Scroll-more UX fixes (v1.37.1): load-more fires during pull (not on release); ⯆ replaced with ▼ for mobile font compat; bounce animation uses transform (not margin-top) so siblings don't shift; footer moved out of .board to body

Next Steps:
- Update src/sitemap.xml <lastmod> on release
