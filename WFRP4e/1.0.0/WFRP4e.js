/*Warhammer Fantasy 4th Edition Scripts.
All creative credit to GW and Cubicle 7
I'm just a code slave who hammered this crap out.
I'm sure there's a better way... I just don't know how to do it.
Feel free to make improvements.

email: Seth@TwoGallonsOfMayo.com

P.S. Thanks to Jonah, Phoenix35, and ((())) from Coding Core Discord for the help!

!help for help
*/


//global variables
let msg = "";
let roll = 0;

//help function
function getHelp(msg) {
    sendChat(msg.who, "HELP:");
    sendChat(msg.who, "Type !critloc to determine Critical Hit Location.");
    sendChat(msg.who, "Type !crithead, !critarm, !critbody, or !critleg to roll a critical hit for the appropriate location.");
    sendChat(msg.who, "Type !crithead x, !critarm x, !critbody x, or !critleg x to determine the outcome of a critical rolled by other means.");
	sendChat(msg.who, "Type !miscast, !miscast x, !Miscast or !Miscast x to roll a minor and major miscast, respectively.");
    sendChat(msg.who, "Type !oops to roll an Oops! result.");
    sendChat(msg.who, "Example: '!crithead 99' will return the result of a critical hit to the head with a roll of 99, while !crithead will give a random result for that location.");
}

//determine crit location
function critLocation(roll) {

    if (roll < 10) {msg = "Your blow strikes your opponent's head.";}
        else if (roll < 25) {msg = "Your blow strikes your opponent's Left (or Secondary) Arm.";}
        else if (roll < 45) {msg = "Your blow strikes your opponent's Right (or Primary) Arm.";}
        else if (roll < 80) {msg = "Your blow strikes your opponent's Body.";}
        else if (roll < 90) {msg = "Your blow strikes your opponent's Left Leg.";}
        else {msg = "Your blow strikes your opponent's Right Leg.";}

    return msg;
}

