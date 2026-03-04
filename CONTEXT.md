Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.36.7.

Current Goal: Stable — no active feature work.

Last 3 Changes:
- GPS tooltip i18n + dropdown height (v1.36.7): `updateTooltip()` on GPS container wired via `gpsRef` into `updateButtonTooltips`; GPS and favorites `max-height` raised to 420px
- Autocomplete bare name fix (v1.36.6): geocoder.js exposes `name` (p.name) alongside `title` (p.label); selectCandidateIndex uses `c.name` so input/favorites store bare stop name
- GPS/favorites count reduction (v1.36.4–v1.36.5): GPS and favorites dropdowns reduced to 8 items

Next Steps:
- Update src/sitemap.xml <lastmod> on every future release
