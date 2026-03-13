# Departure Board — BLUEPRINT

Purpose

- Browser single‑page application that replicates the terminal departure board in `departure.sh`.
- No external dependencies, no build step. All source lives under `src/` and uses native ES modules + modern browser APIs.

High-level constraints

- No third‑party libraries or packages.
- Files under `src/`.
- Client-side only: no server component, no proxy, and no server instructions included in the repo.
- The app must function fully in the browser. If Entur's API blocks cross-origin requests, the app shows a clear error state; no demo/offline fallback mode (removed in v1.x).
- Keep accessibility and responsive design in mind.
- Follow agents protocol before committing: create `docs/worklogs/YYYY-MM-DD-HH-mm-{short-desc}.md` and update `CONTEXT.md` (<=20 lines).

User-facing features

- Station header (clickable) opens favorites dropdown (up to `NUM_FAVORITES` recent stations with saved settings). On first load with empty favorites, `getDefaultStation()` (decodes `DEFAULT_FAVORITE`) is used as the startup station — it is **not written** to the favorites list.
- Favorite heart button is always enabled. Gray heart 🩶 = not in favorites (click to add, theme-neutral). Red heart ❤️ = already in favorites (click to remove). `handleFavoriteToggle` in `handlers.js` performs the toggle; `removeFromFavorites` in `station-dropdown.js` handles removal.
- GPS compass button 🧭 (fixed top-left, same `.header-btn` style as top-right buttons). Click → requests browser geolocation → fetches up to `GPS_MAX_RESULTS` (10) nearest stops within `GPS_SEARCH_RADIUS_KM` (2 km) via Entur Geocoder reverse API → shows a temporary dropdown listing stops rendered from `GPS_STOP_LINE_TEMPLATE` (name + distance + mode emojis). Selecting a stop sets it as the current station and closes the dropdown. The heart button is then available to save to favorites.
- Up to N upcoming departures (configurable).
- Departure line: destination, realtime indicator (● live / ○ scheduled), line number, transport emoji, platform symbol+code.
- Cancelled departures shown with strikethrough and reduced opacity.
- Live countdown (MM:SS), updates every second.
- Platform/quay display with configurable symbol rules (bay ▣, gate ◆, platform ⚏, stop ▪, berth ⚓).
- Auto-centering both horizontally and vertically.
- Pull-to-load-more departures: user pulls up on the departure list (touch drag, mouse drag, or mouse wheel) to progressively load more departures following the Fibonacci-like sequence 1→2→3→5→8→13→21. Shows ▼ with "scroll for more" label (CSS bounce animation on arrow via transform, 2 s ease-in-out infinite); at max (21) switches to ● with temporary "for more change in ⚙️" hint. Temporary count resets on station change, settings apply, or app reload. No visual drag displacement — no marginTop manipulation, no snap-back animation, no ghost-click guard. Load fires on pointer/touch release at threshold (leading-edge debounce). When drag threshold is crossed, `.scroll-more-indicator--triggered` is applied: arrow turns accent color with fast bounce (0.5 s); removed on finger lift before load fires. On mouse wheel: load fires immediately at threshold. The temporary count persists across automatic fetch-loop refreshes.
- Settings persisted to `localStorage` (`departure:settings`): station name, stop ID, N, modes, text size, fetch interval.
- Language persisted to `localStorage` (`departure:language`): 12 supported languages.
- Theme persisted to `localStorage` (`departure:theme`): light / auto / dark cycle.
- Share button: encodes full board config as compact base64 URL (`?b=`), backward-compatible with `?board=` (legacy).
- PWA: installable via `manifest.webmanifest`, offline-capable via service worker (`sw.js`).
- Auto-update flow: service worker detects new version, shows 5-second countdown toast, then reloads.
- No external fonts required — use system fonts + CSS for visual effect.

Architecture overview