//critical to the head
function critHead(roll) {
    if (roll < 11) {msg = "Dramatic Injury.  A fine wound across the forehead and cheek. Gain 1 Bleeding Condition. Once the wound is healed, the impressive scar it leaves provides a bonus of +1 SL to appropriate social Tests. You can only gain this benefit once.  Take 1 wound.";}
        else if (roll < 21) {msg = "Minor Cut. The strike opens your cheek and blood flies everywhere. Gain 1 Bleeding Condition. Take 1 wound.";}
        else if (roll < 26) {msg = "Poked Eye. The blow glances across your eye socket. Gain 1 Blinded condition. Take 1 wound.";}
        else if (roll < 31) {msg = "Ear Bash. Your ear takes a sickening impact, leaving it ringing. The Gain 1 Deafened Condition. Take 1 wound.";}
        else if (roll < 36) {msg = "Rattling Blow. The blow floods your vision with spots and flashing lights. Gain 1 Stunned Condition. Take 2 wounds.";}
        else if (roll < 41) {msg = "Black Eye. A solid blow hits your eye, leaving tears and much pain. Gain 2 Blinded Conditions. Take 2 wounds.";}
        else if (roll < 46) {msg = "Sliced Ear. Your side of your head takes a hard blow, cutting deep into your ear. Gain 2 Deafened and 1 Bleeding Condition. Take 2 wounds.";}
        else if (roll < 51) {msg = "Struck Forehead. A solid blow thumps into the centre of your forehead. Gain 2 Bleeding Conditions and a Blinded Condition that cannot be removed until all Bleeding Conditions are removed. Take 2 wounds.";}
        else if (roll < 56) {msg = "Fractured Jaw. With a sickening crunch, pain fills your face as the blow fractures your jaw. Gain 2 Stunned Conditions. Suffer a Broken Bone (Minor) injury.  Take 3 wounds.";}
        else if (roll < 61) {msg = "Major Eye Wound. The blow cracks across your eye socket. Gain 1 Bleeding Condition. Also gain 1 Blinded Condition that cannot be removed until you receive Medical Attention. Take 3 wounds.";}
        else if (roll < 66) {msg = "Major Ear Wound. The blow damages your ear, leaving you with permanent hearing loss in one ear. Suffer a –20 penalty on all Tests relating to hearing. If you suffer this result again, your hearing is permanently lost as the second ear falls quiet. Only magic can heal this. Take 3 wounds.";}
        else if (roll < 71) {msg = "Broken Nose. A solid blow to the centre of your face causing blood to pour. Gain 2 Bleeding Conditions. Make a Challenging (+0) Endurance Test, or also gain a Stunned Condition. After this wound has healed, gain +1/–1 SL on social rolls, depending on context, unless Surgery is used to reset the nose. Take 3 wounds.";}
        else if (roll < 76) {msg = "Broken Jaw. The crack is sickening as the blow hits you under the chin, breaking your jaw. Gain 3 Stunned Conditions. Make a Challenging (+0) Endurance Test or gain an Unconscious Condition. Suffer a Broken Bone (Major) injury. Take 4 wounds.";}
        else if (roll < 81) {msg = "Concussive Blow. Your brain rattles in your skull as blood spurts from your nose and ears. Take 1 Deafened , 2 Bleeding , and 1d10 Stunned Conditions. Gain a Fatigued Condition that lasts for 1d10 days. If you receive another Critical Wound to your head while suffering this Fatigued Condition, make an Average (+20) Endurance Test or also gain an Unconscious Condition. Take 4 wounds.";}
        else if (roll < 86) {msg = "Smashed Mouth. With a sickening crunch, your mouth is suddenly filled with broken teeth and blood. Gain 2 Bleeding Conditions. Lose 1d10 teeth — Amputation (Easy). Take 4 wounds.";}
        else if (roll < 91) {msg = "Mangled Ear. Little is left of your ear as the blow tears it apart. You gain 3 Deafened and 2 Bleeding Conditions. Lose your ear —Amputation (Average).  Take 4 wounds.";}
        else if (roll < 94) {msg = "Devastated Eye. A strike to your eye completely bursts it, causing extraordinary pain. Gain 3 Blinded , 2 Bleeding , and 1 Stunned Condition. Lose your eye — Amputation (Difficult). Take 5 wounds.";}
        else if (roll < 97) {msg = "Disfiguring Blow. The blow smashes your entire face, destroying your eye and nose in a cloud of blood. Gain 3 Bleeding , 3 Blinded and 2 Stunned Conditions. Lose your eye and nose — Amputation (Hard). Take 5 wounds.";}
        else if (roll < 100) {msg = "Mangled Jaw. The blow almost removes your jaw as it utterly destroys your tongue, sending teeth flying in a shower of blood. Gain 4 Bleeding and 3 Stunned Conditions. Make a Very Hard (–30) Endurance Test or gain an Unconscious Condition. Suffer a Broken Bone (Major) injury and lose your tongue and 1d10 teeth —Amputation (Hard). Take 5 wounds.";}
        else {msg = "Decapitated. Your head is entirely severed from your neck and soars through the air, landing 1d10 feet away in a random direction (see Scatter). Your body collapses, instantly dead. The good news is that you don't take any wounds.";}
    
    return msg;
}

