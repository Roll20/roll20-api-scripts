class Msg {
    constructor(msg) {
        let macro = msg.content.split(' ');
        //!test 0 @{target|token_id} @{nb_dice} @{type_dice} @{add_dmg} @{meleedmg} @{loc} ?{AP|Normal,1/1|SP/2,2|SP/3,3|SP/4,4} ?{Damage|x1,*v1|÷2,/v2|x2,*v2} ?{nb hits|1}
        this.type = msg.type;
        this.who = msg.who;
        this.action = macro[0];
        this.selectedToken = (1 in macro && '0' !== macro[1]) ? macro[1] : null;
        this.targetToken = (2 in macro && '0' !== macro[2]) ? macro[2] : null;
        if ('!damage' === this.action || '!wp-damage' === this.action ) {
            this.damages = setDice(macro[3] + macro[4].toLowerCase() + '+' + macro[5]);
            this.meleeDmg = parseInt(macro[6]);
            this.loc = (macro[7].toLowerCase().indexOf('1d') > -1) ? setDice(macro[7].toLowerCase()) : parseInt(macro[7]);
            this.armorPercing = parseInt(macro[8]);
            this.multiplicateurDamage = macro[9];
            this.nbHit = parseInt(macro[10]);
        } else if ('!wp-show' === this.action){
            //this.selectedToken = macro[1];
        }
        this.response = null;
    }
}

class Character {
    constructor(tokenId) {
        if (0 === parseInt(tokenId) || null === tokenId) return null;
        let token = getObj('graphic', tokenId);
        //if (token.get("represents") === "") return null;

        let character = getObj("character", token.get("represents"));
        this.cid = character.id;
        this.name = character.get('name');
        //this.owner=
        this.attributs = findObjs({type: 'attribute', characterid: character.id});
        this.message = {};
        this.armorLayers = this.getArmorLayers();
    }

    getArmor(armorLayers) {
        if (0 === armorLayers.length) {
            return 0;
        } else if (1 === armorLayers.length) {
            return armorLayers[0];
        } else {
            armorLayers.sort(function (a, b) {
                return b - a
            });
            let value = armorLayers[0];
            let diff = {5: 5, 9: 4, 15: 3, 21: 2, 27: 1};
            for (let n = 1; n <= armorLayers.length; n++) {
                for (let i in diff) {
                    if (parseInt(i) > value - armorLayers[n]) {
                        value = value + parseInt(diff[i]);
                        break;
                    }
                }
            }
            return value;
        }
    }

    getArmorLayers() {
        let armorLayers = {};
        let parts = ['face', 'head', 'torso', 'rArm', 'lArm', 'rLeg', 'lLeg'];
        for (let loc in parts) {
            let arr = [];
            for (let x = 3; x > 0; x--) {
                if ( 1 === this.getAttr('layer_' + x)) {
                    let armorValue = this.getAttr(parts[loc] + '_' + x);
                    if ( armorValue && 0 !== armorValue ) {
                        arr.push(armorValue);/*
                        arr.sort(function (a, b) {
                            return b - a
                        });*/
                    }
                }
            }
            armorLayers[parts[loc]] = arr;
            this.setAttr(parts[loc], this.getArmor(armorLayers[parts[loc]]));
        }

        return armorLayers;
    }

    armorDegradation(penetration, part, dmg, msg) {
        let armorDegradation = false;
        for (let i = 3; i > 0; i--) {
            if (1 === this.getAttr('layer_'+i)) {
                let SP = this.getAttr(part + '_' + i);
                log(part+''+i+' SP='+SP);
                if ( 0 < SP ){
                    if (penetration){
                        this.setAttr(part + '_' + i, ( 0 < SP ) ? SP - 1 : 0);
                        armorDegradation = true;
                    } else if ( dmg > Math.floor(SP /msg.armorPercing )) {
                        this.setAttr(part + '_' + i, ( 0 < SP ) ? SP - 1 : 0);
                        dmg = dmg - Math.floor(SP /msg.armorPercing );
                        armorDegradation = true;
                    } else {
                        break;
                    }/*
                    if ('on' !== this.getAttr(part + '_' + i + '_r') ) {
                        this.setAttr(part + '_' + i, (0 < v) ? v - 1 : 0);
                    } else if (  this.getAttr(part + '_' + i) ) {
                        this.setAttr(part + '_' + i, (0 < v) ? v - 1 : 0);
                    }
                    break;*/
                }
            }
        }
        return armorDegradation;
    }

