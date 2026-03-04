/**
 * render.js — Departure list rendering
 *
 * Responsibilities:
 *   - Clear and repopulate the departure list element
 *   - Show an empty-state message when there are no departures
 */

import { formatCountdown } from '../time.js';
import { clearList } from '../ui/ui.js';
import { createDepartureNode, updateDepartureCountdown } from '../ui/departure.js';
import { t } from '../i18n.js';

/**
 * Re-render the departure list from scratch.
 * Shows an empty-state message when the array is empty.
 *
 * @param {HTMLElement}   listEl - Container element for departure rows
 * @param {Array<Object>} items  - Parsed departure objects
 */
export function renderDepartures(listEl, items) {
  clearList(listEl);
  if (!items || items.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = t('noDepartures');
    listEl.appendChild(empty);
    return;
  }
  for (const item of items) {
    const node = createDepartureNode(item);
    // Render the initial countdown so there is no blank moment before the
    // first tick of the setInterval.
    updateDepartureCountdown(node, Date.now(), formatCountdown, t);
    listEl.appendChild(node.container);
  }
}
