//if (MarkStart) {MarkStart('DifficultyRating');}
/* 
* Difficulty Rating - 5e Encounter Calculator
* by Michael Greene (Volt Cruelerz)
*
*/

on('ready', () => {
    const drname = 'Difficulty Rating';

    // Initialize the state
    const ConfigureState = () => {
        const version = 1.03;
        if (!state.DifficultyRating) {
            state.DifficultyRating = {
                Party: [],
                NPCChallengeField: 'npc_challenge',
                IsNPCField: 'npc',
                Sheet: 'STARTUP',
                Version: version
            };
        }
        if (!state.DifficultyRating.Version || state.DifficultyRating.Version < 1.03) {
            log('Upgrading Difficulty Rating to ' + version);
            state.DifficultyRating.Sheet = 'STARTUP';
            state.DifficultyRating.Version = version;
        }
    }; ConfigureState();

    // Check for initial startup
    if (state.DifficultyRating.Sheet === 'STARTUP') {
        log('Startup of Difficulty Rating.  Prompting user for mode configuration.');
        sendChat(drname, `/w gm [Set Difficulty Rating Mode](!dr --setMode ?{Select a mode|OGL|5e-Shaped})`);
    }

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
            log('No Attr: ' + char + ': ' + attrName);
            return null;
        }
        return attr;
    };

    const getAttr = (char, attrName) => {
        let attr = getAttrs(char, attrName);
        if (!attr) {
            return null;
        }
        return attr[0];
    };

    const getAttrsFromSub = (char, substringName) => {
        const attr = filterObjs((obj) => {
            if (obj.get('type') === 'attribute'
                && obj.get('characterid') === char.id
                && obj.get('name').indexOf(substringName) !== -1) {
                    return obj;
            }
        });
        if (!attr || attr.length === 0) {
            log('No Substr Attr: ' + char + ': ' + substringName);
            return null;
        }
        return attr;
    };

    const getAttrFromSub = (char, substringName) => {
        return getAttrsFromSub(char, substringName)[0];
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

    class MonsterType {
        constructor(name, cr) {
            this.Name = name;
            this.CR = cr;
            this.Count = 1;
        }
    }

    const Ratings = {
        Trivial: `This encounter should pose no threat to the party, but may delay them if they opt to not expend resources.`,
        Easy: `An easy encounter doesn't tax the characters' resources or put them in serious peril.  They might lose a few hit points, but victory is pretty much guaranteed.`,
        Medium: `A medium encounter usually has one or two scary moments for the players, but the characters should emerge victorius with no casualties.  One or more of them might need to use healing resources.`,
        Hard: `A hard encounter could go badly for the adventurers.  Weaker characters might get taken out of the fight, and there's a slim chance that one or more characters might die.`,
        Deadly: `A deadly encounter could be lethal for one or more player characters.  Survival often requires good tactics and quick thinking, and the party risks defeat.`
    };

    // Converts level-1 to [easy, medium, hard, deadly] exp thresholds
    const XPThresholds = [
        [25, 50, 75, 100],
        [50, 100, 150, 200],
        [75, 150, 225, 400],
        [125, 250, 375, 500],
        [250, 500, 750, 1100],
        [300, 600, 900, 1400],
        [350, 750, 1100, 1700],
        [450, 900, 1400, 2100],
        [550, 1100, 1600, 2400],
        [600, 1200, 1900, 2800],
        [800, 1600, 2400, 3600],
        [1000, 2000, 3000, 4500],
        [1100, 2200, 3400, 5100],
        [1250, 2500, 3800, 5700],
        [1400, 2800, 4300, 6400],
        [1600, 3200, 4800, 7200],
        [2000, 3900, 5900, 8800],
        [2100, 4200, 6300, 9500],
        [2400, 4900, 7300, 10900],
        [2800, 5700, 8500, 12700]
    ];

    const CRToExp = {};
    const BuildCRToExp = () => {
        CRToExp[0] = 10;
        CRToExp[1/8] = 25;
        CRToExp[1/4] = 50;
        CRToExp[1/2] = 100;
        CRToExp[1] = 200;
        CRToExp[2] = 450;
        CRToExp[3] = 700;
        CRToExp[4] = 1100;
        CRToExp[5] = 1800;
        CRToExp[6] = 2300;
        CRToExp[7] = 2900;
        CRToExp[8] = 3900;
        CRToExp[9] = 5000;
        CRToExp[10] = 5900;
        CRToExp[11] = 7200;
        CRToExp[12] = 8400;
        CRToExp[13] = 10000;
        CRToExp[14] = 11500;
        CRToExp[15] = 13000;
        CRToExp[16] = 15000;
        CRToExp[17] = 18000;
        CRToExp[18] = 20000;
        CRToExp[19] = 22000;
        CRToExp[20] = 25000;
        CRToExp[21] = 33000;
        CRToExp[22] = 41000;
        CRToExp[23] = 50000;
        CRToExp[24] = 62000;
        CRToExp[25] = 75000;
        CRToExp[26] = 90000;
        CRToExp[27] = 105000;
        CRToExp[28] = 115000;
        CRToExp[29] = 135000;
        CRToExp[30] = 155000;
    }; BuildCRToExp();

    class CountMultiplier {
        constructor(min, max, mult) {
            this.Min = min;
            this.Max = max;
            this.Mult = mult;
        }
    }

    const CountMultipliers = [
        new CountMultiplier(0, 0, 0.5),// This is just for shifting due to party size.
        new CountMultiplier(1, 1, 1),
        new CountMultiplier(2, 2, 1.5),
        new CountMultiplier(3, 6, 2),
        new CountMultiplier(7, 10, 2.5),
        new CountMultiplier(11, 14, 3),
        new CountMultiplier(15, 999999999, 4),
        new CountMultiplier(999999999, 999999999, 4),// This is not in the DMG and is just for shifting due to party size
    ];

    const GetCountMultiplier = (heroCount, monsterCount) => {
        let multIndex = -1;

        // Start at 1 because 0 is only shifted to due to party size.
        for (let i = 1; i < CountMultipliers.length; i++) {
            let mult = CountMultipliers[i];
            if (mult.Min <= monsterCount && mult.Max >= monsterCount) {
                multIndex = i;
                break;
            }
        }

        if (heroCount < 3) {
            return CountMultipliers[multIndex+1].Mult;
        } else if (heroCount > 5) {
            return CountMultipliers[multIndex-1].Mult;
        } else {
            return CountMultipliers[multIndex].Mult;
        }
    };

    const DailyExp = [
        300,
        600,
        1200,
        1700,
        3500,
        4000,
        5000,
        6000,
        7500,
        9000,
        10500,
        11500,
        13500,
        15000,
        18000,
        20000,
        25000,
        27000,
        30000,
        40000
    ];

    class Player {
        constructor(name, level) {
            this.Name = name;
            this.Level = level;
        }
    }

    const GetPartyThresholds = () => {
        let easy = 0;
        let medium = 0;
        let hard = 0;
        let deadly = 0;
        state.DifficultyRating.Party.forEach((player) => {
            const level = player.Level;
            const expTier = XPThresholds[level-1];
            easy += expTier[0];
            medium += expTier[1];
            hard += expTier[2];
            deadly += expTier[3];
        });
        return [easy, medium, hard, deadly];
    }

    const GetDailyExp = () => {
        let total = 0;
        state.DifficultyRating.Party.forEach((player) => {
            const level = player.Level;
            total += DailyExp[level-1];
        });
        return total;
    }

    const GetRollTemplate = () => {   
        let rt = '';
        if (state.DifficultyRating.Sheet === 'OGL') {
            rt = ['desc', 'desc'];
        } else if (state.DifficultyRating.Sheet === '5E-Shaped') {
            rt = ['5e-shaped', 'text'];
        } else if (state.DifficultyRating.Sheet === 'STARTUP') {
            log('Warning: Attempted to print from Difficulty Rating while still in STARTUP mode.');
            return ['',''];
        } else {
            rt = ['default', `name=${drname} }}{{note`];
        }
        return rt;
    }

    const PrintStatus = () => {
        const rt = GetRollTemplate();
        let status = `/w gm &{template:${rt[0]}} {{${rt[1]}=<h3>Difficulty Rating</h3><hr>`;
        status += `<div align="left" style="margin-left: 7px;margin-right: 7px">`;
        
        // Add player list
        if (state.DifficultyRating.Party.length > 0) {
            status += `<h4>Party (${state.DifficultyRating.Party.length})</h4>`;
            status += '<ul>';
            state.DifficultyRating.Party.forEach((player) => {
                status += `<li>${player.Name} - ${player.Level}<br/>`
                + `[Level](!dr --setLevel ?{Please input the new player level} ^${player.Name}^)</li>`
                + `[Remove](!dr --removePlayer ^${player.Name}^)</li>`;
            });
            status += '</ul>';
        }
        status += `<h4>Tools</h4>`;
        status += `[Set Mode](!dr --setMode ?{Select a mode|OGL|5e-Shaped})<br/>`;
        status += '[Add Player](!dr --addPlayer ?{Please enter the total level of the player} ^?{please enter the name of the player}^)<br/>';
        status += `[Calculate Selected](!dr --calculate)<br/>`;

        status += `</div>}}`;
        sendChat(drname, status);
    };

    on('chat:message', (msg) => {
        if (msg.type !== 'api') return;
        if (!msg.content.startsWith('!encounters5e') && !msg.content.startsWith('!dr')) return;

        // Print main menu
        if (msg.content === '!dr' || msg.content === '!dr --help') {
            PrintStatus();
            return;
        }
        
        let strTokens = msg.content.split(' ');
        if (strTokens.length < 2) return;

        // Process command
        const command = strTokens[1];

        if (command === '--setMode') {
            log('Setting Mode');
            if (strTokens.length < 3) return;
            const mode = strTokens[2];
            log('New Mode: ' + mode);
            if (mode === 'OGL') {
                state.DifficultyRating.IsNPCField = 'npc';
                state.DifficultyRating.NPCChallengeField = 'npc_challenge';
                state.DifficultyRating.Sheet = 'OGL';
                sendChat(drname, 'OGL Mode Activated.');
            } else if (mode === '5e-Shaped') {
                state.DifficultyRating.IsNPCField = 'is_npc';
                state.DifficultyRating.NPCChallengeField = 'challenge';
                state.DifficultyRating.Sheet = '5e-Shaped';
                sendChat(drname, '5e-Shaped Mode Activated.');
            }
        }
        // Add a new player
        else if (command === '--addPlayer') {
            if (strTokens.length < 4) return;
            const level = parseInt(strTokens[2]) || 0;
            const name = Decaret(msg.content);
            if (!name || name.length === 0) {
                sendChat(drname, 'Name was empty.');
                return;
            }
            state.DifficultyRating.Party.push(new Player(name, level));
            PrintStatus();
        }
        // Remove existing player 
        else if (command === '--removePlayer') {
            const charName = Decaret(msg.content);
            for (let i = 0; i < state.DifficultyRating.Party.length; i++) {
                const player = state.DifficultyRating.Party[i];
                if (player.Name === charName) {
                    state.DifficultyRating.Party.splice(i, 1);
                    break;
                }
            }
            PrintStatus();
        }
        else if (command === '--setLevel') {
            if (strTokens.length < 4) return;
            const level = parseInt(strTokens[2]) || 0;
            const charName = Decaret(msg.content);
            for (let i = 0; i < state.DifficultyRating.Party.length; i++) {
                const player = state.DifficultyRating.Party[i];
                if (player.Name === charName) {
                    player.Level = level;
                    break;
                }
            }
            PrintStatus();
        }
        // Remove all players (debug tool)
        else if (command === '--purgeParty') {
            state.DifficultyRating.Party = [];
            PrintStatus();
        }
        // Calculate difficulty rating of selected monsters
        else if (command === '--calculate') {
            const monsters = {};
            let monsterCount = 0;
            if (!msg.selected) {
                sendChat(drname, '/w gm No tokens were selected.');
                return;
            }
            msg.selected.forEach((selection) => {
                let token = getObj('graphic', selection._id);

                // Attempt to load from cache
                let type = token.get('represents');
                let existingEntry = monsters[type];

                // If it already exists, just increment the counter
                if (existingEntry) {
                    existingEntry.Count++;
                    monsterCount++;
                } else {
                    // Generate a new cache entry
                    let name = token.get('name');
                    let char = getCharByAny(type);
                    const npcAttr = getAttr(char, state.DifficultyRating.IsNPCField);
                    // Make sure it's actually an NPC
                    if (npcAttr && npcAttr.get('current')) {
                        let cr = parseInt(getAttr(char, state.DifficultyRating.NPCChallengeField).get('current')) || 0;
                        existingEntry = new MonsterType(name, cr);
                        monsters[type] = existingEntry;
                        monsterCount++;
                    } else {
                        log('Warning! Non-npc selected for encounter difficulty: ' + name);
                    }
                }
            });

            // Get the multiplier based on numbers of participants
            const mult = GetCountMultiplier(state.DifficultyRating.Party.length, monsterCount);
            const thresholds = GetPartyThresholds();
            let expTotal = 0;
            for (let type in monsters) {
                // check if the property/key is defined in the object itself, not in parent
                if (monsters.hasOwnProperty(type)) {
                    const monster = monsters[type];
                    expTotal += CRToExp[monster.CR] * monster.Count;
                }
            }
            const adjustedExp = mult * expTotal;
            let highestDifficulty = 'Trivial';
            let difficultyDesc = Ratings.Trivial;
            for (let i = 0; i < thresholds.length; i++) {
                if (adjustedExp > thresholds[i]) {
                    if (i === 0) {
                        difficultyDesc = Ratings.Easy;
                        highestDifficulty = 'Easy';
                    } else if (i === 1) {
                        difficultyDesc = Ratings.Medium;
                        highestDifficulty = 'Medium';
                    } else if (i === 2) {
                        difficultyDesc = Ratings.Hard;
                        highestDifficulty = 'Hard';
                    } else if (i === 3) {
                        difficultyDesc = Ratings.Deadly;
                        highestDifficulty = 'Deadly';
                    }
                }
            }
            
            const rt = GetRollTemplate();
            let status = `/w gm &{template:${rt[0]}} {{${rt[1]}=<h3>Difficulty Rating</h3><hr>`
            + `<div align="left" style="margin-left: 7px;margin-right: 7px">`
            + `<h4>${highestDifficulty}</h4>`
                + `${difficultyDesc}<br/><br/>`
            + `<h4>Experience</h4>`
                + `<b>Raw Exp</b>: ${expTotal}<br/>`
                + `<b>Adjusted Exp</b>: ${adjustedExp}<br/>`
                + `<b>Per Player Exp</b>: ${(expTotal/state.DifficultyRating.Party.length).toFixed(0)}<br/>`
                + `<b>Daily Budget</b>: ${(100*adjustedExp/GetDailyExp()).toFixed(2)}%<br/>`
                + `<b>Other Thresholds</b>`
                + `<ul>`
                    + `<li>Easy: ${thresholds[0]}</li>`
                    + `<li>Medium: ${thresholds[1]}</li>`
                    + `<li>Hard: ${thresholds[2]}</li>`
                    + `<li>Deadly: ${thresholds[3]}</li>`
                + `</ul><br/>`;

            // Add player level list
            if (state.DifficultyRating.Party.length > 0) {
                status += `<h4>Party (${state.DifficultyRating.Party.length})</h4>`;
                status += '<ul>';
                state.DifficultyRating.Party.forEach((player) => {
                    status += `<li>${player.Name} - ${player.Level}</li>`;
                });
                status += '</ul><br/>';
            }

            if (monsterCount > 0) {
                status += `<h4>Monsters (${monsterCount})</h4>`;
                status += '<ul>';
                for (let type in monsters) {
                    // check if the property/key is defined in the object itself, not in parent
                    if (monsters.hasOwnProperty(type)) {
                        const monster = monsters[type];
                        status += `<li>${monster.Count}x ${monster.Name}: CR${monster.CR}</li>`;
                    }
                }
                status += '</ul>';
            }

            status += `</div>}}`;
            sendChat(drname, status);
        }
    });

    log(`-=> Difficulty Rating online. <=-`);
});
//if (MarkStop) {MarkStop('DifficultyRating');}
