import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const localeDir = 'src/locales/locale';
const files = readdirSync(localeDir).filter((f) => f !== 'en-US.js' && f.endsWith('.js'));

// Indentation constants
const INDENT_2 = '  ';
const INDENT_4 = INDENT_2 + INDENT_2;
const INDENT_6 = INDENT_4 + INDENT_2;
const INDENT_8 = INDENT_6 + INDENT_2;
const INDENT_10 = INDENT_8 + INDENT_2;
const INDENT_12 = INDENT_10 + INDENT_2;

const newBtnKeys = `${INDENT_6}savedEffects: "Saved Effects",
${INDENT_6}addSavedEffect: "Add Saved Effect",
${INDENT_6}editSaved: "Edit",
${INDENT_6}removeSaved: "Remove",
${INDENT_6}promoteSaved: "Add to Turn Tracker",
${INDENT_6}snoozeSaved: "Snooze",
${INDENT_6}clearSnooze: "Clear Snooze",`;

const newTitleKeys = `${INDENT_6}savedEffects: "Saved Effects",
${INDENT_6}savedAdd: "Add Saved Effect",
${INDENT_6}savedEdit: "Edit Saved Effect",
${INDENT_6}savedRemoved: "Saved Effect Removed",
${INDENT_6}savedPromoted: "Add to Turn Tracker",
${INDENT_6}savedSnoozed: "Reminder Snoozed",
${INDENT_6}savedSnoozeCleared: "Snooze Cleared",
${INDENT_6}hiddenEffects: "Hidden Effects — {name}",`;

const newHeadingKeys = `${INDENT_6}savedEffectsFor: "Saved Effects for {name}",
${INDENT_6}visibility: "Visibility",
${INDENT_6}snoozeOptions: "Snooze Reminder",
${INDENT_6}promoteOptions: "Promote to Turn Tracker",
${INDENT_6}editActions: "Edit Actions",`;

const newMsgKeys = `${INDENT_6}noSavedEffects: "No saved effects stored for {name}.",
${INDENT_6}noTokenSelectedSaved: "Select a token on the board before using --saved.",
${INDENT_6}savedEffectAdded: "Saved effect added for {name}.",
${INDENT_6}savedEffectUpdated: "Saved effect updated.",
${INDENT_6}savedEffectRemoved: "Saved effect removed.",
${INDENT_6}savedEffectNotFound: "Saved effect not found.",
${INDENT_6}savedInvalidVisibility: "Invalid visibility. Use public, masked, or gm.",
${INDENT_6}savedConditionRequired: "Condition type is required. Use --condition <type>.",
${INDENT_6}savedPromotedPublic: "Effect added to Turn Tracker as public.",
${INDENT_6}savedPromotedMasked: "Effect added to Turn Tracker as masked — players see: {publicLabel}.",
${INDENT_6}savedPromotedGm: "Effect is GM-only — no Turn Tracker row will be created. The reminder system will surface it when this token reaches the top of the turn order.",
${INDENT_6}savedSnoozed: "Reminder snoozed: {scope}.",
${INDENT_6}savedSnoozeCleared: "Snooze cleared.",
${INDENT_6}hiddenEffectsReminder: "Hidden effects are active on {name}.",
${INDENT_6}visibilityPublicHint: "full label visible to all",
${INDENT_6}visibilityMaskedHint: "vague label shown to players",
${INDENT_6}visibilityGmHint: "GM whisper only, no Turn Tracker row",`;

const newSavedBlock = `${INDENT_4}saved: {
${INDENT_6}visibility: {
${INDENT_8}public: "Public",
${INDENT_8}masked: "Masked",
${INDENT_8}gm: "GM Only",
${INDENT_6}},
${INDENT_6}snooze: {
${INDENT_8}thisTurn: "This Turn",
${INDENT_8}oneRound: "1 Round",
${INDENT_8}threeRounds: "3 Rounds",
${INDENT_8}thisCombat: "This Combat",
${INDENT_8}rounds: "{n} round(s)",
${INDENT_6}},
${INDENT_6}field: {
${INDENT_8}gmLabel: "GM Label",
${INDENT_8}publicLabel: "Public Label",
${INDENT_8}visibility: "Visibility",
${INDENT_8}source: "Source",
${INDENT_8}condition: "Condition",
${INDENT_6}},
${INDENT_6}prompt: {
${INDENT_8}enterGmLabel: "Full effect description (GM only)",
${INDENT_8}enterPublicLabel: "Vague label shown to players",
${INDENT_6}},
${INDENT_6}snoozed: "snoozed",
${INDENT_4}},`;

