/**
 * mode-utils.js — Shared transport-mode display helpers
 *
 * Single source of truth for mode→emoji and mode→readable-label mappings.
 * Import from here instead of duplicating these functions across departure.js,
 * station-dropdown.js, and transport-modes.js.
 */

import { TRANSPORT_MODE_EMOJIS } from '../config.js';

/**
 * Map a transport mode string to its display emoji.
 * Handles localised aliases (trikk, t-bane, tog, ferje, boat, train).
 *
 * @param {string|null|undefined} mode
 * @returns {string} Emoji character or the default fallback emoji
 */
export function emojiForMode(mode) {
  if (!mode) return TRANSPORT_MODE_EMOJIS.default;
  const m = String(mode).toLowerCase();
  if (m.includes('bus')) return TRANSPORT_MODE_EMOJIS.bus;
  if (m.includes('tram') || m.includes('trikk')) return TRANSPORT_MODE_EMOJIS.tram;
  if (m.includes('metro') || m.includes('t-bane') || m.includes('tbane'))
    return TRANSPORT_MODE_EMOJIS.metro;
  if (m.includes('rail') || m.includes('train') || m.includes('tog'))
    return TRANSPORT_MODE_EMOJIS.rail;
  if (m.includes('water') || m.includes('ferry') || m.includes('ferje') || m.includes('boat'))
    return TRANSPORT_MODE_EMOJIS.water;
  if (m.includes('coach')) return TRANSPORT_MODE_EMOJIS.coach;
  return TRANSPORT_MODE_EMOJIS.default;
}

/**
 * Map a transport mode string to an English readable label.
 *
 * @param {string|null|undefined} mode
 * @returns {string} Capitalised English label or empty string for unknown modes
 */
export function labelForMode(mode) {
  if (!mode) return '';
  const m = String(mode).toLowerCase();
  if (m.includes('bus')) return 'Bus';
  if (m.includes('tram') || m.includes('trikk')) return 'Tram';
  if (m.includes('metro') || m.includes('t-bane') || m.includes('tbane')) return 'Metro';
  if (m.includes('rail') || m.includes('train') || m.includes('tog')) return 'Train';
  if (m.includes('water') || m.includes('ferry') || m.includes('ferje') || m.includes('boat'))
    return 'Ferry';
  if (m.includes('coach')) return 'Coach';
  return '';
}
