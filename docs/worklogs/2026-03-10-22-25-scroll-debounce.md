---
when: 2026-03-10T22:25:54Z
why: Prevent rapid consecutive load-more triggers from wheel or gesture re-entry during scroll-for-more
what: Add configurable leading-edge debounce to scroll-more load trigger
model: github-copilot/claude-sonnet-4.6
tags: [scroll-more, debounce, config, patch]
---

Added `DEBOUNCE_MS: 600` to `SCROLL_MORE` in `src/config.js` as the single tunable knob. In `src/app/scroll-more.js`, `triggerLoadMore()` now guards with a leading-edge timestamp check (`lastLoadMoreAt`) so rapid wheel ticks and gesture re-entry cannot fire multiple consecutive loads within the debounce window. `reset()` clears `lastLoadMoreAt` so station changes start fresh. Bumped to v1.37.21.
