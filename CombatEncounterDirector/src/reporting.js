import {
  COLOR_BORDER,
  COLOR_CARD_BG_BOTTOM,
  COLOR_CARD_BG_TOP,
  COLOR_CHANGED,
  COLOR_HEADER_BG,
  COLOR_HEADER_TEXT,
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

const TABLE_STYLE = 'width:100%;border-collapse:collapse;font-size:0.85em';
const SUMMARY_TABLE_STYLE = 'width:100%;border-collapse:collapse;font-size:0.9em';
const SUMMARY_TD_LABEL_STYLE = `padding:3px 8px 3px 0;color:${COLOR_MUTED}`;
const SUMMARY_TD_VALUE_STYLE = `padding:3px 0 3px 8px;color:${COLOR_TEXT};font-weight:bold;text-align:right`;
const TH_STYLE = [
  `background:${COLOR_HEADER_BG}`,
  `color:${COLOR_HEADER_TEXT}`,
  'padding:3px 5px',
  'text-align:left',
  'font-variant:small-caps',
  'font-size:0.9em',
].join(';');
const TD_STYLE = `padding:2px 5px;border-bottom:1px solid ${COLOR_BORDER};color:${COLOR_TEXT}`;
const TD_CHANGED_STYLE = `padding:2px 5px;border-bottom:1px solid ${COLOR_BORDER};color:${COLOR_CHANGED};font-weight:bold`;
const TD_MUTED_STYLE = `padding:2px 5px;border-bottom:1px solid ${COLOR_BORDER};color:${COLOR_MUTED}`;

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
  const dmgChanged = record.damageModifier !== 100;

  const hpCell = hpChanged
    ? `<td style="${TD_CHANGED_STYLE}">${formatPct(record.hpModifier)}</td>`
    : `<td style="${TD_MUTED_STYLE}">—</td>`;

  const acCell = acChanged
    ? `<td style="${TD_CHANGED_STYLE}">${formatMod(record.acModifier)}</td>`
    : `<td style="${TD_MUTED_STYLE}">—</td>`;

  const dmgCell = dmgChanged
    ? `<td style="${TD_CHANGED_STYLE}">${formatPct(record.damageModifier)}</td>`
    : `<td style="${TD_MUTED_STYLE}">—</td>`;

  const presetCell = record.preset
    ? `<td style="${TD_CHANGED_STYLE}">${escapeHtml(record.preset)}</td>`
    : `<td style="${TD_MUTED_STYLE}">—</td>`;

  return [
    '<tr>',
    `<td style="${TD_STYLE}">${name}</td>`,
    `<td style="${TD_MUTED_STYLE}">${token ? escapeHtml(layer) : layer}</td>`,
    hpCell,
    acCell,
    dmgCell,
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
    (r) => r.hpModifier !== 100 || r.acModifier !== 0 || r.damageModifier !== 100 || r.preset
  ).length;
  const hiddenCount = records.filter((r) => {
    const token = getGraphicToken(r.tokenId);
    return token?.get('layer') === LAYER_GM;
  }).length;
  const bossCount = records.filter((r) => ['boss', 'legendary'].includes(r.preset)).length;
  const minionCount = records.filter((r) => r.preset === 'minion').length;

  const cardStyle = [
    `background-image:-webkit-linear-gradient(135deg,${COLOR_CARD_BG_TOP} 0%,${COLOR_CARD_BG_BOTTOM} 100%)`,
    'border-radius:4px',
    'padding:6px 8px',
    'margin-bottom:8px',
    `border:1px solid ${COLOR_BORDER}`,
  ].join(';');

  const summaryHtml = [
    `<div style="${cardStyle}">`,
    `<div style="font-weight:bold;font-size:1.05em;color:${COLOR_HEADER_TEXT};margin-bottom:4px">${escapeHtml(t('report.summary', lang))}</div>`,
    `<table style="${SUMMARY_TABLE_STYLE}">`,
    buildSummaryRow(t('report.generated', lang), formatTimestamp(meta.generatedAt)),
    buildSummaryRow(t('report.tokensOnPage', lang), String(meta.totalOnPage)),
    buildSummaryRow(t('report.trackedTokens', lang), String(trackedCount)),
    buildSummaryRow(t('report.changed', lang), String(changedCount), COLOR_CHANGED),
    buildSummaryRow(t('report.hiddenGm', lang), String(hiddenCount)),
    buildSummaryRow(t('report.bossesLegendary', lang), String(bossCount)),
    buildSummaryRow(t('report.minions', lang), String(minionCount)),
    '</table>',
    '</div>',
  ].join('');

  if (records.length === 0) {
    return (
      summaryHtml +
      `<p style="color:${COLOR_MUTED};font-style:italic">${escapeHtml(t('report.noTrackedTokens', lang))}</p>`
    );
  }

  const tableHtml = [
    `<table style="${TABLE_STYLE}">`,
    '<thead><tr>',
    `<th style="${TH_STYLE}">${escapeHtml(t('report.tokenCol', lang))}</th>`,
    `<th style="${TH_STYLE}">${escapeHtml(t('report.layerCol', lang))}</th>`,
    `<th style="${TH_STYLE}">${escapeHtml(t('report.hpCol', lang))}</th>`,
    `<th style="${TH_STYLE}">${escapeHtml(t('report.acCol', lang))}</th>`,
    `<th style="${TH_STYLE}">${escapeHtml(t('report.dmgCol', lang))}</th>`,
    `<th style="${TH_STYLE}">${escapeHtml(t('report.presetCol', lang))}</th>`,
    '</tr></thead>',
    '<tbody>',
    ...records.map((record) => buildTokenRow(record, getGraphicToken(record.tokenId), lang)),
    '</tbody>',
    '</table>',
  ].join('');

  return summaryHtml + tableHtml;
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
    ? `padding:2px 0;color:${valueColor};font-weight:bold;text-align:right`
    : SUMMARY_TD_VALUE_STYLE;
  return [
    '<tr>',
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
  const records = filterTokenRecords(
    (r) => r.hpModifier !== 100 || r.acModifier !== 0 || r.damageModifier !== 100 || r.preset
  );
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
  const emptyHtml = `<p style="color:${COLOR_MUTED};font-style:italic">${escapeHtml(t('confirm.reportCleared', lang))}</p>`;
  updateStatusHandout(emptyHtml);
}
