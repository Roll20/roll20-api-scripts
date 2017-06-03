on("ready", function() {
    on("chat:message", function (msg) {
        if (msg.type === "api" && msg.content === "!MediumLoot")  {
            Loot('medium');
        }
        if (msg.type === "api" && msg.content === "!MinorLoot")  {
            Loot('minor');
        }
    });
    
});

function Loot(lootlevel){
    var d100 = Math.floor((Math.random() * 100) + 1);
    var treasure = "";
    if (lootlevel === "minor"){
        switch (true) {
            case (0<=d100 && d100<=34):
                treasure = "coinsMinor";
                break;
            case (35<=d100 && d100<=59):
                treasure = "advGear";
                break;
            case (60<=d100 && d100<=76):
                treasure = "weapon";
                break;
            case (77<=d100 && d100<=90):
                treasure = "armor";
                break;
            case (91<=d100 && d100<=97):
                treasure = "magItemA";
                break
            case (98<=d100 && d100<=100):
                treasure = "magItemB";
                break;
            default:
                break;
        }
        
    }
    
    if (lootlevel === "medium"){
        switch (true) {
            case (0<=d100 && d100<=20):
                treasure = "coinsMedium";
                break;
            case (21<=d100 && d100<=40):
                treasure = "advGear";
                break;
            case (41<=d100 && d100<=58):
                treasure = "weapon";
                break;
            case (59<=d100 && d100<=72):
                treasure = "armor";
                break;
            case (73<=d100 && d100<=82):
                treasure = "magItemA";
                break
            case (83<=d100 && d100<=89):
                treasure = "magItemB";
                break;
            case (90<=d100 && d100<=94):
                treasure = "magItemC";
                break;
            case (95<=d100 && d100<=97):
                treasure = "magItemD";
                break;
            case (98<=d100 && d100<=99):
                treasure = "magItemE";
                break;
            case (d100===100):
                treasure = "magItemF";
                break;
            default:
                break;
        }
        
    }
    
    if (treasure === "coinsMinor"){
        Coins('minor');
    }
    if (treasure === "coinsMedium"){
        Coins('medium');
    }
    if (treasure === "advGear"){
        advGear();
    }
    if (treasure === "weapon"){
        Weapon();
    }
    if (treasure === "armor"){
        Armor();
    }
    if (treasure === "magItemA"){
        MagItemA();
    }
    if (treasure === "magItemB"){
        MagItemB();
    }
    if (treasure === "magItemC"){
        MagItemC();
    }
    if (treasure === "magItemD"){
        MagItemD();
    }
    if (treasure === "magItemE"){
        MagItemE();
    }
    if (treasure === "magItemF"){
        MagItemF();
    }
}

function Coins(lootlevel){
    var coinMag;
    var CP = 0;
    var SP = 0;
    var EP = 0;
    var GP = 0;
    var PP = 0;
    var Gems = 0;
    if (lootlevel === "minor"){
        coinMag = 1;
    }
    else if (lootlevel === "medium"){
        coinMag = 2;
    }
    var noCoins = true;
    var noGems = true;
    var d100; //= Math.floor((Math.random() * 100) + 1);
    var d6; //= Math.floor((Math.random() * 6) + 1);
    do {
        d100 = Math.floor((Math.random() * 100) + 1);
        if (d100 > 70){
            for (i = 0; i < 5*coinMag; i++) { 
                d6 = Math.floor((Math.random() * 6) + 1);
                CP += d6;
            }
            noCoins = false;
            
        }
        d100 = Math.floor((Math.random() * 100) + 1);
        if (d100 > 70){
            for (i = 0; i < 4*coinMag; i++) { 
                d6 = Math.floor((Math.random() * 6) + 1);
                SP += d6;
            }
            noCoins = false;
        }
        d100 = Math.floor((Math.random() * 100) + 1);
        if (d100 > 94){
           for (i = 0; i < 3*coinMag; i++) { 
                d6 = Math.floor((Math.random() * 6) + 1);
                EP += d6;
            }
            noCoins = false;
        }
        d100 = Math.floor((Math.random() * 100) + 1);
        if (d100 > 80){
            for (i = 0; i < 3*coinMag; i++) { 
                d6 = Math.floor((Math.random() * 6) + 1);
                GP += d6;
            }
            noCoins = false;
        }
        d100 = Math.floor((Math.random() * 100) + 1);
        if (d100 > 96){
            for (i = 0; i < 1*coinMag; i++) { 
                d6 = Math.floor((Math.random() * 6) + 1);
                PP += d6;
            }
            noCoins = false;
        }
        d100 = Math.floor((Math.random() * 100) + 1);
        if (d100 > 90){
            d3 = Math.floor((Math.random() * 3) + 1);
            Gems = 1*d3
            noCoins = false;
            noGems = false;
        }
        
    }
    while (noCoins === true);
    
    sendChat("", "/em You found some coins!");
    sendChat("", "/em CP: " + CP);
    sendChat("", "/em SP: " + SP);
    sendChat("", "/em EP: " + EP);
    sendChat("", "/em GP: " + GP);
    sendChat("", "/em PP: " + PP);
    if (lootlevel === "minor"){
        sendChat("", "/em 10 GP Gems: " + Gems);
        //10 gp gemtype
    }
    else if (lootlevel === "medium"){
        sendChat("", "/em 50 GP Gems: " + Gems);
        //50 gp gemtype
    }
    
        
}

