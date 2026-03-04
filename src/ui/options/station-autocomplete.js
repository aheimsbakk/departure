// station-autocomplete.js — debounced station search, keyboard navigation, candidate list DOM
import { searchStations } from '../../entur/index.js';

/**
 * Build the station name row with autocomplete behaviour.
 *
 * @param {object}   defaults
 * @param {object}   deps
 * @param {Function} deps.onSelect  — called with no args after a station is confirmed
 * @param {Function} deps.t         — i18n translate fn
 * @returns {{
 *   rowStation: HTMLElement,
 *   acWrap: HTMLElement,
 *   inpStation: HTMLInputElement,
 *   getValue: () => string,
 *   getStopId: () => string,
 *   reset: () => void,
 *   updateField: (name: string, stopId: string) => void,
 * }}
 */
export function createStationAutocomplete(defaults, { onSelect, t }) {
  // Row scaffold
  const rowStation = document.createElement('div');
  rowStation.className = 'options-row';
  const lblStation = document.createElement('label');
  lblStation.textContent = t('stationName');

  const inpStation = document.createElement('input');
  inpStation.type = 'text';
  inpStation.autocomplete = 'off';
  inpStation.setAttribute('aria-autocomplete', 'list');
  inpStation.value = defaults.STATION_NAME || '';

  // Autocomplete wrapper — the floating list is appended on demand
  const acWrap = document.createElement('div');
  acWrap.className = 'station-autocomplete-wrap';
  rowStation.append(lblStation, acWrap);
  acWrap.appendChild(inpStation);

  // Internal state
  let acList = null;
  let acTimer = null;
  let blurTimer = null;
  let lastQuery = '';
  let highlighted = -1;
  let lastCandidates = [];
  let updatingField = false;
  let _destroyed = false;
  /** AbortController for the current in-flight station search fetch */
  let _searchAbortCtrl = null;

  function clearAutocomplete() {
    try {
      if (acList && acList.parentElement) acList.parentElement.removeChild(acList);
    } catch (e) { /* ignore */ }
    acList = null;
    highlighted = -1;
    lastCandidates = [];
  }

  function showCandidates(cands) {
    lastCandidates = Array.isArray(cands) ? cands.slice() : [];
    if (lastCandidates.length === 0) { clearAutocomplete(); return; }

    if (!acList) {
      acList = document.createElement('ul');
      acList.className = 'station-autocomplete-list';
      acList.id = 'station-autocomplete-list';
      acList.setAttribute('role', 'listbox');
      acWrap.appendChild(acList);
    }
    acList.innerHTML = '';
    lastCandidates.forEach((c, idx) => {
      const li = document.createElement('li');
      li.textContent = c.title || c.id || '';
      li.setAttribute('role', 'option');
      li.setAttribute('data-id', String(c.id || ''));
      li.dataset.index = String(idx);
      li.addEventListener('mousedown', (e) => { e.preventDefault(); selectCandidateIndex(idx); });
      li.addEventListener('mouseover', () => {
        Array.from(acList.children).forEach(ch => ch.classList.remove('highlighted'));
        li.classList.add('highlighted');
        highlighted = idx;
      });
      acList.appendChild(li);
    });
    highlighted = -1;
    acList.classList.add('open');
    try { inpStation.setAttribute('aria-expanded', 'true'); } catch (e) { /* ignore */ }
  }

  function selectCandidateIndex(idx) {
    if (!Array.isArray(lastCandidates) || idx == null || idx < 0 || idx >= lastCandidates.length) return;
    const c = lastCandidates[idx];
    if (!c) return;
    inpStation.value = c.name || c.title || c.id || '';
    inpStation.dataset.stopId = String(c.id || '');
    clearAutocomplete();
    onSelect();
  }

  // Input event — debounced search
  inpStation.addEventListener('input', () => {
    if (updatingField) return;
    const v = String(inpStation.value || '');

    // If lastQuery was cleared (focus reset) but input still has old value, clear it
    if (lastQuery === '' && v.trim().length >= 3 && !inpStation.dataset.stopId) {
      inpStation.value = '';
      lastQuery = '';
      clearAutocomplete();
      return;
    }

    if (v === lastQuery) return;
    lastQuery = v;
    inpStation.dataset.stopId = '';
    clearTimeout(acTimer);
    if (v.trim().length < 3) { clearAutocomplete(); return; }

    lastCandidates = []; // clear stale results immediately

    acTimer = setTimeout(async () => {
      const searchQuery = v;
      // Cancel any previous in-flight request before starting a new one
      if (_searchAbortCtrl) _searchAbortCtrl.abort();
      _searchAbortCtrl = new AbortController();
      const { signal } = _searchAbortCtrl;
      try {
        const cands = await searchStations({ text: searchQuery, limit: 5, fetchFn: window.fetch, signal });
        // Guard: panel may have been destroyed while the fetch was in-flight
        if (_destroyed) return;
        if (inpStation.value === searchQuery) showCandidates(cands);
      } catch (err) {
        if (err?.name === 'AbortError') return; // cancelled by a newer search — normal
        if (_destroyed) return;
        clearAutocomplete();
      }
    }, 250);
  });

  // Keyboard navigation
  inpStation.addEventListener('keydown', (e) => {
    const hasAutocomplete = acList && acList.classList.contains('open');
    const items = hasAutocomplete ? Array.from(acList.children || []) : [];

    if (hasAutocomplete) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlighted = Math.min(items.length - 1, highlighted + 1);
        items.forEach(it => it.classList.remove('highlighted'));
        if (items[highlighted]) { items[highlighted].classList.add('highlighted'); items[highlighted].scrollIntoView({ block: 'nearest' }); }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlighted = Math.max(0, highlighted - 1);
        items.forEach(it => it.classList.remove('highlighted'));
        if (items[highlighted]) { items[highlighted].classList.add('highlighted'); items[highlighted].scrollIntoView({ block: 'nearest' }); }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const indexToSelect = highlighted >= 0 ? highlighted : 0;
        if (items.length > 0) selectCandidateIndex(indexToSelect);
        // caller handles focus progression
      } else if (e.key === 'Escape') {
        clearAutocomplete();
      }
    }
    // Enter with no autocomplete: caller handles focus progression via keydown on inpStation
  });

  // Focus: pre-fill + select text
  inpStation.addEventListener('focus', () => {
    lastQuery = '';
    clearAutocomplete();
    if (defaults.STATION_NAME && !inpStation.value) {
      inpStation.value = defaults.STATION_NAME;
      inpStation.dataset.stopId = defaults.STOP_ID || '';
    }
    inpStation.select();
  });

  // Blur: auto-select first candidate if user was typing.
  // The timeout is stored so it can be cancelled on destroy() or if the panel
  // closes before the 150 ms window elapses (prevents spurious onSelect calls).
  inpStation.addEventListener('blur', () => {
    clearTimeout(blurTimer);
    blurTimer = setTimeout(() => {
      if (_destroyed) return;
      if (acList && acList.classList.contains('open') && lastCandidates.length > 0 && !inpStation.dataset.stopId) {
        selectCandidateIndex(0);
      }
      clearAutocomplete();
    }, 150);
  });

  // Public API
  function getValue() { return inpStation.value; }
  function getStopId() { return inpStation.dataset.stopId || ''; }
  /** Returns true when the autocomplete dropdown is currently visible. */
  function isOpen() { return !!(acList && acList.classList.contains('open')); }

  function reset() {
    lastQuery = '';
    clearAutocomplete();
  }

  function updateField(name, stopId) {
    updatingField = true;
    inpStation.value = name || '';
    inpStation.dataset.stopId = stopId || '';
    lastQuery = '';
    clearAutocomplete();
    updatingField = false;
  }

  /** Cancel all pending timers and prevent any further async callbacks. */
  function destroy() {
    _destroyed = true;
    clearTimeout(acTimer);
    clearTimeout(blurTimer);
    if (_searchAbortCtrl) { _searchAbortCtrl.abort(); _searchAbortCtrl = null; }
    clearAutocomplete();
  }

  return { rowStation, acWrap, inpStation, getValue, getStopId, isOpen, reset, updateField, destroy };
}
