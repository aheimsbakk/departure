Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.35.0.

Current Goal: Favorite heart button UX polish — gray/red states, cleaned up theme-detection code.

Last 3 Changes:
- Favorite heart refactor (v1.35.0): gray 🩶 = not saved, red ❤️ = saved (all themes); removed heartSavedLight/heartSavedDark + isLight branch + getTheme imports from 3 files; matched favorites dropdown font-size to autocomplete (removed explicit 0.9em); updated README.md
- Sitemap (v1.34.10): added src/sitemap.xml (single URL, lastmod only); docs/PROJECT_RULES.md rule requires lastmod update on every src/ release
- PWA wake-up fix (v1.34.9): fetch-loop.js tracks lastFetchAt; visibilitychange triggers doRefresh() if stale; app.js pageshow guard for BFCache cold-start

Next Steps:
- Update src/sitemap.xml <lastmod> on every future release
- Await user feedback or new feature requests
