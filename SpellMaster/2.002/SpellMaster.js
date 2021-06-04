if (typeof MarkStart != 'undefined') {MarkStart('SpellMaster');}

// SpellMaster - 5e OGL Sheet Spell Manager
// By: Michael G. (Volt Cruelerz)
// Github: https://github.com/VoltCruelerz/SpellMaster

const SpellDict = {};

const SpellMasterInstall = () => {
    const defaultSettings = {
        Sheet: 'OGL',
        Version: 2.001
    };
    if(!state.SpellMaster) {
        state.SpellMaster = defaultSettings;
    }

    // Update version
    let BookDict = state.SpellMaster;
    for (var bookName in BookDict) {
        // check if the property/key is defined in the object itself, not in parent
        if (BookDict.hasOwnProperty(bookName)) {
            const spellBook = BookDict[bookName];

            // Version 1.3 -> 1.4: add Filter.CastTime
            if (state.SpellMaster.Version < 1.4) {
                if (spellBook.Filter) {
                    if (!spellBook.Filter.CastTime) {
                        spellBook.Filter.CastTime = 'Any';
                        log(`Migrating Spellbook ${spellBook.Name} to version 1.4`);
                    }
                }
            }
            // Version 1.5 -> 1.7: add sorcery points
            if (state.SpellMaster.Version < 1.7) {
                spellBook.CurSorc = spellBook.CurSorc || 0;
                spellBook.MaxSorc = spellBook.MaxSorc || 0;
                log(`Migrating Spellbook ${spellBook.Name} to version 1.7`);
            }
            // Version 1.9 -> 1.10: add items
            if (state.SpellMaster.Version < 2.000) {
                spellBook.Items = [];
                log(`Migrating Spellbook ${spellBook.Name} to version 2.000`);
            }
        }
    }
    // Update Version Number in State
    if (!state.SpellMaster.Version || state.SpellMaster.Version < defaultSettings.Version) {
        state.SpellMaster.Version = defaultSettings.Version;
    }
}
SpellMasterInstall();

