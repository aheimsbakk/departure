Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.38.0.

Current Goal: Stable mobile PWA experience across Chrome and Firefox.

Last 3 Changes:

- Configurable scroll-more symbols (v1.38.0): Added SYMBOL_ARROW/SYMBOL_MAX to SCROLL_MORE in config.js; reduced PULL_THRESHOLD to 200px; scroll-more.js reads config instead of hardcoding; README documents scroll-more feature
- Version footer sync + blueprint fix (v1.37.35): Bumped patch to ensure app footer reflects latest version; updated BLUEPRINT.md scroll-more description to match current no-drag/snap-back implementation
- Remove label triggered style (v1.37.34): Dropped .scroll-more-indicator--triggered label rule; only the arrow gets accent color + fast bounce on threshold — no double cue

Next Steps:

- Update src/sitemap.xml <lastmod> on release
- Run npm run format to apply Prettier to all 75 source files
