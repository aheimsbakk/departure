// detect.js — pure browser language detection, no I/O or state
import { translations } from './translations.js';

// Returns the best supported language code for the current browser locale.
function detectBrowserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split('-')[0].toLowerCase();

  // Map Norwegian variants (nb/nn) to 'no'
  if (langCode === 'nb' || langCode === 'nn') {
    return 'no';
  }

  // Return if supported, otherwise fall back to English
  return translations[langCode] ? langCode : 'en';
}

export { detectBrowserLanguage };
