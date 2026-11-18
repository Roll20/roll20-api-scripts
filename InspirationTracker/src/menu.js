// Chat menus: the GM menu, settings, party overview, the player card,
// status and help.

import { activePool, termFor } from './actions.js';
import {
  buildButton,
  buildButtonGrid,
  buildCommandHelp,
  buildDivider,
  buildItemTitle,
  buildNote,
  buildRow,
  buildSecondaryButton,
  buildSectionLabel,
  whisper,
} from './chat.js';
import {
  ANNOUNCE_OPTIONS,
  COMMAND,
  FX_COLOURS,
  FX_TYPES,
  HANDOUT_HELP_NAME,
  HELP_COMMANDS,
  POOL_SOURCES,
  SCRIPT_NAME,
  SCRIPT_VERSION,
  TRACKING_OPTIONS,
  WORDING_OPTIONS,
} from './constants.js';
import { LOCALE_DEFINITIONS, t } from './i18n.js';
import { listMarkers, markerName } from './markers.js';
import { canControl, controllerIds, partyMembers } from './party.js';
import { poolAttributeName, readInspiration, readPool, rulesFor, sheetKind } from './sheet.js';
import { defaultPool, getConfig, getPools } from './state.js';
import { escapeHtml, queryText, toText } from './utils.js';

// The settings card's sections: a Help handout heading, and the settings under it.
const SETTING_GROUPS = [
  ['languages', ['language']],
  ['sheets', ['tracking', 'wording']],
  ['markers', ['marker', 'fx', 'fxType']],
  ['players', ['announce', 'playerSpend', 'playerOverview', 'passOn']],
];

const YES = '✔';
const NO = '—';

/**
 * Builds a roll query offering a list of values.
 *
 * @param {string} prompt Prompt text.
 * @param {{label: string, value: string}[]} options Choices.
 * @returns {string} Roll query.
 */
function query(prompt, options) {
  const choices = options.map((o) => `${queryText(o.label)},${queryText(o.value)}`).join('|');
  return `?{${queryText(prompt)}|${choices}}`;
}

/**
 * Returns a translated on/off label.
 *
 * @param {boolean} value Setting.
 * @param {string} lang Locale code.
 * @returns {string} Label.
 */
function onOff(value, lang) {
  return t(value ? 'values.on' : 'values.off', lang);
}

/**
 * Builds a roll query asking for a number.
 *
 * @param {string} key Prompt key under `prompts`.
 * @param {string} lang Locale code.
 * @param {number|string} [value] Value offered.
 * @returns {string} Roll query.
 */
function ask(key, lang, value = 1) {
  return `?{${queryText(t(`prompts.${key}`, lang))}|${queryText(value)}}`;
}

/**
 * Shows the GM menu.
 *
 * @param {string|null} playerId Who asked.
 * @returns {void}
 */
export function showMainMenu(playerId) {
  const lang = getConfig().language;
  const b = (key, args) => buildButton(t(`buttons.${key}`, lang), `${COMMAND} ${args}`.trim());
  const s = (key, args) =>
    buildSecondaryButton(t(`buttons.${key}`, lang), `${COMMAND} ${args}`.trim());
  const selected = activePool()
    ? [
        b('give', `give ${ask('points', lang)}`),
        b('remove', `remove ${ask('points', lang)}`),
        b('spend', `spend ${ask('points', lang)}`),
        b('boost', `boost ${ask('bonus', lang)}`),
      ]
    : [b('give', 'give'), b('remove', 'remove'), b('toggle', 'toggle'), b('spend', 'spend')];
  whisper(playerId, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, [
    buildSectionLabel(t('menu.selected', lang)),
    buildButtonGrid(selected, 2),
    buildSectionLabel(t('menu.party', lang)),
    buildButtonGrid([b('party', 'party')], 1),
    buildButtonGrid([s('partyAdd', 'party add'), s('partyRemove', 'party remove')], 2),
    buildSectionLabel(t('menu.tools', lang)),
    buildButtonGrid(
      [
        s('settings', 'set'),
        s('pools', 'pools'),
        s('macro', 'macro'),
        s('sync', 'sync'),
        s('status', 'status'),
        s('help', 'help'),
      ],
      2
    ),
    buildDivider(),
    buildNote(t('menu.hint', lang, { help: HANDOUT_HELP_NAME })),
  ]);
}

