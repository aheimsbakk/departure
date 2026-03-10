Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.18.

Current Goal: Stable mobile PWA experience across Chrome and Firefox.

Last 3 Changes:
- Chrome bg inline-style fix (v1.37.18): Set document.documentElement.style.backgroundColor directly in inline script (index.html) and applyTheme() (theme-toggle.js) to bypass CSS variable indirection that Chrome's compositor ignores for the address-bar gap
- Chrome theme mismatch fix (v1.37.17): Added blocking inline script in index.html to apply .theme-light and collapse theme-color metas before first CSS paint
- Chrome light mode address bar fix (v1.37.16): Replaced single hardcoded theme-color meta with two media-query-scoped tags; updateThemeColorMeta collapses/expands based on auto vs manual theme

Next Steps:
- Update src/sitemap.xml <lastmod> on release
- Run npm run format to apply Prettier to all 75 source files

Next Steps:
- Update src/sitemap.xml <lastmod> on release
- Run npm run format to apply Prettier to all 75 source files

Next Steps:
- Update src/sitemap.xml <lastmod> on release
- Run npm run format to apply Prettier to all 75 source files
