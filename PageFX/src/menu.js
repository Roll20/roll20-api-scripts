// Chat menus: the main menu, one card per effect, settings and status.
//
// Buttons that change an effect name it with --ids, so they work without a
// token selected, and end with --edit, --menu or --settings so the card they
// came from is shown again with the change.

import { buildButton, buildRow, buildSecondaryButton, buildSectionLabel, whisper } from './chat.js';
import {
  BUILTIN_COLOURS,
  BUILTIN_TYPES,
  COLOR_MUTED,
  COMMAND,
  MAX_INTENSITY,
  MAX_LAYERS,
  MAX_SPAWNS_PER_SECOND_LIMIT,
  MIN_INTENSITY,
  SCRIPT_VERSION,
} from './constants.js';
import { describeFx, isBeamSpec, listSavedFxNames } from './fx.js';
import { LOCALE_DEFINITIONS, t } from './i18n.js';
import { getLivePages } from './pages.js';
import { PRESET_PACKS, REGISTERED_PACK, allPresets, getPreset, presetName } from './presets.js';
import { getProblems, isRunning } from './scheduler.js';
import { TRIGGER_ACTIONS } from './state.js';
import { getEffects, getLang, getNullAreas, getSettings, getState } from './state.js';
import { escapeHtml, toNumber, toText } from './utils.js';

const SMALL_STYLE = `font-size:0.85em;color:${COLOR_MUTED}`;
const PROBLEM_STYLE = 'font-size:0.85em;color:#fca5a5';

/**
 * Makes text safe as a roll query prompt or default: the characters that end
 * or split a query are removed.
 *
 * @param {*} text Text.
 * @returns {string} Safe text.
 */
export function queryText(text) {
  return toText(text).replace(/[|{}]/g, '');
}

/**
 * Makes text safe as a roll query option. Roll20 reads the entities as the
 * characters, after the query has been split.
 *
 * @param {*} text Option text.
 * @returns {string} Safe text.
 */
export function queryOption(text) {
  return toText(text)
    .replaceAll('&', '&amp;')
    .replaceAll('|', '&#124;')
    .replaceAll(',', '&#44;')
    .replaceAll('}', '&#125;')
    .replaceAll('{', '&#123;');
}

/**
 * Builds a roll query: a box to type in, or a list when options are given.
 *
 * @param {string} prompt Question.
 * @param {string|Array<string|[string, string]>} [answer] Default text, or the options
 *   (a [label, value] pair or one text for both).
 * @returns {string} Roll query.
 */
export function query(prompt, answer = '') {
  if (Array.isArray(answer)) {
    const options = answer.map((o) =>
      Array.isArray(o) ? `${queryOption(o[0])},${queryOption(o[1])}` : queryOption(o)
    );
    return `?{${queryText(prompt)}|${options.join('|')}}`;
  }
  const text = queryText(answer);
  return text === '' ? `?{${queryText(prompt)}}` : `?{${queryText(prompt)}|${text}}`;
}

/**
 * Returns the name of a page.
 *
 * @param {string} id Page ID.
 * @returns {string} Name.
 */
function pageName(id) {
  return toText(getObj('page', id)?.get('name')) || id || '-';
}

/**
 * Returns the page an effect's token is on.
 *
 * @param {string} id Effect ID.
 * @returns {string} Page ID, or an empty string.
 */
function effectPage(id) {
  return toText(getObj('graphic', id)?.get('_pageid'));
}

/**
 * Says whether an effect is running, and if not, why.
 *
 * @param {object} effect Effect.
 * @param {string} lang Locale.
 * @returns {string} State text.
 */
export function effectStateText(effect, lang) {
  if (isRunning(effect.id)) {
    return t('status.running', lang);
  }
  if (!effect.enabled) {
    return t('status.off', lang);
  }
  if (effect.paused || getState().paused) {
    return t('status.pausedState', lang);
  }
  if (!effect.layers.some((l) => l.fx)) {
    return t('status.noFx', lang);
  }
  if (getProblems(effect.id).some(Boolean)) {
    return t('status.broken', lang);
  }
  return t('status.waiting', lang);
}

