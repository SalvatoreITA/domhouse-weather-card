# 🌦️ DomHouse Weather Card

[![it](https://img.shields.io/badge/lang-it-green.svg)](https://github.com/SalvatoreITA/domhouse-weather-card/blob/main/README.md)
[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/SalvatoreITA/domhouse-weather-card/blob/main/README_en.md)

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![version](https://img.shields.io/badge/version-v1.0-blue.svg)]()
[![maintainer](https://img.shields.io/badge/maintainer-Salvatore_Lentini_--_DomHouse.it-green.svg)](https://www.domhouse.it)

An **"All-in-One"** weather card for Home Assistant Lovelace, designed to be elegant, smart, and incredibly easy to configure.

It combines 3 circular indicators (Gauges) for sensors and a 5-day weather forecast list, all in a single lightweight component with zero external dependencies.

![Card Preview](card.PNG)

---

## ✨ Key Features

* **Zero Dependencies:** Does not require installing other cards (no `stack-in-card`, `apexcharts`, `mushroom`). It is a single standalone `.js` file.
* **Full Visual Editor:** 100% configurable via the Home Assistant UI, without touching a single line of code.
* **Smart Auto-Detect 🧠:** The card "reads" your sensors' unit of measurement and automatically configures the **Icon**, **Color**, and **Min/Max Scale**.
* **Advanced Interactivity (Tap Action) 👆:** Every element (circles and weather) is clickable. It supports native actions (`Maps`, `call-service`, `toggle`) and **Browser Mod** (`fire-dom-event`) for custom popups.
* **Modular:**
    * If you don't select a weather entity, the forecast section hides automatically.
    * If you don't write a title, the header hides to save space.
* **Animations:** Includes native animated SVG weather icons.
* **Customizable:** You can manually override colors, icons, and units for each individual circle.

---

## 🚀 Installation

### Option 1: Via HACS (Recommended)
1.  Open **HACS** in Home Assistant.
2.  Go to the **Frontend** section.
3.  Click the 3 dots in the top right > **Custom Repositories**.
4.  Paste this GitHub repository URL: `https://github.com/SalvatoreITA/domhouse-weather-card`
5.  Select the **Lovelace** category.
6.  Click **Add** and then **Download**.
7.  Reload the browser page.

### Option 2: Manual Installation
1.  Download the `domhouse-weather-card.js` file from this repository.
2.  Upload it to the `/www/` folder of your Home Assistant instance.
3.  Go to **Settings** > **Dashboards** > **Resources**.
4.  Add a resource:
    * URL: `/local/domhouse-weather-card.js`
    * Type: `JavaScript Module`
5.  Reload the browser page.

---

## ⚙️ Configuration

You can add the card to your dashboard in two ways:

### 1. Visual Editor (UI)
1.  In your dashboard, click **Edit Dashboard**.
2.  Click **Add Card**.
3.  Search for **"Meteo DomHouse"** (or DomHouse Weather).
4.  Use the dropdown menus to select your sensors.

### 2. YAML Configuration (Manual)
Here is the complete list of available variables, including the new tap actions.

| Option | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| `type` | string | **Required.** Must be `custom:domhouse-weather-card` | - |
| `name` | string | Card title. If omitted, the header is hidden. | - |
| `entity_weather` | string | The weather entity (e.g., `weather.home`). If omitted, forecasts do not appear. | - |
| `tap_action_weather` | action | Action when clicking the weather row. | `more-info` |
| **CIRCLE 1 (Left)** | | | |
| `entity_temp` | string | Entity for the first circle. | - |
| `temp_icon` | string | Override the icon. | Auto |
| `temp_color` | string | Override the HEX color. | Auto |
| `tap_action_1` | action | Action when clicking Circle 1. | `more-info` |
| **CIRCLE 2 (Center)** | | *(Prefix `hum_` and `tap_action_2`)* | |
| **CIRCLE 3 (Right)** | | *(Prefix `press_` and `tap_action_3`)* | |

---

## 🧠 Smart Auto-Detect Legend

If you do not specify colors or icons, the card chooses them automatically based on the sensor's unit of measurement:

| Sensor Unit | Automatic Icon | Color | Default Scale | Typical Usage |
| :--- | :---: | :---: | :--- | :--- |
| **°C / °F / K** | 🌡️ (`home-thermometer`) | 🟠 **Orange** | -10 to 50 | Temperature |
| **%** | 💧 (`water-percent`) | 🔵 **Blue** | 0 to 100 | Humidity, Battery |
| **hPa / mbar** | ⏲️ (`gauge`) | 🟡 **Dark Yellow** | 960 to 1060 | Pressure |
| **W / kW** | ⚡ (`lightning-bolt`) | 🟡 **Yellow** | 0 to 3000 | Power, Solar |
| **V** | 〰️ (`sine-wave`) | 🟣 **Purple** | 180 to 260 | Voltage |
| *Other* | ⚡ (`flash-circle`) | ⚪ **Gray** | 0 to 100 | Generic |

---

## 💡 Usage Examples

### Esempio 1: Configurazione Completa (Meteo)
La classica visualizzazione con titolo, meteo e 3 sensori climatici.

```yaml
type: custom:domhouse-weather-card
name: "Meteo Casa"
entity_weather: weather.forecast_home
entity_temp: sensor.temperatura_esterna
entity_hum: sensor.umidita_esterna
entity_press: sensor.pressione_assoluta
```

### Esempio 2: Monitor Server (Senza Meteo, Senza Titolo)
Una card compatta per monitorare il tuo sistema Home Assistant o un PC. Rimuovendo entity_weather e name, la card diventa minimalista.

```yaml
type: custom:domhouse-weather-card
# name:  <-- Rimosso per nascondere il titolo
# entity_weather: <-- Rimosso per nascondere le previsioni

# Cerchio 1: Temperatura CPU (Rileva °C -> Arancione)
entity_temp: sensor.processor_temperature

# Cerchio 2: Uso RAM (Rileva % -> Blu)
entity_hum: sensor.memory_use_percent
hum_icon: mdi:memory  # Cambio icona manuale

# Cerchio 3: Potenza assorbita (Rileva W -> Giallo)
entity_press: sensor.server_power

### Esempio 3: Override Manuale (Colori Personalizzati)
Vuoi un cerchio della temperatura Verde invece che Arancione? Ecco come fare.

type: custom:domhouse-weather-card
name: "Stanza da Letto"
entity_weather: weather.forecast_home

entity_temp: sensor.temperatura_camera
temp_color: "#4caf50"      # Forza colore VERDE (HEX)
temp_icon: "mdi:bed"       # Forza icona LETTO
temp_min: 15               # Cambia scala minima
temp_max: 30               # Cambia scala massima

entity_hum: sensor.umidita_camera
entity_press: sensor.quality_air_pm25
```
### Esempio 4: Browser Mod & Popup
Cliccando sul primo cerchio si apre un popup personalizzato

Azione: Apre Popup Browser Mod
```yaml
tap_action_1:
  action: fire-dom-event
  browser_mod:
    service: browser_mod.popup
    data:
      title: Titolo Popup
      style: |
        --popup-background-color: var(--secondary-background-color);
        --dialog-backdrop-filter: blur(2em) brightness(0.75);
      content:
        type: entities
        entities:
          - entity: switch.xxx
```

### Esempio 4: Navigazione e Toggle
Usare i cerchi come pulsanti rapidi.
```yaml
type: custom:domhouse-weather-card
name: Comandi

# Cerchio 1: Naviga a un'altra pagina
entity_temp: sensor.temp_media
tap_action_1:
  action: navigate
  navigation_path: /lovelace/stanze

# Cerchio 2: Accendi/Spegni Luce
entity_hum: light.luce_sala
hum_icon: mdi:lightbulb
tap_action_2:
  action: toggle
```

## ❤️ Credits
Sviluppato da Salvatore Lentini - DomHouse.it. Basato sul concetto originale di Weather Card ma completamente riscritto con tecnologia LitElement nativa. Le icone meteo animate sono di [Bram Kragten](https://github.com/bramkragten/weather-card)


