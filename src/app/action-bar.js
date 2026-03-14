/**
 * action-bar.js — Global action bar (share, theme, settings buttons)
 *
 * Responsibilities:
 *   - Create the share button, theme toggle, and settings gear button
 *   - Share button lives in its own fixed .share-bar container (low z-index,
 *     covered by the options panel when it opens)
 *   - Theme and settings gear live in .global-gear (high z-index, always visible)
 *   - Append the share URL-display fallback box to the body
 *   - Return references needed by other modules (tooltips, theme callback)
 */

import { UI_EMOJIS, DEFAULTS } from '../config.js';
import { t, getLanguage } from '../i18n.js';
import { createShareButton } from '../ui/share-button.js';
import { createThemeToggle } from '../ui/theme-toggle.js';
import { updateFavoriteButton } from '../ui/ui.js';

/**
 * Build and mount the global action bar.
 *
 * @param {Object}   board     - Board element refs from createBoardElements
 * @param {Function} onOpenSettings - Called when the settings gear is clicked to open the panel
 * @param {Function} onCloseSettings - Called when the settings gear is clicked to close the panel
 * @returns {{ shareComponents, themeBtn, settingsBtn }}
 */
export function buildActionBar(board, onOpenSettings, onCloseSettings) {
  // Share button — encodes current board config as a compact base64 URL
  const shareComponents = createShareButton(() => {
    if (!DEFAULTS.STATION_NAME || !DEFAULTS.STOP_ID) return null;
    return {
      STATION_NAME: DEFAULTS.STATION_NAME,
      STOP_ID: DEFAULTS.STOP_ID,
      TRANSPORT_MODES: DEFAULTS.TRANSPORT_MODES,
      NUM_DEPARTURES: DEFAULTS.NUM_DEPARTURES,
      FETCH_INTERVAL: DEFAULTS.FETCH_INTERVAL,
      TEXT_SIZE: DEFAULTS.TEXT_SIZE,
      language: getLanguage(),
    };
  });

  // Share button lives in its own low-z container so the options panel covers it
  const shareBar = document.createElement('div');
  shareBar.className = 'share-bar';
  shareBar.appendChild(shareComponents.button);
  document.body.appendChild(shareBar);

  // Theme toggle button (light / auto / dark cycle)
  const themeBtn = createThemeToggle(() => {
    updateFavoriteButton(board.favoriteBtn, DEFAULTS.STOP_ID, DEFAULTS.TRANSPORT_MODES);
  });

  // Settings gear button (opens / closes the options panel)
  const settingsBtn = document.createElement('button');
  settingsBtn.className = 'header-btn gear-btn';
  settingsBtn.type = 'button';
  settingsBtn.textContent = UI_EMOJIS.settings;
  settingsBtn.title = t('settingsTooltip');
  settingsBtn.addEventListener('click', () => {
    if (document.body.classList.contains('options-open')) {
      onCloseSettings();
    } else {
      onOpenSettings();
    }
  });

  // Theme + settings stay in the high-z container — always visible above the panel
  const globalBar = document.createElement('div');
  globalBar.className = 'global-gear';
  globalBar.appendChild(themeBtn);
  globalBar.appendChild(settingsBtn);
  document.body.appendChild(globalBar);

  // Fallback URL-display box (shown when clipboard write is unavailable)
  document.body.appendChild(shareComponents.urlBox);

  return { shareComponents, themeBtn, settingsBtn };
}
