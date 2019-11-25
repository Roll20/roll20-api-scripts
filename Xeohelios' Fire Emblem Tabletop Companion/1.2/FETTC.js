/*jshint esversion: 6 */
//credit to Brian on the forums for this framework!
function ManhDist(token1,token2) { //Manhattan Distance in tiles between two units
    let AXCoord = token1.get("left");
    let AYCoord = token1.get("top");
    let BXCoord = token2.get("left");
    let BYCoord = token2.get("top");
    let diff = parseInt((Math.abs(AXCoord - BXCoord))+(Math.abs(AYCoord - BYCoord)));
    return (diff/70)
}

on('chat:message', function(msg) {
    if (msg.type != 'api') return;
    var parts = msg.content.split(' ');
    var command = parts.shift().substring(1);
    var turnorder;
    var turncounter;
    if (Campaign().get("turnorder") == "") turnorder = [];
    else turnorder = JSON.parse(Campaign().get("turnorder"));
    for (i in turnorder){
        if (turnorder[i].custom == "Turn Counter"){
            turncounter = turnorder[i]
        }
    }
    let n = turncounter.pr ||0
    //log(turncounter)

    // Don't run if it's any other command
    if (command == 'combat') {
        if (parts.length < 2) {
            sendChat('SYSTEM', 'You must provide a selected token id and a target token id.');
            return;
        }

        var selectedId = parts[0];
        var targetId = parts[1];

        // Grab tokens
        var selectedToken = getObj('graphic', selectedId);
        var targetToken = getObj('graphic', targetId);

        // Check if the objects aren't tokens or if the passed parameters aren't ids
        if (!selectedToken) {
            sendChat('SYSTEM', 'Selected token id not provided.');
            return;
        }
        if (!targetToken) {
            sendChat('SYSTEM', 'Target token id not provided.');
            return;
        }
        log(selectedToken.get('represents'));
        log(targetToken.get('represents'));
        //Check to make sure that the tokens represent characters
        if (selectedToken.get('represents') === "" || targetToken.get('represents') === ""){
            sendChat('SYSTEM', 'Both tokens must be linked to characters in the journal!');
            return;
        }

        // Get a variable to use as the "who" for sendChat
        var who = getObj('character', selectedToken.get('represents'));
        if (!who) {
            who = selectedToken.get('name');
        } else {
            who = 'character|' + who.id;
        }
        var who2 = getObj('character', targetToken.get('represents'));
        if (!who2) {
            who2 = targetToken.get('name');
        } else {
            who2 = 'character|' + who2.id;
        }
        var attacker = getObj('character', selectedToken.get('represents'));
        var defender = getObj('character', targetToken.get('represents'));
        let AName = attacker.get('name');
        let DName = defender.get('name');
        sendChat(who, '/em attacks ' + DName + '!\n')
        let Chatstr = '';

        //Grab basic stats
        let CurrHPA = findObjs({ characterid: attacker.id, name: "HP_current"})[0];
        let CurrHPB = findObjs({ characterid: defender.id, name: "HP_current"})[0];
        let CurrEXP = findObjs({ characterid: attacker.id, name: "EXP"})[0];
        let LvA = findObjs({ characterid: attacker.id, name: "Level"})[0];
        let InLvA = Number(LvA.get("current"));
        let LvB = findObjs({ characterid: defender.id, name: "Level"})[0];
        let InLvB = Number(LvB.get("current"));
        let EXPA = Number(CurrEXP.get("current"));
        let IsPromoA = getAttrByName(attacker.id, 'isPromo');
        let IsPromoB = getAttrByName(defender.id, 'isPromo');
        let HPA = Number(getAttrByName(attacker.id, 'hp_current'));
        let HPB = Number(getAttrByName(defender.id, 'hp_current'));
        let StrA = Number(getAttrByName(attacker.id, 'str_total'));
        let StrB = Number(getAttrByName(defender.id, 'str_total'));
        let MagA = Number(getAttrByName(attacker.id, 'mag_total'));
        let MagB = Number(getAttrByName(defender.id, 'mag_total'));
        let SklA = Number(getAttrByName(attacker.id, 'skl_total'));
        let SklB = Number(getAttrByName(defender.id, 'skl_total'));
        let SpdA = Number(getAttrByName(attacker.id, 'spd_total'));
        let SpdB = Number(getAttrByName(defender.id, 'spd_total'));
        let LckA = Number(getAttrByName(attacker.id, 'lck_total'));
        let LckB = Number(getAttrByName(defender.id, 'lck_total'));
        let DefA = Number(getAttrByName(attacker.id, 'def_total'));
        let DefB = Number(getAttrByName(defender.id, 'def_total'));
        let ResA = Number(getAttrByName(attacker.id, 'res_total'));
        let ResB = Number(getAttrByName(defender.id, 'res_total'));

        //Grab weapon stats
        let WNameA = getAttrByName(attacker.id, 'repeating_weapons_$0_WName') || "Empty";
        let WNameB = getAttrByName(defender.id, 'repeating_weapons_$0_WName') || "Empty";
        let WTypeA = getAttrByName(attacker.id, 'repeating_weapons_$0_WType') || "Stones/Other";
        let WTypeB = getAttrByName(defender.id, 'repeating_weapons_$0_WType') || "Stones/Other";
        let MtA = parseInt(getAttrByName(attacker.id, 'repeating_weapons_$0_Mt')) || 0;
        let MtB = parseInt(getAttrByName(defender.id, 'repeating_weapons_$0_Mt')) || 0;
        let WtA = parseInt(getAttrByName(attacker.id, 'repeating_weapons_$0_Wt')) || 0;
        let WtB = parseInt(getAttrByName(defender.id, 'repeating_weapons_$0_Wt')) || 0;
        let Range1A = parseInt(getAttrByName(attacker.id, 'repeating_weapons_$0_Range1')) || 1;
        let Range1B = parseInt(getAttrByName(defender.id, 'repeating_weapons_$0_Range1')) || 1;
        let Range2A = parseInt(getAttrByName(attacker.id, 'repeating_weapons_$0_Range2')) || 1;
        let Range2B = parseInt(getAttrByName(defender.id, 'repeating_weapons_$0_Range2')) || 1;
        let WRankA = getAttrByName(attacker.id, 'repeating_weapons_$0_WRank') || "E";
        let WRankB = getAttrByName(defender.id, 'repeating_weapons_$0_WRank') || "E";
        let fIDA = getAttrByName(attacker.id, 'fid')|| ""
        let fIDB = getAttrByName(defender.id, 'fid')|| ""
        log(fIDA)
        log(fIDB)
        let UsesA;
        let UsesB;
        let AOEA = getAttrByName(attacker.id, "repeating_weapons_$0_AOE");
        let AOEB = getAttrByName(defender.id, "repeating_weapons_$0_AOE");
        log("AOE is " + AOEA)
        log("AOE is " + AOEB)
        //check for no rows
        if (fIDA == ""){
            UsesA = 68932;
            log("No weapon! :0");
        } else {
            UsesA = findObjs({ characterid: attacker.id, name: "repeating_weapons_"+fIDA+"_Uses"},{ caseInsensitive: true })[0];
        }
        if (fIDB == ""){
            UsesB = 68932;
        } else {
            UsesB = findObjs({ characterid: defender.id, name: "repeating_weapons_"+fIDB+"_Uses"},{ caseInsensitive: true })[0];
        }
        log(UsesA);
        log(UsesB);
        let StrengthsA = getAttrByName(attacker.id, "repeating_weapons_$0_Strengths") || "";
        let StrengthsB = getAttrByName(defender.id, "repeating_weapons_$0_Strengths") || "";
        let WeaknessA = getAttrByName(attacker.id, 'weaknesses');
        let WeaknessB = getAttrByName(defender.id, 'weaknesses');
        //Weapon exp
        let SwordEXP = findObjs({ characterid: attacker.id, name: "SwordEXP", type: "attribute"})[0];
        let LanceEXP = findObjs({ characterid: attacker.id, name: "LanceEXP", type: "attribute"})[0];
        let AxeEXP = findObjs({ characterid: attacker.id, name: "AxeEXP", type: "attribute"})[0];
        let BowEXP = findObjs({ characterid: attacker.id, name: "BowEXP", type: "attribute"})[0];
        let DaggerEXP = findObjs({ characterid: attacker.id, name: "GunEXP", type: "attribute"})[0];
        let GunEXP = findObjs({ characterid: attacker.id, name: "GunEXP", type: "attribute"})[0];
        let DarkEXP = findObjs({ characterid: attacker.id, name: "DarkEXP", type: "attribute"})[0];
        let LightEXP = findObjs({ characterid: attacker.id, name: "LightEXP", type: "attribute"})[0];
        let AnimaEXP = findObjs({ characterid: attacker.id, name: "AnimaEXP", type: "attribute"})[0];
        let StoneEXP = findObjs({ characterid: attacker.id, name: "StoneEXP", type: "attribute"})[0];
        let StaffEXP = findObjs({ characterid: attacker.id, name: "StaffEXP", type: "attribute"})[0];

        //Hit/crit/avo/dod
        let HitA = getAttrByName(attacker.id, 'hit');
        let HitB = getAttrByName(defender.id, 'hit');
        let CritA = getAttrByName(attacker.id, 'crit');
        let CritB = getAttrByName(defender.id, 'crit');
        let AvoA = getAttrByName(attacker.id, 'avo');
        let AvoB = getAttrByName(defender.id, 'avo');
        let DdgA = getAttrByName(attacker.id, 'lck_total');
        let DdgB = getAttrByName(defender.id, 'lck_total');
        let DmgmodA = Number(getAttrByName(attacker.id, 'Dmgmod'));
        let DmgmodB = Number(getAttrByName(defender.id, 'Dmgmod'));

        //Grab weapon ranks
        let SwordUA = getAttrByName(attacker.id, 'SwordU');
        let LanceUA = getAttrByName(attacker.id, 'LanceU');
        let AxeUA = getAttrByName(attacker.id, 'AxeU');
        let BowUA = getAttrByName(attacker.id, 'BowU');
        let DaggerUA = getAttrByName(attacker.id, 'DaggerU');
        let GunUA = getAttrByName(attacker.id, 'GunU');
        let AnimaUA = getAttrByName(attacker.id, 'AnimaU');
        let LightUA = getAttrByName(attacker.id, 'LightU');
        let DarkUA = getAttrByName(attacker.id, 'DarkU');
        let StoneUA = getAttrByName(attacker.id, 'StoneU');
        let StaffUA = getAttrByName(attacker.id, 'StaffU');

        let SwordUB = getAttrByName(defender.id, 'SwordU');
        let LanceUB = getAttrByName(defender.id, 'LanceU');
        let AxeUB = getAttrByName(defender.id, 'AxeU');
        let BowUB = getAttrByName(defender.id, 'BowU');
        let DaggerUB = getAttrByName(defender.id, 'DaggerU');
        let GunUB = getAttrByName(defender.id, 'GunU');
        let AnimaUB = getAttrByName(defender.id, 'AnimaU');
        let LightUB = getAttrByName(defender.id, 'LightU');
        let DarkUB = getAttrByName(defender.id, 'DarkU');
        let StoneUB = getAttrByName(defender.id, 'StoneU');
        let StaffUB = getAttrByName(defender.id, 'StaffU');

        const PhysWepTypes = ["Sword/Katana","Lance/Nagin.","Axe/Club","Bow/Yumi","Dagger/Shurik.","Stones/Other"];
        const MWepTypes = ["Anima Magic","Light Magic","Dark Magic"];
        const WepTypes = ["Sword/Katana","Lance/Nagin.","Axe/Club","Bow/Yumi","Dagger/Shurik.","Firearm/Taneg.","Anima Magic","Light Magic","Dark Magic","Stones/Other","Staves/Rods"];
        const MagWeps = ["Levin Sword","Bolt Naginata","Bolt Axe","Shining Bow","Flame Shuriken"];
        const PhysWeps = ["Flame Glaive","Light Rapier","Shadow Hammer"];
        const WepRanks = [SwordEXP,LanceEXP,AxeEXP,BowEXP,DaggerEXP,GunEXP,AnimaEXP,LightEXP,DarkEXP,StoneEXP,StaffEXP];
        const WepUA = [SwordUA,LanceUA,AxeUA,BowUA,DaggerUA,GunUA,AnimaUA,LightUA,DarkUA,StoneUA,StaffUA];
        const WepUB = [SwordUB,LanceUB,AxeUB,BowUB,DaggerUB,GunUB,AnimaUB,LightUB,DarkUB,StoneUB,StaffUB];
        let DmgtypeA;
        let DmgtypeB;
        let DmgA;
        let DmgB;
        let DoubleA = false;
        let DoubleB = false;
        let QuadA = false;
        let QuadB = false;
        let CanAttackA = true;
        let CanAttackB = true;

        let SkillsA = findObjs({ characterid: attacker.id, type: "ability"});
        let SkillsB = findObjs({ characterid: defender.id, type: "ability"});

        //Weapon Rank threshold values
        let WRankA_num;
        let WRankB_num;
        const LRanks = [{num: 0, rank: "E"},{num: 30, rank: "D"},{num: 70, rank: "C"},{num: 120, rank: "B"},{num: 180, rank: "A"},{num: 250, rank: "S"},{num: 999, rank: "UU"}];
        //check for which rank
        for (var h in LRanks){
            if (LRanks[h].rank == WRankA){
                WRankA_num = LRanks[h].num;
            }
        }
        for (var j in LRanks){
            if (LRanks[j].rank == WRankB){
                WRankB_num = LRanks[j].num;
            }
        }
        log("Numerical weapon rank is " + WRankA_num);
        //Check to see if the weapon is usable
        if ((WepUA[WepTypes.indexOf(WTypeA)] == 1) && (WepRanks[WepTypes.indexOf(WTypeA)].get("current") >= WRankA_num)){
            log("Attacker's weapon is usable!");
        } else {
            log("Attacker's weapon is not usable!");
            CanAttackA = false;
        }
        if ((WepUB[WepTypes.indexOf(WTypeB)] == 1) && (WepRanks[WepTypes.indexOf(WTypeB)].get("current") >= WRankB_num)){
            log("Defender's weapon is usable!");
        } else {
            log("Defender's weapon is not usable!");
            CanAttackB = false;
        }
        //Check for weapon effectiveness- HAS TO BE BEFORE stat targeting calcs so it can factor in Mt.
        if ( ((SkillsA.filter(e => e.get("name") === 'Beastbane').length > 0) && WeaknessB.includes("Beast")) || ((SkillsA.filter(e => e.get("name") === 'Golembane').length > 0) && WeaknessB.includes("Construct")) || ( StrengthsA.includes("Beast") && WeaknessB.includes("Beast")) || ( StrengthsA.includes("Flier") && WeaknessB.includes("Flier")) || ( StrengthsA.includes("Dragon") && WeaknessB.includes("Dragon")) || ( StrengthsA.includes("Armor") && WeaknessB.includes("Armor")) || ( StrengthsA.includes("Monster") && WeaknessB.includes("Monster")) ){
            MtA *= 3;
            Chatstr += "Attacker has weapon effectiveness! \n";
        }
        if ( ((SkillsB.filter(e => e.get("name") === 'Beastbane').length > 0) && WeaknessA.includes("Beast")) || ((SkillsA.filter(e => e.get("name") === 'Golembane').length > 0) && WeaknessB.includes("Construct")) || ( StrengthsB.includes("Beast") && WeaknessA.includes("Beast")) || ( StrengthsB.includes("Flier") && WeaknessA.includes("Flier")) || ( StrengthsB.includes("Dragon") && WeaknessA.includes("Dragon")) || ( StrengthsB.includes("Armor") && WeaknessA.includes("Armor")) || ( StrengthsB.includes("Monster") && WeaknessA.includes("Monster")) ){
            MtB *= 3;
            Chatstr += "Defender has weapon effectiveness! \n";
        }

        //Targeted stat
        if ( (PhysWepTypes.includes(WTypeA))||(PhysWeps.includes(WNameA)) ){
            DmgtypeA = "Physical";
            DmgA = (StrA + MtA) - DefB;
        } else if ( (MWepTypes.includes(WTypeA))||(MagWeps.includes(WNameA)) ){
            DmgtypeA = "Magical";
            DmgA = (MagA + MtA) - ResB;
        }
        else if (WTypeA == "Firearm/Taneg.") {
            DmgtypeA = "Firearm";
            DmgA = MtA - DefB;
        } else {
            DmgtypeA = "Healing";
            DmgA = 0;
            Chatstr += "Unit cannot attack!";
            sendChat("System","Unit cannot attack!");
            return;
        }
        if (DmgA < 0){
            DmgA = 0;
        }
        DmgA += DmgmodA;
        //dark magic vs. tome bonuses
        if ((WTypeA == "Dark Magic") && (MagWeps.includes(WTypeB))){
            DmgA += 4
        }

        log(DmgtypeA);
        log(DmgA);
        if ( (PhysWepTypes.includes(WTypeB))||(PhysWeps.includes(WNameB)) ){
            DmgtypeB = "Physical";
            DmgB = (StrB + MtB) - DefA;
        } else if ( (MWepTypes.includes(WTypeB))||(MagWeps.includes(WNameB)) ){
            DmgtypeB = "Magical";
            DmgB = (MagB + MtB) - ResA;
        } else if (WTypeB == "Firearm/Taneg."){
            DmgtypeB = "Firearm";
            DmgB = MtB - DefA;
        } else {
            DmgtypeB = "Healing";
            DmgB = 0; //Set damage to 0 so you don't accidentally heal the enemy;
            CanAttackB = false;
        }
        if (DmgB < 0){
            DmgB = 0;
        }
        DmgB += DmgmodB
        if ((WTypeB == "Dark Magic") && (MagWeps.includes(WTypeA))){
            DmgB += 4
        }
        //check for doubling/braves
        if ( (SpdA - WtA) - (SpdB - WtB) > 5 ||  WNameA.toLowerCase().includes("brave")){
            DoubleA = true;
            log("Attacker can double!");
            if ( (SpdA - WtA) - (SpdB - WtB) > 5 &&  WNameA.toLowerCase().includes("brave")){
                QuadA = true;
                log("Attacker can quad!");
            }
        }
        if ( (SpdB - WtB) - (SpdA - WtA) > 5 ||  WNameB.toLowerCase().includes("brave")){
            DoubleB = true;
            log("Defender can double!");
            if ( (SpdB - WtB) - (SpdA - WtA) > 5 &&  WNameB.toLowerCase().includes("brave")){
                QuadB = true;
                log("Defender can quad!");
            }
        }

        //Check for WTA
        let WIndexA = WepTypes.indexOf(WTypeA)+ 1;
        let WIndexB = WepTypes.indexOf(WTypeB)+ 1;
        let WIN = WepTypes.indexOf(WTypeA);
        let CurrWR = WepRanks[WIN];
        let CWRVal = Number(CurrWR.get("current")); //Assume number because it's a numerical input
        log(CurrWR);
        log(CWRVal);
        if( (WIndexA == 1 && WIndexB == 3) || (WIndexA == 3 && WIndexB == 2) || (WIndexA == 2 && WIndexB == 1) || (WIndexA == 4 && WIndexB == 5) || (WIndexA == 5 && WIndexB == 6) || (WIndexA == 6 && WIndexB == 4) || (WIndexA == 7 && WIndexB == 8) || (WIndexA == 8 && WIndexB == 9) || (WIndexA == 9 && WIndexB == 7)) {
            DmgA +=1;
            HitA +=15;
            DmgB -= 1;
            HitB -=15;
            Chatstr += "Attacker has WTA! \n";
        }
        if( (WIndexA == 3 && WIndexB == 1) || (WIndexA == 2 && WIndexB == 3) || (WIndexA == 1 && WIndexB == 2) || (WIndexA == 5 && WIndexB == 4) || (WIndexA == 6 && WIndexB == 5) || (WIndexA == 4 && WIndexB == 6) || (WIndexA == 8 && WIndexB == 7) || (WIndexA == 9 && WIndexB == 8) || (WIndexA == 7 && WIndexB == 9)) {
            DmgA -=1;
            HitA -=15;
            DmgB += 1;
            HitB +=15;
            Chatstr += "Defender has WTA! \n";
        }
        if (DmgA < 0){
            DmgA = 0;
        }
        if (DmgB < 0){
            DmgB = 0;
        }
        if (typeof(UsesA) === "object"){
            function DecUsesA() {
                UsesA.setWithWorker({current: Number(UsesA.get("current")) - 1});
            }
            log("Is an object!");
        } else {
            log("Not an object!");
            function DecUsesA() {
                UsesA -= 1;
            }
        }
        if (typeof(UsesB) === "object"){
            function DecUsesB() {
                UsesB.setWithWorker({current: Number(UsesB.get("current")) - 1});
            }
            log("Is an object!");
        } else {
            log("Not an object!");
            function DecUsesB() {
                UsesB -= 1;
            }
        }

        for (var i in SkillsA){
            SkillsA[i] = SkillsA[i].get("action");
            if (SkillsA[i] != ""){
                SkillsA[i] = JSON.parse(SkillsA[i])
            }
        }
        log(SkillsA)

        for (var i in SkillsB){
            SkillsB[i] = SkillsB[i].get("action");
            if (SkillsB[i] != ""){
                SkillsB[i] = JSON.parse(SkillsB[i])
            }
        }
        log(SkillsB)
        //Skills system! :^)
        /*Here is an example of Speedtaker so I don't have to keep checking back to see what I used:
        {
        "name": "Speedtaker",
	    "triggertime": "before",
	    "u_wepreq": ["Sword/Katana","Lance/Nagin.","Axe/Club","Bow/Yumi","Dagger/Shurik.","Firearm/Taneg.","Anima Magic","Light Magic","Dark Magic","Stones/Other","Staves/Rods"],
	    "e_wepreq": ["Sword/Katana","Lance/Nagin.","Axe/Club","Bow/Yumi","Dagger/Shurik.","Firearm/Taneg.","Anima Magic","Light Magic","Dark Magic","Stones/Other","Staves/Rods"],
	    "whotriggered": "either",
	    "radius_effect": "none",
	    "physmagcond": false,
        "killcond": true,
        "rng": "any",
        "rngmod": "none",
   	    "u_healfactor": 0,
	    "e_healfactor": 0,
	    "u_hitmod": 0,
    	"e_hitmod": 0,
    	"u_critmod": 0,
    	"e_critmod": 0,
    	"u_avomod": 0,
    	"e_avomod": 0,
    	"u_ddgmod": 0,
    	"e_ddgmod": 0,
    	"physmag": false,
       	"u_damagemod": "0",
        "e_damagemod": "0",
    	"u_stat_target": "Spd",
    	"e_stat_target": "none",
    	"u_stat_targetmod": "2",
    	"e_stat_targetmod": 0,
    	"children_skills": []
        }
        */
        //stat initializations- technically, these do nothing in the main function because ~block scope~
        let user;
        let RNGSklU;
        let RNGLuckU;
        let CurrHPU;
        let CurrHPE;
        let HPU;
        let HPE;
        let StrU;
        let StrE;
        let MagU;
        let MagE;
        let SklU;
        let SklE;
        let SpdU;
        let SpdE;
        let LckU;
        let LckE;
        let DefU;
        let DefE;
        let ResU;
        let ResE;
        let HitU;
        let HitE;
        let CritU;
        let CritE;
        let AvoU;
        let AvoE;
        let DdgU;
        let DdgE;
        let DmgU;
        let DmgE;
        let DmgtypeU;
        let DmgtypeE;
        let PhysmagU;
        let PhysmagE;
        let PhysmaginvU;
        let PhysmaginvE;
        let StattargetU;
        let StattargetE;
        let Dmg_U;
        let Dmg_E;
        let EXPAmod = (10 + ((Math.abs(InLvB-InLvA)*3)));
        let WEXPA = 2;

        function Skill(userid,targetid,obj,triggertime) { //haha END ME
        if (typeof obj != "object"){
            log("obj is not an object :(")
            return;
        }
        if ((triggertime == obj.triggertime) && (((obj.whotriggered == "attacker") && (userid == attacker.id)) || ((obj.whotriggered == "defender") && (userid == defender.id)) || (obj.whotriggered == "either"))) {
            log("Okay, first barrier passed")
            if ((userid == attacker.id) && (obj.u_wepreq.indexOf(WTypeA) != -1) && (obj.e_wepreq.indexOf(WTypeB) != -1)) {
                //obj.u_wepreq is a list of weapon types (to account for Aegis/Pavise & other similar skills)
                //just change "any" to a list of all weapon types, I guess
                log("Skill user is attacker");
                user = "attacker";
                RNGSklU = SklA;
                RNGLckU = LckA;
                CurrHPU = CurrHPA;
                CurrHPE = CurrHPB;
                DmgtypeU = DmgtypeA;
                DmgtypeE = DmgtypeB;
                Usertoken = selectedToken;
                Enemtoken = targetToken;
                Dmg_U = DmgA; //just for expressions'sake
                Dmg_E = DmgB;

            } else if ((userid == defender.id) && (obj.u_wepreq.indexOf(WTypeB) != -1) && (obj.e_wepreq.indexOf(WTypeA) != -1)) {
                user = "defender";
                log("Skill user is defender")
                RNGSklU = SklB;
                RNGLckU = LckB;
                CurrHPU = CurrHPB;
                CurrHPE = CurrHPA;
                DmgtypeU = DmgtypeB;
                DmgtypeE = DmgtypeA;
                Usertoken = targetToken;
                Enemtoken = selectedToken;
                Dmg_U = DmgB; //just for expressions'sake
                Dmg_E = DmgA;

            } else {
                log("You probably don't have the right weapons")
                return;
            }
            log("DamageU is" + Dmg_U);
            //stat definitions
            HPU = findObjs({
                characterid: userid,
                name: "HP_bd"
            })[0];
            HPE = findObjs({
                characterid: targetid,
                name: "HP_bd"
            })[0];
            StrU = findObjs({
                characterid: userid,
                name: "Str_bd"
            })[0];
            StrE = findObjs({
                characterid: targetid,
                name: "Str_bd"
            })[0];
            MagU = findObjs({
                characterid: userid,
                name: "Mag_bd"
            })[0];
            MagE = findObjs({
                characterid: targetid,
                name: "Mag_bd"
            })[0];
            SklU = findObjs({
                characterid: userid,
                name: "Skl_bd"
            })[0];
            SklE = findObjs({
                characterid: targetid,
                name: "Skl_bd"
            })[0];
            SpdU = findObjs({
                characterid: userid,
                name: "Spd_bd"
            })[0];
            SpdE = findObjs({
                characterid: targetid,
                name: "Spd_bd"
            })[0];
            LckU = findObjs({
                characterid: userid,
                name: "Lck_bd"
            })[0];
            LckE = findObjs({
                characterid: targetid,
                name: "Lck_bd"
            })[0];
            DefU = findObjs({
                characterid: userid,
                name: "Def_bd"
            })[0];
            DefE = findObjs({
                characterid: targetid,
                name: "Def_bd"
            })[0];
            ResU = findObjs({
                characterid: userid,
                name: "Res_bd"
            })[0];
            ResE = findObjs({
                characterid: targetid,
                name: "Res_bd"
            })[0];

            //nice stat-variables for use in expressions and such
            let HP_StatU = getAttrByName(userid, 'hp_total');
            let HP_StatE = getAttrByName(targetid, 'hp_total');
            let HP_CurrU = getAttrByName(userid, 'hp_current');
            let HP_CurrE = getAttrByName(targetid, 'hp_current');
            let Str_StatU = getAttrByName(userid, 'str_total');
            let Str_StatE = getAttrByName(targetid, 'str_total');
            let Mag_StatU = getAttrByName(userid, 'mag_total');
            let Mag_StatE = getAttrByName(targetid, 'mag_total');
            let Skl_StatU = getAttrByName(userid, 'skl_total');
            let Skl_StatE = getAttrByName(targetid, 'skl_total');
            let Spd_StatU = getAttrByName(userid, 'spd_total');
            let Spd_StatE = getAttrByName(targetid, 'spd_total');
            let Lck_StatU = getAttrByName(userid, 'lck_total');
            let Lck_StatE = getAttrByName(targetid, 'lck_total');
            let Def_StatU = getAttrByName(userid, 'def_total');
            let Def_StatE = getAttrByName(targetid, 'def_total');
            let Res_StatU = getAttrByName(userid, 'res_total');
            let Res_StatE = getAttrByName(targetid, 'res_total');

            let rng;
            if (obj.rng == "Skill") {
                rng = RNGSklU;
            }
            if (obj.rng == "Luck") {
                rng = RNGLckU;
            }
            if ((obj.customcond != "none") && (eval(obj.customcond) != true)){
                return;
            }
            if ((obj.turncond != "none") && (eval(obj.turncond) != true)){
                return;
            }
            log(obj.rng)

            //actual skill function
            function skillMain(){
                //PhysmagE
                if (DmgtypeE == "Physical" || DmgtypeE == "Firearm") {
                    PhysmagE = getAttrByName(targetid, "str_total");
                    PhysmaginvE = getAttrByName(targetid, "mag_total"); //inv for stuff like Ignis
                    log(targetid)
                } else {
                    PhysmagE = getAttrByName(targetid, "mag_total");
                    PhysmaginvE = getAttrByName(targetid, "str_total");
                } //I would add a def/res parameter, but I'm just going to be lazy and use the defense AND resistance definition for Luna.
                log("PhysmagE is " + PhysmagE)

                //PhysmagU
                if (DmgtypeU == "Physical" || DmgtypeU == "Firearm") {
                    PhysmagU = getAttrByName(userid, "str_total");
                    PhysmaginvU = getAttrByName(userid, "mag_total");
                    log(targetid)
                } else {
                    PhysmagU = getAttrByName(userid, "mag_total");
                    PhysmaginvU = getAttrByName(userid, "str_total");
                }
                log("PhysmagU is " + PhysmagU)


                /* Parse damage and HP modifiers- normally eval() is incredibly dangerous and
                usually Shouldn't Be Used Under Any Circumstance Ever, but the Roll20 API sandboxes it,
                so I think it should be alright. Oh well!*/
                let DamagemodU = eval(obj.u_damagemod);
                log("Damage mod is " + DamagemodU)
                let DamagemodE = eval(obj.e_damagemod);
                let HealmodU = parseInt(eval(obj.u_healfactor));
                let HealmodE = parseInt(eval(obj.e_healfactor));
                log("HealmodU is" + HealmodU)

                let statnames = ["HP", "Str", "Mag", "Skl", "Spd", "Lck", "Def", "Res"];

                //determining the actual stat target
                if (obj.u_stat_target || obj.e_stat_target != "none") {
                    for (var r in statnames) {
                        if (obj.u_stat_target == statnames[r]) {
                            StattargetU = eval(statnames[r] + "U");
                        }
                        if (obj.e_stat_target == statnames[r]) {
                            StattargetE = eval(statnames[r] + "U");
                        }
                    }
                }
                let StattargetmodU = eval(obj.u_stat_targetmod);
                let StattargetmodE = eval(obj.e_stat_targetmod);

                if (obj.u_stat_target != "none"){
                    StattargetU.setWithWorker({
                        current: Number(StattargetU.get("current")) + Number(StattargetmodU)
                    });
                    log("Set targeted stat to "+ StattargetU.get("current"));
                }

                if (obj.e_stat_target != "none"){
                    StattargetE.setWithWorker({
                        current: Number(StattargetE.get("current")) + Number(StattargetmodE)
                    });
                    log("Set targeted stat to "+ StattargetE.get("current"));
                }

                if (userid == attacker.id) {
                    log("Damage before is " + DmgA)
                    DmgA += DamagemodU;
                    log("Damage after is " + DmgA)
                    DmgB += DamagemodE;
                    HitA += obj.u_hitmod;
                    HitB += obj.e_hitmod;
                    CritA += obj.u_critmod;
                    CritB += obj.e_critmod;
                    AvoA += obj.u_avomod;
                    AvoB += obj.e_avomod;
                    DdgA += obj.u_ddgmod;
                    DdgB += obj.e_ddgmod;
                    HPA = parseInt(HPA) + HealmodU; //this has to be here because sometimes it'll be stupid and overflow if it's not >:(
                    HPB = parseInt(HPB) + HealmodE;
                    EXPAmod *= obj.expmod_u;
                    WEXPA *= obj.wexpmod_u
                } else {
                    DmgB += DamagemodU;
                    DmgA += DamagemodE;
                    HitB += obj.u_hitmod;
                    HitA += obj.e_hitmod;
                    CritB += obj.u_critmod;
                    CritA += obj.e_critmod;
                    AvoB += obj.u_avomod;
                    AvoA += obj.e_avomod;
                    DdgB += obj.u_ddgmod;
                    DdgA += obj.e_ddgmod;
                    HPB = parseInt(HPB) + HealmodU;
                    HPA = parseInt(HPA) + HealmodE;
                }
                log(HPA)

                if (obj.radius != 0){
                    //tortured screaming
                    let tokenInRadius = filterObjs(function(token) {
                        if ((token.get('type') !== 'graphic' || token.get('subtype') !== 'token' || token.get('represents') == "") || ManhDist(Usertoken,token) > obj.radius || token.get("represents") == Usertoken.get("represents")) return false;
                        else return true;
                    });
                    log("Tokens in radius are: ")
                    for (var i in tokenInRadius){
                        log(tokenInRadius[i])
                        //stat targets
                        let char = tokenInRadius[i].get("represents")
                        let HPcurrC = findObjs({ characterid: char, name: "HP_current"})[0];
                        let StrC = findObjs({ characterid: char, name: "Str_bd"})[0];
                        let MagC = findObjs({ characterid: char, name: "Mag_bd"})[0];
                        let SklC = findObjs({ characterid: char, name: "Skl_bd"})[0];
                        let SpdC = findObjs({ characterid: char, name: "Spd_bd"})[0];
                        let LckC = findObjs({ characterid: char, name: "Lck_bd"})[0];
                        let DefC = findObjs({ characterid: char, name: "Def_bd"})[0];
                        let ResC = findObjs({ characterid: char, name: "Res_bd"})[0];
                        let HitC = findObjs({ characterid: char, name: "Hitmod"})[0];
                        let CritC = findObjs({ characterid: char, name: "Critmod"})[0];
                        let AvoC = findObjs({ characterid: char, name: "Avomod"})[0];
                        let DdgC = findObjs({ characterid: char, name: "Ddgmod"})[0];

                        //numerical stats
                        let HPcurrStat = getAttrByName(char, 'HP_current');
                        let StrStat = getAttrByName(char, 'Str_total');
                        let MagStat = getAttrByName(char, 'Mag_total');
                        let SklStat = getAttrByName(char, 'Skl_total');
                        let SpdStat = getAttrByName(char, 'Spd_total');
                        let LckStat = getAttrByName(char, 'Lck_total');
                        let DefStat = getAttrByName(char, 'Def_total');
                        let ResStat = getAttrByName(char, 'Res_total');
                        let HitStat = getAttrByName(char, 'Hit');
                        let CritStat = getAttrByName(char, 'Crit');
                        let AvoStat = getAttrByName(char, 'Avo');
                        let DdgStat = getAttrByName(char, 'Ddg');

                        effect = eval(obj.radius_effect); //effect MUST be an array!!!
                        rad_effect = Number(effect[0].get("current")) + parseInt(Number(effect[1]))

                        log(effect[0].get("current"))
                        effect[0].setWithWorker({
                            current: rad_effect
                        });
                        log(effect[0].get("current"))

                        if ((effect[0] == HPcurrC) && (char == attacker.id)){
                            HPA += parseInt(effect[1])
                        }

                        if ((effect[0] == HPcurrC) && (char == defender.id)){
                            HPB += parseInt(effect[1])
                        }
                    }
                }
                //recursionnn
                if (obj.children_skills != []){
                    for (var y in obj.children_skills){
                        Child_Skill = JSON.parse(obj.children_skills[y]);
                        Skill(userid, targetid, Child_Skill, "any"); //child implementations of preexisting skills should have the triggertime "any" as well
                    }
                }

                //Attack multiplier for stuff like Astra
                if (obj.attack_multiplier != 0){
                    if (userid == attacker.id){
                        for (i = 0; i < obj.attack_multiplier; i++){

                            if (randomInteger(100) < (HitA - AvoB)){
                                Chatstr += AName + "'s attack hits! \n";
                                //Check if attack crits
                                if (randomInteger(100) < (CritA - DdgB)){
                                    DmgA *= 3;
                                    Chatstr += AName+ " crits! \n";
                                }
                                //No AOE checking because that's stupidly broken. >:O
                                HPB -= DmgA;
                                log("Damage is " + DmgA);
                                CurrHPB.set("current", HPB);
                                CWRVal += 2;
                                CurrWR.set("current",CWRVal);
                                log("Incremented weapon EXP!");
                                DecUsesA();
                                log("Decreased weapon uses!");
                            } else {
                                Chatstr += AName+ " misses! \n";
                            }

                        }

                        DoubleA = false;

                    }
                    else {
                        for (i = 0; i < obj.attack_multiplier; i++){
                            if (randomInteger(100) < (HitB - AvoA)){
                                Chatstr += DName+ "'s attack hits!";
                                //Check if attack crits
                                if (randomInteger(100) < (CritB - DdgA)){
                                    DmgB *= 3;
                                    Chatstr += "\n"+ DName+ " crits!";
                                }
                                HPA -= DmgB;
                                CurrHPA.set("current", HPA);
                                //Defender gets no WEXP to discourage turtling on EP
                                DecUsesB();
                                log("Decreased weapon uses!");
                            } else {
                                Chatstr += DName+ " misses!";
                            }

                        }

                        DoubleB = false;

                    }
                }
                if (obj.custom_string != ""){
                    Chatstr += '<b style = "color: #4055df;">' + obj.custom_string + "</b>\n"
                } else {
                    Chatstr += '<b style = "color: #4055df;">' + obj.name + " activated!</b>\n"
                }
            }

            //more conditional checks
            if (obj.e_physmagcond != false){
                if ((obj.e_physmagcond == "Physical" && DmgtypeE == "Magical") || (obj.e_physmagcond == "Magical" && DmgtypeE == ("Physical" || "Firearm"))){
                    return;
                }
            }
            if (obj.u_physmagcond != false){
                if ((obj.u_physmagcond == "Physical" && DmgtypeU == "Magical") || (obj.u_physmagcond == "Magical" && DmgtypeU == ("Physical" || "Firearm"))){
                    return;
                }
            }
            if (obj.killcond == true){ //this should only be true if the triggertime is after
                if (CurrHPE.get("current") > 0){
                    return;
                }
            }

            if (obj.rng != "none") {
                if (randomInteger(100) < (rng * obj.rngmod)) {
                    skillMain();
                } else {
                    log("RIP RNG")
                    return;
                }

            } else { //Plain ol' skill trigger
                log("Regular skillmain")
                skillMain();
            }

        } else {
            log(triggertime + " vs " + obj.triggertime);
            log("Attacker id is " + attacker.id + "; Defender id is " + defender.id);
            log("Userid is" + userid);
            log("Whotriggered is " + obj.whotriggered);
            return;
        }}; //I know it looks weird, but don't touch this!

        //before triggers
        for (i in SkillsA){
            Skill(attacker.id, defender.id, SkillsA[i], "before");
        }
        for (i in SkillsB){
            Skill(defender.id, attacker.id, SkillsB[i], "before");
        }


        //Actual battle script
        //Check if attacker's attack hits/is in range
        let diff = parseInt(ManhDist(selectedToken, targetToken));
        log(diff + " tiles away!");
        let css = {
            attack: 'style = "color: #353535; border = 1px solid #353535;"'
        };
        let diffcheckA;
        let diffcheckB;
        log(diff + " " + Range1A);
        log(diff + " " + Range1B);
        if (CanAttackA == true) {
            if ((diff >= Range1A) && (diff <= Range2A)){
                log(Range1A + "-"+ Range2A)
                diffcheckA = true;
                Chatstr += AName+ "'s attack is in range! \n";
                if (randomInteger(100) < (HitA - AvoB)){
                    Chatstr += AName + "'s attack hits! \n";

                    //Battle skill trigger
                    for (i in SkillsA){
                        Skill(attacker.id, defender.id, SkillsA[i], "during");
                    }
                    for (i in SkillsB){
                        Skill(defender.id, attacker.id, SkillsB[i], "during");
                    }

                    //Check if attack crits
                    if (randomInteger(100) < (CritA - DdgB)){
                        DmgA *= 3;
                        Chatstr += AName+ " crits! \n";
                    }
                    //radius
                    if (AOEA != 0){
                        let tokenInRadius = filterObjs(function(token) {
                            if ((token.get('type') !== 'graphic' || token.get('subtype') !== 'token' || token.get('represents') == "") || ManhDist(targetToken,token) > AOEA ) return false;
                            else return true;
                        });
                        for (i in tokenInRadius){
                            let char = tokenInRadius[i].get("represents");
                            let HPchar = findObjs({
                                characterid: char,
                                name: "HP_current"
                            })[0];
                            HPchar.setWithWorker({
                                current: HPchar.get("current") - DmgA
                            });

                        }
                    }

                    HPB -= DmgA;
                    log("Damage is " + DmgA);
                    CurrHPB.set("current", HPB);
                    CWRVal += WEXPA;
                    CurrWR.set("current",CWRVal);
                    log("Incremented weapon EXP!");
                    DecUsesA();
                    log("Decreased weapon uses!");
                } else {
                    Chatstr += AName+ " misses! \n";
                }
            } else {
                Chatstr += AName + "'s attack is not in range! \n";
            }
        } else {
            Chatstr += AName +" cannot attack!\n";
        }

        if (CanAttackB == true){
            //Check if defender's attack hits
            if (((Range1B) <= (diff)) && ((diff) <= (Range2B))){
                diffcheckB = true;
                Chatstr += DName + "'s attack is in range! \n";
                if (randomInteger(100) < (HitB - AvoA)){
                    Chatstr += DName+ "'s attack hits!";

                    //battle skill trigger
                    for (i in SkillsB){
                        Skill(defender.id, attacker.id, SkillsB[i], "during");
                    }
                    for (i in SkillsA){
                        Skill(attacker.id, defender.id, SkillsA[i], "during");
                    }

                    //Check if attack crits
                    if (randomInteger(100) < (CritB - DdgA)){
                        DmgB *= 3;
                        Chatstr += "\n"+ DName+ " crits!";
                    }
                    //radius
                    if (AOEB != 0){
                        let tokenInRadius = filterObjs(function(token) {
                            if ((token.get('type') !== 'graphic' || token.get('subtype') !== 'token' || token.get('represents') == "") || ManhDist(selectedToken,token) > AOEB ) return false;
                            else return true;
                        });
                        for (i in tokenInRadius){
                            let char = tokenInRadius[i].get("represents");
                            let HPchar = findObjs({
                                characterid: char,
                                name: "HP_current"
                            })[0];
                            HPchar.setWithWorker({
                                current: HPchar.get("current") - DmgB
                            });

                        }
                    }

                    HPA -= DmgB;
                    CurrHPA.set("current", HPA);
                    //Defender gets no WEXP to discourage turtling on EP
                    DecUsesB();
                    log("Decreased weapon uses!");
                } else {
                    Chatstr += DName+ " misses!";
                }
            } else {
                Chatstr += DName + "'s attack is not in range!";
            }
        } else {
            Chatstr += DName +" cannot attack!";
        }

        //Attacker doubles; I don't think I should need to do usability checking for doubleattacking since it's checked within the battle calc
        if ((DoubleA === true) && (CanAttackA == true) && (diffcheckA == true)){
            Chatstr += "\n"+ AName+ " doubleattacks! \n";
            if (randomInteger(100) < (HitA - AvoB)){
                Chatstr += AName+ "'s attack hits!";
                for (i in SkillsA){
                    Skill(attacker.id, defender.id, SkillsA[i], "during");
                }
                for (i in SkillsB){
                    Skill(defender.id, attacker.id, SkillsB[i], "during");
                }
                //Check if attack crits
                if (randomInteger(100) < (CritA - DdgB)){
                    DmgA *= 3;
                    Chatstr += "\n"+ AName+ " crits!";
                }
                //radius
                if (AOEA != 0){
                    let tokenInRadius = filterObjs(function(token) {
                        if ((token.get('type') !== 'graphic' || token.get('subtype') !== 'token' || token.get('represents') == "") || ManhDist(targetToken,token) > AOEA ) return false;
                        else return true;
                    });
                    for (i in tokenInRadius){
                        let char = tokenInRadius[i].get("represents");
                        let HPchar = findObjs({
                            characterid: char,
                            name: "HP_current"
                        })[0];
                        HPchar.setWithWorker({
                            current: HPchar.get("current") - DmgA
                        });

                    }
                }

                HPB -= DmgA;
                CurrHPB.set("current", HPB);
                CWRVal += WEXPA;
                CurrWR.set("current",CWRVal);
                log("Incremented weapon EXP!");
                DecUsesA();
                log("Decreased weapon uses!");
            } else {
                Chatstr += AName+ " misses!";
            }
            if (QuadA === true){
                Chatstr += AName+ " tripleattacks! \n";
                if (randomInteger(100) < (HitA - AvoB)){
                    Chatstr += AName+ "'s attack hits! \n";
                    for (i in SkillsA){
                        Skill(attacker.id, defender.id, SkillsA[i], "during");
                    }
                    for (i in SkillsB){
                        Skill(defender.id, attacker.id, SkillsB[i], "during");
                    }
                    //Check if attack crits
                    if (randomInteger(100) < (CritA - DdgB)){
                        DmgA *= 3;
                        Chatstr += AName+ " crits! \n";
                    }
                    //radius
                    if (AOEA != 0){
                        let tokenInRadius = filterObjs(function(token) {
                            if ((token.get('type') !== 'graphic' || token.get('subtype') !== 'token' || token.get('represents') == "") || ManhDist(targetToken,token) > AOEA ) return false;
                            else return true;
                        });
                        for (i in tokenInRadius){
                            let char = tokenInRadius[i].get("represents");
                            let HPchar = findObjs({
                                characterid: char,
                                name: "HP_current"
                            })[0];
                            HPchar.setWithWorker({
                                current: HPchar.get("current") - DmgA
                            });

                        }
                    }

                    HPB -= DmgA;
                    CurrHPB.set("current", HPB);
                    CWRVal += WEXPA;
                    CurrWR.set("current",CWRVal);
                    log("Incremented weapon EXP!");
                    DecUsesA();
                    log("Decreased weapon uses!");
                } else {
                    Chatstr += AName+ " misses! \n";
                }
                Chatstr += AName+ " quadrupleattacks! \n";
                if (randomInteger(100) < (HitA - AvoB)){
                    Chatstr += AName+ "'s attack hits! \n";
                    for (i in SkillsA){
                        Skill(attacker.id, defender.id, SkillsA[i], "during");
                    }
                    for (i in SkillsB){
                        Skill(defender.id, attacker.id, SkillsB[i], "during");
                    }
                    //Check if attack crits
                    if (randomInteger(100) < (CritA - DdgB)){
                        DmgA *= 3;
                        Chatstr += AName+ " crits! \n";
                    }
                    //radius
                    if (AOEA != 0){
                        let tokenInRadius = filterObjs(function(token) {
                            if ((token.get('type') !== 'graphic' || token.get('subtype') !== 'token' || token.get('represents') == "") || ManhDist(targetToken,token) > AOEA ) return false;
                            else return true;
                        });
                        for (i in tokenInRadius){
                            let char = tokenInRadius[i].get("represents");
                            let HPchar = findObjs({
                                characterid: char,
                                name: "HP_current"
                            })[0];
                            HPchar.setWithWorker({
                                current: HPchar.get("current") - DmgA
                            });

                        }
                    }

                    HPB -= DmgA;
                    CurrHPB.set("current", HPB);
                    CWRVal += WEXPA;
                    CurrWR.set("current",CWRVal);
                    log("Incremented weapon EXP!");
                    DecUsesA();
                    log("Decreased weapon uses!");
                } else {
                    Chatstr += AName+ " misses!";
                }
            }
        }

        //Defender doubles
        if ((DoubleB === true) && (CanAttackB == true) && (diffcheckB == true)){
            Chatstr += "\n"+ DName+ " doubleattacks! \n";
            if (randomInteger(100) < (HitB - AvoA)){
                Chatstr += DName+ "'s attack hits! \n";
                for (i in SkillsB){
                    Skill(defender.id, attacker.id, SkillsB[i], "during");
                }
                for (i in SkillsA){
                    Skill(attacker.id, defender.id, SkillsA[i], "during");
                }
                //Check if attack crits
                if (randomInteger(100) < (CritB - DdgA)){
                    DmgB *= 3;
                    Chatstr += DName+ " crits! \n";
                }
                //radius
                if (AOEB != 0){
                    let tokenInRadius = filterObjs(function(token) {
                        if ((token.get('type') !== 'graphic' || token.get('subtype') !== 'token' || token.get('represents') == "") || ManhDist(selectedToken,token) > AOEB ) return false;
                        else return true;
                    });
                    for (i in tokenInRadius){
                        let char = tokenInRadius[i].get("represents");
                        let HPchar = findObjs({
                            characterid: char,
                            name: "HP_current"
                        })[0];
                        HPchar.setWithWorker({
                            current: HPchar.get("current") - DmgB
                        });
                    }
                }

                HPA -= DmgB;
                CurrHPA.set("current", HPA);
                DecUsesB();
                log("Decreased weapon uses!");
            } else {
                Chatstr += DName+ " misses! \n";
            }
            if (QuadB === true){
                Chatstr += DName+ " tripleattacks! \n";
                if (randomInteger(100) < (HitB - AvoA)){
                    Chatstr += DName+ "'s attack hits! \n";
                    for (i in SkillsB){
                        Skill(defender.id, attacker.id, SkillsB[i], "during");
                    }
                    for (i in SkillsA){
                        Skill(attacker.id, defender.id, SkillsA[i], "during");
                    }
                    //Check if attack crits
                    if (randomInteger(100) < (CritB - DdgA)){
                        DmgB *= 3;
                        Chatstr += DName+ " crits! \n";
                    }
                    //radius
                    if (AOEB != 0){
                        let tokenInRadius = filterObjs(function(token) {
                            if ((token.get('type') !== 'graphic' || token.get('subtype') !== 'token' || token.get('represents') == "") || ManhDist(selectedToken,token) > AOEB ) return false;
                            else return true;
                        });
                        for (i in tokenInRadius){
                            let char = tokenInRadius[i].get("represents");
                            let HPchar = findObjs({
                                characterid: char,
                                name: "HP_current"
                            })[0];
                            HPchar.setWithWorker({
                                current: HPchar.get("current") - DmgB
                            });

                        }
                    }

                    HPA -= DmgB;
                    CurrHPA.set("current", HPA);
                    DecUsesB();
                    log("Decreased weapon uses!");
                } else {
                    Chatstr += DName+ " misses! \n";
                }
                Chatstr += DName+ " quadrupleattacks! \n";
                if (randomInteger(100) < (HitB - AvoA)){
                    Chatstr += DName+ "'s attack hits! \n";
                    for (i in SkillsB){
                        Skill(defender.id, attacker.id, SkillsB[i], "during");
                    }
                    for (i in SkillsA){
                        Skill(attacker.id, defender.id, SkillsA[i], "during");
                    }
                    //Check if attack crits
                    if (randomInteger(100) < (CritB - DdgA)){
                        DmgB *= 3;
                        Chatstr += DName+ " crits! \n";
                    }
                    //radius
                    if (AOEB != 0){
                        let tokenInRadius = filterObjs(function(token) {
                            if ((token.get('type') !== 'graphic' || token.get('subtype') !== 'token' || token.get('represents') == "") || ManhDist(selectedToken,token) > AOEB ) return false;
                            else return true;
                        });
                        for (i in tokenInRadius){
                            let char = tokenInRadius[i].get("represents");
                            let HPchar = findObjs({
                                characterid: char,
                                name: "HP_current"
                            })[0];
                            HPchar.setWithWorker({
                                current: HPchar.get("current") - DmgB
                            });

                        }
                    }

                    HPA -= DmgB;
                    CurrHPA.set("current", HPA);
                    DecUsesB();
                    log("Decreased weapon uses!");
                } else {
                    Chatstr += DName+ " misses!";
                }
            }
        }
        //after triggers
        for (i in SkillsA){
            Skill(attacker.id, defender.id, SkillsA[i], "after");
        }
        for (i in SkillsB){
            Skill(defender.id, attacker.id, SkillsB[i], "after");
        }

        sendChat(who,'<div ' + css.attack + '>'+ Chatstr +'</div>');
        log('<div ' + css.attack + '>'+ Chatstr +'</div>');
        if (IsPromoA == true){
            InLvA += 20;
        }
        if (IsPromoB == true){
            InLvB += 20;
        }
        //Calculate EXP; commented out for the test
        EXPA += EXPAmod
        CurrEXP.set("current",EXPA);
        if (CurrEXP.get("current") >= 100){
            CurrEXP.set("current",CurrEXP.get("current")-100);
            //Get growths
            LvA.set("current", parseInt(LvA.get("current")) + 1);
            let Lvstr = "/me leveled up!";
            let HPG = Number(getAttrByName(attacker.id, 'hp_gtotal'));
            let StrG = Number(getAttrByName(attacker.id, 'str_gtotal'));
            let MagG = Number(getAttrByName(attacker.id, 'mag_gtotal'));
            let SklG = Number(getAttrByName(attacker.id, 'skl_gtotal'));
            let SpdG = Number(getAttrByName(attacker.id, 'spd_gtotal'));
            let LckG = Number(getAttrByName(attacker.id, 'lck_gtotal'));
            let DefG = Number(getAttrByName(attacker.id, 'def_gtotal'));
            let ResG = Number(getAttrByName(attacker.id, 'res_gtotal'));
            let growthslist = [HPG,StrG,MagG,SklG,SpdG,LckG,DefG,ResG];

            let HPi = Number(getAttrByName(attacker.id, 'hp_i'));
            let Stri = Number(getAttrByName(attacker.id, 'str_i'));
            let Magi = Number(getAttrByName(attacker.id, 'mag_i'));
            let Skli = Number(getAttrByName(attacker.id, 'skl_i'));
            let Spdi = Number(getAttrByName(attacker.id, 'spd_i'));
            let Lcki = Number(getAttrByName(attacker.id, 'lck_i'));
            let Defi = Number(getAttrByName(attacker.id, 'def_i'));
            let Resi = Number(getAttrByName(attacker.id, 'res_i'));
            let sprefix = [HPi,Stri,Magi,Skli,Spdi,Lcki,Defi,Resi];

            let HPSG = findObjs({ characterid: attacker.id, name: "HP_i", type: "attribute"})[0];
            let StrSG = findObjs({ characterid: attacker.id, name: "Str_i", type: "attribute"})[0];
            let MagSG = findObjs({ characterid: attacker.id, name: "Mag_i", type: "attribute"})[0];
            let SklSG = findObjs({ characterid: attacker.id, name: "Skl_i", type: "attribute"})[0];
            let SpdSG = findObjs({ characterid: attacker.id, name: "Spd_i", type: "attribute"})[0];
            let LckSG = findObjs({ characterid: attacker.id, name: "Lck_i", type: "attribute"})[0];
            let DefSG = findObjs({ characterid: attacker.id, name: "Def_i", type: "attribute"})[0];
            let ResSG = findObjs({ characterid: attacker.id, name: "Res_i", type: "attribute"})[0];
            let statslist = [HPSG,StrSG,MagSG,SklSG,SpdSG,LckSG,DefSG,ResSG];
            log(statslist);
            let slist = ["HP","Str","Mag","Skl","Spd","Lck","Def","Res"];
            for (var i = 0; i < growthslist.length - 1; i++){
                gi = growthslist[i];
                log(gi);
                if (randomInteger(100) < gi){
                    statslist[i].setWithWorker({current: sprefix[i] + 1});
                    if (gi > 100){
                        if (randomInteger(100) < gi){
                            Lvstr += "\n + 2 to "+ slist[i] + "!";
                            statslist[i].setWithWorker({current: sprefix[i] + 2});
                        } else{
                            Lvstr += "\n + 1 to "+ slist[i] + "!";
                        }
                    } else {
                        Lvstr += "\n + 1 to "+ slist[i] + "!";
                    }
                }
            }
            log(Lvstr);
            sendChat(who,Lvstr);
        }

    }

    //items
    if (command == 'item') {

        // Make sure enough parameters were sent, to avoid index out of bounds
        if (parts.length < 1) {
            sendChat('SYSTEM', 'You must provide a selected token id.');
            return;
        }

        // Assume the first two parameters are object IDs
        var selectedId = parts[0];
        var item = parts.slice(1).join(" ")
        // Attempt to get the objects as graphics
        var selectedToken = getObj('graphic', selectedId);

        // If the objects *aren't* graphics, or the parameters weren't IDs, fail gracefully
        if (!selectedToken) {
            sendChat('SYSTEM', 'Selected token id not provided.');
            return;
        }

        // Get a variable to use as the "who" for sendChat
        var who = getObj('character', selectedToken.get('represents'));
        if (!who) {
            who = selectedToken.get('name');
        } else {
            who = 'character|' + who.id;
        }

        if (item == ""){
            sendChat("System","No item!")
            return;
        }
        var user = getObj('character', selectedToken.get('represents'));
        //Personal values, for statboosters
        let HPi = findObjs({ characterid: user.id, name: "HP_i", type: "attribute"})[0];
        let Stri = findObjs({ characterid: user.id, name: "Str_i", type: "attribute"})[0];
        let Magi = findObjs({ characterid: user.id, name: "Mag_i", type: "attribute"})[0];
        let Skli = findObjs({ characterid: user.id, name: "Skl_i", type: "attribute"})[0];
        let Spdi = findObjs({ characterid: user.id, name: "Spd_i", type: "attribute"})[0];
        let Lcki = findObjs({ characterid: user.id, name: "Lck_i", type: "attribute"})[0];
        let Defi = findObjs({ characterid: user.id, name: "Def_i", type: "attribute"})[0];
        let Resi = findObjs({ characterid: user.id, name: "Res_i", type: "attribute"})[0];
        //Buff/debuff values, for temp statboosters
        let HPbd = findObjs({ characterid: user.id, name: "HP_bd", type: "attribute"})[0];
        let Strbd = findObjs({ characterid: user.id, name: "Str_bd", type: "attribute"})[0];
        let Magbd = findObjs({ characterid: user.id, name: "Mag_bd", type: "attribute"})[0];
        let Sklbd = findObjs({ characterid: user.id, name: "Skl_bd", type: "attribute"})[0];
        let Spdbd = findObjs({ characterid: user.id, name: "Spd_bd", type: "attribute"})[0];
        let Lckbd = findObjs({ characterid: user.id, name: "Lck_bd", type: "attribute"})[0];
        let Defbd = findObjs({ characterid: user.id, name: "Def_bd", type: "attribute"})[0];
        let Resbd = findObjs({ characterid: user.id, name: "Res_bd", type: "attribute"})[0];
        //Current HP, for healing items
        let HPcurrent = findObjs({ characterid: user.id, name: "HP_current", type: "attribute"})[0];
        let Userclass = findObjs({ characterid: user.id, name: "Class", type: "attribute"})[0];

        let Item_Name0 = findObjs({ characterid: user.id, name: "item_uses0", type: "attribute"})[0];
        let Item_Name1 = findObjs({ characterid: user.id, name: "item_name1", type: "attribute"})[0];
        let Item_Name2 = findObjs({ characterid: user.id, name: "item_name2", type: "attribute"})[0];
        let Item_Uses0 = findObjs({ characterid: user.id, name: "item_uses0", type: "attribute"})[0];
        let Item_Uses1 = findObjs({ characterid: user.id, name: "item_uses1", type: "attribute"})[0];
        let Item_Uses2 = findObjs({ characterid: user.id, name: "item_uses2", type: "attribute"})[0];
        itemuses = [Item_Uses0,Item_Uses1,Item_Uses2]
        itemnames = [Item_Name0,Item_Name1,Item_Name2]
        //All items as objects QnQ
        //Temp statboosters
        const Hearty_Cheese = {
            name: "Hearty Cheese",
            type: "temp_statbooster",
            target: HPbd,
            effect: 2
        }
        const Spicy_Chicken = {
            name: "Spicy Chicken",
            type: "temp_statbooster",
            target: Strbd,
            effect: 2
        }
        const Sweet_Honey = {
            name: "Sweet Honey",
            type: "temp_statbooster",
            target: Magbd,
            effect: 2
        }
        const Fresh_Bread = {
            name: "Fresh Bread",
            type: "temp_statbooster",
            target: Sklbd,
            effect: 2
        }
        const Exotic_Spice = {
            name: "Exotic Spice",
            type: "temp_statbooster",
            target: Spdbd,
            effect: 2
        }
        const Candy_Die = {
            name: "Candy Die",
            type: "temp_statbooster",
            target: Lckbd,
            effect: 2
        }
        const Hot_Soup = {
            name: "Hot Soup",
            type: "temp_statbooster",
            target: Defbd,
            effect: 2
        }
        const Pure_Water = {
            name: "Pure Water",
            type: "temp_statbooster",
            target: Resbd,
            effect: 2
        }
        //Healing
        const Vulnerary = {
            name: "Vulnerary",
            type: "healing",
            effect: 10
        }
        const Concoction = {
            name: "Concoction",
            type: "healing",
            effect: 20
        }
        const Elixir = {
            name: "Elixir",
            type: "healing",
            effect: 999
        }
        //Statboosters
        const Fruit_of_Life = {
            name: "Fruit of Life",
            type: "statbooster",
            target: HPi,
            effect: 2
        }
        const Soma = {
            name: "Soma",
            type: "statbooster",
            target: Stri,
            effect: 2
        }
        const Golden_Apple = {
            name: "Golden Apple",
            type: "statbooster",
            target: Magi,
            effect: 2
        }
        const Nethergranate = {
            name: "Nethergranate",
            type: "statbooster",
            target: Skli,
            effect: 2
        }
        const Pegasus_Cheese = {
            name: "Pegasus_Cheese",
            type: "statbooster",
            target: Spdi,
            effect: 2
        }
        const Nectar = {
            name: "Nectar",
            type: "statbooster",
            target: Lcki,
            effect: 2
        }
        const Ambrosia = {
            name: "Ambrosia",
            type: "statbooster",
            target: Defi,
            effect: 2
        }
        const Talisman = {
            name: "Talisman",
            type: "statbooster",
            target: Resi,
            effect: 2
        }
        //Promo items
        const Orions_Bolt = {
            name: "Orion's Bolt",
            type: "seal",
            target: ["Archer","Apothecary"],
            promo: true
        }
        const Hero_Crest = {
            name: "Hero_Crest",
            type: "seal",
            target: ["Fighter","Mercenary","Myrmidon"],
            promo: true
        }
        const Knight_Crest = {
            name: "Knight_Crest",
            type: "seal",
            target: ["Cavalier","Knight"],
            promo: true
        }
        const Elysian_Whip = {
            name: "Elysian Whip",
            type: "seal",
            target: ["Griffin Rider","Pegasus Knight","Wyvern Rider"],
            promo: true
        }
        const Guiding_Ring = {
            name: "Guiding Ring",
            type: "seal",
            target: ["Anima Mage","Dark Mage","Light Mage","Cleric","Troubadour"],
            promo: true
        }
        const Beastly_Claw = {
            name: "Beastly Claw",
            type: "seal",
            target: ["Laguz","Manakete","Kitsune","Wolfskin"],
            promo: true
        }
        const Ocean_Seal = {
            name: "Ocean Seal",
            type: "seal",
            target: ["Thief","Ninja","Oni Savage","Acrobat"],
            promo: true
        }
        const Medal_of_Honor = {
            name: "Medal of Honor",
            type: "seal",
            target: ["Soldier","Villager","Rifleman"],
            promo: true
        }
        const Heart_Seal = {
            name: "Heart Seal",
            type: "seal",
            target: "all",
            promo: false
        }
        //Misc
        const Chest_Key = {
            name: "Chest Key",
            type: "misc",
            desc: "Opens chests on adjacent spaces."
        }
        const Door_Key = {
            name: "Door Key",
            type: "misc",
            desc: "Opens doors on adjacent spaces."
        }
        const Lockpick = {
            name: "Lockpick",
            type: "misc",
            desc: "Opens doors and chests. Usable only by thieves."
        }
        const Red_Gem = {
            name: "Red Gem",
            type: "misc",
            desc: "Sells for 2500G."
        }
        const Blue_Gem = {
            name: "Blue Gem",
            type: "misc",
            desc: "Sells for 5000G."
        }
        const White_Gem = {
            name: "White Gem",
            type: "misc",
            desc: "Sells for 10000G."
        }
        itemlist = [Hearty_Cheese,Spicy_Chicken,Sweet_Honey,Fresh_Bread,Exotic_Spice,Candy_Die,Hot_Soup,Pure_Water,Vulnerary,Concoction,Elixir,Fruit_of_Life,Soma,Golden_Apple,Nethergranate,Pegasus_Cheese,Nectar,Ambrosia,Talisman,Orions_Bolt,Hero_Crest,Elysian_Whip,Guiding_Ring,Beastly_Claw,Ocean_Seal,Medal_of_Honor,Heart_Seal,Door_Key,Chest_Key,Lockpick,Red_Gem,Blue_Gem,White_Gem];
        //Actual scripts
        //a-an message handling. Obviously, there are some exceptions because it's based on phonetic vowels, but whatever
        if (item.toLowerCase()[0] == "a"||item.toLowerCase()[0] == "e"||item.toLowerCase()[0] == "i"||item.toLowerCase()[0] == "o"||item.toLowerCase()[0] == "u"){
            sendChat(who, '/me uses an ' + item);
        } else {
            sendChat(who, '/me uses a ' + item)
        }
        for (var i in itemlist){
            if (itemlist[i].name == item){
                j = itemlist[i]
                log(j)
                //item effects
                if (j.type == "misc"){
                    sendChat("System",j.desc)
                }
                if (j.type == "temp_statbooster"){
                    j.target.set("current", Number(j.target.get("current")) + j.effect)
                }
                if (j.type == "statbooster"){
                    j.target.set("current", Number(j.target.get("current")) + j.effect)
                }
                if (j.type == "healing"){
                    HPcurrent.set("current", Number(HPcurrent.get("current")) + j.effect)
                }
                if (j.type == "seal"){
                    if (j.promo == true){
                        if (j.target.indexOf(Userclass.get("current")) != -1 ){
                            sendChat("System", user.get("name") + " promotes with the " + j.name + "!")
                        } else {
                            sendChat("System", "Cannot promote!")
                        }
                    } else {
                        sendChat("System", user.get("name") + " changes class with a Heart Seal!")
                    }
                }
            }
        }
    }

    //staves
    if (command == 'staff') {
        if (parts.length < 2) {
            sendChat('SYSTEM', 'You must provide a selected token id and a target token id.');
            return;
        }

        var selectedId = parts[0];
        var targetId = parts[1];

        // Grab tokens
        var selectedToken = getObj('graphic', selectedId);
        var targetToken = getObj('graphic', targetId);

        // Check if the objects aren't tokens or if the passed parameters aren't ids
        if (!selectedToken) {
            sendChat('SYSTEM', 'Selected token id not provided.');
            return;
        }
        if (!targetToken) {
            sendChat('SYSTEM', 'Target token id not provided.');
            return;
        }

        // Get a variable to use as the "who" for sendChat
        var who = getObj('character', selectedToken.get('represents'));
        if (!who) {
            who = selectedToken.get('name');
        } else {
            who = 'character|' + who.id;
        }
        var staffer = getObj('character', selectedToken.get('represents'));
        var target = getObj('character', targetToken.get('represents'));
        let CurrHPA = findObjs({ characterid: staffer.id, name: "HP_current"})[0];
        //Target stats for tasty statuses
        let CurrHPB = findObjs({ characterid: target.id, name: "HP_current"})[0];
        let MaxHPB = findObjs({ characterid: target.id, name: "HP_total"})[0];
        let StrB = findObjs({ characterid: target.id, name: "Str_total"})[0];
        let MagB = findObjs({ characterid: target.id, name: "Mag_total"})[0];
        let SklB = findObjs({ characterid: target.id, name: "Skl_total"})[0];
        let SpdB = findObjs({ characterid: target.id, name: "Spd_total"})[0];
        let LckB = findObjs({ characterid: target.id, name: "Lck_total"})[0];
        let DefB = findObjs({ characterid: target.id, name: "Def_total"})[0];
        let ResB = findObjs({ characterid: target.id, name: "Res_total"})[0];
        let MovB = findObjs({ characterid: target.id, name: "Mov_total"})[0];

        let HPbd = findObjs({ characterid: target.id, name: "HP_bd"})[0];
        let Strbd = findObjs({ characterid: target.id, name: "Str_bd"})[0];
        let Magbd = findObjs({ characterid: target.id, name: "Mag_bd"})[0];
        let Sklbd = findObjs({ characterid: target.id, name: "Skl_bd"})[0];
        let Spdbd = findObjs({ characterid: target.id, name: "Spd_bd"})[0];
        let Lckbd = findObjs({ characterid: target.id, name: "Lck_bd"})[0];
        let Defbd = findObjs({ characterid: target.id, name: "Def_bd"})[0];
        let Resbd = findObjs({ characterid: target.id, name: "Res_bd"})[0];
        let Movbd = findObjs({ characterid: target.id, name: "Mov_bd"})[0];
        //Weapons and h/c/a
        let HitA = getAttrByName(staffer.id, 'hit');
        let AvoB = getAttrByName(target.id, 'avo');
        let MagA = getAttrByName(staffer.id, 'mag_total');
        let WNameA = getAttrByName(staffer.id, 'repeating_weapons_$0_WName') || "Empty";
        let WTypeA = getAttrByName(staffer.id, 'repeating_weapons_$0_WType') || "Stones/Other";
        let MtA = parseInt(getAttrByName(staffer.id, 'repeating_weapons_$0_Mt')) || 0;
        let WtA = parseInt(getAttrByName(staffer.id, 'repeating_weapons_$0_Wt')) || 0;
        let Range1A = parseInt(getAttrByName(staffer.id, 'repeating_weapons_$0_Range1')) || 1;
        let Range2A = parseInt(getAttrByName(staffer.id, 'repeating_weapons_$0_Range2')) || 1;
        let fIDA = getAttrByName(staffer.id, 'fid')|| ""
        let UsesA = findObjs({ characterid: staffer.id, name: "repeating_weapons_"+fIDA+"_Uses"},{ caseInsensitive: true })[0]; //assumes it exists, since that's a requirement for the thing to activate
        let diff = ManhDist(selectedToken, targetToken);

        chatstr = "/me uses " + WNameA + "!"

        const Heal = {
            name : "Heal",
            type : "healing",
            effect : 10 + (Math.round(MagA/3))
        };
        const Mend = {
            name : "Mend",
            type : "healing",
            effect : 20 + (Math.round(MagA/3))
        };
        const Physic = {
            name : "Physic",
            type : "healing",
            effect : 7 + (Math.round(MagA/3))
        };
        const Recover = {
            name : "Recover",
            type : "healing",
            effect : 35 + (Math.round(MagA/3))
        };
        const Fortify = {
            name : "Fortify",
            type : "healing",
            effect : 7 + (Math.round(MagA/3))
        };
        const Bloom_Festal = {
            name : "Bloom Festal",
            type : "healing",
            effect : 7 + (Math.round(MagA/3))
        };
        const Sun_Festal = {
            name : "Sun Festal",
            type : "healing",
            effect : 14 + (Math.round(MagA/3))
        };
        const Wane_Festal = {
            name : "Wane Festal",
            type : "healing",
            effect : 2 + (Math.round(MagA/3))
        };
        const Moon_Festal = {
            name : "Moon Festal",
            type : "healing",
            effect : 25 + (Math.round(MagA/3))
        };
        const Great_Festal = {
            name : "Great Festal",
            type : "healing",
            effect : 2 + (Math.round(MagA/3))
        };
        const Freeze = {
            name : "Freeze",
            type : "status",
            target: [Movbd],
            effect : Number(MovB.get("current")) * -1,
            status: {status_tread: true},
            chatmsg: targetToken.get("name") + " is unable to move this turn!"
        };
        const Enfeeble = {
            name : "Enfeeble",
            type : "status",
            target: [Strbd,Magbd,Sklbd,Spdbd,Lckbd,Defbd,Resbd],
            effect : -4,
            status: {"status_back-pain": 4},
            chatmsg: targetToken.get("name") + " is enfeebled! -4 to every stat (decreases by 1 each turn)"
        };
        const Entrap = {
            name : "Entrap",
            type : "status",
            target: [Movbd],
            effect : 0,
            status: {"status_grab": false},
            chatmsg: targetToken.get("name") + " is moved next to the enemy!"
        };
        const Rescue = {
            name : "Rescue",
            type : "status",
            target: [Movbd],
            effect : 0,
            status: {"status_grab": false},
            chatmsg: targetToken.get("name") + " is rescued!"
        };
        const Silence = {
            name : "Silence",
            type : "status",
            target: [Magbd],
            effect : Number(MagB.get("current")) * -1,
            status: {status_interdiction: true},
            chatmsg: targetToken.get("name") + " cannot use magic for the next turn!"
        };
        const Hexing_Rod = {
            name : "Hexing Rod",
            type : "status",
            target: [HPbd],
            effect : Math.round(Number(MaxHPB.get("current")) * -0.5),
            status: {"status_broken-heart": true},
            chatmsg: targetToken.get("name") + "'s HP was halved!"
        };

        //Okay, Skills system time!!
        let user;
        let RNGSklU;
        let RNGLuckU;
        let CurrHPU;
        let CurrHPE;
        let HPU;
        let HPE;
        let StrU;
        let StrE;
        let MagU;
        let MagE;
        let SklU;
        let SklE;
        let SpdU;
        let SpdE;
        let LckU;
        let LckE;
        let DefU;
        let DefE;
        let ResU;
        let ResE;
        let HitU;
        let HitE;
        let CritU;
        let CritE;
        let AvoU;
        let AvoE;
        let DdgU;
        let DdgE;
        let DmgU;
        let DmgE;
        let DmgtypeU;
        let DmgtypeE;
        let PhysmagU;
        let PhysmagE;
        let PhysmaginvU;
        let PhysmaginvE;
        let StattargetU;
        let StattargetE;
        let CurrEXP = findObjs({ characterid: staffer.id, name: "EXP"})[0];
        let LvA = findObjs({ characterid: staffer.id, name: "Level"})[0];
        let InLvA = Number(LvA.get("current"));
        let LvB = findObjs({ characterid: target.id, name: "Level"})[0];
        let InLvB = Number(LvB.get("current"));
        let EXPA = Number(CurrEXP.get("current"));
        let IsPromoA = getAttrByName(staffer.id, 'isPromo');
        let IsPromoB = getAttrByName(target.id, 'isPromo');
        let EXPAmod = (10 + ((Math.abs(InLvB-InLvA)*3)));
        let HPA = Number(getAttrByName(staffer.id, 'hp_current'));
        let HPB = Number(getAttrByName(target.id, 'hp_current'));

        function Skill(userid, targetid, obj, triggertime) { //haha END ME
            if (typeof obj != "object") {
                log("obj is not an object :(")
                return;
            }
            if (obj.triggertime != "staff"){
                return;
            }
            //no whotriggered checking because it'll always be the staffer
            log("Okay, first barrier passed")
            user = "staffer";
            RNGSklU = Number(getAttrByName(staffer.id, 'skl_total'));
            RNGLckU = Number(getAttrByName(staffer.id, 'lck_total'));
            CurrHPU = findObjs({
                characterid: staffer.id,
                name: "HP_current"
            })[0];
            CurrHPE = findObjs({
                characterid: target.id,
                name: "HP_current"
            })[0];
            DmgtypeU = ""
            DmgtypeE = "" //doesn't matter since commands are non-combative anyways
            Usertoken = selectedToken;
            //stat definitions
            HPU = findObjs({
                characterid: userid,
                name: "HP_bd"
            })[0];
            HPE = findObjs({
                characterid: targetid,
                name: "HP_bd"
            })[0];
            StrU = findObjs({
                characterid: userid,
                name: "Str_bd"
            })[0];
            StrE = findObjs({
                characterid: targetid,
                name: "Str_bd"
            })[0];
            MagU = findObjs({
                characterid: userid,
                name: "Mag_bd"
            })[0];
            MagE = findObjs({
                characterid: targetid,
                name: "Mag_bd"
            })[0];
            SklU = findObjs({
                characterid: userid,
                name: "Skl_bd"
            })[0];
            SklE = findObjs({
                characterid: targetid,
                name: "Skl_bd"
            })[0];
            SpdU = findObjs({
                characterid: userid,
                name: "Spd_bd"
            })[0];
            SpdE = findObjs({
                characterid: targetid,
                name: "Spd_bd"
            })[0];
            LckU = findObjs({
                characterid: userid,
                name: "Lck_bd"
            })[0];
            LckE = findObjs({
                characterid: targetid,
                name: "Lck_bd"
            })[0];
            DefU = findObjs({
                characterid: userid,
                name: "Def_bd"
            })[0];
            DefE = findObjs({
                characterid: targetid,
                name: "Def_bd"
            })[0];
            ResU = findObjs({
                characterid: userid,
                name: "Res_bd"
            })[0];
            ResE = findObjs({
                characterid: targetid,
                name: "Res_bd"
            })[0];

            //nice stat-variables for use in expressions and such
            let HP_StatU = getAttrByName(userid, 'hp_total');
            let HP_StatE = getAttrByName(targetid, 'hp_total');
            let HP_CurrU = getAttrByName(userid, 'hp_current');
            let HP_CurrE = getAttrByName(targetid, 'hp_current');
            let Str_StatU = getAttrByName(userid, 'str_total');
            let Str_StatE = getAttrByName(targetid, 'str_total');
            let Mag_StatU = getAttrByName(userid, 'mag_total');
            let Mag_StatE = getAttrByName(targetid, 'mag_total');
            let Skl_StatU = getAttrByName(userid, 'skl_total');
            let Skl_StatE = getAttrByName(targetid, 'skl_total');
            let Spd_StatU = getAttrByName(userid, 'spd_total');
            let Spd_StatE = getAttrByName(targetid, 'spd_total');
            let Lck_StatU = getAttrByName(userid, 'lck_total');
            let Lck_StatE = getAttrByName(targetid, 'lck_total');
            let Def_StatU = getAttrByName(userid, 'def_total');
            let Def_StatE = getAttrByName(targetid, 'def_total');
            let Res_StatU = getAttrByName(userid, 'res_total');
            let Res_StatE = getAttrByName(targetid, 'res_total');

            let rng;
            if (obj.rng == "Skill") {
                rng = RNGSklU;
            }
            if (obj.rng == "Luck") {
                rng = RNGLckU;
            }
            if ((obj.customcond != "none") && (eval(obj.customcond) != true)) {
                return;
            }
            if ((obj.turncond != "none") && (eval(obj.turncond) != true)){
                return;
            }
            log(obj.rng)

            //actual skill function
            function skillMain() {
                //No Physmag :O

                /* Parse damage and HP modifiers- normally eval() is incredibly dangerous and
                usually Shouldn't Be Used Under Any Circumstance Ever, but the Roll20 API sandboxes it,
                so I think it should be alright. Oh well!*/
                let HealmodU = parseInt(eval(obj.u_healfactor));
                let HealmodE = parseInt(eval(obj.e_healfactor));
                log("HealmodU is" + HealmodU)

                let statnames = ["HP", "Str", "Mag", "Skl", "Spd", "Lck", "Def", "Res"];

                //determining the actual stat target
                if (obj.u_stat_target || obj.e_stat_target != "none") {
                    for (var r in statnames) {
                        if (obj.u_stat_target == statnames[r]) {
                            StattargetU = eval(statnames[r] + "U");
                        }
                        if (obj.e_stat_target == statnames[r]) {
                            StattargetE = eval(statnames[r] + "U");
                        }
                    }
                }
                let StattargetmodU = eval(obj.u_stat_targetmod);
                let StattargetmodE = eval(obj.e_stat_targetmod);

                if (obj.u_stat_target != "none") {
                    StattargetU.setWithWorker({
                        current: Number(StattargetU.get("current")) + Number(StattargetmodU)
                    });
                    log("Set targeted stat to " + StattargetU.get("current"));
                }

                if (obj.e_stat_target != "none") {
                    StattargetE.setWithWorker({
                        current: Number(StattargetE.get("current")) + Number(StattargetmodE)
                    });
                    log("Set targeted stat to " + StattargetE.get("current"));
                }

                HPA = parseInt(HPA) + HealmodU; //this has to be here because sometimes it'll be stupid and overflow if it's not >:(
                HPVal = parseInt(HPVal) + HealmodE;
                EXPAmod *= obj.expmod_u;
                log(HPA)

                if (obj.radius != 0) {
                    //tortured screaming
                    let tokenInRadius = filterObjs(function(token) {
                        if ((token.get('type') !== 'graphic' || token.get('subtype') !== 'token' || token.get('represents') == "") || ManhDist(Usertoken, token) > obj.radius || token.get("represents") == Usertoken.get("represents")) return false;
                        else return true;
                    });
                    log("Tokens in radius are: ")
                    for (var i in tokenInRadius) {
                        log(tokenInRadius[i])
                            //stat targets
                        let char = tokenInRadius[i].get("represents")
                        let HPcurrC = findObjs({
                            characterid: char,
                            name: "HP_current"
                        })[0];
                        let StrC = findObjs({
                            characterid: char,
                            name: "Str_bd"
                        })[0];
                        let MagC = findObjs({
                            characterid: char,
                            name: "Mag_bd"
                        })[0];
                        let SklC = findObjs({
                            characterid: char,
                            name: "Skl_bd"
                        })[0];
                        let SpdC = findObjs({
                            characterid: char,
                            name: "Spd_bd"
                        })[0];
                        let LckC = findObjs({
                            characterid: char,
                            name: "Lck_bd"
                        })[0];
                        let DefC = findObjs({
                            characterid: char,
                            name: "Def_bd"
                        })[0];
                        let ResC = findObjs({
                            characterid: char,
                            name: "Res_bd"
                        })[0];
                        let HitC = findObjs({
                            characterid: char,
                            name: "Hitmod"
                        })[0];
                        let CritC = findObjs({
                            characterid: char,
                            name: "Critmod"
                        })[0];
                        let AvoC = findObjs({
                            characterid: char,
                            name: "Avomod"
                        })[0];
                        let DdgC = findObjs({
                            characterid: char,
                            name: "Ddgmod"
                        })[0];

                        //numerical stats
                        let HPcurrStat = getAttrByName(char, 'HP_current');
                        let StrStat = getAttrByName(char, 'Str_total');
                        let MagStat = getAttrByName(char, 'Mag_total');
                        let SklStat = getAttrByName(char, 'Skl_total');
                        let SpdStat = getAttrByName(char, 'Spd_total');
                        let LckStat = getAttrByName(char, 'Lck_total');
                        let DefStat = getAttrByName(char, 'Def_total');
                        let ResStat = getAttrByName(char, 'Res_total');
                        let HitStat = getAttrByName(char, 'Hit');
                        let CritStat = getAttrByName(char, 'Crit');
                        let AvoStat = getAttrByName(char, 'Avo');
                        let DdgStat = getAttrByName(char, 'Ddg');

                        let effect = eval(obj.radius_effect); //effect MUST be an array!!!
                        let rad_effect = Number(effect[0].get("current")) + parseInt(Number(effect[1]))

                        log(effect[0].get("current"))
                        effect[0].setWithWorker({
                            current: rad_effect
                        });
                        log(effect[0].get("current"))

                        if ((effect[0] == HPcurrC) && (char == staffer.id)) {
                            HPA += parseInt(effect[1])
                        }

                        if ((effect[0] == HPcurrC) && (char == target.id)) {
                            HPVal += parseInt(effect[1])
                        }
                    }
                }

                CurrHPA.setWithWorker({
                    current: HPA
                });

                //recursionnn
                if (obj.children_skills != []) {
                    for (var y in obj.children_skills) {
                        let Child_Skill = JSON.parse(obj.children_skills[y]);
                        Skill(userid, targetid, Child_Skill, "any"); //child implementations of preexisting skills should have the triggertime "any" as well
                    }
                }

                if (obj.custom_string != "") {
                    chatstr += '\n<b style = "color: #4055df;">' + obj.custom_string + "</b>\n"
                } else {
                    chatstr += '\n<b style = "color: #4055df;">' + obj.name + " activated!</b>\n"
                }
            }

            if (obj.rng != "none") {
                if (randomInteger(100) < (rng * obj.rngmod)) {
                    skillMain();
                } else {
                    log("RIP RNG")
                    return;
                }

            } else { //Plain ol' skill trigger
                log("Regular skillmain")
                skillMain();
            }
        }

        let SkillsA = findObjs({ characterid: staffer.id, type: "ability"});
        for (var i in SkillsA){
            SkillsA[i] = SkillsA[i].get("action");
            if (SkillsA[i] != ""){
                SkillsA[i] = JSON.parse(SkillsA[i]);
            }
        }
        let temp = []
        SkillsA.forEach(function(entry, i) {
            if (SkillsA[i].triggertime == "staff"){
                temp.push(SkillsA[i])
            }
        });
        SkillsA = temp;
        log(SkillsA);

        const staveslist = [Heal,Mend,Physic,Recover,Fortify,Bloom_Festal,Sun_Festal,Wane_Festal,Moon_Festal,Great_Festal,Freeze,Enfeeble,Entrap,Rescue,Silence,Hexing_Rod];
        //Script stuff here
        if (WTypeA != "Staves/Rods"){
            chatstr += "\n Weapon is not a staff!"
        } else {
            for (var i in staveslist){
                if (staveslist[i].name === WNameA){
                    j = staveslist[i];
                    //check for range
                    if (((Range1A) <= (diff)) && ((diff) <= (Range2A))){
                        if (j.type === "healing"){
                            //Set with workers in respect to total caps
                            HPVal = j.effect
                            for (var z in SkillsA){
                                Skill(staffer, target, SkillsA[z], "staff")
                            }
                            CurrHPB.setWithWorker({current: parseInt(CurrHPB.get("current")) + HPVal})
                            chatstr += "\n" + targetToken.get("name") + " is healed for " + String(HPVal) + " HP!"
                            UsesA.setWithWorker({current: parseInt(UsesA.get("current")) - 1})
                        }
                        if (j.type === "status"){
                            //Check for RNG
                            if (randomInteger(100) < (HitA - AvoB)){
                                for (var a in j.target){
                                    log(j.effect);
                                    log(j.target[a])
                                    j.target[a].setWithWorker("current",j.effect)
                                }
                                log(j.status);
                                targetToken.set(j.status);
                                UsesA.setWithWorker({current: parseInt(UsesA.get("current")) - 1})
                                chatstr += "\n"+ j.chatmsg
                            }
                            else {
                                chatstr += "\n Staff misses!"
                            }
                        }
                    } else {
                        chatstr += "\n Staff is not in range!"
                    }
                }
            }
        }
        sendChat(who, chatstr);
    }

    if (command == 'stats') {
        if (parts.length < 1) {
            sendChat('SYSTEM', 'You must provide a selected token id');
            return;
        }
        if (parts.length < 4) {
            sendChat('SYSTEM', 'You must provide arguments for all four stats');
            return;
        }

        // Only one token for this one
        var selectedId = parts[0];
        var hit = Number(parts[1]);
        var crit = Number(parts[2]);
        var avo = Number(parts[3]);
        var ddg = Number(parts[4]);
        var dmg = Number(parts[5]);
        log(parts)

        var selectedToken = getObj('graphic', selectedId);

        if (!selectedToken) {
            sendChat('SYSTEM', 'Selected token id not provided.');
            return;
        }

        var who = getObj('character', selectedToken.get('represents'));
        var user = who.id
        if (!who) {
            who = selectedToken.get('name');
        } else {
            who = 'character|' + who.id;
        }

        let Hitmod = findObjs({ characterid: user, name: "Hitmod"})[0];
        log(Hitmod)
        let Critmod = findObjs({ characterid: user, name: "Critmod"})[0];
        log(Critmod)
        let Avomod = findObjs({ characterid: user, name: "Avomod"})[0];
        log(Avomod)
        let Ddgmod = findObjs({ characterid: user, name: "Ddgmod"})[0];
        log(Ddgmod)
        let Dmgmod = findObjs({ characterid: user, name: "Dmgmod"})[0];
        log(Dmgmod)

        Hitmod.setWithWorker({
            current: Number(Hitmod.get("current")) + hit
        });
        Critmod.setWithWorker({
            current: Number(Critmod.get("current")) + crit
        });
        Avomod.setWithWorker({
            current: Number(Avomod.get("current")) + avo
        });
        Ddgmod.setWithWorker({
            current: Number(Hitmod.get("current")) + ddg
        });
        Dmgmod.setWithWorker({
            current: Number(Hitmod.get("current")) + dmg
        });

        sendChat(who, "Stats modified!");
    }

    //command1
    if (command == 'skill') {
        if (parts.length < 2) {
            sendChat('SYSTEM', 'You must provide a selected token id and a target token id.');
            return;
        }

        var selectedId = parts[0];
        var targetId = parts[1];

        // Grab tokens
        var selectedToken = getObj('graphic', selectedId);
        var targetToken = getObj('graphic', targetId);

        // Check if the objects aren't tokens or if the passed parameters aren't ids
        if (!selectedToken) {
            sendChat('SYSTEM', 'Selected token id not provided.');
            return;
        }
        if (!targetToken) {
            sendChat('SYSTEM', 'Target token id not provided.');
            return;
        }

        // Get a variable to use as the "who" for sendChat
        var who = getObj('character', selectedToken.get('represents'));
        if (!who) {
            who = selectedToken.get('name');
        } else {
            who = 'character|' + who.id;
        }
        //script!!

        var attacker = getObj('character', selectedToken.get('represents'));
        var defender = getObj('character', targetToken.get('represents'));

        //grab all commands
        let SkillsA = findObjs({ characterid: attacker.id, type: "ability"});
        for (var i in SkillsA){
            SkillsA[i] = SkillsA[i].get("action");
            if (SkillsA[i] != ""){
                SkillsA[i] = JSON.parse(SkillsA[i]);
            }
        }
        let temp = []
        SkillsA.forEach(function(entry, i) {
            if (SkillsA[i].triggertime == "command"){
                temp.push(SkillsA[i])
            }
        });
        SkillsA = temp;
        let namestr = "";
        for (i in SkillsA){
            namestr += "|" + SkillsA[i].name;
        }


        //SkillsB doesn't exist because they're not selecting anything lol

        sendChat("System","[Pick Ability](!&#"+"13;!co ?{Pick a skill"+namestr+"} " + selectedId + " " + targetId + ")");
        //get second message

    }
    //command2
    if (command == 'co'){
        log("YE")
        log(parts);
        var skillName = parts[0];
        var selectedId = parts[1];
        var targetId = parts[2];

        var selectedToken = getObj('graphic', selectedId);
        var targetToken = getObj('graphic', targetId);
        var attacker = getObj('character', selectedToken.get('represents'));
        var defender = getObj('character', targetToken.get('represents'));

        var who = getObj('character', selectedToken.get('represents'));
        if (!who) {
            who = selectedToken.get('name');
        } else {
            who = 'character|' + who.id;
        }

        let newSkill = findObjs({ characterid: attacker.id, type: "ability", name: skillName })[0];
        log(newSkill)
        if (newSkill == [] || newSkill == undefined){
            sendChat("SYSTEM","Provided skill name does not exist! ")
            return;
        }
        newSkill = newSkill.get("action")
        let selectedSkill = JSON.parse(newSkill);
        log(selectedSkill)
        //Skills system time!!
        let user;
        let RNGSklU;
        let RNGLuckU;
        let CurrHPU;
        let CurrHPE;
        let HPU;
        let HPE;
        let StrU;
        let StrE;
        let MagU;
        let MagE;
        let SklU;
        let SklE;
        let SpdU;
        let SpdE;
        let LckU;
        let LckE;
        let DefU;
        let DefE;
        let ResU;
        let ResE;
        let HitU;
        let HitE;
        let CritU;
        let CritE;
        let AvoU;
        let AvoE;
        let DdgU;
        let DdgE;
        let DmgU;
        let DmgE;
        let DmgtypeU;
        let DmgtypeE;
        let PhysmagU;
        let PhysmagE;
        let PhysmaginvU;
        let PhysmaginvE;
        let StattargetU;
        let StattargetE;
        let CurrEXP = findObjs({ characterid: attacker.id, name: "EXP"})[0];
        let LvA = findObjs({ characterid: attacker.id, name: "Level"})[0];
        let InLvA = Number(LvA.get("current"));
        let LvB = findObjs({ characterid: defender.id, name: "Level"})[0];
        let InLvB = Number(LvB.get("current"));
        let EXPA = Number(CurrEXP.get("current"));
        let IsPromoA = getAttrByName(attacker.id, 'isPromo');
        let IsPromoB = getAttrByName(defender.id, 'isPromo');
        let EXPAmod = (10 + ((Math.abs(InLvB-InLvA)*3)));
        let HPA = Number(getAttrByName(attacker.id, 'hp_current'));
        let HPB = Number(getAttrByName(defender.id, 'hp_current'));
        let CurrHPA = findObjs({ characterid: attacker.id, name: "HP_current"})[0];
        let CurrHPB = findObjs({ characterid: defender.id, name: "HP_current"})[0];

        function Skill(userid, targetid, obj, triggertime) { //haha END ME
            if (typeof obj != "object") {
                log("obj is not an object :(")
                return;
            }
            if (obj.triggertime != "command"){
                return;
            }
            //no whotriggered checking because it'll always be the attacker
            log("Okay, first barrier passed")
            user = "attacker";
            RNGSklU = Number(getAttrByName(attacker.id, 'skl_total'));
            RNGLckU = Number(getAttrByName(attacker.id, 'lck_total'));
            CurrHPU = findObjs({
                characterid: attacker.id,
                name: "HP_current"
            })[0];
            CurrHPE = findObjs({
                characterid: defender.id,
                name: "HP_current"
            })[0];
            DmgtypeU = ""
            DmgtypeE = "" //doesn't matter since commands are non-combative anyways
            Usertoken = selectedToken;
            //stat definitions
            HPU = findObjs({
                characterid: userid,
                name: "HP_bd"
            })[0];
            HPE = findObjs({
                characterid: targetid,
                name: "HP_bd"
            })[0];
            StrU = findObjs({
                characterid: userid,
                name: "Str_bd"
            })[0];
            StrE = findObjs({
                characterid: targetid,
                name: "Str_bd"
            })[0];
            MagU = findObjs({
                characterid: userid,
                name: "Mag_bd"
            })[0];
            MagE = findObjs({
                characterid: targetid,
                name: "Mag_bd"
            })[0];
            SklU = findObjs({
                characterid: userid,
                name: "Skl_bd"
            })[0];
            SklE = findObjs({
                characterid: targetid,
                name: "Skl_bd"
            })[0];
            SpdU = findObjs({
                characterid: userid,
                name: "Spd_bd"
            })[0];
            SpdE = findObjs({
                characterid: targetid,
                name: "Spd_bd"
            })[0];
            LckU = findObjs({
                characterid: userid,
                name: "Lck_bd"
            })[0];
            LckE = findObjs({
                characterid: targetid,
                name: "Lck_bd"
            })[0];
            DefU = findObjs({
                characterid: userid,
                name: "Def_bd"
            })[0];
            DefE = findObjs({
                characterid: targetid,
                name: "Def_bd"
            })[0];
            ResU = findObjs({
                characterid: userid,
                name: "Res_bd"
            })[0];
            ResE = findObjs({
                characterid: targetid,
                name: "Res_bd"
            })[0];

            //nice stat-variables for use in expressions and such
            let HP_StatU = getAttrByName(userid, 'hp_total');
            let HP_StatE = getAttrByName(targetid, 'hp_total');
            let HP_CurrU = getAttrByName(userid, 'hp_current');
            let HP_CurrE = getAttrByName(targetid, 'hp_current');
            let Str_StatU = getAttrByName(userid, 'str_total');
            let Str_StatE = getAttrByName(targetid, 'str_total');
            let Mag_StatU = getAttrByName(userid, 'mag_total');
            let Mag_StatE = getAttrByName(targetid, 'mag_total');
            let Skl_StatU = getAttrByName(userid, 'skl_total');
            let Skl_StatE = getAttrByName(targetid, 'skl_total');
            let Spd_StatU = getAttrByName(userid, 'spd_total');
            let Spd_StatE = getAttrByName(targetid, 'spd_total');
            let Lck_StatU = getAttrByName(userid, 'lck_total');
            let Lck_StatE = getAttrByName(targetid, 'lck_total');
            let Def_StatU = getAttrByName(userid, 'def_total');
            let Def_StatE = getAttrByName(targetid, 'def_total');
            let Res_StatU = getAttrByName(userid, 'res_total');
            let Res_StatE = getAttrByName(targetid, 'res_total');

            let rng;
            if (obj.rng == "Skill") {
                rng = RNGSklU;
            }
            if (obj.rng == "Luck") {
                rng = RNGLckU;
            }
            if ((obj.customcond != "none") && (eval(obj.customcond) != true)) {
                return;
            }
            if ((obj.turncond != "none") && (eval(obj.turncond) != true)){
                return;
            }
            log(obj.rng)

            //actual skill function
            function skillMain() {
                //No Physmag :O

                /* Parse damage and HP modifiers- normally eval() is incredibly dangerous and
                usually Shouldn't Be Used Under Any Circumstance Ever, but the Roll20 API sandboxes it,
                so I think it should be alright. Oh well!*/
                let HealmodU = parseInt(eval(obj.u_healfactor));
                let HealmodE = parseInt(eval(obj.e_healfactor));
                log("HealmodU is" + HealmodU)

                let statnames = ["HP", "Str", "Mag", "Skl", "Spd", "Lck", "Def", "Res"];

                //determining the actual stat target
                if (obj.u_stat_target || obj.e_stat_target != "none") {
                    for (var r in statnames) {
                        if (obj.u_stat_target == statnames[r]) {
                            StattargetU = eval(statnames[r] + "U");
                        }
                        if (obj.e_stat_target == statnames[r]) {
                            StattargetE = eval(statnames[r] + "U");
                        }
                    }
                }
                let StattargetmodU = eval(obj.u_stat_targetmod);
                let StattargetmodE = eval(obj.e_stat_targetmod);

                if (obj.u_stat_target != "none") {
                    StattargetU.setWithWorker({
                        current: Number(StattargetU.get("current")) + Number(StattargetmodU)
                    });
                    log("Set targeted stat to " + StattargetU.get("current"));
                }

                if (obj.e_stat_target != "none") {
                    StattargetE.setWithWorker({
                        current: Number(StattargetE.get("current")) + Number(StattargetmodE)
                    });
                    log("Set targeted stat to " + StattargetE.get("current"));
                }

                HPA = parseInt(HPA) + HealmodU; //this has to be here because sometimes it'll be stupid and overflow if it's not >:(
                HPB = parseInt(HPB) + HealmodE;
                EXPAmod *= obj.expmod_u;
                log(HPA)

                if (obj.radius != 0) {
                    //tortured screaming
                    let tokenInRadius = filterObjs(function(token) {
                        if ((token.get('type') !== 'graphic' || token.get('subtype') !== 'token' || token.get('represents') == "") || ManhDist(Usertoken, token) > obj.radius || token.get("represents") == Usertoken.get("represents")) return false;
                        else return true;
                    });
                    log("Tokens in radius are: ")
                    for (var i in tokenInRadius) {
                        log(tokenInRadius[i])
                            //stat targets
                        let char = tokenInRadius[i].get("represents")
                        let HPcurrC = findObjs({
                            characterid: char,
                            name: "HP_current"
                        })[0];
                        let StrC = findObjs({
                            characterid: char,
                            name: "Str_bd"
                        })[0];
                        let MagC = findObjs({
                            characterid: char,
                            name: "Mag_bd"
                        })[0];
                        let SklC = findObjs({
                            characterid: char,
                            name: "Skl_bd"
                        })[0];
                        let SpdC = findObjs({
                            characterid: char,
                            name: "Spd_bd"
                        })[0];
                        let LckC = findObjs({
                            characterid: char,
                            name: "Lck_bd"
                        })[0];
                        let DefC = findObjs({
                            characterid: char,
                            name: "Def_bd"
                        })[0];
                        let ResC = findObjs({
                            characterid: char,
                            name: "Res_bd"
                        })[0];
                        let HitC = findObjs({
                            characterid: char,
                            name: "Hitmod"
                        })[0];
                        let CritC = findObjs({
                            characterid: char,
                            name: "Critmod"
                        })[0];
                        let AvoC = findObjs({
                            characterid: char,
                            name: "Avomod"
                        })[0];
                        let DdgC = findObjs({
                            characterid: char,
                            name: "Ddgmod"
                        })[0];

                        //numerical stats
                        let HPcurrStat = getAttrByName(char, 'HP_current');
                        let StrStat = getAttrByName(char, 'Str_total');
                        let MagStat = getAttrByName(char, 'Mag_total');
                        let SklStat = getAttrByName(char, 'Skl_total');
                        let SpdStat = getAttrByName(char, 'Spd_total');
                        let LckStat = getAttrByName(char, 'Lck_total');
                        let DefStat = getAttrByName(char, 'Def_total');
                        let ResStat = getAttrByName(char, 'Res_total');
                        let HitStat = getAttrByName(char, 'Hit');
                        let CritStat = getAttrByName(char, 'Crit');
                        let AvoStat = getAttrByName(char, 'Avo');
                        let DdgStat = getAttrByName(char, 'Ddg');

                        let effect = eval(obj.radius_effect); //effect MUST be an array!!!
                        let rad_effect = Number(effect[0].get("current")) + parseInt(Number(effect[1]))

                        log(effect[0].get("current"))
                        effect[0].setWithWorker({
                            current: rad_effect
                        });
                        log(effect[0].get("current"))

                        if ((effect[0] == HPcurrC) && (char == attacker.id)) {
                            HPA += parseInt(effect[1])
                        }

                        if ((effect[0] == HPcurrC) && (char == defender.id)) {
                            HPB += parseInt(effect[1])
                        }
                    }

                    CurrHPA.setWithWorker({
                        current: HPA
                    });
                    CurrHPB.setWithWorker({
                        current: HPB
                    });

                }
                //recursionnn
                if (obj.children_skills != []) {
                    for (var y in obj.children_skills) {
                        let Child_Skill = JSON.parse(obj.children_skills[y]);
                        Skill(userid, targetid, Child_Skill, "any"); //child implementations of preexisting skills should have the triggertime "any" as well
                    }
                }

                let Chatstr;
                if (obj.custom_string != "") {
                    Chatstr = '<b style = "color: #4055df;">' + obj.custom_string + "</b>\n"
                } else {
                    Chatstr = '<b style = "color: #4055df;">'+attacker.get("name") + " used " + obj.name + "!</b>\n"
                }
                sendChat(who, Chatstr);
            }

            if (obj.rng != "none") {
                if (randomInteger(100) < (rng * obj.rngmod)) {
                    skillMain();
                } else {
                    log("RIP RNG")
                    return;
                }

            } else { //Plain ol' skill trigger
                log("Regular skillmain")
                skillMain();
            }
        }

        Skill(attacker.id, defender.id, selectedSkill, "command")

        //EXPPPPP
        EXPA += EXPAmod
        CurrEXP.set("current",EXPA);
        if (CurrEXP.get("current") >= 100){
            CurrEXP.set("current",CurrEXP.get("current")-100);
            //Get growths
            LvA.set("current", Number(LvA.get("current")) + 1);
            let Lvstr = "/me leveled up!";
            let HPG = Number(getAttrByName(attacker.id, 'hp_gtotal'));
            let StrG = Number(getAttrByName(attacker.id, 'str_gtotal'));
            let MagG = Number(getAttrByName(attacker.id, 'mag_gtotal'));
            let SklG = Number(getAttrByName(attacker.id, 'skl_gtotal'));
            let SpdG = Number(getAttrByName(attacker.id, 'spd_gtotal'));
            let LckG = Number(getAttrByName(attacker.id, 'lck_gtotal'));
            let DefG = Number(getAttrByName(attacker.id, 'def_gtotal'));
            let ResG = Number(getAttrByName(attacker.id, 'res_gtotal'));
            let growthslist = [HPG,StrG,MagG,SklG,SpdG,LckG,DefG,ResG];

            let HPi = Number(getAttrByName(attacker.id, 'hp_i'));
            let Stri = Number(getAttrByName(attacker.id, 'str_i'));
            let Magi = Number(getAttrByName(attacker.id, 'mag_i'));
            let Skli = Number(getAttrByName(attacker.id, 'skl_i'));
            let Spdi = Number(getAttrByName(attacker.id, 'spd_i'));
            let Lcki = Number(getAttrByName(attacker.id, 'lck_i'));
            let Defi = Number(getAttrByName(attacker.id, 'def_i'));
            let Resi = Number(getAttrByName(attacker.id, 'res_i'));
            let sprefix = [HPi,Stri,Magi,Skli,Spdi,Lcki,Defi,Resi];

            let HPSG = findObjs({ characterid: attacker.id, name: "HP_i", type: "attribute"})[0];
            let StrSG = findObjs({ characterid: attacker.id, name: "Str_i", type: "attribute"})[0];
            let MagSG = findObjs({ characterid: attacker.id, name: "Mag_i", type: "attribute"})[0];
            let SklSG = findObjs({ characterid: attacker.id, name: "Skl_i", type: "attribute"})[0];
            let SpdSG = findObjs({ characterid: attacker.id, name: "Spd_i", type: "attribute"})[0];
            let LckSG = findObjs({ characterid: attacker.id, name: "Lck_i", type: "attribute"})[0];
            let DefSG = findObjs({ characterid: attacker.id, name: "Def_i", type: "attribute"})[0];
            let ResSG = findObjs({ characterid: attacker.id, name: "Res_i", type: "attribute"})[0];
            let statslist = [HPSG,StrSG,MagSG,SklSG,SpdSG,LckSG,DefSG,ResSG];
            log(statslist);
            let slist = ["HP","Str","Mag","Skl","Spd","Lck","Def","Res"];
            for (var i = 0; i < growthslist.length - 1; i++){
                gi = growthslist[i];
                log(gi);
                if (randomInteger(100) < gi){
                    statslist[i].setWithWorker({current: sprefix[i] + 1});
                    if (gi > 100){
                        if (randomInteger(100) < gi){
                            Lvstr += "\n + 2 to "+ slist[i] + "!";
                            statslist[i].setWithWorker({current: sprefix[i] + 2});
                        } else{
                            Lvstr += "\n + 1 to "+ slist[i] + "!";
                        }
                    } else {
                        Lvstr += "\n + 1 to "+ slist[i] + "!";
                    }
                }
            }
            log(Lvstr);
            sendChat(who,Lvstr);
        }
    }
});

