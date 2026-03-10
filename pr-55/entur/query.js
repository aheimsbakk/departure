/**
 * query.js — GraphQL query builder for the Entur journey-planner API
 *
 * Builds query strings and the ordered variant list used by fetchDepartures
 * to work around strict server-side AST validation of the whiteListedModes
 * argument across different API versions.
 */

/**
 * Build a GraphQL query (and optional variables) for fetching departures.
 *
 * @param {string} stopId
 * @param {number} numDepartures
 * @param {Object} opts
 * @param {boolean}  opts.includeModes      - Whether to include whiteListedModes filter
 * @param {string}   opts.modesLiteral      - Inline literal for whiteListedModes (e.g. '"bus","tram"')
 * @param {boolean}  opts.useVariables      - Whether to use a $modes GraphQL variable
 * @param {string[]} opts.variableValues    - Values for the $modes variable
 * @param {boolean}  opts.includeModeFields - Whether to request serviceJourney/line mode fields
 * @returns {{ query: string, variables: Object|null }}
 */
export function buildQuery(stopId, numDepartures, opts = {}) {
  const {
    includeModes     = false,
    modesLiteral     = '',
    useVariables     = false,
    variableValues   = null,
    includeModeFields = false
  } = opts;

  const varSig     = (useVariables && includeModes) ? '($modes: [TransportMode!])' : '';
  const modesPart  = includeModes
    ? (useVariables ? ', whiteListedModes: $modes' : `, whiteListedModes: [${modesLiteral}]`)
    : '';

  // Optionally request service-journey/line fields for richer mode detection
  const modeFields = includeModeFields ? `
        serviceJourney {
          transportSubmode
          journeyPattern {
            line { publicCode transportMode transportSubmode }
          }
        }` : '';

  const query = `query ${varSig} {
    stopPlace(id: "${stopId}") {
      id
      name
      estimatedCalls(numberOfDepartures: ${numDepartures}${modesPart}, includeCancelledTrips: true) {
        realtime
        aimedDepartureTime
        expectedDepartureTime
        actualDepartureTime
        cancellation
        predictionInaccurate
        destinationDisplay { frontText }
        quay {
          id
          publicCode
        }
        situations {
          summary { value language }
          description { value language }
        }${modeFields}
      }
    }
  }`;

  const variables = (useVariables && variableValues) ? { modes: variableValues } : null;
  return { query, variables };
}

/**
 * Build the ordered list of query variants to try for a given modes array.
 *
 * Variants are tried in this order:
 *   1. Extended selection (with serviceJourney fields) + variable modes (lower/upper-case)
 *   2. Extended selection + inline literal modes (various forms)
 *   3. Extended selection + no filter
 *   4. Base selection (same progression)
 *
 * This order ensures the most informative query (extended with mode filter) is
 * tried first; the no-filter fallback is last.
 *
 * @param {string[]} modes
 * @returns {Array<{ name: string, opts: Object }>}
 */
export function buildVariants(modes) {
  const modesLower  = modes.map(m => String(m).toLowerCase());
  const modesUpper  = modes.map(m => String(m).toUpperCase());
  const singleLit   = `"${modes.join(', ')}"`;
  const quotedArr   = modes.map(m => `"${m}"`).join(',');
  const enumLower   = modesLower.join(',');
  const enumUpper   = modesUpper.join(',');

  const hasModes = Array.isArray(modes) && modes.length > 0;

  // Core variant list (without extended-mode-fields flag)
  const base = hasModes
    ? [
        { name: 'vars-lower',       opts: { includeModes: true, useVariables: true,  variableValues: modesLower } },
        { name: 'vars-upper',       opts: { includeModes: true, useVariables: true,  variableValues: modesUpper } },
        { name: 'single-string',    opts: { includeModes: true, modesLiteral: singleLit } },
        { name: 'quoted-array',     opts: { includeModes: true, modesLiteral: quotedArr } },
        { name: 'enum-array-lower', opts: { includeModes: true, modesLiteral: enumLower } },
        { name: 'enum-array-upper', opts: { includeModes: true, modesLiteral: enumUpper } },
        { name: 'no-filter',        opts: { includeModes: false } }
      ]
    : [
        { name: 'no-filter',        opts: { includeModes: false } },
        { name: 'vars-lower',       opts: { includeModes: true, useVariables: true,  variableValues: modesLower } },
        { name: 'vars-upper',       opts: { includeModes: true, useVariables: true,  variableValues: modesUpper } },
        { name: 'single-string',    opts: { includeModes: true, modesLiteral: singleLit } },
        { name: 'quoted-array',     opts: { includeModes: true, modesLiteral: quotedArr } },
        { name: 'enum-array-lower', opts: { includeModes: true, modesLiteral: enumLower } },
        { name: 'enum-array-upper', opts: { includeModes: true, modesLiteral: enumUpper } }
      ];

  // Prepend extended variants (request serviceJourney/line fields for richer mode info)
  const extended = base.map(v => ({
    name: 'ext-' + v.name,
    opts: { ...v.opts, includeModeFields: true }
  }));

  return [...extended, ...base];
}
