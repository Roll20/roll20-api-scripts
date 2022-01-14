const srun3= function() {

    const menucommands = ["groupInit", "hidegrenade", "grenade"];
    const matrixsheets = ["Matrix", "Frame"];
    const configoptions = ["grenade", "summon"];
    const phasereset = ["rounds-phase", "controlpool-used", "hackingpool-used", "astralpool-used", "combatpool-used", "spellpool-used", "sorcery-used", "spelldefensedice-used", "taskpool-used"];
    const templatetriggers = ["explosive", "conjure"];
    var srun3 = srun3 || (function () {
        'use strict';
        var characters = findObjs({ _type: 'character' });
        console.log('characters');
    });
    
    var initList = [];
    
    const getRepeatingSectionAttrs = function (charid, prefix) {
        // Input
        //  charid: character id
        //  prefix: repeating section name, e.g. 'repeating_weapons'
        // Output
        //  repRowIds: array containing all repeating section IDs for the given prefix, ordered in the same way that the rows appear on the sheet
        //  repeatingAttrs: object containing all repeating attributes that exist for this section, indexed by their name
        const repeatingAttrs = {},
            regExp = new RegExp(`^${prefix}_(-[-A-Za-z0-9]+?|\\d+)_`);
        let repOrder;
        // Get attributes
        findObjs({
            _type: 'attribute',
            _characterid: charid
        }).forEach(o => {
            const attrName = o.get('name');
            if (attrName.search(regExp) === 0) repeatingAttrs[attrName] = o;
            else if (attrName === `_reporder_${prefix}`) repOrder = o.get('current').split(',');
        });
        if (!repOrder) repOrder = [];
        // Get list of repeating row ids by prefix from repeatingAttrs
        const unorderedIds = [...new Set(Object.keys(repeatingAttrs)
            .map(n => n.match(regExp))
            .filter(x => !!x)
            .map(a => a[1]))];
        const repRowIds = [...new Set(repOrder.filter(x => unorderedIds.includes(x)).concat(unorderedIds))];
        return [repRowIds, repeatingAttrs];
    }
    
    
    const errormsg = {
        groupInit: "no tokens selected, make sure at least one token is selected before running command"
    }
    
    const showError = (errortype, playerid) => {
        sendChat('player|' + playerid, errormsg[errortype]);
        return "error";
    
    }
    const getCharID = tokenid => {
        let myobject = findObjs({ type: 'graphic', id: tokenid })[0]
        let charid = myobject.attributes["represents"];
        return charid;
    }
    
    const getTokensByName = name => {
        var mytokens = findObjs({ type: 'graphic', subtype: "token", represents: "" });
        mytokens = mytokens.map(function (token) {
            if (token.get('name').toLowerCase().includes(name.toLowerCase())) return token["id"];
        });
        mytokens = mytokens.filter(function (token) {
            return token != null;
        });
        return (mytokens)
    };
    
    const groupInit = msg => {
        let myselected = (msg.selected) ? msg.selected : showError("groupInit", msg.playerid);
        var turnorder;
        const characters = findObjs({ type: 'character' });
        const mytokens = findObjs({ type: 'graphic', subtype: 'token' }) || 'none';
        log('found ' + mytokens.length + ' tokens')
        log(mytokens);
        log('found ' + characters.length + ' chars')
        log(characters);
        if (Campaign().get("turnorder") == "") turnorder = [];
        else turnorder = JSON.parse(Campaign().get("turnorder"));
        /* log('turnorder')
        log(turnorder) */
    
        Campaign().set("turnorder", JSON.stringify(turnorder));
        /* turnorder.forEach(turn => {
            log('turn id ' + turn.id)
        }); */
        log('selectd ' + myselected)
        if (myselected == "error") return;
        var addTurns = [], repIDs = {}, repAttrs = {}, matrixobjs = [], groupInitTokens = [];
        myselected.forEach(tokenin => {
            var p, reaction, initiative, wound, stun, initpen, matrixpen;
            var initmode = "physical";
            myinfo = findObjs({ type: 'graphic', id: tokenin._id })[0]
            const tokenname = myinfo.attributes["name"];
            log("Token Name: " + tokenname + "Token ID: " + tokenin._id)
            let charid = myinfo.attributes["represents"];
            let sheettype = getAttrByName(charid, "sheettype");
            let astral = (matrixsheets.includes(sheettype)) ? "physical" : getAttrByName(charid, "astral-state");
            let matrix = (matrixsheets.includes(sheettype)) ? "na" : getAttrByName(charid, "matrix-state");
            if (matrixsheets.includes(sheettype)) {
                log('matrix sheet')
                if (matrixobjs.includes(charid)) {
                    log('sheet already loaded');
                } else {
                    log('new icon getting attrs');
                    [repIDs[charid], repAttrs[charid]] = getRepeatingSectionAttrs(charid, "repeating_ic");
                    repAttrs[charid]["initiative"] = getAttrByName(charid, "matrixsecuritynumber");
                    matrixobjs.push(charid);
                }
                initiative = repAttrs[charid]["initiative"];
                initmode = "matrix";
                p = repIDs[charid].map(function (id) {
                    if ((repAttrs[charid]["repeating_ic_" + id + "_icname"]) && (repAttrs[charid]["repeating_ic_" + id + "_icname"].attributes["current"] == tokenname)) return [
                        repAttrs[charid]["repeating_ic_" + id + "_icrating"].attributes["current"],
                        repAttrs[charid]["repeating_ic_" + id + "_ic-penalty"].attributes["current"]]
                });
                let atts = p.filter(function (el) {
                    return el != null;
                })[0];
                if (atts) [reaction, initpen] = atts;
            } else if (matrix == "in") {
                initmode = "matrix"
                reaction = getAttrByName(charid, "deck-reaction-final");
                initiative = getAttrByName(charid, "deck-initiative");
                wound = getAttrByName(charid, "wound_pen");
                stun = getAttrByName(charid, "stun_pen");
                matrixpen = getAttrByName(charid, "matrix-penalty");
                initpen = wound + stun + matrixpen;
            } else if (astral == "astral") {
                initmode = "astral"
                reaction = getAttrByName(charid, "astralreaction");
                initiative = getAttrByName(charid, "initiative", "max");
                wound = getAttrByName(charid, "wound_pen");
                stun = getAttrByName(charid, "stun_pen");
                initpen = wound + stun;
            } else {
                reaction = getAttrByName(charid, "reaction", "max");
                initiative = getAttrByName(charid, "initiative", "max");
                wound = getAttrByName(charid, "wound_pen");
                stun = getAttrByName(charid, "stun_pen");
                initpen = wound + stun;
            }
            if (reaction) {
                log(' rolling ' + initiative + 'd6 + ' + reaction + ' - ' + initpen);
                var initresult = reaction - initpen;
                for (let step = 0; step < initiative; step++) {
                    log(' step ' + step + ' initresult ' + initresult);
                    initresult += randomInteger(6);
                }
                groupInitTokens.push(tokenin._id);
                addTurns.push({
                    id: tokenin._id,
                    pr: initresult,
                    custom: ""
                });
                log('Token ' + tokenname + ' ' + initmode + ' Initiative: ' + initresult)
            } else {
                log('no reaction attr found for character ' + charid);
            }
            log('Final Turns');
            /* check for other markers in the turn order that were not part of group init and add them back in */
            addCombatPass(addTurns.concat(turnorder.filter(function (myval) { if (!groupInitTokens.includes(myval.id)) return myval; })));
    
        });
        log('done with groupInit');
    };
    const resetPhaseCounters = turnorder => {
        turnorder.forEach(turn => {
            log(turn)
            const tokenid = turn.id;
            if ((tokenid) && (tokenid !== "-1")) {
                const charid = getCharID(tokenid);
                if (charid) {
                    const sheettype = getAttrByName(charid, "sheettype");
                    if (sheettype) {
                        if ((sheettype == "Character") || (sheettype == "NPC")) {
                            phasereset.forEach(myatt => {
                                log('debug 1  ' + myatt + ' charid ' + charid);
                                var pool = findObjs({ type: 'attribute', characterid: charid, name: myatt })[0];
                                log(' debug ' + myatt);
                                log(pool);
                                if (pool) pool.setWithWorker('current', 0);
                                else log('no value for ' + myatt);
                            });
                        } else {
                            log(charid + ' is not a Character or NPC')
                            return;
                        }
                    } else {
                        log('could not find sheettype for ' + charid);
                        return;
                    }
                    log(charid);
                } else {
                    log(' no character id found for ' + tokenid)
                }
            }
        })
    }
    const summon = function(argv) {
        return;
    }
    const hidegrenade = function(argv) {
        const grenades=getTokensByName("grenade");
        if (!grenades) {
            log('no tokens found with name of grenade*');
            return;
        } else {
            grenades.forEach(token => {
                let grenade = findObjs({ type: 'graphic', id: token })[0];
                log(grenade)
                grenade.set({ layer: "gmlayer" })
            });
        }
      
    };
    const addCombatPass = turnorder => {
        /* check if End of Combat Pass already exists and remove if it does */
        turnorder = turnorder.filter(function (myval) {
            return myval["custom"] != "End of Pass";
        });
        turnorder.sort((a, b) => parseFloat(b.pr) - parseFloat(a.pr));
        turnorder.push({
            "id": "-1", //For custom items, the ID MUST be set to "-1" (note that this is a STRING not a NUMBER.
            "pr": "0",
            "custom": "End of Pass" //The name to be displayed for custom items.
        });
        log(turnorder);
        Campaign().set("turnorder", JSON.stringify(turnorder));
        resetPhaseCounters(turnorder);
    };
    const showhelp = playerid => {
        message = "USAGE: !srun3 \n";
        message += "  --groupInit Rolls Initiative for all selected tokens \n";
        message += "  --grenade [--off | --on] places grenade token based on explosives roll template result \n";
        message += "  --conjuring [--off | --on ] places spirit token based on conjuring roll template \n";
        message += "  --help  Shows this message";
        sendChat('player|' + playerid, message);
    };
    
    const parseAPImsg = msg => {
        log(msg);
        let argv = msg["content"].split(" --");
        let playerid = msg.playerid;
        let sw = argv[1];
        if (!argv) showhelp(playerid)
        else if (sw=="groupInit") groupInit(msg);
        else if (sw=="hidegrenade") hidegrenade(argv);
        else if (configoptions.includes(sw)) cfgoption(argv, playerid);
        else showhelp(playerid);
    
    }
    
    const cfgoption = (argv, playerid) => {
        if ("srun3api" in state) log('good')
        else state["srun3api"]={};
        log(argv);
        const goodopts = ["off", "on"]
        let cmd = argv[1];
        let option = argv[2];
        var message;
        const stateoptions=state["srun3api"];
        const optionstatus = ( cmd in stateoptions)? stateoptions[cmd]: "off";
        if (!option) message= cmd + " is currently set to " + optionstatus;
        else if ( goodopts.includes(option)) { 
            state["srun3api"][cmd]=option;
            message= cmd + " set to " + option;
        }
        else message="usage: !srun3 --" + cmd + " --[off, on]";
        sendChat('player|' + playerid, message);
    };
    
    const msgGet = msg => {
        log(msg)
        log('start state');
        log(state);
        log('end state');
        msg.content.startsWith("!srun3") && msg.type == "api" ? parseAPImsg(msg) : log("not a srun3 api call");
        if (msg.rolltemplate) {
            if (templatetriggers.includes(msg.rolltemplate)) {
                parseRoll(msg)
            }
        }
    };
    
    const getRollValue = function (myroll, rolls, computed = 0) {
        if (myroll.includes("$[[")) {
            var myindex = parseInt(myroll.match(/\[\[(.*)\]\]/)[1]);
            log('roll result');
            log(rolls[myindex].results)
            let result = (computed == 0) ? rolls[myindex].results.total : rolls[myindex].computed;
            return result;
        } else {
            return myroll;
        }
    };
    
    const addDegs = function (degs, mods) {
        var newdegs = degs + mods;
        if ( newdegs < 0 ) newdegs += 360;
        log('added ' + mods + ' to ' + degs + ' with value of ' + newdegs);
        return newdegs;
        
    }
    
    const getRads = degs => {
        var rads = degs * Math.PI/180;
        if (rads < 0)  rads += 2*Math.PI;
        log ('converting ' + degs + ' to rads ' + rads)
        return rads;
    }
        
    const getDegs = rads => {
        var degs = rads * 180/Math.PI;
        log('original degs ' + degs);
        if ( degs < 0 ) degs = 360 + degs;
        log('adjuted degs ' + degs);
        return degs;
    };
    
    const rtconjure = function (rollmap, rolls, playerid) {
        const stateoptions=state["srun3api"];
        const summonstatus = ( "summon" in stateoptions)? stateoptions["summon"]: "off";
        if (summonstatus == "off") return;
        var spiritid;
        const summoner = getRollValue(rollmap["myname"], rolls);
        const spirit = getRollValue(rollmap["spirittype"], rolls);
        const force = getRollValue(rollmap["spiritforce"], rolls);
        const spirittokens = getTokensByName(spirit);
        log('debut spirittokens');
        log(spirittokens);
        const spiritname = summoner + "'s " + spirit + " " + force;
        var spiritchar = findObjs({ type: 'character', controlledby: playerid, name: spiritname })[0];
        log('debug spiritchar');
        log(spiritchar)
        const summonerid = findObjs({ type: 'character', controlledby: playerid, name: summoner })[0].id;
        const summonertoken = findObjs({ type: 'graphic', represents: summonerid })[0];
        log('summonertoken')
        log(summonertoken);
        if ( ! summonertoken) {
            log('cannot find summoners token');
            return;
        }
        const visioneffects=["has_bright_light_vision", "has_night_vision", "night_vision_tint", "night_vision_distance", "emits_bright_light", "bright_light_distance", "emits_low_light", "low_light_distance", "has_limit_field_of_vision", "limit_field_of_vision_center", "limit_field_of_vision_total", "has_limit_field_of_night_vision", "limit_field_of_night_vision_center", "limit_field_of_night_vision_total", "has_directional_bright_light", "directional_bright_light_total", "directional_bright_light_center", "has_directional_low_light", "directional_low_light_total", "directional_low_light_center", "light_sensitivity_multiplier", "night_vision_effect", "dim_light_opacity"]
        var tokens, finaltoken;
        /* check if character sheet already exists with spiritname and conrolled by the playerid */
        if (!spiritchar) {
            spiritchar=createObj('character', {
                name: spiritname,
                controlledby: playerid	
            })
            spiritid = spiritchar.get("id");
            const st2 = findObjs({ type: 'attribute', characterid: spiritid, name: 'sheettype' });
            const sheettype=createObj('attribute', {characterid: spiritid, name: 'sheettype', current: "NPC" });
            sheettype.setWithWorker('current', "Spirit");
            var atts2set={};
            atts2set["force"]=force;
            atts2set["spirit-type"]=spirit;
            setAttrs(spiritid, atts2set, null, function(){ 
                log('finished first batch of setatts')
                atts2set["api-newsheet"]='true';
                setAttrs(spiritid, atts2set)
            });
        } else {
            spiritid=spiritchar.get("id");
        }
        /* check for spirit type specific tokens */
        
        if (spirittokens) { 
            log('found token for spirit type')
            tokens = spirittokens;
        }  else {
            /* get generic spirit token if there are no spirit type specific tokens */
            tokens = getTokensByName('apispirit')
        }
        if (tokens) {
            log(tokens);
            /* check if more than one token matched for the spirit type or generic spirit and if so, use random numbe to choose the token to use */
            if ( tokens.length > 1 ) {
                let myindex = ( randomInteger(tokens.length) -1 );
                finaltoken=tokens[myindex];
            } else {
                finaltoken=tokens[0]
            }
            log(finaltoken);
            /* get location of summoner and spawn near them */
            const mytop = (summonertoken)? summonertoken.get('top') + 40: 1;
            var myleft = (summonertoken)? summonertoken.get('left') + 40: 1;
            var mypage = (summonertoken)? summonertoken.get('pageid') : Campaign().get('playerpageid');
            log('myleft ' + myleft)
            log('mypage ' + mypage)
            /* create new token and link to character sheet */
            if ( finaltoken ) {
            const cloneobject = getObj('graphic', finaltoken);
            log('debug cloneobject')
            log(cloneobject);
            var myimagesrc=cloneobject.get('imgsrc');
            const myheight=cloneobject.get('height');
            const mywidth = cloneobject.get('width');
            myimagesrc = myimagesrc.replace("med.png", "thumb.png");
            myimagesrc = myimagesrc.replace("max.png", "thumb.png");
            /* const newtoken = createObj('graphic', { */
            var newtoken = {
                layer: "objects",
                pageid: mypage,
                subtype: "token",
                showname: true,
                name: spiritname,
                controlledby: playerid,
                imgsrc: myimagesrc,
                represents: spiritid,
                left: myleft,
                top: mytop,
                height: myheight,
                width: mywidth
            };
            visioneffects.forEach(effect=> {
                newtoken[effect]=summonertoken.get(effect);
            });
            const debugtoken = createObj('graphic', newtoken);
            log(debugtoken); 
            } else {
                log('no tokens found for spirits');
            }
        } else {
            /* if no tokens where found, exit */
            log('no tokens found for spirits');
            return;
        }
    
    };
    
    const rtexplosive = function (rollmap, rolls, playerid) {
        log('starting explosive')
        const stateoptions=state["srun3api"];
        const grenadestatus = ( "grenade" in stateoptions)? stateoptions["grenade"]: "off";
        if (grenadestatus == "off") return;
        const mygrenade = getTokensByName("apigrenade"); 
        if (!mygrenade) {
            log('no tokens found with name of grenade*');
            return;
        }
        log('found grenade token')
        log(mygrenade);
        let scatdir = getRollValue(rollmap["scatdirnumber"], rolls);
        let scatter = getRollValue(rollmap["scatter"], rolls, 1);
        let target = getRollValue(rollmap["targettoken"], rolls);
        let attacker = getRollValue(rollmap["mytoken"], rolls);
        log('attacker ' + attacker);
        var targettoken = findObjs({ type: 'graphic', id: target })[0];
        var attacktoken = findObjs({ type: 'graphic', id: attacker })[0];
        log('attacktoken: ' + attacktoken);
        if ((targettoken) && (attacktoken)) {
            let mypage = targettoken.get('pageid');
            let mytop = targettoken.get('top');
            let myleft = targettoken.get('left');
            let leftdiff = targettoken.get('left') - attacktoken.get('left');
            let topdiff = targettoken.get('top') - attacktoken.get('top');
            let myrads = Math.atan2(topdiff, leftdiff);
            let mydegs = getDegs(myrads);
            log('original angle: ' + mydegs);
            var myconversion = 1, myscale = 1;
            if (mypage) {
                let pagesetup = getObj('page', mypage);
                myconversion = (pagesetup.get('scale_units') == "feet") ? 3.2 : 1;
                myscale = pagesetup.get('scale_number')
            }
            let totalmove = 70 * (scatter / myscale);
            log('total move: ' + totalmove);
            if (scatdir == 1) {
                mydegs=mydegs;
            } else if (scatdir == 5) {
                mydegs=addDegs(mydegs, -135);
            } else if (scatdir == 3) {
                mydegs = addDegs(mydegs, 135);
            } else if (scatdir == 2) {
                mydegs = addDegs(mydegs, 45);
            } else if (scatdir == 6) {
                mydegs = addDegs(mydegs, -45);
            } else {
                mydegs = addDegs(mydegs, 180);
            }
            if (scatter == 0) {
                mytop += 10;
                myleft += 10;
            }
            myrads = getRads(mydegs)
            mysin = Math.sin(myrads);
            mycos = Math.cos(myrads);
            log('Final angle: ' + mydegs + ' sin: ' + mysin + ' cos: ' + mycos);
            myx = myleft + (totalmove * mycos);
            myy = mytop + (totalmove * mysin);
            log('X: ' + myx + ' Y: ' + myy);
            log('X start: ' + myleft + ' X end: ' + myx);
            log('Y start: ' + mytop + ' Y end: ' + myy);
            log('scatdir: ' + scatdir + ' scatter: ' + scatter);
            
            mygrenade.forEach(token => {
                let grenade = findObjs({ type: 'graphic', id: token })[0];
                log(grenade)
                grenade.set({ left: myx, top: myy, layer: "objects" })
            });
        } else {
            return
        }
    
    
    
    };
    
    const parseRoll = msg => {
        const goodfunctions = ["rtexplosive", "rtconjure"];
        if (msg.content) {
            const playerid = msg.playerid;
            const content = msg.content;
            const inlineroll = msg.inlinerolls;
            const rollmap = ParseRollTemplate(content);
            log(rollmap);
            let funcname = "rt" + msg.rolltemplate;
            if (goodfunctions.includes(funcname)) eval(funcname)(rollmap, inlineroll, playerid);
        } else {
            return;
        }
    };
    
    const ParseRollTemplate = roll => {
        var rollmap = {};
        const mylist = (roll.replace(/}}/g, "")).split("{{");
        mylist.forEach(m => {
            let [key, value] = (m.includes("=")) ? m.split("=") : [null, null];
            if (key != null) rollmap[key] = value;
        });
        return rollmap;
    };
    
    on("chat:message", msgGet)
    
    
    const updateCombatPass = function (turnorder) {
        log('subtract 10 from all markers, remove <=0, update pools and reorder');
        const neworder = turnorder.map(function (turn) {
            turn["pr"] = (turn["custom"] == "End of Pass") ? 0 : turn["pr"] - 10;
            return (turn["pr"] <= 0) ? null : turn;
        });
        log(neworder);
        var finalturn = neworder.filter(function (myval) {
            return myval != null;
        });
        finaltrun = addCombatPass(finalturn);
        log('New Combat Phase Turn Order');
        log(finalturn);
    
        sendChat("Status", "End of Combat Phase, All Pools refreshed", null, { noarchive: true });
    }
    
    on('change:campaign:turnorder', (info) => {
        turnorder = JSON.parse(Campaign().get("turnorder"));
        turnorder[0]["custom"] === "End of Pass" ? updateCombatPass(turnorder) : log('skip');
    });
    
    on('change:attribute', (atobj) => {
       log(atobj)
       const name=atobj.get("name");
       const val=atobj.get("current");
       const charid=atobj.get("_characterid");
       log(name);
       if (name.includes("securitytally")) gridTally(name, val, charid);
    });
    
    const gridTally = function(name, val, charid) {
        var charlist=[]
        const gridobjs=findObjs({ type: 'character' })
        gridobjs.forEach(obj => {
            if ( getAttrByName( obj.get('id'), "sheettype") == "Matrix") {
                let obj={};
                obj[obj.get('id')]=getAttrByName( obj.get('id'), "parentgrid");
                charlist.push(obj.get('id'))
            }
        });
        log('log list');
        log(charlist);
    
    }; 
    }
    on("ready", () => {
        'use strict';
        srun3();
    });
    