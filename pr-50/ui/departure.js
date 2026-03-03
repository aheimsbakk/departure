import { PLATFORM_SYMBOLS, PLATFORM_SYMBOL_RULES, DEPARTURE_LINE_TEMPLATE, REALTIME_INDICATORS, CANCELLATION_WRAPPER, TRANSPORT_MODE_EMOJIS } from '../config.js';

export function createDepartureNode(item){
  const container = document.createElement('div'); container.className='departure';
  const dest = document.createElement('div'); dest.className='departure-destination';

  // time container (countdown separate)
  const time = document.createElement('div'); time.className='departure-time';
  const timeWrap = document.createElement('div'); timeWrap.className = 'departure-time-wrap';

  // compute epoch ms robustly; store as dataset string only when valid
  const epochMs = (item && item.expectedDepartureISO) ? Date.parse(item.expectedDepartureISO) : NaN;
  if (Number.isFinite(epochMs)) {
    time.dataset.epochMs = String(epochMs);
  } else {
    time.dataset.epochMs = '';
    time.textContent = '—';
  }

  const situ = document.createElement('div'); situ.className='departure-situations'; situ.textContent = (item.situations || []).join('; ');

  // detect mode from various possible fields in the parsed item/raw payload
  const detectMode = () => {
    if (!item) return null;
    // prefer parser-provided normalized mode if available
    if (item.mode) return item.mode;
    if (item.transportMode) return item.transportMode;
    // inspect common shallow fields that may be objects
    const shallowCandidates = ['transportMode','serviceType','product','transportSubmode'];
    for (const k of shallowCandidates){
      const v = item.raw && item.raw[k];
      if (!v) continue;
      if (typeof v === 'string') return v;
      if (typeof v === 'object'){
        if (typeof v.value === 'string') return v.value;
        if (typeof v.id === 'string') return v.id;
        if (typeof v.name === 'string') return v.name;
      }
    }

    // search recursively in raw object for any string value that matches known tokens
    const raw = item.raw;
    if (!raw) return null;
    const tokens = ['bus','tram','metro','rail','train','water','ferry','coach'];

    const matchesToken = (str) => {
      if (!str || typeof str !== 'string') return null;
      const low = str.toLowerCase();
      for (const t of tokens) if (low.includes(t)) return t;
      return null;
    };

    const seen = new Set();
    const stack = [raw];
    while(stack.length){
      const cur = stack.pop();
      if (!cur || seen.has(cur)) continue;
      seen.add(cur);
      // direct string
      if (typeof cur === 'string'){
        const m = matchesToken(cur);
        if (m) return m;
        continue;
      }
      // arrays: enqueue elements
      if (Array.isArray(cur)){
        for (const it of cur) stack.push(it);
        continue;
      }
      if (typeof cur === 'object'){
        // check common properties that may hold mode-like values
        const commonKeys = ['transportMode','mode','serviceType','product','transportSubmode','vehicleMode','type','journeyType'];
        for (const k of commonKeys){
          try{
            const val = cur[k];
            if (val){
              // convert value to string directly; normalize() was never defined
              const nm = (typeof val === 'string') ? val : (typeof val === 'object' && val !== null)
                ? (val.value || val.id || val.name || '')
                : String(val);
              if (nm){ const mm = matchesToken(String(nm)); if (mm) return mm; }
            }
          }catch(e){}
        }
        // otherwise inspect keys and values
        for (const k of Object.keys(cur)){
          const keyMatch = matchesToken(String(k));
          if (keyMatch) return keyMatch;
          try{ stack.push(cur[k]); }catch(e){}
        }
      }
    }
    return null;
  };

  function emojiForMode(mode){
    if(!mode) return TRANSPORT_MODE_EMOJIS.default;
    const m = String(mode).toLowerCase();
    if(m.includes('bus')) return TRANSPORT_MODE_EMOJIS.bus;
    if(m.includes('tram')) return TRANSPORT_MODE_EMOJIS.tram;
    if(m.includes('metro')) return TRANSPORT_MODE_EMOJIS.metro;
    if(m.includes('rail') || m.includes('train')) return TRANSPORT_MODE_EMOJIS.rail;
    if(m.includes('water') || m.includes('ferry')) return TRANSPORT_MODE_EMOJIS.water;
    if(m.includes('coach')) return TRANSPORT_MODE_EMOJIS.coach;
    return TRANSPORT_MODE_EMOJIS.default;
  }

  const mode = detectMode();
  // render emoji inline with destination text so it wraps naturally on small screens
  const emoji = emojiForMode(mode);
  const destinationText = (item && item.destination) ? String(item.destination) : '—';
  const lineNumberText = (item && item.publicCode) ? String(item.publicCode) : '';
  
  // Determine realtime indicator based on item.realtime field
  const indicator = (item && item.realtime === true) 
    ? REALTIME_INDICATORS.realtime 
    : REALTIME_INDICATORS.scheduled;
  
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
      const modeMatches = !rule.transportMode || (rule.transportMode.includes(mode));
      
      // Check publicCode pattern match (if rule specifies a pattern)
      const patternMatches = !rule.publicCodePattern || rule.publicCodePattern.test(quayCode);
      
      // If both conditions pass, use this rule's symbol
      if (modeMatches && patternMatches) {
        symbolKey = rule.symbol;
        break;
      }
    }
    
    const platformSymbol = PLATFORM_SYMBOLS[symbolKey] || PLATFORM_SYMBOLS.default;
    
    // Create stacked display element
    const stackedSpan = document.createElement('span');
    stackedSpan.className = 'platform-stacked';
    stackedSpan.innerHTML = `<span>${platformSymbol}</span><span>${quayCode}</span>`;
    
    // Store the element for later insertion
    platformElement = stackedSpan;
  }
  
  // Apply template to build the display line
  // Available placeholders: {lineNumber}, {destination}, {emoji}, {platform}, {indicator}
  // The {platform} placeholder will be replaced with a placeholder string that we'll swap with the element
  const PLATFORM_PLACEHOLDER = '<<<PLATFORM>>>';
  let displayText = DEPARTURE_LINE_TEMPLATE
    .replace('{lineNumber}', lineNumberText)
    .replace('{destination}', destinationText)
    .replace('{emoji}', emoji)
    .replace('{indicator}', indicator)
    .replace('{platform}', platformElement ? PLATFORM_PLACEHOLDER : '');
  
  // Build the DOM: set text content, then replace placeholder with platform element
  // If departure is cancelled, wrap everything with cancellation styling
  const isCancelled = (item && item.cancellation === true);
  
  try{ 
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
  } catch(e) { 
    dest.textContent = destinationText; 
  }
  // provide an accessible textual label matching the visual order (destination + mode)
  const readableMode = (m) => {
    if(!m) return '';
    const mm = String(m).toLowerCase();
    if(mm.includes('bus')) return 'Bus';
    if(mm.includes('tram') || mm.includes('trikk')) return 'Tram';
    if(mm.includes('metro') || mm.includes('t-bane') || mm.includes('tbane')) return 'Metro';
    if(mm.includes('rail') || mm.includes('train') || mm.includes('tog')) return 'Train';
    if(mm.includes('water') || mm.includes('ferry') || mm.includes('ferje') || mm.includes('boat')) return 'Ferry';
    if(mm.includes('coach')) return 'Coach';
    return '';
  };
  try{ 
    // Build accessible aria-label matching the visual order from template
    const platformText = (item && item.quay && item.quay.publicCode) ? (' Platform ' + item.quay.publicCode) : '';
    const linePrefix = lineNumberText ? ('Line ' + lineNumberText + ' ') : '';
    const modeText = readableMode(mode) ? (' ' + readableMode(mode)) : '';
    const cancelledPrefix = isCancelled ? 'Cancelled: ' : '';
    dest.setAttribute('aria-label', cancelledPrefix + linePrefix + destinationText + modeText + platformText); 
  }catch(e){}

  timeWrap.append(time);
  // place situation between destination and countdown so alerts are read in context
  container.append(dest, situ, timeWrap);
  // store references for quick updates
  return {container, dest, time, situ, epochMs: Number.isFinite(epochMs) ? epochMs : null};
}

export function updateDepartureCountdown(node, nowMs = Date.now(), formatFn, translator = null){
  if (!node || !node.time || !formatFn) return;
  const v = node.time.dataset.epochMs;
  const epoch = (v == null || v === '') ? (node.epochMs || null) : Number(v);
  if (!Number.isFinite(epoch)) { node.time.textContent = '—'; return; }
  const text = formatFn(epoch, nowMs, translator) || '—';
  node.time.textContent = text;
}
