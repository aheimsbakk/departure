Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.3.

Current Goal: Mobile UX polish on pull-to-load-more scroll feature.

Last 3 Changes:
- Footer overlap fix (v1.37.3): padding-bottom:80px on .app-root so board content at 21 departures never slides under the fixed footer
- Restore pull-to-refresh (v1.37.2): overscroll-behavior:none → overscroll-behavior-y:none on body; keeps Chrome/Android pull-to-refresh working while still blocking elastic bounce that hid fixed footer
- Scroll-more UX polish (v1.37.2): removed bounce-back animation (snap back instantly); overscroll-behavior fixes footer flicker on background drag; ▼ and ● indicator glyphs unified to same font-size

Next Steps:
- Update src/sitemap.xml <lastmod> on release
