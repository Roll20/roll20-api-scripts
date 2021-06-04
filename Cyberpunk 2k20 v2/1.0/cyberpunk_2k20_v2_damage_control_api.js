var getSelectedWeapon = function (character, attributes) {
    var wp_id = null;
    _.each(attributes,function(a){
        if ( a.get('name').indexOf('repeating_wp') > -1 && a.get('name').indexOf('wp-name') > -1 ) {
            var id = a.get('name').split("_")[2];
            if ('1' == getAttrByName(character.id, 'repeating_wp_'+id+'_wp-selected')){
                wp_id = id;
            }
        }

    });
    return wp_id;
}

var selectAmmo = function(attributes, tokenid){
    var html = '<ul>';
    var nb_w = 0;
    _.each(attributes,function(a){
        if ( a.get('name').indexOf('repeating_ammu') > -1 && a.get('name').indexOf('ammu-name') > -1 ) {
            nb_w++;
            var id = a.get('name').split("_")[2];
            html += '<li>['+a.get('current')+'](!reload '+tokenid+' '+id+')</li>';
        }
    });
    if (0 == nb_w){
        html += '<li>No ammunitions</li>';
    }
    html += '</ul>';
    log(html);
    return html;
}

function sortNumber(a,b) {
    return b - a;
}

function diceType(string){
    var string = string.toLowerCase();
    if ('d6'== string || '1d6'== string){
        return 6;
    } else if ('d10'== string || '1d10'== string){
        return 10;
    } else if ('1d9'== string){
        return 9;
    } else if ('1d5'== string){
        return 5;
    } else if ('1d4' == string || 'd4-1' == string){
        return 4;
    } else if ('d3'== string || '1d3'== string){
        return 3;
    } else if ('d2'== string || '1d2'== string) {
        return 2;
    } else {
        return 0;
    }
}

function randomIntFromInterval(max,nb) // min and max included
{
    var result = 0;
    //log(max);
    for (var i = 0 ; i < nb ; i++){
        result += Math.floor(Math.random()*max + 1);
        log('RESULT DICE '+result);
    }
    return result;
}

function getCharacter(tokenid){
    var token = getObj('graphic',tokenid);
    if(token.get("represents") != "") {
        return getObj("character", token.get("represents"));
    } else {
        return null;
    }
}

