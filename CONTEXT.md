Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.34.6.

Current Goal: Fix URL-import / DEFAULTS conflict and app.js init-order bugs.

Last 3 Changes:
- URL import conflict fix (v1.34.6): decodeSettings() now returns null for absent optional fields; processUrlParams() only overwrites DEFAULTS fields that were actually present in the share link, preventing the 3-element new format from clobbering localStorage-restored textSize/fetchInterval/language/numDepartures
- Init order fix (v1.34.6): processUrlParams() result captured as urlImported; step 4 "apply first favorite" skipped when a URL import already set the station
- Duplicate lookupStopId removed (v1.34.6): app.js step 11 now delegates entirely to doRefresh() which already resolves the stop ID internally; unused lookupStopId import removed; duplicate step-6 comment fixed

Next Steps:
- Monitor deploy to confirm share-link import preserves user's existing text size / interval settings
- Await user feedback or new feature requests