/**
 * Builds the on/off and pause/resume buttons for an effect.
 *
 * @param {object} effect Effect.
 * @param {string} lang Locale.
 * @param {string} back Flag naming the card to show again.
 * @returns {string} Buttons HTML.
 */
function switchButtons(effect, lang, back) {
  const ids = `--ids ${effect.id} ${back}`;
  return [
    effect.enabled
      ? buildSecondaryButton(t('buttons.turnOff', lang), `${COMMAND} off ${ids}`)
      : buildButton(t('buttons.turnOn', lang), `${COMMAND} on ${ids}`),
    effect.paused
      ? buildButton(t('buttons.resume', lang), `${COMMAND} resume ${ids}`)
      : buildSecondaryButton(t('buttons.pause', lang), `${COMMAND} pause ${ids}`),
    buildSecondaryButton(t('buttons.fire', lang), `${COMMAND} fire ${ids}`),
  ].join('');
}

/**
 * Builds the pause-all or resume-all button.
 *
 * @param {string} lang Locale.
 * @param {string} back Flag naming the card to show again.
 * @returns {string} Button HTML.
 */
function globalPauseButton(lang, back) {
  return getState().paused
    ? buildButton(t('buttons.resumeAll', lang), `${COMMAND} resume ${back}`)
    : buildSecondaryButton(t('buttons.pauseAll', lang), `${COMMAND} pause ${back}`);
}

/**
 * Wraps buttons in a block.
 *
 * @param {string[]} buttons Buttons HTML.
 * @returns {string} HTML.
 */
function buttonRow(buttons) {
  return `<div style="margin:2px 0">${buttons.filter(Boolean).join('')}</div>`;
}

/**
 * Shows the main menu: the effects on one page (the GM's page by default),
 * the other pages with effects, and buttons for new effects and settings.
 *
 * @param {string|null} playerId Who to show it to (null: the GM).
 * @param {string} [pageId] Page to list (default: the page the GM is on).
 * @returns {void}
 */
export function showMainMenu(playerId, pageId) {
  const lang = getLang();
  const live = getLivePages(getSettings().gmPagePreview);
  const here =
    pageId ||
    toText(playerId && getObj('player', playerId)?.get('_lastpage')) ||
    toText(Campaign().get('playerpageid'));
  const byPage = new Map();
  for (const effect of Object.values(getEffects())) {
    const page = effectPage(effect.id);
    if (!byPage.has(page)) {
      byPage.set(page, []);
    }
    byPage.get(page).push(effect);
  }
  const lines = [];
  lines.push(
    buildRow(
      t('menu.page', lang),
      `${escapeHtml(pageName(here))} <span style="${SMALL_STYLE}">(${escapeHtml(
        live.has(here) ? t('menu.live', lang) : t('menu.notLive', lang)
      )})</span>`
    )
  );
  if (getState().paused) {
    lines.push(`<div style="${PROBLEM_STYLE}">${escapeHtml(t('menu.allPausedNote', lang))}</div>`);
  }
  lines.push(buildSectionLabel(t('menu.effectsHere', lang)));
  const hereEffects = (byPage.get(here) || []).sort((a, b) => a.name.localeCompare(b.name));
  if (hereEffects.length === 0) {
    lines.push(`<div style="${SMALL_STYLE}">${escapeHtml(t('menu.noEffectsHere', lang))}</div>`);
  }
  for (const effect of hereEffects) {
    lines.push(
      `<div style="margin-top:3px"><strong>${escapeHtml(effect.name)}</strong> <span style="${SMALL_STYLE}">${escapeHtml(
        effectStateText(effect, lang)
      )}</span></div>`
    );
    lines.push(
      buttonRow([
        buildButton(t('buttons.edit', lang), `${COMMAND} edit --ids ${effect.id}`),
        switchButtons(effect, lang, '--menu'),
      ])
    );
  }
  const others = [...byPage.keys()].filter((p) => p !== here && p !== '');
  if (others.length > 0) {
    lines.push(buildSectionLabel(t('menu.otherPages', lang)));
    for (const page of others.sort((a, b) => pageName(a).localeCompare(pageName(b)))) {
      const state = live.has(page) ? t('menu.live', lang) : t('menu.notLive', lang);
      lines.push(
        buildRow(
          `${pageName(page)} (${state})`,
          `${escapeHtml(t('menu.effectCount', lang, { count: byPage.get(page).length }))} ${buildSecondaryButton(
            t('buttons.show', lang),
            `${COMMAND} menu ${page}`
          )}`
        )
      );
    }
  }
  lines.push(buildSectionLabel(t('menu.actions', lang)));
  lines.push(
    buttonRow([
      buildButton(t('buttons.create', lang), `${COMMAND} create --edit`),
      buildSecondaryButton(t('buttons.presets', lang), `${COMMAND} presets`),
      buildSecondaryButton(t('buttons.createNull', lang), `${COMMAND} null create --menu`),
      buildSecondaryButton(t('buttons.removeNull', lang), `${COMMAND} null remove --menu`),
    ])
  );
  lines.push(
    buttonRow([
      globalPauseButton(lang, '--menu'),
      buildSecondaryButton(t('buttons.settings', lang), `${COMMAND} settings`),
      buildSecondaryButton(t('buttons.status', lang), `${COMMAND} status`),
      buildSecondaryButton(t('buttons.rescan', lang), `${COMMAND} rescan --menu`),
      buildSecondaryButton(t('buttons.help', lang), `${COMMAND} help`),
    ])
  );
  lines.push(
    `<div style="${SMALL_STYLE};margin-top:3px">${escapeHtml(t('menu.selectHint', lang))}</div>`
  );
  whisper(playerId, `${t('titles.menu', lang)} v${SCRIPT_VERSION}`, lines);
}

