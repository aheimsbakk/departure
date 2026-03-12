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
 * Maps every Entur Geocoder venue category (docs/entur-apis/geocorder-rev.md)
 * to a JourneyPlanner transport mode name used in this app.
 *
 * Unmapped categories (intentionally omitted — no matching VALID_MODES entry):
 *   airport             → 'air'     (air travel not supported by this app)
 *   liftStation         → gondola / funicular (not supported)
 *   other               → no canonical mode
 */
const CATEGORY_TO_MODE = {
  onstreetbus:            'bus',
  busstation:             'bus',
  coachstation:           'coach',
  onstreettram:           'tram',
  tramstation:            'tram',
  railstation:            'rail',
  vehiclerailinterchange: 'rail',
  metrostation:           'metro',
  harbourport:            'water',
  ferryport:              'water',
  ferrystop:              'water',
};

/**
 * Extract and normalise transport modes from a Pelias feature's properties.
 *
 * The Entur Geocoder reverse API returns `mode` as an array of single-key
 * objects, e.g. [{metro: null}, {bus: null}]. It may also carry a `modes`
 * array of strings (older/test format), a plain `mode` string, or a
 * `category` array of geocoder category names (e.g. 'metroStation').
 *
 * @param {Object} props - Feature properties object
 * @returns {string[]} Lowercase mode strings filtered to known transport modes
 */
function extractModes(props) {
  // 1. `modes` — plain string array (test / hypothetical future format)
  if (Array.isArray(props.modes) && props.modes.length) {
    return props.modes.map(m => String(m).toLowerCase()).filter(m => VALID_MODES.has(m));
  }

  // 2. `mode` — live API returns [{metro: null}, {bus: null}] or a string array
  if (Array.isArray(props.mode) && props.mode.length) {
    const raw = props.mode.flatMap(m =>
      typeof m === 'string'
        ? [m]
        : (m && typeof m === 'object' ? Object.keys(m) : [])
    );
    const result = raw.map(m => String(m).toLowerCase()).filter(m => VALID_MODES.has(m));
    if (result.length) return result;
  }

  if (typeof props.mode === 'string' && props.mode) {
    const m = props.mode.toLowerCase();
    if (VALID_MODES.has(m)) return [m];
  }

  // 3. `category` — geocoder category strings, map to mode names
  if (Array.isArray(props.category) && props.category.length) {
    return [...new Set(
      props.category
        .map(c => CATEGORY_TO_MODE[String(c).toLowerCase()])
        .filter(Boolean)
    )];
  }

  return [];
}

/**
 * Fetch nearby stop places based on GPS coordinates.
 *
 * @param {Object}   opts
 * @param {number}   opts.lat               - Latitude (WGS 84)
 * @param {number}   opts.lon               - Longitude (WGS 84)
 * @param {number}   [opts.maxResults=7]    - Maximum stop places to return
 * @param {number}   [opts.radiusKm=2]      - Search radius in kilometres (boundary.circle.radius)
 * @param {string}   [opts.clientName]      - ET-Client-Name header value
 * @param {Function} [opts.fetchFn]         - Fetch implementation (injectable for tests)
 * @param {string}   [opts.geocodeUrl]      - Override reverse geocode endpoint
 * @returns {Promise<Array<{ id: string, name: string, modes: string[], distance: number|null }>>}
 */
export async function fetchNearbyStops({
  lat,
  lon,
  maxResults = 7,
  radiusKm   = 2,
  clientName = 'personal-js-app',
  fetchFn    = fetch,
  geocodeUrl = GEOCODE_REVERSE_URL
}) {
  if (lat == null || lon == null) throw new Error('lat and lon are required');

  const params = new URLSearchParams({
    'point.lat':                String(lat),
    'point.lon':                String(lon),
    size:                       String(maxResults),
    layers:                     'venue',
    'boundary.circle.radius':   String(radiusKm),
    'boundary.country':         'NOR'
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
          distance: typeof p.distance === 'number' ? Math.round(p.distance * 1000) : null
        };
      })
      .filter(s => s.id && s.name);
  } catch (_) {
    return [];
  }
}
