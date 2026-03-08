// store.js — runtime language state + localStorage persistence
import { translations } from './translations.js';
import { languages } from './languages.js';
import { detectBrowserLanguage } from './detect.js';

const STORAGE_KEY = 'departure:language';

let currentLanguage = 'en';

// Initialize language from localStorage or browser default.
// Must be called once at app boot before any t() calls.
function initLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && translations[saved]) {
      currentLanguage = saved;
    } else {
      currentLanguage = detectBrowserLanguage();
    }
  } catch (e) {
    currentLanguage = detectBrowserLanguage();
  }
  return currentLanguage;
}

// Translate a key for the current language, falling back to English.
function t(key) {
  const lang = translations[currentLanguage] || translations.en;
  return lang[key] || translations.en[key] || key;
}

// Set active language and persist to localStorage.
function setLanguage(langCode) {
  if (!translations[langCode]) {
    console.warn(`Language ${langCode} not supported, falling back to English`);
    langCode = 'en';
  }
  currentLanguage = langCode;
  try {
    localStorage.setItem(STORAGE_KEY, langCode);
  } catch (e) {
    console.warn('Failed to save language preference', e);
  }
}

// Return the active language code.
function getLanguage() {
  return currentLanguage;
}

// Return the full language metadata list.
function getLanguages() {
  return languages;
}

export { t, setLanguage, getLanguage, initLanguage, getLanguages };
