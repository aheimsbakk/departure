Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.36.10.

Current Goal: Stable — no active feature work.

Last 3 Changes:
- Refactor default station + share link (v1.36.10): `getDefaultStation()` replaces old seeding; `getRecentStations()` is a pure read; share links no longer add to favorites; `applyStation()` helper deduplicates handlers; transport modes grid reordered; "Rail" → "Train" label in EN
- Autocomplete locality opacity (v1.36.9): locality suffix (e.g. ", Oslo") rendered as a separate span at 50% opacity in autocomplete dropdown
- Memory leak fixes (v1.36.8): visibilitychange handlers no longer accumulate; AbortController cancels stale geocoder fetches; various guards

Next Steps:
- Update src/sitemap.xml <lastmod> on every future release
