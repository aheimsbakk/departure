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
 */

import { DEFAULTS, SCROLL_MORE } from '../config.js';
import { t } from '../i18n.js';

/**
 * Ease-out cubic: decelerates quickly then glides to rest.
 * @param {number} progress - Normalised time [0, 1]
 * @returns {number}
 */
function easeOutCubic(progress) {
  return 1 - Math.pow(1 - progress, 3);
}

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

  /** Active pointer tracking state */
  let pointerActive = false;
  let startY = 0;
  let currentDeltaY = 0;
  /** Raw (un-resisted) pull distance for threshold comparison */
  let rawPullDistance = 0;
  /** Whether load-more was already triggered during this gesture */
  let thresholdTriggered = false;

  /** rAF handle for the bounce-back animation */
  let bounceRafId = null;

  /**
   * When true the current gesture was started while a bounce-back animation
   * was running.  The gesture is treated as an "interrupt" — the animation
   * stops and the entire gesture is passed through to the browser for native
   * scrolling.  The flag resets on pointer-up so the next gesture is handled
   * normally.
   */
  let interruptedBounce = false;

  /** Timer for the max-reached hint auto-dismiss */
  let maxHintTimer = null;

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
   * Animate the board back to the origin using an ease-out-cubic curve.
   * Cancels any in-progress bounce before starting a new one.
   */
  function snapBack() {
    if (bounceRafId !== null) {
      cancelAnimationFrame(bounceRafId);
      bounceRafId = null;
    }

    const startDisplacement = currentDeltaY;
    if (startDisplacement === 0) {
      // Even if there's nothing to animate, ensure no stale inline style
      clearDisplacement();
      return;
    }

    const startTime = performance.now();
    const duration = SCROLL_MORE.BOUNCE_DURATION_MS;

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const displacement = startDisplacement * (1 - eased);

      applyDisplacement(displacement);

      if (progress < 1) {
        bounceRafId = requestAnimationFrame(step);
      } else {
        // Remove the inline style entirely so CSS flexbox centering is
        // restored cleanly — setting marginTop to "0px" would leave an
        // inline override that can subtly interfere with layout.
        clearDisplacement();
        currentDeltaY = 0;
        bounceRafId = null;
      }
    }

    bounceRafId = requestAnimationFrame(step);
  }

  /**
   * Attempt to load the next batch of departures.
   * Respects the Fibonacci progression and calls the onLoadMore callback.
   */
  async function triggerLoadMore() {
    if (loading) return;

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
    return (docHeight - scrollBottom) < 60;
  }

  function onPointerDown(e) {
    // Only handle primary button (touch or left-click)
    if (e.button && e.button !== 0) return;
    // Don't interfere when the options panel is open
    if (document.body.classList.contains('options-open')) return;

    // Only start tracking if we're near bottom (or list fits in viewport)
    if (!isNearBottom()) return;

    // If a bounce-back animation is running, the user is interrupting it.
    // Cancel the animation, clear displacement, and mark the gesture as an
    // interrupt so that onPointerMove passes all events through to the
    // browser for normal scrolling.
    if (bounceRafId !== null) {
      cancelAnimationFrame(bounceRafId);
      bounceRafId = null;
      currentDeltaY = 0;
      clearDisplacement();
      interruptedBounce = true;
      // Do NOT set pointerActive — let the browser handle this gesture natively
      return;
    }

    pointerActive = true;
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    currentDeltaY = 0;
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
      return;
    }

    // Apply resistance: rubber-band effect — displacement grows slower the further you pull
    const absDelta = Math.abs(rawDelta);
    rawPullDistance = absDelta;
    // Logarithmic resistance: fast initial response, then increasingly stiff
    const maxVisual = PULL_THRESHOLD * 2;
    const resistedDelta = -(maxVisual * (1 - Math.exp(-absDelta / (maxVisual / RESISTANCE))));
    currentDeltaY = resistedDelta;

    applyDisplacement(currentDeltaY);

    // Trigger load-more seamlessly when threshold is reached (not on release)
    if (rawPullDistance >= PULL_THRESHOLD && !thresholdTriggered) {
      thresholdTriggered = true;
      triggerLoadMore();
    }

    // Prevent default scrolling while we're handling the pull gesture
    if (e.cancelable && absDelta > 10) {
      e.preventDefault();
    }
  }

  function onPointerEnd() {
    // Clear the bounce-interrupt flag so the next gesture is handled normally
    if (interruptedBounce) {
      interruptedBounce = false;
      return;
    }

    if (!pointerActive) return;
    pointerActive = false;

    // If content was re-rendered during the gesture (e.g. triggerLoadMore
    // added new departures), the tracked currentDeltaY may no longer match
    // the visual displacement.  Read the actual computed marginTop so the
    // bounce-back starts from the true visual position, avoiding a jump.
    const computedMargin = parseFloat(boardEl.style.marginTop) || 0;
    if (computedMargin !== 0 && Math.abs(computedMargin - currentDeltaY) > 1) {
      currentDeltaY = computedMargin;
    }

    // Animate back to origin with a slow ease-out bounce
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
    interruptedBounce = false;
    // Cancel any running bounce animation and restore the board to its
    // natural position.  Without this the rAF loop would continue writing
    // marginTop on boardEl after a station change, holding a stale DOM
    // reference and potentially fighting any new layout applied by the render.
    if (bounceRafId !== null) {
      cancelAnimationFrame(bounceRafId);
      bounceRafId = null;
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
    if (bounceRafId !== null) {
      cancelAnimationFrame(bounceRafId);
      bounceRafId = null;
    }
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
    indicatorEl: indicator
  };
  _activeInstance = instance;
  return instance;
}
