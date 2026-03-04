Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.36.6.

Current Goal: Stable — no active feature work.

Last 3 Changes:
- Autocomplete bare name fix (v1.36.6): geocoder.js exposes `name` (p.name) alongside `title` (p.label); selectCandidateIndex in station-autocomplete.js uses `c.name` so input/favorites store bare stop name, not locality-qualified label
- GPS/favorites count reduction (v1.36.4–v1.36.5): GPS and favorites dropdowns reduced to 8 items
- GPS no-auto-favorite fix (v1.36.3): GPS-selected stops no longer auto-added to favorites

Next Steps:
- Update src/sitemap.xml <lastmod> on every future release