function advGear(){
    var aGear = ["Abacus", "Acid Vial", "Alchimists Fire Flask", "Ammunition", "20 Arrows", "50 Blowgun Needles", "20 Crossbow Bolts", "20 Sling Bullets",
    "Antitoxin Vial", "Arcane Focus Crystal", "Arcane Focus Orb", "Arcane Focus Rod", "Arcane Focus Staff", "Arcane Focus Wand", "Backpack", 
    "Ball Bearings (1000)", "Barrel", "Basket", "Bedroll", "Bell", "Blanket", "Block and tackle", "Book", "Glass Bottle", "Bucket", "Caltrops (20)",
    "Candle", "Case (crossbow bolt)", "Case (map or scroll)", "Chaint (10 feet)", "Chalk (1 piece)", "Chest", "Climber's Kit", "Common Clothes",
    "Costume Clothes", "Fine Clothes", "Traveler's Clothes", "Component pouch", "Crowbar", "Druidic Focus Sprig of Mistletoe",
    "Druidic Focus Totem", "Druidic Focus Wooden Staff", "Druidic Focus Yew Wand", "Fishing Tackle", "Flask or tankard", "Grappling hook",
    "Hammer", "Hammer (sledge)", "Healer's Kit", "Holy Symbol Amulet", "Holy Symbol Emblem", "Holy Symbol Reliquary", "Holy Water Flask",
    "Hourglass", "Hunting trap", "Ink (1 ounce bottle)", "Ink pen", "Jug or pitcher", "Ladder (10 foot)", "Lamp", "Lantern Bullseye",
    "Lantern Hooded", "Lock", "Magnifying Glass", "Manacles", "Mess Kit", "Steel Mirror", "Oil Flask", "Paper Sheet", "Parchment Sheet",
    "Perfume Vial", "10 foot Pole", "Miner's Pick", "Piton", "Basic poison vial", "Iron pot", "Potion of healing", "Pouch", "Quiver", "Portable Ram",
    "1 day's rations", "Robes", "Hempen Rope (50 ft)", "Silk Rope (50 ft)", "Sack", "Merchant's Scale", "Sealing Wax", "Shovel", "Signal Whistle",
    "Signet ring", "Soap", "Spellbook", "Iron Spikes (10)", "Spyglass", "Two person tent", "Tinderbox", "Torch", "Vial", "Waterskin", "Whetstone"];
    //var aGearLength = 100;
    var aGearLength = aGear.length;
    var Gear = aGear[Math.floor((Math.random() * aGearLength))];
    sendChat("", "/em You found some adventuring gear!");
    sendChat("","/em " + Gear);
}

