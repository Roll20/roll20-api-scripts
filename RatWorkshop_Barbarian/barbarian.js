class DungeonMasterToolsBarbarian extends RatWorkshop_Module {
  static MODULE_NAME = 'Barbarian';
  static VERSION = 0.1;
  static DEFAULT_STATE = {
    version: DungeonMasterToolsBarbarian.VERSION,
    gcUpdated: 0,
  };

  /** END ACTIONS **/
  /**
   * Ends the Rage Action, removes rage token icon, and unchecks the rage global modifier
   * @param event
   */
  end_action_rage({ characterId }) {
    const character = getObj("character", characterId);

    // Set Rage Token Status
    const token = this.getToken(characterId);
    if (token) {
      const token_status = {};
      token_status[`status_${this.tokenIcons.rage}`] = false;
      token.set(token_status);
    }

    // Clear Global Damage Modifier
    const global_rage_damage = this.getGlobalModifier(characterId, 'Rage Damage');
    if (global_rage_damage) {
      global_rage_damage['active_flag'].set({ current: 0 });
    }

    // Send Action Message
    this.sendActionMessage(
      character.get('name'),
      `**${character.get('name')}** is no longer raging.`,
    );
  }

  /** ACTIONS **/
  /**
   * Rage
   * @param options
   * @param playerId
   */
  action_rage(options, { playerid: playerId }) {
    const character = getObj("character", options[0]);
    const possessivePronoun = options[1] || 'his';

    // Validate the Character
    if (!character) {
      this.sendErrorMessage(playerId, 'Unable to find the selected character to perform **rage**');
      return;
    }

    // Validate the Character has Rage
    const rageTrait = this.getTrait(character.id, 'Rage');
    if (!rageTrait) {
      this.sendErrorMessage(playerId, 'The currently selected character can not perform **rage**');
      return;
    }

    // Check how much rage available
    const rage = this.getResource(character.id, 'Rage');
    if (!rage) {
      this.sendErrorMessage(playerId, 'The currently selected character is missing the Rage Resource');
      return;
    }

    // Send exhausted message
    if (rage.get('current') <= 0) {
      this.sendActionMessage(
        character.get('name'),
        `**${character.get('name')}** has exhausted ${possessivePronoun} rage and will need a long rest before raging again.`,
      );
      return;
    }

    // Update Character's Rage
    rage.set({ current: rage.get('current') - 1 });

    // Toggle Rage Damage On
    const global_rage_damage = this.getGlobalModifier(character.id, 'Rage Damage');
    if (global_rage_damage) {
      global_rage_damage['active_flag'].set({ current: 1 });
    } else {
      this.sendErrorMessage(playerId, 'The currently selected character is missing the Rage Damage Modifier, you will have to activate it manually.');
    }

    // Add Turn Order
    const eventId = this.addTurnOrder({
      id: "-1",
      pr: 10,
      custom: `Rage: ${character.get('name')}`,
      formula: '-1'
    });

    // Set Rage Token Status
    const token = this.getToken(character.id);
    if (token) {
      const tokenStatus = {};
      tokenStatus[`status_${this.tokenIcons.rage}`] = true;
      token.set(tokenStatus);
    }

    // Add Event for Tracking
    this.addEvent(eventId, character.id, token.id, 'rage', DungeonMasterToolsBarbarian.MODULE_NAME, 'end_action_rage');

    // Send Action to the Chat Window
    this.sendActionMessage(
      character.get('name'),
      `**${character.get('name')}** enters a state of primal ferocity and is now raging`,
    );

    // Send exhausted message
    if (rage.get('current') <= 0) {
      this.sendActionMessage(
        character.get('name'),
        `**${character.get('name')}** has exhausted ${possessivePronoun} rage and will need a long rest before raging again.`,
      );
    }
  }

  /** SHORT REST **/

  /** LONG REST **/

  /**
   * Initialize Configurations and update from userOptions
   */
  initialConfigurations() {
    if (!state.RatWorkShop_DungeonMasterTools_Roll20_5E.modules[DungeonMasterToolsBarbarian.MODULE_NAME] ||
      !state.RatWorkShop_DungeonMasterTools_Roll20_5E.modules[DungeonMasterToolsBarbarian.MODULE_NAME].version ||
      state.RatWorkShop_DungeonMasterTools_Roll20_5E.modules[DungeonMasterToolsBarbarian.MODULE_NAME].version !== DungeonMasterToolsBarbarian.VERSION) {
      state.RatWorkShop_DungeonMasterTools_Roll20_5E.modules[DungeonMasterToolsBarbarian.MODULE_NAME] = DungeonMasterToolsBarbarian.DEFAULT_STATE;
      state.RatWorkShop_DungeonMasterTools_Roll20_5E.tokenIcons['rage'] = 'strong';
    }

    const gc = globalconfig && globalconfig.RatWorkShop_DungeonMasterTools_Roll20_5E;
    if (gc && gc.lastsaved && gc.lastsaved > state.RatWorkShop_DungeonMasterTools_Roll20_5E.modules[DungeonMasterToolsBarbarian.MODULE_NAME].gcUpdated) {
      state.RatWorkShop_DungeonMasterTools_Roll20_5E.modules[DungeonMasterToolsBarbarian.MODULE_NAME].gcUpdated = gc.lastsaved;
      if ('tokenIcon-rage' in gc) {
        state.RatWorkShop_DungeonMasterTools_Roll20_5E.tokenIcons['rage'] = gc['tokenIcon-rage'];
      }
    }
  }

  constructor() {
    super();
  }
}

DungeonMasterToolsBarbarian.register();
