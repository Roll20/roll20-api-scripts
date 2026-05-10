import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const pkgUrl = new URL('../script.json', import.meta.url);
const script = JSON.parse(readFileSync(pkgUrl, 'utf8'));

/**
 * Increments the trailing numeric segment of a version string.
 * If the version ends with a build/iteration number (e.g. "1.1.0.beta-3.4"),
 * that number is incremented. Otherwise the semver patch is incremented
 * (e.g. "1.1.0" → "1.1.1").
 *
 * @param {string} version Current version string.
 * @returns {string} Bumped version string.
 */
function bumpTrailingNumber(version) {
  return version.replace(/(\d+)$/, (_, n) => String(Number(n) + 1));
}

const explicitVersion = process.argv[2];
const previous = script.version;
script.version = explicitVersion ?? bumpTrailingNumber(previous);

writeFileSync(pkgUrl, JSON.stringify(script, null, 2) + '\n');
execSync(`npx prettier --write "${pkgUrl.pathname.replace(/^\/([A-Z]:)/, '$1')}"`, {
  stdio: 'inherit',
});

if (explicitVersion) {
  console.log(`Version set: ${previous} → ${script.version}`);
} else {
  console.log(`Version bumped: ${previous} → ${script.version}`);
}
