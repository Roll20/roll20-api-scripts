// Github:   https://github.com/shdwjk/Roll20API/blob/master/PlayerCharacters/PlayerCharacters.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron
var API_Meta = API_Meta||{};
API_Meta.PlayerCharacters={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.PlayerCharacters.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-6);}}

const PlayerCharacters = (() => { // eslint-disable-line no-unused-vars

  const scriptName = 'PlayerCharacters';
  const version = '0.1.0';
  API_Meta.PlayerCharacters.version = version;
  const lastUpdate = 1615587930;
  const schemaVersion = 0.1;
  const secToMs = 1000;
  const IN_PLAYER_JOURNALS = true;

  const assureHelpHandout = (create = false) => {
    const helpIcon = "https://s3.amazonaws.com/files.d20.io/images/127392204/tAiDP73rpSKQobEYm5QZUw/thumb.png?15878425385";

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
              playersCanAddAllCharacters: true
            }
          };
          break;
      }
    }
    assureHelpHandout();
  };

  const cbArray = (list) => list.split(/\s*,\s*/).filter(s=>s.length);

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
    box: 'display: block; border: 1px solid #999; border-radius: .3em; padding: .3em; background-color: white; box-shadow: 0 0 25px 2px #999; margin: 1em 0 1em 0;',
    charRow: 'display: block; border-top: 1px solid #ccc; margin: .2em;',
    img: 'max-width: 2em; max-height: 3em;width:auto;height:auto;border:1px solid #999;float:left;margin: .1em; display: inline-block;',
    link: 'color: #07c; border: 1px solid #999; border-radius: .3em; padding: .3em 1em; background-color:#ccc;font-weight: bold;display: inline-block;float: right;margin: .1em;',
    addBtn: 'color: #fff; border: 1px solid #9f9; border-radius: .3em; padding: .3em 1em; background-color:#3c3;font-weight: bold;display: inline-block;float: right;margin: .1em;',
    btn: 'color: #fff; border: 1px solid #999; border-radius: .3em; padding: .3em 1em; background-color:#33c;font-weight: bold;display: inline-block;float: right;margin: .1em;',
    btnOn: 'background-color:#3c3;',
    btnOff: 'background-color:#c33;'
  };

  const defaultImg = 'https://app.roll20.net/images/character.png';
	const playerName = (pid) => (getObj('player',pid)||{get:()=>'Unknown'}).get('_displayname');
	const defaultName = (pid) => `${pid === 'all' ? "All" : playerName(pid)}'s New Character`;

	const f = {
		clear:  ()=>`<div style="clear:both"></div>`,
		charImg: (c) => c.get('avatar')||defaultImg, 
		addButton: (pid) => `<a style="${s.addBtn}" href="!pcs --add-character ${pid} --name ${HE(`?{Character Name (Empty for "${defaultName(pid)}")`)}}">+</a>`,
		showChar: (c) => `<div style="${s.charRow}"><a style="${s.link}" href="http://journal.roll20.net/character/${c.id}">Open</a><img style="${s.img}" src="${f.charImg(c)}"/>${c.get('name')}${f.clear()}</div>`,
		showPlayer: (p,cs,showAdd) => `<div style="${s.box}"><div>${showAdd ? f.addButton(p.id) : ''}${p.get('displayname')}:${f.clear()}</div>${cs.map(f.showChar).join('')}</div>`,
		showAll: (cs,showAdd) => `<div style="${s.box}"><div>${showAdd ? f.addButton('all') : ''}All Players:${f.clear()}</div>${cs.map(f.showChar).join('')}</div>`
	};

  const AddPlayerCharacter = (pid,name) => {
    let c = createObj('character',{
      controlledby: pid,
      name: name || defaultName(pid),
      inplayerjournals: (IN_PLAYER_JOURNALS ? 'all' : '')
    });
    return c;
  };

	const showPlayers = (playerid, skipAll = false) => {
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
		if(!skipAll){
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
            `--add-character ${_h.required('Player ID or all')}`,
            `--name ${_h.optional('name')}`,
            `--help`
          )
        ),
        _h.paragraph( 'Lists Characters by Player'),
        _h.ul(
          `${_h.bold('--skip-all')} -- causes the listing to not show characters which have a controleld by of ${_h.code('all')}.Characters with Players explicitly assigned to them in addition to ${_h.code('all')} will still be listed under the explicit Player name.`,
          `${_h.bold(`--add-character ${_h.required('Player ID or all')}`)} -- Add a character for the specified player or all players.  This command is used via the plus button in the list output.`,
          `${_h.bold(`--name ${_h.optional('Name')}`)} -- Set the name for the new character.  This is only used if ${_h.code('--add-character')} is also specified.  If no name is specified, a default name based on the Player is used.  This command is used via the plus button in the list output.`, 
          `${_h.bold('--help')} -- Shows the Help screen.`
        ),
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
        _h.paragraph(`Additionally, PlayerCharacters will whisper a list of available characters to a player when they log in to a game.`)
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
          `${_h.bold('show-characters-on-login')} -- Contols if players will be shown their characters when they log on. Values: ${_h.code('on')}, ${_h.code('off')}, ${_h.code('toggle')} `,
          `${_h.bold('show-characters-delay')} -- How long to wait before showing players their characters. Value: ${_h.code(_h.required('number of seconds'))}`,
          `${_h.bold('players-can-add-characters')} -- Can players add characters for themselves. Values: ${_h.code('on')}, ${_h.code('off')}, ${_h.code('toggle')} `,
          `${_h.bold('players-can-add-all-characters')} -- Can players add characters for All Players. Values: ${_h.code('on')}, ${_h.code('off')}, ${_h.code('toggle')} `

        ),
        ( playerIsGM(context.playerid)
          ? _h.join(
            _h.paragraph(_h.configButtonOnOff('Show Characters on Login','!pcs --config show-characters-on-login|toggle',state[scriptName].config.showCharsOnLogin)),
            _h.paragraph(_h.configButtonPrompt('Show Characters Delay',`!pcs --config show-characters-delay|?{Delay|${state[scriptName].config.showCharsDelay}}`, state[scriptName].config.showCharsDelay)),
            _h.paragraph(_h.configButtonOnOff('Players can add Characters','!pcs --config players-can-add-characters|toggle',state[scriptName].config.playersCanAddCharacters)),
            _h.paragraph(_h.configButtonOnOff('Players can add All Player Characters','!pcs --config players-can-add-all-characters|toggle',state[scriptName].config.playersCanAddAllCharacters)),
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

      sendChat('',`/w "${who}" ${showPlayers(msg.playerid, args.hasOwnProperty('skip-all')).join('')}`);
    }
  };

  const showPlayersToPlayer = (playerid) => {
      let who = (getObj('player',playerid)||{get:()=>'API'}).get('_displayname');
      sendChat('',`/w "${who}" ${showPlayers(playerid,true).join('')}`);
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
