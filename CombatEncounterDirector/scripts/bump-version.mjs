/**
 * Increments the version in script.json and package.json.
 *
 * Auto-bump behaviour (no argument):
 *   - Stable release (e.g. 1.0.0)  → increments patch:       1.0.1
 *   - Prerelease with number        → increments prerelease:  1.0.0-alpha.3 → 1.0.0-alpha.4
 *   - Prerelease without number     → adds .1:                1.0.0-alpha   → 1.0.0-alpha.1
 *
 * Explicit version (node scripts/bump-version.mjs <version>):
 *   - Sets exactly the given version string.
 *   - Use this to enter a prerelease cycle: node scripts/bump-version.mjs 1.1.0-alpha.1
 *   - Use this to cut a release:            node scripts/bump-version.mjs 1.1.0
 *
 * When building prerelease versions (alpha/beta), always pass an explicit version
 * rather than relying on auto-bump — otherwise each `npm run build` will keep
 * incrementing the prerelease counter instead of cutting the final release.
 * To promote a prerelease to a stable release, set the version explicitly:
 *   npm run build -- 1.0.0
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptJsonPath = path.join(__dirname, '..', 'script.json');
const packageJsonPath = path.join(__dirname, '..', 'package.json');

const scriptJson = JSON.parse(fs.readFileSync(scriptJsonPath, 'utf8'));
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const explicitVersion = process.argv[2];
let nextVersion;

if (explicitVersion) {
  nextVersion = explicitVersion;
} else {
  const current = scriptJson.version;
  const dashIdx = current.indexOf('-');

  if (dashIdx === -1) {
    // Stable: 1.0.0 → 1.0.1
    const [major, minor, patch] = current.split('.').map(Number);
    if (!Number.isFinite(patch)) {
      console.error(
        `ERROR: Cannot auto-bump malformed version "${current}". Use an explicit version.`
      );
      process.exit(1);
    }
    nextVersion = `${major}.${minor}.${patch + 1}`;
  } else {
    // Prerelease: 1.0.0-alpha.3 → 1.0.0-alpha.4  /  1.0.0-alpha → 1.0.0-alpha.1
    const semver = current.slice(0, dashIdx);
    const prerelease = current.slice(dashIdx + 1);
    const trailingNumber = prerelease.match(/^(.*?)(\d+)$/);
    if (trailingNumber) {
      nextVersion = `${semver}-${trailingNumber[1]}${Number(trailingNumber[2]) + 1}`;
    } else {
      nextVersion = `${semver}-${prerelease}.1`;
    }
  }
}

// Append current version to history (oldest-first, matching Roll20 corpus convention),
// deduplicate (handles building the same explicit version twice), then keep the last 5.
scriptJson.previousversions = [
  ...new Set([...(scriptJson.previousversions || []), scriptJson.version]),
].slice(-5);
scriptJson.version = nextVersion;
packageJson.version = nextVersion;

fs.writeFileSync(scriptJsonPath, JSON.stringify(scriptJson, null, 2) + '\n');
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`Version set to ${nextVersion}`);
