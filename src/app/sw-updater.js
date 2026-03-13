/**
 * sw-updater.js — Service worker registration and auto-update flow
 *
 * Responsibilities:
 *   - Register the service worker
 *   - Detect a waiting/installing worker and show a 5-second countdown toast
 *   - Send SKIP_WAITING to activate the new worker
 *   - Hard-reload the page on controllerchange with a cache-bust timestamp
 *
 * Timer design: a single setInterval drives both the countdown display AND
 * the skipWaiting trigger. This prevents the Firefox bug where two independent
 * timers (one for the toast, one for skipWaiting) drifted — the toast froze
 * at 1s and the reload never fired in background/throttled tabs.
 */

import { VERSION } from '../config.js';
import { t } from '../i18n.js';

/** Reload the page, stripping any existing query params and adding a cache-bust. */
function reloadWithCacheBust() {
  window.location.href = window.location.pathname + `?t=${Date.now()}`;
}

/**
 * ID for the 2 s fallback reload setTimeout set by showUpdateNotification.
 * Stored at module scope so the controllerchange handler in registerServiceWorker
 * can cancel it — preventing a double-reload when controllerchange fires first.
 * @type {ReturnType<typeof setTimeout> | null}
 */
let _fallbackReloadId = null;

/**
 * Show a 5-second countdown toast, then trigger skipWaiting so the new
 * service worker activates and the page reloads with fresh assets.
 *
 * A single setInterval drives both the toast update and the skipWaiting call —
 * they cannot drift apart. The waiting worker is re-queried from `reg` at the
 * moment of sending (not captured early) to avoid the stale-reference race
 * that Firefox exposes more readily than Chrome.
 *
 * @param {ServiceWorkerRegistration} reg - The active SW registration
 * @param {string} newVersion             - New version string for display
 */
function showUpdateNotification(reg, newVersion) {
  // Avoid stacking multiple toasts if called more than once
  if (document.getElementById('sw-update-toast')) return;

  // Temporarily hide the footer version during the update countdown
  const footer = document.querySelector('.app-footer');
  if (footer) footer.style.display = 'none';

  const toast = document.createElement('div');
  toast.id = 'sw-update-toast';
  document.body.appendChild(toast);

  // Pre-create child elements once; update only textContent on each tick
  // so the setInterval never causes innerHTML-driven DOM teardown/rebuild.
  const lineAvail = document.createElement('div');
  const lineFrom = document.createElement('div');
  const lineCount = document.createElement('div');
  toast.append(lineAvail, lineFrom, lineCount);

  let countdown = 5;

  const renderToast = () => {
    lineAvail.textContent = t('newVersionAvailable');
    lineFrom.textContent = `${t('upgradingFrom')} ${VERSION} ${t('to')} ${newVersion}`;
    lineCount.textContent = `${t('updatingIn')} ${countdown}${t('seconds')}`;
  };
  renderToast();

  const timerId = setInterval(() => {
    countdown--;
    renderToast(); // always update — including the 0s frame

    if (countdown <= 0) {
      clearInterval(timerId);

      // Re-query reg.waiting at trigger time — avoids the stale-reference race
      // where reg.waiting was null when the statechange fired but is set by now.
      const worker = reg.waiting;
      if (worker) {
        worker.postMessage({ type: 'SKIP_WAITING' });
      }

      // Fallback reload: if controllerchange does not fire within 2 s
      // (e.g. the SW was already active, or the event was missed), reload directly.
      // The ID is stored at module scope so the controllerchange handler can cancel
      // it — preventing a double-reload when controllerchange fires before 2 s.
      _fallbackReloadId = setTimeout(reloadWithCacheBust, 2000);
    }
  }, 1000);
}

/**
 * Register the service worker and wire the auto-update flow.
 * Non-fatal: any failure is silently swallowed.
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  try {
    // Wire controllerchange BEFORE register() so the event cannot be missed
    // if skipWaiting fires during the async register/update calls.
    // { once: true } ensures the handler self-removes after the first fire so
    // a second registerServiceWorker() call cannot accumulate a stale listener.
    let reloading = false;
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      () => {
        if (reloading) return;
        reloading = true;
        // Cancel the 2 s fallback — controllerchange fired first, so there is no
        // need for a second reload after the page already navigated.
        clearTimeout(_fallbackReloadId);
        reloadWithCacheBust();
      },
      { once: true }
    );

    const reg = await navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' });
    // Check for a newer SW immediately on load
    reg.update().catch(() => {});

    // Try to read the new version string from the incoming SW script.
    // Fetched lazily once so showUpdateNotification can display it.
    // Done with cache:'reload' to bypass the SW's own cache and get the real new file.
    let newVersion = 'new version';
    const fetchNewVersion = async () => {
      try {
        const swText = await fetch('./sw.js', { cache: 'reload' }).then((r) => r.text());
        const match = swText.match(/VERSION\s*=\s*['"]([^'"]+)['"]/);
        if (match) newVersion = match[1];
      } catch (_) {
        /* keep fallback */
      }
    };

    // If there is already a waiting worker (e.g. page was open in background)
    if (reg.waiting) {
      await fetchNewVersion();
      showUpdateNotification(reg, newVersion);
    }

    // Watch for a newly installed worker becoming ready
    reg.addEventListener('updatefound', () => {
      const installing = reg.installing;
      if (!installing) return;
      installing.addEventListener('statechange', async () => {
        // 'installed' + existing controller = new SW waiting to take over
        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
          await fetchNewVersion();
          showUpdateNotification(reg, newVersion);
        }
      });
    });
  } catch (_) {
    /* SW registration failure is non-fatal */
  }
}
