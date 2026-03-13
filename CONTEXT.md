Overall Context: Kollektiv.Sanntid.org - Real-time Norwegian public transport departure board. Version 1.38.8.

Current Goal: Stable mobile PWA experience across Chrome and Firefox.

Last 3 Changes:

- Fresh rules compliance analysis (v1.38.8): wrote ANALYZE.md with 2 HIGH (DRY validModes ×3, 9 silent catch blocks), 4 MEDIUM (gitignore, JSDoc, anti-monolith, sitemap process), 1 LOW (scripts not in README)
- Fix autocomplete wipe + GPS dropdown click bugs introduced in 1c20fbb (v1.38.7): removed input-wipe guard block from station-autocomplete.js; removed stopsMap.clear() from gps-dropdown.js openWith(); added regression tests
- Fix remaining ANALYZE.md open issues #9 and #10 (v1.38.4): footer DOM extracted into src/ui/footer.js (SRP §8 §13); gps-dropdown.js switched to event delegation with stopsMap (Rule §11)

Next Steps:

- Fix H1: import ALL_TRANSPORT_MODES from config.js in settings.js, gps-search.js, share-button.js
- Fix H2: add console.warn to 9 silent catch blocks
- Fix M1: add .env, venv/, .venv/, .qa-error.log to .gitignore