function Weapon(){
    var aWeapons = ["Club", "Dagger", "Greatclub", "Handaxe", "Javelin", "Light Hammer", "Mace", "Quarterstaff", "Sickle", "Spear", "Light Crossbow",
    "Dart", "Shortbow", "Sling", "Battleaxe", "Flail", "Glaive", "Greataxe", "Greatsword", "Halberd", "Lance", "Longsword", "Maul", "Morningstar",
    "Pike", "Rapier", "Scimitar", "Shortsword", "Trident", "War Pick", "Warhammer", "Whip", "Blowgun", "Hand Crossbow", "Heavy Crossbow", "Longbow",
    "Net"];
    var aWeaponsLength = aWeapons.length;
    var weapon = aWeapons[Math.floor((Math.random() * aWeaponsLength))];
    sendChat("", "/em You found a weapon!");
    sendChat("","/em " + weapon);
}

function Armor(){
    var aArmors = ["Padded Armor", "Padded Armor", "Padded Armor", "Leather Armor","Leather Armor","Leather Armor","Leather Armor",
    "Leather Armor","Studded Leather Armor","Studded Leather Armor","Studded Leather Armor","Studded Leather Armor","Hide Armor", "Hide Armor",
    "Hide Armor", "Chain Shirt","Chain Shirt", "Scale Mail","Scale Mail","Scale Mail","Breastplate", "Breastplate", "Half Plate", "Ring Mail",
    "Ring Mail","Ring Mail", "Chain Mail","Chain Mail","Splint Armor", "Plate Armor", "Shield","Shield","Shield","Shield",];
    var aArmorsLength = aArmors.length;
    var armor = aArmors[Math.floor((Math.random() * aArmorsLength))];
    sendChat("", "/em You found an armor!");
    sendChat("","/em " + armor);
}

function MagItemA(){
    var d100 = Math.floor((Math.random() * 100) + 1);
    var treasure = "";
    if (d100 <= 50){
        treasure = "Potion of healing";
    }
    else if (51<= d100 && d100 <= 60){
        treasure = "Spell Scroll Cantrip";
    }
    else if (61 <= d100 && d100 <= 70){
        treasure = "Potion of climbing";
    }
    else if (71 <= d100 && d100 <= 90){
        treasure = "Spell Scroll Level 1";
    }
    else if (91 <= d100 && d100 <= 94){
        treasure = "Spell Scroll Level 2";
    }
    else if (95 <= d100 && d100 <= 98){
        treasure = "Potion of greater healing";
    }
    else if (d100 === 99){
        treasure = "Bag of Holding";
    }
    else if (d100 === 100){
        treasure = "Driftglobe";
    }
    
    sendChat("", "/em You found a magic item!");
    sendChat("","/em " + treasure);
}

function MagItemB(){
    var d100 = Math.floor((Math.random() * 100) + 1);
    var treasure = "";
    if (d100 <= 15){
        treasure = "Potion of greater healing";
    }
    else if (16 <= d100 && d100 <= 22){
        treasure = "Potion of Fire Breath";
    }
    else if (23 <= d100 && d100 <= 29){
        treasure = "Potion of resistance";
    }
    else if (30 <= d100 && d100 <= 34){
        treasure = "Ammunition +1";
    }
    else if (35 <= d100 && d100 <= 39){
        treasure = "Potion of Animal Friendship";
    }
    else if (40 <= d100 && d100 <= 44){
        treasure = "Potion of hill giant strength";
    }
    else if (45 <= d100 && d100 <= 49){
        treasure = "Potion of growth";
    }
    else if (50 <= d100 && d100 <= 54){
        treasure = "Potion of water breathing";
    }
    else if (55 <= d100 && d100 <= 59){
        treasure = "Spell Scroll Level 2";
    }
    else if (60 <= d100 && d100 <= 64){
        treasure = "Spell Scroll Level 3";
    }
    else if (65 <= d100 && d100 <= 67){
        treasure = "Bag of Holding";
    }
    else if (68 <= d100 && d100 <= 70){
        treasure = "Keoghtom's ointment";
    }
    else if (71 <= d100 && d100 <= 73){
        treasure = "Oil of slipperiness";
    }
    else if (74 <= d100 && d100 <= 75){
        treasure = "Dust of disappearance";
    }
    else if (76 <= d100 && d100 <= 77){
        treasure = "Dust of dryness";
    }
    else if (78 <= d100 && d100 <= 79){
        treasure = "Dust of sneazing and choking";
    }
    else if (80 <= d100 && d100 <= 81){
        treasure = "Elemental gem";
    }
    else if (82 <= d100 && d100 <= 83){
        treasure = "Philter of love";
    }
    else if (d100 === 84){
        treasure = "Alchemy Jug";
    }
    else if (d100 === 85){
        treasure = "Cap of water breathing";
    }
    else if (d100 === 86){
        treasure = "Cloak of the manta ray";
    }
    else if (d100 === 87){
        treasure = "Driftglobe";
    }
    else if (d100 === 88){
        treasure = "Goggles of night";
    }
    else if (d100 === 89){
        treasure = "Helm of comprehend languages";
    }
    else if (d100 === 90){
        treasure = "Immovable rod";
    }
    else if (d100 === 91){
        treasure = "Lantern of revealing";
    }
    else if (d100 === 92){
        treasure = "Mariner's Armor";
    }
    else if (d100 === 93){
        treasure = "Mithral armor";
    }
    else if (d100 === 94){
        treasure = "Potion of healing";
        sendChat("", "/w gm actually potion of poison");
    }
    else if (d100 === 95){
        treasure = "Ring of swimming";
    }
    else if (d100 === 96){
        treasure = "Robe of useful items";
    }
    else if (d100 === 97){
        treasure = "Rope of climbing";
    }
    else if (d100 === 98){
        treasure = "Saddle of the cavalier";
    }
    else if (d100 === 99){
        treasure = "Wand of magic detection";
    }
    else if (d100 === 100){
        treasure = "Wand of secrets";
    }
    
    sendChat("", "/em You found a magic item!");
    sendChat("","/em " + treasure);
}

