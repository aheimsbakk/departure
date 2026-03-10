---
when: 2026-03-10T22:48:52Z
why: Pull-to-load-more ignored touches on departure text because the browser claimed the touch for text-selection before the JS gesture handler could take ownership.
what: Add user-select none to .departure so text touches behave like canvas touches for the pull gesture
model: github-copilot/claude-sonnet-4.6
tags: [bugfix, scroll-more, css, mobile, touch]
---

Added `user-select: none; -webkit-user-select: none` to `.departure` in `src/css/departures.css`. Because `touchstart` is registered as `passive: true`, `preventDefault()` cannot be called there; the browser would claim any touch landing on text for its text-selection subsystem before our pull gesture handler could take ownership. The one-line CSS fix prevents that selection gesture from ever starting, making pulls on destination names, times, and line numbers behave identically to pulls on empty board canvas. Bumped to v1.37.23.
