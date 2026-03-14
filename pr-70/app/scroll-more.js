/**
 * scroll-more.js — Scroll/pull-to-load-more departures
 *
 * Responsibilities:
 *   - Track a temporary departure count that overrides DEFAULTS.NUM_DEPARTURES
 *   - Fibonacci-like progression: 1, 2, 3, 5, 8, 13, 21 (max)
 *   - Detect upward pull gesture (touch + mouse) and wheel scroll past bottom
 *   - Fire triggerLoadMore() on gesture release once threshold is met
 *   - Show ▼ "scroll for more" indicator; switches to ● at max
 *   - Reset temporary count on station change or app reload
 *
 * Design constraints:
 *   - No visual drag displacement — no marginTop manipulation
 *   - No CSS transitions or snap-back animation
 *   - No external dependencies
 *   - Works on PC, Android, macOS, iOS (touch + mouse + wheel)
 *   - Resistance threshold prevents accidental loading
 *   - Memory-safe: all listeners cleaned up via destroy()
 */

import { DEFAULTS, SCROLL_MORE } from '../config.js';
import { t } from '../i18n.js';

const SCROLL_STEPS = SCROLL_MORE.SCROLL_STEPS;
const PULL_THRESHOLD = SCROLL_MORE.PULL_THRESHOLD;
const MAX_HINT_DURATION = SCROLL_MORE.MAX_HINT_DURATION;

/**
 * Module-level reference to the active instance.
 * Prevents duplicate window listeners on accidental double-init.
 * @type {{ destroy: Function } | null}
 */
let _activeInstance = null;

/**
 * Find the next step in the Fibonacci progression.
 * Returns null when already at (or above) the maximum.
 * @param {number} current
 * @returns {number|null}
 */
export function getNextStep(current) {
  for (const step of SCROLL_STEPS) {
    if (step > current) return step;
  }
  return null;
}

/**
 * Check whether the given count has reached the maximum scroll step.
 * @param {number} count
 * @returns {boolean}
 */
export function isAtMax(count) {
  return count >= SCROLL_STEPS[SCROLL_STEPS.length - 1];
}

/**
 * Initialise the scroll-more feature on a board.
 *
 * @param {Object}      opts
 * @param {HTMLElement} opts.boardEl    - The .board element (kept for API compat, unused)
 * @param {HTMLElement} opts.listEl     - The .departures element
 * @param {Function}    opts.onLoadMore - Callback(newCount) to fetch more departures
 * @returns {{ destroy: Function, reset: Function, indicatorEl: HTMLElement, getTemporaryCount: Function, updateTranslations: Function }}
 */
