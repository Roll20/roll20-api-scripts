/** Acknowledgements
The inspiration for this (and base code!) came from: https://gist.github.com/dyent/6b25dbf9d52843b5bb83
Many, many, many thanks to The Aaron for his ever patient help with making some updates and quality of life changes to the code.
Also more kudos to The Aaron for enabling the handout tracking aspect

Optimum use requires a character to have an ability called 'destiny' with the contents of: !eed characterID(@{character_id}) label(skill:Destiny) 1w (gmdice)
**/

// Provides a way to track and manage light and dark side destiny points.
// !destiny startsession (resets the pool and prompts players to roll destiny and open the tracking handout)
// !destiny status (checks the status of the destiny tokens)
// !destiny reset (resets the tracker to 0)
// !destiny adddark [optional value] (adds dark side points or 1 by default)
// !destiny addlight [optional value] (adds light side points or 1 by default)
// !destiny usedark [optional value] (spends dark side points and adds them to light side, 1 by default)
// !destiny uselight [optional value] (spends light side points and adds them to dark side, 1 by default)
on("ready",function(){
   var version = '0.1.0';
    const schemaVersion = 0.1;
    const    esRE = function (s) {
        var escapeForRegexp = /(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g;
        return s.replace(escapeForRegexp,"\\$1");
    },

    HE = (function(){
        var entities={
            //' ' : '&'+'nbsp'+';',
            ')' : '&'+'#41'+';',
            '@' : '&'+'#64'+';'
        },
        re=new RegExp('('+_.map(_.keys(entities),esRE).join('|')+')','g');
        return function(s){
            return s.replace(re, function(c){ return entities[c] || c; });
        };
    }());
        writeHandout = function(handout){
            handout.set({
                notes: `<div style="width:70px;height:175px;align-text:center;font-size:40px;">`+
                    `<span style="border:30px solid #58C3EF;border-radius:70px;display: inline-block;width:20px;float: center;background-color:#58C3EF;font-weight: bold;font-size:40px;color:black;">${state.destiny.pools.light}</span>`+
                    `<span style="border:30px solid #B60B00;border-radius:70px;display: inline-block;width:20px;float: center;background-color:#B60B00;font-weight: bold;font-size:40px;color:black;">${state.destiny.pools.dark}</span>`+
                `</div>`
            });
        },
        
        getHandout = function(){
            let handout=findObjs({
                type: "handout",
                name: "Destiny Pools"
            })[0];
            if(!handout){
                handout=createObj("handout",{
                    name: "Destiny Pools"
                });
            }
            return handout;
        };

    if(!_.has(state, "destiny")){
        state.destiny={
            schemaVersion: schemaVersion,
            pools: {
                light: 0,
                dark: 0
            }
        };
    }
    

    on("chat:message", function(msg_orig) {
        let msg=_.clone(msg_orig);
        if(msg.type == "api" && msg.content.indexOf("!destiny") != -1) {

                if(_.has(msg,"inlinerolls")){
                    msg.content = _.chain(msg.inlinerolls)
                        .reduce(function(m,v,k){
                            let ti=_.reduce(v.results.rolls,function(m2,v2){
                                if(_.has(v2,"table")){
                                    m2.push(_.reduce(v2.results,function(m3,v3){
                                        m3.push(v3.tableItem.name);
                                        return m3;
                                    },[]).join(", "));
                                }
                                return m2;
                            },[]).join(", ");
                            m["$[["+k+"]]"]= (ti.length && ti) || v.results.total || 0;
                            return m;
                        },{})
                        .reduce(function(m,v,k){
                            return m.replace(k,v);
                        },msg.content)
                        .value();
                }

            let n = msg.content.split(/\s+/);
            let cmd = n[1];

            let prePools=_.clone(state.destiny.pools);
            
            if(cmd == "status" || cmd == "s")
            {
                sendChat("",'<div style="border: 1px solid black; text-align: center; background-color: white; padding: 3px 3px">'
                      + '<div style="padding-bottom:5px">'
                      + '<span style="font-size:130%;border-bottom:1px;font-weight:bold">Destiny Point Status</span>'
                      + '</div><div style="padding-left:10px; text-align: center; padding-right:10px; padding-bottom:5px">'
                      + "Light: " + state.destiny.pools.light + ", Dark: " + state.destiny.pools.dark
                      + '</div>'
                      );
            }
            if(cmd == "addlight" || cmd == "al")
            {
                state.destiny.pools.light = state.destiny.pools.light += (parseInt(n[2],10)||1);
                sendChat("",'<div style="border: 1px solid black; text-align: center; background-color: white; padding: 3px 3px">'
                      + '<div style="padding-bottom:5px">'
                      + '<span style="font-size:130%;border-bottom:1px;font-weight:bold">Added Light Destiny Point</span>'
                      + '</div><div style="padding-left:10px; text-align: center; padding-right:10px; padding-bottom:5px">'
                      + "Light: " + state.destiny.pools.light + ", Dark: " + state.destiny.pools.dark
                      + '</div>'
                      );            
            }
            if(cmd == "adddark" || cmd == "ad")
            {
                state.destiny.pools.dark = state.destiny.pools.dark += (parseInt(n[2],10)||1);
                sendChat("",'<div style="border: 1px solid black; text-align: center; background-color: white; padding: 3px 3px">'
                      + '<div style="padding-bottom:5px">'
                      + '<span style="font-size:130%;border-bottom:1px;font-weight:bold">Added Dark Destiny Point</span>'
                      + '</div><div style="padding-left:10px; text-align: center; padding-right:10px; padding-bottom:5px">'
                      + "Light: " + state.destiny.pools.light + ", Dark: " + state.destiny.pools.dark
                      + '</div>'
                      );            
            }
            if(cmd == "uselight" || cmd == "spendlight" || cmd == "ul")
            {
                if(state.destiny.pools.light >= parseInt(n[2],10))
                {
                    state.destiny.pools.light = state.destiny.pools.light -= (parseInt(n[2],10)||1);
                    state.destiny.pools.dark = state.destiny.pools.dark += (parseInt(n[2],10)||1);
                sendChat("",'<div style="border: 1px solid black; text-align: center; background-color: white; padding: 3px 3px">'
                      + '<div style="padding-bottom:5px">'
                      + '<span style="font-size:130%;border-bottom:1px;font-weight:bold">Used Light Destiny Point</span>'
                      + '</div><div style="padding-left:10px; text-align: center; padding-right:10px; padding-bottom:5px">'
                      + "Light: " + state.destiny.pools.light + ", Dark: " + state.destiny.pools.dark
                      + '</div>'
                      );                 
                }
                else
                {
                sendChat("",'<div style="border: 1px solid black; text-align: center; color: red; background-color: white; padding: 3px 3px">'
                      + '<div style="padding-bottom:5px">'
                      + '<span style="font-size:130%;border-bottom:1px;font-weight:bold">Not enough light destiny available!</span>'
                      + '</div><div style="padding-left:10px; text-align: center; color: black; padding-right:10px; padding-bottom:5px">'
                      + "Light: " + state.destiny.pools.light + ", Dark: " + state.destiny.pools.dark
                      + '</div>'
                      ); 
                }
            }
            if(cmd == "usedark" || cmd == "spenddark" || cmd == "ud")
            {
                if(state.destiny.pools.dark >= parseInt(n[2],10))
                {
                    state.destiny.pools.light = state.destiny.pools.light += (parseInt(n[2],10)||1);
                    state.destiny.pools.dark = state.destiny.pools.dark -= (parseInt(n[2],10)||1);
                sendChat("",'<div style="border: 1px solid black; text-align: center; color: white; background-color: black; padding: 3px 3px">'
                      + '<div style="padding-bottom:5px">'
                      + '<span style="font-size:130%;border-bottom:1px;font-weight:bold">Used Dark Destiny Point</span>'
                      + '</div><div style="padding-left:10px; text-align: center; padding-right:10px; padding-bottom:5px">'
                      + "Light: " + state.destiny.pools.light + ", Dark: " + state.destiny.pools.dark
                      + '</div>'
                      );                 
                }
                else
                {
                sendChat("",'<div style="border: 1px solid black; text-align: center; color: red; background-color: black; padding: 3px 3px">'
                      + '<div style="padding-bottom:5px">'
                      + '<span style="font-size:130%;border-bottom:1px;font-weight:bold">Not enough dark destiny available!</span>'
                      + '</div><div style="padding-left:10px; text-align: center; color: white; padding-right:10px; padding-bottom:5px">'
                      + "Light: " + state.destiny.pools.light + ", Dark: " + state.destiny.pools.dark
                      + '</div>'
                      ); 
                }
            }
            if(cmd == "reset" || cmd == "r")
            {
                state.destiny.pools.light = 0;
                state.destiny.pools.dark = 0;
                sendChat("",'<div style="border: 1px solid black; text-align: center; color: red; background-color: white; padding: 3px 3px">'
                      + '<div style="padding-bottom:5px">'
                      + '<span style="font-size:130%;border-bottom:1px; color: black; font-weight:bold">Destiny Points Reset!</span>'
                      + '</div><div style="padding-left:10px; text-align: center; padding-right:10px; padding-bottom:5px">'
                      + "Light: " + state.destiny.pools.light + ", Dark: " + state.destiny.pools.dark
                      + '</div>'
                      ); 
            }
            if(cmd == "startsession" || cmd == "ss")
            {
                state.destiny.pools.light = 0;
                state.destiny.pools.dark = 0;
                let handout=getHandout();
                sendChat("",'<div style="border: 1px solid black; text-align: center; color: red; background-color: white; padding: 3px 3px">'
                      + '<div style="padding-bottom:5px">'
                      + '<span style="font-size:130%;border-bottom:1px; color: black; font-weight:bold">May the Force be with you!</span>'
                      + '</div><div style="padding-left:10px; text-align: center; padding-right:10px; padding-bottom:5px">'
                      + "Select your token and: "
                      + '[Roll Destiny](~selected|destiny)'
                      + '</div>'
                      );
                sendChat("Master Yoda",'<div style="border: 1px solid black; text-align: center; color: black; background-color: #58C3EF; padding: 3px 3px">'
                      + `Click to Open Tracking Handout: ===><a href="http://journal.roll20.net/handout/${handout.id}">Destiny Pools</a><===`); 
            }

            if(prePools.light !== state.destiny.pools.light || prePools.dark !== state.destiny.pools.dark){
                let handout=getHandout();
                writeHandout(handout);
            }
        }
    });

});
