// Github:   https://github.com/shdwjk/Roll20API/blob/master/PCPP/PCPP.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var PCPP = PCPP || (function() {
  'use strict';

  var version = '0.3.3',
    lastUpdate = 1530976126,
    schemaVersion = 0.1,

  powerCardFunction = ()=>{},

  checkInstall = function() {
    log('-=> PCPP v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

    if("undefined" !== typeof PowerCard && _.isFunction(PowerCard.Process)) {
      powerCardFunction = PowerCard.Process;
    } else if("undefined" !== typeof PowerCardScript && _.isFunction(PowerCardScript.Process)) {
      powerCardFunction = PowerCardScript.Process;
    } else if("undefined" !== typeof PowerCards && _.isFunction(PowerCards.Process)) {
      powerCardFunction = PowerCards.Process;
    } else {
      log('No Powercard Script Found.');
    }
  },

  handleInput = function(msg_orig) {
    var msg=_.clone(msg_orig),
      args,
      postMap,
      preMap={},
      expr,
      player_obj = getObj("player", msg.playerid);

    if (msg.type !== "api") {
      return;
    }

    args = msg.content.split(/\s+/);
    switch(args[0]) {
      case '!pcpp':

        // Get the API Chat Command
        msg.who = msg.who.replace(" (GM)", "");
        msg.content = msg.content.replace("(GM) ", "");
        msg.content = msg.content.replace(/<br\/>\n/g, ' ').replace(/({{(.*?)}})/g," $2 ");

        postMap = _.reduce(
          msg.content.match(/\[#\[(.*?)\]#\]/g),
          function(gmap,g){
            var attrmap=_.reduce(g.match(/@#\{(.*?)\}/g), function(amap,a){
              var parts=a.match(/@#\{([^|]*)\|([^|]*)\|?(.*)?\}/),
              character = findObjs({
                type:'character',
                name: parts[1]
              })[0],
              attr;

              amap[a]=0;
              if(character) {
                attr = findObjs({
                  type: 'attribute',
                  characterid: character.id,
                  name: parts[2]
                })[0];
                if(attr) {
                  amap[a]=attr.get(parts[3]==='max'?'max':'current');
                }
              }
              return amap;
            },{});
            attrmap['[#[']='[[';
              attrmap[']#]']=']]';
              gmap[g]=_.reduce(attrmap,function(gmemo,v,k){
                return gmemo.replace(k,v);
              },g);
              return gmap;
          },{});

          postMap = _.reduce(
            msg.content.match(/\[=\[(.*?)\]=\]/g),
            function(gmap,g){
              var attrmap=_.reduce(g.match(/@#\{(.*?)\}/g), function(amap,a){
                var parts=a.match(/@#\{([^|]*)\|([^|]*)\|?(.*)?\}/),
                character = findObjs({
                  type:'character',
                  name: parts[1]
                })[0],
                attr;

                amap[a]=0;
                if(character) {
                  attr = findObjs({
                    type: 'attribute',
                    characterid: character.id,
                    name: parts[2]
                  })[0];
                  if(attr) {
                    amap[a]=attr.get(parts[3]==='max'?'max':'current');
                  }
                }
                return amap;
              },{});
              attrmap['[=[']='[[';
                attrmap[']=]']=']]';
                preMap[g]=true;
                gmap[g]=_.reduce(attrmap,function(gmemo,v,k){
                  return gmemo.replace(k,v);
                },g);
                return gmap;
            },postMap);

            expr=_.reduce(postMap,function(m,g){return m+g;},'').replace(/\s+/g,'');

            if(expr) {
              sendChat('',expr,function(res){
                var num = (msg.inlinerolls && msg.inlinerolls.length) || 0,
                extraInlineRolls = _.toArray(res[0].inlinerolls);
                msg.inlinerolls = msg.inlinerolls || [];

                msg.content=_.reduce(postMap,function(msgCon,v,k){
                  var roll = extraInlineRolls.shift();
                  if(preMap[k]) {
                    return msgCon.replace(k, ((roll.results && roll.results.total) || '') );
                  } 

                  msg.inlinerolls.push(roll);
                  return msgCon.replace(k,'$[['+(num++)+']]');
                },msg.content);

                powerCardFunction(msg,player_obj);
              });
            } else {
              powerCardFunction(msg,player_obj);
            }

            break;
    }
  },

  registerEventHandlers = function() {
    on('chat:message', handleInput);
  };

  return {
    CheckInstall: checkInstall,
    RegisterEventHandlers: registerEventHandlers
  };

}());

on('ready',function() {
  'use strict';

  PCPP.CheckInstall();
  PCPP.RegisterEventHandlers();
});



