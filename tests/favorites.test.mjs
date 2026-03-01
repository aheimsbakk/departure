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

const { getRecentStations, addRecentStation, isStationInFavorites } = await import('../src/ui/station-dropdown.js');
const { updateFavoriteButton } = await import('../src/ui/ui.js');
const { UI_EMOJIS, DEFAULT_FAVORITE } = await import('../src/config.js');

// --- Default favorite import tests ---

// Test: Empty favorites + DEFAULT_FAVORITE set → imports default
{
  localStorage.clear();
  const { resetDefaultFavoriteFlag } = await import('../src/ui/station-dropdown.js');
  resetDefaultFavoriteFlag();
  const favorites = getRecentStations();
  assert.equal(favorites.length >= 1, true, 'Should import default favorite when none exist');
  if (favorites.length > 0) {
    assert.equal(favorites[0].name, 'Jernbanetorget, Oslo', 'Default favorite should be Jernbanetorget');
    assert.equal(favorites[0].stopId, 'NSR:StopPlace:58366', 'Default favorite stopId should match');
  }
}

// Test: Favorites already exist → no import
{
  localStorage.clear();
  const { resetDefaultFavoriteFlag } = await import('../src/ui/station-dropdown.js');
  resetDefaultFavoriteFlag();
  addRecentStation('Custom Station', 'NSR:StopPlace:99999', ['bus']);
  const favorites = getRecentStations();
  assert.equal(favorites.length, 1, 'Should not import default when favorites exist');
  assert.equal(favorites[0].name, 'Custom Station', 'Should keep existing favorite');
}

// Test: Import only happens once (flag prevents re-import)
{
  localStorage.clear();
  const { resetDefaultFavoriteFlag } = await import('../src/ui/station-dropdown.js');
  resetDefaultFavoriteFlag();
  // First call imports
  getRecentStations();
  // Modify the stored favorites
  const stored = JSON.parse(localStorage.getItem('recent-stations') || '[]');
  stored[0].name = 'Modified Name';
  localStorage.setItem('recent-stations', JSON.stringify(stored));
  // Second call should not re-import
  const favorites = getRecentStations();
  assert.equal(favorites[0].name, 'Modified Name', 'Should not re-import default favorite');
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

// Test 8: Not in favorites → red heart, enabled
{
  localStorage.clear();
  const btn = mockBtn();
  updateFavoriteButton(btn, 'NSR:StopPlace:99999', ['bus'], 'light');
  assert.equal(btn.textContent, UI_EMOJIS.heartSave, 'Should show red heart when not in favorites');
  assert.equal(btn.disabled, false, 'Should be enabled when not in favorites');
}

// Test 9: In favorites with matching modes + light theme → white heart, enabled (click to remove)
{
  localStorage.clear();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus']);
  const btn = mockBtn();
  updateFavoriteButton(btn, 'NSR:StopPlace:59872', ['bus'], 'light');
  assert.equal(btn.textContent, UI_EMOJIS.heartSavedLight, 'Should show white heart in light theme');
  assert.equal(btn.disabled, false, 'Should be ENABLED when in favorites (to allow removal)');
}

// Test 10: In favorites with matching modes + dark theme → black heart, enabled (click to remove)
{
  localStorage.clear();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus']);
  const btn = mockBtn();
  updateFavoriteButton(btn, 'NSR:StopPlace:59872', ['bus'], 'dark');
  assert.equal(btn.textContent, UI_EMOJIS.heartSavedDark, 'Should show black heart in dark theme');
  assert.equal(btn.disabled, false, 'Should be ENABLED when in favorites (to allow removal)');
}

// Test 11: In favorites but DIFFERENT modes → red heart, enabled (not a match)
{
  localStorage.clear();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus']);
  const btn = mockBtn();
  updateFavoriteButton(btn, 'NSR:StopPlace:59872', ['metro'], 'light');
  assert.equal(btn.textContent, UI_EMOJIS.heartSave, 'Different modes should show red heart');
  assert.equal(btn.disabled, false, 'Different modes should be enabled');
}

// Test 12: In favorites + auto theme with light preference → white heart, enabled
{
  localStorage.clear();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus']);
  const btn = mockBtn();
  updateFavoriteButton(btn, 'NSR:StopPlace:59872', ['bus'], 'auto');
  assert.equal(btn.textContent, UI_EMOJIS.heartSavedLight, 'Auto theme with light preference should show white heart');
  assert.equal(btn.disabled, false);
}

// Test 13: Null btn does not throw
{
  localStorage.clear();
  updateFavoriteButton(null, 'NSR:StopPlace:59872', ['bus'], 'light');
  updateFavoriteButton(undefined, 'NSR:StopPlace:59872', ['bus'], 'dark');
}

// Test 14: In favorites + auto theme with dark preference → black heart, enabled
{
  localStorage.clear();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus']);
  const btn = mockBtn();
  const origMatchMedia = global.window.matchMedia;
  global.window.matchMedia = (query) => ({
    matches: query === '(prefers-color-scheme: dark)'
  });
  updateFavoriteButton(btn, 'NSR:StopPlace:59872', ['bus'], 'auto');
  assert.equal(btn.textContent, UI_EMOJIS.heartSavedDark, 'Auto theme with dark preference should show black heart');
  assert.equal(btn.disabled, false);
  global.window.matchMedia = origMatchMedia;
}

// Test 15: Changing modes makes heart go from in-favorites (enabled) to not-in-favorites (red, enabled)
{
  localStorage.clear();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus']);
  const btn = mockBtn();
  // With matching modes: enabled, shows saved heart
  updateFavoriteButton(btn, 'NSR:StopPlace:59872', ['bus'], 'light');
  assert.equal(btn.disabled, false, 'Matching modes: enabled (can remove)');
  assert.equal(btn.textContent, UI_EMOJIS.heartSavedLight, 'Matching modes: saved heart');
  // Change modes: now shows red heart (different modes = not a saved combo)
  updateFavoriteButton(btn, 'NSR:StopPlace:59872', ['bus', 'metro'], 'light');
  assert.equal(btn.disabled, false, 'Changed modes: still enabled (can save)');
  assert.equal(btn.textContent, UI_EMOJIS.heartSave, 'Changed modes: red heart');
}

console.log('favorites.test.mjs OK');
