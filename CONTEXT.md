Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.16.

Current Goal: Stable mobile PWA experience across Chrome and Firefox.

Last 3 Changes:
- Chrome light mode address bar fix (v1.37.16): Replaced single hardcoded theme-color meta with two media-query-scoped tags in index.html; updateThemeColorMeta in theme-toggle.js now collapses/expands tags based on auto vs manual theme
- Chrome address bar bg flash fix (v1.37.15): Added --bg-solid token to tokens.css; split background shorthand into background-color+background-image in base.css and options-panel.css; aligned manifest.webmanifest background_color to #0b0f1a
- Mobile canvas bottom-space fix + i18n scroll label update (v1.37.14): Replaced min-height:100vh with flex:1 on .board (layout.css); updated scrollForMore key across all 12 languages

Next Steps:
- Update src/sitemap.xml <lastmod> on release
- Run npm run format to apply Prettier to all 75 source files

Next Steps:
- Update src/sitemap.xml <lastmod> on release
- Run npm run format to apply Prettier to all 75 source files
