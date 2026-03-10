Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.4.

Current Goal: Mobile UX polish on pull-to-load-more scroll feature.

Last 3 Changes:
- Board footer clearance (v1.37.4): padding-bottom:80px moved to .board (not .app-root) so all scroll positions and departure counts clear the fixed footer
- Footer overlap fix (v1.37.3): padding-bottom:80px on .app-root (superseded — was ineffective due to flexbox overflow)
- Restore pull-to-refresh (v1.37.2): overscroll-behavior:none → overscroll-behavior-y:none on body; keeps Chrome/Android pull-to-refresh working while still blocking elastic bounce

Next Steps:
- Update src/sitemap.xml <lastmod> on release