//critical to arm
function critArm(roll) {
    if (roll < 11) {msg = "Jarred Arm. Your arm is jarred in the attack. Drop whatever was held in that hand. Take 1 wound.";}
        else if (roll < 21) {msg = "Minor cut. Gain a Bleeding Condition as your upper arm is cut badly. Take 1 wound.";}
        else if (roll < 26) {msg = "Sprain. You sprain your arm, suffering a Torn Muscle (Minor) injury. Take 1 wound.";}
        else if (roll < 31) {msg = "Badly Jarred Arm. Your arm is badly jarred in the attack. Drop whatever was held in that hand, which is useless for 1d10 – Toughness Bonus Rounds (minimum 1). For this time, treat the hand as lost (see Amputated Parts). Take 2 wounds.";}
        else if (roll < 36) {msg = "Torn Muscles. The blow slams into your forearm. Gain a Bleeding Condition and a Torn Muscle (Minor) injury. Take 2 wounds.";}
        else if (roll < 41) {msg = "Bleeding Hand. Your hand is cut badly, making your grip slippery. Take 1 Bleeding Condition. While suffering from that Bleeding Condition, make an Average (+20) Dexterity Test before taking any Action that requires something being held in that hand; if you fail, the item slips from your grip. Take 2 wounds.";}
        else if (roll < 46) {msg = "Wrenched Arm. Your arm is almost pulled from its socket. Drop whatever is held in the associated hand; the arm is useless for 1d10 Rounds (see Amputated Parts). Take 2 wounds.";}
        else if (roll < 51) {msg = "Gaping Wound. The blow opens a deep, gaping wound. Gain 2 Bleeding Conditions. Until you receive Surgery to stitch up the cut, any associated Arm Damage you receive will also inflict 1 Bleeding Condition as the wound reopens. Take 3 wounds.";}
        else if (roll < 56) {msg = "Clean Break. An audible crack resounds as the blow strikes your arm. Drop whatever was held in the associated hand and gain a Broken Bone (Minor) injury. Pass a Difficult (–10) Endurance Test or gain a Stunned Condition. Take 3 wounds.";}
        else if (roll < 61) {msg = "Ruptured Ligament. You immediately drop whatever was held in that hand. Suffer a Torn Muscle (Major) injury. Take 3 wounds.";}
        else if (roll < 66) {msg = "Deep Cut. Gain 2 Bleeding Conditions as your arm is mangled. Gain 1 Stunned Condition and suffer a Torn Muscle (Minor) injury. Take a Hard (–20) Endurance Test or gain the Unconscious Condition. Take 3 wounds.";}
        else if (roll < 71) {msg = "Damaged Artery. Gain 4 Bleeding Conditions. Until you receive Surgery, every time you take Damage to this Arm Hit Location gain 2 Bleeding Conditions. Take 4 wounds.";}
        else if (roll < 76) {msg = "Crushed Elbow. The blow crushes your elbow, splintering bone and cartilage. You immediately drop whatever was held in that hand and gain a Broken Bone (Major) injury. Take 4 wounds.";}
        else if (roll < 81) {msg = "Dislocated Shoulder. Your arm is wrenched out of its socket. Pass a Hard (–20) Endurance Test or gain the Stunned and Prone Condition. Drop whatever is held in that hand: the arm is useless and counts as lost (see Amputated Part). Gain 1 Stunned Condition until you receive Medical Attention. After this initial Medical Attention, an Extended Average (+20) Heal Test needing 6 SL is required to reset the arm, at which point you regain its use. Tests made using this arm suffer a –10 penalty for 1d10 days. Take 4 wounds.";}
        else if (roll < 86) {msg = "Severed Finger. You gape in horror as a finger flies — Amputation (Average). Gain a Bleeding condition. Take 4 wounds.";}
        else if (roll < 91) {msg = "Cleft Hand. Your hand splays open from the blow. Lose 1 finger —Amputation (Difficult). Gain 2 Bleeding and 1 Stunned Condition. For every succeeding Round in which you don't receive Medical Attention, you lose another finger as the wound tears; if you run out of fingers, you lose the hand — Amputation (Difficult). Take 5 wounds.";}
        else if (roll < 94) {msg = "Mauled Bicep. The blow almost separates bicep and tendon from bone, leaving an ugly wound that sprays blood over you and your opponent. You automatically drop anything held in the associated hand and suffers a Torn Muscle (Major) injury and 2 Bleeding and 1 Stunned Condition. Take 5 wounds.";}
        else if (roll < 97) {msg = "Mangled Hand. Your hand is left a mauled, bleeding mess. You lose your hand —Amputation (Hard). Gain 2 Bleeding Condition. Take a Hard (–20) Endurance Test or gain the Stunned and Prone Conditions. Take 5 wounds.";}
        else if (roll < 100) {msg = "Sliced Tendons. Your tendons are cut by the blow, leaving your arm hanging useless — Amputation (Very Hard). Gain 3 Bleeding , 1 Prone , and 1 Stunned Condition. Pass a Hard (–20) Endurance Test or gain the Unconscious Condition. Take 5 wounds.";}
        else {msg = "Brutal Dismemberment. Your arm is severed, spraying arterial blood 1d10 feet in a random direction (see Scatter), before the blow follows through to your chest. You lose no wounds, because you are dead.";}
    
    return msg;
}

