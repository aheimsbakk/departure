/**
 * parser.js — Entur GraphQL response parser
 *
 * Pure function: no side effects, safe to call in unit tests.
 * Converts a raw GraphQL response into normalised departure objects.
 */

import { mapTokenToCanonical, detectModeFromRaw } from './modes.js';

/**
 * Pick the best-matching text entry from a language-tagged array.
 *
 * Priority: preferred lang → 'en' → any first entry.
 *
 * @param {Array<{value:string,language:string}>} entries
 * @param {string} lang - BCP-47 language code (e.g. 'no', 'de', 'fr')
 * @returns {string|null}
 */
function pickLocalised(entries, lang) {
  if (!Array.isArray(entries) || entries.length === 0) return null;
  const find = code => entries.find(d => d.language === code);
  const entry = find(lang) ?? find('en') ?? entries[0];
  return entry?.value ?? null;
}

/**
 * Parse a raw Entur GraphQL response into an array of normalised departure
 * objects.
 *
 * Each returned object has:
 *   destination          {string}         — front-text of the destination display
 *   publicCode           {string|null}    — line/route number (e.g. "81", "L2")
 *   expectedDepartureISO {string|null}    — ISO-8601 expected departure time
 *   aimedDepartureISO    {string|null}    — ISO-8601 aimed departure time
 *   actualDepartureISO   {string|null}    — ISO-8601 actual departure time
 *   realtime             {boolean}        — true when live tracking data is used
 *   cancellation         {boolean}        — true when trip is cancelled
 *   predictionInaccurate {boolean}        — true when prediction confidence is low
 *   mode                 {string|null}    — canonical transport mode ('bus', 'rail', …)
 *   quay                 {Object|null}    — { id, publicCode } or null
 *   situations           {string[]}       — human-readable service disruption texts
 *   raw                  {Object}         — original call object (kept for downstream filtering)
 *
 * @param {Object} json        - Parsed JSON from the GraphQL endpoint
 * @param {string} [lang='en'] - UI language code; used to pick situation text
 * @returns {Array<Object>}
 */
export function parseEnturResponse(json, lang = 'en') {
  if (!json || !json.data || !json.data.stopPlace) return [];
  const calls = json.data.stopPlace.estimatedCalls || [];

  return calls.map(call => {
    // --- Destination ---
    const destination = call.destinationDisplay?.frontText ?? '';

    // --- Departure times ---
    const expectedDepartureISO   = call.expectedDepartureTime  ?? null;
    const aimedDepartureISO      = call.aimedDepartureTime     ?? null;
    const actualDepartureISO     = call.actualDepartureTime    ?? null;

    // --- Realtime flags ---
    const realtime             = call.realtime             === true;
    const cancellation         = call.cancellation         === true;
    const predictionInaccurate = call.predictionInaccurate === true;

    // --- Quay / platform ---
    const quay = call.quay
      ? { id: call.quay.id ?? null, publicCode: call.quay.publicCode ?? null }
      : null;

    // --- Service disruption texts ---
    // Priority: UI language → English → first available entry.
    const situations = [];
    if (Array.isArray(call.situations)) {
      for (const s of call.situations) {
        // Prefer description (more detailed) over summary.
        const source = Array.isArray(s?.description) ? s.description
                     : Array.isArray(s?.summary)     ? s.summary
                     : null;
        const text = pickLocalised(source, lang);
        if (text) situations.push(text);
      }
    }

    // --- Transport mode ---
    // Prefer explicit server-provided fields; fall back to recursive raw scan.
    let explicitMode = null;
    let publicCode   = null;
    try {
      const sj = call.serviceJourney;
      if (sj) {
        // Extract line number
        publicCode = sj.journeyPattern?.line?.publicCode ?? null;

        // Best path: serviceJourney.journeyPattern.line.transportMode
        const jpLineMode = sj.journeyPattern?.line?.transportMode;
        if (jpLineMode) explicitMode = mapTokenToCanonical(jpLineMode);

        // Fallback path: serviceJourney.journey.transportMode
        if (!explicitMode && sj.journey) {
          const jMode = sj.journey.transportMode
                     ?? sj.journey.transport?.transportMode
                     ?? null;
          if (jMode) explicitMode = mapTokenToCanonical(jMode);
        }

        // Heuristic: line code prefix may hint at mode (last resort)
        if (!explicitMode && publicCode) {
          const pc = String(publicCode).toLowerCase();
          if (pc.startsWith('t')) explicitMode = 'tram';
          else if (pc.startsWith('m')) explicitMode = 'metro';
        }
      }
    } catch (_) {
      explicitMode = null;
      publicCode   = null;
    }

    const mode = explicitMode ?? detectModeFromRaw(call);

    return {
      destination,
      publicCode,
      expectedDepartureISO,
      aimedDepartureISO,
      actualDepartureISO,
      realtime,
      cancellation,
      predictionInaccurate,
      mode,
      quay,
      situations,
      raw: call
    };
  });
}
