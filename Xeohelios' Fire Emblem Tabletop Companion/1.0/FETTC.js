/*jshint esversion: 6 */
//credit to Brian on the forums for this framework!
on('chat:message', function(msg) {
    if (msg.type != 'api') return;
    var parts = msg.content.split(' ');
    var command = parts.shift().substring(1);
    function ManhDist(token1,token2) { //Manhattan Distance in tiles between two units
        let AXCoord = token1.get("left");
        let AYCoord = token1.get("top");
        let BXCoord = token2.get("left");
        let BYCoord = token2.get("top");
        let diff = parseInt((Math.abs(AXCoord - BXCoord))+(Math.abs(AYCoord - BYCoord)));
        return (diff/70)
    }
    var turnorder;
    if (Campaign().get("turnorder") == "") turnorder = [];
    else turnorder = JSON.parse(Campaign().get("turnorder"));
    log(turnorder[0])

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
        let Chatstr = AName + ' attacks ' + DName + '!\n';

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
        let HPA = getAttrByName(attacker.id, 'hp_current');
        let HPB = getAttrByName(defender.id, 'hp_current');
        let StrA = getAttrByName(attacker.id, 'str_total');
        let StrB = getAttrByName(defender.id, 'str_total');
        let MagA = getAttrByName(attacker.id, 'mag_total');
        let MagB = getAttrByName(defender.id, 'mag_total');
        let SklA = getAttrByName(attacker.id, 'skl_total');
        let SklB = getAttrByName(defender.id, 'skl_total');
        let SpdA = getAttrByName(attacker.id, 'spd_total');
        let SpdB = getAttrByName(defender.id, 'spd_total');
        let LckA = getAttrByName(attacker.id, 'lck_total');
        let LckB = getAttrByName(defender.id, 'lck_total');
        let DefA = getAttrByName(attacker.id, 'def_total');
        let DefB = getAttrByName(defender.id, 'def_total');
        let ResA = getAttrByName(attacker.id, 'res_total');
        let ResB = getAttrByName(defender.id, 'res_total');

        //Grab weapon stats
        let WNameA = getAttrByName(attacker.id, 'f_WName');
        let WNameB = getAttrByName(defender.id, 'f_WName');
        let WTypeA = getAttrByName(attacker.id, 'f_WType');
        let WTypeB = getAttrByName(defender.id, 'f_WType');
        let MtA = getAttrByName(attacker.id, 'f_Mt');
        let MtB = getAttrByName(defender.id, 'f_Mt');
        let WtA = getAttrByName(attacker.id, 'f_Wt');
        let WtB = getAttrByName(defender.id, 'f_Wt');
        let Range1A = getAttrByName(attacker.id, 'f_Range1');
        let Range1B = getAttrByName(defender.id, 'f_Range1');
        let Range2A = getAttrByName(attacker.id, 'f_Range2');
        let Range2B = getAttrByName(defender.id, 'f_Range2');
        let WRankA = getAttrByName(attacker.id, 'f_WRank');
        let WRankB = getAttrByName(defender.id, 'f_WRank');
        log(WRankA);
        log(WRankB);
        let fIDA = findObjs({ characterid: attacker.id, name: "fid"})[0];
        let fIDB = findObjs({ characterid: defender.id, name: "fid"})[0];
        log(fIDA);
        log(fIDB);
        let UsesA;
        let UsesB;
        //check for no rows
        if (fIDA.get("current") == ""){
            UsesA = 68932;
            log("No weapon! :0");
        } else {
            UsesA = findObjs({ characterid: attacker.id, name: "repeating_weapons_"+fIDA.get("current")+"_Uses"},{ caseInsensitive: true })[0];
        }
        if (fIDB.get("current") == ""){
            UsesB = 68932;
        } else {
            UsesB = findObjs({ characterid: defender.id, name: "repeating_weapons_"+fIDB.get("current")+"_Uses"},{ caseInsensitive: true })[0];
        }
        log(UsesA);
        log(UsesB);
        let StrengthsA = getAttrByName(attacker.id, 'f_Strengths');
        let StrengthsB = getAttrByName(defender.id, 'f_Strengths');
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
        log(SwordUA);

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
        //Weapon Rank threshold values
        let WRankA_num;
        let WRankB_num;
        const LRanks = [{num: 0, rank: "E"},{num: 30, rank: "D"},{num: 70, rank: "C"},{num: 120, rank: "B"},{num: 180, rank: "A"},{num: 250, rank: "S"},{num: 999, rank: "UU"}];
        //check for which rank
        for (var h in LRanks){
            log(LRanks[h]);
            if (LRanks[h].rank == WRankA){
                WRankA_num = LRanks[h].num;
            }
        }
        for (var j in LRanks){
            log(LRanks[j]);
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
        if ( ( StrengthsA.includes("Beast") && WeaknessB.includes("Beast")) || ( StrengthsA.includes("Flier") && WeaknessB.includes("Flier")) || ( StrengthsA.includes("Dragon") && WeaknessB.includes("Dragon")) || ( StrengthsA.includes("Armor") && WeaknessB.includes("Armor"))){
            MtA *= 3;
            Chatstr += "Attacker has weapon effectiveness! \n";
        }
        if ( ( StrengthsB.includes("Beast") && WeaknessA.includes("Beast")) || ( StrengthsB.includes("Flier") && WeaknessA.includes("Flier")) || ( StrengthsB.includes("Dragon") && WeaknessA.includes("Dragon")) || ( StrengthsB.includes("Armor") && WeaknessA.includes("Armor"))){
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
                UsesA.setWithWorker({current: Number(UsesA.get("current")) - 2});
            }
            log("Is an object!");
        } else {
            log("Not an object!");
            function DecUsesA() {
                UsesA -= 2;
            }
        }
        if (typeof(UsesB) === "object"){
            function DecUsesB() {
                UsesA.setWithWorker({current: Number(UsesB.get("current")) - 1});
            }
            log("Is an object!");
        } else {
            log("Not an object!");
            function DecUsesB() {
                UsesB -= 2;
            }
        }


        let SkillsA = findObjs({ characterid: attacker.id, type: "ability"});
        for (var i in SkillsA){
            SkillsA[i] = SkillsA[i].get("action");
            SkillsA[i] = JSON.parse(SkillsA[i])
        }
        log(SkillsA)

        let SkillsB = findObjs({ characterid: defender.id, type: "ability"});
        for (var i in SkillsB){
            SkillsB[i] = SkillsB[i].get("action");
            SkillsB[i] = JSON.parse(SkillsB[i])
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
        let StattargetU;
        let StattargetE;

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
                //stat definitions
                log("Skill user is attacker");
                user = "attacker";
                RNGSklU = SklA;
                RNGLuckU = LckA;
                CurrHPU = CurrHPA;
                CurrHPE = CurrHPB;
                HPU = findObjs({
                    characterid: attacker.id,
                    name: "HP_bd"
                })[0];
                HPE = findObjs({
                    characterid: defender.id,
                    name: "HP_bd"
                })[0];
                StrU = findObjs({
                    characterid: attacker.id,
                    name: "Str_bd"
                })[0];
                StrE = findObjs({
                    characterid: defender.id,
                    name: "Str_bd"
                })[0];
                MagU = findObjs({
                    characterid: attacker.id,
                    name: "Mag_bd"
                })[0];
                MagE = findObjs({
                    characterid: defender.id,
                    name: "Mag_bd"
                })[0];
                SklU = findObjs({
                    characterid: attacker.id,
                    name: "Skl_bd"
                })[0];
                SklE = findObjs({
                    characterid: defender.id,
                    name: "Skl_bd"
                })[0];
                SpdU = findObjs({
                    characterid: attacker.id,
                    name: "Spd_bd"
                })[0];
                SpdE = findObjs({
                    characterid: defender.id,
                    name: "Spd_bd"
                })[0];
                LckU = findObjs({
                    characterid: attacker.id,
                    name: "Lck_bd"
                })[0];
                LckE = findObjs({
                    characterid: defender.id,
                    name: "Lck_bd"
                })[0];
                DefU = findObjs({
                    characterid: attacker.id,
                    name: "Def_bd"
                })[0];
                DefE = findObjs({
                    characterid: defender.id,
                    name: "Def_bd"
                })[0];
                ResU = findObjs({
                    characterid: attacker.id,
                    name: "Res_bd"
                })[0];
                ResE = findObjs({
                    characterid: attacker.id,
                    name: "Res_bd"
                })[0];
                DmgtypeU = DmgtypeA;
                DmgtypeE = DmgtypeB;
                Usertoken = selectedToken;

            } else if ((userid == defender.id) && (obj.u_wepreq.indexOf(WTypeB) != -1) && (obj.e_wepreq.indexOf(WTypeA) != -1)) {
                log("User is defender");
                user = "defender";
                log("Skill user is defender")
                RNGSklU = SklB;
                RNGLuckU = LckB;
                CurrHPU = CurrHPB;
                CurrHPE = CurrHPA;
                HPU = findObjs({
                    characterid: defender.id,
                    name: "HP_bd"
                })[0];
                HPE = findObjs({
                    characterid: attacker.id,
                    name: "HP_bd"
                })[0];
                StrU = findObjs({
                    characterid: defender.id,
                    name: "Str_bd"
                })[0];
                StrE = findObjs({
                    characterid: attacker.id,
                    name: "Str_bd"
                })[0];
                MagU = findObjs({
                    characterid: defender.id,
                    name: "Mag_bd"
                })[0];
                MagE = findObjs({
                    characterid: attacker.id,
                    name: "Mag_bd"
                })[0];
                SklU = findObjs({
                    characterid: defender.id,
                    name: "Skl_bd"
                })[0];
                SklE = findObjs({
                    characterid: attacker.id,
                    name: "Skl_bd"
                })[0];
                SpdU = findObjs({
                    characterid: defender.id,
                    name: "Spd_bd"
                })[0];
                SpdE = findObjs({
                    characterid: attacker.id,
                    name: "Spd_bd"
                })[0];
                LckU = findObjs({
                    characterid: defender.id,
                    name: "Lck_bd"
                })[0];
                LckE = findObjs({
                    characterid: attacker.id,
                    name: "Lck_bd"
                })[0];
                DefU = findObjs({
                    characterid: defender.id,
                    name: "Def_bd"
                })[0];
                DefE = findObjs({
                    characterid: attacker.id,
                    name: "Def_bd"
                })[0];
                ResU = findObjs({
                    characterid: defender.id,
                    name: "Res_bd"
                })[0];
                ResE = findObjs({
                    characterid: attacker.id,
                    name: "Res_bd"
                })[0];
                DmgtypeU = DmgtypeB;
                DmgtypeE = DmgtypeA;
                Usertoken = targetToken;

            } else {
                log("You probably don't have the right weapons")
                return;
            }

            let rng;
            if (obj.rng == "Skill") {
                rng = RNGSklU;
            }
            if (obj.rng == "Luck") {
                rng = RNGLckU;
            }
            log(obj.rng)

            //actual skill function
            function skillMain(){
                //PhysmagE
                if (DmgtypeE == "Physical" || DmgtypeE == "Firearm") {
                    PhysmagE = getAttrByName(targetid, "str_total");
                    log(targetid)
                } else {
                    PhysmagE = getAttrByName(targetid, "mag_total");
                } //I would add a def/res parameter, but I'm just going to be lazy and use the defense AND resistance definition for Luna.
                log("PhysmagE is " + PhysmagE)

                //PhysmagU
                if (DmgtypeU == "Physical" || DmgtypeU == "Firearm") {
                    PhysmagU = getAttrByName(userid, "str_total");
                    log(targetid)
                } else {
                    PhysmagU = getAttrByName(userid, "mag_total");
                }
                log("PhysmagU is " + PhysmagU)

                /* Parse damage and HP modifiers- normally eval() is incredibly dangerous and
                usually Shouldn't Be Used Under Any Circumstance Ever, but the Roll20 API sandboxes it,
                so I think it should be alright. Oh well!*/
                let DamagemodU = eval(obj.u_damagemod);
                log("Damage mod is " + DamagemodU)
                let DamagemodE = eval(obj.e_damagemod);
                let HealmodU = eval(obj.u_healfactor);
                let HealmodE = eval(obj.e_healfactor);

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
                }
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

                        //numerical stats
                        let HPcurrStat = getAttrByName(char, 'HP_current');
                        let StrStat = getAttrByName(char, 'Str_bd');
                        let MagStat = getAttrByName(char, 'Mag_bd');
                        let SklStat = getAttrByName(char, 'Skl_bd');
                        let SpdStat = getAttrByName(char, 'Spd_bd');
                        let LckStat = getAttrByName(char, 'Lck_bd');
                        let DefStat = getAttrByName(char, 'Def_bd');
                        let ResStat = getAttrByName(char, 'Res_bd');

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

                Chatstr += obj.name + " activated!\n"
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
        let AXCoord = selectedToken.get("left");
        let AYCoord = selectedToken.get("top");
        let BXCoord = targetToken.get("left");
        let BYCoord = targetToken.get("top");
        let diff = parseInt((Math.abs(AXCoord - BXCoord))+(Math.abs(AYCoord - BYCoord)));
        log(diff/70 + " tiles away!");
        let css = {
            attack: 'style = "color: #353535"'
        };
        if (CanAttackA == true) {
            if (((Range1A) <= (diff/70)) && ((diff/70) <= (Range2A))){
                Chatstr += AName+ "'s attack is in range! \n";
                if (randomInteger(100) < (HitA - AvoB)){
                    Chatstr += AName + "'s attack hits! \n";

                    //Battle skill trigger
                    for (i in SkillsA){
                        Skill(attacker.id, defender.id, SkillsA[i], "during");
                    }

                    //Check if attack crits
                    if (randomInteger(100) < (CritA - DdgB)){
                        DmgA *= 3;
                        Chatstr += AName+ " crits! \n";
                    }
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
            } else {
                Chatstr += AName + "'s attack is not in range! \n";
            }
        } else {
            Chatstr += AName +" cannot attack!";
        }

        if (CanAttackB == true){
            //Check if defender's attack hits
            if (((Range1B) <= (diff/70)) && ((diff/70) <= (Range2B))){
                Chatstr += DName + "'s attack is in range! \n";
                if (randomInteger(100) < (HitB - AvoA)){
                    Chatstr += DName+ "'s attack hits!";

                    //battle skill trigger
                    for (i in SkillsB){
                        Skill(defender.id, attacker.id, SkillsB[i], "before");
                    }

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
            } else {
                Chatstr += DName + "'s attack is not in range!";
            }
        } else {
            Chatstr += "\n"+ DName +" cannot attack!";
        }

        //Attacker doubles; I don't think I should need to do usability checking for doubleattacking since it's checked within the battle calc
        if ((DoubleA === true) && (CanAttackA == true)){
            Chatstr += "\n"+ AName+ " doubleattacks! \n";
            if (randomInteger(100) < (HitA - AvoB)){
                Chatstr += AName+ "'s attack hits!";
                for (i in SkillsA){
                    Skill(attacker.id, defender.id, SkillsA[i], "during");
                }
                //Check if attack crits
                if (randomInteger(100) < (CritA - DdgB)){
                    DmgA *= 3;
                    Chatstr += "\n"+ AName+ " crits!";
                }
                HPB -= DmgA;
                CurrHPB.set("current", HPB);
                CWRVal += 2;
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
                    //Check if attack crits
                    if (randomInteger(100) < (CritA - DdgB)){
                        DmgA *= 3;
                        Chatstr += AName+ " crits! \n";
                    }
                    HPB -= DmgA;
                    CurrHPB.set("current", HPB);
                    CWRVal += 2;
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
                    //Check if attack crits
                    if (randomInteger(100) < (CritA - DdgB)){
                        DmgA *= 3;
                        Chatstr += AName+ " crits! \n";
                    }
                    HPB -= DmgA;
                    CurrHPB.set("current", HPB);
                    CWRVal += 2;
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
        if ((DoubleB === true) && (CanAttackB == true)){
            Chatstr += "\n"+ DName+ " doubleattacks! \n";
            if (randomInteger(100) < (HitB - AvoA)){
                Chatstr += DName+ "'s attack hits! \n";
                for (i in SkillsB){
                    Skill(defender.id, attacker.id, SkillsB[i], "during");
                }
                //Check if attack crits
                if (randomInteger(100) < (CritB - DdgA)){
                    DmgB *= 3;
                    Chatstr += DName+ " crits! \n";
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
                    //Check if attack crits
                    if (randomInteger(100) < (CritB - DdgA)){
                        DmgB *= 3;
                        Chatstr += DName+ " crits! \n";
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
                    //Check if attack crits
                    if (randomInteger(100) < (CritB - DdgA)){
                        DmgB *= 3;
                        Chatstr += DName+ " crits! \n";
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
        EXPA += (10 + ((InLvB-InLvA)*3));
        log(EXPA);
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
//items
on('chat:message', function(msg) {
    // Do nothing for messages which aren't API commands
    if (msg.type != 'api') return;

    // Each parameter in the API command is separated by a space, and the first part is the command itself
    var parts = msg.content.split(' ');
    // I like to remove the exclamation point at the start of the command name, but it's not required
    var command = parts.shift().substring(1);

    // Don't run your API command logic if some other command was sent!
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
});
//staves
on('chat:message', function(msg) {
    if (msg.type != 'api') return;
    var parts = msg.content.split(' ');
    var command = parts.shift().substring(1);

    // Don't run if it's any other command
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
        let WNameA = getAttrByName(staffer.id, 'f_WName');
        let WTypeA = getAttrByName(staffer.id, 'f_WType');
        let MtA = getAttrByName(staffer.id, 'f_Mt');
        let WtA = getAttrByName(staffer.id, 'f_Wt');
        let Range1A = getAttrByName(staffer.id, 'f_Range1');
        let Range2A = getAttrByName(staffer.id, 'f_Range2');
        let AXCoord = selectedToken.get("left");
        let AYCoord = selectedToken.get("top");
        let BXCoord = targetToken.get("left");
        let BYCoord = targetToken.get("top");
        let diff = parseInt((Math.abs(AXCoord - BXCoord))+(Math.abs(AYCoord - BYCoord)));
        log(diff)
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

        const staveslist = [Heal,Mend,Physic,Recover,Fortify,Bloom_Festal,Sun_Festal,Wane_Festal,Moon_Festal,Great_Festal,Freeze,Enfeeble,Entrap,Rescue,Silence,Hexing_Rod];
        //Script stuff here
        if (WTypeA != "Staves/Rods"){
            chatstr += "\n Weapon is not a staff!"
        } else {
            for (var i in staveslist){
                if (staveslist[i].name === WNameA){
                    j = staveslist[i];
                    //check for range
                    log("Range "+ ((Range1A) <= (diff/70)) && ((diff/70) <= (Range2A)))
                    if (((Range1A) <= (diff/70)) && ((diff/70) <= (Range2A))){
                        if (j.type === "healing"){
                            //Set with workers in respect to total caps
                            HPVal = Number(CurrHPB.get("current")) + j.effect
                            CurrHPB.setWithWorker({current: HPVal})
                            chatstr += "\n" + targetToken.get("name") + " is healed for " + String(j.effect) + " HP!"
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
});
