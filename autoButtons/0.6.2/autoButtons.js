/* globals state log on sendChat playerIsGM */ //eslint-disable-line
const autoButtons = (() => { // eslint-disable-line no-unused-vars

  const scriptName = `autoButtons`,
    scriptVersion = `0.6.2`,
    debugLevel = 2;
  let undoUninstall = null;

  const debug = {
    log: function(...args) { if (debugLevel > 3) console.log(...args) },
    info: function(...args) { if (debugLevel > 2) console.info(...args) },
    warn: function(...args) { if (debugLevel > 1) console.warn(...args) },
    error: function(...args) { if (debugLevel > 0) console.error(...args) },
  }
  
/**
 * CORE SCRIPT
 */
  const startScript = () => {

    const Services = new ServiceLocator({ name: 'autoButtonServices' });

    const Config = new ConfigController(scriptName, {
      version: scriptVersion,
      store: {
        customButtons: {}
      },
      settings: {
        // 0.6.x Setting additions
        report: {
          type: 'string',
          range: [ 'off', 'gm', 'control', 'all' ],
          rangeLabels: [ 'Off', 'GM', 'Character', 'Public' ],
          validate: function(v) { return this.range.find(r => r.toLowerCase() === v.toLowerCase()) },
          default: 'Off',
          name: `Report changes`,
          description: `Report hitpoint changes to chat`,
          menuAction: `$--report`,
        },
        //
        ...defaultScriptSettings,
      },
    });
    Services.register({serviceName: 'config', serviceReference: Config });

    const ButtonStore = new ButtonController({
      name: 'ButtonStore',
      defaultButtons: _defaultButtons,
      services: [Services.config],
    });
    Services.register({ serviceName: 'buttons', serviceReference: ButtonStore });

    const CLI = new CommandLineInterface({
      name: `autoButtonsMenu`,
      options: defaultCliOptions,
    });
    Services.register({ serviceName: 'cli', serviceReference: CLI });

    // v0.6.x CLI additions
    CLI.addOptions([
      {
        name: 'report',
        rx: /^report/i,
        description: `Change settings for reporting HP changes to chat`,
        requiredServices: { config: 'ConfigController' },
        action: function (args) {
          const newVal = `${args}`.replace(/\W/g, '').toLowerCase();
          return this.config.changeSetting('report', newVal);
        }
      },
    ]);
    //

    // Check install and version
    const checkInstall = () => {
      let firstTimeSetup;
      setTimeout(() => { if (!/object/i.test(typeof(['token-mod']))) return sendChat(scriptName, `/w gm <div style="${styles.error}">tokenMod not found - this script requires tokenMod to function! Aborting init...</div>`), 500 });
      if (!state[scriptName] || !state[scriptName].version ) {
        log(`autoButtons: first time setup...`);
        firstTimeSetup = 1;
        state[scriptName] = Config.initialState();
      }
      if (typeof(state[scriptName].version) === 'number' && state[scriptName].version % 1 !== 0) { state[scriptName].version = `${state[scriptName].version}`.replace(/\D/g, '').split('', 3).join('.') }
      if (state[scriptName].version < Config.version) {
        const v = state[scriptName].version;
        if (v < `0.1.3`) { /* 0.5.3 fix - bad key names for very old versions */
          Object.assign(state[scriptName].settings, { ignoreAPI: 1 }); // new Config key
        }
        if (v < `0.2.0`) {
          Object.assign(state[scriptName].settings, { overkill: 0, overheal: 0, enabledButtons: [] }); // new Config keys
        }
        if (v < `0.3.0`) {
          Config.loadPreset(); // structure of preset has changed - reload
        }
        if (v < `0.5.0`) { // major refactor - move buttons over to new button store
          Helpers.copyOldButtonStore();
          state[scriptName].settings.bump = state[scriptName].settings.bump || true;
          state[scriptName].settings.targetTokens = state[scriptName].settings.targetTokens || false;
        }
        if (v < `0.6.0`) {
          // Remove the old buttons store
          if (state[scriptName].settings.buttons && state[scriptName].store) delete state[scriptName].settings.buttons;
          // Update template property structure
          if (state[scriptName].settings.templates.damageProperties.damage && !state[scriptName].settings.templates.damageProperties.damageFields) {
            state[scriptName].settings.templates.damageProperties.damageFields = state[scriptName].settings.templates.damageProperties.damage;
            delete state[scriptName].settings.templates.damageProperties.damage;
            state[scriptName].settings.templates.damageProperties.critFields = state[scriptName].settings.templates.damageProperties.crit;
            delete state[scriptName].settings.templates.damageProperties.crit;
          }
        }
        state[scriptName].version = Config.version;
        log(`***UPDATED*** ====> ${scriptName} to v${Config.version}`);
      }
      Config.fetchFromState();
      if (
        (!Config.getSetting('templates/names') || !Config.getSetting('templates/names').length) ||
        (!Config.getSetting('enabledButtons') || !Config.getSetting('enabledButtons').length)) {
          // debug.log(`Loading preset...`);
          if (firstTimeSetup) Config.loadPreset();
          else new ChatDialog({ title: `${scriptName} Install`, content:`No roll templates registered, or no buttons enabled. AutoButtons will not currently do anything. If you're still setting things up, this is probably ok, otherwise you may want to <a href="${styles.components.confirmApiCommand('reset sheet settings')} --reset" style="${styles.list.controls.create}">Reset</a> to default sheet settings.` }, 'error');
      }
      // Check state of buttons, repair if needed
      if (!state[scriptName].store) Helpers.copyOldButtonStore();
      for (const button in state[scriptName].store.customButtons) {
        state[scriptName].store.customButtons[button].default = false;
        const { err } = ButtonStore.addButton(state[scriptName].store.customButtons[button]);
				if (err) debug.error(`${err}`);
      }
      const allButtons = ButtonStore.getButtonNames(),
        enabledButtons = Config.getSetting('enabledButtons');
      const validButtons = enabledButtons.filter(v => allButtons.includes(v));
      if (validButtons.length !== enabledButtons.length) {
				debug.warn(`Invalid button found in enabledButtons - button hidden.`);
        Config.changeSetting('enabledButtons', validButtons, { overwriteArray: true });
      }
      log(`=( Initialised ${scriptName} - v${Config.version} )=`);
    }
    
    // Send buttons to chat
    const sendButtons = (damage, crit, msg) => {
      const gmOnly = Config.getSetting('gmOnly') ? true : false;
      let buttonHtml = '',
        activeButtons = Config.getSetting(`enabledButtons`) || [],
        name = Helpers.findName(msg.content);
      name = name || `Apply:`;
      activeButtons.forEach(btn => buttonHtml += ButtonStore.createApiButton(btn, damage, crit));
      const buttonTemplate = `<div class="autobutton" style="${styles.outer}${Config.getSetting('bump') ? styles.mods.bump : ''}}"><div style="${styles.rollName}">${name}</div>${buttonHtml}</div>`;
      Helpers.toChat(`${buttonTemplate}`, gmOnly);
    }

    // Deconstruct roll
    const handleDamageRoll = (msg) => {
      const dmgFields = Config.getSetting('templates/damageProperties/damageFields')||[],
        critFields = Config.getSetting('templates/damageProperties/critFields')||[];
      const damage = Helpers.processFields(dmgFields, msg),
        crit = Helpers.processFields(critFields, msg);
      if ('dnd5e_r20' === Config.getSetting('sheet')) {
        const isSpell = Helpers5e.is5eAttackSpell(msg.content);
        if (isSpell) {
          const upcastDamageFields = Config.getSetting('templates/damageProperties/upcastDamage')||[],
            upcastCritFields = Config.getSetting('templates/damageProperties/upcastCrit')||[];
          damage.total += Helpers.processFields(upcastDamageFields, msg).total||0;
          crit.total += Helpers.processFields(upcastCritFields, msg).total||0;
        }
      }
      sendButtons(damage, crit, msg);
    }

    // The input... it must be handled
    const handleInput = (msg) => {
      const msgIsGM = playerIsGM(msg.playerid);
      if (msg.type === 'api' && msgIsGM && /^!autobut(ton)?s?\b/i.test(msg.content)) {
        const cmdLine = (msg.content.match(/^![^\s]+\s+(.+)/i) || [])[1],
          commands = cmdLine ? cmdLine.split(/\s*--\s*/g) : [];
        commands.shift();
        debug.log(commands);
        if (commands.length) CLI.assess(commands);
      }
      else if (msg.rolltemplate && Config.getSetting('templates/names').includes(msg.rolltemplate)) {
        const ignoreAPI = Config.getSetting('ignoreAPI');
        if (ignoreAPI && /^api$/i.test(msg.playerid)) return;
        handleDamageRoll(msg);
      }
    }

    // The Go button
    checkInstall();
    on('chat:message', handleInput);

  }

  /**
   * SCRIPT DATA
   */

  // TODO: Replace with PresetController class
  const preset = {
    dnd5e_r20: {
      sheet: ['dnd5e_r20'],
      templates: {
        names: ['atkdmg', 'dmg', 'npcfullatk', 'npcdmg'],
        damageProperties: {
          damageFields: ['dmg1', 'dmg2', 'globaldamage'],
          critFields: ['crit1', 'crit2', 'globaldamagecrit'],
          upcastDamage: ['hldmg'],
          upcastCrit: ['hldmgcrit'],
        },
      },
      defaultButtons: ['damageCrit', 'damageFull', 'damageHalf', 'healingFull'],
      // userButtons array, to save user button setup?
    },
    custom: {
      sheet: [],
      templates: {
        names: [],
        damageProperties: {
          damageFields: [],
          critFields: [],
        },
      },
      defaultButtons: []
    }
  }

  // Styles for chat UI elements
  const styles = {
    error: `color: red; font-weight: bold;`,
    outer: `position: relative; vertical-align: middle; font-family: pictos; display: block; background: #f4e6b6; border: 1px solid black; height: auto; line-height: 34px; text-align: center; border-radius: 2px;`,
    rollName: `font-family: arial; font-size: 1.1rem; color: black; font-style:italic; position:relative; overflow: hidden; display: block; line-height: 1rem; margin: 2px 0px 1px 0px; white-space: nowrap; text-align: left; left: 2px;`,
    buttonContainer: `display: inline-block; text-align: center; vertical-align: middle; line-height: 26px; margin: auto 5px auto 5px; height: 26px;	width: 26px; border: #8c6700 1px solid;	box-shadow: 0px 0px 3px #805200; border-radius: 5px; background-color: whitesmoke;`,
    buttonShared: `background-color: transparent;	border: none;	padding: 0px;	width: 100%; height: 100%; overflow: hidden;	white-space: nowrap;`,
    crit: `color: red; font-size: 1.5rem;`,
    full: `color: darkred; font-size: 2.1rem;`,
    half: `color: black; font-family: pictos three; font-size: 2rem; padding-top:1px;`,
    healFull: `color: green; font-size: 2rem;`,
    list: {
      container: `font-size: 1.5rem; background: #41415c; border: 5px solid #1c7b74; border-radius: 3px; color: white; vertical-align: middle;`,
      header: `text-align: center; font-weight: bold; padding: 6px 0px 6px 0px; border-bottom: solid 1px darkgray; line-height: 1.5em;`,
      body: `padding: 8px 1rem 8px 1rem;`,
      row: `vertical-align: middle; margin: 0.2em auto 0.2em auto; font-size: 1.2em; line-height: 1.4em;`,
      name: `display: inline-block; vertical-align: middle;	width: 60%; margin-left: 5%; overflow-x: hidden;`,
      buttonContainer: `	display: inline-block; vertical-align: middle; width: 10%; text-align: center; line-height: 1.2em;`,
      controls: {
        common: `position: relative; font-family: pictos; display: inline-block; background-color: darkgray; padding: 0px; margin: 0px; border: 1px solid #c2c2c2; border-radius: 3px; width: 1.1em; height: 1.1em; line-height: 1.1em; font-size: 1.2em;`,
        show: `color: #03650b;`,
        hide: `color: #2a2a2a;`,
        disabled: `color: gray; cursor: pointer;`,
        delete: `color: darkred;`,
        create: `display: inline-block; background-color: darkgray; padding: 0px; margin: 1rem 0; border: 1px solid #c2c2c2; border-radius: 3px;	color: #066a66; padding: 2px 5px 2px 5px; font-size: 1.1em; line-height: 1.2em;`,
        no: `position: absolute; left: 0.4em; font-weight: bold; font-family: arial;`
      },
      footer: `text-align: center; font-weight: bold; padding: 6px 0px 6px 0px; border-top: solid 1px darkgray; line-height: 1.5em;`,
    },
    table: {
      outer: `overflow-x: auto; width: 100%;`,
      table: `margin: 1rem auto; width: 95%; justify-content: center; border: 1px solid #7fb07f;`,
      headerRow: ``,
      row: `background-color: #5e5e63; margin: 0.5rem;`,
      headerCell: `	text-align: center; font-size: 1.7rem; padding: 1rem; border-bottom: 1px solid #7fb07f;`,
      cell: `padding: 0.2rem 1rem; line-height: 3.5rem;`,
      rowBorders: `border-top: 1px solid #7fb07f;`,
      footer: `margin: 0 auto 1.5rem auto;`,
      settingName: `border: 1px solid whitesmoke; padding: 0.4rem 0; border-radius: 0.5rem; cursor: help;`,
      button: `	display: inline-block; background-color: darkgray; border: 1px solid #cae1df; box-shadow: 0px 0px 3px #bcdbd8; border-radius: 3px; color: #045754; padding: 0.3rem 0.5rem; margin: 0.2rem 0!important; font-size: 1.1em; line-height: 1.2em;`,
    },
    components: {
      labelWithDelete: function(label, commandString) {
        const styleOuter = `border: 1px solid whitesmoke; padding: 0.2rem 0rem; border-radius: 0.5rem; width: max-content; margin: auto; display: inline-block; line-height: 1.2rem; white-space: nowrap;`,
          styleDelete = `font-family: pictos; color: darkred;	background-color: gray; height: 1rem; line-height: 1.2rem; width: 1.2rem; text-align: center; margin: 0 1rem; border: 1px solid #aaa8a8; border-radius: 0.5rem;`,
          styleLabel = `display: inline-block; overflow-x: clip; margin-left: 0.5rem;`
        return `<div class="label-delete" style="${styleOuter}"><div style="${styleLabel}">${label}</div><a href="${commandString}" class="delete-button" style="${styleDelete}" title="Delete">&ast;</a></div>`
      },
      confirmApiCommand: function(confirmAction) {
        return `!autobut?{Are you sure you wish to ${confirmAction}|Yes,&nbsp;|No,fffff}`;
      },
    },
    report: ``,
    // BUMP setting CSS - if Roll20 dick with the chatbar CSS this will need to be updated
    mods: {
      bump: `left: -5px; top: -30px; margin-bottom: -34px;`
    }
  }

  // Default buttons
  const _defaultButtons = {
    damageCrit: {
      sheets: ['dnd5e_r20'],
      tooltip: `Crit (%)`,
      style: styles.crit,
      math: (damage, crit) => -(damage.total + crit.total),
      content: 'kk',
    },
    damageFull: {
      sheets: ['dnd5e_r20'],
      tooltip: `Full (%)`,
      style: styles.full,
      math: (damage) => -(1 * damage.total),
      content: 'k',
    },
    damageHalf: {
      sheets: ['dnd5e_r20'],
      tooltip: `Half (%)`,
      style: styles.half,
      math: (damage) => -(Math.floor(0.5 * damage.total)),
      content: 'b',
    },
    healingFull: {
      sheets: ['dnd5e_r20'],
      tooltip: `Heal (%)`,
      style: styles.healFull,
      math: (damage) => (damage.total),
      content: '&',
    },
  };

  // Global regex
  const rx = { on: /\b(1|true|on)\b/i, off: /\b(0|false|off)\b/i };

  // Helper functions
  class Helpers { 
    // Process roll object according to rolltemplate fields
    static processFields(fieldArray, msg) {
      let output = {}
      const rolls = msg.inlinerolls;
      output.total = fieldArray.reduce((m, v) => {
        const rxIndex = new RegExp(`{${v}=\\$\\[\\[\\d+`, 'g'),
          indexResult = msg.content.match(rxIndex);
        if (indexResult) {
          const index = indexResult.pop().match(/\d+$/)[0],
            total = isNaN(rolls[index].results.total) ? 0 : rolls[index].results.total;
          output[v] = total;
          return m + total;
        } else { // if roll template property's inline roll is not found, return 0 to prevent errors down the line
          output[v] = 0;
        }
        return m;
      }, 0);
      return output;
    }
    // Simple name finder, provided rolltemplate has some kind of 'name' property
    static findName(msgContent) {
      const rxName = /name=([^}]+)}/i;
      let name = msgContent.match(rxName);
      return name ? name[1] : null;
    }
    // sendChat shortcut
    static toChat(msg, whisper = true) {
      let prefix = whisper ? `/w gm ` : '';
      sendChat(scriptName, `${prefix}${msg}`, {noarchive: true});
    }
    static toArray(inp) { return Array.isArray(inp) ? inp : [inp]; }
    static emproper(inpString) {
      let words = inpString.split(/\s+/g);
      return words.map(w => `${w[0].toUpperCase()}${w.slice(1)}`).join(` `);
    }
    // Split {{handlebars=moustache}} notation to key value
    static splitHandlebars(inputString) {
      let output = {},
        kvArray = inputString.match(/{{[^}]+}}/g)||[];
      kvArray.forEach(kv => {
        kv = kv.replace(/({{|}})/g, '');
        const key = kv.match(/^[^=]+/),
          value = (kv.match(/=(.+)/)||[])[1] || ``;
        if (key) output[key] = value;
      });
      return Object.keys(output).length ? output : null;
    }
    // Camelise a name if user tries to use whitespace
    static camelise(inp, options={enforceCase:false}) {
      if (typeof(inp) !== 'string') return null;
      const words = inp.split(/[\s_]+/g);
      return words.map((w,i) => {
        const wPre = i > 0 ? w[0].toUpperCase() : w[0].toLowerCase();
        const wSuf = options.enforceCase ? w.slice(1).toLowerCase() : w.slice(1);
        return `${wPre}${wSuf}`;
      }).join('');
    }

    static isObj(input) { return (typeof(input) === 'object' && input.constructor.name === 'Object') ? true : false }

    static copyObj(inputObj) { return (typeof inputObj !== 'object') ? null : JSON.parse(JSON.stringify(inputObj)); }

    static getObjectPath(pathString, baseObject, createPath, deleteTarget) {
      const parts = pathString.split(/\/+/g);
      const objRef = parts.reduce((m,v,i) => {
        if (m == null) return;
        if (m[v] == null) {
          if (createPath) m[v] = {};
          else return null;
        }
        if (deleteTarget && (i === parts.length-1)) delete m[v];
        else return m[v];}, baseObject)
      return objRef;
    }

    // If value exists in array, it will be removed, otherwise it will be added. No validation done. Does not mutate the original.
    static modifyArray(targetArray, newValue) { 
      if (!Array.isArray(targetArray || newValue == null)) return { err: `modifyArray error, bad parameters` };
      if (targetArray.includes(newValue)) {
          Helpers.filterAndMutate(targetArray, (v) => v === newValue);
        return { msg: `Removed ${newValue} from array.` }
      }
      else {
        targetArray = targetArray.push(newValue);
        return { msg: `Added ${newValue} to array.` }
      }
    }

    /**
     * Filter an array by reference
     * @param {array.<string>} inputArray
     * @param {function} predicate 
     * @return {boolean} success/failure
     */
    static filterAndMutate(inputArray, predicate) {
      if (typeof(predicate) !== 'function' || !Array.isArray(inputArray)) {
        debug.error(`filterMutate requires an array and a predicate function.`);
        return false;
      }
      for (let i=inputArray.length-1; i>=0; i--) {
        if (predicate(inputArray[i])) inputArray.splice(i, 1);
      }
      return true;
    }

    static copyOldButtonStore() {
      let names = [];
      state[scriptName].store = state[scriptName].store || {};
      state[scriptName].store.customButtons = Helpers.copyObj(state[scriptName].customButtons) || {}; // copy old store to new store
      for (const button in state[scriptName].store.customButtons) {
        state[scriptName].store.customButtons[button].name = state[scriptName].store.customButtons[button].name || button;
        state[scriptName].store.customButtons[button].mathString = state[scriptName].store.customButtons[button].mathString || state[scriptName].store.customButtons[button].math;
        names.push(state[scriptName].store.customButtons[button].name);
      }
      if (names.length) new ChatDialog({ title: 'Buttons copied to new version', content: names });
    }
  }

  // 5e specific helpers
  class Helpers5e {
    // Spell detection
    static is5eAttackSpell(msgContent) {
      const rxSpell = /{spelllevel=(cantrip|\d+)/;
      return rxSpell.test(msgContent) ? 1 : 0;
    }
  }

  // Default command line options
  const defaultCliOptions = [
    {
      name: 'bump',
      rx: /^bump/i,
      description: `Bump the button UI up to the top of the chat message`,
      requiredServices: { config: 'ConfigController' },
      action: function (args) { return this.config.changeSetting('bump', args, { createPath: true, force: 'boolean' }) }
    },
    {
      name: 'targetTokens',
      rx: /^targett/i,
      description: `Use target instead of select for applying damage to tokens`,
      requiredServices: { config: 'ConfigController' },
      action: function (args) {
        const result = this.config.changeSetting('targetTokens', args, { createPath: true, force: 'boolean' });
        if (this.config.getSetting('targetTokens') && result.success && result.msg) result.msg.push(`*Important*: Players cannot use targeting unless TokenMod is set to allow players to use token ids.`);
        return result;
       }
    },
    {
      name: 'reset',
      rx: /^reset/i,
      description: `Reset configuration from preset`,
      requiredServices: { config: 'ConfigController' },
      action: function () {
        if (this.config.getSetting('sheet')) {
          this.config.loadPreset();
          return { success: 1, msg: `Config reset from preset: "${this.config.getSetting('sheet')}"` };
        } else return { err: `No preset found!` };
      }
    },
    {
      name: 'bar',
      rx: /^(hp)?bar/i,
      description: `Select which token bar represents hit points`,
      requiredServices: { config: 'ConfigController' },
      action: function (args) {
        const newVal = parseInt(`${args}`.replace(/\D/g, ''));
        if (newVal > 0 && newVal < 4) {
          return this.config.changeSetting('hpBar', newVal);
        } else return { err: `token bar value must be 1, 2 or 3`}
      }
    },
    {
      name: 'loadPreset',
      rx: /^loadpre/i,
      description: `Select a preset for a Game System`,
      requiredServices: { config: 'ConfigController', buttons: 'ButtonController' },
      action: function (args) {
        const newVal = args.trim();
        if (Object.keys(preset).includes(newVal)) {
          const newSheet = this.config.changeSetting('sheet', newVal);
          if (newSheet.msg) {
            this.config.loadPreset();
            this.buttons.verifyButtons();
            return { success: 1, msg: `Preset changed: ${newVal}` };
          } else return { err: `Error changing preset to "${newVal}"` };
        } else return { err: `Coudln't find sheet/preset: ${args}` }
      }
    },
    {
      name: 'listTemplates',
      rx: /^(list)?templ/i,
      description: `List roll templates the script is listening for`,
      requiredServices: { config: 'ConfigController' },
      action: function () {
        const templates = this.config.getSetting(`templates/names`),
          confirm = styles.components.confirmApiCommand(`delete this template name?`),
          templateText = Helpers.toArray(templates).map(v => [
            // `<div style="">${v}</div>`,
            // `<a href="!autobut --deleteTemplate ${v}" style="${styles.table.button}">Delete</a>`
            styles.components.labelWithDelete(v, `${confirm}autobut --deleteTemplate ${v}`)
          ]),
          footerContent = `<a href="!autobut --addTemplate ?{Roll template name}" style="${styles.list.controls.create}">Add template</a>`;
        templateText.unshift([ 'Template name']);
        new ChatDialog({ content: templateText, title: `Roll Template List`, footer: footerContent }, 'table');
      }
    },
    {
      name: 'addTemplate',
      rx: /^addtem/i,
      description: `Add roll template name to listen list for damage rolls`,
      requiredServices: { config: 'ConfigController' },
      action: function (args) {
        if (!this.config.getSetting('templates/names').includes(args)) {
          const result = this.config.changeSetting('templates/names', args);
          if (result.success) result.msg = `Added template ${args} to listener list`;
          return result;
        }
      }
    },
    {
      name: 'removeTemplate',
      rx: /^(remove|delete)tem/i,
      description: `Remove roll template from listen list`,
      requiredServices: { config: 'ConfigController' },
      action: function (args) {
        if (this.config.getSetting('templates/names').includes(args)) {
          const result = this.config.changeSetting('templates/names', args);
          if (result.success) result.msg = `Removed template ${args} to listener list`;
          return result;
        }
      }
    },
    {
      name: 'listProperties',
      rx: /^(list)?(propert|props)/i,
      description: `List roll template properties inline rolls are grabbed from`,
      requiredServices: { config: 'ConfigController' },
      action: function () {
        const properties = this.config.getSetting('templates/damageProperties'),
          confirm = styles.components.confirmApiCommand(`delete this template property?`),
          styleCategory = `font-size: 1.4rem; font-weight: bold; font-style: italic;`
        let templateText = [ ['Category', 'Properties'] ];
        if (typeof properties === 'object') {
          for (let category in properties) {
            const propButtons = properties[category].map(prop => styles.components.labelWithDelete(prop, `${confirm}autobut --deleteprop ${category}/${prop}`));
            templateText.push([
              `<span style="${styleCategory}">${category}</span>`,
              `${propButtons.join(`<br>`)}<br><a href="!autobut --addProp ${category}/?{Roll template property name}" style="${styles.list.controls.create}">Add Property</a>`
            ]);
          }
        } else return { err: `Error getting damage properties from state` }
        new ChatDialog({ title: 'Roll Template Properties', content: templateText, borders: { row: true } }, 'table');
      }
    },
    {
      name: 'addProperty',
      rx: /^addprop/i,
      description: `Add a roll template property to the listener`,
      requiredServices: { config: 'ConfigController',  },
      action: function (args) {
        const parts = args.match(/([^/]+)\/(.+)/);
        if (parts && parts.length === 3) {
          if (this.config.getSetting(`templates/damageProperties/${parts[1]}`) == null) {
            Helpers.toChat(`Created new roll template damage property category: ${parts[1]}`);
            state[scriptName].settings.templates.damageProperties[parts[1]] = [];
          }
          return this.config.changeSetting(`templates/damageProperties/${parts[1]}`, parts[2]);
        } else {
          return { err: `Bad property path supplied, must be in the form "category/propertyName". Example: damage/dmg1` };
        }
      }
    },
    {
      name: 'removeProperty',
      rx: /^(remove|delete)?prop/i,
      description: `Remove a roll template property from the listener`,
      requiredServices: { config: 'ConfigController',  },
      action: function (args) {
        const parts = args.match(/([^/]+)\/(.+)/);
        if (parts && parts.length === 3) {
          const currentArray = this.config.getSetting(`templates/damageProperties/${parts[1]}`);
          if (currentArray != null) {
            const result = this.config.changeSetting(`templates/damageProperties/${parts[1]}`, parts[2]);
            if (result.success && !/^(damage|crit)$/i.test(parts[1])) { // Clean up category if it's now empty, and isn't a core category
              const newArray = this.config.getSetting(`templates/damageProperties/${parts[1]}`);
              if (newArray.length === 0) {
                delete state[scriptName].settings.templates.damageProperties[parts[1]];
                result.msg += `\nCategory ${parts[1]} was empty, and was removed.`;
              }
            }
            return result;
          } else return { err: `Could not find roll template property category: ${parts[1]}` }
        } else {
          return { err: `Bad property path supplied, must be in the form "category/propertyName". Example: damage/dmg1` }
        }
      }
    },
    {
      name: 'listButtons',
      rx: /^(list)?button/i,
      description: `List available buttons`,
      requiredServices: { config: 'ConfigController', buttons: 'ButtonController' },
      action: function() {
        const removableButtons = this.buttons.getButtonNames({ default: false }),
          usedButtons = this.config.getSetting('enabledButtons'),
          unusedButtons = this.buttons.getButtonNames({ hidden: true }),
          availableButtons = this.buttons.getButtonNames({ hidden: true, currentSheet: true }),
          reorderedButtons = usedButtons.concat(unusedButtons);
        const links = {
          hide: `!autoButton --hideButton %name%`,
          show: `!autoButton --showButton %name%`,
          delete: `!autoButton --deleteButton %name%`,
          disabled: `#`
        }
        const labels = {
          hide: `E<span style="${styles.list.controls.no}">/</span>`,
          show: 'E',
          delete: 'D',
          disabled: '!'
        };
        const controls = ['show', 'hide', 'delete'];
        const listBody = reorderedButtons.map(button => {
          let rowHtml = `<div class="list-row" style="${styles.list.row}"><div class="button-name" style="${styles.list.name}">${removableButtons.includes(button) ? '' : '&ast;'}%name%</div>`;
          controls.forEach(control => {
            const controlType = (
                (control === 'show' && availableButtons.includes(button)) ||
                (control === 'hide' && usedButtons.includes(button)) ||
                (control === 'delete' && removableButtons.includes(button))) ?
              control : 'disabled';
            rowHtml += `<div class="control-${control}" style="${styles.list.buttonContainer}" title="${Helpers.emproper(`${control} button`)}"><a href="${links[controlType]}" style="${styles.list.controls.common}${styles.list.controls[controlType]}">${labels[control]}</a></div>`;
          });
          return `${rowHtml.replace(/%name%/g, button)}</div>`;
        });
        const headerText = `autoButton list (sheet: ${this.config.getSetting('sheet')})`,
          bodyText = listBody.join(''),
          footerText = `<a style="${styles.list.controls.create}" href="!autobut --createbutton {{name=?{Name?|newButton}}} {{content=?{Pictos Character?|k}}} {{tooltip=?{Tooltip?|This is a button}}} {{math=?{Math function|floor(damage.total/2&rpar;}}}">Create New Button</a>`;
        new ChatDialog({ header: headerText, body: bodyText, footer: footerText }, 'listButtons');
      },
    },
    {
      name: 'showButton',
      rx: /^showbut/i,
      description: `Add a button to the template`,
      requiredServices: { config: 'ConfigController', buttons: 'ButtonController' },
      action: function (args) {
        const newVal = args.trim();
        const validButtons = this.buttons.getButtonNames({ hidden: true, currentSheet: true });
        if (validButtons.includes(newVal)) {
          return this.config.changeSetting('enabledButtons', newVal);
        } else new ChatDialog({ title: 'Error', content: `Unrecognised or incompatible button: "${newVal}"` }, 'error');
      }
    },
    {
      name: 'hideButton',
      rx: /^hidebut/i,
      description: `Remove a button from the template`,
      requiredServices: { config: 'ConfigController', buttons: 'ButtonController' },
      action: function (args) {
        const newVal = args.trim();
        const validButtons = this.buttons.getButtonNames({ shown: true, currentSheet: true });
        if (validButtons.includes(newVal)) {
          return this.config.changeSetting('enabledButtons', newVal);
        } else new ChatDialog({ title: 'Error', content: `Unrecognised or incompatible button: "${newVal}"` }, 'error');
      }
    },
    {
      name: 'reorderButtons',
      rx: /^(re)?order/i,
      description: `Change order of buttons`,
      requiredServices: { config: 'ConfigController' },
      action: function (args) {
        if (!args) return;
        const newIndices = args.replace(/[^\d,]/g, '').split(/,/g),
          currentOrder = this.config.getSetting('enabledButtons');
        let newOrder = [];
        let valid = true;
        newIndices.forEach(buttonIndex => {
          const realIndex = buttonIndex - 1;
          if (realIndex > -1 && realIndex < currentOrder.length) {
            if (currentOrder[realIndex]) {
              newOrder.push(currentOrder[realIndex]);
              currentOrder[realIndex] = null;
            }
          } else valid = false;
        });
        if (!valid) return { err: `Invalid button order input: ${args}. Indices must be between 1 and total number of buttons in use.` }
        newOrder = newOrder.concat(currentOrder.filter(v => v));
        if (newOrder.length === currentOrder.length) return this.config.changeSetting('enabledButtons', newOrder, { overwriteArray: true });
      }
    },
    {
      name: 'createButton',
      rx: /^createbut/i,
      description: `Create a new button`,
      requiredServices: { config: 'ConfigController', buttons: 'ButtonController' },
      action: function (args) {
        const buttonData = Helpers.splitHandlebars(args);
        if (buttonData && buttonData.name) {
          if (/^[^A-Za-z]/.test(buttonData.name)) return { err: `Invalid button name: must start with a letter` };
          let buttonName = /\s/.test(buttonData.name) ? Helpers.camelise(buttonData.name) : buttonData.name;
          if (this.buttons.getButtonNames().includes(buttonName)) return { err: `Invalid button name, already in use: "${buttonName}"` }
          if (!buttonData.math) return { err: `Button must have an associated function, {{math=...}}` }
          buttonData.default = false;
          return this.buttons.addButton(buttonData);
        } else return { err: `Bad input for button creation` }
      }
    },
    {
      name: 'editButton',
      rx: /^editbut/i,
      description: `Edit an existing button`,
      requiredServices: { buttons: 'ButtonController' },
      action: function (args) {
        let buttonData = Helpers.splitHandlebars(args);
        debug.log(buttonData);
        if (buttonData && buttonData.name) {
          if (this.buttons.getButtonNames().includes(buttonData.name)) {
            return this.buttons.editButton(buttonData);
          }
        } 
      }
    },
    {
      name: 'deleteButton',
      rx: /^del(ete)?but/i,
      description: `Remove a button`,
      requiredServices: { buttons: 'ButtonController', config: 'ConfigController' },
      action: function (args) {
        const removeResult = this.buttons.removeButton({ name: args }),
          buttonIsEnabled = this.config.getSetting('enabledButtons').includes(args);
        if (removeResult.success) {
          if (buttonIsEnabled) this.config.changeSetting('enabledButtons', args);
          return removeResult;
        } else return removeResult;
      }
    },
    {
      name: 'ignoreApi',
      rx: /^ignoreapi/i,
      description: `Ignore anything sent to chat by the API`,
      requiredServices: { config: 'ConfigController' },
      action: function(args) { return this.config.changeSetting('ignoreAPI', args) }
    },
    {
      name: 'overheal',
      rx: /^overh/i,
      description: `Allow healing to push hp above hpMax`,
      requiredServices: { config: 'ConfigController' },
      action: function (args) { return this.config.changeSetting('overheal', args) }
    },
    {
      name: 'overkill',
      rx: /^overk/i,
      description: `Allow healing to push hp above hpMax`,
      requiredServices: { config: 'ConfigController' },
      action: function (args) { return this.config.changeSetting('overkill', args) }
    },
    {
      name: 'gmOnly',
      rx: /^gmo/i,
      description: `Whisper the buttons to GM, or post publicly`,
      requiredServices: { config: 'ConfigController' },
      action: function (args) { return this.config.changeSetting('gmOnly', args) }
    },
    {
      name: 'settings',
      rx: /^setting/i,
      description: `Open settings UI`,
      requiredServices: { config: 'ConfigController' },
      action: function() { this.config.getSettingsMenu() }
    },
    {
      name: 'help',
      rx: /^(\?$|h$|help)/i,
      description: `Display script help`,
      action: function() { new ChatDialog({ title: `Script Help`, content: `Please visit the <a href="https://app.roll20.net/forum/permalink/10766392/" style="color:#6bb75d!important; font-weight: bold;">autoButtons thread</a> for documentation.` }) }
    },
    {
      name: 'uninstall',
      rx: /^uninstall$/i,
      description: `Remove all script settings from API state`,
      action: function(args) {
        if (/^undo/i.test(args)) {
          state[scriptName] = Helpers.copyObj(undoUninstall);
          new ChatDialog({ title: 'Reverse! Reverse the reverse!', content: `State settings have been restored. Let's pretend that never happend, eh?` }, 'error')
        } else if (!undoUninstall) {
          undoUninstall = Helpers.copyObj(state[scriptName]);
          state[scriptName] = null;
          delete state[scriptName];
          new ChatDialog({
            header: `${scriptName} uninstalled!`,
            body: `Removed all ${scriptName} settings from API state. Click the 'whoopsie' button below if you didn't mean to destroy all your settings! All settings will be *permantently* lost on sandbox restart.`,
            footer: `<a style="${styles.list.controls.create}" href="!autobut --uninstall undo">Oh Shit!</a>`,
          }, 'listButtons');
        }
      }
    }
  ];

  /**
   * Must have a valid type to be pulled into SettingsManager as a setting
   * 'object' type can be used for nesting settings keys
   * 'validate' is a validator for the input, not necessarily the key itself (e.g. an array might accept strings in the validator)
   * 'name'/'description' are only used for chat menu
   * 'menuAction' must be supplied. Starting with '$' will automatically convert into a button, otherwise supply actual text required
   */
  const defaultScriptSettings = {
    sheet: {
      type: 'string',
      range: ['dnd5e_r20', 'custom'],
      rangeLabels: [ 'DnD5e by Roll20', 'Custom' ],
      validate: function(v) { return this.range.includes(v) },
      default: 'dnd5e_r20',
      name: 'Character sheet',
      description: 'Character sheet in use',
      menuAction: `$--loadPreset`
    },
    templates: {
      type: 'object',
      names: {
        type: 'array',
        validate: (v) => typeof(v) === 'string',
        default: [],
        name: `Roll templates & properties`,
        description: `Names of roll templates & properties watched by autoButtons`,
        menuAction: `<a href="!autobut --listTemplates" style="${styles.table.button}">Templates</a><br><a href="!autobut --listProps" style="${styles.table.button}">Properties</a>`,
      },
      damageProperties: {
        type: 'object',
        damageFields:  {
          type: 'array',
          validate: (v) => typeof(v) === 'string',
          default: [],
        },
        critFields: {
          type: 'array',
          validate: (v) => typeof(v) === 'string',
          default: []
        },
        upcastDamage: {
          type: 'array',
          validate: (v) => typeof(v) === 'string',
          default: []
        },
        upcastCrit: {
          type: 'array',
          validate: (v) => typeof(v) === 'string',
          default: []
        },
        get value() {
          const output = {};
          for (const key in this) {
            if (key === 'value') continue;
            if (this[key].value) output[key] = this[key].value;
          }
          return output;
        }
      },
    },
    enabledButtons: {
      type: 'array',
      validate: (v) => typeof(v) === 'string',
      default: [],
    },
    gmOnly: {
      type: 'boolean',
      default: true,
      name: `GM-only buttons`,
      description: `Whether the buttons are visible to players`,
      menuAction: `$--gmo`,
    },
    hpBar: {
      type: 'integer',
      range: [1,2,3],
      validate: function(v) { return this.range.includes(v) },
      default: 1,
      name: `Token HP bar`,
      description: `Which token bar contains hit points`,
      menuAction: `$--bar`,
    },
    ignoreAPI: {
      type: 'boolean',
      default: true,
      name: `Ignore API posts`,
      description: `Ignore any automated damage rolls made by scripts`,
      menuAction: `$--ignoreapi`,
    },
    overheal: {
      type: 'boolean',
      default: false,
      name: `Allow overheal`,
      description: `Allow HP to go above max`,
      menuAction: `$--overheal`,
    },
    overkill: {
      type: 'boolean',
      default: false,
      name: `Allow overkill`,
      description: `Allow HP to go below 0`,
      menuAction: `$--overkill`,
    },
    targetTokens: {
      type: 'boolean',
      default: false,
      name: `Target tokens`,
      description: `Use a target click to target token, instead of current selection`,
      menuAction: `$--targettoken`,
    },
    bump: {
      type: 'boolean',
      default: true,
      name: `Slim buttons`,
      description: `CSS to bump the button container up in chat to save some space`,
      menuAction: `$--bump`,
    }
  }

 /**
 * CLASS DEFINITIONS
 */

  class ServiceLocator {

    static _active = null;
    _services = {};

    constructor(services={}) {
      if (ServiceLocator._active) return ServiceLocator._active;
      this.name = `ServiceLocator`;
      for (let svc in services) { this._services[svc] = services[svc] }
      ServiceLocator._active = this;
    }

    static getLocator() { return ServiceLocator._active }

    register({ serviceName, serviceReference }) { if (!this._services[serviceName]) this._services[serviceName] = serviceReference }

    // Find a service. If service has multiple instances, make sure to request by instance name, or only the first registered constructor name will be returned.
    // Search by Class Constructor Name is only suitable for unique class instances
    getService(serviceName) {
      if (this._services[serviceName]) return { [serviceName]: this._services[serviceName] }
      else {
        const rxServices = new RegExp(`${serviceName}`, 'i')
        for (let service in this._services) {
          if (this._services[service].constructor && rxServices.test(this._services[service].constructor.name)) return this._services[service];
        }
      }
    }
  }

  class SettingsManager {

    _settingsKeys = {};

    constructor(settingsData = {}) {
      const processObject = (currentObject, targetPath) => {
        for (const key in currentObject) {
          if (!currentObject[key].type) {
            debug.log(`Skipping ${key}, no type found`);
            continue;
          }
          debug.log(`Processing ${key}...`);
          if (currentObject[key].type === 'object' && Helpers.isObj(currentObject[key])) {
            targetPath[key] = currentObject[key];
            processObject(currentObject[key], targetPath[key]);
          }
          else if (this._validateKey(currentObject[key], currentObject[key].default)) {
            targetPath[key] = currentObject[key];
            targetPath[key].value = currentObject[key].default;
          }
          else debug.warn(`${this.constructor.name}: Bad key used in constructor: ${key} default value does not match specified type`, currentObject[key]);
        }
      }
      processObject(settingsData, this._settingsKeys);
      debug.log(this._settingsKeys);
    }

    get settingsKeys() { return this._settingsKeys }

    // Validate a settings key and the stored value
    _validateKey(settingsKey, settingsValue) {
      if (!settingsKey) return false;
      // debug.log(`Validating ${settingsValue}...`);
      const passValidation = (
          settingsKey.type === 'array' && Array.isArray(settingsValue)
          || ['float', 'integer', 'number'].includes(settingsKey.type) && typeof(settingsValue) === 'number'
          || typeof(settingsValue) === settingsKey.type
        ) ? true : false;
      // debug.log(passValidation);
      return passValidation;
    }
      

    // Validate an input to be stored in a settings key (e.g. may be a primitive value to be stored in an object type key)
    // Returns undefined for failed validation, otherwise returns value ready for storage
    _validateNewValue(settingsKey, newValue, options = { forceValidation: null }) {
      if (!settingsKey || typeof(settingsKey) !== 'object' || !settingsKey.type || newValue === undefined) return debug.error(`${this.constructor.name}: Bad settings key`, settingsKey);
      // Handle keys with validators (Objects and Arrays must have a validator since they can't be passed from Roll20)
      if (typeof(options.forceValidation) === 'function') {
        if (options.forceValidation(newValue)) return newValue;
        else return undefined;
      }
      else if (typeof(settingsKey.validate) === 'function') {
        if (settingsKey.validate(newValue)) return newValue;
        else return undefined;
      }
      // Handle booleans
      else if (settingsKey.type === 'boolean') {
        if (rx.on.test(newValue)) return true;
        else if (rx.off.test(newValue)) return false;
        else return undefined;
      }
      // Otherwise, type match
      else if (settingsKey.type === 'integer' && parseInt(newValue) === parseInt(newValue)) return parseInt(newValue);
      else if (settingsKey.type === 'float' && parseFloat(newValue) === parseFloat(newValue)) return parseFloat(newValue);
      else if (settingsKey.type === typeof(newValue)) return newValue;
      else return undefined;
    }

    _writeSetting(settingsKey, newValue, options = { overwriteArray: false }) {
      const validationOptions = (options.overwriteArray) ? { forceValidation: (v) => Array.isArray(v) } : {},
        validData = this._validateNewValue(settingsKey, newValue, validationOptions);
      if (validData === undefined) {
        debug.error(`${this.constructor.name}: Settings change not applied, value failed validation`, settingsKey, newValue);
        return { err: `${this.constructor.name}: Settings change not applied, value failed validation` }
      }
      else {
        if (settingsKey.type === 'array') {
          if (options.overwriteArray && Array.isArray(newValue)) {
            settingsKey.value = newValue;
            return { msg: `Saved new Array: [${newValue.join(', ')}]` }
          }
          else return Helpers.modifyArray(settingsKey.value, newValue);
        }
        else {
          settingsKey.value = newValue;
          return { msg: `Saved value: ${newValue}` }
        }
      }
    }

    importSettingsValues(importedKeys = {}) {
      if (typeof(importedKeys) !== 'object') return debug.error(`${this.constructor.name}: Bad settings import, must only supply object type`);
      const processObject = (currentObject, targetPath) => {
        for (const key in currentObject) {
          if (targetPath[key]) {
            if (!targetPath[key].type) {
              debug.log(`Skipping ${key}, no type defined`);
              continue;
            }
            if (targetPath[key].type === 'object' && Helpers.isObj(currentObject[key])) {
              processObject(currentObject[key], targetPath[key]);
            }
            else if (this._validateKey(targetPath[key], currentObject[key])) {
              targetPath[key].value = currentObject[key];
            }
            else debug.warn(`${this.constructor.name}: Key "${key}" failed validation`, currentObject[key]);
          }
          else debug.warn(`${this.constructor.name}: Key "${key}" does not exist.`, currentObject[key]);
        }
      }
      processObject(importedKeys, this._settingsKeys);
      debug.log(this._settingsKeys);
    }

    exportSettingsValues() {
      const output = {};
      const processObject = (currentObject, targetPath) => {
        for (const key in currentObject) {
          if (currentObject[key].type === 'object' && Helpers.isObj(currentObject[key])) {
            targetPath[key] = {};
            processObject(currentObject[key], targetPath[key]);
          }
          else if (currentObject[key].type) {
            targetPath[key] = currentObject[key].value;
          }
        }
      }
      processObject(this._settingsKeys, output);
      return output;
    }

    // Provide path relative to {Config._settings}, e.g. changeSetting('sheet', 'mySheet');
    // booleans with no "newValue" supplied will be toggled
    // Use options.force 'type' to force a type on the setting e.g. array or boolean
    // Combine with options.createPath: true to create a new setting of the correct type
    updateSetting(pathString, newValue, options = { createPath: false, overwriteArray: false, force: null }) {
      if (typeof(pathString) !== 'string' || newValue === undefined) return { err: `Bad path string or no new value supplied.` };
      // Can probably remove this bit now that a .value key is used
      const keyName = (pathString.match(/[^/]+$/)||[])[0],
        path = /.+\/.+/.test(pathString) ? pathString.match(/(.+)\/[^/]+$/)[1] : '',
        configPath = path ? Helpers.getObjectPath(path, this._settingsKeys, options.createPath) : this._settingsKeys,
        targetKey = configPath[keyName];
      if (targetKey) {
        debug.log(`changeSetting - ${keyName}`, targetKey, options, newValue);
        if (targetKey.type === 'boolean') {
          newValue = (newValue == null || newValue === '') ? !targetKey.value :
            rx.on.test(newValue) ? true :
            rx.off.test(newValue) ? false :
            newValue;
        }
        const result = this._writeSetting(targetKey, newValue, options);
        if (result.msg) result.msg = `Changed setting: ${pathString}<br>${result.msg}`;
        else if (result.err) result.err = `Changed setting: ${pathString}<br>${result.err}`;
        return result;
      }
      else {
        return { err: `Settings key not found - *${pathString}*` }
      }
    }

    readSetting(pathString) {
      if (typeof(pathString) !== 'string') return;
      const targetKey = Helpers.getObjectPath(pathString, this._settingsKeys, false);
      return targetKey ? targetKey.value : undefined;
    }

    // Export this._settingsKeys as chatbar-friendly text
    getMenuText() {
      const output = [];
      const processObject = (currentObject, targetOutput) => {
        for (const key in currentObject) {
          if (currentObject[key].type === 'object') {
            processObject(currentObject[key], targetOutput);
          }
          else if (currentObject[key].menuAction) {
            const name = currentObject[key].name || key,
              hover = currentObject[key].description ? `title="${currentObject[key].description}"` : ``,
              settingName = `<div class="setting-name" style="${styles.table.settingName}" ${hover}>${name}</div>`,
              currentSetting = `${currentObject[key].value}`;
            // Entry has a custom menu action
            if (/^[^$]/.test(currentObject[key].menuAction)) {
              targetOutput.push([ settingName, currentObject[key].menuAction ]);
            }
            // Autofill prompt for boolean or defined range
            else {
              const queryRange =
                currentObject[key].type === 'boolean' ? ['True', 'False']
                : currentObject[key].range ?
                  currentObject[key].rangeLabels ? currentObject[key].range.map((v,i) => `${currentObject[key].rangeLabels[i]||v},${v}`)
                  : Helpers.toArray(currentObject[key].range)
                : '',
                queryString = queryRange ? `?{Select new value|${queryRange.join('|')}}` : `?{Enter new value}`,
                cliFlag = (`${currentObject[key].menuAction}`.match(/^\$(.+)/)||[])[1] || `--${key}`,
                commandString = `!${scriptName} ${cliFlag} ${queryString}`;
              targetOutput.push([ settingName, `<a href="${commandString}" style="${styles.table.button}">${currentSetting}</a>`]);
            }
          }
        }
      }
      processObject(this._settingsKeys, output);
      return output;
    }

  }

  class ConfigController {

    _version = { M: 0, m: 0, p: 0 };

    constructor(scriptName, scriptData={}) {
      Object.assign(this, {
        name: scriptName || `newScript`,
        _settings: new SettingsManager(scriptData.settings) || {},
        _store: scriptData.store || {},
      });
      if (scriptData.version) this.version = scriptData.version;
    }

    get version() { return `${this._version.M}.${this._version.m}.${this._version.p}` }
    set version(newVersion) {
      if (typeof(newVersion) === 'object' && newVersion.M && newVersion.m && newVersion.p) Object.assign(this._version, newVersion);
      else {
        const parts = `${newVersion}`.split(/\./g);
        if (!parts.length) debug.error(`Bad version number, not setting version.`)
        else Object.keys(this._version).forEach((v,i) => this._version[v] = parseInt(parts[i]) || 0);
      }
    }

    initialState() {
      return {
        version: this.version,
        settings: this._settings.exportSettingsValues(),
        store: this._store
      }
    }

    fromStore(path) { return Helpers.getObjectPath(path, this._store, false) }
    toStore(path, data) { // Supplying data=null will delete the target
      const ref = Helpers.getObjectPath(path, this._store, true);
      let msg;
      if (ref) {
        if (data) {
          Object.assign(ref, data);
          msg = `New data written to "${path}"`;
        } else if (data === null) {
          Helpers.getObjectPath(path, this._store, false, true);
          msg = `${path} deleted from store.`;
        } else return { success: 0, err: `Bad data supplied (type: ${typeof data})` }
      } else return { success: 0, err: `Bad store path: "${path}"` }
      this.saveToState();
      return { success: 1, msg: msg }
    }

    fetchFromState() {
      Object.assign(this, { _store: state[scriptName].store, });
      this._settings.importSettingsValues(state[scriptName].settings);
    }
    saveToState() {
      Object.assign(state[scriptName], {
        settings: this._settings.exportSettingsValues(),
        store: this._store,
      });
    }

    changeSetting(pathString, newValue, options) {
      options = typeof(options) === 'object' ? options : undefined;
      const result = this._settings.updateSetting(pathString, newValue, options);
      debug.log(`Setting change attempted`, result);
      if (result.msg) this.saveToState();
      return result;
    }
    getSetting(pathString) {
      const currentValue = this._settings.readSetting(pathString);
      return (typeof currentValue === 'object') ? Helpers.copyObj(currentValue) : currentValue;
    }
    loadPreset() {
      const currentSheet = this.getSetting('sheet') || '';
      if (Object.keys(preset).includes(currentSheet)) {
        // Load template names
        this._settings.updateSetting('templates/names', preset[currentSheet].templates.names, { overwriteArray: true });
        // Load damage properties
        for (const key in preset[currentSheet].templates.damageProperties) {
          // debug.info(`Processing ${key} in preset...`);
          this._settings.updateSetting(`templates/damageProperties/${key}`, preset[currentSheet].templates.damageProperties[key], { overwriteArray: true });
        }
        this._settings.updateSetting('enabledButtons', preset[currentSheet].defaultButtons || [], { overwriteArray: true });
        this.saveToState();
        return { res: 1, data: `${this.getSetting('sheet')}` }
      } else return { res: 0, err: `Preset not found for sheet: "${currentSheet}"`}
    }
    getSettingsMenu() {
      const menuOptions = this._settings.getMenuText(),
        confirm = styles.components.confirmApiCommand(`reset to default sheet settings?`),
        footerContent = `<div style="${styles.table.footer}"><a href="${confirm} --reset" style="${styles.list.controls.create}">Reset Sheet Settings</a>`;
      menuOptions.unshift(['Key', 'Setting']);
      new ChatDialog({ title: `${scriptName} Settings`, content: menuOptions, footer: footerContent }, 'table');
    }
  }

  class ButtonController {

    static _buttonKeys = ['sheets', 'content', 'tooltip', 'style', 'math', 'default', 'mathString'];
    _locator = null;
    _Config = {};
    _buttons = {};

    constructor(data={}) {
      Object.assign(this, { name: data.name || 'newButtonController' });
      // Requires access to a ConfigController
      this._locator = ServiceLocator.getLocator() || this._locator;
      this._Config = this._locator ? this._locator.getService('ConfigController') : null;
      if (!this._Config) return {};
      for (let button in data.defaultButtons) { this._buttons[button] = new Button(data.defaultButtons[button], styles) }
    }

    get keys() { return ButtonController._buttonKeys }

    getButtonNames(filters={ default: null, currentSheet: null, shown: null, hidden: null }) {
      let buttons = Object.entries(this._buttons);
      const sheet = this._Config.getSetting('sheet'),
        enabledButtons = this._Config.getSetting('enabledButtons');
      if (typeof filters.default === 'boolean') buttons = buttons.filter(kv => kv[1].default === filters.default);
      if (typeof filters.currentSheet === 'boolean') buttons = buttons.filter(kv => (!kv[1].sheets.length || sheet === 'custom' || (kv[1].sheets.includes(sheet) === filters.currentSheet)));
      if (typeof filters.shown === 'boolean') buttons = buttons.filter(kv => (enabledButtons.includes(kv[0]) === filters.shown));
      if (typeof filters.hidden === 'boolean') buttons = buttons.filter(kv => (enabledButtons.includes(kv[0]) === !filters.hidden));
      const output =  buttons.map(kv=>kv[0]);
      // debug.log(`button names: ${output.join(', ')}`);
      return output;
    }

    static parseMathString(inputString) {
      debug.log(inputString);
      inputString = `${inputString}`;
      let err = '';
      // Convert to JS
      const formulaReplacer = {
        '$1Math.floor': /([^.]|^)floor/ig,
        '$1Math.ceil': /([^.]|^)ceil/ig,
        '$1Math.round': /([^.]|^)round/ig,
        '($1||0)': /((damage|crit)\.\w+)/ig,
      }
      // Very basic security, at least stops a `state = null`
      const disallowed = [ /=/g, /\bstate\b/gi ];

      disallowed.forEach(rx => { if (rx.test(inputString)) err += `Disallowed value in math formula: "${`${rx}`.replace(/(\\\w|\/)/g, '')}"` });
      
      let newFormula = inputString;
      for (let f in formulaReplacer) newFormula = newFormula.replace(formulaReplacer[f], f);

      // Create a test object
      let damageKeys = inputString.match(/(damage|crit)\.(\w+)/g),
        testKeys = {};
      damageKeys = damageKeys ? damageKeys.map(k => k.replace(/^[^.]*\./, '')) : [];
      damageKeys.forEach(k => testKeys[k] = 5);

      let validate = false,
        newFunc;
      try {
        newFunc = new Function(`damage`, `crit`, `return (${newFormula})`)
        validate = isNaN(newFunc(testKeys, testKeys)) ? false : true;
      } catch(e) { err += (`${scriptName}: formula failed validation`) }

      if (validate && !err) {
        return newFunc;
      }	else {
        return new Error(err);
      }
    }
    addButton(buttonData={}) {
      const newButton = buttonData.default === false ? new CustomButton(buttonData) : new Button(buttonData);
      if (newButton.err) return { success: 0, err: newButton.err }
      if (this._buttons[newButton.name]) return { success: 0, err: `Button "${newButton.name}" already exists` };
      this._buttons[newButton.name] = newButton;
      debug.info(this._buttons);
      this.saveToStore();
      return { success: 1, msg: `New Button "${newButton.name}" successfully created` }
    }
    editButton(buttonData={}) {
      const modded = [];
      if (!this._buttons[buttonData.name]) return { success: 0, err: `Button "${buttonData.name}" does not exist.` }
      if (this._buttons[buttonData.name].default) return { success: 0, err: `Cannot edit default buttons.` }
      this.keys.forEach(k => {
        if (buttonData[k] != null) {
          if (k === 'default') return; // Don't allow reassignment of 'default' property
          else if (k === 'math') {
            const newMath = ButtonController.parseMathString(buttonData[k]);
            if (newMath.err) return newMath;
            else {
              this._buttons[buttonData.name].mathString = buttonData[k];
              this._buttons[buttonData.name].math = newMath;
              modded.push(k);
            }
          }
          else if (k === 'style') {
            this._buttons[buttonData.name].style = styles[buttonData[k]] || buttonData[k] || '';
            modded.push(k);
          }
          else {
            this._buttons[buttonData.name][k] = buttonData[k];
            modded.push(k);
          }
        }
      });
      if (modded.length) this.saveToStore();
      return modded.length ? { success: 1, msg: `Modified ${buttonData.name} fields: ${modded.join(', ')}` } : { success: 0, err: `No fields supplied.` }
    }
    removeButton(buttonData={}) {
      if (!this._buttons[buttonData.name]) return { success: 0, err: `Button "${buttonData.name}" does not exist.` }
      if (this._buttons[buttonData.name].default) return { success: 0, err: `Cannot delete default buttons.` }
      delete this._buttons[buttonData.name];
      this._Config.toStore(`customButtons/${buttonData.name}`, null);
      return { success: 1, msg: `Removed "${buttonData.name}".` }
    }
    showButton(buttonName) {
      if (this._buttons[buttonName] && !this._Config.getSetting('enabledButtons').includes(buttonName)) { return this._Config.changeSetting('enabledButtons', buttonName) }
    }
    hideButton(buttonName) {
      if (this._buttons[buttonName] && this._Config.getSetting('enabledButtons').includes(buttonName)) { return this._Config.changeSetting('enabledButtons', buttonName) }
    }
    saveToStore() {
      const customButtons = this.getButtonNames({default: false});
      customButtons.forEach(button => this._Config.toStore(`customButtons/${button}`, Helpers.copyObj(this._buttons[button])));
      // debug.log(this._Config.fromStore('customButtons'));
    }
    _getReportTemplate(barNumber) {
      const template = `'*({name}) {bar${barNumber}_value;before}HP -> {bar${barNumber}_value}HP*'`;
      return template;
      // Styled report template for if Aaron implements decoding in TM
      // const templateRaw = `'<div class="autobuttons-tm-report" style="${styles.report}">{name}: {bar1_value:before}HP >> {bar1_value}HP</div>'`;
      // return encodeURIComponent(templateRaw);
    }
    createApiButton(buttonName, damage, crit) {
      const btn = this._buttons[buttonName],
        bar = this._Config.getSetting('hpBar'),
        overheal = this._Config.getSetting('overheal'),
        overkill = this._Config.getSetting('overkill'),
        sendReport = (this._Config.getSetting('report')||``).toLowerCase(),
        reportString = [ 'all', 'gm', 'control' ].includes(sendReport)
          ? ` --report ${sendReport}|${this._getReportTemplate(bar)}`
          : ``;
        console.info(reportString);
      if (!btn || typeof(btn.math) !== 'function') {
        debug.error(`${scriptName}: error creating API button ${buttonName}`);
        return ``;
      }
      const modifier = btn.math(damage, crit),
        tooltip = btn.tooltip.replace(/%/, `${modifier} HP`),
        tokenModCmd = (modifier > 0) ? (!overheal) ? `+${modifier}!` : `+${modifier}` : (modifier < 0 && !overkill) ? `${modifier}!` : modifier,
        selectOrTarget = (this._Config.getSetting('targetTokens') === true) ? `--ids &commat;&lcub;target|token_id} ` : ``;
      return `<div style="${styles.buttonContainer}"  title="${tooltip}"><a href="!token-mod ${selectOrTarget}--set bar${bar}_value|${tokenModCmd}${reportString}" style="${styles.buttonShared}${btn.style}">${btn.content}</a></div>`;
    }
    verifyButtons() {
      const currentSheet = this._Config.getSetting('sheet'),
        currentButtons = this._Config.getSetting('enabledButtons'),
        validButtons = currentButtons.filter(button => {
        if (currentSheet === 'custom' || this._buttons[button] && this._buttons[button].sheets.includes(currentSheet)) return 1;
      });
      if (validButtons.length !== currentButtons.length) {
        const { success, msg, err } = this._Config.changeSetting('enabledButtons', validButtons);
        if (success && msg) new ChatDialog({ content: msg, title: 'Buttons Changed' });
        else if (err) new ChatDialog({ content: err }, 'error');
      }
    }
  }

  class Button {
    constructor(buttonData={}, styleData=styles) {
      Object.assign(this, {
        name: buttonData.name || 'newButton',
        sheets: Array.isArray(buttonData.sheets) ? buttonData.sheets : [],
        tooltip: `${buttonData.tooltip || ''}`,
        style: styleData[buttonData.style] || buttonData.style || '',
        content: buttonData.content || '?',
        math: buttonData.math || null,
        mathString: buttonData.mathString || buttonData.math.toString(),
        default: buttonData.default === false ? false : true,
      });
      debug.log(this);
      if (typeof(this.math) !== 'function') return { err: `Button "${this.name}" math function failed validation` };
    }
  }

  class CustomButton extends Button {
    constructor(buttonData={}) {
      debug.log(buttonData);
      if (!buttonData.math && !buttonData.mathString) return { err: `Button must contain a function in 'math' key.` };
      Object.assign(buttonData, {
        name: buttonData.name || 'newCustomButton',
        mathString: buttonData.mathString || buttonData.math.toString(),
        math: ButtonController.parseMathString(buttonData.mathString || buttonData.math.toString()),
        style: buttonData.style || 'full',
        default: false,
      });
      super(buttonData);
    }
  }

  class CommandLineInterface {

    _locator = null;
    _services = {};
    _options = {};

    constructor(cliData={}) {
      this.name = cliData.name || `Cli`;
      this._locator = ServiceLocator.getLocator();
      if (!this._locator) debug.warn(`${this.constructor.name} could not find the service locator. Any commands relying on services will be disabled.`);
      Object.assign(this._services, {
        config: this._locator.getService('ConfigController'),
        buttons: this._locator.getService('ButtonController'),
        cli: this,
      });
      if (cliData.options && cliData.options.length) this.addOptions(cliData.options);
      debug.log(`Initialised CLI`);
    }

    // Add one or more options to the CLI
    addOptions(optionData) {
      optionData = Helpers.toArray(optionData);
      optionData.forEach(data => {
        if (data.name && !this._options[data.name]) {
          const suppliedServices = { cli: this }
          if (data.requiredServices) {
            for (let service in data.requiredServices) {
              const svc =
                service === 'ConfigController' ? this._services.config
                : service === 'ButtonController' ? this._services.buttons
                : this._locator.getService(data.requiredServices[service]);
              if (svc) suppliedServices[service] = svc;
              else return debug.warn(`${this.name}: Warning - Service "${service}" could not be found for option ${data.name}. CLI option not registered.`);
            }
          }
          data.services = suppliedServices;
          this._options[data.name] = new CommandLineOption(data);
        } else debug.warn(`Bad data supplied to CLI Option constructor`);
      });
    }

    assess(commandArray, reportToChat = true) {
      let changed = [], errs = [];
      commandArray.forEach(command => {
        const cmd = (command.match(/^([^\s]+)/)||[])[1],
          args = (command.match(/\s+(.+)/)||['',''])[1];
        for (let option in this._options) {
          if (this._options[option].rx.test(cmd)) {
            const { msg, err } = (this._options[option].action(args) || {});
            // debug.log(msg||err);
            if (msg) changed.push(Helpers.toArray(msg).join('<br>'));
            if (err) errs.push(err);
          }
        }
      });
      if (changed.length && reportToChat) {
        // debug.info(changed);
        const chatData = {
          title: `${scriptName} settings changed`,
          content: changed
        };
        new ChatDialog(chatData);
      }
      if (errs.length) new ChatDialog( { title: 'Errors', content: errs }, 'error');
    }

    trigger(option, ...args) { if (this._options[option]) this._options[option].action(...args) }

  }

  class CommandLineOption {

    constructor(optionData={}) {
      for (let service in optionData.services) {
        this[service] = optionData.services[service];
      }
      Object.assign(this, {
        name: optionData.name || 'newOption',
        rx: optionData.rx || new RegExp(`${optionData.name}`, 'i'),
        description: optionData.description || `Description goes here...`,
        action: optionData.action
      });
    }
    
  }

  class ChatDialog {

    static _templates = {
      none: ({content}) => `${content}`,
      default: ({ title, content }) => {
        const msgArray = content ? Helpers.toArray(content) : [],
          body = msgArray.map(row => `<div class="default-row" style="line-height: 1.5em;">${row}</div>`).join('')
        return `
          <div class="default" style="${styles.list.container} background-color: #4d4d4d; border-color: #1e7917; text-align: center;">
            <div class="default-header" style="${styles.list.header}">${title||scriptName}</div>
            <div class="default-body" style="${styles.list.body}">
              ${body}
            </div>
          </div>`;
      },
      table: ({ title, content, footer, borders }) => {
        // debug.log(content);
        const rowBorders = borders && borders.row ? styles.table.rowBorders : ``;
        const msgArray = content ? Helpers.toArray(content) : [],
          columns = msgArray[0].length || 1,
          tableRows = msgArray.map((row,i) => {
            const tc = i === 0 ? 'th' : 'td',
              tcStyle = i === 0 ? styles.table.headerCell : `${styles.table.cell}${rowBorders}`,
              trStyle = i === 0 ? styles.table.headerRow : styles.table.row;
            let cells = ``;
            for (let i=0; i < columns; i++) { cells += `<${tc} style="${tcStyle}">${row[i]}</${tc}>` }
            return `
              <tr style="${trStyle}">
                ${cells}
              </tr>`;
          }).join(''),
          footerContent = footer ? `<div class="table-footer" style="${styles.table.footer}">${footer}</div>` : ``;
        return `
        <div class="table" style="${styles.list.container} background-color: #4d4d4d; border-color: #1e7917; text-align: center;">
          <div class="table-header" style="${styles.list.header}">${title||scriptName}</div>
          <div class="table-body" style="${styles.table.outer}">
            <table style="${styles.table.table}">
              ${tableRows}
            </table>
          </div>
          ${footerContent}
        </div>
        `;
      },
      error: ({ title, content }) => {
        const errArray = content ? Helpers.toArray(content) : [];
        return `
          <div class="error" style="${styles.list.container} border-color: #8d1a1a; background-color: #646464; text-align: center;">
            <div class="error-header" style="${styles.list.header} font-weight: bold;">${title}</div>
            <div class="error-body" style="${styles.list.body} border: none; padding: 6px 10px 6px 10px; line-height: 1.5em;">${errArray.join('<br>')}</div>
          </div>`;
      },
      listButtons: ({ header, body, footer }) => {
        return `
        <div class="autobutton-list" style="${styles.list.container}">
          <div class="autobutton-header" style="${styles.list.header}">${header}</div>
          <div class="autobutton-body" style="${styles.list.body}">
            ${body}
          </div>
          <div class="autobutton-footer" style="${styles.list.footer}">
            <div style="${styles.list.buttonContainer}width:auto;">${footer}</div>
          </div>
        </div>
        `;
      }
    }
    
    constructor(message, template = 'default', autoSend = true) {
      this.msg = ChatDialog._templates[template] ? ChatDialog._templates[template](message) : null;
      if (this.msg) {
        this.msg = this.msg.replace(/\n/g, '');
        if (autoSend) Helpers.toChat(this.msg);
      } else {
        debug.warn(`${scriptName}: error creating chat dialog, missing template "${template}"`);
        return {};
      }
    }
  }

  on('ready', startScript);

})();