/**
 * Builds the value button for one setting.
 *
 * @param {string} key Setting key.
 * @param {string} lang Locale code.
 * @returns {string} Button HTML.
 */
function settingButton(key, lang) {
  const config = getConfig();
  const value = config[key];
  const set = (label, choices) =>
    buildButton(label, `${COMMAND} set ${key} ${query(t(`settings.${key}.label`, lang), choices)}`);
  switch (key) {
    case 'language':
      return set(
        value,
        LOCALE_DEFINITIONS.map((d) => ({
          label: `${d.nativeName || d.name} (${d.code})`,
          value: d.code,
        }))
      );
    case 'tracking':
      return set(
        t(`values.tracking.${value}`, lang),
        TRACKING_OPTIONS.map((o) => ({ label: t(`values.tracking.${o}`, lang), value: o }))
      );
    case 'marker':
      return set(
        markerName(value),
        listMarkers().map((m) => ({ label: m.name, value: m.tag }))
      );
    case 'wording':
      return set(
        t(`values.wording.${value}`, lang),
        WORDING_OPTIONS.map((o) => ({ label: t(`values.wording.${o}`, lang), value: o }))
      );
    case 'announce':
      return set(
        t(`values.announce.${value}`, lang),
        ANNOUNCE_OPTIONS.map((o) => ({ label: t(`values.announce.${o}`, lang), value: o }))
      );
    case 'fxType':
      return set(
        value,
        FX_TYPES.flatMap((type) => FX_COLOURS.map((colour) => `${type}-${colour}`)).map((v) => ({
          label: v,
          value: v,
        }))
      );
    default:
      return buildButton(onOff(value, lang), `${COMMAND} set ${key} ${value ? 'off' : 'on'}`);
  }
}

/**
 * Shows the settings menu.
 *
 * @param {string|null} playerId Who asked.
 * @returns {void}
 */
export function showSettings(playerId) {
  const lang = getConfig().language;
  // Grouped under the headings the Help handout uses for the same subjects
  const rows = SETTING_GROUPS.flatMap(([heading, keys]) => [
    buildSectionLabel(t(`handout.${heading}.heading`, lang)),
    ...keys.map((key) =>
      buildRow(t(`settings.${key}.label`, lang), settingButton(key, lang), true)
    ),
  ]);
  whisper(playerId, t('titles.settings', lang), [
    ...rows,
    buildDivider(),
    buildButtonGrid(
      [
        buildSecondaryButton(t('buttons.menu', lang), COMMAND),
        buildSecondaryButton(t('buttons.pools', lang), `${COMMAND} pools`),
        buildSecondaryButton(t('buttons.reset', lang), `${COMMAND} reset`),
      ],
      2
    ),
  ]);
}

/**
 * Shows the points pools, with a button for each of their settings.
 *
 * @param {string|null} playerId Who asked.
 * @returns {void}
 */
