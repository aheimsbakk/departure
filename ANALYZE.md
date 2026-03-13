# Code Analysis Report

**Generated:** 2026-03-13T00:00:00Z  
**Model:** github-copilot/claude-sonnet-4.6  
**Version analysed:** 1.38.2  
**Rules reference:** `agents/RULES.md`, `docs/PROJECT_RULES.md`

---

## Issue Index

| #                                                                                          | File                      | Category                                                                        | Severity  | Status  |
| ------------------------------------------------------------------------------------------ | ------------------------- | ------------------------------------------------------------------------------- | --------- | ------- |
| [1](#1-appjs--duplicate-import-statements-from-fetch-loopjs)                               | `src/app.js`              | Duplicate `import` from same module — Rule §8                                   | 🟢 Minor  | 🔴 Open |
| [2](#2-handlersjs--duplicate-import-statements-from-fetch-loopjs)                          | `src/app/handlers.js`     | Duplicate `import` from same module — Rule §8                                   | 🟢 Minor  | 🔴 Open |
| [3](#3-share-buttonjs--alert-blocks-the-ui-thread)                                         | `src/ui/share-button.js`  | `alert()` freezes JS thread and all timers — Rule §9                            | 🟠 Medium | 🔴 Open |
| [4](#4-geocoderjs--searchstations-outer-catch-is-silent)                                   | `src/entur/geocoder.js`   | Silent `catch (_)` hides all errors — Rule §9                                   | 🟡 Low    | 🔴 Open |
| [5](#5-gps-searchjs--fetchnearbystops-outer-catch-is-silent)                               | `src/entur/gps-search.js` | Silent `catch (_)` hides all errors — Rule §9                                   | 🟡 Low    | 🔴 Open |
| [6](#6-swjs--silent-cachepatch-failures)                                                   | `src/sw.js`               | `cache.put(…).catch(() => {})` swallows quota errors — Rule §9                  | 🟡 Low    | 🔴 Open |
| [7](#7-fetch-loopjs--defaults-read-live-inside-async-gap-race-condition)                   | `src/app/fetch-loop.js`   | `DEFAULTS` read live across `await` — race condition — Rule §12                 | 🟠 Medium | 🔴 Open |
| [8](#8-optionsindexjs--dual-loadsettings-call-paths)                                       | `src/ui/options/index.js` | Two separate `loadSettings()` paths to same key — Rule §9                       | 🟡 Low    | 🔴 Open |
| [9](#9-uijs--footer-factory-mixed-into-createboardelements)                                | `src/ui/ui.js`            | Footer DOM built inside `createBoardElements` — Rule §8 §13                     | 🟡 Low    | 🔴 Open |
| [10](#10-gps-dropdownjs--innerhtml---does-not-remove-item-listeners)                       | `src/ui/gps-dropdown.js`  | `innerHTML = ''` without explicit listener removal — Rule §11                   | 🟡 Low    | 🔴 Open |
| [11](#11-configjs--mutable-defaults-written-by-multiple-modules)                           | `src/config.js`           | Mutable `DEFAULTS` mutated by 5 modules — Rule §12                              | 🟠 Medium | 🔴 Open |
| [12](#12-settingsjs--saveSettings-serialises-all-of-defaults-including-non-persisted-keys) | `src/app/settings.js`     | `saveSettings()` serialises entire `DEFAULTS` including runtime keys            | 🟡 Low    | 🔴 Open |
| [13](#13-optionsindexjs--panel-title-is-a-hardcoded-string-not-a-constant)                 | `src/ui/options/index.js` | `'Kollektiv.Sanntid.org'` hardcoded, not from `config.js` — Rule §21            | 🟡 Low    | 🔴 Open |
| [14](#14-sitemapxml--lastmod-not-updated-on-release)                                       | `src/sitemap.xml`         | `<lastmod>` not updated on release — `docs/PROJECT_RULES.md` §1                 | 🟡 Low    | 🔴 Open |
| [15](#15-action-barjs--duplicate-import-of-config-and-i18n)                                | `src/app/action-bar.js`   | Two separate `import` statements from `config.js` and `i18n.js` — Rule §8       | 🟢 Minor  | 🔴 Open |
| [16](#16-parserjs--bare-catch-discards-error-context)                                      | `src/entur/parser.js`     | Bare `catch (_)` silently resets `explicitMode` and `publicCode` — Rule §9      | 🟡 Low    | 🔴 Open |
| [17](#17-departurejs--silent-empty-catch-on-aria-label-assignment)                         | `src/ui/departure.js`     | Empty `catch (e) {}` on `aria-label` attribution — Rule §9                      | 🟡 Low    | 🔴 Open |
| [18](#18-appjs--dOMcontentloaded-callback-is-never-removed)                                | `src/app.js`              | `DOMContentLoaded` listener never removed — Rule §11                            | 🟢 Minor  | 🔴 Open |
| [19](#19-scroll-morejs--mousemove-and-mouseup-on-window-never-removed-on-pagehide)         | `src/app/scroll-more.js`  | `window.mousemove/mouseup/wheel` listeners not removed on `pagehide` — Rule §11 | 🟠 Medium | 🔴 Open |
| [20](#20-appjs--scrollmoreref-destroy-not-called-on-pagehide)                              | `src/app.js`              | `scrollMoreRef` not torn down in `pagehide` handler — Rule §11                  | 🟠 Medium | 🔴 Open |

---

## Open Issues

---

### 1. `app.js` — Duplicate `import` statements from `fetch-loop.js`

**Severity:** 🟢 Minor  
**File:** `src/app.js` lines 27, 33  
**Rule:** §8 (code hygiene)

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
**File:** `src/ui/share-button.js` lines 197, 203  
**Rule:** §9 (graceful degradation), §12 (concurrency)

**Problem:**  
Two `alert()` calls are used for error states:

```js
// line 197
alert(t('noStationToShare'));
// line 203
alert(t('shareFailed'));
```

`alert()` is a synchronous, blocking, UI-thread modal. It suspends JavaScript execution entirely — including the `setInterval` that drives the 1-second departure countdown and the auto-refresh loop. On mobile browsers it can produce a permission-level OS dialog. It is also not translatable via `t()` since the text is provided via the alert call itself (though `t()` is called, the modal chrome is not translated). The blocking behaviour violates Rule §12's requirement to prevent JS execution interruption.

**Fix direction:**  
Replace with non-blocking inline feedback:

```js
// Option A: temporarily change button label
button.textContent = '⚠️';
setTimeout(() => {
  button.textContent = UI_EMOJIS.share;
}, 2000);

// Option B: reuse lifecycle.showToast() (already available in the codebase)
```

---

### 4. `geocoder.js` — `searchStations` outer `catch` is silent

**Severity:** 🟡 Low  
**File:** `src/entur/geocoder.js` line 124  
**Rule:** §9 (no silent failures)

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

**Problem:**  
Two `cache.put(req, netRes.clone()).catch(() => {})` calls silently swallow cache-write failures. If the storage quota is exceeded, offline support degrades with no diagnostic signal.

**Fix direction:**

```js
cache.put(req, netRes.clone()).catch((err) => console.warn('[SW] cache.put failed', err));
```

---

### 7. `fetch-loop.js` — `DEFAULTS` read live inside an async gap (race condition)

**Severity:** 🟠 Medium  
**File:** `src/app/fetch-loop.js` lines 79–95  
**Rule:** §12 (state management, race-condition guards)

**Problem:**  
`doRefresh` reads `DEFAULTS.STOP_ID`, `DEFAULTS.STATION_NAME`, `DEFAULTS.TRANSPORT_MODES`, `DEFAULTS.CLIENT_NAME`, and `DEFAULTS.API_URL` across `await` points without snapshotting them first:

```js
export async function doRefresh(listEl) {
  // ...
  let stopId = DEFAULTS.STOP_ID;               // read #1
  if (!stopId) {
    stopId = await lookupStopId({ stationName: DEFAULTS.STATION_NAME, … }); // AWAIT
  }
  const fresh = stopId
    ? await fetchDepartures({
        stopId,
        modes: DEFAULTS.TRANSPORT_MODES,       // read #2 — after first await
        apiUrl: DEFAULTS.API_URL,
        clientName: DEFAULTS.CLIENT_NAME,
      })
    : [];
```

During the first `await` (geocoder lookup), another module can mutate `DEFAULTS.STOP_ID` or `DEFAULTS.TRANSPORT_MODES` (e.g. the user changes station). The response will then be rendered against the **new** station's context while the data is actually for the **old** one. This is a classic TOCTOU race.

**Fix direction:**  
Snapshot all `DEFAULTS` values at the start of `doRefresh`, before the first `await`:

```js
export async function doRefresh(listEl) {
  if (fetchInFlight) return;
  fetchInFlight = true;
  // Snapshot before any await to prevent TOCTOU race
  const stopId0    = DEFAULTS.STOP_ID;
  const stationName = DEFAULTS.STATION_NAME;
  const modes      = DEFAULTS.TRANSPORT_MODES.slice();
  const apiUrl     = DEFAULTS.API_URL;
  const clientName = DEFAULTS.CLIENT_NAME;
  try {
    let stopId = stopId0 || await lookupStopId({ stationName, clientName });
    const fresh = stopId ? await fetchDepartures({ stopId, modes, apiUrl, clientName, … }) : [];
    …
  }
```

---

### 8. `options/index.js` — Dual `loadSettings()` call paths

**Severity:** 🟡 Low  
**File:** `src/ui/options/index.js` line 101  
**Rule:** §9 (reliability)

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
**File:** `src/config.js`; mutated in `handlers.js`, `url-import.js`, `app.js`, `settings.js`, `fetch-loop.js`  
**Rule:** §12 (unidirectional state mutations)

**Problem:**  
`DEFAULTS` is a plain exported object that is treated as shared mutable global state. Five modules write to it directly. This makes it impossible to statically track what holds the "source of truth" at any point in time and, combined with issue #7, creates race conditions during async operations. There is no immutability guarantee or access control.

**Fix direction:**  
Short-term: apply the snapshot fix from #7 everywhere `DEFAULTS` is read across an `await`. Long-term: introduce a dedicated `state.js` module with explicit `get/set` accessors that centralise mutation, making cross-module writes traceable.

---

### 12. `settings.js` — `saveSettings()` serialises the entire `DEFAULTS` object

**Severity:** 🟡 Low  
**File:** `src/app/settings.js` line 83  
**Rule:** §6 (data hygiene), §11 (data lifecycle)

**Problem:**  
`saveSettings()` serialises the entire `DEFAULTS` object:

```js
localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULTS));
```

`DEFAULTS` contains keys that should not be persisted: `CLIENT_NAME`, `API_URL`, and `GITHUB_URL` are runtime/config constants, not user preferences. If these are ever modified at runtime (e.g. a future feature override), they will be silently persisted and restored on reload, overriding the correct values from `config.js`. Additionally, serialising `null` for `STOP_ID` means a cleared station gets re-loaded as `null` instead of the `getDefaultStation()` fallback.

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

**Problem:**

```js
title.textContent = 'Kollektiv.Sanntid.org';
```

The `<h3>` panel title is a hardcoded string literal duplicated from the HTML `<title>` tag. All other panel labels use `t()` and are refreshed on language change. While this is a brand name (intentionally untranslated), having it as a bare string literal means a rename requires hunting across files.

**Fix direction:**  
Reference from `config.js` as a named constant. Add a comment explaining it is intentionally not translated:

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
**File:** `src/ui/departure.js` lines 131–142  
**Rule:** §9 (no silent failures)

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
**File:** `src/app.js` line 220  
**Rule:** §11 (resource lifecycle)

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
**File:** `src/app/scroll-more.js` lines 286–289  
**Rule:** §11 (resource lifecycle)

**Problem:**  
Three `window`-level listeners are attached by `initScrollMore`:

```js
window.addEventListener('mousemove', onPointerMove);
window.addEventListener('mouseup', onPointerEnd);
window.addEventListener('wheel', onWheel, { passive: true });
```

The `destroy()` method correctly removes them, but `scrollMoreRef` is **not** torn down in the `pagehide` handler in `app.js` (lines 211–218). The `pagehide` handler calls `destroy()` only for `stationDropdown` and `gpsRef`. If the page enters the BFCache and is restored, these three `window` listeners accumulate on every restore cycle.

**Fix direction:**  
See also issue #20. `app.js`'s `pagehide` handler must call `scrollMoreRef.current?.destroy()`.

---

### 20. `app.js` — `scrollMoreRef` not torn down in `pagehide`

**Severity:** 🟠 Medium  
**File:** `src/app.js` lines 211–218  
**Rule:** §11 (resource lifecycle)

**Problem:**  
The `pagehide` teardown handler destroys `stationDropdown` and `gpsRef`, but omits `scrollMoreRef`:

```js
window.addEventListener('pagehide', () => {
  if (_teardownBoard?.stationDropdown?.destroy) {
    _teardownBoard.stationDropdown.destroy();
  }
  if (_teardownGpsRef?.current?.destroy) {
    _teardownGpsRef.current.destroy();
  }
  // ← scrollMoreRef is never destroyed here
});
```

This leaves the `window.mousemove`, `window.mouseup`, and `window.wheel` listeners attached (see #19), plus the `maxHintTimer` and `wheelResetTimer` are not cleared on BFCache entry.

**Fix direction:**  
Add a module-level `_teardownScrollMoreRef` and wire it in `pagehide`:

```js
// app.js — module scope
let _teardownScrollMoreRef = null;

// inside init(), after scrollMore is created:
_teardownScrollMoreRef = scrollMoreRef;

// in pagehide handler:
if (_teardownScrollMoreRef?.current?.destroy) {
  _teardownScrollMoreRef.current.destroy();
}
```

---

## Notes

- Issues #7 and #11 are closely related: the snapshot fix for #7 is the concrete short-term mitigation for the broader mutable-`DEFAULTS` problem described in #11.
- Issues #19 and #20 are a single root-cause split across two files — fix together in one pass.
- Issues #1, #2, and #15 are trivial one-line merges; fix in the same commit as any other change to those files to avoid noisy standalone commits.
- Issues #4 and #5 are one-liner `console.warn` additions; fix together in a single pass.
- Issue #3 (`alert()`) is the highest-impact open issue: it blocks the entire JS thread including the 1-second departure countdown loop and the auto-refresh timer.
- Issue #12 (`saveSettings` serialising all of `DEFAULTS`) is a latent data-hygiene bug; no user-visible impact today but it will bite on any future addition of runtime-only keys to `DEFAULTS`.
