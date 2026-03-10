// language-switcher.js — language flag buttons and in-place translation updates
import { t, setLanguage, getLanguage, getLanguages } from '../../i18n.js';

/**
 * Build the language switcher row.
 *
 * @param {object}   deps
 * @param {Function} deps.onLanguageChange — external callback (e.g. refresh footer)
 * @param {Function} deps.showToast        — showToast(msg)
 * @returns {{
 *   rowLang: HTMLElement,
 *   lblLang: HTMLElement,
 *   updateTranslations: (refs: TranslationRefs) => void,
 * }}
 */
export function createLanguageSwitcher({ onLanguageChange, showToast }) {
  const rowLang = document.createElement('div');
  rowLang.className = 'options-row';

  const lblLang = document.createElement('label');
  lblLang.textContent = t('switchLanguage');

  const langWrap = document.createElement('div');
  langWrap.className = 'language-switcher';

  getLanguages().forEach(lang => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'language-flag';
    btn.textContent = lang.flag;
    btn.title = lang.name;
    btn.setAttribute('aria-label', lang.name);
    if (getLanguage() === lang.code) btn.classList.add('active');

    btn.addEventListener('click', () => {
      setLanguage(lang.code);
      langWrap.querySelectorAll('.language-flag').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Caller is responsible for calling updateTranslations with live refs
      if (typeof onLanguageChange === 'function') onLanguageChange();
      showToast(t('languageChanged'));
    });

    langWrap.appendChild(btn);
  });

  rowLang.append(lblLang, langWrap);

  /**
   * Re-render all translatable strings in the panel after a language change.
   * @param {TranslationRefs} refs — live DOM references from the orchestrator
   */
  function updateTranslations(refs) {
    const {
      lblStation, lblNum, lblInt, lblSize, lblModes,
      toggleAllCb, btnClose, selSize, modesWrap,
    } = refs;

    lblStation.textContent = t('stationName');
    lblNum.textContent = t('numberOfDepartures');
    lblInt.textContent = t('fetchInterval');
    lblSize.textContent = t('textSize');
    lblModes.textContent = t('transportModes');
    toggleAllCb.title = t('toggleAllModes');
    toggleAllCb.setAttribute('aria-label', t('toggleAllModes'));
    lblLang.textContent = t('switchLanguage');
    btnClose.textContent = t('close');

    // Text size <option> labels
    const sizeOpts = selSize.querySelectorAll('option');
    const sizeKeys = ['tiny', 'small', 'medium', 'large', 'extraLarge'];
    sizeOpts.forEach((opt, i) => { opt.textContent = t(sizeKeys[i]); });

    // Transport mode span labels
    const modeKeys = ['bus', 'metro', 'tram', 'rail', 'water', 'coach'];
    const modeLabels = modesWrap.querySelectorAll('.mode-checkbox-label span:last-child');
    modeLabels.forEach((label, i) => { label.textContent = t(modeKeys[i]); });
  }

  return { rowLang, lblLang, updateTranslations };
}
