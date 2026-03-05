/**
 * handlers.js — User-action callbacks
 *
 * Responsibilities:
 *   - handleStationSelect: favorites dropdown station pick
 *   - handleFavoriteToggle: heart button click
 *   - onApplySettings: options panel "Apply" action
 *   - onLanguageChange: options panel language switch
 *
 * All handlers close over the shared `board` and `opts` references that are
 * passed in at wiring time, keeping this module free of global state.
 */

import { DEFAULTS } from '../config.js';
import { t, getLanguage } from '../i18n.js';
import { updateFooterTranslations, updateFavoriteButton } from '../ui/ui.js';
import { addRecentStation, removeFromFavorites, isStationInFavorites } from '../ui/station-dropdown.js';
import { saveSettings, applyTextSize } from './settings.js';
import { doRefresh, startRefreshLoop } from './fetch-loop.js';

/**
 * Wire all user-action handlers and return them as a plain object.
 *
 * @param {Object}      board           - Board element refs from createBoardElements
 * @param {Object}      shareComponents - { button } from createShareButton
 * @param {HTMLElement} themeBtn        - Theme toggle button element
 * @param {HTMLElement} settingsBtn     - Settings gear button element
 * @param {{ updateFields?: Function }} optsRef - Mutable ref to the options panel API
 * @returns {{ handleStationSelect, handleFavoriteToggle, onApplySettings, onLanguageChange }}
 */
