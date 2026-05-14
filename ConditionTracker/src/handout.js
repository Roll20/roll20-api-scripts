import {
  HANDOUT_NAME,
  LOGO_URL_512,
  SCRIPT_NAME,
  SCRIPT_VERSION,
  CONDITION_DATA,
  DEFAULT_MARKERS,
} from "./constants.js";
import {
  getLocale,
  getLocalizedLanguageName,
  isRtlLocale,
  LOCALE_DEFINITIONS,
  t,
  tRaw,
} from "./i18n.js";
import { escapeHtml, queryObjects } from "./utils.js";

const STYLE = {
  outer:
    "font-family:'Georgia',serif;background-color:#0A0A12;color:#E6DFFF;padding:24px;border-radius:8px;",
  header:
    "background:linear-gradient(135deg,#5B21B6 0%,#FF4D6D 100%);padding:18px 24px;border-radius:6px;margin-bottom:24px;text-align:center;",
  h1: "color:#FFFFFF;margin:0;font-size:1.6em;font-family:'Georgia',serif;letter-spacing:1px;",
  subtitle:
    "color:#E9D5FF;margin:6px 0 0;font-size:0.85em;letter-spacing:0.5px;",
  h2: "color:#FF4D6D;font-family:'Georgia',serif;border-bottom:1px solid #5B21B6;padding-bottom:6px;margin-top:24px;",
  h2first:
    "color:#FF4D6D;font-family:'Georgia',serif;border-bottom:1px solid #5B21B6;padding-bottom:6px;margin-top:0;",
  body: "color:#B8AFCF;line-height:1.6;margin-top:0;",
  intro: "color:#B8AFCF;font-size:0.9em;margin-top:0;",
  table:
    "width:100%;border-collapse:collapse;font-size:0.9em;margin-bottom:8px;",
  tableSmall: "width:100%;border-collapse:collapse;font-size:0.85em;",
  thRow: "background-color:#1E40AF;",
  th: "padding:7px 10px;text-align:left;color:#E9D5FF;font-weight:bold;",
  thW42:
    "padding:7px 10px;text-align:left;color:#E9D5FF;font-weight:bold;width:42%;",
  thW30:
    "padding:7px 10px;text-align:left;color:#E9D5FF;font-weight:bold;width:30%;",
  thW50:
    "padding:7px 10px;text-align:left;color:#E9D5FF;font-weight:bold;width:50%;",
  thW40:
    "padding:7px 10px;text-align:left;color:#E9D5FF;font-weight:bold;width:40%;",
  tdA: "padding:7px 10px;background-color:#12122a;border-radius:4px;font-family:monospace;color:#E9D5FF;white-space:nowrap;width:45%;",
  tdB: "padding:7px 10px;color:#B8AFCF;",
  tdEven:
    "padding:6px 10px;font-family:monospace;color:#E9D5FF;background-color:#12122a;",
  tdOdd:
    "padding:6px 10px;font-family:monospace;color:#E9D5FF;background-color:#0e0e22;",
  tdDescEven: "padding:6px 10px;color:#B8AFCF;background-color:#12122a;",
  tdDescOdd: "padding:6px 10px;color:#B8AFCF;background-color:#0e0e22;",
  tdCondEven: "padding:7px 10px;color:#E6DFFF;background-color:#12122a;",
  tdCondOdd: "padding:7px 10px;color:#E6DFFF;background-color:#0e0e22;",
  spacer: "padding:3px;",
  footer:
    "margin-top:28px;padding-top:14px;border-top:1px solid #5B21B6;text-align:center;color:#B8AFCF;font-size:0.8em;",
  footerP: "margin:0;line-height:1.8;",
  code: "background-color:#1a1a2e;padding:1px 4px;border-radius:2px;",
};

/**
 * Returns the alternating row background color.
 *
 * @param {boolean} even Whether the row is even.
 * @returns {string} Hex color for the row background.
 */
function row(even) {
  return even ? "#12122a" : "#0e0e22";
}

