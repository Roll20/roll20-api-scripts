class DungeonMasterToolsPaladin extends RatWorkshop_Module {
  static MODULE_NAME = 'Paladin';
  static VERSION = 0.1;
  static DEFAULT_STATE = {
    version: DungeonMasterToolsPaladin.VERSION,
    gcUpdated: 0,
  };

  /** ACTIONS **/
  /**
   * Lay on Hands
   * @param options
   * @param msg
   */
  action_lay_on_hands(options, { playerid: playerId }) {
    const character = getObj("character", options[0]);
    const target = getObj("character", options[1]);
    const possessivePronoun = options[3] || 'his';

    // Validate the Character
    if (!character) {
      this.sendErrorMessage(playerId, 'Unable to find the selected character to perform **lay-on-hands**');
      return;
    }
    // Validate the Target
    if (!target) {
      this.sendErrorMessage(playerId, 'A valid target for **lay-on-hands** needs to be selected');
      return;
    }

    // Find how much healing needs done to target
    const targetHp = findObjs({ type: 'attribute', characterid: target.id, name: 'hp' })[0];
    const amountHurt = parseInt(targetHp.get('max'), 10) - parseInt(targetHp.get('current'), 10);

    // Validate the Character has Lay On Hands
    const layOnHandsTrait = this.getTrait(character.id, 'Lay on Hands');
    if (!layOnHandsTrait) {
      this.sendErrorMessage(playerId, 'The currently selected character can not perform **lay-on-hands**');
      return;
    }

    // Check how much lay-on-hands available
    const layOnHands = this.getResource(character.id, 'Lay on Hands');
    if (!layOnHands) {
      this.sendErrorMessage(playerId, 'The currently selected character is missing the Lay on Hands Resource');
      return;
    }

    // Send exhausted message
    if (layOnHands.get('current') <= 0) {
      this.sendActionMessage(
        character.get('name'),
        `**${character.get('name')}** has exhausted ${possessivePronoun} lay on hands and will need a long rest before doing any more healing.`,
      );
      return;
    }

    // set Amount to Minimum of request, available layOnHands, and amount Hurt
    const amount = Math.min(options[2] || 1, layOnHands.get('current'), amountHurt);

    // TODO -> add check for curing Disease or Poison
    if (!amount) {
      this.sendActionMessage(
        character.get('name'),
        `**${character.get('name')}** lays ${possessivePronoun} hands on **${target.get('name')}** and realizes that no healing needs done`,
      );
      return;
    }

    // Update Target's Hit Points
    targetHp.set({ current: parseInt(targetHp.get('current'), 10) + amount });

    // Update Character's Lay On Hands
    layOnHands.set({ current: layOnHands.get('current') - amount });

    // Send Action to the Chat Window
    this.sendActionMessage(
      character.get('name'),
      `**${character.get('name')}** lays ${possessivePronoun} hands on **${target.get('name')}** and heals for **${amount}**`,
    );

    // Send exhausted message
    if (layOnHands.get('current') <= 0) {
      this.sendActionMessage(
        character.get('name'),
        `**${character.get('name')}** has exhausted ${possessivePronoun} lay on hands and will need a long rest before doing any more healing.`,
      );
    }
  }

  /**
   * Initialize Configurations and update from userOptions
   */
  initialConfigurations() {
    if (!state.RatWorkShop_DungeonMasterTools_Roll20_5E.modules[DungeonMasterToolsPaladin.MODULE_NAME] ||
      !state.RatWorkShop_DungeonMasterTools_Roll20_5E.modules[DungeonMasterToolsPaladin.MODULE_NAME].version ||
      state.RatWorkShop_DungeonMasterTools_Roll20_5E.modules[DungeonMasterToolsPaladin.MODULE_NAME].version !== DungeonMasterToolsPaladin.VERSION) {
      state.RatWorkShop_DungeonMasterTools_Roll20_5E.modules[DungeonMasterToolsPaladin.MODULE_NAME] = DungeonMasterToolsPaladin.DEFAULT_STATE;
    }

    const gc = globalconfig && globalconfig.RatWorkShop_DungeonMasterTools_Roll20_5E;
    if (gc && gc.lastsaved && gc.lastsaved > state.RatWorkShop_DungeonMasterTools_Roll20_5E.modules[DungeonMasterToolsPaladin.MODULE_NAME].gcUpdated) {
      state.RatWorkShop_DungeonMasterTools_Roll20_5E.modules[DungeonMasterToolsPaladin.MODULE_NAME].gcUpdated = gc.lastsaved;
    }
  }

  constructor() {
    super();
  }
}

DungeonMasterToolsPaladin.register();
