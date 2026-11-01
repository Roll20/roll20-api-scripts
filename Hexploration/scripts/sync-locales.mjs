import console from 'node:console';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import https from 'node:https';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import prettier from 'prettier';

// The same file is used by every Mod in this repository; keep the copies identical.

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LOCALE_DIR = resolve(__dirname, '../src/locales/locale');
const SOURCE_LOCALE = 'en-US';
const GOOGLE_TRANSLATE_HOST = 'translate.googleapis.com';
const GOOGLE_TRANSLATE_PATH = '/translate_a/single?client=gtx';
const DEFAULT_CONCURRENCY = 4;

/**
 * @typedef {{ timeoutMs: number, maxRetries: number, retryDelayMs: number, interRequestDelayMs: number }} TranslateConfig
 */

/**
 * Which strings a run translates.
 * - `keys`: key paths (`handout.commands.mods`) translated again even when they have a translation.
 * - `untranslated`: also re-send strings that are still identical to English.
 * - `all`: re-translate every string (regenerate mode).
 *
 * @typedef {{ keys: string[], untranslated: boolean, all: boolean }} SyncPolicy
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
// The translator sometimes changes the case of mask tokens, so they are matched case-insensitively.
const MASK_TOKEN_PATTERN = /__L10N_PLACEHOLDER_(\d+)__/giu;

/**
 * Loads a locale module from disk and returns its translation object.
 *
 * @param {string} localeCode Locale code to load from `src/locales/locale`.
 * @returns {Promise<Record<string, unknown>>} Parsed translation object exported by the locale module.
 */
async function loadLocale(localeCode) {
  const filePath = resolve(LOCALE_DIR, `${localeCode}.js`);
  const moduleUrl = `${pathToFileURL(filePath).href}?t=${statSync(filePath).mtimeMs}`;
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
    const token = `__L10N_PLACEHOLDER_${placeholders.length}__`;
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
  return text.replaceAll(
    MASK_TOKEN_PATTERN,
    (match, index) => placeholders[Number(index)] ?? match
  );
}

/**
 * Returns true when a masked string still contains words to translate.
 *
 * Strings made only of placeholders and punctuation (e.g. `{source} {verb} {target}.`)
 * must not be sent for translation: the service translates the mask tokens themselves.
 *
 * @param {string} masked Source string after placeholder masking.
 * @returns {boolean} True when at least one letter remains outside mask tokens.
 */
function hasTranslatableText(masked) {
  return /\p{L}/u.test(masked.replaceAll(MASK_TOKEN_PATTERN, ''));
}

/**
 * Returns true when every source placeholder survived translation.
 *
 * @param {string} translated Translated string after placeholder restoration.
 * @param {string[]} placeholders Original placeholders captured before translation.
 * @returns {boolean} True when each placeholder appears at least as often as in the source.
 */
