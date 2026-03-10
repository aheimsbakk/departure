---
when: 2026-03-10T21:02:34Z
why: Mobile canvas had excess bottom space when scroll-more loaded extra departures, and all languages needed "temporary" added to the scroll hint text
what: Fix mobile bottom-space bug via flex:1 on .board; update scrollForMore label for all 12 languages
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, mobile, layout, i18n, scroll-more]
---

Replaced `min-height: 100vh` with `flex: 1` on `.board` in `src/css/layout.css` — the parent `.app-root` already provides `min-height: 100vh`, so vertical centering is preserved for short content while eliminating the forced whitespace at the bottom when departures overflow on mobile. Updated `scrollForMore` translation key across all 12 languages in `src/i18n/translations.js` to convey that the extra departures are temporary. Bumped to v1.37.14.
