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
<<<<<<< HEAD
     * A list of the names of skills that can be used to investigate things.
     * The first string should be the primary skill used. The rest should be
     * provided in increasing alphabetical order.
     * @abstract
     * @type {string[]}
     */
    get skillNames() {
      throw new Error('Not implemented');
=======
     * The name of the skill used to investigate things.
     * @type {string}
     */
    get skillName() {
      throw new Error('Not implemented.');
>>>>>>> 74cc68c309981ff00eaf89ddaf560008889649f3
    }

    constructor() {
      super();
    }

    /**
     * @inheritdoc
     */
    checkObject(character, obj) {
<<<<<<< HEAD
      return Promise.all(_.map(this.skillNames, skillName => {
        return this._getInvestigationResults(character, obj, skillName);
      }))
      .then(allParagraphs => {
        return _.chain(allParagraphs)
        .flatten()
        .compact()
        .uniq()
        .value();
      });
=======
      return this._getInvestigationResults(character, obj);
>>>>>>> 74cc68c309981ff00eaf89ddaf560008889649f3
    }

    /**
     * Gets the total "Investigation" skill modifier for a character.
     * This skill is not necessarily Investigation; It's just whatever skill
     * is used to investigate or examine things closely in whatever system
     * the theme is for.
     * @abstract
     * @param {Character} character
<<<<<<< HEAD
     * @param {string} skillName
     * @return {Promise<int>}
     */
    getSkillMod(character, skillName) {
      _.noop(character, skillName);
=======
     * @return {Promise<int>}
     */
    getInvestigationMod(character) {
      _.noop(character);
>>>>>>> 74cc68c309981ff00eaf89ddaf560008889649f3
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
<<<<<<< HEAD
     * @param {string} skillName
     * @return {Promise<string[]>}
     */
    _getInvestigationResults(character, checkedObj, skillName) {
=======
     * @return {Promise<string[]>}
     */
    _getInvestigationResults(character, checkedObj) {
>>>>>>> 74cc68c309981ff00eaf89ddaf560008889649f3
      let charID = character.get('_id');

      return Promise.resolve()
      .then(() => {
        let objProps = CheckItOut.ObjProps.get(checkedObj);

        // No problem here.
<<<<<<< HEAD
        if (!objProps || !objProps.theme['skillCheck_' + skillName])
          return [];

        // If we have cached investigation results, just return those.
        _.defaults(objProps.theme['skillCheck_' + skillName], {
          cachedResults: {}
        });

        let cachedResults = objProps.theme['skillCheck_' + skillName].cachedResults[charID];
=======
        if (!objProps || !objProps.theme.investigation)
          return [];

        // If we have cached investigation results, just return those.
        _.defaults(objProps.theme.investigation, {
          cachedResults: {}
        });

        let cachedResults = objProps.theme.investigation.cachedResults[charID];
>>>>>>> 74cc68c309981ff00eaf89ddaf560008889649f3
        if (cachedResults)
          return cachedResults;

        // Try rolling investigation to see if we can learn more details.
<<<<<<< HEAD
        return this.getSkillMod(character, skillName)
        .then(skillMod => {
          return Promise.all([
            CharSheetUtils.rollAsync(`1d20 + ${skillMod}`),
            10 + skillMod
          ]);
=======
        return this.getInvestigationMod(character)
        .then(investigationMod => {
          return CharSheetUtils.rollAsync(`1d20 + ${investigationMod}`);
>>>>>>> 74cc68c309981ff00eaf89ddaf560008889649f3
        })

        // Get the paragraphs for checks whose DCs we beat.
        .then(result => {
<<<<<<< HEAD
          let [rolledResult, passiveResult] = result;

          // Skip if this skill has no checks for the object.
          let checks = objProps.theme['skillCheck_' + skillName].checks;
          if (_.size(checks) === 0)
            return [];

          // Whisper the result to the GM.
          let charName = character.get('name');
          let objName = checkedObj.get('name');
          let rollMsg = `${charName} rolled ${rolledResult.total} ` +
            `on their ${skillName} check for ${objName}. `;
          if (objProps.theme.allowPassives)
            rollMsg += `Passive: ${passiveResult}`;
          CheckItOut.utils.Chat.whisperGM(rollMsg);
          //log(result);

          // Get the paragraphs for DCs that were passed.
          return _.chain(checks)
          .map((paragraph, dcStr) => {
            let dc = parseInt(dcStr);
            if (rolledResult.total >= dc || (objProps.theme.allowPassives && passiveResult >= dc))
=======
          // Whisper the result to the GM.
          let charName = character.get('name');
          let objName = checkedObj.get('name');
          CheckItOut.utils.Chat.whisperGM(`${charName} rolled ${result.total} ` +
            `on their ${this.skillName} check for ${objName}.`);
          // log(result);

          return _.chain(objProps.theme.investigation.checks)
          .map((paragraph, dcStr) => {
            let dc = parseInt(dcStr);
            if (result.total >= dc)
>>>>>>> 74cc68c309981ff00eaf89ddaf560008889649f3
              return paragraph;
          })
          .compact()
          .value();
        })
        .then(paragraphs => {
<<<<<<< HEAD
          objProps.theme['skillCheck_' + skillName].cachedResults[charID] = paragraphs;
=======
          objProps.theme.investigation.cachedResults[charID] = paragraphs;
>>>>>>> 74cc68c309981ff00eaf89ddaf560008889649f3
          return paragraphs;
        });
      });
    }

    /**
     * @inheritdoc
     */
    getWizardProperties(checkedObj) {
      let objProps = CheckItOut.ObjProps.getReadOnly(checkedObj);

      return [
        {
<<<<<<< HEAD
          id: 'skillCheck',
          name: `Skill Checks`,
          desc: `Additional details revealed from successful skill checks.`,
          value: (() => {
            let checks = [];

            // Iterate through each skill supported by this theme.
            _.each(this.skillNames.sort(), skillName => {
              if (objProps.theme['skillCheck_' + skillName]) {
                // sort the DCs.
                let dcStrs = _.keys(objProps.theme['skillCheck_' + skillName].checks);
                let dcs = _.map(dcStrs, dc => {
                  return parseInt(dc);
                }).sort();

                // Skip if there are no DCs for this skill.
                if (dcs.length === 0)
                  return;

                // Render a line for each DC, paragraph pair.
                checks.push(`<p>${skillName}:</p>`);
                _.each(dcs, dc => {
                  let paragraph = objProps.theme['skillCheck_' + skillName].checks[dc];
                  checks.push(`<p style="font-weight: lighter;">DC ${dc}: ${paragraph}</p>`);
                }).join('');
              }
            });

            // Create the concatenated string of skill checks <p> blocks.
            if (checks.length > 0)
              return checks.join('');
=======
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
>>>>>>> 74cc68c309981ff00eaf89ddaf560008889649f3
            else
              return 'None';
          })(),
          properties: [
            {
<<<<<<< HEAD
              id: 'skillName',
              name: 'Skill',
              desc: 'The skill used for the check.',
              options: _.map(this.skillNames, skillName => {
                return CheckItOut.utils.sanitizeStr(skillName);
              }).sort()
            },
            {
              id: 'dc',
              name: 'DC',
              desc: `The DC for the skill check.`
=======
              id: 'dc',
              name: 'DC',
              desc: `The DC for the ${this.skillName} check.`
>>>>>>> 74cc68c309981ff00eaf89ddaf560008889649f3
            },
            {
              id: 'paragraph',
              name: 'Details',
              desc: `Additional details revealed if the character ` +
<<<<<<< HEAD
                `succeeds at the skill check.`
=======
                `succeeds at the ${this.skillName} check.`
>>>>>>> 74cc68c309981ff00eaf89ddaf560008889649f3
            }
          ]
        },
        {
<<<<<<< HEAD
          id: 'allowPassives',
          name: 'Allow Passive Skills',
          desc: 'Whether to allow passive skills to be used when checking ' +
            'out the object. When determining the results of a check the ' +
            'higher of the character\'s passive score and their rolled ' +
            'score will be used.',
          value: (() => {
            if (objProps.theme.allowPassives)
              return 'yes';
            else
              return 'no';
          })(),
          options: ['yes', 'no']
        },
        {
          id: 'resetCache',
          name: 'Reset Cache',
          desc: `Resets the cached skill check results for this object.`,
=======
          id: 'resetCache',
          name: 'Reset Cache',
          desc: `Resets the cached ${this.skillName} results for this object.`,
>>>>>>> 74cc68c309981ff00eaf89ddaf560008889649f3
          isButton: true,
          prompt: true
        }
      ];
    }

    /**
     * @inheritdoc
     */
    modifyWizardProperty(checkedObj, prop, params) {
      let objProps = CheckItOut.ObjProps.create(checkedObj);

      // Create the property if it doesn't exist.
<<<<<<< HEAD
      _.each(this.skillNames, skillName => {
        let skillProp = 'skillCheck_' + skillName;
        _.defaults(objProps.theme, {
          [skillProp]: {}
        });
        _.defaults(objProps.theme[skillProp], {
          checks: {},
          cachedResults: {}
        });
      });

      if (prop === 'skillCheck') {
        let skillName = CheckItOut.utils.unsanitizeStr(params[0]);
        let dc = parseInt(params[1]);
        let paragraph = params[2];

        // Persist the check, or delete it if the paragraph is blank.
        if (paragraph)
          objProps.theme['skillCheck_' + skillName].checks[dc] = paragraph;
        else
          delete objProps.theme['skillCheck_' + skillName].checks[dc];
      }

      if (prop === 'allowPassives') {
        let allowed = params[0] === 'yes';
        objProps.theme.allowPassives = allowed;
      }

      if (prop === 'resetCache' && params[0] === 'yes') {
        _.each(this.skillNames, skillName => {
          objProps.theme['skillCheck_' + skillName].cachedResults = {};
        });
=======
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
>>>>>>> 74cc68c309981ff00eaf89ddaf560008889649f3
      }
    }
  };
})();
