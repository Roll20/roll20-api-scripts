import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const localeDir = 'src/locales/locale';
const files = readdirSync(localeDir).filter((f) => f !== 'en-US.js' && f.endsWith('.js'));

const newBtnKeys = `      savedEffects: "Saved Effects",
      addSavedEffect: "Add Saved Effect",
      editSaved: "Edit",
      removeSaved: "Remove",
      promoteSaved: "Add to Turn Tracker",
      snoozeSaved: "Snooze",
      clearSnooze: "Clear Snooze",`;

const newTitleKeys = `      savedEffects: "Saved Effects",
      savedAdd: "Add Saved Effect",
      savedEdit: "Edit Saved Effect",
      savedRemoved: "Saved Effect Removed",
      savedPromoted: "Add to Turn Tracker",
      savedSnoozed: "Reminder Snoozed",
      savedSnoozeCleared: "Snooze Cleared",
      hiddenEffects: "Hidden Effects — {name}",`;

const newHeadingKeys = `      savedEffectsFor: "Saved Effects for {name}",
      visibility: "Visibility",
      snoozeOptions: "Snooze Reminder",
      promoteOptions: "Promote to Turn Tracker",
      editActions: "Edit Actions",`;

const newMsgKeys = `      noSavedEffects: "No saved effects stored for {name}.",
      noTokenSelectedSaved: "Select a token on the board before using --saved.",
      savedEffectAdded: "Saved effect added for {name}.",
      savedEffectUpdated: "Saved effect updated.",
      savedEffectRemoved: "Saved effect removed.",
      savedEffectNotFound: "Saved effect not found.",
      savedInvalidVisibility: "Invalid visibility. Use public, masked, or gm.",
      savedConditionRequired: "Condition type is required. Use --condition <type>.",
      savedPromotedPublic: "Effect added to Turn Tracker as public.",
      savedPromotedMasked: "Effect added to Turn Tracker as masked — players see: {publicLabel}.",
      savedPromotedGm: "Effect is GM-only — no Turn Tracker row will be created. The reminder system will surface it when this token reaches the top of the turn order.",
      savedSnoozed: "Reminder snoozed: {scope}.",
      savedSnoozeCleared: "Snooze cleared.",
      hiddenEffectsReminder: "Hidden effects are active on {name}.",
      visibilityPublicHint: "full label visible to all",
      visibilityMaskedHint: "vague label shown to players",
      visibilityGmHint: "GM whisper only, no Turn Tracker row",`;

const newSavedBlock = `    saved: {
      visibility: {
        public: "Public",
        masked: "Masked",
        gm: "GM Only",
      },
      snooze: {
        thisTurn: "This Turn",
        oneRound: "1 Round",
        threeRounds: "3 Rounds",
        thisCombat: "This Combat",
        rounds: "{n} round(s)",
      },
      field: {
        gmLabel: "GM Label",
        publicLabel: "Public Label",
        visibility: "Visibility",
        source: "Source",
        condition: "Condition",
      },
      prompt: {
        enterGmLabel: "Full effect description (GM only)",
        enterPublicLabel: "Vague label shown to players",
      },
      snoozed: "snoozed",
    },`;

const newHandoutSection = `    savedEffects: {
      heading: "Saved Effects",
      intro:
        "Saved effects let you store long-term conditions outside the Turn Tracker — curses, diseases, poisons, hidden debuffs, and other non-combat conditions. They persist in script state and can be optionally copied into the Turn Tracker when combat begins.",
      visibility: {
        heading: "Visibility Modes",
        rows: [
          ["public", "Full effect label is visible in the Turn Tracker and public chat."],
          ["masked", "A vague public label is shown to players; full details are GM-only."],
          ["gm", "No Turn Tracker row. Full details are stored in state and whispered to the GM when the affected token reaches the top of initiative."],
        ],
      },
      commands: {
        heading: "Saved Effects Commands",
        intro: "All --saved commands are GM-only. Select a token before running --saved or --saved add.",
        rows: [
          ["!condition-tracker --saved", "View saved effects for the selected token."],
          ["!condition-tracker --saved add", "Launch the add-saved-effect wizard."],
          ["!condition-tracker --saved edit <id>", "Edit labels or visibility for an existing saved effect."],
          ["!condition-tracker --saved remove <id>", "Permanently remove a saved effect."],
          ["!condition-tracker --saved promote <id> --visibility public|masked|gm", "Copy a saved effect into the Turn Tracker (public or masked) or confirm it is GM-only tracked."],
          ["!condition-tracker --saved snooze <id> --scope turn|rounds|combat --rounds <n>", "Snooze a GM reminder for this turn, N rounds, or this combat."],
          ["!condition-tracker --saved snooze-clear <id>", "Clear an active snooze so reminders resume immediately."],
        ],
      },
      reminders: {
        heading: "GM Reminders",
        body: "When a token with gm or masked saved effects reaches the top of the Turn Tracker, the GM receives a whisper listing the hidden effects with action buttons. Duplicate reminders within the same turn are suppressed. Use the Snooze buttons to suppress reminders for a turn, a number of rounds, or for the remainder of the current combat.",
      },
    },`;

const newCmdRefRows = `        ["--saved", "View saved long-term effects for the selected token (select token first)"],
        ["--saved add", "Add a saved effect (curse, disease, etc.) to the selected token"],
        ["--saved edit <id>", "Edit an existing saved effect by id"],
        ["--saved remove <id>", "Remove a saved effect by id"],
        ["--saved promote <id> --visibility public|masked|gm", "Copy a saved effect into the Turn Tracker (public/masked) or mark it as GM-only active"],
        ["--saved snooze <id> --scope turn|rounds|combat --rounds <n>", "Snooze a saved-effect reminder for the current turn, N rounds, or this combat"],
        ["--saved snooze-clear <id>", "Clear an active snooze on a saved effect"],`;

const newQuickStartRow = `        ["!condition-tracker --saved", "Select a token first, then run this command to view and manage saved long-term effects (curses, diseases, hidden debuffs, etc.) for that token. Also available as the ConditionTrackerSaved macro."],`;

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
      content = content.replace(/(\s*\[\"--lang)/, `\n${newCmdRefRows}$1`);
    } else if (content.includes('"--help"')) {
      content = content.replace(/(\s*\[\"--help")/, `\n${newCmdRefRows}$1`);
    }
    modified = true;
  }

  // 9. quickStart row before '--menu' row
  if (
    content.includes('!condition-tracker --menu') &&
    !content.includes('!condition-tracker --saved')
  ) {
    content = content.replace(/(\s*\[\"!condition-tracker --menu)/, `\n${newQuickStartRow}$1`);
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
