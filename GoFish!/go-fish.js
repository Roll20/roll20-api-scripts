/*  MODULE: GoFish!
    AUTHOR: theTexasWave
    DESC:   A Roll20 script that creates a small fishing minigame for players
            based on their Dexterity/DEX and Fishing attributes on their
            character tokens.
    CONFIG: Change values within the configuration section for same basic
            settings on this module. You may also change Constants, although
            you may find some unexpected behavior. You can add fish to the
            MASTER_FISH_LIST as you like, and tables will autobalance.
*/

// Namespace
var GoFish = GoFish || {};

// Configurable Members ========================================================
// This section is customizable for the GM-- and it is encouraged to fix these
// settings as you see fit.

// module settingd
GoFish.AUTOMATICALLY_APPLY_FISHING_ATTRIBUTE = false;       // when true, applies the Fishing Attribute to all characters onready
GoFish.BOT_NAME = "GoFishBot";                              // name of the bot

// fishing activity stats
GoFish.MINIMUM_FISHING_TIME = 2.0;                          // minimum time to wait
GoFish.AVERAGE_FISHING_TIME = 60.0;                         // our base time
GoFish.MAXIMUM_FISHING_TIME = 120.00;                       // maximum time to wait
GoFish.WAIT_TIME = 8.667;                                   // multiplier for in-game wait time to real-time
GoFish.CASH_OUT_PERCENTAGE = 0.4;                           // the ratio of the cashout value
GoFish.ROD_DURABILITY_DEFAULT = 10;                         // how durable a rod is if none is provided
GoFish.XP_STEP = 250;                                       // the base amount to be multiplied for level xp requirements

// rollable tables names
GoFish.FRESHWATER_LESSER = "go-fish-freshwater-lesser";     // lesser freshwater pools
GoFish.FRESHWATER_COMMON = "go-fish-freshwater-common";     // regular freshwater pools
GoFish.FRESHWATER_GREATER = "go-fish-freshwater-greater";   // greater freshwater pools
GoFish.SALTWATER_LESSER = "go-fish-saltwater-lesser";       // lesser saltwater pools
GoFish.SALTWATER_COMMON = "go-fish-saltwater-common";       // regular saltwater pools
GoFish.SALTWATER_GREATER = "go-fish-saltwater-greater";     // greater saltwater pools

// distributions and enums
GoFish.FISH_RARITIES = {            // rarity types, and their value in gold,
    common: {                       // and a numeric score of their rank
        name: 'common',
        value: 0.05,
        rank: 1,
        xp: 5
    },
    uncommon: {
        name: 'uncommon',
        value: 1,
        rank: 2,
        xp: 10
    },
    rare: {
        name: 'rare',
        value: 10,
        rank: 3,
        xp: 25
    },
    epic: {
        name: 'epic',
        value: 50,
        rank: 4,
        xp: 100
    },
    legendary: {
        name: 'legendary',
        value: 250,
        rank: 5,
        xp: 250
    }
};

GoFish.FISH_SIZES = {               // fish sizes and their base weight in lbs
    tiny: {                         // and a numeric score of their rank
        name: 'tiny',
        baseWeight: 0.1,
        rank: 1,
        rigor: 1
    },
    small: {
        name: 'small',
        baseWeight: 1,
        rank: 2,
        rigor: 2
    },
    medium: {
        name: 'medium',
        baseWeight: 2,
        rank: 3,
        rigor: 3
    },
    large: {
        name: 'large',
        baseWeight: 5,
        rank: 4,
        rigor: 5
    },
    huge: {
        name: 'huge',
        baseWeight: 8,
        rank: 5,
        rigor: 8
    },
    gargantuan: {
        name: 'gargantuan',
        baseWeight: 13,
        rank: 6,
        rigor: 13
    }
};

GoFish.TABLE_DISTRIBUTIONS = {       // the total table dist. weight of all item 
    common: 650,                     // rarites (x of 1,000 rolls)
    uncommon: 200,
    rare: 100,
    epic: 40,
    legendary: 10
};

// GoFish Data =================================================================
// This object contains all relevant data for GoFish, sort of a makeshift db
// Aside from the Master Fish List, which you are encouraged to customize,
// try to change data here as little as possible, otherwise the script may break.

GoFish.Data = {};
    
// all table names
GoFish.Data.TABLE_NAME_LIST = [                                
    GoFish.FRESHWATER_LESSER, GoFish.FRESHWATER_COMMON,
    GoFish.FRESHWATER_GREATER, GoFish.SALTWATER_LESSER,
    GoFish.SALTWATER_COMMON, GoFish.SALTWATER_GREATER
];

// the version number, updated by theTexasWave
GoFish.Data.VERSION_NUMBER = 'v1.1.0';
    
// The Master Fish List - the bread and butter
// contains all fish to be rolled. Follow schema below
// if you would like to add your own fish.
//  Fish Schema:
//    {
//        name:           (string) name of fish,
//        size:           (FISH_SIZE) size of fish, used
//                        for weight calculations
//        rarity:         (FISH_RARITY) rarity of fish,
//                        used for table weighting
//        weightOverride: (number, optional) overrides
//                        the weight generator and uses
//                        this number.
//       isEnemy:         (boolean) true if dangerous
//    }
GoFish.Data.MASTER_FISH_LIST = {
    Freshwater: [
        {
            name: 'Minnow',
            size: GoFish.FISH_SIZES.tiny,
            rarity: GoFish.FISH_RARITIES.common,
            weightOverride: 0
        },
        {
            name: 'Bluegill',
            size: GoFish.FISH_SIZES.small,
            rarity: GoFish.FISH_RARITIES.common
        },
        {
            name: 'Carp',
            size: GoFish.FISH_SIZES.small,
            rarity: GoFish.FISH_RARITIES.common
        },
        {
            name: 'Perch',
            size: GoFish.FISH_SIZES.small,
            rarity: GoFish.FISH_RARITIES.common
        },
        {
            name: 'Smallmouth Bass',
            size: GoFish.FISH_SIZES.medium,
            rarity: GoFish.FISH_RARITIES.common
        },
        {
            name: 'Salmon',
            size: GoFish.FISH_SIZES.medium,
            rarity: GoFish.FISH_RARITIES.common
        },
        {
            name: 'Pike',
            size: GoFish.FISH_SIZES.medium,
            rarity: GoFish.FISH_RARITIES.common
        },
        {
            name: 'Catfish',
            size: GoFish.FISH_SIZES.medium,
            rarity: GoFish.FISH_RARITIES.common
        },
        {
            name: 'Largemouth Bass',
            size: GoFish.FISH_SIZES.large,
            rarity: GoFish.FISH_RARITIES.uncommon
        },
        {
            name: 'Tiger Trout',
            size: GoFish.FISH_SIZES.large,
            rarity: GoFish.FISH_RARITIES.uncommon
        },
        {
            name: 'Sturgeon',
            size: GoFish.FISH_SIZES.huge,
            rarity: GoFish.FISH_RARITIES.uncommon
        },
        {
            name: 'Stonefish',
            size: GoFish.FISH_SIZES.medium,
            rarity: GoFish.FISH_RARITIES.uncommon
        },
        {
            name: 'Giant Catfish',
            size: GoFish.FISH_SIZES.huge,
            rarity: GoFish.FISH_RARITIES.uncommon
        },
        {
            name: 'Goliath Tigerfish',
            size: GoFish.FISH_SIZES.huge,
            rarity: GoFish.FISH_RARITIES.rare
        },
        {
            name: 'Scorpion Carp',
            size: GoFish.FISH_SIZES.huge,
            rarity: GoFish.FISH_RARITIES.rare,
            isEnemy: true
        },
        {
            name: 'Giant Lizard',
            size: GoFish.FISH_SIZES.gargantuan,
            rarity: GoFish.FISH_RARITIES.rare,
            weightOverride: 100,
            isEnemy: true
        },
        {
            name: 'Mightfish',
            size: GoFish.FISH_SIZES.huge,
            rarity: GoFish.FISH_RARITIES.rare
        },
        {
            name: 'Witfish',
            size: GoFish.FISH_SIZES.huge,
            rarity: GoFish.FISH_RARITIES.rare
        },
        {
            name: 'Void Salmon',
            size: GoFish.FISH_SIZES.huge,
            rarity: GoFish.FISH_RARITIES.epic
        },
        {
            name: 'Golden Dorado',
            size: GoFish.FISH_SIZES.huge,
            rarity: GoFish.FISH_RARITIES.epic
        },
        {
            name: 'Freshwater Sea Wolf',
            size: GoFish.FISH_SIZES.gargantuan,
            rarity: GoFish.FISH_RARITIES.epic,
            weightOverride: 75,
            isEnemy: true
        },
        {
            name: 'Freshwater Sea Cat',
            size: GoFish.FISH_SIZES.gargantuan,
            rarity: GoFish.FISH_RARITIES.epic,
            weightOverride: 300,
            isEnemy: true
        },
        {
            name: 'The Poolmaker',
            size: GoFish.FISH_SIZES.medium,
            rarity: GoFish.FISH_RARITIES.legendary
        },
        {
            name: 'Owlbearfish',
            size: GoFish.FISH_SIZES.gargantuan,
            rarity: GoFish.FISH_RARITIES.legendary,
            weightOverride: 40,
            isEnemy: true
        },
        {
            name: 'Big Poppa',
            size: GoFish.FISH_SIZES.gargantuan,
            rarity: GoFish.FISH_RARITIES.legendary,
            weightOverride: 75
        },
    ],
    Saltwater: [
        {
            name: 'Anchovy',
            size: GoFish.FISH_SIZES.tiny,
            rarity: GoFish.FISH_RARITIES.common
        },
        {
            name: 'Sardine',
            size: GoFish.FISH_SIZES.tiny,
            rarity: GoFish.FISH_RARITIES.common
        },
        {
            name: 'Herring',
            size: GoFish.FISH_SIZES.small,
            rarity: GoFish.FISH_RARITIES.common
        },
        {
            name: 'Shad',
            size: GoFish.FISH_SIZES.small,
            rarity: GoFish.FISH_RARITIES.common
        },
        {
            name: 'Red Snapper',
            size: GoFish.FISH_SIZES.medium,
            rarity: GoFish.FISH_RARITIES.common
        },
        {
            name: 'Tilapia',
            size: GoFish.FISH_SIZES.small,
            rarity: GoFish.FISH_RARITIES.common
        },
        {
            name: 'Halibut',
            size: GoFish.FISH_SIZES.medium,
            rarity: GoFish.FISH_RARITIES.common
        },
        {
            name: 'Tuna',
            size: GoFish.FISH_SIZES.huge,
            rarity: GoFish.FISH_RARITIES.uncommon
        },
        {
            name: 'Albacore',
            size: GoFish.FISH_SIZES.large,
            rarity: GoFish.FISH_RARITIES.uncommon
        },
        {
            name: 'Giant Trevally',
            size: GoFish.FISH_SIZES.gargantuan,
            rarity: GoFish.FISH_RARITIES.rare,
            weightOverride: 40
        },
        {
            name: 'Barracuda',
            size: GoFish.FISH_SIZES.gargantuan,
            rarity: GoFish.FISH_RARITIES.rare
        },
        {
            name: 'Pufferfish',
            size: GoFish.FISH_SIZES.medium,
            rarity: GoFish.FISH_RARITIES.uncommon
        },
        {
            name: 'Blue Marlin',
            size: GoFish.FISH_SIZES.gargantuan,
            rarity: GoFish.FISH_RARITIES.rare
        },
        {
            name: 'Octopus',
            size: GoFish.FISH_SIZES.large,
            rarity: GoFish.FISH_RARITIES.rare
        },
        {
            name: 'Sagefish',
            size: GoFish.FISH_SIZES.large,
            rarity: GoFish.FISH_RARITIES.rare
        },
        {
            name: 'Quickfish',
            size: GoFish.FISH_SIZES.medium,
            rarity: GoFish.FISH_RARITIES.rare
        },
        {
            name: 'Soulfish',
            size: GoFish.FISH_SIZES.huge,
            rarity: GoFish.FISH_RARITIES.epic
        },
        {
            name: 'Zenfish',
            size: GoFish.FISH_SIZES.huge,
            rarity: GoFish.FISH_RARITIES.epic
        },
        {
            name: 'Saltwater Sea Cat',
            size: GoFish.FISH_SIZES.gargantuan,
            rarity: GoFish.FISH_RARITIES.epic,
            weightOverride: 300,
            isEnemy: true
        },
        {
            name: 'Giant Octopus',
            size: GoFish.FISH_SIZES.gargantuan,
            rarity: GoFish.FISH_RARITIES.epic,
            isEnemy: true
        },
        {
            name: 'Winged Firefish',
            size: GoFish.FISH_SIZES.large,
            rarity: GoFish.FISH_RARITIES.legendary
        },
        {
            name: 'Horned Thunderfish',
            size: GoFish.FISH_SIZES.gargantuan,
            rarity: GoFish.FISH_RARITIES.legendary
        },
        {
            name: 'Aquatic Feychild',
            size: GoFish.FISH_SIZES.large,
            rarity: GoFish.FISH_RARITIES.legendary,
            isEnemy: true
        }
    ]
};