function MagItemC(){
    var d100 = Math.floor((Math.random() * 100) + 1);
    var treasure = "";
    if (d100 <= 15){
        treasure = "Potion of superior healing";
    }
    else if (16 <= d100 && d100 <= 22){
        treasure = "Spell Scroll Level 4";
    }
    else if (23<= d100 && d100 <=27){
        treasure = "Ammunition +2";
    }
    else if (28<= d100 && d100 <=32){
        treasure = "Potion of clairvoyance";
    }
    else if (33<= d100 && d100 <=37){
        treasure = "Potion of diminution";
    }
    else if (38<= d100 && d100 <=42){
        treasure = "Potion of gaseous form";
    }
    else if (43<= d100 && d100 <=47){
        treasure = "Potion of frost giant strength";
    }
    else if (48<= d100 && d100 <=52){
        treasure = "Potion of stone giant strength";
    }
    else if (53<= d100 && d100 <=57){
        treasure = "Potion of heroism";
    }
    else if (58<= d100 && d100 <=62){
        treasure = "Potion of invulnerability";
    }
    else if (63<= d100 && d100 <=67){
        treasure = "Potion of mind reading";
    }
    else if (68<= d100 && d100 <=72){
        treasure = "Spell Scroll Level 5";
    }
    else if (73<= d100 && d100 <=75){
        treasure = "Elixir of health";
    }
    else if (76<= d100 && d100 <=78){
        treasure = "Oil of etherealness";
    }
    else if (79<= d100 && d100 <=81){
        treasure = "Potion of fire giant strength";
    }
    else if (82<= d100 && d100 <=84){
        treasure = "Quall's feather token";
    }
    else if (85<= d100 && d100 <=87){
        treasure = "Scroll of protection";
    }
    else if (88<= d100 && d100 <=89){
        treasure = "Bag of beans";
    }
    else if (90<= d100 && d100 <=91){
        treasure = "Bead of force";
    }
    else if (d100 ===92){
        treasure = "Chime of opening";
    }
    else if (d100 === 93){
        treasure = "Decanter of endless water";
    }
    else if (d100 === 94){
        treasure = "Eyes of minute seeing";
    }
    else if (d100 === 95){
        treasure = "Folding boat";
    }
    else if (d100 ===96 ){
        treasure = "Heward's handy haversack";
    }
    else if (d100 ===97 ){
        treasure = "Horseshoes of speed";
    }
    else if (d100 ===98 ){
        treasure = "Necklace of fireballs";
    }
    else if (d100 ===99 ){
        treasure = "Periapt of health";
    }
    else if (d100 ===100 ){
        treasure = "Sending stones";
    }
    sendChat("", "/em You found a magic item!");
    sendChat("","/em " + treasure);
}

