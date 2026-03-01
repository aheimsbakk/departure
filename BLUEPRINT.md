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
- Station header (clickable) opens favorites dropdown (up to `NUM_FAVORITES` recent stations with saved settings; `DEFAULT_FAVORITE` pre-seeded when no favorites exist).
- Favorite heart button (❤️) is always enabled. Red heart = not in favorites (click to add). White/dark heart = already in favorites (click to remove). `handleFavoriteToggle` in `handlers.js` performs the toggle; `removeFromFavorites` in `station-dropdown.js` handles removal.
- Up to N upcoming departures (configurable).
- Departure line: destination, realtime indicator (● live / ○ scheduled), line number, transport emoji, platform symbol+code.
- Cancelled departures shown with strikethrough and reduced opacity.
- Live countdown (MM:SS), updates every second.
- Platform/quay display with configurable symbol rules (bay ▣, gate ◆, platform ⚏, stop ▪, berth ⚓).
- Auto-centering both horizontally and vertically.
- Settings persisted to `localStorage` (`departure:settings`): station name, stop ID, N, modes, text size, fetch interval.
- Language persisted to `localStorage` (`departure:language`): 12 supported languages.
- Theme persisted to `localStorage` (`departure:theme`): light / auto / dark cycle.
- Share button: encodes full board config as compact base64 URL (`?b=`), backward-compatible with `?board=` (legacy).
- PWA: installable via `manifest.webmanifest`, offline-capable via service worker (`sw.js`).
- Auto-update flow: service worker detects new version, shows 5-second countdown toast, then reloads.
- No external fonts required — use system fonts + CSS for visual effect.

Architecture overview
- `src/index.html`       — entry point, minimal markup, loads `src/app.js` as module
- `src/app.js`           — thin bootstrap: imports modules, wires DOMContentLoaded
- `src/app/`
  - `settings.js`        — load/save localStorage settings; applyTextSize
  - `url-import.js`      — decode ?b= / ?board= shared-board params, clean URL
  - `render.js`          — renderDepartures (departure list clear + populate)
  - `fetch-loop.js`      — doRefresh, startRefreshLoop, tickCountdowns
  - `handlers.js`        — handleStationSelect, handleFavoriteToggle, onApplySettings, onLanguageChange
  - `action-bar.js`      — share + theme + settings buttons, global-gear container
  - `sw-updater.js`      — SW registration, update toast, controllerchange reload
- `src/config.js`        — all configurable constants: VERSION, DEFAULTS (includes NUM_FAVORITES, FETCH_INTERVAL, GITHUB_URL), DEFAULT_FAVORITE, ALL_TRANSPORT_MODES, REALTIME_INDICATORS, TRANSPORT_MODE_EMOJIS, UI_EMOJIS, CANCELLATION_WRAPPER, PLATFORM_SYMBOLS, PLATFORM_SYMBOL_RULES, DEPARTURE_LINE_TEMPLATE
- `src/entur/`           — Entur API client (split into focused modules)
  - `index.js`           — public re-export facade (drop-in for former entur.js)
  - `modes.js`           — CANONICAL_MODE_MAP, token→canonical mapping, raw mode detection
  - `parser.js`          — pure `parseEnturResponse` function (no I/O)
  - `query.js`           — `buildQuery` + `buildVariants` (GraphQL query construction)
  - `http.js`            — `getContentType`, `postAndParse` (network transport only)
  - `departures.js`      — `fetchDepartures` orchestration + client-side mode filter
  - `geocoder.js`        — `lookupStopId`, `searchStations` (Entur geocoder REST API)
- `src/time.js`          — pure utilities: iso → epoch, format countdown
- `src/i18n.js`          — backward-compat shim → re-exports from `src/i18n/index.js`
- `src/i18n/`
  - `index.js`           — public facade; re-exports all symbols from store.js
  - `translations.js`    — static string data only: 12-language keyed map
  - `languages.js`       — static metadata: code/flag/name list for language switcher UI
  - `detect.js`          — pure fn: detectBrowserLanguage() (reads navigator, no state)
  - `store.js`           — runtime state: currentLanguage, t(), setLanguage(), getLanguage(), initLanguage(), getLanguages()
- `src/style.css`        — CSS entry point (@import manifest only; no rules)
- `src/icons.css`        — CSS-only icon/badge helpers
- `src/css/`             — component stylesheets (one responsibility each):
  - `tokens.css`         — all CSS custom properties: colors, spacing, sizing, z-index, transitions
  - `base.css`           — browser reset (html, body, * only)
  - `buttons.css`        — button system: base + .btn-icon/.header-btn + .btn-action/.share-url-close
  - `layout.css`         — page skeleton: .app-root, .board, body.options-open shift
  - `utils.css`          — generic a11y helpers (.visually-hidden)
  - `header.css`         — station header row, dropdown, status chip, favorite btn
  - `toolbar.css`        — fixed top-right .global-gear action bar
  - `departures.css`     — departure list, destination, time, platform, text-size-* utilities
  - `options-panel.css`  — slide-in panel shell, .options-row, inputs, .options-actions
  - `autocomplete.css`   — station search autocomplete list
  - `transport-modes.css`— mode filter checkbox grid
  - `language-switcher.css` — flag button row
  - `share-modal.css`    — share URL full-screen overlay
  - `toasts.css`         — ephemeral notifications: .options-toast + #sw-update-toast
  - `footer.css`         — fixed bottom-left .app-footer
  - `debug.css`          — .debug-panel (dev-only, safe to strip)
