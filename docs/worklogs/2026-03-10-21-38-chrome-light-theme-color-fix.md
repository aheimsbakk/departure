---
when: 2026-03-10T21:38:25Z
why: The single hardcoded dark theme-color meta tag caused Chrome mobile to show the wrong address bar color in light mode before JS ran
what: fix Chrome mobile address bar color in light mode via dual media-query theme-color meta tags
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, css, chrome, pwa, theme, mobile, light-mode]
---

Replaced the single hardcoded `<meta name="theme-color" content="#0b0f1a">` in `index.html` with two media-query-scoped tags (light: `#f5f7fa`, dark: `#0b0f1a`) so Chrome picks the correct color natively before any JS runs. Updated `updateThemeColorMeta` in `theme-toggle.js` to accept an `isAuto` flag — in auto mode the dual tags are left intact; in manual light/dark mode they are collapsed into one unconditional tag so the user's explicit choice overrides the system preference. Bumped to v1.37.16.
