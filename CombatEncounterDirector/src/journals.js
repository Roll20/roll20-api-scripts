import {
  BOSS_PRESETS,
  COLOR_ACCENT,
  COLOR_BORDER,
  COLOR_BUTTON_TEXT,
  COLOR_HEADER_BG,
  COLOR_HEADER_TEXT,
  COLOR_MUTED,
  COMMAND,
  DECK_VIEW_KEYS,
  DECK_VIEWS,
  DEFAULT_DECK_VIEW,
  DUPLICATE_OPTIONS,
  JOURNAL_PANEL_NAME,
  JOURNAL_STATUS_NAME,
  PARTY_PRESETS,
  SCRIPT_NAME,
  SCRIPT_VERSION,
} from './constants.js';
import { buildButton, buildCard, buildSecondaryButton, buildTable } from './chat.js';
import { LOCALE_DEFINITIONS, t } from './i18n.js';
import { getConfig } from './state.js';
import { escapeHtml } from './utils.js';

// ---------------------------------------------------------------------------
// Style constants shared across journal sections
// ---------------------------------------------------------------------------

// The active tab is a chat-style primary button that cannot be clicked
const BTN_TAB_ACTIVE = [
  `background:${COLOR_ACCENT}`,
  `color:${COLOR_BUTTON_TEXT}`,
  'padding:2px 7px',
  'border-radius:3px',
  'font-weight:bold',
  'font-size:0.9em',
  'display:inline-block',
  'margin:1px 2px',
].join(';');

// Each section is headed like a chat card's title bar
const SECTION_HEADER = [
  `background:${COLOR_HEADER_BG}`,
  `color:${COLOR_HEADER_TEXT}`,
  'padding:3px 8px',
  `border-bottom:2px solid ${COLOR_ACCENT}`,
  'font-variant:small-caps',
  'font-weight:bold',
  'text-align:center',
  'letter-spacing:0.05em',
  'margin:8px 0 3px 0',
].join(';');

const SECTION_BODY = 'padding:2px 4px 4px 4px';

const SECTION_DESC_STYLE = [
  `color:${COLOR_MUTED}`,
  'font-size:0.8em',
  'padding:1px 6px 5px 6px',
  'line-height:1.4',
].join(';');

const DIVIDER = `<hr style="border:none;border-top:1px solid ${COLOR_BORDER};margin:4px 0">`;

/**
 * Builds a primary action button anchor.
 *
 * @param {string} label Button text.
 * @param {string} command !ced command.
 * @param {boolean} [dark=false] Use dark/secondary button style.
 * @returns {string} HTML anchor string.
 */
function btn(label, command, dark) {
  return dark ? buildSecondaryButton(label, command) : buildButton(label, command);
}

/**
 * Builds a section header div.
 *
 * @param {string} title Section title.
 * @returns {string} HTML div string.
 */
function section(title) {
  return `<div style="${SECTION_HEADER}">${escapeHtml(title)}</div>`;
}

/**
 * Builds a section description paragraph — shown directly beneath the section
 * heading and above the first row of buttons.
 *
 * @param {string} text Description text (plain, will be escaped).
 * @returns {string} HTML div string.
 */
function desc(text) {
  return `<div style="${SECTION_DESC_STYLE}">${escapeHtml(text)}</div>`;
}

// ---------------------------------------------------------------------------
// Deck tab bar
// ---------------------------------------------------------------------------

/**
 * Returns the i18n label for a deck view key.
 *
 * @param {string} key Deck view key.
 * @param {string} lang Locale code.
 * @returns {string} Translated label.
 */
function deckViewLabel(key, lang) {
  const map = {
    all: t('ui.deckViewAll', lang),
    scaling: t('ui.deckViewScaling', lang),
    positioning: t('ui.deckViewPositioning', lang),
    admin: t('ui.deckViewAdmin', lang),
  };
  return map[key] || DECK_VIEWS[key]?.label || key;
}

