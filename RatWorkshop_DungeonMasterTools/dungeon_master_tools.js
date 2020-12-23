/*
 * Version 0.1
 * Made By Patrick Kolenic
 * Roll20: https://app.roll20.net/users/5259711/articblast
 * Patreon: https://www.patreon.com/ratworkshop
 * Github: https://github.com/pkolenic/roll20-api-scripts
 */
/**
 * Utility Functions
 */
class RatWorkshop_Library {
  constructor() {
  }

  /**
   * Converts String to Snake Case, underscore instead of - or space
   * @param string
   * @return {void | string}
   */
  static snakeCase(string) {
    let converted = string.replace(/-/g, '_');
    converted = converted.replace(/ /g, '_');
    return converted
  }

  /**
   * Generates a Universally Unique ID
   * @return {string}
   */
  static generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

/**
 * Contains Core Methods for sending messages to chat, as well as fetching data from a character sheet
 */
class RatWorkshop_Module {
  static MODULE_NAME = 'Base Module';
  MSG_CONTENT = '###CONTENT###';
  MSG_SOURCE = 'RatWorkshop';
  MSG_OPTIONS = {
    NO_ARCHIVE: { noarchive: true },
  };
  MSG_TYPE = {
    STATUS: '/w gm ',
  };
  MSG_TEMPLATES = {
    DESC: `<div class="sheet-rolltemplate-desc" style="margin-left: -30px;"><div class="sheet-desc" style="background-size: 100% 100%; line-height: 2em;"><div class="sheet-label" style="margin-top:5px; padding: 0 15px 0 5px;">${this.MSG_CONTENT}</div></div></div>`,
    ERROR: `<div style="background: #FFD2AD; border-radius: 3px; border: 1px solid #D1D1D1; margin: 0 -5px 0 -45px;"><div style="margin: 5px 5px 5px 45px;">${this.MSG_CONTENT}</div></div>`
  };

  /**
   * Renders the Template, replacing the CONTENT Placeholder with the message and attaching the prefix
   * @param template
   * @param message
   * @param prefix
   * @return {string}
   */
  render_template(template, message, prefix = '') {
    const body = template.replace(this.MSG_CONTENT, message);
    return `${prefix}${body}`;
  }

  /**
   * Dispatches a Message to a player's chat window
   * @param who
   * @param message
   * @param template
   * @param prefix
   * @param options
   * @param callback
   */
  sendMessage(who, message, template, prefix = '', options = {}, callback = null) {
    sendChat(who, this.render_template(template, message, prefix), callback, options);
  }

  /**
   * Outputs an Error Message to the player
   * @param playerId
   * @param message
   */
  sendErrorMessage(playerId, message) {
    const player = getObj("player", playerId);
    if (player) {
      this.sendMessage(
        this.MSG_SOURCE,
        message,
        this.MSG_TEMPLATES.ERROR,
        `/w ${player.get('displayname')} `,
        this.MSG_OPTIONS.NO_ARCHIVE,
      )
    }
  }

  /**
   * Outputs an Action message to all players
   * @param character
   * @param message
   */
  sendActionMessage(character, message) {
    this.sendMessage(character, message, this.MSG_TEMPLATES.DESC);
  }

  /**
   * Adds an Event to the turn order after the current Turn
   * @param event
   */
  addTurnOrder(event) {
    event.eventId = RatWorkshop_Library.generateUUID();
    const turnOrder = JSON.parse(Campaign().get('turnorder') || '[]');
    // Either put the event after the current Turn or push it onto the empty array
    if (turnOrder.length) {
      turnOrder.splice(1, 0, event);
    } else {
      turnOrder.push(event);
    }
    Campaign().set('turnorder', JSON.stringify(turnOrder));
    return event.eventId;
  }

  /**
   * Adds an event for tracking
   * @param eventId
   * @param characterId
   * @param tokenId
   * @param action
   * @param callbackModule
   * @param callbackAction
   */
  addEvent(eventId, characterId, tokenId, action, callbackModule, callbackAction) {
    this.events.push({
      eventId,
      characterId,
      tokenId,
      action,
      callbackModule,
      callbackAction,
    });
  }

