Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.34.6.

Current Goal: Maintain and extend the production app; SW stale cache root cause fixed.

Last 3 Changes:
- SW stale cache on install fix (v1.34.6): install handler now uses Request({ cache: 'reload' }) so addAll() bypasses the browser HTTP cache and always fetches fresh assets from the server
- SW reload not firing fix (v1.34.5): controllerchange listener moved before register(); pagehide timer cancellation removed; 2s fallback reload added
- SW race condition fix (v1.34.4): Replaced SW_ACTIVATED postMessage with controllerchange event; removed broadcast from sw.js activate handler

Next Steps:
- Monitor deploy to confirm full update flow (countdown → reload → fresh assets) works end-to-end
- Await user feedback or new feature requests