//critical to the body
function critBody(roll) {
    if (roll < 11) {msg = "‘Tis But A Scratch! Gain 1 Bleeding Condition. Take 1 wound.";}
        else if (roll < 21) {msg = "Gut Blow. Gain 1 Stunned Condition. Pass an Easy (+40) Endurance Test, or vomit, gaining the Prone Condition. Take 1 wound.";}
        else if (roll < 26) {msg = "Low Blow! Make a Hard (-20) Endurance Test or gain 3 Stunned Condition.  Take 1 wound.";}
        else if (roll < 31) {msg = "Twisted Back. Suffer a Torn Muscle (Minor) injury. Take 1 wound.";}
        else if (roll < 36) {msg = "Winded. Gain a Stunned Condition. Make an Average (+20) Endurance Test, or gain the Prone Condition. Movement is halved for 1d10 rounds as you get your breath back. Take 2 wounds.";}
        else if (roll < 41) {msg = "Bruised Ribs. All Agility-based Tests suffer a –10 penalty for 1d10 days. Take 2 wounds.";}
        else if (roll < 46) {msg = "Wrenched Collar Bone. Randomly select one arm. Drop whatever is held in that hand; the arm is useless for 1d10 rounds (see Amputated Parts). Take 2 wounds.";}
        else if (roll < 51) {msg = "Ragged Wound. Take 2 Bleeding Conditions. Take 2 wounds.";}
        else if (roll < 56) {msg = "Cracked Ribs. The hit cracks one or more ribs. Gain a Stunned Condition. Gain a Broken Bone (Minor) injury. Take 3 wounds.";}
        else if (roll < 61) {msg = "Gaping Wound. Take 3 Bleeding Conditions. Until you receive Surgery, any Wounds you receive to the Body Hit Location will inflict an additional Bleeding Condition as the cut reopens. Take 3 wounds.";}
        else if (roll < 66) {msg = "Painful Cut. Gain 2 Bleeding Conditions and a Stunned Condition. Take a Hard (–20) Endurance Test or gain the Unconscious Condition as you black out from the pain. Unless you achieve 4+ SL, you also scream out in agony. Take 3 wounds.";}
        else if (roll < 71) {msg = "Arterial Damage. Gain 4 Bleeding Conditions. Until you receive Surgery, every time you receive Damage to the Body Hit Location, gain 2 Bleeding Conditions. Take 3 wounds.";}
        else if (roll < 76) {msg = "Pulled Back. Your back turns to white pain as you pull a muscle. Suffer a Torn Muscle (Major) injury. Take 4 wounds.";}
        else if (roll < 81) {msg = "Fractured Hip. Gain a Stunned Condition. Take a Challenging (+0) Endurance Test or also gain the Prone Condition. Suffer a Broken Bone (Minor) injury. Take 4 wounds.";}
        else if (roll < 86) {msg = "Major Chest Wound. You take a significant wound to your chest, flensing skin from muscle and sinew. Take 4 Bleeding Conditions. Until you receive Surgery, to stitch the wound together, any Wounds you receive to the Body Hit Location will also inflict 2 Bleeding Conditions as the tears reopen. Take 4 wounds.";}
        else if (roll < 91) {msg = "Gut Wound. Contract a Festering Wound (see Disease and Infection) and gain 2 Bleeding Conditions. Take 4 wounds.";}
        else if (roll < 94) {msg = "Smashed Rib Cage. Gain a Stunned Condition that can only be removed through Medical Attention, and suffer a Broken Bone (Major) injury. Take 5 wounds.";}
        else if (roll < 97) {msg = "Broken Collar Bone. Gain the Unconscious Condition until you receive Medical Attention, and suffer a Broken Bone (Major) injury. Take 5 wounds.";}
        else if (roll < 100) {msg = "Internal bleeding. Gain a Bleeding Condition that can only be removed through Surgery. Contract Blood Rot (see Disease and Infection). Take 5 wounds.";}
        else {msg = "Torn Apart. You are hacked in two. The top half lands in a random direction, and all characters within 2 yards are showered in blood. You lose no wounds because you have no wounds to lose.";}

    return msg;
}

