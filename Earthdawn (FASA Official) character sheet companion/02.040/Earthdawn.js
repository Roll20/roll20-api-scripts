//
// Earthdawn Step Dice Roller
// Plus Earthdawn 4th edition character sheet helper class, which also serves as helper for the 1879 (FASA Official) character sheet.
//
// By Chris Dickey
// Version: See line two of code below.
// Last updated: 2021 Dec 13.
//
// Earthdawn (FASA Official) Character sheet and associated API Copyright 2015-2021 by Christopher D. Dickey.
//
// The Earthdawn step dice roller will take an Earthdawn 4th edition step number and roll the appropriate dice.
// For example: if a macro such as      !edsdr~ ?{Step|0}~ ?{Karma Step|0}~ for ?{reason| no reason}
// results in a string such as          !edsdr~ 10~ 0~ for melee attack
// this module will roll the step 10 dice (2d8!) and display the results.

// Commands that will call this section of the script are as follows.
//      !edsdr~ ?{Step|0}~ ?{Karma Step|0}~ for ?{reason| no reason}              These results will be public to everybody
//      !edsdrGM~ ?{Step|0}~ ?{Karma Step|0}~ for ?{reason| no reason}            These results will display only to the GM and the person who ordered the dice roll.
//      !edsdrHidden~ ?{Step|0}~ ?{Karma Step|0}~ for ?{reason| no reason}        These results will display to the GM only, and NOT to the person (other than the GM) who ordered the dice roll.
//      !edInit~ ?{Initiative Step}~ ?{Karma Step | 0}~ for Initiative            The results will be added to the Initiative tracker.
//
//
// This module also contains a great deal of code that works with the Earthdawn and 1879 character sheets authored by Chris Dickey and Jean-Baptiste Faure (Discord/Facebook Jiboux Faure).
// This is all within the ParseObj class. If that class is removed, the stepdice roller will still work, but not the character sheet buttons.
//
// All commands that invoke this section of the code start with         !Earthdawn~
// See the comments in the ParseObj.Parse() routine and the individual routines for additional information on each of them.
//


//
// Define a Name-space
var Earthdawn = Earthdawn || {};
            // define any name-space constants
Earthdawn.Version = "2.04";       // This is the version number of this API file.  state.Earthdawn.sheetVersion is the version number of the html file.

Earthdawn.whoFrom = {
  player:                 0x08,
  character:              0x10,
  api:                    0x20,
  apiError:               0x40,
  apiWarning:             0x80,
  noArchive:            0x0100,
  mask:                 0x01F8 }; // This can be &'ed to get only the whoFrom part.
Earthdawn.whoTo = {             // Note: whoTo: 0 is broadcast to everybody.    WhoTo 3 is both player and GM.
  public:                 0x00,
  player:                 0x01,
  gm:                     0x02,
  mask:                   0x03 }; // This can be &'ed to get only the whoTo part

Earthdawn.flagsArmor = {        // Note: This describes the contents of the edParse bFlags
  na:                   0x0001,
  PA:                   0x0002,
  MA:                   0x0004,
  None:                 0x0008,
  Unknown:              0x0010,
  Natural:          0x01000000,
  Mask:             0x0100001F }; // This can be &'ed to get only the flagsArmor part.
Earthdawn.flagsTarget = {       // Note: This describes the contents of the edParse bFlags
  PD:                   0x0020,
  MD:                   0x0040,
  SD:                   0x0080,
  Highest:              0x0100,   // Modifies above, such as Highest MD of all targets.
  P1pt:                 0x0200,   // Plus one per target.
  Riposte:              0x0400,
  Ask:                  0x0800,
  Set:                  0x1000,   // Set means attach the targetList to the token.
  Natural:          0x02000000,
  Mask:             0x02001FE0 }; // This can be &'ed to get only the flagsTarget part.
Earthdawn.flags = {             // Note: This describes the contents of the edParse bFlags
  HitsFound:            0x2000,   // At least one of the selected tokens has recorded a hit that has not been cleared.
  HitsNot:              0x4000,
  WillEffect:           0x8000,   // This roll is for a will effect.
  NoOppMnvr:          0x010000,   // This to-hit does not do extra damage on successes.
  VerboseRoll:        0x020000,   // Don't keep this roll information as secret as most rolls.
  Recovery:           0x040000,   // This is a recovery test. Add result to health.
  RecoveryStun:       0x080000 }; // This is a recovery test. Stun only.
Earthdawn.flagsCreature = {     // Note, if you ever change this, it also needs changing in sheetworkers updateCreatureFlags().
  Fury:                 0x0001,
  ResistPain:           0x0002,
  HardenedArmor:        0x0004,
  GrabAndBite:          0x0100,
  Hamstring:            0x0200,
  Overrun:              0x0400,
  Pounce:               0x0800,
  SqueezeTheLife:       0x1000,
  CreatureMask:         0xffff,
  ClipTheWing:      0x00100000,
  CrackTheShell:    0x00200000,
  Defang:           0x00400000,
  Enrage:           0x00800000,
  Provoke:          0x01000000,
  PryLoose:         0x02000000,
  OpponentMask:     0x1ff00000 };
Earthdawn.style = {
  Full:             0,    // Give all information about the roll and target number. IE: Target number 12, Result 18, succeeded by 6 with 1 extra success.
  VagueSuccess:     1,    // Give full result of roll, but don't give detail upon target number or exactly how close to success roll was. IE: Result: 18. 1 extra success.
  VagueRoll:        2 };  // Default. Don't give detail on the roll or the target number, just say how much succeeded or failed by. IE: Succeeded by 6 with 1 extra success.
Earthdawn.charType = {
  object:         "-1", // The token is not really a character at all, but is an object such as a campfire or a torch.
  pc:             "0",
  npc:            "1",
  mook:           "2" };
Earthdawn.tokenLinkNPC = {      // Bit flags that control how the sheet links NPC tokens. These mostly default to true when linking PC tokens.
  showplayers_name:     0x0001, // Players can see NPC nameplates. defaults to true.
  showplayers_karma:    0x0002, // Players can see NPC karma, defaults to false.
  showplayers_pcKarma:  0x0004, // This one is NOT NPCs it controls whether players can see other PCs they do not control karma. Defaults to false in order to give a less cluttered display.
  showplayers_wounds:   0x0008, // defaults to true under the assumption that player can see the wounds.
  showplayers_damage:   0x0010, // defaults to false.
  pcCompact:            0x0040, // PCs will have compact token bars.
  pcAbove:              0x0000, // PCs will have token bars above,
  pcOverTop:            0x0100, // PCs will have token bars Overlapping at the Top.
  pcOverBottom:         0x0200, // PCs will have token bars Overlapping at the Bottom.
  pcBelow:              0x0300, // As above, but sets defaults for NPCs.
  pcMask:               0x0300, // This is all bits in posistion.
  npcCompact:           0x0080, // NPCs will have compact token bars.
  npcAbove:             0x0000, // As above, but NPCs.
  npcOverTop:           0x0400,
  npcOverBottom:        0x0800,
  npcBelow:             0x0C00,
  npcMask:              0x0C00 };

Earthdawn.Colors = {
  dflt:         "cornflowerblue", dfltfg:     "white",    //JBF@JBF dflt used for addSheetButtonCall . Color to be passed as param
  attack:       "darkgreen",      attackfg:   "white",
  action:       "darkgreen",      actionfg:   "white",
  effect:       "firebrick",      effectfg:   "white",
  damage:       "firebrick",      damagefg:   "white",
  health:       "darkgoldenrod",  healthfg:   "white",
  param:        "indigo",         paramfg:    "white",
  param2:       "darkmagenta",    param2fg:   "white",
  statusCond:   "darkblue",       statusoff:  "cornflowerblue",   statusfg:   "white" };



    // define namespace variables.
Earthdawn.StatusMarkerCollection = undefined;


    //  These are namespace utility functions, and as such have no direct access to any object of ether EDclass or ParseObj.

                  // If a named ability does not exist for this character, create it.
Earthdawn.abilityAdd = function ( cID, Ability, ActionStr )  {
  'use strict';
  try {
    let aobj = findObjs({ _type: "ability", _characterid: cID, name: Ability })[0];
    if ( aobj === undefined )
      createObj("ability", { characterid: cID, name: Ability, action: ActionStr, istokenaction: true });
    else {
      if( ActionStr !== aobj.get( "action" ) )
        Earthdawn.set( aobj, "action", ActionStr);
      if( !aobj.get( "istokenaction" ) )
        aobj.set( "istokenaction", true);
    }
  } catch(err) { log( "Earthdawn:abilityAdd() error caught: " + err ); }
} // End abilityAdd



        // If a named ability exists for this character, remove it.
Earthdawn.abilityRemove = function ( cID, Ability )  {
  'use strict';
  try {
    let aobj = findObjs({ _type: "ability", _characterid: cID, name: Ability })[0];
    if ( aobj !== undefined )
      aobj.remove();
    } catch(err) { log( "Earthdawn:abilityRemove() error caught: " + err ); }
} // End abiltiyRemove



    // An attribute for some character has changed. See if it is one that needs special processing and do it.
Earthdawn.attribute = function ( attr, prev ) {
  'use strict';
  try {
//log( attr);   // use attr.get("name") and attr.get("current").
//log( prev);   // use prev["name"] and prev["current"]
    let sa = attr.get( "name" ),
    cID = attr.get( "_characterid" );

    if( sa === "APIflag" && attr.get( "current" ) ) {   // a value in APIflag is sent from the sheetworker script for processing here. We tend to get two, one with "current" blank when it is created, and a 2nd one with the real value. Only pay attention to the 2nd one.
      let ED = new Earthdawn.EDclass(),
        cmdArray = attr.get( "current" ).trim().split( "\n" );
      Earthdawn.pseudoMsg( ED );
      for( let ind = 0; ind < cmdArray.length; ++ind ) {
        let cmdLine = cmdArray[ ind ],
          comma = cmdLine.indexOf( "," ),
          dataLine = cmdLine.slice(comma +1).trim();
        switch ( cmdLine.slice( 0, comma).trim() ) {
          case "abilityAdd": {    // abilityAdd, (name)\r (text)\r optional symbol code.
            Earthdawn.abilityAdd( cID, Earthdawn.constant( Earthdawn.getParam( dataLine, 3, "\r" ))
                + Earthdawn.getParam( dataLine, 1, "\r" ),
                Earthdawn.getParam( dataLine, 2, "\r" ));
          } break;
          case "abilityRemove": {   // abilityRemove, name of ability, optional symbol code.    Remove this ability.
            Earthdawn.abilityRemove( cID, Earthdawn.constant( Earthdawn.getParam( dataLine, 2, "," )) + Earthdawn.getParam( dataLine, 1, "," ));
          } break;
          case "SheetUpdate": {
            function shouldUpdate( ver ) {      // "SheetUpdate," + origSheetVersion.toString() + "," + newSheetVersion.toString()
              return (parseFloat( Earthdawn.getParam( dataLine, 1, ",")) < ver && ver <= parseFloat( Earthdawn.getParam( dataLine, 2, ",")));
            };
            let game = Earthdawn.getParam( dataLine, 3, ",");
//            state.Earthdawn.gED = !game || (game !== "1879" );
//            state.Earthdawn.g1879 = !state.Earthdawn.gED;
//            state.Earthdawn.game = state.Earthdawn.gED ? "ED" : "1879";
            state.Earthdawn.sheetVersion = parseFloat( Earthdawn.getParam( dataLine, 2, ","));    // This is the version number of the html file, Earthdawn.Version is the version number of this API file.
//            if(!( "defRolltype" in state.Earthdawn ))
//              state.Earthdawn.defRolltype = 0x03;
//            if(!( "tokenLinkNPC" in state.Earthdawn ))
//              state.Earthdawn.tokenLinkNPC = Earthdawn.tokenLinkNPC.showplayers_name  | Earthdawn.tokenLinkNPC.showplayers_wounds;

            let cid = attr.get( "_characterid" );   // Note, this tests SHEET (not js) version number.
            if( shouldUpdate( 1.001 ))
              ED.updateVersion1p001( cid );
            if( shouldUpdate( 1.0021 ))
              ED.updateVersion1p0021( cid );
            if( shouldUpdate( 1.0022 ))
              ED.updateVersion1p0022( cid );
            if( shouldUpdate( 1.0023 ))
              ED.updateVersion1p0023( cid, ED );
          } break;
          case "RemoveRow": {   // RemoveRow, (code), (rowID)     // remove everything with this rowID.
            let pre = Earthdawn.buildPre( Earthdawn.getParam( dataLine, 1, ","), Earthdawn.getParam( dataLine, 2, ",")).toLowerCase(),
              attrib = findObjs({ _type: "attribute", _characterid: cID });
            _.each( attrib, function (att) {
              if ( att.get("name").toLowerCase().startsWith( pre ))
              att.remove();

            });
          } break;
          case "RemoveAttr": {    // RemoveAttr, (fully qualified attribute name).    Remove this attribute.
            let attrib = findObjs({ _type: "attribute", _characterid: cID,  name: (dataLine.endsWith( "_max" ) ? dataLine.slice( 0, -4) : dataLine) });
            _.each( attrib, function (att) {
              att.remove();
            });
          } break;
          case "LinkAdd2": {      //APIflag LinkAdd2,code:RowId:code:RowId
            let edParse = new ED.ParseObj( ED );
            edParse.charID = cID;
            let dataArray = dataLine.split(":");
            if( dataArray.length !== 4 ) {
              log("Earthdawn - APIFlag call incorrectly formatted for LinkAdd2 : " + dataLine);
              return;
            }
// See if this works.
            edParse.ChatMenu( [ "ChatMenu","linkadd2", dataArray[ 0 ].trim(), dataArray[ 1 ].trim(), dataArray[ 2 ].trim(), dataArray[ 3 ].trim()] );
          } break;
          case "LinkAdd1": {      //APIflag LinkAdd1,code:RowId:code:name
            let edParse = new ED.ParseObj( ED );
            edParse.charID = cID;
            let dataArray = dataLine.split(":");
            if( dataArray.length !== 4 ) {
              log("Earthdawn - APIFlag call incorrectly formatted for LinkAdd1 : " + dataLine);
              return;
            }
// See if this works.
            edParse.ChatMenu( [ "ChatMenu","linkadd1", dataArray[ 0 ].trim(), dataArray[ 1 ].trim(), dataArray[ 2 ].trim(), dataArray[ 3 ].trim()] );
          } break;

          case "WipeMatrix": {
            let edParse = new ED.ParseObj( ED );
            edParse.charID = cID;
            edParse.Spell( [ "Spell", dataLine, "WipeMatrix", "M"] );
          } break;
          default:
            log( "Unknown command in APIflag: " + cmdLine);
        } // end switch cmdLine
      } // end for cmdArray
      Earthdawn.waitToRemove( cID, sa, 15 );
    } // end APIflag (sent from sheetworker).



    function recordWrap( wrapper ) {
      'use strict';
      let rankTo = attr.get("current");
      if( rankTo === "" )     // This is a newly created row, and has not really been set yet. No need to do anything until data is entered.
        return;
      let rankFrom = prev ? prev["current"]: 0;
      let rankDiff = rankTo - rankFrom;
      if( !rankDiff )       // If there are no actual rank changes.
        return;
      if( Earthdawn.getAttrBN( cID, "NPC", "0" ) != Earthdawn.charType.pc )   // If this is not a PC, don't bother with the accounting.
        return;

      let lp = 0,
        silver = 0,
        iTime = 0,
        lpBasis = 0,
        note = "",
        misclabel = "", miscval,
        header,
        sTime,
        stepValue,
        bCount,
        type;

      function typeLP() {
        if( type === undefined )
          type = Earthdawn.getAttrBN( cID, sa.slice( 0, -4 ) + "Type", "D1-Novice" );
        if( type !== "Free-link" && type.indexOf( "-" ) > -1 ) {   // is of form D1-Novice or some such. Probably with a Discipline and a Tier.
          let tier = Earthdawn.getParam( type, 2, "-"),
            disc = Earthdawn.getParam( type, 1, "-");
          if( (state.Earthdawn.gED && tier == "Novice") || (state.Earthdawn.g1879 && ( bCount !== "S") && ( tier == "Initiate" || tier == "Profession" )))    // Note, bCount might have already been set in SKK.
            bCount = "T";   // Only need to count 1879 if Initiate, or ED if Novice. Otherwise we certainly need accounting.
          if( disc === "QD" ) {       // Questor
            lpBasis = 0;          // Note that this is not the final value, it gets adjusted in the switch below.
            misclabel = tier + " Granted Questor Devotion.";
          } else if( disc === "PA" ) {    // Path
            lpBasis = 0;
            misclabel = tier + " Path Talent Option.";
          } else if( disc === "V" ) {   // Versatility
            lpBasis = 1;
            misclabel = tier + " Versatility.";
          } else {              // Most Disciplines and Skills.
            lpBasis = Earthdawn.parseInt2(disc.slice( -1 )) -1;
            misclabel = tier + [ " ", " 2nd ", " 3rd ", " 4th " ][lpBasis]
                  + (state.Earthdawn.gED  ? ( disc.slice( 0, 2) == "TO" ? "Talent Option" : "Discipline Talent")
                  : (( disc.slice( 0, 2) == "TO") ? "Optional"
                  : ((disc === "F1") ? "Free"
                  : ((tier == "Profession") ? "Prof" : "Core"))) + " Skill");
          }
          if( disc === "F1")
            ++lpBasis;
          switch ( tier ) {
            case "Master":                        ++lpBasis;
            case "Warden":      case "Exemplar":  ++lpBasis;
            case "Journeyman":  case "Adherent":  ++lpBasis;
          }
        } else {    // Not from Discipline
          switch ( type ) {
            case "Master":                        ++lpBasis;
            case "Warden":      case "Exemplar":  ++lpBasis;
            case "Journeyman":  case "Adherent":  ++lpBasis;
            case "Initiate":    case "Novice":
              break;
            case "Dummy":
            case "Free":        // old style
            case "Free-link":   // v2.0
            case "Item":
            case "Item-link":
            case "Creature":
            case "Power":
            case "Other":
              return -1;
            case "Racial":
              misclabel = "Racial Talent";
              lpBasis = 0;
            break;
            case "Versatility":
              misclabel = "Versatility Talent";
              lpBasis = 1;
            break;
            case "Special":
              misclabel = "Special";
              lpBasis = 0;
            break;
            default:
              log( "Error! ED Attribute recordWrap typeLP for: " + sa );
              log( "Continued: Got type: " + type );
          } // end switch type
        } // end else not from discipline
        if( lpBasis > 3 )
          lpBasis = 3;    // Can't cost higher than master.
        return;
      } // end typeLP


      switch( wrapper ) {
        case "DSP_Circle":
          if((rankTo + rankFrom) < 2 )    // First circle in first discipline is free. First circle in all other disciplines is complex.
            return;
          header = Earthdawn.getAttrBN( cID, sa.slice( 0, -10 ) + "DSP_Name", "" );
          misclabel = "Discipline";
          miscval = rankFrom + " -> " + rankTo;
          if( state.Earthdawn.gED )
            note = "Discipline Abilities (such as circle based bonuses to PD or MD) are not automatically added. If Discipline Abilities are gained at this circle you need to add them yourself.";
          break;
        case "Durability-Rank":
          header = "Durability";
          misclabel = "Novice Core Skill";
          miscval = rankFrom + " -> " + rankTo;
          lpBasis = 0;
          break;
        case "Questor":
          header = "";
          misclabel = "Questor Devotion";
          miscval = rankFrom + " -> " + rankTo;
          lpBasis = 1;
          break;
        case "Path-Journeyman":
          header = "";
          misclabel = "Path Talent Costs Journeyman";
          miscval = rankFrom + " -> " + rankTo;
          lpBasis = 1;
          break;
        case "Path-Master":
          header = "";
          misclabel = "Path Talent Costs Master";
          miscval = rankFrom + " -> " + rankTo;
          lpBasis = 3;
          break;
        case "SP_Circle":
          header = Earthdawn.getAttrBN( cID, sa.slice( 0, -6 ) + "Name", "" );
          misclabel = "Spell";
          miscval = "Circle " + rankTo + (( rankFrom > 0 ) ? " (changed from circle "  + rankFrom + ")" : "");
          if( rankTo > 0 )
            lp = Earthdawn.fibonacci( rankTo ) * 100;
          if( rankFrom > 0 )
            lp -= Earthdawn.fibonacci( rankFrom ) * 100;
          silver = rankDiff * 100;
          break;
        case "NAC_Requirements":
          header = Earthdawn.getAttrBN( cID, sa.slice( 0, -12 ) + "Name", "" );
          misclabel = "Knack";
          miscval = "Rank " + rankTo + (( rankFrom > 0 ) ? " (changed from Rank "  + rankFrom + ")" : "");
          if( rankTo > 0 )
            lp = Earthdawn.fibonacci( rankTo ) * 100;
          if( rankFrom > 0 )
            lp -= Earthdawn.fibonacci( rankFrom ) * 100;
          silver = rankDiff * 50;
          sTime = rankTo + " days.";
          break;
        case "Increases":
          header = Earthdawn.getParam( sa, 2, "-");
          misclabel = "Attribute";
          miscval = rankFrom + " -> " + rankTo;
          lpBasis = 4;
          break;
        case "SP-Rank":
          bCount = "T";
          header = Earthdawn.getParam( sa, 2, "-");
          miscval = rankFrom + " -> " + rankTo;
          if (typeLP() === -1)
            return;
          break;
        case "Rank":
          miscval = rankFrom + " -> " + rankTo;
          switch ( Earthdawn.getParam( sa, 4, "_")) {
            case "SPM":
              switch ( Earthdawn.getAttrBN( cID, sa.slice( 0, -4 ) + "Type", "-10" ) ) {
                case "15":  header = "Enh Matrix";    break;
                case "25":  header = "Armor Matrix";  break;
                case "-20": header = "Shared Matrix"; break;
                case "-10":
                default:  header = "Std Matrix";
              }
              type = Earthdawn.getAttrBN( cID, sa.slice( 0, -4 ) + "Origin", "Free" );
              if( type === "Pseudo" ) return;
                  // Note that this falls past SKK into Talent.
            case "SKK":
              if( type === undefined ) {
                bCount = "S";
                misclabel = "Knowledge Skill";
                lpBasis = 1;
                header = Earthdawn.getAttrBN( cID, sa.slice( 0, -4 ) + "Name", "" );
                if( state.Earthdawn.gED )
                  break;      // Earthdawn, all knowledge skills are just skills, never Professional skills.  For 1879, it falls through.
                type = Earthdawn.getAttrBN( cID, sa.slice( 0, -4 ) + "Type", "F1-Novice" );
              }
            case "T":
              if( type === undefined )
                header = Earthdawn.getAttrBN( cID, sa.slice( 0, -4 ) + "Name", "" );
              if (typeLP() === -1)
                return;
              break;
            case "TI":
              header = Earthdawn.getAttrBN( cID, sa.slice( 0, -4 ) + "Name", "" );
              switch ( Earthdawn.getAttrBN( cID, sa.slice( 0, -4 ) + "Type", "Novice" )) {
                case "Novice":      lpBasis = 0;  misclabel = "Thread Item Novice Tier";      break;
                case "Journeyman":  lpBasis = 1;  misclabel = "Thread Item Journeyman Tier";  break;
                case "Warden":      lpBasis = 2;  misclabel = "Thread Item Warden Tier";      break;
                case "Master":      lpBasis = 3;  misclabel = "Thread Item Master Tier";      break;
                default:      return;
              } break;
            case "SK":
              header = Earthdawn.getAttrBN( cID, sa.slice( 0, -4 ) + "Name", "" );
              misclabel = "Skill";
              let t = Earthdawn.getAttrBN( cID, sa.slice( 0, -4 ) + "Type", state.Earthdawn.gED ? "Novice" : "F1-Novice" );
              if( t.indexOf( "-" ) != -1 )
                t = t.slice( t.indexOf( "-" ) + 1);
              switch ( t ) {
                case "Initiate":    lpBasis = 1;  misclabel = "Initiate Skill";   if( state.Earthdawn.g1879 ) bCount = "S";   break;
                case "Novice":      lpBasis = 1;  misclabel = "Novice Skill";     if( state.Earthdawn.gED   ) bCount = "S";   break;
                case "Journeyman":  lpBasis = 2;  misclabel = "Journeyman Skill"; break;
                case "Warden":      lpBasis = 3;  misclabel = "Warden Skill";     break;
                case "Master":      lpBasis = 4;  misclabel = "Master Skill";     break;
                default: return;
              } break;
              break;
            case "SKA":
              bCount = "S";
              header = Earthdawn.getAttrBN( cID, sa.slice( 0, -4 ) + "Name", "" );
              misclabel = "Artisan Skill";
              lpBasis = 1;
              break;
            default:
              header = Earthdawn.getAttrBN( cID, sa.slice( 0, -4 ) + "Name", "" );
              log("Error! ED Attribute recordWrap got illegal value of: " + Earthdawn.getParam( sa, 4, "_"));
            } // end case repeating section type
            break;
        case "ReadWrite":
        case "Speak":
          if( !rankFrom )
            return;     // Some ranks are created at record creation. Ignore them first time we see them.
          bCount = "S";
          header = wrapper + " Language";
          misclabel = "Skill";
          miscval = rankFrom + " -> " + rankTo;
          lpBasis = 1;
          break;
      } // end switch wrapper

      let rankMin = Math.min( rankTo, rankFrom),
        rankMax = Math.max( rankTo, rankFrom),
        tdate = Earthdawn.getAttrBN( cID, "record-date-throalic", "" ),     // First look on the current character sheet
        today = new Date();
      if( !tdate ) {
        let party = findObjs({ _type: "character", name: "Party" })[0];
        if( party !== undefined )     // Look for throalic date on the "Party" sheet.
          tdate = Earthdawn.getAttrBN( party.get( "_id" ), "record-date-throalic", "" );
      }
      if( !tdate && state.Earthdawn.gED )
        tdate = "1517-1-1";

      switch( wrapper ) {       // This switch is for catagories that are calculated once, no matter how many ranks have been gained.
        case "SP-Circle":
        case "NAC_Requirements":
          break;
        default:    // All except DSP-Circle
          for( let ind = rankMin; ind < rankMax; ++ind) {     // We want this loop to go once for each rank being done.
            switch( wrapper ) {     // This switch is run once per rank gained.
              case "DSP_Circle":
                if( rankTo > 0 )
                  silver = [ 0, 0, 200, 300, 500, 800, 1000, 1500, 2000, 2500, 3500, 5000, 7500, 10000, 15000, 20000 ][ ind + 1 ]
                if( state.Earthdawn.gED ) sTime = "5 days.";
                break;
              case "Increases":
                let stepValue = Math.floor(( 5 + ind + Earthdawn.getAttrBN( cID, sa.slice( 0, -9 ) + "Race", "None", true )
                        + Earthdawn.getAttrBN( cID, sa.slice( 0, -9 ) + "Orig", "0", true )) / 3);
                silver += stepValue * stepValue * 10;
                iTime += stepValue;
                sTime = iTime + " days.";
                lp += Earthdawn.fibonacci( lpBasis + 1 + ind ) * 100;
                break;
              case "Durability-Rank":
              case "Path-Journeyman":
              case "Path-Master":
              case "Questor":
              case "ReadWrite":
              case "Speak":
              case "Rank":
              case "SP-Rank":
                lp += Earthdawn.fibonacci( lpBasis + 1 + ind ) * 100;
                if( bCount === "S" ) {
                  iTime += ind + 1;
                  if( state.Earthdawn.gED ) {
                    silver += (ind + 1) * (ind + 1) * 10;
                    sTime = iTime + " weeks" + (( wrapper === "Rank") ? "." : " plus a month." );
      } } } } }

      let stem = "&{template:chatrecord} {{header=" + getAttrByName( cID, "charName" ) + ": " + header + "}}"
            + ( rankDiff < 0 ? "{{refund=Refund}}" : "") + (tdate ? "{{throalic=" + tdate + "}}" : "");
      let slink = "!Earthdawn~ charID: " + cID;
      if ( miscval )
        stem += "{{misclabel=" + misclabel + "}}{{miscval=" + miscval + "}}";

      if ( lp || silver ) {
        if( lp )
          stem += "{{lp=" + lp + "}}";
        if ( silver )
          stem += "{{sp=" + silver + "}}";
        slink += "~ Record: ?{Posting Date|" + today.getFullYear() + "-" + (today.getMonth() +1) + "-" + today.getDate()
                  + "}: ?{" + ( state.Earthdawn.gED ? "Throalic Date|" : "Game world Date|" ) + tdate + "}: ";
        slink += lp ? (silver ? "LPSP: " : "LP: ") : "SP: ";
        slink += (lp     ? "?{" + (state.Earthdawn.g1879 ? "Action" : "Legend") + " Points to post|" + lp + "}" : "0") + ": ";
        slink += (silver ? "?{" + (state.Earthdawn.g1879 ? "Money" : "Silver Pieces") + " to post|" + silver + "}" : "0") + ": ";
        slink += ( rankDiff < 0 ? "Refund: " : "Spend: ");
        slink += "?{Reason|" + header + (miscval ? " "+ misclabel + " " + miscval : "") + "}";
      }
      if ( sTime ) {
          stem += "{{time=" + sTime + "}}";
          slink += "?{Time| and " + sTime + "}";
      }

      if(( rankFrom > 3 || rankTo > 3 ) && (wrapper !== "Speak" && wrapper !== "ReadWrite"))
        bCount = undefined;       // We don't need to count anything, because these definitely need accounting for.
//log( stem + slink);
      if( bCount === undefined && state.Earthdawn.sheetVersion <= parseFloat( Earthdawn.getAttrBN( cID, "edition_max", 0 ) )) {
        let ED = new Earthdawn.EDclass();
        ED.chat( stem + "{{button1=[Press here](" + Earthdawn.colonFix( slink ) + ")}}", Earthdawn.whoTo.player | Earthdawn.whoTo.gm | Earthdawn.whoFrom.noArchive, null, cID );
      } else {    // We need to count Talents or Skills to see if these are free during character creation or need to post a cost.
        let send = stem +  "{{button1=[Press here](" + Earthdawn.colonFix( slink ) + ")}}",
          count = Earthdawn.parseInt2( rankTo ),      // Don't get the stored rank of what is being updated, use this one instead.
          maxcount,
          rkey,
          typ,
          single;
        if( bCount === "T" ) {    // Count Talents.   Talents, most matrices, and stuff on spell tab
          maxcount = state.Earthdawn.g1879 ? 11: 8;
          if(state.Earthdawn.gED)
            single = [ "SP-Spellcasting-Rank", "SP-Patterncraft-Rank", "SP-Elementalism-Rank", "SP-Illusionism-Rank",
                  "SP-Nethermancy-Rank", "SP-Shamanism-Rank" ,"SP-Wizardry-Rank", "SP-Power-Rank", "SP-Willforce-Rank" ];
          else
            single = [ "SP-Spellcasting-Rank", "SP-Patterncraft-Rank", "SP-Willforce-Rank" ];
          rkey = [ "_T_Rank", "_SPM_Rank" ];
          typ = [ "_Type", "_Origin" ];
        } else {    // Count skills
          maxcount = state.Earthdawn.g1879 ? 9: 14;
          single = [ "SKL_TotalS-ReadWrite", "SKL_TotalS-Speak", "LS-Speak-Rank", "LS-ReadWrite-Rank" ];  // SKL is old, LS is new.
          rkey = [ "_SK_Rank", "_SKK_Rank", "SKA_Rank" ];
          typ = [ "_Type", , ];
        }

        for ( let item in single ) {
          if( single[ item ] === sa )
            continue;
          let a = Earthdawn.getAttrBN( cID, single[ item ], "0" );
          if( a )
            count += Math.min( Earthdawn.parseInt2( a ), 3);
          if( count > maxcount )    // We already know this is not character creation, so don't need to bother to keep counting.
            break;
        }

        if( count <= maxcount ) {     // If we need to bother to keep counting.
                                      // go through all attributes for this character and look for ones we are interested in
          let attributes = findObjs({ _type: "attribute", _characterid: cID });
          _.each( attributes, function (att) {
            if( att.get("name") === sa )    // If this is the one being changed, skip it.
              return;
            if( !att.get("name").endsWith( "_Rank" ))   // If it does not end in _Rank skip it.
              return;
            let fnd = false;
            for( let i = 0; i < rkey.length; ++i ) {
              if( att.get("name").slice( -rkey[ i ].length ) != rkey[ i ] )
                continue;
              if( typ [ i ] ) {
                let b = Earthdawn.getAttrBN( cID, att.get("name").slice(0, -5 ) + typ[ i ] );
                if( (!b && typ[i] == "_Origin") || b === "Free" || b === "Free-link" || b === "Questor" || b === "Special"
                        || b === "Item" || b === "Item-link" || b === "Dummy" || b === "Pseudo" || b === "Other" )
                  return;
              }
              count += Math.min( att.get( "current" ), 3);
            }
          }); // End for each attribute.
        }

        if( count > maxcount && state.Earthdawn.sheetVersion <= parseFloat( Earthdawn.getAttrBN( cID, "edition_max", 0 ))) {
          let ED = new Earthdawn.EDclass();
          ED.chat( send, Earthdawn.whoTo.player | Earthdawn.whoTo.gm | Earthdawn.whoFrom.noArchive, null, cID );
        }
      } // End count talents and skills to see if they are free or need to be paid for.
    } // End recordWrap()



          // This is functional start of main part of attribute change handling routine.

          // When change is in a repeating section...
    if( sa.startsWith( "repeating_" )) {
      let code = Earthdawn.repeatSection( 3, sa ),
        rowID = Earthdawn.repeatSection( 2, sa );
      if( Earthdawn.getAttrBN( cID, Earthdawn.buildPre( code, rowID ) + "RowID", "") === "" )     // If a repeating_section is changed and no RowID is stored
        Earthdawn.setWW( Earthdawn.buildPre( code, rowID ) + "RowID", rowID, cID );
      if( sa.endsWith( "_Name" ) || (sa.endsWith( "_Rank") )) {   // If a name or rank has changed, make sure we have saved the rowID.
        if( code === "MAN" ) {    // Keep a list of Manuver RowIDs, so we can process though them quicker.
          let t = rowID;
          let attributes = findObjs({ _type: "attribute", _characterid: cID });
          _.each( attributes, function (att) {
            if ( att.get("name").startsWith( "repeating_maneuvers_" ))
              if( att.get("current") ) {
                let a = att.get("name");
                if ( a ) {
                  let r = Earthdawn.repeatSection( 2, a );
                  if( r && t.indexOf( r ) == -1)    // Only if this rowID is not already in t.
                    t += ";" + r;
                }
              }
          }); // End for each attribute.
          let bobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: cID, name: "ManRowIdList" });
          bobj.set( "current", t );
        } // end rep sect MAN

        if(sa.endsWith( "_Rank" ) && !sa.endsWith( "_WPN_Rank" ))   // If a rank has changed, send chat message asking if want to pay LP for it.
          recordWrap( "Rank" );

        if( code === "T" || code === "NAC" || code === "SK" || code === "SKA" || code === "SKK" || code === "SPM" || code === "WPN" )
          Earthdawn.SetDefaultAttribute( cID, Earthdawn.buildPre( code, rowID ) + "CombatSlot", code === "SPM" ? 1 : 0 );
      }   // End it was a name or rank.

          // If Name, or CombatSlot changes, need to mess around with the token actions.
      let t = sa.endsWith( "_CombatSlot") ? 0x01 : 0x00;
      if ((sa.endsWith( "_Name") && (code === "T" || code === "NAC" || code === "SK" || code === "SKA" || code === "SKK" || code === "WPN"))
              || (sa.endsWith( "_Contains") && (code === "SPM" )))
        t = 0x02;
      if ( t ) {                // No matter what, Remove the token action associated with the old name.
        let nmo, nmn,
          pre = Earthdawn.buildPre( code, rowID ),
          symbol = Earthdawn.constant( code );
        if( t > 0x01 ) {    // Name has changed, get the old name.
          nmo = prev ? prev[ "current" ] : undefined;
          nmn = attr.get( "current" );
        } else    // Combat slot has changed, so look up name.
          nmo = nmn = Earthdawn.getAttrBN( cID, pre + ( code === "SPM" ? "Contains" : "Name" ), "" );

        if( nmo ) {
          Earthdawn.abilityRemove( cID, symbol + nmo );
          if( code === "SKA" )
            Earthdawn.abilityRemove( cID, symbol + nmo + "-Cha" );    // Artisan charisma roll.
        }
        let cbs;      // Only create new one if new supposed to.
        if( t === 0x01 )
          cbs = attr.get( "current" ) == "1";
        else
          cbs = Earthdawn.getAttrBN( cID, pre + "CombatSlot", "0" ) == "1";
        if( cbs ) {
          Earthdawn.abilityAdd( cID, symbol + nmn, "!edToken~ %{selected|" + Earthdawn.buildPre( code, rowID ) + "Roll}" );
          if( code === "SKA" )
            Earthdawn.abilityAdd( cID, symbol + nmn + "-Cha", "!edToken~ %{selected|" + Earthdawn.buildPre( code, rowID ) + "Rollc}" );
        }
      } // End Token Action maint.
      else if( sa.endsWith( "_SP_Circle" ))
        recordWrap( "SP_Circle" );
      else if( sa.endsWith( "_NAC_Requirements" ))
        recordWrap( "NAC_Requirements" );
      else if( sa.endsWith( "_DSP_Circle") && sa.startsWith( "repeating_discipline")) {
        switch (Earthdawn.getAttrBN( cID, sa.slice( 0, -11) + "_DSP_Code", "0.0" )) {
          case "81.0": recordWrap( "Path-Journeyman" ); break;
          case "83.0": recordWrap( "Path-Master" );     break;
          case "89.0": recordWrap( "Questor" );         break;
          case "98.5":    break;      // Spirit
          case "99.5":    break;      // Creature
          default:     recordWrap( "DSP_Circle" );
        }
      } else if( sa.endsWith( "_T_Special" )) {
        if( attr.get("current") === "CorruptKarma" )
          Earthdawn.abilityAdd( cID, Earthdawn.constant( "Target" ) + "Activate-Corrupt-Karma", "!edToken~ SetToken: @{target|to have Karma Corrupted|token_id}~ Misc: CorruptKarma: ?{How many karma to corrupt|1}");
        else
          Earthdawn.abilityRemove( cID, Earthdawn.constant( "Target" ) + "Activate-Corrupt-Karma");
      } else if (sa.endsWith( "_textImport" )) {    // This would be a Talent, Knack, Skill, or Spell.
        let ED = new Earthdawn.EDclass();
        let edParse = new ED.ParseObj( ED );
        edParse.charID = cID;
        edParse.textImport( [ "Attribute", code, rowID, attr.get( "current") ]);
        Earthdawn.waitToRemove( cID, sa, 15 );
      }
    } // End start with "repeating"

    else if( sa.startsWith( "Attrib-" ) && sa.endsWith( "-Increases" ))     // Attrib-Dex-Increases   etc.
      recordWrap( "Increases" );
    else if( sa.startsWith( "SP-" ) && sa.endsWith( "-Rank" )) {
      switch( sa ) {
        case "SP-Spellcasting-Rank":
        case "SP-Patterncraft-Rank":
        case "SP-Elementalism-Rank":
        case "SP-Illusionism-Rank":
        case "SP-Nethermancy-Rank":
        case "SP-Shamanism-Rank":
        case "SP-Wizardry-Rank":
        case "SP-Power-Rank":
        case "SP-Willforce-Rank":
          recordWrap( "SP-Rank" );
    } }

    switch( sa ) {
      case "Karma-Roll":      // Changes made at the character sheet, affect all tokens, whether character or mook.  Update all tokens.
      case "KarmaGlobalMode":
      case "Devotion-Roll":
      case "DPGlobalMode":
      case "SP-Willforce-Use":
      case "condition-Health":
      case "combatOption-AggressiveAttack":
      case "combatOption-DefensiveStance":
      case "combatOption-CalledShot":
      case "combatOption-SplitMovement":
      case "combatOption-TailAttack":
      case "combatOption-Reserved":
      case "condition-Blindsided":
      case "condition-Blindsiding":
      case "condition-Cover":
      case "condition-Harried":
      case "condition-KnockedDown":
      case "condition-RangeLong":
      case "condition-ImpairedMovement":
      case "condition-NoShield":
      case "condition-Surprised":
      case "condition-TargetPartialCover":
      case "condition-Darkness":
      case "condition-Flying":
      case "Creature-Ambushing":
      case "Creature-DivingCharging":
      case "Misc-StrainPerTurn":
      case "Adjust-All-Tests-Misc":
      case "Adjust-Attacks-Misc":
      case "Adjust-Damage-Misc":
      case "Adjust-Defenses-Misc":
      case "PD-Buff":
      case "MD-Buff":
      case "SD-Buff":
      case "PA-Buff":
      case "MA-Buff":
      case "Adjust-Effect-Tests-Misc":
      case "Adjust-TN-Misc":
      case "condition-Buffed":    // These are obsolete
      case "condition-Buffed2":
      case "condition-Debuffed":
      case "condition-Debuffed2": {
//log("at status change"); log(attr); log(prev);
        let ED = new Earthdawn.EDclass();
        let edParse = new ED.ParseObj( ED );
        edParse.charID = attr.get( "_characterid" );
        let code, op,
        mia = _.filter( Earthdawn.StatusMarkerCollection, function(mio) { return mio[ "attrib" ] == sa; });   // get an array of menu items with this attribute.
        if( mia === undefined || mia.length === 0) {
          log( "Earthdawn: On Attribute. Warning. '" + sa + "' not be found in StatusMarkerCollection." );
          break;
        } else if( mia.length === 1 ) {     // If there is only one, use it.
          let sm = mia[ 0 ][ "submenu" ];
          code = mia[ 0 ][ "code" ].trim();
          if( sm === undefined )      // There is no submenu, so just set the marker to match the value.  value 0 unset, value 1 set.
            op = (( attr.get( "current" ) == "0" ) ? "u" : "s");
          else {              // There is a submenu that lists all the valid values.
            let i = sm.indexOf( "[" + attr.get("current") + "^" );
            if ( i != -1)       // There is a [n^a] structure.
              op = sm.charAt( sm.indexOf( "^", i) + 1);
            else          // The sub-menu has no [n^a] structure, so just send the value with a z in front of it.
              op = attr.get("current");
          }
          if( "a" <= op && op <= "j" )
            op = (op.charCodeAt( 0 ) - 96).toString();
        } else {              // more than one menu item was found. See if any of them have "shared" set
          op = "u";           // If we don't find a shared match, then we unset.
          code = mia[ 0 ][ "code" ];    // Default so that if we don't find an "shared", it will attempt to unset the first one (which will unset them all).
          let curr = attr.get( "current" );
          for( let i = 0; i < mia.length; ++i )
            if( mia[ i ][ "shared" ] )
              if( mia[ i ][ "shared" ] == curr ) {
                op = "s";
                code = mia[ i ][ "code" ].trim();
              } else if( Earthdawn.parseInt2( curr, true ))   // parseInt2 - Silent
                if( mia[ i ][ "shared" ].slice( 0, 3 ).toLowerCase() === "pos" && Earthdawn.parseInt2( curr ) > 0 ) {
                  op = curr;
                  code = mia[ i ][ "code" ].trim();
                } else if( mia[ i ][ "shared" ].slice( 0, 3 ).toLowerCase() === "neg" && Earthdawn.parseInt2( curr ) < 0) {
                  op = Math.abs( Earthdawn.parseInt2( curr ));      // If curr is negative, then set the badge on the neg token to a positive badge number.
                  code = mia[ i ][ "code" ].trim();
        }       }
        let tkns = findObjs({ _type: "graphic",  _subtype: "token", represents: edParse.charID });
        _.each( tkns, function (TokObj) {
          edParse.tokenInfo = { type: "token", tokenObj: TokObj }
          edParse.MarkerSet( [ "sheetDirect", code, op ] );
        }) // End ForEach Token
      } break; // end update status markers.
      case "NPC": {
        let rtype = (state.Earthdawn.defRolltype & (( attr.get("current") === "2" ) ? 0x02 : ((attr.get("current") === "1") ? 0x01 :  0x04))) ? "/w gm" : " ";
        Earthdawn.setWW( "RollType", rtype, cID );
      } // Falls through to Attack Rank below.
      case "Attack-Rank": {
        if( Earthdawn.getAttrBN( cID, "NPC", "0", true) > 0 && Earthdawn.getAttrBN( cID, "Attack-Rank", 0) != 0)     // NPC or Mook and have a generic attack value.
          Earthdawn.abilityAdd( cID, "Attack", "!edToken~ %{selected|Attack}");
        else    // PC
          Earthdawn.abilityRemove( cID, "Attack" );
      } break;
      case "charName": {
        let c = findObjs({ _type: "character", _id: cID })[0];
        if (c)    c.set( "name", attr.get("current"));
      } break;
      case "Creature-Ambush":
        Earthdawn.abilityRemove( cID, "Ambush");
        if( Earthdawn.parseInt2( attr.get( "current" )))
          Earthdawn.abilityAdd( cID, "Ambush",  "!edToken~ ForEach~ marker: ambushing :t");
        break;
      case "Creature-DiveCharge":
        Earthdawn.abilityRemove( cID, "Charge" );
        if( Earthdawn.parseInt2( attr.get( "current" )))
          Earthdawn.abilityAdd( cID, "Charge",  "!edToken~ ForEach~ marker: divingcharging :t");
        break;
      case "Durability-Rank":
        recordWrap( "Durability-Rank" );
        break;
      case "Hide-Spells-Tab": {     // If we are hiding the spell pages, also remove the spell token actions.
        if( attr.get("current") == "1") {       // Check-box is being turned on
          Earthdawn.abilityRemove( cID, Earthdawn.constant( "Spell" ) + " Grimoire" );
          if (state.Earthdawn.gED)
              Earthdawn.abilityRemove( cID, Earthdawn.constant( "Spell" ) + " Spells" );
        } else {      // Checkbox is being turned off
          Earthdawn.abilityAdd( cID, Earthdawn.constant( "Spell" ) + " Grimoire",  "!edToken~ ChatMenu: Grimoire");
          if (state.Earthdawn.gED)
            Earthdawn.abilityAdd( cID, Earthdawn.constant( "Spell" ) + " Spells",  "!edToken~ ChatMenu: Spells");
        }
      } break;
      case "Karma":
        if ( state.Earthdawn.g1879 ) {
          let karmaNew = Earthdawn.parseInt2( attr.get("current") ) - Earthdawn.parseInt2( prev["current"] );
          if( karmaNew > 0 ) {
            let ED = new Earthdawn.EDclass();
            let edParse = new ED.ParseObj( ED );
            edParse.charID = attr.get( "_characterid" );
            edParse.funcMisc( [ "", "KarmaBuy", karmaNew ] );
        } }
        break;
      case "Questor": {
        if( attr.get( "current" ) === "None" ) {
          Earthdawn.abilityRemove( cID, "DP-Roll" );
          Earthdawn.abilityRemove( cID, "DP-T" );
        } else {
          Earthdawn.abilityAdd( cID, "DP-Roll", "!edToken~ %{selected|DevotionOnly}" );
          Earthdawn.abilityAdd( cID, "DP-T", "!edToken~ !Earthdawn~ ForEach ~ marker: devpnt :t" );
        }
      } break;
      case "SKL_TotalS-Speak":  // Earthdawn sheet old
      case "Speak-Rank":        // 1879 sheet
      case "LS-Speak-Rank":     // Earthdawn sheet new
        recordWrap( "Speak" );
        break;
      case "SKL_TotalS-ReadWrite":  // Earthdawn sheet old
      case "ReadWrite-Rank":        // 1879 sheet
      case "LS-ReadWrite-Rank":     // Earthdawn sheet new
        recordWrap( "ReadWrite" );
        break;
      case "SP-WillforceShow": {
        let ED = new Earthdawn.EDclass();
        let edParse = new ED.ParseObj( ED );
        edParse.charID = attr.get("_characterid");
        edParse.TokenActionToggle("willforce", attr.get("current") === "1" );
      } break;
      case "textImportCreature":  // This works on both old style sheets and the new sheets.
      case "textImportMask":
      case "textImport": {        // This will be Creature or Mask.
        let ED = new Earthdawn.EDclass();
        let edParse = new ED.ParseObj( ED ),
          tsa = sa;
        edParse.charID = attr.get( "_characterid" );
        if( sa === "textImport" )
          tsa = getAttrByName( edParse.charID, "SpecialFunction" ).trim().toLowerCase();
        switch ( tsa ) {
          case "textImportCreature":
          case "creature":
            edParse.textImport( [ "Attribute", "Creature", attr.get( "current" ) ] );
            break;
          case "textImportMask":
          case "maskapply":
            edParse.textImport( [ "Attribute", "Mask", "Add", attr.get( "current" ) ] );
            break;
          default:
            let x = getAttrByName(edParse.charID, "SpecialFunction" );
            if ( x && typeof x === "string" ) x = x.trim();
            else x = "undefined";
            edParse.chat( "Error! could not import. " + x, Earthdawn.whoFrom.apiError );
        }
        Earthdawn.waitToRemove( cID, sa, 15 );
      } // end textImport
    } // End switch sa
  } catch(err) { log( "Earthdawn.attribute() error caught: " + err ); }
}   // End Attribute()



    // Code = SP, SPM, WPN, etc.
    // rowID may EATHER be a rowID, or it may be a whole repeating section attribute name, in which case this routine will extract just the rowID needed.
    // due to a roll20 bug, there are some things that require the code to be lowercase instead of the standard upper. when lowercase is true instead of undefined, that happens.
Earthdawn.buildPre = function ( code, rowID, lowercase ) {
  'use strict';
  try {
    let ret;
    if( !rowID )
      rowID = code;
    if( code.startsWith( "repeating_" ))
      code = Earthdawn.repeatSection( 3, code );
    if( rowID.startsWith( "repeating_" ))
      rowID = Earthdawn.repeatSection( 2, rowID );
    code = code.toUpperCase();
    switch ( code ) {
      case "DSP": ret = "repeating_discipline_" + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "T":   ret = "repeating_talents_"    + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "NAC": ret = "repeating_knacks_"     + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "SKC": ret = "repeating_skills_"     + rowID + "_" + ( lowercase ? "sk" : "SK" ) + "_";          break;  // v2.0 and greater skill artistic charisma code uses all attributes of skill artistic.
      case "SK":  ret = "repeating_skills_"     + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "SKK": ret = "repeating_skillk_"     + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "SKAC":        // V lower than 2.0: skill artistic charisma code uses all attributes of skill artistic.
      case "SKA": ret = "repeating_skilla_"     + rowID + "_SKA_";  break;
      case "SKL": ret = "repeating_skilll_"     + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "SPM": ret = "repeating_matrix_"     + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "SP":  ret = "repeating_spell_"      + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "WPN": ret = "repeating_weapons_"    + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "MNT": ret = "repeating_mount_"      + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "TI":  ret = "repeating_threads_"    + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "INV": ret = "repeating_inventory_"  + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "BL":  ret = "repeating_blood_"      + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "MAN": ret = "repeating_maneuvers_"  + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      default: log( "Earthdawn:buildPre() error. Unknown code: " + code + "   RowID: " + rowID );
    }
    return ret;
  } catch(err) { log( "Earthdawn:buildPre() error caught: " + err ); }
};  // end buildPre



    // Code = SP, SPM, WPN, etc.
Earthdawn.codeToName = function ( code ) {
  'use strict';
  try {
    switch( code ) {
      case "T":     return "Talent";
      case "NAC":   return "Knack";
      case "SK":    return "Skill";
      case "WPN":   return "Weapon";
      case "DSP":   return "Discipline";
      case "TI":    return "Thread Item";
      case "SP":    return "Spell";
      case "SPM":   return "Matrix";
      default: log( "Earthdawn:codeToName() error. Unknown code: " + code );
    }
  } catch(err) { log( "Earthdawn:codeToName() error caught: " + err ); }
};  // end codeToName



      // Chat buttons don't like colons.   Change them to something else. They will be changed back later.
Earthdawn.colonFix = function ( txt ) {
  'use strict';
  return txt.replace( /:/g, Earthdawn.constant( "Colon" ));
}; // end colonFix()



Earthdawn.constant = function( what ) {
  'use strict';
  try {
    let c, s;
    switch (what.toLowerCase() ) {    // For this upper half, we want to return html codes.
          // These will eventually be converted to the real symbols later, but not until after they get  past some chat command steps.
      case "percent":     s = '#37';    break;    // % = 0x25
      case "parenopen":   s = '#40';    break;    // ( = 0x28
      case "parenclose":  s = '#41';    break;    // ) = 0x29
      case "at":          s = '#64';    break;    // @ = 0x40
      case "braceopen":   s = '#123';   break;    // { = 0x7B
      case "pipe":        s = '#124';   break;    // | = 0x7C
      case "braceclose":  s = '#125';   break;    // } = 0x7D
              // For this lower half, we want to return an actual character, which is part of the extended UTF-8 set,
              // and which roll20 one-click install library seems to corrupt, so we can't store it as a literal.
      case "comma":       c = 0x00F1;   break;    // Comma replacement character.  Character name LATIN CAPITAL LETTER N WITH Tilde.
      case "colon":       c = 0x00F2;   break;    // Colon replacement character.  Buttons don't like colons, so anytime we want one in a button, replace it for a while with this.   Character   Character name  LATIN CAPITAL LETTER O WITH GRAVE
      case "t":
      case "talent":      c = 0x0131;   break;    // small i dot-less: &# 305;
      case "nac":
      case "knack":       c = 0x0136;   break;    // K with cedilla:  &# 311;
      case "sk":    case "ska":     case "skk":     case "skl":
      case "skill":       c = 0x015E;   break;    // S with cedilla:  &# 351;
      case "wpn":
      case "weapon":      c = 0x2694;   break;    // Crossed swords:  &# 9876;
      case "sp":    case "spm":
      case "spell":       c = 0x26A1;   break;    // Lightning Bolt or High Voltage: &# 9889;
      case "target":      c = 0x27b4;   break;    // Black-feathered South East Arrow
      case "power":       c = 0x23FB;   break;    // Power symbol
      case undefined:   return "";          // undefined is a legal value that returns an empty string.
      default:
        log( "Earthdawn.constant: Illegal argument '" + what + "'." );
        return;
    }
    return  (c ? String.fromCharCode( c ) : ("&" + s + ";"));
  } catch(err) { log( "Earthdawn:constant( " + what + " ) error caught: " + err ); }
} // end constant()



    // At present this is just for spells, but can be expanded if needed.
Earthdawn.dispToName = function ( disp, shortname ) {
  'use strict';
  try {
    let t;
    switch( disp ) {
      case  "5.3":  t = shortname ? "El" : "Elementalism";  break;
      case  "6.3":  t = shortname ? "Il" : "Illusionism";   break;
      case  "7.3":  t = shortname ? "Ne" : "Nethermancy";   break;
      case "16.3":  t = shortname ? "Wz" : "Wizardry";      break;
      case "22.3":  t = shortname ? "Sh" : "Shamanism";     break;
      case   "81":  t = shortname ? "Oth": "Other";         break;
      default:      t = shortname ? "Pwr": "Power";
    }
    return t;
  } catch(err) { log( "Earthdawn:dispToName() error caught: " + err ); }
};  // end dispToName



Earthdawn.encode = (function(){
  'use strict';
  try {
    let esRE = function ( s ) {
      var escapeForRegexp = /(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g;
      return s.replace(escapeForRegexp,"\\$1");
    }
    let entities = {
//      ' ' : '&'+'nbsp'+';',
      '/n'  : '<' + 'br//' + '>',
      '<'   : '&' + 'lt'   + ';',
      '>'   : '&' + 'gt'   + ';',
      "'"   : '&' + '#39'  + ';',
      '?'   : '&' + '#63'  + ';',
      '@'   : '&' + '#64'  + ';',
      '['   : '&' + '#91'  + ';',
      ']'   : '&' + '#93'  + ';',
      '{'   : '&' + '#123' + ';',
      '|'   : '&' + '#124' + ';',
      '}'   : '&' + '#125' + ';',
      '"'   : '&' + 'quot' + ';'
    },
    re = new RegExp( '(' + _.map( _.keys( entities ), esRE ).join( '|' ) + ')', 'g' );
    return function( s ) {
      return s.replace(re, function( c ){ return entities[c] || c; });
    };
  } catch(err) { log( "Earthdawn:encode() error caught: " + err ); }
  }()); // end encode()



Earthdawn.fibonacci = function(num, memo) {
  'use strict';
  try {
    memo = memo || {};
    if (memo[ num ])
      return memo[ num ];
    if( num <= 1 )
      return 1;
    return memo[ num ] = Earthdawn.fibonacci( num - 1, memo ) + Earthdawn.fibonacci( num - 2, memo);
  } catch(err) { log( "Earthdawn:fibonacci() error caught: " + err ); }
};  // end fibonacci



    // Look for an object. If you can't find one, make one and return that.
Earthdawn.findOrMakeObj = function ( attrs, deflt, maxDeflt ) {
  'use strict';
  try {
    let obj = findObjs( attrs )[ 0 ];
    if( obj === undefined && "_type" in attrs ) {
      let type = attrs[ "_type" ];
      delete attrs[ "_type" ];
      obj = createObj( type, attrs);
      if( obj && deflt !== undefined && deflt !== null )
        Earthdawn.setWithWorker( obj, "current", deflt );
      if( obj && maxDeflt !== undefined && maxDeflt !== null )
        Earthdawn.setWithWorker( obj, "max", maxDeflt );
    }
    return obj;
  } catch(err) { log( "Earthdawn:findOrMakeObj() error caught: " + err ); }
}; // end findOrMakeObj()



        // This routine generates a (hopefully) unique rowID you can use to add a row to a repeating section.
// Very important note.  generate UUID might need to be declared outside of .this and global. I don't know.

Earthdawn.generateRowID = function () {
  "use strict";
  var EarthdawnGenerateUUID = (function() {
    "use strict";
    let a = 0, b = [];
    return function() {
      let c = (new Date()).getTime() + 0, d = c === a;
      a = c;
      for (var e = new Array(8), f = 7; 0 <= f; f--) {
        e[f] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-abcdefghijklmnopqrstuvwxyz".charAt(c % 64);
        c = Math.floor(c / 64);
      }
      c = e.join("");
      if (d) {
        for (f = 11; 0 <= f && 63 === b[f]; f--) {
          b[f] = 0;
        }
        b[f]++;
      } else {
        for (f = 0; 12 > f; f++) {
          b[f] = Math.floor(64 * Math.random());
        }
      }
      for (f = 0; 12 > f; f++){
        c += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
      }
      return c;
    };
  }());

  return EarthdawnGenerateUUID().replace(/_/g, "Z");    // I don't want underscores in my RowID!
};



    // getAttrBN - get attribute by name. If does not exist, return the default value.
    // This is a replacement for the official system function getAttrByName() which had bugs and I think still probably does.
    // Bug in getAttrByName() when dealing with repeating values, returns undefined if the value does not exist rather than the default value.
    // So in cases where the API knows what the true default value is or that we want, use this routine. In cases where the lookup name is variable and you don't know what the default value should be, then using getAttryByName is just as good and if they fix the bug, better.
Earthdawn.getAttrBN = function ( cID, nm, dflt, toInt ) {
  'use strict';
  try {
    let ret;
    if( !cID ) {
      log( "Invalid character_id '" + cID + "' for getAttrBN()   name: " + nm + "   default: " + dflt)
      ret = dflt;
    } else {
      if( !nm ) {
        log( "Invalid attribute '" + nm + "' for getAttrBN().   dflt: '" + dflt + "'    cID: " + cID )
        ret = dflt;
      } else {
        if( nm === "charName" )     // due to charName being a special case that is not a true attribute, we need special handling.
          ret = getAttrByName( cID, "charName" );
        else {
          let mx = nm.endsWith( "_max" );
          let attribBN = findObjs({ _type: "attribute", _characterid: cID,  name: (mx ? nm.slice( 0, -4) : nm) });
          ret = ((attribBN === undefined) || (attribBN.length == 0)) ? dflt : attribBN[ 0 ].get( mx ? "max" : "current");
    } } }
    return toInt ? Earthdawn.parseInt2( ret ) : ret;
  } catch(err) {
    log( "Earthdawn:getAttrBN() error caught: " + err );
    log( "name: " + nm + "   default: " + dflt + "   cID: " + cID);
  }
}; // end getAttrBN()



Earthdawn.getIcon = function ( mi ) {
  return mi[ "customTag" ] ? mi[ "customTag" ] : mi[ "icon" ]
}; // end getIcon()



Earthdawn.getParam = function ( str, num, delim ) {
  'use strict';
  try {
    if( typeof str !== 'string' ) {
      log("Error getParam argument not string.");
      log( str );
      log( num);
      log( delim);
      return;
    }
    str = str.trim();
    if( !delim )
      delim = ",";
    let found, count = 0, j, i = -1;
    do {
      j = i +1;
      i = str.indexOf( delim, j);
    } while ( (++count < num) && (i !== -1) );
    if( count === num) {
      if( i < 0)
        i = str.length;
      found = str.slice( j, i).trim();
    }
    return found;
  } catch(err) { log( "Earthdawn:getParam() error caught: " + err ); }
}; // end getParam()



      // Earthdawn.getStatusMarkerCollection()
      // Get a collection of objects that fully describe status markers available.   Used by Markerset and other routines.
      // Note: submenu is a bit of a bastardization of the real submenu and the codes used on the character sheets.
      //      In submenu, [x,y] is as follows: x is code for this option on the character sheet ie: 2 for partial. y is coded for menu.
      //      In submenu, [x,y] ether [x,] or [,y] will usually be removed at start of processing, leaving only x or y, not both.
      //
      // Icon is the icon name in the roll20 default token set. customIcon is the name in the Earthdawn Fasa Official custom icon set (available for free in  the marketplace).
      // A startup routine looks for the customIcons, and if finds it, loads the customTag (which is runtime dependent).
      //
      // The rules for more than one icon sharing an attribute are as follows: Each code must be unique. There should not be a submenu.
      // There should be an element "shared", which holds ether the work Negative (digits 1 to 9 representing -1 to -9), Positive (digits 1 to 9),
      // or the one value of attrib that the icon will be displayed (checked value).
      // For example when the karmaauto icon is set, KarmaGlobalMode gets set to "x". when karmaask, it is set to "?".
Earthdawn.getStatusMarkerCollection = function()  {
  'use strict';
  try {
// These are the default token set, with the ones we are not using marked with xx.
// xx "red", xx "blue", xx "green", xx "brown", "purple", xx "pink", xx "yellow", "dead",
// "skull", "sleepy", "half-heart", "half-haze", "interdiction", "snail", "lightning-helix", xx "spanner",
// xx "chained-heart", "chemical-bolt", xx "death-zone", "drink-me", xx "edge-crack", xx "ninja-mask", "stopwatch", xx "fishing-net",
// "overdrive", xx "strong", xx "fist", xx "padlock", "three-leaves", "fluffy-wing", "pummeled", "tread",
// "arrowed", xx "aura", "back-pain",  xx "black-flag", "bleeding-eye", xx "bolt-shield", "broken-heart", xx "cobweb",
// "broken-shield", xx "flying-flag",  xx "radioactive", xx "trophy", xx "broken-skull", xx "frozen-orb", "rolling-bomb", "white-tower",
// xx "grab", xx "screaming", "grenade", "sentry-gun", "all-for-one", "angel-outfit", "archery-target"
    let smc = [];     // IMPORTAINT NOTE!!! if you make changes that affect any attrib, also edit attribute section of the on ready event near the bottom of this file and the chat menu section dealing with status's.
    if( state.Earthdawn.sheetVersion < 1.8 ) {
      smc.push({ code: "karma", prompt: "Karma", attrib: "Karma-Roll", icon: "lightning-helix", submenu: "?{Karma|None,[0^u]|One,[1^s]|Two,[2^b]|Three,[3^c]}" });
      if( state.Earthdawn.gED )
        smc.push({ code: "devpnt", prompt: "Dev Pnts", attrib: "Devotion-Roll", icon: "angel-outfit", submenu: "?{Dev Pnts|None,[0^u]|One,[1^s]|Two,[2^b]|Three,[3^c]}" });
      smc.push({ code: "health", prompt: "Health", attrib: "condition-Health", icon: "dead", submenu: "?{Health|OK,[0^u]|Unconscious,[5^s]|Dead,[-5^a]}" });
      smc.push({ code: "willforce", prompt: "WillForce", attrib: "SP-Willforce-Use", icon: "chemical-bolt" });
    } else {
      smc.push({ code: "karmaauto", prompt: "Karma Auto",  attrib: "KarmaGlobalMode", shared: "x", icon: "lightning-helix", customIcon: "001-Karma-On",  customTag: "" });
      smc.push({ code: "karmaask", prompt: "Karma Ask",  attrib: "KarmaGlobalMode", shared: "?", icon: "drink-me", customIcon: "002-Karma-Ask", customTag: "" });
      if( state.Earthdawn.gED ) {
        smc.push({ code: "devpntauto", prompt: "DP Auto", attrib: "DPGlobalMode", shared: "x", icon: "angel-outfit", customIcon: "003-Devotion-On",  customTag: "" });
        smc.push({ code: "devpntask",  prompt: "DP Ask", attrib: "DPGlobalMode", shared: "?", icon: "broken-heart", customIcon: "004-Devotion-Ask", customTag: "" });
      }
      smc.push({ code: "healthunconscious", prompt: "Unconscious", attrib: "condition-Health", shared: "5", icon: "pummeled", customIcon: "005-Unconscious", customTag: "" });
      smc.push({ code: "healthdead", prompt: "Dead", attrib: "condition-Health", shared: "-5", icon: "dead", customIcon: "006-Dead", customTag: "" });
    }
    smc.push({ code: "strain", prompt: "Strain per turn", icon: "grenade", attrib: "Misc-StrainPerTurn", customIcon: "007-Strain", customTag: "",
            submenu: "?{Strain per turn|0,[0^u]|1,[1^a]|2,[2^b]|3,[3^c]|Increase,++|Decrease,--}"});
// 008-Pink, then line 2 of token markers (there are 8 per line).
              // Combat options: - Not shown - Attack to knockdown, Attack to Stun, Jump-up, setting against a charge, shatter shield.
    smc.push({ code: "aggressive", prompt: "Aggressive Attack", attrib: "combatOption-AggressiveAttack", icon: "sentry-gun", customIcon: "021-Agressive-Attack", customTag: ""});
    smc.push({ code: "defensive", prompt: "Defensive Stance", attrib: "combatOption-DefensiveStance", icon: "white-tower", customIcon: "022-Defensive-Stance", customTag: ""});
    smc.push({ code: "called", prompt: "Called Shot", attrib: "combatOption-CalledShot", icon: "archery-target", customIcon: "023-Called-Shot", customTag: "" });
    smc.push({ code: "split", prompt: "Split Movement", attrib: "combatOption-SplitMovement", icon: "tread", customIcon: "024-Split-Movement", customTag: ""});
    smc.push({ code: "reserved", prompt: "Reserved Action", attrib: "combatOption-Reserved", icon: "stopwatch", customIcon: "025-ReservedAction", customTag: ""});
    smc.push({ code: "tail", prompt: "Tail Attack", attrib: "combatOption-TailAttack", icon: "purple", customIcon: "026-Tail-Attack", customTag: ""});
    smc.push({ code: "blindsiding", prompt: "Blindsiding", attrib: "condition-Blindsiding", icon: "interdiction", customIcon: "027-Blindsiding", customTag: ""});
    smc.push({ code: "targetpartialcover", prompt: "Tgt Partial Cover", attrib: "condition-TargetPartialCover", icon: "half-heart", customIcon: "028-Cover-Target", customTag: ""});
// third line
    smc.push({ code: "knocked", prompt: "Knocked Down", attrib: "condition-KnockedDown", icon: "back-pain", customIcon: "101-KnockedDown", customTag: ""});
    smc.push({ code: "harried", prompt: "Harried", attrib: "condition-Harried", icon: "all-for-one", customIcon: "102-Harried", customTag: "",
          submenu: "?{Harried|Not Harried,[0^u]|Harried,[2^s]|Overwhelmed,[3^c]|Overwhelmed II,[4^d]|Overwhelmed III,[5^e]|Increase,++|Decrease,--}"});
    smc.push({ code: "blindsided", prompt: "Blindsided", attrib: "condition-Blindsided", icon: "arrowed", customIcon: "103-Blindsided", customTag: ""});
    smc.push({ code: "surprised", prompt: "Surprised", attrib: "condition-Surprised", icon: "sleepy", customIcon: "104-Surprised", customTag: ""});
    smc.push({ code: "noshield", prompt: "NoShield", attrib: "condition-NoShield", icon: "broken-shield", customIcon: "105-NoShield", customTag: ""});
    smc.push({ code: "move", prompt: "Movement Impaired", attrib: "condition-ImpairedMovement", icon: "snail", customIcon: "106-Move-Impaired", customTag: "",
          submenu: "?{Impaired Movement|None,[0^u]|Partial,[2^b]|Full,[4^d]}"});
// cdd todo check flying.
    smc.push({ code: "flying", prompt: "Flying", icon: "fluffy-wing", attrib: "condition-Flying", customIcon: "107-Flying", customTag: "",
          submenu: "?{Flying|Not Flying,[-1^u]|Flying,[0^s]|Flying altitude 1,[1^a]|Flying altitude 2,[2^b]|Flying altitude 3,[3^c]|Flying altitude 4,[4^d]|Flying altitude 5,[5^e]|Flying altitude 6,[6^f]|Flying altitude 7,[7^g]|Flying altitude 8,[8^h]|Flying altitude 9,[9^i]|Increase,++|Decrease,--}"});
//    smc.push({ code: "flying", prompt: "Flying", icon: "fluffy-wing", attrib: "condition-Flying", submenu: "?{Amount|0}", customIcon: "107-Flying", customTag: "" });
    smc.push({ code: "range", prompt: "Long Range", attrib: "condition-RangeLong", icon: "half-haze", customIcon: "108-Range-Long", customTag: ""});
// fourth line
    smc.push({ code: "cover", prompt: "Cover", attrib: "condition-Cover", icon: "three-leaves", customIcon: "109-Cover-Partial", customTag: "",
          submenu: "?{Cover|None,[0^u]|Partial,[2^b]|Full,[99^i]}"});
    smc.push({ code: "vision", prompt: "Vision Impaired", attrib: "condition-Darkness", icon: "bleeding-eye", customIcon: "110-Darkness-Partial", customTag: "",
          submenu: "?{Impaired Vision|None,[0^u]|Partial,[2^b]|Full,[4^d]}"});

    smc.push({ code: "divingcharging", prompt: "Diving/Charging", attrib: "Creature-DivingCharging", icon: "rolling-bomb", customIcon: "301-DivingCharging", customTag: ""});
    smc.push({ code: "ambushing", prompt: "Ambushing", attrib: "Creature-Ambushing", icon: "overdrive", customIcon: "302-Ambushing", customTag: "" });
// 400-Black, 401-Bordeaux, 402-Green, 403- Greenish, then fifth line.
    smc.push({ code: "alltestsdebuff", prompt: "All tests debuff", icon: "", attrib: "Adjust-All-Tests-Misc", shared: "Negative",
            submenu: "?{Amount|0}", customIcon: "401-Action-Debuff", customTag: "" });
    smc.push({ code: "alltestsbuff", prompt: "All tests buff", icon: "", attrib: "Adjust-All-Tests-Misc", shared: "Positive",
            submenu: "?{Amount|0}", customIcon: "402-Action-Buff", customTag: "" });
    smc.push({ code: "attacksdebuff", prompt: "Attacks debuff", icon: "", attrib: "Adjust-Attacks-Misc", shared: "Negative",
            submenu: "?{Amount|0}", customIcon: "403-Attack-Debuff", customTag: "" });
    smc.push({ code: "attacksbuff", prompt: "Attacks buff", icon: "", attrib: "Adjust-Attacks-Misc", shared: "Positive",
            submenu: "?{Amount|0}", customIcon: "404-Attack-Buff", customTag: "" });
    smc.push({ code: "damagedebuff", prompt: "Damage debuff", icon: "", attrib: "Adjust-Damage-Misc", shared: "Negative",
            submenu: "?{Amount|0}", customIcon: "405-Damage-Debuff", customTag: "" });
    smc.push({ code: "damagebuff", prompt: "Damage buff", icon: "", attrib: "Adjust-Damage-Misc", shared: "Positive",
            submenu: "?{Amount|0}", customIcon: "406-Damage-Buff", customTag: "" });
    smc.push({ code: "defensesdebuff", prompt: "Defenses debuff", icon: "", attrib: "Adjust-Defenses-Misc", shared: "Negative",
            submenu: "?{Amount|0}", customIcon: "407-Defenses-Debuff", customTag: "" });
    smc.push({ code: "defensesbuff", prompt: "Defenses buff", icon: "", attrib: "Adjust-Defenses-Misc", shared: "Positive",
            submenu: "?{Amount|0}", customIcon: "408-Defenses-Buff", customTag: "" });
// Sixth line
    smc.push({ code: "pddebuff", prompt: "PD debuff", icon: "", attrib: "PD-Buff", shared: "Negative",
            submenu: "?{Amount|0}", customIcon: "409-PD-Debuff", customTag: "" });
    smc.push({ code: "pdbuff", prompt: "PD buff", icon: "", attrib: "PD-Buff", shared: "Positive",
            submenu: "?{Amount|0}", customIcon: "410-PD-Buff", customTag: "" });
    smc.push({ code: "mddebuff", prompt: "MD debuff", icon: "", attrib: "MD-Buff", shared: "Negative",
            submenu: "?{Amount|0}", customIcon: "411-MD-Debuff", customTag: "" });
    smc.push({ code: "mdbuff", prompt: "MD buff", icon: "", attrib: "MD-Buff", shared: "Positive",
            submenu: "?{Amount|0}", customIcon: "412-MD-Buff", customTag: "" });
    smc.push({ code: "sddebuff", prompt: "SD debuff", icon: "", attrib: "SD-Buff", shared: "Negative",
            submenu: "?{Amount|0}", customIcon: "413-SD-Debuff", customTag: "" });
    smc.push({ code: "sdbuff", prompt: "SD buff", icon: "", attrib: "SD-Buff", shared: "Positive",
            submenu: "?{Amount|0}", customIcon: "414-SD-Buff", customTag: "" });
    smc.push({ code: "padebuff", prompt: "PA debuff", icon: "", attrib: "PA-Buff", shared: "Negative",
            submenu: "?{Amount|0}", customIcon: "415-PA-Debuff", customTag: "" });
    smc.push({ code: "pabuff", prompt: "PA buff", icon: "", attrib: "PA-Buff", shared: "Positive",
            submenu: "?{Amount|0}", customIcon: "416-PA-Buff", customTag: "" });
// Seventh line
    smc.push({ code: "madebuff", prompt: "MA debuff", icon: "", attrib: "MA-Buff", shared: "Negative",
            submenu: "?{Amount|0}", customIcon: "417-MA-Debuff", customTag: "" });
    smc.push({ code: "mabuff", prompt: "MA buff", icon: "", attrib: "MA-Buff", shared: "Positive",
            submenu: "?{Amount|0}", customIcon: "418-MA-Buff", customTag: "" });
    smc.push({ code: "effectsdebuff", prompt: "Effects debuff", icon: "", attrib: "Adjust-Effect-Tests-Misc", shared: "Negative",
            submenu: "?{Amount|0}", customIcon: "419-Effect-Debuff", customTag: "" });
    smc.push({ code: "effectsbuff", prompt: "Effects buff", icon: "", attrib: "Adjust-Effect-Tests-Misc", shared: "Positive",
            submenu: "?{Amount|0}", customIcon: "420-Effect-Buff", customTag: "" });
    smc.push({ code: "tndebuff", prompt: "TN debuff", icon: "", attrib: "Adjust-TN-Misc", shared: "Negative",
            submenu: "?{Amount|0}", customIcon: "421-TN-Debuff", customTag: "" });
    smc.push({ code: "tnbuff", prompt: "TN buff", icon: "", attrib: "Adjust-TN-Misc", shared: "Positive",
            submenu: "?{Amount|0}", customIcon: "422-TN-Buff", customTag: "" });
// 600-Kakadoi, 601-Superblue. then eighth line.    Note that the first three are like the colors, the sheet does not do anything with t hem.
//      smc.push({ code: "entangled", prompt: "Entangled/Grappled", attrib: "condition-Entangled-Grappled", icon: "fishing-net", customIcon: "601-Entangled-Grappled", customTag: ""});
//      smc.push({ code: "poison", prompt: "Poisoned", icon: "death-zone", attrib: "condition-Poisoned", customIcon: "602-Poisoned", customTag: ""});
//      smc.push({ code: "stealth", prompt: "Stealthy", icon: "ninja-mask", attrib: "condition-Stealthy", customIcon: "603-Stealthy", customTag: ""});
// 700-Grey, 700-Skyblue, 700-Yellowish, end of list.

          // Go through each item in StatusMarkerCollection  and see if it has a customIcon (some don't).
          // If it does, see if this particual campain has the custum icons loaded, and if so, record the tag. Tags variy from campaign to campaign.
    let customcollection = JSON.parse(Campaign().get( "token_markers" )),
      txt, found = 0;
    for(let j = 0; j < smc.length; j++) {
      let sm = smc[ j ];
      if( "customIcon" in sm)
        for(let i = 0;  i < customcollection.length; i++)
          if( sm.customIcon.toLowerCase() === customcollection[ i ].name.toLowerCase()) {
            smc[ j ].customTag = customcollection[ i ].tag
            ++found;
          }
    };
    Earthdawn.StatusMarkerCollection = smc;
    if( customcollection.lenth < 12 )
      txt = "Warning! There are only " + customcollection.lenth + " token markers loaded.";
    else if( found < 12 )
      txt = "The Earthdawn Token Marker set has not been installed. Found only " + found + " of " + smc.length + " custom markers from the set.";
    return txt;
  } catch(err) { log( "Earthdawn.getStatusMarkerCollection() error caught: " + err ); }
} // End ParseObj.getStatusMarkerCollection()



Earthdawn.newBody = function ( sect ) {
  let body = sect.append( ".body", "", {
    class:"sheet-rolltemplate-body"
  });
  body.setCss({
    odd: { "background": "#white" },
    even: { "background": "#E9E9E9" }
  });
  return body;
};

Earthdawn.newSect = function () {
  return new HtmlBuilder( "", "", {
    class:"sheet-rolltemplate-sect"
})};



      // makeButton()
      // Make a self contained html button that can be sent to the chat window.
      // noColonFix true: don't do colonFix or encode, false: do colonFix and Encode it.
Earthdawn.makeButton = function( buttonDisplayTxt, linkText, tipText, buttonColor, txtColor, noColonFix )  {
  'use strict';
  try {
    return new HtmlBuilder( "a", buttonDisplayTxt, Object.assign( {}, {
      href: noColonFix ? linkText : Earthdawn.encode( Earthdawn.colonFix( linkText )),
      class: "sheet-chatbutton" },
      ( buttonColor || txtColor ) ? {       // Optional style section if have a color
        style: Object.assign( buttonColor ? { "background-color": buttonColor } : {},
          txtColor ? { "color": txtColor } : {} )} : {},
      tipText ? {     // Optional tipText section
//            class: "showtip tipsy",   // removing this gives us black on white long tool tips rather than the white on black tooltips that have a display bug.
        title: Earthdawn.encode( Earthdawn.encode( tipText )) } : {}
      )) + " ";
  } catch(err) { log( "Earthdawn.makeButton error caught: " + err ); }
} // end makeButton()



    // This function "protects" against NaN parseInts (when input is not a number) by default to 0 instead of NaN
Earthdawn.parseInt2 = function ( i, silent ){
  try{
    if( isNaN( i )) {
      if( !silent)
        log("Earthdawn, parseInt2 was passed not a number " + i );
      return 0;
    } else
      return (parseInt( i ) || 0);
  } catch(err) {
    log( "Earthdawn.parseInt2() error caught: " + err );
    return 0;
  }
} //end parseInt2



      // pseudoMsg
      // We don't seem to have a valid .msg (because we are running from (on ready) or APIflag, but we need one.
      // So fake one.
Earthdawn.pseudoMsg = function( pclass ) {
  'use strict';
  try {
    if( pclass.msg === undefined ) {    // fake up a playerID.
      let players = findObjs({ _type: "player", _online: true });   // lets just find the first gm that is online.
      let found = _.find( players, function( plyr ) { return playerIsGM( plyr.get( "_id" ))});
      if( !found ) {
        players = findObjs({ _type: "player" });        // There are no GMs online, so lets just find a GM that is offline.
        found = _.find( players, function( plyr ) { return playerIsGM( plyr.get( "_id" ))});
        if( !found && players && players.length > 0 )
          found = players[ 0 ];
      }
      if( found ) {
        pclass.msg = {};
        pclass.msg.playerid = found.get( "_id" );
        pclass.msg.content = "";
        pclass.msg.type = "api";
        pclass.msg.who = found.get( "_displayname" );
    } }
  } catch(err) { log( "Earthdawn.pseudoMsg error caught: " + err ); }
} // End Earthdawn.pseudoMsg()



    // This routine returns just one section of a repeating section name.
    // section: 0 = repeating. 1 = talents, knacks, weapons, etc. 2 = rowID, 3 = code (SP, WPN, etc.), 4 is the attribute name.
    // Note that this assumes that the attribute name does NOT contain an underscore, but allows for the rowID to contain one.
Earthdawn.repeatSection = function ( section, str ) {
  'use strict';
  try {
    if( !section ) {
      log( "Earthdawn:repeatSection() error, invalid section: " + section + " str : " + str );
      return;
    }
    if( !str ) {
      log( "Earthdawn:repeatSection() error, invalid str: " + str + " section : " + section );
      return;
    }
    let x = str.split("_");
    if( x[ x.length -1 ] === "max" ) {
      x.pop();
      x[ x.length -1] += "_max";
    }
    if( section < 2 )
      return x[ section ];
    else if (section == 3 )
      return x[ x.length -2 ].toUpperCase();
    else if (section == 4 )
      return x[ x.length -1 ];
    else {      // There is a possibility that the RowID might contain an underscore. So this is if they want section 2.
      x.pop();
      x.pop();
      x.shift();
      x.shift();
      return x.join("_");
    }
      } catch(err) {
          log( "Earthdawn:repeatSection() error caught: " + err );
  }
};  // end repeatSection



        // This is a wrapper for the attribute .set() function, that checks to make sure val is not undefined.
        // in the basic .set() function, If val is undefined it errors out the entire API, requiring a restart.
        // Worse, the error preempts logging that should have happened and the error message gives you no clue as to where your code errored out.
        // This checks for undefined, writes an error message, and substitutes a default value.
        //
        // Rats. Can't test for NaN here, because use same routine for string and numbers. But NaN fails as well.
Earthdawn.set = function( obj, att, val, dflt )  {
  'use strict';
  try {
// log( "set   " + obj.get("name") + "    val " + val);
    if(( val === undefined && dflt != undefined ) || (val !== val)) {   // val !== val is the only way to test for it equaling NaN. Can't use isNan() because many values are not supposed to be numbers. But we do want to test for val having been set to NaN.
      log( "Warning!!! Earthdawn:set()   Attempting to set '" + att + "' to " + val + " setting to '" + dflt + "' instead. Object is ...");
      log( obj );
      obj.set( att, (dflt === undefined) ? "" : dflt );
    } else
      obj.set( att, (val === undefined) ? "" : val );
  } catch(err) { log( "Earthdawn:set() error caught: " + err ); }
} // end of set()

Earthdawn.setWithWorker = function( obj, att, val, dflt )  {
  'use strict';
  try {
// log( "setww " + obj.get("name") + "    val " + val);
    if(( val === undefined && dflt != undefined ) || (val !== val)) {   // val !== val is the only way to test for it equaling NaN. Can't use isNan() because many values are not supposed to be numbers. But we do want to test for val having been set to NaN.
      log( "Warning!!! Earthdawn:setWithWorker()   Attempting to set '" + att + "' to " + val + " setting to '" + dflt + "' instead. Object is ...");
      log( obj );
      obj.setWithWorker( att, (dflt === undefined) ? "" : dflt );
    } else
      obj.setWithWorker( att, (val === undefined) ? "" : val );
  } catch(err) { log( "Earthdawn:setWithWorker() error caught: " + err ); }
} // end of setWithWorker()

      // setWW      (Note that there is also a ParseObj version that has access to this.charID, which this version does not)
      // helper routine that sets a value into an attribute and nothing else.
      // is part of parseObj so that have access to parseObj.charID
Earthdawn.setWW = function( attName, val, cID, dflt ) {
  'use strict';
  try {
    if( !cID ) {
      log( "Eearthdawn.SetWW() Error, no cID: " + attName + " : " + val );
    } else {
      let aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: cID, name: attName });
      Earthdawn.setWithWorker( aobj, "current", val, dflt );
    }
  } catch(err) { log( "Earthdawn.SetWW() error caught: " + err ); }
} // End Earthdawn.SetWW()


                  // Look to see if an attribute exists for a certain character sheet. If not - create it with a default attribute.
Earthdawn.SetDefaultAttribute = function( cID, attr, dflt, maxdflt )  {
  'use strict';
  try {
    let aobj = findObjs({ _type: 'attribute', _characterid: cID, name: attr })[0];
    if ( aobj === undefined ) {     // If we actually found an existing attirbute, then do nothing, as this routine only does defaults.
      aobj = createObj("attribute", { name: attr, characterid: cID });
      if( dflt === null )
        dflt = getAttrByName( cID, attr, "current");    // This looks weird, but what it is doing is getting any default defined in the html.
      if( maxdflt === null )
        maxdflt = getAttrByName( cID, attr, "max");
      if ( dflt != undefined && isNaN( parseInt(aobj.get("current"))) )
        Earthdawn.setWithWorker( aobj, "current", dflt );
      if ( maxdflt != undefined && isNaN( parseInt(aobj.get("max"))) )
        Earthdawn.setWithWorker( aobj, "max", maxdflt );
    }
  } catch(err) { log( "Earthdawn:SetDefaultAttribute() error caught: " + err ); }
} // end of SetDefaultAttribute()



    // return a self contained html fragment that has a tooltip.
Earthdawn.texttip = function ( txt, tip ) {
      'use strict';
      try {
    return new HtmlBuilder( "span", txt, {
      style: { "border": "solid 1px yellow" },
//        class: "showtip tipsy",     // removing this gives us black on white long tool tips rather than the white on black tooltips that have a display bug.
      title: Earthdawn.encode( Earthdawn.encode( tip )) })
  } catch(err) { log( "Earthdawn:texttip() error caught: " + err ); }
}; // end texttip()



    // Given a tokenID, return the represented charID.
Earthdawn.tokToChar = function ( tokenID ) {
  'use strict';
  try {
    if ( tokenID ) {
      let TokObj = getObj("graphic", tokenID);
      if( TokObj !== undefined ) {
        let targetChar = TokObj.get("represents");
        if( targetChar )
          return targetChar;
    } }
  } catch(err) { log( "Earthdawn:tokToChar() error caught: " + err ); }
}; // end tokToChar()



    // The import routines want to get rid of values shortly after they appear, and in fact sometimes before the database has been updated.
    // Loop until the object appears, and then remove it.
Earthdawn.waitToRemove = function ( cID, nm, timelimit ) {
  'use strict';
  try {
    function waitForIt( n ) {
      'use strict';
      setTimeout( function() {
        if( n < 1 ) {
          let a = findObjs({ _type: "attribute", _characterid: cID,  name: nm });
          if( a )
            while ( a.length > 0 )
              a.pop().remove();
        } else if ( findObjs({ _type: "attribute", _characterid: cID,  name: nm }))
          waitForIt( 0 );
        else
          waitForIt( n-1);
      }, 1000); }

    if( !timelimit ) timelimit = 15;
    waitForIt( timelimit );
  } catch(err) { log( "Earthdawn:waitToRemove() error caught: " + err ); }
}; // end waitToRemove()




            // Define the Earthdawn Class   EDclass
Earthdawn.EDclass = function( origMsg ) {
  'use strict';

          // define any class variables
  this.msg = origMsg;
  this.msgArray = [];           // msg parsed by tilde ~ characters.  msgArray[0] will hold !Earthdawn which we have already tested for and can ignore.
  this.countSuccess = 0;        // If there is a target number, this is a count of how many attacks, or attacks on separate targets had at least one success.
  this.countFail = 0;
  this.rollCount = 0;           // This is a count of how many async rolls are still outstanding.
  // Note: This thread CONTINUES to execute at the bottom of object declaration - after all functions are defined.



      // Log the ready event.
  this.Ready = function () {
    'use strict';   // Check if the namespaced property exists, creating it if it doesn't
    if( state.Earthdawn                 === undefined )   state.Earthdawn = {};
    if( state.Earthdawn.game            === undefined )   state.Earthdawn.game            = "ED";
    if( state.Earthdawn.gED             === undefined )   state.Earthdawn.gED             = true;
    if( state.Earthdawn.g1879           === undefined )   state.Earthdawn.g1879           = false;
    if( state.Earthdawn.edition         === undefined )   state.Earthdawn.edition         = 4;
//    if( state.Earthdawn.effectIsAction  === undefined )   state.Earthdawn.effectIsAction  = false;
//    if( state.Earthdawn.karmaRitual     === undefined )   state.Earthdawn.karmaRitual     = "-1";
    if( state.Earthdawn.logCommandline  === undefined )   state.Earthdawn.logCommandline  = false;
    if( state.Earthdawn.logStartup      === undefined )   state.Earthdawn.logStartup      = true;
    if( state.Earthdawn.defRolltype     === undefined )   state.Earthdawn.defRolltype     = 0x03;     // Bitfield set for who is GM only. NPC and Mook gm only, PC public;
    if( state.Earthdawn.tokenLinkNPC    === undefined )   state.Earthdawn.tokenLinkNPC    = Earthdawn.tokenLinkNPC.showplayers_name | Earthdawn.tokenLinkNPC.showplayers_wounds;    // Bitfield controls how NPCs are linked.;
    if( state.Earthdawn.style           === undefined )   state.Earthdawn.style           = Earthdawn.style.VagueRoll;
          // Everything works best if API and Sheet version are compatable, but some effort is made to let them limp along on different versions.
    if( state.Earthdawn.version         === undefined )   state.Earthdawn.version         = Earthdawn.Version;      // Note: This is the API (this file) version. Earthdawn.Version is hardcoded constant. state.Earthdawn.version is record of last version run with.
    if( state.Earthdawn.sheetVersion    === undefined )   state.Earthdawn.sheetVersion    = 0.000;    // This is the Sheet (html file) version that we think we are dealing with.

          // Check to see if the current version of code is the same number as the previous version of code.
          // This will update all character sheets when a new API is loaded.
          // If a new character sheet is loaded without a new API version, each will be updated individually when the sheet is first opened.
    if( state.Earthdawn.version != Earthdawn.Version ) {        // This code will be run ONCE when a new API version is loaded. However the update routines below will be run once for each character.


            // It is possible that some update routines might take a lot of time to update, depending upon what updates are needed.
            // If a campaign has many characters, the servers might timeout with an infinite loop message before compleating (there is no infinite loop, just a loop that takes too much time).
            // Therefore use setTimeout to call each character one at a time, this lets the system know that progress is being made between characters.
      function vUpdate( ed, routine, version) {
        'use strict';
        let count = 0,
          charQueue = findObjs({ _type: "character" });      // create the queue we'll be processing.
        ed.chat( "Updating all characters (" + charQueue.length + ") to new character sheet version " + version, Earthdawn.whoFrom.apiWarning );

        const charBurndown = () => {				// create the function that will process the next element of the queue
          if( charQueue.length ) {
            let c = charQueue.shift();
            let attCount = routine( c.get( "_id" ), ed, count++ );
            ed.errorLog( "Updated " + attCount + " things for " + c.get( "name" ));
            setTimeout( charBurndown, 0);   // Do the next character
          } else		// Have finished the last attribute.
            ed.chat( count + " character sheets updated.", Earthdawn.whoFrom.apiWarning );
        };
        charBurndown();   // start the execution by doing the first element. Each element will call the next.
      } // end vUpdate


      if( state.Earthdawn.version < 1.001)                // Note, this tests JS version number, not sheet version number.
        vUpdate( this, this.updateVersion1p001, 1.001 );
      if( state.Earthdawn.version < 1.0021)
        vUpdate( this, this.updateVersion1p0021, 1.0021 );
      if( state.Earthdawn.version < 1.0022)
        vUpdate( this, this.updateVersion1p0022, 1.0022 );
      if( state.Earthdawn.version < 1.0023)
        vUpdate( this, this.updateVersion1p0023, 1.0023 );
      if( state.Earthdawn.version < 2.001)
        vUpdate( this, this.updateVersion2p001, 2.001 );

      state.Earthdawn.version = Earthdawn.Version;
    }

    var style;
    switch (state.Earthdawn.style) {
      case Earthdawn.style.VagueSuccess:  style = " - Vague Successes.";  break;
      case Earthdawn.style.VagueRoll:     style = " - Vague Roll.";       break;
      case Earthdawn.style.Full:
      default:                            style = " - Full.";             break;
    }

      log( "---Earthdawn.js Version: " + Earthdawn.Version
            + " loaded.   Earthdawn.html Version: " + state.Earthdawn.sheetVersion + " loaded.   For "
            + state.Earthdawn.game + " Edition: " +  Math.abs( state.Earthdawn.edition ) + " ---");
    if( state.Earthdawn.logStartup ) {
      log( "---  Roll Style: " + state.Earthdawn.style + style );
      log( "---  CursedLuckSilent is " + ((state.Earthdawn.CursedLuckSilent && state.Earthdawn.CursedLuckSilent & 0x04 ) ? "Silent" : "not Silent")
            + ".   NoPileonDice is " + state.Earthdawn.noPileonDice + ((state.Earthdawn.CursedLuckSilent && state.Earthdawn.CursedLuckSilent & 0x02 ) ? " Silent" : " not Silent")
            + ".   NoPileonStep is " + state.Earthdawn.noPileonStep + ((state.Earthdawn.CursedLuckSilent && state.Earthdawn.CursedLuckSilent & 0x01 ) ? " Silent" : " not Silent")
            + ". ---");
//      log( "---  New character default RollType -   NPC: "  + ((state.Earthdawn.defRolltype & 0x01) ? "GM Only" : "Public")
//                          + "   Mook: "   + ((state.Earthdawn.defRolltype & 0x02) ? "GM Only" : "Public")
//                          + "   PC: "   + ((state.Earthdawn.defRolltype & 0x04) ? "GM Only" : "Public") + " ---" );
//      log( "---  Token Linking Options -   NPC names: "     + ((state.Earthdawn.tokenLinkNPC & Earthdawn.tokenLinkNPC.showplayers_name) ? "true" : "false")
//                      + "   NPC / PC karma: " + ((state.Earthdawn.tokenLinkNPC & Earthdawn.tokenLinkNPC.showplayers_Karma) ? "true" : "false")
//                      + " / "         + ((state.Earthdawn.tokenLinkNPC & Earthdawn.tokenLinkNPC.showplayers_pcKarma) ? "true" : "false")
//                      + "   NPC wounds: "   + ((state.Earthdawn.tokenLinkNPC & Earthdawn.tokenLinkNPC.showplayers_wounds) ? "true" : "false")
//                      + "   NPC damage: "   + ((state.Earthdawn.tokenLinkNPC & Earthdawn.tokenLinkNPC.showplayers_damage) ? "true" : "false") + " ---" );
    }

    let smcText = Earthdawn.getStatusMarkerCollection();    // load the status marker collection, and see if the custom status markers are loaded.
    if( smcText ) {
      let edParse = new this.ParseObj( this );
      smcText += " For instructions open this link " +
					Earthdawn.makeButton( "Wiki Link", "https://wiki.roll20.net/Earthdawn_-_FASA_Official_V2#Import_the_Custom_Marker_Set",
								"This button will open this character sheets Wiki Documentation, which should answer most of your questions about how to use this sheet.",
								Earthdawn.Colors.dflt,Earthdawn.Colors.dfltfg, true ) + " in another tab and go to section 4.1.2.";
      this.chat( smcText, Earthdawn.whoFrom.apiWarning | Earthdawn.whoTo.public );
    }



    setTimeout(function() {   // Put anything that you want to happen 5 seconds after startup here.
      try {
        StatusTracker.RegisterCallback( "AnnounceTurn", callbackStAnnounceTurn );
        StatusTracker.RegisterCallback( "TokenType", callbackStTokenType );
      } catch(err) {
//        log( "Warning! Earthdawn.js  -> StatusTracker integration failed!  Error: " + err );
//        log( "   The sheet will still work, but without StatusTraicker integration!" );
      }
      try {
        if( typeof WelcomePackage !== 'undefined' )
          if( typeof WelcomePackage.onAddCharacter !== 'undefined' )
            WelcomePackage.onAddCharacter( callbackWelcomePackage );
          else if( typeof WelcomePackage.OnAddCharacter !== 'undefined' )
            WelcomePackage.OnAddCharacter( callbackWelcomePackage );
      } catch(err) {
//        if( err.indexOf( "WelcomePackage is not defined" ) == -1 )
//          log( "Warning! Earthdawn.js  -> WelcomePackage integration failed!  Error: " + err );
      }
      try {
        let sectplayer = new HtmlBuilder( "", "", {style: {"background-color": "white" }});
      } catch(err) {
        log( "Error! Earthdawn.js  -> HtmlBuilder integration failed!  Error: " + err );
        log( "   ***** The sheet will ***NOT*** work, unless htmlBuilder is installed! *****" );
        log( "   ***** go to the API page and add htmlBuilder.js" );
      }
    }, 3500);
  }; // End ED.Ready()



        // chat - The EDclass version of chat.
        // newMsg: Text to send.
        // iFlags: whoFrom and whoTo flags.
        // customFrom: Text string that will be used instead of whoFrom and whoTo flags.
        // po: If this is being called back from parseObj, then this is the parseObj. Else, if it exists, it holds cID.
  this.chat = function ( newMsg, iFlags, customFrom, po ) {
    'use strict';
    try {
      let edc = this, cID, wf = "API", specialTo, whoTo = "", isGM, w;
      iFlags = iFlags || 0;
      if( typeof po === "string" ) {
        cID = po;   // This was never parseObj, we were passed cID.
        po = undefined;
      } else if( po !== undefined)
        cID = po.charID;
      if ( iFlags & Earthdawn.whoFrom.apiError ) {
        this.errorLog( newMsg );
        iFlags |= Earthdawn.whoFrom.api | Earthdawn.whoTo.player | Earthdawn.whoTo.gm;
      }
      if ( iFlags & Earthdawn.whoFrom.apiWarning ) {
        this.errorLog( newMsg );
        iFlags |= Earthdawn.whoFrom.api | Earthdawn.whoTo.player;
      }
      if( customFrom && customFrom.startsWith( " sent Roll" )) {      // When a roll is sent to GM Only, a Player Card message is sent to the player saying it was sent.
        specialTo = customFrom;
        customFrom = undefined;
      }

      if( customFrom )
        wf = customFrom;
      else if ((iFlags & Earthdawn.whoFrom.player) && (iFlags & Earthdawn.whoFrom.character) && po && po.tokenInfo && ("name" in po.tokenInfo ))
        wf = this.msg.who.replace(" (GM)","") + " - " + po.tokenInfo[ "name" ];
      else if ((iFlags & Earthdawn.whoFrom.character) && po) {
        if( po.tokenInfo && ("name" in po.tokenInfo))
          wf = po.tokenInfo[ "name" ];
      } else if (!this.msg || (iFlags & Earthdawn.whoFrom.api) || (this.msg.playerid === "API"))
        wf = "API";
      else {
        w = who( true );
        wf = w;
      }

      if( specialTo )
        whoTo = specialTo;
      else if ( iFlags & Earthdawn.whoTo.gm && iFlags & Earthdawn.whoTo.player )
        whoTo = " to GM&P ";
      else if ( iFlags & Earthdawn.whoTo.gm )
        whoTo = " to GM ";
      else if ( iFlags & Earthdawn.whoTo.player )
        whoTo = " to player ";

      function who( getId ) {       // Try to figure out who the "Player" is to send this message to.
        'use strict';
        if( edc.msg && edc.msg.who ) {     // best and most common case, we have a msg, and the player is the person who sent the message.
          if (getId)
            isGM = playerIsGM( edc.msg.playerid )
          return edc.msg.who.replace(" (GM)","");
        }
        let plr = findObjs({ _type: "player", _online: true });     // If there is only one person online, that is the player.
        if( plr && plr.length === 1 ) {
          if( getId)
            isGM = playerIsGM( plr[0].get( "_id"));
          return plr[0].get( "_displayname" );
        }

        function getIsGM( name ) {
          'use strict';
          if( getId ) {
            let plrs = findObjs({ _type: "player", _displayname: name });
            if ( plrs && plrs.length === 1)
              isGM = playerIsGM( plrs[ 0 ].get( "id"));
          }
          return name;
        }

        if (cID ) {
          let pw = Earthdawn.getAttrBN( cID, "playerWho", "" );   // The characters playerWho attribute is saved every mesage, so this should get the last person who made a roll with this sheet.
          if( pw )
            return getIsGM( pw.replace(" (GM)","") );

          function isIt( l ) {
            'use strict';
            if( !l )
              return;
            let a = l.split( "," );
            if( a.indexOf( "all" ) > -1)
              return;
            if( a.length === 1 ) {
              let p = getObj( "player", a[0] );
              if ( p ) {
                isGM = playerIsGM( p.get( "_id" ));
                return p.get( "_displayname" );
          } } }

          let cObj = getObj("character", cID);
          if( cObj ) {
            let x = isIt( cObj.get("controlledby"));        // If there is only one player who has permission to control
            if( x )
              return getIsGM( x );
            x = isIt( cObj.get( "inplayerjournals"));     // If there is only one person who has the character in their journal.
            if( x )
              return getIsGM( x );
          }
          sendChat( "API", "The API is unsure who is editing this character sheet. Please make any dice roll on this sheet so the system can record who last used this sheet.", null, {noarchive:true});
        }
      } // End who()

          // Try to figure out if the current player is the GM.
      let noPlayer = false;
      if(( iFlags & Earthdawn.whoTo.player) && (iFlags & Earthdawn.whoTo.gm)) {
        if( w === undefined )
          w = who( true );
//        if (isGM === true || (this.msg && (this.msg.playerid === "API)))  // Note: had this extra test in, not sure why or if it is really needed. Keep it commented out for a while and see if anything goes wrong.
        if (isGM)
          noPlayer = true;
      }
                // Send to player, unless the player is the gm and are already senting to the gm.
      if(( iFlags & Earthdawn.whoTo.player) && !noPlayer) {
        if( w === undefined )
          w = who( false );
        if( w )
          sendChat( wf + whoTo, '/w "' + w +'" ' +  newMsg, null, (iFlags & Earthdawn.whoFrom.noArchive) ? {noarchive:true} : null );
        else
          iFlags &= ~Earthdawn.whoTo.mask;
      }
      if( iFlags & Earthdawn.whoTo.gm )
        sendChat( wf + whoTo, "/w gm " + newMsg, null, (iFlags & Earthdawn.whoFrom.noArchive) ? {noarchive:true} : null );
      else if( !( iFlags & Earthdawn.whoTo.mask))         // If no whoTo specified, send to all.
        sendChat( wf + " to Public", newMsg, null, (iFlags & Earthdawn.whoFrom.noArchive) ? {noarchive:true} : null );
    } catch(err) { this.errorLog( "Earthdawn.chat() error caught: " + err ); }
  }; // end chat()



        // Log a programming error. If command line logging of every command is turned off, log the command line as well.
  this.errorLog = function( msg ) {
    'use strict';
    try {
      if( !state.Earthdawn.logCommandline && this.msg)    // If have not already logged the command line, do so.
        log( this.msg );
      let today = new Date();
      log( today.getFullYear() + "-" + (today.getMonth() +1) + "-" + today.getDate() + " "
          + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + " (UTC)  " + msg);
    } catch(err) { log( "Earthdawn:Errorlog( " + msg + " ) error caught: " + err ); }
  } // end ErrorLog()



        // Somehow script library messed up character set and all token actions ended up with weird and wrong names (starting with 0xFFFD).
        // Go through all abilities that start with 0xFFFD.
        // look inside it, and figure out what it is, and fix the name.
  this.updateVersion1p001 = function( cID ) {
    'use strict';
    try {
      let count = 0;

      function setNameSafe( obj, typ, nm, val ) {   // We are changing objects names, but we DONT want duplicates.  Before changing a name, see if the new name already  exists, and if it does, delete the object we were about to change.
        'use strict';               // This could solve a problem where multiple version of a sheet got used at different times.
        let attrib = findObjs({ _type: typ, _characterid: cID, name: nm });
        if( attrib && attrib.length > 0 ) {
          obj.remove();
          while( attrib.length > 1 )
            attrib.pop().remove();    // if have more than one of the same name, delete all except one.
        }
        else
          Earthdawn.set( obj, "name", val);
        ++count;
      }

      let a = findObjs({ _type: "ability", _characterid: cID });
      if ( a )
        for( let i = 0; i < a.length; ++i) {
        let name = a[i].get( "name" );
        let e = name.lastIndexOf( String.fromCharCode( 0xFFFD ) );
        if( e !== -1 ) {
          let act = a[i].get("action").trim(),
            symbol;
          if(      act.endsWith( "willforce:t" ))   setNameSafe( a[i], "ability", name, Earthdawn.constant( "spell" ) + "WillFrc-T" );
          else if( act.endsWith( "_T_Roll}" ))      symbol = Earthdawn.constant( "talent" );
          else if( act.endsWith( "_NAC_Roll}" ))    symbol = Earthdawn.constant( "knack" );
          else if( act.endsWith( "_SK_Roll}" ))     symbol = Earthdawn.constant( "skill" );
          else if( act.endsWith( "_WPN_Roll}" ))    symbol = Earthdawn.constant( "weapon" );
          else if( act.endsWith( "Target: Set" ))   symbol = Earthdawn.constant( "target" );
          else if( act.endsWith( "TargetsClear" ))  symbol = Earthdawn.constant( "target" );
          else if( act.endsWith( "Grimoire" ))      symbol = Earthdawn.constant( "spell" );
          else if( act.endsWith( "Spells" ))        symbol = Earthdawn.constant( "spell" );
          else if (name.match( /[A-Z][a-z]+-\d '/)) symbol = Earthdawn.constant( "spell" );
          if( symbol )
            setNameSafe( a[i], "ability", name, symbol + name.slice( e +1 ));   // Fix the name with the correct symbol
        } else if( name === "Attack")
          a[i].set("action", "!edToken~ %{selected|Attack}");
      }

              // go through all attributes for this character and look for ones we are interested in
      let attributes = findObjs({ _type: "attribute", _characterid: cID });
      _.each( attributes, function (att) {
        let nm = att.get("name");
        if ( nm.endsWith( "_DSP_Code" )) {
          if( att.get( "current" ) == "99.0" )      // I changed the code for Questors.
            att.set( "current", "89.0");
        } else if ( nm === "SP-WillForce-Karma-Control" ) // Willforce, not WillForce.
          setNameSafe( att, "attribute", nm, "SP-Willforce-Karma-Control");
        else if ( nm === "Damage" ) {
          let t = att.get( "max" );
          if( t )
            Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: cID, name: "Damage-Unc-Rating"}, t);
        } else if ( nm ===   "SP-WillForce-DP-Control" )
          setNameSafe( att, "attribute", nm, "SP-Willforce-DP-Control");
        else if ( nm.endsWith( "show-T-details" ))
          setNameSafe( att, "attribute", nm, "T_showDetails");
        else if ( nm.endsWith( "show-NAC-details" ))
          setNameSafe( att, "attribute", nm, "NAC_showDetails");
        else if ( nm.endsWith( "show-SK-details" ))
          setNameSafe( att, "attribute", nm, "SK_showDetails");
        else if ( nm.endsWith( "show-SPM-details" ))
          setNameSafe( att, "attribute", nm, "SPM_showDetails");
        else if ( nm.endsWith( "show-SP-details" ))
          setNameSafe( att, "attribute", nm, "SP_showDetails");
        else if ( nm.endsWith( "_WilEffect" ) && att.get( "current" ) != "0" )
          Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: cID, name: nm.slice(0, -10) + "_WilSelect"}, "Wil");
      }); // End for each attribute.

      a = findObjs({ _type: "macro" });
      if ( a ) {
        for( let i = 0; i < a.length; ++i) {
          let name = a[i].get( "name" );
          let e = name.lastIndexOf( String.fromCharCode( 0xFFFD ) );
          if( e !== -1 ) {
            let act = a[i].get("action").trim(),
              symbol;
            if( act.endsWith( "Attrib" ))       setNameSafe( a[i], "macro", name, "Attrib");
            else if( act.endsWith( "Target: Set" ))   symbol = Earthdawn.constant( "target" );
            else if( act.endsWith( "TargetsClear" ))  symbol = Earthdawn.constant( "target" );
            if( symbol )
              setNameSafe( a[i], "macro", name, symbol + name.slice( e +1 ));   // Fix the name with the correct symbol
      } } }
      return count;
    } catch(err) { log( "ED.updateVersion1p001() cID=" + cID + "   error caught: " + err ); }
  }; // end updateVersion1p001()



  this.updateVersion1p0021 = function( cID ) {
    'use strict';
    try {
      let count = 0;
              // go through all attributes for this character and look for ones we are interested in
      let attributes = findObjs({ _type: "attribute", _characterid: cID });
      _.each( attributes, function (att) {
        if ( att.get("name").endsWith( "_Mod-Type" )) {
          if( att.get( "current" ) == "@{IP}" )
            att.set( "current", "(-1*@{IP})");
          else if( att.get( "current" ) == "@{Armor-IP}" )
            att.set( "current", "(-1*@{Armor-IP})");
        }
      }); // End for each attribute.
      return count;
    } catch(err) { log( "ED.updateVersion1p0021() cID=" + cID + "   error caught: " + err ); }
  }; // end updateVersion1p0021()



  this.updateVersion1p0022 = function( cID ) {
    'use strict';
    try {
      let count = 0;
              // go through all attributes for this character and look for ones we are interested in
      let attributes = findObjs({ _type: "attribute", _characterid: cID });
      _.each( attributes, function (att) {
        if ( att.get("name").endsWith( "_Mod-Type" )) {
          if( att.get( "current" ).search( /Armor-IP/ ) != -1)
            att.set( "current", "@{Adjust-All-Tests-Total}+(-1*@{Armor-IP})");
          else if( att.get( "current" ).search( /\{IP\}/ ) != -1)
            att.set( "current", "@{Adjust-All-Tests-Total}+(-1*@{IP})");
        }
      }); // End for each attribute.
      return count;
    } catch(err) { log( "ED.updateVersion1p0022() cID=" + cID + "   error caught: " + err ); }
  }; // end updateVersion1p0022()



  this.updateVersion1p0023 = function( cID, ed, charCount ) {
    'use strict';
    try {
      let count = 0;
      if( charCount === 0 ) {     // If this is true then this is being called because a new API version has been detected (as opposed an old character sheet being imported) and this is the very first character. So do this once when new API is detected.
        let macs = findObjs({ _type: "macro", visibleto: "all" });      // These will be deleted in the macro refresh below, but lets specifically target them for deletion just in case.
        _.each( macs, function (macObj) {
          let n = macObj.get( "name" );
          if( n.startsWith( Earthdawn.constant( "Target" )) && n.endsWith( "r-Targets" ))
            macObj.remove();
        });

        if( ed.msg === undefined )    // fake up a playerID.
          Earthdawn.pseudoMsg( ed );
    		let edp = new ed.ParseObj( ed );
        edp.funcMisc( [ "funcMisc", "macroCreate", "refresh" ] );
      } // do once when new API detected.

      let attributes = findObjs({ _type: "attribute", _characterid: cID });
      _.each( attributes, function (att) {
        if ( att.get( "name" ).startsWith( "repeating_")) {
          let nm = att.get( "name" );
          if ( nm.endsWith( "_CombatSlot") || (nm.endsWith( "_Contains") && (Earthdawn.repeatSection( 3, nm) === "SPM" ))) {
            let nmn,
              rowID = Earthdawn.repeatSection( 2, nm),
              code  = Earthdawn.repeatSection( 3, nm),
              symbol = Earthdawn.constant( code ),
              cbs = att.get( "current" ),
              lu = "Name";
            if( code === "SPM" ) {
              cbs = "1";
              lu = "Contains";
            }
            if ( code !== "SP" ) {    // skip if it is SP, we don't do those token actions.
              nmn = Earthdawn.getAttrBN( cID, Earthdawn.buildPre( code, rowID ) + lu, "" );
              Earthdawn.abilityRemove( cID, symbol + nmn );
              if( cbs == "1" )
                Earthdawn.abilityAdd( cID, symbol + nmn, "!edToken~ %{selected|" + Earthdawn.buildPre( code, rowID ) + "Roll}" );
            }
          } // End Token Action maint.
        }
      }); // End for each attribute.
      return count;
    } catch(err) { log( "ED.updateVersion1p0023() cID=" + cID + "   error caught: " + err ); }
  }; // end updateVersion1p0023()



  this.updateVersion2p001 = function( cID, ed, charCount ) {
    'use strict';
    try {
      let count = 0;
      if( charCount === 0 ) {     // If this is true then this is being called because a new API version has been detected (as opposed an old character sheet being imported) and this is the very first character. So do this once when new API is detected.
        let macs = findObjs({ _type: "macro", visibleto: "all" });      // These will be deleted in the macro refresh below, but lets specifically target them for deletion just in case.
        _.each( macs, function (macObj) {
          let n = macObj.get( "name" );
          if( n.startsWith( Earthdawn.constant( "Target" )) && n.endsWith( "r-Targets" )) {
            macObj.remove();
            ++count;
          }
        });

        if( ed.msg === undefined )    // fake up a playerID.
          Earthdawn.pseudoMsg( ed );
        let edp = new ed.ParseObj( ed );
        edp.funcMisc( [ "funcMisc", "macroCreate", "refresh" ] );
      } // do once when new API detected.

      let attributes = findObjs({ _type: "attribute", _characterid: cID });
      _.each( attributes, function (att) {
        if ( att.get( "name" ).startsWith( "repeating_")) {
          let nm = att.get( "name" );
          if ( nm.endsWith( "_CombatSlot") || (nm.endsWith( "_Contains") && (Earthdawn.repeatSection( 3, nm) === "SPM" ))) {
            let nmn,
              rowID = Earthdawn.repeatSection( 2, nm),
              code  = Earthdawn.repeatSection( 3, nm),
              symbol = Earthdawn.constant( code ),
              cbs = att.get( "current" ),
              lu = "Name";
            if( code === "SPM" ) {
              cbs = "1";
              lu = "Contains";
            }
            if ( code !== "SP" ) {    // skip if it is SP, we don't do those token actions.
              nmn = Earthdawn.getAttrBN( cID, Earthdawn.buildPre( code, rowID ) + lu, "" );
              Earthdawn.abilityRemove( cID, symbol + nmn );
              if( cbs == "1" )
                Earthdawn.abilityAdd( cID, symbol + nmn, "!edToken~ %{selected|" + Earthdawn.buildPre( code, rowID ) + "Roll}" );
              ++count;
            }
          } // End Token Action maint.
        }
      }); // End for each attribute.
      return count;
    } catch(err) { log( "ED.updateVersion1p0023() cID=" + cID + "   error caught: " + err ); }
  }; // end updateVersion2p001()




/*
Step/Action Dice Table
1 D4-2    11 D10+D8     21 D20+2D8    31 2D20+D8+D6
2 D4-1    12 2D10     22 D20+D10+D8 32 2D20+2D8
3 D4    13 D12+D10    23 D20+2D10   33 2D20+D10+D8
4 D6    14 2D12     24 D20+D12+D1 34 2D20+2D100
5 D8    15 D12+2D6    25 D20+2D12   35 2D20+D12+D10
6 D10   16 D12+D8+D6  26 D20+D12+2D 36 2D20+2D126
7 D12   17 D12+2D8    27 D20+D12+D8 37 2D20+D12+2D6+D6
8 2D6   18 D12+D10+D8   28 D20+D12+2D 38 2D20+D12+D8+D68
9 D8+D6   19 D20+2D6    29 D20+D12+D1 39 2D20+D12+2D80+D8
10 2D8    20 D20+D8+D6  30 2D20+2D6   40 2D20+D12+D10+D8
*/
            // Takes an Earthdawn step number, and returns a string containing the dice to be rolled.
            // If step is less than 1, returns an empty string.
  this.StepToDice = function( stepNum )  {
    'use strict';
    try {
      let dice = "";

      if ( stepNum < 0 )
        stepNum = 0;
      if ( stepNum < 8 ) {         // The step numbers less than 8 don't follow the same pattern as the rest of the table and should just be set to the correct value.
        switch( stepNum ) {
          case 1:     dice = ((state.Earthdawn.gED && state.Earthdawn.edition == 3) ? "{{1d6!-3}+d1}kh1+" : "{{1d4!-2}+d1}kh1+" );     break;         // Roll a d4 minus something, but also roll a "d1" and keep only the highest one.
          case 2:     dice = ((state.Earthdawn.gED && state.Earthdawn.edition == 3) ? "{{1d6!-2}+d1}kh1+" : "{{1d4!-1}+d1}kh1+" );     break;
          case 3:     dice = ((state.Earthdawn.gED && state.Earthdawn.edition == 3) ? "{{1d6!-1}+d1}kh1+" : "d4!+" );     break;
          case 4:     dice = "d6!+";      break;
          case 5:     dice = "d8!+";      break;
          case 6:     dice = "d10!+";     break;
          case 7:     dice = "d12!+";     break;
        }
      }  // end step 7 or less
      else if( state.Earthdawn.gED && state.Earthdawn.edition == 3 ) {        // Earthdawn 3rd edition.
        var baseNum = stepNum - 6;
        var twelves = 0;
        if( stepNum > 12 )        // Calculate the number of d12's we need to roll.
          twelves = Math.floor( baseNum / 7);
        baseNum = ( baseNum % 7 ) + 6;    // We now have a number between 6 and 12. The chart repeats the same sequence, differing only in the number of d12's, which we have already calculated.

        switch( baseNum ) {
          case  6:     dice = "d10!+";            break;
          case  7:     ++twelves;                 break;
          case  8:     dice = "2d6!+";            break;
          case  9:     dice = "d8!+d6!+";         break;
          case 10:     dice = "2d8!+";            break;
          case 11:     dice = "d10!+d8!+";        break;
          case 12:     dice = "2d10!+";           break;
        }
        if( twelves > 0 )
          dice = ((twelves === 1) ? "" : twelves.toString()) + "d12!+" + dice;
      } else {        // This is Earthdawn 4th edition.
        var baseNum = stepNum - 8;
        if( stepNum > 18 )          // Calculate the number of d20's we need to roll.
          dice = Math.floor( baseNum / 11).toString() + "d20!+";
        baseNum = ( baseNum % 11 ) + 8;    // We now have a number between 8 and 18. The chart repeats the same sequence, differing only in the number of d2o's, which we have already calculated.
        switch( baseNum ) {
          case  8:     dice += "2d6!+";           break;
          case  9:     dice += "d8!+d6!+";        break;
          case 10:     dice += "2d8!+";           break;
          case 11:     dice += "d10!+d8!+";       break;
          case 12:     dice += "2d10!+";          break;
          case 13:     dice += "d12!+d10!+";      break;
          case 14:     dice += "2d12!+";          break;
          case 15:     dice += "d12!+2d6!+";      break;
          case 16:     dice += "d12!+d8!+d6!+";   break;
          case 17:     dice += "d12!+2d8!+";      break;
          case 18:     dice += "d12!+d10!+d8!+";  break;
        }
      } // End 4th edition
      return dice.slice(0,-1);     // Trim off the trailing "+"
    } catch(err) { this.errorLog( "ED.StepToDice() error caught: " + err ); }
  };  //   End Earthdawn.EDclass.StepToDice()




            // If a message includes any inline rolls, go through the message and replace the in-line roll markers with the roll results.
  this.ReconstituteInlineRolls = function( origMsg ) {
    'use strict';
    try {
      let msg = origMsg;
      if( _.has( msg, "inlinerolls" )) {
        msg.content = _.chain( msg.inlinerolls )
          .reduce( function( m, v, k){
            m['$[['+k+']]'] = v.results.total || 0;
            return m;
          },{})
          .reduce(function( m, v,k ){
            return m.replace( k, v );
          }, msg.content)
          .value();
      }
      return msg;
    } catch(err) { this.errorLog( "ED.ReconstituteInlineRolls() error caught: " + err ); }
  };


                // edsdr - Earthdawn Step Dice Roller
  this.StepDiceRoller = function()  {
    'use strict';
                // looks for !edsdr and converts Earthdawn Step Numbers to Dice which are then sent back to the chat system to be rolled.
                // Expected format: !edsdr~ (StepNum)~ (KarmaStep)~ (Reason)~ (Target Number)
                // Everything other than the !edsdr~ tag and step number is optional.
                // "!edsdr~ num~ karmastep (: Karma Control)~ reason" gets turned to "/roll (dice) (reason)"     where dice includes the step and karma dice
                // For Example: "!edsdr~ 11~ 4~ for Attack" Gets turned into "/r d10!+d8!+d6! for Attack"
                // If (Target Number) is present, when the dice roller is finished, a callback routine will display the number of levels of success achieved.
                // This is currently set up for 4th edition, but the code could be modified to report other edition result levels.
                //
                // This routine will also process the initial tag edsdrGM which will display the results only to the GM and the player who rolled the dice and
                // edsdrHidden which will display the roll to the GM only.
                //
                // The following roll20 macro will generate a string that this will process.
                // !edsdr~ ?{Step|0}~ ?{Karma Step|0} : karma control~ for ?{reason| no reason}~ Target Number
    try {
      let edc = this,
        MsgType,
        newMsg,
        rollMsg;

      if ( this.msgArray[ 0 ] === "!edsdrGM") {
        MsgType = Earthdawn.whoTo.gm | Earthdawn.whoTo.player;
        newMsg = "GMRROLLS step ";           // This is the base step number.
        rollMsg = "/gmroll ";
      }
      else if ( this.msgArray[ 0 ] === "!edsdrHidden") {
        MsgType = Earthdawn.whoTo.gm;
        newMsg = "HIDDEN Rolls step ";
        rollMsg = "/gmroll ";
      } else {
        MsgType = 0;
        newMsg = "Rolls step ";
        rollMsg = "/r ";
      }
      newMsg += this.msgArray[1];
      let step = Earthdawn.parseInt2( this.msgArray[1] );
      if( step < 1 ) {
        this.chat( "Warning!!! Step Number " + step, Earthdawn.whoFrom.apiWarning );
        step = 0;
        rollMsg += "d0";
      } else
        rollMsg += this.StepToDice( step );

      if (this.msgArray.length > 2) {
        let karmaControl = Earthdawn.getParam( this.msgArray[2], 2, ":"),
          karmaDice;
        if( karmaControl === "-1" )
          karmaDice = 0;
        else if( Earthdawn.parseInt2( karmaControl ) > 0 )
          karmaDice = this.StepToDice( Earthdawn.parseInt2( karmaControl ) * 4 );
        else
          karmaDice = this.StepToDice( Earthdawn.parseInt2( Earthdawn.getParam( this.msgArray[2], 1, ":" )));          // karma or bonus step number
        if( karmaDice != "" ) {
          newMsg = newMsg + " plus " + karmaDice.replace( /!|\+/g, "");
          rollMsg = rollMsg + "+" + karmaDice;
        }
        if (this.msgArray.length > 3) {
          newMsg = newMsg + " " + this.msgArray[ 3 ] + ".";              // This is the "reason" or flavor text
        }     // End 3rd elements.
      }     // End msgArray has at least two elements.

      this.chat( newMsg, MsgType );
      if(( MsgType != (Earthdawn.whoTo.gm | Earthdawn.whoTo.player)) && (this.msgArray.length < 5 || Earthdawn.parseInt2( this.msgArray[ 4 ] ) < 1)) {
        this.chat( rollMsg, 0);
      } else {       // We have a target number, so have the results of the roll sent to a callback function to be processed.
        sendChat("player|" + this.msg.playerid, rollMsg, function( ops )  {  // This is a callback function that sendChat will callback as soon as it finishes rolling the dice.
          'use strict';
             // NOTE THAT THIS IS THE START OF A CALLBACK FUNCTION
                  // Standard. Tell what rolled, vague about how much missed by.
                  // Full: Tell exact roll result and how much made or missed by.
                  // Vague. Done tell roll result, but tell how much made or missed by.
          let RollResult = JSON.parse(ops[0].content);
          let EchoMsg =  "Rolling " + ops[0].origRoll.replace( /!/g, "") + ":";
          if ( state.Earthdawn.style != Earthdawn.style.VagueRoll)
            EchoMsg += "  Rolled a " + RollResult.total + ".";

          if (edc.msgArray.length > 4 && Earthdawn.parseInt2( edc.msgArray[ 4 ] ) > 0) {
            let result = RollResult.total - Earthdawn.parseInt2( edc.msgArray[4] );
            if( result < 0 ) {
              EchoMsg += "   FAILURE" + (( state.Earthdawn.style != Earthdawn.style.VagueSuccess ) ? " by " + Math.abs(result) + "!" : "!" );
            } else if ( result < 5 ) {
              EchoMsg += "   SUCCESS" + (( state.Earthdawn.style != Earthdawn.style.VagueSuccess ) ? " by " + Math.abs(result) + "." : "." );
            } else
              EchoMsg += "   SUCCESS" + (( state.Earthdawn.style != Earthdawn.style.VagueSuccess ) ? " by " + Math.abs(result) : "" ) + " (" + ( Math.floor(result / 5) ).toString() + " extra success" + ((result < 10) ? "!)" : "es!)");
          } // End we have a target number
          else if ( state.Earthdawn.style == Earthdawn.style.VagueRoll)
            EchoMsg += "  Rolled a " + RollResult.total + ".";
          edc.chat( EchoMsg, MsgType);
        });  // End of callback function
      }    // 4th element.
    } catch(err) { this.errorLog( "ED.StepDiceRoller() error caught: " + err ); }
  };  // End StepDiceRoller();



                // edInit - Initiative
  this.Initiative = function()  {
    'use strict';
                // Expects an initiative step, rolls the initiative for each selected token and puts them in the turn order the selected token.
                // There may also optionaly be a karma step.
                //
                // The following roll20 macro will generate a string that this will process.
                // edInit~ ?{Initiative Step}~ ?{Karma Step | 0}~ for Initiative
    try {
      let edc = this,
        step = Earthdawn.parseInt2( this.msgArray[1] ),
        rollMsg;
      if ( step < 1 ) {
        this.chat( "Illegal Initiative step of " + step, Earthdawn.whoFrom.apiWarning );
        step = 0;
        rollMsg = "/r d0";
      }
      else
        rollMsg = "/r " + this.StepToDice( step );
      let newMsg = " rolled step " + step;
      if (this.msgArray.length > 2) {
        var karmaDice = this.StepToDice( Earthdawn.parseInt2( this.msgArray[2] ) );          // karma or bonus step number
        if( karmaDice != "" ) {
          newMsg = newMsg + " plus " + karmaDice.replace( /!|\+/g, "");
          rollMsg = rollMsg + "+" + karmaDice;
      }  }

      let Count = 0;
      _.each(edc.msg.selected, function( sel ) {
        let TokenObj = getObj( "graphic", sel._id );
        if (typeof TokenObj === 'undefined' )
          return;

        let TokenName = TokenObj.get( "name" );
        let CharObj = getObj( "character", TokenObj.get( "represents" )) || "";
        if (typeof CharObj === 'undefined')
          return;

        if( TokenName.length < 1 )
          TokenName = CharObj.get("name");
        Count = Count + 1;
        sendChat( "player|" + edc.msg.playerid, rollMsg + "~" + TokenName + "~" + sel._id, function( ops ) {
          'use strict';                   // NOTE THAT THIS IS THE START OF A CALLBACK FUNCTION
          let RollResult = JSON.parse(ops[0].content),
            result = RollResult.total,
            ResultArray = ops[0].origRoll.split("~"),
            Reason = "for initiative";
          if (edc.msgArray.length > 3 )
            Reason = edc.msgArray[ 3 ];
          edc.chat( ResultArray[1] + newMsg + ": [" + ResultArray[0] +"] " + Reason +" and got " + result + ".");
          let tt = Campaign().get( "turnorder" );
          let turnorder = (tt == "") ? [] : JSON.parse( tt );
          turnorder = _.reject(turnorder, function( toremove ){ return toremove.id === sel._id });
          turnorder.push({ id: sel._id, pr: result });
          turnorder.sort( function(a,b) { 'use strict'; return (b.pr - a.pr) });
          Campaign().set("turnorder", JSON.stringify(turnorder));
        });  // End of callback function
      });  // End for each selected token
      if( Count == 0)
        edc.chat( "Error! Need to have a token selected to Roll Initiative.", Earthdawn.whoFrom.apiWarning );
    } catch(err) { this.errorLog( "EDInit error caught: " + err ); }
  };     // End EDInitiative();



//
// NOTE: Everything above this point (plus the last routine in this file) is what is needed to get the stepdice and initiative macros working.
// Everything below this point is used with the PARSE command and interacts with the character sheet.
//
// So if you are not using my Earthdawn character sheets, you can cut everything between this point and the similer note near the end of this file.
//


                // This routine is a StatusTracker callback function that tells StatusTracker what type of token it is. PC, NPC, or Mook.
  var callbackStAnnounceTurn = function( token )  {
    'use strict';
    let rep;
    if (rep = token.get('represents'))
      return (Earthdawn.getAttrBN(rep, "AnnounceTurn", "0" ) == "1");
    return;
  }; // End callbackStAnnounceTurn;



                // This routine is a StatusTracker callback function that tells StatusTracker what type of token it is. PC, NPC, or Mook.
  var callbackStTokenType = function( token )  {
    'use strict';
    let ret = "none";
    switch (Earthdawn.getAttrBN(token.get('represents'), "NPC", "0" )) {
      case "-1":  ret = "Object"; break;
      case "0":   ret = "PC";     break;
      case "1":   ret = "NPC";    break;
      case "2":   ret = "Mook";   break;
    }
    return ret;
  };     // End callbackStTokenType;



        // This routine runs when a new character is added.
        // It can be called from events "on character add" when one is created manually, or
        // It can be called from WelcomePackage when it makes one.
        // Note, it also seem to be triggered on charcter add, when a character is imported from the character vault (in which case it is not truely a new character!).
  this.newCharacter = function( cID )  {
    'use strict';
    try {
      let po = this;
      setTimeout(function() {       // When a character is imported from the character vault, the recalc caused by edition has been observed to cause a race condition. Delay this processig long enough for the import to have been done.
        try {
          if( state.Earthdawn.edition != Earthdawn.getAttrBN(cID, "edition")) {
            po.chat( "Error! Edition mismatch possibly due to configuration error. "
                + "state.Earthdawn.edition is " + state.Earthdawn.edition + "   While the new sheet edition attribute got set to "
                + Earthdawn.getAttrBN(cID, "edition"), Earthdawn.whoFrom.apiError );
            po.chat( "First make sure that in 'Campaign Settings', 'Default Sheet Settings', 'What Game/Edition is your campaign'"
                + " is set to the correct Game/Edition. Then press this button "
                + Earthdawn.makeButton("Change Edition", "!Earthdawn~ Misc: State: edition: ?{What rules Edition|Earthdawn Forth Ed,4 ED|1879 1st Ed,-1 1879|Earthdawn Third Ed,3 ED|Earthdawn First Ed,1 ED}",
                    "Switch API and Character sheet to Earthdawn 1st/3rd/4th Edition or 1879 1st Edition.", Earthdawn.Colors.param, Earthdawn.Colors.paramfg )
                + " to change both the state, and all the character sheets in this campaign to the correct Edtion.", Earthdawn.whoFrom.api | Earthdawn.whoTo.gm );
          } // end edition not equal state.Earthdawn.edition.
          Earthdawn.SetDefaultAttribute( cID, "edition", state.Earthdawn.edition );
          Earthdawn.setWW( "API", 1, cID );
          Earthdawn.SetDefaultAttribute( cID, "Karma", 0, 0 );
          Earthdawn.SetDefaultAttribute( cID, "Wounds", 0, 8 );
          Earthdawn.SetDefaultAttribute( cID, "Damage", 0, 20 );
          Earthdawn.SetDefaultAttribute( cID, "Race", "None" );
          Earthdawn.SetDefaultAttribute( cID, "LP-Current", 0 );
          Earthdawn.SetDefaultAttribute( cID, "LP-Total", 0 );
          Earthdawn.SetDefaultAttribute( cID, "Wealth_Silver", 0 );
          Earthdawn.SetDefaultAttribute( cID, "record-date-real", "" );
          Earthdawn.SetDefaultAttribute( cID, "record-date-throalic", "" );
          Earthdawn.SetDefaultAttribute( cID, "record-item", "LPSP" );
          Earthdawn.SetDefaultAttribute( cID, "record-type", "Gain" );
          Earthdawn.SetDefaultAttribute( cID, "SpecialFunction", "!Earthdawn~ charID: @{character_id}~ LinkToken");
          Earthdawn.SetDefaultAttribute( cID, "MaskList", "0" );
          if( state.Earthdawn.sheetVersion < 1.8 ) {
            Earthdawn.abilityAdd( cID, Earthdawn.constant( "Spell" ) + "Grimoire",  "!edToken~ ChatMenu: Grimoire");
            Earthdawn.SetDefaultAttribute( cID, "Karma-Roll", 0 );
          }
          if( state.Earthdawn.gED) {
            if( state.Earthdawn.sheetVersion < 1.8 )
              Earthdawn.abilityAdd( cID, Earthdawn.constant( "Spell" ) + "Spells",  "!edToken~ ChatMenu: Spells");
            Earthdawn.SetDefaultAttribute( cID, "Questor", "None" );
          }

          let npc = ( typeof WelcomePackage === 'undefined' ) ? 0 : 1;
          let plr = findObjs({ _type: "player", _online: true });     // If there is only one person on-line, that is the player.
          if( plr && plr.length === 1 )
            npc = playerIsGM( plr[0].get( "_id")) ? Earthdawn.charType.npc : Earthdawn.charType.pc;
          let CharObj = getObj("character", cID);     // See if we can put a default value in the player name.
          if ( CharObj ) {
            let lst = CharObj.get("controlledby");
            let arr = lst.split( "," );
            let i = arr.indexOf( "all" );
            while( i !== -1) {
              arr.splice( i, 1 );
              i = arr.indexOf( "all");
            }
            if( arr.length === 1 && arr[ 0 ] !== "" ) {
              let pObj = getObj( "player", arr[ 0 ]);
              if( pObj )
                Earthdawn.SetDefaultAttribute( cID, "player-name", pObj.get( "_displayname" ));
              npc = playerIsGM( arr[ 0 ] ) ? Earthdawn.charType.npc : Earthdawn.charType.pc;    // character was created by welcome package, if for GM, make it an NPC else PC.
          } }
                    // If a character was created by Welcome package for a Player, or if Welcome Package is not installed, default to PC.
                    // If a character was created by Welcome package for a GM, or if Welcome Package is installed, default to NPC.
          Earthdawn.SetDefaultAttribute( cID, "NPC", npc ? npc : Earthdawn.charType.pc );
          Earthdawn.SetDefaultAttribute( cID, "RollType", (state.Earthdawn.defRolltype & (( npc === Earthdawn.charType.pc ) ? 0x04 : 0x01)) ? "/w gm" : " " );
        } catch(err) { po.edClass.errorLog( "ED.newCharacter setTimeout() error caught: " + err ); }
      }, 10000);    // end delay 10 seconds.
    } catch(err) { this.errorLog( "newCharacter error caught: " + err ); }
  };     // End newCharacter;



                // This routine is a callback that WelcomePackage runs when a new character is added.
  var callbackWelcomePackage = function( character ) {
    'use strict';
    let ED = new Earthdawn.EDclass();
    ED.newCharacter( character.get( "_id" ) );
    return;
  };     // End callbackWelomePackage;




          // Define the ParseObj Class
          // By making a ParseObj we can insure that each command msg has it's own instance and don't have to worry about global variables being overwritten.
  this.ParseObj = function( edc ) {
  'use strict';
                // Parameters
    this.edClass = edc;             // This is a pointer back to the class that has created this object.
    this.bFlags = 0;                // See Earthdawn.flagsArmor, .flagsTarget, and .flags for description of what is stored here.
    this.charID = undefined;        // Character ID associated with this action, additional information is stored in tokenInfo.
    this.doLater = "";              // This is a command we are saving to do immediately before the Roll()
    this.indexMsg = 0;              // The command is a tilde (~) segmented list. As we parse this message, this is the index that points to the current segment being parsed.
    this.indexTarget = undefined;   // Index to targetIDs.
    this.indexToken = undefined;    // Index to tokenIDs.
    this.SWflag = "";               // This holds commands that will later be sent to the sheetworker. Newline delimited list of command lines that start with a command and a comma.
    this.targetIDs = [];            // array of IDs of targets.
    this.tokenIDs = [];             // array of IDs of tokens we are processing with this command.
    this.targetNum = undefined;     // If this action involves a target number, it is stored here.
    this.tokenAction = false;       // If this is set to true, then we were called from a Token Action. If false, from a character sheet button.
                                    // Note that this controls how many of the commands behave. For example ForEach behaves differently if called from a Token Action.
    this.tokenInfo = undefined;     // { type: "token" or "character", name: (name), tokenObj: (API token object), characterObj: (API character object) }
    this.uncloned = this;           // ForEach makes a copy of this class that each loop can modify at will. If you want to make changes or check values in the original, use this.uncloned.
    this.misc = {};                 // An object to store miscellaneous values that don't really need a dedicated space on this top level. It starts out empty, but many routines store various stuff here.
            // Among the things stored here in .misc are:
            // bonusStep: This holds bonus steps to be added to a step dice roll.
            // bonusDice: This holds bonus dice to be added to a step dice roll. It is held as a string ready to be appended to a roll query.
            // charIDsUnique: When MarkerSet is called to toggle status markers, store unique character ids between iterations of each token.
            // karmaNum:  This holds karma steps to be added to a step dice roll.
            // karmaDice: This holds karma dice to be added to a step dice roll. It is held as a string ready to be appended to a roll query.
            // reason:    Text that is sent back as part of the result message.
            // result:    Result of the roll is stored here. Before the roll, modifiers to the result can be stored here.
            // rollWhoSee:  If this action has a specific customizable roll type (whether roll is public, player/gm, or GM-only), the string describing it is stored here.
            // step:    This is the step number to be rolled for the talent or skill being used. Set with Value.
            // strain:    How much strain was taken this action.
            // targetName:  Name of the current target token.
            // targetNum2:  On an Action command when the target is Riposte, this stores the 2nd target number.
            // There are also a number of values that are prepared in the Action, Roll or other routines to be outputted in the RollFormat routine.
            // These include:
            //  headcolor, subheader, succMsg, endNote, endNoteSucc, endNoteFail, targetName, targettype, etc.




          // ParseObj.addSWflag()     This routine builds a list of commands for the sheetworkers to process.
          // The list is newline delimited.
          // Each item on the list has a command, a comma, and some data for the command. Each command has its own requirements for format.
          // cmd tells the sheetworkers what exact type of communication this is.
          // line is the details needed to process this command.
          //    Trigger, (attribute name to trigger) (: colon) (data to be written to activate the trigger). (newline).
    this.addSWflag = function( cmd, line ) {
      try {
        this.SWflag += cmd + "," + line + "\n";
      } catch(err) { this.edClass.errorLog( "ED.addSWflag() error caught: " + err ); }
    } // end addSWflag()


          // ParseObj.sendSWflag()
          // if SWflag is not blank, send it to the sheet workers.
          // No arguments, if there is a msg, it will already be stored in SWflag.
    this.sendSWflag = function() {
      try {
        if( this.SWflag )
          if( this.charID ) {
//log(this.SWflag);
            this.setWW( "SWflag", this.SWflag.trim())
          } else
            this.edClass.errorLog( "ED.checkSWflag error, no charID found!   SWflag was " + this.SWflag );
      } catch(err) { this.edClass.errorLog( "ED.checkSWflag() error caught: " + err ); }
    } // end sendSWflag()


                    // ParseObj.Action()
                    // We are passed an action to take.  Lookup the necessary values from the appropriate character sheet(s) and roll the correct dice.
                    //  ssa[1]: Action - T, SK, SKA, SKK, SKL, WPN.
                    //  ssa[2]: RowID
                    //  ssa[3]: Mods
                    //    value="!Earthdawn~ charID: @{character_id}~ foreach: sct: ust~ Target: @{T_Target}~ Action: T: @(T_RowID): ?{Modification|0}"
    this.Action = function( ssa ) {
      'use strict';
      try {
        if( ssa.length < 3 ) {
            this.chat( "Error! Action() parameters not correctly formed. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError );
            return;
        }
        if( ssa[ 2 ].length < 1 ) {
            this.chat( "Error! Action() not passed RowID. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError );
            return;
        }
        if( this.tokenInfo === undefined )
          if( this.charID === undefined ) {
            this.chat( "Error! tokenInfo and charID undefined in Action() command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError);
            return;
          } else {
            let CharObj = getObj("character", this.charID);
            if (typeof CharObj != 'undefined')
              this.tokenInfo = { type: "character", name: CharObj.get("name"), characterObj: CharObj };      // All we have is character information.
            else {
              this.chat( "Error! Invalid charID in Action() command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError);
              return;
          } }

        let step = 0,
          stepAttrib = "Rank",
          pre = Earthdawn.buildPre( ssa[ 1 ], ssa[ 2 ] ),
          def_attr,       // This is the default attribute if it can't read one from the sheet.
          modtype,
          special,
          armortype;
          ssa[ 1 ] = ssa[ 1 ].toLowerCase();
        switch ( ssa[ 1 ] ) {
          case "t":
          case "sk":
          case "skc":
          case "nac": {
            if(( ssa[ 1 ] !== "sk" && ssa[ 1 ] !== "skc") || state.Earthdawn.sheetVersion > 1.8 ) {     // Before v2, Put anything that is _T_ and _NAC_ but not _SK_ here. In V2, everything goes there
              this.misc[ "result" ] = (this.misc[ "result" ] || 0) + this.getValue( pre + "Result-Mods");
              let fx = Earthdawn.getAttrBN( this.charID, pre + "FX", "");
              if( fx )
                this.misc[ "FX" ] = fx;
              if( ssa[ 1 ] === "t" || state.Earthdawn.sheetVersion > 1.8 )
                stepAttrib = "Effective-Rank";
              else if( ssa[ 1 ] === "nac" )
                stepAttrib = "Linked";
            } // end T and NAC only section. From here on it is T, NAC, and SK.
            if( ssa[ 1 ] === "skc")
              def_attr = "Cha";
            else
              def_attr = "0";
            modtype = Earthdawn.getAttrBN( this.charID, pre + "Mod-Type", "Action");
            armortype = Earthdawn.getAttrBN( this.charID, pre + "ArmorType", "PA");
            this.misc[ "succMsg" ] = Earthdawn.getAttrBN( this.charID, pre + "SuccessText", "");
            if(Earthdawn.getAttrBN( this.charID, pre + "Notes", "")!=="")
              this.misc[ "endNote" ] = "<b>Description</b>"+ Earthdawn.texttip("(Hover)",Earthdawn.getAttrBN( this.charID, pre + "Notes", "").replace( /\n/g, "&#013;"));
            if( modtype != "(0)")
              this.doLater += "~Karma: " + pre + ((state.Earthdawn.sheetVersion < 1.8 ) ? "Karma-Control": "Karma");
            this.doLater += "~Strain:" + (this.getValue( pre + "Strain")    // Strain from this action, aggressive attacks, called shots and split movement.
                  + (( modtype === "Attack" || modtype === "Attack CC" )
                  ? (this.getValue( "combatOption-AggressiveAttack") * Earthdawn.getAttrBN( this.charID, "Misc-AggStance-Strain", "1"))
                  + this.getValue( "combatOption-CalledShot") : 0)
                  + (( Earthdawn.getAttrBN( this.charID, pre + "Action", "Standard") === "Standard" ) ? this.getValue( "combatOption-SplitMovement") : 0));
            special = Earthdawn.getAttrBN( this.charID, pre + "Special", "None");
            if( special && special !== "None" )
              this.misc[ "Special" ] = special;
            if( special === "Recovery" || special === "RecoveryCost") {
              if (Earthdawn.getAttrBN( this.charID, "NPC", "0") != Earthdawn.charType.mook) {
                let aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "Recovery-Tests" }, 0, 2);
                if( (aobj.get( "current" ) || 0) <= 0) {
                  this.chat( this.tokenInfo.name + " does not have a Recovery Test to spend.", Earthdawn.whoFrom.apiWarning );
                  return;
                } else
                  Earthdawn.setWithWorker( aobj, "current", Earthdawn.parseInt2( aobj.get( "current" )) -1 );
              }
            }
            if( special === "Recovery" )        // Recovery Test
              this.bFlags |= Earthdawn.flags.Recovery;

            this.misc[ "rollWhoSee" ] = pre + "RollType";
                      let tType = Earthdawn.getAttrBN( this.charID, pre + "Target", "None");
            if( Earthdawn.getAttrBN( this.charID, "condition-Blindsided", "0") === "1" && tType.startsWith( "Ask:" ) && tType.slice( 6,7) === "D" )
              this.chat( "Warning! Character " + this.tokenInfo.name + " is Blindsided. Can he take this action?", Earthdawn.whoFrom.apiWarning );

            switch( special ) {
              case "Recovery":    this.misc[ "headcolor" ] = "recoveryrep";   break;
              case "Initiative":  this.misc[ "headcolor" ] = "initrep";       break;
              case "Knockdown":   this.misc[ "headcolor" ] = "knockdown";     break;
              default:
              switch( modtype ) {
                case "Action":    this.misc[ "headcolor" ] = "action";        break;
                case "Effect":    this.misc[ "headcolor" ] = "effect";        break;
                case "Attack":    this.misc[ "headcolor" ] = "attack";        break;
                case "Attack CC": this.misc[ "headcolor" ] = "attackcc";      break;
                case "Damage":    this.misc[ "headcolor" ] = "damage";        break;
                case "Damage CC": this.misc[ "headcolor" ] = "damagecc";      break;
                default:    this.misc[ "headcolor" ] = "none";
            }  }

            if( tType && tType !== "None" )
              if( tType.startsWith( "Ask" ))
                this.misc[ "targettype" ] = tType.substring( 0, tType.lastIndexOf( ":" ));
              else if( tType.slice( 1, 3) === "D1")     // PD1, MD1, and SD1, go to just the first two characters.
                this.misc[ "targettype" ] = tType.slice( 0, 2);
              else if( tType.startsWith( "Riposte" ))
                this.misc[ "targettype" ] = "Riposte";
              else
                this.misc[ "targettype" ] = tType;

            if( Earthdawn.getAttrBN( this.charID, pre + "ActnEfct", "1" ) === "1") {    // 1 is action, -1 is effect, 0 is no roll.
              if( Earthdawn.getAttrBN( this.charID, "combatOption-DefensiveStance", "0" ) === "1" )
                if ( Earthdawn.getAttrBN( this.charID, pre + "Defensive", "0" ) === "1" ) {
                  step += Earthdawn.getAttrBN( this.charID, "Misc-DefStance-Penalty", "3", true );      // Since this talent is defensive, we need to add this value that has already been subtracted out back in.
                  this.misc[ "Defensive" ] = true;  // Since step was modified for being defensive, tell people.
                }
              if( Earthdawn.getAttrBN( this.charID, "condition-KnockedDown", "0" ) === "1" )
                if( Earthdawn.getAttrBN( this.charID, pre + "Resistance", "0" ) === "1" ) {
                  step += 3;
                  this.misc[ "Resistance" ] = true;
            }   }
            if( state.Earthdawn.sheetVersion < 1.8 ) {
              if( Earthdawn.getAttrBN( this.charID, pre + "NotMoveBased", "0" ) != "1" ) {    // Unlike the above two, these two have not already been subtracted from the step, so we need to subtract them now.
                let tstep = Earthdawn.getAttrBN( this.charID, "condition-ImpairedMovement", "0" );
                if( tstep > 0 ) {
                  step -= tstep;
                  this.misc[ "MoveBased" ] = (tstep == 2) ? "Partial" : "Full";
              } }
              if( Earthdawn.getAttrBN( this.charID, pre + "NotVisionBased", "0" ) != "1" ) {
                let tstep = Earthdawn.getAttrBN( this.charID, "condition-Darkness", "0" );
                if( tstep > 0 ) {
                  step -= tstep;
                  this.misc[ "VisionBased" ] = (tstep == 2) ? "Partial" : "Full";
              } }
            } else {
              if( Earthdawn.getAttrBN( this.charID, pre + "MoveBased", "0" ) == "1" ) {
                let tstep = Earthdawn.getAttrBN( this.charID, "condition-ImpairedMovement", "0" );
                if( tstep > 0 ) {
                  step -= tstep;
                  this.misc[ "MoveBased" ] = (tstep == 2) ? "Partial" : "Full";
              } }
              if( Earthdawn.getAttrBN( this.charID, pre + "VisionBased", "0" ) == "1" ) {
                let tstep = Earthdawn.getAttrBN( this.charID, "condition-Darkness", "0" );
                if( tstep > 0 ) {
                  step -= tstep;
                  this.misc[ "VisionBased" ] = (tstep == 2) ? "Partial" : "Full";
              } }
            }
            this.misc[ "sayTotalSuccess" ] = Earthdawn.getAttrBN( this.charID, pre + "sayTotalSuccess", "0" ) == "1";
          } break;
          case "ska":
          case "skc":
            def_attr = "Cha";
            this.misc[ "rollWhoSee" ] = pre + "RollType";
            this.misc[ "headcolor" ] = "action";
            break;
          case "skk":
            this.doLater += "~Karma: kcdef: -1: " + pre + (state.Earthdawn.sheetVersion < 1.8 ) ? "Karma-Control": "Karma";
            def_attr = "Per";
            this.misc[ "rollWhoSee" ] = pre + "RollType";
            this.misc[ "headcolor" ] = "action";
            break;
          case "wpn":
            stepAttrib = (state.Earthdawn.sheetVersion < 1.8 ) ? "Base" : "Effective-Rank";
            let strain = this.getValue( pre + "Strain");
            if (state.Earthdawn.sheetVersion < 1.8 )
              this.doLater += "~Karma: kcdef: -1: " + pre + "Karma-Control" + (strain ? "~Strain:" + strain : "");
            else
              this.doLater += "~Karma: " + pre + "Karma" + (strain ? "~Strain:" + strain : "");
                      def_attr = "Str";
            if (state.Earthdawn.gED)
              modtype = ((Earthdawn.getAttrBN( this.charID, pre + "CloseCombat", "1" ) == "1") ? "Damage CC": "Damage" );
            else {    // WPN_Type exists in 1879 only
              let typ = Earthdawn.getAttrBN( this.charID, pre + "Type", "0" );
              switch (typ) {
                case "0": case "1":
                  modtype = "Damage CC";
                  break;
                case "2": case "3":
                  modtype = "Damage";
                  break;
                case "4": case "5":
                  modtype = "Damage Firearm";
                  def_attr = "0";
                  break;
            } }
            this.misc[ "headcolor" ] = ((Earthdawn.getAttrBN( this.charID, pre + "CloseCombat", "1" ) == "1") ? "damagecc": "damage" );;
            armortype = "PA";
            break;
          default:
            this.chat( "Error! Action() parameter ssa[1] not 'T', 'NAC', 'SK', 'SKA', 'SKK', or 'WPN'. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError );
        } // end case ssa[1]

        if( modtype === undefined )
          modtype = "Action";
        else if (modtype.startsWith( "Attack" ))
          this.Bonus( [ 0, "Adjust-Attacks-Bonus" ] );
        else if (modtype.startsWith( "Damage" ))
          this.Bonus( [ 0, "Adjust-Damage-Bonus" ] );
        this.misc[ "ModType" ] = modtype;
        this.misc[ "rsPrefix" ] = pre;

        if( armortype !== undefined && armortype !== "N/A" && modtype.startsWith( "Damage" ))
          switch ( armortype.trim().toLowerCase() ) {
            case "pa":      this.bFlags |= Earthdawn.flagsArmor.PA;     break;
            case "ma":      this.bFlags |= Earthdawn.flagsArmor.MA;     break;
            case "pa-nat":  this.bFlags |= Earthdawn.flagsArmor.PA | Earthdawn.flagsArmor.Natural;    break;
            case "ma-nat":  this.bFlags |= Earthdawn.flagsArmor.MA | Earthdawn.flagsArmor.Natural;    break;
            case "na":
            case "noarmor":
            case "none":    this.bFlags |= Earthdawn.flagsArmor.None;     break;
            case "unknown":
            case "unk":     this.bFlags |= Earthdawn.flagsArmor.Unknown;  break;
          }

                  // First we want to know what attribute this action uses, and what it's value is.
        let attr, modtypevalue;
        if( ssa[1] !== "skk" && ssa[1] !== "skac" && ssa[1] !== "skc" && ssa[1] !== "wpn" )
            attr = Earthdawn.getAttrBN( this.charID, pre + "Attribute", undefined);
        if( attr === undefined )
            attr = def_attr;
        if( attr != "0" && attr !== "" && attr !== undefined) {              // There is an attribute other than "None".     Find it's value.
            step += this.getValue( attr + "-Step");
            step += this.getValue( attr + "-Mods");
        }

        if( modtype.search( /Armor/ ) != -1 )         // "@{Adjust-All-Tests-Total}+(-1*@{Armor-IP})"
          modtypevalue = this.getValue( "Adjust-All-Tests-Total" )
                + (Earthdawn.getAttrBN( this.charID, "condition-KnockedDown", "0" ) == "1" ? 3 : 0)     // Armor-IP is almost certainly jump-up, so back out knocked down penalty.
                - this.getValue( "Armor-IP" );
        else if( modtype.search( /Init/ ) != -1 )   // "@{Adjust-Effect-Tests-Total}+@{Initiative-Mods}"
          modtypevalue = this.getValue( "Adjust-Effect-Tests-Total" ) + this.getValue( "Initiative-Mods") + this.getValue( "Initiative-Mods-Auto");
        else if (modtype == "0" || modtype == "(0)")
          modtypevalue = 0;
        else if( modtype.search( /Action/ ) != -1 )
          modtypevalue = this.getValue( "Adjust-All-Tests-Total" );
        else if( modtype.search( /Effect/ ) != -1 )
          modtypevalue = this.getValue( "Adjust-Effect-Tests-Total" );
        else {
          let postfix = modtype.endsWith( "CC" ) ? "-CC" : "";
          if( modtype.search( /Attack/ ) != -1 )
            modtypevalue = this.getValue( "Adjust-Attacks-Total" + postfix );
          else if( modtype.search( /Damage/ ) != -1 )
            modtypevalue = this.getValue( "Adjust-Damage-Total" + postfix );
        }
//          modtypevalue = this.getValue( modtype.replace( /[@\(\{\}\)]/g, ""));    // Old, no longer valid.

        this.misc[ "step" ] = (this.misc[ "step" ] || 0) + step + modtypevalue + this.getValue( pre + stepAttrib) + this.getValue( pre + "Mods" ) - this.mookWounds();
        this.misc[ "ModValue" ] = modtypevalue;
        this.misc[ "reason" ] = Earthdawn.getAttrBN( this.charID, pre + "Name", "").trim() + ((ssa[ 1 ] === "wpn") ? " damage" : "");
        let newssa = ssa.splice( 2);
        if ( special != undefined && special == "Initiative" ) {
          if( Earthdawn.getAttrBN( this.charID, "Creature-Ambushing", "0" ) == "1" )
            this.misc[ "step" ] += Earthdawn.getAttrBN( this.charID, "Creature-Ambush", "0", true );
          newssa[ 0 ] = "Init";
          this.Roll( newssa );
        } else if ( modtype == "(0)" ) {      // this is No Roll
          this.doNow();
          if( "strain" in this.misc && this.misc[ "strain" ] > 0 )
            this.misc[ "subheader" ] = this.misc[ "strain" ] + " strain.";
          this.rollFormat( this.WhoSendTo());
/*
          this.chat( ((("step" in this.misc) && this.misc[ "step" ] > 0) ? ("For rank " + this.misc[ "step" ] + " ") : "" )
                + (this.misc[ "reason" ].endsWith( " Test") ? this.misc[ "reason" ].slice(0,-5) : this.misc[ "reason" ]) + ": "
                + ("strain" in this.misc ? "   Strain: " + this.misc[ "strain" ] + ".   " : "" )
                + ("succMsg" in this.misc ? "   " + this.misc[ "succMsg" ] : "")
                + ("endNote" in this.misc ? "   " + this.misc[ "endNote" ] : "")
                + ("endNoteSucc" in this.misc ? "   " + this.misc[ "endNoteSucc" ] : "")
                + ("endNoteFail" in this.misc ? "   " + this.misc[ "endNoteFail" ] : ""));
*/
        } else {
          newssa[ 0 ] = "Roll";
          this.ForEachHit( newssa );
        }
      } catch(err) { this.edClass.errorLog( "ED.Action() error caught: " + err ); }
    } // End ParseObj.Action()



            // ParseObj.Bonus ( ssa )
            // Add a bonus dice to the next roll.
            // ssa is an array that holds the parameters.
            //      1 - Step of the bonus dice (defaults to step 0).
    this.Bonus = function( ssa ) {
      'use strict';
      try {
        let kstep = 0;
        if( ssa.length > 1 )
            kstep = this.getValue( ssa[ 1 ] );

        if( kstep > 0 ) {       // do we really have a bonus dice?
          this.misc[ "effectiveStep" ] = (("effectiveStep" in this.misc) ? this.misc[ "effectiveStep" ] : 0 ) + kstep;
          let t = this.edClass.StepToDice( kstep );
          this.misc[ "bonusStep" ] = ( ("bonusStep" in this.misc) ? this.misc[ "bonusStep" ] + "+" : "" ) + kstep;
          this.misc[ "bonusDice" ] = ( ("bonusDice" in this.misc) ? this.misc[ "bonusDice" ] : "" ) + "+" + t;
        }
      } catch(err) { this.edClass.errorLog( "ED.Bonus() error caught: " + err ); }
    } // End ParseObj.Bonus() ssa )



          // ParseObj.CalculateStep()
          // This subroutine has a purpose similar to Lookup, but the processing needed is to complex to be passed on the command line.
          // So we are passed an identifier in ssa [ 1 ] which tells us what needs to be calculated.
          // This routine looks up whatever info is needed and performs the calculation.
          // Anything after ssa[1] is added to this total.
          // The results are put in this.misc.step.
          //
          // So far this routine can calculate:
          //    Jump-up step
    this.calculateStep = function( ssa )  {
      'use strict';
      try {
        if( ssa.length < 2 ) {
            this.chat( "Error! calculateStep() not passed a value to lookup. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError );
            return false;
        }
        if( this.charID === undefined ) {
            this.chat( "Error! charID undefined in calculateStep(). Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError);
            return false;
        }

        var lu = 0;
        switch ( ssa[ 1 ].toLowerCase() ) {
        case "jumpup":
            lu = Earthdawn.getAttrBN( this.charID, "Dex", 5, true );      // This includes All-Tests-Total.
            lu += Earthdawn.getAttrBN( this.charID, "condition-KnockedDown", "0", true ) * 3;
            lu -= Earthdawn.getAttrBN( this.charID, "Armor-IP", 0, true ) + this.mookWounds();    // Note that this is only Armor-IP, not shield or misc mods.
        break;
        } // End switch

        lu += this.ssaMods( ssa, 2);
        this.misc[ "step" ] = ( this.misc[ "step" ] || 0) + lu;
      } catch(err) { this.edClass.errorLog( "ED.calculateStep() error caught: " + err ); }
      return false;
    } // End calculateStep()



          // ParseObj.chat()
          // For handyness, we have a version of this in both edClass and edParse.
          // Just call the edClass one.
    this.chat = function ( newMsg, iFlags, customFrom ) {
      'use strict';
      this.edClass.chat( newMsg, iFlags, customFrom, this );
    }; // end chat()



          // ParseObj.ChatMenu()
          // We have a request to display a menu in the chat window.
          // attrib, damage, editspell2: (dur, MenuAddExtraThread, AddExtraThread, MenuRemoveExtraThread, RemoveExtraThread),
          // fxSet: (sequnce of submenus), gmstate / gmspecial, gmStateLink, grimoire, help, languages, link, linkAdd1, linkAdd2, linkRemove, linkRemoveHalf,
          // oppmnvr, skills, spells, status, talents.
    this.ChatMenu = function( ssa )  {
      'use strict';
      try {
        let edParse = this,
          lst,
          id,
          s = "",
          ind = 0;

        function addSheetButtonCall( label, item, tip ) {
          s += Earthdawn.makeButton( label,
              "!Earthdawn~ foreach: st: tuc~ SetAttrib: " + item + ":?{" + Earthdawn.getParam(label, 1, " ")
              + Earthdawn.constant( "pipe" ) + Earthdawn.constant( "at" ) + Earthdawn.constant( "braceOpen" ) + "selected"
              + Earthdawn.constant( "pipe" ) + item + Earthdawn.constant( "braceClose" ) + "}", tip, Earthdawn.Colors.dflt, Earthdawn.Colors.dfltfg );
        }
        function addButtonWithCharID( label, item, tip, color ,colorfg) {
          s += Earthdawn.makeButton( label, "!Earthdawn~ charID: " + edParse.charID + "~ " + item, tip, color, colorfg);
        }
        function buildLabel( label, item ) {      // builds a label that is the label text in the first param, and the looked up value of the 2nd param.
          if( !item )
            item = label;
          if( id ) {
            let t = edParse.getValue(item, id);
            if( _.isNumber( t ) )
              return label + " " + t.toString();
          }
          return label;
        }


        switch (ssa[ 1 ].toLowerCase()) {
          case "attrib": {
            lst = this.getUniqueChars( 1 );
            if ( _.size( lst) === 1 )
              for( let k in lst )
                id = k;
            addSheetButtonCall( buildLabel( "Actn Tests", "Adjust-All-Tests-Misc" ), "Adjust-All-Tests-Misc", "Adjust the modifier to all Action Tests." );
            addSheetButtonCall( buildLabel( "Efct Tests", "Adjust-Effect-Tests-Misc" ), "Adjust-Effect-Tests-Misc", "Adjust the modifier to all Effect Tests." );
            addSheetButtonCall( buildLabel( "TN", "Adjust-TN-Misc" ), "Adjust-TN-Misc", "Adjust the modifier to all Action Target Numbers." );
            addSheetButtonCall( buildLabel( "Defenses", "Adjust-Defenses-Misc" ), "Adjust-Defenses-Misc", "Adjust the modifier to Physical and Mystic (but not Social) Defenses." );
            addSheetButtonCall( buildLabel( "Attacks", "Adjust-Attacks-Misc" ), "Adjust-Attacks-Misc", "Adjust the modifier to all Close Combat Attack tests." );
            addSheetButtonCall( buildLabel( "Damage", "Adjust-Damage-Misc" ), "Adjust-Damage-Misc", "Adjust the modifier to all Close Combat Damage tests." );
            addSheetButtonCall( buildLabel( "Bonus Attacks", "Adjust-Attacks-Bonus" ), "Adjust-Attacks-Bonus", "Adjust the bonus step added to all Attacks." );
            addSheetButtonCall( buildLabel( "Bonus Damage", "Adjust-Damage-Bonus" ), "Adjust-Damage-Bonus", "Adjust the bonus step to all Damage rolls." );

            s += buildLabel( "PD" )+"&nbsp;&nbsp; ";
            s += buildLabel( "MD" )+"&nbsp;&nbsp; ";
            s += buildLabel( "SD" )+"&nbsp;&nbsp; ";
            s += buildLabel( "PA", "Physical-Armor" )+"&nbsp;&nbsp; ";
            s += buildLabel( "MA", "Mystic-Armor" )+"&nbsp;&nbsp; ";
            s += buildLabel( "Move", "Movement" )+"&nbsp;&nbsp; ";
            s += buildLabel( "Wnds", "Wounds" )+"&nbsp;&nbsp; ";
            s += buildLabel( "Dmg", "Damage" )+"&nbsp;&nbsp; ";
            if( id )
              s += "Unc " + Earthdawn.getAttrBN( id, "Damage-Unc-Rating", 20 ).toString() + "&nbsp;&nbsp; ";
            s += buildLabel( "Dth", "Damage-Death-Rating" )+"&nbsp;&nbsp; ";
            s += buildLabel( "W Thr", "Wound-Threshold" )+"&nbsp;&nbsp; ";
            s += buildLabel( "Karma" )+"&nbsp;&nbsp; ";
            if( id )
              s += "K max " + Earthdawn.getAttrBN( id, "Karma_max", 0 ).toString() + "&nbsp;&nbsp; ";
            s += buildLabel( "DP" )+"&nbsp;&nbsp; ";
            if( id )
              s += "DP max " + Earthdawn.getAttrBN( id, "DP_max", 0 ).toString() + "&nbsp;&nbsp; ";

            s += Earthdawn.makeButton( buildLabel( "Dex" ),
                  "!edToken~ " + Earthdawn.constant( "percent" ) + "{selected|Dex-Check}", "Dex Action test", Earthdawn.Colors.action, Earthdawn.Colors.actionfg );
            s += Earthdawn.makeButton( buildLabel( "FX", "Dex-Effect" ),
                  "!edToken~ " + Earthdawn.constant( "percent" ) + "{selected|Dex-Effect-Check}", "Dex Effect test", Earthdawn.Colors.effect, Earthdawn.Colors.effectfg );
            s += Earthdawn.makeButton( buildLabel( "Str" ),
                  "!edToken~ " + Earthdawn.constant( "percent" ) + "{selected|Str-Check}", "Str Action test", Earthdawn.Colors.action, Earthdawn.Colors.actionfg );
            s += Earthdawn.makeButton( buildLabel( "FX", "Str-Effect" ),
                  "!edToken~ " + Earthdawn.constant( "percent" ) + "{selected|Str-Effect-Check}", "Str Effect test", Earthdawn.Colors.effect, Earthdawn.Colors.effectfg );
            s += Earthdawn.makeButton( buildLabel( "Tou" ),
                  "!edToken~ " + Earthdawn.constant( "percent" ) + "{selected|Tou-Check}", "Toughness Action test", Earthdawn.Colors.action, Earthdawn.Colors.actionfg );
            s += Earthdawn.makeButton( buildLabel( "FX", "Tou-Effect" ),
                  "!edToken~ " + Earthdawn.constant( "percent" ) + "{selected|Tou-Effect-Check}", "Toughness Effect test", Earthdawn.Colors.effect, Earthdawn.Colors.effectfg );
            s += Earthdawn.makeButton( buildLabel( "Per" ),
                  "!edToken~ " + Earthdawn.constant( "percent" ) + "{selected|Per-Check}", "Per Action test", Earthdawn.Colors.action, Earthdawn.Colors.actionfg );
            s += Earthdawn.makeButton( buildLabel( "FX", "Per-Effect" ),
                  "!edToken~ " + Earthdawn.constant( "percent" ) + "{selected|Per-Effect-Check}", "Per Effect test", Earthdawn.Colors.effect, Earthdawn.Colors.effectfg );
            s += Earthdawn.makeButton( buildLabel( "Wil" ),
                  "!edToken~ " + Earthdawn.constant( "percent" ) + "{selected|Wil-Check}", "Will Action test", Earthdawn.Colors.action, Earthdawn.Colors.actionfg );
            s += Earthdawn.makeButton( buildLabel( "FX", "Wil-Effect" ),
                  "!edToken~ " + Earthdawn.constant( "percent" ) + "{selected|Wil-Effect-Check}", "Will Effect test", Earthdawn.Colors.effect, Earthdawn.Colors.effectfg );
            s += Earthdawn.makeButton( buildLabel( "Cha" ),
                  "!edToken~ " + Earthdawn.constant( "percent" ) + "{selected|Cha-Check}", "Charisma Action test", Earthdawn.Colors.action, Earthdawn.Colors.actionfg );
            s += Earthdawn.makeButton( buildLabel( "FX", "Cha-Effect" ),
                  "!edToken~ " + Earthdawn.constant( "percent" ) + "{selected|Cha-Effect-Check}", "Charisma Effect test", Earthdawn.Colors.effect, Earthdawn.Colors.effectfg );

            s += Earthdawn.makeButton( buildLabel( "Init", "Initiative"), "!edToken~ " + Earthdawn.constant( "percent" ) + "{selected|Dex-Initiative-Check}",
                  "Roll Initiative for this character.", Earthdawn.Colors.effect, Earthdawn.Colors.effectfg );
            s += Earthdawn.makeButton( "JumpUp", "!edToken~ " + Earthdawn.constant( "percent" ) + "{selected|JumpUp}",
                  "Make a jump-up test. 2 strain, Target #6", Earthdawn.Colors.action, Earthdawn.Colors.actionfg );
            var x;
            if( id )
              if( state.Earthdawn.sheetVersion < 1.8 )
                x = this.getValue("Str-Step", id) + this.getValue("Str-Adjust", id) + this.getValue("Str-Mods", id)
                    + this.getValue("Knockdown-Adjust", id) + this.getValue("Adjust-Defenses-Total", id);
              else
                x = this.getValue("Str-Step", id) + this.getValue("Str-Mods", id) + this.getValue("Knockdown-Adjust", id) + this.getValue("Adjust-Defenses-Total", id);
            s += Earthdawn.makeButton( "Knockdown" + (x ? "-" + x.toString() : ""),
                  "!edToken~ " + Earthdawn.constant( "percent" ) + "{selected|Knockdown}", "Make a standard Knockdown test.", Earthdawn.Colors.action, Earthdawn.Colors.actionfg );

            s += Earthdawn.makeButton( buildLabel( "Recovery", "Recovery-Step" ),
                  "!edToken~ " + Earthdawn.constant( "percent" ) + "{selected|Recovery}", "Make a Recovery test for this character.", Earthdawn.Colors.health, Earthdawn.Colors.healthfg );
            if( id )
              x = this.getValue("Recovery-Step", id) + this.getValue("Wil", id);
            s += Earthdawn.makeButton( "Recov Stun" + (x ? "-" + x.toString() : ""),
                  "!edToken~ " + Earthdawn.constant( "percent" ) + "{selected|RecoveryStun}", "Make a Stun Damage only Recovery test for this character.", Earthdawn.Colors.health, Earthdawn.Colors.healthfg );
            s += Earthdawn.makeButton( "New Day", "!Earthdawn~ charID: " + Earthdawn.constant( "at" ) + "{selected|character_id}~ ForEach: c~ Misc: NewDay",
                  "Set characters recovery tests used to zero and refill karma to max", Earthdawn.Colors.health, Earthdawn.Colors.healthfg );
            if( state.Earthdawn.sheetVersion < 1.8 )
              s += Earthdawn.makeButton( buildLabel( "Will Effect", "Will-Effect" ),
                  "!edToken~ " + Earthdawn.constant( "percent" ) + "{selected|Will-Effect-R}", "Make a Will effect for this character, useing the modifier on the combat tab.", "limegreen", "black" );
            if( state.Earthdawn.g1879 ) {
              s += Earthdawn.makeButton( buildLabel( "Language Speak", "Speak-Step" ),
                    "!edToken~ " + Earthdawn.constant( "percent" ) + "{selected|Speak-Roll}", null, Earthdawn.Colors.action, Earthdawn.Colors.actionfg );
              s += Earthdawn.makeButton( buildLabel( "Language Read/Write", "ReadWrite-Step" ),
                    "!edToken~ " + Earthdawn.constant( "percent" ) + "{selected|ReadWrite-Roll}", null, Earthdawn.Colors.action, Earthdawn.Colors.actionfg );
            }
            if( id && state.Earthdawn.gED ) {     // go through all attributes for this character and look for ones we are interested in
              let attributes = findObjs({ _type: "attribute", _characterid: id });
              _.each( attributes, function (att) {
                if (att.get("name").endsWith( "_DSP_Name" ))
                  s += Earthdawn.makeButton( att.get("current") + " " + edParse.getValue( Earthdawn.buildPre( "DSP", att.get("name") ) + "Circle", id),
                        "!edToken~ " + Earthdawn.constant( "percent" ) + "{" + id + "|" + Earthdawn.buildPre( "DSP", att.get("name") ) + "halfMagic}",
                        "Half Magic test.", Earthdawn.Colors.action, Earthdawn.Colors.actionfg );
              }); // End for each attribute.
            }
            this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "Attributes" );
          } break;  // end attrib
          case "damage": {
            s = "<br>Selected Tokens Take Dmg - ";
            s += Earthdawn.makeButton( "PA", "!Earthdawn~ setToken: @{selected|token_id}~ Damage: ?{Damage)|1}: ?{Type of damage|Damage|Stun} : PA",
                  "The Selected Token(s) take damage. Physical Armor applies.", Earthdawn.Colors.health, Earthdawn.Colors.healthfg );
            s += Earthdawn.makeButton( "MA", "!Earthdawn~ setToken: @{selected|token_id}~ Damage: ?{Damage)|1}: ?{Type of damage|Damage|Stun} : MA",
                  "The Selected Token(s) take damage. Mystic Armor applies.", Earthdawn.Colors.health, Earthdawn.Colors.healthfg );
            s += Earthdawn.makeButton( "NA", "!Earthdawn~ setToken: @{selected|token_id}~ Damage: ?{Damage)|1}: ?{Type of damage|Damage|Stun|Strain} : NA",
                  "The Selected Token(s) take damage. No Armor applies.", Earthdawn.Colors.health, Earthdawn.Colors.healthfg );
            s += Earthdawn.makeButton( "Other", "!Earthdawn~ setToken: @{selected|token_id}~ Damage: ?{Damage)|1}: ?{Type of damage|Damage|Stun|Strain} : ?{Armor| None,NA| Physical,PA| Mystic,MA| Nat PA,PA-Nat| Nat MA,MA-Nat}",
                  "The Selected Token(s) take damage, which might be of type Stun, Strain, or Normal. Armors may be applied.", Earthdawn.Colors.health, Earthdawn.Colors.healthfg );

            s += "<br>Give Dmg to Target Token - ";
            s += Earthdawn.makeButton( "PA", "!Earthdawn~ setToken: @{target|token_id}~ Damage: ?{Damage)|1}: ?{Type of damage|Damage|Stun} : PA",
                  "Give damage to a Target token. Physical Armor applies.", Earthdawn.Colors.damage, Earthdawn.Colors.damagefg );
            s += Earthdawn.makeButton( "MA", "!Earthdawn~ setToken: @{target|token_id}~ Damage: ?{Damage)|1}: ?{Type of damage|Damage|Stun} : MA",
                  "Give damage to a Target token. Mystic Armor applies.", Earthdawn.Colors.damage, Earthdawn.Colors.damagefg );
            s += Earthdawn.makeButton( "NA", "!Earthdawn~ setToken: @{target|token_id}~ Damage: ?{Damage)|1}: ?{Type of damage|Damage|Stun|Strain} : NA",
                  "Give damage to a Target token. No Armor applies.", Earthdawn.Colors.damage, Earthdawn.Colors.damagefg );
            s += Earthdawn.makeButton( "Other", "!Earthdawn~ setToken: @{target|token_id}~ Damage: ?{Damage)|1}: ?{Type of damage|Damage|Stun|Strain} : ?{Armor| None,NA| Physical,PA| Mystic,MA| Nat PA,PA-Nat| Nat MA,MA-Nat }",
                  "Give damage to a Target token, which might be of type Stun, Strain, or Normal. Armors may be applied.", Earthdawn.Colors.damage, Earthdawn.Colors.damagefg );
            lst = this.getUniqueChars( 1 );
            if ( _.size( lst) === 1 )
              for( let k in lst )
                id = k;
            if (id) {
              let t = "", t1 = "",
                attributes = findObjs({ _type: "attribute", _characterid: id });
              _.each( attributes, function (att) {
                if (att.get("name").endsWith( "_WPN_Name" ))
//                   if( Earthdawn.getAttrBN(id, att.get( "name" ).slice( 0, -5) + "_CombatSlot", "0") != "1")
                    t += Earthdawn.makeButton( att.get( "current" ),
                        "!edToken~ " + Earthdawn.constant( "percent" ) + "{" + id + "|" + att.get( "name" ).slice(0, -4) + "Roll}",
                        "Roll a Weapon Damage.", Earthdawn.Colors.damage, Earthdawn.Colors.damagefg );
                  if( att.get( "name" ).endsWith( "_Mod-Type" ) && att.get( "current" ).startsWith( "Damage" )){
                    let pre = Earthdawn.buildPre( att.get( "name" )),
                    name = Earthdawn.getAttrBN( id, pre + "Name", "" )
                  t1 += Earthdawn.makeButton( name,
                      "!edToken~ " + Earthdawn.constant( "percent" ) + "{" + id + "|" + pre + "Roll}",
                      "Roll an Ability Damage.", Earthdawn.Colors.damage, Earthdawn.Colors.damagefg );}
              }); // End for each attribute.
              if( t.length > 1 )
                s += "<br>Roll for Weapon: " + t;
              if( t1.length > 1 )
              s += "<br>Talents/Knacks: " + t1;
            }
            this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "Damage" );
          } break;  // end damage
          case "durationtracker": {
            if( ssa.length < 4) return;
            let name= ssa[ 2 ],
            dur = Earthdawn.parseInt2( ssa[ 3 ] );
            let tt = Campaign().get( "turnorder" );
            let tracker = (tt == "") ? [] : JSON.parse( tt );
            tracker.push( { id: "-1", pr: "-" + dur, custom: name, formula: "1" } );
            Campaign().set( 'turnorder' ,JSON.stringify( tracker ));
          } break; //end duration tracker
          case "editspell2": {
            let nm = Earthdawn.buildPre( "SP", ssa[ 2 ]);
            switch ( ssa[ 3 ] ) {
              case "Dur": {
                let dur = "";
                if( ssa[ 4 ] != "Nothing" )
                  dur += ssa[ 4 ] + " ";
                if( ssa[ 5 ] > 0 )
                  dur += (( dur.length > 0 ) ? "+" : "") + ssa[ 5 ] + " ";
                dur += ssa[ 6 ];
                this.setWW( "Duration", nm + dur );
                s = "Duration updated";
              } break;  // end Dur
              case "MenuAddExtraThread": {
                addButtonWithCharID( "ET Add Target", "chatMenu: editSpell2: " + ssa[ 2 ] + ": AddExtraThread: Add Tgt (+?{How many Additional Targets or Additional Effects|Rank})", null, Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                addButtonWithCharID( "ET Inc Area", "chatMenu: editSpell2: " + ssa[ 2 ] + ": AddExtraThread: Inc Area (?{How much increased area|2 Yards})", null, Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                addButtonWithCharID( "ET Inc Dur (minutes)", "chatMenu: editSpell2: " + ssa[ 2 ] + ": AddExtraThread: Inc Dur (min)", null, Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                addButtonWithCharID( "ET Inc Dur", "chatMenu: editSpell2: " + ssa[ 2 ] + ": AddExtraThread: Inc Dur (?{How many units})", null, Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                addButtonWithCharID( "ET Inc Effect Step", "chatMenu: editSpell2: " + ssa[ 2 ] + ": AddExtraThread: Inc Efct Step (?{How many units|2})", null, Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                addButtonWithCharID( "ET Inc Effect (other)", "chatMenu: editSpell2: " + ssa[ 2 ] + ": AddExtraThread: Inc Efct (Other) (?{How many units|2})", null, Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                addButtonWithCharID( "ET Inc Range", "chatMenu: editSpell2: " + ssa[ 2 ] + ": AddExtraThread: Inc Rng (?{How many units|10 yards})", null, Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                addButtonWithCharID( "ET Special", "chatMenu: editSpell2: " + ssa[ 2 ] + ": AddExtraThread: Special (?{What is the text of the Extra Thread Effect})", null, Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                addButtonWithCharID( "ET Remove Targets", "chatMenu: editSpell2: " + ssa[ 2 ] + ": AddExtraThread: Rmv Tgt (?{How many targets to remove|-Rank})", null, Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                addButtonWithCharID( "ET Not Applicable", "chatMenu: editSpell2: " + ssa[ 2 ] + ": AddExtraThread: NA", null, Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
              }   break;  // end MenuAddExtraThread
              case "AddExtraThread": {
                let aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: nm + "ExtraThreads" }, "");
                let et = "," + aobj.get( "current" ) + ",";
                if( et.length < 4 )
                  et = ",";
                Earthdawn.set( aobj, "current", (et + ssa[ 4 ] + ",").slice( 1, -1 ));
                s = "Updated";
              } break;  // end AddExtraThread
              case "MenuRemoveExtraThread": {
                let et = Earthdawn.getAttrBN( this.charID, nm + "ExtraThreads", "" );
                let aet = et.split( "," );
                for( let i = 0; i < aet.length; ++i )
                  if( aet[ i ].trim().length > 0 )
                    addButtonWithCharID( "Remove " + aet[ i ].trim(), "chatMenu: editSpell2: " + ssa[ 2 ] + ": RemoveExtraThread: " + aet[ i ].trim(), null, Earthdawn.Colors.param2 , Earthdawn.Colors.param2fg);
              } break;  // end MenuRemoveExtraThread
              case "RemoveExtraThread": {
                let aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: nm + "ExtraThreads" }, "");
                let et = "," + aobj.get( "current" ).trim() + ",";
                let net = et.replace( "," + ssa[ 4 ] + ",", "," );
                if( et != net ) {
                  Earthdawn.set( aobj, "current", net.slice( 1, -1 ));
                  s = "Updated";
                }
              }   break;  // end RemoveExtraThread
            } // end switch ssa[ 3 ] within editspell2
            if( s.length > 1 )
              this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "Edit Spell: "
                  + Earthdawn.getAttrBN( this.charID, Earthdawn.buildPre( "SP", ssa[ 2 ] ) + "Name", "" ));
          } break;  // end editSpell2
          case "fxset": {   // chatMenu: fxSet: (subMenu): (code): (rowID): [additional parameters already specified in previous menus]
                    // This is a sequence of menus. subMenu 1 is the first question, subMenu 2 is the 2nd etc. Each submenu adds it's parameter to what has already been collected.
                    // Starting at ssa[5] they are [Set/Clear]: When (Attempt/Success): What Effect: Color: Where does effect appear.
            let pre = Earthdawn.buildPre( ssa[ 3 ], ssa[ 4 ]),
              submenu = ssa[ 2 ],
              ttip = "Special Effects appear on the virtual table top when this action is performed. They are set via a series of questions here in the chat window. Answer each question in turn.";
            ssa[ 2 ] = Earthdawn.parseInt2( submenu ) + 1;
            let already = ssa.join( ":" );
            switch (submenu) {
              case "0":   // set or Clear
                addButtonWithCharID( "Set FX",   already + ": Set", "  This sets a new Special Effect, replacing any old FX.", Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                addButtonWithCharID( "Clear FX", "fxSet: " + ssa[ 3 ] + ": " + ssa[ 4 ] + ": Clear", "  This removes any Special Effects for this ability.", Earthdawn.Colors.param2 , Earthdawn.Colors.param2fg);
                break;
              case "1":     // When does this FX display.
                s += "  When should this Effect be displayed?  Every time the ability is ";
                addButtonWithCharID( "Attempted", already + ": Attempt", "  Effect will be displayed every time the ability is attempted, whether it succeeds or not.", Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                s += " or only when it ";
                addButtonWithCharID( "Succeeds",  already + ": Success", "  Effect will be displayed only when the ability succeeds.", Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                break;
              case "2":
                s += "  What type of effect? ";
                addButtonWithCharID( "Beam",     already + ": Beam",     "  A beam effect (and other buttons of this color) travels from the caster to one or more targets.", Earthdawn.Colors.param2 , Earthdawn.Colors.param2fg);
                addButtonWithCharID( "Bomb",     already + ": Bomb",     "  A bomb effect (and other buttons of this color) takes place ether at the caster location, or the target locations.", Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                addButtonWithCharID( "Breath",   already + ": Breath",   "  A breath effect (and other buttons of this color) travels from the caster to one or more targets.", Earthdawn.Colors.param2 , Earthdawn.Colors.param2fg);
                addButtonWithCharID( "Bubbling", already + ": Bubbling", "  A bubbling effect (and other buttons of this color) takes place ether at the caster location, or the target locations.", Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                addButtonWithCharID( "Burn",     already + ": Burn",     "  A burn effect (and other buttons of this color) takes place ether at the caster location, or the target locations.", Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                addButtonWithCharID( "Burst",    already + ": Burst",    "  A burst effect (and other buttons of this color) takes place ether at the caster location, or the target locations.", Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                addButtonWithCharID( "Explode",  already + ": Explode",  "  An explode effect (and other buttons of this color) takes place ether at the caster location, or the target locations.", Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                addButtonWithCharID( "Glow",     already + ": Glow",     "  A glow effect (and other buttons of this color) takes place ether at the caster location, or the target locations.", Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                addButtonWithCharID( "Missile",  already + ": Missile",  "  An missile effect (and other buttons of this color) takes place ether at the caster location, or the target locations.", Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                addButtonWithCharID( "Nova",     already + ": Nova",     "  A nova effect (and other buttons of this color) takes place ether at the caster location, or the target locations.", Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                addButtonWithCharID( "Splatter", already + ": Splatter", "  A splatter effect (and other buttons of this color) travels from the caster to one or more targets.", Earthdawn.Colors.param2 , Earthdawn.Colors.param2fg);
                addButtonWithCharID( "Other/Custom", already + ": Custom ?{Name of Custom FX}",
                    + "  In order to create your own custom FX, first select the FX Tool (lightning bolt) from the left toolbar, then select the "
                    + "'[New Custom FX]' option under the '--Custom FX--.  Read the help wiki (above) for additional instructions.' header.", Earthdawn.Colors.param2 , Earthdawn.Colors.param2fg);
                s += "   For more information "
                    + Earthdawn.makeButton( "FX Help Wiki", "https://help.roll20.net/hc/en-us/articles/360037258714-F-X-Tool#F/XTool-CustomFXTool",
                    "This button will open Roll20's help page for custom Special Effects.   Important! Open this in a new tab, not this tab.",
                    Earthdawn.Colors.dflt, Earthdawn.Colors.dfltfg, true );
              break;
              case "3":   // Color.   Also, if last one was a Custom Effect, verify that it is Good.
                if( ssa[ 7 ].startsWith( "Custom" ) ) {
                  let cust = findObjs({ _type: 'custfx', name: ssa[ 7 ].slice( 7 ).trim() })[0];
                  if( cust && cust.get( "_id" )) {
                    ssa[ 8 ] = "";    // This is to fall though to the next question with this question left blank.
                    ssa[ 2 ] = Earthdawn.parseInt2( submenu ) + 2;
                    already = ssa.join( ":" );
                  } else {
                    this.chat( "Error! Can not find a Custom FX of name: '" + ssa[ 7 ].slice(7) + "'.", Earthdawn.whoFrom.apiWarning | Earthdawn.whoFrom.noArchive );
                    return;
                  }
                } else {
                  s += "  What color of effect ";
                  addButtonWithCharID( "Acid",  already + ": Acid",  "  Acid effects are a dark green.", Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                  addButtonWithCharID( "Blood", already + ": Blood", "  Blood effects are crimson.", Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                  addButtonWithCharID( "Charm", already + ": Charm", "  Charm effects are a light purple.", Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                  addButtonWithCharID( "Death", already + ": Death", "  Death effects are black.", Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                  addButtonWithCharID( "Fire",  already + ": Fire",  "  Fire effects are a mix of red and orange.", Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                  addButtonWithCharID( "Frost", already + ": Frost", "  Frost effects are a mix of white and blue.", Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                  addButtonWithCharID( "Holy",  already + ": Holy",  "  Holy effects are a light yellow.", Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                  addButtonWithCharID( "Magic", already + ": Magic", "  Magic effects are a mix of many differnt colors with black and blue predominating.", Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                  addButtonWithCharID( "Slime", already + ": Slime", "  Slime effects are a sickly green.", Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                  addButtonWithCharID( "Smoke", already + ": Smoke", "  Smoke effects are white.", Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                  addButtonWithCharID( "Water", already + ": Water", "  Water effects are sea blue.", Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                  break;
                }   // Note the top option falls through here.
              case "4":     // Where effect appears.
                let ss2 = Array.from( ssa );    // Force a new instance
                ss2.splice( 0, 1);
                ss2.splice( 1,1);   // We get rid of chatMenu, keep fxSet, get rid of sub-menu, Deep code, RowID and everytghing else.
                already = ss2.join( ":" );
                s += "  Where does the Effect appear? ";
                let typ = ss2[ 5 ].toLowerCase();
                if( typ !== "beam" && typ !== "breath" && typ !== "splatter" ) {
                  addButtonWithCharID( "Caster Only",           already + ": CO",    "  The effect appears on the token taking the action.", Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                  addButtonWithCharID( "First Target Only",     already + ": FTO",   "  The effect appears only on the first target.", Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                  addButtonWithCharID( "All Targets",           already + ": AT",    "  The effect appears multiple times, once on each targets.", Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                }
                if( typ === "beam" || typ === "breath" || typ === "splatter" || typ.startsWith( "custom ") ) {
                  addButtonWithCharID( "Caster to 1st Target",  already + ": CtFTO", "  The effect appears on the caster, and travels to the first target.",Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                  addButtonWithCharID( "Caster to all Targets", already + ": CtAT",  "  The effect appears multiple times, starting on the caster and traveling to each target.", Earthdawn.Colors.param , Earthdawn.Colors.paramfg);
                }
                break;
              default:
                edParse.chat( "Error! chatMenu fxSet, Invalid sub-menu: " + JSON.stringify( ssa), Earthdawn.whoFrom.apiWarning | Earthdawn.whoFrom.noArchive );
            } // end switch submenu within fxSet.
            if( s.length > 1 )
              this.chat( "Setting Special Effects for " + Earthdawn.codeToName( ssa[ 3 ] ) + " " + Earthdawn.getAttrBN( this.charID, pre + "Name", "") + ".  "
                    + (!ttip ? "" : Earthdawn.texttip( "(hover)", ttip)) + s
                    , Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive );
          } break;  // end fxSet
          case "gmspecial":
          case "gmstate": {
            if( !playerIsGM( this.edClass.msg.playerid ) )
              this.chat( "Only GM can do this stuff!", Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "gmState" );
            else {
              s += JSON.stringify( state.Earthdawn ) + "   ";
              s += Earthdawn.makeButton("Result Style", "!Earthdawn~ Misc: State: Style: ?{What roll results style do you want|Vague Roll Result,2|Vague Success (not recommended),1|Full,0}",
                  "Switch API to provide different details on roll results. Vague Roll result is suggested. It does not say what the exact result is, but says how much it was made by. Vague Success says exactly what the roll was, but does not say the TN or how close you were." ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
/*
              s += Earthdawn.makeButton("Default RollType", "!Earthdawn~ Misc: State: ?{What category of character do you want to change|NPC|Mook|PC}: ?{Should new characters of that type default to Public or GM Only rolls|Public,0|GM Only,1}",
                  "By default, PCs default to public rolls, but NPCs and Mooks default to rolls visible only by the GM. This can be changed." ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
              s += Earthdawn.makeButton("Change Edition", "!Earthdawn~ Misc: State: edition: ?{What rules Edition|Earthdawn Forth Ed,4 ED|1879 1st Ed,-1 1879|Earthdawn Third Ed,3 ED|Earthdawn First Ed,1 ED}",
                  "Switch API and Character sheet to Earthdawn 1st/3rd/4th Edition or 1879 1st Edition." ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
              s += Earthdawn.makeButton("Default Karma Ritual", "!Earthdawn~ Misc: State: KarmaRitual: ?{What should the default for each new characters Karma Ritual be set to?|Fill to max,-1|Refill by Circle,-2|Refill by Racial Modifier,-3|Refill Nothing,0|Refill 1,1|Refill 2,2|Refill 3,3|Refill 4,4|Refill 5,5|Refill 6,6|Refill 7,7|Refill 8,8|Refill 9,9|Refill 10,10}",
                  "At charcter creation each charcters Karma Ritual behavior is set to this value. By default, The 'New Day' button refills a characters Karma pool up to Full." ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
//  pre version 2.0
//            s += Earthdawn.makeButton("Token Link Options", "!Earthdawn~ Misc: State: tokenLinkNPC: ?{Change what|Show Players NPC nameplate,0x01|Show Players NPC karma,0x02|Show Players PC karma,0x04|Show Players NPC Wounds,0x08|Show Players NPC Damage,0x10}: ?{Set or Unset|Set,1|Unset,0}",
              s += Earthdawn.makeButton("Token Link Options", "!Earthdawn~ ChatMenu: gmStateLink",
                  "By default, when NPCs are linked, Nameplate and Wounds are visible to players, Damage and Karma are not. Token bars are above and not compact. This can change those defaults." ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
              s += Earthdawn.makeButton("Effect is Action", "!Earthdawn~ Misc: State: EffectIsAction: ?{Is an Effect test to be treated identically to an Action test|No,0|Yes,1}",
                  "Two schools of thought. Effect Tests are Action tests, and modifiers that affect Action Tests also affect Effect Tests, or they are not and they don't." ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
*/
              s += Earthdawn.makeButton("Curse Luck Silent", "!Earthdawn~ Misc: State: CursedLuckSilent: ?{Does the Cursed Luck Horror power work silently|No,0|Yes,1}?{Does No-pile-on-dice work silently|No,0|Yes,1}?{Does No-pile-on-step work silently|No,0|Yes,1}",
                  "Normally the system announces when a dice roll has been affected by Cursed Luck. However the possibility exists that a GM might want it's effects to be unobtrusive. When this is set to 'yes', then the program just silently changes the dice rolls." ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
              s += Earthdawn.makeButton("No Pile on - Dice", "!Earthdawn~ Misc: State: NoPileonDice: ?{Enter max number of times each die may explode. -1 to disable|-1}",
                  "If a GM desires a less lethal game, or to reduce risk in specific encounters, they can use this option to keep NPC dice from exploding too many times. This controls the maximum number of times a single dice can 'explode' (be rolled again after rolling a max result). -1 is the standard default of unlimited. "
                  + "0 means no dice will ever explode. 2 (for example) means a dice can explode twice, but not three times. This is done quietly, without announcing it to the players." ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
              s += Earthdawn.makeButton("No Pile On - Step", "!Earthdawn~ Misc: State: NoPileonStep: ?{Enter multiple of step number to limit result to. -1 to disable|-1}",
                  "If a GM desires a less lethal game, or to reduce risk in specific encounters, they can use this option to keep NPC roll results from exceeding a specific multiple the step number. If zero or -1, this is disabled and roll results are unlimited. if 1, then the dice result will never be very much greater than the step result. "
                  + "If (for example) the value is 3.5, then the result will never get very much greater than 3.5 times the step being rolled. This is done quietly, without announcing it to the players." ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
              s += Earthdawn.makeButton("API Logging", "!Earthdawn~ Misc: State: ?{What API logging event should be changed|LogStartup|LogCommandline}: ?{Should the API log this event|Yes,1|No,0}",
                  "What API events should the API log to the console?" ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
              s += Earthdawn.makeButton("Version", "!Earthdawn~ Misc: State: ?{API version or HTML version|API|HTML}: ?{Version number to store}",
                  "You can change the html or javascript version number stored in the state. This can force character sheet update routines to be run next startup." ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
              s += Earthdawn.makeButton("ToAPI", "!Earthdawn~ Misc: toAPI: ?{Set all characters to use API or noAPI|API|noAPI}",
                  "ToAPI will set all sheets to use API. FromAPI will set all sheets to use noAPI buttons and remove all Earthdawn state variables (can be run just before deactivating API or uninstalling sheet to clean things up)" ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
              this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "gmState" );
          } } break;  // end gmstate and gmspecial

          case "gmstatelink": {   // gmstate submenu for linking options.
            if( !playerIsGM( this.edClass.msg.playerid ) )
              this.chat( "Only GM can do this stuff!", Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "gmState" );
            else {
/*
              s = "Change Token Linking Options:  "
              + Earthdawn.makeButton("NPC names", "!Earthdawn~ Misc: State: tokenLink: " + Earthdawn.tokenLinkNPC.showplayers_name + ": ?{Set or Unset|Set|Unset}: NPC names",
                "Set or Unset players abilities to see NPC token Nameplates. Defaults to true" ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg)
              + ((state.Earthdawn.tokenLinkNPC & Earthdawn.tokenLinkNPC.showplayers_name) ? " true\n" : " false\n")
              + Earthdawn.makeButton("NPC karma", "!Earthdawn~ Misc: State: tokenLink: " + Earthdawn.tokenLinkNPC.showplayers_karma + ": ?{Set or Unset|Set|Unset}: NPC karma",
                "Set or Unset players abilities to see NPC token karma bar. Defaults to false" ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg)
              + ((state.Earthdawn.tokenLinkNPC & Earthdawn.tokenLinkNPC.showplayers_karma) ? " true\n" : " false\n")
              + Earthdawn.makeButton("PC karma", "!Earthdawn~ Misc: State: tokenLink: " + Earthdawn.tokenLinkNPC.showplayers_pcKarma + ": ?{Set or Unset|Set|Unset}: PC karma",
                "Set or Unset players abilities to see PCs other than their own karma bar. Defaults to false" ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg)
              + ((state.Earthdawn.tokenLinkNPC & Earthdawn.tokenLinkNPC.showplayers_pcKarma) ? " true\n" : " false\n")
              + Earthdawn.makeButton("NPC wounds", "!Earthdawn~ Misc: State: tokenLink: " + Earthdawn.tokenLinkNPC.showplayers_wounds + ": ?{Set or Unset|Set|Unset}: NPC wounds",
                "Set or Unset players abilities to see NPC token wound bar. Defaults to true." ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg)
              + ((state.Earthdawn.tokenLinkNPC & Earthdawn.tokenLinkNPC.showplayers_wounds) ? " true\n" : " false\n")
              + Earthdawn.makeButton("NPC damage", "!Earthdawn~ Misc: State: tokenLink: " + Earthdawn.tokenLinkNPC.showplayers_damage + ": ?{Set or Unset|Set|Unset}: NPC damage",
                "Set or Unset players abilities to see NPC token damage bar. Defaults to false" ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg)
              + ((state.Earthdawn.tokenLinkNPC & Earthdawn.tokenLinkNPC.showplayers_damage) ? " true\n" : " false.\n")

              + "**NPC** token bars ";
              switch (state.Earthdawn.tokenLinkNPC & Earthdawn.tokenLinkNPC.npcMask) {
                case Earthdawn.tokenLinkNPC.npcOverTop:   s += "'Overlapping top'";   break;
                case Earthdawn.tokenLinkNPC.npcOverBottom:  s += "'Overlapping bottom'";  break;
                case Earthdawn.tokenLinkNPC.npcBelow:   s += "'Below'";         break;
                default:                  s += "'Above'";         break;
              }
              s += "  set to: "
              + Earthdawn.makeButton("Above", "!Earthdawn~ Misc: State: tokenLink: " + Earthdawn.tokenLinkNPC.npcAbove + ": " + Earthdawn.tokenLinkNPC.npcMask + ": NPC bars above",
                "Set NPC Tokens to show token bars Above the token. Defaults is Above" ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg)
              + Earthdawn.makeButton("Overlap Top", "!Earthdawn~ Misc: State: tokenLink: " + Earthdawn.tokenLinkNPC.npcOverTop + ": " + Earthdawn.tokenLinkNPC.npcMask + ": NPC bars overlap top",
                "Set NPC Tokens to show token bars Overlapping the Top of the token. Defaults is Above" ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg)
              + Earthdawn.makeButton("Overlap Bottom", "!Earthdawn~ Misc: State: tokenLink: " + Earthdawn.tokenLinkNPC.npcOverBottom + ": " + Earthdawn.tokenLinkNPC.npcMask + ": NPC bars overlap bottom",
                "Set NPC Tokens to show token bars Overlapping the Bottom of the token. Defaults is Above" ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg)
              + Earthdawn.makeButton("Below", "!Earthdawn~ Misc: State: tokenLink: " + Earthdawn.tokenLinkNPC.npcBelow + ": " + Earthdawn.tokenLinkNPC.npcMask + ": NPC bars below",
                "Set NPC Tokens to show token bars Below the token. Defaults is Above" ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg)
              + "\nNPC token bars " + ((state.Earthdawn.tokenLinkNPC & Earthdawn.tokenLinkNPC.npcCompact) ? "'Compact'   " : "'Standard'   ")
              + Earthdawn.makeButton("Standard", "!Earthdawn~ Misc: State: tokenLink: " + Earthdawn.tokenLinkNPC.npcCompact + ": Unset: NPC bars standard",
                "Set NPC token bars to Standard. Defaults to Standard" ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg)
              + Earthdawn.makeButton("Compact", "!Earthdawn~ Misc: State: tokenLink: " + Earthdawn.tokenLinkNPC.npcCompact + ": Set: NPC bars compact",
                "Set NPC token bars to Compact. Defaults to Standard" ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg)

              + "\n**PC** token bars ";
              switch (state.Earthdawn.tokenLinkNPC & Earthdawn.tokenLinkNPC.pcMask) {
                case Earthdawn.tokenLinkNPC.pcOverTop:    s += "'Overlapping top'";   break;
                case Earthdawn.tokenLinkNPC.pcOverBottom: s += "'Overlapping bottom'";  break;
                case Earthdawn.tokenLinkNPC.pcBelow:    s += "'Below'";         break;
                default:                  s += "'Above'";         break;
              }
              s += "  set to: "
              + Earthdawn.makeButton("Above", "!Earthdawn~ Misc: State: tokenLink: " + Earthdawn.tokenLinkNPC.pcAbove + ": " + Earthdawn.tokenLinkNPC.pcMask + ": PC bars above",
                "Set PC Tokens to show token bars Above the token. Defaults is Above" ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg)
              + Earthdawn.makeButton("Overlap Top", "!Earthdawn~ Misc: State: tokenLink: " + Earthdawn.tokenLinkNPC.pcOverTop + ": " + Earthdawn.tokenLinkNPC.pcMask + ": PC bars overlap top",
                "Set PC Tokens to show token bars Overlapping the Top of the token. Defaults is Above" ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg)
              + Earthdawn.makeButton("Overlap Bottom", "!Earthdawn~ Misc: State: tokenLink: " + Earthdawn.tokenLinkNPC.pcOverBottom + ": " + Earthdawn.tokenLinkNPC.pcMask + ": PC bars overlap bottom",
                "Set PC Tokens to show token bars Overlapping the Bottom of the token. Defaults is Above" ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg)
              + Earthdawn.makeButton("Below", "!Earthdawn~ Misc: State: tokenLink: " + Earthdawn.tokenLinkNPC.pcBelow + ": " + Earthdawn.tokenLinkNPC.pcMask + ": PC bars below",
                "Set PC Tokens to show token bars Below the token. Defaults is Above" ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg)
              + "\nPC token bars " + ((state.Earthdawn.tokenLinkNPC & Earthdawn.tokenLinkNPC.pcCompact) ? "'Compact'  " : "'Standard'  ")
              + Earthdawn.makeButton("Standard", "!Earthdawn~ Misc: State: tokenLink: " + Earthdawn.tokenLinkNPC.pcCompact + ": Unset: PC bars standard",
                "Set PC token bars to Standard. Defaults to Standard" ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg)
              + Earthdawn.makeButton("Compact", "!Earthdawn~ Misc: State: tokenLink: " + Earthdawn.tokenLinkNPC.pcCompact + ": Set: PC bars compact",
                "Set PC token bars to Compact. Defaults to Standard" ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg);
              this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "gmState" );
*/
          } } break;  // end gmstateLink
          case "grimoire": {
            lst = this.getUniqueChars( 1 );
            for( let k in lst ) {
              id = k;
              s = "What spell? ";
              let attributes = findObjs({ _type: "attribute", _characterid: id });
              _.each( attributes, function ( att ) {
                if( att.get("name").endsWith( "_SP_Name" )) {
                  let tmpPre = Earthdawn.buildPre( att.get( "name" ));
                  let matrix = Earthdawn.getAttrBN( id, tmpPre + "spmRowID", "0" );
                  let bnot = (typeof matrix !== 'string') || (matrix.length < 2);
                  s += Earthdawn.makeButton( att.get("current"),
                      "!edToken~ " + Earthdawn.constant( "percent" ) + "{" + id + "|"
                      + tmpPre + (( state.Earthdawn.sheetVersion < 1.8 ) ? "EditButton}" : "Roll}"),
                      (bnot ? "" :"Spell in Matrix, use the Spells Menu instead! - ") + Earthdawn.getAttrBN( id, tmpPre + "SuccessText", ""),
                      bnot ? Earthdawn.Colors.param : Earthdawn.Colors.param2, bnot ? Earthdawn.Colors.paramfg : Earthdawn.Colors.param2fg );
                }
              }); // End for each attribute.
              this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive,  getAttrByName( id, "charName" ) + " - Grimoire" );
            }
          } break;  // end grimoire
          case "help": {
            s = Earthdawn.makeButton( "Wiki Link", ( state.Earthdawn.sheetVersion < 1.8 ) ? "https://wiki.roll20.net/Earthdawn_-_FASA_Official"
                  : "https://wiki.roll20.net/Earthdawn_-_FASA_Official_V2",
                  "This button will open this character sheets Wiki Documentation, which should answer most of your questions about how to use this sheet.",
                  Earthdawn.Colors.dflt,Earthdawn.Colors.dfltfg, true ) + "   Important! Open this in a new tab, not this tab.";
                      this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "API" );
          } break;  // end help
          case "inspect": {
            s = "Inspect: "
                  + Earthdawn.makeButton( "Lookup Value", "!Earthdawn~ foreach: st: tuc~ Debug: Inspect : GetValue: ?{Enter full name}",
                      "Enter an attribute name (simple or whole repeating section name), and get the value.", Earthdawn.Colors.param,Earthdawn.Colors.paramfg )
                  + Earthdawn.makeButton( "IDs from Name", "!Earthdawn~ foreach: st: tuc~ Debug: Inspect : GetIDs: ?{Enter Name fragment}",
                      "Enter a text fragment, and get IDs of every repeating section name that contains that fragment.",Earthdawn.Colors.param,Earthdawn.Colors.paramfg )
                  + Earthdawn.makeButton( "TokenObj", "!Earthdawn~ foreach: st~ Debug: Inspect : TokenObj",
                      "Test code to cause selected tokens to display TokenInfo to chat.",Earthdawn.Colors.param,Earthdawn.Colors.paramfg )
                  + Earthdawn.makeButton( "Repeating section", "!Earthdawn~ charID: ?{Char ID|@{selected|character_id}}~ Debug: Inspect: RepeatSection: ?{RowID}: ?{Detail|Short|Full}",
                      "Test code to show information on a row.",Earthdawn.Colors.param,Earthdawn.Colors.paramfg )
                  + Earthdawn.makeButton( "Object ID", "!Earthdawn~ Debug: Inspect: ObjectID: ?{Object ID}",
                      "Test code to show information on what an ID is. Character ID, Token ID, etc.",Earthdawn.Colors.param,Earthdawn.Colors.paramfg )
                  + Earthdawn.makeButton( "Statusmarkers", "!Earthdawn~ foreach: st~ Debug: Inspect : statusmarkers",
                      "Test code to cause selected tokens to display statusmarkers to Chat.",Earthdawn.Colors.param,Earthdawn.Colors.paramfg );
            this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "API" );
          } break;  // end inspect
          case "languages": {
            lst = this.getUniqueChars( 1 );
            let po = this;
            for( let k in lst ) {
              id = k;
              s = '<div>';
              let cnt = 0;
                                          // got through all attributes for this character and look for ones we are interested in
              let attributes = findObjs({ _type: "attribute", _characterid: id });
              _.each( attributes, function ( att ) {
                if( att.get( "name" ).endsWith( "_SKL_Name" )) {
                  ++cnt;
                  s += "<div><strong>";
                  s += att.get( "current" );
                  let pre = Earthdawn.buildPre( "SKL", att.get("name") );
                  s += "</strong>";
                  if( Earthdawn.getAttrBN( id, pre + "Speak", "0") == "1")
                    s += " Sk-Spk";
                  if( Earthdawn.getAttrBN( id, pre + "ReadWrite", "0") == "1")
                    s += " Sk-RW";
                  if( Earthdawn.getAttrBN( id, pre + "Speak-T", "0") == "1")
                    s += " Ta-Spk";
                  if( Earthdawn.getAttrBN( id, pre + "ReadWrite-T", "0") == "1")
                    s += " Ta-RW";
                  s += "</div>";
                }
              }); // End for each attribute.
              s += "</div>";
              if( cnt )
                po.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive,
                          getAttrByName( id, "charName" ) + " - Languages" );
            }
          } break;  // end languages
          case "link": {      // chatmenu: Link: (code - T, NAC, SK, SPM, WPN): rowID
                      // List all existing links for this rowID and ask if to be removed. And a button to add a link.
            let pre = Earthdawn.buildPre( ssa[ 2 ], ssa[ 3 ]);
            s = "Managing links for " + Earthdawn.codeToName( ssa[ 2 ] ) + " " + Earthdawn.getAttrBN( this.charID, pre + "Name", "") + ".  "
                  + Earthdawn.texttip( "(hover)", "Links are used to automatically integrate a value from another ability in the calculation of this ability. "
                  + "For example, a Free Talent or Free Matrix should be linked to a Discipline so that its Rank automatically updates when the Circle is updated. "
                  + "A Knack would be linked to the referenced Talent, so that the Knack rank automatically uses the Talent Rank. "
                  + "Links can also be used to create combos between elements, such as Surprise Short Sword, "
                  + "that could be linked with the Talent Surprise Strike and a Weapon Short Sword to get the total damage roll, "
                  + "or Tiger Dance that could be linked to Talents Tiger Spring and Air Dance to roll the combination of the 2 Talents)");

            addButtonWithCharID( "Add a Link", "ChatMenu: Linkadd1: " + ssa[ 2 ] + ": " + ssa[ 3 ] +
                  ": ?{What are we linking this to|Talent,T|Discipline,DSP|Skill,SK|Weapon,WPN|Thread Item,TI|Attribute}: "
                  + "?{Name to link to (Make sure substring is an exact match, including case. Example - Melee)}",
                  "Link this to an Talent, Discipline Circle, Skill, Weapon, Thread Item or Attribute, such that this item will use that items Rank." , Earthdawn.Colors.param, Earthdawn.Colors.paramfg);
            lst = Earthdawn.getAttrBN( this.charID, pre + "LinksGetValue", "" );
                  // repeating_talents_xxx_T_name+repeating_talents_xxx_T_name2,another
            let lst2 = Earthdawn.getAttrBN( this.charID, pre + "LinksGetValue_max", "" );
            if( lst2.length < 5 )
              lst2 = "";    // strip out any (0) that was put here.
            if( lst )
              lst = lst.split( "," );
            if( lst2 )
              lst2 = lst2.split( "," );
            if( !lst || !lst2 || lst.length == 0 )
              s += "Existing links: None.";
            else for( let i = 0; i < lst.length; ++i ) {
              let t = lst2[ i ],
                att = !t.startsWith( "repeating_" ),
                code = Earthdawn.repeatSection( 3, t );
              s += "Remove ";
              if( att )
                addButtonWithCharID( lst[ i ].trim(), "ChatMenu: LinkRemove: " + ssa[ 2 ] + ": " + ssa[ 3 ] + ": Attribute: "  + lst2[ i ], "Make this item no longer linked to this Attribute.", Earthdawn.Colors.param2, Earthdawn.Colors.param2fg);
              else {
                let tmp = "item.";
                tmp = Earthdawn.codeToName( code ) + ".";
                addButtonWithCharID( lst[ i ].trim(),
                    "ChatMenu: LinkRemove: " + ssa[ 2 ] + ": " + ssa[ 3 ] + ": " + code + ": "  + Earthdawn.repeatSection( 2, t ),
                    "Make this item no longer linked to this " + tmp, Earthdawn.Colors.param2, Earthdawn.Colors.param2fg);
            } }
                      this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "API" );
          } break;  // end link
          case "linkadd1": {      // ChatMenu: linkadd1: (code: T, NAC, SK, SPM, WPN): (rowID): (Attribute, T, SK, DSP, TI, or WPN) : (name string to search for)
                        // User has given us a string to attempt to link to. Search all entries to see if there is a match. Confirm the match.
            if( ssa.length < 6 || ssa[ 5 ].length < 2 )   // Make sure got a valid command line.
              return;
                      let attrib = (ssa[ 4 ] === "Attribute"),    skipmost = false;
            if( attrib ) {      // Check for the "real" attributes first, and if you find one, don't search for any more.
              let tar = [ "dex", "str", "tou", "per", "wil", "cha" ],
                t = ssa[ 5 ].toLowerCase(),
                effect = ( t.indexOf( "-effect" ) !== -1 ),
                step = ( t.indexOf( "-step" ) !== -1 );
              for( let i = 0; i < tar.length; ++i )
                if( t.indexOf( tar[ i ] ) !== -1 ) {
                  ssa[ 5 ] = tar[ i ].slice(0, 1).toUpperCase() + tar[ i ].slice( 1 ) + (effect ? "-Effect" : "") + (step ? "-Step" : "");
                  skipmost = true;
                }
            }
            if( !skipmost ) {
              let attributes = findObjs({ _type: "attribute", _characterid: this.charID }),
                found = [];
  //            if( ssa[ 4 ] === "T" ) {
  //              let tar = [ "SP-Spellcasting-Effective-Rank", "SP-Patterncraft-Effective-Rank", "SP-Elementalism-Effective-Rank", "SP-Illusionism-Effective-Rank",
  //                    "SP-Nethermancy-Effective-Rank", "SP-Shamanism-Effective-Rank", "SP-Wizardry-Effective-Rank", "SP-Power-Effective-Rank", "SP-Willforce-Effective-Rank" ];
  //              for( let i = 0; i < tar.length; ++i )
  //                if( tar[ i ].indexOf( ssa[ 5 ] ) !== -1 ) {
  //                  attrib = true;
  //                  ssa[ 4 ] = "Attribute";
  //                  ssa[ 5 ] = tar[ i ];
  //                }
  //            }
              if( attrib ) {
                _.each( attributes, function (att) {
                  if ( att.get( "name" ).indexOf( ssa[ 5 ] ) != -1)
                    found.push( att );
              }); // End for each attribute.
              } else {    // It is a repeating section, check each name.
                let lookfor = "_" + ssa[ 4 ] + "_Name",
                  strMatch = ssa[ 5 ].toLowerCase();
                _.each( attributes, function (att) {
                  if (att.get("name").endsWith( lookfor ) && att.get( "current").toLowerCase().indexOf( strMatch ) != -1)
                    found.push( att );
              }); } // End for each attribute.
              if( found.length == 0 ) {
                this.chat( "No matches found.", Earthdawn.whoFrom.apiWarning);
                break;
              } else if ( found.length == 1 )
                ssa[ 5 ] = attrib ? found[ 0 ].get( "name" ) : Earthdawn.repeatSection( 2, found[ 0 ].get( "name" ) );
                    // This option immediately falls into lindadd2.
              else {
                s = found.length + " matches found. Select which to Link: ";
                for( let i = 0; i < found.length; ++i )
                  addButtonWithCharID(  ssa[ 4 ] + " " + ( attrib ? found[ i ].get( "name" ) + " " : "") + found[ i ].get( "current" )
                      , "ChatMenu: Linkadd2: " + ssa[ 2 ] + ":" + ssa[ 3 ] + ": " + ssa[ 4 ] + ": "
                      + (attrib ? found[ i ].get( "name" ) : Earthdawn.repeatSection( 2, found[ i ].get( "name" ) )),
                      "Add this Link." , Earthdawn.Colors.param, Earthdawn.Colors.paramfg);
                this.chat( s.trim(), Earthdawn.whoFrom.apiWarning | Earthdawn.whoFrom.noArchive, "API" );
                break;
          } } } // end linkAdd1
          case "linkadd2": {      // User has pressed a button telling us which exact one to link to OR we fell through from above due to only finding  one candidate.
                  // Here we do the actual linking.
                  // ChatMenu: linkadd2: (code: T, NAC, SK, SPM, WPN): (rowID): (Attribute, T, SK, DSP, TI, or WPN): link rowID or attribute name
                  // First code/rowID combo is row that is making link (getting a value).
                  // Second code/rowID combo is row that is being linked to (providing a value).
                  // Can make a link   T, NAC, SK,   SPM,  WPN
                  // Can link to    T, SK, WPN, DSP, TI, attributes???.  Maybe static talents.         // note removed NAC
            if( ssa.length < 6 || ssa[ 5 ].length < 2 )   // Make sure got a valid command line.
              return;
                    // walk links. Check to make sure that nothing links back to this (or anything else in the tree).
            function walkLinks( nextCode, nextRow, badLink, nameList ) {    // Check to make sure row being linked does not reference row adding link.
              let links = Earthdawn.getAttrBN( edParse.charID, Earthdawn.buildPre( nextCode, nextRow) + "LinksGetValue_max" );
              if( links ) {
                let alinks = links.split();
                for( let i = 0; i < alinks.length; ++i ) {
                  if( alinks[ i ].indexOf( badLink ) !== -1 ) {
                    edParse.chat( "Error! attempted circular reference:  " + nameList + " to "
                        + Earthdawn.getAttrBN( edParse.charID, Earthdawn.buildPre( nextCode, nextRow) + "Name", Earthdawn.whoFrom.apiWarning ));
                    return false;
                  } else if( alinks[ i ].startsWith( "repeating_" ))
                    if ( !walkLinks( Earthdawn.repeatSection( 3, alinks[ i ]), Earthdawn.repeatSection( 2, alinks[ i ]), badLink,
                          nameList + " to " + Earthdawn.getAttrBN( edParse.charID, Earthdawn.buildPre( nextCode, nextRow) + "Name", "" )))
                      return false;
              } }
              return true;
            };  // end walkLinks()

            if( !walkLinks( ssa[ 4 ], ssa[ 5 ], ssa[ 3 ], Earthdawn.getAttrBN( this.charID, Earthdawn.buildPre( ssa[ 2 ], ssa[ 3 ]) + "Name", "" )))
              return;
            let att = (ssa[ 4 ] === "Attribute");

                  // Given a fully qualified argument name, it will Add the Display and Links.
            function linkAdd( linkName, dispAdd, linkToAdd) {
              let obj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: edParse.charID, name: linkName });
              let dlst = obj.get( "current" ),
                llst = obj.get( "max" );
              if( !llst || llst.length < 5 ) {      // there are no existing links, so we are adding the first one.
                llst = [];
                dlst = [];
              } else {        // There are existing links.
                llst = llst.split( "," );
                dlst = dlst.split( "," );
                if( llst.length != dlst.length ) {
                  edParse.chat( "Warning! internal data mismatch in linkadd2.", Earthdawn.whoFrom.apiError);
                  edParse.edClass.errorLog( "Warning! internal data mismatch in linkadd2.", Earthdawn.whoFrom.apiError);
                  edParse.edClass.errorLog( dlst);
                  log( llst);
                  llst = [];
                  dlst = [];
                }
              }
              dlst.push( dispAdd );
              llst.push( linkToAdd );
              Earthdawn.set( obj, "max", llst.join(), linkToAdd );
  //log( "setww " + obj.get( "name" ) + "   from: " + obj.get( "current" ) + "   to: " + dlst.join());
              Earthdawn.setWithWorker( obj, "current", dlst.join(), dispAdd );
//              edParse.addSWflag( "Trigger2", obj.get( "name" ));
//              edParse.addSWflag( "Trigger", obj.get( "name" ) + ": " + llst.join());
            } // end linkAdd
            let t =  att ? ssa[ 5 ] : Earthdawn.getAttrBN( this.charID, Earthdawn.buildPre( ssa[ 4 ], ssa[ 5 ] ) + "Name", "" ),
              l;
            function lnk() {
              l = "";
              for( let i = 0; i < arguments.length; ++i ) {
                let tmp = (att ? arguments[ i ] : Earthdawn.buildPre( ssa[ 4 ], ssa[ 5 ] )) + arguments[ i ];
                l += ((i === 0) ? "" : "+" ) + tmp;
              }
            };
                  // repeating_talents_xxx_T_name+repeating_talents_xxx_T_name2,another
            switch( ssa[ 4 ] ) {
              case "Attribute":   lnk( ssa[ 5 ] );        break;
              case "DSP":     lnk( "Circle" );        break;
              case "NAC":     lnk( "Step" );          break;
              case "TI":      lnk( "Rank" );          break;
              default:      lnk( "Effective-Rank" );    break;    // T, SK, WPN
            }
            linkAdd( Earthdawn.buildPre( ssa[ 2 ], ssa[ 3 ]) + "LinksGetValue",
                t.replace( /[\,|\+]/g, ""),     // absolutely can't have any commas or plus signs in the name.
                l);   // LinksGetValue are of form comma delimited list of fully qualified attributes, maybe more than one seperated by plus signs.
            if( !att )      // LinksProviceValue are comma delimited lists of form (code);(rowID).
              linkAdd( Earthdawn.buildPre( ssa[ 4 ], ssa[ 5 ]) + "LinksProvideValue",
                    Earthdawn.getAttrBN( this.charID, Earthdawn.buildPre( ssa[ 2 ], ssa[ 3 ] ) + "Name", "" ).replace( /[\,|\+]/g, ""),
                    ssa[ 2 ] + ";" + ssa[ 3 ]);
            this.chat( "Linked " + ssa[ 4 ] + "-" + t, Earthdawn.whoFrom.apiWarning | Earthdawn.whoFrom.noArchive, "API" );
            this.sendSWflag();
          } break;  // end linkAdd2
          case "linkremove":        // ChatMenu: linkRemove: (code: T, NAC, SK, SPM, WPN): (rowID): ( Attribute, T, SK, WPN, DSP, NAC, or WPN): linked rowID to be removed or Attrubite name.
          case "linkremovehalf": {    // ChatMenu: linkRemoveHalf: attribute name, rowID to remove.
                // linkRemove if the main entry point, called when the user presses a button requesting a link be removed.
                // linkRemoveHalf is a secondary entry point, called by the on destroy routine when it detects that a linked  row has been deleted, it removes the other half of the link.
            let done = 0;

                  // Given a fully qualified argument name (repeating_talents_XXX_T_LinksProvideValue), and a rowID,
                  // will remove any links matching that rowID from the named argument.
            function linkRemove( linkName, rowID, countIt ) {
              let obj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: edParse.charID, name: linkName }, "");
              let dlst = obj.get( "current" ),
                llst = obj.get( "max" );
              if( !llst || llst.length < 5 ) {      // there are no existing links.
                llst = [];
                dlst = [];
              } else {        // There are existing links.
                llst = llst.split( "," );
                dlst = dlst.split( "," );
                if( llst.length != dlst.length ) {
                  edParse.chat( "Warning! internal data mismatch in linkRemove.", Earthdawn.whoFrom.apiError);
                  edParse.edClass.errorLog( "Warning! internal data mismatch in linkRemove.", Earthdawn.whoFrom.apiError);
                  edParse.edClass.errorLog( dlst);
                  log( llst);
                  llst = [];
                  dlst = [];
                }
              }
              for( let i = llst.length - 1; i > -1; --i )
                if(llst[ i ].indexOf( rowID ) !== -1 ) {
                  llst.splice( i, 1);
                  dlst.splice( i, 1);
                  if( countIt )
                    ++done;
                }
              Earthdawn.set( obj, "max", llst.join(), "" );
  //log( "setww " + obj.get( "name" ) + "   from: " + obj.get( "current" ) + "   to: " + dlst.join());
              Earthdawn.setWithWorker( obj, "current", dlst.join(), "" );
//              edParse.addSWflag( "Trigger2", obj.get( "name" ));
//              edParse.addSWflag( "Trigger", obj.get( "name" ) + ": " + llst.join());
            } // end linkRemove


            if (ssa[ 1 ].toLowerCase() === "linkremovehalf") {
              if( ssa.length < 3 )    // Make sure got a valid command line.
                return;
              linkRemove( ssa[ 2 ], ssa[ 3 ] );
            } else {    // this is the full linkRemove
                    // Can link to    T, SK, WPN, DSP, TI, attributes???.  Maybe static talents.         // note removed NAC
              if( ssa.length < 5 || ssa[ 5 ].length < 2 )   // Make sure got a valid command line.
                return;
              let att = (ssa[ 4 ] === "Attribute");
              linkRemove( Earthdawn.buildPre( ssa[ 2 ], ssa[ 3 ]) + "LinksGetValue", ssa[ 5 ], true);
              if( !att )
                linkRemove( Earthdawn.buildPre( ssa[ 4 ], ssa[ 5 ]) + "LinksProvideValue", ssa[ 3 ], false);
              this.chat( done + " links removed.", Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive, "API" );
            }
            this.sendSWflag();
          } break;  // end linkRemove
          case "mask": {    // ChatMenu: Mask
                    // give a button for each mask present, allowing that mask to be removed.
//          addButtonWithCharID( "Add Mask", "TextImport: Mask: Add: ?{Name of Mask}: ?{Paste the entire Mask text block into here}",
//                "Use this button to add a Mask Template to this character. You will need to paste the template text block." );
            lst = Earthdawn.getAttrBN( this.charID, "MaskList", "" );
            if( lst.length < 2 )
              lst = "";   // strip out any remnant that was put here.
            if( lst )
              lst = lst.split( "," );
            if( !lst || lst.length == 0 )
              s += "Existing Masks: None.";
            else for( let i = 0; i < lst.length; ++i ) {
              s += "Remove ";
              addButtonWithCharID( lst[ i ].trim(), "TextImport: Mask: Remove: " + lst[ i ].trim(), "Remove this Mask Template from this character." , Earthdawn.Colors.param2, Earthdawn.Colors.param2fg);
            }
            this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive, "API" );
          } break;  // end Mask
          case "oppmnvr": { // Opponent Maneuverer.   Here we are just displaying a list of buttons that are possible.
                            // Called from a button on RollESbuttons(). (If have extra successes)
                            // Input string is "!Earthdawn~ chatmenu: oppmnvr: SetToken/CharID: id: target ID
            let cID = Earthdawn.tokToChar( ssa[ 2 ] ),    // NOTE: This is the Target cID. Not the acting cID.
                lst = Earthdawn.getAttrBN( cID, "ManRowIdList", "bad" ),
                pIsGM = playerIsGM( this.edClass.msg.playerid ),
                t = "";
            function makeButtonLocal( txt, lnk, es, tip ) {
              let tssa = "!Earthdawn~ setToken: " + ssa[ 2 ] + "~ OpponentManeuver: " + lnk + (es ? es : "");
              t += Earthdawn.makeButton( txt, tssa, tip, Earthdawn.Colors.damage, Earthdawn.Colors.damagefg );
            };

            let sectplayer = new HtmlBuilder( "", "", {
                style: {
                "background-color": "white",        //Earthdawn.Colors.param2,
                "border":           "solid 1px black",
                "border-radius":    "5px",
                "overflow":         "hidden",
                "width":            "100%",
                "text-align":       "left"
              }});
            if ( Earthdawn.getAttrBN( cID, "Opponent-ClipTheWing", "0", true ) > 0 )
              makeButtonLocal( "Clip the Wing", "ClipTheWing", 2,
                    "The attacker may spend two additional successes from an Attack test to remove the creature’s ability to fly until the end of the next round. If the attack causes a Wound, the creature cannot fly until the Wound is healed. If the creature is in flight, it falls and suffers falling damage for half the distance fallen." );
            if ( Earthdawn.getAttrBN( cID, "Opponent-CrackTheShell", "0", true ) > 0 )
              makeButtonLocal( "Crack the Shell", "CrackTheShell", ": ?{How many successes to spend Cracking the Shell|1}",
                    "Importaint! Press this button AFTER rolling and applying damage, then press this button to record your manuver. The attacker may spend extra successes from physical attacks (not spells) to reduce the creature’s Physical Armor by 1 per success spent. This reduction takes place after damage is assessed, and lasts until the end of combat." );
            if ( Earthdawn.getAttrBN( cID, "Opponent-Defang", "0", true ) > 0 )
              makeButtonLocal( "Defang", "Defang", ": ?{How many successes to spend Defanging|1}",
                    "The opponent may spend additional successes to affect the creature’s ability to use its poison. Each success spent reduces the Poison’s Step by 2. If the attack causes a Wound, the creature cannot use its Poison power at all until the Wound is healed." );
            if ( Earthdawn.getAttrBN( cID, "Opponent-Enrage", "0", true ) > 0 )
              makeButtonLocal( "Enrage", "Enrage", ": ?{How many successes to spend Enraging|1}",
                    "An opponent may spend additional successes from an Attack test to give a -1 penalty to the creature’s Attack tests and Physical Defense until the end of the next round. Multiple successes may be spent for a cumulative effect." );
            if ( Earthdawn.getAttrBN( cID, "Opponent-Provoke", "0", true ) > 0 )
              makeButtonLocal( "Provoke", "Provoke", undefined,
                    "The attacker may spend two additional successes from an Attack test to enrage the creature and guarantee he will be the sole target of the creature’s next set of attacks. Only the most recent application of this maneuver has any effect." );
            if ( Earthdawn.getAttrBN( cID, "Opponent-PryLoose", "0", true ) > 0)
              makeButtonLocal( "Pry Loose", "PryLoose", ": ?{How many successes to spend Prying Loose|1}",
                    "The attacker may spend additional successes from an Attack test to allow a grappled ally to immediately make an escape attempt with a +2 bonus per success spent on this maneuver." );
            if( lst !== "bad" && lst.length > 1 ) {
              let arr = lst.split( ";" );
              for( let i = 0; i < arr.length; ++i ) {
                let pre = Earthdawn.buildPre( "MAN", arr[ i ] );
                if(( Earthdawn.getAttrBN( cID, pre + "Type", "1") === "-1") && (pIsGM || ( Earthdawn.getAttrBN( cID, pre + "Show", "") === "1" ))) {    // type -1 is Opponent
                  let n = Earthdawn.getAttrBN( cID, pre + "Name", ""),
                    d = Earthdawn.getAttrBN( cID, pre + "Desc", "");
                  if( n.length > 0 || d.length > 0 )
                    makeButtonLocal( n, "Custom" + arr[ i ], ": ?{How many successes to spend on this maneuver|1}", d);
            } } }
            sectplayer.append( "", t);
            this.chat( "Opponent Maneuvers " + sectplayer.toString(), Earthdawn.whoTo.player | Earthdawn.whoFrom.player | Earthdawn.whoFrom.character | Earthdawn.whoFrom.noArchive);
          } break;  // end oppmnvr
          case "skills": {      // List out all skills that are not already token actions.
                        // Called from a macro Token action (visible when any character is selected).
            lst = this.getUniqueChars( 1 );
            for( let k in lst ) {
              id = k;
              let s1 = [], s2 = [], s3 = [];
              s = "";
                                          // go through all attributes for this character and look for ones we are interested in
              let attributes = findObjs({ _type: "attribute", _characterid: id });
              _.each( attributes, function (att) {
                if (att.get("name").endsWith( "_SK_CombatSlot" )) {
//                  if( att.get("current") != "1" )     // commenting this out shows all skills, combat slot or not.
                    s1.push( { a: Earthdawn.getAttrBN( id, Earthdawn.buildPre( "SK", att.get("name"))  + "Name", ""),
                        b: "!edToken~ " + Earthdawn.constant( "percent" ) + "{" + id + "|" + Earthdawn.buildPre( att.get("name")) + "Roll}",
                        c: Earthdawn.getAttrBN( id, Earthdawn.buildPre( att.get("name") ) + "Notes", "" ).replace( /\n/g, "&#013;") });
                } else if (att.get("name").endsWith( "_SKK_Name" )) {
                  s2.push( { a: Earthdawn.getAttrBN( id, Earthdawn.buildPre( "SKK", att.get("name") ) + "Name", ""),
                        b: "!edToken~ " + Earthdawn.constant( "percent" ) + "{" + id + "|" + Earthdawn.buildPre( att.get("name")) + "Roll}"});
                } else if (att.get("name").endsWith( "_SKA_Name" ))
                  s3.push( { a: Earthdawn.getAttrBN( id, Earthdawn.buildPre( "SKA", att.get("name") ) + "Name", ""),
                        b: "!edToken~ " + Earthdawn.constant( "percent" ) + "{" + id + "|" + Earthdawn.buildPre( att.get("name")) + "Roll}"});
              }); // End for each attribute.
              for( let j = 0; j < s1.length; ++j )
                s += Earthdawn.makeButton( s1[j].a, s1[j].b, s1[j].c, Earthdawn.Colors.action, Earthdawn.Colors.actionfg);
              for( let j = 0; j < s2.length; ++j )
                s += Earthdawn.makeButton( s2[j].a, s2[j].b, null, Earthdawn.Colors.action, Earthdawn.Colors.actionfg );
              for( let j = 0; j < s3.length; ++j )
                s += Earthdawn.makeButton( s3[j].a, s3[j].b, null, Earthdawn.Colors.action, Earthdawn.Colors.actionfg );
              s += Earthdawn.makeButton( "Languages", "!Earthdawn~ chatmenu: languages", null, Earthdawn.Colors.dflt, Earthdawn.Colors.dfltfg );
              this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive, getAttrByName( id, "charName" ) + " - Skills" );
            }
          } break;  // end Skills
          case "spells": {      // List out all the spellcasting skills, spells in matrix, and spells in grimour.
                        // Called from a macro Token Action. Visible when a character who does not have spells hidden is selected.
            lst = this.getUniqueChars( 1 );
            let s2 = "";
            for( let k in lst ) {
              id = k;
              s = "";
              if( state.Earthdawn.sheetVersion < 1.8 ) {
                s += Earthdawn.makeButton( buildLabel( state.Earthdawn.gED ? "Patterncraft" : "Magic Theory", "SP-Patterncraft-Step"),
                      "!edToken~ %{selected|SP-Patterncraft}", null , Earthdawn.Colors.action, Earthdawn.Colors.actionfg );
                if(state.Earthdawn.gED) {
                  if( edParse.getValue("SP-Elementalist", id) == "1")
                    s += Earthdawn.makeButton( buildLabel( "Elementalism", "SP-Elementalism-Step"),
                          "!edToken~ %{selected|SP-Elementalism}", null , Earthdawn.Colors.action, Earthdawn.Colors.actionfg );
                  if( edParse.getValue("SP-Illusionist", id) == "1")
                    s += Earthdawn.makeButton( buildLabel( "Illusionism", "SP-Illusionism-Step"),
                          "!edToken~ %{selected|SP-Illusionism}", null , Earthdawn.Colors.action, Earthdawn.Colors.actionfg );
                  if( edParse.getValue("SP-Nethermancer", id) == "1")
                    s += Earthdawn.makeButton( buildLabel( "Nethermancy", "SP-Nethermancy-Step"),
                          "!edToken~ %{selected|SP-Nethermancy}", null , Earthdawn.Colors.action, Earthdawn.Colors.actionfg );
                  if( edParse.getValue("SP-Shaman", id) == "1")
                    s += Earthdawn.makeButton( buildLabel( "Shamanism", "SP-Shamanism-Step"),
                          "!edToken~ %{selected|SP-Shamanism}", null , Earthdawn.Colors.action, Earthdawn.Colors.actionfg );
                  if( edParse.getValue("SP-Wizard", id) == "1")
                    s += Earthdawn.makeButton( buildLabel( "Wizardry", "SP-Wizardry-Step"),
                          "!edToken~ %{selected|SP-Wizardry}", null , Earthdawn.Colors.action, Earthdawn.Colors.actionfg );
                  if( edParse.getValue("SP-Power", id) == "1")
                    s += Earthdawn.makeButton( buildLabel( "Powers", "SP-Power-Step"),
                          "!edToken~ %{selected|SP-Power}", null , Earthdawn.Colors.action, Earthdawn.Colors.actionfg );
                }
                s += Earthdawn.makeButton( buildLabel( "Spellcast", "SP-Spellcasting-Step"),
                      "!edToken~ %{selected|SP-Spell-R0}", "Make a spellcasting test. Do not target a specific token." , Earthdawn.Colors.action, Earthdawn.Colors.actionfg );
                s += Earthdawn.makeButton( "Spell-MD",
                      "!edToken~ %{selected|SP-Spell-R1}", "Make a spellcasting test against one targets Mystic Defense." , Earthdawn.Colors.action, Earthdawn.Colors.actionfg );
                s += Earthdawn.makeButton( "Spell-Other",
                      "!edToken~ %{selected|SP-Spell-Rv}", "Make a spellcasting test against various other target options." , Earthdawn.Colors.action, Earthdawn.Colors.actionfg );

                s += Earthdawn.makeButton( "Will Effect",
                      "!edToken~ %{selected|Will-Effect-R}",
                      "Make a generic Will Effect roll. Will be modified by WillForce if it is turned on." , Earthdawn.Colors.effect, Earthdawn.Colors.effectfg );
                s+="<br>";
              } // end V < 2.0

              let attributes = findObjs({ _type: "attribute", _characterid: id });
              _.each( attributes, function (att) {      // First we are listing all the spellcasting Talents.
                if (att.get("name").endsWith( "_T_Special") && att.get("current").startsWith("SPL-")){
                  let rid = Earthdawn.getAttrBN( id, Earthdawn.buildPre( att.get("name") ) + "RowID", "");
                  let pre = Earthdawn.buildPre( "T" ,rid);
                  s += Earthdawn.makeButton( getAttrByName( id, pre + "Name" ), "!edToken~ " + Earthdawn.constant( "percent" )
                        + "{" + id + "|" + pre + "Roll}",
                        Earthdawn.getAttrBN( id, Earthdawn.buildPre( att.get("name")) + "SuccessText", "" ),
                        att.get("current").endsWith("Willforce") ? Earthdawn.Colors.effect :
                        Earthdawn.Colors.action,att.get("current").endsWith("Wilforce") ? Earthdawn.Colors.effectfg: Earthdawn.Colors.actionfg );
                }
                              if (att.get("name").endsWith( "_SPM_Contains" ))    // Then all the spells in the grimoire
                  s2 += Earthdawn.makeButton( att.get("current"), "!edToken~ " + Earthdawn.constant( "percent" ) + "{" + id + "|"
                      + Earthdawn.buildPre( "SPM", att.get("name")) + "Roll}",
                      Earthdawn.getAttrBN( id, Earthdawn.buildPre( att.get("name")) + "SuccessText", "" ), Earthdawn.Colors.param, Earthdawn.Colors.paramfg );
              }); // End for each attribute.
            }
            this.chat( s.trim() + "<br>" + s2.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive, "Spells" );
          } break;  // end Spells
          case "status": {      // Called from a macro Token action. Visible when any character is selected.
            let           basic = true;

            function buildLabelStatus( mi, markers ) {
              let label = mi["prompt"],
                bset = (markers.indexOf( "," + Earthdawn.getIcon( mi )  + ",") != -1),
                vset = (markers.indexOf( "," + Earthdawn.getIcon( mi )  + "@") != -1);
              basic = false;
              if( !bset && !vset)   // this icon is not set on the token - just use label
              {
                basic = true;
                return label;
              }
              else if ( mi["submenu"] === undefined )   // There is no submenu, so it is a boolean toggle that is on.
                return label;
              else if( mi[ "code" ] === "health" ) {    // Health is special case that needs to be hardcoded as it uses two icons.
                if( markers.indexOf( "," + "skull" + ",") != -1 )
                  return label + "-Dying";
                else
                  return label + "-Unconscious";
              } else {    // The icon is set on the token, and there is a submenu.  Figure out what the submenu item is that is set.
                let res = markers.match( new RegExp( "," + mi["icon"] + "@\\d" ) );
                if( res === null )
                  return label;
                let badge = res[0].slice(-1),
                  badge2 = String.fromCharCode( badge.charCodeAt( 0 ) + 48 ),   // This should translate 1, 2, 3, etc into a, b, c, etc.
                  t = mi["submenu"],
                  res2 = t.match( new RegExp( "\\|[\\w\\s]+,\\[\\d\\^" + badge2 ) );
                if( res2 === null )
                  return label + "-" + badge;
                else
                  return label + " - " + Earthdawn.getParam( res2[0], 1, "," ).slice( 1 ).trim();
              }
            } // end function buildLabelStatus

            lst = this.getUniqueChars( 2 );
            let markers = ",,";
            if ( lst.length > 0 ) {
              id = lst[ 0 ].token;    // Use first token as template
              var TokObj = getObj("graphic", id);
              markers = "," + TokObj.get( "statusmarkers" ) + ",";
            }

            _.each( Earthdawn.StatusMarkerCollection, function( menuItem ) {
              let sm = menuItem[ "submenu" ],
                shared = menuItem[ "shared" ];
                if(( shared !== undefined ) && ( shared.toLowerCase().startsWith( "pos" ) || shared.toLowerCase().startsWith( "neg" )))
                  return;     // The ones that meet this condition are all listed on the Attribs menu, so don't need to be listed here.
                      // If there is no submenu, toggle the current value from set to unset or visa versa.
                      // If there is a submenu, but it just asks for a numeric value ( no [n^a] structure ), prefix the  value with a "z".
                      // Otherwise, strip the [n^a] structure of everything except the alpha bit.
              s += Earthdawn.makeButton( buildLabelStatus( menuItem, markers ),
                    "!Earthdawn~ foreach: st~ marker: " + menuItem[ "code" ]
                    + ((sm === undefined) ? ": t" : (( sm.indexOf( "^" ) === -1) ? ":z" + sm : ":" + sm.replace(/\[([\w\-]+)\^([\w\-]+)\]/g, "$2"))),
                    null, basic ? Earthdawn.Colors.statusoff : Earthdawn.Colors.statusCond, Earthdawn.Colors.statusfg );
            });
            this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive, "Status" );
          } break;  // end Status
          case "talents":       // Called from a macro token action.  Visible when any character is selected.
          case "talents-non": {   // Note that the current version DOES display talents that are token actions, unless this tag is used.
            lst = this.getUniqueChars( 1 );
            let non = ssa[ 1 ].toLowerCase() === "talents-non";
            for( let k in lst ) {
              id = k;
              s = "";
              let attributes = findObjs({ _type: "attribute", _characterid: id });
              _.each( attributes, function (att) {
                if (att.get("name").endsWith( "_T_Name" ) || att.get("name").endsWith( "_NAC_Name"))
                  if( !non || (Earthdawn.getAttrBN( id, Earthdawn.buildPre( att.get("name") ) + "CombatSlot", "") != "1")) {
                    let special = Earthdawn.getAttrBN( id, Earthdawn.buildPre( att.get("name") ) + "Special", ""),
                      modtype= Earthdawn.getAttrBN( id, Earthdawn.buildPre( att.get("name") ) + "Mod-Type", ""),
                      bg,fg;
                    if (special === "Recovery")               { bg = Earthdawn.Colors.health; fg = Earthdawn.Colors.healthfg; }
                    else if ( special === "Initiative" )      { bg = Earthdawn.Colors.effect; fg = Earthdawn.Colors.effectfg; }
                    else if ( modtype === "Action" )          { bg = Earthdawn.Colors.action; fg = Earthdawn.Colors.actionfg; }
                    else if ( modtype === "Effect" )          { bg = Earthdawn.Colors.effect; fg = Earthdawn.Colors.effectfg; }
                    else if ( modtype.startsWith( "Attack" )) { bg = Earthdawn.Colors.attack; fg = Earthdawn.Colors.attackfg; }
                    else if ( modtype.startsWith( "Damage" )) { bg = Earthdawn.Colors.damage; fg = Earthdawn.Colors.damagefg; }
                    else                    { bg = Earthdawn.Colors.action; fg = Earthdawn.Colors.actionfg; }

                    s += Earthdawn.makeButton( Earthdawn.getAttrBN( id, Earthdawn.buildPre( att.get("name") ) + "Name", ""),
                        "!edToken~ " + Earthdawn.constant( "percent" ) + "{" + id + "|" + Earthdawn.buildPre( att.get("name")) + "Roll}",
                        Earthdawn.getAttrBN( id, Earthdawn.buildPre( att.get("name") ) + "Notes", "" ).replace( /\n/g, "&#013;"), bg, fg );
                  };
              }); // End for each attribute.
                this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive,
                      getAttrByName( id, "charName" ) + (non ? " - Talents Non-combat" :" - Talents" ));
            }
          } break;  // end Talents
          default:
            this.edClass.errorLog( "edParse.ChatMenu() Illegal ssa. " );
            log( ssa );
        } // end main switch
      } catch(err) { this.edClass.errorLog( "ED.ChatMenu() error caught: " + err ); log(ssa); }
      return false;
    } // End ChatMenu()




            // ParseObj.CreaturePower ( ssa )
            // user has pressed button to spend successes activating a creature power.
            // ssa[0]:
            //    CreaturePower: Name of Power: Target ID
            //    CreaturePower: Custom-MpeF4fBTanxnZtZlKij: char ID
            //    OpponentManeuver: Name of Power: Target ID: [Optional] number of hits.
            //    OpponentManeuver: oCustom1: -MejRq_ZKS9AGKSKIwtX: 1
    this.CreaturePower = function( ssa )  {
      'use strict';
      try {
        if( ssa[ 1 ].startsWith( "Custom" )) {
          let row = ssa[ 1 ].slice( 6 ).trim(),   // trim off the custom, leaving the rowID
              cID = ssa[ 2 ],
              pre = Earthdawn.buildPre( "MAN", row),
              linenum = 0;
          if( Earthdawn.getAttrBN( cID, pre + "Type", "1") ) {    // type 1 is Creature
            let d = Earthdawn.getAttrBN( this.charID, pre + "Desc", "");
            if( d ) {
              let sect = Earthdawn.newSect();
              let body = Earthdawn.newBody( sect );
              body.append( (( ++linenum % 2) ? ".odd" : ".even"), d);
              this.chat( sect.toString(), Earthdawn.whoFrom.noArchive, Earthdawn.getAttrBN( this.charID, pre + "Name", "") );
//              this.chat( d, Earthdawn.whoFrom.noArchive );
            }
          } else    // not type is Opponent
            if( Earthdawn.getAttrBN( cID, pre + "Show", "0") == "1" ) {
              let sect = Earthdawn.newSect();
              let body = Earthdawn.newBody( sect );
              body.append( (( ++linenum % 2) ? ".odd" : ".even"), ssa[3] + " successes spent on " + Earthdawn.getAttrBN( cID, pre + "Name", "") + ". "
                    + Earthdawn.getAttrBN( cID, pre + "Desc", ""));
              this.chat( sect.toString(), Earthdawn.whoFrom.noArchive );

            } else
              this.chat( "GM has not enabled this Maneuver.", Earthdawn.whoFrom.noArchive );
        } else {
          switch (ssa[ 0 ] ) {
            case "CreaturePower":
              switch (ssa[ 1 ] ) {
              case "GrabAndBite":
                this.chat( "One success spent Grab and Bite. Automatically grapple opponent. Grappled opponents automatically take bite damage each round until the grapple is broken.", Earthdawn.whoFrom.noArchive );
                break;
              case "Hamstring":
                this.chat( "One success spent Hamstringing. Movement halved until the end of the next round. If Wound, the penalty lasts until the Wound is healed.", Earthdawn.whoFrom.noArchive );
                break;
              case "Overrun":
                this.chat( "One success spent Overrunning. Only opponent with a lower Strength Step. Make a Knockdown test against a DN equal to the Attack test result.", Earthdawn.whoFrom.noArchive );
                break;
              case "Pounce":
                this.chat( "One success spent Pouncing. Force the opponent to make a Knockdown test against a DN equal to the Attack test result if reached on a leap and not too much larger.", Earthdawn.whoFrom.noArchive );
                break;
              case "SqueezeTheLife":
                this.chat( "Two successes spent on Squeeze the Life. Automatically grapple opponent. Grappled opponents automatically take claw damage each round until the grapple is broken.", Earthdawn.whoFrom.noArchive );
                break;
              default:
                this.edClass.errorLog( "CreaturePower had illegal ssa[1]" );
                log( ssa );
              }
              break;
            case "OpponentManeuver":        // {"content":"!Earthdawn~ setToken: -MejRq_ZKS9AGKSKIwtX~ OpponentManeuver: Provoke"
              let oflags = Earthdawn.getAttrBN( this.charID, "CreatureFlags", 0 );

              switch (ssa[ 1 ] ) {
              case "ClipTheWing":
                if( oflags & Earthdawn.flagsCreature.ClipTheWing )
                  this.chat( "Two successes spent Clipping the Wing. Creature can not fly until the end of next round. If flying, creature falls. If wound, can't fly until heal it.", Earthdawn.whoFrom.noArchive );
                else  this.chat( "You can/'t Clip the Wing of this opponent.", Earthdawn.whoFrom.noArchive );
                break;
              case "CrackTheShell":
                if( oflags & Earthdawn.flagsCreature.CrackTheShell ) {
                  let attr = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "PA-Buff" }, 0);
                  let newpa = Earthdawn.getAttrBN( this.charID, "Physical-Armor", "0") - ssa[ 3 ];
                  if( newpa < 0 ) {
                    Earthdawn.setWithWorker( attr, "current", Earthdawn.parseInt2( attr.get( "current" )) - (newpa + Earthdawn.parseInt2(ssa[ 3 ])), 0 );
                    this.chat( "Spent " + ssa[3] + " successes Cracking the Shell but only needed " + (newpa + Earthdawn.parseInt2(ssa[ 3 ])) + " to remove all remaining armor. Physical armor has been reduced. Important! This is supposed to be done AFTER rolling for damage and applying it.", Earthdawn.whoFrom.noArchive );
                  } else {
                    Earthdawn.setWithWorker( attr, "current", Earthdawn.parseInt2( attr.get( "current" )) - ssa[ 3 ], 0 );
                    this.chat( ssa[3] + " successes spent Cracking the Shell. Physical armor has been reduced. Important! This is supposed to be done AFTER rolling for damage and applying it.", Earthdawn.whoFrom.noArchive );
                  }
                } else  this.chat( "You can't Crack the Shell of this opponent.", Earthdawn.whoFrom.noArchive );
                break;
              case "Defang":
                if( oflags & Earthdawn.flagsCreature.Defang )
                  this.chat( ssa[3] + " successes spent Defanging. Each one is -2 to Poison steps. If Wound then creature can't use Poison at all.", Earthdawn.whoFrom.noArchive );
                else  this.chat( "You can't defang this opponent.", Earthdawn.whoFrom.noArchive );
                break;
              case "Enrage":
                if( oflags & Earthdawn.flagsCreature.Enrage )
                  this.chat( ssa[3] + " successes spent Enraging. Each one is -1 to Attack tests and PD until the end of next round.", Earthdawn.whoFrom.noArchive );
                else  this.chat( "You can't Enrage this opponent.", Earthdawn.whoFrom.noArchive );
                break;
              case "Provoke":
                if( oflags & Earthdawn.flagsCreature.Provoke )
                  this.chat( "Two successes spent Provoking. This creature will not attack anybody but you for it's next set of attacks.", Earthdawn.whoFrom.noArchive );
                else  this.chat( "You can't provoke this opponent.", Earthdawn.whoFrom.noArchive );
                break;
              case "PryLoose":
                if( oflags & Earthdawn.flagsCreature.PryLoose )
                  this.chat( ssa[3] + " successes spent Prying Loose. A Grappled ally may make an immediate escape attempt at +2 per.", Earthdawn.whoFrom.noArchive );
                else  this.chat( "You can't pry anybody loose from this opponent.", Earthdawn.whoFrom.noArchive );
                break;
              default:
                this.edClass.errorLog( "Opponent Maneuverer had illegal ssa[1]" );
                log( ssa );
              }
              break;
            default:
              this.edClass.errorLog( "CreaturePower had illegal ssa[0]" );
              log( ssa );
        } } // end else end switch
      } catch(err) { this.edClass.errorLog( "ED.CreaturePower() error caught: " + err ); }
    } // End CreaturePower()



          // This routine is passed a roll result. If this.misc.CursedLuck has been set, Curse the dice as per the horror power.
          // This routine also calculates and does
          //    noPileonDice: If this is set in state, then no individual die will explode more than this many times.
          //    noPileonStep: If this is set in state, then the total roll result will not be very much greater than this multiple of the step number.
          // See notes on BuildRoll().
          // examples: {"type":"V","rolls":[{"type":"R","dice":1,"sides":20,"mods":{"exploding":""},"results":[{"v":20},{"v":16}]},{"type":"M","expr":"+"},{"type":"R","dice":1,"sides":8,"mods":{"exploding":""},"results":[{"v":6}]},{"type":"M","expr":"+"},{"type":"R","dice":1,"sides":6,"mods":{"exploding":""},"results":[{"v":1}]}],"resultType":"sum","total":43}
          //           {"type":"V","rolls":[{"type":"R","dice":2,"sides":8,"mods":{"exploding":""},"results":[{"v":8},{"v":6},{"v":3}]}],"resultType":"sum","total":17}
          //           {"type":"V","rolls":[{"type":"R","dice":2,"sides":8,"mods":{"exploding":""},"results":[{"v":8},{"v":5},{"v":8},{"v":4}]}],"resultType":"sum","total":25}
    this.CursedLuck = function( curse, roll )  {
      'use strict';
      try {
        let stuffDone = 0;
        if( curse == undefined )
          curse = 0;

                // The Cursed Luck horror power has been used. Find The highest dice rolled, and replace them with 1's.
        while ( "CursedLuck" in this.misc && curse-- > 0 ) {
          let highVal = -1,
            highi,
            highj, highjEnd,
            resMod,
            rollCopy = JSON.parse( JSON.stringify( roll ) ),      // We want a brand new copy of this, so turn it into a string and back into an object.
            working = rollCopy;     // working and rollCopy will point to the same underlying data structure, but they will point to different PARTS of the structure. ie: working will only point to subgroups within the main working structure.

          while ( working[ "type" ] === "V" )     // Skip through these
            working = working[ "rolls" ];
          while ( working[0][ "type" ] === "G" )    // Skip through these groups.
            working = working[0][ "rolls" ][0];
          for( let i = 0; i < working.length; ++i) {
            let r = working[ i ];
            switch ( r[ "type" ] ) {
            case "R":
              if( "results" in r )
                for( let j = 0; j < r[ "results" ].length; ++j )
                  if( "v" in r[ "results" ][ j ] ) {
                    let v = r[ "results" ][ j ][ "v" ];
                    if( v > highVal || (v == highVal && r[ "sides" ] == v)) {   // Gives highest value, In case of a tie it favors dice that will explode. If still tied, takes first non-exploding dice or last rolled exploding dice.
                      highVal = v;
                      resMod = v;
                      highi = i;
                      highj = j;

                      if( ( "mods" in r) && ( "exploding" in r[ "mods" ]))
                        while( r[ "sides" ] == r[ "results" ][ j ][ "v" ] && ++j < r[ "results" ].length )
                          resMod += r[ "results" ][ j ][ "v" ];     // skip through any dice that are just explosions of this one.
                      highjEnd = j;
                    }
                  }
              break;
            case "M":
              break;
            default:
              this.edClass.errorLog( "Error in ED.CursedLuck(). Unknown type '" + r[ "type" ] + "' in rolls " + i + ". Complete roll is ..." );
              log( rolls );
            }
          }

          if( highVal > 1 ) {             // Then curse that dice. Which is to say, replace the high roll and all dice that exploded from it with a 1.
            let r = working[ highi ];
            r[ "results" ].splice( highj, highjEnd + 1 - highj, { v: 1});
            rollCopy[ "total" ] = rollCopy[ "total" ] + 1 - resMod;
          }
          roll = rollCopy;
          stuffDone |= 0x04;
        } // end cursed luck

        if( Earthdawn.getAttrBN( this.charID, "NPC", "0", true ) > 0 ) {      // Pile-on prevention is only done on NPC dice rolls. PCs can pile on all they want.
                      // Pile on prevention. Dice explosion method. Dice are only allowed to explode so many times (maybe zero times, maybe more).
                      // Find occurrences of when the dice exploded too many times, and remove the excess.
          if( state.Earthdawn.noPileonDice != undefined && state.Earthdawn.noPileonDice >= 0) {
            let rollCopy = JSON.parse( JSON.stringify( roll ) ),      // We want a brand new copy of this, so turn it into a string and back into an object.
              working = rollCopy;     // working and rollCopy will point to the same underlying data structure, but they will point to different PARTS of the structure. ie: working will only point to subgroups within the main working structure.

            while ( working[ "type" ] === "V" )     // Skip through these
              working = working[ "rolls" ];
            while ( working[0][ "type" ] === "G" )    // Skip through these groups.
              working = working[0][ "rolls" ][0];
            for( let i = 0; i < working.length; ++i) {
              let r = working[ i ],
                expcount = 0,
                resMod = 0,
                piled;
              switch ( r[ "type" ] ) {
              case "R":
                if( "results" in r )
                  for( let j = 0; j < r[ "results" ].length; ++j )
                    if( "v" in r[ "results" ][ j ] ) {
                      let v = r[ "results" ][ j ][ "v" ];
                      if( r[ "sides" ] == v) {          // explosion
                        if( ++expcount > state.Earthdawn.noPileonDice ) {
                          resMod += v;
                          if( piled === undefined )
                            piled = j;
                        }
                      } else {        // not explosion
                        if( piled !== undefined ) {
                          r[ "results" ].splice( piled, j - piled );
                          rollCopy[ "total" ] -= resMod;
                          resMod = 0;
                          j = piled;
                          piled = undefined;
                          stuffDone |= 0x02;
                        }
                        expcount = 0;
                    } }
                break;
              case "M":
                break;
              default:
                this.edClass.errorLog( "Error in ED.CursedLuck(). Unknown type '" + r[ "type" ] + "' in rolls " + i + ". Complete roll is ..." );
                log( rolls );
            } }
            roll = rollCopy;
          } // End noPileonDice

                // Pile on prevention, Step method. The final result is not allowed to greatly exceed a certain multiple of the
                // effective step (converting karma, bonuses, and modifiers to steps) of the roll.
                // For example if noPileonStep is 2.0, then a step 20 roll should not produce a roll very much in excess of 40.
                // This section removes excess exploding dice or reduces non-exploding dice until the result is close to the multiple.
          let done = false;
          while ( !done && state.Earthdawn.noPileonStep && roll[ "total" ] >= ( state.Earthdawn.noPileonStep * this.misc[ "effectiveStep" ] ) - 3) {
            done = true;
            let highVal = -1,
              highi,
              highj, highjEnd, exploding,
              resMod,
              rollCopy = JSON.parse( JSON.stringify( roll ) ),      // We want a brand new copy of this, so turn it into a string and back into an object.
              working = rollCopy;     // working and rollCopy will point to the same underlying data structure, but they will point to different PARTS of the structure. ie: working will only point to subgroups within the main working structure.

            while ( working[ "type" ] === "V" )     // Skip through these
              working = working[ "rolls" ];
            while ( working[0][ "type" ] === "G" )    // Skip through these groups.
              working = working[0][ "rolls" ][0];
            for( let i = 0; i < working.length; ++i) {
              let r = working[ i ];
              switch ( r[ "type" ] ) {
                case "R":
                  if( "results" in r )
                    for( let j = 0; j < r[ "results" ].length; ++j )
                      if( "v" in r[ "results" ][ j ] ) {
                        let v = r[ "results" ][ j ][ "v" ];
                                // highest dice that will not send total below the threshold we want.
                        if( v > highVal && (roll[ "total" ] - v) >= ( state.Earthdawn.noPileonStep * this.misc[ "effectiveStep" ] )) {
                          highVal = v;
                          resMod = v;
                          exploding = (r[ "sides" ] == v);
                          highi = i;
                          highj = j;
                      } }
                  break;
                case "M":
                  break;
                default:
                  this.edClass.errorLog( "Error in ED.CursedLuck(). Unknown type '" + r[ "type" ] + "' in rolls " + i + ". Complete roll is ..." );
                  log( rolls );
            } }

            if( highVal > 3 ) {             // Remove or reduce this dice.
              if( exploding ) {
                let r = working[ highi ];
                r[ "results" ].splice( highj, 1);
                rollCopy[ "total" ] -= resMod;
              } else {
                let random = Math.floor(Math.random() * 3) + 1;
                working[ highi ][ "results" ][ highj ][ "v" ] = random;
                rollCopy[ "total" ] += random - resMod;
              }
              stuffDone |= 0x01;
              done = false;
            }
            roll = rollCopy;
          } // End noPileonStep
        } // End not NPC.

        this.misc[ "FunnyStuffDone" ] = stuffDone;
        return roll;
      } catch(err) { this.edClass.errorLog( "ED.CursedLuck() error caught: " + err ); }
    } // End CursedLuck()



          // ParseObj.Damage ( ssa )
          // Apply Damage to Token/Char specified in tokenInfo.
          // ssa is an array that holds the parameters.
          //  Note: These top notes describe the old expected order of arguemnts, but the routine has been rewritten to accept the
          //    arguments in any order because sometimes it was difficult to supply them in order.
          //      0 - (optional) Damage (default), Strain, Stun, or Recovery;
          //      Also StrainSilent which does the strain, but does not send a message saying so.
          //      1 - Armor Mods: NA = No Armor, PA = subtract Physical Armor before applying damage, MA = Mystic Armor. PA-Nat, MA-Nat.
          //      2 - Damage:      Amount of damage to apply.   For "Recovery" this will be a negative number.
    this.Damage = function( ssa ) {
      'use strict';
      try {
        if( ssa.length < 3 ) {
          this.chat( "Error! Not enough arguments passed for Damage() command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError );
          return;
        }
        if( this.tokenInfo === undefined ) {
          this.chat( "Error! tokenInfo undefined in Damage() command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError);
          return;
        }

        let bToken = ( this.tokenInfo.type === "token" ),           // We have both a token and a character object.
          armor = 0,
          armorType = "",
          dmg = 0,
          bRecovery = false,
          bStrain = false,
          bStrainSilent = false,
          bStun = (this.bFlags & Earthdawn.flags.RecoveryStun);
        for( let ind = 0; ind < ssa.length; ++ind) {    // Loop though getting any expected parameter, which may show up in various orders.
          if( isNaN( ssa[ ind ] )) {
            switch ( ssa[ ind ].toUpperCase() ) {
            case "PA":
              armor = Earthdawn.getAttrBN( this.charID, "Physical-Armor", "0" );
              armorType = " Physical";
              break;
            case "PA-NAT":
              armor = Earthdawn.getAttrBN( this.charID, "PA-Nat", "0" );
              armorType = " Natural Physical";
              break;
            case "MA":
              armor = Earthdawn.getAttrBN( this.charID, "Mystic-Armor", "2" );
              armorType = " Mystic";
              break;
            case "MA-NAT":
              armor = Earthdawn.getAttrBN( this.charID, "MA-Nat", "2" );
              armorType = " Natural Mystic";
              break;
            case "RECOVERY":
              bRecovery = true;
              break;
            case "STRAINSILENT":
              bStrainSilent = true;
            case "STRAIN":
              bStrain = true;
              if( state.Earthdawn.g1879 )   bStun = true;
              break;
            case "STUN":
              bStun = true;
              break;
            case "DAMAGE":    // This is the normal case and requires no handling. In fact in some cases we get this even when it really is Stun or Strain. So don't trust this to mean it is normal damage just because we are here.
            case "NA":      // No Armor, No action required.
              break;
            default:
              this.edClass.errorLog( "ED.Damage() unparsable argument " + ind + ": " + JSON.stringify(ssa));
            }
          } else      // is number.
            dmg += Earthdawn.parseInt2(ssa[ ind ]);
        } // loop getting parameters.
        if( armor < 1 )
          armorType = "";
        if( dmg <= 0 && !bRecovery )        // If the passed damage evaluates to zero, just exit.
          return;
        if( bStrain ) {     // Weird edge case. Strain should not have armor, but Take-Damage and Damage-Target buttons allows user to choose both.
          armor = 0;
          armorType = "";
        }
        dmg -= armor;
        if( dmg <= 0 && !bRecovery) {
            this.chat( "Attack glances off of " + this.tokenInfo.name +"'s" + armorType + " Armor." );
            return;
        }

        let newMsg = "",
          npc = Earthdawn.getAttrBN( this.charID, "NPC", "0" );
        if( bStrain ) {
          if( !bStrainSilent )
            this.misc[ "strain" ] = dmg;
        } else if (armor < 1 ) {    // No armor
          newMsg = this.tokenInfo.name + " took " + dmg + " " + (bStrain ? "Strain" : (bStun ? "Stun" : "Damage"));
        } else if ( npc == Earthdawn.charType.pc ) {
          newMsg = this.tokenInfo.name + " took " + dmg + " " + (bStrain ? "Strain" : (bStun ? "Stun" : "Damage")) + " above" + armorType + " armor";
        } else {  // NPC
          newMsg = this.tokenInfo.name + "'s" + armorType + " armor absorbs ";
          if( dmg < armor )
            newMsg += "most";
          else if ( dmg <= (armor * 2))
            newMsg += "some";
          else
            newMsg += "little";
          newMsg += " of the damage";
        }

        if( bToken )  // If have a token, set it on the token, and it will flow into the character if not mook (and mooks we only want to set token anyway).
          var currDmg = Earthdawn.parseInt2( this.tokenInfo.tokenObj.get( "bar3_value" ));
        else {    // no token, character sheet only.
          var attributeDmg = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "Damage" }, 0);
          currDmg = Earthdawn.parseInt2(attributeDmg.get( "current" ));
        }
        if( !bStun ) {    // normal damage. This is identical for characters and mooks.
          currDmg += dmg;
          if( bRecovery ) {
            this.chat( this.tokenInfo.name + " recovered " + ((currDmg < 0) ? ((dmg - currDmg) * -1) : (dmg * -1) )
                  + " damage. New value " + ((currDmg < 0) ? 0 : currDmg ) + "." );
            if( currDmg < 0) {    // If recovering from normal damage heals more than have, have the leftover heal stun damage.
              bStun = true;
              dmg = currDmg;
              currDmg = 0;
            }
          }
          if( bToken )
            Earthdawn.set( this.tokenInfo.tokenObj, "bar3_value", currDmg );
          else
            Earthdawn.setWithWorker( attributeDmg, "current", currDmg, 0 );
        } // end normal damage section

        let unc = Earthdawn.getAttrBN( this.charID, "Damage_max", 20 );
        if( bStun ) {     // Stun uses a different procedure than normal damage because of the calculated fields on the character sheet.
          if( npc == Earthdawn.charType.pc || npc == Earthdawn.charType.npc) {      // This is not a Mook, so add the Stun to the character sheet where it will automatically flow to the token value 3.
            var attributeStun = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "Damage-Stun" }, 0);
            var stunDmg = Earthdawn.parseInt2(attributeStun.get( "current" ));
          } else {      // Only if this is a Mook, Subtract the stun damage from bar3_max (which is unconscious rating).
            let currMax = Earthdawn.parseInt2( this.tokenInfo.tokenObj.get( "bar3_max" ));
            stunDmg = unc - currMax;
          }
          if( stunDmg != 0 || dmg != 0 ) {
            stunDmg += dmg;
            if( bRecovery ) {
              this.chat( this.tokenInfo.name + " recovered " + ((stunDmg < 0) ? ((dmg - stunDmg) * -1) : (dmg * -1) )
                    + " stun. New value " + ((stunDmg < 0) ? 0 : stunDmg ) + "." );
              if( stunDmg < 0)
                stunDmg = 0;
            }
            if( npc == Earthdawn.charType.pc || npc == Earthdawn.charType.npc)
              Earthdawn.setWithWorker( attributeStun, "current", stunDmg, 0 );
            else
              Earthdawn.set( this.tokenInfo.tokenObj, "bar3_max", unc - stunDmg );
            unc -= stunDmg;     // Also adjust the unc rating here, since we use it later, and the event that sets it probably will not have triggered yet.
          }
        } // end stun damage section.


        let WoundThreshold = Earthdawn.getAttrBN( this.charID, "Wound-Threshold", 7 ) || 0;
        if( !bStun && dmg >= WoundThreshold ) {     // wound.
          let npc = Earthdawn.getAttrBN( this.charID, "NPC", "0" );   // Actually need to set Wounds on character sheet so that sheet worker will fire!
          if( bToken && (( npc != Earthdawn.charType.pc && npc != Earthdawn.charType.npc ))) {
            var currWound = Earthdawn.parseInt2( this.tokenInfo.tokenObj.get( "bar2_value" ));    // Here we are setting the wound on the token.
            if( isNaN( currWound ) )
              currWound = 1;
            else
              currWound += 1;
            Earthdawn.set( this.tokenInfo.tokenObj, "bar2_value", currWound );
          } else {          // Here we are setting the wound on the character sheet.
            let attribute = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "Wounds" }, 0);
            var currWound = Earthdawn.parseInt2(attribute.get( "current" ));
            currWound += 1;
            Earthdawn.setWithWorker( attribute, "current", currWound, 0 );
          }
          newMsg += ". Takes wound " + currWound;
        } // end wound
        if( currDmg >= Earthdawn.getAttrBN( this.charID, "Damage-Death-Rating", 25 )) {
          newMsg += ". Character is DEAD";
          this.MarkerSet( ["d", "healthdead", "s"] );
        } else if( currDmg >= ( unc || 0)) {
          newMsg += ". Character is Unconscious";
          this.MarkerSet( ["d", "healthunconscious", "s"] );
        } else if( dmg >= (WoundThreshold + 5)) {     // Character is wounded
          let cname = getAttrByName( this.charID, "charName" );
          newMsg += ".  Need to make a " + Earthdawn.makeButton( "Knockdown",
                  "!Earthdawn~ CharID:" + this.charID + "~ TargetNum: " + ( dmg - WoundThreshold )
                  + ": Adjust-TN-Auto: Adjust-TN-Misc~ foreach~ modValue: ?{Modification|0} ~ K-ask: @{" + cname + "|KarmaGlobalMode}@{"
                  + cname + "|Str-Karma-Ask}: @{" + getAttrByName( this.charID, "charName") + "|DPGlobalMode}@{"
                  + cname + "|Str-DP-Ask}~ Value: Str-Step: Str-Mods: Knockdown-Adjust: Adjust-All-Tests-Total: Defensive: Resistance~ Roll"
                  ,"Make a standard Knockdown test.", Earthdawn.Colors.action, Earthdawn.Colors.actionfg ) + " test TN " + ( dmg - WoundThreshold );
          let attributes = findObjs({ _type: "attribute", _characterid: this.charID }),
          po = this;
          _.each( attributes, function (att) {
            if( att.get( "name" ).endsWith( "_Special" ) && att.get("current").startsWith( "Knockdown" )) {
              let pre = Earthdawn.buildPre( att.get( "name")),
                name = Earthdawn.getAttrBN( po.charID, pre + "Name", "" ),
                code = Earthdawn.repeatSection( 3, att.get( "name") ),
                rid = Earthdawn.repeatSection( 2, att.get( "name") );
//log( "Talent Found " + pre + " " + name + " "  + code +" " + rid + " " + cname);
              newMsg += Earthdawn.makeButton( name + " test",
                      "!Earthdawn~ CharID:" + po.charID + "~ TargetNum: " + ( dmg - WoundThreshold )
                      + ": Adjust-TN-Auto: Adjust-TN-Misc~ foreach:sct:ust:c~ modValue: ?{Modification|0} ~ K-ask: @{" + cname + "|KarmaGlobalMode}@{"
                      + cname + "|" + pre + "Karma-Ask}: @{" + cname + "|DPGlobalMode}@{"
                      + cname + "|" + pre + "DP-Ask}~ Action: "+ code  +":" + rid
                      ,"Make a Knockdown test.", Earthdawn.Colors.action, Earthdawn.Colors.actionfg );
            }
          }); // End for each attribute.
        } else
          this.MarkerSet( ["d", "healthunconscious", "u"] );

        if( !bRecovery && newMsg.length > 0)
          this.chat( newMsg + "." );
      } catch(err) { this.edClass.errorLog( "ED.Damage() error caught: " + err ); }
    } // End ParseObj.Damage() ssa )



          // ParseObj.Debug()
          // This is a collection of test or diagnostic commands.
          //
          // Most are probably invoked from the "Special Function" drop-down and button on the Adjustments page.
          // Inspect, repsecfix, sheetworkertest, showeach, test.
    this.Debug = function( ssa )  {
      'use strict';
      try {
        switch ( ssa[ 1 ].toLowerCase() ) {
          case "inspect":            // This is test code that lets me see info on tokens and/or characters.
log( ssa);
            switch( ssa[ 2 ].toLowerCase() ) {
              case "getids": {        // Given a text fragment. Look in every attribute that ends in "_Name" to see if it contains the fragment.
                              // go through all attributes for this character and look for ones we are interested in
                let attributes = findObjs({ _type: "attribute", _characterid: this.charID }),
                  po = this;
                _.each( attributes, function (att) {
                  if (att.get("name").endsWith( "_Name" ) && att.get( "current" ).indexOf( ssa[ 3 ] ) != -1 )
                    po.chat( getAttrByName( po.charID, "charName" ) + " " + "CharID: " + po.charID + "   " + att.get( "name" ) + ":   " + att.get( "current" ),
                        Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive, "Inspect" );
                }); // End for each attribute.
              } break;
              case "getvalue":      // Given an attribute name, give the value of the attribute.
                this.chat( getAttrByName( this.charID, "charName" ) + " " + ssa[ 3 ] + ": " + getAttrByName( this.charID, ssa[ 3 ]),
                      Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive, "Inspect" );
                break;
              case "objectid": {      // Given an Object ID. Show what type of object it is and it's name.
                let po = this,
                  objs = findObjs({ _id: ssa[ 3 ] });
                _.each(objs, function(obj) {
                  let typ = obj.get( "type" );
                  let name = obj.get( "name" );
                  if( typ )
                    if( name )
                      po.chat( "Type: " + typ + "\nName: " + name, Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive, "Inspect" );
                    else
                      po.chat( "Type: " + typ, Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive, "Inspect" );
                  po.chat( JSON.stringify( obj ), Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive, "Inspect" );
                });
              } break;
              case "repeatsection": {   // Given a character ID (defaulting to current character) and a repeating section ID. show what it is for.
                let po = this;
                if( ssa[ 4 ] === "Full" ) {
                  let attributes = findObjs({ _type: "attribute", _characterid: po.charID });
                  _.each( attributes, function (att) {
                    let name = att.get( "name" );
                    if ( name.startsWith( "repeating_" ) && name.indexOf( ssa[3] ) > -1) {
                      po.chat( "name: " + att.get("name") + "   current: " + att.get("current")
                            + ( att.get("max") ? "   max: " + att.get("max") : "") + "   _id: " + att.get("_id"),
                            Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive, "Inspect" );
                      log( att );
                    }
                  });
                } else {    // Short report
                  function checkRepeat() {
                    for( let i = 1; i < arguments.length; ++i ) {
                      let aobj = findObjs({ _type: 'attribute', _characterid: po.charID, name: arguments[ 0 ] + arguments[ i ] })[0];
                      if ( aobj != undefined )
                        po.chat( JSON.stringify( aobj ), Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive, "Inspect" );
                    }
                  };
                  if( state.Earthdawn.gED )
                    checkRepeat( Earthdawn.buildPre( "DSP", ssa[3] ), "Code", "Name", "Circle" );
                  else
                    checkRepeat( Earthdawn.buildPre( "DSP", ssa[3] ), "Name", "Circle", "Tier" );
                  checkRepeat( Earthdawn.buildPre( "T", ssa[3] ), "Name", "Rank" );
                  checkRepeat( Earthdawn.buildPre( "NAC", ssa[3] ), "Name", "Rank" );
                  checkRepeat( Earthdawn.buildPre( "SK", ssa[3] ), "Name", "Rank" );
                  checkRepeat( Earthdawn.buildPre( "SKK", ssa[3] ), "Name" );
                  checkRepeat( Earthdawn.buildPre( "SKA", ssa[3] ), "Name" );
                  checkRepeat( Earthdawn.buildPre( "SKL", ssa[3] ), "SKL_Name" );
                  checkRepeat( Earthdawn.buildPre( "SPM", ssa[3] ), "Type", "Origin", "Contains" );
                  checkRepeat( Earthdawn.buildPre( "SP", ssa[3] ), "Name", "Circle", "Discipline" );
                  checkRepeat( Earthdawn.buildPre( "WPN", ssa[3] ), "Name" );
                  checkRepeat( Earthdawn.buildPre( "MNT", ssa[3] ), "Name" );
                  checkRepeat( Earthdawn.buildPre( "TI", ssa[3] ), "Name" );
                }
              } break;
              case "statusmarkers":   // Show status markers of selected tokens.
                this.chat( this.tokenInfo.tokenObj.get( "statusmarkers" ), Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive, "Inspect" );
                this.chat( "pseudoToken: " + Earthdawn.getAttrBN( this.charID, "pseudoToken", ""), Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive, "Inspect" );
                break;
              case "tokenobj":      // Show tokenInfo for selected tokens.
                if ( this.tokenInfo ) {
                this.chat( "Type: " + this.tokenInfo[ "type" ]
                    + "\nName: " + this.tokenInfo[ "name" ]
                    + (("tokenObj" in this.tokenInfo) ? "\ntokenID: " + this.tokenInfo.tokenObj.get("id") + "\nToken" + JSON.stringify( this.tokenInfo.tokenObj ) : "")
                    + (("characterObj" in this.tokenInfo) ?  "\ncharID: " + this.tokenInfo.characterObj.get("id") + "\nChar" + JSON.stringify( this.tokenInfo.characterObj ) : ""),
                    Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive, "Inspect" );
                } else
                  this.chat( "tokenInfo undefined.", Earthdawn.whoTo.player| Earthdawn.whoFrom.noArchive, "Inspect" );
                break;
            } // End Inspect
          case "repsecfix": {     // RepSecFix: Repeating Section Verify and Fix.
                        // Find any row that does not have a RowID, and fix it.
                        // For each RowID found, see if any two are duplicates except for case, and if so merge them into the correct (mixed case) rowID.
            let orig = [],
              lcase = [],
              needFixi  = [],
              needFix   = [],
              po = this;
            let attributes = findObjs({ _type: "attribute", _characterid: this.charID });
            _.each( attributes, function (att) {
              if( att.get( "name" ).startsWith( "repeating_")) {
                let nm = att.get("name"),
                  rowID = Earthdawn.repeatSection( 2, nm),
                  code  = Earthdawn.repeatSection( 3, nm);
                if( code === "TI" )     // These don't have a RowID.
                  return;
                if( nm.endsWith( "_Name" )) {     // When we find a repeating section name, Make sure we have a RowID that matches the rowID of the name.
                  let attrib = findObjs({ _type: "attribute", _characterid: po.charID,  name: nm.slice( 0, -5) + "_RowID" });
                  if( !attrib || attrib.length == 0 ) {   // RowID does not exist at all for this item.
                    attrib = createObj( "attribute", { _characterid: po.charID,  name: nm.slice( 0, -5) + "_RowID"  });
                    attrib.set( "current", rowID );
                    po.chat( "Error found, " + att.get( "current" ) + " at " + nm + " did not have a rowID.", Earthdawn.whoTo.player| Earthdawn.whoFrom.api )
                  } else if( !attrib[ 0 ].get( "current" ) || attrib[ 0 ].get( "current" ) !== rowID) {
                    po.chat( "Error found, " + att.get( "current" ) + " at " + nm + " had incorrect rowID of - " + attrib[ 0 ].get( "current" ), Earthdawn.whoTo.player| Earthdawn.whoFrom.api )
                    attrib[ 0 ].set( "current", rowID);
                  }
                } // end _name
                if( orig.indexOf( rowID ) === -1 )  {   // This is a list of all unique rowID's we found.
                  orig.push( rowID );
                  lcase.push( rowID.toLowerCase() );
                }
                if( rowID === rowID.toLowerCase() || rowID === rowID.toUpperCase() ) {
                  let t = needFixi.indexOf( rowID );    // needFixi is a one-dimensional array of strings that contains rowIDs that need fixing because they are all lower case.
                  if( t == -1 ) {
                    t = needFixi.push( rowID ) -1;
                    needFix.push( [] );
                  }
                  needFix[ t ].push( att );       // needFix is an array of arrays of objects that contain attributes that need fixing.  For example there are two attributes that have the same rowID in needFixi [ 0 ], then needFix[0][0] and needFix[0][1] will contain them.
                }
              } // end repeating.
            }); // End for each attribute.
            if( needFixi.length > 0 ) {
  log( "repSecFix" );   log( needFixi);   log( orig);   log( lcase);    log( needFix);
              for( let i = 0; i < needFixi.length; ++i ) {
                let cnt = [],
                  f = lcase.indexOf( needFixi[ i ].toLowerCase());
                while( f !== -1) {
                  cnt.push( f );
                  f = lcase.indexOf( needFixi[ i ].toLowerCase(), f +1);
                }
                f = undefined;
                if( cnt.length > 1 )      // We have found more than one entry with the same lowercased rowID.  Almost certainly at least one of these is bad, hopefully at least one is good.
                  for( let j = 0; j < cnt.length; ++j )
                    if( orig[ cnt[ j ]] !== orig[ cnt[ j ]].toLowerCase() && orig[ cnt[ j ]] !== orig[ cnt[ j ]].toUpperCase())
                      f = orig[ cnt[ j ]];
                if( f ) {     // This is the RowID we want to use for all loop i attributes.
                  let lst = ", ";
  log( "needFix[ " + i + "] length is " + needFix[ i ].length);   log( "new RowID " + f);
                  for( let j = 0; j < needFix[ i ].length; ++j ) {
                    let obj = needFix[ i ][ j ];
                    let nm = obj.get( "name" );
  log( nm);
                    let n    = Earthdawn.repeatSection( 4, nm),
                      pre  = Earthdawn.buildPre( Earthdawn.repeatSection( 3, nm), f);
                    let attrib = findObjs({ _type: "attribute", _characterid: po.charID,  name: pre + n });
                    if( attrib && attrib.length > 0 ) {   // We already have a correct entry of this name. delete the one we found that was bad.
                      po.chat( "Error found, both bad and good RowIds found for " + att.get( "name" ) + " deleting bad one.", Earthdawn.whoTo.player| Earthdawn.whoFrom.api | Earthdawn.whoFrom.apiWarning )
                      obj.remove();
                      if( attrib.length > 1 ) {
                        po.chat( "Error, found multiple '" + pre + n + "' deleting (randomly) all except one.", Earthdawn.whoTo.player| Earthdawn.whoFrom.api | Earthdawn.whoFrom.apiWarning)
                        for( let k = 1; k < attrib.length; ++k )
                          attrib[ k ].remove();
                    } }
                    else {      // We have only one attribute of this name, but it has a bad RowID. Fix it in place.
                      lst += n + ", ";
                      Earthdawn.set( obj, "name", pre + n );
                  } }
                  if( lst.length > 5)
                    po.chat( "Errors found, " + lst.slice( 2 ).trim() + " fixed for " + pre, Earthdawn.whoTo.player| Earthdawn.whoFrom.api | Earthdawn.whoFrom.apiWarning )
                } else {
                  po.chat( "Errors found with " + needFix[ i ].length + " attributes of row " + needFix[ i ][0].get( "name") + " but could not be fixed.", Earthdawn.whoTo.player| Earthdawn.whoFrom.api | Earthdawn.whoFrom.apiWarning )
                  log( needFix[ i ] );
                }
              } // end for each needFix
            } else
              this.chat( "All other RowID's found appear valid.", Earthdawn.whoTo.player| Earthdawn.whoFrom.api )
          } break;
          case "sheetworkertest":      // Do nothing (this function is done by sheet-worker)
            break;
          case "showeach":        // showeach is basically just debug code that lets me look inside of repeating sections. Show attributes that match the passed parameters.
            if( this.charID === undefined ) {
              this.chat( "Error! Trying ShowEach() when don't have a CharID.", Earthdawn.whoFrom.apiError);
              return;
            }
            let searchString = "CB2",     // Whatever you want to look for can be hard-coded here.
              searchString2 = undefined;

            if( ssa.length > 2 )
              if( ssa[ 2 ] !== "API" ) {
                searchString = ssa[ 2 ];
                if( ssa.length > 3 )
                  searchString2 = ssa[ 3 ];
            }
                              // Go through all attributes for this character and look for ones that have the search strings
            let attributes = findObjs({ _type: "attribute", _characterid: this.charID });
            _.each( attributes, function (indexAttributes) {
              if ( indexAttributes.get("name").indexOf( searchString ) > -1 )
                if (( searchString2 === undefined ) || (indexAttributes.get("name").indexOf( searchString2 ) > -1 ) ) {
                  log( "Name: " + indexAttributes.get("name") + "   Val: " + indexAttributes.get("current") );
                }
            }); // End for each attribute.
            break;
          case "test":    // This is just temporary test code. Try stuff out here and see if it works.  Make sure nothing dangerous is here when released.
            try {
  //            this.chat( stem + Earthdawn.colonFix( slink ), Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive );
              this.edClass.updateVersion2p001( this.charID, this.edClass, 0 );

                    // Change all editions back to 1.000
  //            let attrib = findObjs({ _type: "attribute", name: "edition" }),
  //            count = 0;
  //            log( attrib.length);
  //            _.each( attrib, function (att) {
  //              att.set( "max", "1.000");
  //              ++count;
  //            }); // End for each attribute.
  //            state.Earthdawn.version = "1.000";
  //            this.chat( count +  " characters set");
            } catch(err) { this.edClass.errorLog( "ED Test error caught: " + err ); }
          log("Test Done");
          break;
        }
      } catch(err) { this.edClass.errorLog( "ED.Debug() error caught: " + err ); }
    } // End ParseObj.Debug()



            // If there are any commands that we saved to do later. Do them now.
    this.doNow = function() {
      'use strict';
      try {
        if( this.doLater !== "" ) {     // These are commands we did not want to do when we first saw them, and only want to do at the last moment.
          let ta = this.doLater.split( "~" );
          for( let i = 1; i < ta.length; ++i)
            this.Parse( ta[ i ] );
          this.doLater = "";
        }
      } catch(err) { this.edClass.errorLog( "ED.doNow() error caught: " + err ) }
    } // End ParseObj.DoNow()



          // ParseObj.ForEachToken ()
          // For Each selected token, perform some command.
          // ssa is an array that holds any modifiers for the ForEach command.  Look in the switch statement below for description of options.
    this.ForEachToken = function( ssa ) {
      'use strict';
      try {
        this.tokenIDs = [];
        let bst   = false,      // Do we want all selected tokens?
          bsct  = false,      // Do we want all selected character tokens?
          bust  = false,      // Do we want to look in unselected tokens if we can't find with the above?
          binmt = false,      // Do we want to ignore all selected tokens that do not match the character ID?
          btuc  = false,    // Token Unique Character - Ignore all except the first token for each unique character.
          bc    = false,      // Do we want character (if found nothing else)?
          flag = 0,           // Instead of doing a ForEachToken loop:  1 - return a list of tokens.
          mooks = false,      // Do we want to ignore all selected non-mooks?
          notMooks = false,   // Do we want to ignore all selected mooks?
          PCs   = false,      // Do we want to ignore all selected NPCs?
          NPCs  = false,      // Do we want to ignore all selected PCs?
          notPCs = false,   // Do we want to ignore all selected non-PCs?
          edParse = this,
          objarr = [];

        for ( var i = 1; i < ssa.length; i++) {
          switch ( ssa[ i ].toLowerCase() ) {
            case "character":   // Character Returns the character matching charID only.
            case "c":
              bc = true;
              break;
            case "list":    // Don't do a ForEachToken, simply return a list of tokens for which you would have done a ForEachToken.
              flag = 1;
              break;
            case "status":    // Don't do a ForEachToken, simply return true/false if any token has a token status set starting with next parameter.
              flag = 2;
              var status = ssa[ ++i];
              break;
            case "mooks":     // Keep Mooks only. Ignore selected characters that are not mooks.
            case "mook":
              mooks = true;
              break;
            case "notmooks":    // Keep PCs and NPCs that are not mooks. Ignore selected characters that are mooks.
            case "notmook":
              notMooks = true;
              break;
            case "npcs":      // Keep NPCs (including mooks) only. Ignore selected characters that are PCs.
            case "npc":
              NPCs = true;
              break;
          // Note: Could add NpcNotMook here if needed. So far have not needed it.
            case "pcs":       // Keep PCs only. Ignore selected characters that are NPCs or Mooks.
            case "pc":
              PCs = true;
              break;
            case "selectedtokens":     // Selected Tokens - ForEachToken processes selected tokens only with no variation for token action or character ID.
            case "st":
              bst = true;
              break;
            case "selectedcharactertokens":    // Selected Character Tokens - It processes only the selected tokens that match charID.
            case "sct":
            case "selectedcharacter":
            case "sc":
              bsct = true;
              break;
            case "ignorenonmatchingtokens":    // Ignore Non-matching Tokens - Any selected token that does not match the character ID is ignored.
            case "ignorenonmatching":          // Note that this is different from sct in that if this one is set, it still performs the logic described below to figure out which options are wanted.
            case "inmt":
              binmt = true;
              break;
            case "tuc":
            case "uc":              // Token unique character
              btuc = true;          // NEEDS TO BE combined with some other directive such as st. Will give only one token for each selected character or mook.
              break;
            case "unselectedtokens":    // If you did not find any selected character tokens, look in the unselected tokens as well.
            case "ust":                 // Note that if you select this option WITHOUT st or sct, it will always find all character tokens, selected or not.
              bust = true;
              break;
        } } // end ssa[1] switch

        if( !bst && !bsct && !bust && !bc ) {
                // Without any modifiers, it tries it's hardest to find whatever it can.
                // When called from a token action, perform the action for all selected tokens.
                // when called from a button on a character sheet that is a mook, perform for all selected tokens for that character. If none of the characters tokens are selected, do all that are selected.
                // when called from a button on a character sheet that is non-mook, FIND the token even if not selected. If it finds more than one it is an error.
                // If there is no token on this page, see what can do with the character itself. This may cause called routines to error.
          bst = this.tokenAction;     // all selected tokens
          bsct = !this.tokenAction;   // all selected character tokens
          bust = !this.tokenAction;   // look in unselected tokens
          bc = true;                  // character (if found nothing else)
        }

        if(( bst || bsct || binmt ) && this.edClass.msg !== undefined )
          _.each( this.edClass.msg.selected, function( sel ) {                // Check selected tokens
            var TokObj = getObj("graphic", sel._id);
            if (typeof TokObj === 'undefined' )
              return;
            let cID = TokObj.get("represents");
            if( btuc ) {
              for( let i = 0; i < objarr.length; ++i )
                if( objarr[ i ]["characterObj"]["_id"] === cID )
                  return;
            }
            if( bst || (( edParse.charID !== undefined) && (cID === edParse.charID ))) {          // This will get all selected tokens on a token action, and all selected tokens that match this character on a sheet action.
              let CharObj = getObj("character", cID);
              if (typeof CharObj === 'undefined')
                return;
              let npc = Earthdawn.getAttrBN( cID, "NPC", "0" );
//            if(( mooks && ( npc == "2" )) || ( notMooks && ( npc != "2" )) || ( NPCs && ( npc != "0" )) || ( PCs && ( npc == "0" ))) {
              if(( !mooks || ( npc == Earthdawn.charType.mook )) && ( !notMooks || ( npc != Earthdawn.charType.mook ))
                          && ( !NPCs || ( npc != Earthdawn.charType.pc )) && ( !PCs || ( npc == Earthdawn.charType.pc ))) {
                let TokenName = TokObj.get("name");
                if( TokenName.length < 1 )
                  TokenName = CharObj.get("name");
                edParse.tokenIDs.push(sel._id);
                objarr.push({ type: "token", name: TokenName, tokenObj: TokObj, characterObj: CharObj });
            } }
          });  // End for each selected token

        if( this.charID !== undefined ) {        // If we did not find any of this character in the selected tokens, look for unselected tokens with this charID.
          if( bust && ((objarr.length || 0) < 1 )) {
            let CharObj = getObj("character", this.charID);
            if ((typeof CharObj != 'undefined') && ( this.edClass.msg !== undefined )) {
              let page = this.FindPageOfPlayer( this.edClass.msg.playerid );
              let tkns = findObjs({ _pageid: page, _type: "graphic",  _subtype: "token", represents: this.charID });
              _.each( tkns, function (TokObj) {                   // Check all tokens on the page.
                if( btuc && objarr.length > 0 )
                  return;
                let TokenName = TokObj.get("name");
                if( TokenName.length < 1 )
                    TokenName = CharObj.get("name");
                edParse.tokenIDs.push( TokObj.get("id") );
                objarr.push({ type: "token", name: TokenName, tokenObj: TokObj, characterObj: CharObj });
              }) // End ForEach Token
            }; // End charObj found
          } // End - This characters token was not selected. Search for it.

          if( bc && (objarr.length || 0) == 0) {
            let CharObj = getObj("character", this.charID);
            if (typeof CharObj != 'undefined')
              objarr.push({ type: "character", name: CharObj.get("name"), characterObj: CharObj });      // All we have is character information.
          }
          else if ( (bsct || binmt) && objarr.length > 1 && Earthdawn.getAttrBN( this.charID, "NPC", "0" ) != Earthdawn.charType.mook ) {
              this.chat( "Error! ForEachToken() with non-mook character and more than one token for that character, none of which were selected.", Earthdawn.whoFrom.apiError);
              objarr = [];
        } }

                // Now that we have a list of tokens, have the parser go through each remaining items in the command line individually, once for each token.
        if( (objarr.length || 0) > 0) {
          if( flag === 1 )
            return objarr;
          else if ( flag === 2) {
            let edpS1 = edParse.tokenInfo,
              edpS2 = edParse.charID,
              ret = false;
            _.each( objarr, function ( obj ) {
              edParse.tokenInfo = obj;
              edParse.charID = obj.characterObj.get( "id");
              if( edParse.TokenGet( status ).length > 0 )
                ret = true;
            }); // End for each Token
            edParse.tokenInfo = edpS1;
            edParse.charID = edpS2;
            return ret;
          } else {
            let miscsave = _.clone( edParse.misc );     // Otherwise this gets passed by reference and all copies end up sharing the same object. So save a clone, and explicitly clone the clone back in.
            this.indexToken = 0;
            _.each( objarr, function ( obj ) {
              let newParse = _.clone( edParse );
              newParse.misc = _.clone( miscsave );
              newParse.tokenInfo = obj;
              newParse.charID = obj.characterObj.get( "id");          // Make sure that charID is set to the correct character for this token.
              if( newParse.tokenInfo.type === "token" && newParse.tokenInfo.tokenObj.get("id") !== edParse.tokenIDs[ edParse.indexToken] )
                newParse.chat( "Warning! Possible error in ForEachToken() tokenID of " + newParse.tokenInfo.tokenObj.get("id") + " not equal " + edParse.tokenIDs[ edParse.indexToken], Earthdawn.whoFrom.apiError);
              newParse.checkForStoredTargets();
              ++edParse.indexToken;
            }); // End for each Token
          }
          edParse.indexMsg = edParse.edClass.msgArray.length;         // Set edParse to be Done for the original copy (since have already done it for each copy).
//log( "outside ForEachToken loop");
        } else {
          this.chat( "Error! No token selected.", Earthdawn.whoFrom.apiWarning );
          this.indexMsg = this.edClass.msgArray.length;
        }
      } catch(err) { this.edClass.errorLog( "ED.ForEachToken() error caught: " + err ); }
    } // End ParseObj.ForEachToken()



          // ParseObj.ForEachTokenList()
          // We have been passed a list of Token IDs. (generated by a previous threads call to ForEachToken()
          // One by one, do a ForEach loop for each token id.
    this.ForEachTokenList = function( ssa )  {
      'use strict';
      let edParse = this;
      try {
        this.tokenIDs = [];
        for( let i = 1; i < ssa.length; i++)
          this.tokenIDs.push( ssa[ i ] );
        for( this.indexToken = 0; this.indexToken < this.tokenIDs.length; this.indexToken++) {
          let TokObj = getObj("graphic", this.tokenIDs[ this.indexToken ]);
          if (typeof TokObj === 'undefined' )
            continue;

          let cID = TokObj.get("represents");
          let CharObj = getObj("character", cID) || "";
          if (typeof CharObj === 'undefined')
              continue;

          let TokenName = TokObj.get("name");
          if( TokenName.length < 1 )
            TokenName = CharObj.get("name");
          let newParse = _.clone( edParse );
          newParse.charID = cID;
          newParse.tokenInfo = { type: "token", name: TokenName, tokenObj: TokObj, characterObj: CharObj };
          newParse.checkForStoredTargets();
        }
        edParse.indexMsg = edParse.edClass.msgArray.length;         // Set edParse to be Done for the original copy (since have already done it for each copy).
      } catch(err) { this.edClass.errorLog( "ED.ForEachTokenList() error caught: " + err ); }
      edParse.indexMsg = edParse.edClass.msgArray.length;         // Set edParse to be Done for the original copy (since have already done it for each copy).
      return;
    } // End ParseObj.ForEachTokenList()



          //  If the current token has previously set targets, call forEachTarget().
          //  otherwise just call to ParseLoop as a targetlist is coming in a separate command.
    this.checkForStoredTargets = function() {
      'use strict';
      try {
        if( this.targetIDs.length !== 0 )
          this.chat( "Warning! checkForStoredTargets() already has targetIDs defined. Check for bugs.   Msg: " + this.edClass.msg.content + "   Index = " + this.indexMsg, Earthdawn.whoFrom.apiError);

        if( !( this.bFlags & Earthdawn.flagsTarget.Mask )
              || ( this.bFlags & (Earthdawn.flagsTarget.Ask | Earthdawn.flagsTarget.Riposte))
              || ( this.bFlags & Earthdawn.flagsTarget.Set ))   // target type is none or ask, so no target tokens involved.
          this.ParseLoop();
        else {
          let t = this.TokenGet( "TargetList" );
          if( t.length === 0)
            this.ParseLoop();
          else {    // a target list was stored for this token. Do all following commands for each target.
            this.targetIDs = t;
            this.forEachTarget();
        } }
      } catch(err) { this.edClass.errorLog( "ED.checkForStoredTargets() error caught: " + err ); }
      return;
    } // End ParseObj.checkForStoredTargets()




            // If coming from checkForStoredTargets() then we don't have ssa.
            //      If the current token has previously set targets, loop through for each target.
            //      otherwise just call to ParseLoop as a targetlist is coming in a separate command.
            // If ssa defined, then coming from Parse().
            //
            // Note that this routine is also the one that evaluates target defenses and finds the highest among all targets:
            // In which case the highest is the only target processed.
            // It also distributes multiple targets among multiple tokens.
    this.forEachTarget = function( ssa ) {
      'use strict';
      try {
        this.TokenSet( "clear", "Hit");     // Clear any hits that may be attached to any tokens.
        if( ssa !== undefined ) {       // ssa is a target list that should be stored.
          this.targetIDs = [];
          for( let i = 1; i < ssa.length; i++ )
              this.targetIDs.push( ssa[ i ] );
        }
        if( this.targetIDs.length === 0 )
          this.chat( "Warning! ForEachTarget() has no targets. Check for bugs.   Msg: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError);
        else {        // If we have targets (ether from preset targets or a TargetSet command)
              // If target is looking for highest one in the list, find it and call parseloop for that target only.
          if( this.bFlags & Earthdawn.flagsTarget.Highest ) {
            let highnum = -999;
            let highindex;
            for( this.indexTarget = 0; this.indexTarget < this.targetIDs.length; this.indexTarget++ ) {
              let x = this.TargetCalc( this.targetIDs[ this.indexTarget ], this.bFlags );
              if( x !== undefined && x[ "val" ] > highnum ) {
                highindex = this.indexTarget;
                highnum = x[ "val" ];
                this.misc[ "targetName" ] = x[ "name" ];
            } }
            if( highindex !== undefined ) {
              if( this.targetIDs.length > 1 )
                this.misc[ "targetName" ] += " and " + (this.targetIDs.length === 2 ? "1 other" : (( this.targetIDs.length -1 ).toString() + " others"));
                this.indexTarget = highindex;
                this.targetNum = (this.targetNum || 0) + highnum;
                this.ParseLoop();
            }
          } else {        // Do the action once for each target in target list.
            let cloneMisc = JSON.stringify( this.misc );
            for( this.indexTarget = 0; this.indexTarget < this.targetIDs.length; this.indexTarget++ ) {
                    // We are at a place where the action is done once for each target list.
                    // However, if we have multiple tokens, and multiple targets, evenly distribute the targets among the tokens.
                    // At this point we do this by ignoring any targets that don't get assigned to this token.
              if ( this.tokenIDs.length < 2 || ( this.indexTarget % this.tokenIDs.length) == (this.indexToken || 0 )) {
                let newParse = _.clone( this );
                newParse.misc = JSON.parse( cloneMisc );    // Make certain we get rid of stuff from the last loop.
                let x =  newParse.TargetCalc( newParse.targetIDs[ newParse.indexTarget ], newParse.bFlags );
                if( x !== undefined ) {
                  newParse.targetNum = (newParse.targetNum || 0) + x["val"];
                  newParse.misc[ "targetName" ] = x["name"];
                  newParse.ParseLoop();
            } } }
            this.indexMsg = this.edClass.msgArray.length;         // Set edParse to be Done for the origional copy (since have already done it for each copy).
        } }
      } catch(err) { this.edClass.errorLog( "ED.ForEachTarget() error caught: " + err ); }
      return;
    } // End ParseObj.ForEachTarget()




            // If this is not a damage roll, just call Roll()
            // If this is a damage roll, see if any of the tokens being processed, have a recorded hit.
            //    If so, call Roll once for each hit (which might be zero, one, or more).
            //    Otherwise, just call Roll once for each token.
    this.ForEachHit = function( ssa )  {
    'use strict';
      try {
        if( !( this.bFlags & Earthdawn.flagsArmor.Mask )) {     // This is not a damage roll, so just proceed to Roll().
          this.Roll( ssa );
          return;
        }
              // If this is the first token to be processed, find out if any tokens have hits.
        if( !(this.uncloned.bFlags & (Earthdawn.flags.HitsFound | Earthdawn.flags.HitsNot ))) {
          let fnd = false;
          for( let i = 0; !fnd && i < this.tokenIDs.length; ++i )
            if( this.TokenGetWithID( "Hit", this.tokenIDs[ i ] ).length > 0 )
              fnd = true;
          this.uncloned.bFlags |= fnd ? Earthdawn.flags.HitsFound : Earthdawn.flags.HitsNot;
        }

        if( this.uncloned.bFlags & Earthdawn.flags.HitsFound ) {
          this.targetIDs = this.TokenGet( "Hit" );
          if( this.bFlags & Earthdawn.flags.WillEffect ){   // if it is a will effect damage roll, there is only one roll made.
            this.indexTarget = 0;
            this.Roll( ssa );
          } else {      // Otherwise we make one roll per hit
            for( this.indexTarget = 0; this.indexTarget < this.targetIDs.length; ++this.indexTarget ) {
              var newParse = _.clone( this );
              newParse.Roll( ssa );
          } }
        } else  // No token has hits recorded. Just do it once for each token.
        this.Roll( ssa );
      } catch(err) { this.edClass.errorLog( "ED.ForEachHit() error caught: " + err ); }
      return;
    } // End ParseObj.ForEachHit()



          // Special Effects.
          // This routine does two things. Records the user requested FX in the character sheet, and actually displays it on the VTT.
          // If ssa [ 0 ] == FXset then a button has been pressed to set FX to a Talent, Knack or Spell.
          // If it is a string that contains an FX entry, Then we need to generate an FX display upon the VTT.
    this.FX = function( ssa )  {
      'use strict';
      try {
        if( typeof ssa === "string" ) {     // Being called from one of two places in Roll().
          let txt = "",
            ss = ssa.split( "," );
          if( ss[ 3 ].endsWith( "FTO" ) && (this.indexTarget || 0) != 0 )
            return;     // Effect is for first target only, and this is not the first target.
          let start = this.indexTarget || 0,
            end = start + 1;
          if( ss[ 0 ].toLowerCase() === "effect" && start == 0 )    // Effect tests usually (possibly always) only come through here once, so we need to simulate going through once per target.  Everything else should be going through this routine once per target already.
            end = this.targetIDs.length;

          for( let ind = start; ind < end; ++ind ) {
            let typ = (ss[ 1 ] + "-" + ss[ 2 ]).toLowerCase();
            if( ss[ 1 ].startsWith( "Custom " )) {        // Custom Effect
              let cust = findObjs({ _type: 'custfx', name: ss[ 1 ].slice( 7 ) })[0];
              if( cust && cust.get( "_id" ))
                typ = cust.get( "_id" );
              else {
                this.chat( "Error! Invalid Custom FX Name: '" + ss[ 1 ] + "'. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiWarning );
                return;
              }
            } // End custom effect.
            if (ss[ 3 ].startsWith( "Ct" )) {     // An effect that travels between two points.
              if( this.tokenIDs == undefined || (this.tokenIDs[ this.indexToken || 0]) >= this.tokenIDs.length )
                this.edClass.errorLog( "Error! bad tokenID in FX. Msg is: " + this.edClass.msg.content);
              else if (this.targetIDs [ ind ] == undefined)
                this.edClass.errorLog( "Error! targetIDs[] undefined in FX. Msg is: " + this.edClass.msg.content);
              else {
                let tokObj1 = getObj("graphic", this.tokenIDs[ this.indexToken || 0 ] ),    // Caster
                  tokObj2 = getObj("graphic", Earthdawn.getParam( this.targetIDs [ ind ], 1, ":"));     // Target.
                if( !tokObj1 )
                  this.edClass.errorLog( "Error! Unable to get Caster Token in FX. Msg is: " + this.edClass.msg.content);
                else if ( !tokObj2 )
                  this.edClass.errorLog( "Error! Unable to get Target Token " + ind + " (" + this.targetIDs [ ind ] + ") in FX. Msg is: " + this.edClass.msg.content);
                else
                  spawnFxBetweenPoints({x: tokObj1.get( "left" ), y: tokObj1.get( "top" )}, {x: tokObj2.get( "left" ), y: tokObj2.get( "top" )}, typ, tokObj1.get( "_pageid" ));
              }
            } else {                        // A single point effect.
              let tokObj = getObj("graphic", (ss[ 3 ].startsWith( "CO" )) ? this.tokenIDs[ this.indexToken || 0 ]
                    : Earthdawn.getParam( this.targetIDs [ ind ], 1, ":"));     // Caster or Target.
              if( tokObj )
                spawnFx( tokObj.get( "left" ), tokObj.get( "top" ), typ, tokObj.get( "_pageid" ));
              else
                this.edClass.errorLog( "Error! Unable to get Token in FX. Msg is: " + this.edClass.msg.content);
          } }
        } else if( ssa[ 0 ].toLowerCase() === "fxset" ) {     // Being called from Parse().
                  // FXset: (1)(code): (2)(rowID): (3)Set/Clear: (4)Attempt/Success: (5)Effect: (6)Color
          let aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: Earthdawn.buildPre( ssa[ 1 ], ssa[ 2 ] ) + "FX" }),
            to = "";
          if (ssa[ 3 ] === "Set" ) {    // If not Set, it is Clear, so just leave the empty string.
            if( ssa[ 5 ].startsWith( "Custom " ))
              ssa[ 6 ] = "";      // Custom effects ignore color.
            ssa[ 5 ] = ssa[ 5 ].replace( /}/g, "");     // Due to a system bug, I get an extra closing brace. Just remove it here.
            let typ = ssa[ 5 ].toLowerCase();
            if( ssa[ 7 ].startsWith( "Ct" ) && ( typ !== "beam" && typ !== "breath" && typ !== "splatter" && !typ.startsWith( "custom" )))
              this.chat( "Warning! Only Beam, Breath, Splatter and Custom special effects can travel from the caster to a target. All others must affect only a single point, caster or targets. Try again.", Earthdawn.whoFrom.apiWarning );
            else if( !ssa[ 7 ].startsWith( "Ct") && ( typ == "beam" || typ == "breath" || typ == "splatter" ))
              this.chat( "Warning! Beam, Breath, and Splatter special effects must travel from the caster to a target. Try again.", Earthdawn.whoFrom.apiWarning );
            else
              to = ssa.slice( 4 ).toString();
            this.chat( "Special Effects for " + Earthdawn.codeToName( ssa[ 1 ] ) + " "
                + Earthdawn.getAttrBN( this.charID, Earthdawn.buildPre( ssa[ 1 ], ssa[ 2 ]) + "Name") + " Set." );
          } else
            this.chat( "Special Effects for " + Earthdawn.codeToName( ssa[ 1 ] ) + " "
                  + Earthdawn.getAttrBN( this.charID, Earthdawn.buildPre( ssa[ 1 ], ssa[ 2 ]) + "Name") + " Cleared." );
          Earthdawn.set( aobj, "current", to );
        } else
        this.chat( "Error! badly formed FX command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiWarning );
      } catch(err) { this.edClass.errorLog( "ED.FX error caught: " + err ); }
    } // End ParseObj.FX()



                    // return the token name of the passed tokenID
    this.getTokenName = function( tID ) {
      'use strict';
      try {
        let TokenObj = getObj( "graphic", tID);
        if (typeof TokenObj === 'undefined' )
          return;

        let TokenName = TokenObj.get( "name" );
        if( TokenName === undefined || TokenName.length < 1 ) {
          var CharObj = getObj( "character", TokenObj.get( "represents" )) || "";
          if (typeof CharObj === 'undefined' || CharObj == "")
            return;
          TokenName = CharObj.get("name");
        }
        return TokenName;
      } catch(err) { this.edClass.errorLog( "ED.getTokenName() error caught: " + err ); }
    } // End ParseObj.getTokenName()



              // ParseObj.GetTokenStatus()
              // ca:      Condition Array [0]: Code, [1] multiplier.
              // cID:     character ID
              // sm       status markers.
              //
              // Return:
    this.GetTokenStatus = function( ca, cID, sm )  {
      'use strict';
      let ret = 0;
      try {
log("GetStatusToken ( " + JSON.stringify(ca) + " , " + JSON.stringify(sm) + " ) ")
        let mi = _.find( Earthdawn.StatusMarkerCollection, function(mio){ return mio["code"] == ca[ 0 ]; });
        if( mi !== undefined )
          ret = Earthdawn.parseInt2( getAttrByName( cID, mi["attrib"], 0 )) * ca[1];
      } catch(err) { this.edClass.errorLog( "ED.GetTokenStatus() error caught: " + err ); }
//log( "ca " + ca + "   ret " + ret);
            return ret;
    } // End ParseObj.GetTokenStatus()



              // ParseObj.GetTokenValue()
              // We are passed a character attribute and a token ID.
              // Call finishTokenValue to process the value we look up.
              // Note: this part needs finishing later.
              // Lookup the value and modify it by all conditions of the character and status markers of each token.
              // Note that the TokenID may not be the current this.tokenInfo ID. It may be a target ID.
              // Return fallout
    this.getTokenValue = function( attrib, tokenID )  {
      'use strict';
      let ret = 0;
      try {
        let TokObj = getObj("graphic", tokenID.trim());
        if (typeof TokObj === 'undefined' )
          this.chat( "Error! Bad Token. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError);
        else {
          let cID = TokObj.get("represents");
          if ( cID === undefined || cID.length < 3 )
            this.chat( "Error! Token not linked to character. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError);
          else {
            switch( attrib ) {
              case "PD":
              case "MD":
        // Temporary code until the more complex stuff can be done.
              case "SD":
              ret = getAttrByName( cID, attrib );
//log( ret);
//                            bases = [ attrib + "-Base", "Adjust-Defenses-Misc"];
//                            conditionsPlus = [ ["cover", 1], ["defensive", 3] ];
//                            if(attrib == "PD")
//                                conditionsMinus = [ ["harried", 1], ["surprised", 3], ["aggressive", 3], ["blindsided", 2], [ "Shield-Phys" ], ["knocked", 3] ];
//                            else
//                                conditionsMinus = [ ["harried", 1], ["surprised", 3], ["aggressive", 3], ["blindsided", 2], [((attrib == "PD") ? "Shield-Phys" : "Shield-Myst" )], ["knocked", 3] ];
              break;
//                        case "SD":
//                            bases = ["SD"];
//                            break;
            }
/*
log( bases.length);
                        _.each( bases, function (base) {
                            ret += Earthdawn.parseInt2( getAttrByName( cID, base ));
log( "t  " + t +  "  raw  " + ret);
                        }) // End ForEach base in bases

log( 444);
                        Earthdawn.getStatusMarkerCollection();
                        _.each( conditionsPlus, function (condition) {
                            ret += this.getTokenStatus( condition, cID, sm )
                        }) // End ForEach base in bases


   _.each( conditionsMinus, function (condition) {
                            ret -= this.getTokenStatus( condition, cID, sm )
                        }) // End ForEach base in bases
*/
// CDD Todo   Note don't get final value, get raw value and then look for both character sheet and token mods. If ether appears, apply the moe. but don't do both.
/*
Get these in pairs, char sheet attrib and token status, get them ORed, then figure mod.
            var val = getInt( values, "Adjust-Defenses-Misc") + getInt( values, "condition-Cover") + (getInt( values, "combatOption-DefensiveStance") * 3) -
                    ( getInt( values, "condition-Harried") + (getInt( values, "condition-Surprised") * 3) + (getInt( values, "combatOption-AggressiveAttack") * 3) +
                    ( getInt( values, "condition-Blindsided") *2) + (getInt( values, "condition-KnockedDown") *3) );
            setAttrsLog({ "Adjust-Defenses-Total": val });
            var val = getInt( values, "PD-Base") + getInt( values, "Adjust-Defenses-Total" ) -
                        (( values[ "condition-Blindsided"] == "1" ) ? getInt( values, "Shield-Phys" ) : 0);
            setAttrsLog({ "PD": val });
*/
          } // End cID defined
        }  // End TokObj defined
      } catch(err) { this.edClass.errorLog( "ED.GetTokenValue() error caught: " + err ); }
      return ret;
    } // End ParseObj.GetTokenValue()



          // if subfunct is 1, return collection of selected token ids and character ids, grouped by character.
          // if subfunct is 2, return list of selected character tokens, ungrouped.
          // This is an easy way to see how many different charcters are selected.
    this.getUniqueChars = function( subfunct )  {
      'use strict';
      try {
        let arr = [];
        _.each( this.edClass.msg.selected, function( sel ) {                // Check selected tokens
            let TokObj = getObj( "graphic", sel._id );
            if (typeof TokObj === 'undefined' )
                return;
          if ( TokObj.get( "_subtype" ) !== "token")
            return;
          let cID = TokObj.get("represents");
          if( cID )
            arr.push( { token: TokObj.get("_id"), character: cID });
        });
        return (( subfunct === 1) ? _.groupBy( arr, "character" ) : arr );
      } catch(err) { this.edClass.errorLog( "ED.getUniqueChars() error caught: " + err ); }
    } // End getUniqueChars()




          // attrib is an attribute to lookup. Get the value with all safety. Return the result. It should never return a null, and will return a zero instead.
          // cID (optional) defaults to this.charID
          // fSpecial (optional) if 1 then return value as a string, not a number.
          //
          // Note that this routine now should work with character sheet autocalculated fields.
    this.getValue = function( attrib, cID, fSpecial ) {
      'use strict';
      let ret = 0;
      try {
        if( attrib !== undefined ) {
          if( (typeof attrib) == "string" )
            attrib = attrib.trim();
          if( !isNaN( attrib) )            // If it is a number, just use it as a modifier to any result obtained elsewhere.
            ret = attrib;
          else {        // We have a string of some sort, quite possibly a variable name.
            if( cID === undefined )
              if( this.charID === undefined )
                this.chat( "Error! charID undefined in getValue() command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError);
              else
                cID = this.charID;
            let raw;        // Note: While we replaced most getAttrByName with getAttrBN, we leave these here in hope of getting real defaults.
            if( attrib.endsWith( "_max" ))
              raw = getAttrByName( cID, attrib.slice( 0, -4), "max");
            if( raw === undefined )
              raw = getAttrByName( cID, attrib );       // Treat this as a raw variable name and see what we get.
            if( raw === undefined || raw === "")      // Bug in getAttrByName() when dealing with repeating values, returns undefined if the value does not exist rather than the default value. This value might (or might not) be valid. Return zero for want of anything better to do.
              ret = "0";
            else if( !isNaN( raw ) )    // We have an actual number to use
              ret = raw;
            else {              // we probably have a formula for getting an actual number.
              let processed = raw,
                begin = raw.indexOf( "@{" ),
                end,
                err = false;
              while ( !err && begin != -1 ) {
                end = processed.indexOf( "}" );
                if( end < begin )
                  err = true;
                else {
                  let tst = processed.slice( begin + 2, end);
                  if( attrib.startsWith( "repeating_" ) && tst.startsWith( Earthdawn.repeatSection( 3, attrib) + "_" ))   // if the original attrib has a listed repeating section and rowID, and the derived numbers are from the same section, add the prefix to all the derived numbers.
                    tst = Earthdawn.buildPre( attrib ) + tst.slice( tst.indexOf( "_" ) +1);
                  processed = processed.slice(0, begin) + this.getValue( tst ) + processed.slice( end + 1);
                  begin = processed.indexOf( "@{" );
              } }
              if( err )
                this.chat( "Error! getValue() failure. '" + attrib + "' = '" + raw + "'   Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError);
              else
                ret = eval( processed );
        } } }
      } catch(err) { this.edClass.errorLog( "ParseObj.getValue() error caught: " + err ); }
//if( fSpecial == 2) log( "ret: '" + ret + "'");    // fSpecial == 2 is just an easy way to get logging on some values but not others.
//if( fSpecial == 2) log( "ret: '" + Earthdawn.parseInt2(ret) + "'");
    return ( fSpecial === 1 ) ? ret : Earthdawn.parseInt2( ret);
    } // End ParseObj.getValue()



          // ParseObj.Karma ( ssa )
          // This one routine should work with both version 2.0 and before, but the two versions work different and take different calls.
          // Set the correct karma bonus and Devotion Points into misc.karmaDice, and adjust the karma and DP total.
    this.Karma = function( ssa, kcdef, dpdef )  {
      'use strict';
      try {
        if( this.tokenInfo === undefined ) {
          this.chat( "Error! tokenInfo undefined in Karma() command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError);
          return;
        }
        let kdice = 0,
          ddice = 0,
          kAsk = false,
          dAsk = false;
        if( "kask" in this.misc) {
          kdice = Earthdawn.parseInt2( this.misc[ "kask" ]);
          if( kdice < 0 )
            kdice = 0;
          if( kdice < 17 )      // This is a boundry, if kdice > 16, then don't set kAsk to true, so Auto will be used.
            kAsk = true;
        }
        if( "dpask" in this.misc) {
          ddice = Earthdawn.parseInt2( this.misc[ "dpask" ]);
          if( ddice < 0 )
            ddice = 0;
          if( ddice < 17 )
            dAsk = true;
        }
        if( state.Earthdawn.sheetVersion < 1.8 || (!_.isString( ssa) && !isNaN(ssa[ 1 ] ))) {
            // With version < 2.0, you are likely to get something called a "Karma-Control".
            //      ssa : Karma Control. -1 = Never, 0 or undefined = look to sheetwide karma. >1 = Always use this number of Karma.
            // Note: also accepts ssa[0] being "def", "kcdef", or "dpdef" and ssa[1] being a numeric literal value to use as default, with other actual values to follow.
            // Note: if kask and/or dpask are set, it just skips looking at karma control, so beware that an ask can overwrite karma control.
          if( _.isString( ssa ))
            ssa = [ "", ssa ];
          let ttmp, kc, dp,
            realkcdef = true,   // We want to know if we were passed a real default for karma control, or whether we are assuming a default.
            realdpdef = true;
          if( kcdef === undefined) {
            kcdef = -1;
            realkcdef = false;
          }
          if( dpdef === undefined || state.Earthdawn.g1879) {
            dpdef = -1;
            realdpdef = false;
          }
          if((ssa !== undefined) && (ssa.length > 0 ))
            for( let i = 1; i < ssa.length; i++) {
              let skip = false;
              kc = kcdef;
              dp = dpdef;
              ttmp = ssa[ i ];
              if( _.isString( ttmp )) {
                switch (ttmp.toLowerCase()) {
                  case "def":
                    kcdef = Earthdawn.parseInt2( ssa[ ++i ]);
                    dpdef = Earthdawn.parseInt2( ssa[ i ]);
                    realkcdef = true;
                    realdpdef = true;
                    skip = true;
                    break;
                  case "kcdef":
                    kcdef = Earthdawn.parseInt2( ssa[ ++i ]);
                    realkcdef = true;
                    skip = true;
                    break;
                  case "dpdef":
                    dpdef = Earthdawn.parseInt2( ssa[ ++i ]);
                    realdpdef = true;
                    skip = true;
                    break;
                }
                if( isNaN( ttmp )) {
                  if( !kAsk) {
                    let ttmp2 = Earthdawn.getAttrBN( this.charID, ttmp, realkcdef ? kcdef :   // Talents and NACs default to karma sometimes.
                        (ttmp === "Dummy" || ttmp.endsWith( "_T_Karma-Control" ) || ttmp.endsWith( "_NAC_Karma-Control" )
                              || (ttmp.startsWith( "SP-" ) && ttmp !== "SP-WilEffect-Karma-Control")) ? "0" : "-1" );
                    if( ttmp2 !== undefined && ttmp2 !== "") {
                      let kc2 = Earthdawn.parseInt2( ttmp2 );
                      if( !isNaN( kc2 ) )
                        kc = kc2;
                    }
                  }
                  if( state.Earthdawn.gED && !dAsk ) {
                    let ttmp2 = Earthdawn.getAttrBN( this.charID, ttmp.replace( /Karma-/g, "DP-"), realdpdef ? dpdef : "-1" );
                    if( ttmp2 !== undefined && ttmp2 !== "") {
                      let dp2 = Earthdawn.parseInt2( ttmp2 );
                      if( !isNaN( dp2 ) )
                        dp = dp2;
                  } }
                } else if( ssa[ 0 ].toLowerCase().startsWith( "d" ))    // If we got a number, and ssa[0] starts with d, then it is DP, otherwise karma.
                  dp = Earthdawn.parseInt2( ttmp );
                else
                  kc = Earthdawn.parseInt2( ttmp );
              }
              if( !kAsk && !skip )
                if (kc > 0)
                  kdice += kc;
                else if ( kc == 0 )
                  kdice += Earthdawn.getAttrBN( this.charID, "Karma-Roll", "0", true );
              if ( !dAsk && !skip )
                if (dp > 0)
                  ddice += dp;
                else if ( dp == 0 && state.Earthdawn.gED)
                  ddice += Earthdawn.getAttrBN( this.charID, "Devotion-Roll", "0", true );
            } // End for each ssa.
        } else {    // state.Earthdawn.sheetVersion 2.0 or greater
            // With Version >= 2.0 you will get a string.
            //    ssa: Dex-Karma
            // If this contains the word "karma" we also do the same thing with "DP".
            // (this assumes that if passed "Dex-Karma", then there will also be: Dex-Karma-Limit, Dex-Karma-Limit_max, Dex-Karma-Ask,
            // Dex-DP, Dex-LP-Limit, Dex-DP-Limit_max, and Dex-DP-Ask).

            // global karma has three modes, off, auto, and Ask.
            // Local karma has a max, and a value from 0 through max.  Auto
            // If global Off, no karma.   If Auto, use local.     If ask, and the spread of allowed values is greater than one, ask.
//          if( !_.isString( ssa ))
//            this.edClass.errorLog( "ParseObj.Karma() error, SSA is not a string in version 2.0" );
          if( !_.isString( ssa ))
            if( ssa.length < 2 )
              this.edClass.errorLog( "ParseObj.Karma() error, SSA is not a string and is of length less than 2 in version 2.0" );
            else
              ssa = ssa[ 1 ]

          if( !kAsk) {
            let kgm = Earthdawn.getAttrBN( this.charID, "KarmaGlobalMode", "0" );   // 0: Off, x: Auto, ?:Ask
            if( kgm !== "0" ) {   // If not in karma off mode
              let ttmp = Earthdawn.getAttrBN( this.charID, ssa, "0" )
              if (ttmp && ttmp > 0)
                kdice =  Earthdawn.parseInt2( ttmp );
          } }
          if( !dAsk) {
            let dgm = Earthdawn.getAttrBN( this.charID, "DPGlobalMode", "0" );    // 0: Off, 1: Auto, 2:Ask
            if( dgm !== "0" ) {   // If not in DP off mode
              let lastInd = ssa.lastIndexOf( "Karma" );
              if( lastInd !== -1 ) {
                let dpName = ssa.slice( 0, lastInd ) + "DP" + ssa.slice( lastInd + 5);  // Replace "karma" with "dp"
                let ttmp = Earthdawn.getAttrBN( this.charID, dpName, "0" )
                if (ttmp && ttmp > 0)
                  ddice =  Earthdawn.parseInt2( ttmp );
          } } } }

          if( kdice > 0 ) {   // Are we spending more than zero karma?
            let kstep = Earthdawn.parseInt2( Earthdawn.getAttrBN( this.charID, "KarmaStep", "4" )),
              currKarma;
            if( this.tokenInfo.type === "token" ) {
              currKarma = Earthdawn.parseInt2( this.tokenInfo.tokenObj.get( "bar1_value" ));
              if( isNaN( currKarma ) )
                currKarma = 0;
            } else {    // Karma is usually on the token bar, but we can set it in the character sheet.
              var attribute = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "Karma" }, 0);
              currKarma = Earthdawn.parseInt2( attribute.get( "current" ));
            }

            if( kdice > currKarma ) {
              this.chat( "Error! " + this.tokenInfo.name + " does not have " + kdice + " karma to spend.", Earthdawn.whoFrom.apiWarning );
              if( currKarma == 0 && Earthdawn.getAttrBN( this.charID, "Karma", 0) != 0)
                log( "Note: the above error probably mean the token is not linked correctly, since the character sheet has karma, but the token does not." )
                kdice = currKarma;
            }
            if( kdice > 0 ) {
              currKarma -= kdice;
              if( this.tokenInfo.type === "token" )
                Earthdawn.set( this.tokenInfo.tokenObj, "bar1_value", currKarma );
              else
                Earthdawn.setWithWorker( attribute, "current", currKarma, 0 );

              let corruptObj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "Creature-CorruptKarma" }, 0),
              corruptNum = Earthdawn.parseInt2(corruptObj.get( "current" )),
              realdice = Math.max( 0, kdice - corruptNum ),
              corrupted = kdice - realdice;
              if( corrupted > 0 ) {
                this.misc[ "CorruptedKarma" ] = corrupted;
                Earthdawn.set( corruptObj, "current", corruptNum - corrupted);
              }

              this.misc[ "karmaNum" ] = (("karmaNum" in this.misc) ? this.misc[ "karmaNum" ] : 0 ) + kdice;
              let tmp = "",
                dc = this.edClass.StepToDice( kstep );
              for( let ind = 1; ind <= realdice; ++ind )
                tmp += "+" + dc;
              this.misc[ "karmaDice" ] = (("karmaDice" in this.misc) ? this.misc[ "karmaDice" ] : "" ) + tmp;
              this.misc[ "effectiveStep" ] = (("effectiveStep" in this.misc) ? this.misc[ "effectiveStep" ] : 0 ) + (kdice * kstep);
//                        this.chat( this.tokenInfo.name + " spent " + kdice + " karma." );
            }
          } // End we are actually spending karma.

          if( ddice > 0 ) {     // Are we spending more than zero Devotion Points?    Note: Devotion is a bit simplier than karma, since it in on the sheet only, not in the token bar.
            let kstep = Earthdawn.getAttrBN( this.charID, "DevotionStep", "3", true );
            let attribute = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "DP" }, 0);
            let currDP = Earthdawn.parseInt2(attribute.get( "current" ));
            if( ddice > currDP ) {
                this.chat( "Error! " + this.tokenInfo.name + " does not have " + ddice + " Devotion Points to spend.", Earthdawn.whoFrom.apiWarning );
                ddice = currDP;
            }
            if( ddice > 0 ) {
              currDP -= ddice;
              Earthdawn.setWithWorker( attribute, "current", currDP, 0 );

              this.misc[ "DpNum" ] = (("DpNum" in this.misc) ? this.misc[ "DpNum" ] : 0 ) + ddice;
              let tmp = "",
                dc = this.edClass.StepToDice( kstep );
              for( let ind = 1; ind <= ddice; ++ind )
                tmp += "+" + dc;
              this.misc[ "karmaDice" ] = (("karmaDice" in this.misc) ? this.misc[ "karmaDice" ] : "" ) + tmp;
              this.misc[ "effectiveStep" ] = (("effectiveStep" in this.misc) ? this.misc[ "effectiveStep" ] : 0 ) + (ddice * kstep);
            }
          } // End we are actually spending DP.
        return;
      } catch(err) { this.edClass.errorLog( "ED.Karma() error caught: " + err ); }
    } // End ParseObj.Karma()



          // ParseObj.LinkToken ()
          // Make sure the character associated with CharID is ready to Link.
          // Link all selected tokens to this character.
          //
          // By default the routine both sets the token to some standards, and links it.
          // if ssa[1] is "SetToken", then set the token only, don't link it.
          // if ssa[1] is "LinkOnly" then link it, without setting any of the options.
    this.LinkToken = function( ssa ) {
      'use strict';
      try {
        if( this.charID === undefined ) {
            this.chat( "Error! Trying to Link Token when don't have a CharID.", Earthdawn.whoFrom.apiError );
            return;
        }
        if( this.tokenAction ) {
            this.chat( "Error! Linktoken must be a character sheet action, never a token action.", Earthdawn.whoFrom.apiError);
            return;
        }
        if( this.edClass.msg.selected === undefined ) {
            this.chat( "Error! You must have exactly one token selected to Link the character sheet to the Token.", Earthdawn.whoFrom.apiWarning);
            return;
        }
        let Count = 0;
        let pc = Earthdawn.getAttrBN( this.charID, "NPC", "0");
        if( pc == Earthdawn.charType.mook && this.edClass.msg.selected.length > 1 )
        {
            this.chat( "Error! You can't link more than one token to a non-mook character!", Earthdawn.whoFrom.apiWarning );
            return;
        }

        let edParse = this,
          sName = "";
        let CharObj = getObj( "character", edParse.charID ),
          setTokenOnly = (ssa && ssa.length > 1) ? ssa[1].search( /SetToken/i ) !== -1 : false,
          linkOnly = (ssa && ssa.length > 1) ? ssa[1].search( /LinkOnly/i ) !== -1 : false;

        _.each( this.edClass.msg.selected, function( sel ) {
          let TokenObj = getObj("graphic", sel._id);
//log( TokenObj );
          if (typeof TokenObj === 'undefined' )
              return;

          if( !setTokenOnly )
            Earthdawn.set( TokenObj, "represents", edParse.charID );
          sName = TokenObj.get( "name");
          if( sName === undefined || sName.length < 1 ) {
            if (typeof CharObj !== 'undefined' ) {
              sName = CharObj.get( "name" );
              Earthdawn.set( TokenObj, "name", sName );
          } }
          Earthdawn.set( TokenObj, "bar1_link", "");
          Earthdawn.set( TokenObj, "bar2_link", "");
          Earthdawn.set( TokenObj, "bar3_link", "");
          Earthdawn.set( TokenObj, "bar1_value", Earthdawn.getAttrBN( edParse.charID, "Karma", "0" ));
          Earthdawn.set( TokenObj, "bar1_max",   Earthdawn.getAttrBN( edParse.charID, "Karma_max", "0" ));
          Earthdawn.set( TokenObj, "bar2_value", Earthdawn.getAttrBN( edParse.charID, "Wounds", "0" ));
          Earthdawn.set( TokenObj, "bar2_max",   Earthdawn.getAttrBN( edParse.charID, "Wounds_max", "8" ));
          Earthdawn.set( TokenObj, "bar3_value", Earthdawn.getAttrBN( edParse.charID, "Damage", "0" ));
          Earthdawn.set( TokenObj, "bar3_max",   Earthdawn.getAttrBN( edParse.charID, "Damage_max", "20" ));
          if( !linkOnly ) {
            Earthdawn.set( TokenObj, "showname", true );
            Earthdawn.set( TokenObj, "showplayers_name",  ((pc == Earthdawn.charType.pc)
                    || (state.Earthdawn.tokenLinkNPC & Earthdawn.tokenLinkNPC.showplayers_name)) ? true : false);
            Earthdawn.set( TokenObj, "showplayers_bar1", (((pc == Earthdawn.charType.pc)
                    && (state.Earthdawn.tokenLinkNPC & Earthdawn.tokenLinkNPC.showplayers_pcKarma))
                    || ((pc != Earthdawn.charType.pc)
                    && (state.Earthdawn.tokenLinkNPC & Earthdawn.tokenLinkNPC.showplayers_karma))) ? true : false);
            Earthdawn.set( TokenObj, "showplayers_bar2",  ((pc == Earthdawn.charType.pc)
                    || (state.Earthdawn.tokenLinkNPC & Earthdawn.tokenLinkNPC.showplayers_wounds)) ? true : false);
            Earthdawn.set( TokenObj, "showplayers_bar3",  ((pc == Earthdawn.charType.pc)
                    || (state.Earthdawn.tokenLinkNPC & Earthdawn.tokenLinkNPC.showplayers_damage)) ? true : false);
            Earthdawn.set( TokenObj, "showplayers_aura1", true );
            Earthdawn.set( TokenObj, "showplayers_aura2", true );
            Earthdawn.set( TokenObj, "light_hassight", pc != Earthdawn.charType.object );
            let t = null;
            if( pc == Earthdawn.charType.pc ) {
              switch (state.Earthdawn.tokenLinkNPC & Earthdawn.tokenLinkNPC.pcMask) {
                case Earthdawn.tokenLinkNPC.pcOverTop:    t = "overlap_top";    break;
                case Earthdawn.tokenLinkNPC.pcOverBottom: t = "overlap_bottom"; break;
                case Earthdawn.tokenLinkNPC.pcBelow:    t = "below";      break;
              }
              Earthdawn.set( TokenObj, "bar_location", t );
              Earthdawn.set( TokenObj, "compact_bar", ((state.Earthdawn.tokenLinkNPC & Earthdawn.tokenLinkNPC.pcCompact) ? "compact" : null));
            } else {      // npc
              switch (state.Earthdawn.tokenLinkNPC & Earthdawn.tokenLinkNPC.npcMask) {
                case Earthdawn.tokenLinkNPC.npcOverTop:   t = "overlap_top";    break;
                case Earthdawn.tokenLinkNPC.npcOverBottom:  t = "overlap_bottom"; break;
                case Earthdawn.tokenLinkNPC.npcBelow:   t = "below";      break;
              }
              Earthdawn.set( TokenObj, "bar_location", t );
              Earthdawn.set( TokenObj, "compact_bar", ((state.Earthdawn.tokenLinkNPC & Earthdawn.tokenLinkNPC.npcCompact) ? "compact" : null));
          } }
          if( !setTokenOnly && ( pc == Earthdawn.charType.pc || pc == Earthdawn.charType.npc )) {        // unique PC or NPC (not a mook).
              let kobj  = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: edParse.charID, name: "Karma" }, 0);
              let kid = kobj.get("_id");
              if( kid !== undefined )
                Earthdawn.set( TokenObj, "bar1_link", kid );
              kobj  = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: edParse.charID, name: "Wounds" }, 0);
              kid = kobj.get("_id");
              if( kid !== undefined )
                Earthdawn.set( TokenObj, "bar2_link", kid );
              kobj  = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: edParse.charID, name: "Damage" }, 0);
              kid = kobj.get("_id");
              if( kid !== undefined )
                Earthdawn.set( TokenObj, "bar3_link", kid );
          } // End not mook

          if (!setTokenOnly && typeof CharObj != 'undefined' ) {
            setDefaultTokenForCharacter( CharObj, TokenObj);
            Count = Count + 1;
            if( !CharObj.get( "avatar" ))
              Earthdawn.set( CharObj, "avatar", TokenObj.get( "imgsrc" ) );
          }
        });  // End for each selected token
        if( Count == 0) {
          if ( !setTokenOnly )
            this.chat( "Error! No selected token to link.", Earthdawn.whoFrom.apiError | Earthdawn.whoTo.player);
        } else      // _defaulttoken is readonly, so user must do the last step.
          this.chat( "Token " + sName + " is linked.", Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive );
      } catch(err) { this.edClass.errorLog( "ED.LinkToken error caught: " + err ); }
    } // End ParseObj.LinkToken()




          // ParseObj.Lookup()
          // We are passed a character attribute and/or a modifier to an attribute. Lookup the value(s) from the character sheet.
          // Note: This is setup like this so that several tags can direct to the same function, and that ether PD or @(PD) will work.
          // Note also that the 2nd value is an ssa structure, so in most cases the very first item is ignored. In the example below mod is
          // ignored by this routine (it was used to direct the parser to this routine).
          //      mod : PD : -2       // Find the Physical Defense, subtract 2 from it, and place it in "step" or add it to what is already there.
          //
          // wherePlace:  Where does the result go?  1 = this.misc.step, 2 = this.misc.result, 3 - this.targetNum.
          //        4 - The character sheet attribute named in ssa[1].
          //
          // Note that if we are told to lookup a value that is an autocalculated field, it passes control to an asynchronous callback function to accomplish it.
          // Return: whether Parse should fallout or not. IE: return false unless this thread has launched an asynchronous callback.
    this.Lookup = function( wherePlace, ssa )  {
      'use strict';
// log("this.Lookup " + JSON.stringify(ssa));
      try {
        if( ssa.length < 2 ) {
            this.chat( "Error! Lookup() not passed a value to lookup. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError );
            return false;
        }
        let lu = 0,
          rcmd = "",
          i = 0,
          attName;

            // luResult()
            // Put the result that was looked up in the correct variable.
        function luResult( what, po )  {
          'use strict';
          if( what !== undefined )
            switch( wherePlace ) {
            case 1:     po.misc[ "step" ]   = ( po.misc[ "step" ] || 0) + what - po.mookWounds();       break;
            case 2:     po.misc[ "result" ] = ( po.misc[ "result" ] || 0) + what;     break;
            case 3:     po.targetNum      = ( po.targetNum || 0) + what;  break;
            case 4:
//log( "lookup " + attName + "   " + what);
              let attribute = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: attName });
              let old = attribute[ "current" ];
              Earthdawn.setWithWorker( attribute, "current", what);

              switch( attName ) {
                case "Misc-StrainPerTurn":
                case "Adjust-All-Tests-Misc":
                case "Adjust-Attacks-Misc":
                case "Adjust-Damage-Misc":
                case "Adjust-Defenses-Misc":
                case "PD-Buff":
                case "MD-Buff":
                case "SD-Buff":
                case "PA-Buff":
                case "MA-Buff":
                case "Adjust-Effect-Tests-Misc":
                case "Adjust-TN-Misc":
                  let m = new Map();
                  m.set( "name", attName );
                  m.set( "current", what );
                  m.set( "_characterid", po.charID );
                  Earthdawn.attribute( m, { name: attName, current: old, _characterid: po.charID } );
            } }
          return;
        } // end of luResult()


        if( wherePlace === 4 )
          attName = ssa[ ++i ];

        while( ++i < ssa.length ) {
          if( !isNaN( ssa[ i ]))            // If it is a number, just use it as a modifier to any result obtained elsewhere.
              lu += Earthdawn.parseInt2( ssa[ i ]);
          else {
              if( this.tokenInfo === undefined ) {
                  this.chat( "Error! tokenInfo undefined in Lookup() command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError);
                  return false;
              }
            switch ( ssa[ i ].toLowerCase() ) {
              case "defensive":     // This action is defensive. If Defensive Stance is turned on, add 3 to compensate for the three that were subtracted previously.
                if( Earthdawn.getAttrBN( this.charID, "combatOption-DefensiveStance", "0" ) === "1" ) {
                  lu += Earthdawn.getAttrBN( this.charID, "Misc-DefStance-Penalty", "3" );
                  this.misc[ "Defensive" ] = true;  // Since step was modified for being defensive, tell people.
                } break;
              case "resistance":    // This action is a Resistance Roll. If character is knocked down, add 3 to compensate for the three that were subtracted previously.
                if( Earthdawn.getAttrBN( this.charID, "condition-KnockedDown", "0" ) === "1" ) {
                  lu += 3;
                  this.misc[ "Resistance" ] = true;
                } break;
              case "movebased": {   // This action is Movement Based. If Movement Penalties are in effect, subtract them from this result.
                let tstep = Earthdawn.getAttrBN( this.charID, "condition-ImpairedMovement", "0" );
                if( tstep > 0 ) {
                  lu -= tstep;
                  this.misc[ "MoveBased" ] = (tstep == 2) ? "Partial" : Full;
                }
              } break;
              case "visionbased": { // This action is Vision Based. If Vision Penalties are in effect, subtract them from this result.
                let tstep = Earthdawn.getAttrBN( this.charID, "condition-Darkness", "0" );
                if( tstep > 0 ) {
                  lu -= tstep;
                  this.misc[ "VisionBased" ] = (tstep == 2) ? "Partial" : Full;
                }
              } break;
              default:
                let raw;
                if( ssa[ i ].charAt( 1 ) === "{" && ( ssa[ i ].charAt( 0 ) != "?" && ssa[ i ].charAt( 0 ) != "@" ))     // We want to filter out things that come from stuff like      modValue : x{Modification|0}
                  raw = 0;
                else {
                  raw = getAttrByName( this.charID, ssa[ i ] );
                  if( raw !== undefined )
                    if( (typeof raw === "number") || (raw.indexOf( "@{") === -1))           // We have an actual number to use
                      lu += Earthdawn.parseInt2( raw );
                    else                            // we have a formula for getting an actual number.
                      rcmd += "+(@{" + this.tokenInfo.characterObj.get( "name" ) + "|" + ssa[ i ] + "})"
          } }   }
        } // end for each ssa item

        if( rcmd === "" )
          luResult( lu, this );
        else {              // The main thread is to STOP PROCESSING THIS ITERATION! Control is being passed to callback thread.
          let po = this;  // We are sending the string to the roll server for it to parse and add up for us.
          sendChat( "API", "/r [[" + rcmd.slice( 1 ) + "]]", function( ops ) {
            'use strict';
                                    // NOTE THAT THIS IS THE START OF A CALLBACK FUNCTION
            let RollResult = JSON.parse(ops[0].content);
            luResult( lu + RollResult.total, po );
            po.ParseLoop();         // This callback thread is to continue parsing this.
          }, {noarchive:true});  // End of callback function
          return true;
        }
      } catch(err) { this.edClass.errorLog( "ED.Lookup() error caught: " + err ); }
      return false;
    } // End Lookup()



            // ParseObj.MacroDetail()
            // Check if named Macro Exists, if it does, delete it. then create it again.
            // macName: Name of Macro
            // macText: Text of Macro
            // macTokenAction: true of this is a token action.
    this.MacroDetail = function( macName, macText, macTokenAction )  {
      'use strict';
      try {
        let macObj = findObjs({ _type: "macro", name: macName });
        if( macObj )
          for( let i = 0; i < macObj.length; ++i )
            macObj[ i ].remove();
        macObj = createObj("macro", {
              _playerid:      this.edClass.msg.playerid,
              name:           macName,
              action:         macText,
              visibleto:      "all",
              istokenaction:  macTokenAction });
      } catch(err) { this.edClass.errorLog( "ED.MacroDetail error caught: " + err ); }
    } // End ParseObj.MacroDetail()



          // ParseObj.MarkerSet ( ssa )
          // Set the Status Markers for current tokens
          //  ssa[ 0 ] This does not matter, except if it is "sheetDirect", then the value has been directly changed on the sheet, and we
          //      want to set the status marker, but we do NOT want to update the value on the sheet (again).
          //  ssa[ 1 ] is condition to be set OR name of marker to be set. IE: "aggressive" or "sentry-gun" both set the same marker.
          //  ssa[ 2 ] level. If boolean false, -1 or start with letter the letter U (unset) or O (for off - but not equal ON), remove the marker.
          //                  If zero or not present or is ON or starts with S (set), set the marker without a badge.
          //          If starts with a "t" than toggle it from set to unset or visa versa, or if more than two valid values, to the next value in the sequence.
          //          If it starts with a z, expect a numeric value, except in this specific case, a zero means unset.
          //                  If 1 - 9, or A-I set the marker with the number as a badge.
          //                          Note: there is a weird thing in linking a token where it is better to have no digits in the menu. thus A-I substitute for 1-9.           //                  If ++, --, ++n, or --n then adjust from current level.
          //          NOTE: if the marker status collection has a submenu, it is important to pass exactly values in the submenu, IE: u for unset, b for 2, etc.
          //  Example: [ "", "aggressive", "Set"] or [ "", "sentry-gun", "Off"].
    this.MarkerSet = function( ssa )  {
      'use strict';
      try {
//log("this.MarketSet ssa is : " + JSON.stringify(ssa));
        if( this.tokenInfo === undefined ) {
          this.chat( "Error! tokenInfo undefined in MarkerSet() command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError);
          return;
        }
        if( this.tokenInfo.type === "token" ) {

                  // Find the status, icon, or attribute in the StatusMarkerCollection.
          function findMenuItem( lookup ) {   // This is reused at the bottom of MarkerSet.
            'use strict';
            let lowered = lookup.toLowerCase(),
              t = "code";
            let mi = _.find( Earthdawn.StatusMarkerCollection, function(mio){ return mio[ "code" ] == lowered; });    // ( karmaauto )
            if( mi === undefined ) {
              t = "icon";
              mi = _.find( Earthdawn.StatusMarkerCollection, function(mio){ return mio[ "icon" ] == lowered; });      // try it again with icon instead of code ( lightning-helix ).
            }
            if( mi === undefined ) {
              t = "customTag";
              mi = _.find( Earthdawn.StatusMarkerCollection, function(mio){ return mio[ "customTag" ] == lookup; });  // ( 001-Karma-On ). Note that customTag has not been lowercased.
            }
            if( mi === undefined ) {
              t = "attrib";
              mi = _.find( Earthdawn.StatusMarkerCollection, function(mio){ return mio[ "attrib" ] == lookup; });     // Finally, try looking for an attribute ( KarmaGlobalMode ).
            }
            if( mi === undefined )
              return;
            return { item: mi, type: t };
          } // end function findMenuItem()


          let tmp = findMenuItem( ssa[ 1 ] );
//log( ssa[1]); log(tmp);
          if( tmp === undefined )
            return;     // This is not an icon we are interested in.
          let po = this,
            mi = tmp.item,
            luType = tmp.type,
            sm = mi[ "submenu" ],
            code = mi[ "code" ],
            attrib = mi[ "attrib" ],
            oldAttValue,
            newAttValue,
            shared = (mi[ "shared" ] === undefined) ? 1 : mi[ "shared" ],
            neg = (typeof shared !== 'string') ? false : shared.slice(0, 3).toLowerCase() === "neg",
            ss,
            level,          // -1 is unset, 0 is set, 1-9 is set with badge.
            adjust = 0,     // if we get an increment or decrement instead.
            setObj,
            mook = (Earthdawn.getAttrBN( this.charID, "NPC", "0" ) == Earthdawn.charType.mook ),
            dupChar = false,
            valid = [{ level: -1111, attrib: 0, badge: false, marker: Earthdawn.getIcon( mi ) }],   // unset is always valid.
            mia = _.filter( Earthdawn.StatusMarkerCollection, function(mio) { return mio[ "attrib" ] == attrib; });   // get an array of menu items with this attribute.

//log(mia);
          if( mia === undefined || mia.length === 0) {
            this.chat( "Earthdawn: Markerset error. '" + attrib + "' not be found in StatusMarkerCollection.", Earthdawn.whoFrom.apiWarning );
            return;
          }
          if( attrib )
            oldAttValue = Earthdawn.getAttrBN( this.charID, attrib, 0);

                // Go through each menuitem that uses the attribute found, to find a list of all valid values. This is used to validate and to toggle to next value.
          for( let i = 0; i < mia.length; ++i ) {
            let tshared = mia[ i ][ "shared" ],
              tsm = mia[ i ][ "submenu" ],
              mark = Earthdawn.getIcon( mia[ i ] );
            if(( tshared === undefined ) && ( tsm === undefined ))      // neither tsm nor tshared is defined. This is a simple on/off marker without expected badges.
              valid.push({ level: 0, attrib: 1, badge: true, marker: mark });   // When attribute is 1, set the icon (no badge).
            else if( tshared === undefined ) {    // tsm is defined, but tshared is undefined.
                        // This is a classic submenu such as "?{Impaired Vision|None,[0^u]|Partial,[2^b]|Full,[4^d]}"
              let sma = tsm.split( "|" ),     // break into menu items.
                fnd = 0;
              for( let i = 1; i < sma.length; ++i ) {
                let itma = sma[ i ].split( "," );     // break into prompt and code.
                if( itma.length > 1 ) {     // we have a menu that can be broken appart.
                  ++fnd;
                  let itm = itma[ 1 ].replace( "\[", "").replace( "\]", "" );   // remove brackets from code.
                  if( itm !== "0^u" ) {   // Unset with value 0 is already in array.


                    let kernals = itm.split( "^" ),
                      kb = kernals[ 1 ],
                      kb2 = kb;
                    if( kb != undefined ) {
                      if( kb === "s" )
                        kb2 = true;
                      if( kb === "u")
                        kb2 = false;
                      if(( kb >= "a") && ( kb <= "i" ))
                        kb2 = kb.charCodeAt( 0 ) - "a".charCodeAt( 0 ) + 1;
                      if(( kb >= "A") && ( kb <= "I" ))
                        kb2 = kb.charCodeAt( 0 ) - "A".charCodeAt( 0 ) + 1;
                      if( !isNaN( kernals[ 0 ] ))
                        if(!kb2)
                          valid[ 0 ].attrib = kernals[ 0 ];   //If we are in this loop, i.e. there is a submenu, but it is not "0^u", we should update the default unset attrib
                        else
                          valid.push({ level: Earthdawn.parseInt2( kernals[ 0 ]), attrib: Earthdawn.parseInt2( kernals[ 0 ]), badge: kb2, marker: mark });
//                        log("test " + JSON.stringify(valid));
              } } } }
              if( !fnd ) {      // A classic submenu was not found, so we seem to have a freeform numeric input.
                valid.push({ level: 0, attrib: 0, badge: true, marker: mark });
                for( let i = 1; i < 10; ++i )
                  valid.push({ level: i, attrib: i, badge: i, marker: mark });
              }
            } else if( tsm === undefined ) {      // tshared is defined, but tsm is undefined.  This means it is a check-box that has an on-value of something other than 1.
              let doit = true;
              if( luType === "code" && mia[ i ][ "code" ] != code )     // If somebody is trying to toggle karmaauto, then ignore karmaask as an option.
                doit = false;
              if( luType === "attrib" && (( attrib === "KarmaGlobalMode" && mia[ i ][ "code" ] === "karmaauto" )
                      || ( attrib === "DPGlobalMode" && mia[ i ][ "code" ] === "devpntauto" ))
                      && Earthdawn.getAttrBN( this.charID, "show_karma_auto", "0") == "0" )       // This is specific to karma auto being hidden, then the karma toggle should skip it.
                doit = false;
              if( doit )
                valid.push({ level: tshared, attrib: tshared, badge: true, marker: mark });       // when attribute is tshared, set the marker (no badge).
            } else                  // both tsm and tshared are defined.  This should be a pos or neg, and a freeform integer value.
              if( tshared.slice( 0, 3).toLowerCase() === "neg" ) {    // There are a pair of markers, one has negative buffs, and the other has positive buffs.
                for( let i = 9; i > 0; --i )
                  valid.push({ level: 0 - i, attrib: 0 - i, badge: i, marker: mark });
              } else if( tshared.slice( 0, 3).toLowerCase() === "pos" ) {
                for( let i = 1; i < 10; ++i )
                  valid.push({ level: i, attrib: i, badge: i, marker: mark });
              } else
                this.chat( "Earthdawn: Markerset Warning. Unable to parse " + JSON.stringify( mia[ i ] ), Earthdawn.whoFrom.apiWarning );
          } // end make list of validValues and validBadges
          valid = _.sortBy( valid, "level" );
//log( marker); log(mi); log( JSON.stringify( valid));

          if( ssa.length > 1 ) {    // This section sets level and adjust. See the declarations above and the comments at the top of the routine.
            if( ssa.length > 2 ) {
              if( typeof ssa[ 2 ] === "boolean" ) {
                if( ssa[ 2 ] === true )
                  ss = "s";
                else
                  ss = "u";
              } else if( typeof ssa[ 2 ] === "number" ) {
                ss = ssa[ 2 ];
                if( ss > 9 ) ss = 9;
                if( ss < 0 ) ss = 0;
                ss = ss.toString();
              } else
                ss = ssa[ 2 ].toLowerCase();
            } else
              ss = "s";   // if not passed, default is to set it.

            if( ss.substring( 0, 2) === "z0" )
              level = -1111;
            else if ( ss.substring( 0, 1 ) === "z" )
              ss = ss.slice( 1 );       // if it starts with a z, then there should be a numeric value following.
            if( ss.substring( 0, 2) === "--" )  // Decrement the current value by this amount.
              adjust = -1;
            else if ( ss.substring( 0, 2) === "++" || ss.substring( 0, 1) === "t")    // toggle is just ++ now, this will do binary or trynary toggles, or just cycle through whatever is there.
              adjust = 1;
            else if( ss.substring( 0, 1) == "s" || ss.substring( 0, 2) == "on" || ss.substring( 0, 1) == "0" || ss.substring( 0, 1) === "`" )        // On or Set.   Last is what you get if somebody does @0
              level = 0;            // set with no badge.
            else if( ss.substring( 0, 1) == "u" || ss.substring( 0, 1) == "o" || ss.substring( 0, 2) == "-1" )     // If starts with -1 or an O for Off or U for Unset.
              level = -1111;            // unset
            else if ( '0' <= ss[ 0 ] && ss[ 0 ] <= '9' )    // badges
               level = ss.charCodeAt( 0 ) - "0".charCodeAt( 0 );
            else if ( 'a' <= ss[ 0 ] && ss[ 0 ] <= 'i' )    // alphabetic badges
               level = ss.charCodeAt( 0 ) - "a".charCodeAt( 0 ) + 1;
            if( adjust != 0 && ss.length > 2 ) {        // This is for adjustments greater than one. ie: ++3
              let t = 1;
              if ( '0' <= ss[ 2 ] && ss[ 2 ] <= '9' )
                t = ss.charCodeAt( 2 ) - "0".charCodeAt( 0 ) + 1;        // 48 is zero
              else if ( 'a' <= ss[ 2 ] && ss[ 2 ] <= 'i' )
                t = ss.charCodeAt( 2 ) - "a".charCodeAt( 0 ) + 1;        // 97 is 'a'
              adjust = adjust * t;
            }
          } // end processing ssa
          if( level > 0 && neg )
            level *= -1;
              // at this point level is -1111 for unset, 0 for set, or a badge between 1 and 9. Adjust might be set, which will modify these these.


              // Given a potential level value, see if it is one of the expected values. If so return that valid item.
              // If not, find the closest one.
              // Rules: If lower than any option, round up to lowest option. If higher than any option, round down to highest option.
              //    Else round up to next highest option.
          function findMenu( val, attr ) {    // val is value to match. attr says whether it is to match attrib or level.
            let onValue;
            if( attr )
              onValue = _.find( valid, function( item ) { return item.attrib == val; });
            else
              onValue = _.find( valid, function( item ) { return item.level == val; });
            if( onValue !== undefined )
              return onValue;
            else {
              let low, high, rndup, rnddown;
              _.each( valid, function( item ) {
                if( low === undefined || item.level < low.level )
                  low = item;
                if( high === undefined || item.level > high.level )
                  high = item;
                if( item.level > val && (rndup === undefined || item.level < rndup.level ))
                  rndup = item;
                if( item.level < val && (rnddown === undefined || item.level > rnddown.level ))
                  rnddown = item;
              });
              if( rnddown === undefined ) return low;
              if( rndup === undefined ) return high;
              return rndup;
            }
          } // end findMenu


          if( adjust !== 0 ) {      // We are incrmenting or decrementing. Find out what the level used to be by looking at the attribute.
            let oldLevel;
            if( !("charIDsUnique" in this.uncloned.misc))
              this.uncloned.misc.charIDsUnique = [];
            let indx = this.uncloned.misc.charIDsUnique.indexOf( this.charID );
            if( indx != -1) {     // If we have already processed this character
              oldLevel = this.uncloned.misc.charIDsUnique[ indx + 1 ];
              dupChar = true;
            } else if( oldAttValue !== undefined ) {
              setObj = findMenu( oldAttValue, true );
              oldLevel = setObj.level;
              this.uncloned.misc.charIDsUnique.push( this.charID );
              this.uncloned.misc.charIDsUnique.push( oldLevel );
            }
                    // Now find the index in the array of the item we just found.
            let index = valid.indexOf( _.find( valid, function( item ) { return item.level == oldLevel; }));
            if( index === -1 ) {
              log( "Earthdawn markerSet serious error finding " + oldLevel + " giving up.");
              return;
            }
//log( "index " + index + "   adjust " + adjust);
            index += adjust;          // The list is sorted, so we can just add or subtract the index by the amount we are adjusting.
            if( index < 0 )           // if decremented past the begging, go to the end.
              index += valid.length;
            else if( index >= valid.length )   // if incremented past the  end, go to the beggining
              index -= valid.length;
            setObj = valid[ index ];
          } // end adjust

          if( !setObj && level !== undefined ) {          // make sure new level matches an option. If not pick best one.
            if( level !== -1111 && "shared" in mi && mi[ "shared" ].length < 5 )
              setObj = findMenu( mi[ "shared" ], true ); // if level 0, we need to get the RIGHT zero. Which convenently enough is the one in sm.
            else
              setObj = findMenu( level );
          }
//log( setObj);
          if( !setObj ) {
            this.chat( "Earthdawn: Markerset error. level is undefined.", Earthdawn.whoFrom.apiWarning );
            return;
          }
                    // end setting and/or adjusting level. We now know what we want to do.
                    // Do the actual marker setting.
//log( "level: " + level + "  setObj: " + JSON.stringify( setObj ));
          if( "marker" in setObj )
            Earthdawn.set( this.tokenInfo.tokenObj, "status_" + setObj[ "marker" ], setObj.badge );

                    // If this character has not already been done, also change the character sheet.
          if( ssa[ 0 ] !== "sheetDirect" && !dupChar && ( attrib != undefined ) && !(mook && attrib === "condition-Health" )) {
            let attribute = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: attrib }, 0);
            if( attribute[ "current" ] != setObj.attrib )
              Earthdawn.setWithWorker( attribute, "current", setObj.attrib );
//log( "set attrib " + setObj.attrib);
          } // End update the attribute.

                  // See if any other menu items share this attribute, and if so, unset those.
          if( mia !== undefined && mia.length > 1 ) {         // This only needs to be done if more than one is found.
            for( let i = 0; i < mia.length; ++i )
              if( Earthdawn.getIcon( mia[ i ] ) !== setObj[ "marker" ] )   // obviously we don't want to turn off the marker we just turned on.
                Earthdawn.set( this.tokenInfo.tokenObj, "status_" + Earthdawn.getIcon(  mia[ i ] ), false );
          } // end turn off all other markers that share this same attribute.

          if( attrib === "condition-Health" ) {   // Health has changed
            Earthdawn.set( this.tokenInfo.tokenObj, "status_dead", setObj.badge );    // Set the big red X to whatever we just set the unconscious or dead symbol to.
            if( !mook) {    //  If unc or dead, mark blindsided. As a general rule (but this possibly will not be 100% accurate) if waking up, unblindside.
              this.MarkerSet( [ "m", "blindsided", setObj.badge ? "s" : "u" ] );
              if( setObj.badge )          // If new status is unc or dead, make sure knocked down is set.
                this.MarkerSet( [ "m", "knocked", "s" ] );
          }   }
              // Aggressive and Defensive stances are mutually exclusive.
          if((( ssa[ 0 ] === "markerDirect" ) || ( ssa[ 0 ] === "marker" )) && setObj.badge ) {   // This is a direct set (add) of the status marker on the token.
            if( code === "aggressive" )
              this.MarkerSet( [ "m", "defensive", "u" ] );
            else if( code === "defensive" )
              this.MarkerSet( [ "m", "aggressive", "u" ] );
          }
        } // End tokeninfo type is "Token"
      } catch(err) { this.edClass.errorLog( "ParseObj.MarkerSet() error caught: " + err ); }
    } // End ParseObj.MarkerSet( ssa )



          // ParseObj.funcMisc()
          // This is a collection of several minor functions that don't deserve their own subroutines.
          //
          // Add      Take an attriubte and add a value.
          // CorruptKarma
          // KarmaBuy   (called from when Attribute detects that @{Karma} has changed)
          // MacroCreate
          // NewDay
          // SetAdjust
          // State - GM set values into the State.
          // toAPI: API / noAPI
    this.funcMisc = function( ssa ) {
      'use strict';
      try {
        switch ( ssa[ 1 ].toLowerCase() ) {
          case "add" :      // Add or subtract from an attribute.   ssa[2] an attribute, ssa[3] a value.
            try {
              if( ssa.length > 2 && Earthdawn.parseInt2( ssa[ 3  ] )) {
                let attribute2 = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: ssa[ 2 ].trim() });
                Earthdawn.setWithWorker( attribute2, "current", Earthdawn.parseInt2( ssa [ 3 ] ) + Earthdawn.parseInt2( attribute2.get( "current" )));
              }
            } catch(err) { this.edClass.errorLog( "ED.funcMisc.Add error caught: " + err ); }
            break;
          case "corruptkarma":
            try {
              if( playerIsGM( this.edClass.msg.playerid )) {
                let aobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: this.charID, name: "Creature-CorruptKarmaBank" }, 0),
                  bobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: this.charID, name: "Creature-CorruptKarma" }, 0),
                  num = Earthdawn.parseInt2( ssa[ 2 ] ),
                  bank = Earthdawn.parseInt2( aobj.get( "current" )),
                  kc = Earthdawn.parseInt2( bobj.get( "current" )),
                  realnum =( num <= bank ) ? num: bank,
                  txt = "";
                if( realnum != 0 ) {
                  Earthdawn.setWithWorker( aobj, "current", bank - realnum );
                  Earthdawn.setWithWorker( bobj, "current", kc + realnum );
                  txt = "Cursing " + realnum + " karma. ";
                }
                if( num != realnum )
                  txt += "Can't curse " + num + " karma because only " + bank + " in bank.";
                if( kc != 0 )
                  txt += " New total " + (kc + realnum) + " cursed.";
                if( (bank - realnum) < 1 )
                  txt += " " + (bank - realnum) + " still in bank.";
                this.chat( txt, Earthdawn.whoTo.player );
              } else
                this.chat( "Error! Must be GM to Corrupt Karma.", Earthdawn.whoFrom.apiError );
            } catch(err) { this.edClass.errorLog( "ED.funcMisc.CorruptKarma error caught: " + err ); }
            break;
          case "karmabuy":      // We know how many karma were bought, send out an accountng entry.
            try {
              if( ssa.length > 1 && Earthdawn.parseInt2( ssa[ 2  ] )) {
                let newKarma = Earthdawn.parseInt2( ssa [ 2 ] ),
                  today = new Date(),
                  stem = "&{template:chatrecord} {{header=" + getAttrByName( this.charID, "charName" ) + "}}"
                        + "{{misclabel=Buy Karma}}{{miscval=" + newKarma + "}}"
                        + "{{lp=" + (newKarma * 10) + "}}",
                  slink = "{{button1=[Press here](!Earthdawn~ charID: " + this.charID
                        + "~ Record: ?{Posting Date|" + today.getFullYear() + "-" + (today.getMonth() +1) + "-" + today.getDate()
                        + "}: : LP: ?{Action Points to post|" + (newKarma * 10)
                        + "}: 0: Spend: ?{Reason|Buy " + newKarma + " Karma}";
                this.chat( stem + Earthdawn.colonFix( slink ) + ")}}", Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive );
              }
            } catch(err) { this.edClass.errorLog( "ED.funcMisc.KarmaBuy error caught: " + err ); }
            break;
          case "macrocreate":
            try {
              let cmd;
              if( ssa.length > 2 )
                cmd = ssa[ 2 ].toLowerCase();
              if( cmd == "delete" || cmd == "refresh" ) {     // get rid of all macros that reference Earthdawn.
                let macs = findObjs({ _type: "macro" });
                _.each( macs, function (macObj) {
                  let act = macObj.get( "action" );
                  if( act.startsWith( "!Earthdawn" ) || act.startsWith( "!edToken" ) || act.startsWith( "!edsdr" ) || act.startsWith( "!edInit" ))
                    macObj.remove();
                });
              }
              if( cmd != "delete" && !playerIsGM( this.edClass.msg.playerid ) ) {
                this.chat( "Error! Only GM is allowed to do run MacroCreate.", Earthdawn.whoFrom.apiError);
              } else if( cmd == "create" || cmd == "refresh" ) {
                this.MacroDetail( "Roll-Public", "!edsdr~ ?{Step|0}~ ?{Bonus or Karma Step|0}~ for ?{reason| no reason}", false );
                this.MacroDetail( "Roll-Player-GM", "!edsdrGM~ ?{Step|0}~ ?{Bonus or Karma Step|0}~ for ?{reason| no reason}", false );
                this.MacroDetail( "Roll-GM-Only", "!edsdrHidden~ ?{Step|0}~ ?{Bonus or Karma Step|0}~ for ?{reason| no reason}", false );
                this.MacroDetail( "NpcReInit", "!Earthdawn~ rerollnpcinit", false );
                this.MacroDetail( "ResetChars", "!Earthdawn~ Misc: ResetChars: ?{Mods Only or Full Reset|Mods Only|Full}", false );
                this.MacroDetail( "Token", "!edToken~", false );
                this.MacroDetail( "Dur-Track", "!Earthdawn~ ChatMenu: DurationTracker : ?{Name of the Effect|Effect}: ?{How many rounds ?|1}", false ); //new in v2 - Records duration of an effect in the turn tracker
//              this.MacroDetail( "Test", "!edToken~ %{selected|Test}", true );     // Leave Test in here. It can be uncommented when it is actually needed.

                this.MacroDetail( "Attrib", "!Earthdawn~ ChatMenu: Attrib", true );
                this.MacroDetail( "Init", "!edToken~ %{selected|Dex-Initiative-Check}", true );
                this.MacroDetail( "Karma-R", "!edToken~ !Earthdawn~ Reason: 1 Karma Only~ ForEach~ Karma: 1~ Roll: 0", true );
                this.MacroDetail( "Karma-T", "!edToken~ !Earthdawn~ ForEach~ marker: KarmaGlobalMode :t", true );
                this.MacroDetail( "KnockD", "!edToken~ %{selected|Knockdown}", true );
                this.MacroDetail( "Status", "!Earthdawn~ ChatMenu: Status", true );
                this.MacroDetail( Earthdawn.constant( "T" ) + "-Talents", "!Earthdawn~ ChatMenu: Talents", true );
                this.MacroDetail( Earthdawn.constant( "SK" ) + "-Skills", "!Earthdawn~ ChatMenu: Skills", true );
                this.MacroDetail( Earthdawn.constant( "WPN" ) + "-Damage", "!Earthdawn~ ChatMenu: Damage", true );
//                    this.MacroDetail( "•Status", "!edToken~ !Earthdawn~ ForEach~ Marker: ?{@{selected|bar2|max}}", true );
//                    this.MacroDetail( "⚡Cast", "!edToken~ %{selected|SP-Spellcasting}", true );   /* high voltage: 9889;
//              this.MacroDetail( Earthdawn.constant( "Target" ) + "Clear-Targets", "!Earthdawn~ charID: @{selected|character_id}~ ForEach~ TargetsClear", true);
//              this.MacroDetail( Earthdawn.constant( "Target" ) +   "Set-Targets", "!Earthdawn~ charID: @{selected|character_id}~ Target: Set", true);
              }
            } catch(err) { this.edClass.errorLog( "ED.funcMisc.MacroCreate error caught: " + err ); }
            break;
          case "newday":      // Recovery tests and Karma reset.   Some systems karma must be bought.
            try {
              let recov = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "Recovery-Tests" });
              Earthdawn.setWithWorker( recov, "current", recov.get( "max" ));           // set recovery tests used today to max.

              if( state.Earthdawn.gED && state.Earthdawn.edition == "4" ) {
                let karma = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "Karma" }, 0),
                  kparam = Earthdawn.getAttrBN( this.charID, "Misc-KarmaRitual", "-1", true),
                  add;
                switch (kparam) {
                  case -1:      // set karma to it's max value
                    add = karma.get( "max" );
                    break;
                  case -2:      // Karma_ritual refills Circle per day
                    add = Earthdawn.getAttrBN( this.charID, "working-Circle", "0" );
                    break;
                  case -3:      // Karma_ritual refills racial karma modifier per day
                    add = Earthdawn.getAttrBN( this.charID, "Karma-Modifier", "0" );
                    break;
                  case -4:      // There is a Karma Ritual Talent. Find it and use it's rank.
                            // go through all attributes for this character and look for ones we are interested in.
                    let po = this;
                    let attributes = findObjs({ _type: "attribute", _characterid: this.charID });
                    _.each( attributes, function (att) {
                      if( att.get( "name" ).endsWith( "_Special" ))
                        if( att.get( "current" ) === "KarmaRitual" ) {
                          if( add === undefined ) {
                            let nm = att.get( "name" ),
                              add = Earthdawn.getAttrBN( po.charID,
                                    buildPre( Earthdawn.repeatSection( 3, nm), Earthdawn.repeatSection( 2, nm)) + "Effective-Rank", "0" );
                          } else
                            po.chat( "Warning, found more than one Talent/Knack/Skill with special KarmaRitual. Using the first found.", Earthdawn.whoTo.player| Earthdawn.whoFrom.api | Earthdawn.whoFrom.apiWarning)
                        }
                    }); // End for each attribute.


                    add = Earthdawn.getAttrBN( this.charID, "Karma-Modifier", "0" );
                    break;
                  default :     // Karma_ritual refills the value in Misc-KarmaRitual
                    add = kparam;
                };
                Earthdawn.setWithWorker( karma, "current", Math.min( Earthdawn.parseInt2( karma.get( "max" )), Earthdawn.parseInt2(karma.get( "current" )) + Earthdawn.parseInt2( add )));
                this.chat( "New Day: Karma and Recovery tests reset.", Earthdawn.whoFrom.character );
              }     // Note: Don't set DP to max! that is not done on a mere new day.
              else {    // 1879, or ED edition other than 4th.   Buy Karma.
                let newKarma = Earthdawn.getAttrBN( this.charID, "Karma_max", "0", true ) - Earthdawn.getAttrBN( this.charID, "Karma", "0", true ),
                  today = new Date();
  // CDD ToDo test this with new record.
                this.chat( Earthdawn.makeButton( "Buy Karma?", "!Earthdawn~ charID: " + this.charID + "~ Misc: Add: Karma: ?{How many Karma to buy|" + newKarma + "}"
                      + "~ Record: ?{Posting Date|" + today.getFullYear() + "-" + (today.getMonth() +1) + "-" + today.getDate()
                      + "}: : LP: ?{How many " + ( state.Earthdawn.gED ? "LP" : "AP" ) +" does that cost|" + newKarma * 10 + "}",
                      "Did you do a karma ritual and want to buy karma?", Earthdawn.Colors.param, Earthdawn.Colors.paramfg ),
                      Earthdawn.whoTo.player | Earthdawn.whoFrom.character | Earthdawn.whoFrom.noArchive );
              }
            } catch(err) { this.edClass.errorLog( "ED.funcMisc.NewDay error caught: " + err ); }
            break;
          case "resetchars":      // reset all selected tokens to full health, karma, Recovery Tests, and no modifications or status markers.
            try {       // Note, when this routine enters, we will not have this.charID or TokenInfo set. So be careful what other functions get called.
              let lst = this.getUniqueChars( 1 ),
                  full = (ssa.length < 3) ? false : ssa[ 2 ].toUpperCase().startsWith( "F" ),   // default to Mods Only. Full if Starts with F
                  nlist = "";
              for( let c in lst ) {     // For each unique character, do the following.
                this.charID = c;
                let kObj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "Karma" });
                let karma = kObj.get( "max" ),
                    unc = Earthdawn.getAttrBN( this.charID, "Damage-Unc-Rating", "2" ),
                    markers = "";
                if( full ) {
                  Earthdawn.setWithWorker( kObj, "current", karma );
                  this.setWW( "Damage", 0);
                  this.setWW( "Damage-Stun", 0);
                  this.setWW( "Wounds", 0);
                  this.setWW( "Recovery-Tests", Earthdawn.getAttrBN( this.charID, "Recovery-Tests_max", "2" ));
                }
                this.setWW( "Dex-Mods", 0);
                this.setWW( "Str-Mods", 0);
                this.setWW( "Tou-Mods", 0);
                this.setWW( "Per-Mods", 0);
                this.setWW( "Wil-Mods", 0);
                this.setWW( "Cha-Mods", 0);
                this.setWW( "Initiative-Mods", 0);
                this.setWW( "Misc_Wound_Threshold-Buff", 0);
                this.setWW( "PD-Buff", 0);
                this.setWW( "MD-Buff", 0);
                this.setWW( "SD-Buff", 0);
                this.setWW( "PA-Buff", 0);
                this.setWW( "MA-Buff", 0);
                this.setWW( "Adjust-All-Tests-Misc", 0);
                this.setWW( "Adjust-Effect-Tests-Misc", 0);
                this.setWW( "Adjust-Defenses-Misc", 0);
                this.setWW( "Adjust-Attacks-Misc", 0);
                this.setWW( "Adjust-Damage-Misc", 0);
                this.setWW( "Adjust-TN-Misc", 0);
                this.setWW( "Adjust-Attacks-Bonus", 0);
                this.setWW( "Adjust-Damage-Bonus", 0);
                this.setWW( "Movement-Buff", 0);
                this.setWW( "Shield-Phys-Buff", 0);
                this.setWW( "Shield-Myst-Buff", 0);
                this.setWW( "Attack-Step-Mod", 0);
                if( Earthdawn.getAttrBN( this.charID, "Creature-Ambush", "0", true ) > 0 ) {    // If the creature can ambush, reset is that it is.
                  let mi = _.find( Earthdawn.StatusMarkerCollection, function(mio){ return mio[ "code" ] == "ambushing"; });
                  if( mi )
                    markers += Earthdawn.getIcon( mi ) + ",";
                }
                if( Earthdawn.getAttrBN( this.charID, "Creature-DiveCharge", "0", true ) > 0 ) {    // If the creature can charge, reset is that it is.
                  let mi = _.find( Earthdawn.StatusMarkerCollection, function(mio){ return mio[ "code" ] == "divingcharging"; });
                  if( mi )
                    markers += Earthdawn.getIcon( mi ) + ",";
                }
                for( let t in lst[ c ] ) {    // For each unique token found, do the following.
                  let TokenObj = getObj("graphic", lst[ c ][ t ][ "token" ]);
                  if( TokenObj ) {
                    this.tokenInfo = { type: "token", name: TokenObj.get( "name" ), tokenObj: TokenObj, characterObj: getObj("character", c ) };
                    let tMarkers = markers,
                        oldMarkers = TokenObj.get( "statusmarkers" );
                    nlist += TokenObj.get( "name" ) + ", ";

                    function keepthese( checkfor ) {        // There are certain markers that we don't want to clear away.
                      let mi = _.find( Earthdawn.StatusMarkerCollection, function(mio){ return mio[ "code" ] == checkfor; });
                      if( mi ) {
                        if( oldMarkers.indexOf( mi[ "customTag" ] ) !== -1 )
                          tMarkers += mi[ "customTag" ] + ",";
                        else if( oldMarkers.indexOf( mi[ "icon" ] ) !== -1 )
                          tMarkers += mi[ "icon" ] + ",";
                    } }
                    keepthese( "karmaauto" );
                    keepthese( "karmaask" );
                    keepthese( "devpntauto" );
                    keepthese( "devpntask" );
                    keepthese( "flying" );

                    let removed = _.difference( _.without( oldMarkers.split( "," ), ""), _.without( tMarkers.split( "," ), "") );
                    if( removed.length ) {
                      for( let i = 0; i < removed.length; ++i )			// unset everything with these markers.
                        this.MarkerSet( [ "marker", removed[ i ].replace( /\@\d*/g, ""), "u"] );
                    }

                    Earthdawn.set( TokenObj, "statusmarkers", tMarkers.slice(0, -1) );   // set each tokens status markers to empty (except maybe ambush and charge, which default to on for those who have it)   Note that this should be unnessicary as far as the tokens go, but it also removes all hits and other things stored in the status markers.
                    if( full && ( Earthdawn.getAttrBN( this.charID, "NPC", "0" ) == Earthdawn.charType.mook )) {   // We only need to process tokens if they are mooks. Otherwise everything is linked to the character.
                      Earthdawn.set( TokenObj, "bar1_value", karma);    // karma
                      Earthdawn.set( TokenObj, "bar2_value", 0);        // wounds
                      Earthdawn.set( TokenObj, "bar3_value", 0);        // damage
                      Earthdawn.set( TokenObj, "bar3_max",   unc );
                  } }   // end tokenObj
              } }
              this.chat( "Reset characters: " + nlist.slice( 0, -2 ) + ".", Earthdawn.whoTo.public | Earthdawn.whoFrom.noArchive );
            } catch(err) { this.edClass.errorLog( "ED.funcMisc.ResetChars error caught: " + err ); }
            break;
          case "setadjust":
            // For the current character, copy all the buffs from the Combat Tab as adjustments on the Adjustments tab.
            // This makes it easier for the GM to enter monsters. enter Buffs on the Combat tab until the values are right, then use this option to copy
            // them all to the Adjustments tab.
            try {
              let po = this;

              function copyCombatToAdjust( from, to, noClear )  {
                'use strict';
                try {
                  let aobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: po.charID, name: from }, 0),
                    bobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: po.charID, name: to }, 0);
                  Earthdawn.setWithWorker( bobj, "current", Earthdawn.parseInt2( aobj.get( "current" ))+ Earthdawn.parseInt2( bobj.get( "current" )));
                  if( !noClear )
                    aobj.setWithWorker( "current", 0 );
                } catch(err) { this.edClass.errorLog( "ED.funcMisc.SetAdjust.copyCombatToAdjst error caught: " + err + "   On " + from + " to " + to ); }
              } // End copyCombatToAdjust()

              copyCombatToAdjust( "PD-Buff", "Defense-Phys-Adjust" );
              copyCombatToAdjust( "MD-Buff", "Defense-Myst-Adjust" );
              copyCombatToAdjust( "SD-Buff", "Defense-Soc-Adjust" );
              copyCombatToAdjust( "PD-ShieldBuff", "Shield-Phys" );
              copyCombatToAdjust( "MD-ShieldBuff", "Shield-Myst" );
              copyCombatToAdjust( "PA-Buff", "Armor-Phys-Adjust" );
              copyCombatToAdjust( "MA-Buff", "Armor-Myst-Adjust" );
              copyCombatToAdjust( "Movement-Buff", "Misc-Movement-Adjust" );
              if( state.Earthdawn.sheetVersion < 1.8 ) {
                copyCombatToAdjust( "Health-Buff", "Damage-Unconscious-Adjust", true );
                copyCombatToAdjust( "Health-Buff", "Damage-Death-Rating-Adjust" );
                copyCombatToAdjust( "Recovery-Buff", "Recovery-Adjust" );
                copyCombatToAdjust( "Wound-Threshold-Buff", "Wound-Threshold-Adjust" );
                copyCombatToAdjust( "Misc-IP-Buff", "Misc-IP-Adjust" );
              }
              copyCombatToAdjust((( state.Earthdawn.sheetVersion < 1.8 ) ? "Misc-Initiative-Buff" : "Initiative-Mods"), "Misc-Initiative-Adjust" );
            } catch(err) { this.edClass.errorLog( "ED.funcMisc.SetAdjust error caught: " + err ); }
            break;
          case "state":
                      // Set various state.Earthdawn values.
                      // ssa is an array that holds the parameters.
                      //      Earthdawn~ State~ (one of the options below)~ (parameters).
            try {
              if( !playerIsGM( this.edClass.msg.playerid ) )
                this.chat( "Error! Only GM can set state variables.", whoFrom.apiWarning );
              else {
                let logging = false, bitfield;
                switch( ssa[ 2 ].toLowerCase() ) {
                  case "cursedlucksilent": {
                    let t = Earthdawn.parseInt2( ssa[ 3 ], 2 );
                    state.Earthdawn.CursedLuckSilent = ( isNaN( t ) || t <= 0 ) ? undefined: t;
                    this.chat( "Campaign now set so that CursedLuckSilent is " + state.Earthdawn.CursedLuckSilent, Earthdawn.whoTo.gm | Earthdawn.whoFrom.noArchive);
                  } break;
                  case "edition": {
                    state.Earthdawn.g1879 = (ssa[ 3 ].slice( -4 ) === "1879");
                    state.Earthdawn.gED = !state.Earthdawn.g1879;
                    state.Earthdawn.game = state.Earthdawn.gED ? "ED" : "1879";
                    state.Earthdawn.edition = Earthdawn.parseInt2( Earthdawn.getParam( ssa[ 3 ], 1, " "));
                    this.chat( "Campaign now set to use " + state.Earthdawn.game + " Edition " + Math.abs(state.Earthdawn.edition)
                          + " rules. IMPORTAINT NOTE! Make sure you also change the Default Sheet Settings of the Campaign Settings page."  );
                    let count = 0,
                       chars = findObjs({ _type: "character" });
                    _.each( chars, function (charObj) {
                      Earthdawn.setWW( "edition", state.Earthdawn.edition, charObj.get( "_id" ));
                      ++count;
                    }) // End ForEach character
                    this.chat( count + " character sheets updated." );
                  } break;
                  case "effectisaction": {
// Dead code as of changes to JSON.
                    state.Earthdawn.effectIsAction = Earthdawn.parseInt2( ssa[ 3 ] );
                    this.chat( "Campaign now set so that Action tests " + (state.Earthdawn.effectIsAction ? "are" : "are NOT") + " Effect tests."  );
                    let count = 0,
                      chars = findObjs({ _type: "character" });
                    _.each( chars, function (charObj) {
                      Earthdawn.setWW( "effectIsAction", state.Earthdawn.effectIsAction, charObj.get( "_id" ) );
                      ++count;
                      if( state.Earthdawn.effectIsAction == "1" )
                        for( let ind = 0; ind < 6; ++ind ) {
                          Earthdawn.setWW( [ "Dex", "Str", "Tou", "Per", "Wil", "Cha" ][ ind ] + "-ActnEfct", "1", charObj.get( "_id" ) );
                        }
                    }) // End ForEach character
                    this.chat( count + " character sheets updated." );
                  } break;
                  case "karmaritual": {
// Dead code as of changes to JSON.
                    state.Earthdawn.karmaRitual = ssa[ 3 ];
                    let s;
                    switch(state.Earthdawn.karmaRitual) {
                      case "-1":  s = "Max";      break;
                      case "-2":  s = "Circle";   break;
                      case "-3":  s = "Racial Mod"; break;
                      case "-4":  s = "Talent";   break;
                      default:  s = state.Earthdawn.karmaRitual;
                    }
                    this.chat( "Campaign now set so that default Karma Ritual is " + s, Earthdawn.whoTo.gm | Earthdawn.whoFrom.noArchive );
                    let count = 0,
                     chars = findObjs({ _type: "character" });
                    _.each( chars, function (charObj) {
                      Earthdawn.setWW( "Misc-KarmaRitual", state.Earthdawn.karmaRitual, charObj.get( "_id" ) );
                      ++count;
                    }) // End ForEach character
                    this.chat( count + " character sheets updated." );
                  } break
                  case "logstartup":
                    state.Earthdawn.logStartup = Earthdawn.parseInt2( ssa[ 3 ] ) ? true: false;
                    logging = true;
                    break;
                  case "logcommandline":
                    state.Earthdawn.logCommandline = Earthdawn.parseInt2( ssa[ 3 ] ) ? true: false;
                    logging = true;
                    break;
                  case "nopileondice": {
                    let t = Earthdawn.parseInt2( ssa[ 3 ] );
                    state.Earthdawn.noPileonDice = ( isNaN( t ) || t < 0 ) ? undefined: t;
                    this.chat( "Campaign now set so that noPileOnDice is " + state.Earthdawn.noPileonDice, Earthdawn.whoTo.gm | Earthdawn.whoFrom.noArchive);
                  } break;
                  case "nopileonstep": {
                    let t = parseFloat( ssa[ 3 ] );
                    state.Earthdawn.noPileonStep = ( isNaN( t ) || t <= 0 ) ? undefined: t;
                    this.chat( "Campaign now set so that noPileOnStep is " + state.Earthdawn.noPileonStep, Earthdawn.whoTo.gm | Earthdawn.whoFrom.noArchive);
                  } break;
                  case "mook":
                    bitfield = 0x02;
                    break;
                  case "npc":
                    bitfield = 0x01;
                    break;
                  case "pc":
                    bitfield = 0x04;
                    break;
                  case "style": {
                    state.Earthdawn.style = Earthdawn.parseInt2( ssa[ 3 ] );
                    let style;
                    switch (state.Earthdawn.style) {
                      case Earthdawn.style.VagueSuccess:  style = " - Vague Successes."; break;
                      case Earthdawn.style.VagueRoll:   style = " - Vague Roll.";   break;
                      case Earthdawn.style.Full:
                      default:                style = " - Full."; break;
                    }
                    this.chat( "Campaign now set to use result style: " + state.Earthdawn.style + style  );
                  } break;
                  case "tokenlinknpc":   // Misc: state: [2] tokenlink: (bitflag): Set/Unset/Mask: Description
                  case "tokenlink":
                    if( ssa[ 4 ].toLowerCase().startsWith( "s" ) ) {      // Set
                      state.Earthdawn.tokenLinkNPC |= Earthdawn.parseInt2( ssa[ 3 ]);
                      this.chat( ssa[5] );
                    } else if( ssa[ 4 ].toLowerCase().startsWith( "u" ) ) {   // Unset
                      state.Earthdawn.tokenLinkNPC &= ~Earthdawn.parseInt2( ssa[ 3 ]);
                      this.chat( ssa[5] );
                    } else {    // ssa[4] is a bitfield mask.
                      state.Earthdawn.tokenLinkNPC &= ~Earthdawn.parseInt2( ssa[ 4 ]);    // clear the mask, then add in the item.
                      state.Earthdawn.tokenLinkNPC |= Earthdawn.parseInt2( ssa[ 3 ]);
                      this.chat( ssa[5] + " set.");
                    }
                    break;
                  case "version":
                  case "api":
                    state.Earthdawn.version = Number( ssa[ 3 ] );
                    this.chat( "Campaign now set to API version: " + state.Earthdawn.version  );
                    break;
                  case "html":
                    state.Earthdawn.sheetVersion = Number( ssa[ 3 ] );
                    this.chat( "Campaign now set to HTML version: " + state.Earthdawn.sheetVersion  );
                    break;
                }
                if( bitfield ) {
                  state.Earthdawn.defRolltype = Earthdawn.parseInt2( ssa[ 3 ] ) ? (state.Earthdawn.defRolltype | bitfield) : (~state.Earthdawn.defRolltype & bitfield);
                  this.chat( "New character default RollType -   NPC: "   + ((state.Earthdawn.defRolltype & 0x01) ? "GM Only" : "Public")
                        + "   Mook: "   + ((state.Earthdawn.defRolltype & 0x02) ? "GM Only" : "Public") + "   PC: " + ((state.Earthdawn.defRolltype & 0x04) ? "GM Only" : "Public"));
                }
                if( logging )
                  this.chat( "Campaign now set to " + state.Earthdawn.game
                        + " - logging Startup: " + state.Earthdawn.logStartup + " -   "
                        + "Commandline: " + state.Earthdawn.logCommandline + ".", Earthdawn.whoTo.player );
              }
            } catch(err) { this.edClass.errorLog( "ED.funcMisc.State() error caught: " + err ); }
            break;
          case "toapi": {       // API or noAPI   If have not been using the API, then things are not setup correctly for API use. This sets it up. Can also be run as last thing before removing API to clean stuff up.
            if( playerIsGM( this.edClass.msg.playerid )) {
              let macs = findObjs({ _type: "macro" });      // to start with, remove all macros that reference earthdawn.
              _.each( macs, function (macObj) {
                let act = macObj.get( "action" );
                if( act.startsWith( "!Earthdawn" ) !== -1 || act.startsWith( "!edToken" ) !== -1 || act.startsWith( "!edsdr" ) !== -1 || act.startsWith( "!edInit" ) !== -1 )
                  macObj.remove();
              });
              let abs = findObjs({ _type: "ability" });      // to start with, then do the same for all abilities.
              _.each( abs, function (abObj) {
                let act = abObj.get( "action" );
                if( act.startsWith( "!Earthdawn" ) || act.startsWith( "!edToken" ) || act.startsWith( "!edsdr" ) || act.startsWith( "!edInit" ) )
                  abObj.remove();
              });

              let attributes = findObjs({ _type: "attribute" }),
                noApi = ssa[ 2 ] === "noAPI";
              _.each( attributes, function (att) {
                let nm = att.get("name");
                if( nm === "API" )
                  att.set( "current", noApi ? "0" : "1" );
                else if ( nm.startsWith( "repeating_")) {
                  if( nm.endsWith( "_Name" )) {     // No matter what, make sure we get the RowID set for this section.
                    let aobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: att.get( "_characterid" ), name: nm.slice( 0, -5) + "_RowID" });
                    Earthdawn.set( aobj, "current", Earthdawn.repeatSection( 2, nm));
                  } else if ( nm.endsWith( "_CombatSlot") || (nm.endsWith( "_Contains") && (Earthdawn.repeatSection( 3, nm) === "SPM" ))) {
                    let nmn,
                      rowID = Earthdawn.repeatSection( 2, nm),
                      code  = Earthdawn.repeatSection( 3, nm),
                      cID = att.get( "_characterid" );
                      symbol = Earthdawn.constant( code ),
                      cbs = att.get( "current" ),
                      lu = "Name";
                    if( code === "SPM" ) {
                      cbs = "1";
                      lu = "Contains";
                    }
                    if ( code !== "SP" ) {    // skip if it is SP, we don't do those token actions.
                      nmn = Earthdawn.getAttrBN( cID, Earthdawn.buildPre( code, rowID ) + lu, "" );
                      if( !noApi && cbs == "1" )   // If we are going toAPI, and combatslot is one, make a token action.
                        Earthdawn.abilityAdd( cID, symbol + nmn, "!edToken~ %{selected|" + Earthdawn.buildPre( code, rowID ) + "Roll}" );
                    }
                  } // End Token Action maint.
                }
              }); // End for each attribute.
              if( noApi )
                state.Earthdawn = undefined;
            }
          } break;
        } // end switch
      } catch(err) { this.edClass.errorLog( "ED.funcMisc error caught: " + err ); }
    } // End ParseObj.funcMisc()



          // If this is being processed for a single token, and that token is a mook, then
          // return the number of wounds that mook has, as recorded on the token bar2_value
    this.mookWounds = function() {
      'use strict';
      try {
        if( this.charID === undefined ) {
          this.chat( "Error! charID undefined in mookWounds() command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError);
          return 0;
        }
        if( Earthdawn.getAttrBN( this.charID, "NPC", "0") != Earthdawn.charType.mook )
          return 0;
        if( this.tokenInfo === undefined || this.tokenInfo.type !== "token" )
          return 0;

        return Earthdawn.parseInt2( this.tokenInfo.tokenObj.get( "bar2_value" ) );
      } catch(err) { this.edClass.errorLog( "ED.mookWounds error caught: " + err ); }
    } // End ParseObj.mookWounds()



          // ParseObj.Record ()
          // Post an accounting journal entry for SP, LP, or Dev points gained or spent.
          // ssa[ 1] Real Date
          // ssa[ 2] Throalic Date
          // ssa[ 3] Item: SPLP, SP, LP, Dev, or Other
          // ssa[ 4] Amount LP
          // ssa[ 5] Amount SP
          // ssa[ 6] Type: Gain, Spend, Decrease (ungain), or Refund (unspend).
          // ssa[ 7] Reason - Text.
    this.Record = function( ssa, clear ) {   // If clear is TRUE then clear out all the data entry fields on the record tab to prepare for next entry.
      'use strict';
      try {
        if( this.charID === undefined ) {
            this.chat( "Error! Trying Record() when don't have a CharID.", Earthdawn.whoFrom.apiError);
            return;
        }

        let nchar = 0,
          iyear,
          oldReal = "",
          oldThroalic = "",
          res,
          reason = ":",
          kobj  = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "record-journal" }, ""),
          oldStr =  kobj.get( "current" );
        do {
            res = oldStr.slice( nchar, 28 + nchar).match( /\b\d{4}[\-\#\\\/\s]\d{1,2}[\-\#\\\/\s]\d{1,2}\b/g );   // find things  that looks like dates near the start of lines.
            if( res === null ) {
              nchar = oldStr.length;
              continue;
            }

            for( var i = 0; i < res.length; i++) {    // Find out what dates were on the last entry posted.
              iyear = Earthdawn.parseInt2( res[ i ], true);
              if( iyear > 2000 ) {
                if ( oldReal === "" )
                  oldReal = res[ i ];
              } else if ( iyear > 1000 ) {
                if( oldThroalic === "" )
                  oldThroalic = res[ i ];
              }
            }
            nchar = oldStr.indexOf( "\n", nchar + 1 );
            if( nchar === -1 )
              nchar = oldStr.length;      // this now holds location of the end of the current line.
        } while( (oldReal === "" || oldThroalic === "") && nchar < oldStr.length );

        for( let i = 7; i < ssa.length; i++ )     // If there was a colon in the reason, put it back in.
          reason += ":" + ssa[ i ];
        let Item = ssa[ 3 ],
          post =  (( ssa[ 1 ] === oldReal.trim() )    ? "" : ( ssa[ 1 ] + " ")) +
                (( ssa[ 2 ] === oldThroalic.trim()) ? "" : ( ssa[ 2 ] + " ")) + reason.slice(1) + "  ";
        if( Item != "LPSP" && Item != "SP" && Item != "LP" && Item != "Other" )
          Item = "LPSP";  // Just in case a weird value.
        if( Item !== "Other" ) {
          let iAmountLP = Earthdawn.parseInt2( ssa[ 4 ]) * (( ssa[ 6 ] === "Spend" || ssa[ 6 ] === "Decrease" ) ? -1 : 1);
          if( Item.indexOf( "LP" ) != -1 && iAmountLP != 0) {     // LP
            let aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "LP-Current" }, 0);
            let newTotal = iAmountLP + Earthdawn.parseInt2( aobj.get( "current" ));
            if( isNaN( newTotal  ))
              newTotal = iAmountLP;
            Earthdawn.setWithWorker( aobj, "current", newTotal );
            post += ssa[ 6 ] + " " + Math.abs( iAmountLP ) + " " + (state.Earthdawn.g1879 ? "AP" : "LP") +
                  " (new total " + newTotal + ") ";
            if(ssa[ 6 ] === "Gain" || ssa[ 6 ] === "Decrease") {
              let newTotal2 = iAmountLP,
                aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "LP-Total" }, 0);
              newTotal2 += Earthdawn.parseInt2( aobj.get( "current" ));
              if( isNaN( newTotal2  ))
                newTotal2 = iAmountLP;
              post +=  "(new career total " + newTotal2 + ") ";
              Earthdawn.setWithWorker( aobj, "current", newTotal2 );
          } }
          if( Item.indexOf( "SP" ) != -1 ) {
            if( state.Earthdawn.gED ) {     // Earthdawn always just uses SP, upgrade would be to make change in GP if needed.
              let iAmountSP = Earthdawn.parseInt2( ssa[ 5 ]) * (( ssa[ 6 ] === "Spend" || ssa[ 6 ] === "Decrease" ) ? -1 : 1);
              if( iAmountSP != 0) {
                let aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "Wealth_Silver" }, 0);
                let newTotal = iAmountSP + Earthdawn.parseInt2( aobj.get( "current" ));
                if( isNaN( newTotal  ))
                  newTotal = iAmountSP;
                    // If don't have enough silver, automatically convert gold to silver to cover.
                Earthdawn.setWithWorker( aobj, "current", newTotal );
                post += ssa[ 6 ] + " " + Math.abs( iAmountLP ) + " " + "SP" + " (new total " + newTotal + ") ";
              }
            } else {    // 1879: £1/2/3 or £1/2/3 &4f or 2s/3, 2s/- or 3d & 4f.     If two, they are shillings and pence 5/2 = 5s/2d. If three they are pounds/shillings/pence.
              let mult = ( ssa[ 6 ] === "Spend" || ssa[ 6 ] === "Decrease" ) ? -1 : 1;
              let t = ssa[ 5 ].replace( /-/g, "0").toLowerCase();
              if( t.trim().length > 0 && /\d/.test(t) ) {   // string is not blank, and contains a digit.

                function formatLSDF( gold, silver, copper, bronze) {
                  'use strict';
                  let c = 0, v = "";
                  if( gold )        { v = "£" + gold + "/";   c++; }
                  if( silver || c )   v += (silver ? silver : "-") + (c++ ? "" : "s") + "/";
                  v += (copper ? copper : "-") + (c++ ? "" : "d");
                  if( bronze )        v += " & " + bronze + "f";
                  return v;
                }

                let a = ssa[ 5 ].split( "/" );
                if( a[ a.length -1 ].indexOf( "&" ) != -1 ) {   // Last is pence and Farthing. split them as well.
                  let b = a.pop();
                  a.push( Earthdawn.getParam( b, 1, "&" ));
                  a.push( Earthdawn.getParam( b, 2, "&" ));
                  while( a.length < 4 )
                    a.unshift( 0 );
                }
                for( let i = 0; i < a.length; ++i )
                  for( let j = i; j < 4; ++j )
                    if ( a[ i ].indexOf( [ "£", "s", "d", "f" ][ j ] ) !== -1 ) {   // we found a coin symbol
                      while( i++ < j )
                        a.unshift( "0" );
                      while( a.length < 4 )
                        a.push( "0" );
                      i = j = 99;   // break out of both loops.
                    }
                while( a.length < 2 )   // We never found anything at all, so assume that what we found is shillings.
                  a.unshift( "0" );
                while( a.length < 4 )
                  a.push( "0" );
                for( let i = 0; i < a.length; i++)
                  a[ i ] = Earthdawn.parseInt2( a[ i ].replace(/[^0-9]/g, ""));     // a should not be an array of length 4 integers that contans lsdf.

                let b = [0, 0, 0, 0], changed = [ false, false, false, false ], loop,
                  objarr = [];
                for( let i = 0; i < a.length; ++i ) {
                  objarr[ i ] = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID,
                          name: [ "Wealth_Gold", "Wealth_Silver", "Wealth_Copper", "Wealth_Bronze" ][i] }, 0);
                  b[ i ] = (a[ i ] * mult) + Earthdawn.parseInt2( objarr[ i ].get( "current" ))
                  if( isNaN( b[ i ] ))
                    b[i] = a[ i ] * mult;
                }
                do {
                  loop = false;   // If a coin is negative, try making change until everything is positive.
                  if(  b[0] > 0                 && b[1] < 0 ) { --b[0]; b[1] += 20; changed[0] = changed[1] = loop = true;}
                  if( (b[0] > 0 || b[1] >  0)         && b[2] < 0 ) { --b[1]; b[2] += 12; changed[1] = changed[2] = loop = true;}
                  if( (b[0] > 0 || b[1] >  0 || b[2] >  0) && b[3] < 0 ) { --b[2]; b[3] +=  4; changed[2] = changed[3] = loop = true;}
                  if( b[1] > 19 && b[0] < 0 ) { ++b[0]; b[1] -= 20; changed[0] = changed[1] = loop = true;}
                  if( b[2] > 11 && b[1] < 0 ) { ++b[1]; b[2] -= 12; changed[1] = changed[2] = loop = true;}
                  if( b[3] >  3 && b[2] < 0 ) { ++b[2]; b[3] -=  4; changed[2] = changed[3] = loop = true;}
                } while ( loop );

                for( let i = 0; i < a.length; ++i )
                  Earthdawn.setWithWorker( objarr[ i ], "current", b[i] );
                post += ssa[ 6 ] + " " + formatLSDF( a[0], a[1], a[2], a[3] )
                    + " (new total " + formatLSDF( b[0], b[1], b[2], b[3] ) + ") ";
              } // End we don't have an empty string for 1879 money.
            } // End 1879 SP
          } // End SP
        } // End not Other
// log( post);
        if ( ( ssa[ 1 ] !== oldReal.trim()) || ( ssa[ 2 ] !== oldThroalic.trim()) )
           Earthdawn.setWithWorker( kobj, "current", post.trim() + "\n" + oldStr );      // Post at top of page.
        else {
            nchar = oldStr.indexOf( "\n" );
            if( nchar === -1 )
                nchar = oldStr.length;
            Earthdawn.setWithWorker( kobj, "current", oldStr.slice( 0, nchar) + "   " + post.trim() + oldStr.slice( nchar ) );      // Post as a continuation of the top line.
        }
        if( post )
          this.chat( post, Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive, null, this.charID);
        if( clear ) {
          let aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "record-reason" }, 0);
          Earthdawn.set( aobj, "current", "" );
          aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "record-amount-LP" }, 0);
          Earthdawn.set( aobj, "current", 0 );
          if( state.Earthdawn.gED ) {
            aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "record-amount-SP" }, 0);
            Earthdawn.set( aobj, "current", 0 );
          } else {
            aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "record-amount-pound" }, 0);
            Earthdawn.set( aobj, "current", 0 );
            aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "record-amount-shilling" }, 0);
            Earthdawn.set( aobj, "current", 0 );
            aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "record-amount-pence" }, 0);
            Earthdawn.set( aobj, "current", 0 );
            aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "record-amount-farthing" }, 0);
            Earthdawn.set( aobj, "current", 0 );
        } }
      } catch(err) { this.edClass.errorLog( "ED.Record() error caught: " + err ); }
    } // End parseObj.Record()



              // ParseObj.RerollNpcInit()
              // Go through all the initiatives currently existing, empty the list, but issue a command to have all conscious NPC's re-roll initiative.
    this.RerollNpcInit = function()  {
      'use strict';
      try {
        let turnorder = ( Campaign().get("turnorder") == "") ? [] : JSON.parse( Campaign().get("turnorder") ),
          newTO = [],
          chatMsg = "";
        _.each( turnorder, function( sel ) {
          if( "custom" in sel )       // Don't clear out any custom (non character) entries that have been added.
            newTO.push( sel );
          let TokObj = getObj("graphic", sel.id);
          if (typeof TokObj === 'undefined' )
            return;
          let cID = TokObj.get("represents");
          let CharObj = getObj("character", cID) || "";
          if (typeof CharObj === 'undefined')
            return;

          if ((Earthdawn.parseInt2( TokObj.get( "bar3_value" )) < (Earthdawn.getAttrBN( cID, "Damage_max", "20", true ))) &&
                  ( Earthdawn.getAttrBN( cID, "NPC", "0", true) > 0 ))   // Not Items, not PCs, and nobody unconscious.
            chatMsg += "~ SetToken : " + sel.id + "~ value : Initiative~ Init~ SetStep: 0~ SetResult: 0";
        });  // End for each selected token
        Campaign().set("turnorder", JSON.stringify(newTO));
        if( chatMsg.length > 0 )
          this.chat( "!Earthdawn" + chatMsg);
      } catch(err) { this.edClass.errorLog( "ED.RerollNpcInit() error caught: " + err ); }
    } // End ParseObj.RerollNpcInit()



            // ParseObj.Roll ( ssa )
            // Roll a Test for selected token.
            //      ssa[] - Step modifiers.
    this.Roll = function( ssa )  {
      'use strict';
      try {
        let init = ssa[ 0 ].toLowerCase() === "init";
        if( this.tokenInfo === undefined || (init && this.tokenInfo.tokenObj === undefined)) {
          if( init )  this.chat( "Initiative requires a token be selected. Do you have a token selected?", Earthdawn.whoFrom.apiWarning );
          else        this.chat( "Error! tokenInfo undefined in Roll() command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError);
          return;
        }
        if( init && ("step" in this.misc === false)) {
          this.chat( "Error! Step value undefined in Roll() command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError);
          return;
        }
        this.misc[ "cButtons" ] = [];
        let dice,
          recipients = this.WhoSendTo(),
          step = (this.misc[ "step" ] || 0) + this.ssaMods( ssa );   // Add any mods to roll.

        if( this.indexTarget !== undefined ) {
          let tokChar = Earthdawn.tokToChar( Earthdawn.getParam( this.targetIDs[ this.indexTarget ], 1, ":"));
          this.misc[ "targetChar" ] = tokChar;
          if ( this.uncloned.bFlags & Earthdawn.flags.HitsFound ) {
            let extra = Earthdawn.parseInt2( Earthdawn.getParam( this.targetIDs[ this.indexTarget ], 2, ":"));
            if( extra > 0 ) {
              step += extra * ((Earthdawn.getAttrBN( tokChar, "Creature-HardenedArmor", "0") == "1") ? 1: 2);
              this.misc[ "stepExtra" ] = extra;
        } } }
        if( init && Earthdawn.getAttrBN( this.charID, "Misc-StrainPerTurn", "0" ) > 0 ) {
          this.misc[ "StrainPerTurn" ] = Earthdawn.getAttrBN( this.charID, "Misc-StrainPerTurn", "0" );
          this.doLater += "~StrainSilent:" + this.misc[ "StrainPerTurn" ];
        }

        this.doNow();
        if ( step < 1 ) {
          dice = "d0";
          if( init )
            this.misc[ "warnMsg" ] = "If anything other than armor and wounds are causing " + this.tokenInfo.tokenObj.get( "name" )
                    + " an initiative step of " + step + " it is probably illegal.";
          else if (this.misc[ "reason" ] && !this.misc[ "reason" ].startsWith( "1 " ) && !this.misc[ "reason" ].endsWith( " Only" ))
            this.misc[ "warnMsg" ] = "Warning!!! Step number " + step;
          else
            dice = "";
        } else
          dice = this.edClass.StepToDice( step );
        this.misc[ "finalStep" ] = step;
        this.misc[ "effectiveStep" ] = (("effectiveStep" in this.misc) ? this.misc[ "effectiveStep" ] : 0 ) + step;
        if( "bonusDice" in this.misc )
          dice += this.misc[ "bonusDice" ];
        if( "karmaDice" in this.misc )
          dice += this.misc[ "karmaDice" ];
        if( "result" in this.misc && this.misc[ "result" ] ) {
          if( Earthdawn.parseInt2( this.misc[ "result" ]) < 0 )
            dice = "{{" + dice + "+" + this.misc[ "result" ] + "}+d1}kh1";
          else
            dice += "+" + this.misc[ "result" ];
          this.misc[ "resultMod" ] = this.misc[ "result" ];
          this.misc[ "effectiveStep" ] += this.misc[ "result" ];
        }
        if( dice.startsWith( "+" ))
          dice = dice.slice( 1 );
        this.misc[ "dice" ] = dice;
        let sh = "vs.";
        if( "targetName" in this.misc )
          sh += " " + this.misc[ "targetName" ] + (( "targettype" in this.misc) ? "'s  " : "");
        if( "targettype" in this.misc )
          sh += " " + this.misc[ "targettype" ].replace( "p1p", " +1p");
        if( this.targetNum > 0 )
          if ((this.bFlags & (Earthdawn.flagsTarget.Ask | Earthdawn.flagsTarget.Riposte | Earthdawn.flags.VerboseRoll))
                || (( "StyleOverride" in this.misc ? this.misc[ "StyleOverride" ] : state.Earthdawn.style) === Earthdawn.style.Full))
            sh += " Target # " + this.targetNum;
          else
            this.misc[ "gmTN" ] = this.targetNum;
        if( sh.length > 3 )
          sh += ".   ";
        else
          sh = "";
        if( "strain" in this.misc )
          sh += this.misc[ "strain" ] + " strain.";
        if( "stun" in this.misc )
          sh += this.misc[ "strain" ] + " stun damage.";
        if (sh.length > 3 )
          this.misc[ "subheader" ] = sh;
        let aobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: this.charID, name: "Creature-CursedLuck" }, 0),
          cluck = Earthdawn.parseInt2( aobj.get( "current" ));
        if( cluck > 0 ) {
          this.misc[ "CursedLuck" ] = cluck;
          aobj.setWithWorker( "current", 0);
        }
        if ((cluck > 0) || (Earthdawn.getAttrBN( this.charID, "NPC", "0") > 0 && ((state.Earthdawn.noPileonDice != undefined && state.Earthdawn.noPileonDice >= 0)
              || (state.Earthdawn.noPileonStep != undefined && state.Earthdawn.noPileonStep > 0))))
          this.misc[ "DiceFunnyStuff" ] = true;
        if( "FX" in this.misc && (this.misc[ "FX" ].startsWith( "Attempt" ) || this.misc[ "FX" ].startsWith( "Effect" )))
          this.FX( this.misc[ "FX" ] );
        if( dice === "" )   // If for some reason you are rolling a step zero without karma, just forget the whole thing.
          return;

        this.misc[ "natural" ] = ((this.targetNum || 0) == 0)
              && !(recipients & Earthdawn.whoTo.player )
              && !( this.uncloned.bFlags & Earthdawn.flags.HitsFound )
              && !( this.bFlags & Earthdawn.flagsArmor.Mask )
              && !( this.bFlags & Earthdawn.flags.Recovery )
              && !( "DiceFunnyStuff" in this.misc )
              && !init;
        if ( this.misc[ "natural" ] ) {   // A natural roll is one without a callback. It just goes out, and the raw results are returned.  Done for rolls without target numbers, and rolls that are sent to both player and gm, but not public.
          this.misc[ "roll" ] = "[[" + dice + "]]";
          this.rollFormat( recipients );
        } else {    // Not a "natural" roll. We are going to send it to the dice roller now, but capture the result for interpretation.
          let po = this;
          po.edClass.rollCount++;
          sendChat( "player|" + this.edClass.msg.playerid, "/r " + dice, function( ops ) {
            'use strict';
                  // NOTE THAT THIS IS THE START OF A CALLBACK FUNCTION
            if( ops.length !== 1 )
              this.edClass.errorLog( "Earthdawn.js program warning! ops returned length of " + ops.length);
            let con = JSON.parse(ops[0].content);
            if ( "DiceFunnyStuff" in po.misc ) {
              po.misc[ "DiceOrigional" ] = con;
              con = po.CursedLuck( po.misc[ "CursedLuck" ], con );
            }
            po.misc[ "result" ] = con.total;
            po.misc[ "showResult" ] = (( "StyleOverride" in po.misc ? po.misc[ "StyleOverride" ] : state.Earthdawn.style) != Earthdawn.style.VagueRoll)
                  || ( po.bFlags & Earthdawn.flags.VerboseRoll )
                  || ((po.targetNum || 0) == 0) || init
                  || (recipients == Earthdawn.whoTo.gm);    // going to gm only.

                      // We have a target number. Count successes.
            if ((po.targetNum || 0) > 0) {
              let res = po.misc[ "result" ] - po.targetNum;
              if( res < 0 ) {
                po.misc[ "failBy" ] = Math.abs( res );
                po.edClass.countFail++;
                if( po.misc[ "Special" ] === "Knockdown" ) {
//                  let aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: "condition-KnockedDown" });
//                  Earthdawn.setWithWorker( aobj, "current", "1" );
                  po.MarkerSet( ["r", "knocked", "s"] );
                  po.misc[ "endNoteFail" ]="Character Knocked Down";
                }
              } else {    // Have target number and succeeded.
                po.misc[ "succBy" ] = Math.abs(res);
                po.misc[ "extraSucc" ] = Math.floor(res / 5) + (("grimCast" in po.misc) ? 1 : 0);
                po.edClass.countSuccess++;
                if( "FX" in po.misc && po.misc[ "FX" ].startsWith( "Success" ))
                  po.FX( po.misc[ "FX" ] );
                if( (po.bFlags & Earthdawn.flagsTarget.Riposte) && po.misc[ "extraSucc" ] > 0 && ("targetNum2" in po.misc))   // Special situation, Since the test succeeded against the first target number, compare it against a 2nd target number to count the successes!
                  po.misc[ "secondaryResult" ] = po.misc[ "result" ] - po.misc[ "targetNum2" ];
                if((( "Special" in po.misc ) && (po.misc[ "Special" ] == "SPL-Spellcasting") && ( "targetName" in po.misc )) ||  //We need rollESbutton to memorize hits on spellcasting tests
                      (( po.bFlags & Earthdawn.flagsTarget.Mask) && (( "ModType" in po.misc ) && (po.misc[ "ModType" ].search( /Attack/ ) != -1)) //Attack rolls
                      && (po.targetIDs[ po.indexTarget] !== undefined )))     // The last bit of this keeps riposte tests from messing it up.
                  po.rollESbuttons();
              }   // End have successes
            }   // End we have a target number

                  // Apply Damage if appropriate. IE: if this was a damage roll, and hits were found on any of the selected tokens.
            let dcode, dtext;
            if (      po.bFlags & Earthdawn.flagsArmor.PA )     { dcode = ["PA"]; dtext = ["Physical"]; }
            else if ( po.bFlags & Earthdawn.flagsArmor.MA )     { dcode = ["MA"]; dtext = ["Mystic"]; }
            else if ( po.bFlags & Earthdawn.flagsArmor.None )   { dcode = ["NA"]; dtext = ["No"]; }
            else if ( po.bFlags & Earthdawn.flagsArmor.Unknown) { dcode = ["PA", "MA", "NA"]; dtext = ["Physical","Mystic","No"]; }

            if( dcode !== undefined ) {   // This is a damage roll.
              if( po.uncloned.bFlags & Earthdawn.flags.HitsFound ) {
                let targs;
                if ( po.bFlags & Earthdawn.flags.WillEffect )
                  targs = po.targetIDs;
                else
                  targs = [ po.targetIDs[ po.indexTarget ]]
                for( let ind = 0; ind < targs.length; ++ind ) {
                  let tID = Earthdawn.getParam( targs[ ind ], 1, ":");
                  for( let i = 0; i < dcode.length; ++i ) {
                    po.misc[ "cButtons" ].push({
                    link: "!Earthdawn~ setToken: " + tID + "~ Damage: " +dcode[i] + ": " + po.misc[ "result" ]
                        + ": ?{Damage Mod (" + ((po.bFlags & Earthdawn.flagsArmor.Natural) ? " Natural" : "")
                        + dtext[i] + " Armor applies)|0}",
                    text: "Apply Dmg " + dcode[i] + (( po.bFlags & Earthdawn.flagsArmor.Natural) ? "-Nat" : "")
                        + " - " + po.getTokenName( tID ) });
              } } }
              for( let i = 0; i < dcode.length; ++i )
                po.misc[ "cButtons" ].push({
                    link: "!Earthdawn~ setToken: &#64;{target|Apply damage to which token|token_id}~ Damage: " +dcode[i]
                        + ": " + po.misc[ "result" ] + ": ?{Damage Mod ("
                        + ((po.bFlags & Earthdawn.flagsArmor.Natural) ? " Natural" : "") + dtext[i] + " Armor applies)|0}",
                    text: "Apply Dmg " + dcode[i] + (( po.bFlags & Earthdawn.flagsArmor.Natural) ? "-Nat" : "") + " - Targeted",
                    tip: "Apply this damage to the token you click upon."});
            } // end damage roll

            if( init ) {      // This is an initiative roll.
              let tID = po.tokenInfo.tokenObj.get( "id" );
              let tt = Campaign().get( "turnorder" );
              let turnorder = (tt == "") ? [] : ( JSON.parse( tt ));
              turnorder = _.reject(turnorder, function( toremove )   { return toremove.id === tID });
              turnorder.push({ id: tID, pr: po.misc[ "result" ], secondary: ("000" + po.misc[ "result" ]).slice(-3)
                  + ((Earthdawn.getAttrBN( po.charID, "NPC", "0" ) == Earthdawn.charType.pc) ? "1" : "0" )
                  + ("000" + Earthdawn.getAttrBN( po.charID, "Attrib-Dex-Curr", "5" )).slice(-3) + ("000" + step).slice( -3)});
              turnorder.sort( function( a, b ) {
                'use strict';
                if( "secondary" in a && "secondary" in b ) {
                  if( a.secondary < b.secondary )       return 1;
                  else if ( a.secondary > b.secondary ) return -1;
                  else                                  return 0;
                } else
                  return (b.pr - a.pr)
              }); // End turnorder.sort();
              Campaign().set("turnorder", JSON.stringify( turnorder ));
            } // End Initiative

                  // Send the results to the user.
            po.rollFormat( recipients, con );

            if(( --po.edClass.rollCount === 0) && (po.edClass.countFail + po.edClass.countSuccess) > 1)
              po.chat( "Group " + po.misc[ "reason" ] + " results. " + po.edClass.countSuccess.toString() + " succeeded and " +
            po.edClass.countFail.toString() + " failed.", recipients);

            if( po.bFlags & Earthdawn.flags.Recovery )
              po.Damage( [ "Recovery", "NA", "-" + po.misc[ "result" ] ]);
            if( init ) {
              po.ParseLoop();         // This callback thread is to continue parsing this.
              return false;
            }
          }, {noarchive:true});  // End of sendChat callback function
          if( init )
            return true;  // If this is an init roll, then parseLoop should fallout here.
        } // end not a natural roll
      } catch(err) { this.edClass.errorLog( "ED.Roll() error caught: " + err ); }
    } // End ParseObj.Roll(ssa)





          // ParseObj.rollESbuttons()
          // create chat window buttons for the user to spend extra successes upon.
          // Also do the special coding required for powers such as Cursed Luck or Corrupt Karma here (instead of buttons).
    this.rollESbuttons = function()  {
      'use strict';
      try {
        let suc = this.misc[ "extraSucc" ],
          po = this,
          targetName,
          lstart, lend;

        function makeButtonLocal( nm, txt, lnk, tip ) {
            po.misc[ "cButtons" ].push( { name: nm, text: txt, link: lnk, tip: tip });
        };

        if (this.bFlags & Earthdawn.flagsTarget.Highest) {
          lstart = 0;
          lend = this.targetIDs.length;
        } else {
          lstart = this.indexTarget;
          lend = this.indexTarget + 1;
        }
        let charStr1 = "!Earthdawn~ " + (( this.tokenInfo !== undefined && this.tokenInfo.tokenObj !== undefined)
                ? "setToken: " + this.tokenInfo.tokenObj.get( "id" ) : "charID: " + this.charID );
        let numTargets = lend - lstart;
        for( let i = lstart; i < lend; ++i ) {
          if ( this.misc[ "Special" ] === "CorruptKarma" ) {
            if( playerIsGM( this.edClass.msg.playerid ) ) {
              let targetChar = Earthdawn.tokToChar( this.targetIDs[ i ] );
              if( targetChar ) {
                let aobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: targetChar, name: "Creature-CorruptKarmaBank" }, 0),
                  val = Earthdawn.parseInt2(this.misc[ "extraSucc" ]) + 1 + Earthdawn.parseInt2( aobj.get( "current" ));
                Earthdawn.setWithWorker( aobj, "current", val );
              }
            } else
              this.chat( "Error! Only GM is allowed to do run CorruptKarma powers!", Earthdawn.whoFrom.apiError);
          } else if ( this.misc[ "Special" ] === "CursedLuck" ) {
            if( playerIsGM( this.edClass.msg.playerid ) ) {
              let targetChar = Earthdawn.tokToChar( this.targetIDs[ i ] );
              if( targetChar )
                Earthdawn.setWW( "Creature-CursedLuck", Earthdawn.parseInt2( this.misc[ "extraSucc" ]) + 1, targetChar );
            } else
              this.chat( "Error! Only GM is allowed to do Cursed Luck powers!", Earthdawn.whoFrom.apiError);
          } else {    // It is a more generic hit, without any special coding.
            this.TokenSet( "add", "Hit", this.targetIDs[ i ], "0");     // Make note that this token has hit that token.
            if( numTargets > 1 )
              targetName = this.getTokenName( this.targetIDs[ i ] );
            if( !(this.bFlags & Earthdawn.flags.NoOppMnvr )) {    // We don't record these extra successes as something that affects damage rolls.
              makeButtonLocal( targetName, "Bonus Dmg", charStr1 + "~ StoreInToken: Hit: " + this.targetIDs[ i ]
                    + ":?{How many of the extra successes are to be devoted to bonus damage to " + this.getTokenName( this.targetIDs[ i ] ) + "|" + suc + "}",
                    "How many of the " + suc + " extra successes are to be devoted to bonus damage to " + this.getTokenName( this.targetIDs[ i ] ));
              makeButtonLocal( targetName, "Opp Mnvr", charStr1 + "~ ChatMenu: OppMnvr: " + this.targetIDs[ i ], "Choose Opponent Maneuvers that might or might not be applicable to this Target." );

              let attributes = findObjs({ _type: "attribute", _characterid: this.charID }),
              cc = (( "ModType" in po.misc ) && (po.misc[ "ModType" ].search( /CC/ ) != -1) ? "1" : "-1");
              _.each( attributes, function (att) {
                if (att.get("name").endsWith( "_WPN_Name" ))
                  if( Earthdawn.getAttrBN(po.charID, att.get( "name" ).slice( 0, -5) + "_CloseCombat", "1") == cc)
                    makeButtonLocal( targetName, att.get( "current" ),
                        "!edToken~ " + Earthdawn.constant( "percent" ) + "{" + po.charID + "|" + att.get( "name" ).slice(0, -4) + "Roll}",
                        "Roll a Weapon Damage.");
                if (att.get("name").endsWith( "_Mod-Type" ) && att.get("current").startsWith("Damage")
                      && (att.get("current").endsWith("CC") ?"1":"-1") == cc) {
                  let pre = Earthdawn.buildPre( att.get( "name")),
                    name = Earthdawn.getAttrBN( po.charID, pre + "Name", "" )
                  makeButtonLocal( targetName, name,
                        "!edToken~ " + Earthdawn.constant( "percent" ) + "{" + po.charID + "|" + pre + "Roll}", "Roll an Ability Damage.");
                }
              }); // End for each attribute.

              let cflags = Earthdawn.getAttrBN( this.charID, "CreatureFlags", 0 );
              if( cflags & Earthdawn.flagsCreature.CreatureMask ) {
                if( cflags & Earthdawn.flagsCreature.GrabAndBite )
                  makeButtonLocal( targetName, "Grab & Bite", charStr1 + "~ CreaturePower: " + "GrabAndBite: " + this.targetIDs[ i ],
                    "The creature may spend an additional success from an Attack test to automatically grapple an opponent. Grappled opponents automatically take bite damage each round until the grapple is broken." );
                if( cflags & Earthdawn.flagsCreature.Hamstring )
                  makeButtonLocal( targetName, "Hamstring", charStr1 + "~ CreaturePower: " + "Hamstring: " + this.targetIDs[ i ],
                    "The creature may spend an additional success from an Attack test to halve the opponent’s Movement until the end of the next round. If the attack causes a Wound, the penalty lasts until the Wound is healed." );
                if( cflags & Earthdawn.flagsCreature.Overrun )
                  makeButtonLocal( targetName, "Overrun", charStr1 + "~ CreaturePower: " + "Overrun: " + this.targetIDs[ i ],
                    "The creature may spend an additional success from an Attack test to force an opponent with a lower Strength Step to make a Knockdown test against a DN equal to the Attack test result." );
                if( cflags & Earthdawn.flagsCreature.Pounce )
                  makeButtonLocal( targetName, "Pounce", charStr1 + "~ CreaturePower: " + "Pounce: " + this.targetIDs[ i ],
                    "If the creature reaches its opponent with a leap and the opponent isn’t too much larger, the creature may spend an additional success from the Attack test to force the opponent to make a Knockdown test against a DN equal to the Attack test result." );
                if( cflags & Earthdawn.flagsCreature.SqueezeTheLife )
                  makeButtonLocal( targetName, "Squeeze the Life", charStr1 + "~ CreaturePower: " + "SqueezeTheLife: " + this.targetIDs[ i ],
                    "The creature may spend two additional successes from an Attack test to automatically grapple an opponent. Grappled opponents automatically take claw damage each round until the grapple is broken." );
              }

              let lst = Earthdawn.getAttrBN( po.charID, "ManRowIdList", "bad" );
              if( lst !== "bad" && lst.length > 1 ) {
                let arr = lst.split( ";" );
                for( let i = 0; i < arr.length; ++i ) {
                  let pre = Earthdawn.buildPre( "MAN", arr[ i ] );
                  if( Earthdawn.getAttrBN( po.charID, pre + "Type", "1") == "1" ) {   // type 1 is Creature
                    let n = Earthdawn.getAttrBN( po.charID, pre + "Name", ""),
                      d = Earthdawn.getAttrBN( po.charID, pre + "Desc", "");
                    if( n.length > 0 || d.length > 0 )
                      makeButtonLocal( targetName, Earthdawn.getAttrBN( po.charID, pre + "Name", "" ),
                            charStr1 + "~ CreaturePower: " + "Custom" + arr[ i ] + ": " + po.charID,
                            Earthdawn.getAttrBN( this.charID, pre + "Desc", "" ));
        } } } } } } // End it's a hit, and end foreach target
      } catch(err) { this.edClass.errorLog( "ED.RollESbuttons() error caught: " + err ); }
    } // End ParseObj.RollESbuttons()



                // ParseObj.rollFormat()
                // create HTML to nicely format the roll results.
    this.rollFormat = function( recipients, rolls )  {
      'use strict';
      try {
        let po = this,
          pIsGM = playerIsGM( this.edClass.msg.playerid ),
          playerCard = !pIsGM && (recipients & Earthdawn.whoTo.gm) && !(recipients & Earthdawn.whoTo.player),   // Need a msg to player saying roll was sent to gm.
          playerCardNix = [];
        let whichMsgs = recipients & ( pIsGM ? ~Earthdawn.whoTo.player : ~0x00);    // This is recipients, but if pIsGM, then strips out the to player bit.

        let sect = Earthdawn.newSect(),
          cls="sheet-rolltemplate-header",
          bsub = ( "subheader" in this.misc) && ("reason" in this.misc) && ((this.misc[ "reason" ].length + this.misc[ "subheader" ].length) > 25);
        if( "headcolor" in this.misc )
          cls += " sheet-rolltemplate-icon-" + this.misc[ "headcolor" ].toLowerCase();
        sect.append( "", this.misc[ "reason" ]      // Main Header
              + ((bsub || !("subheader" in this.misc) )? "" : "  --  " + new HtmlBuilder( "span", this.misc[ "subheader" ], {    // Sub-Header
              class: "sheet-rolltemplate-subheadertext" })
              ), {class : cls});
        if( bsub )
          sect.append("", this.misc[ "subheader" ], {   // Sub-Header
                class: "sheet-rolltemplate-subheadertext"});

        let linenum = 0, modBit = 0, x, x2,
          body = Earthdawn.newBody( sect ),
          txt = "";
        if( "warnMsg" in this.misc )
          body.append( "", this.misc[ "warnMsg" ], {
                style: {
                "background-color": "Orange",
                "text-align":   "center"
                }});

        if( "SP-Step" in this.misc )
          this.misc[ "ModType" ] = "@{Adjust-All-Tests-Total}";   // The spellcasting talents are talents to, make them look a bit more like the other talents.
        if( "ModType" in this.misc ) {    // Conditions and options that affected the step.
          let modtype = this.misc[ "ModType" ],
            extraMod = 0;

                      // 0x20 range are all effect tests. 0x10 range are all action tests.
          if ((modtype.search( /Adjust-All-Tests-Total/ ) != -1) || (modtype.search( /Action/ ) != -1))
            modBit = 0x11;
          else if (modtype.search( /Attack/ ) != -1) {
            if (modtype.search( /CC/ ) != -1)
              modBit = 0x14;
            else
              modBit = 0x12;
          } else if (modtype.search( /Armor/ ) != -1)
            modBit = 0x18;
          else if (modtype.search( /Effect/ ) != -1)
            modBit = 0x21;
          else if (modtype.search( /Damage/ ) != -1) {
            if (modtype.search( /CC/ ) != -1)
              modBit = 0x24;
            else
              modBit = 0x22;
          } else if (modtype.search( /Init/ ) != -1)
            modBit = 0x28;
          else if (modtype === "0" )
            modBit = 0x40;

          if( modBit === 0x18 && (x = this.getValue( "Armor-IP" )) != 0)
            txt += Earthdawn.texttip( "  Armor (only) IP: -" + x, "Penalty from Armor (but not shield)." );
          else if( modBit === 0x28 && ((x = this.getValue( "Initiative-Mods" ) + this.getValue( "Initiative-Mods-Auto" )) != 0))
            txt += Earthdawn.texttip( "  IP: " + x, "Initiative Modifiers, most commonly penalty from armor and shield." );
          else if( modBit === 0x40 )
            txt += Earthdawn.texttip( "  Never. ", "This test never has any modifiers." );

          if((( modBit & 0x10 ) || ( modBit & 0x20 && Earthdawn.getAttrBN( this.charID, "effectIsAction", "0", true )))
                && (x = this.getValue( "Adjust-All-Tests-Misc" )) != 0)
            txt += Earthdawn.texttip( "  Action Misc: " + x, "Misc modifiers that apply to Action Tests." );
          if(( modBit & 0x20 ) && !Earthdawn.getAttrBN( this.charID, "effectIsAction", "0", true) && (x = this.getValue( "Adjust-Effect-Tests-Misc" )) != 0)
            txt += Earthdawn.texttip( "  Effect Misc: " + x, "Misc modifiers that apply to Effect Tests." );
          if(( modBit == 0x12 || modBit == 0x14 ) && (x = this.getValue( "Adjust-Attacks-Misc" )) != 0)
            txt += Earthdawn.texttip( "  Attack Misc: " + x, "Misc modifiers that apply to Attack Tests." );
          if(( modBit == 0x22 || modBit == 0x24 ) && (x = this.getValue( "Adjust-Damage-Misc" )) != 0)
            txt += Earthdawn.texttip( "  Damage Misc: " + x, "Misc modifiers that apply to Damage Tests." );
          if(( modBit & 0x04 ) && (this.getValue( "combatOption-AggressiveAttack" ) == "1" ))   // & 0x04 is -CC
            txt += Earthdawn.texttip( "  Aggressive: " + Earthdawn.getAttrBN( this.charID, "Misc-AggStance-Bonus", "3" ),
                "Aggressive Stance: +" + Earthdawn.getAttrBN( this.charID, "Misc-AggStance-Bonus", "3" )
                + " bonus to Close Combat attack and damage tests. " + Earthdawn.getAttrBN( this.charID, "Misc-AggStance-Penalty", "-3")
                + " penalty to PD and MD. " + Earthdawn.getAttrBN( this.charID, "Misc-AggStance-Strain", "1") + " Strain per Attack." );

//          if( "rsPrefix" in this.misc || "SP-Step" in this.misc ) {   // rsPrefix means came from "Action". SP-Step means spellcasing command line.
// Note, I don't think the above test was needed. But maybe it was.
          if(( modBit & 0x10 || modBit == 0x22 || modBit == 0x24 ) && this.getValue( "combatOption-DefensiveStance" ) == "1")
            if( "Defensive" in this.misc )
              extraMod += Earthdawn.getAttrBN( this.charID, "Misc-DefStance-Penalty", "3", true );    // extraMod is adding back in stuff that already subtracted from the base modifications if that modification does not apply to this test.
            else
              txt += Earthdawn.texttip( "  Def.Stance: -" + Earthdawn.getAttrBN( this.charID, "Misc-DefStance-Penalty", "3" ),
                  "Defensive Stance: +"  + Earthdawn.getAttrBN( this.charID, "Misc-DefStance-Bonus", "3" )
                  + " bonus to PD and MD. " + Earthdawn.getAttrBN( this.charID, "Misc-DefStance-Penalty", "-3")
                  + " penalty to all actions except defensive rolls and Knockdown tests." );
          if(( modBit & 0x10 ) && this.getValue( "condition-KnockedDown" ) == "1")
//            if (("Resistance" in this.misc ) || (modBit == 0x18))
            if ("Resistance" in this.misc )
              extraMod += 3;
            else
              txt += Earthdawn.texttip( "  Knocked Down.", "Knocked Down: -3 penalty on all defenses and tests. Movement 2. May not use Combat Option other than Jump-Up." );
          if( "MoveBased" in this.misc ) {
            extraMod -= this.getValue( "condition-ImpairedMovement" );
            txt += Earthdawn.texttip( "  Impaired Move: " + this.misc[ "MoveBased" ], "Impaired Movement: -5/-10 to Movement Rate (1 min). -2/-4 Penalty to movement based tests due to footing, cramping, or vision impairments. Dex test to avoid tripping or halting." );
          }
          if( "VisionBased" in this.misc ) {
            extraMod -= this.getValue( "condition-Darkness" );
            txt += Earthdawn.texttip( "  Impaired Vision: " + this.misc[ "VisionBased" ], "Impaired Vision: -2/-4 Penalty to all sight based tests due to Darkness, Blindness or Dazzling." );
          }
//          } // from Action() or spell.

          if(( modBit == 0x12 || modBit == 0x14)
                && this.getValue( "combatOption-CalledShot" ) == "1" && !("SP-Step" in this.misc))
            txt += Earthdawn.texttip( "  Called Shot: -3", "Take one Strain; –3 penalty to Attack test; if successful, attack hits designated area. One automatic extra success for maneuver being attempted, other extra successes spent that way count twice." );
          if( modBit & 0x10 && this.getValue( "combatOption-SplitMovement" ) == "1" )
            txt += Earthdawn.texttip( "  Split Move.", "Split Movement: Take 1 Strain and be Harried to attack during movement." );
          if( modBit & 0x10 && this.getValue( "combatOption-TailAttack" ) == "1" )
            txt += Earthdawn.texttip( "  Tail Attack: -2", "Tail Attack: T'Skrang only: Make extra Attack, Damage = STR. -2 to all Tests." );
          if(( modBit == 0x12 || modBit == 0x22 || modBit == 0x14 || modBit == 0x24)    // Note, -CC does not make any sense, but if they DID do it, let them, especially since the updateAdjustAttacks() routine lets them and it is too much of a pain to fix.
                && !("SP-Step" in this.misc) && this.getValue( "condition-RangeLong" ) == "1" )
            txt += Earthdawn.texttip( "  Long Range: -2", "The attack is being made at long range. -2 to attack and damage tests." );
          if( this.getValue( "condition-Surprised" ) == "1" )
            txt += Earthdawn.texttip( "  Surprised!", "Acting character is surprised. Can it do this action?" );
          if( modBit & 0x10 && this.getValue( "condition-Harried" ) != "0" )
            txt += Earthdawn.texttip( "  Harried: -" + this.getValue( "condition-Harried" ), "Harried: Penalty to all Tests and to PD and MD." );
          if(( modBit & 0x02 || modBit & 0x04 || modBit == 28 )&& this.getValue( "Creature-Ambushing" ) != "0" )
            txt += Earthdawn.texttip( "  Ambush: " + this.getValue( "Creature-Ambush" ), "Ambush: Added to Initiative, Attack, and Damage." );
          if(( modBit & 0x02 || modBit & 0x04 )&& this.getValue( "Creature-DivingCharging" ) != "0" )
            txt += Earthdawn.texttip( "  Diving or Charging: " + this.getValue( "Creature-DiveCharge" ), "Diving or Charging: Added to Attack, and Damage" );
          if(( modBit & 0x10 || modBit & 0x20 ) && (x = this.getValue( "Wounds" )) > 0)
            if( this.getValue( "Creature-Fury" ) >= x )
              txt += Earthdawn.texttip( "  +" + x + " Fury.", "Instead of suffering penalties, Wounds grant this creature a bonus to tests." );
            else if ((x2 = this.getValue( "Creature-ResistPain" )) < x)
              txt += Earthdawn.texttip( "  -" + (x2 - x) + " Wounds.", "-1 penalty to all action and effect tests per wound." );

          let modvalue = this.misc[ "ModValue" ] + extraMod;
          if( txt.length > 0 || modvalue )
            body.append( (( ++linenum % 2) ? ".odd" : ".even"),
                  Earthdawn.texttip( "<b>Mods:</b> " + ((modvalue) ? modvalue.toString() + " " : " " ),
                  "Total of all bonuses and Penalties." ) + txt.trim());

          txt = "";   // Stuff under here flows down into target.
          if(( modBit == 0x12 || modBit == 0x14  || ("SP-Step" in this.misc)) && this.getValue( "condition-Blindsiding" ) == "1")
            txt += Earthdawn.texttip( "  Blindsiding: +2", "The acting character is blindsiding the targeted character, who takes -2 penalty to PD and MD. Can't use shield. No active defenses." );
          if(( modBit == 0x12 || modBit == 0x14 || "SP-Step" in this.misc) && this.getValue( "condition-TargetPartialCover" ) == "1")
            txt += Earthdawn.texttip( "  Tgt Cover: +2", "The targeted character has cover from the acting character. +2 bonus to PD and MD." );
          if( modBit & 0x10 && this.getValue( "combatOption-Reserved" ) == "1" )
            txt += Earthdawn.texttip( "  Reserved Actn: +2", "Reserved Action: +2 to all Target Numbers. Specify an event to interrupt." );
        }  // end modType

        if( "stepExtra" in this.misc )
          body.append( (( ++linenum % 2) ? ".odd" : ".even"), "<b>Extra Successes:</b> " + this.misc[ "stepExtra" ]);

        if( this.indexTarget !== undefined && modBit & 0x10 ) {
          let targetChar = Earthdawn.tokToChar( Earthdawn.getParam( this.targetIDs[ this.indexTarget ], 1, ":"));
          if ( targetChar ) {
            if((x = Earthdawn.getAttrBN( targetChar, "Adjust-Defenses-Misc", "0" )) != 0
                  && ( "targettype" in this.misc && this.misc[ "targettype" ].indexOf( "SD") == -1))
              txt += Earthdawn.texttip( "  Defenses Misc: " + x, "Total of all bonuses and penalties to targets PD and MD." );
            if( Earthdawn.getAttrBN( targetChar, "combatOption-AggressiveAttack", "0" ) == "1" )
              txt += Earthdawn.texttip( "  Aggressive: " + Earthdawn.getAttrBN( targetChar, "Misc-AggStance-Penalty", "-3" ),
                "Target is in an Aggressive Stance, giving bonuses to Attack and Damage, but penalty to PD and MD.");
            if( Earthdawn.getAttrBN( targetChar, "combatOption-DefensiveStance", "0" ) == "1" )
              txt += Earthdawn.texttip( "  Defensive: " + Earthdawn.getAttrBN( targetChar, "Misc-DefStance-Bonus", "3" ),
                "Target is in a Defensive Stance, giving a bonus to PD and MD." );
            if( Earthdawn.getAttrBN( targetChar, "condition-Blindsided", "0" ) == "1" )
              txt += Earthdawn.texttip( "  Blindsided: -2", "Target is blindsided and takes -2 penalty to physical and mystic defenses. Can't use shield. No active defenses." );
            if( Earthdawn.getAttrBN( targetChar, "condition-KnockedDown", "0" ) == "1" )
              txt += Earthdawn.texttip( "  Knocked Down: -3", "Target is Knocked Down and suffers a -3 penalty to all defenses." );
            if( Earthdawn.getAttrBN( targetChar, "condition-Surprised", "0" ) == "1" )
              txt += Earthdawn.texttip( "  Surprised: -3", "Target is surprised and suffers a -3 penalty to all defenses." );
            if((x = Earthdawn.getAttrBN( targetChar, "condition-Cover", "0" )) != "0" )
              txt += Earthdawn.texttip( "  Cover " + ((x == "2") ? "Partial: -2" : "Full:<span style='color: red;'> Can't hit.</span>"),
                  "Target has cover and gains bonus to PD and MD." );
            if((x = Earthdawn.getAttrBN( targetChar, "condition-Harried", "0" )) != "0" )
              txt += Earthdawn.texttip( "  Harried: -" + x + ".",
                  "Target is Harried and suffers a penalty to PD and MD as well as action tests." );
        } }
        if( txt.length > 0 )
          body.append( (( ++linenum % 2) ? ".odd" : ".even"), "<b>Target:</b>" + txt.trim());

        let gmResult = "";
        if( this.misc[ "step" ] || this.misc[ "finalStep" ] || this.misc[ "dice" ] ) {      // if all three of these are undefined or zero, then skip this (this should probably only be the case for NoRoll).
          let tip = (( "dice" in this.misc)     ? this.misc[ "dice" ].replace( /!/g, "") + ".   " : "" )
                + (( "step" in this.misc)     ? "Base step " + this.misc[ "step" ] : "" )
                + (( "stepExtra" in this.misc)  ? " plus " + this.misc[ "stepExtra" ] + " extra successes." : "");
          txt = (( "bonusStep" in this.misc ) ? " + step " + this.misc[ "bonusStep" ] + " bonus" : "")
                + (( "karmaNum" in this.misc )  ? " + " + this.misc[ "karmaNum" ] + " karma" : "")
                + (( "DpNum" in this.misc )   ? " + " + this.misc[ "DpNum" ] + " Dev Pnts" : "")
                + (( "resultMod" in this.misc ) ? ((this.misc[ "resultMod" ] < 0) ? " - " : " + ") + Math.abs(this.misc[ "resultMod" ]) : "" )
                + (( "roll" in this.misc )    ? ". = " + this.misc[ "roll" ] : "." );
          body.append( ( ++linenum % 2) ? ".odd" : ".even",
              new HtmlBuilder( "span", "<b>Step:</b> "
                        + (( "finalStep" in this.misc ) ? this.misc[ "finalStep" ] : (( "step" in this.misc ) ? this.misc[ "step" ] : "")), {
                style: { "background": "lightgoldenrodyellow" },
//              class: "showtip tipsy",   // removing this gives us black on white long tool tips rather than the white on black tooltips that have a display bug.
                title: Earthdawn.encode( Earthdawn.encode( tip )) }) + txt );
        }

        if( "CorruptedKarma" in this.misc )
          body.append( "", new HtmlBuilder( "span", this.misc[ "CorruptedKarma" ] + " karma corrupted.", {
                style: { "background-color": "Orange" },
//                class: "showtip tipsy",
                title: Earthdawn.encode( Earthdawn.encode( "This dice roll was affected by a Horror Power that caused the karma to be spent, but not rolled." )) }));

                  // Standard. Tell what rolled, vague about how much missed by.
                  // Full: Tell exact roll result and how much made or missed by.
                  // Vague. Do not tell roll result, but tell how much made or missed by.
        if( "FunnyStuffDone" in this.misc ) {
          txt = "";
          function silentOrNot( test, text ) {
            if( state.Earthdawn.CursedLuckSilent && (state.Earthdawn.CursedLuckSilent & test))
              gmResult += (gmResult.length > 0 ? "   " : "") + text;
            else
              txt += (txt.length > 0 ? "   " : "") + text;
          }

          if( "CursedLuck" in this.misc )
            silentOrNot( 0x04, "<b>Cursed Luck:</b> " + this.misc[ "CursedLuck" ]);
          if( this.misc[ "FunnyStuffDone" ] & 0x02 )
            silentOrNot( 0x02, "<b>No-Pile-On-Dice:</b> " + state.Earthdawn.noPileonDice );
          if( this.misc[ "FunnyStuffDone" ] & 0x01 )
            silentOrNot( 0x01, "<b>No-Pile-On-Step:</b> " + state.Earthdawn.noPileonStep );

          if( txt.length > 0 ) {
            body.append( "", txt + ". Roll was " + this.BuildRoll( "showResult" in this.misc && this.misc[ "showResult" ], this.misc[ "DiceOrigional" ].total, this.misc[ "DiceOrigional" ] ),
                { style: { "background-color": "Orange" }});
            playerCardNix.push( body._children.length );
          }
          if(gmResult.length > 0 && (txt.length == 0 || !( "showResult" in this.misc && this.misc[ "showResult" ] )))
            gmResult += (gmResult.length > 0 ? ".   " : "") +  "<b>Orig Rslt was:</b> " + this.BuildRoll( true, this.misc[ "DiceOrigional" ].total, this.misc[ "DiceOrigional" ] );
        }

        txt = "";
        if( "showResult" in this.misc && this.misc[ "showResult" ] )
          txt += "<b>Result:</b> " + this.BuildRoll( true, this.misc[ "result" ], rolls );
        else if ( rolls )
          gmResult += "   <b>Result:</b> " + this.BuildRoll( true, this.misc[ "result" ], rolls );
        if( "failBy" in this.misc )
          txt += ((txt.length > 0) ? "   " : "" ) + "<span style='color: red;'>Failure</span>"
              + ((( "StyleOverride" in this.misc ? this.misc[ "StyleOverride" ] : state.Earthdawn.style) != Earthdawn.style.VagueSuccess )
              ? " by " + this.BuildRoll( this.misc[ "showResult" ], this.misc[ "failBy" ], rolls ) + "." : "!" );
        if( "succBy" in this.misc ) {
          let es = Earthdawn.parseInt2( "extraSucc" in this.misc ? this.misc[ "extraSucc" ] : 0 );
          txt += ((txt.length > 0) ? "   " : "" ) + "<span style='color: green;'>Success</span>"
                + ((( "StyleOverride" in this.misc ? this.misc[ "StyleOverride" ] : state.Earthdawn.style) != Earthdawn.style.VagueSuccess )
                ? " by " + this.BuildRoll( this.misc[ "showResult" ], this.misc[ "succBy" ], rolls ) : "!" )
                + (("sayTotalSuccess" in this.misc && this.misc[ "sayTotalSuccess" ] )
                ? new HtmlBuilder( "span", " (" + (es +1) + " TOTAL Success" + ((es != 0) ? "es)" : ")"), {
                  style: { "background": "lavender" },
//                  class: "showtip tipsy",   // removing this gives us black on white long tool tips rather than the white on black tooltips that have a display bug.
                  title: Earthdawn.encode( Earthdawn.encode( es + " extra success" + ((es != 1) ? "es!" : "!")
                    + (("grimCast" in this.misc) ? " One added assuming you are casting from your own Grimoire." : ""))) })
                : (( es > 0) ? new HtmlBuilder( "span", " (" + es + " EXTRA Success" + ((es != 1) ? "es)" : ")"), {
                  style: { "background": "lightgoldenrodyellow" },
//                  class: "showtip tipsy",
                  title: Earthdawn.encode( Earthdawn.encode((es +1) + " total success" + ((es != 0) ? "es!" : "!")
                    + (("grimCast" in this.misc) ? " One added assuming you are casting from your own Grimoire." : ""))) })
                  : "." ))
          if (this.misc[ "reason" ] === "Jumpup Test") {
            body.append( (( ++linenum % 2) ? ".odd" : ".even"), "No longer Knocked Down");
            this.MarkerSet( [ "rf", "knocked", "u" ] );
        } }
        if( "Willful" in this.misc )
          txt += " Note: Target is Willful";
        if( txt.length > 0 ) {
          body.append( (( ++linenum % 2) ? ".odd" : ".even"), txt);
          playerCardNix.push( body._children.length );
        }
        if( "RuleOfOnes" in this.misc ) {
          body.append( "", "Rule of Ones", { style: { "background-color": "DarkRed", "color": "white", "text-align":  "center" }});
          playerCardNix.push( body._children.length );
          delete this.misc[ "RuleOfOnes" ];   // Need to delete it, or will show up for other rolls in this group.
        }
        let TNall = (this.bFlags & Earthdawn.flags.VerboseRoll)
              || (( "StyleOverride" in this.misc ? this.misc[ "StyleOverride" ] : state.Earthdawn.style) === Earthdawn.style.Full);
        if( "secondaryResult" in this.misc ) {
          let es = Math.max(0, Math.floor(this.misc[ "secondaryResult" ] / 5 -1));
          txt = "<b>Cntr-Atk:</b>"
              + ( TNall ? " TN# " + this.misc[ "targetNum2" ] : "" )
              + ((this.misc[ "secondaryResult" ] < 0)
                  ? " <span style='color: red;'>Failed</span>  by "
                  : " <span style='color: green;'>Succeeded</span> by ")
              + Math.abs( this.misc[ "secondaryResult" ])
              + (("sayTotalSuccess" in this.misc && this.misc[ "sayTotalSuccess" ] )
              ? new HtmlBuilder( "span", " (" + (es +1) + " TOTAL Success" + ((es != 0) ? "es)" : ")") + "   (After subtracting success required to Riposte)", {
                style: { "background": "lavender" },
//                class: "showtip tipsy",   // removing this gives us black on white long tool tips rather than the white on black tooltips that have a display bug.
                title: Earthdawn.encode( Earthdawn.encode( es + " extra success" + ((es != 1) ? "es!" : "!"))) })
              : (( es > 0) ? new HtmlBuilder( "span", " (" + es + " EXTRA Success" + ((es != 1) ? "es)" : ")"), {
                  style: { "background": "lightgoldenrodyellow" },
//                  class: "showtip tipsy",
                  title: Earthdawn.encode( Earthdawn.encode((es +1) + " total success" + ((es != 0) ? "es!" : "!") + "   (After subtracting success required to Riposte)")) })
                : "." ))
          if( txt.length > 0 ) {
            body.append( (( ++linenum % 2) ? ".odd" : ".even"), txt);
            playerCardNix.push( body._children.length );
        } }
        if( "Spell" in this.misc ) {
          let splines = this.Spell( this.misc[ "Spell" ] );
          if( _.isArray( splines ))
            for( let i = 0; i < splines.length; ++i )
              body.append( (( ++linenum % 2) ? ".odd" : ".even"), splines[ i ] );
        }
        if( "StrainPerTurn" in this.misc )
          body.append( (( ++linenum % 2) ? ".odd" : ".even"), Earthdawn.texttip("Strain Per Turn: " + this.misc[ "StrainPerTurn" ],
              "On the Combat tab, it says to spend this much Strain every time initiative is rolled. This is probably from Blood Charms, Thread Items, Spells or some-such.") );

        if( ("succMsg" in this.misc) && (this.misc[ "succMsg" ].length > 1) && (( "succBy" in this.misc ) || !this.targetNum)) {
          body.append( (( ++linenum % 2) ? ".odd" : ".even"), this.misc[ "succMsg" ]);
          playerCardNix.push( body._children.length );
        }
        if( ("endNote" in this.misc) && (this.misc[ "endNote" ].length > 1)) {
          body.append( (( ++linenum % 2) ? ".odd" : ".even"), this.misc[ "endNote" ]);
          playerCardNix.push( body._children.length );
        }
        if( ("endNoteSucc" in this.misc) && (this.misc[ "endNoteFail" ].length > 1) && (( "succBy" in this.misc ) || !this.targetNum)) {
          body.append( (( ++linenum % 2) ? ".odd" : ".even"), this.misc[ "endNoteSucc" ]);
          playerCardNix.push( body._children.length );
        }
        if( ("endNoteFail" in this.misc) && (this.misc[ "endNoteFail" ].length > 1) && (( "failBy" in this.misc ) || !this.targetNum)) {
          body.append( (( ++linenum % 2) ? ".odd" : ".even"), this.misc[ "endNoteFail" ]);
          playerCardNix.push( body._children.length );
        }

        if(("cButtons" in this.misc) && this.misc[ "cButtons" ].length > 0) {
          var buttonLine = "";
          let tName;

          for( let i = 0; i < this.misc[ "cButtons" ].length; ++i ) {
            if( tName != this.misc[ "cButtons" ][ i ].name ) {      // If this button has a different target name than the last button, display it.
              tName = this.misc[ "cButtons" ][ i ].name;
              buttonLine += "   " + tName + " ";
            }
            buttonLine += new HtmlBuilder( "a", this.misc[ "cButtons" ][ i ].text, Object.assign({}, {
              href: Earthdawn.colonFix( this.misc[ "cButtons" ][ i ].link ),
              class: "sheet-rolltemplate-button"}, "tip" in this.misc[ "cButtons" ][ i ] ? {
//                class: "showtip tipsy",   // removing this gives us black on white long tool tips rather than the white on black tooltips that have a display bug.
                title: Earthdawn.encode( Earthdawn.encode( this.misc[ "cButtons" ][ i ].tip )),
              } : {}));
        } }
                  // Here we figure out what messages get sent where.
        if( whichMsgs === Earthdawn.whoTo.public ) {                        // public:    Main message to everybody. Maybe supplementary messages to player and/or gm.
//body.append( (( ++linenum % 2) ? ".odd" : ".even"), "<b>public</b> " );
          this.chat( sect.toString(), Earthdawn.whoTo.public | Earthdawn.whoFrom.player | Earthdawn.whoFrom.character );
          if( ("gmTN" in this.misc) || gmResult.length > 0 || (( "secondaryResult" in this.misc ) && !TNall)) {
            var bgmline = true;
            var sectgm = Earthdawn.newSect();
            var bodygm = Earthdawn.newBody( sectgm );
            if ( pIsGM && buttonLine )
              bodygm.append( (( ++linenum % 2) ? ".odd" : ".even"), buttonLine);
            if ("gmTN" in this.misc)
              bodygm.append( (( ++linenum % 2) ? ".odd" : ".even"), "<b>TN#</b> " + this.misc[ "gmTN" ] + gmResult );
            else if ( gmResult.length > 0 )
              bodygm.append( (( ++linenum % 2) ? ".odd" : ".even"), gmResult );
            if(( "secondaryResult" in this.misc ) && !TNall)
              bodygm.append( (( ++linenum % 2) ? ".odd" : ".even"), "<b>Cntr-Atk: TN#</b> " + this.misc[ "targetNum2" ] );
          }
          if ( bgmline || buttonLine )
            setTimeout(function() {
              try {
                if( buttonLine && (!pIsGM || !bgmline)) {
                  let sectplayer = Earthdawn.newSect();
                  let bodyplayer = Earthdawn.newBody( sectplayer );
                  bodyplayer.append( (( ++linenum % 2) ? ".odd" : ".even"), buttonLine);
                  po.chat( sectplayer.toString(), Earthdawn.whoTo.player | Earthdawn.whoFrom.player | Earthdawn.whoFrom.character | Earthdawn.whoFrom.noArchive );
                }
                if( bgmline )
                  po.chat( sectgm.toString(), Earthdawn.whoTo.gm | Earthdawn.whoFrom.player | Earthdawn.whoFrom.character );
              } catch(err) {
                po.edClass.errorLog( "ED.rollFormat setTimeout() error caught: " + err );
              }
            }, 500);
        } else if ( whichMsgs ===  Earthdawn.whoTo.gm ) {               // gm only
//body.append( (( ++linenum % 2) ? ".odd" : ".even"), "<b>gm only</b> " );
          if( buttonLine ) {
            body.append( (( ++linenum % 2) ? ".odd" : ".even"), buttonLine);
            playerCardNix.push( body._children.length );
          }
          if ("gmTN" in this.misc) {
            body.append( (( ++linenum % 2) ? ".odd" : ".even"), "<b>TN#</b> " + this.misc[ "gmTN" ] + gmResult );
            playerCardNix.push( body._children.length );
          } else if ( gmResult.length > 0 ) {
            body.append( (( ++linenum % 2) ? ".odd" : ".even"), gmResult );
            playerCardNix.push( body._children.length );
          }
          if(( "secondaryResult" in this.misc ) && !TNall) {
            body.append( (( ++linenum % 2) ? ".odd" : ".even"), "<b>Cntr-Atk: TN#</b> " + this.misc[ "targetNum2" ] );
            playerCardNix.push( body._children.length );
          }
          this.chat( sect, recipients | Earthdawn.whoFrom.player | Earthdawn.whoFrom.character );
          if( playerCard ) {
            while( playerCardNix.length > 0 )
              body._children.splice( playerCardNix.pop() -1, 1);
                          // Strip out the bit that tells it to roll some dice.
            this.chat(( "roll" in this.misc ) ? sect.toString().replace( " = " + this.misc[ "roll" ], "") : sect.toString(),
                Earthdawn.whoTo.player | Earthdawn.whoFrom.player | Earthdawn.whoFrom.character, " sent Roll to GM" );
          }
        } else if ( whichMsgs === (Earthdawn.whoTo.gm | Earthdawn.whoTo.player) ) {   // Player and GM, and we know that the player is not the gm.
          var popto = body._children.length;
//body.append( (( ++linenum % 2) ? ".odd" : ".even"), "<b>player of playergm</b> " );
          if( buttonLine )
            body.append( (( ++linenum % 2) ? ".odd" : ".even"), buttonLine);
          this.chat( sect.toString(), Earthdawn.whoTo.player | Earthdawn.whoFrom.player | Earthdawn.whoFrom.character );
          while (body._children.length > popto )      // Pop off the player only entries, and push on the gm only entries.
            body._children.pop();
//body.append( (( ++linenum % 2) ? ".odd" : ".even"), "<b>gm of playergm</b> " );
          if ("gmTN" in this.misc)
            body.append( (( ++linenum % 2) ? ".odd" : ".even"), "<b>TN#</b> " + this.misc[ "gmTN" ] + gmResult );
          else if ( gmResult.length > 0 )
            body.append( (( ++linenum % 2) ? ".odd" : ".even"), gmResult );
          if(( "secondaryResult" in this.misc ) && !TNall)
            body.append( (( ++linenum % 2) ? ".odd" : ".even"), "<b>Cntr-Atk: TN#</b> " + this.misc[ "targetNum2" ] );
          this.chat( sect.toString(), Earthdawn.whoTo.gm | Earthdawn.whoFrom.player | Earthdawn.whoFrom.character, " sent Roll to GM" );
        } else
          this.chat( "API Error! rollFormat() got whichMsgs of (" + whichMsgs + "). Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError );
      } catch(err) { this.edClass.errorLog( "ED.rollFormat() error caught: " + err ); }
    } // End ParseObj.rollFormat()



          // Build html to display a tool tip to show a roll result.
          // If howMuchDetail is true, then display all components of the roll. If false then only show 1's, maxes, and placeholders.
          // Main is what should appear in main span.
          // rolls is passed from dice roller and contains roll result.
          //
          // Note: I do something weird to handle very small step numbers, such as step 2 which has a roll like
          // {{1d4!-1}+d1}kh1    Which means roll 1d4 (exploding) then subtract one, then roll 1d1 (which will give a 1), and keep the highest of the two. ie: keep the higher of 1d4-1, or 1.
          // The {'s show up as type G Groups.
          // As long as the type is type V or G, I keep going deeper into it. When I find the first none V or G, I start processing the roll results.
          // This will result in processing the 1d4!-1 but not the rest, which is simpler and OK. This should work on all current rolls I expect to see right now,
          // but if somebody messes with the groupings on the dice in order to achieve some other effect, this might need to be rethought. See also CursedLuck which uses this same logic.
          // {"type":"V","rolls":[{"type":"G","rolls":[[{"type":"G","rolls":[[{"type":"R","dice":1,"sides":4,"mods":{"exploding":""},"results":[{"v":4},{"v":3}]},{"type":"M","expr":"-1"}]],"mods":{},"resultType":"sum","results":[{"v":6}]},{"type":"M","expr":"+"},{"type":"R","dice":1,"sides":1,"mods":{},"results":[{"v":1,"d":true}]}]],"mods":{"keep":{"end":"h","count":1}},"resultType":"sum","results":[{"v":6}]}],"resultType":"sum","total":6}
    this.BuildRoll = function( howMuchDetail, main, rolls ) {
      'use strict';
      try {
//        let tip1 = '<img src="/images/quantumrollwhite.png"> Rolling ',
        let tip1 = 'Rolling ',
          tip2 = " = ",
          f;
//log(rolls);
        let border = 0,   // zero = reddish for rule of 1's, 1 is normal yellowish, 2 is greenish for max dice rolls..
          dice = 0, ones = 0,
          group = rolls;
        while ( group[ "type" ] === "V" )
          group = group[ "rolls" ];
        while ( group[0][ "type" ] === "G" )
          group = group[0][ "rolls" ][0];

        for( let i = 0; i < group.length; ++i) {
          let r = group[ i ];
          switch ( r[ "type" ] ) {
            case "R":
              tip1 += ((( "dice" in r) && r[ "dice" ] > 1) ? r[ "dice" ] : "")
                + "d"
                + (( "sides" in r) ? r[ "sides" ] : "")
                + (( "mods" in r) ? (( "exploding" in r[ "mods" ]) ? "!" : "") : "");
              if( "results" in r ) {
                tip2 += "(";
                for( let j = 0; j < r[ "results" ].length; ++j )
                  if( "v" in r[ "results" ][ j ] ) {
                    ++dice;
                    let v = r[ "results" ][ j ][ "v" ];
                    if( v === r[ "sides" ] ) {
                      border = 2;
                            // Tool tips that don't go wonky don't support html inside of them.
//                    f = '<strong style=&quot;color: #90ee90;&quot;>' + v + "</strong>";   // Value is max. Greenish
                      f = v;
                    } else if( v == 1) {
                      f = v
//                    f = '<strong style=&quot;color: #f08080;&quot;>' + v + "</strong>";   // Value is 1. Reddish.
                      ++ones;
                    } else {
                      if( border === 0)
                        border = 1;
                      f = howMuchDetail ? v : "?";
                    }
                    tip2 += (( j === 0) ? "" : "+") + f;
                  }
                tip2 += ")";
              }
              break;
            case "M":
              tip1 += r[ "expr" ]
              tip2 += r[ "expr" ]
              break;
            default:
              this.edClass.errorLog( "Error in ED.BuildRoll(). Unknown type '" + r[ "type" ] + "' in rolls " + i + ". Complete roll is ..." );
              log( rolls );
          } // end switch of what roll20 returns for roll results.
        } // end for each roll20 results groups
        if( dice > 1 && dice === ones )
          this.misc[ "RuleOfOnes" ] = true;
        if( border === 2 )
          var bordColor = "2px solid #3FB315";  // Greenish
        else if( border === 0 && dice > 1)
          bordColor = "2px solid #B31515";    // Reddish
        else
          bordColor = "2px solid #FEF68E";    // Normal Yellowish.
        return new HtmlBuilder( "span", main.toString(), {
                style: { "background-color": "#FEF68E",
                    "border"    : bordColor,
                    "padding"   : "0 3px 0 3px",
                    "font-weight" : "bold",
                    "cursor"    : "help",
                    "font-size"   : "1.1em" },
//                class: "showtip tipsy",       // removing this gives us black on white long tool tips rather than the white on black tooltips that have a display bug.
                title: Earthdawn.encode( Earthdawn.encode( tip1 + tip2 )) });
      } catch(err) { this.edClass.errorLog( "ED.BuildRoll() error caught: " + err ); }
    } // End ParseObj.BuildRoll()



              // ParseObj.SetStatusToToken ()
              // Set the Token Status markers to match the Character sheet. Mostly just done when a new token is dropped on the VTT.
    this.SetStatusToToken = function()  {
      'use strict';
      try {
        if( this.tokenInfo === undefined || this.tokenInfo.tokenObj === undefined ) {
          this.chat( "Error! tokenInfo undefined in SetStatusToToken() command.", Earthdawn.whoFrom.apiError);
          return;
        }
        let markers = "",
          po = this;

        _.each( Earthdawn.StatusMarkerCollection, function( item ) {
          let attName = item[ "attrib" ];
          if( attName === undefined )
              return;
          let attValue = Earthdawn.getAttrBN( po.charID, attName, 0 );
          if( "shared" in item ) {
            let shared = item[ "shared" ];
            if( shared.toLowerCase().startsWith( "pos" )) {
              if( Earthdawn.parseInt2( attValue ) > 0 )
                markers += "," + Earthdawn.getIcon( item ) + "@" + Earthdawn.parseInt2( attValue );
            } else if( shared.toLowerCase().startsWith( "neg" )) {
              if( Earthdawn.parseInt2( attValue ) < 0 )
                markers += "," + Earthdawn.getIcon( item ) + "@" + Math.abs( Earthdawn.parseInt2( attValue ));
            } else if( attValue == shared )     // This is an OnValue.
              markers +=  "," + Earthdawn.getIcon( item );
          } // if there is a shared, and none of the above is true, then this marker is definitely unset.
          else if( !("submenu" in item )) {
            if( attValue == "1" )     // If there is no submenu, than anything equal to 1 is set.
              markers += "," + Earthdawn.getIcon( item );
          } else      // There is no shared, and there is a submenu. Just set the badge to the value.
            if( Earthdawn.parseInt2( attValue ) > 0 )
              markers += "," + Earthdawn.getIcon( item ) + "@" + attValue;
        });
        Earthdawn.set( this.tokenInfo.tokenObj, "statusmarkers", markers.slice(1));
      } catch(err) { this.edClass.errorLog( "ED.SetStatusToToken() error caught: " + err ); }
    } // End ParseObj.SetStatusToToken()




              // ParseObj.SetToken ()
              // We have been passed a tokenID to act upon.   Set TokinInfo and CharID.
              //  ssa[1]   Token ID
    this.SetToken = function( ssa )  {
      'use strict';
      try {
        if( ssa.length > 1 ) {
          let TokObj = getObj("graphic", ssa[ 1 ]);
          if (typeof TokObj != 'undefined' ) {
            this.charID = TokObj.get("represents");
            let CharObj = getObj("character", this.charID) || "";
            if (typeof CharObj != 'undefined') {
              let TokenName = TokObj.get("name");
              if( TokenName.length < 1 )
                TokenName = CharObj.get("name");
              this.tokenInfo = { type: "token", name: TokenName, tokenObj: TokObj, characterObj: CharObj };
            } // End CharObj defined
          } // end TokenObj undefined
        }
      } catch(err) { this.edClass.errorLog( "ED.SetToken() error caught: " + err ); }
    } // End ParseObj.SetToken()




          // setWW    (note that there is also an EARTHDAWN.setWW that accepts cID)
          // helper routine that sets a value into an attribute and nothing else.
          // is part of parseObj so that have access to parseObj.char.ID
    this.setWW = function( attName, val, dflt ) {
      'use strict';
      try {
        Earthdawn.setWW( attName, val, this.charID, dflt );
      } catch(err) { this.edClass.errorLog( "ParseObj.SetWW() error caught: " + err ); }
    } // End ParseObj.SetWW()


          // ParseObj.ssaMods ( ssa )
          //
          // ssa is an array of zero or more numbers. Sum them and return the result.
          // start is where to start processing the array if other than ssa[1]
          // fSpecial: if 1, then numbers are not additive. If a non-zero number does not explicitly start with plus or minus sign, it replaces all previous numbers instead of modifying them.
          // cID is an optional character ID, otherwise defaults to this.charID
          //
          // Note that you CAN pass this variable names so long as those variables contain simple numbers, but not character sheet auto-calculated fields.
    this.ssaMods = function( ssa, start, fSpecial, cID )  {
      'use strict';
      let ret = 0,
        j;
      try {
        if( start === undefined )
          start = 1;
        for( let i = start; i < ssa.length; i++ ) {
          j = this.getValue( ssa[ i ], cID, fSpecial);
          if( fSpecial != 1 )
            ret += j;
          else {
            let k = Earthdawn.parseInt2( j );
            if( i === start || j === "0" || j.startsWith( "-" ) || j.startsWith( "+" ))
              ret += k;
            else
              ret = k;
        } }
      } catch(err) { this.edClass.errorLog( "ParseObj.ssaMods() error caught: " + err ); }
      return ret;
    } // End ParseObj.ssaMods



        // Spell-casting Token action.
        //
        // Earthdawn.abilityAdd( this.charID, Earthdawn.constant( "Spell" ) + t,
        //  "!edToken~ %{selected|" + preTo + "Roll}" );
        //    ssa: (0) Spell (1) RowId (2) what {options} (n-1) G/M
        //    what: Info : Ouputs spell information
        //      Sequence: displays the spell sequence menu
        //      New: Extra Threads Menu (called from the sequence menu)
        //      Extra: Adds Extra Thread (only called via the new command)
        //      Weave: T_RowID - Makes a Weaving test (called from the sequence menu, or offered after chosing extra thread)
        //      Cast: T_RowID -MAkes a Spallcatsing test (called from the sequence menu or offered after weaving the last thread)
        //      Effect: T_RowID - Makes an Effect test (called from the sequence menu or offered after a successful test)
        //      Reset: Resets the whole sequence (offered from the sequence menu or after failing a spellcasting, or making an effect test)
        //
        //      TuneGrimoire/TuneGrimoire2: Attunes the Grimoire (appears on the Sequence menu when it is a starting sequence from SP)
        //      TuneOnFly: Triggers a Weaving test. (offered if starting a new Grimoire cast) If successful will offer to chose the Matrix, if failed offer to wipe Matrix
        //      WipeMatris: Wipes All Matrix (Only offered after a failed TneOnFly)
        //      Reset: Clear the current casting  section.
        //      WarpTest: Makes a Warping Test. Only appears after a spellcasting test detected as raw
        //      HorrorMark: Makes a Horror Mark test. See WarpTest
        //
        //    seq: (0) Cast, (1) G/M (Will be GA if casting from a Grimoire successfuly attuned and GR if casting Raw), (2) (spell or matrix row id), (3) Sequence, (4) Number threads pulled (including already in matrix), (5) Effect bonus from spellcasting (6+) extra threads.
        //    (3) Sequence = 0 new, 1 pulling threads, 2 pulled all threads, 3 spellcasting failed, 4 spellcasting succeeded, 5 an effect has been rolled.
    this.Spell = function( ssa ) {
      'use strict';
      try {
//log("this.Spell " + JSON.stringify(ssa));
            //Information coming directly from the Spell passed in the SSA
        let bGrim = ssa[ ssa.length - 1 ].toLowerCase().startsWith( "g" ),          // false = Matrix(SPM). true = Spell (SP).
          pre = Earthdawn.buildPre( bGrim ? "SP" : "SPM", ssa[ 1 ] ),               // The prefix for the spell, SPM or SP depending where the call was made from
          presp = (bGrim ? pre : Earthdawn.buildPre( "SP", Earthdawn.getAttrBN( this.charID, pre + "spRowID" ))),     //The prefix for the SP, even if call was done from SPM
          inMatrix = Earthdawn.getAttrBN( this.charID, presp + "spmRowID", "0" );            // If the spell is in a matrix this is (at least one of) the rowID of the matrix it is in (or zero).
        if( bGrim && inMatrix != "0" ) {    // They pressed a grimoire button, but this spell is in a matrix, so just pretend they pressed the matrix button.
          bGrim = false;
          ssa[ ssa.length - 1 ] = "M";
          ssa[ 1 ] = inMatrix;
          pre = Earthdawn.buildPre( "SPM", inMatrix );
        }
        let sthrd = Earthdawn.getAttrBN( this.charID, presp + "sThreads", "0", true ),                   //Spell Base Thread Number
          thrd = Earthdawn.getAttrBN( this.charID, pre + (bGrim ? "sThreads" : "Threads"), "", true ),  //Starting Threads, ignores any extra thread
          nowil = (Earthdawn.getAttrBN( this.charID, presp + "WilSelect","") !== "Wil" ),     //Spell has no Will Effect.
          po = this;

                //Reading the sequence values, and initializing
        let seq = this.TokenGet( "SustainedSequence", true );
        let aseq=[];
// log("this.Spell sequence is " + JSON.stringify(seq));
// log("this.Spell ssa is " + JSON.stringify(ssa));

                //Sequence & Spell Dependant variables. This is split out in all details to be easier to understand case by case
        let step = 0,               // current step of the sequence
          other = false,            // Is the current sequence from another spell than the one from the last this.Spell call
          bGrimAtt = false,         // For grimoire/raw casting, has the Grimoire been attuned
          nothread = (thrd == 0),   // We initalize the need or not to weave thread based on the spell/matrix combination. This may evolve depending on the sequence
          nxtextra, nxtwv, nxtcst, nxtfx,     //Those correspond to the predetermination of what are the next steps for the sequence
          noseqactive = (!seq || !seq.startsWith( "Cast" )),
          seqended,                 // Respectively is there an active sequence, and if there is, is it still active (i.e. didn't reach its normal end, like spellcasting failure)
          seqcontinue = false,      // This indicates an active sequence, that is not finished, and not from another spell, so this is actually the "Normal" case where we are in sequence
          remthrds = thrd;          // Actual number of remainng threads. Initialized by the SP or SPM


                //Analysis of where we are in the sequence
        if( noseqactive ) {     // The sequence has been called from a clean start
          seqended = false;
          nxtextra = true;      // New Sequence so we are still on time to chose extra Threads
          nxtwv = (thrd > 0);   // We only recommend weaving on a newly started sequence if there threads to weave
          nxtcst = (thrd == 0); // We only recommend casting on a newly started sequence if there are no Threads
          nxtfx = false;        // You can't start a new sequence by the Effect
        } else {      // We know that we are in a sequence we have to determine
          aseq = seq.split( "," );
          step = Earthdawn.parseInt2( aseq[ 3 ]);
          seqended = ( step == 3 || step == 5);     //Even if there is a sequence, it is actually ended
          other = (aseq[ 2 ] !== ssa[ 1 ]) && !seqended;  //This indicates that we were called on a different spell, that didn't finished its sequence
          if( seqended || other ) { // We are actually restarting a new sequence. We could potentially send warning if other is true, but still, we would treat as a new sequence
            nxtextra = true;        // New Sequence so we are still on time to chose extra Threads
            nxtwv = (thrd > 0);     // We only recommend weaving on a newly started sequence if there threads to weave
            nxtcst = (thrd == 0);   // We only recommend casting on a newly started sequence if there are no Threads
            nxtfx = false;          // You can't start a new sequence by the Effect
          } else {    // We finally reached the stage where we know we are continuing the sequence
            bGrimAtt = aseq[ 1 ].toLowerCase().endsWith( "a" );   //If a Grimoire is attuned we stored GA
            seqcontinue = true;
            remthrds = sthrd + (aseq.length - 6) - Earthdawn.parseInt2( aseq[ 4 ])    // We need to start from sthrd because any thread in the Matrix is already included in aseq
            nxtextra =(step == 0);    // We can only weave at the beginning of the sequence
            nxtwv = ((step == 0 && remthrds > 0) || step == 1 );    // We begin weaving after chosing extra spells, or if we are in the middle of weaving and didn't pull them all
            nxtcst = (step == 2 ||(step <= 1 && remthrds <= 0));    // We only recommend casting on a newly started sequence if there are no Threads
            nxtfx = (step == 4);      // FX recommended if spellcasting was successful
          }
        } // end else in sequence.

        function initSpell() {    //Function to init a spell sequence
// log('this.Spell : initspell');
          let mthrd = 0;
          if( !bGrim ) {
            let type = Earthdawn.getAttrBN( po.charID, pre + "Type", "0", true );
            mthrd = (type > 0 ? "1" : "0");     //Enhanced and Armored Matrix
          }
          let enh = bGrim ? "" : ("," + Earthdawn.getAttrBN( po.charID, pre + "EnhThread", ""));
          if( enh == "x" || enh == "," || enh == ",x" )
            enh="";    // This are the Extra Thread held in Matrix
          seq = "Cast," + (bGrim ? "G," : "M,") + ssa[ 1 ] + ",0," + mthrd + ",0" + enh;

                // let thrd=Earthdawn.getAttrBN( po.charID, pre + (bGrim ? "sThreads" : "Threads"),""); //Starting Threads
          let totthrd = Earthdawn.parseInt2( thrd ) + Earthdawn.parseInt2( mthrd );
          aseq = seq.split( "," );
          po.TokenSet( "clear", "SustainedSequence", seq );
// log("seq reinitialized with " + seq);
                //When sequence is initialized, data is copied to the SS- values for display in the current casting area
          po.setWW( "SS-Name", Earthdawn.getAttrBN( po.charID, pre + (bGrim ? "Name" : "Contains"), ""));
          po.setWW( "SS-CurThreads", mthrd + "/" + totthrd );
          po.setWW( "SS-WilSelect", Earthdawn.getAttrBN( po.charID, presp + "WilSelect", "None" ));
          po.setWW( "SS-WilEffect", Earthdawn.getAttrBN( po.charID, presp + "WilEffect", "" ));
          po.setWW( "SS-Effect",    Earthdawn.getAttrBN( po.charID, presp + "Effect", ""));
          po.setWW( "SS-Notes",     Earthdawn.getAttrBN( po.charID, presp + "Notes", ""));
          po.setWW( "SS-Range",     Earthdawn.getAttrBN( po.charID, presp + "Range", ""));
          po.setWW( "SS-Duration",  Earthdawn.getAttrBN( po.charID, presp + "Duration", ""));
          po.setWW( "SS-EnhThread", Earthdawn.getAttrBN( po.charID, pre   + "EnhThread", ""));
          po.setWW( "SS-Numbers",   Earthdawn.getAttrBN( po.charID, pre   + "Numbers", ""));
          po.setWW( "SS-Active", ssa[1] );              //SS-Active stores the info about the SP_RowID/SPM_Row ID
          po.setWW( "SS-Type", ssa[ ssa.length -1 ] );  //SS-Type stores info M/G/GA/GR
          po.setWW( "SS-SeqStep", "0" );                //SS-SeqStep stores the current step of spellcasting
        }; //end InitSpell

        function SaveSeq() {    //Function to save the spell Sequence in the Token and Character Sheet
          po.setWW( "SS-Type", aseq[ 1 ] );       //SS-Type stores info M/G/GA/GR
          po.setWW( "SS-SeqStep", aseq[ 3 ] );    //SS-SeqStep stores the current step of spellcasting
          po.TokenSet( "clear", "SustainedSequence", aseq.toString() );
        }; //End SaveSeq

              //Initializes the sect for the future display if needed
        let sect = new HtmlBuilder( "", "", {
          style: {
            "background-color": "white",
            "border": "solid 1px black",
            "border-radius": "5px",
            "overflow": "hidden",
            "width": "100%",
        }});
        sect.append( "", Earthdawn.getAttrBN( this.charID, presp +  "Name", ""), { style: {
          "background-color": "purple",
          "color": "white",
          "font-weight": "bold",
          "text-align": "center",
          "font-family": "Papyrus, fantasy",
          "font-size":      "120%",
          "line-height":  "130%",
        }});
        let linenum = 0,
        body = sect.append( ".body", "", {
          style: {
            "text-align":   "center",
            "padding" : "3px"
          }});
        body.setCss({
          odd:  { "background": "#FFFFFF" },
          even: { "background": "#E9E9E9" }
        });


        function line( txt, tip) {
          body.append( (( ++linenum % 2) ? ".odd" : ".even"), (!tip ||tip=="")? txt: Earthdawn.texttip( txt, tip ));
        }

              //Initialization of the buttons that will be used in several of the places
        let rid, txtwv = "", txtcst = "", txtfx = "", txtwv2 = "", txtcst2 = "", txtfx2 = "", txtpatt = "", txtonfly = "";    //This are the buttons for each of the main stuff
        let tmp = Earthdawn.getAttrBN( this.charID, presp + "Discipline", "0"),

        disp = Earthdawn.dispToName( tmp, false );    // Name of discipline, not short
        let target = Earthdawn.getAttrBN( this.charID, presp + "Casting", "0"),
          wilselect = Earthdawn.getAttrBN( this.charID, presp + "WilSelect", "None");
        if (target.startsWith( "MD1" ) && seq.includes( "Target" )) target = "MDh";     // If we had an Extra Thread that adds Targets, change MD1 to MDh
        let attributes = findObjs({ _type: "attribute", _characterid: this.charID });
        _.each( attributes, function (att) {
          if (att.get( "name" ).endsWith( "_T_Special" ) && att.get( "current" ).startsWith( "SPL-" )) {      // If any of the SPL- Talents.
            rid = Earthdawn.getAttrBN( po.charID, Earthdawn.buildPre( att.get("name") ) + "RowID", "");
            let pre2 = Earthdawn.buildPre( "T" ,rid);
            let charname = getAttrByName( po.charID, "charName" );
            let kask = "modValue : ?{Modification|0} ~ K-ask: @{"+charname +"|KarmaGlobalMode}@{"+charname +"|"+  pre2 + "Karma-Ask}: @{"+charname +"|DPGlobalMode}@{"+charname +"|" + pre2 + "DP-Ask}~";
            let strain = Earthdawn.parseInt2(Earthdawn.getAttrBN( po.charID, pre2 + "Strain", "")),
            straintxt = (strain >= 0) ? "Strain :" +strain+" ~":"";

            if(att.get( "current" ).endsWith( disp )) {       // Thread Weaving.
              txtwv += Earthdawn.makeButton( Earthdawn.getAttrBN( po.charID, pre2 + "Name", ""),
                    "!Earthdawn~ charID: " + po.charID + "~ ForEach: inmt~ " +straintxt+ kask + " Spell: " + ssa[ 1 ] + " : Weave : "+ rid + " : "+ssa[ ssa.length -1 ] ,
                    "Weave using this Talent." ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg);
              txtwv2 += Earthdawn.makeButton( Earthdawn.getAttrBN( po.charID, pre2 + "Name", ""),
                    "!Earthdawn~ charID: " + po.charID + "~ ForEach: inmt~ " + straintxt + kask + " Spell: " + ssa[ 1 ] + " : Weave : "+ rid + " : "+ssa[ ssa.length -1 ] ,
                    "Weave using this Talent. NOTE : This is not the recommended next step of the Sequence" ,Earthdawn.Colors.param2,Earthdawn.Colors.param2fg);
              if(Earthdawn.getAttrBN( po.charID, pre2 + "Strain", "") == "0")
                txtonfly += Earthdawn.makeButton( "Attune on the Fly",
                    "!Earthdawn~ charID: " + po.charID + "~ ForEach: inmt~ Strain: 1~ "+ kask + " Spell: " + ssa[ 1 ] + " : TuneOnFly: " + rid + " : " + ssa[ ssa.length -1 ] ,
                    "Attune Matrix on the Fly using " + Earthdawn.getAttrBN( po.charID, pre2 + "Name","") ,Earthdawn.Colors.param2,Earthdawn.Colors.param2fg);
            }
            else if( att.get( "current" ).endsWith( "Spellcasting" )) {     // Spellcasting
              txtcst += Earthdawn.makeButton( Earthdawn.getAttrBN( po.charID, pre2 + "Name", ""),
                    "!Earthdawn~ charID: " + po.charID +"~Target:" +target+ "~ ForEach: inmt~ " +straintxt+ kask + "Spell: " + ssa[ 1 ] + ": Cast : " + rid + " : " + ssa[ ssa.length -1 ] ,
                    "Cast using this Talent. " ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg);
              txtcst2 += Earthdawn.makeButton( Earthdawn.getAttrBN( po.charID, pre2 + "Name", ""),
                    "!Earthdawn~ charID: " + po.charID +"~Target:" +target+ "~ ForEach: inmt~ " +straintxt+ kask + "Spell: " + ssa[ 1 ] + ": Cast : " + rid + " : " + ssa[ ssa.length -1 ] ,
                    "Cast using this Talent. NOTE : This is not the recommended next step of the Sequence" ,Earthdawn.Colors.param2,Earthdawn.Colors.param2fg);
              if( wilselect == "Rank" ) {     //Button for Effect for Rank based spells
                txtfx += Earthdawn.makeButton( Earthdawn.getAttrBN( po.charID, pre2 + "Name", "") + " Rk",
                      "!Earthdawn~ charID: " + po.charID + "~ ForEach: inmt~ Spell: " + ssa[ 1 ] + ": Effect : " + rid + ": " + ssa[ ssa.length -1 ] ,
                      "Effect Test based on this Talent Rk." ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg);
                txtfx2 += Earthdawn.makeButton( Earthdawn.getAttrBN( po.charID, pre2 + "Name", "") + " Rk",
                      "!Earthdawn~ charID: " + po.charID + "~ ForEach: inmt~ Spell: " + ssa[ 1 ] + ": Effect : "+ rid + ": " + ssa[ ssa.length -1 ] ,
                      "Effect Test based on this Talent Rk. NOTE : This is not the recommended next step of the Sequence" ,Earthdawn.Colors.param2,Earthdawn.Colors.param2fg);
            } }
            else if(( wilselect == "Wil" ) && att.get( "current" ).endsWith( "Willforce" )) {       // Wil and Willforce
              txtfx += Earthdawn.makeButton( Earthdawn.getAttrBN( po.charID, pre2 + "Name", ""),
                    "!Earthdawn~ charID: " + po.charID + "~ ForEach: inmt~ " + straintxt + kask + "Spell: " + ssa[ 1 ] + ": Effect : " + rid + ": " + ssa[ ssa.length -1 ] ,
                    "Effect Test using this Talent, or directly with WIL." ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg);
              txtfx2 += Earthdawn.makeButton( Earthdawn.getAttrBN( po.charID, pre2 + "Name", ""),
                    "!Earthdawn~ charID: " + po.charID + "~ ForEach: inmt~ " +straintxt+ kask + "Spell: " + ssa[ 1 ] + ": Effect : "+ rid + ": " + ssa[ ssa.length -1 ] ,
                    "Effect Test using this Talent, or directly with WIL. NOTE : This is not the recommended next step of the Sequence" ,Earthdawn.Colors.param2,Earthdawn.Colors.param2fg);
            }
            else if(att.get( "current" ).endsWith( "Patterncraft" )) {        // Patterncraft
              txtpatt += Earthdawn.makeButton( "Attune Grimoire",
                    "!Earthdawn~ charID: " + po.charID + "~ ForEach: inmt~ " +kask + "Spell: " + ssa[1] + " : TuneGrimoire : "+ rid + " : "+ssa[ ssa.length-1 ] ,
                    "Attune Grimoire using the Patterncraft Talent." ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg);
            }
          } // end T_Special SPL-
          if( wilselect == "Circle" && att.get( "name" ).endsWith( "_DSP_Code" ) && ( disp == Earthdawn.dispToName( att.get( "current" ), false ))) {   //Effect based on Circle
            rid = Earthdawn.getAttrBN( po.charID, Earthdawn.buildPre( att.get("name") ) + "RowID", "");
            txtfx += Earthdawn.makeButton( Earthdawn.dispToName( att.get( "current" ), false ) + " Circle",
                    "!Earthdawn~ charID: " + po.charID + "~ ForEach: inmt~ Spell: " + ssa[ 1 ] + ": Effect : " + rid + ": " + ssa[ ssa.length -1 ] ,
                    "Effect Test based on this Discipline Circle." ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg);
            txtfx2 += Earthdawn.makeButton( Earthdawn.dispToName( att.get( "current" ), true ) + " Circle",
                    "!Earthdawn~ charID: " + po.charID + "~ ForEach: inmt~ Spell: " + ssa[ 1 ] + ": Effect : "+ rid + ": " + ssa[ ssa.length -1 ] ,
                    "Effect Test based on this Discipline Circle. NOTE : This is not the recommended next step of the Sequence" ,Earthdawn.Colors.param2,Earthdawn.Colors.param2fg);
          }
        }); // End for each attribute.

        let txtextra = Earthdawn.makeButton( "Extra Threads", "!Earthdawn~ charID: " + this.charID + "~ ForEach: inmt~ Spell: " + ssa[ 1 ] + " : New : " + ssa[ ssa.length -1 ] ,
              "Press this button to start a new casting and chose extra threads." ,(nxtextra ?Earthdawn.Colors.param:Earthdawn.Colors.param2),(nxtextra ?Earthdawn.Colors.paramfg:Earthdawn.Colors.param2fg));
        let txtreset = Earthdawn.makeButton( "Reset", "!Earthdawn~ charID: " + this.charID + "~ ForEach: inmt~ Spell: " + ssa[ 1 ] + ": Reset: " + ssa[ ssa.length -1 ],
              "Press this button to Reset the Spell Sequence." ,Earthdawn.Colors.param2,Earthdawn.Colors.param2fg);
        let txtinfo = Earthdawn.makeButton( "Info", "!Earthdawn~ charID: " + this.charID + "~ ForEach: inmt~ Spell: " + ssa[ 1 ] + ": Info: " +ssa[ ssa.length-1 ],
              "Press this button to get the details of the spell." ,Earthdawn.Colors.param2,Earthdawn.Colors.param2fg);
        let txttunematrix = Earthdawn.makeButton( "Attune Matrix", "!Earthdawn~ %{"+getAttrByName( this.charID, "charName" ) +"|" + pre +"AttuneButton}" ,
              "Press this button to ReAttune this spell in a Matrix (using the 10 minute ritual)." ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg);
        let txtwipe = Earthdawn.makeButton( "Wipe All Matrix", "!Earthdawn~ charID: " + this.charID + "~ ForEach: inmt~ Spell: " + ssa[ 1 ] + ": WipeMatrix: " + ssa[ ssa.length- 1 ],
              "When re-attuning on the fly, Spellcaster must remain concentrated (Wil/Willforce chack against any damage), and continue until success, or all his matrix are wiped." ,Earthdawn.Colors.param2,Earthdawn.Colors.param2fg);
        let txtwarp = Earthdawn.makeButton( "Warp Test", "!Earthdawn~ charID: " + this.charID + "~ ForEach: inmt~ Spell: " + ssa[ 1 ] + ": WarpTest: ?{ What is the region type? |Safe|Open|Tainted|Corrupt} :" + ssa[ ssa.length -1 ],
              "When Casting Raw Magic, the Astral Space can damage you. Make this test according to the Region Type. Test Against MD to know if character suffers Damage" ,Earthdawn.Colors.param2,Earthdawn.Colors.param2fg);
        let txtmark = Earthdawn.makeButton( "Horror Mark", "!Earthdawn~ charID: " + this.charID + "~  ForEach: inmt~ Spell: " + ssa[ 1 ] + ": HorrorMark: ?{ What is the region type? |Safe|Open|Tainted|Corrupt}:" +ssa[ ssa.length -1 ],
              "When Casting Raw Magic, The unmasked magic might attract unwanted attention from astral entities. Test Against MD to see if character was Horror Marked." ,Earthdawn.Colors.param2,Earthdawn.Colors.param2fg);

        if( txtwv == "")    { txtwv = "Weaving Talent missing!";        txtwv2 = "Weaving Talent missing!" }
        if( txtcst == "")   { txtcst = "Spellcasting Talent missing!";  txtcst2 = "Spellcasting Talent missing!"; }
        if( txtfx == "")    switch( wilselect ) {
          case "Circle" : txtfx = txtfx2 = "No Corresponding Discipline!"; break;
          case "Wil"    : txtfx = txtfx2 = "Effect Talent Missing! There needs to be a Special Dummy Talent named 'WIL' for the Effect to work correctly. Go into Spellcasting Talents edit mode and press the button to create 'WIL'."; break;
          case "Rank"   : txtfx = txtfx2 = "Spellcasting Talent Missing!"; break;
          default :       txtfx = "None";  txtfx2 = "None " + txtreset;  }
        if( txtpatt == "")  txtpatt="Patterncraft Talent missing!"



        switch( ssa[ 2 ] ) {
          case "Sequence": {    //This is the master sequence... Where the magic happens
                //Header Logics when Grimoire/Raw
            if( bGrim ) {
              if( bGrimAtt )            // A Grimoire is attuned, this is definitely Grimoire Casting
                line("Grimoire Casting, Grimoire Attuned" ," you successfully Attuned to a Grimoire and are casting from the Grimoire. This will grant you one extra success");
              else if( nxtextra ) {     // We are at the beginning of the Grimoire/Raw, and we didn't
                line("Sequence started from the Grimoire. Attune Grimoire, Attune Matrix, or directly start for Raw Magic: "," You are currently casting a spell that you selected in your spellbook, so you have either to Attune to your Grimoire to cast it from your Grimoire (takes 10 min), to Attune your matrix (takes 10 min), or to Attune on the fly (takes 1 round, 1 strain, and you risk wiping all your Matrix). If yo select none of these options, this will be supposed to be raw casting, with risks of attracting Horror attention");
                line(txtpatt +txttunematrix + txtonfly,"");
              } else      // Grimoire Casting, with no Grimoire Attuned and sequence is started: This is Raw magic
                line("<b> Raw Magic ! </b>" ," You started to cast a spell not from Matrix and without attuning the Grimoire... Proceed at your own risks. Side Effects include Warping, Horror Marks, and potentially Death... or worse...");
            }

                //Sequence header
            if(noseqactive || seqended) {     //This is a clean start either after a reset, or after ending correctly a sequence
              line("Ready to Start New Sequence:","");
              line(thrd + " threads needed ","");
            } else if( other ) {     //Another Sequence is in progress, but for now we didn't take any action to abort it, this may still be a mistake... But any further action will re-initiate the sequence
              let bGrim2 = aseq[ 1 ].toLowerCase().startsWith( "g" );
              let pre3 = Earthdawn.buildPre( bGrim2 ? "SP" : "SPM", aseq[ 2 ] );
              line( "There is already another Sequence Active for spell : <b>" + Earthdawn.getAttrBN( this.charID, pre3 + (bGrim2 ? "Name" : "Contains"), "0") +"</b>","");
              line( Earthdawn.makeButton( "Resume",
                    "!Earthdawn~ charID: " + this.charID + "~ ForEach: inmt~  Spell: " + aseq[2] + " : Sequence" ,
                    "Return to the Previous Spellcasting Sequence." ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg),"");
              line( "Cancel previous sequence and start <b>" + Earthdawn.getAttrBN( this.charID, pre + (bGrim ? "Name" : "Contains"), "0") +"</b>","");
            } else {
              switch(step) {
                case 0 : line( "New Sequence : " +remthrds + " threads to be woven. Chose Extra Threads or Start", "Threads needed are " + sthrd +  " base & " + (aseq.length-6) + " extra. Matrix holds " + aseq[4]); break;
                case 1 : line( "Weaving Threads," + aseq[4] + " threads woven out of " + (sthrd+(aseq.length-6)) +" ,Weave", sthrd +  " base & " + (aseq.length-6) + " extra ",""); break;
                case 2 : line( "All Threads Woven, Cast",""); break;
                case 3 : line( "Spellcasting Failed, Reset","You can hit reset, but can also proceed with the sequence if it was a mistake.You can also just restart the sequence from any step."); break;
                case 4 : line( "Spellcasting Successful, Effect","Proceed with the Effect"); break;
                case 5 : line( "Effect Rolled, Reset","You can hit reset, but can also proceed with rerolling the Effect if multi-round. You can also just restart the sequence from any step."); break;
            } }
                  //Header : Info & Reset
            line( txtinfo+txtreset, "" );
                  //Body Main Action buttons
            line( txtextra, "");
            line("<b> Weave : </b>" + (nxtwv ? txtwv : txtwv2), "");
            line("<b> Cast : </b>" + (nxtcst ? txtcst : txtcst2), "");
            line("<b> Effect : </b>" + (nxtfx ? txtfx : txtfx2), "");
            this.chat( sect.toString(), Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive | Earthdawn.whoFrom.character );
          } break; //End Sequence
          case "InfoPub":
          case "Info": {
            let infoPub = (ssa[ 2 ] === "InfoPub");
            let castdiff = Earthdawn.getAttrBN( this.charID, presp + "Casting", "MD1");
            if( castdiff && castdiff.toString().indexOf( ":" ) > -1)
              castdiff = castdiff.split( ":" )[ 0 ];
            let mattype = "Std ";
            if( !bGrim ) {
              switch( Earthdawn.getAttrBN( this.charID, pre + "Type", "-10") ) {
                case  "15":   mattype = "Enhanced";break;
                case  "25":   mattype = "Armored";  break;
                case  "-20":  mattype = "Shared";   break;
              }
              line( "<b>Matrix:</b> Rank " + Earthdawn.getAttrBN( this.charID, pre + "Rank", "0") + " - " + mattype + " - "
                    + Earthdawn.getAttrBN( this.charID, pre + "Origin", "Free"), "Rank of matrix, it's Type and Origin.");
            }
            line( "<b>Min Threads:</b> " + Earthdawn.getAttrBN( this.charID, presp + "sThreads", "0"),
                  "Number of spell threads that must be woven in order to cast the base version of the spell.");
            line( "<b>Weave Diff:</b> " + Earthdawn.getAttrBN( this.charID, presp + "Numbers", ""),
                  "Weaving difficulty / Reattunment difficulty / Dispelling difficulty / Sensing difficulty.");
            line( "<b>Range:</b> " + Earthdawn.getAttrBN( this.charID, presp + "Range", "") + "      <b>Cast Diff:</b> " + castdiff,
                  "Range spell can be cast.   <br/>Cast Difficulty, if coded is the appropriate Defense, if third character is 'h' then it is the highest among all targets. If 'p1p' is present it stands for 'plus one per additional target'.");
            if( Earthdawn.getAttrBN( this.charID, presp + "AoE", "").trim().length > 1 )
              line( "<b>AoE:</b> " + Earthdawn.getAttrBN( this.charID, presp + "AoE", ""), "Area of Effect.");
            line( "<b>Duration:</b> " + Earthdawn.getAttrBN( this.charID, presp + "Duration", ""), "Duration of Effect.");
            { let x1 = "<b>Effect:</b>";
              let efctArmor = Earthdawn.getAttrBN( this.charID, presp + "EffectArmor", "N/A");
              if( efctArmor != "N/A" )
              x1 += " " + Earthdawn.getAttrBN( this.charID, presp + "WilSelect", "None") + " +"
              + Earthdawn.getAttrBN( this.charID, presp + "WilEffect", "0") + " " + efctArmor + ".";
              if (Earthdawn.getAttrBN( this.charID, presp + "Effect", "").trim().length > 1)
              x1 += " " + Earthdawn.getAttrBN( this.charID, presp + "Effect", "")
              if( x1.length > 16 )
              line( x1, "Spell Effect: Some spells have Willpower effects. Some of these WIL effects get modified by the targets armor. Many spells also have none WIL effects." );
            }
            line( "<b>Success Levels:</b> " + Earthdawn.getAttrBN( this.charID, presp + "SuccessLevels", "None"),
              "Getting more than one success upon the spellcasting test often provides a bonus effect.");
            line( "<b>Extra Threads:</b> " + Earthdawn.getAttrBN( this.charID, presp + "ExtraThreads", ""),
              "Extra Threads indicates what enhanced effects the caster can add to their spell by weaving additional threads into the spell pattern.");
            { let enhThread = bGrim ? "x" : Earthdawn.getAttrBN( this.charID, pre + "EnhThread", "");
            if( enhThread && enhThread !== "x" )
              line( "<b>Pre-woven Thread:</b> " + enhThread.toString(), "EnhThread: This spell is in a matrix that can hold a pre-woven thread, and this is the extra thread option pre-woven into this matrix." );
            }
            if( Earthdawn.getAttrBN( this.charID, presp + "SuccessText", "").trim().length > 1 )
              line( "<b>Display Text:</b> " + Earthdawn.getAttrBN( this.charID, presp + "SuccessText", ""),
                    "This text appears if the spellcasting test is successful. It can optionally be used to remind players of what the spell does and how it works.");
            line( "<b>Description</b> (hover)", Earthdawn.getAttrBN( this.charID, presp + "Notes", "").replace( /\n/g, "&#013;"));
            if( !infoPub )
              line( Earthdawn.makeButton( "Post to all", "!Earthdawn~ charID: " + this.charID + "~ ForEach: inmt~ Spell: " + ssa[ 1 ] + ": InfoPub: " +ssa[ ssa.length-1 ],
                  "Press this button to send the details of the spell to all players." ,Earthdawn.Colors.param2,Earthdawn.Colors.param2fg ));
            this.chat( sect.toString(), (infoPub ? Earthdawn.whoTo.public : Earthdawn.whoTo.player) | Earthdawn.whoFrom.noArchive | Earthdawn.whoFrom.character );
          } break;
          case "TuneGrimoire": {
                //Spell Sequence
            if( other ) {
              this.misc[ "warnMsg" ] = "Cancelling Sequence for "
                    + Earthdawn.getAttrBN( this.charID,  Earthdawn.buildPre(( aseq[1].startsWith("G") ? "SP" : "SPM"), aseq[ 2 ] )
                    + (aseq[ 1 ].startsWith( "G" ) ? "Name" : "Contains"), "") + ". Sequence Restarted .";
            }
            else if( !nxtextra ) {
              this.misc[ "warnMsg" ]= "Attuning Grimoire: " + Earthdawn.getAttrBN( this.charID, pre + (bGrim ? "Name" : "Contains"), "" ) //Reset Sequence instead
              + " but the Spell was already in sequence. Sequence Restarted .";
            }
                  //Tune Grimoire is in any case a new sequence
            initSpell();

            let disp, tmp;
            if( bGrim )
              tmp = Earthdawn.getAttrBN( this.charID, presp + "Discipline", "0");
            else{
              this.chat( "Earthdawn Error : trying to Attune Grimoire with a Spell in a Matrix.", Earthdawn.whoFrom.apiWarning );
              return;
            }
            disp = Earthdawn.dispToName( tmp, false );  // Name of disciline, not short
            let rid = ssa[ 3 ],
            pre2 = Earthdawn.buildPre( "T" ,rid );
            this.Karma( pre2 + "Karma", 0 );
            this.misc[ "reason" ] = "Attuning Grimoire " + Earthdawn.getAttrBN( this.charID, pre2 + "Name", "0") + " Test : " + Earthdawn.getAttrBN( this.charID, pre + (!bGrim ? "Contains" : "Name" ),"");
            this.misc[ "headcolor" ] = "weave";
            this.bFlags |= Earthdawn.flags.VerboseRoll;
            this.Lookup( 1, [ "value", pre2 + "Step" ]);
            this.targetNum = Earthdawn.getParam( Earthdawn.getAttrBN( this.charID, presp + "Numbers", ""), 2, "/" );
            this.misc[ "sayTotalSuccess" ] = true;
            this.misc[ "endNoteSucc" ] = "Grimoire Successfully Attuned, proceed to weaving/casting" + txtextra + txtwv + txtcst;
            this.misc[ "endNoteFail" ] = "Grimoire Attuning Failed, Retry (takes 10 min) or cast Raw at your own risks";
            SaveSeq();
            ssa[ 2 ] = "TuneGrimoire2";
            this.misc[ "Spell" ] = ssa;
            this.Roll( [ "Roll" ] );
          } break; //End TuneGrimoire
          case "TuneGrimoire2": {     // Roll calls back to here.
            let lines = [];
            if("succBy" in this.misc) aseq [ 1 ]= "GA";     //Grimoire is attuned
            SaveSeq();
            return lines;
          } //End TuneGrimoire2
          case "TuneOnFly": {
            let disp, tmp;
            if( bGrim )
              tmp = Earthdawn.getAttrBN( this.charID, presp + "Discipline", "0");
            else{
              this.chat( "Earthdawn Error : trying to Attune Matrix with a Spell in a Matrix.", Earthdawn.whoFrom.apiWarning );
              return;
            }
            disp = Earthdawn.dispToName( tmp, false );  // Name of disciline, not short

            let rid=ssa[3],
            pre2 = Earthdawn.buildPre( "T" , rid);
            this.Karma( pre2 + "Karma", 0 );
            this.misc[ "reason" ] = "Attuning on the Fly " + Earthdawn.getAttrBN( this.charID, pre2 + "Name", "0") + " Test : " + Earthdawn.getAttrBN( this.charID, pre + (!bGrim ? "Contains" : "Name" ),"");
            this.misc[ "headcolor" ] = "weave";
            this.bFlags |= Earthdawn.flags.VerboseRoll;
            this.Lookup( 1, [ "value", pre2 + "Step" ]);
            this.targetNum = Earthdawn.getParam( Earthdawn.getAttrBN( this.charID, presp + "Numbers", ""), 2, "/" );
            this.misc[ "strain" ] =1 ;
            this.misc[ "sayTotalSuccess" ] = true;
            this.misc[ "endNoteSucc" ] = "Choose Matrix : " + txttunematrix;
            this.misc[ "endNoteFail" ] = "Attuning on the fly failure. Retry until success or " + txtwipe  ;
            if( other ) {
              this.misc[ "warnMsg" ]= "Cancelling Sequence for "
                    + Earthdawn.getAttrBN( this.charID,  Earthdawn.buildPre(( aseq[1].startsWith("G") ? "SP" : "SPM"), aseq[ 2 ] )+ (aseq[1].startsWith("G") ? "Name" : "Contains"), "")
                    + ". Sequence Restarted .";
              initSpell();
            }
            else if( !nxtextra ) {
              this.misc[ "warnMsg" ]= "Attuning Matrix on the Fly: " + Earthdawn.getAttrBN( this.charID, pre + (bGrim ? "Name" : "Contains"), "" ) //Reset Sequence instead
              + " but the Spell was already in sequence "
              + ". Sequence Restarted .";
              initSpell();
            }
            ssa[ 2 ] = "TuneOnFly2";
            this.misc[ "Spell" ] = ssa;
            this.Roll( [ "Roll" ] );
          } break; //End TuneOnFly
          case "TuneOnFly2": {      // Roll calls back to here.
            let lines = [];
            return lines;
          }
          case "WarpTest": {
            let circle = Earthdawn.parseInt2(Earthdawn.getAttrBN( this.charID, presp + "Circle", "0"));
            let region=ssa[ 3 ];
            let step, dmg;
            switch( region ){
              case "Open":      step = circle + 5;  dmg = circle + 8;  break;
              case "Tainted":   step = circle +10;  dmg = circle +12;   break;
              case "Corrupt":   step = circle +15;  dmg = circle +16;  break;
              default:          step = circle;      dmg = circle + 4;  //Region Type Safe
            }
            this.misc[ "reason" ] = "Warp Test " + region + " Astral Space";
            this.misc[ "headcolor" ] = "action";
            this.bFlags |= Earthdawn.flags.VerboseRoll;
            this.misc[ "step" ] = step;
            this.misc[ "targetChar" ] = this.charID;
            this.misc[ "targetName" ] =Earthdawn.getAttrBN( this.charID, "charName", "0");
            this.misc[ "targettype" ] = "MD-Nat";
            this.targetNum =  Earthdawn.getAttrBN( this.charID, "MD-Nat", "0");
            this.misc[ "sayTotalSuccess" ] = true;
            this.misc[ "endNoteFail" ] = "No Warping Damage";
            this.misc[ "endNoteSucc" ] = Earthdawn.makeButton( "Warp Damage",
                  "!Earthdawn~ charID:"+ this.charID + "~ armortype: MA-Nat~ Reason:Warp Damage ~ foreach~  Roll : " + dmg + ": ?{Modification|0}" ,
            // "!Earthdawn~ charID: " + this.charID + "~ Damage : MA-Nat : " + dmg,
            "Warping Damage done to the character" ,Earthdawn.Colors.damage,Earthdawn.Colors.damagefg);

  //JBF@JBF@CD need to rewrite the damage button

            ssa[ 2 ] = "WarpTest2";
            this.misc[ "Spell" ] = ssa;
            this.Roll( [ "Roll"] );
          } break; //End TuneGrimoire
          case "WarpTest2": {     // Roll calls back to here.
            let lines = [];
            return lines;
          } //End WarpTest2
          case "HorrorMark": {
            let circle= Earthdawn.getAttrBN( this.charID, presp + "Circle", "0", true );
            let region=ssa[3];
            let step;
            switch( region ) {
              case "Open":    step = circle + 2;  break;
              case "Tainted": step = circle + 5;  break;
              case "Corrupt": step = circle +10;  break;
              default : this.chat(" Region is Open, You're lucky!"); return;  //Region Type Safe
            }
            this.misc[ "RollType" ] = "w gm";
            this.misc[ "reason" ] = "Horror Mark Test";
            this.misc[ "headcolor" ] = "action";
            this.bFlags |= Earthdawn.flags.VerboseRoll;
            this.misc[ "step" ] = step;
            this.misc[ "targetChar" ] = this.charID;
            this.misc[ "targetName" ] =Earthdawn.getAttrBN( this.charID, "charName", "0");
            this.misc[ "targettype" ] = "MD-Nat";
            this.targetNum = Earthdawn.getAttrBN( this.charID, "MD-Nat", "0");
            this.misc[ "sayTotalSuccess" ] = true;
            this.misc[ "endNoteFail" ] = "Nothing Happens";
            this.misc[ "endNoteSucc" ] = "A Horror Marked the character";
            ssa[ 2 ] = "HorrorMark2";
            this.misc[ "Spell" ] = ssa;
            this.Roll( [ "Roll"] );
          } break; //End TuneGrimoire
          case "HorrorMark2": {     // Roll calls back to here.
            let lines = [];
            return lines;
          } //End WarpTest2
          case "New": {
                  //Sequence Control. Normal Case is (noseqactive || seqended || (step==0 && !other)), if not go through different cases to issue warnings.
                  //At this stage, no action was taken, so sequence must not be initialized yet
            if( !(noseqactive || seqended || (step==0 && !other))) {
              if ( other ) {
                line( "<b>Warning!</b> Sequence is already in progress for: <b>"
                + Earthdawn.getAttrBN( this.charID,  Earthdawn.buildPre(( aseq[1].startsWith("G") ? "SP" : "SPM"), aseq[ 2 ] )+ (aseq[1].startsWith("G") ? "Name" : "Contains"), "") +"/<b>"
                ,"Choosing any of the Extra threads will reset the sequence and change the spell being cast.");
                line(Earthdawn.makeButton( "Resume",
                "!Earthdawn~ charID: " + this.charID + "~ ForEach: inmt~  Spell: " + aseq[2] + " : Sequence" ,
                "Return to the Previous Spellcasting Sequence." ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg),"");
                line("Choose Extra Thread to start new sequence <b>" + Earthdawn.getAttrBN( this.charID, pre + (bGrim ? "Name" : "Contains"), "0") +"</b>","");
              }  else if ( step!==0 ) {
                line( "<b>Warning!</b> Trying to add threads for:<b> " + Earthdawn.getAttrBN( this.charID, pre + (bGrim ? "Name" : "Contains"), "" )
                    + "</b>When sequence was already started. Chosing an Extra Thread will restart the sequence","Extra Threads Can only be selected when starting a sequence. You can still select it at any time, but you will jump back at the start of the sequence.");
              }
            } else //Normal Case
              line("Chosing extra Threads");
            //end sequence control

            let opt = _.without( Earthdawn.getAttrBN( this.charID, presp + "ExtraThreads", "").split( "," ), "");
            for( let i = 0; i < opt.length; ++i )
            line( Earthdawn.makeButton( opt[ i ], "!Earthdawn~ charID: " + this.charID + "~ Spell: " + ssa[ 1 ] + ": " + "Extra: " + opt[ i ] + " : " + ssa[ ssa.length-1] ,
                  "Press this button to add an optional extra thread to this casting." ,Earthdawn.Colors.action,Earthdawn.Colors.actionfg),"");
            line( txtwv, "");
            this.chat( sect.toString(), Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive | Earthdawn.whoFrom.character );
          } break;
          case "Extra": {
                  //Sequence Control. Normal Case is (noseqactive || seqended || (step==0&!other)), if not go through different cases to issue warnings.
                  //At this stage, Action was taken, so we actually
            if( !(noseqactive || seqended || (step==0 && !other))) {
              line( "Previous Sequence reset. Sequence restarted and extra thread added for : <b>" + Earthdawn.getAttrBN( this.charID, pre + (bGrim ? "Name" : "Contains"), "" )+"</b>"
                    ,"Extra Threads were selected while another spell was in sequence. Sequence restarted with current spell");
              initSpell(); //Action was taken initialize sequence
            } else                    //Normal Case
              if(noseqactive || seqended)
                initSpell(); //Action was taken initialize sequence
            //end sequence control
            line("Extra Thread added - Threads: " + sthrd + " + " + (aseq.length-6 +1 ) +" extra" );//aseq not updated yet

            this.misc[ "esGoal" ] = Earthdawn.parseInt2( sthrd ) + aseq.length - 6 +1;
            this.misc[ "esStart" ] = Earthdawn.parseInt2( aseq [ 4 ] );
            this.setWW( "SS-CurThreads", this.misc[ "esStart" ] +"/"+ this.misc[ "esGoal" ]);
            let enh = Earthdawn.getAttrBN( this.charID, "SS-EnhThread", "x" )
            enh = ( enh == "x" ? "" : (enh + ",") ) +ssa[ 3 ];
            this.setWW( "SS-EnhThread", enh);
            if(bGrim && !bGrimAtt) {
              line("No Attunement <b> Raw Magic</b>","");
              aseq[ 1 ] = "GR";
            }
            aseq.push(ssa[ 3 ]);
            SaveSeq();
            line( "Updated " + ssa[ 3 ],"" );
            line( txtwv, "");
            this.chat( sect.toString(), Earthdawn.whoTo.player | Earthdawn.whoTo.gm | Earthdawn.whoFrom.noArchive | Earthdawn.whoFrom.character );
          } break; //End Extra
          case "Weave": {
                  //Sequence Control.
                  //At this stage, Action was taken, so we actually reset the sequence
            if( other && !seqended ) { //Another spell was in middle of an unfinished sequence
              this.misc[ "warnMsg" ]= "Cancelling Sequence for "
                    + Earthdawn.getAttrBN( this.charID,  Earthdawn.buildPre(( aseq[1].startsWith("G") ? "SP" : "SPM"), aseq[ 2 ] )+ (aseq[1].startsWith("G") ? "Name" : "Contains"), "")
                    + ". Sequence Restarted .";
              initSpell();
            } else if( aseq [ 3 ] == 2 )      // We are not on a correct step
            this.misc[ "warnMsg" ] = "Note: Haven't you already pulled all the threads for this casting?";
            else if( aseq [ 3 ] == 4 ) {      //We are not on a correct step
              this.misc[ "warnMsg" ]= "Weaving threads for: " + Earthdawn.getAttrBN( this.charID, pre + (bGrim ? "Name" : "Contains"), "" ) //Reset Sequence instead
                    + " but the spell just got cast. Sequence Restarted .";
              initSpell();
            }
            else {                    //Normal Case
               if( noseqactive || seqended) initSpell();    //Action was taken initialize sequence
            }
            //end sequence control

            let disp,
              tmp = Earthdawn.getAttrBN( this.charID, presp + "Discipline", "0");
            disp = Earthdawn.dispToName( tmp, false );  // Name of disiline, not short
            let rid = ssa[ 3 ],
            pre2 = Earthdawn.buildPre( "T" ,rid);
            this.Karma( pre2 + "Karma", 0 );
            if( Earthdawn.getAttrBN( this.charID, pre2 + "Strain", "0", true )) this.misc[ "strain" ] = Earthdawn.getAttrBN( this.charID, pre2 + "Strain", "0", true ) ;
            this.misc[ "reason" ] = "Weaving " + Earthdawn.getAttrBN( this.charID, pre2 + "Name", "0") + " : " + Earthdawn.getAttrBN( this.charID, pre + (!bGrim ? "Contains" : "Name" ),"");
            this.misc[ "headcolor" ] = "weave";
            this.bFlags |= Earthdawn.flags.VerboseRoll;
            this.Lookup( 1, [ "value", pre2 + "Step" ]);
            this.targetNum = Earthdawn.getParam( Earthdawn.getAttrBN( this.charID, presp + "Numbers", ""), 1, "/" );
            this.misc[ "sayTotalSuccess" ] = true;
            this.misc[ "esGoal" ] = Earthdawn.parseInt2( sthrd ) + aseq.length - 6;
            this.misc[ "esStart" ] = Earthdawn.parseInt2( aseq [ 4 ] );
            this.misc[ "woveTip" ] = sthrd + " base spell threads, plus " + (aseq.length - 6).toString() + " Extra threads." ;
            if( bGrim && !bGrimAtt ) {
              this.misc[ "endNote" ] = "No Attunement <b> Raw Magic</b>";
              aseq[ 1 ] = "GR";
            }
            SaveSeq();
            ssa[ 2 ] = "Weave2";
            this.misc[ "Spell" ] = ssa;
            this.Roll( [ "Roll" ] );
          } break; //End Weave
          case "Weave2": {      // Roll calls back to here.
            let lines = [];
            let esDone = this.misc[ "esStart" ] + (( "succBy" in this.misc ) ? 1 : 0 ) + (( "extraSucc" in this.misc ) ? this.misc[ "extraSucc" ] : 0 );
            lines.push( "<b>Wove:</b> " + esDone + " of " + Earthdawn.texttip( this.misc[ "esGoal" ] + " threads.", this.misc[ "woveTip" ] ));
            aseq [ 4 ] = esDone;
            aseq [ 3 ] = ( aseq[ 4 ] < this.misc[ "esGoal" ]) ? "1" : "2";
            if ( aseq[ 4 ] >= this.misc[ "esGoal" ]) lines.push(txtcst);    //If Weaving finished, offer to cast
            SaveSeq();
            this.setWW( "SS-CurThreads", Math.min(esDone,this.misc[ "esGoal" ]) +"/"+this.misc[ "esGoal" ]);
            return lines;
          }
          case "Cast": {
                  //Sequence Control.
                  //At this stage, Action was taken, so we actually reset the sequence
            if( other && !seqended ) { //Another spell was in middle of an unfinished sequence
              this.misc[ "warnMsg" ]= "Cancelling Sequence for "
                    + Earthdawn.getAttrBN( this.charID,  Earthdawn.buildPre(( aseq[ 1 ].startsWith("G") ? "SP" : "SPM")
                    , aseq[ 2 ] )+ (aseq[1].startsWith("G") ? "Name" : "Contains"), "") + ". Sequence Restarted .";
              initSpell();
              aseq [ 3 ]="2";
              aseq[ 4 ] = "99";     //Skipping Weaving altogether
            } else if( aseq [ 3 ] == 4 ) {
              this.misc[ "warnMsg" ] = "Note: You have already attempted to cast this spell. Resetting the sequence";
              initSpell();
              aseq [ 3 ]="2";
              aseq[ 4 ] = "99";   //Skipping Weaving altogether
            } else if(( Earthdawn.getAttrBN( this.charID, presp + "sThreads", "0", true ) + aseq.length - 6) > (bGrim? 0 : Earthdawn.getAttrBN( this.charID, pre + "mThreads", "0", true ))) // We can skip this test is threads are not needed.
              if( aseq [ 3 ] == "1" || aseq [ 3 ] == "0" )    //If there is no thread to be woven, we skip this test altogether
              this.misc[ "warnMsg" ] = "Note: Have you pulled all the threads you need? Only " + aseq [ 4 ] + " of "
                    + (Earthdawn.getAttrBN( this.charID, pre + "sThreads", "0", true ) + aseq.length - 6) + " done.";
              //Normal Case
            if(noseqactive || seqended)
              initSpell(this); //Action was taken initialize sequence
            //end sequence control

            let rid = ssa[ 3 ],
            pre2 = Earthdawn.buildPre( "T", rid);
            this.Karma( pre2+"Karma", 0 );
            if( Earthdawn.getAttrBN( this.charID, pre2 + "Strain","0", true ))
              this.misc[ "strain" ] = Earthdawn.getAttrBN( this.charID, pre2 + "Strain","0", true );
            this.misc[ "reason" ] = Earthdawn.getAttrBN( this.charID, pre2 + "Name", "0") + " : " + Earthdawn.getAttrBN( this.charID, pre + (!bGrim ? "Contains" : "Name" ), "");
            this.misc[ "headcolor" ] = "action";
            this.misc[ "Special" ] = "SPL-Spellcasting";
            this.bFlags |= Earthdawn.flags.NoOppMnvr;
            this.Lookup( 1, [ "value", pre2 + "Step" ]);
  //JBF@JBF@CD Attempt at Targetting
            let tType=Earthdawn.getAttrBN( this.charID, pre2 + "Casting", "MD")
            if( tType && tType !== "None" )
              if( tType.startsWith( "Ask" ))
                this.misc[ "targettype" ] = tType.substring( 0, tType.lastIndexOf( ":" ));
              else if( tType.slice( 1, 3) === "D1")     // PD1, MD1, and SD1, go to just the first two characters.
                this.misc[ "targettype" ] = tType.slice( 0, 2);
              else if( tType.startsWith( "Riposte" ))
                this.misc[ "targettype" ] = "Riposte";
              else
                this.misc[ "targettype" ] = tType;

            if( bGrim && bGrimAtt)
              this.misc[ "grimCast" ] = true;   // This is a spell being cast from a grimoire.  It counts as one extra success.

            let fx = Earthdawn.getAttrBN( this.charID, presp + "FX", "");
            if( fx && ( fx.startsWith( "Attempt" ) || fx.startsWith( "Success")))
              this.misc[ "FX" ] = fx;
            this.misc[ "succMsg" ] = Earthdawn.getAttrBN( this.charID, presp + "SuccessText", "");
            this.misc[ "sayTotalSuccess" ] = Earthdawn.getAttrBN( this.charID, presp + "sayTotalSuccess", "0" ) == "1";
            ssa[ 2 ] = "Cast2";
            this.misc[ "Spell" ] = ssa;
              // this.Roll( [ "Roll" ] );
            this.ForEachHit( [ "Roll" ] );
            } break; //end Cast
          case "Cast2": {       // Roll calls back to here.
            let lines = [];
            aseq [ 3 ] = ( "failBy" in this.misc ) ? "3" : (nowil ? "5":"4");     //If there is no will effect, we skip the step 4
            let fail = ("failBy" in this.misc);     //Will allow to skip unnecessary information in the roll template
            let es = ( "extraSucc" in this.misc ) ? Earthdawn.parseInt2(this.misc[ "extraSucc" ]) : 0;    //Number of extra successes
            if(bGrim && bGrimAtt)
              es += 1;    // Player Guide : Grimoire casting with own Grimoire automatically adds one success.
            let rid=ssa[ 3 ],
            pre2=Earthdawn.buildPre( "T",rid );
            let cntdwn=0;     //This is the duration in round for the countdown

            let esbonus = (es>=1) ? [Earthdawn.getAttrBN( this.charID, presp + "SuccessLevels", "None" )] : []; //Extra Success Bonuses
            let esdone = (es==0); // This will track if the extra successes were processed (or if it is ever needed)
            let etbonus = aseq.slice( 6 ); //Extra Thread Bonus
            let allbonus = esbonus.concat(etbonus);
            let bbonus = etbonus; //Will progressively be removed of the
            let rank = Earthdawn.getAttrBN( this.charID, pre2+"Effective-Rank", "0" );

            function extra( lbl, txtvar, lookup, def ) {      // Write out spell information, possibly modified by extra successes.
              'use strict';
              // let t1 = (txtvar ? ((lookup === null) ? txtvar : Earthdawn.getAttrBN( po.charID, presp + txtvar, def ).toString()) : ""), //JBF@JBF@CD : We got rid of the incomplete calls, so this is not necessary anymore
              let incDur = false, //Will record if we are dealing with duration chnged to minutes
              inc = 0,
              saved = "",
              t3 = "";
              let txt = Earthdawn.getAttrBN( po.charID, presp + txtvar, def ).toString(); //t1 ? t1 : ""; //JBF@JBF@CD : pre replaced by presp to awlays point to the spell, not the matrix. Line Deleted, we don't process
              // if( lookup ) There is now always a lookup
              for( let i = (es ? 0 : 1); i < allbonus.length; ++i ) {     // If we don't have any extra successes, then we don't process the first value.
                if( allbonus[ i ].match( lookup ) ) {     //allbonus lists all bonus from Extra Success and Extra Threads
                  if ( i == 0 && es > 0 )
                    esdone=true;    //We are processing the ES, don't display them at the end
                  if( allbonus[ i ].match( /Inc.*Dur.*min.*/ig )) {     //Duration switched from Round to Min
                    incDur = true;
                    bbonus = _.without( bbonus, allbonus[ i ] );    //We found a line, we remove it
                    continue;
                  }
                  let i1 = allbonus[ i ].indexOf( "+" );    //This looks for what is after a + sign
                  if( i1 != -1 ) {
                    let i2 = allbonus[ i ].indexOf( ")", i1 +1 );
                    if( i2 == -1)
                      i2 = allbonus[i].length;
                    let i3 = i1+1;
                    let number = new RegExp( /[\s\d+-]/ );
                    while ( number.test(allbonus[i].charAt( i3 )) )
                      ++i3;
                    inc += Earthdawn.parseInt2(allbonus[ i ].slice( i1+1, i3)) * (( i == 0 && es > 0 ) ? es : 1 );    //We get the increment, and for the extra success, we multiply by the number of es
                    saved = allbonus[ i ].slice( i3,i2 );
                  }
                  t3 += " " + (( i == 0 && es > 1 ) ? es.toString() + " x " : "+" ) + allbonus[i];
                  bbonus = _.without( bbonus, allbonus[ i ] );
              } }
              if( txt.length > 0 || t3.length > 1) {
                txt = txt.replace( /R[an]{0,2}k/gi, "Rk( " + rank + " )");    //Rank, rank, Rnk, Rk rnk ...
                t3  = t3.replace( /R[an]{0,2}k/gi, "Rk( " + rank + " )");
                if( incDur ) {
                  txt = txt.replace( /R[oun]{0,3}d/gi, "Min" ); //Round, Rd, Rnd, ...
                  t3 = t3.replace( /R[oun]{0,3}d/gi , "Min" ) + " Inc Dur (min)";
                }
                lines.push( "<b>" + lbl + "</b> " + (inc ? Earthdawn.texttip( txt + " + " + inc.toString() + (saved ? " " + saved : ""), t3) : txt + " " + t3));
              }

                    //Duration calculation
              if(txt.match(/R[oun]{0,3}d/gi)) {
                let txta=txt.split("+");
                for(let i=0;i<txta.length;i++) cntdwn +=Earthdawn.parseInt2( txta[i].replace( /[^\d]/gi, ""));    //Purge from any non number
                 cntdwn += Earthdawn.parseInt2( inc );
              }
              return inc;
            } // End function extra()

            if( fail )
              lines.push("End Sequence" + txtreset); //If failed, we don't display all the details of the results
            else {    // is successful
              extra( "Range", "Range", /R[a]{0,1}ng/gi, "" );     //Range, Rng
              let x3 = Earthdawn.getAttrBN( po.charID, presp + "AoE", " " );
              if( x3 && x3 != "x" && x3 != " " )
                extra( "AoE", "AoE", /Area/gi, " " );     //Area

              extra( "Duration", "Duration", /Dur/gi, "" );
              let x4 = Earthdawn.getAttrBN( po.charID, presp + "WilSelect", "" );
              if( x4 && x4 !== "None") {
                aseq[ 5 ] = extra( "Effect :" + x4 + " +", "WilEffect", /Ef[fe]{0,2}ct.*Step/gi, "0" );
                let x2 = Earthdawn.getAttrBN( this.charID, presp + "EffectArmor", "N/A" );
                if( x2 && x2 != "N/A" )
                  lines[ lines.length - 1 ] += " " + x2;
                lines.push( "<b>Effect :</b>" + txtfx );
              }
              extra( "Effect" , "Effect", /Ef[fe]{0,2}ct.*Other.*/gi, "" );

              if(!esdone)
                lines.push( "<b>" + "Extra Success" + "</b> " + esbonus.toString() + (( es >= 1) ? "x" + es : ""));     //ES was not processed, display at the end
              if( bbonus.length > 0 )
                lines.push( "<b>" + "Extra Threads" + "</b> " + bbonus.toString());     //Some ET not processed, display at the end
              lines.push( "<b>Description</b>"+ Earthdawn.texttip("(Hover)",Earthdawn.getAttrBN( this.charID, presp + "Notes", "").replace( /\n/g, "&#013;")));
              if( !x4 || x4 == "None")
                lines.push("<b>No Will Effect</b> - End Sequence :" + txtreset);    //If no Will Effect, Sequence is finished

                    //This sends multi-round spells to the Turn Tracker
              if( cntdwn >= 2 ) {
                let tt = Campaign().get( 'turnorder' );
                let tracker = (tt == "") ? [] : JSON.parse( tt );
                let name = "CntDwn: " + Earthdawn.getAttrBN( this.charID, pre + (!bGrim ? "Contains" : "Name"), "");
                let custom = {id: "-1" , pr: "-" + cntdwn ,custom: name, formula: "1" };
                tracker.push( custom );
                Campaign().set('turnorder', JSON.stringify( tracker ));
              }
            } //End if successful

            if(bGrim && !bGrimAtt) {      //Raw Casting only
              lines.push("<b> Raw Magic</b>"+txtwarp+txtmark);
              aseq[1]="GR";
            }
            SaveSeq();
            return lines;
          } //End Cast2
          case "Effect": {    // Spell Will Effect test.
              let skipseq  = false;
              if( other ) {
                this.misc[ "warnMsg" ]= "Rolling Effect for: " + Earthdawn.getAttrBN( this.charID, pre + (!bGrim ? "Contains" : "Name"), "" )
                      + " but the spell in Sequence is: "
                      + Earthdawn.getAttrBN( this.charID,  Earthdawn.buildPre(( aseq[1].startsWith( "G" ) ? "SP" : "SPM"), aseq[ 2 ] )
                      + (aseq[  1].startsWith( "G" ) ? "Name" : "Contains"), "") + ". Sequence will not be reset (in case it is a multiround effect)";
                skipseq = true;
              } else if( aseq [ 3 ] == "5" )
              this.misc[ "warnMsg" ] = "Warning: A Will Effect Test has already been rolled.";
              else if( aseq [ 3 ] != "4" )
              this.misc[ "warnMsg" ] = "Warning: The last thing you did was not to successfully cast the spell.";

              let rid = ssa[ 3 ];
              let code,n,n2;
              switch (wilselect){
                case "Circle":  code = "DSP"; n = "Circle";         break;
                case "Rank":    code = "T";   n = "Effective-Rank"; break;
                default: code = "T"; n = "Step";
              }
              let pre2 = Earthdawn.buildPre( code, rid);
              if( n == "Step" ) {
                this.Karma( pre2 + "Karma", 0 );
                if( Earthdawn.getAttrBN( this.charID, pre2 + "Strain","0", true ))
                  this.misc[ "strain" ] = Earthdawn.getAttrBN( this.charID, pre2 + "Strain","0", true );
              }
              this.misc[ "headcolor" ] = "effect";
              this.misc[ "reason" ] = Earthdawn.getAttrBN( this.charID, pre + (!bGrim ? "Contains" : "Name" ), "") + " Effect : "
                    + (wilselect=="Circle" ? (disp + " Circle") : (Earthdawn.getAttrBN( this.charID, pre2 + "Name", "0"))
                    + (wilselect=="Rank") ? " Rank" : "");
              let fx = Earthdawn.getAttrBN( this.charID, presp + "FX", "");
              if( fx && fx.startsWith( "Effect" ))
                this.misc[ "FX" ] = fx;
              this.Parse( "armortype: " + Earthdawn.getAttrBN( this.charID, presp + "EffectArmor", "N/A") );
              this.bFlags |= Earthdawn.flags.WillEffect; //JBF@JBF@CD is it still usefull
              let t2 = Earthdawn.parseInt2( Earthdawn.getAttrBN( this.charID, pre2 + n, 5));   //This is the step
              this.Lookup( 1, [ "value", presp + "WilEffect", t2.toString(),  aseq[ 5 ]  ] ); //JBF@JBF@CD  ssa[ 3 ] deleted, because modifier in other place // Add in the spells will effect, the modifiers passed, plus any additions from the casting.
              if( !skipseq ) {
                aseq[ 3 ] = "5";
                SaveSeq();
                this.misc[ "endNote" ] = "Apply Dmg and then " + txtreset;
               }
              this.ForEachHit( [ "Roll" ] );
          } break;
          case "WipeMatrix": {
            let attributes = findObjs({ _type: "attribute", _characterid: this.charID });
            _.each( attributes, function (att) {
              if( att.get( "name" ).endsWith( "_SPM_Contains" )) {
                Earthdawn.abilityRemove( po.charID, Earthdawn.constant( "Spell" ) + att.get( "current" ));
                Earthdawn.setWithWorker( att, "current", "Empty" );
              } else if( att.get( "name" ).endsWith( "_SPM_Threads" ) || att.get( "name" ).endsWith( "_SPM_EnhThreads" ))
                Earthdawn.setWithWorker( att, "current", "x" );
              else if( att.get( "name" ).endsWith( "_SPM_Notes" ) || att.get( "name" ).endsWith( "_SPM_spRowID" ))
                Earthdawn.setWithWorker( att, "current", "" );
              if ( att.get( "name" ).endsWith( "_SP_Name" ))
                po.setWW( Earthdawn.buildPre( att.get( "name" )) + "spmRowID", "0" );
            }); //End each Attribute
            this.setWW( "SS-Active", "0");
            SaveSeq();
            this.chat( "All Matrix have been wiped !" );
          } // WipeMatrix falls down to Reset
          case "Reset": {
            this.setWW( "SS-Active", "0");
            this.TokenSet( "clear", "SustainedSequence", "" );
            this.chat("Spell Sequence Reset. Start a new one");
          } break;      // End Reset
        } // end main switch.
      } catch(err) { this.edClass.errorLog( "ED.Spell() error caught: " + err ); }
    } // End ParseObj.Spell( ssa )



                // Spell-casting Token action.
    this.SpellOld = function( ssa ) {
      'use strict';
      try {
        let po = this,
          bGrim = !(ssa[ 0 ].toLowerCase() === "spell"),        // false = Matrix. true = Grimoire
          pre = Earthdawn.buildPre( bGrim ? "SP" : "SPM", ssa[ 1 ] ),
          what = ssa[ 2 ];
      //    Earthdawn.abilityAdd( this.charID, Earthdawn.constant( "Spell" ) + t, "!edToken~ spell: " + matrixTo
      //    + ": ?{" + t + " What|Info"
      //    + "|Start New Casting,New: ?{Matrix or Grimoire cast|Matrix,M|Grimoire,G}"
      //    + "|Weave Threads, Weave: ?{Modifier|0}"
      //    + "|Cast, Cast: ?{Modifier|0}: @(SP_Casting)
      //    + "|Effect,Effect: ?{Modifier|0} " + "}" );
      //
      //    (0) Cast, (1) G/M, (2) (spell or matrix row id), (3) Sequence, (4) Number threads pulled (including already in matrix), (5) Effect bonus from spellcasting (6+) extra threads.
      //    Sequence = 0 new, 1 pulling threads, 2 pulled all threads, 3 spellcasting failed, 4 spellcasting succeeded, 5 an effect has been rolled.

        switch( what ) {
          case "Info": {
            let sect = new HtmlBuilder( "", "", {
              style: {
              "background-color": "white",
              "border": "solid 1px black",
              "border-radius": "5px",
              "overflow": "hidden",
              "width": "100%"
            }});
            sect.append( "", Earthdawn.getAttrBN( this.charID, pre + "Contains", ""), { style: {
                "background-color": "purple",
                "color": "yellow",
                "font-weight": "bold",
                "text-align": "center"
            }});

            let linenum = 0,
              body = sect.append( ".body", "", {
                style: {
                "text-align":   "left"
              }});
            body.setCss({
              odd: { },
              even: { "background": "#E9E9E9" }
            });

            function line( txt, tip) {
              body.append( (( ++linenum % 2) ? ".odd" : ".even"), Earthdawn.texttip( txt, tip ));
            }

            let mattype = "Std ";
            if( !bGrim ) {
              switch( Earthdawn.getAttrBN( this.charID, pre + "Type", "-10") ) {
                case  "15":   mattype = "Enhanced";   break;
                case  "25":   mattype = "Armored";  break;
                case  "-20":  mattype = "Shared";   break;
              }
              line( "<b>Matrix:</b> Rank " + Earthdawn.getAttrBN( this.charID, pre + "Rank", "0") + " - " + mattype + " - "
                  + Earthdawn.getAttrBN( this.charID, pre + "Origin", "Free"), "Rank of matrix, it's Type and Origin.");
            }
            line( "<b>Min Threads:</b> " + Earthdawn.getAttrBN( this.charID, pre + "sThreads", "0"),
                  "Number of spell threads that must be woven in order to cast the base version of the spell.");
            line( "<b>Weave Diff:</b> " + Earthdawn.getAttrBN( this.charID, pre + "Numbers", ""),
                  "Weaving difficulty / Reattunment difficulty / Dispelling difficulty / Sensing difficulty.");
            line( "<b>Range:</b> " + Earthdawn.getAttrBN( this.charID, pre + "Range", "") + "   <b>Cast Diff:</b> "
                  + Earthdawn.getParam( Earthdawn.getAttrBN( this.charID, pre + "Casting", "MDh"), 1, ":"),
                  "Range spell can be cast.   <br/>Cast Difficulty, if coded is the appropriate Defense, if third character is 'h' then it is the highest among all targets. If 'p1p' is present it stands for 'plus one per additional target'.");
            if( Earthdawn.getAttrBN( this.charID, pre + "AoE", "").trim().length > 1 )
              line( "<b>AoE:</b> " + Earthdawn.getAttrBN( this.charID, pre + "AoE", ""), "Area of Effect.");
            line( "<b>Duration:</b> " + Earthdawn.getAttrBN( this.charID, pre + "Duration", ""), "Duration of Effect.");
            { let x1 = "<b>Effect:</b>";
              let efctArmor = Earthdawn.getAttrBN( this.charID, pre + "EffectArmor", "N/A");
              if( efctArmor != "N/A" )
                x1 += " " + Earthdawn.getAttrBN( this.charID, pre + "WilSelect", "None") + " +"
                      + Earthdawn.getAttrBN( this.charID, pre + "WilEffect", "0") + " " + efctArmor + ".";
              if (Earthdawn.getAttrBN( this.charID, pre + "Effect", "").trim().length > 1)
                x1 += " " + Earthdawn.getAttrBN( this.charID, pre + "Effect", "")
              if( x1.length > 16 )
                line( x1, "Spell Effect: Some spells have Willpower effects. Some of these WIL effects get modified by the targets armor. Many spells also have none WIL effects." );
            }
            line( "<b>Success Levels:</b> " + Earthdawn.getAttrBN( this.charID, presp + "SuccessLevels", "None"),
                  "Getting more than one success upon the spellcasting test often provides a bonus effect.");
            line( "<b>Extra Threads:</b> " + Earthdawn.getAttrBN( this.charID, presp + "ExtraThreads", ""),
                  "Extra Threads indicates what enhanced effects the caster can add to their spell by weaving additional threads into the spell pattern.");
            { let enhThread = bGrim ? "x" : Earthdawn.getAttrBN( this.charID, pre + "EnhThread", "");
              if( enhThread && enhThread !== "x" )
                line( "<b>Pre-woven Thread:</b> " + enhThread.toString(), "EnhThread: This spell is in a matrix that can hold a pre-woven thread, and this is the extra thread option pre-woven into this matrix." );
            }
            if( Earthdawn.getAttrBN( this.charID, pre + "SuccessText", "").trim().length > 1 )
              line( "<b>Display Text:</b> " + Earthdawn.getAttrBN( this.charID, pre + "SuccessText", ""),
                    "This text appears if the spellcasting test is successful. It can optionally be used to remind players of what the spell does and how it works.");
            line( "<b>Description</b> (hover)", Earthdawn.getAttrBN( this.charID, pre + "Notes", "").replace( /\n/g, "<br/>"));

            this.chat( sect.toString(), Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive | Earthdawn.whoFrom.character );
          } break;
          case "New": {
            let txt = "Spell requires " + Earthdawn.getAttrBN( this.charID, pre + "sThreads", "0") + " threads. Extra Threads? ";
            let opt = _.without( Earthdawn.getAttrBN( this.charID, pre + "ExtraThreads", "").split( "," ), "");
            for( let i = 0; i < opt.length; ++i )
              txt += Earthdawn.makeButton( opt[ i ], "!Earthdawn~ charID: " + this.charID + "~ Spell: " + ssa[ 1 ] + ": " + "Extra: " + opt[ i ],
                    "Press this button to add an optional extra thread to this casting." ,Earthdawn.Colors.action,Earthdawn.Colors.actionfg);
            this.chat( txt, Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive | Earthdawn.whoFrom.character );
            let thrd = bGrim ? 0 : Earthdawn.getAttrBN( this.charID, pre + "mThreads", "0");
            let enh = bGrim ? "x" : Earthdawn.getAttrBN( this.charID, pre + "EnhThread", "");
            if( !enh || enh == "x" )
              thrd = "0";
            this.TokenSet( "clear", "SustainedSequence", "Cast," + (bGrim ? "G," : "M,") + ssa[ 1 ] + ",0," + thrd + ",0" );
          } break;
          case "Extra": {
            let seq = this.TokenGet( "SustainedSequence", true );
            if( !seq )
              this.chat( "Error! Need to have started a new Casting. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiWarning );
            else if ( Earthdawn.getParam( seq, 1, "," ) !== "Cast" )
              this.chat( "Error! Extra Threads may only be selected after starting a new Casting. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiWarning );
            else if ( Earthdawn.getParam( seq, 4, "," ) != "0" )
              this.chat( "Error! Extra Threads may only be selected immediately after starting a new Casting. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiWarning );
            else {
              this.TokenSet( "clear", "SustainedSequence", seq + "," + ssa[ 3 ] );
              this.chat( "Updated " + ssa[ 3 ], Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive | Earthdawn.whoFrom.character );
            }
          } break;
          case "Weave": {
            let disp, tmp;
            if( bGrim )
              tmp = Earthdawn.getAttrBN( this.charID, pre + "Discipline", "0");
            else
              tmp = Earthdawn.getAttrBN( this.charID, Earthdawn.buildPre( "SP", Earthdawn.getAttrBN( this.charID, pre + "spRowID" )) + "Discipline", "0");
            disp = Earthdawn.dispToName( tmp, false );  // Name of disiline, not short
            this.Karma( "SP-" + disp + "-Karma-Control", 0 );
  // redo karma control
            this.misc[ "reason" ] = "Weave Thread " + disp;
            this.misc[ "headcolor" ] = "weave";
            this.bFlags |= Earthdawn.flags.VerboseRoll;
            this.Lookup( 1, [ "value", "SP-" + disp + "-Step", ssa[ 3 ] ] );
            this.targetNum = Earthdawn.getParam( Earthdawn.getAttrBN( this.charID, pre + "Numbers", ""), 1, "/" );
            this.misc[ "sayTotalSuccess" ] = true;

            let seq = this.TokenGet( "SustainedSequence", true );
            if( !seq ) {
              this.chat( "Error! Need to have started a new Casting. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiWarning );
              return;
            } else if ( Earthdawn.getParam( seq, 1, "," ) !== "Cast" ) {
              this.chat( "Error! Thread Weaving may only be selected after starting a new Casting. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiWarning );
              return;
            }
            let needed = (Earthdawn.getAttrBN( this.charID, pre + "sThreads", "0" ) || 0);
            let aseq = seq.split( "," );
            if( ssa[ 1 ] !== aseq[ 2 ] ) {
              this.chat( "Error! Trying to pull threads for: " + Earthdawn.getAttrBN( this.charID, pre + (bGrim ? "Name" : "Contains"), "" )
                    + " but the last spell started was: "
                    + Earthdawn.getAttrBN( this.charID,  Earthdawn.buildPre(( aseq[1] == "G" ? "SP" : "SPM"), aseq[ 2 ] )
                    + (aseq[1] == "G" ? "Name" : "Contains"), "") + ".", Earthdawn.whoFrom.apiWarning );
              return;
            } else if( aseq [ 3 ] == "2" )
              this.misc[ "warnMsg" ] = "Note: Haven't you already pulled all the threads for this casting?";
            else if( aseq [ 3 ] != "0" && aseq[ 3 ] != "1" ) {
              aseq [ 3 ] = "1";
              aseq [ 4 ] = bGrim ? 0 : Earthdawn.getAttrBN( this.charID, pre + "mThreads", "0");
              let enh = bGrim ? "x" : Earthdawn.getAttrBN( this.charID, pre + "EnhThread", "0");
              if( !enh || enh == "x" )
                aseq[ 4 ] = "0";
            }
            this.misc[ "esGoal" ] = Earthdawn.parseInt2( needed ) + aseq.length - 6;
            this.misc[ "esStart" ] = Earthdawn.parseInt2( aseq [ 4 ] );
            this.misc[ "woveTip" ] = needed + " base spell threads, plus " + (aseq.length - 6).toString() + " Extra threads." ;
            this.TokenSet( "clear", "SustainedSequence", aseq.toString() );

            ssa[ 2 ] = "Weave2";
            this.misc[ "Spell" ] = ssa;
            this.Roll( [ "Roll" ] );
          } break;
          case "Weave2": {      // Roll calls back to here.
            let lines = [];
            let esDone = this.misc[ "esStart" ] + (( "succBy" in this.misc ) ? 1 : 0 ) + (( "extraSucc" in this.misc ) ? this.misc[ "extraSucc" ] : 0 );
            lines.push( "<b>Wove:</b> " + esDone + " of " + Earthdawn.texttip( this.misc[ "esGoal" ] + " threads.", this.misc[ "woveTip" ] ));

            let aseq = this.TokenGet( "SustainedSequence", true ).split( "," );
            aseq [ 4 ] = esDone;
            aseq [ 3 ] = ( aseq[ 4 ] < this.misc[ "esGoal" ]) ? "1" : "2" ;
            this.TokenSet( "clear", "SustainedSequence", aseq.toString() );
            return lines;
          }
          case "Cast": {
            this.misc[ "headcolor" ] = "action";
            this.bFlags |= Earthdawn.flags.NoOppMnvr;
            this.misc[ "reason" ] = Earthdawn.getAttrBN( this.charID, pre + (!bGrim ? "Contains" : "Name" ), "") + " Spellcasting Test";
            this.Lookup( 1, [ "value", "SP-Spellcasting-Step", ssa[ 3 ]  ] );
      // redo karma control
            this.Karma( "SP-Spellcasting-Karma-Control", 0 );
            if( bGrim )
              this.misc[ "grimCast" ] = true;   // This is a spell being cast from a grimoire.  It counts as one extra success.

            let seq = this.TokenGet( "SustainedSequence", true );
            if( !seq ) {
              this.chat( "Error! Need to have started a new Casting. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiWarning );
              return;
            }
            let aseq = seq.split( "," );
            if ( aseq[ 0 ] !== "Cast" ) {
              this.chat( "Error! Spell Casting may only be selected after starting a new Casting. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiWarning );
              return;
            } else if( ssa[ 1 ] !== aseq[ 2 ] ) {
              this.chat( "Error! Trying to cast: " + Earthdawn.getAttrBN( this.charID, pre + (!bGrim ? "Contains" : "Name"), "" )
                  + " but the last spell started was: "
                  + Earthdawn.getAttrBN( this.charID,  Earthdawn.buildPre(( aseq[1] == "G" ? "SP" : "SPM"), aseq[ 2 ] )
                  + (aseq[1] == "G" ? "Name" : "Contains"), "") + ".", Earthdawn.whoFrom.apiWarning );
              return;
            } else if( (Earthdawn.getAttrBN( this.charID, pre + "sThreads", "0", true) + aseq.length - 6) > (bGrim
                      ? 0 : Earthdawn.getAttrBN( this.charID, pre + "mThreads", "0", true)))  // We can skip this test is threads are not needed.
              if( aseq [ 3 ] != "2" )
                this.misc[ "warnMsg" ] = "Note: Have you pulled all the threads you need? Only " + aseq [ 4 ] + " of "
                      + (Earthdawn.getAttrBN( this.charID, pre + "sThreads", "0", true) + aseq.length - 6) + " done.";
            let fx = Earthdawn.getAttrBN( this.charID, pre + "FX", "");
            if( fx && ( fx.startsWith( "Attempt" ) || fx.startsWith( "Success")))
              this.misc[ "FX" ] = fx;
            this.misc[ "succMsg" ] = Earthdawn.getAttrBN( this.charID, pre + "SuccessText", "");
            this.misc[ "sayTotalSuccess" ] = Earthdawn.getAttrBN( this.charID, pre + "sayTotalSuccess", "0" ) == "1";
            ssa[ 2 ] = "Cast2";
            this.misc[ "Spell" ] = ssa;
            this.Roll( [ "Roll" ] );
          } break;
          case "Cast2": {       // Roll calls back to here.
            let lines = [];
            let po = this;
            let aseq = this.TokenGet( "SustainedSequence", true ).split( "," );
            aseq [ 3 ] = ( "succBy" in this.misc ) ? "4" : "3";
            let bonus = Earthdawn.getAttrBN( this.charID, pre + "SuccessLevels", "None" ) + "," + (bGrim ? "x" : Earthdawn.getAttrBN( this.charID, pre + "EnhThread", "0" ));
            let abonus = bonus.split( "," ).concat( aseq.slice( 6 ) ).filter( function (condition) { return condition && condition != "x" });
            let bbonus = abonus;
            let rank = Earthdawn.getAttrBN( this.charID, "SP-Spellcasting-Effective-Rank", "0" );

            let es = ( "extraSucc" in this.misc ) ? this.misc[ "extraSucc" ] : 0;
            if( !es )
              bbonus = _.without( bbonus, abonus[ 0 ] );

            function extra( lbl, txtvar, lookup, def ) {      // Write out spell information, possibly modified by extra successes.
              'use strict';
              let t1 = (txtvar ? ((lookup === null) ? txtvar : Earthdawn.getAttrBN( po.charID, pre + txtvar, def ).toString()) : ""),
                incDur = false,
                inc = 0,
                saved = "",
                t3 = "";
              let txt = t1 ? t1 : "";
              if( lookup )
                for( let i = (es ? 0 : 1); i < abonus.length; ++i )   // If we don't have any extra successes, then we don't process the first value.
                  if( abonus[ i ].indexOf( lookup ) > -1 ) {
                    if( abonus[ i ].indexOf( "Inc Dur (min)" ) != -1) {
                      incDur = true;
                      bbonus = _.without( bbonus, abonus[ i ] );
                      continue;
                    }
                    let i1 = abonus[ i ].indexOf( "(" );
                    if( i1 != -1 ) {
                      let i2 = abonus[ i ].indexOf( ")", i1 +1 );
                      if( i2 != -1 && !_.isNaN( abonus[ i ].slice( i1+1, i2)))
                        inc += Earthdawn.parseInt2(abonus[ i ].slice( i1+1, i2)) * (( i == 0 && es > 0 ) ? es : 1 );
                      let i3 = i1+1;
                      let number = new RegExp( /[\s\d+-]/ );
                      while ( number.test(abonus[i].charAt( i3 )) )
                        ++i3;
                      if((i2 - i3) > saved.length )
                        saved = abonus[ i ].slice( i3, i2 );
                    }
                    t3 += " " + (( i == 0 && es > 1 ) ? es.toString() + " x " : "+" ) + abonus[i];
                    bbonus = _.without( bbonus, abonus[ i ] );
                  }

              if( txt.length > 0 || t3.length > 1) {
                txt = txt.replace( /Rank/g, "Rank(" + rank + ")");
                t3  = t3.replace( /Rank/g, "Rank(" + rank + ")");
                if( incDur ) {
                  txt = txt.replace( /Rnd/g, "Min" );
                  t3 = t3.replace( /Rnd/g, "Min" ) + " Inc Dur (min)";
                }
                lines.push( "<b>" + lbl + "</b> " + (inc ? Earthdawn.texttip( txt + " + " + inc.toString() + (saved ? " " + saved : ""), t3) : txt + " " + t3));
              }
              return inc;
            } // End function extra()
            extra( "Range", "Range", "Inc Rng", "" );
            let x3 = Earthdawn.getAttrBN( po.charID, pre + "AoE", " " );
            if( x3 && x3 != "x" && x3 != " " )
              extra( "AoE", "AoE", "Inc Area", " " );
            extra( "Duration", "Duration", "Inc Dur", "" );
            let x4 = Earthdawn.getAttrBN( po.charID, pre + "WilSelect", "" );
            if( x4 && x4 !== "None") {
              aseq[ 5 ] = extra( "Will Effect " + x4 + " +", "WilEffect", "Inc Efct Step", "0" );
              let x2 = Earthdawn.getAttrBN( this.charID, pre + "EffectArmor", "N/A" );
              if( x2 && x2 != "N/A" )
                lines[ lines.length - 1 ] += " " + x2;
            }
            extra( "Effect" , "Effect", "Inc Efct (Other)", "" );
            if( bbonus.length > 0 )
              extra( "Extra Threads", bbonus.toString(), null );

            this.TokenSet( "clear", "SustainedSequence", aseq.toString() );
            return lines;
          }
          case "Effect": {    // Spell Will Effect test.
            let seq = this.TokenGet( "SustainedSequence", true ),
              po = this;
            if( !seq ) {
              this.chat( "Error! Need to have started a new Casting. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiWarning );
              return;
            }
            let aseq = seq.split( "," );
            if ( aseq[ 0 ] !== "Cast" ) {
              this.chat( "Error! Effect tests may only be selected after casting a spell. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiWarning );
              return;
            } else if( ssa[ 1 ] !== aseq[ 2 ] ) {
              this.chat( "Error! Trying to roll a will effect for: " + Earthdawn.getAttrBN( this.charID, pre + (!bGrim ? "Contains" : "Name"), "")
                    + " but the last spell started was: "
                    + Earthdawn.getAttrBN( this.charID,  Earthdawn.buildPre(( aseq[1] == "G" ? "SP" : "SPM"), aseq[ 2 ] ) + (aseq[1] == "G" ? "Name" : "Contains"), "") + ".", Earthdawn.whoFrom.apiWarning );
              return;
            } else if( aseq [ 3 ] == "5" )
              this.misc[ "warnMsg" ] = "Warning: A Will Effect Test has already been rolled.";
            else if( aseq [ 3 ] != "4" )
              this.misc[ "warnMsg" ] = "Warning: The last thing you did was not to successfully cast the spell.";

            this.misc[ "headcolor" ] = "effect";
            if (Earthdawn.getAttrBN( this.charID, "SP-Willforce-Use", "0") == "1") {
      // redi karma
              this.doLater += "~Karma: kcdef: -1: SP-WilEffect-Karma-Control: kcdef: 0: SP-Willforce-Karma-Control" + "~Strain: 1";
              this.misc[ "reason" ] = Earthdawn.getAttrBN( this.charID, pre + (!bGrim ? "Contains" : "Name"), "") + " WillForce Effect";
            } else {
              this.doLater += "~Karma: kcdef: -1: SP-WilEffect-Karma-Control";
              this.misc[ "reason" ] = Earthdawn.getAttrBN( this.charID, pre + (!bGrim ? "Contains" : "Name"), "") + " Will Effect";
            }
            let fx = Earthdawn.getAttrBN( this.charID, pre + "FX", "");
            if( fx && fx.startsWith( "Effect" ))
              this.misc[ "FX" ] = fx;
            this.Parse( "armortype: " + Earthdawn.getAttrBN( this.charID, pre + "EffectArmor", "N/A") );
            this.bFlags |= Earthdawn.flags.WillEffect;
            let t2 = Earthdawn.parseInt2( Earthdawn.getAttrBN( this.charID, "Will-Effect", 5)) - Earthdawn.parseInt2(Earthdawn.getAttrBN( this.charID, "Will-Eff-Mods", 0));    // This is generic willpower / willforce.  Note: we get it here since it already has willforce added in. We just have to subtract out it's own specific mods.
                      // This used to be WIL effect.   Now it is WIL effect, or spellcasting rank effect, or circle effect.
            switch( Earthdawn.getAttrBN( this.charID, pre + "WilSelect", "None") ) {
              case "Circle":    let tmp;
                if( bGrim )
                  tmp = Earthdawn.getAttrBN( this.charID, pre + "Discipline", "80");    // Discipline Code, such as 16.3 for Wizardry.
                else
                  tmp = Earthdawn.getAttrBN( this.charID, Earthdawn.buildPre( "SP", Earthdawn.getAttrBN( this.charID, pre + "spRowID" )) + "Discipline", "80");
                          // go through all attributes for this character and look for DSP entries.
                let attributes = findObjs({ _type: "attribute", _characterid: this.charID }),
                  exact = 0, creature = 0;
                _.each( attributes, function (att) {
                  if ( att.get("name").endsWith( "_DSP_Code" )) {
                    let t = att.get( "current" ),
                      c = Earthdawn.getAttrBN( po.charID, att.get( "name").slice( 0, -5) + "_Circle", "0", true );
                    if( t === tmp && c > exact)
                      exact = c;
                    else if ( Earthdawn.parseInt2( t ) > 87 && c > creature)
                      creature = c;
                  }
                }); // End for each attribute.
                t2 += Earthdawn.parseInt2( exact ? exact : creature ) - Earthdawn.getAttrBN( this.charID, "Wil-Effect", "5");
                break;
              case "Rank":  t2 += Earthdawn.getAttrBN( this.charID, "SP-Spellcasting-Effective-Rank", "0", true );   // falls through on purpose. This is +rank, minus wil
              case "None":  t2 -= Earthdawn.getAttrBN( this.charID, "Wil-Effect", "5");     // falls through on purpose, this is -wil
              case "Wil":     // This is normal Wil effect.
              default:
                break;
            } // end switch wil effect
            this.Lookup( 1, [ "value", pre + "WilEffect", t2.toString(), ssa[ 3 ], aseq[ 5 ]  ] );      // Add in the spells will effect, the modifiers passed, plus any additions from the casting.
            aseq[ 3 ] = "5";
            this.TokenSet( "clear", "SustainedSequence", aseq.toString() );
            this.ForEachHit( [ "Roll" ] );
          } break;
        } // end switch main.
      } catch(err) { this.edClass.errorLog( "ED.Spell() error caught: " + err ); }
    } // End ParseObj.SpellOld( ssa )



            // ParseObj.TargetCalc()
            // get or calculate the target number for an upcoming roll.
    this.TargetCalc = function( targetID, flags )  {
      'use strict';
      let ret, val = 0, po = this;
      try {
        let TokObj = getObj("graphic", targetID.trim() );
        if (typeof TokObj != 'undefined' ) {
          let cID = TokObj.get("represents");     // cID is TARGET character id.

          function getDefs( what, what2 ) {
            val = po.getValue( ((flags & Earthdawn.flagsTarget.Natural) ? what + "-Nat" : what), cID);
                    // If the target is NOT blindsided (in which case we already have the blindsided value),
                    // but the current sheet IS blindsiding, need to figure out the targets blindsided value.
            if ((Earthdawn.getAttrBN( cID, "condition-Blindsided", "0") != "1" ) && (Earthdawn.getAttrBN( po.charID, "condition-Blindsiding", "0") == "1" )) {
              val -= 2;
              if (Earthdawn.getAttrBN( cID, "combatOption-DefensiveStance", "0") == "1" )
                val -= 3; // remove the Defensive stance bonus target had.
              if ( !(flags & Earthdawn.flagsTarget.Natural)     // remove any bonus attached to shield target had.
                  && (state.Earthdawn.g1879 || (state.Earthdawn.gED && state.Earthdawn.edition == 4))
                  && Earthdawn.getAttrBN( cID, "condition-NoShield", "0") != "1" )
                val -= Earthdawn.parseInt2( Earthdawn.getAttrBN( cID, "Shield-" + what2, 0)) + Earthdawn.parseInt2( Earthdawn.getAttrBN( cID, what + "-ShieldBuff", 0))
          } }

          if( cID ) {
            if( flags & Earthdawn.flagsTarget.PD )
              getDefs( "PD", "Phys" );
            else if( flags & Earthdawn.flagsTarget.MD )
              getDefs( "MD", "Myst" );
            else if( flags & Earthdawn.flagsTarget.SD ) {
              val = this.getValue( "SD", cID);
              let x = this.getValue( "Creature-Willful", cID);
              if( x )
                this.misc[ "Willful" ] = x;
            }
            if( flags & Earthdawn.flagsTarget.P1pt)
              val += this.targetIDs.length - 1;
            if( this.charID && Earthdawn.getAttrBN( this.charID, "condition-TargetPartialCover", "0") == "1"
                    && Earthdawn.getAttrBN( cID, "condition-Cover", "0") == "0")
              val += 2;   // Get bonus for target token being marked as having Cover, or attacking token being marked as target having Cover, not both.
            val += Earthdawn.parseInt2( Earthdawn.getAttrBN( this.charID, "Adjust-TN-Total", "0" ));    // If this character has a condition which causes it's target numbers to be adjusted.
                        ret = { val: val, name: TokObj.get( "name")};
          }
        } // end TokenObj defined
      } catch(err) { this.edClass.errorLog( "ED.TargetCalc() error caught: " + err ); }
      return ret;
    } // End ParseObj.TargetCalc()



    // Note: This is starting to look like spaghetti code. Here is a key.
    //
    // A command of the form
    //      !Earthdawn~ TargetSet : -KLOmKZ3zS2jc8XDKu3r
    // will cause a note to be attached to a token (TokenSet( "TargetList")) that all actions should use this target.
    //
    // When a command comes in of the form
    //      !Earthdawn~ charID: -JvAdIYpXgVyt2yd07hv~ Target: PD~ foreach~ Action: T: -KEW6yCLJjtZiAxEfE4n: 0
    // If a target has been set for the token, it will use that target.
    // Note that Target just sets bFlags, and ForEachTarget reads and sets targetID.
    // Otherwise it will generate a button which will generate a  command of the form
    //      !Earthdawn~ TargetSet : -KLOmKTy5HOb6qHm-SXK~ TargetType: PD~ TokenList: -KMgp4hXFfF86s6ZcJJe~  Action: T: -KEW6yCLJjtZiAxEfE4n: 0
    //
    // Also:
    // The above procedure allows user to specify the number of targets at runtime. However it makes it a two button process:
    // First: press the "use talent" token action, then press the "one target" button, and then finally press the target.
    // If the talent ALWAYS has one target, then a step can be saved by specifying it in target type. Then when
    // the user presses the "use talent" token action, it immediately asks what the (singular) target is)
    // Unfortunately, some weird stuff has to go on behind the scenes to allow this to work.
    // When we get a command of the form
    //      !Earthdawn~ charID: -JvAdIYpXgVyt2yd07hv~ Target: PD1: (targetID)~ foreach~ Action: T: -KEW6yCLJjtZiAxEfE4n: 0
    // (Note that instead of PD, we got PD1, and we also got a target ID)
    // then instead of processing as above, we use the information here to make two other commands and insert them into the
    // command queue at appropriate places. These new commands will be processed as normal. The revised command would look like this.
    //      !Earthdawn~ charID: -JvAdIYpXgVyt2yd07hv~ Target: PD1: (targetID)~ TargetType: PD~ TargetSet: (targetID)~ Action: T: -KEW6yCLJjtZiAxEfE4n: 0
    // Note also that when this happens, due to a design flaw in Roll20, we probably will not know which token actually was the current token.

// Normal action command.
// !edToken~ !Earthdawn~ charID: -JvAdIYpXgVyt2yd07hv~ Target: Ask: 11~ foreach~ Action: T: 1: 0
// Normal PD command. Part 1.
// !edToken~ !Earthdawn~ charID: -JvAdIYpXgVyt2yd07hv~ Target: PD~ foreach~ Action: T: -KEW6yCLJjtZiAxEfE4n: 0
// Normal PD command. Part 2.
// ["!Earthdawn","TargetType: PD","TokenList: -KMgp4hXFfF86s6ZcJJe","TargetSet : -KLOmKTy5HOb6qHm-SXK","Action: T: -KEW6yCLJjtZiAxEfE4n: 0"]

// Set target command. Part 1
// !Earthdawn~ charID: -JvAdIYpXgVyt2yd07hv~ Target: Set
// Set target command. Part 2, after resort.
// ["!Earthdawn","TargetType: Set","TokenList: -KMgp4hXFfF86s6ZcJJe","TargetSet : -KLOmKTy5HOb6qHm-SXK"]


          // ParseObj.TargetT()
          // get or calculate the target number for an upcoming roll.
          // This is the first threads routine. It will generate a chat command which will call TokenList()
          //  ssa:
          //      None
          //      Ask: (number)       // Note: Ask is optional. If ssa[1] is a number it will just use that.
          //      PD:  (or MD or SD)
          //      Ask: PD (or MD or SD): +/-(number)    // This is not a combo of the other two. PD is ACTING tokens PD, not a TARGET token. if a normal non-zero integer is entered after it, it replaces and overwrites the PD based target number, the modifier number only modifies the target number if it starts with a plus or a minus sign.
          // Note: if this turns out to be a problem later, can easily change this to something other than "Ask".
    this.TargetT = function( ssa )  {
      'use strict';
      try {
        let flg, oneTarg;
        if( ssa.length > 1) {
          if( !isNaN( ssa[ 1 ]))
            this.targetNum = this.ssaMods( ssa );
          else {
            var tType = ssa[ 1 ];
            switch( tType.slice(0,2).toLowerCase() ) {
              case "no":  // none
                break;
              case "as":  // ask
                this.targetNum = this.ssaMods( ssa, 2, 1);
                this.bFlags |= Earthdawn.flagsTarget.Ask;
                break;
              case "ri":  // Riposte
                this.bFlags |= this.TargetTypeToFlags( ssa[ 3 ] ) | Earthdawn.flagsTarget.Riposte;
                            this.targetNum = this.ssaMods( ssa, 3, 1);
                let tar2 = this.TargetCalc( ssa[ 2 ], this.bFlags );
                this.misc[ "targetNum2" ] = tar2[ "val" ];    // The 2nd target number, of the PD of the counterattack target.
                break;
              case "pd":
              case "md":
              case "sd":
                flg = 1;
                if( tType.length === 3 && tType.endsWith( "1" ) && ssa.length > 2 && ssa[ 2 ].length > 0 )
                  oneTarg = true;
                break;
              case "se":  // Set
                flg = 2;
                break;
              default:
                this.chat( "Error! ED.TargetT() unknown target type '"+ tType +"'. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError);
        } } }
        if( oneTarg === true ) {      // we are not going to process this command as is.  Instead we are going to make new commands and insert them into the command line.
                          // See Notes at the top of the routine.
          this.edClass.msgArray.splice( this.indexMsg + 1, 0, "TargetType: " + ssa[ 1 ].slice(0, -1) );   // TargetType is what was passed to us, with the trailing "1" stripped off.
          let r = this.indexMsg + 3;  // default is three steps from current.
          if( ssa.length > 3 && ssa[ 3 ] ) {
            ++r;
            this.edClass.msgArray.splice( this.indexMsg + 3, 0, "Tokenlist: " + ssa[ 3 ] );
          }
          for( var i = this.indexMsg + 2; i < this.edClass.msgArray.length; ++i )
            if( this.edClass.msgArray[ i ].slice(0,10).toLowerCase().indexOf( "foreach" ) != -1 ) {     // If there was a foreach, replace it.
              this.edClass.msgArray.splice( i, 1, "TargetSet: " + ssa[ 2 ] );     // Target ID was also passed.
              i = 99;
            }
          if( i < 99 )
            this.edClass.msgArray.splice( r, 0, "Tokenlist: " + ssa[ 3 ], "TargetSet: " + ssa[ 2 ] );     // Target ID was also passed.
        } else if( flg !== undefined ) {
          let s = this.ForEachToken( ["ForEach", "Status", "TargetList"]);
          if( s === undefined)
            this.bFlags |= this.TargetTypeToFlags( tType );
          else {
            if( s && flg === 1 )            // There are already targets assigned to at least one of these tokens.
              this.bFlags |= this.TargetTypeToFlags( tType );
            else {
              let v,
                t = "";
              if( this.tokenIDs.length === 0 )
                v = Earthdawn.colonFix( "!Earthdawn~ TargetType: " + tType + "~ charID: " + this.charID );    // There are no selected tokens, just pass the charID.
              else
                v = Earthdawn.colonFix( "!Earthdawn~ TargetType: " + tType + "~ TokenList: " + this.tokenIDs.join( ":" ) );
              while ( ++this.indexMsg < this.edClass.msgArray.length )        // Note that this will cause this thread to end with this routine.
                if( !(this.edClass.msgArray[ this.indexMsg ].trim().toLowerCase().startsWith( "foreach" )))
                  t += Earthdawn.colonFix( "~ " + this.edClass.msgArray[ this.indexMsg ].trim() );
              s = "&{template:default} {{name=How many targets?  ";
              let a = [ "", "First", "Second", "Third", "Forth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth" ];
              for( let j = 1; j < 11; ++j ) {
                s += "[" + j.toString() + "](" + v + "~ TargetSet";
                for( let k = 1; k <= j; ++k )
                  s += Earthdawn.constant( "Colon" ) + Earthdawn.constant( "at" ) + Earthdawn.constant( "braceOpen" ) + "target"
                        + Earthdawn.constant( "pipe" ) + a[k] + " Target" + Earthdawn.constant( "pipe" ) + "token_id" + Earthdawn.constant( "braceClose" );
//                  s += Earthdawn.colonFix( ": &#64;{target|" + a[k] + " Target|token_id}");
                s += t + ")";
              }
              s += "}}";
              this.chat( s, Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive );
            }
            this.targetNum += this.ssaMods( ssa, 2) || 0;
        } }
      } catch(err) { this.edClass.errorLog( "ED.TargetT() error caught: " + err ); }
      return;
    } // End ParseObj.TargetT()



              // ParseObj.TargetTypeToFlags()
              //
              // Passed a Target Type (PD, PDh, PDHp1p, PD-Nat, etc)
              // Return the bFlags values corresponding to this target type.
    this.TargetTypeToFlags = function( tType ) {
    'use strict';
      let ret = 0;
      try {
        let tmp = tType.trim().toLowerCase();
        switch ( tmp.slice( 0, 2)) {
          case "no":      break;      // None
          case "se":      ret |= Earthdawn.flagsTarget.Set;     break;
          case "pd":      ret |= Earthdawn.flagsTarget.PD;      break;
          case "md":      ret |= Earthdawn.flagsTarget.MD;      break;
          case "sd":      ret |= Earthdawn.flagsTarget.SD;      break;
          default:        this.chat( "Failed to parse TargetType: '" + tmp + "' in msg: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError );
        }
        if( ret & Earthdawn.flagsTarget.Mask ) {        // Do this only if found a valid string above.
          if( tmp.slice( 2, 3) === "h")
            ret |= Earthdawn.flagsTarget.Highest;
          if( tmp.endsWith( "p1p"))
            ret |= Earthdawn.flagsTarget.P1pt;
          if( tmp.indexOf( "-nat" ) > -1)
            ret |= Earthdawn.flagsTarget.Natural;
        }
      } catch(err) { this.edClass.errorLog( "ED.TargetTypeToFlags() error caught: " + err ); }
      return ret;
    } // End ParseObj.TargetTypeToFlags()



            // ParseObj.TokenActionToggle ()
            //
            //  We have a token action that can be ether set to turn on, turn off, or not appear at all. Set the correct token action name.
            //      lu: karma or SP-Willforce-Use (lowercased)
            //      show: true or false to show button
    this.TokenActionToggle = function( lu, show )  {
      'use strict';
      try {
        let name;
        let actn = "!edToken~ !Earthdawn~ ForEach~ marker: " + lu + ":t";
        if (lu === "willforce")
          name = Earthdawn.constant( "Spell" ) + "WilFrc-T"
        if( name != undefined ) {
          if( !show )
            Earthdawn.abilityRemove( this.charID, name );
          if( show )
            Earthdawn.abilityAdd( this.charID, name, actn)
        }
      } catch(err) { this.edClass.errorLog( "ParseObj.TokenActionToggle() error caught: " + err ); }
    } // End ParseObj.TokenActionToggle()




          // ParseObj.textImport()
          // Copy / Paste a large chunk of text in and have it parsed.
          //
          // TextImport: Creature: (text)
          // TextImport: Mask: Add: (text)
          // TextImport: Mask: Remove: (name)     // This is called from a chat button
          // TextImport: T:   (RowID): (text)
          // TextImport: SK:  (RowID): (text)
          // TextImport: NAC: (RowID): (text)
          // TextImport: SP:  (RowID): (text)
          //
          // Note: Originally this was setup to be called from the parse routine, but text blocks that come in via text queries
          // always have all [lf][cr] replaced by a single space. Thus beginning and end of lines and line lengths are undetectable.
          // So now, if a text block is pasted into certain text areas on the character sheet, the "attribute()" routine will
          // call this directly and we will get newline characters (which certain areas of the code now expect).
          // One unfortunate side affect of this is that this routine, almost uniquely, is not called in response to a chat msg,
          // so msg.whofrom is not available.
          //
    this.textImport = function( ssa ) {
      'use strict';
      try {
        let po = this,
          fullText = ssa[ ssa.length -1 ].trim() + " ",     // full text passed is always in the last parameter. (except Mask remove, and that is OK. )
          followup = "",
          locTextStart = 0,
          strRating = -1,
          srUsed = 0,
          save = {},    // keep some values between sections.
          block, blockOffset = 0, blockIndexArray = [];

        if( state.Earthdawn.logCommandline ) {
          log( "textImport: " );
          log( ssa.join().replace( /\n/g, "\\n" ));
        }


            // When pasting from a pdf, you also get page numbers and chapter titles.
            // Page number is a line with nothing but whitespace and digits.
            // With a page header, the line following a page number might be entirely upper case.
            // Strip all such, but write warning if stripping a suspected header.
            //
            // This operates on section variable fullText.
        function removePageNumbers() {
          'use strict';
          let eol = fullText.length,
            prev = eol,
            i = fullText.lastIndexOf( '\n', eol -1 );
          while (i !== -1) {
                  //  Note: In questors sometimes get something that looks like   "\n~Colm\n"   for no good reason I see. Strip it out.
            if( fullText.slice( i, eol ).match( /^\s*(\d+|\SCol\S)\s*$/ ) ) {
              let x = fullText.slice( eol, prev ).match( /^[A-Z\s]+$/ );
              if( x ) {
                po.chat( "Warning. Stripped out string '" + x[0].trim() + "' because it looked like a chapter heading across a page break. If not, you probably ought to add it back in again manually.", Earthdawn.whoFrom.apiWarning );
                fullText = fullText.slice( 0, i) + fullText.slice( prev );    // Page Number and Page Header. Strip the current line and the next.
              } else
                fullText = fullText.slice( 0, i) + fullText.slice( eol );   // Page Number only. Strip the current line out.
            }
            prev = eol;
            eol = i;
            i = fullText.lastIndexOf( '\n', i -1 );
          }
        } // end removePageNumbers


            // This operates on section variables fullText and name.
        function getName () {   // Name needs to be alone on first line.
          'use strict';
          let i = fullText.indexOf( '\n' );
          locTextStart = i + 1;
          return fullText.slice( 0, i).trim().replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        } // end getName



            // Try to figure out where the paragraphs really end.
            // We are passed a text block with an end-of-line character wherever the pdf chose to put one.
            // Return the text, with all eol characters removed, except where we think a paragraph actually ends.
            // This would be when a newline is found between a punctuation mark and a Capital, and the line is shorter than the others.
            //
            // Note: This does not work very well, because the PDF sometimes has hard newlines, and sometimes does not! It is probably better than nothing!
            // Explore not doing the 95% test, and just keeping all the candidates.
            //
            // This routine is self-contained and does not operate on section variables.
        function textBlock( tBlock, liberal ) {
          'use strict';
          if( typeof tBlock !== 'string' ) {
            po.edClass.errorLog( "ED.textImport.textBlock: Bad Value" );
            log( tBlock);
            return;
          }
                // So if we find a newline that we are going to keep, and then a line that starts with a capital letter and has 4 or less words before the next newline, and then a Capital letter, keep the 2nd newline as well.
          let nlnew = 0, ind = [ 0 ], ma;
          if ( liberal )
            ma = tBlock.match( /[\\.\\?\\!\\)\\:\\;]\s*\n\s*[A-Z]/g );    // As below, but also accept an end paran, end bracket, colon, or semi-colon.
          else
            ma = tBlock.match( /[\\.\\?\\!]\s*\n\s*[A-Z]/g );       // All occurrences of, a punctuation mark, a newline, and then a capital letter.
          let mb = tBlock.match( /(^|\n)\s*[A-Z]\s*(\w+\b\W*){1,4}\s*(?=(\n\s*[A-Z]|$))/g ),    // For some reason lines "Immune to (Fear or whatever)" don't end with punctuation.  newline Capital one to four words a newline and a capital.
            mc = tBlock.match( /(^|\n)\s*(Fury|Resist Pain|Willful|Ambush|Dive|Charge)\s*\(.*?\)\s*(?=(\s*\n|$))/gi ),    // start of line, certain words, start and ending paren and everything inside, than another newline, keep both newlines.
            md = tBlock.match(  /(^|\n)\s*Enhanced Sense\s*(.*?\b){1,6}\s*(?=(\n\s*[A-Z]|$))/g );

                // we don't want to keep a \n inside a (), [], or {}.
                // if a backward search finds a ( before a ), and a forward search finds a ) before a (, then keep
          function inside( cr, opn, cls ) {
            'use strict';
            let opnloc = tBlock.lastIndexOf( opn, cr );
            if( opnloc === -1 ) return false;
            let clsloc = tBlock.lastIndexOf( cls, cr );
            if( clsloc === -1 || (clsloc < opnloc)) {
              clsloc = tBlock.indexOf( cls, cr );
              if( clsloc === -1 ) return false;
              opnloc = tBlock.indexOf( opn, cr );
              if( opnloc === -1 || clsloc < opnloc)
                return true;
            }
            return false;
          }
              // Find a list (ind) of newlines that we are going to keep.
              // flags bit 1, keep the newline at the front.    // flags bit 2, keep the newline at the end.
          function keep( m, flags ) {
            'use strict';
            if( !m ) return;
            let curr = -1;
            for (let i = 0; i < m.length; ++i ) {
              curr = tBlock.indexOf( m[ i ], curr + 1);
              if( curr !== -1 )
                if (!inside( curr, "(", ")" ) && !inside( curr, "[", "]" ) && !inside( curr, "{", "}" )) {
                  if( flags & 1 )
                    ind.push( tBlock.indexOf( "\n", curr -1));      // We want the first newline (for match ma it will be the 2nd character, for md and me it will be the first)
                  if( flags & 2) {
                    let t = tBlock.indexOf( "\n", curr +1);
                    if(( flags & 2) && (t !== -1))    // mb and mc only are kept if we already determined that the FIRST newline in the string is to be kept.
                      ind.push( t );      // for match mb, mc, md and me, we want the 2nd newline, so skip the first character (which is the first newline)
          } }   } }
          keep( mc, 3);
          keep( ma, 1);
          keep( mb, 2);   keep( md, 2);
          while( (nlnew = tBlock.indexOf( '\n', nlnew +1 )) !== -1) {       // Check every newline in tBlock
            if( ind.indexOf( nlnew ) === -1 )                 // ind array is list of newlines we want to KEEP.
              tBlock = tBlock.slice( 0, nlnew) + " " + tBlock.slice( nlnew +1 );    // replace all \n that are not where we think the paragraph ends with space.
          }
//log( tBlock);
          return tBlock;
        } // end textBlock



            // we might have a number, or we might have a number in the form of 5+SR.    (Spirit Strength Rating)
            // if have SR, then add in strRating, which is section global.
            // Also check for and process attributes: Dex, Str, etc.
        function getSR( orig ) {
          'use strict';
          let working = (( typeof orig === 'string' ) ? orig : orig.toString()).toUpperCase(),
            ret = 0,
            fnd = working.match( /[\+\-]*\d+/ );
          if( fnd ) {
            ret = Earthdawn.parseInt2( fnd[ 0 ] );
            working = working.replace( fnd[ 0 ], "");
          }
          function sub( txt, num) {
          'use strict';
            let fnd2 = working.match( new RegExp( "[\+\-]*\s*" + txt + "\s*", "gi" ) );
            if( fnd2 ) {
//log( "getSR "+ orig +" sub " + txt);
//log( fnd2);
              num = Earthdawn.parseInt2( num );
              ret += (fnd2[ 0 ].indexOf( "-") == -1) ? num : 0 - num;
              working = working.replace( fnd2[ 0 ], "");
              if( txt === "SR" ) ++srUsed;
//log( ret);
          } }
          sub( "SR", strRating);      sub( "DEX", save[ "dex" ]);   sub( "STR", save[ "str" ]);   sub( "TOU", save[ "tou" ]);
          sub( "PER", save[ "per" ]);   sub( "WIL", save[ "wil" ]);   sub( "CHA", save[ "cha" ]);
//log( "getSR " + orig + "  ret " + ret);
          return ret;
        }



            // Find all the expected Labels in the block of text.
            // Find toFind, and save it's index.
            // This operates upon section variables block and blockIndexArray
        function blockIndex( toFind, newline ) {
          'use strict';
          let x = findToken( toFind, newline );
          if( x > -1) {
            if( newline )     // If we insisted toFind be the first thing after a newline, find the first non-whitespace character as the real start.
              while( /\s/.test( block.charAt( x )) )
                ++x;
            blockIndexArray.push( {name: toFind, index: x + blockOffset});
        } }


            // return indexOf toFind within block.
            // This routine uses the section variable block, which must be set before this is called.
            // if newline is true, then the text toLine must immediately be preceded by a newline or at least three spaces (indicating it is the start of a column).
        function findToken( toFind, newline ) {
          'use strict';
          let tf = (newline ? "(\\n\\s*|\\s{3,})" : "") + toFind.replace( /\s+/g, "\\s*" ) + "\\s*:\\s*";    // rationalize all whitespace.
          let fnd = block.search( new RegExp( tf, "gi" ) );
          if( fnd != -1)
            return fnd;
        }


            // Set an attribute, or add or subtract something from attribute. For example add 2 to Dex Step.
            // If what is zero, set the value, ignoring whatever current value is.
            // If what is -1 or 1, subtract or add val to the current value.
            // If what is "check" or "uncheck", set a checkbox.
            //
            // This routine is self contained and does not operate on section variables
        function modify( what, attrib, val) {
          'use strict';
          let aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: attrib }),
            newVal;
          switch(( typeof what === 'string' ) ? what.toLowerCase() : what ) {
            case "check":   newVal = "1";       break;
            case "uncheck":   newVal = "0";       break;
            case "field":
            case "val":
            case "word":    newVal = ( typeof val === 'string' ) ? val.trim() : val;    break;
            case "0":
            case 0:       newVal = Earthdawn.parseInt2( val);   break;
            case 1: case -1:  newVal = Earthdawn.parseInt2( aobj.get( "current" )) + (Earthdawn.parseInt2( val) * what );   break;
            default:      po.edClass.errorLog( "Earthdawn.textImport.Modify: Somehow got value of: " + what + "   attrib: " + attrib + "   val: " + val );
          }
// log("Modify "); log( attrib); log( newVal);
          Earthdawn.setWithWorker( aobj, "current", newVal );
                // In order to avoid race conditions in the sheetworkers, whenever we set an attribute step, we ALSO want to
                // calculate and set the attribute-orig value.
          if( [ "Dex-Step", "Str-Step", "Tou-Step", "Per-Step", "Wil-Step", "Cha-Step" ].includes( attrib )) {
            let base = attrib.slice(0, 3),
              orig = ((newVal - Earthdawn.getAttrBN( po.charID, base + "-Adjust", 0, true) -2) * 3) +2
                  - ( Earthdawn.getAttrBN( po.charID, "Attrib-" + base + "-Race", 10, true)
                  + Earthdawn.getAttrBN( po.charID, "Attrib-" + base + "-Increases", 0, true)
                  + Earthdawn.getAttrBN( po.charID, base + "-Adjust-attr", 0, true));
            po.setWW( "Attrib-" + base + "-Orig", orig );
          }
          return newVal;
        } // end modify()




            // statBlock
            // process a statBlock entry.
            // arrayIndex is the index of the blockIndexArray where we are currently processing.
            //    Grab everything between this index and the next and return it as ret[ "raw" ] Strip off the label and return everything as [ "field" ]
            //   If arrayIndex is a string, then don't do the lookup in block, instead do it upon the text passed here.
            // toFind:  Is the label that should start the index. We are looking for the values after this label.
            // attrib If attrib exists, then stuff whatever we find for ret[ "val" ] into a sheet attribute of the passed name.
            // cmd:   Tells us what/how to find the desired information.
            //    NoColon:  All fields are of type "Label: Information", except for these fields, there is no colon, it is "Label Information" with no colon.
            //    NoCut:    Don't cut the field out of block, leave block unchanged.
            //    Word:     ret[ "val" ] is to be the first "word" of non space characters.
            //    Val or Num: ret[ "val" ] is to be the first number it finds.
            //    otherwise,  there is no ret[ "val" ] and the system is interested in Field. .
            // mult tells modify if these things are being added (1), subtracted (-1) or set (0).

            // returns: a collection with the following members.
            //          raw:  The raw field (everything between this label and the next) including label.
            //          field:  raw, minus the label.
            //          val:  The data (number or word) we were told to look for.
            //          new:  New value of attrib, as returned by modify.
            //          remain: anything else that is not label or val. These are often secondary values that the program will be looking for.
            // Note: It is important that blockIndex() has found all the indexes and stored them correctly in blockIndexArray[].
            //    It is important that this routine be called in REVERSE index order IE: read and delete stuff from the back of the block to the front.

            // This operates on section variable block, which must have been set prior to calling this.
            // It modifies block, removing found items.
        function statBlock( arrayIndex, toFind, attrib, cmd, mult ) {
          'use strict';
          try {
            if( cmd === undefined ) cmd = "";
            let ret = {}, curr,
              noColon = cmd.search( /nocolon/i ) !== -1,
              word = cmd.search( /word/i ) !== -1,
              value = (cmd.search( /val/i ) !== -1) || (cmd.search( /num/i ) !== -1);

            if( typeof arrayIndex === 'number'  ) {
              curr = block.slice( blockIndexArray[ arrayIndex ]["index"] - blockOffset, blockIndexArray[ arrayIndex + 1 ]["index"] - blockOffset).trim();
              if (cmd.search( /nocut/i ) == -1)     // If this not here, then remove this field from block.
                block = block.slice( 0, blockIndexArray[ arrayIndex ]["index"] - blockOffset) + block.slice( blockIndexArray[ arrayIndex + 1 ]["index"] - blockOffset );
            }
            else if( typeof arrayIndex === 'string' )   // arrayIndex really holds the string to operate upon instead of block.
              curr = arrayIndex;
            else {
              log( "Earthdawn statBlock() bad parameter: typeof arrayIndex " + typeof arrayIndex );
              log( arrayIndex );
              return;
            }

            ret[ "raw" ] = curr.trim();
            let tf = toFind.replace( /\s+/g, "\\s*" ) + "\\s*" + (noColon ? "" : ":\\s*"),      // Look for toFind. Rationalize all whitespace. we usually look for a colon between the label and the value.
              fnd2;
            if( word || value )
              fnd2 = curr.match( new RegExp( tf + (word ? "[\\w\\+\\-]+\\s*" : "(\\+|\\-|\\d|SR|\\s)+\\s*"), "i" ));      // starting immediately after label one or more occurrences of plus, minus, the letters 'SR' and/or digits (+|-|\\d|SR)+, and zero or more whitespaces.
            if( fnd2 ) {      // We looked for and found a value.
              let fnd3 = fnd2[ 0 ].match( new RegExp( tf, "i" ));
              if( fnd3 ) {
                let c = fnd2[ 0 ].replace( fnd3[ 0 ], "" ).trim();
//log( "statBlock " + toFind + "   " + c);
                ret[ "field" ] = curr.replace( fnd2[ 0 ], c ).trim()
                ret[ "val" ] = word ? c : getSR( c );
              } else {
                log( "Earthdawn statBlock() data error.   Somehow did not find: " + tf + "     in " + fnd2[ 0 ] );
                log( "toFind: " + toFind + "   arrayIndex: " + arrayIndex + "   cmd: " + cmd + "   attrib: " + attrib + "   mult: " + mult );
              }
              ret[ "remain" ] = curr.replace( fnd2[ 0 ], "").trim();
            } else {    // We ether did not look for, or did not find a value. Let's just try for Field.
              let fnd = curr.match( new RegExp( tf, "gi" ));
              if( fnd )
                ret[ "field" ] = curr.replace( fnd[ 0 ], "").trim();      // strip off the label.
              else
                followup += "Warning! Failed to find Stat Block entry: " + toFind + ".\n";
              ret[ "remain" ] = ret[ "field" ] ? ret[ "field" ] : curr;
            }

            if( attrib )
              ret[ "new" ] = modify( value ? (mult || 0) : "Field", attrib, ("val" in ret ) ? ret[ "val" ] :
                    (("field" in ret) ? ret[ "field" ] : (( "raw" in ret)?  ret[ "raw"] : "" )));   // if have a val, use it. otherwise use what we have.
// log( "toFind: " + toFind + "   " + ret[ "raw" ]);
            return ret;
            } catch(err) {
              log( "Earthdawn statBlock() error caught: " + err );
              log( "toFind: " + toFind + "   arrayIndex: " + arrayIndex + "   cmd: " + cmd + "   attrib: " + attrib + "   mult: " + mult );
            }
        } // end statBlock()





              //
              // Start of textImport main routine processing section.
              //
        switch( ssa[ 1 ].toLowerCase().trim() ) {
          case "creature": {                      // TextImport: Creature: (text)
            removePageNumbers();
            po.setWW( "NPC", Earthdawn.charType.npc);
//            Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: "show-attribute-details" }, "0");
//            po.setWW( "show-release-notes", "0");
            let name = getName();
            blockOffset = locTextStart;
            block = fullText.slice( blockOffset ).trim();   // Everything but name.
            parseCreature( 0, name );
          } break;  // end Creature

          case "t":       // TextImport: T:   (RowID): (text)
          case "sk":      // TextImport: SK:  (RowID): (text)
          case "nac": {   // TextImport: NAC: (RowID): (text)
                  // This should handle any Talent, Skill, Knack, Devotion, or spell found in Earthdawn players, Earthdawn Companion,
                  // Earthdawn Questors, Earthdawn Mystic Paths, and 1879.
            let code = ssa[ 1 ],
              rowID = ssa[ 2],
              pre = Earthdawn.buildPre( code, rowID );
            Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "RowID" }, rowID);
            removePageNumbers();
            let name = getName();
            po.setWW( pre + "Name", name);
            po.addSWflag( "Trigger2", "AutoFill, " + pre + "Name" );
//            po.addSWflag( "Trigger", pre + "Name: " + name);
            blockOffset = locTextStart;
            block = fullText.slice( blockOffset ).trim();
            blockIndex( "Talent" );
            blockIndex( "Requirements" );
            blockIndex( "Restrictions" );
            blockIndex( "Step Number" );      // 1st Ed. 
            blockIndex( "Step" );
            blockIndex( "Default" );
            blockIndex( "Action" );
            blockIndex( "Requires Karma" );     // 1st Ed.
            blockIndex( "Karma" );
            blockIndex( "Strain" );
            blockIndex( "Skill Use" );
            blockIndex( "Devotion Required");
            blockIndex( "Cost" );
            blockIndex( "Discipline Talent Use" );      // 1st Ed
            blockIndex( "Tier" );
            blockIndexArray = _.sortBy( blockIndexArray, "index" );
            if( blockIndexArray.length < 1) {
              po.chat( "Warning, TextImport was not able to parse that at all", Earthdawn.whoFrom.apiWarning );
              return;
            }
            let end = block.indexOf( "\n", blockIndexArray[ blockIndexArray.length -1 ][ "index" ] + 2 - blockOffset );   // First newline after last stat block entry
              blockIndexArray.push( {name: "eof", index: end + blockOffset});
            block = block.slice( 0, end ).trim();   // block now just consists of our identified statblock.
            let afterBlock = block.replace( /\n/g, "   " );

            for( let i = blockIndexArray.length -2; i > -1; --i) {
              let tf = blockIndexArray[ i ][ "name"];
              switch( tf.toLowerCase() ) {
                case "action":            // It just gets the first word, so Sustained (10 minutes) is OK.      Action: Sustained
                  statBlock( i, tf, pre + "Action", "Word" );
                  break;
                case "cost":    // Earthdawn Skills       Cost: Novice
                  if( code == "SK" ) {
                    let x = statBlock( i, tf, null, "Word" );
                    po.setWW( pre + "Type", (state.Earthdawn.gED ? "" : "F1-") + x[ "val" ]);
                  } else
                    followup += "Warning, this appears to be a Skill, not a Talent.   ";
                  break;
                case "default":   // 1879     This is 1879 field saying if a skill is default-able. Just add it to afterBlock.
                  break;
                case "devotion required": {     // Questor Devotions      Devotions Required: Yes
                  let x = statBlock( i, tf, null, "Word" ), b;
                  if( x && "val" in x ) {
                    b = ( x[ "val" ].trim().slice(0, 1).toUpperCase() === "Y" );
                    po.setWW( pre + "DP-Req", b ? "1" : "0");
                  }
                  let bobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Type" }, "QD-Follower");
                  let y = bobj.get( "current" );
                  if( y && y.slice(0, 3) !== "QD-" )    // If not already set to questor devotion, set it.
                    bobj.setWithWorker( "current", "QD-Follower");
                  bobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "DP-Control" }, b ? "1" : "0");
                } break;
                case "discipline talent use":   // 1st Ed     This is a 1st Ed field saying the Talent is a Discipline Talent for certain Disciplines. Just add it to afterBlock.
                  break;
                case "requires karma":    // 1st Ed.
                case "karma": {           // 1879
                  let x = statBlock( i, tf, null, "Word" );
                  let y = x[ "val" ].toUpperCase();
                  if( y.indexOf( "Y" ) > -1 || y.indexOf( "Q" ) > -1) {   // Yes or Required
                    po.setWW( pre + "Karma-Req", "1");
//                    po.setWW( pre + "Karma-Control", "1");
// This needs update. CDD ToDo
                  }
                } break;
                case "requirements": {    // Knacks.              Requirements: Rank 3
                  let x = statBlock( i, tf ), rnk = 0;
                  let res = x[ "field" ].match( /\d+/ );
                  if( res !== null ) {
                    rnk = Earthdawn.parseInt2( res[ 0 ] );
                    po.setWW( "Requirements", rnk, 0);
                  }
                              // If this is a PC, post an accounting entry for them.
                  if( Earthdawn.getAttrBN( po.charID, "NPC", "0" ) == Earthdawn.charType.pc ) {
                    let tdate = Earthdawn.getAttrBN( po.charID, "record-date-throalic", "" ),     // First look on the current character sheet
                      today = new Date();
                    if( !tdate ) {
                      let party = findObjs({ _type: "character", name: "Party" })[0];
                      if( party !== undefined )     // Look for throalic date on the "Party" sheet.
                        tdate = Earthdawn.getAttrBN( party.get( "_id" ), "record-date-throalic", "" );
                    }
                    if( !tdate )
                      tdate = "1517-1-1";
                    let stem = "&{template:chatrecord} {{header=" + getAttrByName( po.charID, "charName" ) + ": " + name + "}}"
                        + "{{misclabel=Knack}}{{miscval=Rank " + rnk + "}}"
                        + "{{lp=" + (Earthdawn.fibonacci( rnk ) * 100) + "}}"
                        + "{{sp=" + (rnk * 50) + "}}"
                        + "{{time=" + rnk + " days}}"
                    let slink = "!Earthdawn~ charID: " + po.charID
                        + "~ Record: ?{Posting Date|" + today.getFullYear() + "-" + (today.getMonth() +1) + "-" + today.getDate()
                        + "}: ?{" + ( state.Earthdawn.gED ? "Throalic Date|" : "Game world Date|" ) + tdate
                        + "}: LP: ?{Legend Points to post|" + (Earthdawn.fibonacci( rnk ) * 100)
                        + "}: ?{Silver to post|" + (rnk * 50) + "}: Spend: "
                        + "?{Time| and " + rnk + " days.}   "
                        + "?{Reason|" + name + " Knack Rank " + rnk + "}";
                    sendChat( "API", Earthdawn.getAttrBN( po.charID, "playerWho", null ) + stem + "{{button1=[Press here](" + Earthdawn.colonFix( slink ) + ")}}", null, {noarchive:true});
                  }
                } break;
                case "restrictions":    // Knacks. Just paste it in.
                  statBlock( i, tf, pre + "Restrictions" );
                  break;
                case "step number":
                case "step": {
                  let x = statBlock( i, tf ), set = false;
                  let y = x[ "field" ].toUpperCase();
                  for( let i = 0; i < 6; ++i ) {
                    let z = [ "Dex", "Str", "Tou", "Per", "Wil", "Cha"][i];
                    if ( y.indexOf( z.toUpperCase()) !== -1) {
                      po.setWW( pre + "Attribute", z);
                      set = true;
                      break;
                  } }
                  if( !set )
                    po.setWW( pre + "Mod-Type", "(0)");     // If don't have an Attribute, then set Mod-Type to No Roll.
                } break;
                case "skill use": {       // Earthdawn Talents
                  let x = statBlock( i, tf );
                  if( code == "SK" )
                    if( x[ "field" ].toLowerCase().indexOf( "yes" ) !== -1) {
                      let res = x[ "field" ].match( /\(\w+\)/ );
                      if( res !== null )
                        po.setWW( pre + "Type", res[0].slice(1,-1));
                      else    // 1st Ed does not have the (Novice) part. 
                        po.setWW( pre + "Type", "Novice");
                    } else
                      followup += "Warning, This is not normally a skill.";
                } break;
                case "strain":
                  statBlock( i, tf, pre + "Strain", "Num" );
                  break;
                case "talent": {      // Knacks.
                  let x = statBlock( i, tf, pre + "BaseTalent" );
                  po.Parse( "ChatMenu: Linkadd1: NAC:" + rowID + ": T:" + x[ "field" ] );
                } break;
                case "tier": {        // 1879
                  let x = statBlock( i, tf, null, "Word" );
                  po.setWW( pre + "Type", (( code == "SK" ) ? "F1-" : "TO1-") + x[ "val" ]);
                } break;
                default:
                  po.edClass.errorLog( "ED.textImport.Talent: Somehow got value of: " + tf );
              } // end switch tofind
            } // end for blockindex array
            let attribute = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Notes" });
            Earthdawn.set( attribute, "current", textBlock( fullText.slice( end + blockOffset ).trim()) + "\n" + afterBlock.trim());
            if( followup.length > 0 )
              po.chat( followup.trim(), Earthdawn.whoFrom.apiWarning );
            po.sendSWflag();
          } break;    // end Talents, Knacks, and Skills.

          case "sp": {    // Spell: TextImport: SP:  (RowID): (text)
// CDD Note: when 1879 spell tab is finalized, don't forget to come back here and adjust.
            let code = ssa[ 1 ],
              rowID = ssa[ 2],
              pre = Earthdawn.buildPre( code, rowID );
            Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "RowID" }, rowID);
            removePageNumbers();
            let name = getName();
            blockOffset = locTextStart;
            block = fullText.slice( blockOffset ).trim();   // everything but name.
            blockIndex( "Threads" );
            blockIndex( "Tier" );
            blockIndex( "Weaving Difficulty" );
            blockIndex( "Weaving" );
            blockIndex( "Casting Difficulty" );
            blockIndex( "Casting Time" );
            blockIndex( "Casting" );          // Should be OK, since the others don't have colon directly after Casting.
            blockIndex( "Range" );
            blockIndex( "Duration" );
            blockIndex( "AoE" );
            blockIndex( "Area of Effect" );
            blockIndex( "Effect", true );     // Effect must start the line (so does not get confused with Area of Effect.
            blockIndex( "Strain" );
            blockIndex( "Success Level" );      // Sometimes it is Level, sometimes Levels. Accept both.
            blockIndex( "Success Levels" );
            blockIndex( "Extra Threads" );
            blockIndexArray = _.sortBy( blockIndexArray, "index" );
            if( blockIndexArray.length < 1) {
              po.chat( "Warning, TextImport was not able to parse that at all", Earthdawn.whoFrom.apiWarning );
              return;
            }
            let end = block.length,
              effect, succ, extra, txt, afterBlock;
            blockIndexArray.push( {name: "eof", index: end + blockOffset });
  //log(block ); log( blockIndexArray);

            for( let i = blockIndexArray.length -2; i > -1; --i) {
              let tf = blockIndexArray[ i ][ "name"];
  //log( tf);
              switch( tf.toLowerCase() ) {
                case "area of effect":        // Both
                case "aoe":
                  statBlock( i, tf, pre + "AoE" );
                  break;
                case "casting difficulty":    // 1879
                case "casting": {       // Earthdawn
                  let cd,
                    x = statBlock( i, tf ),
                    y = Earthdawn.parseInt2( x[  "field" ], true );
                  if( x[ "field" ].indexOf( "TMD" ) !== -1 || x[ "field" ].indexOf( "Target" ) !== -1 )
                    cd = "MD1";
                  else if (!isNaN( y ))
                    cd = y;
                  else
                    cd = "Ask: ?{Target Number&amp;#124;0&amp;#125;";
                  po.setWW(  pre + "Casting", cd);
                } break;
                case "casting time":      // 1879
                  statBlock( i, tf, "Casting_Time" );
                  break;
                case "duration": {        // Both
                  let x = statBlock( i, tf );
                  po.setWW( pre + "Duration", x[ "field" ].replace(/Rank/ig, "Rk").replace( /Rou\w*/ig, "Rnd").replace( /Min\w*/ig, "Min"));
                } break;
                case "effect": {        // Both
                  let x = statBlock( i, tf );
                  effect = x[ "field" ];
                  if( !txt ) {    // for 1879 txt will have been set when processing strain. The below does it for Earthdawn.
                    let j = effect.indexOf( "\n" );     // Note, there is at LEAST one spell entry that has a multi-line effect. To bad, cut it off.
                    if( j !== -1 ) {
                      txt = effect.slice( j ).trim();       // everything after the first newline.
                      effect = effect.slice( 0, j).trim();    // everything before the newline.
                    }       // Unlike Strain, afterBlock includes everything previous to Effect.
                    afterBlock = (fullText.slice( blockIndexArray[ 0 ]["index"], blockIndexArray[ i ]["index"] ).trim() ).replace( /\n/g, "   " );
                  }
                  let res = effect.match( /(WIL|Rank|Circle|\s|\+|\-|\d|\/|Physical|Mystic|NA|No|Armor|Nat\w*)+/i );
                  if( res && res[ 0 ].trim().length > 3) {
                    let fnd = res[ 0 ].replace( "\/", "").toLowerCase(),
                      ae = "N/A";   // default is armor effect is not applicable.
                    po.setWW( pre + "Effect", effect.replace( res[ 0 ], "" ).replace( /^\s*and\s*/i, "" ));

                    let res2 = fnd.match( /[\+\-]*\s*\d+/ );
                    if( res2 ) {
                      po.setWW( pre + "WilEffect", Earthdawn.parseInt2( res2[0].replace( /\s+/g, "" )));     // Need to get rid of whitespace here to get rid of nbsp characters in pdf.
                      ae = "NoDmg";   // Since we have a wil effect, New default is that armor effect is No Damage from wil effect,
                    }
                    res2 = fnd.match( /(Wil|Rank|Circle)+/i );
                    if( res2 ) {
                      po.setWW( pre + "WilSelect", res2[ 0 ].slice( 0, 1).toUpperCase() + res2[ 0 ].slice( 1 ).toLowerCase());
                    }
                    let aepost = "";
                    if( fnd.indexOf( "nat" ) != -1 ) {
                      aepost = "-Nat";
                      fnd = fnd.replace( /nat\w*/, "" );    // get rid of natural, because are going to be searching for NA in a second.
                    }
                    if( fnd.indexOf( "phy" ) != -1 )
                      ae = "PA" + aepost;
                    else if( fnd.indexOf( "mys" ) != -1 )
                      ae = "MA" + aepost;
                    else if( fnd.indexOf( "na" ) != -1 || fnd.indexOf( "no" ) != -1)
                      ae = "NoArmor";
                    po.setWW( pre + "EffectArmor", ae);
                  } else
                    Earthdawn.setWithWorker( Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Effect" }), "current", effect);
                } break;
                case "range":           // Both
                  statBlock( i, tf, pre + "Range" );
                  break;
                case "strain": {        // 1879
                  let x = statBlock( i, tf );
                  let y = x[ "field" ];
                  if( !txt ) {
                    let j = y.indexOf( "\n" );
                    if( j !== -1 ) {
                      txt = y.slice( j ).trim();
                      y = y.slice( 0, j).trim();
                    }         // The i -1 means that afterBlock does not include Effect. But does include Strain.
                    afterBlock = (fullText.slice( blockIndexArray[ 0 ]["index"], blockIndexArray[ i -1 ]["index"] ).trim() + "   " + tf + ":" + y ).replace( /\n/g, "   " );
                  }
                  po.setWW( pre + "Strain", y);
  // Note: ToDo right once sheet tab is done.
                } break;
                case "threads":         // Earthdawn
                  statBlock( i, tf, pre + "sThreads", "Num" );
                  break;
                case "tier":          // 1879
  // Note: ToDo right once sheet tab is done.
                  statBlock( i, tf, pre + "Circle", "Word" );
                  break;
                case "weaving difficulty":
                case "weaving": {       // Earthdawn
                  let x = statBlock( i, tf, null, "Num" );
                  let y = Earthdawn.parseInt2( x[ "val" ] ) - 4,
                    aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Circle" });
//                  po.setWW( pre + "Circle", y);
                  po.setWW( pre + "Numbers", (y+4).toString() + "/" + (y+9) + "/" + (y+10) + "/" + (y+15));
                  Earthdawn.set( aobj, "current", y);
                  let myMap = new Map();
                  myMap.set( "name", pre + "Circle");
                  myMap.set( "current", y);
                  myMap.set( "_characterid", po.charID );
                  Earthdawn.attribute( myMap );    // Nov 21, roll20 setWithWorker bug, it does not trigger on repeating sections.  Try triggering it manually.
                } break;
                case "success level":   // sometimes it is level, sometimes levels
                case "success levels": {      // Earthdawn
                  let x = statBlock( i, tf );
                  succ = x[ "field" ].replace( /\n/g, " ");
                  po.setWW(  pre + "SuccessLevels", parseThreads( 0, succ ));
                } break;
                case "extra threads": {       // Earthdawn
                  let x = statBlock( i, tf );
                  extra = x[ "field" ].replace( /\n/g, " ");
                  po.setWW( pre + "ExtraThreads", parseThreads( 1, extra ));
                } break;
                default:
                  po.edClass.errorLog( "ED.textImport.Spell: Somehow got value of: " + tf );
              } // end switch tofind
            } // End for each token found.

                  // what 0 is Extra Successes. One item that must be made to conform to the dropdown list.
                  // what 1 is extra threads. A comma delimited list of items.
            function parseThreads( what, input ) {
              'use strict';
              let ret = ",",
                arr = input.split( "," );
                for( let i = 0; i < arr.length; ++i ) {
                  let t = arr[ i ].toLowerCase();
                  let paran = arr[ i ].match( /\(.+?\)/ );    // If we got a value in parentheses, grab that.
                  if( t.indexOf( "add" ) !== -1 && t.indexOf( "tar" ) !== -1 )      // Additional Target (+1) or (+Rank)
                    ret += what ? "Add Tgt" + (paran ? " " + paran[ 0 ] + "," : ",") : "Add Tgt (+1),";
                  else if( t.indexOf( "rem" ) !== -1 && t.indexOf( "tar" ) !== -1 )   // Remove Targets (-Rank)
                    ret += "Add Tgt" + (paran ? " " + paran[ 0 ] + "," : ",");
                  else if( t.indexOf( "inc" ) !== -1 ) {                  // Increase (something else)
                    if( t.indexOf( "area" ) !== -1 || t.indexOf( "aeo" ) !== -1 )   // Increase Area or AoE (+2 yards)
                      ret += what ? "Inc Area" + (paran ? " " + paran[ 0 ] + "," : ",") : ( t.indexOf( "2" ) !== -1 ? "Inc Area (+2)," : "Inc Area (Other),") ;
                    else if( t.indexOf( "dur" ) !== -1 )                //  Increase Duration (+2 minutes)
                      ret += what ? "Inc Dur" + (paran ? " " + paran[ 0 ] + "," : ",") : ( t.indexOf( "2" ) !== -1 ? "Inc Dur (+2)," : "Inc Dur (Other),") ;
                    else if( t.indexOf( "eff" ) !== -1 )                // Increase Effect (+2 Effect Step)
                      ret += what ? "Inc Efct" + (paran ? " " + paran[ 0 ] + "," : ",") : ( t.indexOf( "2" ) !== -1 ? "Inc Efct Step (+2)," : "Inc Efct (Other),") ;
                    else if( t.indexOf( "ran" ) !== -1 || t.indexOf( "rng" ) !== -1 ) // Increase Range (+10 yards),
                      ret += what ? "Inc Rng" + (paran ? " " + paran[ 0 ] + "," : ",") : "Inc Rng (+20),";
                    else
                      ret += what ? "Special (" + arr[ i ].trim() + ")," : "Special,";
                  } else
                    ret += what ? "Special (" + arr[ i ].trim() + ")," : "Special,";
                }
              return ret.slice( 1, -1);
            } // end ParaseThreads

            po.setWW( pre + "Notes", (succ ? "Success Levels: " + succ  + "\n" : "")
                  + (extra ? "Extra Threads: "  + extra + "\n" : "")
                  + (effect ? "Effect: "  + effect + "\n" : "")
                  + (txt ? textBlock( txt ) + "\n" : "")
                  + afterBlock.trim());
            po.setWW( pre + "Name", name);
            if( followup.length > 0 )
              po.chat( followup.trim(), Earthdawn.whoFrom.apiWarning );
          } break;      // End Spell import

          case "mask": {
            switch( ssa[ 2 ].toLowerCase().trim() ) {
            case "add": {
              removePageNumbers();
              let name = getName();
              let n3 = name.match( /\(.*?\)/ );   // Get and remove the circle adjustment IE: (+2 circles)
              if( n3 )
                name = name.replace( n3[ 0 ], "" ).trim();
              let attribute = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: "MaskList" }, "");
              let lst = attribute.get( "current" ).trim();
              if( lst.length < 2 )
                lst = [];   // strip out any remnant that was put here.
              else
                lst = lst.split( "," );
              block = fullText;
              lst.push( name );
              let attribute2 = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: "MaskDetail" }, ""),
                lst2 = attribute2.get( "current" ).trim();
              if( lst2.length < 2 )
                lst2 = "";    // strip out any remnant that was put here.
              let txt = "\n***** Start Mask " + name + " *****\n" + block
                  + "\n***** End Mask " + name + " *****";
              if ( parseCreature( 1, name ) ) {
                Earthdawn.setWithWorker( attribute,  "current", lst.join());
                Earthdawn.setWithWorker( attribute2, "current", (lst2 + txt).trim());
                po.chat( "Mask " + name.trim() + " added.", Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive );
              }
            } break;    // end Mask Add
            case "remove": {
              let name = ssa[ 3 ].trim();
              let attribute = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: "MaskList" }, "");
              let lst = attribute.get( "current" ).trim();
              lst = lst.split( "," );
              let ind = lst.indexOf( name );
              if( ind > -1 ) {
                lst.splice( ind, 1);      // remove from list
                lst = lst.join();

                let attribute2 = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: "MaskDetail" }, ""),
                lst2 = attribute2.get( "current" ).trim();
                if( lst2.length < 2 )
                  lst2 = "";    // strip out any remnant that was put here.
                let indStart = lst2.indexOf( "***** Start Mask " + name + " *****" ),
                  indEnd = lst2.indexOf( "***** End Mask " + name + " *****" );
                if( indStart != -1 && indEnd != -1 ) {
                  block = lst2.slice( indStart + 23 + name.length, indEnd).trim();
                  fullText = block;
                  lst2 = lst2.slice( 0, indStart ).trim() + lst2.slice( indEnd + 21 + name.length).trim();
                  if( parseCreature( -1, name )) {
                    Earthdawn.setWithWorker( attribute,  "current", lst ? lst : "0", "0");
                    Earthdawn.setWithWorker( attribute2, "current", lst2 );
                    po.chat( "Removed Mask " + name, Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive );
                  }
                } else
                  po.chat( "Mask data mismatch error. Removed Mask " + name + " from MaskList, but was unable to find it in MaskDetail",
                        Earthdawn.whoFrom.apiWarning | Earthdawn.whoFrom.noArchive );
              }
              else
                po.chat( "Unable to remove Mask " + name, Earthdawn.whoFrom.apiWarning | Earthdawn.whoFrom.noArchive );
            } break;    // end Mask Remove
            default:
              po.edClass.errorLog( "ED.textImport.Mask() Unknown second parameter" );
              log( ssa );
            }
          } break;  // end Mask
            default:
              po.edClass.errorLog( "ED.textImport() Unknown first parameter" );
              log( ssa );
        } // end Switch





            // process the creature or mask.
            // If mult is 0, then new creature is being added.
            // If mult is 1, then mask is being added, and modifications are adds.
            // If mult is -1, then mask is being removed.
            // This operates on section variable block, which must be set before calling this.

            // Creature - Expected format.
            //
            // Name alone on first line.
            // a text block description of the creature, probably more than one paragraph.
            // Challenge: tier (nn circle)         (Note, this might not be here (spirits, and 1879 they will not)
            // stat block
            // Movement: 12 (Climb 12)
            // Actions: 2; Bite: 12 (8), Barbs x2: 12 (7, Poison)
            // Powers:
            // List of Powers, each one will start a new line, but some are several lines long.
            // Enhanced Sense [Smell] (2)
            // Poison (8): A victim hit by the barbs on the inside of a preces’ forearms is exposed to the damaging poison. The poison is Step 8 [Onset: 1 round, Interval: 5/1 round]. The pain caused by the poison also applies a -1 penalty to the victim’s tests.
            // Great Leap (6)
            // Look for newline, 1 to 4 words, then a paran, number, endparen. might also have brackets. If get that, might have new power.
            // Enhanced Sense [Sight]: Low-Light Vision
            // Except might not get the paren number endparen. Could also look for short lines with short lines above. and/or colons.
            // Or just look for lines starting Enhanced Sense [Sight] might be worth doing.
            // For Dragons, instead of Powers: might get Starting Powers: and a list, Power Ranks, a number and text, and Sample Distribution. If so, tell them to edit in a text editor and resubmit!
            // or Additional Powers (Choose Three): and a list.
            // Special Maneuvers:
            // Defang (Opponent)
            // Loot: (optional).
        function parseCreature( mult, name ) {
          'use strict';
          try {
//log( "parse " + name + "    " + mult); log(block);
            let dsp = getDSP(),
              lastBlock = 9999,   // This holds the index number of the first label that is not a short simple value. The short simple values are all lumped into one afterblock. The ones after this index all have special processing.
              spells, third;

                      // Here we are messing with the DSP repeating section.
                      // Unless it has already been set to Spirit, we are going to set this to Creature, and set the Circle to the Challenge Rating.
                      // If this is a Spirit, then BEFORE inporting, the Circle should have been set to the Spirit Strength Rating.
            function getDSP() {
              let circles = {}, ret = {},
                aObj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: "Race" }, "Other");
                if( aObj.get( "current" ) == "None" )
                  aObj.set( "current", "Other");   // If race not chosen, set to "Other"

                      // go through all attributes for this character and look for DSP entries.
              let attributes = findObjs({ _type: "attribute", _characterid: po.charID });
              _.each( attributes, function (att) {
                let nm = att.get("name");
                if ( nm.endsWith( "_DSP_Code" )) {
                  let t = att.get( "current" );
                  if    ( t === "0.0" )  ret[ "None" ]    = Earthdawn.repeatSection( 2, nm);
                  else if ( t === "98.5" ) ret[ "Spirit" ]  = Earthdawn.repeatSection( 2, nm);
                  else if ( t === "99.5" ) ret[ "Creature" ]  = Earthdawn.repeatSection( 2, nm);
                } else if ( nm.endsWith( "_DSP_Circle" ))
                  circles[ Earthdawn.repeatSection( 2, nm) ] = att.get( "current" );
              }); // End for each attribute.
              if( "Spirit" in ret ) {         // Already set to spirit, and have Rating. All good.
                let x = circles[ ret[ "Spirit"]];
                if (x)    strRating = Earthdawn.parseInt2( x );
log("spirit " + strRating );
              } else if ( "Creature" in ret ) {     // Already set to Creature, so this is where we will be setting the Challenge Rating.
                let x = circles[ ret[ "Creature" ]];
                if (x)    strRating = Earthdawn.parseInt2( x );
              } else if ( "None" in ret ) {       // Still set to None, so change it to Creature.
                ret[ "Creature" ] =  ret[ "None" ];
                let pre = Earthdawn.buildPre( "DSP", ret[ "None" ] );
                po.setWW( pre + "Code", "99.5");
                po.setWW( pre + "Durability", "5");
                po.setWW( pre + "Name", "Creature");
              }
              return ret;
            } // end getDSP


                // Add a power (talent) to the character sheet.
                // If we have a step, it is a rollable power. If we don't have a step it is for display only.
            function addPower( pwr, pwrFnd, step, attra, actn, txt, dispTxt ) {
              'use strict';
              try {
                if( pwr === "Power" )   // Don't know why this word is showing up in spirit power lists, but it seems useless.
                  return;
                let rowid = Earthdawn.generateRowID();
                let pre = Earthdawn.buildPre( "T", rowid );
                Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "RowID" }, rowid);
                Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Name" }, pwrFnd);
                Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Type" }, "Power");
                if( actn )
                  Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Action" }, actn);
                if( attra )
                  Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Attribute" }, attra);
                if( dispTxt )
                  Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "SuccessText" }, dispTxt);
                if( step && typeof step === "number" )
                  Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Rank" }, step);
                else {      // No Roll
                  Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Mod-Type" }, "(0)");
                  if( txt && !dispTxt && txt !== pwrFnd )   // If there is no roll, make notes the display text blockIndexArray well, unless it is the same as the name.
                    Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "SuccessText" }, txt);
                }
                if( txt )
                  Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Notes" }, txt);
                Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "CombatSlot" }, "1");
                Earthdawn.abilityAdd( po.charID, Earthdawn.constant( "Talent" ) + pwr, "!edToken~ %{selected|" + pre + "Roll}" );

                if( pwr === "Corrupt Karma" || pwr === "Karma Cancel" )
                  Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Special" }, "CorruptKarma");
                if( pwr === "Cursed Luck" )
                  Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Special" }, "CursedLuck");
                if( pwr === "Hardened Armor" || pwr === "Armored Scales" )
                  Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: "Creature-HardenedArmor" }, "1");
                if( pwr === "Karma" ) {
                  if( typeof step === "object" && step.length > 0)
                    po.setWW( "KarmaStep", step[ 0 ].trim());
                  let x = step;
                  if( typeof step === "object" && step.length > 1 )
                    x = step[ 1 ].trim();
                  else x = step * 4;
                  po.setWW( "Karma", x);
                  po.setWW( "Misc-Karma-max-Adjust", x);
                }
                if( pwr.toLowerCase().startsWith( "spell" )) {      // Spells or Spellcasting
                  if( step && typeof step === "number" && state.Earthdawn.sheetVersion < 1.8 )
                    Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: "SP-Spellcasting-Rank" }, step - save[ "per" ]);
                  if( pwr.toLowerCase().startsWith( "spellcast" ) )
                    Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Special" }, "SPL-Spellcasting");

                  if( !spells ) {   // trigger this only once.
                    spells = true;
                    po.addSWflag( "Trigger2", "AutoFill, " + pre + pwrFnd );
                    rowid = Earthdawn.generateRowID();
                    pre = Earthdawn.buildPre( "T", rowid );
                    Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "RowID" }, rowid);
                    Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Name" }, "Wil");
                    po.addSWflag( "Trigger2", "AutoFill, " + pre + "Name" );

                    rowid = Earthdawn.generateRowID();
                    pre = Earthdawn.buildPre( "T", rowid );
                    Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "RowID" }, rowid);
                    Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Name" }, "Spell Weaving");
                    if( step && typeof step === "number" )
                      Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Rank" }, step);
                    po.addSWflag( "Trigger2", "AutoFill, " + pre + "Name" );
                } }
              } catch(err) {
                po.edClass.errorLog( "ED.textImport.addPower() error caught: " + err );
              }
            } // end addPower


            blockIndex( "Attributes" );       // 1st Ed. 
            blockIndex( "Challenge" );        blockIndex( "Legend Award" ); // Challenge is 4th edition, Legend Award is 3rd.
            blockIndex( "DEX" );
            blockIndex( "STR" );
            blockIndex( "TOU" );
            blockIndex( "PER" );
            blockIndex( "WIL" );
            blockIndex( "CHA" );
            blockIndex( "Initiative" );
            blockIndex( "Unconsciousness" );  blockIndex( "Uncon" );    blockIndex( "Unconsciousness Rating" );
            blockIndex( "Death Rating" );     blockIndex( "Death" );
            blockIndex( "Wound Threshold" );  blockIndex( "Wound" );
            blockIndex( "Recovery Tests" );
            blockIndex( "Knockdown" );
            blockIndex( "Physical Defense" ); blockIndex( "PhyDef" );
            blockIndex( "Mystic Defense" );   blockIndex( "MysDef" );       blockIndex( "Spell Defense" );
            blockIndex( "Social Defense" );   blockIndex( "SocDef" );
            blockIndex( "Mystic Armor" );     blockIndex( "MysArm" );       blockIndex( "Armor", true );
            blockIndex( "Physical Armor" );   blockIndex( "PhyArm" );
            blockIndex( "Karma" );
            blockIndex( "Combat Movement" );  blockIndex( "Full Movement" );  blockIndex( "Movement" );
            blockIndex( "Move" );
            blockIndex( "Actions" );         blockIndex( "Number of Attacks" );            blockIndex( "Number of Spells", true );
            blockIndex( "Attack", true );    // ED 1st Ed.
            blockIndex( "Attack \\( \\d* \\)", true );    // ED 3rd ed     Attack (2)
            blockIndex( "Spellcasting" );       // ED 1st Ed.
            blockIndex( "Damage" );                       // ED 3rd ed
            blockIndex( "Effect", true );       // ED 1st Ed.
            blockIndex( "Starting Powers" );
            blockIndex( "Powers", true );
            blockIndex( "Suggested Powers" );
            blockIndex( "Sample Distribution" );
            blockIndex( "Special Maneuvers" );
            blockIndex( "Legend Points" );      // ED 1st Ed. 
            blockIndex( "Equipment" );
            blockIndex( "Loot" );
            blockIndexArray = _.sortBy( blockIndexArray, "index" );
            if( blockIndexArray.length < 1) {
              po.chat( "Warning, TextImport was not able to parse that at all", Earthdawn.whoFrom.apiWarning );
              return;
            }
            blockIndexArray.push( {name: "eof", index: block.length + blockOffset});
            block = block.slice( blockIndexArray[0].index - blockOffset ).trim();   // block now just consists of our identified statblock.
            blockOffset = blockIndexArray[ 0 ].index;
            let toUpdate = [];

            function adjustPower( p1, p2, p3, p4, p5, p6, p7 ) {
              if( mult >= 0 )   // Add a creature or mask power.
                addPower( p1, p2, p3, p4, p5, p6, p7 );
              else {        // We are attempting to remove a mask power.
                let r;
                Earthdawn.abilityRemove( po.charID, Earthdawn.constant( "Talent" ) + p1 );      // remove any ability with this name.
                let attrib = findObjs({ _type: "attribute", _characterid: po.charID,  current: p2 });   // look for any Talents with this name, and if found, remove them.
                if( attrib ) {
                  for( let i = 0; i < attrib.length; ++i ) {
                    if( attrib[ i ].get( "name" ).endsWith( "_T_Name") && attrib[ i ].get( "name" ).startsWith( "repeating_talents_" )) {
                      let t = Earthdawn.repeatSection( 2, attrib[ i ].get( "name" ) );
                      if( r && ( r !== t))
                        return;   // We found more than one talent with this name, so to be safe, don't delete anything.
                      r = t;
                  } }
                  if( r ) {       // we found one and only one rowID. Delete everything on that row.
                    let pre = Earthdawn.buildPre( "T", r )
                    attrib = findObjs({ _type: "attribute", _characterid: po.charID });
                    _.each( attrib, function (att) {
                      if ( att.get("name").startsWith( pre ))     // remove everything with this rowID.
                        att.remove();
                    });
            } } } }


                // When processing a statBlock, we want to do different things at different times. This routine should do them all.
                //
                // what   - bitcode.  0x01 : modify lookup.
                //            0x02 : put into toUpdate instead of modifying immediately.
                //            0x04 : Simple set arithmetic. Don't need to look at old adjustment.
                //          Always save a copy of what parsed in save.
                //          Always save a copy of what lookup used to be in save + "Old".
                // tf   - to find. This is the label string to search for. The value we are interested in is after the label.
                // lookup - This is variable name
                // def    - If the variable name lookup fails, use this default value.
            function getStuff( index, what, tf, lookup, def ) {
              save[ tf ] = statBlock( index, tf )[ "field" ];
              save[ tf + "Old" ] = Earthdawn.getAttrBN( po.charID, lookup, def );
              if( what & 0x02 && save[ tf ] !== 0)
                toUpdate.push( { toFind: tf, lu: lookup, cur: save[ tf ] });
              else if( what & 0x01 )
                modify( mult, lookup, save[ tf ] );
//log( "getStuff  what: " + what + "   to find: " + tf + "   lookup: " + lookup + "   Def: " + def + "   old: " + save[ tf + "Old" ] + "   save: " + save[ tf ]);
            }


                // what, is 0 for first loop, 1 for 2nd loop.
                // To Find.    Save Name,                             "movement"
                // Value of set or modification.
                // Where to find what the base value currently is.   and Its default value,     "Movement",   10
                // The variable to adjust to make the base value correct.           "Misc-Movement-Adjust"
            function Adjust( what, tf, val, base, baseDef, adj ) {
              'use strict';
              try {
                if( val == undefined )
                  val = save[ tf ];
                val = getSR( val );
                let v,
                  aObj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: adj });
                if( !mult ) {           // This is a set, not an adjust.
                  v = Earthdawn.parseInt2( val ) - Earthdawn.getAttrBN( po.charID, base, baseDef, true )      // desired value minus current value gives new adjust.
                  if( !(what & 0x04 ))      // Adjust does not modify base value, so don't need to subtract it out.
                    v -= Earthdawn.parseInt2(aObj.get( "current"));
                } else if( what & 0x01 )      //  If what 0x01, then do complex adjust (probably from second loop).
                  v = Earthdawn.parseInt2(aObj.get( "current")) + ((val * mult) - (Earthdawn.getAttrBN( po.charID, base, baseDef. true ) - save[ tf + "Old" ]));
                else                //  If what 0x00, then do simple adjust (probably from first loop)
                  v = Earthdawn.parseInt2(aObj.get( "current")) + (val * mult);     // add adjustment to old adjust.   does not matter what base is.
//log( "adjust what: " + what + "   to find: " + tf + "   old " + save[ tf + "Old" ] + "   value: " + val + "   base: " + base + "   baseDef: " + baseDef + "   adjustment: " + adj + "   new: " + v );
                if( !isNaN( v ))
                  Earthdawn.setWithWorker( aObj, "current", v);
                else {
                  log( "Earthdawn TextImport Adjust, not a number");
                  log( "adjust what: " + what + "   to find: " + tf + "   value: " + val + "   base: " + base + "   baseDef: " + baseDef + "   adjustment: " + adj + "   new: " + v );
                }
              } catch(err) {
                log( "Earthdawn parseCreature.adjust() error caught: " + err );
                log( "adjust what: " + what + "   to find: " + tf + "   value: " + val + "   base: " + base + "   baseDef: " + baseDef + "   adjustment: " + adj );
            } }


            for( let i = blockIndexArray.length -2; i > -1; --i) {      // loop 1
              let tf = blockIndexArray[ i ][ "name"].toLowerCase();
              switch( tf ) {
                case "attributes":   break;    // ED 1st Ed.  Do nothing. 
                case "dex":         getStuff( i, 0x02, tf, "Dex-Step" ,5 );   break;
                case "str":         getStuff( i, 0x02, tf, "Str-Step" ,5 );   break;
                case "tou":         getStuff( i, 0x02, tf, "Tou-Step" ,5 );   break;
                case "per":         getStuff( i, 0x02, tf, "Per-Step" ,5 );   break;
                case "wil":         getStuff( i, 0x02, tf, "Wil-Step" ,5 );   break;
                case "cha":         getStuff( i, 0x02, tf, "Cha-Step" ,5 );   break;        // Above we actually changed stuff. Below we save information for next loop.
                case "initiative":  getStuff( i, 0x00, tf, "Initiative", 5 ); break;
                case "knockdown":   getStuff( i, 0x00, tf, "Str-Step", 5 );   break;
                case "unconsciousness rating":
                case "uncon": case "unconsciousness":     getStuff( i, 0x00, tf, "Damage-Unc-Rating", 20 );     break;
                case "death": case "death rating":        getStuff( i, 0x00, tf, "Damage-Death-Rating", 25 );   break;
                case "wound": case "wound threshold":     getStuff( i, 0x00, tf, "Wound-Threshold", 7 );        break;
                case "recovery tests":                    getStuff( i, 0x00, tf, "Recovery-Tests_max", 2 );     break;
                case "phydef":  case "physical defense":  getStuff( i, 0x00, tf, "PD", 6 );             break;
                case "spell defense":
                case "mysdef":  case "mystic defense":    getStuff( i, 0x00, tf, "MD", 6 );             break;
                case "socdef":  case "social defense":    getStuff( i, 0x00, tf, "SD", 6 );             break;
                case "armor":   case "phyarm":    case "physical armor":    save[ tf ] = statBlock( i, tf, "PA-Nat", "num", mult );    break;
                case "mysarm":  case "mystic armor":                        save[ tf ] = statBlock( i, tf, "MA-Nat", "num", mult );    break;
//                case "mysarm":  case "mystic armor":      getStuff( i, 0x00, tf, "MA-Nat", 2 );         break;
                case "attack \\( \\d* \\)": 
                case "attack":                            save[ tf ] = statBlock( i, tf, "Attack \\( \\d* \\)", "num", mult );    break;    // ED 3rd Ed, Attack (5): 11
                case "damage":    save[ tf ] = statBlock( i, tf, "Damage", "num", mult );               break;    // ED 3rd ED.
                case "karma": {       // Karma: 8 (32)   This means they start with 32 step 8 karma!
                  let x = statBlock( i, tf, "KarmaStep", "num", mult );
                  if( "remain" in x ) {
                    let fnd = x[ "remain" ].match( /\(.+?\)/ );     // everything inside paren
                    if( fnd ) {
                      let k = getSR(fnd[0].replace( /[\(\,\)]/g, "" ).trim());    // trim off ( and ) and comma
                      if( k ) {
                        po.setWW( "Karma", k );
                        po.setWW( "Misc-Karma-max-Adjust", k);
                  } } }
                } break;
                case "legend award": third = true;
                case "challenge": {     // new creature only.     // Challenge: Journeyman (Seventh Circle)
                  let ord,
                    x = statBlock( i, tf, null, "Word" );     // This will get the tier, such as "Journeyman"
                  if ( "Creature" in dsp ) {
                    if ( third )
                      ord = x[ "val" ].toLowerCase();
                    else {
                      let fnd = ( "remain" in x ) ? x[ "remain" ].match( /\(\w+/i ) : undefined;    // get circle as first word inside paren
                      if( fnd )
                        ord = fnd[0].slice(1).toLowerCase();
                    }
                    if( ord ) {
                      let cr = [ "zero", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth",
                            "tenth", "eleventh", "twelfth", "thirteenth", "fourteenth", "fifteenth", "sixteenth" ].indexOf( ord );
                      if( cr !== -1 ) {
                        strRating = cr;
                        let pre = Earthdawn.buildPre( "DSP", dsp[ "Creature" ] );
                        let aObj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Circle" });
                        toUpdate.push( { toFind: tf, obj: aObj, cur: cr });
                  } } }
                  save[ tf ] = x[ "raw" ];
                } break;
                case "move":      case "combat movement":     case "full movement":
                case "movement": {                    // Movement: 4 (Flying 18)
                  let x = statBlock( i, tf, null, "Word" );
                  Adjust( 0, tf, x[ "val" ], "Movement", 10, "Misc-Movement-Adjust" );
                  if( x[ "remain" ] && x[ "remain" ].length > 2 )
                    adjustPower( x[ "remain" ].trim(), x[ "remain" ].trim(), 0, null, "NA", x[ "remain" ].trim());
                  save[ tf ] = "<b>" + tf.slice(0, 1).toUpperCase() + tf.slice( 1 ) + ":</b> " + x[ "field" ];
                  lastBlock = Math.min(i, lastBlock);
                } break;                    // Actions: 1; Horns 11 (18), Trample 11 (16)
                case "number of attacks":   case "number of spells":
                case "actions": {             // Actions: 0; Attack +3 (Damage +0)   or   Actions: 4; Bite 23 (30), Claws x4 23 (28)
                  save[ tf ] = statBlock( i, tf, "Actions", "num", mult );
                  lastBlock = Math.min(i, lastBlock);
                } break;                  // Powers:    Charge (5)  Enhanced Sense [Smell] (2) Beast of Burden: When used as a mount, the dyre effectively has 2 less Strength for the purposes of a charging attack.
                case "attack \\( \\d* \\)":               // ED 3rd Ed, Attack (5): 11
                  save[ tf ] = statBlock( i, tf, "Attack \\( \\d* \\)", "num", mult );
                  break;
                case "attack":      case "spellcasting":  // ED 1st Ed.
                  save[ tf ] = statBlock( i, tf, "Attack", "num", mult );
                  break;
                case "damage":              // ED 3rd ED.
                case "effect":              // ED 1st ED.
                  save[ tf ] = statBlock( i, tf, "Damage", "num", mult );
                  break;
                case "starting powers":
                case "sample distribution":
                case "powers": {              //        Ambush (+5): As the creature power, Gamemaster’s Guide, p. 250.       Stealthy Stride (DEX + Circle): As the skill, Player’s Guide, p. 170
                  save[ tf ] = statBlock( i, tf );
                  lastBlock = Math.min(i, lastBlock);
                } break;
                case "suggested powers": {
                  save[ tf ] = statBlock( i, tf );
                  lastBlock = Math.min(i, lastBlock);
                } break;                  // Overrun (Dyre, Trample)    Provoke (Opponent, Close Combat)       Horn Sweep (Dyre, Horns): The dyre may ...
                case "special maneuvers": {         // No Change   or    Dispelling Strike (Creature, Close Combat): The creature may ...
                  function checkbx( toCheck, toFind, box ) {
                    'use strict';
                    let fnd = toCheck.match( new RegExp( "^" + toFind.replace( /\s+/g, "\\s*" ), "gi" ) );
                    if( fnd ) {
                      po.setWW( box, mult < 0 ? "0" : "1" );    // if removing mask, uncheck    Else check it.
                      return 1;
                    } else return 0;
                  }

                  save[ tf ] = statBlock( i, tf );
                  lastBlock = Math.min(i, lastBlock);
                  let gmnotes = "<b>" + tf.slice(0, 1).toUpperCase() + tf.slice( 1 ) + ":</b><br>",
                    sp = textBlock( save[ tf ][ "field" ].trim(), true ).split( "\n" );   // First textBlock groups them into lines that are hopefully right (one manuver per line), then we split them on those lines, so we can process each individually.
                  for( let i = 0; i < sp.length; ++i ) {
                    let toCheck = sp[ i ].trim(),
                      cnt = 0, nmpos = 99999,
                      tnm = toCheck.indexOf( "(" );

                    if( toCheck.search( /No Change/gi ) !== -1)
                      continue;
                    if( tnm !== -1 )
                      nmpos = tnm;
                    tnm = toCheck.indexOf( ":" );
                    if( tnm !== -1 && tnm < nmpos )
                      nmpos = tnm;
                    if( nmpos != -1 && nmpos < 99999)
                      gmnotes += "<i>" + toCheck.slice(0, nmpos) + "</i>" + toCheck.slice( nmpos) + "<br>";   // highlight up to first colon or open paren.
                    else
                      gmnotes += toCheck + "<br>";
                    cnt += checkbx( toCheck, "Clip the Wing", "Opponent-ClipTheWing");
                    cnt += checkbx( toCheck, "Crack the Shell", "Opponent-CrackTheShell");
                    cnt += checkbx( toCheck, "Defang", "Opponent-Defang");
                    cnt += checkbx( toCheck, "Enrage", "Opponent-Enrage");
                    cnt += checkbx( toCheck, "Provoke", "Opponent-Provoke");
                    cnt += checkbx( toCheck, "Pry Loose", "Opponent-PryLoose");
                    cnt += checkbx( toCheck, "Hardened Armor", "Creature-HardenedArmor");
                    cnt += checkbx( toCheck, "Grab and Bite", "Creature-GrabAndBite");
                    cnt += checkbx( toCheck, "Hamstring", "Creature-Hamstring");
                    cnt += checkbx( toCheck, "Overrun", "Creature-Overrun");
                    cnt += checkbx( toCheck, "Pounce", "Creature-Pounce");
                    cnt += checkbx( toCheck, "Squeeze the Life", "Creature-SqueezeTheLife");
                    if( !cnt ) {    // The Special Maneuver we found does not appear to be a standard one.
                      let l = toCheck.indexOf( ":" );
                      if( l != -1 ) {
                        let nm = toCheck.slice( 0, l);
                        if( nm.search( /\(.*?Opponent.*?\)/i ) !== -1) {      // The word Opponent anywhere inside of parentheses.
                          var opponent = true;
                          nm = nm.replace( /Opponent\,*/gi, "" );     // remove the word Opponent
                        }
                        nm = nm.replace( new RegExp( "(" + name.replace(",", "|" ).replace( /\s+/g, "") + ")+"+"[\s\,]*", "gi" ), "");  // remove creature name
                        nm = nm.replace( /\(\s*/, "(").replace( /\s*\)/, ")").replace( /\s*\([\s\,]*\)\s*/gi, "").trim();   // if we now have an empty paren, remove that.

                        if( mult < 0 ) {  // Remove special maneuver.
                          let rfnd = undefined,
                            lst = [];
                                // first, get list of MAN objects. While getting them, also look for maneuver name wanted.
                          let attributes = findObjs({ _type: "attribute", _characterid: po.charID });
                          _.each( attributes, function (att) {
                            if ( att.get("name").startsWith( "repeating_maneuvers_" )) {
                              lst.push( att );
                              if( att.get("name").endsWith( "_MAN_Name" ))
                                rfnd = Earthdawn.repeatSection( 2, att.get("name" ));   // RowID of maneuver with name we want to remove.
                            }
                          }); // End for each attribute.
                          if( rfnd )    // If we found the name and rowID we were looking for.
                            for( let i = 0; i < lst.length; ++i )
                              if( rfnd == Earthdawn.repeatSection( 2, lst[ i ].get( "name" ) )) {
                                let obj = lst[ i ];
                                obj.remove();       // Delete all _MAN_ with the found rowID.
                              }
                        } else {      // We are adding special maneuver.
                          let rowid = Earthdawn.generateRowID();
                          let pre = Earthdawn.buildPre( "MAN", rowid );
                          Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "RowID" }, rowid);
                          Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Type" }, opponent ? "-1" : "1" );
                          Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Name" }, nm);
                          Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Desc" }, toCheck.slice( l+1) );
                        }
                      } else    // could not find a colon.
                        po.chat( "Warning!   Could not parse Special Maneuver " + toCheck + "   Do it manually. ", Earthdawn.whoFrom.apiWarning );
                  } }
                  save[ tf ] = gmnotes.trim().replace( "<br>$", "");
                } break;      // End maneuver
                case "legend points":     // ED 1st Ed.
                case "equipment":         // Equipment: Cave Axe (Size 6, Damage Step 8, worth 50 silver), Hide Armor
                case "loot": {            // Loot: Crystal shards and fragments of Elemental earth worth 3D6 × 20 silver pieces (worth Legend Points).
                  let x = statBlock( i, tf );
                  save[ tf ] = "<b>" + tf.slice(0, 1).toUpperCase() + tf.slice( 1 ) + ":</b> " + x[ "field" ];
                  lastBlock = Math.min(i, lastBlock);
                } break;
                default:
                  po.edClass.errorLog( "ED.textImport.Creature: Somehow got value of: " + tf );
              } // end switch
            } // end for each label found

            if( mult && ( "Creature" in dsp )) {    // If this is a mask, then see if the challenge rating needs adjusted.
              let n2 = getName();     // Capture and adjust CR.
              let n3 = n2.match( /\(.*?\)/ )
              if( n3 ) {
                let adjustCR = Earthdawn.parseInt2( n3[ 0 ].slice( 1, -1), true);
                if( !isNaN( adjustCR )) {
                  let aObj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: Earthdawn.buildPre( "DSP", dsp[ "Creature" ] ) + "Circle" });
                  Earthdawn.setWithWorker( aObj, "current", Earthdawn.parseInt2( aObj.get( "current" )) + (adjustCR * mult));
            } } }

            while( toUpdate.length ) {      // we want all the above to be done without polluting the results with any updates, so we saved all the updates to be done here.
              let t = toUpdate.pop();
              if( "obj" in t )
                Earthdawn.setWithWorker( t[ "obj" ], "current", t[ "cur" ]);
              else if ( "lu" in t )
                modify( mult, t[ "lu" ], t[ "cur" ] );
            }

            onSheetWorkerCompleted(function() {     // We want to wait until sheet workers have set all the updates done above.
              creature2();
            });
            po.setWW( "wt-test1", Earthdawn.getAttrBN( po.charID, "wt-test1", 0) +2);   // On the very unlikely chance that the sheetworker stack is already empty, call a sheetworker.


                // We want this part to only be run after the sheetworkers have set Health.
            function creature2() {
              'use strict';
              try {
                let carryover = "";
                for( let i = blockIndexArray.length -2; i > -1; --i) {    // For each label found.
                  let tf = blockIndexArray[ i ][ "name"].toLowerCase();
                            // 2nd pass through, process derived attributes.
// log( tf);
                 switch( tf ) {
                    case "initiative":    Adjust( 0x01, tf, undefined, "Initiative", 5, "Misc-Initiative-Adjust" ); break;
                    case "knockdown": {
                      let tv = save[ tf ];
                      if( getSR( tv ))      tv = getSR( tv );
                      else if (isNaN( tv )) tv = 999;
                      Adjust( 0x05, tf, tv , "Str-Step", 5, "Knockdown-Adjust" );
                    } break;
                    case "uncon":   case "unconsciousness":   case "unconsciousness rating":
                      if( isNaN( save[ tf ] )) {    // Usually "NA" but sometimes "-"
                        let tv = ("death" in save) ? save[ "death" ] : save[ "death rating" ];
                        if( tv.startsWith( "+" ) || tv.startsWith( "-" ))
                          save[ tf ] = Earthdawn.parseInt2( tv ) + ( Earthdawn.getAttrBN( po.charID, "Damage-Death-Rating", 25, true)
                                  - Earthdawn.parseInt2( save[ tf + "Old" ] ));
                        else
                          save[ tf ] = tv;
                      }
                      Adjust( 0x01, tf, undefined, "Damage-Unc-Rating", 20, "Damage-Unconscious-Adjust" );
                      break;
                    case "death":         case "death rating":
                      Adjust( 0x01, tf, undefined, "Damage-Death-Rating", 25, "Damage-Death-Rating-Adjust" ); break;
                    case "wound":         case "wound threshold":
                      Adjust( 0x01, tf, undefined, "Wound-Threshold",    7, "Wound-Threshold-Adjust" );   break;
                    case "recovery tests":
                      Adjust( 0x01, tf, undefined, "Recovery-Tests_max",   2, "Recovery-Tests-Misc-Adjust" ); break;
                    case "phydef":        case "physical defense":
                      Adjust( 0x01, tf, undefined, "PD", 6, "Defense-Phys-Nat-Adjust" );      break;
                    case "spell defense": case "mysdef":  case "mystic defense":
                      Adjust( 0x01, tf, undefined, "MD", 6, "Defense-Myst-Nat-Adjust" );      break;
                    case "socdef":        case "social defense":
                      Adjust( 0x01, tf, undefined, "SD", 6, "Defense-Soc-Nat-Adjust" );       break;
                    case "phyarm":	      case "physical armor":      case "armor":
//log( save[tf]);
                      carryover += save[ tf ][ "remain" ];      break;
//                      Adjust( 0x01, tf, undefined, "PA-Nat", 2, "Armor-Phys-Nat-Adjust" );    break;
                    case "mysarm":        case "mystic armor":
                      carryover += save[ tf ][ "remain" ];      break;
//                      Adjust( 0x01, tf, undefined, "MA-Nat", 2, "Armor-Myst-Nat-Adjust" );    break;
                    case "attack":                      // ED 1st Ed. Attack: 7
                    case "spellcasting":
                    case "attack \\( \\d* \\)": {       // ED 3rd Ed, Attack (5): 11 
                      let rowid = Earthdawn.generateRowID(),
                          pre = Earthdawn.buildPre( "T", rowid ),
                          sc = (tf === "spellcasting");
                      Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "RowID" }, rowid );
                      Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Name" }, sc ? "Spellcasting" : "Attack" );
                      Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Type" }, "Power" );
                      Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Attribute" }, sc ? "Per" : "Dex" );
                      Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Rank" }, save[ tf ][ "val" ] - save[ sc ? "per" : "dex" ] );
                      Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Mod-Type" }, sc ? "Action" : "Attack CC" );
                      Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Target" }, (sc ? "M" : "P" ) + "D1: @{target|Target|token_id}" );
                      Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Target-TA" }, (sc ? "M" : "P") + "D1: @{target|Target|token_id}: @{selected|token_id}" );
                      Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "ArmorType" }, "PA" );
                      Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "CombatSlot" }, "1");
                      Earthdawn.abilityAdd( po.charID, Earthdawn.constant( "Talent" ) + "Attack", "!edToken~ %{selected|" + pre + "Roll}" );
                    } break;
                    case "effect": {    // ED 1st Ed.   Effect: Poison (see below)
                      if( !isNaN( save[ ft ][ "val" ] )) {
                        let rowid = Earthdawn.generateRowID(),
                            pre = Earthdawn.buildPre( "T", rowid );
                        Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "RowID" }, rowid );
                        Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Name" }, "Effect" );
                        Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Type" }, "Power" );
                        Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Attribute" }, "Wil" );
                        Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Rank" }, save[ tf ][ "val" ] - save[ "wil" ] );
                        Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Mod-Type" }, "Effect" );
                        Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "CombatSlot" }, "1");
                        Earthdawn.abilityAdd( po.charID, Earthdawn.constant( "Talent" ) + "Effect", "!edToken~ %{selected|" + pre + "Roll}" );
                      }
                    } break;
                    case "damage": {    // ED 3rd ED. The problem here is that the actual damage step(s) may be on the line(2) below. 
                                        // Damage: Bite (1): 6; Physical Armor: 0
                                        // 2×Claws (2): 7; Tail (3): 8 Mystic Armor: 1
                                        // Rule. if Physical Armor and/or Mystic Armor have a newline in them. Then that part is really the continuation of damage. 
                                        // ED 1st ED.   Damage: 8
//log( "carryover " + carryover);
//log( save[tf]);
//log( save[tf]["field"]);
                      let t = (save[ tf ][ "field" ] + carryover).slice( 7 );   // slice off the label (damage:)
                      let dmgarr = t.split( ";" ),
                          sc = (tf === "effect");
                      for( let i = 0; i < dmgarr.length; ++i ) {
                        let beg = dmgarr[ i ].indexOf( "(" ),
                            end = dmgarr[ i ].indexOf( ")" );
                        if( beg !== -1 && end !== -1 ) {
                          let rowid = Earthdawn.generateRowID(),
                              pre = Earthdawn.buildPre( "WPN", rowid ),
                              nm = dmgarr[ i ].slice(0, beg).trim();
                          Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "RowID" }, rowid);
                          Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Name" }, nm);
                          Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name:
                                pre + ((state.Earthdawn.sheetVersion < 1.8 ) ? "Base" : "Rank" )}, Earthdawn.parseInt2( dmgarr[ i ].slice( beg + 1, end )));
                          Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "CloseCombat" }, "1");
                          Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "CombatSlot" }, "1");
                          Earthdawn.abilityAdd( po.charID, Earthdawn.constant( "Weapon" ) + nm, "!edToken~ %{selected|" + pre + "Roll}" );
                        } else 
                          po.edClass.errorLog( "ED.textImport.Damage: unable to parse: '" + dmgarr[ i ] + "' of " + t);
                      }
                      carryover = "";
                    } break;
                    case "actions": {   // Actions: 2; Bite: 18 (14), Claw x2: 18 (13)
                                // Actions: 0; Attack +3 (Damage +1)
                      let t = save[ tf ];
                      if( !mult && t && t[ "remain" ] ) {     // This is a new creature, and we have attacks and damage to add.
                        let ttmp = t[ "remain" ].replace( /\)\s*\,/g, ")" + Earthdawn.constant( "Colon" ));   // comma sometimes comes inside a damage paren, so can't just split on comma.
                        let gmnotes = "<b>" + tf.slice(0, 1).toUpperCase() + tf.slice( 1 ) + ":</b> " + t[ "val" ] + " - ",
                          att = ttmp.split( Earthdawn.constant( "Colon" ));
                        for( let i = 0; att && i < att.length; ++i ) {
                          let a2 = att[ i ];
                          let fnd3 = a2.match( /\s+x\d+[\:\s]+/g );   // if there is something that looks like space an x, digits, an optional colon and a space, it is number of claws the creature has, get rid of it.
                          if( fnd3 )
                            a2 = a2.replace( fnd3[ 0 ], " " );
                          let fnd = a2.match( /\(.+?\)/ );      // everything inside paren
                          if( fnd ) {
                            let dmgMaybe = fnd[0].replace( /[\(\,\)]/g, "" ).trim(),    // trim off ( and ) and comma
                              disp;
                            let dmg = getSR(dmgMaybe);
                              disp = dmgMaybe.replace( dmg, "" ).trim();    // If there is anything else left over after the damage has been removed, display it when talent is used. This is likely a note like "Poison", etc.
                            a2 = a2.replace( fnd[ 0 ], "" );    // get rid of paren and everything inside it.
                            let fnd2 = a2.match( /[\d\sSR\+\-]+$/ );    // digits near the end.
                            if( fnd2 ) {
                              let atk = getSR(fnd2[ 0 ]);
                              a2 = a2.replace( fnd2[ 0 ], "");
                              let typ = a2.replace( /[:;]/g, "" ).trim();
                              if( typ ) {
                                let rowid = Earthdawn.generateRowID();
                                let pre = Earthdawn.buildPre( "WPN", rowid );
                                Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "RowID" }, rowid);
                                Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Name" }, typ + (disp ? " (" + disp + ")" : ""));
                                Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name:
                                    pre + ((state.Earthdawn.sheetVersion < 1.8 ) ? "Base" : "Rank" )}, dmg - save[ "str" ]);
                                Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "CloseCombat" }, "1");
                                Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "CombatSlot" }, "1");
                                Earthdawn.abilityAdd( po.charID, Earthdawn.constant( "Weapon" ) + typ, "!edToken~ %{selected|" + pre + "Roll}" );
                                gmnotes += "   <i>" + typ + ":</i> " + atk + " (" + dmg + (disp ? " " + disp: "") + ")";

                                rowid = Earthdawn.generateRowID();
                                pre = Earthdawn.buildPre( "T", rowid );
                                Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "RowID" }, rowid);
                                Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Name" }, "Atk " + typ);
                                Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Type" }, "Power");
                                Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Attribute" }, "Dex");
                                Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Rank" }, atk - save[ "dex" ]);
                                Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Mod-Type" }, "Attack CC");
                                Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Target" }, (t[ "val" ] > 1) ? "PD" : "PD1: @{target|Target|token_id}");
                                Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "Target-TA" }, (t[ "val" ] > 1) ? "PD" : "PD1: @{target|Target|token_id}: @{selected|token_id}");
                                Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "ArmorType" }, "PA");
                                if( disp )
                                  Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "SuccessText" }, disp);
                                Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: pre + "CombatSlot" }, "1");
                                Earthdawn.abilityAdd( po.charID, Earthdawn.constant( "Talent" ) + "Atk " + typ, "!edToken~ %{selected|" + pre + "Roll}" );
                        } } } }
                        save[ tf ] = gmnotes;
                      } else if( mult && t && t[ "remain" ] ) {     // This is a Mask, and we might have modifications to attacks and damage to process.
                        let atk, dmg, atk2, dmg2,
                          t2 = statBlock( t[ "remain" ], "Damage", null, "nocolon num" );
                        if( t2 ) {
                          dmg2 = (t2[ "val" ] * mult);
                          dmg = dmg2 - (Earthdawn.parseInt2( save[ "str" ]) * mult);
                        }
                        t2 = statBlock( t[ "remain" ], "Attack", null, "nocolon num" );
                        if( t2 ) {
                          atk2 = (t2[ "val" ] * mult);
                          atk = atk2 - (Earthdawn.parseInt2( save[ "dex" ]) * mult);
                        }
                                // For every weapon, and for every talent that is an attack or damage, apply the modifications.
                        if( atk || atk2 || dmg || dmg2 ) {
                          let attributes = findObjs({ _type: "attribute", _characterid: po.charID });
                          _.each( attributes, function (att) {
                            if( att.get("name").endsWith( "_Mod-Type" )) {
                              if( atk && att.get( "current" ).startsWith( "Attack" )) {
                                let x = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID,
                                      name: att.get("name").slice(0, -9)  + "_Rank" });
                                Earthdawn.setWithWorker( x, "current", Earthdawn.parseInt2( x.get( "current" )) + atk);
                              }
                              else if( atk2 && att.get( "current" ) === "Action" ) {
                                let x = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID,
                                      name: att.get("name").slice(0, -9)  + "_Rank" });
                                Earthdawn.setWithWorker( x, "current", Earthdawn.parseInt2( x.get( "current" )) + atk2);
                              }
                              else if( dmg && att.get( "current" ).startsWith( "Damage" )) {
                                let x = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID,
                                      name: att.get("name").slice(0, -9)  + "_Rank" });
                                Earthdawn.setWithWorker( x, "current", Earthdawn.parseInt2( x.get( "current" )) + dmg);
                              }
                              else if( dmg2 && att.get( "current" ) === "Effect" ) {
                                let x = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID,
                                      name: att.get("name").slice(0, -9)  + "_Rank" });
                                Earthdawn.setWithWorker( x, "current", Earthdawn.parseInt2( x.get( "current" )) + dmg2);
                              }
                            } else if ( dmg && att.get("name").endsWith(( state.Earthdawn.sheetVersion < 1.8 ) ? "_WPN_Base" : "_WPN_Rank" ))
                              Earthdawn.setWithWorker( att, "current", Earthdawn.parseInt2( att.get( "current" )) + dmg);
                            else if( atk2 && (att.get( "name" ) === "SP-Spellcasting-Rank" || att.get( "name" ) === "SP-Power-Rank")
                                  && att.get( "current") !== 0)
                              Earthdawn.setWithWorker( att, "current", Earthdawn.parseInt2( att.get( "current" )) + atk2);
                          }); // End for each attribute.
                          if( atk ) {
                            let x = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: "Attack-Rank" });
                            if (x)  {
                              let y = x.get( "current" );
                              if( y )
                                Earthdawn.setWithWorker( x, "current", Earthdawn.parseInt2( y ) + atk);
                        } } }
                      } else if ( t && t[ "val" ] )   save[ tf ] = "<b>" + tf + ":</b> " + t[ "val" ];
                      else save[ tf ] = tf;
                    } break;  // end Actions
                    case "suggested powers":
                    case "starting powers":
                    case "sample distribution":
                      var sugPowers = true;     // We fall through on purpose, these are processed the same way.
                    case "powers": {
                      let t = save[ tf ];
                      if( !t )
                        break;
                      let sp = t[ "field" ],
                        cntnewlines = t[ "raw" ].match( /\n/g ),
                        cntnewlinesagain = sp.match( /\n/g ),
                        gmnotes = "<b>" + tf.slice(0, 1).toUpperCase() + tf.slice( 1 ) + ":</b> ",
                        lst, lst2 = "", cnt = 0;
                      if( cntnewlines && cntnewlinesagain && cntnewlines.length !== cntnewlinesagain.length ) {   // One of the newlines got stripped off when we removed the label. that means the label terminated in a newline, therefore there is no lst, only lst2.
                        lst = "";     // There is no list of standard powers such as spirits have.
                        lst2 = sp;      // This is the list of custom powers.
                      } else {    // Spirits and some dragons have a comma delimited short list of standard powers, followed by a longer list of custom powers. Get both.
                        let endlist = sp.search( /\nPowers\n/ );
                        if( endlist === -1 )
                          endlist = sp.search( /\n.+:/ );     // Find end of comma delimited list of common powers, and start of list of custom powers. We do different things with these two lists.
                        else
                          sp = sp.replace( /\nPowers\n/, "\n" );    // In sample spirits, we get powers summary, suggested powers summary, and then custom powers. Get rid of that third label.
                        if( endlist != -1 ) {
                          lst = "," + sp.slice( 0, endlist).replace( "\n", " " ) + ",";   // starting and ending with a comma, makes searching easier.
                          lst2 = sp.slice( endlist);
                        } else
                          lst = "," + sp.replace( "\n", " " ) + ",";
                      }
//log( "lst  " + lst); log( "lst2 " + lst2);

                          // These are the "common" powers listed in short form immediately after the section header "Powers".
                          // for list items, look for label. Then check to see if label is followed by (nn).
                      function checkPower( toFind, step, actn, txt ) {
                        'use strict';
                        try {
                          let fnd = lst.match( new RegExp( Earthdawn.constant( "comma" ) + "[^" + Earthdawn.constant( "comma" ) + "]*?"
                                + toFind.replace( /\\s+/g, "\s*") + "[^" + Earthdawn.constant( "comma" ) + "]*?"
                                + Earthdawn.constant( "comma" ), "gi" ) );   // comma, anything, string to search for, anything, comma.
                          if( fnd ) {       // We have found the search string, so process this power.
                            let attra, attraVal = 0;

                            function getAttra( att ) {
                              if( attra === undefined ) {   // We should not ever see two attributes in a step, but if we did it would break stuff, so don't allow it.
                                let fnd4 = step.match( new RegExp( "\\b" + att + "\\b", "gi" ));
                                if( fnd4 ) {
                                  attra = att;
                                  attraVal = save[ att.toLowerCase() ];
                                  step = step.replace( fnd4[ 0 ], "");      // strip the attribure out of step so it will not be included in getSR below.
                              } }
                            } // end getAttra
                            for( let i = 0; i < 6; ++i )
                              getAttra( [ "Dex", "Str", "Tou", "Per", "Wil", "Cha" ][i] );

                            let stp, dispTxt, item = fnd[ 0 ],
                              rawPwrFnd = item.replace( new RegExp(Earthdawn.constant( "comma" ), "g"), "").trim();     // strip out commas
                            let pwrFnd = rawPwrFnd;
                            lst = lst.replace( item, Earthdawn.constant( "comma" ));      // remove the whole thing found from list, replaced with a comma.
                            let fnd2 = item.match( /\(.+?\)/ );     // have something inside parentheses
                            if( fnd2 ) {    // have a step value specified. Use that.
                              let s = fnd2[ 0 ].replace( /[\(\)]/g, "" ).toUpperCase();     // Strip the parentheses away
                              pwrFnd = pwrFnd.replace( fnd2[ 0 ], "");
                              if( s.indexOf( "," ) === -1 )
                                stp = getSR( s ) - attraVal;
                              else {      // we have a comma inside the parentheses.  I THINK this only happens for Spirits Karma.
                                let t1 = [],
                                  t2 = s.split( "," );
                                for( let n = 0; n < t2.length; ++n )
                                  if( !isNaN( t2[ n ] ) )
                                    t1.push( t2[ n ] );
                                if( t1.length > 0 )
                                  stp = t1;     // Have a comma delimited list of numbers.
                              }
                              let a = fnd2[ 0 ].match( /[^A-Z][A-Z]{3}[^A-Z]/i );   // Three Letters, without letters before or after. That should be Dex or Cha, or whatnot.
                              if( a ) {
                                let a2 = a[ 0 ].slice(0, 1).toUpperCase() + a[ 0 ].slice( 1, 3).toLowerCase();
                                if( "Dex  Str  Tou  Per  Wil  Cha".indexOf( "a2" ) !== -1 )
                                  attra = a2;
                              }
                            } else    // If don't have a step value specified, use the powers default formula.
                              stp = getSR( step );
                            let fnd3 = item.match( /\[.+?\]/ );
                            if( fnd3 ) {
                              dispTxt = fnd3[ 0 ].slice( 1, -1).trim();
                              pwrFnd = pwrFnd.replace( fnd3[ 0 ], "");
                            }
                            gmnotes += (cnt++ ? ", " : " ") + rawPwrFnd;
                            adjustPower( toFind, pwrFnd.trim(), stp, attra, actn, txt, dispTxt);
                          }
                        } catch(err) { po.edClass.errorLog( "ED.textImport.checkPower() error caught: " + err ); }
                      } // end checkPower


                      if( lst ) {
                        function saveComma( open, close ) {
                          let m = lst.match( new RegExp( "\\" + open + "[^\\" + close + "]*?" + Earthdawn.constant( "comma" ) + ".*?" + "\\" + close, "g" ));   // open, anything, comma, anything, close.
                          if( m )
                            for( let i = 0; i < m.length; ++i ) {
                              let n = m[ i ].replace( new RegExp( Earthdawn.constant( "comma" ), "g"), "," ).replace( /\n/g, " ");
                              lst = lst.replace( m[ i ], n);
                            }
                        }
                        lst = lst.replace( /\,/g, Earthdawn.constant( "comma" ));     // change all comma's to something else.
                        saveComma( "(", ")");   // Now change any comma's inside paren back to comma's.
                        saveComma( "[", "]");
                        saveComma( "{", "}");

                                // Misc Powers that appear often enough to list here.
                        checkPower( "Astral Sight", "Per", "Simple", "The adept sees into the astral plane, and is able to view the astral patterns and imprints. He makes an Astral Sight test against a base Difficulty Number of 6, modified by the local conditions of astral space. If successful, he can see astral imprints and magical auras. He can also examine the patterns of any target with a Mystic Defense equal to or lower than the test result.\n"
                          + "Each use of the talent lasts for a number of rounds equal to the Astral Sight rank, and the adept can only see astral impressions that are within his Astral Sight rank x10 yards.\n"
                          + "More information on perceiving astral space and the Difficulty Numbers associated with it are explained in the Workings of Magic chapter (see Using Astral Sensing, p. 209). Examining magical items using Astral Sight does not provide any information about the item’s history or reveal any Key Knowledges (p. 221).");

                                // Dragon Powers
                        checkPower( "Armored Scales", "NA", "NA", "A dragon’s armored hide provides great physical and magical protection against attack. Damage resulting from extra successes on attacks is reduced by one per success. For example, under normal circumstances each additional success from an attack with a melee weapon does +2 damage. Against a dragon with Armored Scales, each additional success only does +1 damage. "
                          + "This damage reduction also applies to spells that deal extra damage with additional successes, but not extra damage based on additional threads." );
                        checkPower( "Dispel Magic", "Rank + WIL", "Simple", "Because of their innate understanding of magical forces, dragons can disrupt magical effects at will. This power works like the Dispel Magic talent (Player’s Guide, p. 139), but does not require a Standard action, and has a range of 30 yards. Additionally, this power can be used to dispel the magical effects of creature powers (including Horror and dragon powers) with a sustained duration. "
                          + "Use the power’s Step Number as the Circle on the Dispel Difficulty Table (Player’s Guide, p. 265) to determine the Difficulty Number for the Dispel Magic test. If a creature power or ability Step Number is higher than 15, add +1 to the Dispel Difficulty for each Step above 15. For example, a power with Step 17 would have a Dispel Difficulty of 27 (25 + 2)." );
                        checkPower( "Disrupt Fate", "Rank + WIL", "Free", "This power allows the dragon to alter the fate of other creatures. The dragon spends a Karma Point and then makes a Disrupt Fate test against the Mystic Defense of a target within line of sight. If successful, the target must immediately repeat the most recent test made. The new test result stands and cannot be disrupted a second time.\nAs long as the dragon has Karma Points available, "
                          + "it may make as many Disrupt Fate tests as there are targets. Spending the Karma Point entitles the dragon to use this ability; the dragon’s Karma Step is not added to the test." );
                        checkPower( "Dominate Beast", "Rank + WIL", "Standard", "This dragon can control beasts, similar to the Beastmaster talent of the same name (Player’s Guide, p. 140). The dragon makes a Dominate Beast test against the Mystic Defense of any beasts the dragon wishes to control. If successful, the dragon controls the target creatures for a number of minutes equal to its Dominate Beast Step.\nUnlike the Beastmaster talent, "
                          + "the dragon may use this power to dominate multiple creatures at once, but no more than their total Step in Dominate Beast.\nAn animal under the effect of this power will not take any hostile action against the dragon, and will perform one simple task for the dragon that does not exceed the duration of the power. Attempts to dominate or control a beast under the effect of this power must exceed the dragon’s Dominate Beast Step." );
                        checkPower( "Dragon Breath", "Rank + 15", "Simple", "Dragons are famous, and rightfully feared, for their fiery breath. Every culture has tales of a furious dragon raining destruction down on villages, towns, or cities. Dragon Breath targets everything within a 90-degree arc, using the dragon’s mouth as the arc’s center. The distance the flame extends is based on how much Strain the dragon is willing to take, as indicated on the Dragon Breath Table.\n "
                          + "The dragon makes a Dragon Breath test and compares the result against the Mystic Defense of each target within the area of effect. All affected targets catch fire, taking damage from the flames equal to the test result, reduced by Physical Armor.\n Dragon Breath damages and burns items, including armor and weapons. Combustible items are destroyed in short order, while non-combustible items takes damage each round, potentially rendering them "
                          + "useless, though magical items are only affected if the dragon’s Dragon Breath test equals or exceeds the item’s Mystic Defense. Armor and weapons suffer 2 points of item damage each round they are exposed to the flames, with the losses being spread as evenly as possible among the item’s ratings. For example, fernweave armor would lose 1 point each from its Physical and Mystic Armor each round.\nIf a weapon’s Damage Step, a shield’s Physical "
                          + "Defense bonus, or suit of armor’s Armor ratings are reduced to 0, the item is destroyed. If an item is not completely destroyed, damage may be repaired as normal (Player’s Guide, p. 411 for damaged weapons, p. 415 for armor and shields).\nDragon Breath Table: Strain (Range) 1 (10 yards)   5 (20 yards)    15 (40 yards)    30 (60 yards)" );
                        checkPower( "Dragonsight", "Rank + PER", "Simple", "A dragon’s affinity with magic gives them the ability to view astral space. Dragonsight is a heightened version of the Astral Sight talent (Player’s Guide, p. 129), except dragons do not have to spend Strain to use it. The dragon makes a Dragonsight test as an astral sensing test. For more information about the use of astral sensing abilities, "
                          + "see the Workings of Magic chapter in the Player’s Guide, p. 209." );
                        checkPower( "Dragonspeech", "Rank + CHA", "Free", "Dragonspeech is the natural method of communication between dragons. It allows the user to transmit thoughts directly to any being within range. The dragon can also send simple images as well as speech through its mental link. The target hears the dragon as a separate ‘voice’ in his head and recognizes it as the dragon. Dragonspeech transcends language, "
                          + "allowing a dragon to communicate with another being whether or not it normally understands the subject’s language. The dragon can communicate with spirits and uses this power in place of Spirit Talk or Elemental Tongues for negotiations.\nThis power also allows a dragon to summon spirits. Unlike Namegiver magicians, dragons may summon any type of spirit. "
                          + "The power otherwise works as described as the Summon talent in the Player’s Guide, p. 171, including the Action type (i.e. a dragon using Dragonspeech to summon a spirit is a Sustained action, as per the Summon talent)." );
                        checkPower( "Fear", "Rank + CHA", "Simple", "Dragons project an intimidating, even terrifying presence. Many would-be heroes flee in terror when coming face to face with a dragon. The dragon makes a Fear test and compares the result against the Mystic Defense of all characters within 40 yards. If successful against a given character, the victim will sweat, stammer, and exhibit other signs of fright.\n"
                          + "The affected character has a difficult time taking any kind of hostile action against the dragon. Any tests the character makes against the dragon suffer a -2 penalty per success scored on the dragon’s Fear test until the next sunrise or sunset (whichever comes first). This power cannot be used against a target again until the duration has expired, even if it was initially ineffective; "
                          + "this does not provide any protection for other targets in the area. This power has no effect on targets that are immune to fear." );
                        checkPower( "Karma Cancel", "Rank + WIL", "Simple", "One of a dragon’s subtler but effective powers, Karma Cancel allows a dragon to override another character’s use of Karma. The dragon makes a Karma Cancel test against the Mystic Defense of a target character within line of sight. Once this power has been successfully used, the dragon may spend its Karma Points to cancel the target’s use of Karma on a test as a Free action until the "
                          + "next sunrise or sunset (whichever comes first).\n If a target spends multiple Karma Points on a test (for example, when using the True Shot talent), the dragon must spend the same number of points to cancel them. Karma Cancel does not require an action; a dragon may attempt to cancel an opponent’s use of Karma at any time so long as it still has Karma Points to spend." );
                        checkPower( "Karma Points", "NA", "NA", "All dragons have the ability to use Karma. The value given in parentheses after the Karma power in the dragon’s description indicates the dragon’s Karma Step. The dragon has a pool of Karma Points equal to its Karma Step x 4, which it can spend on any test. Unless otherwise noted by a particular power, a dragon may only spend one point of Karma per test.\nNearly all Horrors, and some Horror constructs, "
                          + "have Karma Points they may spend on any test, though they may only spend one point on any given test. Horrors and their ilk do not naturally replenish Karma Points like dragons, Namegivers, and spirits. Instead they use the Harvest Energy power, and some Horrors may have other avenues as well. Horrors have a Karma Pool of their Karma Step x 4, while Horror constructs and undead with Karma generally have their Karma Step x 2." );
                        checkPower( "Lair Sense", "Rank + PER", "Free", "A dragon’s lair is an extension of itself, and it can notice intruders anywhere within its lair. The dragon makes a Lair Sense test against the Mystic Defense of a character who performs a test while in the dragon’s lair. If successful, the dragon detects the character and knows his location within the lair. "
                          + "This power can only be used against a given target once every ten minutes.\n Dragons often set traps in their lairs to take advantage of this power, forcing characters to beat the traps by performing an action that reveals their presence." );
                        checkPower( "Poison", "Rank + TOU", "NA", "Dragons with this power are able to damage a victim with poison. If the victim suffers damage from an envenomed attack, they must resist the poison’s effects. Some dragons have venomous fangs; others have a stinger on their tail or glands that inject venom with their claws.\nThe poison is typically a damaging poison as described in the game statistics, but may be of any variety. "
                          + "Some dragons even have a combination of poison types. See Poison, p. 171 for more information on the game statistics provided. A single character can only suffer from one use of the Poison power at a time.\nThis power allows a Horror to poison a victim after dealing damage with claws, teeth, or stinger. No test is required. The Rank is the poison’s Step Number. "
                          + "Additional details about the poison are provided in the Horror’s game statistics. See Poison, p. 171, for more information on poisons and how they work." );
                        checkPower( "Regeneration", "Rank + TOU", "Simple", "Dragons can easily heal damage done to them. The dragon makes a Regeneration test and reduces its Current Damage by the total. Use of this power costs the dragon a Recovery test and 1 Karma Point (the Karma Point spent does not add to the result of the test). This power may be used to heal a Wound, but if used in this fashion it does not reduce the Current Damage." );
                        checkPower( "Skills", "NA", "NA", "Some Dragons or Horrors have powers based on skills. Refer to the Skills chapter on p. 183 of the Player’s Guide for a description of each skill and how it works." );
                        checkPower( "Spellcasting", "Rank + PER", "Standard", "Dragons have an inherent ability to manipulate the energy of astral space, and as a result cast spells. Dragons can use their Spellcasting power to cast any spell as Raw Magic. The dragon doesn’t need to know the spell, it simply shapes the astral energy to its will and the spell happens.\n Dragons still weave threads to cast spells, using their Thread Weaving power (p. 174). "
                          + "Hatchlings need to weave the normal number of threads to cast a spell, adults only need to weave half the normal number of threads (round down), and great dragons do not need to weave threads at all.\n Dragons do not use spell matrices, casting all of their spells as raw magic. A dragon casting a spell would still potentially suffer the effects of warping or damage, but their innate power and high magic resistance "
                          + "greatly reduce the effects of tainted astral energy on their spellcasting. Dragons are, however, wise enough to not recklessly cast powerful magic in corrupt areas. While the damage they might suffer is small, the threat posed by a Horror—especially one powerful enough to mark a dragon—gives even these mighty Namegivers pause." );
                        checkPower( "Suppress Magic", "Rank + WIL", "Standard", "Some dragons have developed their ability to shape magic to such a degree they can quash the use of magic by other creatures. The dragon makes a Suppress Magic test against the Mystic Defense of a target within 30 yards. If successful, the dragon reduces the target’s use of magical abilities by applying a -2 penalty per success to magical talents, "
                          + "the damage from magical weapons, and any other magic use. When applied to magic armor and weapons, this will not reduce the protection or damage beneath the mundane protection provided; e.g. a threaded troll sword enhanced with Forge Weapon cannot have a Damage Step less than STR + 6 due to this power. This power lasts until the next sunrise or sunset (whichever comes first) and may only be used against a given target once per day. "
                          + "A dragon can selectively use this ability to suppress a specific type of magic, such as talents, magic items or spells, instead of suppressing all types." );
                        checkPower( "Wingbeat", "Rank + STR", "Standard", "Dragons with wings can use them to knock over opponents. The power affects all characters in a 10-yard long 90-degree arc in front of the dragon. The dragon makes a Wingbeat test, and all characters within the area of effect must make a Knockdown test against the test result. If a character fails the Knockdown test, they are knocked back a number of yards equal to the amount they failed the test. "
                          + "For example, a character failing the Knockdown test by 8 is knocked back 8 yards." );

                                // Horror Powers
                        checkPower( "Animate Dead", null, "Standard", "This power allows a Horror to animate the corpse of a dead Namegiver, resulting in the creation of a cadaver man, ghoul, or other undead construct (the type of undead will depend on the Horror). The Horror touches the victim and makes an Animate Dead test against the target’s Mystic Defense, using the Mystic Defense the target had while alive. If successful, the victim is raised. "
                          + "Not all Horrors are required to touch the victim to make use of this power. The Horror may have a number of individual undead under their control up to their Animate Dead Step. If the Horror is within Animate Dead Step miles of the undead, it can telepathically control the undead, issuing commands as a Simple action. Otherwise the undead acts on its own." );
                        checkPower( "Astral Camouflage", null, "Standard", "This power allows a Horror to hide its presence in astral space. The Horror increases the Difficulty number for Perception, Astral Sight, or similar tests to notice the Horror by the Astral Camouflage Step. This power lasts until the Horror takes an action that reveals its presence." );
                        checkPower( "Aura of Awe", null, "Standard", "This power allows a Horror to influence the attitude of characters towards it. The Horror makes an Aura of Awe test and compares it to the Social Defense of each character within Aura of Awe Step x 4 yards. If successful the target adopts a Neutral stance towards the Horror. For each additional success, the target’s attitude improves one degree to a maximum of Awestruck (see p. 142 for more information on "
                          + "Attitudes). The effects of this power last until the next sunrise, but can be extended by the Horror with additional uses of the power. When a player character is affected by this power, the gamemaster should secretly instruct the player to behave appropriately, and may overrule decisions that run counter to the effects of this power.\nThe effects of this power end if the Horror directly or obviously harms the target." );
                        checkPower( "Corrupt Compromise", null, "Standard", "This power intertwines the Horror mark on a victim in a complex fashion, creating an astral tumor on the victim’s pattern. The Horror spends one Karma Point and suggests a course of action to a victim they have marked, offering a bonus to one of the character’s traits or abilities. If the victim follows the course of action in spirit, not just letter, the victim gains a Corruption Point, but the bonus "
                          + "becomes permanent, acting like a thread tied to a pattern item (Player’s Guide, p. 226). Bonuses from this power apply to any circumstance, except actions against the marking Horror.\nIf the marked victim does not follow the course of action with all sincerity, the marking Horror gains a bonus to one of its own traits or powers. These bonuses apply only against the victim.\nThis power demonstrates the potential folly of striking a deal with a "
                          + "Horror. Resisting makes the Horror more powerful against the victim, making it easier for the Horror to carry out threats, or making it harder for the character to defeat. On the other hand, attempts to use the Horror’s power to good ends results in long-term corruption.\nThe Horror can provide bonuses to a number of traits or powers equal to their Corrupt Compromise Step, and the maximum bonus to each individual trait is also equal to that Step. "
                          + "Bonuses can be provided to any trait or ability that can be increased by thread magic. A Horror’s powers count as talents for this purpose.\nSome powerful Horrors have the ability to use their trait bonuses against any target to whom the victim has a thread attached (such as through a pattern item), or even those with whom they share a Pattern (such as a group pattern or Blood Sworn)." );
                        checkPower( "Corrupt Karma", null, "Standard", "This power allows the Horror to override another character’s use of Karma. The Horror makes a Corrupt Karma test against the target’s Mystic Defense. Each success allows the Horror to prevent the target’s use of Karma on one test as a Free action. The target’s Karma Point is spent, but does not provide any additional dice to the test result." );
                        checkPower( "Corrupt Reality", null, "Standard", "This power allows a Horror to distort the fabric of reality, affecting the area around a victim it has previously marked. The Horror uses these effects to alarm and torment the victim and those in his vicinity. This will isolate the victim, as other people will avoid his company to escape the strange events.\nThe Horror spends a Karma Point and makes a Corrupt Reality test and compares it to the "
                          + "Mystic Defense of each character the Horror wishes to affect. If successful, the target suffers a -1 penalty to Mystic and Social Defense for each success.\nThe Horror can selectively affect any characters within Corrupt Reality Step x 2 yards of the marked victim. The penalties fade at the rate of 1 per day; subsequent uses of this power stack with the previously accrued penalties.\nTypical manifestations include spoiling food and drink, changes "
                          + "in temperature, eerie sounds, mundane objects transforming into slime-covered parodies, or any number of other strange or surreal manifestations. These effects last for a number of rounds up to the Corrupt Reality Step, and cannot be dispelled or disbelieved, though the Horror may end them earlier if desired\nAn object transformed by this power returns to normal after the duration ends, with no trace of the change or permanent ill effect. "
                          + "This power cannot cause damage to living beings, though the fear and mental stress resulting from extended exposure to this ability may cause a victim or those near him to lash out and harm themselves or others." );
                        checkPower( "Cursed Luck", null, "Free", "This power allows a Horror to inflict bad luck on a target. The Horror makes a Cursed Luck test against the Mystic Defense of a target within line of sight. Each success reduces the result of one die rolled on a test to 1. The highest die values are affected first, and all reductions are done before any potential bonus dice are rolled. This power may be used once per round.\nMica is attacking a Horror with his "
                          + "Melee Weapons talent, which is at Step 15/D12+2D6. The Horror uses its Cursed Luck power on the unfortunate Swordmaster, and rolls an 18 against Mica’s Mystic Defense of 11, scoring two successes, meaning two dice will be reduced to 1.\nOn his Melee Weapons test, Mica’s player rolls a 5 on the D12, a 6 on one D6, and a 2 on the other D6. The 6 and the 5 are each reduced to a result of 1 (canceling the bonus die that would have resulted from the "
                          + "6 on the D6) and the final test result is 4.\nThe gamemaster is encouraged to describe the way the bad luck manifests and affects the result of the test. If the Horror scores more successes than the character is rolling dice, the attempt automatically fails and at gamemaster’s discretion may result in additional misfortune that inflicts a penalty on the character’s next related test, or require their next Standard action to overcome." );
                        checkPower( "Damage Shift", null, "Simple", "This power allows the Horror to shift damage it has taken to another character within line of sight. The Horror makes a Horror Power test against the victim’s Mystic Defense. If successful, it can transfer an amount of current damage from itself to the victim, up to a maximum equal to the result of a Damage Shift test. "
                          + "This power does not transfer Wounds, but the damage dealt from the transfer may cause a Wound to the victim." );
                        checkPower( "Disease", null, "NA", "This power allows the Horror to infect a victim with a disease. No test is required; the victim is infected if the Horror causes damage with a physical attack, or otherwise succeeds at infecting the victim based on the rules provided in the Horror’s description. "
                          + "The Step Number indicates the Difficulty Number for tests made to resist the effects of the disease, as well as attempts to diagnose or treat the illness. Additional details about the disease are provided in the Horror’s game statistics. See Disease, p. 186, for more information on diseases and how they work." );
                        checkPower( "Displace", null, "Standard", "This power allows a Horror to cross between the physical and astral realms. No test is required, but the Horror must use a Standard action to cross between realms. If a single-natured Horror with this power crosses into astral space, its body disappears from the physical." );
                        checkPower( "Disrupt Magic", null, "Standard", "This power allows a Horror to end sustained magical effects. It works like the Dispel Magic talent (Player’s Guide, p. 139) with a range of Disrupt Magic Step x 2 yards, but does not cost strain and can be used against any magical effect with an extended duration. The Horror makes a Disrupt Magic test against the effect’s Dispel Difficulty.\n For effects not the result of talents or spells, "
                          + "use the power’s Step Number as the Circle on the Dispel Difficulty Table (Player’s Guide, p. 265) to determine the Difficulty Number. If a creature power or ability Step Number is higher than 15, add +1 to the Dispel Difficulty for each Step above 15. For example, a power with Step 17 would have a Dispel Difficulty of 27 (25 + 2)." );
                        checkPower( "Forge Construct", null, "Sustained", "This power allows a Horror to create constructs from other life forms including mundane animals, magical creatures, and Namegivers, even inanimate objects. If a Horror uses this power on a living Namegiver, it often leaves some portion of the victim’s mind intact and aware of his fate.\n To use this power on a living target, the Horror must first successfully mark the victim. "
                          + "The Horror spends 5 Karma Points to infuse the target with the Horror’s twisted magical essence to begin the change. This Karma only powers the ability; it does not add dice to the test. The Horror makes a Forge Construct test against the target’s Mystic Defense. Each success allows the Horror to change one of the target’s attributes by one Step or grants the construct a power or special ability. The Horror can make multiple tests, "
                          + "but must wait a minimum of one day before making a new test. Some Horrors intentionally draw out the transformation in order to prolong the suffering of a victim aware of what is happening to them. The Horror only needs to spend the 5 Karma to initiate the process, Karma is not required to fuel subsequent tests.\nLiving victims can resist the process. For each Forge Construct test, the victim may make a Willpower test and substitute "
                          + "it for their Mystic Defense if the result is higher.\nOnce the Horror has made all the desired changes to the victim, it ends the process by making a final Horror Mark test to form a link between itself and the construct. If successful, the transformation is complete and the construct is under the control of the Horror who created it. Many Horrors will create a construct and set it loose to roam Barsaive causing pain and destruction on "
                          + "behalf of its master.\nSome dual-natured Horrors use this ability to create a new body if their current one is destroyed, and this power is sometimes built into cursed items that transform the user into a construct." );
                        checkPower( "Forge Trap", null, "Standard", "This power allows the Horror to alter the nature of a stone, metal, or earthen passage to become a trap or contain one. The Horror makes a Forge Trap test, and distributes the points from the test among the trap’s game statistics. See Traps, p. 179 for more information on traps.\n"
                          + "Horrors have the ability to feed off the pain created by the trap and use the Harvest Energy power to gain Karma from any character injured by the trap." );
                        checkPower( "Harvest Energy", null, "Free", "This power allows Horrors to regain Karma by feeding off their preferred nourishment. This is most commonly negative emotion, but other preferred meals exist. If a character is in the grip of strong negative emotions like hate, fear, jealousy, or pain (such as from suffering a Wound) the Horror can make a Harvest Energy test against the victim’s Social Defense. Each success restores one point of "
                          + "Karma to the Horror.\nSome Horrors have preferred sources of nourishment, and gain an additional point of Karma even if the test is a failure. Horrors with the ability to create constructs or undead may feed through any construct or undead under their control." );
                        checkPower( "Horror Power", null, "Standard", "This ability is used in conjunction with other powers, typically against one of the target’s Defense Ratings. The description will note the power or powers with which it is associated and the appropriate action type." );
                        checkPower( "Horror Mark", null, "Standard", "This power allows a Horror to mark victims and items, linking the Horror and a  target within line of sight. The Horror makes a Horror Mark test against the target’s Mystic Defense. If successful, the Horror places its mark on the target, concealed within their True Pattern. The mark links the Horror and the target over significant distances. This allows the Horror to keep track of its chosen victim, "
                          + "communicate with them, and in some cases even use its powers on the victim outside of their normal range.\nIn general, if the Horror is within 10 miles of the victim it may use any of its powers on or through the victim with no restriction. Up to 100 miles the Horror may use powers that do not directly cause damage, and communication is possible up to 1,000 miles. A Horror mark typically lasts until the Horror dies. Some marks last only "
                          + "for a year and a day, though a Horror can extend the duration with a new Horror Mark test against the victim, typically there is no range limit for this renewal. Unique Horror Marks\nThe guidelines here outline the basic effects and most common manifestation of this power. It is not uncommon, however, for major Horrors to have variations of this power that demonstrate the entity’s strengths, weaknesses, and tactics. The game "
                          + "information for some Horrors (especially Named Horrors) will often include rules on how the particular Horror’s mark differs from normal.\nGamemasters are encouraged to modify the nature and behavior of Horror marks to suit the needs of the story and the individual Horror. Horror marks should be mysterious and terrifying, and the information about them within the setting shouldbe unreliable.\n"
                          + "Effects of Horror Marks\nA Horror mark should have an impact on the marked character, as well as the adventure or campaign. It can serve as a story element, allowing the gamemaster a way to bring a Horror into an adventure without it necessarily making an appearance in the flesh.\nMost people in Barsaive are aware that a Horror mark is a dangerous thing. If it becomes known that a character is marked, they will face difficulties when dealing "
                          + "with other Namegivers. Common folk are liable to avoid the character, and be willing to let them die rather than risk exposure to a Horror. There are countless superstitions surrounding Horror marks, and given the many different ways this power can work, some of them might even be true."
                          + "Detecting Horror Marks\nA mark does not necessarily make itself known. There is no specific physical trace unless a particular variant of mark does so, and even the astral indications of a mark are deeply buried in a victim’s pattern and difficult to detect.\n To detect a Horror mark using astral sensing, the sensing character must make a test against the Mystic Defense of the Horror that left the mark, with a number"
                          + "additional successes equal to the level of astral corruption (safe = 1 additional success, open = 2 additional successes, etc.). If successful, the mark can be seen as a small stain on the victim’s pattern, and detailed examination might reveal clues that may point  to the identity of the Horror that owns the mark. For example, the mark of the Horror Aazhvat Many-Eyes might appear as an unblinking eye.\n"
                          + "Despite the popular belief a character under the influence of a Horror is unable to create works of art, this method of detecting Horror marks is unreliable at best. While there are Horrors whose influence can result in the corruption of artisan skills, this belief is largely the result of centuries of legend and superstition.\n Horror Marks and Raw Magic\nIf a magician is desperate enough to cast raw magic, they may find themselves"
                          + "Horror marked. While the rules for casting raw magic provided on pages 261-262 of the Player’s Guide offer values for the Horror Mark test, the gamemaster should feel free to substitute the Horror Mark Step if he has a particular Horror in mind. In many cases, the Horror mark may be unplanned. This gives the gamemaster an opportunity to introduce a Horror at a later point in the campaign. Just because a Horror has marked a victim does not mean "
                          + "the Horror will start tormenting the victim right away. Horrors can be patient and wily. It could be weeks or months before the mark comes into play. The magician might even believe he has avoided attracting a Horror’s attention.\nThe dangers of raw magic are well known in Barsiave, and careless magicians will gain a reputation. Their disregard for the safety of themselves and others will"
                          + "eventually result in a Horror mark. Do not allow a player character to avoid the consequences of raw magic casting because bringing a Horror into the game wasn’tplanned.\n"
                          + "Horror Marked Items and Places It is possible for items and places to be Horror marked as well. As previously mentioned, these are usually called cursed items or places. In general, a mark on an item or place works the same way as a Horror mark on an individual, but offer some small degree of protection as the Horror can only work indirectly. Any tests the Horror makes through a cursed item or place require an additional success.\n"
                          + "Given the many different ways Horror marks can work, it is possible a Horror might have a mark that works through an item to invoke a particular effect. For example, a cursed item slowly turns its user into a construct, or allows the Horror to use its Cursed Luck power without penalty when the item is being used." );
                        checkPower( "Horror Thread", null, "Standard", "This power eventually allows a Horror direct control of a chosen victim. A Horror may only use this power on a victim it has previously marked. It may then spend 5 Karma Points and make a Horror Thread test against the target’s Mystic Defense. The Karma spent only powers the ability; it does not add dice to the test. If successful, the Horror weaves a thread connecting its pattern to the victim’s.\n"
                          + "Once per month, the Horror uses the woven thread to try and learn Pattern Knowledge about the victim. It spends a Karma Point and makes a Horror Thread test against the victim’s Mystic Defense. As with the initial Karma spent to weave the thread, this Karma point does not add dice to the test. If successful, the Horror learns a piece of Pattern Knowledge and may weave a new thread to the victim, which costs an additional 5 Karma points.\n"
                          + "Each woven thread grants the Horror a +1 bonus to any tests it makes against the victim, and the Horror also has full access to the target’s thoughts and memories, allowing it more freedom to taunt and torment the victim.\nOnce the Horror’s bonus from woven threads equals the victim’s Willpower Step, the Horror can take control of the victim’s body and use their abilities as its own. "
                          + "For example, the Horror could force a Beastmaster to attack his allies with Claw Frenzy. The Horror uses the appropriate Step Numbers for the victim’s talents, spells, and other abilities, and may spend the victim’s Karma points on them if applicable. The Horror may also use its own powers through the victim. While in the case of some abilities the control may not be obvious, the victim can sense the intrusion." );
                        checkPower( "Karma Boost", null, "Free", "This power allows the Horror to tempt a Horror marked victim in need. The marked victim may be unaware of the source of this power. This is particularly true for victims who do not yet realize they have been Horror marked, the character just finds reserves of powers they didn’t previously have.\n"
                          + "At the marking Horror’s discretion, the marked victim may spend an additional Karma Point on any test on which they could normally spend Karma. This Karma point comes from the marking Horror’s Karma pool and their Karma Step. Each time the marked victim uses this power, they gain a Corruption Point. See Corruption, p. 456, for information on Corruption ranks." );
                        checkPower( "Karma Drain", null, "Standard", "This power allows a Horror to drain Karma points from a victim it has marked. The Horror makes a Karma Drain test against the victim’s Mystic Defense. Each success transfers one Karma point from the victim to the Horror. The victim must have Karma points available. Once the Horror has failed a Karma Drain test against a victim, "
                          + "it must wait until the next day to attempt another Karma Drain test against that victim." );
                        checkPower( "Skin Shift", null, "Simple", "This power allows a Horror to mutilate a target’s body. The Horror touches the target and makes a Horror Power test against the target’s Mystic Defense. If successful, the Horror makes a Skin Shift test to determine damage. No armor reduces this damage. The victim’s skin tears loose from the muscle below, twisting and turning around his body. "
                          + "Each success on the Horror Power test inflicts one Wound on the victim in addition to the damage from the Skin Shift test." );
                        checkPower( "Suppress Mark", null, "Standard", "This power allows a Horror to hide its mark deep within a victim’s pattern. The Horror increases the Difficulty to detect the mark by the Suppress Mark Step. While this power is in effect, the Horror is not able to use the mark to affect the victim." );
                        checkPower( "Terror", null, "Standard", "This power allows a Horror to paralyze its victims with fear. The Horror makes a Terror test and compares the result to the Mystic Defense of each character within 20 yards. Each character suffers a -1 penalty to Action tests for each success on the Terror test.\nAs a Simple action at the beginning of an affected character’s turn, they may make a Willpower test against the Terror Step. This test is optional, "
                          + "with each success reducing the penalty by 1. If the penalty ever reaches 0, the effects of this power wear off. If the Willpower test is unsuccessful, the penalty increases by -1.\nIf the penalty is ever greater than the character’s Willpower step, the character is unable to take any actions against the Horror. The character may still make Willpower tests to try and resist the effect, and at gamemaster discretion may use defensive abilities "
                          + "(such as Avoid Blow). Most characters in this state are panic-stricken, and will behave accordingly: fleeing, collapsing into the fetal position, or standing quiveringhelplessly." );
                        checkPower( "Unnatural Life", null, "Standard", "This power allows a Horror to grant a dead character the gift of life. This power can only be used on characters dead for less than a year and a day. The Horror touches the corpse and makes an Unnatural Life test against the Mystic Defense the victim had while alive. If successful, the character is brought back to life. "
                          + "This costs the Horror 1 point of Blood Magic, which cannot be healed until the victim is killed.\nWhile not as dreadful to behold as a cadaver man or ghoul, any decay or damage to the corpse remains. Other than the potentially horrific appearance, the revived character functions as he did in life with all talents and abilities intact. The character’s personality and memories are also restored.\nVictims of this power are difficult to destroy. "
                          +"They may make a Recovery test at any time as a Simple action, and have unlimited Recovery tests available. The Horror may end the effect of this power at any time, and often uses this to coerce the victim into serving it in some capacity." );

                                    // Spirit Powers
                        checkPower( "Adaptability", "NA", "Free", "Water spirits only. This power allows a spirit to increase one of their characteristics by +3. The following characteristics may be affected: Initiative, Physical Defense, Mystic Defense, Social Defense, Physical Armor, Mystic Armor, Wound Threshold, Unarmed Attack, and Unarmed Damage. This must be used prior to initiative each round and may be changed at the beginning of each round." );
                        checkPower( "Aid Summoner", "Cha+SR", "Standard", "This power allows a spirit to increase its summoner’s magical abilities for the duration of a summoning. The spirit merges with the summoner, and makes an Aid Summoner test against the summoner’s Mystic Defense. Each success grants the summoner a +1 bonus to talent tests. The summoner may only apply this bonus to one test per round, and takes 1 Strain each time they do so. "
                          + "While this power is in effect, the summoner takes on some superficial characteristics of the spirit that is aiding him. For example, his eyes glowing with a preternatural light, skin taking on a stony appearance, or hair growing small flowers." );
                        checkPower( "Astral Portal", "Wil+SR", "Standard", "Ally spirits only. Minimum SR 9. The spirit creates a portal allowing entry into astral space. The spirit makes an Astral Portal test against a DN of 6+the modifier for astral corruption (Player’s Guide, p. 209). The portal remains open for 1 minute per success. The portal is two-way, allowing entry into and exit from astral space." );
                        checkPower( "Confusion", "Wil+SR", "Standard", "Ally spirits only. The spirit temporarily confuses a target by passing some of its own energy through him. The spirit makes a Confusion test against the Mystic Defense of a target within SR x 10 yards. For each success, the target suffers a –1 penalty to his Perception and Willpower tests, including talents and abilities based on those Attributes. "
                          +"The effect lasts for a number of minutes equal to the spirit’s Strength Rating." );
                        checkPower( "Curse", "Wil+SR", "Standard", "Ally spirits only. The spirit curses a target. It makes a Curse test against the Mystic Defense of a target within SR x 10 yards. If successful, the target suffers a -2 penalty to one Attribute Step for one hour per success. The penalty affects all tests based on that Attribute. The spirit or its summoner chooses the affected Attribute. A target can only be affected by one use of this power at a time." );
                        checkPower( "Destroy Weapon", "SR", "NA", "Fire spirits only, requires Elemental Aura: The fire spirit’s elemental aura also damages non-magical wooden or metal weapons which strike the spirit, unless the weapon is somehow fireproofed. Wooden weapons have their Damage Step reduced by the spirit’s Strength Rating. Metal weapons have their Damage Step reduced by the amount the spirit’s Strength Rating exceeds their Damage Step. "
                          + "For example, a normal broadsword (Step 5) suffers no ill effect from fire elementals up to Strength Rating 5.\nBonuses provided by the Forge Weapon talent (Player’s Guide, p. 148) count towards the weapon’s Damage Step for the purposes of this comparison. For example, a metal broadsword that has a +2 bonus from Forge Blade suffers no effects from fire elementals up to Strength Rating 7.\n"
                          + "The effects of this power are cumulative, but damaged weapons may be repaired (Player’s Guide, p. 411). If a weapon’s Damage Step is reduced to 0, it is destroyed." );
                        checkPower( "Detect True Element", "SR", "Standard", "Elemental spirits only. This power enables an elemental spirit to detect the presence of True Elements, but only of the same type. For example, an air spirit could detect True Air by using this power, but not any other True Element. The spirit can  detect any presence of the True Element within a number of miles equal to its Strength Rating.\n"
                          + "Because Elementalists generally hope to locate True Elements for their own use, elemental spirits do not like using this power for their summoners. Any attempt to do so requires a Contest of Wills (Player’s Guide, p. 368). If the summoner wins, the spirit leads the summoner to the nearest source of the relevant True Element within range. Elemental spirits will never aid a summoner in gathering True Elements, "
                          + "only in finding their location. Even a Contest of Wills cannot coerce a spirit to violate this principle." );
                        checkPower( "Elemental Aura", "SR", "NA", "Elemental spirits only. Manifest elemental spirits with this power are surrounded by a damaging aura of their element. Air spirits may be surrounded by crackling lightning, fire by intense heat, while a water spirit may be surrounded by intense cold. All beings within 4 yards of the spirit suffer damage equal to the spirit’s Strength Rating each round. Physical Armor protects against this damage." );
                        checkPower( "Engulf", "Str+SR", "Free", "Elemental spirits only. The spirit surrounds a victim with its element, causing damage. The elemental must be physically manifest to use this power. This power allows the elemental to spend an additional success on an Attack test to automatically grapple the target. Once the victim is grappled, he is engulfed by the appropriate element and takes damage equal to the result of the Engulf test. "
                          + "The effect lasts until the grapple ends, and can be broken.\nAir: The spirit makes the air unbreatheable. The victim can hold his breath (see p. 169), but begins to take damage if he falls unconscious. Mystic Armor protects against this damage.\nEarth: The target suffers damage from the crushing weight. Physical Armor protects against this damage.\nFire: The target is covered in fire and starts to burn. "
                          + "Physical Armor protects against this damage.\nWater: The spirit is capable of exerting great pressure on engulfed victims. Physical Armor protects against this damage and victims might also drown (see p. 168).\nWood: The target is covered in thorny vines that pierce his skin. Physical Armor protects against this damage." );
                        checkPower( "Enhance Summoner", "CHA+SR", "Standard", "The spirit is able to provide a significant increase to its summoner’s magical ability, but only for a short time. The spirit merges with the summoner, and makes an Enhance Summoner test agains the summoner’s Mystic Defense. Each success allows the summoner to add the spirit’s Strength Rating to one talent test. "
                          + "When using this bonus, the summoner takes strain equal to the spirit’s Strength Rating to reflect the difficulty inherent in channeling the spirit’s energy. If multiple uses are available, each bonus may be applied to a different test, but only one test per round. The effect lasts until the summoning ends, or all uses of this power have been exhausted. While the power is in effect, the summoner takes on some superficial "
                          + "characteristics of the spirit, which are exaggerated when applying the bonus to a talent. For example, hair drifting as in a breeze, giving off streams of smoke, or movements becoming more fluid and graceful." );
                        checkPower( "Enrage Element", "WIL+SR", "Standard", "Elemental spirits only. The spirit creates a tumultuous whirlwind of its element. For example, an earth elemental creates a small storm of flying rocks. The tempest covers an area with a radius of the spirit’s Strength Rating in yards, centered on the spirit. The spirit makes an Enrage Element test to determine how much damage suffered by targets within the affected area, "
                          + "and may sustain the effect by using a Standard Action each round. Physical Armor protects against this damage. All targets within the area of effect are considered Harried (Player’s Guide, p. 388)." );
                        checkPower( "Find", "PER+SR", "Standard", "The spirit traces an item to its origin. For example, if a spirit has a lock of hair, it can locate the hair’s owner. If it has a piece of a wall, it can locate the building from which the piece came. Elemental spirits with this power can only use it on items thatare connected with their element.\nThe target must be within SR x 10 miles to be affected by this power. "
                          + "The spirit makes a Find test against the target’s Mystic Defense. If successful, the spirit is able to locate the target, but the search takes one hour per 10 miles to the target. If the summoning duration ends before the spirit can find the target and report back, the spirit often departs." );
                        checkPower( "Hardened Armor", "NA", "NA", "Earth, invae, and wood spirits only. Additional successes from Attack tests deal one less damage per success against an elemental with this power. Typically, this means instead of +2 damage per additional success, the attacker only gets +1 damage per additional success." );
                        checkPower( "Insubstantial", "NA", "NA", "Air, ally, fire, and water spirits only. Attacking a manifested spirit with this power using physical weapons (such as a sword or a bow) is very difficult. Attacks with such items require an additional success, unless the attack has an area of effect." );
                        checkPower( "Invisibility", "DEX+SR", "NA", "Air, ally, and water spirits only. These spirits may become invisible to mundane sight at will. The spirit makes an Invisibility test, the result of which is the Difficulty Number for any attempts to detect the elemental. The spirit may be seen normally with Astral Sight." );
                        checkPower( "Karma", "SR", "NA", "The spirit has the ability to use Karma. The spirit has a pool of SR x 4 Karma points, and may spend Karma on any test it performs. Each point allows the spirit to roll dice equal to its Karma Step and add them to the test result." );
                        checkPower( "Manifest", "NA", "Standard", "The spirit can manifest in the physical realm. It takes a Standard Action for the spirit to enter the physical realm, or to return to astral space. Remember that to affect the physical realm, the spirit must be manifest." );
                        checkPower( "Manipulate Element", "WIL+SR", "Standard", "Elemental spirits only. The spirit can change the basic structure of any object composed of the spirit’s native element. For example, a water elemental could turn a pool into solid ice. The gamemaster determines the specific effects of each use of the Manipulate Element power, but the radius of the affected area cannot exceed the spirit’s Strength Rating in yards. "
                          + "The effect lasts for a number of minutes equal to the spirit’s Manipulate Element test result." );
                        checkPower( "Poison", "SR", "NA", "Ally, invae, and wood spirits only. The spirit’s attacks inflict poison. It is assumed any unarmed attacks benefit from this power, though other powers may benefit as noted. The most common poison causes damage, though some spirits may have debilitating or paralytic poison instead." );
                        checkPower( "Remove Element", "WIL+SR", "Standard", "Elemental spirits only. The spirit can remove any trace of its native element from an area. For example, an earth spirit could use the power to damage a building by removing the dirt around one or more of the building’s supporting walls. The radius of the area affected cannot exceed the spirit’s Strength Rating in yards. "
                          + "The spirit makes a Remove Element test against the target’s Mystic Defense. This power cannot be used on anything with a true pattern." );
                        checkPower( "Share Knowledge", "PER+SR ", "Standard", "Elemental spirits only. The spirit learns general information about recent activity in, on, or near its native element. For example, a breeze may carry snippets of conversation to an air spirit. The spirit makes a Share Knowledge (6) test. Each success allows the spirit to learn about events in the previous hour (so three successes allows "
                          + "a spirit to learn about events within the past three hours). The gamemaster determines exactly how much information the elemental learns." );
                        checkPower( "Soothe", "CHA+SR", "Standard", "Elemental spirits only. The spirit produces soothing sounds or smells that cause its target to relax, such as a cool breeze, the sound of leaves rustling in the wind, or the sound of a crackling fire. The spirit makes a Soothe test against the target’s Social Defense. Each success grants the target gains a +1 bonus to his next Recovery test." );
                        checkPower( "Spear", "STR+SR", "Standard", "Elemental spirits only. The spirit forms a spear from its elemental essence to damage a target. For example, a water elemental might throw a spear in the form of an icicle, while a fire elemental might throw a bolt of flame. The spirit makes a Spellcasting test against the Mystic Defense of a target within SR x 10 yards. "
                          + "If successful, the spirit makes a Spear test to determine how much damage the target takes, reduced by Physical Armor. If the target suffers damage, an additional effect occurs based on elemental type:\nAir: The target must make a Knockdown test against the damage dealt.\nEarth: The target is slowed. Their movement rate is lowered by 2 yards per success on the Spellcasting test.\n"
                          + "Fire: The spear does +2 Damage per success on the Spellcasting test.\nWater: The spirit may choose one of the bonus effects from another element type.\nWood: The target is harried (Player’s Guide, p. 388) for 1 round per success on the Spellcasting test." );
                        checkPower( "Spells", "Special", "NA", "Ally and elemental spirits only. The spirit knows spells. Elemental spirits may only cast spells of their native elements. Ally spirits can generally cast spells from one Discipline, though some powerful ally spirits can cast spells from two or more Disciplines. The spirit’s Strength Rating determines the maximum spell Circle it may know. "
                          + "Thus, a Strength 6 ally spirit could know any spell up to Sixth Circle. Spirits typically know a number of spells equal to their Strength Rating. This power may be selected more than once to learn additional spells. Spirits may not know or cast summoning or binding spells.\nThe normal requirements for weaving threads apply (spirits use their Spellcasting Step to weave any "
                          + "necessary threads), but spirits do not need spell matrices or suffer negative effects from casting raw magic. Spirits can weave additional threads using their Strength Rating for Circle in the casting discipline. Elemental spirits automatically weave these additional threads for free without requiring any additional threads to be woven.\nMany Horrors know how to cast spells. "
                          + "Horrors do not use Spell Matrices, as they suffer no ill effects from using Raw Magic. Horrors must still weave threads, but use their Spellcasting ability instead of traditional Thread Weaving talents. When casting spells, Horrors do not need to perform any of the actions required in a spell’s description to cast the spell. Horrors rarely learn spells affecting undead or "
                          + "astral entities like spirits and Horrors.\nDragons are natural born spellcasters, with an inherent knowledge of the workings of magic. They do not know spells in the same way as other Namegiver magicians. As described above under Spellcasting the dragon simply shapes astral energy into the desired form. When presented with a dragon’s game statistics, this represents the maximum Circle of spell effect the dragon can produce." );
                        checkPower( "Talents", "Special", "NA", "Some spirits, horrors or dragons have powers based on adept talents. Refer to the Talents chapter of the Player’s Guide for a description of the talent in question. Spirits suffer Strain for using talents if indicated in the talent description. In place of the talent rank, use the spirit’s Strength Rating." );
                        checkPower( "Temperature", "WIL+SR", "Standard", "Air, fire, and water spirits only. The spirit can alter the temperature in an area with a radius up to its Strength Rating in yards. The spirit raises or lowers the temperature enough to cause discomfort or otherwise distract characters within the area of effect, but not enough to cause damage. "
                          + "The spirit makes a Temperature test, comparing it to the Mystic Defense of each character in the area of effect. Each success causes affected targets to suffer a -1 penalty to their Perception and Willpower based tests. The effect lasts for a number of minutes equal to the spirit’s Strength Rating." );
                      } // end lst not blank (purposely indented wrong).

                      function parenvalue( toCheck, rank, toFind, attra, chkbox ) {
                        'use strict';
                        let fnd = toCheck.match( new RegExp( "^\\s*" + toFind.replace( /\s+/g, "\\s*" ), "gi" ) );
                        if( fnd ) {
                          let aObj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: attra });
                          Earthdawn.setWithWorker( aObj, "current",  Earthdawn.parseInt2( aObj.get( "current" )) + (Earthdawn.parseInt2(rank) * ((mult < 0) ? -1 : 1)));
                          if( chkbox )
                            po.setWW( chkbox, 1 );
                          return 1;
                        } else return 0;
                      }

                      lst = lst.trim().replace( new RegExp( "^[" + Earthdawn.constant( "comma" ) + "\\s]+", "g"), "").replace(    // leading commas and whitespace.
                            new RegExp( "[" + Earthdawn.constant( "comma" ) + "\\s]+$", "g"), "" ).replace(     // trailing commas and whitespace.
                            new RegExp( "\\s*" + Earthdawn.constant( "comma" ) + "[\\s" + Earthdawn.constant( "comma" ) + "]*", "g" ),
                            Earthdawn.constant( "comma" ));     // at least one comma, surrounded by other commas and whitespace.
//log( "The following not found in checkPower: " + lst);
                      sp = ((lst ? lst.replace( new RegExp( Earthdawn.constant( "comma" ), "g"), "\n") + "\n" : "") + textBlock( lst2, true )).trim();
                      if( sp )
                        sp = sp.split( "\n" );
                      else
                        sp = [];
                      let tar = [];     // make a list of things we think should NOT have been broken.
                      for( let i = 1; i < sp.length; ++i )
                        if( sp[ i ].length > 40) {        // if shorter than 40 characters, don't merge.
                          let tind = sp[ i ].indexOf( ":" );
                          if( tind > 40 || tind === -1)             // if longer than 40, and don't have colon in first 40, merge.
                            tar.push( i );
                        }
                      while( tar.length ) {       // This is list of powers that might have accedently been split, merge them back together.
                        let merge = tar.pop();
                        sp[ merge - 1] += "\n" + sp[ merge ];
                        sp.splice( merge, 1);
                      }
                      for( let i = 0; i < sp.length; ++i ) {    // Array of powers, split by newlines.
                        let toCheck = sp[ i ].trim(),
                          cnt = 0, rnk, nmpos = 99999,
                          tnm = toCheck.indexOf( ":" );
                        if( toCheck.trim().length < 2 || toCheck.trim() === "Powers" )    // Some have powers listed after suggested powers. Ignore duplicate.
                          continue;
                        let pwr  = (tnm !== -1) ? toCheck.slice( 0, tnm).trim() : toCheck,
                          ptxt = (tnm !== -1) ? toCheck.slice( tnm +1 ).trim() : "";
                        let fnd = pwr.match( /\(.*?\)/ );     // Everything inside paren
                        if( fnd ) {
                          rnk = getSR( fnd[ 0 ].slice( 1, -1).trim() );
                          pwr = pwr.replace( fnd[ 0 ], "");
                        }

                        cnt += parenvalue( pwr, rnk, "Fury", "Creature-Fury");      // Fury (2)
                        cnt += parenvalue( pwr, rnk, "Resist Pain", "Creature-ResistPain");
                        cnt += parenvalue( pwr, rnk, "Willful", "Creature-Willful");
                        cnt += parenvalue( pwr, rnk, "Ambush", "Creature-Ambush", "Creature-Ambushing");
                        cnt += parenvalue( pwr, rnk, "Dive", "Creature-DiveCharge", "Creature-DivingCharging");
                        cnt += parenvalue( pwr, rnk, "Charge", "Creature-DiveCharge", "Creature-DivingCharging");

                        pwr = pwr.trim();
                        gmnotes += "<br>" + "<i>" + pwr + "</i>" + (rnk ? " (" + rnk + ")" : "") + (ptxt ? " " + ptxt : "");
                        if( !cnt ) {    // The Power we found does not appear to be a standard one.
                          let sense = pwr.search( /\s+Sense\s+/i ) !== -1;
                          adjustPower( pwr, pwr, rnk, sense ? "Per" : null, sense ? "Free" : null, ptxt, null  );
                        }
                      } // end for each power
                      Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: "Hide-Spells-Tab" }, spells ? "0":  "1");
                      if( sugPowers )
                        save[ "suggested powers" ] = gmnotes.trim().replace( /<br>$/, "");
                      else
                        save[ "powers" ] = gmnotes.trim().replace( /<br>$/, "");
                      sugPowers = undefined;    // be ready for the next time it arrives here!
                    } break;    // powers
                  } // end switch potential labels
                } // end for each label.


                if( !mult ) {   // Creature import only (not masks).
                  let afterBlock = fullText.slice( blockIndexArray[ 0 ].index, blockIndexArray[ lastBlock ].index ).trim().replace( /\n/g, "   " ),
                    cObj = getObj("character", po.charID );
                  if( block.trim().length > 5)
                    po.edClass.errorLog( "ED.textImport.Creature: " + name + "  Unable to parse: " + block );
                  if( cObj ) {
                    Earthdawn.set( cObj, "name", name);
                    Earthdawn.set( cObj, "gmnotes", ("<p><b>" + name + "</b>&nbsp;&nbsp;-&nbsp;&nbsp;" + ("challenge" in save ? save[ "challenge" ] : "") +"</p>"
                        + ("actions"  in save ? "<p>" + textBlock( save[ "actions"] ) + "</p>" : "" )
                        + ("move"     in save ? "<p>" + textBlock( save[ "move"] )    + "</p>" : "" )
                        + ("movement"   in save ? "<p>" + textBlock( save[ "movement"] )    + "</p>" : "" )
                        + ("powers"   in save ? "<p>" + textBlock( save[ "powers" ] ) + "</p>" : "" )
                        + ("suggested powers" in save ? "<p>" + textBlock( save[ "suggested powers"] )  + "</p>" : "" )
                        + ("special maneuvers"  in save ? "<p>" + textBlock( save[ "special maneuvers"] ) + "</p>" : "" )
                        + ("equipment" in save  ? "<p>" + textBlock( save[ "equipment" ] ) + "</p>" : "" )
                        + ("loot" in save   ? "<p>" + textBlock( save[ "loot" ] ) + "</p>" : "" )
                        + "<p>--- <b>Description</b> ---\n"
                        + textBlock( fullText.slice( locTextStart, blockOffset ).trim()).replace( /\n/g, "</p><p>") + "</p>"
                        + "<p>" + afterBlock.trim().replace( /\n/g, " ") + "</p>"     // afterBlock is the stat block.
                        ).replace( /\n/g, "<br>" ));
                  }
                  po.setWW( "charName", name);
                  po.chat( "Creature " + name + " imported.   You need to manually check each power and set things like Targets and Modifiers.", Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive );
                  if( followup.length > 0 )
                    po.chat( followup.trim(), Earthdawn.whoFrom.apiWarning );
                  if( "suggested powers" in save )
                    po.chat( "We imported ALL the suggested powers. You might want to delete excess powers, or add different ones.", Earthdawn.whoFrom.apiWarning );
                  if( srUsed && strRating == -1)
                    po.chat ( "Warning! This creature seemed to try to use a Spirit Strength Rating " + srUsed
                          + " times, but does not have one set.\nTo set a SR, first go to 'Core' tab and change 'Discipline' to 'Spirit'"
                          + " and set 'Circle' to the desired Strength Rating. This is an importaint step that can't be skipped.", Earthdawn.whoFrom.apiWarning );
                }
                po.setWW( "SpecialFunction", "Recalc");
                po.sendSWflag();
              } catch(err) { log( "Earthdawn creature2() error caught: " + err ); }
            } // end creature2()   Note: This is last code executed.
          } catch(err) { po.edClass.errorLog( "ParseObj.textImport.parseCreature() error caught: " + err ); }
          return true;
        } // end parseCreature
      } catch(err) { this.edClass.errorLog( "ParseObj.textImport() error caught: " + err ); }
    } // End ParseObj.textImport( ssa )



          // TokenFind()
          // For some reason (almost certainly because there was a @{target} in the command macro - which caused the system to stupidly clear all selected tokens)
          // we don't have tokenInfo for a routine that needs it.
          // See if we can figure it out.
          // 1) If there is only one token for the charID on the current page, use that token.
    this.TokenFind = function()  {
      'use strict';
      try {
        if( this.charID === undefined ) {
            this.chat( "Error! TokenFind() when don't have a CharID.", Earthdawn.whoFrom.apiError );
            return;
        }
        if( this.edClass.msg === undefined )
          return;
        let tl = this.ForEachToken( [ "ForEach", "list", "c", "ust" ] );
        if( tl.length === 1 ) {
          this.tokenInfo = tl[ 0 ];
          return true;
        } else
          return false;
      } catch(err) { this.edClass.errorLog( "ParseObj.TokenFind() error caught: " + err ); }
      return;
    } // End ParseObj.TokenFind()



          // TokenSet()
          // store a value among a tokens statusmarkers.
          // Stores it as a 'statusmarker' whose name is key:secondary:tertiary.
          //  what: clear:    clear all entries with this key.   Afterwards add key:secondary:tertiary if they were passed.
          //          replace:  remove all key/secondary combinations. Replace with new values if passed.
          //          add:      clear nothing - add this key/secondary/tertiary combo.
          // Usage:
          //    key is a keyword that indicates the category. Such as "Hits".
          //    secondary is a value associated with the key, such as the token ID that was hit.
          //    tertiary is a value (or sequence of values separated by anything but commas) that is stored and accessed via the key/secondary combo.
          // Note that if you don't clear old entries out, you can have multiple entries with the same keys.
          // Note that comma's and colons are used in these structures. if secondary or tertiary contain any commas or colons, they are turned into a less common symbol and TokenGet restores them.
    this.TokenSet = function( what, key, secondary, tertiary) {
      'use strict';
//log( "TokenSet " + what + " " + key + " " + secondary + " " + tertiary);
//log( this.tokenInfo);
      try {
        if( what === undefined ) {
            this.chat( "Error! TokenSet() 'what' undefined. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError);
            return;
        }
        if( key === undefined ) {
            this.chat( "Error! TokenSet() 'key' undefined. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError);
            return;
        }
        if( this.tokenInfo === undefined || this.tokenInfo.tokenObj === undefined )
          this.TokenFind();

        let bToken = (this.tokenInfo != undefined && this.tokenInfo.tokenObj != undefined);
        if( secondary !== undefined )
          secondary = secondary.replace( /,/g, Earthdawn.constant( "Comma" )).replace( /:/g, Earthdawn.constant( "Colon" ));
        if( tertiary !== undefined )
          tertiary = tertiary.replace( /,/g, Earthdawn.constant( "Comma" ) ).replace( /:/g, Earthdawn.constant( "Colon" ));
        key += ":";   // Key should end in colon to make it more readable when debugging.
        let changed = false,
          changedMark = false;
        let clr;
        switch (what.toLowerCase().trim()) {
          case "clear":   clr = -1;   break;      // This means clear all old secondaries out, before adding new value if it exists.
          case "add":     clr =  0;   break;
          case "remove":
          case "replace": clr =  1;   break;
          default:
            this.chat( "Error! TokenSet() unknown 'what' value of " + what +". Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError);
            return;
        }

        let markers = "," + ( bToken ? this.tokenInfo.tokenObj.get( "statusmarkers" ) : "");
        if (markers.length > 3)
          markers += ",";

        let att = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "pseudoToken" }, ""),
          pt = "," + att.get( "current" );
        if( pt.length > 3 )
          pt += ",";    // It is easier to assume that every marker has a comma before it and after it.

                // First, remove any status markers that may already be set that start with this key (unless this is add only operation).
        function remove( marks ) {
          let k = "," + ((clr < 0 || secondary === undefined) ? key : key + secondary );
          let i = marks.indexOf( k );
          while ( clr !== 0 && i > -1 ) {
            let e = marks.indexOf( ",", i + 1);
            marks = marks.slice( 0, i) + marks.slice( e);
            changed = true;
            i = marks.indexOf( k );
          }
          return marks;
        } // end function remove

        markers = remove( markers);
        changedMark = changed;    changed = false;
        pt = remove( pt);

        if( secondary !== undefined ) {        // Now set any new secondary that was passed.
          if( bToken ) {
            markers += key + secondary + ((tertiary !== undefined) ? ":" + tertiary : "" ) + ",";
            changedMark = true;
          } else {
            pt += key + secondary + ((tertiary !== undefined) ? ":" + tertiary : "" ) + ",";
            changed = true;
          }
        }
        if( changedMark && bToken )
          this.tokenInfo.tokenObj.set( "statusmarkers", markers.slice(1, -1));
        if( changed )
          Earthdawn.setWithWorker( att, "current", pt.slice(1, -1));
      } catch(err) { this.edClass.errorLog( "ParseObj.TokenSet() error caught: " + err ); }
      return;
    } // End ParseObj.TokenSet()



          // TokenGet()
          // return all values stored among a tokens statusmarkers for a specific key.
          // if retString is true, then return first thing found as a string. Otherwise return an array of every key found.
          // Also return anything stored in character attribute "pseudoToken", where we might have stashed something when we could not figure out what token is being used.
    this.TokenGet = function( key, retString )  {
      'use strict';
      let ret = [];
      try {
        if( this.tokenInfo === undefined || this.tokenInfo.tokenObj === undefined )
          this.TokenFind();
        key += ":";   // Key should end in colon to make it more readable when debugging.

        let markers = "," + ( (this.tokenInfo && this.tokenInfo.tokenObj) ? this.tokenInfo.tokenObj.get( "statusmarkers" ) : "");
        if (markers.length > 3)
          markers += ",";
        let att = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "pseudoToken" }, ""),
        pt = att.get( "current" );

        if( pt.length > 2 )
          markers = "," + pt + markers;   // It is easier to assume that every marker has a comma before it and after it.

        let i = markers.indexOf( "," + key );
        while ( i > -1 ) {
            let e = markers.indexOf( ",", i + 1);
            ret.push( markers.slice( i + key.length + 1, e).replace(new RegExp( Earthdawn.constant( "Colon" ), "g"), ":").replace(new RegExp( Earthdawn.constant( "Comma" ), "g"), ",") );
            i = markers.indexOf( "," + key, e-1 );
        }
      } catch(err) { this.edClass.errorLog( "ParseObj.TokenGet() error caught: " + err ); }
      return retString ? (ret.length == 0 ? "" : ret[ 0 ]) : ret;
    } // End ParseObj.TokenGet()



          // return all values stored among a tokens statusmarkers for a specific key.
          // This version is passed a tokenID instead of already having the information in tokenObj.
    this.TokenGetWithID = function( key, tokenID )  {
     'use strict';
       let ret = [];
       try {
         let TokObj = getObj("graphic", tokenID);
         if (typeof TokObj === 'undefined' )
           return;
        key += ":";   // Key should end in colon to make it more readable when debugging.
        let markers = "," + TokObj.get( "statusmarkers" ) + ",";       // It is easier to assume that every marker has a comma before it and after it.
        let i = markers.indexOf( "," + key );
        while ( i > -1 ) {
            var e = markers.indexOf( ",", i + 1);
            ret.push( markers.slice( i + key.length + 1, e));
            i = markers.indexOf( "," + key, e-1 );
        }
      } catch(err) { this.edClass.errorLog( "ParseObj.TokenGetWithID() error caught: " + err ); }
      return ret;
    } // End ParseObj.TokenGetWithID()



          // ParseObj.TuneMatrix()
          // Move a spell into a matrix.
          // This routine is called  twice. The character sheet calls this with ssa[1] = "Spell".
          //    This will generate a chat window button that when pressed calls this routine with ssa[1] = "Matrix"
          // ssa = Spell, spell row ID.
          // ssa = Matrix, spell row ID, Matrix row ID.
    this.TuneMatrix = function( ssa ) {
      'use strict';
      try {
        let pseudoType,
          po = this;
        switch ( ssa[ 1 ].toLowerCase() ) {
          case "spell": {     // The user has chosen "Attune" from the button in the spell list. Send a message to the chat window asking what matrix to put this spell into.
            if( ssa === undefined || ssa.length < 3 || ssa[2] === "") {
              this.chat("ED.TuneMatrix() error - There was an error, Could not read RowID for the spell. Go to the spell you tried to tune, and change the name, then change it back. That should force the system to save the RowID.", Earthdawn.whoFrom.apiError );
            } else {      // go through all attributes for this character and look for ones that end in "_SPM_RowID".
              let circle = Earthdawn.getAttrBN( po.charID, Earthdawn.buildPre( "SP", ssa[ 2 ] ) + "Circle", "0", true ),
                attributes = findObjs({ _type: "attribute", _characterid: this.charID }),
                matrices = [];
              _.each( attributes, function ( indexAttributes ) {
                if( indexAttributes.get( "name" ).endsWith( "_SPM_RowID" )) {
                  let row = indexAttributes.get( "current" );
                  if ( Earthdawn.getAttrBN( po.charID, Earthdawn.buildPre( "SPM", row ) + "Rank", 0, true) >= circle )   // Only list the matrices of a rank ot hold this spell.
                    matrices.push( row );
                }
              }); // End for each attribute.
              if( matrices.length > 0) {      // For each matrix found, make a chat button.
                let t2;
                let s = "";
                _.each( matrices, function (indexMatrix) {
                  let prespm = Earthdawn.buildPre( "SPM", indexMatrix );
                  switch( Earthdawn.getAttrBN( po.charID, prespm + "Type", "-10") ) {
                    case  "15":     t2 = "Enh";     break;
                    case  "25":     t2 = "Armd";    break;
                    case "-20":     t2 = "Shrd";    break;
                    case "-10":
                    default:        t2 = "Std";
                  }
                  let pseu = ( Earthdawn.getAttrBN( po.charID, prespm + "Origin", "") == "Pseudo" ) ? "p" : "";
                  s += Earthdawn.makeButton( pseu + t2 + "-" + Earthdawn.getAttrBN( po.charID, prespm + "Rank", "0") + " "
                          + Earthdawn.getAttrBN( po.charID, prespm + "Contains", ""),
                          "!Earthdawn~ charID: " + po.charID + "~ TuneMatrix: Matrix: " + ssa[2] + ": " + indexMatrix,
                          undefined , Earthdawn.Colors.param, Earthdawn.Colors.paramfg );
                  if( pseu )
                    s += " " + Earthdawn.makeButton( '&#x261A;X', "!Earthdawn~ charID: " + po.charID + "~ TuneMatrix: Destroy: " + indexMatrix
                          + ": ?{Confirm Destroy this psuedo matrix|No|Yes}",
                          "The preceding is a pseudo-matrix and only exists when two spells can share a matrix, or in a shared matrix, or in a Spellstore. "
                          + "Use this button to delete the Pseudo matrix.",
                          Earthdawn.Colors.param2, Earthdawn.Colors.param2fg );
                }); /// End each spell matrix
                this.chat( "Load " + Earthdawn.getAttrBN( po.charID, Earthdawn.buildPre( "SP", ssa[2] ) + "Name", "")
                      + " into which Matrix? " + s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive);      // Chat buttons don't like colons.   Change them to something else. They will be changed back later.
//                this.chat( "&{template:default} {{name=Load " + Earthdawn.getAttrBN( po.charID, Earthdawn.buildPre( "SP", ssa[2] ) + "Name", "")
//                      + " into which Matrix? " +  Earthdawn.colonFix( s ) + "}}", Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive);      // Chat buttons don't like colons.   Change them to something else. They will be changed back later.
              } else
                this.chat("ED.TuneMatrix() Warning - You don't have any matrices of high enough rank to attune this spell.");
            }
          } break;
          case "pseudo":    // TuneMatrix: share: (spellFrom ID): (Std, Enh, Arm, Sha)
          case "share": // Create a matrix and move a spell into it.
            if( ssa[ ssa.length -2 ] === "Enh" ) pseudoType = 2;      // v2.04 changed the number of parameters.
            else if( ssa[ ssa.length -2 ] === "Arm" ) pseudoType = 3;
            else if( ssa[ ssa.length -2 ] === "Sha" ) pseudoType = 4;
            else pseudoType = 1;
            ssa[ ssa.length ] = Earthdawn.generateRowID();
                  // Note: this does NOT break, it falls down.
          case "matrix": {    // The user has told us to swap a spell into a certain matrix.
                  // TuneMatrix: matrix: (spellFrom ID): (spellTo ID)
            let spellFrom = ssa[ ssa.length -2 ],     // rowID of repeating_spell
                matrixTo = ssa[ ssa.length -1 ],      // rowID of repeating_matrix
                preFrom = Earthdawn.buildPre( "SP", spellFrom ),
                preTo = Earthdawn.buildPre( "SPM", matrixTo ),
                t = "";

            function toMatrix( base, val )  {
              'use strict';
              po.setWW( preTo + base, (val === undefined || val === null) ? "" : val );
                            // don't just test val ? val : ""  because that changes zero's to "", which is bad.
            } // End ToMatrix()
                        // This local function looks up the correct value (if it can find it) and copies it to the matrix
            function copySpell( base, dflt )  {
              'use strict';
              let val = Earthdawn.getAttrBN( po.charID, preFrom + base, dflt);
              if( base === "AoE" && (val === "x" || val === " "))
                val = dflt;
              toMatrix( base, (val === undefined || val === null) ? dflt : val );
            } // End CopySpell()

            if ( pseudoType ) {
              toMatrix( "RowID", ssa[ ssa.length -1 ] );
              toMatrix( "Origin", "Pseudo" );
              toMatrix( "Rank", 15 );
              switch( pseudoType ) {
                case 1:
                toMatrix( "DR", "10");
                toMatrix( "Type", "-10");
                break;
                case 2:
                toMatrix( "DR", "15");
                toMatrix( "Type", "15");
                break;
                case 3:
                toMatrix( "DR", "25");
                toMatrix( "Type", "25");
                break;
                case 4:
                toMatrix( "DR", "20");
                toMatrix( "Type", "-20");
                break;
              }
              if( state.Earthdawn.sheetVersion < 1.8 )
                toMatrix( "mThreads", "0");
            }
            t = Earthdawn.dispToName(Earthdawn.getAttrBN( po.charID, preFrom + "Discipline", "0"), true) + "-"
              + Earthdawn.getAttrBN( po.charID, preFrom + "Circle", "0") + " '"
              + Earthdawn.getAttrBN( po.charID, preFrom + "Name", "") + "'";

            let aobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: po.charID, name: preTo + "Contains" });
            Earthdawn.abilityRemove( this.charID, Earthdawn.constant( "Spell" ) + aobj.get( "current" ) );
            Earthdawn.setWithWorker( aobj, "current", t );
            if( state.Earthdawn.sheetVersion < 1.8)
              Earthdawn.abilityAdd( this.charID, Earthdawn.constant( "Spell" ) + t,
                    "!edToken~ charID: " + this.charID
                    + "~ ?{" + t + " What|Info," + Earthdawn.encode( "spell: " + matrixTo + ": Info" )
                    + "|Start New Casting," + Earthdawn.encode( "ForEach: inmt~ spell: " + matrixTo + ": New: ?{Matrix or Grimoire cast|Matrix,M|Grimoire,G}" )
                    + "|Weave Threads,"     + Earthdawn.encode( "ForEach: inmt~ spell: " + matrixTo + ": Weave: ?{Modifier|0}" )
                    + "|Cast,"              + Earthdawn.encode( "Target: " + Earthdawn.getAttrBN( po.charID, preFrom + "Casting", "MDh")
                    + "~ ForEach: inmt~ spell: " + matrixTo + ": Cast: ?{Modifier|0}" )
                    + "|Effect,"      + Earthdawn.encode( "ForEach: inmt~ spell: " + matrixTo + ": Effect: ?{Modifier|0} " ) + "}" );
            else if( Earthdawn.getAttrBN( po.charID, preFrom + "CombatSlot", 1, true))
              Earthdawn.abilityAdd( this.charID, Earthdawn.constant( "Spell" ) + t,
                    "!edToken~ %{selected|" + preTo + "Roll}" );

            let mThreads = (Earthdawn.getAttrBN( po.charID, preTo + "Type", 0) > 0) ? 1 : 0,    // Uses SPM_Type to calculate how many threads the matrix can hold.
              sThreads = Earthdawn.getAttrBN( po.charID, preFrom + "sThreads", "0" )|| 0;
            toMatrix( "spRowID", Earthdawn.getAttrBN( this.charID, preFrom + "RowID" ));
            if( state.Earthdawn.sheetVersion < 1.8 ) {
              copySpell( "KaskWeave", "");
              copySpell( "sThreads", "0");
              copySpell( "Numbers", "0");
              copySpell( "Casting", "");
              copySpell( "Range", "");
              copySpell( "AoE", " ");
              copySpell( "Duration", "");
              copySpell( "WilEffect", "0");
              copySpell( "WilSelect", "None");
              copySpell( "EffectArmor", "N/A");
              copySpell( "Effect", "");
              copySpell( "SuccessLevels", "");
              copySpell( "ExtraThreads", "");
              copySpell( "sayTotalSuccess", "0");
              copySpell( "SuccessText", "");
              copySpell( "FX", "");
              copySpell( "Notes", "");
            } else {    // sheetVersion >= 2.0
              toMatrix( "Threads", Math.max( sThreads - mThreads, 0));
              copySpell( "CombatSlot", "1");
//            let aobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: po.charID, name: preFrom + "spmRowID" });
//            Earthdawn.setWithWorker( aobj, "current", matrixTo );
            }
            toMatrix( "EnhThread", "x");
            let txt = t + " loaded into Matrix.";

            if( mThreads > 0 && sThreads < 1 ) {
              txt += "<br/>What Extra Thread do you wish to tie into the matrix? ";
              let opt = Earthdawn.getAttrBN( this.charID, preFrom + "ExtraThreads", "").split( "," );
              for( let i = 0; i < opt.length; ++i )
                txt += " " + Earthdawn.makeButton( opt[ i ], "!Earthdawn~ charID: " + this.charID + "~ TuneMatrix: thread: " + matrixTo + ":" + opt[ i ],
                      "Press this button to tie this extra thread option into the matrix.", Earthdawn.Colors.param, Earthdawn.Colors.paramfg );
            }
            this.chat( txt, Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive);
          }     // This falls through on purpose. The below is done after every attune.
          case "inmatrix": {    // This alternate entry point is for when it detects a matrix has been destroyed.
            let spellsInMatrix = [],      // Get a list of every matrix that has a spell, and of every spell.
              spells = [],
              matrixes = [],
              attributes = findObjs({ _type: "attribute", _characterid: po.charID });
            _.each( attributes, function (att) {
              let nm = att.get("name");
              if (nm.endsWith( "_SP_RowID" ))
                spells.push( att.get( "current" ));
              else if (nm.endsWith( "_SPM_spRowID" )) {
                spellsInMatrix.push( att.get( "current" ));
                matrixes.push( Earthdawn.repeatSection( 2, att.get( "name" )));
              }
            }); // End for each attribute.
            _.each( spells, function (rID ) {     // Set InMatrix depending upon if spellsInMatrix includes the spell.
              let aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: Earthdawn.buildPre( "SP", rID ) + "spmRowID" });
              let ind = spellsInMatrix.indexOf( rID );
              Earthdawn.set( aobj, "current", (ind === -1) ? "0" : matrixes[ ind ] );
            });
          } break;
          case "thread": {      // Set this extra thread option to be the enhanced thread.
            let aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: Earthdawn.buildPre( "SPM", ssa[ 2 ] ) + "EnhThread" });
            Earthdawn.set( aobj, "current", ssa[ 3 ] );
            this.chat( "Updated to " + ssa[ 3 ], Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive);
          } break;
          case "destroy": {      // Destroy a pseudo matrix.    format Destroy: RowID
            if( ssa[ 3 ].toUpperCase().startsWith( "Y" ) ) {
              let pre = Earthdawn.buildPre( "SPM", ssa[ 2 ] ),
                  attributes = findObjs({ _type: "attribute", _characterid: this.charID });
              _.each( attributes, function (att) {
                if( att.get( "name" ).startsWith( pre ) )
                  att.remove();
              }); // End for each attribute.
            }
          } break;
          default:
            this.edClass.errorLog("ED.TuneMatrix() error - badly formed command.");
            log( ssa );
        } // end switch
      } catch(err) { this.edClass.errorLog( "ED.TuneMatrix() error caught: " + err ); }
    } // End ParseObj.TuneMatrix()



          // ParseObj.FindPageOfPlayer()
          //
          // Returns pageID of page
    this.FindPageOfPlayer = function( playerID )  {
      'use strict';
      let pg = Campaign().get( "playerspecificpages" );
      if ( pg )
          pg = pg.get( playerID );
      if( !pg )
          pg = Campaign().get( "playerpageid" );
      return pg;
    };     // End ParseObj.FindPageOfPlayer



              // ParseObj.UpdateDates ()
              // Paste dates into the current character sheet.
              // Real date is real date. Throalic date is whatever is in Party Sheet.
              // Note - For this to work there must be a PARTY sheet - and the GM must keep the throalic date current. This just copies whatever he last set to this sheet.
    this.UpdateDates = function( ssa )  {
      'use strict';
      try {
        if( this.charID === undefined ) {
            this.chat( "Error! Trying updateDates() when don't have a CharID.", Earthdawn.whoFrom.apiError );
            return;
        }
        if( ssa[ 1 ].indexOf( "Party" ) === -1 ) {
          this.setWW( "record-date-throalic", ssa[ 1 ] );
        }
        let date = new Date();
        let ds = date.getFullYear() + "-" + (date.getMonth() +1) + "-" + date.getDate();
        this.setWW( "record-date-real", ds );
      } catch(err) { this.edClass.errorLog( "ED.UpdateDates() error caught: " + err ); }
    } // End ParseObj.UpdateDates()



                // ParseObj.WhoSendTo ()
                // Look up how this character is to report  activity (public, gm, or hidden)
    this.WhoSendTo = function()  {
      'use strict';
      let ret = 0;    // Default is public.
      try {
        if( this.charID === undefined )
          this.chat( "Error! charID undefined in WhoSendTo() command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError);
        else {
          let rolltype;
          if( "RollType" in this.misc )       // Option was "Ask" and we got an rolltype that way.
            rolltype = this.misc[ "RollType"];
          else if ( this.tokenInfo && ("tokenObj" in this.tokenInfo) && this.tokenInfo.tokenObj.get( "layer" ) === "gmlayer" )    // If the token is on the GM layer, it is always gm only!
            rolltype = "w gm";
          else if( "rollWhoSee" in this.misc )    // This is guaranteed to not be an "Ask".
            rolltype =  Earthdawn.getAttrBN( this.charID, this.misc[ "rollWhoSee" ], "@{RollType}" );

          if( rolltype === "default" || rolltype === "@{RollType}" )
            rolltype = undefined;
          if( !rolltype )
            rolltype = Earthdawn.getAttrBN( this.charID, "RollType", "" );    // This is the default for the whole sheet.
          if ( rolltype != undefined ) {
            let r = rolltype.trim().toLowerCase();
            if( r.endsWith( "pgm"))
              ret = Earthdawn.whoTo.gm | Earthdawn.whoTo.player;
            else if( r.endsWith( "w gm" ))
              ret = Earthdawn.whoTo.gm;
            else if (r.endsWith("plr" ))
              ret = Earthdawn.whoTo.player;
        } }
      } catch(err) { this.edClass.errorLog( "ED.WhoSendTo() error caught: " + err ); }
      return ret;
    } // End ParseObj.WhoSendTo()



                // ParseObj.Parse - A message segment that needs to be parsed. It could do any of several functions.
                // The basic form is that a parse message is tilde delimited (~).
                // Many message segments have subsegments that are colon (:) delimited.
                //
                // This routine parses a message segment and it's subsegments.
    this.Parse = function( cmdSegment )  {
      'use strict';
      let falloutParse = false;
      try {
        let subsegmentArray = cmdSegment.split(":");      // Split out any subsegments into an array by colon : delimiter.
        for( let i = 0; i < subsegmentArray.length; ++i )
          subsegmentArray[ i ] = subsegmentArray[ i ].trim();

//log( cmdSegment);
        switch ( subsegmentArray[ 0 ].toLowerCase() ) {
          case "!edinit":             // We need to skip to the old parsing method.
            this.edClass.msgArray.splice( 0, this.indexMsg);
            this.edClass.msgArray[0] = this.edClass.msgArray[0].trim();
            this.edClass.Initiative();
            falloutParse = true;
            break;
          case "!earthdawn":      // Just skip this. There will be an extra one of these on Token Actions.
          case "":          // Also just skip these. The RollType and Karma routines sometimes put extra fields that can be skipped.
          case "@{RollType}":
          case "/w gm":
          case "pgm":
          case "plr":
          case "-1":
          case "0":
          case "1":
          case "2":
          case "3":
            break;
          case "!edsdr":
          case "!edsdrgm":
          case "!edsdrhidden":
            if( subsegmentArray[ 0 ].charAt( 0 ) === "!" ) {
              this.edClass.msgArray.splice( 0, this.indexMsg );
              this.edClass.msgArray[ 0 ] = this.edClass.msgArray[ 0 ].trim();
              if ( this.edClass.msgArray.length > 1 )
                this.edClass.StepDiceRoller();
              falloutParse = true;
            }
            break;
          case "action":
            this.Action( subsegmentArray );
            break;
          case "armortype":
            if( subsegmentArray.length > 1 ) {
              switch (subsegmentArray[ 1 ].toLowerCase()) {
              case "n/a":     this.bFlags |= Earthdawn.flagsArmor.na;      break;   // Not Applicable.
              case "pa":      this.bFlags |= Earthdawn.flagsArmor.PA;      break;
              case "ma":      this.bFlags |= Earthdawn.flagsArmor.MA;      break;
              case "pa-nat":  this.bFlags |= Earthdawn.flagsArmor.PA | Earthdawn.flagsArmor.Natural;    break;
              case "ma-nat":  this.bFlags |= Earthdawn.flagsArmor.MA | Earthdawn.flagsArmor.Natural;    break;
              case "na":                                // No Armor.
              case "noarmor":
              case "none":    this.bFlags |= Earthdawn.flagsArmor.None;    break;
              case "unknown":
              case "unk":     this.bFlags |= Earthdawn.flagsArmor.Unknown; break;
              }
            }
            break;
          case "bonus":                       // Need to have called SetToken or Foreach before this.
            this.Bonus( subsegmentArray );      // There is a bonus die to set.
            break;
          case "calcstep":
          case "calculatestep":
          case "calcvalue":
          case "calculatevalue":
            switch ( subsegmentArray[ 1 ].toLowerCase() ) {
            case "jumpup":    (state.Earthdawn.sheetVersion < 1.8 ) ? this.Karma( "Karma-Control-JumpUp", -1 ) : this.Karma( "Dex-Karma" );
              this.misc[ "reason" ] = "Jumpup Test";
              this.misc[ "ModType" ] = "@{Adjust-All-Tests-Total}";
              this.misc[ "StyleOverride" ] = Earthdawn.style.Full;
              this.misc[ "headcolor" ] = "knockdown" ;
              break;
            }
            falloutParse = this.calculateStep( subsegmentArray );
            break;
          case "charid": {  //  "CharID: (xx)": This command came with character ID attached (attached by the macro). Store this character ID.
            if( 1 < subsegmentArray.length ) {
              this.charID = subsegmentArray[ 1 ];
                    // Also, store this name as the person who last used this sheet.
              let attribute = Earthdawn.findOrMakeObj({_type: 'attribute', _characterid: this.charID, name: "playerWho"});
              Earthdawn.set( attribute, "current", this.edClass.msg.who);
          } } break;
          case "chatmenu":
            this.ChatMenu( subsegmentArray );
            break;
          case "creaturepower" :
          case "opponentmaneuver" :
            this.CreaturePower( subsegmentArray );
            break;
          case "strain":      // This falls through into Damage, but with an extra parameter inserted between "strain" and the value.
          case "strainsilent":
            subsegmentArray.splice( 1, 0, "NA" );
          case "damage":      // Apply damage to selected tokens.  Must be preceeded by ForEach or SetToken
          case "stun":
            this.Damage( subsegmentArray );
            break;
          case "debug":
            this.Debug( subsegmentArray );
            break;
          case "debugecho":
            this.chat( "echo got: " + subsegmentArray.toString(), Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive );
            break;
          case "endnote":
            this.misc[ "endNote" ] = subsegmentArray.slice( 1 ).join( ":" );
            break;
          case "endnotesucc":
            this.misc[ "endNoteSucc" ] = subsegmentArray.slice( 1 ).join( ":" );
            break;
          case "endnotefail":
            this.misc[ "endNoteFail" ] = subsegmentArray.slice( 1 ).join( ":" );
            break;
          case "foreach":         // "ForEach : CB1 : Wpn1":  For Each selected token, perform the following macros.
          case "foreachtoken":
            this.ForEachToken( subsegmentArray );
            break;
          case "foreachtokenlist":
          case "tokenlist":
          case "fet":
          case "fetl":
            this.ForEachTokenList( subsegmentArray );
            break;
          case "fxset":
            this.FX( subsegmentArray );
            break;
          case "init":
            falloutParse = this.Roll( subsegmentArray );
            break;
          case "dev pnt":
          case "dev pnts":
          case "dev":
          case "dp":
          case "karma":
          case "kc":
            this.Karma( subsegmentArray );
            break;
          case "k-ask":
            if( subsegmentArray.length > 1 && !isNaN( subsegmentArray[ 1 ] ) && subsegmentArray[ 1 ] != "")
              this.misc[ "kask" ] = subsegmentArray[ 1 ];
            if( subsegmentArray.length > 2 && !isNaN( subsegmentArray[ 2 ] ) && subsegmentArray[ 2 ] != "")
              this.misc[ "dpask" ] = subsegmentArray[ 2 ];
            break;
          case "dp-ask":
            if( !isNaN( subsegmentArray[ 1 ] ) && subsegmentArray[ 1 ] != "")
              this.misc[ "dpask" ] = subsegmentArray[ 1 ];
            break;
          case "linktoken":        // Link selected token(s) to CharId (that has been previously parsed)
            this.LinkToken( subsegmentArray );
            break;
          case "recalc":                  // Recalc function is done by sheetworker, but after they do the work, need to reload combat slots.
            this.chat( "Note: Sheetworker Recalc is triggered by setting the dropdown TO recalc, not by pressing the button.", Earthdawn.whoTo.player );
            break;
    // Toggle option is obsolete and can be removed.
          case "toggle":      // toggle the token action for karma or willforce on or off.
            this.MarkerSet( [ "toggle", subsegmentArray[ 1 ], "t"] );
            break;
          case "marker":         // Set the statusmarker for selected tokens.
            this.MarkerSet( subsegmentArray );
            break;
          case "textimport":      // This is NOT dead code, used in  Mask Remove.
            this.textImport( subsegmentArray );
            break;
          case "misc":
            this.funcMisc( subsegmentArray );
            break;
          case "mod":
          case "adjust":
          case "modadjust":
          case "adjustmod":
          case "adjustresult":
          case "resultadjust":
            falloutParse = this.Lookup( 2, subsegmentArray );       // 2 is this.misc.result.
    //                this.misc[ "result" ] = (this.misc[ "result" ] || 0) + Earthdawn.parseInt2( subsegmentArray[ 1 ] );    // Mod : x - Adds X to any result obtained.
            break;
          case "reason":
            if( subsegmentArray.length > 1 )
              this.misc[ "reason" ] = cmdSegment.slice( cmdSegment.indexOf( ":" ) + 1).trim();  // Use the raw cmdSegment to allow colons in reason.
            break;
          case "record2":
            this.Record( subsegmentArray, true );
            break;
          case "record":
            this.Record( subsegmentArray );
            break;
          case "rerollnpcinit":
            this.RerollNpcInit();
            break;
          case "roll":
            this.ForEachHit( subsegmentArray );
            break;
          case "rolltype":
            this.misc[ "RollType" ] = subsegmentArray[ 1 ];
            break;
          case "set":   // Don't do anything fancy, just set attribute to argument.   except wierdness (? can't be in a button).
            this.setWW( "subsegmentArray[ 1 ]", subsegmentArray[ 2 ].replace( "weirdness", "?"));
            break;
          case "setattrib":
            falloutParse = this.Lookup( 4, subsegmentArray );       // 4 sets the character sheet attribute in the first ssa parameter.
            break;
          case "setresult":
            this.misc[ "result" ] = this.ssaMods( subsegmentArray );
            break;
          case "setstep":
            this.misc[ "step" ] = this.ssaMods( subsegmentArray );
            break;
          case "settoken":            // We are being passed a token ID. Set it into tokenInfo
            this.SetToken( subsegmentArray );
            break;
          case "spell":
          case "grim":
            if( state.Earthdawn.sheetVersion < 1.8 )
              this.SpellOld( subsegmentArray );
            else
              this.Spell( subsegmentArray );
            break;
          case "statustotoken":
            this.SetStatusToToken();
            break;
          case "attribute":       // Note that ssa holds ether a numerical number, or an attribute that needs to be looked up (hopefully giving a numerical step number).
          case "step":            // Note also that THIS routine (unlike other routines such as ssaMods()) allows use off asynchronous process to interpret a calculated value.
          case "value":
            switch ( subsegmentArray[ 1 ].toLowerCase() ) {
            case "dex":                     (state.Earthdawn.sheetVersion < 1.8 ) ? this.Karma( "Karma-Control-Dex", -1 ) : this.Karma( "Dex-Karma" );    this.misc[ "reason" ] = "Dexterity Action Test";  this.misc[ "ModType" ] = "@{Adjust-All-Tests-Total}";   this.misc[ "rollWhoSee" ] = "RollType-Dex";   this.misc[ "headcolor" ] = "action";  break;
            case "str":                     (state.Earthdawn.sheetVersion < 1.8 ) ? this.Karma( "Karma-Control-Str", -1 ) : this.Karma( "Str-Karma" );    this.misc[ "reason" ] = "Strength Action Test";   this.misc[ "ModType" ] = "@{Adjust-All-Tests-Total}";   this.misc[ "rollWhoSee" ] = "RollType-Str";   this.misc[ "headcolor" ] = "action";  break;
            case "tou":                     (state.Earthdawn.sheetVersion < 1.8 ) ? this.Karma( "Karma-Control-Tou", -1 ) : this.Karma( "Tou-Karma" );    this.misc[ "reason" ] = "Toughness Action Test";  this.misc[ "ModType" ] = "@{Adjust-All-Tests-Total}";   this.misc[ "rollWhoSee" ] = "RollType-Tou";   this.misc[ "headcolor" ] = "action";  break;
            case "per":                     (state.Earthdawn.sheetVersion < 1.8 ) ? this.Karma( "Karma-Control-Per", -1 ) : this.Karma( "Per-Karma" );    this.misc[ "reason" ] = "Perception Action Test"; this.misc[ "ModType" ] = "@{Adjust-All-Tests-Total}";   this.misc[ "rollWhoSee" ] = "RollType-Per";   this.misc[ "headcolor" ] = "action";  break;
            case "wil":                     (state.Earthdawn.sheetVersion < 1.8 ) ? this.Karma( "Karma-Control-Wil", -1 ) : this.Karma( "Wil-Karma" );    this.misc[ "reason" ] = "Willpower Action Test";  this.misc[ "ModType" ] = "@{Adjust-All-Tests-Total}";   this.misc[ "rollWhoSee" ] = "RollType-Wil";   this.misc[ "headcolor" ] = "action";  break;
            case "cha":                     (state.Earthdawn.sheetVersion < 1.8 ) ? this.Karma( "Karma-Control-Cha", -1 ) : this.Karma( "Cha-Karma" );    this.misc[ "reason" ] = "Charisma Action Test";   this.misc[ "ModType" ] = "@{Adjust-All-Tests-Total}";   this.misc[ "rollWhoSee" ] = "RollType-Cha";   this.misc[ "headcolor" ] = "action";  break;
            case "dex-effect":              (state.Earthdawn.sheetVersion < 1.8 ) ? this.Karma( "Karma-Control-Dex", -1 ) : this.Karma( "Dex-Karma" );    this.misc[ "reason" ] = "Dexterity Effect Test";  this.misc[ "rollWhoSee" ] = "RollType-Dex";   this.misc[ "headcolor" ] = "effect";  break;
            case "str-effect":              (state.Earthdawn.sheetVersion < 1.8 ) ? this.Karma( "Karma-Control-Str", -1 ) : this.Karma( "Str-Karma" );    this.misc[ "reason" ] = "Strength Effect Test";   this.misc[ "rollWhoSee" ] = "RollType-Str";   this.misc[ "headcolor" ] = "effect";  break;
            case "tou-effect":              (state.Earthdawn.sheetVersion < 1.8 ) ? this.Karma( "Karma-Control-Tou", -1 ) : this.Karma( "Tou-Karma" );    this.misc[ "reason" ] = "Toughness Effect Test";  this.misc[ "rollWhoSee" ] = "RollType-Tou";   this.misc[ "headcolor" ] = "effect";  break;
            case "per-effect":              (state.Earthdawn.sheetVersion < 1.8 ) ? this.Karma( "Karma-Control-Per", -1 ) : this.Karma( "Per-Karma" );    this.misc[ "reason" ] = "Perception Effect Test"; this.misc[ "rollWhoSee" ] = "RollType-Per";   this.misc[ "headcolor" ] = "effect";  break;
            case "wil-effect":              (state.Earthdawn.sheetVersion < 1.8 ) ? this.Karma( "Karma-Control-Wil", -1 ) : this.Karma( "Wil-Karma" );    this.misc[ "reason" ] = "Willpower Effect Test";  this.misc[ "rollWhoSee" ] = "RollType-Wil";   this.misc[ "headcolor" ] = "effect";  break;
            case "cha-effect":              (state.Earthdawn.sheetVersion < 1.8 ) ? this.Karma( "Karma-Control-Cha", -1 ) : this.Karma( "Cha-Karma" );    this.misc[ "reason" ] = "Charisma Effect Test";   this.misc[ "rollWhoSee" ] = "RollType-Cha";   this.misc[ "headcolor" ] = "effect";  break;
            case "str-step":                (state.Earthdawn.sheetVersion < 1.8 ) ? this.Karma( "Karma-Control-KnockDown", -1 ) : this.Karma( "Str-Karma" ); this.misc[ "reason" ] = "Knockdown Test";      this.misc[ "headcolor" ] = "knockdown";       this.misc[ "Special" ] = "Knockdown"; break;
            case "initiative":              (state.Earthdawn.sheetVersion < 1.8 ) ? this.Karma( "Karma-Control-Initiative", -1 ): this.Karma( "Initiative-Karma" ); this.misc[ "reason" ] = "Initiative";       this.misc[ "headcolor" ] = "init";    break;
            case "ls-speak-rank":           this.Lookup( 1, [ "", "Per" ]);           this.misc[ "reason" ] = "Speak Language Test";  this.misc[ "headcolor" ] = "action";  if (state.Earthdawn.g1879) this.Damage( ["Strain", "NA", 1 ] );     break;  // 1879 and ED Talents have strain. ED Skill does not. This line is not for ED Talents.
            case "ls-readwrite-rank":       this.Lookup( 1, [ "", "Per" ]);           this.misc[ "reason" ] = "R/W Language Test";  this.misc[ "headcolor" ] = "action";  break;    // Skill does not have strain. In ED, Talent Does.
  // sheetverion < 2.0
  // cdd          case "attack-step":             this.Lookup( 3, [ "PD", "Adjust-TN-Total" ]);       this.misc[ "reason" ] = "Attack Test";          this.misc[ "headcolor" ] = "attack";  this.Damage( ["Strain", "NA", this.getValue( "combatOption-AggressiveAttack") * this.getValue( "Misc-Aggressive-Strain") ] );   this.Bonus( [ 0, "Adjust-Attacks-Bonus" ] );  break;
            case "attack-step":             this.Lookup( 3, [ "PD", "Adjust-TN-Total" ]);       this.misc[ "reason" ] = "Attack Test";          this.misc[ "headcolor" ] = "attackcc";  this.Damage( ["Strain", "NA", this.getValue( "combatOption-AggressiveAttack") * this.getValue( "Misc-AggStance-Strain") ] );    this.Bonus( [ 0, "Adjust-Attacks-Bonus" ] );  break;
            case "sp-spellcasting-step":    this.Karma( "SP-Spellcasting-Karma-Control", 0 );   this.misc[ "reason" ] = "Spellcasting";         this.misc[ "headcolor" ] = "md";                              this.misc[ "SP-Step" ] = true;    break;
            case "sp-patterncraft-step":    this.Karma( "SP-Patterncraft-Karma-Control", 0 );   this.misc[ "reason" ] = state.Earthdawn.g1879 ? "Magic Theory" : "Patterncraft";      this.misc[ "headcolor" ] = "ask";         this.misc[ "SP-Step" ] = true;        break;
            case "sp-elementalism-step":    this.Karma( "SP-Elementalism-Karma-Control", 0 );   this.misc[ "reason" ] = "Elementalism";         this.misc[ "headcolor" ] = "ask";     this.bFlags |= Earthdawn.flags.VerboseRoll;     this.misc[ "SP-Step" ] = true;  break;
            case "sp-illusionism-step":     this.Karma( "SP-Illusionism-Karma-Control", 0 );    this.misc[ "reason" ] = "Illusionism";          this.misc[ "headcolor" ] = "ask";     this.bFlags |= Earthdawn.flags.VerboseRoll;     this.misc[ "SP-Step" ] = true;  break;
            case "sp-nethermancy-step":     this.Karma( "SP-Nethermancy-Karma-Control", 0 );    this.misc[ "reason" ] = "Nethermancy";          this.misc[ "headcolor" ] = "ask";     this.bFlags |= Earthdawn.flags.VerboseRoll;     this.misc[ "SP-Step" ] = true;  break;
            case "sp-shamanism-step":       this.Karma( "SP-Shamanism-Karma-Control", 0 );      this.misc[ "reason" ] = "Shamanism";            this.misc[ "headcolor" ] = "ask";     this.bFlags |= Earthdawn.flags.VerboseRoll;     this.misc[ "SP-Step" ] = true;  break;
            case "sp-wizardry-step":        this.Karma( "SP-Wizardry-Karma-Control", 0 );       this.misc[ "reason" ] = "Wizardry";             this.misc[ "headcolor" ] = "ask";     this.bFlags |= Earthdawn.flags.VerboseRoll;     this.misc[ "SP-Step" ] = true;  break;
            case "sp-power-step":           this.Karma( "SP-Power-Karma-Control", 0 );          this.misc[ "reason" ] = "Power";                this.misc[ "headcolor" ] = "ask";     this.bFlags |= Earthdawn.flags.VerboseRoll;     this.misc[ "SP-Step" ] = true;  break;
            case "speak-step":              this.Karma( "Karma-Control-Speak", -1 );            this.misc[ "reason" ] = "Speak Language Test";  this.misc[ "headcolor" ] = "action";  this.misc[ "rollWhoSee" ] = "RollType-Speak";   if (state.Earthdawn.gED) this.Damage( ["Strain", "NA", 1 ] );   break;
            case "readwrite-step":          this.Karma( "Karma-Control-ReadWrite", -1 );        this.misc[ "reason" ] = "R/W Language Test";    this.misc[ "headcolor" ] = "action";  this.misc[ "rollWhoSee" ] = "RollType-ReadWrite"; if (state.Earthdawn.gED) this.Damage( ["Strain", "NA", 1 ] ); break;
  // End sheetversion < 2.0
            case "recovery-step": {
              this.Karma( (state.Earthdawn.sheetVersion < 1.8 ) ? "Karma-Control-Recovery": "Recovery-Karma", -1 );
              if( subsegmentArray.indexOf( "Wil" ) > 0 ) {
                this.bFlags |= Earthdawn.flags.Recovery | Earthdawn.flags.RecoveryStun;
                this.misc[ "reason" ] = "Stun Recovery Test";
              } else {
                this.bFlags |= Earthdawn.flags.Recovery;
                this.misc[ "reason" ] = "Recovery Test";
              }
              this.misc[ "headcolor" ] = "recovery";
              if (Earthdawn.getAttrBN( this.charID, "NPC", "0") != Earthdawn.charType.mook ) {
                let aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "Recovery-Tests" }, 0, 2);
                if( (aobj.get( "current" ) || 0) <= 0) {
                  this.chat( this.tokenInfo.name + " does not have a Recovery Test to spend.", Earthdawn.whoFrom.apiWarning );
                  falloutParse = true;
                } else
                  Earthdawn.setWithWorker( aobj, "current", Earthdawn.parseInt2( aobj.get( "current" )) -1 );
              }
            } break;
            case "casting": {
              let base = Earthdawn.buildPre( "SPM", subsegmentArray[2] );
              this.misc[ "headcolor" ] = "action";
              if( Earthdawn.getAttrBN( this.charID, base + "SuccessLevels", "None") !== "Effect +2 Inc")
                this.bFlags |= Earthdawn.flags.NoOppMnvr;
              this.doLater += "~Karma: kcdef: 0: SP-Spellcasting-Karma-Control";
  // redo karma control cdd todo
              this.misc[ "reason" ] = Earthdawn.getAttrBN( this.charID, base + "Contains", "") + " Spellcasting Test";
              subsegmentArray = [ "value", "SP-Spellcasting-Step" ];
            } break;
            case "will-effect":   // Generic casting will effect button.
              this.misc[ "headcolor" ] = "effect";
              if (Earthdawn.getAttrBN( this.charID, "SP-Willforce-Use", "0") == "1") {
                this.doLater += "~Karma: kcdef: -1: SP-WilEffect-Karma-Control: kcdef: 0: SP-Willforce-Karma-Control" + "~Strain: 1";
                this.misc[ "reason" ] = "WillForce Effect";
              } else {
                this.doLater += "~Karma: kcdef: -1: SP-WilEffect-Karma-Control";
                this.misc[ "reason" ] = "Will Effect";
              }
              this.bFlags |= (Earthdawn.flagsArmor.Unknown & Earthdawn.flags.WillEffect );
              break;
            default:
              this.chat( "Failed to parse 'value' in msg segment: '" + cmdSegment + "' in msg: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError );
            }   // End Value, Step, or Attribute.    Note that this falls into the Lookup below.

          case "stepmod":
          case "modstep":
          case "modvalue":
            if( !falloutParse )
              falloutParse = this.Lookup( 1, subsegmentArray );       // 1 = this.misc.step
            break;
          case "storeintoken":
            this.TokenSet( "replace", subsegmentArray[ 1 ], subsegmentArray[2], subsegmentArray[ 3 ]);
            this.chat( subsegmentArray[ 3 ] + " extra successes to go to next damage upon " + this.getTokenName( subsegmentArray[ 2 ] ), Earthdawn.whoTo.player);
            break;
          case "target":
          case "targetnum":
            this.TargetT( subsegmentArray );
            break;
          case "targetspell": {
            let tt = Earthdawn.getAttrBN( this.charID, Earthdawn.buildPre( "SPM", subsegmentArray[1] ) + "Casting", "MDh");
            let sa = ( "targetspell:" + tt ).split( ":" );
            this.TargetT( sa );
          }   break;
          case "targettype":      // PD:  (or MD or SD) with optional h = highest, p1p = plus one per person, -Nat. This marks that this is the secondary chat message.
            if( subsegmentArray.length > 1)
              this.bFlags |= this.TargetTypeToFlags( subsegmentArray[ 1 ] );
            break;
          case "targetclear":
          case "targetsclear":
            this.TokenSet( "clear", "TargetList");
            break;
          case "targetid":
          case "targetset":
            if( this.bFlags & Earthdawn.flagsTarget.Set ) {
              this.TokenSet( "clear", "TargetList");
              for( var i = 1; i < subsegmentArray.length; i++ )
                this.TokenSet( "add", "TargetList", subsegmentArray[ i ]);
            } else
              this.forEachTarget( subsegmentArray );
            break;
          case "targetmod":
          case "modtarget":
          case "targetvalue":
            falloutParse = this.Lookup( 3, subsegmentArray );       // 1 = this.targetNum
            break;
          case "!edtoken":
          case "edtoken":
          case "token":                       // When called from a token action, "!edToken~ " is inserted ahead of another valid !Earthdawn~ command.
            this.tokenAction = true;        // This lets us know we were called from a token action. Without this. we were called directly from a character sheet.
            break;                          // This is done by creating a macro named Token, and inserting #Token in front of any other action you want a token action to preform.
          case "tunematrix":
            this.TuneMatrix( subsegmentArray );
            break;
          case "updatedates":
            this.UpdateDates( subsegmentArray );
            break;
          default:
            this.chat( "Failed to parse msg segment: '" + cmdSegment + "' in msg: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError );
        } // End Switch
      } catch( err ) { this.edClass.errorLog( "ED.Parse() error caught: " + err ); }
      return falloutParse;
    };     // End ParseObj.Parse();



                // ParseObj.ParseLoop - Loop through as long as there are message segments left to process.
                //
                // Note that with asynchronous code, ParseLoop() is usually the place to reenter the loop.
                // IE: the old thread is told to fallout, and  the new thread takes over processing and continues with
                // a call to ParseLoop() to process any remaining tokens.
    this.ParseLoop = function()  {
      'use strict';
      let falloutLoop = false;
      while ( !falloutLoop && (++this.indexMsg < this.edClass.msgArray.length )) {
          falloutLoop = this.Parse( this.edClass.msgArray[ this.indexMsg ].trim() );
      }
    }; // End ParseObj.ParseLoop();



  };  // End of ParseObj;



              // ED.ParseCmd ()
              // This routine is the control routine that sets up the loop. The real work is done by routines called by this one.
  this.ParseCmd = function()  {
    'use strict';
    let edParse = new this.ParseObj( this );    // This object is used to parse the message into segments delimited by tilde (~) characters and to process each individual segment.
    if ( this.msgArray[ 0 ].trim()  === "!edToken" )
      edParse.tokenAction = true;             // This lets us know we were called from a token action. Without this. we were called directly from a character sheet.
    edParse.ParseLoop();
  }; // End ED.ParseCmd();



//
// NOTE: Everything between this point and the similar note above is used with the PARSE command and interacts with the character sheet.
//
// So if you are just using the stepdice and initiative rollers, and are not using my Earthdawn character sheets, you can cut everything between this point and the note above.
//



            // NOTE: This is the continuation of the main CREATE thread for this object. It makes use of functions declared above
  if( origMsg !== undefined ) {
    origMsg.content = origMsg.content.replace( new RegExp( Earthdawn.constant( "Colon" ), "g"), ":");      // Buttons don't like colons, so any colon has been changed to this weird character. Change them back.
    this.msg = this.ReconstituteInlineRolls( origMsg );
    this.msgArray = origMsg.content.split("~");
    if ( this.msgArray.length < 2)
      this.chat( "Error! Earthdawn.js was unable to parse string. msg was: " + this.msg.content, Earthdawn.whoFrom.apiError );

    if( state.Earthdawn.logCommandline )
      log( this.msg );
  }



};  // End of EDclass;







on("ready", function() {
  'use strict';


  on("add:character", function( obj ) {     // Brand new character. Make sure that certain important attributes fully exist.
    'use strict';
    let ED = new Earthdawn.EDclass();
    ED.newCharacter( obj.get( "_id" ) );
  });


  on("add:graphic", function( obj ) {       // New Graphic. Set it's statusmarkers to character sheet conditions and options.
    'use strict';
    let ED = new Earthdawn.EDclass(),
      rep = obj.get( "represents" );
    if( rep && rep != "" ) {
      let edParse = new ED.ParseObj( ED );
      edParse.tokenInfo = { type: "token", name: obj.name, tokenObj: obj, characterObj: getObj("character", rep ) };
      edParse.charID = rep;
      edParse.SetStatusToToken();
      edParse.TokenSet( "clear", "TargetList" );
      edParse.TokenSet( "clear", "Hit" );
      edParse.TokenSet( "clear", "SustainedSequence" );
    }
  });



  on("add:attribute", function (attr) {
    'use strict';
    Earthdawn.attribute( attr );
  });


                // change attribute. See if it needs some special processing.
  on("change:attribute", function (attr, prev) {
    'use strict';
    Earthdawn.attribute( attr, prev );
  }); // end  on("change:attribute"



        // An attribute is being destroyed.
  on("destroy:attribute", function (attr ) {
    'use strict';
    try {
      let nm = attr.get( "name" );
      function testDeletion() {     // return true if character is still there and we should proceed. false if character is not there. 
        if( !getObj( 'character', attr.get( 'characterid' ))) {
          log( "Earthdawn on destroy attribute() character does not exist: probably character deletion: " + nm );
          return false;
        }
        let aobj = findObjs({ _type: 'attribute', _characterid: attr.get( "_characterid" ), name: "edition" });
        if( aobj === undefined || aobj.length == 0 ) {
          log("Earthdawn on destroy attribute() edition attribute not found, probably character deletion: + nm");
          return false;
        }
        return true;
      }
      
// log("Earthdawn - Attribute deleted " + nm  );
            // If it is a link attribute, it is probably because the row has been deleted.
            // If it is a link, go through the links, to / from the linked item and remove the other half of the links.
      if( nm.endsWith( "_LinksGetValue" ) || nm.endsWith( "_LinksProvideValue" )) {   // One half of a link has been deleted. remove the link from the other half.
//log("destroying");  log( attr);
        setTimeout( function() {
          try {
            if( !testDeletion() ) return;
            let arr = attr.get( "max" ).split( "," );
            if( arr.length > 0 ) {
              let ED = new Earthdawn.EDclass();
              let edParse = new ED.ParseObj( ED );
              edParse.charID = attr.get( "_characterid" );
              for( let i = 0; i < arr.length; ++i )
                if( nm.endsWith( "_LinksGetValue" )) {      // LinksGetValue are of form comma delimited list of fully qualified attributes, maybe more than one seperated by plus signs.
                  let a2 = arr[ i ].split( "+" ),
                    cnt = 0;
                  for( let j = 0; j < a2.length; ++j ) {
                    if( a2[ j ].startsWith( "repeating_") && cnt < 1 ) {      // if it is not linking to a repeating section, then it is not bidirectional, and we don't have anything to do for this link.
                      edParse.ChatMenu( [ "ChatMenu", "LinkRemoveHalf",
                          Earthdawn.buildPre( Earthdawn.repeatSection( 3, a2[ j ] ), Earthdawn.repeatSection( 2, a2[ j ] ))
                          + "LinksProvideValue", Earthdawn.repeatSection( 2, nm )] );
                      ++cnt;
                  } }
                } else      // LinksProviceValue are comma delimited lists of form (code);(rowID).
                  edParse.ChatMenu( [ "ChatMenu", "LinkRemoveHalf",
                      Earthdawn.buildPre( Earthdawn.getParam( arr[ i ], 1, ";" ), Earthdawn.getParam( arr[ i ], 2, ";" ))
                      + "LinksGetValue", Earthdawn.repeatSection( 2, nm )] );
            }     // This should remove this rowID (last parameter) from the referenced lists.
          } catch(err) { log( "Earthdawn on destroy attribute() Links error caught: " + err ); }
        }, 2000 );    // end delay 10 seconds.
      }
      else if( nm.endsWith( "_SPM_spRowID" )) {      // Spell matrix has been deleted.
        setTimeout( function() {
          try {
            if( !testDeletion() ) return;
            let ED = new Earthdawn.EDclass();
            let edParse = new ED.ParseObj( ED );
            edParse.charID = attr.get( "_characterid" );
            edParse.TuneMatrix( [ "Tune", "inMatrix" ]);
          } catch(err) { log( "Earthdawn on destroy attribute() spell Matrix error caught: " + err ); }
        }, 2000 );    // end delay 10 seconds.
      }
      else if( nm.endsWith( "_RowID" )) {      // A row has been deleted. If the row has a Token action, delete it.
        setTimeout( function() {
          try {
            if( !testDeletion() ) return;
            let rowID = Earthdawn.repeatSection( 2, nm );
            let ab = findObjs({ _type: "ability", _characterid: attr.get( "_characterid" )});
            _.each( ab, function (abObj) {
              if( abObj.get( "action" ).indexOf( rowID ) !== -1)
                abObj.remove();
            });
          } catch(err) { log( "Earthdawn on destroy attribute() token action error caught: " + err ); }
        }, 2000 );    // end delay 10 seconds.
      }
    } catch(err) { log( "Earthdawn on destroy attribute() error caught: " + err ); }
  }); // end  on("destroy:attribute")



        // damage changed on token. See if it need to set token unc or dead.
        // what is "value" or "max".
        // Note: This routine is a bit round about due to a change in  the data structure. I just modified the old code to the new data structure instead of redesigning from scratch.
  function onChangeDamage(what, attr, prev) {
    'use strict';
    try {
      if( attr.get("_subtype") !== "token")
        return;
      let rep = attr.get("represents")
      if( !rep )  return;

      let death = Earthdawn.getAttrBN( rep, "Damage-Death-Rating", "25" ),
        unc = ( what === "value" ) ? Earthdawn.getAttrBN( rep, "Damage_max", "20" ) : attr.get( "bar3_max" ),
        dam = ( what === "max" )   ? Earthdawn.getAttrBN( rep, "Damage", "0" )      : attr.get( "bar3_value" );

      function health() {
        if( dam < unc)
          return "u";   // Set Healthy.
        else if( dam < death)
          return "s";   // Set unconscious
        else
          return "a";   // Set to special value dead.
      }

      let whatcurr = health();
      let whatprev = whatcurr;
      if( prev ) {
        if( what === "value" )
          dam = prev[ "bar3_value"];
        else
          unc = prev[ "bar3_max" ];
        whatprev = health();
      }
      if( !prev || whatcurr !== whatprev) {   // Health status has changed.
        let ED = new Earthdawn.EDclass();
        let edParse = new ED.ParseObj( ED );
        edParse.charID = rep;
        edParse.tokenInfo = { type: "token", tokenObj: attr }
        edParse.MarkerSet( [ "ocd", (whatcurr === "a") ? "healthdead" : "healthunconscious", (whatcurr === "u") ? "u" : "s" ] );   // This will set healthdead or healthunconscious to set, or healthunconscious to unset which will also unset healthdead.
      }
    } catch(err) { log( "on Change Damage() error caught: " + err ); }
  }; // end  onChangeDamage();


  on("change:graphic:bar3_value", function (attr, prev) {
    onChangeDamage( "value", attr, prev );
  });


  on("change:graphic:bar3_max", function (attr, prev) {
    onChangeDamage( "max", attr, prev );
  });



  on("change:character:name", function (attr, prev) {
    let nm = attr.get("name")
    if( nm )
      Earthdawn.set( Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: attr.get("_id"), name: "charName" }), "current", nm )
  }); // end on change character name



        // a tokens statusmarkers have changed.
        // If it is not a mook, see if it is a status marker that has meaning to this sheet, and set the appropriate condition.
  on("change:graphic:statusmarkers", function( attr, prev ) {
    'use strict';
    try {
      let rep = attr.get( "represents" );
      if( rep && rep != "" ) {
//log("at change marker");
        let npc = Earthdawn.getAttrBN( rep, "NPC", "0" );
        if( npc !== Earthdawn.charType.pc && npc !== Earthdawn.charType.npc )       // Don't mess with the statusmarkers of anything except PCs and NPC.
          return;
        let newSM = _.without( attr.get( "statusmarkers" ).split( "," ), ""),   // split( "" ) will return an array of [""], so filter those out.
          oldSM = _.without( prev[ "statusmarkers" ].split( "," ), "");
        let added = _.difference( newSM, oldSM ),
          removed = _.difference( oldSM, newSM );
        if( removed.length || added.length ) {
          let ED = new Earthdawn.EDclass();
          let edParse = new ED.ParseObj( ED );
          edParse.tokenInfo = { type: "token", name: attr.name, tokenObj: attr, characterObj: getObj("character", rep ) };
          edParse.charID = rep;
          for( let i = 0; i < removed.length; ++i )     // unset everything with these markers.
            edParse.MarkerSet( [ "ocsm", removed[ i ].replace( /\@\d*/g, ""), "u"] );
          for( let i = 0; i < added.length; ++i ) {
//log("change:graphic:statusmarkers added :" + added[i]);
            let fnd = added[ i ].match( /\@\d/ );   // does it look like foo@3?  (this does not match "bar::3" but does match the end of "foo::3@3);
            if( fnd )       // strip the @n numbers out of the marker names, but convert them to "a", "b", etc. to be set.   Changes foo@3 to MarkerSet( "foo", c);
              edParse.MarkerSet( [ "markerDirect", added[ i ].replace( /\@\d*/g, ""), String.fromCharCode(Earthdawn.parseInt2( fnd[0].charAt(1)) + 96) ] );
            else
              edParse.MarkerSet( [ "markerDirect", added[ i ].replace( /\@\d*/g, ""), "s"] );
      } } }
    } catch(err) { log( "on change statusmarkers() error caught: " + err ); }
  }); // end on change statusmarkers


    let ED = new Earthdawn.EDclass();
    ED.Ready();
}); // End on("ready")



on("chat:message", function(msg) {
  'use strict';
//log(msg);
  if(msg.type === "api" ) {
//        log(msg);
                // Earthdawn or Token - Earthdawn Message to be sent to the parser to handle. Could be any of several commands.
    if ( msg.content.startsWith( "!Earthdawn" ) || msg.content.startsWith( "!edToken" )) {
      let ED = new Earthdawn.EDclass( msg );
      if ( ED.msgArray.length > 1 )
          ED.ParseCmd();
    } else if( msg.content.startsWith( "!edsdr" )) {        // edsdr - Earthdawn Step Dice Roller
        let ED = new Earthdawn.EDclass( msg );
        if ( ED.msgArray.length > 1 )
          ED.StepDiceRoller();
    } else if( msg.content.startsWith( "!edInit" )) {   // edInit - Earthdawn Initiative.    Rolls individual initiatives for all selected tokens
        let ED = new Earthdawn.EDclass( msg );
        if ( ED.msgArray.length > 1 )
          ED.Initiative();
    }
  }    // End if msgtype is api
}); // End ON Chat:message.

// ToDo CDD
//
// Routines that need work.
// GetTokenValue:
