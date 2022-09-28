/*
Item Store Generator for D&D 5e
Inspired by Kirsty (https://app.roll20.net/users/1165285/kirsty)
Created by Julexar (https://app.roll20.net/users/9989180/julexar)

API Commands:
  GM ONLY
  !ms - Pulls up the menu and allows the GM to generate and modify the store
  GM & Players
  !shop - Posts the latest Store in the Chat
*/


var MagicStore = MagicStore || (function() {
    'use strict';
    
    var version = '1.3',
    
    setDefaults = function() {
        state.store = {
            now: {
                version: '1.3',
				        inventory: "Adamantine Armor,500,Amulet of Health,8000,Bag of Holding,4000"
            },
        };
    },
    
    checkDefaults = function() {
        if( state.store.now.version != version ){
            state.store.now.version = version;
        }
        if( ! state.store.now.inventory){state.store.now.inventory = "Adamantine Armor,500,Amulet of Health,8000,Bag of Holding,4000"};
    },
    
    handleInput = function(msg) {
        var args = msg.content.split(",");
        
        if (msg.type !== "api") {
			return;
		}
		
		if(playerIsGM(msg.playerid)){
		    switch(args[0]) {
		        case '!ms':
                    storeMenu();
                    break;
                case '!ms_inventory':
                    getInventory(msg);
                    storeMenu();
                    break;
                case '!shop':
                    shop();
                    break;
		    }
		}
    },
    
    storeMenu = function() {
        var colour = '#7E2D40';
        var divstyle = 'style="width: 189px; border: 1px solid black; background-color: #ffffff; padding: 5px;"'
        var astyle1 = 'style="text-align:center; border: 1px solid black; margin: 1px; padding: 2px; background-color: ' + colour + '; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 166px;';
        var astyle2 = 'style="text-align:center; border: 1px solid black; margin: 1px; padding: 2px; background-color: ' + colour + '; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 80px;';
        var tablestyle ='style="text-align:center; font-size: 12px; width: 100%;"';
        var arrowstyle = 'style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid ' + colour + '; margin-bottom: 2px; margin-top: 2px;"';
        var headstyle = 'style="color: ' + colour + '; font-size: 18px; text-align: left; font-variant: small-caps; font-family: Times, serif;"';
        var substyle = 'style="font-size: 11px; line-height: 13px; margin-top: -2px; font-style: italic;"';
        var trstyle = 'style="border-top: 1px solid #cccccc; text-align: left;"';
        var tdstyle = 'style="text-align: right;"';
        
        var inventory = state.store.now.inventory;
        var items = inventory.split(",");
        var invList = '';
        var i = 0;
        
        for (i = 0; i < items.length; i += 2) { 
            invList += '<tr ' + trstyle + '><td>' + items[i] + '</td><td ' + tdstyle + '>' + items[i+1] + '</td></tr>';
        }
        
        sendChat('Item Store', '/w gm <div ' + divstyle + '>' + //--       
            '<div ' + headstyle + '>Item Store</div>' + //--
            '<div ' + substyle + '>Menu (v.' + state.store.now.version + ')</div>' + //--
            '<div ' + arrowstyle + '></div>' + //--
            '<table ' + tablestyle + '>' + //--
                '<tr><th>Item</th><th>Price (gp)</th></tr>' + //--
                invList + //--
            '</table>'+ //--
            '<div style="text-align:center;"><a ' + astyle2 + '" href="!ms_inventory,scroll,?{Number of scrolls|5},?{Minimum Rarity|Common|Uncommon|Rare|Very Rare|Legendary},?{Maximum Rarity|Common|Uncommon|Rare|Very Rare|Legendary}">Scrolls</a>' + //--
            '<a ' + astyle2 + '" href="!ms_inventory,potion,?{Number of potions|5},?{Minimum Rarity|Common|Uncommon|Rare|Very Rare|Legendary},?{Maximum Rarity|Common|Uncommon|Rare|Very Rare|Legendary}">Potions</a></div>' + //--
            '<div style="text-align:center;"><a ' + astyle2 + '" href="!ms_inventory,weapon,?{Number of weapons|5},?{Minimum Rarity|Common|Uncommon,80|Rare|Very Rare|Legendary},?{Maximum Rarity|Common|Uncommon|Rare|Very Rare|Legendary}">Weapons</a>' + //--
            '<a ' + astyle2 + '" href="!ms_inventory,armour,?{Number of armour|5},?{Minimum Rarity|Common|Uncommon|Rare|Very Rare|Legendary},?{Maximum Rarity|Common|Uncommon|Rare|Very Rare|Legendary}">Armour</a></div>' + //--
            '<div style="text-align:center;"><a ' + astyle2 + '" href="!ms_inventory,item,?{Number of items|5},?{Minimum Rarity|Common|Uncommon|Rare|Very Rare|Legendary},?{Maximum Rarity|Common|Uncommon|Rare|Very Rare|Legendary}">Items</a>' + //--
            '<a ' + astyle2 + '" href="!ms_inventory,random,?{Number of random items|5},?{Minimum Rarity|Common|Uncommon|Rare|Very Rare|Legendary},?{Maximum Rarity|Common|Uncommon|Rare|Very Rare|Legendary}">Random</a></div>' + //--
            '<div style="text-align:center;"><a ' + astyle1 + '" href="!ms_inventory,mundane,?{Number of mundane items|5},?{Minimum Rarity|Common|Uncommon|Rare|Very Rare|Legendary},?{Maximum Rarity|Common|Uncommon|Rare|Very Rare|Legendary}">Mundane Items</a>' + //--
            '<div style="text-align:center;"><a ' + astyle1 + '" href="!shop">Show to Players</a></div>' + //--
            '</div>'
        );
    },
    
    shop = function() {
        var colour = '#7E2D40';
        var divstyle = 'style="width: 189px; border: 1px solid black; background-color: #ffffff; padding: 5px;"'
        var tablestyle ='style="text-align:center; font-size: 12px; width: 100%;"';
        var arrowstyle = 'style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid ' + colour + '; margin-bottom: 2px; margin-top: 2px;"';
        var headstyle = 'style="color: ' + colour + '; font-size: 18px; text-align: left; font-variant: small-caps; font-family: Times, serif;"';
        var substyle = 'style="font-size: 11px; line-height: 13px; margin-top: -2px; font-style: italic;"';
        var trstyle = 'style="border-top: 1px solid #cccccc; text-align: left;"';
        var tdstyle = 'style="text-align: right;"';
        
        var inventory = state.store.now.inventory;
        var items = inventory.split(",");
        var invList = '';
        var i = 0;
        
        for (i = 0; i < items.length; i += 2) { 
            invList += '<tr ' + trstyle + '><td>' + items[i] + '</td><td ' + tdstyle + '>' + items[i+1] + '</td></tr>';
        }
        
        sendChat('Item Store', ' <div ' + divstyle + '>' + //--
            '<div ' + headstyle + '>Item Store</div>' + //--
            '<div ' + substyle + '>Menu (v.' + state.store.now.version + ')</div>' + //--
            '<div ' + arrowstyle + '></div>' + //--
            '<table ' + tablestyle + '>' + //--
                '<tr><th>Item</th><th>Price (gp)</th></tr>' + //--
                invList + //--
            '</table>'+ //--
            '</div>'
        );
    },
    
    
    
    getInventory = function(msg) {
        var args = msg.content.split(",");
        var type = args[1];
        if (!type) {
            type="";
        }
        var rarity;
        
        var i;
        var newInv = "";
        var randNo;
        
        for (i = 0; i < args[2]; i ++) { 
            
            if (i>0){newInv += ','}
            
            rarity = getRarity(args[3],args[4]);
            randNo = randomInteger(6);
            
            if (type == 'scroll'){newInv += getScroll(rarity)}
            if (type == 'potion'){newInv += getPotion(rarity)}
            if (type == 'weapon'){newInv += getWeapon(rarity)}
            if (type == 'armour'){newInv += getArmour(rarity)}
            if (type == 'item'){newInv += getItem(rarity)}
            if (type == 'random'){
                switch(randNo) {
                    case 1:
                        newInv += getScroll(rarity);
                        break;
                    case 2:
                        newInv += getPotion(rarity);
                        break;
                    case 3:
                        newInv += getWeapon(rarity);
                        break;
                    case 4:
                        newInv += getArmour(rarity);
                        break;
                    case 5:
                        newInv += getItem(rarity);
                        break;
                    case 6:
                        newInv += getMundane(rarity);
                        break;
                }
            }
            if (type == 'mundane') {newInv += getMundane(rarity)}
            if (type=="") {newInv=""}
        }
        
        state.store.now.inventory = newInv;
    },
    
    getRarity = function(min,max) {
        var maxrare = max;
        var minrare = min;
        var rarity = min.toLowerCase() + "," + max.toLowerCase();
        
        return rarity;
    },
    
    getScroll = function(rarity) {
        var item;
        var level;
        
        switch(rarity) {
            case 'common,common':
                level = randomInteger(2);
                if (level == 2){level = 0}
                item = rollSpell(level);
                break;
            case 'uncommon,uncommon':
                level = randomInteger(2);
                if (level == 1){
                    level = 2;
                }else{
                    level = 3;
                }
                item = rollSpell(level);
                break;
            case 'rare,rare':
                level = randomInteger(2);
                if (level == 1){
                    level = 4;
                }else{
                    level = 5;
                }
                item = rollSpell(level);
                break;
            case 'very rare,very rare':
                level = randomInteger(3);
                if (level == 1){
                    level = 6;
                }else if(level == 2){
                    level = 7;
                }else{
                    level = 8;
                }
                item = rollSpell(level);
                break;
            case 'legendary,legendary':
                level = 9;
                item = rollSpell(level);
                break;
            case 'common,uncommon':
                level = randomInteger(4);
                if (level==4) {
                    level = 0;
                }
                item = rollSpell(level);
                break;
            case 'common,rare':
                level = randomInteger(6);
                if (level==6) {
                    level = 0;
                }
                item = rollSpell(level);
                break;
            case 'common,very rare':
                level = randomInteger(9);
                if (level==9) {
                    level = 0;
                }
                item = rollSpell(level);
                break;
            case 'common,legendary':
                level = randomInteger(10);
                if (level==10) {
                    level = 0;
                }
                item = rollSpell(level);
                break;
            case 'uncommon,rare':
                level = randomInteger(5);
                while (level<2) {
                    level = randomInteger(5);
                }
                item = rollSpell(level);
                break;
            case 'uncommon,very rare':
                level = randomInteger(8);
                while (level<2) {
                    level = randomInteger(8);
                }
                item = rollSpell(level);
                break;
            case 'uncommon,legendary':
                level = randomInteger(9);
                while (level<2) {
                    level = randomInteger(9);
                }
                item = rollSpell(level);
                break;
            case 'rare,very rare':
                level = randomInteger(8);
                while (level<4) {
                    level = randomInteger(8);
                }
                item = rollSpell(level);
                break;
            case 'rare,legendary':
                level = randomInteger(9);
                while (level<4) {
                    level = randomInteger(9);
                }
                item = rollSpell(level);
                break;
            case 'very rare,legendary':
                level = randomInteger(9);
                while (level<6) {
                    level = randomInteger(9);
                }
                item = rollSpell(level);
                break;
        }
        
        return item;
    },
    
    rollSpell = function(level) {
        var spellList;
        
        switch(level) {
            case 0:
                spellList = "Acid Splash,10;Blade Ward,10;Booming Blade,10;Chill Touch,10;Control Flames,10;Create Bonfire,10;Dancing Lights,10;Druidcraft,10;Eldritch Blast,10;Fire Bolt,10;Friends,10;Frostbite,10;Green-Flame Blade,10;Guidance,10;Gust,10;Infestation,10;Light,10;Lightning Lure,10;Mage Hand,10;Magic Stone,10;Mending,10;Message,10;Minor Illusion,10;Mold earth,10;Poison Spray,10;Prestidigitation,10;Primal Savagery,10;Produce Flame,10;Ray of Frost,10;Resistance,10;Sacred Flame,10;Shape Water,10;Shillelagh,10;Shocking Grasp,10;Spare the Dying,10;Sword Burst,10;Thaumaturgy,10;Thorn Whip,10;Thunderclap,10;Toll the Dead,10;True Strike,10;Vicious Mockery,10;Word of Radiance,10";
                break;
            case 1:
                spellList = "Absorb Elements,60;Alarm,60;Animal Friendship,60;Armor of Agathys,60;Arms of Hadar,60;Bane,60;Beast Bond,60;Bless,60;Burning Hands,60;Catapult,60;Cause Fear,60;Ceremony,60;Chaos Bolt,60;Charm Person,60;Chromatic Orb,60;Color Spray,60;Command,60;Compelled Duel,60;Comprehend Languages,60;Create or Destroy Water,60;Cure Wounds,60;Detect Evil and Good,60;Detect Magic,60;Detect Poison and Disease,60;Disguise Self,60;Dissonant Whispers,60;Divine Favor,60;Earth Tremor,60;Ensnaring Strike,60;Entangle,60;Expeditious Retreat,60;Faerie Fire,60;False Life,60;Feather Fall,60;Find Familiar,60;Fog Cloud,60;Goodberry,60;Grease,60;Guiding Bolt,60;Hail of Thorns,60;Healing Word,60;Hellish Rebuke,60;Heroism,60;Hex,60;Hunter’s Mark,60;Ice Knife,60;Identify,60;Illusory Script,60;Inflict Wounds,60;Jump,60;Longstrider,60;Mage Armor,60;Magic Missile,60;Protection from Evil and Good,60;Purify Food and Drink,60;Ray of Sickness,60;Sanctuary,60;Searing Smite,60;Shield,60;Shield of Faith,60;Silent Image,60;Sleep,60;Snare,60;Speak with Animals,60;Tasha’s Hideous Laughter,60;Tenser’s Floating Disk,60;Thunderous Smite,60;Thunderwave,60;Unseen Servant,60;Witch Bolt,60;Wrathful Smite,60;Zephyr Strike,60";
                break;
            case 2:
                spellList = "Aganazzar’s Scorcher,120;Aid,120;Alter Self,120;Animal Messenger,120;Arcane Lock,120;Augury,120;Barkskin,120;Beast Sense,120;Blindness/Deafness,120;Blur,120;Branding Smite,120;Calm Emotions,120;Cloud of Daggers,120;Continual Flame,120;Cordon of Arrows,120;Crown of Madness,120;Darkness,120;Darkvision,120;Detect Thoughts,120;Dragon's Breath,120;Dust Devil,120;Earthbind,120;Enhance Ability,120;Enlarge/Reduce,120;Enthrall,120;Find Steed,120;Find Traps,120;Flame Blade,120;Flaming Sphere,120;Gentle Repose,120;Gust of Wind,120;Healing Spirit,120;Heat Metal,120;Hold Person,120;Invisibility,120;Knock,120;Lesser Restoration,120;Levitate,120;Locate Animals or Plants,120;Locate Object,120;Magic Mouth,120;Magic Weapon,120;Maximilian’s Earthen Grasp,120;Melf’s Acid Arrow,120;Mind Spike,120;Mirror Image,120;Misty Step,120;Moonbeam,120;Nystul’s Magic Aura,120;Pass Without Trace,120;Phantasmal Force,120;Prayer of Healing,120;Protection from Poison,120;Pyrotechnics,120;Ray of Enfeeblement,120;Rope Trick,120;Scorching Ray,120;See invisibility,120;Shadow Blade,120;Shatter,120;Silence,120;Skywrite,120;Snilloc’s Snowball Swarm,120;Spider Climb,120;Spike Growth,120;Spiritual Weapon,120;Suggestion,120;Warding Bond,120;Warding Wind,120;Web,120;Zone of Truth,120";
                break;
            case 3:
                spellList = "Animate Dead,200;Aura of Vitality,200;Beacon of Hope,200;Bestow Curse,200;Blinding Smite,200;Blink,200;Call Lightning,200;Catnap,200;Clairvoyance,200;Conjure Animals,200;Conjure Barrage,200;Counterspell,200;Create Food and Water,200;Crusader’s Mantle,200;Daylight,200;Dispel Magic,200;Elemental Weapon,200;Erupting Earth,200;Fear,200;Feign Death,200;Fireball,200;Flame Arrows,200;Fly,200;Gaseous Form,200;Glyph of Warding,200;Haste,200;Hunger of Hadar,200;Hypnotic Pattern,200;Leomund’s Tiny Hut,200;Lightning Arrow,200;Lightning Bolt,200;Magic Circle,200;Major Image,200;Mass Healing Word,200;Meld into Stone,200;Melf’s Minute Meteors,200;Nondetection,200;Phantom Steed,200;Plant Growth,200;Protection from Energy,200;Remove Curse,200;Revivify,200;Sending,200;Sleet Storm,200;Slow,200;Speak with Dead,200;Speak with Plants,200;Spirit Guardians,200;Stinking Cloud,200;Tidal Wave,200;Tongues,200;Vampiric Touch,200;Wall of Sand,200;Wall of Water,200;Water Breathing,200;Water Walk,200;Wind Wall,200;Enemies abound,200;Life Transference,200;Summon Lesser Demons,200;Thunder Step,200;Tiny Servant,200";
                break;
            case 4:
                spellList = "Arcane Eye,320;Aura of Life,320;Aura of Purity,320;Banishment,320;Blight,320;Compulsion,320;Confusion,320;Conjure Minor Elementals,320;Conjure Woodland Beings,320;Control Water,320;Death Ward,320;Dimension Door,320;Divination,320;Dominate Beast,320;Elemental Bane,320;Evard’s Black Tentacles,320;Fabricate,320;Fire Shield,320;Freedom of Movement,320;Giant Insect,320;Grasping Vine,320;Greater Invisibility,320;Guardian of Faith,320;Hallucinatory Terrain,320;Ice Storm,320;Leomund’s Secret Chest,320;Locate Creature,320;Mordenkainen’s Faithful Hound,320;Mordenkainen’s Private Sanctum,320;Otiluke’s Resilient Sphere,320;Phantasmal Killer,320;Polymorph,320;Staggering Smite,320;Stone Shape,320;Stoneskin,320;Storm Sphere,320;Vitriolic Sphere,320;Wall of Fire,320;Watery Sphere,320;Charm Monster,320;Find Greater Steed,320;Guardian of Nature,320;Shadow of Moil,320;Sickening Radiance,320;Summon Greater Demon,320";
                break;
            case 5:
                spellList = "Animate Objects,640;Antilife Shell,640;Awaken,640;Banishing Smite,640;Bigby’s Hand,640;Circle of Power,640;Cloudkill,640;Commune,640;Commune with Nature,640;Cone of Cold,640;Conjure Elemental,640;Conjure Volley,640;Contact Other Plane,640;Contagion,640;Control Winds,640;Creation,640;Destructive Wave,640;Dispel Evil and Good,640;Dominate Person,640;Dream,640;Flame Strike,640;Geas,640;Greater Restoration,640;Hallow,640;Hold Monster,640;Immolation,640;Insect Plague,640;Legend Lore,640;Maelstrom,640;Mass Cure Wounds,640;Mislead,640;Modify Memory,640;Passwall,640;Planar Binding,640;Raise Dead,640;Rary’s Telepathic Bond,640;Reincarnate,640;Scrying,640;Seeming,640;Swift Quiver,640;Telekinesis,640;Teleportation Circle,640;Transmute Rock,640;Tree Stride,640;Wall of Force,640;Wall of Stone,640;Danse Macabre,640;Dawn,640;Druid Grove,640;Enervation,640;Far Step,640;Holy Weapon,640;Infernal Calling,640;Negative Energy Flood,640;Skill Empowerment,640;Steel Wind Strike,640;Synaptic Static,640;Wall of Light,640;Wrath of Nature,640";
                break;
            case 6:
                spellList = "Arcane Gate,1280;Blade Barrier,1280;Bones of the Earth,1280;Chain Lightning,1280;Circle of Death,1280;Conjure Fey,1280;Contingency,1280;Create Undead,1280;Disintegrate,1280;Drawmij’s Instant Summons,1280;Eyebite,1280;Find the Path,1280;Flesh to Stone,1280;Forbiddance,1280;Globe of Invulnerability,1280;Guards and Wards,1280;Harm,1280;Heal,1280;Heroes’ Feast,1280;Investiture of Flame,1280;Investiture of Ice,1280;Investiture of Stone,1280;Investiture of Wind,1280;Magic Jar,1280;Mass Suggestion,1280;Move Earth,1280;Otiluke’s Freezing Sphere,1280;Otto’s Irresistible Dance,1280;Planar Ally,1280;Primordial Ward,1280;Programmed Illusion,1280;Sunbeam,1280;Transport via Plants,1280;True Seeing,1280;Wall of Ice,1280;Wall of Thorns,1280;Wind Walk,1280;Word of Recall,1280;Create Homunculus,1280;Mental Prison,1280;Primordial Ward,1280;Scatter,1280;Soul Cage,1280;Tenser’s Transformation,1280";
                break;
            case 7:
                spellList = "Conjure Celestial,2560;Delayed Blast Fireball,2560;Divine Word,2560;Etherealness,2560;Finger of Death,2560;Fire Storm,2560;Forcecage,2560;Mirage Arcane,2560;Mordenkainen’s Magnificent Mansion,2560;Mordenkainen’s Sword,2560;Plane Shift,2560;Prismatic Spray,2560;Project Image,2560;Regenerate,2560;Resurrection,2560;Reverse Gravity,2560;Sequester,2560;Simulacrum,2560;Symbol,2560;Teleport,2560;Whirlwind,2560;Crown of Stars,2560;Power Word Pain,2560;Temple of the Gods,2560";
                break;
            case 8:
                spellList = "Abi-Dalzim’s Horrid Wilting,5120;Animal Shapes,5120;Antimagic Field,5120;Antipathy/Sympathy,5120;Clone,5120;Control Weather,5120;Demiplane,5120;Dominate Monster,5120;Earthquake,5120;Feeblemind,5120;Glibness,5120;Holy Aura,5120;Incendiary Cloud,5120;Maze,5120;Mind Blank,5120;Power Word Stun,5120;Sunburst,5120;Telepathy,5120;Trap the Soul,5120;Tsunami,5120;Illusory Dragon,5120;Maddening Darkness,5120;Mighty Fortress,5120";
                break;
            case 9:
                spellList = "Astral Projection,10240;Foresight,10240;Gate,10240;Imprisonment,10240;Mass Heal,10240;Meteor Swarm,10240;Power Word Heal,10240;Power Word Kill,10240;Prismatic Wall,10240;Shapechange,10240;Storm of Vengeance,10240;Time Stop,10240;True Polymorph,10240;True Resurrection,10240;Weird,10240;Wish,10240;Invulnerability,10240;Mass Polymorph,10240;Psychic Scream,10240";
                break;
        }
        
        
        var itemsList = spellList.split(";");
        var len = itemsList.length;
        
        var number = randomInteger(len) - 1;
        var item = 'Scroll: ' + itemsList[number];
        
        return item;
    },
    
    getPotion = function(rarity) {
        var potionList;
        var rand;
        
        switch(rarity) {
            case 'common,common':
                potionList = "Potion of Climbing,180;Potion of Healing,50";
                break;
            case 'uncommon,uncommon':
                potionList = "Oil of Slipperiness,480;Philter of Love,90;Potion of Animal Friendship,200;Potion of Fire Breath,150;Potion of Greater Healing,150;Potion of Growth,270;Potion of Poison,100;Potion of Resistance,300;Potion of Water Breathing,180";
                break;
            case 'rare,rare':
                potionList = "Elixir of Health,120;Oil of Etherealness,1920;Potion of Clairvoyance,960;Potion of Diminution,270;Potion of Gaseous Form,300;Potion of Heroism,180;Potion of Invulnerability,3840;Potion of Mind Reading,180";
                break;
            case 'very rare,very rare':
                potionList = "Oil of Sharpness,3200;Potion of Flying,500;Potion of Invisibility,180;Potion of Longevity,9000;Potion of Speed,400;Potion of Superior Healing,450;Potion of Supreme Healing,1350;Potion of Vitality,960";
                break;
            case 'legendary,legendary':
                potionList = "Oil of Sharpness,3200;Potion of Flying,500;Potion of Invisibility,180;Potion of Longevity,9000;Potion of Speed,400;Potion of Superior Healing,450;Potion of Supreme Healing,1350;Potion of Vitality,960";
                break;
            case 'common,uncommon':
                rand = randomInteger(100);
                if (rand<=70) {
                    potionList = "Potion of Climbing,180;Potion of Healing,50";
                } else if (rand>70) {
                    potionList = "Oil of Slipperiness,480;Philter of Love,90;Potion of Animal Friendship,200;Potion of Fire Breath,150;Potion of Greater Healing,150;Potion of Growth,270;Potion of Poison,100;Potion of Resistance,300;Potion of Water Breathing,180";
                }
                break;
            case 'common,rare':
                rand = randomInteger(100);
                if (rand<=55) {
                    potionList = "Potion of Climbing,180;Potion of Healing,50";
                } else if (rand<=85) {
                    potionList = "Oil of Slipperiness,480;Philter of Love,90;Potion of Animal Friendship,200;Potion of Fire Breath,150;Potion of Greater Healing,150;Potion of Growth,270;Potion of Poison,100;Potion of Resistance,300;Potion of Water Breathing,180";
                } else if (rand>85) {
                    potionList = "Elixir of Health,120;Oil of Etherealness,1920;Potion of Clairvoyance,960;Potion of Diminution,270;Potion of Gaseous Form,300;Potion of Heroism,180;Potion of Invulnerability,3840;Potion of Mind Reading,180";
                }
                break;
            case 'common,very rare':
                rand = randomInteger(100);
                if (rand<=50) {
                    potionList = "Potion of Climbing,180;Potion of Healing,50";
                } else if (rand<=80) {
                    potionList = "Oil of Slipperiness,480;Philter of Love,90;Potion of Animal Friendship,200;Potion of Fire Breath,150;Potion of Greater Healing,150;Potion of Growth,270;Potion of Poison,100;Potion of Resistance,300;Potion of Water Breathing,180";
                } else if (rand<=95) {
                    potionList = "Elixir of Health,120;Oil of Etherealness,1920;Potion of Clairvoyance,960;Potion of Diminution,270;Potion of Gaseous Form,300;Potion of Heroism,180;Potion of Invulnerability,3840;Potion of Mind Reading,180";
                } else if (rand>95) {
                    potionList = "Oil of Sharpness,3200;Potion of Flying,500;Potion of Invisibility,180;Potion of Longevity,9000;Potion of Speed,400;Potion of Superior Healing,450;Potion of Supreme Healing,1350;Potion of Vitality,960";
                }
                break;
            case 'common,legendary':
                rand = randomInteger(100);
                if (rand<=50) {
                    potionList = "Potion of Climbing,180;Potion of Healing,50";
                } else if (rand<=80) {
                    potionList = "Oil of Slipperiness,480;Philter of Love,90;Potion of Animal Friendship,200;Potion of Fire Breath,150;Potion of Greater Healing,150;Potion of Growth,270;Potion of Poison,100;Potion of Resistance,300;Potion of Water Breathing,180";
                } else if (rand<=95) {
                    potionList = "Elixir of Health,120;Oil of Etherealness,1920;Potion of Clairvoyance,960;Potion of Diminution,270;Potion of Gaseous Form,300;Potion of Heroism,180;Potion of Invulnerability,3840;Potion of Mind Reading,180";
                } else if (rand>95) {
                    potionList = "Oil of Sharpness,3200;Potion of Flying,500;Potion of Invisibility,180;Potion of Longevity,9000;Potion of Speed,400;Potion of Superior Healing,450;Potion of Supreme Healing,1350;Potion of Vitality,960";
                }
                break;
            case 'uncommon,rare':
                rand = randomInteger(100);
                if (rand<=85) {
                    potionList = "Oil of Slipperiness,480;Philter of Love,90;Potion of Animal Friendship,200;Potion of Fire Breath,150;Potion of Greater Healing,150;Potion of Growth,270;Potion of Poison,100;Potion of Resistance,300;Potion of Water Breathing,180";
                } else if (rand>85) {
                    potionList = "Elixir of Health,120;Oil of Etherealness,1920;Potion of Clairvoyance,960;Potion of Diminution,270;Potion of Gaseous Form,300;Potion of Heroism,180;Potion of Invulnerability,3840;Potion of Mind Reading,180";
                }
                break;
            case 'uncommon,very rare':
                rand = randomInteger(100);
                if (rand<=80) {
                    potionList = "Oil of Slipperiness,480;Philter of Love,90;Potion of Animal Friendship,200;Potion of Fire Breath,150;Potion of Greater Healing,150;Potion of Growth,270;Potion of Poison,100;Potion of Resistance,300;Potion of Water Breathing,180";
                } else if (rand<=95) {
                    potionList = "Elixir of Health,120;Oil of Etherealness,1920;Potion of Clairvoyance,960;Potion of Diminution,270;Potion of Gaseous Form,300;Potion of Heroism,180;Potion of Invulnerability,3840;Potion of Mind Reading,180";
                } else if (rand>95) {
                    potionList = "Oil of Sharpness,3200;Potion of Flying,500;Potion of Invisibility,180;Potion of Longevity,9000;Potion of Speed,400;Potion of Superior Healing,450;Potion of Supreme Healing,1350;Potion of Vitality,960";
                }
                break;
            case 'rare,very rare':
                rand = randomInteger(100);
                if (rand<=95) {
                    potionList = "Elixir of Health,120;Oil of Etherealness,1920;Potion of Clairvoyance,960;Potion of Diminution,270;Potion of Gaseous Form,300;Potion of Heroism,180;Potion of Invulnerability,3840;Potion of Mind Reading,180";
                } else if (rand>95) {
                    potionList = "Oil of Sharpness,3200;Potion of Flying,500;Potion of Invisibility,180;Potion of Longevity,9000;Potion of Speed,400;Potion of Superior Healing,450;Potion of Supreme Healing,1350;Potion of Vitality,960";
                }
                break;
            case 'rare,legendary':
                rand = randomInteger(100);
                if (rand<=95) {
                    potionList = "Elixir of Health,120;Oil of Etherealness,1920;Potion of Clairvoyance,960;Potion of Diminution,270;Potion of Gaseous Form,300;Potion of Heroism,180;Potion of Invulnerability,3840;Potion of Mind Reading,180";
                } else if (rand>95) {
                    potionList = "Oil of Sharpness,3200;Potion of Flying,500;Potion of Invisibility,180;Potion of Longevity,9000;Potion of Speed,400;Potion of Superior Healing,450;Potion of Supreme Healing,1350;Potion of Vitality,960";
                }
                break;
            case 'very rare,legendary':
                potionList = "Oil of Sharpness,3200;Potion of Flying,500;Potion of Invisibility,180;Potion of Longevity,9000;Potion of Speed,400;Potion of Superior Healing,450;Potion of Supreme Healing,1350;Potion of Vitality,960";
                break;
        }
        
        var itemsList = potionList.split(";");
        var len = itemsList.length;
        
        var number = randomInteger(len) - 1;
        var item = itemsList[number];
        
        return item;
    },
    
    getWeapon = function(rarity) {
        var weaponList =  "Club,0.1;Dagger,2;Greatclub,0.2;Handaxe,5;Javelin,0.5;Light Hammer,2;Mace,5;Quarterstaff,0.2;Sickle,1;Spear,1;Crossbow (light),25;Dart,0.05;Shortbow,25;Sling,0.1;Battleaxe,10;Flail,10;Glaive,20;Greataxe,30;Greatsword,50;Halberd,20;Lance,10;Longsword,15;Maul,10;Morningstar,15;Pike,5;Rapier,25;Scimitar,25;Shortsword,10;Trident,5;War Pick,5;Warhammer,15;Whip,2;Blowgun,10;Crossbow (hand),75;Crossbow (heavy),50;Longbow,50;Net,1";
        var itemsList = weaponList.split(";");
        var len = itemsList.length;
        var number = randomInteger(len) - 1;
        var item = itemsList[number];
        
        var selected = item.split(',');
        var weapon;
        var price;
        var rand;
        
        switch(rarity) {
            case 'common,common':
                weapon = selected[0];
                price = selected[1];
                break;
            case 'uncommon,uncommon':
                weapon = '+1 ' + selected[0];
                price = 1000 + Math.trunc(selected[1]);
                break;
            case 'rare,rare':
                weapon = '+2 ' + selected[0];
                price = 4000 + Math.trunc(selected[1]);
                break;
            case 'very rare,very rare':
                weapon = '+3 ' + selected[0];
                price = 16000 + Math.trunc(selected[1]);
                break;
            case 'legendary,legendary':
                weapon = '+3 ' + selected[0];
                price = 16000 + Math.trunc(selected[1]);
                break;
            case 'common,uncommon':
                rand = randomInteger(100);
                if (rand<=70) {
                    //Common
                    weapon = selected[0];
                    price = selected[1];
                } else if (rand>70) {
                    //Uncommon
                    weapon = '+1 ' + selected[0];
                    price = 1000 + Math.trunc(selected[1]);
                }
                break;
            case 'common,rare':
                rand = randomInteger(100);
                if (rand<=55) {
                    weapon = selected[0];
                    price = selected[1];
                } else if (rand<=85) {
                    weapon = '+1 ' + selected[0];
                    price = 1000 + Math.trunc(selected[1]);
                } else if (rand>85) {
                   weapon = '+2 ' + selected[0];
                   price = 4000 + Math.trunc(selected[1]);
                }
                break;
            case 'common,very rare':
                rand = randomInteger(100);
                if (rand<=50) {
                    weapon = selected[0];
                    price = selected[1];
                } else if (rand<=80) {
                    weapon = '+1 ' + selected[0];
                    price = 1000 + Math.trunc(selected[1]);
                } else if (rand<=95) {
                    weapon = '+2 ' + selected[0];
                    price = 4000 + Math.trunc(selected[1]);
                } else if (rand>95) {
                    weapon = '+3 ' + selected[0];
                    price = 16000 + Math.trunc(selected[1]);
                }
                break;
            case 'common,legendary':
                rand = randomInteger(100);
                if (rand<=50) {
                    weapon = selected[0];
                    price = selected[1];
                } else if (rand<=80) {
                    weapon = '+1 ' + selected[0];
                    price = 1000 + Math.trunc(selected[1]);
                } else if (rand<=95) {
                    weapon = '+2 ' + selected[0];
                    price = 4000 + Math.trunc(selected[1]);
                } else if (rand>95) {
                    weapon = '+3 ' + selected[0];
                    price = 16000 + Math.trunc(selected[1]);
                }
                break;
            case 'uncommon,rare':
                rand = randomInteger(100);
                if (rand<=85) {
                    weapon = '+1 ' + selected[0];
                    price = 1000 + Math.trunc(selected[1]);
                } else if (rand>85) {
                    weapon = '+2 ' + selected[0];
                    price = 4000 + Math.trunc(selected[1]);
                }
                break;
            case 'uncommon,very rare':
                rand = randomInteger(100);
                if (rand<=80) {
                    weapon = '+1 ' + selected[0];
                    price = 1000 + Math.trunc(selected[1]);
                } else if (rand<=95) {
                    weapon = '+2 ' + selected[0];
                    price = 4000 + Math.trunc(selected[1]);
                } else if (rand>95) {
                    weapon = '+3 ' + selected[0];
                    price = 16000 + Math.trunc(selected[1]);
                }
                break;
            case 'uncommon,legendary':
                rand = randomInteger(100);
                if (rand<=80) {
                    weapon = '+1 ' + selected[0];
                    price = 1000 + Math.trunc(selected[1]);
                } else if (rand<=95) {
                    weapon = '+2 ' + selected[0];
                    price = 4000 + Math.trunc(selected[1]);
                } else if (rand>95) {
                    weapon = '+3 ' + selected[0];
                    price = 16000 + Math.trunc(selected[1]);
                }
                break;
            case 'rare,very rare':
                rand = randomInteger(100);
                if (rand<=95) {
                    weapon = '+2 ' + selected[0];
                    price = 4000 + Math.trunc(selected[1]);
                } else if (rand>95) {
                    weapon = '+3 ' + selected[0];
                    price = 16000 + Math.trunc(selected[1]);
                }
                break;
            case 'rare,legendary':
                rand = randomInteger(100);
                if (rand<=95) {
                    weapon = '+2 ' + selected[0];
                    price = 4000 + Math.trunc(selected[1]);
                } else if (rand>95) {
                    weapon = '+3 ' + selected[0];
                    price = 16000 + Math.trunc(selected[1]);
                }
                break;
            case 'very rare,legendary':
                weapon = '+3 ' + selected[0];
                price = 16000 + Math.trunc(selected[1]);
                break;
        }
        
        item = weapon + ',' + price;
        
        return item;
    },
    
    getArmour = function(rarity) {
        var armourList =  "Padded Armour,5;Leather Armour,10;Studded leather Armour,45;Hide Armour,10;Chain shirt Armour,50;Scale mail Armour,50;Breastplate Armour,400;Half plate Armour,750;Ring mail Armour,30;Chain mail Armour,75;Splint Armour,200;Plate Armour,1500";
        var itemsList = armourList.split(";");
        var len = itemsList.length;
        var number = randomInteger(len) - 1;
        var item = itemsList[number];
        
        var selected = item.split(',');
        var armour;
        var price;
        var rand;
        
        switch(rarity) {
            case 'common,common':
                armour = selected[0];
                price = selected[1];
                break;
            case 'uncommon,uncommon':
                armour = '+1 ' + selected[0];
                price = 1500 + Math.trunc(selected[1]);
                break;
            case 'rare,rare':
                armour = '+2 ' + selected[0];
                price = 6000 + Math.trunc(selected[1]);
                break;
            case 'very rare,very rare':
                armour = '+3 ' + selected[0];
                price = 24000 + Math.trunc(selected[1]);
                break;
            case 'legendary,legendary':
                armour = '+3 ' + selected[0];
                price = 24000 + Math.trunc(selected[1]);
                break;
            case 'common,uncommon':
                rand = randomInteger(100);
                if (rand<=80) {
                    armour = selected[0];
                    price = selected[1];
                } else if (rand>80) {
                    armour = '+1 ' + selected[0];
                    price = 1500 + Math.trunc(selected[1]);
                }
                break;
            case 'common,rare':
                rand = randomInteger(100);
                if (rand<=55) {
                    armour = selected[0];
                    price = selected[1];
                } else if (rand<=85) {
                    armour = '+1 ' + selected[0];
                    price = 1500 + Math.trunc(selected[1]);
                } else if (rand>85) {
                    armour = '+2 ' + selected[0];
                    price = 6000 + Math.trunc(selected[1]);
                }
                break;
            case 'common,very rare':
                rand = randomInteger(100);
                if (rand<=50) {
                    armour = selected[0];
                    price = selected[1];
                } else if (rand<=80) {
                    armour = '+1 ' + selected[0];
                    price = 1500 + Math.trunc(selected[1]);
                } else if (rand<=95) {
                    armour = '+2 ' + selected[0];
                    price = 6000 + Math.trunc(selected[1]);
                } else if (rand>95) {
                    armour = '+3 ' + selected[0];
                    price = 24000 + Math.trunc(selected[1]);
                }
                break;
            case 'common,legendary':
                rand = randomInteger(100);
                if (rand<=50) {
                    armour = selected[0];
                    price = selected[1];
                } else if (rand<=80) {
                    armour = '+1 ' + selected[0];
                    price = 1500 + Math.trunc(selected[1]);
                } else if (rand<=95) {
                    armour = '+2 ' + selected[0];
                    price = 6000 + Math.trunc(selected[1]);
                } else if (rand>95) {
                    armour = '+3 ' + selected[0];
                    price = 24000 + Math.trunc(selected[1]);
                }
                break;
            case 'uncommon,rare':
                rand = randomInteger(100);
                if (rand<=85) {
                    armour = '+1 ' + selected[0];
                    price = 1500 + Math.trunc(selected[1]);
                } else if (rand>85) {
                    armour = '+2 ' + selected[0];
                    price = 6000 + Math.trunc(selected[1]);
                }
                break;
            case 'uncommon,very rare':
                rand = randomInteger(100);
                if (rand<=80) {
                    armour = '+1 ' + selected[0];
                    price = 1500 + Math.trunc(selected[1]);
                } else if (rand<=95) {
                    armour = '+2 ' + selected[0];
                    price = 6000 + Math.trunc(selected[1]);
                } else if (rand>95) {
                    armour = '+3 ' + selected[0];
                    price = 24000 + Math.trunc(selected[1]);
                }
                break;
            case 'uncommon,legendary':
                rand = randomInteger(100);
                if (rand<=80) {
                    armour = '+1 ' + selected[0];
                    price = 1500 + Math.trunc(selected[1]);
                } else if (rand<=95) {
                    armour = '+2 ' + selected[0];
                    price = 6000 + Math.trunc(selected[1]);
                } else if (rand>95) {
                    armour = '+3 ' + selected[0];
                    price = 24000 + Math.trunc(selected[1]);
                }
                break;
            case 'rare,very rare':
                rand = randomInteger(100);
                if (rand<=95) {
                    armour = '+2 ' + selected[0];
                    price = 6000 + Math.trunc(selected[1]);
                } else if (rand>95) {
                    armour = '+3 ' + selected[0];
                    price = 24000 + Math.trunc(selected[1]);
                }
                break;
            case 'rare,legendary':
                rand = randomInteger(100);
                if (rand<=95) {
                    armour = '+2 ' + selected[0];
                    price = 6000 + Math.trunc(selected[1]);
                } else if (rand>95) {
                    armour = '+3 ' + selected[0];
                    price = 24000 + Math.trunc(selected[1]);
                }
                break;
            case 'very rare,legendary':
                armour = '+3 ' + selected[0];
                price = 24000 + Math.trunc(selected[1]);
                
        }
        
        item = armour + ',' + price;
        return item;
    },
    
    getItem = function(rarity) {
        var list;
        var rand;
        
        switch(rarity) {
            case 'common,common':
                list = "Armor of Gleaming,50;Bead of Nourishment,50;Bead of Refreshment,50;Boots of False Tracks,50;Candle of the Deep,50;Cast-off Armour,50;Charlatan\'s Die,50;Cloak of Billowing,50;Cloak of Many Fashions,50;Clockwork Amulet,50;Clothes of Mending,50;Dark Shard Amulet,50;Dread Helm,50;Ear Horn of Hearing,50;Enduring Spellbook,50;Ersatz Eye,50;Hat of Vermin,50;Hat of Wizardry,50;Heward\'s Handy Spice,50;Horn of Silent Alarm,50;Instrument of Illusions,50;Instrument of Scribing,50;Lock of Trickery,50;Moon-touched Sword,50;Mystery Key,50;Orb of Direction,50;Orb of Time,50;Perfume of Bewiching,50;Pipe of Smoke Monsters,50;Pole of Angling,50;Pole of Collapsing,50;Pot of Awakening,50;Rope of Mending,50;Ruby of the Wary Mage,50;Staff of Adornment,50;Staff of Birdcalls,50;Staff of Flowers,50;Talking Doll,50;Tankard of Sobriety,50;Unbreakable Arrow,50;Veteran\'s Cane,50;Walloping Ammunition,50;Wand of Conduction,50;Wand of Pyrotechnics,50;Wand of Scowls,50;Wand of Smiles,50";
                break;
            case 'uncommon,uncommon':
                list = "Alchemy Jug,6000;Amulet of Proof Against Detection and Location,20000;Bag of Holding,4000;Boots of Elvenkind,2500;Boots of Striding and Springing,5000;Boots of the Winterlands,10000;Bracers of Archery,1500;Brooch of Shielding,7500;Broom of Flying,8000;Cap of Water Breathing,1000;Circlet of Blasting,1500;Cloak of Elvenkind,5000;Cloak of Protection,3500;Cloak of the Manta Ray,6000;Decanter of Endless Water,135000;Deck of Illusions,6120;Driftglobe,750;Dust of Disappearance,300;Dust of Dryness (1 pellet),120;Dust of Sneezing and Choking,480;Elemental Gem,960;Eversmoking Bottle,1000;Eyes of Charming,3000;Eyes of Minute Seeing,2500;Eyes of the Eagle,2500;Gauntlets of Ogre Power,8000;Gem of Brightness,5000;Gloves of Missile Snaring,3000;Gloves of Swimming and Climbing,2000;Gloves of Thievery,5000;Goggles of Night,1500;Hat of Disguise,5000;Headband of Intellect,8000;Helm of Comprehend Languages,500;Helm of Telepathy,12000;Immovable Rod,5000;Instrument of the Bards - Doss Lute,28500;Instrument of the Bards - Fochulan Bandlore,26500;Instrument of the Bards - Mac-Fuirmidh Cittern,27000;Keoghtom\'s Ointment (Per dose),120;Lantern of Revealing,5000;Luckstone,4200;Medallion of Thoughts,3000;Necklace of Adaption,1500;Pearl of Power,6000;Periapt of Health,5000;Periapt of Wound Closure,5000;Pipes of Haunting,6000;Pipes of the Sewers,2000;Quiver of Ehlonna,1000;Ring of Jumping,2500;Ring of Mind Shielding,16000;Ring of Swimming,3000;Ring of Warmth,1000;Ring of Water Walking,1500;Robe of Useful Items,Items * 5;Rope of Climbing,2000;Saddle of the Cavalier,2000;Sending Stones,2000;Silver Raven,5000;Slippers of Spider Climbing,5000;Trident of Fish Command,800;Wind Fan,1500;Winged Boots,8000";
                break;
            case 'rare,rare':
                list = "Amulet of Health,8000;Bead of Force,960;Belt of Dwarvenkind,6000;Boots of Levitation,4000;Boots of Speed,4000;Bowl of Commanding Water Elementals,8000;Bracers of Defense,6000;Brass Horn of Valhalla,8400;Brazier of Commanding Fire Elementals,8000;Bronze Griffon,8000;Cape of the Mountebank,8000;Censer of Controlling Air Elementals,8000;Chime of Opening,1500;Cloak of Displacement,60000;Cloak of the Bat,6000;Cube of Force,16000;Daern\'s Instant Fortress,75000;Dimensional Shackles,3000;Ebony Fly,6000;Folding Boat,10000;Gem of Seeing,32000;Goldean Lion (ea),600;Helm of Teleportation,64000;Heward\'s Handy Haversack,2000;Horn of Blasting,450;Horseshoes of Speed,5000;Instrument of the Bards - Canaith Mandolin,30000;Instrument of the Bards - Cli Lyre,35000;Ioun Stone Awareness,12000;Ioun Stone Protection,1200;Ioun Stone Reserve,6000;Ioun Stone Sustenance,1000;Iron Bands of Bilarro,4000;Ivory Goat (Terror),20000;Ivory Goat (Travail),400;Ivory Goat (Traveling),1000;Mantle of Spell Resistance,30000;Marble Elephant,6000;Necklace of Fireballs (Five beads),3840;Necklace of Fireballs (Four beads),1600;Necklace of Fireballs (One bead),300;Necklace of Fireballs (Six beads),7680;Necklace of Fireballs (Three beads),960;Necklace of Fireballs (Two beads),480;Onyx Dog,3000;Periapt of Proof Against Poison,5000;Portable Hole,8000;Prayer Bead - Bless,2000;Prayer Bead - Curing,4000;Prayer Bead - Favor,32000;Prayer Bead - Smiting,1500;Prayer Bead - Summons,128000;Prayer Bead - Wind Walking,96000;Quaal\'s Feather Token Anchor,50;Quaal\'s Feather Token Bird,3000;Quaal\'s Feather Token Fan,250;Quaal\'s Feather Token Swan Boat,3000;Quaal\'s Feather Token Whip,250;Ring of Animal Influence,4000;Ring of Evasion,5000;Ring of Feather Falling,2000;Ring of Free Action,20000;Ring of Protection,3500;Ring of Resistance,6000;Ring of Spell Storing,24000;Ring of the Ram,5000;Ring of X-Ray Vision,6000;Robe of Eyes,30000;Rope of Entanglement,4000;Serpentine Owl,8000;Silver Horn of Valhalla,5600;Stone of Controlling Earth Elementals,8000;Wings of Flying,5000";
                break;
            case 'very rare,very rare':
                list = "Amulet of the Planes,160000;Bronze Horn of Valhalla,11200;Carpet of Flying,12000;Cloak of Arachnida,5000;Crystal Ball,50000;Horseshoes of the Zephyr,1500;Instrument of the Bards - Anstruth Harp,109000;Ioun Stone Absorption,2400;Ioun Stone Agility,3000;Ioun Stone Fortitude,3000;Ioun Stone Insight,3000;Ioun Stone Intellect,3000;Ioun Stone Leadership,3000;Ioun Stone Strength,3000;Mirror of Life Trapping,18000;Nolzur\'s Marvelous Pigments,200;Obsidian Steed,128000;Ring of Regeneration,12000;Ring of Shooting Stars,14000;Ring of Telekinesis,80000;Robe of Scintillating Colors,6000;Robe of Stars,60000";
                break;
            case 'legendary,legendary':
                list = "Apparatus of Kwalish,10000;Cloak of Invisibility,80000;Cubic Gate,40000;Efreeti Chain,20000;Instrument of the Bards - Ollamh Harp,125000;Ioun Stone Greater Absorption,31000;Ioun Stone Mastery,15000;Ioun Stone Regeneration,4000;Iron Horn of Valhalla,14000;Ring of Air Elemental Command,35000;Ring of Earth Elemental Command,31000;Ring of Fire Elemental Command,17000;Ring of Invisibility,10000;Ring of Spell Turning,30000;Ring of Water Elemental Command,25000;Robe of the Archmagi,34000;Scarab of Protection,36000;Sovereign Glue,400;Sphere of Annihilation,15000;Talisman of Pure Good,71680;Talisman of the Sphere,20000;Talisman of Ultimate Evil,61440;Universal Solvent,300";
                break;
            case 'common,uncommon':
                rand = randomInteger(100);
                if (rand<=70) {
                    list = "Armor of Gleaming,50;Bead of Nourishment,50;Bead of Refreshment,50;Boots of False Tracks,50;Candle of the Deep,50;Cast-off Armour,50;Charlatan\'s Die,50;Cloak of Billowing,50;Cloak of Many Fashions,50;Clockwork Amulet,50;Clothes of Mending,50;Dark Shard Amulet,50;Dread Helm,50;Ear Horn of Hearing,50;Enduring Spellbook,50;Ersatz Eye,50;Hat of Vermin,50;Hat of Wizardry,50;Heward\'s Handy Spice,50;Horn of Silent Alarm,50;Instrument of Illusions,50;Instrument of Scribing,50;Lock of Trickery,50;Moon-touched Sword,50;Mystery Key,50;Orb of Direction,50;Orb of Time,50;Perfume of Bewiching,50;Pipe of Smoke Monsters,50;Pole of Angling,50;Pole of Collapsing,50;Pot of Awakening,50;Rope of Mending,50;Ruby of the Wary Mage,50;Staff of Adornment,50;Staff of Birdcalls,50;Staff of Flowers,50;Talking Doll,50;Tankard of Sobriety,50;Unbreakable Arrow,50;Veteran\'s Cane,50;Walloping Ammunition,50;Wand of Conduction,50;Wand of Pyrotechnics,50;Wand of Scowls,50;Wand of Smiles,50";
                } else if (rand>70) {
                    list = "Alchemy Jug,6000;Amulet of Proof Against Detection and Location,20000;Bag of Holding,4000;Boots of Elvenkind,2500;Boots of Striding and Springing,5000;Boots of the Winterlands,10000;Bracers of Archery,1500;Brooch of Shielding,7500;Broom of Flying,8000;Cap of Water Breathing,1000;Circlet of Blasting,1500;Cloak of Elvenkind,5000;Cloak of Protection,3500;Cloak of the Manta Ray,6000;Decanter of Endless Water,135000;Deck of Illusions,6120;Driftglobe,750;Dust of Disappearance,300;Dust of Dryness (1 pellet),120;Dust of Sneezing and Choking,480;Elemental Gem,960;Eversmoking Bottle,1000;Eyes of Charming,3000;Eyes of Minute Seeing,2500;Eyes of the Eagle,2500;Gauntlets of Ogre Power,8000;Gem of Brightness,5000;Gloves of Missile Snaring,3000;Gloves of Swimming and Climbing,2000;Gloves of Thievery,5000;Goggles of Night,1500;Hat of Disguise,5000;Headband of Intellect,8000;Helm of Comprehend Languages,500;Helm of Telepathy,12000;Immovable Rod,5000;Instrument of the Bards - Doss Lute,28500;Instrument of the Bards - Fochulan Bandlore,26500;Instrument of the Bards - Mac-Fuirmidh Cittern,27000;Keoghtom\'s Ointment (Per dose),120;Lantern of Revealing,5000;Luckstone,4200;Medallion of Thoughts,3000;Necklace of Adaption,1500;Pearl of Power,6000;Periapt of Health,5000;Periapt of Wound Closure,5000;Pipes of Haunting,6000;Pipes of the Sewers,2000;Quiver of Ehlonna,1000;Ring of Jumping,2500;Ring of Mind Shielding,16000;Ring of Swimming,3000;Ring of Warmth,1000;Ring of Water Walking,1500;Robe of Useful Items,Items * 5;Rope of Climbing,2000;Saddle of the Cavalier,2000;Sending Stones,2000;Silver Raven,5000;Slippers of Spider Climbing,5000;Trident of Fish Command,800;Wind Fan,1500;Winged Boots,8000";
                }
                break;
            case 'common,rare':
                rand = randomInteger(100);
                if (rand<=55) {
                    list = "Armor of Gleaming,50;Bead of Nourishment,50;Bead of Refreshment,50;Boots of False Tracks,50;Candle of the Deep,50;Cast-off Armour,50;Charlatan\'s Die,50;Cloak of Billowing,50;Cloak of Many Fashions,50;Clockwork Amulet,50;Clothes of Mending,50;Dark Shard Amulet,50;Dread Helm,50;Ear Horn of Hearing,50;Enduring Spellbook,50;Ersatz Eye,50;Hat of Vermin,50;Hat of Wizardry,50;Heward\'s Handy Spice,50;Horn of Silent Alarm,50;Instrument of Illusions,50;Instrument of Scribing,50;Lock of Trickery,50;Moon-touched Sword,50;Mystery Key,50;Orb of Direction,50;Orb of Time,50;Perfume of Bewiching,50;Pipe of Smoke Monsters,50;Pole of Angling,50;Pole of Collapsing,50;Pot of Awakening,50;Rope of Mending,50;Ruby of the Wary Mage,50;Staff of Adornment,50;Staff of Birdcalls,50;Staff of Flowers,50;Talking Doll,50;Tankard of Sobriety,50;Unbreakable Arrow,50;Veteran\'s Cane,50;Walloping Ammunition,50;Wand of Conduction,50;Wand of Pyrotechnics,50;Wand of Scowls,50;Wand of Smiles,50";
                } else if (rand<=85) {
                    list = "Alchemy Jug,6000;Amulet of Proof Against Detection and Location,20000;Bag of Holding,4000;Boots of Elvenkind,2500;Boots of Striding and Springing,5000;Boots of the Winterlands,10000;Bracers of Archery,1500;Brooch of Shielding,7500;Broom of Flying,8000;Cap of Water Breathing,1000;Circlet of Blasting,1500;Cloak of Elvenkind,5000;Cloak of Protection,3500;Cloak of the Manta Ray,6000;Decanter of Endless Water,135000;Deck of Illusions,6120;Driftglobe,750;Dust of Disappearance,300;Dust of Dryness (1 pellet),120;Dust of Sneezing and Choking,480;Elemental Gem,960;Eversmoking Bottle,1000;Eyes of Charming,3000;Eyes of Minute Seeing,2500;Eyes of the Eagle,2500;Gauntlets of Ogre Power,8000;Gem of Brightness,5000;Gloves of Missile Snaring,3000;Gloves of Swimming and Climbing,2000;Gloves of Thievery,5000;Goggles of Night,1500;Hat of Disguise,5000;Headband of Intellect,8000;Helm of Comprehend Languages,500;Helm of Telepathy,12000;Immovable Rod,5000;Instrument of the Bards - Doss Lute,28500;Instrument of the Bards - Fochulan Bandlore,26500;Instrument of the Bards - Mac-Fuirmidh Cittern,27000;Keoghtom\'s Ointment (Per dose),120;Lantern of Revealing,5000;Luckstone,4200;Medallion of Thoughts,3000;Necklace of Adaption,1500;Pearl of Power,6000;Periapt of Health,5000;Periapt of Wound Closure,5000;Pipes of Haunting,6000;Pipes of the Sewers,2000;Quiver of Ehlonna,1000;Ring of Jumping,2500;Ring of Mind Shielding,16000;Ring of Swimming,3000;Ring of Warmth,1000;Ring of Water Walking,1500;Robe of Useful Items,Items * 5;Rope of Climbing,2000;Saddle of the Cavalier,2000;Sending Stones,2000;Silver Raven,5000;Slippers of Spider Climbing,5000;Trident of Fish Command,800;Wind Fan,1500;Winged Boots,8000";
                } else if (rand>85) {
                    list = "Amulet of Health,8000;Bead of Force,960;Belt of Dwarvenkind,6000;Boots of Levitation,4000;Boots of Speed,4000;Bowl of Commanding Water Elementals,8000;Bracers of Defense,6000;Brass Horn of Valhalla,8400;Brazier of Commanding Fire Elementals,8000;Bronze Griffon,8000;Cape of the Mountebank,8000;Censer of Controlling Air Elementals,8000;Chime of Opening,1500;Cloak of Displacement,60000;Cloak of the Bat,6000;Cube of Force,16000;Daern\'s Instant Fortress,75000;Dimensional Shackles,3000;Ebony Fly,6000;Folding Boat,10000;Gem of Seeing,32000;Goldean Lion (ea),600;Helm of Teleportation,64000;Heward\'s Handy Haversack,2000;Horn of Blasting,450;Horseshoes of Speed,5000;Instrument of the Bards - Canaith Mandolin,30000;Instrument of the Bards - Cli Lyre,35000;Ioun Stone Awareness,12000;Ioun Stone Protection,1200;Ioun Stone Reserve,6000;Ioun Stone Sustenance,1000;Iron Bands of Bilarro,4000;Ivory Goat (Terror),20000;Ivory Goat (Travail),400;Ivory Goat (Traveling),1000;Mantle of Spell Resistance,30000;Marble Elephant,6000;Necklace of Fireballs (Five beads),3840;Necklace of Fireballs (Four beads),1600;Necklace of Fireballs (One bead),300;Necklace of Fireballs (Six beads),7680;Necklace of Fireballs (Three beads),960;Necklace of Fireballs (Two beads),480;Onyx Dog,3000;Periapt of Proof Against Poison,5000;Portable Hole,8000;Prayer Bead - Bless,2000;Prayer Bead - Curing,4000;Prayer Bead - Favor,32000;Prayer Bead - Smiting,1500;Prayer Bead - Summons,128000;Prayer Bead - Wind Walking,96000;Quaal\'s Feather Token Anchor,50;Quaal\'s Feather Token Bird,3000;Quaal\'s Feather Token Fan,250;Quaal\'s Feather Token Swan Boat,3000;Quaal\'s Feather Token Whip,250;Ring of Animal Influence,4000;Ring of Evasion,5000;Ring of Feather Falling,2000;Ring of Free Action,20000;Ring of Protection,3500;Ring of Resistance,6000;Ring of Spell Storing,24000;Ring of the Ram,5000;Ring of X-Ray Vision,6000;Robe of Eyes,30000;Rope of Entanglement,4000;Serpentine Owl,8000;Silver Horn of Valhalla,5600;Stone of Controlling Earth Elementals,8000;Wings of Flying,5000";
                }
                break;
            case 'common,very rare':
                rand = randomInteger(100);
                if (rand<=51) {
                    list = "Armor of Gleaming,50;Bead of Nourishment,50;Bead of Refreshment,50;Boots of False Tracks,50;Candle of the Deep,50;Cast-off Armour,50;Charlatan\'s Die,50;Cloak of Billowing,50;Cloak of Many Fashions,50;Clockwork Amulet,50;Clothes of Mending,50;Dark Shard Amulet,50;Dread Helm,50;Ear Horn of Hearing,50;Enduring Spellbook,50;Ersatz Eye,50;Hat of Vermin,50;Hat of Wizardry,50;Heward\'s Handy Spice,50;Horn of Silent Alarm,50;Instrument of Illusions,50;Instrument of Scribing,50;Lock of Trickery,50;Moon-touched Sword,50;Mystery Key,50;Orb of Direction,50;Orb of Time,50;Perfume of Bewiching,50;Pipe of Smoke Monsters,50;Pole of Angling,50;Pole of Collapsing,50;Pot of Awakening,50;Rope of Mending,50;Ruby of the Wary Mage,50;Staff of Adornment,50;Staff of Birdcalls,50;Staff of Flowers,50;Talking Doll,50;Tankard of Sobriety,50;Unbreakable Arrow,50;Veteran\'s Cane,50;Walloping Ammunition,50;Wand of Conduction,50;Wand of Pyrotechnics,50;Wand of Scowls,50;Wand of Smiles,50";
                } else if (rand<=81) {
                    list = "Alchemy Jug,6000;Amulet of Proof Against Detection and Location,20000;Bag of Holding,4000;Boots of Elvenkind,2500;Boots of Striding and Springing,5000;Boots of the Winterlands,10000;Bracers of Archery,1500;Brooch of Shielding,7500;Broom of Flying,8000;Cap of Water Breathing,1000;Circlet of Blasting,1500;Cloak of Elvenkind,5000;Cloak of Protection,3500;Cloak of the Manta Ray,6000;Decanter of Endless Water,135000;Deck of Illusions,6120;Driftglobe,750;Dust of Disappearance,300;Dust of Dryness (1 pellet),120;Dust of Sneezing and Choking,480;Elemental Gem,960;Eversmoking Bottle,1000;Eyes of Charming,3000;Eyes of Minute Seeing,2500;Eyes of the Eagle,2500;Gauntlets of Ogre Power,8000;Gem of Brightness,5000;Gloves of Missile Snaring,3000;Gloves of Swimming and Climbing,2000;Gloves of Thievery,5000;Goggles of Night,1500;Hat of Disguise,5000;Headband of Intellect,8000;Helm of Comprehend Languages,500;Helm of Telepathy,12000;Immovable Rod,5000;Instrument of the Bards - Doss Lute,28500;Instrument of the Bards - Fochulan Bandlore,26500;Instrument of the Bards - Mac-Fuirmidh Cittern,27000;Keoghtom\'s Ointment (Per dose),120;Lantern of Revealing,5000;Luckstone,4200;Medallion of Thoughts,3000;Necklace of Adaption,1500;Pearl of Power,6000;Periapt of Health,5000;Periapt of Wound Closure,5000;Pipes of Haunting,6000;Pipes of the Sewers,2000;Quiver of Ehlonna,1000;Ring of Jumping,2500;Ring of Mind Shielding,16000;Ring of Swimming,3000;Ring of Warmth,1000;Ring of Water Walking,1500;Robe of Useful Items,Items * 5;Rope of Climbing,2000;Saddle of the Cavalier,2000;Sending Stones,2000;Silver Raven,5000;Slippers of Spider Climbing,5000;Trident of Fish Command,800;Wind Fan,1500;Winged Boots,8000";
                } else if (rand<=96) {
                    list = "Amulet of Health,8000;Bead of Force,960;Belt of Dwarvenkind,6000;Boots of Levitation,4000;Boots of Speed,4000;Bowl of Commanding Water Elementals,8000;Bracers of Defense,6000;Brass Horn of Valhalla,8400;Brazier of Commanding Fire Elementals,8000;Bronze Griffon,8000;Cape of the Mountebank,8000;Censer of Controlling Air Elementals,8000;Chime of Opening,1500;Cloak of Displacement,60000;Cloak of the Bat,6000;Cube of Force,16000;Daern\'s Instant Fortress,75000;Dimensional Shackles,3000;Ebony Fly,6000;Folding Boat,10000;Gem of Seeing,32000;Goldean Lion (ea),600;Helm of Teleportation,64000;Heward\'s Handy Haversack,2000;Horn of Blasting,450;Horseshoes of Speed,5000;Instrument of the Bards - Canaith Mandolin,30000;Instrument of the Bards - Cli Lyre,35000;Ioun Stone Awareness,12000;Ioun Stone Protection,1200;Ioun Stone Reserve,6000;Ioun Stone Sustenance,1000;Iron Bands of Bilarro,4000;Ivory Goat (Terror),20000;Ivory Goat (Travail),400;Ivory Goat (Traveling),1000;Mantle of Spell Resistance,30000;Marble Elephant,6000;Necklace of Fireballs (Five beads),3840;Necklace of Fireballs (Four beads),1600;Necklace of Fireballs (One bead),300;Necklace of Fireballs (Six beads),7680;Necklace of Fireballs (Three beads),960;Necklace of Fireballs (Two beads),480;Onyx Dog,3000;Periapt of Proof Against Poison,5000;Portable Hole,8000;Prayer Bead - Bless,2000;Prayer Bead - Curing,4000;Prayer Bead - Favor,32000;Prayer Bead - Smiting,1500;Prayer Bead - Summons,128000;Prayer Bead - Wind Walking,96000;Quaal\'s Feather Token Anchor,50;Quaal\'s Feather Token Bird,3000;Quaal\'s Feather Token Fan,250;Quaal\'s Feather Token Swan Boat,3000;Quaal\'s Feather Token Whip,250;Ring of Animal Influence,4000;Ring of Evasion,5000;Ring of Feather Falling,2000;Ring of Free Action,20000;Ring of Protection,3500;Ring of Resistance,6000;Ring of Spell Storing,24000;Ring of the Ram,5000;Ring of X-Ray Vision,6000;Robe of Eyes,30000;Rope of Entanglement,4000;Serpentine Owl,8000;Silver Horn of Valhalla,5600;Stone of Controlling Earth Elementals,8000;Wings of Flying,5000";
                } else if (rand>96) {
                    list = "Amulet of the Planes,160000;Bronze Horn of Valhalla,11200;Carpet of Flying,12000;Cloak of Arachnida,5000;Crystal Ball,50000;Horseshoes of the Zephyr,1500;Instrument of the Bards - Anstruth Harp,109000;Ioun Stone Absorption,2400;Ioun Stone Agility,3000;Ioun Stone Fortitude,3000;Ioun Stone Insight,3000;Ioun Stone Intellect,3000;Ioun Stone Leadership,3000;Ioun Stone Strength,3000;Mirror of Life Trapping,18000;Nolzur\'s Marvelous Pigments,200;Obsidian Steed,128000;Ring of Regeneration,12000;Ring of Shooting Stars,14000;Ring of Telekinesis,80000;Robe of Scintillating Colors,6000;Robe of Stars,60000";
                }
                break;
            case 'common,legendary':
                rand=randomInteger(100);
                if (rand<=50) {
                    list = "Armor of Gleaming,50;Bead of Nourishment,50;Bead of Refreshment,50;Boots of False Tracks,50;Candle of the Deep,50;Cast-off Armour,50;Charlatan\'s Die,50;Cloak of Billowing,50;Cloak of Many Fashions,50;Clockwork Amulet,50;Clothes of Mending,50;Dark Shard Amulet,50;Dread Helm,50;Ear Horn of Hearing,50;Enduring Spellbook,50;Ersatz Eye,50;Hat of Vermin,50;Hat of Wizardry,50;Heward\'s Handy Spice,50;Horn of Silent Alarm,50;Instrument of Illusions,50;Instrument of Scribing,50;Lock of Trickery,50;Moon-touched Sword,50;Mystery Key,50;Orb of Direction,50;Orb of Time,50;Perfume of Bewiching,50;Pipe of Smoke Monsters,50;Pole of Angling,50;Pole of Collapsing,50;Pot of Awakening,50;Rope of Mending,50;Ruby of the Wary Mage,50;Staff of Adornment,50;Staff of Birdcalls,50;Staff of Flowers,50;Talking Doll,50;Tankard of Sobriety,50;Unbreakable Arrow,50;Veteran\'s Cane,50;Walloping Ammunition,50;Wand of Conduction,50;Wand of Pyrotechnics,50;Wand of Scowls,50;Wand of Smiles,50";
                } else if (rand<=80) {
                    list = "Alchemy Jug,6000;Amulet of Proof Against Detection and Location,20000;Bag of Holding,4000;Boots of Elvenkind,2500;Boots of Striding and Springing,5000;Boots of the Winterlands,10000;Bracers of Archery,1500;Brooch of Shielding,7500;Broom of Flying,8000;Cap of Water Breathing,1000;Circlet of Blasting,1500;Cloak of Elvenkind,5000;Cloak of Protection,3500;Cloak of the Manta Ray,6000;Decanter of Endless Water,135000;Deck of Illusions,6120;Driftglobe,750;Dust of Disappearance,300;Dust of Dryness (1 pellet),120;Dust of Sneezing and Choking,480;Elemental Gem,960;Eversmoking Bottle,1000;Eyes of Charming,3000;Eyes of Minute Seeing,2500;Eyes of the Eagle,2500;Gauntlets of Ogre Power,8000;Gem of Brightness,5000;Gloves of Missile Snaring,3000;Gloves of Swimming and Climbing,2000;Gloves of Thievery,5000;Goggles of Night,1500;Hat of Disguise,5000;Headband of Intellect,8000;Helm of Comprehend Languages,500;Helm of Telepathy,12000;Immovable Rod,5000;Instrument of the Bards - Doss Lute,28500;Instrument of the Bards - Fochulan Bandlore,26500;Instrument of the Bards - Mac-Fuirmidh Cittern,27000;Keoghtom\'s Ointment (Per dose),120;Lantern of Revealing,5000;Luckstone,4200;Medallion of Thoughts,3000;Necklace of Adaption,1500;Pearl of Power,6000;Periapt of Health,5000;Periapt of Wound Closure,5000;Pipes of Haunting,6000;Pipes of the Sewers,2000;Quiver of Ehlonna,1000;Ring of Jumping,2500;Ring of Mind Shielding,16000;Ring of Swimming,3000;Ring of Warmth,1000;Ring of Water Walking,1500;Robe of Useful Items,Items * 5;Rope of Climbing,2000;Saddle of the Cavalier,2000;Sending Stones,2000;Silver Raven,5000;Slippers of Spider Climbing,5000;Trident of Fish Command,800;Wind Fan,1500;Winged Boots,8000";
                } else if (rand<=95) {
                    list = "Amulet of Health,8000;Bead of Force,960;Belt of Dwarvenkind,6000;Boots of Levitation,4000;Boots of Speed,4000;Bowl of Commanding Water Elementals,8000;Bracers of Defense,6000;Brass Horn of Valhalla,8400;Brazier of Commanding Fire Elementals,8000;Bronze Griffon,8000;Cape of the Mountebank,8000;Censer of Controlling Air Elementals,8000;Chime of Opening,1500;Cloak of Displacement,60000;Cloak of the Bat,6000;Cube of Force,16000;Daern\'s Instant Fortress,75000;Dimensional Shackles,3000;Ebony Fly,6000;Folding Boat,10000;Gem of Seeing,32000;Goldean Lion (ea),600;Helm of Teleportation,64000;Heward\'s Handy Haversack,2000;Horn of Blasting,450;Horseshoes of Speed,5000;Instrument of the Bards - Canaith Mandolin,30000;Instrument of the Bards - Cli Lyre,35000;Ioun Stone Awareness,12000;Ioun Stone Protection,1200;Ioun Stone Reserve,6000;Ioun Stone Sustenance,1000;Iron Bands of Bilarro,4000;Ivory Goat (Terror),20000;Ivory Goat (Travail),400;Ivory Goat (Traveling),1000;Mantle of Spell Resistance,30000;Marble Elephant,6000;Necklace of Fireballs (Five beads),3840;Necklace of Fireballs (Four beads),1600;Necklace of Fireballs (One bead),300;Necklace of Fireballs (Six beads),7680;Necklace of Fireballs (Three beads),960;Necklace of Fireballs (Two beads),480;Onyx Dog,3000;Periapt of Proof Against Poison,5000;Portable Hole,8000;Prayer Bead - Bless,2000;Prayer Bead - Curing,4000;Prayer Bead - Favor,32000;Prayer Bead - Smiting,1500;Prayer Bead - Summons,128000;Prayer Bead - Wind Walking,96000;Quaal\'s Feather Token Anchor,50;Quaal\'s Feather Token Bird,3000;Quaal\'s Feather Token Fan,250;Quaal\'s Feather Token Swan Boat,3000;Quaal\'s Feather Token Whip,250;Ring of Animal Influence,4000;Ring of Evasion,5000;Ring of Feather Falling,2000;Ring of Free Action,20000;Ring of Protection,3500;Ring of Resistance,6000;Ring of Spell Storing,24000;Ring of the Ram,5000;Ring of X-Ray Vision,6000;Robe of Eyes,30000;Rope of Entanglement,4000;Serpentine Owl,8000;Silver Horn of Valhalla,5600;Stone of Controlling Earth Elementals,8000;Wings of Flying,5000";
                } else if (rand<=99) {
                    list = "Amulet of the Planes,160000;Bronze Horn of Valhalla,11200;Carpet of Flying,12000;Cloak of Arachnida,5000;Crystal Ball,50000;Horseshoes of the Zephyr,1500;Instrument of the Bards - Anstruth Harp,109000;Ioun Stone Absorption,2400;Ioun Stone Agility,3000;Ioun Stone Fortitude,3000;Ioun Stone Insight,3000;Ioun Stone Intellect,3000;Ioun Stone Leadership,3000;Ioun Stone Strength,3000;Mirror of Life Trapping,18000;Nolzur\'s Marvelous Pigments,200;Obsidian Steed,128000;Ring of Regeneration,12000;Ring of Shooting Stars,14000;Ring of Telekinesis,80000;Robe of Scintillating Colors,6000;Robe of Stars,60000";
                } else if (rand>99) {
                    list = "Apparatus of Kwalish,10000;Cloak of Invisibility,80000;Cubic Gate,40000;Efreeti Chain,20000;Instrument of the Bards - Ollamh Harp,125000;Ioun Stone Greater Absorption,31000;Ioun Stone Mastery,15000;Ioun Stone Regeneration,4000;Iron Horn of Valhalla,14000;Ring of Air Elemental Command,35000;Ring of Earth Elemental Command,31000;Ring of Fire Elemental Command,17000;Ring of Invisibility,10000;Ring of Spell Turning,30000;Ring of Water Elemental Command,25000;Robe of the Archmagi,34000;Scarab of Protection,36000;Sovereign Glue,400;Sphere of Annihilation,15000;Talisman of Pure Good,71680;Talisman of the Sphere,20000;Talisman of Ultimate Evil,61440;Universal Solvent,300";
                }
                break;
            case 'uncommon,rare':
                rand = randomInteger(100);
                if (rand<=85) {
                    list = "Alchemy Jug,6000;Amulet of Proof Against Detection and Location,20000;Bag of Holding,4000;Boots of Elvenkind,2500;Boots of Striding and Springing,5000;Boots of the Winterlands,10000;Bracers of Archery,1500;Brooch of Shielding,7500;Broom of Flying,8000;Cap of Water Breathing,1000;Circlet of Blasting,1500;Cloak of Elvenkind,5000;Cloak of Protection,3500;Cloak of the Manta Ray,6000;Decanter of Endless Water,135000;Deck of Illusions,6120;Driftglobe,750;Dust of Disappearance,300;Dust of Dryness (1 pellet),120;Dust of Sneezing and Choking,480;Elemental Gem,960;Eversmoking Bottle,1000;Eyes of Charming,3000;Eyes of Minute Seeing,2500;Eyes of the Eagle,2500;Gauntlets of Ogre Power,8000;Gem of Brightness,5000;Gloves of Missile Snaring,3000;Gloves of Swimming and Climbing,2000;Gloves of Thievery,5000;Goggles of Night,1500;Hat of Disguise,5000;Headband of Intellect,8000;Helm of Comprehend Languages,500;Helm of Telepathy,12000;Immovable Rod,5000;Instrument of the Bards - Doss Lute,28500;Instrument of the Bards - Fochulan Bandlore,26500;Instrument of the Bards - Mac-Fuirmidh Cittern,27000;Keoghtom\'s Ointment (Per dose),120;Lantern of Revealing,5000;Luckstone,4200;Medallion of Thoughts,3000;Necklace of Adaption,1500;Pearl of Power,6000;Periapt of Health,5000;Periapt of Wound Closure,5000;Pipes of Haunting,6000;Pipes of the Sewers,2000;Quiver of Ehlonna,1000;Ring of Jumping,2500;Ring of Mind Shielding,16000;Ring of Swimming,3000;Ring of Warmth,1000;Ring of Water Walking,1500;Robe of Useful Items,Items * 5;Rope of Climbing,2000;Saddle of the Cavalier,2000;Sending Stones,2000;Silver Raven,5000;Slippers of Spider Climbing,5000;Trident of Fish Command,800;Wind Fan,1500;Winged Boots,8000";
                } else if (rand>85) {
                    list = "Amulet of Health,8000;Bead of Force,960;Belt of Dwarvenkind,6000;Boots of Levitation,4000;Boots of Speed,4000;Bowl of Commanding Water Elementals,8000;Bracers of Defense,6000;Brass Horn of Valhalla,8400;Brazier of Commanding Fire Elementals,8000;Bronze Griffon,8000;Cape of the Mountebank,8000;Censer of Controlling Air Elementals,8000;Chime of Opening,1500;Cloak of Displacement,60000;Cloak of the Bat,6000;Cube of Force,16000;Daern\'s Instant Fortress,75000;Dimensional Shackles,3000;Ebony Fly,6000;Folding Boat,10000;Gem of Seeing,32000;Goldean Lion (ea),600;Helm of Teleportation,64000;Heward\'s Handy Haversack,2000;Horn of Blasting,450;Horseshoes of Speed,5000;Instrument of the Bards - Canaith Mandolin,30000;Instrument of the Bards - Cli Lyre,35000;Ioun Stone Awareness,12000;Ioun Stone Protection,1200;Ioun Stone Reserve,6000;Ioun Stone Sustenance,1000;Iron Bands of Bilarro,4000;Ivory Goat (Terror),20000;Ivory Goat (Travail),400;Ivory Goat (Traveling),1000;Mantle of Spell Resistance,30000;Marble Elephant,6000;Necklace of Fireballs (Five beads),3840;Necklace of Fireballs (Four beads),1600;Necklace of Fireballs (One bead),300;Necklace of Fireballs (Six beads),7680;Necklace of Fireballs (Three beads),960;Necklace of Fireballs (Two beads),480;Onyx Dog,3000;Periapt of Proof Against Poison,5000;Portable Hole,8000;Prayer Bead - Bless,2000;Prayer Bead - Curing,4000;Prayer Bead - Favor,32000;Prayer Bead - Smiting,1500;Prayer Bead - Summons,128000;Prayer Bead - Wind Walking,96000;Quaal\'s Feather Token Anchor,50;Quaal\'s Feather Token Bird,3000;Quaal\'s Feather Token Fan,250;Quaal\'s Feather Token Swan Boat,3000;Quaal\'s Feather Token Whip,250;Ring of Animal Influence,4000;Ring of Evasion,5000;Ring of Feather Falling,2000;Ring of Free Action,20000;Ring of Protection,3500;Ring of Resistance,6000;Ring of Spell Storing,24000;Ring of the Ram,5000;Ring of X-Ray Vision,6000;Robe of Eyes,30000;Rope of Entanglement,4000;Serpentine Owl,8000;Silver Horn of Valhalla,5600;Stone of Controlling Earth Elementals,8000;Wings of Flying,5000";
                }
                break;
            case 'uncommon,very rare':
                rand = randomInteger(100);
                if (rand<=81) {
                    list = "Alchemy Jug,6000;Amulet of Proof Against Detection and Location,20000;Bag of Holding,4000;Boots of Elvenkind,2500;Boots of Striding and Springing,5000;Boots of the Winterlands,10000;Bracers of Archery,1500;Brooch of Shielding,7500;Broom of Flying,8000;Cap of Water Breathing,1000;Circlet of Blasting,1500;Cloak of Elvenkind,5000;Cloak of Protection,3500;Cloak of the Manta Ray,6000;Decanter of Endless Water,135000;Deck of Illusions,6120;Driftglobe,750;Dust of Disappearance,300;Dust of Dryness (1 pellet),120;Dust of Sneezing and Choking,480;Elemental Gem,960;Eversmoking Bottle,1000;Eyes of Charming,3000;Eyes of Minute Seeing,2500;Eyes of the Eagle,2500;Gauntlets of Ogre Power,8000;Gem of Brightness,5000;Gloves of Missile Snaring,3000;Gloves of Swimming and Climbing,2000;Gloves of Thievery,5000;Goggles of Night,1500;Hat of Disguise,5000;Headband of Intellect,8000;Helm of Comprehend Languages,500;Helm of Telepathy,12000;Immovable Rod,5000;Instrument of the Bards - Doss Lute,28500;Instrument of the Bards - Fochulan Bandlore,26500;Instrument of the Bards - Mac-Fuirmidh Cittern,27000;Keoghtom\'s Ointment (Per dose),120;Lantern of Revealing,5000;Luckstone,4200;Medallion of Thoughts,3000;Necklace of Adaption,1500;Pearl of Power,6000;Periapt of Health,5000;Periapt of Wound Closure,5000;Pipes of Haunting,6000;Pipes of the Sewers,2000;Quiver of Ehlonna,1000;Ring of Jumping,2500;Ring of Mind Shielding,16000;Ring of Swimming,3000;Ring of Warmth,1000;Ring of Water Walking,1500;Robe of Useful Items,Items * 5;Rope of Climbing,2000;Saddle of the Cavalier,2000;Sending Stones,2000;Silver Raven,5000;Slippers of Spider Climbing,5000;Trident of Fish Command,800;Wind Fan,1500;Winged Boots,8000";
                } else if (rand<=96) {
                    list = "Amulet of Health,8000;Bead of Force,960;Belt of Dwarvenkind,6000;Boots of Levitation,4000;Boots of Speed,4000;Bowl of Commanding Water Elementals,8000;Bracers of Defense,6000;Brass Horn of Valhalla,8400;Brazier of Commanding Fire Elementals,8000;Bronze Griffon,8000;Cape of the Mountebank,8000;Censer of Controlling Air Elementals,8000;Chime of Opening,1500;Cloak of Displacement,60000;Cloak of the Bat,6000;Cube of Force,16000;Daern\'s Instant Fortress,75000;Dimensional Shackles,3000;Ebony Fly,6000;Folding Boat,10000;Gem of Seeing,32000;Goldean Lion (ea),600;Helm of Teleportation,64000;Heward\'s Handy Haversack,2000;Horn of Blasting,450;Horseshoes of Speed,5000;Instrument of the Bards - Canaith Mandolin,30000;Instrument of the Bards - Cli Lyre,35000;Ioun Stone Awareness,12000;Ioun Stone Protection,1200;Ioun Stone Reserve,6000;Ioun Stone Sustenance,1000;Iron Bands of Bilarro,4000;Ivory Goat (Terror),20000;Ivory Goat (Travail),400;Ivory Goat (Traveling),1000;Mantle of Spell Resistance,30000;Marble Elephant,6000;Necklace of Fireballs (Five beads),3840;Necklace of Fireballs (Four beads),1600;Necklace of Fireballs (One bead),300;Necklace of Fireballs (Six beads),7680;Necklace of Fireballs (Three beads),960;Necklace of Fireballs (Two beads),480;Onyx Dog,3000;Periapt of Proof Against Poison,5000;Portable Hole,8000;Prayer Bead - Bless,2000;Prayer Bead - Curing,4000;Prayer Bead - Favor,32000;Prayer Bead - Smiting,1500;Prayer Bead - Summons,128000;Prayer Bead - Wind Walking,96000;Quaal\'s Feather Token Anchor,50;Quaal\'s Feather Token Bird,3000;Quaal\'s Feather Token Fan,250;Quaal\'s Feather Token Swan Boat,3000;Quaal\'s Feather Token Whip,250;Ring of Animal Influence,4000;Ring of Evasion,5000;Ring of Feather Falling,2000;Ring of Free Action,20000;Ring of Protection,3500;Ring of Resistance,6000;Ring of Spell Storing,24000;Ring of the Ram,5000;Ring of X-Ray Vision,6000;Robe of Eyes,30000;Rope of Entanglement,4000;Serpentine Owl,8000;Silver Horn of Valhalla,5600;Stone of Controlling Earth Elementals,8000;Wings of Flying,5000";
                } else if (rand>96) {
                    list = "Amulet of the Planes,160000;Bronze Horn of Valhalla,11200;Carpet of Flying,12000;Cloak of Arachnida,5000;Crystal Ball,50000;Horseshoes of the Zephyr,1500;Instrument of the Bards - Anstruth Harp,109000;Ioun Stone Absorption,2400;Ioun Stone Agility,3000;Ioun Stone Fortitude,3000;Ioun Stone Insight,3000;Ioun Stone Intellect,3000;Ioun Stone Leadership,3000;Ioun Stone Strength,3000;Mirror of Life Trapping,18000;Nolzur\'s Marvelous Pigments,200;Obsidian Steed,128000;Ring of Regeneration,12000;Ring of Shooting Stars,14000;Ring of Telekinesis,80000;Robe of Scintillating Colors,6000;Robe of Stars,60000";
                }
                break;
            case 'uncommon,legendary':
                rand = randomInteger(100);
                if (rand<=80) {
                    list = "Alchemy Jug,6000;Amulet of Proof Against Detection and Location,20000;Bag of Holding,4000;Boots of Elvenkind,2500;Boots of Striding and Springing,5000;Boots of the Winterlands,10000;Bracers of Archery,1500;Brooch of Shielding,7500;Broom of Flying,8000;Cap of Water Breathing,1000;Circlet of Blasting,1500;Cloak of Elvenkind,5000;Cloak of Protection,3500;Cloak of the Manta Ray,6000;Decanter of Endless Water,135000;Deck of Illusions,6120;Driftglobe,750;Dust of Disappearance,300;Dust of Dryness (1 pellet),120;Dust of Sneezing and Choking,480;Elemental Gem,960;Eversmoking Bottle,1000;Eyes of Charming,3000;Eyes of Minute Seeing,2500;Eyes of the Eagle,2500;Gauntlets of Ogre Power,8000;Gem of Brightness,5000;Gloves of Missile Snaring,3000;Gloves of Swimming and Climbing,2000;Gloves of Thievery,5000;Goggles of Night,1500;Hat of Disguise,5000;Headband of Intellect,8000;Helm of Comprehend Languages,500;Helm of Telepathy,12000;Immovable Rod,5000;Instrument of the Bards - Doss Lute,28500;Instrument of the Bards - Fochulan Bandlore,26500;Instrument of the Bards - Mac-Fuirmidh Cittern,27000;Keoghtom\'s Ointment (Per dose),120;Lantern of Revealing,5000;Luckstone,4200;Medallion of Thoughts,3000;Necklace of Adaption,1500;Pearl of Power,6000;Periapt of Health,5000;Periapt of Wound Closure,5000;Pipes of Haunting,6000;Pipes of the Sewers,2000;Quiver of Ehlonna,1000;Ring of Jumping,2500;Ring of Mind Shielding,16000;Ring of Swimming,3000;Ring of Warmth,1000;Ring of Water Walking,1500;Robe of Useful Items,Items * 5;Rope of Climbing,2000;Saddle of the Cavalier,2000;Sending Stones,2000;Silver Raven,5000;Slippers of Spider Climbing,5000;Trident of Fish Command,800;Wind Fan,1500;Winged Boots,8000";
                } else if (rand<=95) {
                    list = "Amulet of Health,8000;Bead of Force,960;Belt of Dwarvenkind,6000;Boots of Levitation,4000;Boots of Speed,4000;Bowl of Commanding Water Elementals,8000;Bracers of Defense,6000;Brass Horn of Valhalla,8400;Brazier of Commanding Fire Elementals,8000;Bronze Griffon,8000;Cape of the Mountebank,8000;Censer of Controlling Air Elementals,8000;Chime of Opening,1500;Cloak of Displacement,60000;Cloak of the Bat,6000;Cube of Force,16000;Daern\'s Instant Fortress,75000;Dimensional Shackles,3000;Ebony Fly,6000;Folding Boat,10000;Gem of Seeing,32000;Goldean Lion (ea),600;Helm of Teleportation,64000;Heward\'s Handy Haversack,2000;Horn of Blasting,450;Horseshoes of Speed,5000;Instrument of the Bards - Canaith Mandolin,30000;Instrument of the Bards - Cli Lyre,35000;Ioun Stone Awareness,12000;Ioun Stone Protection,1200;Ioun Stone Reserve,6000;Ioun Stone Sustenance,1000;Iron Bands of Bilarro,4000;Ivory Goat (Terror),20000;Ivory Goat (Travail),400;Ivory Goat (Traveling),1000;Mantle of Spell Resistance,30000;Marble Elephant,6000;Necklace of Fireballs (Five beads),3840;Necklace of Fireballs (Four beads),1600;Necklace of Fireballs (One bead),300;Necklace of Fireballs (Six beads),7680;Necklace of Fireballs (Three beads),960;Necklace of Fireballs (Two beads),480;Onyx Dog,3000;Periapt of Proof Against Poison,5000;Portable Hole,8000;Prayer Bead - Bless,2000;Prayer Bead - Curing,4000;Prayer Bead - Favor,32000;Prayer Bead - Smiting,1500;Prayer Bead - Summons,128000;Prayer Bead - Wind Walking,96000;Quaal\'s Feather Token Anchor,50;Quaal\'s Feather Token Bird,3000;Quaal\'s Feather Token Fan,250;Quaal\'s Feather Token Swan Boat,3000;Quaal\'s Feather Token Whip,250;Ring of Animal Influence,4000;Ring of Evasion,5000;Ring of Feather Falling,2000;Ring of Free Action,20000;Ring of Protection,3500;Ring of Resistance,6000;Ring of Spell Storing,24000;Ring of the Ram,5000;Ring of X-Ray Vision,6000;Robe of Eyes,30000;Rope of Entanglement,4000;Serpentine Owl,8000;Silver Horn of Valhalla,5600;Stone of Controlling Earth Elementals,8000;Wings of Flying,5000";
                } else if (rand<=99) {
                    list = "Amulet of the Planes,160000;Bronze Horn of Valhalla,11200;Carpet of Flying,12000;Cloak of Arachnida,5000;Crystal Ball,50000;Horseshoes of the Zephyr,1500;Instrument of the Bards - Anstruth Harp,109000;Ioun Stone Absorption,2400;Ioun Stone Agility,3000;Ioun Stone Fortitude,3000;Ioun Stone Insight,3000;Ioun Stone Intellect,3000;Ioun Stone Leadership,3000;Ioun Stone Strength,3000;Mirror of Life Trapping,18000;Nolzur\'s Marvelous Pigments,200;Obsidian Steed,128000;Ring of Regeneration,12000;Ring of Shooting Stars,14000;Ring of Telekinesis,80000;Robe of Scintillating Colors,6000;Robe of Stars,60000";
                } else if (rand>99) {
                    list = "Apparatus of Kwalish,10000;Cloak of Invisibility,80000;Cubic Gate,40000;Efreeti Chain,20000;Instrument of the Bards - Ollamh Harp,125000;Ioun Stone Greater Absorption,31000;Ioun Stone Mastery,15000;Ioun Stone Regeneration,4000;Iron Horn of Valhalla,14000;Ring of Air Elemental Command,35000;Ring of Earth Elemental Command,31000;Ring of Fire Elemental Command,17000;Ring of Invisibility,10000;Ring of Spell Turning,30000;Ring of Water Elemental Command,25000;Robe of the Archmagi,34000;Scarab of Protection,36000;Sovereign Glue,400;Sphere of Annihilation,15000;Talisman of Pure Good,71680;Talisman of the Sphere,20000;Talisman of Ultimate Evil,61440;Universal Solvent,300";
                }
                break;
            case 'rare,very rare':
                rand = randomInteger(100);
                if (rand<=96) {
                    list = "Amulet of Health,8000;Bead of Force,960;Belt of Dwarvenkind,6000;Boots of Levitation,4000;Boots of Speed,4000;Bowl of Commanding Water Elementals,8000;Bracers of Defense,6000;Brass Horn of Valhalla,8400;Brazier of Commanding Fire Elementals,8000;Bronze Griffon,8000;Cape of the Mountebank,8000;Censer of Controlling Air Elementals,8000;Chime of Opening,1500;Cloak of Displacement,60000;Cloak of the Bat,6000;Cube of Force,16000;Daern\'s Instant Fortress,75000;Dimensional Shackles,3000;Ebony Fly,6000;Folding Boat,10000;Gem of Seeing,32000;Goldean Lion (ea),600;Helm of Teleportation,64000;Heward\'s Handy Haversack,2000;Horn of Blasting,450;Horseshoes of Speed,5000;Instrument of the Bards - Canaith Mandolin,30000;Instrument of the Bards - Cli Lyre,35000;Ioun Stone Awareness,12000;Ioun Stone Protection,1200;Ioun Stone Reserve,6000;Ioun Stone Sustenance,1000;Iron Bands of Bilarro,4000;Ivory Goat (Terror),20000;Ivory Goat (Travail),400;Ivory Goat (Traveling),1000;Mantle of Spell Resistance,30000;Marble Elephant,6000;Necklace of Fireballs (Five beads),3840;Necklace of Fireballs (Four beads),1600;Necklace of Fireballs (One bead),300;Necklace of Fireballs (Six beads),7680;Necklace of Fireballs (Three beads),960;Necklace of Fireballs (Two beads),480;Onyx Dog,3000;Periapt of Proof Against Poison,5000;Portable Hole,8000;Prayer Bead - Bless,2000;Prayer Bead - Curing,4000;Prayer Bead - Favor,32000;Prayer Bead - Smiting,1500;Prayer Bead - Summons,128000;Prayer Bead - Wind Walking,96000;Quaal\'s Feather Token Anchor,50;Quaal\'s Feather Token Bird,3000;Quaal\'s Feather Token Fan,250;Quaal\'s Feather Token Swan Boat,3000;Quaal\'s Feather Token Whip,250;Ring of Animal Influence,4000;Ring of Evasion,5000;Ring of Feather Falling,2000;Ring of Free Action,20000;Ring of Protection,3500;Ring of Resistance,6000;Ring of Spell Storing,24000;Ring of the Ram,5000;Ring of X-Ray Vision,6000;Robe of Eyes,30000;Rope of Entanglement,4000;Serpentine Owl,8000;Silver Horn of Valhalla,5600;Stone of Controlling Earth Elementals,8000;Wings of Flying,5000";
                } else if (rand>96) {
                    list = "Amulet of the Planes,160000;Bronze Horn of Valhalla,11200;Carpet of Flying,12000;Cloak of Arachnida,5000;Crystal Ball,50000;Horseshoes of the Zephyr,1500;Instrument of the Bards - Anstruth Harp,109000;Ioun Stone Absorption,2400;Ioun Stone Agility,3000;Ioun Stone Fortitude,3000;Ioun Stone Insight,3000;Ioun Stone Intellect,3000;Ioun Stone Leadership,3000;Ioun Stone Strength,3000;Mirror of Life Trapping,18000;Nolzur\'s Marvelous Pigments,200;Obsidian Steed,128000;Ring of Regeneration,12000;Ring of Shooting Stars,14000;Ring of Telekinesis,80000;Robe of Scintillating Colors,6000;Robe of Stars,60000";
                }
                break;
            case 'rare,legendary':
                rand = randomInteger(100);
                if (rand<=95) {
                    list = "Amulet of Health,8000;Bead of Force,960;Belt of Dwarvenkind,6000;Boots of Levitation,4000;Boots of Speed,4000;Bowl of Commanding Water Elementals,8000;Bracers of Defense,6000;Brass Horn of Valhalla,8400;Brazier of Commanding Fire Elementals,8000;Bronze Griffon,8000;Cape of the Mountebank,8000;Censer of Controlling Air Elementals,8000;Chime of Opening,1500;Cloak of Displacement,60000;Cloak of the Bat,6000;Cube of Force,16000;Daern\'s Instant Fortress,75000;Dimensional Shackles,3000;Ebony Fly,6000;Folding Boat,10000;Gem of Seeing,32000;Goldean Lion (ea),600;Helm of Teleportation,64000;Heward\'s Handy Haversack,2000;Horn of Blasting,450;Horseshoes of Speed,5000;Instrument of the Bards - Canaith Mandolin,30000;Instrument of the Bards - Cli Lyre,35000;Ioun Stone Awareness,12000;Ioun Stone Protection,1200;Ioun Stone Reserve,6000;Ioun Stone Sustenance,1000;Iron Bands of Bilarro,4000;Ivory Goat (Terror),20000;Ivory Goat (Travail),400;Ivory Goat (Traveling),1000;Mantle of Spell Resistance,30000;Marble Elephant,6000;Necklace of Fireballs (Five beads),3840;Necklace of Fireballs (Four beads),1600;Necklace of Fireballs (One bead),300;Necklace of Fireballs (Six beads),7680;Necklace of Fireballs (Three beads),960;Necklace of Fireballs (Two beads),480;Onyx Dog,3000;Periapt of Proof Against Poison,5000;Portable Hole,8000;Prayer Bead - Bless,2000;Prayer Bead - Curing,4000;Prayer Bead - Favor,32000;Prayer Bead - Smiting,1500;Prayer Bead - Summons,128000;Prayer Bead - Wind Walking,96000;Quaal\'s Feather Token Anchor,50;Quaal\'s Feather Token Bird,3000;Quaal\'s Feather Token Fan,250;Quaal\'s Feather Token Swan Boat,3000;Quaal\'s Feather Token Whip,250;Ring of Animal Influence,4000;Ring of Evasion,5000;Ring of Feather Falling,2000;Ring of Free Action,20000;Ring of Protection,3500;Ring of Resistance,6000;Ring of Spell Storing,24000;Ring of the Ram,5000;Ring of X-Ray Vision,6000;Robe of Eyes,30000;Rope of Entanglement,4000;Serpentine Owl,8000;Silver Horn of Valhalla,5600;Stone of Controlling Earth Elementals,8000;Wings of Flying,5000";
                } else if (rand<=99) {
                    list = "Amulet of the Planes,160000;Bronze Horn of Valhalla,11200;Carpet of Flying,12000;Cloak of Arachnida,5000;Crystal Ball,50000;Horseshoes of the Zephyr,1500;Instrument of the Bards - Anstruth Harp,109000;Ioun Stone Absorption,2400;Ioun Stone Agility,3000;Ioun Stone Fortitude,3000;Ioun Stone Insight,3000;Ioun Stone Intellect,3000;Ioun Stone Leadership,3000;Ioun Stone Strength,3000;Mirror of Life Trapping,18000;Nolzur\'s Marvelous Pigments,200;Obsidian Steed,128000;Ring of Regeneration,12000;Ring of Shooting Stars,14000;Ring of Telekinesis,80000;Robe of Scintillating Colors,6000;Robe of Stars,60000";
                } else if (rand>99) {
                    list = "Apparatus of Kwalish,10000;Cloak of Invisibility,80000;Cubic Gate,40000;Efreeti Chain,20000;Instrument of the Bards - Ollamh Harp,125000;Ioun Stone Greater Absorption,31000;Ioun Stone Mastery,15000;Ioun Stone Regeneration,4000;Iron Horn of Valhalla,14000;Ring of Air Elemental Command,35000;Ring of Earth Elemental Command,31000;Ring of Fire Elemental Command,17000;Ring of Invisibility,10000;Ring of Spell Turning,30000;Ring of Water Elemental Command,25000;Robe of the Archmagi,34000;Scarab of Protection,36000;Sovereign Glue,400;Sphere of Annihilation,15000;Talisman of Pure Good,71680;Talisman of the Sphere,20000;Talisman of Ultimate Evil,61440;Universal Solvent,300";
                }
                break;
            case 'very rare,legendary':
                rand = randomInteger(100);
                if (rand<=99) {
                    list = "Amulet of the Planes,160000;Bronze Horn of Valhalla,11200;Carpet of Flying,12000;Cloak of Arachnida,5000;Crystal Ball,50000;Horseshoes of the Zephyr,1500;Instrument of the Bards - Anstruth Harp,109000;Ioun Stone Absorption,2400;Ioun Stone Agility,3000;Ioun Stone Fortitude,3000;Ioun Stone Insight,3000;Ioun Stone Intellect,3000;Ioun Stone Leadership,3000;Ioun Stone Strength,3000;Mirror of Life Trapping,18000;Nolzur\'s Marvelous Pigments,200;Obsidian Steed,128000;Ring of Regeneration,12000;Ring of Shooting Stars,14000;Ring of Telekinesis,80000;Robe of Scintillating Colors,6000;Robe of Stars,60000";
                } else if (rand>99) {
                    list = "Apparatus of Kwalish,10000;Cloak of Invisibility,80000;Cubic Gate,40000;Efreeti Chain,20000;Instrument of the Bards - Ollamh Harp,125000;Ioun Stone Greater Absorption,31000;Ioun Stone Mastery,15000;Ioun Stone Regeneration,4000;Iron Horn of Valhalla,14000;Ring of Air Elemental Command,35000;Ring of Earth Elemental Command,31000;Ring of Fire Elemental Command,17000;Ring of Invisibility,10000;Ring of Spell Turning,30000;Ring of Water Elemental Command,25000;Robe of the Archmagi,34000;Scarab of Protection,36000;Sovereign Glue,400;Sphere of Annihilation,15000;Talisman of Pure Good,71680;Talisman of the Sphere,20000;Talisman of Ultimate Evil,61440;Universal Solvent,300";
                }
                break;
        }
        
        
        
        var itemsList = list.split(";");
        var len = itemsList.length;
        
        var number = randomInteger(len) - 1;
        var item = itemsList[number];
        
        return item;
    },
    
    getMundane = function(rarity) {
        var rand;
        var mundaneList;
        
        switch(rarity) {
            case 'common,common':
                mundaneList = "Candle,0.01;Chalk (1 piece),0.01;Sack,0.01;Torch,0.01;Wheat,0.01;Whetstone,0.01;Blowgun Needle,0.01;Chicken,0.02;Flask,0.02;Flour,0.02;Jug,0.02;Loaf of Bread,0.02;Pitcher,0.02;Soap,0.02;Tankard,0.02;Ale (mug),0.04;Sling Bullets (20),0.04;Arrow,0.05;Bucket,0.05;Caltrop,0.05;Crossbow Bolt,0.05;Dart,0.05;Feed (per day),0.05;Piton,0.05;Pole (10-foot),0.05;Salt,0.05;Signal Whistle,0.05;Canvas (1 sq. yd.),0.1;Club,0.1;Dice Set,0.1;Hunk of Cheese,0.1;Insect Repellent (Block of Incense),0.1;Iron,0.1;Iron Spike,0.1;Ladder (10-foot),0.1;Oil (flask),0.1;Parchment (one sheet),0.1;Sling,0.1;Ale (Gallon),0.2;Common Wine (Pitcher),0.2;Greatclub,0.2;Mess Kit,0.2;Paper (one sheet),0.2;Quarterstaff,0.2;Waterskin,0.2;Chunk of Meat,0.3;Basket,0.4;Blanket,0.5;Common Clothes,0.5;Copper,0.5;Cotton Cloth (1 sq. yd.),0.5;Javelin,0.5;Lamp,0.5;Playing Card Set,0.5;Pouch,0.5;Rations (1 day),0.5;Sealing Wax,0.5;Stabling (per day),0.5;Tinderbox,0.5;Arrows (20),1;Ball Bearings (bag of 1000),1;Bedroll,1;Bell,1;Block and Tackle,1;Blowgun Needles (50),1;Caltrops (bag of 20),1;Cook\'s Utensils,1;Crossbow Bolt Case,1;Crossbow Bolts (20),1;Dragonchess Set,1;Fishing Tackle,1;Ginger,1;Goat,1;Hammer,1;Hempen Rope (50 feet),1;Insect Repellent (greasy salve),1;Iron Spikes (10),1;Map or Scroll Case,1;Net,1;Quiver,1;Rain Catcher,1;Robes,1;Sickle,1;Spear,1;Spring of Mistletoe,1;Three-Dragon Ante Set,1;Totem,1;Vial,1;Weaver\'s Tools,1;Wukka Nut,1;Yahcha,1;Yklwa,1;Backpack,2;Barrel,2;Bit and Bridle,2;Cinnamon,2;Crampons,2;Crowbar,2;Dagger,2;Flute,2;Glass Bottle,2;Grappling Hook,2;Iron Pot,2;Light Hammer,2;Menacles,2;Menga leaves (1 ounce),2;Miner\'s Pick,2;Pepper,2;Abacus,2,Shawm,2;Sheep,2;Shovel,2;Sledgehammer,2;Snowshoes,2;Traveler\'s Clothes,2;Two-Person Tent,2;Whip,2;Cloves,3;Horn,3;Pig,3;Theki Root,3;Portable Ram,4;Saddlebags,4";
                break;
            case 'uncommon,uncommon':
                mundaneList = "Amulet,5;Chain (10 feet),5;Chest,5;Cobbler\'s Tools,5;Costume Clothes,5;Emblem,5;Handaxe,5;Healer\'s Kit,5;Herbalism Kit,5;Hooded Lantern,5;Hunting Trap,5;Leatherworker\'s Tools,5;Linen (1 sq. yd.),5;Mace,5;Merchant\'s Scale,5;Six person Tent,5;Pack Saddle,5;Padded Armor,5;Perfume (vial),5;Pike,5;Reliquary,5;Signet Ring,5;Silver,5;Sinda berries (10),5;Staff,5;Steel Mirror,5;Trident,5;War Pick,5;Wooden Staff,5;Drum,6;Carpenter\'s Tools,8;Donkey,8;Mule,8;Battleaxe,10;Blowgun,10;Bullseye Lantern,10;Calligrapher\'s Supplies,10;Clothing (cold weather),10;Cow,10;Crystal,10;Explorer\'s Pack,10;Fine Wine (Bottle),10;Flail,10;Hide Armor,10;Ink (1-ounce bottle),10;Lance,10;Leather Armor,10;Lock,10;Mason\'s Tools,10;Maul,10;Painter\'s Supplies,10;Potter\'s Tools,10;Riding Saddle,10;Rod,10;Shield,10;Shortsword,10;Silk (1 sq. yd.),10;Silk Rope (50 feet),10;Wand,10;Yew Wand,10;Zabou,10;Dungeoneer\'s Pack,12;Pan Flute,12;Cart,15;Cartographer\'s Tools,15;Fine Clothes,15;Forgery Kit,15;Longsword,15;Morningstar,15;Ox,15;Saffron,15;Warhammer,15;Burglar\'s Pack,16;Priest\'s Pack,19;Brewer\'s Supplies,20;Dogsled,20;Glaive,20;Halberd,20;Military Saddle,20;Orb,20;Sled,20;Smith\'s Tools,20;Acid (vial),25;Book,25;Climber\'s Kit,25;Component Pouch,25;Disguise Kit,25;Dulcimer,25;Holy Water (flask),25;Hourglass,25;Jeweler\'s Tools,25;Light Crossbow,25;Navigator\'s Tools,25;Rapier,25;Scimitar,25;Shortbow,25;Thieves\' Tools,25;Wildroot,25;Yarting,25;Bagpipes,30;Glassblower\'s Tools,30;Greataxe,30;Lyre,30;Ring Mail,30;Pony,30;Viol,30;Willowshade Oil,30;Monster Hunter\'s Pack,33;Lute,35;Wagon,35;Diplomat\'s Pack,39;Entertainer\'s Pack,40;Scholar\'s Pack,40;Studded Leather Armor,45";
                break;
            case 'rare,rare':
                mundaneList = "Alchemist\'s Fire (Flask),50,Alchemist\'s Supplies,50;Antitoxin (vial),50;Axe Beak,50;Camel,50;Canoe,50;Chain Shirt,50;Draft Horse,50;Gold,50;Greatsword,50;Heavy Crossbow,50;Longbow,50;Olisuba Leaf,50;Poisoner\'s Kit,50;Rowboat,50;Ryath Root,50;Scale Mail,50;Sled Dog,50;Spellbook,50;Tinker\'s Tools,50;Exotic Saddle,60;Chain Mail,75;Hand Crossbow,75;Riding Horse,75;Spiked Armor,75;Basic Potion (vial),100;Silvered Weapon,100;Silvered Ammunition (10),100;Carriage,100;Double-Bladed Scimitar,100;Magnifying Glass,100;Muroosa Balm,100;Pride Silk,100;Assassin\'s Blood,Soothsalts,150;Truth Serum,150;Oversized Longbow,150;Oversized Arrow (20),3";
                break;
            case 'very rare,very rare':
                mundaneList = "Blight Ichor,200;Carrion Crawler Mucus,200;Drow Poison,200;Elephant,200;Serpent Venom,200;Splint Armor,200;Chariot,250;Malice,250;Pale Tincture,250;Black Sap,300;Essence of Ether,300;Breastplate,400;Moorbounder,400;Oil of Taggit,400;Warhorse,400;Burnt Othur Fumes,500;Platinum,500;Pride Silk Outfit,500;Vial of Stardust,500;Torpor,600;Half Plate Armor,750";
                break;
            case 'legendary,legendary':
                mundaneList = "Adamantine Bar,1000;Spyglass,1000;Wyvern Poison,1200;Midnight Tears,1500;Plate Armor,1500;Purple Worm Poison,2000;Keelboat,3000;Longship,10000;Airship,20000;Warship,25000;Galley,30000;Skyship,100000"
                break;
            case 'common,uncommon':
                rand = randomInteger(100);
                if (rand<=70) {
                    mundaneList = "Candle,0.01;Chalk (1 piece),0.01;Sack,0.01;Torch,0.01;Wheat,0.01;Whetstone,0.01;Blowgun Needle,0.01;Chicken,0.02;Flask,0.02;Flour,0.02;Jug,0.02;Loaf of Bread,0.02;Pitcher,0.02;Soap,0.02;Tankard,0.02;Ale (mug),0.04;Sling Bullets (20),0.04;Arrow,0.05;Bucket,0.05;Caltrop,0.05;Crossbow Bolt,0.05;Dart,0.05;Feed (per day),0.05;Piton,0.05;Pole (10-foot),0.05;Salt,0.05;Signal Whistle,0.05;Canvas (1 sq. yd.),0.1;Club,0.1;Dice Set,0.1;Hunk of Cheese,0.1;Insect Repellent (Block of Incense),0.1;Iron,0.1;Iron Spike,0.1;Ladder (10-foot),0.1;Oil (flask),0.1;Parchment (one sheet),0.1;Sling,0.1;Ale (Gallon),0.2;Common Wine (Pitcher),0.2;Greatclub,0.2;Mess Kit,0.2;Paper (one sheet),0.2;Quarterstaff,0.2;Waterskin,0.2;Chunk of Meat,0.3;Basket,0.4;Blanket,0.5;Common Clothes,0.5;Copper,0.5;Cotton Cloth (1 sq. yd.),0.5;Javelin,0.5;Lamp,0.5;Playing Card Set,0.5;Pouch,0.5;Rations (1 day),0.5;Sealing Wax,0.5;Stabling (per day),0.5;Tinderbox,0.5;Arrows (20),1;Ball Bearings (bag of 1000),1;Bedroll,1;Bell,1;Block and Tackle,1;Blowgun Needles (50),1;Caltrops (bag of 20),1;Cook\'s Utensils,1;Crossbow Bolt Case,1;Crossbow Bolts (20),1;Dragonchess Set,1;Fishing Tackle,1;Ginger,1;Goat,1;Hammer,1;Hempen Rope (50 feet),1;Insect Repellent (greasy salve),1;Iron Spikes (10),1;Map or Scroll Case,1;Net,1;Quiver,1;Rain Catcher,1;Robes,1;Sickle,1;Spear,1;Spring of Mistletoe,1;Three-Dragon Ante Set,1;Totem,1;Vial,1;Weaver\'s Tools,1;Wukka Nut,1;Yahcha,1;Yklwa,1;Backpack,2;Barrel,2;Bit and Bridle,2;Cinnamon,2;Crampons,2;Crowbar,2;Dagger,2;Flute,2;Glass Bottle,2;Grappling Hook,2;Iron Pot,2;Light Hammer,2;Menacles,2;Menga leaves (1 ounce),2;Miner\'s Pick,2;Pepper,2;Abacus,2,Shawm,2;Sheep,2;Shovel,2;Sledgehammer,2;Snowshoes,2;Traveler\'s Clothes,2;Two-Person Tent,2;Whip,2;Cloves,3;Horn,3;Pig,3;Theki Root,3;Portable Ram,4;Saddlebags,4";
                } else if (rand>70) {
                    mundaneList = "Amulet,5;Chain (10 feet),5;Chest,5;Cobbler\'s Tools,5;Costume Clothes,5;Emblem,5;Handaxe,5;Healer\'s Kit,5;Herbalism Kit,5;Hooded Lantern,5;Hunting Trap,5;Leatherworker\'s Tools,5;Linen (1 sq. yd.),5;Mace,5;Merchant\'s Scale,5;Six person Tent,5;Pack Saddle,5;Padded Armor,5;Perfume (vial),5;Pike,5;Reliquary,5;Signet Ring,5;Silver,5;Sinda berries (10),5;Staff,5;Steel Mirror,5;Trident,5;War Pick,5;Wooden Staff,5;Drum,6;Carpenter\'s Tools,8;Donkey,8;Mule,8;Battleaxe,10;Blowgun,10;Bullseye Lantern,10;Calligrapher\'s Supplies,10;Clothing (cold weather),10;Cow,10;Crystal,10;Explorer\'s Pack,10;Fine Wine (Bottle),10;Flail,10;Hide Armor,10;Ink (1-ounce bottle),10;Lance,10;Leather Armor,10;Lock,10;Mason\'s Tools,10;Maul,10;Painter\'s Supplies,10;Potter\'s Tools,10;Riding Saddle,10;Rod,10;Shield,10;Shortsword,10;Silk (1 sq. yd.),10;Silk Rope (50 feet),10;Wand,10;Yew Wand,10;Zabou,10;Dungeoneer\'s Pack,12;Pan Flute,12;Cart,15;Cartographer\'s Tools,15;Fine Clothes,15;Forgery Kit,15;Longsword,15;Morningstar,15;Ox,15;Saffron,15;Warhammer,15;Burglar\'s Pack,16;Priest\'s Pack,19;Brewer\'s Supplies,20;Dogsled,20;Glaive,20;Halberd,20;Military Saddle,20;Orb,20;Sled,20;Smith\'s Tools,20;Acid (vial),25;Book,25;Climber\'s Kit,25;Component Pouch,25;Disguise Kit,25;Dulcimer,25;Holy Water (flask),25;Hourglass,25;Jeweler\'s Tools,25;Light Crossbow,25;Navigator\'s Tools,25;Rapier,25;Scimitar,25;Shortbow,25;Thieves\' Tools,25;Wildroot,25;Yarting,25;Bagpipes,30;Glassblower\'s Tools,30;Greataxe,30;Lyre,30;Ring Mail,30;Pony,30;Viol,30;Willowshade Oil,30;Monster Hunter\'s Pack,33;Lute,35;Wagon,35;Diplomat\'s Pack,39;Entertainer\'s Pack,40;Scholar\'s Pack,40;Studded Leather Armor,45";
                }
                break;
            case 'common,rare':
                rand = randomInteger(100);
                if (rand<=55) {
                    mundaneList = "Candle,0.01;Chalk (1 piece),0.01;Sack,0.01;Torch,0.01;Wheat,0.01;Whetstone,0.01;Blowgun Needle,0.01;Chicken,0.02;Flask,0.02;Flour,0.02;Jug,0.02;Loaf of Bread,0.02;Pitcher,0.02;Soap,0.02;Tankard,0.02;Ale (mug),0.04;Sling Bullets (20),0.04;Arrow,0.05;Bucket,0.05;Caltrop,0.05;Crossbow Bolt,0.05;Dart,0.05;Feed (per day),0.05;Piton,0.05;Pole (10-foot),0.05;Salt,0.05;Signal Whistle,0.05;Canvas (1 sq. yd.),0.1;Club,0.1;Dice Set,0.1;Hunk of Cheese,0.1;Insect Repellent (Block of Incense),0.1;Iron,0.1;Iron Spike,0.1;Ladder (10-foot),0.1;Oil (flask),0.1;Parchment (one sheet),0.1;Sling,0.1;Ale (Gallon),0.2;Common Wine (Pitcher),0.2;Greatclub,0.2;Mess Kit,0.2;Paper (one sheet),0.2;Quarterstaff,0.2;Waterskin,0.2;Chunk of Meat,0.3;Basket,0.4;Blanket,0.5;Common Clothes,0.5;Copper,0.5;Cotton Cloth (1 sq. yd.),0.5;Javelin,0.5;Lamp,0.5;Playing Card Set,0.5;Pouch,0.5;Rations (1 day),0.5;Sealing Wax,0.5;Stabling (per day),0.5;Tinderbox,0.5;Arrows (20),1;Ball Bearings (bag of 1000),1;Bedroll,1;Bell,1;Block and Tackle,1;Blowgun Needles (50),1;Caltrops (bag of 20),1;Cook\'s Utensils,1;Crossbow Bolt Case,1;Crossbow Bolts (20),1;Dragonchess Set,1;Fishing Tackle,1;Ginger,1;Goat,1;Hammer,1;Hempen Rope (50 feet),1;Insect Repellent (greasy salve),1;Iron Spikes (10),1;Map or Scroll Case,1;Net,1;Quiver,1;Rain Catcher,1;Robes,1;Sickle,1;Spear,1;Spring of Mistletoe,1;Three-Dragon Ante Set,1;Totem,1;Vial,1;Weaver\'s Tools,1;Wukka Nut,1;Yahcha,1;Yklwa,1;Backpack,2;Barrel,2;Bit and Bridle,2;Cinnamon,2;Crampons,2;Crowbar,2;Dagger,2;Flute,2;Glass Bottle,2;Grappling Hook,2;Iron Pot,2;Light Hammer,2;Menacles,2;Menga leaves (1 ounce),2;Miner\'s Pick,2;Pepper,2;Abacus,2,Shawm,2;Sheep,2;Shovel,2;Sledgehammer,2;Snowshoes,2;Traveler\'s Clothes,2;Two-Person Tent,2;Whip,2;Cloves,3;Horn,3;Pig,3;Theki Root,3;Portable Ram,4;Saddlebags,4";
                } else if (rand<=85) {
                    mundaneList = "Amulet,5;Chain (10 feet),5;Chest,5;Cobbler\'s Tools,5;Costume Clothes,5;Emblem,5;Handaxe,5;Healer\'s Kit,5;Herbalism Kit,5;Hooded Lantern,5;Hunting Trap,5;Leatherworker\'s Tools,5;Linen (1 sq. yd.),5;Mace,5;Merchant\'s Scale,5;Six person Tent,5;Pack Saddle,5;Padded Armor,5;Perfume (vial),5;Pike,5;Reliquary,5;Signet Ring,5;Silver,5;Sinda berries (10),5;Staff,5;Steel Mirror,5;Trident,5;War Pick,5;Wooden Staff,5;Drum,6;Carpenter\'s Tools,8;Donkey,8;Mule,8;Battleaxe,10;Blowgun,10;Bullseye Lantern,10;Calligrapher\'s Supplies,10;Clothing (cold weather),10;Cow,10;Crystal,10;Explorer\'s Pack,10;Fine Wine (Bottle),10;Flail,10;Hide Armor,10;Ink (1-ounce bottle),10;Lance,10;Leather Armor,10;Lock,10;Mason\'s Tools,10;Maul,10;Painter\'s Supplies,10;Potter\'s Tools,10;Riding Saddle,10;Rod,10;Shield,10;Shortsword,10;Silk (1 sq. yd.),10;Silk Rope (50 feet),10;Wand,10;Yew Wand,10;Zabou,10;Dungeoneer\'s Pack,12;Pan Flute,12;Cart,15;Cartographer\'s Tools,15;Fine Clothes,15;Forgery Kit,15;Longsword,15;Morningstar,15;Ox,15;Saffron,15;Warhammer,15;Burglar\'s Pack,16;Priest\'s Pack,19;Brewer\'s Supplies,20;Dogsled,20;Glaive,20;Halberd,20;Military Saddle,20;Orb,20;Sled,20;Smith\'s Tools,20;Acid (vial),25;Book,25;Climber\'s Kit,25;Component Pouch,25;Disguise Kit,25;Dulcimer,25;Holy Water (flask),25;Hourglass,25;Jeweler\'s Tools,25;Light Crossbow,25;Navigator\'s Tools,25;Rapier,25;Scimitar,25;Shortbow,25;Thieves\' Tools,25;Wildroot,25;Yarting,25;Bagpipes,30;Glassblower\'s Tools,30;Greataxe,30;Lyre,30;Ring Mail,30;Pony,30;Viol,30;Willowshade Oil,30;Monster Hunter\'s Pack,33;Lute,35;Wagon,35;Diplomat\'s Pack,39;Entertainer\'s Pack,40;Scholar\'s Pack,40;Studded Leather Armor,45";
                } else if (rand>85) {
                    mundaneList = "Alchemist\'s Fire (Flask),50,Alchemist\'s Supplies,50;Antitoxin (vial),50;Axe Beak,50;Camel,50;Canoe,50;Chain Shirt,50;Draft Horse,50;Gold,50;Greatsword,50;Heavy Crossbow,50;Longbow,50;Olisuba Leaf,50;Poisoner\'s Kit,50;Rowboat,50;Ryath Root,50;Scale Mail,50;Sled Dog,50;Spellbook,50;Tinker\'s Tools,50;Exotic Saddle,60;Chain Mail,75;Hand Crossbow,75;Riding Horse,75;Spiked Armor,75;Basic Potion (vial),100;Silvered Weapon,100;Silvered Ammunition (10),100;Carriage,100;Double-Bladed Scimitar,100;Magnifying Glass,100;Muroosa Balm,100;Pride Silk,100;Assassin\'s Blood,Soothsalts,150;Truth Serum,150;Oversized Longbow,150;Oversized Arrow (20),3";
                }
                break;
            case 'common,very rare':
                rand = randomInteger(100);
                if (rand<=51) {
                    mundaneList = "Candle,0.01;Chalk (1 piece),0.01;Sack,0.01;Torch,0.01;Wheat,0.01;Whetstone,0.01;Blowgun Needle,0.01;Chicken,0.02;Flask,0.02;Flour,0.02;Jug,0.02;Loaf of Bread,0.02;Pitcher,0.02;Soap,0.02;Tankard,0.02;Ale (mug),0.04;Sling Bullets (20),0.04;Arrow,0.05;Bucket,0.05;Caltrop,0.05;Crossbow Bolt,0.05;Dart,0.05;Feed (per day),0.05;Piton,0.05;Pole (10-foot),0.05;Salt,0.05;Signal Whistle,0.05;Canvas (1 sq. yd.),0.1;Club,0.1;Dice Set,0.1;Hunk of Cheese,0.1;Insect Repellent (Block of Incense),0.1;Iron,0.1;Iron Spike,0.1;Ladder (10-foot),0.1;Oil (flask),0.1;Parchment (one sheet),0.1;Sling,0.1;Ale (Gallon),0.2;Common Wine (Pitcher),0.2;Greatclub,0.2;Mess Kit,0.2;Paper (one sheet),0.2;Quarterstaff,0.2;Waterskin,0.2;Chunk of Meat,0.3;Basket,0.4;Blanket,0.5;Common Clothes,0.5;Copper,0.5;Cotton Cloth (1 sq. yd.),0.5;Javelin,0.5;Lamp,0.5;Playing Card Set,0.5;Pouch,0.5;Rations (1 day),0.5;Sealing Wax,0.5;Stabling (per day),0.5;Tinderbox,0.5;Arrows (20),1;Ball Bearings (bag of 1000),1;Bedroll,1;Bell,1;Block and Tackle,1;Blowgun Needles (50),1;Caltrops (bag of 20),1;Cook\'s Utensils,1;Crossbow Bolt Case,1;Crossbow Bolts (20),1;Dragonchess Set,1;Fishing Tackle,1;Ginger,1;Goat,1;Hammer,1;Hempen Rope (50 feet),1;Insect Repellent (greasy salve),1;Iron Spikes (10),1;Map or Scroll Case,1;Net,1;Quiver,1;Rain Catcher,1;Robes,1;Sickle,1;Spear,1;Spring of Mistletoe,1;Three-Dragon Ante Set,1;Totem,1;Vial,1;Weaver\'s Tools,1;Wukka Nut,1;Yahcha,1;Yklwa,1;Backpack,2;Barrel,2;Bit and Bridle,2;Cinnamon,2;Crampons,2;Crowbar,2;Dagger,2;Flute,2;Glass Bottle,2;Grappling Hook,2;Iron Pot,2;Light Hammer,2;Menacles,2;Menga leaves (1 ounce),2;Miner\'s Pick,2;Pepper,2;Abacus,2,Shawm,2;Sheep,2;Shovel,2;Sledgehammer,2;Snowshoes,2;Traveler\'s Clothes,2;Two-Person Tent,2;Whip,2;Cloves,3;Horn,3;Pig,3;Theki Root,3;Portable Ram,4;Saddlebags,4";
                } else if (rand<=81) {
                    mundaneList = "Amulet,5;Chain (10 feet),5;Chest,5;Cobbler\'s Tools,5;Costume Clothes,5;Emblem,5;Handaxe,5;Healer\'s Kit,5;Herbalism Kit,5;Hooded Lantern,5;Hunting Trap,5;Leatherworker\'s Tools,5;Linen (1 sq. yd.),5;Mace,5;Merchant\'s Scale,5;Six person Tent,5;Pack Saddle,5;Padded Armor,5;Perfume (vial),5;Pike,5;Reliquary,5;Signet Ring,5;Silver,5;Sinda berries (10),5;Staff,5;Steel Mirror,5;Trident,5;War Pick,5;Wooden Staff,5;Drum,6;Carpenter\'s Tools,8;Donkey,8;Mule,8;Battleaxe,10;Blowgun,10;Bullseye Lantern,10;Calligrapher\'s Supplies,10;Clothing (cold weather),10;Cow,10;Crystal,10;Explorer\'s Pack,10;Fine Wine (Bottle),10;Flail,10;Hide Armor,10;Ink (1-ounce bottle),10;Lance,10;Leather Armor,10;Lock,10;Mason\'s Tools,10;Maul,10;Painter\'s Supplies,10;Potter\'s Tools,10;Riding Saddle,10;Rod,10;Shield,10;Shortsword,10;Silk (1 sq. yd.),10;Silk Rope (50 feet),10;Wand,10;Yew Wand,10;Zabou,10;Dungeoneer\'s Pack,12;Pan Flute,12;Cart,15;Cartographer\'s Tools,15;Fine Clothes,15;Forgery Kit,15;Longsword,15;Morningstar,15;Ox,15;Saffron,15;Warhammer,15;Burglar\'s Pack,16;Priest\'s Pack,19;Brewer\'s Supplies,20;Dogsled,20;Glaive,20;Halberd,20;Military Saddle,20;Orb,20;Sled,20;Smith\'s Tools,20;Acid (vial),25;Book,25;Climber\'s Kit,25;Component Pouch,25;Disguise Kit,25;Dulcimer,25;Holy Water (flask),25;Hourglass,25;Jeweler\'s Tools,25;Light Crossbow,25;Navigator\'s Tools,25;Rapier,25;Scimitar,25;Shortbow,25;Thieves\' Tools,25;Wildroot,25;Yarting,25;Bagpipes,30;Glassblower\'s Tools,30;Greataxe,30;Lyre,30;Ring Mail,30;Pony,30;Viol,30;Willowshade Oil,30;Monster Hunter\'s Pack,33;Lute,35;Wagon,35;Diplomat\'s Pack,39;Entertainer\'s Pack,40;Scholar\'s Pack,40;Studded Leather Armor,45";
                } else if (rand<=96) {
                    mundaneList = "Alchemist\'s Fire (Flask),50,Alchemist\'s Supplies,50;Antitoxin (vial),50;Axe Beak,50;Camel,50;Canoe,50;Chain Shirt,50;Draft Horse,50;Gold,50;Greatsword,50;Heavy Crossbow,50;Longbow,50;Olisuba Leaf,50;Poisoner\'s Kit,50;Rowboat,50;Ryath Root,50;Scale Mail,50;Sled Dog,50;Spellbook,50;Tinker\'s Tools,50;Exotic Saddle,60;Chain Mail,75;Hand Crossbow,75;Riding Horse,75;Spiked Armor,75;Basic Potion (vial),100;Silvered Weapon,100;Silvered Ammunition (10),100;Carriage,100;Double-Bladed Scimitar,100;Magnifying Glass,100;Muroosa Balm,100;Pride Silk,100;Assassin\'s Blood,Soothsalts,150;Truth Serum,150;Oversized Longbow,150;Oversized Arrow (20),3";
                } else if (rand>96) {
                    mundaneList = "Blight Ichor,200;Carrion Crawler Mucus,200;Drow Poison,200;Elephant,200;Serpent Venom,200;Splint Armor,200;Chariot,250;Malice,250;Pale Tincture,250;Black Sap,300;Essence of Ether,300;Breastplate,400;Moorbounder,400;Oil of Taggit,400;Warhorse,400;Burnt Othur Fumes,500;Platinum,500;Pride Silk Outfit,500;Vial of Stardust,500;Torpor,600;Half Plate Armor,750";
                }
                break;
            case 'common,legendary':
                rand = randomInteger(100);
                if (rand<=50) {
                    mundaneList = "Candle,0.01;Chalk (1 piece),0.01;Sack,0.01;Torch,0.01;Wheat,0.01;Whetstone,0.01;Blowgun Needle,0.01;Chicken,0.02;Flask,0.02;Flour,0.02;Jug,0.02;Loaf of Bread,0.02;Pitcher,0.02;Soap,0.02;Tankard,0.02;Ale (mug),0.04;Sling Bullets (20),0.04;Arrow,0.05;Bucket,0.05;Caltrop,0.05;Crossbow Bolt,0.05;Dart,0.05;Feed (per day),0.05;Piton,0.05;Pole (10-foot),0.05;Salt,0.05;Signal Whistle,0.05;Canvas (1 sq. yd.),0.1;Club,0.1;Dice Set,0.1;Hunk of Cheese,0.1;Insect Repellent (Block of Incense),0.1;Iron,0.1;Iron Spike,0.1;Ladder (10-foot),0.1;Oil (flask),0.1;Parchment (one sheet),0.1;Sling,0.1;Ale (Gallon),0.2;Common Wine (Pitcher),0.2;Greatclub,0.2;Mess Kit,0.2;Paper (one sheet),0.2;Quarterstaff,0.2;Waterskin,0.2;Chunk of Meat,0.3;Basket,0.4;Blanket,0.5;Common Clothes,0.5;Copper,0.5;Cotton Cloth (1 sq. yd.),0.5;Javelin,0.5;Lamp,0.5;Playing Card Set,0.5;Pouch,0.5;Rations (1 day),0.5;Sealing Wax,0.5;Stabling (per day),0.5;Tinderbox,0.5;Arrows (20),1;Ball Bearings (bag of 1000),1;Bedroll,1;Bell,1;Block and Tackle,1;Blowgun Needles (50),1;Caltrops (bag of 20),1;Cook\'s Utensils,1;Crossbow Bolt Case,1;Crossbow Bolts (20),1;Dragonchess Set,1;Fishing Tackle,1;Ginger,1;Goat,1;Hammer,1;Hempen Rope (50 feet),1;Insect Repellent (greasy salve),1;Iron Spikes (10),1;Map or Scroll Case,1;Net,1;Quiver,1;Rain Catcher,1;Robes,1;Sickle,1;Spear,1;Spring of Mistletoe,1;Three-Dragon Ante Set,1;Totem,1;Vial,1;Weaver\'s Tools,1;Wukka Nut,1;Yahcha,1;Yklwa,1;Backpack,2;Barrel,2;Bit and Bridle,2;Cinnamon,2;Crampons,2;Crowbar,2;Dagger,2;Flute,2;Glass Bottle,2;Grappling Hook,2;Iron Pot,2;Light Hammer,2;Menacles,2;Menga leaves (1 ounce),2;Miner\'s Pick,2;Pepper,2;Abacus,2,Shawm,2;Sheep,2;Shovel,2;Sledgehammer,2;Snowshoes,2;Traveler\'s Clothes,2;Two-Person Tent,2;Whip,2;Cloves,3;Horn,3;Pig,3;Theki Root,3;Portable Ram,4;Saddlebags,4";
                } else if (rand<=80) {
                    mundaneList = "Amulet,5;Chain (10 feet),5;Chest,5;Cobbler\'s Tools,5;Costume Clothes,5;Emblem,5;Handaxe,5;Healer\'s Kit,5;Herbalism Kit,5;Hooded Lantern,5;Hunting Trap,5;Leatherworker\'s Tools,5;Linen (1 sq. yd.),5;Mace,5;Merchant\'s Scale,5;Six person Tent,5;Pack Saddle,5;Padded Armor,5;Perfume (vial),5;Pike,5;Reliquary,5;Signet Ring,5;Silver,5;Sinda berries (10),5;Staff,5;Steel Mirror,5;Trident,5;War Pick,5;Wooden Staff,5;Drum,6;Carpenter\'s Tools,8;Donkey,8;Mule,8;Battleaxe,10;Blowgun,10;Bullseye Lantern,10;Calligrapher\'s Supplies,10;Clothing (cold weather),10;Cow,10;Crystal,10;Explorer\'s Pack,10;Fine Wine (Bottle),10;Flail,10;Hide Armor,10;Ink (1-ounce bottle),10;Lance,10;Leather Armor,10;Lock,10;Mason\'s Tools,10;Maul,10;Painter\'s Supplies,10;Potter\'s Tools,10;Riding Saddle,10;Rod,10;Shield,10;Shortsword,10;Silk (1 sq. yd.),10;Silk Rope (50 feet),10;Wand,10;Yew Wand,10;Zabou,10;Dungeoneer\'s Pack,12;Pan Flute,12;Cart,15;Cartographer\'s Tools,15;Fine Clothes,15;Forgery Kit,15;Longsword,15;Morningstar,15;Ox,15;Saffron,15;Warhammer,15;Burglar\'s Pack,16;Priest\'s Pack,19;Brewer\'s Supplies,20;Dogsled,20;Glaive,20;Halberd,20;Military Saddle,20;Orb,20;Sled,20;Smith\'s Tools,20;Acid (vial),25;Book,25;Climber\'s Kit,25;Component Pouch,25;Disguise Kit,25;Dulcimer,25;Holy Water (flask),25;Hourglass,25;Jeweler\'s Tools,25;Light Crossbow,25;Navigator\'s Tools,25;Rapier,25;Scimitar,25;Shortbow,25;Thieves\' Tools,25;Wildroot,25;Yarting,25;Bagpipes,30;Glassblower\'s Tools,30;Greataxe,30;Lyre,30;Ring Mail,30;Pony,30;Viol,30;Willowshade Oil,30;Monster Hunter\'s Pack,33;Lute,35;Wagon,35;Diplomat\'s Pack,39;Entertainer\'s Pack,40;Scholar\'s Pack,40;Studded Leather Armor,45";
                } else if (rand<=95) {
                    mundaneList = "Alchemist\'s Fire (Flask),50,Alchemist\'s Supplies,50;Antitoxin (vial),50;Axe Beak,50;Camel,50;Canoe,50;Chain Shirt,50;Draft Horse,50;Gold,50;Greatsword,50;Heavy Crossbow,50;Longbow,50;Olisuba Leaf,50;Poisoner\'s Kit,50;Rowboat,50;Ryath Root,50;Scale Mail,50;Sled Dog,50;Spellbook,50;Tinker\'s Tools,50;Exotic Saddle,60;Chain Mail,75;Hand Crossbow,75;Riding Horse,75;Spiked Armor,75;Basic Potion (vial),100;Silvered Weapon,100;Silvered Ammunition (10),100;Carriage,100;Double-Bladed Scimitar,100;Magnifying Glass,100;Muroosa Balm,100;Pride Silk,100;Assassin\'s Blood,Soothsalts,150;Truth Serum,150;Oversized Longbow,150;Oversized Arrow (20),3";
                } else if (rand<=99) {
                    mundaneList = "Blight Ichor,200;Carrion Crawler Mucus,200;Drow Poison,200;Elephant,200;Serpent Venom,200;Splint Armor,200;Chariot,250;Malice,250;Pale Tincture,250;Black Sap,300;Essence of Ether,300;Breastplate,400;Moorbounder,400;Oil of Taggit,400;Warhorse,400;Burnt Othur Fumes,500;Platinum,500;Pride Silk Outfit,500;Vial of Stardust,500;Torpor,600;Half Plate Armor,750";
                } else if (rand>99) {
                    mundaneList = "Adamantine Bar,1000;Spyglass,1000;Wyvern Poison,1200;Midnight Tears,1500;Plate Armor,1500;Purple Worm Poison,2000;Keelboat,3000;Longship,10000;Airship,20000;Warship,25000;Galley,30000;Skyship,100000"
                }
                break;
            case 'uncommon,rare':
                rand = randomInteger(100);
                if (rand<=85) {
                    mundaneList = "Amulet,5;Chain (10 feet),5;Chest,5;Cobbler\'s Tools,5;Costume Clothes,5;Emblem,5;Handaxe,5;Healer\'s Kit,5;Herbalism Kit,5;Hooded Lantern,5;Hunting Trap,5;Leatherworker\'s Tools,5;Linen (1 sq. yd.),5;Mace,5;Merchant\'s Scale,5;Six person Tent,5;Pack Saddle,5;Padded Armor,5;Perfume (vial),5;Pike,5;Reliquary,5;Signet Ring,5;Silver,5;Sinda berries (10),5;Staff,5;Steel Mirror,5;Trident,5;War Pick,5;Wooden Staff,5;Drum,6;Carpenter\'s Tools,8;Donkey,8;Mule,8;Battleaxe,10;Blowgun,10;Bullseye Lantern,10;Calligrapher\'s Supplies,10;Clothing (cold weather),10;Cow,10;Crystal,10;Explorer\'s Pack,10;Fine Wine (Bottle),10;Flail,10;Hide Armor,10;Ink (1-ounce bottle),10;Lance,10;Leather Armor,10;Lock,10;Mason\'s Tools,10;Maul,10;Painter\'s Supplies,10;Potter\'s Tools,10;Riding Saddle,10;Rod,10;Shield,10;Shortsword,10;Silk (1 sq. yd.),10;Silk Rope (50 feet),10;Wand,10;Yew Wand,10;Zabou,10;Dungeoneer\'s Pack,12;Pan Flute,12;Cart,15;Cartographer\'s Tools,15;Fine Clothes,15;Forgery Kit,15;Longsword,15;Morningstar,15;Ox,15;Saffron,15;Warhammer,15;Burglar\'s Pack,16;Priest\'s Pack,19;Brewer\'s Supplies,20;Dogsled,20;Glaive,20;Halberd,20;Military Saddle,20;Orb,20;Sled,20;Smith\'s Tools,20;Acid (vial),25;Book,25;Climber\'s Kit,25;Component Pouch,25;Disguise Kit,25;Dulcimer,25;Holy Water (flask),25;Hourglass,25;Jeweler\'s Tools,25;Light Crossbow,25;Navigator\'s Tools,25;Rapier,25;Scimitar,25;Shortbow,25;Thieves\' Tools,25;Wildroot,25;Yarting,25;Bagpipes,30;Glassblower\'s Tools,30;Greataxe,30;Lyre,30;Ring Mail,30;Pony,30;Viol,30;Willowshade Oil,30;Monster Hunter\'s Pack,33;Lute,35;Wagon,35;Diplomat\'s Pack,39;Entertainer\'s Pack,40;Scholar\'s Pack,40;Studded Leather Armor,45";
                } else if (rand>85) {
                    mundaneList = "Alchemist\'s Fire (Flask),50,Alchemist\'s Supplies,50;Antitoxin (vial),50;Axe Beak,50;Camel,50;Canoe,50;Chain Shirt,50;Draft Horse,50;Gold,50;Greatsword,50;Heavy Crossbow,50;Longbow,50;Olisuba Leaf,50;Poisoner\'s Kit,50;Rowboat,50;Ryath Root,50;Scale Mail,50;Sled Dog,50;Spellbook,50;Tinker\'s Tools,50;Exotic Saddle,60;Chain Mail,75;Hand Crossbow,75;Riding Horse,75;Spiked Armor,75;Basic Potion (vial),100;Silvered Weapon,100;Silvered Ammunition (10),100;Carriage,100;Double-Bladed Scimitar,100;Magnifying Glass,100;Muroosa Balm,100;Pride Silk,100;Assassin\'s Blood,Soothsalts,150;Truth Serum,150;Oversized Longbow,150;Oversized Arrow (20),3";
                }
                break;
            case 'uncommon,very rare':
                rand = randomInteger(100);
                if (rand<=81) {
                    mundaneList = "Amulet,5;Chain (10 feet),5;Chest,5;Cobbler\'s Tools,5;Costume Clothes,5;Emblem,5;Handaxe,5;Healer\'s Kit,5;Herbalism Kit,5;Hooded Lantern,5;Hunting Trap,5;Leatherworker\'s Tools,5;Linen (1 sq. yd.),5;Mace,5;Merchant\'s Scale,5;Six person Tent,5;Pack Saddle,5;Padded Armor,5;Perfume (vial),5;Pike,5;Reliquary,5;Signet Ring,5;Silver,5;Sinda berries (10),5;Staff,5;Steel Mirror,5;Trident,5;War Pick,5;Wooden Staff,5;Drum,6;Carpenter\'s Tools,8;Donkey,8;Mule,8;Battleaxe,10;Blowgun,10;Bullseye Lantern,10;Calligrapher\'s Supplies,10;Clothing (cold weather),10;Cow,10;Crystal,10;Explorer\'s Pack,10;Fine Wine (Bottle),10;Flail,10;Hide Armor,10;Ink (1-ounce bottle),10;Lance,10;Leather Armor,10;Lock,10;Mason\'s Tools,10;Maul,10;Painter\'s Supplies,10;Potter\'s Tools,10;Riding Saddle,10;Rod,10;Shield,10;Shortsword,10;Silk (1 sq. yd.),10;Silk Rope (50 feet),10;Wand,10;Yew Wand,10;Zabou,10;Dungeoneer\'s Pack,12;Pan Flute,12;Cart,15;Cartographer\'s Tools,15;Fine Clothes,15;Forgery Kit,15;Longsword,15;Morningstar,15;Ox,15;Saffron,15;Warhammer,15;Burglar\'s Pack,16;Priest\'s Pack,19;Brewer\'s Supplies,20;Dogsled,20;Glaive,20;Halberd,20;Military Saddle,20;Orb,20;Sled,20;Smith\'s Tools,20;Acid (vial),25;Book,25;Climber\'s Kit,25;Component Pouch,25;Disguise Kit,25;Dulcimer,25;Holy Water (flask),25;Hourglass,25;Jeweler\'s Tools,25;Light Crossbow,25;Navigator\'s Tools,25;Rapier,25;Scimitar,25;Shortbow,25;Thieves\' Tools,25;Wildroot,25;Yarting,25;Bagpipes,30;Glassblower\'s Tools,30;Greataxe,30;Lyre,30;Ring Mail,30;Pony,30;Viol,30;Willowshade Oil,30;Monster Hunter\'s Pack,33;Lute,35;Wagon,35;Diplomat\'s Pack,39;Entertainer\'s Pack,40;Scholar\'s Pack,40;Studded Leather Armor,45";
                } else if (rand<=96) {
                    mundaneList = "Alchemist\'s Fire (Flask),50,Alchemist\'s Supplies,50;Antitoxin (vial),50;Axe Beak,50;Camel,50;Canoe,50;Chain Shirt,50;Draft Horse,50;Gold,50;Greatsword,50;Heavy Crossbow,50;Longbow,50;Olisuba Leaf,50;Poisoner\'s Kit,50;Rowboat,50;Ryath Root,50;Scale Mail,50;Sled Dog,50;Spellbook,50;Tinker\'s Tools,50;Exotic Saddle,60;Chain Mail,75;Hand Crossbow,75;Riding Horse,75;Spiked Armor,75;Basic Potion (vial),100;Silvered Weapon,100;Silvered Ammunition (10),100;Carriage,100;Double-Bladed Scimitar,100;Magnifying Glass,100;Muroosa Balm,100;Pride Silk,100;Assassin\'s Blood,Soothsalts,150;Truth Serum,150;Oversized Longbow,150;Oversized Arrow (20),3";
                } else if (rand>96) {
                    mundaneList = "Blight Ichor,200;Carrion Crawler Mucus,200;Drow Poison,200;Elephant,200;Serpent Venom,200;Splint Armor,200;Chariot,250;Malice,250;Pale Tincture,250;Black Sap,300;Essence of Ether,300;Breastplate,400;Moorbounder,400;Oil of Taggit,400;Warhorse,400;Burnt Othur Fumes,500;Platinum,500;Pride Silk Outfit,500;Vial of Stardust,500;Torpor,600;Half Plate Armor,750";
                }
                break;
            case 'uncommon,legendary':
                rand = randomInteger(100);
                if (rand<=80) {
                    mundaneList = "Amulet,5;Chain (10 feet),5;Chest,5;Cobbler\'s Tools,5;Costume Clothes,5;Emblem,5;Handaxe,5;Healer\'s Kit,5;Herbalism Kit,5;Hooded Lantern,5;Hunting Trap,5;Leatherworker\'s Tools,5;Linen (1 sq. yd.),5;Mace,5;Merchant\'s Scale,5;Six person Tent,5;Pack Saddle,5;Padded Armor,5;Perfume (vial),5;Pike,5;Reliquary,5;Signet Ring,5;Silver,5;Sinda berries (10),5;Staff,5;Steel Mirror,5;Trident,5;War Pick,5;Wooden Staff,5;Drum,6;Carpenter\'s Tools,8;Donkey,8;Mule,8;Battleaxe,10;Blowgun,10;Bullseye Lantern,10;Calligrapher\'s Supplies,10;Clothing (cold weather),10;Cow,10;Crystal,10;Explorer\'s Pack,10;Fine Wine (Bottle),10;Flail,10;Hide Armor,10;Ink (1-ounce bottle),10;Lance,10;Leather Armor,10;Lock,10;Mason\'s Tools,10;Maul,10;Painter\'s Supplies,10;Potter\'s Tools,10;Riding Saddle,10;Rod,10;Shield,10;Shortsword,10;Silk (1 sq. yd.),10;Silk Rope (50 feet),10;Wand,10;Yew Wand,10;Zabou,10;Dungeoneer\'s Pack,12;Pan Flute,12;Cart,15;Cartographer\'s Tools,15;Fine Clothes,15;Forgery Kit,15;Longsword,15;Morningstar,15;Ox,15;Saffron,15;Warhammer,15;Burglar\'s Pack,16;Priest\'s Pack,19;Brewer\'s Supplies,20;Dogsled,20;Glaive,20;Halberd,20;Military Saddle,20;Orb,20;Sled,20;Smith\'s Tools,20;Acid (vial),25;Book,25;Climber\'s Kit,25;Component Pouch,25;Disguise Kit,25;Dulcimer,25;Holy Water (flask),25;Hourglass,25;Jeweler\'s Tools,25;Light Crossbow,25;Navigator\'s Tools,25;Rapier,25;Scimitar,25;Shortbow,25;Thieves\' Tools,25;Wildroot,25;Yarting,25;Bagpipes,30;Glassblower\'s Tools,30;Greataxe,30;Lyre,30;Ring Mail,30;Pony,30;Viol,30;Willowshade Oil,30;Monster Hunter\'s Pack,33;Lute,35;Wagon,35;Diplomat\'s Pack,39;Entertainer\'s Pack,40;Scholar\'s Pack,40;Studded Leather Armor,45";
                } else if (rand<=95) {
                    mundaneList = "Alchemist\'s Fire (Flask),50,Alchemist\'s Supplies,50;Antitoxin (vial),50;Axe Beak,50;Camel,50;Canoe,50;Chain Shirt,50;Draft Horse,50;Gold,50;Greatsword,50;Heavy Crossbow,50;Longbow,50;Olisuba Leaf,50;Poisoner\'s Kit,50;Rowboat,50;Ryath Root,50;Scale Mail,50;Sled Dog,50;Spellbook,50;Tinker\'s Tools,50;Exotic Saddle,60;Chain Mail,75;Hand Crossbow,75;Riding Horse,75;Spiked Armor,75;Basic Potion (vial),100;Silvered Weapon,100;Silvered Ammunition (10),100;Carriage,100;Double-Bladed Scimitar,100;Magnifying Glass,100;Muroosa Balm,100;Pride Silk,100;Assassin\'s Blood,Soothsalts,150;Truth Serum,150;Oversized Longbow,150;Oversized Arrow (20),3";
                } else if (rand<=99) {
                    mundaneList = "Blight Ichor,200;Carrion Crawler Mucus,200;Drow Poison,200;Elephant,200;Serpent Venom,200;Splint Armor,200;Chariot,250;Malice,250;Pale Tincture,250;Black Sap,300;Essence of Ether,300;Breastplate,400;Moorbounder,400;Oil of Taggit,400;Warhorse,400;Burnt Othur Fumes,500;Platinum,500;Pride Silk Outfit,500;Vial of Stardust,500;Torpor,600;Half Plate Armor,750";
                } else if (rand>99) {
                    mundaneList = "Adamantine Bar,1000;Spyglass,1000;Wyvern Poison,1200;Midnight Tears,1500;Plate Armor,1500;Purple Worm Poison,2000;Keelboat,3000;Longship,10000;Airship,20000;Warship,25000;Galley,30000;Skyship,100000"
                }
                break;
            case 'rare,very rare':
                rand = randomInteger(100);
                if (rand<=96) {
                    mundaneList = "Alchemist\'s Fire (Flask),50,Alchemist\'s Supplies,50;Antitoxin (vial),50;Axe Beak,50;Camel,50;Canoe,50;Chain Shirt,50;Draft Horse,50;Gold,50;Greatsword,50;Heavy Crossbow,50;Longbow,50;Olisuba Leaf,50;Poisoner\'s Kit,50;Rowboat,50;Ryath Root,50;Scale Mail,50;Sled Dog,50;Spellbook,50;Tinker\'s Tools,50;Exotic Saddle,60;Chain Mail,75;Hand Crossbow,75;Riding Horse,75;Spiked Armor,75;Basic Potion (vial),100;Silvered Weapon,100;Silvered Ammunition (10),100;Carriage,100;Double-Bladed Scimitar,100;Magnifying Glass,100;Muroosa Balm,100;Pride Silk,100;Assassin\'s Blood,Soothsalts,150;Truth Serum,150;Oversized Longbow,150;Oversized Arrow (20),3";
                } else if (rand>96) {
                    mundaneList = "Blight Ichor,200;Carrion Crawler Mucus,200;Drow Poison,200;Elephant,200;Serpent Venom,200;Splint Armor,200;Chariot,250;Malice,250;Pale Tincture,250;Black Sap,300;Essence of Ether,300;Breastplate,400;Moorbounder,400;Oil of Taggit,400;Warhorse,400;Burnt Othur Fumes,500;Platinum,500;Pride Silk Outfit,500;Vial of Stardust,500;Torpor,600;Half Plate Armor,750";
                }
                break;
            case 'rare,legendary':
                rand = randomInteger(100);
                if (rand<=95) {
                    mundaneList = "Alchemist\'s Fire (Flask),50,Alchemist\'s Supplies,50;Antitoxin (vial),50;Axe Beak,50;Camel,50;Canoe,50;Chain Shirt,50;Draft Horse,50;Gold,50;Greatsword,50;Heavy Crossbow,50;Longbow,50;Olisuba Leaf,50;Poisoner\'s Kit,50;Rowboat,50;Ryath Root,50;Scale Mail,50;Sled Dog,50;Spellbook,50;Tinker\'s Tools,50;Exotic Saddle,60;Chain Mail,75;Hand Crossbow,75;Riding Horse,75;Spiked Armor,75;Basic Potion (vial),100;Silvered Weapon,100;Silvered Ammunition (10),100;Carriage,100;Double-Bladed Scimitar,100;Magnifying Glass,100;Muroosa Balm,100;Pride Silk,100;Assassin\'s Blood,Soothsalts,150;Truth Serum,150;Oversized Longbow,150;Oversized Arrow (20),3";
                } else if (rand<=99) {
                    mundaneList = "Blight Ichor,200;Carrion Crawler Mucus,200;Drow Poison,200;Elephant,200;Serpent Venom,200;Splint Armor,200;Chariot,250;Malice,250;Pale Tincture,250;Black Sap,300;Essence of Ether,300;Breastplate,400;Moorbounder,400;Oil of Taggit,400;Warhorse,400;Burnt Othur Fumes,500;Platinum,500;Pride Silk Outfit,500;Vial of Stardust,500;Torpor,600;Half Plate Armor,750";
                } else if (rand>99) {
                    mundaneList = "Adamantine Bar,1000;Spyglass,1000;Wyvern Poison,1200;Midnight Tears,1500;Plate Armor,1500;Purple Worm Poison,2000;Keelboat,3000;Longship,10000;Airship,20000;Warship,25000;Galley,30000;Skyship,100000"
                }
                break;
            case 'very rare,legendary':
                rand = randomInteger(100);
                if (rand<=99) {
                    mundaneList = "Blight Ichor,200;Carrion Crawler Mucus,200;Drow Poison,200;Elephant,200;Serpent Venom,200;Splint Armor,200;Chariot,250;Malice,250;Pale Tincture,250;Black Sap,300;Essence of Ether,300;Breastplate,400;Moorbounder,400;Oil of Taggit,400;Warhorse,400;Burnt Othur Fumes,500;Platinum,500;Pride Silk Outfit,500;Vial of Stardust,500;Torpor,600;Half Plate Armor,750";
                } else if (rand>99) {
                    mundaneList = "Adamantine Bar,1000;Spyglass,1000;Wyvern Poison,1200;Midnight Tears,1500;Plate Armor,1500;Purple Worm Poison,2000;Keelboat,3000;Longship,10000;Airship,20000;Warship,25000;Galley,30000;Skyship,100000"
                }
                break;
        }
        
        var itemsList = mundaneList.split(";");
        var len = itemsList.length;
        var number = randomInteger(len) - 1;
        var item = itemsList[number];
        
        var selected = item.split(',');
        var mundane;
        var price;
        
        mundane = selected[0];
        price = selected[1];
      
        item = mundane + ',' + price;
        return item;  
    },
    
    checkInstall = function() {
        if(typeof state.store == "undefined"){
            setDefaults();
        }
        
        if ( state.store.now.version != version ){
            checkDefaults();
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
on("ready",function(){
	'use strict';
	MagicStore.CheckInstall();
	MagicStore.RegisterEventHandlers();
});