- `src/index.html` — entry point, minimal markup, loads `src/app.js` as module
- `src/app.js` — thin bootstrap: imports modules, wires DOMContentLoaded
- `src/app/`
  - `settings.js` — load/save localStorage settings; applyTextSize
  - `url-import.js` — decode ?b= / ?board= shared-board params, clean URL
  - `render.js` — renderDepartures (departure list clear + populate)
  - `fetch-loop.js` — doRefresh, startRefreshLoop(listEl, statusEl), tickCountdowns; single unified 1-second interval drives both departure countdowns and the "update in" chip; fetch triggered when tick counter reaches 0; supports temporary numDepartures override via setNumDeparturesOverride()/getEffectiveNumDepartures() for scroll-more feature
  - `handlers.js` — handleStationSelect, handleFavoriteToggle, onApplySettings, onLanguageChange; resets scroll-more on station change and settings apply
  - `action-bar.js` — share + theme + settings buttons, global-gear container
  - `scroll-more.js` — pull-to-load-more departures: Fibonacci progression (1→2→3→5→8→13→21), touch/mouse/wheel gesture detection, no visual drag displacement (no marginTop, no snap-back), load fires on pointer/touch release at threshold (leading-edge debounce via SCROLL_MORE.DEBOUNCE_MS), `.scroll-more-indicator--triggered` applied at threshold (accent arrow + fast bounce), ▼/"scroll for more" indicator → ●/"for more change in ⚙️" at max; resets on station change
  - `sw-updater.js` — SW registration, update toast, controllerchange reload
- `src/config.js` — all configurable constants: VERSION, DEFAULTS (includes NUM_FAVORITES, FETCH_INTERVAL, GITHUB_URL), DEFAULT_FAVORITE, ALL_TRANSPORT_MODES, REALTIME_INDICATORS, TRANSPORT_MODE_EMOJIS, UI_EMOJIS, CANCELLATION_WRAPPER, PLATFORM_SYMBOLS, PLATFORM_SYMBOL_RULES, DEPARTURE_LINE_TEMPLATE, STATION_LINE_TEMPLATE, GPS_STOP_LINE_TEMPLATE, GPS_MAX_RESULTS, GPS_SEARCH_RADIUS_KM, SCROLL_MORE (includes DEBOUNCE_MS, SYMBOL_ARROW, SYMBOL_MAX)
- `src/entur/` — Entur API client (split into focused modules)
  - `index.js` — public re-export facade (drop-in for former entur.js)
  - `modes.js` — CANONICAL_MODE_MAP, token→canonical mapping, raw mode detection
  - `parser.js` — pure `parseEnturResponse` function (no I/O)
  - `query.js` — `buildQuery` + `buildVariants` (GraphQL query construction)
  - `http.js` — `getContentType`, `postAndParse` (network transport only)
  - `departures.js` — `fetchDepartures` orchestration + client-side mode filter
  - `geocoder.js` — `lookupStopId`, `searchStations` (Entur geocoder REST API)
  - `gps-search.js` — `fetchNearbyStops`, `extractModes`, `CATEGORY_TO_MODE` (Geocoder reverse API, GPS nearby stops; `distance` field is km float → multiply × 1000 for metres; `mode` is array of single-key objects)
- `src/time.js` — pure utilities: iso → epoch, format countdown
- `src/i18n.js` — backward-compat shim → re-exports from `src/i18n/index.js`
- `src/i18n/`
  - `index.js` — public facade; re-exports all symbols from store.js
  - `translations.js` — static string data only: 12-language keyed map
  - `languages.js` — static metadata: code/flag/name list for language switcher UI
  - `detect.js` — pure fn: detectBrowserLanguage() (reads navigator, no state)
  - `store.js` — runtime state: currentLanguage, t(), setLanguage(), getLanguage(), initLanguage(), getLanguages()
- `src/style.css` — CSS entry point (@import manifest only; no rules)
- `src/icons.css` — CSS-only icon/badge helpers
- `src/css/` — component stylesheets (one responsibility each):
  - `tokens.css` — all CSS custom properties: colors, spacing, sizing, z-index, transitions
  - `base.css` — browser reset (html, body, \* only)
  - `buttons.css` — button system: base + .btn-icon/.header-btn + .btn-action/.share-url-close
  - `layout.css` — page skeleton: .app-root, .board, body.options-open shift
  - `utils.css` — generic a11y helpers (.visually-hidden)
  - `header.css` — station header row, dropdown, status chip, favorite btn
  - `toolbar.css` — fixed top-right .global-gear + fixed top-left .gps-bar action bars
  - `departures.css` — departure list, destination, time, platform, text-size-\* utilities
  - `scroll-more.css` — pull-to-load-more indicator: ▼ arrow with CSS bounce animation (transform-based, 2 s ease-in-out infinite), ● max state, loading dim; `.scroll-more-indicator--triggered` (accent color + fast 0.5 s bounce when threshold crossed); no drag displacement, no .board--pulling/.board--snapping classes
  - `options-panel.css` — slide-in panel shell, .options-row, inputs, .options-actions
  - `autocomplete.css` — station search autocomplete list
  - `transport-modes.css`— mode filter checkbox grid
  - `language-switcher.css` — flag button row
  - `share-modal.css` — share URL full-screen overlay
  - `toasts.css` — ephemeral notifications: .options-toast + #sw-update-toast
  - `gps-dropdown.css` — GPS nearby-stops dropdown (compass button results list)
  - `footer.css` — fixed bottom-left .app-footer
  - `debug.css` — .debug-panel (dev-only, safe to strip)
