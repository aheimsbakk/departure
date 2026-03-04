Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.36.8.

Current Goal: Stable — no active feature work.

Last 3 Changes:
- Memory leak fixes (v1.36.8): visibilitychange handlers no longer accumulate in fetch-loop.js; AbortController cancels stale geocoder fetches; _destroyed guards after await in station-autocomplete; sw-updater toast uses textContent not innerHTML; Enter guard uses public isOpen()
- GPS tooltip i18n + dropdown height (v1.36.7): `updateTooltip()` on GPS container wired via `gpsRef` into `updateButtonTooltips`; GPS and favorites `max-height` raised to 420px
- Autocomplete bare name fix (v1.36.6): geocoder.js exposes `name` (p.name) alongside `title` (p.label); selectCandidateIndex uses `c.name` so input/favorites store bare stop name

Next Steps:
- Update src/sitemap.xml <lastmod> on every future release
