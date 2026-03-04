Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.35.3.

Current Goal: Bug fix — number inputs in options panel now apply on blur (mobile Chrome fix).

Last 3 Changes:
- Mobile blur fix (v1.35.3): applyChanges() added to blur handlers for inpNum/inpInt in options/index.js; Chrome Android numeric keyboard fires blur not keydown Enter
- Footer link configurable (v1.35.2): footerLink/footerReadme added to UI_EMOJIS in config.js; GITHUB_URL updated with #kollektivsanntidorg anchor; footer-link.test.mjs added (6 assertions)
- Favorite heart refactor (v1.35.0): gray 🩶 = not saved, red ❤️ = saved (all themes); removed heartSavedLight/heartSavedDark + isLight branch + getTheme imports from 3 files

Next Steps:
- Update src/sitemap.xml <lastmod> on every future release
- Await mobile test confirmation
