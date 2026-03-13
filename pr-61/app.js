/**
 * app.js — Application bootstrap
 *
 * Thin orchestrator: imports focused modules and wires them together.
 * No business logic lives here — each concern is owned by its module.
 *
 *   app/settings.js   — localStorage load/save, text-size
 *   app/url-import.js — shared-board URL decode (?b= / ?board=)
 *   app/render.js     — departure list rendering
 *   app/fetch-loop.js — doRefresh, startRefreshLoop(listEl, statusEl), tickCountdowns
 *   app/handlers.js   — station select, favorite toggle, apply settings, language change
 *   app/action-bar.js — share + theme + settings buttons
 *   app/sw-updater.js — service worker registration and auto-update toast
 */

import { DEFAULTS } from './config.js';
import { initLanguage, t } from './i18n.js';
import { initTheme } from './ui/theme-toggle.js';
import { createBoardElements, updateFavoriteButton } from './ui/ui.js';
import { createHeaderToggle } from './ui/header.js';
import { createOptionsPanel } from './ui/options/index.js';
import { getRecentStations, getDefaultStation } from './ui/station-dropdown.js';

import { loadSettings, applyTextSize } from './app/settings.js';
import { processUrlParams } from './app/url-import.js';
import { renderDepartures } from './app/render.js';
import { doRefresh, startRefreshLoop, tickCountdowns, data } from './app/fetch-loop.js';
import { wireHandlers } from './app/handlers.js';
import { buildActionBar } from './app/action-bar.js';
import { buildGpsBar } from './app/gps-bar.js';
import { registerServiceWorker } from './app/sw-updater.js';
import { initScrollMore } from './app/scroll-more.js';
import { setNumDeparturesOverride } from './app/fetch-loop.js';

// Initialise language and theme before any DOM is built so that the correct
// strings and colours are in place from the very first render.
initLanguage();
initTheme();

// Root element that holds the board (defined in index.html)
const ROOT = document.getElementById('app');

