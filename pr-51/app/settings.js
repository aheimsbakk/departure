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
  'text-size-xlarge'
];

/**
 * Load persisted settings from localStorage into DEFAULTS.
 * Merges saved values, preserving any keys not present in the saved snapshot
 * (forward-compatibility with new settings fields).
 */
export function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) Object.assign(DEFAULTS, JSON.parse(saved));
  } catch (_) { /* ignore corrupt storage */ }
}

/**
 * Persist the current DEFAULTS object to localStorage.
 */
export function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULTS));
  } catch (_) { /* ignore */ }
}

/**
 * Apply the given text-size class to <html>, removing any previous one.
 * @param {string} size - One of: tiny | small | medium | large | xlarge
 */
export function applyTextSize(size) {
  try {
    document.documentElement.classList.remove(...TEXT_SIZE_CLASSES);
    document.documentElement.classList.add(`text-size-${size || 'medium'}`);
  } catch (_) { /* non-critical */ }
}