function injuryPenalties(injury, character){
    var injury = parseInt(injury);
    var stun = 0;
    var status = 0;
    var mortel = 0;
    var refpenality = 0;
    var intpenality = 0;
    var coolpenality = 0;
    var mapenality = 0;
    var ref = parseInt(getAttrByName(character.id, 'ref')) + parseInt(getAttrByName(character.id, 'ref_mod'));
    var int = parseInt(getAttrByName(character.id, 'int')) + parseInt(getAttrByName(character.id, 'int_mod'));
    var cool = parseInt(getAttrByName(character.id, 'cool')) + parseInt(getAttrByName(character.id, 'cool_mod'));
    var body = parseInt(getAttrByName(character.id, 'body')) + parseInt(getAttrByName(character.id, 'body_mod'));
    var ma = parseInt(getAttrByName(character.id, 'ma')) + parseInt(getAttrByName(character.id, 'ma_mod'));
    var enc = parseInt(getAttrByName(character.id, 'enc'));
    var text = '';

    if ( 0 === injury ) {
        status = 'Healthy';
        refpenality = enc;
        mapenality = enc;
    } else if ( 5 > injury ) {
        status = 'Light';
        refpenality = enc;
        mapenality = enc;
    } else if ( 9 > injury ) {
        status = 'Serious';
        stun = -1 ;
        refpenality = 2 + enc;
        mapenality = 2 + enc;
        text = 'Ref -2';
    } else if ( 13 > injury ) {
        status = 'Critique';
        stun = -2 ;
        refpenality = Math.floor(ref/2) + enc;
        mapenality = Math.floor(ma/2) + enc;
        intpenality = Math.floor(int/2);
        coolpenality = Math.floor(cool/2);
        text = 'Ref, Int, Cool /2 (round up)'
    } else if ( 17 > injury ) {
        status = 'Mortel 0';
        stun = -3 ;
        refpenality = Math.floor((ref * 2)/3) + enc;
        mapenality = ma;
        intpenality = Math.floor((int * 2)/3);
        coolpenality = Math.floor((cool * 2)/3);
    } else if ( 21 > injury ) {
        status = 'Mortel 1';
        stun = -4 ;
        mortel = 1;
        mapenality = ma;
        refpenality = Math.floor((ref * 2)/3) + enc;
        intpenality = Math.floor((int * 2)/3);
        coolpenality = Math.floor((cool * 2)/3);
    } else if ( 25 > injury ) {
        status = 'Mortel 2';
        stun = -5 ;
        mortel = 2;
        mapenality = ma;
        refpenality = Math.floor((ref * 2)/3) + enc;
        intpenality = Math.floor((int * 2)/3);
        coolpenality = Math.floor((cool * 2)/3);
    } else if ( 29 > injury ) {
        status = 'Mortel 3';
        stun = -6 ;
        mortel = 3;
        mapenality = ma;
        refpenality = Math.floor((ref * 2)/3) + enc;
        intpenality = Math.floor((int * 2)/3);
        coolpenality = Math.floor((cool * 2)/3);
    } else if ( 33 > injury ) {
        status = 'Mortel 4';
        stun = -7 ;
        mortel = 4;
        mapenality = ma;
        refpenality = Math.floor((ref * 2)/3) + enc;
        intpenality = Math.floor((int * 2)/3);
        coolpenality = Math.floor((cool * 2)/3);
    } else if ( 37 > injury ) {
        status = 'Mortel 5';
        stun = -8 ;
        mortel = 5;
        mapenality = ma;
        refpenality = Math.floor((ref * 2)/3) + enc;
        intpenality = Math.floor((int * 2)/3);
        coolpenality = Math.floor((cool * 2)/3);
    } else if ( 41 > injury ) {
        status = 'Mortel 6';
        stun = -9 ;
        mortel = 6;
        mapenality = ma;
        refpenality = Math.floor((ref * 2)/3) + enc;
        intpenality = Math.floor((int * 2)/3);
        coolpenality = Math.floor((cool * 2)/3);
    } else {
        stun = -10 ;
        mortel = 7;
        mapenality = ma;
        refpenality = ref;
        coolpenality =cool;
        intpenality = int;
        status = 'Dead...';
    }
    var saveStunValue = body + parseInt(getAttrByName(character.id, 'saveS')) + stun;
    if (saveStunValue < 0 ){
        saveStunValue = 0;
    }
    var saveDeathValue = body + parseInt(getAttrByName(character.id, 'saveD')) - mortel;
    if (saveDeathValue < 0 ) {
        saveDeathValue = 0;
    }

    statusatt = findObjs({ type: 'attribute', characterid: character.id, name: 'status' })[0];
    statusatt.set('current', status);

    stunPenality = findObjs({ type: 'attribute', characterid: character.id, name: 'stunPenality' })[0];
    stunPenality.set('current', stun);

    saveStun = findObjs({ type: 'attribute', characterid: character.id, name: 'saveStun' })[0];
    saveStun.set('current', saveStunValue);

    saveDeath = findObjs({ type: 'attribute', characterid: character.id, name: 'saveDeath' })[0];
    saveDeath.set('current', saveDeathValue);

    ref_penality = findObjs({ type: 'attribute', characterid: character.id, name: 'ref_penality' })[0];
    ref_penality.set('current', refpenality);

    int_penality = findObjs({ type: 'attribute', characterid: character.id, name: 'int_penality' })[0];
    int_penality.set('current', intpenality);

    cool_penality = findObjs({ type: 'attribute', characterid: character.id, name: 'cool_penality' })[0];
    cool_penality.set('current', coolpenality);

    ma_penality = findObjs({ type: 'attribute', characterid: character.id, name: 'ma_penality' })[0];
    ma_penality.set('current', mapenality);

    ref_max = findObjs({ type: 'attribute', characterid: character.id, name: 'ref' })[0];
    ref_max.set('max', ref - refpenality);

    ma_max = findObjs({ type: 'attribute', characterid: character.id, name: 'ma' })[0];
    ma_max.set('max', ma - mapenality);

    int_max = findObjs({ type: 'attribute', characterid: character.id, name: 'int' })[0];
    int_max.set('max', int - intpenality);

    cool_max = findObjs({ type: 'attribute', characterid: character.id, name: 'cool' })[0];
    cool_max.set('max', cool - refpenality);

    run = findObjs({ type: 'attribute', characterid: character.id, name: 'run' })[0];
    run.set('max', (ma - mapenality)*3);

}