- `src/sw.js` — service worker: versioned cache, offline support, skip-waiting flow
- PWA wake-up: `visibilitychange` listener in `fetch-loop.js` detects stale data after OS freeze (compares `Date.now()` vs `lastFetchAt`); `pageshow` with `event.persisted` in `app.js` handles BFCache cold-start via full reload.
- `src/manifest.webmanifest` — PWA manifest (icons, theme color, display mode)
- `src/icons/` — PWA icon assets
- `src/ui/`
  - `ui.js` — DOM helpers, board element factory, render loop (minimize DOM thrash)
  - `departure.js` — single departure component (template rendering, countdown update)
  - `header.js` — station header toggle component
  - `options.js` — re-export shim → `./options/index.js` (backward compat)
  - `options/`
    - `index.js` — orchestrator; assembles panel, wires sub-modules; same public API
    - `settings-store.js` — localStorage load/save, validateOptions, diffOptions
    - `transport-modes.js` — checkbox table, toggle-all, debounced apply
    - `station-autocomplete.js` — debounced search, keyboard nav, candidate list DOM
    - `language-switcher.js` — flag buttons, updateTranslations(refs)
    - `panel-lifecycle.js` — open/close, focus trap, ESC handler, toast
  - `share-button.js` — share button, URL encode/decode (base64 array format)
  - `station-dropdown.js`— favorites/recent stations dropdown (up to NUM_FAVORITES, with saved settings); `getDefaultStation()` decodes `DEFAULT_FAVORITE` without writing to localStorage; `getRecentStations()` is a pure localStorage read
  - `theme-toggle.js` — light/auto/dark theme cycle button
  - `gps-dropdown.js` — compass button + GPS nearby-stops temporary dropdown
- No transpilation. Use `type="module"` for the scripts.

Data flow

- `app.js` reads persisted settings from `localStorage`, then checks URL params (`?b=` / `?board=`) for shared board import.
- On start and every FETCH_INTERVAL seconds: call `entur.fetchDepartures(stopId, n, modes)`.
- `entur.fetchDepartures` uses `fetch()` to POST to Entur GraphQL endpoint.
- Parse response to normalized JS objects:
  - `{ destination, lineNumber, transportMode, expectedDepartureISO, realtimeState, cancellation, quay: { publicCode } }`
- UI layer keeps last successful dataset; on new data diff update DOM nodes; always update countdown labels every second.
- On fetch failure show error state; keep previous data if available.

Entur API considerations

- Stop lookup: `GET https://api.entur.io/geocoder/v1/autocomplete?text=...&lang=en&size=10` — filters to `StopPlace` venue type.
- GPS nearby stops: `GET https://api.entur.io/geocoder/v1/reverse?point.lat=...&point.lon=...&size=<GPS_MAX_RESULTS>&layers=venue&boundary.country=NOR&boundary.circle.radius=<GPS_SEARCH_RADIUS_KM>` — returns GeoJSON FeatureCollection; `properties.distance` is a **km float** (multiply × 1000 for metres); `properties.mode` is an **array of single-key objects** (e.g. `[{bus:null}]`), extract via `Object.keys()`; `properties.category` used as fallback via `CATEGORY_TO_MODE` map.
- Departures: GraphQL POST to `https://api.entur.io/journey-planner/v3/graphql`.
- Query fields: `stopPlace(id) { estimatedCalls(numberOfDepartures, whiteListedModes) { expectedDepartureTime realtime cancellation serviceJourney { journeyPattern { line { publicCode transportMode } } } destinationDisplay { frontText } quays { publicCode } } }`
- Headers: `ET-Client-Name: kollektiv-sanntid-org`.
- CORS: The app calls Entur directly from the browser. On failure, shows a clear error state. No proxy or server code.

