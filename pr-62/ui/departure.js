import {
  PLATFORM_SYMBOLS,
  PLATFORM_SYMBOL_RULES,
  DEPARTURE_LINE_TEMPLATE,
  REALTIME_INDICATORS,
} from '../config.js';
import { emojiForMode, labelForMode } from './mode-utils.js';

export function createDepartureNode(item) {
  const container = document.createElement('div');
  container.className = 'departure';
  const dest = document.createElement('div');
  dest.className = 'departure-destination';

  // time container (countdown separate)
  const time = document.createElement('div');
  time.className = 'departure-time';
  const timeWrap = document.createElement('div');
  timeWrap.className = 'departure-time-wrap';

  // compute epoch ms robustly; store as dataset string only when valid
  const epochMs = item && item.expectedDepartureISO ? Date.parse(item.expectedDepartureISO) : NaN;
  if (Number.isFinite(epochMs)) {
    time.dataset.epochMs = String(epochMs);
  } else {
    time.dataset.epochMs = '';
    time.textContent = '—';
  }

  const situ = document.createElement('div');
  situ.className = 'departure-situations';
  situ.textContent = (item.situations || []).join('; ');

  // The parser (entur/parser.js → entur/modes.js) always sets item.mode on
  // departures from fetchDepartures. Prefer item.mode, fall back to
  // item.transportMode. The old recursive raw-scan fallback was dead code for
  // the normal data path and has been removed (ANALYZE.md issue #10).
  const mode = (item && (item.mode || item.transportMode)) || null;

  // render emoji inline with destination text so it wraps naturally on small screens
  const emoji = emojiForMode(mode);
  const destinationText = item && item.destination ? String(item.destination) : '—';
  const lineNumberText = item && item.publicCode ? String(item.publicCode) : '';

  // Determine realtime indicator based on item.realtime field
  const indicator =
    item && item.realtime === true ? REALTIME_INDICATORS.realtime : REALTIME_INDICATORS.scheduled;

  // Build platform/quay display with stacked format: {symbol}<br>{code}
  // Symbol is selected using PLATFORM_SYMBOL_RULES from config.js
  // Rules combine transport mode (authoritative from API) with publicCode pattern
  // to distinguish physical quay types (e.g., bus bay vs bus gate)
  let platformElement = null;
  if (item && item.quay && item.quay.publicCode) {
    const quayCode = String(item.quay.publicCode);

    // Evaluate rules in order to select the symbol
    let symbolKey = 'default';
    for (const rule of PLATFORM_SYMBOL_RULES) {
      // Check transport mode match (if rule specifies modes)
      const modeMatches = !rule.transportMode || rule.transportMode.includes(mode);

      // Check publicCode pattern match (if rule specifies a pattern)
      const patternMatches = !rule.publicCodePattern || rule.publicCodePattern.test(quayCode);

      // If both conditions pass, use this rule's symbol
      if (modeMatches && patternMatches) {
        symbolKey = rule.symbol;
        break;
      }
    }

    const platformSymbol = PLATFORM_SYMBOLS[symbolKey] || PLATFORM_SYMBOLS.default;

    // Create stacked display element — use DOM methods, never innerHTML,
    // because quayCode originates from the Entur API (XSS prevention).
    const stackedSpan = document.createElement('span');
    stackedSpan.className = 'platform-stacked';
    const symSpan = document.createElement('span');
    symSpan.textContent = platformSymbol;
    const codeSpan = document.createElement('span');
    codeSpan.textContent = quayCode;
    stackedSpan.append(symSpan, codeSpan);

    // Store the element for later insertion
    platformElement = stackedSpan;
  }

  // Apply template to build the display line
  // Available placeholders: {lineNumber}, {destination}, {emoji}, {platform}, {indicator}
  // The {platform} placeholder will be replaced with a placeholder string that we'll swap with the element
  const PLATFORM_PLACEHOLDER = '<<<PLATFORM>>>';
  let displayText = DEPARTURE_LINE_TEMPLATE.replace('{lineNumber}', lineNumberText)
    .replace('{destination}', destinationText)
    .replace('{emoji}', emoji)
    .replace('{indicator}', indicator)
    .replace('{platform}', platformElement ? PLATFORM_PLACEHOLDER : '');

  // Build the DOM: set text content, then replace placeholder with platform element
  // If departure is cancelled, wrap everything with cancellation styling
  const isCancelled = item && item.cancellation === true;

  try {
    dest.textContent = displayText;
    if (platformElement && displayText.includes(PLATFORM_PLACEHOLDER)) {
      // Replace the placeholder text with the actual platform element
      const textContent = dest.textContent;
      const parts = textContent.split(PLATFORM_PLACEHOLDER);
      dest.textContent = '';
      if (parts[0]) dest.appendChild(document.createTextNode(parts[0]));
      dest.appendChild(platformElement);
      if (parts[1]) dest.appendChild(document.createTextNode(parts[1]));
    }

    // Wrap with cancellation styling if needed
    if (isCancelled) {
      const wrapper = document.createElement('span');
      wrapper.className = 'departure-cancelled';
      // Move all children into the wrapper
      while (dest.firstChild) {
        wrapper.appendChild(dest.firstChild);
      }
      dest.appendChild(wrapper);
    }
  } catch (e) {
    dest.textContent = destinationText;
  }

  // Provide an accessible textual label matching the visual order (destination + mode).
  // labelForMode from mode-utils.js replaces the local readableMode() closure.
  try {
    const platformText =
      item && item.quay && item.quay.publicCode ? ' Platform ' + item.quay.publicCode : '';
    const linePrefix = lineNumberText ? 'Line ' + lineNumberText + ' ' : '';
    const modeLabel = labelForMode(mode);
    const modeText = modeLabel ? ' ' + modeLabel : '';
    const cancelledPrefix = isCancelled ? 'Cancelled: ' : '';
    dest.setAttribute(
      'aria-label',
      cancelledPrefix + linePrefix + destinationText + modeText + platformText
    );
  } catch (e) {}

  timeWrap.append(time);
  // place situation between destination and countdown so alerts are read in context
  container.append(dest, situ, timeWrap);
  // store references for quick updates
  return { container, dest, time, situ, epochMs: Number.isFinite(epochMs) ? epochMs : null };
}

export function updateDepartureCountdown(node, nowMs = Date.now(), formatFn, translator = null) {
  if (!node || !node.time || !formatFn) return;
  const v = node.time.dataset.epochMs;
  const epoch = v == null || v === '' ? node.epochMs || null : Number(v);
  if (!Number.isFinite(epoch)) {
    node.time.textContent = '—';
    return;
  }
  const text = formatFn(epoch, nowMs, translator) || '—';
  node.time.textContent = text;
}