function armorCalculator(armor, armor_layers){
    var value = parseInt(armor.get('current'));
    armor_layers = armor_layers.sort(sortNumber);
    log('nb couche'+armor_layers.length);
    if(0 == armor_layers.length){
        value = 0;
    }else if (1 == armor_layers.length){
        value = armor_layers[0];
    }else {
        diff = armor_layers[0] - armor_layers[1];
        if (5 > diff) {
            value = armor_layers[0]+5;
        } else if (9 > diff) {
            value = armor_layers[0]+4;
        } else if (15 > diff) {
            value = armor_layers[0]+3;
        } else if (21 > diff) {
            value = armor_layers[0]+2;
        } else if (27 > diff) {
            value = armor_layers[0]+1;
        }
        if ( 3 == armor_layers.length){
            diff = value - armor_layers[2];
            log(diff);
            if (5 > diff) {
                value = value + 5;
            } else if (9 > diff) {
                value = value + 4;
            } else if (15 > diff) {
                value = value + 3;
            } else if (21 > diff) {
                value = value + 2;
            } else if (27 > diff) {
                value = value + 1;
            }
        }
    }
    armor.set('current', value);
}

function calculInjury(target, dmg, loc, loctxt){
    var stun = '';
    var dead = '';
    var cribled = '';
    var btm = parseInt(getAttrByName(target.id, 'btm'));
    if ( 1 > (dmg + btm)){
        dmg = 1;
    } else {
        dmg = dmg + btm;
    }
    if ( 0 < dmg ){
        log(getAttrByName(target.id, loc+'_cyb'));
        if ( -1 !== parseInt(getAttrByName(target.id, loc+'_cyb')) ) {
            var cyb = findObjs({ type: 'attribute', characterid: target.id, name: loc+'_cyb' })[0];
            var cyber = '<li>Hit cyber part</li>';
            if (0 < parseInt(cyb.get('current'))){
                if ( 0 < parseInt(cyb.get('current'))-dmg ){
                    cyb.set('current',parseInt(cyb.get('current'))-dmg);
                    return cyber+'<li>'+loctxt+' take : '+dmg+'</li>';
                } else {
                    cyb.set('current', 0 );
                    return cyber+'<li>'+loctxt+' take : '+dmg+', Destroyed !</li>';
                }
            } else {
                return cyber+'<li>'+loctxt+' already destroyed !</li>';
            }
        } else {
            var injury = findObjs({ type: 'attribute', characterid: target.id, name: 'injury' })[0];
            if ('undefined' == typeof injury){
                createObj("attribute", {
                    name: "injury",
                    current: 0,
                    characterid: target.id
                });
                var injury = findObjs({ type: 'attribute', characterid: target.id, name: 'injury' })[0];
            } else if ('' === injury.get('current')) {
                injury.set('current', 0);
            }
            log(injury);
            injury.set('current',parseInt(injury.get('current'))+dmg);
            injuryPenalties(injury.get('current'), target);

            if ( ('head' == loc) && (7 < dmg) ){
                dead = '<li><b style="color:red">Headshot...Dead !!!</b></li>';
            } else {
                if ( ( parseInt(getAttrByName(target.id, 'body', 'max')) + parseInt(getAttrByName(target.id, 'saveS')) - parseInt(getAttrByName(target.id, 'stunPenality')) ) < randomIntFromInterval(10,1) ){
                    stun = '<li><b style="color:#FF4500">Stunned</b></li>';
                }
                if ( 12 < parseInt(injury.get('current')) ){
                    if ( ( parseInt(getAttrByName(target.id, 'body', 'max')) + parseInt(getAttrByName(target.id, 'saveD')) - parseInt(getAttrByName(target.id, 'status').slice(-1)) ) < randomIntFromInterval(10,1) || 40 < dmg ){
                        dead = '<li><b style="color:red">Dead !!!</b></li>';
                    } else {
                        dead = '<li><b style="color:red">Dying... </b></li>';
                    }
                }
                if ( ('rArm' == loc || 'lArm' == loc || 'lLeg' == loc || 'rLeg' == loc) && (7 < dmg) ) {
                    cribled = '<li><b style="color:red">'+loctxt+' cribled !!!</b></li>';
                    if ( ( parseInt(getAttrByName(target.id, 'body', 'max')) + parseInt(getAttrByName(target.id, 'saveD')) ) < randomIntFromInterval(10,1) || 40 < dmg ){
                        dead = '<li><b style="color:red">Dead !!!</b></li>';
                    }
                }
            }
            return '<li>Damages taken : '+dmg+'</li><li>Health : '+getAttrByName(target.id, 'status')+'</li>'+cribled+stun+dead;
        }
    }
}