  /**
   * Attempts to return the first matching trait
   * @param characterId
   * @param trait
   * @return {null|{name: *, options_flag: *, description: *, display_flag: *, source_type: *, source: *}}
   */
  getTrait(characterId, trait) {
    const traits = filterObjs((obj) => {
      if (obj.get('type') !== 'attribute') return false;
      if (obj.get('characterid') !== characterId) return false;
      if (!obj.get('name').startsWith('repeating_traits') || !obj.get('name').endsWith('name')) return false;
      return obj.get('current').toLowerCase() === trait.toLowerCase();
    });
    // Trait not Found
    if (!traits.length) {
      return null;
    }
    // Get the Base name for the first found trait and return object with all trait attributes
    const traitName = traits[0].get('name').replace('_name', '');
    return {
      name: traits[0].get('current'),
      description: getAttrByName(characterId, `${traitName}_description`),
      source: getAttrByName(characterId, `${traitName}_source`),
      source_type: getAttrByName(characterId, `${traitName}_source_type`),
      options_flag: getAttrByName(characterId, `${traitName}_options-flag`),
      display_flag: getAttrByName(characterId, `${traitName}_display_flag`),
    };
  }

  /**
   * Attempts to return the first matching resource
   * @param characterId
   * @param resource
   * @return {null|{current: *, max: *}}
   */
  getResource(characterId, resource) {
    const resourceNames = filterObjs((obj) => {
      if (obj.get('type') !== 'attribute') return false;
      if (obj.get('characterid') !== characterId) return false;
      if (!obj.get('name').endsWith('_name')) return false;
      return /.*_resource_.*/.test(obj.get('name')) && obj.get('current').toLowerCase() === resource.toLowerCase();
    });
    // Resource not Found
    if (!resourceNames.length) {
      return null;
    }
    // Return the first resource
    const resourceName = resourceNames[0].get('name').replace('_name', '');
    return findObjs({ type: 'attribute', characterid: characterId, name: resourceName }, { caseInsensitive: true })[0];
  }

  /**
   * Attempts to return the first matching Global Modifier
   * @param characterId
   * @param modifier
   * @return {null}
   */
  getGlobalModifier(characterId, modifier) {
    const modifierNames = filterObjs((obj) => {
      if (obj.get('type') !== 'attribute') return false;
      if (obj.get('characterid') !== characterId) return false;
      if (!obj.get('name').startsWith('repeating_damagemod') || !obj.get('name').endsWith('name')) return false;
      return obj.get('current').toLowerCase() === modifier.toLowerCase();
    });
    // Modifier not Found
    if (!modifierNames.length) {
      return null;
    }
    // Get the Base name for the first found modifier and then fetch all attributes with that name
    const modifierName = modifierNames[0].get('name').replace('global_damage_name', '');
    const modifiers = filterObjs((obj) => {
      if (obj.get('type') !== 'attribute') return false;
      if (obj.get('characterid') !== characterId) return false;
      return obj.get('name').startsWith(modifierName);
    });
    //  Return object with all the related attributes
    const response = {};
    _.each(modifiers, (attribute) => {
      const key = attribute.get('name').replace(modifierName, '').replace('global_damage_', '');
      response[key] = attribute;
    });
    return response;
  }

  /**
   * Attempts to return the Character's token on the active page
   * @param characterId
   * @return {*}
   */
  getToken(characterId) {
    const pageId = Campaign().get('playerpageid');
    const tokens = findObjs({ type: 'graphic', represents: characterId, _pageid: pageId });
    return tokens[0] || null;
  }

  /**
   * Registers the Module with the Dungeon Master Tools
   */
  static register() {
    if (this.MODULE_NAME === RatWorkshop_Module.MODULE_NAME) {
      log('Base RatWorkshop Module can not be registers, extend it first');
      return;
    }

    if (typeof dungeonMasterTools === 'object') {
      log(`Registering ${this.MODULE_NAME} Module`);
      dungeonMasterTools.registerModule(this);
    }
  }

  /**
   * Used to update State based on One-Click useroptions
   */
  initialConfigurations() {
    // Override in SubClasses
  }

  constructor() {
    this.initialConfigurations();
    // Quick Reference to the Stored States
    this.configState = state.RatWorkShop_DungeonMasterTools_Roll20_5E.config || {};
    this.tokenTrack = state.RatWorkShop_DungeonMasterTools_Roll20_5E.tokenTrack || {};
    this.tokenIcons = state.RatWorkShop_DungeonMasterTools_Roll20_5E.tokenIcons || {};
    this.tokenBars = state.RatWorkShop_DungeonMasterTools_Roll20_5E.tokenBars || {};
    this.events = state.RatWorkShop_DungeonMasterTools_Roll20_5E.events || [];
  }
}

/**
 * Handles Loading Configurations, Setting up Listeners, Registering Class Modules, Dispatching Actions, and Awarding XP
 */
class DungeonMasterTools extends RatWorkshop_Module {
  static VERSION = 0.1;
  static DEFAULT_STATE = {
    config: {
      'purge-turn-order': 'on',
    },
    tokenTrack: {
      dead: 'on',
    },
    tokenIcons: {
      dead: 'dead',
    },
    tokenBars: {
      hp: 'bar1',
      ac: 'bar2',
    },
    modules: {},
    events: [],
    gcUpdated: 0,
    version: DungeonMasterTools.VERSION,
  };

