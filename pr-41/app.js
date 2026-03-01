/**
 * app.js — Application bootstrap
 *
 * Thin orchestrator: imports focused modules and wires them together.
 * No business logic lives here — each concern is owned by its module.
 *
 *   app/settings.js   — localStorage load/save, text-size
 *   app/url-import.js — shared-board URL decode (?b= / ?board=)
 *   app/render.js     — departure list rendering
 *   app/fetch-loop.js — doRefresh, startRefreshLoop, tickCountdowns
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
import { getTheme } from './ui/theme-toggle.js';
import { lookupStopId } from './entur/index.js';
import { getRecentStations } from './ui/station-dropdown.js';

import { loadSettings, applyTextSize } from './app/settings.js';
import { processUrlParams } from './app/url-import.js';
import { renderDepartures } from './app/render.js';
import { doRefresh, startRefreshLoop, tickCountdowns, data } from './app/fetch-loop.js';
import { wireHandlers } from './app/handlers.js';
import { buildActionBar } from './app/action-bar.js';
import { registerServiceWorker } from './app/sw-updater.js';

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
  processUrlParams();

  // 3. Load favorites (triggers default import if none exist)
  // This must happen before updateFavoriteButton is called below
  const favorites = getRecentStations();

  // 4. If no DEFAULTS but favorites exist, apply the first one
  if (!DEFAULTS.STOP_ID && favorites.length > 0) {
    DEFAULTS.STATION_NAME = favorites[0].name;
    DEFAULTS.STOP_ID = favorites[0].stopId;
    DEFAULTS.TRANSPORT_MODES = favorites[0].modes || DEFAULTS.TRANSPORT_MODES;
  }

  // 5. Build board DOM
  // optsRef is a mutable box so handlers.js can call opts.updateFields()
  // without a circular import — it is filled in after createOptionsPanel.
  const optsRef = { current: null };

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
  updateFavoriteButton(board.favoriteBtn, DEFAULTS.STOP_ID, DEFAULTS.TRANSPORT_MODES, getTheme());

  // 6. Build action bar (share + theme + settings buttons)
  //    Handlers need the button refs for tooltip updates, so build the bar first
  //    and pass the refs into wireHandlers below.
  const { shareComponents, themeBtn, settingsBtn } = buildActionBar(
    board,
    () => opts.open(),
    () => opts.close()
  );

  // 6. Wire options panel
  const handlers = wireHandlers(board, shareComponents, themeBtn, settingsBtn, optsRef);
  const opts = createOptionsPanel(DEFAULTS, handlers.onApplySettings, handlers.onLanguageChange);
  optsRef.current = opts;
  document.body.appendChild(opts.panel);

  // 7. Header gear icon (opens options from the station header)
  const headerControls = createHeaderToggle(() => opts.open());
  const headerWrap = board.el.headerWrap || board.el.querySelector('.header-wrap') || board.el;
  const headerRight = document.createElement('div');
  headerRight.className = 'header-right';
  headerRight.appendChild(headerControls.el);
  headerWrap.appendChild(headerRight);

  // 8. Mount board and apply initial text size
  ROOT.appendChild(board.el);
  applyTextSize(DEFAULTS.TEXT_SIZE || 'medium');
  try { document.title = DEFAULTS.STATION_NAME || document.title; } catch (_) {}

  // 9. Register service worker
  await registerServiceWorker();

  // 10. Initial data load
  if (board.status) board.status.classList.add('visible');
  try {
    let stopId = DEFAULTS.STOP_ID;
    if (!stopId && DEFAULTS.STATION_NAME) {
      stopId = await lookupStopId({
        stationName: DEFAULTS.STATION_NAME,
        clientName:  DEFAULTS.CLIENT_NAME
      });
    }
    if (stopId && DEFAULTS.API_URL) {
      await doRefresh(board.list);
      if (board.status) board.status.textContent = t('live');
    }
  } catch (err) {
    console.warn('Initial fetch failed', err?.message ?? err);
    if (board.status) board.status.textContent = t('error');
  }

  // Ensure an empty state is shown when the initial fetch produced nothing
  if (!data || data.length === 0) renderDepartures(board.list, []);

  // 11. Start loops
  startRefreshLoop(board.list);
  tickCountdowns(board.list, board.status);
  // Store the ticker ID on the root element so it can be cleared if init() is
  // ever called again (e.g. in tests) without leaking the previous interval.
  if (ROOT._tickerId) clearInterval(ROOT._tickerId);
  ROOT._tickerId = setInterval(() => tickCountdowns(board.list, board.status), 1000);
}

document.addEventListener('DOMContentLoaded', init);