/**
 * Describes an effect's area: its token's Aura 1.
 *
 * @param {object|undefined} token Roll20 graphic.
 * @param {string} lang Locale.
 * @returns {string} Area text.
 */
function areaText(token, lang) {
  if (!token) {
    return '-';
  }
  const page = getObj('page', token.get('_pageid'));
  const radius = toNumber(token.get('aura1_radius')) || 0;
  const units = toText(page?.get('scale_units')) || '';
  const shape = token.get('aura1_square') ? t('menu.square', lang) : t('menu.circle', lang);
  return t('menu.areaValue', lang, { radius, units, shape }).trim();
}

/**
 * Describes a layer's direction.
 *
 * @param {object} layer Layer.
 * @param {string} lang Locale.
 * @returns {string} Direction text.
 */
function directionText(layer, lang) {
  if (layer.direction === 'random') {
    return t('menu.directionRandom', lang);
  }
  return t('menu.directionOffset', lang, layer.direction || { dx: 0, dy: 0 });
}

/**
 * Builds the rows for one layer of an effect card.
 *
 * @param {object} effect Effect.
 * @param {number} index Layer number (from 0).
 * @param {string[]} savedNames Saved custom FX names in the game.
 * @param {string} lang Locale.
 * @returns {string[]} HTML lines.
 */