function calculDamages(target, dmg,  locId, ap, multiplicateur, melee){
    var operator = multiplicateur.split('v')[0];
    var multiplicateur = parseInt(multiplicateur.split('v')[1]);
    log(operator);
    var loc = 'torso';
    var loctxt = 'torso';
    var apTxt = '';
    var melTxt = '';
    if ( 1 != parseInt(ap)){
        apTxt = ' AP';
    }
    if (1 == melee){
        melTxt = ' Mel';
    }
    var txt ='<div style="background-color:white;border:1px solid black;"><ul><li>Target : '+target.get('name')+'</li><li>Damage roll : '+dmg+apTxt+melTxt+'</li>';

    if (locId == 1){
        loc = 'head';
        loctxt = 'head';
    } else if (locId == 5) {
        loc = 'rArm';
        loctxt = 'right arm';

    } else if (locId == 6) {
        loc = 'lArm';
        loctxt = 'left arm';
    } else if (locId < 9 && locId > 6 ){
        loc = 'rLeg';
        loctxt = 'right leg';
    } else if (locId < 11 && locId > 8 ){
        loc = 'lLeg';
        loctxt = 'left leg';
    }
    txt += '<li>Hit : '+loctxt+'</li>';
    var armor_layers = [];
    var armor = findObjs({ type: 'attribute', characterid: target.id, name: loc })[0];


    log('DAMAGE :'+dmg);
    if (0 < dmg) {
        if (1 == parseInt(getAttrByName(target.id,'armor_macro'))){
            for (var i = 3; i > 0; i--) {
                if (1 == parseInt(getAttrByName(target.id, 'layer_' + i))) {
                    var armor_layer = findObjs({type: 'attribute', characterid: target.id, name: loc + '_' + i})[0];
                    if ('undefined' !== typeof armor_layer) {
                        log('ARMOR VALUE ' + armor_layer.get('current'));
                        log(melee);
                        if (0 < parseInt(armor_layer.get('current')) ) {
                            log('REAGRDE ICI BORDEL : '+getAttrByName(target.id, loc+'_'+i+'_r'));
                            if (1 == melee && 'on' == getAttrByName(target.id, loc+'_'+i+'_r')){
                                log('PASSE ICI !!!!!!!!');
                                dmg = dmg - (Math.floor(armor_layer.get('current') / 1));
                            } else {
                                dmg = dmg - (Math.floor(armor_layer.get('current') / ap));
                            }
                            log('ARMOR REDUCE DAMAGE TO '+dmg);
                            if (0 < dmg) {
                                log('Armor penetration ! ' + dmg + ' damages remind');
                                armor_layer.set('current', parseInt(armor_layer.get('current')) - 1);
                                if (0 < parseInt(armor_layer.get('current'))){
                                    txt += '<li>Layer '+i+' penetrated</li>';
                                } else {
                                    txt += '<li>Layer '+i+' destroyed</li>';
                                }
                            }
                        }
                        if (0 < parseInt(armor_layer.get('current')) ) {
                            armor_layers.push(parseInt(armor_layer.get('current')));
                        }

                    }
                }
            }
            armorCalculator(armor, armor_layers);
        } else {
            log(armor);
            if ('undefined' == typeof armor){
                createObj("attribute", {
                    name: loc,
                    current: 0,
                    characterid: target.id
                });
                var armor = findObjs({ type: 'attribute', characterid: target.id, name: loc })[0];
            }
            dmg = dmg - (Math.floor(armor.get('current')/ap));
            if (0<dmg) {
                log('Armor penetration ! ' + dmg + ' damages remind');
                if ( 0 < parseInt(armor.get('current')) ){
                    armor.set('current', parseInt(armor.get('current')) - 1 );
                }
            }
        }
        if ( '*' == operator ){
            dmg = Math.ceil(dmg * multiplicateur);
        } else {
            dmg = Math.ceil(dmg / multiplicateur);
        }

        log('REMAINING DAMAGES '+dmg);
        if (0 < dmg) {
            if (loctxt == 'head'){
                dmg = Math.ceil(dmg * 2);
            }
            txt += calculInjury(target, dmg, loc, loctxt);
        } else {
            txt += '<li>No damages taken.</li>';
        }
    }


    txt += '</ul></div>';
    return txt;
}

