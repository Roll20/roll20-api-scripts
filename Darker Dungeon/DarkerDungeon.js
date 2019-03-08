// !merchant - Pulls up the menu and allows the GM to generate random loot
// Red Colour: #7E2D40

var DDEncounterGenerator = DDEncounterGenerator || (function() {
    'use strict';
    const color      = '#7E2D40';
    const divstyle   = 'style="width: 189px; border: 1px solid black; background-color: #ffffff; padding: 5px;"';
    const astyle1    = `'style="text-align:center; border: 1px solid black; margin: 1px; padding: 2px; background-color: ${color}; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 100px;`;
    const astyle2    = `style="text-align:center; border: 1px solid black; margin: 1px; padding: 2px; background-color: ${color}; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 150px;`;
    const arrowstyle = `style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid ${color}; margin-bottom: 2px; margin-top: 2px;"`;
    const headstyle  = `style="color: ${color}; font-size: 18px; text-align: left; font-constiant: small-caps; font-family: Times, serif;"`;
    const substyle   = 'style="font-size: 11px; line-height: 13px; margin-top: -2px; font-style: italic;"';
    const version    = '1.0',
    
    handleInput = (msg) => {
        const args = msg.content.split(",");
        if (msg.type !== "api") { return; }
        if(playerIsGM(msg.playerid)){
            switch(args[0]) {
                case '!DDencounters':
                    ddencounterMenu();
                    break;
                case '!DDencountersSafe':
                    ddencountersSafe();
                    break;
                case '!DDencountersDangerous':
                    ddencountersDangerous();
                    break;
                case '!DDencountersEnemy':
                    ddencountersEnemy();
                    break;
                 case '!DDencountersHostile':
                    ddencountersHostile();
                    break;
                case '!DDencountersLethal':
                    ddencountersLethal();
                    break;
                case '!DDdegrees':
                    dddegreesMenu();
                    break;
                case '!DDboons':
                    ddboons();
                    break;
                case '!DDconsequences':
                    ddconsequences();
                    break;
            }
        };
    },
    
    ddencounterMenu = () => {
        sendChat('Darker Dungeon Encounters', '/w gm <div ' + divstyle + '>' +
            `<div ${headstyle}>Darker Dungeon Encounters</div>` +
            `<div ${substyle}>Menu (v.${version})</div>` +
            '<div ' + arrowstyle + '></div>' +
            `<div style="text-align:center;"><a ${astyle2}" href="!DDencountersSafe">Safe and Civilized</a></div>` +
            `<div>A village, a barren desert, a well-defended plain.</div>` +
            `<hr style="margin: 5px 2px;" />` +
            `<div style="text-align:center;"><a ${astyle2}" href="!DDencountersDangerous">Dangerous frontier</a></div>` +
            `<div> A wild forest, a treacherous swamp, a disturbed graveyard.</div>` +
            `<hr style="margin: 5px 2px;" />` +
            `<div style="text-align:center;"><a ${astyle2}" href="!DDencountersEnemy">Enemy territory</a></div>` +
            `<div>A monster's lair, an enemy camp, a haunted wood.</div>` +
            `<hr style="margin: 5px 2px;" />` +
            `<div style="text-align:center;"><a ${astyle2}" href="!DDencountersHostile">Heavily populated hostile territory</a></div>` +
            `<div>An enemy settlement, a mind-flayer city, a kobold nest.</div>` +
             `<hr style="margin: 5px 2px;" />` +
            `<div style="text-align:center;"><a ${astyle2}" href="!DDencountersLethal">Lethal and actively hunted</a></div>` +
            `<div>A plane of madness, a god's domain, a layer of hell.</div>` +
            '</div>'
        );
    },

    // GENERATE ENCOUNTERS
    ddencountersSafe      = () => { outputEncounters(1, "Safe"); },
    ddencountersDangerous = () => { outputEncounters(2, "Dangerous"); },
    ddencountersEnemy     = () => { outputEncounters(3, "Enemy"); },
    ddencountersHostile   = () => { outputEncounters(4, "Hostile"); },
    ddencountersLethal    = () => { outputEncounters(5, "Lethal"); },

    generateDiscovery = () => {
        const d6 = Math.floor(Math.random() * 5) + 1;
        const disc = 
            (d6 <= 4) ? "Nothing" :
            (d6 === 5) ? "Morning hour." :
            "Afternoon hour.";

        return disc;
    },

    outputEncounters = (threshold, danger) => {
        const discovery  = generateDiscovery();
        const encounters = [];
        let output       = [];

        ["Dawn", "Morning", "Noon", "Dusk", "Night"].forEach((encounter) => {
            const d6 = Math.floor(Math.random() * 5) + 1;
            (d6 <= threshold) ? encounters.push(encounter) : false;
        });

        if (encounters || discovery) {
            encounters.forEach((time) => {
                const type = generateType();
                const description = generateDescription(type);
                output += 
                        `<div style="font-weight:bold; text-transform:small-caps;">${time}: ${type}</div>` +
                        `<div>${description}</div>` +
                        `<hr style="margin: 5px 2px;" />`
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
                `<div ${headstyle}>Encounters (${danger})</div>` + 
                `<div ${arrowstyle}></div>` + 
                output +
            '</div>'
        );
    },

    generateType = () => {
        const d6 = Math.floor(Math.random() * 5) + 1;
        const type = 
            (d6 === 1) ? "Character" : 
            (d6 === 2) ? "Social (Friendly)" : 
            (d6 === 3) ? "Social (Hostile)" : 
            (d6 === 4) ? "Skill Challenge" : 
            (d6 === 5) ? "Combat (Non-commital)" :
            ("Combat (Aggressive)");
        return type;
    },

    generateDescription = (type) => {
        const character = ["A bad memory of your family", "A good memory of your family", "A faction you strongly agree with", "A faction you strongly disagree with", "A game you like to play", "A happy moment from your childhood", "A monster you don't believe is real", "A person you are afraid of", "A person you couldn't save", "A person you hate", "A person you love", "A person you respect", "A person you want to meet", "A place you would love to visit", "A sad moment from your childhood", "A time you embarrassed yourself", "A time you got away with something", "A time you got a sibling into trouble", "A time you got really drunk", "A time you hurt someone", "A time you made something", "A time you were afraid", "A time you were heroic", "A time you were powerless", "A time you were proud of someone", "A time you were smarter than everyone else", "Are you a dog person or a cat person?", "Are you closer to your mother or your father?", "Food that you think is disgusting", "Something that happened on your last birthday", "Something you are ashamed of", "Something you are proud of doing", "Something you would love to do", "The best dinner you've ever had", "The best gift you ever received", "The funniest thing you've ever seen", "What are you looking forward to?", "What would you do if you were king?", "What would you do with a million gold pieces?", "Where are your family now?", "Who or what would you die for?", "Who was your first kiss?", "Why are you with the party?", "Why would the party fall apart without you?", "Your favourite story", "Your favourite thing about your hometown", "Your favourite way to relax", "Your greatest achievement", "Your greatest fear", "Your last nightmare"];

        const friendly = ["A wandering peddler offers you a look at his wares","An old cleric is repairing a small shrine recently damaged by someone or something","A wandering bard shares stories about the locals","A drunken giant is trying to mend a bridge he has broken, but is having trouble with the work","An old woman needs your help to get an unusual pet down from a tree A naked bard asks you for some spare clothes","You find someone passed out and wounded","Two drunk goliaths are wrestling any challengers","A wizard asks if you can help him test a new spell","Two groups of people need your help to settle a bet","You find a small child, lost and alone","Three dwarves challenge the biggest party member to a drinking competition","Two clerics are arguing about who is the best god","A hungry beggar offers you a secret for some food","A guard is training some new recruits and asks you to help demonstrate a few moves","A dying man asks you to help end his pain","A silent monk offers you some food for a story","A bard is trying to write a song but is having trouble with the words and asks you for advice A wagon has overturned and the owner needs help","A kobold challenges you to a game of riddles"];

        const hostile = ["A group of racist thugs has an issue with one of your party members because of their appearance","Three guards call you to halt, holding a wanted poster that looks a lot like one of your party","Some highwaymen demand your money or your life","Two groups of people are brawling near an overturned cart, each blaming the other","A giant blocks your path with a makeshift toll gate, demanding an unusual payment","A group of drunk soldiers approach and demand you offer some tribute to the king's men","A person is tied to a stake and surrounded by a silent mob holding torches, led by a fierce cleric","A loud zealot preaching to a mob accuses you of dark heresy against their god","A barbarian, delirious with a berserker rage, thinks you are a foul monster to kill","A petty nobleman accuses you of not showing the proper due respect and demands satisfaction","You stumble across a dead body and a person holding a bloody knife, who says, It wasn't me!","Someone fleeing from a dozen pursuers begs you for protection against harm","An old woman with a knife and foul breath asks you to pay tribute to her god","Three men eating around a campfire offer you some food, but it's not animal meat they're cooking...","A ghost stands in the middle of the road, wailing","A group of hooded cultists emerge, loudly proclaiming that you are the chosen one","A bard is playing beautiful music to a crowd, but all who listen are quickly under her thrall","A wild sorcerer seeks to test a spell on you","A paladin accuses you of performing evil acts and demands you pay for your sins with blood","A furious druid has someone trapped in vines and intends to kill them for desecrating the grove"];

        const challenges = ["A broken wagon blocks the way and must be repaired, overturned, or bypassed","A rowdy mob that must be calmed or evaded before they turn on you or some other victim","An overwhelmingly large pack of hungry, wild animals that must be outrun","There is an unfamiliar split in the path and the correct direction must be determined","A glade of flesh-eating plants that must be escaped before they can paralyze you","A broken bridge across a ravine that must be fixed or overcome to progress","A sudden, terrible storm that requires shelter to be found and constructed fast","A band of highwaymen that must be intimidated or out-smarted before things turn ugly","A magical illusion blocks the way and must be disabled or bypassed to progress","Recent weather has destroyed some notable landmarks and the path must be rediscovered"];

        const discoveries = ["An old and ruined tower","A burned out home","A howling cavern","A small, tightly locked chest","A statue of a good deity","A statue of an evil deity","A circle of stone pillars","A giant tree with far-reaching roots","A ruined temple to an unknown god","A cracked, stone fountain filled with a green ooze","A strange pillar carved with bloody runes","A strange, twisted tree","An abandoned wagon and the signs of battle","A small, unlocked hut with a warm hearth"," A locked door in the side of a hill","A chilling cemetery","A locked door in the side of a hill","An abandoned ruin of a castle","A wrecked, half-buried pirate ship"," A set of steps leading down into a crypt","A strange plant with an alluring scent","A rusted cauldron still warm to the touch","A tiny door in the foot of a tree","A beautiful glade with delicious-looking fruit","A sealed, metal coffin","A twisted pillar with an evil, carved face","A book on a bloody altar","A sword impaled in a monstrous stone statue","A map pinned to a tree with a black knife","A blood-red stone embedded in a twisted tree","A skeleton holding a small, red book","A hole in the ground where singing can be heard","A monument to an ancient battle","A giant skeleton of a long-dead gargantuan creature"," An abandoned, boarded-up house with ghostly wails","A stone archway covered in eldritch runes","A pool of sweet, red water","A glade of trees that ooze black sap","A collection of life-like humanoid stone statues","A secret wishing pool","A sleeping dragon","A half-buried chest surrounded by skeletons","7 rotating pillars of segmented red stone","A tree that burns with unnatural green fire","The ruins of a magical experiment gone wrong","A gazebo"];

        const desc  =
            (type === "Character") ? character[Math.floor(Math.random() * character.length)] :
            (type === "Social (Friendly)") ? friendly[Math.floor(Math.random() * friendly.length)] :
            (type === "Social (Hostile)") ? hostile[Math.floor(Math.random() * hostile.length)]  :
            (type === "Skill Challenge") ? challenges[Math.floor(Math.random() * challenges.length)]  :
            (type === "Combat (Non-commital)") ? "The party is attacked, but the enemies will flee easily." :
            (type === "Combat (Aggressive)") ? "The party is attacked and the enemies will fight to near death." :
            discoveries[Math.floor(Math.random() * discoveries.length)];

        return desc;
    },
    
    //BOONES & CONSEQUENCES
    dddegreesMenu = () => {
        sendChat('Darker Dungeon Degrees of Success', 
            '/w gm <div ' + divstyle + '>' +
                `<div ${headstyle}>Darker Dungeon Degrees of Success</div>` +
                `<div ${substyle}>Menu (v.${version})</div>` +
                `<div ${arrowstyle}></div>` +
                `<div style="text-align:center;"><a ${astyle2}" href="!DDboons">Boons</a></div>` +
                `<div>One boon for a success, and two for a critical success.</div>` +
                `<hr style="margin: 5px 2px;" />` +
                `<div style="text-align:center;"><a ${astyle2}" href="!DDconsequences">Consquences</a></div>` +
                `<div>One consequence for a failure, and two for a critical failure.</div>` +
            '</div>'
        );
    },

    ddboons = () => {
        const array = ["You restore some hit points","You gain a hit die","You find some extra gold","You gain a favour from an ally","You regain a spell slot","You deal extra damage","You heal some mental stress","You may spend a hit die to recover some hit points","You may switch places with a nearby ally","You can move to an advantageous position","You learn a piece of rare information","You (temporarily) lose one level of exhaustion","A magic item regains one charge","The locals hear about your achievement","You apply a condition to your enemy","A god notices your achievement","A condition improves","You gain advantage to your next roll","Your enemies are intimidated by you","You move your enemy"];
        outputDegree(array, "Boon");
    },

    ddconsequences = () => {
        const array = ["You or an ally take damage","An enemy reacts and takes an action","You gain some mental stress","Take a notch on your weapon/armor/item","You lose an item","One of your conditions worsens","Your torch goes out","An NPC becomes hostile to you","You lose some gold","You learn some misinformation","Your enemy becomes enraged","You gain the attention of the local guards","You drop your weapon","You stop and fall prone","You are poisoned or diseased","You are imprisoned","A crowd turns against you","A higher authority learns of your misdoings","A god punishes you","You lose some ammunition or hit dice"];
        outputDegree(array, "Consequence");
    },

    outputDegree = (array, degree) => {
        const description = array[Math.floor(Math.random() * array.length)];
        const output = `<div>${description}</div>`;
        sendChat(`Degree of Success`, 
            `/w gm <div ${divstyle}>` +
                `<div ${headstyle}>${degree}</div>` + 
                `<div ${arrowstyle}></div>` + output +
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
    DDEncounterGenerator.RegisterEventHandlers();
});