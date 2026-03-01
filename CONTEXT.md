Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.33.4.

Current Goal: Maintain and extend the production app; all known memory leaks resolved.

Last 3 Changes:
- README docs update (v1.33.4): corrected heart button description (red=save, white/black=remove toggle, never disabled); updated transport mode list in ingress to include all 6 modes (bus, tram, metro, rail, water, coach)
- Remove-from-favorites (v1.33.3): heart button now toggles add/remove; never disabled; `removeFromFavorites()` added to station-dropdown.js; `removeFromFavorites` i18n key added for all 12 languages
- Memory leak audit + fixes (v1.33.3): destroy() methods on station-dropdown, theme-toggle, panel-lifecycle, station-autocomplete, transport-modes, options/index; ticker interval stored in app.js; SW update timers cancelled on pagehide

Next Steps:
- Monitor deploy workflows after fixes go live
- Await user feedback or new feature requests
