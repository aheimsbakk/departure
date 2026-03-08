/**
 * fetch-loop.js — Live data fetch loop and per-second countdown ticker
 *
 * Responsibilities:
 *   - Resolve stop ID (from DEFAULTS or via geocoder lookup)
 *   - Fetch departures and re-render the list
 *   - Drive a single unified 1-second interval that:
 *       • ticks all departure countdown chips
 *       • decrements the "update in" status chip counter
 *       • triggers doRefresh() exactly when the counter reaches 0
 *
 * Design: one interval, one counter.
 *   ticksUntilRefresh counts DOWN from FETCH_INTERVAL to 1.
 *   On every tick it is decremented first, then checked.
 *   When it reaches 0 a fetch is triggered and the counter resets.
 *   This guarantees the departure countdowns and the "update in" chip
 *   are always in sync — they share the same clock tick.
 */

import { DEFAULTS } from '../config.js';
import { fetchDepartures, lookupStopId } from '../entur/index.js';
import { formatCountdown } from '../time.js';
import { t, getLanguage } from '../i18n.js';
import { renderDepartures } from './render.js';
import { getDisplayedN } from './scroll-loader.js';

/** Ticks remaining until the next automatic refresh (counts down to 0) */
let ticksUntilRefresh = DEFAULTS.FETCH_INTERVAL;

/** setInterval handle for the unified 1-second loop */
let loopTimerId = null;

/** Stored visibilitychange handler so it can be removed before re-adding */
let _visibilityHandler = null;

/** Guard: prevents a second concurrent fetch if the previous one is still running */
let fetchInFlight = false;

/** Wall-clock timestamp (ms) of the last completed fetch attempt */
let lastFetchAt = Date.now();

/** The most recently fetched departure data (kept for re-render on settings change) */
export let data = [];

/**
 * Fetch live departures and re-render the list.
 * On failure the error is logged and any previous data is left in place.
 * Resets ticksUntilRefresh to the current FETCH_INTERVAL when complete.
 *
 * @param {HTMLElement} listEl          - The departure list container
 * @param {number}      [numDepartures] - Override departure count (scroll-load
 *                                        temporary expansion); falls back to
 *                                        DEFAULTS.NUM_DEPARTURES when omitted.
 */
export async function doRefresh(listEl, numDepartures) {
  if (fetchInFlight) return;
  fetchInFlight = true;
  const n = (typeof numDepartures === 'number' && numDepartures > 0)
    ? numDepartures
    : DEFAULTS.NUM_DEPARTURES;
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
          numDepartures: n,
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
    // Always reset the countdown after a fetch attempt so the next cycle
    // starts cleanly from the full interval, regardless of success/failure.
    ticksUntilRefresh = DEFAULTS.FETCH_INTERVAL;
    lastFetchAt = Date.now();
    fetchInFlight = false;
  }
}

/**
 * (Re)start the unified 1-second loop.
 * Safe to call multiple times — clears any existing interval first.
 * Immediately fires the first tick so the UI is live without a 1-second delay.
 *
 * @param {HTMLElement}      listEl   - The departure list container
 * @param {HTMLElement|null} statusEl - The header status chip element
 */
export function startRefreshLoop(listEl, statusEl) {
  if (loopTimerId) clearInterval(loopTimerId);

  // Reset the counter to the full interval when the loop is (re)started.
  // This happens after a manual settings apply so the new interval takes effect.
  ticksUntilRefresh = DEFAULTS.FETCH_INTERVAL;

  // Wake-up guard: when the PWA resumes from background/sleep the OS freezes
  // setInterval, leaving stale data on screen. On visibility restore, check
  // how much wall-clock time has actually elapsed. If it exceeds the fetch
  // interval, trigger an immediate refresh so the board is never stale.
  //
  // IMPORTANT: remove any previous handler before adding the new one.
  // startRefreshLoop() is called on every station change and settings apply;
  // without this guard, stale handlers accumulate and fire on every wake-up.
  if (_visibilityHandler) {
    document.removeEventListener('visibilitychange', _visibilityHandler);
  }
  _visibilityHandler = () => {
    if (document.visibilityState !== 'visible') return;
    const elapsedSec = (Date.now() - lastFetchAt) / 1000;
    if (elapsedSec >= DEFAULTS.FETCH_INTERVAL) {
      ticksUntilRefresh = DEFAULTS.FETCH_INTERVAL; // reset chip display
      doRefresh(listEl, getDisplayedN()).catch(err => console.warn('Wake-up refresh failed', err));
    }
  };
  document.addEventListener('visibilitychange', _visibilityHandler);

  loopTimerId = setInterval(() => {
    // 1. Decrement first so we never show FETCH_INTERVAL on the chip
    //    (it would only appear for one frame after a fetch completes).
    ticksUntilRefresh--;

    // 2. Trigger fetch when the counter hits zero.
    if (ticksUntilRefresh <= 0) {
      // Reset eagerly before the async call so the chip immediately shows
      // the full interval rather than staying at 0 for the fetch duration.
      ticksUntilRefresh = DEFAULTS.FETCH_INTERVAL;
      doRefresh(listEl, getDisplayedN()).catch(err => console.warn('Refresh failed', err));
    }

    // 3. Tick all countdowns and update the status chip in the same frame.
    tickCountdowns(listEl, statusEl);
  }, 1000);
}

/**
 * Per-second ticker: updates all departure countdown chips and the status chip.
 * Called once per second by the unified loop in startRefreshLoop.
 * Can also be called directly for an immediate paint on first load.
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

  // Update the header status chip with the tick-accurate seconds until refresh.
  // ticksUntilRefresh is always an integer already — no ceil/floor needed.
  if (statusEl) {
    const secLeft = Math.max(0, ticksUntilRefresh);
    statusEl.textContent = `${t('updatingIn')} ${secLeft}${t('seconds')}`;
  }
}
