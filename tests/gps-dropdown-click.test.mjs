/**
 * gps-dropdown-click.test.mjs
 *
 * Regression test: clicking a GPS dropdown item must call onStationSelect
 * with the correct stop data.
 *
 * Root cause (pre-fix): openWith() called stopsMap.clear() at its start, but
 * buildStopItem() populates stopsMap *before* openWith() is called (during
 * stops.map(buildStopItem) evaluation). This meant every openWith() call wiped
 * the freshly-built stopsMap, so the delegated click handler always found an
 * empty map and never called onStationSelect.
 *
 * Fix: removed stopsMap.clear() from openWith(). closeDropdown() already clears
 * the map, so no stale entries accumulate.
 */
import { strict as assert } from 'assert';
import { createGpsButton } from '../src/ui/gps-dropdown.js';

console.log('Running gps-dropdown-click.test.mjs');

// Minimal DOM stubs ──────────────────────────────────────────────────────────
class StubElement {
  constructor(tag) {
    this.tagName = (tag || 'div').toUpperCase();
    this.className = '';
    this.type = '';
    this.textContent = '';
    this.title = '';
    this.disabled = false;
    this._attrs = {};
    this._listeners = {};
    this.children = [];
    this._innerHTML = '';
    this.style = {};
    this._parent = null;
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
  // innerHTML = '' must clear children (mirrors real DOM behaviour)
  get innerHTML() {
    return this._innerHTML;
  }
  set innerHTML(v) {
    if (v === '' || v == null) {
      this.children = [];
      this._innerHTML = '';
    } else {
      this._innerHTML = String(v);
    }
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
    c._parent = this;
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
  /** Fire event on this element then bubble up the parent chain. */
  fireBubble(e) {
    e._target = this;
    let node = this;
    while (node) {
      if (!e._stopped) (node._listeners?.[e.type] || []).slice().forEach((h) => h(e));
      if (e._stopped) break;
      node = node._parent || null;
    }
  }
  /** Emulate Element.closest() — supports class selectors only. */
  closest(sel) {
    const cls = sel.replace(/^\./, '');
    let n = this;
    while (n) {
      if (n.className && n.className.split(' ').includes(cls)) return n;
      n = n._parent || null;
    }
    return null;
  }
  /** Emulate Node.contains() — used by _onDocClick. */
  contains(node) {
    let n = node;
    while (n) {
      if (n === this) return true;
      n = n._parent || null;
    }
    return false;
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
    return this._parent;
  }
}

class StubDocument extends StubElement {
  constructor() {
    super('document');
    this._listeners = {};
  }
  createElement(tag) {
    return new StubElement(tag);
  }
}

class StubEvent {
  constructor(type, target) {
    this.type = type;
    this._target = target || null;
    this._stopped = false;
  }
  get target() {
    return this._target;
  }
  stopPropagation() {
    this._stopped = true;
  }
  preventDefault() {}
}

// ── Inject stubs ──────────────────────────────────────────────────────────────
const stubDoc = new StubDocument();
globalThis.document = stubDoc;

// Inject geolocation mock (getCurrentPosition called synchronously in test)
Object.defineProperty(globalThis.navigator, 'geolocation', {
  configurable: true,
  value: {
    getCurrentPosition(successCb) {
      successCb({ coords: { latitude: 59.9, longitude: 10.7 } });
    },
  },
});

// Inject fetch mock returning one valid stop
globalThis.fetch = async () => ({
  ok: true,
  json: async () => ({
    features: [
      {
        properties: {
          layer: 'venue',
          id: 'NSR:StopPlace:1',
          name: 'TestStop',
          distance: 0.1,
          mode: [{ bus: null }],
        },
      },
    ],
  }),
});

// ── Build component ───────────────────────────────────────────────────────────
let selected = null;
const container = createGpsButton((station) => {
  selected = station;
});
const btn = container.children[0];
const menu = container.children[1];

// Wire parent chain so _onDocClick's container.contains() works
container._parent = stubDoc;
menu._parent = container;
btn._parent = container;

assert.ok(menu.className.includes('gps-dropdown-menu'), 'menu has correct class');

// ── Trigger button click to start geolocation + fetch ────────────────────────
const btnEvt = new StubEvent('click', btn);
btn.fireBubble(btnEvt);

// Allow the async fetch inside the geolocation callback to resolve
await new Promise((r) => setTimeout(r, 80));

// ── Verify items were added to the menu ──────────────────────────────────────
assert.ok(menu.children.length > 0, 'menu has at least one child after fetch');
const item = menu.children[0];
assert.ok(
  item.className.includes('gps-dropdown-item'),
  `first child is a gps-dropdown-item (got: "${item.className}")`
);

// ── Simulate clicking the item via the delegated menu listener ────────────────
selected = null;
item._parent = menu; // ensure parent chain
const menuEvt = new StubEvent('click', item);
// The delegated handler reads e.target, so we fire on the menu directly
// but with target set to the item (mirrors real browser event bubbling).
(menu._listeners['click'] || []).forEach((h) => h(menuEvt));

// ── Assert result ─────────────────────────────────────────────────────────────
assert.ok(selected !== null, 'onStationSelect called after item click');
assert.equal(selected.name, 'TestStop', 'name matches');
assert.equal(selected.stopId, 'NSR:StopPlace:1', 'stopId matches');
assert.ok(Array.isArray(selected.modes), 'modes is an array');

console.log('✓ GPS item click calls onStationSelect:', JSON.stringify(selected));

// ── After selection, menu must be empty (dropdown closed) ────────────────────
assert.equal(menu.children.length, 0, 'menu cleared after selection');
console.log('✓ Menu cleared after selection');

// ── A second GPS search should work after close ───────────────────────────────
selected = null;
const btnEvt2 = new StubEvent('click', btn);
btn.fireBubble(btnEvt2);
await new Promise((r) => setTimeout(r, 80));

assert.ok(menu.children.length > 0, 'menu repopulated on second search');
const item2 = menu.children[0];
(menu._listeners['click'] || []).forEach((h) => h(new StubEvent('click', item2)));
assert.ok(selected !== null, 'second search: onStationSelect called');
console.log('✓ Second GPS search works correctly');

console.log('\n✅ All GPS dropdown click tests passed!');