/**
 * Builds the pseudo-tab row shown at the top of every Command Deck view.
 * The active tab is a non-clickable highlighted span; inactive tabs are buttons.
 *
 * @param {string} activeView Currently active deck view key.
 * @param {string} lang Locale code.
 * @returns {string} HTML string.
 */
function buildDeckTabs(activeView, lang) {
  const tabs = DECK_VIEW_KEYS.map((key) => {
    const label = deckViewLabel(key, lang);
    if (key === activeView) {
      return `<span style="${BTN_TAB_ACTIVE}">${escapeHtml(label)}</span>`;
    }
    return btn(label, `${COMMAND} deck ${key}`, true);
  });
  return `<div style="padding:4px 4px 2px 4px">${tabs.join('')}</div>`;
}

// ---------------------------------------------------------------------------
// Section renderers
// ---------------------------------------------------------------------------

/**
 * Builds the quick-actions section with preset scaling and boss buttons.
 *
 * @param {string} lang Locale code.
 * @returns {string} HTML string.
 */
function buildQuickActionsSection(lang) {
  const partyPresetButtons = Object.entries(PARTY_PRESETS).map(([key, preset]) =>
    btn(preset.label, `${COMMAND} scale preset ${key}`)
  );
  const bossPresetButtons = Object.entries(BOSS_PRESETS).map(([key, preset]) =>
    btn(preset.label, `${COMMAND} boss ${key}`)
  );

  return [
    section(t('ui.quickActions', lang)),
    desc(t('ui.quickActionsDesc', lang)),
    `<div style="${SECTION_BODY}"><div>`,
    ...partyPresetButtons,
    '</div><div style="margin-top:3px">',
    ...bossPresetButtons,
    '</div></div>',
  ].join('');
}

/**
 * Builds the party scaling section with preset and party-size controls.
 *
 * @param {string} lang Locale code.
 * @returns {string} HTML string.
 */
function buildPartyScalingSection(lang) {
  const presetButtons = Object.entries(PARTY_PRESETS).map(([key, preset]) =>
    btn(preset.label, `${COMMAND} scale preset ${key}`)
  );
  const sizeButtons = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map((size) =>
    btn(String(size), `${COMMAND} scale party ${size}`, true)
  );

  return [
    section(t('ui.partyScaling', lang)),
    desc(t('ui.partyScalingDesc', lang)),
    `<div style="${SECTION_BODY}">`,
    '<div style="margin-bottom:3px">',
    ...presetButtons,
    '</div>',
    `<div style="color:${COLOR_MUTED};font-size:0.8em;margin-bottom:2px">${escapeHtml(t('ui.partySizeLabel', lang))}</div>`,
    '<div>',
    ...sizeButtons,
    '</div></div>',
  ].join('');
}

/**
 * Builds the custom scaling section for HP/AC/damage adjustments.
 *
 * @param {string} lang Locale code.
 * @returns {string} HTML string.
 */
function buildCustomScalingSection(lang) {
  const hpButtons = [25, 50, 75, 100, 125, 150, 175, 200, 300].map((pct) =>
    btn(`${pct}%`, `${COMMAND} scale hp ${pct}`, pct === 100)
  );
  const acButtons = [-3, -2, -1, 0, 1, 2, 3, 4, 5].map((mod) => {
    const label = mod >= 0 ? `+${mod}` : String(mod);
    return btn(label, `${COMMAND} scale ac ${mod}`, mod === 0);
  });
  const damageButtons = [50, 75, 100, 125, 150, 200].map((pct) =>
    btn(`${pct}%`, `${COMMAND} scale damage ${pct}`, pct === 100)
  );

  return [
    section(t('ui.customScaling', lang)),
    desc(t('ui.customScalingDesc', lang)),
    `<div style="${SECTION_BODY}">`,
    `<div style="color:${COLOR_MUTED};font-size:0.8em">${escapeHtml(t('ui.hpPercentLabel', lang))}</div><div>`,
    ...hpButtons,
    '</div>',
    `<div style="color:${COLOR_MUTED};font-size:0.8em;margin-top:3px">${escapeHtml(t('ui.acModLabel', lang))}</div><div>`,
    ...acButtons,
    '</div>',
    `<div style="color:${COLOR_MUTED};font-size:0.8em;margin-top:3px">${escapeHtml(t('ui.damagePercentLabel', lang))}</div><div>`,
    ...damageButtons,
    '</div>',
    '</div>',
  ].join('');
}

