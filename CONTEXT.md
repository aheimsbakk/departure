Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.36.1.

Current Goal: GPS nearby-stop feature complete — full i18n for all 12 languages.

Last 3 Changes:
- GPS i18n complete (v1.36.1): GPS keys (gpsTooltip…gpsMeters) added to all 12 locales in translations.js; gps-dropdown.js now uses t('gpsMeters') instead of hardcoded 'm'
- GPS feature shipped (v1.36.0): compass 🧭 button, fetchNearbyStops, GPS dropdown, CATEGORY_TO_MODE, GPS_STOP_LINE_TEMPLATE/GPS_MAX_RESULTS/GPS_SEARCH_RADIUS_KM in config.js
- Mobile blur fix (v1.35.3): applyChanges() added to blur handlers for inpNum/inpInt in options/index.js

Next Steps:
- Update src/sitemap.xml <lastmod> on every future release
