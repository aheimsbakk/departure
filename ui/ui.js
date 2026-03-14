// Minimal UI helpers: create container and manage departure list
import { t } from '../i18n.js';
import { DEFAULTS, UI_EMOJIS } from '../config.js';
import { createStationDropdown, isStationInFavorites } from './station-dropdown.js';
import { createFooter } from './footer.js';
export { updateFooterTranslations } from './footer.js';

export function createBoardElements(stationName, onStationSelect, onFavoriteToggle) {
  const el = document.createElement('div');
  el.className = 'board';
  // station dropdown (replaces simple title)
  const stationDropdown = createStationDropdown(stationName, onStationSelect);
  // status chip (Live / Demo) should appear under the station title
  const status = document.createElement('div');
  status.className = 'status-chip';
  const list = document.createElement('div');
  list.className = 'departures';
  const headerWrap = document.createElement('div');
  headerWrap.className = 'header-wrap';
  // header-left stacks title and status vertically; header-controls (gear) live to the right
  const headerLeft = document.createElement('div');
  headerLeft.className = 'header-left';

  // Favorite heart button in front of station name
  const favoriteBtn = document.createElement('button');
  favoriteBtn.type = 'button';
  favoriteBtn.tabIndex = 5;
  favoriteBtn.className = 'favorite-heart-btn header-btn';
  favoriteBtn.title = t('saveToFavorites');
  favoriteBtn.setAttribute('aria-label', t('saveToFavorites'));
  // Initial state will be updated by updateFavoriteButton
  favoriteBtn.textContent = UI_EMOJIS.heartSave;
  favoriteBtn.addEventListener('click', () => {
    if (typeof onFavoriteToggle === 'function') {
      onFavoriteToggle();
    }
  });

  // Station row: heart + station dropdown side by side
  const stationRow = document.createElement('div');
  stationRow.className = 'station-row';
  stationRow.append(favoriteBtn, stationDropdown);

  headerLeft.append(stationRow, status);
  headerWrap.append(headerLeft);

  // Footer delegated to footer.js (SRP §8, §13)
  const footer = createFooter();

  el.append(headerWrap, list);
  // expose header-wrap for other modules to attach controls
  el.headerWrap = headerWrap;
  // expose station dropdown for updating
  el.stationDropdown = stationDropdown;
  return { el, list, status, footer, stationDropdown, favoriteBtn };
}

/**
 * Update the favorite heart button appearance based on whether the station is in favorites.
 * Gray heart = not in favorites (click to save). Red heart = in favorites (click to remove).
 * @param {HTMLElement} btn - The favorite button element
 * @param {string} stopId - Current station's stop ID
 * @param {Array<string>} modes - Current transport modes
 */
export function updateFavoriteButton(btn, stopId, modes) {
  if (!btn) return;
  const inFavorites = isStationInFavorites(stopId, modes);
  if (inFavorites) {
    // Already in favorites: show red heart, enabled — click to remove
    btn.textContent = UI_EMOJIS.heartSaved;
    btn.disabled = false;
    btn.title = t('removeFromFavorites');
    btn.setAttribute('aria-label', t('removeFromFavorites'));
  } else {
    // Not in favorites: show gray heart, enabled — click to save
    btn.textContent = UI_EMOJIS.heartSave;
    btn.disabled = false;
    btn.title = t('saveToFavorites');
    btn.setAttribute('aria-label', t('saveToFavorites'));
  }
}

export function clearList(listEl) {
  while (listEl.firstChild) listEl.removeChild(listEl.firstChild);
}

export function findKey(item) {
  return `${item.destination}::${item.expectedDepartureISO}`;
}

// Compute minimal diff metadata between old keys and new keys (pure function for testing)
export function computeDiff(oldKeys, newKeys) {
  const oldSet = new Set(oldKeys);
  const newSet = new Set(newKeys);
  const toAdd = newKeys.filter((k) => !oldSet.has(k));
  const toRemove = oldKeys.filter((k) => !newSet.has(k));
  // newOrder is simply newKeys (we'll re-append nodes to match)
  return { toAdd, toRemove, newOrder: newKeys };
}
