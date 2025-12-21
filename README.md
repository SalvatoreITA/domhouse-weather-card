# 🌦️ DomHouse Weather Card (Edizione Universale)

[![it](https://img.shields.io/badge/lang-it-green.svg)](https://github.com/SalvatoreITA/domhouse-weather-card/blob/main/README.md)
[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/SalvatoreITA/domhouse-weather-card/blob/main/README_en.md)

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![version](https://img.shields.io/badge/version-v1.0.1-blue.svg)]()
[![maintainer](https://img.shields.io/badge/maintainer-Salvatore_Lentini_--_DomHouse.it-green.svg)](https://www.domhouse.it)

**La card "All-in-One" definitiva per Home Assistant Lovelace.**

Progettata per essere elegante, versatile e incredibilmente facile da configurare. Questa card combina splendide previsioni meteo a 5 giorni con **3 Indicatori Circolari Universali** in grado di monitorare *qualsiasi* entità della tua smart home.

Completa di **Badge di Stato** (bollini di notifica), traduzioni intelligenti degli stati e azioni al tocco avanzate.

![Anteprima Card](card.PNG)

---

## ✨ Funzionalità Principali

* **🟢 Cerchi Universali:** Non solo per il meteo! Puoi inserire **QUALSIASI entità** nei 3 indicatori circolari:
    * **Sensori:** Mostra valore numerico, unità e una barra di avanzamento visiva (Min/Max).
    * **Entità di Stato:** (Persone, Luci, Switch, Sensori Binari) Mostra il testo dello stato (es. "In Casa", "Acceso") e cambia colore automaticamente (Verde/Rosso).
* **🔴 Badge di Stato:** Aggiungi un piccolo punto di notifica (badge) a qualsiasi cerchio per monitorare uno stato secondario (es. mostra una piccola icona "Fiamma" sopra il cerchio della Temperatura se il riscaldamento è attivo).
* **🧠 Traduzioni Intelligenti:** Traduce e formatta automaticamente stati comuni come `home`, `not_home`, `on`, `off` in testo user-friendly (supporto nativo per l'italiano).
* **👆 Interattività Avanzata:** Ogni elemento è cliccabile. Supporto nativo per navigazione, `toggle`, `call-service` e popup **`browser_mod`**.
* **🎨 Editor Visivo:** Configurabile al 100% tramite l'interfaccia utente di Lovelace. Nessun codice YAML richiesto.
* **🧩 Design Modulare:** Se non selezioni un'entità meteo, la sezione previsioni si nasconde automaticamente, trasformandola in una pura card di monitoraggio.

---

## 🚀 Installazione

### Opzione 1: Tramite HACS (Consigliato)
1.  Apri **HACS** > **Frontend**.
2.  Clicca sul menu (3 puntini in alto a destra) > **Repository personalizzati**.
3.  Aggiungi l'URL: `https://github.com/SalvatoreITA/domhouse-weather-card`
4.  Categoria: **Lovelace**.
5.  Clicca su **Aggiungi** e poi su **Scarica**.
6.  Ricarica il browser.

### Opzione 2: Manuale
1.  Scarica il file `domhouse-weather-card.js`.
2.  Caricalo nella cartella `/www/` del tuo Home Assistant.
3.  Aggiungi la risorsa `/local/domhouse-weather-card.js` nelle Impostazioni della Plancia.

---

## ⚙️ Configurazione

Puoi configurare la card interamente tramite l'**Editor Visivo (UI)**. Per gli utenti avanzati, ecco le opzioni YAML.

### Variabili YAML

| Opzione | Descrizione |
| :--- | :--- |
| `type` | `custom:domhouse-weather-card` |
| `name` | Titolo della Card. Lascia vuoto per nascondere l'intestazione. |
| `entity_weather` | Entità Meteo. Lascia vuoto per nascondere la riga delle previsioni. |
| **CERCHIO 1 (Sinistra)** | |
| `entity_circle_1` | **Qualsiasi** entità (Sensore, Persona, Switch, ecc.). |
| `icon_circle_1` | Sovrascrivi l'icona predefinita. |
| `color_circle_1` | Sovrascrivi il colore predefinito (HEX). |
| `min_circle_1` | Valore minimo (per la scala dei sensori numerici). |
| `max_circle_1` | Valore massimo (per la scala dei sensori numerici). |
| `tap_action_circle_1` | Azione da eseguire al click. |
| **BADGE 1 (Opzionale)** | |
| `badge_entity_circle_1` | Entità per il piccolo punto di stato. |
| `badge_icon_circle_1` | Icona per il badge. |
| `badge_color_on_circle_1` | Colore quando lo stato è Attivo (On/Home). |
| `badge_color_off_circle_1` | Colore quando lo stato è Inattivo (Off/Away). |
| **CERCHI 2 & 3** | Ripeti la logica cambiando il suffisso in `_2` (Centro) e `_3` (Destra). |

---

## 💡 Esempi

### 1. Monitoraggio Misto (Persona + Luce + Potenza)
Un esempio perfetto della versatilità della card.

```yaml
type: custom:domhouse-weather-card
name: "Stato Soggiorno"
entity_weather: weather.home

# Cerchio 1: Persona (Mostra "In Casa"/"Fuori Casa" - Verde/Rosso)
entity_circle_1: person.alex
icon_circle_1: mdi:face-man

# Cerchio 2: Luce (Tocca per accendere/spegnere)
entity_circle_2: light.living_room_main
tap_action_circle_2:
  action: toggle

# Cerchio 3: Sensore Potenza (Numerico con barra)
entity_circle_3: sensor.current_power
min_circle_3: 0
max_circle_3: 4000
```
### 2. Riscaldamento Smart (Con Badge di Stato) 🔥
Visualizza la temperatura della stanza, ma usa un Badge per indicare se la caldaia è effettivamente in funzione.

```yaml
type: custom:domhouse-weather-card
name: "Clima Camera"
entity_weather: weather.forecast_home

# Cerchio Principale: Temperatura Stanza
entity_circle_1: sensor.bedroom_temperature
min_circle_1: 10
max_circle_1: 30

# Badge: Mostra un'icona fiamma se l'interruttore del riscaldamento è ON
badge_entity_circle_1: switch.heater_plug
badge_icon_circle_1: mdi:fire
badge_color_on_circle_1: "#ff5722"  # Arancione quando riscalda
badge_color_off_circle_1: "#9e9e9e" # Grigio quando spento
```
### 3. Azione Avanzata (Popup Browser Mod)
Usa un cerchio come pulsante per aprire un tastierino di sicurezza.

```yaml
type: custom:domhouse-weather-card
name: "Sistema di Sicurezza"

entity_circle_1: alarm_control_panel.house
tap_action_circle_1:
  action: fire-dom-event
  browser_mod:
    service: browser_mod.popup
    data:
      title: Tastierino Allarme
      content:
        type: entities
        entities:
          - entity: alarm_control_panel.house
```
### ❤️ Crediti
Sviluppato da Salvatore Lentini - DomHouse.it. Icone meteo animate basate sul lavoro di [Bram Kragten](https://github.com/bramkragten/weather-card)
