---
when: 2026-03-10T19:18:41Z
why: Footer overlap persisted on Firefox mobile because padding on nested flex children does not reliably extend the scroll boundary in Firefox.
what: Fix footer overlap on Firefox by adding padding-bottom to body and isolation:isolate to footer (v1.37.5)
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, css, firefox, footer, layout]
---

Added `padding-bottom: 80px` directly to `body` in `base.css` — Firefox does not propagate padding from nested flex children (`.app-root` → `.board`) to the scroll container boundary, so the fix must live on `body` itself. Also added `isolation: isolate` and `-webkit-backdrop-filter` to `.app-footer` in `footer.css` to ensure Firefox composites the footer as its own stacking context above page content. Bumped to v1.37.5.
