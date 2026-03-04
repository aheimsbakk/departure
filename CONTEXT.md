Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.35.3.

Current Goal: GPS nearby-stop search — compass button (top-left) fetches closest stops via Entur Geocoder reverse API.

Last 3 Changes:
- GPS search (v1.35.3-dev): compass 🧭 button (top-left .gps-bar); fetchNearbyStops in entur/gps-search.js; gps-dropdown.js component; gps-bar.js orchestrator; gps-dropdown.css; i18n en+no GPS keys
- Mobile blur fix (v1.35.3): applyChanges() added to blur handlers for inpNum/inpInt in options/index.js; Chrome Android numeric keyboard fires blur not keydown Enter
- Footer link configurable (v1.35.2): footerLink/footerReadme added to UI_EMOJIS in config.js; GITHUB_URL updated with #kollektivsanntidorg anchor; footer-link.test.mjs added (6 assertions)

Next Steps:
- Wrap up and bump version (minor — new feature)
- Update src/sitemap.xml <lastmod> on every future release