/**
 * Builds the boss tools section.
 *
 * @param {string} lang Locale code.
 * @returns {string} HTML string.
 */
function buildBossToolsSection(lang) {
  const bossButtons = Object.entries(BOSS_PRESETS).map(([key, preset]) =>
    btn(preset.label, `${COMMAND} boss ${key}`)
  );

  return [
    section(t('ui.bossTools', lang)),
    desc(t('ui.bossToolsDesc', lang)),
    `<div style="${SECTION_BODY}"><div>`,
    ...bossButtons,
    '</div>',
    `<div style="color:${COLOR_MUTED};font-size:0.75em;margin-top:2px">${escapeHtml(t('ui.bossPresetHint', lang))}</div>`,
    '</div>',
  ].join('');
}

/**
 * Builds reinforcement controls for duplication and numbering.
 *
 * @param {string} lang Locale code.
 * @returns {string} HTML string.
 */
function buildReinforcementsSection(lang) {
  const duplicateButtons = DUPLICATE_OPTIONS.map((count) =>
    btn(`×${count}`, `${COMMAND} reinforce duplicate ${count}`)
  );
  const customDuplicateButton = btn(
    t('ui.customDuplicate', lang),
    `${COMMAND} reinforce duplicate ?{Copies|3}`
  );
  const autoNumberButton = btn(t('ui.autoNumber', lang), `${COMMAND} reinforce enumerate`, true);

  return [
    section(t('ui.reinforcements', lang)),
    desc(t('ui.reinforcementsDesc', lang)),
    `<div style="${SECTION_BODY}">`,
    `<div style="color:${COLOR_MUTED};font-size:0.8em">${escapeHtml(t('ui.duplicateSelected', lang))}</div><div>`,
    ...duplicateButtons,
    customDuplicateButton,
    '</div>',
    `<div style="margin-top:3px">${autoNumberButton}</div>`,
    '</div>',
  ].join('');
}

/**
 * Builds layer and visibility controls.
 *
 * @param {string} lang Locale code.
 * @returns {string} HTML string.
 */
function buildLayerVisibilitySection(lang) {
  const layerButtons = [
    btn(t('ui.tokenLayer', lang), `${COMMAND} layer token`),
    btn(t('ui.gmLayer', lang), `${COMMAND} layer gm`),
    btn(t('ui.mapLayer', lang), `${COMMAND} layer map`),
  ];
  const visibilityButtons = [
    btn(t('ui.hideSelected', lang), `${COMMAND} hide`),
    btn(t('ui.revealSelected', lang), `${COMMAND} reveal`),
  ];

  return [
    section(t('ui.layerVisibility', lang)),
    desc(t('ui.layerVisibilityDesc', lang)),
    `<div style="${SECTION_BODY}">`,
    `<div style="color:${COLOR_MUTED};font-size:0.8em">${escapeHtml(t('ui.moveToLayer', lang))}</div><div>`,
    ...layerButtons,
    '</div><div style="margin-top:3px">',
    ...visibilityButtons,
    '</div></div>',
  ].join('');
}

/**
 * Builds position save/restore controls.
 *
 * @param {string} lang Locale code.
 * @returns {string} HTML string.
 */
