---
when: 2026-03-01T21:31:51Z
why: Share links using the new 3-element format silently overwrote the user's saved text size, fetch interval, language, and departure count with hardcoded sentinel defaults
what: Fix URL-import conflict so absent share-link fields never overwrite existing app settings
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, url-import, share, defaults, refactor]
---

Fixed in three layers: `decodeSettings()` now initialises all optional fields to `null` instead of hardcoded values so callers can distinguish "field was in the URL" from "field was absent"; `processUrlParams()` guards every DEFAULTS assignment with `!= null` so only present fields are applied; `app.js` init order corrected so the URL import result (`urlImported`) suppresses the "apply first favorite" fallback that could override a freshly imported station. Also removed a duplicate `lookupStopId` call in `app.js` (already handled inside `doRefresh()`) and fixed duplicate step-6 comment. Bumped to v1.34.7. Files touched: `src/ui/share-button.js`, `src/app/url-import.js`, `src/app.js`, `CONTEXT.md`.
