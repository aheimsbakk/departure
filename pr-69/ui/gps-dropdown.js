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
import {
  TRANSPORT_MODE_EMOJIS,
  ALL_TRANSPORT_MODES,
  UI_EMOJIS,
  DEFAULTS,
  GPS_STOP_LINE_TEMPLATE,
  GPS_MAX_RESULTS,
  GPS_SEARCH_RADIUS_KM,
} from '../config.js';
import { t } from '../i18n.js';

const KNOWN_MODES = ['bus', 'tram', 'metro', 'rail', 'water', 'coach'];

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
    .map((m) => String(m).toLowerCase())
    .filter((m) => KNOWN_MODES.includes(m))
    .map((m) => TRANSPORT_MODE_EMOJIS[m] || '')
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
  btn.type = 'button';
  btn.tabIndex = 1;
  btn.textContent = UI_EMOJIS.compass;
  btn.title = t('gpsTooltip');
  btn.setAttribute('aria-label', t('gpsTooltip'));
  btn.setAttribute('aria-haspopup', 'true');
  btn.setAttribute('aria-expanded', 'false');

  // ── Dropdown menu ────────────────────────────────────────────────────────────
  const menu = document.createElement('div');
  menu.className = 'gps-dropdown-menu';
  menu.setAttribute('role', 'listbox');

  let isOpen = false;
  let highlightedIndex = -1;

  // Map from item element → stop data. Used by the delegated click handler so
  // individual item buttons carry no listeners of their own (Rule §11).
  const stopsMap = new Map();

  // ── Internal helpers ────────────────────────────────────────────────────────

  function closeDropdown() {
    if (!isOpen) return;
    isOpen = false;
    highlightedIndex = -1;
    btn.disabled = false;
    btn.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open');
    stopsMap.clear();
    menu.innerHTML = '';
  }

  function openWith(nodes) {
    isOpen = true;
    highlightedIndex = -1;
    btn.setAttribute('aria-expanded', 'true');
    menu.innerHTML = '';
    nodes.forEach((n) => menu.appendChild(n));
    menu.classList.add('open');
  }

  function getItems() {
    return Array.from(menu.querySelectorAll('.gps-dropdown-item'));
  }

  function setHighlight(index) {
    const items = getItems();
    if (items.length === 0) return;
    highlightedIndex = Math.max(0, Math.min(index, items.length - 1));
    items.forEach((it, i) => {
      if (i === highlightedIndex) {
        it.classList.add('highlighted');
        it.scrollIntoView({ block: 'nearest' });
      } else {
        it.classList.remove('highlighted');
      }
    });
  }

  /** Build a plain status / error message node. */
  function statusNode(text, isError = false) {
    const el = document.createElement('div');
    el.className = 'gps-dropdown-status' + (isError ? ' gps-dropdown-error' : '');
    el.textContent = text;
    return el;
  }

  /**
   * Build a clickable stop item from a fetchNearbyStops result entry.
   * The stop data is registered in stopsMap so the delegated listener can
   * retrieve it without attaching a per-item event listener (Rule §11).
   */
  function buildStopItem(stop) {
    const item = document.createElement('button');
    item.className = 'gps-dropdown-item';
    item.type = 'button';
    item.setAttribute('role', 'option');

    // Render from GPS_STOP_LINE_TEMPLATE.
    // {distance} includes the unit (e.g. "186m"); empty string when unavailable.
    const distStr = stop.distance != null ? `${stop.distance}${t('gpsMeters')}` : '';
    const text = GPS_STOP_LINE_TEMPLATE.replace('{name}', stop.name)
      .replace('{modes}', getModeEmojis(stop.modes))
      .replace('{distance}', distStr)
      .replace(/\s*·\s*$/, '') // strip trailing separator when {distance} is empty
      .replace(/[ \t]{2,}/g, ' ') // collapse double spaces when {modes} is empty
      .trim();
    item.textContent = text;

    // Register stop data keyed by element — no per-item listener needed.
    stopsMap.set(item, stop);

    return item;
  }

  // ── Delegated click handler on the menu (single listener, Rule §11) ──────────

  menu.addEventListener('click', (e) => {
    const item = e.target.closest('.gps-dropdown-item');
    if (!item) return;
    const stop = stopsMap.get(item);
    if (stop) {
      e.stopPropagation();
      closeDropdown();
      if (onStationSelect && stop.id) {
        onStationSelect({
          name: stop.name,
          stopId: stop.id,
          // Provide all modes reported for this stop; fall back to ALL_TRANSPORT_MODES
          // so the board shows every service available at the selected station.
          modes: stop.modes.length ? stop.modes : ALL_TRANSPORT_MODES.slice(),
        });
      }
    }
  });

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

    // Hard fallback: if the platform silently swallows the geolocation request
    // (e.g. OS-level dialog dismissed without browser callback), re-enable the
    // button after 12 s (slightly longer than the 10 s timeout option).
    let geoCallbackFired = false;
    const geoFallbackId = setTimeout(() => {
      if (!geoCallbackFired) {
        btn.disabled = false;
        openWith([statusNode(t('gpsUnavailable'), true)]);
      }
    }, 12000);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        geoCallbackFired = true;
        clearTimeout(geoFallbackId);
        const { latitude: lat, longitude: lon } = pos.coords;
        try {
          const stops = await fetchNearbyStops({
            lat,
            lon,
            maxResults: GPS_MAX_RESULTS,
            radiusKm: GPS_SEARCH_RADIUS_KM,
            clientName: DEFAULTS.CLIENT_NAME,
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
        geoCallbackFired = true;
        clearTimeout(geoFallbackId);
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
    if (!isOpen) return;
    const items = getItems();
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlight(highlightedIndex < 0 ? 0 : highlightedIndex + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlight(highlightedIndex <= 0 ? 0 : highlightedIndex - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && items[highlightedIndex]) {
          items[highlightedIndex].click();
        }
        break;
      case 'Escape':
        closeDropdown();
        break;
    }
  }

  document.addEventListener('click', _onDocClick);
  document.addEventListener('keydown', _onKeyDown);

  /** Update button tooltip and aria-label to match the current language. */
  container.updateTooltip = function () {
    btn.title = t('gpsTooltip');
    btn.setAttribute('aria-label', t('gpsTooltip'));
  };

  /** Remove document-level listeners and release DOM references. */
  container.destroy = function () {
    document.removeEventListener('click', _onDocClick);
    document.removeEventListener('keydown', _onKeyDown);
    stopsMap.clear();
    menu.innerHTML = '';
  };

  container.appendChild(btn);
  container.appendChild(menu);

  return container;
}