    getWeapon(msg) {
        let weaponId = null; //TODO
        _.each(this.attributs, (w) => {
            if (w.get('name').indexOf('repeating_wp') > -1 && w.get('name').indexOf('wp-name') > -1) {
                let id = w.get('name').split("_")[2];
                if ('on' === this.getAttr('repeating_wp_' + id + '_wp-selected')) {
                    weaponId = 'repeating_wp_' + id + '_';
                }
            }
        });
        return weaponId;
    }

    showWeapon(msg){
        let weaponId = this.getWeapon();
        let arr = {
            name : this.getAttr(weaponId+'wp-name'),
            rof : this.getAttr(weaponId+'wp-rof'),
            dmg : this.getAttr(weaponId+'wp-dmg'),
            range : this.getAttr(weaponId+'wp-range'),
            ammoloaded : this.getAttr(weaponId + 'wp-ammo-load')
        };
        responseMsg(arr,msg)
    }

    reloadWeapon(msg) {
        let weaponId = this.getWeapon();
        log('PASSE LA');
        let value = parseInt(this.getAttr(weaponId+'wp-rof').split('/')[0]);
        log('AMMO:'+value);
        this.setAttr(weaponId+'wp-ammo-load', value);
        let arr = {
            name: this.getAttr(weaponId + 'wp-name'),
        };
        responseMsg(arr,msg)
    }


    useWeapon(nbShot = 1) {

        let weaponId = this.getWeapon();

        if (null !== weaponId) {
            let damages = [];
            for (let n = 0; n < nbShot; n++) {
                if ('MEL' === this.getAttr(weaponId + 'wp-type') || 0 < parseInt(this.getAttr(weaponId + 'wp-ammo-load'))) {
                    damages.push(randomIntFromInterval(setDice(this.getAttr(weaponId + 'wp-dmg'))) + (('MEL' === this.getAttr(weaponId + 'wp-type')) ? parseInt(this.getAttr('meleeDmg')) : 0));
                    if ('MEL' !== this.getAttr(weaponId + 'wp-type')) {
                        this.setAttr(weaponId + 'wp-ammo-load', parseInt(this.getAttr(weaponId + 'wp-ammo-load')) - 1);
                    }
                }
            }
            return damages;
        }
        return null;
    }

    setLocationDamages(n = 1) {
        let locationDamages = [];
        while (0 < n) {
            locationDamages.push(isNaN(this.getAttr('loc')) ? randomIntFromInterval(setDice(this.getAttr('loc'))) : parseInt(this.getAttr('loc')));
            n--;
        }
        return locationDamages;
    }

    getDamages(damages, msg) {
        for (let x = 0; x < damages['dmg'].length; x++) {
            //if (null === damages['dmg'][x]) break;
            let dmg = damages['dmg'][x];
            let loc = damages['loc'][x];
            let health = {};
            let parts = {
                0: 'face',
                1: 'head',
                2: 'torso',
                3: 'torso',
                4: 'torso',
                5: 'rArm',
                6: 'lArm',
                7: 'rLeg',
                8: 'rLeg',
                9: 'lLeg',
                10: 'lLeg',
            };
            if (1 === loc && 0 > this.getAttr(parts[loc] + '_cyb')) {
                loc = (2 > randomIntFromInterval({ type:10, nb: 1, mod:0})) ? 0 : 1;
            }
            // Armor action
            let armor = Math.floor(this.getAttr(parts[loc]) / msg.armorPercing);
            let loseHp = (dmg - armor > 0) ? dmg - armor : 0;
            let armorDegradation = this.armorDegradation( (0 < loseHp), parts[loc], dmg, msg );
            this.getArmorLayers();
            if (0 < loseHp) {
                // Multiplicateur actions
                loseHp = (1 === loc || 0 === loc && 0 > this.getAttr('head_cyb')) ? loseHp * 2 : loseHp;
                if ('*v2' === msg.multiplicateurDamage) {
                    loseHp = loseHp * 2;
                } else if ('/v2' === msg.multiplicateurDamage) {
                    loseHp = Math.ceil(loseHp / 2);
                }
                // BTM action
                loseHp = (loseHp + this.getAttr('btm') <= 0) ? 1 : loseHp + this.getAttr('btm');

                // Apply damages to health /Cyb

                if (0 <= this.getAttr(parts[loc] + '_cyb')) {
                    health = this.applyDamageCyber(loseHp, parts[loc]);
                } else {
                    health = this.applyDamage(loseHp, parts[loc]);
                }
            }
            log('dmg=' + loseHp);
            let response = {
                name: this.name,
                dmg: dmg,
                loc: loc,
                loseHp: loseHp,
                armorDegradation: armorDegradation
            };
            responseMsg(Object.assign(response, health), msg);
        }
    }

