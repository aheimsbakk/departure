---
when: 2026-03-10T19:26:08Z
why: Footer overlap persisted on Firefox because body min-height:100% collapses to the viewport height, making padding-bottom ineffective when content overflows.
what: Fix body min-height from 100% to 100vh so padding-bottom always extends below content on Firefox (v1.37.6)
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, css, firefox, footer, layout]
---

Changed `body { min-height: 100% }` to `body { min-height: 100vh }` in `base.css`. With `min-height: 100%`, Firefox resolves the percentage against `html { height: 100% }` = the viewport, capping the body at viewport height so overflow content escapes it and `padding-bottom` has no effect. With `100vh` the body grows with its content, and the existing `padding-bottom: 80px` creates real scrollable clearance below the last item. Bumped to v1.37.6.
