// Rest and Recovery
// A Roll20 API script to handle recovery on the resource attributes on the D&D 5th Edition by Roll20 sheet.
on('ready', () => {
    const version = '0.0.2';
    const sheetVersion = 'D&D 5th Edition by Roll20';
    log('Rest and Recovery v' + version + ' is ready!  Designed for use with the ' + sheetVersion + ' character sheet!');
                const shortRestList = ['Spell Slots', 'Warlock Spell Slots','Spell Points','Channel Divinity', 'Wild Shapes', 'Second Wind','Action Surge','Superiority Dice', 'Ki', 'Ki Points','Visions of the Past','Enthralling Performance','Words of Terror','Unbreakable Majesty','Spirit Totem','Indomitable','Arcane Shot','Detect Portal','Ethereal Step','Magic-Users Nemesis','Favored by the Gods','Wind Soul','Blade Song','Arcane Abeyance','Illusory Step','Shapechanger'];
                const longRestList = ['Rages', 'Lay on Hands', 'Sorcery Points','Flash of Genius','Divine Intervention','Eyes of the Grave','Warding Flare','Wrath of the Storm','Cleansing Touch','War Priest Attack','Sentinel at Deaths Door','Embodiment of the Law','Universal Speech','Mantle of Majesty','Infectious Inspiration','Shadow Lore','Balm of the Summer Court','Natural Recovery','Fungal Infestation','Hidden Paths','Walker in Dreams','Faithful Summons','Fighting Spirit','Warding Maneuver','Strength Before Death','Unwavering Mark','Wholeness of Body','Glorious Defense','Undying Sentinel','Invincible Conqueror','Holy Nimbus','Living Legend','Emissary of Redemption','Elder Champion','Avenging Angel','Dread Lord','Hunters Sense','Unerring Eye','Spell Thief','Strength of the Grave','Tides of Chaos','Unearthly Recovery','Mystic Arcanum-6th','Mystic Arcanum-7th','Mystic Arcanum-8th','Mystic Arcanum-9th','Eldritch Master','Chronal Shift','Momentary Stasis','Benign Transposition','Instinctive Charm','Power Surge','Violent Attraction','Event Horizon'];
                const ammoList = ['Crossbow bolts', 'Arrows', 'Bullets', 'Sling Bullets', 'Needles', 'Darts'];

    on('chat:message', (msg) => {
        if ('api' === msg.type && /!r-(short|long|charges|ammo|help|list)\b/i.test(msg.content) && msg.selected) {
            let idList = [];
            let nameList = [];
            var rReport = '';
            const header = "<div style='width: 100%; color: #000; border: 1px solid #000; background-color: #fff; box-shadow: 0 0 3px #000; width: 90%; display: block; text-align: left; font-size: 13px; padding: 5px; margin-bottom: 0.25em; font-family: sans-serif; white-space: pre-wrap;'>";
            const footer = '</div>';

            function sendMessage(messageText) {
                sendChat("Rest and Recovery", "/w " + msg.who + header + messageText + footer);

            }

            function checkRestList(rName) {

                rRecoverName = rName;

                if (ammoList.includes(rName)) {
                    rRecoverName = rName + '+ammo';
                } else if (longRestList.includes(rName)) {
                    rRecoverName = rName + '+LR';
                } else if (shortRestList.includes(rName)) {
                    rRecoverName = rName + '+SR';
                } else {
                    rRecoverName = rName + '+x';
                }

                return rRecoverName;
            }


            const attrLookup = (characterid, name, caseSensitive) => {
                let match = name.match(/^(repeating_.*)_\$(\d+)_.*$/);
                if (match) {
                    let index = match[2],
                        attrMatcher = new RegExp(`^${name.replace(/_\$\d+_/,'_([-\\da-zA-Z]+)_')}$`, (caseSensitive ? '' : 'i')),
                        createOrderKeys = [],
                        attrs = _.chain(findObjs({
                            type: 'attribute',
                            characterid
                        }))
                        .map((a) => {
                            return {
                                attr: a,
                                match: a.get('name').match(attrMatcher)
                            };
                        })
                        .filter((o) => o.match)
                        .each((o) => createOrderKeys.push(o.match[1]))
                        .reduce((m, o) => {
                            m[o.match[1]] = o.attr;
                            return m;
                        }, {})
                        .value(),
                        sortOrderKeys = _.chain(((findObjs({
                            type: 'attribute',
                            characterid,
                            name: `_reporder_${match[1]}`
                        })[0] || {
                            get: _.noop
                        }).get('current') || '').split(/\s*,\s*/))
                        .intersection(createOrderKeys)
                        .union(createOrderKeys)
                        .value();
                    if (index < sortOrderKeys.length && _.has(attrs, sortOrderKeys[index])) {
                        return attrs[sortOrderKeys[index]];
                    }
                    return;
                }
                return findObjs({
                    type: 'attribute',
                    characterid,
                    name: name
                }, {
                    caseInsensitive: !caseSensitive
                })[0];
            };

            //Dice rolling function
            const parse = (txt) => {
                const tokenize = /(\d+d\d+|\d+|\+|-)/ig;
                const dieparts = /^(\d+)?d(\d+)$/i;
                const ops = {
                    '+': (m, n) => m + n,
                    '-': (m, n) => m - n
                };
                let op = '+';

                return (txt.replace(/\s+/g, '').match(tokenize) || []).reduce((m, t) => {
                    let matches = t.match(dieparts);
                    if (matches) {
                        return ops[op](m, [...Array(parseInt(matches[1]) || 1)].reduce(m => m + randomInteger(parseInt(matches[2])), 0));
                    } else if (/^\d+$/.test(t)) {
                        return ops[op](m, parseInt(t));
                    } else {
                        op = t;
                        return m;
                    }
                }, 0);
            };



            //Get character list. Future versions may handle multiple characters
            let TCData = msg.selected
                .map(o => getObj('graphic', o._id))
                .filter(o => undefined !== o)
                .filter(t => t.get('represents').length)
                .map(t => ({
                    token: t,
                    character: getObj('character', t.get('represents'))
                }))
                .filter(o => undefined !== o.character);
            var allIDs = TCData.map(n => n.character.get('_id'));

            var characterID = (allIDs[0]);
            var myCharacter = getObj('character', characterID);


            var resourceName_l = [],
                resourceRecovery_l = [],
                resourceCurrent_l = [],
                resourceMax_l = [],
                resourceName_r = [],
                resourceRecovery_r = [],
                resourceCurrent_r = [],
                resourceMax_r = [];



            resourceName_c = getAttrByName(characterID, "class_resource_name");
            resourceName_c = checkRestList(resourceName_c);
            resourceRecovery_c = resourceName_c.split(/\+(.+)/)[1]; //Regex splits on first occurence of '+', so the dice strings are preserved
            resourceCurrent_c = getAttrByName(characterID, "class_resource");
            resourceMax_c = getAttrByName(characterID, "class_resource", "max");


            resourceName_o = getAttrByName(characterID, "other_resource_name");
            resourceName_o = checkRestList(resourceName_o);
            resourceRecovery_o = resourceName_o.split(/\+(.+)/)[1];
            resourceCurrent_o = getAttrByName(characterID, "other_resource");
            resourceMax_o = getAttrByName(characterID, "other_resource", "max");


            //Get Repeating Resources
            var i = 0
            do {
                if (attrLookup(characterID, 'repeating_resource_$' + i + '_resource_left_name')) {
                    resourceName_l[i] = getAttrByName(characterID, 'repeating_resource_$' + i + '_resource_left_name');
                    resourceName_l[i] = checkRestList(resourceName_l[i]);
                    resourceRecovery_l[i] = resourceName_l[i].split(/\+(.+)/)[1];
                    resourceCurrent_l[i] = getAttrByName(characterID, 'repeating_resource_$' + i + '_resource_left');
                    resourceMax_l[i] = getAttrByName(characterID, 'repeating_resource_$' + i + '_resource_left', 'max');
                }

                if (attrLookup(characterID, 'repeating_resource_$' + i + '_resource_right_name')) {
                    resourceName_r[i] = getAttrByName(characterID, 'repeating_resource_$' + i + '_resource_right_name');
                    resourceName_r[i] = checkRestList(resourceName_r[i]);
                    resourceRecovery_r[i] = resourceName_r[i].split(/\+(.+)/)[1];
                    resourceCurrent_r[i] = getAttrByName(characterID, 'repeating_resource_$' + i + '_resource_right');
                    resourceMax_r[i] = getAttrByName(characterID, 'repeating_resource_$' + i + '_resource_right', 'max');
                }
                i++;
            }
            while (i < 10);




            //recover resources function
            function recoverResource(rFullName, rName, rRecover, rCurrent, rMax) {
                let r = attrLookup(characterID, rCurrent);

                if ((rRecover.includes("SR") && msg.content.includes("short")) || ((rRecover.includes("LR") || rRecover.includes("SR")) && msg.content.includes("long"))) {

                    if (rRecover.includes('d')) {

                        rRecover = rRecover.split(/SR|LR/)[1];
                        let recoverAmount = parse(rRecover);
                        r.set('current', Math.min(Number(r.get('current')) + recoverAmount, rMax));
                        rReport = rReport + getAttrByName(characterID, rName) + ' added ' + recoverAmount + 'charges. <BR>';
                    } else {
                        r.set('current', rMax);
                        rReport = rReport + getAttrByName(characterID, rName) + ' has been fully restored. <BR>';

                    }
                } else if (rRecover.includes("d") && !rRecover.includes('R') && msg.content.includes("charges")) {
                    let recoverAmount = parse(rRecover);
                    r.set('current', Math.min(Number(r.get('current')) + recoverAmount, rMax));
                    rReport = rReport + getAttrByName(characterID, rName) + ' added ' + recoverAmount + 'charges. <BR>';
                } else if (rRecover.includes('ammo') && msg.content.includes("ammo")) {
                    if (rMax - Number(r.get('current')) > 0) {
                        let recoverAmount = (rMax - Number(r.get('current'))) + 'd2-' + (rMax - Number(r.get('current')));
                        recoverAmount = parse(recoverAmount);
                        r.set('current', Math.min(Number(r.get('current')) + recoverAmount, rMax));
                        r.set('max', r.get('current'));
                        rReport = rReport + recoverAmount + ' ' + getAttrByName(characterID, rName) + ' have been recovered. <BR>';
                    }
                }
            }


            //Run Recoveries Here
            recoverResource(resourceName_c, "class_resource_name", resourceRecovery_c, "class_resource", resourceMax_c);
            recoverResource(resourceName_o, "other_resource_name", resourceRecovery_o, "other_resource", resourceMax_o);


            i = 0;
            do {
                if (resourceName_l[i]) {
                    recoverResource(resourceName_l[i], 'repeating_resource_$' + i + '_resource_left_name', resourceRecovery_l[i], 'repeating_resource_$' + i + '_resource_left', resourceMax_l[i]);

                }
                i++;
            }
            while (resourceName_l[i]);

            i = 0;
            do {
                if (resourceName_r[i]) {
                    recoverResource(resourceName_r[i], 'repeating_resource_$' + i + '_resource_right_name', resourceRecovery_r[i], 'repeating_resource_$' + i + '_resource_right', resourceMax_r[i]);
                }
                i++;
            }
            while (resourceName_r[i]);

            if (msg.content.includes("help")) {
                sendMessage('<h3>Rest and Recovery</h3><p>A Roll20 API script to handle recovery on the resource attributes on the D&amp;D 5th Edition by Roll20 sheet.To use this script, resources must include a code in their name, separated from the name by a plus sign. You can include standard dice expressions as well. &quot;1d6&quot; is used in all examples, but you can do 2d6+3, 3d20, etc. Here are examples of the commands given and the codes that are affected.</p><b>!r-short</b><p><em>Used for Short Rest</em></p><p><strong>+SR</strong> This resource will return to its maximumm value</p><p><strong>+SR1d6</strong> This resource will add 1d6 to the resource up to its maximum value</p><b>!r-long</b><p><em>Used for Long Rest</em></p><p><strong>+LR</strong> This resource will return to its maximumm value</p><p><strong>+LR1d6</strong> This resource will add 1d6 to the resource up to its maximum value</p><b id="-r-charges">!r-Charges</b><p>*used for restoring charges that are user-controlled, such as &quot;at dawn&quot; or &quot;under a full moon&quot;.</p><p><strong>+1d6</strong></p><b>!r-Ammo</b><p>no code is used here. The script looks for common ammo types: Crossbow bolts, Arrows, Bullets, etc. It rolls 1d2 for each piece of ammo expended. If the result is a &quot;2&quot;, the ammo is recovered. The max and current values are adjusted to reflect the new total.</p><b>Special Cases</b><p>Finally, the following special cases exist. Class Resources that have any of the following names are recognized and handled appropriately:</p><b>These are recovered on a Short or Long Rest:</b><ul><li>Spell Slots, Warlock Spell Slots</li><li>Channel Divinity</li><li>Wild Shape</li><li>Superiority Dice</li><li><p>Ki Points, Ki</p><b>These are recovered on a Long Rest.</b></li><li>Rages</li><li>Lay on Hands</li><li>Sorcery Points</li></ul><p><strong>Bardic Inspiration</strong> needs a +SR or +LR code, since the recovery rate changes at fifth level</p>');
            } else {
             if (msg.content.includes("list")) {
                sendMessage('<h3>Rest and Recovery</h3></br><strong>Short Rest Class Resources</strong><br>'+shortRestList.join('</br><br>')+'</br><p></p><strong>Long Rest Class Resources</strong><br>'+longRestList.join('</br><br>')+'</br><p></p><strong>Ammo Types</strong><br>'+ammoList.join('</br><br>')+'</br>');
            } else {
                if (rReport) {
                    sendMessage(rReport);
                } else {
                    sendMessage('No resources were changed.');
}
                }
                log(rReport);
            }



        }
    });
});
