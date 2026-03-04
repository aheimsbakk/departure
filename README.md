# Kollektiv.Sanntid.org

Real-time public transport departure board for Norway. Track buses, trams, metro, trains, ferries, and coaches with live departure times from any station or stop across the country.

## About

This app uses [Entur's API](https://developer.entur.org/) to show live departures from Norwegian public transport. It's built with the [JourneyPlanner API](https://developer.entur.org/pages-journeyplanner-journeyplanner) and is the first app I've created using vibe coding.

## Getting Started

### Finding Your Station

There are two ways to pick a station:

**By name** — click the **⚙️ settings** button in the top right, type in the **Station or stop name** field, and select from the dropdown suggestions.

**By location** — click the **🧭 compass** button in the top left. The app asks for your location and instantly lists the nearest stops with their distance and transport modes. Click any result to load it.

Once a station is loaded, choose which transport types you want to see, then click **Close** to apply.

To save the station to your favorites, click the **🩶 heart button** to the left of the station name. The heart is gray when a station is not saved. Once saved, the heart turns red ❤️ — and remains **clickable**. Click it again to **remove** the station from your favorites.

### Using Favorites

Click the **station name** at the top of the screen to open your favorites list. This shows your recently viewed stations with their transport filters. Click any favorite to instantly switch to that station.

Your favorites list stores up to 8 stations with all their settings. The most recently used station appears at the top.

To remove a station from favorites, click the red heart ❤️ on the departure board while viewing that station — it will be removed immediately.

If you have no favorites yet, the app pre-seeds **Jernbanetorget, Oslo** as a starting point so the board is never empty on first use.

### Sharing Your Board

Click the **📋 share** button (next to the theme toggle) to copy a shareable link to your clipboard. This link includes:
- Your current station
- Selected transport modes

When someone opens your link, the station is automatically added to their favorites.

## Features

### GPS Nearby Stops

Click the **🧭 compass** button in the top left to find stops near your current location:

- The app requests your device's GPS position (one-time, no tracking)
- Lists up to **8 nearest stops** within a **2 km radius**
- Each result shows the stop name, distance in metres, and transport mode icons
- Click any stop to load it immediately — then use the ❤️ heart to save it

The dropdown closes automatically when you select a stop or press **Escape**.

### Live Departures

The app displays upcoming departures with:
- **Line number and destination** for each service (e.g., "Ski ● L2 🚅")
- **Realtime indicators** - ● solid dot for live tracking, ○ hollow dot for scheduled times
- **Platform/gate information** - Shows platforms (⚏10), gates (◆A), or stops (▪B) where available
- **Countdown timer** showing minutes until departure
- **Transport icons** (🚌 🚋 🚇 🚅 🛳️ 🚍) to identify the vehicle type
- **Cancellation notices** - Cancelled departures appear with strikethrough and reduced opacity
- **Automatic updates** every 60 seconds (configurable)

### Settings Panel

Access all settings by clicking the **⚙️ settings** button:

#### Station or Stop Name
Type to search for any station or stop in Norway. The app suggests matches as you type.

#### Number of Departures
Choose how many upcoming departures to display (default: 5)

#### Update Interval
Set how often the app refreshes departure times in seconds (default: 60)

#### Text Size
Pick from five sizes: Tiny, Small, Medium, Large, or Extra Large. Changes apply immediately.

#### Transport Modes
Filter which transport types appear on your board:
- 🚌 Bus
- 🚇 Metro (T-bane)
- 🚋 Tram (Trikk)
- 🚅 Rail (Tog)
- 🛳️ Water (Ferry)
- 🚍 Coach (Long-distance bus)

Uncheck any type to hide it from your departures.

#### Language
Choose from 12 languages using the flag buttons. The entire interface updates instantly.

### Theme Toggle

Click the **theme button** (left of settings) to cycle through three themes:
- 🌞 **Light** - Bright theme for daytime
- 🌤️ **Auto** - Follows your device's preference
- 🌥️ **Dark** - Easy on the eyes at night

Your theme choice is saved automatically.

### Keyboard Navigation

- Press **Tab** to navigate between station dropdown, compass button, theme toggle, settings, and GitHub link
- Press **Escape** to close the settings panel or GPS nearby-stops dropdown
- Tab through settings panel fields when open

## Updates

Reload the web page. When a new version is available, you'll see a notification counting down from 5 seconds. The app will automatically reload with the latest features. All your settings and favorites are preserved.

## Technical Details

This is a pure JavaScript web app with no dependencies or build step. It works offline after your first visit thanks to service worker caching.

### Data Attribution

Departure data is provided by [Entur](https://entur.no/). The footer displays a translated "Data from Entur" attribution in all 12 supported languages.

### Languages Supported
English, Norwegian, German, Spanish, Italian, Greek, Persian, Hindi, Icelandic, Ukrainian, French, Polish

### Browser Requirements
Modern browsers with service worker support (Chrome 102+, Firefox 112+, Safari 15.5+)

## License

MIT
