Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.4.

Current Goal: Stable — no active feature work.

Last 3 Changes:
- Font + scroll indicator fix (v1.37.4): clamp font-sizes → 12px in footer/header/scroll-loader; scroll indicator arrow/dot replaced with CSS ::after shapes (no glyphs); both set to opacity 0.5
- Scroll lift + font fix (v1.37.3): rubber-band board lift + spring snap-back on overscroll; footer detached from .board (fixes position:fixed under transform); status-chip, scroll-indicator-label, app-footer all use clamp(11px, calc(--large-scale*0.13), 13px)
- Scroll-load dot indicator + docs (v1.37.2): ⌄ box replaced with ● dot at max 21; updateIndicator swaps textContent; box CSS removed; README "Loading More Departures" section added

Next Steps:
- Update src/sitemap.xml <lastmod> on every future release