function layerLines(effect, index, savedNames, lang) {
  const layer = effect.layers[index];
  const n = index + 1;
  const flags = `--ids ${effect.id} --layer ${n} --edit`;
  const lines = [];
  const what = layer.fx ? describeFx(layer.fx) : t('menu.noFxSet', lang);
  const beam = isBeamSpec(layer.fx);
  const timing = t('menu.timing', lang, { min: layer.interval[0], max: layer.interval[1] });
  const parts = [timing];
  if (beam) {
    parts.push(directionText(layer, lang));
  }
  lines.push(
    `<div style="margin-top:4px"><strong>${escapeHtml(t('menu.layer', lang, { n }))}</strong> <code>${escapeHtml(
      what
    )}</code></div>`
  );
  lines.push(`<div style="${SMALL_STYLE}">${escapeHtml(parts.join(' · '))}</div>`);
  const problem = getProblems(effect.id)[index] || (layer.error ? { error: layer.error } : null);
  if (problem) {
    lines.push(
      `<div style="${PROBLEM_STYLE}">${escapeHtml(t(problem.error, lang, problem.vars || {}))}</div>`
    );
  }
  const builtin = `${query(t('prompts.type', lang), BUILTIN_TYPES)}-${query(
    t('prompts.colour', lang),
    BUILTIN_COLOURS
  )}`;
  const buttons = [
    buildButton(t('buttons.builtin', lang), `${COMMAND} fx ${builtin} ${flags}`),
    savedNames.length > 0
      ? buildSecondaryButton(
          t('buttons.saved', lang),
          `${COMMAND} fx ${query(t('prompts.saved', lang), savedNames)} ${flags}`
        )
      : '',
    buildSecondaryButton(
      t('buttons.json', lang),
      `${COMMAND} fx ${query(t('prompts.json', lang))} ${flags}`
    ),
    buildSecondaryButton(
      t('buttons.timing', lang),
      `${COMMAND} interval ${query(t('prompts.intervalMin', lang), layer.interval[0])} ${query(
        t('prompts.intervalMax', lang),
        layer.interval[1]
      )} ${flags}`
    ),
  ];
  if (beam) {
    const dx = layer.direction && layer.direction !== 'random' ? layer.direction.dx : 1;
    const dy = layer.direction && layer.direction !== 'random' ? layer.direction.dy : 0;
    buttons.push(
      buildSecondaryButton(t('buttons.random', lang), `${COMMAND} direction random ${flags}`),
      buildSecondaryButton(
        t('buttons.offset', lang),
        `${COMMAND} direction ${query(t('prompts.dx', lang), dx)} ${query(
          t('prompts.dy', lang),
          dy
        )} ${flags}`
      )
    );
  }
  if (effect.layers.length > 1) {
    buttons.push(
      buildSecondaryButton(
        t('buttons.removeLayer', lang),
        `${COMMAND} layer remove ${n} --ids ${effect.id} --edit`
      )
    );
  }
  lines.push(buttonRow(buttons));
  return lines;
}

/**
 * Returns a pack's name.
 *
 * @param {string} pack Pack ID.
 * @param {string} lang Locale.
 * @returns {string} Name.
 */
function packName(pack, lang) {
  return t(`packs.${pack}`, lang);
}

/**
 * Lists the presets as roll query options, "Pack: Name".
 *
 * @param {string} lang Locale.
 * @returns {Array<[string, string]>} Options.
 */
function presetOptions(lang) {
  return allPresets().map((p) => [`${packName(p.pack, lang)}: ${presetName(p, lang)}`, p.id]);
}

/**
 * Shows the presets, by pack. Each button gives the selected tokens that
 * preset, making them effects first when they are not.
 *
 * @param {string|null} playerId Who to show it to (null: the GM).
 * @returns {void}
 */
export function showPresets(playerId) {
  const lang = getLang();
  const lines = [`<div style="${SMALL_STYLE}">${escapeHtml(t('menu.presetsHint', lang))}</div>`];
  const presets = allPresets();
  for (const pack of [...PRESET_PACKS, REGISTERED_PACK]) {
    const inPack = presets.filter((p) => p.pack === pack);
    if (inPack.length === 0) {
      continue;
    }
    lines.push(buildSectionLabel(packName(pack, lang)));
    lines.push(
      buttonRow(
        inPack.map((p) =>
          buildSecondaryButton(presetName(p, lang), `${COMMAND} preset ${p.id} --edit`)
        )
      )
    );
  }
  lines.push(buttonRow([buildSecondaryButton(t('buttons.menu', lang), `${COMMAND} menu`)]));
  whisper(playerId, t('titles.presets', lang), lines);
}

/**
 * Describes a trigger in a few words.
 *
 * @param {import('./state.js').Trigger} trigger Trigger.
 * @param {string} effectId Effect the trigger belongs to.
 * @param {string} lang Locale.
 * @returns {string} Description.
 */