  COMMANDS = {
    // SET STATE COMMANDS
    'dm-award-xp': (options, msg) => this.awardXp(options, msg),
    'dm-award-selected-xp': (options, msg) => this.awardSelectedXp(options, msg),
    'dm-action': (options, msg) => this.handleAction(options, msg),
    'dm-config': (options, msg) => this.setConfigOption(options, msg),
    'dm-token-tracking': (options, msg) => this.setTokenTracking(options, msg),
    // UTILITY COMMANDS
    'dm-help': (options, msg) => log('help called'),
    'dm-status': (options, msg) => this.outputStatus(msg),
    'dm-reset': (options, msg) => this.resetState(msg),
  };

  VALID_CONFIGS = [
    'purge-turn-order',
  ];

  TOKEN_TRACKED_STATUS = [
    'dead',
  ];

  /**
   * Dungeon Master Tools shouldn't register itself
   */
  static register() {}

  /**
   * Update Config with Values from globalConfig
   * @param config
   * @param globalConfig
   * @param prefix
   */
  updateConfiguration(config, globalConfig, prefix = '') {
    Object.keys(config || {}).forEach((key) => {
      if (`${prefix}${key}` in globalConfig) {
        config[key] = globalConfig[`${prefix}${key}`];
      }
    });
  }

  /**
   * Initialize Configurations and update from userOptions
   */
  initialConfigurations() {
    // For Storing State information
    if (!state.RatWorkShop_DungeonMasterTools_Roll20_5E ||
      !state.RatWorkShop_DungeonMasterTools_Roll20_5E.version ||
      state.RatWorkShop_DungeonMasterTools_Roll20_5E.version !== DungeonMasterTools.VERSION) {
      state.RatWorkShop_DungeonMasterTools_Roll20_5E = DungeonMasterTools.DEFAULT_STATE;
    }

    const gc = globalconfig && globalconfig.RatWorkShop_DungeonMasterTools_Roll20_5E;
    if (gc && gc.lastsaved && gc.lastsaved > state.RatWorkShop_DungeonMasterTools_Roll20_5E.gcUpdated) {
      state.RatWorkShop_DungeonMasterTools_Roll20_5E.gcUpdated = gc.lastsaved;
      this.updateConfiguration(state.RatWorkShop_DungeonMasterTools_Roll20_5E.config, gc);
      this.updateConfiguration(state.RatWorkShop_DungeonMasterTools_Roll20_5E.tokenTrack, gc, 'tokenTrack-');
      this.updateConfiguration(state.RatWorkShop_DungeonMasterTools_Roll20_5E.tokenIcons, gc, 'tokenIcon-');
      this.updateConfiguration(state.RatWorkShop_DungeonMasterTools_Roll20_5E.tokenBars, gc, 'tokenBar-');
    }
  }

  constructor() {
    super();
    // Object to store registered modules
    this.modules = {};

    // Setup Listener for API messages
    on("chat:message", (msg) => {
      // HANDLE API Commands
      if (msg.type === 'api' && !msg.rolltemplate) {
        const params = msg.content.substring(1).split(" ");
        const command = params[0].toLowerCase() || '';
        const options = params.slice(1);

        // Only handle valid commands
        if (Object.keys(this.COMMANDS).includes(command)) {
          this.COMMANDS[command](options, msg);
        }
      }
    });

    // Register Listener for Changes to the Campaign
    on("change:campaign", campaign => {
      this.handleCampaignChange();
    });

    // Register Listener for Token Changes
    on("change:graphic", token => {
      const pageId = Campaign().get('playerpageid');
      // Only listen for changes on the current page - @TODO might change in case players are on multiple pages
      if (token.get('_pageid') === pageId) {
        this.handleTokenChange(token);
      }
    });

    log('Dungeon Master Tools Initialized!');
  }

