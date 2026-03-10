---
when: 2026-03-10T21:44:52Z
why: When app theme (light/dark) differs from OS color scheme, the deferred module script ran too late for Chrome to use the correct background-color and theme-color on the first paint
what: add blocking inline script in <head> to apply theme class and collapse theme-color metas before first paint
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, chrome, pwa, theme, mobile, light-mode, fouc]
---

Added a tiny blocking inline `<script>` in `src/index.html` immediately after the two `theme-color` meta tags. It reads `localStorage` synchronously before any CSS renders: if the stored theme is `light` or `dark`, it adds `.theme-light` to `<html>` and collapses the two media-query `theme-color` metas into one unconditional tag — ensuring Chrome snapshots the correct solid background-color and theme-color on the very first paint regardless of the OS color scheme. `auto`/unset leaves the media-query tags untouched. Bumped to v1.37.17.
