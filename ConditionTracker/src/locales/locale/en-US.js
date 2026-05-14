const TRANSLATION = {
  conditions: {
    Grappled: {
      past: "grappled",
      verb: "grapples",
    },
    Restrained: {
      past: "restrained",
      verb: "restrains",
    },
    Prone: {
      past: "knocked prone",
      verb: "knocks",
      suffix: "prone",
    },
    Poisoned: {
      past: "poisoned",
      verb: "poisons",
    },
    Stunned: {
      past: "stunned",
      verb: "stuns",
    },
    Blinded: {
      past: "blinded",
      verb: "blinds",
    },
    Charmed: {
      past: "charmed",
      verb: "charms",
    },
    Frightened: {
      past: "frightened",
      verb: "frightens",
    },
    Incapacitated: {
      past: "incapacitated",
      verb: "incapacitates",
    },
    Invisible: {
      past: "invisible",
      verb: "makes",
      suffix: "invisible",
    },
    Paralyzed: {
      past: "paralyzed",
      verb: "paralyzes",
    },
    Petrified: {
      past: "petrified",
      verb: "petrifies",
    },
    Unconscious: {
      past: "unconscious",
      verb: "knocks",
      suffix: "unconscious",
    },
    Spell: {
      past: "affected by a spell",
      verb: "casts a spell on",
    },
    Ability: {
      past: "affected by an ability",
      verb: "uses an ability on",
    },
    Advantage: {
      past: "has advantage",
      verb: "grants advantage to",
      noBy: true,
    },
    Disadvantage: {
      past: "has disadvantage",
      verb: "imposes disadvantage on",
      noBy: true,
    },
  },
  condNames: {
    Grappled: "Grappled",
    Restrained: "Restrained",
    Prone: "Prone",
    Poisoned: "Poisoned",
    Stunned: "Stunned",
    Blinded: "Blinded",
    Charmed: "Charmed",
    Frightened: "Frightened",
    Incapacitated: "Incapacitated",
    Invisible: "Invisible",
    Paralyzed: "Paralyzed",
    Petrified: "Petrified",
    Unconscious: "Unconscious",
    Spell: "Spell",
    Ability: "Ability",
    Advantage: "Advantage",
    Disadvantage: "Disadvantage",
    Other: "Other",
  },
  templates: {
    display: {
      custom: "{emoji} {target} affected by {effect} ({source})",
      advantage: "{emoji} {source} has advantage against {target}{subject}",
      disadvantage:
        "{emoji} {source} has disadvantage against {target}{subject}",
      noBy: "{emoji} {target} {past} ({source})",
      self: "{target} is {past}",
      standard: "{emoji} {target} {past} by {source}",
    },
    apply: {
      custom: "{source} applies {effect} to {target}.",
      advantage: "{source} has advantage against {target}{subject}.",
      disadvantage: "{source} has disadvantage against {target}{subject}.",
      self: "{target} is {past}.",
      withSuffix: "{source} {verb} {target} {suffix}.",
      standard: "{source} {verb} {target}.",
    },
    remove: {
      custom: "{target} is no longer affected by {effect}.",
      advantage: "{source} no longer has advantage against {target}{subject}.",
      disadvantage:
        "{source} no longer has disadvantage against {target}{subject}.",
      noBy: "{target} no longer {past}.",
      self: "{target} is no longer {past}.",
      standard: "{target} is no longer {past} by {source}.",
    },
  },
  ui: {
    wizard: {
      selectCondition: "Select Condition",
      selectSource: "Select Source Token",
      selectTarget: "Select Target Token",
      selectSubject: "Select Subject",
      selectDuration: "Select Duration",
      confirmTargetTitle: "Confirm Target List",
      applyEffectTitle: "Apply {condition} Effect",
      noTokens: "No named tokens found on the active page.",
      confirmIntro: "The following tokens will receive the condition:",
      confirmBtn: "Confirm target list",
      enterDetails: "Enter effect details",
      noneBtn: "None",
      noneOrSourceBtn: "None or Apply to Source",
      subjectDesc: "Select who or what delivers the effect.",
      sourceDesc:
        "Select the creature that is creating / generating the condition or effect.",
      targetDesc:
        "Select the creature that will receive the condition or effect.",
      otherText: "Other condition text",
      effectDetails: "{condition} details",
    },
    col: {
      players: "Players",
      npcs: "NPCs",
      conditions: "Conditions",
      customEffects: "Custom Effects",
      permanentTurnEnd: "Permanent / Turn End",
      rounds: "Rounds",
      command: "Command",
      result: "Result",
      field: "Field",
      value: "Value",
      option: "Option",
      condition: "Condition",
      marker: "Marker",
      item: "Item",
      removed: "Removed",
      details: "Details",
      description: "Description",
      scenario: "Scenario",
    },
    dur: {
      untilRemoved: "Until removed",
      endOfTargetTurn: "End of target next turn",
      endOfSourceTurn: "End of source next turn",
      round1: "1 round",
      round2: "2 rounds",
      round3: "3 rounds",
      round10: "10 rounds",
      custom: "Custom",
      customPrompt: "Number of rounds",
      untilRemovedDisplay: "Until removed",
      turnsRemaining: "{n} tracked turn end(s) remaining",
    },
    btn: {
      openWizard: "Open Wizard",
      openMultiTarget: "Open Multi-Target Wizard",
      openRemovalList: "Open Removal List",
      showConfig: "Show Config",
      runCleanup: "Run Cleanup",
      reinstallMacro: "Reinstall Macro",
      reinstallHandout: "Reinstall Handout",
      showHelp: "Show Help",
      reorderConditions: "Reorder Condition Rows",
    },
    title: {
      menu: "Menu",
      removalMenu: "Condition Tracker removal",
      config: "Config",
      configTracker: "Condition Tracker config",
      help: "Help",
      applied: "Applied",
      removed: "Condition Removed",
      cleanup: "Cleanup Complete",
      macroReinstalled: "Macro Reinstalled",
      handoutReinstalled: "Handout Reinstalled",
      warning: "Warning",
      error: "Error",
      turnOrder: "Turn Order",
      noConditions: "No Conditions",
      tokenMoved: "Token Moved",
      markedDead: "Marked as Dead",
      zeroHp: "{name} — 0 HP",
      moveToken: "{name} — Move Token?",
      scriptReady: "Script Ready",
      conditionReorder: "Turn Order Changed",
    },
    heading: {
      quickActions: "Quick Actions",
      settings: "Settings",
      markerMappings: "Marker Mappings",
      result: "Result",
      info: "Info",
      commandOptions: "Command Options",
      promptUi: "Prompt UI",
      examples: "Examples",
      summary: "Summary",
    },
    msg: {
      noActive: "No active conditions are tracked.",
      configReset: "Configuration reset to mod defaults.",
      unknownConfig:
        "Unknown config option. Use --config to view supported settings.",
      macroReinstalled:
        "The {wizard} and {multiTarget} macros have been reinstalled for all current GM players.",
      handoutReinstalled: "The help handout {handout} has been reinstalled.",
      duplicate:
        "That exact source, subject, target, condition, and custom text is already active.",
      noTargets: "No target tokens specified for multi-target apply.",
      noSelection:
        "Select at least one token on the board before using --multi-target.",
      invalidIds: "No valid token ids found in the current selection.",
      reSelectTokens:
        "None of the originally-selected tokens could be found. Re-select tokens and try again.",
      conditionNotFound: "Condition id was not found.",
      gmOnly: "Condition Tracker commands are GM-only.",
      commandFailed:
        "The command could not be completed safely. Check the API console for details.",
      sourceTokenNotFound: "Source token could not be found.",
      targetTokenNotFound: "Target token could not be found.",
      subjectTokenNotFound: "Subject token could not be found.",
      invalidCondition:
        "Condition must be one of the predefined conditions or Other.",
      subjectOnlyCustom:
        "--subject is only valid for Spell, Ability, Advantage, Disadvantage, and Other.",
      subjectBypassInvalid:
        "--subjectPromptBypass expects true or false when a value is provided.",
      customDetailsRequired:
        "{condition} details are required. Use --other to provide them.",
      markerConfigFormat:
        "Marker config format is: --config marker Grappled=grab",
      markerPredefinedRequired:
        "Marker configuration requires a predefined condition name.",
      markerNameRequired:
        "Marker configuration requires a non-empty marker name.",
      markerSet: "{condition} marker set to {marker}.",
      healthBarSet: "Health bar set to {bar}.",
      boolSet: "{key} set to {value}.",
      expectedBoolean: "Expected true or false.",
      invalidHealthBar:
        "Health bar must be bar1_value, bar2_value, or bar3_value.",
      markersDisabled: "Markers are disabled.",
      noMarkerConfigured: "No marker is configured for this condition.",
      markerApplied: "Marker applied: {marker}",
      markerPresent: "Marker already present: {marker}",
      langSet: "Language set to {locale}.",
      invalidLocale: "Invalid locale. Supported locales: {locales}.",
      otherDurationRequiresRounds:
        "Other duration requires a numeric round count, for example --duration 5 rounds.",
      invalidDuration:
        "Duration must be Until removed, an end-of-turn option, or a positive round count.",
      zeroHpNoConditions:
        "{name} has reached 0 HP and has no active conditions.",
      zeroHpConditions: "{name} has reached 0 HP. Choose conditions to remove:",
      removeAllBtn: "Remove All Conditions for {name}",
      markIncapacitated: "Mark as Incapacitated",
      removeFromTurnOrder: "Remove from Turn Order",
      alreadyIncapacitated: "{name} is already Incapacitated.",
      tokenRemovedFromTurn: "{name} has been removed from the turn order.",
      tokenNotInTurn: "{name} was not found in the turn order.",
      moveTokenPrompt:
        "Move {name} to the map layer so it remains visible but won't interfere with other tokens?",
      moveTokenBtn: "Move {name} to Map Layer",
      tokenMoved: "{name} has been moved to the map layer.",
      tokenNotFound: "Token not found.",
      noActiveConditions: "{name} has no active conditions to remove.",
      deadNoConditions: "{name} was marked as dead. No conditions were active.",
      scriptReady: "{name} is active and you are using version {version}.",
      reachedZeroHp: "{name} reached 0 HP",
      manuallyRemoved: "it was manually removed",
      durationExpired: "its duration expired",
      markedAsDead: "{name} was marked as dead",
      conditionReorder:
        "The turn order changed and {count} tracked condition row(s) may now be out of place. Click below to restore them after their assigned tokens.",
      conditionsReordered:
        "Condition rows have been repositioned after their assigned tokens.",
    },
    removal: {
      conditionField: "Condition",
      reasonField: "Reason",
      turnRowField: "Turn Tracker row",
      markerField: "Marker",
      notConfigured: "Not configured",
      markerRemoved: "Removed ({marker})",
      markerRetained: "Retained ({marker})",
      rowRemoved: "Removed",
      rowMissing: "Already missing",
      manualReason: "Manual removal",
    },
    cleanup: {
      orphaned: "Orphaned condition entries",
      stale: "Stale condition entries",
      orphanedRows: "Orphaned Turn Tracker rows",
      unusedMarkers: "Unused markers",
    },
    apply: {
      turnAppended: "Target was not in turn order; condition row was appended.",
      turnInserted: "Condition row inserted below target token.",
    },
  },
  handout: {
    versionLabel: "Version",
    subtitle: "D&D 5e Status Effect Manager",
    footerNote:
      "This handout is automatically created and updated each time the script loads.",
    overview: {
      heading: "Overview",
      body: "Condition Tracker manages D&D 5e status conditions and custom effects as labelled rows in the Roll20 Turn Tracker. Apply conditions to tokens, track durations by initiative order, and automatically remove expired effects when a turn ends. All commands are GM-only and can be triggered from chat or via the installed macros.",
    },
    quickStart: {
      heading: "Quick Start",
      colCommand: "Command",
      colDesc: "Description",
      rows: [
        [
          "!condition-tracker --prompt",
          "Step-by-step wizard — pick condition, tokens & duration interactively. Also available as the ConditionTrackerWizard macro.",
        ],
        [
          "!condition-tracker --multi-target",
          "Apply one condition to several tokens simultaneously. Also available as the ConditionTrackerMultiTarget macro.",
        ],
        [
          "!condition-tracker --menu",
          "Open the main management menu with buttons to apply, review, or remove conditions.",
        ],
      ],
    },
    commandsRef: {
      heading: "Commands Reference",
      colFlag: "Flag",
      colDesc: "Description",
      rows: [
        ["--prompt", "Interactive step-by-step wizard UI"],
        [
          "--multi-target",
          "Apply a condition to multiple target tokens at once",
        ],
        ["--menu", "Show main menu (add remove for removal menu)"],
        [
          "--source X --target Y --condition Z",
          "Apply a condition directly without the wizard",
        ],
        [
          "--duration &lt;value&gt;",
          "Duration for a direct apply (e.g. 2 rounds)",
        ],
        [
          "--other &lt;text&gt;",
          "Custom text for Spell / Ability / Other effect types",
        ],
        [
          "--remove &lt;condition-id&gt;",
          "Remove a specific condition by its unique ID",
        ],
        [
          "--config &lt;option&gt; &lt;value&gt;",
          "Adjust configuration settings (see Config section below)",
        ],
        [
          "--prompt --subjectPromptBypass true|false",
          "Override subjectPromptBypass for this command only (also supports --subject-prompt-bypass)",
        ],
        [
          "--cleanup",
          "Reconcile state — remove orphaned conditions and Turn Tracker rows",
        ],
        [
          "--reorder-conditions",
          "Manually reposition condition rows after their assigned tokens in the Turn Tracker",
        ],
        ["--reinstall-macro", "Recreate or update the GM macros"],
        [
          "--reinstall-handout",
          "Recreate or update the localized help handout",
        ],
        [
          "--lang &lt;locale&gt;",
          "Output this command's messages in an additional locale (bilingual mode)",
        ],
        ["--help", "Show a brief help card in chat"],
      ],
    },
    standardConditions: {
      heading: "Standard Conditions (D&amp;D 5e)",
      colCondition: "Condition",
    },
    customEffects: {
      heading: "Custom Effect Types",
      colType: "Type",
      colNotes: "Notes",
      rows: [
        [
          "🔮 Spell",
          "Track a named spell effect — you will be prompted for the spell name",
        ],
        [
          "🎯 Ability",
          "Track a named class or racial ability — you will be prompted for the ability name",
        ],
        [
          "🍀 Advantage",
          "Record advantage granted from one token to another; grouped with the source in initiative",
        ],
        [
          "⬇️ Disadvantage",
          "Record disadvantage imposed; grouped with the source in initiative",
        ],
        [
          "📝 Other",
          "Freeform custom label — you will be prompted for a description",
        ],
      ],
    },
    durationOptions: {
      heading: "Duration Options",
      intro:
        "The remaining count is shown in the Turn Tracker pr column and decrements when the anchor token's turn ends.",
      colOption: "Option",
      colBehaviour: "Behaviour",
      rows: [
        [
          "Until removed",
          "Permanent — must be removed manually via the menu or --remove",
        ],
        [
          "End of target's next turn",
          "Expires when the target token's next turn ends in initiative",
        ],
        [
          "End of source's next turn",
          "Expires when the source token's next turn ends in initiative",
        ],
        [
          "1 / 2 / 3 / 10 rounds",
          "Fixed countdown; one decrement per anchor-token turn-end",
        ],
      ],
    },
    configuration: {
      heading: "Configuration",
      intro:
        "Use !condition-tracker --config &lt;option&gt; &lt;value&gt; or the Config button in the main menu.",
      colOption: "Option",
      colValues: "Values",
      colDesc: "Description",
      rows: [
        [
          "useMarkers",
          "true / false",
          "Apply Roll20 status markers to tokens when a condition is added",
        ],
        [
          "useIcons",
          "true / false",
          "Show short icon codes (e.g. [G]) instead of emoji in Turn Tracker rows",
        ],
        [
          "subjectPromptBypass",
          "true / false",
          "Skip the optional subject-token step for Spell / Ability / Other effects",
        ],
        [
          "healthBar",
          "bar1_value / bar2_value / bar3_value",
          "Token bar to watch; when it drops to 0 the GM is prompted to clean up conditions",
        ],
        [
          "language",
          "en-US / fr / de / es / pt-BR / ko",
          "Output language for chat messages and the help handout",
        ],
        [
          "marker",
          "&lt;Condition&gt;=&lt;marker name&gt;",
          "Override the status marker used for a specific condition (e.g. marker Grappled=grab)",
        ],
      ],
    },
    defaultMarkers: {
      heading: "Default Status Markers",
      colCondition: "Condition",
      colMarker: "Marker Name",
    },
    availableLocales: {
      heading: "Available Translations",
      intro:
        "Use the language config option to set chat messages and the help handout to any supported locale. Short aliases are also accepted for en, zh, and pt.",
      colLocale: "Locale",
      colLanguage: "Language",
      colFile: "Translation File",
    },
  },
};

export default TRANSLATION;
