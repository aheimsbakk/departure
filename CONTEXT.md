Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.6.

Current Goal: Mobile UX polish on pull-to-load-more scroll feature.

Last 3 Changes:
- Firefox body min-height fix (v1.37.6): body min-height:100% → 100vh so padding-bottom:80px actually extends below content on Firefox (100% collapses to viewport height, making padding-bottom ineffective)
- Firefox footer fix (v1.37.5): padding-bottom:80px on body; isolation:isolate + -webkit-backdrop-filter on .app-footer for Firefox stacking
- Board footer clearance (v1.37.4): padding-bottom:80px on .board so all scroll positions and departure counts clear the fixed footer

Next Steps:
- Update src/sitemap.xml <lastmod> on release
