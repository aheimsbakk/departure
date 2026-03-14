Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.38.10.

Current Goal: Stable mobile PWA experience across Chrome and Firefox.

Last 3 Changes:

- Fix share button reset timer race (v1.38.10): single \_resetTimer ref with clearTimeout prevents stacked callbacks; rapid clicks no longer leave button stuck on checkmark; regression test added
- Fix toolbar z-order (v1.38.9): split .global-gear into .settings-bar (z:1300, always above panel) and .share-bar (z:1100, covered by panel); share position anchored via rAF + getBoundingClientRect
- Fresh rules compliance analysis (v1.38.8): wrote ANALYZE.md with 2 HIGH (DRY validModes ×3, 9 silent catch blocks), 4 MEDIUM (gitignore, JSDoc, anti-monolith, sitemap process), 1 LOW (scripts not in README)

Next Steps:

- Fix H1: import ALL_TRANSPORT_MODES from config.js in settings.js, gps-search.js, share-button.js
- Fix H2: add console.warn to 9 silent catch blocks
- Fix M1: add .env, venv/, .venv/, .qa-error.log to .gitignore
