// Github:   https://github.com/shdwjk/Roll20API/blob/master/ColorNote/ColorNote.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron
var API_Meta = API_Meta||{}; //eslint-disable-line no-var
API_Meta.ColorNote={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.ColorNote.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-6);}}

const ColorNote = (() => {  // eslint-disable-line no-unused-vars
    const version = '0.2.4';
    API_Meta.ColorNote.version = version;
    const lastUpdate = 1621437645;

    const processInlinerolls = (msg) => {
        if(msg.hasOwnProperty('inlinerolls')){
            return msg.inlinerolls
            .reduce((m,v,k) => {
                let ti=v.results.rolls.reduce((m2,v2) => {
                    if(v2.hasOwnProperty('table')){
                        m2.push(v2.results.reduce((m3,v3) => [...m3,v3.tableItem.name],[]).join(", "));
                    }
                    return m2;
                },[]).join(', ');
                return [...m,{k:`$[[${k}]]`, v:(ti.length && ti) || v.results.total || 0}];
            },[])
            .reduce((m,o) => m.replace(o.k,o.v), msg.content);
        } else {
            return msg.content;
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
            '*' : 'ast',
            '/' : 'sol',
            ' ' : 'nbsp'
        };

        if( entities.hasOwnProperty(c) ){
            return `&${entities[c]};`;
        }
        return '';
    };
 
	const checkInstall = function(){
        log('-=> ColorNote v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
	};
 
	const showHelp = function(who) {
        sendChat('',
            '/w "'+who+'" '
+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
	+'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
		+'ColorNote v'+version
	+'</div>'
	+'<div style="padding-left:10px;margin-bottom:3px;">'
		+'<p>ColorNote provides a way for players to output text similar to <code>/em</code>, but colored based on their player color.</p>'
	+'</div>'
	+'<b>Commands</b>'
	+'<div style="padding-left:10px;">'
		+'<b><span style="font-family: serif;">!note '+ch('<')+'message'+ch('>')+'</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'<p>Sends a message in the same manner as <i>/em</i> does, but with their player color as the background. Foreground text will be white or black based on the brightness of the player color.</p>'
			+'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">'+ch('<')+'message'+ch('>')+'</span></b> '+ch('-')+' The message to output as part of the note.'
				+'</li> '
			+'</ul>'
		+'</div>'
	+'</div>'
+'</div>'
            );
    };

	const getBrightness = function (hex) {
		let r,g,b;
		hex = hex.replace('#', '');
		r = parseInt(hex.substr(0, 2),16);
		g = parseInt(hex.substr(2, 2),16);
		b = parseInt(hex.substr(4, 2),16);
		return ((r * 299) + (g * 587) + (b * 114)) / 1000;
	};
	
	const handleInput = function(msg) {
		let args, who, color, txcolor;

		if (msg.type !== "api") {
			return;
		}

		who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');

		args = processInlinerolls(msg).split(/\s+/);
		switch(args[0]) {
			case '!note':
				if(1 === args.length) {
					showHelp(who);
				} else {
					color=getObj('player',msg.playerid).get('color').split(' ')[0];
					txcolor = (getBrightness(color) < (255 / 2)) ? "#FFF" : "#000";
					sendChat('','/direct '
						+"<div style=\""
							+" background-color: "+color+";"
							+" color: "+txcolor+";"
							+" display: block;"
                            +" margin-left: -40px;"
							+" font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;"
							+" font-size: 14px;"
							+" font-style: italic;"
							+" font-weight: bold;"
							// +" position: relative;"
                        // +" right: 21px;"
							+" line-height: 17.0625px;"
							+" padding-top: 7px;"
							+" padding-bottom: 7px;"
							+" padding-left: 5px;"
							+" padding-right: 5px;"
							+" text-align: center;"
							+" word-wrap: break-word;"
							+" zoom: 1;"
							+"\">"
						+_.rest(args).join(' ')
						+"</div>"
					);
				}

				break;
		}
	};
 
	const registerEventHandlers = function() {
		on('chat:message', handleInput);
	};

    on("ready",() => {
        checkInstall();
        registerEventHandlers();
    });
 
	return {
	};
})();
 
{try{throw new Error('');}catch(e){API_Meta.ColorNote.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.ColorNote.offset);}}
