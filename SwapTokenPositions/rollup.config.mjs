import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { format as prettierFormat } from 'prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scriptJsonPath = path.join(__dirname, 'script.json');
const scriptJson = JSON.parse(fs.readFileSync(scriptJsonPath, 'utf8'));
const buildNow = new Date();
const buildTimestamp = buildNow.toISOString();
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const buildDate = `${buildNow.getUTCDate()} ${MONTHS[buildNow.getUTCMonth()]} ${buildNow.getUTCFullYear()}`;
const scriptName = scriptJson.name;
const scriptFile = scriptJson.script;

/**
 * Increments the trailing numeric build segment for pre-release versions.
 *
 * Release versions with exactly three dot-separated parts (e.g. "2.1.0") are
 * returned unchanged so the patch number is never bumped automatically.
 *
 * @param {string} version Current version string.
 * @returns {string} Version with build number incremented, or the original string.
 */
function incrementBuildNumber(version) {
  const parts = version.split('.');
  if (parts.length <= 3) {
    return version;
  }
  const last = parts.at(-1);
  const n = Number(last);
  if (Number.isInteger(n) && n >= 0 && String(n) === last) {
    parts[parts.length - 1] = String(n + 1);
    return parts.join('.');
  }
  return version;
}

/**
 * Returns the semver base (major.minor.patch) from any version string.
 *
 * Used for the versioned archive folder so pre-release builds don't generate a
 * new folder on every run.
 *
 * @param {string} version Version string.
 * @returns {string} First three dot-separated segments joined by ".".
 */
function getBaseVersion(version) {
  return version.split('.').slice(0, 3).join('.');
}

const buildVersion = incrementBuildNumber(scriptJson.version);
if (buildVersion !== scriptJson.version) {
  scriptJson.version = buildVersion;
  fs.writeFileSync(scriptJsonPath, JSON.stringify(scriptJson, null, 2) + '\n');
}

const baseVersion = getBaseVersion(buildVersion);

// Keep package.json version in sync with script.json on every build.
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
if (packageJson.version !== buildVersion) {
  packageJson.version = buildVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
}

const banner = [
  '/**',
  ' * NOTE: GENERATED FILE - DO NOT EDIT DIRECTLY.',
  ' * NOTE: Source files live under src/ and are bundled with `npm run build`.',
  ' * ------------------------------------------------',
  ` * Name: ${scriptName}`,
  ` * Script: ${scriptFile}`,
  ` * Built: ${buildTimestamp}`,
  ' */',
].join('\n');

/**
 * Formats generated JavaScript chunks after Rollup has applied banner/intro/outro.
 *
 * @returns {import("rollup").Plugin} Rollup output plugin.
 */
function formatOutputPlugin() {
  return {
    name: 'format-output',
    /**
     * Formats each emitted chunk with Prettier.
     *
     * @param {import("rollup").NormalizedOutputOptions} options Finalized output options.
     * @param {import("rollup").OutputBundle} bundle Emitted output bundle.
     * @returns {Promise<void>}
     */
    async generateBundle(options, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk') {
          continue;
        }

        output.code = await prettierFormat(output.code, {
          parser: 'babel',
          singleQuote: true,
          trailingComma: 'all',
        });
      }
    },
  };
}

/** @type {import("rollup").RollupOptions} */
export default {
  input: path.join(__dirname, 'src', 'index.js'),
  plugins: [
    {
      name: 'inject-build-metadata',
      /**
       * Replaces metadata placeholders in constants with build-time values.
       *
       * @param {string} code Module source code.
       * @param {string} id Absolute module id.
       * @returns {{code: string, map: null} | null}
       */
      transform(code, id) {
        if (!id.endsWith(path.join('src', 'constants.js'))) {
          return null;
        }

        return {
          code: code
            .replaceAll('__SCRIPT_NAME__', scriptName)
            .replaceAll('__SCRIPT_FILE__', scriptFile)
            .replaceAll('__BUILD_VERSION__', buildVersion)
            .replaceAll('__BUILD_DATE__', buildDate),
          map: null,
        };
      },
    },
  ],
  output: [
    {
      file: path.join(__dirname, `${scriptJson.name}.js`),
      format: 'es',
      banner,
      intro: `const ${scriptName}Mod = (() => {\n  'use strict';`,
      outro: '})();',
      plugins: [formatOutputPlugin()],
    },
    {
      file: path.join(__dirname, baseVersion, `${scriptName}.js`),
      format: 'es',
      banner,
      intro: `const ${scriptName}Mod = (() => {\n  'use strict';`,
      outro: '})();',
      plugins: [formatOutputPlugin()],
    },
  ],
};