on('ready', () => {
    let SpellList = [];
    if (typeof CustomSpellList !== 'undefined') {
        log('SpellMaster: Loading Custom Spell List');
        SpellList = CustomSpellList;
    } else if (typeof SrdSpellList !== 'undefined') {
        log('SpellMaster: Loading SRD Spell List');
        SpellList = SrdSpellList;
    } else {
        const fatalMsg = 'SpellMaster Fatal Error: SRD.js is not installed!  Please install SRD.js or a custom spellbook file.';
        log(fatalMsg);
        sendChat('SpellMaster Boot', fatalMsg);
        throw new Error(fatalMsg);
    }

    const chatTrigger = '!SpellMaster';// This is the trigger that makes the script listen
    const scname = 'SpellMaster';// How this script shows up when it sends chat messages
    const maxSpellLevel = 10;// My campaign has a few NPCs with 10th-level magic
    let debugLog = false;

    // Debug Log
    const dlog = (str) => {
        if (debugLog) {
            log(str);
        }
    };

    const dStringify = (str, obj) => {
        if (debugLog) {
            log(str + JSON.stringify(obj));
        }
    };

    // Fatal Log
    const flog = (str, errorCode) => {
        log('SPELL MASTER FATAL ERROR CODE ' + errorCode + ' = ' + str);
        log('DUMPING STATE.SPELLMASTER');
        log(JSON.stringify(state.SpellMaster));
    };
    
    // Alias state so we don't accidentally break it.
    let BookDict = state.SpellMaster;
    let SpellsIndexed = false;

    // A cache of data so not everything is recreated every time the page is drawn.
    const Cache = {
        Books: {},
        Exports: {}
    };

    // Creates dictionary of spells
    const IndexSpellbook = () => {
        for(let i = 0; i < SpellList.length; i++){
            let spell = SpellList[i];
            SpellDict[spell.Name] = spell;
        }
        SpellsIndexed = true;
    };
    IndexSpellbook();
    log("Spell List Indexed with " + SpellList.length + " spells.");
    if (debugLog) {
        sendChat(scname, '/w gm Spellbook Indexed with ' + SpellList.length + ' spells.');
    }

    // Retrieves a handout by name
    const GetHandout = (nameOrId) => {
        let list = findObjs({
            _type: 'handout',
            name: nameOrId,
        });
        if (list.length === 1) {
            return list[0];
        }

        list = findObjs({
            _type: 'handout',
            id: nameOrId
        });
        if (list.length === 1) {
            return list[0];
        }
    };

    // Retrieves a character by name or id
    const GetCharByAny = (nameOrId) => {
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

    // Get attribute from char sheet.  Should usually use GetCachedAttr()
    const getattr = (charId, att) => {
        const attr = findObjs({
            type: 'attribute',
            characterid: charId,
            name: att,
        })[0];
        if (attr) {
            return attr.get('current');
        }
        return '';
    };

    // Retrieves the value stored in the parameter with the provided name
    const GetParamValue = (argParams, paramName) => {
        const id = GetParamId(argParams, paramName);
        if(id === -1){
            return null;
        }
        return Decaret(argParams[id]);
    };

    // Retrieves the index in the array of params for the specified parameter
    const GetParamId = (argParams, paramName) => {
        for(let i = 0; i < argParams.length; i++){
            let arg = argParams[i];
            const argWords = arg.split(/\s+/);
            if(argWords[0] == paramName){
                return i;
            }
        }
        return -1;
    };

    // Pulls the interior message out of carets (^)
    const Decaret = (quotedString) => {
        const startQuote = quotedString.indexOf('^');
        const endQuote = quotedString.lastIndexOf('^');
        if (startQuote >= endQuote) {
            sendToGmAndPlayer(`**ERROR:** You must have a string within carets in the phrase ${string}`);
            return null;
        }
        return quotedString.substring(startQuote + 1, endQuote);
    };

    // Calculates Damerau-Levenshtein distance.  See: https://stackoverflow.com/a/11958496
    const levDist = (s, t) => {
        var d = []; //2d matrix
    
        // Step 1
        var n = s.length;
        var m = t.length;
    
        if (n == 0) return m;
        if (m == 0) return n;
    
        //Create an array of arrays in javascript (a descending loop is quicker)
        for (var i = n; i >= 0; i--) d[i] = [];
    
        // Step 2
        for (var i = n; i >= 0; i--) d[i][0] = i;
        for (var j = m; j >= 0; j--) d[0][j] = j;
    
        // Step 3
        for (var i = 1; i <= n; i++) {
            var s_i = s.charAt(i - 1);
    
            // Step 4
            for (var j = 1; j <= m; j++) {
    
                //Check the jagged ld total so far
                if (i == j && d[i][j] > 4) return n;
    
                var t_j = t.charAt(j - 1);
                var cost = (s_i == t_j) ? 0 : 1; // Step 5
    
                //Calculate the minimum
                var mi = d[i - 1][j] + 1;
                var b = d[i][j - 1] + 1;
                var c = d[i - 1][j - 1] + cost;
    
                if (b < mi) mi = b;
                if (c < mi) mi = c;
    
                d[i][j] = mi; // Step 6
    
                //Damerau transposition
                if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
                    d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
                }
            }
        }
    
        // Step 7
        return d[n][m];
    }

    /**
     * Calculate the Damerau-Levenshtein distance to get a list of spell suggestions, which are then printed.
     * @param input string - the failed spell name to calculate suggestions for
     * @param inputMessage Object - the source message
     */
    const printSpellSuggestions = (input, inputMessage) => {
        const suggestions = SpellList.map((spell) => {
            return {
                Name: spell.Name,
                Distance: levDist(input, spell.Name)
            };
        });

        suggestions.sort(Sorters.DistanceMin);
        const topSuggestions = [];

        // Print the top suggestions.
        const maxSuggestions = 5;
        for(let i = 0; i < maxSuggestions; i++) {
            topSuggestions.push(suggestions[i].Name);
        }

        // Also add any substrings (Magic Aura vs Nystul's Magic Aura)
        SpellList.forEach((spell) => {
            if ((input.includes(spell.Name) || spell.Name.includes(input)) && !topSuggestions.includes(spell.Name)) {
                topSuggestions.push(spell.Name);
            }
        });

        let message = `The spell ${input} does not exist in our records.  Did you mean one of these?`;
        topSuggestions.forEach((suggestion) => {
            message += `<br/>- ${suggestion}`;
        });
        sendToGmAndPlayer(inputMessage, message);
    }
    
    // Enum of caster types
    const CasterMode = {
        Invalid: 0,
        Full: 1,
        Half: 2,
        Third: 3,
        Pact: 4,
        None: 5
    };

    // The multipliers for caster modes
    const CasterModeMultiplier = {};

    // A dictionary of caster types
    const CasterTypeMap = {};

    // Map full text names to abbreviations, so Intelligence => INT.
    const StatMap = {};

    // Map class name to stat ie Druid => WIS
    const ClassToStatMap = {};

    // The cost of composing sorcery points into spell slots
    const SlotComposeCost = {}

    // Perform initial configuration for caster type mappings
    const BuildMaps = () => {
        CasterModeMultiplier[CasterMode.Full] = 1;
        CasterModeMultiplier[CasterMode.Half] = 1/2;
        CasterModeMultiplier[CasterMode.Third] = 1/3;
        CasterModeMultiplier[CasterMode.None] = 0;
        CasterModeMultiplier[CasterMode.Invalid] = 0;
        CasterModeMultiplier[CasterMode.Pact] = 1;

        CasterTypeMap['Artificer'] = CasterMode.Full;
        CasterTypeMap['Barbarian'] = CasterMode.None;
        CasterTypeMap['Bard'] = CasterMode.Full;
        CasterTypeMap['Cleric'] = CasterMode.Full;
        CasterTypeMap['Druid'] = CasterMode.Full;
        CasterTypeMap['Fighter:Eldritch Knight'] = CasterMode.Third;
        CasterTypeMap['Monk'] = CasterMode.None;
        CasterTypeMap['Paladin'] = CasterMode.Half;
        CasterTypeMap['Ranger'] = CasterMode.Half;
        CasterTypeMap['Rogue:Arcane Trickster'] = CasterMode.Third;
        CasterTypeMap['Shaman'] = CasterMode.Full;
        CasterTypeMap['Sorcerer'] = CasterMode.Full;
        CasterTypeMap['Warlock'] = CasterMode.Pact;
        CasterTypeMap['Wizard'] = CasterMode.Full;
        CasterTypeMap[null] = CasterMode.None;
        CasterTypeMap['undefined'] = CasterMode.None;
        CasterTypeMap['SRD'] = CasterMode.Full;

        StatMap['Strength'] = 'STR';
        StatMap['Dexterity'] = 'DEX';
        StatMap['Constitution'] = 'CON';
        StatMap['Intelligence'] = 'INT';
        StatMap['Wisdom'] = 'WIS';
        StatMap['Charisma'] = 'CHA';

        ClassToStatMap['Artificer'] = 'Intelligence';
        ClassToStatMap['Bard'] = 'Charisma';
        ClassToStatMap['Cleric'] = 'Wisdom';
        ClassToStatMap['Druid'] = 'Wisdom';
        ClassToStatMap['Fighter'] = 'Intelligence';
        ClassToStatMap['Paladin'] = 'Charisma';
        ClassToStatMap['Ranger'] = 'Wisdom';
        ClassToStatMap['Rogue'] = 'Intelligence';
        ClassToStatMap['Shaman'] = 'Wisdom';
        ClassToStatMap['Sorcerer'] = 'Charisma';
        ClassToStatMap['Warlock'] = 'Charisma';
        ClassToStatMap['Wizard'] = 'Intelligence';

        SlotComposeCost[1] = 2;
        SlotComposeCost[2] = 3;
        SlotComposeCost[3] = 5;
        SlotComposeCost[4] = 6;
        SlotComposeCost[5] = 7;
    };
    BuildMaps();

    // Get a caster type from the map (CasterMode).
    const GetCasterTypeFromClass = (className, subName) => {
        const baseVal = CasterTypeMap[className];
        if (baseVal) {
            return baseVal;
        }
        const auxVal = CasterTypeMap[className + ':' + subName];
        return auxVal;
    };

    // Get default spell slot array for a caster type and level
    const GetBaseSpellSlots = (casterMode, level, className = '', subclassName = '') => {
        const empty = [0,0,0,0,0,0,0,0,0];
        dlog(`Getting Slots for mode=${casterMode} lvl=${level}, class=${className}, sub=${subclassName}`);

        if (casterMode === CasterMode.Full){
            const fullCasterSlots = [
                [0,0,0,0,0,0,0,0,0],// 0
                [2,0,0,0,0,0,0,0,0],// 1
                [3,0,0,0,0,0,0,0,0],// 2
                [4,2,0,0,0,0,0,0,0],// 3
                [4,3,0,0,0,0,0,0,0],// 4
                [4,3,2,0,0,0,0,0,0],// 5
                [4,3,3,0,0,0,0,0,0],// 6
                [4,3,3,1,0,0,0,0,0],// 7
                [4,3,3,2,0,0,0,0,0],// 8
                [4,3,3,3,1,0,0,0,0],// 9
                [4,3,3,3,2,0,0,0,0],// 10
                [4,3,3,3,2,1,0,0,0],// 11
                [4,3,3,3,2,1,0,0,0],// 12
                [4,3,3,3,2,1,1,0,0],// 13
                [4,3,3,3,2,1,1,0,0],// 14
                [4,3,3,3,2,1,1,1,0],// 15
                [4,3,3,3,2,1,1,1,0],// 16
                [4,3,3,3,2,1,1,1,1],// 17
                [4,3,3,3,3,1,1,1,1],// 18
                [4,3,3,3,3,2,1,1,1],// 19
                [4,3,3,3,3,2,2,1,1],// 20
            ];
            return fullCasterSlots[level];
        } else if(casterMode === CasterMode.Half) {
            const validClasses = [
                'Paladin',
                'Ranger',
            ];
            if (!validClasses.includes(className)) {
                return empty;
            }
            const halfCasterSlots = [
                [0,0,0,0,0,0,0,0,0],// 0
                [0,0,0,0,0,0,0,0,0],// 1
                [2,0,0,0,0,0,0,0,0],// 2
                [3,0,0,0,0,0,0,0,0],// 3
                [3,0,0,0,0,0,0,0,0],// 4
                [4,2,0,0,0,0,0,0,0],// 5
                [4,2,0,0,0,0,0,0,0],// 6
                [4,3,0,0,0,0,0,0,0],// 7
                [4,3,0,0,0,0,0,0,0],// 8
                [4,3,2,0,0,0,0,0,0],// 9
                [4,3,2,0,0,0,0,0,0],// 10
                [4,3,3,0,0,0,0,0,0],// 11
                [4,3,3,0,0,0,0,0,0],// 12
                [4,3,3,1,0,0,0,0,0],// 13
                [4,3,3,1,0,0,0,0,0],// 14
                [4,3,3,2,0,0,0,0,0],// 15
                [4,3,3,2,0,0,0,0,0],// 16
                [4,3,3,2,1,0,0,0,0],// 17
                [4,3,3,2,1,0,0,0,0],// 18
                [4,3,3,2,2,0,0,0,0],// 19
                [4,3,3,2,2,0,0,0,0],// 20
            ];
            return halfCasterSlots[level];
        } else if (casterMode === CasterMode.Third) {
            const validSubs = [
                'Arcane Trickster',
                'Eldritch Knight'
            ];
            if (!validSubs.includes(subclassName)) {
                return empty;
            }
            const thirdCasterSlots = [
                [0,0,0,0,0,0,0,0,0],// 0
                [0,0,0,0,0,0,0,0,0],// 1
                [0,0,0,0,0,0,0,0,0],// 2
                [2,0,0,0,0,0,0,0,0],// 3
                [3,0,0,0,0,0,0,0,0],// 4
                [3,0,0,0,0,0,0,0,0],// 5
                [3,0,0,0,0,0,0,0,0],// 6
                [4,2,0,0,0,0,0,0,0],// 7
                [4,2,0,0,0,0,0,0,0],// 8
                [4,2,0,0,0,0,0,0,0],// 9
                [4,3,0,0,0,0,0,0,0],// 10
                [4,3,0,0,0,0,0,0,0],// 11
                [4,3,0,0,0,0,0,0,0],// 12
                [4,3,2,0,0,0,0,0,0],// 13
                [4,3,2,0,0,0,0,0,0],// 14
                [4,3,2,0,0,0,0,0,0],// 15
                [4,3,3,0,0,0,0,0,0],// 16
                [4,3,3,0,0,0,0,0,0],// 17
                [4,3,3,0,0,0,0,0,0],// 18
                [4,3,3,1,0,0,0,0,0],// 19
                [4,3,3,1,0,0,0,0,0],// 20
            ];
            return thirdCasterSlots[level];
        } else if (casterMode === CasterMode.Pact) {
            const pactCasterSlots = [
                [0,0,0,0,0,0,0,0,0],// 0
                [1,0,0,0,0,0,0,0,0],// 1
                [2,0,0,0,0,0,0,0,0],// 2
                [0,2,0,0,0,0,0,0,0],// 3
                [0,2,0,0,0,0,0,0,0],// 4
                [0,0,2,0,0,0,0,0,0],// 5
                [0,0,2,0,0,0,0,0,0],// 6
                [0,0,0,2,0,0,0,0,0],// 7
                [0,0,0,2,0,0,0,0,0],// 8
                [0,0,0,0,2,0,0,0,0],// 9
                [0,0,0,0,2,0,0,0,0],// 10
                [0,0,0,0,3,1,0,0,0],// 11
                [0,0,0,0,3,1,0,0,0],// 12
                [0,0,0,0,3,1,1,0,0],// 13
                [0,0,0,0,3,1,1,0,0],// 14
                [0,0,0,0,3,1,1,1,0],// 15
                [0,0,0,0,3,1,1,1,0],// 16
                [0,0,0,0,3,1,1,1,1],// 17
                [0,0,0,0,3,1,1,1,1],// 18
                [0,0,0,0,3,1,1,1,1],// 19
                [0,0,0,0,3,1,1,1,1],// 20
            ];
            return pactCasterSlots[level];
        }
        
        // Default to empty
        return empty;
    };

    // A and B are arrays of slots
    const AddSlots = (a, b) => {
        let c = [0,0,0,0,0,0,0,0,0];
        if (a && !b) {
            return a;
        } else if (!a && b) {
            return b;
        } else if (!a && !b) {
            return c;
        }
        for (let i = 0; i < 10; i++) {
            const aVal = a[i] || 0
            const bVal = b[i] || 0
            c[i] = aVal + bVal;
        }
        return c;
    };

    // For those classes that don't have a dedicated spell list, get the class they rely on.
    const GetSpellListClassFromClass = (leveledClass) => {
        // EKs and ATs use the Wizard spell list
        if ((leveledClass.Name === 'Fighter' && leveledClass.Subclass === 'Eldritch Knight') || (leveledClass.Name === 'Rogue' && leveledClass.Subclass === 'Arcane Trickster')) {
            return 'Wizard';
        }
        return leveledClass.Name;
    }

    // Get the full max slot array for a list of leveled classes {Name, Level}.
    const GetCharSlots = (leveledClasses) => {
        // Iterate through classes and get total levels per type
        let fullLevel = 0;
        let halfLevel = 0;
        let thirdLevel = 0;
        let pactLevel = 0;
        let casterClasses = 0;
        for (let i = 0; i < leveledClasses.length; i++) {
            const leveledClass = leveledClasses[i];
            const mode = GetCasterTypeFromClass(leveledClass.Name, leveledClass.Subclass);
            
            dlog(`${leveledClass.Name}[${leveledClass.Level}]: ${GetBaseSpellSlots(mode, leveledClass.Level, leveledClass.Name, leveledClass.Subclass)}`);
            if (mode === CasterMode.Full) fullLevel += leveledClass.Level || 0;
            if (mode === CasterMode.Half) halfLevel += leveledClass.Level || 0;
            if (mode === CasterMode.Third) thirdLevel += leveledClass.Level || 0;
            if (mode === CasterMode.Pact) pactLevel += leveledClass.Level || 0;

            // Track multiclassing
            if (mode !== CasterMode.None && mode !== CasterMode.Invalid) casterClasses++;
        }

        // Add the fractional levels for non-pact magic
        const fullFraction = fullLevel*CasterModeMultiplier[CasterMode.Full];
        const halfFraction = halfLevel >= 2
            ? halfLevel*CasterModeMultiplier[CasterMode.Half]
            : 0;
        const thirdFraction = thirdLevel >= 3
            ? thirdLevel*CasterModeMultiplier[CasterMode.Third]
            : 0;
        const normLevel = casterClasses > 1
            ? fullFraction + Math.floor(halfFraction) + Math.floor(thirdFraction)
            : Math.ceil(fullFraction + halfFraction + thirdFraction);
        
        // Add the slots of all the types together
        const normSlots = GetBaseSpellSlots(CasterMode.Full, normLevel, 'NORMAL');
        dlog('Normal Slots[' + normLevel + ']: ' + normSlots);
        const pactSlots = GetBaseSpellSlots(CasterMode.Pact, pactLevel, 'PACT');
        dlog('Pact Slots[' + pactLevel + ']: ' + pactSlots);

        // Add the normal and pact slots together
        return AddSlots(normSlots, pactSlots);
    };

    // Creates a link 
    const CreateLink = (text, linkTo) => {
        return `<a href="${linkTo}">${text}</a>`;
    };

    // All sorters available to SpellMaster
    const Sorters = {
        NameAlpha: (a, b) => {
            const nameA=a.Name.toLowerCase();
            const nameB=b.Name.toLowerCase();
            if (nameA < nameB) // sort string ascending
            {
                return -1;
            }
            if (nameA > nameB)
            {
                return 1;
            }
            return 0 // default return value (no sorting)
        },
        LevelName: (a, b) => {
            // Sort by level first
            const levelA = a.Level;
            const levelB = b.Level;
            if (levelA < levelB) {
                return -1;
            } else if (levelA > levelB) {
                return 1;
            }

            // Then sort by alpha
            const nameA=a.Name.toLowerCase();
            const nameB=b.Name.toLowerCase();
            if (nameA < nameB) // sort string ascending
            {
                return -1;
            }
            if (nameA > nameB)
            {
                return 1;
            }
            return 0 // default return value (no sorting)
        },
        DistanceMin: (a, b) => {
            // Sort by level first
            const distanceA = a.Distance;
            const distanceB = b.Distance;
            if (distanceA < distanceB) {
                return -1;
            } else if (distanceA > distanceB) {
                return 1;
            }
            return 0 // default return value (no sorting)
        },
        CostName: (a, b) => {
            // Sort by cost first
            const costA = a.ChargeCost;
            const costB = b.ChargeCost;
            if (costA < costB) {
                return -1;
            } else if (costA > costB) {
                return 1;
            }

            // Then sort by alpha
            let nameA = a.SpellName || a.CustomName;
            let nameB = b.SpellName || b.CustomName;
            nameA = nameA.toLowerCase();
            nameB = nameB.toLowerCase();
            if (nameA < nameB) // sort string ascending
            {
                return -1;
            }
            if (nameA > nameB)
            {
                return 1;
            }
            return 0 // default return value (no sorting)
        },
    };

    // Filtration options
    const Filters = {
        WithFlag: 0,
        WithoutFlag: 1,
        NotApplicable: 2
    };
    const FilterSymbols = ['X', '!', '_'];

    /**
     * Sends a message to a gm and a player.  If the player is a gm, don't double-send
     * @param incomingMsg Object - The message that came in and contains the user info.
     * @param outgoingMsg string - The message to publish.
     */
    const sendToGmAndPlayer = (incomingMsg, outgoingMsg) => {
        let sendSuccess = false;
        try {
            sendChat(scname, `/w "${incomingMsg.who.replace(' (GM)', '')}" ${outgoingMsg}`);
            sendSuccess = true;
        }
        catch(e) {
            log('Error sending spellcast: ' + e.Message);
            log('Spell Text: ' + outgoingMsg);
        }
        if(!sendSuccess || !playerIsGM(incomingMsg.playerid)) {
            sendChat(scname, `/w gm ${outgoingMsg}`);
        }
    };

    // Retrieves a list of leveled classes for a given spellbook {Name, Level}
    const GetLeveledClasses = (char, spellbook) => {
        let cachedBook = Cache.Books[spellbook.Name];
        if (!cachedBook) {
            cachedBook = RefreshCachedBook(spellbook);
        }
        const classDisplay = GetCachedAttr(char, cachedBook, 'class_display');
        const leveledClassesString = classDisplay.split(',');
        let leveledClasses = [];
        for (let i = 0; i < leveledClassesString.length; i++) {
            const trimmedClass = leveledClassesString[i].trim();
            const classDetails = trimmedClass.split(' ');
            const className = classDetails[classDetails.length-2];
            const classLevel = parseInt(classDetails[classDetails.length-1]);
            const subclassName = trimmedClass.substr(0, trimmedClass.indexOf(className)).trim();
            leveledClasses.push({
                Name: className,
                Subclass: subclassName,
                Level: classLevel
            });
        }
        return leveledClasses;
    };

    // Gets the stat mod for the given spellcasting class
    const GetStatModForClass = (char, spellbook, className) => {
        let cachedBook = Cache.Books[spellbook.Name];
        const stat = ClassToStatMap[className];
        if (!stat) {
            return -5;
        }
        return GetCachedAttr(char, cachedBook, stat.toLowerCase() + '_mod') || 0;
    };

    const GetMaxPreparationString = (char, spellbook) => {
        let cachedBook = Cache.Books[spellbook.Name];
        const leveledClasses = GetLeveledClasses(char, spellbook);
        let prepString = '';
        for(let i = 0; i < leveledClasses.length; i++) {
            const className = leveledClasses[i].Name;
            const classLevel = leveledClasses[i].Level;
            if (className === 'Cleric' || className === 'Druid' || className === 'Shaman') {
                const statMod = GetCachedAttr(char, cachedBook, 'wisdom_mod') || 0;
                prepString += `/ ${classLevel + statMod} (${className}) `;
            } else if (className === 'Wizard' || className === 'Artificer') {
                const statMod = GetCachedAttr(char, cachedBook, 'intelligence_mod') || 0;
                prepString += `/ ${classLevel + statMod} (${className}) `;
            } else if (className === 'Warlock' || className === 'Witch') {
                const spellsKnownAtLevel = [2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,15,15];
                let maxKnown = spellsKnownAtLevel[classLevel-1];
                maxKnown += classLevel >= 11 ? 1 : 0;// Mystic Arcanum L6
                maxKnown += classLevel >= 13 ? 1 : 0;// Mystic Arcanum L7
                maxKnown += classLevel >= 15 ? 1 : 0;// Mystic Arcanum L8
                maxKnown += classLevel >= 17 ? 1 : 0;// Mystic Arcanum L9
                const statMod = GetCachedAttr(char, cachedBook, 'charisma_mod') || 0;
                prepString += `/ ${maxKnown} (${className}) `;
            } else if (className === 'Sorcerer') {
                const spellsKnownAtLevel = [2,3,4,5,6,7,8,9,10,11,12,12,13,13,14,14,15,15,15,15];
                let maxKnown = spellsKnownAtLevel[classLevel-1];
                const statMod = GetCachedAttr(char, cachedBook, 'charisma_mod') || 0;
                prepString += `/ ${maxKnown} (${className}) `;
            } else if (className === 'Paladin') {
                const statMod = GetCachedAttr(char, cachedBook, 'charisma_mod') || 0;
                prepString += `/ ${Math.floor(classLevel/2) + statMod} (${className}) `;
            } else if (className === 'Bard') {
                const spellsKnownAtLevel = [4,5,6,7,8,9,10,11,12,14,15,15,16,18,19,19,20,22,22,22];
                let maxKnown = spellsKnownAtLevel[classLevel-1];
                const statMod = GetCachedAttr(char, cachedBook, 'charisma_mod') || 0;
                prepString += `/ ${maxKnown} (${className}) `;
            } 
        }
        return prepString;
    };

    // Returns true if the stat of this instance is a manual DC, false if it's anything else.
    const StatIsManualDC = (instance) => {
        return instance.Stat === 'Manual DC';
    };

    // Gets the description for the spell
    const GetSpellDescription = (spell) => {
        return spell.Desc
        .replace(/\|/g, "<br/>")// In event user is re-importing homebrew
        .replace("Higher Level:", "HLCODE")// This order matters to prevent double-hits
        .replace("Higher Levels:", "HLCODE")
        .replace("At Higher Level:", "HLCODE")
        .replace("Higher level:", "HLCODE")
        .replace("At higher level:", "HLCODE")
        .replace(/HLCODE/g, '<b>- Higher Levels:</b>');
    };

    // Returns a string that contains the details of a spell (used by expansion and casting)
    const GetSpellDetails = (book, stat, notes, instanceDC, spell, createLinks) => {
        text = "";
        text += `<b>- School:</b> ${spell.School}<br/>`;
        text += `<b>- Cast Time:</b> ${spell.CastTime}<br/>`;
        text += `<b>- Range:</b> ${spell.Range}<br/>`;
        let componentStr = "";
        componentStr += spell.Components.V ? "V" : "";
        componentStr += spell.Components.S ? "S" : "";
        componentStr += spell.Components.M ? "M" : "";
        componentStr += spell.Components.MDetails ? ` (${spell.Components.MDetails})` : "";
        text += `<b>- Components:</b> ${componentStr}<br/>`;
        text += `<b>- Duration:</b> ${spell.Duration}<br/>`;
        let descStr = GetSpellDescription(spell);
        text += `<b>- Description:</b> ${descStr}<br/>`;
        if(createLinks) {
            const abilityLink = CreateLink('Ability:', `!SpellMaster --UpdateBook ^${book.Name}^ --UpdateSpell ^${spell.Name}^ --ParamName ^Ability^ --ParamValue ^?{Please select the ability to use when casting this spell.|Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma|Manual DC}^`);
            text += `<b>- ${abilityLink}</b> ${stat}<br/>`;
            if (stat === 'Manual DC') {
                // 1.0 -> 1.1 version handling
                if (!instanceDC) {
                    instanceDC = 8;
                }
                const dcLink = CreateLink('DC:', `!SpellMaster --UpdateBook ^${book.Name}^ --UpdateSpell ^${spell.Name}^ --ParamName ^DC^ --ParamValue ^?{Please enter the manually-configured DC}^`);
                text += `<b>- ${dcLink}</b> ${instanceDC}<br/>`;
            }
            const notesLink = CreateLink('Notes:',`!SpellMaster --UpdateBook ^${book.Name}^ --UpdateSpell ^${spell.Name}^ --ParamName ^Notes^ --ParamValue ^?{Please type the new notes section.  You may want to type outside this window and paste for longer messages.  Use html br tag for line breaks.}^`);
            text += `<b>- ${notesLink}</b> ${notes}<br/>`;
        } else {
            text += `<b>- Ability:</b> ${stat}<br/>`;
            if (notes) {
                text += `<b>- Notes:</b> ${notes}<br/>`;
            }
        }
        text += `<b>- Classes:</b> ${spell.Classes}<br/>`;

        return text;
    };

    // Gets caster info
    const GetCasterInfo = (char, book, cachedBook, stat, customDC, isManualDC) => {
        let dc;
        let attackRollStr;
        let casterLevel = 0;
        if (isManualDC) {
            dc = parseInt(customDC);
            attackRollStr = `[[d20cs>20 + ${dc-8}[ATKMOD]]]`;
        } else {
            const pb = GetCachedAttr(char, cachedBook, 'pb') || 0;
            const statMod = GetCachedAttr(char, cachedBook, stat.toLowerCase() + '_mod') || 0;
            const attackMod = GetCachedAttr(char, cachedBook, 'globalmagicmod') || 0;
            const dcMod = GetCachedAttr(char, cachedBook, 'spell_dc_mod') || 0;
            casterLevel = GetCachedAttr(char, cachedBook, 'level') || 0;
            dc = 8 + pb + statMod + dcMod;
    
            const statString = statMod !== 0 ? ` + ${statMod}[${StatMap[stat]}]` : '';
            const atkString = attackMod !== 0 ? ` + ${attackMod}[ATKMOD]` : '';
            attackRollStr = `[[@{${book.Owner}|d20}cs>20${statString} + ${pb}[PROF]${atkString}]]`;
        }
        return {
            DC: dc,
            AttackRollStr: attackRollStr,
            CasterLevel: casterLevel
        };
    };

    // Generates the upcast string for a spell
    const GetUpcastString = (spell, castLevel, spellDetails, casterLevel) => {
        const upcastIndex = spellDetails.indexOf('Higher Levels:');
        spellDetails = spellDetails.replace(/(\d+)d(\d+)/gmi, (match, p1, p2, offset, string) => {

            // Allow upcasting in higher-level casting section
            let levelScalar = 1;
            let autoEval = false;
            let prefix = '';
            let suffix = '';
            
            if (castLevel > 0) {
                if (offset > upcastIndex && upcastIndex !== -1) {
                    levelScalar = castLevel - spell.Level;
                    prefix = match + ' (for a total of ';
                    suffix = ')';
                }
                autoEval = true;
            } else if (castLevel === 0 && offset <= upcastIndex) {
                levelScalar = Math.floor((casterLevel + 1) / 6) + 1;
                autoEval = true;
            }
            
            const retVal = autoEval ? `${prefix}[[${levelScalar*p1}d${p2}]]${suffix}` : match;
            return retVal;
        });
        return spellDetails;
    };

    // Identifies saves, if any exist.  Parameter MUST be lowercased
    const IdentifySaves = (details) => {
        let saves = [];
        if (details.includes('strength saving throw') || details.includes('strength save')) {
            saves.push("Strength Save");
        }
        if (details.includes('dexterity saving throw') || details.includes('dexterity save')) {
            saves.push("Dexterity Save");
        }
        if (details.includes('constitution saving throw') || details.includes('constitution save')) {
            saves.push("Constitution Save");
        }
        if (details.includes('intelligence saving throw') || details.includes('intelligence save')) {
            saves.push("Intelligence Save");
        }
        if (details.includes('wisdom saving throw') || details.includes('wisdom save')) {
            saves.push("Wisdom Save");
        }
        if (details.includes('charisma saving throw') || details.includes('charisma save')) {
            saves.push("Charisma Save");
        }
        return saves.join(',');
    };

    // Pushes a given magical effect to the chat
    const PublishMagicEffect = (casterName, spell, isSpellAttack, attackRollStr, description, chatMessage, whisperToggle) => {
        const spellContents = `&{template:npcatk} `
            +`{{attack=1}}  `
            +`{{name=${casterName}}}  `
            +`{{rname=${spell.Name}}}  `
            +`{{rnamec=${spell.Name}}}  `
            +`{{r1=${isSpellAttack ? attackRollStr : '[[0d1]]'}}}  `
            +`{{always=0}}  `
            +`{{r2=${isSpellAttack ? attackRollStr : '[[0d1]]'}}}  `
            +`{{description=${description}}}`;

        dlog("Spell Contents: " + spellContents);
        if (whisperToggle) {
            sendToGmAndPlayer(chatMessage, spellContents);
        } else {
            sendChat(scname, spellContents);
        }
        return spellContents;
    }

    // Prints the spell to the chat when casting a spell
    const PrintSpell = (book, instance, spell, castLevel, chatMessage) => {
        const char = GetCharByAny(book.Owner);
        let cachedBook = Cache.Books[book.Name];

        const casterInfo = GetCasterInfo(char, book, cachedBook, instance.Stat, instance.DC, StatIsManualDC(instance));
        const attackRollStr = casterInfo.AttackRollStr;
        const dc = casterInfo.DC;
        const casterLevel = casterInfo.CasterLevel;

        let spellDetails = GetSpellDetails(book, instance.Stat, instance.Notes, instance.DC, spell, false);
        spellDetails = GetUpcastString(spell, castLevel, spellDetails, casterLevel);

        let parseableDetails = spellDetails.toLowerCase();
        let isSpellAttack = parseableDetails.includes('spell attack');
        const saveString = IdentifySaves(parseableDetails);

        const descriptionFull = `<b>- DC:</b> ${dc} ${saveString}<br>${spellDetails}`;

        const whisperToggle = GetCachedAttr(char, cachedBook, 'whispertoggle') === '/w gm ';
        return PublishMagicEffect(book.Owner, spell, isSpellAttack, attackRollStr, descriptionFull, chatMessage, whisperToggle);
    };

    // Prints all knowable spells for a spellbook and given level
    const PrintKnowables = (msg, book, level) => {
        const char = GetCharByAny(book.Owner);
        const leveledClasses = GetLeveledClasses(char, book);
        let knowables = `/w "${msg.who.replace(' (GM)', '')}" &{template:desc} {{desc=<h3>${book.Owner} - ${level}</h3><hr>`;
        knowables += `<div align="left" style="margin-left: 7px;margin-right: 7px">`;

        // Iterate over all table spells
        for(let i = 0; i < SpellList.length; i++) {
            const spell = SpellList[i];
            if (spell.Level === level) {
                // Determine if the spell is knowable (on any of the book's classes' lists)
                for (let j = 0; j < leveledClasses.length; j++) {
                    const leveledClass = leveledClasses[j];
                    let className = GetSpellListClassFromClass(leveledClass);

                    if (spell.Classes.includes(className)) {
                        // Determine if spell is currently known or not
                        let spellKnown = false;
                        for (let j = 0; j < book.KnownSpells.length; j++) {
                            const instance = book.KnownSpells[j];
                            if (instance.Name === spell.Name) {
                                spellKnown = true;
                            }
                        }

                        // Build the entry for it
                        const prepButton = spellKnown
                            ? `[-](!SpellMaster --UpdateBook ^${book.Name}^ --RemoveSpell ^${spell.Name}^ --Confirm ^Yes^ --RefreshKnowables ^Yes^)`
                            : `[+](!SpellMaster --UpdateBook ^${book.Name}^ --ImportSpell ^${spell.Name}^ --RefreshKnowables ^Yes^)`
                        const spellLine = `${prepButton} ${spell.Name}<br/>`;
                        knowables += spellLine;
                        break;
                    }
                }
            }
        }

        knowables += `</div>}}`;
        dlog(knowables);
        sendChat(scname, knowables);
    };

    // Gets the link to cast the enchantment
    const getEnchantmentCastLink = (spellbook, item, enchantment) => {
        const name = enchantment.SpellName || enchantment.CustomName;
        const hypotheticalRemainder = item.CurCharges - enchantment.ChargeCost;
        if (hypotheticalRemainder < 0 || (item.Attunement && !item.Attuned)) {
            return name;
        }
        const maxUpcasts = enchantment.Upcast && enchantment.UpcastCost > 0
            ? Math.floor(hypotheticalRemainder / enchantment.UpcastCost)
            : 0;
        if (enchantment.SpellName) {
            const spell = SpellDict[name];
            const castLevels = [];
            for(let i = 0; i <= maxUpcasts; i++) castLevels.push(spell.Level + i);
            let levelQuery = '';
            if (maxUpcasts > 0) {
                const castLevelString = castLevels.join('|');
                levelQuery = `What level would you like to activate the ${name} at|${castLevelString}`;
            } else {
                levelQuery = `Would you like to cast ${name} at level ${spell.Level}|Yes,${spell.Level}|No`;
            }
            return castLink = CreateLink(name, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --UpdateItem ^${item.Name}^ --Activate ^${name}^ --Tier ^?{${levelQuery}}^`);
        } else {
            flog('CUSTOM ENCHANTMENTS NOT IMPLEMENTED');
        }
    };

    /**
     * Prints an enchantment
     * @param {Object} book
     * @param {Object} item
     * @param {Object} enchantment
     * @param {number} tier
     * @param {Object} chatMessage
     * @returns The string printed to chat log.
     */
    const PrintEnchantment = (book, item, enchantment, tier, chatMessage) => {
        const name = enchantment.SpellName || enchantment.CustomName;
        sendChat(scname, 'Print Enchantment: ' + name + ' at ' + tier);
        const char = GetCharByAny(book.Owner);
        let cachedBook = Cache.Books[book.Name];
        const dcValue = parseInt(enchantment.DC) || 0;
        const manualDC = dcValue !== 0;
        const stat = manualDC ? 'Manual DC' : enchantment.DC;

        const casterInfo = GetCasterInfo(char, book, cachedBook, stat, dcValue, manualDC);
        const attackRollStr = casterInfo.AttackRollStr;
        const dc = casterInfo.DC;
        let casterLevel = casterInfo.CasterLevel;

        if (enchantment.SpellName) {
            const spell = SpellDict[enchantment.SpellName];
            let spellDetails = GetSpellDetails(book, stat, '', dcValue, spell, false);
            // Synthetically re-level the caster for cantrip enchantments
            if (spell.Level === 0) {
                const grade = tier + 1;
                tier = 0;
                casterLevel = Math.max(6 * (grade - 1) - 1, 1);
            }
            spellDetails = GetUpcastString(spell, tier, spellDetails, casterLevel);

            let parseableDetails = spellDetails.toLowerCase();
            let isSpellAttack = parseableDetails.includes('spell attack');
            const saveString = IdentifySaves(parseableDetails);

            const descriptionFull = `<b>- DC:</b> ${dc} ${saveString}<br>${spellDetails}`;

            const whisperToggle = GetCachedAttr(char, cachedBook, 'whispertoggle') === '/w gm ';
            return PublishMagicEffect(item.Name, spell, isSpellAttack, attackRollStr, descriptionFull, chatMessage, whisperToggle);
        } else {
            flog('Printing Custom Enchantments is not yet supported.');
        }
    };

    // The various subsections of a spellbook that can be cached
    const CacheOptions = {
        All: 0,
        Owner: 1,
        Filtering: 2,
        Tools: 3,
        Prepared: 4,
        SorcPoints: 5,
        Spells: 6,
        PrepLists: 7,
        Items: 8,
        AllSpellLevels: [0,1,2,3,4,5,6,7,8,9,10]
    };

    // Checks specified level and all levels above to see if a spell is castable
    const HasSlotsOfAtLeastLevel = (spellbook, level) => {
        if (level === 0) {
            return true;
        }
        for (let i = level-1; i < spellbook.CurSlots.length; i++) {
            const slotsAtLevel = spellbook.CurSlots[i];
            if (slotsAtLevel > 0) {
                return true;
            }
        }
        return false;
    };

    // Create a new cache object
    const RefreshCachedBook = (spellbook) => {
        const char = GetCharByAny(spellbook.Owner);
        const startCache = new Date();
        let cachedBook = {
            OwnerStr: '',
            FilteringStr: '',
            ToolsStr: '',
            PreparedStr: '',
            SpellsStr: '',
            SpellLevels: ['','','','','','','','','','',''],
            PrepListsStr: '',
            Sheet: {}
        };

        // Build cached attributes from sheet (this is expensive)
        cachedBook.Sheet['_id'] = GetCachedAttr(char, cachedBook, '_id', true);
        cachedBook.Sheet['level'] = GetCachedAttr(char, cachedBook, 'level', true);
        cachedBook.Sheet['class_display'] = GetCachedAttr(char, cachedBook, 'class_display', true);
        cachedBook.Sheet['whispertoggle'] = GetCachedAttr(char, cachedBook, 'whispertoggle', true);
        cachedBook.Sheet['pb'] = GetCachedAttr(char, cachedBook, 'pb', true);
        cachedBook.Sheet['globalmagicmod'] = GetCachedAttr(char, cachedBook, 'globalmagicmod', true);
        cachedBook.Sheet['spell_dc_mod'] = GetCachedAttr(char, cachedBook, 'spell_dc_mod', true);
        cachedBook.Sheet['strength_mod'] = GetCachedAttr(char, cachedBook, 'strength_mod', true);
        cachedBook.Sheet['dexterity_mod'] = GetCachedAttr(char, cachedBook, 'dexterity_mod', true);
        cachedBook.Sheet['constitution_mod'] = GetCachedAttr(char, cachedBook, 'constitution_mod', true);
        cachedBook.Sheet['intelligence_mod'] = GetCachedAttr(char, cachedBook, 'intelligence_mod', true);
        cachedBook.Sheet['wisdom_mod'] = GetCachedAttr(char, cachedBook, 'wisdom_mod', true);
        cachedBook.Sheet['charisma_mod'] = GetCachedAttr(char, cachedBook, 'charisma_mod', true);
        const stopCache = new Date();
        const diffCache = stopCache - startCache;
        dlog('Initial Sheet Caching: ' + diffCache);
        Cache.Books[spellbook.Name] = cachedBook;
        return cachedBook;
    };

    // Loads from the cache if possible, loads from char if not
    const GetCachedAttr = (char, cachedBook, attrName, forceReload = false) => {
        if (forceReload) {
            let attrVal = getattr(char.id, attrName);
            // Try to parse as int if possible
            let numVal = parseInt(attrVal);
            if (!isNaN(numVal)) {
                attrVal = numVal;
            }
            cachedBook.Sheet[attrName] = attrVal;
            return attrVal;
        } else {
            return cachedBook.Sheet[attrName];
        }
    };

    // Prints a spellbook out to its handout.
    // spellbook: the spellbook object
    // dirtyCaches: an array of CacheOptions that must be rebuilt.
    // dirtyLevels: an array of spell levels to be rebuilt.
    const PrintSpellbook = (spellbook, dirtyCaches, dirtyLevels) => {
        const startTime = new Date();
        const activePrepList = spellbook.PreparationLists[spellbook.ActivePrepList];
        const char = GetCharByAny(spellbook.Owner);
        let text = "";
        let br = "<br/>";
        let hr = "<hr>";
        let cachedBook = Cache.Books[spellbook.Name];

        // =================================================================================
        // Owner
        let ownerStr = '';
        if (dirtyCaches.includes(CacheOptions.All) || dirtyCaches.includes(CacheOptions.Owner)) {
            dlog('Rebuilding Owner');
            let uri = `http://journal.roll20.net/character/${char.id}`;
            ownerStr += `<i>A spellbook for </i>${CreateLink(spellbook.Owner, uri)}`;
            ownerStr += '<hr>';
            cachedBook.OwnerStr = ownerStr;
        } else {
            dlog('Using Cached Owner');
            ownerStr = cachedBook.OwnerStr;
        }
        text += ownerStr;

        // =================================================================================
        // Filter bar
        let filterStr = '';
        if (dirtyCaches.includes(CacheOptions.All) || dirtyCaches.includes(CacheOptions.Filtering)) {
            dlog('Rebuilding Filtering');
            const vFilter = CreateLink(`[${FilterSymbols[spellbook.Filter.V]}]`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --ParamName ^V^ --ParamValue ^?{Please enter the new filter option|V,${Filters.WithFlag}|No-V,${Filters.WithoutFlag}|No Filter,${Filters.NotApplicable}}^`);
            const sFilter = CreateLink(`[${FilterSymbols[spellbook.Filter.S]}]`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --ParamName ^S^ --ParamValue ^?{Please enter the new filter option|S,${Filters.WithFlag}|No-S,${Filters.WithoutFlag}|No Filter,${Filters.NotApplicable}}^`);
            const mFilter = CreateLink(`[${FilterSymbols[spellbook.Filter.M]}]`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --ParamName ^M^ --ParamValue ^?{Please enter the new filter option|M,${Filters.WithFlag}|No-M,${Filters.WithoutFlag}|No Filter,${Filters.NotApplicable}}^`);
            const castFilter = CreateLink(`[${spellbook.Filter.CastTime}]`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --ParamName ^CastTime^ --ParamValue ^?{Please enter the new filter option|1 Action|1 Bonus Action|Special|Combat|Noncombat|Any}^`);
            const concFilter = CreateLink(`[${FilterSymbols[spellbook.Filter.Concentration]}]`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --ParamName ^Concentration^ --ParamValue ^?{Please enter the new filter option|Concentration,${Filters.WithFlag}|No-Concentration,${Filters.WithoutFlag}|No Filter,${Filters.NotApplicable}}^`);
            const rituFilter = CreateLink(`[${FilterSymbols[spellbook.Filter.Ritual]}]`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --ParamName ^Ritual^ --ParamValue ^?{Please enter the new filter option|Ritual,${Filters.WithFlag}|No-Ritual,${Filters.WithoutFlag}|No Filter,${Filters.NotApplicable}}^`);
            const prepFilter = CreateLink(`[${FilterSymbols[spellbook.Filter.Prepared]}]`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --ParamName ^Prepared^ --ParamValue ^?{Please enter the new filter option|Prepared,${Filters.WithFlag}|No-Prepared,${Filters.WithoutFlag}|No Filter,${Filters.NotApplicable}}^`);
            const slotsFilter = CreateLink(`[${FilterSymbols[spellbook.Filter.Slots]}]`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --ParamName ^Slots^ --ParamValue ^?{Please enter the new filter option|Slots Remaining,${Filters.WithFlag}|Slots Empty,${Filters.WithoutFlag}|No Filter,${Filters.NotApplicable}}^`);
            const searchFilter = CreateLink(`["${spellbook.Filter.Search}"]`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --ParamName ^Search^ --ParamValue ^?{Please enter the new search string}^`);
            filterStr += `<b>Filtering:</b> ${vFilter} V ${sFilter} S ${mFilter} M - ${castFilter} Casting Time - ${concFilter} Concentration - ${rituFilter} Ritual - ${prepFilter} Prepared - ${slotsFilter} Slots Remaining - ${searchFilter} Search<br/>`;
            cachedBook.FilteringStr = filterStr;
        } else {
            dlog('Using Cached Filtering');
            filterStr = cachedBook.FilteringStr;
        }
        text += filterStr;
        
        // =================================================================================
        // Tools
        let toolsStr = '';
        if (dirtyCaches.includes(CacheOptions.All) || dirtyCaches.includes(CacheOptions.Tools)) {
            dlog('Rebuilding Tools');
            const fillSlotsLink = CreateLink(`[Long Rest]`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --SetSlots ^Full^`);
            const levelUpLink = CreateLink(`[Level Up]`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --LevelUp ^?{Are you sure you want to resync the cache for Level Up?  This will reset any custom spell level slots.  (Slots reserved for individual spells are unaffected.)  Type 'Yes' to confirm}^`);
            const flushCacheLink = CreateLink(`[Refresh Cache]`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --FlushCache ^Yes^`);
            toolsStr += `<b>Tools:</b> ${fillSlotsLink} - ${levelUpLink} - ${flushCacheLink}<br/>`;
            cachedBook.ToolsStr = toolsStr;
        } else {
            dlog('Using Cached Tools');
            toolsStr = cachedBook.ToolsStr;
        }
        text += toolsStr;
        
        // =================================================================================
        // Sorcery Points
        let sorcStr = '';
        if (dirtyCaches.includes(CacheOptions.All) || dirtyCaches.includes(CacheOptions.SorcPoints)) {
            dlog('Rebuilding Sorcery Points');
            const curSorcPoints = CreateLink(`[${spellbook.CurSorc}]`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --SetCurSorc ^?{Set current sorcery points}^`);
            const maxSorcPoints = CreateLink(`[${spellbook.MaxSorc}]`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --SetMaxSorc ^?{Set maximum sorcery points}^`);
            const composeSorcPoints = CreateLink(`[Compose Slot]`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --ComposeSlot ^?{What level spell slot would you like to compose from sorcery points as a bonus action|L1=2p,1|L2=3p,2|L3=5p,3|L4=6p,4|L5=7p,5}^`);
            sorcStr += `<b>Sorcery Points:</b> ${curSorcPoints} / ${maxSorcPoints} - ${composeSorcPoints}<br/>`;
            cachedBook.sorcStr = sorcStr;
        } else {
            dlog('Using Cached Sorc Points');
            sorcStr = cachedBook.sorcStr;
        }
        text += sorcStr;

        // =================================================================================
        // Prepared Spell Count
        let preparedStr = '';
        if (dirtyCaches.includes(CacheOptions.All) || dirtyCaches.includes(CacheOptions.Prepared)) {
            dlog('Rebuilding Prepared');
            const prepString = `${activePrepList.PreparedSpells.length} ${GetMaxPreparationString(char, spellbook)}`;
            preparedStr += `<b>Prepared:</b> ${prepString}<br/>`;
            preparedStr += '<hr>';
            cachedBook.PreparedStr = preparedStr;
        } else {
            dlog('Using Cached Prepared');
            preparedStr = cachedBook.PreparedStr;
        }
        text += preparedStr;

        // =================================================================================
        // Items
        let inventoryStr = '';
        if (dirtyCaches.includes(CacheOptions.All) || dirtyCaches.includes(CacheOptions.Items)) {
            dlog('Rebuilding Items');
            inventoryStr += '<h2>Items</h2>';
            inventoryStr += '<hr>';
            spellbook.Items.sort(Sorters.NameAlpha);
            spellbook.Items.forEach((item) => {
                let itemStr = '';
                const isAttunedLink = CreateLink(`[${item.Attuned ? 'X' : '_'}]`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --UpdateItem ^${item.Name}^ --ParamName ^Attuned^ --ParamValue ^${!item.Attuned}^`);
                const curChargesLink = CreateLink(`[${item.CurCharges}]`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --UpdateItem ^${item.Name}^ --ParamName ^Cur^ --ParamValue ^?{Please enter the new current current value for ${item.Name}}^`);
                const maxChargesLink = CreateLink(`[${item.MaxCharges}]`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --UpdateItem ^${item.Name}^ --ParamName ^Max^ --ParamValue ^?{Please enter the new maximum charges value for ${item.Name}}^`);
                const isExpandedLink = CreateLink(`[${item.Expanded ? '-' : '+'}]`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --UpdateItem ^${item.Name}^ --ParamName ^Expanded^ --ParamValue ^${!item.Expanded}^`);
                const renameLink = CreateLink(item.Name, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --UpdateItem ^${item.Name}^ --ParamName ^Name^ --ParamValue ^?{Please enter the new name for ${item.Name}}^`);
                itemStr += `<h3>${item.Attunement ? isAttunedLink : ''} ${renameLink} - ${curChargesLink} / ${maxChargesLink} - ${isExpandedLink}</h3>`;
                if (item.Expanded) {
                    itemStr += hr;
                    const attunementStr = item.Attunement 
                        ? `<i>Requires Attunement</i>${br}`
                        : `<i>Free Access</i>${br}`;
                    itemStr += CreateLink(attunementStr, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --UpdateItem ^${item.Name}^ --ParamName ^Attunement^ --ParamValue ^${!item.Attunement}^`);
                    const appearanceLink = CreateLink('<b>Appearance</b>', `!SpellMaster --UpdateBook ^${spellbook.Name}^ --UpdateItem ^${item.Name}^ --ParamName ^Appearance^ --ParamValue ^?{Please enter the new appearance for ${item.Name}}^`);
                    const effectLink = CreateLink('<b>Effect</b>', `!SpellMaster --UpdateBook ^${spellbook.Name}^ --UpdateItem ^${item.Name}^ --ParamName ^Effect^ --ParamValue ^?{Please enter the new effect for ${item.Name}}^`);
                    const regenLink = CreateLink('<b>Recharge Rate</b>', `!SpellMaster --UpdateBook ^${spellbook.Name}^ --UpdateItem ^${item.Name}^ --ParamName ^RegenRate^ --ParamValue ^?{Please enter the new regeneration rate for ${item.Name}}^`);
                    const addSpellLink = CreateLink('<b>Add Spell Enchantment</b>', `!SpellMaster --UpdateBook ^${spellbook.Name}^ --UpdateItem ^${item.Name}^ --AddSpell ^?{Please enter the name of the spell.}^ --ChargeCost ^?{Charge Cost}^ --Upcast ^?{Can it be upcast|Yes|No}^ --UpcastCost ^?{Cost per upcast level.  If no upcast, put 0}^ --DC ^?{Please choose the DC.  Spell attack will be calculated|Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma|0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30}^`);
                    itemStr += appearanceLink + `: ${item.Appearance}${br}`;
                    itemStr += effectLink + `: ${item.Effect}${br}`;
                    itemStr += `<h3>Enchantments</h3>`;
                    item.Enchantments.sort(Sorters.CostName);
                    item.Enchantments.forEach((enchantment) => {
                        let enchantmentStr = '';
                        const enchantmentName = enchantment.SpellName || enchantment.CustomName;
                        const chargeCostLink = CreateLink(`[${enchantment.ChargeCost}]`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --UpdateItem ^${item.Name}^ --UpdateEnchantment ^${enchantmentName}^ --ParamName ^ChargeCost^ --ParamValue ^?{Please input the new charge cost}^`);
                        const expandEnchantmentLink = CreateLink(`[${enchantment.Expanded ? '-' : '+'}]`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --UpdateItem ^${item.Name}^ --UpdateEnchantment ^${enchantmentName}^ --ParamName ^Expanded^ --ParamValue ^${!enchantment.Expanded}^`);
                        const upcastCostLink = CreateLink(enchantment.UpcastCost, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --UpdateItem ^${item.Name}^ --UpdateEnchantment ^${enchantmentName}^ --ParamName ^UpcastCost^ --ParamValue ^?{Please input the new upcast cost per level}^`);
                        const upcastLink = CreateLink(`${enchantment.Upcast ? 'Upcast Cost: ' : 'No Upcast'}`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --UpdateItem ^${item.Name}^ --UpdateEnchantment ^${enchantmentName}^ --ParamName ^Upcast^ --ParamValue ^?{Can you upcast this spell|Yes|No}^`);
                        const upcastStr = `<b>- ${upcastLink}</b> ${enchantment.Upcast ? upcastCostLink : ''}<br/>`;
                        const deleteEnchantmentLink = CreateLink(`[Delete]`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --UpdateItem ^${item.Name}^ --DeleteEnchantment ^${enchantmentName}^ --Confirm ^?{Type Yes to confirm deletion}^`);
                        const dcLink = CreateLink(enchantment.DC, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --UpdateItem ^${item.Name}^ --UpdateEnchantment ^${enchantmentName}^ --ParamName ^DC^ --ParamValue ^?{Please choose the DC.  Spell attack will be calculated|Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma|0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30}^`);
                        enchantmentStr += `<b>${chargeCostLink} ${getEnchantmentCastLink(spellbook, item, enchantment)} ${expandEnchantmentLink}</b><br/>`;
                        if (enchantment.SpellName) {
                            if (enchantment.Expanded) {
                                const spell = SpellDict[enchantment.SpellName];
                                enchantmentStr += `<b>- Cast Time:</b> ${spell.CastTime}<br/>`;
                                enchantmentStr += `<b>- Range:</b> ${spell.Range}<br/>`;
                                enchantmentStr += `<b>- Duration:</b> ${spell.Duration}<br/>`;
                                enchantmentStr += `<b>- Description:</b> ${GetSpellDescription(spell)}<br/>`;
                                enchantmentStr += `<b>- DC:</b> ${dcLink}<br/>`
                                enchantmentStr += upcastStr;
                                enchantmentStr += `- ${deleteEnchantmentLink}<br/><br/>`;
                            }
                        }
                        itemStr += enchantmentStr;
                    });
                    itemStr += addSpellLink + br;
                    itemStr += regenLink + `: ${item.RegenRate}`;
                    itemStr += br + br;
                    itemStr += CreateLink('[Delete]', `!SpellMaster --UpdateBook ^${spellbook.Name}^ --RemoveItem ^${item.Name}^ --Confirm ^?{Type Yes to delete ${item.Name}}^`);
                    itemStr += hr;
                }
                inventoryStr += itemStr;
            });
            inventoryStr += CreateLink('<b>[+]</b>', `!SpellMaster`
                + ` --UpdateBook ^${spellbook.Name}^`
                + ` --CreateItem ^?{Please enter the name of the item you would like to create.}^`
                + ` --Attunement ^?{Does the item require attunement?|Yes|No}^`
                + ` --MaxCharges ^?{Please enter the maximum charges.  0 is infinite.}^`
                + ` --RegenRate ^?{Please enter the recharge rate per day.  0 is no recharge or infinite.}^`
                + ` --Appearance ^?{Please describe the appearance of the item if you wish.}^`
                + ` --Effect ^?{Please describe the effect of the item if you wish.}^`);
            inventoryStr += '<hr>';
            cachedBook.InventoryStr = inventoryStr;
        } else {
            dlog('Using Cached Items');
            inventoryStr = cachedBook.InventoryStr;
        }
        text += inventoryStr;

        // =================================================================================
        // Spells
        let spellStr = '';
        if (dirtyCaches.includes(CacheOptions.All) || dirtyCaches.includes(CacheOptions.Spells)) {
            dlog('Rebuilding Spells');
            // Perform alpha sort on known spells (in case one got added)
            spellbook.KnownSpells.sort(Sorters.NameAlpha);

            spellStr += '<h2>Spells</h2>';
            spellStr += '<hr>';
            dlog('Dirty Levels: ' + dirtyLevels);
            for (let i = 0; i < maxSpellLevel; i++) {
                const hasSlotsOfAtLeastLevel = HasSlotsOfAtLeastLevel(spellbook, i);
                if (i > 0 && ((spellbook.Filter.Slots === Filters.WithFlag && !hasSlotsOfAtLeastLevel) || (spellbook.Filter.Slots === Filters.WithoutFlag && hasSlotsOfAtLeastLevel))) {
                    continue;
                }
                if (dirtyLevels !== CacheOptions.AllSpellLevels && !dirtyLevels.includes(i) && cachedBook.SpellLevels[i].length > 0) {
                    spellStr += cachedBook.SpellLevels[i];
                    dlog(`  Using Cached Level: ${i}`);
                    continue;
                }
                dlog(`  Rebuilding Level: ${i}`);
                let levelStr = '';

                const curSlotLink = CreateLink(`[${spellbook.CurSlots[i-1]}]`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --UpdateSlot ^${i}^ --ParamName ^Cur^ --ParamValue ^?{Please enter the new current value for Slot Level ${i}}^`);
                const maxSlotLink = CreateLink(`[${spellbook.MaxSlots[i-1]}]`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --UpdateSlot ^${i}^ --ParamName ^Max^ --ParamValue ^?{Please enter the new maximum value for Slot Level ${i}}^`);
                const decomposeLink = spellbook.MaxSorc > 0 && spellbook.CurSlots[i-1] > 0
                    ? ' - ' + CreateLink(`[Decompose]`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --DecomposeSlot ^${i}^`)
                    : '';
                const fullListLink = CreateLink(`[...]`, `!SpellMaster --PrintKnowables ^${spellbook.Name}^ --Level ^${i}^`);
                levelStr += i > 0
                    ? `<h3>Level ${i} Spells - ${curSlotLink} / ${maxSlotLink}${decomposeLink} - ${fullListLink}</h3>`
                    : `<h3>Cantrips - ${fullListLink}</h3>`;
    
                // Print all spells at current level
                spellbook.KnownSpells.forEach((spellInstance) => {
                    const spell = SpellDict[spellInstance.Name];
                    if (!spell) {
                        sendChat(scname, `ERROR: No such spell ${spellInstance.Name} exists!  This is likely due to a spell rename.  Please use '!SpellMaster --Menu' to manually delete the offending spell.  In the event this does not resolve it, please contact the script author.  state.SpellMaster is being dumped to the logs.`);
                        flog(`Spell ${spellInstance.Name} does not exist.`, 0);
                        return;
                    }
                    if (spell.Level !== i) {
                        return;
                    }
    
                    const spellIsPrepared = activePrepList.PreparedSpells.map((item) => {return item.Name;}).indexOf(spellInstance.Name) > -1
                        || spell.Level === 0
                        || spellInstance.Lock;

                    // Check filtering
                    if (spellbook.Filter) {
                        if (spell.Level !== 0 && ((spellbook.Filter.Prepared === Filters.WithFlag && !spellIsPrepared) || (spellbook.Filter.Prepared === Filters.WithoutFlag && spellIsPrepared))) {
                            return;
                        }
                        if ((spellbook.Filter.V === Filters.WithFlag && !spell.Components.V) 
                            || (spellbook.Filter.V === Filters.WithoutFlag && spell.Components.V)) {
                            return;
                        }
                        if ((spellbook.Filter.S === Filters.WithFlag && !spell.Components.S) 
                            || (spellbook.Filter.S === Filters.WithoutFlag && spell.Components.S)) {
                            return;
                        }
                        if ((spellbook.Filter.M === Filters.WithFlag && !spell.Components.M) 
                            || (spellbook.Filter.M === Filters.WithoutFlag && spell.Components.M)) {
                            return;
                        }
                        if ((spellbook.Filter.Concentration === Filters.WithFlag && spell.Duration.toLowerCase().indexOf('concentration') === -1) 
                            || (spellbook.Filter.Concentration === Filters.WithoutFlag && spell.Duration.toLowerCase().indexOf('concentration') > -1)) {
                            return;
                        }
                        if ((spellbook.Filter.Ritual === Filters.WithFlag && !spell.IsRitual) 
                            || (spellbook.Filter.Ritual === Filters.WithoutFlag && spell.IsRitual)) {
                            return;
                        }
                        if (spellbook.Filter.Search.length > 0) {
                            if (!(spell.Name.includes(spellbook.Filter.Search) 
                            || spell.Components.MDetails.includes(spellbook.Filter.Search) 
                            || spell.Desc.includes(spellbook.Filter.Search) 
                            || spell.Duration.includes(spellbook.Filter.Search) 
                            || spellInstance.Notes.includes(spellbook.Filter.Search)
                            || (spell.Ability && spell.Ability.includes(spellbook.Filter.Search)) 
                            || spell.Range.includes(spellbook.Filter.Search) 
                            || spell.Classes.includes(spellbook.Filter.Search))) {
                                return;
                            }
                        }
                        if (spellbook.Filter.CastTime !== 'Any') {
                            const filterCast = spellbook.Filter.CastTime;
                            const spellCast = spell.CastTime;
                            if (filterCast !== spellCast) {
                                const spellCastCombat = spellCast === '1 Action' || spellCast === '1 Bonus Action';
                                if (filterCast === 'Combat' && !spellCastCombat) {
                                    return;
                                }
                                if (filterCast === 'Noncombat' && spellCastCombat && !spell.IsRitual) {
                                    return;
                                }
                                const filterIsSpecific = filterCast === '1 Action' || filterCast === '1 Bonus Action' || filterCast === 'Special';
                                if (filterIsSpecific) {
                                    return;
                                }
                            }
                        }
                    }
                    
                    // Create the preparation button.
                    let prepButton = '';
                    if (spellInstance.Lock) {
                        prepButton = '[O]';
                    } else {
                        prepButton = spellIsPrepared
                            ? CreateLink('[X]', `!SpellMaster --UpdateBook ^${spellbook.Name}^ --UpdateSpell ^${spellInstance.Name}^ --ParamName ^Prepared^ --ParamValue ^False^`)
                            : CreateLink('[_]', `!SpellMaster --UpdateBook ^${spellbook.Name}^ --UpdateSpell ^${spellInstance.Name}^ --ParamName ^Prepared^ --ParamValue ^True^`);
                    }
                    // Cantrips are always prepared
                    prepButton = spell.Level === 0
                        ? '[X]'
                        : prepButton;

                    let tagStr = "";
                    tagStr += spell.IsRitual ? " (R)" : "";
                    tagStr += spell.Duration.toLowerCase().includes('concentration') ? " (C)" : "";

                    // Expansion button
                    const expandedText = spellInstance.IsExpanded 
                        ? CreateLink('[-]', `!SpellMaster --UpdateBook ^${spellbook.Name}^ --UpdateSpell ^${spellInstance.Name}^ --ParamName ^Expanded^ --ParamValue ^False^`)
                        : CreateLink('[+]', `!SpellMaster --UpdateBook ^${spellbook.Name}^ --UpdateSpell ^${spellInstance.Name}^ --ParamName ^Expanded^ --ParamValue ^True^`);

                    // Generate upcast string
                    let canUpcast = false;
                    let levelString = spell.Level;
                    if (spell.Level > 0) {// Ignore cantrips
                        let upcastOptions = "";
                        // Start at current level and scale up, recording all that have valid options
                        for(let j = spell.Level-1; j < maxSpellLevel; j++) {
                            // If the spell level has slots or the individual spell instance has slots, mark it
                            if (spellbook.CurSlots[j] > 0 || (spell.Level-1 === j && spellInstance.CurSlots > 0)) {
                                upcastOptions += `|${j+1}`;
                                if (j >= spell.Level) {
                                    canUpcast = true;
                                }
                            }
                        }
                        if (canUpcast) {
                            levelString = `?{Select the level at which to cast ${spell.Name}${upcastOptions}}`;
                        }
                    }

                    const castLink = CreateLink(spell.Name, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --CastSpell ^${spellInstance.Name}^ --ParamName ^Level^ --ParamValue ^${levelString}^`);
                    const indiCur = CreateLink(`[${spellInstance.CurSlots}]`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --UpdateSpell ^${spellInstance.Name}^ --ParamName ^CurSlots^ --ParamValue ^?{Please type the new current slots for ${spell.Name}}^`);
                    const indiMax = CreateLink(`[${spellInstance.MaxSlots}]`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --UpdateSpell ^${spellInstance.Name}^ --ParamName ^MaxSlots^ --ParamValue ^?{Please type the new maximum slots for ${spell.Name}}^`);
                    let titleSlotDisplayStr = '';
                    let innerSlotDisplayStr = '';
                    if (spellInstance.CurSlots > 0 || spellInstance.MaxSlots > 0) {
                        titleSlotDisplayStr = ` - ${indiCur} / ${indiMax}`;
                    } else {
                        innerSlotDisplayStr = `<b>${indiCur} / ${indiMax}</b>`;
                    }

                    levelStr += `<h4>${prepButton} ${castLink}${tagStr}${titleSlotDisplayStr} - ${expandedText}</h4>`;
                    if (spellInstance.IsExpanded) {
                        levelStr += innerSlotDisplayStr;
                        if (spell.Level > 0) {
                            levelStr += ' - ';
                            levelStr += CreateLink(`<i>${spellInstance.Lock ? 'Always Prepared' : 'Manually Prepared'}</i>`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --UpdateSpell ^${spellInstance.Name}^ --ParamName ^Lock^ --ParamValue ^${spellInstance.Lock ? 'False' : 'True'}^`);
                        }
                        levelStr += hr;
                        levelStr += GetSpellDetails(spellbook, spellInstance.Stat, spellInstance.Notes, spellInstance.DC, spell, true);
                        levelStr += br;
                        levelStr += CreateLink('[Delete]', `!SpellMaster --UpdateBook ^${spellbook.Name}^ --RemoveSpell ^${spell.Name}^ --Confirm ^?{Type Yes to delete ${spell.Name}}^`);
                        levelStr += hr;
                    }
                });
                levelStr += br;
                levelStr += CreateLink('<b>[+]</b>', `!SpellMaster --UpdateBook ^${spellbook.Name}^ --ImportSpell ^?{Please enter the name of the spell you would like to import.}^`);
                levelStr += hr;

                cachedBook.SpellLevels[i] = levelStr;
                spellStr += levelStr;
            }
            cachedBook.SpellsStr = spellStr;
        } else {
            dlog('Using Cached Spells');
            spellStr = cachedBook.SpellsStr;
        }
        text += spellStr;
        

        // =================================================================================
        // Preparation Tabs
        let prepListStr = '';
        if (dirtyCaches.includes(CacheOptions.All) || dirtyCaches.includes(CacheOptions.PrepLists)) {
            dlog('Rebuilding Prep Lists');
            prepListStr += '<h2>Preparation Lists</h2>';
            for (let i = 0; i < spellbook.PreparationLists.length; i++) {
                const curList = spellbook.PreparationLists[i];
                const isActive = spellbook.ActivePrepList === i;
                const radioButtonActive = isActive
                    ? '[X]'
                    : '[_]';
                const radioButtonLink = CreateLink(radioButtonActive, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --SetActive ^${i}^`);
                const deletePrepLink = CreateLink('[-]', `!SpellMaster --UpdateBook ^${spellbook.Name}^ --RemovePrepList ^${i}^ --Confirm ^?{Type Yes to delete ${curList.Name}}^`);
                const nameLink = CreateLink(curList.Name, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --RenamePrepList ^${i}^ --ParamValue ^?{Please enter the new name for ${curList.Name}}^`);
                prepListStr += `<h4>${radioButtonLink} ${nameLink} (${curList.PreparedSpells.length}) ${deletePrepLink}</h4>`;
            }
            prepListStr += br;
            prepListStr += CreateLink(`<b>[+]</b>`, `!SpellMaster --UpdateBook ^${spellbook.Name}^ --AddPrepList ^?{Please enter the new preparation list name below.}^`);
            cachedBook.PrepListsStr = prepListStr;
        } else {
            dlog('Using Cached Prep List');
            prepListStr = cachedBook.PrepListsStr;
        }
        text += prepListStr;

        // =================================================================================
        // Print
        //log(text);
        GetHandout(spellbook.Handout).set('notes', text);
        const stopTime = new Date();
        const diff = stopTime - startTime;
        dlog(`Print Time with Dirty Cache ${dirtyCaches} and Dirty Levels ${dirtyLevels}: ${diff}`);
    };

    // Capitalizes the first letter of each word.  Numerals are left where they are.
    const ToTitleCase = (str) => {
        return str.replace(/\w\S*/g, function(txt){
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    };

    // Object containing the tools to parse OGL Sheet Spells
    const OGLSpell = {
        // Prefix
        RepeatingPrefix: 'repeating_spell-',
        LevelTag: ['cantrip',1,2,3,4,5,6,7,8,9],

        // Suffixes
        Name: '_spellname',
        School: '_spellschool',
        Ritual: '_spellritual',
        CastTime: '_spellcastingtime',
        Range: '_spellrange',
        ComponentV: '_spellcomp_v',
        ComponentS: '_spellcomp_s',
        ComponentM: '_spellcomp_m',
        ComponentMDetails: '_spellcomp_materials',
        Concentration: '_spellconcentration',
        Duration: '_spellduration',
        CastAbility: '_spell_ability',
        Description: '_spelldescription',
        HigherLevels: '_spellathigherlevels',
        Class: '_spellclass',
        Type: '_spellsource',

        // Builds the prefix string for a given level
        GetPrefix: (level) => {
            return OGLSpell.RepeatingPrefix + OGLSpell.LevelTag[level] + '_';
        },

        // Gets the spell attributes for a given character id and level
        GetSpellAttrs: (characterId, level) => {
          const prefix = `repeating_spell-${OGLSpell.LevelTag[level]}`;
          return _.filter(findObjs({
            type: "attribute",
            characterid: characterId
          }), attr => attr.get("name").startsWith(prefix));
        },

        // Retrieves only the name attributes for a given char id and level (should be faster)
        GetSpellNameAttrs: (characterId, level) => {
            const prefix = `repeating_spell-${OGLSpell.LevelTag[level]}`;
            const suffix = OGLSpell.Name;
            const objs = findObjs({
                type: "attribute",
                characterid: characterId
            });

            let nameAttrs = [];
            for(let i = 0; i < objs.length; i++) {
                const attr = objs[i];
                const attrName = attr.get("name");
                if (attrName.endsWith(suffix) && attrName.startsWith(prefix)) {
                    nameAttrs.push(attr);
                }
            }
            return nameAttrs;
        },

        // Gets a dictionary of spells by lowercased name to object ids
        GetSpellIds: (characterId, level) => {
          const re = new RegExp(`repeating_spell-${OGLSpell.LevelTag[level]}_([^_]+)${OGLSpell.Name}$`);
          const spellNameAttrs = OGLSpell.GetSpellNameAttrs(characterId, level);
          
          return _.reduce(spellNameAttrs, (lookup, attr) => {
            const match = attr.get("name").match(re);
            match && (lookup[attr.get("current").toLowerCase()] = match[1]);
            return lookup;
          }, {});
        },

        // Gets a spell attribute with the provided spellId and suffix
        GetSpellAttr: (charId, level, spellId, suffix) => {
            return getattr(charId, OGLSpell.GetPrefix(level) + spellId + suffix);
        },

        // Loads all the details into a spell object.  If a checkbox is undefined, assume default value.
        GetSpellDetails: (charId, level, spellId) => {
            let higherLevels = OGLSpell.GetSpellAttr(charId, level, spellId, OGLSpell.HigherLevels);
            higherLevels = higherLevels ? '|' + higherLevels : '';

            // Ritual defaults false
            let isRitual = OGLSpell.GetSpellAttr(charId, level, spellId, OGLSpell.Ritual) === '{{ritual=1}}';

            // VSM defaults true
            let compV = OGLSpell.GetSpellAttr(charId, level, spellId, OGLSpell.ComponentV);
            compV = (compV === '' || compV === '{{v=1}}');
            let compS = OGLSpell.GetSpellAttr(charId, level, spellId, OGLSpell.ComponentS);
            compS = (compS === '' || compS === '{{s=1}}');
            let compM = OGLSpell.GetSpellAttr(charId, level, spellId, OGLSpell.ComponentM);
            compM = (compM === '' || compM === '{{m=1}}');

            // Conc defaults false
            const conc = OGLSpell.GetSpellAttr(charId, level, spellId, OGLSpell.Concentration) === '{{concentration=1}}' 
                ? "Concentration, " 
                : "";

            const spellObj = {
                Name: ToTitleCase(OGLSpell.GetSpellAttr(charId, level, spellId, OGLSpell.Name)),
                Level: level,
                School: ToTitleCase(OGLSpell.GetSpellAttr(charId, level, spellId, OGLSpell.School)),
                IsRitual: isRitual,
                CastTime: ToTitleCase(OGLSpell.GetSpellAttr(charId, level, spellId, OGLSpell.CastTime)),
                Range: OGLSpell.GetSpellAttr(charId, level, spellId, OGLSpell.Range),
                Components: {
                    V: compV,
                    S: compS,
                    M: compM,
                    MDetails: OGLSpell.GetSpellAttr(charId, level, spellId, OGLSpell.ComponentMDetails)
                },
                Duration: conc + OGLSpell.GetSpellAttr(charId, level, spellId, OGLSpell.Duration),
                Desc: OGLSpell.GetSpellAttr(charId, level, spellId, OGLSpell.Description) + higherLevels,
                Classes: ToTitleCase(OGLSpell.GetSpellAttr(charId, level, spellId, OGLSpell.Class))
            }
            return spellObj;
        },

        // Stringifies a standalone spell obj.  No comma at the very end.
        StringifySpellObj: (spellObj) => {
            const desc = spellObj.Desc
            .replace(/\n|<br\/>|<br \/>|<p>/g,'|')// swap breaks for something we can safely print and copy
            .replace(/<\/p>/g,'')// remove paragraphing
            .replace(/\"/g,'\\"');

            const str = ''
            + `    {<br/>`
            + `        Name: "${spellObj.Name}",<br/>`
            + `        Level: ${spellObj.Level},<br/>`
            + `        School: "${spellObj.School}",<br/>`
            + `        IsRitual: ${spellObj.IsRitual},<br/>`
            + `        CastTime: "${spellObj.CastTime}",<br/>`
            + `        Range: "${spellObj.Range}",<br/>`
            + `        Components: {<br/>`
            + `            V: ${spellObj.Components.V},<br/>`
            + `            S: ${spellObj.Components.S},<br/>`
            + `            M: ${spellObj.Components.M},<br/>`
            + `            MDetails: "${spellObj.Components.MDetails}"<br/>`
            + `        },<br/>`
            + `        Duration: "${spellObj.Duration}",<br/>`
            + `        Desc: "${desc}",<br/>`
            + `        Classes: "${spellObj.Classes}"<br/>`
            + `    }`

            return str;
        }
    };

    // Loads a single spell level
    const LoadHomebrewLevel = async (char, charName, level) => {
        const charId = char.id;
        const exportCache = Cache.Exports[charName];
        let homebrewObjs = exportCache.HomebrewObjs;
        let newSpellObjs = exportCache.NewSpellObjs;
        let deleteDict = exportCache.DeleteDict;
        let renameDict = exportCache.RenameDict;

        // Load homebrew spells
        sendChat(scname, `[${level+1}/13] Loading Level ${level} homebrew spells from ${charName}...`);
        _.defer(() => {
            dlog(`Attempting to gather Spell[${level}] for ${charName}`);
            const spellsAtLevel = OGLSpell.GetSpellIds(charId, level);
            dlog(`Gathered ${spellsAtLevel.length} spells.`);
            for (let spellName in spellsAtLevel) {
                if (spellsAtLevel.hasOwnProperty(spellName)) {
                    const spellId = spellsAtLevel[spellName];
                    dlog(`  Discovered ${spellName}: ${spellId}`);
                    const spellObj = OGLSpell.GetSpellDetails(charId, level, spellId);
                    // Check for renames and deletes
                    const nameParams = spellObj.Name.split('|');
                    if (nameParams.length > 1) {
                        if (nameParams[0].toUpperCase() === 'RENAME') {
                            if (nameParams.length !== 3) {
                                sendChat(scname, 'ERROR: Unable to parse rename of ' + spellObj.Name);
                            }
                            const oldName = nameParams[1];
                            const newName = nameParams[2];
                            spellObj.Name = newName;
                            renameDict[newName] = oldName;
                            dlog(`    RENAME: ${oldName} to ${newName}`);
                        } else if (nameParams[0].toUpperCase() === 'DELETE') {
                            if (nameParams.length !== 2) {
                                sendChat(scname, 'ERROR: Unable to parse delete of ' + spellObj.Name);
                            }
                            const deleteableName = nameParams[1];
                            spellObj.Name = deleteableName;
                            deleteDict[deleteableName.toUpperCase()] = true;
                            dlog(`    DELETE: ${deleteableName}`);
                            continue;
                        }
                    }
                    homebrewObjs.push(spellObj);
                    newSpellObjs.push(spellObj);
                }
            }
            sendChat(scname, `[${level+1}/13] Finished Level ${level}.`);
    
            // Update counter
            exportCache.CompleteLevels++;
            dlog(`Finished Level ${level}.  Current status: ${exportCache.CompleteLevels}/10`);
    
            // Spin off assembly if all levels complete
            if (exportCache.CompleteLevels === 10) {
                dlog('Scheduling Assembly.');
                _.defer(AssembleHomebrew, char, charName);
            } else {
                _.defer(LoadHomebrewLevel, char, charName, level+1);
            }
        });
    };

    // Assemble homebrew spells with the stock list
    const AssembleHomebrew = async (char, charName) => {
        dlog('Beginning Homebrew Assembly...');
        const exportCache = Cache.Exports[charName];
        let homebrewObjs = exportCache.HomebrewObjs;
        let newSpellObjs = exportCache.NewSpellObjs;
        let deleteDict = exportCache.DeleteDict;
        let renameDict = exportCache.RenameDict;

        // Import Existing List
        sendChat(scname, '[11/13] Importing existing spells...');
        _.defer(() => {
            dlog('Importing existing spells...');
            for (let i = 0; i < SpellList.length; i++) {
                const existingSpell = SpellList[i];
                // Check for spell deletion
                if(deleteDict[existingSpell.Name.toUpperCase()]) {
                    dlog(`  SKIP DELETED: ${existingSpell.Name}`);
                    continue;
                }

                // Search homebrew for overrides
                let overrideExists = false;
                for (let j = 0; j < homebrewObjs.length; j++) {
                    const homebrewSpell = homebrewObjs[j];

                    // Basic comparison
                    if (existingSpell.Name.toUpperCase() === homebrewSpell.Name.toUpperCase()) {
                        overrideExists = true;
                        break;
                    }

                    // Check for renames 
                    const oldName = renameDict[homebrewSpell.Name];
                    if (oldName && existingSpell.Name.toUpperCase() === oldName.toUpperCase()) {
                        dlog(`  RENAME OVERRIDE: ${oldName} = ${homebrewSpell.Name}`);
                        overrideExists = true;
                        break;
                    }
                }

                // If we haven't inserted an overriding homebrew spell, add the default
                if (!overrideExists) {
                    newSpellObjs.push(existingSpell);
                }
            }
            newSpellObjs.sort(Sorters.LevelName);
    
            // Stringify the new list
            sendChat(scname, '[12/13] Stringifying new spell list...');
            _.defer(() => {
                dlog('Stringifying new spell list...');
                let isFirst = true;
                let spellListString = '<pre>';
                spellListString += `if (typeof MarkStart != 'undefined') {MarkStart('CustomSpellList');}<br/>`;
                spellListString += `var CustomSpellList = [<br/>`;
                for (let i = 0; i < newSpellObjs.length; i++) {
                    const spellObj = newSpellObjs[i];
                    const spellString = OGLSpell.StringifySpellObj(spellObj);
                    if (isFirst) {
                        isFirst = false;
                        spellListString += spellString;
                    } else {
                        spellListString += ',<br/>' + spellString;
                    }
                }
                spellListString += '];<br/>';
                spellListString += `if (typeof MarkStop != 'undefined') {MarkStop('CustomSpellList');}<br/>`;
                spellListString += '</pre>';
                
                // Print to notes section
                sendChat(scname, '[13/13] Exporting...');
                _.defer(() => {
                    dlog('Exporting spell list...');
                    char.set('bio', spellListString);
                    sendChat(scname, 'EXPORT COMPLETE');
                    dlog('Finished Export after ' + (new Date() - exportCache.Timer));
                });
            });
        });
    };

    // Asynchronously exports homebrew material
    const ExportHomebrew = (charName) => {
        const char = GetCharByAny(charName);
        if (!char) {
            sendChat(scname, `Character ${charName} does not exist!`);
            return;
        }

        // Prevent doing this twice
        const oldCache = Cache.Exports[charName];
        if (oldCache && oldCache.CompleteLevels < 10) {
            sendChat(scname, `WARNING: Another export operation for this character is already in progress and has completed ${oldCache.CompleteLevels} levels.`);
            return;
        }

        // Begin making new cache
        const exportCache = {
            CompleteLevels: 0,
            HomebrewObjs: [],
            NewSpellObjs: [],
            DeleteDict: {},
            RenameDict: {},
            Timer: new Date()
        }
        Cache.Exports[charName] = exportCache;

        // Begin operation
        sendChat(scname, 'STARTING ASYNC EXPORT');
        _.defer(LoadHomebrewLevel, char, charName, 0);
    };

    // Process chat messages
    on('chat:message', (msg) => {
        if (msg.type !== 'api') return;
        if (!msg.content.startsWith(chatTrigger)) return;
        if (!SpellsIndexed) {
            sendChat(scname, "SpellMaster is still indexing spells.  Please wait a few seconds and try again.");
            return;
        }
        const startParse = new Date();
        dlog('Received: ' + msg.content);
        const argWords = msg.content.split(/\s+/);
        const argParams = msg.content.split('--');

        // Prints the chat UI menu
        // !SpellMaster --Menu
        const printMenu = '--Menu';
        if(argWords.includes(printMenu) || msg.content === '!SpellMaster') {
            let menu = `/w gm &{template:desc} {{desc=<h3>Spell Master</h3><hr>`
                + `[Create Spellbook](!SpellMaster `
                    + `--CreateBook ^?{Please type the name of your previously-created handout to be used for this spellbook.}^ `
                    + `--Owner ^?{Please enter the name of the character that will use this.}^)<br/>`
                + `[Delete Spellbook](!SpellMaster --DeleteBook ^?{Please type the name of the spellbook to delete.}^ --Confirm ^?{Please type Yes to confirm}^)<br/>`
                + `[Delete Spell](!SpellMaster --UpdateBook ^?{Spellbook Name}^ --RemoveSpell ^?{Spell Name}^ --Confirm ^?{Type Yes to confirm deletion of this spell from this spell list.}^)<br/>`
                + `[Flush Cache](!SpellMaster --UpdateBook ^?{Spellbook Name}^ --FlushCache ^Yes^)<br/>`
                + `[Export Homebrew](!SpellMaster --ExportHomebrew ^?{Please type the name of the character sheet to export house ruled spells from.  Be warned that SpellMaster will overwrite its Bio and Info tab}^)<br/>`
                + `[Set Debug Mode](!SpellMaster --SetDebug ^?{Set the logging level|Debug|Normal}^)<br/>`
                + `}}`;
            log('Menu: ' + menu);
            sendChat(scname, menu);
            return;
        }

        // Create new spell book handout
        const createBookTag = '--CreateBook';
        if(argWords.includes(createBookTag)) {
            const bookName = GetParamValue(argParams, 'CreateBook');
            const owner = GetParamValue(argParams, 'Owner');

            log("To Configure Handout \"" + bookName + "\" as a spellbook");
            const handout = GetHandout(bookName);
            if (!handout) {
                sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" ERROR: No such handout as ${bookName} exists!`);
                return;
            }
            const char = GetCharByAny(owner);
            if (!char) {
                sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" ERROR: No such character ${owner} exists!`);
                return;
            }

            const spellbook = {
                IsSpellbook: true,
                Name: bookName,
                Handout: handout.id,
                Owner: owner,
                Stat: 'Wisdom',
                PreparationLists: [// An array of objects with arrays of spell names
                    {
                        Name: 'General',
                        PreparedSpells: []// Will be formatted as an array of spell names that are prepared when a certain list is active
                    }
                ],
                Filter: {
                    V: Filters.NotApplicable,
                    S: Filters.NotApplicable,
                    M: Filters.NotApplicable,
                    CastTime: "Any",
                    Concentration: Filters.NotApplicable,
                    Ritual: Filters.NotApplicable,
                    Slots: Filters.WithFlag,
                    Prepared: Filters.NotApplicable,
                    Search: "",
                },
                ActivePrepList: 0,
                // The below fields are set to default values and will be populated later
                KnownSpells: [],
                CurSorc: 0,
                MaxSorc: 0,
                CurSlots: [-1,-1,-1,-1,-1,-1,-1,-1,-1],
                MaxSlots: [-1,-1,-1,-1,-1,-1,-1,-1,-1],
                Items: []
            };

            RefreshCachedBook(spellbook);

            const leveledClasses = GetLeveledClasses(char, spellbook);

            // Import known spells
            let knownSpells = [];
            for (let i = 0; i < SpellList.length; i++) {
                const curSpell = SpellList[i];

                // Do not autopopulate cantrips
                if (curSpell.Level === 0) {
                    continue;
                }

                // Keep only the best
                let bestClass = false;
                let bestMod = -5;

                // Iterate over the classes for this character, looking for any with this spell
                for (let i = 0; i < leveledClasses.length; i++) {
                    const leveledClass = leveledClasses[i];
                    let className = leveledClass.Name;
                    const statMod = GetStatModForClass(char, spellbook, className);
                    if (curSpell.Classes.includes(className) && statMod > bestMod) {
                        bestClass = className;
                        bestMod = statMod;
                        spellbook.Stat = ClassToStatMap[className];
                    }
                }

                // Add it to the list under the best option
                if (bestClass === 'Cleric' || bestClass === 'Druid' || bestClass === 'Shaman' || bestClass === 'Paladin') {
                    knownSpells.push({
                        Name: curSpell.Name,
                        IsExpanded: false,
                        Stat: ClassToStatMap[bestClass],
                        DC: 8,
                        Lock: false,
                        Notes: 'From ' + bestClass,
                        CurSlots: 0,
                        MaxSlots: 0
                    });
                }
            }
            spellbook.KnownSpells = knownSpells;

            // Get slots for classes.  Do it twice for unique array objects
            spellbook.CurSlots = GetCharSlots(leveledClasses);
            for (let i = 0; i < spellbook.CurSlots.length; i++) {
                spellbook.MaxSlots[i] = spellbook.CurSlots[i];
            }

            // Create state entry
            BookDict[bookName] = spellbook;
            log("Successfully created a new spell list!");
            PrintSpellbook(BookDict[bookName], [CacheOptions.All], CacheOptions.AllSpellLevels);
            sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" Spellbook created.`);

            const stopParse = new Date();
            const diffParse = stopParse - startParse;
            dlog('Creation Time: ' + diffParse);
            return;
        }

        // Update existing book
        const updateBookTag = '--UpdateBook';
        if (argWords.includes(updateBookTag)) {
            // Book to use
            const bookName = GetParamValue(argParams, 'UpdateBook');
            const spellbook = BookDict[bookName];
            if (!spellbook) {
                sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" No such book as ${bookName}`);
                return;
            }

            // Other operation codes
            const importSpell = GetParamValue(argParams, 'ImportSpell');
            const removeSpell = GetParamValue(argParams, 'RemoveSpell');
            const updateSpell = GetParamValue(argParams, 'UpdateSpell');
            const updateSlot = GetParamValue(argParams, 'UpdateSlot');
            const addPrepList = GetParamValue(argParams, 'AddPrepList');
            const setActive = GetParamValue(argParams, 'SetActive');
            const removePrepList = GetParamValue(argParams, 'RemovePrepList');
            const renamePrepList = GetParamValue(argParams, 'RenamePrepList');
            const castSpell = GetParamValue(argParams, 'CastSpell');
            const setSlots = GetParamValue(argParams, 'SetSlots');
            const flushCache = GetParamValue(argParams, 'FlushCache');
            const levelUp = GetParamValue(argParams, 'LevelUp');
            const curSorc = GetParamValue(argParams, 'SetCurSorc');
            const maxSorc = GetParamValue(argParams, 'SetMaxSorc');
            const composeSlot = GetParamValue(argParams, 'ComposeSlot');
            const decomposeSlot = GetParamValue(argParams, 'DecomposeSlot');
            const createItem = GetParamValue(argParams, 'CreateItem');
            const removeItem = GetParamValue(argParams, 'RemoveItem');
            const updateItem = GetParamValue(argParams, 'UpdateItem');

            // Parameters
            const paramName = GetParamValue(argParams, 'ParamName');
            const paramValue = GetParamValue(argParams, 'ParamValue');
            const confirm = GetParamValue(argParams, 'Confirm');
            const refreshKnowables = GetParamValue(argParams, 'RefreshKnowables');

            // the list of caches that need to be updated.  Duplicates are fine.
            dirtyCaches = [];
            dirtyLevels = [];

            // Build the cache if it doesn't already exist.
            if (!Cache.Books[spellbook.Name] || flushCache) {
                dlog(`Refreshing Cache for ${spellbook.Name}`);
                RefreshCachedBook(spellbook);
                dirtyCaches.push(CacheOptions.All);
                dirtyLevels = CacheOptions.AllSpellLevels;
                if (flushCache) {
                    sendChat(scname, `Cache Flushed for ${spellbook.Name}.`);
                }
            }

            // Interaction buttons
            if (importSpell) {
                const spell = SpellDict[importSpell];
                if (!spell) {
                    printSpellSuggestions(importSpell, msg);
                    return;
                }
                for (let i = 0; i < spellbook.KnownSpells.length; i++) {
                    const knownSpell = spellbook.KnownSpells[i];
                    if (knownSpell.Name === importSpell) {
                        sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" ${importSpell} cannot be imported as it is already in your list!`);
                        return;
                    }
                }
                
                // Determine which stat this should go under
                let spellStat = 'Wisdom';
                let bestClass = 'From X';
                let bestMod = -6;
                const char = GetCharByAny(spellbook.Owner);
                const leveledClasses = GetLeveledClasses(char, spellbook);
                for (let i = 0; i < leveledClasses.length; i++) {
                    const leveledClass = leveledClasses[i];
                    let className = GetSpellListClassFromClass(leveledClass);

                    // Get the modifier for comparison
                    const statMod = GetStatModForClass(char, spellbook, className);

                    // If it's in the list and the best so far, record that.
                    if (spell.Classes.includes(className) && statMod > bestMod) {
                        spellStat = ClassToStatMap[className];
                        bestClass = leveledClass.Name;
                        bestMod = statMod;
                    }
                }

                // Add the known spell instance
                spellbook.KnownSpells.push({
                    Name: spell.Name,
                    IsExpanded: false,
                    Stat: spellStat,
                    Lock: false,
                    Notes: 'From ' + bestClass,
                    CurSlots: 0,
                    MaxSlots: 0
                });
                dirtyCaches.push(CacheOptions.Spells);
                dirtyLevels = [spell.Level];

                if (refreshKnowables === 'Yes') {
                    PrintKnowables(msg, spellbook, spell.Level);
                }
            } else if (removeSpell) {
                if (confirm !== 'Yes') {
                    return;
                }
                const knownSpells = spellbook.KnownSpells;
                let spellUnprepared = false;
                let spellDeleted = false;

                // Remove from any preparation lists
                for(let i = 0; i < spellbook.KnownSpells.length; i++) {
                    const knownSpell = spellbook.KnownSpells[i];
                    if (knownSpell.Name === removeSpell) {
                        for(let j = 0; j < spellbook.PreparationLists.length; j++) {
                            const prepList = spellbook.PreparationLists[j].PreparedSpells;
                            const prepIndex = prepList.indexOf(knownSpell);
                            if (prepIndex > -1) {
                                prepList.splice(prepIndex, 1);
                                spellUnprepared = true;
                            }
                        }
                    }
                }

                // Remove from known list
                for (let i = 0; i < knownSpells.length; i++) {
                    const curSpellInstance = knownSpells[i];
                    if (curSpellInstance.Name === removeSpell) {
                        knownSpells.splice(i,1);
                        spellDeleted = true;
                        break;
                    }
                }

                if (!spellDeleted) {
                    sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" Invalid spell name to delete: ${removeSpell}`);
                    return;
                }

                // Set cache options
                dirtyCaches.push(CacheOptions.Spells);
                dirtyLevels = [SpellDict[removeSpell].Level];
                if (spellUnprepared) {
                    dirtyCaches.push(CacheOptions.Prepared);
                    dirtyCaches.push(CacheOptions.PrepLists);
                }

                if (refreshKnowables === 'Yes') {
                    PrintKnowables(msg, spellbook, SpellDict[removeSpell].Level);
                }
            } else if (updateSpell) {
                dirtyCaches.push(CacheOptions.Spells);
                if (dirtyLevels !== CacheOptions.AllSpellLevels){
                    dirtyLevels = [SpellDict[updateSpell].Level];
                }
                if (paramName === 'Prepared') {
                    dlog(`${spellbook.Owner} is attempting to toggle the preparation of ${updateSpell} to value ${paramValue}`);
                    const prepList = spellbook.PreparationLists[spellbook.ActivePrepList].PreparedSpells;
                    if (paramValue === 'True') {
                        for(let i = 0; i < spellbook.KnownSpells.length; i++) {
                            const knownSpell = spellbook.KnownSpells[i];
                            if (knownSpell.Name === updateSpell) {
                                if (!prepList.includes(knownSpell)) {
                                    prepList.push(knownSpell);
                                }
                                break;
                            }
                        }
                    } else {
                        for(let i = 0; i < spellbook.KnownSpells.length; i++) {
                            const knownSpell = spellbook.KnownSpells[i];
                            if (knownSpell.Name === updateSpell) {
                                const prepIndex = prepList.findIndex((element) => {return element.Name === knownSpell.Name});
                                if (prepIndex > -1) {
                                    prepList.splice(prepIndex, 1);
                                }
                                break;
                            }
                        }
                    }
                    dirtyCaches.push(CacheOptions.Prepared);
                    dirtyCaches.push(CacheOptions.PrepLists);
                } else if (paramName === 'Expanded') {
                    for (let i = 0; i < spellbook.KnownSpells.length; i++) {
                        const knownSpell = spellbook.KnownSpells[i];
                        if (knownSpell.Name === updateSpell) {
                            knownSpell.IsExpanded = paramValue === 'True';
                            break;
                        }
                    }
                } else if (paramName === 'Ability') {
                    for (let i = 0; i < spellbook.KnownSpells.length; i++) {
                        const knownSpell = spellbook.KnownSpells[i];
                        if (knownSpell.Name === updateSpell) {
                            knownSpell.Stat = paramValue;
                            break;
                        }
                    }
                } else if (paramName === 'DC') {
                    for (let i = 0; i < spellbook.KnownSpells.length; i++) {
                        const knownSpell = spellbook.KnownSpells[i];
                        if (knownSpell.Name === updateSpell) {
                            knownSpell.DC = parseInt(paramValue);
                            break;
                        }
                    }
                } else if (paramName === 'Notes') {
                    for (let i = 0; i < spellbook.KnownSpells.length; i++) {
                        const knownSpell = spellbook.KnownSpells[i];
                        if (knownSpell.Name === updateSpell) {
                            knownSpell.Notes = paramValue;
                            break;
                        }
                    }
                } else if (paramName === 'Lock') {
                    dlog(`${spellbook.Owner} is attempting to toggle the lock of ${updateSpell}`);
                    for (let i = 0; i < spellbook.KnownSpells.length; i++) {
                        const knownSpell = spellbook.KnownSpells[i];
                        if (knownSpell.Name === updateSpell) {
                            knownSpell.Lock = paramValue === 'True';

                            break;
                        }
                    }
    
                    if (paramValue === 'True') {
                        // Remove from any preparation lists (since it's now in all and none of them)
                        for(let i = 0; i < spellbook.KnownSpells.length; i++) {
                            const knownSpell = spellbook.KnownSpells[i];
                            if (knownSpell.Name === updateSpell) {
                                for(let j = 0; j < spellbook.PreparationLists.length; j++) {
                                    const prepList = spellbook.PreparationLists[j].PreparedSpells;
                                    const prepIndex = prepList.findIndex((element) => {return element.Name === knownSpell.Name});
                                    if (prepIndex > -1) {
                                        prepList.splice(prepIndex, 1);
                                    }
                                }
                            }
                        }
                    }

                    dirtyCaches.push(CacheOptions.Prepared);
                    dirtyCaches.push(CacheOptions.PrepLists);
                } else if (paramName === 'CurSlots') {
                    const newVal = parseInt(paramValue) || 0;
                    for (let i = 0; i < spellbook.KnownSpells.length; i++) {
                        const knownSpell = spellbook.KnownSpells[i];
                        if (knownSpell.Name === updateSpell) {
                            knownSpell.CurSlots = newVal;
                            break;
                        }
                    }
                } else if (paramName === 'MaxSlots') {
                    const newVal = parseInt(paramValue) || 0;
                    for (let i = 0; i < spellbook.KnownSpells.length; i++) {
                        const knownSpell = spellbook.KnownSpells[i];
                        if (knownSpell.Name === updateSpell) {
                            knownSpell.MaxSlots = newVal;
                            break;
                        }
                    }
                }
            } else if (updateSlot) {
                const slotIndex = (parseInt(updateSlot) || 0) - 1;
                const newVal = parseInt(paramValue);
                if (paramName === 'Max') {
                    spellbook.MaxSlots[slotIndex] = newVal;
                } else if (paramName === 'Cur') {
                    spellbook.CurSlots[slotIndex] = newVal;
                }
                dirtyCaches.push(CacheOptions.Spells);
                // This could alter the spell availability of this spell and all below it (aside from cantrips)
                for (let i = slotIndex+1; i > 0; i--) {
                    dirtyLevels.push(i);
                }
            } else if (addPrepList) {
                for(let i = 0; i < spellbook.PreparationLists.length; i++) {
                    const existingPrepList = spellbook.PreparationLists[i];
                    if (existingPrepList.Name === addPrepList) {
                        sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" Invalid preparation list name ${addPrepList} as it already exists in this spellbook.`);
                        return;
                    }
                }
                spellbook.PreparationLists.push({
                    Name: addPrepList,
                    PreparedSpells: []// Will be formatted as an array of spell names that are prepared when a certain list is active
                });

                dirtyCaches.push(CacheOptions.PrepLists);
            } else if (setActive) {
                const activeIndex = parseInt(setActive) || 0;
                spellbook.ActivePrepList = activeIndex;

                dirtyCaches.push(CacheOptions.Prepared);
                dirtyCaches.push(CacheOptions.Spells);
                dirtyCaches.push(CacheOptions.PrepLists);
                dirtyLevels = CacheOptions.AllSpellLevels;
            } else if (removePrepList) {
                if (confirm !== 'Yes') {
                    return;
                }
                const prepIdToRemove = parseInt(removePrepList);
                if (spellbook.ActivePrepList == prepIdToRemove) {
                    sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" Cannot remove currently-active preparation list.`);
                    return;
                }
                spellbook.PreparationLists.splice(parseInt(removePrepList), 1);
                
                dirtyCaches.push(CacheOptions.PrepLists);
            } else if (renamePrepList) {
                const prepIdToRename = parseInt(renamePrepList);

                // Make sure not empty string
                if (paramValue.length === 0) {
                    sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" Cannot set name to empty string.`);
                    return;
                }

                // Names must be exclusive
                for (let i = 0; i < spellbook.PreparationLists.length; i++) {
                    if (spellbook.PreparationLists[i].Name === paramValue && i !== prepIdToRename) {
                        sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" Name already exists.`);
                        return;
                    }
                }

                spellbook.PreparationLists[prepIdToRename].Name = paramValue;

                dirtyCaches.push(CacheOptions.PrepLists);
            } else if (castSpell) {
                const spell = SpellDict[castSpell];
                dlog(spellbook.Owner + ' is casting ' + spell.Name + ' with level ' + paramValue + ' when base spell level is ' + spell.Level);
                const level = parseInt(paramValue) || 0;
                if (level < 0 || level < spell.Level) {
                    sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" Invalid cast level ${paramValue}.`);
                    return;
                }
                if (spellbook.CurSlots[level-1] === 0 && level === 0) {
                    sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" Unable to cast spell from expended slot level.`);
                    return;
                }
                let instance = false;
                for (let i in spellbook.KnownSpells) {
                    let curInstance = spellbook.KnownSpells[i];
                    if (curInstance.Name === castSpell) {
                        instance = curInstance;
                        break;
                    }
                }
                if (!instance) {
                    sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" Instance does not exist.`);
                    return;
                }
                dlog(`Available slots: Individual=${instance.CurSlots} - Global=${spellbook.CurSlots[level-1]}`);
                if(level > 0 && instance.CurSlots < 1 && spellbook.CurSlots[level-1] < 1) {
                    sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" Spell slots of that level are exhausted.`);
                    return;
                }
                PrintSpell(spellbook, instance, spell, level, msg);
                if(level > 0) {
                    // Attempt to cast from per-spell slots first since they sometimes recharge faster, but only if casting at base level
                    if (instance.CurSlots > 0 && spell.Level === level) {
                        instance.CurSlots--;
                    } else {
                        spellbook.CurSlots[level-1]--;
                        dirtyLevels = [level];// Yes, these two arrays are not indexed the same :(
                    }
                }

                dirtyCaches.push(CacheOptions.Spells);
            } else if (setSlots) {
                if (setSlots === 'Full') {
                    // Refill spell level slots
                    for (let i = 0; i < spellbook.CurSlots.length; i++) {
                        spellbook.CurSlots[i] = spellbook.MaxSlots[i];
                    }

                    // Refill class/other feature slots
                    for (let i = 0; i < spellbook.KnownSpells.length; i++) {
                        const knownSpell = spellbook.KnownSpells[i];
                        knownSpell.CurSlots = knownSpell.MaxSlots;
                    }
                    dirtyCaches.push(CacheOptions.Spells);
                    dirtyLevels = CacheOptions.AllSpellLevels;

                    // Refill Sorcery Points
                    spellbook.CurSorc = spellbook.MaxSorc;
                    dirtyCaches.push(CacheOptions.SorcPoints);

                    // Refil Items
                    for (let i = 0; i < spellbook.Items.length; i++) {
                        const item = spellbook.Items[i];
                        const simpleRefillCount = parseInt(item.RegenRate);
                        
                        if (isNaN(simpleRefillCount) || item.RegenRate.includes('d') || item.RegenRate.includes('+') || item.RegenRate.includes('-')) {
                            try {
                                sendChat('', `[[${item.RegenRate}]]`, (rollResult) => {
                                    const intResult = rollResult[0].inlinerolls[0].results.total;
                                    item.CurCharges = Math.min(item.CurCharges + intResult, item.MaxCharges);
                                    dirtyCaches.push(CacheOptions.Items);
                                    sendChat(scname, `${spellbook.Owner}, ${item.Name} has recovered ${intResult} for a total of ${item.CurCharges}/${item.MaxCharges}.`);
                                    PrintSpellbook(BookDict[bookName], dirtyCaches, dirtyLevels);
                                });
                            } catch (e) {
                                sendChat(scname, `ERROR: ${spellbook.Owner}, ${item.Name}'s recharge rate could not be parsed: ${item.RegenRate}.`);
                            }
                        } else {
                            item.CurCharges = Math.min(item.CurCharges + simpleRefillCount, item.MaxCharges);
                            dirtyCaches.push(CacheOptions.Items);
                            sendChat(scname, `${spellbook.Owner}, ${item.Name} has recovered ${item.RegenRate} for a total of ${item.CurCharges}/${item.MaxCharges}.`);
                        }
                    }
                    sendChat(scname, `${spellbook.Owner} has finished a long rest to restore ${spellbook.Name}`);
                }
            } else if (curSorc) {
                spellbook.CurSorc = parseInt(curSorc);
                dirtyCaches.push(CacheOptions.SorcPoints);
            } else if (maxSorc) {
                spellbook.MaxSorc = parseInt(maxSorc);
                spellbook.CurSorc = Math.min(spellbook.CurSorc, spellbook.MaxSorc);
                dirtyCaches.push(CacheOptions.SorcPoints);
                dirtyCaches.push(CacheOptions.Spells);
                dirtyLevels = CacheOptions.AllSpellLevels;
            } else if (composeSlot) {
                const slotInt = parseInt(composeSlot);
                const remainder = spellbook.CurSorc - SlotComposeCost[slotInt];
                const slotIndex = slotInt-1;
                if (remainder >= 0) {
                    if (spellbook.CurSlots[slotIndex] === spellbook.MaxSlots[slotIndex]) {
                        sendChat(scname, `Warning: ${spellbook.Owner} has already filled all of their level ${slotInt} spell slots.  Another cannot be composed at this time.`);
                    } else {
                        spellbook.CurSorc = remainder;
                        spellbook.CurSlots[slotIndex]++;
                        dirtyLevels.push(slotInt);
                        dirtyCaches.push(CacheOptions.Spells);
                        dirtyCaches.push(CacheOptions.SorcPoints);
                        sendChat(scname, `${spellbook.Owner} has used a bonus action to compose a new level ${slotInt} spell slot from sorcery points.`);
                    }
                } else {
                    sendChat(scname, `Warning: ${spellbook.Owner} does not have enough sorcery points to create a slot of level ${slotInt}.  (${spellbook.CurSorc}/${SlotComposeCost[slotInt]}).`);
                }
            } else if (decomposeSlot) {
                if (spellbook.CurSorc === spellbook.MaxSorc) {
                    sendChat(scname, `Warning: ${spellbook.Owner} is already at maximum sorcery points.`);
                } else {
                    const slotInt = parseInt(decomposeSlot);
                    spellbook.CurSorc = Math.min(spellbook.CurSorc+slotInt, spellbook.MaxSorc);
                    const slotIndex = slotInt-1;
                    spellbook.CurSlots[slotIndex]--;
                    dirtyLevels.push(slotInt);
                    dirtyCaches.push(CacheOptions.Spells);
                    dirtyCaches.push(CacheOptions.SorcPoints);
                    sendChat(scname, `${spellbook.Owner} has used a bonus action to decompose a level ${slotInt} spell slot into sorcery points.`);
                }
            } else if (levelUp) {
                if (levelUp !== 'Yes') {
                    return;
                }
                RefreshCachedBook(spellbook);
                const char = GetCharByAny(spellbook.Owner);
                const leveledClasses = GetLeveledClasses(char, spellbook);
                spellbook.MaxSlots = GetCharSlots(leveledClasses);
                dirtyCaches.push(CacheOptions.All);
                dirtyLevels = CacheOptions.AllSpellLevels;
                sendChat(scname, `Leveled Up for ${spellbook.Name}.`);
            } else if (createItem) {
                const itemName = createItem;
                if (!itemName) {
                    sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" ERROR: No item name provided.`);
                    return;
                }
                const maxChargesStr = GetParamValue(argParams, 'MaxCharges');
                if (!maxChargesStr) {
                    sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" ERROR: No charges provided.  If the item is chargeless, use 0.`);
                    return;
                }
                const maxCharges = parseInt(maxChargesStr) || 0;
                const regenRate = GetParamValue(argParams, 'RegenRate');
                if (!regenRate) {
                    sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" ERROR: No regen rate provided.  If the item has infinite charges or does not recharge, use 0.`);
                    return;
                }
                const attunement = GetParamValue(argParams, 'Attunement') === 'Yes';
                const appearance = GetParamValue(argParams, 'Appearance');
                const effect = GetParamValue(argParams, 'Effect');
                const item = {
                    Name: itemName,
                    Attunement: attunement,
                    CurCharges: maxCharges,
                    MaxCharges: maxCharges,
                    RegenRate: regenRate,
                    Enchantments: [],
                    Appearance: appearance,
                    Effect: effect,
                    Expanded: true,
                    Attuned: false
                };
                spellbook.Items.push(item);
                dirtyCaches.push(CacheOptions.Items);
                sendChat(scname, `Added the ${itemName} for ${spellbook.Name}.`);
            } else if (removeItem) {
                if (!removeItem) {
                    sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" ERROR: No item to delete provided.`);
                    return;
                }
                spellbook.Items = spellbook.Items.filter((value) => {
                    return value.Name !== removeItem;
                });
                dirtyCaches.push(CacheOptions.Items);
                sendChat(scname, `Deleted the ${removeItem} from ${spellbook.Name}.`);
            } else if (updateItem) {
                if (!updateItem) {
                    sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" ERROR: No item to update provided.`);
                    return;
                }
                let item = spellbook.Items.find((item) => item.Name === updateItem);
                if (!item) {
                    sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" ERROR: No such item exists.`);
                    return;
                }
                const addSpell = GetParamValue(argParams, 'AddSpell');
                const updateEnchantment = GetParamValue(argParams, 'UpdateEnchantment');
                const deleteEnchantment = GetParamValue(argParams, 'DeleteEnchantment');
                const activate = GetParamValue(argParams, 'Activate');
                if (addSpell) {
                    if (!SpellDict[addSpell]) {
                        printSpellSuggestions(addSpell, msg);
                        return;
                    }
                    const chargeCost = parseInt(GetParamValue(argParams, 'ChargeCost')) || 0;
                    const upcast = GetParamValue(argParams, 'Upcast') === 'Yes';
                    const upcastCost = parseInt(GetParamValue(argParams, 'UpcastCost')) || 0;
                    const dc = GetParamValue(argParams, 'DC') || '0';// Deliberately a string
                    item.Enchantments.push({
                        SpellName: addSpell,
                        ChargeCost: chargeCost,
                        Upcast: upcast,
                        UpcastCost: upcastCost,
                        DC: dc,
                        Expanded: true
                    });

                } else if (updateEnchantment) {
                    let enchantment = item.Enchantments.find((enchantment) => enchantment.SpellName === updateEnchantment || enchantment.CustomName === updateEnchantment);
                    if (!enchantment) {
                        sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" ERROR: No such enchantment exists.`);
                        return;
                    }
                    if (!paramName) {
                        sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" ERROR: No parameter name provided.`);
                        return;
                    }
                    if (!paramValue) {
                        sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" ERROR: No parameter value provided.`);
                        return;
                    }
                    if (paramName === 'Name') {
                        if (enchantment.SpellName) {
                            sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" ERROR: Spell enchantments cannot be renamed.`);
                            return;
                        }
                        enchantment.CustomName = paramValue;
                    } else if (paramName === 'Expanded') {
                        enchantment.Expanded = paramValue === 'true';
                    } else if (paramName === 'ChargeCost') {
                        enchantment.ChargeCost = parseInt(paramValue) || 0;
                    } else if (paramName === 'UpcastCost') {
                        enchantment.UpcastCost = parseInt(paramValue) || 0;
                    } else if (paramName === 'Upcast') {
                        enchantment.Upcast = paramValue === 'Yes';
                    } else if (paramName === 'DC') {
                        enchantment.DC = paramValue || 0;
                    }
                } else if (deleteEnchantment) {
                    if (confirm !== 'Yes') {
                        return;
                    }
                    item.Enchantments = item.Enchantments.filter((enchantment) => enchantment.SpellName !== deleteEnchantment && enchantment.CustomName !== deleteEnchantment);
                } else if (activate) {
                    let enchantment = item.Enchantments.find((enchantment) => enchantment.SpellName === activate || enchantment.CustomName === activate);
                    if (!enchantment) {
                        sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" ERROR: No such enchantment exists.`);
                        return;
                    }
                    const tier = parseInt(GetParamValue(argParams, 'Tier'));
                    if (isNaN(tier) || tier < 0) {
                        sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" ERROR: Invalid activation tier: ${GetParamValue(argParams, 'Tier')}.`);
                        return;
                    }
                    if (enchantment.SpellName) {
                        const spell = SpellDict[enchantment.SpellName];
                        const cost = enchantment.ChargeCost + (enchantment.Upcast && enchantment.UpcastCost > 0 ? enchantment.UpcastCost * (tier - spell.Level) : 0);
                        const remainder = item.CurCharges - cost;
                        if (remainder < 0) {
                            sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" ERROR: Insufficient charges.  Attempted to consume ${cost}, but only ${item.CurCharges} remain.`);
                            return;
                        }
                        item.CurCharges = remainder;
                    } else {
                        flog('Activating custom enchantments not possible yet.');
                    }
                    PrintEnchantment(spellbook, item, enchantment, tier, msg);
                } else {// Minor config updates
                    if (!paramName) {
                        sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" ERROR: No parameter name provided.`);
                        return;
                    }
                    if (!paramValue) {
                        sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" ERROR: No parameter value provided.`);
                        return;
                    }

                    if (paramName === 'Name') {
                        item.Name = paramValue;
                    } else if (paramName === 'Attuned') {
                        item.Attuned = paramValue === 'true';
                    } else if (paramName === 'Expanded') {
                        item.Expanded = paramValue === 'true';
                    } else if (paramName === 'Cur') {
                        item.CurCharges = parseInt(paramValue) || 0;
                    } else if (paramName === 'Max') {
                        item.MaxCharges = parseInt(paramValue) || 0;
                    } else if (paramName === 'Attunement') {
                        item.Attunement = paramValue === 'true';
                    } else if (paramName === 'Appearance') {
                        item.Appearance = paramValue;
                    } else if (paramName === 'Effect') {
                        item.Effect = paramValue;
                    } else if (paramName === 'RegenRate') {
                        item.RegenRate = paramValue;
                    }
                }
                dirtyCaches.push(CacheOptions.Items);
            }
            
            // Filtration
            else if (paramName === 'V') {
                spellbook.Filter.V = parseInt(paramValue);
                dirtyCaches.push(CacheOptions.Spells);
                dirtyCaches.push(CacheOptions.Filtering);
                dirtyLevels = CacheOptions.AllSpellLevels;
            } else if (paramName === 'S') {
                spellbook.Filter.S = parseInt(paramValue);
                dirtyCaches.push(CacheOptions.Spells);
                dirtyCaches.push(CacheOptions.Filtering);
                dirtyLevels = CacheOptions.AllSpellLevels;
            } else if (paramName === 'M') {
                spellbook.Filter.M = parseInt(paramValue);
                dirtyCaches.push(CacheOptions.Spells);
                dirtyCaches.push(CacheOptions.Filtering);
                dirtyLevels = CacheOptions.AllSpellLevels;
            } else if (paramName === 'Ritual') {
                spellbook.Filter.Ritual = parseInt(paramValue);
                dirtyCaches.push(CacheOptions.Spells);
                dirtyCaches.push(CacheOptions.Filtering);
                dirtyLevels = CacheOptions.AllSpellLevels;
            } else if (paramName === 'Slots') {
                spellbook.Filter.Slots = parseInt(paramValue);
                dirtyCaches.push(CacheOptions.Spells);
                dirtyCaches.push(CacheOptions.Filtering);
                dirtyLevels = CacheOptions.AllSpellLevels;
            } else if (paramName === 'Concentration') {
                spellbook.Filter.Concentration = parseInt(paramValue);
                dirtyCaches.push(CacheOptions.Spells);
                dirtyCaches.push(CacheOptions.Filtering);
                dirtyLevels = CacheOptions.AllSpellLevels;
            } else if (paramName === 'Prepared') {
                spellbook.Filter.Prepared = parseInt(paramValue);
                dirtyCaches.push(CacheOptions.Spells);
                dirtyCaches.push(CacheOptions.Filtering);
                dirtyLevels = CacheOptions.AllSpellLevels;
            } else if (paramName === 'Search') {
                spellbook.Filter.Search = paramValue;
                dirtyCaches.push(CacheOptions.Spells);
                dirtyCaches.push(CacheOptions.Filtering);
                dirtyLevels = CacheOptions.AllSpellLevels;
            } else if (paramName === 'CastTime') {
                spellbook.Filter.CastTime = paramValue;
                dirtyCaches.push(CacheOptions.Spells);
                dirtyCaches.push(CacheOptions.Filtering);
                dirtyLevels = CacheOptions.AllSpellLevels;
            }

            PrintSpellbook(BookDict[bookName], dirtyCaches, dirtyLevels);

            const stopParse = new Date();
            const diffParse = stopParse - startParse;
            dlog('Update Time: ' + diffParse);
            return;
        }

        // Remove existing book
        const deleteBookTag = '--DeleteBook';
        if (argWords.includes(deleteBookTag)) {
            const bookToDelete = GetParamValue(argParams, 'DeleteBook');
            const confirm = GetParamValue(argParams, 'Confirm');
            const spellbook = BookDict[bookToDelete];
            if (!spellbook) {
                sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" No such spellbook as ${bookToDelete} exists`);
                return;
            }
            if (confirm === 'Yes') {
                delete BookDict[bookToDelete];
                GetHandout(spellbook.Handout).set('notes', '');
                sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" Spellbook deleted.`);
            }

            const stopParse = new Date();
            const diffParse = stopParse - startParse;
            dlog('Deletion Time: ' + diffParse);

            return;
        }

        // Exports homebrew spells from a char sheet to js
        const exportHomebrewTag = '--ExportHomebrew';
        if (argWords.includes(exportHomebrewTag)) {
            const charName = GetParamValue(argParams, 'ExportHomebrew');
            ExportHomebrew(charName);
            return;
        }

        // Prints all potentially knowable spells given a creature's classes
        const printKnowablesTag = '--PrintKnowables';
        if (argWords.includes(printKnowablesTag)) {
            const bookName = GetParamValue(argParams, 'PrintKnowables');
            const spellbook = BookDict[bookName];
            if (!spellbook) {
                sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" No such book as ${bookName}`);
                return;
            }
            const level = parseInt(GetParamValue(argParams, 'Level'));
            if(isNaN(level)) {
                sendChat(scname, `/w "${msg.who.replace(' (GM)', '')}" Invalid level ${GetParamValue(argParams, 'Level')}`);
                return;
            }

            PrintKnowables(msg, spellbook, level);
            return;
        }

        // Sets or unsets the debugLog flag
        const debugTag = '--SetDebug';
        if (argWords.includes(debugTag)) {
            debugLog = GetParamValue(argParams, 'SetDebug') === 'Debug';
            sendChat(scname, 'Debug Mode: ' + debugLog);
            return;
        }
    });

    // Perform garbage collection on orphaned spellbooks
    const PurgeOldSpellbooks = () => {
        // This won't clean up *instantly* but this runs every time, so this will anneal state over time
        for (let bookName in BookDict) {
            const book = BookDict[bookName];
            // Don't accidentally delete any non-spellbook properties
            if (book.IsSpellbook) {
                // Attempt to get the handout.
                const handout = GetHandout(book);
                // If it's dead, delete it because the user destroyed it.
                if (handout === null) {
                    log("ALERT: SpellMaster detected an orphaned book.  It will be deleted: " + bookName);
                    delete BookDict[bookName];
                    break;
                }
            }
        }
    }
    PurgeOldSpellbooks();
});

if (typeof MarkStop != 'undefined') {MarkStop('SpellMaster');}
