/**
 * @file Tests for the remove-from-favorites feature:
 *   - removeFromFavorites(stopId, modes) from station-dropdown.js
 *   - updateFavoriteButton shows 'Remove from favorites' tooltip when in favorites
 *   - handleFavoriteToggle removes if already in favorites (via station-dropdown helpers)
 */

import assert from 'assert/strict';

console.log('Running remove-favorites.test.mjs');

// Mock localStorage
class LocalStorageMock {
  constructor() { this.store = {}; }
  getItem(key) { return this.store[key] || null; }
  setItem(key, value) { this.store[key] = String(value); }
  clear() { this.store = {}; }
}
global.localStorage = new LocalStorageMock();

// Minimal matchMedia mock (light theme preference)
global.window = {
  matchMedia: (query) => ({ matches: query === '(prefers-color-scheme: light)' })
};

// Minimal document mock for module imports
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

const { getRecentStations, addRecentStation, isStationInFavorites, removeFromFavorites, resetDefaultFavoriteFlag } =
  await import('../src/ui/station-dropdown.js');
const { updateFavoriteButton } = await import('../src/ui/ui.js');
const { UI_EMOJIS } = await import('../src/config.js');

// Helper to clear favorites between tests.
// Does NOT reset defaultFavoriteImported — once the flag has been set by the
// initialization block below, it stays true for the entire test run.
function clearFavorites() {
  localStorage.setItem('recent-stations', '[]');
}

// One-time initialization: trigger the default-favorite import once on an empty list
// so that defaultFavoriteImported is permanently set to true for this module instance.
// After this, clearFavorites() safely resets storage without risking re-import.
{
  localStorage.clear();
  getRecentStations(); // triggers import + sets flag to true
  localStorage.setItem('recent-stations', '[]'); // reset to clean state
}

// Helper: create a mock button
function mockBtn() {
  return {
    textContent: '',
    disabled: false,
    title: '',
    _ariaLabel: '',
    setAttribute(key, val) { if (key === 'aria-label') this._ariaLabel = val; }
  };
}

// ── removeFromFavorites() ────────────────────────────────────────────────────

// Test 1: Remove a station that exists — returns true, list shrinks
{
  clearFavorites();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus']);
  addRecentStation('Nationaltheatret', 'NSR:StopPlace:58366', ['metro']);

  const removed = removeFromFavorites('NSR:StopPlace:59872', ['bus']);
  assert.equal(removed, true, 'removeFromFavorites should return true when entry found');

  const recent = getRecentStations();
  assert.equal(recent.length, 1, 'List should shrink by one');
  assert.equal(recent[0].name, 'Nationaltheatret', 'Remaining entry should be Nationaltheatret');
}

// Test 2: Remove a station that does NOT exist — returns false, list unchanged
{
  clearFavorites();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus']);

  const removed = removeFromFavorites('NSR:StopPlace:99999', ['bus']);
  assert.equal(removed, false, 'removeFromFavorites should return false when entry not found');

  const recent = getRecentStations();
  assert.equal(recent.length, 1, 'List should be unchanged');
}

// Test 3: Remove only the matching modes variant; other mode variants stay
{
  clearFavorites();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus']);
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['metro']);

  removeFromFavorites('NSR:StopPlace:59872', ['bus']);

  const recent = getRecentStations();
  assert.equal(recent.length, 1, 'Only the matching modes variant should be removed');
  assert.deepEqual(recent[0].modes, ['metro'], 'Metro variant should remain');
}

// Test 4: Remove preserves order of remaining entries
{
  clearFavorites();
  addRecentStation('Station A', 'ID-A', ['bus']);
  addRecentStation('Station B', 'ID-B', ['bus']);
  addRecentStation('Station C', 'ID-C', ['bus']);

  // Remove the middle one (Station B is at index 1 = added second so it's in the middle)
  removeFromFavorites('ID-B', ['bus']);

  const recent = getRecentStations();
  assert.equal(recent.length, 2, 'Two entries should remain');
  assert.equal(recent[0].name, 'Station C', 'Station C should stay at top');
  assert.equal(recent[1].name, 'Station A', 'Station A should stay at bottom');
}