export function wireHandlers(board, shareComponents, themeBtn, settingsBtn, optsRef, gpsRef = {}) {

  /**
   * Keep button tooltips in sync after a language change.
   */
  function updateButtonTooltips() {
    shareComponents.button.title = t('shareBoard');
    shareComponents.button.setAttribute('aria-label', t('shareBoard'));
    themeBtn.title    = t('themeTooltip');
    settingsBtn.title = t('settingsTooltip');
    if (gpsRef.current?.updateTooltip) gpsRef.current.updateTooltip();
    updateFavoriteButton(board.favoriteBtn, DEFAULTS.STOP_ID, DEFAULTS.TRANSPORT_MODES);
  }

  /**
   * Shared core for activating a new station.
   * Updates DEFAULTS, syncs UI, optionally promotes to favorites, and triggers a refresh.
   *
   * @param {Object}  station         - { name, stopId, modes, numDepartures?, fetchInterval?, textSize?, language? }
   * @param {boolean} addToFavorites  - When true, upserts into the favorites list and refreshes the dropdown
   */
  function applyStation(station, addToFavorites) {
    DEFAULTS.STATION_NAME = station.name;
    DEFAULTS.STOP_ID      = station.stopId;
    if (Array.isArray(station.modes)) {
      DEFAULTS.TRANSPORT_MODES = station.modes;
    }

    // Sync the dropdown title and, if the options panel is open, its fields
    board.stationDropdown.updateTitle(station.name, station.modes || DEFAULTS.TRANSPORT_MODES);
    if (document.body.classList.contains('options-open') && optsRef.current?.updateFields) {
      optsRef.current.updateFields();
    }

    if (addToFavorites) {
      // Move to top of favorites list, preserving the station's own settings
      addRecentStation(station.name, station.stopId, station.modes || [], {
        numDepartures: station.numDepartures ?? DEFAULTS.NUM_DEPARTURES,
        fetchInterval: station.fetchInterval ?? DEFAULTS.FETCH_INTERVAL,
        textSize:      station.textSize      ?? DEFAULTS.TEXT_SIZE,
        language:      station.language      ?? getLanguage()
      });
      board.stationDropdown.refresh();
    }

    // Update the browser tab title
    try { document.title = station.name || document.title; } catch (_) {}

    // Kick off a refresh with the new station then restart the unified loop
    doRefresh(board.list)
      .catch(err => console.warn('Station change refresh failed', err))
      .finally(() => startRefreshLoop(board.list, board.status));

    // Persist updated settings
    saveSettings();

    // Update heart button state
    updateFavoriteButton(board.favoriteBtn, DEFAULTS.STOP_ID, DEFAULTS.TRANSPORT_MODES);
  }

  /**
   * Called when the user selects a station from the favorites dropdown.
   * Promotes the selection to the top of the favorites list.
   *
   * @param {Object} station - { name, stopId, modes, numDepartures?, fetchInterval?, textSize?, language? }
   */
  function handleStationSelect(station) {
    applyStation(station, true);
  }

  /**
   * Called when the user selects a stop from the GPS nearby-stops dropdown.
   * Loads the stop without adding it to favorites — that is an explicit user action.
   *
   * @param {Object} station - { name, stopId, modes }
   */
  function handleGpsStationSelect(station) {
    // GPS selection sets station + ID only — never overrides current transport mode filter
    applyStation({ name: station.name, stopId: station.stopId }, false);
  }

  /**
   * Called when the user clicks the heart button.
   * If already in favorites: removes it. If not: adds it.
   */
  function handleFavoriteToggle() {
    if (DEFAULTS.STATION_NAME && DEFAULTS.STOP_ID) {
      if (isStationInFavorites(DEFAULTS.STOP_ID, DEFAULTS.TRANSPORT_MODES)) {
        removeFromFavorites(DEFAULTS.STOP_ID, DEFAULTS.TRANSPORT_MODES);
      } else {
        addRecentStation(DEFAULTS.STATION_NAME, DEFAULTS.STOP_ID, DEFAULTS.TRANSPORT_MODES, {
          numDepartures: DEFAULTS.NUM_DEPARTURES,
          fetchInterval: DEFAULTS.FETCH_INTERVAL,
          textSize:      DEFAULTS.TEXT_SIZE,
          language:      getLanguage()
        });
      }
      if (board.stationDropdown) board.stationDropdown.refresh();
      updateFavoriteButton(board.favoriteBtn, DEFAULTS.STOP_ID, DEFAULTS.TRANSPORT_MODES);
    }
  }

  /**
   * Called when the user applies new settings from the options panel.
   * Updates DEFAULTS, re-applies text size, and triggers an immediate refresh.
   *
   * @param {Object} newOpts - New settings values (mirrors DEFAULTS shape)
   */
  function onApplySettings(newOpts) {
    DEFAULTS.STATION_NAME    = newOpts.STATION_NAME;
    DEFAULTS.STOP_ID         = newOpts.STOP_ID || null;
    DEFAULTS.NUM_DEPARTURES  = newOpts.NUM_DEPARTURES;
    DEFAULTS.FETCH_INTERVAL  = newOpts.FETCH_INTERVAL;
    DEFAULTS.TRANSPORT_MODES = newOpts.TRANSPORT_MODES;
    DEFAULTS.TEXT_SIZE       = newOpts.TEXT_SIZE;

    // Sync the dropdown title
    if (board.stationDropdown) {
      board.stationDropdown.updateTitle(DEFAULTS.STATION_NAME, DEFAULTS.TRANSPORT_MODES);
    }
    try { document.title = DEFAULTS.STATION_NAME || document.title; } catch (_) {}

    applyTextSize(newOpts.TEXT_SIZE);
    updateFavoriteButton(board.favoriteBtn, DEFAULTS.STOP_ID, DEFAULTS.TRANSPORT_MODES);

    // Fetch with new settings then restart the unified loop so the new interval is used
    doRefresh(board.list)
      .catch(err => console.warn('Manual refresh failed', err))
      .finally(() => startRefreshLoop(board.list, board.status));
  }

  /**
   * Called when the options panel language changes.
   * Re-renders footer text and button tooltips with new translations.
   */
  function onLanguageChange() {
    updateFooterTranslations(board.footer);
    updateButtonTooltips();
  }

  return { handleStationSelect, handleGpsStationSelect, handleFavoriteToggle, onApplySettings, onLanguageChange };
}
