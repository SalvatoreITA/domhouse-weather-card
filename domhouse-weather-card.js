const LitElement = customElements.get("ha-panel-lovelace")
  ? Object.getPrototypeOf(customElements.get("ha-panel-lovelace"))
  : Object.getPrototypeOf(customElements.get("hc-lovelace"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

// --- MAPPATURA ICONE METEO ---
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
      entity_circle_1: "",
      entity_circle_2: "",
      entity_circle_3: ""
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

  // --- GESTIONE AZIONI (TAP ACTION) ---
  _handleAction(entityId, actionConfig) {
    if (!actionConfig) {
        this._fireEvent("hass-more-info", { entityId });
        return;
    }

    const action = actionConfig.action || "more-info";

    switch (action) {
        case "fire-dom-event":
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
      const event = new Event(type, { bubbles: true, composed: true });
      event.detail = detail;
      this.dispatchEvent(event);
  }

  // --- CONFIGURAZIONE GAUGE & BADGE ---
  // suffix ora sarà "circle_1", "circle_2", "circle_3"
  _getGaugeConfig(entity, suffix) {
    const conf = this._config;
    let auto = {
        min: 0,
        max: 100,
        icon: "mdi:flash-circle",
        color: "#607d8b",
        unit: "",
        isNumeric: true
    };

    if (entity) {
        // Logica per Numeri vs Stati (Person, Switch, etc)
        const val = parseFloat(entity.state);

        if (!isNaN(val) && entity.attributes.unit_of_measurement) {
            // È un NUMERO (Sensore classico)
            auto.isNumeric = true;
            const u = entity.attributes.unit_of_measurement;
            auto.unit = u;
            if (["°C", "°F", "K"].includes(u)) { auto.min = -10; auto.max = 50; auto.icon = "mdi:home-thermometer-outline"; auto.color = "#ff5722"; }
            else if (u === "%") { auto.min = 0; auto.max = 100; auto.icon = "mdi:water-percent"; auto.color = "#2196f3"; }
            else if (["hPa", "mbar", "bar"].includes(u)) { auto.min = 960; auto.max = 1060; auto.icon = "mdi:gauge"; auto.color = "#ff9800"; }
            else if (["W", "kW"].includes(u)) { auto.min = 0; auto.max = 3000; auto.icon = "mdi:lightning-bolt"; auto.color = "#ffeb3b"; }
            else if (u === "V") { auto.min = 180; auto.max = 260; auto.icon = "mdi:sine-wave"; auto.color = "#9c27b0"; }
        } else {
            // È uno STATO (Person, Switch, Sun, etc.)
            auto.isNumeric = false;
            const state = entity.state.toLowerCase();
            const activeStates = ['home', 'on', 'open', 'unlocked', 'active', 'above_horizon'];

            // Icone Default
            if (entity.entity_id.startsWith("person.")) auto.icon = "mdi:account";
            else if (entity.entity_id.startsWith("light.")) auto.icon = "mdi:lightbulb";
            else if (entity.entity_id.startsWith("switch.")) auto.icon = "mdi:power-plug";
            else if (entity.entity_id.startsWith("sun.")) auto.icon = "mdi:weather-sunny";
            else auto.icon = entity.attributes.icon || "mdi:circle-outline";

            // Colori Default per Stato
            if (activeStates.includes(state)) {
                auto.color = "#4caf50"; // Verde (Attivo/Home)
            } else {
                auto.color = "#e53935"; // Rosso (Inattivo/Away)
            }
        }
    }

    // Badge Logic
    let badge = null;
    const badgeEntityId = conf[`badge_entity_${suffix}`];
    if (badgeEntityId && this.hass.states[badgeEntityId]) {
        const bStateObj = this.hass.states[badgeEntityId];
        const state = bStateObj.state.toLowerCase();

        let activeStates = ['on', 'home', 'open', 'heating', 'cooling', 'unlocked', 'active', 'cleaning', 'problem', 'acceso'];
        const customStates = conf[`badge_states_on_${suffix}`];
        if (customStates) {
            if (Array.isArray(customStates)) {
                activeStates = customStates.map(s => s.toLowerCase());
            } else if (typeof customStates === 'string') {
                activeStates = customStates.split(',').map(s => s.trim().toLowerCase());
            }
        }

        const isActive = activeStates.includes(state);

        badge = {
            state: bStateObj.state,
            isActive: isActive,
            icon: conf[`badge_icon_${suffix}`] || bStateObj.attributes.icon || "mdi:circle",
            color: isActive
                ? (conf[`badge_color_on_${suffix}`] || "#ff5722")
                : (conf[`badge_color_off_${suffix}`] || "#9e9e9e")
        };
    }

    return {
        // Nuova Nomenclatura: min_circle_1, icon_circle_1, etc.
        min: conf[`min_${suffix}`] !== undefined ? conf[`min_${suffix}`] : auto.min,
        max: conf[`max_${suffix}`] !== undefined ? conf[`max_${suffix}`] : auto.max,
        icon: conf[`icon_${suffix}`] || auto.icon,
        color: conf[`color_${suffix}`] || auto.color,
        unit: conf[`unit_${suffix}`] || auto.unit,
        isNumeric: auto.isNumeric,
        action: conf[`tap_action_${suffix}`],
        badge: badge
    };
  }

  render() {
    if (!this._config || !this.hass) return html``;

    const weatherObj = this._config.entity_weather ? this.hass.states[this._config.entity_weather] : null;

    // Recupero entità usando i nuovi nomi generici
    const c1Obj = this._config.entity_circle_1 ? this.hass.states[this._config.entity_circle_1] : null;
    const c2Obj = this._config.entity_circle_2 ? this.hass.states[this._config.entity_circle_2] : null;
    const c3Obj = this._config.entity_circle_3 ? this.hass.states[this._config.entity_circle_3] : null;

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

    // Configurazione usando suffisso circle_1, circle_2, circle_3
    const conf1 = this._getGaugeConfig(c1Obj, "circle_1");
    const conf2 = this._getGaugeConfig(c2Obj, "circle_2");
    const conf3 = this._getGaugeConfig(c3Obj, "circle_3");

    const actionWeather = this._config.tap_action_weather;

    return html`
      <ha-card>
        ${this._config.name
            ? html`<div class="header"><div class="separator">${this._config.name}</div></div>`
            : html``
        }

        <div class="gauges-container">
          ${this.renderGauge(c1Obj, conf1)}
          ${this.renderGauge(c2Obj, conf2)}
          ${this.renderGauge(c3Obj, conf3)}
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

    let percent = 0;
    let displayValue = entity.state;
    let displayUnit = conf.unit;

    if (conf.isNumeric) {
        const val = parseFloat(entity.state);
        percent = (val - conf.min) / (conf.max - conf.min);
    } else {
        percent = 1;
        displayUnit = "";
        const rawState = entity.state.toLowerCase();
        const translations = {
            "home": "In Casa", "not_home": "Fuori Casa",
            "on": "Acceso", "off": "Spento",
            "open": "Aperto", "closed": "Chiuso",
            "unlocked": "Sbloccato", "locked": "Bloccato",
            "above_horizon": "Giorno", "below_horizon": "Notte"
        };
        if (translations[rawState]) {
            displayValue = translations[rawState];
        } else {
            displayValue = displayValue.charAt(0).toUpperCase() + displayValue.slice(1);
        }
    }

    percent = Math.min(Math.max(percent, 0), 1);
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
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

          ${conf.badge ? html`
             <div class="badge-icon-wrapper"
                  style="background-color: ${conf.badge.color};"
                  title="${conf.badge.state}"
             >
                <ha-icon icon="${conf.badge.icon}"></ha-icon>
             </div>
          ` : ''}

        </div>
        <div class="gauge-value">${displayValue} <span style="font-size:0.7em">${displayUnit}</span></div>
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

      .gauge-svg-wrapper {
        position: relative;
        width: 70px;
        height: 70px;
        margin-bottom: 5px;
        overflow: visible;
      }
      svg { width: 100%; height: 100%; }
      .gauge-icon { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); --mdc-icon-size: 28px; }
      .gauge-value { font-size: 1.1em; font-weight: bold; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }

      .badge-icon-wrapper {
        position: absolute;
        top: -4px;
        right: -4px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid var(--ha-card-background, var(--card-background-color, #1c1c1c));
        z-index: 5;
        box-shadow: 0 1px 2px rgba(0,0,0,0.2);
      }
      .badge-icon-wrapper ha-icon {
        --mdc-icon-size: 14px;
        color: #ffffff;
      }

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
//  VISUAL EDITOR CLASS (v7.0 - Generic Names)
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

    // suffix: "circle_1", "circle_2", etc.
    const renderSensorOptions = (label, suffix) => html`
      <div class="sensor-group">
          <h4>${label}</h4>
          <ha-selector
              .hass=${this.hass}
              .selector=${{ entity: {} }}
              .value=${this._config[`entity_${suffix}`]}
              .configValue=${`entity_${suffix}`}
              .label=${"Entità Principale"}
              @value-changed=${this._valueChanged}
          ></ha-selector>

          <div class="sensor-options">
              <ha-selector
                  .hass=${this.hass}
                  .selector=${{ icon: {} }}
                  .value=${this._config[`icon_${suffix}`]}
                  .configValue=${`icon_${suffix}`}
                  .label=${"Icona"}
                  @value-changed=${this._valueChanged}
              ></ha-selector>
              <ha-textfield
                  .value=${this._config[`unit_${suffix}`] || ''}
                  .configValue=${`unit_${suffix}`}
                  .label=${"Unità"}
                  @input=${this._valueChanged}
              ></ha-textfield>
              <ha-textfield
                  .value=${this._config[`color_${suffix}`] || ''}
                  .configValue=${`color_${suffix}`}
                  .label=${"Colore HEX"}
                  @input=${this._valueChanged}
              ></ha-textfield>
          </div>

          <div class="sensor-options">
              <ha-textfield
                  .value=${this._config[`min_${suffix}`] || ''}
                  .configValue=${`min_${suffix}`}
                  .label=${"Min"}
                  type="number"
                  @input=${this._valueChanged}
              ></ha-textfield>
              <ha-textfield
                  .value=${this._config[`max_${suffix}`] || ''}
                  .configValue=${`max_${suffix}`}
                  .label=${"Max"}
                  type="number"
                  @input=${this._valueChanged}
              ></ha-textfield>
          </div>

          <div class="badge-section" style="margin-top: 15px; border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 10px;">
              <span style="font-size: 0.85em; font-weight: bold; opacity: 0.8;">Bollino / Badge (Opzionale)</span>

              <ha-selector
                  .hass=${this.hass}
                  .selector=${{ entity: {} }}
                  .value=${this._config[`badge_entity_${suffix}`]}
                  .configValue=${`badge_entity_${suffix}`}
                  .label=${"Entità Badge"}
                  @value-changed=${this._valueChanged}
                  style="margin-top: 5px;"
              ></ha-selector>

              <div class="sensor-options">
                  <ha-selector
                      .hass=${this.hass}
                      .selector=${{ icon: {} }}
                      .value=${this._config[`badge_icon_${suffix}`]}
                      .configValue=${`badge_icon_${suffix}`}
                      .label=${"Icona Badge"}
                      @value-changed=${this._valueChanged}
                  ></ha-selector>

                  <ha-textfield
                      .value=${this._config[`badge_color_on_${suffix}`] || ''}
                      .configValue=${`badge_color_on_${suffix}`}
                      .label=${"Colore ON"}
                      placeholder="#ff5722"
                      @input=${this._valueChanged}
                  ></ha-textfield>

                  <ha-textfield
                      .value=${this._config[`badge_color_off_${suffix}`] || ''}
                      .configValue=${`badge_color_off_${suffix}`}
                      .label=${"Colore OFF"}
                      placeholder="#9e9e9e"
                      @input=${this._valueChanged}
                  ></ha-textfield>
              </div>

              <ha-textfield
                  .value=${this._config[`badge_states_on_${suffix}`] || ''}
                  .configValue=${`badge_states_on_${suffix}`}
                  .label=${"Stati ON (opz: on,running)"}
                  @input=${this._valueChanged}
                  style="width: 100%; margin-top: 8px;"
              ></ha-textfield>
          </div>
      </div>
    `;

    return html`
      <div class="card-config">
        <ha-textfield
            label="Titolo"
            .value="${this._config.name || ''}"
            .configValue="${'name'}"
            @input="${this._valueChanged}"
            style="width: 100%; margin-bottom: 20px;"
        ></ha-textfield>

        <h3>Entità Meteo</h3>
        <ha-selector
            .hass=${this.hass}
            .selector=${{ entity: { domain: "weather" } }}
            .value=${this._config.entity_weather}
            .configValue=${"entity_weather"}
            .label=${"Scegli entità meteo"}
            @value-changed=${this._valueChanged}
        ></ha-selector>

        <h3>Cerchi (Configurazione)</h3>
        ${renderSensorOptions("Cerchio 1 (Sinistra)", "circle_1")}
        ${renderSensorOptions("Cerchio 2 (Centro)", "circle_2")}
        ${renderSensorOptions("Cerchio 3 (Destra)", "circle_3")}

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
