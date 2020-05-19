// Github:   https://github.com/shdwjk/Roll20API/blob/master/PeekCard/PeekCard.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

const PeekCard = (() => { // eslint-disable-line no-unused-vars

    const version = '0.1.0';
    const lastUpdate = 1546387606;
    const schemaVersion = 0.1;

    const css = {
        msg: "border:1px solid #999;border-radius:1em;background-color:white;padding:.5em;",
        clear: "clear:both;",
        outer: "margin:.25em;float:left;",
        img: "width:100%;height:100%;min-width:0;min-height:0; max-width:1000em;max-height:1000em;",
        hidden: "box-shadow: 0 0 8px 2px #999;background-color:#999;",
        visible: ""
    };

    const playedCards = {};
    const cardPlayers = {};

    const checkInstall = () =>  {
        log('-=> PeekCard v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! state.hasOwnProperty('PeekCard') || state.PeekCard.version !== schemaVersion) {
            log(`  > Updating Schema to v${schemaVersion} <`);
            state.PeekCard = {
                version: schemaVersion,
                config: {
                    imgScale: 25
                }
            };
        }
    };

	const esRE = function (s) {
      const escapeForRegexp = /(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g;
      return s.replace(escapeForRegexp,"\\$1");
    };

    const HE = (() => {
      const entities={
              '&' : '&'+'amp'+';',
              '<' : '&'+'lt'+';',
              '>' : '&'+'gt'+';',
              "'" : '&'+'#39'+';',
              '@' : '&'+'#64'+';',
              '{' : '&'+'#123'+';',
              '|' : '&'+'#124'+';',
              '}' : '&'+'#125'+';',
              '[' : '&'+'#91'+';',
              ']' : '&'+'#93'+';',
              '"' : '&'+'quot'+';'
          };
      const re=new RegExp(`(${Object.keys(entities).map(esRE).join('|')})`,'g');
      return (s) => s.replace(re, (c) => (entities[c] || c) );
    })();

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
        group: (...o) => `${o.join(' ')}`,
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

    const showHelp = (who) => {
        sendChat('',`/w "${who}" `+
            _h.outer(
                _h.title('PeekCard', version),
                _h.header(
                    _h.paragraph(`PeekCard lets you look at the cards you${ch("'")}ve played face down without needing to pick them up.`)
                ),
                _h.subhead('Commands'),
                _h.inset(
                    _h.font.command(
                        `!peek-card`,
                        _h.optional(
                            `--help`,
                            `TOKEN_ID ...`
                        )
                    ),
                    _h.paragraph( 'Whispers you the cards you have selected that you played (or that you can see).'),
                    _h.ul(
                        `${_h.bold('--help')} -- Shows the Help screen.`,
                        `${_h.bold('TOKEN_ID ...')} -- Optionally provide a list of token ids to show you.`
                    )
                ),
                _h.subhead('Description'),
                _h.inset(
                    _h.paragraph('Executing the !peek-card command when you have cards selected will show you the hidden side if you played them.  You can also select any cards that are face up, regardless of who played them, to get a better look.  Hovering over the resulting image will show a large version of the card.')
                )
            )
        );
    };

    const makeTip = (img,w,h) => HE(`<span style="display:block;background-image: url('${img.replace(/\/(med|thumb)\./,'/max.')}');background-repeat:no-repeat;background-size:cover;width:${((w/h)*state.PeekCard.config.imgScale)}em;height:${state.PeekCard.config.imgScale}em;">&nbsp;</span>`);

    const showCard = (c) => {
        const img =decodeURIComponent(c.get('sides').split(/\|/)[0]);
        return `<div style='${css.outer}height:5em;width:${(c.get('width')/c.get('height'))*5}em;'><img class="showtip tipsy" title="${makeTip(img,c.get('width'),c.get('height'))}" style='${css.img}${c.get('currentSide')===0 ? css.visible : css.hidden}' src="${img}"></div>`;
    };
    const wrapper = (b) => `<div style='${css.msg}'>${b}<div style='${css.clear}'></div></div>`;

    const handleGraphicChange = (obj)=>{
        // if card was taken from hand, set owner and remove reference, else add to playedCards
        let cardid = obj.get('cardid');
        if(cardPlayers.hasOwnProperty(cardid)){
            obj.set({
                controlledby: [...new Set([
                    ...obj.get('controlledby').split(/,/),
                    cardPlayers[cardid]
                    ])].join(',')
            });
            
            delete cardPlayers[cardid];
        } else {
            playedCards[cardid]=obj.id;
        }
    };

    const handleHandChange = (obj,prev)=>{
        // if card was played to table, set owner and remove reference, else add to cardPlayers
        const phand = prev.currentHand.split(/,/);
        const chand = obj.get('currentHand').split(/,/);
        const pcid = phand.find(id => !chand.includes(id));
        if(pcid) {
            if(playedCards.hasOwnProperty(pcid)){
                let card = getObj('graphic',playedCards[pcid]);
                if(card){
                    card.set({
                        controlledby: [...new Set([
                            ...card.get('controlledby').split(/,/),
                            obj.get('parentid')
                            ])].join(',')
                    });
                }
                delete playedCards[pcid];
            } else {
                cardPlayers[pcid] = obj.get('parentid');
            }
        }
    };
    
    const handleInput = (msg) => {
        if('api'===msg.type && /^!peek-card\b/i.test(msg.content)){
            let who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');

            if(/\s--help\b/i.test(msg.content)){
                showHelp(who);
                return;
            }

            sendChat('Peak Card',`/w "${who}" ${wrapper(
                [...new Set([
                        ...msg.content.split(/\s+/).splice(1),
                        ...(msg.selected || []).filter(o=>'graphic'===o._type).map(g=>g._id)
                    ])
                ]
                .map(id=>getObj('graphic',id))
                .filter(o =>
                    undefined !== o &&
                    o.get('subtype') === 'card' &&
                    (o.get('controlledby').split(/,/).includes(msg.playerid) || 0 === o.get('currentSide'))
                )
                .map( c => showCard(c))
                .join('')
            )}`);

        }
    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('add:graphic', handleGraphicChange);
        on('change:hand', handleHandChange);
    };

    on('ready', () => {
        checkInstall();
        registerEventHandlers();
    });

    return {
        // Public interface here
    };

})();

