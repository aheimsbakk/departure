/**
 * gps-search.js — Nearby stop-place lookup via Entur Geocoder reverse API
 *
 * Uses the Pelias-based reverse-geocoder endpoint:
 *   GET https://api.entur.io/geocoder/v1/reverse
 *
 * Returns stop places (venues) sorted by proximity, each with a normalised
 * `modes` array extracted from whichever Pelias property carries mode data.
 */

const GEOCODE_REVERSE_URL = 'https://api.entur.io/geocoder/v1/reverse';
const VALID_MODES = new Set(['bus', 'tram', 'metro', 'rail', 'water', 'coach']);

/**
 * Extract and normalise transport modes from a Pelias feature's properties.
 * Pelias may expose modes as `modes` (array), `mode` (string|array), or
 * `category` (array of strings that may include mode names).
 *
 * @param {Object} props - Feature properties object
 * @returns {string[]} Lowercase mode strings filtered to known transport modes
 */
function extractModes(props) {
  let raw = [];
  if (Array.isArray(props.modes) && props.modes.length)       raw = props.modes;
  else if (Array.isArray(props.mode) && props.mode.length)    raw = props.mode;
  else if (typeof props.mode === 'string' && props.mode)      raw = [props.mode];
  else if (Array.isArray(props.category) && props.category.length) raw = props.category;

  return raw.map(m => String(m).toLowerCase()).filter(m => VALID_MODES.has(m));
}

/**
 * Fetch nearby stop places based on GPS coordinates.
 *
 * @param {Object}   opts
 * @param {number}   opts.lat             - Latitude (WGS 84)
 * @param {number}   opts.lon             - Longitude (WGS 84)
 * @param {number}   [opts.maxResults=7]  - Maximum stop places to return
 * @param {string}   [opts.clientName]    - ET-Client-Name header value
 * @param {Function} [opts.fetchFn]       - Fetch implementation (injectable for tests)
 * @param {string}   [opts.geocodeUrl]    - Override reverse geocode endpoint
 * @returns {Promise<Array<{ id: string, name: string, modes: string[], distance: number|null }>>}
 */
export async function fetchNearbyStops({
  lat,
  lon,
  maxResults = 7,
  clientName = 'personal-js-app',
  fetchFn    = fetch,
  geocodeUrl = GEOCODE_REVERSE_URL
}) {
  if (lat == null || lon == null) throw new Error('lat and lon are required');

  const params = new URLSearchParams({
    'point.lat':        String(lat),
    'point.lon':        String(lon),
    size:               String(maxResults),
    layers:             'venue',
    'boundary.country': 'NOR'
  });

  try {
    const r = await fetchFn(`${geocodeUrl}?${params}`, {
      headers: { 'ET-Client-Name': clientName }
    });

    if (!r || (typeof r.ok !== 'undefined' && r.ok === false)) return [];

    const j = await r.json();
    if (!j || !Array.isArray(j.features)) return [];

    return j.features
      .filter(f => f?.properties?.layer === 'venue')
      .map(f => {
        const p = f.properties || {};
        return {
          id:       p.id    || null,
          name:     p.name  || p.label || '',
          modes:    extractModes(p),
          distance: typeof p.distance === 'number' ? Math.round(p.distance) : null
        };
      })
      .filter(s => s.id && s.name);
  } catch (_) {
    return [];
  }
}
