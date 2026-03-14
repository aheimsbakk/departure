import { t } from '../i18n.js';
import { DEFAULTS, DEFAULT_FAVORITE, STATION_LINE_TEMPLATE } from '../config.js';
import { decodeSettings } from './share-button.js';
import { emojiForMode } from './mode-utils.js';

const STORAGE_KEY = 'recent-stations';

/**
 * Mode order matches the options panel table (left to right, top to bottom):
 * Row 1: bus, metro
 * Row 2: tram, rail
 * Row 3: water, coach
 */
const MODE_ORDER = ['bus', 'metro', 'tram', 'rail', 'water', 'coach'];

/**
 * Get mode icons in consistent order (as they appear in options panel)
 * Returns empty string if all modes are selected (default state)
 * @param {Array<string>} modes
 * @returns {string} Space-separated emoji string
 */
function getModesDisplay(modes) {
  if (!modes || modes.length === 0) return '';

  // If all modes are selected, don't show any icons (default state)
  if (modes.length === MODE_ORDER.length) {
    const allSelected = MODE_ORDER.every((mode) => modes.includes(mode));
    if (allSelected) return '';
  }

  // Sort by MODE_ORDER
  const sorted = modes.slice().sort((a, b) => {
    const idxA = MODE_ORDER.indexOf(a);
    const idxB = MODE_ORDER.indexOf(b);
    return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
  });
  return sorted.map(emojiForMode).join('');
}

/**
 * Compare two mode arrays for equality (order doesn't matter)
 * @param {Array<string>} modes1
 * @param {Array<string>} modes2
 * @returns {boolean}
 */
export function modesEqual(modes1, modes2) {
  const m1 = modes1 || [];
  const m2 = modes2 || [];

  if (m1.length !== m2.length) return false;

  // Sort both arrays and compare
  const sorted1 = m1.slice().sort();
  const sorted2 = m2.slice().sort();

  return sorted1.every((mode, i) => mode === sorted2[i]);
}

/**
 * Get recent stations from localStorage.
 * Returns an empty array when no favorites have been saved yet.
 * @returns {Array<{name: string, stopId: string, modes?: Array<string>}>}
 */
export function getRecentStations() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to load recent stations:', e);
    return [];
  }
}

/**
 * Decode DEFAULT_FAVORITE and return it as a station object without touching localStorage.
 * Used as the initial station when the user has no saved favorites.
 * @returns {{ name: string, stopId: string, modes: string[] } | null}
 */
export function getDefaultStation() {
  if (!DEFAULT_FAVORITE) return null;
  try {
    const decoded = decodeSettings(DEFAULT_FAVORITE);
    if (decoded && decoded.stationName && decoded.stopId) {
      return {
        name: decoded.stationName,
        stopId: decoded.stopId,
        modes: decoded.transportModes || [],
      };
    }
  } catch (e) {
    console.warn('Failed to decode DEFAULT_FAVORITE', e);
  }
  return null;
}

/**
 * Add or update a recent station with full settings
 * @param {string} name - Station name
 * @param {string} stopId - Station stop ID
 * @param {Array<string>} modes - Transport modes (e.g., ['bus', 'tram'])
 * @param {Object} settings - Optional full settings object { numDepartures, fetchInterval, textSize, language }
 */
export function addRecentStation(name, stopId, modes = [], settings = {}) {
  if (!name || !stopId) return;

  let recent = getRecentStations();

  // Remove exact duplicate (same stopId AND same modes)
  recent = recent.filter((s) => !(s.stopId === stopId && modesEqual(s.modes, modes)));

  // Add to top with full settings
  recent.unshift({
    name,
    stopId,
    modes: modes || [],
    // Store all settings for future use (but don't apply them on restore yet)
    numDepartures: settings.numDepartures,
    fetchInterval: settings.fetchInterval,
    textSize: settings.textSize,
    language: settings.language,
  });

  // Keep only NUM_FAVORITES
  if (recent.length > DEFAULTS.NUM_FAVORITES) {
    recent = recent.slice(0, DEFAULTS.NUM_FAVORITES);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
  } catch (e) {
    console.error('Failed to save recent stations:', e);
  }
}

/**
 * Check if a station (by stopId + modes combo) exists in the favorites list.
 * A station with different transport modes is considered a separate favorite.
 * @param {string} stopId - Station stop ID to check
 * @param {Array<string>} [modes] - Transport modes to match
 * @returns {boolean}
 */
export function isStationInFavorites(stopId, modes) {
  if (!stopId) return false;
  const recent = getRecentStations();
  return recent.some((s) => s.stopId === stopId && modesEqual(s.modes, modes));
}

/**
 * Remove a station (by stopId + modes combo) from favorites without changing order of others.
 * @param {string} stopId - Station stop ID to remove
 * @param {Array<string>} [modes] - Transport modes to match
 * @returns {boolean} true if an entry was removed, false if not found
 */
export function removeFromFavorites(stopId, modes) {
  if (!stopId) return false;
  let recent;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    recent = stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to load recent stations:', e);
    return false;
  }
  const before = recent.length;
  recent = recent.filter((s) => !(s.stopId === stopId && modesEqual(s.modes, modes)));
  if (recent.length === before) return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
  } catch (e) {
    console.error('Failed to save recent stations:', e);
  }
  return true;
}

