Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.3.

Current Goal: Stable — no active feature work.

Last 3 Changes:
- Scroll lift + font fix (v1.37.3): rubber-band board lift + spring snap-back on overscroll; footer detached from .board (fixes position:fixed under transform); status-chip, scroll-indicator-label, app-footer all use clamp(11px, calc(--large-scale*0.13), 13px)
- Scroll-load dot indicator + docs (v1.37.2): ⌄ box replaced with ● dot at max 21; updateIndicator swaps textContent; box CSS removed; README "Loading More Departures" section added
- Scroll-load polish (v1.37.1): temp count preserved across timer refreshes; resistance 500px wheel/160px touch; 800ms API cooldown; ⌄ arrow boxed at max, blink removed, label hidden; "for more change in ⚙️" hint in all 12 languages; stale CSS state fixed on station change

Next Steps:
- Update src/sitemap.xml <lastmod> on every future release
