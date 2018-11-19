// Github:   https://github.com/shdwjk/Roll20API/blob/master/MotD/MotD.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

const MotD = (function() {
    'use strict';

    var version = '0.2.8',
    lastUpdate = 1534791672,
    schemaVersion = 0.2,
    motdNoteId,
    motdNoteName = 'MotD Note',
    motdText,
    loginSendDelay = 10000, // 10 seconds
    playerOnlineCooldown =  21600000, // 6 hours (6hrs * 60minutes * 60seconds * 1000miliseconds)

    loadMotDNote = function (text) {
        motdText=text.replace(/(\r\n|\r|\n|\n<br>|<br>\n)/gi,'<br>');
    },

    createMotDNote = function() {
        var motdNote = createObj('handout',{
            name: motdNoteName
        });
        motdText='Welcome to the Game!';
        motdNote.set('notes',motdText);
        motdNoteId = motdNote.id;
    },

    showToPlayer = (p) => {
        let who = p.get('displayname');
        sendChat('MotD','/w "'+who+'" '+
            motdText
                .replace(/%%NAME%%/g,who)
                .replace(/<br\s*\/?>\s*\n/ig,'<br />')
                .replace(/\n/ig,'<br />')
        );
        state.MotD.playerShownLast[p.id] = _.now();
    },

    checkInstall = function(callback) {
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

        var motdNote = filterObjs(function(o){
            return ( 'handout' === o.get('type') && motdNoteName === o.get('name') && false === o.get('archived'));
        })[0];
        if(motdNote) {
            motdNoteId = motdNote.id;
            motdNote.get('notes',function(n) {
                loadMotDNote(n);
                callback2();
            });
        } else {
            createMotDNote();
            callback2();
        }
    },

    ch = function (c) {
        var entities = {
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
    },

    _h = {
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
    },

    getRelativeDate = (ms) => {
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
    },

    getLastByPlayer = () => {
        return _h.ul(..._.chain(findObjs({type: 'player'}))
            .map((p)=>`${_h.bold(p.get('displayname'))}: ${
                _h.ul(
                    `${_h.bold('Shown:')} ${getRelativeDate(state.MotD.playerShownLast[p.id])}`,
                    `${_h.bold('Seen:')} ${getRelativeDate(state.MotD.playerTimes[p.id])}`
                )}`)
            .value()
        );
    },

    showHelp = function(playerid) {
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
                            `--help`
                        )
                    ),
                    _h.ul(
                        `${_h.bold('--help')} -- Shows the Help screen`
                    )
                ),
                _h.minorhead('Player Interactions'),
                getLastByPlayer()
            )
        );
    },

    handleInput = function(msg) {
        var args;

        if (msg.type !== "api") {
            return;
        }

        args = msg.content.split(/\s+/);
        switch(args[0]) {
            case '!motd':
                showHelp(msg.playerid);
                break;
        }
    },

    handlePlayerLogin = function(obj) {
        if( true === obj.get('online') && (
            state.MotD.playerTimes[obj.id] === undefined ||
            state.MotD.playerTimes[obj.id] < (_.now() - playerOnlineCooldown) 
        )){
            setTimeout(function(){
                showToPlayer(obj);
            },loginSendDelay);
        }
        state.MotD.playerTimes[obj.id] = _.now();
    },

    handleNoteChange = function(obj) {
        if(obj.id === motdNoteId) {
            obj.get('notes',function(n) {
                loadMotDNote(n);
            });
        }
    },

    handleNoteDestroy = function(obj) {
        if(obj.id === motdNoteId) {
            createMotDNote();
        }
    },

    registerEventHandlers = function() {
        on('chat:message', handleInput);
        on('change:player:_online', handlePlayerLogin);
        on('change:handout', handleNoteChange);
        on('destroy:handout', handleNoteDestroy);
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
}());

on('ready',function() {
    'use strict';

    MotD.CheckInstall(function(){
        MotD.RegisterEventHandlers();
    });
});
