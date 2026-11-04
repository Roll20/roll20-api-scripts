import { buildCard, TABLE_RESET, TABLE_STYLE, TD_BASE_STYLE, TH_STYLE } from './chat.js';
import {
  COLOR_CHANGED,
  COLOR_MUTED,
  COLOR_TEXT,
  JOURNAL_STATUS_NAME,
  LAYER_GM,
  LAYER_MAP,
  LAYER_TOKEN,
} from './constants.js';
import { t } from './i18n.js';
import { filterTokenRecords, getConfig, getTokenRecord } from './state.js';
import { getSelectedTokens } from './tokens.js';
import {
  escapeHtml,
  formatMod,
  formatPct,
  formatTimestamp,
  getCurrentPageId,
  getGraphicToken,
  getTokenName,
  getTokensOnPage,
} from './utils.js';

// ---------------------------------------------------------------------------
// HTML builders for the status journal
// ---------------------------------------------------------------------------

// The report is built from the same cards and tables as the chat replies (chat.js)
const RESET = TABLE_RESET;
const TR_STYLE = RESET;
const SUMMARY_TD_LABEL_STYLE = `${RESET};padding:1px 0;color:${COLOR_MUTED}`;
const SUMMARY_TD_VALUE_STYLE = `${RESET};padding:1px 0;color:${COLOR_TEXT};font-weight:bold;text-align:right`;
const TD_BASE = TD_BASE_STYLE;
const TD_STYLE = `${TD_BASE};color:${COLOR_TEXT};font-weight:bold`;
const TD_CHANGED_STYLE = `${TD_BASE};color:${COLOR_CHANGED};font-weight:bold`;
const TD_MUTED_STYLE = `${TD_BASE};color:${COLOR_MUTED}`;
const CARD_GAP = '<div style="height:8px"></div>';

/**
 * Returns a human-readable layer name using the active locale.
 *
 * @param {string} layer Roll20 layer identifier.
 * @param {string} lang Locale code.
 * @returns {string} Display name.
 */
function layerLabel(layer, lang) {
  switch (layer) {
    case LAYER_TOKEN:
      return t('ui.tokenLayer', lang);
    case LAYER_GM:
      return t('ui.gmLayer', lang);
    case LAYER_MAP:
      return t('ui.mapLayer', lang);
    default:
      return layer || '—';
  }
}

/**
 * Builds an HTML table row for a single tracked token.
 *
 * @param {object} record Token state record.
 * @param {Graphic|null} token Live token object (or null if deleted).
 * @param {string} lang Locale code.
 * @returns {string} HTML tr string.
 */
function buildTokenRow(record, token, lang) {
  const name = token ? escapeHtml(getTokenName(token)) : `<em style="color:${COLOR_MUTED}">—</em>`;
  const layer = token
    ? layerLabel(token.get('layer'), lang)
    : `<em style="color:${COLOR_MUTED}">[deleted]</em>`;

  const hpChanged = record.hpModifier !== 100;
  const acChanged = record.acModifier !== 0;

  // Minions are flagged with -999: their hit points are set to 1, not scaled
  const hpText = record.hpModifier === -999 ? '= 1' : formatPct(record.hpModifier);
  const hpCell = hpChanged
    ? `<td style="${TD_CHANGED_STYLE}">${hpText}</td>`
    : `<td style="${TD_MUTED_STYLE}">—</td>`;

  const acCell = acChanged
    ? `<td style="${TD_CHANGED_STYLE}">${formatMod(record.acModifier)}</td>`
    : `<td style="${TD_MUTED_STYLE}">—</td>`;

  const presetCell = record.preset
    ? `<td style="${TD_CHANGED_STYLE}">${escapeHtml(record.preset)}</td>`
    : `<td style="${TD_MUTED_STYLE}">—</td>`;

  return [
    `<tr style="${TR_STYLE}">`,
    `<td style="${TD_STYLE}">${name}</td>`,
    `<td style="${TD_MUTED_STYLE}">${token ? escapeHtml(layer) : layer}</td>`,
    hpCell,
    acCell,
    presetCell,
    '</tr>',
  ].join('');
}

/**
 * Builds the full HTML content for the status journal handout.
 *
 * @param {object[]} records Token records to include in the report.
 * @param {{ pageId: string, generatedAt: number, totalOnPage: number }} meta Report metadata.
 * @returns {string} HTML string suitable for a Roll20 handout.
 */
