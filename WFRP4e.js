/*Warhammer Fantasy 4th Edition Scripts.
All creative credit to GW and Cubicle 7
I'm just a code slave who hammered this crap out.
I'm sure there's a better way... I just don't know how to do it.
Feel free to make improvements.
-Coogerbate

P.S. Thanks to Jonah, Phoenix35, and ((())) from Coding Core Discord for the help!

!help for help
*/

on("chat:message", function(msg) {
    if (msg.type === "api" && msg.content.startsWith("!critloc")) {
    const loc = msg.content.split(/\s+/u)[1] || Math.floor(Math.random() * 100) +1;
    
    if (loc <= 9){
        var locmsg = "Your blow strikes your opponent's head.";
    }
    else if (10 <= loc && loc <=24)
    {
        var locmsg = "Your blow strikes your opponent's Left (or Secondary) Arm.";
    }
    else if (25 <= loc && loc <=44)
    {
        var locmsg = "Your blow strikes your opponent's Right (or Primary) Leg.";
    }
    else if (45 <= loc && loc <=79)
    {
        var locmsg = "Your blow strikes your opponent's Body.";
    }
    else if (80 <= loc && loc <=89)
    {
        var locmsg = "Your blow strikes your opponent's Left Leg.";
    }
    else if (90 <= loc && loc <=100)
    {
        var locmsg = "Your blow strikes your opponent's Right Leg.";
    }
    sendChat(msg.who, loc + "%, " + locmsg);
  }
  else if (msg.type === "api" && msg.content.startsWith("!oops")) {
    const oops = msg.content.split(/\s+/u)[1] || Math.floor(Math.random() * 100) +1;
    
    if (oops <= 20){
        var oopsmsg = "You catch a part of your anatomy (we recommend you play this for laughs) — lose 1 Wound, ignoring Toughness Bonus or Armour Points.";
    }
    else if (21 <= oops && oops <=40)
    {
        var oopsmsg = "Your melee weapon jars badly, or ranged weapon malfunctions or slightly breaks – your weapon suffers 1 Damage. Next round, you will act last regardless of Initiative order, Talents, or special rules as you recover (see page 156).";
    }
    else if (41 <= oops && oops <=60)
    {
        var oopsmsg = "Your manoeuvre was misjudged, leaving you out of position, or you lose grip of a ranged weapon. Next round, your Action suffers a penalty of –10.";
    }
    else if (61 <= oops && oops <=70)
    {
        var oopsmsg = "You stumble badly, finding it hard to right yourself. Lose your next Move.";
    }
    else if (71 <= oops && oops <=80)
    {
        var oopsmsg = "You mishandle your weapon, or you drop your ammunition. Miss your next Action.";
    }
    else if (81 <= oops && oops <=90)
    {
        var oopsmsg = "You overextend yourself or stumble and twist your ankle. Suffer a Torn Muscle (Minor) injury (see page 179). This counts as a Critical Wound.";
    }
    else if (91 <= oops && oops <=100)
    {
        var oopsmsg = "You completely mess up, hitting 1 random ally in range using your rolled units die to determine the SL of the hit. If that’s not possible, you somehow hit yourself in the face and gain a Stunned Condition (see page 169).";
    }
    sendChat(msg.who, oops + "%, " + oopsmsg);
  }
  else if (msg.type === "api" && msg.content.startsWith("!crithead")) {
    const head = msg.content.split(/\s+/u)[1] || Math.floor(Math.random() * 100) +1;
    
    if (head <= 10){
        var headmsg = "Dramatic Injury.  A fine wound across the forehead and cheek. Gain 1 Bleeding Condition. Once the wound is healed, the impressive scar it leaves provides a bonus of +1 SL to appropriate social Tests. You can only gain this benefit once.  Take 1 wound.";
    }
    else if (11 <= head && head <=20)
    {
        var headmsg = "Minor Cut. The strike opens your cheek and blood flies everywhere. Gain 1 Bleeding Condition. Take 1 wound.";
    }
	else if (21 <= head && head <=25)
    {
        var headmsg = "Poked Eye. The blow glances across your eye socket. Gain 1 Blinded condition. Take 1 wound.";
    }
	else if (26 <= head && head <=30)
    {
        var headmsg = "Ear Bash. Your ear takes a sickening impact, leaving it ringing. The Gain 1 Deafened Condition. Take 1 wound.";
    }
	else if (31 <= head && head <=35)
    {
        var headmsg = "Rattling Blow. The blow floods your vision with spots and flashing lights. Gain 1 Stunned Condition. Take 2 wounds.";
    }
	else if (36 <= head && head <=40)
    {
        var headmsg = "Black Eye. A solid blow hits your eye, leaving tears and much pain. Gain 2 Blinded Conditions. Take 2 wounds.";
    }
	else if (41 <= head && head <=45)
    {
        var headmsg = "Sliced Ear. Your side of your head takes a hard blow, cutting deep into your ear. Gain 2 Deafened and 1 Bleeding Condition. Take 2 wounds.";
    }
	else if (46 <= head && head <=50)
    {
        var headmsg = "Struck Forehead. A solid blow thumps into the centre of your forehead. Gain 2 Bleeding Conditions and a Blinded Condition that cannot be removed until all Bleeding Conditions are removed. Take 2 wounds.";
    }
	else if (51 <= head && head <=55)
    {
        var headmsg = "Fractured Jaw. With a sickening crunch, pain fills your face as the blow fractures your jaw. Gain 2 Stunned Conditions. Suffer a Broken Bone (Minor) injury.  Take 3 wounds.";
    }
	else if (56 <= head && head <=60)
    {
        var headmsg = "Major Eye Wound. The blow cracks across your eye socket. Gain 1 Bleeding Condition. Also gain 1 Blinded Condition that cannot be removed until you receive Medical Attention. Take 3 wounds.";
    }
	else if (61 <= head && head <=65)
    {
        var headmsg = "Major Ear Wound. The blow damages your ear, leaving you with permanent hearing loss in one ear. Suffer a –20 penalty on all Tests relating to hearing. If you suffer this result again, your hearing is permanently lost as the second ear falls quiet. Only magic can heal this. Take 3 wounds.";
    }
	else if (66 <= head && head <=70)
    {
        var headmsg = "Broken Nose. A solid blow to the centre of your face causing blood to pour. Gain 2 Bleeding Conditions. Make a Challenging (+0) Endurance Test, or also gain a Stunned Condition. After this wound has healed, gain +1/–1 SL on social rolls, depending on context, unless Surgery is used to reset the nose. Take 3 wounds.";
    }
	else if (71 <= head && head <=75)
    {
        var headmsg = "Broken Jaw. The crack is sickening as the blow hits you under the chin, breaking your jaw. Gain 3 Stunned Conditions. Make a Challenging (+0) Endurance Test or gain an Unconscious Condition. Suffer a Broken Bone (Major) injury. Take 4 wounds.";
    }
	else if (76 <= head && head <=80)
    {
        var headmsg = "Concussive Blow. Your brain rattles in your skull as blood spurts from your nose and ears. Take 1 Deafened , 2 Bleeding , and 1d10 Stunned Conditions. Gain a Fatigued Condition that lasts for 1d10 days. If you receive another Critical Wound to your head while suffering this Fatigued Condition, make an Average (+20) Endurance Test or also gain an Unconscious Condition. Take 4 wounds.";
    }
	else if (81 <= head && head <=85)
    {
        var headmsg = "Smashed Mouth. With a sickening crunch, your mouth is suddenly filled with broken teeth and blood. Gain 2 Bleeding Conditions. Lose 1d10 teeth — Amputation (Easy). Take 4 wounds.";
    }
	else if (86 <= head && head <=90)
    {
        var headmsg = "Mangled Ear. Little is left of your ear as the blow tears it apart. You gain 3 Deafened and 2 Bleeding Conditions. Lose your ear —Amputation (Average).  Take 4 wounds.";
    }
	else if (91 <= head && head <=93)
    {
        var headmsg = "Devastated Eye. A strike to your eye completely bursts it, causing extraordinary pain. Gain 3 Blinded , 2 Bleeding , and 1 Stunned Condition. Lose your eye — Amputation (Difficult). Take 5 wounds.";
    }
	else if (94 <= head && head <=96)
    {
        var headmsg = "Disfiguring Blow. The blow smashes your entire face, destroying your eye and nose in a cloud of blood. Gain 3 Bleeding , 3 Blinded and 2 Stunned Conditions. Lose your eye and nose — Amputation (Hard). Take 5 wounds.";
    }
	else if (97 <= head && head <=99)
    {
        var headmsg = "Mangled Jaw. The blow almost removes your jaw as it utterly destroys your tongue, sending teeth flying in a shower of blood. Gain 4 Bleeding and 3 Stunned Conditions. Make a Very Hard (–30) Endurance Test or gain an Unconscious Condition. Suffer a Broken Bone (Major) injury and lose your tongue and 1d10 teeth —Amputation (Hard). Take 5 wounds.";
    }
	else if (head == 100)
    {
        var headmsg = "Decapitated. Your head is entirely severed from your neck and soars through the air, landing 1d10 feet away in a random direction (see Scatter). Your body collapses, instantly dead. The good news is that you don't take any wounds.";
    }
    sendChat(msg.who, head + "%, " + headmsg);
  }
  else if (msg.type === "api" && msg.content.startsWith("!critarm")) {
    const arm = msg.content.split(/\s+/u)[1] || Math.floor(Math.random() * 100) +1;
    
    if (arm <= 10){
        var armmsg = "Jarred Arm. Your arm is jarred in the attack. Drop whatever was held in that hand. Take 1 wound.";
    }
    else if (11 <= arm && arm <=20)
    {
        var armmsg = "Minor cut. Gain a Bleeding Condition as your upper arm is cut badly. Take 1 wound.";
    }
	else if (21 <= arm && arm <=25)
    {
        var armmsg = "Sprain. You sprain your arm, suffering a Torn Muscle (Minor) injury. Take 1 wound.";
    }
	else if (26 <= arm && arm <=30)
    {
        var armmsg = "Badly Jarred Arm. Your arm is badly jarred in the attack. Drop whatever was held in that hand, which is useless for 1d10 – Toughness Bonus Rounds (minimum 1). For this time, treat the hand as lost (see Amputated Parts). Take 2 wounds.";
    }
	else if (31 <= arm && arm <=35)
    {
        var armmsg = "Torn Muscles. The blow slams into your forearm. Gain a Bleeding Condition and a Torn Muscle (Minor) injury. Take 2 wounds.";
    }
	else if (36 <= arm && arm <=40)
    {
        var armmsg = "Bleeding Hand. Your hand is cut badly, making your grip slippery. Take 1 Bleeding Condition. While suffering from that Bleeding Condition, make an Average (+20) Dexterity Test before taking any Action that requires something being held in that hand; if you fail, the item slips from your grip. Take 2 wounds.";
    }
	else if (41 <= arm && arm <=45)
    {
        var armmsg = "Wrenched Arm. Your arm is almost pulled from its socket. Drop whatever is held in the associated hand; the arm is useless for 1d10 Rounds (see Amputated Parts). Take 2 wounds.";
    }
	else if (46 <= arm && arm <=50)
    {
        var armmsg = "Gaping Wound. The blow opens a deep, gaping wound. Gain 2 Bleeding Conditions. Until you receive Surgery to stitch up the cut, any associated Arm Damage you receive will also inflict 1 Bleeding Condition as the wound reopens. Take 3 wounds.";
    }
	else if (51 <= arm && arm <=55)
    {
        var armmsg = "Clean Break. An audible crack resounds as the blow strikes your arm. Drop whatever was held in the associated hand and gain a Broken Bone (Minor) injury. Pass a Difficult (–10) Endurance Test or gain a Stunned Condition. Take 3 wounds.";
    }
	else if (56 <= arm && arm <=60)
    {
        var armmsg = "Ruptured Ligament. You immediately drop whatever was held in that hand. Suffer a Torn Muscle (Major) injury. Take 3 wounds.";
    }
	else if (61 <= arm && arm <=65)
    {
        var armmsg = "Deep Cut. Gain 2 Bleeding Conditions as your arm is mangled. Gain 1 Stunned Condition and suffer a Torn Muscle (Minor) injury. Take a Hard (–20) Endurance Test or gain the Unconscious Condition. Take 3 wounds.";
    }
	else if (66 <= arm && arm <=70)
    {
        var armmsg = "Damaged Artery. Gain 4 Bleeding Conditions. Until you receive Surgery, every time you take Damage to this Arm Hit Location gain 2 Bleeding Conditions. Take 4 wounds.";
    }
	else if (71 <= arm && arm <=75)
    {
        var armmsg = "Crushed Elbow. The blow crushes your elbow, splintering bone and cartilage. You immediately drop whatever was held in that hand and gain a Broken Bone (Major) injury. Take 4 wounds.";
    }
	else if (76 <= arm && arm <=80)
    {
        var armmsg = "Dislocated Shoulder. Your arm is wrenched out of its socket. Pass a Hard (–20) Endurance Test or gain the Stunned and Prone Condition. Drop whatever is held in that hand: the arm is useless and counts as lost (see Amputated Part). Gain 1 Stunned Condition until you receive Medical Attention. After this initial Medical Attention, an Extended Average (+20) Heal Test needing 6 SL is required to reset the arm, at which point you regain its use. Tests made using this arm suffer a –10 penalty for 1d10 days. Take 4 wounds.";
    }
	else if (81 <= arm && arm <=85)
    {
        var armmsg = "Severed Finger. You gape in horror as a finger flies — Amputation (Average). Gain a Bleeding condition. Take 4 wounds.";
    }
	else if (86 <= arm && arm <=90)
    {
        var armmsg = "Cleft Hand. Your hand splays open from the blow. Lose 1 finger —Amputation (Difficult). Gain 2 Bleeding and 1 Stunned Condition. For every succeeding Round in which you don't receive Medical Attention, you lose another finger as the wound tears; if you run out of fingers, you lose the hand — Amputation (Difficult). Take 5 wounds.";
    }
	else if (91 <= arm && arm <=93)
    {
        var armmsg = "Mauled Bicep. The blow almost separates bicep and tendon from bone, leaving an ugly wound that sprays blood over you and your opponent. You automatically drop anything held in the associated hand and suffers a Torn Muscle (Major) injury and 2 Bleeding and 1 Stunned Condition. Take 5 wounds.";
    }
	else if (94 <= arm && arm <=96)
    {
        var armmsg = "Mangled Hand. Your hand is left a mauled, bleeding mess. You lose your hand —Amputation (Hard). Gain 2 Bleeding Condition. Take a Hard (–20) Endurance Test or gain the Stunned and Prone Conditions. Take 5 wounds.";
    }
	else if (97 <= arm && arm <=99)
    {
        var armmsg = "Sliced Tendons. Your tendons are cut by the blow, leaving your arm hanging useless — Amputation (Very Hard). Gain 3 Bleeding , 1 Prone , and 1 Stunned Condition. Pass a Hard (–20) Endurance Test or gain the Unconscious Condition. Take 5 wounds.";
    }
	else if (arm == 100)
    {
        var armmsg = "Brutal Dismemberment. Your arm is severed, spraying arterial blood 1d10 feet in a random direction (see Scatter), before the blow follows through to your chest. You lose no wounds, because you are dead.";
    }
    sendChat(msg.who, arm + "%, " + armmsg);
  }
  else if (msg.type === "api" && msg.content.startsWith("!critbody")) {
    const body = msg.content.split(/\s+/u)[1] || Math.floor(Math.random() * 100) +1;
    
    if (body <= 10){
        var bodymsg = "‘Tis But A Scratch! Gain 1 Bleeding Condition. Take 1 wound.";
    }
    else if (11 <= body && body <=20)
    {
        var bodymsg = "Gut Blow. Gain 1 Stunned Condition. Pass an Easy (+40) Endurance Test, or vomit, gaining the Prone Condition. Take 1 wound.";
    }
	else if (21 <= body && body <=25)
    {
        var bodymsg = "Low Blow! Make a Hard (-20) Endurance Test or gain 3 Stunned Condition.  Take 1 wound.";
    }
	else if (26 <= body && body <=30)
    {
        var bodymsg = "Twisted Back. Suffer a Torn Muscle (Minor) injury. Take 1 wound.";
    }
	else if (31 <= body && body <=35)
    {
        var bodymsg = "Winded. Gain a Stunned Condition. Make an Average (+20) Endurance Test, or gain the Prone Condition. Movement is halved for 1d10 rounds as you get your breath back. Take 2 wounds.";
    }
	else if (36 <= body && body <=40)
    {
        var bodymsg = "Bruised Ribs. All Agility-based Tests suffer a –10 penalty for 1d10 days. Take 2 wounds.";
    }
	else if (41 <= body && body <=45)
    {
        var bodymsg = "Wrenched Collar Bone. Randomly select one arm. Drop whatever is held in that hand; the arm is useless for 1d10 rounds (see Amputated Parts). Take 2 wounds.";
    }
	else if (46 <= body && body <=50)
    {
        var bodymsg = "Ragged Wound. Take 2 Bleeding Conditions. Take 2 wounds.";
    }
	else if (51 <= body && body <=55)
    {
        var bodymsg = "Cracked Ribs. The hit cracks one or more ribs. Gain a Stunned Condition. Gain a Broken Bone (Minor) injury. Take 3 wounds.";
    }
	else if (56 <= body && body <=60)
    {
        var bodymsg = "Gaping Wound. Take 3 Bleeding Conditions. Until you receive Surgery, any Wounds you receive to the Body Hit Location will inflict an additional Bleeding Condition as the cut reopens. Take 3 wounds.";
    }
	else if (61 <= body && body <=65)
    {
        var bodymsg = "Painful Cut. Gain 2 Bleeding Conditions and a Stunned Condition. Take a Hard (–20) Endurance Test or gain the Unconscious Condition as you black out from the pain. Unless you achieve 4+ SL, you also scream out in agony. Take 3 wounds.";
    }
	else if (66 <= body && body <=70)
    {
        var bodymsg = "Arterial Damage. Gain 4 Bleeding Conditions. Until you receive Surgery, every time you receive Damage to the Body Hit Location, gain 2 Bleeding Conditions. Take 3 wounds.";
    }
	else if (71 <= body && body <=75)
    {
        var bodymsg = "Pulled Back. Your back turns to white pain as you pull a muscle. Suffer a Torn Muscle (Major) injury. Take 4 wounds.";
    }
	else if (76 <= body && body <=80)
    {
        var bodymsg = "Fractured Hip. Gain a Stunned Condition. Take a Challenging (+0) Endurance Test or also gain the Prone Condition. Suffer a Broken Bone (Minor) injury. Take 4 wounds.";
    }
	else if (81 <= body && body <=85)
    {
        var bodymsg = "Major Chest Wound. You take a significant wound to your chest, flensing skin from muscle and sinew. Take 4 Bleeding Conditions. Until you receive Surgery, to stitch the wound together, any Wounds you receive to the Body Hit Location will also inflict 2 Bleeding Conditions as the tears reopen. Take 4 wounds.";
    }
	else if (86 <= body && body <=90)
    {
        var bodymsg = "Gut Wound. Contract a Festering Wound (see Disease and Infection) and gain 2 Bleeding Conditions. Take 4 wounds.";
    }
	else if (91 <= body && body <=93)
    {
        var bodymsg = "Smashed Rib Cage. Gain a Stunned Condition that can only be removed through Medical Attention, and suffer a Broken Bone (Major) injury. Take 5 wounds.";
    }
	else if (94 <= body && body <=96)
    {
        var bodymsg = "Broken Collar Bone. Gain the Unconscious Condition until you receive Medical Attention, and suffer a Broken Bone (Major) injury. Take 5 wounds.";
    }
	else if (97 <= body && body <=99)
    {
        var bodymsg = "MInternal bleeding. Gain a Bleeding Condition that can only be removed through Surgery. Contract Blood Rot (see Disease and Infection). Take 5 wounds.";
    }
	else if (body == 100)
    {
        var bodymsg = "Torn Apart. You are hacked in two. The top half lands in a random direction, and all characters within 2 yards are showered in blood. You lose no wounds because you have no wounds to lose.";
    }
    sendChat(msg.who, body + "%, " + bodymsg);
  }
  else if (msg.type === "api" && msg.content.startsWith("!critleg")) {
    const leg = msg.content.split(/\s+/u)[1] || Math.floor(Math.random() * 100) +1;
    if (leg <= 10){
        var legmsg = "Stubbed Toe. In the scuffle, you stub your toe. Pass a Routine (+20) Endurance Test or suffer –10 on Agility Tests until the end of the next turn. Take 1 wound.";
    }
    else if (11 <= leg && leg <=20)
    {
        var legmsg = "Twisted Ankle. You go over your ankle, hurting it. Agility Tests suffer a –10 penalty for 1d10 rounds. Take 1 wound.";
    }
	else if (21 <= leg && leg <=25)
    {
        var legmsg = "Minor Cut. Gain 1 Bleeding Condition. Take 1 wound.";
    }
	else if (26 <= leg && leg <=30)
    {
        var legmsg = "Lost Footing. In the scuffle you lose your footing. Pass a Challenging (+0) Endurance Test or gain the Prone Condition. Take 1 wound.";
    }
	else if (31 <= leg && leg <=35)
    {
        var legmsg = "Thigh Strike. A painful blow slams into your upper thigh. Gain a Bleeding Condition and take an Average (+20) Endurance Test or stumble, gaining the Prone Condition. Take 2 wounds.";
    }
	else if (36 <= leg && leg <=40)
    {
        var legmsg = "Sprained Ankle. You sprain your ankle, giving you a Torn Muscle (Minor) injury. Take 2 wounds.";
    }
	else if (41 <= leg && leg <=45)
    {
        var legmsg = "Twisted Knee. You twist your knee too far. Agility Tests suffer a –20 penalty for 1d10 rounds. Take 2 wounds.";
    }
	else if (46 <= leg && leg <=50)
    {
        var legmsg = "Badly Cut Toe. Gain 1 Bleeding Condition. After the encounter, make a Challenging (+0) Endurance Test. If you fail, lose 1 toe —Amputation (Average). Take 2 wounds.";
    }
	else if (51 <= leg && leg <=55)
    {
        var legmsg = "Bad Cut. Gain 2 Bleeding conditions as a deep wound opens up your shin. Pass a Challenging (+0) Endurance Test or gain the Prone Condition. Take 3 wounds.";
    }
	else if (56 <= leg && leg <=60)
    {
        var legmsg = "Badly Twisted Knee. You badly twist your knee trying to avoid your opponent. Gain a Torn Muscle (Major) injury. Take 3 wounds.";
    }
	else if (61 <= leg && leg <=65)
    {
        var legmsg = "Hacked Leg. A cut bites down into the hip. Gain 1 Prone and 2 Bleeding Conditions, and suffer a Broken Bone (Minor) injury. Further, take a Hard (–20) Endurance Test or also gain a Stunned condition from the pain. Take 3 wounds.";
    }
	else if (66 <= leg && leg <=70)
    {
        var legmsg = "Torn Thigh. Gain 3 Bleeding Conditions as the weapon opens up your upper thigh. Pass a Challenging (+0) Endurance Test or gain the Prone Condition. Until you receive Surgery to stitch up the wound, each time you receive Damage to this Leg, also receive 1 Bleeding Condition. Take 3 wounds.";
    }
	else if (71 <= leg && leg <=75)
    {
        var legmsg = "Ruptured Tendon. Gain a Prone and Stunned Condition as one of your tendons tears badly. Pass a Hard (–20) Endurance Test or gain the Unconscious Condition. Your leg is useless (see Amputated Parts). Suffer a Torn Muscle (Major) injury. Take 4 wounds.";
    }
	else if (76 <= leg && leg <=80)
    {
        var legmsg = "Carved Shin. The weapon drives clean through your leg by the knee, slicing into bone and through tendons. Gain a Stunned and Prone Condition. Further, suffer a Torn Muscle (Major) and Broken Bone (Minor) injury. Take 4 wounds.";
    }
	else if (81 <= leg && leg <=85)
    {
        var legmsg = "Broken Knee. The blow hacks into your kneecap, shattering it into several pieces. You gain 1 Bleeding , 1 Prone , and 1 Stunned Condition, and a Broken Bone (Major) Injury as you fall to the ground, clutching your ruined leg. Take 4 wounds.";
    }
	else if (86 <= leg && leg <=90)
    {
        var legmsg = "Dislocated Knee. Your knee is wrenched out of its socket. Gain the Prone Condition. Pass a Hard (–20) Endurance Test, or gain the Stunned Condition, which is not removed until you receive Medical Attention. After this initial Medical Attention, an Extended Average (+20) Heal Test needing 6 SL is required to reset the knee at which point you regain its use. Movement is halved, and Tests made using this leg suffer a –10 penalty for d10 days. Take 4 wounds.";
    }
	else if (91 <= leg && leg <=93)
    {
        var legmsg = "Crushed Foot. The blow crushes your foot. Make an Average (+20) Endurance Test; if you fail, gain the Prone condition and lose 1 toe, plus 1 additional toe for each SL below 0 — Amputation (Average). Gain 2 Bleeding Conditions. If you don't receive Surgery within 1d10 days, you will lose the foot entirely. Take 5 wounds.";
    }
	else if (94 <= leg && leg <=96)
    {
        var legmsg = "Severed Foot. Your foot is severed at the ankle and lands 1d10 feet away in a random direction — Amputation (Hard) (see Scatter). You gain 3 Bleeding , 2 Stunned , and 1 Prone Condition. Take 5 wounds.";
    }
	else if (97 <= leg && leg <=99)
    {
        var legmsg = "Cut Tendon. A major tendon at the back of your leg is cut, causing you to scream out in pain as your leg collapses. Gain 2 Bleeding , 2 Stunned , and 1 Prone Condition and look on in horror as your leg never works again — Amputation (Very Hard). Take 5 wounds.";
    }
	else if (leg == 100)
    {
        var legmsg = "Shattered Pelvis. The blow shatters your pelvis, severing one leg then driving through to the next. You die instantly from traumatic shock. At least you don't lose any wounds.";
    }
    sendChat(msg.who, leg + "%, " + legmsg);
  }
   else if(msg.type == "api" && msg.content == ("!help")) {
    sendChat(msg.who, "This rudimentary script can be sluggish, but be patient.  It can greatly speed up some simple rolls for you.");
    sendChat(msg.who, "Type !critloc to determine Critical Hit Location.");
    sendChat(msg.who, "Type !crithead, !critarm, !critbody, or !critleg to roll a critical hit for the appropriate location.");
    sendChat(msg.who, "Type !crithead x, !critarm x, !critbody x, or !critleg x to determine the outcome of a critical rolled by other means.");
    sendChat(msg.who, "Example: !crithead 99");
    sendChat(msg.who, "Type !oops to roll an Oops! result.");
  }
 });