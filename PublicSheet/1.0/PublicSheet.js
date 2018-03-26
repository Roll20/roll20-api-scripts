// PublicSheet v1.0
// Maintain public read-only copies of character sheets

const PublicSheet = (() => {
  "use strict";
  const version = "1.0",
    linkStyle = 'style="color:black;background:#fff;border:1px solid black;padding:2px;font-weight:bold"';

  // Init
  const checkInstall = () => {
    // Initialise, cleanup, and log message
    if (!state.PublicSheet) {
      state.PublicSheet = {
        data: [],
        globalconfigCache: {
          lastsaved: 0
        },
        lastVersion: version,
        namePattern: '(Public) NAME',
      };
    }
    else if (state.PublicSheet.lastVersion === 1.0) {
      state.PublicSheet.namePattern = '(Public) NAME';
      state.PublicSheet.globalconfigCache = {
        lastsaved: 0
      };
      state.PublicSheet.lastVersion = "1.0";
    }
    else state.PublicSheet.data = state.PublicSheet.data.filter(o => getObj('character', o.master) && getObj('character', o.slave));
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
      s.globalconfigCache = globalconfig.publicsheet;
    }
  };

  // Utility/Workhorse functions
  const getSlaveMaster = id => {
    // Return slave/master pair in state corresponding to ID (if applicable)

    const slaveIndex = state.PublicSheet.data.findIndex(o => o.slave === id),
      masterIndex = state.PublicSheet.data.findIndex(o => o.master === id);
    if (slaveIndex !== -1)
      return {
        index: slaveIndex,
        master: state.PublicSheet.data[slaveIndex].master,
        slave: id,
        type: 'slave',
      };
    else if (masterIndex !== -1)
      return {
        index: masterIndex,
        master: id,
        slave: state.PublicSheet.data[masterIndex].slave,
        type: 'master',
      };
    else return {
      index: -1,
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
      targetIDs = findObjs({ _type: 'player' })
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
      .map(x => [x.get('name'), x.id])
      .map(([name, id]) => `${htmlReplace(name)},${id}`)
      .join('|');
    return `<a ${linkStyle} href="!publicsheet ${command} ?${htmlReplace('{')}Character?|${charList}${htmlReplace('}')}">${caption}</a>`;
  };
  const getOverview = () => {
    // Generate list of active public characters & buttons

    const charRows = state.PublicSheet.data.map(o => {
      return `<tr><td>${getObj('character', o.master).get('name')}</td>` +
        `<td><a ${linkStyle} href="!publicsheet sync ${o.master}">Force Sync</a></td>` +
        `<td><a ${linkStyle} href="!publicsheet remove ${o.master}">Remove</a></td></tr>`;
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

    const {index, slave, type} = getSlaveMaster(oldChar.id);
    if (type === 'slave') state.PublicSheet.data.splice(index, 1);
    else if (type === 'master') {
      getObj('character', slave).remove();
      state.PublicSheet.data.splice(index, 1);
    }
  };
  const handleAttrChange = (attr, oldAttr) => {
    // Slave: reset to previous value
    // Master: propagate change to slave

    const {slave, type} = getSlaveMaster(attr.get('_characterid'));
    if (type === 'slave') attr.set({
      current: oldAttr.current,
      max: oldAttr.max,
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
      {index, master, slave, type} = getSlaveMaster(id),
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
            state.PublicSheet.data.push({
              master: id,
              slave: setupSlave(id),
            });
            output.push(`Public version of character ${getObj('character', id).get('name')} added.`);
            output.push(getOverview());
          }
          else output.push(`No character with id ${id} found.`);
          break;
        case 'remove':
          if (type) {
            state.PublicSheet.data.splice(index, 1);
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
        case 'setpublicname':
          if (id) {
            state.PublicSheet.namePattern = args.join(' ');
            output.push(`Public version of characters will now be named "${args.join(' ')}".`);
          }
          else {
            output.push('Public name cannot be blank.');
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
