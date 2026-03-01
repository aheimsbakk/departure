/**
 * geocoder.js — Entur geocoder / station search
 *
 * Stop-place ID lookup and full-text station autocomplete via the Entur
 * geocoder REST API.
 */

import { getContentType } from './http.js';

/**
 * Look up the NSR stop-place ID for a station by name using the Entur geocoder.
 * Returns the ID of the first feature in the response, or null on failure.
 *
 * @param {Object}   opts
 * @param {string}   opts.stationName   - Free-text station name
 * @param {string}   [opts.clientName]
 * @param {Function} [opts.fetchFn]
 * @param {string}   [opts.geocodeUrl]
 * @returns {Promise<string|null>}
 */
export async function lookupStopId({
  stationName,
  clientName  = 'personal-js-app',
  fetchFn     = fetch,
  geocodeUrl  = 'https://api.entur.io/geocoder/v1/autocomplete'
}) {
  if (!stationName) throw new Error('stationName required');

  const url = `${geocodeUrl}?text=${encodeURIComponent(stationName)}&lang=no`;
  const r   = await fetchFn(url, { headers: { 'ET-Client-Name': clientName } });

  if (!r)                                               return null;
  if (typeof r.ok !== 'undefined' && r.ok === false)    return null;

  const ct = getContentType(r);
  if (ct && !/application\/json/i.test(ct))             return null;

  try {
    const j = await r.json();
    return j?.features?.[0]?.properties?.id ?? null;
  } catch (_) {
    return null;
  }
}

/**
 * Full-text station autocomplete via the Entur geocoder.
 *
 * Returns up to `limit` candidate objects: { id, title, raw }.
 *
 * Design notes:
 * - We intentionally omit layer/category filters because the Entur geocoder
 *   has known bugs with these filters when Norwegian characters are present
 *   (e.g. "Støren" returns wrong results when categories=busStation is set).
 * - We request a larger result set (size=50) and apply client-side relevance
 *   scoring to surface the best match first.
 * - Only 'venue' layer results (actual transport stops) are kept.
 *
 * @param {Object}   opts
 * @param {string}   opts.text          - Search query (minimum 1 character)
 * @param {number}   [opts.limit=5]     - Maximum results to return
 * @param {Function} [opts.fetchFn]
 * @param {string}   [opts.clientName]
 * @param {string}   [opts.geocodeUrl]
 * @returns {Promise<Array<{ id: string|null, title: string, raw: Object }>>}
 */
export async function searchStations({
  text,
  limit       = 5,
  fetchFn     = fetch,
  clientName  = 'personal-js-app',
  geocodeUrl  = 'https://api.entur.io/geocoder/v1/autocomplete'
}) {
  if (!text || String(text).trim().length < 1) return [];

  // Request more results than needed to compensate for fuzzy-ranking issues
  const fetchSize = Math.max(50, limit * 10);
  const url = `${geocodeUrl}?text=${encodeURIComponent(text)}&lang=no&size=${fetchSize}`;

  try {
    const r = await fetchFn(url, { headers: { 'ET-Client-Name': clientName } });
    if (!r)                                               return [];
    if (typeof r.ok !== 'undefined' && r.ok === false)    return [];

    const ct = getContentType(r);
    if (ct && !/application\/json/i.test(ct))             return [];

    const j = await r.json();
    if (!j || !Array.isArray(j.features)) return [];

    // Keep only venue-layer results (actual transport stops, not addresses)
    const venues = j.features.filter(f => f?.properties?.layer === 'venue');

    // Score results by how well the name matches the search query, so that
    // exact/prefix matches rank higher than fuzzy matches from the API.
    const queryLower = text.toLowerCase();
    const scored = venues.map(f => {
      const name  = (f.properties.name  || '').toLowerCase();
      const label = (f.properties.label || '').toLowerCase();
      let score = 0;
      if (name === queryLower)            score += 1000;
      else if (name.startsWith(queryLower)) score +=  500;
      else if (name.includes(queryLower))   score +=  100;
      if (label.startsWith(queryLower))   score +=   50;
      else if (label.includes(queryLower)) score +=   10;
      return { feature: f, score };
    });

    // Stable sort: higher score first, original order preserved on ties
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map(({ feature: f }) => ({
      id:    f?.properties?.id    ?? null,
      title: f?.properties?.label ?? f?.properties?.name ?? f?.properties?.title ?? f?.text ?? '',
      raw:   f
    }));
  } catch (_) {
    return [];
  }
}
