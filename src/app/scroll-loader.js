/**
 * scroll-loader.js — Temporary scroll-triggered departure count expansion
 *
 * Responsibilities:
 *   - Track a session-temporary displayed departure count (resets on station
 *     change or app reload — never persisted to localStorage)
 *   - Fibonacci step sequence: 1 → 2 → 3 → 5 → 8 → 13 → 21 (hard max)
 *   - Given configured N, the next step is the first Fibonacci number > N
 *   - Accumulate wheel / touch delta with configurable resistance before
 *     triggering a load-more so the user doesn't overshoot accidentally
 *   - Expose helpers to update the scroll indicator DOM element
 */

import { DEFAULTS } from '../config.js';

/** Fibonacci sequence that defines the available departure count steps. */
export const SCROLL_SEQUENCE = [1, 2, 3, 5, 8, 13, 21];

/** Absolute maximum number of departures reachable via scroll-load. */
export const SCROLL_MAX = 21;

/**
 * Wheel delta (px) that must accumulate while the page is at the bottom
 * before a new load is triggered.  ~5 firm mouse-wheel ticks ≈ 500 px.
 * Raised from 200 to reduce accidental triggers.
 */
const WHEEL_RESISTANCE = 500;

/**
 * Touch drag distance (px upward) needed to trigger a load while at the
 * bottom of the page.  A deliberate two-thumb-length swipe ≈ 160 px.
 * Raised from 80 to reduce accidental triggers.
 */
const TOUCH_RESISTANCE = 160;

/**
 * Minimum milliseconds between two successive load-more triggers.
 * Prevents API overload when the user scrolls rapidly through multiple
 * Fibonacci steps in quick succession.
 */
const LOAD_COOLDOWN_MS = 800;

/** Session-temporary displayed count.  null = use DEFAULTS.NUM_DEPARTURES. */
let _displayedN = null;

/** Wall-clock timestamp (ms) of the last successful load-more trigger. */
let _lastLoadAt = 0;

/**
 * Returns the currently active departure count for fetch calls.
 * Falls back to the configured DEFAULTS.NUM_DEPARTURES when no temporary
 * count is set (initial load or after a station change).
 */
export function getDisplayedN() {
  return _displayedN ?? DEFAULTS.NUM_DEPARTURES;
}

/**
 * Reset the temporary count back to the configured value.
 * Call this on every station change so the board resets to the saved N.
 */
export function resetDisplayedN() {
  _displayedN = null;
}

/**
 * Return the next Fibonacci step above `current`, or null if already at max.
 *
 * @param {number} current
 * @returns {number|null}
 */
export function getNextScrollN(current) {
  return SCROLL_SEQUENCE.find(n => n > current) ?? null;
}

// ---------------------------------------------------------------------------
// Indicator DOM helpers
// ---------------------------------------------------------------------------

/**
 * Refresh the scroll indicator element to reflect the current state.
 * Hides the indicator when it would show fewer departures than the configured
 * value (e.g. configured to 8, first step in sequence is 1 — irrelevant).
 *
 * @param {HTMLElement|null} indicatorEl
 */
export function updateIndicator(indicatorEl) {
  if (!indicatorEl) return;

  const n       = getDisplayedN();
  const next    = getNextScrollN(n);
  const arrowEl = indicatorEl.querySelector('.scroll-indicator-arrow');

  if (next === null) {
    // At max — replace the down-arrow with a solid dot to mark the list end
    if (arrowEl) arrowEl.textContent = '●';
    indicatorEl.classList.add('scroll-indicator--max');
    indicatorEl.classList.remove('scroll-indicator--active');
  } else {
    if (arrowEl) arrowEl.textContent = '⌄';
    indicatorEl.classList.remove('scroll-indicator--max');
    indicatorEl.classList.add('scroll-indicator--active');
  }
}

