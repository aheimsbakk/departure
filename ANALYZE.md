# Code Analysis Report

**Generated:** 2026-03-13T00:00:00Z  
**Model:** github-copilot/claude-sonnet-4.6  
**Version analysed:** 1.38.1  
**Rules reference:** `agents/RULES.md`, `docs/PROJECT_RULES.md`

---

## Issue Index

| #                                                                               | File                         | Category                                                      | Severity  | Status   |
| ------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------- | --------- | -------- |
| [1](#1-handlersjs--fetchloop-race-in-applystation)                              | `src/app/handlers.js`        | Race condition: fetch/loop ordering                           | 🔴 High   | ✅ Fixed |
| [2](#2-scroll-morejs--preventdefault-without-cancelable-check)                  | `src/app/scroll-more.js`     | `preventDefault` without cancelable check                     | 🔴 High   | ✅ Fixed |
| [3](#3-gps-dropdownjs--gps-button-permanently-disabled-on-edge-case)            | `src/ui/gps-dropdown.js`     | Button left permanently disabled on geolocation edge case     | 🔴 High   | ✅ Fixed |
| [4](#4-sw-updaterjs--double-reload-from-orphaned-fallback-settimeout)           | `src/app/sw-updater.js`      | Double-reload: orphaned fallback `setTimeout`                 | 🟠 Medium | ✅ Fixed |
| [5](#5-station-dropdownjs--permanent-document-level-click-listener-leak)        | `src/ui/station-dropdown.js` | Permanent document-level `click` listener leak                | 🟠 Medium | ✅ Fixed |
| [6](#6-gps-dropdownjs--permanent-document-level-listener-leak)                  | `src/ui/gps-dropdown.js`     | Permanent document-level `click` + `keydown` listener leak    | 🟠 Medium | ✅ Fixed |
| [7](#7-sw-updaterjs--controllerchange-listener-never-removed)                   | `src/app/sw-updater.js`      | `controllerchange` listener never removed                     | 🟠 Medium | ✅ Fixed |
| [8](#8-share-buttonjs--stack-unsafe-spread-into-string-fromcharcode)            | `src/ui/share-button.js`     | Stack-unsafe `btoa(String.fromCharCode(...bytes))` spread     | 🟠 Medium | ✅ Fixed |
| [9](#9-departurejs--silent-catche-blocks-violate-rule-9)                        | `src/ui/departure.js`        | Silent `catch(e){}` blocks                                    | 🟡 Medium | ✅ Fixed |
| [10](#10-departurejs--dead-code-detectmode-duplicates-parserjs-logic)           | `src/ui/departure.js`        | Dead-code inline `detectMode()` + triplicated `emojiForMode`  | 🟡 Medium | ✅ Fixed |
| [11](#11-settingsjs--no-schema-validation-on-localstorage-merge)                | `src/app/settings.js`        | No schema validation on `localStorage` merge                  | 🟡 Medium | ✅ Fixed |
| [12](#12-optionsindexjs--dual-loadsettings-paths-risk-silent-divergence)        | `src/ui/options/index.js`    | Dual `loadSettings()` call paths risk silent divergence       | 🟡 Low    | 🔴 Open  |
| [13](#13-uijs--footer-factory-inlined-in-createboardelements)                   | `src/ui/ui.js`               | Footer factory inlined in `createBoardElements` — Rule §8 §13 | 🟡 Low    | 🔴 Open  |
| [14](#14-gps-dropdownjs--innerhtml---does-not-explicitly-remove-item-listeners) | `src/ui/gps-dropdown.js`     | `innerHTML = ''` doesn't explicitly remove item listeners     | 🟡 Low    | 🔴 Open  |
| [15](#15-configjs--mutable-exported-defaults-used-as-global-state)              | `src/config.js`              | Mutable exported `DEFAULTS` as global mutable state           | 🟡 Low    | 🔴 Open  |
| [16](#16-swjs--empty-catch-in-fetch-handler)                                    | `src/sw.js`                  | Empty `.catch(()=>{})` in service worker fetch handler        | 🟡 Low    | 🔴 Open  |
| [17](#17-sitemapxml--lastmod-not-updated-on-release)                            | `src/sitemap.xml`            | `<lastmod>` not updated on release                            | 🟡 Low    | 🔴 Open  |
| [18](#18-share-buttonjs--alert-blocks-ui-thread)                                | `src/ui/share-button.js`     | `alert()` calls block UI thread — Rule §9                     | 🟡 Low    | 🔴 Open  |
| [19](#19-optionsindexjs--panel-title-hardcoded-not-translated)                  | `src/ui/options/index.js`    | Panel `<h3>` title hardcoded, not using `t()`                 | 🟡 Low    | 🔴 Open  |
| [20](#20-geocoderjs--searchstations-silently-swallows-all-errors)               | `src/entur/geocoder.js`      | Outer `catch` swallows all errors silently — Rule §9          | 🟡 Low    | 🔴 Open  |
| [21](#21-gps-searchjs--fetchnearbystops-silently-swallows-all-errors)           | `src/entur/gps-search.js`    | Outer `catch` swallows all errors silently — Rule §9          | 🟡 Low    | 🔴 Open  |
| [22](#22-appjs--duplicate-import-statement-for-fetch-loopjs)                    | `src/app.js`                 | Two separate `import` statements from the same module         | 🟢 Minor  | 🔴 Open  |
| [23](#23-handlersjs--duplicate-import-statement-for-fetch-loopjs)               | `src/app/handlers.js`        | Two separate `import` statements from `fetch-loop.js`         | 🟢 Minor  | 🔴 Open  |

---

## Fixed Issues (v1.38.1)

### 1. `handlers.js` — Fetch/loop race in `applyStation`

**Fixed in v1.38.1.** `startRefreshLoop` is now called _before_ `doRefresh` at `handlers.js` lines 100–101. The `doRefresh` `finally` counter-reset is now harmless because `startRefreshLoop` already owns the counter.

---

### 2. `scroll-more.js` — `preventDefault` without cancelable check

**Fixed in v1.38.1.** `onPointerDown` now correctly guards with `if (!e.touches && e.cancelable) e.preventDefault()` at line 212.

---

### 3. `gps-dropdown.js` — GPS button permanently disabled on edge case

**Fixed in v1.38.1.** A 12-second hard-fallback `setTimeout` (`geoFallbackId`) re-enables the button and shows an error message if neither geolocation callback fires within that window (lines 153–158).

---

### 4. `sw-updater.js` — Double-reload from orphaned fallback `setTimeout`

**Fixed in v1.38.1.** `_fallbackReloadId` is stored at module scope (line 30). The `controllerchange` handler calls `clearTimeout(_fallbackReloadId)` before reloading (line 115), preventing the double-reload.

---

### 5. `station-dropdown.js` — Permanent document-level `click` listener leak

**Fixed in v1.38.1.** `app.js` now wires a `pagehide` handler (lines 211–218) that calls `_teardownBoard.stationDropdown.destroy()`.

---

### 6. `gps-dropdown.js` — Permanent document-level listener leak

**Fixed in v1.38.1.** Same `pagehide` handler in `app.js` calls `_teardownGpsRef.current.destroy()`.

---

### 7. `sw-updater.js` — `controllerchange` listener never removed

**Fixed in v1.38.1.** `{ once: true }` added to the `addEventListener` call (line 108), ensuring the handler is automatically removed after its first fire.

---

### 8. `share-button.js` — Stack-unsafe spread into `String.fromCharCode`

**Fixed in v1.38.1.** Replaced with a safe `for...of` loop at lines 22–23.

---

### 9. `departure.js` — Silent `catch(e){}` blocks

**Fixed in v1.38.1.** The entire `detectMode()` closure was removed (see #10).

---

### 10. `departure.js` — Dead-code `detectMode()` + triplicated `emojiForMode`

**Fixed in v1.38.1.** `detectMode()` removed entirely; `emojiForMode` / `labelForMode` consolidated into `src/ui/mode-utils.js` and imported by all consumers.

---

### 11. `settings.js` — No schema validation on `localStorage` merge

**Fixed in v1.38.1.** Full allowlist validation with type/range checks now in place.

---

## Open Issues

---

### 12. `options/index.js` — Dual `loadSettings()` paths risk silent divergence

**Severity:** 🟡 Low  
**File:** `src/ui/options/index.js` line 101  
**Rule:** §9

**Problem:**  
`app.js` calls `app/settings.js:loadSettings()` at startup, merging `localStorage` into `DEFAULTS`. Then `options/index.js` line 101 calls `ui/options/settings-store.js:loadSettings()` — a _different_ function that also reads the same `localStorage` key. Two separate read paths to the same key: if one fails (e.g. `SecurityError` in private browsing under quota), the panel could display stale defaults while `DEFAULTS` already has updated values.

**Fix direction:**  
Remove the `loadSettings()` call in `options/index.js`; read initial field values from the `defaults` parameter directly (it is already the merged `DEFAULTS` object).

---

### 13. `ui.js` — Footer factory inlined in `createBoardElements`

**Severity:** 🟡 Low  
**File:** `src/ui/ui.js`  
**Rule:** §8 (SRP), §13 (anti-monolith)

**Problem:**  
`createBoardElements` assembles board scaffolding _and_ builds a two-line footer with its own DOM structure and `updateFooterTranslations` export. Footer construction is a distinct responsibility.

**Fix direction:**  
Extract `createFooter()` into `src/ui/footer.js`. `createBoardElements` calls `createFooter()` and returns its result in the `board` object.

---

### 14. `gps-dropdown.js` — `innerHTML = ''` does not explicitly remove item listeners

**Severity:** 🟡 Low  
**File:** `src/ui/gps-dropdown.js` lines 79, 85, 224  
**Rule:** §11 (resource lifecycle)

**Problem:**  
`closeDropdown()`, `openWith()`, and `destroy()` all use `menu.innerHTML = ''` to clear items. Each `buildStopItem` attaches a `click` listener to a `<button>` that closes over `closeDropdown`. Setting `innerHTML = ''` removes DOM nodes without explicitly calling `removeEventListener`. The closure chain keeps the component reachable until GC — not synchronously freed, contrary to Rule §11.

**Fix direction:**  
Switch to event delegation: attach a single `click` listener on the `menu` element itself rather than per-item. Or iterate `menu.children` and remove listeners before clearing.

---

### 15. `config.js` — Mutable exported `DEFAULTS` used as global mutable state

**Severity:** 🟡 Low  
**File:** `src/config.js`; mutated in `handlers.js`, `url-import.js`, `app.js`  
**Rule:** §12 (unidirectional state mutations)

**Problem:**  
`DEFAULTS` is a plain exported object mutated by five modules. During async gaps (between `doRefresh` `await` points), another module can mutate `DEFAULTS.STOP_ID` while a fetch is in flight with the old ID — the response lands against the new ID. `doRefresh` reads `DEFAULTS.STOP_ID` and `DEFAULTS.TRANSPORT_MODES` live (not snapshotted before the `await`).

**Fix direction:**  
Snapshot values at the start of async functions:

```js
// fetch-loop.js — top of doRefresh
const stopId = DEFAULTS.STOP_ID;
const modes = DEFAULTS.TRANSPORT_MODES.slice();
```

---

### 16. `sw.js` — Empty `.catch(()=>{})` in fetch handler

**Severity:** 🟡 Low  
**File:** `src/sw.js` lines 128, 161  
**Rule:** §9 (no silent failures)

**Problem:**  
Two `cache.put(req, netRes.clone()).catch(() => {})` calls silently swallow cache-write failures (e.g. storage quota exceeded). If caching fails consistently, offline support degrades silently with no diagnostic signal.

**Fix direction:**

```js
cache.put(req, netRes.clone()).catch((err) => console.warn('[SW] cache.put failed', err));
```

---

### 17. `sitemap.xml` — `<lastmod>` not updated on release

**Severity:** 🟡 Low  
**File:** `src/sitemap.xml`  
**Rule:** `docs/PROJECT_RULES.md` §1

**Problem:**  
`docs/PROJECT_RULES.md` §1 requires updating `<lastmod>` whenever files under `src/` are changed and released. This has been missed across recent releases. `CONTEXT.md` acknowledges it but it is not automated.

**Fix direction:**  
Add a `sed` line to `scripts/bump-version.sh` that updates `<lastmod>` to today's date, or add a validation check in `scripts/validate-worklog.sh`.

---

### 18. `share-button.js` — `alert()` calls block the UI thread

**Severity:** 🟡 Low  
**File:** `src/ui/share-button.js` lines 197, 203  
**Rule:** §9 (graceful degradation)

**Problem:**  
Two `alert()` calls are used for error states ("no station to share" and "encode failed"). `alert()` is a synchronous, blocking, UI-thread modal — it suspends JavaScript execution and freezes all timers (including the 1-second refresh loop). On mobile browsers it can trigger browser-level permission dialogs. It is also not translatable via `t()`.

**Affected code:**

```js
// share-button.js line 197
alert(t('noStationToShare'));

// share-button.js line 203
alert(t('shareFailed'));
```

**Fix direction:**  
Replace with non-blocking inline error feedback — e.g. temporarily update `button.textContent` to an error emoji/string, or call the existing `lifecycle.showToast()` pattern from the options panel. Both paths are already available in the codebase.

---

### 19. `options/index.js` — Panel title hardcoded, not using `t()`

**Severity:** 🟡 Low  
**File:** `src/ui/options/index.js` line 25  
**Rule:** §21 (synchronized docs / i18n)

**Problem:**

```js
title.textContent = 'Kollektiv.Sanntid.org';
```

The `<h3>` panel title is a hardcoded English/brand string and is never updated when the language changes. All other panel labels use `t()` and are refreshed by `updateTranslations`. This is inconsistent and not i18n-aware (though in this case the string is a proper noun / brand name, so translation may be intentionally omitted — however it should at minimum be a named constant in `config.js`).

**Fix direction:**  
Move the string to `config.js` as `DEFAULTS.APP_NAME` or a top-level constant, and reference it from there. If it is intentionally untranslated (brand name), add a comment explaining the decision.

---

### 20. `geocoder.js` — `searchStations` silently swallows all errors

**Severity:** 🟡 Low  
**File:** `src/entur/geocoder.js`  
**Rule:** §9 (no silent failures)

**Problem:**  
The outer `catch` in `searchStations` returns `[]` for _any_ failure — including unexpected runtime errors — with no logging:

```js
} catch (_) {
  return [];
}
```

Network timeouts, JSON parse errors, and programming mistakes are all indistinguishable from "no results". Autocomplete silently stops working with no diagnostic.

**Fix direction:**

```js
} catch (err) {
  console.warn('searchStations failed', err);
  return [];
}
```

---

### 21. `gps-search.js` — `fetchNearbyStops` silently swallows all errors

**Severity:** 🟡 Low  
**File:** `src/entur/gps-search.js`  
**Rule:** §9 (no silent failures)

**Problem:**  
Same pattern as #20. The outer `catch` returns `[]` with no `console.warn`:

```js
} catch (_) {
  return [];
}
```

The GPS dropdown already has a `catch` in `gps-dropdown.js` that logs and shows an error message to the user — but if `fetchNearbyStops` itself silently eats the error and returns `[]`, the dropdown shows "no results" instead of the error state, hiding the real failure.

**Fix direction:**  
Re-throw (or at minimum `console.warn`) so the calling code in `gps-dropdown.js` can handle it correctly:

```js
} catch (err) {
  console.warn('fetchNearbyStops failed', err);
  return [];
}
```

---

### 22. `app.js` — Duplicate `import` statements from `fetch-loop.js`

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

This is redundant; ES modules deduplicate the module instance, so it is not a runtime bug — but it violates the single-import-per-module convention and signals a drive-by addition.

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

### 23. `handlers.js` — Duplicate `import` statement from `fetch-loop.js`

**Severity:** 🟢 Minor  
**File:** `src/app/handlers.js` lines 23–24  
**Rule:** §8 (code hygiene)

**Problem:**  
Same pattern as #22:

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

## Notes

- Issues #12, #15 interact: fixing #15 (snapshot `DEFAULTS` in async functions) makes #12 (dual load paths) safer but does not eliminate it.
- Issues #20, #21 are low-effort one-liners; fix together in a single pass.
- Issues #22, #23 are trivial cosmetic fixes; address in the same commit as any other `app.js`/`handlers.js` change to avoid a noisy standalone commit.
- Issue #18 (`alert()`) is the highest-impact open issue: it blocks the JS thread and breaks all running timers including the 1-second departure countdown loop.
