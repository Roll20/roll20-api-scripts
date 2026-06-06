/**
 * Builds CombatEncounterDirector.js from src/ using Rollup.
 *
 * Version bumping is handled here (not via a package.json prebuild hook) so
 * that an explicit version can be passed cleanly through npm run build.
 *
 * Usage:
 *   npm run build                  → auto-bump patch version, then build
 *   npm run build -- 1.1.0        → set version to 1.1.0, then build
 *   npm run build -- 1.1.0-alpha.1 → enter prerelease cycle, then build
 *   npm run build -- --watch      → watch mode (no version bump)
 *   npm run build -- --no-bump    → build without changing the version
 *   node scripts/build.mjs        → same as npm run build (auto-bump)
 *   node scripts/build.mjs 1.1.0  → same as npm run build -- 1.1.0
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rollup, watch as rollupWatch } from 'rollup';
import config from '../rollup.config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const isWatch = process.argv.includes('--watch');
const noBump = process.argv.includes('--no-bump');
// Pick the first argument that doesn't start with '--' as an explicit version.
const versionArg = process.argv.slice(2).find((a) => !a.startsWith('--'));

// Bump (or set) the version before every non-watch, non-no-bump build.
if (!isWatch && !noBump) {
  const bumpArgs = versionArg ? [versionArg] : [];
  const result = spawnSync(process.execPath, ['scripts/bump-version.mjs', ...bumpArgs], {
    cwd: rootDir,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

async function build() {
  const bundle = await rollup(config);
  for (const output of config.output) {
    await bundle.write(output);
    console.log(`Built: ${path.relative(rootDir, output.file)}`);
  }
  await bundle.close();
}

if (isWatch) {
  const watcher = rollupWatch(config.output.map((output) => ({ ...config, output })));

  watcher.on('event', (event) => {
    if (event.code === 'BUNDLE_END') {
      console.log(`Rebuilt at ${new Date().toLocaleTimeString()}`);
      event.result?.close();
    }
    if (event.code === 'ERROR') {
      console.error('Build error:', event.error.message);
    }
  });

  console.log('Watching for changes...');
} else {
  build().catch((err) => {
    console.error('Build failed:', err.message);
    process.exit(1);
  });
}