/**
 * Create station dropdown component
 * @param {string} currentStationName - Current station name
 * @param {Function} onStationSelect - Callback when station is selected (receives {name, stopId})
 * @returns {HTMLElement}
 */
export function createStationDropdown(currentStationName, onStationSelect) {
  const container = document.createElement('div');
  container.className = 'station-dropdown-container';

  // Station title button; tabIndex=6 in the global tab order
  const titleBtn = document.createElement('button');
  titleBtn.className = 'station-title';
  titleBtn.tabIndex = 6;
  titleBtn.setAttribute('aria-haspopup', 'true');
  titleBtn.setAttribute('aria-expanded', 'false');
  titleBtn.title = t('stationNameTooltip');
  titleBtn.textContent = currentStationName || t('noStationSelected');

  // Dropdown arrow indicator
  const arrow = document.createElement('span');
  arrow.className = 'dropdown-arrow';
  arrow.textContent = ' ▼';
  titleBtn.appendChild(arrow);

  // Dropdown menu
  const menu = document.createElement('div');
  menu.className = 'station-dropdown-menu';
  menu.setAttribute('role', 'listbox');

  let isOpen = false;
  let selectedIndex = -1;

  // Explicitly remove listeners from existing menu children before clearing
  function _clearMenuItems() {
    Array.from(menu.children).forEach((child) => {
      const clone = child.cloneNode(false);
      child.replaceWith(clone);
    });
    menu.innerHTML = '';
  }

  // Populate menu with recent stations
  function populateMenu() {
    const recent = getRecentStations();
    _clearMenuItems();

    if (recent.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'station-dropdown-empty';
      emptyMsg.textContent = t('noRecentStations');
      menu.appendChild(emptyMsg);
      return;
    }

    recent.forEach((station, index) => {
      const item = document.createElement('button');
      item.className = 'station-dropdown-item';
      item.setAttribute('role', 'option');

      // Render from STATION_LINE_TEMPLATE — {modes} is '' when all modes selected
      item.textContent = STATION_LINE_TEMPLATE.replace('{name}', station.name)
        .replace('{modes}', getModesDisplay(station.modes))
        .replace(/[ \t]{2,}/g, ' ')
        .trim();

      item.dataset.stopId = station.stopId;
      item.dataset.name = station.name;
      item.dataset.modes = JSON.stringify(station.modes || []);
      item.dataset.index = index;

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        selectStation(station);
      });

      menu.appendChild(item);
    });
  }

  // Toggle dropdown
  function toggleDropdown() {
    isOpen = !isOpen;
    if (isOpen) {
      menu.classList.add('open');
    } else {
      menu.classList.remove('open');
    }
    titleBtn.setAttribute('aria-expanded', isOpen.toString());
    arrow.textContent = isOpen ? ' ▲' : ' ▼';

    if (isOpen) {
      populateMenu();
      selectedIndex = -1;
    }
  }

  // Close dropdown
  function closeDropdown() {
    if (!isOpen) return;
    isOpen = false;
    menu.classList.remove('open');
    titleBtn.setAttribute('aria-expanded', 'false');
    arrow.textContent = ' ▼';
    selectedIndex = -1;

    // Clear selection highlight
    const items = menu.querySelectorAll('.station-dropdown-item');
    items.forEach((item) => item.classList.remove('selected'));
  }

  // Select station
  function selectStation(station) {
    closeDropdown();
    if (onStationSelect) {
      onStationSelect(station);
    }
  }

  // Keyboard navigation
  function handleKeyDown(e) {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDropdown();
      }
      return;
    }

    const items = Array.from(menu.querySelectorAll('.station-dropdown-item'));
    if (items.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        updateSelection(items);
        break;

      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        updateSelection(items);
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          const station = {
            name: items[selectedIndex].dataset.name,
            stopId: items[selectedIndex].dataset.stopId,
            modes: JSON.parse(items[selectedIndex].dataset.modes || '[]'),
          };
          selectStation(station);
        }
        break;

      case 'Escape':
        e.preventDefault();
        closeDropdown();
        break;
    }
  }

  // Update visual selection
  function updateSelection(items) {
    items.forEach((item, index) => {
      if (index === selectedIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }

  // Update station title with optional transport mode icons
  function updateTitle(name, modes = []) {
    const arrowText = arrow.textContent;
    titleBtn.textContent = name || t('noStationSelected');

    // Add mode icons if there's a filter (not all modes selected)
    const modesDisplay = getModesDisplay(modes);
    if (modesDisplay) {
      titleBtn.textContent += ' ' + modesDisplay;
    }

    arrow.textContent = arrowText;
    titleBtn.appendChild(arrow);
  }

  // Named outside-click handler so it can be removed on destroy
  function _onDocClick(e) {
    if (!container.contains(e.target)) {
      closeDropdown();
    }
  }

  // Event listeners
  titleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  titleBtn.addEventListener('keydown', handleKeyDown);

  // Close on outside click
  document.addEventListener('click', _onDocClick);

  // Assemble component
  container.appendChild(titleBtn);
  container.appendChild(menu);

  // Expose methods
  container.updateTitle = updateTitle;
  container.refresh = populateMenu;

  /** Remove the document-level listener and release DOM references. */
  container.destroy = function () {
    document.removeEventListener('click', _onDocClick);
    titleBtn.removeEventListener('keydown', handleKeyDown);
    _clearMenuItems();
  };

  return container;
}
