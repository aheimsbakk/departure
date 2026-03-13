# Code Analysis Report

**Generated:** 2026-03-13T12:00:00Z  
**Model:** github-copilot/claude-sonnet-4.6  
**Version analysed:** 1.38.2  
**Rules reference:** `agents/RULES.md`, `docs/PROJECT_RULES.md`

---

## Issue Index

| #                                                                                          | File                      | Category                                                                        | Severity  | Status   |
| ------------------------------------------------------------------------------------------ | ------------------------- | ------------------------------------------------------------------------------- | --------- | -------- |
| [1](#1-appjs--duplicate-import-statements-from-fetch-loopjs)                               | `src/app.js`              | Duplicate `import` from same module — Rule §8                                   | 🟢 Minor  | ✅ Fixed |
| [2](#2-handlersjs--duplicate-import-statements-from-fetch-loopjs)                          | `src/app/handlers.js`     | Duplicate `import` from same module — Rule §8                                   | 🟢 Minor  | ✅ Fixed |
| [3](#3-share-buttonjs--alert-blocks-the-ui-thread)                                         | `src/ui/share-button.js`  | `alert()` freezes JS thread and all timers — Rule §9                            | 🟠 Medium | ✅ Fixed |
| [4](#4-geocoderjs--searchstations-outer-catch-is-silent)                                   | `src/entur/geocoder.js`   | Silent `catch (_)` hides all errors — Rule §9                                   | 🟡 Low    | ✅ Fixed |
| [5](#5-gps-searchjs--fetchnearbystops-outer-catch-is-silent)                               | `src/entur/gps-search.js` | Silent `catch (_)` hides all errors — Rule §9                                   | 🟡 Low    | ✅ Fixed |
| [6](#6-swjs--silent-cachepatch-failures)                                                   | `src/sw.js`               | `cache.put(…).catch(() => {})` swallows quota errors — Rule §9                  | 🟡 Low    | ✅ Fixed |
| [7](#7-fetch-loopjs--defaults-read-live-inside-async-gap-race-condition)                   | `src/app/fetch-loop.js`   | `DEFAULTS` read live across `await` — race condition — Rule §12                 | 🟠 Medium | ✅ Fixed |
| [8](#8-optionsindexjs--dual-loadsettings-call-paths)                                       | `src/ui/options/index.js` | Two separate `loadSettings()` paths to same key — Rule §9                       | 🟡 Low    | ✅ Fixed |
| [9](#9-uijs--footer-factory-mixed-into-createboardelements)                                | `src/ui/ui.js`            | Footer DOM built inside `createBoardElements` — Rule §8 §13                     | 🟡 Low    | 🔴 Open  |
| [10](#10-gps-dropdownjs--innerhtml--does-not-remove-item-listeners)                        | `src/ui/gps-dropdown.js`  | `innerHTML = ''` without explicit listener removal — Rule §11                   | 🟡 Low    | 🔴 Open  |
| [11](#11-configjs--mutable-defaults-written-by-multiple-modules)                           | `src/config.js`           | Mutable `DEFAULTS` mutated by 5 modules — Rule §12                              | 🟠 Medium | ✅ Fixed |
| [12](#12-settingsjs--savesettings-serialises-all-of-defaults-including-non-persisted-keys) | `src/app/settings.js`     | `saveSettings()` serialises entire `DEFAULTS` including runtime keys — Rule §6  | 🟡 Low    | ✅ Fixed |
| [13](#13-optionsindexjs--panel-title-is-a-hardcoded-string-not-a-constant)                 | `src/ui/options/index.js` | `'Kollektiv.Sanntid.org'` hardcoded, not from `config.js` — Rule §21            | 🟡 Low    | ✅ Fixed |
| [14](#14-sitemapxml--lastmod-not-updated-on-release)                                       | `src/sitemap.xml`         | `<lastmod>` not updated on release — `docs/PROJECT_RULES.md` §1                 | 🟡 Low    | ✅ Fixed |
| [15](#15-action-barjs--duplicate-import-of-config-and-i18n)                                | `src/app/action-bar.js`   | Two separate `import` statements from `config.js` and `i18n.js` — Rule §8       | 🟢 Minor  | ✅ Fixed |
| [16](#16-parserjs--bare-catch-discards-error-context)                                      | `src/entur/parser.js`     | Bare `catch (_)` silently resets `explicitMode` and `publicCode` — Rule §9      | 🟡 Low    | ✅ Fixed |
| [17](#17-departurejs--silent-empty-catch-on-aria-label-assignment)                         | `src/ui/departure.js`     | Empty `catch (e) {}` on `aria-label` attribution — Rule §9                      | 🟡 Low    | ✅ Fixed |
| [18](#18-appjs--domcontentloaded-callback-is-never-removed)                                | `src/app.js`              | `DOMContentLoaded` listener never removed — Rule §11                            | 🟢 Minor  | ✅ Fixed |
| [19](#19-scroll-morejs--mousemove-and-mouseup-on-window-never-removed-on-pagehide)         | `src/app/scroll-more.js`  | `window.mousemove/mouseup/wheel` listeners not removed on `pagehide` — Rule §11 | 🟠 Medium | ✅ Fixed |
| [20](#20-appjs--scrollmoreref-destroy-not-called-on-pagehide)                              | `src/app.js`              | `scrollMoreRef` not torn down in `pagehide` handler — Rule §11                  | 🟠 Medium | ✅ Fixed |

---

## Open Issues

Only issues #9 and #10 remain open (architectural refactors deferred).

---

### 1. `app.js` — Duplicate `import` statements from `fetch-loop.js`

**Severity:** 🟢 Minor  
**File:** `src/app.js` lines 27, 33  
**Rule:** §8 (code hygiene)  
**Status:** ✅ Fixed — merged into one `import { doRefresh, startRefreshLoop, tickCountdowns, data, setNumDeparturesOverride }` statement.

**Problem:**  
Two separate `import` statements pull from the same module:

```js
// line 27
import { doRefresh, startRefreshLoop, tickCountdowns, data } from './app/fetch-loop.js';
// line 33
import { setNumDeparturesOverride } from './app/fetch-loop.js';
```

ES modules deduplicate the module instance at runtime, so this is not a functional bug — but it signals a drive-by addition and violates the single-import-per-module convention.

**Fix direction:**  
Merge into one statement:

```js
import {
  doRefresh,
  startRefreshLoop,
  tickCountdowns,
  data,
  setNumDeparturesOverride,
} from './app/fetch-loop.js';
```

---

### 2. `handlers.js` — Duplicate `import` statements from `fetch-loop.js`

**Severity:** 🟢 Minor  
**File:** `src/app/handlers.js` lines 23–24  
**Rule:** §8 (code hygiene)  
**Status:** ✅ Fixed — merged into `import { doRefresh, startRefreshLoop, setNumDeparturesOverride }` statement.

**Problem:**  
Same pattern as #1:

```js
// line 23
import { doRefresh, startRefreshLoop } from './fetch-loop.js';
// line 24
import { setNumDeparturesOverride } from './fetch-loop.js';
```

**Fix direction:**  
Merge into one statement:

```js
import { doRefresh, startRefreshLoop, setNumDeparturesOverride } from './fetch-loop.js';
```

---

### 3. `share-button.js` — `alert()` blocks the UI thread

**Severity:** 🟠 Medium  
**File:** `src/ui/share-button.js`  
**Rule:** §9 (graceful degradation), §12 (concurrency)  
**Status:** ✅ Fixed — both `alert()` calls replaced with `showButtonError('⚠️')` (non-blocking 2.5 s button label swap + `console.warn`).

---

### 4. `geocoder.js` — `searchStations` outer `catch` is silent

**Severity:** 🟡 Low  
**File:** `src/entur/geocoder.js` line 124  
**Rule:** §9 (no silent failures)  
**Status:** ✅ Fixed — `catch (_)` replaced with `catch (err) { console.warn('[geocoder] searchStations failed', err); return []; }`.

**Problem:**  
The outer `catch` returns `[]` for **any** failure — including unexpected runtime errors — with no logging:

```js
} catch (_) {
  return [];
}
```

Network timeouts, JSON parse errors, and programming bugs are all indistinguishable from "no results". Autocomplete silently stops working with no diagnostic signal.

**Fix direction:**

```js
} catch (err) {
  console.warn('[geocoder] searchStations failed', err);
  return [];
}
```

---

### 5. `gps-search.js` — `fetchNearbyStops` outer `catch` is silent

**Severity:** 🟡 Low  
**File:** `src/entur/gps-search.js` line 137  
**Rule:** §9 (no silent failures)  
**Status:** ✅ Fixed — `catch (_)` replaced with `catch (err) { console.warn('[gps-search] fetchNearbyStops failed', err); return []; }`.

**Problem:**  
Same pattern as #4:

```js
} catch (_) {
  return [];
}
```

The GPS dropdown already has a `catch` in `gps-dropdown.js` that logs and shows a user-facing error message — but if `fetchNearbyStops` silently swallows the error and returns `[]`, the dropdown shows "no results" instead of the correct error state, hiding the real failure.

**Fix direction:**  
Re-throw or at minimum log, so the calling code in `gps-dropdown.js` correctly handles it:

```js
} catch (err) {
  console.warn('[gps-search] fetchNearbyStops failed', err);
  return [];
}
```

---

### 6. `sw.js` — Silent `cache.put` failures

**Severity:** 🟡 Low  
**File:** `src/sw.js` lines 128, 161  
**Rule:** §9 (no silent failures)  
**Status:** ✅ Fixed — both `.catch(() => {})` calls replaced with `.catch((err) => console.warn('[SW] cache.put failed', err))`.

**Problem:**  
Two `cache.put(req, netRes.clone()).catch(() => {})` calls silently swallow cache-write failures. If the storage quota is exceeded, offline support degrades with no diagnostic signal.

**Fix direction:**

```js
cache.put(req, netRes.clone()).catch((err) => console.warn('[SW] cache.put failed', err));
```

---

### 7. `fetch-loop.js` — `DEFAULTS` read live inside an async gap (race condition)

**Severity:** 🟠 Medium  
**File:** `src/app/fetch-loop.js`  
**Rule:** §12 (state management, race-condition guards)  
**Status:** ✅ Fixed — `DEFAULTS.STOP_ID`, `.STATION_NAME`, `.TRANSPORT_MODES` (`.slice()`), `.API_URL`, and `.CLIENT_NAME` are now snapshotted at the top of `doRefresh` before the first `await`.

---

### 8. `options/index.js` — Dual `loadSettings()` call paths

**Severity:** 🟡 Low  
**File:** `src/ui/options/index.js` lines 101–108  
**Rule:** §9 (reliability)  
**Status:** ✅ Fixed — removed the `loadSettings()` call; initial field values are now read directly from the `defaults` parameter (which already reflects the merged localStorage state loaded by `app.js → app/settings.js`).

**Problem:**  
`app.js` calls `app/settings.js:loadSettings()` at startup, merging `localStorage` into `DEFAULTS`. Then `options/index.js` line 101 calls `ui/options/settings-store.js:loadSettings()` — a **different** function that also reads the same `localStorage` key. There are two separate read paths to the same `departure:settings` key. If one fails (e.g. `SecurityError` in private browsing), the panel could display stale defaults while `DEFAULTS` already has the updated values.

**Fix direction:**  
Remove the `loadSettings()` call in `options/index.js`. The `defaults` parameter is already the merged `DEFAULTS` object — read initial field values from it directly:

```js
// Remove lines 101–108 and rely on the `defaults` parameter already reflecting
// the merged localStorage state loaded by app.js → app/settings.js.
```

---

### 9. `ui.js` — Footer factory mixed into `createBoardElements`

**Severity:** 🟡 Low  
**File:** `src/ui/ui.js`  
**Rule:** §8 (SRP), §13 (anti-monolith)

**Problem:**  
`createBoardElements` assembles board scaffolding **and** builds a two-line footer with its own DOM structure and `updateFooterTranslations` export. Footer construction is a distinct responsibility from board layout.

**Fix direction:**  
Extract `createFooter()` and `updateFooterTranslations()` into `src/ui/footer.js`. `createBoardElements` calls `createFooter()` and returns its result in the `board` object.

---

### 10. `gps-dropdown.js` — `innerHTML = ''` does not remove item listeners

**Severity:** 🟡 Low  
**File:** `src/ui/gps-dropdown.js` lines 79, 85, 224  
**Rule:** §11 (memory & resource lifecycle)

**Problem:**  
`closeDropdown()`, `openWith()`, and `destroy()` all use `menu.innerHTML = ''` to clear items. Each `buildStopItem` attaches a `click` listener to a `<button>` that closes over `closeDropdown`. Setting `innerHTML = ''` removes DOM nodes without explicitly calling `removeEventListener`. The closure chain keeps the component reachable until GC — not synchronously freed, contrary to Rule §11.

**Fix direction:**  
Switch to event delegation: attach a single `click` listener on the `menu` element rather than per-item:

```js
menu.addEventListener('click', (e) => {
  const item = e.target.closest('.gps-dropdown-item');
  if (!item) return;
  const stop = stopsMap.get(item);
  if (stop) {
    e.stopPropagation();
    closeDropdown();
    onStationSelect(stop);
  }
});
```

---

### 11. `config.js` — Mutable exported `DEFAULTS` written by multiple modules

**Severity:** 🟠 Medium  
**File:** `src/config.js`; mutated in `handlers.js`, `url-import.js`, `app.js`, `settings.js`  
**Rule:** §12 (unidirectional state mutations)  
**Status:** ✅ Fixed (short-term) — `doRefresh` in `fetch-loop.js` now snapshots all `DEFAULTS` values before the first `await`, eliminating the TOCTOU race at the fetch boundary. The underlying architectural issue (no access-control on the exported object) remains; long-term mitigation is a dedicated `state.js` module with explicit `get/set` accessors.

---

### 12. `settings.js` — `saveSettings()` serialises the entire `DEFAULTS` object

**Severity:** 🟡 Low  
**File:** `src/app/settings.js` line 83  
**Rule:** §6 (data hygiene), §11 (data lifecycle)  
**Status:** ✅ Fixed — `saveSettings()` now serialises only the six user-preference keys (`STATION_NAME`, `STOP_ID`, `NUM_DEPARTURES`, `FETCH_INTERVAL`, `TRANSPORT_MODES`, `TEXT_SIZE`). Runtime/config constants are excluded.

**Problem:**  
`saveSettings()` serialises the entire `DEFAULTS` object:

```js
localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULTS));
```

`DEFAULTS` contains keys that should not be persisted: `CLIENT_NAME`, `API_URL`, `GITHUB_URL`, and `NUM_FAVORITES` are runtime/config constants, not user preferences. If any of these are mutated at runtime (e.g. a future feature override), they will be silently persisted and restored on next load, overriding the correct values from `config.js`. Additionally, serialising `null` for `STOP_ID` means a cleared station is restored as `null` instead of triggering the `getDefaultStation()` fallback.

**Fix direction:**  
Serialise only the user preference keys:

```js
export function saveSettings() {
  const toSave = {
    STATION_NAME: DEFAULTS.STATION_NAME,
    STOP_ID: DEFAULTS.STOP_ID,
    NUM_DEPARTURES: DEFAULTS.NUM_DEPARTURES,
    FETCH_INTERVAL: DEFAULTS.FETCH_INTERVAL,
    TRANSPORT_MODES: DEFAULTS.TRANSPORT_MODES,
    TEXT_SIZE: DEFAULTS.TEXT_SIZE,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (_) {}
}
```

---

### 13. `options/index.js` — Panel title is a hardcoded string, not a constant

**Severity:** 🟡 Low  
**File:** `src/ui/options/index.js` line 25  
**Rule:** §21 (synchronized docs / constants)  
**Status:** ✅ Fixed — `APP_NAME = 'Kollektiv.Sanntid.org'` exported from `config.js`; `options/index.js` now imports and uses it.

**Problem:**

```js
title.textContent = 'Kollektiv.Sanntid.org';
```

The `<h3>` panel title is a hardcoded string literal duplicated from the HTML `<title>` tag. All other panel labels use `t()` and are refreshed on language change. While this is a brand name (intentionally untranslated), having it as a bare string literal means a rename requires hunting across files.

**Fix direction:**  
Reference from `config.js` as a named constant:

```js
// config.js
export const APP_NAME = 'Kollektiv.Sanntid.org'; // brand name: not translated

// options/index.js
import { APP_NAME } from '../../config.js';
title.textContent = APP_NAME; // intentionally not translated — brand name
```

---

### 14. `sitemap.xml` — `<lastmod>` not updated on release

**Severity:** 🟡 Low  
**File:** `src/sitemap.xml`  
**Rule:** `docs/PROJECT_RULES.md` §1  
**Status:** ✅ Fixed — `scripts/bump-version.sh` now runs `sed` to update `<lastmod>` to today's date every time the version is bumped.

**Problem:**  
`docs/PROJECT_RULES.md` §1 requires updating `<lastmod>` whenever files under `src/` are changed and released. This has been missed across recent releases. `CONTEXT.md` acknowledges it but it is not automated.

**Fix direction:**  
Add a `sed` line to `scripts/bump-version.sh` that updates `<lastmod>` to today's date, ensuring it is always current:

```sh
TODAY=$(date +%Y-%m-%d)
sed -i "s|<lastmod>.*</lastmod>|<lastmod>${TODAY}</lastmod>|g" src/sitemap.xml
```

---

### 15. `action-bar.js` — Duplicate `import` statements from `config.js` and `i18n.js`

**Severity:** 🟢 Minor  
**File:** `src/app/action-bar.js` lines 11–14  
**Rule:** §8 (code hygiene)  
**Status:** ✅ Fixed — merged into `import { UI_EMOJIS, DEFAULTS } from '../config.js'` and `import { t, getLanguage } from '../i18n.js'`.

**Problem:**  
Two separate `import` statements pull from the same modules:

```js
// line 11
import { UI_EMOJIS } from '../config.js';
// line 13
import { DEFAULTS } from '../config.js';

// line 12
import { t } from '../i18n.js';
// line 14
import { getLanguage } from '../i18n.js';
```

**Fix direction:**  
Merge into one statement per module:

```js
import { UI_EMOJIS, DEFAULTS } from '../config.js';
import { t, getLanguage } from '../i18n.js';
```

---

### 16. `parser.js` — Bare `catch (_)` discards error context

**Severity:** 🟡 Low  
**File:** `src/entur/parser.js` lines 114–116  
**Rule:** §9 (no silent failures)  
**Status:** ✅ Fixed — `catch (_)` replaced with `catch (err) { console.warn('[parser] mode/publicCode extraction failed', err); ... }`.

**Problem:**  
The mode/publicCode extraction block silently swallows any exception:

```js
} catch (_) {
  explicitMode = null;
  publicCode   = null;
}
```

If a programming error or unexpected API shape causes a throw inside this block (e.g. `TypeError` from a changed API response structure), it is completely invisible. The departure renders with no mode emoji and no line number, with no diagnostic log to indicate what went wrong.

**Fix direction:**

```js
} catch (err) {
  console.warn('[parser] mode/publicCode extraction failed', err);
  explicitMode = null;
  publicCode   = null;
}
```

---

### 17. `departure.js` — Empty `catch (e) {}` on `aria-label` assignment

**Severity:** 🟡 Low  
**File:** `src/ui/departure.js` line 142  
**Rule:** §9 (no silent failures)  
**Status:** ✅ Fixed — `catch (e) {}` replaced with `catch (err) { console.warn('[departure] aria-label assignment failed', err); }`.

**Problem:**  
The ARIA label assignment block has an empty catch:

```js
try {
  // … compute aria-label string …
  dest.setAttribute('aria-label', …);
} catch (e) {}
```

A failure here silently degrades accessibility without any diagnostic signal.

**Fix direction:**

```js
} catch (err) {
  console.warn('[departure] aria-label assignment failed', err);
}
```

---

### 18. `app.js` — `DOMContentLoaded` listener is never removed

**Severity:** 🟢 Minor  
**File:** `src/app.js` line 225  
**Rule:** §11 (resource lifecycle)  
**Status:** ✅ Fixed — `addEventListener('DOMContentLoaded', init)` updated to `addEventListener('DOMContentLoaded', init, { once: true })`.

**Problem:**

```js
document.addEventListener('DOMContentLoaded', init);
```

The `DOMContentLoaded` event fires at most once per page load, so the listener accumulates in the DOM but is never cleaned up. While browsers typically reclaim single-fire listeners, it is inconsistent with the explicit teardown approach the codebase takes for other listeners (`pagehide`, `visibilitychange`, `controllerchange`).

**Fix direction:**  
Use `{ once: true }`:

```js
document.addEventListener('DOMContentLoaded', init, { once: true });
```

---

### 19. `scroll-more.js` — `window` listeners not removed on `pagehide`

**Severity:** 🟠 Medium  
**File:** `src/app/scroll-more.js`, `src/app.js`  
**Rule:** §11 (resource lifecycle)  
**Status:** ✅ Fixed — `app.js` now holds a module-level `_teardownScrollMoreRef` that is assigned in `init()` and its `destroy()` is called in the `pagehide` handler alongside `stationDropdown` and `gpsRef`.

---

### 20. `app.js` — `scrollMoreRef` not torn down in `pagehide`

**Severity:** 🟠 Medium  
**File:** `src/app.js`  
**Rule:** §11 (resource lifecycle)  
**Status:** ✅ Fixed — see #19.

---

## Notes

- Issues #7 and #11 are closely related: the snapshot fix for #7 is the concrete short-term mitigation for the broader mutable-`DEFAULTS` problem described in #11. Long-term solution is a `state.js` module with explicit accessors.
- Issues #19 and #20 were a single root-cause split across two files — fixed together.
- Issues #1, #2, and #15 are trivial one-line merges; fix in the same commit as any other change to those files.
- Issues #4 and #5 are one-liner `console.warn` additions; fix together in a single pass.
- Issue #12 (`saveSettings` serialising all of `DEFAULTS`) is a latent data-hygiene bug; no user-visible impact today but it will bite on any future addition of runtime-only keys to `DEFAULTS`.
- Issue #8 (`options/index.js` dual `loadSettings`) creates a silent divergence risk in private-browsing mode; low risk today but worth fixing before adding more settings keys.