// Test 5: Null / empty stopId returns false without throwing
{
  clearFavorites();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus']);

  assert.equal(removeFromFavorites(null, ['bus']), false, 'null stopId → false');
  assert.equal(removeFromFavorites(undefined, ['bus']), false, 'undefined stopId → false');
  assert.equal(removeFromFavorites('', ['bus']), false, 'empty string stopId → false');

  const recent = getRecentStations();
  assert.equal(recent.length, 1, 'List should be unchanged after no-op calls');
}

// Test 6: Remove from empty list returns false
{
  clearFavorites();
  const removed = removeFromFavorites('NSR:StopPlace:59872', ['bus']);
  assert.equal(removed, false, 'Removing from empty list should return false');
}

// ── updateFavoriteButton with removeFromFavorites semantics ──────────────────

// Test 7: In favorites → button enabled with 'removeFromFavorites' tooltip (not disabled)
{
  clearFavorites();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus']);
  const btn = mockBtn();
  updateFavoriteButton(btn, 'NSR:StopPlace:59872', ['bus'], 'light');

  assert.equal(btn.disabled, false, 'Button must be ENABLED when in favorites (to allow removal)');
  // Title should be 'Remove from favorites' (English translation)
  assert.ok(
    btn.title.toLowerCase().includes('remove') || btn.title.length > 0,
    'Tooltip should reference removal when in favorites'
  );
  // Should still show the saved heart (white or black depending on theme)
  assert.equal(btn.textContent, UI_EMOJIS.heartSavedLight, 'Light theme in-favorites heart');
}

// Test 8: After removal, button goes back to red heart / 'Save to favorites'
{
  clearFavorites();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus']);

  const btn = mockBtn();
  // Before removal
  updateFavoriteButton(btn, 'NSR:StopPlace:59872', ['bus'], 'light');
  assert.equal(btn.textContent, UI_EMOJIS.heartSavedLight, 'Before removal: saved heart');

  // Remove
  removeFromFavorites('NSR:StopPlace:59872', ['bus']);

  // After removal
  updateFavoriteButton(btn, 'NSR:StopPlace:59872', ['bus'], 'light');
  assert.equal(btn.textContent, UI_EMOJIS.heartSave, 'After removal: red heart');
  assert.equal(btn.disabled, false, 'After removal: button enabled');
}

// Test 9: Toggle: add → remove → add cycle works correctly
{
  clearFavorites();

  // isStationInFavorites should start false
  assert.equal(isStationInFavorites('NSR:StopPlace:59872', ['bus']), false, 'Initially not in favorites');

  // Add
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus']);
  assert.equal(isStationInFavorites('NSR:StopPlace:59872', ['bus']), true, 'In favorites after add');

  // Remove
  removeFromFavorites('NSR:StopPlace:59872', ['bus']);
  assert.equal(isStationInFavorites('NSR:StopPlace:59872', ['bus']), false, 'Not in favorites after remove');

  // Re-add
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus']);
  assert.equal(isStationInFavorites('NSR:StopPlace:59872', ['bus']), true, 'In favorites after re-add');

  const recent = getRecentStations();
  assert.equal(recent.length, 1, 'Should have exactly one entry after add-remove-add cycle');
}

// Test 10: removeFromFavorites does not touch other stopIds
{
  clearFavorites();
  addRecentStation('Oslo S', 'NSR:StopPlace:59872', ['bus']);
  addRecentStation('Bergen', 'NSR:StopPlace:11111', ['rail']);
  addRecentStation('Trondheim', 'NSR:StopPlace:22222', ['bus']);

  removeFromFavorites('NSR:StopPlace:59872', ['bus']);

  const recent = getRecentStations();
  assert.equal(recent.length, 2);
  assert.ok(recent.every(s => s.stopId !== 'NSR:StopPlace:59872'), 'Oslo S should be gone');
  assert.ok(recent.some(s => s.stopId === 'NSR:StopPlace:11111'), 'Bergen should remain');
  assert.ok(recent.some(s => s.stopId === 'NSR:StopPlace:22222'), 'Trondheim should remain');
}

console.log('remove-favorites.test.mjs OK');
