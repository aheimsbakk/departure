/**
 * @file Tests for favorites functionality:
 *   - isStationInFavorites(stopId, modes) from station-dropdown.js
 *   - updateFavoriteButton(btn, stopId, modes, theme) from ui.js
 *   - MAX_RECENT=10 (covered in station-dropdown.test.mjs)
 */

import assert from 'assert/strict';

console.log('Running favorites.test.mjs');

// Mock localStorage for Node.js environment
class LocalStorageMock {
  constructor() { this.store = {}; }
  getItem(key) { return this.store[key] || null; }
  setItem(key, value) { this.store[key] = String(value); }
  clear() { this.store = {}; }
}
global.localStorage = new LocalStorageMock();

// Minimal mock for window.matchMedia (needed by updateFavoriteButton theme logic)
global.window = {
  matchMedia: (query) => ({
    matches: query === '(prefers-color-scheme: light)'
  })
};

// Minimal mock for document.createElement etc. needed by module imports
global.document = {
  createElement: (tag) => ({
    tagName: tag.toUpperCase(),
    className: '', textContent: '', title: '', type: '',
    disabled: false, checked: false, indeterminate: false,
    style: {}, dataset: {}, children: [],
    childNodes: [],
    setAttribute: function() {},
    getAttribute: function() { return null; },
    addEventListener: function() {},
    removeEventListener: function() {},
    appendChild: function(child) { this.children.push(child); return child; },
    removeChild: function() {},
    append: function(...args) { this.children.push(...args); },
    replaceChild: function() {},
    querySelector: function() { return null; },
    querySelectorAll: function() { return []; },
    classList: { add(){}, remove(){}, contains(){ return false; } },
    scrollIntoView: function() {},
    focus: function() {},
    select: function() {},
    contains: function() { return false; }
  }),
  addEventListener: function() {},
  removeEventListener: function() {},
  activeElement: null,
  body: { classList: { add(){}, remove(){} } }
};

const { getRecentStations, addRecentStation, isStationInFavorites, getDefaultStation } = await import('../src/ui/station-dropdown.js');
const { updateFavoriteButton } = await import('../src/ui/ui.js');
const { UI_EMOJIS, DEFAULT_FAVORITE } = await import('../src/config.js');

// --- getDefaultStation tests ---

// Test: Returns the decoded default station without touching localStorage
{
  localStorage.clear();
  const station = getDefaultStation();
  assert.ok(station !== null, 'Should return a station object when DEFAULT_FAVORITE is set');
  assert.equal(station.name, 'Oslo S', 'Default station name should match');
  assert.equal(station.stopId, 'NSR:StopPlace:59872', 'Default station stopId should match');
  assert.ok(Array.isArray(station.modes), 'Modes should be an array');
}

// Test: getDefaultStation does NOT write to localStorage
{
  localStorage.clear();
  getDefaultStation();
  const stored = localStorage.getItem('recent-stations');
  assert.equal(stored, null, 'getDefaultStation must not write to localStorage');
}

// Test: getRecentStations returns empty array when storage is empty (no seeding)
{
  localStorage.clear();
  const favorites = getRecentStations();
  assert.deepEqual(favorites, [], 'getRecentStations should return [] with empty storage');
}

// --- isStationInFavorites tests ---

// Test 1: Empty favorites returns false
{
  localStorage.clear();
  assert.equal(isStationInFavorites('NSR:StopPlace:59872', ['bus']), false, 'Empty favorites should return false');
}

// Test 2: Station + matching modes in favorites returns true
{
  localStorage.clear();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus']);
  assert.equal(isStationInFavorites('NSR:StopPlace:59872', ['bus']), true, 'Should find station with matching modes');
}

// Test 3: Station not in favorites returns false
{
  localStorage.clear();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus']);
  assert.equal(isStationInFavorites('NSR:StopPlace:99999', ['bus']), false, 'Should not find missing station');
}

// Test 4: Null/undefined stopId returns false
{
  localStorage.clear();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus']);
  assert.equal(isStationInFavorites(null, ['bus']), false, 'Null stopId should return false');
  assert.equal(isStationInFavorites(undefined, ['bus']), false, 'Undefined stopId should return false');
  assert.equal(isStationInFavorites('', ['bus']), false, 'Empty string stopId should return false');
}

