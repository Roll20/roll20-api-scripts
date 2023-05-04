// Github:   https://github.com/shdwjk/Roll20API/blob/master/TokenNameNumber/TokenNameNumber.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron
var API_Meta = API_Meta||{}; // eslint-disable-line no-var
API_Meta.TokenNameNumber={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.TokenNameNumber.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-6);}}

/* global libTokenMarkers */
const TokenNameNumber = (() => { // eslint-disable-line no-unused-vars

  const scriptName = "TokenNameNumber";
  const version = '0.5.15';
  API_Meta.TokenNameNumber.version = version;
  const lastUpdate = 1631838318;
  const schemaVersion = 0.7;

  let tokenIds = [];

  const checkInstall = () => {    
    log(`-=> ${scriptName} v${version} <=-  [${new Date(lastUpdate*1000)}]`);

    if( ! state.hasOwnProperty(scriptName) || state[scriptName].version !== schemaVersion) {
      log('  > Updating Schema to v'+schemaVersion+' <');
      switch(state[scriptName] && state[scriptName].version) {
        case 0.3: 
        case 0.4:
          delete state[scriptName].globalConfigCache;
          state[scriptName].globalconfigCache = {lastsaved:0};

          /* falls through */
        case 0.5:
          state[scriptName].config.autoNumber = false;
          state[scriptName].config.autoNumberPosition = "End";
          state[scriptName].config.autoNumberSeparator = '';

          /* falls through */
        case 0.6:
          delete state[scriptName].globalconfigCache;

          /* falls through */
        case 'UpdateSchemaVersion':
          state[scriptName].version = schemaVersion;
          break;

        default:
          state[scriptName] = {
            version: schemaVersion,
            config: {
              randomSpace: 0,
              zeroBiased: true,
              useDots: false,
              dots: ['red','brown','yellow','green','blue','purple']
            },
            registry: {
            }
          };
          break;
      }
    }

    if(state[scriptName].config.useDots && (0 === state[scriptName].config.dots.length)){
      sendChat('',`/w gm <div style="color:red;font-weight:bold;border:2px solid red;background-color:black;border-radius:1em;padding:1em;">TokenNameNumber is configured to use Dots, but no dots are selected!  Configure dots in the help: <a href="!tnn">Config</a></div>`);
    }

    // Make sure libTokenMarkers exists, and has the functions that are expected
    if('undefined' === typeof libTokenMarkers
      || (['getStatus','getStatuses','getOrderedList'].find(k=>
        !libTokenMarkers.hasOwnProperty(k) || 'function' !== typeof libTokenMarkers[k]
      ))
    ) { 
      // notify of the missing library
      sendChat('',`/w gm <div style="color:red;font-weight:bold;border:2px solid red;background-color:black;border-radius:1em;padding:1em;">Missing dependency: <code>libTokenMarkers</code>  Please install from the 1-click or download <a href="https://github.com/shdwjk/Roll20API/blob/master/libTokenMarkers/libTokenMarkers.js">here</a>.</div>`);
      return false;
    } else {
      return true;
    }

  };

  const getPageForPlayer = (playerid) => {
    let player = getObj('player',playerid);
    if(playerIsGM(playerid)){
      return player.get('lastpage') || Campaign().get('playerpageid');
    }

    let psp = Campaign().get('playerspecificpages');
    if(psp[playerid]){
      return psp[playerid];
    }

    return Campaign().get('playerpageid');
  };

  const esRE = (s) => s.replace(/(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g,'\\$1');

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

  ////////////////////////////////////////////////////////////

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
    statusCell: (o) =>  `<div style="width: 130px; padding: 0 3px; height: 1.5em; float: left;">${libTokenMarkers.getStatus(o).getHTML(3)}${o}</div>`,
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
  ////////////////////////////////////////////////////////////

  const getConfigOption_RandomSpace = () => {
    let text = ( state[scriptName].config.randomSpace > 0 ?
      '<span style="color: green; font-weight:bold;">'+ state[scriptName].config.randomSpace+ '</span>' :
    '<span style="color: red; font-weight:bold;">Off</span>' );
    return '<div>'+
      'Random Space of numbers between each consecutively generated token number:'+
      text+'. '+
      '<a href="!tnn-config --random-space|?{size of the random gap between token numbers (0 for off, any number for a range from 1 to that number)?|'+state[scriptName].config.randomSpace+'}">'+
      'Set Random Space'+
      '</a>'+
      '</div>';
  };

  const getConfigOption_UseDots = () => {
    let text = (state[scriptName].config.useDots ?
      '<span style="color: green; font-weight:bold;">On</span>' :
    '<span style="color: red; font-weight:bold;">Off</span>');

    return '<div>'+
      'Use Dots is currently <b>'+
      text+
      '</b>.'+
      '<a href="!tnn-config --toggle-use-dots">Toggle</a>'+
      '</div>';
  };

  const getConfigOption_ZeroBiased = () => {
    let text = (state[scriptName].config.zeroBiased ?
      '<span style="color: green; font-weight:bold;">On</span>' :
    '<span style="color: red; font-weight:bold;">Off</span>');

    return '<div>'+
      'Zero Biased is currently <b>'+
      text+
      '</b>.'+
      '<a href="!tnn-config --toggle-zero-biased">Toggle</a>'+
      '<br>(Turn this setting off if your Token Markers should create matching numbers.)'+
      '</div>';
  };

  const getStatusButton = (status) => `<a style="background-color: transparent; padding: 0;" href="!tnn-config --toggle-dot|${status.replace(/:/g,';')}">${libTokenMarkers.getStatus(status).getHTML(3)}</a>`;

  // https://app.roll20.net/images/statussheet.png
  const getConfigOption_Dots = () => {
    let allStatuses = libTokenMarkers.getOrderedList().filter(s => 'dead' !== s.getTag());
    return '<div>'+
      '<div>'+
      '<div style="font-weight: bold;">Dots (Click to move between pools).</div>'+
      '<div style="border: 1px solid #999999;border-radius: 10px; background-color: #eeffee;">'+
      state[scriptName].config.dots.map((s) => {
        return getStatusButton(s);
      }).join('')+
        '</div>'+
        '</div>'+
        '<div>'+
        '<div style="font-weight: bold;">Available Statuses</div>'+
        '<div style="border: 1px solid #999999;border-radius: 10px; background-color: #ffeeee;">'+
        allStatuses
          .filter(s => !state[scriptName].config.dots.includes(s.getTag()))
          .map(s =>getStatusButton(s.getTag()) ).join('')+
        '</div>'+
        '</div>'+
        '</div>';
  };

  const getAllConfigOptions = () => `<ul>${[
    getConfigOption_RandomSpace(),
    getConfigOption_UseDots(),
    getConfigOption_ZeroBiased(),
    getConfigOption_Dots()
    ].map(c => `<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">${c}</li>`).join('')}</ul>`;

    const showHelp = (who) => {
      sendChat('',`/w "${who}" `+
        _h.outer(
          _h.title(scriptName, version),
          _h.header(
            _h.paragraph(`Provides automatic numbering of tokens dragged into onto the tabletop.  Token names need to have the special word ${_h.bold('%%NUMBERED%%')} somewhere in them.`)
          ),
          _h.subhead('Commands'),
          _h.inset(
            _h.font.command(
              `!tnn`,
              _h.optional(
                `--help`,
                `--renumber`
              )
            ),
            _h.ul(
              `${_h.bold('--help')} -- Displays the help and configuration options.`,
              `${_h.bold('--renumber')} -- Renumbers tokens based on the current rules.`
            )
          ),
          _h.section('Configuration',
            getAllConfigOptions()
          )
        )
      );
    };

    const handleInput = (msg) => {
      if (msg.type !== "api" || !playerIsGM(msg.playerid)) {
        return;
      }
      let who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');

      let args = msg.content.split(/\s+--/);
      switch(args.shift()) {
        case '!tnn':
          if(0 === args.length || args.includes('help')) {
              showHelp(who);
          }
          args.forEach(a=>{
            switch(a){
              case 'renumber':
                RenumberPage(getPageForPlayer(msg.playerid));
                break;
            }
          });

          break;

        case '!tnn-config':
          if(args.includes('help')) {
            showHelp(who);
            return;
          }
          if(!args.length) {
            sendChat('','/w '+who+' '+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
              '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
              `${scriptName} v${version}`+
              '</div>'+
              getAllConfigOptions()+
              '</div>'
            );
            return;
          }
          args.forEach((a) => {
            let opt=a.split(/\|/);
            switch(opt.shift()) {
              case 'toggle-use-dots':
                state[scriptName].config.useDots=!state[scriptName].config.useDots;
                sendChat('',`/w "${who}" `+
                  '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                  getConfigOption_UseDots()+
                  '</div>'
                );
                break;

              case 'toggle-zero-biased':
                state[scriptName].config.zeroBiased=!state[scriptName].config.zeroBiased;
                sendChat('',`/w "${who}" `+
                  '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                  getConfigOption_ZeroBiased()+
                  '</div>'
                );
                break;

              case 'toggle-dot': {
                  let tag = opt[0].replace(/;/g,':');
                  if(state[scriptName].config.dots.includes(tag)){
                    state[scriptName].config.dots = state[scriptName].config.dots.filter(d=>d !==tag);
                  } else {
                    state[scriptName].config.dots.push(tag);
                  }
                  sendChat('',`/w "${who}" `+
                    '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                    getConfigOption_Dots()+
                    '</div>'
                  );
                }
                break;

              case 'random-space':
                state[scriptName].config.randomSpace=(parseInt(opt[0],10)||0);
                sendChat('',`/w "${who}" `+
                  '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                  getConfigOption_RandomSpace()+
                  '</div>'
                );
                break;

              default:
                sendChat('',`/w "${who}" `+
                  '<div><b>Unsupported Option:</div> '+a+'</div>'
                );
            }

          });

          break;
      }
    };



    const getMatchers = (pageid,represents) => {
      let matchers = [];
      if(state[scriptName].registry.hasOwnProperty(pageid) &&
      state[scriptName].registry[pageid].hasOwnProperty(represents) ) {
        state[scriptName].registry[pageid][represents].forEach((regstr) => {
          matchers.push(new RegExp(regstr));
        });
      }
      return matchers;
    };

    const addMatcher = (pageid,represents,matcherRegExpStr) => {
      if( ! state[scriptName].registry.hasOwnProperty(pageid) ) {
        state[scriptName].registry[pageid] = {};
      }
      if( ! state[scriptName].registry[pageid].hasOwnProperty(represents) ) {
        state[scriptName].registry[pageid][represents]=[matcherRegExpStr];
      } else {
        state[scriptName].registry[pageid][represents] = [...new Set([...state[scriptName].registry[pageid][represents],matcherRegExpStr])];
      }
    };

    const toN = (base) => {
      const toBase = (n) => n<base ? [n] : [...toBase(Math.floor(n/base)),n%base];
      return toBase;
    };

    const getDotNumber = (num) => {
      const rebase = toN(state[scriptName].config.dots.length);
      return rebase(num);
    };

    const saveTokenId = (obj) => {
      tokenIds.push(obj.id);
    };

    const RenumberPage = (pageid) =>{
      let queue = findObjs({
        type: 'graphic',
        subtype: 'token',
        pageid: pageid
      });
      let renameQueue = [...queue];

      const renumberBurndown = () => {
        let t = queue.shift();
        if(t){
          setNumberOnToken(t,{},true);
          setTimeout(renumberBurndown,0);
        }
      };

      const renameBurndown = () => {
        let t = renameQueue.shift();
        if(t){
          resetNameOnToken(t);
          setTimeout(renameBurndown,0);
        } else {
          renumberBurndown();
        }

      };
      renameBurndown();
    };

    const resetNameOnToken = (obj) => {
      let matchers = (getMatchers(obj.get('pageid'), obj.get('represents'))) || [];
      let tokenName = obj.get('name');
      let match;
      matchers.find(m=>match=tokenName.match(m));

      if(match){
        obj.set('name', `${match[1]}%%NUMBERED%%${match[3]}`);
      }
    };

    const setNumberOnToken = (obj,prev,force=false) => {
      if(tokenIds.includes(obj.id) || force){

        if( 'graphic' === obj.get('type') && 'token'   === obj.get('subtype') ) {

          let matchers = (getMatchers(obj.get('pageid'), obj.get('represents'))) || [];
          let tokenName = (obj.get('name'));
          let matcher;
          let renamer;

          if(tokenName.match( /%%NUMBERED%%/ ) || matchers.some((m) => { return m.test(tokenName);}) ) {
            tokenIds=tokenIds.filter(id => id !== obj.id);

            if( 0 === matchers.length || !matchers.some((m) => { return m.test(tokenName);}) ) {
              matcher=`^(${esRE(tokenName).replace(/%%NUMBERED%%/,')(\\d+)(')})$`;
              addMatcher(obj.get('pageid'), obj.get('represents'), matcher );
            }
            if( !matchers.some((m) => {
              if(m.test(tokenName)) {
                matcher=m;
                return true;
              }
              return false;
            }) ) {
              matcher=new RegExp(`^(${esRE(tokenName).replace(/%%NUMBERED%%/,')(\\d+)(')})$`);
              renamer=new RegExp(`^(${esRE(tokenName).replace(/%%NUMBERED%%/,')(%%NUMBERED%%)(')})$`);
            }
            renamer = renamer || matcher;

            let num = (findObjs({
                type: 'graphic',
                subtype: 'token',
                represents: obj.get('represents'),
                pageid: obj.get('pageid')
              })
                .filter((t) => {
                  return matcher.test(t.get('name'));
                })
                .reduce((memo,t) => {
                  let c=parseInt(matcher.exec(t.get('name'))[2],10);
                  return Math.max(memo,c);
                },0)
            );

            num += ( state[scriptName].config.randomSpace ? (randomInteger(state[scriptName].config.randomSpace)-1) : 0);

            if(state[scriptName].config.useDots && state[scriptName].config.dots.length) {
              let digits = getDotNumber(num + (state[scriptName].config.zeroBiased ? 0 : 1) );
              let statuspart = digits.map( (n) => {
                return state[scriptName].config.dots[n];
              }).join(',');
              if(statuspart) {
                obj.set({
                  statusmarkers: statuspart
                });
              }
            }

            let parts=renamer.exec(tokenName);
            obj.set({
              name: parts[1]+(++num)+parts[3]
            });
          }
        }
      }
    };

    const registerEventHandlers = () => {
      on('chat:message', handleInput);
      on('add:graphic', saveTokenId);
      on('change:graphic', setNumberOnToken);
    };

    on("ready",() => {
      if(checkInstall()) {
        registerEventHandlers();
      }
    });

    return {
      NotifyOfCreatedToken: saveTokenId
    };
})();

{try{throw new Error('');}catch(e){API_Meta.TokenNameNumber.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.TokenNameNumber.offset);}}
