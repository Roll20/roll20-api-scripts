// Github:   https://github.com/shdwjk/Roll20API/blob/master/MotD/MotD.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

const MotD = (() => { // eslint-disable-line no-unused-vars

    const version = '0.2.10';
    const lastUpdate = 1556246712;
    const schemaVersion = 0.2;
    const loginSendDelay = 10000; // 10 seconds
    const playerOnlineCooldown =  21600000; // 6 hours (6hrs * 60minutes * 60seconds * 1000miliseconds)
    const motdNoteName = 'MotD Note';

    const styles = {
        container: 'display: block; border: 1px solid #999; border-radius: .3em; padding: 1em; background-color: white; box-shadow: 0 0 25px 2px #999; margin: 1em 0 1em 0;',
        gmnote: 'display: block; border-top: 2px dashed #d2dc65; margin: 2em -1em -1em -1em; border-radius: 0 0 .3em .3em; padding: .3em; background-color: #F2F5D3;',
        gmtitle: 'font-size: 2em; font-weight:bold; margin:.5em 1em 1em 1em; text-align: center;line-height:1em;',
        image: 'display: block; width: auto; height: auto;',
        motdLinkBox: 'display: block; text-align: center; font-size: .8em; font-weight:bold;',
        motdLink: 'color: #07c; text-decoration: underline;',
        links: 'color: #07c;'
    };

    let motdNoteId;
    let motdText;
    let motdGMText;
    let motdImg;

    const loadMotDNote = (text, gmText, img) => {
        
        gmText=('null'===gmText)?'':gmText;
        
        motdText=text
            .replace(/(\r\n|\r|\n|\n<br>|<br>\n)/gi,'<br />')
            .replace(/<br\s*\/?>\s*\n/ig,'<br />')
            .replace(/\n/ig,'<br />')
            .replace(/<a\s+/ig,`<a style="${styles.links}" `)
            ;

        motdGMText=(gmText||'')
            .replace(/(\r\n|\r|\n|\n<br>|<br>\n)/gi,'<br />')
            .replace(/<br\s*\/?>\s*\n/ig,'<br />')
            .replace(/\n/ig,'<br />')
            .replace(/<a\s+/ig,`<a style="${styles.links}" `)
            ;
  
        motdImg = img?`<img style="${styles.image}" src="${img}">`:'';
    };

    const createMotDNote = () => {
        let motdNote = createObj('handout',{
            name: motdNoteName
        });
        motdText='Welcome to the Game!';
        motdGMText='';
        motdImg='';
        motdNote.set('notes',motdText);
        motdNoteId = motdNote.id;
    };

    const showToPlayer = (p) => {
        let who = p.get('displayname');
        let text = motdText.replace(/%%NAME%%/g,who);

        let textGM = (playerIsGM(p.id) && motdGMText.length) ? (`<div style="${styles.gmnote}"><div style="${styles.gmtitle}">GM Only Notes</div>${motdGMText.replace(/%%NAME%%/g,who)}</div>`) : '';
        sendChat('MotD','/w "'+who+'" '+
           `<div style="${styles.container}">${
            motdImg.length ? `<div>${motdImg}</div>` : ''
           }<div>${text}</div>${textGM}</div><div style="${styles.motdLinkBox}"><a style="${styles.motdLink}" href="http://journal.roll20.net/handout/${motdNoteId}">See the ${motdNoteName} handout.</a></div>` 
        );
        state.MotD.playerShownLast[p.id] = _.now();
    };

    const checkInstall = (callback) => {
        log('-=> MotD v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'MotD') || state.MotD.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            switch(state.MotD && state.MotD.version) {
                case 0.1:
                    /* break; // intentional dropthrough */ /* falls through */

                case 0.2:
                    state.MotD.playerShownLast = {};

                    /* break; // intentional dropthrough */ /* falls through */


                case 'UpdateSchemaVersion':
                    state.MotD.version = schemaVersion;
                    break;

                default:
                    state.MotD = {
                        version: schemaVersion,
                        playerTimes: {},
                        playerShownLast: {}
                    };
                    break;
            }
        }

        let callback2 = ()=>{
            findObjs({type:'player',_online:true})
                .forEach((p)=>{
                    if( state.MotD.playerTimes[p.id] === undefined ||
                        state.MotD.playerTimes[p.id] < (_.now() - playerOnlineCooldown) 
                    ) {
                        showToPlayer(p);
                    }
                    state.MotD.playerTimes[p.id] = _.now();
                });
            callback();
        };

        let motdNote = filterObjs(function(o){
            return ( 'handout' === o.get('type') && motdNoteName === o.get('name') && false === o.get('archived'));
        })[0];
        if(motdNote) {
            motdNoteId = motdNote.id;
            motdNote.get('notes',(notes) => {
                motdNote.get('gmnotes',(gmNotes)=>{
                    loadMotDNote(notes,gmNotes,motdNote.get('avatar'));
                    callback2();
                });
            });
        } else {
            createMotDNote();
            callback2();
        }
    };

    const ch = (c) => {
        const entities = {
            '<' : 'lt',
            '>' : 'gt',
            "'" : '#39',
            '@' : '#64',
            '{' : '#123',
            '|' : '#124',
            '}' : '#125',
            '[' : '#91',
            ']' : '#93',
            '"' : 'quot',
            '-' : 'mdash',
            ' ' : 'nbsp'
        };

        if(_.has(entities,c) ){
            return ('&'+entities[c]+';');
        }
        return '';
    };

    const getRelativeDate = (ms) => {
        if(undefined === ms) {
            return 'never';
        }

        const s = 1000;
        const m = 60*s;
        const h = 60*m;
        const d = 24*h;
        const w = 7*d;

        const monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];

        const withOrd = (n) => {
            if([11,12,13].includes(n%100)){
                return `${n}th`;
            }
            switch(n%10){
                case 1: return `${n}st`;
                case 2: return `${n}nd`;
                case 3: return `${n}rd`;
                default: return `${n}th`;
            }
        };
        
        let diff = Date.now()-ms;
        if(diff < s){
            return `now`;
        }
        if(diff < m){
            let n =Math.round(diff/s);
            return `${n} second${1===n?'':'s'} ago`;
        }
        if(diff < h){
            let n =Math.round(diff/m);
            return `${n} minute${1===n?'':'s'} ago`;
        }
        if(diff < d){
            let n =Math.round(diff/h);
            return `${n} hour${1===n?'':'s'} ago`;
        }
        if(diff < w){
            let n =Math.round(diff/d);
            return `${n} day${1===n?'':'s'} ago`;
        }
        let when = new Date(ms);
        return `${monthNames[when.getMonth()]} ${withOrd(when.getDate())}, ${when.getFullYear()}`;
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
        }
    };

    const getLastByPlayer = () => _h.ul(...findObjs({type: 'player'})
        .map((p)=>`${_h.bold(p.get('displayname'))}: ${
            _h.ul(
                `${_h.bold('Shown:')} ${getRelativeDate(state.MotD.playerShownLast[p.id])}`,
                `${_h.bold('Seen:')} ${getRelativeDate(state.MotD.playerTimes[p.id])}`
            )}`)
    );

    const showHelp = (playerid) => {
        let who=(getObj('player',playerid)||{get:()=>'API'}).get('_displayname');
        sendChat('', '/w "'+who+'" '+
            _h.outer(
                _h.title('MotD',version),
                _h.header(
                    _h.paragraph( `MotD is a simple script that creates a handout named ${_h.code("MotD Note")}. When a player logs in, it whispers the contents of that note to the player. Any formatting that works in the Note is passed on to the player. You can use ${_h.code("%%NAME%%")} as a placeholder for the name of the player.`)
                ),
                _h.subhead('Commands'),
                _h.inset(
                    _h.font.command(
                        `!motd `,
                        _h.optional(
                            `--help`,
                            `--all`,
                            `--PLAYER NAME ...`
                        )
                    ),
                    _h.ul(
                        `${_h.bold('--help')} -- Shows the Help screen`,
                        `${_h.bold('--all')} -- Show the Message of the Day to all logged in players (including GM).`,
                        `${_h.bold('--PLAYER NAME')} -- Player who should be shown the Message of the Day. Matches are case-insensitive and will match partial names. You can have multiple of this argument to show to multiple players.`
                    )
                ),
                _h.paragraph(`In the absense of any arguments, will show the Message of the Day to the current player.`),
                _h.paragraph(`Show the Message of the day to the player named ${ch('"')}Bob the Slayer${ch('"')}:`),
                _h.inset(
                    _h.preformatted(
                        '!motd --Bob the Slayer'
                        )
                ),
                _h.paragraph(`Show the Message of the day to all the players with ${ch('"')}ka${ch('"')} in their name`),
                _h.inset(
                    _h.preformatted(
                        '!motd --ka'
                        )
                ),
                _h.paragraph(`Show the Message of the day to all the logged in players.`),
                _h.inset(
                    _h.preformatted(
                        '!motd --all'
                        )
                ),
                _h.minorhead('Player Interactions'),
                getLastByPlayer()
            )
        );
    };

    const handleInput = (msg) => {
        let args;

        if (msg.type !== "api") {
            return;
        }

        args = msg.content.split(/\s+--/);
        switch(args[0]) {
            case '!motd':
                if(args.includes('help')){
                    showHelp(msg.playerid);
                }
                if(1 === args.length){
                    let player = getObj('player',msg.playerid);
                    showToPlayer(player);
                } else if (playerIsGM(msg.playerid)){
                    // find players on list
                    let names = args.slice(1);
                    let players = findObjs({ type: 'player' });

                    if(names.includes('all')){
                        players.forEach(p=>{
                            if(true == p.get('online')){
                                showToPlayer(p);
                            }
                        });
                    } else {
                        args.slice(1).forEach(n=>{
                            let key = n.toLowerCase().replace(/\s+/,'');
                            let match = players.find((p)=>{
                                return -1 !== p.get('displayname').toLowerCase().replace(/\s+/,'').indexOf(key);
                            });
                            if(match){
                                showToPlayer(match);
                            }
                        });
                    }

                    // send them each the listing.
                }
                break;
        }
    };

    const handlePlayerLogin = (obj) => {
        if( true === obj.get('online') && (
            state.MotD.playerTimes[obj.id] === undefined ||
            state.MotD.playerTimes[obj.id] < (_.now() - playerOnlineCooldown) 
        )){
            setTimeout(function(){
                showToPlayer(obj);
            },loginSendDelay);
        }
        state.MotD.playerTimes[obj.id] = _.now();
    };

    const handleNoteChange = (obj) => {
        if(obj.id === motdNoteId) {
            log('MotD Note changed.');
            setTimeout(()=>{
                obj.get('notes',(notes) => {
                    obj.get('gmnotes',(gmNotes)=>{
                        loadMotDNote(notes, gmNotes, obj.get('avatar'));
                    });
                });
            },loginSendDelay);
        }
    };

    const handleNoteDestroy = (obj) => {
        if(obj.id === motdNoteId) {
            createMotDNote();
        }
    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('change:player:_online', handlePlayerLogin);
        on('change:handout', handleNoteChange);
        on('destroy:handout', handleNoteDestroy);
    };

    on('ready',function() {
        checkInstall(function(){
            registerEventHandlers();
        });
    });
})();