GoFish.Data.Dialogue = {
    oncatch: {
        tiny: [
            'Was that a nibble? You flick your wrist back and catch a...',
        ],
        small: [
            'You feel a slight tug on your line. You pull back and catch a...'
        ],
        medium: [
            'Oh! Something is biting! You reel your line in, pull back, and catch a...'
        ],
        large: [
            `Suddenly your reel spins like crazy. It\'s a heavy one! You pull \
            back, and with a few hearty heaves you catch a...`
        ],
        huge: [
            `Something pulls on your line so hard it nearly flies out of your \
            hands. Woah! You use all of your strength to pull back and catch a...`
        ],
        gargantuan: [
            `With a sudden jolt, something pulls on your line so hard you stumble \
            forward. What is this thing?? It puts up quite the fight! After a few \
            moments of stuggling, you finally find the upperhand. With every ounce \
            of might you possess, you pull back and catch a...`    
        ]
    }
}

// object that holds all GoFish data
GoFish.Data.Game = {
    FishList: [],
    Characters: []
};

// Styles ======================================================================
// Stylesheet for our templates
GoFish.Styles = {
    container: 'background-color: #fff; border: 1px solid #000; border-radius: 5px; max-width: 300px; box-shadow: 4px 4px 0px 0px rgba(0,0,0,0.55);',
    usage: 'background-color: #d1d1d1; border: 2px solid black; border-radius: 5px; padding: 10px;',
    header: 'font-size: 20px; color: white;',
    colors: {
        common: '#9b9b9b',
        uncommon: '#0e7600',
        rare: '#0070dd',
        epic: '#a335ee',
        legendary: '#ff8000',
        commonPastel: '#fefdfb',
        uncommonPastel: '#e8f4ea',
        rarePastel: '#b6dbff',
        epicPastel: '#c0aee0',
        legendaryPastel: '#FFD9B3',
        critFail: '#ff0000',
        critSuccess: '#00ff00',
        danger: '#CD3333',
        dangerPastel: '#ff9191',
        dangerPastelStriped: '#f28a8a'
    },
    fishIcons: {
        tiny: '&#128032;',
        small: '&#128032;',
        medium: '&#128031;',
        large: '&#128031;',
        huge: '&#128011;',
        gargantuan: '&#128011;',
        enemy: '&#129416;'
    },
    listing: 'padding: 5px; text-align: end; border-bottom: 1px solid grey;',
    listingKey: 'font-weight: bold; width: 45%; text-align: right;',
    listingValue: 'width: 45%; font-style: italic; float: right; text-align: right;',
    codeBox: 'font-family: courier; background-color: #c1c1c1; padding: 5px; border-radius: 5px; border: 1px solid black; margin: 10px; font-weight: bold;',
    icon: 'font-size: 20px; float: right;',
    paragraph: 'margin: 10px;',
    errorBox: 'padding: 5px; background-color: #1e1e1e; color: white; border: 1px solid #ff0033; border-radius: 5px; font-family: courier; font-weight: bold;',
    coinTray: 'background-color: #F1F1D4; border: 1px solid #494942; border-radius: 5px; max-width: 125px; margin-top: 5px; box-shadow: 4px 4px 0px 0px rgba(0,0,0,0.55); font-size: 12px; text-align: center;',
    coinBox: 'padding: 5px; text-align: center; text-align-vertical: middle;',
    coinIcon: 'font-size: 20px; margin-right: 5px; text-shadow: 1px 1px black;',
    profileBox: 'width: 100%; display: flex; flex-direction: row; flex-wrap: nowrap; justify-content: space-between; align-items: flex-start;',
    profileColumn: 'padding: 5px;',
    cmdBox: 'padding: 5px; background-color: #1e1e1e; border: 2px solid black; border-radius: 5px; font-family: courier; font-weight: bolder;',
    apiLbl: 'color: #c586c0;',
    cmdLbl: 'color: #4fc1ff;',
    argsLbl: 'color: #c88870;',
    usrLbl: 'color: white;',
    index: {
        headerRow: 'text-align: center; font-weight: bolder; background-color: black; color: white;',
        rows: {
            common: 'background-color: #fefdfb;',
            uncommon: 'background-color: #e8f4ea;',
            rare: 'background-color: #b6dbff;',
            epic: 'background-color: #dee4ff;',
            legendary: 'background-color: #FFD9B3;',
            commonStriped: 'background-color: #f2f1f0;',
            uncommonStriped: 'background-color: #dce8de;',
            rareStriped: 'background-color: #accff2;',
            epicStriped: 'background-color: #d3d9f2;',
            legendaryStriped: 'background-color: #f2ceaa;',
            danger: 'background-color: #ffabab;',
            dangerStriped: 'background-color: #ff9191;',
        }
    },
    newLbl: 'border-radius: 5px; padding: 2px; background-color: #00FFFF; font-weight: bolder; max-width: 50px; text-align: center; align-self: right; font-size: 12px; border: 1px solid black; box-shadow: 4px 4px 0px 0px rgba(0,0,0,0.55);',
    tooltip: `border-radius: 5px; padding: 2px; background-color: #F1F1D4; font-size: 12px;`,
    shadow: `box-shadow: 4px 4px 0px 0px rgba(0,0,0,0.55);`,
    glow: `box-shadow: 0px 0px 8px 4px rgba(255,255,255,0.55);`,
    criticalFail: 'border: 2px solid #ff0000;',
    criticalSuccess: 'border: 2px solid #00ff00;',
    newRecord: `background-color: white; border: 1px solid #ff0000; font-size: 12px; color: #ff0000; font-weight: bolder; max-width: 100px; padding: 2px; text-align: center; border-radius: 5px; font-style: italics;`,
    newRecordWrapper: 'border-radius: 10px; border-top: 1px solid #ff0000; border-bottom: 1px solid #ff0000; font-size: 9px; color: #ff0000; font-weight: bolder; padding: 3px 3px 6px 3px; margin: 6px 0px 6px 0px;',
    newFishWrapper: 'border-radius: 10px; border-top: 1px solid #009d9d; border-bottom: 1px solid #009d9d; font-size: 9px; color: #009d9d; font-weight: bolder; padding: 3px 3px 6px 3px; margin: 6px 0px 6px 0px;',
    cashOutButton: 'border-radius: 10px; padding: 2px; border: 1px solid black; background-color: white;',
    subtext: 'font-size: 9px; font-style: italic; padding-top: 5px; font-weight: bold;',
    fishListContainer: 'padding: 10px 2px 10px 2px; border-bottom: 1px solid black; border-top: 1px solid black; border-radius: 10px;',
    fishListing: 'border-radius: 5px; padding: 5px; border: 1px solid black; margin: 2px; display: table; width: 95%; vertical-align: middle; text-align-vertical: middle;',
    fishNameSmall: 'font-size: 14px; color: white; font-weight: bold;display: table-cell; width: 55%;',
    fishWeightSmall: 'font-size: 10px; color: white; display: table-cell; text-align-vertical: middle; width: 20%; text-align: right;',
    cashOutButton: `color: black; border-radius: 5px; padding: 2px; background-color: white; font-size: 10px; text-align: center; border: 1px solid black;`,
    linkOverride: `border: none; background-color: transparent; padding: 0;`,
    experienceContainer: `width: 100%; height: 10px; border: 1px solid black; border-radius: 3px; display: table; align-self: center; align-content: center; vertical-align: middle;`,
    levelUp: `border-radius: 5px; padding: 2px; background-color: #d4f1d9; font-size: 12px;`,
    list: {
        list: 'display: table; align-self: center; border: 1px solid black; border-radius: 5px; background-color: #F1F1D4; padding: 2px; font-size: 10px;',
        header: 'display: table-caption; background-color: #333330; border: 1px solid black; color: white; font-weight: bold; text-align-center; border-radius: 5px; padding: 2px;',
        row: 'display: table-row; padding: 4px;',
        labelCell: 'display: table-cell; width: 75%; padding: 2px; font-weight: bold;',
        valueCell: 'display: table-cell; width: 25%; padding: 2px;'
    },
    dangerTip: `border-radius: 5px; padding: 4px; background-color: #f1d4d4; font-size: 10px;`,
    toolStats: ``,
    durability: {
        bar: `display: table; border-left: 1px solid black; padding: 3px; width: 90%; border-bottom: 1px solid black; border-radius: 3px;`
    }
};

// Templates ===================================================================
// Templates as functions to be printed

