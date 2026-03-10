Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.17.

Current Goal: Stable mobile PWA experience across Chrome and Firefox.

Last 3 Changes:
- Chrome theme mismatch fix (v1.37.17): Added blocking inline script in index.html to apply .theme-light and collapse theme-color metas before first CSS paint, fixing address bar color when app theme differs from OS scheme
- Chrome light mode address bar fix (v1.37.16): Replaced single hardcoded theme-color meta with two media-query-scoped tags in index.html; updateThemeColorMeta collapses/expands tags based on auto vs manual theme
- Chrome address bar bg flash fix (v1.37.15): Added --bg-solid token to tokens.css; split background shorthand into background-color+background-image in base.css and options-panel.css

Next Steps:
- Update src/sitemap.xml <lastmod> on release
- Run npm run format to apply Prettier to all 75 source files

Next Steps:
- Update src/sitemap.xml <lastmod> on release
- Run npm run format to apply Prettier to all 75 source files

Next Steps:
- Update src/sitemap.xml <lastmod> on release
- Run npm run format to apply Prettier to all 75 source files