- `src/sw.js`            — service worker: versioned cache, offline support, skip-waiting flow
- `src/manifest.webmanifest` — PWA manifest (icons, theme color, display mode)
- `src/icons/`           — PWA icon assets
- `src/ui/`
  - `ui.js`              — DOM helpers, board element factory, render loop (minimize DOM thrash)
  - `departure.js`       — single departure component (template rendering, countdown update)
  - `header.js`          — station header toggle component
  - `options.js`         — re-export shim → `./options/index.js` (backward compat)
  - `options/`
    - `index.js`             — orchestrator; assembles panel, wires sub-modules; same public API
    - `settings-store.js`    — localStorage load/save, validateOptions, diffOptions
    - `transport-modes.js`   — checkbox table, toggle-all, debounced apply
    - `station-autocomplete.js` — debounced search, keyboard nav, candidate list DOM
    - `language-switcher.js` — flag buttons, updateTranslations(refs)
    - `panel-lifecycle.js`   — open/close, focus trap, ESC handler, toast
  - `share-button.js`    — share button, URL encode/decode (base64 array format)
  - `station-dropdown.js`— favorites/recent stations dropdown (up to NUM_FAVORITES, with saved settings)
  - `theme-toggle.js`    — light/auto/dark theme cycle button
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
- Language switcher in options panel uses flag buttons; changing language updates all translatable strings in the open panel in-place (footer and tooltips refreshed via `onLanguageChange` callback — the panel is **not** recreated).

Share URL format
- Encoding: compact JSON array `[stationName, stopId, modes[]]` (3 elements) → JSON.stringify → btoa (URL-safe: `+`→`-`, `/`→`_`, strip `=`).
- URL param: `?b=<encoded>` (v1.24.0+). Legacy `?board=<encoded>` decoded for backward compat.
- Decoding detects array vs object format automatically; supports legacy 7-element array `[name, stopId, modes, departures, interval, size, lang]` and legacy object format `{n, s, m, d, i, t, l}`.
- Opening a shared link applies settings, saves to `localStorage`, adds station to favorites, then clears URL param.
- Full spec: `docs/share_url_encoding.md`.

PWA & Service Worker
- `src/manifest.webmanifest`: name, icons, `display: standalone`, theme color.
- `src/sw.js`: versioned cache name (`kollektiv-v<VERSION>`), caches all app assets on install, serves from cache with network fallback.
- Update flow: new SW detected → 5-second countdown toast shows old→new version → `skipWaiting` → `controllerchange` triggers hard reload with `?t=<timestamp>` cache-bust.
- VERSION in `src/config.js` and `src/sw.js` must stay in sync — use `scripts/bump-version.sh`. Current version: `1.34.0`.

Performance & DOM update pattern
- Render template once per departure item; keep references to text nodes for countdown and situation.
- Only update the countdown text every second rather than re-paint full DOM.
- On new fetch, diff the departure array by stable key (destination + expectedDepartureISO) and only add/remove or reorder DOM nodes as needed.
- Use `requestAnimationFrame` sparingly for animations; timer uses `setInterval(1000)` to update times.

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
- `src/style.css`        (import manifest)
- `src/icons.css`
- `src/css/`             (tokens, base, buttons, layout, utils, header, toolbar, departures, options-panel, autocomplete, transport-modes, language-switcher, share-modal, toasts, footer, debug)
- `src/app.js`
- `src/app/` (settings.js, url-import.js, render.js, fetch-loop.js, handlers.js, action-bar.js, sw-updater.js)
- `src/config.js`
- `src/entur/` (index.js, modes.js, parser.js, query.js, http.js, departures.js, geocoder.js)
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

Commit & agent protocol notes (required)
- Before committing, create a worklog: `docs/worklogs/YYYY-MM-DD-HH-mm-{short-desc}.md` using the template in `agents/WORKLOG_TEMPLATE.md`.
- Immediately update `CONTEXT.md` (under 20 lines) with Current Goal, Last 3 Changes, Next Steps.
- Run `scripts/bump-version.sh [patch|minor|major]` to bump VERSION in `src/config.js` and `src/sw.js`. Mention new version in worklog body.
- Commit message style: Conventional Commits — e.g., `feat(share): add base64 array URL encoding`.

End of blueprint.