export function initScrollMore({ boardEl, listEl, onLoadMore }) {
  if (_activeInstance !== null) {
    console.warn('scroll-more: double-init detected — destroying previous instance');
    _activeInstance.destroy();
    _activeInstance = null;
  }

  /** Current temporary departure count (null = use DEFAULTS.NUM_DEPARTURES) */
  let tempCount = null;

  /** Whether a load-more fetch is currently in flight */
  let loading = false;

  /** Active pointer tracking state */
  let pointerActive = false;
  let startY = 0;
  /** Raw (un-resisted) pull distance for threshold comparison */
  let rawPullDistance = 0;
  /** Whether load-more threshold was reached during this gesture */
  let thresholdTriggered = false;

  /** Timer for the max-reached hint auto-dismiss */
  let maxHintTimer = null;

  /** Timestamp (ms) of the last load-more trigger — used for debouncing */
  let lastLoadMoreAt = 0;

  // ── Indicator element ──────────────────────────────────────────────

  const indicator = document.createElement('div');
  indicator.className = 'scroll-more-indicator';
  indicator.setAttribute('aria-hidden', 'true');

  const arrow = document.createElement('span');
  arrow.className = 'scroll-more-arrow';
  arrow.textContent = SCROLL_MORE.SYMBOL_ARROW;

  const label = document.createElement('span');
  label.className = 'scroll-more-label';
  label.textContent = t('scrollForMore');

  indicator.append(arrow, label);

  if (listEl.nextSibling) {
    boardEl.insertBefore(indicator, listEl.nextSibling);
  } else {
    boardEl.appendChild(indicator);
  }

  updateIndicator();

  // ── Helpers ────────────────────────────────────────────────────────

  function getEffectiveCount() {
    return tempCount ?? DEFAULTS.NUM_DEPARTURES;
  }

  function updateIndicator() {
    const count = getEffectiveCount();
    if (isAtMax(count)) {
      arrow.textContent = SCROLL_MORE.SYMBOL_MAX;
      arrow.classList.remove('scroll-more-arrow');
      arrow.classList.add('scroll-more-dot');
      label.textContent = '';
      indicator.classList.add('scroll-more-maxed');
      indicator.classList.remove('scroll-more-loading');
    } else {
      arrow.textContent = SCROLL_MORE.SYMBOL_ARROW;
      arrow.classList.remove('scroll-more-dot');
      arrow.classList.add('scroll-more-arrow');
      label.textContent = t('scrollForMore');
      indicator.classList.remove('scroll-more-maxed');
    }
  }

  /** Show temporary "for more change in ⚙️" message */
  function showMaxHint() {
    label.textContent = t('scrollMaxReached');
    if (maxHintTimer) clearTimeout(maxHintTimer);
    maxHintTimer = setTimeout(() => {
      label.textContent = '';
      maxHintTimer = null;
    }, MAX_HINT_DURATION);
  }

  /**
   * Attempt to load the next batch of departures.
   * Respects the Fibonacci progression and calls the onLoadMore callback.
   * A leading-edge debounce (SCROLL_MORE.DEBOUNCE_MS) prevents double-fires.
   */
  async function triggerLoadMore() {
    if (loading) return;

    const now = Date.now();
    if (now - lastLoadMoreAt < SCROLL_MORE.DEBOUNCE_MS) return;
    lastLoadMoreAt = now;

    const current = getEffectiveCount();
    const next = getNextStep(current);

    if (next === null) {
      showMaxHint();
      return;
    }

    loading = true;
    indicator.classList.add('scroll-more-loading');

    try {
      await onLoadMore(next);
      tempCount = next;
    } catch (err) {
      console.warn('Scroll-more load failed', err);
      // tempCount intentionally NOT advanced on failure so the user can retry
    } finally {
      loading = false;
      indicator.classList.remove('scroll-more-loading');
      updateIndicator();
    }
  }

  // ── Pointer (touch + mouse) handlers ───────────────────────────────

  /**
   * Returns true when the board fits in the viewport or the page is
   * scrolled near the bottom — the only cases where a pull-up should
   * trigger load-more.
   */
  function isNearBottom() {
    const boardRect = boardEl.getBoundingClientRect();
    if (boardRect.height <= window.innerHeight) return true;
    const scrollBottom = window.innerHeight + window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    return docHeight - scrollBottom < 60;
  }

  function onPointerDown(e) {
    if (e.button && e.button !== 0) return;
    if (document.body.classList.contains('options-open')) return;
    if (!isNearBottom()) return;

    pointerActive = true;
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    rawPullDistance = 0;
    thresholdTriggered = false;

    if (!e.touches && e.cancelable) e.preventDefault();
  }

  function onPointerMove(e) {
    if (!pointerActive) return;

    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rawDelta = clientY - startY;

    if (rawDelta >= 0) {
      // Downward — reset tracking
      rawPullDistance = 0;
      return;
    }

    rawPullDistance = Math.abs(rawDelta);

    if (rawPullDistance >= PULL_THRESHOLD && !thresholdTriggered) {
      thresholdTriggered = true;
      indicator.classList.add('scroll-more-indicator--triggered');
    }

    if (e.cancelable && rawPullDistance > 10) {
      e.preventDefault();
    }
  }

  function onPointerEnd() {
    if (!pointerActive) return;
    pointerActive = false;

    indicator.classList.remove('scroll-more-indicator--triggered');

    if (thresholdTriggered) {
      triggerLoadMore();
    }

    rawPullDistance = 0;
    thresholdTriggered = false;
  }

  // ── Wheel handler (desktop) ─────────────────────────────────────────

  let wheelAccumulator = 0;
  let wheelResetTimer = null;

  function onWheel(e) {
    if (document.body.classList.contains('options-open')) return;
    if (!isNearBottom()) return;
    if (e.deltaY <= 0) return;

    const MAX_DELTA_PER_EVENT = SCROLL_MORE.WHEEL_THRESHOLD / 2;
    wheelAccumulator += Math.min(e.deltaY, MAX_DELTA_PER_EVENT);

    if (wheelResetTimer) clearTimeout(wheelResetTimer);
    wheelResetTimer = setTimeout(() => {
      wheelAccumulator = 0;
      wheelResetTimer = null;
    }, SCROLL_MORE.WHEEL_RESET_MS);

    if (wheelAccumulator >= SCROLL_MORE.WHEEL_THRESHOLD) {
      wheelAccumulator = 0;
      triggerLoadMore();
    }
  }

  // ── Bind events ────────────────────────────────────────────────────

  boardEl.addEventListener('touchstart', onPointerDown, { passive: true });
  boardEl.addEventListener('touchmove', onPointerMove, { passive: false });
  boardEl.addEventListener('touchend', onPointerEnd, { passive: true });
  boardEl.addEventListener('touchcancel', onPointerEnd, { passive: true });

  boardEl.addEventListener('mousedown', onPointerDown, { passive: false });
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerEnd);

  window.addEventListener('wheel', onWheel, { passive: true });

  // ── Public API ─────────────────────────────────────────────────────

  function reset() {
    tempCount = null;
    loading = false;
    lastLoadMoreAt = 0;
    pointerActive = false;
    rawPullDistance = 0;
    thresholdTriggered = false;
    if (maxHintTimer) {
      clearTimeout(maxHintTimer);
      maxHintTimer = null;
    }
    updateIndicator();
  }

  function getTemporaryCount() {
    return getEffectiveCount();
  }

  function updateTranslations() {
    updateIndicator();
  }

  function destroy() {
    boardEl.removeEventListener('touchstart', onPointerDown);
    boardEl.removeEventListener('touchmove', onPointerMove);
    boardEl.removeEventListener('touchend', onPointerEnd);
    boardEl.removeEventListener('touchcancel', onPointerEnd);
    boardEl.removeEventListener('mousedown', onPointerDown);
    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('mouseup', onPointerEnd);
    window.removeEventListener('wheel', onWheel);
    if (maxHintTimer) clearTimeout(maxHintTimer);
    if (wheelResetTimer) clearTimeout(wheelResetTimer);
    indicator.remove();
    _activeInstance = null;
  }

  const instance = {
    destroy,
    reset,
    getTemporaryCount,
    updateTranslations,
    indicatorEl: indicator,
  };
  _activeInstance = instance;
  return instance;
}
