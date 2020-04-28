/**
 * A module that presents a wizard for setting up traps instead of
 * hand-crafting the JSON for them.
 */
var ItsATrapCreationWizard = (() => {
  'use strict';
  const DISPLAY_WIZARD_CMD = '!ItsATrap_trapCreationWizard_showMenu';
  const MODIFY_CORE_PROPERTY_CMD = '!ItsATrap_trapCreationWizard_modifyTrapCore';
  const MODIFY_THEME_PROPERTY_CMD = '!ItsATrap_trapCreationWizard_modifyTrapTheme';

  const MENU_CSS = {
    'optionsTable': {
      'width': '100%'
    },
    'menu': {
      'background': '#fff',
      'border': 'solid 1px #000',
      'border-radius': '5px',
      'font-weight': 'bold',
      'margin-bottom': '1em',
      'overflow': 'hidden'
    },
    'menuBody': {
      'padding': '5px',
      'text-align': 'center'
    },
    'menuHeader': {
      'background': '#000',
      'color': '#fff',
      'text-align': 'center'
    }
  };

  // The last trap that was edited in the wizard.
  let curTrap;

  /**
   * Displays the menu for setting up a trap.
   * @param {string} who
   * @param {string} playerid
   * @param {Graphic} trapToken
   */
  function displayWizard(who, playerId, trapToken) {
    curTrap = trapToken;
    let content = new HtmlBuilder('div');

    if(!trapToken.get('status_cobweb')) {
      trapToken.set('status_cobweb', true);
      trapToken.set('name', 'A cunning trap');
      trapToken.set('aura1_square', true);
      trapToken.set('gmnotes', getDefaultJson());
    }

    // Core properties
    content.append('h4', 'Core properties');
    let coreProperties = getCoreProperties(trapToken);
    content.append(_displayWizardProperties(MODIFY_CORE_PROPERTY_CMD, coreProperties));

    // Trigger properties
    content.append('h4', 'Trigger properties', {
      style: { 'margin-top' : '2em' }
    });
    let triggerProperties = getTriggerProperties(trapToken);
    content.append(_displayWizardProperties(MODIFY_CORE_PROPERTY_CMD, triggerProperties));

    // Activation properties
    content.append('h4', 'Activation properties', {
      style: { 'margin-top' : '2em' }
    });
    let shapeProperties = getShapeProperties(trapToken);
    content.append(_displayWizardProperties(MODIFY_CORE_PROPERTY_CMD, shapeProperties));

    // Reveal properties
    content.append('h4', 'Detection properties', {
      style: { 'margin-top' : '2em' }
    });
    let revealProperties = getRevealProperties(trapToken);
    content.append(_displayWizardProperties(MODIFY_CORE_PROPERTY_CMD, revealProperties));

    // Script properties
    content.append('h4', 'External script properties', {
      style: { 'margin-top': '2em' }
    });
    let scriptProperties = getScriptProperties(trapToken);
    content.append(_displayWizardProperties(MODIFY_CORE_PROPERTY_CMD, scriptProperties));

    // Theme properties
    let theme = ItsATrap.getTheme();
    if(theme.getThemeProperties) {
      content.append('h4', 'Theme-specific properties', {
        style: { 'margin-top' : '2em' }
      });
      let properties = theme.getThemeProperties(trapToken);
      content.append(_displayWizardProperties(MODIFY_THEME_PROPERTY_CMD, properties));
    }

    // Remote activate button
    content.append('div', `[Activate Trap](${ItsATrap.REMOTE_ACTIVATE_CMD} ${curTrap.get('_id')})`, {
      style: { 'margin-top' : '2em' }
    });

    let menu = _showMenuPanel('Trap Configuration', content);
    _whisper(who, menu.toString(MENU_CSS));
  }

  /**
   * Creates the table for a list of trap properties.
   * @private
   */
  function _displayWizardProperties(modificationCommand, properties) {
    let table = new HtmlBuilder('table');
    _.each(properties, prop => {
      let row = table.append('tr', undefined, {
        title: prop.desc
      });

      // Construct the list of parameter prompts.
      let params = [];
      let paramProperties = prop.properties || [prop];
      _.each(paramProperties, item => {
        let options = '';
        if(item.options)
          options = '|' + item.options.join('|');
        params.push(`?{${item.name} ${item.desc} ${options}}`);
      });

      row.append('td', `[${prop.name}](${modificationCommand} ${prop.id}&&${params.join('&&')})`, {
        style: { 'font-size': '0.8em' }
      });

      row.append('td', `${prop.value || ''}`, {
        style: { 'font-size': '0.8em', 'min-width': '1in' }
      });
    });

    return table;
  }

  /**
   * Fixes msg.who.
   * @param {string} who
   * @return {string}
   */
  function _fixWho(who) {
    return who.replace(/\(GM\)/, '').trim();
  }

  /**
   * Gets a list of the core trap properties for a trap token.
   * @param {Graphic} token
   * @return {object[]}
   */
  function getCoreProperties(trapToken) {
    let trapEffect = new TrapEffect(trapToken);

    let LPAREN = '&#40;';
    let RPAREN = '&#41;';

    let LBRACE = '&#91;';
    let RBRACE = '&#93;';

    return [
      {
        id: 'name',
        name: 'Name',
        desc: 'The name of the trap',
        value: trapToken.get('name')
      },
      {
        id: 'type',
        name: 'Type',
        desc: 'Is this a trap, or some other hidden secret?',
        value: trapEffect.type || 'trap'
      },
      {
        id: 'message',
        name: 'Message',
        desc: 'The message displayed when the trap is activated.',
        value: trapEffect.message
      },
      {
        id: 'disabled',
        name: 'Disabled?',
        desc: 'A disabled trap will not activate when triggered, but can still be spotted with passive perception.',
        value: trapToken.get('status_interdiction') ? 'yes' : 'no',
        options: ['yes', 'no']
      },
      {
        id: 'gmOnly',
        name: 'Show GM Only?',
        desc: 'When the trap is activated, should its results only be displayed to the GM?',
        value: trapEffect.gmOnly ? 'yes' : 'no',
        options: ['yes', 'no']
      },
      {
        id: 'notes',
        name: 'Secret Notes',
        desc: 'Additional secret notes shown only to the GM when the trap is activated.',
        value: trapEffect.notes || '-'
      }
    ];
  }

  /**
   * Produces JSON for default trap properties.
   * @return {string}
   */
  function getDefaultJson() {
    return JSON.stringify({
      effectShape: 'self',
      stopAt: 'center'
    });
  }

  /**
   * Gets a list of the core trap properties for a trap token dealing
   * with revealing the trap.
   * @param {Graphic} token
   * @return {object[]}
   */
  function getRevealProperties(trapToken) {
    let trapEffect = (new TrapEffect(trapToken)).json;

    let LPAREN = '&#40;';
    let RPAREN = '&#41;';

    let LBRACE = '&#91;';
    let RBRACE = '&#93;';

    return [
      {
        id: 'searchDist',
        name: 'Max Search Distance',
        desc: 'How far away can characters passively search for this trap?',
        value: (() => {
          let page = getObj('page', trapToken.get('_pageid'));
          let units = page.get('scale_units');
          let dist = trapToken.get('aura2_radius') || trapEffect.searchDist;

          if (dist)
            return `${dist} ${units}`;
          else
            return '-';
        })()
        //value: trapToken.get('aura2_radius') || trapEffect.searchDist || '-'
      },
      {
        id: 'revealOpts',
        name: 'Reveal the Trap?',
        desc: 'Whether the trap should be revealed when the trap is activated and/or spotted, or if not, whether the trap troken is deleted after it activates.',
        value: (() => {
          let onActivate = trapToken.get('status_bleeding-eye');
          let onSpotted = trapEffect.revealWhenSpotted;
          let layer = trapEffect.revealLayer || 'map';

          if (onActivate && onSpotted)
            return `Reveal to ${layer} layer when activated or spotted.`;
          else if (onActivate)
            return `Reveal to ${layer} layer when activated.`;
          else if (onSpotted)
            return `Reveal to ${layer} layer when spotted.`;
          else
            return 'Do not reveal.';
        })(),
        properties: [
          {
            id: 'onActivate',
            name: 'Reveal when activated?',
            desc: 'Should the trap be revealed when it is activated?',
            options: ['yes', 'no']
          },
          {
            id: 'onSpotted',
            name: 'Reveal when spotted?',
            desc: 'Should the trap be revealed when it is spotted?',
            options: ['yes', 'no']
          },
          {
            id: 'layer',
            name: 'Reveal Layer',
            desc: 'Which layer should the trap be moved to when it is revealed?',
            options: ['map', 'objects']
          }
        ]
      }
    ];
  }

  /**
   * Gets a list of the core trap properties for a trap token defining
   * the shape of the trap.
   * @param {Graphic} token
   * @return {object[]}
   */
  function getShapeProperties(trapToken) {
    let trapEffect = new TrapEffect(trapToken);

    let LPAREN = '&#40;';
    let RPAREN = '&#41;';

    let LBRACE = '&#91;';
    let RBRACE = '&#93;';

    return _.compact([
      {
        id: 'effectShape',
        name: 'Activation Area',
        desc: `The area of the trap that actually affects tokens after it is triggered. To set paths, you must also select one or more paths defining the trap's blast area. A fill color must be set for tokens inside the path to be affected.`,
        value: trapEffect.effectShape || 'self',
        options: [ 'self', 'burst', 'set selected shapes']
      },
      (() => {
        if (trapEffect.effectShape === 'burst')
          return {
            id: 'effectDistance',
            name: 'Burst Radius',
            desc: `The radius of the trap's burst activation area.`,
            value: (() => {
              let radius = trapToken.get('aura1_radius') || 0;
              let page = getObj('page', trapToken.get('_pageid'));
              let units = page.get('scale_units');
              return `${radius} ${units}`;
            })()
          };
      })(),
      {
        id: 'api',
        name: 'API Command',
        desc: 'An API command which the trap runs when it is activated. The constants TRAP_ID and VICTIM_ID will be replaced by the object IDs for the trap and victim. Multiple API commands are now supported by separating each command with &quot;&#59;&#59;&quot;.',
        value: trapEffect.api || '-'
      },
      {
        id: 'fx',
        name: 'Special FX',
        desc: 'What special FX are displayed when the trap is activated?',
        value: (() => {
          let fx = trapEffect.fx;
          if(fx) {
            let result = fx.name;
            if(fx.offset)
              result += '; Offset: ' + fx.offset;
            if(fx.direction)
              result += '; Direction: ' + fx.direction;
            return result;
          }
          else
            return 'None';
        })(),
        properties: [
          {
            id: 'name',
            name: 'FX Name',
            desc: 'The name of the special FX.'
          },
          {
            id: 'offset',
            name: 'FX Offset',
            desc: 'The offset ' + LPAREN + 'in units' + RPAREN + ' of the special FX from the trap\'s center. Format: ' + LBRACE + 'X,Y' + RBRACE
          },
          {
            id: 'direction',
            name: 'FX Direction',
            desc: 'The directional vector for the special FX ' + LPAREN + 'Leave blank to direct it towards characters' + RPAREN + '. Format: ' + LBRACE + 'X,Y' + RBRACE
          }
        ]
      },
      {
        id: 'sound',
        name: 'Sound',
        desc: 'A sound from your jukebox that will play when the trap is activated.',
        value: trapEffect.sound || '-',
        options: (() => {
          let tracks = findObjs({
            _type: 'jukeboxtrack'
          });
          let trackNames = _.map(tracks, track => {
            return _htmlEncode(track.get('title'));
          });
          trackNames.sort();
          return ['none', ...trackNames];
        })()
      },
      {
        id: 'triggers',
        name: 'Chained Trap IDs',
        desc: 'A list of the names or token IDs for other traps that are triggered when this trap is activated.',
        value: (() => {
          let triggers = trapEffect.triggers;
          if(_.isString(triggers))
            triggers = [triggers];

          if(triggers)
            return triggers.join(', ');
          else
            return 'none';
        })(),
        options: ['none', 'set selected traps']
      },
      {
        id: 'destroyable',
        name: 'Delete after Activation?',
        desc: 'Whether to delete the trap token after it is activated.',
        value: trapEffect.destroyable ? 'yes': 'no',
        options: ['yes', 'no']
      }
    ]);
  }

  /**
   * Gets a a list of the trap properties for a trap token dealing with
   * supported API scripts.
   */
  function getScriptProperties(trapToken) {
    let trapEffect = (new TrapEffect(trapToken)).json;

    let LPAREN = '&#40;';
    let RPAREN = '&#41;';

    let LBRACE = '&#91;';
    let RBRACE = '&#93;';

    return _.compact([
      // Requires AreasOfEffect script.
      (() => {
        if(typeof AreasOfEffect !== 'undefined') {
          let effectNames = _.map(AreasOfEffect.getEffects(), effect => {
            return effect.name;
          });

          return {
            id: 'areaOfEffect',
            name: 'Areas of Effect script',
            desc: 'Specifies an AoE graphic to be spawned by the trap.',
            value: (() => {
              let aoe = trapEffect.areaOfEffect;
              if(aoe) {
                let result = aoe.name;
                if(aoe.direction)
                  result += '; Direction: ' + aoe.direction;
                return result;
              }
              else
                return 'None';
            })(),
            properties: [
              {
                id: 'name',
                name: 'AoE Name',
                desc: 'The name of the saved AreasOfEffect effect.',
                options: ['none', ...effectNames]
              },
              {
                id: 'direction',
                name: 'AoE Direction',
                desc: 'The direction of the AoE effect. Optional. If omitted, then the effect will be directed toward affected tokens. Format: ' + LBRACE + 'X,Y' + RBRACE
              }
            ]
          };
        }
      })(),

      // Requires KABOOM script by PaprikaCC (Bodin Punyaprateep).
      (() => {
        if(typeof KABOOM !== 'undefined')
          return {
            id: 'kaboom',
            name: 'KABOOM script',
            desc: 'An explosion/implosion generated by the trap with the KABOOM script by PaprikaCC.',
            value: (() => {
              let props = trapEffect.kaboom;
              if(props) {
                let result = props.power + ' ' + props.radius + ' ' + (props.type || 'default');
                if(props.scatter)
                  result += ' ' + 'scatter';
                return result;
              }
              else
                return 'None';
            })(),
            properties: [
              {
                id: 'power',
                name: 'Power',
                desc: 'The power of the KABOOM effect.'
              },
              {
                id: 'radius',
                name: 'Radius',
                desc: 'The radius of the KABOOM effect.'
              },
              {
                id: 'type',
                name: 'FX Type',
                desc: 'The type of element to use for the KABOOM FX.'
              },
              {
                id: 'scatter',
                name: 'Scatter',
                desc: 'Whether to apply scattering to tokens affected by the KABOOM effect.',
                options: ['no', 'yes']
              }
            ]
          };
      })(),

      // Requires the TokenMod script by The Aaron.
      (() => {
        if(typeof TokenMod !== 'undefined')
          return {
            id: 'tokenMod',
            name: 'TokenMod script',
            desc: 'Modify affected tokens with the TokenMod script by The Aaron.',
            value: trapEffect.tokenMod || '-'
          };
      })()
    ]);
  }

  /**
   * Gets a list of the core trap properties for a trap token dealing
   * with special side effects such as FX, sound, and API commands.
   * @param {Graphic} token
   * @return {object[]}
   */
  function getSpecialProperties(trapToken) {
    let trapEffect = (new TrapEffect(trapToken)).json;

    let LPAREN = '&#40;';
    let RPAREN = '&#41;';

    let LBRACE = '&#91;';
    let RBRACE = '&#93;';

    return _.compact([

    ]);
  }

  /**
   * Gets a list of the core trap properties for a trap token.
   * @param {Graphic} token
   * @return {object[]}
   */
  function getTriggerProperties(trapToken) {
    let trapEffect = (new TrapEffect(trapToken)).json;

    let LPAREN = '&#40;';
    let RPAREN = '&#41;';

    let LBRACE = '&#91;';
    let RBRACE = '&#93;';

    return [
      {
        id: 'triggerPaths',
        name: 'Trigger Area',
        desc: 'The trigger area for the trap. Characters that pass through this area will cause the trap to activate. To set paths, you must also select the paths that trigger the trap.',
        value: (() => {
          if (trapEffect.triggerPaths)
            return trapEffect.triggerPaths;
          else {
            if (trapToken.get('aura1_square'))
              return 'self - rectangle';
            else
              return 'self - circle';
          }
        })(),
        options: ['self - rectangle', 'self - circle', 'set selected lines']
      },
      {
        id: 'stopAt',
        name: 'Trigger Collision',
        desc: 'Does this trap stop tokens that pass through its trigger area?',
        value: (() => {
          let type = trapEffect.stopAt || 'center';
          if (type === 'center')
            return 'Move to center of trap token.';
          else if (type === 'edge')
            return 'Stop at edge of trigger area.';
          else
            return 'None';
        })(),
        options: ['center', 'edge', 'none']
      },
      {
        id: 'ignores',
        name: 'Ignore Token IDs',
        desc: 'Select one or more tokens to be ignored by this trap.',
        value: trapEffect.ignores || 'none',
        options: ['none', 'set selected tokens']
      },
      {
        id: 'flying',
        name: 'Affects Flying Tokens?',
        desc: 'Should this trap affect flying tokens ' + LPAREN + 'fluffy-wing status ' + RPAREN + '?',
        value: trapToken.get('status_fluffy-wing') ? 'yes' : 'no',
        options: ['yes', 'no']
      },
      {
        id: 'delay',
        name: 'Delay Activation',
        desc: 'When the trap is triggered, its effect is delayed for the specified number of seconds. For best results, also be sure to set an area effect for the trap and set the Stops Tokens At property of the trap to None.',
        value: (() => {
          if (trapEffect.delay)
            return trapEffect.delay + ' seconds';
          else
            return '-';
        })()
      }
    ];
  }

  /**
   * HTML-decodes a string.
   * @param {string} str
   * @return {string}
   */
  function _htmlDecode(str) {
    return str.replace(/#(\d+);/g, (match, code) => {
      return String.fromCharCode(code);
    });
  }

  /**
   * HTML-encodes a string, making it safe to use in chat-based action buttons.
   * @param {string} str
   * @return {string}
   */
  function _htmlEncode(str) {
    return str.replace(/[{}()\[\]<>!@#$%^&*\/\\'"+=,.?]/g, match => {
      let charCode = match.charCodeAt(0);
      return `#${charCode};`;
    });
  }

  /**
   * Changes a property for a trap.
   * @param {Graphic} trapToken
   * @param {Array} argv
   * @param {(Graphic|Path)[]} selected
   */
  function modifyTrapProperty(trapToken, argv, selected) {
    let trapEffect = (new TrapEffect(trapToken)).json;

    let prop = argv[0];
    let params = argv.slice(1);

    if(prop === 'name')
      trapToken.set('name', params[0]);
    if(prop === 'type')
      trapEffect.type = params[0];
    if(prop === 'api') {
      if(params[0])
        trapEffect.api = params[0].split(";;");
      else
        trapEffect.api = [];
    }
    if(prop === 'areaOfEffect') {
      if(params[0] && params[0] !== 'none') {
        trapEffect.areaOfEffect = {};
        trapEffect.areaOfEffect.name = params[0];
        try {
          trapEffect.areaOfEffect.direction = JSON.parse(params[1]);
        } catch(err) {}
      }
      else
        trapEffect.areaOfEffect = undefined;
    }
    if(prop === 'delay')
      trapEffect.delay = params[0] || undefined;
    if(prop === 'destroyable')
      trapEffect.destroyable = params[0] === 'yes';
    if(prop === 'disabled')
      trapToken.set('status_interdiction', params[0] === 'yes');

    if(prop === 'effectDistance')
      trapToken.set('aura1_radius', parseInt(params[0]) || '');

    if(prop === 'effectShape') {
      if (params[0] === 'self') {
        trapEffect.effectShape = 'self';
        trapToken.set('aura1_radius', '');
      }
      else if (params[0] === 'burst') {
        trapEffect.effectShape = 'burst';
        trapToken.set('aura1_radius', 10);
      }
      else if(params[0] === 'set selected shapes' && selected) {
        trapEffect.effectShape = _.map(selected, path => {
          return path.get('_id');
        });
        trapToken.set('aura1_radius', '');
      }
      else
        throw Error('Unexpected effectShape value: ' + params[0]);
    }
    if(prop === 'flying')
      trapToken.set('status_fluffy-wing', params[0] === 'yes');
    if(prop === 'fx') {
      if(params[0]) {
        trapEffect.fx = {};
        trapEffect.fx.name = params[0];
        try {
          trapEffect.fx.offset = JSON.parse(params[1]);
        }
        catch(err) {}
        try {
          trapEffect.fx.direction = JSON.parse(params[2]);
        }
        catch(err) {}
      }
      else
        trapEffect.fx = undefined;
    }
    if(prop === 'gmOnly')
      trapEffect.gmOnly = params[0] === 'yes';
    if(prop === 'ignores')
      if(params[0] === 'set selected tokens' && selected)
        trapEffect.ignores = _.map(selected, token => {
          return token.get('_id');
        });
      else
        trapEffect.ignores = undefined;
    if(prop === 'kaboom')
      if(params[0])
        trapEffect.kaboom = {
          power: parseInt(params[0]),
          radius: parseInt(params[1]),
          type: params[2] || undefined,
          scatter: params[3] === 'yes'
        };
      else
        trapEffect.kaboom = undefined;
    if(prop === 'message')
      trapEffect.message = params[0];
    if(prop === 'notes')
      trapEffect.notes = params[0];

    if (prop === 'revealOpts') {
      trapToken.set('status_bleeding-eye', params[0] === 'yes');
      trapEffect.revealWhenSpotted = params[1] === 'yes';
      trapEffect.revealLayer = params[2];
    }

    if(prop === 'searchDist')
      trapToken.set('aura2_radius', parseInt(params[0]) || '');
    if(prop === 'sound')
      trapEffect.sound = _htmlDecode(params[0]);
    if(prop === 'stopAt')
      trapEffect.stopAt = params[0];
    if(prop === 'tokenMod')
      trapEffect.tokenMod = params[0];
    if(prop === 'triggers') {
      if (params[0] === 'set selected traps' && selected) {
        trapEffect.triggers = _.map(selected, token => {
          let tokenId = token.get('_id');
          if (tokenId !== trapToken.get('_id'))
            return token.get('_id');
        });
      }
      else
        trapEffect.triggers = undefined;
    }
    if(prop === 'triggerPaths') {
      if (params[0] === 'self - circle') {
        trapEffect.triggerPaths = undefined;
        trapToken.set('aura1_square', false);
      }
      else if (params[0] === 'self - rectangle') {
        trapEffect.triggerPaths = undefined;
        trapToken.set('aura1_square', true);
      }
      else if (params[0] === 'set selected lines' && selected) {
        trapEffect.triggerPaths = _.map(selected, path => {
          return path.get('_id');
        });
        trapToken.set('aura1_square', false);
      }
      else {
        trapEffect.triggerPaths = undefined;
        trapToken.set('aura1_square', false);
      }
    }

    trapToken.set('gmnotes', JSON.stringify(trapEffect));
  }

  /**
   * Displays one of the script's menus.
   * @param {string} header
   * @param {(string|HtmlBuilder)} content
   * @return {HtmlBuilder}
   */
  function _showMenuPanel(header, content) {
    let menu = new HtmlBuilder('.menu');
    menu.append('.menuHeader', header);
    menu.append('.menuBody', content);
    return menu;
  }

  /**
   * @private
   * Whispers a Marching Order message to someone.
   */
  function _whisper(who, msg) {
    sendChat('Its A Trap! script', '/w "' + _fixWho(who) + '" ' + msg);
  }

  on('ready', () => {
    // Delete the 3.9.4 version of the macro.
    let oldMacros = findObjs({
      _type: 'macro',
      name: 'ItsATrap_trapCreationWizard'
    });
    if (oldMacros.length > 0) {
      sendChat(`It's A Trap! script`, `<h2>Notice: It's A Trap v3.10</h2>` +
        `<p>The old It's A Trap macro has been replaced with a shorter ` +
        `version named "TrapMaker". Please re-enable it on your macro ` +
        `settings. By popular demand, it no longer appears as a token ` + `action.</p> ` +
        `<p>Please note that some of the trap menu properties have ` +
        `been regrouped or condensed together in order to present a cleaner ` +
        `and hopefully more intuitive interface. This should have no effect ` +
        `on your existing traps. They should work just as they did before ` +
        `this update.</p>` +
        `<p>Please read the script's updated documentation for more ` +
        `details.</p>`);
    }
    _.each(oldMacros, macro => {
      macro.remove();
    });

    // Create the 3.10 version of the macro.
    let macro = findObjs({
      _type: 'macro',
      name: 'TrapMaker'
    })[0];
    if(!macro) {
      let players = findObjs({
        _type: 'player'
      });
      let gms = _.filter(players, player => {
        return playerIsGM(player.get('_id'));
      });

      _.each(gms, gm => {
        createObj('macro', {
          _playerid: gm.get('_id'),
          name: 'TrapMaker',
          action: DISPLAY_WIZARD_CMD
        });
      });
    }
  });

  on('chat:message', msg => {
    try {
      // Get the selected tokens/paths if any.
      let selected;
      if(msg.selected) {
        selected = _.map(msg.selected, sel => {
          return getObj(sel._type, sel._id);
        });
      }

      if(msg.content.startsWith(DISPLAY_WIZARD_CMD)) {
        let trapToken = getObj('graphic', msg.selected[0]._id);
        displayWizard(msg.who, msg.playerId, trapToken);
      }
      if(msg.content.startsWith(MODIFY_CORE_PROPERTY_CMD)) {
        let params = msg.content.replace(MODIFY_CORE_PROPERTY_CMD + ' ', '').split('&&');
        modifyTrapProperty(curTrap, params, selected);
        displayWizard(msg.who, msg.playerId, curTrap);
      }
      if(msg.content.startsWith(MODIFY_THEME_PROPERTY_CMD)) {
        let params = msg.content.replace(MODIFY_THEME_PROPERTY_CMD + ' ', '').split('&&');
        let theme = ItsATrap.getTheme();
        theme.modifyTrapProperty(curTrap, params, selected);
        displayWizard(msg.who, msg.playerId, curTrap);
      }
    }
    catch(err) {
      log('ItsATrapCreationWizard: ' + err.message);
      log(err.stack);
    }
  });

  return {
    displayWizard,
    DISPLAY_WIZARD_CMD,
    MODIFY_CORE_PROPERTY_CMD,
    MODIFY_THEME_PROPERTY_CMD
  };
})();
