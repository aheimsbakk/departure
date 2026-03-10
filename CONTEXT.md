Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.15.

Current Goal: Stable mobile PWA experience across Chrome and Firefox.

Last 3 Changes:
- Chrome address bar bg flash fix (v1.37.15): Added --bg-solid token to tokens.css; split background shorthand into background-color+background-image in base.css and options-panel.css; aligned manifest.webmanifest background_color to #0b0f1a
- Mobile canvas bottom-space fix + i18n scroll label update (v1.37.14): Replaced min-height:100vh with flex:1 on .board (layout.css); updated scrollForMore key across all 12 languages
- Firefox bounce-cancel guard (v1.37.13): Added bounceCancelled flag to rAF loop in scroll-more.js to prevent stale frames on Firefox mobile

Next Steps:
- Update src/sitemap.xml <lastmod> on release
- Run npm run format to apply Prettier to all 75 source files
