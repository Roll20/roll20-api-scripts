import console from 'node:console';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import https from 'node:https';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import prettier from 'prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LOCALE_DIR = resolve(__dirname, '../src/locales/locale');
const SOURCE_LOCALE = 'en-US';
const GOOGLE_TRANSLATE_HOST = 'translate.googleapis.com';
const GOOGLE_TRANSLATE_PATH = '/translate_a/single?client=gtx';

/**
 * @typedef {{ timeoutMs: number, maxRetries: number, retryDelayMs: number, interRequestDelayMs: number }} TranslateConfig
 */

/** @type {TranslateConfig} */
const SYNC_CONFIG = {
  timeoutMs: 30000,
  maxRetries: 2,
  retryDelayMs: 8000,
  interRequestDelayMs: 2000,
};

/** @type {TranslateConfig} */
const REGENERATE_CONFIG = {
  timeoutMs: 60000,
  maxRetries: 4,
  retryDelayMs: 10000,
  interRequestDelayMs: 3000,
};

const PLACEHOLDER_PATTERN = /(\{[^{}]+\}|&lt;[^&]+&gt;|--[a-zA-Z0-9_-]+)/g;

/**
 * Loads a locale module from disk and returns its translation object.
 *
 * @param {string} localeCode Locale code to load from `src/locales/locale`.
 * @returns {Promise<Record<string, unknown>>} Parsed translation object exported by the locale module.
 */
async function loadLocale(localeCode) {
  const filePath = resolve(LOCALE_DIR, `${localeCode}.js`);
  const moduleUrl = pathToFileURL(filePath).href;
  const loaded = await import(moduleUrl);
  return loaded.default;
}

/**
 * Replaces templated tokens with stable placeholders before translation.
 *
 * @param {string} text Source string that may include placeholders like `{name}`.
 * @returns {{ masked: string, placeholders: string[] }} Masked string and placeholder list for later restoration.
 */
function maskPlaceholders(text) {
  const placeholders = [];
  const masked = text.replaceAll(PLACEHOLDER_PATTERN, (match) => {
    const token = `__CT_PLACEHOLDER_${placeholders.length}__`;
    placeholders.push(match);
    return token;
  });
  return { masked, placeholders };
}

/**
 * Restores templated tokens after translation has completed.
 *
 * @param {string} text Translated string containing placeholder tokens.
 * @param {string[]} placeholders Original placeholders captured before translation.
 * @returns {string} Restored string with original placeholders reinserted.
 */
function unmaskPlaceholders(text, placeholders) {
  return placeholders.reduce(
    (restored, placeholder, index) =>
      restored
        .replaceAll(`__CT_PLACEHOLDER_${index}__`, placeholder)
        .replaceAll(`__ct_placeholder_${index}__`, placeholder),
    text
  );
}

/**
 * Fetches translated payload JSON from Google Translate.
 *
 * @param {string} pathnameWithQuery Request path and query string for the fixed translate host.
 * @param {number} timeoutMs Request timeout in milliseconds.
 * @returns {Promise<unknown>} Parsed JSON payload from the translate endpoint.
 */
function fetchTranslatePayload(pathnameWithQuery, timeoutMs) {
  return new Promise((resolvePayload, rejectPayload) => {
    const request = https.request(
      {
        hostname: GOOGLE_TRANSLATE_HOST,
        method: 'GET',
        path: pathnameWithQuery,
      },
      (response) => {
        const statusCode = response.statusCode ?? 0;
        let body = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () => {
          if (statusCode < 200 || statusCode >= 300) {
            rejectPayload(new Error(`HTTP ${statusCode}`));
            return;
          }
          try {
            resolvePayload(JSON.parse(body));
          } catch (error) {
            rejectPayload(error);
          }
        });
      }
    );

    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error('Request timed out'));
    });
    request.on('error', (error) => rejectPayload(error));
    request.end();
  });
}

/**
 * Translates a single English string into a target locale with retry logic.
 *
 * @param {string} text English source text to translate.
 * @param {string} targetLocale Destination locale code.
 * @param {Map<string, string>} cache In-memory cache for locale/text translation results.
 * @param {TranslateConfig} config Translation configuration.
 * @param {number} [attempt=0] Current retry attempt number.
 * @returns {Promise<string>} Translated string (or original text if all retries fail).
 */
