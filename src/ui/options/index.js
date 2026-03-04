// options/index.js — orchestrator: assembles the options panel from focused sub-modules
// Public API is identical to the former monolithic options.js.
import { t } from '../../i18n.js';
import { loadSettings, saveSettings, validateOptions, diffOptions } from './settings-store.js';
import { createModesSection } from './transport-modes.js';
import { createStationAutocomplete } from './station-autocomplete.js';
import { createLanguageSwitcher } from './language-switcher.js';
import { createPanelLifecycle } from './panel-lifecycle.js';

/**
 * Create the slide-in options panel.
 *
 * @param {object}   defaults         — current DEFAULTS object (mutated externally)
 * @param {Function} onApply          — called with new options when settings change
 * @param {Function} onLanguageChange — called after language switch (e.g. refresh footer)
 * @returns {{ panel: HTMLElement, open: Function, close: Function, updateFields: Function }}
 */
export function createOptionsPanel(defaults, onApply, onLanguageChange) {
  // ── Panel shell ──────────────────────────────────────────────────────────
  const panel = document.createElement('aside');
  panel.className = 'options-panel';
  panel.setAttribute('inert', '');

  const title = document.createElement('h3');
  title.textContent = 'Kollektiv.Sanntid.org';
  panel.appendChild(title);

  // ── Station autocomplete row ─────────────────────────────────────────────
  const stationAC = createStationAutocomplete(defaults, {
    onSelect: () => {
      // Check all transport modes when a new station is selected
      modes.checkAll();
      applyChanges();
    },
    t,
  });
  const { rowStation, inpStation } = stationAC;

  // ── Number of departures row ─────────────────────────────────────────────
  const rowNum = document.createElement('div'); rowNum.className = 'options-row';
  const lblNum = document.createElement('label'); lblNum.textContent = t('numberOfDepartures');
  const inpNum = document.createElement('input');
  inpNum.type = 'number'; inpNum.min = 1; inpNum.value = defaults.NUM_DEPARTURES || 2;
  rowNum.append(lblNum, inpNum);

  // ── Fetch interval row ───────────────────────────────────────────────────
  const rowInt = document.createElement('div'); rowInt.className = 'options-row';
  const lblInt = document.createElement('label'); lblInt.textContent = t('fetchInterval');
  const inpInt = document.createElement('input');
  inpInt.type = 'number'; inpInt.min = 20; inpInt.value = defaults.FETCH_INTERVAL || 60;
  rowInt.append(lblInt, inpInt);

  // ── Text size row ────────────────────────────────────────────────────────
  const rowSize = document.createElement('div'); rowSize.className = 'options-row';
  const lblSize = document.createElement('label'); lblSize.textContent = t('textSize');
  const selSize = document.createElement('select');
  [
    { value: 'tiny',   label: t('tiny') },
    { value: 'small',  label: t('small') },
    { value: 'medium', label: t('medium') },
    { value: 'large',  label: t('large') },
    { value: 'xlarge', label: t('extraLarge') },
  ].forEach(s => {
    const o = document.createElement('option'); o.value = s.value; o.textContent = s.label;
    selSize.appendChild(o);
  });
  selSize.value = defaults.TEXT_SIZE || 'medium';
  rowSize.append(lblSize, selSize);

  // ── Transport modes section ──────────────────────────────────────────────
  // applyChanges is referenced before definition — forward-declared via closure
  const modes = createModesSection(defaults, {
    onApply: () => applyChanges(),
    showToast: (msg) => lifecycle.showToast(msg),
    t,
  });
  const { rowModes, modesWrap, modesLabelEl: lblModes, toggleAllCb } = modes;

  // ── Panel lifecycle (open/close/toast/close-button) ──────────────────────
  const lifecycle = createPanelLifecycle(panel, {});
  const { btnClose, actions } = lifecycle;

  // ── Language switcher ────────────────────────────────────────────────────
  const langSwitcher = createLanguageSwitcher({
    onLanguageChange: () => {
      langSwitcher.updateTranslations({
        lblStation: rowStation.querySelector('label'),
        lblNum, lblInt, lblSize, lblModes,
        toggleAllCb, btnClose, selSize, modesWrap,
      });
      if (typeof onLanguageChange === 'function') onLanguageChange();
    },
    showToast: (msg) => lifecycle.showToast(msg),
  });
  const { rowLang } = langSwitcher;

  // ── Assemble panel ───────────────────────────────────────────────────────
  panel.append(rowStation, rowNum, rowInt, rowSize, rowModes, rowLang, actions);

  // ── Restore persisted settings ───────────────────────────────────────────
  const saved = loadSettings();
  if (saved) {
    if (Array.isArray(saved.TRANSPORT_MODES)) modes.setChecked(saved.TRANSPORT_MODES);
    if (saved.STATION_NAME) stationAC.updateField(saved.STATION_NAME, saved.STOP_ID || '');
    if (saved.NUM_DEPARTURES) inpNum.value = saved.NUM_DEPARTURES;
    if (saved.FETCH_INTERVAL) inpInt.value = saved.FETCH_INTERVAL;
    if (saved.TEXT_SIZE) selSize.value = saved.TEXT_SIZE;
  }
  modes.updateToggleAllState();

  // ── Change tracking ──────────────────────────────────────────────────────
  let initialValues = {
    STATION_NAME: stationAC.getValue(),
    STOP_ID: stationAC.getStopId() || null,
    NUM_DEPARTURES: Number(inpNum.value) || defaults.NUM_DEPARTURES,
    FETCH_INTERVAL: Number(inpInt.value) || defaults.FETCH_INTERVAL,
    TRANSPORT_MODES: modes.getChecked().slice(),
    TEXT_SIZE: selSize.value || (defaults.TEXT_SIZE || 'large'),
  };

  // ── applyChanges ─────────────────────────────────────────────────────────
  function applyChanges() {
    const raw = {
      STATION_NAME: stationAC.getValue(),
      STOP_ID: stationAC.getStopId() || null,
      NUM_DEPARTURES: inpNum.value,
      FETCH_INTERVAL: inpInt.value,
      TRANSPORT_MODES: modes.getChecked(),
      TEXT_SIZE: selSize.value,
    };
    const newOpts = validateOptions(raw, defaults);

    // Clamp displayed values to validated minimums
    if (Number(inpNum.value) < 1) inpNum.value = newOpts.NUM_DEPARTURES;
    if (Number(inpInt.value) < 20) inpInt.value = newOpts.FETCH_INTERVAL;

    if (diffOptions(newOpts, initialValues)) {
      try { onApply && onApply(newOpts); } catch (e) { console.warn('onApply failed', e); }
      saveSettings(newOpts);
      initialValues = {
        STATION_NAME: newOpts.STATION_NAME,
        STOP_ID: newOpts.STOP_ID,
        NUM_DEPARTURES: newOpts.NUM_DEPARTURES,
        FETCH_INTERVAL: newOpts.FETCH_INTERVAL,
        TRANSPORT_MODES: newOpts.TRANSPORT_MODES.slice(),
        TEXT_SIZE: newOpts.TEXT_SIZE,
      };
    }
  }

  // ── Input event wiring ───────────────────────────────────────────────────

  // Keyboard: Enter advances focus through fields
  inpStation.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !(stationAC.acList)) {
      e.preventDefault();
      inpNum.focus();
    }
  });

  inpNum.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = inpNum.value.trim();
      if (val === '') inpNum.value = defaults.NUM_DEPARTURES || 2;
      else if (Number(val) < 1) inpNum.value = 1;
      applyChanges();
      inpInt.focus();
    }
  });

  inpInt.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = inpInt.value.trim();
      if (val === '') inpInt.value = defaults.FETCH_INTERVAL || 60;
      else if (Number(val) < 20) inpInt.value = 20;
      applyChanges();
      selSize.focus();
    }
  });

  selSize.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); btnClose.focus(); }
  });

  // Blur: validate then apply — covers mobile Chrome where the numeric keyboard
  // "Done" button fires blur but not keydown Enter.
  inpNum.addEventListener('blur', () => {
    const val = inpNum.value.trim();
    if (val === '') inpNum.value = defaults.NUM_DEPARTURES || 2;
    else if (Number(val) < 1) inpNum.value = 1;
    applyChanges();
  });

  inpInt.addEventListener('blur', () => {
    const val = inpInt.value.trim();
    if (val === '') inpInt.value = defaults.FETCH_INTERVAL || 60;
    else if (Number(val) < 20) inpInt.value = 20;
    applyChanges();
  });

  // Focus: select-all for quick editing
  inpNum.addEventListener('focus', () => inpNum.select());
  inpInt.addEventListener('focus', () => inpInt.select());

  // Text size: apply immediately
  selSize.addEventListener('change', () => { applyChanges(); lifecycle.showToast(t('textSizeUpdated')); });

  // ── updateFields (called on panel open to sync with runtime defaults) ────
  function updateFields() {
    stationAC.updateField(defaults.STATION_NAME || '', defaults.STOP_ID || '');
    inpNum.value = defaults.NUM_DEPARTURES || 2;
    inpInt.value = defaults.FETCH_INTERVAL || 60;
    selSize.value = defaults.TEXT_SIZE || 'medium';
    modes.setChecked(defaults.TRANSPORT_MODES || []);

    const chosen = modes.getChecked();
    initialValues = {
      STATION_NAME: stationAC.getValue() || defaults.STATION_NAME,
      STOP_ID: stationAC.getStopId() || null,
      NUM_DEPARTURES: Number(inpNum.value) || defaults.NUM_DEPARTURES,
      FETCH_INTERVAL: Number(inpInt.value) || defaults.FETCH_INTERVAL,
      TRANSPORT_MODES: chosen.slice(),
      TEXT_SIZE: selSize.value || (defaults.TEXT_SIZE || 'large'),
    };
  }

  /**
   * Hard teardown: cancel all pending timers and remove document-level
   * listeners. Call this if the panel is removed from the DOM without going
   * through the normal close flow.
   */
  function destroy() {
    lifecycle.destroy();
    stationAC.destroy();
    modes.destroy();
  }

  return {
    panel,
    open: () => lifecycle.open(updateFields),
    close: lifecycle.close,
    updateFields,
    destroy,
  };
}