export function showPools(playerId) {
  const lang = getConfig().language;
  const body = [
    buildNote(
      t(activePool() ? 'pools.introPool' : 'pools.introFlag', lang, { name: defaultPool().name })
    ),
  ];
  for (const pool of getPools()) {
    const isDefault = pool === defaultPool();
    const set = (field, label, value) =>
      buildRow(
        t(`pools.${field}`, lang),
        buildButton(label, `${COMMAND} pool set ${pool.id} ${field} ${value}`),
        true
      );
    body.push(
      buildSectionLabel(isDefault ? t('pools.defaultLabel', lang, { name: pool.name }) : pool.name),
      set('name', pool.name, `?{${queryText(t('pools.name', lang))}|${queryText(pool.name)}}`),
      set(
        'source',
        t(`values.source.${pool.source}`, lang),
        query(
          t('pools.source', lang),
          POOL_SOURCES.map((o) => ({ label: t(`values.source.${o}`, lang), value: o }))
        )
      ),
      set('cost', String(pool.cost), `?{${queryText(t('pools.cost', lang))}|${pool.cost}}`),
      set(
        'max',
        pool.max > 0 ? String(pool.max) : t('values.noLimit', lang),
        `?{${queryText(t('prompts.max', lang))}|${pool.max}}`
      )
    );
    if (!isDefault) {
      body.push(
        set(
          'marker',
          pool.marker ? markerName(pool.marker) : t('values.none', lang),
          query(t('pools.marker', lang), [
            { label: t('values.none', lang), value: 'none' },
            ...listMarkers()
              .filter((m) => m.tag !== getConfig().marker)
              .map((m) => ({ label: m.name, value: m.tag })),
          ])
        )
      );
    }
    body.push(buildNote(t('pools.attribute', lang, { attribute: poolAttributeName(pool) })));
    if (!isDefault) {
      body.push(
        buildButtonGrid(
          [
            buildSecondaryButton(t('buttons.party', lang), `${COMMAND} party --pool ${pool.id}`),
            buildSecondaryButton(
              t('buttons.deletePool', lang),
              `${COMMAND} pool delete ${pool.id}`
            ),
          ],
          2
        )
      );
    }
  }
  body.push(
    buildDivider(),
    buildButtonGrid(
      [
        buildButton(
          t('buttons.addPool', lang),
          `${COMMAND} pool add ?{${queryText(t('pools.name', lang))}}`
        ),
        buildSecondaryButton(t('buttons.settings', lang), `${COMMAND} set`),
        buildSecondaryButton(t('buttons.menu', lang), COMMAND),
      ],
      3
    )
  );
  whisper(playerId, t('titles.pools', lang), body);
}

/**
 * Reads the party's inspiration.
 *
 * @param {object[]} characters Roll20 characters.
 * @returns {Promise<{character: object, inspired: boolean, kind: string}[]>} Rows.
 */
async function readRows(characters) {
  const rows = [];
  for (const character of characters) {
    const value = await readInspiration(character.id);
    rows.push({ character, ...value });
  }
  return rows;
}

/**
 * Builds one character's block in an overview: the name with its tick or
 * points at the right-hand edge, where the points are kept, and the buttons
 * in a row of their own underneath.
 *
 * @param {object} row Row from readRows or poolRow.
 * @param {string} lang Locale code.
 * @param {string[]} buttons Button HTML; empty items are skipped.
 * @returns {string} HTML.
 */
function overviewLine(row, lang, buttons) {
  let mark = row.inspired
    ? `<span style="color:#f2c94c;font-weight:bold">${YES}</span>`
    : `<span style="opacity:0.6">${NO}</span>`;
  if (row.points !== undefined) {
    mark =
      row.points > 0
        ? `<span style="color:#f2c94c;font-weight:bold">${row.points}</span>`
        : '<span style="opacity:0.6">0</span>';
  }
  const sheet =
    row.kind === 'none'
      ? ` <span style="font-size:0.8em;font-weight:normal;opacity:0.7">(${escapeHtml(t('menu.noSheet', lang))})</span>`
      : '';
  const list = buttons.filter(Boolean);
  return [
    buildItemTitle(toText(row.character.get('name')), mark, sheet),
    row.kept ? buildNote(row.kept) : '',
    buildButtonGrid(list, Math.min(Math.max(list.length, 2), 3)),
  ].join('');
}

