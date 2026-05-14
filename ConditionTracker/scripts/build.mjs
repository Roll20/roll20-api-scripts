import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { rollup, watch } from "rollup";
import config from "../rollup.config.js";

const metadata = JSON.parse(
  readFileSync(new URL("../script.json", import.meta.url), "utf8"),
);
const isWatchMode = process.argv.includes("--watch");

/**
 * Copies the generated bundle into the versioned release folder.
 *
 * @returns {void}
 */
function copyVersionedOutput() {
  const source = resolve(metadata.script);
  const target = resolve(metadata.version, metadata.script);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
}

/**
 * Builds the Roll20 bundle once.
 *
 * @returns {Promise<void>} A promise that resolves when the build is complete.
 */
async function buildOnce() {
  const bundle = await rollup(config);
  const outputs = Array.isArray(config.output)
    ? config.output
    : [config.output];
  for (const output of outputs) {
    await bundle.write(output);
  }
  await bundle.close();
  copyVersionedOutput();
  console.log(
    `Built ${metadata.script} and ${metadata.version}/${metadata.script}`,
  );
}

/**
 * Starts Rollup watch mode and mirrors completed bundles into the version folder.
 *
 * @returns {void}
 */
function watchBuild() {
  const watcher = watch(config);
  watcher.on("event", (event) => {
    if (event.code === "ERROR") {
      console.error(event.error);
      return;
    }

    if (event.code === "END") {
      copyVersionedOutput();
      console.log(`Rebuilt ${metadata.script}`);
    }
  });
}

if (isWatchMode) {
  watchBuild();
} else {
  await buildOnce();
}
