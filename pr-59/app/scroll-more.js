/**
 * scroll-more.js — Pull-to-load-more departures via touch/mouse drag
 *
 * Responsibilities:
 *   - Track a temporary departure count that overrides DEFAULTS.NUM_DEPARTURES
 *   - Fibonacci-like progression: 1, 2, 3, 5, 8, 13, 21 (max)
 *   - Detect pull-up gesture on the departure list (touch + mouse)
 *   - Apply visual drag feedback using top/marginTop (no GPU translate)
 *   - Animate bounce-back (ease-out-cubic, rAF) when finger is released
 *   - Show ⯆ "scroll for more" indicator, switching to ● "for more change in ⚙️" at max
 *   - Reset temporary count on station change or app reload
 *
 * Design constraints:
 *   - No CSS transform/translate (GPU) — uses marginTop for displacement
 *   - No external dependencies
 *   - Works on PC, Android, macOS, iOS (touch + mouse + wheel)
 *   - Resistance threshold prevents accidental loading
 *   - Memory-safe: all listeners are cleaned up via destroy()
 *
 * Snap-back animation strategy (v1.37.28+):
 *   - Uses a CSS transition on margin-top instead of a JS rAF loop.
 *   - CSS transitions run on the compositor thread and are immune to the JS
 *     thread stalls that caused the rAF animation to freeze on mobile browsers
 *     after a touch gesture.
 *   - During drag: .board--snapping is absent → margin-top tracks finger instantly.
 *   - On release: .board--snapping is added → CSS transition animates to target.
 *   - After transition ends (transitionend event): class is removed, inline style
 *     is cleaned up, and (on touch) triggerLoadMore() is called.
 *   - On mouse drag (desktop): load-more fires mid-gesture at threshold (unchanged).
 *   - All rAF / bounceRafId / bounceCancelled state has been removed.
 */

import { DEFAULTS, SCROLL_MORE } from '../config.js';
import { t } from '../i18n.js';

// Fibonacci-like progression for temporary departure counts
const SCROLL_STEPS = SCROLL_MORE.SCROLL_STEPS;

/** Pixels the user must drag upward before triggering a load */
const PULL_THRESHOLD = SCROLL_MORE.PULL_THRESHOLD;

/** Resistance factor — higher = harder to drag (0–1 maps to 0–PULL_THRESHOLD visually) */
const RESISTANCE = SCROLL_MORE.RESISTANCE;

/** Duration (ms) of the "max reached" hint text before it fades */
const MAX_HINT_DURATION = SCROLL_MORE.MAX_HINT_DURATION;

/**
 * Module-level reference to the active scroll-more instance.
 * Prevents duplicate window listeners if initScrollMore is ever called
 * a second time (e.g. due to a hot-reload or an accidental double-init).
 * The previous instance is destroyed before the new one is created.
 * @type {{ destroy: Function } | null}
 */
let _activeInstance = null;

/**
 * Find the next step in the Fibonacci progression.
 * Returns null when already at (or above) the maximum.
 *
 * @param {number} current - Current temporary departure count
 * @returns {number|null}  - Next step, or null if at max
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
 * @param {Object}   opts
 * @param {HTMLElement} opts.boardEl    - The .board element (draggable container)
 * @param {HTMLElement} opts.listEl     - The .departures element
 * @param {Function}    opts.onLoadMore - Callback(newCount) to fetch more departures
 * @returns {{ destroy: Function, reset: Function, indicatorEl: HTMLElement, getTemporaryCount: Function }}
 */