/**
 * Shows the party overview. The GM gets Give and Remove buttons; players get
 * a read-only list (when the GM allows it) with Spend for their own
 * characters.
 *
 * @param {string} playerId Who asked.
 * @param {boolean} gm Whether they act as GM.
 * @param {object|null} [pool] The pool to show; the tracked one when left out.
 * @returns {Promise<void>}
 */
export async function showParty(playerId, gm, pool = null) {
  const config = getConfig();
  const lang = config.language;
  const members = partyMembers();
  const visible =
    gm || config.playerOverview ? members : members.filter((c) => canControl(playerId, c));
  const shown = pool || activePool();
  if (shown) {
    showPoolParty(playerId, gm, shown, visible);
    return;
  }
  const rows = await readRows(visible);
  const lines = rows.map((row) => {
    const id = row.character.id;
    let buttons = [];
    if (gm) {
      buttons = row.inspired
        ? [
            buildSecondaryButton(
              t('buttons.remove', lang),
              `${COMMAND} remove --ids ${id} --party`
            ),
            buildSecondaryButton(t('buttons.spend', lang), `${COMMAND} spend --ids ${id} --party`),
          ]
        : [buildButton(t('buttons.give', lang), `${COMMAND} give --ids ${id} --party`)];
    } else if (row.inspired && config.playerSpend && canControl(playerId, row.character)) {
      buttons = [buildButton(t('buttons.spend', lang), `${COMMAND} spend --ids ${id} --party`)];
    }
    return overviewLine(row, lang, buttons);
  });
  const count = rows.filter((r) => r.inspired).length;
  const term = rows.length > 0 ? termFor(rows[0].character.id, lang) : t('terms.heroic', lang);
  const body = [
    lines.length > 0
      ? lines.join('')
      : `<div>${escapeHtml(t(gm ? 'menu.partyEmptyGm' : 'menu.partyEmpty', lang))}</div>`,
    buildDivider(),
    `<div style="font-size:0.9em">${escapeHtml(t('menu.partyCount', lang, { count, total: rows.length, term }))}</div>`,
    buildButtonGrid(
      [
        buildSecondaryButton(t('buttons.refresh', lang), `${COMMAND} party`),
        gm ? buildSecondaryButton(t('buttons.menu', lang), COMMAND) : '',
        ...otherPoolButtons(null, lang),
      ],
      2
    ),
  ];
  whisper(playerId, t('titles.party', lang), body);
}

/**
 * Builds the buttons a character's pool line gets.
 *
 * @param {string} playerId Who is looking.
 * @param {boolean} gm Whether they act as GM.
 * @param {object} pool Pool.
 * @param {object} character Roll20 character.
 * @param {number} points The character's points.
 * @param {boolean} party Whether to show the party again afterwards.
 * @returns {string[]} Button HTML; empty items stand for buttons that do not apply.
 */
function poolLineButtons(playerId, gm, pool, character, points, party) {
  const config = getConfig();
  const lang = config.language;
  const target = `--ids ${character.id} --pool ${pool.id}${party ? ' --party' : ''}`;
  const button = (build, key, sub, prompt) =>
    build(t(`buttons.${key}`, lang), `${COMMAND} ${sub} ${ask(prompt, lang)} ${target}`);
  if (gm) {
    return [
      button(buildButton, 'give', 'give', 'points'),
      points > 0 ? button(buildSecondaryButton, 'remove', 'remove', 'points') : '',
      points > 0 ? button(buildSecondaryButton, 'spend', 'spend', 'points') : '',
    ];
  }
  if (points > 0 && config.playerSpend && canControl(playerId, character)) {
    return [
      button(buildButton, 'spend', 'spend', 'points'),
      button(buildSecondaryButton, 'boost', 'boost', 'bonus'),
    ];
  }
  return [];
}

/**
 * Reads a character's points in a pool for an overview line, with the words
 * that say where they are kept: the sheet box's name, or the attribute.
 *
 * @param {object} character Roll20 character.
 * @param {object} pool Pool.
 * @param {string} lang Locale code.
 * @returns {{character: object, points: number, kept: string, where: string}} Row.
 */
