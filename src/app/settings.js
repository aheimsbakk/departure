/**
 * settings.js — Settings persistence and text-size management
 *
 * Responsibilities:
 *   - Load persisted settings from localStorage into DEFAULTS
 *   - Save current DEFAULTS back to localStorage
 *   - Apply text-size CSS class to <html>
 */

import { DEFAULTS } from '../config.js';

const STORAGE_KEY = 'departure:settings';

/** All supported text-size CSS class names */
const TEXT_SIZE_CLASSES = [
  'text-size-tiny',
  'text-size-small',
  'text-size-medium',
  'text-size-large',
  'text-size-xlarge',
];

/** Valid text-size tokens */
const VALID_TEXT_SIZES = ['tiny', 'small', 'medium', 'large', 'xlarge'];

/** Valid transport mode tokens */
const VALID_MODES = ['bus', 'tram', 'metro', 'rail', 'water', 'coach'];

/**
 * Load persisted settings from localStorage into DEFAULTS.
 * Only known keys are merged, and each value is validated for type and range
 * before being applied — prevents prototype pollution and corrupt-storage bugs.
 * (Rule §5: validate all external inputs.)
 */
export function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return;

    if (typeof parsed.STATION_NAME === 'string') {
      DEFAULTS.STATION_NAME = parsed.STATION_NAME;
    }
    if (typeof parsed.STOP_ID === 'string' || parsed.STOP_ID === null) {
      DEFAULTS.STOP_ID = parsed.STOP_ID;
    }
    if (
      typeof parsed.NUM_DEPARTURES === 'number' &&
      Number.isFinite(parsed.NUM_DEPARTURES) &&
      parsed.NUM_DEPARTURES >= 1 &&
      parsed.NUM_DEPARTURES <= 50
    ) {
      DEFAULTS.NUM_DEPARTURES = Math.floor(parsed.NUM_DEPARTURES);
    }
    if (
      typeof parsed.FETCH_INTERVAL === 'number' &&
      Number.isFinite(parsed.FETCH_INTERVAL) &&
      parsed.FETCH_INTERVAL >= 10 &&
      parsed.FETCH_INTERVAL <= 600
    ) {
      DEFAULTS.FETCH_INTERVAL = Math.floor(parsed.FETCH_INTERVAL);
    }
    if (Array.isArray(parsed.TRANSPORT_MODES)) {
      const modes = parsed.TRANSPORT_MODES.filter(
        (m) => typeof m === 'string' && VALID_MODES.includes(m)
      );
      if (modes.length > 0) DEFAULTS.TRANSPORT_MODES = modes;
    }
    if (typeof parsed.TEXT_SIZE === 'string' && VALID_TEXT_SIZES.includes(parsed.TEXT_SIZE)) {
      DEFAULTS.TEXT_SIZE = parsed.TEXT_SIZE;
    }
  } catch (_) {
    /* ignore corrupt storage */
  }
}

/**
 * Persist the current DEFAULTS object to localStorage.
 */
export function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULTS));
  } catch (_) {
    /* ignore */
  }
}

/**
 * Apply the given text-size class to <html>, removing any previous one.
 * @param {string} size - One of: tiny | small | medium | large | xlarge
 */
export function applyTextSize(size) {
  try {
    document.documentElement.classList.remove(...TEXT_SIZE_CLASSES);
    document.documentElement.classList.add(`text-size-${size || 'medium'}`);
  } catch (_) {
    /* non-critical */
  }
}