    applyDamageCyber(loseHp, part) {
        this.setAttr(part + '_cyb', (((this.getAttr(part + '_cyb') - loseHp)) < 0) ? 0 : this.getAttr(part + '_cyb') - loseHp);
        if (!['face', 'head', 'torso'].includes(part)) {
            if (this.getAttr(part + '_cyb') === 0) this.setAttr(part + '_status', 'on');
        }
        return null; //TODO
    }

    applyDamage(loseHp, part) {
        let injury = this.getAttr('injury') + loseHp;
        this.setAttr('injury', injury);
        let health = {
            12: {
                status: 'Mortel',
                penalties: [
                    this.getAttr('ma'),
                    Math.floor((this.getAttr('ref') * 2) / 3) + this.getAttr('enc'),
                    Math.floor((this.getAttr('int') * 2) / 3),
                    Math.floor((this.getAttr('cool') * 2) / 3)
                ]
            },
            8: {
                status: 'Critique',
                penalties: [
                    Math.floor(this.getAttr('ma') / 2) + this.getAttr('enc'),
                    Math.floor(this.getAttr('ref') / 2) + this.getAttr('enc'),
                    Math.floor(this.getAttr('int') / 2),
                    Math.floor(this.getAttr('cool') / 2)
                ]
            },
            4: {
                status: 'Serious',
                penalties: [2 + this.getAttr('enc'), 2 + this.getAttr('enc'), 0, 0] // ma,ref,int,cool
            },
            0: {
                status: 'Light',
                penalties: [this.getAttr('enc'), 0, 0, 0] // ma,ref,int,cool
            },
        };

        let status = 'healthy';
        let penalties = [];
        for (const i in health) {
            if (this.getAttr('injury') > parseInt(i)) {
                status = health[i].status;
                penalties = health[i].penalties;
            }
        }

        let limb = false;
        if (!['face', 'head', 'torso'].includes(part) && 7 < loseHp) {
            this.setAttr(part + '_status', 'on');
            limb = true;
        } else if (['face', 'head'].includes(part) && 7 < loseHp) {
            status = 'Dead !!!';
        }
        this.setAttr('status', status);
        this.setAttr('stunPenality', '-'+Math.floor((injury - 1) / 4) );
        this.setAttr('saveStun', this.getAttr('body') + this.getAttr('body_mod') + this.getAttr('saveS') - Math.floor((injury - 1) / 4));
        this.setAttr('saveDeath', this.getAttr('body') + this.getAttr('body_mod') + this.getAttr('saveD') - Math.floor((injury - 13) / 4));
        return {
            status: status,
            penalties: penalties,
            limb: limb
        };
    }


    //SETTER / GETTER
    setAttr(attr, value) {
        log('char:' + this.cid + ' attribut:' + attr + ' value:' + value);
        let objAttr = findObjs({type: 'attribute', characterid: this.cid, name: attr})[0];
        log(objAttr);
        if ('undefined' === typeof objAttr) {
            log('#createAttr !');
            createObj('attribute', {
                name: attr,
                current: value,
                max: 0,
                characterid: this.cid
            });
        } else {
            log('#setAttr !');
            objAttr.set('current', value);
        }
    }

    getAttr(name) {
        let value = getAttrByName(this.cid, name);
        if ('undefined' === typeof value) return null;
        else return !isNaN(value) ? parseInt(value) : value;
    }
}

//GENERAL FUNCTIONS
function setDice(string) {
    if (string.indexOf("+") > -1) {
        return {
            mod: parseInt(string.split('+')[1]),
            nb: parseInt(string.split('+')[0].toLowerCase().split('d')[0]),
            type: parseInt(string.split('+')[0].toLowerCase().split('d')[1])
        };
    } else {
        return {
            mod: 0,
            nb: parseInt(string.toLowerCase().split('d')[0]),
            type: parseInt(string.toLowerCase().split('d')[1])
        }
    }
}