function poolRow(character, pool, lang) {
  const { where, name, value } = readPool(character.id, pool);
  const kept =
    where === 'resource'
      ? t('pools.keptBox', lang, { name: pool.name })
      : t('pools.keptAttribute', lang, { attribute: name });
  return { character, points: value, kept, where };
}

/**
 * Builds the note that explains an attribute, for a card that lists one.
 *
 * @param {{where: string}[]} rows Rows from poolRow.
 * @param {string} lang Locale code.
 * @returns {string[]} HTML, or nothing when every row is a sheet box.
 */
function keptNote(rows, lang) {
  return rows.some((row) => row.where === 'attribute')
    ? [buildNote(t('pools.keptNote', lang))]
    : [];
}

/**
 * Builds buttons to look at the other pools from an overview.
 *
 * @param {object|null} current The pool being shown, or null for the sheet's inspiration box.
 * @param {string} lang Locale code.
 * @returns {string[]} Button HTML.
 */
function otherPoolButtons(current, lang) {
  const tracked = activePool();
  const buttons = [];
  if (current && current !== tracked) {
    buttons.push(
      buildSecondaryButton(tracked ? tracked.name : t('terms.classic', lang), `${COMMAND} party`)
    );
  }
  for (const pool of getPools()) {
    if (pool !== current && pool !== tracked && pool !== defaultPool()) {
      buttons.push(buildSecondaryButton(pool.name, `${COMMAND} party --pool ${pool.id}`));
    }
  }
  return buttons;
}

/**
 * Shows the party's points in a pool. The GM gets Give, Remove and Spend
 * buttons; players get Spend and Boost for their own characters.
 *
 * @param {string} playerId Who asked.
 * @param {boolean} gm Whether they act as GM.
 * @param {object} pool Pool.
 * @param {object[]} characters Party members the player may see.
 * @returns {void}
 */
function showPoolParty(playerId, gm, pool, characters) {
  const lang = getConfig().language;
  const rows = characters.map((character) => poolRow(character, pool, lang));
  const total = rows.reduce((sum, row) => sum + row.points, 0);
  const lines = rows.map((row) =>
    overviewLine(row, lang, poolLineButtons(playerId, gm, pool, row.character, row.points, true))
  );
  const flag = pool === activePool() ? '' : ` --pool ${pool.id}`;
  const body = [
    lines.length > 0
      ? lines.join('')
      : `<div>${escapeHtml(t(gm ? 'menu.partyEmptyGm' : 'menu.partyEmpty', lang))}</div>`,
    buildDivider(),
    `<div style="font-size:0.9em">${escapeHtml(t('pools.partyTotal', lang, { total, term: pool.name }))}</div>`,
    ...keptNote(rows, lang),
    buildButtonGrid(
      [
        buildSecondaryButton(t('buttons.refresh', lang), `${COMMAND} party${flag}`),
        gm ? buildSecondaryButton(t('buttons.menu', lang), COMMAND) : '',
        ...otherPoolButtons(pool, lang),
      ],
      2
    ),
  ];
  whisper(playerId, t('titles.poolParty', lang, { term: pool.name }), body);
}

/**
 * Shows a player the characters they control, with Spend buttons. The GM
 * can turn the party overview on for players instead.
 *
 * @param {string} playerId Who asked.
 * @returns {Promise<void>}
 */
