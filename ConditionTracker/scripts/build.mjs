import { execSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { rollup, watch } from 'rollup';
import config from '../rollup.config.js';

const metadata = JSON.parse(readFileSync(new URL('../script.json', import.meta.url), 'utf8'));
const isWatchMode = process.argv.includes('--watch');

/**
 * Syncs the version field in package.json to match script.json.
 *
 * @returns {void}
 */
function syncPackageVersion() {
  const pkgUrl = new URL('../package.json', import.meta.url);
  const pkg = JSON.parse(readFileSync(pkgUrl, 'utf8'));
  if (pkg.version !== metadata.version) {
    pkg.version = metadata.version;
    writeFileSync(pkgUrl, JSON.stringify(pkg, null, 2) + '\n');
    execSync(`npx prettier --write "${pkgUrl.pathname.replace(/^\/([A-Z]:)/, '$1')}"`, {
      stdio: 'inherit',
    });
    console.log(`Updated package.json version to ${metadata.version}`);
  }
}

/**
 * Formats the generated bundle with Prettier, then copies it into the versioned release folder.
 *
 * @returns {void}
 */
function formatAndCopyVersionedOutput() {
  const source = resolve(metadata.script);
  execSync(`npx prettier --write "${source}"`, { stdio: 'inherit' });
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
  syncPackageVersion();
  const bundle = await rollup(config);
  const outputs = Array.isArray(config.output) ? config.output : [config.output];
  for (const output of outputs) {
    await bundle.write(output);
  }
  await bundle.close();
  formatAndCopyVersionedOutput();
  console.log(`Built ${metadata.script} and ${metadata.version}/${metadata.script}`);
}

/**
 * Starts Rollup watch mode and mirrors completed bundles into the version folder.
 *
 * @returns {void}
 */
function watchBuild() {
  const watcher = watch(config);
  watcher.on('event', (event) => {
    if (event.code === 'ERROR') {
      console.error(event.error);
      return;
    }

    if (event.code === 'END') {
      formatAndCopyVersionedOutput();
      console.log(`Rebuilt ${metadata.script}`);
    }
  });
}

if (isWatchMode) {
  watchBuild();
} else {
  await buildOnce();
}