export function describeTrigger(trigger, effectId, lang) {
  const tokenName = (id) =>
    toText(getObj('graphic', id)?.get('name')) || t('triggers.unnamed', lang);
  let when;
  if (trigger.event === 'round') {
    if (trigger.round !== null) {
      when = t('triggers.onRound', lang, { n: trigger.round });
    } else if (trigger.every > 1) {
      when = t('triggers.everyRounds', lang, { n: trigger.every });
    } else {
      when = t('triggers.eachRound', lang);
    }
  } else if (trigger.event === 'turn') {
    when = t('triggers.turn', lang, { name: tokenName(trigger.token) });
  } else {
    const who =
      trigger.who === 'named' ? trigger.names.join(', ') : t(`triggers.who.${trigger.who}`, lang);
    const area =
      trigger.token && trigger.token !== effectId
        ? t('triggers.areaOf', lang, { name: tokenName(trigger.token) })
        : t('triggers.areaSelf', lang);
    when = t(`triggers.${trigger.event}`, lang, { who, area });
  }
  const action = t(`triggers.action.${trigger.action}`, lang, { count: trigger.count });
  let text = t('triggers.line', lang, { when, action });
  if (trigger.once) {
    text += ` ${t(trigger.used ? 'triggers.onceUsed' : 'triggers.once', lang)}`;
  }
  return text;
}

/**
 * Builds the triggers section of an effect card.
 *
 * @param {object} effect Effect.
 * @param {string} lang Locale.
 * @returns {string[]} HTML lines.
 */
function triggerLines(effect, lang) {
  const ids = `--ids ${effect.id} --edit`;
  const lines = [buildSectionLabel(t('menu.triggers', lang))];
  if (effect.triggers.length === 0) {
    lines.push(`<div style="${SMALL_STYLE}">${escapeHtml(t('menu.noTriggers', lang))}</div>`);
  }
  effect.triggers.forEach((trigger, index) => {
    lines.push(
      `<div style="margin-top:2px">${escapeHtml(`${index + 1}. ${describeTrigger(trigger, effect.id, lang)}`)} ${buildSecondaryButton(
        t('buttons.remove', lang),
        `${COMMAND} trigger remove ${index + 1} ${ids}`
      )}</div>`
    );
  });
  const then = query(
    t('prompts.then', lang),
    TRIGGER_ACTIONS.map((a) => [t(`triggers.choice.${a}`, lang), a])
  );
  const areaQuestions = [
    `who=${query(t('prompts.who', lang), [
      [t('triggers.who.players', lang), 'players'],
      [t('triggers.who.all', lang), 'all'],
    ])}`,
    `area=${query(t('prompts.area', lang), [
      [t('triggers.areaSelf', lang), 'self'],
      [t('triggers.areaSelected', lang), 'selected'],
    ])}`,
    query(t('prompts.once', lang), [
      [t('menu.no', lang), 'always'],
      [t('menu.yes', lang), 'once'],
    ]),
  ].join(' ');
  lines.push(
    buttonRow([
      buildSecondaryButton(
        t('buttons.onRound', lang),
        `${COMMAND} trigger add round ${then} every=${query(t('prompts.every', lang), 1)} ${ids}`
      ),
      buildSecondaryButton(t('buttons.onTurn', lang), `${COMMAND} trigger add turn ${then} ${ids}`),
      buildSecondaryButton(
        t('buttons.onEnter', lang),
        `${COMMAND} trigger add enter ${then} ${areaQuestions} ${ids}`
      ),
      buildSecondaryButton(
        t('buttons.onLeave', lang),
        `${COMMAND} trigger add leave ${then} ${areaQuestions} ${ids}`
      ),
    ])
  );
  lines.push(`<div style="${SMALL_STYLE}">${escapeHtml(t('menu.triggerHint', lang))}</div>`);
  return lines;
}

/**
 * Shows the card for one effect, with buttons to change everything about it.
 *
 * @param {string|null} playerId Who to show it to (null: the GM).
 * @param {object} effect Effect.
 * @returns {void}
 */
