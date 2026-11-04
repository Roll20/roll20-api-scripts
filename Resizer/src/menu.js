// Chat cards: the main menu, the page picker, the history and the settings.
// Buttons run the same commands the GM can type; Roll20 queries (?{…}) ask
// for the numbers.

import {
  buildButton,
  buildDivider,
  buildLocaleFlag,
  buildRow,
  buildSecondaryButton,
  buildSectionLabel,
  whisper,
} from './chat.js';
import {
  CREATURE_SIZES,
  HANDOUT_DECK_NAME,
  HANDOUT_HELP_NAME,
  MAX_LISTED,
  MAX_PICKER_PAGES,
  PIXELS_PER_UNIT,
  SCRIPT_NAME,
  SCRIPT_VERSION,
} from './constants.js';
import { cellPixels } from './geometry.js';
import { LOCALE_DEFINITIONS, t } from './i18n.js';
import { attrsOf, objectName } from './objects.js';
import { allPages, currentPage } from './pages.js';
import { getCommand, getLang, getSettings, getState } from './state.js';
import { listHistory } from './undo.js';
import { escapeHtml, formatNumber, toNumber } from './utils.js';

/**
 * Makes text safe inside a Roll20 query, where | , { and } have meaning.
 *
 * @param {string} text Label.
 * @returns {string} Safe label.
 */
