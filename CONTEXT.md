Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.2.

Current Goal: Stable — no active feature work.

Last 3 Changes:
- Scroll-load dot indicator + docs (v1.37.2): ⌄ box replaced with ● dot at max 21; updateIndicator swaps textContent; box CSS removed; README "Loading More Departures" section added
- Scroll-load polish (v1.37.1): temp count preserved across timer refreshes; resistance 500px wheel/160px touch; 800ms API cooldown; ⌄ arrow boxed at max, blink removed, label hidden; "for more change in ⚙️" hint in all 12 languages; stale CSS state fixed on station change
- Scroll-load departures (v1.37.0): Fibonacci overscroll expansion (1→2→3→5→8→13→21 max); ⌄ indicator with bounce animation; resistance (200px wheel / 80px touch); resets on station change, settings apply, or reload; new scroll-loader.js + scroll-loader.css; doRefresh accepts optional numDepartures override

Next Steps:
- Update src/sitemap.xml <lastmod> on every future release
