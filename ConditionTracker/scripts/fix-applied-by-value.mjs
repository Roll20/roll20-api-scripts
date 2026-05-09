import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const localeDir = 'src/locales/locale';
const files = readdirSync(localeDir).filter((f) => f !== 'en-US.js' && f.endsWith('.js'));

let fixedCount = 0;

for (const file of files) {
  const filePath = join(localeDir, file);
  let content = readFileSync(filePath, 'utf8');
  let modified = false;

  // Detect broken state: noConditionsAppliedBy: with no value on same line
  // (followed immediately by whitespace+noSavedEffects — the first inserted key)
  const brokenKeyPattern = /(\s*noConditionsAppliedBy:)\r?\n(\s*noSavedEffects:)/;
  if (brokenKeyPattern.test(content)) {
    // 1. Restore the value inline on the key line
    content = content.replace(
      brokenKeyPattern,
      `$1\n        "{name} has no active conditions applied to others.",\n$2`
    );

    // 2. Remove the orphaned floating string that was left after the inserted keys
    //    It appears as a bare string literal just before the closing of the msg block:
    //    visibilityGmHint: "...",\n        "{name} has no active conditions applied to others.",\n    },
    content = content.replace(
      /(\s*visibilityGmHint:[^\n]+\n)\s*"\{name\} has no active conditions applied to others\."\s*,\s*\n/,
      `$1`
    );

    modified = true;
  }

  if (modified) {
    writeFileSync(filePath, content, 'utf8');
    fixedCount++;
    console.log(`Fixed: ${file}`);
  } else {
    console.log(`Skipped (pattern not found): ${file}`);
  }
}

console.log(`\nDone. Fixed ${fixedCount} of ${files.length} locale files.`);
