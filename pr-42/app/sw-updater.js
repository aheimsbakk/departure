/**
 * sw-updater.js — Service worker registration and auto-update flow
 *
 * Responsibilities:
 *   - Register the service worker
 *   - Detect a waiting/installing worker and show a 5-second countdown toast
 *   - Send SKIP_WAITING to activate the new worker
 *   - Hard-reload the page on controllerchange with a cache-bust timestamp
 */

import { VERSION } from '../config.js';
import { t } from '../i18n.js';

/**
 * Show a 5-second countdown toast, then trigger skipWaiting so the new
 * service worker activates and the page reloads with fresh assets.
 *
 * @param {ServiceWorker} worker - The waiting or installing worker
 */
async function showUpdateNotification(worker) {
  // Avoid stacking multiple toasts
  if (document.getElementById('sw-update-toast')) return;

  // Temporarily hide the footer version during the update countdown
  const footer = document.querySelector('.app-footer');
  if (footer) footer.style.display = 'none';

  // Try to read the new version string from the incoming SW script
  let newVersion = 'new version';
  try {
    const swText = await fetch('./sw.js').then(r => r.text());
    const match  = swText.match(/VERSION\s*=\s*['"]([^'"]+)['"]/);
    if (match) newVersion = match[1];
  } catch (_) { /* use fallback string */ }

  const toast = document.createElement('div');
  toast.id = 'sw-update-toast';

  let countdown = 5;
  const updateToast = () => {
    toast.innerHTML =
      `<div>${t('newVersionAvailable')}</div>` +
      `<div>${t('upgradingFrom')} ${VERSION} ${t('to')} ${newVersion}</div>` +
      `<div>${t('updatingIn')} ${countdown}${t('seconds')}</div>`;
  };
  updateToast();
  document.body.appendChild(toast);

  const countdownId = setInterval(() => {
    countdown--;
    if (countdown > 0) updateToast();
    else clearInterval(countdownId);
  }, 1000);

  // Tell the waiting worker to activate after 5 s
  const skipWaitingId = setTimeout(() => {
    if (worker) worker.postMessage({ type: 'SKIP_WAITING' });
  }, 5000);

  // Cancel both timers if the page is hidden/unloaded before they fire
  // to avoid operating on detached DOM nodes or stale worker references.
  function _cancelTimers() {
    clearInterval(countdownId);
    clearTimeout(skipWaitingId);
  }
  window.addEventListener('pagehide', _cancelTimers, { once: true });
}

/**
 * Register the service worker and wire the auto-update flow.
 * Non-fatal: any failure is silently swallowed.
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const reg = await navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' });
    // Check for a newer SW immediately on load
    reg.update().catch(() => {});

    // If there is already a waiting worker (e.g. page was open in background)
    if (reg.waiting) showUpdateNotification(reg.waiting);

    // Watch for a newly installed worker becoming ready
    reg.addEventListener('updatefound', () => {
      const installing = reg.installing;
      if (!installing) return;
      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdateNotification(reg.waiting || installing);
        }
      });
    });

    // Reload on controllerchange, which the browser fires only after the new SW
    // has called clients.claim() — meaning activate() has fully resolved and old
    // caches have already been deleted. A queueMicrotask gives the activate
    // waitUntil promise one extra tick to fully settle before the navigation.
    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloading) return;
      reloading = true;
      queueMicrotask(() => {
        window.location.href = window.location.href.split('?')[0];
      });
    });
  } catch (_) { /* SW registration failure is non-fatal */ }
}
