on("ready", function() {
  state.SpecDmg = { hitloc: "Chest", hitlocname: "Chest", damage: 0, pierce: 0, mode: 0, specdmg: 0};
});

on("chat:message", function(msg) {
  //
  if (msg.type == "api" && msg.content.indexOf("!specdmg ") !== -1) {
    var args = msg.content.split(" ");
    var dmg = parseInt(args[1]);
    var prc = parseInt(args[2]);
    
    if(dmg == NaN) {
        sendChat("", "/w " + msg.who + "Bad damage value passed to specdmg!");
        return;
    } 
    
    sendChat("", "/em ==============");
    
    sendChat("", "/em Rolling hit location!");
    
	state.SpecDmg.damage = dmg;
	state.SpecDmg.pierce = prc;
	
	rollHitLoc();
	
	sendChat("", "/em The attack deals " + dmg + " points of damage to the " + state.SpecDmg.hitlocname + " with " + prc + " points of piercing!");
    
    state.SpecDmg.mode = 1;
    
    sendChat("", "/em " + msg.who + " is entering the appropriate armor value...");
    
    sendChat("", "/w " + msg.who + "What is the armor on that location? Please chat '!armor [value]'");
  }
  
  else if (msg.type == "api" && state.SpecDmg.mode == 1 && msg.content.indexOf("!armor ") !== -1) {
    state.SpecDmg.mode = 0;
      
    var armorStr = msg.content.replace("!armor ", "");
    var armor = parseInt(armorStr);
    
	var prc = state.SpecDmg.pierce;
    var dmg = state.SpecDmg.damage - Math.max(armor-prc, 0);
    
	//armor prints
	if (prc >= armor) {
		sendChat("", "/em The attack passes through the armor without resistance!");
	} else if (dmg == 0) {
		sendChat("", "/em The attack is completely deflected by the armor!");
	} else {
		sendChat("", "/em The armor fails to stop the attack completely!");
	}
	
    var dice = Math.floor(dmg/5.0);
    if (dice > 0) {
        rollSpecDmg(dice);
	} else if (dmg > 0) {
        sendChat("", "/em Minimal damage is inflicted!");
    } else {
        sendChat("", "/em The attack has no effect!");
    }
  }
  
});

