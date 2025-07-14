on('ready', () => {
  // Styles
  const chatStyle = 'background-color:#926239; border:1px solid #000; border-radius:8px; padding:8px; width:100%; height:fit-content; font-size:1.1em;';
  const hr = '<hr style="border:1px solid #352716;">';
  const styleTitle = 'text-align:center; font-size:1.5em; font-weight:bold;';
  const styleSection = 'font-size:1.3em; font-weight:bold; margin-top:8px;';
  const styleCenter = 'text-align:center;';
  const btnStyle = 'background-color:#574530; border:1px solid #352716; border-radius:4px; padding:2px 8px; font-size:0.9em; color:#fff; text-decoration:none; margin:2px; display:inline-block;';
  const btnGroup = (html) => `<div style="${styleCenter}">${html}</div>`;

  // Configurations
  const WeatherConfig = {
    windForce: {
      "1": { speed: [0, 11], chance: 55, name: "Slight Breeze" },
      "2": { speed: [12, 38], chance: 25, name: "Nice Breeze" },
      "3": { speed: [39, 88], chance: 12, name: "Strong Wind" },
      "4": { speed: [89, 102], chance: 5, name: "Storm" },
      "5": { speed: [103, 117], chance: 2, name: "Violent Storm" },
      "6": { speed: [118, 200], chance: 1, name: "Hurricane" }
    },
    precipitationStrength: {
      rain: { light: 55, moderate: 25, heavy: 15, torrential: 5 },
      snow: { light: 65, moderate: 25, snowstorm: 10 },
      thunderstorm: { slight: 55, moderate: 25, strong: 15, severe: 5 }
    },
    climates: {
      temperate: {
        humidity: [40, 60],
        windChances: { north: 10, west: 20, east: 65, south: 5 },
        temperature: {
          spring: [[5,10],[10,15],[15,20],[20,30]],
          summer: [[10,15],[15,20],[20,30],[30,40]],
          fall: [[0,5],[5,10],[10,15],[15,20]],
          winter: [[-5,0],[0,5],[5,10],[10,15]]
        },
        precipitation: {
          spring: { clear: 40, rain: 53, thunderstorm: 7 },
          summer: { clear: 42, rain: 46, thunderstorm: 12 },
          fall: { clear: 43, rain: 53, thunderstorm: 4 },
          winter: { clear: 35, rain: 60, thunderstorm: 5 }
        }
      },
      desert: {
        humidity: [5, 15],
        windChances: { north: 5, west: 10, east: 20, south: 65 },
        temperature: {
          spring: [[15,20],[20,25],[25,35],[35,45]],
          summer: [[20,25],[25,35],[35,45],[45,55]],
          fall: [[10,15],[15,20],[20,25],[25,35]],
          winter: [[-5,0],[0,5],[5,10],[10,15]]
        },
        precipitation: {
          spring: { clear: 66, rain: 13, thunderstorm: 21 },
          summer: { clear: 75, rain: 0, thunderstorm: 25 },
          fall: { clear: 73, rain: 11, thunderstorm: 16 },
          winter: { clear: 81, rain: 18, thunderstorm: 1 }
        }
      },
      jungle: {
        humidity: [70, 90],
        windChances: { north: 5, west: 10, east: 65, south: 20 },
        temperature: {
          spring: [[10,15],[15,20],[20,30],[30,40]],
          summer: [[15,20],[20,30],[30,40],[40,50]],
          fall: [[5,10],[10,15],[15,20],[20,30]],
          winter: [[0,5],[5,10],[10,15],[15,20]]
        },
        precipitation: {
          spring: { clear: 21, rain: 51, thunderstorm: 28 },
          summer: { clear: 74, rain: 15, thunderstorm: 11 },
          fall: { clear: 12, rain: 44, thunderstorm: 44 },
          winter: { clear: 15, rain: 48, thunderstorm: 37 }
        }
      },
      cold: {
        humidity: [35, 55],
        windChances: { north: 65, west: 20, east: 10, south: 5 },
        temperature: {
          spring: [[-5,0],[0,5],[5,10],[10,15]],
          summer: [[0,5],[5,10],[10,15],[15,20]],
          fall: [[-10,-5],[-5,0],[0,5],[5,10]],
          winter: [[-20,-10],[-10,-5],[-5,0],[0,5]]
        },
        precipitation: {
          spring: { clear: 75, rain: 22, thunderstorm: 3 },
          summer: { clear: 44, rain: 49, thunderstorm: 7 },
          fall: { clear: 35, rain: 63, thunderstorm: 2 },
          winter: { clear: 87, rain: 12, thunderstorm: 1 }
        }
      }
    }
  };

  const CalendarConfig = {
    days: ["Rilmor", "Eretor", "Nauri", "Neldir", "Veltor", "Eltor", "Mernach"],
    months: [
      { name: "Juras", length: 31 }, { name: "Fevnir", length: 28 }, { name: "Morsir", length: 31 },
      { name: "Avalis", length: 30 }, { name: "Maï", length: 31 }, { name: "Jurn", length: 30 },
      { name: "Jullirq", length: 31 }, { name: "Aors", length: 31 }, { name: "Septibir", length: 30 },
      { name: "Octors", length: 31 }, { name: "Noval", length: 30 }, { name: "Devenir", length: 31 }
    ],
    seasons: [
      { name: "spring", months: [2, 3, 4] },
      { name: "summer", months: [5, 6, 7] },
      { name: "fall", months: [8, 9, 10] },
      { name: "winter", months: [11, 0, 1] }
    ]
  };

  const MoonConfig = {
    moons: [
      { name: "Lunara", cycle: 28, phases: ["New", "Crescent", "First Quarter", "Gibbous", "Full", "Gibbous Waning", "Last Quarter", "Crescent Waning"] },
      { name: "Virell", cycle: 35, phases: ["New", "First Quarter", "Full", "Last Quarter"] }
    ]
  };

  // Translations
  const i18n = {
    en: {
      climateNames: { temperate: "Temperate", desert: "Desert", jungle: "Jungle", cold: "Cold" },
      moonPhases: {
        "New": "New", "Crescent": "Crescent", "First Quarter": "First Quarter", "Gibbous": "Gibbous",
        "Full": "Full", "Gibbous Waning": "Gibbous Waning", "Last Quarter": "Last Quarter", "Crescent Waning": "Crescent Waning"
      },
      windDirections: { north: "North", south: "South", east: "East", west: "West" },
      windForces: {
        "Slight Breeze": "Slight Breeze", "Nice Breeze": "Nice Breeze", "Strong Wind": "Strong Wind",
        "Storm": "Storm", "Violent Storm": "Violent Storm", "Hurricane": "Hurricane", "Manual": "Manual Wind"
      },
      seasonNames: { spring: "Spring", summer: "Summer", fall: "Autumn", winter: "Winter" },
      date: "Date", season: "Season", moon: "Moon Phases", weather: "Weather Report", climate: "Climate",
      temperature: "Temperature", humidity: "Humidity", wind: "Wind", precipitation: "Precipitation",
      clear: "Clear", rain: "Rain", snow: "Snow", thunderstorm: "Thunderstorm", windFrom: "from",
      manual: "Manual Weather Mode", generate: "Generate Weather", setDay: "Set Day", setYear: "Set Year",
      saveProfile: "Save Current", loadProfile: "Load", exportProfile: "Export to handout", importProfile: "Import from handout", month: "Month",
      language: "Language", profiles: "Profiles", manualMode: "Manual Mode", type: "Type", temp: "Temp",
      windSpeed: "Wind", back: "Back", yes: "Yes", no: "No", humidityShort: "Humidity"
    },
    fr: {
      climateNames: { temperate: "Tempéré", desert: "Désertique", jungle: "Jungle", cold: "Froid" },
      moonPhases: {
        "New": "Nouvelle Lune", "Crescent": "Premier Croissant", "First Quarter": "Premier Quartier",
        "Gibbous": "Gibbeuse Croissante", "Full": "Pleine Lune", "Gibbous Waning": "Gibbeuse Décroissante",
        "Last Quarter": "Dernier Quartier", "Crescent Waning": "Dernier Croissant"
      },
      windDirections: { north: "Nord", south: "Sud", east: "Est", west: "Ouest" },
      windForces: {
        "Slight Breeze": "Brise Légère", "Nice Breeze": "Belle Brise", "Strong Wind": "Vent Fort",
        "Storm": "Tempête", "Violent Storm": "Tempête Violente", "Hurricane": "Ouragan", "Manual": "Vent Manuel"
      },
      seasonNames: { spring: "Printemps", summer: "Été", fall: "Automne", winter: "Hiver" },
      date: "Date", season: "Saison", moon: "Phases Lunaires", weather: "Météo", climate: "Climat",
      temperature: "Température", humidity: "Humidité", wind: "Vent", precipitation: "Précipitations",
      clear: "Clair", rain: "Pluie", snow: "Neige", thunderstorm: "Orage", windFrom: "depuis le",
      manual: "Mode Météo Manuel", generate: "Générer la Météo", setDay: "Définir le Jour", setYear: "Définir l'Année",
      saveProfile: "Sauvegarder", loadProfile: "Charger", exportProfile: "Exporter vers un handout", importProfile: "Importer depuis un handout", month: "Mois",
      language: "Langue", profiles: "Profils", manualMode: "Mode Manuel", type: "Type", temp: "Temp",
      windSpeed: "Vent", back: "Retour", yes: "Oui", no: "Non", humidityShort: "Humidité"
    }
  };

  // Translation functions
  const lang = () => state.WeatherMod?.language || 'en';
  const t = (key) => i18n[lang()]?.[key] || key;
  const tClimate = (key) => i18n[lang()].climateNames?.[key] || key;
  const tPhase = (key) => i18n[lang()].moonPhases?.[key] || key;
  const tWindDir = (key) => i18n[lang()].windDirections?.[key] || key;
  const tWindForce = (key) => i18n[lang()].windForces?.[key] || key;
  const tSeason = (key) => i18n[lang()].seasonNames?.[key] || key;

  // Icons
  const climateIcons = { temperate: "🌳", desert: "🏜️", jungle: "🌴", cold: "❄️" };
  const seasonIcons = { spring: "🌼", summer: "☀️", fall: "🍂", winter: "❄️" };
  const moonIcons = {
    "New": "🌑", "Crescent": "🌒", "First Quarter": "🌓", "Gibbous": "🌔", "Full": "🌕",
    "Gibbous Waning": "🌖", "Last Quarter": "🌗", "Crescent Waning": "🌘"
  };
  const skyIcons = { clear: "☀️", rain: "🌧️", snow: "❄️", thunderstorm: "⛈️" };

  const tempIcon = (t) => t < -10 ? "🧊" : t < 0 ? "🥶" : t < 10 ? "❄️" : t < 20 ? "🌤️" : t < 30 ? "☀️" : t < 40 ? "🔥" : "🌋";
  const humidityIcon = (h) => h < 20 ? "🌵" : h < 40 ? "💨" : h < 60 ? "🌤️" : h < 80 ? "💧" : "🌫️";
  const windSpeedIcon = (s) => s <= 5 ? "🌬️" : s <= 20 ? "🍃" : s <= 40 ? "💨" : s <= 70 ? "🌪️" : s <= 100 ? "🌬️🌩️" : "🌀";

  // Utility functions
  const getSeason = () => {
    const m = state.WeatherMod.calendar.month;
    return CalendarConfig.seasons.find(s => s.months.includes(m))?.name || "spring";
  };

  const getMoonPhases = (day) => MoonConfig.moons.map(m => {
    const idx = Math.floor((day % m.cycle) / m.cycle * m.phases.length);
    return `${m.name}: ${m.phases[idx]}`;
  });

  const randomWeighted = (table) => {
    const total = Object.values(table).reduce((a, b) => a + b, 0);
    let roll = randomInteger(total);
    for (const key in table) {
      roll -= table[key];
      if (roll <= 0) return key;
    }
  };

  const randomRangeFromList = (ranges) => {
    const [min, max] = ranges[Math.floor(Math.random() * ranges.length)];
    return randomInteger(max - min + 1) + min - 1;
  };

  const clearOldWeatherMessages = () => {
    sendChat("WeatherMod", `<div style="margin:5px 0; border-top:2px dotted #926239;"></div>`);
  };

  // Build the full weather report HTML
  const buildFullWeatherReportHTML = () => {
    const c = state.WeatherMod.calendar;
    const dayName = CalendarConfig.days[(c.day - 1) % CalendarConfig.days.length];
    const monthName = CalendarConfig.months[c.month].name;
    const season = getSeason();
    const s = state.WeatherMod.settings;
    const climate = WeatherConfig.climates[state.WeatherMod.selectedClimate];

    let temp, humidity, windSpeed, windOrigin, windForce, precipType, precipStrength;

    if (s.useManualWeather) {
      temp = s.manualWeather.temperature;
      windSpeed = s.manualWeather.windSpeed;
      windOrigin = s.manualWeather.windDirection;
      precipType = s.manualWeather.type;
      humidity = s.manualWeather.humidity !== undefined ? s.manualWeather.humidity : "-";
      windForce = { name: tWindForce("Manual") };
      precipStrength = `${skyIcons[precipType] || ""} ${t(precipType)}`;
    } else {
      humidity = randomInteger(climate.humidity[1] - climate.humidity[0]) + climate.humidity[0];
      windOrigin = randomWeighted(climate.windChances);
      const forceKey = randomWeighted(Object.fromEntries(Object.entries(WeatherConfig.windForce).map(([k, v]) => [k, v.chance])));
      windForce = WeatherConfig.windForce[forceKey];
      windSpeed = randomInteger(windForce.speed[1] - windForce.speed[0]) + windForce.speed[0];
      temp = randomRangeFromList(climate.temperature[season]);
      precipType = randomWeighted(climate.precipitation[season]);

      if (precipType === 'rain') {
        precipStrength = (temp <= 0)
          ? `❄️ ${t('snow')} (${randomWeighted(WeatherConfig.precipitationStrength.snow)})`
          : `🌧️ ${t('rain')} (${randomWeighted(WeatherConfig.precipitationStrength.rain)})`;
      } else if (precipType === 'thunderstorm') {
        precipStrength = `⛈️ ${t('thunderstorm')} (${randomWeighted(WeatherConfig.precipitationStrength.thunderstorm)})`;
      } else {
        precipStrength = `☀️ ${t('clear')}`;
      }
    }

    const moon = getMoonPhases(c.totalDays).map(m => {
      const [name, phase] = m.split(": ");
      return `${moonIcons[phase] || "🌑"} ${name}: ${tPhase(phase)}`;
    }).join("<br>");

    let html = `<div style="${chatStyle}">`;
    html += `<div style="${styleTitle}">${t('weather')}</div>`;
    html += `<div><b>${t('date')}:</b> ${lang() === 'fr' ? `${dayName} ${c.day} ${monthName} ${c.year}` : `${monthName} ${c.day}, ${c.year} (${dayName})`}</div>`;
    html += `<div style="${styleSection}">${t('season')}:</div> ${seasonIcons[season]} ${tSeason(season)}`;
    html += `${hr}<div style="${styleSection}">${t('moon')}:</div><div>${moon}</div>${hr}`;
    html += `<div style="${styleSection}">${t('climate')}:</div> ${climateIcons[state.WeatherMod.selectedClimate]} ${tClimate(state.WeatherMod.selectedClimate)}`;
    html += `<div><b>${t('temperature')}:</b> ${temp}°C ${tempIcon(temp)}</div>`;
    html += `<div><b>${t('humidity')}:</b> ${humidity}${humidity !== "-" ? "%" : ""} ${humidity !== "-" ? humidityIcon(humidity) : ""}</div>`;
    html += `<div><b>${t('wind')}:</b> ${tWindForce(windForce.name)} (${windSpeed} km/h) ${t('windFrom')} ${tWindDir(windOrigin)} ${windSpeedIcon(windSpeed)}</div>`;
    html += `<div><b>${t('precipitation')}:</b> ${precipStrength}</div>`;
    html += `</div>`;
    return html;
  };

  const displayFullReport = () => {
    clearOldWeatherMessages();
    sendChat("WeatherMod", `/w gm ${buildFullWeatherReportHTML()}`);
  };

  const showWeatherToPlayers = () => {
    sendChat("WeatherMod", buildFullWeatherReportHTML());
  };

  // Styled menus
  const showGMMainMenu = () => {
    const s = state.WeatherMod;
    const climates = Object.keys(WeatherConfig.climates).map(climate =>
      `<a style="${btnStyle}" href="!weather setgm climate ${climate}">${climateIcons[climate]} ${tClimate(climate)}</a>`
    ).join(" ");

    const html = `<div style="${chatStyle}">
      <div style="${styleTitle}">${t('weather')}</div>${hr}
      <div style="${styleSection}">${t('climate')}:</div> ${climateIcons[s.selectedClimate]} ${tClimate(s.selectedClimate)}<br>
      ${btnGroup(climates)}${hr}
      <div style="${styleSection}">${t('language')}:</div> ${s.language.toUpperCase()}<br>
      ${btnGroup(`<a style="${btnStyle}" href="!weather lang en">EN</a> <a style="${btnStyle}" href="!weather lang fr">FR</a>`)}${hr}
      ${btnGroup(`<a style="${btnStyle}" href="!weather menu-date">📅 ${t('date')}</a>`)}
      ${btnGroup(`<a style="${btnStyle}" href="!weather menu-manual">🛠 ${t('manual')}</a>`)}
      ${btnGroup(`<a style="${btnStyle}" href="!weather menu-profiles">💾 ${t('profiles')}</a>`)}
      ${btnGroup(`<a style="${btnStyle}" href="!weather report">🌦 ${t('generate')}</a>`)}
      ${btnGroup(`<a style="${btnStyle}" href="!weather showplayers">📣 ${t('weather')} → Players</a>`)}
    </div>`;
    sendChat("WeatherMod", `/w gm ${html}`);
  };

  const showDateMenu = () => {
    const c = state.WeatherMod.calendar;
    const months = CalendarConfig.months.map((m, i) =>
      `<a style="${btnStyle}" href="!weather setgm month ${i}">${m.name}</a>`
    ).join(" ");
    const html = `<div style="${chatStyle}">
      <div style="${styleTitle}">${t('date')}</div>${hr}
      ${btnGroup(`<a style="${btnStyle}" href="!weather setgm day ?{${t('setDay')}|${c.day}}">${t('setDay')}</a> <a style="${btnStyle}" href="!weather setgm year ?{${t('setYear')}|${c.year}}">${t('setYear')}</a>`)}
      ${hr}${btnGroup(months)}${hr}
      ${btnGroup(`<a style="${btnStyle}" href="!weather menu">⬅️ ${t('back')}</a>`)}
    </div>`;
    sendChat("WeatherMod", `/w gm ${html}`);
  };

  const showManualWeatherMenu = () => {
    const manual = state.WeatherMod.settings.manualWeather;
    const weatherTypes = ['clear', 'rain', 'snow', 'thunderstorm'].map(type =>
      `<a style="${btnStyle}" href="!weather setgm weathertype ${type}">${skyIcons[type]} ${t(type)}</a>`
    ).join(" ");
    const windDirs = ['north', 'east', 'south', 'west'].map(dir =>
      `<a style="${btnStyle}" href="!weather setgm winddir ${dir}">${tWindDir(dir)}</a>`
    ).join(" ");

    const html = `<div style="${chatStyle}">
      <div style="${styleTitle}">${t('manual')}</div>${hr}
      <div style="${styleSection}">${t('manualMode')}:</div> <a style="${btnStyle}" href="!weather setgm manual ${state.WeatherMod.settings.useManualWeather ? "off" : "on"}">${state.WeatherMod.settings.useManualWeather ? "🟢" : "🔴"} ${state.WeatherMod.settings.useManualWeather ? t('yes') : t('no')}</a><br><br>
      <div style="${styleSection}">${t('precipitation')}:</div>${btnGroup(weatherTypes)}<br>
      <div><b>${t('temperature')}:</b> <a style="${btnStyle}" href="!weather setgm temp ?{${t('temperature')}|${manual.temperature}}">${manual.temperature}°C</a></div>
      <div><b>${t('windSpeed')}:</b> <a style="${btnStyle}" href="!weather setgm windspeed ?{${t('wind')}|${manual.windSpeed}}">${manual.windSpeed} km/h</a></div>
      <div><b>${t('windFrom')}:</b> ${btnGroup(windDirs)}</div>
      <div><b>${t('humidityShort')}:</b> <a style="${btnStyle}" href="!weather setgm humidity ?{${t('humidity')}|${manual.humidity !== undefined ? manual.humidity : 50}}">${manual.humidity !== undefined ? manual.humidity : 50}%</a></div>
      ${hr}${btnGroup(`<a style="${btnStyle}" href="!weather menu">⬅️ ${t('back')}</a>`)}
    </div>`;
    sendChat("WeatherMod", `/w gm ${html}`);
  };

  const showProfilesMenu = () => {
    const html = `<div style="${chatStyle}">
      <div style="${styleTitle}">${t('profiles')}</div>${hr}
      ${btnGroup(`
        <a style="${btnStyle}" href="!weather save ?{Profile name}">${t('saveProfile')}</a><br>
        <a style="${btnStyle}" href="!weather load ?{Profile name}">${t('loadProfile')}</a><br>
        <a style="${btnStyle}" href="!weather export ?{Profile name}">${t('exportProfile')}</a><br>
        <a style="${btnStyle}" href="!weather import ?{Profile name}">${t('importProfile')}</a><br>`)}
      ${hr}${btnGroup(`<a style="${btnStyle}" href="!weather menu">⬅️ ${t('back')}</a>`)}
    </div>`;
    sendChat("WeatherMod", `/w gm ${html}`);
  };

  // Weather profiles
  const saveWeatherProfile = (name) => {
    if (!name) return;
    state.WeatherMod.profiles[name] = {
      language: state.WeatherMod.language,
      selectedClimate: state.WeatherMod.selectedClimate,
      calendar: { ...state.WeatherMod.calendar },
      settings: JSON.parse(JSON.stringify(state.WeatherMod.settings))
    };
  };

  const loadWeatherProfile = (name) => {
    if (!name || !state.WeatherMod.profiles[name]) return;
    const data = state.WeatherMod.profiles[name];
    state.WeatherMod.language = data.language;
    state.WeatherMod.selectedClimate = data.selectedClimate;
    state.WeatherMod.calendar = { ...data.calendar };
    state.WeatherMod.settings = JSON.parse(JSON.stringify(data.settings));
  };

  // Import a weather profile from a handout
  const importProfileFromHandout = (name) => {
    const handout = findObjs({ type: "handout", name: `WeatherProfile_${name}` })[0];
    if (!handout) {
      sendChat('WeatherMod', `/w gm [${name}] Handout not found / Handout introuvable.`);
      return;
    }
    handout.get('notes', (notes) => {
      // Try to extract JSON from the handout notes (between <pre>...</pre> or after a marker)
      let jsonMatch = notes.match(/<pre>([\s\S]+?)<\/pre>/) || notes.match(/<!--JSON-->([\s\S]+)$/);
      let json;
      if (jsonMatch) {
        try {
          json = JSON.parse(jsonMatch[1]);
        } catch (e) {
          sendChat('WeatherMod', `/w gm Error: Invalid JSON in handout / JSON invalide dans le handout.`);
          return;
        }
      } else {
        sendChat('WeatherMod', `/w gm No JSON found in handout / Aucun JSON trouvé dans le handout.`);
        return;
      }
      // Save imported profile
      state.WeatherMod.profiles[name] = json;
      sendChat('WeatherMod', `/w gm Profile "${name}" imported from handout / Profil "${name}" importé depuis le handout.`);
      showGMMainMenu();
    });
  };

  // Export profile to handout
  const exportProfileToHandout = (name) => {
    const profile = state.WeatherMod.profiles[name];
    if (!profile) return;

    // Save JSON in <pre> for easy import
    const html = `
      <b>${t('profiles')}:</b> ${name}<br>
      <b>${t('climate')}:</b> ${tClimate(profile.selectedClimate)}<br>
      <b>${t('date')}:</b> ${profile.calendar.day} ${CalendarConfig.months[profile.calendar.month].name} ${profile.calendar.year}<br>
      <b>${t('language')}:</b> ${profile.language}<br>
      <b>${t('manualMode')}:</b> ${profile.settings.useManualWeather ? t('yes') : t('no')}<br>
      ${profile.settings.useManualWeather ? `
        <b>${t('type')}:</b> ${t(profile.settings.manualWeather.type)}<br>
        <b>${t('temp')}:</b> ${profile.settings.manualWeather.temperature}°C<br>
        <b>${t('windSpeed')}:</b> ${profile.settings.manualWeather.windSpeed} km/h ${t('windFrom')} ${tWindDir(profile.settings.manualWeather.windDirection)}<br>
        <b>${t('humidityShort')}:</b> ${profile.settings.manualWeather.humidity !== undefined ? profile.settings.manualWeather.humidity : 50}%<br>
      ` : ''}
      <hr>
      <b>JSON:</b>
      <pre>${JSON.stringify(profile, null, 2)}</pre>
      <!--JSON-->${JSON.stringify(profile)}
    `;

    let handout = findObjs({ type: "handout", name: `WeatherProfile_${name}` })[0];
    if (!handout) {
      handout = createObj("handout", { name: `WeatherProfile_${name}` });
    }
    handout.set({ notes: html });
  };

  // Advance one day
  const advanceDay = () => {
    const c = state.WeatherMod.calendar;
    c.day++;
    c.totalDays++;
    const max = CalendarConfig.months[c.month].length;
    if (c.day > max) {
      c.day = 1;
      c.month++;
      if (c.month >= CalendarConfig.months.length) {
        c.month = 0;
        c.year++;
      }
    }
  };

  // State initialization
  if (!state.WeatherMod) {
    state.WeatherMod = {
      language: 'fr',
      selectedClimate: 'temperate',
      calendar: { day: 1, month: 0, year: 1000, totalDays: 0 },
      settings: {
        useManualWeather: false,
        manualWeather: { type: "clear", windDirection: "north", temperature: 20, windSpeed: 10, humidity: 50 }
      },
      profiles: {}
    };
  }

  // Chat commands
  on('chat:message', (msg) => {
    if (msg.type !== 'api' || !playerIsGM(msg.playerid)) return;

    const args = msg.content.trim().split(" ");
    const command = args[0];
    const subcommand = args[1];
    const value = args.slice(2).join(" ");

    if (command !== '!weather') return;

    switch (subcommand) {
      case 'report': displayFullReport(); break;
      case 'showplayers': showWeatherToPlayers(); break;
      case 'menu': showGMMainMenu(); break;
      case 'menu-date': showDateMenu(); break;
      case 'menu-manual': showManualWeatherMenu(); break;
      case 'menu-profiles': showProfilesMenu(); break;
      
      case 'next':
      case 'next-day':
        advanceDay();
        displayFullReport();
        break;

      case 'lang':
        if (['en', 'fr'].includes(args[2])) {
          state.WeatherMod.language = args[2];
          sendChat("WeatherMod", `/w gm ${t('language')} : ${args[2].toUpperCase()}`);
        } else {
          sendChat("WeatherMod", `/w gm ${t('language')}: en, fr`);
        }
        break;

      case 'setgm': {
        const param = args[2];
        const val = args.slice(3).join(" ");
        const s = state.WeatherMod;
        const manual = s.settings.manualWeather;

        switch (param) {
          case 'climate':
            if (val in WeatherConfig.climates) s.selectedClimate = val;
            break;
          case 'manual':
            s.settings.useManualWeather = (val === 'on');
            break;
          case 'weathertype':
            manual.type = val;
            break;
          case 'winddir':
            manual.windDirection = val;
            break;
          case 'temp':
            const tval = parseInt(val, 10);
            if (!isNaN(tval)) manual.temperature = tval;
            break;
          case 'windspeed':
            const wval = parseInt(val, 10);
            if (!isNaN(wval)) manual.windSpeed = wval;
            break;
          case 'humidity':
            const hval = parseInt(val, 10);
            if (!isNaN(hval)) manual.humidity = hval;
            break;
          case 'day':
            const d = parseInt(val, 10);
            if (!isNaN(d)) s.calendar.day = d;
            break;
          case 'month':
            const m = parseInt(val, 10);
            if (!isNaN(m)) s.calendar.month = m;
            break;
          case 'year':
            const y = parseInt(val, 10);
            if (!isNaN(y)) s.calendar.year = y;
            break;
        }
        showGMMainMenu();
        break;
      }

      case 'save':
        if (!value.trim()) {
          sendChat('WeatherMod', `/w gm ${t('saveProfile')} : !weather save MonProfil`);
        } else {
          saveWeatherProfile(value.trim());
          sendChat('WeatherMod', `/w gm ${t('saveProfile')}: <b>${value.trim()}</b>`);
        }
        break;

      case 'load':
        if (!value.trim()) {
          sendChat('WeatherMod', `/w gm ${t('loadProfile')} : !weather load MonProfil`);
        } else {
          loadWeatherProfile(value.trim());
          sendChat('WeatherMod', `/w gm ${t('loadProfile')}: <b>${value.trim()}</b>`);
          showGMMainMenu();
        }
        break;

      case 'export':
        if (!value.trim()) {
          sendChat('WeatherMod', `/w gm ${t('exportProfile')} : !weather export MonProfil`);
        } else {
          exportProfileToHandout(value.trim());
          sendChat('WeatherMod', `/w gm ${t('exportProfile')}: <b>WeatherProfile_${value.trim()}</b>`);
        }
        break;

      case 'import':
        if (!value.trim()) {
          sendChat('WeatherMod', `/w gm ${t('importProfile')} : !weather import MonProfil`);
        } else {
          importProfileFromHandout(value.trim());
          showGMMainMenu();
        }
        break;
    }
  });
});
