Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.33.3.

Current Goal: Maintain and extend the production app; all known memory leaks resolved.

Last 3 Changes:
- Memory leak audit + fixes (v1.33.3): destroy() methods on station-dropdown, theme-toggle, panel-lifecycle, station-autocomplete, transport-modes, options/index; ticker interval stored in app.js; SW update timers cancelled on pagehide
- src/entur/parser.js — pickLocalised() helper; parseEnturResponse(json, lang) picks situation text by UI lang → en → first
- src/entur/departures.js — fetchDepartures accepts lang option, forwards to parser

Next Steps:
- Monitor deploy workflows after fixes go live
- Await user feedback or new feature requests