async function init() {
  // 1. Load persisted settings
  loadSettings();

  // 2. Decode shared-board URL parameter (?b= or legacy ?board=)
  //    Must run AFTER loadSettings() so that the URL payload only overwrites
  //    fields that were actually present in the share link (not sentinel defaults).
  //    Must run BEFORE getRecentStations() so that the imported station is NOT
  //    overridden by the "apply first favorite" fallback below.
  const urlImported = processUrlParams();

  // 3. Load favorites (triggers default import if none exist)
  // This must happen before updateFavoriteButton is called below
  const favorites = getRecentStations();

  // 4. Determine startup station (preference: URL import → first favorite → default station)
  //    DEFAULT_FAVORITE is applied to DEFAULTS only, never saved to the favorites list.
  if (!urlImported && !DEFAULTS.STOP_ID) {
    if (favorites.length > 0) {
      DEFAULTS.STATION_NAME    = favorites[0].name;
      DEFAULTS.STOP_ID         = favorites[0].stopId;
      DEFAULTS.TRANSPORT_MODES = favorites[0].modes || DEFAULTS.TRANSPORT_MODES;
    } else {
      const defaultStation = getDefaultStation();
      if (defaultStation) {
        DEFAULTS.STATION_NAME    = defaultStation.name;
        DEFAULTS.STOP_ID         = defaultStation.stopId;
        DEFAULTS.TRANSPORT_MODES = defaultStation.modes.length
          ? defaultStation.modes
          : DEFAULTS.TRANSPORT_MODES;
      }
    }
  }

  // 5. Build board DOM
  // optsRef is a mutable box so handlers.js can call opts.updateFields()
  // without a circular import — it is filled in after createOptionsPanel.
  const optsRef = { current: null };
  const gpsRef  = { current: null };
  const scrollMoreRef = { current: null };

  const board = createBoardElements(
    DEFAULTS.STATION_NAME,
    (station) => handlers.handleStationSelect(station),
    ()        => handlers.handleFavoriteToggle()
  );

  // Sync dropdown title so mode icons show up when a filter is active
  if (board.stationDropdown) {
    board.stationDropdown.updateTitle(DEFAULTS.STATION_NAME, DEFAULTS.TRANSPORT_MODES);
  }

  // Set initial heart button state
  updateFavoriteButton(board.favoriteBtn, DEFAULTS.STOP_ID, DEFAULTS.TRANSPORT_MODES);

  // 6. Build action bar (share + theme + settings buttons).
  //    The open/close callbacks reference `opts` which is declared in step 7 —
  //    this is safe because the lambdas are only invoked after init() returns.
  const { shareComponents, themeBtn, settingsBtn } = buildActionBar(
    board,
    () => opts.open(),
    () => opts.close()
  );

  // 7. Wire handlers and options panel.
  //    wireHandlers must receive the action-bar button refs (step 6) so it can
  //    update their tooltips; createOptionsPanel must come after so `opts` is
  //    available when the closures above are eventually called.
  const handlers = wireHandlers(board, shareComponents, themeBtn, settingsBtn, optsRef, gpsRef, scrollMoreRef);
  const opts = createOptionsPanel(DEFAULTS, handlers.onApplySettings, handlers.onLanguageChange);
  optsRef.current = opts;
  document.body.appendChild(opts.panel);

  // 7b. Mount the GPS compass bar (top-left) — uses dedicated handler that does NOT auto-save to favorites
  const { gpsContainer } = buildGpsBar((station) => handlers.handleGpsStationSelect(station));
  gpsRef.current = gpsContainer;

  // 8. Header gear icon (opens options from the station header)
  const headerControls = createHeaderToggle(() => opts.open());
  const headerWrap = board.el.headerWrap || board.el.querySelector('.header-wrap') || board.el;
  const headerRight = document.createElement('div');
  headerRight.className = 'header-right';
  headerRight.appendChild(headerControls.el);
  headerWrap.appendChild(headerRight);

  // 9. Mount board and apply initial text size
  ROOT.appendChild(board.el);
  // Mount footer outside the board so pull-to-scroll displacement doesn't affect it
  document.body.appendChild(board.footer);
  applyTextSize(DEFAULTS.TEXT_SIZE || 'medium');
  try { document.title = DEFAULTS.STATION_NAME || document.title; } catch (_) {}

  // 10. Initialise scroll-more (pull-to-load-more departures)
  const scrollMore = initScrollMore({
    boardEl: board.el,
    listEl:  board.list,
    onLoadMore: async (newCount) => {
      setNumDeparturesOverride(newCount);
      await doRefresh(board.list);
    }
  });
  scrollMoreRef.current = scrollMore;

  // 11. Register service worker
  await registerServiceWorker();

  // 12. Initial data load
  // doRefresh() internally resolves the stop ID via lookupStopId() when
  // DEFAULTS.STOP_ID is not set — no need to duplicate that lookup here.
  if (board.status) board.status.classList.add('visible');
  try {
    if (DEFAULTS.STOP_ID || DEFAULTS.STATION_NAME) {
      await doRefresh(board.list);
    }
  } catch (err) {
    console.warn('Initial fetch failed', err?.message ?? err);
    if (board.status) board.status.textContent = t('error');
  }

  // Ensure an empty state is shown when the initial fetch produced nothing
  if (!data || data.length === 0) renderDepartures(board.list, []);

  // 13. Start the unified 1-second loop.
  //     startRefreshLoop drives both the departure countdowns AND the
  //     "update in Xs" status chip from a single setInterval — no drift.
  //     An immediate tickCountdowns() call paints the chips without waiting
  //     for the first 1-second tick to fire.
  startRefreshLoop(board.list, board.status);
  tickCountdowns(board.list, board.status);
}

// BFCache cold-start guard: if the OS fully kills the PWA process and restores
// it from the back/forward cache, visibilitychange may not fire. pageshow with
// event.persisted=true is the reliable signal for this case — a full reload
// ensures fresh data and a clean timer state.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) location.reload();
});

document.addEventListener('DOMContentLoaded', init);
