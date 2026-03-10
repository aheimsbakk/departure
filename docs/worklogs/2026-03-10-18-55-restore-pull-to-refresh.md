---
when: 2026-03-10T18:55:09Z
why: overscroll-behavior:none from previous fix inadvertently disabled the browser's native pull-to-refresh gesture.
what: Replace overscroll-behavior:none with overscroll-behavior-y:none on body to restore pull-to-refresh
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, css, overscroll, pull-to-refresh]
---

Changed `overscroll-behavior: none` to `overscroll-behavior-y: none` on `body` in `base.css`. This preserves Chrome/Android pull-to-refresh (which survives the property) while still blocking the elastic bounce that caused the fixed footer to flicker on background drags. iOS Safari ignores the property entirely so pull-to-refresh there is unaffected. Still v1.37.2.
