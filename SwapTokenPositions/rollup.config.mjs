import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { format as prettierFormat } from "prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "script.json"), "utf8"),
);
const buildTimestamp = new Date().toISOString();
const scriptName = scriptJson.name;
const scriptFile = scriptJson.script;
const buildVersion = scriptJson.version;

const banner = [
  "/**",
  " * NOTE: GENERATED FILE - DO NOT EDIT DIRECTLY.",
  " * NOTE: Source files live under src/ and are bundled with `npm run build`.",
  " * ------------------------------------------------",
  ` * Name: ${scriptName}`,
  ` * Script: ${scriptFile}`,
  ` * Built: ${buildTimestamp}`,
  " */",
].join("\n");

/**
 * Formats generated JavaScript chunks after Rollup has applied banner/intro/outro.
 *
 * @returns {import("rollup").Plugin} Rollup output plugin.
 */
function formatOutputPlugin() {
  return {
    name: "format-output",
    /**
     * Formats each emitted chunk with Prettier.
     *
     * @param {import("rollup").NormalizedOutputOptions} options Finalized output options.
     * @param {import("rollup").OutputBundle} bundle Emitted output bundle.
     * @returns {Promise<void>}
     */
    async generateBundle(options, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type !== "chunk") {
          continue;
        }

        output.code = await prettierFormat(output.code, {
          parser: "babel",
          singleQuote: true,
          trailingComma: "all",
        });
      }
    },
  };
}

/** @type {import("rollup").RollupOptions} */
export default {
  input: path.join(__dirname, "src", "index.js"),
  plugins: [
    {
      name: "inject-build-metadata",
      /**
       * Replaces metadata placeholders in constants with build-time values.
       *
       * @param {string} code Module source code.
       * @param {string} id Absolute module id.
       * @returns {{code: string, map: null} | null}
       */
      transform(code, id) {
        if (!id.endsWith(path.join("src", "constants.js"))) {
          return null;
        }

        return {
          code: code
            .replaceAll("__SCRIPT_NAME__", scriptName)
            .replaceAll("__SCRIPT_FILE__", scriptFile)
            .replaceAll("__BUILD_VERSION__", buildVersion)
            .replaceAll("__BUILD_DATE__", buildTimestamp),
          map: null,
        };
      },
    },
  ],
  output: [
    {
      file: path.join(__dirname, `${scriptJson.name}.js`),
      format: "es",
      banner,
      intro: `const ${scriptName}Mod = (() => {\n  'use strict';`,
      outro: "})();",
      plugins: [formatOutputPlugin()],
    },
    {
      file: path.join(__dirname, scriptJson.version, `${scriptJson.name}.js`),
      format: "es",
      banner,
      intro: `const ${scriptName}Mod = (() => {\n  'use strict';`,
      outro: "})();",
      plugins: [formatOutputPlugin()],
    },
  ],
};
