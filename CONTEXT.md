Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.11.

Current Goal: Stable scroll-more feature with full-canvas touch surface.

Last 3 Changes:
- Bounce-back fix (v1.37.11): 3 bugs fixed — stale marginTop on interrupted bounce, inline style residue after animation, displacement desync when DOM changes mid-gesture
- Full-canvas touch fix (v1.37.10): .board min-height:100vh + justify-content:center; .app-root align-items:stretch — drag now fires on entire viewport, content stays centred
- Scroll-more bug fixes (v1.37.9): 5 issues fixed — bounce jitter, tempCount state desync, stale rAF in reset(), double-init guard, wheel deltaY clamping; Prettier added as dev dependency

Next Steps:
- Update src/sitemap.xml <lastmod> on release
- Run npm run format to apply Prettier to all 75 source files
