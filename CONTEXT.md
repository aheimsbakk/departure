Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.37.34.

Current Goal: Stable mobile PWA experience across Chrome and Firefox.

Last 3 Changes:

- Remove label triggered style (v1.37.34): Dropped .scroll-more-indicator--triggered label rule; only the arrow gets accent color + fast bounce on threshold — no double cue
- Scroll threshold visual hint (v1.37.33): Added .scroll-more-indicator--triggered CSS class; arrow turns accent color with fast bounce when drag threshold is crossed; removed on finger lift before load fires
- Remove snap-back (v1.37.31): Stripped all drag displacement, snapBack, board--pulling/snapping, ghost-click guard from scroll-more.js and scroll-more.css; load fires on finger lift at threshold, no visual drag feedback

Next Steps:

- Update src/sitemap.xml <lastmod> on release
- Run npm run format to apply Prettier to all 75 source files
