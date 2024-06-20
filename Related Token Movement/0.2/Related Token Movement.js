const decodeEditorText = (t, o) =>{
  let w = t;
  o = Object.assign({ separator: '\r\n', asArray: false },o);
  if(/^%3Cp%3E/.test(w)){
    w = unescape(w);
  }
  if(/^<p>/.test(w)){
    let lines = w.match(/<p>.*?<\/p>/g)
      .map( l => l.replace(/^<p>(.*?)<\/p>$/,'$1'));
    return o.asArray ? lines : lines.join(o.separator);
  }
  return t;
};

function getGm() {
    const players = filterObjs((obj) => (
        obj.get('_type') === 'player' && playerIsGM(obj.get('_id'))
    ));
    if (! players.length) {
        return;
    }
    return players[0];
}

function createMacro() {
    if (findObjs({action: "?{Action|Create,!rtm create ?{Name&amp;#125;|Switch,!rtm switch|Clear,!rtm delete}"}).length == 0) {
        createObj("macro", {
            name: "RTM",
            action: "?{Action|Create,!rtm create ?{Name&amp;#125;|Switch,!rtm switch|Clear,!rtm delete}",
            playerid: getGm().get('_id'),
            visibleto: getGm().get('_id')
        });
    }
}

on("ready", function() {
    createMacro()
});

on("chat:message", function(msg) {
    if (msg.type == "api" && msg.content.indexOf("!rtm create ") !== -1) {
        if (!msg.selected) {
            sendChat('RTM', "/w " + msg.who + " ERROR: Token not selected")
        } else {
            let i = 0;
            while (i < msg.selected.length) {
                obj = getObj(msg.selected[i]._type, msg.selected[i]._id);
                var rtm_id = getRTMId(obj)[0]
                var name = msg.content.replace("!rtm create ", "")
                if ( rtm_id === false ) {
                    obj.set('gmnotes', "Related_Token_Movement/" + name + "/Related_Token_Movement" + "<br>" + obj.get('gmnotes'));
                } else {
                    if ( getRTMId(obj)[1] === true ) {
                        obj.set('gmnotes', obj.get('gmnotes').replace("Related_Token_Movement/" + rtm_id + "/Related_Token_Movement", "Related_Token_Movement/" + name + "/Related_Token_Movement"));
                    } else if ( getRTMId(obj)[1] === false ) {
                        obj.set('gmnotes', obj.get('gmnotes').replace("Related_Token_Movement_Off/" + rtm_id + "/Related_Token_Movement_Off", "Related_Token_Movement_Off/" + name + "/Related_Token_Movement_Off"));
                    }
                }
                i++;
            }
            sendChat('RTM', "/w " + msg.who + " New ID: \"" + name + "\". Number of modified tokens: " + msg.selected.length)
        }
    } else if (msg.type == "api" && msg.content.indexOf("!rtm switch") !== -1) {
        if (!msg.selected) {
            sendChat('RTM', "/w " + msg.who + " ERROR: Token not selected")
        } else {
            let i = 0;
            while (i < msg.selected.length) {
                obj = getObj(msg.selected[i]._type, msg.selected[i]._id);
                var rtm_state = getRTMId(obj)[1]
                if ( rtm_state === true ) {
                    obj.set('gmnotes', obj.get('gmnotes').replace("Related_Token_Movement/", "Related_Token_Movement_Off/"));
                    sendChat('RTM', "/w " + msg.who + " " + obj.get('name') + " new RTM state is \"Off\"")
                } else if ( rtm_state === false ) {
                    obj.set('gmnotes', obj.get('gmnotes').replace("Related_Token_Movement_Off/", "Related_Token_Movement/"));
                    sendChat('RTM', "/w " + msg.who + " " + obj.get('name') + " new RTM state is \"On\"")
                }
                i++;
            }
        }
    } else if (msg.type == "api" && msg.content.indexOf("!rtm delete") !== -1) {
        if (!msg.selected) {
            sendChat('RTM', "/w " + msg.who + " ERROR: Token not selected")
        } else {
            let i = 0;
            while (i < msg.selected.length) {
                obj = getObj(msg.selected[i]._type, msg.selected[i]._id);
                var rtm_state = getRTMId(obj)[1]
                if ( rtm_state === true ) {
                    obj.set('gmnotes', obj.get('gmnotes').slice( 0, obj.get('gmnotes').indexOf("Related_Token_Movement/") ) + obj.get('gmnotes').slice( obj.get('gmnotes').indexOf("/Related_Token_Movement") + 27 ) );
                } else if ( rtm_state === false ) {
                    obj.set('gmnotes', obj.get('gmnotes').slice( 0, obj.get('gmnotes').indexOf("Related_Token_Movement_Off/") ) + obj.get('gmnotes').slice( obj.get('gmnotes').indexOf("/Related_Token_Movement") + 27 ) );
                }
                sendChat('RTM', "/w " + msg.who + " " + obj.get('name') + " RTM ID deleted")
                i++;
            }
        }
    } else if (msg.type == "api" && msg.content.indexOf("!rtm macro") !== -1) {
        createMacro()
        sendChat('RTM', "/w " + msg.who + " Macro created")
    }
});

function getRTMId(obj) {
    const text = decodeEditorText(obj.get('gmnotes'))

    if ( text.includes("Related_Token_Movement_Off") ) {
        var rtm_id = text.slice( text.indexOf("Related_Token_Movement_Off") + 25 )
        rtm_id = rtm_id.slice( 0, rtm_id.indexOf("/Related_Token_Movement") )
        return [rtm_id, false];
    } else if ( text.includes("Related_Token_Movement") ) {
        var rtm_id = text.slice( text.indexOf("Related_Token_Movement") + 23 )
        rtm_id = rtm_id.slice( 0, rtm_id.indexOf("/Related_Token_Movement") )
        return [rtm_id, true];
    } else {
        return [false, "none"];
    }
}

on("change:graphic", function(obj, prev) {
    var rtm_id = getRTMId(obj)[0]
    
    if ( rtm_id !== false && getRTMId(obj)[1]) {
        var token_list = findObjs({ subtype: 'token' });
        
        token_list.forEach(element => {
            var element_id = getRTMId(element)[0]
            if ( element.get("id") !== obj.get("id") && element_id !== false && getRTMId(element)[1] && element_id === rtm_id ) {
                element.set({
                    left: element.get("left") + obj.get("left") - prev["left"],
                    top: element.get("top") + obj.get("top") - prev["top"],
                    rotation: element.get("rotation") + obj.get("rotation") - prev["rotation"],
                    layer: obj.get("layer"),
                    tint_color: obj.get("tint_color"),
                    statusmarkers: obj.get("statusmarkers")
                });
            }
        });
    }
});