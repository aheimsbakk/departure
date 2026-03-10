/**
 * Theme Toggle Component
 * Manages light/auto/dark theme switching
 */

import { t } from '../i18n.js';
import { UI_EMOJIS } from '../config.js';

const THEME_KEY = 'kollektiv-theme';
const THEMES = ['light', 'auto', 'dark'];
const ICONS = {
  light: UI_EMOJIS.themeLight,
  auto: UI_EMOJIS.themeAuto,
  dark: UI_EMOJIS.themeDark
};

/** Background start colors matching tokens.css gradients */
const THEME_COLORS = {
  light: '#f5f7fa',
  dark:  '#0b0f1a',
};

/**
 * Update <meta name="theme-color"> tags to match the resolved (effective) theme.
 *
 * In auto mode the two media-query meta tags in index.html handle everything
 * natively without JS. When the user explicitly picks light or dark we
 * override both tags to the same solid color (no media attribute) so Chrome
 * immediately reflects the manual choice regardless of system preference.
 *
 * @param {boolean} isDark  - true if the effective theme is dark
 * @param {boolean} isAuto  - true if the theme is following system preference
 */
function updateThemeColorMeta(isDark, isAuto) {
  const color = isDark ? THEME_COLORS.dark : THEME_COLORS.light;
  const metas = document.querySelectorAll('meta[name="theme-color"]');

  if (isAuto) {
    // Restore media-query driven behaviour so the browser handles it natively.
    // Only touch the tags if they were previously collapsed to a single value.
    if (metas.length === 1) {
      metas[0].setAttribute('media', '(prefers-color-scheme: light)');
      metas[0].content = THEME_COLORS.light;
      const dark = document.createElement('meta');
      dark.name = 'theme-color';
      dark.setAttribute('media', '(prefers-color-scheme: dark)');
      dark.content = THEME_COLORS.dark;
      metas[0].insertAdjacentElement('afterend', dark);
    }
    return;
  }

  if (metas.length >= 2) {
    // Collapse both tags into one unconditional tag.
    metas[1].remove();
  }

  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.removeAttribute('media');
  meta.content = color;
}

/**
 * Get current theme from localStorage or default to 'auto'
 */
export function getTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  return THEMES.includes(stored) ? stored : 'auto';
}

/**
 * Save theme to localStorage
 */
function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

/**
 * Get next theme in cycle: light → auto → dark → light
 */
function getNextTheme(current) {
  const idx = THEMES.indexOf(current);
  return THEMES[(idx + 1) % THEMES.length];
}

/**
 * Apply theme to document and sync <meta name="theme-color">.
 */
function applyTheme(theme) {
  const root = document.documentElement;
  let isDark;

  if (theme === 'light') {
    root.classList.add('theme-light');
    isDark = false;
  } else if (theme === 'dark') {
    root.classList.remove('theme-light');
    isDark = true;
  } else {
    // Auto mode: follow system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.remove('theme-light');
    } else {
      root.classList.add('theme-light');
    }
    isDark = prefersDark;
  }

  updateThemeColorMeta(isDark, theme === 'auto');
}

/**
 * Create and return theme toggle button
 * @param {Function} [onChange] - Optional callback invoked after theme changes, receives the new theme string
 */
export function createThemeToggle(onChange) {
  const button = document.createElement('button');
  // Use same header button class so layout matches favorite and language flags
  button.className = 'theme-toggle-btn header-btn';
  button.type = 'button';
  button.title = t('themeTooltip');
  
  let currentTheme = getTheme();
  
  // Update button icon based on current theme
  function updateButton() {
    button.textContent = ICONS[currentTheme];
    button.title = t('themeTooltip');
  }
  
  // Initialize
  applyTheme(currentTheme);
  updateButton();
  
  // Handle clicks
  button.addEventListener('click', () => {
    currentTheme = getNextTheme(currentTheme);
    saveTheme(currentTheme);
    applyTheme(currentTheme);
    updateButton();
    if (typeof onChange === 'function') onChange(currentTheme);
  });
  
  // Listen for system preference changes when in auto mode.
  // Keep a named reference so the listener can be removed if the button is destroyed.
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  function _onMediaChange() {
    if (currentTheme === 'auto') {
      applyTheme(currentTheme);
    }
  }
  mediaQuery.addEventListener('change', _onMediaChange);

  /** Remove the MediaQueryList listener and release references. */
  button.destroy = function () {
    mediaQuery.removeEventListener('change', _onMediaChange);
  };

  return button;
}

/**
 * Initialize theme on app load (call this before creating the toggle button)
 */
export function initTheme() {
  const theme = getTheme();
  applyTheme(theme);
}
