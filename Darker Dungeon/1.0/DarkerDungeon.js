// Designed for Giffy's Darker Dungeons. Go to /r/Darkerdungeons for more info. 
//Created for the 2.0 rule set

var DarkerDungeons = DarkerDungeons || (function() {
    'use strict';
    const blue = '#063e62';
    const gold = '#b49e67';
    const red  = `#8f1313`;
    const divstyle   = 'style="color: #eee;width: 90%; border: 1px solid black; background-color: #131415; padding: 5px;"';
    const astyle1    = `'style="text-align:center; border: 1px solid black; margin: 1px; padding: 2px; background-color: ${blue}; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 100px;`;
    const astyle2    = `style="text-align:center; border: 1px solid black; margin: 3px; padding: 2px; background-color: ${blue}; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 150px;`;
    const arrowstyle = `style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid ${gold}; margin: 5px 0px;"`;
    const headstyle  = `style="color: #fff; font-size: 18px; text-align: left; font-constiant: small-caps; font-family: Times, serif; margin-bottom: 2px;"`;
    const substyle   = 'style="font-size: 11px; line-height: 13px; margin-top: -2px; font-style: italic;"';
    const breaks     = `style="border-color:${gold}; margin: 5px 2px;"`;
    const label      = `style="color: #c9c9c9; display:inline-block; width: 50%;"`
    const label2     = `style="color: #c9c9c9; display:inline-block; width: 32%;"`
    const version    = '1.0',
    
    handleInput = (msg) => {
        const args = msg.content.split(" --");
        if (msg.type !== "api") { return; }
        if (args[0] === "!darkerdungeons") {
            switch(args[1]) {
                case 'character':
                    ddcharacter();
                    break;
                case 'details':
                    dddetails();
                    break;
                case 'reroll':
                    ddreroll();
                    break;
                case 'encounter':
                    if(!playerIsGM(msg.playerid)){ return; }
                    ddencounterMenu();
                    break;
                case 'safe':
                    if(!playerIsGM(msg.playerid)){ return; }
                    ddencountersSafe();
                    break;
                case 'dangerous':
                    if(!playerIsGM(msg.playerid)){ return; }
                    ddencountersDangerous();
                    break;
                case 'enemy':
                    if(!playerIsGM(msg.playerid)){ return; }
                    ddencountersEnemy();
                    break;
                 case 'hostile':
                    if(!playerIsGM(msg.playerid)){ return; }
                    ddencountersHostile();
                    break;
                case 'lethal':
                    if(!playerIsGM(msg.playerid)){ return; }
                    ddencountersLethal();
                    break;
                case 'boon':
                    ddBoonConsquence('Boon');
                    break;
                case 'consequence':
                    ddBoonConsquence('Consequence');
                    break;
                case 'help':
                    showHelp();
                    break;
                default :
                     darkerdungeonsMenu();
                     break;
            };
        };
    },

    darkerdungeonsMenu = () => {
        sendChat('Darker Dungeon Encounters', '/w gm <div ' + divstyle + '>' +
            `<div ${headstyle}>Darker Dungeons</div>` +
            `<div ${substyle}>Menu (v.${version})</div>` +
            '<div ' + arrowstyle + '></div>' +
            `<div style="text-align:center;"><a ${astyle2}" href="!darkerdungeons --encounter">Encounter Menu</a></div>` +
            `<hr ${breaks} />` +
            `<div style="text-align:center;"><a ${astyle2}" href="!darkerdungeons --boon">Boon</a></div>` +
            `<hr ${breaks} />` +
            `<div style="text-align:center;"><a ${astyle2}" href="!darkerdungeons --consequence">Consequence</a></div>` +
            `<hr ${breaks} />` +
            `<div style="text-align:center;"><a ${astyle2}" href="!darkerdungeons --character">Character</a></div>` +
            `<hr ${breaks}  />` +
            `<div style="text-align:center;"><a ${astyle2}" href="!darkerdungeons --help">Help</a></div>` +
            '</div>'
        );
    },
    
    ddencounterMenu = () => {
        sendChat('Darker Dungeons', '/w gm <div ' + divstyle + '>' +
            `<div ${headstyle}>Darker Dungeon Encounters</div>` +
            '<div ' + arrowstyle + '></div>' +
            `<div style="text-align:center;"><a ${astyle2}" href="!darkerdungeons --safe">Safe and Civilized</a></div>` +
            `<div>A village, a barren desert, a well-defended plain.</div>` +
            `<hr ${breaks} />` +
            `<div style="text-align:center;"><a ${astyle2}" href="!darkerdungeons --dangerous">Dangerous frontier</a></div>` +
            `<div> A wild forest, a treacherous swamp, a disturbed graveyard.</div>` +
            `<hr ${breaks} />` +
            `<div style="text-align:center;"><a ${astyle2}" href="!darkerdungeons --enemy">Enemy territory</a></div>` +
            `<div>A monster's lair, an enemy camp, a haunted wood.</div>` +
            `<hr ${breaks}  />` +
            `<div style="text-align:center;"><a ${astyle2}" href="!darkerdungeons --hostile">Heavily populated hostile territory</a></div>` +
            `<div>An enemy settlement, a mind-flayer city, a kobold nest.</div>` +
             `<hr ${breaks} />` +
            `<div style="text-align:center;"><a ${astyle2}" href="!darkerdungeons --lethal">Lethal and actively hunted</a></div>` +
            `<div>A plane of madness, a god's domain, a layer of hell.</div>` +
            '</div>'
        );
    },

    d4   = () => { return Math.floor(Math.random() * 3) + 1; },
    d6   = () => { return Math.floor(Math.random() * 5) + 1; },
    d10  = () => { return Math.floor(Math.random() * 9) + 1; },
    d100 = () => { return Math.floor(Math.random() * 99) + 1; },
    randomArray = (array) => { return array[Math.floor(Math.random() * array.length)]; },

    // GENERATE ENCOUNTERS
    ddencountersSafe      = () => { outputEncounters(1, "Safe"); },
    ddencountersDangerous = () => { outputEncounters(2, "Dangerous"); },
    ddencountersEnemy     = () => { outputEncounters(3, "Enemy"); },
    ddencountersHostile   = () => { outputEncounters(4, "Hostile"); },
    ddencountersLethal    = () => { outputEncounters(5, "Lethal"); },

    outputEncounters = (threshold, danger) => {
        const discovery  = generateDiscovery(d6());
        let encounters = [], output = [];

        ["Dawn", "Morning", "Noon", "Dusk", "Night"].forEach((encounter) => {
            const roll = d6();
            (roll <= threshold) ? encounters.push(encounter) : false;
        });

        if (encounters || discovery) {
            encounters.forEach((time) => {
                const type = generateType(d6());
                const description = generateDescription(type);
                output += 
                        `<div style="font-weight:bold; text-transform:small-caps;">${time}: ${type}</div>` +
                        `<div>${description}</div>` +
                        `<hr ${breaks} />`
            });
        } else {
            output += `<div font-weight:bold;">No encounters today</div>`;
        };

        if (discovery != "Nothing") {
            const description = generateDescription(discovery);
            output += `<div><b>Discovery: ${discovery}</b></div>` + `<div>${description}</div>`;
        };

        sendChat(`${danger} Encounters`, 
            `/w gm <div ${divstyle}>` +
                `<div ${headstyle}>Darker Dungeons</div>` +
                `<div ${substyle}>Encounters (${danger})</div>` +
                `<div ${arrowstyle}></div>` + 
                output +
            '</div>'
        );
    },

    generateDiscovery = (roll) => {
        return (roll <= 4) ? "Nothing" : (roll === 5) ? "Morning hour." : "Afternoon hour.";
    },

    generateType = (roll) => {
        const type = 
            (roll === 1) ? "Character" : 
            (roll === 2) ? "Social (Friendly)" : 
            (roll === 3) ? "Social (Hostile)" : 
            (roll === 4) ? "Skill Challenge" : 
            (roll === 5) ? "Combat (Non-commital)" :
            ("Combat (Aggressive)");
        return type;
    },

    generateDescription = (type) => {
        const character   = ["A bad memory of your family", "A good memory of your family", "A faction you strongly agree with", "A faction you strongly disagree with", "A game you like to play", "A happy moment from your childhood", "A monster you don't believe is real", "A person you are afraid of", "A person you couldn't save", "A person you hate", "A person you love", "A person you respect", "A person you want to meet", "A place you would love to visit", "A sad moment from your childhood", "A time you embarrassed yourself", "A time you got away with something", "A time you got a sibling into trouble", "A time you got really drunk", "A time you hurt someone", "A time you made something", "A time you were afraid", "A time you were heroic", "A time you were powerless", "A time you were proud of someone", "A time you were smarter than everyone else", "Are you a dog person or a cat person?", "Are you closer to your mother or your father?", "Food that you think is disgusting", "Something that happened on your last birthday", "Something you are ashamed of", "Something you are proud of doing", "Something you would love to do", "The best dinner you've ever had", "The best gift you ever received", "The funniest thing you've ever seen", "What are you looking forward to?", "What would you do if you were king?", "What would you do with a million gold pieces?", "Where are your family now?", "Who or what would you die for?", "Who was your first kiss?", "Why are you with the party?", "Why would the party fall apart without you?", "Your favourite story", "Your favourite thing about your hometown", "Your favourite way to relax", "Your greatest achievement", "Your greatest fear", "Your last nightmare"];
        const friendly    = ["A wandering peddler offers you a look at his wares","An old cleric is repairing a small shrine recently damaged by someone or something","A wandering bard shares stories about the locals","A drunken giant is trying to mend a bridge he has broken, but is having trouble with the work","An old woman needs your help to get an unusual pet down from a tree A naked bard asks you for some spare clothes","You find someone passed out and wounded","Two drunk goliaths are wrestling any challengers","A wizard asks if you can help him test a new spell","Two groups of people need your help to settle a bet","You find a small child, lost and alone","Three dwarves challenge the biggest party member to a drinking competition","Two clerics are arguing about who is the best god","A hungry beggar offers you a secret for some food","A guard is training some new recruits and asks you to help demonstrate a few moves","A dying man asks you to help end his pain","A silent monk offers you some food for a story","A bard is trying to write a song but is having trouble with the words and asks you for advice A wagon has overturned and the owner needs help","A kobold challenges you to a game of riddles"];
        const hostile     = ["A group of racist thugs has an issue with one of your party members because of their appearance","Three guards call you to halt, holding a wanted poster that looks a lot like one of your party","Some highwaymen demand your money or your life","Two groups of people are brawling near an overturned cart, each blaming the other","A giant blocks your path with a makeshift toll gate, demanding an unusual payment","A group of drunk soldiers approach and demand you offer some tribute to the king's men","A person is tied to a stake and surrounded by a silent mob holding torches, led by a fierce cleric","A loud zealot preaching to a mob accuses you of dark heresy against their god","A barbarian, delirious with a berserker rage, thinks you are a foul monster to kill","A petty nobleman accuses you of not showing the proper due respect and demands satisfaction","You stumble across a dead body and a person holding a bloody knife, who says, It wasn't me!","Someone fleeing from a dozen pursuers begs you for protection against harm","An old woman with a knife and foul breath asks you to pay tribute to her god","Three men eating around a campfire offer you some food, but it's not animal meat they're cooking...","A ghost stands in the middle of the road, wailing","A group of hooded cultists emerge, loudly proclaiming that you are the chosen one","A bard is playing beautiful music to a crowd, but all who listen are quickly under her thrall","A wild sorcerer seeks to test a spell on you","A paladin accuses you of performing evil acts and demands you pay for your sins with blood","A furious druid has someone trapped in vines and intends to kill them for desecrating the grove"];
        const challenges  = ["A broken wagon blocks the way and must be repaired, overturned, or bypassed","A rowdy mob that must be calmed or evaded before they turn on you or some other victim","An overwhelmingly large pack of hungry, wild animals that must be outrun","There is an unfamiliar split in the path and the correct direction must be determined","A glade of flesh-eating plants that must be escaped before they can paralyze you","A broken bridge across a ravine that must be fixed or overcome to progress","A sudden, terrible storm that requires shelter to be found and constructed fast","A band of highwaymen that must be intimidated or out-smarted before things turn ugly","A magical illusion blocks the way and must be disabled or bypassed to progress","Recent weather has destroyed some notable landmarks and the path must be rediscovered"];
        const discoveries = ["An old and ruined tower","A burned out home","A howling cavern","A small, tightly locked chest","A statue of a good deity","A statue of an evil deity","A circle of stone pillars","A giant tree with far-reaching roots","A ruined temple to an unknown god","A cracked, stone fountain filled with a green ooze","A strange pillar carved with bloody runes","A strange, twisted tree","An abandoned wagon and the signs of battle","A small, unlocked hut with a warm hearth"," A locked door in the side of a hill","A chilling cemetery","A locked door in the side of a hill","An abandoned ruin of a castle","A wrecked, half-buried pirate ship"," A set of steps leading down into a crypt","A strange plant with an alluring scent","A rusted cauldron still warm to the touch","A tiny door in the foot of a tree","A beautiful glade with delicious-looking fruit","A sealed, metal coffin","A twisted pillar with an evil, carved face","A book on a bloody altar","A sword impaled in a monstrous stone statue","A map pinned to a tree with a black knife","A blood-red stone embedded in a twisted tree","A skeleton holding a small, red book","A hole in the ground where singing can be heard","A monument to an ancient battle","A giant skeleton of a long-dead gargantuan creature"," An abandoned, boarded-up house with ghostly wails","A stone archway covered in eldritch runes","A pool of sweet, red water","A glade of trees that ooze black sap","A collection of life-like humanoid stone statues","A secret wishing pool","A sleeping dragon","A half-buried chest surrounded by skeletons","7 rotating pillars of segmented red stone","A tree that burns with unnatural green fire","The ruins of a magical experiment gone wrong","A gazebo"];

        const desc  =
            (type === "Character") ? randomArray(character) :
            (type === "Social (Friendly)") ? randomArray(friendly) :
            (type === "Social (Hostile)") ? randomArray(hostile) :
            (type === "Skill Challenge") ? randomArray(challenges) :
            (type === "Combat (Non-commital)") ? "The party is attacked, but the enemies will flee easily." :
            (type === "Combat (Aggressive)") ? "The party is attacked and the enemies will fight to near death." :
            randomArray(discoveries) ;

        return desc;
    },
    
    //BOONES & CONSEQUENCES
    ddBoonConsquence = (type) => {
        const array = (type === "Boon") ?
            ["You restore some hit points","You gain a hit die","You find some extra gold","You gain a favour from an ally","You regain a spell slot","You deal extra damage","You heal some mental stress","You may spend a hit die to recover some hit points","You may switch places with a nearby ally","You can move to an advantageous position","You learn a piece of rare information","You (temporarily) lose one level of exhaustion","A magic item regains one charge","The locals hear about your achievement","You apply a condition to your enemy","A god notices your achievement","A condition improves","You gain advantage to your next roll","Your enemies are intimidated by you","You move your enemy"] :
            ["You or an ally take damage","An enemy reacts and takes an action","You gain some mental stress","Take a notch on your weapon/armor/item","You lose an item","One of your conditions worsens","Your torch goes out","An NPC becomes hostile to you","You lose some gold","You learn some misinformation","Your enemy becomes enraged","You gain the attention of the local guards","You drop your weapon","You stop and fall prone","You are poisoned or diseased","You are imprisoned","A crowd turns against you","A higher authority learns of your misdoings","A god punishes you","You lose some ammunition or hit dice"];
       outputDegree(array, type);
    },

    outputDegree = (array, degree) => {
        const description = randomArray(array);
        const output = `<div>${description}</div>`;
        sendChat(`Degree of Success`, 
            `<div ${divstyle}>` +
                `<div ${headstyle}>Darker Dungeons</div>` +
                `<div ${substyle}>${degree}</div>` +
                `<div ${arrowstyle}></div>` + output +
            '</div>'
        );
    },

    //CHARACTER GENERATOR
    ddcharacter = () => {
        const race       = characterRace(d100());
        const background = characterBackground(d100());
        const Class      = characterClass(d100());
        const scores     = characterAbility();

        sendChat('Darker Dungeon', '<div ' + divstyle + '>' +
            `<div ${headstyle}>Darker Dungeons</div>` +
            `<div ${substyle}>Character Generator</div>` +
            '<div ' + arrowstyle + '></div>' +
            `<div style="text-align:center;">${race}</div><hr ${breaks} />` +
            `<div style="text-align:center;">${background}<br/>${Class}</div><hr ${breaks} />` +
            scores +
            `<div style="text-align:center;"><a ${astyle2}" href="!darkerdungeons --reroll">Reroll Attribute</a></div><hr ${breaks} />` +
            `<div style="text-align:center;"><a ${astyle2}" href="!darkerdungeons --details">Details</a></div>` +
            `</div>`
        );
    }, 

    characterRace = (roll) => {
        const race = 
            (roll === 1) ? "Aasimar" :
            (roll <= 4) ? "Dragonborn" :
            (roll <= 19) ? "Dwarf" :
            (roll <= 29) ? "Elf" :
            (roll <= 31) ? "Firbolg" :
            (roll <= 33) ? "Gith" :
            (roll <= 39) ? "Gnome" :
            (roll <= 41) ? "Goliath" :
            (roll === 42) ? "Half-Elf" : 
            (roll === 43) ? "Half-Ork" :
            (roll <= 50) ? "Halfling" :
            (roll <= 90) ? "Human": 
            (roll === 91) ? "Kenku" :
            (roll === 92) ? "Lizardfolk" :
            (roll === 93) ? "Monstrous" : 
            (roll === 94) ? "Tabaxi" :
            (roll <= 98) ? "Tiefling" : 
            (roll === 99) ? "Triton" :
            "Choose";
        if (race === "Dragonborn"|| race === "Gith" || race === "Halfling") {
            const subraceArray = (race === "Gith") ? ["Githyanki", "Githzerai"] : (race === "Halfling") ? ["Lightfoot", "Stout"] : ["Black", "Blue", "Brass", "Bronze", "Copper", "Gold", "Green", "Red", "Silver", "White"];
            const subrace = randomArray(subraceArray);
            return `${race} (${subrace})`;
        } else if (race === "Aasimar" || race === "Dwarf" || race === "Elf" || race === "Gnome" || race === "Monstrous" || race === "Tiefling") {
            const subraceRoll = d100();
            let subrace = "";
            if (race === "Aasimar") {
               subrace += (subraceRoll <= 33) ? "Fallen" : (subraceRoll <= 67) ? "Protector" : "Scourage";
            } else if (race ===  "Dwarf") {
               subrace += (subraceRoll <= 45) ? "Hill" :  (subraceRoll <= 90) ? "Mountain" :  "Duergar";
            } else if (race ===  "Elf") {
               subrace += (subraceRoll <= 10) ? "Drow" : (subraceRoll <= 20) ? "Eladrin" :  (subraceRoll <= 50) ? "High" :  (subraceRoll <= 60) ? "Sea" : (subraceRoll <= 70) ? "Shadar-kai": "Wood";
            } else if (race ===  "Gnome") {
               subrace += (subraceRoll <= 45) ? "Forest" : (subraceRoll <= 90) ? "Rock" :  "Deep";
            } else if (race === "Monstrous") {
               subrace += (subraceRoll <= 10) ? "Bugbear" : (subraceRoll <= 35) ? "Goblin": (subraceRoll <= 50) ? "Hobgoblin" : (subraceRoll <= 75) ? "Kobold" : (subraceRoll <= 90) ? "Orc" : "Yuan-ti";
            } else {
               subrace += (subraceRoll <= 12) ? "Asmodeus" : (subraceRoll <= 23) ? "Baalzebul" : (subraceRoll <= 34) ? "Dispater" : (subraceRoll <= 45) ? "Fierna" : (subraceRoll <= 56) ? "Glasya" :  (subraceRoll <= 67) ? "Levistus" : (subraceRoll <= 78) ? "Mammon" : (subraceRoll <= 89) ? "Mephistopheles" : "Zariel";
            };
            return `${race} (${subrace})`;
        } else {
            return race;
        };
    }, 

    characterBackground = (roll) => {
        const background = 
            (roll <= 7) ? "Acolyte" :
            (roll <= 14) ? "Charlatan" :
            (roll <= 21) ? "Criminal" :
            (roll <= 28) ? "Entertainer" :
            (roll <= 35) ? "Folk Hero" :
            (roll <= 42) ? "Guild Artisan" :
            (roll <= 49) ? "Hermit" :
            (roll <= 56) ? "Noble" :
            (roll <= 63) ? "Outlander" : 
            (roll <= 70) ? "Sage" :
            (roll <= 77) ? "Sailor" :
            (roll <= 84) ? "Soldier": 
            (roll <= 91) ? "Urchin" :
            "Choose";

        return `${background}`;
    },

    characterClass = (roll) => {
        const Class = 
            (roll <= 8) ? "Barbarian" :
            (roll <= 16) ? "Bard" :
            (roll <= 24) ? "Cleric" :
            (roll <= 32) ? "Druid" :
            (roll <= 40) ? "Fighter" :
            (roll <= 48) ? "Monk" :
            (roll <= 56) ? "Paladin" :
            (roll <= 64) ? "Ranger" :
            (roll <= 72) ? "Rogue" : 
            (roll <= 80) ? "Sorcerer" :
            (roll <= 88) ? "Warlock" :
            (roll <= 96) ? "Wizard": 
            "Choose";

        const gold =
            (Class === "Rogue" || Class === "Warlock" || Class === "Wizard") ? (d4() + d4() + d4() + d4()) * 10 :
            (Class === "Druid" || Class === "Barbarian") ? (d4() + d4()) * 10 :
            (Class === "Sorcerer") ? (d4() + d4() + d4()) * 10 :
            (Class === "Monk") ? d4() + d4() + d4() + d4() + d4() :
            (d4() + d4() + d4() + d4() + d4()) * 10;

        if (Class === "Cleric" || Class === "Fighter" || Class === "Sorcerer" || Class === "Warlock") {
            const specRoll = d100();
            let specialisation = ""
            if (Class === "Cleric") {
                const domainArray = ["Forge", "Grave", "Knowledge", "Life", "Light", "Nature", "Tempest", "Trickery", "War", "Choose"];
                specialisation += randomArray(domainArray);
            } else if (Class === "Fighter") {
                specialisation +=
                    (roll <= 16) ? "Archery" :
                    (roll <= 32) ? "Defense" :
                    (roll <= 48) ? "Dueling" :
                    (roll <= 64) ? "Greater Weapon" :
                    (roll <= 80) ? "Protection" :
                    (roll <= 96) ? "Two-Weapon" : 
                    "Choose";
            } else if (Class === "Sorcerer") {
                specialisation +=
                    (roll <= 19) ? "Divine Soul" :
                    (roll <= 38) ? "Draconic Blood" :
                    (roll <= 57) ? "Shadow Magic" :
                    (roll <= 76) ? "Storm Sorcery" :
                    (roll <= 95) ? "Wild Magic" :
                    "Choose";
            } else {
                specialisation +=
                    (roll <= 19) ? "Archfey" :
                    (roll <= 38) ? "Celestial" :
                    (roll <= 57) ? "Fiend" :
                    (roll <= 76) ? "Great Old One" :
                    (roll <= 95) ? "Hexblade" :
                    "Choose";
            };
            return `${Class} (${specialisation}), ${gold} gp`;
        } else {
            return `${Class}, ${gold} gp`;
        };
    },

    characterAbility = () => {
        let output  = [];
        ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"].forEach((attr) => {
            const score = d6() + d6() + d6();
            output += `<div style="margin-left:25%;"><label ${label}>${attr}</label> <b>${score}</b></div>`
        });
        return output;
    },

    dddetails = () => {
        const ageRoll = d100(), weightRoll = d100(), heightRoll = d100(), familyRoll = d100(), featureRoll = d100(), raisedRoll = d100(), memoryRoll = d100(), motivationRoll = d100(), habitRoll = d100(), questRoll = d100();
        const age     = 
            (ageRoll <= 39) ? "Young adult":
            (ageRoll <= 74) ? "Early middle-age":
            (ageRoll <= 91) ? "Late middle-age":
            (ageRoll <= 97) ? "Old": 
            "Very old";
        const weight  = 
            (weightRoll <= 5) ? "Very thin":
            (weightRoll <= 30) ? "Thin":
            (weightRoll <= 70) ? "Average":
            (weightRoll <= 95) ? "Fat": 
            "Very fat";
        const family  = 
            (familyRoll <= 5) ? "None":
            (familyRoll <= 30) ? "Small":
            (familyRoll <= 70) ? "Average":
            (familyRoll <= 95) ? "Large":
            "Disowned";
        const height  = 
            (heightRoll <= 5) ? "Very short":
            (heightRoll <= 30) ? "Short":
            (heightRoll <= 70) ? "Average":
            (heightRoll <= 95) ? "Tall":
            "Very tall"; 
        const feature = 
            (featureRoll <= 20) ? "Scar":
            (featureRoll <= 40) ? "Tattoo":
            (featureRoll <= 60) ? "Piercing" :
            (featureRoll <= 80) ? "Birthmark" :
            "Accent";
        const raised  = 
            (raisedRoll <= 40) ? "Natural Parent(s)":
            (raisedRoll <= 60) ? "Close family":
            (raisedRoll <= 70) ? "Adopted Parent(s)":
            (raisedRoll <= 90) ? "An institution":
            "Yourself";
        const memory = 
            (memoryRoll <= 20) ? "Achievement A goal you helped complete":
            (memoryRoll <= 40) ? "Conflict Someone opposed you":
            (memoryRoll <= 60) ? "Friendship A close bond forged or tested":
            (memoryRoll <= 80) ? "Loss Something precious was taken":
            "Love A love gained or los";
        const motivation = 
            (motivationRoll <= 6) ? "Achievement To become the best":
            (motivationRoll <= 12) ? "Acquisition To obtain possessions or wealth":
            (motivationRoll <= 18) ? "Balance To bring all things into harmony":
            (motivationRoll <= 24) ? "Beneficence To protect, heal, and mend":
            (motivationRoll <= 30) ? "Creation To build or make new":
            (motivationRoll <= 36) ? "Discovery To explore, uncover, and pioneer":
            (motivationRoll <= 42) ? "Education To inform, teach, or train":
            (motivationRoll <= 48) ? "Hedonism To enjoy all things sensuous":
            (motivationRoll <= 54) ? "Liberation To free the self and/or others":
            (motivationRoll <= 60) ? "Nobility To be virtuous, honest, and brave":
            (motivationRoll <= 66) ? "Order To organize and reduce chaos":
            (motivationRoll <= 73) ? "Play To have fun, to enjoy life":
            (motivationRoll <= 79) ? "Power To control and lead others":
            (motivationRoll <= 85) ? "Recognition To gain approval, status, or fame":
            (motivationRoll <= 91) ? "Service To follow a person or group":
            (motivationRoll <= 97) ? "Understanding To seek knowledge or wisdom":
            "Choose";
        const habit = 
            (habitRoll <= 3) ? "Humming":
            (habitRoll <= 6) ? "Dancing":
            (habitRoll <= 9) ? "Sleepwalking":
            (habitRoll <= 12) ? "Facial tics":
            (habitRoll <= 15) ? "Fingernail biting":
            (habitRoll <= 18) ? "Daydreaming":
            (habitRoll <= 21) ? "Talking in sleep":
            (habitRoll <= 24) ? "Whistling":
            (habitRoll <= 27) ? "Name dropping":
            (habitRoll <= 30) ? "Constant grooming":
            (habitRoll <= 33) ? "Foot tapping":
            (habitRoll <= 36) ? "Lip biting/licking":
            (habitRoll <= 39) ? "Coin flipping":
            (habitRoll <= 42) ? "Chewing":
            (habitRoll <= 45) ? "Knuckle cracking":
            (habitRoll <= 48) ? "Collects odd things":
            (habitRoll <= 51) ? "Singing":
            (habitRoll <= 54) ? "Snacking":
            (habitRoll <= 57) ? "Pacing":
            (habitRoll <= 60) ? "Counting":
            (habitRoll <= 63) ? "Snoring":
            (habitRoll <= 66) ? "Beard/hair stroking":
            (habitRoll <= 69) ? "Nose picking":
            (habitRoll <= 72) ? "Apologizing":
            (habitRoll <= 75) ? "Exaggeration":
            (habitRoll <= 78) ? "Superstitious":
            (habitRoll <= 81) ? "Belching":
            (habitRoll <= 84) ? "Repeating others":
            (habitRoll <= 87) ? "Smelling things":
            (habitRoll <= 90) ? "Teeth picking":
            (habitRoll <= 93) ? "Swearing":
            (habitRoll <= 96) ? "Telling secrets":
            (habitRoll <= 99) ? "Repeating yourself":
            "Choose";

        const quest = 
            (questRoll <= 10) ? "Acquire To take possession of a particular item":
            (questRoll <= 20) ? "Craft To create an item or art piece":
            (questRoll <= 30) ? "Deliver To bring something somewhere":
            (questRoll <= 40) ? "Destroy To destroy a precious object":
            (questRoll <= 50) ? "Discover To find a person, place, or thing":
            (questRoll <= 60) ? "Explore To map out a location":
            (questRoll <= 70) ? "Justice To apprehend someone":
            (questRoll <= 80) ? "Learn To gain specific knowledge":
            (questRoll <= 90) ? "Meet To find someone":
            "Vengeance To take revenge on someone";

        sendChat('Darker Dungeon', '<div ' + divstyle + '>' +
            `<div ${headstyle}>Darker Dungeons</div>` +
            `<div ${substyle}>Character Details</div>` +
            '<div ' + arrowstyle + '></div>' +
            `<div style="margin-left:5%;"><label ${label2}>Age</label><b>${age}</b></div><hr ${breaks} />` +
            `<div style="margin-left:5%;"><label ${label2}>Height</label><b>${height}</b></div><hr ${breaks} />` +
            `<div style="margin-left:5%;"><label ${label2}>Weight</label><b>${weight}</b></div><hr ${breaks} />` +
            `<div style="margin-left:5%;"><label ${label2}>Feature</label><b>${feature}</b></div><hr ${breaks} />` +
            `<div style="margin-left:5%;"><label ${label2}>Motivation</label><b>${motivation}</b></div><hr ${breaks} />` +
            `<div style="margin-left:5%;"><label ${label2}>Habit</label><b>${habit}</b></div><hr ${breaks} />` +
            `<div style="margin-left:5%;"><label ${label2}>Family</label><b>${family}</b></div><hr ${breaks} />` +
            `<div style="margin-left:5%;"><label ${label2}>Raised By</label><b>${raised}</b></div><hr ${breaks} />` +
            `<div style="margin-left:5%;"><label ${label2}>Quest</label><b>${quest}</b></div><hr ${breaks} />` +
            `</div>`
        );


    },

    ddreroll = () => {
        const score = d6() + d6() + d6();
        sendChat(`Reroll Attribute`, 
            `<div ${divstyle}>` +
                `<div ${headstyle}>Darker Dungeons</div>` +
                `<div ${substyle}>Reroll Attribute</div>` +
                `<div ${arrowstyle}></div>` +
                `<div style="text-align:center;"><b>${score}</b></div>` +
            '</div>'
        );
    },

    //SHOW HELP
    showHelp = () => {
        sendChat('Darker Dungeon Help', '/w gm <div ' + divstyle + '>' +
            `<div ${headstyle}>Darker Dungeons Help</div>` +
            '<div ' + arrowstyle + '></div>' +
            `<div style="text-align:center;"><b>Character Generator </b><br />!darkerdungeons --character</div><hr ${breaks} />` +
            `<div style="text-align:center;"><b>Encounter Menu </b><br />!darkerdungeons --encounter</div><hr ${breaks} />` +
            `<div style="text-align:center;"><b>Safe Encounter </b><br />!darkerdungeons --safe</div><hr ${breaks} />` +
            `<div style="text-align:center;"><b>Dangerous Encounter </b><br />!darkerdungeons --dangerous</div><hr ${breaks} />` +
            `<div style="text-align:center;"><b>Enemy Encounter </b><br />!darkerdungeons --enemy</div><hr ${breaks} />` +
            `<div style="text-align:center;"><b>Hostile Encounter </b><br />!darkerdungeons --hostile</div><hr ${breaks} />` +
            `<div style="text-align:center;"><b>Lethal Encounter </b><br />!darkerdungeons --lethal</div><hr ${breaks} />` +
            `<div style="text-align:center;"><b>Boon </b><br />!darkerdungeons --boon</div><hr ${breaks} />` +
            `<div style="text-align:center;"><b>Consequence </b><br />!darkerdungeons --consequence</div>` +
            '</div>'
        );
    },

    registerEventHandlers = () => {
        on('chat:message', handleInput);
    };

    return {
        RegisterEventHandlers: registerEventHandlers
    };
    
}());

on("ready",() => {
    'use strict';
    DarkerDungeons.RegisterEventHandlers();
});