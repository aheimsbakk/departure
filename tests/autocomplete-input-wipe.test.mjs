/**
 * autocomplete-input-wipe.test.mjs
 *
 * Regression test: after panel opens (updateField sets the station name) and the
 * user focuses the input then starts typing, the typed text must NOT be wiped.
 *
 * Root cause (pre-fix): the input handler contained a guard block:
 *   if (lastQuery === '' && v.trim().length >= 3 && !inpStation.dataset.stopId)
 * After focus() resets lastQuery to '', any first 3+-char input from a user with
 * no saved stop ID (e.g. first-time user) hit this guard, clearing the field and
 * returning early — effectively blocking all autocomplete searches.
 */
import { strict as assert } from 'assert';
import { createStationAutocomplete } from '../src/ui/options/station-autocomplete.js';

console.log('Running autocomplete-input-wipe.test.mjs');

// Minimal DOM stubs ──────────────────────────────────────────────────────────
class StubElement {
  constructor() {
    this.value = '';
    this.className = '';
    this.dataset = {};
    this._attrs = {};
    this._listeners = {};
    this.type = '';
    this.autocomplete = 'off';
    this.children = [];
    this.classList = {
      _set: new Set(),
      add(c) {
        this._set.add(c);
      },
      remove(c) {
        this._set.delete(c);
      },
      contains(c) {
        return this._set.has(c);
      },
    };
  }
  setAttribute(k, v) {
    this._attrs[k] = v;
  }
  getAttribute(k) {
    return this._attrs[k] ?? null;
  }
  removeAttribute(k) {
    delete this._attrs[k];
  }
  appendChild(c) {
    this.children.push(c);
    return c;
  }
  removeChild(c) {
    this.children = this.children.filter((x) => x !== c);
  }
  append(...n) {
    n.forEach((x) => this.appendChild(x));
  }
  addEventListener(ev, fn) {
    if (!this._listeners[ev]) this._listeners[ev] = [];
    this._listeners[ev].push(fn);
  }
  removeEventListener(ev, fn) {
    if (this._listeners[ev]) this._listeners[ev] = this._listeners[ev].filter((f) => f !== fn);
  }
  dispatchEvent(e) {
    (this._listeners[e.type] || []).forEach((h) => h(e));
  }
  select() {}
  focus() {}
  scrollIntoView() {}
  querySelectorAll() {
    return [];
  }
  querySelector() {
    return null;
  }
  get parentElement() {
    return null;
  }
}

class StubDocument extends StubElement {
  constructor() {
    super();
    this._listeners = {};
  }
  createElement() {
    return new StubElement();
  }
}

class StubEvent {
  constructor(type) {
    this.type = type;
    this.key = '';
  }
  preventDefault() {}
  stopPropagation() {}
}

globalThis.document = new StubDocument();
globalThis.window = { fetch: async () => ({ ok: true, json: async () => ({ features: [] }) }) };
globalThis.AbortController = class {
  constructor() {
    this.signal = {};
  }
  abort() {}
};

const t = (k) => k;

console.log('Testing autocomplete input-wipe regression...');

// ── Test 1: user with no saved station types 3+ chars — must NOT be wiped ────
// Each test gets a fresh component instance (module-level vars are in the closure).
{
  const ac = createStationAutocomplete(
    { STATION_NAME: '', STOP_ID: '' },
    { onSelect: () => {}, t }
  );
  const inp = ac.inpStation;

  ac.updateField('', '');
  inp.dispatchEvent(new StubEvent('focus'));

  inp.value = 'Osl';
  inp.dispatchEvent(new StubEvent('input'));
  // BUG (pre-fix): guard `lastQuery==='' && v.length>=3 && !stopId` fires here,
  // clearing inp.value back to '' and returning without triggering a search.
  assert.equal(inp.value, 'Osl', 'empty-defaults: "Osl" must NOT be wiped (regression guard)');
  console.log('✓ Empty-defaults: 3-char input not wiped');
}

// ── Test 2: user with a saved station types a new query — must NOT be wiped ───
{
  const ac = createStationAutocomplete(
    { STATION_NAME: 'Jernbanetorget', STOP_ID: 'NSR:StopPlace:337' },
    { onSelect: () => {}, t }
  );
  const inp = ac.inpStation;

  ac.updateField('Jernbanetorget', 'NSR:StopPlace:337');
  inp.dispatchEvent(new StubEvent('focus'));

  // Simulate user clearing all and typing a new query
  inp.value = 'Osl';
  inp.dataset.stopId = ''; // cleared when user starts typing (real behaviour)
  inp.dispatchEvent(new StubEvent('input'));
  assert.equal(inp.value, 'Osl', 'saved-station: "Osl" must not be wiped after clearing stopId');
  console.log('✓ Saved-station (stopId cleared): 3-char input not wiped');
}

// ── Test 3: repeat search for same term — second search must not be blocked ───
{
  const ac = createStationAutocomplete(
    { STATION_NAME: '', STOP_ID: '' },
    { onSelect: () => {}, t }
  );
  const inp = ac.inpStation;

  // First search
  ac.updateField('', '');
  inp.dispatchEvent(new StubEvent('focus'));
  inp.value = 'Storo';
  inp.dispatchEvent(new StubEvent('input'));
  assert.equal(inp.value, 'Storo', 'first search "Storo": not blocked');
  console.log('✓ First search "Storo" not blocked');

  // Re-open panel (updateField + focus again), then same query
  ac.updateField('', '');
  inp.dispatchEvent(new StubEvent('focus'));
  inp.value = 'Storo';
  inp.dispatchEvent(new StubEvent('input'));
  assert.equal(inp.value, 'Storo', 'repeat search "Storo": not blocked');
  console.log('✓ Repeat search for same term not blocked');
}

console.log('\n✅ All autocomplete-input-wipe tests passed!');
