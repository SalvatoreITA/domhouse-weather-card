# 🌦️ DomHouse Weather Card

[![it](https://img.shields.io/badge/lang-it-green.svg)](https://github.com/SalvatoreITA/domhouse-weather-card/blob/main/README.md)
[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/SalvatoreITA/domhouse-weather-card/blob/main/README_en.md)

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![version](https://img.shields.io/badge/version-v7.0-blue.svg)]()
[![maintainer](https://img.shields.io/badge/maintainer-Salvatore_Lentini_--_DomHouse.it-green.svg)](https://www.domhouse.it)

An **"All-in-One"** card for Home Assistant Lovelace, designed to be elegant, smart, and versatile.

Originally born as a weather card, **v7.0** transforms it into a generic dashboard tool. You can now monitor **any entity** (Sensors, People, Switches, Lights) in the 3 circular gauges, complete with **Status Badges** and intelligent state translation.

![Card Preview](preview.png)

---

## ✨ Key Features (v7.0)

* **Generic Circles:** The circles are no longer tied to Temp/Hum/Press. You can put **anything** in them:
    * **Sensors:** Displays value and fills the bar based on Min/Max.
    * **Status Entities:** (Person, Light, Switch) Displays text (e.g., "Home", "On") and changes color automatically.
* **Status Badges (New!):** Add a small notification dot (badge) to any circle to monitor a secondary state (e.g., "Heating On" indicator on a temperature circle).
* **Smart Translations:** Automatically translates common states (home, on, off, open) into Italian or formatted text.
* **Visual Editor:** Fully configurable via UI.
* **Tap Actions:** Support for `Maps`, `toggle`, `call-service` and `browser_mod` popup.

---

## ⚙️ Configuration

You can configure the card via the **Visual Editor (UI)** or YAML.

### YAML Variables (v7.0 Updated)

| Option | Description | Example |
| :--- | :--- | :--- |
| `type` | **Required.** `custom:domhouse-weather-card` | |
| `name` | Card Title. Leave empty to hide header. | "My Home" |
| `entity_weather` | Weather entity. Leave empty to hide forecast. | `weather.home` |
| **CIRCLE 1 (Left)** | | |
| `entity_circle_1` | **Any** entity (Sensor, Person, Switch...). | `sensor.temp` |
| `icon_circle_1` | Override icon. | `mdi:thermometer` |
| `color_circle_1` | Override color (HEX). | `#ff9800` |
| `min_circle_1` | Min value (for numbers). | `0` |
| `max_circle_1` | Max value (for numbers). | `100` |
| `tap_action_circle_1` | Action on click. | *(See examples)* |
| **BADGE 1 (Optional)** | | |
| `badge_entity_circle_1` | Entity for the small dot. | `switch.heater` |
| `badge_icon_circle_1` | Icon for the badge. | `mdi:fire` |
| `badge_color_on_circle_1` | Color when Active. | `#e53935` |
| **CIRCLES 2 & 3** | Repeat logic changing suffix to `_2` and `_3`. | |

---

## 💡 Examples

### 1. Classic Weather Setup
```yaml
type: custom:domhouse-weather-card
name: "Home Weather"
entity_weather: weather.forecast_home

# Circle 1: Temperature
entity_circle_1: sensor.outdoor_temperature
min_circle_1: -5
max_circle_1: 40

# Circle 2: Humidity
entity_circle_2: sensor.outdoor_humidity

# Circle 3: Pressure
entity_circle_3: sensor.pressure
