if (typeof MarkStart != 'undefined') {MarkStart('MassCombat');}
/* Mass Combat
*
* A companion script for Kyburn's Mass Combat rule set: 
* https://docs.google.com/document/d/1-56AC-p57x-vr_BzszksjC55kTFK4d67XOzcIb1pWCY/edit?usp=sharing
*
* by Michael Greene (Volt Cruelerz)
*
*/

on('ready', () => {
    const mcname = 'MassCombat';
    const v = 1.0;
    const cache = {};

    const LogLevels = {
        Trace: 0,
        Debug: 1,
        Info: 2,
        Warn: 3,
        Error: 4,
        Fatal: 5
    };
    let logLevel = LogLevels.Debug;

    // Trace Log
    const tlog = (str) => {
        if (logLevel <= LogLevels.Trace) {
            log(str);
        }
    };

    // Debug Log
    const dlog = (str) => {
        if (logLevel <= LogLevels.Debug) {
            log(str);
        }
    };

    // Initialize the state
    const ConfigureState = () => {
        if (!state.MassCombat) {
            state.MassCombat = {
                SavedInitiative: []
            };
        }
        if (!state.MassCombat.Version || state.MassCombat.Version < 0.8) {
            log('-=> Updating Mass Combat to version 0.8');
            state.MassCombat.Version = 0.8;
            state.MassCombat.OperationHistory = [];
            state.MassCombat.OperationHistorySize = 20;
            state.MassCombat.OpId = 0;
        } else if (state.MassCombat.Version < 1.0) {
            state.MassCombat.Version = 1.0;
        }
    }; ConfigureState();

    const getCharByAny = (nameOrId) => {
        let character = null;
      
        // Try to directly load the character ID
        character = getObj('character', nameOrId);
        if (character) {
            return character;
        }
      
        // Try to load indirectly from the token ID
        const token = getObj('graphic', nameOrId);
        if (token) {
            character = getObj('character', token.get('represents'));
            if (character) {
                return character;
            }
        }
      
        // Try loading through char name
        const list = findObjs({
            _type: 'character',
            name: nameOrId,
        });
        if (list.length === 1) {
            return list[0];
        }
      
        // Default to null
        return null;
    };

    const getAttrs = (char, attrName) => {
        const attr = filterObjs((obj) => {
            if (obj.get('type') === 'attribute'
                && obj.get('characterid') === char.id
                && obj.get('name') == attrName) {
                    return obj;
            }
        });
        if (!attr || attr.length === 0) {
            dlog('No Attr: ' + char + ': ' + attrName);
            return null;
        }
        return attr;
    }

    const getAttr = (char, attrName) => {
        let attrs = getAttrs(char, attrName);
        if (!attrs) {
            return null;
        }
        return attrs[0];
    }

    const getAttrCurrent = (char, attrName) => {
        let attr = getAttr(char, attrName);
        if (!attr) {
            return null;
        }
        return attr.get('current');
    }

    const getAttrMax = (char, attrName) => {
        let attr = getAttr(char, attrName);
        if (!attr) {
            return null;
        }
        return attr.get('max');
    }

    const getAttrsFromSub = (char, substringName) => {
        const attrs = filterObjs((obj) => {
            if (obj.get('type') === 'attribute'
                && obj.get('characterid') === char.id
                && obj.get('name').indexOf(substringName) !== -1) {
                    return obj;
            }
        });
        if (!attrs || attrs.length === 0) {
            dlog('No Substr Attr: ' + char + ': ' + substringName);
            return null;
        }
        return attrs;
    }

    const getAttrFromSub = (char, substringName) => {
        return getAttrsFromSub(char, substringName)[0];
    }

    const setAttr = (charId, attrName, current, max = '') => {
        const attr = findObjs({
            type: 'attribute',
            characterid: charId,
            name: attrName,
        })[0];
        if (typeof attr === 'undefined' || attr == null) {
            const attr = createObj('attribute', 
            { 
                name: attrName, 
                characterid: charId, 
                current: current+'',
                max: max+''
            });
        } else {
            attr.setWithWorker({
                current: current+'',
                max: max+''
            });
        }
    };

    // Pulls the interior message out of carets (^)
    const Decaret = (quotedString) => {
        const startQuote = quotedString.indexOf('^');
        const endQuote = quotedString.lastIndexOf('^');
        if (startQuote >= endQuote) {
            if (!quietMode) {
                sendChat(drname, `**ERROR:** You must have a string within carets in the phrase ${string}`);
            }
            return null;
        }
        return quotedString.substring(startQuote + 1, endQuote);
    };

    const sizeCostArray = [0.01, 0.03, 0.1, 0.3, 1.0, 3.0];
    const creatureSize = {
        "Tiny": 0,
        "Small": 1,
        "Medium": 2,
        "Large": 3,
        "Huge": 4,
        "Gargantuan": 5
    };

    const getCreatureSize = (npcType) => {
        if (npcType.toLowerCase().includes('tiny')) {
            return creatureSize.Tiny;
        } else if (npcType.toLowerCase().includes('small')) {
            return creatureSize.Medium;
        } else if (npcType.toLowerCase().includes('medium')) {
            return creatureSize.Medium;
        } else if (npcType.toLowerCase().includes('large')) {
            return creatureSize.Large;
        } else if (npcType.toLowerCase().includes('huge')) {
            return creatureSize.Huge;
        } else if (npcType.toLowerCase().includes('gargantuan')) {
            return creatureSize.Gargantuan;
        } else {
            return -1;
        }
    };

    class Hero {
        constructor(name, hp, mhp) {
            this.Name = name;
            this.HP = hp;
            this.MHP = mhp;
        }
    }

    class Status {
        constructor(type, value) {
            this.Type = type;
            this.Value = value;
        }
    }

    const GetStatuses = (token) => {
        const rawStatus = token.get('statusmarkers');
        const oldStatusArray = rawStatus.split(',');
        const newStatusArray = [];
        let previousType = false;
        let prevStatus = null;
        oldStatusArray.forEach((entry) => {
            const statusFields = entry.split('@');
            const type = statusFields[0];
            const value = statusFields.length > 1
                ? statusFields[1]
                : true;
            let newStatus = null;
            // If we've already gotten one of this kind, we're seeing a duplicate, so add to previous
            if (type === previousType) {
                newStatus = prevStatus;
                prevStatus.Value = prevStatus.Value + value;
            } else {
                newStatus = new Status(type, value);
                newStatusArray.push(newStatus);
            }
            previousType = type;
            prevStatus = newStatus;
        });
        return newStatusArray;
    };

    const GetStatusValue = (token, type) => {
        const statuses = GetStatuses(token);
        for(let i = 0; i < statuses.length; i++) {
            const curStatus = statuses[i];
            if (type === curStatus.Type) {
                const intVal = parseInt(curStatus.Value);
                if (isNaN(intVal)) {
                    return curStatus.Value;
                } else {
                    return intVal;
                }
            }
        }
        return false;
    };

    const StringifyStatus = (status) => {
        if (status.Value === true) {
            return status.Type;
        } else {
            const strVal = status.Value + "";
            const digitArray = strVal.split('');
            const valArray = [];
            for (let i = 0; i < digitArray.length; i++) {
                let char = digitArray[i];
                valArray.push(status.Type + '@' + char);
            }
            return valArray.join(',');
        }
    };

    const UpdateStatusValue = (token, type, value) => {
        let alreadyExists = false;
        const statuses = GetStatuses(token);
        for(let i = 0; i < statuses.length; i++) {
            const curStatus = statuses[i];
            if (type === curStatus.Type) {
                curStatus.Value = value;
                alreadyExists = true;
                break;
            }
        }
        if (!alreadyExists) {
            statuses.push(new Status(type, value));
        }
        const statusStrings = [];
        for (let i = 0; i < statuses.length; i++) {
            const curStatus = statuses[i];
            statusStrings.push(StringifyStatus(curStatus));
        }
        const statusString = statusStrings.join(',');
        token.set('statusmarkers', statusString);
        return value;
    };

    const StatusIcons = {
        Routed: "status_chained-heart",
        Guard: "status_sentry-gun",
        Defend: "status_bolt-shield",
        Cooldown: "status_half-haze",
        Disorganized: "status_rolling-bomb",
        Recovering: "status_half-heart",
        Dead: "status_dead"
    };

    const StripStatus = (icon) => {
        const prefix = "status_";
        return icon.substr(prefix.length);
    }

    const LeftAlignDiv = {
        Open: `<div align="left" style="margin-left: 7px;margin-right: 7px">`,
        Close: '</div>'
    };

    const brTag = '<br>';

    const HTag = (str, tier, startLine = false, stopLine = false) => {
        let startTag = startLine ? brTag : '';
        let stopTag = stopLine ? brTag : '';
        return startTag + '<h' + tier + '>' + str + '</h' + tier + '>' + stopTag;
    };

    const Bold = (str, startLine = false, stopLine = false) => {
        let startTag = startLine ? brTag : '';
        let stopTag = stopLine ? brTag : '';
        return startTag + '<b>' + str + '</b>' + stopTag;
    };

    const ListItem = (str, startLine = false, stopLine = false) => {
        let startTag = startLine ? brTag : '';
        let stopTag = stopLine ? brTag : '';
        return startTag + '<li>' + str + '</li>' + stopTag;
    };

    const printBattleRating = (infExp, infCount, infTroops, cavExp, cavCount, cavTroops, arcExp, arcCount, arcTroops, magExp, magCount, magTroops, sctExp, sctCount, sctTroops, heroList) => {
        let totalExp = infExp + cavExp + arcExp + magExp + sctExp;
        totalExp = totalExp.toExponential(3);

        let armyOverview = `&{template:desc} {{desc=`
        + `<h3>Army Summary</h3>`
            + `<hr><h4>Battle Rating</h4>`
                + `<b>Total BR:</b> ${totalExp}`
            + (infCount + cavCount + arcCount + magCount + sctCount > 0 ? `<hr><h4>Force Details</h4>` : '')
                + (infCount > 0 ? `<br><b>Infantry:</b> ${infCount} formation` + (infCount > 1 ? 's' : '') + `<p style="margin-left: 20px">${infTroops} infantrymen</p>` : '')
                + (cavCount > 0 ? `<br><b>Cavalry:</b> ${cavCount} formation` + (cavCount > 1 ? 's' : '') + `<p style="margin-left: 20px">${cavTroops} cavalrymen</p>` : '')
                + (arcCount > 0 ? `<br><b>Archers:</b> ${arcCount} formation` + (arcCount > 1 ? 's' : '') + `<p style="margin-left: 20px">${arcTroops} archers</p>` : '')
                + (magCount > 0 ? `<br><b>Mages:</b> ${magCount} formation` + (magCount > 1 ? 's' : '') + `<p style="margin-left: 20px">${magTroops} mages</p>` : '')
                + (sctCount > 0 ? `<br><b>Scouts:</b> ${sctCount} formation` + (sctCount > 1 ? 's' : '') + `<p style="margin-left: 20px">${sctTroops} scouts</p>` : '')
            + (heroList.length > 0 ? `<hr><h4>Hero Details</h4>` : '');
        heroList.forEach((hero) => {
            armyOverview += `<p style="margin-left: 20px"><b>${hero.Name}</b>: ${hero.HP}/${hero.MHP}</p>`;
        });
        armyOverview += '}}';
        sendChat(mcname, armyOverview);
    };

    const sendChatToFormation = (tokenName, title, text) => {
        const msg = `/w "${tokenName}" &{template:desc} {{desc=<h3>${title}</h3><hr>${LeftAlignDiv.Open}${text}${LeftAlignDiv.Close}}}`;
        sendChat(mcname, msg);
    };

    const sendChatToSource = (inMsg, outMsg) => {
        sendChat(mcname, `/w "${inMsg.who.replace(' (GM)', '')}" ${outMsg}`);
    };

    class Operation {
        constructor(name, tokenName, tokenId, barChanges, iconChanges) {
            this.Name = name;
            this.tokenName = tokenName;
            this.TokenId = tokenId;
            this.BarChanges = barChanges;
            this.IconChanges = iconChanges;
            this.Timestamp = new Date().toUTCString();
            this.Id = state.MassCombat.OpId++;
        }
    }

    class Diff {
        constructor(type, oldVal, newVal) {
            this.Type = type;
            this.Old = oldVal;
            this.New = newVal;
        }
    }

    const AttrEnum = {
        // Token Attr Fields
        HP: 'bar1_value',
        HPM: 'bar1_max',
        FP: 'bar2_value',
        FPM: 'bar2_max',
        CP: 'bar3_value',
        CPM: 'bar3_max',
        TOKEN_NAME: 'name',

        // Character Fields
        CHAR_NAME: 'name',
        CHAR_DEFAULT_TOKEN_ASYNC: '_defaulttoken',

        // Sheet Attr Fields
        INT_MOD: 'intelligence_mod',
        NPC_HP: 'hp',
        NPC_CHAR_NAME: 'npc_name',
        NPC_XP: 'npc_xp',
        NPC_CR: 'npc_challenge',
        NPC_TYPE: 'npc_type',
        NPC_AC: 'npc_ac',
        NPC_SPEED: 'npc_speed',
        NPC_IS_CASTER: 'npcspellcastingflag',

        // Mass Combat Attr Fields
        FORMATION: 'mc_is_formation',
        MORALE: 'mc_morale',
        COMMANDER_TO_HIT: 'mc_commander_to_hit',
        PRIME_ACTION_DESC: 'mc_prime_action_descriptions',
        SOURCE: 'mc_source',
        LEGIBLE_TRAIT_ID: 'mc_legible_trait_id',
        FORMATION_TYPE: 'mc_formation_type'
    };

    const DiffDict = {};
    const InitDiffDict = () => {
        DiffDict[AttrEnum.HP] = 'Hit Points';
        DiffDict[AttrEnum.HPM] = 'Hit Point Max';
        DiffDict[AttrEnum.CP] = 'Chaos Points';
        DiffDict[AttrEnum.CPM] = 'Chaos Point Max';
        DiffDict[AttrEnum.FP] = 'Fatality Points';
        DiffDict[AttrEnum.FPM] = 'Fatality Point Max';
        DiffDict[StatusIcons.Routed] = 'Routed';
        DiffDict[StatusIcons.Guard] = 'Guarding';
        DiffDict[StatusIcons.Defend] = 'Defending';
        DiffDict[StatusIcons.Cooldown] = 'Cooling Down';
        DiffDict[StatusIcons.Disorganized] = 'Disorganization';
        DiffDict[StatusIcons.Recovering] = 'Recovering';
        DiffDict[StatusIcons.Dead] = 'Dead';
    }; InitDiffDict();

    const addOperation = (operation) => {
        // Add the new one
        state.MassCombat.OperationHistory.push(operation);

        // If limit exceeded, remove the oldest
        if (state.MassCombat.OperationHistory.length > state.MassCombat.OperationHistorySize) {
            state.MassCombat.OperationHistory.splice(0, 1);
        }
    };

    const stringifyDiff = (diff) => {
        const type = DiffDict[diff.Type];
        const oldVal = diff.Old;
        const newVal = diff.New;
        
        // Don't print things that didn't happen to change
        if (oldVal === newVal) {
            return '';
        }

        return ListItem(`${Bold(type)}: ${oldVal} to ${newVal}`);
    };

    const rgbToHex = (rgb) => { 
        var hex = Number(rgb).toString(16);
        if (hex.length < 2) {
            hex = "0" + hex;
        }
        return hex;
    };

    const getAuraColor = (hp, maxHP) => {
        let half = maxHP*0.5;
        let perc = hp/half;
        let gVal = Math.floor(perc*255);
        let gHex = rgbToHex(gVal).toLowerCase();
        return '#ff' + gHex + '00';
    };

    const setTokenAura = (formToken, oldHP, newHP, maxHP) => {
        if (oldHP === newHP) {
            return;
        }
        let color = 'transparent';
        let showAura = false;
        let isDead = false;
        let size = 0.0;
        maxHP = maxHP > -1 
            ? maxHP 
            : (formToken.get(AttrEnum.HPM) || 0);
        if (newHP < 1) {
            isDead = true;
        } else if (newHP * 2 <= maxHP) {
            color = getAuraColor(newHP, maxHP);
            size = 12.6;
            showAura = true;
        }

        let params = {
            'aura1_radius': size,
            'aura1_color': color,
            'showplayers_aura1': showAura,
            'status_dead': isDead
        };
        
        formToken.set(params);
    };

    const revertOp = (op) => {
        const formToken = getObj('graphic', op.TokenId);
        log('Got Token');
        const barReverts = [];
        const iconReverts = [];
        let oldHP = -1;
        let newHP = -1;
        let maxHP = -1;

        log('Reverting Op ' + op.Name + ' with ' + op.BarChanges.length + ' bar changes and ' + op.IconChanges.length + ' icon changes.');

        // Revert changes to the bars
        for (let i = 0; i < op.BarChanges.length; i++) {
            const diff = op.BarChanges[i];
            const live = formToken.get(diff.Type);
            if (diff.Type === AttrEnum.HP) {
                oldHP = parseInt(formToken.get(AttrEnum.HP)) || 0;
                newHP = diff.Old;
            } else if (diff.Type === AttrEnum.HPM) {
                maxHP = parseInt(formToken.get(AttrEnum.HPM)) || 0 ;
            }
            barReverts.push(new Diff(diff.Type, live, diff.Old));
            formToken.set(diff.Type, diff.Old);
        }

        // Revert changes to icons
        for (let i = 0; i < op.IconChanges.length; i++) {
            const diff = op.IconChanges[i];
            const strippedType = StripStatus(diff.Type);
            const live = GetStatusValue(formToken, strippedType);
            iconReverts.push(new Diff(diff.Type, live, diff.Old));
            UpdateStatusValue(formToken, strippedType, diff.Old);
        }

        // Record the revert as its own revertible operation
        addOperation(new Operation(`Revert ${op.Id}`, op.tokenName, op.TokenId, barReverts, iconReverts));

        // Update Auras
        if (oldHP !== -1) {
            setTokenAura(formToken, oldHP, newHP, maxHP);
        }

        // Print
        sendChatToFormation(op.tokenName, 'Reverted', 'Successfully reverted ' + op.Name);
    };

    class MoraleFactor {
        constructor(name, value) {
            this.Name = name;
            this.Value = value;
        }
    }

    class Morale {
        constructor(commanderCha, factors) {
            this.CommanderCha = commanderCha;
            this.Factors = factors;
        }
    }

    const GetMorale = (char, cr) => {
        let attr = getAttr(char, AttrEnum.MORALE);
        if (!attr) {
            const commanderCha = (cr/2).toFixed(0);
            const factors = [
                new MoraleFactor('Rest', 0),
                new MoraleFactor('Food & Drink', 0),
                new MoraleFactor('Equipment', 0),
                new MoraleFactor('Compensation', 0),
                new MoraleFactor('Personal Stake', 0),
                new MoraleFactor('Prototype Might', 0),
                new MoraleFactor('Commander Prep', 0),
                new MoraleFactor('Treatment', 0),
                new MoraleFactor('Camaraderie', 0),
                new MoraleFactor('Terrain', 0),
                new MoraleFactor('Weather', 0)
            ];
            const morale = new Morale(commanderCha, factors);
            const moraleStr = JSON.stringify(morale);
            setAttr(char.id, AttrEnum.MORALE, moraleStr);
            return morale;
        }

        const attrCurrent = attr.get('current');
        return JSON.parse(attrCurrent);
    };

    const GetMoraleRating = (factors) => {
        // Sum factors
        let morale = 0;
        for (let i = 0; i < factors.length; i++) {
            morale += factors[i].Value;
        }

        // Get string
        let desc = '';
        if (morale <= -10) {
            desc = 'Openly Rebellious';
        } else if (morale <= -8) {
            desc = 'Mutinous';
        } else if (morale <= -4) {
            desc = 'Disgruntled';
        } else if (morale <= -2) {
            desc = 'Shaky';
        } else if (morale < 2) {
            desc = 'Average';
        } else if (morale < 4) {
            desc = 'Motivated';
        } else if (morale < 8) {
            desc = 'Stalwart';
        } else if (morale < 10) {
            desc = 'Fanatical';
        } else {
            desc = 'Unbreakable';
        }

        return {
            Value: morale,
            Description: desc
        };
    };

    const PrintMorale = (name, morale) => {
        const rating = GetMoraleRating(morale.Factors);
        const desc = rating.Description;
        const value = rating.Value;

        let moraleMsg = `${HTag(name, 4)}`
            + `${Bold('Commander CHA')}: ${morale.CommanderCha} [+/-](!mc -setMorale ?{Please enter new Commander Charisma modifier} ^CommanderCha^)<br/>`
            + `${Bold('Morale Rating')}: ${value} (${desc})<br/>`;

        // Begin formulating deltas for the roll string
        let deltas = morale.CommanderCha > 0
            ? '+' + morale.CommanderCha
            : morale.CommanderCha;
        deltas += '[Commander Charisma]';

        if (morale.Expand) {
            moraleMsg += `${HTag('Morale Factors', 4)}`;
        }
        for (let i = 0; i < morale.Factors.length; i++) {
            const factor = morale.Factors[i];
            if (morale.Expand) {
                moraleMsg += `${factor.Value} |`
                    + `[-](!mc -setMorale ${factor.Value-1} ^${factor.Name}^)`
                    + `[+](!mc -setMorale ${factor.Value+1} ^${factor.Name}^)`
                    + ` ${factor.Name}<br/>`;
            }

            if (factor.Value !== 0) {
                deltas += factor.Value > 0
                    ? '+' + factor.Value
                    : factor.Value;
                deltas += `[${factor.Name}]`;
            }
        }
        if (morale.Expand) {
            moraleMsg += '[Hide](!mc -setMorale 0 ^Expand^)';
        }
        else {
            moraleMsg += '<br/>[Expand](!mc -setMorale 1 ^Expand^)';
        }
        moraleMsg += `<hr>${HTag('Leadership Check', 4)}[[d20${deltas}]]`;
        
        sendChatToFormation(name, 'Morale', moraleMsg);
        return moraleMsg;
    };

    const GenerateUUID = () => {
        var a = 0;
        var b = [];
        return function () {
            var c = (new Date()).getTime() + 0,
            d = c === a;
            a = c;
            for (var e = new Array(8), f = 7; 0 <= f; f--) {
                e[f] = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'.charAt(c % 64);
                c = Math.floor(c / 64);
            }
            c = e.join('');
            if (d) {
                for (f = 11; 0 <= f && 63 === b[f]; f--) {
                    b[f] = 0;
                }
                b[f]++;
            } else {
                for (f = 0; 12 > f; f++) {
                    b[f] = Math.floor(64 * Math.random());
                }
            }
            for (f = 0; 12 > f; f++) {
                c += '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'.charAt(b[f]);
            }
            return c;
        };
    }

    class Trait {
        constructor(id, name, desc) {
            this.ID = id;
            this.Name = name;
            this.Desc = desc;
        }
    }

    class AttackParams {
        constructor(type, range, toHit, target, damage1, element1, damage2, element2) {
            this.Type = type;
            this.Range = range;
            this.ToHit = toHit;
            this.Target = target;
            this.Damage1 = damage1;
            this.Element1 = element1;
            this.Damage2 = damage2;
            this.Element2 = element2;
        }
    }

    class Action {
        constructor(id, name, isAttack, attackParams, showDesc, desc, rollbase) {
            this.ID = id;
            this.Name = name;
            this.IsAttack = isAttack;
            this.AttackParams = attackParams;
            this.ShowDesc = showDesc;
            this.Desc = desc;
            this.Rollbase = rollbase;
        }
    }
    
    // Object containing the tools to parse OGL Sheet NPC Traits
    const OGLTrait = {
        // Prefix
        RepeatingPrefix: 'repeating_npctrait_',
        Name: '_name',
        Description: '_desc',

        // Retrieves only the name attributes for a given char id (should be faster)
        GetTraitNameAttrs: (characterId) => {
            const suffix = OGLTrait.Name;
            const objs = findObjs({
                type: "attribute",
                characterid: characterId
            });

            let nameAttrs = [];
            for(let i = 0; i < objs.length; i++) {
                const attr = objs[i];
                const attrName = attr.get("name");

                if (attrName.endsWith(suffix) && attrName.startsWith(OGLTrait.RepeatingPrefix)) {
                    nameAttrs.push(attr);
                }
            }
            return nameAttrs;
        },

        // Gets a dictionary of traits by lowercased name to object ids
        GetTraitIds: (characterId) => {
            const re = new RegExp(`${OGLTrait.RepeatingPrefix}([^_]+)${OGLTrait.Name}$`);
            const traitNameAttrs = OGLTrait.GetTraitNameAttrs(characterId);

            return _.reduce(traitNameAttrs, (lookup, attr) => {
                const match = attr.get("name").match(re);
                match && (lookup[attr.get("current").toLowerCase()] = match[1]);
                return lookup;
            }, {});
        },

        // Gets a trait attribute with the provided traitId and suffix
        GetTraitAttr: (char, traitId, suffix) => {
            return getAttr(char, OGLTrait.RepeatingPrefix + traitId + suffix);
        },

        // Gets a trait attribute's current with the provided traitId and suffix
        GetTraitAttrCur: (char, traitId, suffix) => {
            return getAttrCurrent(char, OGLTrait.RepeatingPrefix + traitId + suffix);
        },

        // Loads all the details into a trait object.  If a checkbox is undefined, assume default value.
        GetTraitDetails: (char, traitId) => {
            const name = OGLTrait.GetTraitAttrCur(char, traitId, OGLTrait.Name);
            const desc = OGLTrait.GetTraitAttrCur(char, traitId, OGLTrait.Description);
            const trait = new Trait(traitId, name, desc);
            return trait;
        },

        // Creates and sets the value of a new Trait
        CreateOGLTrait: (charId, name, description) => {
            const traitId = GenerateUUID()();
            dlog('New Trait UUID: ' + traitId);
            dlog('BEFORE CREATION ====================================================');
            OGLTrait.DumpTraits(charId);

            // Actually create the attribute.  Set creates if it does not exist.
            setAttr(charId, OGLTrait.RepeatingPrefix + traitId + OGLTrait.Name, name);
            setAttr(charId, OGLTrait.RepeatingPrefix + traitId + OGLTrait.Description, description);
            
            dlog('AFTER CREATION =====================================================');
            OGLTrait.DumpTraits(charId);
            return traitId;
        },
        
        // Dumps the list of all OGL Traits owned by the character ID provided
        DumpTraits: (characterId) => {
            const objs = findObjs({
                type: "attribute",
                characterid: characterId
            });

            for(let i = 0; i < objs.length; i++) {
                const attr = objs[i];
                if (attr.get("name").startsWith(OGLTrait.RepeatingPrefix)) {
                    log('OGL TRAIT: ' + JSON.stringify(attr));
                }
            }
        },
    };
    
    // Object containing the tools to parse OGL Sheet NPC Actions
    const OGLAction = {
        // Prefix
        RepeatingPrefix: 'repeating_npcaction_',

        // Suffixes
        Name: '_name',
        IsAttack: '_attack_flag',
        AttackType: '_attack_type',
        AttackRange: '_attack_range',
        AttackToHit: '_attack_tohit',
        AttackTarget: '_attack_target',
        AttackDamage1: '_attack_damage',
        AttackElement1: '_attack_damagetype',
        AttackCrit1: '_attack_crit',// Hidden
        AttackDamage2: '_attack_damage2',
        AttackElement2: '_attack_damagetype2',
        AttackCrit2: '_attack_crit2',// Hidden

        ShowDescription: '_show_desc',
        Description: '_description',

        OptionsFlag: '_npc_options-flag',// This is just whether or not it's expanded
        Rollbase: '_rollbase',// This is the actual roll calculation

        // Retrieves only the name attributes for a given char id (should be faster)
        GetActionNameAttrs: (characterId) => {
            const suffix = OGLAction.Name;
            const objs = findObjs({
                type: "attribute",
                characterid: characterId
            });

            let nameAttrs = [];
            for(let i = 0; i < objs.length; i++) {
                const attr = objs[i];
                const attrName = attr.get("name");
                if (attrName.endsWith(suffix) && attrName.startsWith(OGLAction.RepeatingPrefix)) {
                    nameAttrs.push(attr);
                }
            }
            return nameAttrs;
        },

        // Gets a dictionary of actions by lowercased name to object ids
        GetActionIds: (characterId) => {
            const re = new RegExp(`${OGLAction.RepeatingPrefix}([^_]+)${OGLAction.Name}$`);
            const actionNameAttrs = OGLAction.GetActionNameAttrs(characterId);

            return _.reduce(actionNameAttrs, (lookup, attr) => {
                const match = attr.get("name").match(re);
                match && (lookup[attr.get("current").toLowerCase()] = match[1]);
                return lookup;
            }, {});
        },

        // Gets an action attribute with the provided actionId and suffix
        GetActionAttr: (char, actionId, suffix) => {
            return getAttrCurrent(char, OGLAction.RepeatingPrefix + actionId + suffix);
        },

        // Loads all the details into a action object.  If a checkbox is undefined, assume default value.
        GetActionDetails: (char, actionId) => {
            const name = OGLAction.GetActionAttr(char, actionId, OGLAction.Name);
            const isAttack = OGLAction.GetActionAttr(char, actionId, OGLAction.IsAttack) === 'on';
            const desc = OGLAction.GetActionAttr(char, actionId, OGLAction.Description) || '';
            let attackParams = null;
            if (isAttack) {
                const type = OGLAction.GetActionAttr(char, actionId, OGLAction.AttackType) === "Ranged"
                    ? "Ranged"
                    : "Melee";
                const range = OGLAction.GetActionAttr(char, actionId, OGLAction.AttackRange) || '5 ft.';
                const toHit = parseInt(OGLAction.GetActionAttr(char, actionId, OGLAction.AttackToHit)) || 0;
                const target = OGLAction.GetActionAttr(char, actionId, OGLAction.AttackTarget) || "one target";
                const damage1 = OGLAction.GetActionAttr(char, actionId, OGLAction.AttackDamage1) || '0';
                const element1 = OGLAction.GetActionAttr(char, actionId, OGLAction.AttackElement1) || 'unspecified';
                const damage2 = OGLAction.GetActionAttr(char, actionId, OGLAction.AttackDamage2) || '0';
                const element2 = OGLAction.GetActionAttr(char, actionId, OGLAction.AttackElement2) || 'unspecified';
                attackParams = new AttackParams(type, range, toHit, target, damage1, element1, damage2, element2);
            }
            const showDesc = !isAttack || (OGLAction.GetActionAttr(char, actionId, OGLAction.ShowDescription) !== ' ' && desc.length > 0);
            const rollbase = OGLAction.GetActionAttr(char, actionId, OGLAction.Rollbase);

            const action = new Action(actionId, name, isAttack, attackParams, showDesc, desc, rollbase);
            return action;
        }
    };

    // Attempts to format the string in a way that is solvable.
    const MakeSolvable = (eq) => {
        tlog('Original Equation: ' + eq);

        // Remove whitespace
        eq = eq.replace(/\s/gmi, '');
        tlog('Readable => Minified Equation: ' + eq);

        // Change internal double brackets to parentheses to ensure order of operations
        eq = eq.replace(/(\[\[)(.*?)(\]\])/gmi, (match, p1, p2, p3, offset, string) => {
            return `(${multiplier * AttemptSolution(p2)})`;
        });
        tlog('[[]] => () Equation: ' + eq);

        // Convert dice into parenthetical 1/2 so that even standalone or with one partner it doesn't break things.
        eq = eq.replace(/(\d*)d(\d+)/gmi, (match, p1, p2, offset, string) => {
            return p1 * p2 / 2;
        });
        tlog('d => Avg Equation: ' + eq);

        // Remove any explanatory bracketed information.
        eq = eq.replace(/(\[)(.*?)(\])/gmi, '');
        tlog('[Comment] => \'\' Equation: ' + eq);

        tlog('Final Equation: ' + eq);
        return eq;
    };

    // Attempts to solve the roll equation for a given action.
    const AttemptSolution = (rollEquation) => {
        try {
            if (!rollEquation || rollEquation === '') {
                return 0;
            }
            if (rollEquation.includes('{') || rollEquation.includes('}')) {
                throw new Error('Attempted to reference property value.  Value references are not supported at this time.');
            }
            const solvableEq = MakeSolvable(rollEquation);
            return eval(solvableEq);
        } catch (e) {
            throw e;
        }
    };

    // Scales an action up or down and updates the commander attack mod
    const ScaleAction = (charId, action, multiplier, commanderAttackModDelta, primeActionDescs, protoCount) => {
        // Attempt to solve all fields first
        try {
            if (action.IsAttack) {
                tlog('Before: D1=' + action.AttackParams.Damage1 + ' D2=' + action.AttackParams.Damage2);
                action.AttackParams.Damage1 = Math.round(multiplier * AttemptSolution(action.AttackParams.Damage1));// Round just so that we don't run into bit representation issues
                action.AttackParams.Damage2 = Math.round(multiplier * AttemptSolution(action.AttackParams.Damage2));
                tlog('After: D1=' + action.AttackParams.Damage1 + ' D2=' + action.AttackParams.Damage2);
                tlog('Existing To-Hit=' + action.AttackParams.ToHit + ' Commander To-Hit=' + commanderAttackModDelta);
                action.AttackParams.ToHit = commanderAttackModDelta + action.AttackParams.ToHit;
                tlog('New To-Hit=' + action.AttackParams.ToHit);
            }
            if (action.Desc.length > 0) {
                // Archive the original so that if the formation gets resized later, the editable location data isn't lost.
                if (!primeActionDescs[action.ID]) {
                    primeActionDescs[action.ID] = action.Desc;
                }
                action.Desc = primeActionDescs[action.ID].replace(/(\[\[)(.*?)(\]\])/gmi, (match, p1, p2, p3, offset, string) => {
                    return (protoCount * AttemptSolution(p2)) + '';
                });
            }
        } catch (e) {
            sendChat(mcname, '/w gm WARNING: Unable to automatically scale action ' + action.Name + ' due to complexities in its math.  Please perform this manually.  The scalar is ' + multiplier + '.');
            sendChat(mcname, '/w gm The precise reason given is: ' + e.message);
            log('ERROR: Unable to compute ' + action);
            log('REASON: ' + e.message);
            log('Stack: ' + e.stack);
            return false;
        }
        
        // Save changes.
        if (action.IsAttack) {
            setAttr(charId, OGLAction.RepeatingPrefix + action.ID + OGLAction.AttackDamage1, action.AttackParams.Damage1);
            setAttr(charId, OGLAction.RepeatingPrefix + action.ID + OGLAction.AttackDamage2, action.AttackParams.Damage2);
            setAttr(charId, OGLAction.RepeatingPrefix + action.ID + OGLAction.AttackToHit, action.AttackParams.ToHit);
        }
        setAttr(charId, OGLAction.RepeatingPrefix + action.ID + OGLAction.Description, action.Desc);
        return true;
    };

    const GetLegibleTrait = (formationType, troopName, protoCount, recruitSource) => {
        return `${formationType} Formation of ${protoCount} ${recruitSource} ${troopName}`;
    };

    // Renames the formation.
    const RenameFormation = (token, char, charId, oldProtoCount, newProtoCount, oldName, overrideTroop = false) => {
        let oldProtoTag = ' x' + oldProtoCount;
        let troopName = oldName.substring(0, oldName.lastIndexOf(oldProtoTag));
        let newName = (overrideTroop ? overrideTroop : troopName) + ' x' + newProtoCount;
        dlog('New Name: ' + newName);
        char.set(AttrEnum.CHAR_NAME, newName);
        token.set(AttrEnum.TOKEN_NAME, newName);
        setAttr(charId, AttrEnum.NPC_CHAR_NAME, newName);

        // Update legible trait
        const source = getAttrCurrent(char, AttrEnum.SOURCE);
        const legibleID = getAttrCurrent(char, AttrEnum.LEGIBLE_TRAIT_ID);
        const formationType = getAttrCurrent(char, AttrEnum.FORMATION_TYPE);
        dlog('Source: ' + source);
        dlog('Legible ID: ' + legibleID);
        // In event it's freshly-created attr, don't redo this part
        if (source && legibleID) {
            troopName = overrideTroop ? overrideTroop : troopName;
            const legibleTraitName = GetLegibleTrait(formationType, troopName, newProtoCount, source);
            dlog('Legible Trait Name: ' + legibleTraitName);
            const legibleTraitAddress = OGLTrait.RepeatingPrefix + legibleID + OGLTrait.Name;
            dlog('Legible Trait Address: ' + legibleTraitAddress);
            dlog('Before ===================================');
            OGLTrait.DumpTraits(charId);
            setAttr(charId, legibleTraitAddress, legibleTraitName);
            dlog('After ====================================');
            OGLTrait.DumpTraits(charId);

            // Warn user of bug
            const url = `https://app.roll20.net/forum/post/7553584/ogl-sheet-not-updating-when-creating-trait-from-api/?pageforid=7555924#post-7555924`;
            const msg = `/w gm Due to a bug with Roll20's API ([click here for details](${url})), you may experience odd behavior where the formation trait is not set VISIBLY on the character sheet.`
                + `  I assure you it is still set under the hood, and should still work for the script.  However, in the event you would like to see it, you may manually set it.  `
                + `The value it should be is: ${Bold(legibleTraitName)}`;
            sendChat(mcname, msg);
        }
    };

    // Resizes a formation
    const ResizeFormation = (token, tokenName, char, charId, healthScale, damageScale, commanderAttackModDelta, newProtoCount) => {
        // Attempt to load the prototype count.  If it's not possible, that means this is a brand-new formation.
        // In such a case, average health and damage scales so that this works, even with infantry.
        let oldProtoCount = parseInt(getAttrCurrent(char, AttrEnum.FORMATION)) || 1;

        // Load current hp.  Cap current at max in case we had temps or something.
        const oldCurHP = parseInt(token.get(AttrEnum.HP)) || 0;
        let hpm = parseInt(token.get(AttrEnum.HPM)) || 0;

        // Scale hp and damage so that it matches up with an integer number of prototypes
        if (healthScale < 1 || damageScale < 1) {
            // Establish the max hp of each soldier
            const protoHealth = hpm/oldProtoCount;
            
            // Find the new maximum hp
            const newMaxHP = protoHealth * newProtoCount;

            // Recalculate the scale factors to result in integers for future math.
            healthScale = newMaxHP / hpm;

            // We can use the same fraction here because there is no such thing as down-scaling a formation and simultaneously converting it to infantry lol.
            damageScale = newMaxHP / hpm;
        }
        hpm = Math.round(hpm*healthScale);
        setAttr(charId, AttrEnum.NPC_HP, hpm, hpm);

        // Rename
        RenameFormation(token, char, charId, oldProtoCount, newProtoCount, tokenName);

        // Load and Rescale Actions
        const oldPrimeDescs = getAttrCurrent(char, AttrEnum.PRIME_ACTION_DESC);
        const primeActionDescs = oldPrimeDescs 
            ? JSON.parse(oldPrimeDescs) 
            : {};
        const actionIds = OGLAction.GetActionIds(charId);
        for (let key in actionIds) {
            const actionId = actionIds[key];
            const action = OGLAction.GetActionDetails(char, actionId);
            ScaleAction(charId, action, damageScale, commanderAttackModDelta, primeActionDescs, newProtoCount);
        }
        setAttr(charId, AttrEnum.PRIME_ACTION_DESC, JSON.stringify(primeActionDescs));// Resave in case the user altered the list when we weren't looking

        // Update current token
        token.set(AttrEnum.HP, hpm);
        token.set(AttrEnum.HPM, hpm);
        token.set(AttrEnum.FP, 0);
        token.set(AttrEnum.FPM, hpm);
        token.set(AttrEnum.CP, 0);
        token.set(AttrEnum.CPM, hpm);

        // Update default token
        setDefaultTokenForCharacter(char, token);

        // Update prototype count
        setAttr(charId, AttrEnum.FORMATION, newProtoCount);

        // Update any aura if there is one
        setTokenAura(token, oldCurHP, hpm, hpm);

        // Provide status update
        sendChat(mcname, `/w gm Resize of ${tokenName} complete.`);
    };

    // Converts a prototype hero NPC into an NPC formation
    const BuildFormation = (token, char, charId, oldName, protoCount, recruitSource, formationType) => {
        try {    
            // Adjust stats
            const speed = parseInt(getAttrCurrent(char, AttrEnum.NPC_SPEED)) || 0;
            setAttr(charId, AttrEnum.NPC_SPEED, 10 * speed);
            const commanderAttackModDelta = parseInt(getAttrCurrent(char, AttrEnum.INT_MOD)) || 0;
            setAttr(charId, AttrEnum.COMMANDER_TO_HIT, commanderAttackModDelta);
    
            // Add formation trait
            const formTraitName = GetLegibleTrait(formationType, oldName, protoCount, recruitSource);
            const formTraitDesc = '';
            setAttr(charId, AttrEnum.SOURCE, recruitSource);
            const traitID = OGLTrait.CreateOGLTrait(charId, formTraitName, formTraitDesc);
            setAttr(charId, AttrEnum.LEGIBLE_TRAIT_ID, traitID);
            setAttr(charId, AttrEnum.FORMATION_TYPE, formationType);
    
            // Scale prototype up to formation scale
            let hpMult = protoCount;
            let damageMult = protoCount;
            if (formationType === 'Infantry') {
                hpMult *= 2;
                damageMult /= 2;
            }
            ResizeFormation(token, oldName, char, charId, hpMult, damageMult, commanderAttackModDelta, protoCount);
    
            // Update Cache
            cache[charId] = {
                char: char,
                isNPC: true,
                isHero: false,
                npcType: getAttr(char, AttrEnum.NPC_TYPE).get('current'),
                cr: parseInt(getAttr(char, AttrEnum.NPC_CR).get('current')),
                xp: parseInt(getAttr(char, AttrEnum.NPC_XP).get('current')),
                ac: parseInt(getAttr(char, AttrEnum.NPC_AC).get('current')),
                speed: parseInt(getAttr(char, AttrEnum.NPC_SPEED).get('current')),
                formDetails: formTraitName
            };
    
            // Inform User
            sendChat(mcname, `/w gm Formation construction complete.`);
        } catch (e) {
            log('ERROR: ' + e.message);
            log('STACK: ' + e.stack);
            sendChat(mcname, 'ERROR OCCURRED IN FORMATION CONSTRUCTION!  Please review console log.');
        }
    };

    on('chat:message', (msg) => {
        if (msg.type !== 'api') return;
        if (msg.content.startsWith('!mc') !== true) return;
        
        let tokens = msg.content.split(' ');
        if (tokens.length < 2) return;
        let key = tokens[1];
        
        // BR sums
        let infExp = 0;
        let infCount = 0;
        let infTroops = 0;
        let cavExp = 0;
        let cavCount = 0;
        let cavTroops = 0;
        let arcExp = 0;
        let arcCount = 0;
        let arcTroops = 0;
        let magExp = 0;
        let magCount = 0;
        let magTroops = 0;
        let sctExp = 0;
        let sctCount = 0;
        let sctTroops = 0;

        // Upkeep sums
        let purchaseCost = 0;
        let upkeepCost = 0;

        // List of hero names
        let heroList = [];

        // Perform operations without needed selection
        if (key === '-overview' || key === '-o' || key === '-help') {
            let menuString = `&{template:desc} {{desc=`
            + LeftAlignDiv.Open
            + HTag('Battle', 3)
                + HTag('Damage', 4)
                    + `[Direct](!mc -damage ?{Damage Type|Battle|Chaos|Fatality} ?{Amount})`
                    + `[Scaled](!mc -scaledDamage ?{Damage Type|Battle|Chaos|Fatality} ?{Amount} ?{Scale})`
                + HTag('Disorganize', 4)
                    + `[Set](!mc -disorganize ?{Please type the new disorganization scale.  Type 'false' to remove existing disorganization})`
                    + `[Pop](!mc -popDisorganize ?{Are you sure you wish to pop disorganization|yes|no})`
                + HTag('Recovery', 4)
                    + `[Start](!mc -startRecover)`
                    + `[Finish](!mc -recover)`
                + HTag('Restore', 4)
                    + `[Heal](!mc -heal ?{Points of healing})`
                    + `[Long Rest](!mc -longrest ?{Sure you want to long rest|yes|no})`
                + HTag('Stance', 4)
                    + `[Guard](!mc -guard)`
                    + `[Defend](!mc -defend)`
                    + `[Cooldown](!mc -cooldown)`
                + HTag('Route', 4)
                    + `[Set](!mc -route ?{Route Degree|Not Routed,-1|0 Failures,0|1 Failure,1|2 Failures,2|3 Failures,3})`
                    + `[Tick](!mc -routeDamage)`
            + HTag('Stats', 3)
                + `[AC](!mc -ac)`
                + `[Speed](!mc -speed)`
                + `[Morale](!mc -morale)`
            + HTag('Initiative', 3)
                + `[Save](!mc -saveInitiative ?{Are you sure you wish to SAVE initiative|yes|no})`
                + `[Load](!mc -loadInitiative ?{Are you sure you wish to LOAD initiative|yes|no})`
            + HTag('Other', 3)
                + `[Upkeep](!mc -upkeep)`
                + `[BR](!mc -battleRating)`
                + `[History](!mc -history)`
            + HTag('Admin', 3)
                + `[Set Intellect](!mc -setInt ?{Please type the new intelligence modifier of the commander})`
                + `[Rename](!mc -rename ^?{Please type the new formation name}^)`
                + `[Resize Formation](!mc -resize ?{Please type the new number of units in this formation})`
                + `[Make Formation](!mc -makeFormation ?{Input the number of prototypes in this formation} ?{What is the source of this formation|Levied|Manufactured|Mercenary} ?{What formation type is this|Infantry|Cavalry|Archers|Scouts|Mages})`
            + LeftAlignDiv.Close
            + `}}`;
            sendChatToSource(msg, menuString);
            return;
        } else if (key === '-saveInitiative') {
            if (tokens.length < 3) return;
            if (tokens[2] !== 'yes') return;
            let turnorder = [];
            let existingOrder = Campaign().get('turnorder');
            if (existingOrder != '') {
                turnorder = JSON.parse(existingOrder);
            } else {
                sendChat(mcname, 'ERROR: There is no initiative order to save.');
                return;
            }
            state.MassCombat.SavedInitiative = turnorder;
            let saveMessage = `&{template:desc} {{desc=Turn Order Saved.}}`;
            sendChat(mcname, saveMessage);
            return;
        } else if (key === '-loadInitiative') {
            if (tokens.length < 3) return;
            if (tokens[2] !== 'yes') return;
            Campaign().set('turnorder', JSON.stringify(state.MassCombat.SavedInitiative));
            state.MassCombat.SavedInitiative = [];
            let saveMessage = `&{template:desc} {{desc=Turn Order Loaded.}}`;
            sendChat(mcname, saveMessage);
            return;
        } else if (key === '-history') {
            let text = '';
            for (let i = 0; i < state.MassCombat.OperationHistory.length; i++) {
                const op = state.MassCombat.OperationHistory[i];
                let opStr = HTag(`[${op.Id}] ${op.Name}`, 4);
                opStr += Bold('Target') + ': ' + op.tokenName + brTag;
                opStr += Bold('Time') + ': ' + op.Timestamp + brTag;
                opStr += '<ul>';
                let preLeng = opStr.length;
                for (let j = 0; j < op.BarChanges.length; j++) {
                    opStr += stringifyDiff(op.BarChanges[j]);
                }
                for (let j = 0; j < op.IconChanges.length; j++) {
                    let changes = op.IconChanges[j];
                    let iconChangeString = stringifyDiff(changes);
                    opStr += iconChangeString;
                }
                let postLeng = opStr.length;
                opStr += '</ul>';
                opStr += `[Revert](!mc -revert ${op.Id})`;

                // Don't paste an empty op that did nothing
                if (postLeng > preLeng) {
                    text += opStr;
                }
            }
            const historyStr = `&{template:desc} {{desc=<h3>History</h3><hr>${LeftAlignDiv.Open}${text}${LeftAlignDiv.Close}}}`;
            sendChatToSource(msg, historyStr);
            return;
        } else if (key === '-clearHistory') {
            if (tokens.length < 3) return;
            if (tokens[2] !== 'yes') return;
            state.MassCombat.OperationHistory = [];
            sendChat(mcname, 'Cleared Op History');
            return;
        } else if (key === '-revert') {
            if (tokens.length < 3) return;
            const id = parseInt(tokens[2]);
            if(isNaN(id)) return;
            for (let i = 0; i < state.MassCombat.OperationHistory.length; i++) {
                const op = state.MassCombat.OperationHistory[i];
                if (op.Id === id) {
                    revertOp(op);
                    return;
                }
            }
        }

        // Iterate through selected tokens
        if (!msg.selected) return;
        let processed = 0;

        // Wait Duration Warning Messages
        let wait = 0;
        if (msg.selected.length > 0) {
            if (key === '-battleRating'){
                sendChat(mcname, 'Calculating Battle Rating.  This may take a few moments...');
                wait = 100;
            } else if (key === '-upkeep'){
                sendChat(mcname, 'Calculating Upkeep.  This may take a few moments...');
                wait = 100;
            }
        } else {
            sendChatToSource(msg, 'You must select a token for the command you selected.');
        }
        setTimeout(() => {
            msg.selected.forEach((selection) => {
                _.defer(() => {
                    processed++;
                    
                    // Load token data.  Unfortunately, we can't use the cache for this because you could have mook tokens with different hp bars
                    let formToken = getObj('graphic', selection._id);
                    let tokenOwner = formToken.get('represents');
                    let tokenName = formToken.get('name');
                    let hp = parseInt(formToken.get(AttrEnum.HP)) || 0;
                    let hpm = parseInt(formToken.get(AttrEnum.HPM)) || 0 ;
                    let fp = parseInt(formToken.get(AttrEnum.FP)) || 0;
                    let cp = parseInt(formToken.get(AttrEnum.CP)) || 0 ;
                    dlog(`Operation ${key} on ${tokenName} with ${hp}/${fp}/${cp}/${hpm}`);
    
                    // Load charsheet data.  Use a cache for this
                    let cacheEntry = cache[tokenOwner];
                    if (!cacheEntry) {
                        buildNewEntry = true;
                        let char = getCharByAny(tokenOwner);

                        // Discount accidental selections of unowned tokens or graphics
                        if (!char) {
                            return;
                        }

                        // Filter NPCs vs PCs
                        const npcAttr = getAttr(char, 'npc');
                        let isNPC = false;
                        if (npcAttr && (isNPC = npcAttr.get('current'))) {
                            let traits = getAttrsFromSub(char, 'npctrait');

                            // Discount non-formation NPCs
                            if (!traits) {
                                cacheEntry = {
                                    char: char,
                                    isNPC: isNPC,
                                    isHero: true,
                                    npcType: getAttr(char, AttrEnum.NPC_TYPE).get('current'),
                                    cr: parseInt(getAttr(char, AttrEnum.NPC_CR).get('current')),
                                    xp: parseInt(getAttr(char, AttrEnum.NPC_XP).get('current')),
                                };
                                cache[tokenOwner] = cacheEntry;
                            } else {
                                // Get formation values
                                let formationTraitArray = traits.filter(trait => trait.get('current').includes('Formation of'));
                                if(formationTraitArray.length === 0) {
                                    cacheEntry = {
                                        char: char,
                                        isNPC: isNPC,
                                        isHero: true,
                                        npcType: getAttr(char, AttrEnum.NPC_TYPE).get('current'),
                                        cr: parseInt(getAttr(char, AttrEnum.NPC_CR).get('current')),
                                        xp: parseInt(getAttr(char, AttrEnum.NPC_XP).get('current')),
                                    };
                                } else {
                                    let formDetails = formationTraitArray[0].get('current');
                                    cacheEntry = {
                                        char: char,
                                        isNPC: isNPC,
                                        isHero: false,
                                        npcType: getAttr(char, AttrEnum.NPC_TYPE).get('current'),
                                        cr: parseInt(getAttr(char, AttrEnum.NPC_CR).get('current')),
                                        xp: parseInt(getAttr(char, AttrEnum.NPC_XP).get('current')),
                                        ac: parseInt(getAttr(char, AttrEnum.NPC_AC).get('current')),
                                        speed: parseInt(getAttr(char, AttrEnum.NPC_SPEED).get('current')),
                                        formDetails: formDetails
                                    };
                                }
                            }

                        } else {
                            cacheEntry = {
                                char: char,
                                isNPC: isNPC,
                                isHero: true
                            };
                        }
                        cache[tokenOwner] = cacheEntry;
                    }

                    let npcType = cacheEntry.npcType;
                    let cr = cacheEntry.cr;
                    let xp = cacheEntry.xp;

                    // Anything that isn't a formation is a hero.
                    if (cacheEntry.isHero) {
                        heroList.push(new Hero(tokenName, hp, hpm));
                        if (cacheEntry.isNPC) {
                            if (key === '-makeFormation') {
                                if (tokens.length < 5) return;
                                const protoCount = parseInt(tokens[2]) || 0;
                                if (protoCount === 0) return;
                                const recruitSource = tokens[3];
                                const formationType = tokens[4];

                                let char = getCharByAny(tokenOwner);

                                // Reformats the name as "[NAME] x[COUNT]" and strips off any "Copy of " strings.
                                let charName = char.get(AttrEnum.CHAR_NAME);
                                const oldName = charName.replace(/Copy of /g, "");

                                sendChat(mcname, `/w gm Building new formation: ${formationType} ${oldName} x${protoCount}.  This may take a few seconds...`);
                                setTimeout(BuildFormation, 100, formToken, char, char.id, oldName + ' x1', protoCount, recruitSource, formationType);
                            }
                        } else {
                            dlog(`Selected ${tokenName} is not an NPC`);
                            if (processed === msg.selected.length) {
                                if (key === '-battleRating') {
                                    printBattleRating(infExp, infCount, infTroops, cavExp, cavCount, cavTroops, arcExp, arcCount, arcTroops, magExp, magCount, magTroops, sctExp, sctCount, sctTroops, heroList);
                                } else if (key === '-upkeep') {
                                    sendChat(mcname, `&{template:desc} {{desc=<h3>Army Cost</h3><hr>Procurement Cost: <b>${purchaseCost}</b><br>Upkeep: <b>${upkeepCost}gp</b><hr>(plus mounts and gear for troops if relevant)}}`);
                                }
                            }
                        }
                        return;
                    }

                    // Determine formation count
                    let formDetails = cacheEntry.formDetails;
                    let formTokens = formDetails.split(' ');
                    let formType = formTokens[0];
                    let protoCount = parseInt(formTokens[3]);
                    let recruitSource = formTokens[4];
                    let sourceCreature = formTokens[4];
                    if (formTokens.length > 5) {
                        let sourceCreatureIndex = formDetails.indexOf(formTokens[5]);
                        sourceCreature = formDetails.substr(sourceCreatureIndex);
                    }
    
                    dlog(`${npcType} NPC of ${protoCount} CR ${cr} ${sourceCreature} recruited via ${recruitSource}`);
    
                    if (key === '-damage' || key === '-scaledDamage') {
                        if (tokens.length < 4) return;
                        let type = tokens[2];
                        let amount = parseInt(tokens[3]);
                        if (key === '-scaledDamage') {
                            if (tokens.length < 5) return;
                            let damageScale = parseInt(tokens[4]);
                            amount *= damageScale;
                        }
                        let chaosBurn = hp-amount < 0 
                            ? hp-amount 
                            : 0;
                        let fatalZone = hp-amount >= 0
                            ? amount
                            : amount - hp;
                        dlog(`Received ${amount} ${type} damage.  ChaosBurn: ${chaosBurn}, FatalZone: ${fatalZone}`);
                        let remHP = Math.max(0, hp-amount);
                        let iconChanges = [];
                        if (remHP < 1) {
                            iconChanges.push(new Diff(StatusIcons.Dead, hp < 1, true));
                        }
                        setTokenAura(formToken, hp, remHP, hpm);
                        if (type === 'Battle') {
                            const newFP = fp + 0.25 * fatalZone + chaosBurn;
                            const newCP = Math.max(0, cp + amount / 2 + chaosBurn);
                            formToken.set(AttrEnum.HP, remHP);
                            formToken.set(AttrEnum.CP, newCP);
                            formToken.set(AttrEnum.FP, newFP);
                            const operation = new Operation('Battle Damage', tokenName, selection._id,
                            [
                                new Diff(AttrEnum.HP, hp, remHP),
                                new Diff(AttrEnum.CP, cp, newCP),
                                new Diff(AttrEnum.FP, fp, newFP)
                            ], iconChanges);
                            addOperation(operation);
                        } else if (type === 'Chaos') {
                            const newCP = Math.max(0, cp + amount + chaosBurn);
                            formToken.set(AttrEnum.HP, remHP);
                            formToken.set(AttrEnum.CP, newCP);
                            const operation = new Operation('Chaos Damage', tokenName, selection._id,
                            [
                                new Diff(AttrEnum.HP, hp, remHP),
                                new Diff(AttrEnum.CP, cp, newCP)
                            ], iconChanges);
                            addOperation(operation);
                        } else if (type === 'Fatality') {
                            const newFP = fp + fatalZone + chaosBurn;
                            const newCP = Math.max(0, cp + chaosBurn);
                            formToken.set(AttrEnum.HP, remHP);
                            formToken.set(AttrEnum.FP, newFP);
                            formToken.set(AttrEnum.CP, newCP);
                            const operation = new Operation('Fatality Damage', tokenName, selection._id,
                            [
                                new Diff(AttrEnum.HP, hp, remHP),
                                new Diff(AttrEnum.CP, cp, newCP),
                                new Diff(AttrEnum.FP, fp, newFP)
                            ], iconChanges);
                            addOperation(operation);
                        } else {
                            sendChat(mcname, 'Invalid Damage Type.');
                            return;
                        }
                        sendChatToFormation(tokenName, 'Damage Received', `<b>Victim:</b> ${formDetails}<br><b>Damage:</b> ${amount} ${type}`);
                    } else if (key === '-routeDamage') {
                        let remHP = Math.max(0, hp-hpm*.1);
                        let iconChanges = [];
                        if (remHP < 1) {
                            iconChanges.push(new Diff(StatusIcons.Dead, hp < 1, true));
                        }
                        setTokenAura(formToken, hp, remHP, hpm);
                        const newCP = cp + hpm*.1;
                        formToken.set(AttrEnum.HP, remHP);
                        formToken.set(AttrEnum.CP, newCP);
                        const operation = new Operation('Route Tick', tokenName, selection._id,
                        [
                            new Diff(AttrEnum.HP, hp, remHP),
                            new Diff(AttrEnum.CP, cp, newCP)
                        ], iconChanges);
                        addOperation(operation);
                        sendChatToFormation(tokenName, 'Routed Tick', `<b>Victim:</b> ${formDetails}<br><b>Damage:</b> ${hpm*.1}`);
                    } else if (key === '-startRecover') {
                        formToken.set(StatusIcons.Recovering, true);
                        addOperation(new Operation('Start Recover', tokenName, selection._id, [], [new Diff(StatusIcons.Recovering, false, true)]));
                    } else if (key === '-recover') {
                        formToken.set(StatusIcons.Recovering, false);
                        const newHP = Math.min(hpm, hp+cp);
                        formToken.set(AttrEnum.HP, newHP);
                        formToken.set(AttrEnum.CP, 0);
                        const operation = new Operation('Finish Recovery', tokenName, selection._id,
                            [ new Diff(AttrEnum.HP, hp, newHP), new Diff(AttrEnum.CP, cp, 0) ], 
                            [ new Diff(StatusIcons.Recovering, true, false) ]);
                        addOperation(operation);
                        setTokenAura(formToken, hp, newHP, hpm);
                        sendChatToFormation(tokenName, 'Recovery', `<b>Benefactor:</b> ${formDetails}<br><b>Regerated:</b> ${cp}`);
                    } else if (key === '-disorganize') {
                        if (tokens.length < 3) return;
                        let type = StripStatus(StatusIcons.Disorganized);
                        const oldVal = GetStatusValue(formToken, type);
                        let disorganizeScale = parseInt(tokens[2]);
                        formToken.set(StatusIcons.Disorganized, "" + disorganizeScale);
                        UpdateStatusValue(formToken, type, disorganizeScale);
                        addOperation(new Operation('Disorganize', tokenName, selection._id, [], [new Diff(StatusIcons.Disorganized, oldVal, disorganizeScale)]));
                    } else if (key === '-popDisorganize') {
                        if (tokens.length < 3) return;
                        if (tokens[2] !== 'yes') return;
                        let type = StripStatus(StatusIcons.Disorganized);
                        const popScale = GetStatusValue(formToken, type);
                        dlog('Disorganization Scale of Token: ' + popScale);
                        if (popScale !== true) {
                            let amount = hpm * 0.05 * popScale;
                            dlog(`Popping Disorganized ${tokenName}, dealing ${amount} direct damage due to scale ${popScale}`);
                            let remHP = Math.max(0, hp-amount);
                            setTokenAura(formToken, hp, remHP, hpm);
                            const newFP = fp + amount;
                            formToken.set(AttrEnum.HP, remHP);
                            formToken.set(AttrEnum.FP, newFP);
                            formToken.set(StatusIcons.Disorganized, false);
                            const operation = new Operation('Pop Disorganized', tokenName, selection._id,
                                [ new Diff(AttrEnum.HP, hp, remHP), new Diff(AttrEnum.FP, fp, newFP) ], 
                                [ new Diff(StatusIcons.Disorganized, popScale, false) ]);
                            addOperation(operation);
                            sendChatToFormation(tokenName, 'Disorganization Popped', `<b>Victim:</b> ${formDetails}<br><b>Damage:</b> ${amount} fatality`);
                        } else {
                            sendChat(mcname, 'That token was not marked as disorganized!  Unable to pop.');
                        }
                    } else if (key === '-longrest') {
                        if (tokens.length < 3) return;
                        if (tokens[2] !== 'yes') return;

                        // Calculate the difference
                        let newMax = hpm - fp;
                        const reduxScalar = newMax/hpm;
                        const char = getCharByAny(tokenOwner);
                        const oldProtoCount = parseInt(getAttrCurrent(char, AttrEnum.FORMATION)) || 1;
                        const newProtoCount = Math.ceil(reduxScalar * oldProtoCount);
                        ResizeFormation(formToken, tokenName, char, tokenOwner, reduxScalar, reduxScalar, 0, newProtoCount);

                        // Inform the user
                        let longRestMsg = `${tokenName} has long rested, and CP converted to HP.`;
                        if (newProtoCount < oldProtoCount) {
                            longRestMsg += `<br/>Unfortunately, ${oldProtoCount-newProtoCount} of the ${oldProtoCount} troops have died.  This formation is now only <b>${newProtoCount}</b> strong.`;
                        }
                        sendChatToFormation(tokenName, 'Long Rest', longRestMsg);
                    } else if (key === '-upkeep') {
                        let upkeep = 0;
                        let buyPrice = 0;
                        let buyString = '0';
                        let formType = '';
                        if (npcType.toLowerCase().includes('undead')) {
                            upkeep = cr * protoCount * 0.1;
                            buyPrice = cr * protoCount * 20;
                            buyString = `Creation: <b>${buyPrice}gp</b><br>`;
                        } else if (npcType.toLowerCase().includes('construct')) {
                            upkeep = cr * protoCount * 0.2;
                            buyPrice = cr * protoCount * 50;
                            buyString = `Creation: <b>${buyPrice}gp</b><br>`;
                        } else if (npcType.toLowerCase().includes('plant')) {
                            upkeep = cr * protoCount * 0.2;
                            buyPrice = cr * protoCount;
                            buyString = `Creation: <b>${buyPrice}gp</b><br>`;
                        } else {
                            let sizeMod = sizeCostArray[getCreatureSize(npcType)];
                            let recruitMod = 1;
                            buyString = '';
                            formType = 'Mercenary ';
                            buyPrice = cr * protoCount;
                            if (recruitSource === 'Levied') {
                                recruitMod = 0.5;
                                buyString = `Procurement: <b>${buyPrice}gp</b><br>`;
                                formType = 'Levied ';
                            }
                            dlog(`Size Mod: ${sizeMod}  CR: ${cr}  Count: ${protoCount}  Recruit Mod: ${recruitMod}`);
                            upkeep = (sizeMod + cr) * protoCount * recruitMod;
                        }
                        upkeep = +upkeep.toFixed(2);
                        purchaseCost += buyPrice;
                        upkeepCost += upkeep;
                        if (msg.selected.length === 1) {
                            sendChat(mcname, `&{template:desc} {{desc=<h3>${formType}${tokenName} Cost</h3><hr>${buyString}Upkeep: <b>${upkeep}gp</b><hr>(plus mounts and gear for ${protoCount} ${sourceCreature} if relevant)}}`);
                            return;
                        }
                        if (processed === msg.selected.length) {
                            sendChat(mcname, `&{template:desc} {{desc=<h3>Army Cost</h3><hr>Procurement Cost: <b>${purchaseCost}</b><br>Upkeep: <b>${upkeepCost}gp</b><hr>(plus mounts and gear for troops if relevant)}}`);
                        }
                    } else if (key === '-battleRating') {
                        dlog('Calc Battle Rating');
                        switch (formType.toLowerCase()) {
                            case 'infantry':
                                infExp += protoCount * xp;
                                infCount++;
                                infTroops += protoCount;
                                break;
                            case 'cavalry':
                                cavExp += protoCount * xp;
                                cavCount++;
                                cavTroops += protoCount;
                                break;
                            case 'archers':
                            case 'archer':
                                arcExp += protoCount * xp;
                                arcCount++;
                                arcTroops += protoCount;
                                break;
                            case 'mage':
                            case 'mages':
                                magExp += protoCount * xp;
                                magCount++;
                                magTroops += protoCount;
                                break;
                            case 'scout':
                            case 'scouts':
                                sctExp += protoCount * xp;
                                sctCount++;
                                sctTroops += protoCount;
                                break;
                            default:
                                dlog('Invalid Formation Type: ' + formType);
                                sendChat(mcname, 'Invalid Formation Type: ' + formDetails);
                                return;
                        }
                        if (processed === msg.selected.length) {
                            _.defer(() => {
                                printBattleRating(infExp, infCount, infTroops, cavExp, cavCount, cavTroops, arcExp, arcCount, arcTroops, magExp, magCount, magTroops, sctExp, sctCount, sctTroops, heroList);
                            });
                        }
                    } else if (key === '-defend') {
                        const isDefending = formToken.get(StatusIcons.Defend);
                        formToken.set(StatusIcons.Defend, !isDefending);
                        addOperation(new Operation('Defending', tokenName, selection._id, [], [new Diff(StatusIcons.Defend, isDefending, !isDefending)]));
                    } else if (key === '-guard') {
                        const isGuarding = formToken.get(StatusIcons.Guard);
                        formToken.set(StatusIcons.Guard, !isGuarding);
                        addOperation(new Operation('Guarding', tokenName, selection._id, [], [new Diff(StatusIcons.Guard, isGuarding, !isGuarding)]));
                    } else if (key === '-cooldown') {
                        const isOnCooldown = formToken.get(StatusIcons.Cooldown);
                        formToken.set(StatusIcons.Cooldown, !isOnCooldown);
                        addOperation(new Operation('Cooling Down', tokenName, selection._id, [], [new Diff(StatusIcons.Cooldown, isOnCooldown, !isOnCooldown)]));
                    } else if (key === '-route') {
                        formToken.set(StatusIcons.Guard, false);
                        formToken.set(StatusIcons.Defend, false);
                        if (tokens.length < 3) return;
                        let newRouteValue = parseInt(tokens[2]);
                        if (newRouteValue === -1) {
                            formToken.set(StatusIcons.Routed, false);
                        } else if (newRouteValue === 0) {
                            formToken.set(StatusIcons.Routed, true);
                        } else if (newRouteValue === 1) {
                            formToken.set(StatusIcons.Routed, "1");
                        } else if (newRouteValue === 2) {
                            formToken.set(StatusIcons.Routed, "2");
                        } else {
                            formToken.set(StatusIcons.Routed, false);
                            formToken.set(StatusIcons.Dead, true);
                        }
                    } else if (key === '-heal') {
                        if (tokens.length < 3) return;
                        let healVal = parseInt(tokens[2]);
                        let missingVitality = hpm - fp - cp - hp;
                        let realHeal = Math.min(healVal, missingVitality);
                        dlog(`Attempting Heal of ${healVal}, which was reduced to ${realHeal}`);
                        const newHP = hp + realHeal;
                        formToken.set(AttrEnum.HP, newHP);
                        const capString = realHeal < healVal
                            ? `, capped at <b>${realHeal}`
                            : ``;
                        const operation = new Operation('Heal', tokenName, selection._id, [ new Diff(AttrEnum.HP, hp, newHP) ], []);
                        addOperation(operation);
                        setTokenAura(formToken, hp, newHP, hpm);
                        sendChatToFormation(tokenName, 'Healing Received', `<b>Recipient:</b> ${formDetails}<br><b>Healing</b>: ${healVal}${capString}`);
                    } else if (key === '-ac') {
                        sendChatToSource(msg, `${tokenName}'s AC: ${cacheEntry.ac}`);
                    } else if (key === '-speed') {
                        sendChatToSource(msg, `${tokenName}'s Speed: ${cacheEntry.speed}`);
                    } else if (key === '-morale') {
                        const char = getCharByAny(tokenOwner);
                        let morale = cacheEntry.Morale ? cacheEntry.Morale : GetMorale(char, cr);
                        cacheEntry.Morale = morale;
                        PrintMorale(tokenName, morale);
                    } else if (key === '-setMorale') {
                        if (msg.selected.length > 1) {
                            sendChatToSource(msg, 'Error: set morale does not support multiselect.');
                            return;
                        }
                        if (tokens.length < 4) return;
                        let newVal = parseInt(tokens[2]);
                        let factorName = Decaret(msg.content);
                        dlog('Updating Factor ' + factorName + ' to ' + newVal);
                        
                        // Load existing
                        const char = getCharByAny(tokenOwner);
                        let morale = cacheEntry.Morale ? cacheEntry.Morale : GetMorale(char, cr);

                        // Mutate
                        if (factorName === 'CommanderCha') {
                            morale.CommanderCha = newVal;
                        } else if (factorName === 'Expand') {
                            morale.Expand = newVal === 1;
                        } else {
                            for (let i = 0; i < morale.Factors.length; i++) {
                                const factor = morale.Factors[i];
                                if (factor.Name === factorName) {
                                    factor.Value = newVal;
                                    break;
                                }
                            }
                        }

                        // Save
                        const moraleStr = JSON.stringify(morale);
                        setAttr(tokenOwner, AttrEnum.MORALE, moraleStr);
                        cacheEntry.Morale = morale;

                        // Print
                        PrintMorale(tokenName, morale);
                    } else if (key === '-setInt') {
                        if (tokens.length < 3) return;
                        const newMod = parseInt(tokens[2]);
                        const char = getCharByAny(tokenOwner);
                        const oldMod = parseInt(getAttrCurrent(char, AttrEnum.COMMANDER_TO_HIT)) || 0;
                        const delta = newMod - oldMod;
                        const primeDescs = JSON.parse(getAttrCurrent(char, AttrEnum.PRIME_ACTION_DESC) || '{}') || {};
                        const protoCount = parseInt(getAttrCurrent(char, AttrEnum.FORMATION)) || 0;
                        
                        const actionIds = OGLAction.GetActionIds(tokenOwner);
                        for (let fieldName in actionIds) {
                            const actionId = actionIds[fieldName];
                            const action = OGLAction.GetActionDetails(char, actionId);
                            ScaleAction(tokenOwner, action, 1, delta, primeDescs, protoCount);
                        }
                        setAttr(tokenOwner, AttrEnum.COMMANDER_TO_HIT, newMod);
                        sendChatToFormation(tokenName, 'INT Rescale', `The INT modifier of the commander of ${tokenName} has been changed from ${oldMod} to ${newMod}`);
                    } else if (key === '-resize') {
                        if (tokens.length < 3) return;
                        let newCount = parseInt(tokens[2]) || 1;
                        const char = getCharByAny(tokenOwner);
                        const scale = newCount / (parseInt(getAttrCurrent(char, AttrEnum.FORMATION)) || 1);
                        sendChat(mcname, `/w gm Resizing formation: ${tokenName} to be ${newCount}.  This may take a few seconds...`);
                        setTimeout(ResizeFormation, 100, formToken, tokenName, char, tokenOwner, scale, scale, 0, newCount);
                    } else if (key === '-rename') {
                        if (tokens.length < 3) return;
                        let newName = Decaret(msg.content);
                        const char = getCharByAny(tokenOwner);
                        const oldProtoCount = parseInt(getAttrCurrent(char, AttrEnum.FORMATION)) || 1;
                        RenameFormation(formToken, char, tokenOwner, oldProtoCount, oldProtoCount, tokenName, newName);
                        setDefaultTokenForCharacter(char, formToken);
                    } else {
                        dlog('Unrecognized Input');
                        sendChatToSource(msg, 'Unrecognized input.');
                    }
                });
            });
        }, wait);
    });

    log(`-=> ${mcname} v${v} online. <=-`);
});
if (typeof MarkStop != 'undefined') {MarkStop('MassCombat');}
