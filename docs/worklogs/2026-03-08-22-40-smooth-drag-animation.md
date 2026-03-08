---
when: 2026-03-08T22:40:06Z
why: The rubber-band drag animation was choppy on mobile due to forced synchronous layout reflows on every touchmove event.
what: Eliminate scroll-loader layout thrash — rAF batching, GPU compositing, will-change lifecycle, iOS overscroll fix
model: github-copilot/claude-sonnet-4.6
tags: [performance, mobile, animation, scroll-loader]
---

Replaced `boardEl.offsetHeight` forced-reflow pattern in `setLiftImmediate` with a CSS `.is-lifting` class that carries `transition: none`, eliminating synchronous layout on every `touchmove`. Transform writes are now coalesced into a single `requestAnimationFrame` per frame. Switched from `translateY` to `translate3d` for GPU-composited movement, added `will-change: transform` lifecycle (set at `touchstart`, cleared after snap-back), and added `overscroll-behavior: none` to prevent iOS Safari's native elastic scroll fighting the custom rubber-band. Spring curve moved to CSS (`.board:not(.is-lifting)`). Bumped to v1.37.5. Files touched: `src/app/scroll-loader.js`, `src/css/scroll-loader.css`.
