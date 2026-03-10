---
when: 2026-03-10T21:54:27Z
why: Chrome mobile's compositor does not re-evaluate CSS custom properties on <html> when classes change, so the gap behind the retracting address bar used the wrong background color after theme toggling
what: set background-color as inline style on <html> at load and on every theme toggle to bypass CSS variable indirection
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, chrome, pwa, theme, mobile, light-mode, inline-style]
---

Extended the inline script in `src/index.html` to always resolve the effective theme (including `auto` via `prefers-color-scheme`) and set `document.documentElement.style.backgroundColor` directly with a hardcoded hex color before CSS renders. Added the same `root.style.backgroundColor` assignment in `applyTheme()` in `src/ui/theme-toggle.js` so runtime theme switches also update the compositor immediately. Both changes bypass CSS custom property indirection, which Chrome's compositor ignores for the address-bar gap area. Bumped to v1.37.18.