function MagItemD(){
    var d100 = Math.floor((Math.random() * 100) + 1);
    var treasure = "";
    if (d100 <=20){
        treasure = "Potion of supreme healing";
    }
    else if (21<= d100 && d100 <=30){
        treasure = "Potion of invisibility";
    }
    else if (31<= d100 && d100 <=40){
        treasure = "Potion of speed";
    }
    else if (41<= d100 && d100 <=50){
        treasure = "Spell Scroll Level 6";
    }
    else if (51<= d100 && d100 <=57){
        treasure = "Spell Scroll Level 7";
    }
    else if (58<= d100 && d100 <=62){
        treasure = "Ammunition + 3";
    }
    else if (63<= d100 && d100 <=67){
        treasure = "Oil of Sharpness";
    }
    else if (68<= d100 && d100 <=72){
        treasure = "Potion of Flying";
    }
    else if (73<= d100 && d100 <=77){
        treasure = "Potion of Cloud Giant Strength";
    }
    else if (78<= d100 && d100 <=82){
        treasure = "Potion of Longevity";
    }
    else if (83<= d100 && d100 <=87){
        treasure = "Potion of vitality";
    }
    else if (88<= d100 && d100 <=92){
        treasure = "Spell Scroll Level 8";
    }
    else if (93<= d100 && d100 <=95){
        treasure = "Horseshoes of the zephyr";
    }
    else if (96<= d100 && d100 <=98){
        treasure = "Nolzur's Marvelous Pigments";
    }
    else if (d100 ===99){
        treasure = "Bag of holding";
        sendChat("", "/w gm actually bag of devouring");
    }
    else if (d100 ===100){
        treasure = "Portable hole";
    }
    sendChat("", "/em You found a magic item!");
    sendChat("","/em " + treasure);
}

function MagItemE(){
    var d100 = Math.floor((Math.random() * 100) + 1);
    var treasure = "";
    if (d100 <=30){
        treasure = "Spell Scroll Level 8";
    }
    else if (31<= d100 && d100 <=55){
        treasure = "Potion of storm giant strength";
    }
    else if (56<= d100 && d100 <=70){
        treasure = "Potion of supreme healing";
    }
    else if (71<= d100 && d100 <=85){
        treasure = "Spell Scroll Level 9";
    }
    else if (86<= d100 && d100 <=93){
        treasure = "Universal solvent";
    }
    else if (94<= d100 && d100 <=98){
        treasure = "Arrow of slaying";
    }
    else if (99<= d100 && d100 <=100){
        treasure = "Sovereign glue";
    }
    sendChat("", "/em You found a magic item!");
    sendChat("","/em " + treasure);
}

