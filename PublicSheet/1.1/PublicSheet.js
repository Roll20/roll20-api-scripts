// PublicSheet v1.1
// Maintain public read-only copies of character sheets
/* global state, findObjs, getObj, globalconfig, log, playerIsGM, createObj, sendChat, on */

const PublicSheet = (() => {
  "use strict";
  const version = '1.1',
    linkStyle = 'style="color:black;background:#fff;border:1px solid black;padding:2px;font-weight:bold"';

  // Init
  const checkInstall = () => {
    // Initialise, cleanup, and log message
    if (!state.PublicSheet || state.PublicSheet.lastVersion === 1.0) {
      state.PublicSheet = {
        data: {},
        globalconfigCache: {
          lastsaved: 0
        },
        lastVersion: version,
        namePattern: '(Public) NAME',
        unsynced: [],
        onlyShowControlled: false,
        controlledByAll: false,
      };
    }
    else if (state.PublicSheet.lastVersion === '1.0') {
      state.PublicSheet.unsynced = [];
      state.PublicSheet.onlyShowControlled = false;
      state.PublicSheet.lastVersion = '1.1';
    }
    else Object.entries(state.PublicSheet.data).forEach(([master, slave]) => {
      if (!getObj('character', master) || !getObj('character', slave)) delete state.PublicSheet.data[master];
    });
    log(`-=> PublicSheet v${version} <=-`);
    checkGlobalConfig();
  };
  const checkGlobalConfig = () => {
    // Deal with global config options

    const s = state.PublicSheet,
      g = globalconfig && globalconfig.publicsheet;
    if (g && g.lastsaved && g.lastsaved > s.globalconfigCache.lastsaved) {
      log(` > Updating PublicSheet from Global Config < [${(new Date(g.lastsaved * 1000))}]`);
      s.namePattern = g['Public name pattern'] || '(Public) NAME';
      s.unsynced = (g['Non-synchronized attributes'] || '').split(',').map(x => x.trim());
      s.onlyShowControlled = '1' === g['Only show characters controlled by a player'];
      s.controlledByAll = '1' === g['Public characters are controlled by all players'];
      s.globalconfigCache = globalconfig.publicsheet;
    }
  };

  // Utility/Workhorse functions
  const getSlaveMaster = id => {
    // Return slave/master pair in state corresponding to ID (if applicable)

    const slaveInfo = Object.entries(state.PublicSheet.data).find(([_,s]) => s === id);
    if (slaveInfo)
      return {
        master: slaveInfo[0],
        slave: id,
        type: 'slave',
      };
    else if (id in state.PublicSheet.data)
      return {
        master: id,
        slave: state.PublicSheet.data[id],
        type: 'master',
      };
    else return {
      type: null
    };
  };
  const setupSlave = masterID => {
    // Initial creation of slave character

    const slave = createObj('character', {});
    setSlaveProperties(masterID, slave.id);
    syncAttrs(masterID, slave.id);
    return slave.id;
  };
  const syncAttrs = (masterID, slaveID) => {
    // Copy all attributes from master to slave

    // delete slave attrs if present
    findObjs({
      _characterid: slaveID,
      _type: 'attribute',
    }).forEach(attr => attr.remove());

    // create all slave attrs from master attrs
    findObjs({
      _characterid: masterID,
      _type: 'attribute',
    }).forEach(attr => {
      createObj('attribute', {
        _characterid: slaveID,
        current: attr.get('current'),
        max: attr.get('max'),
        name: attr.get('name'),
      });
    });
  };
  const setSlaveProperties = (masterID, slaveID) => {
    // Copy character properties (not attributes!) from master to slave

    const master = getObj('character', masterID),
      slave = getObj('character', slaveID);
    if (!master || !slave) return;
    const controllers = master.get('controlledby'),
      targetIDs = state.PublicSheet.controlledByAll ? 'all' : findObjs({ _type: 'player' })
        .map(p => p.id)
        .filter(id => !controllers.includes(id))
        .filter(id => !playerIsGM(id))
        .join(',');

    master.get('bio', bio => {
      master.get('gmnotes', gmnotes => {
        slave.set('bio', bio === 'null' ? '' : bio);
        slave.set('gmnotes', gmnotes === 'null' ? '' : gmnotes);
        slave.set({
          avatar: master.get('avatar'),
          controlledby: targetIDs,
          inplayerjournals: targetIDs,
          name: state.PublicSheet.namePattern.replace('NAME', master.get('name')),
        });
      });
    });
  };
  const setSlaveAttribute = (slaveID, masterAttr) => {
    // Utility function: sets slaveID's attribute corresponding to given master attribute

    if (!masterAttr) return;
    const slaveAttrs = findObjs({
      _type: 'attribute',
      _characterid: slaveID,
      name: masterAttr.get('name'),
    }, {caseInsensitive: true});

    // cleanup extra attributes
    slaveAttrs.slice(1).forEach(attr => attr.remove());

    if (slaveAttrs.length) slaveAttrs[0].set({
      current: masterAttr.get('current'),
      max: masterAttr.get('max'),
    });
    else createObj('attribute', {
      _characterid: slaveID,
      current: masterAttr.get('current'),
      max: masterAttr.get('max'),
      name: masterAttr.get('name'),
    });
  };

  // Chat
  const htmlReplace = str => {
    const entities = {
      '<': 'lt',
      '>': 'gt',
      "'": '#39',
      '@': '#64',
      '{': '#123',
      '|': '#124',
      '}': '#125',
      '[': '#91',
      '"': 'quot',
      ']': '#93',
      '*': '#42',
      ',': '#44',
    };
    return str.replace(/[<>'"@{|}[*\]]/g, c => ('&' + entities[c] + ';'));
  };
  const getCharSelectorMenu = (command, caption) => {
    // Shows a button to playerid to choose a character to execute command on

    const charList = findObjs({ _type: 'character' })
      .filter(x => !(getSlaveMaster(x.id).type))
      .filter(x => !state.PublicSheet.onlyShowControlled || x.get('controlledby'))
      .map(x => [x.get('name'), x.id])
      .sort((a,b) => {
        if (a[0].toLowerCase() < b[0].toLowerCase()) return -1;
        if (a[0].toLowerCase() > b[0].toLowerCase()) return 1;
        else return 0;
      })
      .map(([name, id]) => `${htmlReplace(name)},${id}`)
      .join('|');
    return `<a ${linkStyle} href="!publicsheet ${command} ?${htmlReplace('{')}Character?|${charList}${htmlReplace('}')}">${caption}</a>`;
  };
  const getOverview = () => {
    // Generate list of active public characters & buttons

    const charRows = Object.keys(state.PublicSheet.data).map(master => {
      return `<tr><td>${getObj('character', master).get('name')}</td>` +
        `<td><a ${linkStyle} href="!publicsheet sync ${master}">Force Sync</a></td>` +
        `<td><a ${linkStyle} href="!publicsheet remove ${master}">Remove</a></td></tr>`;
    }).join('');
    const output = `<h3>Public characters</h3>` +
      `<table style="width:100%;margin:0 0 5px">${charRows}</table>` +
      `<div>${getCharSelectorMenu('add', 'Add character')}</div>`;
    return output;
  };
  const sendMessage = (playerid, output) => {
    // sendChat wrapper to send nice boxed chat messages

    const message = output.map(m => `/w "${(getObj('player', playerid) || {get: () => 'GM'}).get('displayname')}" ` +
      `<div style="border-radius:5px;background:#fff;border:1px solid;padding:4px">${m}</div>`).join('\n');
    sendChat('PublicSheet', message, null, {noarchive: true});
  };

  // Event handlers
  const handleCharChange = char => {
    // Force slave character properties to be the same as master's

    const {master, slave, type} = getSlaveMaster(char.id);
    if (type === 'master') setSlaveProperties(master, slave);
  };
  const handleCharDelete = oldChar => {
    // Slave: delete slave from state
    // Master: delete corresponding slave and remove from state

    const {slave, master, type} = getSlaveMaster(oldChar.id);
    if (type === 'slave') delete state.PublicSheet.data[master];
    else if (type === 'master') {
      getObj('character', slave).remove();
      delete state.PublicSheet.data[master];
    }
  };
  const handleAttrChange = (attr, oldAttr) => {
    // Slave: reset to previous value
    // Master: propagate change to slave

    if (state.PublicSheet.unsynced.includes(attr.get('name').toLowerCase())) return;
    const {slave, type} = getSlaveMaster(attr.get('_characterid'));
    if (type === 'slave') attr.set({
      current: oldAttr.current,
      max: oldAttr.max,
      name: oldAttr.name,
    });
    else if (type === 'master') setSlaveAttribute(slave, attr);
  };
  const handleAttrCreate = attr => {
    // Slave: cannot create any attributes on its own
    // Master: copy created attribute to slave

    const {slave, type} = getSlaveMaster(attr.get('_characterid'));
    if (type === 'slave') attr.remove();
    else if (type === 'master') setSlaveAttribute(slave, attr);
  };
  const handleAttrDelete = oldAttr => {
    // Slave: recreate attribute
    // Master: remove corresponding slave attributes

    const {master, slave, type} = getSlaveMaster(oldAttr.get('_characterid'));
    if (type === 'slave') {
      setTimeout(() => {
        if (getObj('character', slave)) {
          const masterAttr = findObjs({
            _type: 'attribute',
            _characterid: master,
            name: oldAttr.get('name'),
          }, {caseInsensitive: true})[0];
          setSlaveAttribute(slave, masterAttr);
        }
      }, 1000);
    }
    else if (type === 'master') {
      findObjs({
        _type: 'attribute',
        _characterid: slave,
        name: oldAttr.get('name'),
      }, {caseInsensitive: true}).forEach(attr => attr.remove());
    }
  };
  const handleInput = msg => {
    // Handle chat messages

    if (msg.type !== 'api' || !('content' in msg) || msg.content.indexOf('!publicsheet') !== 0) return;

    const args = msg.content.split(' ').slice(1),
      id = args[1],
      {master, slave, type} = getSlaveMaster(id),
      output = [];

    if (playerIsGM(msg.playerid)) {
      switch(args.shift()) {
        case 'add':
          if (type === 'master')
            output.push(`Character ${getObj('character', master).get('name')} already has a public version.`);
          else if (type === 'slave')
            output.push(`Character ${getObj('character', slave).get('name')} is already the public version` +
              `of ${getObj('character', master).get('name')}.`);
          else if (getObj('character', id)) {
            state.PublicSheet.data[id] = setupSlave(id);
            output.push(`Public version of character ${getObj('character', id).get('name')} added.`);
            output.push(getOverview());
          }
          else output.push(`No character with id ${id} found.`);
          break;
        case 'remove':
          if (type) {
            delete state.PublicSheet.data[master];
            if (getObj('character', slave)) getObj('character', slave).remove();
            output.push(`Public version of character ${getObj('character', master).get('name')} removed.`);
            output.push(getOverview());
          }
          else if (getObj('character', id))
            output.push(`It seems that the character ${getObj('character', id).get('name')} does not have a public version.`);
          else output.push(`No character with id ${id} found.`);
          break;
        case 'sync':
          if (type) {
            syncAttrs(master, slave);
            setSlaveProperties(master, slave);
          }
          else if (getObj('character', id))
            output.push(`It seems that the character ${getObj('character', id).get('name')} does not have a public version.`);
          else output.push(`No character with id ${id} found.`);
          break;
        case 'config':
          switch(args.shift()) {
            case 'publicname':
              if (args[0]) {
                state.PublicSheet.namePattern = args.join(' ');
                output.push(`Public version of characters will now be named "${args.join(' ')}".`);
                Object.entries(state.PublicSheet.data).forEach(([master, slave]) => setSlaveProperties(master, slave));
              }
              else output.push('Public name cannot be blank.');
              break;
            case 'unsynced':
              state.PublicSheet.unsynced = args.join(' ').toLowerCase().split(',').map(x => x.trim());
              output.push(`List of non-synced attributes is now "${args.join(' ').toLowerCase() || 'empty'}".`);
              break;
            case 'onlyshowcontrolled':
              state.PublicSheet.onlyShowControlled = ['true', '1', 'yes', 'on'].includes(args[0]);
              output.push(state.PublicSheet.onlyShowControlled ? 'Only player-controlled characters will be offered.' : 'All characters will be offered.');
              break;
            case 'controlledbyall':
              state.PublicSheet.controlledByAll = ['true', '1', 'yes', 'on'].includes(args[0]);
              output.push(state.PublicSheet.controlledByAll ? 'Public characters are now controlled by all players.' : 'Public characters are now controlled only by players who do not control the original character.');
              Object.entries(state.PublicSheet.data).forEach(([master, slave]) => setSlaveProperties(master, slave));
              break;
            default:
              output.push(`Name pattern: ${state.PublicSheet.namePattern}.\nNon-synced attributes: ${state.PublicSheet.unsynced}`);
          }
          break;
        default:
          output.push(getOverview());
      }
    }
    else output.push(`It seems that you are not a GM. Permission denied.`);
    sendMessage(msg.playerid, output);
  };

  // register events
  const registerEventHandlers = () => {
    on('chat:message', handleInput);
    on('change:character', handleCharChange);
    on('destroy:character', handleCharDelete);
    on('add:attribute', handleAttrCreate);
    on('change:attribute', handleAttrChange);
    on('destroy:attribute', handleAttrDelete);
  };

  return {
    checkInstall, registerEventHandlers
  };
})();

on('ready', () => {
  PublicSheet.checkInstall();
  PublicSheet.registerEventHandlers();
});
