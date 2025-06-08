on('ready', () => {
    // Chat Style - Customize here
    const chatStyle = 'border:1px solid #000; background-color:#926239; padding:5px; border-radius:5px; height: fit-content;';
    
    // 🌦️ Weather Config with all climates - You can customize if you have your own matrice
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
    
    // 📅 Calendar Config - You can customized it
    const CalendarConfig = {
    days: ["Rilmor", "Eretor", "Nauri", "Neldir", "Veltor", "Eltor", "Mernach"],
    months: [
      { name: "Juras", length: 31 },
      { name: "Fevnir", length: 28 },
      { name: "Morsir", length: 31 },
      { name: "Avalis", length: 30 },
      { name: "Maï", length: 31 },
      { name: "Jurn", length: 30 },
      { name: "Jullirq", length: 31 },
      { name: "Aors", length: 31 },
      { name: "Septibir", length: 30 },
      { name: "Octors", length: 31 },
      { name: "Noval", length: 30 },
      { name: "Devenir", length: 31 }
    ],
    seasons: [ //If you want to modify the season name, do it further down in the code in the translations 
      { name: "spring", months: [2, 3, 4] },
      { name: "summer", months: [5, 6, 7] },
      { name: "fall", months: [8, 9, 10] },
      { name: "winter", months: [11, 0, 1] }
    ]
    };
    
    // 🌘 Moon Config - You can customized it (you can add moons respecting the defined format)
    const MoonConfig = {
    moons: [
      {
        name: "Lunara",
        cycle: 28,
        phases: ["New", "Crescent", "First Quarter", "Gibbous", "Full", "Gibbous Waning", "Last Quarter", "Crescent Waning"]
      },
      {
        name: "Virell",
        cycle: 35,
        phases: ["New", "First Quarter", "Full", "Last Quarter"]
      }
    ]
    };
    
    // Localization + helpers remain unchanged from earlier (t, tClimate, etc.)
    // Localization Strings
    const i18n = {
    en: {
      climateNames: {
        temperate: "Temperate",
        desert: "Desert",
        jungle: "Jungle",
        cold: "Cold"
      },
      moonPhases: {
        "New": "New",
        "Crescent": "Crescent",
        "First Quarter": "First Quarter",
        "Gibbous": "Gibbous",
        "Full": "Full",
        "Gibbous Waning": "Gibbous Waning",
        "Last Quarter": "Last Quarter",
        "Crescent Waning": "Crescent Waning"
      },
      windDirections: {
        north: "North",
        south: "South",
        east: "East",
        west: "West"
      },
      windForces: {
        "Slight Breeze": "Slight Breeze",
        "Nice Breeze": "Nice Breeze",
        "Strong Wind": "Strong Wind",
        "Storm": "Storm",
        "Violent Storm": "Violent Storm",
        "Hurricane": "Hurricane"
      },
      seasonNames: { // Modify the seasons names here for english
        spring: "Spring",
        summer: "Summer",
        fall: "Autumn",
        winter: "Winter"
      },
      date: "Date",
      season: "Season",
      moon: "Moon Phases",
      weather: "Weather Report",
      climate: "Climate",
      temperature: "Temperature",
      humidity: "Humidity",
      wind: "Wind",
      precipitation: "Precipitation",
      clear: "Clear",
      rain: "Rain",
      snow: "Snow",
      thunderstorm: "Thunderstorm",
      windFrom: "from",
      manual: "Manual Weather Mode",
      generate: "Generate Weather",
      setDay: "Set Day",
      setYear: "Set Year",
      saveProfile: "Save Current",
      loadProfile: "Load",
      exportProfile: "Export to Handout"
    },
    fr: {
      climateNames: {
        temperate: "Tempéré",
        desert: "Désertique",
        jungle: "Jungle",
        cold: "Froid"
      },
      moonPhases: {
        "New": "Nouvelle lune",
        "Crescent": "Premier croissant",
        "First Quarter": "Premier quartier",
        "Gibbous": "Gibbeuse croissante",
        "Full": "Pleine lune",
        "Gibbous Waning": "Gibbeuse décroissante",
        "Last Quarter": "Dernier quartier",
        "Crescent Waning": "Dernier croissant"
      },
      windDirections: {
        north: "Nord",
        south: "Sud",
        east: "Est",
        west: "Ouest"
      },
      windForces: {
        "Slight Breeze": "Brise légère",
        "Nice Breeze": "Brise agréable",
        "Strong Wind": "Vent fort",
        "Storm": "Tempête",
        "Violent Storm": "Tempête violente",
        "Hurricane": "Ouragan"
      },
      seasonNames: { // Modify the seasons names here for french
        spring: "Floreas",
        summer: "Solarios",
        fall: "Mornevent",
        winter: "Hilveris"
      },
      date: "Date",
      season: "Saison",
      moon: "Phases lunaires",
      weather: "Météo du jour",
      climate: "Climat",
      temperature: "Température",
      humidity: "Humidité",
      wind: "Vent",
      precipitation: "Précipitations",
      clear: "Clair",
      rain: "Pluie",
      snow: "Neige",
      thunderstorm: "Orage",
      windFrom: "de",
      manual: "Mode météo manuel",
      generate: "Générer la météo",
      setDay: "Définir le jour",
      setYear: "Définir l'année",
      saveProfile: "Sauvegarder",
      loadProfile: "Charger",
      exportProfile: "Exporter vers un handout"
    }
    };
    
    // Language Helpers
    const lang = () => state.WeatherMod?.language || 'en';
    const t = (key) => i18n[lang()]?.[key] || key;
    const tClimate = (key) => i18n[lang()].climateNames?.[key] || key;
    const tPhase = (phase) => i18n[lang()].moonPhases?.[phase] || phase;
    const tWindDir = (dir) => i18n[lang()].windDirections?.[dir] || dir;
    const tWindForce = (force) => i18n[lang()].windForces?.[force] || force;
    const tSeason = (season) => i18n[lang()].seasonNames?.[season] || season;
    
    const formatDate = () => {
      const c = state.WeatherMod.calendar;
      const dayName = CalendarConfig.days[(c.day - 1) % CalendarConfig.days.length];
      const monthName = CalendarConfig.months[c.month].name;
    
      if (lang() === 'fr') {
        return `${dayName} ${c.day} ${monthName} ${c.year}`;
      } else {
        return `${monthName} ${c.day}, ${c.year} (${dayName})`;
      }
    };
    
    // 🌍 Climate icons
    const climateIcons = {
      temperate: "🌳",
      desert: "🏜️",
      jungle: "🌴",
      cold: "❄️"
    };
    
    // 🍂 Season icons
    const seasonIcons = {
      spring: "🌼",
      summer: "☀️",
      fall: "🍂",
      winter: "❄️"
    };
    
    // 🌘 Moon phase icons
    const moonIcons = {
      "New": "🌑",
      "Crescent": "🌒",
      "First Quarter": "🌓",
      "Gibbous": "🌔",
      "Full": "🌕",
      "Gibbous Waning": "🌖",
      "Last Quarter": "🌗",
      "Crescent Waning": "🌘"
    };
    
    // ☀️ Sky/weather condition icons
    const skyIcons = {
      clear: "☀️",
      rain: "🌧️",
      snow: "❄️",
      thunderstorm: "⛈️"
    };
    
    // 🌡️ Temperature icon by interval
    const tempIcon = (temp) => {
      if (temp < -10) return "🧊";
      if (temp < 0 && temp >= -10) return "🥶";
      if (temp < 10 && temp >= 0) return "❄️";
      if (temp < 20 && temp >= 10) return "🌤️";
      if (temp < 30 && temp >= 20) return "☀️";
      if (temp < 40 && temp >= 30) return "🔥";
      if (temp >= 40) return "🌋";
      return "❓";
    };
    
    // 💧 Humidity icon by interval
    const humidityIcon = (humidity) => {
      if (humidity < 20) return "🌵";
      if (humidity < 40 && humidity >= 20) return "💨";
      if (humidity < 60 && humidity >= 40) return "🌤️";
      if (humidity < 80 && humidity >= 60) return "💧";
      if (humidity >= 80) return "🌫️";
      return "❓";
    };
    
    // 💨 Wind speed icon by interval
    const windSpeedIcon = (speed) => {
      if (speed <= 5 && speed >= 0) return "🌬️";
      if (speed <= 20 && speed > 5) return "🍃";
      if (speed <= 40 && speed > 20) return "💨";
      if (speed <= 70 && speed > 40) return "🌪️";
      if (speed <= 100 && speed > 70) return "🌬️🌩️";
      if (speed > 100) return "🌀";
      return "❓";
    };
    
    // Clears old GM messages by inserting a visual separator
    const clearOldWeatherMessages = () => {
        sendChat("WeatherMod", "/w gm <div style='margin:5px 0; border-top:2px dotted #926239;'></div>");
    };
    
    // Initialize default campaign state
    if (!state.WeatherMod) {
        state.WeatherMod = {
            language: 'fr',
            selectedClimate: 'temperate',
            calendar: {
                day: 17,
                month: 10,
                year: 3533,
                totalDays: 0
            },
            settings: {
                useManualWeather: false,
                manualWeather: {
                type: "clear",
                windDirection: "north",
                temperature: 20,
                windSpeed: 10
                }
            },
            profiles: {}
        };
    }
    
    // Advance the calendar by one day
    const advanceDay = () => {
        const c = state.WeatherMod.calendar;
        c.day++;
        c.totalDays++;
        const monthData = CalendarConfig.months[c.month];
        if (c.day > monthData.length) {
        c.day = 1;
        c.month++;
        if (c.month >= CalendarConfig.months.length) {
            c.month = 0;
            c.year++;
        }
        }
    };
    
    // Determine the current season from the month
    const getSeason = () => {
        const monthIndex = state.WeatherMod.calendar.month;
        const season = CalendarConfig.seasons.find(s => s.months.includes(monthIndex));
        return season ? season.name : 'spring'; // valeur par défaut
    };

    
    // Calculate the current moon phases
    const getMoonPhases = (day) => {
        return MoonConfig.moons.map(moon => {
        const phaseIndex = Math.floor((day % moon.cycle) / moon.cycle * moon.phases.length);
        return `${moon.name}: ${tPhase(moon.phases[phaseIndex])}`;
        });
    };
    
    // Select a weighted random key from a table
    const randomWeighted = (table) => {
        const total = Object.values(table).reduce((a, b) => a + b, 0);
        let roll = randomInteger(total);
        for (let key in table) {
        roll -= table[key];
        if (roll <= 0) return key;
        }
        return Object.keys(table)[0];
    };
    
    // Pick a random number from a list of min-max ranges
    const randomRangeFromList = (ranges) => {
        const [min, max] = ranges[Math.floor(Math.random() * ranges.length)];
        return randomInteger(max - min + 1) + min - 1;
    };
    
    // 🌦 Generate the weather report (manual or randomized)
    const generateWeather = () => {
    const s = state.WeatherMod.settings;
    const season = getSeason();
    const climate = WeatherConfig.climates[state.WeatherMod.selectedClimate];
    if (!climate) return '⚠ Invalid climate';
    
    if (s.useManualWeather) {
        return `
            <b>${t('temperature')}:</b> ${s.manualWeather.temperature}°C<br>
            <b>${t('wind')}:</b> ${s.manualWeather.windSpeed} km/h ${t('windFrom')} ${tWindDir(s.manualWeather.windDirection)}<br>
            <b>${t('precipitation')}:</b> ${t(s.manualWeather.type)}
        `;
    }
    
    const humidity = randomInteger(climate.humidity[1] - climate.humidity[0]) + climate.humidity[0];
    const windOrigin = randomWeighted(climate.windChances);
    const windForceKey = randomWeighted(
        Object.fromEntries(Object.entries(WeatherConfig.windForce).map(([k, v]) => [k, v.chance]))
    );
    const windForce = WeatherConfig.windForce[windForceKey];
    const windSpeed = randomInteger(windForce.speed[1] - windForce.speed[0]) + windForce.speed[0];
    const temperature = randomRangeFromList(climate.temperature[season]);
    const precipType = randomWeighted(climate.precipitation[season]);
    
    let precipStrength = '';
    if (precipType === 'rain') {
        precipStrength = (temperature <= 0)
            ? `❄️ ${t('snow')} (${randomWeighted(WeatherConfig.precipitationStrength.snow)})`
            : `🌧️ ${t('rain')} (${randomWeighted(WeatherConfig.precipitationStrength.rain)})`;
    } else if (precipType === 'thunderstorm') {
        precipStrength = `⛈️ ${t('thunderstorm')} (${randomWeighted(WeatherConfig.precipitationStrength.thunderstorm)})`;
    } else {
        precipStrength = `☀️ ${t('clear')}`;
    }
    
    return `
        <b>${t('climate')}:</b> ${climateIcons[state.WeatherMod.selectedClimate] || ""} ${tClimate(state.WeatherMod.selectedClimate)}<br>
        <b>${t('season')}:</b> ${seasonIcons[season] || ""} ${tSeason(season)}<br>
        <b>${t('temperature')}:</b> ${temperature}°C<br>
        <b>${t('humidity')}:</b> ${humidity}%<br>
        <b>${t('wind')}:</b> ${tWindForce(windForce.name)} (${windSpeed} km/h) ${t('windFrom')} ${tWindDir(windOrigin)}<br>
        <b>${t('precipitation')}:</b> ${precipStrength}
        `;
    };

    const buildFullWeatherReportHTML = () => {
        const c = state.WeatherMod.calendar;
        const dayName = CalendarConfig.days[(c.day - 1) % CalendarConfig.days.length];
        const monthName = CalendarConfig.months[c.month].name;
        const season = getSeason();
        const s = state.WeatherMod.settings;
        const climate = WeatherConfig.climates[state.WeatherMod.selectedClimate];

        let temperature, humidity, windSpeed, windOrigin, windForceKey, windForce, precipType, precipStrength;

        if (s.useManualWeather) {
            temperature = s.manualWeather.temperature;
            windSpeed = s.manualWeather.windSpeed;
            windOrigin = s.manualWeather.windDirection;
            precipType = s.manualWeather.type;
            humidity = "-";
            windForce = { name: tWindForce("Manual") };
            precipStrength = `${skyIcons[precipType] || ""} ${t(precipType)}`;
        } else {
            humidity = randomInteger(climate.humidity[1] - climate.humidity[0]) + climate.humidity[0];
            windOrigin = randomWeighted(climate.windChances);
            windForceKey = randomWeighted(
            Object.fromEntries(Object.entries(WeatherConfig.windForce).map(([k, v]) => [k, v.chance]))
            );
            windForce = WeatherConfig.windForce[windForceKey];
            windSpeed = randomInteger(windForce.speed[1] - windForce.speed[0]) + windForce.speed[0];
            if (climate.temperature && climate.temperature[season]) {
            temperature = randomRangeFromList(climate.temperature[season]);
            } else {
            log(`⚠️ Température manquante pour le climat "${state.WeatherMod.selectedClimate}" et la saison "${season}"`);
            temperature = 0;
            }
            precipType = randomWeighted(climate.precipitation[season]);

            if (precipType === 'rain') {
            precipStrength = (temperature <= 0)
                ? `❄️ ${t('snow')} (${randomWeighted(WeatherConfig.precipitationStrength.snow)})`
                : `🌧️ ${t('rain')} (${randomWeighted(WeatherConfig.precipitationStrength.rain)})`;
            } else if (precipType === 'thunderstorm') {
            precipStrength = `⛈️ ${t('thunderstorm')} (${randomWeighted(WeatherConfig.precipitationStrength.thunderstorm)})`;
            } else {
            precipStrength = `☀️ ${t('clear')}`;
            }
        }

        const moon = getMoonPhases(c.totalDays)
            .map(m => {
            const [name, phase] = m.split(": ");
            return `${moonIcons[phase] || "🌑"} ${name}: ${tPhase(phase)}`;
            })
            .join("<br>");

        let output = `<div style="${chatStyle}">`;
        output += `<div><b>📅 ${t('date')}:</b> ${lang() === 'fr' ? `${dayName} ${c.day} ${monthName} ${c.year}` : `${monthName} ${c.day}, ${c.year} (${dayName})`}</div>`;
        output += `<div><b>🗓 ${t('season')}:</b> ${seasonIcons[season] || ""} ${tSeason(season)}</div>`;
        output += `<hr><div><b>🌘 ${t('moon')}:</b><br>${moon}</div>`;
        output += `<hr><div><b>🌦 ${t('weather')}:</b></div>`;
        output += `<div><b>${t('climate')}:</b> ${climateIcons[state.WeatherMod.selectedClimate] || ""} ${tClimate(state.WeatherMod.selectedClimate)}</div>`;
        output += `<div><b>${t('season')}:</b> ${seasonIcons[season] || ""} ${tSeason(season)}</div>`;
        output += `<div><b>${t('temperature')}:</b> ${temperature}°C ${tempIcon(temperature)}</div>`;
        output += `<div><b>${t('humidity')}:</b> ${humidity}${humidity !== "-" ? "%" : ""} ${humidity !== "-" ? humidityIcon(humidity) : ""}</div>`;
        output += `<div><b>${t('wind')}:</b> ${tWindForce(windForce.name)} (${windSpeed} km/h) ${t('windFrom')} ${tWindDir(windOrigin)} ${windSpeedIcon(windSpeed)}</div>`;
        output += `<div><b>${t('precipitation')}:</b> ${precipStrength}</div>`;
        output += `</div>`;

        return output;
    };
    
    // Display full weather report to the GM
    const displayFullReport = () => {
        clearOldWeatherMessages();
        const output = buildFullWeatherReportHTML();
        sendChat("WeatherMod", `/w gm ${output}`);
    };

    // Display report for players
    const showWeatherToPlayers = () => {
        const output = buildFullWeatherReportHTML();
        sendChat("WeatherMod", output); // public message
    };
    
    // GM Menu: Weather Control Panel
    const showGMMenu = () => {
        clearOldWeatherMessages();

        const s = state.WeatherMod;
        const c = s.calendar;
        const set = s.settings;
        const manual = set.manualWeather;

        // Buttons
        const climates = Object.keys(WeatherConfig.climates).map(climate =>
            `[${climateIcons[climate] || ""} ${tClimate(climate)}](!weather setgm climate ${climate})`
        ).join("&nbsp;&nbsp;");

        const months = CalendarConfig.months.map((m, i) =>
            `[${m.name}](!weather setgm month ${i})`
        ).join("&nbsp;&nbsp;");

        const weatherTypes = ['clear', 'rain', 'snow', 'thunderstorm'].map(type =>
            `[${skyIcons[type] || ""} ${t(type)}](!weather setgm weathertype ${type})`
        ).join("&nbsp;&nbsp;");

        const windDirs = ['north', 'east', 'south', 'west'].map(dir =>
            `[${tWindDir(dir)}](!weather setgm winddir ${dir})`
        ).join("&nbsp;&nbsp;");

        // Message build
        let output = `<div style="${chatStyle}">`;
        output += `<div style="text-align:center; font-size:1.2em;"><b>⚙️ GM Weather Menu</b></div><hr>`;

        // Date
        output += `<b>📅 ${t('date')}:</b> ${lang() === 'fr'
            ? `${CalendarConfig.days[(c.day - 1) % CalendarConfig.days.length]} ${c.day} ${CalendarConfig.months[c.month].name} ${c.year}`
            : `${CalendarConfig.months[c.month].name} ${c.day}, ${c.year} (${CalendarConfig.days[(c.day - 1) % CalendarConfig.days.length]})`}<br>`;

        output += `<div style="margin:2px 0; text-align:center;">
            [${t('setDay')}](!weather setgm day ?{${t('setDay')}|${c.day}})&nbsp;&nbsp;
            [${t('setYear')}](!weather setgm year ?{${t('setYear')}|${c.year}})
        </div>`;

        output += `<div style="margin:2px 0; text-align:center;">${months}</div><hr>`;

        // Climate
        output += `<b>🌍 ${t('climate')}:</b> ${climateIcons[s.selectedClimate] || ""} ${tClimate(s.selectedClimate)}<br>`;
        output += `<div style="margin:2px 0; text-align:center;">${climates}</div><hr>`;

        // Manual mode
        output += `<b>🛠 ${t('manual')}:</b> [${set.useManualWeather ? "🟢 On" : "🔴 Off"}](!weather setgm manual ${set.useManualWeather ? "off" : "on"})<br>`;

        if (set.useManualWeather) {
            output += `<hr><b>☁️ ${t('precipitation')}:</b>`;
            output += `<div style="margin:2px 0; text-align:center;">${weatherTypes}</div>`;

            output += `<b>🌡 ${t('temperature')}:</b> 
            [${tempIcon(manual.temperature)} ${manual.temperature}°C](!weather setgm temp ?{${t('temperature')}|${manual.temperature}})<br>`;

            output += `<b>💨 ${t('wind')}:</b> 
            [${windSpeedIcon(manual.windSpeed)} ${manual.windSpeed} km/h](!weather setgm windspeed ?{${t('wind')}|${manual.windSpeed}})<br>`;

            output += `<b>${t('windFrom')}:</b> 
            <div style="margin:2px 0; text-align:center;">${windDirs}</div>`;
        }

        // Profiles
        output += `<hr><b>💾 Profiles:</b>`;
        output += `<div style="margin:2px 0; text-align:center;">
            [${t('saveProfile')}](!weather save ?{Profile name})&nbsp;&nbsp;
            [${t('loadProfile')}](!weather load ?{Profile name})&nbsp;&nbsp;
            [${t('exportProfile')}](!weather export ?{Profile name})
        </div>`;

        // Language
        output += `<hr><div style="margin:2px 0; text-align:center;">
            🌐 Language: [EN](!weather lang en)&nbsp;&nbsp;[FR](!weather lang fr)
        </div>`;

        // Generate
        output += `<hr><div style="margin:2px 0; text-align:center;">
            [🌦 ${t('generate')}](!weather report)
        </div>`;

        output += `<hr><div style="text-align:center;">
            [📣 ${t('weather')} → Players](!weather showplayers)
        </div>`;

        output += `</div>`;

        sendChat("WeatherMod", `/w gm ${output}`);
    };


    // Save the current weather setup
    const saveWeatherProfile = (name) => {
        if (!name) return;
        state.WeatherMod.profiles[name] = {
            language: state.WeatherMod.language,
            selectedClimate: state.WeatherMod.selectedClimate,
            calendar: { ...state.WeatherMod.calendar },
            settings: JSON.parse(JSON.stringify(state.WeatherMod.settings))
        };
    };
    
    // Load a saved weather profile
    const loadWeatherProfile = (name) => {
        if (!name || !state.WeatherMod.profiles[name]) return;
        const data = state.WeatherMod.profiles[name];
        state.WeatherMod.language = data.language;
        state.WeatherMod.selectedClimate = data.selectedClimate;
        state.WeatherMod.calendar = { ...data.calendar };
        state.WeatherMod.settings = JSON.parse(JSON.stringify(data.settings));
    };
    
    // Export a profile to a Roll20 handout
    const exportProfileToHandout = (name) => {
      const profile = state.WeatherMod.profiles[name];
      if (!profile) return;
    
      const html = `
        <b>📋 Weather Profile:</b> ${name}<br>
        <b>🌍 Climate:</b> ${tClimate(profile.selectedClimate)}<br>
        <b>📆 Date:</b> ${profile.calendar.day} / ${CalendarConfig.months[profile.calendar.month].name} / ${profile.calendar.year}<br>
        <b>🌐 Language:</b> ${profile.language}<br>
        <b>⚙️ Manual Weather:</b> ${profile.settings.useManualWeather ? "Yes" : "No"}<br>
        ${profile.settings.useManualWeather ? `
          <b>🌡 Temp:</b> ${profile.settings.manualWeather.temperature}°C<br>
          <b>💨 Wind:</b> ${profile.settings.manualWeather.windSpeed} km/h from ${tWindDir(profile.settings.manualWeather.windDirection)}<br>
          <b>☁️ Type:</b> ${t(profile.settings.manualWeather.type)}<br>
        ` : ''}
      `;
    
      let handout = findObjs({ type: "handout", name: `WeatherProfile_${name}` })[0];
      if (!handout) {
        handout = createObj("handout", { name: `WeatherProfile_${name}` });
      }
      handout.set({ notes: html });
    };
    
    // Handle weather-related API commands
    on('chat:message', (msg) => {
        if (msg.type !== 'api' || !playerIsGM(msg.playerid)) return;
        
        const args = msg.content.trim().split(" ");
        const command = args[0];
        const subcommand = args[1];
        
        if (command !== '!weather') return;
        
        switch (subcommand) {
            case 'report':
            displayFullReport();
            break;
        
            case 'next':
            case 'next-day':
                advanceDay();
                displayFullReport();
                break;
        
            case 'menu':
                showGMMenu();
                break;
        
            case 'lang': {
                const langCode = args[2];
                if (langCode && ['en', 'fr'].includes(langCode)) {
                    state.WeatherMod.language = langCode;
                    sendChat('WeatherMod', `/w gm 🌐 Language set to: ${langCode === 'fr' ? 'Français' : 'English'}`);
                } else {
                    sendChat('WeatherMod', `/w gm ⚠️ Invalid language. Use 'en' or 'fr'.`);
                }
                break;
            }
        
            case 'setgm': {
                const param = args[2];
                const value = args.slice(3).join(" ");
                const s = state.WeatherMod;
                const manual = s.settings.manualWeather;
            
                switch (param) {
                    case 'climate':
                    if (value in WeatherConfig.climates) s.selectedClimate = value;
                    break;
                    case 'manual':
                    s.settings.useManualWeather = (value === 'on');
                    break;
                    case 'weathertype':
                    manual.type = value;
                    break;
                    case 'winddir':
                    manual.windDirection = value;
                    break;
                    case 'temp': {
                    const temp = parseInt(value, 10);
                    if (!isNaN(temp)) manual.temperature = temp;
                    break;
                    }
                    case 'windspeed': {
                    const wind = parseInt(value, 10);
                    if (!isNaN(wind)) manual.windSpeed = wind;
                    break;
                    }
                    case 'day': {
                    const day = parseInt(value, 10);
                    if (!isNaN(day)) s.calendar.day = day;
                    break;
                    }
                    case 'month': {
                    const month = parseInt(value, 10);
                    if (!isNaN(month)) s.calendar.month = month;
                    break;
                    }
                    case 'year': {
                    const year = parseInt(value, 10);
                    if (!isNaN(year)) s.calendar.year = year;
                    break;
                    }
                }
            
                showGMMenu();
                break;
            }
        
            case 'save': {
                const saveName = args.slice(2).join(" ").trim();
                if (!saveName) {
                    sendChat('WeatherMod', `/w gm ⚠️ Provide a name to save: !weather save MyScene`);
                } else {
                    saveWeatherProfile(saveName);
                    sendChat('WeatherMod', `/w gm ✅ Saved profile: <b>${saveName}</b>`);
                }
                break;
            }
        
            case 'load': {
                const loadName = args.slice(2).join(" ").trim();
                if (!loadName) {
                    sendChat('WeatherMod', `/w gm ⚠️ Provide a name to load: !weather load MyScene`);
                } else {
                    loadWeatherProfile(loadName);
                    sendChat('WeatherMod', `/w gm 📂 Loaded profile: <b>${loadName}</b>`);
                    showGMMenu();
                }
                break;
            }
        
            case 'export': {
                const exportName = args.slice(2).join(" ").trim();
                if (!exportName) {
                    sendChat('WeatherMod', `/w gm ⚠️ Provide a name to export: !weather export MyScene`);
                } else {
                    exportProfileToHandout(exportName);
                    sendChat('WeatherMod', `/w gm 📝 Exported to handout: <b>WeatherProfile_${exportName}</b>`);
                }
                break;
            }

            case 'showplayers':
                showWeatherToPlayers();
                break;
        }
    });
});