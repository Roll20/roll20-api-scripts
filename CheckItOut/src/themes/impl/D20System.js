(() => {
  'use strict';

  const CheckItOutTheme = CheckItOut.themes.CheckItOutTheme;

  /**
   * Base class for themes for an sheet using a typical D20 system
   * (e.g. D&D 3.5, D&D 4, D&D 5, Pathfinder, etc.)
   * @abstract
   */
  CheckItOut.themes.impl.D20System = class extends CheckItOutTheme {
    /**
     * The name of the skill used to investigate things.
     * @type {string}
     */
    get skillName() {
      throw new Error('Not implemented.');
    }

    constructor() {
      super();
    }

    /**
     * @inheritdoc
     */
    checkObject(character, checkedObj) {
      let objProps = CheckItOut.getObjProps(checkedObj) || {};

      // No problem here.
      if (!objProps.theme)
        return Promise.resolve([]);

      return this._getInvestigationResults(character, checkedObj);
    }

    /**
     * Gets the total "Investigation" skill modifier for a character.
     * This skill is not necessarily Investigation; It's just whatever skill
     * is used to investigate or examine things closely in whatever system
     * the theme is for.
     * @abstract
     * @param {Character} character
     * @return {Promise<int>}
     */
    getInvestigationMod(character) {
      _.noop(character);
      throw new Error('Not implemented.');
    }

    /**
     * Get additional paragraphs about an object by having the character
     * roll an "investigation" skill check.
     * This skill is not necessarily Investigation; It's just whatever skill
     * is used to investigate or examine things closely in whatever system
     * the theme is for.
     * @param {Character} character
     * @param {Graphic} checkedObj
     * @return {Promise<string[]>}
     */
    _getInvestigationResults(character, checkedObj) {
      let charID = character.get('_id');

      return Promise.resolve()
      .then(() => {
        let objProps = CheckItOut.getObjProps(checkedObj) || {};

        // No problem here.
        if (!objProps.theme.investigation)
          return [];

        // If we have cached investigation results, just return those.
        _.defaults(objProps.theme.investigation, {
          cachedResults: {}
        });
        
        let cachedResults = objProps.theme.investigation.cachedResults[charID];
        if (cachedResults)
          return cachedResults;

        // Try rolling investigation to see if we can learn more details.
        return this.getInvestigationMod(character)
        .then(investigationMod => {
          return CharSheetUtils.rollAsync(`1d20 + ${investigationMod}`);
        })

        // Get the paragraphs for checks whose DCs we beat.
        .then(result => {
          // Whisper the result to the GM.
          let charName = character.get('name');
          let objName = checkedObj.get('name');
          CheckItOut.utils.Chat.whisperGM(`${charName} rolled ${result.total} ` +
            `on their ${this.skillName} check for ${objName}.`);
          log(result);

          return _.chain(objProps.theme.investigation.checks)
          .map((paragraph, dcStr) => {
            let dc = parseInt(dcStr);
            if (result.total >= dc)
              return paragraph;
          })
          .compact()
          .value();
        })
        .then(paragraphs => {
          objProps.theme.investigation.cachedResults[charID] = paragraphs;
          return paragraphs;
        });
      });
    }

    /**
     * @inheritdoc
     */
    getWizardProperties(checkedObj) {
      let objProps = CheckItOut.getObjProps(checkedObj) || {};

      return [
        {
          id: 'investigation',
          name: `${this.skillName} checks`,
          desc: `Additional details revealed from successful ` +
            `${this.skillName} checks.`,
          value: (() => {
            if (objProps.theme.investigation) {
              // sort the DCs.
              let dcStrs = _.keys(objProps.theme.investigation.checks);
              let dcs = _.map(dcStrs, dc => {
                return parseInt(dc);
              });
              dcs.sort();

              // Render a line for each DC, paragraph pair.
              return _.map(dcs, dc => {
                let paragraph = objProps.theme.investigation.checks[dc];
                return `<p>DC ${dc}: ${paragraph}</p>`;
              }).join('');
            }
            else
              return 'None';
          })(),
          properties: [
            {
              id: 'dc',
              name: 'DC',
              desc: `The DC for the ${this.skillName} check.`
            },
            {
              id: 'paragraph',
              name: 'Details',
              desc: `Additional details revealed if the character ` +
                `succeeds at the ${this.skillName} check.`
            }
          ]
        },
        {
          id: 'resetCache',
          name: 'Reset Cache',
          desc: `Resets the cached ${this.skillName} results for this object.`,
          isButton: true,
          prompt: true
        }
      ];
    }

    /**
     * @inheritdoc
     */
    modifyWizardProperty(checkedObj, prop, params) {
      let objProps = CheckItOut.getOrCreateObjProps(checkedObj);

      // Create the property if it doesn't exist.
      _.defaults(objProps.theme, {
        investigation: {}
      });
      _.defaults(objProps.theme.investigation, {
        checks: {},
        cachedResults: {}
      });

      if (prop === 'investigation') {
        let dc = parseInt(params[0]);
        let paragraph = params[1];

        // Persist the check, or delete it if the paragraph is blank.
        if (paragraph)
          objProps.theme.investigation.checks[dc] = paragraph;
        else
          delete objProps.theme.investigation.checks[dc];
      }

      if (prop === 'resetCache' && params[0] === 'yes') {
        objProps.theme.investigation.cachedResults = {};
      }
    }
  };
})();