GoFish.Templates = {
    // button for user to cash out immediately
    cashOutButton: function(fish){
        let fishname = fish.name.replace(' ', '');
        fishname = fishname.toLowerCase();
        return `<a style="${GoFish.Styles.linkOverride}" href="!go-fish cashout ${fishname} ${fish.weight}"><div style="${GoFish.Styles.cashOutButton}">Cash out</div></a>`;  
    },
    // command code box
    coin: function(value, fish = undefined, showWeight = false) {
        let gold = 0;
        let silver = 0;
        let bronze = 0;
        
        if ( value % 1 === 0) {
            gold = value;
        } else {
            gold = Math.floor(value);
            silver = (value % 1) * 10;
            if (silver % 1 != 0) {
                bronze = Math.round((silver % 1) * 10);
                silver = Math.floor(silver);
                if (bronze === 10) {
                    bronze = 0;
                    silver += 1;
                }
            }
        }
        
        let goldCoins = ``;
        let bronzeCoins = ``;
        let silverCoins = ``;
        if (gold) {
            goldCoins = `<span style="${GoFish.Styles.coinBox}"><span style="${GoFish.Styles.coinIcon} color: #e6c900;">&#9679;</span><span>${gold}</span></span>`;
        }
        if (silver) {
            silverCoins = `<span style="${GoFish.Styles.coinBox}"><span style="${GoFish.Styles.coinIcon} color: #C0C0C0;">&#9679;</span><span>${silver}</span></span>`;
        }
        if (bronze) {
            bronzeCoins = `<span style="${GoFish.Styles.coinBox}"><span style="${GoFish.Styles.coinIcon} color: #cd7f32;">&#9679;</span><span>${bronze}</span></span>`;
        }
        
        let coinTemplate = '';
        if (fish) {
            if (showWeight) {
                coinTemplate = `<div>the value of a <strong>${fish.weight} lb. ${fish.name}</strong> is: <strong>${value}gp</strong><div style="${GoFish.Styles.coinTray}>${goldCoins}${silverCoins}${bronzeCoins}</div></div>`;
            } else {
                coinTemplate = `<div>the value of a <strong>${fish.name}</strong> is: <strong>${value}gp</strong><div style="${GoFish.Styles.coinTray}>${goldCoins}${silverCoins}${bronzeCoins}</div></div>`;
            }
        } else {
            coinTemplate = `<div style="${GoFish.Styles.coinTray}>${goldCoins}${silverCoins}${bronzeCoins}</div>`;
        }
        return coinTemplate;
    },
    command: function(who, cmd, args) {
        let usr = '';
        who = who.toLowerCase();
        if (who.split(' ').length > 1) {
            who = who.split(' ');
            usr = who[0].substr(0, 1) + '.' + who[1].substr(0, 4);
        } else {
            usr = who.substr(0, 5);
        }
        let usrLbl = `<span style="${GoFish.Styles.usrLbl}"><strong>$${usr}:</strong>&#9;</span>`;
        let apiLbl = `<span style="${GoFish.Styles.apiLbl}"><strong>!go-fish</strong>&#9;</span>`;
        let cmdLbl = `<span style="${GoFish.Styles.cmdLbl}">${cmd}&#9;</span>`;
        let argsLbl = ``;
        for (var i = 0; i < args.length; i++) {
            argsLbl += `<span style="${GoFish.Styles.argsLbl}">${args[i]}&#9;</span>`;
        }
        
        return `<div style="${GoFish.Styles.cmdBox}">${usrLbl}${apiLbl}${cmdLbl}${argsLbl}</div>`
    },
    // no fish caught label
    emptyNet: function() {
      return `<div style="${GoFish.Styles.tooltip}">Nothing.</div>`;  
    },
    // error label
    error: function(msg) {
        return `<div style="${GoFish.Styles.errorBox}">${msg}</div>`;
    },
    // experience bar
    experienceBar: function(character, gainedXP, nextLvlAmount) {
        gainedXP = Math.round(gainedXP);
        let descriptor = `<div style="text-align: center; align-items: center;"><strong>${character.name}</strong> gained <strong>${gainedXP} fishing experience</strong>.</div>`;
        let currentWidth = (Number(character.xp - gainedXP) / nextLvlAmount) * 100;
        let currentXP = `<div style="width: ${currentWidth}%; background-color: #800080; height: 10px; display: table-cell;"></div>`;
        let newWidth = (Number(gainedXP) / nextLvlAmount) * 100;
        let newXP = `<div style="width: ${newWidth}%; background-color: #e200e2; height: 10px; display: table-cell;"></div>`;
        let remainingXP = `<div style="width:${100 - newWidth - currentWidth}%; height: 10px; display: table-cell;"></div>`;
        let bar = `<div style="${GoFish.Styles.experienceContainer};">${currentXP}${newXP}${remainingXP}</div>`;
        let experienceDiv = `<div style="text-align: center; align-items: center; display: table; width: 100%;"><span style="display: table-cell: width: 5%;"><strong>${character.fishingSkill}</strong></span><div style="display: table-cell; width: 90%; vertical-align: middle;">${bar}</div><span style="display: table-cell; width: 5%;"><strong>${character.fishingSkill + 1}</strong></span></div>`;
        let totalExperience = `<div style="text-align: center; align-items: center; font-size: 10px;"><strong>Total XP:</strong> ${character.xp} / ${nextLvlAmount}</div>`;
        return `<div style="${GoFish.Styles.tooltip}${GoFish.Styles.shadow} border: 1px solid black; align-items: center; text-align: center; vertical-align: middle;">${descriptor}${experienceDiv}${totalExperience}</div>`;
    },
    // template for a given fish
    fish: function(fish) {
        
        let metaData = undefined;
        let fishList = GoFish.Data.Game.FishList;
        for (let i = 0; i < fishList.length; i++) {
            if (fishList[i].name === fish.name) {
                metaData = fishList[i];
            }
        }
        let icon = '';
        let headerColor = '';
        if (fish.isEnemy) {
            icon = GoFish.Styles.fishIcons['enemy'];
            headerColor = GoFish.Styles.colors['danger'];
        } else {
            icon = GoFish.Styles.fishIcons[fish.size.name];
            headerColor = GoFish.Styles.colors[fish.rarity.name];
        }
        
        let fishIcon = `<span style="${GoFish.Styles.icon}">${icon}</span>`;
        let header = `<div style="background-color: ${headerColor}; padding: 5px;"><span style="${GoFish.Styles.header}">${fish.name}</span>${fishIcon}</div>`;
        let rarity = `<div style="${GoFish.Styles.listing}"><span style="${GoFish.Styles.listingKey}">Rarity</span><span style="${GoFish.Styles.listingValue}">${fish.rarity.name}</span></div>`;
        let weight = `<div style="${GoFish.Styles.listing}"><span style="${GoFish.Styles.listingKey}">Weight</span><span style="${GoFish.Styles.listingValue}">${fish.weight} lbs.</span></div>`;
        let size = `<div style="${GoFish.Styles.listing}"><span style="${GoFish.Styles.listingKey}">Size</span><span style="${GoFish.Styles.listingValue}">${fish.size.name}</span></div>`;
        let meta = '';
        if (metaData) {
            let recordStyle = GoFish.Styles.listing + 'font-size: 10px; background-color: #e6e6e6;';
            if (fish.weight === metaData.largestCaught) {
                recordStyle += 'color: #ff0000;';
            }
            meta = `<div style="${recordStyle}"><span style="${GoFish.Styles.listingKey}">Record</span><span style="${GoFish.Styles.listingValue}">${metaData.largestCaught} lbs. / ${metaData.recordHolder}</span></div>`;
        }
        
        return `<div style="${GoFish.Styles.container}">${header}${rarity}${weight}${size}${meta}</div>`;
    },
    // displays a list of fish caught over a period of time
    fishList: function(list) {
        if (list.length > 0) {
            let fishListings = ``;
            let totalValue = 0;
            for (let i = 0; i < list.length; i++) {
                let fish = list[i];
                let metaData = undefined;
                for (let j = 0; j < GoFish.Data.Game.FishList.length; j++) {
                    if (GoFish.Data.Game.FishList[j].name === fish.name) {
                        metaData = GoFish.Data.Game.FishList[j];
                    }
                }

                let backgroundColor = ``;
                let icon = '';                
                let cashOutButton = '';
                if (fish.isEnemy) {
                    backgroundColor = `background-color: ${GoFish.Styles.colors['danger']};`;
                    icon = GoFish.Styles.fishIcons['enemy'];
                } else {
                    backgroundColor = `background-color: ${GoFish.Styles.colors[fish.rarity.name]};`;
                    icon = GoFish.Styles.fishIcons[fish.size.name];
                    cashOutButton = GoFish.Templates.cashOutButton(fish);
                }
                
                let fishNameSpan = `<span style="${GoFish.Styles.fishNameSmall}">${icon}&#9;${fish.name}</span>`;
                let fishWeightSpan = `<span style="${GoFish.Styles.fishWeightSmall}">${fish.weight}lbs</span>`;
                let fishListing = `<div style="${GoFish.Styles.fishListing}${backgroundColor}${GoFish.Styles.shadow}">${fishNameSpan}${fishWeightSpan}<div style="display: table-cell; width: 25%; text-align: right;">${cashOutButton}</div></div>`;
                if (metaData === undefined) {
                    fishListings += `<div style="${GoFish.Styles.newFishWrapper}"> New! ${fishListing}</div>`;
                } else if (fish.weight === metaData.largestCaught) {
                    fishListings += `<div style="${GoFish.Styles.newRecordWrapper}"> New Record! ${fishListing}</div>`;
                } else {
                    fishListings += fishListing;
                }
                
               
            }
            return `<div style="${GoFish.Styles.fishListContainer}"><div style="${GoFish.Styles.fishList}">${fishListings}</div></div>`;
        } else {
            return GoFish.Templates.emptyNet();
        }
    },
    // summary for a fish list
    fishListSummary: function(size, totalCashoutValue, totalWeight) {
        let header = `<div style="${GoFish.Styles.list.header}">Fishing summary</div>`;
        let fishCaughtRow = `<div style="${GoFish.Styles.list.row}"><div style="${GoFish.Styles.list.labelCell}"># of fish caught</div><div style="${GoFish.Styles.list.valueCell}">${size}</div></div>`;
        let cashoutRow = `<div style="${GoFish.Styles.list.row}"><div style="${GoFish.Styles.list.labelCell}">cashout value</div><div style="${GoFish.Styles.list.valueCell}">${totalCashoutValue}gp</div></div>`;
        let weightRow = `<div style="${GoFish.Styles.list.row}"><div style="${GoFish.Styles.list.labelCell}">total weight</div><div style="${GoFish.Styles.list.valueCell}">${totalWeight}lbs</div></div>`;
        return `<div style="${GoFish.Styles.list.list}">${header}${fishCaughtRow}${cashoutRow}${weightRow}</div>`;
    },
    // template for GM Notes on the GoFish index
    gmIndex: function() {
        let table = `<table style="${GoFish.Styles.index.table}"><thead><tr style="${GoFish.Styles.index.headerRow}"><th>Fish</th><th>Size</th><th>Watersource</th><th>Avg. weight (lbs)</th><th>Drop rate</th></tr></thead><tbody>`;
        let freshwaterList = GoFish.Data.MASTER_FISH_LIST.Freshwater;
        let saltwaterList = GoFish.Data.MASTER_FISH_LIST.Saltwater;
        let projectedFishList = [];
        
        for (let j = 0; j < freshwaterList.length; j++) {
            let fish = freshwaterList[j];
            fish.type = 'freshwater';
            projectedFishList.push(fish);
        }
        
        for (let j = 0; j < saltwaterList.length; j++) {
            let fish = saltwaterList[j];
            fish.type = 'saltwater';
            projectedFishList.push(fish);
        }
        
        let prevPattern = undefined;
        for (let i = 0; i < projectedFishList.length; i++) {
            let fish = projectedFishList[i];
            let weight = 0;
            if (fish.weightOverride) {
                weight = fish.weightOverride;
            } else {
                weight = fish.size.baseWeight;
            }
            let style = '';
            let styleKey = '';
            if (fish.isEnemy) {
                styleKey = 'danger';
            } else {
                styleKey = fish.rarity.name;
            }
            if (styleKey !== prevPattern) {
                style = GoFish.Styles.index.rows[styleKey];
                prevPattern = styleKey;
            } else {
                style = GoFish.Styles.index.rows[styleKey + 'Striped'];
                prevPattern = styleKey + 'Striped';
            }
            let dropRate = GoFish.TABLE_DISTRIBUTIONS[fish.rarity.name] / 100;
            table += `<tr style="${style}"><td>${fish.name}</td><td>${fish.size.name}</td><td>${fish.type}</td><td>${weight}</td><td>${dropRate}%</td></tr>`;
        }
        
        table += `</tbody></table>`;
        
        return `<div><h2>GoFish Index</h2><h4>by theTexasWave</h4><br/>${table}</div>`;
    },
    // template for the Player Notes on the GoFish Index
    index: function() {
        let table = `<table style="${GoFish.Styles.index.table}"><thead><tr style="${GoFish.Styles.index.headerRow}"><th>Fish</th><th>Size</th><th>Watersource</th><th>Avg. weight (lbs)</th><th># caught</th><th>Largest caught (lbs)</th><th>Record holder</th></tr></thead><tbody>`;
        let fishList = GoFish.Data.Game.FishList;
        
        let prevPattern = undefined;
        for (let i = 0; i < fishList.length; i++) {
            let fish = fishList[i];
            let weight = 0;
            if (fish.weightOverride) {
                weight = fish.weightOverride;
            } else {
                weight = fish.size.baseWeight;
            }
            let style = '';
            let styleKey = '';
            if (fish.isEnemy) {
                styleKey = 'danger';
            } else {
                styleKey = fish.rarity.name;
            }
            if (styleKey !== prevPattern) {
                style = GoFish.Styles.index.rows[styleKey];
                prevPattern = styleKey;
            } else {
                style = GoFish.Styles.index.rows[styleKey + 'Striped'];
                prevPattern = styleKey + 'Striped';
            }
            
            table += `<tr style="${style}"><td>${fish.name}</td><td>${fish.size.name}</td><td>${fish.watersource}</td><td>${weight}</td><td>${fish.numberCaught}</td><td>${fish.largestCaught}</td><td>${fish.recordHolder}</td></tr>`;
        }
        
        table += `</tbody></table>`;
        
        return `<div><h2>GoFish Index</h2><h4>by theTexasWave</h4><hr/><br/><h3>Party fish list</h3><h4>Sorted by value</h4>${table}</div>`;
    },
    // level up!
    levelUp: function(name, fishingSkill) {
        return `<div style="${GoFish.Styles.levelUp}${GoFish.Styles.shadow} border: 1px solid black;">&#9757;&#9;<strong>${name}'s</strong> fishing skill increased to <strong>+${fishingSkill}</strong>!</div>`;
    },
    // displays when a player catches a new record
    newRecord: function(){
        let style = GoFish.Styles.newRecord + GoFish.Styles.glow;
        return `<div style="${style}">New record!</div>`;
    },
    // displays when a rod breaks
    rodBreaks: function(fishsize, durabilityCost) {
        let content = `&#10060;&#9;While attempting to catch a <strong>${fishsize}</strong> fish, your rod consumes <strong>${durabilityCost}</strong> durability and <strong>breaks</strong>.`;
        return `<div style="${GoFish.Styles.dangerTip}${GoFish.Styles.shadow} border: 1px solid black;">${content}</div>`;  
    },
    // a small popout for the passage of time
    time: function(time) {
        let style = GoFish.Styles.tooltip + GoFish.Styles.shadow + 'max-width: 150px;';
        
        if (time === GoFish.MINIMUM_FISHING_TIME) {
            style += GoFish.Styles.criticalSuccess;
        } else if (time === GoFish.MAXIMUM_FISHING_TIME) {
            style += GoFish.Styles.criticalFailure;
        } else {
            style += 'border: 1px solid black;'
        }
        
        return `<div style="${style}">&#128337;&#9;<strong>${time}</strong> minutes pass...</div>`;
    },
    // change in tool stats
    toolChange: async function(who, rollCount, multiplier = 0) {
        let style = GoFish.Styles.tooltip + GoFish.Styles.shadow + 'border: 1px solid black;';
        let template = await new Promise((resolve, reject) => {
            sendChat(GoFish.BOT_NAME, `[[${rollCount + multiplier}d8cs1cf8dh${rollCount-1}]]`, (rollResult) => {
                resolve(`<div style="${style}">&#127907;&#9;${who}'s fishing rod loses <strong>${rollResult[0].inlinerolls[0].results.total}</strong> durability.</div>`);
            });
        });
        return template;
    },
    // tool stats changes
    toolStats: function(rodDurability, maxDurability, durabilityCost) {
        let fw = (maxDurability - rodDurability - durabilityCost) / maxDurability * 100;
        let fl = `<div style="display: table-cell; height: 4px; width:${fw}%;"></div>`;
        let cw = durabilityCost / maxDurability * 100;
        let dl = `<div style="display: table-cell; background-color: #ffa500; border: 1px solid #ff8400; height: 4px; border-radius: 2px; width:${cw}%;"></div>`;
        let hw = ((rodDurability - durabilityCost) / maxDurability)  * 100;
        let rh = `<div style="display: table-cell; background-color: #00ff00; border: 1px solid #00ffa2; height: 4px; border-radius: 2px; width:${hw}%;"></div>`;
        let bar = `<div style="${GoFish.Styles.durability.bar}">${rh}${dl}${fl}</div>`;
        let label = `<div style="font-size: 10px; text-align: center; align-items: center;">&#127907;&#9;<strong>Rod durability: </strong> ${rodDurability - durabilityCost} \/ ${maxDurability}</div>`;
        let usage = `<div style="font-size: 10px; text-align: center; align-items: center; "><strong>${durabilityCost}</strong> rod durability consumed...</div>`;
        return `<div style="${GoFish.Styles.tooltip}${GoFish.Styles.shadow}; border: 1px solid black;">${usage}<div style="text-align: center; align-items: center; ">${bar}</style>${label}</div>`;
    },
    // printed for GoFish usage
    usage: function() {
        // header
        let header = `<h3>GoFish!</h3>`;
        let subtitle = `<h5><em>by theTexasWave</em> | ${GoFish.Data.VERSION_NUMBER} </h5>`;
        let usage = `<p><i>Select a character, or a group of characters to fish. Then enter an API command in the following format.</i></p>`;
        let mainUsage = `<div style="${GoFish.Styles.cmdBox}"><span style="${GoFish.Styles.apiLbl}">!go-fish&#9;</span><span style="${GoFish.Styles.cmdLbl}">[command]</span> <span style="${GoFish.Styles.argsLbl}"><i>[options, ...]</i></span></div>`;
        
        // reset
        let resetCmd = `<div style="${GoFish.Styles.cmdBox}"><span style="${GoFish.Styles.apiLbl}">!go-fish</span><span style="${GoFish.Styles.cmdLbl}">&#9;reset</span></div>`;
        let reset = `<div><h4>reset</h4></p>${resetCmd}<p style="${GoFish.Styles.paragraph}"><i>(GM Only) Resets GoFish to a new game.</i></div>`;
        
        // fishing
        let waterSource = `<p style="${GoFish.Styles.paragraph}"><b>water-source</b> - (required): freshwater | saltwater</p>`;
        let poolType = `<p style="${GoFish.Styles.paragraph}"><b>pool-type</b> - (optional): lesser (default) | common | greater</p>`;
        let fishingCmd = `<div style="${GoFish.Styles.cmdBox}"><span style="${GoFish.Styles.apiLbl}">!go-fish&#9;</span><span style="${GoFish.Styles.cmdLbl}">[water-source]&#9;</span><span style="${GoFish.Styles.argsLbl}">[pool-type]</span></div>`;
        let fishing = `<div><h4>fishing</h4>${fishingCmd}<p style="${GoFish.Styles.paragraph}"><i>Catches a fish in X amount of time. The fish in the pool are decided by the water type and the pool rarity.</i></p>${waterSource}${poolType}</div>`;
        
        // time-fish
        let time = `<p style="${GoFish.Styles.paragraph}"><b>time</b> - (required): number in minutes of how long you would like to fish.</p>`;
        let timeFishCmd = `<div style="${GoFish.Styles.cmdBox}"><span style="${GoFish.Styles.apiLbl}">!go-fish&#9;</span><span style="${GoFish.Styles.cmdLbl}">time&#9;</span><span style="${GoFish.Styles.argsLbl}">[time] [water-source] [pool-type]</span></div>`;
        let timeFish = `<div><h4>time</h4>${timeFishCmd}<p style="${GoFish.Styles.paragraph}"><i>Each player catches as many fish in the given amount of time as possible. The fish in the pool are decided by the water type and the pool rarity.</i></p>${time}${waterSource}${poolType}</div>`;
        
        // fishamount
        let amount = `<p style="${GoFish.Styles.paragraph}"><b>amount</b> - (required): the number of fish to catch.</p>`;
        let fishamountCmd = `<div style="${GoFish.Styles.cmdBox}"><span style="${GoFish.Styles.apiLbl}">!go-fish&#9;</span><span style="${GoFish.Styles.cmdLbl}">amount&#9;</span><span style="${GoFish.Styles.argsLbl}">[amount] [water-source] [pool-type]</span></div>`;
        let fishamount = `<div><h4>amount</h4>${fishamountCmd}<p style="${GoFish.Styles.paragraph}"><i>The group fishes for X amount of fish as quickly as possible. Players catch fish indiscriminately of one another, meaning that oftentimes some players will have more fish than others. The fish in the pool are decided by the water type and the pool rarity.</i></p>${amount}${waterSource}${poolType}</div>`;
        
        // valueof
        let fishname = `<p style="${GoFish.Styles.paragraph}"><b>fishname</b> - (required): a valid fishname from any of the GoFish tables. If the name has a space, wrap in quotes <i>ex: "The Poolmaker"</i></p>`;
        let weight = `<p style="${GoFish.Styles.paragraph}"><b>weight</b> - (optional): a number representing lbs</p>`;
        let valueofCmd = `<div style="${GoFish.Styles.cmdBox}"><span style="${GoFish.Styles.apiLbl}">!go-fish&#9;</span><span style="${GoFish.Styles.cmdLbl}">valueof&#9;</span><span style="${GoFish.Styles.argsLbl}">[fishname] [weight]</span></div>`;
        let valueof = `<div><h4>valueof</h4>${valueofCmd}<p style="${GoFish.Styles.paragraph}"><i>Fetches the value of a given fish, adjusts for its weight if provided.</i></p>${fishname}${weight}</div>`;
        
        // cashout
        let cashoutCmd = `<div style="${GoFish.Styles.cmdBox}"><span style="${GoFish.Styles.apiLbl}">!go-fish&#9;</span><span style="${GoFish.Styles.cmdLbl}">cashout&#9;</span><span style="${GoFish.Styles.argsLbl}">[fishname] [weight]</span></div>`;
        let cashout = `<div><h4>cashout</h4>${cashoutCmd}<p style="${GoFish.Styles.paragraph}"><i>Immediately cashes out a given fish for 40% of its actual value.</i></p>${fishname}${weight}</div>`;
        
        return `<div style="${GoFish.Styles.usage}">${header}${subtitle}<hr/>${usage}${mainUsage}<hr/>${fishing}<hr/>${timeFish}<hr/>${fishamount}<hr/>${valueof}<hr/>${cashout}<hr/>${reset}</div>`;
    }
}

