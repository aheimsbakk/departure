/**
 * url-import.js — Shared-board URL decoding and URL hygiene
 *
 * Responsibilities:
 *   - Strip the SW cache-busting ?t= param on load
 *   - Decode ?b= / ?board= shared-board params into DEFAULTS
 *   - Seed the station into favorites
 *   - Persist imported settings and clean the URL
 */

import { DEFAULTS } from '../config.js';
import { initLanguage } from '../i18n.js';
import { addRecentStation } from '../ui/station-dropdown.js';
import { decodeSettings } from '../ui/share-button.js';
import { saveSettings } from './settings.js';

/**
 * Handle URL parameters on startup.
 *
 * - Removes the ?t= cache-bust param added by the SW auto-reload.
 * - Decodes a ?b= or ?board= shared-board param, applies it to DEFAULTS,
 *   seeds the station into favorites, persists to localStorage, and cleans
 *   the URL so a hard-reload does not re-import.
 *
 * @returns {boolean} true when a shared board was successfully imported
 */
export function processUrlParams() {
  try {
    const urlParams = new URLSearchParams(window.location.search);

    // Remove the service-worker cache-busting timestamp added on auto-reload
    if (urlParams.has('t')) {
      window.history.replaceState({}, '', window.location.pathname);
    }

    const boardParam = urlParams.get('b') || urlParams.get('board');
    if (!boardParam) return false;

    const shared = decodeSettings(boardParam);
    if (!shared) return false;

    // Apply all decoded fields to DEFAULTS
    DEFAULTS.STATION_NAME    = shared.stationName;
    DEFAULTS.STOP_ID         = shared.stopId;
    DEFAULTS.TRANSPORT_MODES = shared.transportModes;
    DEFAULTS.NUM_DEPARTURES  = shared.numDepartures;
    DEFAULTS.FETCH_INTERVAL  = shared.fetchInterval;
    DEFAULTS.TEXT_SIZE       = shared.textSize;

    // Persist the imported language so it survives a reload
    if (shared.language) {
      try {
        localStorage.setItem('departure:language', shared.language);
        initLanguage();
      } catch (_) { /* ignore */ }
    }

    // Add to favorites so the shared station appears in the dropdown
    if (shared.stationName && shared.stopId) {
      addRecentStation(shared.stationName, shared.stopId, shared.transportModes || [], {
        numDepartures: shared.numDepartures,
        fetchInterval: shared.fetchInterval,
        textSize:      shared.textSize,
        language:      shared.language
      });
    }

    // Persist to localStorage so settings survive after URL is cleaned
    saveSettings();

    // Clean the URL to prevent accidental re-import on hard reload
    window.history.replaceState({}, '', window.location.pathname);

    return true;
  } catch (err) {
    console.warn('Failed to decode shared board URL', err);
    return false;
  }
}
