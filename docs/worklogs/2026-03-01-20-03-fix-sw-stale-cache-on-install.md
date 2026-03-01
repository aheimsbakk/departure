---
when: 2026-03-01T20:03:13Z
why: New versioned SW cache was silently populated with stale asset bodies because cache.addAll() fetched through the browser HTTP cache.
what: Fix stale cache on update by using Request({ cache: 'reload' }) in install handler
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, service-worker, pwa, cache]
---

Changed the install handler in `src/sw.js` to construct each asset as `new Request(url, { cache: 'reload' })` before passing to `cache.addAll()`. This forces fetch to bypass the browser HTTP cache and retrieve fresh files from the server, ensuring the new versioned cache always contains the correct asset bodies. Bumped to v1.34.6.