export function initScrollMore({ boardEl, listEl, onLoadMore }) {
  // Guard against accidental double-init: destroy any existing instance first
  // so that the window-level mouse and wheel listeners from the previous call
  // are removed before the new ones are registered.
  if (_activeInstance !== null) {
    console.warn('scroll-more: double-init detected — destroying previous instance');
    _activeInstance.destroy();
    _activeInstance = null;
  }

  /** Current temporary departure count (null = use DEFAULTS.NUM_DEPARTURES) */
  let tempCount = null;

  /** Whether a load-more is currently in flight */
  let loading = false;

  /**
   * Whether the threshold was reached on a touch gesture that is now
   * snapping back. triggerLoadMore() will be called once transitionend fires.
   */
  let loadAfterSnap = false;

  /** Active pointer tracking state */
  let pointerActive = false;
  let startY = 0;
  let currentDeltaY = 0;
  /** Raw (un-resisted) pull distance for threshold comparison */
  let rawPullDistance = 0;
  /** Whether load-more was already triggered during this gesture */
  let thresholdTriggered = false;

  /**
   * When true the current gesture was started while a snap-back transition
   * was running.  The gesture is treated as an "interrupt" — the transition
   * is cancelled instantly and the gesture is passed through to the browser.
   * Resets on pointer-up so the next gesture is handled normally.
   */
  let interruptedSnap = false;

  /**
   * Timestamp (ms) of the most recent touchend event.
   * Used to suppress the synthetic mousedown that iOS/Android fire ~300 ms
   * after a touch gesture ends (ghost click).  Without this guard the ghost
   * mousedown hits onPointerDown while the snap-back transition is still
   * running, triggering the interrupt path and cancelling the animation.
   */
  let lastTouchEndAt = 0;
  /** Grace period (ms) during which a mousedown after a touchend is ignored. */
  const GHOST_CLICK_GUARD_MS = 600;

  /**
   * Stable reference to the transitionend handler so it can be removed
   * correctly when a snap is interrupted or reset.
   * Assigned inside snapBack() before being registered.
   */
  let _snapEndHandler = null;

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
  arrow.textContent = '▼';

  const label = document.createElement('span');
  label.className = 'scroll-more-label';
  label.textContent = t('scrollForMore');

  indicator.append(arrow, label);

  // Insert indicator after the departures list inside the board
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
      arrow.textContent = '●';
      arrow.classList.remove('scroll-more-arrow');
      arrow.classList.add('scroll-more-dot');
      label.textContent = '';
      indicator.classList.add('scroll-more-maxed');
      indicator.classList.remove('scroll-more-loading');
    } else {
      arrow.textContent = '▼';
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
   * Apply vertical displacement to the board element.
   * Uses marginTop to avoid GPU compositing (per requirements).
   * @param {number} dy - Displacement in pixels (negative = up)
   */
  function applyDisplacement(dy) {
    boardEl.style.marginTop = `${dy}px`;
  }

  /**
   * Remove the inline marginTop entirely so flexbox centering
   * (justify-content: center) can take over without interference.
   */
  function clearDisplacement() {
    boardEl.style.removeProperty('margin-top');
  }

  /**
   * Animate the board back to its natural position using a CSS transition.
   * CSS transitions run on the compositor thread and are immune to JS-thread
   * stalls caused by touch gesture handling on mobile browsers.
   *
   * Strategy:
   *   1. Read current marginTop (the drag displacement).
   *   2. If already at target, clean up and return.
   *   3. Add .board--snapping to enable the CSS transition.
   *   4. Set marginTop to the target value — the browser animates it.
   *   5. On transitionend: remove .board--snapping, clean up inline style,
   *      and (if loadAfterSnap) call triggerLoadMore().
   *
   * If content overflows the viewport, clamp target to keep the bottom
   * of the board at the bottom of the viewport (same logic as before).
   */
  function snapBack() {
    // If a snap is already in progress, cancel it instantly so we can
    // start a fresh one from the current position.
    if (boardEl.classList.contains('board--snapping')) {
      boardEl.classList.remove('board--snapping');
      if (_snapEndHandler) {
        boardEl.removeEventListener('transitionend', _snapEndHandler);
        _snapEndHandler = null;
      }
    }

    const startDisplacement = parseFloat(boardEl.style.marginTop) || 0;

    // Calculate target: 0 normally; clamped if board overflows viewport.
    const boardHeight = boardEl.getBoundingClientRect().height;
    const screenHeight = window.innerHeight;
    const minDisplacement = boardHeight > screenHeight ? -(boardHeight - screenHeight) : 0;
    const targetDisplacement = Math.min(0, minDisplacement);

    if (startDisplacement === targetDisplacement) {
      if (targetDisplacement === 0) clearDisplacement();
      currentDeltaY = targetDisplacement;
      // Still need to fire load if pending
      if (loadAfterSnap) {
        loadAfterSnap = false;
        triggerLoadMore();
      }
      return;
    }

    _snapEndHandler = function onSnapEnd(ev) {
      // Only react to margin-top transitions on boardEl itself
      if (ev.target !== boardEl || ev.propertyName !== 'margin-top') return;
      boardEl.classList.remove('board--snapping');
      boardEl.removeEventListener('transitionend', _snapEndHandler);
      _snapEndHandler = null;
      if (targetDisplacement === 0) {
        clearDisplacement();
      } else {
        applyDisplacement(targetDisplacement);
      }
      currentDeltaY = targetDisplacement;
      if (loadAfterSnap) {
        loadAfterSnap = false;
        triggerLoadMore();
      }
    };

    boardEl.addEventListener('transitionend', _snapEndHandler);
    boardEl.classList.add('board--snapping');
    // Force a reflow so the browser commits the current marginTop as the
    // transition start value before we set the target.  Without this, both
    // the class addition and the style change land in the same style-flush
    // and the browser skips the transition entirely (no transitionend fires).
    // eslint-disable-next-line no-unused-expressions
    boardEl.offsetHeight; // reflow
    // Setting the target value now triggers the CSS transition
    applyDisplacement(targetDisplacement);
  }

  /**
   * Attempt to load the next batch of departures.
   * Respects the Fibonacci progression and calls the onLoadMore callback.
   * A leading-edge debounce (SCROLL_MORE.DEBOUNCE_MS) prevents double-fires
   * from rapid wheel ticks or gesture re-entry.
   */
  async function triggerLoadMore() {
    if (loading) return;

    const now = Date.now();
    if (now - lastLoadMoreAt < SCROLL_MORE.DEBOUNCE_MS) return;
    lastLoadMoreAt = now;

    const current = getEffectiveCount();
    const next = getNextStep(current);

    if (next === null) {
      // Already at max — show hint
      showMaxHint();
      return;
    }

    loading = true;
    indicator.classList.add('scroll-more-loading');

    // Advance tempCount only after a successful fetch.  Setting it before the
    // await caused a silent state desync: if doRefresh() returned early because
    // fetchInFlight was already true, the indicator would show the new (higher)
    // count while the displayed data still reflected the previous count.
    try {
      await onLoadMore(next);
      tempCount = next;
    } catch (err) {
      console.warn('Scroll-more load failed', err);
      // tempCount is intentionally NOT advanced on failure so the user can retry
    } finally {
      loading = false;
      indicator.classList.remove('scroll-more-loading');
      updateIndicator();
    }
  }

  // ── Pointer (touch + mouse) handlers ───────────────────────────────

  /**
   * Determine if the departure list is scrolled to or near its bottom,
   * OR if the content doesn't overflow at all.
   * Only then should pull-up gestures trigger load-more.
   */
  function isNearBottom() {
    // If the list fits within the viewport, always allow pull
    const boardRect = boardEl.getBoundingClientRect();
    if (boardRect.height <= window.innerHeight) return true;

    // Otherwise, check if the page is scrolled near the bottom
    const scrollBottom = window.innerHeight + window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    return docHeight - scrollBottom < 60;
  }

  function onPointerDown(e) {
    // Only handle primary button (touch or left-click)
    if (e.button && e.button !== 0) return;
    // Don't interfere when the options panel is open
    if (document.body.classList.contains('options-open')) return;
    // Suppress the synthetic mousedown that iOS/Android emit ~300 ms after
    // touchend (ghost click).  It would otherwise hit the snap-interrupt path
    // and cancel the CSS snap-back animation mid-flight.
    if (!e.touches && Date.now() - lastTouchEndAt < GHOST_CLICK_GUARD_MS) return;

    // Only start tracking if we're near bottom (or list fits in viewport)
    if (!isNearBottom()) return;

    // If a snap-back transition is running, the user is interrupting it.
    // Cancel the transition instantly, clear displacement, and mark the
    // gesture as an interrupt so onPointerMove passes events to the browser.
    if (boardEl.classList.contains('board--snapping')) {
      boardEl.classList.remove('board--snapping');
      if (_snapEndHandler) {
        boardEl.removeEventListener('transitionend', _snapEndHandler);
        _snapEndHandler = null;
      }
      currentDeltaY = 0;
      loadAfterSnap = false;
      clearDisplacement();
      boardEl.classList.remove('board--pulling');
      interruptedSnap = true;
      // Do NOT set pointerActive — let the browser handle this gesture natively
      return;
    }

    pointerActive = true;
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    // Read the board's actual displacement so the gesture starts from the
    // real visual position.  After a snapBack() that clamped to a non-zero
    // minDisplacement the board may still carry an inline marginTop — zeroing
    // currentDeltaY here would desync state from the DOM.
    currentDeltaY = parseFloat(boardEl.style.marginTop) || 0;
    rawPullDistance = 0;
    thresholdTriggered = false;

    // Prevent text selection during drag (mouse only)
    if (!e.touches) {
      e.preventDefault();
    }
  }

  function onPointerMove(e) {
    if (!pointerActive) return;

    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rawDelta = clientY - startY;

    // Only respond to upward pull (negative delta = pull up)
    if (rawDelta >= 0) {
      // User is pulling down — let native pull-to-refresh work
      if (currentDeltaY !== 0) {
        clearDisplacement();
        currentDeltaY = 0;
        rawPullDistance = 0;
      }
      // Relinquish touch ownership so the browser can scroll normally
      boardEl.classList.remove('board--pulling');
      return;
    }

    // Upward pull confirmed — claim touch ownership from the browser.
    // This eliminates the per-frame preventDefault handshake on Firefox mobile
    // that causes visible scroll jank (Chrome handles this heuristically).
    boardEl.classList.add('board--pulling');

    // Apply resistance: rubber-band effect — displacement grows slower the further you pull
    const absDelta = Math.abs(rawDelta);
    rawPullDistance = absDelta;
    // Logarithmic resistance: fast initial response, then increasingly stiff
    const maxVisual = PULL_THRESHOLD * 2;
    const resistedDelta = -(maxVisual * (1 - Math.exp(-absDelta / (maxVisual / RESISTANCE))));
    currentDeltaY = resistedDelta;

    applyDisplacement(currentDeltaY);

    // On mouse drag (desktop): trigger load-more mid-gesture at threshold.
    // On touch (mobile): only mark thresholdTriggered here; the actual
    // triggerLoadMore() call is deferred to after the snap-back animation
    // in onPointerEnd to avoid rAF stalls from DOM mutations on mobile.
    if (rawPullDistance >= PULL_THRESHOLD && !thresholdTriggered) {
      thresholdTriggered = true;
      if (!e.touches) {
        triggerLoadMore();
      }
    }

    // Prevent default scrolling while we're handling the pull gesture
    if (e.cancelable && absDelta > 10) {
      e.preventDefault();
    }
  }

  function onPointerEnd(e) {
    // Clear the snap-interrupt flag so the next gesture is handled normally
    if (interruptedSnap) {
      interruptedSnap = false;
      boardEl.classList.remove('board--pulling');
      return;
    }

    if (!pointerActive) return;
    pointerActive = false;
    boardEl.classList.remove('board--pulling');

    const isTouch = e && e.type && e.type.startsWith('touch');
    // Record touch-end time so onPointerDown can suppress the ghost mousedown
    // that mobile browsers synthesise ~300 ms after a touch gesture ends.
    if (isTouch) lastTouchEndAt = Date.now();

    if (isTouch && thresholdTriggered) {
      // Mobile touch path: snap back via CSS transition; triggerLoadMore()
      // is called from onSnapEnd (transitionend) once the animation completes.
      // This is compositor-driven and immune to JS-thread stalls on mobile.
      loadAfterSnap = true;
    }
    // Both touch and mouse: start the snap-back transition.
    // For mouse, load was already triggered mid-gesture; snapBack just animates.
    snapBack();

    rawPullDistance = 0;
    thresholdTriggered = false;
  }

  // ── Wheel handler (desktop scroll) ─────────────────────────────────

  let wheelAccumulator = 0;
  let wheelResetTimer = null;

  function onWheel(e) {
    // Don't interfere when options panel is open
    if (document.body.classList.contains('options-open')) return;
    // Only respond when near bottom
    if (!isNearBottom()) return;
    // Only respond to downward scroll
    if (e.deltaY <= 0) return;

    // Clamp the per-event contribution so that a single high-resolution
    // trackpad event (which can fire deltaY > 1000 px) cannot single-handedly
    // exceed the threshold.  This normalises behaviour across mouse wheels
    // (large discrete steps) and trackpads (many small fractional steps).
    const MAX_DELTA_PER_EVENT = SCROLL_MORE.WHEEL_THRESHOLD / 2;
    wheelAccumulator += Math.min(e.deltaY, MAX_DELTA_PER_EVENT);

    // Reset accumulator after inactivity
    if (wheelResetTimer) clearTimeout(wheelResetTimer);
    wheelResetTimer = setTimeout(() => {
      wheelAccumulator = 0;
      wheelResetTimer = null;
    }, SCROLL_MORE.WHEEL_RESET_MS);

    // Require sustained scroll effort (resistance)
    if (wheelAccumulator >= SCROLL_MORE.WHEEL_THRESHOLD) {
      wheelAccumulator = 0;
      triggerLoadMore();
    }
  }

  // ── Bind events ────────────────────────────────────────────────────

  // Touch events on the board (passive: false so we can preventDefault on move)
  boardEl.addEventListener('touchstart', onPointerDown, { passive: true });
  boardEl.addEventListener('touchmove', onPointerMove, { passive: false });
  boardEl.addEventListener('touchend', onPointerEnd, { passive: true });
  boardEl.addEventListener('touchcancel', onPointerEnd, { passive: true });

  // Mouse events for desktop drag
  boardEl.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerEnd);

  // Wheel for desktop scroll
  window.addEventListener('wheel', onWheel, { passive: true });

  // ── Public API ─────────────────────────────────────────────────────

  /**
   * Reset the temporary departure count to configured default.
   * Called on station change and settings apply.
   */
  function reset() {
    tempCount = null;
    loading = false;
    loadAfterSnap = false;
    lastLoadMoreAt = 0;
    lastTouchEndAt = 0;
    interruptedSnap = false;
    pointerActive = false;
    boardEl.classList.remove('board--pulling');
    // Cancel any running snap-back transition and restore natural position.
    if (boardEl.classList.contains('board--snapping')) {
      boardEl.classList.remove('board--snapping');
      if (_snapEndHandler) {
        boardEl.removeEventListener('transitionend', _snapEndHandler);
        _snapEndHandler = null;
      }
      currentDeltaY = 0;
      clearDisplacement();
    }
    if (maxHintTimer) {
      clearTimeout(maxHintTimer);
      maxHintTimer = null;
    }
    updateIndicator();
  }

  /**
   * Get the current effective departure count (temporary or default).
   * @returns {number}
   */
  function getTemporaryCount() {
    return getEffectiveCount();
  }

  /**
   * Refresh indicator text (e.g. after language change).
   */
  function updateTranslations() {
    updateIndicator();
  }

  /**
   * Remove all event listeners and clean up.
   */
  function destroy() {
    boardEl.removeEventListener('touchstart', onPointerDown);
    boardEl.removeEventListener('touchmove', onPointerMove);
    boardEl.removeEventListener('touchend', onPointerEnd);
    boardEl.removeEventListener('touchcancel', onPointerEnd);
    boardEl.removeEventListener('mousedown', onPointerDown);
    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('mouseup', onPointerEnd);
    window.removeEventListener('wheel', onWheel);
    boardEl.classList.remove('board--pulling');
    boardEl.classList.remove('board--snapping');
    if (_snapEndHandler) {
      boardEl.removeEventListener('transitionend', _snapEndHandler);
      _snapEndHandler = null;
    }
    loadAfterSnap = false;
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