function placeholdersIntact(translated, placeholders) {
  return placeholders.every(
    (placeholder) =>
      translated.split(placeholder).length - 1 >=
      placeholders.filter((item) => item === placeholder).length
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
  if (!hasTranslatableText(masked)) {
    cache.set(cacheKey, text);
    return text;
  }

  const query = `&sl=en&tl=${encodeURIComponent(targetLocale)}&dt=t&q=${encodeURIComponent(masked)}`;
  const requestPath = `${GOOGLE_TRANSLATE_PATH}${query}`;

  // Add inter-request delay to avoid rate limiting.
  await new Promise((resolve) => setTimeout(resolve, config.interRequestDelayMs));

  try {
    const payload = await fetchTranslatePayload(requestPath, config.timeoutMs);
    const translatedMasked = Array.isArray(payload?.[0])
      ? payload[0].map((part) => part?.[0] || '').join('')
      : text;

    const translated = unmaskPlaceholders(translatedMasked, placeholders);
    if (!placeholdersIntact(translated, placeholders)) {
      console.warn(
        `[sync-locales] ${targetLocale}: placeholders were altered in translation; keeping English for "${text}"`
      );
      cache.set(cacheKey, text);
      return text;
    }
    cache.set(cacheKey, translated);
    return translated;
  } catch (error) {
    // Rate limits (429) and server errors are worth waiting out, like timeouts.
    const retryable = /timed out|HTTP (429|5\d\d)/u.test(error.message);
    if (attempt < config.maxRetries && retryable) {
      const delayMs = config.retryDelayMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return translateSingle(text, targetLocale, cache, config, attempt + 1);
    }

    // Keep the English text without caching it; `--untranslated` or `--keys` can retry it later.
    console.error(
      `[sync-locales] Translation failed for ${targetLocale} after ${attempt} retries: ${error.message}`
    );
    return text;
  }
}

/**
 * Creates a mutable translation placeholder that is finalized later.
 *
 * @param {string} sourceValue English source value that needs translation.
 * @param {string} path Key path of the value, for dry runs.
 * @param {Array<{ set: (value: string) => void, text: string, path: string }>} translationTasks Task list used to backfill translated values.
 * @returns {{ readonly value: string }} Deferred wrapper whose `value` is set after translation tasks complete.
 */
function createDeferredTranslation(sourceValue, path, translationTasks) {
  let translatedValue = sourceValue;
  translationTasks.push({
    text: sourceValue,
    path,
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
 * Joins a parent key path and a child key or array index.
 *
 * @param {string} parent Parent path ('' at the root).
 * @param {string|number} key Child key or index.
 * @returns {string} Dotted path such as `handout.commands.mods` or `quickStart.steps.2`.
 */
function joinPath(parent, key) {
  return parent ? `${parent}.${key}` : String(key);
}

/**
 * Returns true when a path is one of the requested keys, or inside one.
 *
 * @param {string} path Key path of a string.
 * @param {string[]} keys Requested key paths.
 * @returns {boolean} True when the string was asked for.
 */
function isRequestedKey(path, keys) {
  return keys.some((key) => path === key || path.startsWith(`${key}.`));
}

/**
 * Decides whether a source string needs translating into the target locale.
 *
 * Strings that already exist in the target are left alone by default, even when
 * they match English: many are meant to (grid names such as "Hex (V)", "CRL",
 * command examples), and re-sending them on every run mistranslated them.
 *
 * @param {string} path Key path of the string.
 * @param {string} sourceValue English value.
 * @param {unknown} targetValue Current value in the target locale.
 * @param {SyncPolicy} policy What this run translates.
 * @returns {boolean} True when the string should be translated.
 */
function needsTranslation(path, sourceValue, targetValue, policy) {
  if (typeof targetValue !== 'string') {
    return true;
  }
  if (policy.all || isRequestedKey(path, policy.keys)) {
    return true;
  }
  return policy.untranslated && targetValue === sourceValue;
}

/**
 * Counts the number of strings that need translation in a locale.
 *
 * @param {unknown} sourceValue Source locale node from `en-US`.
 * @param {unknown} targetValue Target locale node at the same path.
 * @param {SyncPolicy} policy What this run translates.
 * @param {string} [path=''] Key path of the node.
 * @returns {number} Count of strings needing translation.
 */
function countTranslationNeeds(sourceValue, targetValue, policy, path = '') {
  if (typeof sourceValue === 'string') {
    return needsTranslation(path, sourceValue, targetValue, policy) ? 1 : 0;
  }

  if (Array.isArray(sourceValue)) {
    const targetArray = Array.isArray(targetValue) ? targetValue : [];
    return sourceValue.reduce(
      (sum, item, index) =>
        sum + countTranslationNeeds(item, targetArray[index], policy, joinPath(path, index)),
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
          policy,
          joinPath(path, key)
        ),
      0
    );
  }

  return 0;
}

/**
 * Returns true when a key path names something in the source locale.
 *
 * @param {Record<string, unknown>} source Source locale data.
 * @param {string} key Dotted key path.
 * @returns {boolean} True when the path exists.
 */
function keyExists(source, key) {
  let node = source;
  for (const part of key.split('.')) {
    if (!node || typeof node !== 'object' || !(part in node)) {
      return false;
    }
    node = node[part];
  }
  return true;
}

/**
 * @typedef {{ missing: number, translated: number, pruned: number, policy: SyncPolicy }} SyncStats
 * @typedef {Array<{ set: (value: string) => void, text: string, path: string }>} TranslationTasks
 */

/**
 * Synchronizes array entries recursively against source locale structure.
 *
 * @param {unknown[]} sourceArray Source array from `en-US`.
 * @param {unknown} targetValue Current locale value for the same key path.
 * @param {SyncStats} stats Mutable counters for reporting sync actions.
 * @param {TranslationTasks} translationTasks Deferred translation tasks collected during traversal.
 * @param {string} path Key path of the array.
 * @returns {unknown[]} Synchronized array preserving source structure.
 */
function syncArray(sourceArray, targetValue, stats, translationTasks, path) {
  const targetArray = Array.isArray(targetValue) ? targetValue : [];
  const synced = [];

  for (let index = 0; index < sourceArray.length; index += 1) {
    if (index >= targetArray.length) {
      stats.missing += 1;
    }

    synced.push(
      syncValue(
        sourceArray[index],
        targetArray[index],
        stats,
        translationTasks,
        joinPath(path, index)
      )
    );
  }

  return synced;
}

/**
 * Synchronizes object keys recursively against the source schema.
 * Keys present in the target but absent from the source are pruned (counted in stats.pruned).
 *
 * @param {Record<string, unknown>} sourceObject Source object from `en-US`.
 * @param {unknown} targetValue Current locale value for the same object path.
 * @param {SyncStats} stats Mutable counters for reporting sync actions.
 * @param {TranslationTasks} translationTasks Deferred translation tasks collected during traversal.
 * @param {string} path Key path of the object.
 * @returns {Record<string, unknown>} Synchronized object with schema-only keys retained.
 */
function syncObject(sourceObject, targetValue, stats, translationTasks, path) {
  const targetObject =
    targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)
      ? /** @type {Record<string, unknown>} */ (targetValue)
      : {};
  const synced = {};

  for (const key of Object.keys(sourceObject)) {
    if (!(key in targetObject)) {
      stats.missing += 1;
    }

    synced[key] = syncValue(
      sourceObject[key],
      targetObject[key],
      stats,
      translationTasks,
      joinPath(path, key)
    );
  }

  for (const key of Object.keys(targetObject)) {
    if (!(key in synced)) {
      stats.pruned += 1;
    }
  }

  return synced;
}

/**
 * Recursively synchronizes any translation node (string, array, object, or primitive).
 *
 * @param {unknown} sourceValue Source locale node from `en-US`.
 * @param {unknown} targetValue Target locale node at the same path.
 * @param {SyncStats} stats Mutable counters for reporting sync actions.
 * @param {TranslationTasks} translationTasks Deferred translation tasks collected during traversal.
 * @param {string} [path=''] Key path of the node.
 * @returns {unknown} Synchronized node value.
 */
function syncValue(sourceValue, targetValue, stats, translationTasks, path = '') {
  if (typeof sourceValue === 'string') {
    if (!needsTranslation(path, sourceValue, targetValue, stats.policy)) {
      return targetValue;
    }
    stats.translated += 1;
    return createDeferredTranslation(sourceValue, path, translationTasks);
  }

  if (Array.isArray(sourceValue)) {
    return syncArray(sourceValue, targetValue, stats, translationTasks, path);
  }

  if (sourceValue && typeof sourceValue === 'object') {
    return syncObject(
      /** @type {Record<string, unknown>} */ (sourceValue),
      targetValue,
      stats,
      translationTasks,
      path
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
 * Writes a locale translation object to its locale module file and formats it with
 * Prettier, using the Mod's own Prettier settings so unchanged lines stay unchanged.
 *
 * @param {string} localeCode Locale code for the output file name.
 * @param {Record<string, unknown>} localeData Synchronized translation data to persist.
 * @returns {Promise<void>} Resolves after the file has been written and formatted.
 */
async function writeLocale(localeCode, localeData) {
  const filePath = resolve(LOCALE_DIR, `${localeCode}.js`);
  const content = `const TRANSLATION = ${JSON.stringify(localeData, null, 2)};\n\nexport default TRANSLATION;\n`;
  const config = (await prettier.resolveConfig(filePath)) ?? {};
  const formatted = await prettier.format(content, { ...config, filepath: filePath });
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
 * @param {SyncPolicy} policy What this run translates.
 * @param {boolean} dryRun List what would be translated without translating or writing.
 * @returns {Promise<void>}
 */
async function processLocale(localeCode, source, localeData, cache, config, policy, dryRun) {
  /** @type {SyncStats} */
  const stats = { missing: 0, translated: 0, pruned: 0, policy };
  /** @type {TranslationTasks} */
  const translationTasks = [];
  const syncedDraft = syncValue(source, localeData, stats, translationTasks);

  if (translationTasks.length === 0 && stats.pruned === 0) {
    console.info(`[sync-locales] ${localeCode}: up to date`);
    return;
  }

  const prunedNote = stats.pruned > 0 ? `, pruned ${stats.pruned}` : '';
  if (dryRun) {
    const paths = translationTasks.map((task) => task.path).join(', ');
    console.info(
      `[sync-locales] ${localeCode}: would translate ${stats.translated}${prunedNote}${paths ? ` (${paths})` : ''}`
    );
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

  console.info(
    `[sync-locales] ${localeCode}: missing ${stats.missing}, translated ${stats.translated}${prunedNote}`
  );
}

/**
 * Runs an async worker over items with at most `limit` running at once.
 *
 * @template T
 * @param {T[]} items Items to process, in order.
 * @param {number} limit Maximum number of workers at once.
 * @param {(item: T) => Promise<void>} worker Async function run for each item.
 * @returns {Promise<void>} Resolves when every item has been processed.
 */
async function runWithConcurrency(items, limit, worker) {
  let next = 0;
  const lanes = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, async () => {
    while (next < items.length) {
      const item = items[next];
      next += 1;
      await worker(item);
    }
  });
  await Promise.all(lanes);
}

/**
 * Returns the target locale codes, optionally limited to one, or null after reporting an error.
 *
 * @param {string} [localeFilter] Optional locale code.
 * @returns {string[] | null} Locale codes to process.
 */
function targetLocales(localeFilter) {
  if (localeFilter === SOURCE_LOCALE) {
    console.error(
      `[sync-locales] ${SOURCE_LOCALE} is the source locale and cannot be synchronized.`
    );
    process.exitCode = 1;
    return null;
  }
  let codes = getLocaleCodes().filter((code) => code !== SOURCE_LOCALE);
  if (localeFilter) {
    codes = codes.filter((code) => code === localeFilter);
    if (codes.length === 0) {
      console.error(`[sync-locales] No locale found matching: ${localeFilter}`);
      process.exitCode = 1;
      return null;
    }
  }
  return codes;
}

/**
 * Synchronizes non-English locale files against `en-US`.
 * Processes locales in order of most strings needing translation first,
 * then oldest by last-modified date, so interrupted runs make the most progress.
 *
 * @param {{ localeFilter?: string, policy?: SyncPolicy, concurrency?: number, dryRun?: boolean }} [options] Run options.
 * @returns {Promise<void>} Resolves after all targeted locale files have been synchronized and written.
 */
export async function syncLocales({
  localeFilter,
  policy = { keys: [], untranslated: false, all: false },
  concurrency = DEFAULT_CONCURRENCY,
  dryRun = false,
} = {}) {
  const codes = targetLocales(localeFilter);
  if (!codes) {
    return;
  }

  const source = await loadLocale(SOURCE_LOCALE);
  const unknownKeys = policy.keys.filter((key) => !keyExists(source, key));
  if (unknownKeys.length > 0) {
    console.error(`[sync-locales] Not in ${SOURCE_LOCALE}: ${unknownKeys.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  // Pre-scan all locales to determine priority ordering without making any HTTP requests.
  const localeMetadata = await Promise.all(
    codes.map(async (localeCode) => {
      const filePath = resolve(LOCALE_DIR, `${localeCode}.js`);
      const [localeData, { mtimeMs }] = [await loadLocale(localeCode), statSync(filePath)];
      const needs = countTranslationNeeds(source, localeData, policy);
      return { localeCode, localeData, mtimeMs, needs };
    })
  );

  // Sort: most strings needing translation first, then oldest file as tiebreaker.
  localeMetadata.sort((a, b) => (b.needs !== a.needs ? b.needs - a.needs : a.mtimeMs - b.mtimeMs));

  const cache = new Map();
  const config = policy.all ? REGENERATE_CONFIG : SYNC_CONFIG;
  await runWithConcurrency(localeMetadata, concurrency, ({ localeCode, localeData }) =>
    processLocale(localeCode, source, localeData, cache, config, policy, dryRun)
  );
}

/**
 * Regenerates translations for all (or a specific) locale, re-translating every string
 * regardless of whether it already has a translation. Uses longer timeouts.
 *
 * @param {string} [localeFilter] Optional locale code to limit regeneration to a single locale.
 * @param {number} [concurrency] Locales processed at once.
 * @returns {Promise<void>} Resolves after all targeted locale files have been regenerated.
 */
export async function regenerateLocales(localeFilter, concurrency = DEFAULT_CONCURRENCY) {
  await syncLocales({
    localeFilter,
    policy: { keys: [], untranslated: true, all: true },
    concurrency,
  });
}

/**
 * Returns the value of `--name=value` or `--name value`, or undefined.
 *
 * @param {string[]} args CLI arguments.
 * @param {string} name Flag name without dashes.
 * @returns {string | undefined} Flag value.
 */
function flagValue(args, name) {
  const eq = args.find((arg) => arg.startsWith(`--${name}=`));
  if (eq) {
    return eq.slice(name.length + 3);
  }
  const index = args.indexOf(`--${name}`);
  return index !== -1 && args[index + 1] && !args[index + 1].startsWith('-')
    ? args[index + 1]
    : undefined;
}

/** Flags that take a value, so their value is not mistaken for a positional locale. */
const VALUE_FLAGS = ['--locale', '--keys', '--concurrency'];

/**
 * Parses the CLI locale filter.
 * Supports: --locale=<code>, --locale <code>, or a positional locale argument.
 *
 * @param {string[]} args CLI arguments excluding node and script paths.
 * @returns {string | undefined} Parsed locale filter.
 */
function parseLocaleFilter(args) {
  const localeFlag = flagValue(args, 'locale');
  const positional = args.find(
    (arg, index) => !arg.startsWith('-') && !VALUE_FLAGS.includes(args[index - 1])
  );

  if (args.includes('--locale') && !localeFlag) {
    console.error('[sync-locales] Missing locale value after --locale.');
    process.exitCode = 1;
    return undefined;
  }

  const candidates = [...new Set([localeFlag, positional].filter(Boolean))];
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
 * Estimates how long a run takes from the strings it will send.
 *
 * @param {string | undefined} localeFilter Optional locale code.
 * @param {SyncPolicy} policy What this run translates.
 * @param {number} concurrency Locales processed at once.
 * @returns {Promise<{ strings: number, locales: number, minutes: number } | null>} Estimate, or null after an error.
 */
async function estimateSync(localeFilter, policy, concurrency) {
  const codes = targetLocales(localeFilter);
  if (!codes) {
    return null;
  }
  const source = await loadLocale(SOURCE_LOCALE);
  const unknownKeys = policy.keys.filter((key) => !keyExists(source, key));
  if (unknownKeys.length > 0) {
    console.error(`[sync-locales] Not in ${SOURCE_LOCALE}: ${unknownKeys.join(', ')}`);
    process.exitCode = 1;
    return null;
  }
  const counts = await Promise.all(
    codes.map(async (code) => countTranslationNeeds(source, await loadLocale(code), policy))
  );
  const strings = counts.reduce((sum, n) => sum + n, 0);
  const locales = counts.filter((n) => n > 0).length;
  const delay = (policy.all ? REGENERATE_CONFIG : SYNC_CONFIG).interRequestDelayMs;
  // Each locale sends its strings one after another; locales run side by side.
  const seconds = (strings * delay) / 1000 / Math.max(1, Math.min(concurrency, locales || 1));
  return { strings, locales, minutes: Math.ceil(seconds / 60) };
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
 * If this module is executed directly, synchronize the locales based on CLI flags.
 * Flags:
 *   --keys a.b,c.d   Translate these keys again even when they have a translation
 *                    (after rewording the English). Missing strings are filled too.
 *   --untranslated   Also re-send strings still identical to English (for example after
 *                    a failed run). Check the result: some strings are meant to stay English.
 *   --regenerate     Re-translate every string (uses longer timeouts).
 *   --locale=<code>  Limit the run to a single locale.
 *   --concurrency=N  Locales translated at once (default 4; 1 for one at a time).
 *   --dry-run        List what would be translated, without translating or writing.
 *   --yes / -y       Skip the confirmation prompt.
 */
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const localeFilter = parseLocaleFilter(args);
  const keys = (flagValue(args, 'keys') ?? '')
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean);
  if (args.includes('--keys') && keys.length === 0) {
    console.error('[sync-locales] Missing key paths after --keys.');
    process.exitCode = 1;
  }
  const concurrencyText = flagValue(args, 'concurrency');
  const concurrency = concurrencyText === undefined ? DEFAULT_CONCURRENCY : Number(concurrencyText);
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    console.error('[sync-locales] --concurrency needs a whole number of 1 or more.');
    process.exitCode = 1;
  }

  if (process.exitCode) {
    process.exit(process.exitCode);
  }

  const isRegenerate = args.includes('--regenerate');
  const dryRun = args.includes('--dry-run');
  /** @type {SyncPolicy} */
  const policy = {
    keys,
    untranslated: isRegenerate || args.includes('--untranslated'),
    all: isRegenerate,
  };

  const estimate = await estimateSync(localeFilter, policy, concurrency);
  if (!estimate) {
    process.exit(process.exitCode || 1);
  }
  if (estimate.strings === 0) {
    console.info('[sync-locales] Nothing to translate.');
    process.exit(0);
  }
  if (!dryRun) {
    const shouldProceed = await confirmProceed(
      args,
      `[sync-locales] ${estimate.strings} strings to translate in ${estimate.locales} locales, ${concurrency} at a time: about ${estimate.minutes} minute(s), longer if Google asks us to slow down.`
    );
    if (!shouldProceed) {
      console.info('[sync-locales] Cancelled by user.');
      process.exit(0);
    }
  }

  await syncLocales({ localeFilter, policy, concurrency, dryRun });
}