//critical to the leg
function critLeg(roll) {
    if (roll < 11) {msg = "Stubbed Toe. In the scuffle, you stub your toe. Pass a Routine (+20) Endurance Test or suffer –10 on Agility Tests until the end of the next turn. Take 1 wound.";}
        else if (roll < 21) {msg = "Twisted Ankle. You go over your ankle, hurting it. Agility Tests suffer a –10 penalty for 1d10 rounds. Take 1 wound.";}
        else if (roll < 26) {msg = "Minor Cut. Gain 1 Bleeding Condition. Take 1 wound.";}
        else if (roll < 31) {msg = "Lost Footing. In the scuffle you lose your footing. Pass a Challenging (+0) Endurance Test or gain the Prone Condition. Take 1 wound.";}
        else if (roll < 36) {msg = "Thigh Strike. A painful blow slams into your upper thigh. Gain a Bleeding Condition and take an Average (+20) Endurance Test or stumble, gaining the Prone Condition. Take 2 wounds.";}
        else if (roll < 41) {msg = "Sprained Ankle. You sprain your ankle, giving you a Torn Muscle (Minor) injury. Take 2 wounds.";}
        else if (roll < 46) {msg = "Twisted Knee. You twist your knee too far. Agility Tests suffer a –20 penalty for 1d10 rounds. Take 2 wounds.";}
        else if (roll < 51) {msg = "Badly Cut Toe. Gain 1 Bleeding Condition. After the encounter, make a Challenging (+0) Endurance Test. If you fail, lose 1 toe —Amputation (Average). Take 2 wounds.";}
        else if (roll < 56) {msg = "Bad Cut. Gain 2 Bleeding conditions as a deep wound opens up your shin. Pass a Challenging (+0) Endurance Test or gain the Prone Condition. Take 3 wounds.";}
        else if (roll < 61) {msg = "Badly Twisted Knee. You badly twist your knee trying to avoid your opponent. Gain a Torn Muscle (Major) injury. Take 3 wounds.";}
        else if (roll < 66) {msg = "Hacked Leg. A cut bites down into the hip. Gain 1 Prone and 2 Bleeding Conditions, and suffer a Broken Bone (Minor) injury. Further, take a Hard (–20) Endurance Test or also gain a Stunned condition from the pain. Take 3 wounds.";}
        else if (roll < 71) {msg = "Torn Thigh. Gain 3 Bleeding Conditions as the weapon opens up your upper thigh. Pass a Challenging (+0) Endurance Test or gain the Prone Condition. Until you receive Surgery to stitch up the wound, each time you receive Damage to this Leg, also receive 1 Bleeding Condition. Take 3 wounds.";}
        else if (roll < 76) {msg = "Ruptured Tendon. Gain a Prone and Stunned Condition as one of your tendons tears badly. Pass a Hard (–20) Endurance Test or gain the Unconscious Condition. Your leg is useless (see Amputated Parts). Suffer a Torn Muscle (Major) injury. Take 4 wounds.";}
        else if (roll < 81) {msg = "Carved Shin. The weapon drives clean through your leg by the knee, slicing into bone and through tendons. Gain a Stunned and Prone Condition. Further, suffer a Torn Muscle (Major) and Broken Bone (Minor) injury. Take 4 wounds.";}
        else if (roll < 86) {msg = "Broken Knee. The blow hacks into your kneecap, shattering it into several pieces. You gain 1 Bleeding , 1 Prone , and 1 Stunned Condition, and a Broken Bone (Major) Injury as you fall to the ground, clutching your ruined leg. Take 4 wounds.";}
        else if (roll < 91) {msg = "Dislocated Knee. Your knee is wrenched out of its socket. Gain the Prone Condition. Pass a Hard (–20) Endurance Test, or gain the Stunned Condition, which is not removed until you receive Medical Attention. After this initial Medical Attention, an Extended Average (+20) Heal Test needing 6 SL is required to reset the knee at which point you regain its use. Movement is halved, and Tests made using this leg suffer a –10 penalty for d10 days. Take 4 wounds.";}
        else if (roll < 94) {msg = "Crushed Foot. The blow crushes your foot. Make an Average (+20) Endurance Test; if you fail, gain the Prone condition and lose 1 toe, plus 1 additional toe for each SL below 0 — Amputation (Average). Gain 2 Bleeding Conditions. If you don't receive Surgery within 1d10 days, you will lose the foot entirely. Take 5 wounds.";}
        else if (roll < 97) {msg = "Severed Foot. Your foot is severed at the ankle and lands 1d10 feet away in a random direction — Amputation (Hard) (see Scatter). You gain 3 Bleeding , 2 Stunned , and 1 Prone Condition. Take 5 wounds.";}
        else if (roll < 100) {msg = "Cut Tendon. A major tendon at the back of your leg is cut, causing you to scream out in pain as your leg collapses. Gain 2 Bleeding , 2 Stunned , and 1 Prone Condition and look on in horror as your leg never works again — Amputation (Very Hard). Take 5 wounds.";}
        else {msg = "Shattered Pelvis. The blow shatters your pelvis, severing one leg then driving through to the next. You die instantly from traumatic shock. At least you don't lose any wounds.";}

    return msg;
}

