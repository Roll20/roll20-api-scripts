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

    // Shape properties
    content.append('h4', 'Shape properties', {
      style: { 'margin-top' : '2em' }
    });
    let shapeProperties = getShapeProperties(trapToken);
    content.append(_displayWizardProperties(MODIFY_CORE_PROPERTY_CMD, shapeProperties));

    // Trigger properties
    content.append('h4', 'Trigger properties', {
      style: { 'margin-top' : '2em' }
    });
    let triggerProperties = getTriggerProperties(trapToken);
    content.append(_displayWizardProperties(MODIFY_CORE_PROPERTY_CMD, triggerProperties));

    // Reveal properties
    content.append('h4', 'Reveal properties', {
      style: { 'margin-top' : '2em' }
    });
    let revealProperties = getRevealProperties(trapToken);
    content.append(_displayWizardProperties(MODIFY_CORE_PROPERTY_CMD, revealProperties));

    // Special properties
    let specialProperties = getSpecialProperties(trapToken);
    if (specialProperties.length > 0) {
      content.append('h4', 'Special properties', {
        style: { 'margin-top' : '2em' }
      });
      content.append(_displayWizardProperties(MODIFY_CORE_PROPERTY_CMD, specialProperties));
    }

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
        style: { 'font-size': '0.8em' }
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
    let trapEffect = (new TrapEffect(trapToken)).json;

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
        name: 'Disabled',
        desc: 'A disabled trap will not activate when triggered, but can still be spotted with passive perception.',
        value: trapToken.get('status_interdiction') ? 'yes' : 'no',
        options: ['yes', 'no']
      },
      {
        id: 'gmOnly',
        name: 'GM Only',
        desc: 'When the trap is activated, should its results only be displayed to the GM?',
        value: trapEffect.gmOnly ? 'yes' : 'no',
        options: ['yes', 'no']
      },
      {
        id: 'notes',
        name: 'GM Notes',
        desc: 'Additional secret notes shown only to the GM when the trap is activated.',
        value: trapEffect.notes || '-'
      },
      {
        id: 'destroyable',
        name: 'Destroyable',
        desc: 'Whether to delete the trap after it is activated.',
        value: trapEffect.destroyable ? 'yes': 'no',
        options: ['yes', 'no']
      }
    ];
  }

  /**
   * Produces JSON for default trap properties.
   * @return {string}
   */
  function getDefaultJson() {
    return JSON.stringify({
      effectShape: 'rectangle',
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
        value: trapToken.get('aura2_radius') || trapEffect.searchDist || '-'
      },
      {
        id: 'revealToPlayers',
        name: 'When Activated',
        desc: 'Should this trap be revealed to the players when it is activated?',
        value: trapToken.get('status_bleeding-eye') ? 'yes' : 'no',
        options: ['yes', 'no']
      },
      {
        id: 'revealWhenSpotted',
        name: 'When Spotted',
        desc: 'Should this trap be revealed to the players when a character notices it by passive searching?',
        value: trapEffect.revealWhenSpotted ? 'yes' : 'no',
        options: ['yes', 'no']
      },
      {
        id: 'revealLayer',
        name: 'Layer',
        desc: 'When this trap is revealed, which layer is it revealed on?',
        value: trapEffect.revealLayer || 'map',
        options: ['map', 'objects']
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
    let trapEffect = (new TrapEffect(trapToken)).json;

    let LPAREN = '&#40;';
    let RPAREN = '&#41;';

    let LBRACE = '&#91;';
    let RBRACE = '&#93;';

    return [
      {
        id: 'flying',
        name: 'Affects Flying Tokens',
        desc: 'Should this trap affect flying tokens ' + LPAREN + 'fluffy-wing status ' + RPAREN + '?',
        value: trapToken.get('status_fluffy-wing') ? 'yes' : 'no',
        options: ['yes', 'no']
      },
      {
        id: 'effectDistance',
        name: 'Blast distance',
        desc: 'How far away can the trap affect other tokens?',
        value: trapToken.get('aura1_radius') || '-'
      },
      {
        id: 'stopAt',
        name: 'Stops Tokens At',
        desc: 'Does this trap stop tokens that pass through its trigger area?',
        value: trapEffect.stopAt || 'center',
        options: ['center', 'edge', 'none']
      },
      {
        id: 'effectShape',
        name: 'Trap shape',
        desc: 'To set paths, you must also select one or more paths defining the trap\'s blast area. A fill color must be set for tokens inside the path to be affected.',
        value: trapEffect.effectShape || ' circle',
        options: [ 'circle', 'rectangle', 'set selected paths', 'add selected paths', 'remove selected paths']
      },
    ];
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
      }
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
        name: 'Set Trigger',
        desc: 'To set paths, you must also select the paths that trigger the trap.',
        value: trapEffect.triggerPaths || 'self',
        options: ['self', 'set selected paths', 'add selected paths', 'remove selected paths']
      },
      {
        id: 'triggers',
        name: 'Other Traps Triggered',
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
        options: ['none', 'set selected traps', 'add selected traps', 'remove selected traps']
      },
      {
        id: 'ignores',
        name: 'Ignore Tokens',
        desc: 'Select one or more tokens to be ignored by this trap.',
        value: trapEffect.ignores || 'none',
        options: ['none', 'set selected tokens', 'add selected tokens', 'remove selected tokens']
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
      trapToken.set('aura1_radius', parseInt(params[0]));
    if(prop === 'effectShape') {
      if(['circle', 'square', 'rectangle'].includes(params[0])) {
        trapEffect.effectShape = params[0];
        trapToken.set('aura1_square',
          params[0].includes('square') || params[0].includes('rectangle'));
      }
      else if(params[0] === 'set selected paths' && selected) {
        trapEffect.effectShape = _.map(selected, path => {
          return path.get('_id');
        });
        trapToken.set('aura1_square', false);
      }
      else if(params[0] === 'add selected paths' && selected) {
        if(!_.isArray(trapEffect.effectShape))
          trapEffect.effectShape = [];

        trapEffect.effectShape = trapEffect.effectShape
        .concat(_.map(selected, path => {
          return path.get('_id');
        }));
        trapToken.set('aura1_square', false);
      }
      else if(params[0] === 'remove selected paths' && selected) {
        if(!_.isArray(trapEffect.effectShape))
          trapEffect.effectShape = [];

        let selectedIds = _.map(selected, token => {
          return token.get('_id');
        });
        trapEffect.effectShape = _.reject(trapEffect.effectShape, id => {
          return selectedIds.includes(id);
        });
        trapToken.set('aura1_square', false);
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
      else if(params[0] === 'add selected tokens' && selected) {
        if(!_.isArray(trapEffect.ignores))
          trapEffect.ignores = [];

        trapEffect.ignores = trapEffect.ignores
        .concat(_.map(selected, token => {
          return token.get('_id');
        }));
      }
      else if(params[0] === 'remove selected tokens' && selected) {
        if(!_.isArray(trapEffect.ignores))
          trapEffect.ignores = [];

        let selectedIds = _.map(selected, token => {
          return token.get('_id');
        });
        trapEffect.ignores = _.reject(trapEffect.ignores, id => {
          return selectedIds.includes(id);
        });
      }
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
    if(prop === 'revealLayer')
      trapEffect.revealLayer = params[0];
    if(prop === 'revealToPlayers')
      trapToken.set('status_bleeding-eye', params[0] === 'yes');
    if(prop === 'revealWhenSpotted')
      trapEffect.revealWhenSpotted = params[0] === 'yes';
    if(prop === 'searchDist')
      trapToken.set('aura2_radius', parseInt(params[0]));
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
      else if (params[0] === 'add selected traps') {
        if (!_.isArray(trapEffect.triggers))
          trapEffect.triggers = [];

        trapEffect.triggers = trapEffect.triggers
        .concat(_.map(selected, token => {
          let tokenId = token.get('_id');
          if (tokenId !== trapToken.get('_id'))
            return token.get('_id');
        }));
      }
      else if (params[0] === 'remove selected traps') {
        if (!_.isArray(trapEffect.triggers))
          trapEffect.triggers = [];

        let selectedIds = _.map(selected, path => {
          return path.get('_id');
        });

        trapEffect.triggers = _.reject(trapEffect.triggers, id => {
          return selectedIds.includes(id);
        });
      }
      else
        trapEffect.triggers = undefined;
    }
    if(prop === 'triggerPaths')
      if(params[0] === 'set selected paths' && selected)
        trapEffect.triggerPaths = _.map(selected, path => {
          return path.get('_id');
        });
      else if(params[0] === 'add selected paths' && selected) {
        if(!_.isArray(trapEffect.triggerPaths))
          trapEffect.triggerPaths = [];

        trapEffect.triggerPaths = trapEffect.triggerPaths
        .concat(_.map(selected, path => {
          return path.get('_id');
        }));
      }
      else if(params[0] === 'remove selected paths' && selected) {
        if(!_.isArray(trapEffect.triggerPaths))
          trapEffect.triggerPaths = [];

        let selectedIds = _.map(selected, path => {
          return path.get('_id');
        });

        trapEffect.triggerPaths = _.reject(trapEffect.triggerPaths, id => {
          return selectedIds.includes(id);
        });
      }
      else
        trapEffect.triggerPaths = undefined;

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
    let macro = findObjs({
      _type: 'macro',
      name: 'ItsATrap_trapCreationWizard'
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
          name: 'ItsATrap_trapCreationWizard',
          action: DISPLAY_WIZARD_CMD,
          istokenaction: true
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
