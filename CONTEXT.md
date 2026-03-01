Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.34.0.

Current Goal: Maintain and extend the production app; remove-from-favorites feature shipped.

Last 3 Changes:
- Remove-from-favorites (v1.34.0): removeFromFavorites() in station-dropdown.js; heart button now enabled when in favorites with "Remove from favorites" tooltip; handleFavoriteToggle() toggles add/remove; new i18n keys in all 12 languages; 10 new tests
- Memory leak audit + fixes (v1.33.3): destroy() methods on station-dropdown, theme-toggle, panel-lifecycle, station-autocomplete, transport-modes, options/index; ticker interval stored in app.js; SW update timers cancelled on pagehide
- src/entur/parser.js — pickLocalised() helper; parseEnturResponse(json, lang) picks situation text by UI lang → en → first

Next Steps:
- Monitor deploy after remove-favorites ships
- Await user feedback or new feature requests
