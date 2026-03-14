---
when: 2026-03-14T18:47:00Z
why: Share button position shifted after z-reorder; must match its original location in the 3-button row.
what: Fix .share-bar right offset to match original share button position
model: github-copilot/claude-sonnet-4.6
tags: [ui, toolbar, position, fix]
---

Corrected `.share-bar` `right` value from hardcoded `100px` to `calc(18px + 2 * (var(--btn-font-size-icon) + 2 * var(--btn-padding-icon)) + 2 * 8px)`, which precisely reproduces the share button's original right-edge position as the leftmost item in the former 3-button `.global-gear` row. Only `src/css/toolbar.css` touched. Bumped to v1.38.10.
