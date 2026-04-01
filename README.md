# 🌤️ SkyPulse Weather App

![SkyPulse Banner](https://img.shields.io/badge/React_Native-Expo-blue?logo=react&logoColor=white) 
![Version](https://img.shields.io/badge/version-2.0-success)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-lightgrey)

SkyPulse is a premium, feature-rich weather prediction application built with **React Native (Expo)**. Designed with clean architecture, dynamic UI components, and real-time API integrations, it provides users with instantaneous, accurate meteorological data packaged in a stunning interface.

---

## ✨ Key Features (V2 Level Up)

- **🌍 Global Search & Favorites Location:** Search for any city worldwide, save it to your favorites using AsyncStorage, and instantly access real-time localized weather data.
- **🧠 Smart AI Assistant ("Ne Giysem?"):** Analyzes the current temperature and conditions to provide dynamic, smart clothing recommendations (e.g., "Bring an umbrella", "Wear light clothes").
- **📅 24-Hour & 5-Day Extended Forecasts:** Scrollable horizontal carousels that display detailed hourly predictions.
- **🌓 Adaptive Theme Modes:** Beautifully tailored UI tokens that respond instantly to Light and Dark system preferences without reloading.
- **🎨 Dynamic Atmospheric Backgrounds:** The background gradient responds directly to current weather conditions (e.g., Clear Sky, Rain, Snow, Thunderstorm) using fluid React Native Reanimated scaling and fading.
- **🌐 Built-in Localization (i18n):** Native support for English (EN) and Turkish (TR), auto-detecting device language at launch.
- **🌅 Sun & Moon Analytics:** Embedded sunrise and sunset trackers tailored to the local timezone of the queried location.

---

## 🛠️ Technology Stack

| Technology                  | Usage                                                   |
|-----------------------------|---------------------------------------------------------|
| **React Native / Expo**     | Core application framework.                             |
| **Context API**             | State management (Themes, Location, Favorites, Lang).   |
| **Axios**                   | Handling async RESTful fetches (OpenWeatherMap API).    |
| **React Navigation**        | Bottom Tabs (`@react-navigation/bottom-tabs`) & Stacks. |
| **Reanimated**              | Smooth 60fps card and entry transitions.                |
| **i18n-js & expo-loc**      | Multi-language translations and region detection.       |
| **AsyncStorage**            | Persistent local database caching.                      |

---

## 🚀 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mehmetalisahingm/skypulse.git
   cd skypulse
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # OR
   yarn install
   ```

3. **Start the Expo server:**
   ```bash
   npx expo start
   ```

4. You can run the application directly inside **Expo Go** on your physical device, or press `w` to open a local web preview.

---

## 📂 Project Architecture

```text
SkyPulse/
│
├── src/
│   ├── components/       # Reusable UI elements (WeatherCard, SmartAssistant, ForecastList)
│   ├── constants/        # Fixed app data (colors, string translations)
│   ├── context/          # Global State providers (Theme, Language, Favorites)
│   ├── hooks/            # Custom Hooks (useLocation, useWeather)
│   ├── navigation/       # Tab and Stack routing configuration
│   ├── screens/          # Main application views (Home, Search, Details, Favorites, Splash)
│   └── services/         # External API clients (OpenWeatherMap fetching)
│
├── App.js                # Core Application Entry Point
├── AppSnack.js           # Single-file bundled version optimized for Expo Snack running
└── MOBILE.md             # Development & Roadmap Logs
```

---

## 🔒 API Usage
This project utilizes the free-tier **OpenWeatherMap** API (`/weather` and `/forecast` endpoints). The provided API KEY inside `src/services/weatherService.js` is intended for development purposes. For production deployments, it is highly recommended to store the API Key within a `.env` file.

---
*Created as part of an Advanced Agentic Coding roadmap journey.* 🚀
