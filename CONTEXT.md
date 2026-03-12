Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.35.

Current Goal: Stable mobile PWA experience across Chrome and Firefox.

Last 3 Changes:

- Version footer sync + blueprint fix (v1.37.35): Bumped patch to ensure app footer reflects latest version; updated BLUEPRINT.md scroll-more description to match current no-drag/snap-back implementation
- Remove label triggered style (v1.37.34): Dropped .scroll-more-indicator--triggered label rule; only the arrow gets accent color + fast bounce on threshold — no double cue
- Scroll threshold visual hint (v1.37.33): Added .scroll-more-indicator--triggered CSS class; arrow turns accent color with fast bounce when drag threshold is crossed; removed on finger lift before load fires

Next Steps:

- Update src/sitemap.xml <lastmod> on release
- Run npm run format to apply Prettier to all 75 source files
