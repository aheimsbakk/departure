// Minimal UI helpers: create container and manage departure list
import { t } from '../i18n.js';
import { VERSION, DEFAULTS, UI_EMOJIS } from '../config.js';
import { createStationDropdown, isStationInFavorites } from './station-dropdown.js';

export function createBoardElements(stationName, onStationSelect, onFavoriteToggle){
  const el = document.createElement('div'); el.className='board';
  // station dropdown (replaces simple title)
  const stationDropdown = createStationDropdown(stationName, onStationSelect);
  // status chip (Live / Demo) should appear under the station title
  const status = document.createElement('div'); status.className='status-chip';
  const list = document.createElement('div'); list.className='departures';
  const headerWrap = document.createElement('div'); headerWrap.className='header-wrap';
  // header-left stacks title and status vertically; header-controls (gear) live to the right
  const headerLeft = document.createElement('div'); headerLeft.className = 'header-left';
  
  // Favorite heart button in front of station name
  const favoriteBtn = document.createElement('button');
  favoriteBtn.type = 'button';
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
  const stationRow = document.createElement('div'); stationRow.className = 'station-row';
  stationRow.append(favoriteBtn, stationDropdown);
  
  headerLeft.append(stationRow, status);
  headerWrap.append(headerLeft);
  
  // Footer: two lines — data attribution above, version + GitHub below
  const footer = document.createElement('div'); footer.className='app-footer';

  // Line 1: "Data from Entur 🔗"
  const dataLine = document.createElement('div'); dataLine.className='footer-data-line';
  const dataText = document.createElement('span');
  dataText.textContent = `${t('dataFrom')} Entur `;
  const enturLink = document.createElement('a');
  enturLink.href = 'https://data.entur.no/';
  enturLink.target = '_blank';
  enturLink.rel = 'noopener noreferrer';
  enturLink.textContent = '🔗';
  dataLine.append(dataText, enturLink);

  // Line 2: "Version X.Y.Z 🔗"
  const versionLine = document.createElement('div'); versionLine.className='footer-version-line';
  const versionText = document.createElement('span');
  versionText.textContent = `${t('version')} ${VERSION} `;
  const githubLink = document.createElement('a');
  githubLink.href = DEFAULTS.GITHUB_URL || 'https://github.com/aheimsbakk/departure';
  githubLink.target = '_blank';
  githubLink.rel = 'noopener noreferrer';
  githubLink.textContent = '🔗';
  versionLine.append(versionText, githubLink);

  footer.append(dataLine, versionLine);
  
  el.append(headerWrap, list, footer);
  // expose header-wrap for other modules to attach controls
  el.headerWrap = headerWrap;
  // expose station dropdown for updating
  el.stationDropdown = stationDropdown;
  return {el, list, status, footer, stationDropdown, favoriteBtn};
}

/**
 * Update the favorite heart button appearance based on whether the station is in favorites.
 * Red heart = not in favorites (clickable). White/black heart = already in favorites (disabled).
 * @param {HTMLElement} btn - The favorite button element
 * @param {string} stopId - Current station's stop ID
 * @param {Array<string>} modes - Current transport modes
 * @param {string} theme - Current theme ('light', 'dark', or 'auto')
 */
export function updateFavoriteButton(btn, stopId, modes, theme) {
  if (!btn) return;
  const inFavorites = isStationInFavorites(stopId, modes);
  if (inFavorites) {
    // Already in favorites: show white/black heart, disable
    const isLight = theme === 'light' ||
      (theme === 'auto' && typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
    btn.textContent = isLight ? UI_EMOJIS.heartSavedLight : UI_EMOJIS.heartSavedDark;
    btn.disabled = true;
    btn.title = t('alreadyInFavorites');
    btn.setAttribute('aria-label', t('alreadyInFavorites'));
  } else {
    // Not in favorites: show red heart, enabled
    btn.textContent = UI_EMOJIS.heartSave;
    btn.disabled = false;
    btn.title = t('saveToFavorites');
    btn.setAttribute('aria-label', t('saveToFavorites'));
  }
}

// Update footer translations when language changes
export function updateFooterTranslations(footer) {
  if (!footer) return;
  const dataLine = footer.querySelector('.footer-data-line');
  const versionLine = footer.querySelector('.footer-version-line');
  if (dataLine) {
    const dataSpan = dataLine.querySelector('span');
    if (dataSpan) dataSpan.textContent = `${t('dataFrom')} Entur `;
  }
  if (versionLine) {
    const versionSpan = versionLine.querySelector('span');
    if (versionSpan) versionSpan.textContent = `${t('version')} ${VERSION} `;
  }
}

export function clearList(listEl){
  while(listEl.firstChild) listEl.removeChild(listEl.firstChild);
}

export function findKey(item){
  return `${item.destination}::${item.expectedDepartureISO}`;
}

// Compute minimal diff metadata between old keys and new keys (pure function for testing)
export function computeDiff(oldKeys, newKeys){
  const oldSet = new Set(oldKeys);
  const newSet = new Set(newKeys);
  const toAdd = newKeys.filter(k => !oldSet.has(k));
  const toRemove = oldKeys.filter(k => !newSet.has(k));
  // newOrder is simply newKeys (we'll re-append nodes to match)
  return { toAdd, toRemove, newOrder: newKeys };
}