/**
 * Builds inline text direction styles for localized handouts.
 *
 * @param {string} locale Locale code.
 * @returns {string} Inline CSS direction and alignment.
 */
function getDirectionStyle(locale) {
  return isRtlLocale(locale)
    ? "direction:rtl;text-align:right;"
    : "direction:ltr;text-align:left;";
}

/**
 * Returns the localized table header style.
 *
 * @param {string} locale Locale code.
 * @returns {string} Inline CSS for table headers.
 */
function getThStyle(locale) {
  return isRtlLocale(locale)
    ? STYLE.th.replace("text-align:left", "text-align:right")
    : STYLE.th;
}

/**
 * Builds a two-column or three-column handout table.
 *
 * @param {string[]} headers Table header labels.
 * @param {string[][]} rows Table rows.
 * @param {string[]} [widths] Optional column widths.
 * @param {string} locale Locale code.
 * @returns {string} Table HTML.
 */
function buildTable(headers, rows, widths, locale) {
  const thCells = headers
    .map((h, i) => {
      const w = widths?.[i] ? `width:${widths[i]};` : "";
      return `<th style="${getThStyle(locale)}${w}">${h}</th>`;
    })
    .join("");
  const bodyRows = rows
    .map((cells, ri) => {
      const bg = row(ri % 2 === 0);
      const tds = cells
        .map((cell, ci) => {
          const isFirst = ci === 0;
          const style = isFirst
            ? `padding:6px 10px;font-family:monospace;color:#E9D5FF;background-color:${bg};`
            : `padding:6px 10px;color:#B8AFCF;background-color:${bg};`;
          return `<td style="${style}">${cell}</td>`;
        })
        .join("");
      return `<tr>${tds}</tr>`;
    })
    .join("");
  return `<table style="${STYLE.tableSmall}"><thead><tr style="${STYLE.thRow}">${thCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
}

/**
 * Builds the standard D&D conditions table.
 *
 * @param {string} colLabel Header label for condition columns.
 * @param {string} locale Locale code.
 * @returns {string} Condition table HTML.
 */
function buildConditionTable(colLabel, locale) {
  const standardConditions = [
    "Blinded",
    "Charmed",
    "Frightened",
    "Grappled",
    "Incapacitated",
    "Invisible",
    "Paralyzed",
    "Petrified",
    "Poisoned",
    "Prone",
    "Restrained",
    "Stunned",
    "Unconscious",
  ];
  const left = standardConditions.slice(0, 7);
  const right = standardConditions.slice(7);
  const maxRows = Math.max(left.length, right.length);
  const rows = [];
  for (let i = 0; i < maxRows; i++) {
    const l = left[i] ? `${CONDITION_DATA[left[i]].emoji} ${left[i]}` : "";
    const r = right[i] ? `${CONDITION_DATA[right[i]].emoji} ${right[i]}` : "";
    const bg = row(i % 2 === 0);
    rows.push(
      `<tr><td style="padding:7px 10px;color:#E6DFFF;background-color:${bg};">${escapeHtml(l)}</td>` +
        `<td style="padding:7px 10px;color:#E6DFFF;background-color:${bg};">${escapeHtml(r)}</td></tr>`,
    );
  }

  const thStyle = `${getThStyle(locale)}width:50%;`;
  const safeLabel = escapeHtml(colLabel);
  return `<table style="${STYLE.tableSmall}"><thead><tr style="${STYLE.thRow}"><th style="${thStyle}">${safeLabel}</th><th style="${thStyle}">${safeLabel}</th></tr></thead><tbody>${rows.join("")}</tbody></table>`;
}

/**
 * Builds the default status marker mapping table.
 *
 * @param {string} colCondition Condition column label.
 * @param {string} colMarker Marker column label.
 * @param {string} locale Locale code.
 * @returns {string} Marker table HTML.
 */
function buildMarkersTable(colCondition, colMarker, locale) {
  const entries = Object.entries(DEFAULT_MARKERS);
  const rows = entries
    .map(([condition, marker], i) => {
      const data = CONDITION_DATA[condition];
      const emoji = data ? data.emoji : "";
      const bg = row(i % 2 === 0);
      return (
        `<tr>` +
        `<td style="padding:6px 10px;color:#E6DFFF;background-color:${bg};">${escapeHtml(emoji)} ${escapeHtml(condition)}</td>` +
        `<td style="padding:6px 10px;font-family:monospace;color:#B8AFCF;background-color:${bg};">${escapeHtml(marker)}</td>` +
        `</tr>`
      );
    })
    .join("");
  return (
    `<table style="${STYLE.tableSmall}"><thead><tr style="${STYLE.thRow}">` +
    `<th style="${getThStyle(locale)}width:50%;">${escapeHtml(colCondition)}</th>` +
    `<th style="${getThStyle(locale)}">${escapeHtml(colMarker)}</th>` +
    `</tr></thead><tbody>${rows}</tbody></table>`
  );
}

/**
 * Builds the quick-start command table.
 *
 * @param {string} colCommand Command column label.
 * @param {string} colDesc Description column label.
 * @param {string[][]} rows Quick-start rows.
 * @returns {string} Quick-start table HTML.
 */
function buildQuickStartTable(colCommand, colDesc, rows) {
  const bodyRows = rows
    .map(([cmd, desc], i) => {
      const bg = row(i % 2 === 0);
      return (
        `<tr>` +
        `<td style="padding:7px 10px;background-color:${bg};border-radius:4px;font-family:monospace;color:#E9D5FF;white-space:nowrap;width:45%;">${cmd}</td>` +
        `<td style="padding:7px 10px;color:#B8AFCF;background-color:${bg};">${desc}</td>` +
        `<tr><td colspan="2" style="${STYLE.spacer}"></td></tr>`
      );
    })
    .join("");
  return `<table style="${STYLE.table}"><tbody>${bodyRows}</tbody></table>`;
}

/**
 * Builds a Twemoji asset URL for a locale flag.
 *
 * @param {string} flag Unicode regional-indicator flag.
 * @returns {string} SVG asset URL or an empty string.
 */
function flagAssetUrl(flag) {
  const codepoints = Array.from(String(flag || "").trim())
    .map((character) => character.codePointAt(0).toString(16))
    .join("-");
  return codepoints
    ? `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codepoints}.svg`
    : "";
}

/**
 * Builds an accessible flag image label for a locale.
 *
 * @param {object} locale Locale metadata.
 * @returns {string} Trusted locale flag HTML.
 */
function buildLocaleFlag(locale) {
  const label = escapeHtml(locale.flagLabel || locale.name);
  const url = flagAssetUrl(locale.flag);
  if (!url) {
    return "";
  }
  return `<img src="${escapeHtml(url)}" alt="${label}" title="${label}" style="width:1.1em;height:1.1em;vertical-align:-0.15em;margin-right:4px;" />`;
}

/**
 * Builds a display label for a locale in the current handout language.
 *
 * @param {object} locale Locale metadata.
 * @param {string} displayLocale Locale to use for the language name.
 * @returns {string} Locale label HTML.
 */
function buildLocaleLabel(locale, displayLocale) {
  return `${buildLocaleFlag(locale)} ${escapeHtml(locale.code)} — ${escapeHtml(getLocalizedLanguageName(locale.code, displayLocale))}`;
}

/**
 * Builds the available translations table.
 *
 * @param {string} locale Locale code for table direction.
 * @returns {string} Locale table HTML.
 */
function buildLocalesTable(locale) {
  const rows = LOCALE_DEFINITIONS.map((definition) => [
    `<span style="${STYLE.code}">${escapeHtml(definition.code)}</span>`,
    buildLocaleLabel(definition, locale),
  ]);
  return buildTable(
    [
      t("handout.availableLocales.colLocale", locale),
      t("handout.availableLocales.colLanguage", locale),
    ],
    rows,
    ["24%", "76%"],
    locale,
  );
}

/**
 * Builds the command reference section.
 *
 * @param {(key: string) => string} hs Handout string lookup.
 * @param {(key: string) => *} hr Handout raw value lookup.
 * @param {string} locale Locale code.
 * @returns {string} Section HTML.
 */
function buildCommandsReferenceSection(hs, hr, locale) {
  const rows = hr("commandsRef.rows");
  return `<h2 style="${STYLE.h2}">${hs("commandsRef.heading")}</h2>
    ${buildTable([hs("commandsRef.colFlag"), hs("commandsRef.colDesc")], rows, ["42%"], locale)}`;
}

/**
 * Builds the custom effect type section.
 *
 * @param {(key: string) => string} hs Handout string lookup.
 * @param {(key: string) => *} hr Handout raw value lookup.
 * @param {string} locale Locale code.
 * @returns {string} Section HTML.
 */
function buildCustomEffectsSection(hs, hr, locale) {
  const rows = hr("customEffects.rows");
  return `<h2 style="${STYLE.h2}">${hs("customEffects.heading")}</h2>
    ${buildTable([hs("customEffects.colType"), hs("customEffects.colNotes")], rows, ["30%"], locale)}`;
}

/**
 * Builds the duration option section.
 *
 * @param {(key: string) => string} hs Handout string lookup.
 * @param {(key: string) => *} hr Handout raw value lookup.
 * @param {string} locale Locale code.
 * @returns {string} Section HTML.
 */
function buildDurationOptionsSection(hs, hr, locale) {
  const rows = hr("durationOptions.rows");
  return `<h2 style="${STYLE.h2}">${hs("durationOptions.heading")}</h2>
    <p style="${STYLE.intro}">${hs("durationOptions.intro")}</p>
    ${buildTable([hs("durationOptions.colOption"), hs("durationOptions.colBehaviour")], rows, ["40%"], locale)}`;
}

/**
 * Builds the configuration section.
 *
 * @param {(key: string) => string} hs Handout string lookup.
 * @param {(key: string) => *} hr Handout raw value lookup.
 * @param {string} locale Locale code.
 * @returns {string} Section HTML.
 */
function buildConfigurationSection(hs, hr, locale) {
  const rows = hr("configuration.rows");
  const threeCol = rows
    .map(([opt, vals, desc], i) => {
      const bg = row(i % 2 === 0);
      return (
        `<tr>` +
        `<td style="padding:6px 10px;font-family:monospace;color:#E9D5FF;background-color:${bg};">${opt}</td>` +
        `<td style="padding:6px 10px;color:#B8AFCF;background-color:${bg};">${vals}</td>` +
        `<td style="padding:6px 10px;color:#B8AFCF;background-color:${bg};">${desc}</td>` +
        `</tr>`
      );
    })
    .join("");
  return (
    `<h2 style="${STYLE.h2}">${hs("configuration.heading")}</h2>
    <p style="${STYLE.intro}">${hs("configuration.intro")}</p>
    <table style="${STYLE.tableSmall}"><thead><tr style="${STYLE.thRow}">` +
    `<th style="${getThStyle(locale)}width:30%;">${hs("configuration.colOption")}</th>` +
    `<th style="${getThStyle(locale)}width:25%;">${hs("configuration.colValues")}</th>` +
    `<th style="${getThStyle(locale)}">${hs("configuration.colDesc")}</th>` +
    `</tr></thead><tbody>${threeCol}</tbody></table>`
  );
}

/**
 * Applies all handout fields that Condition Tracker owns.
 *
 * @param {object} handout Roll20 handout object.
 * @param {string} html Handout notes HTML.
 * @returns {void}
 */
function updateHandoutObject(handout, html) {
  handout.set({
    name: HANDOUT_NAME,
    inplayerjournals: "",
    controlledby: "",
  });
  handout.set("notes", html);
}

/**
 * Generates the full help handout HTML for the given locale.
 *
 * @param {string} [locale] Output locale.
 * @returns {string} HTML string.
 */
function buildHandoutHtml(locale) {
  const lang = getLocale(locale);
  const version = SCRIPT_VERSION;
  const directionStyle = getDirectionStyle(lang);
  /**
   * Looks up a handout string for the active locale.
   *
   * @param {string} key Handout translation key.
   * @returns {string} Translated text.
   */
  const hs = (key) => t(`handout.${key}`, lang);
  /**
   * Looks up raw handout data for the active locale.
   *
   * @param {string} key Handout translation key.
   * @returns {*} Raw translated value.
   */
  const hr = (key) => tRaw(`handout.${key}`, lang);

  const overview = `
    <h2 style="${STYLE.h2first}">${hs("overview.heading")}</h2>
    <p style="${STYLE.body}">${hs("overview.body")}</p>`;

  const quickStart = `
    <h2 style="${STYLE.h2}">${hs("quickStart.heading")}</h2>
    ${buildQuickStartTable(hs("quickStart.colCommand"), hs("quickStart.colDesc"), hr("quickStart.rows"))}`;

  const commandsRef = buildCommandsReferenceSection(hs, hr, lang);

  const standardConds = `
    <h2 style="${STYLE.h2}">${hs("standardConditions.heading")}</h2>
    ${buildConditionTable(hs("standardConditions.colCondition"), lang)}`;

  const customEffects = buildCustomEffectsSection(hs, hr, lang);

  const durationOpts = buildDurationOptionsSection(hs, hr, lang);

  const config = buildConfigurationSection(hs, hr, lang);

  const markers = `
    <h2 style="${STYLE.h2}">${hs("defaultMarkers.heading")}</h2>
    ${buildMarkersTable(hs("defaultMarkers.colCondition"), hs("defaultMarkers.colMarker"), lang)}`;

  const availableLocales = `
    <h2 style="${STYLE.h2}">${hs("availableLocales.heading")}</h2>
    <p style="${STYLE.intro}">${hs("availableLocales.intro")}</p>
    ${buildLocalesTable(lang)}`;

  const footer = `
    <div style="${STYLE.footer}">
      <p style="${STYLE.footerP}">${SCRIPT_NAME} ${version} &nbsp;•&nbsp; ${hs("footerNote")}</p>
    </div>`;

  return `<div style="${STYLE.outer}${directionStyle}">
    <div style="${STYLE.header}">
      <img src="${LOGO_URL_512}" style="max-width:220px;height:auto;margin-bottom:10px;display:block;margin-left:auto;margin-right:auto;" alt="${SCRIPT_NAME} logo" title="${SCRIPT_NAME}" />
      <h1 style="${STYLE.h1}">${SCRIPT_NAME}</h1>
      <p style="${STYLE.subtitle}">${hs("versionLabel")} ${version} &nbsp;•&nbsp; ${hs("subtitle")}</p>
    </div>
    ${overview}${quickStart}${commandsRef}${standardConds}${customEffects}${durationOpts}${config}${availableLocales}${markers}${footer}
  </div>`;
}

/**
 * Creates the help handout on first run, or updates its notes on every subsequent startup.
 * Duplicate handouts with the same name are removed.
 *
 * @param {string} [locale] Output locale.
 * @returns {void}
 */
export function installHandout(locale) {
  const html = buildHandoutHtml(locale);
  const existing = queryObjects({ _type: "handout", name: HANDOUT_NAME });

  if (existing.length === 0) {
    const handout = createObj("handout", {
      name: HANDOUT_NAME,
    });
    updateHandoutObject(handout, html);
    log(`${SCRIPT_NAME}: Help handout created.`);
    return;
  }

  const [primary, ...duplicates] = existing;
  updateHandoutObject(primary, html);
  for (const dup of duplicates) {
    dup.remove();
  }

  const cleanupNote =
    duplicates.length > 0 ? ` Removed ${duplicates.length} duplicate(s).` : "";
  log(`${SCRIPT_NAME}: Help handout updated.${cleanupNote}`);
}
