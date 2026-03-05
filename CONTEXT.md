Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.36.12.

Current Goal: Stable — no active feature work.

Last 3 Changes:
- GPS mode reset (v1.36.12): selecting a stop from GPS dropdown always resets transport modes to ALL_TRANSPORT_MODES; stop modes remain display-only in the list
- Move MODE_GRID to config.js (v1.36.11): exported from config.js, import updated in transport-modes.js; GPS stop selection no longer overrides transport modes
- Refactor default station + share link (v1.36.10): `getDefaultStation()` replaces old seeding; `getRecentStations()` is a pure read; share links no longer add to favorites; `applyStation()` helper deduplicates handlers; transport modes grid reordered; "Rail" → "Train" label in EN

Next Steps:
- Update src/sitemap.xml <lastmod> on every future release