export function buildStatusReportHtml(records, meta) {
  const lang = getConfig().language;

  const trackedCount = records.length;
  const changedCount = records.filter(
    (r) => r.hpModifier !== 100 || r.acModifier !== 0 || r.preset
  ).length;
  const hiddenCount = records.filter((r) => {
    const token = getGraphicToken(r.tokenId);
    return token?.get('layer') === LAYER_GM;
  }).length;
  const bossCount = records.filter((r) => ['boss', 'legendary'].includes(r.preset)).length;
  const minionCount = records.filter((r) => r.preset === 'minion').length;

  const summaryHtml = buildCard(
    t('report.summary', lang),
    [
      `<table style="${TABLE_STYLE}">`,
      buildSummaryRow(t('report.generated', lang), formatTimestamp(meta.generatedAt)),
      buildSummaryRow(t('report.tokensOnPage', lang), String(meta.totalOnPage)),
      buildSummaryRow(t('report.trackedTokens', lang), String(trackedCount)),
      buildSummaryRow(t('report.changed', lang), String(changedCount), COLOR_CHANGED),
      buildSummaryRow(t('report.hiddenGm', lang), String(hiddenCount)),
      buildSummaryRow(t('report.bossesLegendary', lang), String(bossCount)),
      buildSummaryRow(t('report.minions', lang), String(minionCount)),
      '</table>',
    ].join('')
  );

  if (records.length === 0) {
    return (
      summaryHtml +
      CARD_GAP +
      buildCard(
        t('report.trackedTokens', lang),
        `<div style="color:${COLOR_MUTED};font-style:italic">${escapeHtml(t('report.noTrackedTokens', lang))}</div>`
      )
    );
  }

  const tableHtml = [
    `<table style="${TABLE_STYLE}">`,
    `<thead><tr style="${TR_STYLE}">`,
    `<th style="${TH_STYLE}">${escapeHtml(t('report.tokenCol', lang))}</th>`,
    `<th style="${TH_STYLE}">${escapeHtml(t('report.layerCol', lang))}</th>`,
    `<th style="${TH_STYLE}">${escapeHtml(t('report.hpCol', lang))}</th>`,
    `<th style="${TH_STYLE}">${escapeHtml(t('report.acCol', lang))}</th>`,
    `<th style="${TH_STYLE}">${escapeHtml(t('report.presetCol', lang))}</th>`,
    '</tr></thead>',
    '<tbody>',
    ...records.map((record) => buildTokenRow(record, getGraphicToken(record.tokenId), lang)),
    '</tbody>',
    '</table>',
  ].join('');

  return summaryHtml + CARD_GAP + buildCard(t('report.trackedTokens', lang), tableHtml);
}

/**
 * Builds a summary key-value row.
 *
 * @param {string} label Key label.
 * @param {string} value Value string.
 * @param {string} [valueColor] Optional color override for the value.
 * @returns {string} HTML string.
 */
function buildSummaryRow(label, value, valueColor) {
  const valStyle = valueColor
    ? `${SUMMARY_TD_VALUE_STYLE};color:${valueColor}`
    : SUMMARY_TD_VALUE_STYLE;
  return [
    `<tr style="${TR_STYLE}">`,
    `<td style="${SUMMARY_TD_LABEL_STYLE}">${escapeHtml(label)}</td>`,
    `<td style="${valStyle}">${escapeHtml(value)}</td>`,
    '</tr>',
  ].join('');
}

/**
 * Writes or updates the Combat Encounter Director Status handout.
 *
 * @param {string} content HTML content to write into the handout notes.
 * @returns {void}
 */
export function updateStatusHandout(content) {
  const existing = findObjs({ type: 'handout', name: JOURNAL_STATUS_NAME })[0];
  if (existing) {
    existing.set('notes', content);
  } else {
    createObj('handout', {
      name: JOURNAL_STATUS_NAME,
      notes: content,
    });
  }
}

/**
 * Generates and writes a status report for all tracked tokens on a page.
 *
 * @param {string} [pageId] Page to report on. Pass the commanding GM's page ID
 *   (via getPlayerPageId) to avoid the wrong-GM-page issue in multi-GM games.
 *   Defaults to the first GM's current page.
 * @returns {{ tokenCount: number }} Result summary.
 */
export function refreshStatusReport(pageId) {
  const resolvedPageId = pageId || getCurrentPageId();
  const allPageTokens = getTokensOnPage(resolvedPageId);
  const records = filterTokenRecords((r) => r.pageId === resolvedPageId);

  const html = buildStatusReportHtml(records, {
    pageId: resolvedPageId,
    generatedAt: Date.now(),
    totalOnPage: allPageTokens.length,
  });

  updateStatusHandout(html);
  return { tokenCount: records.length };
}

/**
 * Generates and writes a status report for a specific set of token records.
 *
 * @param {object[]} records Token records to report on.
 * @param {string} [pageId] Page ID for the "tokens on page" summary count.
 *   Defaults to the first GM's current page.
 * @returns {void}
 */
export function writeFilteredReport(records, pageId) {
  const resolvedPageId = pageId || getCurrentPageId();
  const allPageTokens = getTokensOnPage(resolvedPageId);

  const html = buildStatusReportHtml(records, {
    pageId: resolvedPageId,
    generatedAt: Date.now(),
    totalOnPage: allPageTokens.length,
  });

  updateStatusHandout(html);
}

/**
 * Generates a status report limited to currently selected tokens.
 *
 * @param {object} msg Roll20 chat message.
 * @param {string} [pageId] Page ID for the summary count.
 * @returns {{ tokenCount: number }} Result summary.
 */
export function reportSelectedTokens(msg, pageId) {
  const tokens = getSelectedTokens(msg);
  const records = tokens.map((tok) => getTokenRecord(tok.id)).filter(Boolean);

  writeFilteredReport(records, pageId);
  return { tokenCount: records.length };
}

/**
 * Generates a status report for all tokens that have been modified.
 *
 * @param {string} [pageId] Page ID for the summary count.
 * @returns {{ tokenCount: number }} Result summary.
 */
export function reportChangedTokens(pageId) {
  const records = filterTokenRecords((r) => r.hpModifier !== 100 || r.acModifier !== 0 || r.preset);
  writeFilteredReport(records, pageId);
  return { tokenCount: records.length };
}

/**
 * Clears the status journal content.
 *
 * @returns {void}
 */
export function clearStatusReport() {
  const lang = getConfig().language;
  const emptyHtml = buildCard(
    t('report.summary', lang),
    `<div style="color:${COLOR_MUTED};font-style:italic">${escapeHtml(t('confirm.reportCleared', lang))}</div>`
  );
  updateStatusHandout(emptyHtml);
}
