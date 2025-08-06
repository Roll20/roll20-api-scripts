/*
 * Lingering Injury Calculator
 * Version: 1.1
 * Author: Gemini & Your Name
 *
 * This script automates lingering injuries based on a specific ruleset.
 * It detects when a character drops to 0 HP, prompts the user for a CON save result,
 * calculates the injury severity and type, and displays the result from a comprehensive table.
 */
var LingeringInjury = LingeringInjury || (function() {
    'use strict';

    const VERSION = '1.1';

    // ===================================================================================
    //
    //                              INJURY TABLES
    //
    // This object contains all 260 lingering injury descriptions.
    // The format is: "**Injury Name:** Effect description."
    //
    // ===================================================================================
    const injuryTables = {
        "bludgeoning": {
            "1": [
                "**Swollen Eye:** Disadvantage on Perception (sight) for 1 day.",
                "**Split Lip / Bruised Jaw:** Disadvantage on Persuasion checks for 1 day.",
                "**Hairline Rib Fracture:** Painful breathing. No mechanical penalty unless sprinting (DM call).",
                "**Concussive Ringing:** Disadvantage on Initiative until next long rest."
            ],
            "2": [
                "**Deep Muscle Bruising:** Speed reduced by 10ft until healed.",
                "**Dislocated Shoulder:** Disadvantage on attacks using that arm.",
                "**Hyperextended Knee:** Disadvantage on Acrobatics and jumping until healed.",
                "**Jaw Locked:** Can’t speak clearly—verbal spellcasting has 50% failure chance."
            ],
            "3": [
                "**Cracked Ribs:** Disadvantage on Constitution saves and Stealth.",
                "**Skull Fracture:** Disadvantage on Intelligence and Wisdom checks for 2d4 days.",
                "**Shattered Elbow:** Cannot use off-hand. No two-weapon fighting or shields.",
                "**Ruptured Eardrum:** Deaf in one ear; Disadvantage on Perception (sound), -2 initiative."
            ],
            "4": [
                "**Collapsed Lung:** Gain 1 level of exhaustion each long rest until treated.",
                "**Shattered Arm:** Cannot use the arm; cannot climb, wield, or carry with it.",
                "**Crushed foot:** Speed halved; Disadvantage on all Dex saves involving movement.",
                "**Vision Blackout:** One eye blinded. Disadvantage on ranged attacks and depth perception."
            ],
            "5": [
                "**Spinal Crush:** Paralyzed from the waist down. Requires Regenerate.",
                "**Brain Hemorrhage:** -4 to Int, Wis, and Cha until magically healed. Death in 1d4 days untreated.",
                "**Crushed Ribcage:** Suffocates if unconscious; all movement causes 1d6 damage.",
                "**Limb Shattered Beyond Repair:** One arm or leg is lost or rendered permanently useless."
            ]
        },
        "piercing": {
            "1": [
                "**Grazed Artery:** Disadvantage on Constitution saves to maintain concentration.",
                "**Lodged Shard:** Disadvantage on Strength (Athletics) until removed.",
                "**Shallow Penetration:** Disadvantage on Stealth checks (persistent bleeding).",
                "**Swollen Entry Site:** Disadvantage on attack rolls with affected limb until healed."
            ],
            "2": [
                "**Torn Ligament:** Speed reduced by 10 ft.",
                "**Lung Graze:** Disadvantage on saving throws vs exhaustion and suffocation.",
                "**Foreign Object Retained:** Until removed with DC 15 Medicine check, suffer -1 to AC.",
                "**Muscle Collapse:** Disadvantage on weapon attacks with the wounded arm or leg."
            ],
            "3": [
                "**Bleeding Organ:** Constitution saving throws made at disadvantage until magically treated.",
                "**Spinal Graze:** Dexterity reduced by 2 until healed.",
                "**Pierced Lung:** Disadvantage on Constitution checks and cannot hold breath longer than 6 seconds.",
                "**Gut Shot:** Disadvantage on Constitution saves 8 hours after digesting (eating, potions, rest)."
            ],
            "4": [
                "**Ruptured Spleen:** Start each combat with 1 additional level of exhaustion.",
                "**Nerve Piercing:** One limb becomes paralyzed until healed.",
                "**Arrowhead Fracture:** Weapon fragments remain. You take 1 damage per round of combat until removed.",
                "**Intestinal Perforation:** Max HP reduced by 1d10 after each long rest until magically treated."
            ],
            "5": [
                "**Punctured Heart:** Disadvantage on death saves permanently until Regenerate or divine healing.",
                "**Full-body Impalement:** Paralyzed for 1d4 rounds after recovering consciousness.",
                "**Lung Collapse:** Suffers 1 additional level of exhaustion after each long rest until healed.",
                "**Organ Destruction:** One non-vital organ fails. All healing spells restore half HP until magically repaired."
            ]
        },
        "slashing": {
            "1": [
                "**Bleeding Cut:** Take 1 damage at the end of each combat round until bandaged (DC 10 Medicine).",
                "**Scarred Face:** Disadvantage on Charisma (Persuasion), advantage on Intimidation.",
                "**Nicked Joint:** Disadvantage on Initiative until long rest.",
                "**Skin Flap:** RP effect. Bleeding visible. Disadvantage on Stealth."
            ],
            "2": [
                "**Torn Bicep:** Disadvantage on Strength based melee attacks and checks.",
                "**Hamstring Slice:** Speed halved until healed.",
                "**Deep Chest Gash:** Disadvantage on Constitution saves and breathing-based checks.",
                "**Exposed Tendon:** If you Dash, suffer 1d4 damage."
            ],
            "3": [
                "**Vascular Tear:** You must succeed on a DC 10 Con save after each combat or gain 1 level of exhaustion.",
                "**Slashed Spine:** One leg becomes unusable. Movement reduced to 5 ft. crawl until healed.",
                "**Chestplate Rupture:** AC reduced by 1 until armor is repaired (if wearing).",
                "**Arterial Spray:** You fall unconscious 1 minute after combat ends unless stabilized."
            ],
            "4": [
                "**Shoulder Cleave:** Cannot lift objects heavier than 10 lbs until magically healed.",
                "**Ribcage Exposure:** Disadvantage on all saves vs thunder, cold, or force damage, and vulnerability to all three.",
                "**Gut Opening:** Cannot benefit from food or potion healing until sewn shut (DC 15 Medicine or magical healing).",
                "**Nerve Line Sever:** Roll d6 at the start of each turn: on a 1, lose your action to uncontrolled twitching."
            ],
            "5": [
                "**Severed Limb:** One arm or leg is fully lost. Only Regenerate can restore.",
                "**Neck Laceration:** Speak only in whispers. Verbal spellcasting has 50% failure chance.",
                "**Cleaved Torso:** Constitution score reduced by 4 until magically healed.",
                "**Lasting Blood Loss:** Healing magic restores only half its normal value until Greater Restoration or higher."
            ]
        },
        "acid": {
            "1": [
                "**Skin Erosion:** Disadvantage on Persuasion and Insight (distorted features).",
                "**Acid Rash:** Disadvantage on Constitution saves for 1 day.",
                "**Minor Gear Corrosion:** One non-magical item on your person is rendered unusable.",
                "**Irritated Eyes:** Disadvantage on Perception (sight) and ranged attacks for 1 day."
            ],
            "2": [
                "**Burned Finger:** Disadvantage on Sleight of Hand and Dexterity based Attack Rolls.",
                "**Melting Skin:** Disadvantage on Charisma (Performance, Persuasion) and advantage on Intimidation until healed.",
                "**Acid in the Eyes:** Disadvantage on Perception (sight) until magically treated.",
                "**Digestive Exposure:** Disadvantage on saving throws vs ingestion-based effects."
            ],
            "3": [
                "**Corroded Bone Structure:** Speed reduced by 10 ft.",
                "**Acid Scarring:** Disadvantage on Strength (Athletics) and Charisma (Persuasion).",
                "**Internal Burns:** Disadvantage on Constitution checks and saving throws.",
                "**Nervous System Shock:** Disadvantage on all Dexterity-based checks and saving throws."
            ],
            "4": [
                "**Melted Limb Surface:** Disadvantage on all Dexterity and Strength based ability checks until magically healed.",
                "**Facial Acid Mask:** Charisma score reduced by 2; Disadvantage on all social checks.",
                "**Corroded Eyes:** Blind in one eye. Disadvantage on Perception and ranged attacks.",
                "**Organ Leaking:** Start each combat with 1 additional level of exhaustion, until healed."
            ],
            "5": [
                "**Dissolved Arm or Leg:** The limb is destroyed. Only Regenerate or higher magic can restore it.",
                "**Laryngeal Destruction:** Cannot speak or cast verbal spells until magically healed.",
                "**Acid-Flooded Lungs:** Suffers 1d6 acid damage at the start and end of every long rest until healed.",
                "**Bone Liquefaction:** Strength reduced by 4. Cannot stand or wield heavy objects. Only Heal or Regenerate cures."
            ]
        },
        "cold": {
            "1": [
                "**Numb Fingers:** Disadvantage on Dexterity-based skill checks until next long rest.",
                "**Skin Frost:** Disadvantage on Charisma checks due to white scarring.",
                "**Stiffened joints:** Disadvantage on Initiative until fully warmed/rested.",
                "**Frostbitten Nose or Ears:** Disadvantage on Perception (sound or smell)."
            ],
            "2": [
                "**Mild Frostbite (hand):** Disadvantage on attacks made with that hand.",
                "**Blue Limbs:** Speed reduced by 10 ft. until next long rest or magical warmth.",
                "**Cold-stiffened voice:** Disadvantage on Persuasion and spellcasting requiring speech.",
                "**Blood sludging:** Disadvantage on Constitution saves against exhaustion."
            ],
            "3": [
                "**Severe frostbite (feet):** Speed halved and cannot Dash until magically healed.",
                "**Hypothermic focus:** Disadvantage on all mental skill checks (Int/Wis/Cha).",
                "**Muscle lockdown:** Disadvantage on Strength-based checks and saves.",
                "**Respiratory chill:** Disadvantage on saving throws vs breath or wind-based effects."
            ],
            "4": [
                "**Frostbitten Limb:** One limb becomes unusable until magically restored.",
                "**Cryoshock:** Start each combat with 1 level of exhaustion until healed.",
                "**Coldblind:** Vision blurred from ice in the eyes. Disadvantage on ranged attacks.",
                "**Brain Freeze Lock:** Incapacitated at start of combat unless Constitution save succeeds (DC 12)."
            ],
            "5": [
                "**Amputated Digits:** Lose 1d4 fingers or toes. Disadvantage on fine tasks until Regenerate.",
                "**Heart Freeze:** If reduced to 0 HP again, instantly fail 2 death saves.",
                "**Pulmonary Ice Crystals:** Take 1d6 cold damage at dawn each day until healed.",
                "**Nervous System Collapse:** Paralysis for 1 minute after each failed save. Only Greater Restoration or better cures it."
            ]
        },
        "fire": {
            "1": [
                "**Singed Face:** Disadvantage on Persuasion checks for 1d4 days due to blistering skin.",
                "**Painful Blisters:** Disadvantage on Concentration checks for 1 day.",
                "**Charred Clothing:** Disadvantage on Stealth checks until new clothes or repaired gear.",
                "**Flame-Flecked Vision:** Irritated eyes; Disadvantage on ranged attacks until next long rest."
            ],
            "2": [
                "**Partial Hand Burn:** Disadvantage on sleight of hand and weapon attacks until healed.",
                "**Leg Burns:** Disadvantage on attacks using that arm.",
                "**Smoke Inhalation:** Disadvantage on Constitution saves and Persuasion for 1d4 days.",
                "**Heatstroke:** Gain 1 level of exhaustion and require double water rations."
            ],
            "3": [
                "**Severe Arm Burn:** Cannot wield weapons or shields with that arm.",
                "**Burnt Lungs:** Max HP reduced by 1d10 until healed. Coughs blood when sprinting.",
                "**Melted Nerve Endings:** Disadvantage on all Dexterity checks and saves.",
                "**Scar-Tightened Skin:** Disadvantage on Athletics, Acrobatics, and Dexterity saves."
            ],
            "4": [
                "**Third-Degree Torso Burns:** Disadvantage on all checks requiring physical effort. Pain halts reactions.",
                "**Blistered Skull:** Lose all hair; Disadvantage on social interaction with humanoids for 1 week.",
                "**Burned Eyes:** Blind in one eye. Disadvantage on Perception (sight) and ranged attacks.",
                "**Cooking Flesh:** Charisma score reduced by 2 until Greater Restoration or divine healing."
            ],
            "5": [
                "**Burned to the Bone:** One limb is rendered dead and useless. Only Regenerate can restore function.",
                "**Full Facial Disfigurement:** Permanently reduces Charisma by 4. Social interactions with strangers are hostile or pitiful.",
                "**Incinerated Flesh:** Automatically fail all Stealth and Sleight of Hand checks. Target smells of char.",
                "**Airway Collapse:** Character is unable to speak or cast verbal spells until magically healed."
            ]
        },
        "lightning": {
            "1": [
                "**Arc Flash Blindness:** Disadvantage on Perception (sight) until next long rest.",
                "**Static Conduction:** Vulnerable to lightning damage for 24 hours.",
                "**Twitch Reflex:** Disadvantage on Initiative until next long rest.",
                "**Scorched Nerve Ends:** Disadvantage on Sleight of Hand and Stealth checks."
            ],
            "2": [
                "**Electrical Burn:** Disadvantage on attack rolls or somatic spell components.",
                "**Nerve Spasm:** Disadvantage on Dexterity checks and saves.",
                "**Irregular Heartbeat:** Must pass DC 12 Con save after each strenuous action or gain 1 level of exhaustion.",
                "**Auditory Overload:** Disadvantage on Perception (sound) and Charisma (Performance)."
            ],
            "3": [
                "**Full-Body Tremors:** Disadvantage on all Dexterity-based checks and ranged attacks.",
                "**Lightning Brand:** Magical scar glows faintly. Disadvantage on Stealth, advantage on Intimidation.",
                "**Memory Desync:** Disadvantage on all Intelligence checks. May misremember recent events.",
                "**Vocal Cord Paralysis:** Cannot speak louder than a whisper until magically healed."
            ],
            "4": [
                "**Cardiac Seizure:** Gain 1 level of exhaustion each time you drop below half HP.",
                "**Central Nervous Collapse:** Stunned for 1 round at the start of each combat until healed.",
                "**Charred Flesh Bands:** Movement speed halved. Pain flares with any sudden movement.",
                "**Frontal Lobe Scorch:** Disadvantage on Intelligence, Wisdom, and Charisma saving throws."
            ],
            "5": [
                "**Arcburned Nerves:** Cannot cast spells with somatic components until Regenerate or divine healing.",
                "**Lightning Curse:** Randomly discharges static. Roll 1d6 each turn in combat: on 1, deal 1d4 lightning damage to a nearby creature.",
                "**Flatlines:** Heart requires magical intervention each dawn or the character dies.",
                "**Neural Flare Syndrome:** Each spell cast risks triggering a seizure. Must pass DC 15 Con save or lose action on next turn."
            ]
        },
        "poison": {
            "1": [
                "**Nausea:** Disadvantage on attack rolls for 1 hour.",
                "**Skin Irritation:** Disadvantage on Stealth and Sleight of Hand checks.",
                "**Blurred Vision:** Disadvantage on Perception (sight) and ranged attacks for 1 day.",
                "**Metallic Taste:** Disadvantage on Insight and Perception for 24 hours."
            ],
            "2": [
                "**Swollen Glands:** Cannot speak louder than a whisper. Verbal spellcasting has 50% fail chance.",
                "**Persistent Vomiting:** Disadvantage on Dexterity saving throws and Constitution checks.",
                "**Tremors:** Disadvantage on weapon attacks and tool use until healed.",
                "**Cold Sweat:** Speed reduced by 10 ft. Disadvantage on Initiative."
            ],
            "3": [
                "**Neurotoxic Fog:** Disadvantage on Intelligence and Wisdom checks and saves.",
                "**Liver Shock:** Cannot regain hit points except from magical healing.",
                "**Toxic Hallucinations:** At DM discretion, suffer minor confusion during stress.",
                "**Blood Contamination:** Constitution saving throws made at disadvantage until magically treated."
            ],
            "4": [
                "**Sepsis:** Gain 1 level of exhaustion each dawn until cured.",
                "**Necrotic Bloodstream:** Vulnerable to poison and necrotic damage until healed.",
                "**Intestinal Collapse:** Cannot digest food. Disadvantage on Constitution saves during rests.",
                "**Brainstem Sludge:** Must succeed DC 12 Con save at start of combat or be Incapacitated for 1 round."
            ],
            "5": [
                "**Permanent Organ Failure:** Constitution score reduced by 2 until Regenerate or divine healing.",
                "**Rotting Veins:** Take 1d4 poison damage each dawn. Cannot regain hit points from non-magical sources.",
                "**Mindleech Toxin:** Roll 1d6 each long rest: on a 1, follow the command of the last creature who poisoned you.",
                "**Mutagenic Collapse:** DM introduces a permanent mutation, scar, or deformity."
            ]
        },
        "thunder": {
            "1": [
                "**Ringing Ears:** Disadvantage on Perception (sound) for 1 day.",
                "**Shaken Core:** Disadvantage on Constitution saves vs being knocked prone.",
                "**Bruised Organs:** Disadvantage on Strength and Constitution ability checks until long rest.",
                "**Migraine Aftershock:** Disadvantage on Initiative and concentration checks until rest."
            ],
            "2": [
                "**Burst Eardrum:** Deaf in one ear. Disadvantage on Initiative and Insight.",
                "**Vestibular Collapse:** Disadvantage on Acrobatics and all Dexterity saving throws.",
                "**Concussive Vertigo:** Cannot Dash or take Reactions until healed.",
                "**Shattered Sinuses:** Disadvantage on Constitution saves and all scent-based perception."
            ],
            "3": [
                "**Inner Ear Rupture:** Deafened entirely until healed by Greater Restoration.",
                "**Spinal Whiplash:** Speed halved. Disadvantage on Strength and Dexterity saves.",
                "**Cranial Pressure Collapse:** Disadvantage on Intelligence and Wisdom checks.",
                "**Ribcage Shockwave:** Take 1d4 damage at start of each combat turn unless you remain still."
            ],
            "4": [
                "**Brainwave Disruption:** Cannot maintain concentration. All concentration spells fail after 1 round.",
                "**Sonic Nerve Burn:** Disadvantage on all Charisma-based skill checks until magically healed.",
                "**Cardiac Shockwave:** Must pass DC 12 Con save at start of each combat turn or act last.",
                "**Echo Chamber Skull Fracture:** Disadvantage on all spell attacks and Intelligence saves."
            ],
            "5": [
                "**Permanent Deafness:** Character is permanently deaf unless cured by Regenerate or divine healing.",
                "**Sonic Seizure Syndrome:** Whenever you hear a loud sound, make a DC 15 Con save or fall prone.",
                "**Auditory Hallucinations:** DM-controlled sonic delusions disrupt sleep and concentration randomly.",
                "**Neural Echo:** At the end of each long rest, take 1d6 psychic damage unless healed."
            ]
        },
        "force": {
            "1": [
                "**Arcane Bruising:** Disadvantage on saving throws against spells for 1 day.",
                "**Etheric Displacement:** Disadvantage on Insight and Arcana checks (mind still 'buzzing').",
                "**Microfractures:** RP-only; slight cracks in bones cause pain but no mechanical effect.",
                "**Warped Pulse:** Disadvantage on Initiative until next long rest."
            ],
            "2": [
                "**Phantom Limb Pain:** Disadvantage on attack rolls with a limb that wasn't damaged.",
                "**Arcane Pulse Spasm:** Random muscle twitching. Disadvantage on Stealth checks.",
                "**Inner Ear Distortion:** Disadvantage on Acrobatics and movement-based saves.",
                "**Echoing Rib Fractures:** Disadvantage on Constitution saves and loud noises trigger nausea."
            ],
            "3": [
                "**Disrupted Nerve Conduction:** Disadvantage on Dex and Int saves.",
                "**Vibrational Organ Trauma:** Max HP reduced by 1d8 until magically healed.",
                "**Temporospatial Confusion:** Disadvantage on movement-based checks; mistimes jumps, flinches late.",
                "**Arcanoscarring:** Leaves glowing scars. Disadvantage on Charisma checks with civilians."
            ],
            "4": [
                "**Crushed Sternum:** Speed halved. Cannot Dash or lift more than 10 lbs until healed.",
                "**Radiating Skull Fracture:** Disadvantage on all Intelligence-based checks and saves.",
                "**Magical Whiplash:** Cannot concentrate on spells longer than 1 round.",
                "**Internal Arcane Echo:** Disadvantage on all saving throws until the end of your next long rest."
            ],
            "5": [
                "**Imploded Limb:** One arm or leg is warped inward and non-functional. Regenerate required.",
                "**Etheric Collapse:** Character cannot regain hit points by magical healing until healed.",
                "**Spatial Drift:** Disappears for 1 round at the start of each turn (phases in/out). Hard to heal, target, or protect.",
                "**Arcane Core Fracture:** Max HP halved. Must complete a divine or arcane ritual to restore stability."
            ]
        },
        "necrotic": {
            "1": [
                "**Ash Veins:** Black-grey streaks visible under skin.",
                "**Chill of the Grave:** Disadvantage on death saving throws until healed.",
                "**Phantom Numbness:** Disadvantage on Insight and Investigation checks.",
                "**Bone Ache:** Disadvantage on Concentration saving throws."
            ],
            "2": [
                "**Blackened Fingertips:** Disadvantage on Sleight of Hand and Dexterity-based weapon attacks.",
                "**Vein Reversal:** Blood no longer flows correctly. Disadvantage on all healing received until magically treated.",
                "**Whispered Lethargy:** Disadvantage on Initiative and all saving throws against necrotic damage.",
                "**Minor Soul Detachment:** You cannot benefit from Bardic Inspiration or Guidance spells."
            ],
            "3": [
                "**Necrotic Organ Stress:** Max HP reduced by 1d8. Rest cannot restore it.",
                "**Decaying Eye Socket:** Perception (sight) checks made at disadvantage.",
                "**Spirit-Thinned Lungs:** Must pass a DC 12 Con save at the start of each combat or start winded (lose first action).",
                "**Aura of the Grave:** Living creatures are uneasy near you; Disadvantage on Persuasion, Advantage on Intimidation."
            ],
            "4": [
                "**Withered Limb:** One limb becomes twisted and weak. Can no longer wield heavy items.",
                "**Echoheart:** You no longer register as alive to detection spells. Resurrection is impossible unless this is cured.",
                "**Cloying Rot:** You emit the scent of the dead. Disadvantage on all social checks involving living humanoids.",
                "**Grim Reversal:** Healing spells restore half as much HP until magically cured."
            ],
            "5": [
                "**Hollowed Chest:** Constitution score reduced by 4 until Regenerate or equivalent.",
                "**Pre-Undeath Mutation:** If you die before this is healed, you rise as an undead servant of the last creature to damage you.",
                "**Soulmark:** A black rune appears on your chest. Undead creatures are drawn to you and will not ignore your presence.",
                "**Death’s Claim:** The next time you drop to 0 HP, you do not get death saves. You die instantly unless healed before the blow lands."
            ]
        },
        "psychic": {
            "1": [
                "**Headache Echo:** Disadvantage on Intelligence checks for 1 day.",
                "**Frayed Echo:** Disadvantage on Insight and Investigation until next long rest.",
                "**Emotional Overload:** Disadvantage on Charisma (Deception, Persuasion) for 24 hours.",
                "**Restless Mind:** Cannot benefit from first long rest unless calmed by magic or music."
            ],
            "2": [
                "**Sensory Drift:** Disadvantage on Perception and passive Perception until healed.",
                "**Emotional Disassociation:** Disadvantage on Wisdom saves and Insight checks.",
                "**Panic Reflex Loop:** Cannot take Reactions unless they pass a DC 12 Wisdom save.",
                "**Nightmare Feedback:** Must succeed DC 12 Wis save after long rest or gain 1 level of exhaustion."
            ],
            "3": [
                "**Memory Fragmentation:** Disadvantage on Intelligence saves and all Arcana/History checks.",
                "**Delayed Response Loop:** Disadvantage on Initiative and cannot ready actions.",
                "**Personality Sheer:** Cannot use Inspiration or Bardic Inspiration; feels disconnected.",
                "**Phantasmal Echoes:** Once per long rest, suffers 1 psychic damage per spell level cast due to mental backlash."
            ],
            "4": [
                "**Sensory Collapse:** Blinded and deafened for 1d4 hours or until magically stabilized.",
                "**Reality Fracture:** At the start of each turn, roll d4: on a 1, lose your action to fear or fugue.",
                "**Core Identity Leak:** Disadvantage on all saving throws against fear, charm, or illusion.",
                "**Psychic Anchor Burn:** Cannot be affected by beneficial enchantment spells until healed."
            ],
            "5": [
                "**Identity Dissolution:** Forget who you are. Lose all class abilities until restored.",
                "**Psychic Rift:** Disadvantage on all Intelligence, Wisdom, and Charisma checks and saves.",
                "**Psionic Bleed:** Constant headaches. Take 1 psychic damage whenever you take an action.",
                "**Invited Presence:** A fragment of another entity remains. DM-controlled whispers, visions, or commands occur randomly."
            ]
        },
        "radiant": {
            "1": [
                "**Retinal Flashburn:** Disadvantage on Perception (sight) for 24 hours.",
                "**Solar Rash:** Disadvantage on Stealth (skin glows faintly in the dark).",
                "**Photic Nausea:** Disadvantage on Concentration checks for 1 day.",
                "**Ocular Throbbing:** Disadvantage on ranged attacks and Insight until next long rest."
            ],
            "2": [
                "**Dermal Peeling:** Disadvantage on Charisma-based checks. Your skin flakes and sloughs unnaturally.",
                "**Mild Radiation Sickness:** Disadvantage on Constitution saves for 1d4 days.",
                "**Static Muscle Tremor:** Disadvantage on Dexterity saves and ranged weapon attacks.",
                "**Halo Burn:** Skin glows faintly. Cannot benefit from invisibility until healed."
            ],
            "3": [
                "**Immune Collapse:** Disadvantage on saving throws against poison and disease until magically healed.",
                "**Lightblind:** In bright light, you are effectively blinded.",
                "**Radiation Cough:** Constitution-based checks made at disadvantage. Long rest requires medical attention.",
                "**UV Neural Lag:** Delay in response. You act at the end of initiative for 1d4 combats."
            ],
            "4": [
                "**Bone Marrow Failure:** Max HP reduced by 10 until magically healed.",
                "**Skin Transparency:** Cannot wear armor. Your body no longer tolerates constriction.",
                "**Neural Discharge Loop:** At the end of each long rest, make a DC 13 Wis save or be Stunned for 1 round.",
                "**Retinal Shedding:** One eye permanently blinded. Magical healing required."
            ],
            "5": [
                "**Chromosoul Collapse:** Constitution score reduced by 4 until Regenerate or divine restoration.",
                "**Terminal Light Poisoning:** Any healing spell heals only half its value.",
                "**Irreversible Cell Burn:** Take 1d8 radiant damage when exposed to sunlight or daylight spells.",
                "**Spectral Fragmentation:** You are slightly out of sync with reality. Disadvantage on saving throws vs banishment, teleportation, and radiant effects."
            ]
        }
    };
    const VALID_DAMAGE_TYPES = Object.keys(injuryTables);


    // Handles chat input for the !li command
    const handleInput = (msg) => {
        if (msg.type !== "api" || !msg.content.toLowerCase().startsWith("!li ")) {
            return;
        }

        const args = msg.content.trim().split(/\s+/);
        // !li <damage_type> <con_save>
        if (args.length < 3) {
            sendChat("System", `/w "${msg.who.split(' ')[0]}" Incorrect syntax. Use: !li <damage_type> <constitution_save_result>`, null, {noarchive:true});
            return;
        }
        
        if (!msg.selected || msg.selected.length === 0) {
            sendChat("System", `/w "${msg.who.split(' ')[0]}" Error: You must have the character's token selected to run this command.`, null, {noarchive:true});
            return;
        }

        const damageType = args[1].toLowerCase();
        const conSave = parseInt(args[2]);
        const selectedToken = getObj('graphic', msg.selected[0]._id);
        const characterId = selectedToken.get('represents');
        
        if (!characterId) {
             sendChat("System", `/w "${msg.who.split(' ')[0]}" Error: The selected token does not represent a character.`, null, {noarchive:true});
             return;
        }
        const character = getObj('character', characterId);

        if (VALID_DAMAGE_TYPES.indexOf(damageType) === -1) {
            sendChat("System", `/w "${msg.who.split(' ')[0]}" Error: Invalid damage type '${damageType}'. Valid types are: ${VALID_DAMAGE_TYPES.join(', ')}.`, null, {noarchive:true});
            return;
        }

        if (isNaN(conSave)) {
            sendChat("System", `/w "${msg.who.split(' ')[0]}" Error: Constitution save result must be a number.`, null, {noarchive:true});
            return;
        }
        
        const currentHP = parseInt(selectedToken.get('bar1_value')) || 0;
        const damageBelowZero = currentHP < 0 ? Math.abs(currentHP) : 0;
        const severityNumber = damageBelowZero - conSave;

        // Determine Injury Category
        let injuryCategory = 0;
        if (severityNumber >= 21) { injuryCategory = 5; }
        else if (severityNumber >= 16) { injuryCategory = 4; }
        else if (severityNumber >= 11) { injuryCategory = 3; }
        else if (severityNumber >= 6) { injuryCategory = 2; }
        else if (severityNumber >= 1) { injuryCategory = 1; }

        let injuryResult;
        if (injuryCategory <= 0) {
            injuryResult = "**No Lingering Injury:** You're lucky—no lingering harm.";
        } else {
            const injuriesForCategory = injuryTables[damageType][injuryCategory];
            const randomIndex = randomInteger(4) - 1; // 0-3
            injuryResult = injuriesForCategory[randomIndex];
        }
        
        const player = getPlayerForCharacter(character.id);
        const output = buildOutput(character.get('name'), damageType, damageBelowZero, conSave, severityNumber, injuryCategory, injuryResult);

        sendChat("Lingering Injury", `/w gm ${output}`);
        if(player) {
            sendChat("Lingering Injury", `/w "${player.get('displayname')}" ${output}`);
        }
    };
    
    // Detects when HP drops to 0 or below
    const handleHPChange = (obj, prev) => {
        const currentHP = obj.get('bar1_value');
        const prevHP = prev.bar1_value;

        if (prevHP > 0 && currentHP <= 0 && obj.get('represents')) {
            const character = getObj('character', obj.get('represents'));
            if (character) {
                const charName = character.get('name');
                const player = getPlayerForCharacter(character.id);
                
                let prompt = `<div style="border: 2px solid #a83232; border-radius: 5px; background-color: #f0e2e2; padding: 5px; font-family: sans-serif;">`
                    + `<h4>Lingering Injury Roll!</h4>`
                    + `<p><strong>${charName}</strong> has been reduced to 0 HP or less!</p>`
                    + `<p>The damage exceeded their remaining HP. To determine the injury, the player must make a <strong>Constitution Saving Throw</strong>. Once complete, select the token and run the injury command.</p>`
                    + `<p><strong>Command:</strong><br><code>!li &lt;damage_type&gt; &lt;con_save_result&gt;</code></p>`
                    + `<p><strong>Example:</strong><br><code>!li slashing 14</code></p>`
                    + `</div>`;
                    
                sendChat("System", `/w gm ${prompt}`, null, {noarchive:true});
                 if(player) {
                    sendChat("System", `/w "${player.get('displayname')}" ${prompt}`, null, {noarchive:true});
                }
            }
        }
    };
    
    // Builds the final chat output message
    const buildOutput = (charName, damageType, belowZero, conSave, severity, category, result) => {
        let content = `<div style="border: 2px solid #40567c; border-radius: 5px; background-color: #e6eaf2; padding: 5px; font-family: sans-serif;">`
            + `<h4 style="margin: 3px 0;">Lingering Injury: ${charName}</h4>`
            + `<hr style="border-top: 1px solid #40567c; border-bottom: none; margin: 5px 0;">`
            + `<p style="margin: 2px 0;"><strong>Calculation:</strong></p>`
            + `<ul style="margin: 2px 0 10px 20px; padding: 0;">`
            + `<li>Damage Below Zero: <strong>${belowZero}</strong></li>`
            + `<li>Constitution Save: <strong>${conSave}</strong></li>`
            + `<li><strong>Final Injury Score:</strong> ${belowZero} - ${conSave} = <strong>${severity}</strong></li>`
            + `</ul>`
            + `<p style="margin: 2px 0;"><strong>Result:</strong></p>`
            + `<ul style="margin: 2px 0 10px 20px; padding: 0;">`
            + `<li>Damage Type: <em>${damageType.charAt(0).toUpperCase() + damageType.slice(1)}</em></li>`
            + `<li>Injury Category: <strong>${category > 0 ? category : 'None'}</strong></li>`
            + `</ul>`
            + `<div style="text-align:left; font-size: 1.1em; border: 1px solid #40567c; padding: 5px; background-color: #fff;">${result}</div>`
            + `</div>`;
        return content;
    };
    
    // Finds which player controls a character
    const getPlayerForCharacter = (charId) => {
        const character = getObj('character', charId);
        if (!character) return null;

        let controllerIds = character.get('controlledby').split(',');
        if (controllerIds.length === 0 || controllerIds[0] === '' || controllerIds.includes('all')) {
            return null;
        }
        
        for(let i=0; i < controllerIds.length; i++){
            let player = getObj('player', controllerIds[i]);
            if(player && !player.get('online')) continue; // Optional: Only whisper to online players
            if(player) return player;
        }
        return null;
    };
    
    const checkInstall = () => {
        log(`-=> Lingering Injury Calculator v${VERSION} by Gemini & You <=-`);
    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('change:graphic:bar1_value', handleHPChange);
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
})();

on('ready', () => {
    LingeringInjury.CheckInstall();
    LingeringInjury.RegisterEventHandlers();
});
