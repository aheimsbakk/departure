Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.19.

Current Goal: Stable mobile PWA experience across Chrome and Firefox.

Last 3 Changes:
- Firefox mobile scroll fix (v1.37.19): Toggle touch-action none via .board--pulling class only during active upward pull gesture — eliminates Firefox jank without affecting Chrome native scroll
- Chrome bg inline-style fix (v1.37.18): Set document.documentElement.style.backgroundColor directly in inline script (index.html) and applyTheme() (theme-toggle.js) to bypass CSS variable indirection that Chrome's compositor ignores for the address-bar gap
- Chrome theme mismatch fix (v1.37.17): Added blocking inline script in index.html to apply .theme-light and collapse theme-color metas before first CSS paint

Next Steps:
- Update src/sitemap.xml <lastmod> on release
- Run npm run format to apply Prettier to all 75 source files
