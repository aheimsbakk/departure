# Project Rules — Kollektiv.Sanntid.org

## SEO & Sitemap

1. **Sitemap `<lastmod>` must be kept current:** Whenever any file under `src/` is changed and released, update the `<lastmod>` date in `src/sitemap.xml` to the release date (ISO 8601 format: `YYYY-MM-DD`). This applies to every commit that touches user-visible content, markup, styles, or scripts.

## Service Worker Asset Cache

2. **`src/sw.js` ASSETS list must stay in sync:** Whenever a JS, CSS, or static asset file is **added, renamed, or deleted** under `src/`, the `ASSETS` array in `src/sw.js` must be updated in the same commit. Files intentionally excluded: `sw.js` itself and `sitemap.xml` (neither is a runtime asset). Failure to update ASSETS means the new file is not cached offline and the PWA will serve a stale or broken version of the app.
