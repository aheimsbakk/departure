// Version is defined here and in src/sw.js (service worker)
// Both must be kept in sync - use scripts/bump-version.sh to update both
export const VERSION = '1.37.4';

export const DEFAULTS = {
  STATION_NAME: 'Jernbanetorget, Oslo',
  STOP_ID: null, // When set, skip lookup and use this ID directly
  NUM_DEPARTURES: 5,
  NUM_FAVORITES: 8,
  FETCH_INTERVAL: 60,
  TRANSPORT_MODES: ['bus','tram','metro','rail','water','coach'],
  CLIENT_NAME: 'kollektiv-sanntid-org',
  API_URL: 'https://api.entur.io/journey-planner/v3/graphql',
  GITHUB_URL: 'https://github.com/aheimsbakk/kollektiv-sanntid-org/#kollektivsanntidorg'
};

// Default favorite station encoded as base64 share link (minimal 3-element format)
// Used when user has no favorites stored. Set to null to disable.
export const DEFAULT_FAVORITE = 'WyJPc2xvIFMiLCJOU1I6U3RvcFBsYWNlOjU5ODcyIixbImJ1cyIsInRyYW0iLCJjb2FjaCIsIm1ldHJvIiwid2F0ZXIiLCJyYWlsIl1d';

// Immutable list of all transport modes for fallback when no modes are selected
export const ALL_TRANSPORT_MODES = ['bus','tram','metro','rail','water','coach'];

// Transport modes checkbox grid layout for the options panel: [row][col]
export const MODE_GRID = [
  ['tram', 'bus'],
  ['metro', 'coach'],
  ['rail', 'water'],
];

// Realtime data indicators
// Used in the departure line template via {indicator} placeholder
export const REALTIME_INDICATORS = {
  realtime: '●',    // Solid dot for live realtime data
  scheduled: '○'    // Hollow dot for scheduled/static data
};

// Transport mode emojis
// Used to visually identify the type of transport in departures and UI
export const TRANSPORT_MODE_EMOJIS = {
  bus: '🚌',
  tram: '🚋',
  metro: '🚇',
  rail: '🚅',
  water: '🛳️',
  coach: '🚍',
  default: '🚆'  // Fallback for unknown transport types
};

// UI Button emojis
export const UI_EMOJIS = {
  settings: '⚙️',
  share: '📋',
  shareSuccess: '✓',
  themeLight: '🌞',
  themeAuto: '🌤️',
  themeDark: '🌥️',
  heartSave: '🩶',    // Not in favorites — click to save (gray, theme-neutral)
  heartSaved: '❤️',  // Already in favorites — click to remove
  footerLink: '🔗',  // Entur data attribution link
  footerReadme: '📘', // GitHub README link
  compass: '🧭'       // GPS nearby-stops button (top-left toolbar)
};

// Cancellation display wrapper
// When a departure is cancelled (item.cancellation === true), the entire
// departure line will be wrapped with these HTML tags to apply strikethrough styling.
// The styling is defined in CSS via .departure-cancelled class.
export const CANCELLATION_WRAPPER = {
  open: '<span class="departure-cancelled">',
  close: '</span>'
};

// Platform/Quay display symbols
// Defines the visual symbols used to represent different types of boarding locations.
// The symbol is selected using PLATFORM_SYMBOL_RULES (see below).
export const PLATFORM_SYMBOLS = {
  bay: '▣',       // Square for bus bays (terminals with alphanumeric codes like B10, C2)
  gate: '◆',      // Diamond for gates (single-letter codes at transit hubs like A, P)
  platform: '⚏',  // Railroad track for train/metro platforms (numeric codes like 1, 2)
  stop: '▪',      // Small square for tram/bus stops (simple letter codes)
  berth: '⚓',     // Anchor for ferry/boat berths
  default: '•'    // Bullet for unknown/unclassified quays
};