// Test 5: Same station with DIFFERENT modes → not found (modes must match)
{
  localStorage.clear();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus']);
  assert.equal(isStationInFavorites('NSR:StopPlace:59872', ['metro']), false,
    'Same stopId but different modes should NOT match');
  assert.equal(isStationInFavorites('NSR:StopPlace:59872', ['bus', 'metro']), false,
    'Same stopId but superset modes should NOT match');
}

// Test 6: Same station with same modes (different order) → found
{
  localStorage.clear();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus', 'metro']);
  assert.equal(isStationInFavorites('NSR:StopPlace:59872', ['metro', 'bus']), true,
    'Same modes in different order should match');
}

// Test 7: Multiple favorites with different modes, each matches independently
{
  localStorage.clear();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus']);
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['metro']);
  assert.equal(isStationInFavorites('NSR:StopPlace:59872', ['bus']), true, 'Should find bus variant');
  assert.equal(isStationInFavorites('NSR:StopPlace:59872', ['metro']), true, 'Should find metro variant');
  assert.equal(isStationInFavorites('NSR:StopPlace:59872', ['tram']), false, 'Should not find tram variant');
}

// --- updateFavoriteButton tests ---
// Signature: updateFavoriteButton(btn, stopId, modes, theme)

// Helper: create a mock button element with the properties updateFavoriteButton uses
function mockBtn() {
  return {
    textContent: '',
    disabled: false,
    title: '',
    _ariaLabel: '',
    setAttribute(key, val) { if (key === 'aria-label') this._ariaLabel = val; }
  };
}

// Test 8: Not in favorites → gray heart, enabled
{
  localStorage.clear();
  const btn = mockBtn();
  updateFavoriteButton(btn, 'NSR:StopPlace:99999', ['bus']);
  assert.equal(btn.textContent, UI_EMOJIS.heartSave, 'Should show gray heart when not in favorites');
  assert.equal(btn.disabled, false, 'Should be enabled when not in favorites');
}

// Test 9: In favorites with matching modes → red heart, enabled (click to remove)
{
  localStorage.clear();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus']);
  const btn = mockBtn();
  updateFavoriteButton(btn, 'NSR:StopPlace:59872', ['bus']);
  assert.equal(btn.textContent, UI_EMOJIS.heartSaved, 'Should show red heart when in favorites');
  assert.equal(btn.disabled, false, 'Should be ENABLED when in favorites (to allow removal)');
}

// Test 10: In favorites, different station → gray heart, enabled
{
  localStorage.clear();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus']);
  const btn = mockBtn();
  updateFavoriteButton(btn, 'NSR:StopPlace:99999', ['bus']);
  assert.equal(btn.textContent, UI_EMOJIS.heartSave, 'Different station should show gray heart');
  assert.equal(btn.disabled, false, 'Different station should be enabled');
}

// Test 11: In favorites but DIFFERENT modes → gray heart, enabled (not a match)
{
  localStorage.clear();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus']);
  const btn = mockBtn();
  updateFavoriteButton(btn, 'NSR:StopPlace:59872', ['metro']);
  assert.equal(btn.textContent, UI_EMOJIS.heartSave, 'Different modes should show gray heart');
  assert.equal(btn.disabled, false, 'Different modes should be enabled');
}

// Test 12: Null btn does not throw
{
  localStorage.clear();
  updateFavoriteButton(null, 'NSR:StopPlace:59872', ['bus']);
  updateFavoriteButton(undefined, 'NSR:StopPlace:59872', ['bus']);
}

// Test 13: Changing modes makes heart go from saved to unsaved
{
  localStorage.clear();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus']);
  const btn = mockBtn();
  // With matching modes: shows saved heart
  updateFavoriteButton(btn, 'NSR:StopPlace:59872', ['bus']);
  assert.equal(btn.disabled, false, 'Matching modes: enabled (can remove)');
  assert.equal(btn.textContent, UI_EMOJIS.heartSaved, 'Matching modes: saved heart');
  // Change modes: now shows gray heart (different modes = not a saved combo)
  updateFavoriteButton(btn, 'NSR:StopPlace:59872', ['bus', 'metro']);
  assert.equal(btn.disabled, false, 'Changed modes: still enabled (can save)');
  assert.equal(btn.textContent, UI_EMOJIS.heartSave, 'Changed modes: gray heart');
}

console.log('favorites.test.mjs OK');
