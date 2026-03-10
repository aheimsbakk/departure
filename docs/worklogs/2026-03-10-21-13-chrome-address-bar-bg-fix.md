---
when: 2026-03-10T21:13:00Z
why: Chrome mobile showed a white flash where the address bar was because it cannot use a CSS gradient as a fallback paint color
what: fix Chrome mobile address bar background flash on scroll by splitting gradient into solid fallback + background-image
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, css, chrome, pwa, theme, mobile]
---

Added `--bg-solid` token (dark: `#0b0f1a`, light: `#f5f7fa`) to `tokens.css` and split `background: var(--bg)` into `background-color: var(--bg-solid)` + `background-image: var(--bg)` in `base.css` and `options-panel.css`. Chrome uses the solid `background-color` to fill the area revealed when the address bar hides/shows; the gradient still renders on top. Also aligned `background_color` in `manifest.webmanifest` to `#0b0f1a` to match `theme_color`. Bumped to v1.37.15.
