---
when: 2026-03-02T18:01:38Z
why: PWA showed stale departure data after phone sleep/background due to frozen setInterval
what: Add visibilitychange wake-up refresh and pageshow BFCache guard
model: github-copilot/claude-sonnet-4.6
tags: [pwa, bug-fix, fetch-loop, service-worker]
---

Added `lastFetchAt` wall-clock tracking to `src/app/fetch-loop.js`; a `visibilitychange` listener wired inside `startRefreshLoop` compares elapsed time against `FETCH_INTERVAL` and calls `doRefresh()` immediately when the app resumes from background/sleep with stale data. Added a `pageshow` guard in `src/app.js` that forces a full reload when `event.persisted` is true (BFCache cold-start). Version bumped to 1.34.9.