Time and timezone

- Parse ISO times using `Date.parse()`; work in UTC epoch ms then compute diff with `Date.now()`.
- Display "Now" for diff <= 0.
- Formatting: `MM:SS` (hours suppressed for typical transit use).
- Avoid heavy libraries: small helper functions in `src/time.js`.

UI/UX & styling

- CSS entry point is `src/style.css` — an `@import` manifest only. All rules live in `src/css/*.css`.
- Design tokens in `src/css/tokens.css`: `--bg`, `--text-primary`, `--accent`, `--danger`, `--mono`, `--large-scale`, button sizing vars, transition vars, z-index layer vars, plus theme overrides.
- Three themes: light / auto (system) / dark — toggled via `.theme-light` on `<html>`, default follows `prefers-color-scheme`.
- Five text sizes applied as class on `<html>`: `text-size-tiny` → `text-size-xlarge` (rules in `departures.css`).
- Button system in `src/css/buttons.css`: `button` base → `.btn-icon`/`.header-btn` (icon toolbar) → `.btn-action`/`.share-url-close` (prominent actions). All three global toolbar buttons (share, theme, gear) carry `.header-btn` for uniform 26px emoji size. Button emojis sourced from `UI_EMOJIS` in `config.js`.
- Departure line rendered from `DEPARTURE_LINE_TEMPLATE` (configurable in `config.js`).
- Platform symbol selected by `PLATFORM_SYMBOL_RULES` (ordered rule list in `config.js`): water→berth, bus+alphanumeric→bay, bus+single-letter→gate, bus→stop, tram→stop, rail/metro→platform.
- Realtime indicator: `●` (solid, live) / `○` (hollow, scheduled) from `REALTIME_INDICATORS` in `config.js`.
- Cancellation: wraps line in `.departure-cancelled` (strikethrough + reduced opacity) via `CANCELLATION_WRAPPER` in `config.js`.
- Auto-centering: Flexbox column + `justify-content:center; align-items:center; min-height:100vh`.
- Responsive: text sizes reduce on small screens; vertical centering maintained.
- Accessibility: high contrast, ARIA labels, `role="status"` for countdown chip.

Internationalisation (i18n)

- All UI strings live in `src/i18n.js` as a keyed map per language code.
- `t(key)` returns the string for the current language (falls back to `en`).
- Language persisted in `localStorage` key `departure:language`.
- Supported: `en`, `no`, `de`, `es`, `it`, `el`, `fa`, `hi`, `is`, `uk`, `fr`, `pl`.
- All 12 languages carry the full key set including GPS keys (`gpsTooltip`, `gpsLocating`, `gpsNoResults`, `gpsFetchError`, `gpsNotSupported`, `gpsPermissionDenied`, `gpsUnavailable`, `gpsMeters`) and scroll-more keys (`scrollForMore`, `scrollMaxReached`).
- Language switcher in options panel uses flag buttons; changing language updates all translatable strings in the open panel in-place (footer and tooltips refreshed via `onLanguageChange` callback — the panel is **not** recreated).

Share URL format

- Encoding: compact JSON array `[stationName, stopId, modes[]]` (3 elements) → JSON.stringify → btoa (URL-safe: `+`→`-`, `/`→`_`, strip `=`).
- URL param: `?b=<encoded>` (v1.24.0+). Legacy `?board=<encoded>` decoded for backward compat.
- Decoding detects array vs object format automatically; supports legacy 7-element array `[name, stopId, modes, departures, interval, size, lang]` and legacy object format `{n, s, m, d, i, t, l}`.
- Opening a shared link applies settings, saves to `localStorage`, sets as current station (does NOT add to favorites), then clears URL param.
- Full spec: `docs/share_url_encoding.md`.

PWA & Service Worker

- `src/manifest.webmanifest`: name, icons, `display: standalone`, theme color.
- `src/sw.js`: versioned cache name (`kollektiv-v<VERSION>`), caches all app assets on install, serves from cache with network fallback.
- Update flow: new SW detected → 5-second countdown toast shows old→new version → `skipWaiting` → `controllerchange` triggers hard reload with `?t=<timestamp>` cache-bust.
- PWA wake-up on resume: `visibilitychange` in `fetch-loop.js` checks wall-clock elapsed time vs `FETCH_INTERVAL`; triggers immediate `doRefresh()` if stale. `pageshow` (event.persisted) in `app.js` forces full reload on BFCache cold-start.
- VERSION in `src/config.js` and `src/sw.js` must stay in sync — use `scripts/bump-version.sh`. Current version: `1.38.1`.