function randomIntFromInterval(dice) {
    let result = 0;
    if ("" === dice['nb'] || 0 === dice['nb']) dice['nb'] = 1;
    for (let i = 0; i < dice['nb']; i++) {
        result += Math.floor(Math.random() * dice['type'] + 1);
        log('RESULT DICE ' + result);
    }
    return result + dice['mod'];
}

function manualDamages(msg) {
    let damages = [];
    let locationDamages = [];
    let nb = msg.nbHit;
    while (0 < nb) {
        damages.push(randomIntFromInterval(msg.damages) + msg.meleeDmg);
        locationDamages.push((typeof msg.loc === 'number') ? msg.loc : randomIntFromInterval(msg.loc));
        nb--;
    }
    return {'dmg': damages, 'loc': locationDamages};
}

function noTarget(damages, msg){
    for (let x = 0; x < damages['dmg'].length; x++) {
        let dmg = damages['dmg'][x];
        let loc = damages['loc'][x];
        if (1 === loc) {
            loc = (3 > randomIntFromInterval({ type:10, nb: 1, mod:0})) ? 0 : 1;
        }
        responseMsg({ dmg: dmg, loc: loc }, msg );
    } if (damages['dmg'].length < damages['loc'].length) {
        responseMsg({ info: 'No more ammos !' } ,msg);
    }
}

function responseMsg(array, msg) {
    let txt = '<div><b><i>'+msg.who+'</i></b></div><div style="background-color:white;border:1px solid black;">';
    if ('!damage' === msg.action || '!wp-damage' === msg.action){
        if ( 'dmg' in array ) {
            let parts = {
                0: 'face',
                1: 'head',
                2: 'torso',
                3: 'torso',
                4: 'torso',
                5: 'right arm',
                6: 'left arm',
                7: 'right leg',
                8: 'right leg',
                9: 'left leg',
                10: 'left leg'
            };
            txt += 'You hit the <b>' + parts[array.loc] + '</b> for <b style="color:red">' + array.dmg + '</b> damages.';
            if ('undefined' !== typeof array.loseHp) {
                let target = ('name' in array) ? '<b>'+array.name+'</b>' : 'Your target';
                if (0 < array.loseHp) {
                    txt +=  ' '+target+' takes <b style="color:red">' + array.loseHp + '</b> damages ';
                    if (8 < array.loseHp && [0, 1].includes(array.loc)) {
                        txt += 'and... is dead !!!';
                    }else if (8 < array.loseHp && [5, 6, 7, 8, 9, 10].includes(array.loc)) {
                        txt += 'and loses the use of the ' + parts[array.loc] +'. '+target+' has <b>'+array.status+'</b> injuries.';
                    } else {
                        txt += 'and has <b>'+array.status+'</b> injuries.';
                    }
                } else {
                    txt += 'but '+target+' take <b>no damage</b>.';
                }
                if (array.armorDegradation) {
                    txt += ' The armor has been penetrated.';
                }
            }
        } else {
            txt += 'Your weapon is empty';
        }
    } else if ('!wp-show' === msg.action){
        txt += 'Your '+array.name+' have got '+array.ammoloaded+' ammos.';
    } else if ('!wp-reload' === msg.action) {
        txt += 'Your '+array.name+' is reloaded';
    }
    txt += '</div><div>--- END ---</div>';
    sendChat('', '' + txt);
}

// ON CHAT MESSAGE

on("chat:message", function (value) {
    log(value);
    let msg = new Msg(value);

    log(msg);
    if ("api" === msg.type) {
        let selected = (null !==  msg.selectedToken) ? new Character(msg.selectedToken) : null;
        let target = (null !== msg.targetToken) ? new Character(msg.targetToken) : null;
        let damages = {};
        if ('!wp-damage' === msg.action && null != selected) {
            damages = {
                dmg: selected.useWeapon(msg.nbHit),
                loc: selected.setLocationDamages(msg.nbHit)
            };
            if (null != target) {
                target.getDamages(damages, msg);
            } else {
                noTarget(damages, msg);
            }
        } else if ('!damage' === msg.action) {
            damages = manualDamages(msg);
            if (null != target) {
                target.getDamages(damages, msg);
            } else {
                log("ERROR")
            }
        } else if ('!wp-show' === msg.action && null !== selected) {
            selected.showWeapon(msg);
        } else if ('!wp-reload' === msg.action && null !== selected){
            log('RELOAD');
            selected.reloadWeapon(msg);
        }
        log(damages);
    }
});