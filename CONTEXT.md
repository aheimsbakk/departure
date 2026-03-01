Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.34.1.

Current Goal: Maintain and extend the production app; SEO meta tags and icon refresh shipped.

Last 3 Changes:
- SEO + icons (v1.34.1): Added description/keywords/author/canonical/rel=me meta tags to index.html; updated all 3 SVG icons from "S" to bold underlined "KS"
- Docs update (v1.34.0): README.md intro now lists all 6 transport modes; heart-button section rewritten to describe add/remove toggle; BLUEPRINT.md favorites bullet updated + stale version reference fixed
- Remove-from-favorites (v1.34.0): removeFromFavorites() in station-dropdown.js; heart button now enabled when in favorites with "Remove from favorites" tooltip; handleFavoriteToggle() toggles add/remove; new i18n keys in all 12 languages; 10 new tests

Next Steps:
- Monitor deploy after SEO/icon refresh ships
- Await user feedback or new feature requests
