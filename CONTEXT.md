Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.5.

Current Goal: Stable — no active feature work.

Last 3 Changes:
- Smooth drag animation (v1.37.5): eliminated forced reflow (offsetHeight) in scroll-loader; rAF-batched transform writes; translate3d GPU compositing; will-change lifecycle; overscroll-behavior:none for iOS; spring curve moved to CSS .board:not(.is-lifting)
- Font + scroll indicator fix (v1.37.4): clamp font-sizes → 12px in footer/header/scroll-loader; scroll indicator arrow/dot replaced with CSS ::after shapes (no glyphs); both set to opacity 0.5
- Scroll lift + font fix (v1.37.3): rubber-band board lift + spring snap-back on overscroll; footer detached from .board (fixes position:fixed under transform); status-chip, scroll-indicator-label, app-footer all use clamp(11px, calc(--large-scale*0.13), 13px)

Next Steps:
- Update src/sitemap.xml <lastmod> on every future release
