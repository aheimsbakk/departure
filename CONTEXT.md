Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.34.0.

Current Goal: Maintain and extend the production app; remove-from-favorites feature shipped.

Last 3 Changes:
- Docs update (v1.34.0): README.md intro now lists all 6 transport modes; heart-button section rewritten to describe add/remove toggle; BLUEPRINT.md favorites bullet updated + stale version reference fixed
- Remove-from-favorites (v1.34.0): removeFromFavorites() in station-dropdown.js; heart button now enabled when in favorites with "Remove from favorites" tooltip; handleFavoriteToggle() toggles add/remove; new i18n keys in all 12 languages; 10 new tests
- Memory leak audit + fixes (v1.33.3): destroy() methods on station-dropdown, theme-toggle, panel-lifecycle, station-autocomplete, transport-modes, options/index; ticker interval stored in app.js; SW update timers cancelled on pagehide

Next Steps:
- Monitor deploy after remove-favorites ships
- Await user feedback or new feature requests