//minor miscast
function miscast(roll) {

    if (roll < 6) {msg = "Witchsign: the next living creature born within 1 mile is mutated.";}
        else if (roll < 11) {msg = "Soured Milk: All milk within 1d100 yards goes sour instantly.";}
        else if (roll < 16) {msg = "Blight: Willpower Bonus fields within Willpower Bonus miles suffer a blight, and all crops rot overnight.";}
        else if (roll < 21) {msg = "Soulwax: Your ears clog instantly with a thick wax. Gain 1 Deafened Condition, which is not removed until someone cleans them for you (with a successful use of the Heal Skill).";}
        else if (roll < 26) {msg = "Witchlight: You glow with an eerie light related to your Lore, emitting as much light as a large bonfire, which lasts for 1d10 Rounds.";}
        else if (roll < 31) {msg = "Fell Whispers: Pass a Routine (+20) Willpower Test or gain 1 Corruption point.";}
        else if (roll < 36) {msg = "Rupture: Your nose, eyes, and ears bleed profusely. Gain 1d10 Bleeding Conditions.";}
        else if (roll < 41) {msg = "Soulquake: Gain the Prone Condition.";}
        else if (roll < 46) {msg = "Unfasten: On your person, every buckle unfastens, and every lace unties, which may cause belts to fall, pouches to open, bags to fall, and armour to slip.";}
        else if (roll < 51) {msg = "Wayward Garb: your clothes seem to writhe with a mind of their own. Receive 1 Entangled Condition with a Strength of 1d10×5 to resist.";}
        else if (roll < 56) {msg = "Curse of Temperance: All alcohol within 1d100 yards goes bad, tasting bitter and foul.";}
        else if (roll < 61) {msg = "Souldrain: Gain 1 Fatigued Condition, which remains for 1d10 hours.";}
        else if (roll < 66) {msg = "Driven to Distraction: If engaged in combat, gain the Surprised Condition. Otherwise, you are completely startled, your heart racing, and unable to concentrate for a few moments.";}
        else if (roll < 71) {msg = "Unholy Visions: Fleeting visions of profane and unholy acts harass you. Receive a Blinded Condition; pass a Challenging (+0) Cool Test or gain another.";}
        else if (roll < 76) {msg = "Cloying Tongue: All Language Tests (including Casting Tests) suffer a –10 penalty for 1d10 Rounds.";}
        else if (roll < 81) {msg = "The Horror!: Pass a Hard (–20) Cool Test or gain 1 Broken Condition.";}
        else if (roll < 86) {msg = "Curse of Corruption: Gain 1 Corruption point.";}
        else if (roll < 91) {msg = "Double Trouble: The effect of the spell you cast occurs elsewhere within 1d10 miles. At the GM’s discretion, where possible it should have consequences.";}
        else if (roll < 96) {msg = "Multiplying Misfortune: Roll twice on this table, rerolling any results between 91-00.";}
        else {msg= "Cascading Chaos: Roll again on the Major Miscast Table.";}

        return msg;
}

