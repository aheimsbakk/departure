// settings-store.js — localStorage persistence, input validation, change detection
import { ALL_TRANSPORT_MODES } from '../../config.js';

const STORAGE_KEY = 'departure:settings';

/** Load persisted settings from localStorage. Returns null on failure. */
export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/** Persist settings to localStorage. Silently ignores write errors. */
export function saveSettings(opts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(opts));
  } catch (e) { /* ignore */ }
}

/**
 * Validate and normalise raw form values against defaults.
 * Enforces minimums and fills missing fields.
 * @param {object} raw   — { STATION_NAME, STOP_ID, NUM_DEPARTURES, FETCH_INTERVAL, TRANSPORT_MODES, TEXT_SIZE }
 * @param {object} defaults
 * @returns {object} normalised options object
 */
export function validateOptions(raw, defaults) {
  let numDepartures = Number(raw.NUM_DEPARTURES) || defaults.NUM_DEPARTURES;
  if (numDepartures < 1) numDepartures = 1;

  let fetchInterval = Number(raw.FETCH_INTERVAL) || defaults.FETCH_INTERVAL;
  if (fetchInterval < 20) fetchInterval = 20;

  const modes = Array.isArray(raw.TRANSPORT_MODES) && raw.TRANSPORT_MODES.length
    ? raw.TRANSPORT_MODES
    : ALL_TRANSPORT_MODES;

  return {
    STATION_NAME: raw.STATION_NAME || defaults.STATION_NAME,
    STOP_ID: raw.STOP_ID || null,
    NUM_DEPARTURES: numDepartures,
    FETCH_INTERVAL: fetchInterval,
    TRANSPORT_MODES: modes,
    TEXT_SIZE: raw.TEXT_SIZE || defaults.TEXT_SIZE || 'large',
  };
}

/**
 * Returns true if any field differs between two options objects.
 * TRANSPORT_MODES compared as sorted JSON.
 */
export function diffOptions(a, b) {
  return (
    a.STATION_NAME !== b.STATION_NAME ||
    a.STOP_ID !== b.STOP_ID ||
    a.NUM_DEPARTURES !== b.NUM_DEPARTURES ||
    a.FETCH_INTERVAL !== b.FETCH_INTERVAL ||
    a.TEXT_SIZE !== b.TEXT_SIZE ||
    JSON.stringify((a.TRANSPORT_MODES || []).slice().sort()) !==
      JSON.stringify((b.TRANSPORT_MODES || []).slice().sort())
  );
}
