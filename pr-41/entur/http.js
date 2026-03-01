/**
 * http.js — Low-level HTTP transport for the Entur API
 *
 * Handles fetch POST, response validation, and JSON extraction.
 * No business logic — purely concerned with the network layer.
 */

/**
 * Normalise the Content-Type header from various fetch response shapes.
 * Works with Headers objects (browser), plain objects, and test stubs.
 * @param {Response} resp
 * @returns {string}
 */
export function getContentType(resp) {
  if (!resp || !resp.headers) return '';
  if (typeof resp.headers.get === 'function') return resp.headers.get('content-type') || '';
  return resp.headers['content-type'] || resp.headers['Content-Type'] || '';
}

/**
 * POST a GraphQL query to the Entur endpoint and parse the JSON response.
 * Throws on network errors and non-JSON responses.
 *
 * @param {string}   apiUrl
 * @param {string}   clientName
 * @param {Function} fetchFn
 * @param {string}   query
 * @param {Object|null} variables
 * @returns {Promise<{ json: Object, resp: Response }>}
 */
export async function postAndParse(apiUrl, clientName, fetchFn, query, variables) {
  const payload = variables ? { query, variables } : { query };
  const resp = await fetchFn(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ET-Client-Name': clientName
    },
    body: JSON.stringify(payload)
  });

  if (!resp) throw new Error('Empty response from fetch');

  if (typeof resp.ok !== 'undefined' && resp.ok === false) {
    const txt = typeof resp.text === 'function' ? await resp.text().catch(() => '<no body>') : '<no body>';
    throw new Error(`Network error: ${resp.status ?? 'unknown'} ${resp.statusText ?? ''} — ${String(txt).slice(0, 200)}`);
  }

  const contentType = getContentType(resp);
  if (contentType && !/application\/json/i.test(contentType)) {
    const txt = typeof resp.text === 'function' ? await resp.text().catch(() => '<no body>') : '<no body>';
    throw new SyntaxError(`Non-JSON response: ${String(txt).slice(0, 200)}`);
  }

  let json;
  try {
    json = await resp.json();
  } catch (err) {
    throw new SyntaxError(`Failed to parse JSON response: ${err?.message ?? String(err)}`);
  }

  return { json, resp };
}
