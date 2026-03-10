Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.5.

Current Goal: Mobile UX polish on pull-to-load-more scroll feature.

Last 3 Changes:
- Firefox footer fix (v1.37.5): padding-bottom:80px on body (not just .board) for Firefox scroll boundary; isolation:isolate + -webkit-backdrop-filter on .app-footer for correct Firefox stacking
- Board footer clearance (v1.37.4): padding-bottom:80px on .board so all scroll positions and departure counts clear the fixed footer (Chrome fix)
- Restore pull-to-refresh (v1.37.2): overscroll-behavior:none → overscroll-behavior-y:none on body; keeps Chrome/Android pull-to-refresh working

Next Steps:
- Update src/sitemap.xml <lastmod> on release
