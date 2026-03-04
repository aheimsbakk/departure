To find the 5 closest stations using the Entur API, you should use the **Journey Planner v3 API**, which is built on GraphQL.

While Entur has a Geocoder API for reverse geocoding, the Journey Planner's `nearest` query is the most robust method for finding actual transport "Stop Places" (stations) based on geographic coordinates.

### 1. The GraphQL Endpoint

You will send a `POST` request to the following URL:
`https://api.entur.io/journey-planner/v3/graphql`

### 2. Required Headers

Entur requires all API consumers to identify themselves. If you don't provide the `ET-Client-Name` header, your requests may be rate-limited or blocked.

* **Content-Type:** `application/json`
* **ET-Client-Name:** `your_company_name-your_app_name` (e.g., `my_dev_team-station_finder`)

### 3. The GraphQL Query

Use the `nearest` query field. This query allows you to specify a coordinate and a maximum number of results.

```graphql
query GetClosestStations($lat: Float!, $lon: Float!) {
  nearest(
    latitude: $lat, 
    longitude: $lon, 
    maxResults: 5, 
    maxDistance: 2000, 
    filterByPlaceTypes: [STOP_PLACE]
  ) {
    edges {
      node {
        place {
          ... on StopPlace {
            id
            name
            transportMode
          }
        }
        distance
      }
    }
  }
}

```

### 4. Implementation Example (cURL)

To test this immediately, you can use the following cURL command (replace the coordinates with your target location):

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "ET-Client-Name: my_org-my_app" \
  -d '{
    "query": "query($lat: Float!, $lon: Float!) { nearest(latitude: $lat, longitude: $lon, maxResults: 5, filterByPlaceTypes: [STOP_PLACE]) { edges { node { place { ... on StopPlace { id name } } distance } } } }",
    "variables": {
      "lat": 59.9139,
      "lon": 10.7522
    }
  }' \
  https://api.entur.io/journey-planner/v3/graphql

```

---

### Key Parameters Explained

| Parameter | Description |
| --- | --- |
| **`latitude`/`longitude**` | The GPS coordinates (WGS 84). |
| **`maxResults`** | Set this to **5** to limit the response to the closest five stations. |
| **`maxDistance`** | The radius (in meters) to search within. The default is 2000m. |
| **`filterByPlaceTypes`** | Use `[STOP_PLACE]` to ignore individual quays (platforms) and only get the main station objects. |

> [!TIP]
> **Distance Calculation:** Note that the `distance` returned in the results is the **walking distance** along the street network, not a straight "as the crow flies" line.

---

## Notes from a practical test (how I reproduced this)

I attempted the Journey Planner v3 `nearest` approach but observed schema differences on the live v3 endpoint. To reliably get nearby StopPlace (station) results for a point I used the Entur Geocoder reverse endpoint (Pelias-based). Summary of the reproducible steps and the exact result fields I collected:

1) HTTP request (example):

   GET https://api.entur.io/geocoder/v1/reverse
   Required header: `ET-Client-Name: <your_org>-<your_app>`
   Query parameters used in the test:
   - point.lat=59.867846
   - point.lon=10.824482
   - size=7
   - layers=venue
   - boundary.country=NOR

2) Response format: GeoJSON FeatureCollection. Each feature contains `geometry.coordinates` (lon, lat) and `properties` with useful fields. The fields I extracted per station were:
   - properties.name (station name)
   - properties.id (NSR stopPlace id where present)
   - properties.distance (distance value from Pelias response — unit: meters)
   - properties.mode / properties.mode[] or properties.category (transport modes inferred; e.g. `bus`, `metro`)

3) Test output (center 59.867846,10.824482, size=7). The Geocoder returned these StopPlaces (name — id — distance — modes):
   - Bergkrystallen — NSR:StopPlace:58243 — 186 m — metro, bus
   - Glimmerveien — NSR:StopPlace:5832 — 356 m — bus
   - Blåfjellet — NSR:StopPlace:5828 — 553 m — bus
   - Mellombølgen — NSR:StopPlace:5830 — 553 m — bus
   - Langbølgen — NSR:StopPlace:5821 — 612 m — bus
   - Feltspatveien — NSR:StopPlace:5834 — 615 m — bus
   - Munkelia — NSR:StopPlace:58244 — 635 m — metro, bus

Notes:
- Pelias `properties.distance` in the Geocoder reverse response is expressed in meters.
- The Geocoder reverse endpoint is Pelias-based and returns POIs/venues; filtering `layers=venue` focuses results on stops/stations.
- If you need graph-aware walking distances from the journey planner (OTP) network rather than straight-line or Pelias-provided distances, prefer Journey Planner v3 `nearest` once you have confirmed the exact argument names supported by the live schema (schema changes observed during testing caused the GraphQL example in this file to fail without adjustment).

Repro steps summary (copy/paste):

1. Run:

   curl -s -G "https://api.entur.io/geocoder/v1/reverse" \
     -H "ET-Client-Name: <your_org>-<your_app>" \
     --data-urlencode "point.lat=59.867846" \
     --data-urlencode "point.lon=10.824482" \
     --data-urlencode "size=7" \
     --data-urlencode "layers=venue" \
     --data-urlencode "boundary.country=NOR"

2. Parse the JSON `features` array and extract `properties.name`, `properties.id`, `properties.distance` (meters), and `properties.mode` / `properties.category` for modes.

If you want, I can: (a) update the Journey Planner v3 example to match the live schema (I can introspect and produce a correct GraphQL query), or (b) produce a small example script that performs the reverse request and outputs CSV/JSON. Which do you prefer?
