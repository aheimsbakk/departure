Geocoder API

The geocoder API is based on the open source product "Pelias". You'll find official Pelias documentation on GitHub.
Reference
/autocomplete

Search for features using a search string. This is useful for autosuggest search fields.
GET https://api.entur.io/geocoder/v1/autocomplete?text=Oslo&size=20&lang=no
/reverse

Find features within a geographical area, defined by a coordinate and a radius.
GET https://api.entur.io/geocoder/v1/reverse?point.lat=60.1&point.lon=10.04&boundary.circle.radius=1&size=10&layers=address%2Clocality
Parameters

In addition to official Pelias parameters, we have also added our own enhancements to support local- or technical needs:
Size

Governs the maximum number of results.
Parameter	Valid values	Example	Methods
size	[1-100]	https://api.entur.io/geocoder/v1/autocomplete?lang=no&text=ha...	autocomplete
Boundaries

Allows filtering by geographical region.
Parameter	Valid values	Example	Methods
boundary.country	ISO 3166-1 alpha-3 country code	County code (ISO 3166-1 alpha-3) (https://no.wikipedia.org/wiki/ISO_3166-1_alfa-3): https://api.entur.io/geocoder/v1/autocomplete?lang=no&text=hald&bo...	autocomplete
boundary.county_ids	Comma separated list	

    Norwegian county numbers are with prefix "KVE:TopographicPlace:"
    Swedish county numbers are with prefix "LAN:TopographicPlace": https://api.entur.io/geocoder/v1/autocomplete?lang=no&text=hald&bo...

	autocomplete
boundary.locality_ids	Comma separated list	

    Norwegian municipality numbers are with prefix "KVE:TopographicPlace"
    Swedish municipality numbers are with prefix "LAN:TopographicPlace" : https://api.entur.io/geocoder/v1/autocomplete?lang=no&text=tro&bo...

	autocomplete
Tariff zones

Allows filtering stops by tariff zone.
Parameter	Valid values	Example	Methods
tariff_zone_authorities	Comma separated list	https://api.entur.io/geocoder/v1/autocomplete?lang=no&text=hald&ta...	autocomplete
tariff_zone_ids	Comma separated list	https://api.entur.io/geocoder/v1/autocomplete?lang=no&text=hald&ta...	autocomplete
multiModal

Controls whether the search returns multimodal stops, child stops of the multimodal stops, or both. Does not affect monomodal stops.
Parameter	Valid values	Example	Methods
multiModal	parent (default), child, all	Only multimodal stops without children: Only child stops Both	autocomplete
Advanced parameters

We have exposed the following pelias-internal parameters in the autocomplete endpoint, related to boosting results according to proximity when the focus.point parameter is given in the query.
Parameter	Valid values	Default value	Explanation
focus.weight	>0	15	Base weight to be applied to boosting results based on location. This value will be multiplied by a factor determined by decay function and scale.
focus.function	linear,exp	linear	Which decay function to apply.
focus.scale	>0km	2500km	Controls the rate of decay, i.e. at which distance from the given location the scoring will be given the boost factor of the default decay value, which is 0.5.
Examples

    Given the default values, a result at the given location will be given a boost factor of 15x1=15, and a result at 2500 km away will be given a boost factor of 15x0.5=7.5. Results located 5000 km away and beyond will not be boosted with the linear function: since 15x0=0. Locations in between will be boosted with a factor following a linear curve through the decay point.

    Let's say weight is given a value of 50, function is set to exp and scale is set to 100km. A result at the given location will be given av boost of 50x1=50. Results located 100 km away will be given a boost of 50x0.5=25. The boost factor for other locations will follow an exponential curve through the decay point approaching (but never reaching) 0.

Additional reading: https://www.elastic.co/guide/en/elasticsearch/guide/current/decay-functions.html
Definitions
Layers

Due to limitations in Pelias the definitions of layers has been re-defined and limited to the following two layers:
Layer	Description
venue	Stops
address	POI, streets, addresses, stop groups
Categories

Used for subtyping within layers.
Layer	Category	Description
venue	onstreetBus, onstreetTram, airport, railStation, metroStation, busStation, coachStation, tramStation, harbourPort, ferryPort, ferryStop, liftStation, vehicleRailInterchange, other Stops from NSR. On multimodal stops, these values are only found on their child stops.	
address	GroupOfStopPlaces	Stop groupings from NSR.
address	POI	Collected from OpenStreetMap.
address	Street address	Addresses from 'Kartverket'.
address	Street	Street names from 'Kartverket'. Coordinate is the median address-location.
address	Places	Placenames from 'Kartverket'. Currently only 'tettsted' and 'bydel'. See kartverket.no for complete list of available places.
Counties and municipalities

    Norwegian county numbers
    Norwegian municipality numbers
    Swedish county and municipality

Layer	Category	Example
county	Name of county (fylke)	Nordland
county_gid	ID of county (prefixed with "whosonfirst:county")	whosonfirst:county:KVE:TopographicPlace:18
whosonfirst:county:LAN:TopographicPlace:14
locality	Name of municipality (kommune)	Oslo
locality_gid	ID of county (prefixed with "whosonfirst:locality")	whousonfirst:locality:KVE:TopographicPlace:0301
whousonfirst:locality:LAN:TopographicPlace:1486