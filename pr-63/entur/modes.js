/**
 * modes.js — Transport mode mapping utilities
 *
 * Canonical mode map and helpers for normalising raw API transport-mode tokens
 * into the UI mode strings used throughout the app.
 */

/**
 * Canonical transport-mode map: raw token → UI mode string.
 * Used both for parsing response data and filtering.
 * @type {Map<string, string>}
 */
export const CANONICAL_MODE_MAP = new Map([
  ['bus',        'bus'],
  ['buss',       'bus'],
  ['coach',      'coach'],
  ['tram',       'tram'],
  ['trikk',      'tram'],
  ['metro',      'metro'],
  ['t-bane',     'metro'],
  ['tbane',      'metro'],
  ['subway',     'metro'],
  ['underground','metro'],
  ['rail',       'rail'],
  ['train',      'rail'],
  ['tog',        'rail'],
  ['s-tog',      'rail'],
  ['water',      'water'],
  ['ferry',      'water'],
  ['ferje',      'water'],
  ['boat',       'water'],
  ['ship',       'water']
]);

/**
 * Map a single transport-mode token to its canonical UI string.
 * Returns null when the token is not recognised.
 * @param {string|null|undefined} token
 * @returns {string|null}
 */
export function mapTokenToCanonical(token) {
  if (!token) return null;
  const lower = String(token).toLowerCase();
  for (const [key, value] of CANONICAL_MODE_MAP) {
    if (lower.includes(key)) return value;
  }
  return null;
}

/**
 * Extract a string value from a possibly object/string field.
 * Handles { value, id, name } shapes returned by the Entur API.
 * @param {*} v
 * @returns {string|null}
 */
export function extractString(v) {
  if (v == null) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'object') {
    if (typeof v.value === 'string') return v.value;
    if (typeof v.id    === 'string') return v.id;
    if (typeof v.name  === 'string') return v.name;
  }
  return null;
}

/**
 * Recursively scan an object/array tree for any string value whose lowercase
 * form matches a known transport-mode token. Returns the canonical mode on the
 * first match, or null when nothing matches.
 *
 * This is an intentional fallback used when the preferred explicit field paths
 * in the API response do not contain a usable mode string.
 *
 * @param {*} raw - Arbitrary object from the API response
 * @returns {string|null}
 */
export function detectModeFromRaw(raw) {
  if (!raw) return null;

  const tokens = Array.from(CANONICAL_MODE_MAP.keys());

  // Check a small set of well-known shallow fields first (fast path)
  const shallowKeys = ['transportMode', 'mode', 'serviceType', 'product', 'transportSubmode', 'vehicleMode', 'type'];
  for (const k of shallowKeys) {
    const s = extractString(raw[k]);
    if (s) {
      const mode = mapTokenToCanonical(s);
      if (mode) return mode;
    }
  }

  // Recursive deep scan (slow path, runs only when shallow check fails)
  const seen = new Set();
  const stack = [raw];
  while (stack.length) {
    const cur = stack.pop();
    if (!cur || seen.has(cur)) continue;
    seen.add(cur);

    if (typeof cur === 'string') {
      const low = cur.toLowerCase();
      for (const t of tokens) {
        if (low.includes(t)) return CANONICAL_MODE_MAP.get(t);
      }
      continue;
    }
    if (Array.isArray(cur)) {
      for (const item of cur) stack.push(item);
      continue;
    }
    if (typeof cur === 'object') {
      // Check key names themselves for mode hints
      for (const k of Object.keys(cur)) {
        const lk = String(k).toLowerCase();
        for (const t of tokens) {
          if (lk.includes(t)) return CANONICAL_MODE_MAP.get(t);
        }
        stack.push(cur[k]);
      }
    }
  }
  return null;
}
