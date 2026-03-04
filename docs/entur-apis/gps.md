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