/**
 * Briefly flash the max-reached CSS class on the indicator.
 * Called when the user attempts to scroll beyond the 21-departure cap.
 *
 * @param {HTMLElement|null} indicatorEl
 */
export function flashMaxMessage(indicatorEl) {
  if (!indicatorEl) return;
  indicatorEl.classList.add('scroll-indicator--flash');
  setTimeout(() => indicatorEl.classList.remove('scroll-indicator--flash'), 2200);
}

// ---------------------------------------------------------------------------
// Event listener wiring
// ---------------------------------------------------------------------------

/**
 * Attach wheel and touch scroll listeners to window.
 * Load-more is triggered only when the page is at its bottom and the
 * accumulated delta exceeds the resistance threshold.
 *
 * @param {HTMLElement|null} indicatorEl - Indicator element to update on change
 * @param {Function}         onLoadMore  - Called with (nextN: number)
 * @param {Function}         onAtMax     - Called when already at SCROLL_MAX
 * @returns {Function} destroy — call to remove all listeners
 */
export function attachScrollListeners(indicatorEl, onLoadMore, onAtMax) {
  let accumulated = 0;

  /** True when the page is scrolled to the bottom (or has no overflow). */
  function isAtPageBottom() {
    return (window.scrollY + window.innerHeight) >= (document.body.scrollHeight - 20);
  }

  /** Core: check resistance and advance if threshold met. */
  function tryAdvance() {
    if (accumulated < WHEEL_RESISTANCE) return; // not reached yet
    accumulated = 0;

    // Rate-limit: ignore bursts faster than LOAD_COOLDOWN_MS
    const now = Date.now();
    if (now - _lastLoadAt < LOAD_COOLDOWN_MS) return;

    const current = getDisplayedN();
    if (current >= SCROLL_MAX) {
      if (typeof onAtMax === 'function') onAtMax();
      return;
    }
    const next = getNextScrollN(current);
    if (!next) return;

    _lastLoadAt = Date.now();
    _displayedN = next;
    updateIndicator(indicatorEl);
    if (typeof onLoadMore === 'function') onLoadMore(next);
  }

  // --- Wheel (desktop) ---
  function handleWheel(e) {
    if (e.deltaY <= 0) { accumulated = 0; return; }
    if (!isAtPageBottom()) { accumulated = 0; return; }
    accumulated += e.deltaY;
    tryAdvance();
  }

  // --- Touch (mobile) ---
  let touchLastY = 0;
  let touchAccum = 0;

  function handleTouchStart(e) {
    touchLastY = e.touches[0].clientY;
    touchAccum = 0;
  }

  function handleTouchMove(e) {
    const dy = touchLastY - e.touches[0].clientY; // positive = swiping up (scroll down)
    touchLastY = e.touches[0].clientY;
    if (dy <= 0) { touchAccum = 0; return; }
    if (!isAtPageBottom()) { touchAccum = 0; return; }

    touchAccum += dy;
    if (touchAccum >= TOUCH_RESISTANCE) {
      touchAccum = 0;

      // Rate-limit: ignore bursts faster than LOAD_COOLDOWN_MS
      const now = Date.now();
      if (now - _lastLoadAt < LOAD_COOLDOWN_MS) return;

      const current = getDisplayedN();
      if (current >= SCROLL_MAX) {
        if (typeof onAtMax === 'function') onAtMax();
        return;
      }
      const next = getNextScrollN(current);
      if (!next) return;
      _lastLoadAt = Date.now();
      _displayedN = next;
      updateIndicator(indicatorEl);
      if (typeof onLoadMore === 'function') onLoadMore(next);
    }
  }

  window.addEventListener('wheel',      handleWheel,      { passive: true });
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchmove',  handleTouchMove,  { passive: true });

  return function destroy() {
    window.removeEventListener('wheel',      handleWheel);
    window.removeEventListener('touchstart', handleTouchStart);
    window.removeEventListener('touchmove',  handleTouchMove);
  };
}
