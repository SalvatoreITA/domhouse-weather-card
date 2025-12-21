const LitElement = customElements.get("ha-panel-lovelace")
  ? Object.getPrototypeOf(customElements.get("ha-panel-lovelace"))
  : Object.getPrototypeOf(customElements.get("hc-lovelace"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

// --- MAPPATURA ICONE ---
const weatherIconsDay = {
  clear: "day", "clear-night": "night", cloudy: "cloudy", fog: "cloudy",
  hail: "rainy-7", lightning: "thunder", "lightning-rainy": "thunder",
  partlycloudy: "cloudy-day-3", pouring: "rainy-6", rainy: "rainy-5",
  snowy: "snowy-6", "snowy-rainy": "rainy-7", sunny: "day",
  windy: "cloudy", "windy-variant": "cloudy-day-3", exceptional: "!!",
};

const weatherIconsNight = {
  ...weatherIconsDay,
  clear: "night", sunny: "night",
  partlycloudy: "cloudy-night-3", "windy-variant": "cloudy-night-3",
};

// =============================================================================
//  MAIN CARD CLASS
// =============================================================================
class DomHouseWeatherCard extends LitElement {
  static get properties() {
    return {
      _config: {},
      _forecastEvent: {},
      hass: {},
    };
  }

  static getConfigElement() {
    return document.createElement("domhouse-weather-card-editor");
  }

  static getStubConfig() {
    return {
      name: "Meteo DomHouse",
      entity_weather: "",
      entity_temp: "",
      entity_hum: "",
      entity_press: ""
    };
  }

  setConfig(config) {
    this._config = config;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated && this._config && this.hass) {
      this._subscribeForecastEvents();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._subscribed) {
      this._subscribed.then((unsub) => unsub());
      this._subscribed = undefined;
    }
  }

  updated(changedProps) {
    if (!this.hass || !this._config) return;
    if (changedProps.has("_config") || !this._subscribed) {
      this._subscribeForecastEvents();
    }
  }

  async _subscribeForecastEvents() {
    if (this._subscribed) {
      this._subscribed.then((unsub) => unsub());
      this._subscribed = undefined;
    }

    if (!this.hass || !this._config || !this.isConnected || !this._config.entity_weather) return;

    const forecastType = this._config.forecast_type || "daily";
    try {
      this._subscribed = this.hass.connection.subscribeMessage(
        (event) => { this._forecastEvent = event; },
        {
          type: "weather/subscribe_forecast",
          forecast_type: forecastType,
          entity_id: this._config.entity_weather,
        }
      );
    } catch (e) {
      console.warn("DomHouseCard: Errore iscrizione forecast", e);
    }
  }

  // --- GESTIONE AZIONI (TAP ACTION AGGIORNATA) ---
  _handleAction(entityId, actionConfig) {
    if (!actionConfig) {
        this._fireEvent("hass-more-info", { entityId });
        return;
    }

    const action = actionConfig.action || "more-info";

    switch (action) {
        case "fire-dom-event":
            // FIX per Browser Mod: Lancia l'evento ll-custom con la configurazione
            this._fireEvent("ll-custom", actionConfig);
            break;
        case "more-info":
            this._fireEvent("hass-more-info", { entityId });
            break;
        case "navigate":
            if (actionConfig.navigation_path) {
                window.history.pushState(null, "", actionConfig.navigation_path);
                this._fireEvent("location-changed", { replace: false });
            }
            break;
        case "url":
            if (actionConfig.url_path) {
                window.open(actionConfig.url_path);
            }
            break;
        case "call-service":
            if (actionConfig.service) {
                const [domain, service] = actionConfig.service.split(".");
                const data = actionConfig.data || actionConfig.service_data || {};
                this.hass.callService(domain, service, data);
            }
            break;
        case "toggle":
            if (entityId) {
                this.hass.callService("homeassistant", "toggle", { entity_id: entityId });
            }
            break;
        case "none":
            break;
        default:
            this._fireEvent("hass-more-info", { entityId });
    }
  }

  _fireEvent(type, detail) {
      const event = new Event(type, {
          bubbles: true,
          composed: true
      });
      event.detail = detail;
      this.dispatchEvent(event);
  }

  _getGaugeConfig(entity, userPrefix, actionSuffix) {
    const conf = this._config;
    let auto = { min: 0, max: 100, icon: "mdi:flash-circle", color: "#607d8b", unit: "" };

    if (entity && entity.attributes.unit_of_measurement) {
        const u = entity.attributes.unit_of_measurement;
        auto.unit = u;
        if (["°C", "°F", "K"].includes(u)) { auto.min = -10; auto.max = 50; auto.icon = "mdi:home-thermometer-outline"; auto.color = "#ff5722"; }
        else if (u === "%") { auto.min = 0; auto.max = 100; auto.icon = "mdi:water-percent"; auto.color = "#2196f3"; }
        else if (["hPa", "mbar", "bar"].includes(u)) { auto.min = 960; auto.max = 1060; auto.icon = "mdi:gauge"; auto.color = "#ff9800"; }
        else if (["W", "kW"].includes(u)) { auto.min = 0; auto.max = 3000; auto.icon = "mdi:lightning-bolt"; auto.color = "#ffeb3b"; }
        else if (u === "V") { auto.min = 180; auto.max = 260; auto.icon = "mdi:sine-wave"; auto.color = "#9c27b0"; }
    }

    return {
        min: conf[`${userPrefix}_min`] !== undefined ? conf[`${userPrefix}_min`] : auto.min,
        max: conf[`${userPrefix}_max`] !== undefined ? conf[`${userPrefix}_max`] : auto.max,
        icon: conf[`${userPrefix}_icon`] || auto.icon,
        color: conf[`${userPrefix}_color`] || auto.color,
        unit: conf[`${userPrefix}_unit`] || auto.unit,
        action: conf[`tap_action_${actionSuffix}`]
    };
  }

  render() {
    if (!this._config || !this.hass) return html``;

    const weatherObj = this._config.entity_weather ? this.hass.states[this._config.entity_weather] : null;
    const tempObj = this._config.entity_temp ? this.hass.states[this._config.entity_temp] : null;
    const humObj = this._config.entity_hum ? this.hass.states[this._config.entity_hum] : null;
    const pressObj = this._config.entity_press ? this.hass.states[this._config.entity_press] : null;

    if (this._config.entity_weather && !weatherObj) {
        return html`
            <ha-card style="padding: 16px; background-color: #440000; color: white;">
                ⚠️ Entità Meteo non trovata: <b>${this._config.entity_weather}</b>
            </ha-card>`;
    }

    let forecastData = [];
    if (weatherObj) {
        if (this._forecastEvent && this._forecastEvent.forecast) {
            forecastData = this._forecastEvent.forecast;
        } else if (weatherObj.attributes.forecast) {
            forecastData = weatherObj.attributes.forecast;
        }
    }

    const lang = this.hass.selectedLanguage || this.hass.language;
    const cTemp = this._getGaugeConfig(tempObj, "temp", "1");
    const cHum = this._getGaugeConfig(humObj, "hum", "2");
    const cPress = this._getGaugeConfig(pressObj, "press", "3");

    const actionWeather = this._config.tap_action_weather;

    return html`
      <ha-card>
        ${this._config.name
            ? html`<div class="header"><div class="separator">${this._config.name}</div></div>`
            : html``
        }

        <div class="gauges-container">
          ${this.renderGauge(tempObj, cTemp)}
          ${this.renderGauge(humObj, cHum)}
          ${this.renderGauge(pressObj, cPress)}
        </div>

        ${this._config.entity_weather
            ? html`
                <div class="forecast-container">
                  ${forecastData.length > 0
                    ? forecastData.slice(0, 5).map(daily => this.renderForecastDay(daily, lang, actionWeather))
                    : html`<div class="no-forecast">Previsioni non disponibili</div>`
                  }
                </div>`
            : html``
        }
      </ha-card>
    `;
  }

  renderGauge(entity, conf) {
    if (!entity) return html`<div class="gauge-item">N/A</div>`;
    const val = parseFloat(entity.state);
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    let percent = (val - conf.min) / (conf.max - conf.min);
    percent = Math.min(Math.max(percent, 0), 1);
    const offset = circumference - (percent * circumference);

    return html`
      <div class="gauge-item" @click="${(e) => { e.stopPropagation(); this._handleAction(entity.entity_id, conf.action); }}">
        <div class="gauge-svg-wrapper">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="${radius}" stroke="rgba(255,255,255,0.1)" stroke-width="5" fill="none" />
            <circle cx="50" cy="50" r="${radius}" stroke="${conf.color}" stroke-width="5" fill="none"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${offset}"
              stroke-linecap="round"
              transform="rotate(-90 50 50)" />
          </svg>
          <div class="gauge-icon">
            <ha-icon icon="${conf.icon}" style="color: ${conf.color};"></ha-icon>
          </div>
        </div>
        <div class="gauge-value">${entity.state} <span style="font-size:0.7em">${conf.unit}</span></div>
      </div>
    `;
  }

  renderForecastDay(daily, lang, actionConfig) {
    const date = new Date(daily.datetime);
    const dayName = date.toLocaleDateString(lang, { weekday: 'short' }).toUpperCase();
    const condition = daily.condition.toLowerCase();
    const iconName = weatherIconsDay[condition] || "cloudy";
    const iconUrl = `https://cdn.jsdelivr.net/gh/bramkragten/weather-card/dist/icons/${iconName}.svg`;
    const tempHigh = parseFloat(daily.temperature).toFixed(1);
    const tempLow = daily.templow !== undefined ? parseFloat(daily.templow).toFixed(1) : null;
    let rainText = "";
    if (daily.precipitation !== undefined && daily.precipitation !== null) {
        rainText = parseFloat(daily.precipitation).toFixed(1) + " mm";
    }

    return html`
      <div class="day-col" @click="${(e) => { e.stopPropagation(); this._handleAction(this._config.entity_weather, actionConfig); }}" style="cursor: pointer;">
        <div class="day-name">${dayName}</div>
        <div class="day-icon-wrapper"><img src="${iconUrl}" alt="${condition}" /></div>
        <div class="day-temp-high">${tempHigh}°C</div>
        <div class="day-temp-low">${tempLow ? tempLow + '°C' : ''}</div>
        <div class="day-rain">${rainText}</div>
      </div>
    `;
  }

  static get styles() {
    return css`
      ha-card {
        background: var(--ha-card-background, #1c1c1c);
        padding: 16px;
        box-shadow: none;
        font-family: 'Roboto', sans-serif;
      }
      .header { margin-bottom: 25px; }
      .separator {
        display: flex; align-items: center; text-align: center; color: #fff; font-weight: 500; font-size: 1.1em;
      }
      .separator::before, .separator::after {
        content: ''; flex: 1; border-bottom: 1px solid rgba(255,255,255,0.2);
      }
      .separator::before { margin-right: 1em; }
      .separator::after { margin-left: 1em; }

      .gauges-container { display: flex; justify-content: space-around; margin-bottom: 30px; }
      ha-card:not(:has(.header)):not(:has(.forecast-container)) .gauges-container { margin-bottom: 0; }
      ha-card:has(.header):not(:has(.forecast-container)) .gauges-container { margin-bottom: 0; }

      .gauge-item { display: flex; flex-direction: column; align-items: center; width: 33%; cursor: pointer; transition: opacity 0.2s;}
      .gauge-item:active { opacity: 0.6; }

      .gauge-svg-wrapper { position: relative; width: 70px; height: 70px; margin-bottom: 5px; }
      svg { width: 100%; height: 100%; }
      .gauge-icon { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); --mdc-icon-size: 28px; }
      .gauge-value { font-size: 1.1em; font-weight: bold; color: #fff; }

      .forecast-container { display: flex; justify-content: space-between; margin-top: 10px; }
      .no-forecast { text-align: center; width: 100%; opacity: 0.6; padding: 20px; }
      .day-col { flex: 1; display: flex; flex-direction: column; align-items: center; border-right: 1px solid rgba(255,255,255,0.1); padding: 0 5px; }
      .day-col:last-child { border-right: none; }
      .day-name { font-size: 0.9em; font-weight: bold; color: #ccc; margin-bottom: 5px; }
      .day-icon-wrapper img { width: 35px; height: 35px; margin-bottom: 5px; }
      .day-temp-high { font-weight: bold; font-size: 1em; color: #fff; }
      .day-temp-low { font-size: 0.85em; color: #888; margin-top: 2px; }
      .day-rain { font-size: 0.8em; color: #fff; margin-top: 6px; min-height: 15px; }
    `;
  }
}
customElements.define("domhouse-weather-card", DomHouseWeatherCard);

// =============================================================================
//  VISUAL EDITOR CLASS
// =============================================================================
class DomHouseWeatherCardEditor extends LitElement {
  static get properties() {
    return {
      hass: {},
      _config: {},
    };
  }

  setConfig(config) {
    this._config = config;
  }

  render() {
    if (!this.hass || !this._config) {
      return html``;
    }

    const renderSensorOptions = (label, keyPrefix) => html`
      <div class="sensor-group">
          <h4>${label}</h4>
          <ha-selector
              .hass=${this.hass}
              .selector=${{ entity: { domain: "sensor" } }}
              .value=${this._config[`entity_${keyPrefix}`]}
              .configValue=${`entity_${keyPrefix}`}
              .label=${"Entità Sensore"}
              @value-changed=${this._valueChanged}
          ></ha-selector>

          <div class="sensor-options">
              <ha-selector
                  .hass=${this.hass}
                  .selector=${{ icon: {} }}
                  .value=${this._config[`${keyPrefix}_icon`]}
                  .configValue=${`${keyPrefix}_icon`}
                  .label=${"Icona (Opz)"}
                  @value-changed=${this._valueChanged}
              ></ha-selector>
              <ha-textfield
                  .value=${this._config[`${keyPrefix}_unit`] || ''}
                  .configValue=${`${keyPrefix}_unit`}
                  .label=${"Unità"}
                  @input=${this._valueChanged}
              ></ha-textfield>
              <ha-textfield
                  .value=${this._config[`${keyPrefix}_color`] || ''}
                  .configValue=${`${keyPrefix}_color`}
                  .label=${"Colore HEX"}
                  @input=${this._valueChanged}
              ></ha-textfield>
          </div>
      </div>
    `;

    return html`
      <div class="card-config">
        <ha-textfield
            label="Titolo (Lascia vuoto per nascondere)"
            .value="${this._config.name || ''}"
            .configValue="${'name'}"
            @input="${this._valueChanged}"
            style="width: 100%; margin-bottom: 20px;"
        ></ha-textfield>

        <h3>Entità Meteo (Lascia vuoto per nascondere)</h3>
        <ha-selector
            .hass=${this.hass}
            .selector=${{ entity: { domain: "weather" } }}
            .value=${this._config.entity_weather}
            .configValue=${"entity_weather"}
            .label=${"Scegli entità meteo"}
            @value-changed=${this._valueChanged}
        ></ha-selector>

        <h3>Indicatori (Cerchi)</h3>
        ${renderSensorOptions("Cerchio 1 (Sinistra)", "temp")}
        ${renderSensorOptions("Cerchio 2 (Centro)", "hum")}
        ${renderSensorOptions("Cerchio 3 (Destra)", "press")}

        <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid var(--divider-color); text-align: center; opacity: 0.7; font-size: 0.9em;">
             Powered <a href="https://www.domhouse.it" target="_blank" style="color: var(--primary-color); text-decoration: none; font-weight: bold;">DomHouse.it</a>
        </div>
      </div>
    `;
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass) return;
    const target = ev.target;
    const configValue = target.configValue;

    if (!configValue) return;

    let newValue;
    if (ev.type === 'value-changed') {
        newValue = ev.detail.value;
    } else {
        newValue = target.value;
    }

    if (this._config[configValue] === newValue) return;

    const newConfig = { ...this._config };
    if (newValue === "" || newValue === undefined || newValue === null) {
      delete newConfig[configValue];
    } else {
      newConfig[configValue] = newValue;
    }

    this._config = newConfig;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    }));
  }

  static get styles() {
    return css`
      .card-config { padding: 10px; }
      .sensor-group {
        border: 1px solid var(--divider-color);
        padding: 10px;
        border-radius: 8px;
        margin-bottom: 10px;
        background: var(--secondary-background-color);
      }
      .sensor-group h4 { margin: 0 0 10px 0; opacity: 0.8; }
      .sensor-options { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 10px; }
      h3 { margin-bottom: 10px; margin-top: 20px; }
    `;
  }
}
customElements.define("domhouse-weather-card-editor", DomHouseWeatherCardEditor);
