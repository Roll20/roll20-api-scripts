//A System for tracking Downtime Activities
//Made by Julexar (https://app.roll20.net/users/9989180/julexar)

//API Commands:
/* !down - will give you the menu
    --Options--
    --sel - use the selected character token
    --name - use the character name
    --charid - use the character id
*/

var Downtime = Downtime || (function(){
    'use strict';
    
    var version='0.9d',
    
    setDefaults = function() {
        state.down = {
            now: {
                time: 0,
                type: "Week",
                substr: "s",
                dc: 0,
                crimeval: 0,
                train: "",
                potion: "",
                item: "",
                minprice: 10,
                maxprice: 1000,
            }
        };
    },

    setItemList = function() {
        state.List = {
            common: {
                weapon: [
                    //Common Weapons
                    {
                        description: "An Armblade is a magic weapon that attaches to your arm, becoming inseperable from you as long as you\'re attuned to it. To attune to this item, you must hold it against your forearm for the entire attunement period.<br><br>As a bonus action, you can retract the armblade into your forearm or extend it from there. While it is extended, you can use the weapon as if you were holding it, and you can\'t use that hand for other purposes.",
                        attunement: true,
                        attune_requirement: "Warforged",
                        name: "Armblade",
                        specifics: "one-handed melee",
                        magicbonus: 0,
                        modifiers: "Item Type: Melee Weapon",
                        properties: "One-Handed"
                    },
                    {
                        description: "In darkness, the unsheathed blade of this sword sheds moonlight, creating bright light in a 15-foot radius and dim light for an additional 15 feet.",
                        attunement: false,
                        specifics: "sword",
                        name: "Moon-Touched Sword",
                        magicbonus: 0,
                        modifiers: "Item Type: Melee Weapon",
                        properties: ""
                    },
                    {
                        description: "This arrow can\'t be broken, except when it is within an Antimagic Field.",
                        attunement: false,
                        specifics: "arrow",
                        name: "Unbreakable Arrow",
                        magicbonus: 0,
                        modifiers: "Item Type: Ammunition",
                        properties: ""
                    },
                    {
                        description: "This ammunition packs a wallop. A creature hit by the ammunition must succeed on a DC 10 Strength saving throw or be knocked prone.",
                        attunement: false,
                        specifics: "ammunition",
                        name: "Walloping Ammunition",
                        magicbonus: 0,
                        modifiers: "Item Type: Ammunition",
                        properties: ""
                    }
                ],
                armor: [
                    //Common Armor
                    {
                        description: "This armor never gets dirty.",
                        attunement: false,
                        specifics: "medium or heavy",
                        name: "Armor of Gleaming",
                        modifiers: "Item Type: Armor",
                        properties: ""
                    },
                    {
                        description: "You can doff this armor as an action",
                        attunement: false,
                        specifics: "any armor",
                        name: "Cast-Off Armor",
                        modifiers: "Item Type: Armor",
                        properties: ""
                    },
                    {
                        description: "The front of this shield is shaped in the likeness of a face. While bearing the shield, you can use a bonus action to alter the face\'s expression.",
                        attunement: false,
                        specifics: "shield",
                        name: "Shield of Expression",
                        modifiers: "Item Type: Shield, AC: 2",
                        properties: ""
                    },
                    {
                        description: "Wisps of harmless, odorless smoke rise from this armor while it is worn.",
                        attunement: false,
                        specifics: "any armor",
                        name: "Smoldering Armor",
                        modifiers: "Item Type: Armor",
                        properties: ""
                    }
                ],
                accessoires: [
                    //Common Accessoires (Rings, Rods, Staffs, Wearables)
                ],
                scroll: [
                    //Common Scrolls    
                ],
                misc: [
                    //Common misc Items (edibles & other things that don't belong in previous categories)
                ]
            },
            uncommon: {
                weapon: [
                    //Uncommon Weapons
                ],
                armor: [
                    //Uncommon Armor
                ],
                accessoires: [
                    //Uncommon Accessoires (Rings, Rods, Staffs, Wearables)
                ],
                scroll: [
                    //Uncommon Scrolls    
                ],
                misc: [
                    //Uncommon misc Items (edibles & other things that don't belong in previous categories)
                ]
            },
            rare: {
                weapon: [
                    //Rare Weapons
                ],
                armor: [
                    //Rare Armor
                ],
                accessoires: [
                    //Rare Accessoires (Rings, Rods, Staffs, Wearables)
                ],
                scroll: [
                    //Rare Scrolls    
                ],
                misc: [
                    //Rare misc Items (edibles & other things that don't belong in previous categories)
                ]
            },
            very_rare: {
                weapon: [
                    //Very Rare Weapons
                ],
                armor: [
                    //Very Rare Armor
                ],
                accessoires: [
                    //Very Rare Accessoires (Rings, Rods, Staffs, Wearables)
                ],
                scroll: [
                    //Very Rare Scrolls    
                ],
                misc: [
                    //Very Rare misc Items (edibles & other things that don't belong in previous categories)
                ]
            },
            legendary: {
                weapon: [
                    //Legendary Weapons
                ],
                armor: [
                    //Legendary Armor
                ],
                accessoires: [
                    //Legendary Accessoires (Rings, Rods, Staffs, Wearables)
                ],
                scroll: [
                    //Legendary Scrolls    
                ],
                misc: [
                    //Legendary misc Items (edibles & other things that don't belong in previous categories)
                ]
            }
        };
    },
    
    handleInput = function(msg) {
        var args=msg.content.split(/\s+--/);
        if (msg.type!=="api") {
            return;
        }
        if (playerIsGM(msg.playerid)) {
            switch (args[0]) {
                case '!setdown':
                    setdown(args[1],args[2],args[3],msg);
                    downmenu(args[1],msg);
                    return;
                case '!setminbet':
                    let min=Number(String(args[1]).replace("amount ",""));
                    state.down.now.minprice=min;
                    downmenu(undefined,msg);
                    return;
                case '!setmaxbet':
                    let max=Number(String(args[1]).replace("amount ",""));
                    state.down.now.maxprice=max;
                    downmenu(undefined,msg);
                    return;
            }
        }
        switch (args[0]) {
            case '!down':
                downmenu(args[1],msg);
                return;
            case '!brewmenu':
                brewmenu(args[1],args[2],args[3],msg);
                return;
            case '!brew':
                brew(args[1],args[2],args[3],msg);
            case '!craftmenu':
                craftmenu(args[1],args[2],args[3],args[4],args[5],msg);
                return;
            case '!craft':
                craft(args[1],args[2],args[3],args[4],msg);
                return;
            case '!trainmenu':
                trainmenu(args[1],args[2],msg);
                return;
            case '!train':
                train(args[1],args[2],args[3],msg);
                return;
            case '!crimemenu':
                crimemenu(args[1],args[2],msg);
                return;
            case '!commit':
                crime(args[1],args[2],msg);
                return;
            case '!setitem':
                state.down.now.item=args[1];
                craftmenu(args[2],args[3],args[4],args[5],msg);
                return;
            case '!researchmenu':
                researchmenu(args[1],msg);
                return;
            case '!research':
                research(args[1],args[2],msg);
                return;
            case '!gamblemenu':
                gamblemenu(args[1],args[2],msg);
                return;
            case '!gamble':
                gamble(args[1],args[2],msg);
                return;
            case '!work':
                work(args[1],args[2],args[3],msg);
                return;
            case '!settrain':
                state.down.now.train=args[3];
                trainmenu(args[1],args[2],msg);
                return;
        }
    },
    
    downmenu = function(option,msg) {
        var divstyle = 'style="width: 220px; border: 1px solid black; background-color: #ffffff; padding: 5px;"';
        var astyle1 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 100px;';
        var astyle2 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 150px;';
        var tablestyle = 'style="text-align:center;"';
        var arrowstyle = 'style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid rgb(126, 45, 64); margin-bottom: 2px; margin-top: 2px;"';
        var headstyle = 'style="color: rgb(126, 45, 64); font-size: 18px; text-align: left; font-variant: small-caps; font-family: Times, serif;"';
        var substyle = 'style="font-size: 11px; line-height: 13px; margin-top: -3px; font-style: italic;"';
        let speakingName = msg.who;
        let char;
        if (option) {
            if (option.includes('sel')) {
                option.replace("sel","");
                option=msg.selected;
                let charid=getIDsFromTokens(option)[0];
                char=findObjs({
                    _type: 'character',
                    _id: charid
                })[0];
                if (char) {
                    if (playerIsGM(msg.playerid)) {
                        let name=char.get('name');
                        char.get('gmnotes',function(gmnotes) {
                            sendChat("Downtime","/w gm <div "+ divstyle + ">" + //--
                                '<div ' + headstyle + '>Downtime</div>' + //--
                                '<div ' + substyle + '>Menu</div>' + //--
                                '<div ' + arrowstyle + '></div>' + //--
                                '<table>' + //--
                                '<tr><td>Downtime: </td><td><a ' + astyle1 + '" href="!setdown --type ?{Player?|All|' + name + '} --amount ?{Amount?|1} --timetype ?{Type?|Day|Week|Month|Year}">' + gmnotes + '</a></td></tr>' + //--
                                '<tr><td>Min Bet: </td><td><a ' + astyle1 + '" href="!setminbet --amount ?{Amount?|10}">' + state.down.now.minprice + ' GP</a></td></tr>' + //--
                                '<tr><td>Max Bet: </td><td><a ' + astyle1 + '" href="!setmaxbet --amount ?{Amount?|1000}">' + state.down.now.maxprice + ' GP</a></td></tr>' + //--
                                '</table>' + //--
                                '</div>'
                            );
                        });
                    } else {
                        char.get("gmnotes",function(gmnotes) {
                            if (gmnotes="") {
                                sendChat("Downtime","/w "+msg.who+" You do not have available Downtime!");
                            } else {
                                sendChat("Downtime","/w " + speakingName + " <div "+ divstyle + ">" + //--
                                    '<div ' + headstyle + '>Downtime</div>' + //--
                                    '<div ' + substyle + '>Menu</div>' + //--
                                    '<div ' + arrowstyle + '></div>' + //--
                                    '<table>' + //--
                                    'Downtime: ' + gmnotes + //--
                                    '</table>' + //--
                                    '<br>' + //--
                                    '<div style="text-align:center;">Available Downtime Activities</div>' + //--
                                    '<br>' + //--
                                    '<div style="text-align:center;"><a ' + astyle2 + '" href="!brewmenu --charid ' + charid + ' --rarity ?{Type?|Common|Uncommon|Rare|Very Rare|Legendary} --amount ?{Amount?|1}">Brew Potion</a></div>' + //--
                                    '<div style="text-align:center;"><a ' + astyle2 + '" href="!craftmenu --charid ' + charid + ' --type ?{Type?|Weapon|Armor|Accessoires|Scroll|Misc} --rarity ?{Rarity?|Common|Uncommon|Rare|Very Rare|Legendary} --amount ?{Amount?|1}">Craft Items</a></div>' + //--
                                    '<div style="text-align:center;"><a ' + astyle2 + '" href="!work --charid ' + charid + ' --skill ?{Skill?|Acrobatics|Animal Handling|Arcana|Athletics|Deception|History|Insight|Intimidation|Investigation|Medicine|Nature|Perception|Performance|Persuasion|Religion|Sleight of Hand|Stealth|Survival} --time ?{Time?|1}">Work</a></div>' + //--
                                    '<div style="text-align:center;"><a ' + astyle2 + '" href="!trainmenu --charid ' + charid + ' --type ?{Type?|Tool|Language}">Train</a></div>' + //--
                                    '<div style="text-align:center;"><a ' + astyle2 + '" href="!crimemenu --charid ' + charid + ' --type ?{Type?|Stealth|Thieves\' Tools|Investigation|Perception|Deception}">Commit Crime</a></div>' + //--
                                    '<div style="text-align:center;"><a ' + astyle2 + '" href="!researchmenu --charid ' + charid + ' --price 50">Research</a></div>' + //--
                                    '<div style="text-align:center;"><a ' + astyle2 + '" href="!gamblemenu --charid ' + charid + ' --amount ?{Amount?|10}">Gamble</a></div>' + //--
                                    '</div>'
                                );
                            }
                        });
                    }
                } else {
                    sendChat("Downtime","/w " + msg.who + " The selected character doesn\'t exist!");
                }
            } else if (option.includes('name')) {
                option.replace("name ","");
                char=findObjs({
                    _type: 'character',
                    name: option
                }, {caseInsensitive: true});
                if (char && char.length>1) {
                    sendChar("Downtime","/w "+msg.who+" Multiple Characters with the same name exist, please select the token and use >>!down --sel<< instead");
                } else if (char[0]) {
                    char=char[0];
                    if (playerIsGM(msg.playerid)) {
                        let name = char.get('name');
                        char.get('gmnotes',function(gmnotes) {
                            sendChat("Downtime","/w gm <div "+ divstyle + ">" + //--
                                '<div ' + headstyle + '>Downtime</div>' + //--
                                '<div ' + substyle + '>Menu</div>' + //--
                                '<div ' + arrowstyle + '></div>' + //--
                                '<table>' + //--
                                '<tr><td>Downtime: </td><td><a ' + astyle1 + '" href="!setdown --type ?{Player?|All|' + name + '} --amount ?{Amount?|1} --timetype ?{Type?|Day|Week|Month|Year}">' + gmnotes + '</a></td></tr>' + //--
                                '<tr><td>Min Bet: </td><td><a ' + astyle1 + '" href="!setminbet --amount ?{Amount?|10}">' + state.down.now.minprice + ' GP</a></td></tr>' + //--
                                '<tr><td>Max Bet: </td><td><a ' + astyle1 + '" href="!setmaxbet --amount ?{Amount?|1000}">' + state.down.now.maxprice + ' GP</a></td></tr>' + //--
                                '</table>' + //--
                                '</div>'
                            );
                        });
                    } else {
                        let charid=char.get('_id');
                        char.get("gmnotes",function(gmnotes) {
                            let time=String(gmnotes);
                            if (time=="") {
                                sendChat("Downtime","/w "+msg.who+" You do not have available Downtime!");
                            } else {
                                sendChat("Downtime","/w " + speakingName + " <div "+ divstyle + ">" + //--
                                    '<div ' + headstyle + '>Downtime</div>' + //--
                                    '<div ' + substyle + '>Menu</div>' + //--
                                    '<div ' + arrowstyle + '></div>' + //--
                                    '<table>' + //--
                                    'Downtime: ' + time + //--
                                    '</table>' + //--
                                    '<br>' + //--
                                    '<div style="text-align:center;">Available Downtime Activities</div>' + //--
                                    '<br>' + //--
                                    '<div style="text-align:center;"><a ' + astyle2 + '" href="!brewmenu --charid ' + charid + ' --rarity ?{Type?|Common|Uncommon|Rare|Very Rare|Legendary} --amount ?{Amount?|1}">Brew Potion</a></div>' + //--
                                    '<div style="text-align:center;"><a ' + astyle2 + '" href="!craftmenu --charid ' + charid + ' --type ?{Type?|Weapon|Armor|Accessoires|Scroll|Misc} --rarity ?{Rarity?|Common|Uncommon|Rare|Very Rare|Legendary} --amount ?{Amount?|1}">Craft Items</a></div>' + //--
                                    '<div style="text-align:center;"><a ' + astyle2 + '" href="!work --charid ' + charid + ' --skill ?{Skill?|Acrobatics|Animal Handling|Arcana|Athletics|Deception|History|Insight|Intimidation|Investigation|Medicine|Nature|Perception|Performance|Persuasion|Religion|Sleight of Hand|Stealth|Survival} --time ?{Time?|1}">Work</a></div>' + //--
                                    '<div style="text-align:center;"><a ' + astyle2 + '" href="!trainmenu --charid ' + charid + ' --type ?{Type?|Tool|Language}">Train</a></div>' + //--
                                    '<div style="text-align:center;"><a ' + astyle2 + '" href="!crimemenu --charid ' + charid + ' --type ?{Type?|Stealth|Thieves\' Tools|Investigation|Perception|Deception}">Commit Crime</a></div>' + //--
                                    '<div style="text-align:center;"><a ' + astyle2 + '" href="!researchmenu --charid ' + charid + ' --price 50">Research</a></div>' + //--
                                    '<div style="text-align:center;"><a ' + astyle2 + '" href="!gamblemenu --charid ' + charid + ' --amount ?{Amount?|10}">Gamble</a></div>' + //--
                                    '</div>'
                                );
                            }
                        });
                    }
                }
            } else if (option.includes('charid')) {
                option.replace("charid ","");
                char=findObjs({
                    _type: 'character',
                    _id: option
                }, {caseInsensitive: true})[0];
                if (char) {
                    if (playerIsGM(msg.playerid)) {
                        let name = char.get('name');
                        char.get('gmnotes',function(gmnotes) {
                            sendChat("Downtime","/w gm <div "+ divstyle + ">" + //--
                                '<div ' + headstyle + '>Downtime</div>' + //--
                                '<div ' + substyle + '>Menu</div>' + //--
                                '<div ' + arrowstyle + '></div>' + //--
                                '<table>' + //--
                                '<tr><td>Downtime: </td><td><a ' + astyle1 + '" href="!setdown --type ?{Player?|All|' + name + '} --amount ?{Amount?|1} --timetype ?{Type?|Day|Week|Month|Year}">' + gmnotes + '</a></td></tr>' + //--
                                '<tr><td>Min Bet: </td><td><a ' + astyle1 + '" href="!setminbet --amount ?{Amount?|10}">' + state.down.now.minprice + ' GP</a></td></tr>' + //--
                                '<tr><td>Max Bet: </td><td><a ' + astyle1 + '" href="!setmaxbet --amount ?{Amount?|1000}">' + state.down.now.maxprice + ' GP</a></td></tr>' + //--
                                '</table>' + //--
                                '</div>'
                            );
                        });
                    } else {
                        let charid=char.get('_id');
                        char.get("gmnotes",function(gmnotes) {
                            let time=String(gmnotes);
                            if (time=="") {
                                sendChat("Downtime","/w "+msg.who+" You do not have available Downtime!");
                            } else {
                                sendChat("Downtime","/w " + speakingName + " <div "+ divstyle + ">" + //--
                                    '<div ' + headstyle + '>Downtime</div>' + //--
                                    '<div ' + substyle + '>Menu</div>' + //--
                                    '<div ' + arrowstyle + '></div>' + //--
                                    '<table>' + //--
                                    'Downtime: ' + time + //--
                                    '</table>' + //--
                                    '<br>' + //--
                                    '<div style="text-align:center;">Available Downtime Activities</div>' + //--
                                    '<br>' + //--
                                    '<div style="text-align:center;"><a ' + astyle2 + '" href="!brewmenu --charid ' + charid + ' --rarity ?{Type?|Common|Uncommon|Rare|Very Rare|Legendary} --amount ?{Amount?|1}">Brew Potion</a></div>' + //--
                                    '<div style="text-align:center;"><a ' + astyle2 + '" href="!craftmenu --charid ' + charid + ' --type ?{Type?|Weapon|Armor|Accessoires|Scroll|Misc} --rarity ?{Rarity?|Common|Uncommon|Rare|Very Rare|Legendary} --amount ?{Amount?|1}">Craft Items</a></div>' + //--
                                    '<div style="text-align:center;"><a ' + astyle2 + '" href="!work --charid ' + charid + ' --skill ?{Skill?|Acrobatics|Animal Handling|Arcana|Athletics|Deception|History|Insight|Intimidation|Investigation|Medicine|Nature|Perception|Performance|Persuasion|Religion|Sleight of Hand|Stealth|Survival} --time ?{Time?|1}">Work</a></div>' + //--
                                    '<div style="text-align:center;"><a ' + astyle2 + '" href="!trainmenu --charid ' + charid + ' --type ?{Type?|Tool|Language}">Train</a></div>' + //--
                                    '<div style="text-align:center;"><a ' + astyle2 + '" href="!crimemenu --charid ' + charid + ' --type ?{Type?|Stealth|Thieves\' Tools|Investigation|Perception|Deception}">Commit Crime</a></div>' + //--
                                    '<div style="text-align:center;"><a ' + astyle2 + '" href="!researchmenu --charid ' + charid + ' --price 50">Research</a></div>' + //--
                                    '<div style="text-align:center;"><a ' + astyle2 + '" href="!gamblemenu --charid ' + charid + ' --amount ?{Amount?|10}">Gamble</a></div>' + //--
                                    '</div>'
                                );
                            }
                        });
                    }
                } else {
                    sendChat("Downtime","/w "+msg.who+" No Characters with the given ID exist!");
                }
            } else if (option.includes("type")) {
                option=option.replace("type ","");
                if (option=="All") {
                    if (state.down.now.time>1) {
                        sendChat("Downtime","/w gm <div "+ divstyle + ">" + //--
                            '<div ' + headstyle + '>Downtime</div>' + //--
                            '<div ' + substyle + '>Menu</div>' + //--
                            '<div ' + arrowstyle + '></div>' + //--
                            '<table>' + //--
                            '<tr><td>Downtime: </td><td><a ' + astyle1 + '" href="!setdown --type All --amount ?{Amount?|1} --timetype ?{Type?|Day|Week|Month|Year}">' + state.down.now.time + " " + state.down.now.type + state.down.now.substr + '</a></td></tr>' + //--
                            '<tr><td>Min Bet: </td><td><a ' + astyle1 + '" href="!setminbet --amount ?{Amount?|10}">' + state.down.now.minprice + ' GP</a></td></tr>' + //--
                            '<tr><td>Max Bet: </td><td><a ' + astyle1 + '" href="!setmaxbet --amount ?{Amount?|1000}">' + state.down.now.maxprice + ' GP</a></td></tr>' + //--
                            '</table>' + //--
                            '</div>'
                        );
                    } else {
                        sendChat("Downtime","/w gm <div "+ divstyle + ">" + //--
                            '<div ' + headstyle + '>Downtime</div>' + //--
                            '<div ' + substyle + '>Menu</div>' + //--
                            '<div ' + arrowstyle + '></div>' + //--
                            '<table>' + //--
                            '<tr><td>Downtime: </td><td><a ' + astyle1 + '" href="!setdown --type All --amount ?{Amount?|1} --timetype ?{Type?|Day|Week|Month|Year}">' + state.down.now.time + " " + state.down.now.type + '</a></td></tr>' + //--
                            '<tr><td>Min Bet: </td><td><a ' + astyle1 + '" href="!setminbet --amount ?{Amount?|10}">' + state.down.now.minprice + ' GP</a></td></tr>' + //--
                            '<tr><td>Max Bet: </td><td><a ' + astyle1 + '" href="!setmaxbet --amount ?{Amount?|1000}">' + state.down.now.maxprice + ' GP</a></td></tr>' + //--
                            '</table>' + //--
                            '</div>'
                        );
                    }
                } else if (option!=="All") {
                    option=option.replace("type ","");
                    let char=findObjs({
                        _type: 'character',
                        name: option
                    }, {caseInsensitive: true})[0];
                    if (char) {
                        if (playerIsGM(msg.playerid)) {
                            let name=option;
                            char.get('gmnotes',function(gmnotes) {
                                sendChat("Downtime","/w gm <div "+ divstyle + ">" + //--
                                    '<div ' + headstyle + '>Downtime</div>' + //--
                                    '<div ' + substyle + '>Menu</div>' + //--
                                    '<div ' + arrowstyle + '></div>' + //--
                                    '<table>' + //--
                                    '<tr><td>Downtime: </td><td><a ' + astyle1 + '" href="!setdown --type ?{Player?|All|' + name + '} --amount ?{Amount?|1} --timetype ?{Type?|Day|Week|Month|Year}">' + gmnotes + '</a></td></tr>' + //--
                                    '<tr><td>Min Bet: </td><td><a ' + astyle1 + '" href="!setminbet --amount ?{Amount?|10}">' + state.down.now.minprice + ' GP</a></td></tr>' + //--
                                    '<tr><td>Max Bet: </td><td><a ' + astyle1 + '" href="!setmaxbet --amount ?{Amount?|1000}">' + state.down.now.maxprice + ' GP</a></td></tr>' + //--
                                    '</table>' + //--
                                    '</div>'
                                );
                            });
                        }
                    } else {
                        if (state.down.now.time>1) {
                            sendChat("Downtime","/w gm <div "+ divstyle + ">" + //--
                                '<div ' + headstyle + '>Downtime</div>' + //--
                                '<div ' + substyle + '>Menu</div>' + //--
                                '<div ' + arrowstyle + '></div>' + //--
                                '<table>' + //--
                                '<tr><td>Downtime: </td><td><a ' + astyle1 + '" href="!setdown --type All --amount ?{Amount?|1} --timetype ?{Type?|Day|Week|Month|Year}">' + state.down.now.time + " " + state.down.now.type + state.down.now.substr + '</a></td></tr>' + //--
                                '<tr><td>Min Bet: </td><td><a ' + astyle1 + '" href="!setminbet --amount ?{Amount?|10}">' + state.down.now.minprice + ' GP</a></td></tr>' + //--
                                '<tr><td>Max Bet: </td><td><a ' + astyle1 + '" href="!setmaxbet --amount ?{Amount?|1000}">' + state.down.now.maxprice + ' GP</a></td></tr>' + //--
                                '</table>' + //--
                                '</div>'
                            );
                        } else {
                            sendChat("Downtime","/w gm <div "+ divstyle + ">" + //--
                                '<div ' + headstyle + '>Downtime</div>' + //--
                                '<div ' + substyle + '>Menu</div>' + //--
                                '<div ' + arrowstyle + '></div>' + //--
                                '<table>' + //--
                                '<tr><td>Downtime: </td><td><a ' + astyle1 + '" href="!setdown --type All --amount ?{Amount?|1} --timetype ?{Type?|Day|Week|Month|Year}">' + state.down.now.time + " " + state.down.now.type + '</a></td></tr>' + //--
                                '<tr><td>Min Bet: </td><td><a ' + astyle1 + '" href="!setminbet --amount ?{Amount?|10}">' + state.down.now.minprice + ' GP</a></td></tr>' + //--
                                '<tr><td>Max Bet: </td><td><a ' + astyle1 + '" href="!setmaxbet --amount ?{Amount?|1000}">' + state.down.now.maxprice + ' GP</a></td></tr>' + //--
                                '</table>' + //--
                                '</div>'
                            );
                        }
                    }
                }
            }
        } else {
            if (playerIsGM(msg.playerid)) {
                let char=findObjs({
                    _type: 'character',
                    name: msg.who
                }, {caseInsensitive: true})[0];
                if (char) {
                    let name = char.get('name');
                    char.get('gmnotes',function(gmnotes) {
                        let time=gmnotes;
                        sendChat("Downtime","/w gm <div "+ divstyle + ">" + //--
                            '<div ' + headstyle + '>Downtime</div>' + //--
                            '<div ' + substyle + '>Menu</div>' + //--
                            '<div ' + arrowstyle + '></div>' + //--
                            '<table>' + //--
                            '<tr><td>Downtime: </td><td><a ' + astyle1 + '" href="!setdown --type ?{Player?|All|' + name + '} --amount ?{Amount?|1} --timetype ?{Type?|Day|Week|Month|Year}">' + time + '</a></td></tr>' + //--
                            '<tr><td>Min Bet: </td><td><a ' + astyle1 + '" href="!setminbet --amount ?{Amount?|10}">' + state.down.now.minprice + ' GP</a></td></tr>' + //--
                            '<tr><td>Max Bet: </td><td><a ' + astyle1 + '" href="!setmaxbet --amount ?{Amount?|1000}">' + state.down.now.maxprice + ' GP</a></td></tr>' + //--
                            '</table>' + //--
                            '</div>'
                        );
                    });
                } else {
                    if (state.down.now.time>1) {
                        sendChat("Downtime","/w gm <div "+ divstyle + ">" + //--
                            '<div ' + headstyle + '>Downtime</div>' + //--
                            '<div ' + substyle + '>Menu</div>' + //--
                            '<div ' + arrowstyle + '></div>' + //--
                            '<table>' + //--
                            '<tr><td>Downtime: </td><td><a ' + astyle1 + '" href="!setdown --type All --amount ?{Amount?|1} --timetype ?{Type?|Day|Week|Month|Year}">' + state.down.now.time + " " + state.down.now.type + state.down.now.substr + '</a></td></tr>' + //--
                            '<tr><td>Min Bet: </td><td><a ' + astyle1 + '" href="!setminbet --amount ?{Amount?|10}">' + state.down.now.minprice + ' GP</a></td></tr>' + //--
                            '<tr><td>Max Bet: </td><td><a ' + astyle1 + '" href="!setmaxbet --amount ?{Amount?|1000}">' + state.down.now.maxprice + ' GP</a></td></tr>' + //--
                            '</table>' + //--
                            '</div>'
                        );
                    } else {
                        sendChat("Downtime","/w gm <div "+ divstyle + ">" + //--
                            '<div ' + headstyle + '>Downtime</div>' + //--
                            '<div ' + substyle + '>Menu</div>' + //--
                            '<div ' + arrowstyle + '></div>' + //--
                            '<table>' + //--
                            '<tr><td>Downtime: </td><td><a ' + astyle1 + '" href="!setdown --type All --amount ?{Amount?|1} --timetype ?{Type?|Day|Week|Month|Year}">' + state.down.now.time + " " + state.down.now.type + '</a></td></tr>' + //--
                            '<tr><td>Min Bet: </td><td><a ' + astyle1 + '" href="!setminbet --amount ?{Amount?|10}">' + state.down.now.minprice + ' GP</a></td></tr>' + //--
                            '<tr><td>Max Bet: </td><td><a ' + astyle1 + '" href="!setmaxbet --amount ?{Amount?|1000}">' + state.down.now.maxprice + ' GP</a></td></tr>' + //--
                            '</table>' + //--
                            '</div>'
                        );
                    }
                }
            } else {
                let char = findObjs({
                    _type: 'character',
                    name: msg.who
                }, {caseInsensitive: true})[0];
                if (char) {
                    let charid=char.get('_id');
                    char.get("gmnotes",function(gmnotes) {
                        let time=String(gmnotes);
                        if (time=="") {
                            sendChat("Downtime","/w "+msg.who+" You do not have available Downtime!");
                        } else {
                            sendChat("Downtime","/w " + speakingName + " <div "+ divstyle + ">" + //--
                                '<div ' + headstyle + '>Downtime</div>' + //--
                                '<div ' + substyle + '>Menu</div>' + //--
                                '<div ' + arrowstyle + '></div>' + //--
                                '<table>' + //--
                                'Downtime: ' + time + //--
                                '</table>' + //--
                                '<br>' + //--
                                '<div style="text-align:center;">Available Downtime Activities</div>' + //--
                                '<br>' + //--
                                '<div style="text-align:center;"><a ' + astyle2 + '" href="!brewmenu --charid ' + charid + ' --rarity ?{Type?|Common|Uncommon|Rare|Very Rare|Legendary} --amount ?{Amount?|1}">Brew Potion</a></div>' + //--
                                '<div style="text-align:center;"><a ' + astyle2 + '" href="!craftmenu --charid ' + charid + ' --type ?{Type?|Weapon|Armor|Accessoires|Scroll|Misc} --rarity ?{Rarity?|Common|Uncommon|Rare|Very Rare|Legendary} --amount ?{Amount?|1}">Craft Items</a></div>' + //--
                                '<div style="text-align:center;"><a ' + astyle2 + '" href="!work --charid ' + charid + ' --skill ?{Skill?|Acrobatics|Animal Handling|Arcana|Athletics|Deception|History|Insight|Intimidation|Investigation|Medicine|Nature|Perception|Performance|Persuasion|Religion|Sleight of Hand|Stealth|Survival} --time ?{Time?|1}">Work</a></div>' + //--
                                '<div style="text-align:center;"><a ' + astyle2 + '" href="!trainmenu --charid ' + charid + ' --type ?{Type?|Tool|Language}">Train</a></div>' + //--
                                '<div style="text-align:center;"><a ' + astyle2 + '" href="!crimemenu --charid ' + charid + ' --type ?{Type?|Stealth|Thieves\' Tools|Investigation|Perception|Deception}">Commit Crime</a></div>' + //--
                                '<div style="text-align:center;"><a ' + astyle2 + '" href="!research --charid ' + charid + ' --price 50">Research</a></div>' + //--
                                '<div style="text-align:center;"><a ' + astyle2 + '" href="!gamblemenu --charid ' + charid + ' --amount ?{Amount?|10}">Gamble</a></div>' + //--
                                '</div>'
                            );
                        }
                    });
                } else {
                    sendChat("Downtime","/w "+msg.who+" Please select a character either as the one you're speaking as or by using one of these Options:<br>--sel (select the character token)<br>--name {Character Name}<br>--charid {Character ID}");
                }
            }
        }
    },
    
    createHandout = function(charid,msg) {
        let char=findObjs({
            _type: 'character',
            _id: charid
        }, {caseInsensitive: true})[0];
        if (char) {
            let playerid = char.get('controlledby');
            let existing=findObjs({
                _type: 'handout',
            });
            let count=0;
            let multiple=false;
            let handid;
            _.each(existing,function(handout) {
                let name=handout.get('name');
                if (name.includes("Downtime Activities") && name.includes(char.get('name'))) {
                    count=Number(name.replace("Downtime Activities of "+char.get('name')+" #",""));
                    if (name.includes(String(count))) {
                        handid=handout.get('_id');
                    }
                }
            })
            if (count==0) {
                count=1;
            } else {
                count+=1;
            }
            char.get('gmnotes',function(gmnotes) {
                let notes=gmnotes;
                let handout=createObj('handout',{
                    name: 'Downtime Activities of '+char.get('name')+" #"+count,
                    inplayerjournals: playerid,
                    controlledby: msg.playerid,
                });
                handout.set('notes',"Total Downtime: "+notes);
            });
        }
    },
    
    setHandoutDesc = function(playerid,num,description) {
        num=Number(num);
        let handout=findObjs({
            _type: 'handout',
        });
        let id;
        _.each(handout,function(object) {
            let name=object.get('name');
            let injournal=object.get('inplayerjournals');
            if (name.includes("Downtime Activities")) {
                if (name.includes(String(num))) {
                    if (injournal.includes(playerid)) {
                        id=object.get('_id');
                    }
                } else {
                    sendChat("Downtime","/w gm A Handout with that Number does not exist!");
                }
            }
        });
        handout=findObjs({
            _type: 'handout',
            _id: id
        })[0];
        handout.get("notes",function(notes) {
            let nnotes=String(notes)+description;
            let newHand=createObj('handout',{
                name: handout.get('name'),
                inplayerjournals: handout.get('inplayerjournals'),
                controlledby: handout.get("controlledby")
            });
            newHand.set("notes",nnotes);
        });
        handout.remove();
    },
    
    getHandoutNum = function(playerid,charid) {
        let handout=findObjs({
            _type: 'handout',
        });
        let char=findObjs({
            _type: 'character',
            _id: charid
        })[0];
        let num;
        _.each(handout,function(object) {
            let name=object.get('name');
            let injournal=object.get('inplayerjournals');
            if ((name.includes("Downtime Activities") && name.includes(char.get('name')))&&String(injournal).includes(playerid)) {
                num=Number(name.replace("Downtime Activities of "+char.get('name')+" #",""));
            }
        });
        log(num);
        return num;
    },
    
    getIDsFromTokens = function (selected) {
		return (selected || []).map(obj => getObj("graphic", obj._id))
			.filter(x => !!x)
			.map(token => token.get("represents"))
			.filter(id => getObj("character", id || ""));
	},
    
    setdown = function(player,amount,type,msg) {
        amount=Number(amount.replace("amount ",""));
        type=type.replace("timetype ","");
        player=player.replace("type ","");
        if (player=="All") {
            state.down.now.time=amount;
            state.down.now.type=type;
            let characters=findObjs({
                _type: 'character'
            });
            var realamount=0;
            switch (type) {
                case 'Week':
                    realamount+=amount*7;
                    break;
                case 'Month':
                    realamount+=amount*30;
                    break;
                case 'Year':
                    realamount+=amount*360;
                    break;
                case 'Day':
                    realamount=amount;
                    break;
            }
            _.each(characters,function(attr) {
                if (attr.get('inplayerjournals')!=="") {
                    if (realamount>1) {
                        attr.set('gmnotes',realamount+" Days");
                    } else if (realamount==1) {
                        attr.set('gmnotes',realamount+" Day");
                    } else {
                        attr.set('gmnotes',"");
                    }
                    let id=attr.get('_id');
                    createHandout(id,msg);
                }
            });
        } else {
            let char=findObjs({
                _type: 'character',
                name: player
            }, {caseInsensitive: true})[0];
            let id=char.get('_id');
            var realamount=0;
            switch (type) {
                case 'Week':
                    realamount+=amount*7;
                    break;
                case 'Month':
                    realamount+=amount*30;
                    break;
                case 'Year':
                    realamount+=amount*360;
                    break;
                case 'Day':
                    realamount=amount;
                    break;
            }
            if (realamount>1) {
                char.set('gmnotes',realamount+" Days");
            } else if (realamount==1) {
                char.set('gmnotes',realamount+" Day");
            } else {
                char.set('gmnotes',"");
            }
            createHandout(id,msg);
        }
    },
    
    brewmenu = function(charid,type,amount,msg) {
        var divstyle = 'style="width: 220px; border: 1px solid black; background-color: #ffffff; padding: 5px;"';
        var astyle1 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 100px;';
        var astyle2 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 150px;';
        var tablestyle = 'style="text-align:center;"';
        var arrowstyle = 'style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid rgb(126, 45, 64); margin-bottom: 2px; margin-top: 2px;"';
        var headstyle = 'style="color: rgb(126, 45, 64); font-size: 18px; text-align: left; font-variant: small-caps; font-family: Times, serif;"';
        var substyle = 'style="font-size: 11px; line-height: 13px; margin-top: -3px; font-style: italic;"';
        let potionlist;
        let price;
        let time;
        type=type.replace("rarity ","");
        charid=charid.replace("charid ","");
        amount=Number(amount.replace("amount ",""));
        switch (type) {
            case 'Common':
                potionlist="Potion of Climbing,Potion of Healing";
                time=1;
                price=25;
                break;
            case 'Uncommon':
                potionlist="Oil of Slipperiness,Philter of Love,Potion of Advantage,Potion of Animal Friendship,Potion of Fire Breath,Potion of Hill Giant Strength,Potion of Growth,Potion of Healing (Greater),Potion of Poison,Potion of Resistance,Potion of Water Breathing";
                time=5;
                price=100;
                break;
            case 'Rare':
                potionlist="Elixir of Health,Oil of Etherealness,Potion of Aqueous Form,Potion of Clairvoyance,Potion of Diminution,Potion of Gaseous Form,Potion of Frost Giant Strength,Potion of Stone Giant Strength,Potion of Fire Giant Strength,Potion of Cloud Giant Strength,Potion of Healing (Superior),Potion of Heroism,Potion of Invulnerability,Potion of Maximum Power,Potion of Mind Control (Beast),Potion of Mind Control (Humanoid),Potion of Mind Reading";
                time=25;
                price=1000;
                break;
            case 'Very Rare':
                potionlist="Oil of Sharpness,Potion of Flying,Potion of Healing (Supreme),Potion of Invisibility,Potion of Longevity,Potion of Mind Control (Monster),Potion of Possibility,Potion of Speed,Potion of Vitality";
                time=60;
                price=10000;
                break;
            case 'Legendary':
                potionlist="Potion of Dragon\'s Majesty,Potion of Storm Giant Strength";
                time=125;
                price=50000;
                break;
        }
        let list;
        for (let i=0;i<15;i++) {
            list=potionlist.replace(',','|');
        }
        time*=amount;
        price*=amount;
        let char=findObjs({
            _type: 'character',
            _id: charid
        }, {caseInsensitive: true})[0];
        char.get("gmnotes",function(gmnotes){
            let ntime=gmnotes.replace(" Days","");
            if (Number(ntime)<time) {
                sendChat("Downtime","/w "+msg.who+" You do not have enough time to do that!");
            } else {
                let gold=findObjs({
                    _type: 'attribute',
                    _characterid: charid,
                    _name: "gp"
                }, {caseInsensitive: true})[0];
                let cur=gold.get('current');
                if (Number(cur)<price) {
                    sendChat("Downtime","/w "+msg.who+" You do not have enough money to do that!");
                } else {
                    sendChat("Downtime","/w "+msg.who+" <div " + divstyle + ">" + //--
                        '<div ' + headstyle + '>Brewing</div>' + //--
                        '<div ' + substyle + '>Menu</div>' + //--
                        '<div ' + arrowstyle + '></div>' + //--
                        '<table>' + //--
                        '<tr><td>Rarity: </td><td><a ' + astyle1 + '" href="!brewmenu --rarity ?{Rarity?|Common|Uncommon|Rare|Very Rare|Legendary} --amount ' + amount + '">' + type + '</a></td></tr>' + //--
                        '<tr><td>Potion: </td><td><a ' + astyle1 + '" href="!setpotion --potion ?{Potion?|' + list + '} --type ' + type + ' --amount ' + amount + '">' + state.down.now.potion + '</a></td></tr>' + //--
                        '<tr><td>Amount: </td><td><a ' + astyle1 + '" href="!brewmenu --rarity ' + type + ' --amount ?{Amount?|1}">' + amount + '</a></td></tr>' + //--
                        '</table>' + //--
                        '<br>Price: ' + price + ' GP<br>' + //--
                        'Time needed: ' + time + ' Days<br>' + //--
                        '<div style="text-align:center;"><a ' + astyle2 + '" href="!brew --potion ' + state.down.now.potion + ' --amount ' + amount + '">Brew Potion</a></div>' + //--
                        '</div>'
                    );
                }
            }
        })
    },
    
    brew = function(charid,potion,amount,msg) {
        charid=charid.replace("charid ","");
        let char=findObjs({
            _type: 'character',
            _id: charid
        }, {caseInsensitive: true})[0];
        let gold=findObjs({
            _type: 'attribute',
            _characterid: charid,
            _name: "gp"
        }, {caseInsensitive: true})[0];
        let description;
        let modifiers="Item Type: Potion";
        let price;
        let neededtime;
        switch (potion) {
            case 'Potion of Climbing':
                description="When you drink this potion, you gain a climbing speed equal to your walking speed for 1 hour. During this time, you have advantage on Strength (Athletics) checks you make to climb. The potion is separated into brown, silver, and gray layers resembling bands of stone. Shaking the bottle fails to mix the colors.";
                price=25;
                time=2;
                break;
            case 'Potion of Healing':
                description="When you drink this potion, you regain 2d4 + 2 Hit Points.";
                modifiers+=", Damage: 2d4+2,Damage Type: Healing";
                price=25;
                time=2;
                break;
            case 'Oil of Slipperiness':
                description="This sticky black unguent is thick and heavy in the container, but it flows quickly when poured. The oil can cover a Medium or smaller creature, along with the equipment it's wearing and carrying (one additional vial is required for each size category above Medium). Applying the oil takes 10 minutes. The affected creature then gains the effect of a Freedom of Movement spell for 8 hours.\nAlternatively, the oil can be poured on the ground as an action, where it covers a 10-foot square, duplicating the effect of the Grease spell in that area for 8 hours.";
                price=100;
                time=5;
                break;
            case 'Philter of Love':
                description="The next time you see a creature within 10 minutes after drinking this philter, you become charmed by that creature for 1 hour. If the creature is of a species and gender you are normally attracted to, you regard it as your true love while you are charmed. This potion's rose-hued, effervescent liquid contains one easy-to-miss bubble shaped like a heart.";
                price=100;
                time=5;
                break;
            case 'Potion of Advantage':
                description="When you drink this potion, you gain advantage on one ability check, attack roll, or saving throw of your choice that you make within the next hour.<br> This potion takes the form of a sparkling, golden mist that moves and pours like water";
                price=100;
                time=5;
                break;
            case 'Potion of Animal Friendship':
                description="When you drink this potion, you can cast the Animal Friendship spell (save DC 13) for 1 hour at will. Agitating this muddy liquid brings little bits into view: a fish scale, a hummingbird tongue, a cat claw, or a squirrel hair.";
                price=100;
                time=5;
                break;
            case 'Potion of Fire Breath':
                description="After drinking this potion, you can use a bonus action to exhale fire at a target within 30 feet of you. The target must make a DC 13 Dexterity saving throw, taking 4d6 fire damage on a failed save, or half as much damage on a successful one. The effect ends after you exhale the fire three times or when 1 hour has passed.<br>This potion\'s orange liquid flickers, and smoke fills the top of the container and wafts out whenever it is opened.";
                price=100;
                time=5;
                break;
            case 'Potion of Hill Giant Strength':
                description="When you drink this potion, your Strength score changes to 21 for 1 hour. This potion has no effect on you if your Strength is equal to or greater than that score.<br><br> This potion\'s transparent liquid has floating in it a sliver of fingernail from a giant of the appropriate type. The potion of frost giant strength and the potion of stone giant strength have the same effect.";
                price=100;
                time=5;
                break;
            case 'Potion of Growth':
                description="When you drink this potion, you gain the enlarge effect of the Enlarge/Reduce spell for 1d4 hours (no concentration required). The red in the potion's liquid continuously expands from a tiny beat to color the clear liquid around it and then contracts. Shaking the bottle fails to interrupt this process.";
                price=100;
                time=5;
                break;
            case 'Potion of Healing (Greater)':
                potion="Potion of Greater Healing";
                modifiers+=", Damage: 4d4+4,Damage Type: Healing";
                description="You regain 4d4 + 4 hit points when you drink this potion.";
                price=100;
                time=5;
                break;
            case 'Potion of Poison':
                description="This concoction looks, smells, and tastes like a Potion of Healing or other beneficial potion. However, it is actually poison masked by illusion magic. An Identify spell reveals its true nature.<br><br> If you drink it, you take 3d6 poison damage, and you must succeed on a DC 13 Constitution saving throw or be poisoned. At the start of each of your turns while you are poisoned in this way, you take 3d6 poison damage. At the end of each of your turns, you can repeat the saving throw. On a successful save, the poison damage you take on your subsequent turns decreases by 1d6. The poison ends when the damage decreases to 0.";
                modifiers+=", Damage: 3d6, Damage Type: Poison";
                price=100;
                time=5;
                break;
            case 'Potion of Resistance':
                description="When you drink this potion, you gain resistance to one type of damage for 1 hour. The DM chooses the type or determines it randomly.";
                price=100;
                time=5;
                break;
            case 'Potion of Water Breathing':
                description="You can breathe underwater for 1 hour after drinking this potion. Its cloudy green fluid smells of the sea and has a jellyfish-like bubble floating in it.";
                price=100;
                time=5;
                break;
            case 'Elixir of Health':
                description="When you drink this potion, it cures any disease afflicting you, and it removes the blinded, deafened, paralyzed, and poisoned conditions. The clear red liquid has tiny bubbles of light in it.";
                price=1000;
                time=25;
                break;
            case 'Oil of Etherealness':
                description="Beads of this cloudy gray oil form on the outside of its container and quickly evaporate. The oil can cover a Medium or smaller creature, along with the equipment it's wearing and carrying (one additional vial is required for each size category above Medium). Applying the oil takes 10 minutes. The affected creature then gains the effect of the Etherealness spell for 1 hour.";
                price=1000;
                time=25;
                break;
            case 'Potion of Aqueous Form':
                description="When you drink this potion, you transform into a pool of water. You return to your true form after 10 minutes or if you are incapacitated or die. You\'re under the following effects while in this form:<br><br> Liquid Movement. You have a swimming speed of 30 feet. You can move over or through other liquids. You can enter and occupy the space of another creature. You can rise up to your normal height, and you can pass through even Tiny openings. You extinguish nonmagical flames in any space you enter.<br><br> Watery Resilience. You have resistance to nonmagical damage. You also have advantage on Strength, Dexterity, and Constitution saving throws.<br><br> Limitations. You can\'t talk, attack, cast spells, or activate magic items. Any objects you were carrying or wearing meld into your new form and are inaccessible, though you continue to be affected by anything you\'re wearing, such as armor.";
                price=1000;
                time=25;
                break;
            case 'Potion of Clairvoyance':
                description="When you drink this potion, you gain the effect of the Clairvoyance spell. An eyeball bobs in this yellowish liquid but vanishes when the potion is opened.";
                break;
            case 'Potion of Diminution':
                description="When you drink this potion, you gain the reduce effect of the Enlarge/Reduce spell for 1d4 hours (no concentration required). The red in the potion\'s liquid continuously contracts to a tiny bead and then expands to color the clear liquid around it. Shaking the bottle fails to interrupt this process";
                break;
            case 'Potion of Gaseous Form':
                description="When you drink this potion, you gain the effect of the Gaseous Form spell for 1 hour (no concentration required) or until you end the effect as a bonus action. This potion's container seems to hold fog that moves and pours like water";
                price=1000;
                time=25;
                break;
            case 'Potion of Frost Giant Strength':
                description="When you drink this potion, your Strength score changes to 23 for 1 hour. This potion has no effect on you if your Strength is equal to or greater than that score.<br><br> This potion\'s transparent liquid has floating in it a sliver of fingernail from a giant of the appropriate type. The potion of frost giant strength and the potion of stone giant strength have the same effect.";
                price=1000;
                time=25;
                break;
            case 'Potion of Stone Giant Strength':
                description="When you drink this potion, your Strength score changes to 23 for 1 hour. This potion has no effect on you if your Strength is equal to or greater than that score.<br><br> This potion\'s transparent liquid has floating in it a sliver of fingernail from a giant of the appropriate type. The potion of frost giant strength and the potion of stone giant strength have the same effect.";
                price=1000;
                time=25;
                break;
            case 'Potion of Fire Giant Strength':
                description="When you drink this potion, your Strength score changes to 25 for 1 hour. This potion has no effect on you if your Strength is equal to or greater than that score.<br><br> This potion\'s transparent liquid has floating in it a sliver of fingernail from a giant of the appropriate type. The potion of frost giant strength and the potion of stone giant strength have the same effect.";
                price=1000;
                time=25;
                break;
            case 'Potion of Cloud Giant Strength':
                description="When you drink this potion, your Strength score changes to 27 for 1 hour. This potion has no effect on you if your Strength is equal to or greater than that score.<br><br> This potion\'s transparent liquid has floating in it a sliver of fingernail from a giant of the appropriate type. The potion of frost giant strength and the potion of stone giant strength have the same effect.";
                price=1000;
                time=25;
                break;
            case 'Potion of Healing (Superior)':
                potion="Potion of Superior Healing";
                modifiers+=", Damage: 8d4+8,Damage Type: Healing";
                description="You regain 8d4 + 8 hit points when you drink this potion.";
                price=1000;
                time=25;
                break;
            case 'Potion of Heroism':
                description="For 1 hour after drinking it, you gain 10 temporary hit points that last for 1 hour. For the same duration, you are under the effect of the Bless spell (no concentration required). This blue potion bubbles and steams as if boiling.";
                price=1000;
                time=25;
                break;
            case 'Potion of Invulnerability':
                description="For 1 minute after you drink this potion, you have resistance to all damage. The potion\'s syrupy liquid looks like liquified iron.";
                price=1000;
                time=25;
                break;
            case 'Potion of Maximum Power':
                description="The first time you cast a damage-dealing spell of 4th level or lower within 1 minute after drinking the potion, instead of rolling dice to determine the damage dealt, you can instead use the highest number possible for each die.";
                price=1000;
                time=25;
                break;
            case 'Potion of Mind Control (Beast)':
                description="When you drink a Potion of Mind Control, you can cast a Dominate Beast spell (save DC 15) on a specific creature if you do so before the end of your next turn. If you don\'t, the potion is wasted.";
                price=1000;
                time=25;
                break;
            case 'Potion of Mind Control (Humanoid)':
                description="When you drink a Potion of Mind Control, you can cast a Dominate Person spell (save DC 15) on a specific creature if you do so before the end of your next turn. If you don\'t, the potion is wasted.";
                price=1000;
                time=25;
                break;
            case 'Potion of Mind Reading':
                description="When you drink this potion, you gain the effect of the Detect Thoughts spell (save DC 13). The potion's dense, purple liquid has an ovoid cloud of pink floating in it.";
                price=1000;
                time=25;
                break;
            case 'Oil of Sharpness':
                description="This clear, gelatinous oil sparkles with tiny, ultrathin silver shards. The oil can coat one slashing or piercing weapon or up to 5 pieces of slashing or piercing ammunition. Applying the oil takes 1 minute. For 1 hour, the coated item is magical and has a +3 bonus to attack and damage rolls.";
                price=10000;
                time=60;
                break;
            case 'Potion of Flying':
                description="When you drink this potion, you gain a flying speed equal to your walking speed for 1 hour and can hover. If you're in the air when the potion wears off, you fall unless you have some other means of staying aloft. This potion's clear liquid floats at the top of its container and has cloudy white impurities drifting in it.";
                price=10000;
                time=60;
                break;
            case 'Potion of Healing (Supreme)':
                potion="Potion of Supreme Healing";
                modifiers+=", Damage: 10d4+20,Damage Type: Healing";
                description="You regain 10d4 + 20 hit points when you drink this potion.";
                price=10000;
                time=60;
                break;
            case 'Potion of Invisibility':
                description="This potion's container looks empty but feels as though it holds liquid. When you drink it, you become invisible for 1 hour. Anything you wear or carry is invisible with you. The effect ends early if you attack or cast a spell.";
                price=10000;
                time=60;
                break;
            case 'Potion of Longevity':
                description="When you drink this potion, your physical age is reduced by 1d6 + 6 years, to a minimum of 13 years. Each time you subsequently drink a potion of longevity, there is a 10 percent cumulative chance that you instead age by 1d6 + 6 years. Suspended in this amber liquid are a scorpion\'s tail, an adder's fang, a dead spider, and a tiny heart that, against all reason, is still beating. These ingredients vanish when the potion is opened.";
                price=10000;
                time=60;
                break;
            case 'Potion of Mind Control (Monster)':
                description="When you drink a Potion of Mind Control, you can cast a Dominate Monster spell (save DC 15) on a specific creature if you do so before the end of your next turn. If you don\'t, the potion is wasted.";
                price=10000;
                time=60;
                break;
            case 'Potion of Possibility':
                description="When you drink this clear potion, you gain two Fragments of Possibility, each of which looks like a Tiny, grayish bead of energy that follows you around, staying within 1 foot of you at all times. Each fragment lasts for 8 hours or until used.<br><br> When you make an attack roll, an ability check, or a saving throw, you can expend your fragment to roll an additional d20 and choose which of the d20s to use. Alternatively, when an attack roll is made against you, you can expend your fragment to roll a d20 and choose which of the d20s to use, the one you rolled or the one the attacker rolled.<br><br> If the original d20 roll has advantage or disadvantage, you roll your d20 after advantage or disadvantage has been applied to the original roll.<br><br> While you have one or more Fragments of Possibility from this potion, you can\'t gain another Fragment of Possibility from any source.";
                price=10000;
                time=60;
                break;
            case 'Potion of Speed':
                description="When you drink this potion, you gain the effect of the Haste spell for 1 minute (no concentration required). The potion\'s yellow fluid is streaked with black and swirls on its own.";
                price=10000;
                time=60;
                break;
            case 'Potion of Vitality':
                description="When you drink this potion, it removes any exhaustion you are suffering and cures any disease or poison affecting you. For the next 24 hours, you regain the maximum number of hit points for any Hit Die you spend. The potion\'s crimson liquid regularly pulses with dull light, calling to mind a heartbeat.";
                price=10000;
                time=60;
                break;
            case 'Potion of Dragon\'s Majesty':
                description="This potion looks like liquid gold, with a single scale from a chromatic, gem, or metallic dragon suspended in it. When you drink this potion, you transform into an adult dragon of the same kind as the dragon the scale came from. The transformation lasts for 1 hour. Any equipment you are wearing or carrying melds into your new form or falls to the ground (your choice). For the duration, you use the game statistics of the adult dragon instead of your own, but you retain your languages, personality, and memories. You can\’t use a dragon\’s Change Shape or its legendary or lair actions.";
                price=50000;
                time=125;
                break;
            case 'Potion of Storm Giant Strength':
                description="When you drink this potion, your Strength score changes to 29 for 1 hour. This potion has no effect on you if your Strength is equal to or greater than that score.<br><br> This potion\'s transparent liquid has floating in it a sliver of fingernail from a giant of the appropriate type. The potion of frost giant strength and the potion of stone giant strength have the same effect.";
                price=50000;
                time=125;
                break;
        }
        let cur=gold.get('current');
        cur=Number(cur)-price;
        gold.set('current',cur);
        char.get("gmnotes",function(gmnotes) {
            let ntime=Number(gmnotes.replace(' Days',''));
            ntime-=time;
            let notes="";
            if (ntime>0) {
                if (ntime>1) {
                    notes+=String(time)+" Days";
                } else {
                    notes+=String(time)+" Day";
                }
            }
            char.set("gmnotes",notes);
            return;
        });
        let inventory=findObjs({
            _type: 'attribute',
            _characterid: charid
        });
        let row=-1;
        let itemid;
        let rownum;
        let count;
        _.each(inventory,function(object) {
            let name = object.get('_name');
            if (name.includes('repeating_inventory')) {
                if (name.includes('_itemname')) {
                    row+=1;
                    if (object.get('current')==potion) {
                        let test=name.replace("repeating_inventory_","");
                        test=test.replace("_itemname","");
                        itemid=test;
                        rownum=row;
                    }
                }
            }
        });
        _.each(inventory,function(object) {
            let name=object.get('_name');
            if (name.includes('_itemcount')) {
                let test=name.replace("repeating_inventory_","");
                test=test.replace("_itemcount","");
                if (test==itemid) {
                    count=object.get('current');
                }
            }
        });
        if (itemid) {
            if (count) {
                amount=Number(amount)+Number(count);
            }
            sendChat("Downtime","!setattr --charid "+charid+" --repeating_inventory_"+itemid+"_itemcount|"+amount);
        } else {
            sendChat("Downtime","!setattr --charid "+charid+" --repeating_inventory_-CREATE_itemname|"+potion+" --repeating_inventory_-CREATE_itemcount|"+amount+" --repeating_inventory_-CREATE_itemcontent|"+description+" --repeating_inventory_-CREATE_itemmodifiers|"+modifiers+" --repeating_inventory_-CREATE_itemweight|0");
            if (potion=="Potion of Healing") {
                sendChat("Downtime","!setattr --charid "+charid+" --repeating_attack_-CREATE_atkname|"+potion+" --repeating_attack_-CREATE_dmgbase|2d4+2 --repeating_attack_-CREATE_dmgtype|Healing --repeating_attack_-CREATE_atkflag|0");
            } else if (potion=="Potion of Greater Healing") {
                sendChat("Downtime","!setattr --charid "+charid+" --repeating_attack_-CREATE_atkname|"+potion+" --repeating_attack_-CREATE_dmgbase|4d4+4 --repeating_attack_-CREATE_dmgtype|Healing --repeating_attack_-CREATE_atkflag|0");
            } else if (potion=="Potion of Poison") {
                sendChat("Downtime","!setattr --charid "+charid+" --repeating_attack_-CREATE_atkname|"+potion+" --repeating_attack_-CREATE_dmgbase|3d6 --repeating_attack_-CREATE_dmgtype|Poison --repeating_attack_-CREATE_atkflag|0 --repeating_attack_-CREATE_saveattr|Constitution --repeating_attack_-CREATE_saveflat|13 --repeating_attack_-CREATE_saveeffect|Damage reduced by 1d6");
            } else if (potion=="Potion of Superior Healing") {
                sendChat("Downtime","!setattr --charid "+charid+" --repeating_attack_-CREATE_atkname|"+potion+" --repeating_attack_-CREATE_dmgbase|8d4+8 --repeating_attack_-CREATE_dmgtype|Healing --repeating_attack_-CREATE_atkflag|0");
            } else if (potion=="Potion of Supreme Healing") {
                sendChat("Downtime","!setattr --charid "+charid+" --repeating_attack_-CREATE_atkname|"+potion+" --repeating_attack_-CREATE_dmgbase|10d4+20 --repeating_attack_-CREATE_dmgtype|Healing --repeating_attack_-CREATE_atkflag|0");
            } else if (potion=="Potion of Fire Breath") {
                sendChat("Downtime","!setattr --charid "+charid+" --repeating_attack_-CREATE_atkname|Fire Breath --repeating_attack_-CREATE_dmgbase|4d6 --repeating_attack_-CREATE_dmgtype|Fire --repeating_attack_-CREATE_atkflag|0 --repeating_attack_-CREATE_saveattr|Dexterity --repeating_attack_-CREATE_saveflat|13 --repeating_attack_-CREATE_saveeffect|Half Damage");
            } else if (potion=="Potion of Mind Control (Beast)") {
                sendChat("Downtime","!setattr --charid "+charid+" --repeating_attack_-CREATE_atkname|Dominate Beast --repeating_attack_-CREATE_atkflag|0 --repeating_attack_-CREATE_saveattr|Wisdom --repeating_attack_-CREATE_saveflat|15 --repeating_attack_-CREATE_saveeffect|No effect");
            } else if (potion=="Potion of Mind Control (Humanoid)") {
                sendChat("Downtime","!setattr --charid "+charid+" --repeating_attack_-CREATE_atkname|Dominate Person --repeating_attack_-CREATE_atkflag|0 --repeating_attack_-CREATE_saveattr|Wisdom --repeating_attack_-CREATE_saveflat|15 --repeating_attack_-CREATE_saveeffect|No effect");
            } else if (potion=="Potion of Mind Control (Monster)") {
                sendChat("Downtime","!setattr --charid "+charid+" --repeating_attack_-CREATE_atkname|Dominate Monster --repeating_attack_-CREATE_atkflag|0 --repeating_attack_-CREATE_saveattr|Wisdom --repeating_attack_-CREATE_saveflat|15 --repeating_attack_-CREATE_saveeffect|No effect");
            } else if (potion=="Potion of Mind Reading") {
                sendChat("Downtime","!setattr --charid "+charid+" --repeating_attack_-CREATE_atkname|Detect Thoughts --repeating_attack_-CREATE_atkflag|0 --repeating_attack_-CREATE_saveattr|Wisdom --repeating_attack_-CREATE_saveflat|13 --repeating_attack_-CREATE_saveeffect|No effect");
            }
        }
        let handnum=getHandoutNum(msg.playerid,charid);
        let name = char.get("name");
        let desc="<br><br>"+name+" spends "+time+" Days and "+price+" GP crafting "+amount+"x "+potion
        setHandoutDesc(msg.playerid,handnum,desc);
        sendChat("Downtime","/w "+msg.who+" You craft "+amount+" "+potion);
    },

    craftmenu = function(charid,type,rarity,amount,msg) {
        let itemlist;
        var divstyle = 'style="width: 220px; border: 1px solid black; background-color: #ffffff; padding: 5px;"';
        var astyle1 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 100px;';
        var astyle2 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 150px;';
        var tablestyle = 'style="text-align:center;"';
        var arrowstyle = 'style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid rgb(126, 45, 64); margin-bottom: 2px; margin-top: 2px;"';
        var headstyle = 'style="color: rgb(126, 45, 64); font-size: 18px; text-align: left; font-variant: small-caps; font-family: Times, serif;"';
        var substyle = 'style="font-size: 11px; line-height: 13px; margin-top: -3px; font-style: italic;"';
        let price;
        let neededtime;
        type=type.replace("type ","")
        charid=charid.replace("charid ","");
        rarity=rarity.replace("rarity ","")
        amount=Number(amount.replace("amount ",""));
        specific=specific.replace("specific ","");
        switch (rarity) {
            case 'Common':
                price=50;
                neededtime=5;
                if (type=="Weapon") {
                    itemlist=state.List.common.weapon;
                } else if (type=="Armor") {
                    itemlist=state.List.common.armor;
                } else if (type=="Accessoires") {
                    itemlist=state.List.common.accessoires;
                } else if (type=="Scroll") {
                    itemlist=state.List.common.scroll;
                    price=Math.floor(price/2);
                    neededtime=Math.floor(price/2);
                } else if (type=="Misc") {
                    itemlist=state.List.common.misc;
                }
                break;
            case 'Uncommon':
                price=200;
                neededtime=10;
                if (type=="Weapon") {
                    itemlist=state.List.uncommon.weapon;
                } else if (type=="Armor") {
                    itemlist=state.List.uncommon.armor;
                } else if (type=="Accessoires") {
                    itemlist=state.List.uncommon.accessoires;
                } else if (type=="Scroll") {
                    itemlist=state.List.uncommon.scroll;
                    price=Math.floor(price/2);
                    neededtime=Math.floor(price/2);
                } else if (type=="Misc") {
                    itemlist=state.List.uncommon.misc;
                }
                break;
            case 'Rare':
                price=2000;
                neededtime=50;
                if (type=="Weapon") {
                    itemlist=state.List.rare.weapon;
                } else if (type=="Armor") {
                    itemlist=state.List.rare.armor;
                } else if (type=="Accessoires") {
                    itemlist=state.List.rare.accessoires;
                } else if (type=="Scroll") {
                    itemlist=state.List.rare.scroll;
                    price=Math.floor(price/2);
                    neededtime=Math.floor(price/2);
                } else if (type=="Misc") {
                    itemlist=state.List.rare.misc;
                }
                break;
            case 'Very Rare':
                price=20000;
                neededtime=125;
                if (type=="Weapon") {
                    itemlist=state.List.very_rare.weapon;
                } else if (type=="Armor") {
                    itemlist=state.List.very_rare.armor;
                } else if (type=="Accessoires") {
                    itemlist=state.List.very_rare.accessoires;
                } else if (type=="Scroll") {
                    itemlist=state.List.very_rare.scroll;
                    price=Math.floor(price/2);
                    neededtime=Math.floor(price/2);
                } else if (type=="Misc") {
                    itemlist=state.List.very_rare.misc;
                }
                break;
            case 'Legendary':
                price=100000;
                neededtime=250;
                if (type=="Weapon") {
                    itemlist=state.List.legendary.weapon;
                } else if (type=="Armor") {
                    itemlist=state.List.legendary.armor;
                } else if (type=="Accessoires") {
                    itemlist=state.List.legendary.accessoires;
                } else if (type=="Scroll") {
                    itemlist=state.List.legendary.scroll;
                    price=Math.floor(price/2);
                    neededtime=Math.floor(price/2);
                } else if (type=="Misc") {
                    itemlist=state.List.legendary.misc;
                }
                break;
        }
        let item = itemlist.find(e => e.name.toLowerCase().includes(state.down.now.item.toLowerCase()));
        if (item) {
            price+=Number(item.price);
        }
        let firstlist=""
        for (let i=0;i<itemlist.length;i++) {
            firstlist=firstlist+itemlist[i].name+",";
        }
        firstlist=firstlist.split(",");
        let secondlist=[]
        for (let i=0;i<firstlist.length;i++) {
            if (firstlist[i]!=="") {
                secondlist[i]=firstlist[i];
            }
        }
        for (let i=0;i<50;i++) {
            secondlist=String(secondlist).replace(",","|");
        }
        let list=secondlist;
        let char = findObjs({
            _type: 'character',
            _id: charid
        }, {caseInsensitive: true})[0];
        char.get("gmnotes",function(gmnotes) {
            let time=Number(String(gmnotes.replace(" Day","")).replace("s",""));
            if (time<neededtime) {
                sendChat("Downtime","/w "+msg.who+" You do not have enough time to do that!");
            } else {
                let gold=findObjs({
                    _type: 'attribute',
                    _characterid: charid,
                    _name: 'gp'
                }, {caseInsensitive: true})[0]
                let cur=gold.get('current');
                if (cur<price) {
                    sendChat("Downtime","/w "+msg.who+" You do not have enough money to do that!");
                } else {
                    let test=false;
                    itemlist.forEach(element => {
                        if (element.name.toLowerCase().includes(state.down.now.item.toLowerCase())) {
                            test=true;
                            state.down.now.item=element.name;
                        }
                    });
                    if (test==false) {
                        state.down.now.item="";
                    }
                    if (type=="Weapon" || type=="Scroll") {
                        sendChat("Downtime","/w "+msg.who+" <div " + divstyle + ">" + //--
                            '<div ' + headstyle + '>Crafting</div>' + //--
                            '<div ' + substyle + '>Menu</div>' + //--
                            '<div ' + arrowstyle + '></div>' + //--
                            '<div style="text-align:center;">Available ' + type + "s" + //--
                            '<table>' + //--
                            '<tr><td>Rarity: </td><td><a ' + astyle1 + '" href="!craftmenu --charid ' + charid + ' --type ' + type + ' --rarity ?{Rarity?|Common|Uncommon|Rare|Very Rare|Legendary} --amount ' + amount + '">' + rarity + '</a></td></tr>' + //--
                            '<tr><td>Item Type: </td><td><a ' + astyle1 + '" href="!craftmenu --charid ' + charid + ' --type ?{Item Type?|Weapon|Armor|Accessoires|Scroll|Misc} --rarity ' + rarity + ' --amount ' + amount + '">' + type + '</a></td></tr>' + //--
                            '<tr><td>Amount: </td><td><a ' + astyle1 + '" href="!craftmenu --charid ' + charid + ' --type ' + type + ' --rarity ' + rarity + ' --amount ?{Amount?|1}">' + amount + '</a></td></tr>' + //--
                            '<tr><td>Item: </td><td><a ' + astyle1 + '" href="!setitem --item ?{Item?|' + list + '} --charid ' + charid + ' --type ' + type + ' --rarity ' + rarity + ' --amount ' + amount + '">' + state.down.now.item + '</a></td></tr>' + //--
                            '</table>' + //--
                            '<div style="text-align:center;">Price: ' + price + ' GP</div>' + //--
                            '<br><div style="text-align:center;"><a ' + astyle2 + '" href="!craft --charid ' + charid + ' --item ' + state.down.now.item + ' --type ' + type + ' --rarity ' + rarity + '--amount ' + amount + '">Craft Item</a></div>' + //--
                            '</div>'
                        );
                    } else if (type=="Misc") {
                        sendChat("Downtime","/w "+msg.who+" <div " + divstyle + ">" + //--
                            '<div ' + headstyle + '>Crafting</div>' + //--
                            '<div ' + substyle + '>Menu</div>' + //--
                            '<div ' + arrowstyle + '></div>' + //--
                            '<div style="text-align:center;">Available ' + type + " Items" + //--
                            '<table>' + //--
                            '<tr><td>Rarity: </td><td><a ' + astyle1 + '" href="!craftmenu --charid ' + charid + ' --type ' + type + ' --rarity ?{Rarity?|Common|Uncommon|Rare|Very Rare|Legendary} --amount ' + amount + '">' + rarity + '</a></td></tr>' + //--
                            '<tr><td>Item Type: </td><td><a ' + astyle1 + '" href="!craftmenu --charid ' + charid + ' --type ?{Item Type?|Weapon|Armor|Accessoires|Scroll|Misc} --rarity ' + rarity + ' --amount ' + amount + '">' + type + '</a></td></tr>' + //--
                            '<tr><td>Amount: </td><td><a ' + astyle1 + '" href="!craftmenu --charid ' + charid + ' --type ' + type + ' --rarity ' + rarity + ' --amount ?{Amount?|1}">' + amount + '</a></td></tr>' + //--
                            '<tr><td>Item: </td><td><a ' + astyle1 + '" href="!setitem --item ?{Item?|' + list + '} --charid ' + charid + ' --type ' + type + ' --rarity ' + rarity + ' --amount ' + amount + '">' + state.down.now.item + '</a></td></tr>' + //--
                            '</table>' + //--
                            '<div style="text-align:center;">Price: ' + price + ' GP</div>' + //--
                            '<br><div style="text-align:center;"><a ' + astyle2 + '" href="!craft --charid ' + charid + ' --item ' + state.down.now.item + ' --type ' + type + ' --rarity ' + rarity + '--amount ' + amount + '">Craft Item</a></div>' + //--
                            '</div>'
                        );
                    } else if (type=="Armor" || type=="Accessoires") {
                        sendChat("Downtime","/w "+msg.who+" <div " + divstyle + ">" + //--
                            '<div ' + headstyle + '>Crafting</div>' + //--
                            '<div ' + substyle + '>Menu</div>' + //--
                            '<div ' + arrowstyle + '></div>' + //--
                            '<div style="text-align:center;">Available ' + type + //--
                            '<table>' + //--
                            '<tr><td>Rarity: </td><td><a ' + astyle1 + '" href="!craftmenu --charid ' + charid + ' --type ' + type + ' --rarity ?{Rarity?|Common|Uncommon|Rare|Very Rare|Legendary} --amount ' + amount + '">' + rarity + '</a></td></tr>' + //--
                            '<tr><td>Item Type: </td><td><a ' + astyle1 + '" href="!craftmenu --charid ' + charid + ' --type ?{Item Type?|Weapon|Armor|Accessoires|Scroll|Misc} --rarity ' + rarity + ' --amount ' + amount + '">' + type + '</a></td></tr>' + //--
                            '<tr><td>Amount: </td><td><a ' + astyle1 + '" href="!craftmenu --charid ' + charid + ' --type ' + type + ' --rarity ' + rarity + ' --amount ?{Amount?|1}">' + amount + '</a></td></tr>' + //--
                            '<tr><td>Item: </td><td><a ' + astyle1 + '" href="!setitem --item ?{Item?|' + list + '} --charid ' + charid + ' --type ' + type + ' --rarity ' + rarity + ' --amount ' + amount + '">' + state.down.now.item + '</a></td></tr>' + //--
                            '</table>' + //--
                            '<div style="text-align:center;">Price: ' + price + ' GP</div>' + //--
                            '<br><div style="text-align:center;"><a ' + astyle2 + '" href="!craft --charid ' + charid + ' --item ' + state.down.now.item + ' --type ' + type + ' --rarity ' + rarity + '--amount ' + amount + '">Craft Item</a></div>' + //--
                            '</div>'
                        );
                    }
                }
            }
        });
    },
    
    craft = function(charid,item,type,rarity,amount,msg) {
        charid=charid.replace("charid ","");
        type=type.replace("type ","");
        rarity=rarity.replace("rarity ","");
        amount=Number(amount.replace("amount ",""));
        item=item.replace("item ","");
        let itemList;
        let price;
        let neededtime;
        switch (rarity) {
            case 'Common':
                price=50;
                neededtime=5;
                if (type=="Weapon") {
                    itemList=state.List.common.weapon;
                } else if (type=="Armor") {
                    itemList=state.List.common.armor;
                } else if (type=="Accessoires") {
                    itemList=state.List.common.accessoires;
                } else if (type=="Scroll") {
                    itemList=state.List.common.scroll;
                    price=Math.floor(price/2);
                    neededtime=Math.floor(price/2);
                } else if (type=="Misc") {
                    itemList=state.List.common.misc;
                }
                break;
            case 'Uncommon':
                price=200;
                neededtime=10;
                if (type=="Weapon") {
                    itemList=state.List.uncommon.weapon;
                } else if (type=="Armor") {
                    itemList=state.List.uncommon.armor;
                } else if (type=="Accessoires") {
                    itemList=state.List.uncommon.accessoires;
                } else if (type=="Scroll") {
                    itemList=state.List.uncommon.scroll;
                    price=Math.floor(price/2);
                    neededtime=Math.floor(price/2);
                } else if (type=="Misc") {
                    itemList=state.List.uncommon.misc;
                }
                break;
            case 'Rare':
                price=2000;
                neededtime=50;
                if (type=="Weapon") {
                    itemList=state.List.rare.weapon;
                } else if (type=="Armor") {
                    itemList=state.List.rare.armor;
                } else if (type=="Accessoires") {
                    itemList=state.List.rare.accessoires;
                } else if (type=="Scroll") {
                    itemList=state.List.rare.scroll;
                    price=Math.floor(price/2);
                    neededtime=Math.floor(price/2);
                } else if (type=="Misc") {
                    itemList=state.List.rare.misc;
                }
                break;
            case 'Very Rare':
                price=20000;
                neededtime=125;
                if (type=="Weapon") {
                    itemList=state.List.very_rare.weapon;
                } else if (type=="Armor") {
                    itemList=state.List.very_rare.armor;
                } else if (type=="Accessoires") {
                    itemList=state.List.very_rare.accessoires;
                } else if (type=="Scroll") {
                    itemList=state.List.very_rare.scroll;
                    price=Math.floor(price/2);
                    neededtime=Math.floor(price/2);
                } else if (type=="Misc") {
                    itemList=state.List.very_rare.misc;
                }
                break;
            case 'Legendary':
                price=100000;
                neededtime=250;
                if (type=="Weapon") {
                    itemList=state.List.legendary.weapon;
                } else if (type=="Armor") {
                    itemList=state.List.legendary.armor;
                } else if (type=="Accessoires") {
                    itemList=state.List.legendary.accessoires;
                } else if (type=="Scroll") {
                    itemList=state.List.legendary.scroll;
                    price=Math.floor(price/2);
                    neededtime=Math.floor(price/2);
                } else if (type=="Misc") {
                    itemList=state.List.legendary.misc;
                }
                break;
        }
        let trueitem = itemList.find(e => e.name.toLowerCase().includes(item.toLowerCase()));
        if (trueitem) {
            let char = findObjs({
                _type: 'character',
                _id: charid
            }, {caseInsensitive: true})[0];
            if (char) {
                let gold=findObjs({
                    _type: 'attribute',
                    _characterid: charid,
                    _name: 'gp'
                }, {caseInsensitive: true})[0]
                let cur=gold.get('current');
                cur-=price;
                gold.set('current',cur);
                char.get("gmnotes", function(gmnotes) {
                    let time = Number(String(gmnotes.replace(" Day","")).replace("s",""));
                    time-=neededtime;
                    let notes = "";
                    if (time<=1) {
                        if (time==1) {
                            notes+=time+" Day";
                        }
                    } else if (time>1) {
                        notes+=time+" Days";
                    }
                    char.set("gmnotes",notes);
                });
                let description=trueitem.description;
                let modifiers=trueitem.modifiers;
                let itemname=trueitem.name;
                amount=trueitem.amount*amount;
                let inventory=findObjs({
                    _type: 'attribute',
                    _characterid: charid
                });
                let row=-1;
                let itemid;
                let rownum;
                let count;
                _.each(inventory,function(object) {
                    let name = object.get('_name');
                    if (name.includes('repeating_inventory')) {
                        if (name.includes('_itemname')) {
                            row+=1;
                            if (object.get('current')==item) {
                                let test=name.replace("repeating_inventory_","");
                                test=test.replace("_itemname","");
                                itemid=test;
                                rownum=row;
                            }
                        }
                    }
                });
                _.each(inventory,function(object) {
                    let name=object.get('_name');
                    if (name.includes('_itemcount')) {
                        let test=name.replace("repeating_inventory_","");
                        test=test.replace("_itemcount","");
                        if (test==itemid) {
                            count=object.get('current');
                        }
                    }
                });
                if (itemid) {
                    if (count) {
                        amount=Number(amount)+Number(count);
                    }
                    sendChat("Downtime","!setattr --charid "+charid+" --repeating_inventory_"+itemid+"_itemcount|"+amount);
                } else {
                    if (type=="Weapon") {
                        let dmgbase=trueitem.dmgbase;
                        let dmgtype=trueitem.dmgtype;
                        let magicbonus=trueitem.magicbonus;
                        if (!magicbonus) {
                            magicbonus="";
                        }
                        sendChat("Downtime","!setattr --charid "+charid+" --repeating_inventory_-CREATE_itemname|"+itemname+" --repeating_inventory_-CREATE_itemcount|"+amount+" --repeating_inventory_-CREATE_itemcontent|"+description+" --repeating_inventory_-CREATE_itemmodifiers|"+modifiers+" --repeating_inventory_-CREATE_itemweight|"+itemweight);
                        if (dmgbase) {
                            sendChat("Downtime","!setattr --charid "+charid+" --repeating_attack_-CREATE_atkname|"+itemname+" --repeating_attack_-CREATE_dmgbase|"+dmgbase+" --repeating_attack_-CREATE_dmgtype|"+dmgtype+" --repeating_attack_-CREATE_atkmagic|"+magicbonus);
                        }
                    } else {
                        sendChat("Downtime","!setattr --charid "+charid+" --repeating_inventory_-CREATE_itemname|"+itemname+" --repeating_inventory_-CREATE_itemcount|"+amount+" --repeating_inventory_-CREATE_itemcontent|"+description+" --repeating_inventory_-CREATE_itemmodifiers|"+modifiers+" --repeating_inventory_-CREATE_itemweight|"+itemweight);
                    }
                }
            }
        }
        let handnum=getHandoutNum(msg.playerid,charid);
        let name = char.get("name");
        let desc="<br><br>"+name+" spends "+time+" Days and "+price+" GP crafting "+amount+"x "+item
        setHandoutDesc(msg.playerid,handnum,desc);
        sendChat("Downtime","/w "+msg.who+" You craft "+amount+"x "+item);
    },
    
    work = function(charid,type,amount,msg) {
        let skill=type.replace("skill ","");
        type=type.replace("skill ","");
        type=type.replace(" ","_");
        type=type.replace(" ","_");
        type=type.toLowerCase();
        type=type+"_bonus";
        amount=Number(amount.replace("time ",""));
        charid=charid.replace("charid ","");
        let char=findObjs({ 
            _type: 'character', 
            _id: charid
        }, {caseInsensitive: true})[0];
        if (char) {
            let attr=getAttrByName(charid,type)
            var gp=0;
            for (let i=0;i<Number(amount);i++) {
                gp+=randomInteger(20)+Number(attr);
            }
            char.get("gmnotes",function(gmnotes) {
                let time;
                time=Number(String(gmnotes.replace(" Day","")).replace("s",""));
                
                if (time<amount) {
                    sendChat("Downtime","/w "+msg.who+" You do not have enough time to do that!")
                } else {
                    time-=amount;
                    let nnotes="";
                    if (time>0) {
                        if (time==1) {
                            nnotes=String(time)+" Day";
                        } else {
                            nnotes=String(time)+" Days";
                        }
                    }
                    char.set("gmnotes",nnotes);
                }
            });
            var gold=findObjs({
                _type: 'attribute',
                _characterid: charid,
                _name: "gp"
            }, {caseInsensitive: true})[0];
            var cur=Number(gold.get('current'));
            sendChat("Downtime","/w "+msg.who+" You worked for "+amount+" Days and gained "+gp+" GP!");
            let mun=gp;
            gp+=cur;
            gold.set('current',gp);
            let handnum=getHandoutNum(msg.playerid,charid);
            let name = char.get("name");
            let desc="<br><br>"+name+" spends "+amount+" Days working, using "+skill+", earning "+mun+" GP.";
            setHandoutDesc(msg.playerid,handnum,desc);
        }
    },
    
    crimemenu = function(charid,type,msg) {
        var divstyle = 'style="width: 220px; border: 1px solid black; background-color: #ffffff; padding: 5px;"';
        var astyle1 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 100px;';
        var astyle2 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 150px;';
        var tablestyle = 'style="text-align:center;"';
        var arrowstyle = 'style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid rgb(126, 45, 64); margin-bottom: 2px; margin-top: 2px;"';
        var headstyle = 'style="color: rgb(126, 45, 64); font-size: 18px; text-align: left; font-variant: small-caps; font-family: Times, serif;"';
        var substyle = 'style="font-size: 11px; line-height: 13px; margin-top: -3px; font-style: italic;"';
        let speakingName = msg.who;
        let dc=state.down.now.dc;
        type=type.replace("type ","");
        charid=charid.replace("charid ","");
        var amount=7;
        let char = findObjs({
            _type: 'character',
            _id: charid
        }, {caseInsensitive: true})[0];
        let mod;
        let type1;
        if (type=='Thieves\' Tools') {
            mod=Number(getAttrByName(charid,"dexterity_mod"));
            mod+=Number(getAttrByName(charid,"pb"));
        } else {
            type1=type.toLowerCase();
            type1=type+"_bonus";
            mod=Number(getAttrByName(charid,type1));
        }
        if (state.down.now.crimeval>=1000) {
            state.down.now.dc=25;
        } else if (state.down.now.crimeval>=200) {
            state.down.now.dc=20;
        } else if (state.down.now.crimeval>=100) {
            state.down.now.dc=15;
        } else if (state.down.now.crimeval>0) {
            state.down.now.dc=10;
        }
        sendChat("Downtime","/w " + msg.who + " <div " + divstyle + ">" + //--
            '<div ' + headstyle + '>Crime</div>' + //--
            '<div ' + substyle + '>Menu</div>' + //--
            '<div ' + arrowstyle + '></div>' + //--
            'DC: ' + state.down.now.dc + //--
            '<br>' + //--
            '<table>' + //--
            '<tr><td>Skill/Tool: </td><td><a ' + astyle1 + '" href="!crime --type ?{Type?|Stealth|Thieves\' Tools|Investigation|Perception|Deception}">' + type + '</a></td></tr>' + //--
            '<tr><td>Time used: </td><td>' + amount + ' Days</td></tr>' + //--
            '<tr><td>Targetted Value: </td><td><a ' + astyle1 + '" href="!setvalue --amount ?{Amount?|1} --' + type + '">' + state.down.now.crimeval + ' GP</a></td></tr>' + //-- 
            '</table>' + //--
            '<br>' + //--
            '<div style="text-align:center;"><a ' + astyle2 + '" href="!commit --type ' + type1 + ' --amount ' + amount + '">Commit Crime</a></div>' + //--
            '</div>'
        );
    },
    
    crime = function(charid,type,msg) {
        type=type.replace("type ","");
        charid=charid.replace("charid ","");
        let char = findObjs({
            _type: 'character',
            _id: charid
        }, {caseInsensitive: true})[0];
        var gold=findObjs({
            _type: 'attribute',
            _characterid: charid,
            _name: "gp"
        }, {caseInsensitive: true})[0];
        let handnum=getHandoutNum(msg.playerid,charid);
        let name = char.get("name");
        var cur=Number(gold.get('current'));
        char.get("gmnotes",function(gmnotes){
            let ntime=Number(gmnotes.replace(" Days",""));
            if (ntime<7) {
                sendChat("Downtime","/w "+msg.who+" You do not have enough time to do that!");
            } else {
                let cur=gold.get('current');
                if (cur<25) {
                    sendChat("Downtime","/w " + msg.who + " You don\'t have enough GP to do that!");
                } else {
                    let notes="";
                    ntime-=7;
                    if (ntime>0) {
                        notes+=String(ntime)+" Days";
                    }
                    char.set("gmnotes",notes);
                    cur-=25;
                    gold.set('current',cur);
                    var bonus=Number(getAttrByName(charid,type));
                    var passnum=0;
                    for (let j=1;j<=3;j++) {
                        var check=randomInteger(20)+bonus;
                        if (check>Number(state.down.now.dc)) {
                            passnum+=1;
                            sendChat("Downtime","/w gm Check "+j+" passed!");
                        } else {
                            sendChat("Downtime","/w gm Check "+j+" failed!");
                        }
                    }
                    gold=findObjs({
                        _type: 'attribute',
                        _characterid: charid,
                        _name: "gp"
                    }, {caseInsensitive: true})[0];
                    if (passnum==0) {
                        var weeknum=Math.floor(state.down.now.crimeval/25);
                        sendChat("Downtime","/w "+msg.who+" The Heist fails and you are caught, forced to pay a fine of " + state.down.now.crimeval + " GP and are locked into Jail for "+weeknum+" Weeks");
                        let desc="<br><br>"+name+" spends 7 Days and 25 GP setting up a Heist, but they fail and are caught. They pay a fine of "+state.down.now.crimeval+" GP and are locked into Jail for "+weeknum+" Weeks.";
                        setHandoutDesc(msg.playerid,handnum,desc);
                        if ((cur-Number(state.down.now.crimeval))<0) {
                            cur=0;
                            gold.set('current',0);
                        } else {
                            cur-=Number(state.down.now.crimeval);
                            gold.set('current',cur);
                        }
                        let days=Number(weeknum*7);
                        char=findObjs({
                            _type: 'character',
                            name: msg.who
                        }, {caseInsensitive: true})[0];
                        char.get("gmnotes",function(gmnotes) {
                            let time;
                            time=gmnotes.replace(" Days","");
                            time=Number(time);
                            let notes="";
                            if (time<days) {
                                let newdays=Number(days-time);
                                notes="Must spend "+String(newdays)+" Days in Jail.";
                            } else {
                                time-=days;
                                if (time!==0) {
                                    notes=String(time)+" Days";
                                }
                            }
                            char.set("gmnotes",notes);
                        });
                    } else if (passnum==1) {
                        let crimeval=Number(state.down.now.crimeval)
                        sendChat("Downtime","/w "+msg.who+" You fail the Heist but manage to get away.");
                        let desc="<br><br>"+name+" spends 7 Days and 25 GP trying to pull off a Heist, targeting "+crimeval+" GP, but fail. They manage to get away before they could get caught.";
                        setHandoutDesc(msg.playerid,handnum,desc);
                    } else if (passnum==2) {
                        let crimeval=Number(state.down.now.crimeval)/2;
                        sendChat("Downtime","/w "+msg.who+" You manage to pull off the Heist but could only get away with "+crimeval+" GP.");
                        cur+=crimeval;
                        gold.set('current',cur);
                        let desc="<br><br>"+name+" spends 7 Days and 25 GP setting up a Heist. They pull it off but only manage to get away with "+crimeval+" GP.";
                        setHandoutDesc(msg.playerid,handnum,desc);
                    } else if (passnum==3) {
                        let crimeval=Number(state.down.now.crimeval);
                        sendChat("Downtime","/w "+msg.who+" You pull off the Heist successfully and gain "+crimeval+" GP.");
                        cur+=crimeval;
                        gold.set('current',cur);
                        let desc="<br><br>"+name+" spends 7 Days and 25 GP setting up a Heist. They pull it off and gain "+crimeval+" GP.";
                        setHandoutDesc(msg.playerid,handnum,desc);
                    }
                }
            }
        });
    },
    
    trainmenu = function(charid,type,msg) {
        var divstyle = 'style="width: 220px; border: 1px solid black; background-color: #ffffff; padding: 5px;"';
        var astyle1 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 100px;';
        var astyle2 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 150px;';
        var tablestyle = 'style="text-align:center;"';
        var arrowstyle = 'style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid rgb(126, 45, 64); margin-bottom: 2px; margin-top: 2px;"';
        var headstyle = 'style="color: rgb(126, 45, 64); font-size: 18px; text-align: left; font-variant: small-caps; font-family: Times, serif;"';
        var substyle = 'style="font-size: 11px; line-height: 13px; margin-top: -3px; font-style: italic;"';
        charid=charid.replace("charid ","");
        let char = findObjs({
            _type: 'character',
            _id: charid
        })[0];
        type=type.replace("type ","");
        let list;
        switch (type) {
            case 'Tool':
                list="Alchemist\'s Supplies,Brewer\'s Supplies,Calligrapher\'s Supplies,Carpenter\'s Tools,Cartographer\'s Tools,Cobbler\'s Tools,Cook\'s Utensils,Glasblower\'s Tools,Jeweler\'s Tools,Leatherworker\'s Tools,Mason\'s Tools,Painter\'s Supplies,Potter\'s Tools,Smith\'s Tools,Tinker\'s Tools,Weaver\'s Tools,Woodcarver\'s Tools,Disguise Kit,Forgery Kit,Dice Set,Dragonchess set,Playing Card Set,Three-Dragon Ante Set,Herbalism Kit,Bagpipes,Drum,Dulcimer,Flute,Lute,Lyre,Horn,Pan Flute,Shawm,Viol,Navigator\'s Tools,Poisoner\'s Kit,Thieves\' Tools,Land Vehicles,Water Vehicles";
                break;
            case 'Language':
                list="Common,Dwarvish,Elvish,Giant,Gnomish,Goblin,Halfling,Orc,Abyssal,Celestial,Draconic,Deep Speech,Infernal,Primordial,Sylvan,Undercommon";
                break;
        }
        list=list.split(',');
        let attribute = findObjs({
            _type: 'attribute',
            _characterid: charid
        }, {caseInsensitive: true});
        let count=0;
        let attrlist=[];
        if (type=="Tool") {
            _.each(attribute,function(attr) {
                let attrname = attr.get('_name');
                if (attrname.includes('repeating_tool') && attrname.includes('_toolname')) {
                    for (let i=0;i<list.length;i++) {
                        if (list[i]==attr.get('current')) {
                            attrlist[count]=list[i];
                            count+=1;
                        }
                    }
                }
            });
            for (let i=0;i<list.length;i++) {
                for (let j=0;j<attrlist.length;j++) {
                    if (list[i]==attrlist[j]) {
                        list[i]="";
                    }
                }
            }
            let test=false;
            for (let i=0;i<list.length;i++) {
                if (list[i].includes(state.down.now.train)) {
                    test=true;
                }
            }
            if (test==false) {
                state.down.now.train="";
            }
            list=String(list);
            for (let i=0;i<37;i++) {
                list=list.replace(",,",",");
            }
            list=list.split(',');
        } else {
            _.each(attribute,function(attr) {
                let attrname = attr.get('_name');
                if (attrname.includes('repeating_traits') && attrname.includes('_name')) {
                    for (let i=0;i<list.length;i++) {
                        if (list[i]==attr.get('current')) {
                            attrlist[count]=list[i];
                            count+=1;
                        }
                    }
                }
            });
            for (let i=0;i<list.length;i++) {
                for (let j=0;j<attrlist.length;j++) {
                    if (list[i]==attrlist[j]) {
                        list[i]="";
                    }
                }
            }
            let test=false;
            for (let i=0;i<list.length;i++) {
                if (list[i].includes(state.down.now.train)) {
                    test=true;
                }
            }
            if (test==false) {
                state.down.now.train="";
            }
            list=String(list);
            for (let i=0;i<38;i++) {
                list=list.replace(",,",",");
            }
            list=list.split(',');
        }
        let mintime=50;
        list=String(list);
        for (let i=0;i<38;i++) {
            list=list.replace(',','|');
        }
        let player = findObjs({
            _type: 'player',
            _id: msg.playerid
        })[0];
        let playerName = player.get('_displayname');
        char.get('gmnotes',function(gmnotes) {
            let time=gmnotes.replace(" Days","");
            if (Number(time)<mintime) {
                sendChat("Downtime","/w " + playerName + " You do not have enough time left to train.");
            } else {
                if (type=="Tool") {
                    sendChat("Downtime","/w " + playerName + " <div " + divstyle + ">" + //--
                        '<div ' + headstyle + '>Training</div>' + //--
                        '<div ' + substyle + '>Menu</div>' + //--
                        '<div ' + arrowstyle + '></div>' + //--
                        '<div style="text-align:center;">Tools</div>' + //--
                        '<table>' + //--
                        '<tr><td>Available Downtime: </td><td>' + gmnotes + '</td></tr>' + //--
                        '<tr><td>Needed Downtime: </td><td>' + mintime + ' Days</td></tr>' + //--
                        '</table>' + //--
                        '<td><tr>Current Tool: </td><td><a ' + astyle1 + '" href="!settrain --charid '+charid+' --type Tool --?{Tool?|' + list + '}">' + state.down.now.train + '</a></td></tr>' + //--
                        '<br><br>' + //--
                        '<div style="text-align:center;"><a ' + astyle2 + '" href="!train --charid '+charid+' --' + type + ' --' + state.down.now.train + '">Train now</a></div>' + //--
                        '</div>'
                    );
                } else {
                    sendChat("Downtime","/w " + playerName + " <div " + divstyle + ">" + //--
                        '<div ' + headstyle + '>Training</div>' + //--
                        '<div ' + substyle + '>Menu</div>' + //--
                        '<div ' + arrowstyle + '></div>' + //--
                        '<div style="text-align:center;">Languages</div>' + //--
                        '<br>' + //--
                        '<table>' + //--
                        '<tr><td>Available Downtime: </td><td>' + gmnotes + '</td></tr>' + //--
                        '<tr><td>Needed Downtime: </td><td>' + mintime + ' Days</td></tr>' + //--
                        '<td><tr>Current Tool: </td><td><a ' + astyle1 + '" href="!settrain --charid '+charid+' --type Language --?{Language?|' + list + '}">' + state.down.now.train + '</a></td></tr>' + //--
                        '</table>' + //--
                        '<br>' + //--
                        '<div style="text-align:center;"><a ' + astyle2 + '" href="!train --charid '+charid+' --' + type + ' --' + state.down.now.train + '">Train now</a></div>' + //--
                        '</div>'
                    );
                }
            }
        });
    },
    
    train = function(charid,type,name,msg) {
        charid=charid.replace("charid ","");
        type=type.replace("type ","");
        let char = findObjs({
            _type: 'character',
            _id: charid
        }, {caseInsensitive: true})[0];
        log(charid)
        let handnum=getHandoutNum(msg.playerid,charid);
        let pname = char.get("name");
        let cost=25*5;
        let gold=findObjs({
            _type: 'attribute',
            _characterid: charid,
            _name: 'gp'
        }, {caseInsensitive: true})[0];
        let cur=gold.get('current');
        if (cur<cost) {
            sendChat("Downtime","/w "+msg.who+" You do not have enough money to do that!");
        } else {
            cur-=cost;
            gold.set('current',cur);
            type=type.replace(" ","");
            if (type=="Tool") {
                let attributes = findObjs({
                    _type: 'attribute',
                    _characterid: charid
                });
                let count=0;
                _.each(attributes,function(attr) {
                    let attrname = attr.get('_name');
                    if (attrname.includes('repeating_tool') && attrname.includes('_toolname')) {
                        count+=1;
                    }
                });
                char.get('gmnotes',function(gmnotes) {
                    let num=Number(gmnotes.replace(' Days',''));
                    num-=50;
                    let notes=String(num)+" Days";
                    char.set('gmnotes',notes);
                });
                sendChat("Downtime",'!setattr --charid '+charid+' --repeating_tool_-CREATE_toolname|'+name);
                sendChat("Downtime",'!setattr --charid '+charid+' --repeating_tool_$'+count+'_toolattr|QUERY');
            } else {
                char.get('gmnotes',function(gmnotes) {
                    let num=Number(gmnotes.replace(' Days',''));
                    num-=50;
                    let notes=String(num)+" Days";
                    char.set('gmnotes',notes);
                });
                sendChat("Downtime",'!setattr --charid '+charid+' --repeating_proficiencies_-CREATE_name|'+name);
            }
        }
        let desc="<br><br>"+pname+" spends 50 Days and "+cost+" GP training with "+name+".";
        setHandoutDesc(msg.playerid,handnum,desc);
        sendChat("Downtime","/w "+msg.who+" You successfully gained proficiency with "+name);
    },
    
    researchmenu = function(charid,price,msg) {
        var divstyle = 'style="width: 220px; border: 1px solid black; background-color: #ffffff; padding: 5px;"';
        var astyle1 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 100px;';
        var astyle2 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 150px;';
        var tablestyle = 'style="text-align:center;"';
        var arrowstyle = 'style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid rgb(126, 45, 64); margin-bottom: 2px; margin-top: 2px;"';
        var headstyle = 'style="color: rgb(126, 45, 64); font-size: 18px; text-align: left; font-variant: small-caps; font-family: Times, serif;"';
        var substyle = 'style="font-size: 11px; line-height: 13px; margin-top: -3px; font-style: italic;"';
        let neededtime=5;
        charid=charid.replace('charid ','');
        let char = findObjs({
            _type: 'character',
            _id: charid
        })[0];
        price=price.replace("price ","");
        let amount=Number(price);
        let base=50;
        if (!amount) {
            amount=base;
        } else {
            if (amount<base) {
                amount=base;
            } else {
                amount+=base;
            }
        }
        let gold = findObjs({
            _type: 'attribute',
            _characterid: charid,
            _name: 'gp'
        }, {caseInsensitive: true})[0];
        char.get('gmnotes',function(gmnotes) {
            let time=Number(String(gmnotes.replace(" Day","")).replace("s",""));
            if (time<neededtime) {
                sendChat("Downtime","/w "+msg.who+" You do not have enough time to do that!")
            } else {
                let cur=gold.get('current');
                if (cur<amount) {
                    sendChat("Downtime","/w "+msg.who+" You do not have enough money to do that!");
                } else {
                    sendChat("Downtime","/w " + msg.who + " <div " + divstyle + ">" + //--
                        '<div ' + headstyle + '>Research</div>' + //--
                        '<div ' + substyle + '>Menu</div>' + //--
                        '<div ' + arrowstyle + '></div>' + //--
                        '<table>' + //--
                        '<tr><td>Needed Time: </td><td>' + neededtime + ' Days</td></tr>' + //--
                        '<tr><td>GP spent: </td><td><a ' + astyle1 + '" href="!researchmenu --charid ' + charid + ' --price ?{Amount?|50}">' + amount + ' GP</a></td></tr>' + //--
                        '</table>' + //--
                        '<div style="text-align:center;"><a ' + astyle2 + '" href="!research --charid ' + charid + ' --price ' + amount + '">Research</a></div>' + //--
                        '</div>'
                    );
                }
            }
        });
    },
    
    research = function(charid,gp,msg) {
        charid=charid.replace("charid ","");
        gp=Number(gp.replace("price ",""));
        let bonus=0;
        let base=50;
        if (gp<base*2) {
            bonus=1;
        } else if (gp<base*3) {
            bonus=2;
        } else if (gp<base*4) {
            bonus=3;
        } else if (gp<base*5) {
            bonus=4;
        } else if (gp<base*6) {
            bonus=5;
        } else if (gp>=base*6) {
            bonus=6;
        }
        let char = findObjs({
            _type: 'character',
            _id: charid
        })[0];
        let gold=findObjs({
            _type: 'attribute',
            _characterid: charid,
            _name: 'gp'
        }, {caseInsensitive: true})[0];
        let cur=gold.get('current');
        cur-=gp;
        gold.set('current',cur);
        char.get("gmnotes",function(gmnotes){
            let time=Number(String(gmnotes.replace(' Day','')).replace('s',''));
            time-=5;
            let notes="";
            if (time>0) {
                if (time==1) {
                    notes=String(time)+" Day";
                } else {
                    notes=String(time)+" Days";
                }
            }
            char.set("gmnotes",notes);
        });
        let rand=randomInteger(20)+bonus;
        let desc;
        if (rand<=5) {
            desc="<br><br>"+char.get('name')+" spends 7 days and "+gp+" GP researching in the library but doesn\'t learn anything important.";
            sendChat("Downtime","/w "+msg.who+" You do not discover any important Information");
        } else if (rand<=10) {
            desc="<br><br>"+char.get('name')+" spends 7 days and "+gp+" GP researching in the library and learns one piece of lore.";
            sendChat("Downtime","/w gm "+char.get('name')+"learns one piece of lore.");
            sendChat("Downtime","/w "+msg.who+" You learn one piece of lore.");
        } else if (rand<=20) {
            desc="<br><br>"+char.get('name')+" spends 7 days and "+gp+" GP researching in the library and learns two pieces of lore.";
            sendChat("Downtime","/w gm "+char.get('name')+"learns two pieces of lore.");
            sendChat("Downtime","/w "+msg.who+" You learn two pieces of lore.");
        } else if (rand>20) {
            desc="<br><br>"+char.get('name')+" spends 7 days and "+gp+" GP researching in the library and learns three pieces of lore.";
            sendChat("Downtime","/w gm "+char.get('name')+"learns three pieces of lore.");
            sendChat("Downtime","/w "+msg.who+" You learn three pieces of lore.");
        }
        let handnum=getHandoutNum(msg.playerid,charid);
        setHandoutDesc(msg.playerid,handnum,desc);
    },
    
    gamblemenu = function(charid,amount,msg) {
        var divstyle = 'style="width: 220px; border: 1px solid black; background-color: #ffffff; padding: 5px;"';
        var astyle1 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 100px;';
        var astyle2 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 150px;';
        var tablestyle = 'style="text-align:center;"';
        var arrowstyle = 'style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid rgb(126, 45, 64); margin-bottom: 2px; margin-top: 2px;"';
        var headstyle = 'style="color: rgb(126, 45, 64); font-size: 18px; text-align: left; font-variant: small-caps; font-family: Times, serif;"';
        var substyle = 'style="font-size: 11px; line-height: 13px; margin-top: -3px; font-style: italic;"';
        let neededtime=5;
        let minprice=state.down.now.minprice;
        let maxprice=state.down.now.maxprice;
        charid=charid.replace('charid ','');
        amount=Number(amount.replace("amount ",""));
        if (amount<minprice) {
            sendChat("Downtime","/w " + msg.who + " You must bet at least "+minprice+" GP!");
            amount=minprice;
        } else if (amount>maxprice) {
            sendChat("Downtime","/w " + msg.who + " The maximum amount you can bet is "+maxprice+" GP!");
            amount=maxprice;
        }
        let char=findObjs({
            _type: 'character',
            _id: charid
        })[0];
        let gold=findObjs({
            _type: 'attribute',
            _characterid: charid,
            _name: 'gp'
        }, {caseInsensitive: true})[0];
        char.get("gmnotes",function(gmnotes) {
            let time=Number(String(gmnotes.replace(" Day","")).replace("s",""));
            if (time<5) {
                sendChat("Downtime","/w "+msg.who+" You do not have enough time to do that!");
            } else {
                let cur=gold.get('current');
                if (cur<amount) {
                    sendChat("Downtime","/w "+msg.who+" You do not have enough money!");
                } else {
                    sendChat("Downtime","/w " + msg.who + " <div " + divstyle + ">" + //--
                        '<div ' + headstyle + '>Gamble</div>' + //--
                        '<div ' + substyle + '>Menu</div>' + //--
                        '<div ' + arrowstyle + '></div>' + //--
                        '<table>' + //--
                        '<tr><td>Needed Time: </td><td>5 Days</td></tr>' + //--
                        '<tr><td>Minimum Bet: </td><td>' + minprice + ' GP</td></tr>' + //--
                        '<tr><td>Maximum Bet: </td><td>' + maxprice + ' GP</td></tr>' + //--
                        '<tr><td>Current Bet: </td><td><a ' + astyle1 + '" href="!gamblemenu --charid ' + charid + ' --amount ?{Amount?|10}">' + amount + '</a></td></tr>' + //--
                        '</table>' + //--
                        '<br>' + //--
                        '<div style="text-align:center;"><a ' + astyle2 + '" href="!gamble --charid ' + charid + ' --amount ' + amount + '">Start Gambling</a></div>' + //--
                        '</div>'
                    );
                }
            }
        });
    },
    
    gamble = function(charid,amount,msg) {
        charid=charid.replace("charid ","");
        amount=Number(amount.replace("amount ",""));
        let char=findObjs({
            _type: 'character',
            _id: charid
        })[0];
        let gold=findObjs({
            _type: 'attribute',
            _characterid: charid,
            _name: 'gp'
        }, {caseInsensitive: true})[0];
        let cur=gold.get('current');
        char.get("gmnotes",function(gmnotes) {
            let time=Number(String(gmnotes.replace(" Day","")).replace("s",""));
            time-=5;
            let notes;
            if (time>0) {
                if (time==1) {
                    notes=String(time)+" Day";
                } else {
                    notes=String(time)+" Days";
                }
            }
            char.set("gmnotes",notes);
        });
        let dc1=5+randomInteger(10)+randomInteger(10);
        let dc2=5+randomInteger(10)+randomInteger(10);
        let dc3=5+randomInteger(10)+randomInteger(10);
        let check1=randomInteger(20)+getAttrByName(charid,"insight_bonus");
        let check2=randomInteger(20)+getAttrByName(charid,"deception_bonus");
        let check3=randomInteger(20)+getAttrByName(charid,"intimidation_bonus");
        let pass=0;
        if (check1>=dc1) {
            pass+=1;
        }
        if (check2>=dc2) {
            pass+=1;
        }
        if (check3>=dc3) {
            pass+=1;
        }
        let desc;
        if (pass==0) {
            desc="<br><br>"+char.get('name')+" spends 5 days gambling and places a bet of "+amount+" GP. They lose all the money they bet and accrue a debt of "+amount+" GP!";
            cur-=(amount*2);
            gold.set('current',cur);
            sendChat("Downtime","/w "+msg.who+" You place a bet of "+amount+" GP but lose it all and accrue a debt of "+amount+" GP.");
        } else if (pass==1) {
            desc="<br><br>"+char.get('name')+" spends 5 days gambling and places a bet of "+amount+" GP. They lose half the amount they bet.";
            cur-=(amount/2);
            gold.set('current',cur);
            sendChat("Downtime","/w "+msg.who+" You place a bet of "+amount+" GP but lose half of it.");
        } else if (pass==2) {
            desc="<br><br>"+char.get('name')+" spends 5 days gambling and places a bet of "+amount+" GP. They win 1.5 times the bet amount.";
            cur+=(amount/2);
            gold.set('current',cur);
            sendChat("Downtime","/w "+msg.who+" You place a bet of "+amount+" GP and win 1.5 times the bet amount.");
        } else if (pass==3) {
            desc="<br><br>"+char.get('name')+" spends 5 days gambling and places a bet of "+amount+" GP. They win twice the amount they bet.";
            cur+=(amount);
            gold.set('current',cur);
            sendChat("Downtime","/w "+msg.who+" You place a bet of "+amount+" GP and win twice the bet.");
        }
        let handnum=getHandoutNum(msg.playerid,charid);
        setHandoutDesc(msg.playerid,handnum,desc);
    },
    
    checkInstall = function() {
        if (!state.down) {
            setDefaults();
        }
        if (state.List) {
            setItemList();
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
on('ready', function(){
    Downtime.CheckInstall();
    Downtime.RegisterEventHandlers();
});