export function queryText(text) {
  return String(text)
    .replaceAll(/[|,{}]/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim();
}

/**
 * Builds a Roll20 drop-down query.
 *
 * @param {string} prompt Question.
 * @param {Array<[string, string]>} options Label and value pairs.
 * @returns {string} Query text.
 */
export function choiceQuery(prompt, options) {
  const opts = options.map(([label, value]) => `${queryText(label)},${value}`).join('|');
  return `?{${queryText(prompt)}|${opts}}`;
}

/**
 * Builds a Roll20 text query with a default answer.
 *
 * @param {string} prompt Question.
 * @param {string|number} [answer] Default answer.
 * @returns {string} Query text.
 */
export function textQuery(prompt, answer) {
  return answer === undefined ? `?{${queryText(prompt)}}` : `?{${queryText(prompt)}|${answer}}`;
}

/**
 * Describes a page's size for menus.
 *
 * @param {object} page Roll20 page.
 * @param {string} lang Locale.
 * @param {boolean} [short=false] Only the number of cells.
 * @returns {string} Text such as "30 × 20 cells, 70 px a cell, 5 ft a cell".
 */
export function describePage(page, lang, short = false) {
  const a = attrsOf(page);
  const cell = cellPixels(a);
  const units = toNumber(a.width) ?? 0;
  const unitsDown = toNumber(a.height) ?? 0;
  return t(short ? 'menu.pageCells' : 'menu.pageSize', lang, {
    across: formatNumber((units * PIXELS_PER_UNIT) / cell),
    down: formatNumber((unitsDown * PIXELS_PER_UNIT) / cell),
    cell: formatNumber(cell),
    scale: formatNumber(toNumber(a.scale_number) ?? 5),
    units: a.scale_units || 'ft',
  });
}

/**
 * Lists the selected objects with their sizes.
 *
 * @param {Array<{type: string, obj: object}>} items Selected objects.
 * @param {string} lang Locale.
 * @returns {string} HTML.
 */
export function describeSelection(items, lang) {
  const rows = items.slice(0, MAX_LISTED).map(({ type, obj }) => {
    const name = objectName(type, obj) || t(`kinds.${type}`, lang);
    if (type !== 'graphic') {
      return `<div>${escapeHtml(name)}</div>`;
    }
    const page = getObj('page', obj.get('_pageid'));
    const cell = page ? cellPixels(attrsOf(page)) : PIXELS_PER_UNIT;
    const w = toNumber(obj.get('width')) ?? 0;
    const h = toNumber(obj.get('height')) ?? 0;
    return `<div>${escapeHtml(
      t('menu.graphicSize', lang, {
        name,
        width: formatNumber(w),
        height: formatNumber(h),
        across: formatNumber(w / cell),
        down: formatNumber(h / cell),
      })
    )}</div>`;
  });
  if (items.length > MAX_LISTED) {
    rows.push(
      `<div>${escapeHtml(t('menu.andMore', lang, { count: items.length - MAX_LISTED }))}</div>`
    );
  }
  return rows.join('');
}

/**
 * Shows the main menu.
 *
 * @param {string|null} playerId Who to show it to.
 * @param {Array<{type: string, obj: object}>} [selected] Selected objects.
 * @returns {void}
 */
export function showMainMenu(playerId, selected = []) {
  const lang = getLang();
  const cmd = getCommand();
  const tr = (key, vars) => t(key, lang, vars);
  const q = (key) => tr(`queries.${key}`);
  const page = currentPage(playerId);
  const parts = [];

  parts.push(buildSectionLabel(tr('menu.selected')));
  if (selected.length > 0) {
    parts.push(`<div style="font-size:0.9em">${describeSelection(selected, lang)}</div>`);
  } else {
    parts.push(`<div style="font-size:0.9em">${escapeHtml(tr('menu.nothingSelected'))}</div>`);
  }
  const units = choiceQuery(q('unit'), [
    [q('unitPx'), 'px'],
    [q('unitCells'), 'cells'],
    [q('unitUnits'), 'units'],
  ]);
  const sizes = choiceQuery(
    q('creatureSize'),
    Object.keys(CREATURE_SIZES).map((s) => [tr(`sizes.${s}`), s])
  );
  parts.push(
    `<div>${[
      buildButton(
        tr('buttons.resize'),
        `${cmd} size ${textQuery(q('width'), 70)} ${textQuery(q('height'), 70)} ${units} --menu`
      ),
      buildButton(tr('buttons.creatureSize'), `${cmd} size ${sizes} --menu`),
      buildSecondaryButton(
        tr('buttons.fit'),
        `${cmd} fit ${choiceQuery(q('keepShape'), [
          [q('yes'), '--keep-ratio'],
          [q('no'), '--stretch'],
        ])} --menu`
      ),
      buildSecondaryButton(
        tr('buttons.centre'),
        `${cmd} center ${choiceQuery(q('centre'), [
          [q('both'), 'both'],
          [q('across'), 'h'],
          [q('down'), 'v'],
        ])} --menu`
      ),
      buildSecondaryButton(tr('buttons.sizes'), `${cmd} --menu`),
    ].join('')}</div>`
  );

  parts.push(buildSectionLabel(tr('menu.map')));
  parts.push(`<div style="font-size:0.85em">${escapeHtml(tr('menu.mapHint'))}</div>`);
  parts.push(
    `<div>${[
      buildButton(
        tr('buttons.calibrate'),
        `${cmd} calibrate ${textQuery(q('across'), 1)} ${textQuery(q('downCount'), 1)}`
      ),
      buildSecondaryButton(
        tr('buttons.calibrateFit'),
        `${cmd} calibrate ${textQuery(q('across'), 1)} ${textQuery(q('downCount'), 1)} --fit-page`
      ),
      buildSecondaryButton(
        tr('buttons.calibratePx'),
        `${cmd} calibrate --cell ${textQuery(q('squarePx'), 100)}`
      ),
    ].join('')}</div>`
  );

  parts.push(buildSectionLabel(tr('menu.page')));
  if (page) {
    parts.push(
      `<div style="font-size:0.9em"><strong>${escapeHtml(page.get('name') || '')}</strong>: ${escapeHtml(describePage(page, lang))}</div>`
    );
  }
  const pageUnits = choiceQuery(q('unit'), [
    [q('unitCells'), 'cells'],
    [q('unitUnits'), 'units'],
    [q('unitPx'), 'px'],
  ]);
  parts.push(
    `<div>${[
      buildButton(
        tr('buttons.zoom'),
        `${cmd} zoom ${textQuery(q('factor'), 2)} ${choiceQuery(q('tokens'), [
          [q('tokensScale'), '--scale-tokens'],
          [q('tokensKeep'), '--keep-tokens'],
        ])} --menu`
      ),
      buildSecondaryButton(
        tr('buttons.resizePage'),
        `${cmd} page ${textQuery(q('width'), 30)} ${textQuery(q('height'), 20)} ${pageUnits} --menu`
      ),
      buildSecondaryButton(tr('buttons.pages'), `${cmd} pages`),
    ].join('')}</div>`
  );

  parts.push(buildDivider());
  const last = listHistory()[0];
  parts.push(
    `<div>${[
      last
        ? buildButton(
            tr('buttons.undoWhat', { what: describeEntry(last, lang) }),
            `${cmd} undo --menu`
          )
        : '',
      buildSecondaryButton(tr('buttons.history'), `${cmd} history`),
      buildSecondaryButton(tr('buttons.settings'), `${cmd} settings`),
      buildSecondaryButton(tr('buttons.help'), `${cmd} help`),
    ].join('')}</div>`
  );
  whisper(playerId, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, parts);
}

/**
 * Describes a history entry.
 *
 * @param {object} entry Undo entry.
 * @param {string} lang Locale.
 * @returns {string} Text.
 */
export function describeEntry(entry, lang) {
  const vars = { ...(entry.vars || {}) };
  if (typeof vars.factor === 'number') {
    vars.factor = formatNumber(vars.factor);
  }
  return t(entry.label || 'history.change', lang, vars);
}

/**
 * Shows the undo history.
 *
 * @param {string|null} playerId Who to show it to.
 * @returns {void}
 */
export function showHistory(playerId) {
  const lang = getLang();
  const cmd = getCommand();
  const entries = listHistory();
  const parts = [];
  if (entries.length === 0) {
    parts.push(`<div>${escapeHtml(t('menu.historyEmpty', lang))}</div>`);
  } else {
    entries.forEach((entry, i) => {
      const mins = Math.max(0, Math.round((Date.now() - (entry.at || 0)) / 60000));
      parts.push(
        `<div>${i + 1}. ${escapeHtml(describeEntry(entry, lang))} <span style="font-size:0.8em;opacity:0.8">(${escapeHtml(t('menu.minutesAgo', lang, { minutes: mins }))})</span></div>`
      );
    });
    parts.push(
      `<div style="font-size:0.85em;margin-top:3px">${escapeHtml(t('menu.historyHint', lang))}</div>`
    );
  }
  parts.push(buildDivider());
  parts.push(
    `<div>${[
      entries.length > 0 ? buildButton(t('buttons.undo', lang), `${cmd} undo --history`) : '',
      entries.length > 0
        ? buildSecondaryButton(t('buttons.clearHistory', lang), `${cmd} history clear`)
        : '',
      buildSecondaryButton(t('buttons.menu', lang), `${cmd}`),
    ].join('')}</div>`
  );
  whisper(playerId, t('titles.history', lang), parts);
}

/**
 * Shows the page picker.
 *
 * @param {string|null} playerId Who to show it to.
 * @returns {void}
 */
export function showPagePicker(playerId) {
  const lang = getLang();
  const cmd = getCommand();
  const picked = new Set(getState().picked);
  const pages = allPages();
  const parts = [`<div style="font-size:0.85em">${escapeHtml(t('menu.pickerHint', lang))}</div>`];
  for (const page of pages.slice(0, MAX_PICKER_PAGES)) {
    const on = picked.has(page.id);
    const label = `${on ? '☑' : '☐'} ${page.get('name') || page.id}`;
    parts.push(
      buildRow(
        describePage(page, lang, true),
        (on ? buildButton : buildSecondaryButton)(label, `${cmd} pick ${page.id} --picker`)
      )
    );
  }
  if (pages.length > MAX_PICKER_PAGES) {
    parts.push(
      `<div>${escapeHtml(t('menu.andMore', lang, { count: pages.length - MAX_PICKER_PAGES }))}</div>`
    );
  }
  parts.push(buildDivider());
  parts.push(
    `<div>${[
      buildButton(
        t('buttons.zoomPicked', lang, { count: picked.size }),
        `${cmd} zoom ${textQuery(t('queries.factor', lang), 2)} --pages picked --picker`
      ),
      buildSecondaryButton(t('buttons.pickAll', lang), `${cmd} pick all --picker`),
      buildSecondaryButton(t('buttons.pickNone', lang), `${cmd} pick none --picker`),
      buildSecondaryButton(t('buttons.menu', lang), `${cmd}`),
    ].join('')}</div>`
  );
  whisper(playerId, t('titles.pages', lang), parts);
}

/**
 * Shows the settings.
 *
 * @param {string|null} playerId Who to show it to.
 * @returns {void}
 */
export function showSettings(playerId) {
  const lang = getLang();
  const cmd = getCommand();
  const s = getSettings();
  const tr = (key, vars) => t(key, lang, vars);
  const onOff = (v) => tr(v ? 'menu.on' : 'menu.off');
  const toggle = (key) =>
    buildSecondaryButton(onOff(s[key]), `${cmd} set ${key} ${s[key] ? 'off' : 'on'} --settings`);
  const locale = LOCALE_DEFINITIONS.find((d) => d.code === lang);
  const langQuery = choiceQuery(
    tr('queries.language'),
    LOCALE_DEFINITIONS.map((d) => [d.nativeName || d.name, d.code])
  );
  const parts = [
    buildRow(
      tr('settings.language'),
      buildSecondaryButton(
        locale?.nativeName || locale?.name || lang,
        `${cmd} set language ${langQuery} --settings`,
        buildLocaleFlag(locale)
      )
    ),
    buildRow(
      tr('settings.command'),
      buildSecondaryButton(
        `!${s.command}`,
        `${cmd} set command ${textQuery(tr('queries.command'), s.command)} --settings`
      )
    ),
    buildRow(tr('settings.keepTokenSize'), toggle('keepTokenSize')),
    buildRow(tr('settings.scaleStrokes'), toggle('scaleStrokes')),
    buildRow(tr('settings.deleteCalibrationBox'), toggle('deleteCalibrationBox')),
    buildDivider(),
    `<div>${[
      buildSecondaryButton(tr('buttons.resetSettings'), `${cmd} reset --settings`),
      buildSecondaryButton(tr('buttons.rebuild'), `${cmd} journal rebuild`),
      buildSecondaryButton(tr('buttons.menu'), `${cmd}`),
    ].join('')}</div>`,
  ];
  whisper(playerId, tr('titles.settings', lang), parts);
}

/**
 * Shows a short help card with links to the handouts.
 *
 * @param {string|null} playerId Who to show it to.
 * @param {Array<[string, string]>} commands Command and description-key pairs.
 * @returns {void}
 */
export function showHelp(playerId, commands) {
  const lang = getLang();
  const cmd = getCommand();
  const link = (name) => {
    const handout = findObjs({ _type: 'handout', name })[0];
    return handout
      ? `<a href="http://journal.roll20.net/handout/${handout.id}" style="color:inherit">${escapeHtml(name)}</a>`
      : escapeHtml(name);
  };
  const rows = commands
    .map(
      ([c, key]) =>
        `<div><code>${escapeHtml(`${cmd} ${c}`.trim())}</code> – ${escapeHtml(t(`help.${key}`, lang))}</div>`
    )
    .join('');
  whisper(playerId, t('titles.help', lang), [
    `<div style="font-size:0.9em">${rows}</div>`,
    buildDivider(),
    `<div style="font-size:0.85em">${escapeHtml(t('menu.handouts', lang))} ${link(HANDOUT_HELP_NAME)} • ${link(HANDOUT_DECK_NAME)}</div>`,
  ]);
}
