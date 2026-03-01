// panel-lifecycle.js — open/close, focus trap, ESC handler, toast notification
import { t } from '../../i18n.js';

/**
 * Wire open/close lifecycle onto an existing panel element and create the toast + close button.
 *
 * @param {HTMLElement} panel   — the <aside class="options-panel"> element
 * @param {object}      deps
 * @param {Function}    deps.onClose — called when the panel closes (optional)
 * @returns {{
 *   btnClose: HTMLButtonElement,
 *   actions: HTMLElement,
 *   toast: HTMLElement,
 *   open: (updateFieldsFn: Function) => void,
 *   close: () => void,
 *   showToast: (msg?: string) => void,
 * }}
 */
export function createPanelLifecycle(panel, { onClose } = {}) {
  // Close button + actions bar
  const actions = document.createElement('div');
  actions.className = 'options-actions';
  const btnClose = document.createElement('button');
  btnClose.type = 'button';
  btnClose.textContent = t('close');
  actions.append(btnClose);

  // Toast element
  const toast = document.createElement('div');
  toast.className = 'options-toast';
  panel.appendChild(toast);

  // Track both the fade-start and fade-end timers so rapid calls never orphan either.
  let _toastFadeId  = null;
  let _toastClearId = null;

  function showToast(msg) {
    try {
      toast.textContent = msg || t('settingsApplied');
      toast.classList.add('visible');
      toast.style.opacity = '1';
      // Cancel any in-flight fade timers before starting fresh
      clearTimeout(_toastFadeId);
      clearTimeout(_toastClearId);
      _toastFadeId = setTimeout(() => {
        toast.style.opacity = '0';
        _toastClearId = setTimeout(() => { toast.classList.remove('visible'); }, 300);
      }, 1400);
    } catch (e) { /* ignore */ }
  }

  // Focus trap
  function _trap(e) {
    if (e.key !== 'Tab') return;
    const focusables = panel.querySelectorAll('input,button,select,a[href],textarea,[tabindex]:not([tabindex="-1"])');
    if (!focusables || focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  function _escClose(e) {
    if (e.key === 'Escape' || e.key === 'Esc') closePanel();
  }

  let _prevFocus = null;

  /** Open the panel: remove inert, sync fields, trap focus, attach ESC. */
  function openPanel(updateFieldsFn) {
    document.body.classList.add('options-open');
    panel.removeAttribute('inert');
    _prevFocus = document.activeElement;
    if (typeof updateFieldsFn === 'function') updateFieldsFn();
    panel.classList.add('open');
    const first = panel.querySelector('input, button, [tabindex]');
    if (first) first.focus();
    document.addEventListener('keydown', _trap);
    document.addEventListener('keydown', _escClose);
  }

  /** Close the panel: restore layout, make inert, release focus trap. */
  function closePanel() {
    document.body.classList.remove('options-open');
    panel.setAttribute('inert', '');
    panel.classList.remove('open');
    try {
      if (_prevFocus && typeof _prevFocus.focus === 'function') _prevFocus.focus();
    } catch (e) { /* ignore */ }
    document.removeEventListener('keydown', _trap);
    document.removeEventListener('keydown', _escClose);
    if (typeof onClose === 'function') onClose();
  }

  btnClose.addEventListener('click', () => closePanel());

  /**
   * Hard teardown: remove all document-level listeners and cancel pending
   * toast timers. Call this if the panel element is removed from the DOM
   * without going through the normal close flow.
   */
  function destroy() {
    document.removeEventListener('keydown', _trap);
    document.removeEventListener('keydown', _escClose);
    clearTimeout(_toastFadeId);
    clearTimeout(_toastClearId);
  }

  return { btnClose, actions, toast, open: openPanel, close: closePanel, showToast, destroy };
}