export function showEffectCard(playerId, effect) {
  const lang = getLang();
  const token = getObj('graphic', effect.id);
  const ids = `--ids ${effect.id} --edit`;
  const lines = [];
  lines.push(buildRow(t('menu.page', lang), escapeHtml(pageName(effectPage(effect.id)))));
  lines.push(buildRow(t('menu.state', lang), escapeHtml(effectStateText(effect, lang))));
  lines.push(buildRow(t('menu.area', lang), escapeHtml(areaText(token, lang))));
  lines.push(buildRow(t('status.intensity', lang), escapeHtml(String(effect.intensity))));
  const preset = effect.preset && getPreset(effect.preset);
  if (preset) {
    lines.push(buildRow(t('menu.preset', lang), escapeHtml(presetName(preset, lang))));
  }
  if (effect.source === 'v1') {
    lines.push(`<div style="${SMALL_STYLE}">${escapeHtml(t('menu.v1Note', lang))}</div>`);
  }
  const radius = toNumber(token?.get('aura1_radius')) || 0;
  lines.push(
    buttonRow([
      switchButtons(effect, lang, '--edit'),
      buildSecondaryButton(
        t('buttons.rename', lang),
        `${COMMAND} name ${query(t('prompts.name', lang), effect.name)} ${ids}`
      ),
      buildSecondaryButton(
        t('buttons.area', lang),
        `${COMMAND} area ${query(t('prompts.radius', lang), radius)} ${query(
          t('prompts.shape', lang),
          [
            [t('menu.circleOption', lang), 'circle'],
            [t('menu.squareOption', lang), 'square'],
          ]
        )} ${ids}`
      ),
      buildSecondaryButton(
        t('buttons.intensity', lang),
        `${COMMAND} intensity ${query(
          t('prompts.intensity', lang, { min: MIN_INTENSITY, max: MAX_INTENSITY }),
          effect.intensity
        )} ${ids}`
      ),
    ])
  );
  lines.push(buildSectionLabel(t('menu.layers', lang)));
  const savedNames = listSavedFxNames();
  effect.layers.forEach((_, index) => {
    lines.push(...layerLines(effect, index, savedNames, lang));
  });
  if (effect.layers.length === 0) {
    lines.push(`<div style="${SMALL_STYLE}">${escapeHtml(t('menu.noLayers', lang))}</div>`);
  }
  lines.push(...triggerLines(effect, lang));
  lines.push(
    buttonRow([
      buildSecondaryButton(
        t('buttons.preset', lang),
        `${COMMAND} preset ${query(t('prompts.preset', lang), presetOptions(lang))} ${ids}`
      ),
      effect.layers.length < MAX_LAYERS
        ? buildSecondaryButton(t('buttons.addLayer', lang), `${COMMAND} layer add ${ids}`)
        : '',
      buildSecondaryButton(
        t('buttons.delete', lang),
        `${COMMAND} delete ${query(t('prompts.confirmDelete', lang), [
          [t('menu.no', lang), 'no'],
          [t('menu.yes', lang), 'yes'],
        ])} --ids ${effect.id} --menu`
      ),
      buildSecondaryButton(t('buttons.menu', lang), `${COMMAND} menu`),
    ])
  );
  whisper(playerId, t('titles.effect', lang, { name: effect.name }), lines);
}

/**
 * Shows the settings card.
 *
 * @param {string|null} playerId Who to show it to (null: the GM).
 * @returns {void}
 */
