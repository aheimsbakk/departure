/**
 * gps-dropdown.js — GPS-based nearby stop finder: button + dropdown
 *
 * Responsibilities:
 *   - Compass button (styled as .header-btn, placed in .gps-bar top-left)
 *   - Geolocation request with timeout / permission-denied handling
 *   - Fetch nearby stops via fetchNearbyStops (entur/gps-search.js)
 *   - Temporary dropdown: transport mode emojis + stop name + distance
 *   - On item selection: calls onStationSelect({ name, stopId, modes }), closes dropdown
 *   - Outside-click and ESC close the dropdown; destroy() removes listeners
 */

import { fetchNearbyStops } from '../entur/gps-search.js';
import { TRANSPORT_MODE_EMOJIS, ALL_TRANSPORT_MODES, UI_EMOJIS, DEFAULTS } from '../config.js';
import { t } from '../i18n.js';

const GPS_MAX_RESULTS = 7;
const KNOWN_MODES     = ['bus', 'tram', 'metro', 'rail', 'water', 'coach'];

/**
 * Build a mode-emoji string for the given modes array.
 * Only includes known transport modes; unknown modes are silently skipped.
 *
 * @param {string[]} modes
 * @returns {string}
 */
function getModeEmojis(modes) {
  if (!Array.isArray(modes) || modes.length === 0) return '';
  return modes
    .filter(m => KNOWN_MODES.includes(String(m).toLowerCase()))
    .map(m => TRANSPORT_MODE_EMOJIS[m] || '')
    .filter(Boolean)
    .join('');
}

/**
 * Create a GPS compass button + nearby-stops dropdown component.
 *
 * @param {Function} onStationSelect - Called with { name, stopId, modes } on selection
 * @returns {HTMLElement} container — hosts the button and dropdown; exposes .destroy()
 */
export function createGpsButton(onStationSelect) {
  const container = document.createElement('div');
  container.className = 'gps-dropdown-container';

  // ── Compass button ──────────────────────────────────────────────────────────
  const btn = document.createElement('button');
  btn.className = 'header-btn gps-btn';
  btn.type      = 'button';
  btn.textContent = UI_EMOJIS.compass;
  btn.title       = t('gpsTooltip');
  btn.setAttribute('aria-label', t('gpsTooltip'));
  btn.setAttribute('aria-haspopup', 'true');
  btn.setAttribute('aria-expanded', 'false');

  // ── Dropdown menu ────────────────────────────────────────────────────────────
  const menu = document.createElement('div');
  menu.className = 'gps-dropdown-menu';
  menu.setAttribute('role', 'listbox');

  let isOpen = false;

  // ── Internal helpers ────────────────────────────────────────────────────────

  function closeDropdown() {
    if (!isOpen) return;
    isOpen = false;
    btn.disabled = false;
    btn.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open');
    menu.innerHTML = '';
  }

  function openWith(nodes) {
    isOpen = true;
    btn.setAttribute('aria-expanded', 'true');
    menu.innerHTML = '';
    nodes.forEach(n => menu.appendChild(n));
    menu.classList.add('open');
  }

  /** Build a plain status / error message node. */
  function statusNode(text, isError = false) {
    const el = document.createElement('div');
    el.className = 'gps-dropdown-status' + (isError ? ' gps-dropdown-error' : '');
    el.textContent = text;
    return el;
  }

  /** Build a clickable stop item from a fetchNearbyStops result entry. */
  function buildStopItem(stop) {
    const item = document.createElement('button');
    item.className = 'gps-dropdown-item';
    item.type      = 'button';
    item.setAttribute('role', 'option');

    // Layout: {station name} {mode emojis} · {distance}m
    const nameEl = document.createElement('span');
    nameEl.className   = 'gps-stop-name';
    nameEl.textContent = stop.name;
    item.appendChild(nameEl);

    const emojis = getModeEmojis(stop.modes);
    if (emojis) {
      const modesEl = document.createElement('span');
      modesEl.className   = 'gps-stop-modes';
      modesEl.textContent = emojis;
      item.appendChild(modesEl);
    }

    if (stop.distance != null) {
      const distEl = document.createElement('span');
      distEl.className   = 'gps-stop-distance';
      distEl.textContent = ` · ${stop.distance}m`;
      item.appendChild(distEl);
    }

    item.addEventListener('click', (e) => {
      e.stopPropagation();
      closeDropdown();
      if (onStationSelect && stop.id) {
        onStationSelect({
          name:   stop.name,
          stopId: stop.id,
          // Use the stop's own transport modes as the filter when known,
          // otherwise keep current DEFAULTS or fall back to all modes.
          modes:  stop.modes.length ? stop.modes : ALL_TRANSPORT_MODES.slice()
        });
      }
    });

    return item;
  }

  // ── Main click handler ───────────────────────────────────────────────────────

  async function handleClick() {
    if (isOpen) {
      closeDropdown();
      return;
    }

    if (!navigator.geolocation) {
      openWith([statusNode(t('gpsNotSupported'), true)]);
      return;
    }

    btn.disabled = true;
    openWith([statusNode(t('gpsLocating'))]);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        try {
          const stops = await fetchNearbyStops({
            lat,
            lon,
            maxResults: GPS_MAX_RESULTS,
            clientName: DEFAULTS.CLIENT_NAME
          });
          if (stops.length === 0) {
            openWith([statusNode(t('gpsNoResults'))]);
          } else {
            openWith(stops.map(buildStopItem));
          }
        } catch (err) {
          console.warn('GPS station fetch failed', err);
          openWith([statusNode(t('gpsFetchError'), true)]);
        }
        btn.disabled = false;
      },
      (err) => {
        console.warn('Geolocation error', err.message);
        const msg = err.code === 1 ? t('gpsPermissionDenied') : t('gpsUnavailable');
        openWith([statusNode(msg, true)]);
        btn.disabled = false;
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }

  // ── Event wiring ─────────────────────────────────────────────────────────────

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    handleClick();
  });

  function _onDocClick(e) {
    if (!container.contains(e.target)) closeDropdown();
  }

  function _onKeyDown(e) {
    if (e.key === 'Escape' && isOpen) closeDropdown();
  }

  document.addEventListener('click',   _onDocClick);
  document.addEventListener('keydown', _onKeyDown);

  /** Remove document-level listeners and release DOM references. */
  container.destroy = function () {
    document.removeEventListener('click',   _onDocClick);
    document.removeEventListener('keydown', _onKeyDown);
    menu.innerHTML = '';
  };

  container.appendChild(btn);
  container.appendChild(menu);

  return container;
}