//major miscast
function Miscast (roll) {

    if (roll < 6) {msg = "Ghostly Voices: Everyone within Willpower yards hears darkly seductive whispering of voices emanating from the Realm of Chaos. All sentient creatures must pass an Average (+0) Cool Test or gain 1 Corruption point.";}
        else if (roll < 11) {msg = "Hexeyes: Your eyes turn an unnatural colour associated with your Lore for 1d10 hours. While your eyes are discoloured, you have 1 Blinded Condition that cannot be resolved by any means.";}
        else if (roll < 16) {msg = "Aethyric Shock: you suffer 1d10 wounds, ignoring your Toughness Bonus and Armour Points. Pass an Average (+20) Endurance Test, or also gain a Stunned Condition.";}
        else if (roll < 21) {msg = "Death Walker: Your footsteps leave death in their wake. For the next 1d10 hours, any plant life near you withers and dies.";}
        else if (roll < 26) {msg = "Intestinal Rebellion: Your bowels move uncontrollably, and you soil yourself. Gain 1 Fatigued Condition, which cannot be removed until you can change your clothes and clean yourself up.";}
        else if (roll < 31) {msg = "Soulfire: Gain an Ablaze Condition, as you are wreathed in unholy flames with a colour associated with your Lore.";}
        else if (roll < 36) {msg = "Speak in Tongues: You gabble unintelligibly for 1d10 rounds. During this time, you cannot communicate verbally, or make any Casting Tests, although you may otherwise act normally.";}
        else if (roll < 41) {msg = "Swarmed: You are engaged by a swarm of aethyric Rats, Giant Spiders, Snakes, or similar (GM’s choice). Use the standard profiles for the relevant creature type, adding the Swarm Creature Trait. After 1d10 rounds, if not yet destroyed, the swarm retreats.";}
        else if (roll < 46) {msg = "Ragdoll: You are flung 1d10 yards through the air in a random direction, taking 1d10 wounds on landing, ignoring Armour Points, and receiving the Prone Condition.";}
        else if (roll < 51) {msg = "Limb frozen: One limb (randomly determined) is frozen in place for 1d10 hours. The limb is useless, as if it had been Amputated (see page 180).";}
        else if (roll < 56) {msg = "Darkling Sight: You lose the benefit of the Second Sight Talent for 1d10 hours. Channelling Tests also suffer a penalty of –20 for the duration.";}
        else if (roll < 61) {msg = "Chaotic Foresight: Gain a bonus pool of 1d10 Fortune points (this may take you beyond your natural limit). Every time you spend one of these points, gain 1 Corruption point. Any of these points remaining at the end of the session are lost.";}
        else if (roll < 66) {msg = "Levitation: You are borne aloft on the Winds of Magic, floating 1d10 yards above the ground for 1d10 minutes. Other characters may forcibly move you, and you may move using spells, wings or similar, but will continually return to your levitating position if otherwise left alone. Refer to the Falling rules (see page 166) for what happens when Levitation ends.";}
        else if (roll < 71) {msg = "Regurgitation: You spew uncontrollably, throwing up far more foul-smelling vomitus than your body can possibly contain. Gain the Stunned Condition, which lasts for 1d10 Rounds.";}
        else if (roll < 76) {msg = "Chaos Quake: All creatures within 1d100 yards must pass an Average (+0) Athletics Test or gain the Prone Condition.";}
        else if (roll < 81) {msg = "Traitor’s Heart: The Dark Gods entice you to commit horrendous perfidy. Should you attack or otherwise betray an ally to the full extent of your capabilities, regain all Fortune points. If you cause another character to lose a Fate Point, gain +1 Fate Point.";}
        else if (roll < 86) {msg = "Foul Enfeeblement: Gain 1 Corruption point, the Prone Condition, and a Fatigued Condition.";}
        else if (roll < 91) {msg = "Hellish Stench: You now smell really bad! You gain the Distracting Creature Trait (see page 339), and probably the enmity of anyone with a sense of smell. This lasts for 1d10 hours.";}
        else if (roll < 96) {msg = "Power Drain: You are unable to use the Talent used to cast the spell (usually Arcane Magic, though it could be Chaos Magic, or a similar Talent), for 1d10 minutes.";}
        else {msg= "Aethyric Feedback: Everyone within a number of yards equal to your Willpower Bonus — friend and foe alike — suffers 1d10 wounds, ignoring Toughness Bonus and Armour Points, and receives the Prone Condition. If there are no targets in range, the magic has nowhere to vent, so your head explodes, killing you instantly.";}

        return msg;
}

