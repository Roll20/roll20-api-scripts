// Github:   https://github.com/shdwjk/Roll20API/blob/master/PlayerCharacters/PlayerCharacters.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron
var API_Meta = API_Meta||{}; //eslint-disable-line no-var
API_Meta.PlayerCharacters={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.PlayerCharacters.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-6);}}

/* global TokenMod */
const PlayerCharacters = (() => { // eslint-disable-line no-unused-vars

  const scriptName = 'PlayerCharacters';
  const version = '0.1.1';
  API_Meta.PlayerCharacters.version = version;
  const lastUpdate = 1658609741;
  const schemaVersion = 0.2;
  const secToMs = 1000;
  const OwnerAttrName = 'OwnerRoll20IDs';

  const assureHelpHandout = (create = false) => {
    const helpIcon = "https://s3.amazonaws.com/files.d20.io/images/295769190/Abc99DVcre9JA2tKrVDCvA/thumb.png?1658515304";

    // find handout
    let props = {type:'handout', name:`Help: ${scriptName}`};
    let hh = findObjs(props)[0];
    if(!hh) {
      hh = createObj('handout',Object.assign(props, {inplayerjournals: "all", avatar: helpIcon}));
      create = true;
    }
    if(create || version !== state[scriptName].lastHelpVersion){
      hh.set({
        notes: helpParts.helpDoc({who:'handout',playerid:'handout'})
      });
      state[scriptName].lastHelpVersion = version;
      log('  > Updating Help Handout to v'+version+' <');
    }
  };

  const checkInstall = () =>  {
    log(`-=> ${scriptName} v${version} <=-  [${new Date(lastUpdate*1000)}]`);

    if( ! state.hasOwnProperty(scriptName) || state[scriptName].version !== schemaVersion) {
      log(`  > Updating Schema to v${schemaVersion} <`);
      switch(state[scriptName] && state[scriptName].version) {

        case 0.1:
          state[scriptName].config.showAllCharacters = true;
          state[scriptName].config.showUnclaimedCharacters = true;
          state[scriptName].config.charactersInPlayerJournals = true;
          /* break; // intentional dropthrough */ /* falls through */

        case 0.2:
          /* break; // intentional dropthrough */ /* falls through */

        case 'UpdateSchemaVersion':
          state[scriptName].version = schemaVersion;
          break;

        default:
          state[scriptName] = {
            version: schemaVersion,
            lastHelpVersion: version,
            config: {
              showCharsOnLogin: true,
              showCharsDelay:  5,
              playersCanAddCharacters: true,
              playersCanAddAllCharacters: true,
              showAllCharacters: true,
              showUnclaimedCharacters: true,
              charactersInPlayerJournals: true
            }
          };
          break;
      }
    }
    assureHelpHandout();
    assureRoll20IDs();
    tryRestoreUnclaimedCharacters();
  };

  const cbArray = (list) => list.split(/\s*,\s*/).filter(s=>s.length);

  const validPlayer = (()=>{
    let playerids = ['all',...findObjs({type:'player'}).map(p=>p.id)];
    on('add:player',(p)=>playerids.push(p.id));

    return (pid)=>playerids.includes(pid);
  })();


  const hasInvalidPlayer = (cba) => !cba.find((pid)=>validPlayer(pid));

  const toRoll20IDs = (cba) => cba
    .map( id => getObj('player',id))
    .filter( p => undefined !== p)
    .map( p => p.get('d20userid'));

  const toPlayerIDs = (cba) => cba
    .map( id => findObjs({type:'player',d20userid: id})[0])
    .filter( p => undefined !== p)
    .map( p => p.id);

  const getRoll20IDsAttr = (c, create = false) => (
    findObjs({type: 'attribute', name: OwnerAttrName, characterid: c.id})[0]
    || (create ? createObj('attribute',{name: OwnerAttrName, characterid: c.id}) : undefined )
  );

  const writeRoll20IDs = (c) => {
    let cba = cbArray(c.get('controlledby'));
    let pids = toRoll20IDs(cba);
    if(pids.length) {
      let a = getRoll20IDsAttr (c,true);
      a.set('current', pids.join(','));
    }
  };

  const assureRoll20IDs = () => 
    findObjs({
      type: 'character',
      archived: false
    })
    .filter(c=>playerCanControl(c))
    .forEach(writeRoll20IDs);

  const tryRestorePlayers = (c) => {
    let a = getRoll20IDsAttr (c);
    if(a){
      let pids = cbArray(a.get('current'));
      let cba = toPlayerIDs(pids);
      if(cba){
        c.set('controlledby',cba.join(','));
        return true;
      }
    }
    return false;
  };

  const tryRestoreUnclaimedCharacters = () => getUnassignedPlayerCharacters().forEach(tryRestorePlayers);

  const considerTokenModChangeOnToken = (t) => setTimeout( () => {
    let token = getObj('graphic',t.id);
    if(token){
      let c = getObj('character',token.get('represents'));
      if(c){
        writeRoll20IDs(c);
      }
    }
  }, 100);


  const getUnassignedPlayerCharacters = () => 
    findObjs({type: 'character'})
      .filter(c=>c.get('controlledby').length)
      .filter(c=>'all'!==c.get('controlledby'))
      .filter((p)=>hasInvalidPlayer(cbArray(p.get('controlledby'))))
      ;

  const playerCanControl = (obj, playerid='any') => {
    const playerInControlledByList = (list, playerid) => list.includes('all') || list.includes(playerid) || ('any'===playerid && list.length);
    let players = cbArray(obj.get('controlledby'));

    if(playerInControlledByList(players,playerid)){
      return true;
    }

    if('' !== obj.get('represents') ) {
      players = cbArray(
        (getObj('character',obj.get('represents')) || {get: function(){return '';} } )
        .get('controlledby')
      );
      return playerInControlledByList(players,playerid);
    }
    return false;
  };

  const HE = (() => {
    const esRE = (s) => s.replace(/(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g,'\\$1');
    const e = (s) => `&${s};`;
    const entities = {
      '<' : e('lt'),
      '>' : e('gt'),
      "'" : e('#39'),
      '@' : e('#64'),
      '{' : e('#123'),
      '|' : e('#124'),
      '}' : e('#125'),
      '[' : e('#91'),
      ']' : e('#93'),
      '"' : e('quot')
    };
    const re = new RegExp(`(${Object.keys(entities).map(esRE).join('|')})`,'g');
    return (s) => s.replace(re, (c) => (entities[c] || c) );
  })();


  const s = {
    box: 'display: block; border: 1px solid #999; border-radius: .3em; padding: .3em; box-shadow: 0 0 25px 2px #999; margin: 1em 0 1em 0;',
    playerBox: 'background-color:white;',
    unclaimedBox: 'background-color:#fed;',
    allBox: 'background-color:#ddf;',
    charRow: 'display: block; border-top: 1px solid #ccc; margin: .2em; background-color: white;',
    img: 'max-width: 2em; max-height: 3em;width:auto;height:auto;border:1px solid #999;float:left;margin: .1em; display: inline-block;',
    link: 'color: #07c; border: 1px solid #999; border-radius: .3em; padding: .3em 1em; background-color:#ccc;font-weight: bold;display: inline-block;float: right;margin: .1em;',
    addBtn: 'color: #fff; border: 1px solid #9f9; border-radius: .3em; padding: .3em 1em; background-color:#3c3;font-weight: bold;display: inline-block;float: right;margin: .1em;',
    claimBtn: 'color: #fff; border: 1px solid #963; border-radius: .3em; padding: .3em 1em; background-color:#c96;font-weight: bold;display: inline-block;float: right;margin: .1em;',
    btn: 'color: #fff; border: 1px solid #999; border-radius: .3em; padding: .3em 1em; background-color:#33c;font-weight: bold;display: inline-block;float: right;margin: .1em;',
    btnOn: 'background-color:#3c3;',
    btnOff: 'background-color:#c33;'
  };

  const defaultImg = 'https://app.roll20.net/images/character.png';
  const playerName = (pid) => (getObj('player',pid)||{get:()=>'Unknown'}).get('_displayname');
  const playerNameMap = () =>
    findObjs({type:'player'})
      .filter( p => !playerIsGM(p.id))
      .reduce( (m,p) => ([...m,`${p.get('displayname')},${p.id}`]),[])
      .sort();

  const defaultName = (pid) => `${pid === 'all' ? "All" : playerName(pid)}'s New Character`;

  const f = {
    clear:  ()=>`<div style="clear:both"></div>`,
    charImg: (c) => c.get('avatar')||defaultImg, 
    addButton: (pid) => `<a style="${s.addBtn}" href="!pcs --add-character ${pid} --name ${HE(`?{Character Name (Empty for "${defaultName(pid)}")`)}}">+</a>`,
    claimButton: (c) => `<a style="${s.claimBtn}" href="!pcs --claim-character ${c.id}">Claim</a>`,
    playerQuery: () => HE(`?{Player|All,all|${playerNameMap().join('|')}}`),
    assignButton: (c) => `<a style="${s.claimBtn}" href="!pcs --assign-character ${c.id} --player-id ${f.playerQuery()}">Assign</a>`,
    openButton: (c) => `<a style="${s.link}" href="http://journal.roll20.net/character/${c.id}">Open</a>`,
    charDetail: (c) => `<img style="${s.img}" src="${f.charImg(c)}"/>${c.get('name')}`,
    showChar: (c,e='') => `<div style="${s.charRow}">${f.openButton(c)}${e}${f.charDetail(c)}${f.clear()}</div>`,
    showPlayer: (p,cs,showAdd) => `<div style="${s.box}${s.playerBox}"><div>${showAdd ? f.addButton(p.id) : ''}${p.get('displayname')}:${f.clear()}</div>${cs.map(c=>f.showChar(c)).join('')}</div>`,
    showUnclaimed: (cs,assign=false) => `<div style="${s.box}${s.unclaimedBox}"><div>Unclaimed Imported Characters:</div>${cs.map(c=>f.showChar(c,(assign ? f.assignButton(c) : f.claimButton(c)))).join('')}</div>`,
    showAll: (cs,showAdd) => `<div style="${s.box}${s.allBox}"><div>${showAdd ? f.addButton('all') : ''}All Players:${f.clear()}</div>${cs.map(c=>f.showChar(c)).join('')}</div>`
  };

  const AddPlayerCharacter = (pid,name) => {
    let c = createObj('character',{
      controlledby: pid,
      name: name || defaultName(pid),
      inplayerjournals: ( state[scriptName].config.charactersInPlayerJournals ? 'all' : pid)
    });
    return c;
  };

  const ClaimPlayerCharacter = (cid,pid) => {
    let c = getObj('character',cid);
    if(c){
      let cb = cbArray(c.get('controlledby'));
      if(hasInvalidPlayer(cb)) {
        c.set({
          controlledby: pid,
          inplayerjournals: ( state[scriptName].config.charactersInPlayerJournals ? 'all' : pid)
        });
      }
    }
  };

  const showPlayers = (playerid, opts = {}) => {
    let filt = (playerIsGM(playerid) ? (p) => !playerIsGM(p.id) : (p) => p.id === playerid);
    let players = findObjs({type:'player'})
      .filter(filt)
      .reduce((m,p)=>({[p.id]:p,...m}),{});

    let pcmap = findObjs({
        type: 'character',
        archived: false
      })
      .filter(c=>playerCanControl(c))
      .reduce((m,c) => {
        cbArray(c.get('controlledby')).forEach( pid => {
          m[pid] = [...(m[pid]||[]), c];
        });
        return m;
      },{});

    const showAddPlayer = playerIsGM(playerid) || state[scriptName].config.playersCanAddCharacters;
    const showAddAll = playerIsGM(playerid) || state[scriptName].config.playersCanAddAllCharacters;

    let parts = Object.keys(players).map(pid=>f.showPlayer(players[pid],pcmap[pid]||[],showAddPlayer));

    if(opts.showUnclaimed){
      let unclaimedCharacters = getUnassignedPlayerCharacters();
      if(unclaimedCharacters.length){
        parts.push(f.showUnclaimed(unclaimedCharacters,playerIsGM(playerid)));
      }
    }

    if(opts.showAll){
      parts.push(f.showAll(pcmap['all']||[],showAddAll));
    }

    return parts;
  };


  const firstWordKeyObj = (str) => {
    let firstWhitespace = str.search(/\s/);
    if(-1 === firstWhitespace){
      return {[str.toLowerCase()]:str};
    }
    return {[str.slice(0,firstWhitespace).toLowerCase()]: str.slice(firstWhitespace+1)};
  };


  const ch = (c) => {
    const entities = {
      '<' : 'lt',
      '>' : 'gt',
      '&' : 'amp',
      "'" : '#39',
      '@' : '#64',
      '{' : '#123',
      '|' : '#124',
      '}' : '#125',
      '[' : '#91',
      ']' : '#93',
      '"' : 'quot',
      '*' : 'ast',
      '/' : 'sol',
      ' ' : 'nbsp'
    };

    if( entities.hasOwnProperty(c) ){
      return `&${entities[c]};`;
    }
    return '';
  };

  const _h = {
    outer: (...o) => `<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">${o.join(' ')}</div>`,
    title: (t,v) => `<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">${t} v${v}</div>`,
    subhead: (...o) => `<b>${o.join(' ')}</b>`,
    minorhead: (...o) => `<u>${o.join(' ')}</u>`,
    optional: (...o) => `${ch('[')}${o.join(` ${ch('|')} `)}${ch(']')}`,
    required: (...o) => `${ch('<')}${o.join(` ${ch('|')} `)}${ch('>')}`,
    header: (...o) => `<div style="padding-left:10px;margin-bottom:3px;">${o.join(' ')}</div>`,
    section: (s,...o) => `${_h.subhead(s)}${_h.inset(...o)}`,
    paragraph: (...o) => `<p>${o.join(' ')}</p>`,
    items: (o) => `<li>${o.join('</li><li>')}</li>`,
    ol: (...o) => `<ol>${_h.items(o)}</ol>`,
    ul: (...o) => `<ul>${_h.items(o)}</ul>`,
    grid: (...o) => `<div style="padding: 12px 0;">${o.join('')}<div style="clear:both;"></div></div>`,
    cell: (o) =>  `<div style="width: 130px; padding: 0 3px; float: left;">${o}</div>`,
    inset: (...o) => `<div style="padding-left: 10px;padding-right:20px">${o.join(' ')}</div>`,
    join: (...o) => o.join(' '),
    pre: (...o) =>`<div style="border:1px solid #e1e1e8;border-radius:4px;padding:8.5px;margin-bottom:9px;font-size:12px;white-space:normal;word-break:normal;word-wrap:normal;background-color:#f7f7f9;font-family:monospace;overflow:auto;">${o.join(' ')}</div>`,
    preformatted: (...o) =>_h.pre(o.join('<br>').replace(/\s/g,ch(' '))),
    code: (...o) => `<code>${o.join(' ')}</code>`,
    attr: {
      bare: (o)=>`${ch('@')}${ch('{')}${o}${ch('}')}`,
      selected: (o)=>`${ch('@')}${ch('{')}selected${ch('|')}${o}${ch('}')}`,
      target: (o)=>`${ch('@')}${ch('{')}target${ch('|')}${o}${ch('}')}`,
      char: (o,c)=>`${ch('@')}${ch('{')}${c||'CHARACTER NAME'}${ch('|')}${o}${ch('}')}`
    },
    bold: (...o) => `<b>${o.join(' ')}</b>`,
    italic: (...o) => `<i>${o.join(' ')}</i>`,
    font: {
      command: (...o)=>`<b><span style="font-family:serif;">${o.join(' ')}</span></b>`
    },
    clear:  ()=>`<div style="clear:both"></div>`,
    configButtonOnOff: (t,c,v) => `${_h.bold(t)} <a style="${s.btn} ${v ? s.btnOn : s.btnOff}" href="${HE(c)}">${v?'On':'Off'}</a>${_h.clear()}`,
    configButtonPrompt: (t,c,v) => `${_h.bold(t)} <a style="${s.btn}" href="${HE(c)}">${v}</a>${_h.clear()}`
  };

  const helpParts = {
    helpBody: (/*context*/) => _h.join(
      _h.header(
        _h.paragraph(`${scriptName} provides a list of Characters by Player, as well as the means to add Characters for Players easily.`)
      ),
      _h.subhead('Commands'),
      _h.inset(
        _h.font.command(
          `!pcs`,
          _h.optional(
            `--skip-all`,
            `--skip-claim`,
            `--show-all`,
            `--show-claim`,
            `--add-character ${_h.required('Player ID or all')}`,
            `--name ${_h.optional('name')}`,
            `--help`
          )
        ),
        _h.paragraph( 'Lists Characters by Player.'),
        _h.ul(
          `${_h.bold('--skip-all')} -- causes the listing to not show characters which have a controlled by of ${_h.code('all')}. Characters with Players explicitly assigned to them in addition to ${_h.code('all')} will still be listed under the explicit Player name.`,
          `${_h.bold('--skip-claim')} -- causes the listing to not show imported characters which have not been claimed.`,
          `${_h.bold('--show-all')} -- causes the listing to show characters which have a controlled by of ${_h.code('all')}.`,
          `${_h.bold('--show-claim')} -- causes the listing to show imported characters which have not been claimed.`,
          `${_h.bold(`--add-character ${_h.required('Player ID or all')}`)} -- Add a character for the specified player or all players.  This command is used via the plus button in the list output.`,
          `${_h.bold(`--name ${_h.optional('Name')}`)} -- Set the name for the new character.  This is only used if ${_h.code('--add-character')} is also specified.  If no name is specified, a default name based on the Player is used.  This command is used via the plus button in the list output.`, 
          `${_h.bold('--help')} -- Shows the Help screen.`
        )
      ),
      _h.subhead('Description'),
      _h.inset(
        _h.paragraph(`If called by the GM, PlayerCharacters whispers a list of characters divided by player.  If called by a player, they will see their own characters as well as characters available to all players.  Each character shows the character's avatar, name, and a button to open that character.  There is also a green plus button that will add a new character for that player.  Pressing it will prompt for a name (you can leave the prompt blank to have a default name assigned).`),
        _h.paragraph(`You can list all the characters that players have access to with the following command:`),
        _h.inset(
          _h.pre('!pcs')
        ),
        _h.paragraph(`If you want, you can ignore characters with controlled by set to ${_h.code('all players')}.  Characters that also have an explicit character assigned will still be shown under that player:`),
        _h.inset(
          _h.pre('!pcs --skip-all')
        ),
        _h.paragraph(`You can turn off showing all by default in the settings.  If you have that setting turned off, you can show the all player characters with:`),
        _h.inset(
          _h.pre('!pcs --show-all')
        ),
        _h.paragraph(`Additionally, PlayerCharacters will whisper a list of available characters to a player when they log in to a game.  If you don${ch("'")}t want that behavior, you can turn it off in the settings.`)
      ),
      _h.minorhead('Imported Characters'),
      _h.inset(
        _h.paragraph(`PlayerCharacters handles imported characters specially.  First of all, it looks for the special attribute ${_h.code(OwnerAttrName)} which holds a list of Roll20 User Ids that should own this character.  If present, it will convert those to player ids for the current game and assign the character to them.  Second, if there is a character that has player ids that are not valid for this game, it adds it to a special list of ${_h.bold('Unclaimed Imported Characters')} which players can choose to claim as their own.  GMs have the option to assign those unclaimed characters to current players.`),
        _h.paragraph(`PlayerCharacters also writes the Roll20 User IDs of all controllers to the special attribute ${_h.code(OwnerAttrName)} so that the characters can be moved to other games and get assigned correctly to the players there.`),
        _h.paragraph(`If you want, you can ignore unclaimed imported characters by specifying:`),
        _h.inset(
          _h.pre('!pcs --skip-claim')
        ),
        _h.paragraph(`There are also configuration settings to hide unclaimed characters by default. If you have that setting turned on, you can show them temporarily with:`),
        _h.inset(
          _h.pre('!pcs --show-claim')
        )
      )
    ),
    config: (context) => _h.join(
      // SECTION: --config, etc
      _h.section('Configuration',
        _h.paragraph(`${_h.italic('--config')} takes option value pairs, separated by | characters.`),
        _h.inset(
          _h.pre( '!pcs --config option|value option|value')
        ),
        _h.minorhead('Available Configuration Properties:'),
        _h.ul(
          `${_h.bold('show-characters-on-login')} -- Controls if players will be shown their characters when they log on. Values: ${_h.code('on')}, ${_h.code('off')}, ${_h.code('toggle')} `,
          `${_h.bold('show-characters-delay')} -- How long to wait before showing players their characters. Value: ${_h.code(_h.required('number of seconds'))}`,
          `${_h.bold('show-all-characters')} -- Sets the default showing behavior for characters assigned to all players. Values: ${_h.code('on')}, ${_h.code('off')}, ${_h.code('toggle')} `,
          `${_h.bold('show-unclaimed-characters')} -- Sets the default showing behavior for imported characters that have not been claimed by players. Values: ${_h.code('on')}, ${_h.code('off')}, ${_h.code('toggle')} `,
          `${_h.bold('players-can-add-characters')} -- Can players add characters for themselves. Values: ${_h.code('on')}, ${_h.code('off')}, ${_h.code('toggle')} `,
          `${_h.bold('players-can-add-all-characters')} -- Can players add characters for All Players. Values: ${_h.code('on')}, ${_h.code('off')}, ${_h.code('toggle')} `,
          `${_h.bold('characters-in-player-journals')} -- Are Player Characters in all Player Journals. Values: ${_h.code('on')}, ${_h.code('off')}, ${_h.code('toggle')} `

        ),
        ( playerIsGM(context.playerid)
          ? _h.join(
            _h.paragraph(_h.configButtonOnOff('Show Characters on Login','!pcs --config show-characters-on-login|toggle',state[scriptName].config.showCharsOnLogin)),
            _h.paragraph(_h.configButtonPrompt('Show Characters Delay',`!pcs --config show-characters-delay|?{Delay|${state[scriptName].config.showCharsDelay}}`, state[scriptName].config.showCharsDelay)),
            _h.paragraph(_h.configButtonOnOff('Show All Characters','!pcs --config show-all-characters|toggle',state[scriptName].config.showAllCharacters)),
            _h.paragraph(_h.configButtonOnOff('Show Unclaimed Characters','!pcs --config show-unclaimed-characters|toggle',state[scriptName].config.showUnclaimedCharacters)),
            _h.paragraph(_h.configButtonOnOff('Players can add Characters','!pcs --config players-can-add-characters|toggle',state[scriptName].config.playersCanAddCharacters)),
            _h.paragraph(_h.configButtonOnOff('Players can add All Player Characters','!pcs --config players-can-add-all-characters|toggle',state[scriptName].config.playersCanAddAllCharacters)),
            _h.paragraph(_h.configButtonOnOff('Characters are in all Player Journals','!pcs --config characters-in-player-journals|toggle',state[scriptName].config.charactersInPlayerJournals))
          )
          : ''
        )
      )
    ),
    helpDoc: (context) => _h.join(
      _h.title(scriptName, version),
      helpParts.helpBody(context),
      helpParts.config(context)
    ),

    helpChat: (context) => _h.outer(
      _h.title(scriptName, version),
      helpParts.helpBody(context),
      helpParts.config(context)
    ),

    helpConfigOnly: (context) => _h.outer(
      _h.title(scriptName, version),
      helpParts.config(context)
    )

  };

  const showHelp = (playerid, configOnly = false) => {
    const who=(getObj('player',playerid)||{get:()=>'API'}).get('_displayname');
    let context = {
      who,
      playerid
    };
    sendChat('', '/w "'+who+'" '+ (configOnly ? helpParts.helpConfigOnly(context) : helpParts.helpChat(context)));
  };


  const handleInput = (msg) => {
    if('api'===msg.type && /^!pcs(\b\s|$)/i.test(msg.content)){
      let who = (getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');
      let isGM = playerIsGM(msg.playerid);

      let args = msg.content.split(/\s+--/).slice(1).reduce((m,a)=>({...m,...firstWordKeyObj(a)}),{});

      if(isGM && args.hasOwnProperty('config')) {
        let confs = args['config'].split(/\s+/).reduce((m,v)=>({...m,[v.split(/\|/)[0]]:v.split(/\|/)[1]||''}),{});
        Object.keys(confs).forEach(k=>{
          switch(k){
            case 'show-characters-on-login': {
                switch(confs[k].toLowerCase()){
                  case 'on': state[scriptName].config.showCharsOnLogin = true; break;
                  case 'off': state[scriptName].config.showCharsOnLogin = false; break;
                  case 'toggle': state[scriptName].config.showCharsOnLogin = !state[scriptName].config.showCharsOnLogin; break;
                }
              }
              break;

            case 'show-all-characters': {
                switch(confs[k].toLowerCase()){
                  case 'on': state[scriptName].config.showAllCharacters = true; break;
                  case 'off': state[scriptName].config.showAllCharacters = false; break;
                  case 'toggle': state[scriptName].config.showAllCharacters = !state[scriptName].config.showAllCharacters; break;
                }
              }
              break;
            case 'show-unclaimed-characters': {
                switch(confs[k].toLowerCase()){
                  case 'on': state[scriptName].config.showUnclaimedCharacters = true; break;
                  case 'off': state[scriptName].config.showUnclaimedCharacters = false; break;
                  case 'toggle': state[scriptName].config.showUnclaimedCharacters = !state[scriptName].config.showUnclaimedCharacters; break;
                }
              }
              break;

            case 'show-characters-delay': {
                let sec = parseInt(confs[k]);
                state[scriptName].config.showCharsDelay = (Number.isNaN(sec) ? 5 : sec);
              }
              break;

            case 'players-can-add-characters': {
                switch(confs[k].toLowerCase()){
                  case 'on': state[scriptName].config.playersCanAddCharacters = true; break;
                  case 'off': state[scriptName].config.playersCanAddCharacters = false; break;
                  case 'toggle': state[scriptName].config.playersCanAddCharacters = !state[scriptName].config.playersCanAddCharacters; break;
                }
              }
              break;

            case 'players-can-add-all-characters': {
                switch(confs[k].toLowerCase()){
                  case 'on': state[scriptName].config.playersCanAddAllCharacters = true; break;
                  case 'off': state[scriptName].config.playersCanAddAllCharacters = false; break;
                  case 'toggle': state[scriptName].config.playersCanAddAllCharacters = !state[scriptName].config.playersCanAddAllCharacters; break;
                }
              }
              break;
            case 'characters-in-player-journals': {
                switch(confs[k].toLowerCase()){
                  case 'on': state[scriptName].config.charactersInPlayerJournals = true; break;
                  case 'off': state[scriptName].config.charactersInPlayerJournals = false; break;
                  case 'toggle': state[scriptName].config.charactersInPlayerJournals = !state[scriptName].config.charactersInPlayerJournals; break;
                }
              }
              break;
          }
        });

        showHelp(msg.playerid, true);
        return;
      }

      if(args.hasOwnProperty('help')){
        showHelp(msg.playerid);
        return;
      }

      if( args.hasOwnProperty('add-character') && (
        isGM 
        || ( msg.playerid === args['add-character'] && state[scriptName].config.playersCanAddCharacters )
        || ( 'all' === args['add-character'] && state[scriptName].config.playersCanAddAllCharacters )
      )){
        AddPlayerCharacter(args['add-character'],args['name']);
      }

      if( args.hasOwnProperty('claim-character') && !isGM ) {
        ClaimPlayerCharacter(args['claim-character'],msg.playerid);
      }

      if( args.hasOwnProperty('assign-character') && isGM ) {
        ClaimPlayerCharacter(args['assign-character'],args['player-id']);
      }

      let showAll =  state[scriptName].config.showAllCharacters;
      if(args.hasOwnProperty('skip-all')){
        showAll = false;
      }
      if(args.hasOwnProperty('show-all')){
        showAll = true;
      }

      let showUnclaimed = state[scriptName].config.showUnclaimedCharacters;
      if(args.hasOwnProperty('skip-unclaimed')){
        showUnclaimed = false;
      }
      if(args.hasOwnProperty('show-unclaimed')){
        showUnclaimed = true;
      }

      sendChat('',`/w "${who}" ${showPlayers(msg.playerid, {showUnclaimed,showAll}).join('')}`);
    }
  };

  const showPlayersToPlayer = (playerid) => {
      let who = (getObj('player',playerid)||{get:()=>'API'}).get('_displayname');
      let showAll =  state[scriptName].config.showAllCharacters;
      let showUnclaimed = state[scriptName].config.showUnclaimedCharacters;
      sendChat('',`/w "${who}" ${showPlayers(playerid,{showAll,showUnclaimed}).join('')}`);
  };

  const handlePlayerOnline = (player) => {
    if(true === player.get('online') && !playerIsGM(player.id)){
      if(state[scriptName].config.showCharsOnLogin){
        setTimeout(()=>showPlayersToPlayer(player.id), (state[scriptName].config.showCharsDelay||0)*secToMs);
      }
    }
  };

  const registerEventHandlers = () => {
    on('chat:message', handleInput);
    on('change:player:_online',handlePlayerOnline);
    on('change:character:controlledby', writeRoll20IDs );
    on('add:character', (c => setTimeout(()=>tryRestorePlayers(c),100) ));

    if('undefined' !== typeof TokenMod && TokenMod.ObserveTokenChange){
        TokenMod.ObserveTokenChange(considerTokenModChangeOnToken);
    }
  };

  on('ready', () => {
    checkInstall();
    registerEventHandlers();
  });

  return {
    // Public interface here
  };

})();

{try{throw new Error('');}catch(e){API_Meta.PlayerCharacters.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.PlayerCharacters.offset);}}
