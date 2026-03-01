Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.34.5.

Current Goal: Maintain and extend the production app; SW update reload flow fully fixed.

Last 3 Changes:
- SW reload not firing fix (v1.34.5): controllerchange listener moved before register(); pagehide timer cancellation removed; 2s fallback reload added after skipWaiting fires
- SW race condition fix (v1.34.4): Replaced SW_ACTIVATED postMessage with controllerchange event; removed broadcast from sw.js activate handler
- Dynamic theme-color meta (v1.34.2): updateThemeColorMeta() in theme-toggle.js syncs <meta name="theme-color"> on every applyTheme() call

Next Steps:
- Monitor deploy to confirm full update flow (countdown → reload → fresh cache) works end-to-end
- Await user feedback or new feature requests