  /**
   * Logic applied when a token has changed
   * @param token
   */
  handleTokenChange(token) {
    if (this.tokenTrack.dead === 'on') {
      const token_bar = this.tokenBars.hp;
      if (!token_bar || token.get(`${token_bar}_max`) === "") {
        return;
      }
      const token_status = {};
      token_status[`status_${this.tokenIcons.dead}`] = token.get(`${token_bar}_value`) <= 0;
      token.set(token_status);
    }

    // Check if Token no longer has a tracked status
    const events = this.events.filter(x => x.tokenId === token.id);
    const currentState = token.get('statusmarkers').split(',');
    _.each(events, event => {
      if (!currentState.includes(this.tokenIcons[event.action])) {
        this.dispatchAction(event.callbackModule.toLowerCase(), event.callbackAction, event);
        // Remove the Event
        const index = this.events.findIndex((element) => {
          return element.tokenId === event.tokenId && element.action === event.action
        });
        this.events.splice(index, 1);
        // Remove the Turn Order
        const turnOrder = JSON.parse(Campaign().get('turnorder') || '[]');
        const turnOrderIndex = turnOrder.findIndex(element => element.eventId === event.eventId);
        turnOrder.splice(turnOrderIndex, 1);
        Campaign().set('turnorder', JSON.stringify(turnOrder));
      }
    });
  }

  /**
   * Logic applied when the Global Campaign Object changes value
   */
  handleCampaignChange() {
    // Remove all Turn Orders that have Expired, i.e. are less than or equal to 0
    if (this.configState['purge-turn-order'] === 'on') {
      const turnOrder = JSON.parse(Campaign().get('turnorder') || '[]');

      const updatedTurnOrder = turnOrder.filter(event => parseInt(event.pr, 10) >= 0);
      Campaign().set('turnorder', JSON.stringify(updatedTurnOrder));

      // Check if removed turn orders have callback functions
      const expiredEvents = turnOrder.filter(x => !updatedTurnOrder.includes(x));
      _.each(expiredEvents, turnEvent => {
        const event = this.events.filter(x => x.eventId === turnEvent.eventId)[0] || null;
        if (event) {
          this.dispatchAction(event.callbackModule.toLowerCase(), event.callbackAction, event);
          // Remove the Event
          const index = this.events.findIndex((element) => element.eventId === event.eventId);
          this.events.splice(index, 1);
        }
      });
    }
  }

  /**
   * Triggers the action to fire
   * @param moduleName
   * @param action
   * @param options
   * @param msg
   */
  dispatchAction(moduleName, action, options, msg = null) {
    const moduleNames = Object.keys(this.modules);
    if (moduleNames.includes(moduleName)) {
      const module = this.modules[moduleName];
      if (typeof module[action] === 'function') {
        module[action](options, msg);
      }
    }
  }

  /**
   * Dispatches action to module to handle
   * @param options
   * @param msg
   */
  handleAction(options, msg) {
    const moduleName = options[0].toLowerCase() || '';
    const action = `action_${RatWorkshop_Library.snakeCase(options[1])}` || '';
    const actionOptions = options.slice(2);
    this.dispatchAction(moduleName, action, actionOptions, msg);
  }

  /**
   * Sets Configuration options
   * @param options
   * @param playerId
   */
  setConfigOption(options, { playerid: playerId }) {
    // Bail if no config specified or player is not GM
    if (!options.length || !playerIsGM(playerId)) {
      return;
    }

    const configOption = options[0].toLowerCase();
    const status = options[1] || 'off';
    // Only deal with valid Configuration Options
    if (this.VALID_CONFIGS.includes(configOption)) {
      // Only valid states are 'on' and 'off'
      this.configState[configOption] = status === 'off' ? 'off' : 'on';
      this.sendStateStatus(configOption, this.configState[configOption]);
    }
  }

  /**
   * Sets whether to track token status
   * @param options
   * @param playerId
   */
  setTokenTracking(options, { playerid: playerId }) {
    // Bail if no token tracking specified or player is not GM
    if (!options.length || !playerIsGM(playerId)) {
      return;
    }

    const token = options[0].toLowerCase();
    const status = options[1] ? options[1].toLowerCase() : false;

    // Only deal with valid Token Tracked Statues
    if (this.TOKEN_TRACKED_STATUS.includes(token)) {
      // Only valid states are 'on' and 'off'
      if (status && (status === "on" || status === "off")) {
        this.tokenTrack[token] = status;
      }
      this.sendStateStatus(`token tracking => ${token}`, this.tokenTrack[token]);
    }
  }

  /**
   * Resets the Settings back to their default values
   * @param playerId
   */
  resetState({ playerid: playerId }) {
    // Bail if player is not GM
    if (!playerIsGM(playerId)) {
      return;
    }
    // Reset State to default
    state.RatWorkShop_DungeonMasterTools_Roll20_5E = DungeonMasterTools.DEFAULT_STATE;
    this.outputStatus({ playerid: playerId });
  }

