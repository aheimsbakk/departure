Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.34.4.

Current Goal: Maintain and extend the production app; SW cache race condition fixed.

Last 3 Changes:
- SW race condition fix (v1.34.4): Replaced SW_ACTIVATED postMessage with controllerchange event in sw-updater.js; removed broadcast from sw.js activate handler — guarantees old caches deleted before reload
- Dynamic theme-color meta (v1.34.2): updateThemeColorMeta() in theme-toggle.js syncs <meta name="theme-color"> on every applyTheme() call — covers first load, manual toggle, and OS preference change
- SEO + icons (v1.34.1): Added description/keywords/author/canonical/rel=me meta tags to index.html; updated all 3 SVG icons from "S" to bold underlined "KS"

Next Steps:
- Monitor deploy to confirm cache clears reliably on update
- Await user feedback or new feature requests

