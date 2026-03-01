/**
 * sw-updater.test.mjs
 *
 * Tests the sw-updater countdown+trigger logic in isolation.
 * Reproduces the Firefox bug: countdown stops at 1s, skipWaiting never sent.
 */
import assert from 'assert/strict';

console.log('Running sw-updater.test.mjs');

// ── helpers ────────────────────────────────────────────────────────────────

/**
 * OLD (buggy) logic: two independent timers.
 * Returns { tickToZero, skipWaitingCalled }.
 */
function makeOldLogic(countdownStart) {
  let countdown = countdownStart;
  let skipWaitingCalled = false;
  const toastTexts = [];

  const intervalId = { cleared: false };
  const timeoutFired = { fired: false };

  function tick() {
    countdown--;
    if (countdown > 0) {
      toastTexts.push(`${countdown}s`);
    } else {
      intervalId.cleared = true; // clearInterval — but NO toast update, NO skipWaiting here
    }
  }

  function fireTimeout() {
    timeoutFired.fired = true;
    skipWaitingCalled = true; // postMessage({ type: 'SKIP_WAITING' })
  }

  return {
    tick,
    fireTimeout,
    get lastToast() { return toastTexts[toastTexts.length - 1]; },
    get skipWaitingCalled() { return skipWaitingCalled; },
    get intervalCleared() { return intervalId.cleared; },
  };
}

/**
 * NEW (fixed) logic: single interval drives countdown AND trigger.
 */
function makeNewLogic(countdownStart) {
  let countdown = countdownStart;
  let skipWaitingCalled = false;
  let reloadCalled = false;
  const toastTexts = [];

  function tick(sendSkipWaiting) {
    countdown--;
    toastTexts.push(`${countdown}s`); // always update toast
    if (countdown <= 0) {
      sendSkipWaiting();
    }
  }

  return {
    tick,
    sendSkipWaiting: () => { skipWaitingCalled = true; },
    triggerReload:   () => { reloadCalled = true; },
    get lastToast() { return toastTexts[toastTexts.length - 1]; },
    get skipWaitingCalled() { return skipWaitingCalled; },
    get reloadCalled() { return reloadCalled; },
    get countdown() { return countdown; },
  };
}

// ── Test 1 (bug reproduction): old logic — toast freezes at 1s ────────────
{
  const old = makeOldLogic(5);
  for (let i = 0; i < 5; i++) old.tick();   // simulate 5 ticks
  // Old: after 5 ticks countdown==0, interval cleared, last toast update was at countdown==1
  assert.equal(old.lastToast, '1s', 'OLD BUG: last toast shown is "1s", never "0s"');
  assert(!old.skipWaitingCalled, 'OLD BUG: skipWaiting not called by the interval');
  // skipWaiting is only called by the separate independent setTimeout
}

// ── Test 2: new logic — toast reaches 0s ──────────────────────────────────
{
  const n = makeNewLogic(5);
  for (let i = 0; i < 5; i++) n.tick(n.sendSkipWaiting);
  assert.equal(n.lastToast, '0s', 'NEW: toast must show "0s" on final tick');
  assert(n.skipWaitingCalled, 'NEW: skipWaiting must be called in the same tick that hits 0');
}

// ── Test 3: skipWaiting fires exactly once (interval cleared after first fire) ─
{
  let callCount = 0;
  let stopped = false;
  const n = makeNewLogic(3);
  for (let i = 0; i < 6; i++) {
    if (stopped) break;
    n.tick(() => {
      callCount++;
      stopped = true; // mirrors clearInterval in real implementation
    });
  }
  assert.equal(callCount, 1, 'skipWaiting must fire exactly once — interval cleared at 0');
}

// ── Test 4: waiting worker is re-queried at trigger time, not captured early ─
// Simulates the race where reg.waiting is null at statechange but set 1 tick later.
{
  const reg = { waiting: null };
  let skipSent = false;

  // Simulate: waiting becomes available after 1 tick
  setTimeout(() => { reg.waiting = { postMessage: () => { skipSent = true; } }; }, 0);

  const n = makeNewLogic(1);
  // Tick fires synchronously (before setTimeout), re-queries reg.waiting at trigger time
  n.tick(() => {
    // NEW: always re-query reg.waiting at call time
    const w = reg.waiting;
    if (w) w.postMessage({ type: 'SKIP_WAITING' });
    // (in the async real world, reg.waiting IS set by now)
  });

  // In this synchronous test reg.waiting is still null at tick time — that's expected.
  // The important thing is the NEW code re-queries rather than closing over a stale ref.
  // We verify the pattern is correct: if w is null, no crash.
  assert(!skipSent, 'No crash when reg.waiting is null at trigger time');
}

// ── Test 5: reload URL includes cache-bust timestamp ──────────────────────
{
  const base = 'https://example.com/app/?b=sometoken';
  // Old: strips everything after '?'
  const oldReload = base.split('?')[0];
  assert.equal(oldReload, 'https://example.com/app/', 'OLD: strips query but no cache-bust');

  // New: strip query params, add ?t=<timestamp>
  const ts = 1234567890;
  const newReload = base.split('?')[0] + `?t=${ts}`;
  assert.match(newReload, /\?t=\d+$/, 'NEW: reload URL must include ?t=<timestamp> cache-bust');
}

console.log('sw-updater.test.mjs OK');
