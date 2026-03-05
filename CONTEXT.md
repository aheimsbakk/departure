Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.36.9.

Current Goal: Stable — no active feature work.

Last 3 Changes:
- Autocomplete locality opacity (v1.36.9): locality suffix (e.g. ", Oslo") rendered as a separate span at 50% opacity in autocomplete dropdown
- Memory leak fixes (v1.36.8): visibilitychange handlers no longer accumulate; AbortController cancels stale geocoder fetches; various guards
- GPS tooltip i18n + dropdown height (v1.36.7): `updateTooltip()` on GPS container wired via `gpsRef` into `updateButtonTooltips`; GPS and favorites `max-height` raised to 420px

Next Steps:
- Update src/sitemap.xml <lastmod> on every future release