//turn
on("change:campaign:turnorder", function(turn) {
    var turnorder;
    var turncounter;
    if (Campaign().get("turnorder") == "") turnorder = [];
    else turnorder = JSON.parse(Campaign().get("turnorder"));
    for (var i in turnorder){
        if (turnorder[i].custom == "Turn Counter"){
            turncounter = turnorder[i]
        }
    }
    if (turnorder[0] !== turncounter){ //STRICT EQUALITY checking for if it's the turncounter's "turn"
        return;
    }
    let n = turncounter.pr ||0
    log(turncounter)
    log(n)
    Skills = filterObjs(function(obj) {
        if (obj.get('type') !== 'ability' || obj.get('action').indexOf('"triggertime": "turn"') == -1) return false;
        return obj;
    });
    log(Skills)
    if (Skills != []){
       for (i in Skills){
           let id = Skills[i].get('characterid');
           Skills[i] = JSON.parse(Skills[i].get("action"));
           Skills[i]["ID"] = id;
       }
    } else {
        return;
    }
    log(Skills)

    //Skills system, user-centric version
    let user;
        let RNGSklU;
        let RNGLuckU;
        let CurrHPU;
        let HPU;
        let StrU;
        let MagU;
        let SklU;
        let SpdU;
        let LckU;
        let DefU;
        let ResU;
        let HitU;
        let CritU;
        let AvoU;
        let DdgU;
        let DdgE;
        let DmgU;
        let DmgtypeU;
        let PhysmagU;
        let PhysmaginvU;
        let HPA;
        let CurrHPA;

        function Skill(userid, obj, triggertime) { //haha END ME
            if (typeof obj != "object") {
                log("obj is not an object :(")
                return;
            }
            if (obj.triggertime != "turn"){ //JUST making sure
                return;
            }
            //no whotriggered checking because it'll always be the attacker
            log("Okay, first barrier passed")
            user = "attacker";
            RNGSklU = Number(getAttrByName(userid, 'skl_total'));
            RNGLckU = Number(getAttrByName(userid, 'lck_total'));
            CurrHPU = findObjs({
                characterid: userid,
                name: "HP_current"
            })[0];
            let who = findObjs({ //get the first token on the page that represents the given user
                type: "character",
                id: userid
            })[0].get("name") || "User"
            HPA = Number(getAttrByName(userid, 'hp_current'));
            DmgtypeU = ""
            DmgtypeE = "" //doesn't matter since commands are non-combative anyways
            Usertoken = findObjs({ //get the first token on the page that represents the given user
                type: "graphic",
                subtype: "token",
                represents: userid
            })[0];
            //stat definitions
            HPU = findObjs({
                characterid: userid,
                name: "HP_bd"
            })[0];
            StrU = findObjs({
                characterid: userid,
                name: "Str_bd"
            })[0];
            MagU = findObjs({
                characterid: userid,
                name: "Mag_bd"
            })[0];
            SklU = findObjs({
                characterid: userid,
                name: "Skl_bd"
            })[0];
            SpdU = findObjs({
                characterid: userid,
                name: "Spd_bd"
            })[0];
            LckU = findObjs({
                characterid: userid,
                name: "Lck_bd"
            })[0];
            DefU = findObjs({
                characterid: userid,
                name: "Def_bd"
            })[0];
            ResU = findObjs({
                characterid: userid,
                name: "Res_bd"
            })[0];

            //nice stat-variables for use in expressions and such
            let HP_StatU = getAttrByName(userid, 'hp_total');
            let HP_CurrU = getAttrByName(userid, 'hp_current');
            let Str_StatU = getAttrByName(userid, 'str_total');
            let Mag_StatU = getAttrByName(userid, 'mag_total');
            let Skl_StatU = getAttrByName(userid, 'skl_total');
            let Spd_StatU = getAttrByName(userid, 'spd_total');
            let Lck_StatU = getAttrByName(userid, 'lck_total');
            let Def_StatU = getAttrByName(userid, 'def_total');
            let Res_StatU = getAttrByName(userid, 'res_total');

            let rng;
            if (obj.rng == "Skill") {
                rng = RNGSklU;
            }
            if (obj.rng == "Luck") {
                rng = RNGLckU;
            }
            if ((obj.customcond != "none") && (eval(obj.customcond) != true)) {
                return;
            }
            if ((obj.turncond != "none") && (eval(obj.turncond) != true)) {
                return;
            }
            log(obj.rng)

            //actual skill function
            function skillMain() {
                //No Physmag :O

                /* Parse damage and HP modifiers- normally eval() is incredibly dangerous and
                usually Shouldn't Be Used Under Any Circumstance Ever, but the Roll20 API sandboxes it,
                so I think it should be alright. Oh well!*/
                let HealmodU = parseInt(eval(obj.u_healfactor));
                log("HealmodU is" + HealmodU)

                let statnames = ["HP", "Str", "Mag", "Skl", "Spd", "Lck", "Def", "Res"];

                //determining the actual stat target
                if (obj.u_stat_target != "none") {
                    for (var r in statnames) {
                        if (obj.u_stat_target == statnames[r]) {
                            StattargetU = eval(statnames[r] + "U");
                        }
                    }
                }
                let StattargetmodU = eval(obj.u_stat_targetmod);

                if (obj.u_stat_target != "none") {
                    StattargetU.setWithWorker({
                        current: Number(StattargetU.get("current")) + Number(StattargetmodU)
                    });
                    log("Set targeted stat to " + StattargetU.get("current"));
                }

                HPA = parseInt(HPA) + HealmodU; //this has to be here because sometimes it'll be stupid and overflow if it's not >:(
                log(HPA)

                if (obj.radius != 0) {
                    //tortured screaming
                    let tokenInRadius = filterObjs(function(token) {
                        if ((token.get('type') !== 'graphic' || token.get('subtype') !== 'token' || token.get('represents') == "") || ManhDist(Usertoken, token) > obj.radius || token.get("represents") == Usertoken.get("represents")) return false;
                        else return true;
                    });
                    log("Tokens in radius are: ")
                    for (var i in tokenInRadius) {
                        log(tokenInRadius[i])
                            //stat targets
                        let char = tokenInRadius[i].get("represents")
                        let HPcurrC = findObjs({
                            characterid: char,
                            name: "HP_current"
                        })[0];
                        let StrC = findObjs({
                            characterid: char,
                            name: "Str_bd"
                        })[0];
                        let MagC = findObjs({
                            characterid: char,
                            name: "Mag_bd"
                        })[0];
                        let SklC = findObjs({
                            characterid: char,
                            name: "Skl_bd"
                        })[0];
                        let SpdC = findObjs({
                            characterid: char,
                            name: "Spd_bd"
                        })[0];
                        let LckC = findObjs({
                            characterid: char,
                            name: "Lck_bd"
                        })[0];
                        let DefC = findObjs({
                            characterid: char,
                            name: "Def_bd"
                        })[0];
                        let ResC = findObjs({
                            characterid: char,
                            name: "Res_bd"
                        })[0];
                        let HitC = findObjs({
                            characterid: char,
                            name: "Hitmod"
                        })[0];
                        let CritC = findObjs({
                            characterid: char,
                            name: "Critmod"
                        })[0];
                        let AvoC = findObjs({
                            characterid: char,
                            name: "Avomod"
                        })[0];
                        let DdgC = findObjs({
                            characterid: char,
                            name: "Ddgmod"
                        })[0];

                        //numerical stats
                        let HPcurrStat = getAttrByName(char, 'HP_current');
                        let StrStat = getAttrByName(char, 'Str_total');
                        let MagStat = getAttrByName(char, 'Mag_total');
                        let SklStat = getAttrByName(char, 'Skl_total');
                        let SpdStat = getAttrByName(char, 'Spd_total');
                        let LckStat = getAttrByName(char, 'Lck_total');
                        let DefStat = getAttrByName(char, 'Def_total');
                        let ResStat = getAttrByName(char, 'Res_total');
                        let HitStat = getAttrByName(char, 'Hit');
                        let CritStat = getAttrByName(char, 'Crit');
                        let AvoStat = getAttrByName(char, 'Avo');
                        let DdgStat = getAttrByName(char, 'Ddg');

                        let effect = eval(obj.radius_effect); //effect MUST be an array!!!
                        let rad_effect = Number(effect[0].get("current")) + parseInt(Number(effect[1]))

                        log(effect[0].get("current"))
                        effect[0].setWithWorker({
                            current: rad_effect
                        });
                        log(effect[0].get("current"))

                        if ((effect[0] == HPcurrC) && (char == userid)) {
                            HPA += parseInt(effect[1])
                        }

                    }
                }

                CurrHPU.setWithWorker({
                    current: HPA
                });
                //recursionnn
                if (obj.children_skills != []) {
                    for (var y in obj.children_skills) {
                        let Child_Skill = JSON.parse(obj.children_skills[y]);
                        Skill(userid, Child_Skill, "any"); //child implementations of preexisting skills should have the triggertime "any" as well
                    }
                }

                let Chatstr;
                if (obj.custom_string != "") {
                    Chatstr = '<b style = "color: #4055df;">' + obj.custom_string + "</b>\n"
                } else {
                    Chatstr = '<b style = "color: #4055df;">' + obj.name + " activated!</b>\n"
                }
                sendChat(who, Chatstr);
            }

            if (obj.rng != "none") {
                if (randomInteger(100) < (rng * obj.rngmod)) {
                    skillMain();
                } else {
                    log("RIP RNG")
                    return;
                }

            } else { //Plain ol' skill trigger
                log("Regular skillmain")
                skillMain();
            }
        }
        for (var j in Skills){
            Skill(Skills[i].ID, Skills[i], "turn")
        }
});