// Main Class ==================================================================
// The meat of the GoFish application
GoFish.GoFish = function() {

    // Region: Business Logic ==================================================
    
    // cashes out a given fish
    this.cashOut = function(who, fishname, weightArg) {
        let fish = this.getFishByName(fishname);

        if (fish === undefined) {
            throw new Error(`[Error] '${fishname}' is not a valid fish.`);
        } else {
            let weight = 0;
            if (weightArg === '') {
                if (fish.sizeOverride) {
                    weight = fish.sizeOverride;
                } else {
                    weight = fish.size.baseWeight;
                }
            } else {
                weight = Number(weightArg);
            }
        
            fish.weight = weight;
            let value = this.computeValue(fish);
            
            // two decimal places
            let cashOutValue = Math.floor(value * GoFish.CASH_OUT_PERCENTAGE * 100);
            cashOutValue = cashOutValue / 100;
            
            let coinTemplate = GoFish.Templates.coin(cashOutValue);
            let template;
            if (weightArg !== '') {
                template = `<div><strong>${who}</strong> cashed out a <strong>${fish.weight}lb ${fish.name}</strong> for <strong>${cashOutValue}gp</strong>${coinTemplate}<div style="${GoFish.Styles.subtext}">(${value}gp * 40% = ${cashOutValue}gp)</div></div>`;
            } else {
                template = `<div><strong>${who}</strong> cashed out a <strong>${fish.name}</strong> for <strong>${cashOutValue}gp</strong>${coinTemplate}<div style="${GoFish.Styles.subtext}">(${value}gp * 40% = ${cashOutValue}gp)</div></div>`;
            }
            sendChat(GoFish.BOT_NAME, `/w ${who} ${template}`);
            sendChat(GoFish.BOT_NAME, `/w gm ${template}`);
        }
    }
    
    // the fish-amount minigame: catches X amount of fish as quickly as posisble
    // utilitizing faster fishing rolls from all group members, resulting in an
    // uneven haul.
    this.amount = async function(tokens, amount, source, level) {
        if (tokens.length > 1) {
            sendChat(GoFish.BOT_NAME, `/em - ${tokens.length} players enter a fishing tourney for ${amount} fish.`);
        } else {
            sendChat(tokens[0].get("name"), `/desc /em attempts to catch ${amount} fish.`);
        }
        
        let table = this.getTable(source, level);
        
        let runningTotal = 0;
        let lastTimeMarker  = 0;
        
        let fishermanTable = this.createFishermanQueue(tokens);
        let tappedOut = [];
        let totalXP = 0;
        // catch fish
        while (runningTotal < amount && fishermanTable.length > 0) {
            let fisherman = fishermanTable.shift();
            lastTimeMarker = Number(fisherman.timeMarker);
            let fish = await this.catchFish(fisherman.fishingSkill, table);
            let durabilityCost = this.rollDurabilityCost(fish, fisherman.rollCount);
            fisherman.rod.runningDurabilityCost += durabilityCost;
            
            if (fisherman.rod.durability >= fisherman.rod.runningDurabilityCost) {
                fisherman.fish.push(fish);
                runningTotal += 1;
                fisherman.timeMarker += this.rollFishingTime(fisherman.rollCount);
                fisherman.runningWeight += fish.weight;
                totalXP += this.calculateXP(fish);
                this.insertIntoFishermanQueue(fishermanTable, fisherman);
                
                if(!fish.isEnemy) {
                    fisherman.totalValue += this.computeValue(fish);
                }
            } else {
                fisherman.rod.brokeBy = {
                    fish: fish,
                    cost: durabilityCost
                };
                tappedOut.push(fisherman);
            }
        }

        let xpShare = Math.floor(totalXP / tokens.length);
        
        // print all catches
        fishermanTable = fishermanTable.concat(tappedOut);

        for (let i = 0; i < fishermanTable.length; i++) {
            let fisherman = fishermanTable[i];
            // header
            sendChat(fisherman.name, `/em Results`);
            
            // time
            sendChat(GoFish.BOT_NAME, GoFish.Templates.time(lastTimeMarker));
            
            // format value
            let cashoutValue = Math.round(fisherman.totalValue * 0.4 * 100) / 100;
            fisherman.runningWeight = Math.round(fisherman.totalValue * 100) / 100;
            fisherman.totalValue = Math.round(fisherman.totalValue * 100) / 100;
            sendChat(GoFish.BOT_NAME, GoFish.Templates.fishListSummary(fisherman.fish.length, cashoutValue, fisherman.runningWeight));
            
            // xp
            this.awardCharacterXP(fisherman.token, xpShare);
            sendChat(GoFish.BOT_NAME, `<h4>${fisherman.name} caught...</h4>${GoFish.Templates.fishList(fisherman.fish)}`);
            
            // rod status
            if (fisherman.rod.durability >= fisherman.rod.runningDurabilityCost) {
                // tool deprecation
                this.getAttribute(fisherman.token, "RodDurability").set("current", fisherman.rod.durability - fisherman.rod.runningDurabilityCost);
                sendChat(GoFish.BOT_NAME, GoFish.Templates.toolStats(fisherman.rod.durability, fisherman.rod.maxDurability, fisherman.rod.runningDurabilityCost));
            } else {
                // set cost to zero
                this.getAttribute(fisherman.token, "RodDurability").set("current", 0);
                sendChat(GoFish.BOT_NAME, GoFish.Templates.rodBreaks(fisherman.rod.brokeBy.fish.size.name, fisherman.rod.brokeBy.cost));
            }
            
            // update all entries
            for (let j = 0; j < fisherman.fish.length; j++) {
                this.updateFishIndex(fisherman.token, fisherman.fish[j]);
            }
        }
        
        sendChat(GoFish.BOT_NAME, '/em Fishing tourney over!');
    }
    
    // the fish-for minigame: catches as many fish in
    // X amount as time aspossible
    this.time = async function(tokens, timeLimit, source, level) {
        
        if (tokens.length > 1) {
            sendChat(GoFish.BOT_NAME, `/em - ${tokens.length} players enter a ${timeLimit} minute long fishing tourney.`);
        } else {
            sendChat(tokens[0].get("name"), `/em fishes for ${timeLimit} minutes.`);
        }
        
        let table = this.getTable(source, level);
        
        // display
        for(let i = 0; i < tokens.length; i++) {
            let token = tokens[i];
            const name = token.get("name");
            let fishingSkill = this.getFishingSkill(token);
            let rollCount = this.getFishingRollCount(fishingSkill);
            
            let rod = this.getFishingRod(token);
            let runningTime = 0;
            let runningXP = 0;
            let totalValue = 0;
            let runningWeight = 0;
            runningTime += this.rollFishingTime(rollCount);
            let catches = [];
            while (runningTime < timeLimit)
            {
                let fish = await this.catchFish(fishingSkill, table);
                let durabilityCost =  this.rollDurabilityCost(fish, rollCount);
                rod.runningDurabilityCost += durabilityCost;
                log(durabilityCost + ' ' + JSON.stringify(rod));
                if (rod.durability >= rod.runningDurabilityCost) {
                    catches.push(fish);
                    runningTime += this.rollFishingTime(rollCount);
                    runningXP += this.calculateXP(fish);
                    runningWeight += fish.weight;
                    if(!fish.isEnemy) {
                        totalValue += this.computeValue(fish);
                    }
                } else {
                    runningTime = timeLimit;
                    rod.brokeBy = {
                        fish: fish,
                        cost: durabilityCost
                    };
                }
            }

            // round and calculate values
            totalValue = Math.floor(totalValue * 100) / 100;
            runningWeight = Math.floor(runningWeight * 100) / 100;
            let totalCashoutValue = totalValue * 0.4;
            totalCashoutValue = Math.floor(totalCashoutValue * 100) / 100;
            // Print results
            sendChat(name, `/em Results`);
            
            // time passed
            sendChat(GoFish.BOT_NAME, GoFish.Templates.time(timeLimit));
            
            // summary
            sendChat(GoFish.BOT_NAME, GoFish.Templates.fishListSummary(catches.length, totalCashoutValue, runningWeight));
            
            // rod status
            if (rod.durability >= rod.runningDurabilityCost) {
                // tool deprecation
                this.getAttribute(token, "RodDurability").set("current", rod.durability - rod.runningDurabilityCost);
                sendChat(GoFish.BOT_NAME, GoFish.Templates.toolStats(rod.durability, rod.maxDurability, rod.runningDurabilityCost));
            } else {
                // set cost to zero
                this.getAttribute(token, "RodDurability").set("current", 0);
                sendChat(GoFish.BOT_NAME, GoFish.Templates.rodBreaks(rod.brokeBy.fish.size.name, rod.brokeBy.cost));
            }
            
            // experience
            this.awardCharacterXP(token, runningXP);
            
            // fish list
            sendChat(GoFish.BOT_NAME, `<h4>${name} caught...</h4>${GoFish.Templates.fishList(catches)}`);
            
            // update fish entries
            for (let i = 0; i < catches.length; i++) {
                this.updateFishIndex(token, catches[i]);
            }
        };
        
        sendChat(GoFish.BOT_NAME, '/em Fishing tourney over!');
    }
    
    // main minigame logic
    this.goFishing = async function(token, source, level) {
        const name = token.get("name");
        let table = this.getTable(source, level);
        
        let fishingSkill = this.getFishingSkill(token);
        let rollCount = this.getFishingRollCount(fishingSkill);
        
        sendChat(name, `/em begins to fish.`);
        
        // Roll time
        let timeRoll = this.rollFishingTime(rollCount);
        
        // roll fish
        let fish = await this.catchFish(fishingSkill, table);
        let durabilityCost = this.rollDurabilityCost(fish, rollCount);
        let durabilityAtr = this.getAttribute(token, "RodDurability");

        if (!durabilityAtr) {
            throw new Error("Character must have a positive 'RodDurability' attribute with a Current and Max..");
        }
        
        let maxDurability = durabilityAtr.get("max");
        let rodDurability = durabilityAtr.get("current");
        
        if (durabilityCost <= rodDurability) {
        
            // subtract cost
            this.getAttribute(token, "RodDurability").set("current", rodDurability - durabilityCost);
            
            let xp = this.calculateXP(fish);
    
            // Complete
            log(name + " rolled a " + JSON.stringify(fish));
            
            // Formatting and display
            let hasBeenDiscovered = this.hasBeenDiscovered(fish.name);
            let breaksNewRecord = this.breaksNewRecord(fish);
            this.updateFishIndex(token, fish);
            
            // time cost
            sendChat(GoFish.BOT_NAME, GoFish.Templates.time(timeRoll));
            
            // dialogue
            sendChat(GoFish.BOT_NAME, this.getDialogue('oncatch', [fish.size.name]));
            
            // badges
            if (!hasBeenDiscovered) {
                sendChat(GoFish.BOT_NAME, `<div style="${GoFish.Styles.newLbl}">New!</div>`)
            } else if (breaksNewRecord) {
                sendChat(GoFish.BOT_NAME, GoFish.Templates.newRecord());
            }
            
            // fish view
            let template = GoFish.Templates.fish(fish);
            sendChat(GoFish.BOT_NAME, template);
            
            // tool deprecation
            sendChat(GoFish.BOT_NAME, GoFish.Templates.toolStats(rodDurability, maxDurability, durabilityCost));
            
            this.awardCharacterXP(token, xp);
            
            // cash out button
            if (!fish.isEnemy) {
                sendChat(GoFish.BOT_NAME, GoFish.Templates.cashOutButton(fish));
            }
        } else {
            // set cost to zero
            this.getAttribute(token, "RodDurability").set("current", 0);
            sendChat(GoFish.BOT_NAME, GoFish.Templates.rodBreaks(fish.size.name, durabilityCost));
        }
    };
    
    // retrieves the value of a fish, adjusted by weight if provided
    this.getValueOf = function(fishname, weightArg) {
        let fish = this.getFishByName(fishname);

        if (fish === undefined) {
            throw new Error(`[Error] '${fishname}' is not a valid fish.`);
        } else {
            let weight = 0;
            if (weightArg === '') {
                if (fish.sizeOverride) {
                    weight = fish.sizeOverride;
                } else {
                    weight = fish.size.baseWeight;
                }
            } else {
                weight = Number(weightArg);
            }
        
            fish.weight = weight;
            let value = this.computeValue(fish);
            
            let coinTemplate = GoFish.Templates.coin(value, fish, weightArg !== '');
            let fishTemplate = GoFish.Templates.fish(fish);
            let template = `<div style="${GoFish.Styles.profileBox}"><div style="${GoFish.Styles.profileColumn}">${coinTemplate}</div><div style="${GoFish.Styles.profileColumn}">${fishTemplate}</div></div>`;
            sendChat(GoFish.BOT_NAME, template);
        }
    }

    // Region: Utility Functions ===============================================

        // awards XP to a character, prints a chart displaying progress
    this.awardCharacterXP = function(token, xp) {
        // get character data
        let character;
        let characterList = GoFish.Data.Game.Characters;

        for (let i = 0; i < characterList.length; i++) {
            if (characterList[i].name === token.get("name")) {
                character = characterList[i];
            }
        }
  
        // initialize if not found
        if (!character) {
            let fishingSkill = this.getAttribute(token, "Fishing").get("current");
            character = {
                name: token.get("name"),
                fishingSkill: Number(fishingSkill),
                xp: 0
            };
            GoFish.Data.Game.Characters.push(character);
        }

        character.xp = Math.round(character.xp + xp);
        let xpLimit = this.getXPForNextLevel(character.fishingSkill);

        // level skill up
        if (character.xp >= xpLimit) {
            character.fishingSkill += 1;
            character.xp -= xpLimit;
            sendChat(GoFish.BOT_NAME, GoFish.Templates.levelUp(character.name, character.fishingSkill));
            let fishingAttribute = this.getAttribute(token, "Fishing");
            fishingAttribute.set("current", character.fishingSkill);
            xpLimit = this.getXPForNextLevel(character.fishingSkill);
            
            xp = character.xp   // set this for the experience bar to display properly
        }
        
        
        // update character list
        for (let i = 0; i < characterList.length; i++) {
            if (characterList[i].name === character.name) {
                characterList[i] = character;
            }
        }
        
        // update game data
        GoFish.Data.Game.Characters = characterList; 
        state.GoFish = GoFish.Data.Game;

        sendChat(GoFish.BOT_NAME, GoFish.Templates.experienceBar(character, xp, xpLimit));
    }

    // returns boolean indicating if caught fish
    // breaks a record, false otherwise or hasn't
    // been discovered
    this.breaksNewRecord = function(fish) {
        let fishList = GoFish.Data.Game.FishList;
        for (let i = 0; i < fishList.length; i++) {
            if (fishList[i].name === fish.name) {
                let entry = fishList[i];
                if (fish.weight > entry.largestCaught) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // calculates the xp value of a catch,
    // based on weight and rarity
    this.calculateXP = function(fish) {
        let xp = fish.rarity.xp;
        let denominator;
        if (fish.weightOverride) {
            denominator = fish.weightOverride;
        } else {
            denominator = fish.size.baseWeight;
        }
        xp *= (fish.weight / denominator);
        return xp;
    }
    
    // the business logic for catching a fish
    this.catchFish = async function(fishingSkill, table) {
        // fishing rolls determined by skill
        let rolls = [];
        let rollCount = this.getFishingRollCount(fishingSkill);

        // make the rolls
        for (let i = 0; i < rollCount; i++) {
            let fish = await this.rollFish(table);
            rolls.push(fish);
        }
        
        // continue up chain until
        let fish = rolls[0];
        for (let i = 1; i < rolls.length; i++) {
            if (this.compareValue(fish, rolls[i]) === rolls[i]) {
                fish = rolls[i];
            }
        }
        
        return fish;
    }
    
    // compares the rarity of two fishes and
    // returns the rarer one (or the 1st fish 
    // if equivalent )
    this.compareRarity = function(fish1, fish2) {
        if (fish1.rarity.rank > fish2.rarity.rank) {
            return fish1;
        } else if (fish1.rarity.rank < fish2.rarity.rank){
            return fish2;
        } else if (fish1.rarity.rank === fish2.rarity.rank){
            // check by size
            if (fish1.size.rank > fish2.size.rank) {
                return fish1;
            } else if (fish1.size.rank < fish2.size.rank) {
                return fish2;
            } else if (fish1.size.rank === fish2.size.rank) {
                // check by alphabet
                if (fish1.name < fish2.name) {
                    return fish1;
                } else if (fish1.name > fish2.name) {
                    return fish2;
                } else if (fish1.name === fish2.name) {
                    // equivalent
                    return fish1;
                }
            }
        }
    }

    // compares the value of two fishes and
    // returns the more valuable one (or the 1st fish 
    // if equivalent )
    this.compareValue = function(fish1, fish2) {
        let value1 = this.computeValue(fish1);
        let value2 = this.computeValue(fish2);
        if (value1 >= value2) {
            return fish1;
        } else {
            return fish2;
        }
    }

    // computes the value of a fish based
    // on weight and species
    this.computeValue = function(fish) {
        // get base value and multiplier
        let value = fish.rarity.value;
        let weightMultiplier = fish.weight / fish.size.baseWeight;
 
        // multiply to two decimal places
        value = Math.round(value * weightMultiplier * 100);
        value = value / 100;
        
        return value;
    }
    
    // creates a queue of fisherman from given tokens
    this.createFishermanQueue = function(tokens) {
        let queue = [];
        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i];
            let fishingSkill = this.getFishingSkill(token);
            let rollCount = this.getFishingRollCount(fishingSkill);
            let timeMarker = this.rollFishingTime(rollCount);
            let rodDurability = this.getAttribute(token, "RodDurability");
            if (!rodDurability) {
                rodDurability = GoFish.ROD_DURABILITY_DEFAULT;
            }
            let fisherman = {
                name: token.get("name"),
                fishingSkill: fishingSkill,
                rodDurability: rodDurability,
                rollCount: rollCount,
                timeMarker: timeMarker,
                fish: [],
                token: token,
                xpGain: 0,
                totalValue: 0,
                rod: this.getFishingRod(token),
                runningWeight: 0
            };
            this.insertIntoFishermanQueue(queue, fisherman);
        }
        return queue;
    }
    
    this.insertIntoFishermanQueue = function(queue, fisherman) {
        if (queue.length === 0) {
            queue.push(fisherman);
        } else {
            let added = false;
            for (let i = 0; i < queue.length; i++) {
                if (queue[i].timeMarker > fisherman.timeMarker) {
                    queue.splice(i, 0, fisherman);
                    added = true;
                    break;
                }
            }
            if (!added) {
                queue.push(fisherman);
            }
        }
    }
    
    // retrieves random, descriptive dialogue
    // for the user's fishing encounter.
    this.getDialogue = function(type, args) {
        let typeDict = Object.assign({}, GoFish.Data.Dialogue[type]);
        if (typeDict) {
            let dict = typeDict;
            for (let i = 0; i < args.length; i++) {
                // traverse to our dialogue
                dict = dict[args[i]];
            }
            
            // select one randomly
            let roll = Math.floor(Math.random() * dict.length);
            let dialogue = dict[roll];
            return dialogue;
        } else {
            throw new Error(`[Invalid] Dialogue of type '${type}' does not exist.`);
        }
    }

    // retrieves a fish from the master fish list by name
    this.getFishByName = function(name) {
        name = name.replace(' ', '').toLowerCase();
        let fishList = GoFish.Data.MASTER_FISH_LIST.Freshwater.concat(GoFish.Data.MASTER_FISH_LIST.Saltwater);
        for (let i = 0; i < fishList.length; i++) {
            let fish = fishList[i];
            if (fish.name.replace(' ', '').toLowerCase() === name) {
                return fish;
            }
        }
    };
    
    // returns a fishing rod object for given token
    this.getFishingRod = function(token) {
        let durabilityAtr = this.getAttribute(token, "RodDurability");

        if (!durabilityAtr) {
            throw new Error("Character must have a positive 'RodDurability' attribute with a Current and Max.");
        }
        
        let maxDurability = durabilityAtr.get("max");
        let rodDurability = durabilityAtr.get("current");

        let rod = {
            durability: rodDurability,
            maxDurability: maxDurability,
            runningDurabilityCost: 0
        };
        
        return rod;
    }
    
    // calculates number of rolls for a fishing skill
    this.getFishingRollCount = function(fishingSkill) {
        let rollCount = Math.floor(fishingSkill / 2);
        if (rollCount <= 0) {
            rollCount = 1;
        }
        return rollCount;
    }
    
    // calculates the fishing skill for given token
    this.getFishingSkill = function(token) {
        // get fishing skill, our multiplier
        let dex = this.getAttribute(token, "DEX");
        let fishingSkill = 0.0;
        if (dex === undefined) {
            let dexterity = Number(this.getAttribute(token, "Dexterity").get("current"));
            dexterity = Math.floor((dexterity - 10) / 2);
            fishingSkill = fishingSkill + dexterity;
        } else {
            fishingSkill = fishingSkill + Number(dex.get("current"));
        }
        
        fishingSkill = fishingSkill + Number(this.getAttribute(token, "Fishing").get("current"));
        
        // create multiplier
        if (fishingSkill < 0) {
            // inverse multiplier
            fishingSkill = 1 / (fishingSkill * -1);
        } else if (fishingSkill == 0) {
            // avoid divide by zero
            fishingSkill = 1; 
        }
        
        return fishingSkill;
    }
    
    // returns the appropriate table by source and level
    this.getTable = function(source, level) {
        // select table name
        let table = '';
        if (source === 'freshwater') {
            if (level === 'greater') {
               table = GoFish.FRESHWATER_GREATER;
            } else if (level === 'lesser') {
               table = GoFish.FRESHWATER_LESSER;
            } else if (level === 'common') {
               table = GoFish.FRESHWATER_COMMON;
            }
        } else if (source === 'saltwater') {
            if (level === 'greater') {
               table = GoFish.SALTWATER_GREATER;
            } else if (level === 'lesser') {
               table = GoFish.SALTWATER_LESSER;
            } else if (level === 'common') {
               table = GoFish.SALTWATER_COMMON;
            }
        };
        
        return table;
    }
    
    // returns the water source type for given fish name
    this.getWaterSource = function(fishname) {
        let freshwater = GoFish.Data.MASTER_FISH_LIST.Freshwater;
        let saltwater = GoFish.Data.MASTER_FISH_LIST.Saltwater;
        for (let i = 0; i < freshwater.length; i++) {
            if (freshwater[i].name === fishname) {
                return 'freshwater';
            }
        }
        
        for (let i = 0; i < saltwater.length; i++) {
            if (saltwater[i].name === fishname) {
                return 'saltwater';
            }
        }
        
        return '';
    }
    
    // retrieves the amount of xp needed to level up
    this.getXPForNextLevel = function(currentFishingSkill) {
        return (Math.pow(3, Number(currentFishingSkill))) * GoFish.XP_STEP;
    }
    
    // returns boolean indicating if given fish has
    // yet been discovered by players
    this.hasBeenDiscovered = function(fishname) {
        let fishList = GoFish.Data.Game.FishList;
        for (let i = 0; i < fishList.length; i++) {
            if (fishList[i].name === fishname) {
                return true;
            }
        }
        return false;
    }
    
    // prints the parsed command in a user-friendly template
    this.printCommand = function(who, cmd, args) {
        sendChat(GoFish.BOT_NAME, GoFish.Templates.command(who, cmd, args));
    }
    
    // sends an error in-template
    this.printError = function(msg) {
        sendChat(GoFish.BOT_NAME, GoFish.Templates.error(msg));
    }
    
    // prints the help template for usage guide
    this.printUsage = function() {
        sendChat(GoFish.BOT_NAME, GoFish.Templates.usage());
    };
    
    // rolls the durability cost for a given fish
    this.rollDurabilityCost = function(fish, rollCount) {
        let cost = 1000;
        for (let i = 0; i < rollCount; i++) {
            let roll = Math.floor(Math.random() * fish.size.rigor) + 1;
            if (roll < cost) {
                cost = roll;
            }
        }
        return cost;
    }
    
    // rolls a fish from the given table
    this.rollFish = async function(table) {
        let retFish = await new Promise((resolve, reject) => {
           sendChat(GoFish.BOT_NAME, "/roll 1t[" + table + "]", (rollResult) => {
                // analyze fish
                let result = JSON.parse(rollResult[0].content);
                let roll = result.rolls[0];
                let fishname = roll.results[0].tableItem.name;
                let fish = this.getFishByName(fishname);
                // calculate weight of fish
                let weight = 0;
                // fish is between 50% and 150% of base weight
                let randomWeight = Math.random() + 0.5;
                if (fish.weightOverride) {
                    weight = Number(fish.weightOverride);
                } else {
                    weight = fish.size.baseWeight;
                }
                // set weight at two decimal places
                weight = Math.round(weight * randomWeight * 100);
                weight = weight / 100;
                
                fish.weight = weight;
                resolve(fish);
            });
        });
        
        return retFish;
    };
    
    // rolls how long it takes to get a bite
    this.rollFishingTime = function(rollCount) {
        let rollTime = Math.floor(Math.random() * GoFish.MAXIMUM_FISHING_TIME);
        
        for(let i = 0; i < rollCount; i++) {
            let roll = Math.floor(Math.random() * GoFish.MAXIMUM_FISHING_TIME);
            if (roll < rollTime) {
                rollTime = roll;
            }
        }
        
        // boundaries
        if (rollTime < GoFish.MINIMUM_FISHING_TIME) {
            rollTime = GoFish.MINIMUM_FISHING_TIME;
        }
        
        return rollTime;
    }
    
    // Region: Internal methods ================================================
    
    // applies the Fishing Attribute to all characters if it doesn't already exist
    this.applyFishingToAll = function() {
        let characters = findObjs({type: "character"});
        for (var i = 0; i < characters.length; i++) {
            let fishingAttribute = findObjs({type: "attribute", characterid: characters[i].id, name: "Fishing"})[0];
            if (fishingAttribute === undefined) {
                createObj("attribute", {
                    name: "Fishing",
                    current: 0,
                    characterid: characters[i].id
                });
                log("Applied 'Fishing' attribute to '" + characters[i].name + "'.");
            }
        }
    };
    
    // removes all go-fish tables
    // NOTE: if this script remains installed, they will be
    //       added again upon the next game-ready.
    this.clearTables = function() {
        
        log("Clearing all GoFish tables...");
        
        const tables = findObjs({
            _type: "rollabletable"
        });
        
        for (let i = 0; i < tables.length; i++) {
            let table = tables[i];
            if (GoFish.Data.TABLE_NAME_LIST.includes(table.get("name"))) {
                table.remove();
            }
        }
    };
    
    // retrieves attribute for a given token
    this.getAttribute = function(token, attribute) {
        try {
            var character = findObjs({type: 'character', _id: token.get('represents')})[0];
            var attribute = findObjs({ type: 'attribute', characterid: character.id, name: attribute   })[0];
            return attribute;
        } catch (ex) {
            return undefined;
        }
    }
    
    // initializes settings and gameobjects
    this.initialize = function() {
        const tables = findObjs({
            _type: "rollabletable"
        });
        let tableNames = [];
        for (let i = 0; i < tables.length; i++) {
            let table = tables[i];
            tableNames.push(table.get("name"));
        }
        
        // Create Freshwater fish tables
        // Lesser Freshwater Fish
        if (!tableNames.includes(GoFish.FRESHWATER_LESSER)) {
            this.populateTable(
                'freshwater',
                GoFish.FRESHWATER_LESSER,
                {
                   rarities: [
                       GoFish.FISH_RARITIES.common, 
                       GoFish.FISH_RARITIES.uncommon
                   ] 
                }
            );
        }
        // Common Freshwater Fish
        if(!tableNames.includes(GoFish.FRESHWATER_COMMON)) {
            this.populateTable(
                'freshwater',
                GoFish.FRESHWATER_COMMON,
                {
                   rarities: [
                       GoFish.FISH_RARITIES.common, 
                       GoFish.FISH_RARITIES.uncommon,
                       GoFish.FISH_RARITIES.rare,
                       GoFish.FISH_RARITIES.epic
                   ] 
                }
            );
        }
        // Greater Freshwater Fish
        if(!tableNames.includes(GoFish.FRESHWATER_GREATER)) {
            this.populateTable(
                'freshwater',
                GoFish.FRESHWATER_GREATER,
                {
                    rarities: [
                       GoFish.FISH_RARITIES.uncommon,
                       GoFish.FISH_RARITIES.rare,
                       GoFish.FISH_RARITIES.epic,
                       GoFish.FISH_RARITIES.legendary
                    ]
                }
            );
        }
        
        // Create Saltwater fish tables
        // Lesser Saltwater fish
        if(!tableNames.includes(GoFish.SALTWATER_LESSER)) {
            this.populateTable(
                'saltwater',
                GoFish.SALTWATER_LESSER,
                {
                   rarities: [
                       GoFish.FISH_RARITIES.common, 
                       GoFish.FISH_RARITIES.uncommon
                   ] 
                }
            );
        }
        // Common Saltwater fish
        if(!tableNames.includes(GoFish.SALTWATER_COMMON)) {
            this.populateTable(
                'saltwater',
                GoFish.SALTWATER_COMMON,
                {
                   rarities: [
                       GoFish.FISH_RARITIES.common, 
                       GoFish.FISH_RARITIES.uncommon,
                       GoFish.FISH_RARITIES.rare,
                       GoFish.FISH_RARITIES.epic
                   ] 
                }
            );
        }
        // Greater Saltwater fish
        if(!tableNames.includes(GoFish.SALTWATER_GREATER)) {
            this.populateTable(
                'saltwater',
                GoFish.SALTWATER_GREATER,
                {
                   rarities: [
                       GoFish.FISH_RARITIES.uncommon,
                       GoFish.FISH_RARITIES.rare,
                       GoFish.FISH_RARITIES.epic,
                       GoFish.FISH_RARITIES.legendary
                   ] 
                }
            );
        }
        
        if (GoFish.AUTOMATICALLY_APPLY_FISHING_ATTRIBUTE) {
            this.applyFishingToAll();
        }
        
        // create index if it does not exist
        let goFishIndex = findObjs({type: "handout", name: "GoFish! Index"})[0];
        if (goFishIndex === undefined) {
            let goFishIndex = createObj("handout", {
                name: "GoFish! Index",
                inplayerjournals: "all"
            });
            goFishIndex.set('gmnotes', GoFish.Templates.gmIndex());
            goFishIndex.set('notes', GoFish.Templates.index());
            log("Created the GoFish! Index.");
        }
        
        // Finally, load game data if it exists, initialize otherwise
        if (state.GoFish) {
            GoFish.Data.Game = state.GoFish;
        }
    }
    
    // populates one of the fish tables
    this.populateTable = function(type, tablename, config) {
        try {
            log("Creating table '" + tablename + "'...");
            const table = createObj("rollabletable", {
                name: tablename
            });
            
            let fishList = [];
            if (type === 'freshwater') {
                fishList = GoFish.Data.MASTER_FISH_LIST.Freshwater;
            } else if (type === 'saltwater') {
                fishList = GoFish.Data.MASTER_FISH_LIST.Saltwater;
            } else {
                throw new Error("Invalid water type passed to GoFish.populateTable().")
            }
            
            // Calculate distributions
            let commonCount = 0;
            let uncommonCount = 0;
            let rareCount = 0;
            let epicCount = 0;
            let legendaryCount = 0;
            
            for (let i = 0; i < fishList.length; i++) {
                let fish = fishList[i];
                if (fish.rarity === GoFish.FISH_RARITIES.common) {
                    commonCount += 1;
                } else if (fish.rarity === GoFish.FISH_RARITIES.uncommon) {
                    uncommonCount += 1;
                } else if (fish.rarity === GoFish.FISH_RARITIES.rare) {
                    rareCount += 1;
                } else if (fish.rarity === GoFish.FISH_RARITIES.epic) {
                    epicCount += 1;
                } else if (fish.rarity === GoFish.FISH_RARITIES.legendary) {
                    legendaryCount += 1;
                }
            }
            
            const tableWeights = {
                common: Math.floor(GoFish.TABLE_DISTRIBUTIONS.common / commonCount),
                uncommon: Math.floor(GoFish.TABLE_DISTRIBUTIONS.uncommon / uncommonCount),
                rare: Math.floor(GoFish.TABLE_DISTRIBUTIONS.rare / rareCount),
                epic: Math.floor(GoFish.TABLE_DISTRIBUTIONS.epic / epicCount),
                legendary: Math.floor(GoFish.TABLE_DISTRIBUTIONS.legendary / legendaryCount)
            }
            
            for (let i = 0; i < fishList.length; i++) {
                let fish = fishList[i];
                if (config.rarities.includes(fish.rarity)) {
                    createObj("tableitem", {
                        rollabletableid: table.id,
                        name: fish.name,
                        weight: tableWeights[fish.rarity.name]
                    });
                }
            }
        } catch(ex) {
            log(ex.message);
        }
    };
    
    // updates the GoFish index with the given fish
    this.updateFishIndex = function(token, fish) {
        let found = false;
        let fishList = GoFish.Data.Game.FishList;
        
        for (let i = 0; i < fishList.length; i++) {
            if (fishList[i].name === fish.name) {
                found = true;
                let entry = fishList[i];
                entry.numberCaught += 1;
                if (fish.weight > entry.largestCaught) {
                    entry.largestCaught = fish.weight;
                    entry.recordHolder = token.get("name");
                }
                GoFish.Data.Game.FishList[i] = Object.assign({}, entry);
            }
        }
        
        if (!found) {
            fish.largestCaught = fish.weight;
            fish.numberCaught = 1;
            fish.recordHolder = token.get("name");
            fish.watersource = this.getWaterSource(fish.name);
            GoFish.Data.Game.FishList.push(fish);
        }
        
        // sort fishList by value
        fishList = GoFish.Data.Game.FishList;
        for (let i = 0; i < fishList.length; i++) {
            for (let j = i + 1; j < fishList.length; j++) {
                if (this.compareRarity(fishList[i], fishList[j]) === fishList[j]) {
                    let hold = fishList[j];
                    fishList[j] = fishList[i];
                    fishList[i] = hold;
                }
            }
        }
        
        // set game data
        GoFish.Data.Game.FishList = fishList;
        
        // update state
        state.GoFish = GoFish.Data.Game;
        
        // update index
        let index = findObjs({type: 'handout', name: 'GoFish! Index'})[0];
        index.set('notes', GoFish.Templates.index());
        index.set('gmnotes', GoFish.Templates.gmIndex());
    }
};

// Lifecycle Subscribers =======================================================

// Main Interpreter
on("chat:message", function(msg) {
    try {
        if (msg.type === 'api' && msg.content.indexOf('!go-fish') === 0) {
            const fisher = new GoFish.GoFish();     // create our library object
            const validPoolTypes = ['lesser', 'common', 'greater'];
            var command = msg.content.split(' ');   // parse command
            if (command.length === 1) {
                // print out the help string if no params supplied
                fisher.printUsage();
            } else if (command.length > 1) {
                // parse arguments
                var arg1 = command[1].toLowerCase();
                
                if (arg1 === 'help' || arg1 === "h" || arg1 === "-h" || arg1 === "--help") {
                    // print help string
                    fisher.printUsage();
                } else if (arg1 === 'freshwater' || arg1 === 'saltwater') {
                    // check for arg2
                    var arg2 = '';
                    if (command.length === 3) {
                        arg2 = command[2].toLowerCase();
                        if (!validPoolTypes.includes(arg2)) {
                            throw new Error("[Invalid] The pool type parameter must be 'lesser', 'common', 'greater', or left blank.");
                        }
                    } else {
                        arg2 = 'lesser';
                    }
                    // correct format
                    // check for selected token
                    var selected = msg.selected;
                    if (selected === undefined) {
                        throw new Error("[Invalid] No character selected. Be sure you have your character selected when using !go-fish.");
                    } else {
                        // ensure token is setup correctly
                        var token = getObj("graphic", selected[0]._id);
                        if (fisher.getAttribute(token, "Dexterity") === undefined && fisher.getAttribute(token, "DEX") === undefined) {
                            throw new Error("[Invalid] Supply either a 'DEX' or 'Dexterity' attribute to your character.");
                        } else {
                             if(fisher.getAttribute(token, "Fishing") === undefined) {
                                throw new Error("[Invalid] Supply a 'Fishing' attribute to your character.");
                            } else {
                                 fisher.printCommand(msg.who, arg1, [arg2]);
                                 fisher.goFishing(token, arg1, arg2);
                            }
                        }
                    }
                } else if (arg1 === 'reset') {
                    if (playerIsGM(msg.playerid)) {
                        // display command
                        fisher.printCommand(msg.who, 'reset', []);
                        // clear state
                        state.GoFish = {
                            FishList: [],
                            Characters: []
                        };
                        // remove index handout
                        let index = findObjs({type: "handout", name: "GoFish! Index"})[0];
                        if (index) {
                            index.remove();
                        }
                        // delete tables
                        fisher.clearTables();
                        fisher.initialize();
                        sendChat(GoFish.BOT_NAME, "**[Success!]** GoFish has been reset to its default state.");
                    } else {
                        throw new Error("[Unauthorized] You must be a GM to reset the GoFish tables.");
                    }
                } else if(arg1 === 'cashout') {
                     // check for arg2
                    var arg2 = '';
                    
                    // are we using quotes?
                    if (msg.content.indexOf('"') !== -1) {
                        let content = msg.content;
                        let quote1 = content.indexOf('"');
                        content = content.substr(quote1 + 1, content.length);
                        let quote2 = content.indexOf('"');
                        if (quote2 === -1) {
                            throw new Error("[Invalid] Missing enclosing quotation mark on fishname.");
                        }
                        let arg2 = msg.content.substr(quote1 + 1, quote2);
                        let arg3 = '';
                        if (command.length - (arg2.split(' ').length - 1) === 4) {
                                arg3 = Number(command[command.length - 1]);
                            if (isNaN(arg3)) {
                                throw new Error("[Invalid] The third argument for 'cashout' must be a weight as a pure number.");
                            }
                        }
                        fisher.printCommand(msg.who, 'cashout', [`"${arg2}"`, arg3]);
                        fisher.cashOut(msg.who, arg2, arg3);
                    } else {
                        if (command.length >= 3) {
                            arg2 = command[2].toLowerCase();
                            let arg3 = '';
                            if (command.length === 4) {
                                arg3 = Number(command[3]);
                                if (isNaN(arg3)) {
                                    throw new Error("[Invalid] The third argument for 'cashout' must be a weight as a pure number.");
                                }
                            }
                            fisher.printCommand(msg.who, 'cashout', [arg2, arg3]);
                            fisher.cashOut(msg.who, arg2, arg3);
                        } else {
                            throw new Error("[Invalid] The command `cashout` requires a fish name as the second argument.")
                        }
                    }
                } else if(arg1 === 'valueof') {
                    // check for arg2
                    var arg2 = '';
                    
                    // are we using quotes?
                    if (msg.content.indexOf('"') !== -1) {
                        let content = msg.content;
                        let quote1 = content.indexOf('"');
                        content = content.substr(quote1 + 1, content.length);
                        let quote2 = content.indexOf('"');
                        if (quote2 === -1) {
                            throw new Error("[Invalid] Missing enclosing quotation mark on fishname.");
                        }
                        let arg2 = msg.content.substr(quote1 + 1, quote2);
                        let arg3 = '';
                        if (command.length - (arg2.split(' ').length - 1) === 4) {
                                arg3 = Number(command[command.length - 1]);
                            if (isNaN(arg3)) {
                                throw new Error("[Invalid] The third argument for 'valueof' must be a weight as a pure number.");
                            }
                        }
                        fisher.printCommand(msg.who, 'valueof', [`"${arg2}"`, arg3]);
                        fisher.getValueOf(arg2, arg3);
                    } else {
                        if (command.length >= 3) {
                            arg2 = command[2].toLowerCase();
                            let arg3 = '';
                            if (command.length === 4) {
                                arg3 = Number(command[3]);
                                if (isNaN(arg3)) {
                                    throw new Error("[Invalid] The third argument for 'valueof' must be a weight as a pure number.");
                                }
                            }
                            fisher.printCommand(msg.who, 'valueof', [arg2, arg3]);
                            fisher.getValueOf(arg2, arg3);
                        } else {
                            throw new Error("[Invalid] The command `valueof` requires a fish name as the second argument.")
                        }
                    }
                } else if (arg1 === 'time') {
                    if (command.length < 3) {
                        throw new Error("[Invalid] Missing time.")
                    } else {
                        let time = Number(command[2]);
                        if (isNaN(time) || time < 0) {
                            throw new Error("[Invalid] Time must be a valid, positive number.");
                        } else {
                            // round
                            time = Math.floor(time * 100);
                            time = time / 100;
                        }
                        if (command.length < 4) {
                            throw new Error("[Invalid] Missing water-source.");
                        } else {
                            let waterSource = command[3];
                            if (waterSource !== 'freshwater' && waterSource !== 'saltwater') {
                                throw new Error("Invalid water-source. Must be 'freshwater' or 'saltwater'.");
                            } else {
                                let poolType = '';
                                if (command.length >= 5) {
                                    poolType = command[4];
                                    if (!validPoolTypes.includes(poolType)) {
                                        throw new Error("Invalid pool-type. Must be 'lesser', 'common', or 'greater'.");
                                    }
                                } else {
                                    poolType = 'lesser';
                                }
                                 var selected = msg.selected;
                                if (selected === undefined) {
                                    throw new Error("[Invalid] No character selected. Be sure you have your character selected when using !go-fish.");
                                } else {
                                    // ensure token is setup correctly
                                    let tokens = [];
                                    for (let i = 0; i < selected.length; i++) {
                                        let token = getObj("graphic", selected[i]._id);
                                        if (fisher.getAttribute(token, "Dexterity") === undefined && fisher.getAttribute(token, "DEX") === undefined) {
                                            throw new Error(`[Invalid] Supply either a 'DEX' or 'Dexterity' attribute to '${token.get("name")}'.`);
                                        } else {
                                             if(fisher.getAttribute(token, "Fishing") === undefined) {
                                                throw new Error("[Invalid] Supply a 'Fishing' attribute to your character.");
                                            } else {
                                                tokens.push(token);
                                            }
                                        }
                                    }
                                    fisher.time(tokens, time, waterSource, poolType);
                                }
                            }
                        }
                    }
                } else if (arg1 === 'amount') {
                    if (command.length < 3) {
                        throw new Error("[Invalid] Missing amount.")
                    } else {
                        let amount = Number(command[2]);
                        if (isNaN(amount) || amount < 0) {
                            throw new Error("[Invalid] Amount must be a valid, positive number.");
                        } else {
                            // round
                            amount = Math.floor(amount * 100);
                            amount = amount / 100;
                        }
                        if (command.length < 4) {
                            throw new Error("[Invalid] Missing water-source.");
                        } else {
                            let waterSource = command[3];
                            if (waterSource !== 'freshwater' && waterSource !== 'saltwater') {
                                throw new Error("Invalid water-source. Must be 'freshwater' or 'saltwater'.");
                            } else {
                                let poolType = '';
                                if (command.length >= 5) {
                                    poolType = command[4];
                                    if (!validPoolTypes.includes(poolType)) {
                                        throw new Error("Invalid pool-type. Must be 'lesser', 'common', or 'greater'.");
                                    }
                                } else {
                                    poolType = 'lesser';
                                }
                                 var selected = msg.selected;
                                if (selected === undefined) {
                                    throw new Error("[Invalid] No character selected. Be sure to have at least one character selected when using !go-fish.");
                                } else {
                                    // ensure token is setup correctly
                                    let tokens = [];
                                    for (let i = 0; i < selected.length; i++) {
                                        let token = getObj("graphic", selected[i]._id);
                                        if (fisher.getAttribute(token, "Dexterity") === undefined && fisher.getAttribute(token, "DEX") === undefined) {
                                            throw new Error(`[Invalid] Supply either a 'DEX' or 'Dexterity' attribute to '${token.get("name")}'.`);
                                        } else {
                                             if(fisher.getAttribute(token, "Fishing") === undefined) {
                                                throw new Error("[Invalid] Supply a 'Fishing' attribute to your character.");
                                            } else {
                                                tokens.push(token);
                                            }
                                        }
                                    }
                                    fisher.amount(tokens, amount, waterSource, poolType);
                                }
                            }
                        }
                    }
                } else {
                    // invalid format
                    throw new Error("*Invalid command structure. Run '!go-fish help' for instructions on how to use.*");
                }
            }
        }
    } catch(ex) {
        log(ex.message);
        var fisher = new GoFish.GoFish();
        fisher.printError(ex.message);
    }
});

// Install requirements
on("ready", function() {
    const fisher = new GoFish.GoFish();
    log('Running GoFish by theTexasWave.');
    
    fisher.initialize();
    
    // Hello :)
    sendChat(GoFish.BOT_NAME, "*GoFish! by theTexasWave is running...*")
});