// Platform symbol selection rules
// Rules are evaluated in order; the first matching rule determines the symbol.
// Each rule has:
//   - transportMode: array of modes to match (from API), or null for any mode
//   - publicCodePattern: regex to match quay.publicCode, or null to skip pattern check
//   - symbol: key from PLATFORM_SYMBOLS to use
//
// The logic combines authoritative transport mode from the API with observable
// publicCode patterns to distinguish between different physical quay types
// (e.g., bus bay vs bus gate, both have transportMode=bus but different codes).
export const PLATFORM_SYMBOL_RULES = [
  // Water transport always gets berth symbol
  { transportMode: ['water'], publicCodePattern: null, symbol: 'berth' },
  
  // Bus/Coach with alphanumeric codes = bay (e.g., B10, C2, A18 at terminals)
  { transportMode: ['bus', 'coach'], publicCodePattern: /^[A-Z]\d+$/i, symbol: 'bay' },
  
  // Bus/Coach with single letter = gate (e.g., A, P, R at transit hubs)
  { transportMode: ['bus', 'coach'], publicCodePattern: /^[A-Z]$/i, symbol: 'gate' },
  
  // Bus/Coach fallback = stop
  { transportMode: ['bus', 'coach'], publicCodePattern: null, symbol: 'stop' },
  
  // Tram = stop
  { transportMode: ['tram'], publicCodePattern: null, symbol: 'stop' },
  
  // Rail/Metro with numeric codes = platform
  { transportMode: ['rail', 'metro'], publicCodePattern: /^\d+$/, symbol: 'platform' },
  
  // Rail/Metro fallback = platform
  { transportMode: ['rail', 'metro'], publicCodePattern: null, symbol: 'platform' },
  
  // Final fallback for any unmatched mode
  { transportMode: null, publicCodePattern: null, symbol: 'default' }
];

// Departure line display template
// Available placeholders:
//   {lineNumber}   - Line/route number (e.g., "L2", "81")
//   {destination}  - Destination name (e.g., "Ski", "Myrvoll stasjon")
//   {emoji}        - Transport mode emoji (e.g., 🚅, 🚌, 🚇)
//   {platform}     - Platform/gate display (stacked symbol+code)
//   {indicator}    - Realtime indicator (● for live data, ○ for scheduled)
//
// Template examples:
//   '{lineNumber} · {destination} {emoji}{platform}'       - Line first (old format)
//   '{destination} {indicator} {lineNumber} {emoji}{platform}' - Destination first with realtime indicator
//   '{destination} {emoji}{platform} ({lineNumber})'       - Line in parentheses
//   '{emoji} {lineNumber} - {destination}{platform}'       - Emoji first
//
// Note: {platform} is automatically empty if no platform info is available
export const DEPARTURE_LINE_TEMPLATE = '{destination} {indicator} {lineNumber} {emoji} {platform}';

// GPS nearby-stop search settings
export const GPS_MAX_RESULTS      = 8;  // maximum stop places returned in the dropdown
export const GPS_SEARCH_RADIUS_KM = 2;  // search radius for Entur Geocoder (boundary.circle.radius, unit: km)

// GPS nearby-stop dropdown item template
// Available placeholders:
//   {name}      - Stop name (e.g. "Bergkrystallen")
//   {modes}     - Transport mode emojis (e.g. "🚇🚌"), empty string when unknown
//   {distance}  - Distance from current position with unit (e.g. "186m"), empty string when unavailable
//
// Post-processing collapses repeated spaces and strips a trailing separator when
// {distance} is absent, so "{name} {modes} · {distance}" stays clean in all cases.
//
// Examples:
//   '{name} {modes} · {distance}'     — default: "Bergkrystallen 🚇🚌 · 186m"
//   '{distance} · {name} {modes}'     — distance first: "186m · Bergkrystallen 🚇🚌"
//   '{modes} {name} ({distance})'     — parenthesised distance: "🚇🚌 Bergkrystallen (186m)"
export const GPS_STOP_LINE_TEMPLATE = '{name} 🏃‍➡️ {distance} {modes}';

// Favorites dropdown item template
// Available placeholders:
//   {name}   - Station name (e.g. "Jernbanetorget, Oslo")
//   {modes}  - Transport mode emojis for the saved filter (e.g. "🚌🚇"),
//              empty string when all modes are selected (the default state)
//
// Examples:
//   '{name} {modes}'        — default: "Jernbanetorget, Oslo" or "Oslo S 🚅"
//   '{modes} {name}'        — emojis first: "🚅 Oslo S"
//   '{name} [{modes}]'      — bracketed: "Oslo S [🚅]"
export const STATION_LINE_TEMPLATE = '{name} {modes}';