function MagItemF(){
    var d100 = Math.floor((Math.random() * 100) + 1);
    var treasure = "";
    if (d100 <=15){
        treasure = "Weapon + 1";
    }
    else if (16<= d100 && d100 <=18){
        treasure = "Shield +1";
    }
    else if (19<= d100 && d100 <=21){
        treasure = "Sentinel Shield";
    }
    else if (22<= d100 && d100 <=23){
        treasure = "Amulet of proof against detection and location";
    }
    else if (24<= d100 && d100 <=25){
        treasure = "Boots of elvenkind";
    }
    else if (26<= d100 && d100 <=27){
        treasure = "Boots of striding and springing";
    }
    else if (28<= d100 && d100 <=29){
        treasure = "Bracers of archery";
    }
    else if (30<= d100 && d100 <=31){
        treasure = "Brooch of shielding";
    }
    else if (32<= d100 && d100 <=33){
        treasure = "Broom of flying";
    }
    else if (34<= d100 && d100 <=35){
        treasure = "Cloak of elvenkind";
    }
    else if (36<= d100 && d100 <=37){
        treasure = "Cloak of protection";
    }
    else if (38<= d100 && d100 <=39){
        treasure = "Gauntlets of ogre power";
    }
    else if (40<= d100 && d100 <=41){
        treasure = "Hat of disguise";
    }
    else if (42<= d100 && d100 <=43){
        treasure = "Javelin of lightning";
    }
    else if (44<= d100 && d100 <=45){
        treasure = "Pearl of power";
    }
    else if (46<= d100 && d100 <=47){
        treasure = "Rod of the pact keeper + 1";
    }
    else if (48<= d100 && d100 <=49){
        treasure = "Slippers of spider climbing";
    }
    else if (50<= d100 && d100 <=51){
        treasure = "Staff of the adder";
    }
    else if (52<= d100 && d100 <=53){
        treasure = "Staff of the python";
    }
    else if (54<= d100 && d100 <=55){
        treasure = "Sword of wounding";
        sendChat("", "/w gm actually a sword of vengeance");
    }
    else if (56<= d100 && d100 <=57){
        treasure = "Trident of fish command";
    }
    else if (58<= d100 && d100 <=59){
        treasure = "Wand of magic missiles";
    }
    else if (60<= d100 && d100 <=61){
        treasure = "Wand of the war mage +1";
    }
    else if (62<= d100 && d100 <=63){
        treasure = "Wand of Web";
    }
    else if (64<= d100 && d100 <=65){
        treasure = "Weapon of warning";
    }
    else if (d100 ===66){
        treasure = "Adamantine Chain Mail";
    }
    else if (d100 ===67){
        treasure = "Adamantine Chain Shirt";
    }
    else if (d100 ===68){
        treasure = "Adamantine Scale Mail";
    }
    else if (d100 ===69){
        treasure = "Bag of Tricks (Gray)";
    }
    else if (d100 ===70){
        treasure = "Bag of tricks (Rust)";
    }
    else if (d100 ===71){
        treasure = "Bag of Tricks (Tan)";
    }
    else if (d100 ===72){
        treasure = "Boots of the Winterlands";
    }
    else if (d100 ===73){
        treasure = "Circlet of blasting";
    }
    else if (d100 ===74){
        treasure = "Deck of illusions";
    }
    else if (d100 ===75){
        treasure = "Eversmoking bottle";
    }
    else if (d100 ===76){
        treasure = "Eyes of charming";
    }
    else if (d100 ===77){
        treasure = "Eyes of the eagle";
    }
    else if (d100 ===78){
        treasure = "Figuring of wonderous power (silver raven)";
    }
    else if (d100 ===79){
        treasure = "Gem of brightness";
    }
    else if (d100 ===80){
        treasure = "Gloves of missile snaring";
    }
    else if (d100 ===81){
        treasure = "Gloves of swimming and climbing";
    }
    else if (d100 ===82){
        treasure = "Gloves of thievery";
    }
    else if (d100 ===83){
        treasure = "Headband of intellect";
    }
    else if (d100 ===84){
        treasure = "Helm of telepathy";
    }
    else if (d100 ===85){
        treasure = "Instument of the bards (Doss Lute)";
    }
    else if (d100 ===86){
        treasure = "Instument of the bards (Fochlucan bandore)";
    }
    else if (d100 ===87){
        treasure = "Instument of the bards (Mac-Fuimidh cittern)";
    }
    else if (d100 ===88){
        treasure = "Medallion of thoughts";
    }
    else if (d100 ===89){
        treasure = "Necklace of adaptation";
    }
    else if (d100 ===90){
        treasure = "Periapt of wound closure";
    }
    else if (d100 ===91){
        treasure = "Pipes of haunting";
    }
    else if (d100 ===92){
        treasure = "Pipes of the sewers";
    }
    else if (d100 ===93){
        treasure = "Ring of jumping";
    }
    else if (d100 ===94){
        treasure = "Ring of mind shielding";
    }
    else if (d100 ===95){
        treasure = "Ring of warmth";
    }
    else if (d100 ===96){
        treasure = "Ring of water walking";
    }
    else if (d100 ===97){
        treasure = "Quiver of Ehlonna";
    }
    else if (d100 ===98){
        treasure = "Stone of good luck";
    }
    else if (d100 ===99){
        treasure = "Wind fan";
    }
    else if (d100 ===100){
        treasure = "Winged boots";
    }
    sendChat("", "/em You found a magic item!");
    sendChat("","/em " + treasure);
}
    