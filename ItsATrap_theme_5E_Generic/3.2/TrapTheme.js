(() => {
  'use strict';

  // The name used by this script to send alerts to the GM in the chat.
  const CHAT_NAME = '5E-Generic';

  const SHEET_ATTRS = {
    roll20: { // Used to be called 'ogl'
      ac: 'ac',
      strSaveModifier: 'strength_save_bonus',
      dexSaveModifier: 'dexterity_save_bonus',
      conSaveModifier: 'constitution_save_bonus',
      intSaveModifier: 'intelligence_save_bonus',
      wisSaveModifier: 'wisdom_save_bonus',
      chaSaveModifier: 'charisma_save_bonus',
      perceptionModifier: 'perception_bonus',
      passivePerception: 'passive_wisdom'
    },
    ogl: { // ogl is kept only for backwards compatibility.
      ac: 'ac',
      strSaveModifier: 'strength_save_bonus',
      dexSaveModifier: 'dexterity_save_bonus',
      conSaveModifier: 'constitution_save_bonus',
      intSaveModifier: 'intelligence_save_bonus',
      wisSaveModifier: 'wisdom_save_bonus',
      chaSaveModifier: 'charisma_save_bonus',
      perceptionModifier: 'perception_bonus',
      passivePerception: 'passive_wisdom'
    },
    community: {
      ac: 'AC_calc',
      strSaveModifier: 'strength_save_mod',
      dexSaveModifier: 'dexterity_save_mod',
      conSaveModifier: 'constitution_save_mod',
      intSaveModifier: 'intelligence_save_mod',
      wisSaveModifier: 'wisdom_save_mod',
      chaSaveModifier: 'charisma_save_mod',
      perceptionModifier: 'perception',
      passivePerception: 'passive_perception'
    },
    shaped: {
      ac: 'AC',
      strSaveModifier: 'strength_saving_throw_mod_with_sign',
      dexSaveModifier: 'dexterity_saving_throw_mod_with_sign',
      conSaveModifier: 'constitution_saving_throw_mod_with_sign',
      intSaveModifier: 'intelligence_saving_throw_mod_with_sign',
      wisSaveModifier: 'wisdom_saving_throw_mod_with_sign',
      chaSaveModifier: 'charisma_saving_throw_mod_with_sign',
      perceptionModifier: 'skill/name/perception/total_with_sign',
      passivePerception: 'skill/name/perception/passive'
    },
    custom: {}
  };

  /**
   * Get the state for this script, creating it for the first time if
   * necessary.
   * @return The state.
   */
  function getState() {
    if (!state.TrapTheme5EGeneric)
      state.TrapTheme5EGeneric = {
        sheet: undefined
      };
    return state.TrapTheme5EGeneric;
  }

  // Register the theme with ItsATrap.
  on('ready', () => {
    /**
     * A generic D&D 5E trap theme
     * @implements ItsATrap#D20TrapTheme
     */
    class TrapTheme5EGeneric extends D20TrapTheme {
      /**
       * @inheritdoc
       */
      get name() {
        return '5E-Generic';
      }

      /**
       * @inheritdoc
       */
      getAC(character) {
        let sheet = this.getSheet();
        sheet = SHEET_ATTRS[sheet];

        let attrName = sheet.ac;
        if(attrName)
          return CharSheetUtils.getSheetAttr(character, attrName);
        else
          return Promise.reject(new Error('Could not resolve AC attribute.'));
      }

      /**
       * @inheritdoc
       */
      getPassivePerception(character) {
        let sheet = this.getSheet();
        sheet = SHEET_ATTRS[sheet];

        let attrName = sheet.passivePerception;
        if(attrName)
          return CharSheetUtils.getSheetAttr(character, attrName);
        else {
          attrName = sheet.perceptionModifier;
          if(attrName)
            return CharSheetUtils.getSheetAttr(character, attrName)
            .then(value => {
              return value + 10;
            });
          else
            return Promise.reject(new Error('Could not resolve passive perception attribute.'));
        }
      }

      /**
       * @inheritdoc
       */
      getSaveBonus(character, saveName) {
        let sheet = this.getSheet();
        sheet = SHEET_ATTRS[sheet];

        let key = saveName + 'SaveModifier';
        let attrName = sheet[key];
        if(attrName)
          return CharSheetUtils.getSheetAttr(character, attrName);
        else
          return Promise.reject('Please provide name of the attribute for ' +
            saveName + ' save modifier in the One-Click options.');
      }

      /**
       * Get the name of the character sheet being used, either by
       * auto-detecting it, or having it set manually.
       * @return The character sheet name.
       */
      getSheet() {
        let name = getState().sheet;
        if (name) {
          // If we're using a custom sheet, update the cached attributes from
          // the state.
          if (name === 'custom') {
            if (!getState().customAttrs)
              getState().customAttrs = {};
            SHEET_ATTRS.custom = getState().customAttrs;
          }
          return name;
        }
        else {
          if (!this._cachedSheet) {
            if (this._getSheetTryRoll20())
              this._cachedSheet = 'roll20';
            else if (this._getSheetTryCommunity())
              this._cachedSheet = 'community';
            else if (this._getSheetTryShaped())
              this._cachedSheet = 'shaped';
            else
              return undefined;

            log("D&D 5E trap theme - auto-detected character sheet: " +
              this._cachedSheet);
          }
          return this._cachedSheet;
        }
      }

      /**
       * Try to auto-detect the Roll20 sheet.
       */
      _getSheetTryRoll20() {
        let result = findObjs({
          _type: 'attribute',
          name: 'appliedUpdates'
        })[0];
        return !!result;
      }

      /**
       * Try to auto-detect the Community sheet.
       */
      _getSheetTryCommunity() {
        let result = findObjs({
            _type: 'attribute',
            name: 'strength_save_prof'
          })[0] ||
          findObjs({
            _type: 'attribute',
            name: 'dexterity_save_prof'
          })[0] ||
          findObjs({
            _type: 'attribute',
            name: 'constitution_save_prof'
          })[0] ||
          findObjs({
            _type: 'attribute',
            name: 'intelligence_save_prof'
          })[0] ||
          findObjs({
            _type: 'attribute',
            name: 'wisdom_save_prof'
          })[0] ||
          findObjs({
            _type: 'attribute',
            name: 'charisma_save_prof'
          })[0];
        return !!result;
      }

      _getSheetTryShaped() {
        let result = _.find(findObjs({
          _type: 'attribute',
          name: 'character_sheet'
        }), attr => {
          return attr.get('current').startsWith('Shaped');
        });
        return !!result;
      }

      /**
       * @inheritdoc
       */
      getThemeProperties(trapToken) {
        let result = super.getThemeProperties(trapToken);
        let trapEffect = (new TrapEffect(trapToken)).json;

        // Prepend an option for specifying the character sheet.
        result.unshift({
          id: 'sheet',
          name: 'Character Sheet',
          desc: 'Specify the character sheet used in your game.',
          value: (() => {
            let sheet = getState().sheet;
            if (sheet)
              return sheet;
            else {
              sheet = this.getSheet();
              if (!sheet) {
                setTimeout(() => {
                  ItsATrap.Chat.whisperGM('Could not auto-detect D&D 5E character sheet ' +
                    'for your game. Please set it manually from the trap properties ' +
                    'menu under Theme-Specific Properties.');
                }, 100);
                return 'auto-detect';
              }
              return `${sheet}<br/>(auto-detected)`;
            }
          })(),
          options: ['Auto-detect', 'roll20', 'community', 'shaped', 'custom']
        });

        // If the user is using a custom sheet or just bare-bones attributes,
        // display another property to specify the attribute names.
        if (this.getSheet() === 'custom') {
          result.splice(1, 0, {
            id: 'customAttrs',
            name: 'Custom Sheet Attrs',
            desc: (() => {
              let attrKeys = _.keys(SHEET_ATTRS.custom);
              if (_.size(attrKeys) === 0)
                return 'Custom attributes not specified!';
              else {
                attrKeys.sort();
                let result = '';
                _.each(attrKeys, key => {
                  let value = SHEET_ATTRS.custom[key];
                  result += `${key}: ${value}<br/>`;
                })
                return result;
              }
            })(),
            value: 'Mouse-over to view current settings.',
            properties: [
              {
                id: 'ac',
                name: 'Armor Class',
                desc: 'Specify attribute name for Armor Class.'
              },
              {
                id: 'strSaveModifier',
                name: 'Strength Save',
                desc: 'Specify attribute name for Strength saving throw modifier.'
              },
              {
                id: 'dexSaveModifier',
                name: 'Dexterity Save',
                desc: 'Specify attribute name for Dexterity saving throw modifier.'
              },
              {
                id: 'conSaveModifier',
                name: 'Constitution Save',
                desc: 'Specify attribute name for Constitution saving throw modifier.'
              },
              {
                id: 'intSaveModifier',
                name: 'Intelligence Save',
                desc: 'Specify attribute name for Intelligence saving throw modifier.'
              },
              {
                id: 'wisSaveModifier',
                name: 'Wisdom Save',
                desc: 'Specify attribute name for Wisdom saving throw modifier.'
              },
              {
                id: 'chaSaveModifier',
                name: 'Charisma Save',
                desc: 'Specify attribute name for Charisma saving throw modifier.'
              },
              {
                id: 'perceptionModifier',
                name: 'Perception',
                desc: 'Specify attribute name for Perception skill modifier.'
              },
              {
                id: 'passivePerception',
                name: 'Passive Perception',
                desc: 'Specify attribute name for Passive Perception.'
              }
            ]
          });
        }

        return result;
      }

      /**
       * @inheritdoc
       */
      modifyTrapProperty(trapToken, argv) {
        super.modifyTrapProperty(trapToken, argv);
        let trapEffect = (new TrapEffect(trapToken)).json;

        let prop = argv[0];
        let params = argv.slice(1);

        if (prop === 'sheet') {
          if (params[0] === 'Auto-detect')
            getState().sheet = undefined;
          else
            getState().sheet = params[0];
        }

        if (prop === 'customAttrs') {
          SHEET_ATTRS.custom = getState().customAttrs = {
            ac: params[0],
            strSaveModifier: params[1],
            dexSaveModifier: params[2],
            conSaveModifier: params[3],
            intSaveModifier: params[4],
            wisSaveModifier: params[5],
            chaSaveModifier: params[6],
            perceptionModifier: params[7],
            passivePerception: params[8]
          };
        }

        trapToken.set('gmnotes', JSON.stringify(trapEffect));
      }
    }

    // Register the trap theme and try to auto-detect the sheet being used.
    let themeInst = new TrapTheme5EGeneric();
    ItsATrap.registerTheme(themeInst);
    themeInst.getSheet();

    // Notify user about updates.
    if (!getState().version) {
      getState().version = '3.2';
      sendChat("It's A Trap!", "/w gm <h2>Notice:</h2><p>The D&D 5E trap theme has been updated to version 3.2. It now automatically detects which character sheet you're using so you don't have to set it yourself! Happy rolling!</p>");
    }
  });
})();
