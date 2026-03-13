import './time.test.mjs';
import './entur.parse.test.mjs';
import './entur.fetch.test.mjs';
import './entur.modes.test.mjs';
import './entur.query.line.test.mjs';
import './entur.parse.mode.test.mjs';
import './ui.diff.test.mjs';
import './entur.lookup.test.mjs';
import './entur.empty.test.mjs';
import './entur.gps-nearby.test.mjs';
import './ui.tick.test.mjs';
import './station-dropdown.test.mjs';
import './favorites.test.mjs';
import './remove-favorites.test.mjs';
import './toggle-all.test.mjs';
import './share-link.test.mjs';
import './options-autocomplete.test.mjs';
import './autocomplete-input-wipe.test.mjs';
import './gps-dropdown-click.test.mjs';
import './search-filtering.test.mjs';
import './footer-link.test.mjs';
import './sw.test.mjs';
import './sw-api-caching.test.mjs';
import './fetch-loop.test.mjs';
import './sw-updater.test.mjs';

// Catch assertion failures from async tests (e.g. gps-dropdown-click) whose
// top-level awaits settle after the static-import phase completes.
process.on('unhandledRejection', (err) => {
  console.error('\n✗ Async test FAILED:', err?.message ?? err);
  process.exit(1);
});

console.log('All tests completed');