export function showSettings(playerId) {
  const lang = getLang();
  const s = getSettings();
  const back = '--settings';
  const locale = LOCALE_DEFINITIONS.find((l) => l.code === lang);
  const languages = LOCALE_DEFINITIONS.map((l) => [l.nativeName || l.name, l.code]);
  const onOff = (value) => (value ? t('status.on', lang) : t('status.off', lang));
  const lines = [
    buildRow(
      t('settings.language', lang),
      `${escapeHtml(locale?.nativeName || locale?.name || lang)} ${buildSecondaryButton(
        t('buttons.change', lang),
        `${COMMAND} set language ${query(t('settings.language', lang), languages)} ${back}`
      )}`
    ),
    buildRow(
      t('status.gmPreview', lang),
      `${escapeHtml(onOff(s.gmPagePreview))} ${buildSecondaryButton(
        s.gmPagePreview ? t('buttons.turnOff', lang) : t('buttons.turnOn', lang),
        `${COMMAND} set gmPagePreview ${s.gmPagePreview ? 'off' : 'on'} ${back}`
      )}`
    ),
    `<div style="${SMALL_STYLE}">${escapeHtml(t('settings.gmPreviewHint', lang))}</div>`,
    buildRow(
      t('settings.globalIntensity', lang),
      `${escapeHtml(String(s.intensity))} ${buildSecondaryButton(
        t('buttons.change', lang),
        `${COMMAND} set intensity ${query(
          t('prompts.intensity', lang, { min: MIN_INTENSITY, max: MAX_INTENSITY }),
          s.intensity
        )} ${back}`
      )}`
    ),
    buildRow(
      t('status.maxSpawns', lang),
      `${escapeHtml(String(s.maxSpawnsPerSecond))} ${buildSecondaryButton(
        t('buttons.change', lang),
        `${COMMAND} set maxSpawnsPerSecond ${query(
          t('prompts.maxSpawns', lang, { max: MAX_SPAWNS_PER_SECOND_LIMIT }),
          s.maxSpawnsPerSecond
        )} ${back}`
      )}`
    ),
    `<div style="${SMALL_STYLE}">${escapeHtml(t('settings.maxSpawnsHint', lang))}</div>`,
    buttonRow([buildSecondaryButton(t('buttons.menu', lang), `${COMMAND} menu`)]),
  ];
  whisper(playerId, t('titles.settings', lang), lines);
}

/**
 * Shows every effect, what it does and whether it is running.
 *
 * @param {string|null} playerId Who to show it to (null: the GM).
 * @returns {void}
 */
export function showStatus(playerId) {
  const lang = getLang();
  const settings = getSettings();
  const live = getLivePages(settings.gmPagePreview);
  const onOff = (value) => (value ? t('status.on', lang) : t('status.off', lang));
  const lines = [
    buildRow(t('status.livePages', lang), escapeHtml([...live].map(pageName).join(', ') || '-')),
    buildRow(t('status.globalPause', lang), escapeHtml(onOff(getState().paused))),
    buildRow(t('status.gmPreview', lang), escapeHtml(onOff(settings.gmPagePreview))),
    buildRow(t('settings.globalIntensity', lang), escapeHtml(String(settings.intensity))),
    buildRow(t('status.maxSpawns', lang), escapeHtml(String(settings.maxSpawnsPerSecond))),
    buildRow(t('status.nullAreas', lang), escapeHtml(String(Object.keys(getNullAreas()).length))),
    buildSectionLabel(t('status.effects', lang)),
  ];
  const effects = Object.values(getEffects());
  if (effects.length === 0) {
    lines.push(`<div>${escapeHtml(t('status.noEffects', lang))}</div>`);
  }
  for (const effect of effects) {
    const what = effect.layers.map((l) => describeFx(l.fx) || '?').join(' + ');
    lines.push(
      buildRow(
        `${effect.name} (${pageName(effectPage(effect.id))})`,
        `${escapeHtml(effectStateText(effect, lang))} <code>${escapeHtml(what)}</code>`
      )
    );
    for (const problem of getProblems(effect.id).filter(Boolean)) {
      lines.push(
        `<div style="${PROBLEM_STYLE}">${escapeHtml(t(problem.error, lang, problem.vars || {}))}</div>`
      );
    }
  }
  lines.push(
    buttonRow([
      globalPauseButton(lang, '--status'),
      buildSecondaryButton(t('buttons.menu', lang), `${COMMAND} menu`),
    ])
  );
  whisper(playerId, t('titles.status', lang), lines);
}
