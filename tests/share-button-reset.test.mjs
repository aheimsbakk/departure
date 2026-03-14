/**
 * @file Regression test: share button reset timer on rapid clicks
 *
 * Reproduces the bug where clicking the share button multiple times while the
 * success checkmark is displayed causes the button to never revert to the
 * clipboard emoji.
 *
 * Root cause: each click captured `originalText` as `UI_EMOJIS.shareSuccess`
 * (already set), so stacked `setTimeout` callbacks restored to the wrong value.
 * Fix: single `_resetTimer` ref with `clearTimeout` before each re-arm.
 */

import assert from 'assert/strict';

console.log('Running share-button-reset.test.mjs');

// ── Minimal DOM stubs ─────────────────────────────────────────────────────────

class MockElement {
  constructor(tag) {
    this.tag = tag;
    this.textContent = '';
    this.className = '';
    this.type = '';
    this.readOnly = false;
    this.style = { display: '' };
    this._listeners = {};
    this.children = [];
  }
  setAttribute() {}
  getAttribute() {
    return null;
  }
  appendChild(child) {
    this.children.push(child);
  }
  addEventListener(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
  }
  async _trigger(event, detail = {}) {
    for (const fn of this._listeners[event] || []) await fn(detail);
  }
  select() {}
}

const elements = [];
global.document = {
  createElement(tag) {
    const el = new MockElement(tag);
    elements.push(el);
    return el;
  },
};

global.window = {
  location: { origin: 'https://example.com', pathname: '/' },
  isSecureContext: false,
};
Object.defineProperty(global, 'navigator', { value: {}, configurable: true, writable: true });
global.localStorage = {
  store: {},
  getItem(k) {
    return this.store[k] ?? null;
  },
  setItem(k, v) {
    this.store[k] = v;
  },
};

// ── Fake timers ───────────────────────────────────────────────────────────────

let _timers = [];
let _idCounter = 0;

global.setTimeout = (fn, ms) => {
  const id = ++_idCounter;
  _timers.push({ id, fn, ms });
  return id;
};
global.clearTimeout = (id) => {
  _timers = _timers.filter((t) => t.id !== id);
};

function flushTimers() {
  const pending = _timers.slice();
  _timers = [];
  for (const t of pending) t.fn();
}

// ── Import module under test ──────────────────────────────────────────────────

const { createShareButton } = await import('../src/ui/share-button.js');

const mockSettings = {
  STATION_NAME: 'Oslo S',
  STOP_ID: 'NSR:StopPlace:59872',
  TRANSPORT_MODES: ['bus'],
};
const { button } = createShareButton(() => mockSettings);

// ── Helpers ───────────────────────────────────────────────────────────────────

// Grab UI_EMOJIS values by inspecting what the button starts with
const SHARE_EMOJI = button.textContent;

// ── Test 1: single click sets success, then reverts ───────────────────────────
{
  _timers = [];
  button.textContent = SHARE_EMOJI;

  await button._trigger('click', {});
  assert.notEqual(button.textContent, SHARE_EMOJI, 'Button should show success emoji after click');

  const successEmoji = button.textContent;

  flushTimers();
  assert.equal(
    button.textContent,
    SHARE_EMOJI,
    'Button should revert to share emoji after timer fires'
  );
  assert.notEqual(button.textContent, successEmoji, 'Button must not remain as success emoji');
}

// ── Test 2: rapid clicks — only one timer pending at a time ───────────────────
{
  _timers = [];
  button.textContent = SHARE_EMOJI;

  await button._trigger('click', {});
  const afterFirst = _timers.length;

  await button._trigger('click', {});
  const afterSecond = _timers.length;

  await button._trigger('click', {});
  const afterThird = _timers.length;

  assert.equal(afterFirst, 1, 'After 1st click: exactly 1 pending timer');
  assert.equal(afterSecond, 1, 'After 2nd click: still exactly 1 pending timer (old one cleared)');
  assert.equal(afterThird, 1, 'After 3rd click: still exactly 1 pending timer');
}

// ── Test 3: after rapid clicks the button eventually reverts to share emoji ───
{
  _timers = [];
  button.textContent = SHARE_EMOJI;

  await button._trigger('click', {});
  await button._trigger('click', {});
  await button._trigger('click', {});

  flushTimers();

  assert.equal(
    button.textContent,
    SHARE_EMOJI,
    'Button must revert to share emoji after rapid clicks and timer flush'
  );
}

console.log('share-button-reset.test.mjs OK');