const newHandoutSection = `${INDENT_4}savedEffects: {
${INDENT_6}heading: "Saved Effects",
${INDENT_6}intro:
${INDENT_8}"Saved effects let you store long-term conditions outside the Turn Tracker — curses, diseases, poisons, hidden debuffs, and other non-combat conditions. They persist in script state and can be optionally copied into the Turn Tracker when combat begins.",
${INDENT_6}visibility: {
${INDENT_8}heading: "Visibility Modes",
${INDENT_8}rows: [
${INDENT_10}["public", "Full effect label is visible in the Turn Tracker and public chat."],
${INDENT_10}["masked", "A vague public label is shown to players; full details are GM-only."],
${INDENT_10}["gm", "No Turn Tracker row. Full details are stored in state and whispered to the GM when the affected token reaches the top of initiative."],
${INDENT_8}],
${INDENT_6}},
${INDENT_6}commands: {
${INDENT_8}heading: "Saved Effects Commands",
${INDENT_8}intro: "All --saved commands are GM-only. Select a token before running --saved or --saved add.",
${INDENT_8}rows: [
${INDENT_10}["!condition-tracker --saved", "View saved effects for the selected token."],
${INDENT_10}["!condition-tracker --saved add", "Launch the add-saved-effect wizard."],
${INDENT_10}["!condition-tracker --saved edit <id>", "Edit labels or visibility for an existing saved effect."],
${INDENT_10}["!condition-tracker --saved remove <id>", "Permanently remove a saved effect."],
${INDENT_10}["!condition-tracker --saved promote <id> --visibility public|masked|gm", "Copy a saved effect into the Turn Tracker (public or masked) or confirm it is GM-only tracked."],
${INDENT_10}["!condition-tracker --saved snooze <id> --scope turn|rounds|combat --rounds <n>", "Snooze a GM reminder for this turn, N rounds, or this combat."],
${INDENT_10}["!condition-tracker --saved snooze-clear <id>", "Clear an active snooze so reminders resume immediately."],
${INDENT_8}],
${INDENT_6}},
${INDENT_6}reminders: {
${INDENT_8}heading: "GM Reminders",
${INDENT_8}body: "When a token with gm or masked saved effects reaches the top of the Turn Tracker, the GM receives a whisper listing the hidden effects with action buttons. Duplicate reminders within the same turn are suppressed. Use the Snooze buttons to suppress reminders for a turn, a number of rounds, or for the remainder of the current combat.",
${INDENT_6}},
${INDENT_4}},`;

const newCmdRefRows = `${INDENT_8}["--saved", "View saved long-term effects for the selected token (select token first)"],
${INDENT_8}["--saved add", "Add a saved effect (curse, disease, etc.) to the selected token"],
${INDENT_8}["--saved edit <id>", "Edit an existing saved effect by id"],
${INDENT_8}["--saved remove <id>", "Remove a saved effect by id"],
${INDENT_8}["--saved promote <id> --visibility public|masked|gm", "Copy a saved effect into the Turn Tracker (public/masked) or mark it as GM-only active"],
${INDENT_8}["--saved snooze <id> --scope turn|rounds|combat --rounds <n>", "Snooze a saved-effect reminder for the current turn, N rounds, or this combat"],
${INDENT_8}["--saved snooze-clear <id>", "Clear an active snooze on a saved effect"],`;

const newQuickStartRow = `${INDENT_8}["!condition-tracker --saved", "Select a token first, then run this command to view and manage saved long-term effects (curses, diseases, hidden debuffs, etc.) for that token. Also available as the ConditionTrackerSaved macro."],`;

let successCount = 0;

for (const file of files) {
  const filePath = join(localeDir, file);
  let content = readFileSync(filePath, 'utf8');
  let modified = false;

  // 1. ui.btn keys after 'reportToken:' line
  if (content.includes('reportToken:') && !content.includes('savedEffects: "Saved Effects"')) {
    content = content.replace(/(reportToken:[^\n]+\n)/, `$1${newBtnKeys}\n`);
    modified = true;
  }

  // 2. ui.title keys after 'tokenReport:' line
  if (content.includes('tokenReport:') && !content.includes('savedAdd:')) {
    content = content.replace(/(tokenReport:[^\n]+\n)/, `$1${newTitleKeys}\n`);
    modified = true;
  }

  // 3. ui.heading keys after 'appliedBy:' line
  if (content.includes('appliedBy:') && !content.includes('savedEffectsFor:')) {
    content = content.replace(/(appliedBy:[^\n]+\n)/, `$1${newHeadingKeys}\n`);
    modified = true;
  }

  // 4. ui.msg keys after 'noConditionsAppliedBy' line
  if (content.includes('noConditionsAppliedBy') && !content.includes('noSavedEffects:')) {
    content = content.replace(/(noConditionsAppliedBy:[^\n]+\n)/, `$1${newMsgKeys}\n`);
    modified = true;
  }

  // 5. ui.saved block before 'cleanup:'
  if (content.includes('    cleanup: {') && !content.includes('saved: {')) {
    content = content.replace('    cleanup: {', `${newSavedBlock}\n    cleanup: {`);
    modified = true;
  }

  // 6. Update macroReinstalled to include {saved}
  if (content.includes('macroReinstalled:') && !content.includes('{saved}')) {
    content = content.replace(
      /(macroReinstalled:\s*")[^"]+(")/,
      `$1The {wizard}, {multiTarget}, {reportToken}, and {saved} macros have been reinstalled for all current GM players.$2`
    );
    modified = true;
  }

  // 7. handout.savedEffects before 'configuration:'
  if (content.includes('    configuration: {') && !content.includes('savedEffects: {')) {
    content = content.replace('    configuration: {', `${newHandoutSection}\n    configuration: {`);
    modified = true;
  }

  // 8. commandsRef rows before '--lang' row (using &lt; variant)
  if (
    (content.includes('--lang') || content.includes('--help')) &&
    !content.includes('"--saved"')
  ) {
    // Try to insert before --lang row
    if (content.includes('"--lang')) {
      content = content.replace(/(\s*\["--lang)/, `\n${newCmdRefRows}$1`);
    } else if (content.includes('"--help"')) {
      content = content.replace(/(\s*\["--help")/, `\n${newCmdRefRows}$1`);
    }
    modified = true;
  }

  // 9. quickStart row before '--menu' row
  if (
    content.includes('!condition-tracker --menu') &&
    !content.includes('!condition-tracker --saved')
  ) {
    content = content.replace(/(\s*\["!condition-tracker --menu)/, `\n${newQuickStartRow}$1`);
    modified = true;
  }

  if (modified) {
    writeFileSync(filePath, content, 'utf8');
    successCount++;
    console.log(`Updated: ${file}`);
  } else {
    console.log(`Skipped (already up to date): ${file}`);
  }
}

console.log(`\nDone. Updated ${successCount} of ${files.length} locale files.`);
