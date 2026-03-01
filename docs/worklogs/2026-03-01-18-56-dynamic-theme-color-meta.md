---
when: 2026-03-01T18:56:50Z
why: The static theme-color meta tag did not reflect light/auto themes, breaking browser chrome tinting on first load and after manual theme changes.
what: Dynamically sync <meta name="theme-color"> with the resolved effective theme on every applyTheme() call
model: github-copilot/claude-sonnet-4.6
tags: [theme, pwa, meta, ui]
---

Added `THEME_COLORS` constant and `updateThemeColorMeta(isDark)` helper to `src/ui/theme-toggle.js`; `applyTheme()` now resolves `isDark` for all three theme branches (light/dark/auto) and calls the helper, covering first load via `initTheme()`, user toggle clicks, and OS preference changes. Bumped to v1.34.2.
