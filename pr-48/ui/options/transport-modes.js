// transport-modes.js — transport mode checkbox table, toggle-all, debounced apply
import { TRANSPORT_MODE_EMOJIS } from '../../config.js';

/** Map a mode string to its display emoji. */
function emojiForMode(mode) {
  if (!mode) return TRANSPORT_MODE_EMOJIS.default;
  const m = String(mode).toLowerCase();
  if (m.includes('bus')) return TRANSPORT_MODE_EMOJIS.bus;
  if (m.includes('tram') || m.includes('trikk')) return TRANSPORT_MODE_EMOJIS.tram;
  if (m.includes('metro') || m.includes('t-bane') || m.includes('tbane')) return TRANSPORT_MODE_EMOJIS.metro;
  if (m.includes('rail') || m.includes('train') || m.includes('tog')) return TRANSPORT_MODE_EMOJIS.rail;
  if (m.includes('water') || m.includes('ferry') || m.includes('ferje') || m.includes('boat')) return TRANSPORT_MODE_EMOJIS.water;
  if (m.includes('coach')) return TRANSPORT_MODE_EMOJIS.coach;
  return TRANSPORT_MODE_EMOJIS.default;
}

// 2×3 grid layout: [row][col]
const MODE_GRID = [
  ['bus', 'metro'],
  ['tram', 'rail'],
  ['water', 'coach'],
];

/**
 * Build the transport modes section (label + toggle-all + checkbox table).
 *
 * @param {object}   defaults
 * @param {object}   deps
 * @param {Function} deps.onApply    — called when modes change (after debounce)
 * @param {Function} deps.showToast  — showToast(msg)
 * @param {Function} deps.t          — i18n translate fn
 * @returns {{
 *   rowModes: HTMLElement,
 *   modesWrap: HTMLElement,
 *   modesLabelEl: HTMLElement,
 *   toggleAllCb: HTMLInputElement,
 *   getChecked: () => string[],
 *   setChecked: (modes: string[]) => void,
 *   updateToggleAllState: () => void,
 *   checkAll: () => void,
 * }}
 */
export function createModesSection(defaults, { onApply, showToast, t }) {
  const rowModes = document.createElement('div');
  rowModes.className = 'options-row';

  const modesLabelWrap = document.createElement('div');
  modesLabelWrap.className = 'modes-label-wrap';

  const lblModes = document.createElement('label');
  lblModes.textContent = t('transportModes');

  const toggleAllCb = document.createElement('input');
  toggleAllCb.type = 'checkbox';
  toggleAllCb.className = 'modes-toggle-all';
  toggleAllCb.title = t('toggleAllModes');
  toggleAllCb.setAttribute('aria-label', t('toggleAllModes'));
  modesLabelWrap.append(lblModes, toggleAllCb);

  const modesWrap = document.createElement('div');
  modesWrap.className = 'modes-checkboxes';

  const modesTable = document.createElement('table');
  modesTable.className = 'modes-table';
  const tbody = document.createElement('tbody');

  MODE_GRID.forEach(row => {
    const tr = document.createElement('tr');
    row.forEach(m => {
      const td = document.createElement('td');
      const lab = document.createElement('label');
      lab.className = 'mode-checkbox-label';
      const icon = document.createElement('span');
      icon.className = 'mode-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = emojiForMode(m);
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = m;
      cb.checked = (defaults.TRANSPORT_MODES || []).includes(m);
      const span = document.createElement('span');
      span.textContent = t(m);
      lab.append(icon, cb, span);
      td.appendChild(lab);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  modesTable.appendChild(tbody);
  modesWrap.appendChild(modesTable);
  rowModes.append(modesLabelWrap, modesWrap);

  function updateToggleAllState() {
    const allCbs = Array.from(modesWrap.querySelectorAll('input[type=checkbox]'));
    const checkedCount = allCbs.filter(cb => cb.checked).length;
    if (checkedCount === 0) {
      toggleAllCb.checked = false;
      toggleAllCb.indeterminate = false;
    } else if (checkedCount === allCbs.length) {
      toggleAllCb.checked = true;
      toggleAllCb.indeterminate = false;
    } else {
      toggleAllCb.checked = false;
      toggleAllCb.indeterminate = true;
    }
  }

  function getChecked() {
    return Array.from(modesWrap.querySelectorAll('input[type=checkbox]:checked')).map(i => i.value);
  }

  function setChecked(modes) {
    Array.from(modesWrap.querySelectorAll('input[type=checkbox]')).forEach(cb => {
      cb.checked = (modes || []).includes(cb.value);
    });
    updateToggleAllState();
  }

  function checkAll() {
    Array.from(modesWrap.querySelectorAll('input[type=checkbox]')).forEach(cb => { cb.checked = true; });
    updateToggleAllState();
  }

  // Toggle-all handler
  toggleAllCb.addEventListener('change', () => {
    const shouldCheck = toggleAllCb.checked;
    Array.from(modesWrap.querySelectorAll('input[type=checkbox]')).forEach(cb => { cb.checked = shouldCheck; });
    toggleAllCb.indeterminate = false;
    onApply();
    showToast(t('filtersUpdated'));
  });

  // Debounced apply on individual checkbox change
  let debounceTimer = null;
  modesWrap.addEventListener('change', (e) => {
    if (e.target && e.target.type === 'checkbox') {
      updateToggleAllState();
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => { onApply(); showToast(t('filtersUpdated')); }, 500);
    }
  });

  /** Cancel any pending debounce timer. Call on component teardown. */
  function destroy() {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  return { rowModes, modesWrap, modesLabelEl: lblModes, toggleAllCb, getChecked, setChecked, updateToggleAllState, checkAll, destroy };
}
