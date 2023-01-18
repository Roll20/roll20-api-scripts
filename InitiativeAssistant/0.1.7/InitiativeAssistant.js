// Github:   https://github.com/shdwjk/Roll20API/blob/master/InitiativeAssistant/InitiativeAssistant.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron
var API_Meta = API_Meta||{}; //eslint-disable-line no-var
API_Meta.InitiativeAssistant={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.InitiativeAssistant.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-6);}}

const InitiativeAssistant = (() => { // eslint-disable-line no-unused-vars

  const scriptName = 'InitiativeAssistant';
  const version = '0.1.7';
  API_Meta.InitiativeAssistant.version = version;
  const lastUpdate = 1671328108;
  const schemaVersion = 0.2;

  const sorters = {
    'None': (to) => to,
    'Ascending': (to) => _.sortBy(to,(i) => (i.pr)),
    'Descending': (to) => _.sortBy(to,(i) =>(-i.pr))
  };

  const checkInstall = () =>  {
    log(`-=> ${scriptName} v${version} <=-  [${new Date(lastUpdate*1000)}]`);

    if( ! state.hasOwnProperty(scriptName) || state[scriptName].version !== schemaVersion) {
      log(`  > Updating Schema to v${schemaVersion} <`);
      switch(state[scriptName] && state[scriptName].version) {

        case 0.0:
          /* break; // intentional dropthrough */ /* falls through */

        case 'UpdateSchemaVersion':
          state[scriptName].version = schemaVersion;
          break;

        default:
          state[scriptName] = {
            version: schemaVersion,
            config: {
              sortOption: 'None'
            }
          };
          break;
      }
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


  const getConfigOption_SortOptions = () => {
    let text = state.InitiativeAssistant.config.sortOption;
    return '<div>'+
      'Sort Options is currently <b>'+
      text+
      '</b>.'+
      '<div>'+
      _.map(_.keys(sorters),(so) => {
        return '<a href="!init-assist-config --sort-option|'+so+'">'+
          so+
          '</a>';
      }).join(' ')+
        '</div>'+
        '</div>';
  };

  const showHelp = (who) => {
    sendChat('','/w "'+who+'" '
      +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
      +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
      +'InitiativeAssistant v'+version
      +'</div>'
      +'<div style="padding-left:10px;margin-bottom:3px;">'
      +'<p>Provides an easy interface to adding players into the initiative, particularly if they are manually rolling.</p>'
      +'</div>'
      +'<b>Commands</b>'
      +'<div style="padding-left:10px;">'
      +'<b><span style="font-family: serif;">!init-assist [ [--'+ch('<')+'name fragment'+ch('>')+'|'+ch('<')+'number'+ch('>')+'] ...] | --help</span></b>'
      +'<div style="padding-left: 10px;padding-right:20px">'
      +'<p>Adds one or more characters to the initiative order.</p>'
      +'<ul>'
      +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
      +'<b><span style="font-family: serif;">'+ch('<')+'name fragment'+ch('>')+'</span></b> '+ch('-')+' A part of the name of the character to add.  This can be the full name, or just a few letters.  Case-insensitive.'
      +'</li> '
      +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
      +'<b><span style="font-family: serif;">'+ch('<')+'number'+ch('>')+'</span></b> '+ch('-')+' A number or inline roll representing the character'+ch("'")+'s initiative score.'
      +'</li> '
      +'</ul>'
      +'</div>'
      +'</div>'
      +getConfigOption_SortOptions()
      +'</div>'
    );
  };

  const keyFormat = (text) => (text && text.toLowerCase().replace(/\s+/g,'')) || undefined;
  const matchKey = (keys,subject) => subject && undefined !== keys.find((o)=>(-1 !== subject.indexOf(o)));

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

  const handleInput = (msg) => {

    if (msg.type !== "api" || !playerIsGM(msg.playerid)) {
      return;
    }

    let who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');

    let args = processInlinerolls(msg)
      .replace(/<br\/>\n/g, ' ')
      .replace(/(\{\{(.*?)\}\})/g," $2 ")
      .split(/\s+--/);

    switch(args.shift()) {
      case '!init-assist': {
          if( !args.length || args.includes('help')) {
            showHelp(who);
            return;
          }

          let keys=[];
          let lookup = args.reduce((m,p) => {
            let parts=p.split(/\|/),
            key=keyFormat(parts[0]);

            keys.push(key);

            m[key]={
              key: key,
              input: parts[0],
              init: parts[1]
            };
            return m;
          },{});

          let characters = findObjs({type:'character'})
            .filter(c=>matchKey(keys,keyFormat(c.get('name'))));

          let characterList = characters.reduce(
            (m,c) => {
              let ckey = keyFormat(c.get('name')||'');
              let key = keys.find((k) => {
                return (-1 !== ckey.indexOf(k));
              });

              m[key] = (m[key] ? m[key].push(c) && m[key] : [c]);

              return m;
            },
            {}
          );

          let redos={};
          let to=JSON.parse(Campaign().get('turnorder')||'[]');
          keys.forEach((k) => {
            let character;
            if(characterList[k]) {
              if(1 === characterList[k].length) {
                character = findObjs({
                  type: 'graphic',
                  pageid: Campaign().get('playerpageid'),
                  subtype: 'token',
                  represents: characterList[k][0].id
                })[0];
                if(character) {
                  to = to.filter((i) => character.id !== i.id);
                  to.push({
                    id: character.id,
                    pr: lookup[k].init,
                    _pageid: character.get('pageid')
                  });
                } else {
                  lookup[k].matches=characterList[k];
                  redos.NT=(redos.NT ? redos.NT.push(lookup[k]) && redos.NT : [lookup[k]]);
                }
              } else {
                lookup[k].matches=characterList[k];
                redos.DUP=(redos.DUP ? redos.DUP.push(lookup[k]) && redos.DUP : [lookup[k]]);
              }
            } else {
              redos.NM=(redos.NM ? redos.NM.push(lookup[k]) && redos.NM : [lookup[k]]);
            }
          });
          Campaign().set({
            turnorder: JSON.stringify(sorters[state.InitiativeAssistant.config.sortOption](to))
          });

          let output='';
          //_.each(redos,(rs,k) => {
          Object.keys(redos).forEach(k=>{
            let params=[];
            switch(k){
              case 'NT':
                output+=
                '<div style="border: 1px solid #999999;">'+
                  '<h3>Please Add Tokens</h3>'+
                  '<div>'+
                  redos[k].map((r) => {
                    let c = r.matches[0];
                    params.push('--'+r.key+'|'+r.init);
                    return '<div>'+
                      '<img style="background-color: white; border: 1px solid #ccc; max-width: 60px; max-height: 60px; float:left" src="'+c.get("avatar")+'">'+
                      '<b>'+c.get("name")+'</b>'+
                      '<div style="clear:both;"></div>'+
                      '</div>';
                  }).join(' ')+
                    '</div>'+
                    '<p>After adding tokens for the above characters: <a href="!init-assist '+params.join(' ')+'">Add Turn(s)</a></p>'+
                    '</div>';
                  break;

                case 'DUP':
                  output+=
                  '<div style="border: 1px solid #999999;">'+
                    '<h3>Which One?</h3>'+
                    '<div>'+
                    redos[k].map((r) => {
                      return '<h4>'+
                        r.input+
                        '<h4>'+
                        '<div style="margin-left:15px;">'+
                        _.map(r.matches,(c) => {
                          let button='<a style="float:right;" href="!init-assist --'+keyFormat(c.get('name'))+'|'+r.init+'">Pick</a>';
                          return '<div>'+
                            '<img style="background-color: white; border: 1px solid #ccc; max-width: 60px; max-height: 60px; float:left" src="'+c.get("avatar")+'">'+
                            button+
                            '<b>'+c.get("name")+'</b>'+
                            '<div style="clear:both;"></div>'+
                            '</div>';
                        }).join('')+
                          '</div>';
                    }).join(' ')+
                      '</div>'+
                      '</div>';
                    break;

                  case 'NM':
                    output+=
                    '<div style="border: 1px solid #999999;">'+
                      '<h3>No Matching Characters</h3>'+
                      '<div>'+
                      redos[k].map((r) => {
                        return '<div>'+
                          r.input+
                          '</div>';
                      }).join(' ')+
                        '</div>'+
                        '</div>';
                      break;
            }
          });
          if(output){
            sendChat('Initiative Assistant','/w "'+who+'" '+output);
          }

        }
        break;
      case '!init-assist-config':
        if(_.contains(args,'--help')) {
          showHelp(who);
          return;
        }
        if(!args.length) {
          sendChat('','/w "'+who+'" '
            +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
            +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
            +'InitiativeAssistant v'+version
            +'</div>'
            +getConfigOption_SortOptions()
            +'</div>'
          );
          return;
        }
        _.each(args,(a) => {
          let opt=a.split(/\|/),
          msg='';
          switch(opt.shift()) {
            case 'sort-option':
              if(sorters[opt[0]]) {
                state.InitiativeAssistant.config.sortOption=opt[0];
              } else {
                msg='<div><b>Error:</b> Not a valid sort method: '+opt[0]+'</div>';
              }
              sendChat('','/w "'+who+'" '
                +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                +msg
                +getConfigOption_SortOptions()
                +'</div>'
              );
              break;

            default:
              sendChat('','/w "'+who+'" '
                +'<div><b>Unsupported Option:</div> '+a+'</div>'
              );
          }

        });

        break;
    }
  };

  const registerEventHandlers = () => {
    on('chat:message', handleInput);
  };

  on('ready',() => {
    checkInstall();
    registerEventHandlers();
  });

  return {
    // Public interface here
  };

})();


{try{throw new Error('');}catch(e){API_Meta.InitiativeAssistant.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.InitiativeAssistant.offset);}}
