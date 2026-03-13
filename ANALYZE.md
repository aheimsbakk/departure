# Code Analysis — Kollektiv.Sanntid.org

**Version:** 1.38.7 | **Date:** 2026-03-13T23:00:52Z | **Tests:** ✅ All pass (exit 0)

---

## Summary

| Severity  | Count | Status |
| --------- | ----- | ------ |
| 🔴 HIGH   | 2     | Open   |
| 🟡 MEDIUM | 4     | Open   |
| 🟢 LOW    | 1     | Open   |

---

## 🔴 HIGH

### H1 — Rule 14 (DRY): `validModes` duplicated in 3 files

- **Files:**
  - `src/app/settings.js:27` — `const VALID_MODES = ['bus', 'tram', 'metro', 'rail', 'water', 'coach'];`
  - `src/entur/gps-search.js:12` — `const VALID_MODES = new Set(['bus', 'tram', 'metro', 'rail', 'water', 'coach']);`
  - `src/ui/share-button.js:108` — `const validModes = ['bus', 'tram', 'metro', 'rail', 'water', 'coach'];`
- **Problem:** The canonical source of truth already exists — `ALL_TRANSPORT_MODES` in `src/config.js`. All three files re-declare the same list locally. If a new transport mode is added to `config.js`, these copies will silently diverge.
- **Fix:** Replace all three local declarations with an import of `ALL_TRANSPORT_MODES` from `src/config.js`.

---

### H2 — Rule 9 (Error Handling): 9 empty / silent `catch` blocks

Rule 9 is explicit: **NO silent failures**. Each of the following swallows errors with no logging at all.

| File                                | Line(s) | Block                                                      | Context                                             |
| ----------------------------------- | ------- | ---------------------------------------------------------- | --------------------------------------------------- |
| `src/app/settings.js`               | 73      | `catch (_) { /* ignore corrupt storage */ }`               | `loadSettings()` — JSON parse / localStorage errors |
| `src/app/settings.js`               | 95      | `catch (_) { /* ignore */ }`                               | `saveSettings()` — localStorage write errors        |
| `src/app/settings.js`               | 108–110 | `catch (_) { /* non-critical */ }`                         | `applyTextSize()` — DOM class errors                |
| `src/app/url-import.js`             | 58      | `catch (_) { /* ignore */ }`                               | Inner `localStorage.setItem` for language           |
| `src/ui/options/settings-store.js`  | 20      | `catch (e) { /* ignore */ }`                               | `saveSettings()` — localStorage write errors        |
| `src/ui/options/panel-lifecycle.js` | 49      | `catch (e) { /* ignore */ }`                               | Toast animation timer logic                         |
| `src/ui/options/panel-lifecycle.js` | 92      | `catch (e) { /* ignore */ }`                               | `_prevFocus.focus()` in `closePanel()`              |
| `src/app/sw-updater.js`             | 134–136 | `catch (_) { /* keep fallback */ }`                        | Fetch of `sw.js` text for version detection         |
| `src/app/sw-updater.js`             | 157–158 | `catch (_) { /* SW registration failure is non-fatal */ }` | Entire SW registration block                        |

- **Fix:** Add at minimum `console.warn('context', e)` to each catch block so failures surface in DevTools.

---

## 🟡 MEDIUM

### M1 — Rule 16 (Workspace Hygiene): Missing `.gitignore` entries

- **File:** `.gitignore`
- **Missing entries** (explicitly required by Rule 16):
  - `.env` — environment files
  - `venv/` and `.venv/` — virtual environment directories
  - `.qa-error.log` — QA workflow artifact
- **Fix:** Add the three entries to `.gitignore`.

---

### M2 — Rule 21 (Synchronized Docs): Corrupted JSDoc in `share-button.js`

- **File:** `src/ui/share-button.js:37-38`
- **Problem:** The JSDoc for `decodeSettings()` has its `@param` and `@returns` tags mangled into one broken line:
  ```js
  * @param {string} encoded - Base64-encodedreturns {Object|null settings
  * @} Validated settings object or null if invalid
  ```
- **Fix:** Restore correct JSDoc tags:
  ```js
  * @param {string} encoded - Base64-encoded string
  * @returns {Object|null} Validated settings object or null if invalid
  ```

---

### M3 — Rule 13 (Anti-Monolith): Files exceeding 250-line threshold

| File                                     | Lines | Issue                                                                                                                     |
| ---------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------- |
| `src/ui/station-dropdown.js`             | 399   | **Mixed responsibilities:** favorites management, localStorage read/write, Entur calls, and DOM rendering all in one file |
| `src/app/scroll-more.js`                 | 339   | Single responsibility (scroll gesture) but well over the 250-line limit                                                   |
| `src/ui/options/station-autocomplete.js` | 280   | Borderline                                                                                                                |
| `src/ui/share-button.js`                 | 239   | Borderline                                                                                                                |
| `src/app.js`                             | 230   | Borderline bootstrap file                                                                                                 |
| `src/app/handlers.js`                    | 207   | Borderline                                                                                                                |

- **Most critical:** `station-dropdown.js` at 399 lines with clearly mixed responsibilities.
- **Fix:** Split `station-dropdown.js` — extract favorites localStorage logic into a `favorites-store.js` module.

---

### M4 — PROJECT_RULES §1 (Sitemap): `<lastmod>` not updated in same commit as v1.38.7

- **File:** `src/sitemap.xml`
- **Problem:** The v1.38.7 commit modified `src/ui/options/station-autocomplete.js` and `src/ui/gps-dropdown.js` but did **not** update `<lastmod>` in the same commit. PROJECT_RULES §1 requires the update to be in the same commit as any user-visible `src/` change.
- **Note:** The date value (`2026-03-13`) is currently still correct by coincidence, but the process was not followed.
- **Fix:** Update `<lastmod>` in `src/sitemap.xml` in the same commit as any future `src/` change.

---

## 🟢 LOW

### L1 — Rule 20 (Automation & Scripting): Scripts not documented in `README.md`

- **File:** `README.md`
- **Problem:** Rule 20 requires every `scripts/` utility to be documented in `README.md` with purpose, arguments, and usage examples. No "Scripts" or "Development" section exists. Affected scripts:
  - `scripts/bump-version.sh`
  - `scripts/validate_worklogs.sh`
  - `scripts/serve-src.sh`
  - `scripts/fix_worklogs.sh`
- **Fix:** Add a `## Scripts` section to `README.md`.

---

## ✅ Clean (no issues)

| Check                                       | Status                              |
| ------------------------------------------- | ----------------------------------- |
| `sw.js` ASSETS array vs actual `src/` files | ✅ Fully in sync (PROJECT_RULES §2) |
| No hardcoded secrets or `eval()` usage      | ✅ Clean                            |
| `package.json` — explicit versions only     | ✅ `prettier: "3.5.3"`              |
| All `scripts/` have executable bit          | ✅                                  |
| SRP in `entur/`, `i18n/`, `css/` modules    | ✅ Well-structured                  |
| No global dependency installs               | ✅                                  |
| English-only artifacts                      | ✅                                  |