Performance & DOM update pattern

- Render template once per departure item; keep references to text nodes for countdown and situation.
- Only update the countdown text every second rather than re-paint full DOM.
- On new fetch, diff the departure array by stable key (destination + expectedDepartureISO) and only add/remove or reorder DOM nodes as needed.
- Single unified `setInterval(1000)` in `fetch-loop.js` drives both departure countdowns and the "update in" status chip. A tick counter (`ticksUntilRefresh`) decrements each second; when it reaches 0 `doRefresh()` is called and the counter resets. This guarantees zero drift between the countdown display and the actual fetch.

Error handling & fallback UX

- If station lookup fails: show error/empty state and keep previous data if available.
- If network error: log warning, keep previous data, update status chip.
- Header status chip shows countdown to next refresh ("Updating in Xs").
- No demo mode or manual JSON upload (removed).

Settings & persistence

- Settings stored in `localStorage` key `departure:settings` as JSON (mirrors DEFAULTS shape).
- Language stored in `localStorage` key `departure:language`.
- Theme stored in `localStorage` key `departure:theme`.
- URL params for shared boards only: `?b=` (array base64) or legacy `?board=` (object base64).

Testing & dev workflow (no deps)

- Manual smoke tests:

  - Load `src/index.html` via local server, confirm station lookup, departures, countdowns decrement.
  - Simulate network failure using devtools offline.

- Node-local unit tests:

  - Place tests under `tests/` as ESM modules (e.g. `tests/time.test.mjs`). Run: `node tests/run.mjs` or `npm test`.
  - Use Node's built-in `assert` API — no test framework.
  - Keep tests hermetic: no DOM APIs or `fetch`.

- Logging: minimal console logs only. `console.debug` is banned. Use `console.warn` for recoverable failures and `console.error` for unexpected errors. No empty `catch` blocks.

Security & privacy

- Never log tokens or secrets. Avoid embedding keys in the code.
- Explain CORS fallback without suggesting public proxies for production.

Current file tree (implemented)

- `src/index.html`
- `src/style.css` (import manifest)
- `src/icons.css`
- `src/css/` (tokens, base, buttons, layout, utils, header, toolbar, departures, scroll-more, options-panel, autocomplete, transport-modes, language-switcher, share-modal, toasts, footer, debug)
- `src/app.js`
- `src/app/` (settings.js, url-import.js, render.js, fetch-loop.js, handlers.js, action-bar.js, gps-bar.js, scroll-more.js, sw-updater.js)
  - `gps-bar.js` — mounts `.gps-bar` fixed top-left container with compass button
- `src/config.js`
- `src/entur/` (index.js, modes.js, parser.js, query.js, http.js, departures.js, geocoder.js, gps-search.js)
- `src/time.js`
- `src/i18n.js` (shim)
- `src/i18n/` (translations.js, languages.js, detect.js, store.js, index.js)
- `src/sw.js`
- `src/manifest.webmanifest`
- `src/icons/`
- `src/ui/ui.js`
- `src/ui/departure.js`
- `src/ui/header.js`
- `src/ui/options.js` (shim)
- `src/ui/options/` (index.js, settings-store.js, transport-modes.js, station-autocomplete.js, language-switcher.js, panel-lifecycle.js)
- `src/ui/share-button.js`
- `src/ui/station-dropdown.js`
- `src/ui/theme-toggle.js`
- `src/ui/mode-utils.js` — shared helpers: `emojiForMode(mode)`, `labelForMode(mode)` (consolidated from departure.js, station-dropdown.js, transport-modes.js)

Commit & agent protocol notes (required)

- Before committing, create a worklog: `docs/worklogs/YYYY-MM-DD-HH-mm-{short-desc}.md` using the template in `agents/WORKLOG_TEMPLATE.md`.
- Immediately update `CONTEXT.md` (under 20 lines) with Current Goal, Last 3 Changes, Next Steps.
- Run `scripts/bump-version.sh [patch|minor|major]` to bump VERSION in `src/config.js` and `src/sw.js`. Mention new version in worklog body.
- Commit message style: Conventional Commits — e.g., `feat(share): add base64 array URL encoding`.

End of blueprint.
