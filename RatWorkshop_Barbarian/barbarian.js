class DungeonMasterToolsBarbarian extends RatWorkshop_Module {
  static MODULE_NAME = 'Barbarian';
  static VERSION = 0.2;
  static DEFAULT_STATE = {
    tokenIcons: {
      rage: 'strong',
    },
    version: DungeonMasterToolsBarbarian.VERSION,
    gcUpdated: 0,
  };

  /** UTILITIES **/
  _updateAttackRolls(character, globalDamageModRoll) {
    const attackRolls = this.getAttackRolls(character.id);

    _.each(attackRolls, (attackRoll) => {
      attackRoll.set({ current: attackRoll.get('current').replace(/{{globaldamage=\[.*]}}/, `{{globaldamage=[[${globalDamageModRoll || 0}]]}}`) });
    });
  }

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

    // Clear Rage Global Damage Modifier
    const globalRageDamage = this.getGlobalModifier(characterId, 'Rage Damage');
    if (globalRageDamage) {
      globalRageDamage['active_flag'].set({ current: '0' });
    }

    // Clear Rage from Global Damage Modifier
    const globalDamage = this.getGlobalDamageModifier(character.id);
    if (globalDamage) {
      const damageRolls = _.filter(globalDamage['roll'].get('current').split('+'), roll => roll !== '2[Rage Damage]');
      globalDamage['roll'].set({ current: damageRolls.join('+') });
      const damageTypes = _.filter(globalDamage['type'].get('current').split('/'), type => type !== 'Rage');
      globalDamage['type'].set({ current: damageTypes.join('/') });
    }

    // Clear Rage from Weapon Macros
    this._updateAttackRolls(character, globalDamage['roll'].get('current'));

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
    const globalRageDamage = this.getGlobalDamage(character.id, 'Rage');
    if (globalRageDamage) {
      globalRageDamage['active_flag'].set({ current: '1' });
    } else {
      this.sendErrorMessage(playerId, 'The currently selected character is missing the Rage Damage Modifier, you will have to activate it manually.');
    }

    // Add Rage to Global Damage Modifier
    const globalDamage = this.getGlobalDamageModifier(character.id);
    if (globalDamage) {
      const damageRolls = _.filter(globalDamage['roll'].get('current').split('+'), roll => roll.trim());
      damageRolls.push('2[Rage Damage]');
      globalDamage['roll'].set({ current: damageRolls.join('+') });

      const damageTypes = _.filter(globalDamage['type'].get('current').split('/'), type => type.trim());
      damageTypes.push('Rage');
      globalDamage['type'].set({ current: damageTypes.join('/') });
    }

    // Add Rage to Weapon Macros
    this._updateAttackRolls(character, globalDamage['roll'].get('current'));

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
      // Sync Settings to Latest Settings
      Object.entries(DungeonMasterToolsBarbarian.DEFAULT_STATE).forEach(([key, options]) => {
        if (!['version', 'gcUpdated', 'events', 'modules'].includes(key)) {
          const settings = Object.assign(state.RatWorkShop_DungeonMasterTools_Roll20_5E[key]);

          // Merge New Default Settings over old settings
          state.RatWorkShop_DungeonMasterTools_Roll20_5E[key] = { ...state.RatWorkShop_DungeonMasterTools_Roll20_5E[key], ...options };

          // Now Merge back any custom changes
          state.RatWorkShop_DungeonMasterTools_Roll20_5E[key] = { ...state.RatWorkShop_DungeonMasterTools_Roll20_5E[key], ...settings };
        }
      });
      state.RatWorkShop_DungeonMasterTools_Roll20_5E.modules[DungeonMasterToolsBarbarian.MODULE_NAME].version = DungeonMasterToolsBarbarian.VERSION;
    }

    const gc = globalconfig && globalconfig.RatWorkShop_DungeonMasterTools_Roll20_5E;
    if (gc && gc.lastsaved && gc.lastsaved > state.RatWorkShop_DungeonMasterTools_Roll20_5E.modules[DungeonMasterToolsBarbarian.MODULE_NAME].gcUpdated) {
      log('  > Updating from Global Config <  ['+(new Date(g.lastsaved*1000))+']');

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
