(() => {
  'use strict';

  const CMD_MODIFY_CONFIG = '!hexploration_configModifyProperty';
  const CMD_MODIFY_HEX = '!hexploration_hexModifyProperty';

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

  /**
   * Get the menu data for the current configuration properties.
   */
  function _getConfigProps() {
    let config = Hexploration._state.getState().config;
    return [
      {
        id: 'color',
        name: 'Hex Color',
        desc: 'The fill and stroke colors for the hexes.',
        value: `<div style="background: ${config.strokeColor}; width: 40px; height: 40px;"><div style="display: inline-block; margin: 4px; background: ${config.fillColor}; width: 32px; height: 32px; vertical-align: middle; color: ${config.labelColor}; line-height: 32px;">Label</div></div>`,
        properties: [
          {
            id: 'fillColor',
            name: 'Fill Color',
            desc: 'The hex fill color.'
          },
          {
            id: 'strokeColor',
            name: 'Border Color',
            desc: 'The hex border color.'
          },
          {
            id: 'labelColor',
            name: 'Label Color',
            desc: 'The label color'
          }
        ]
      },
      {
        id: 'strokeWidth',
        name: 'Border Width',
        desc: 'The width of the hexes\' border outlines.',
        value: config.strokeWidth || '0'
      },
      {
        id: 'maxDistance',
        name: 'Hex Reveal Distance',
        desc: 'Hexes being drawn will only be revealed if you are within this distance, in hex units.',
        value: (() => {
          if(config.maxDistance >= 0)
            return '' + config.maxDistance;
          else
            return '-';
        })()
      },
      {
        id: 'revealDistance',
        name: 'Line of Sight',
        desc: 'When you move, hexes this many units from your position will be revealed.',
        value: config.revealDistance || '0'
      }
    ];
  }

  /**
   * Modifies the persisted data for a hex with the given parameters.
   * @param {Path} path
   *        The Path representing the hex.
   * @param {string[]} argv
   *        The first element is the name of the property.
   *        The rest of the elements are the parameters used to modify it.
   */
  function _modifyHex(path, argv) {
    let prop = argv[0];
    let params = argv.slice(1);

    if(prop === 'name') {
      Hexploration._locations.setHexName(path, params[0]);
    }
  }

  /**
   * Modifies a configuration with the given parameters.
   * @param {string[]} argv
   *        The first element is the name of the configuration property.
   *        The rest of the elements are the parameters used to modify it.
   */
  function _modifyConfig(argv) {
    let config = Hexploration._state.getConfig();
    let prop = argv[0];
    let params = argv.slice(1);

    if(prop === 'color') {
      config.fillColor = params[0] || 'black';
      config.strokeColor = params[1] || 'transparent';
      config.labelColor = params[2] || 'white';
    }
    if(prop === 'strokeWidth')
      config.strokeWidth = parseInt(params[0]) || 0;
    if(prop === 'maxDistance') {
      let value = parseInt(params[0]);
      if(value >= 0)
        config.maxDistance = value;
      else
        config.maxDistance = undefined;
    }
    if(prop === 'revealDistance')
      config.revealDistance = parseInt(params[0]) || 0;

    showMain();
  }

  /**
   * Displays a stylized announcement in the chat that
   */
  function showDiscovery(name, imgsrc) {
    let menu = new HtmlBuilder('.menu');
    menu.append('.menuHeader', 'Discovered Location');
    if(imgsrc)
      menu.append('.menuBody', `<img src='${imgsrc}' style='height: 32px; width: 32px;'><h4>${name}</h4>`);
    else
      menu.append('.menuBody', `<h4>${name}</h4>`);
    Hexploration._chat.broadcast(menu.toString(MENU_CSS));
  }

  /**
   * Shows the script's main menu.
   */
  function showMain() {
    let content = new HtmlBuilder('div');

    content.append('h4', 'Configs');
    let configProps = _getConfigProps();
    let table = content.append('table', undefined, {
      style: {
        'margin-left': 'auto',
        'margin-right': 'auto'
      }
    });
    _.each(configProps, prop => {
      let tr = table.append('tr', undefined, {
        title: prop.desc
      });

      let params = [];
      let paramProperties = prop.properties || [prop];
      _.each(paramProperties, item => {
        let options = '';
        if(item.options)
          options = '|' + item.options.join('|');
        params.push(`?{${item.name}: ${item.desc} ${options}}`);
      });

      tr.append('td', `[${prop.name}](${CMD_MODIFY_CONFIG} ${prop.id}&&${params.join('&&')})`, {
        style: { 'font-size': '0.8em' }
      });

      tr.append('td', `${prop.value || ''}`, {
        style: { 'font-size': '0.8em' }
      });
    });

    content.append('h4', 'Actions', {
      style: { 'margin-top': '1em' }
    });
    content.append('div', `[Fill Polygon](${Hexploration.CMD_FILL})`, {
      title: 'Fill the selected polygons with hexes.'
    });
    content.append('div', `[Inverse Fill](${Hexploration.CMD_FILL_INVERSE})`, {
      title: 'Fill the whole page with hexes, except within the selected polygons.'
    });
    content.append('div', `[Name Hex](${CMD_MODIFY_HEX} name&&?{Pick name})`, {
      title: 'Set a name for a hex. When the hex is revealed, ' +
        'it will declare in the chat that is was discovered.'
    });

    _showMenu('Hexploration Menu', content);
  }

  /**
   * Displays a stylized menu in the chat, whispered to the GM.
   * @param {string} title
   *        The title displayed in the menu header.
   * @param {string} content
   *        The menu's HTML contents.
   */
  function _showMenu(title, content) {
    let menu = new HtmlBuilder('.menu');
    menu.append('.menuHeader', title);
    menu.append('.menuBody', content);
    Hexploration._chat.whisper(menu.toString(MENU_CSS));
  }

  on('chat:message', msg => {
    try {
      if(msg.type !== 'api')
        return;

      let argv = msg.content.split(' ');
      if(argv[0] === CMD_MODIFY_CONFIG) {
        let params = msg.content.replace(CMD_MODIFY_CONFIG + ' ', '').split('&&');
        _modifyConfig(params);
      }
      if(argv[0] === CMD_MODIFY_HEX) {
        if(msg.selected && msg.selected.length === 1) {
          let path = getObj('path', msg.selected[0]._id);
          let params = msg.content.replace(CMD_MODIFY_HEX + ' ', '').split('&&');
          _modifyHex(path, params);
        }
        else
          throw new Error('You must select one hex to be named.');
      }
    }
    catch(err) {
      Hexploration._chat.error(err);
    }
  });

  _.extend(Hexploration, {
    _menus: {
      showDiscovery,
      showMain
    }
  });
})();
