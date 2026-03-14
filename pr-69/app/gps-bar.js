/**
 * gps-bar.js — GPS action bar (top-left compass button)
 *
 * Creates a fixed top-left bar containing the GPS nearby-stops button.
 * Mirrors the pattern of action-bar.js (top-right bar) for the left side.
 */

import { createGpsButton } from '../ui/gps-dropdown.js';

/**
 * Build and mount the GPS action bar.
 *
 * @param {Function} onStationSelect - Called with { name, stopId, modes } when a nearby stop is chosen
 * @returns {{ gpsContainer: HTMLElement }}
 */
export function buildGpsBar(onStationSelect) {
  const gpsContainer = createGpsButton(onStationSelect);

  const gpsBar = document.createElement('div');
  gpsBar.className = 'gps-bar';
  gpsBar.appendChild(gpsContainer);
  document.body.appendChild(gpsBar);

  return { gpsContainer };
}
