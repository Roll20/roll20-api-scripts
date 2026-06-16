import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { format as prettierFormat, resolveConfig } from 'prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scriptJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'script.json'), 'utf8'));
const buildTimestamp = new Date().toISOString();
const scriptName = scriptJson.name;
const scriptFile = scriptJson.script;
const buildVersion = scriptJson.version;

const banner = [
  '/**',
  ' * NOTE: GENERATED FILE - DO NOT EDIT DIRECTLY.',
  ' * NOTE: Source files live under src/ and are bundled with `npm run build`.',
  ' * ------------------------------------------------',
  ` * Name: ${scriptName}`,
  ` * Script: ${scriptFile}`,
  ` * Version: ${buildVersion}`,
  ` * Built: ${buildTimestamp}`,
  ' */',
].join('\n');

/**
 * Formats generated JavaScript chunks using the project's .prettierrc.json config.
 *
 * @returns {import("rollup").Plugin} Rollup output plugin.
 */
function formatOutputPlugin() {
  return {
    name: 'format-output',
    /**
     * Formats each emitted chunk with Prettier, resolving options from
     * .prettierrc.json so the config file is the single source of truth.
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

        const fileConfig = (await resolveConfig(options.file)) ?? {};
        output.code = await prettierFormat(output.code, {
          ...fileConfig,
          parser: 'babel',
        });
      }
    },
  };
}

// Derive a safe IIFE variable name from the script name (strip spaces/special chars).
const iifeName = scriptName.replace(/[^a-zA-Z0-9]/g, '') + 'Mod';

/** @type {import("rollup").RollupOptions} */
export default {
  input: path.join(__dirname, 'src', 'index.js'),
  plugins: [
    {
      name: 'inject-build-metadata',
      /**
       * Replaces metadata placeholders in constants.js with build-time values.
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
            .replaceAll('__BUILD_DATE__', buildTimestamp),
          map: null,
        };
      },
    },
  ],
  output: [
    {
      file: path.join(__dirname, scriptFile),
      format: 'es',
      banner,
      intro: `const ${iifeName} = (() => {\n  'use strict';`,
      outro: '})();',
      plugins: [formatOutputPlugin()],
    },
    {
      file: path.join(__dirname, buildVersion, scriptFile),
      format: 'es',
      banner,
      intro: `const ${iifeName} = (() => {\n  'use strict';`,
      outro: '})();',
      plugins: [formatOutputPlugin()],
    },
  ],
};
