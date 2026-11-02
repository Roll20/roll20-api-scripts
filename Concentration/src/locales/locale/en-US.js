const TRANSLATION = {
  titles: {
    ready: 'Concentration is ready.',
    menu: 'Concentration Settings',
    help: 'Concentration Commands',
    status: 'Who Is Concentrating',
    advantage: 'Advantage on Concentration Saves',
    reset: 'Reset Concentration',
    concentration: 'Concentration',
    save: 'Concentration Save',
    check: 'Concentration Check',
  },
  messages: {
    migrated:
      'Upgraded from version 1.0. Your settings and advantage list were kept, and your old macros still work.',
    reconciled:
      'Caught up with the map: concentrating tokens found {added}, old entries removed {dropped}.',
    readyHint: 'Type {command} for the settings, or open the Command Deck handout.',
    settingChanged: '{setting} is now {value}.',
    confirmReset:
      'Put every setting back to its default and clear the advantage list? Concentration markers on the map stay.',
    reset: 'Settings put back to their defaults.',
    journal: 'Handouts rebuilt: {help} and {deck}.',
  },
  notices: {
    started: '{name} is now concentrating on {spell}.',
    startedNoSpell: '{name} is now concentrating.',
    switched: '{name} stops concentrating on {old} and is now concentrating on {spell}.',
    switchedNoSpell: '{name} is now concentrating.',
    ended: '{name} is no longer concentrating on {spell}.',
    endedNoSpell: '{name} is no longer concentrating.',
    lost: '{name} loses concentration on {spell}.',
    lostNoSpell: '{name} loses concentration.',
    kept: '{name} keeps concentrating on {spell}.',
    keptNoSpell: '{name} keeps concentrating.',
    zeroHp: '{name} drops to 0 hit points and loses concentration on {spell}.',
    zeroHpNoSpell: '{name} drops to 0 hit points and loses concentration.',
    checkNeeded: '{name} must make a Constitution saving throw to keep concentrating: {dc}.',
  },
  save: {
    dc: 'DC',
    dcValue: 'DC {dc}',
    modifier: 'Modifier',
    roll: 'Roll',
    advantageRoll: '{first} and {second} (advantage)',
    success: 'Success',
    failure: 'Failure',
  },
  menu: {
    concentratingCount: 'Concentrating now: {count}',
    settings: 'Settings',
    footer: 'Type {command} to come back here. Every button is also in the "{deck}" handout.',
  },
  status: {
    none: 'Nobody is concentrating.',
  },
  advantage: {
    intro:
      'Characters set to On roll their concentration saves with advantage, as with the War Caster feat. This applies to automatic saves.',
    none: 'There are no characters in this game.',
  },
  buttons: {
    roll: 'Roll',
    advantage: 'Advantage',
    status: 'Status',
    advantageMenu: 'Advantage Menu',
    help: 'Help',
    reset: 'Reset',
    confirmReset: 'Reset Settings',
    end: 'End',
    menu: 'Menu',
    concentrate: 'Concentrate on…',
    toggle: 'Toggle',
    journal: 'Rebuild Handouts',
  },
  prompts: {
    spell: 'Spell',
  },
  values: {
    on: 'On',
    off: 'Off',
    bar: 'Bar {bar}',
    unnamed: 'Unnamed',
    sendTo: {
      everyone: 'Everyone',
      character: 'Character',
      gm: 'GM',
    },
    supportMode: {
      basic: 'Basic',
      detailed: 'Detailed',
    },
  },
  settings: {
    language: {
      label: 'Language',
      desc: 'The language of chat messages and handouts.',
    },
    command: {
      label: 'Command',
      desc: 'The chat command, without the "!". Version 1.0 macros use concentration.',
    },
    statusmarker: {
      label: 'Status Marker',
      desc: 'The token marker that shows concentration. Custom token markers can be used.',
    },
    bar: {
      label: 'HP Bar',
      desc: 'The token bar that holds hit points. Damage to it calls for a concentration save.',
    },
    send_reminder_to: {
      label: 'Send Reminder To',
      desc: 'Who sees concentration messages and saves: everyone, the GM, or the character’s players (the GM gets a copy).',
    },
    auto_add_concentration_marker: {
      label: 'Auto Add Con. Marker',
      desc: 'Add the marker when a concentration spell is cast from a sheet.',
      hint: 'D&D 5e 2014 (OGL) and 2024 sheets.',
    },
    auto_roll_save: {
      label: 'Auto Roll Save',
      desc: 'Roll the save as soon as a concentrating token takes damage. When off, the reminder has Roll and Advantage buttons.',
    },
    show_roll_button: {
      label: 'Roll Button',
      desc: 'Add Roll and Advantage buttons to the reminder when Auto Roll Save is off.',
    },
    end_at_zero: {
      label: 'End at 0 HP',
      desc: 'End concentration without a save when a token drops to 0 hit points.',
    },
    bonus_attribute: {
      label: 'Bonus Attribute',
      desc: 'The sheet attribute added to concentration saves. constitution_save_mod works on D&D 5e 2014 and 2024 sheets.',
    },
    debug: {
      label: 'Debug Mode',
      desc: 'Write notes about spell detection and saves to the API console, for support requests.',
    },
    support_mode: {
      label: 'Support Mode',
      desc: 'How much Debug Mode writes: Basic (short) or Detailed.',
    },
  },
  help: {
    menu: 'With nothing selected (GM): open the settings. With tokens selected: start or end concentration.',
    toggle:
      'Start concentrating on a spell with the selected tokens. Name a different spell to switch; run it again to end.',
    end: 'End concentration for the selected tokens.',
    status: 'List who is concentrating, with End buttons.',
    config: 'Change a setting, for example config auto_roll_save|false.',
    advantageMenu: 'Choose which characters roll concentration saves with advantage.',
    toggleAdvantage: 'Switch advantage on or off for one character.',
    roll: 'Roll a save from a reminder’s Roll or Advantage button.',
    journal: 'Rebuild the Help and Command Deck handouts.',
    reset: 'Put every setting back to its default.',
    help: 'Show this list.',
    footer: 'Full instructions are in the "{help}" handout; buttons are in the "{deck}" handout.',
    playerFooter: 'Select your token first.',
  },
  errors: {
    noSelection: 'Select a token first.',
    notYours: 'You can only change concentration for tokens you control.',
    gmOnly: 'Only the GM can use that command.',
    notConcentrating: 'That token is not concentrating.',
    unknownSetting: 'There is no setting called "{key}".',
    badSettingValue: '"{value}" is not a valid value for {key}.',
    rollExpired: 'That button has expired.',
    unknownCharacter: 'That character no longer exists.',
    internal: 'Something went wrong. The API console has the details.',
  },
  hints: {
    noSelection: 'Select the caster’s token, then run the command again.',
    rollExpired: 'Buttons work once and for 10 minutes. Damage the token again for a new one.',
    unknownSetting: 'Type the command with nothing selected to see the settings.',
  },
  warnings: {
    unknownMarker:
      'The status marker "{marker}" is not one of this game’s markers. Choose another in the settings.',
  },
  deck: {
    subtitle: 'Command Deck',
    selected: 'Selected Tokens',
    selectedDesc: 'Select the caster’s token first.',
    table: 'The Table',
    tableDesc: 'See who is concentrating, and who has advantage on their saves.',
    tools: 'Tools',
    toolsDesc: 'Settings, the command list and the handouts.',
    footer: 'Full instructions are in the "{help}" handout.',
  },
  handout: {
    versionLabel: 'Version',
    subtitle: 'Concentration markers, reminders and saves for D&D 5e',
    overview: {
      heading: 'Overview',
      body: 'Concentration keeps track of who is concentrating on which spell. It puts a marker on the caster’s token, rolls (or asks for) a Constitution save when that token takes damage, and tells the table when concentration ends.',
    },
    quickStart: {
      heading: 'Quick start',
      steps: [
        'Select the caster’s token and type !concentration followed by the spell, for example !concentration Bless.',
        'Change the token’s hit points in its bar bubble. A save is rolled at DC 10, or half the damage if that is higher.',
        'Run the same command again, or take the marker off, to end concentration.',
        'Type !concentration with nothing selected to open the settings.',
      ],
    },
    concentrating: {
      heading: 'Concentrating',
      points: [
        'Naming a different spell switches concentration to it, as casting a new concentration spell does.',
        'Putting the marker on a token by hand starts concentration without a spell; taking it off, or deleting the token, ends it.',
        'A new linked token of a concentrating character gets the marker, and a pasted token that carries the marker is tracked.',
        'Tokens of one character with a linked hit point bar share concentration. Unlinked tokens, such as a pack of goblins from one sheet, concentrate on their own.',
        'Everyone sees a message when concentration starts, switches or ends, unless Send Reminder To says otherwise.',
      ],
    },
    saves: {
      heading: 'Concentration saves',
      points: [
        'The DC is 10 or half the damage taken, whichever is higher, up to DC 30.',
        'The modifier comes from the Bonus Attribute on the character’s sheet; a missing value counts as 0.',
        'Auto Roll Save rolls at once. When it is off, the reminder has Roll and Advantage buttons for the player or GM.',
        'A failed save ends concentration. With End at 0 HP on, dropping to 0 hit points ends it without a save.',
        'The Advantage Menu gives a character advantage on automatic saves, as the War Caster feat does.',
      ],
    },
    automatic: {
      heading: 'Spells cast from a sheet',
      points: [
        'With Auto Add Con. Marker on, casting a concentration spell from a D&D 5e 2014 (OGL) or 2024 sheet adds the marker.',
        'The caster’s tokens on the page they are viewing are marked; if there are none, tokens on any page are.',
        'Only cards from the GM, another Mod or one of the character’s players count. Casting the same spell again changes nothing.',
        'A D&D 2024 card that only mentions concentration in its text, such as the War Caster feat, can start concentration but never replaces a spell.',
        'D&D 2024 sheets may need the Experimental API server. Turn on Debug Mode to see why a spell was or was not detected.',
      ],
    },
    players: {
      heading: 'Players',
      points: [
        'Players can start and end concentration for tokens they control, and use Roll and Advantage buttons on their own saves.',
        'With Send Reminder To set to Character, messages are whispered to the character’s players and to the GM.',
      ],
    },
    commands: {
      heading: 'Commands',
      intro: 'Other Mods, such as ScriptCards, can send these commands too.',
      colCommand: 'Command',
      colDesc: 'What it does',
    },
    settings: {
      heading: 'Settings',
      intro:
        'Change settings with the buttons in the settings card, or with config <key>|<value>. Some can also be set on the Mod’s page.',
      colKey: 'Key',
      colName: 'Name',
      colDesc: 'What it does',
    },
    upgrading: {
      heading: 'Upgrading from version 1.0',
      points: [
        'Settings, the advantage list and every command keep working.',
        'Messages now say when concentration ends, and on which spell.',
        'Tokens that already carry the marker are picked up on startup.',
      ],
    },
    troubleshooting: {
      heading: 'Troubleshooting',
      points: [
        'No save when hit points drop: check that the token has the marker and that HP Bar is the bar you changed. Changes made by other Mods through the API do not raise events, so they are not seen.',
        'The modifier is 0: check the Bonus Attribute against the character’s sheet.',
        'Spells cast from the sheet are not detected: turn on Debug Mode, cast the spell again and read the API console.',
        'Two characters share a name: detection uses the first match. Give characters unique names.',
      ],
    },
    languages: {
      heading: 'Languages',
      body: 'Concentration is translated into the languages below. Choose one with the Language setting.',
      colCode: 'Code',
      colName: 'Language',
      colNative: 'Native name',
    },
    credits: {
      heading: 'Credits',
      original: 'Original Mod by',
      maintainer: 'Maintained by',
      support: 'Report bugs and ideas on the Roll20 Mod forum or on GitHub.',
    },
    footer: 'Buttons for every action are in the "{deck}" handout.',
  },
};

export default TRANSLATION;