function rollSpecDmg(dice) {
    // sendChat("", "/em " +  "Rolling " + (2 * dice) + "d10 on the appropriate special damage table!";
    sendChat("", "/gmroll " + (2*dice) + "d10", function(ops){
            var result = ops[0];
            var content = JSON.parse(result.content);
            var roll = content["total"];
            state.SpecDmg.specdmg = roll;
            log("Rolled " + state.SpecDmg.specdmg + " on the appropriate special damage table!");
			if(state.SpecDmg.hitloc == "Finger") {                
				if (roll <= 10) {
				sendChat("","/em " + state.SpecDmg.hitlocname + " Broken. +1 Bleed..");
				} else if (roll <= 20) {
					sendChat("", "/em " + state.SpecDmg.hitlocname + " Severely Broken. +2 Bleed.");
				} else if (roll <= 30) {
					sendChat("", "/em " + state.SpecDmg.hitlocname + " Shattered. +5 Bleed");
				} else if (roll <= 40) {
					sendChat("", "/em " + state.SpecDmg.hitlocname + " cut in half. +10 Bleed");
				} else if (roll <= 50) {
					sendChat("","/em " + state.SpecDmg.hitlocname + " removed. +10 Bleed");
				}
            }
            else if(state.SpecDmg.hitloc == "Neck") {                
				if (roll <= 10) {
				sendChat("","/em Lacerations against the neck. Bruising and +5 Bleed.");
				} else if (roll <= 20) {
					sendChat("", "/em Neck gashed open. +10 Bleed.");
				} else if (roll <= 30) {
					sendChat("", "/em The Neck is damaged and torn open. +15 Bleed.");
				} else if (roll <= 40) {
					sendChat("", "/em Neck Struck and shrapnel bursts out. +20 Bleed.");
				} else if (roll <= 50) {
					sendChat("","/em Jugular struck. +35 Bleed.");
				}
            }
            else if(state.SpecDmg.hitloc == "Face") {                
				if (roll <= 10) {
					sendChat("", "/em The " + state.SpecDmg.hitlocname + " was sliced. +4 Bleed.");
				}
				else if (roll <= 20) {
					sendChat("", "/em The " + state.SpecDmg.hitlocname + " was struck, take a chunk of flesh and cartilage with it. +10 Bleed.");
				}
				else if (roll <= 30) {
					sendChat("", "/em The " + state.SpecDmg.hitlocname + " was hit and has been punctured through, causing bleeding and a larger part of the appendage to be removed. +15 Bleed.");
				}
				else if (roll <= 40) {
					sendChat("", "/em The " + state.SpecDmg.hitlocname + " was nearly lopped off with the blow, causing at least half to be removed. +20 Bleed.");
				}
				else if (roll <= 50) {
					sendChat("", "/em The attack strikes the " + state.SpecDmg.hitlocname + ", completely removing the gist of it. +25 Bleed.");
				}
            }
			else if(state.SpecDmg.hitloc == "Intestines") {
				if (roll <= 10) {
					sendChat("", "/em The attack strikes into the " + state.SpecDmg.hitlocname + ", +5 Bleed.");
				}
				else if (roll <= 20) {
					sendChat("", "/em A more devastating attack to the " + state.SpecDmg.hitlocname + ". +10 Bleed.");
				}
				else if (roll <= 30) {
					sendChat("", "/em The " + state.SpecDmg.hitlocname + " are struck, dealing +15 Bleed.");
				}
				else if (roll <= 40) {
					sendChat("", "/em The attack ravages its way through the " + state.SpecDmg.hitlocname + ", creating lacerations and major bruising across the organs. +20 Bleed");
				}
				else if (roll <= 50) {
					sendChat("", "/em The " + state.SpecDmg.hitlocname + " are wrecked by the attack. Causes major internal bleeding and bruises across the wound. +25 Bleed");
				}
			}
			else if(state.SpecDmg.hitloc == "Guts") {
				if (roll <= 10) {
					sendChat("", "/em The " + state.SpecDmg.hitlocname + " is sliced by the attack. +5 Bleed.");
				}
				else if (roll <= 20) {
					sendChat("", "/em Pain is unleashed across the " + state.SpecDmg.hitlocname + " and body. Heavy Bruises and bleeding begin. +10 Bleed.");
				}
				else if (roll <= 30) {
					sendChat("", "/em The " + state.SpecDmg.hitlocname + " is struck, causing part of it to be removed. +15 Bleed.");
				}
				else if (roll <= 40) {
					sendChat("", "/em The attack smashes directly into the " + state.SpecDmg.hitlocname + ". +20 Bleed.");
				}
				else if (roll <= 50) {
					sendChat("", "/em The attack pierces the " + state.SpecDmg.hitlocname + " causing intense damage. +25 Bleed.");
				}
			}
			else if(state.SpecDmg.hitloc == "Joint") {
				if (roll <= 10) {
					sendChat("", "/em The " + state.SpecDmg.hitlocname + " is struck and causes bruising and cuts to form across the wound. Bruising and +5 Bleed.");
				}
				else if (roll <= 20) {
					sendChat("", "/em The " + state.SpecDmg.hitlocname + " is hit, causing small bleeding and discomfort when using the " + state.SpecDmg.hitlocname + ". +10 Bleed and Heavy Bruising.");
				}
				else if (roll <= 30) {
					sendChat("", "/em The " + state.SpecDmg.hitlocname + " is damaged, causing problems when using it. Any action that uses the " + state.SpecDmg.hitlocname + " is at a -10. +15 Bleed.");
				}
				else if (roll <= 40) {
					sendChat("", "/em The " + state.SpecDmg.hitlocname + " is heavily damaged and the bone and cartilage is fractured. -20 to actions using the " + state.SpecDmg.hitlocname + ". +20 Bleed.");
				}
				else if (roll <= 50) {
					sendChat("", "/em The cartilage in the " + state.SpecDmg.hitlocname + " is completely devastated; causing fractures and impedes the mobility of the " + state.SpecDmg.hitlocname + ". -25 to actions using the " + state.SpecDmg.hitlocname + ". +25 Bleed.");
				}
			}
			else if(state.SpecDmg.hitloc == "Heart") {
				if (roll <= 10) {
					sendChat("", "/em The attack strikes and ravages the flesh. Heavy bruising occurs. +5 Bleed.");
				}
				else if (roll <= 20) {
					sendChat("", "/em The strike impacts the character, knocking the breath from the character. +15 Bleed.");
				}
				else if (roll <= 30) {
					sendChat("", "/em The attack fractures a rib, causing some of it to splinter in the heart. +25 Bleed.");
				}
				else if (roll <= 40) {
					sendChat("", "/em A rib is struck and pushed in to the heart, puncturing it. +30 Bleed.");
				}
				else if (roll <= 50) {
					sendChat("", "/em The attack ravages the heart and ribs, causing extreme pain and internal bleeding. +50 Bleed.");
				}
			}
			else if(state.SpecDmg.hitloc == "Skull") {
				if (roll <= 10) {
					sendChat("", "/em The attack strikes and ravages the " + state.SpecDmg.hitlocname + ". +5 Bleed.");
				}
				else if (roll <= 20) {
					sendChat("", "/em The strike impacts the character in the " + state.SpecDmg.hitlocname + ", knocking the breath from the character. +5 Bleed and Stunned for 1D10-Toughness Modifier Turns.");
				}
				else if (roll <= 30) {
					sendChat("", "/em The attack fractures the skull, causing some of it to splinter inward. +10 Bleed. Stunned for 2D10-Toughness Modifier Turns.");
				}
				else if (roll <= 40) {
					sendChat("", "/em The skull is punctured. +15 Bleed. Stunned for 3D10-Toughness Modifier Turns.");
				}
				else if (roll <= 50) {
					sendChat("", "/em The attack ravages the head, causing extreme pain and internal bleeding. +20 Bleed. Stunned for 4D10-Toughness Modifier Turns.");
				}
			}
			else if(state.SpecDmg.hitloc == "Arm") {
				if (roll <= 10) {
					sendChat("", "/em The flesh is damaged and the " + state.SpecDmg.hitlocname + " is bleeding. +5 Bleed.");
				}
				else if (roll <= 20) {
					sendChat("", "/em Skin on the " + state.SpecDmg.hitlocname + " is tattered. +10 Bleed.");
				}
				else if (roll <= 30) {
					sendChat("", "/em The " + state.SpecDmg.hitlocname + "'s bone was struck, creating micro-fractures along the impact. +15 Bleed. -5 to any actions using this limb.");
				}
				else if (roll <= 40) {
					sendChat("", "/em The " + state.SpecDmg.hitlocname + "'s bone becomes broken. +20 Bleed. -15 to any actions using this limb.");
				}
				else if (roll <= 50) {
					sendChat("", "/em The " + state.SpecDmg.hitlocname + " becomes heavily damaged, either being cut off or being too damaged. +25 Bleed. This appendage is now useless.");
				}
			}
			else if(state.SpecDmg.hitloc == "Lung") {
				if (roll <= 10) {
					sendChat("", "/em The " + state.SpecDmg.hitlocname + " is heavily damaged, lung is fine. +5 Bleed.");
				}
				else if (roll <= 20) {
					sendChat("", "/em The " + state.SpecDmg.hitlocname + " is impacted and the attack bounces off a rib. The breath is knocked from the character. +10 Bleed and Stunned for 1D10-Toughness Modifier Turns.");
				}
				else if (roll <= 30) {
					sendChat("", "/em A rib is snapped and shattered. +15 Bleed. Stunned for 2D10-Toughness Modifier Turns. ");
				}
				else if (roll <= 40) {
					sendChat("", "/em A rib is struck and pushed into the lung. +20 Bleed. Stunned for 3D10-Toughness Modifier Turns.");
				}
				else if (roll <= 50) {
					sendChat("", "/em The attack punctures the " + state.SpecDmg.hitlocname + " causing extreme pains and possible death. +25 Bleed. Stunned for 4D10-Toughness Modifier Turns. Character begins suffocating.");
				}
			}
			else if(state.SpecDmg.hitloc == "Eye") {
				if (roll <= 10) {
					sendChat("", "/em The eye is damaged and is hard to properly see out of. -5 to all eyesight-based Perception Tests.");
				}
				else if (roll <= 20) {
					sendChat("", "/em The impact damages the eye with shrapnel. -20 to all eyesight-based Perception Tests. +5 Bleed.");
				}
				else if (roll <= 30) {
					sendChat("", "/em The eye is heavily damaged and is counted as blind for 1D10-Toughness Modifier hours. +10 Bleed.");
				}
				else if (roll <= 40) {
					sendChat("", "/em The eye is impacted heavily and is counted as blind for 3D10-Toughness Modifier in Days. +15 Bleed.");
				}
				else if (roll <= 50) {
					sendChat("", "/em The eye is completely destroyed. +20 Bleed.");
				}
			}
			else if(state.SpecDmg.hitloc == "Hand") {
				if (roll <= 10) {
					sendChat("", "/em The flesh of the " + state.SpecDmg.hitlocname + " is damaged, -5 for Warfare Tests.");
				}
				else if (roll <= 20) {
					sendChat("", "/em " + state.SpecDmg.hitlocname + " is hit. -10 for Warfare Tests. +5 Bleed. ");
				}
				else if (roll <= 30) {
					sendChat("", "/em The bones of the " + state.SpecDmg.hitlocname + " were struck, creating hundreds of microfractures along the impact. +10 for Tests involving the hand. +10 Bleed.");
				}
				else if (roll <= 40) {
					sendChat("", "/em The bones of the " + state.SpecDmg.hitlocname + " are broken where the impact hits. +9 Bleed. -10 to any actions using the limb. +15 Bleed.");
				}
				else if (roll <= 50) {
					sendChat("", "/em The " + state.SpecDmg.hitlocname + " becomes heavily damaged, either from being cut completely off or being far too damaged and broken. +20 Bleed. This appendage is now useless.");
				}
			}
			else if(state.SpecDmg.hitloc == "Foot") {
				if (roll <= 10) {
					sendChat("", "/em The " + state.SpecDmg.hitlocname + " is lightly damaged. -5 for Movement Tests.");
				}
				else if (roll <= 20) {
					sendChat("", "/em " + state.SpecDmg.hitlocname + " is hit. -10 for Movement Tests. +5 Bleed.");
				}
				else if (roll <= 30) {
					sendChat("", "/em The bones of the " + state.SpecDmg.hitlocname + " were struck, creating hundreds of microfractures along the impact. +10 Bleed. -10 to Agility.");
				}
				else if (roll <= 40) {
					sendChat("", "/em The bones in the " + state.SpecDmg.hitlocname + " have been struck deeply. The bone is broken where the impact hits. +15 Bleed. -20 to Agility.");
				}
				else if (roll <= 50) {
					sendChat("", "/em The " + state.SpecDmg.hitlocname + " becomes heavily damaged, either from being cut completely off or too damaged. +20 Bleed. This appendage is now useless.");
				}
			}
			else if(state.SpecDmg.hitloc == "Pelvis") {
				if (roll <= 10) {
					sendChat("", "/em The flesh of the " + state.SpecDmg.hitlocname + " is damaged. -5 to Movement Tests.");
				}
				else if (roll <= 20) {
					sendChat("", "/em Skin over the " + state.SpecDmg.hitlocname + " is tattered on impact. -5 to Movement Tests. +5 Bleed.");
				}
				else if (roll <= 30) {
					sendChat("", "/em The " + state.SpecDmg.hitlocname + " was struck, creating hundreds of micro-fractures along the impact. -10 to Movement Tests. +5 Bleed.");
				}
				else if (roll <= 40) {
					sendChat("", "/em The " + state.SpecDmg.hitlocname + " has been struck deeply. The bone is broken where the impact hits. -10 to Movement Tests. +10 Bleed.");
				}
				else if (roll <= 50) {
					sendChat("", "/em The " + state.SpecDmg.hitlocname + " is shattered at the point of impact. -15 to Movement Tests. +15 Bleed.");
				}
			}
			else if(state.SpecDmg.hitloc == "Chest") {
				if (roll <= 10) {
					sendChat("", "/em The point of impact is heavily bruised. Stunned for 1D5-Toughness Modifier Turns.");
				}
				else if (roll <= 20) {
					sendChat("", "/em Skin on the " + state.SpecDmg.hitlocname + " is tattered and begins to bleed. Stunned for 1D10-Toughness Modifier Turns.");
				}
				else if (roll <= 30) {
					sendChat("", "/em The bones in the " + state.SpecDmg.hitlocname + " were struck, creating hundreds of micro-fractures along the impact. +5 Bleed. Stunned for 1D10-Toughness Modifier Turns.");
				}
				else if (roll <= 40) {
					sendChat("", "/em A rib was shattered. +10 Bleed. Stunned for 1D10-Toughness Modifier Turns.");
				}
				else if (roll <= 50) {
					sendChat("", "/em A Rib was completely destroyed from the attack. -10 to Evasion Tests until treated. Stunned for 1D10-Toughness Modifier Turns. +15 Bleed.");
				}
			}
			else if(state.SpecDmg.hitloc == "Mouth") {
				if (roll <= 10) {
					sendChat("", "/em The flesh of the " + state.SpecDmg.hitlocname + " is damaged. -5 to Speech based Tests.");
				}
				else if (roll <= 20) {
					sendChat("", "/em Skin around the " + state.SpecDmg.hitlocname + " is tattered and begins to bleed. Roll Toughness Test, if failed, a tooth is lost. -10 to Speech based Tests.");
				}
				else if (roll <= 30) {
					sendChat("", "/em The " + state.SpecDmg.hitlocname + " was struck, damaging teeth. +5 Bleed. Removes 1D5 teeth. -20 to Speech based Tests.");
				}
				else if (roll <= 40) {
					sendChat("", "/em The tongue is torn up and 1D10 teeth are removed. -20 Speech based Tests. +10 Bleed.");
				}
				else if (roll <= 50) {
					sendChat("", "/em The attack deals massive damage to the " + state.SpecDmg.hitlocname + ", removing 2D5 teeth. -30 to Speech based Tests. +15 Bleed.			");
				}
			}
			else if(state.SpecDmg.hitloc == "Oral") {
				if (roll <= 10) {
					sendChat("", "/em Skin of the " + state.SpecDmg.hitlocname + " impacted. -5 to Speech based Tests.");
				}
				else if (roll <= 20) {
					sendChat("", "/em The " + state.SpecDmg.hitlocname + " was struck and takes a chunk of flesh and cartilage with it. +5 Bleed. -10 to Speech based Tests.");
				}
				else if (roll <= 30) {
					sendChat("", "/em The " + state.SpecDmg.hitlocname + " was hit and has been punctured through, causing bleeding and tearing. +10 Bleed. -15 to Speech based Tests.");
				}
				else if (roll <= 40) {
					sendChat("", "/em The " + state.SpecDmg.hitlocname + " was incredibly damaged with the blow, causing heavy tearing. +15 Bleed. -20 to Speech based Tests.");
				}
				else if (roll <= 50) {
					sendChat("", "/em The attack lops off a part of the " + state.SpecDmg.hitlocname + ". +20 Bleed. -30 to Speech based Tests.");
				}
			}
			else
			{
				sendChat("", "/em AN ERROR OCCURRED!");
				sendChat("", "/em hitloc: " + state.SpecDmg.hitloc + " \n/em hitlocname: " + state.SpecDmg.hitlocname + " \n/em roll: " + roll);
			}
        });
}

