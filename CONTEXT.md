Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.9.

Current Goal: Stable scroll-more feature with clean tooling.

Last 3 Changes:
- Scroll-more bug fixes (v1.37.9): 5 issues fixed — bounce jitter, tempCount state desync, stale rAF in reset(), double-init guard, wheel deltaY clamping; Prettier added as dev dependency
- Bounce-back animation (v1.37.8): finger release triggers ease-out-cubic rAF animation (BOUNCE_DURATION_MS=600ms); tuneable via SCROLL_MORE in config.js
- Scroll-more config (v1.37.7): all tunables moved to SCROLL_MORE in config.js; removed padding-bottom from body and .board

Next Steps:
- Update src/sitemap.xml <lastmod> on release
- Run npm run format to apply Prettier to all 75 source files
