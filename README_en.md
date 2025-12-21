# 🌦️ DomHouse Weather Card (Universal Edition)

[![it](https://img.shields.io/badge/lang-it-green.svg)](https://github.com/SalvatoreITA/domhouse-weather-card/blob/main/README.md)
[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/SalvatoreITA/domhouse-weather-card/blob/main/README_en.md)

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![version](https://img.shields.io/badge/version-v1.0.1-blue.svg)]()
[![maintainer](https://img.shields.io/badge/maintainer-Salvatore_Lentini_--_DomHouse.it-green.svg)](https://www.domhouse.it)

**The ultimate "All-in-One" card for Home Assistant Lovelace.**

Designed to be elegant, versatile, and incredibly easy to configure. This card combines a stunning 5-day weather forecast with **3 Universal Circular Gauges** capable of monitoring *any* entity in your smart home.

Complete with **Status Badges** (notification dots), intelligent state translations, and advanced tap actions.

![Card Preview](preview.png)

---

## ✨ Key Features

* **🟢 Universal Circles:** Not just for weather! You can place **ANY entity** in the 3 circular gauges:
    * **Sensors:** Displays numeric value, unit, and a visual progress bar (Min/Max).
    * **Status Entities:** (Person, Light, Switch, Binary Sensor) Displays the state text (e.g., "Home", "On") and changes color automatically (Green/Red).
* **🔴 Status Badges:** Add a small notification dot (badge) to any circle to monitor a secondary state (e.g., show a small "Flame" icon on top of the Room Temperature circle if the heater is actively firing).
* **🧠 Smart Translations:** Automatically translates and formats common states like `home`, `not_home`, `on`, `off` into user-friendly text (Italian support native).
* **👆 Advanced Interactivity:** Every element is clickable. Native support for `Maps`, `toggle`, `call-service`, and **`browser_mod`** popups.
* **🎨 Visual Editor:** 100% Configurable via the Lovelace UI. No YAML required.
* **🧩 Modular Design:** If you don't select a weather entity, the forecast section hides automatically, turning it into a pure monitoring card.

---

## 🚀 Installation

### Option 1: Via HACS (Recommended)
1.  Open **HACS** > **Frontend**.
2.  Click the menu (3 dots) > **Custom Repositories**.
3.  Add URL: `https://github.com/SalvatoreITA/domhouse-weather-card`
4.  Category: **Lovelace**.
5.  Click **Add** and **Download**.
6.  Reload your browser.

### Option 2: Manual
1.  Download `domhouse-weather-card.js`.
2.  Upload it to your `/www/` folder.
3.  Add the resource `/local/domhouse-weather-card.js` in your Dashboard Settings.

---

## ⚙️ Configuration

You can configure the card entirely via the **Visual Editor (UI)**. For advanced users, here are the YAML options.

### YAML Variables

| Option | Description |
| :--- | :--- |
| `type` | `custom:domhouse-weather-card` |
| `name` | Card Title. Leave empty to hide the header. |
| `entity_weather` | Weather entity. Leave empty to hide the forecast row. |
| **CIRCLE 1 (Left)** | |
| `entity_circle_1` | **Any** entity (Sensor, Person, Switch, etc.). |
| `icon_circle_1` | Override the default icon. |
| `color_circle_1` | Override the default color (HEX). |
| `min_circle_1` | Minimum value (for numeric sensors scale). |
| `max_circle_1` | Maximum value (for numeric sensors scale). |
| `tap_action_circle_1` | Action to perform when clicked. |
| **BADGE 1 (Optional)** | |
| `badge_entity_circle_1` | Entity for the small status dot. |
| `badge_icon_circle_1` | Icon for the badge. |
| `badge_color_on_circle_1` | Color when state is Active (On/Home). |
| `badge_color_off_circle_1` | Color when state is Inactive (Off/Away). |
| **CIRCLES 2 & 3** | Repeat logic changing suffix to `_2` (Center) and `_3` (Right). |

---

## 💡 Examples

### 1. Mixed Monitoring (Person + Light + Power)
A perfect example of the card's versatility.

```yaml
type: custom:domhouse-weather-card
name: "Living Room Status"
entity_weather: weather.home

# Circle 1: Person (Shows "Home"/"Away" - Green/Red)
entity_circle_1: person.alex
icon_circle_1: mdi:face-man

# Circle 2: Light (Tap to Toggle)
entity_circle_2: light.living_room_main
tap_action_circle_2:
  action: toggle

# Circle 3: Power Sensor (Numeric with Bar)
entity_circle_3: sensor.current_power
min_circle_3: 0
max_circle_3: 4000
```

### 2. Smart Heating (With Status Badge) 🔥
Display the room temperature, but use a Badge to indicate if the boiler is actually running.

```yaml
type: custom:domhouse-weather-card
name: "Bedroom Climate"
entity_weather: weather.forecast_home

# Main Circle: Room Temperature
entity_circle_1: sensor.bedroom_temperature
min_circle_1: 10
max_circle_1: 30

# Badge: Shows a flame icon if the heater switch is ON
badge_entity_circle_1: switch.heater_plug
badge_icon_circle_1: mdi:fire
badge_color_on_circle_1: "#ff5722"  # Orange when Heating
badge_color_off_circle_1: "#9e9e9e" # Grey when Off
```
### 3. Advanced Action (Browser Mod Popup)
Use a circle as a button to open a security keypad.

```yaml
type: custom:domhouse-weather-card
name: "Security System"

entity_circle_1: alarm_control_panel.house
tap_action_circle_1:
  action: fire-dom-event
  browser_mod:
    service: browser_mod.popup
    data:
      title: Alarm Keypad
      content:
        type: entities
        entities:
          - entity: alarm_control_panel.house
```

## ❤️ Credits
Developed by Salvatore Lentini - DomHouse.it. Animated weather icons based on [Bram Kragten](https://github.com/bramkragten/weather-card) work.
