/**
 * fetch-loop.js — Live data fetch loop and per-second countdown ticker
 *
 * Responsibilities:
 *   - Resolve stop ID (from DEFAULTS or via geocoder lookup)
 *   - Fetch departures and re-render the list
 *   - Manage the periodic auto-refresh interval
 *   - Drive the per-second countdown ticker (departure chips + status chip)
 */

import { DEFAULTS } from '../config.js';
import { fetchDepartures, lookupStopId } from '../entur/index.js';
import { formatCountdown } from '../time.js';
import { t, getLanguage } from '../i18n.js';
import { renderDepartures } from './render.js';

/** Epoch-ms timestamp of the next scheduled automatic refresh */
let nextRefreshAt = Date.now();

/** setInterval handle for the periodic refresh loop */
let refreshTimerId = null;

/** The most recently fetched departure data (kept for re-render on settings change) */
export let data = [];

/**
 * Fetch live departures and re-render the list.
 * On failure the error is logged and any previous data is left in place.
 *
 * @param {HTMLElement} listEl - The departure list container
 */
export async function doRefresh(listEl) {
  try {
    let stopId = DEFAULTS.STOP_ID;
    if (!stopId) {
      stopId = await lookupStopId({
        stationName: DEFAULTS.STATION_NAME,
        clientName:  DEFAULTS.CLIENT_NAME
      });
    }

    const fresh = stopId
      ? await fetchDepartures({
          stopId,
          numDepartures: DEFAULTS.NUM_DEPARTURES,
          modes:         DEFAULTS.TRANSPORT_MODES,
          lang:          getLanguage(),
          apiUrl:        DEFAULTS.API_URL,
          clientName:    DEFAULTS.CLIENT_NAME
        })
      : [];

    renderDepartures(listEl, fresh);
    data = fresh;
  } catch (err) {
    console.warn('Refresh failed', err);
  } finally {
    // Schedule the next automatic refresh from NOW so FETCH_INTERVAL changes
    // take effect immediately after a manual settings apply.
    nextRefreshAt = Date.now() + DEFAULTS.FETCH_INTERVAL * 1000;
  }
}

/**
 * (Re)start the automatic refresh interval.
 * Safe to call multiple times — clears any existing interval first.
 *
 * @param {HTMLElement} listEl - The departure list container
 */
export function startRefreshLoop(listEl) {
  if (refreshTimerId) clearInterval(refreshTimerId);
  nextRefreshAt  = Date.now() + DEFAULTS.FETCH_INTERVAL * 1000;
  refreshTimerId = setInterval(
    () => doRefresh(listEl).catch(err => console.warn('Refresh failed', err)),
    DEFAULTS.FETCH_INTERVAL * 1000
  );
}

/**
 * Per-second ticker: updates all countdown chips and the header status chip.
 * Reads `data-epoch-ms` from each `.departure-time` element so this function
 * is pure DOM-driven and does not depend on application state beyond the board.
 *
 * @param {HTMLElement}      listEl   - The departure list container
 * @param {HTMLElement|null} statusEl - The header status chip element
 */
export function tickCountdowns(listEl, statusEl) {
  const now = Date.now();

  // Update all visible departure countdowns
  listEl.querySelectorAll('.departure-time').forEach(el => {
    const raw   = el.dataset.epochMs;
    const epoch = raw == null || raw === '' ? NaN : Number(raw);
    el.textContent = Number.isFinite(epoch) ? (formatCountdown(epoch, now, t) ?? '—') : '—';
  });

  // Update the header status chip with seconds until next auto-refresh
  if (statusEl) {
    const msLeft  = typeof nextRefreshAt === 'number'
      ? nextRefreshAt - now
      : DEFAULTS.FETCH_INTERVAL * 1000;
    const secLeft = Math.max(0, Math.ceil(msLeft / 1000));
    statusEl.textContent = `${t('updatingIn')} ${secLeft}${t('seconds')}`;
  }
}
