# Code Analysis Report

**Generated:** 2026-03-13T19:56:27Z  
**Model:** github-copilot/claude-sonnet-4.6  
**Version analysed:** 1.38.0  
**Rules reference:** `agents/RULES.md`, `docs/PROJECT_RULES.md`

---

## Issue Index

| #                                                                               | File                         | Category                                                                     | Severity  |
| ------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------- | --------- |
| [1](#1-handlersjs--fetchloop-race-in-applystation)                              | `src/app/handlers.js`        | Race condition: fetch/loop ordering                                          | 🔴 High   |
| [2](#2-scroll-morejs--preventdefault-without-cancelable-check)                  | `src/app/scroll-more.js`     | `preventDefault` without cancelable check on mousedown                       | 🔴 High   |
| [3](#3-gps-dropdownjs--gps-button-permanently-disabled-on-edge-case)            | `src/ui/gps-dropdown.js`     | Button left permanently disabled on geolocation edge case                    | 🔴 High   |
| [4](#4-sw-updaterjs--double-reload-from-orphaned-fallback-settimeout)           | `src/app/sw-updater.js`      | Double-reload: orphaned fallback `setTimeout` fires after `controllerchange` | 🟠 Medium |
| [5](#5-station-dropdownjs--permanent-document-level-click-listener-leak)        | `src/ui/station-dropdown.js` | Permanent document-level `click` listener leak — no teardown wired           | 🟠 Medium |
| [6](#6-gps-dropdownjs--permanent-document-level-listener-leak)                  | `src/ui/gps-dropdown.js`     | Permanent document-level `click` + `keydown` listener leak                   | 🟠 Medium |
| [7](#7-sw-updaterjs--controllerchange-listener-never-removed)                   | `src/app/sw-updater.js`      | `controllerchange` listener never removed                                    | 🟠 Medium |
| [8](#8-share-buttonjs--stack-unsafe-spread-into-string-fromcharcode)            | `src/ui/share-button.js`     | Stack-unsafe `btoa(String.fromCharCode(...bytes))` spread                    | 🟠 Medium |
| [9](#9-departurejs--silent-catche-blocks-violate-rule-9)                        | `src/ui/departure.js`        | Silent `catch(e){}` blocks — violates Rule §9                                | 🟡 Medium |
| [10](#10-departurejs--dead-code-detectmode-duplicates-parserjs-logic)           | `src/ui/departure.js`        | Dead-code inline `detectMode()` duplicates `entur/modes.js` — Rule §8 §13    | 🟡 Medium |
| [11](#11-settingsjs--no-schema-validation-on-localstorage-merge)                | `src/app/settings.js`        | No schema validation on `localStorage` merge — Rule §5                       | 🟡 Medium |
| [12](#12-optionsindexjs--dual-loadsettings-paths-risk-silent-divergence)        | `src/ui/options/index.js`    | Dual `loadSettings()` call paths risk silent divergence                      | 🟡 Low    |
| [13](#13-uijs--footer-factory-inlined-in-createboardelements-violates-rule-13)  | `src/ui/ui.js`               | Footer factory inlined in `createBoardElements` — Rule §8 §13                | 🟡 Low    |
| [14](#14-gps-dropdownjs--innerhtml---does-not-explicitly-remove-item-listeners) | `src/ui/gps-dropdown.js`     | `innerHTML = ''` doesn't explicitly remove item listeners — Rule §11         | 🟡 Low    |
| [15](#15-configjs--mutable-exported-defaults-used-as-global-state)              | `src/config.js`              | Mutable exported `DEFAULTS` used as global mutable state — Rule §12          | 🟡 Low    |
| [16](#16-swjs--empty-catch-in-fetch-handler)                                    | `src/sw.js`                  | Empty `.catch(()=>{})` in service worker fetch handler — Rule §9             | 🟡 Low    |
| [17](#17-sitemapxml--lastmod-not-updated-on-release)                            | `src/sitemap.xml`            | `<lastmod>` not updated on release — PROJECT_RULES §1                        | 🟡 Low    |
| [18](#18-departurejs--triplicated-mode-mapping-dry-violation)                   | `src/ui/departure.js`        | Triplicated mode-to-display mapping — DRY / Rule §8                          | 🟡 Low    |

---

## Detailed Issues

---

### 1. `handlers.js` — Fetch/loop race in `applyStation`

**Severity:** 🔴 High  
**File:** `src/app/handlers.js` lines 85–87  
**Rule:** §12 (race-condition guards)

**Problem:**  
`applyStation()` chains `doRefresh().finally(() => startRefreshLoop())`. Both functions write `ticksUntilRefresh`:

- `doRefresh` resets it to `DEFAULTS.FETCH_INTERVAL` in its own `finally` block (`fetch-loop.js` line 105).
- `startRefreshLoop` also resets it to `DEFAULTS.FETCH_INTERVAL` (line 124) and starts a new `setInterval`.

If `doRefresh` completes _after_ `startRefreshLoop` has already started the new interval and the first tick has decremented the counter, the `doRefresh` `finally` resets the counter again. The result: the "update in X" status chip can jump to the full interval value unexpectedly mid-tick. The same pattern is used in `onApplySettings` (line 168).

**Root cause:** Two writers to `ticksUntilRefresh` in the same async chain, with no lock or sequencing guarantee.

**Affected code:**

```js
// handlers.js lines 85-87
doRefresh(board.list)
  .catch((err) => console.warn('Station change refresh failed', err))
  .finally(() => startRefreshLoop(board.list, board.status));
```

```js
// fetch-loop.js lines 104-106 (inside doRefresh finally)
ticksUntilRefresh = DEFAULTS.FETCH_INTERVAL;
lastFetchAt = Date.now();
fetchInFlight = false;
```

**Fix direction:**  
`startRefreshLoop` should be called _before_ `doRefresh`, or `doRefresh` should not reset `ticksUntilRefresh` when it is being called as part of a loop restart. Alternatively, pass a flag to `doRefresh` to suppress counter reset when the caller will restart the loop.

---

### 2. `scroll-more.js` — `preventDefault` without cancelable check on mousedown

**Severity:** 🔴 High  
**File:** `src/app/scroll-more.js` line 212  
**Rule:** §12 (concurrency/event safety)

**Problem:**  
`onPointerDown` calls `e.preventDefault()` unconditionally on mouse events:

```js
if (!e.touches) e.preventDefault();
```

`mousedown` is typically cancelable, but calling `preventDefault()` on a non-cancelable event throws a warning/error in some browsers. More critically, `onPointerMove` already correctly guards with `if (e.cancelable && rawPullDistance > 10)` — `onPointerDown` should be consistent.

Additionally, `boardEl.addEventListener('mousedown', onPointerDown)` is registered **without** `{ passive: false }`, yet `preventDefault()` is called inside it. Browsers that infer passiveness may ignore the call silently.

**Affected code:**

```js
// scroll-more.js line 212
if (!e.touches) e.preventDefault();
```

**Fix direction:**  
Replace with `if (!e.touches && e.cancelable) e.preventDefault();` and add `{ passive: false }` to the `mousedown` registration (line 285).

---

### 3. `gps-dropdown.js` — GPS button permanently disabled on edge case

**Severity:** 🔴 High  
**File:** `src/ui/gps-dropdown.js` lines 139, 162, 168  
**Rule:** §9 (graceful degradation)

**Problem:**  
`btn.disabled = true` is set before calling `getCurrentPosition()`. Both the success and error callbacks re-enable the button (`btn.disabled = false`). However, `getCurrentPosition` is called with `{ timeout: 10000 }` — if the underlying platform silently swallows the request (e.g. the system-level permission dialog is dismissed via OS rather than browser), neither callback fires and the button stays permanently disabled for the session.

Additionally, if `fetchNearbyStops` throws inside the success callback (line 146), the `try/catch` on line 158 does re-enable the button — this path is covered. But the error callback on line 164 only runs for `PositionError` objects; it does not run for an unhandled rejection from the geolocation API itself.

**Affected code:**

```js
// gps-dropdown.js lines 139-171
btn.disabled = true;
openWith([statusNode(t('gpsLocating'))]);

navigator.geolocation.getCurrentPosition(
  async (pos) => { ... btn.disabled = false; },
  (err)       => { ... btn.disabled = false; },
  { timeout: 10000, maximumAge: 60000 }
);
```

**Fix direction:**  
Add a hard-fallback `setTimeout` (e.g. 12 000 ms, slightly longer than `timeout: 10000`) that re-enables the button and shows an error message if neither callback has fired by then. Clear it in both callbacks.

---

### 4. `sw-updater.js` — Double-reload from orphaned fallback `setTimeout`

**Severity:** 🟠 Medium  
**File:** `src/app/sw-updater.js` lines 79–81  
**Rule:** §11 (resource lifecycle), §9 (unexpected behaviour)

**Problem:**  
After `skipWaiting` is sent, a 2-second fallback `setTimeout(reloadWithCacheBust, 2000)` is registered. The intent is to reload if `controllerchange` never fires. However, `controllerchange` normally fires within milliseconds of `skipWaiting`, triggering `reloadWithCacheBust()` immediately. The `setTimeout` is **not cancelled** after the `controllerchange` handler runs — so the page reloads a second time 2 seconds after the first reload, disrupting the user.

```js
// sw-updater.js lines 74-81
const worker = reg.waiting;
if (worker) {
  worker.postMessage({ type: 'SKIP_WAITING' });
}
// Fallback reload — never cancelled if controllerchange fires first
setTimeout(reloadWithCacheBust, 2000);
```

The `reloading` guard in the `controllerchange` listener (line 97) prevents the second call _in the same page_, but after the first reload the guard is gone because it's a new page context.

**Fix direction:**  
Store the `setTimeout` ID and cancel it inside the `controllerchange` handler:

```js
let fallbackId = null;
navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (reloading) return;
  reloading = true;
  clearTimeout(fallbackId); // cancel the fallback
  reloadWithCacheBust();
});
// ...
fallbackId = setTimeout(reloadWithCacheBust, 2000);
```

---

### 5. `station-dropdown.js` — Permanent document-level `click` listener leak

**Severity:** 🟠 Medium  
**File:** `src/ui/station-dropdown.js` lines 398, 409–413  
**Rule:** §11 (memory/resource lifecycle)

**Problem:**  
`createStationDropdown` registers a document-level outside-click handler:

```js
document.addEventListener('click', _onDocClick);
```

`destroy()` is defined on the container and correctly removes this listener. However, `app.js` never calls `stationDropdown.destroy()` — not on station change, not on BFCache restore (`location.reload()` at `app.js` line 179). In Chrome, BFCache preserves document-level listeners across `location.reload()` in some configurations, meaning each reload can accumulate a new listener without the old one being removed.

Even without BFCache, the listener outlives its useful scope when the dropdown is replaced.

**Affected code:**

```js
// station-dropdown.js line 398
document.addEventListener('click', _onDocClick);

// app.js — no destroy() call anywhere in the lifecycle
```

**Fix direction:**  
Call `board.stationDropdown.destroy()` before replacing or reloading. Since BFCache triggers a `location.reload()`, ensure `destroy()` is called in a `beforeunload` or `pagehide` handler in `app.js`.

---

### 6. `gps-dropdown.js` — Permanent document-level listener leak

**Severity:** 🟠 Medium  
**File:** `src/ui/gps-dropdown.js` lines 189–190, `src/app/gps-bar.js`  
**Rule:** §11 (memory/resource lifecycle)

**Problem:**  
`createGpsButton` registers two document-level listeners:

```js
document.addEventListener('click', _onDocClick);
document.addEventListener('keydown', _onKeyDown);
```

`container.destroy()` removes them, but `buildGpsBar()` in `gps-bar.js` never calls `gpsContainer.destroy()` and `app.js` never wires a teardown for `gpsRef.current`. The same BFCache / accumulation concern as issue #5 applies.

**Fix direction:**  
Same as #5: add a `pagehide`/`beforeunload` teardown in `app.js` that calls `gpsRef.current.destroy()`.

---

### 7. `sw-updater.js` — `controllerchange` listener never removed

**Severity:** 🟠 Medium  
**File:** `src/app/sw-updater.js` lines 96–100  
**Rule:** §11 (resource lifecycle)

**Problem:**

```js
navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (reloading) return;
  reloading = true;
  reloadWithCacheBust();
});
```

This listener is added every time `registerServiceWorker()` is called and is never removed. `registerServiceWorker()` is only called once in the current app, so in production this is harmless. However, the `reloading` flag is declared inside `registerServiceWorker`'s scope — a second call (e.g. in tests or future refactors) would create a second independent listener with its own `reloading = false`, causing double reloads.

**Fix direction:**  
Store the handler reference and use `{ once: true }` or `removeEventListener` after it fires:

```js
const onControllerChange = () => {
  if (reloading) return;
  reloading = true;
  clearTimeout(fallbackId);
  reloadWithCacheBust();
};
navigator.serviceWorker.addEventListener('controllerchange', onControllerChange, { once: true });
```

---

### 8. `share-button.js` — Stack-unsafe spread into `String.fromCharCode`

**Severity:** 🟠 Medium  
**File:** `src/ui/share-button.js` line 23  
**Rule:** §9 (prevent app crashes)

**Problem:**

```js
const base64 = btoa(String.fromCharCode(...bytes));
```

Spreading a `Uint8Array` as function arguments passes each byte as a separate argument. JavaScript engines have a maximum argument count (V8: ~65 536, SpiderMonkey: ~500 000). For the current small JSON payload this is safe, but the station name is user-controlled input — a maliciously or accidentally long station name could produce a `Uint8Array` large enough to throw `RangeError: Maximum call stack size exceeded`.

**Fix direction:**  
Use a safe loop instead:

```js
let binary = '';
for (const b of bytes) binary += String.fromCharCode(b);
const base64 = btoa(binary);
```

---

### 9. `departure.js` — Silent `catch(e){}` blocks violate Rule §9

**Severity:** 🟡 Medium  
**File:** `src/ui/departure.js` lines 82, 89  
**Rule:** §9 (no silent failures)

**Problem:**  
Inside the recursive `detectMode()` object walker, two property accesses are wrapped in silent catch blocks:

```js
try { const val = cur[k]; ... } catch(e) {}
// ...
try { stack.push(cur[k]); } catch(e) {}
```

Silent swallowing of errors makes bugs invisible. If a getter on an API object throws (e.g. a Proxy), the failure is undetectable.

**Fix direction:**  
Replace with `catch(e) { /* property access on exotic object — skip */ }` at minimum, or `catch(e) { console.warn('detectMode: property access failed', e); }` for visibility.

---

### 10. `departure.js` — Dead-code inline `detectMode()` duplicates `entur/modes.js`

**Severity:** 🟡 Medium  
**File:** `src/ui/departure.js` lines 23–94  
**Rule:** §8 (SRP), §13 (anti-monolith)

**Problem:**  
`createDepartureNode` contains a 70-line self-contained `detectMode()` closure that recursively walks `item.raw` looking for transport mode tokens. The `entur/parser.js` module **already** does this via `detectModeFromRaw(call)` from `entur/modes.js` and sets `item.mode` on every parsed departure. The path `item.mode` → `item.transportMode` → raw-scan is hit in `departure.js` lines 26–28, but for any data from `fetchDepartures`, `item.mode` will always be set by the parser.

The entire raw-scan fallback in `departure.js` is therefore dead code for the normal data path. It only executes for hypothetical externally-constructed departure objects that bypass the parser.

Additionally, `emojiForMode()` in `departure.js` is a third copy of mode→emoji mapping that already exists in `station-dropdown.js:getModeIcon` and `ui/options/transport-modes.js:emojiForMode`.

**Fix direction:**

1. Remove the raw-scan fallback from `departure.js`; trust `item.mode` from the parser.
2. Extract the shared `emojiForMode()` logic into a utility in `src/ui/mode-utils.js` (or `src/entur/modes.js`) and import it in all three consumers.

---

### 11. `settings.js` — No schema validation on `localStorage` merge

**Severity:** 🟡 Medium  
**File:** `src/app/settings.js` line 31  
**Rule:** §5 (validate all external inputs)

**Problem:**

```js
if (saved) Object.assign(DEFAULTS, JSON.parse(saved));
```

`localStorage` is an external, user-controlled input. This blindly merges any key from the stored JSON into the global `DEFAULTS` object. A tampered or corrupt entry (e.g. from a browser extension, XSS, or old app version with a different schema) can:

- Inject unexpected keys (e.g. `__proto__`, `constructor`) — prototype pollution risk.
- Overwrite non-settings keys if `DEFAULTS` ever gains non-serialisable fields.
- Set `FETCH_INTERVAL` to `0` or a negative value, breaking the refresh loop.

**Fix direction:**  
Allowlist only known keys and validate their types/ranges before merging:

```js
const ALLOWED_KEYS = [
  'STATION_NAME',
  'STOP_ID',
  'NUM_DEPARTURES',
  'FETCH_INTERVAL',
  'TRANSPORT_MODES',
  'TEXT_SIZE',
];
const parsed = JSON.parse(saved);
for (const key of ALLOWED_KEYS) {
  if (Object.prototype.hasOwnProperty.call(parsed, key)) {
    DEFAULTS[key] = parsed[key]; // add type/range checks per key
  }
}
```

---

### 12. `options/index.js` — Dual `loadSettings()` paths risk silent divergence

**Severity:** 🟡 Low  
**File:** `src/ui/options/index.js` line 101  
**Rule:** §9

**Problem:**  
`app.js` calls `app/settings.js:loadSettings()` at startup, which merges `localStorage` into `DEFAULTS`. Later, `options/index.js` calls `ui/options/settings-store.js:loadSettings()` — a _different function_ that also reads from `localStorage` and returns the parsed object for populating panel fields.

These are two separate read paths to the same `localStorage` key (`departure:settings`). If one succeeds and the other fails (e.g. a `localStorage` `SecurityError` thrown between the two calls — possible in private browsing when storage is filled), the panel could display stale defaults while `DEFAULTS` has already been updated, or vice versa.

**Fix direction:**  
The options panel should read its initial values from the already-resolved `DEFAULTS` object (passed as `defaults` parameter) rather than re-reading `localStorage`. The `settings-store.js:loadSettings()` call in `options/index.js` is redundant since `defaults` already contains the merged values.

---

### 13. `ui.js` — Footer factory inlined in `createBoardElements` violates Rule §8 §13

**Severity:** 🟡 Low  
**File:** `src/ui/ui.js` lines 39–63  
**Rule:** §8 (SRP), §13 (anti-monolith)

**Problem:**  
`createBoardElements` (lines 6–71) assembles the board container, the station dropdown row, the status chip, and also constructs a two-line footer with links. The footer is a distinct UI component with its own DOM structure, translation update function (`updateFooterTranslations`), and links. It has no structural coupling to the board layout.

The function is approaching the 100-line mark and takes on two responsibilities: board scaffolding and footer creation.

**Fix direction:**  
Extract a `createFooter()` factory function into its own file (`src/ui/footer.js`) or at minimum as a separate exported function within `ui.js`. `createBoardElements` should call `createFooter()` and return its result in the `board` object.

---

### 14. `gps-dropdown.js` — `innerHTML = ''` does not explicitly remove item listeners

**Severity:** 🟡 Low  
**File:** `src/ui/gps-dropdown.js` lines 71, 202  
**Rule:** §11 (resource lifecycle)

**Problem:**

```js
menu.innerHTML = ''; // in closeDropdown() and destroy()
```

Each `buildStopItem` call attaches a `click` listener to a `<button>` that closes over the `closeDropdown` function. Setting `innerHTML = ''` removes the DOM nodes without explicitly calling `removeEventListener`. While modern engines GC listener references when nodes are detached and unreachable, the closure chain (`listener → closeDropdown → isOpen → btn → menu`) keeps the entire GPS component reachable until GC runs.

In `destroy()`, this means the menu nodes and their listeners are not synchronously freed — contrary to Rule §11 which requires explicit cleanup.

**Fix direction:**  
Before clearing, iterate `menu.children` and explicitly remove listeners, or switch from inline `addEventListener` in `buildStopItem` to event delegation on the `menu` element with a single shared listener.

---

### 15. `config.js` — Mutable exported `DEFAULTS` used as global mutable state

**Severity:** 🟡 Low  
**File:** `src/config.js` lines 5–15; mutated in `handlers.js`, `url-import.js`, `app.js`  
**Rule:** §12 (unidirectional state mutations)

**Problem:**  
`DEFAULTS` is a plain exported object that is directly mutated by at least five modules. This is a module-level shared mutable singleton:

```js
// handlers.js
DEFAULTS.STATION_NAME = station.name;
DEFAULTS.STOP_ID = station.stopId;

// url-import.js
DEFAULTS.STATION_NAME = shared.stationName;

// app.js
DEFAULTS.TRANSPORT_MODES = favorites[0].modes;
```

Rule §12 requires unidirectional state mutations. During async gaps (e.g. between `doRefresh` await points), another caller can mutate `DEFAULTS.STOP_ID` while a fetch is in flight with the old ID — the fetch will complete with the new ID as the "current" value but the response corresponds to the old stop.

**Fix direction:**  
For a no-build SPA, a pragmatic improvement is to snapshot `DEFAULTS` values into local constants at the start of each async function so mutations mid-flight don't affect the in-progress operation:

```js
// fetch-loop.js doRefresh — snapshot before await
const stopId = DEFAULTS.STOP_ID;
const modes = DEFAULTS.TRANSPORT_MODES.slice();
```

This is already partially done in `fetchDepartures` (options are passed in), but `doRefresh` reads `DEFAULTS` live before each call.

---

### 16. `sw.js` — Empty `.catch(()=>{})` in service worker fetch handler

**Severity:** 🟡 Low  
**File:** `src/sw.js` line 114  
**Rule:** §9 (no silent failures)

**Problem:**

```js
cache.put(req, netRes.clone()).catch(() => {});
```

The empty catch silently swallows cache write failures (e.g. storage quota exceeded). If caching fails consistently, the app continues operating but offline support silently degrades without any diagnostic signal.

**Fix direction:**

```js
cache.put(req, netRes.clone()).catch((err) => console.warn('[SW] cache.put failed', err));
```

---

### 17. `sitemap.xml` — `<lastmod>` not updated on release

**Severity:** 🟡 Low  
**File:** `src/sitemap.xml`  
**Rule:** PROJECT_RULES.md §1

**Problem:**  
`docs/PROJECT_RULES.md` §1 states: _"Whenever any file under `src/` is changed and released, update the `<lastmod>` date in `src/sitemap.xml`."_ The current `CONTEXT.md` also acknowledges this: _"Update src/sitemap.xml `<lastmod>` on release."_

This has been missed across recent releases (v1.37.34 → v1.38.0).

**Fix direction:**  
Add `src/sitemap.xml` to the explicit checklist in `scripts/bump-version.sh` so it is automatically updated on every version bump, or add a validation step in `scripts/validate-worklog.sh` that checks the `<lastmod>` date against today's date.

---

### 18. `departure.js` — Triplicated mode-to-display mapping

**Severity:** 🟡 Low  
**File:** `src/ui/departure.js` lines 46–51, 96–106, 200–210; also `src/ui/station-dropdown.js:getModeIcon`, `src/ui/options/transport-modes.js:emojiForMode`  
**Rule:** §8 (DRY / SRP)

**Problem:**  
The mapping of transport mode string → emoji and mode string → readable label is implemented three or more times independently:

| Location                      | Function         | Maps                 |
| ----------------------------- | ---------------- | -------------------- |
| `departure.js` line 96        | `emojiForMode()` | mode → emoji         |
| `departure.js` line 44        | `matchesToken()` | string → mode token  |
| `departure.js` line 200       | `readableMode()` | mode → English label |
| `station-dropdown.js` line 20 | `getModeIcon()`  | mode → emoji         |
| `transport-modes.js` line 5   | `emojiForMode()` | mode → emoji         |

Any change to a mode name or emoji must be propagated to all locations. `TRANSPORT_MODE_EMOJIS` in `config.js` already centralises the emoji values, but the functions that use it are duplicated.

**Fix direction:**  
Create `src/ui/mode-utils.js` exporting:

- `emojiForMode(mode)` — single authoritative implementation importing `TRANSPORT_MODE_EMOJIS`
- `labelForMode(mode, t)` — localised label using `t()` for the readable name

Replace all local copies with imports from `mode-utils.js`.

---

## Notes

- Issues #1, #4, #7 interact: they are all in the SW update / refresh-loop area and should be fixed together.
- Issues #5, #6 share the same fix pattern (teardown on `pagehide`); address together.
- Issues #9, #10, #18 are all in `departure.js`; a single refactor pass covers all three.
- Issue #11 (settings validation) should be implemented before fixing #12 (dual load paths), as the fix for #12 relies on `DEFAULTS` being trustworthy after load.
