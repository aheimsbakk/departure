/**
 * index.js — Public API facade for the Entur client modules
 *
 * Drop-in replacement for the former monolithic src/entur.js.
 * All callers import from this file; internal modules are not part of the
 * public surface.
 */

export { parseEnturResponse }           from './parser.js';
export { fetchDepartures }              from './departures.js';
export { lookupStopId, searchStations } from './geocoder.js';