async function translateSingle(text, targetLocale, cache, config, attempt = 0) {
  if (!text.trim()) {
    return text;
  }

  const cacheKey = `${targetLocale}::${text}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const { masked, placeholders } = maskPlaceholders(text);
  const query = `&sl=en&tl=${encodeURIComponent(targetLocale)}&dt=t&q=${encodeURIComponent(masked)}`;
  const requestPath = `${GOOGLE_TRANSLATE_PATH}${query}`;

  // Add inter-request delay to avoid rate limiting
  await new Promise((resolve) => setTimeout(resolve, config.interRequestDelayMs));

  try {
    const payload = await fetchTranslatePayload(requestPath, config.timeoutMs);
    const translatedMasked = Array.isArray(payload?.[0])
      ? payload[0].map((part) => part?.[0] || '').join('')
      : text;

    const translated = unmaskPlaceholders(translatedMasked, placeholders);
    cache.set(cacheKey, translated);
    return translated;
  } catch (error) {
    if (attempt < config.maxRetries && error.message.includes('timed out')) {
      const delayMs = config.retryDelayMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return translateSingle(text, targetLocale, cache, config, attempt + 1);
    }

    if (attempt === config.maxRetries) {
      console.error(
        `[sync-locales] Translation failed for ${targetLocale} after ${config.maxRetries} retries: ${error.message}`
      );
    }
    cache.set(cacheKey, text);
    return text;
  }
}

/**
 * Creates a mutable translation placeholder that is finalized later.
 *
 * @param {string} sourceValue English source value that needs translation.
 * @param {Array<{ set: (value: string) => void, text: string }>} translationTasks Task list used to backfill translated values.
 * @returns {{ readonly value: string }} Deferred wrapper whose `value` is set after translation tasks complete.
 */
function createDeferredTranslation(sourceValue, translationTasks) {
  let translatedValue = sourceValue;
  translationTasks.push({
    text: sourceValue,
    set: (value) => {
      translatedValue = value;
    },
  });
  return {
    get value() {
      return translatedValue;
    },
  };
}

/**
 * Counts the number of strings that need translation in a locale.
 *
 * @param {unknown} sourceValue Source locale node from `en-US`.
 * @param {unknown} targetValue Target locale node at the same path.
 * @param {boolean} [forceRetranslate=false] Whether to count already-translated strings.
 * @returns {number} Count of strings needing translation.
 */
function countTranslationNeeds(sourceValue, targetValue, forceRetranslate = false) {
  if (typeof sourceValue === 'string') {
    return forceRetranslate || typeof targetValue !== 'string' || targetValue === sourceValue
      ? 1
      : 0;
  }

  if (Array.isArray(sourceValue)) {
    const targetArray = Array.isArray(targetValue) ? targetValue : [];
    return sourceValue.reduce(
      (sum, item, index) => sum + countTranslationNeeds(item, targetArray[index], forceRetranslate),
      0
    );
  }

  if (sourceValue && typeof sourceValue === 'object') {
    const targetObj =
      targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)
        ? /** @type {Record<string, unknown>} */ (targetValue)
        : {};
    return Object.keys(/** @type {Record<string, unknown>} */ (sourceValue)).reduce(
      (sum, key) =>
        sum +
        countTranslationNeeds(
          /** @type {Record<string, unknown>} */ (sourceValue)[key],
          targetObj[key],
          forceRetranslate
        ),
      0
    );
  }

  return 0;
}

/**
 * Synchronizes array entries recursively against source locale structure.
 *
 * @param {unknown[]} sourceArray Source array from `en-US`.
 * @param {unknown} targetValue Current locale value for the same key path.
 * @param {{ missing: number, translated: number }} stats Mutable counters for reporting sync actions.
 * @param {Array<{ set: (value: string) => void, text: string }>} translationTasks Deferred translation tasks collected during traversal.
 * @param {(sourceValue: unknown, targetValue: unknown, stats: { missing: number, translated: number }, translationTasks: Array<{ set: (value: string) => void, text: string }>) => unknown} syncEntry Recursive sync function used for nested values.
 * @returns {unknown[]} Synchronized array preserving source structure.
 */
function syncArray(sourceArray, targetValue, stats, translationTasks, syncEntry) {
  const targetArray = Array.isArray(targetValue) ? targetValue : [];
  const synced = [];

  for (let index = 0; index < sourceArray.length; index += 1) {
    if (index >= targetArray.length) {
      stats.missing += 1;
    }

    synced.push(syncEntry(sourceArray[index], targetArray[index], stats, translationTasks));
  }

  return synced;
}

/**
 * Synchronizes object keys recursively against the source schema.
 * Keys present in the target but absent from the source are pruned (counted in stats.pruned).
 *
 * @param {Record<string, unknown>} sourceObject Source object from `en-US`.
 * @param {unknown} targetValue Current locale value for the same object path.
 * @param {{ missing: number, translated: number, pruned: number }} stats Mutable counters for reporting sync actions.
 * @param {Array<{ set: (value: string) => void, text: string }>} translationTasks Deferred translation tasks collected during traversal.
 * @param {(sourceValue: unknown, targetValue: unknown, stats: { missing: number, translated: number, pruned: number }, translationTasks: Array<{ set: (value: string) => void, text: string }>) => unknown} syncEntry Recursive sync function used for nested values.
 * @returns {Record<string, unknown>} Synchronized object with schema-only keys retained.
 */
function syncObject(sourceObject, targetValue, stats, translationTasks, syncEntry) {
  const targetObject =
    targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)
      ? /** @type {Record<string, unknown>} */ (targetValue)
      : {};
  const synced = {};

  for (const key of Object.keys(sourceObject)) {
    if (!(key in targetObject)) {
      stats.missing += 1;
    }

    synced[key] = syncEntry(sourceObject[key], targetObject[key], stats, translationTasks);
  }

  for (const key of Object.keys(targetObject)) {
    if (!(key in synced)) {
      stats.pruned += 1;
    }
  }

  return synced;
}

/**
 * Synchronizes a single string value against the English source string.
 *
 * @param {unknown} sourceValue Source locale value expected to be a string.
 * @param {unknown} targetValue Target locale value to compare.
 * @param {{ missing: number, translated: number, forceRetranslate: boolean }} stats Mutable counters for reporting sync actions.
 * @param {Array<{ set: (value: string) => void, text: string }>} translationTasks Deferred translation tasks collected during traversal.
 * @returns {unknown} Existing localized string or deferred translated value wrapper.
 */
function syncStringValue(sourceValue, targetValue, stats, translationTasks) {
  if (typeof targetValue !== 'string') {
    stats.missing += 1;
    stats.translated += 1;
    return createDeferredTranslation(sourceValue, translationTasks);
  }

  if (stats.forceRetranslate || targetValue === sourceValue) {
    stats.translated += 1;
    return createDeferredTranslation(sourceValue, translationTasks);
  }

  return targetValue;
}

/**
 * Recursively synchronizes any translation node (string, array, object, or primitive).
 *
 * @param {unknown} sourceValue Source locale node from `en-US`.
 * @param {unknown} targetValue Target locale node at the same path.
 * @param {{ missing: number, translated: number }} stats Mutable counters for reporting sync actions.
 * @param {Array<{ set: (value: string) => void, text: string }>} translationTasks Deferred translation tasks collected during traversal.
 * @returns {unknown} Synchronized node value.
 */
function syncValue(sourceValue, targetValue, stats, translationTasks) {
  if (typeof sourceValue === 'string') {
    return syncStringValue(sourceValue, targetValue, stats, translationTasks);
  }

  if (Array.isArray(sourceValue)) {
    return syncArray(sourceValue, targetValue, stats, translationTasks, syncValue);
  }

  if (sourceValue && typeof sourceValue === 'object') {
    return syncObject(
      /** @type {Record<string, unknown>} */ (sourceValue),
      targetValue,
      stats,
      translationTasks,
      syncValue
    );
  }

  return targetValue ?? sourceValue;
}

/**
 * Resolves deferred translation placeholders into plain serializable values.
 *
 * @param {unknown} value Node value that may contain deferred translation wrappers.
 * @returns {unknown} Fully materialized value safe for JSON serialization.
 */
function finalizeValue(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => finalizeValue(entry));
  }

  if (value && typeof value === 'object') {
    if ('value' in value && Object.keys(value).length === 1) {
      return value.value;
    }

    const finalized = {};
    for (const [key, entryValue] of Object.entries(value)) {
      finalized[key] = finalizeValue(entryValue);
    }
    return finalized;
  }

  return value;
}

/**
 * Writes a locale translation object to its locale module file and formats it with Prettier.
 *
 * @param {string} localeCode Locale code for the output file name.
 * @param {Record<string, unknown>} localeData Synchronized translation data to persist.
 * @returns {Promise<void>} Resolves after the file has been written and formatted.
 */
async function writeLocale(localeCode, localeData) {
  const filePath = resolve(LOCALE_DIR, `${localeCode}.js`);
  const content = `const TRANSLATION = ${JSON.stringify(localeData, null, 2)};\n\nexport default TRANSLATION;\n`;
  writeFileSync(filePath, content, 'utf8');
  const formatted = await prettier.format(content, { filepath: filePath });
  writeFileSync(filePath, formatted, 'utf8');
}

/**
 * Processes translation tasks for a single locale and writes the result to disk.
 *
 * @param {string} localeCode Locale code to process.
 * @param {Record<string, unknown>} source Source locale data from `en-US`.
 * @param {Record<string, unknown>} localeData Current locale data.
 * @param {Map<string, string>} cache In-memory cache for translation results.
 * @param {TranslateConfig} config Translation configuration.
 * @param {boolean} forceRetranslate Whether to re-translate already-translated strings.
 * @returns {Promise<void>}
 */
async function processLocale(localeCode, source, localeData, cache, config, forceRetranslate) {
  const stats = { missing: 0, translated: 0, pruned: 0, forceRetranslate };
  const translationTasks = [];
  const syncedDraft = syncValue(source, localeData, stats, translationTasks);

  if (translationTasks.length === 0 && stats.pruned === 0) {
    console.info(`[sync-locales] ${localeCode}: up to date`);
    return;
  }

  const uniqueTexts = [...new Set(translationTasks.map((task) => task.text))];
  const translatedByText = new Map();

  for (const text of uniqueTexts) {
    const translated = await translateSingle(text, localeCode, cache, config);
    translatedByText.set(text, translated);
  }

  for (const task of translationTasks) {
    task.set(translatedByText.get(task.text) ?? task.text);
  }

  const synced = finalizeValue(syncedDraft);
  await writeLocale(localeCode, synced);

  const prunedNote = stats.pruned > 0 ? `, pruned ${stats.pruned}` : '';
  console.info(
    `[sync-locales] ${localeCode}: missing ${stats.missing}, translated ${stats.translated}${prunedNote}`
  );
}

/**
 * Synchronizes all non-English locale files against `en-US`.
 * Processes locales in order of most strings needing translation first,
 * then oldest by last-modified date, so interrupted runs make the most progress.
 *
 * @param {string} [localeFilter] Optional locale code to limit sync to a single locale.
 * @returns {Promise<void>} Resolves after all targeted locale files have been synchronized and written.
 */
export async function syncLocales(localeFilter) {
  const files = getLocaleCodes();

  if (localeFilter === SOURCE_LOCALE) {
    console.error(
      `[sync-locales] ${SOURCE_LOCALE} is the source locale and cannot be synchronized.`
    );
    process.exitCode = 1;
    return;
  }

  const source = await loadLocale(SOURCE_LOCALE);
  let targetLocaleCodes = files.filter((code) => code !== SOURCE_LOCALE);

  if (localeFilter) {
    targetLocaleCodes = targetLocaleCodes.filter((code) => code === localeFilter);
    if (targetLocaleCodes.length === 0) {
      console.error(`[sync-locales] No locale found matching: ${localeFilter}`);
      process.exitCode = 1;
      return;
    }
  }

  // Pre-scan all locales to determine priority ordering without making any HTTP requests
  const localeMetadata = await Promise.all(
    targetLocaleCodes.map(async (localeCode) => {
      const filePath = resolve(LOCALE_DIR, `${localeCode}.js`);
      const [localeData, { mtimeMs }] = [await loadLocale(localeCode), statSync(filePath)];
      const needsTranslation = countTranslationNeeds(source, localeData);
      return { localeCode, localeData, mtimeMs, needsTranslation };
    })
  );

  // Sort: most strings needing translation first, then oldest file as tiebreaker
  localeMetadata.sort((a, b) => {
    if (b.needsTranslation !== a.needsTranslation) {
      return b.needsTranslation - a.needsTranslation;
    }
    return a.mtimeMs - b.mtimeMs;
  });

  const cache = new Map();

  for (const { localeCode, localeData } of localeMetadata) {
    await processLocale(localeCode, source, localeData, cache, SYNC_CONFIG, false);
  }
}

/**
 * Regenerates translations for all (or a specific) locale, re-translating every string
 * regardless of whether it already has a translation. Uses longer timeouts.
 *
 * @param {string} [localeFilter] Optional locale code to limit regeneration to a single locale.
 * @returns {Promise<void>} Resolves after all targeted locale files have been regenerated.
 */
export async function regenerateLocales(localeFilter) {
  const files = readdirSync(LOCALE_DIR)
    .filter((file) => file.endsWith('.js'))
    .map((file) => file.replace(/\.js$/u, ''));

  if (localeFilter === SOURCE_LOCALE) {
    console.error(
      `[sync-locales] ${SOURCE_LOCALE} is the source locale and cannot be regenerated.`
    );
    process.exitCode = 1;
    return;
  }

  const source = await loadLocale(SOURCE_LOCALE);
  let targetLocaleCodes = files.filter((code) => code !== SOURCE_LOCALE);

  if (localeFilter) {
    targetLocaleCodes = targetLocaleCodes.filter((code) => code === localeFilter);
    if (targetLocaleCodes.length === 0) {
      console.error(`[sync-locales] No locale found matching: ${localeFilter}`);
      process.exitCode = 1;
      return;
    }
  }

  const cache = new Map();

  for (const localeCode of targetLocaleCodes) {
    const localeData = await loadLocale(localeCode);
    await processLocale(localeCode, source, localeData, cache, REGENERATE_CONFIG, true);
  }
}

/**
 * Parses CLI locale filter for regenerate mode.
 * Supports: --locale=<code>, --locale <code>, or a positional locale argument.
 *
 * @param {string[]} args CLI arguments excluding node and script paths.
 * @returns {string | undefined} Parsed locale filter.
 */
function parseLocaleFilter(args) {
  const isFlag = (arg) => arg.startsWith('-');
  const localeEq = args.find((arg) => arg.startsWith('--locale='))?.split('=')[1];
  const localeFlagIndex = args.indexOf('--locale');
  const localeNext =
    localeFlagIndex !== -1 && args[localeFlagIndex + 1] && !isFlag(args[localeFlagIndex + 1])
      ? args[localeFlagIndex + 1]
      : undefined;
  const positional = args.find((arg) => arg !== '--regenerate' && !isFlag(arg));

  const candidates = [localeEq, localeNext, positional].filter(
    (value, index, values) =>
      typeof value === 'string' && value.length > 0 && values.indexOf(value) === index
  );

  if (localeFlagIndex !== -1 && !localeNext && !localeEq) {
    console.error('[sync-locales] Missing locale value after --locale.');
    process.exitCode = 1;
    return undefined;
  }

  if (candidates.length > 1) {
    console.error(
      `[sync-locales] Conflicting locale values provided: ${candidates.join(', ')}. Use a single locale.`
    );
    process.exitCode = 1;
    return undefined;
  }

  return candidates[0];
}

/**
 * Collects locale codes from the locale directory (without `.js` extension).
 *
 * @returns {string[]} Locale codes discovered under `src/locales/locale`.
 */
function getLocaleCodes() {
  return readdirSync(LOCALE_DIR)
    .filter((file) => file.endsWith('.js'))
    .map((file) => file.replace(/\.js$/u, ''));
}

/**
 * Builds a sync timing estimate used for pre-run warnings.
 *
 * Estimated formula requested by maintainers:
 * - minimum: 4 minutes x locale count
 * - maximum: 7 minutes x locales needing translation
 *
 * @param {string} [localeFilter] Optional locale code to limit estimate scope.
 * @returns {Promise<{ totalLocales: number, localesNeedingTranslation: number, estimatedMinMinutes: number, estimatedMaxMinutes: number } | null>}
 */
async function estimateSyncTiming(localeFilter) {
  const files = getLocaleCodes();
  const source = await loadLocale(SOURCE_LOCALE);
  let targetLocaleCodes = files.filter((code) => code !== SOURCE_LOCALE);

  if (localeFilter) {
    if (localeFilter === SOURCE_LOCALE) {
      console.error(
        `[sync-locales] ${SOURCE_LOCALE} is the source locale and cannot be synchronized.`
      );
      process.exitCode = 1;
      return null;
    }

    targetLocaleCodes = targetLocaleCodes.filter((code) => code === localeFilter);
    if (targetLocaleCodes.length === 0) {
      console.error(`[sync-locales] No locale found matching: ${localeFilter}`);
      process.exitCode = 1;
      return null;
    }
  }

  const localeMetadata = await Promise.all(
    targetLocaleCodes.map(async (localeCode) => {
      const localeData = await loadLocale(localeCode);
      const needsTranslation = countTranslationNeeds(source, localeData);
      return { localeCode, needsTranslation };
    })
  );

  const localesNeedingTranslation = localeMetadata.filter(
    ({ needsTranslation }) => needsTranslation > 0
  ).length;

  return {
    totalLocales: targetLocaleCodes.length,
    localesNeedingTranslation,
    estimatedMinMinutes: targetLocaleCodes.length * 4,
    estimatedMaxMinutes: localesNeedingTranslation * 7,
  };
}

/**
 * Prompts the user to confirm whether the run should proceed.
 *
 * @param {string[]} args CLI arguments excluding node and script paths.
 * @param {string} message Prompt message shown before confirmation.
 * @returns {Promise<boolean>} True when user confirms, otherwise false.
 */
async function confirmProceed(args, message) {
  if (args.includes('--yes') || args.includes('-y')) {
    return true;
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.warn(
      '[sync-locales] Non-interactive terminal detected; proceeding without confirmation.'
    );
    return true;
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await rl.question(`${message}\n[sync-locales] Proceed? (y/N): `);
    return ['y', 'yes'].includes(answer.trim().toLowerCase());
  } finally {
    rl.close();
  }
}

/**
 * If this module is executed directly, run syncLocales or regenerateLocales based on CLI flags.
 * Flags:
 *   --regenerate     Force re-translation of all strings (uses longer timeouts).
 *   --locale=<code>  Limit regeneration to a single locale (only valid with --regenerate).
 */
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const isRegenerate = args.includes('--regenerate');
  const localeFilter = parseLocaleFilter(args);

  if (process.exitCode) {
    process.exit(process.exitCode);
  }

  if (isRegenerate) {
    const localeCodes = getLocaleCodes().filter((code) => code !== SOURCE_LOCALE);
    const targetCount = localeFilter ? 1 : localeCodes.length;
    const targetLabel = localeFilter ? `${localeFilter}` : `${targetCount} locales`;
    const totalMin = targetCount * 30;
    const totalMax = targetCount * 60;

    const shouldProceed = await confirmProceed(
      args,
      `[sync-locales] Regenerate mode selected for ${targetLabel}. This can take 30-60 minutes per locale (about ${totalMin}-${totalMax} minutes total).`
    );

    if (!shouldProceed) {
      console.info('[sync-locales] Cancelled by user.');
      process.exit(0);
    }
  } else {
    const syncEstimate = await estimateSyncTiming(localeFilter);
    if (!syncEstimate) {
      process.exit(process.exitCode || 1);
    }
    const shouldProceed = await confirmProceed(
      args,
      `[sync-locales] Sync mode selected. This usually takes several minutes. Estimated minimum: about ${syncEstimate.estimatedMinMinutes} minutes (4 x ${syncEstimate.totalLocales} locales). Estimated maximum: about ${syncEstimate.estimatedMaxMinutes} minutes (7 x ${syncEstimate.localesNeedingTranslation} locales needing translation).`
    );

    if (!shouldProceed) {
      console.info('[sync-locales] Cancelled by user.');
      process.exit(0);
    }
  }

  if (isRegenerate) {
    await regenerateLocales(localeFilter);
  } else {
    await syncLocales(localeFilter);
  }
}
