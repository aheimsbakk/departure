/**
 * departures.js — Departure fetch orchestration
 *
 * Drives the variant retry loop: tries multiple GraphQL query shapes in order
 * until one returns valid data, then applies client-side mode filtering when
 * the server fell back to the no-filter variant.
 */

import { buildQuery, buildVariants } from './query.js';
import { postAndParse } from './http.js';
import { parseEnturResponse } from './parser.js';

/**
 * Client-side transport-mode filter: return true when the raw call object
 * contains an exact-match string for any of the requested modes.
 *
 * Used only when the server query fell back to no-filter mode.
 *
 * @param {Object}   rawObj     - Raw API call object
 * @param {string[]} lowerModes - Lowercase mode strings to match
 * @returns {boolean}
 */
function rawMatchesModes(rawObj, lowerModes) {
  if (!rawObj) return false;
  const stack = [rawObj];
  while (stack.length) {
    const cur = stack.pop();
    if (cur == null) continue;
    if (typeof cur === 'string') {
      const v = cur.toLowerCase();
      for (const m of lowerModes) if (v === m) return true;
      continue;
    }
    if (typeof cur === 'object') {
      if (Array.isArray(cur)) {
        for (const item of cur) stack.push(item);
      } else {
        for (const k of Object.keys(cur)) stack.push(cur[k]);
      }
    }
  }
  return false;
}

/**
 * Fetch upcoming departures for a given stop from the Entur journey-planner API.
 *
 * Multiple GraphQL query variants are tried in sequence until one returns valid
 * data. This is required because the server is strict about the AST shape of
 * the whiteListedModes argument and different API versions accept different forms.
 *
 * When the server falls back to the no-filter variant, client-side mode
 * filtering is applied over the parsed results to honour the caller's selection.
 *
 * @param {Object}   opts
 * @param {string}   opts.stopId          - NSR stop-place ID (required)
 * @param {number}   [opts.numDepartures=2]
 * @param {string[]} [opts.modes=['bus']]
 * @param {string}   [opts.lang='en']     - UI language code for situation text selection
 * @param {string}   [opts.apiUrl]        - GraphQL endpoint URL
 * @param {string}   [opts.clientName]    - ET-Client-Name header value
 * @param {Function} [opts.fetchFn=fetch] - Fetch implementation (injectable for tests)
 * @returns {Promise<Array<Object>>}      - Array of normalised departure objects
 * @throws {Error}  On unrecoverable network/parse failures
 */
export async function fetchDepartures({
  stopId,
  numDepartures = 2,
  modes         = ['bus'],
  lang          = 'en',
  apiUrl        = 'https://api.entur.io/journey-planner/v3/graphql',
  clientName    = 'personal-js-app',
  fetchFn       = fetch
}) {
  if (!stopId)  throw new Error('stopId required');
  if (!apiUrl)  throw new Error('apiUrl required');

  const variants = buildVariants(modes);

  let json        = null;
  let resp        = null;
  let usedVariant = null;

  // Try each variant; stop as soon as one returns a valid (error-free) payload.
  for (const variant of variants) {
    const { query, variables } = buildQuery(stopId, numDepartures, variant.opts);
    try {
      ({ json, resp } = await postAndParse(apiUrl, clientName, fetchFn, query, variables));

      // If GraphQL returned an errors array, this variant's AST was rejected —
      // continue to the next form.
      if (json && Array.isArray(json.errors) && json.errors.length) {
        json = null;
        resp = null;
        continue;
      }

      usedVariant = variant.name;
      break;
    } catch (err) {
      // Propagate SyntaxErrors (non-JSON / parse failures) immediately — these
      // indicate a real network or proxy problem, not a query shape issue.
      if (err instanceof SyntaxError) throw err;
      // For any other error, try the next variant.
      continue;
    }
  }

  if (!resp) throw new Error('All query variants exhausted — no response received');

  // Verify the final response is healthy (guard against variants that set resp
  // but produced a non-OK status we hadn't checked yet).
  if (typeof resp.ok !== 'undefined' && resp.ok === false) {
    const txt = typeof resp.text === 'function' ? await resp.text().catch(() => '<no body>') : '<no body>';
    throw new Error(`Network error: ${resp.status ?? 'unknown'} ${resp.statusText ?? ''} — ${String(txt).slice(0, 200)}`);
  }

  let parsed = parseEnturResponse(json, lang);

  // When we fell back to the no-filter server query, apply client-side filtering
  // to honour the caller's mode selection (the server returned unfiltered data).
  if (Array.isArray(modes) && modes.length > 0 && usedVariant === 'no-filter') {
    const lowerModes = modes.map(m => String(m).toLowerCase());
    parsed = parsed.filter(p => rawMatchesModes(p.raw, lowerModes));
  }

  if (Array.isArray(parsed) && parsed.length === 0) {
    console.warn('Entur returned 0 departures for stop:', stopId, 'variant used:', usedVariant);
  }

  return parsed;
}