function buildPositionSavingSection(lang) {
  return [
    section(t('ui.positionSaving', lang)),
    desc(t('ui.positionSavingDesc', lang)),
    `<div style="${SECTION_BODY}"><div>`,
    btn(t('ui.savePositions', lang), `${COMMAND} position save`, true),
    btn(t('ui.restorePositions', lang), `${COMMAND} position restore`, true),
    '</div></div>',
  ].join('');
}

/**
 * Builds encounter template controls.
 *
 * @param {string} lang Locale code.
 * @returns {string} HTML string.
 */
function buildEncounterTemplatesSection(lang) {
  return [
    section(t('ui.encounterTemplates', lang)),
    desc(t('ui.encounterTemplatesDesc', lang)),
    `<div style="${SECTION_BODY}"><div>`,
    btn(
      t('ui.saveEncounter', lang),
      `${COMMAND} encounter save ?{${t('ui.encounterTemplates', lang)}|my-encounter}`
    ),
    btn(
      t('ui.loadEncounter', lang),
      `${COMMAND} encounter load ?{${t('ui.encounterTemplates', lang)}}`
    ),
    btn(
      t('ui.deleteEncounter', lang),
      `${COMMAND} encounter delete ?{${t('ui.encounterTemplates', lang)}}`,
      true
    ),
    btn(t('ui.listEncounters', lang), `${COMMAND} encounter list`, true),
    '</div></div>',
  ].join('');
}

/**
 * Builds reset and recovery controls.
 *
 * @param {string} lang Locale code.
 * @returns {string} HTML string.
 */
function buildResetRecoverySection(lang) {
  return [
    section(t('ui.resetRecovery', lang)),
    desc(t('ui.resetRecoveryDesc', lang)),
    `<div style="${SECTION_BODY}"><div>`,
    btn(t('ui.resetSelected', lang), `${COMMAND} reset selected`),
    btn(t('ui.resetPage', lang), `${COMMAND} reset page`),
    btn(t('ui.resetAll', lang), `${COMMAND} reset all`),
    '</div></div>',
  ].join('');
}

/**
 * Builds reporting controls.
 *
 * @param {string} lang Locale code.
 * @returns {string} HTML string.
 */
function buildReportingSection(lang) {
  return [
    section(t('ui.reporting', lang)),
    desc(t('ui.reportingDesc', lang)),
    `<div style="${SECTION_BODY}"><div>`,
    btn(t('ui.refreshReport', lang), `${COMMAND} report refresh`),
    btn(t('ui.selectedReport', lang), `${COMMAND} report selected`, true),
    btn(t('ui.changedReport', lang), `${COMMAND} report changed`, true),
    btn(t('ui.clearReport', lang), `${COMMAND} report clear`, true),
    '</div></div>',
  ].join('');
}

/**
 * Builds configuration controls for HP/AC bars.
 *
 * @param {string} lang Locale code.
 * @returns {string} HTML string.
 */