//oops! table
function oops(roll) {

    if (roll < 21) {msg = "You catch a part of your anatomy (we recommend you play this for laughs) — lose 1 Wound, ignoring Toughness Bonus or Armour Points.";}
        else if (roll < 41) {msg = "Your melee weapon jars badly, or ranged weapon malfunctions or slightly breaks – your weapon suffers 1 Damage. Next round, you will act last regardless of Initiative order, Talents, or special rules as you recover (see page 156).";}
        else if (roll < 61) {msg = "Your manoeuvre was misjudged, leaving you out of position, or you lose grip of a ranged weapon. Next round, your Action suffers a penalty of –10.";}
        else if (roll < 71) {msg = "You stumble badly, finding it hard to right yourself. Lose your next Move.";}
        else if (roll < 81) {msg = "You mishandle your weapon, or you drop your ammunition. Miss your next Action.";}
        else if (roll < 91) {msg = "You overextend yourself or stumble and twist your ankle. Suffer a Torn Muscle (Minor) injury (see page 179). This counts as a Critical Wound.";}
        else {msg = "You completely mess up, hitting 1 random ally in range using your rolled units die to determine the SL of the hit. If that’s not possible, you somehow hit yourself in the face and gain a Stunned Condition (see page 169).";}

    return msg;
}

on("chat:message", function(chatMsg) {
    
    if (chatMsg.type === "api") {
        
        roll = chatMsg.content.split(/\s+/u)[1] || Math.floor(Math.random() * 100) +1;

        if (chatMsg.content.startsWith("!critloc")) {sendChat(chatMsg.who, roll + "%, " + critLocation(roll));}
            else if (chatMsg.content.startsWith("!crithead")) {sendChat(chatMsg.who, roll + "%, " + critHead(roll));}
            else if (chatMsg.content.startsWith("!critarm")) {sendChat(chatMsg.who, roll + "%, " + critArm(roll));}
            else if (chatMsg.content.startsWith("!critbody")) {sendChat(chatMsg.who, roll + "%, " + critBody(roll));}
            else if (chatMsg.content.startsWith("!critleg")) {sendChat(chatMsg.who, roll + "%, " + critLeg(roll));}
            else if (chatMsg.content.startsWith("!miscast")) {sendChat(chatMsg.who, roll + "%, " + miscast(roll));}
            else if (chatMsg.content.startsWith("!Miscast")) {sendChat(chatMsg.who, roll + "%, " + Miscast(roll));}
            else if (chatMsg.content.startsWith("!oops")) {sendChat(chatMsg.who, roll + "%, " + oops(roll));}
            else if (chatMsg.content.startsWith("!help")) {getHelp(chatMsg);}
    }

});
