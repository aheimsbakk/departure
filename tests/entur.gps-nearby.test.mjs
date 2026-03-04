/**
 * entur.gps-nearby.test.mjs
 *
 * Tests fetchNearbyStops() with a mock GeoJSON response matching the real
 * Entur Geocoder reverse-API data for coordinates 59.867851, 10.82448
 * (Bergkrystallen area, Oslo — documented in docs/entur-apis/gps.md).
 *
 * Asserts both the parsed data shape and the display format:
 *   "{station} {emojis} · {meters}m"
 */

import assert from 'assert/strict';
import { fetchNearbyStops } from '../src/entur/gps-search.js';
import { TRANSPORT_MODE_EMOJIS } from '../src/config.js';

console.log('Running entur.gps-nearby.test.mjs');

// ── Mock GeoJSON response (7 stops, data from gps.md repro) ─────────────────
const MOCK_GEOJSON = {
  features: [
    { properties: { layer: 'venue', id: 'NSR:StopPlace:58243', name: 'Bergkrystallen', distance: 186, modes: ['metro', 'bus'] } },
    { properties: { layer: 'venue', id: 'NSR:StopPlace:5832',  name: 'Glimmerveien',   distance: 356, modes: ['bus'] } },
    { properties: { layer: 'venue', id: 'NSR:StopPlace:5828',  name: 'Blåfjellet',     distance: 553, modes: ['bus'] } },
    { properties: { layer: 'venue', id: 'NSR:StopPlace:5830',  name: 'Mellombølgen',   distance: 553, modes: ['bus'] } },
    { properties: { layer: 'venue', id: 'NSR:StopPlace:5821',  name: 'Langbølgen',     distance: 612, modes: ['bus'] } },
    { properties: { layer: 'venue', id: 'NSR:StopPlace:5834',  name: 'Feltspatveien',  distance: 615, modes: ['bus'] } },
    { properties: { layer: 'venue', id: 'NSR:StopPlace:58244', name: 'Munkelia',        distance: 635, modes: ['metro', 'bus'] } },
  ]
};

const mockFetch = async () => ({
  ok:   true,
  json: async () => MOCK_GEOJSON,
  headers: { get: () => 'application/json' }
});

// ── Format helper — mirrors gps-dropdown.js buildStopItem text layout ───────
function formatStop(stop) {
  const emojis = stop.modes
    .map(m => TRANSPORT_MODE_EMOJIS[String(m).toLowerCase()] || '')
    .filter(Boolean)
    .join('');
  const modesPart = emojis ? ` ${emojis}` : '';
  return `${stop.name}${modesPart} · ${stop.distance}m`;
}

// ── Expected formatted lines ─────────────────────────────────────────────────
const EXPECTED = [
  'Bergkrystallen 🚇🚌 · 186m',
  'Glimmerveien 🚌 · 356m',
  'Blåfjellet 🚌 · 553m',
  'Mellombølgen 🚌 · 553m',
  'Langbølgen 🚌 · 612m',
  'Feltspatveien 🚌 · 615m',
  'Munkelia 🚇🚌 · 635m',
];

// ── Run ──────────────────────────────────────────────────────────────────────
const stops = await fetchNearbyStops({
  lat:        59.867851,
  lon:        10.82448,
  maxResults: 7,
  clientName: 'test-token-123',
  fetchFn:    mockFetch
});

// 1. Correct number of results
assert.equal(stops.length, 7, 'should return 7 stops');

// 2. Per-stop: id, name, modes, distance
const EXPECTED_DATA = [
  { id: 'NSR:StopPlace:58243', name: 'Bergkrystallen', modes: ['metro', 'bus'], distance: 186 },
  { id: 'NSR:StopPlace:5832',  name: 'Glimmerveien',   modes: ['bus'],          distance: 356 },
  { id: 'NSR:StopPlace:5828',  name: 'Blåfjellet',     modes: ['bus'],          distance: 553 },
  { id: 'NSR:StopPlace:5830',  name: 'Mellombølgen',   modes: ['bus'],          distance: 553 },
  { id: 'NSR:StopPlace:5821',  name: 'Langbølgen',     modes: ['bus'],          distance: 612 },
  { id: 'NSR:StopPlace:5834',  name: 'Feltspatveien',  modes: ['bus'],          distance: 615 },
  { id: 'NSR:StopPlace:58244', name: 'Munkelia',        modes: ['metro', 'bus'], distance: 635 },
];

for (const [i, expected] of EXPECTED_DATA.entries()) {
  const s = stops[i];
  assert.equal(s.id,       expected.id,       `stop[${i}].id`);
  assert.equal(s.name,     expected.name,     `stop[${i}].name`);
  assert.equal(s.distance, expected.distance, `stop[${i}].distance`);
  assert.deepEqual(s.modes, expected.modes,   `stop[${i}].modes`);
}

// 3. Formatted display lines match "{station} {emojis} · {meters}m"
const lines = stops.map(formatStop);
for (const [i, line] of lines.entries()) {
  assert.equal(line, EXPECTED[i], `formatted line[${i}]`);
}

// 4. Print the list (makes the output readable when running tests manually)
console.log('  GPS results for 59.867851, 10.82448:');
lines.forEach(l => console.log(`  ${l}`));

console.log('entur.gps-nearby.test.mjs OK');
