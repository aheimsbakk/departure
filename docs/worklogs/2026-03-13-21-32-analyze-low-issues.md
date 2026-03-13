---
when: 2026-03-13T21:32:06Z
why: Fix all remaining open issues identified in ANALYZE.md (rules §8, §9, §11, §6, §21)
what: Resolve 13 open ANALYZE.md issues — import hygiene, silent catches, settings serialisation, APP_NAME constant, sitemap automation
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, hygiene, error-handling, settings, config]
---

Fixed all 13 remaining open issues from ANALYZE.md in v1.38.4. Merged duplicate imports in `app.js`, `handlers.js`, and `action-bar.js` (#1, #2, #15); added `console.warn` to silent catches in `geocoder.js`, `gps-search.js`, `sw.js`, `parser.js`, and `departure.js` (#4, #5, #6, #16, #17); removed redundant `loadSettings()` in `options/index.js` (#8); scoped `saveSettings()` to user-pref keys only (#12); extracted `APP_NAME` constant to `config.js` (#13); automated `sitemap.xml <lastmod>` updates in `bump-version.sh` (#14); added `{ once: true }` to `DOMContentLoaded` (#18). Issues #9 and #10 remain open as deferred architectural refactors.