function buildConfigSection(lang) {
  const hpBarButtons = [
    btn('Bar 1', `${COMMAND} config hp-bar bar1`, true),
    btn('Bar 2', `${COMMAND} config hp-bar bar2`, true),
    btn('Bar 3', `${COMMAND} config hp-bar bar3`, true),
  ];
  const acBarButtons = [
    btn('Bar 1', `${COMMAND} config ac-bar bar1`, true),
    btn('Bar 2', `${COMMAND} config ac-bar bar2`, true),
    btn('Bar 3', `${COMMAND} config ac-bar bar3`, true),
    btn(t('ui.disableAc', lang), `${COMMAND} config ac-bar none`, true),
  ];
  // One button opens a drop-down of every language; the list below it shows what is available
  const languageQuery = LOCALE_DEFINITIONS.map((l) => `${l.nativeName || l.name},${l.code}`).join(
    '|'
  );
  // The same table as the other MidNite Shadow mods: flag and code, English name, native name.
  // The language in use is in bold.
  const languageTable = buildTable(
    [t('ui.languageCode', lang), t('ui.languageName', lang), t('ui.languageNative', lang)],
    LOCALE_DEFINITIONS.map((l) => {
      const bold = (html) => (l.code === lang ? `<b>${html}</b>` : html);
      return [
        `${buildLocaleFlag(l)}${bold(escapeHtml(l.code))}`,
        bold(escapeHtml(l.name)),
        bold(escapeHtml(l.nativeName || l.name)),
      ];
    })
  );

  return [
    section(t('ui.config', lang)),
    desc(t('ui.configDesc', lang)),
    `<div style="${SECTION_BODY}">`,
    `<div style="color:${COLOR_MUTED};font-size:0.8em">${escapeHtml(t('labels.hpBar', lang))}</div><div>`,
    ...hpBarButtons,
    '</div>',
    `<div style="color:${COLOR_MUTED};font-size:0.8em;margin-top:3px">${escapeHtml(t('labels.acBar', lang))}</div><div>`,
    ...acBarButtons,
    '</div>',
    `<div style="color:${COLOR_MUTED};font-size:0.8em;margin-top:3px">${escapeHtml(t('labels.language', lang))}</div><div>`,
    btn(
      `${t('labels.language', lang)} (${LOCALE_DEFINITIONS.length})`,
      `${COMMAND} config language ?{${t('labels.language', lang)}|${languageQuery}}`,
      true
    ),
    '</div>',
    `<div style="margin-top:4px">${languageTable}</div>`,
    '</div>',
  ].join('');
}

/**
 * Builds a Twemoji asset URL for a locale flag.
 *
 * @param {string} flag Unicode regional-indicator flag.
 * @returns {string} SVG asset URL or an empty string.
 */
function flagAssetUrl(flag) {
  const codepoints = Array.from(String(flag || '').trim())
    .map((character) => character.codePointAt(0).toString(16))
    .join('-');
  return codepoints
    ? `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codepoints}.svg`
    : '';
}

/**
 * Builds a flag image for a locale. An image is used because Roll20 on Windows
 * shows emoji flags as letter pairs.
 *
 * @param {object} locale Locale metadata.
 * @returns {string} Trusted locale flag HTML.
 */
function buildLocaleFlag(locale) {
  const label = escapeHtml(locale.flagLabel || locale.name);
  const url = flagAssetUrl(locale.flag);
  if (!url) {
    return '';
  }
  return `<img src="${escapeHtml(url)}" alt="${label}" title="${label}" style="width:1.1em;height:1.1em;vertical-align:-0.15em;margin-right:4px;" />`;
}

/**
 * Builds help and journal-maintenance controls.
 *
 * @param {string} lang Locale code.
 * @returns {string} HTML string.
 */
function buildHelpSection(lang) {
  return [
    section(t('ui.help', lang)),
    desc(t('ui.helpDesc', lang)),
    `<div style="${SECTION_BODY}"><div>`,
    btn(t('ui.help', lang), `${COMMAND} help`, true),
    btn(t('ui.rebuildJournals', lang), `${COMMAND} journal rebuild`, true),
    '</div></div>',
  ].join('');
}

// ---------------------------------------------------------------------------
// Section registry — maps section keys to renderer functions
// ---------------------------------------------------------------------------

const SECTION_RENDERERS = {
  quickActions: buildQuickActionsSection,
  partyScaling: buildPartyScalingSection,
  customScaling: buildCustomScalingSection,
  bossTools: buildBossToolsSection,
  reinforcements: buildReinforcementsSection,
  layerVisibility: buildLayerVisibilitySection,
  positionSaving: buildPositionSavingSection,
  encounterTemplates: buildEncounterTemplatesSection,
  resetRecovery: buildResetRecoverySection,
  reporting: buildReportingSection,
  config: buildConfigSection,
  help: buildHelpSection,
};