on("chat:message", function(msg) {
    log(msg);
    var macro = msg.content.split(' ');
    var title = msg.who;
    if(msg.type == "api" && "0" != macro[1] ){
        var selectedTokenId = macro[1];
        var character = getCharacter(selectedTokenId);
        var characterAttributes = findObjs({ type: 'attribute', characterid: character.id });
        var title = character.get('name');
    }

    if( msg.type == "api" && ("!test" == macro[0] || "!damage" == macro[0]) ) {
        /*
        log(msg.inlinerolls[0].results.rolls[0].dice);
        log(msg.inlinerolls[0].results.rolls[0].sides);
        log(msg.inlinerolls[0].results.rolls[1].expr);
        */
        if ("!test" == macro[0]) {
            var targetTokenId = macro[2];
            var target = getCharacter(targetTokenId);
            var targetAttributes = findObjs({ type: 'attribute', characterid: target.id });
        }
        var wp_id = getSelectedWeapon(character, characterAttributes, selectedTokenId);
        log('WP_ID '+wp_id);

        if (wp_id) {
            var wp_select = findObjs({ type: 'attribute', characterid: character.id, name: 'repeating_wp_'+wp_id+'_wp-dmg' })[0];
            log('WP_select '+wp_select.get('current'));
            if (wp_select.get('current').indexOf("+") > -1) {
                macro[5] = wp_select.get('current').split('+')[1];
                macro[3] = (wp_select.get('current').split('+')[0]).split('d')[0];
                macro[4] = 'd'+(wp_select.get('current').split('+')[0]).split('d')[1];
            } else {
                macro[3] = wp_select.get('current').split('d')[0];
                macro[4] = 'd'+wp_select.get('current').split('d')[1];
            }
            //log(nbDice+' '+typeDice+' '+mod );
        }

        var ap = parseInt(macro[8]);
        var multiplicateur = macro[9];
        var txt = '';
        for (var n = 0 ; n < parseInt(macro[10]) ; n++) {
            if (wp_id) {
                if ('MEL' == getAttrByName(character.id,'repeating_wp_'+wp_id+'_wptype')){
                    var melee = 1;
                    var canFire = 1;
                } else {
                    var melee = 0;
                    var wp_ammo_load = findObjs({ type: 'attribute', characterid: character.id, name: 'repeating_wp_'+wp_id+'_wp-ammo-load' })[0];
                    log("ammo_load: "+wp_ammo_load);
                    if(wp_ammo_load == null){
                        var canFire = 0;
                    } else {
                        if (0 < parseInt(wp_ammo_load.get('current'))){
                            wp_ammo_load.set('current', parseInt(wp_ammo_load.get('current'))-1);
                            var canFire = 0;
                        } else {
                            var canFire = 0;
                        }
                    }
                }
            } else {
                var canFire = 1;
            }
            var dmg = randomIntFromInterval(
                diceType(macro[4]),
                parseInt(macro[3])
            ) + parseInt(macro[5]) + parseInt(macro[6]);
            var loc = macro[7];
            if ( '1d6' == loc || '1d10' == loc){
                max = diceType(loc);
                loc = randomIntFromInterval(max,1);
            } else if ( '1d4+6' == loc || '1d6+4' == loc || '1d9+1' == loc || '1d5+1' == loc){
                var d = loc.split('+');
                max = diceType(d[0]);
                loc = randomIntFromInterval(max,1);
                log('loc dice : '+loc+' + '+d[1]);
                loc = parseInt(loc) + parseInt(d[1]);
                log('final loc : '+loc);
            } else {
                loc = parseInt(loc);
            }
            log('damage : '+dmg+' type : '+typeof(dmg));
            log('location : '+loc+' type : '+typeof(loc));
            log('AP : '+ap+' type : '+typeof(ap));
            log('AP : '+multiplicateur+' type : '+typeof(multiplicateur));
            if (0 != loc && 0 < canFire){
                if ("!test" == macro[0]){
                    txt += calculDamages(target,dmg,loc,ap, multiplicateur, melee);
                } else if ("!damage" == macro[0] && 0 != parseInt(macro[3]) ){
                    txt += '<div style="background-color:white;border:1px solid black;"><ul>';
                    if (parseInt(loc) == 1){
                        loctxt = 'head';
                    } else if (parseInt(loc) == 5) {
                        loctxt = 'right arm';
                    } else if (parseInt(loc) == 6) {
                        loctxt = 'left arm';
                    } else if (parseInt(loc) < 9 && parseInt(loc) > 6 ){
                        loctxt = 'right leg';
                    } else if (parseInt(loc) < 11 && parseInt(loc) > 8 ){
                        loctxt = 'left leg';
                    } else {
                        loctxt = 'torso';
                    }
                    var apTxt = '';
                    if ( 1 != parseInt(ap)){
                        apTxt = ' AP';
                    }
                    txt += '<li>Hit : '+loctxt+'</li>';
                    txt += '<li>Damages : '+dmg+apTxt+'</li></ul></div>';
                } else {
                    txt = '<div style="background-color:white;border:1px solid black;"><ul><li>Error !</li></ul></div>';
                    var title = 'Admin message';
                }
            } else {
                txt = '<div style="background-color:white;border:1px solid black;"><ul><li>No Ammos...</li></ul></div>';
            }
        }
        txt += '<div>-- End --</div>';
        sendChat(title, ''+txt);
    } else if (msg.type == "api" && "!selecta" == macro[0]) {
        var html = selectAmmo(characterAttributes, selectedTokenId);
        log(html);
        sendChat('Ammos list', ''+html);
    } else if(msg.type == "api" && "!reload" == macro[0]) {
        var a_id = macro[2];
        var wp_id = getSelectedWeapon(character, characterAttributes);
        if (null == wp_id){
            sendChat('error', 'No weapon selected !');
        } else {
            log('LA EST IMPORTANT '+wp_id);
            var nb_ammo = findObjs({ type: 'attribute', characterid: character.id, name: 'repeating_ammu_'+a_id+'_ammu-nb' })[0];
            var ammo_loaded = findObjs({ type: 'attribute', characterid: character.id, name: 'repeating_wp_'+wp_id+'_wp-ammo-load' })[0];
            var rof = findObjs({ type: 'attribute', characterid: character.id, name: 'repeating_wp_'+wp_id+'_wp-rof' })[0];
            log(a_id);
            //var ammo_loaded = getAttrByName(character.id,'repeating_wp_'+wp_id+'_wp-ammo-load');
            //var ammo_loaded = character.get()

            if (0 == parseInt(nb_ammo.get('current'))) {
                sendChat('Info','Not enough ammos');
            } else if ( 0 > (parseInt(nb_ammo.get('current')) - parseInt(rof.get('current'))) ){
                ammo_loaded.set('current', nb_ammo.get('current'));
                nb_ammo.set('current', 0);
                sendChat('Info','weapon reloaded');
            } else {
                ammo_loaded.set('current',rof.get('current').split('/')[0]);
                nb_ammo.set('current', (parseInt(nb_ammo.get('current')) - parseInt(rof.get('current'))) );
                sendChat('Info','weapon reloaded');
            }
        }
    } else if(msg.type == "api" && "!show" == macro[0]) {
        var wp_id = getSelectedWeapon(character, characterAttributes);
        if (null == wp_id){
            sendChat('error', 'No weapon selected !');
        } else {
            var ammo_loaded = getAttrByName(character.id,'repeating_wp_'+wp_id+'_wp-ammo-load');
            sendChat('Current ammos ', ''+ammo_loaded);
        }
    }

});