export async function showPlayerCard(playerId) {
  const config = getConfig();
  if (config.playerOverview) {
    await showParty(playerId, false);
    return;
  }
  const lang = config.language;
  const tracked = activePool();
  const controlled = findObjs({ _type: 'character' })
    .filter((c) => !c.get('archived') && canControl(playerId, c))
    .sort((a, b) => toText(a.get('name')).localeCompare(toText(b.get('name'))));
  const own = controlled.filter((c) => sheetKind(c.id) !== 'none');
  const rows = tracked ? [] : await readRows(own);
  const lines = rows.map((row) =>
    overviewLine(
      row,
      lang,
      row.inspired && config.playerSpend
        ? [buildButton(t('buttons.spend', lang), `${COMMAND} spend --ids ${row.character.id}`)]
        : []
    )
  );
  // The tracked pool, then the GM's other pools, for the characters that are theirs: in the
  // party, or named as theirs. A character everyone controls (a shared helper token) is only
  // listed once it has points.
  const party = partyMembers();
  const theirs = controlled.filter(
    (c) => party.some((m) => m.id === c.id) || controllerIds(c).includes(playerId)
  );
  const pools = getPools().filter((pool) => pool === tracked || pool !== defaultPool());
  const poolRows = [];
  for (const pool of pools) {
    const listed = controlled
      .map((character) => poolRow(character, pool, lang))
      .filter((row) => row.points > 0 || theirs.includes(row.character));
    poolRows.push(...listed);
    if (listed.length > 0 && (pools.length > 1 || !tracked)) {
      lines.push(buildSectionLabel(pool.name));
    }
    for (const row of listed) {
      lines.push(
        overviewLine(
          row,
          lang,
          poolLineButtons(playerId, false, pool, row.character, row.points, false)
        )
      );
    }
  }
  const note = keptNote(poolRows, lang);
  if (note.length > 0) {
    lines.push(buildDivider(), ...note);
  }
  whisper(
    playerId,
    t('titles.yours', lang),
    lines.length > 0 ? lines : [`<div>${escapeHtml(t('menu.noneYours', lang))}</div>`]
  );
}

/**
 * Shows the Mod's status.
 *
 * @param {string|null} playerId Who asked.
 * @param {string} legacyCommand 0.1.x command still answered, if any.
 * @returns {void}
 */
export function showStatus(playerId, legacyCommand) {
  const config = getConfig();
  const lang = config.language;
  const characters = findObjs({ _type: 'character' });
  const counts = { legacy: 0, beacon: 0, none: 0 };
  let rules2024 = 0;
  for (const c of characters) {
    const kind = sheetKind(c.id);
    counts[kind] += 1;
    if (kind !== 'none' && rulesFor(c.id) === '2024') {
      rules2024 += 1;
    }
  }
  const row = (key, value) => buildRow(t(`status.${key}`, lang), escapeHtml(String(value)), true);
  whisper(playerId, t('titles.status', lang), [
    row('version', SCRIPT_VERSION),
    row('beacon', counts.beacon),
    row('legacy', counts.legacy),
    row('none', counts.none),
    row('rules2024', rules2024),
    row('party', partyMembers().length),
    row('tracking', t(`values.tracking.${config.tracking}`, lang)),
    row(
      'pools',
      getPools()
        .map((p) => p.name)
        .join(', ')
    ),
    row('marker', markerName(config.marker)),
    row('fx', config.fx ? config.fxType : onOff(false, lang)),
    legacyCommand ? row('legacyCommand', `!${legacyCommand}`) : '',
  ]);
}

/**
 * Shows the command list.
 *
 * @param {string|null} playerId Who asked.
 * @param {boolean} gm Whether they act as GM.
 * @returns {void}
 */
export function showHelp(playerId, gm) {
  const lang = getConfig().language;
  const commands = gm
    ? HELP_COMMANDS
    : HELP_COMMANDS.filter(([, key]) => ['menu', 'spend', 'boost', 'party', 'help'].includes(key));
  const lines = commands.map(([text, key]) =>
    buildCommandHelp(`${COMMAND} ${text}`.trim(), t(gm ? `help.${key}` : `helpPlayer.${key}`, lang))
  );
  if (gm) {
    lines.push(buildDivider(), buildNote(t('menu.hint', lang, { help: HANDOUT_HELP_NAME })));
  }
  whisper(playerId, t('titles.help', lang), lines);
}