const DECK_VIEW_SECTIONS = {
  all: [
    'quickActions',
    'partyScaling',
    'customScaling',
    'bossTools',
    'reinforcements',
    'layerVisibility',
    'positionSaving',
    'encounterTemplates',
    'resetRecovery',
    'reporting',
    'config',
    'help',
  ],
  scaling: ['quickActions', 'partyScaling', 'customScaling', 'bossTools'],
  positioning: ['reinforcements', 'layerVisibility', 'positionSaving', 'encounterTemplates'],
  admin: ['resetRecovery', 'reporting', 'config', 'help'],
};

// ---------------------------------------------------------------------------
// Command Deck builder
// ---------------------------------------------------------------------------

/**
 * Builds the header block for the Command Deck.
 *
 * @param {string} activeView Currently active deck view key.
 * @param {string} lang Locale code.
 * @returns {string} HTML string.
 */
function buildDeckHeader(activeView, lang) {
  const viewLabel = deckViewLabel(activeView, lang);
  return [
    `<div style="font-size:0.75em;color:${COLOR_MUTED};text-align:right">`,
    `${escapeHtml(t('ui.deckViewLabel', lang))} ${escapeHtml(viewLabel)}`,
    '</div>',
  ].join('');
}

/**
 * Builds the full HTML for the Command Deck journal in the given view.
 *
 * @param {string} [view] Deck view key. Defaults to DEFAULT_DECK_VIEW.
 * @returns {string} HTML string.
 */
export function buildCommandDeck(view = DEFAULT_DECK_VIEW) {
  const lang = getConfig().language;
  const activeView = DECK_VIEW_KEYS.includes(view) ? view : DEFAULT_DECK_VIEW;
  const sectionKeys = DECK_VIEW_SECTIONS[activeView];

  const sectionHtml = sectionKeys
    .map((key, i) => {
      const renderer = SECTION_RENDERERS[key];
      if (!renderer) return '';
      const html = renderer(lang);
      // Add a divider between sections (not after the last one)
      return i < sectionKeys.length - 1 ? html + DIVIDER : html;
    })
    .join('');

  // The deck is one chat card: the same frame, title bar and buttons as CED's chat replies
  return buildCard(
    `${SCRIPT_NAME} v${SCRIPT_VERSION}`,
    [buildDeckHeader(activeView, lang), buildDeckTabs(activeView, lang), sectionHtml].join('')
  );
}

// ---------------------------------------------------------------------------
// Journal installation
// ---------------------------------------------------------------------------

/**
 * Creates or updates the Command Deck handout.
 * Migrates the old 'Combat Encounter Director' handout name if found.
 *
 * @param {string} [view] Deck view to render. Defaults to DEFAULT_DECK_VIEW.
 * @returns {void}
 */
export function installControlPanelHandout(view = DEFAULT_DECK_VIEW) {
  const html = buildCommandDeck(view);

  // Migrate old journal name from before the Command Deck rename.
  const OLD_PANEL_NAME = 'Combat Encounter Director';
  const legacy = findObjs({ type: 'handout', name: OLD_PANEL_NAME })[0];
  if (legacy) {
    legacy.set('name', JOURNAL_PANEL_NAME);
    legacy.set('notes', html);
    return;
  }

  const existing = findObjs({ type: 'handout', name: JOURNAL_PANEL_NAME })[0];
  if (existing) {
    existing.set('notes', html);
  } else {
    createObj('handout', { name: JOURNAL_PANEL_NAME, notes: html });
  }
}

/**
 * Creates or clears the status journal handout with placeholder content.
 *
 * @returns {void}
 */
export function installStatusHandout() {
  const placeholder = buildCard(
    t('report.summary', getConfig().language),
    `<div style="color:${COLOR_MUTED};font-style:italic">Run <strong>!ced report refresh</strong> to populate this report.</div>`
  );
  const existing = findObjs({ type: 'handout', name: JOURNAL_STATUS_NAME })[0];
  if (!existing) {
    createObj('handout', { name: JOURNAL_STATUS_NAME, notes: placeholder });
  }
}
