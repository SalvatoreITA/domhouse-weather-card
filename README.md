# 🌦️ DomHouse Weather Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![version](https://img.shields.io/badge/version-v3.4-blue.svg)]()
[![maintainer](https://img.shields.io/badge/maintainer-DomHouse-green.svg)](https://www.domhouse.it)

Una card meteo **"All-in-One"** per Home Assistant Lovelace, progettata per essere elegante, intelligente e facilissima da configurare.

Combina 3 indicatori circolari (Gauges) per i sensori e una lista previsionale meteo a 5 giorni, tutto in un unico componente leggero e senza dipendenze esterne.

![Anteprima Card](1000035587.png) 
*(Sostituisci questo nome file con il nome reale del tuo screenshot se diverso)*

---

## ✨ Caratteristiche Principali

* **Zero Dipendenze:** Non richiede l'installazione di altre card (niente `stack-in-card`, `apexcharts`, `mushroom`). È un unico file `.js` autonomo.
* **Editor Visivo Completo:** Configurabile al 100% dall'interfaccia grafica di Home Assistant (UI), senza toccare una riga di codice.
* **Smart Auto-Detect 🧠:** La card "legge" l'unità di misura dei tuoi sensori e configura automaticamente **Icona**, **Colore** e **Scala Min/Max**.
* **Modulare:**
    * Se non selezioni un'entità meteo, la sezione previsioni sparisce automaticamente.
    * Se non scrivi un titolo, l'intestazione si nasconde per risparmiare spazio.
* **Animazioni:** Include nativamente le icone meteo animate (SVG).
* **Personalizzabile:** Puoi sovrascrivere manualmente colori, icone e unità di misura per ogni singolo cerchio.

---

## 🚀 Installazione

### Opzione 1: Via HACS (Consigliata)
1.  Apri **HACS** in Home Assistant.
2.  Vai nella sezione **Frontend**.
3.  Clicca sui 3 puntini in alto a destra > **Repository Personalizzati**.
4.  Incolla l'URL di questo repository GitHub.
5.  Seleziona la categoria **Lovelace**.
6.  Clicca **Aggiungi** e poi **Scarica**.
7.  Ricarica la pagina del browser.

### Opzione 2: Installazione Manuale
1.  Scarica il file `domhouse-weather-card.js` da questo repository.
2.  Caricalo nella cartella `/www/` del tuo Home Assistant.
3.  Vai in **Impostazioni** > **Plance** > **Risorse**.
4.  Aggiungi una risorsa:
    * URL: `/local/domhouse-weather-card.js`
    * Tipo: `Modulo JavaScript`
5.  Ricarica la pagina del browser.

---

## ⚙️ Configurazione

Puoi aggiungere la card alla tua dashboard in due modi:

### 1. Editor Visivo (UI)
1.  Nella tua dashboard, clicca **Modifica plancia**.
2.  Clicca **Aggiungi Scheda**.
3.  Cerca **"Meteo DomHouse"**.
4.  Usa i menu a tendina per selezionare i tuoi sensori. L'anteprima si aggiornerà in tempo reale.

### 2. Configurazione YAML (Manuale)
Ecco la lista completa delle variabili disponibili.

| Opzione | Tipo | Descrizione | Default |
| :--- | :--- | :--- | :--- |
| `type` | string | **Obbligatorio.** Deve essere `custom:domhouse-weather-card`. | - |
| `name` | string | Titolo della card. Se omesso, l'intestazione viene nascosta. | - |
| `entity_weather` | string | L'entità meteo (es. `weather.casa`). Se omesso, le previsioni non appaiono. | - |
| `forecast_type` | string | Tipo di previsioni: `daily` (giornaliero) o `hourly` (orario). | `daily` |
| **CERCHIO 1** | | | |
| `entity_temp` | string | Entità per il primo cerchio (sinistra). | - |
| `temp_icon` | string | Sovrascrivi l'icona (es. `mdi:fire`). | Auto |
| `temp_color` | string | Sovrascrivi il colore HEX (es. `#ff0000`). | Auto |
| `temp_unit` | string | Sovrascrivi l'unità di misura. | Auto |
| `temp_min` | number | Valore minimo della scala. | Auto |
| `temp_max` | number | Valore massimo della scala. | Auto |
| **CERCHIO 2** | | *(Stesse opzioni del cerchio 1, prefisso `hum_`)* | |
| `entity_hum` | string | Entità per il cerchio centrale. | - |
| `hum_icon` | string | ... | Auto |
| **CERCHIO 3** | | *(Stesse opzioni del cerchio 1, prefisso `press_`)* | |
| `entity_press` | string | Entità per il terzo cerchio (destra). | - |
| `press_icon` | string | ... | Auto |

---

## 🧠 Legenda Smart Auto-Detect

Se non specifichi colori o icone, la card li sceglie da sola in base all'unità di misura del sensore:

| Unità Sensore | Icona Automatica | Colore | Scala Default | Utilizzo Tipico |
| :--- | :---: | :---: | :--- | :--- |
| **°C / °F / K** | 🌡️ (`home-thermometer`) | 🟠 **Arancione** | -10 a 50 | Temperature |
| **%** | 💧 (`water-percent`) | 🔵 **Blu** | 0 a 100 | Umidità, Batterie |
| **hPa / mbar** | ⏲️ (`gauge`) | 🟡 **Giallo Scuro** | 960 a 1060 | Pressione |
| **W / kW** | ⚡ (`lightning-bolt`) | 🟡 **Giallo** | 0 a 3000 | Consumi, Fotovoltaico |
| **V** | 〰️ (`sine-wave`) | 🟣 **Viola** | 180 a 260 | Voltaggio |
| *Altro* | ⚡ (`flash-circle`) | ⚪ **Grigio** | 0 a 100 | Generico |

---

## 💡 Esempi di Utilizzo

### Esempio 1: Configurazione Completa (Meteo)
La classica visualizzazione con titolo, meteo e 3 sensori climatici.

```yaml
type: custom:domhouse-weather-card
name: "Meteo Casa"
entity_weather: weather.forecast_home
entity_temp: sensor.temperatura_esterna
entity_hum: sensor.umidita_esterna
entity_press: sensor.pressione_assoluta
