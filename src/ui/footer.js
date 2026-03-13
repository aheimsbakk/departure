/**
 * footer.js — Builds and translates the two-line app footer.
 *
 * Responsibilities (SRP §8, §13):
 *   - Construct the .app-footer DOM element (data attribution + version/GitHub links).
 *   - Update footer text nodes when the language changes.
 *
 * Deliberately has no knowledge of board layout or other UI components.
 */
import { t } from '../i18n.js';
import { VERSION, DEFAULTS, UI_EMOJIS } from '../config.js';

/**
 * Build and return the .app-footer element.
 * @returns {HTMLElement}
 */
export function createFooter() {
  const footer = document.createElement('div');
  footer.className = 'app-footer';

  // Line 1: "Data from Entur 🔗"
  const dataLine = document.createElement('div');
  dataLine.className = 'footer-data-line';
  const dataText = document.createElement('span');
  dataText.textContent = `${t('dataFrom')} Entur `;
  const enturLink = document.createElement('a');
  enturLink.href = 'https://data.entur.no/';
  enturLink.target = '_blank';
  enturLink.rel = 'noopener noreferrer';
  enturLink.textContent = UI_EMOJIS.footerLink;
  dataLine.append(dataText, enturLink);

  // Line 2: "Version X.Y.Z 📘"
  const versionLine = document.createElement('div');
  versionLine.className = 'footer-version-line';
  const versionText = document.createElement('span');
  versionText.textContent = `${t('version')} ${VERSION} `;
  const githubLink = document.createElement('a');
  githubLink.href = DEFAULTS.GITHUB_URL || 'https://github.com/aheimsbakk/departure';
  githubLink.target = '_blank';
  githubLink.rel = 'noopener noreferrer';
  githubLink.textContent = UI_EMOJIS.footerReadme;
  versionLine.append(versionText, githubLink);

  footer.append(dataLine, versionLine);
  return footer;
}

/**
 * Refresh footer text nodes to the current language.
 * @param {HTMLElement} footer
 */
export function updateFooterTranslations(footer) {
  if (!footer) return;
  const dataSpan = footer.querySelector('.footer-data-line span');
  if (dataSpan) dataSpan.textContent = `${t('dataFrom')} Entur `;
  const versionSpan = footer.querySelector('.footer-version-line span');
  if (versionSpan) versionSpan.textContent = `${t('version')} ${VERSION} `;
}