  /**
   * Outputs a State Change status to player
   * @param command
   * @param state
   */
  sendStateStatus(command, state) {
    this.sendMessage(
      this.MSG_SOURCE,
      `<span style='display:block;'>${command}: ${state}</span>`,
      this.MSG_TEMPLATES.DESC,
      this.MSG_TYPE.STATUS,
      this.MSG_OPTIONS.NO_ARCHIVE,
    );
  }

  /**
   * Builds out the status array for the given state list
   * @param list
   * @param title
   * @return {[string]}
   */
  buildStatusOutput(list, title) {
    const status = [
      `<span style="display: block; margin: 2px 10px; text-align: left;">${title}</span>`,
    ];
    _.each(list, (value, key) => {
      status.push(`<span style='display: block; margin: 2px 0 2px 20px; text-align: left'>${key}: ${value}</span>`);
    });
    status.push('<br>');
    return status;
  }

  /**
   * Outputs the current status of the tracker
   * @param playerId
   */
  outputStatus({ playerid: playerId }) {
    // Bail if player is not GM
    if (!playerIsGM(playerId)) {
      return;
    }

    const status = [
      "<span style='display: block; padding: 5px 0; border-bottom: 2px solid black; width: 80%; margin: 0 auto 5px;'>STATUS</span>",
    ];
    // Configuration
    const config = this.buildStatusOutput(this.configState, 'CONFIGURATIONS');
    // Token Tracking
    const token = this.buildStatusOutput(this.tokenTrack, 'TOKEN TRACKING');
    // Token Icon
    const icons = this.buildStatusOutput(this.tokenIcons, 'TOKEN ICONS');
    // Token Bar
    const bars = this.buildStatusOutput(this.tokenBars, 'TOKEN BARS');
    // Dispatch Message
    this.sendMessage(
      this.MSG_SOURCE,
      status.concat(config, token, icons, bars).join(''),
      this.MSG_TEMPLATES.DESC,
      this.MSG_TYPE.STATUS,
      this.MSG_OPTIONS.NO_ARCHIVE,
    );
  }

  /**
   * Register a new Module with the Dungeon Master Tools
   * @param module - the new module to register
   * @param force - to force a new module even if the module would override existing actions
   */
  registerModule(module, force = false) {
    // Only register if it is not already registered
    if (!this.modules[module.MODULE_NAME.toLowerCase()] || force) {
      this.modules[module.MODULE_NAME.toLowerCase()] = new module();
      log(`${module.MODULE_NAME} has been registered`);
    }
  }

  /**
   * Looks up the Character for the Token and awards it XP
   * @param token
   * @param amount
   * @return {boolean} - whether the xp was awarded or not
   */
  awardCharacterXP(token, amount) {
    if (token) {
      const characterId = token.get('represents');
      const character = getObj("character", characterId);
      // Only attempt to assign xp to a Character
      if (character) {
        const traits = filterObjs((obj) => {
          if (obj.get('type') !== 'attribute') return false;
          if (obj.get('characterid') !== characterId) return false;
          if (obj.get('name') === 'experience') return true;
        });
        if (traits.length) {
          const xp = traits[0];
          const currentXp = parseInt(xp.get('current'), 10);
          xp.set({ current: `${currentXp + amount}` });
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Awards XP To players' characters that are currently in the turn order
   * @param options
   * @param msg
   */
  awardXp(options, msg) {
    // Get Each Player
    const turnOrder = JSON.parse(Campaign().get('turnorder') || '[]');
    const amount = parseInt(options[0], 10);
    const message = options.slice(1).join(' ').replace('###XP###', amount);
    let awarded = false;
    _.each(turnOrder, turn => {
      awarded |= this.awardCharacterXP(getObj('graphic', turn.id), amount)
    });
    if (awarded) {
      this.sendActionMessage('Dungeon Master', message);
    }
  }

  /**
   * Awards XP To the selected players
   * @param options
   * @param msg
   */
  awardSelectedXp(options, msg) {
    const amount = parseInt(options[0], 10);
    const message = options.slice(1).join(' ').replace('###XP###', amount);
    let awarded = false;
    _.each(msg.selected, sel => {
      awarded |= this.awardCharacterXP(getObj('graphic', sel._id), amount)
    });
    if (awarded) {
      this.sendActionMessage('Dungeon Master', message);
    }
  }
}

// Initialize
dungeonMasterTools = new DungeonMasterTools();
