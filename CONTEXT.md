Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.35.2.

Current Goal: Footer link polish — configurable emojis, correct GitHub anchor URL, tests.

Last 3 Changes:
- Footer link configurable (v1.35.2): footerLink/footerReadme added to UI_EMOJIS in config.js; GITHUB_URL updated with #kollektivsanntidorg anchor; footer-link.test.mjs added (6 assertions)
- Favorite heart refactor (v1.35.0): gray 🩶 = not saved, red ❤️ = saved (all themes); removed heartSavedLight/heartSavedDark + isLight branch + getTheme imports from 3 files; matched favorites dropdown font-size to autocomplete
- Sitemap (v1.34.10): added src/sitemap.xml (single URL, lastmod only); docs/PROJECT_RULES.md rule requires lastmod update on every src/ release

Next Steps:
- Update src/sitemap.xml <lastmod> on every future release
- Await user feedback or new feature requests
