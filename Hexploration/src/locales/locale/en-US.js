export default {
  titles: {
    ready: 'Hexploration is ready.',
    settings: 'Hexploration Settings',
    languages: 'Choose a Language',
    pageSettings: 'Page Settings: {page}',
    status: 'Hexploration Status: {page}',
    help: 'Hexploration Commands',
    confirm: 'Please Confirm',
  },
  discovery: {
    title: 'Location Discovered',
  },
  menu: {
    draw: 'Draw',
    reveal: 'Reveal and Hide',
    locations: 'Locations',
    tools: 'Tools',
    layerInUse: 'New hexes are being drawn on the {layer}.',
    pageSettingsHelp:
      'These settings apply to this page only. Settings marked ★ override the global settings.',
  },
  buttons: {
    fill: 'Fill',
    fillInverse: 'Inverse Fill',
    undo: 'Undo Fill',
    reveal: 'Reveal',
    conceal: 'Conceal',
    explore: 'Explore',
    revealPage: 'Reveal Page',
    resetPage: 'Reset Page',
    mark: 'Mark Location',
    unmark: 'Unmark',
    name: 'Name Hex',
    settings: 'Settings',
    pageSettings: 'Page Settings',
    status: 'Status',
    rescan: 'Rescan',
    calibrate: 'Calibrate',
    calibrateReset: 'Reset Calibration',
    help: 'Help',
    change: 'Change',
    menu: 'Menu',
    clearOverrides: 'Clear Overrides',
    confirmReset: 'Yes, Remove All Hexes',
  },
  prompts: {
    name: 'Location name (leave empty to clear)',
  },
  values: {
    on: 'On',
    off: 'Off',
    none: 'None',
    hexLayer: {
      auto: 'Auto (foreground if available)',
      foreground: 'foreground layer',
      objects: 'token layer',
    },
    revealBy: {
      players: 'Player tokens',
      characters: 'Character tokens',
      all: 'All tokens',
    },
    revealMode: {
      clear: 'Clear',
      glimpse: 'Glimpse',
    },
    announce: {
      all: 'Everyone',
      gm: 'GM only',
      off: 'Off',
    },
    orientation: {
      vertical: 'Hex (V)',
      horizontal: 'Hex (H)',
    },
    fillKind: {
      fill: 'Fill',
      fillInverse: 'Inverse Fill',
      conceal: 'Conceal',
    },
  },
  settings: {
    language: {
      label: 'Language',
      desc: 'Language for menus, messages and handouts.',
    },
    hexLayer: {
      label: 'Hex Layer',
      desc: 'Where new hexes are drawn. Auto tries the foreground layer (above tokens) and falls back to the token layer if the game does not support it.',
    },
    fillColor: {
      label: 'Fill Colour',
      desc: 'Colour of new hexes. Use rgba() for see-through hexes, for example rgba(0,0,0,0.8).',
    },
    strokeColor: {
      label: 'Border Colour',
      desc: 'Colour of the outline of new hexes.',
    },
    labelColor: {
      label: 'Label Colour',
      desc: 'Colour of the GM-only name labels on named hexes.',
    },
    glimpseColor: {
      label: 'Glimpse Colour',
      desc: 'Colour hexes change to when glimpsed (Glimpse reveal mode). Use a see-through rgba() colour.',
    },
    strokeWidth: {
      label: 'Border Width',
      desc: 'Width of the outline of new hexes, in pixels (0 to 20).',
    },
    maxDistance: {
      label: 'Hex Reveal Distance',
      desc: 'Applied to hexes as they are drawn: a token must be within this many hexes to reveal them, however far it can see. Leave empty for no limit.',
    },
    revealDistance: {
      label: 'Sight Distance',
      desc: 'How many hexes around a moving token are revealed (0 to 20). 0 reveals only the hexes the token passes through.',
    },
    lineOfSight: {
      label: 'Line of Sight',
      desc: 'When on, a hex is only revealed if no covered hex lies between it and the token.',
    },
    revealPath: {
      label: 'Reveal Along Path',
      desc: 'When on, every hex a token passes through while being dragged (including waypoints) is revealed, not just where it stops.',
    },
    revealBy: {
      label: 'Tokens That Reveal',
      desc: 'Which tokens on the token layer reveal hexes: tokens controlled by a player, tokens that represent any character, or every token.',
    },
    revealMode: {
      label: 'Reveal Mode',
      desc: 'Clear removes hexes within sight. Glimpse makes them see-through instead; they are removed when a token enters them.',
    },
    announce: {
      label: 'Announce Discoveries',
      desc: 'Who sees the chat message when a named location is discovered.',
    },
    pingDiscoveries: {
      label: 'Ping Discoveries',
      desc: 'When on, players are pinged to a named location when it is discovered.',
    },
    hideCoveredTokens: {
      label: 'Hide Covered Tokens',
      desc: 'Roll20 draws names, bars and auras above hexes. When on, tokens under a covered hex have their player-visible name, bars and auras switched off, and switched back on when they are uncovered.',
    },
  },
  status: {
    engine: 'Game engine',
    grid: 'Grid',
    layer: 'Hex layer',
    hexes: 'Hexes',
    named: 'Named hexes',
    icons: 'Location tokens',
    glimpsed: 'Glimpsed hexes',
    pending: 'Locations waiting for a fill',
    calibrated: 'Calibrated',
    overrides: 'Page overrides',
    undo: 'Undo available',
  },
  messages: {
    filled:
      'Fill complete. Hexes drawn: {created}. Restyled: {restyled}. Locations hidden: {icons}.',
    revealed: 'Hexes revealed: {count}.',
    revealedPage: 'Every hex on the page revealed ({count}).',
    confirmReset:
      'Remove every hex from "{page}" ({count})? Location tokens return to the token layer. Undo cannot reverse this.',
    resetPage: 'Hexes removed from the page: {count}.',
    undone: 'Last fill undone. Hexes removed: {removed}. Restyled hexes restored: {restored}.',
    named: 'Hexes named "{name}": {count}.',
    unnamed: 'Names cleared: {count}.',
    marked:
      'Locations hidden in existing hexes: {attached}. Waiting for the next fill that covers them: {pending}.',
    unmarked: 'Tokens that are no longer locations: {count}.',
    settingChanged: '{setting} set to {value}.',
    rescanned:
      'Rescan complete. Kept: {kept}. Adopted: {adopted}. Re-filed: {moved}. Missing and forgotten: {dropped}. Labels re-linked: {labels}. Location tokens re-linked: {icons}.',
    calibrated:
      'Grid calibrated (column step {colStep}px, row step {rowStep}px). Rescan: kept {kept}, re-filed {moved}, adopted {adopted}.',
    calibrationReset:
      'Calibration removed. Rescan: kept {kept}, re-filed {moved}, adopted {adopted}.',
    journalRebuilt: 'The "{help}" and "{deck}" handouts have been rebuilt.',
    migrated:
      'Your Hexploration 1.x hex maps have been upgraded. If this game was copied from a Legacy game, run Rescan on each hex map page.',
    pruned:
      'Saved hexes that no longer exist and were forgotten: {dropped}. If this game or page was copied, run Rescan on the page to pick its hexes up again.',
    readyHint:
      'Type !hexploration for the menu, or open the "Hexploration - Command Deck" handout.',
  },
  warnings: {
    foregroundUnavailable:
      'This game does not support drawing on the foreground layer, so hexes were drawn on the token layer.',
    someFailed: 'Hexes that could not be drawn: {count}. Check the API console for details.',
  },
  errors: {
    noPage: 'Could not find the page to work on.',
    notHex: 'This page does not use a hex grid.',
    noPolygons: 'Select one or more drawn shapes to fill.',
    emptyArea: 'The selected area does not contain any hex centres.',
    tooMany: 'That would create too many hexes in one go ({count}).',
    nothingToConceal: 'Select drawn shapes or tokens to conceal.',
    nothingToReveal: 'Select hexes, drawn shapes or tokens to reveal.',
    noTokens: 'Select one or more tokens first.',
    noHexes: 'Select one or more hexes (or tokens standing on hexes) first.',
    nothingToUndo: 'There is no fill to undo.',
    unknownCommand: 'Unknown command: {command}',
    unknownSetting: 'Unknown setting: {key}',
    unknownPageSetting: 'Settings that can be set per page: {keys}',
    invalidValue: '"{value}" is not a valid value for {key}.',
    calibrateNeedsTokens: 'Select one or two tokens snapped to hex centres.',
    calibrateFailed: 'Those tokens cannot be used to calibrate.',
    unexpected: 'Something went wrong: {message}',
  },
  hints: {
    noPage: 'Open the page you want to work on, or select something on it.',
    notHex: 'Set the page grid to Hex (V) or Hex (H) in Page Settings.',
    noPolygons:
      'Draw a polygon, rectangle, ellipse or freehand shape around the area, select it, then try again.',
    emptyArea: 'Draw a larger shape, or check the page grid settings.',
    tooMany: 'Fill a smaller area, or split the area into several shapes.',
    noHexes: 'Hexes are on the foreground or token layer; switch to that layer to select them.',
    unknownCommand: 'Type !hexploration help to list the commands.',
    unknownSetting: 'Type !hexploration set to see every setting.',
    calibrateNeedsTokens:
      'Snap a token to the centre of a hex and select it. Select a second token snapped to a neighbouring hex in the same row (Hex V) or column (Hex H) to correct the hex size too.',
    calibrateFailed:
      'Two tokens must be in the same row (Hex V) or the same column (Hex H), at least one hex apart.',
    unexpected: 'Details are in the API console log.',
  },
  help: {
    menu: 'Show the menu.',
    fill: 'Cover the selected drawn shapes with hexes.',
    fillInverse: 'Cover the whole page except inside the selected shapes.',
    undo: 'Undo the last fill, inverse fill or conceal, and restore the shapes it used.',
    reveal: 'Reveal the selected hexes, and the hexes under the selected shapes and tokens.',
    revealPage: 'Reveal every hex on the page without announcements.',
    conceal: 'Cover the area under the selected shapes and tokens with hexes again.',
    explore: 'Reveal around the selected tokens as if they had just moved there.',
    resetPage: 'Remove every hex on the page (asks first).',
    name: 'Name the selected hexes, or the hexes under the selected tokens. Leave the name empty to clear it.',
    mark: 'Turn the selected tokens into hidden locations.',
    unmark: 'Stop the selected tokens being hidden locations.',
    set: 'Change a setting, or show all settings.',
    pageSet: 'Override a reveal setting on the current page only.',
    pageClear: 'Remove the current page’s overrides.',
    rescan: 'Rebuild the page’s hex list, for example after copying a page or game.',
    calibrate: 'Line the hex grid up with one or two selected tokens snapped to hex centres.',
    calibrateReset: 'Remove the current page’s calibration.',
    status: 'Show what Hexploration knows about the current page.',
    journal: 'Rebuild the Help and Command Deck handouts.',
    help: 'Show this list.',
    handout: 'Full instructions are in the "{name}" handout.',
  },
  deck: {
    drawDesc: 'Draw shapes around an area, select them, then fill. Undo reverses the last fill.',
    revealDesc:
      'Select hexes, shapes or tokens to reveal or cover them again. Explore reveals around selected tokens as if they had moved.',
    locationsDesc:
      'Select tokens to hide them as locations under hexes. Select hexes or tokens to name a hex.',
    toolsDesc:
      'Settings, page overrides, status, rescanning copied pages and calibrating the grid.',
    footer: 'See the "{help}" handout for full instructions.',
  },
  handout: {
    versionLabel: 'Version',
    subtitle: 'Hex-by-hex exploration for Roll20',
    footer: 'Use the "{deck}" handout for one-click controls.',
    overview: {
      heading: 'Overview',
      body: 'Hexploration covers a hex map with opaque hexes. As the party moves, the hexes they pass through (and, if you like, the hexes around them) are removed, so the map is uncovered one hex at a time. Hidden locations can be placed under hexes and are announced when found. It works in Jumpgate and Legacy games, on Hex (V) and Hex (H) grids of any size.',
      demo: 'Watch a short demo (from version 1)',
    },
    quickStart: {
      heading: 'Quick Start',
      steps: [
        'Open a page whose grid is set to Hex (V) or Hex (H).',
        'Draw one or more shapes (polygon, rectangle, ellipse or freehand) around the area to hide.',
        'Select the shapes and click Fill in the Command Deck (or type !hexploration fill). The shapes are replaced by hexes.',
        'Optional: before filling, select tokens for important places and click Mark Location. They are hidden under the hexes and announced when discovered.',
        'Move a player token. Every hex it passes through, and the hexes within its Sight Distance, are revealed.',
      ],
    },
    commands: {
      heading: 'Commands',
      intro:
        'Only GMs can use these commands. Most act on the selected objects; the rest act on the page you are viewing.',
      colCommand: 'Command',
      colDesc: 'What it does',
    },
    revealing: {
      heading: 'How Revealing Works',
      points: [
        'Only tokens on the token layer reveal hexes. Which tokens count is set by Tokens That Reveal: player tokens by default, so the GM can move monsters without uncovering the map.',
        'A token reveals every hex it covers (large tokens cover several) and, with Reveal Along Path on, every hex on the route it was dragged along, including waypoints.',
        'Sight Distance reveals the hexes around each of those hexes. With Line of Sight on, a hex is only revealed if no covered hex lies in between.',
        'Hex Reveal Distance is stored on hexes as they are drawn. Those hexes are only revealed from within that many hexes, however far a token can see. Use it for mountains or forests that hide what is behind them.',
        'In Glimpse mode, hexes within sight become see-through instead of disappearing, and are removed when a token enters them.',
        'Roll20 draws token names, bars and auras above hexes. With Hide Covered Tokens on, a token under a covered hex has its player-visible name, bars and auras switched off until it is uncovered, so hidden monsters do not give themselves away. If you switch one of them on while the token is covered, it stays hidden and is switched on when the token is uncovered.',
        'The API does not report moves made by other mods. TokenMod moves are picked up automatically; for other mods, select the tokens and click Explore, or call Hexploration.revealAround(token) from your own mod.',
      ],
    },
    locations: {
      heading: 'Named Hexes and Locations',
      points: [
        'Mark Location turns the selected tokens into hidden locations. A token already under a hex is hidden straight away; otherwise it is hidden by the next fill that covers it.',
        'Tokens with the white-tower status marker are also treated as locations when you fill, as in version 1.',
        'Hidden location tokens are moved to the GM layer. When their hex is revealed they return to the token layer with their name shown, and their discovery is announced.',
        'Name Hex gives a hex a name without a token. The name is shown to the GM as a label on the GM layer and announced when the hex is revealed.',
        'Announce Discoveries chooses whether everyone, only the GM, or nobody sees the announcement. Ping Discoveries also moves the players’ view to the location.',
      ],
    },
    settings: {
      heading: 'Settings',
      intro:
        'Change settings with !hexploration set (or the Settings button). Hex Layer, Tokens That Reveal and Language can also be set on the Mod’s settings page.',
      colKey: 'Key',
      colName: 'Setting',
      colDesc: 'Description',
      perPage: '(Can be set per page.)',
    },
    jumpgate: {
      heading: 'Jumpgate and Legacy',
      points: [
        'Hexploration works out which engine the game uses and draws the matching kind of shape. Shapes drawn in either editor can be filled.',
        'With Hex Layer set to Auto, hexes are drawn on the foreground layer, above tokens, so players cannot see what is underneath. If the foreground layer is not available, the token layer is used instead.',
        'Jumpgate draws mathematically regular hexes, which are a slightly different shape from Legacy hexes. If the hexes do not line up with a page’s grid, snap a token to a hex centre, select it and click Calibrate. Select two tokens in neighbouring hexes of the same row (Hex V) or column (Hex H) to correct the hex size too.',
        'When a page or game is copied, its hexes get new IDs. Run Rescan on the page to pick them up again, together with their name labels and location tokens.',
      ],
    },
    upgrading: {
      heading: 'Upgrading from Version 1',
      points: [
        'Version 2 no longer needs PathMath, MatrixMath, Vector Math or HTML Builder. You can remove them unless another mod uses them.',
        'Existing hex maps, names, location tokens and settings are upgraded automatically on the first start.',
        'The version 1 commands, including the Hexploration_menu macro, still work.',
        'Version 1 let any token that represented a character reveal hexes. Set Tokens That Reveal to Character tokens to keep that behaviour.',
      ],
      colV1: 'Version 1 command',
      colV2: 'Version 2 command',
    },
    troubleshooting: {
      heading: 'Troubleshooting',
      points: [
        'Nothing happens when a token moves: check the token is on the token layer and matches Tokens That Reveal, and that the page has hexes (!hexploration status).',
        'Hexes are offset from the grid: use Calibrate, then check with a token on a few hexes across the map.',
        'Hexes stopped revealing after copying a page or game: run Rescan on the page.',
        'Fill says the area has no hex centres: the shape must contain the centre of at least one hex.',
        'For anything else, check the API console log and include its messages when asking for help.',
      ],
    },
    languages: {
      heading: 'Languages',
      body: 'Choose a language with !hexploration set language. Available languages:',
      colLanguage: 'Language',
      colNative: 'Native name',
      colCode: 'Code',
    },
    credits: {
      heading: 'Credits',
      original: 'Original mod by',
      maintainer: 'Version 2 maintained by',
      marketplace: 'Ada’s art packs on the Roll20 Marketplace',
      support:
        'If you find a bug or have an idea, post in the Roll20 Mod forum or open an issue on GitHub, and include any messages from the API console log.',
    },
  },
};
