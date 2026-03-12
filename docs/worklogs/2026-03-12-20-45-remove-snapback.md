---
when: 2026-03-12T20:45:00Z
why: CSS snap-back animation was unreliable on mobile and could not be fixed cleanly; removed all drag displacement and snap-back machinery to simplify the feature.
what: Remove all snap-back/drag-displacement code from scroll-more; trigger load on finger lift only
model: opencode/claude-sonnet-4-6
tags: [refactor, scroll-more, mobile, simplification]
---

Removed all marginTop displacement, snapBack(), board--pulling, board--snapping, interruptedSnap, loadAfterSnap, ghost-click guard, and CSS transition rules from src/app/scroll-more.js and src/css/scroll-more.css. The gesture now tracks raw pull distance silently and fires triggerLoadMore() on pointer-up when threshold is met — no visual drag feedback. Also removed RESISTANCE and BOUNCE_DURATION_MS from SCROLL_MORE in src/config.js. Bumped to v1.37.31.