function rollHitLoc() {
    var roll = randomInteger(100);
    var hitloc = "";
    var hitlocname = "";
    if(roll == 1){ hitloc = "Neck"; }
	else if(roll == 2){ hitlocname = "Chin"; hitloc="Oral"}
	else if(roll == 3){ hitloc = "Mouth"; }
	else if(roll <= 5){ hitlocname = "Nose"; hitloc="Face"}
	else if(roll <= 7){ hitlocname = "Cheek"; hitloc="Oral"}
	else if(roll == 8){ hitloc = "Eye"; }
	else if(roll == 9){ hitlocname = "Forehead"; hitloc="Skull"}
	else if(roll == 10){ hitlocname = "Ear"; hitloc="Face"}
	else if(roll == 11){ hitloc = "Right Fingers"; }
	else if(roll == 12){ hitlocname = "Right Hand"; hitloc = "Hand"}
	else if(roll <= 15){ hitlocname = "Right Forearm"; hitloc = "Arm"}
	else if(roll == 16){ hitlocname = "Right Elbow"; hitloc="Joint";}
	else if(roll <= 19){ hitlocname = "Right Bicep"; hitloc = "Arm"}
	else if(roll == 20){ hitlocname = "Right Shoulder"; hitloc="Joint";}
	else if(roll == 21){ hitloc = "Left Finger"; }
	else if(roll == 22){ hitlocname = "Left Hand"; hitloc = "Hand"}
	else if(roll <= 25){ hitlocname = "Left Forearm"; hitloc = "Arm"}
	else if(roll == 26){ hitlocname = "Left Elbow"; hitloc="Joint";}
	else if(roll <= 29){ hitlocname = "Left Bicep"; hitloc = "Arm"}
	else if(roll == 30){ hitlocname = "Left Shoulder"; hitloc="Joint";}
	else if(roll <= 36){ hitlocname = "Small Intestines"; hitloc = "Intestines";}
	else if(roll <= 42){ hitlocname = "Large Intestines";  hitloc = "Intestines";}
	else if(roll <= 48){ hitlocname = "Kidney"; hitloc = "Guts"}
	else if(roll <= 54){ hitlocname = "Stomach"; hitloc = "Guts"}
	else if(roll <= 59){ hitloc = "Heart"; }
	else if(roll <= 66){ hitloc = "Lung"; }
	else if(roll <= 70){ hitloc = "Chest";}
	else if(roll == 71){ hitlocname = "Right Toes"; }
	else if(roll == 72){ hitlocname = "Right Foot"; hitloc = "Foot"}
	else if(roll == 73){ hitlocname = "Right Ankle"; hitloc="Joint"; }
	else if(roll <= 77){ hitlocname = "Right Shin"; hitloc = "Arm"}
	else if(roll == 78){ hitlocname = "Right Knee"; hitloc="Joint"; }
	else if(roll <= 83){ hitlocname = "Right Thigh"; hitloc = "Arm"}
	else if(roll <= 85){ hitlocname = "Right Pelvis"; hitloc = "Pelvis"}
	else if(roll == 86){ hitlocname = "Left Toes"; }
	else if(roll == 87){ hitlocname = "Left Foot"; hitloc = "Foot"}
	else if(roll == 88){ hitlocname = "Left Ankle"; hitloc="Joint";}
	else if(roll <= 92){ hitlocname = "Left Shin"; hitloc = "Arm"}
	else if(roll == 93){ hitlocname = "Left Knee"; hitloc="Joint";}
	else if(roll <= 98){ hitlocname = "Left Thigh"; hitloc = "Arm"}
	else if(roll <= 100){ hitlocname = "Left Pelvis"; hitloc = "Pelvis"}
	
	//now resolve special cases for digits and single-point groups
	if ( hitloc == "Left Toes" ) {
		hitlocname = "Left " + rollToe() + " Toe";
		hitloc = "Finger";
	} else if ( hitloc == "Right Toes" ) {
		hitlocname = "Right " + rollToe() + " Toe";
		hitloc = "Finger";
	} else if ( hitloc == "Left Fingers" ) {
		hitlocname = "Left " + rollFinger();
		hitloc = "Finger";
	} else if ( hitloc == "Right Fingers" ) {
		hitlocname = "Right " + rollFinger();
		hitloc = "Finger";
	} else if ( hitlocname == "") {
		hitlocname = hitloc;
	}
	
	state.SpecDmg.hitloc = hitloc;
	state.SpecDmg.hitlocname = hitlocname;
}

function rollToe() {
	var roll = randomInteger(5);
	if(roll == 1){ return "Big"; }
	else if(roll == 2){ return "Second"}
	else if(roll == 3){ return "Middle"; }
	else if(roll == 4){ return "Fourth"; }
	else { return "Pinky"; }
}

function rollFinger() {
	var roll = randomInteger(5);
	if(roll == 1){ return "Thumb"; }
	else if(roll == 2){ return "Pointer Finger"}
	else if(roll == 3){ return "Middle Finger"; }
	else if(roll == 4){ return "Ring Finger"; }
	else { return "Pinky"; }
}