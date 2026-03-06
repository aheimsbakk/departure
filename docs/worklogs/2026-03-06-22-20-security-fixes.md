---
when: 2026-03-06T22:20:04Z
why: Fix XSS and deprecated API security issues identified in audit
what: Replace innerHTML with DOM methods; replace escape/unescape with TextEncoder/TextDecoder; downgrade console.error to console.warn
model: opencode/claude-sonnet-4-6
tags: [security, xss, deprecation, share-button, departure]
---

Fixed XSS vector in `src/ui/departure.js` where `quayCode` from the Entur API was interpolated via `innerHTML`; replaced with `createElement`+`textContent` DOM methods. Replaced deprecated `escape`/`unescape` base64 codec in `src/ui/share-button.js` with `TextEncoder`/`TextDecoder`; also downgraded `console.error` calls to `console.warn` with `e.message` only to avoid leaking decoded data. Bumped to v1.36.13.
