//
// Earthdawn Step Dice Roller
// Plus Earthdawn 4th edition character sheet helper class, which also serves as helper for the 1879 (FASA Official) character sheet.
//
// By Chris Dickey
// Version: See line two of code below.
// Last updated: 2024 June.
//
// Earthdawn (FASA Official) Character sheet and associated API Copyright 2015-2024 by Christopher D. Dickey.
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
// Programming Note: Nested Roll20 chat menu queries are confusing. for a sample of code that demonstrates best practices, search for "arrayAdd" in the chatMenu: stateEdit routine.


//
// Define a Name-space
var Earthdawn = Earthdawn || {};
            // define any name-space constants
Earthdawn.Version = "3.30";       // This is the version number of this API file.
                                  // state.Earthdawn.sheetVersion is the version number of the html file being used and might or might not be the same as the API version. 
                                  // Each individual sheets edition_max is the sheetVersion that sheet has been updated to.
                                  // So if a getAttrBN( "edition_max" ) is < sheetVersion, then the sheet is in the process of updating. 

Earthdawn.whoFrom = {
  player:                 0x08,
  character:              0x10,
  api:                    0x20,
  apiError:               0x40,
  apiWarning:             0x80,
  noArchive:            0x0100,
  mask:                 0x01F8 }; // This can be &'ed to get only the whoFrom part.
Earthdawn.whoTo = {               // Note: whoTo: 0 is broadcast to everybody.    WhoTo 3 is both player and GM.
  public:                 0x00,
  player:                 0x01,
  gm:                     0x02,
  playerList:             0x04,   // This is all players who can control the token. It modifies player and only has effect if player is also present.
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
  Each:             0x04000000,   // Roll one dice, but compare the result to multiple target numbers.
  Riposte:              0x0400,
  Ask:                  0x0800,
  Set:                  0x1000,   // Set means attach the targetList to the token.
  Natural:          0x02000000,
  Mask:             0x06001FE0 }; // This can be &'ed to get only the flagsTarget part.
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
  Full:             0x00,     // Give all information about the roll and target number. IE: Target number 12, Result 18, succeeded by 6 with 1 extra success.
  VagueSuccess:     0x01,     // Give full result of roll, but don't give detail upon target number or exactly how close to success roll was. IE: Result: 18. 1 extra success.
  VagueRoll:        0x02 };   // Default. Don't give detail on the roll or the target number, just say how much succeeded or failed by. IE: Succeeded by 6 with 1 extra success.
Earthdawn.charType = {
  object:         "-1", // The token is not really a character at all, but is an object such as a campfire or a torch.
  pc:             "0",
  npc:            "1",
  mook:           "2" };
Earthdawn.Colors = {
  dflt:         "cornflowerblue", dfltfg:     "white",    // dflt used for addSheetButtonCall . Color to be passed as param
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


    // recreate named ability.
Earthdawn.abilityAdd = function ( cID, Ability, ActionStr )  {
  'use strict';
  try {
    Earthdawn.abilityRemove( cID, Ability );
    createObj("ability", { characterid: cID, name: Ability, action: ActionStr, istokenaction: true });
  } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn:abilityAdd() error caught: " + err ); }
} // End abilityAdd



        // If a named ability exists for this character, remove it.
Earthdawn.abilityRemove = function ( cID, Ability ) {
  'use strict';
  try {
    let aobj = findObjs({ _type: "ability", _characterid: cID, name: Ability });
    _.each( aobj, function (ab) {
      ab.remove();
    });
 } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn:abilityRemove() error caught: " + err ); }
} // End abiltiyRemove



    // Supports multiple sizes. Defaults to -icon, but if size is "s" then -iconSmall, and "l" (lowercase L) or "b" (big), then -iconLarge.
    // For chatwindows to see a class they must start with sheet-rolltemplate. 
    // The two classes sheet-rolltemplate-icons and sheet-rolltemplate-iconSmall provide formating for the icons. 
    // The other classes, all of the form sheet-rolltemplate-icon-(name) provide a url to the icon. 
    // icon: name of icon only. sheet-rolltemplate-icons- is assumed.
    // size: "s" then class sheet-rolltemplate-iconSmall. "l" (lowercase l) or "b" then -iconLarge. "i" or "m" for sheet0rolltemplate-icon
    // tip: Tool tip to be displayed under icon. 
    // pre and post: And text before or after the icon. 
Earthdawn.addIcon = function ( icon, size, tip, pre, post ) {
  'use strict';
  try {
    let s, outer = tip && (pre || post), t = "";
    if( !size )  s = "icon";
    else if( size.length > 11 )
      log( "Data mismatch warning. addIcon found a large size, which in the past has meant that size was left out and it was using a tip for size. Icon: " + icon );
    else {
      let size2 = size.slice( 0, 1 ).toLowerCase();
      if( size2 == "s" ) s = "iconSmall";
      else if( size2 == "l" || size2 == "b" ) s = "iconLarge";
      else if( size2 == "i" || size2 == "m" ) s = "icon";   // icon or medium.
      else
        log( "Data mismatch warning. Invalid size of '" + size + "' in addIcon: " + icon );
    }
    if( outer )         t = '<span title="' + tip + '">';     // If we have pre or post, tooltip is around everything. If not it is just in the icons span. 
    if( pre )           t += pre;
    if( icon )          t += '<span class="sheet-rolltemplate-' + s + ' sheet-rolltemplate-icons-' + icon + '"';
    if( tip && !outer ) t += ' title="' + tip + '"'; 
    if( icon )          t += '></span>';
    if( post )          t += post;
    if( outer )         t += '</span>';
    return t;
 } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn:addIcon() error caught: " + err ); }
} // end addIcon



    // An attribute for some character has changed. See if it is one that needs special processing and do it.
Earthdawn.attribute = function ( attr, prev ) {
  'use strict';
  try {
//log( attr);   // use attr.get("name") and attr.get("current").  // {"name":"Wounds","current":"1","max":8,"_id":"-MlqexKD2f4f744TgzlK","_type":"attribute","_characterid":"-MlqeuXlNO51-RYxmJv8"}
//log( prev);   // use prev["name"] and prev["current"]           // {"name":"Wounds","current":0,"max":8,"_id":"-MlqexKD2f4f744TgzlK","_type":"attribute","_characterid":"-MlqeuXlNO51-RYxmJv8"}

    let sa      = Earthdawn.safeString( attr.get( "name" )),
        cID     = Earthdawn.safeString( attr.get( "_characterid" )),
        current = Earthdawn.safeString( attr.get( "current" ));

    function recordWrap( wrapper ) {
      'use strict';
// Oct 23
log("Obsolete code. If you see this, please report to API developer");
      if( parseFloat( Earthdawn.getAttrBN( cID, "edition_max", 0 )) < state.Earthdawn.sheetVersion )    // If edition is not up to date, it is hopefully being updated, so don't do anything.
        return;
      let rankTo = current;
      if( rankTo === "" )     // This is a newly created row, and has not really been set yet. No need to do anything until data is entered.
        return;
      let rankFrom = prev ? prev["current"]: 0;
      let rankDiff = rankTo - rankFrom;
      if( !rankDiff )       // If there are no actual rank changes.
        return;
      if( Earthdawn.getAttrBN( cID, "NPC", "1" ) != Earthdawn.charType.pc )   // If this is not a PC, don't bother with the accounting.
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
        if( !type.endsWith( "link" ) && type.indexOf( "-" ) > -1 ) {   // is of form D1-Novice or some such. Probably with a Discipline and a Tier.
          let tier = Earthdawn.getParam( type, 2, "-"),
              disc = Earthdawn.safeString( Earthdawn.getParam( type, 1, "-" ));
          if( (state.Earthdawn.gED && tier == "Novice") || (state.Earthdawn.g1879 && ( bCount !== "S") && ( tier == "Initiate" || tier == "Profession" )))    // Note, bCount might have already been set in SKK.
            bCount = "T";   // Only need to count 1879 if Initiate, or ED if Novice. Otherwise we certainly need accounting.
          if( disc === "QD" ) {       // Questor
            lpBasis = 0;          // Note that this is not the final value, it gets adjusted in the switch below.
            misclabel = tier + " Granted Questor Devotion";
          } else if( disc === "PA" ) {    // Path
            lpBasis = 0;
            misclabel = tier + " Path Talent Option";
          } else if( disc === "V" ) {   // Versatility
            lpBasis = 1;
            misclabel = tier + " Versatility";
          } else if( disc === "SMO" ) {   // Spell Matrix Object
            lpBasis = 0;
            misclabel = tier + " Spell Matrix Object";
          } else {              // Most Disciplines and Skills.
            if( isFinite( disc.slice( -1 )))
              lpBasis = Earthdawn.parseInt2( disc.slice( -1 )) -1;
            else {
              log( Earthdawn.timeStamp() + "Error! ED Attribute recordWrap:typeLP() unknown type: " + type );
              lpBasis = 0;
            }
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
              log( Earthdawn.timeStamp() + "Error! ED Attribute recordWrap typeLP for: " + sa );
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
          header = Earthdawn.getAttrBN( cID, sa.slice( 0, -10 ) + "DSP_Name", "" );
          misclabel = "Questor Devotion";
          miscval = rankFrom + " -> " + rankTo;
          lpBasis = 1;
          break;
        case "Path-Journeyman":
          header = Earthdawn.getAttrBN( cID, sa.slice( 0, -10 ) + "DSP_Name", "" );
          misclabel = "Path Talent Costs Journeyman";
          miscval = rankFrom + " -> " + rankTo;
          lpBasis = 1;
          break;
        case "Path-Master":
          header = Earthdawn.getAttrBN( cID, sa.slice( 0, -10 ) + "DSP_Name", "" );
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
              type = Earthdawn.getAttrBN( cID, sa.slice( 0, -4 ) + "Origin", "Free-link" );
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
              log( Earthdawn.timeStamp() + "Error! ED Attribute recordWrap got illegal value of: " + Earthdawn.getParam( sa, 4, "_"));
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
        let party = findObjs({ _type: "character", name: "Party" });
        if( party && party[ 0 ] )     // Look for throalic date on the "Party" sheet.
          tdate = Earthdawn.getAttrBN( party[ 0 ].get( "_id" ), "record-date-throalic", "" );
      }
      if( !tdate && state.Earthdawn.gED )
        tdate = "1517-1-1";

      switch( wrapper ) {       // This switch is for categories that are calculated once, no matter how many ranks have been gained.
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

      let stem = "&{template:chatrecord} {{header=" + getAttrByName( cID, "character_name" ) + ": " + header + "}}"
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
        ED.chat( stem + "{{button1=[Press here](" + Earthdawn.colonFix( slink ) + ")}}", Earthdawn.whoTo.player | Earthdawn.whoTo.playerList | Earthdawn.whoFrom.noArchive, null, cID );
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
              if( Earthdawn.safeString( att.get("name") ).slice( -rkey[ i ].length ) != rkey[ i ] )
                continue;
              if( typ[ i ] ) {
                let b = Earthdawn.getAttrBN( cID, Earthdawn.safeString( att.get("name") ).slice(0, -5 ) + typ[ i ] );
                if( (!b && typ[i] == "_Origin") || b === "Free" || b === "Free-link" || b === "Questor" || b === "Special"
                        || b === "Item" || b === "Item-link" || b === "Dummy" || b === "Pseudo" || b === "Other" )
                  return;
              }
              count += Math.min( att.get( "current" ), 3);
            }
          }); // End for each attribute.
        }

//        if( Earthdawn.getAttrBN( cID, "CreationMode", "0") === "1" )      // when value is 1, it is NOT creation.
        if( count > maxcount && state.Earthdawn.sheetVersion <= parseFloat( Earthdawn.getAttrBN( cID, "edition_max", 0 ))) {
          let ED = new Earthdawn.EDclass();
          ED.chat( send, Earthdawn.whoTo.player | Earthdawn.whoTo.playerList | Earthdawn.whoFrom.noArchive, null, cID );
        }
      } // End count talents and skills to see if they are free or need to be paid for.
    } // End recordWrap()



          // This is functional start of main part of attribute change handling routine. Nothing much got processed above recordWrap().

          // When change is in a repeating section...
    if( sa.startsWith( "repeating_" )) {
//log( "change " + sa);
//log( attr);   // use attr.get("name") and attr.get("current").  // {"name":"Wounds","current":"1","max":8,"_id":"-MlqexKD2f4f744TgzlK","_type":"attribute","_characterid":"-MlqeuXlNO51-RYxmJv8"}

      let code = Earthdawn.repeatSection( 3, sa ),
          rowID = Earthdawn.repeatSection( 2, sa );
      if( !sa.endsWith( "_RowID" ))     // Don't try to read the RowID if the RowID is what is being changed! It is unnecessary and worse, the new value might not be available for reading yet.
        if( !(rowID in state.Earthdawn.rowIDobj) && !Earthdawn.testNoRowID( code ) && Earthdawn.getAttrBN( cID, Earthdawn.buildPre( code, rowID ) + "RowID", "") !== rowID ) {    // If a repeating_section is changed and no RowID is stored and it is not in the list of ones already being checked.
          state.Earthdawn.rowIDobj[ rowID ] = true;
          setTimeout( function() {
            'use strict';
            try{
              if( Earthdawn.getAttrBN( cID, Earthdawn.buildPre( code, rowID ) + "RowID", "") !== rowID )
                Earthdawn.setWW( Earthdawn.buildPre( code, rowID ) + "RowID", rowID, cID )
              delete state.Earthdawn.rowIDobj[ rowID ]
            } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn:setRowID() error caught: " + err ); }
          }, 900);
        }
      if( sa.endsWith( "_Name" ) || (sa.endsWith( "_Rank") )) {
        if( code === "MAN" ) {    // Keep a list of Maneuver RowIDs, so we can process though them quicker.
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
          Earthdawn.setWW( "ManRowIdList", t, cID);
        } // end rep sect MAN

//        if(sa.endsWith( "_Rank" ) && !sa.endsWith( "_WPN_Rank" ))   // If a rank has changed, send chat message asking if want to pay LP for it.
//          recordWrap( "Rank" );

//        if( code === "T" || code === "NAC" || code === "SK" || code === "SKA" || code === "SKK" || code === "SPM" || code === "WPN" )
//          Earthdawn.SetDefaultAttribute( cID, Earthdawn.buildPre( code, rowID ) + "CombatSlot", code === "SPM" ? 1 : 0 );
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
          nmn = current;
        } else    // Combat slot has changed, so look up name.
          nmo = nmn = Earthdawn.getAttrBN( cID, pre + ( code === "SPM" ? "Contains" : "Name" ), "" );

        if( nmo ) {
          Earthdawn.abilityRemove( cID, symbol + nmo );
          if( code === "SKA" )
            Earthdawn.abilityRemove( cID, symbol + nmo + "-Cha" );    // Artisan charisma roll.
        }
        let cbs;      // Only create new one if new supposed to.
        if( t === 0x01 )
          cbs = current == "1";
        else
          cbs = Earthdawn.getAttrBN( cID, pre + "CombatSlot", "0" ) == "1";
        if( cbs ) {
          Earthdawn.abilityAdd( cID, symbol + nmn, "!edToken~ %{selected|" + Earthdawn.buildPre( code, rowID ) + "Roll}" );
          if( code === "SKA" )
            Earthdawn.abilityAdd( cID, symbol + nmn + "-Cha", "!edToken~ %{selected|" + Earthdawn.buildPre( code, rowID ) + "Rollc}" );
        }
      } // End Token Action maint.
      else if( sa.endsWith( "_MSG_toAPI" )) {    // sheetworker has sent us something it wants us to do.
        if( attr.get( "max" ) === "ACK" ) {    // We have got an ACK from the sheetworker. Delete the row.
//          if( state.Earthdawn.logMsg ) log("toAPI ACK received ( " + rowID + " )");
          if( state.Earthdawn.logMsg ) log("toAPI ACK received ( " + sa + " )");
          let pre = Earthdawn.buildPre( code, rowID );
          function zot( nm ) {
            'use strict';
            let attr2 = findObjs({ _type: "attribute", _characterid: cID,  name: pre + nm });
            if( attr2 )
              for( let i = attr2.length -1; i > -1; --i )
                attr2[ i ].remove();
          }
          zot( "TimeStamp ");
          zot( "toSheetworker" );
          zot( "toAPI" );
        } else if( current ) {   // msg to API via "current". We tend to get two, one with "current" blank (when it is created), and a 2nd one with the real value. Only pay attention to the 2nd one.
          Earthdawn.fromSheetworkerToAPI( current, cID, sa );
          let pre = Earthdawn.buildPre( code, rowID );
          if( state.Earthdawn.logMsg ) log("API sending ACK ( " + sa.trim() + " ):   " + current.trim() + "   to ( " + pre + "toSheetworker_max )" );
          Earthdawn.setMaxWW( pre + "toSheetworker", "ACK", cID );
        }
//      } //      else if( sa.endsWith( "_SP_Circle" ))
//        recordWrap( "SP_Circle" );
//      else if( sa.endsWith( "_NAC_Requirements" ))
//        recordWrap( "NAC_Requirements" );
//      else if( sa.endsWith( "_DSP_Circle") && sa.startsWith( "repeating_discipline")) {
//        switch (Earthdawn.getAttrBN( cID, sa.slice( 0, -11) + "_DSP_Type", "Discipline" )) {
//          case "Path-Journeyman": recordWrap( "Path-Journeyman" ); break;
//          case "Path-Master": recordWrap( "Path-Master" );     break;
//          case "Questor": recordWrap( "Questor" );         break;
//          case "Other":    break;      // Spirit & Creature
//          default:     recordWrap( "DSP_Circle" );
//        }
      } else if( sa.endsWith( "_T_Special" )) {
        if( current === "CorruptKarma" )
          Earthdawn.abilityAdd( cID, Earthdawn.constant( "Target" ) + "Activate-Corrupt-Karma", "!edToken~ SetToken: @{target|to have Karma Corrupted|token_id}~ Misc: CorruptKarma: ?{How many karma to corrupt|1}");
        else
          Earthdawn.abilityRemove( cID, Earthdawn.constant( "Target" ) + "Activate-Corrupt-Karma");
      }
/*
      else if ( sa.endsWith( "_NAC_Requirements" )) {     // If this is a PC, post an accounting entry for them.
        if( Earthdawn.getAttrBN( cID, "NPC", "1" ) == Earthdawn.charType.pc ) {
          let tdate = Earthdawn.getAttrBN( cID, "record-date-throalic", "" ),     // First look on the current character sheet
            today = new Date(),
            rnk = Earthdawn.parseInt2( current ),
            name = Earthdawn.getAttrBN( cID, Earthdawn.buildPre( code, rowID ) + "Name", "" );
          if( rnk ) {
            if( !tdate ) {
              let party = findObjs({ _type: "character", name: "Party" });
              if( party && party[ 0 ] )     // Look for throalic date on the "Party" sheet.
                tdate = Earthdawn.getAttrBN( party[ 0 ].get( "_id" ), "record-date-throalic", "" );
            }
            if( !tdate ) tdate = "1517-1-1";
            let stem = "&{template:chatrecord} {{header=" + getAttrByName( cID, "character_name" ) + ": " + name + "}}"
                + "{{misclabel=Knack}}{{miscval=Rank " + rnk + "}}"
                + "{{lp=" + (Earthdawn.fibonacci( rnk ) * 100) + "}}"
                + "{{sp=" + (rnk * 50) + "}}"
                + "{{time=" + rnk + " days}}"
            let slink = "!Earthdawn~ charID: " + cID
                + "~ Record: ?{Posting Date|" + today.getFullYear() + "-" + (today.getMonth() +1) + "-" + today.getDate()
                + "}: ?{" + ( state.Earthdawn.gED ? "Throalic Date|" : "Game world Date|" ) + tdate
                + "}: LP: ?{Legend Points to post|" + (Earthdawn.fibonacci( rnk ) * 100)
                + "}: ?{Silver to post|" + (rnk * 50) + "}: Spend: "
                + "?{Time| and " + rnk + " days.}   "
                + "?{Reason|" + name + " Knack Rank " + rnk + "}";
            let ED = new Earthdawn.EDclass();
            ED.chat( stem + "{{button1=[Press here](" + Earthdawn.colonFix( slink ) + ")}}",
                Earthdawn.whoTo.player | Earthdawn.whoTo.playerList | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, null, cID );
      } } }  // end _NAC_Requirements changed
*/
    } // End start with "repeating"
/*
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
    } }   // End of the sa startsWith and sa.endsWith stuff.    Next is the SA case.
*/

    switch( sa ) {
      case "API":     // API or API_max has changed. If they have not changed to "1", set them to "1".
//log( "API is " + attr.get("current") + " / " + attr.get("max") + ( prev ? "   was " + prev["current"] + " / " + prev["max"] : ""));
        if( current !== "1" ) {
//log("Setting API current and max to 1");
          Earthdawn.setWithWorker( attr, "current", "1", "1" );
          Earthdawn.setWithWorker( attr, "max", "1", "1" );
// ping to be removed.
//          Earthdawn.setWW( "SWflag", "Ping,"+ Math.random(), cID );
//          if( state.Earthdawn.logMsg ) log( "API Ping. SWflag set." );
        } break;
      case "APIflag":     // sheetworker has sent us something it wants us to do.
        if( current ) {   // We tend to get two, one with "current" blank when it is created, and a 2nd one with the real value. Only pay attention to the 2nd one.
          Earthdawn.fromSheetworkerToAPI( current, cID, sa );
          Earthdawn.waitToRemove( cID, sa, 15 );
        } break;
      case "Creature-Ambush":       // Ambush and DiveCharge used to hold the amount. Now use Ambushing_max and DivingCharging_max.
      case "Creature-Ambushing":
      case "Creature-DiveCharge":
      case "Creature-DivingCharging":
        if( prev && ( prev[ "max" ] != attr.get( "max" ))) {
          let b = sa.indexOf( "mbush") !== -1,
              w = b ? "Ambush" : "Charge";
          Earthdawn.abilityRemove( cID, w );
          if( Earthdawn.parseInt2( attr.get( "max" ) ))
            Earthdawn.abilityAdd( cID, w,  "!edToken~ ForEach~ marker: " + ( b ? "ambushing" : "divingcharging") + " :t");
        }    // This falls through to below on purpose, because the code above is what to do if _max changed and the code below is what to do if current changed.
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
        edParse.charID = cID;
        let code, op,
        mia = _.filter( Earthdawn.StatusMarkerCollection, function(mio) { return mio[ "attrib" ] == sa; });   // get an array of menu items with this attribute.
        if( mia === undefined || mia.length === 0) {
          log( Earthdawn.timeStamp() + "Earthdawn: On Attribute. Warning. '" + sa + "' not be found in StatusMarkerCollection." );
          break;
        } else if( mia.length === 1 ) {     // If there is only one, use it.
          let sm = mia[ 0 ][ "submenu" ];
          code = mia[ 0 ][ "code" ].trim();
          if( sm === undefined )      // There is no submenu, so just set the marker to match the value.  value 0 unset, value 1 set.
            op = (( current == "0" ) ? "u" : "s");
          else {              // There is a submenu that lists all the valid values.
            let i = sm.indexOf( "[" + current + "^" );
            if ( i != -1)       // There is a [n^a] structure.
              op = sm.charAt( sm.indexOf( "^", i) + 1);
            else          // The sub-menu has no [n^a] structure, so just send the value with a z in front of it.
              op = current;
          }
          if( "a" <= op && op <= "j" )
            op = (op.charCodeAt( 0 ) - 96).toString();
        } else {              // more than one menu item was found. See if any of them have "shared" set
          op = "u";           // If we don't find a shared match, then we unset.
          code = mia[ 0 ][ "code" ];    // Default so that if we don't find an "shared", it will attempt to unset the first one (which will unset them all).
          let curr = current;
          for( let i = 0; i < mia.length; ++i )
            if( mia[ i ][ "shared" ] )
              if( mia[ i ][ "shared" ] == curr ) {
                op = "s";
                code = mia[ i ][ "code" ].trim();
              } else if( Earthdawn.parseInt2( curr, true ))   // parseInt2 - Silent
                if( Earthdawn.safeString( mia[ i ][ "shared" ] ).slice( 0, 3 ).toLowerCase() === "pos" && Earthdawn.parseInt2( curr ) > 0 ) {
                  op = curr;
                  code = mia[ i ][ "code" ].trim();
                } else if( Earthdawn.safeString( mia[ i ][ "shared" ] ).slice( 0, 3 ).toLowerCase() === "neg" && Earthdawn.parseInt2( curr ) < 0) {
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
        let rtype = (state.Earthdawn.defRolltype & (( current === "2" ) ? 0x02 : ((current === "1") ? 0x01 :  0x04))) ? "/w gm" : " ";
        Earthdawn.setWW( "RollType", rtype, cID );
      } // Falls through to Attack Rank below.
      case "Attack-Rank": {
        if( Earthdawn.getAttrBN( cID, "NPC", "1", true) > 0 && Earthdawn.getAttrBN( cID, "Attack-Rank", 0) != 0)     // NPC or Mook and have a generic attack value.
          Earthdawn.abilityAdd( cID, "Attack", "!edToken~ %{selected|Attack}");
        else    // PC
          Earthdawn.abilityRemove( cID, "Attack" );
      } break;
/* functionality moved to sheetworker Oct 23.
      case: "character_name":
      case "charName": {
        let c = findObjs({ _type: "character", _id: cID });
        if (c && c[0])    c[0].set( "name", current);
      } break;
*/
//      case "Durability-Rank":
//        recordWrap( "Durability-Rank" );
//        break;
      case "Hide-Spells-Tab": {     // If we are hiding the spell pages, also remove the spell token actions.
        if( current == "1") {       // Check-box is being turned on
          Earthdawn.abilityRemove( cID, Earthdawn.constant( "Spell" ) + " Grimoire" );
          if (state.Earthdawn.gED)
              Earthdawn.abilityRemove( cID, Earthdawn.constant( "Spell" ) + " Spells" );
        } else {      // Checkbox is being turned off
          Earthdawn.abilityAdd( cID, Earthdawn.constant( "Spell" ) + " Grimoire",  "!edToken~ ChatMenu: Grimoire");
          if (state.Earthdawn.gED)
            Earthdawn.abilityAdd( cID, Earthdawn.constant( "Spell" ) + " Spells",  "!edToken~ ChatMenu: Spells");
        }
      } break;
/*
      case "Karma":
        if ( state.Earthdawn.g1879 || state.Earthdawn.edition != "4" ) {
// obsolete. moved to sheetworkers. 
          let karmaNew = Earthdawn.parseInt2( current ) - Earthdawn.parseInt2( prev["current"] );
          if( karmaNew > 0 ) {
            let ED = new Earthdawn.EDclass();
            let edParse = new ED.ParseObj( ED );
            edParse.charID = cID;
            edParse.funcMisc( [ "", "KarmaBuy", karmaNew ] );
        } }
        break;
*/
      case "Questor": {
        if( current === "None" ) {
          Earthdawn.abilityRemove( cID, "DP-Roll" );
          Earthdawn.abilityRemove( cID, "DP-T" );
        } else {
          Earthdawn.abilityAdd( cID, "DP-Roll", "!edToken~ %{selected|DevotionOnly}" );
          Earthdawn.abilityAdd( cID, "DP-T", "!edToken~ !Earthdawn~ ForEach ~ marker: devpnt :t" );
        }
      } break;
//      case "SKL_TotalS-Speak":  // Earthdawn sheet old
//      case "Speak-Rank":        // 1879 sheet
//      case "LS-Speak-Rank":     // Earthdawn sheet new
//        recordWrap( "Speak" );
//        break;
//      case "SKL_TotalS-ReadWrite":  // Earthdawn sheet old
//      case "ReadWrite-Rank":        // 1879 sheet
//      case "LS-ReadWrite-Rank":     // Earthdawn sheet new
//        recordWrap( "ReadWrite" );
//        break;
      case "SP-WillforceShow": {
        let ED = new Earthdawn.EDclass();
        let edParse = new ED.ParseObj( ED );
        edParse.charID = cID;
        edParse.TokenActionToggle("willforce", current === "1" );
      } break;
    } // End switch sa
  } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn.attribute() error caught: " + err ); }
}   // End Attribute()



    // Code = SP, SPM, WPN, etc.
    // rowID may EATHER be a rowID, or it may be a whole repeating section attribute name, in which case this routine will extract just the rowID needed.
    // due to a roll20 bug, there are some things that require the code to be lowercase instead of the standard upper. when lowercase is true instead of undefined, that happens.
    // Note: keep this in sync with codeToName. 
Earthdawn.buildPre = function ( code2, rowID, lowercase ) {
  'use strict';
  try {
    let ret,
        code = Earthdawn.safeString( code2 );
    if( !rowID )
      rowID = code;
    if( code.startsWith( "repeating_" ))
      code = Earthdawn.repeatSection( 3, code );
    if( rowID.startsWith( "repeating_" ))
      rowID = Earthdawn.repeatSection( 2, rowID );
    code = Earthdawn.safeString( code ).toUpperCase();
    switch ( code ) {
      case "ARM": ret = "repeating_armor_"        + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "BL":  ret = "repeating_blood_"        + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "DSP": ret = "repeating_discipline_"   + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "I":         // Obsolete
      case "INV": ret = "repeating_inventory_"    + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "MAN": ret = "repeating_maneuvers_"    + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "MNT": ret = "repeating_mount_"        + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "MSG": ret = "repeating_message_"      + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;  // Does not have RowID
      case "MSK": ret = "repeating_masks_"        + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "NAC": ret = "repeating_knacks_"       + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "PER": ret = "repeating_personality"   + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;  // Does not have RowID
      case "SKC": ret = "repeating_skills_"       + rowID + "_" + ( lowercase ? "sk" : "SK" ) + "_";          break;  // Obsolete. v2.0 and greater skill artistic charisma code uses all attributes of skill artistic.
      case "SK":  ret = "repeating_skills_"       + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "SKK": ret = "repeating_skillk_"       + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;  // Obsolete
      case "SKAC":        // Obsolete. V lower than 2.0: skill artistic charisma code uses all attributes of skill artistic.
      case "SKA": ret = "repeating_skilla_"       + rowID + "_SKA_";  break;      // Obsolete
      case "SKL": ret = "repeating_skilll_"       + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "SPM": ret = "repeating_matrix_"       + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "SP":  ret = "repeating_spell_"        + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "SPP": ret = "repeating_spellpreset_"  + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "T":   ret = "repeating_talents_"      + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "TI":  ret = "repeating_threads_"      + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "TR":  ret = "repeating_transaction_"  + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      case "WPN": ret = "repeating_weapons_"      + rowID + "_" + ( lowercase ? code.toLowerCase() : code ) + "_";  break;
      default: log( Earthdawn.timeStamp() + "API Earthdawn:buildPre() error. Unknown code: " + code + "   RowID: " + rowID );
    }
    return ret;
  } catch(err) { log( Earthdawn.timeStamp() + "API Earthdawn:buildPre() error caught: " + err ); }
};  // end buildPre



// Central test for codes that have no RowID.
// Note that PER and MSG actually have no RowID. TI and MSK actually do, but there is no reason for them to, so unless strict is true we return true for them as well.
Earthdawn.testNoRowID = function ( code, strict ) {
  'use strict';
   return ( code === "PER" || code === "MSG" || code === "TR" || ( !strict && code === "MSK" ))     // These don't have a RowID.
};  // end testNoRowID. 



    // Code = SP, SPM, WPN, etc. 
    // This is also used to test if a code is valid/recognized. If silent is true then it does not log an error and returns undefined. 
    // Note: keep this in sync with buildPre.
Earthdawn.codeToName = function ( code, silent ) {
  'use strict';
  try {
   switch( code ) {
      case "ARM":   return "Armor";
      case "BL":    return "Blood Magic";
      case "DSP":   return "Discipline";
      case "I":         // Obsolete. 
      case "INV":   return "Inventory";
      case "MAN":   return "Maneuver";
      case "MNT":   return "Mount";
      case "MSG":   return "Message";       // unused as name. 
      case "MSK":   return "Mask";          // unused as name.
      case "NAC":   return "Knack";
      case "Per":   return "Personality";   // unused as name.
      case "SKC":       // Obsolete. 
      case "SKK":       // Obsolete.
      case "SKAC":      // Obsolete.
      case "SKA":       // Obsolete.
      case "SKL":       // Obsolete.
      case "SK":    return "Skill";
      case "SP":    return "Spell";
      case "SPM":   return "Matrix";
      case "T":     return "Talent";
      case "TI":    return "Thread Item";
      case "TR":    return "Transaction";
      case "WPN":   return "Weapon";
      default: if( !silent ) log( Earthdawn.timeStamp() + "Earthdawn:codeToName() error. Unknown code: " + code );
    }
  } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn:codeToName() error caught: " + err ); }
};  // end codeToName



      // Chat buttons don't like colons.   Change them to something else. They will be changed back later.
Earthdawn.colonFix = function ( txt ) {
  'use strict';
  return Earthdawn.safeString( txt ).replace( /:/g, Earthdawn.constant( "colonAlt" ));
}; // end colonFix()

      // There are some very rare cases where we want a command line inside a quoted string (abilityRebuild).   Change them to something else so the parser will ignore them.
Earthdawn.tildiFix      = function ( txt ) { 'use strict'; return Earthdawn.safeString( txt ).replace( /~/g, Earthdawn.constant( "tildiAlt" )).replace( /:/g, Earthdawn.constant( "colonAlt2" )).replace( /\|/g, Earthdawn.constant( "pipeAlt" )).replace( /\{/g, Earthdawn.constant( "braceOpenAlt" )).replace( /\}/g, Earthdawn.constant( "braceCloseAlt" )); };
Earthdawn.tildiRestore  = function ( txt ) { 'use strict'; return Earthdawn.safeString( txt ).replace( new RegExp( Earthdawn.constant( "tildiAlt" ), "g" ), "~" ).replace( new RegExp( Earthdawn.constant( "colonAlt2" ), "g" ), ":" ).replace( new RegExp( Earthdawn.constant( "pipeAlt" ), "g" ), "\|" ).replace( new RegExp( Earthdawn.constant( "braceOpenAlt" ), "g" ), "\{" ).replace( new RegExp( Earthdawn.constant( "braceCloseAlt" ), "g" ), "\}" ); };


Earthdawn.constant = function( what, nestingLevel ) {   // NestingLevel puts one extra "amp;" in the code for every nestingLevel above 1.
  'use strict';
  try {
    let c, s;
    switch ( Earthdawn.safeString( what.toLowerCase() )) {    // For this upper half, we want to return html codes.
          // These will eventually be converted to the real symbols later, but not until after they get  past some chat command steps.
      case "percent":       s = '#37';    break;    // % = 0x25
      case "parenopen":     s = '#40';    break;    // ( = 0x28
      case "parenclose":    s = '#41';    break;    // ) = 0x29
      case "comma":         s = '#44';    break;    // , = 0x2C
      case "at":            s = '#64';    break;    // @ = 0x40
      case "braceopen":     s = '#123';   break;    // { = 0x7B     See also Alt's below
      case "pipe":          s = '#124';   break;    // | = 0x7C     See also Alt's below
      case "braceclose":    s = '#125';   break;    // } = 0x7D     See also Alt's below
              // For this lower half, we want to return an actual character, which is part of the extended UTF-8 set,
              // and which roll20 one-click install library seems to corrupt if we use the code, so we can't store it as a literal.
      case "t":
      case "talent":        c = 0x0131;   break;    // small i dot-less: &# 305;
      case "nac":
      case "knack":         c = 0x0136;   break;    // K with cedilla:  &# 311;
      case "sk":    case "ska":     case "skk":     case "skl":
      case "skill":         c = 0x015E;   break;    // S with cedilla:  &# 351;
      case "wpn":
      case "weapon":        c = 0x2694;   break;    // Crossed swords:  &# 9876;
      case "sp":    case "spm":
      case "spell":         c = 0x26A1;   break;    // Lightning Bolt or High Voltage: &# 9889;
      case "target":        c = 0x27b4;   break;    // Black-feathered South East Arrow
      case "power":         c = 0x23FB;   break;    // Power symbol
              // Here we have alternates for some strings we can't have interpreted too soon. So change them so roll20 does not recognize it wants to interpret them.
      case "commaalt":      c = 0x00F1;   break;    // Comma replacement character.  Character name LATIN SMALL LETTER N WITH TILDE
      case "colonalt":      c = 0x00F2;   break;    // Colon replacement character.  Buttons don't like colons, so anytime we want one in a button, replace it for a while with this.     Latin Small Letter O with Grave
      case "tildialt":      c = 0x00F3;   break;    // Tildi replacement character.  To get the parser to ignore tildis for a while, replace it for a while with this.     Latin Small Letter O with Acute
      case "colonalt2":     c = 0x00F4;   break;    // Colon replacement character alternate. Used in conjunction with tildiFix.     LATIN SMALL LETTER O WITH CIRCUMFLEX
      case "pipealt":       c = 0x00F5;   break;    // | Latin Small Letter O with Tilde
      case "braceopenalt":  c = 0x014D;   break;    // { Latin Small Letter O with Macron
      case "braceclosealt": c = 0x014F;   break;    // } Latin Small Letter O with Breve
          // Note: Unicode 0277 ( ɷ Latin Small Letter Closed Omega) is used by sheet-worker as a Marker to Trigger Autofill. Not used by API. 

      case undefined:   return "";          // undefined is a legal value that returns an empty string.
      default:
        log( Earthdawn.timeStamp() + "Earthdawn.constant: Illegal argument '" + what + "'." );
        return;
    }
    let r;
    if( c )
      r = String.fromCharCode( c );
    else {
      r = "&";
      if( nestingLevel )    // level 0 (unsupported by this routine) is |. level 1 (default) is &#124; level 2 is &amp;#124;  Level 3 is &amp;amp;#124;   Etc. One more amp; for each level.
        for( let i = nestingLevel; i > 1; --i )
          r += "amp;";
      r += s + ";";
    }
    return r;
  } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn:constant( " + what + " ) error caught: " + err ); }
} // end constant()


    // At present this is just for spells, but can be expanded if needed.
    // mode could be "short", "name", or "weaving"
Earthdawn.dispToName = function ( disp, mode ) {
  'use strict';
  try {
    if( !["short","name","weaving"].includes(mode)) { log( Earthdawn.timeStamp() + "Earthdawn:dispToName() unknown mode: " + mode ); return; }
    let t;
    switch( disp ) {
      case "Elementalism":
      case "Elementalist":
      case  "5.3":  t={"short":  "El"  , "name" :  "Elementalist", "weaving" :  "Elementalism"  };  break;
      case "Illusionist":
      case "Illusionism":
      case  "6.3":  t={"short":  "Il"  , "name" :  "Illusionist", "weaving" :  "Illusionism"   };  break;
      case "Nethermancy":
      case "Nethemancer":
      case  "7.3":  t={"short":  "Ne"  , "name" :  "Nethermancer", "weaving" :  "Nethermancy"   }; break;
      case "Wizard":
      case "Wizardry":
      case "16.3":  t={"short":  "Wz"  , "name" :  "Wizard", "weaving" :  "Wizardry"      };  break;
      case "Shaman":
      case "Shamanism":
      case "22.3":  t={"short":  "Sh"  , "name" :  "Shaman", "weaving" :  "Shamanism"     };  break;
      case "Other":
      case "Other Weaving":
      case   "81":  t={"short":  "Oth" , "name" :  "Other", "weaving" :  "Other Weaving"         };  break;
      case "Power":
      case "Spell Weaving":
      default:      t={"short":  "Pwr" , "name" :  "Power" , "weaving" :  "Spell Weaving"};
    }
    return t[ mode ];
  } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn:dispToName() error caught: " + err ); }
};  // end dispToName



Earthdawn.encode = (function(){
  'use strict';
  try {
    let esRE = function ( s ) {
      let escapeForRegexp = /(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g;
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
  } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn:encode() error caught: " + err ); }
  }()); // end encode()



      // Log a programming error. If command line logging of every command is turned off, log the command line as well.
Earthdawn.errorLog = function( msg, context ) {
  'use strict';
  try {
    if( !context )
      log( Earthdawn.timeStamp() + "Earthdawn.errorLog did not have context.");
    else if( !state.Earthdawn.logCommandline ) {    // If have not already logged the command line, do so.
      let m;
      if( "edClass" in context && "msg" in context.edClass )       // This is a parseObj
        m = context.edClass.msg;
      else if ( "msg" in context )     // This is an edClass object.
        m = context.msg;
      else
        log( Earthdawn.timeStamp + "Earthdawn.errorLog invalid context." );

      if( m )
        log( m );     // log command line
    }
    log( Earthdawn.timeStamp() + msg);
  } catch(err) { log( "Earthdawn:Errorlog( " + msg + " ) error caught: " + err ); }
} // end ErrorLog()



Earthdawn.fibonacci = function(num, memo) {
  'use strict';
  try {
    memo = memo || {};
    if (memo[ num ])
      return memo[ num ];
    if( num <= 1 )
      return 1;
    return memo[ num ] = Earthdawn.fibonacci( num - 1, memo ) + Earthdawn.fibonacci( num - 2, memo);
  } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn:fibonacci() error caught: " + err ); }
};  // end fibonacci



    // Look for an object. If you can't find one, make one and return that.
Earthdawn.findOrMakeObj = function ( attrs, deflt, maxDeflt ) {
  'use strict';
  try {
//log(attrs);
    let obj,
        objs = findObjs( attrs );
    if( objs ) {
      if( objs.length > 1 ) {
        log( Earthdawn.timeStamp() + "Error Earthdawn:findOrMakeObj() found multiple objects: " );
        log( objs );
        let keep = 0, maxscore = 0;   // pick one to keep and get rid of the rest. 
        for( let i = 0; i < objs.length; ++i ) {
          let score = 0;
          function scoreit( a, dflt ) {
          'use strict';
            if( a !== undefined && a !== null ) {
              if( typeof a != "string" ) ++score;   // Gain points for not being string, and not being equal to default, and not evaluating to false, on the assumption that something tried to change it to those. Note that these criteria are rather arbitrary, but wanted to make decision based on something other than first or last.
              if( dflt !== undefined && a != dflt ) ++score;
              if( a ) ++score;
          } }
          scoreit( objs[ i ].get( "current" ), deflt );
          scoreit( objs[ i ].get( "max" ), maxDeflt );
          if( score > maxscore ) {
            keep = i;
            maxscore = score;
        } }
        let txt = "";
        for( let i = objs.length -1; i > -1; --i )
          if( i !== keep ) {
            txt += " attr[ " + i + " ],";
            objs[ i ].remove();
          }
        obj = objs[ keep ];
        log( "removing" + txt.slice( 0, -1) + " and keeping attr[ " + keep + "]." );
      } // end found more than one.
      else if( objs.length > 0 )
        obj = objs[ 0 ];
    } // end found one.
    if( obj === undefined && "_type" in attrs ) {   // we did not find any, create one.
      let type = attrs[ "_type" ];
      delete attrs[ "_type" ];
      obj = createObj( type, attrs);
      if( obj && deflt !== undefined && deflt !== null )
        Earthdawn.setWithWorker( obj, "current", deflt );
      if( obj && maxDeflt !== undefined && maxDeflt !== null )
        Earthdawn.setWithWorker( obj, "max", maxDeflt );
    }
    return obj;
  } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn:findOrMakeObj() error caught: " + err ); }
}; // end findOrMakeObj()



      // The sheetworker has sent us a message, ether in APIflag or repeating_message
Earthdawn.fromSheetworkerToAPI = function ( msg, cID, wherefrom ) {
  'use strict';
  try {
    msg = Earthdawn.safeString( msg ).trim();
    if( state.Earthdawn.logMsg ) log("toAPI ( " + wherefrom + " ): " + msg);
    let ED = new Earthdawn.EDclass(),
        cmdArray = msg.split( "\n" );
    Earthdawn.pseudoMsg( ED, msg );
    for( let ind = 0; ind < cmdArray.length; ++ind ) {
      let cmdLine = Earthdawn.safeString( cmdArray[ ind ] ),
          comma = cmdLine.indexOf( "," ),
          dataLine = cmdLine.slice(comma +1).trim();
      switch ( cmdLine.slice( 0, comma).trim() ) {
        case "abilityAdd": {    // abilityAdd, (name)\r (text)\r optional symbol code.
          Earthdawn.abilityAdd( cID, Earthdawn.constant( Earthdawn.getParam( dataLine, 3, "\r" ))
              + Earthdawn.getParam( dataLine, 1, "\r" ), Earthdawn.getParam( dataLine, 2, "\r" ));
        } break;
        case "abilityRemove": {   // abilityRemove, name of ability, optional symbol code.    Remove this ability.
          Earthdawn.abilityRemove( cID, Earthdawn.constant( Earthdawn.getParam( dataLine, 2, "," )) + Earthdawn.getParam( dataLine, 1, "," ));
        } break;
        case "ChatRecord": {    // ChatRecord, SP: 0: (sp price): Spend: Buy a broadsword
log("ChatRecord Obsolete. If you see this, let the API developer know."); // Oct 23.   Except 1879 karma buy still needs to be converted, so that still uses this. 
          let tdate = Earthdawn.getAttrBN( cID, "record-date-throalic", "" ),     // First look on the current character sheet
              today = new Date(),
              lp, silver;
              if(Earthdawn.getParam( dataLine, 2, ":" ) !== "0") lp = Earthdawn.getParam( dataLine, 2, ":" );
              if(Earthdawn.getParam( dataLine, 3, ":" ) !== "0") silver = Earthdawn.getParam( dataLine, 3, ":" );
          if( !tdate ) {
            let party = findObjs({ _type: "character", name: "Party" });
            if( party && party[ 0 ] )     // Look for throalic date on the "Party" sheet.
              tdate = Earthdawn.getAttrBN( party[0].get( "_id" ), "record-date-throalic", "" );
          }
          if( !tdate && state.Earthdawn.gED )
            tdate = "1517-1-1";
          let stem = "&{template:chatrecord} {{header=" + getAttrByName( cID, "character_name" ) + ": " + Earthdawn.getParam( dataLine, 5, ":" ) + "}}"
                    + (tdate ? "{{throalic=" + tdate + "}}" : ""),
              slink = "!Earthdawn~ charID: " + cID
                    + "~ Record: ?{Posting Date|" + today.getFullYear() + "-" + (today.getMonth() +1) + "-" + today.getDate() + "}"       // ssa[ 1] Real Date
                    + ": ?{" + ( state.Earthdawn.gED ? "Throalic Date|" : "Game world Date|" ) + tdate + "}: ";         // ssa[ 2] Throalic Date
          if ( lp || silver ) {
            if( lp )
              stem += "{{lp=" + lp + "}}";
            if ( silver )
              stem += "{{sp=" + silver + "}}";
            slink += lp ? (silver ? "LPSP: " : "LP: ") : "SP: ";    // ssa[ 3] Item: SPLP, SP, LP, Dev, or Other
            slink += (lp     ? "?{" + (state.Earthdawn.g1879 ? "Action" : "Legend") + " Points to post|" + lp + "}" : "0") + ": ";        // ssa[ 4] Amount LP
            slink += (silver ? "?{" + (state.Earthdawn.g1879 ? "Money" : "Silver Pieces") + " to post|" + silver + "}" : "0") + ": ";     // ssa[ 5] Amount SP
            slink += Earthdawn.getParam( dataLine, 4, ":" ) + ": ";          // ssa[ 6] Type: Gain, Spend, Decrease (ungain), or Refund (unspend).
            slink += "?{Reason|" + Earthdawn.getParam( dataLine, 5, ":" ) + "}";          // ssa[ 7] Reason - Text.
          }
          let ED = new Earthdawn.EDclass();
          ED.chat( stem +  "{{button1=[Press here](" + Earthdawn.colonFix( slink ) + ")}}", Earthdawn.whoTo.player | Earthdawn.whoTo.playerList | Earthdawn.whoFrom.noArchive, null, cID );
        } break;
        case "LinkAdd1": {      //APIflag LinkAdd1,code:RowId:code:name
          let edParse = new ED.ParseObj( ED );
          edParse.charID = cID;
          let dataArray = dataLine.split(":");
          if( dataArray.length !== 4 ) {
            log( Earthdawn.timeStamp() + "Earthdawn - APIFlag call incorrectly formatted for LinkAdd1 : " + dataLine);
            return;
          }
  // See if this works.
          edParse.ChatMenu( [ "ChatMenu","linkadd1", dataArray[ 0 ].trim(), dataArray[ 1 ].trim(), dataArray[ 2 ].trim(), dataArray[ 3 ].trim()] );
        } break;
        case "LinkAdd2": {      //APIflag LinkAdd2,code:RowId:code:RowId
          let edParse = new ED.ParseObj( ED );
          edParse.charID = cID;
          let dataArray = dataLine.split(":");
          if( dataArray.length !== 4 ) {
            log(Earthdawn.timeStamp() + "Earthdawn - APIFlag call incorrectly formatted for LinkAdd2 : " + dataLine);
            return;
          }
  // See if this works.
          edParse.ChatMenu( [ "ChatMenu","linkadd2", dataArray[ 0 ].trim(), dataArray[ 1 ].trim(), dataArray[ 2 ].trim(), dataArray[ 3 ].trim()] );
        } break;
        case "RemoveAttr": {    // RemoveAttr, (fully qualified attribute name).    Remove this attribute.
          let attrib = findObjs({ _type: "attribute", _characterid: cID,  name: (dataLine.endsWith( "_max" ) ? dataLine.slice( 0, -4) : dataLine) });
          _.each( attrib, function (att) {
            att.remove();
          });
        } break;
        case "RemoveRow": {   // RemoveRow, (code), (rowID)     // remove everything with this rowID.
          let pre = Earthdawn.buildPre( Earthdawn.getParam( dataLine, 1, ","), Earthdawn.getParam( dataLine, 2, ",")).toLowerCase(),
            attrib = findObjs({ _type: "attribute", _characterid: cID });
          _.each( attrib, function (att) {
            if ( Earthdawn.safeString( att.get("name") ).toLowerCase().startsWith( pre ))
            att.remove();

          });
        } break;
        case "SheetUpdate": {
          let brandNew = (Earthdawn.getParam( dataLine, 1, ",") == 0);
          function shouldUpdate( ver ) {      // "SheetUpdate," + origSheetVersion.toString() + "," + newSheetVersion.toString()
            return (parseFloat( Earthdawn.getParam( dataLine, 1, ",")) < ver && ver <= parseFloat( Earthdawn.getParam( dataLine, 2, ",")));
          };
          let game = Earthdawn.getParam( dataLine, 3, ",");
          state.Earthdawn.sheetVersion = parseFloat( Earthdawn.getParam( dataLine, 2, ","));    // This is the version number of the html file, Earthdawn.Version is the version number of this API file.

          if( shouldUpdate( 1.001 ))
            ED.updateVersion1p001( cID );
          if( shouldUpdate( 1.0021 ))
            ED.updateVersion1p0021( cID );
          if( shouldUpdate( 1.0022 ))
            ED.updateVersion1p0022( cID );
          if( shouldUpdate( 1.0023 ))
            ED.updateVersion1p0023( cID, ED );
          if( shouldUpdate( 2.0000 ))
            ED.updateVersion2p001( cID, ED );
          if( shouldUpdate( 3.0000 ))
            ED.updateVersion3p000( cID, ED );

          if( brandNew ) {      // if this is a brand new sheet, try automatically linking the token. 
            function tryLink( count ) {
              let edParse = new ED.ParseObj( ED );
              edParse.charID = cID;
              if( edParse.TokenFind() && ("tokenInfo" in edParse) && ("tokenObj" in edParse.tokenInfo)) {
                let tID = edParse.tokenInfo.tokenObj.get( "_id" );
                if( tID ) {
                  Earthdawn.pseudoMsg( ED, "dummy", tID );    // fake a msg with this token selected.
                  edParse.LinkToken( [] );
                }
              } else if( count < 20 ) {       // Test every 3 seconds for 60 seconds.
                setTimeout(function() {       // Delay for 20 seconds, and then try linking. 
                  try {
                    tryLink( ++count );
                  } catch(err) {Earthdawn.errorLog( "ED.sheetUpdate setTimeout() error caught: " + err, ED );}
                }, 3000);
              } else {
                Earthdawn.errorLog( "ED.sheetupdate could not link. Token ID not found.", ED );
                log( edParse.tokenInfo );
            } } // end of tryLink.
            tryLink( 0 );   // Kick off the first try. 
          } // end brandNew character. 
        } break;
        case "WipeMatrix": {
          let edParse = new ED.ParseObj( ED );
          edParse.charID = cID;
//          edParse.Spell( [ "Spell", dataLine, "WipeMatrix", "M"] );
          edParse.TuneMatrix( [ "TuneMatrix", "WipeMatrix"] );
        } break;
        default:
          log( Earthdawn.timeStamp() + "Unknown command in APIflag: " + cmdLine);
      } // end switch cmdLine
    } // end for cmdArray
  } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn:fromSheetworkerToAPI() error caught: " + err ); }
}; // End fromSheetworkerToAPI()



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
    // So in cases where the API knows what the true default value is or that we want, use this routine. In cases where the lookup name is
    // variable and you don't know what the default value should be, then using getAttryByName is just as good and if they fix the bug, better.
Earthdawn.getAttrBN = function ( cID, nm, dflt, toInt ) {
  'use strict';
  try {
    let ret,
        best = 0;
    if( !cID ) {
      log( Earthdawn.timeStamp() + "Invalid character_id '" + cID + "' for getAttrBN()   name: " + nm + "   default: " + dflt)
      ret = dflt;
    } else if( !nm ) {
      log( Earthdawn.timeStamp() + "Invalid attribute '" + nm + "' for getAttrBN().   dflt: '" + dflt + "'    cID: " + cID )
      ret = dflt;
    } else {
      if( nm === "character_name" )     // due to character_name being a special case that is not a true attribute, we need special handling.
        ret = getAttrByName( cID, "character_name" );
      else if( dflt === undefined && !nm.startsWith( "repeating_" ))    // If we are not passed a dflt and it is not a repeating section anyway, go ahead and try the getAttrByName just to see if it works better.
        ret = getAttrByName( cID, nm );

      nm = Earthdawn.safeString( nm );
      if( ret === undefined ) {     // We want to do this if any of the above returned a ret of undefined.
        let mx = nm.endsWith( "_max" );
        let attribBN = findObjs({ _type: "attribute", _characterid: cID,  name: (mx ? nm.slice( 0, -4) : nm) });
        if( attribBN && attribBN.length > 1 ) {
          log( Earthdawn.timeStamp() + "Warning Earthdawn:getAttrBN( " + cID + ", " + nm + ( dflt === undefined ? "": ", " + dflt )
                + ( toInt === undefined ? "": ", " + toInt ) + " )  returned " + attribBN.length + " attributes! Attributes are: " );
          log( JSON.stringify( attribBN ));
          for( let i = 0; i < attribBN.length; ++i )
            if( attribBN[ i ].get( mx ? "max" : "current") != dflt )
              best = i;     // In the weird case of having duplicate entries, we want to use one that is not the default.
          ret = ((attribBN === undefined) || (attribBN.length == 0)) ? dflt : attribBN[ best ].get( mx ? "max" : "current");
          for( let i = attribBN.length - 1; i > -1; --i )
            if( i !== best ) {
              log( "getAttrBN removing " + JSON.stringify( attribBN[ i ]));
              attribBN[ i ].remove();      // If we found more than one attribute of this name, get rid of the extras!
            }
        } else
          ret = ((attribBN === undefined) || (attribBN.length == 0)) ? dflt : attribBN[ best ].get( mx ? "max" : "current");
    } }
    return toInt ? Earthdawn.parseInt2( ret ) : ret;
  } catch(err) {
    log( Earthdawn.timeStamp() + "Earthdawn:getAttrBN() error caught: " + err );
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
      log( Earthdawn.timeStamp() + "Error getParam argument not string." );
      log( str );      log( num);      log( delim);
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
  } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn:getParam() error caught: " + err ); }
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
    smc.push({ code: "karmaauto", prompt: "Karma Auto",  attrib: "KarmaGlobalMode", shared: "x", icon: "lightning-helix", customIcon: "001-Karma-On",  customTag: "" });
    smc.push({ code: "karmaask", prompt: "Karma Ask",  attrib: "KarmaGlobalMode", shared: "?", icon: "drink-me", customIcon: "002-Karma-Ask", customTag: "" });
    if( state.Earthdawn.gED ) {
      smc.push({ code: "devpntauto", prompt: "DP Auto", attrib: "DPGlobalMode", shared: "x", icon: "angel-outfit", customIcon: "003-Devotion-On",  customTag: "" });
      smc.push({ code: "devpntask",  prompt: "DP Ask", attrib: "DPGlobalMode", shared: "?", icon: "broken-heart", customIcon: "004-Devotion-Ask", customTag: "" });
    }
    smc.push({ code: "healthunconscious", prompt: "Unconscious", attrib: "condition-Health", shared: "5", icon: "pummeled", customIcon: "005-Unconscious", customTag: "" });
    smc.push({ code: "healthdead", prompt: "Dead", attrib: "condition-Health", shared: "-5", icon: "dead", customIcon: "006-Dead", customTag: "" });
    smc.push({ code: "strain", prompt: "Strain per round", icon: "grenade", attrib: "Misc-StrainPerTurn", customIcon: "007-Strain", customTag: "",
            submenu: "?{Strain per round|0,[0^u]|1,[1^a]|2,[2^b]|3,[3^c]|Increase,++|Decrease,--}"});
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
    for( let j = 0; j < smc.length; j++) { 
      let sm = smc[ j ];
      if( "customIcon" in sm)
        for( let i = 0;  i < customcollection.length; i++)
          if( Earthdawn.safeString( sm.customIcon ).toLowerCase() === Earthdawn.safeString( customcollection[ i ].name ).toLowerCase()) {
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
  } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn.getStatusMarkerCollection() error caught: " + err ); }
} // End ParseObj.getStatusMarkerCollection()



Earthdawn.isString = function ( str ) {  return (str != null && typeof str.valueOf() === "string") ? true : false }



Earthdawn.matchString = function( str ) {   // return this string with everything that is not a /W stripped out, and lower cased. Used to test for matches.
  return Earthdawn.safeString( str ).replace( /\W/g, "").toLowerCase();
}



Earthdawn.newBody = function ( sectnew ) {
  let bodynew = sectnew.append( ".body", "", {
    class:"sheet-rolltemplate-body"
  });
  bodynew.setCss({
    odd: { "background": "white" },
    even: { "background": "rgba(128, 128, 128, 0.15)" }
  });
  return bodynew;
/* Pre darkmode. 
  body.setCss({
    odd: { "background": "white" },
    even: { "background": "#E9E9E9" }
  });

   This one is from spell, we might need it. 
        body = sect.append( ".body", "", {
          style: {
            "text-align":   "center",
            "padding" : "3px"
          }});
        body.setCss({
          odd:  { "background": "#FFFFFF" },
          even: { "background": "#E9E9E9" }
        });
*/
};

Earthdawn.newSect = function ( size ) {
  return new HtmlBuilder( "", "", {
    class: ( size && size.toLowerCase().startsWith( "s" )) ? "sheet-rolltemplate-sectSmall" : "sheet-rolltemplate-sect"
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
  } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn.makeButton error caught: " + err ); }
} // end makeButton()



    // This function "protects" against NaN parseInts (when input is not a number) by default to 0 instead of NaN
Earthdawn.parseInt2 = function ( i, silent ) {
/*
          // For quick debugging, uncomment this, which will throw an error to the calling routine.
    if(( i === undefined ) || ( i === null ) || (i === "" )) return 0;      // if it is an empty string, just quietly return a zero.
    let x = parseInt( i );
    if( isNaN( x )) {
      if( !silent )
        log( Earthdawn.timeStamp() + "Earthdawn, parseInt2 was passed not a number " + i );
      throw new Error('Parameter is not a number! ' + i);}
    } else
      return x || 0;
*/
  try {
    if(( i === undefined ) || ( i === null ) || (i === "" ) || (i === false)) return 0;      // if it is an empty string, just quietly return a zero.
    else if( i === true ) return 1;
    let x = parseInt( i );
    if( isNaN( x )) {
      if( !silent )
        log( Earthdawn.timeStamp() + "Earthdawn, parseInt2 was passed not a number " + i );
      return 0;
    } else
      return x || 0;
  } catch(err) {
    log( Earthdawn.timeStamp() + "Earthdawn.parseInt2() error caught: " + err );
    return 0;
  }
} //end parseInt2


      // pseudoMsg
      // We don't seem to have a valid .msg (because we are running from (on ready) or APIflag, but we need one.
      // So fake one.
Earthdawn.pseudoMsg = function( pclass, msg, sel ) {    // msg is the text of the message. sel is a tokenID that should be selected. 
  'use strict';
  try {
    if( pclass.msg === undefined ) {    // fake up a playerID.
        pclass.msg = {};
        pclass.msg.content = msg ? msg : "";
        pclass.msg.type = "api";
    }
    if( !pclass.msg.playerid ) {
      let players = findObjs({ _type: "player", _online: true });   // lets just find the first gm that is online.
      let found = _.find( players, function( plyr ) { return playerIsGM( plyr.get( "_id" ))});
      if( !found ) {
        players = findObjs({ _type: "player" });        // There are no GMs online, so lets just find a GM that is offline.
        found = _.find( players, function( plyr ) { return playerIsGM( plyr.get( "_id" ))});
        if( !found && players && players.length > 0 )
          found = players[ 0 ];
      }
      if( found )
        pclass.msg.playerid = found.get( "_id" );
        pclass.msg.who = found.get( "_displayname" );
    }
    if( sel && !pclass.msg.selected ) 
      pclass.msg.selected = [{ _id: sel, _type: "graphic" }];
  } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn.pseudoMsg error caught: " + err ); }
} // End Earthdawn.pseudoMsg()



    // This routine returns just one section of a repeating section name.
    // section: 0 = repeating. 1 = talents, knacks, weapons, etc. 2 = rowID, 3 = code (SP, WPN, etc.), 4 is the attribute name.
    // Note that this assumes that the attribute name does NOT contain an underscore, but allows for the rowID to contain one.
Earthdawn.repeatSection = function ( section, str ) {
  'use strict';
  try {
    if( !section ) {
      log( Earthdawn.timeStamp() + "Earthdawn:repeatSection() error, invalid section: " + section + " str : " + str );
      return;
    }
    if( !str ) {
      log( Earthdawn.timeStamp() + "Earthdawn:repeatSection() error, invalid str: " + str + " section : " + section );
      return;
    }
    let x = str.split("_");
    if( x[ x.length -1 ] === "max" ) {    // If we have a 5th section, get rid of it and add "_max" to the 4th section. 
      x.pop();
      x[ x.length -1] += "_max";
    }
    if( section < 2 )     // talents (etc). 
      return x[ section ];
    else if (section == 3 ) {     // Code
      let z1 = Earthdawn.safeArray( x );
      if( z1.length > 2 )
        return Earthdawn.safeString( z1[ z1.length -2 ] ).toUpperCase();
      else return;
    }
    else if (section == 4 )   // This is the attribute name.
      return x[ x.length -1 ];
    else {      // There is a possibility that the RowID might contain an underscore. So this is if they want section 2. Get rid of sections 0, 1, 3, and 4. Return whatever is left. 
      x.pop();
      x.pop();
      x.shift();
      x.shift();
      return x.join("_");
    }
  } catch(err) {
    log( Earthdawn.timeStamp() + "Earthdawn:repeatSection() error caught: " + err );
  }
};  // end repeatSection





        // Make sure the returned value is safely an object, and can be used with .length().
        // If it is not already an object, return an array
Earthdawn.safeArray = function( arr )  {
  'use strict';
  try {
    let r;
    switch( typeof arr ) {
      case "object":    r = arr;
        break;
      case "string":
      case "number":
      case "bolean":    r = [ arr ];
        break;
      default:    r = [];
    }
    return r;
  } catch(err) {
    log( Earthdawn.timeStamp() + "Earthdawn:safeString() error caught: " + err );
  }
};  // end safeArray



        // Make sure the returned value is safely a string, and can be used with .toUpperCase() or .replace(), Etc.
        // If it is not already a string and can't be converted to a string, return an empty string.
Earthdawn.safeString = function( str )  {
  'use strict';
  try {
    return (( typeof str === "string" ) ? str: ( typeof str === "number" ) ? str.toString() : "" );
  } catch(err) {
    log( Earthdawn.timeStamp() + "Earthdawn:safeString() error caught: " + err );
  }
};  // end safeString



        // This is a wrapper for the attribute .set() function, that checks to make sure val is not undefined.
        // in the basic .set() function, If val is undefined it errors out the entire API, requiring a restart.
        // Worse, the error preempts logging that should have happened and the error message gives you no clue as to where your code erred out.
        // This checks for undefined, writes an error message, and substitutes a default value.
        //
        // Rats. Can't test for NaN here, because use same routine for string and numbers. But NaN fails as well.
Earthdawn.set = function( obj, type, val, dflt )  {     // type is often "current" or "max" for attributes, but could be name, bar3_value, bar3_max, or even status_xxx.
  'use strict';
  try {
// log( "set   " + obj.get("name") + "    val " + val);
    if(( val === undefined && dflt != undefined ) || (val !== val)) {   // val !== val is the only way to test for it equaling NaN. Can't use isNan() because many values are not supposed to be numbers. But we do want to test for val having been set to NaN.
      log( Earthdawn.timeStamp() + "Warning!!! Earthdawn:set()   Attempting to set '" + att + "' to " + val + " setting to '" + dflt + "' instead. Object is ...");
      log( obj );
      obj.set( type, (dflt === undefined) ? "" : dflt );
    } else
      obj.set( type, (val === undefined) ? "" : val );
  } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn:set() error caught: " + err ); }
} // end of set()

Earthdawn.setWithWorker = function( obj, type, val, dflt )  {   // type is "current" or "max"
  'use strict';
  try {
    if( !obj ) {
      log( Earthdawn.timeStamp() + "Earthdawn:setWithWorker() Error: obj is undefined.   Type: " + type + "   val: " + val + "   dflt: " + dflt );
      return;
    }
// log( "setww " + obj.get("name") + "    val " + val);
    if(( val === undefined && dflt != undefined ) || (val !== val)) {   // val !== val is the only way to test for it equaling NaN. Can't use isNan() because many values are not supposed to be numbers. But we do want to test for val having been set to NaN.
      log( Earthdawn.timeStamp() + "Warning!!! Earthdawn:setWithWorker()   Attempting to set '" + att + "' to " + val + " setting to '" + dflt + "' instead. Object is ...");
      log( obj );
      obj.setWithWorker( type, (dflt === undefined) ? "" : dflt );
    } else
      obj.setWithWorker( type, (val === undefined) ? "" : val );
  } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn:setWithWorker() error caught: " + err ); }
} // end of setWithWorker()

      // setWW       helper routine that sets a value into an attribute and nothing else.
      // (Note that there is also a ParseObj version that has access to this.charID, which this version does not)
Earthdawn.setWW = function( attName, val, cID, dflt, maxVal, maxDflt ) {
  'use strict';
  try {
    if( !cID ) {
      log( "Eearthdawn.SetWW() Error, no cID: " + attName + " : " + val );
    } else {
      let aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: cID, name: attName });
      if( val !== undefined )
        Earthdawn.setWithWorker( aobj, "current", val, dflt );
      if( maxVal !== undefined )
        Earthdawn.setWithWorker( aobj, "max", maxVal , maxDeflt );
    }
  } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn.SetWW() error caught: " + err ); }
} // End Earthdawn.SetWW()

Earthdawn.setMaxWW = function( attName, val, cID, dflt ) {
  'use strict';
  try {
    if( !cID ) {
      log( "Eearthdawn.SetWW() Error, no cID: " + attName + " : " + val );
    } else {
      let aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: cID, name: attName });
      Earthdawn.setWithWorker( aobj, "max", val, dflt );
    }
  } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn.SetMaxWW() error caught: " + err ); }
} // End Earthdawn.SetNaxWW()


                  // Look to see if an attribute exists for a certain character sheet. If not - create it with a default attribute.
Earthdawn.SetDefaultAttribute = function( cID, attr, dflt, maxdflt )  {
  'use strict';
  try {
    let aobj = findObjs({ _type: 'attribute', _characterid: cID, name: attr }) [ 0 ];
    if ( aobj === undefined ) {     // If we actually found an existing attribute, then do nothing, as this routine only does defaults.
      aobj = createObj("attribute", { name: attr, characterid: cID });
      if( dflt === null || dflt === undefined )
        dflt = getAttrByName( cID, attr, "current");    // This looks weird, but what it is doing is getting any default defined in the html.
      if( maxdflt === null || maxdflt === undefined )
        maxdflt = getAttrByName( cID, attr, "max");
      if ( dflt != undefined && isNaN( parseInt(aobj.get("current"))) )
        Earthdawn.setWithWorker( aobj, "current", dflt );
      if ( maxdflt != undefined && isNaN( parseInt(aobj.get("max"))) )
        Earthdawn.setWithWorker( aobj, "max", maxdflt );
    }
  } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn:SetDefaultAttribute() error caught: " + err ); }
} // end of SetDefaultAttribute()



    // return a self contained html fragment that has a tooltip.
Earthdawn.texttip = function ( txt, tip ) {
      'use strict';
      try {
    return new HtmlBuilder( "span", txt, {
      style: { "border": "solid 1px yellow" },
//        class: "showtip tipsy",     // removing this gives us black on white long tool tips rather than the white on black tooltips that have a display bug.
      title: Earthdawn.encode( Earthdawn.encode( tip )) })
  } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn:texttip() error caught: " + err ); }
}; // end texttip()



    // return string with timestamp in it.
Earthdawn.timeStamp = function ()  {
  'use strict';
  try {
    let today = new Date();
    return today.getFullYear() + "-" + (today.getMonth() +1) + "-" + today.getDate() + " " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + " (UTC)  ";
  } catch(err) { log( "Earthdawn:timeStamp() error caught: " + err ); }
} // End timeStamp



    // Refresh a token. Set the token markers to match the status, rebuild the abilities, clear any hits or targets, etc.
    // This is done on a token drop, and also to all tokens on a page when the gm moves a player or all players to a page. 
Earthdawn.tokenRefresh = function ( obj ) {     // token object
  'use strict';
  try {
    if( obj && obj.get( "name" )) {   // Ignore any token without a name (probably not a real token. 
//log( "refreshing token " + obj.get("name"));
      let rep = obj.get( "represents" );
      if( rep && rep != "" ) {
        let ch = getObj( "character", rep)
        if( ch ) {
          let ED = new Earthdawn.EDclass();
          let edParse = new ED.ParseObj( ED );
          edParse.charID = rep;
          edParse.tokenInfo = { type: "token", name: obj.name, tokenObj: obj, characterObj: getObj("character", rep ) };
          edParse.abilityRebuild([ "addGraphic" ]);
          edParse.SetStatusToToken();
          edParse.TokenSet( "clear", "TargetList" );
          edParse.TokenSet( "clear", "Hit" );
          edParse.TokenSet( "clear", "SustainedSequence" );
          edParse.toSheet( "SheetUpdate", "" );
    } } }
  } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn:tokenRefresh() error caught: " + err ); }
} // End tokenRefresh



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
  } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn:tokToChar() error caught: " + err ); }
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
        } else if ( findObjs({ _type: "attribute", _characterid: cID,  name: nm }))       // Every second we are going to test to see if we found it. If we do, we wait one additional second before deleting it.
          waitForIt( 0 );
        else    // We nether found the attribute we were waiting for, nor has the timer ran out yet.
          waitForIt( n-1);
      }, 1000); }

    waitForIt( timelimit ? timelimit : 15 );
  } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn:waitToRemove() error caught: " + err ); }
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
    let firstRun;
    if( state.Earthdawn                 === undefined ){
      state.Earthdawn = {};
      firstRun = true;
    }
    if( state.Earthdawn.game            === undefined )   state.Earthdawn.game            = "ED";
    if( state.Earthdawn.gED             === undefined )   state.Earthdawn.gED             = true;
    if( state.Earthdawn.g1879           === undefined )   state.Earthdawn.g1879           = false;
    if( state.Earthdawn.edition         === undefined )   state.Earthdawn.edition         = 4;
//    if( state.Earthdawn.effectIsAction  === undefined )   state.Earthdawn.effectIsAction  = false;
//    if( state.Earthdawn.karmaRitual     === undefined )   state.Earthdawn.karmaRitual     = "-1";
    if( state.Earthdawn.logCommandline  === undefined )   state.Earthdawn.logCommandline  = false;
    if( state.Earthdawn.logStartup      === undefined )   state.Earthdawn.logStartup      = true;
    if( state.Earthdawn.logMsg          === undefined )   state.Earthdawn.logMsg          = false;
    if( state.Earthdawn.defRolltype     === undefined )   state.Earthdawn.defRolltype     = 0x03;     // Bitfield set for who is GM only. NPC and Mook gm only, PC public;
    if( state.Earthdawn.style           === undefined )   state.Earthdawn.style           = Earthdawn.style.VagueRoll;
    if( state.Earthdawn.showDice        === undefined )   state.Earthdawn.showDice        = true;
          // Everything works best if API and Sheet version are compatible, but some effort is made to let them limp along on different versions.
    if( state.Earthdawn.version         === undefined )   state.Earthdawn.version         = Earthdawn.Version;      // Note: This is the API (this file) version. Earthdawn.Version is hardcoded constant. state.Earthdawn.version is record of last version run with.
    if( state.Earthdawn.sheetVersion    === undefined )   state.Earthdawn.sheetVersion    = 0.000;    // This is the Sheet (html file) version that we think we are dealing with.
    if( state.Earthdawn.Rolltype        === undefined ) {
      state.Earthdawn.Rolltype = {};
      state.Earthdawn.Rolltype.Override = false;
      state.Earthdawn.Rolltype.PC = {};
      state.Earthdawn.Rolltype.PC.Default = "Public";
      state.Earthdawn.Rolltype.PC.Exceptions = {};                     // set with key of Earthdawn.matchString( name ) = { name: name, display: ssa[ 5 ] };
      state.Earthdawn.Rolltype.NPC = {};
      state.Earthdawn.Rolltype.NPC.Default = "GM Only";
      state.Earthdawn.Rolltype.NPC.Exceptions = {};
    }
    state.Earthdawn.newChars = [];      // set the array of new characters to empty.
    state.Earthdawn.actionCount = {};   // erase all the old actionCounts
    state.Earthdawn.rowIDobj = {};      // erase collection of rowIDs waiting to be checked. 

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
        if( charQueue ) {
          const charBurndown1 = () => {       // create the function that will process the next element of the queue
            if( charQueue.length ) {
              let c = charQueue.shift();
              let attCount = routine( c.get( "_id" ), ed, count++ );
              Earthdawn.errorLog( "Updated " + attCount + " things for " + c.get( "name" ), ed);
              setTimeout( charBurndown1, 1);   // Do the next character
            } else    // Have finished the last attribute.
              ed.chat( count + " character sheets updated.", Earthdawn.whoFrom.apiWarning );
          };
          ed.chat( "Updating all characters (" + charQueue.length + ") to new character sheet version " + version, Earthdawn.whoFrom.apiWarning );
          charBurndown1();   // start the execution by doing the first element. Each element will call the next.
        }
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
      if( state.Earthdawn.version < 3.000)
        vUpdate( this, this.updateVersion3p000, 3.000 );

      state.Earthdawn.version = Earthdawn.Version;
    }

    let style;
    switch (state.Earthdawn.style) {
      case Earthdawn.style.VagueSuccess:  style = " - Vague Successes.";  break;
      case Earthdawn.style.VagueRoll:     style = " - Vague Roll.";       break;
      case Earthdawn.style.Full:
      default:                            style = " - Full.";             break;
    }

    log( Earthdawn.timeStamp() + "---Earthdawn.js Version: " + Earthdawn.Version
          + " loaded.   Earthdawn.html Version: " + state.Earthdawn.sheetVersion + " loaded.   For "
          + state.Earthdawn.game + " Edition: " +  Math.abs( state.Earthdawn.edition ) + " ---");
    if( state.Earthdawn.logStartup ) {
      log( "---  Roll Style: " + state.Earthdawn.style + style );
      log( "---  CursedLuckSilent is " + ((state.Earthdawn.CursedLuckSilent && state.Earthdawn.CursedLuckSilent & 0x04 ) ? "Silent" : "not Silent")
            + ".   NoPileonDice is " + state.Earthdawn.noPileonDice + ((state.Earthdawn.CursedLuckSilent && state.Earthdawn.CursedLuckSilent & 0x02 ) ? " Silent" : " not Silent")
            + ".   NoPileonStep is " + state.Earthdawn.noPileonStep + ((state.Earthdawn.CursedLuckSilent && state.Earthdawn.CursedLuckSilent & 0x01 ) ? " Silent" : " not Silent")
            + ". ---");
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


          // for each character, set API and API_max to 1
    let chars = findObjs({ _type: "character" });
    _.each( chars, function ( charObj ) {
      let cid = charObj.get( "_id" );
      let aObj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: cid, name: "API" });
      if( aObj.get( "current" ) != "1" )
        aObj.setWithWorker( "current", "1" );
      if( aObj.get( "max" ) != "1" )
        aObj.setWithWorker( "max", "1" );
    }) // End ForEach character



    if( firstRun ) {
      let edParse = new this.ParseObj( this ),
          charQueue = findObjs({ _type: "character" });      // create the queue we'll be processing.
      if( charQueue && charQueue.length > 0) {
        const charBurndown2 = () => {				// function that will process the next element of the queue
          try {
            if( charQueue.length > 0 ) {
              let c = charQueue.shift();
              log( "Verifying " + c.get( "name" ));
              edParse.charID = c.get( "_id" );
              edParse.Debug( [ "Debug", "repSecFix", "silent" ] );
              setTimeout( charBurndown2, 1);   // Do the next character
            } else {    // Have finished the last character.
              this.chat( "We recommend relinking all existing characters using the process described in the WiKi.", Earthdawn.whoFrom.apiWarning | Earthdawn.whoTo.public );
              this.chat( "Suggest opening "  + Earthdawn.makeButton( "Wiki Link", "https://wiki.roll20.net/Earthdawn_-_FASA_Official_V2"
                      , "This button will open this character sheets Wiki Documentation, which should answer most of your questions about how to use this sheet."
                      , Earthdawn.Colors.dflt,Earthdawn.Colors.dfltfg, true ) + " in another tab and reading it."
                      , Earthdawn.whoFrom.apiWarning | Earthdawn.whoTo.public );
            }
          } catch(err) {
            log( "firstRun error caught: " + err );
        } };
        this.chat( "This is the first time the API has run in this campaign space.", Earthdawn.whoFrom.apiWarning | Earthdawn.whoTo.public );
        edParse.funcMisc( [ "funcMisc", "macroCreate", "refresh" ] );
        this.chat( "Earthdawn Macros created.", Earthdawn.whoTo.public );
        this.chat( 'Suggest to your players that they put "Roll-Public", "Roll-Player-GM", and "Roll-GM-Only" in their macro bar.', Earthdawn.whoTo.public );
        this.chat( 'As GM, you should also have "NpcReInit", "ResetChars", and "Dur-Track" in your macro bar.', Earthdawn.whoTo.public );
        this.chat( "We are now Verifying all preexisting characters.", Earthdawn.whoFrom.apiWarning | Earthdawn.whoTo.public );
        this.chat( charQueue.length + " characters detected.", Earthdawn.whoFrom.apiWarning | Earthdawn.whoTo.public );
        charBurndown2();   // start the execution by doing the first element. Each element will call the next.
    } }

    let edc = this;
    setTimeout(function() {   // Put anything that you want to happen 5 seconds after startup here.
      try {
        StatusTracker.RegisterCallback( "AnnounceTurn", callbackStAnnounceTurn );
        StatusTracker.RegisterCallback( "TokenType", callbackStTokenType );
      } catch(err) {
//        log( "Warning! Earthdawn.js  -> StatusTracker integration failed!  Error: " + err );
//        log( "   The sheet will still work, but without StatusTracker integration!" );
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
        let sectPlayer = new HtmlBuilder( "", "", {style: {"background-color": "white" }});
      } catch(err) {
        log( Earthdawn.timeStamp() + "Error! Earthdawn.js  -> HtmlBuilder integration failed!  Error: " + err );
        log( "   ***** The sheet will ***NOT*** work, unless htmlBuilder is installed! *****" );
        log( "   ***** go to the API page and add htmlBuilder.js" );
      }



              // Every time the API is restarted, go through each character and look for old repeating_message's that have not been processed.
              // Process and/or delete them.
      try {
        let ApiUnproc = 0, Expired = 0, ApiAck = 0, SheetAck = 0, kept = 0, rowCount = 0, charCount = 0, d = new Date(),
            charQueue = findObjs({ _type: "character" });      // create the queue we'll be processing.
        if( charQueue && charQueue.length > 0 ) {
          const charBurndown3 = () => {       // function that will process the next element of the queue
            try {
              if( charQueue.length > 0 ) {
                let c = charQueue.shift(), cDel;
                let id = c.get( "_id" );
                let attributes = findObjs({ _type: "attribute", _characterid: id }),
                rowIndex = [],
                rowattribs = [],
                toDel = [];
                _.each( attributes, function (att) {
                  if (att.get("name").startsWith( "repeating_message_" )) {
                    let rowID = Earthdawn.safeString( Earthdawn.repeatSection( 2, att.get( "name" ))),
                        t;
                    if( rowID ) {
                      t = rowIndex.indexOf( rowID );    // One-dimensional array of message rowIDs.
                      if( t == -1 ) {
                        t = rowIndex.push( rowID ) - 1;
                        rowattribs.push( [] );
                      }
                      rowattribs[ t ].push( att );    // Array or arrays of attributes. First dimension is RowID. rowAttribs[0][0] and [0][1] will have the same rowID.
                    }
                  }
                }); // End for each attribute.      // We have now ordered things into neat two dimensional arrays.

                for( let i = 0; i < rowIndex.length; ++i ) {
                  let toAPI, toApiAck, toSheet, toSheetAck, tstamp, rDel;
                  for( let j = 0; j < rowattribs[ i ].length; ++j ) {    // we don't know what order we are going to get these, so now put each row into variables.
                    let n = rowattribs[i][j].get( "name" ),
                        c = rowattribs[i][j].get( "current" ),
                        m = rowattribs[i][j].get( "max" );
                    if( n.endsWith( "_MSG_TimeStamp" ))
                      tstamp = c;
                    else if( n.endsWith( "_MSG_toAPI" )) {
                      if( c ) toAPI = c;
                      if( m ) toApiAck = m;
                    } else if( n.endsWith( "_MSG_toSheetworker" )) {
                      if( c ) toSheet = c;
                      if( m ) toSheetAck = m;
                    } else if ( !n.endsWith( "_MSG_RowID" )) {     // We should not see RowID's, but if we do, don't freak out.
                      Earthdawn.errorLog( "Earthdawn messageCleanup error. invalid attribute: " + n, edc);
                      rDel = true;    // If we do see something truly weird, delete the whole row. 
                    }
                  } // end column     Now that we have the row organized into variables, check to see if we should delete this row.

                  if( toAPI && !toSheetAck ) {    // Message to API was never ACK. So process it now, but delete it instead of sending ACK.
                    Earthdawn.fromSheetworkerToAPI( toAPI, id, "unacknowledged" );
                    rDel = true;
                    ++ApiUnproc;
                  }
  //                if( toSheet && !toApiAck ) {
  //                  rDel = true;
  //                  ++SheetUnproc;
  //                }
                  if( tstamp ) {
                    let tdiff = Math.abs(d - (new Date( tstamp ))),
                        told = tdiff > 50000;     // Milliseconds, so 50 seconds.
  //log("tdiff " + tdiff + " told " + told + " d " + d.toString() + " dold  " + (new Date( tstamp )));
                    if(told) {
                      rDel = true;
                      ++Expired;
                    }
                  }
                  if( toApiAck ) {      // Message has been ACK, but was not deleted
                    rDel = true;
                    ++ApiAck;
                  }
                  if( toSheetAck) {     // Message has been ACK, but was  not deleted.
                    rDel = true;
                    ++SheetAck;
                  }
                  if( !toAPI && !toSheet )
                    rDel = true;      // badly formed message. 

                  if( rDel ) {
                    cDel = true;
                    ++rowCount;
                    for( let j = 0; j < rowattribs[ i ].length; ++j )
                      toDel.push( rowattribs[ i ][ j ] )
                  } else ++kept;
                } // end row
                if( cDel ) ++charCount;
                for( let j = 0; j < toDel.length; ++j )
                  toDel[ j ].remove();

                setTimeout( charBurndown3, 1);   // Do the next character
              } else {    // Have finished the last character.
                if( charCount || rowCount) {
                  log( "Message cleanup deleted " + rowCount + " messages for " + charCount + " characters.");
                  if( ApiUnproc )   log( ApiUnproc + " messages to the API that were unprocessed. ");
                  if( ApiAck )      log( ApiAck + " messages to the API that were processed but not deleted. ");
  //                if( SheetUnproc ) log( SheetUnproc + " messages to the Sheetworker that were unprocessed. ");
                  if( SheetAck )    log( SheetAck + " messages to the Sheetworker that were processed but not deleted. ");
                  if( Expired )     log( Expired + " messages that were expired. ");
                  if( kept )        log( kept + " messages kept." );
              } }
            } catch(err) {
              log( Earthdawn.timeStamp() + " Message cleanup error caught: " + err );
            }
          };  // end charBurndown3()
          charBurndown3();   // start the execution by doing the first element. Each element will call the next.
        }
      } catch(err) { log( Earthdawn.timeStamp() + "Error! Earthdawn.js  -> Message cleanup failed!  Error: " + err ); }
    }, 3500);   // end timeout
  }; // End ED.Ready()



    // chat - The EDclass version of chat. Note that the edParse version calls this one with edParse class in po, so this is the one that does everything.
    // newMsg: Text to send.
    // iFlags: whoFrom and whoTo flags.
    // customFrom: Text string that will be used instead of whoFrom and whoTo flags.
    // po: If this is being called back from parseObj, then this is the parseObj. Else, if it exists, it holds cID.
this.chat = function ( newMsg, iFlags, customFrom, po ) {
  'use strict';
  let edc = this;
  try {
    let haveMsg = edc && edc.msg;
    let cID, wf = "API", specialTo, whoTo = "", cnt = 0;  // Number of players that actually got the message
    iFlags = iFlags || 0;
//log("this.chat " + iFlags + " customFrom " + customFrom);

          // Set the cID if any
    if( typeof po === "string" ) {
      cID = po;   // This was never parseObj, we were passed cID.
      po = undefined;
    } else if( po !== undefined)
      cID = po.charID;    // after this either we have a cID, or we were not passed any (which means it is a general message, not attached to a character).

        // Deal with error and warnings that have default whoto and whofom
    if ( iFlags & (Earthdawn.whoFrom.apiError | Earthdawn.whoFrom.apiWarning )) {
      Earthdawn.errorLog( newMsg, edc );    // Errors and Warnings log to console log.
      iFlags |= Earthdawn.whoFrom.api | Earthdawn.whoTo.player | ((iFlags & Earthdawn.whoFrom.apiError) ? Earthdawn.whoTo.gm : 0);  // Chat messages to player who did it, If an error, send to gm as well.
    }
        //  Find the whoFrom
    if( customFrom && customFrom.startsWith( " sent Roll" )) {      // When a roll is sent to GM Only, a Player Card message is sent to the player saying it was sent.
      specialTo = customFrom;
      customFrom = undefined;
    }
    if( customFrom )   // if we specified a customFrom as argument, it overrides everything
      wf = customFrom;
    else if ((iFlags & Earthdawn.whoFrom.player) && (iFlags & Earthdawn.whoFrom.character) && po && po.tokenInfo && ("name" in po.tokenInfo )
            && haveMsg && edc.msg.who ) // From a player and we have the name of the token
      wf = edc.msg.who.replace(" (GM)","") + " - " + po.tokenInfo[ "name" ];
    else if ((iFlags & Earthdawn.whoFrom.character) && po) {
      let fnd;
      if( po && po.tokenInfo ) {
        fnd = po.tokenInfo[ "name" ];
        if( (!fnd || fnd.length < 2) && "characterObj" in po.tokenInfo ) {
          fnd = po.tokenInfo.characterObj.get( "name" );
          if( (!fnd || fnd.length < 2) && "tokenObj" in po.tokenInfo ) {
            fnd = po.tokenInfo.tokenObj.get( "name" );
      } } }
      else if( po.charID ) {
        let charObj = getObj("character", po.charID);
        if( charObj )
          fnd = charObj.get( "name" );
      }
      if( fnd && fnd.length > 0 )
        wf = fnd;
    } else if (!haveMsg || (iFlags & Earthdawn.whoFrom.api) || (edc.msg.type === "api") || (edc.msg.playerid === "API"))
      wf = "API";
        // end find whoFrom

        // Find the WhoTo
    if( specialTo )
      whoTo = specialTo;
    else if ( iFlags & Earthdawn.whoTo.gm && iFlags & Earthdawn.whoTo.player )
      whoTo = " to GM&P ";
    else if ( iFlags & Earthdawn.whoTo.gm )
      whoTo = " to GM ";
    else if ( iFlags & Earthdawn.whoTo.player )
      whoTo = " to player ";

    function sc( speakingas, inp ) {    // send chat wrapper.
      sendChat( speakingas, inp, null, (iFlags & Earthdawn.whoFrom.noArchive) ? {noarchive:true} : null );
      cnt++;
    } // end sc wrapper
    function whisper( speakingas, whisperto, dataline ) {
      if( whisperto.indexOf( "\"" ) !== -1 ) {
        sendChat( "API", "Warning: One the roll20 Display names (" + whisperto + ") API is trying to send a message to contains a double quote mark, which makes it impossible to send a whisper to that person." );
        sc( speakingas, dataline );   // send it to public (as well as everybody on the list - duplicate message). 
      } else
        sc( speakingas, '/w "' + whisperto +'" ' + dataline );
    } // end whisper wrapper

/*
    if ( !(iFlags & Earthdawn.whoTo.playerList )) {     // Don't do this section if specified to do the playerList section.
                // Send to player, unless already sending to the gm, and the player is the gm.
      if( haveMsg && edc.msg.who && ( iFlags & Earthdawn.whoTo.player )
              && ( !(iFlags & Earthdawn.whoTo.gm) || ((iFlags & Earthdawn.whoTo.gm) && edc.msg.playerid && !playerIsGM( edc.msg.playerid ))))
        whisper( wf + whoTo, edc.msg.who.replace( " (GM)", "" ), newMsg);
      else if( iFlags & Earthdawn.whoTo.gm )
        sc( wf + whoTo, "/w gm " + newMsg );
      else if( !( iFlags & Earthdawn.whoTo.mask))         // If no whoTo specified, send to all.
        sc( wf + " to Public", newMsg );
    }   // end NOT playerList
*/
//  When there is a player and a GM, and the player asks for a pgm, it is sent to player, but not GM.

    if ( !(iFlags & Earthdawn.whoTo.playerList )) {     // Don't do this section if specified to do the playerList section.
                // Send to player, unless already sending to the gm, and the player is the gm.
      if( haveMsg && edc.msg.who && ( iFlags & Earthdawn.whoTo.player )
              && ( !(iFlags & Earthdawn.whoTo.gm) || ((iFlags & Earthdawn.whoTo.gm) && edc.msg.playerid && !playerIsGM( edc.msg.playerid ))))
        whisper( wf + whoTo, edc.msg.who.replace( " (GM)", "" ), newMsg);
      if( iFlags & Earthdawn.whoTo.gm )
        sc( wf + whoTo, "/w gm " + newMsg );
      if( !( iFlags & Earthdawn.whoTo.mask))         // If no whoTo specified, send to all.
        sc( wf + " to Public", newMsg );
    }   // end NOT playerList

    if( cnt === 0 ) {   // If we did not send any messages above, send to everybody on the token control list and every gm.
      let lplr = findObjs({ _type: "player", _online: true }), //list of online players
          lplrctrl = [], ctrall;  //List of players that control this player id
      if( cID ) {
        let c = findObjs({ _type: "character", _id: cID })[0];
        if (c && c.get( "controlledby" ))
          lplrctrl = c.get( "controlledby" ).split( "," );
        ctrall = lplrctrl && lplrctrl.includes("all");
      }

      if( lplr ) {
        for( let i = 0; i < lplr.length; i++ ) {  //go through the list of on-line players and send to the right ones
          let snd = false,
              pid = lplr[ i ].get( "_id" ),
              pn = lplr[ i ].get( "_displayname" );
          snd |= (iFlags & Earthdawn.whoTo.gm) && playerIsGM( pid );      // Send to GM if flagged for it
          if( iFlags & Earthdawn.whoTo.player) {
            snd |= haveMsg && edc.msg.playerid && ( edc.msg.playerid == pid );    // Send to the originator of the message, if there is one.
            snd |= (ctrall || lplrctrl.includes( pid )) && (!playerIsGM( pid ) || !haveMsg);    // Player(s) controlling the same token.character. Unless it is not a real message GM is excluding because vague results are sent in 2 separate messages
          }
          if( snd )
            whisper( wf + whoTo, pn, newMsg );
    } } }  // end playerList
    if( cnt == 0 )    //If we didn't identify any player to send it to just send it to all
      sc( wf + " to Public", newMsg );
  } catch(err) { Earthdawn.errorLog( "Earthdawn.chat() error caught: " + err, edc ); }
}; // end chat()




        // Somehow script library messed up character set and all token actions ended up with weird and wrong names (starting with 0xFFFD).
        // Go through all abilities that start with 0xFFFD.
        // look inside it, and figure out what it is, and fix the name.
  this.updateVersion1p001 = function( cID ) {
    'use strict';
    let edc = this;
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
        let name = Earthdawn.safeString( a[i].get( "name" ) );
        let e = name.lastIndexOf( String.fromCharCode( 0xFFFD ) );
        if( e !== -1 ) {
          let act = Earthdawn.safeString( a[i].get("action") ).trim(),
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
        let nm = Earthdawn.safeString( att.get("name") );
        if ( nm.endsWith( "_DSP_Code" )) {
          if( Earthdawn.safeString( att.get( "current" )) == "99.0" )      // I changed the code for Questors.
            att.set( "current", "89.0");
        } else if ( nm === "SP-WillForce-Karma-Control" ) // Willforce, not WillForce.
          setNameSafe( att, "attribute", nm, "SP-Willforce-Karma-Control");
        else if ( nm === "Damage" ) {
          let t = Earthdawn.safeString( att.get( "max" ));
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
    } catch(err) { Earthdawn.errorLog( "ED.updateVersion1p001() cID=" + cID + "   error caught: " + err, edc ); }
  }; // end updateVersion1p001()



  this.updateVersion1p0021 = function( cID ) {
    'use strict';
    let edc = this;
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
    } catch(err) { Earthdawn.errorLog( "ED.updateVersion1p0021() cID=" + cID + "   error caught: " + err, edc ); }
  }; // end updateVersion1p0021()



  this.updateVersion1p0022 = function( cID ) {
    'use strict';
    let edc = this;
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
    } catch(err) { Earthdawn.errorLog( "ED.updateVersion1p0022() cID=" + cID + "   error caught: " + err, edc ); }
  }; // end updateVersion1p0022()



  this.updateVersion1p0023 = function( cID, ed, charCount ) {
    'use strict';
    let edc = this;
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
    } catch(err) { Earthdawn.errorLog( "ED.updateVersion1p0023() cID=" + cID + "   error caught: " + err, edc ); }
  }; // end updateVersion1p0023()



  this.updateVersion2p001 = function( cID, ed, charCount ) {
    'use strict';
    let edc = this;
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
    } catch(err) { Earthdawn.errorLog( "ED.updateVersion1p0023() cID=" + cID + "   error caught: " + err, edc ); }
  }; // end updateVersion2p001()



  this.updateVersion3p000 = function( cID, ed, charCount ) {
    'use strict';
    let edc = this;
    try {
      let count = 0,
          tabBad, tabGood;

      function setDefault( att, maxdef ) {    // This only sets a new max value if the old value was zero.
        if( maxdef ) {
          let aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: cID, name: att }, 0, 0);
          if( aobj.get( "max" ) == 0)
            Earthdawn.setWithWorker( aobj, "max", maxdef );
        }
      }

      let attributes = findObjs({ _type: "attribute", _characterid: cID });
      _.each( attributes, function (att) {
        switch( att.get( "name" )) {
          case "Hide-Spells-tab":
            tabBad = att;   break;
          case "Hide-Spells-Tab":
            tabGood = att;  break;
          case "Creature-Ambush":
            setDefault("Creature-Ambushing", att.get( "current" ));
            att.remove();
            break;
          case "Creature-DiveCharge":
            setDefault("Creature-DivingCharging", att.get( "current" ));
            att.remove();
            break;
          case "Flight":
            setDefault("Fly", att.get( "current" ));
            att.remove();
            break;
          case "playerWho":
            att.remove();
            break;
        }
      }); // End for each attribute.
                // if Hide-Sheet-tab exists, make it Hide-Sheet-Tab.
      if( tabGood && tabBad ) {    // we have both, just delete the bad one.
        tabBad.remove();
        ++count;
      } else if ( tabBad ) {        // We only have bad, so rename it to the good one.
        tabBad.set( "name", "hide-Spells-Tab" );
        ++count;
      }
      return count;
    } catch(err) { Earthdawn.errorLog( "ED.updateVersion3p000() cID=" + cID + "   error caught: " + err, edc ); }
  }; // end updateVersion3p000()



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
        let baseNum = stepNum - 6,
            twelves = 0;
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
        let baseNum = stepNum - 8;
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
      return Earthdawn.safeString( dice ).slice(0,-1);     // Trim off the trailing "+"
    } catch(err) { Earthdawn.errorLog( "ED.StepToDice() error caught: " + err, this ); }
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
    } catch(err) { Earthdawn.errorLog( "ED.ReconstituteInlineRolls() error caught: " + err, this ); }
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
    let edc = this;
    try {
      let MsgType,
        newMsg,
        rollMsg,
        third = "";

      if ( this.msgArray[ 0 ] === "!edsdrGM") {
        rollMsg = "/gmroll ";
        MsgType = Earthdawn.whoTo.gm | Earthdawn.whoTo.player;
        newMsg = " PGM Rolls step ";           // This is the base step number.
      }
      else if ( this.msgArray[ 0 ] === "!edsdrHidden") {
        rollMsg = "/gmroll ";
        MsgType = Earthdawn.whoTo.gm;
        newMsg = " GmOnly Rolls step ";
      } else {    // public
        rollMsg = "/r ";
        MsgType = 0;
        newMsg = " Rolls step ";
      }
      let step = Earthdawn.parseInt2( this.msgArray[1] );
      if( step < 1 ) {
        this.chat( "Warning!!! Step Number " + step, Earthdawn.whoFrom.apiWarning );
        step = 1;
      }
      rollMsg += this.StepToDice( step );
      newMsg += step;

      if (this.msgArray.length > 2) {
        let karmaControl = Earthdawn.getParam( this.msgArray[2], 2, ":"),
          karmaDice;
        if( karmaControl === "-1" )
          karmaDice = 0;
        else if( Earthdawn.parseInt2( karmaControl, true ) > 0 )
          karmaDice = this.StepToDice( Earthdawn.parseInt2( karmaControl ) * 4 );
        else
          karmaDice = this.StepToDice( Earthdawn.parseInt2( Earthdawn.getParam( this.msgArray[2], 1, ":" )));          // karma or bonus step number
        if( karmaDice != "" ) {
          newMsg = newMsg + " plus " + karmaDice.replace( /!|\+/g, "");
          rollMsg = rollMsg + "+" + karmaDice;
        }
        if (this.msgArray.length > 3)
          third = " " + this.msgArray[ 3 ] + ".";              // This is the "reason" or flavor text
      }     // End msgArray has at least two elements.

      if(( MsgType != (Earthdawn.whoTo.gm | Earthdawn.whoTo.player)) && (this.msgArray.length < 5 || Earthdawn.parseInt2( this.msgArray[ 4 ] ) < 1)) {
        this.chat( rollMsg + newMsg + third, 0);
      } else {       // We have a target number, so have the results of the roll sent to a callback function to be processed.
        sendChat("player|" + this.msg.playerid, rollMsg, function( ops )  {  // This is a callback function that sendChat will callback as soon as it finishes rolling the dice.
          'use strict';
             // NOTE THAT THIS IS THE START OF A CALLBACK FUNCTION
                  // Standard. Tell what rolled, vague about how much missed by.
                  // Full: Tell exact roll result and how much made or missed by.
                  // Vague. Done tell roll result, but tell how much made or missed by.
          let RollResult = JSON.parse(ops[0].content);
//          let EchoMsg =  "Rolling " + ops[0].origRoll.replace( /!/g, "") + ":";
          let EchoMsg = newMsg + " (" + ops[0].origRoll.replace( /!/g, "") + "):";
          if ( state.Earthdawn.style != Earthdawn.style.VagueRoll)
            EchoMsg += "  Rolled a " + RollResult.total + ".";
          EchoMsg += third;

          if (edc.msgArray.length > 4 && Earthdawn.parseInt2( edc.msgArray[ 4 ] ) > 0) {
            let result = RollResult.total - Earthdawn.parseInt2( edc.msgArray[4] );
            if( result < 0 ) {
              EchoMsg += "   FAILURE" + (( state.Earthdawn.style != Earthdawn.style.VagueSuccess ) ? " by " + Math.abs(result) + "!" : "!" );
            } else if ( result < 5 ) {
              EchoMsg += "   SUCCESS" + (( state.Earthdawn.style != Earthdawn.style.VagueSuccess ) ? " by " + Math.abs(result) + "." : "." );
            } else
              EchoMsg += "   SUCCESS" + (( state.Earthdawn.style != Earthdawn.style.VagueSuccess ) ? " by " + Math.abs(result) : "" ) + " (" + ( Math.floor(result / 5) ).toString() + " extra" + ((result < 10) ? "!)" : "es!)");
          } // End we have a target number
          else if ( state.Earthdawn.style == Earthdawn.style.VagueRoll)
            EchoMsg += "  Rolled a " + RollResult.total + ".";
          edc.chat( EchoMsg, MsgType);
        });  // End of callback function
      }    // 4th element.
    } catch(err) { Earthdawn.errorLog( "ED.StepDiceRoller() error caught: " + err, edc ); }
  };  // End StepDiceRoller();



                // edInit - Initiative
  this.Initiative = function()  {
    'use strict';
                // Expects an initiative step, rolls the initiative for each selected token and puts them in the turn order the selected token.
                // There may also optionaly be a karma step.
                //
                // The following roll20 macro will generate a string that this will process.
                // edInit~ ?{Initiative Step}~ ?{Karma Step | 0}~ for Initiative
    let edc = this;
    try {
      let step = Earthdawn.parseInt2( this.msgArray[1] ),
        rollMsg;
      if ( step < 1 ) {
        this.chat( "Illegal Initiative step of " + step, Earthdawn.whoFrom.apiWarning );
        step = 0;
        rollMsg = "/r {{1d4!-2}+d1}kh1";
      }
      else
        rollMsg = "/r " + this.StepToDice( step );
      let newMsg = " rolled step " + step;
      if (this.msgArray.length > 2) {
        let karmaDice = this.StepToDice( Earthdawn.parseInt2( this.msgArray[2] ) );          // karma or bonus step number
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
          TokenName = CharObj.get( "name" );
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
          turnorder.push({ id: sel._id, _pageid: TokenObj.get( "pageid" ), pr: result });
          turnorder.sort( function(a,b) { 'use strict'; return (b.pr - a.pr) });
          Campaign().set( "turnorder", JSON.stringify(turnorder));
        });  // End of callback function
      });  // End for each selected token
      if( Count == 0)
        edc.chat( "Error! Need to have a token selected to Roll Initiative.", Earthdawn.whoFrom.apiWarning );
    } catch(err) { Earthdawn.errorLog( "EDInit error caught: " + err, edc ); }
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
    switch (Earthdawn.getAttrBN(token.get('represents'), "NPC", "1" )) {
      case "-1":  ret = "Object"; break;
      case "0":   ret = "PC";     break;
      case "1":   ret = "NPC";    break;
      case "2":   ret = "Mook";   break;
    }
    return ret;
  };     // End callbackStTokenType;



        // This routine runs when a new character is added.
        // It can be called from events "on character add" when one is created manually, or it can be called from WelcomePackage when it makes one.
        // Note, it also seem to be triggered on character add, when a character is imported from the character vault (in which case it is not truly a new character!).
  this.newCharacter = function( cID )  {
    'use strict';
    let edc = this;
    try {
      state.Earthdawn.newChars.push( cID );     // Add this character ID to the list of brand new characters. This is so that abilityRebuild will do something slightly different for brand new characters. 
      setTimeout(function() {       // When a character is imported from the character vault, the recalc caused by edition has been observed to cause a race condition. Delay this processing long enough for the import to have been done.
        try {
          let npc = ( typeof WelcomePackage === 'undefined' ) ? Earthdawn.charType.pc : Earthdawn.charType.npc;
          let plr = findObjs({ _type: "player", _online: true });     // If there is only one person on-line, that is the player.
          if( plr && plr.length === 1 )
            npc = playerIsGM( plr[0].get( "_id")) ? Earthdawn.charType.npc : Earthdawn.charType.pc;
          let CharObj = getObj( "character", cID);     // See if we can put a default value in the player name.
          if ( CharObj ) {
            let lst = CharObj.get( "controlledby" );
            let arr = _.without( lst.split( "," ), "all" );
            if( arr && arr.length === 1 && arr[ 0 ] !== "" ) {     // If there is only one person who can control the character, use their name.
              let pObj = getObj( "player", arr[ 0 ]);
              if( pObj )
                Earthdawn.SetDefaultAttribute( cID, "player-name", pObj.get( "_displayname" ));
              npc = playerIsGM( arr[ 0 ] ) ? Earthdawn.charType.npc : Earthdawn.charType.pc;    // character was created by welcome package, if for GM, make it an NPC else PC.
          } }

          Earthdawn.setWW( "API", 1, cID );
// keep above, lose ping.
//          Earthdawn.setWW( "SWflag", "Ping,"+ Math.random(), cID );
//          if( state.Earthdawn.logMsg ) log( "New character: SWflag ping sent." );

                    // If a character was created by Welcome package for a Player, or if Welcome Package is not installed, default to PC.
                    // If a character was created by Welcome package for a GM, or if Welcome Package is installed, default to NPC.
          Earthdawn.SetDefaultAttribute( cID, "NPC", npc ? npc : Earthdawn.charType.pc );
          Earthdawn.SetDefaultAttribute( cID, "RollType", (state.Earthdawn.defRolltype & (( npc === Earthdawn.charType.pc ) ? 0x04 : 0x01)) ? "/w gm" : " " );

          if( Earthdawn.getAttrBN( cID, "edition", "4" ) != state.Earthdawn.edition )
            if( (Earthdawn.getAttrBN( cID, "edition", "99" ) == "") && state.Earthdawn.edition )
              Earthdawn.setWW( "edition", state.Earthdawn.edition, cID, "4" )
            else
              edc.chat( "Error, settings mismatch. New character had 'edition' set to '" + Earthdawn.getAttrBN( cID, "edition", "99" ) 
                + "'. While API state variable has 'edition' set to '" + state.Earthdawn.edition
                + "'. Go to Campaign settings Default Sheet Settings and set 'What Game/Edition is your campaign' to correct value to ensure that all future sheets will be "
                + "set correctly, then go to any character sheets 'Special Functions - GM: Special Commands' and set 'Change Edition' to the correct value "
                + "as well to update the API and all existing sheets.", Earthdawn.whoFrom.apiWarning );

          setTimeout(function() {       // 10 seconds seems to be enough for all of the above, but not the ability rebuild.  Give it more time. 
            try {
              let ind = state.Earthdawn.newChars.indexOf( cID );      // remove this character from the list of brand new characters. 
              if( ind > -1 )
                state.Earthdawn.newChars.splice( ind, 1 );
            } catch(err) { Earthdawn.errorLog( "ED.newCharacter setTimeout2() error caught: " + err, edc ); }
          }, 20000);    // end delay 20 more seconds.
        } catch(err) { Earthdawn.errorLog( "ED.newCharacter setTimeout() error caught: " + err, edc ); }
      }, 10000);    // end delay 10 seconds.
    } catch(err) { Earthdawn.errorLog( "newCharacter error caught: " + err, edc ); }
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
//    this.SWflag = "";               // This holds commands that will later be sent to the sheetworker. Newline delimited list of command lines that start with a command and a comma.
    this.targetIDs = [];            // array of IDs of targets.
    this.tokenIDs = [];             // array of IDs of tokens we are processing with this command.
    this.targetNum = undefined;     // If this action involves a target number, it is stored here.
    this.tokenAction = false;       // If this is set to true, then we were called from a Token Action. If false, from a character sheet button.
                                    // Note that this controls how many of the commands behave. For example ForEach behaves differently if called from a Token Action.
    this.tokenInfo = undefined;     // { type: "token" or "character", name: (name), tokenObj: (API token object), characterObj: (API character object) }
    this.uncloned = this;           // ForEach makes a copy of this class that each loop can modify at will. If you want to make changes or check values in the original, use this.uncloned.
                                    // eachTargets is not defined here, but is stored at this level. 
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
            //  headcolor, subheader, displayMsg, successMsg, failMsg, endNote, endNoteSucc, endNoteFail, targetName, targettype, etc.




/*
          // ParseObj.addSWflag()     This routine builds a list of commands for the sheetworkers to process.
          // The list is newline delimited.
          // Each item on the list has a command, a comma, and some data for the command. Each command has its own requirements for format.
          // cmd tells the sheetworkers what exact type of communication this is.
          // line is the details needed to process this command.
          //    Trigger, (attribute name to trigger) (: colon) (data to be written to activate the trigger). (newline).
          //
          // Note: Code obsolete after Feb 2023
    this.addSWflag = function( cmd, line ) {
      try {
        this.SWflag += cmd + "," + line + "\n";
      } catch(err) { Earthdawn.errorLog( "ED.addSWflag() error caught: " + err, this ); }
    } // end addSWflag()


          // ParseObj.sendSWflag()
          // if SWflag is not blank, send it to the sheet workers.
          // No arguments, if there is a msg, it will already be stored in SWflag.
          //
          // Note: code obsolete after Feb 2023. replaced by toSheet
    this.sendSWflag = function() {
      try {
        if( this.SWflag )
          if( this.charID ) {
//log(this.SWflag);
            this.setWW( "SWflag", this.SWflag.trim())
          } else
            Earthdawn.errorLog( "ED.checkSWflag error, no charID found!   SWflag was " + this.SWflag, this );
      } catch(err) { Earthdawn.errorLog( "ED.checkSWflag() error caught: " + err, this ); }
    } // end sendSWflag()
*/



          // ParseObj.toSheet()
          // Send a message to a sheetworker asking it to do something.
          //
          // cmd tells the sheetworkers what exact type of communication this is.
          // line is the details needed to process this command.
          //    Trigger, (attribute name to trigger) (: colon) (data to be written to activate the trigger).
    this.toSheet = function( cmd, line ) {
      try {
        if( this.charID ) {
          let t = cmd + "," + line,
              pre = Earthdawn.buildPre( "MSG", Earthdawn.generateRowID() );
          if( state.Earthdawn.logMsg ) log( "toSheet ( " + pre + " ):  " + t);
//if( t.indexOf( "Trigger" ) !== -1 ) {
//t = "ping";
//log("not sending trigger" ); return;
//  if( state.Earthdawn.logMsg ) log( "toSheet ( " + pre + " ):  " + t);
//}
          createObj( "attribute", { _characterid: this.charID, name: pre + "TimeStamp", current: (new Date()).toString() });
          createObj( "attribute", { _characterid: this.charID, name: pre + "toSheetworker", current: t });
        } else
          Earthdawn.errorLog( "ED.toSheet error, no charID for this operation: " + t );
      } catch(err) { Earthdawn.errorLog( "ED.toSheet( " + t + " ) error caught: " + err, this ); }
    } // end toSheet()


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
          ssa[ 1 ] = Earthdawn.safeString( ssa[ 1 ] ).toLowerCase();
        switch ( ssa[ 1 ] ) {
          case "sk": {
            let cls = Earthdawn.getAttrBN( this.charID, pre + "Class", "General");
            if( cls !== "General" )
              this.misc[ "skillClass" ] = cls;
          }
          case "t":
          case "skc":
          case "nac": {
            this.misc[ "result" ] = (this.misc[ "result" ] || 0) + this.getValue( pre + "Result-Mods");
            let fx = Earthdawn.getAttrBN( this.charID, pre + "FX", "");
            if( fx )
              this.misc[ "FX" ] = fx;
            stepAttrib = "Effective-Rank";
            if( ssa[ 1 ] === "skc")
              def_attr = "Cha";
            else
              def_attr = "0";
            modtype = Earthdawn.getAttrBN( this.charID, pre + "Mod-Type", "Action");
            armortype = Earthdawn.getAttrBN( this.charID, pre + "ArmorType", "PA");
            this.misc[ "displayMsg" ] = Earthdawn.getAttrBN( this.charID, pre + "DisplayText", "");
            this.misc[ "successMsg" ] = Earthdawn.getAttrBN( this.charID, pre + "SuccessText", "");
            this.misc[ "failMsg" ] = Earthdawn.getAttrBN( this.charID, pre + "FailText", "");
            if(Earthdawn.getAttrBN( this.charID, pre + "Notes", "")!=="")
              this.misc[ "endNote" ] = "<b>Description</b>  "+ Earthdawn.texttip("(Hover)",Earthdawn.getAttrBN( this.charID, pre + "Notes", "").replace( /\n/g, "&#013;"));
            if( modtype != "(0)" && modtype != "NoRoll" )
              this.doLater += "~Karma: " + pre + "Karma";
            let strn = this.strainCalc( pre )    // Strain from this action, aggressive attacks, called shots and split movement.
                  + (( modtype === "Attack" || modtype === "Attack CC" )
                  ? (this.getValue( "combatOption-AggressiveAttack") * Earthdawn.getAttrBN( this.charID, "Misc-AggStance-Strain", "1"))
                  + this.getValue( "combatOption-CalledShot") : 0)
                  + (( Earthdawn.getAttrBN( this.charID, pre + "Action", "Standard") === "Standard" ) ? this.getValue( "combatOption-SplitMovement") : 0);
            if( strn > 0 )
              this.doLater += "~Strain:" + strn;
            special = Earthdawn.getAttrBN( this.charID, pre + "Special", "None");
            if( special && special !== "None" )
              this.misc[ "Special" ] = special;
            if( special.startsWith( "Recovery" )) {
              this.bFlags |= Earthdawn.flags.Recovery;
              if( special === "Recovery-WoodSkin" )
                this.misc[ "Recovery-WoodSkin" ] = true;
              if (Earthdawn.getAttrBN( this.charID, "NPC", "1") != Earthdawn.charType.mook) {
                let aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "Recovery-Tests" }, 0, 2);
                if( (aobj.get( "current" ) || 0) <= 0) {
                  this.chat( this.tokenInfo.name + " does not have a Recovery Test to spend.", Earthdawn.whoFrom.apiWarning );
                  return;
                } else
                  Earthdawn.setWithWorker( aobj, "current", Earthdawn.parseInt2( aobj.get( "current" )) -1 );
            } }

            this.misc[ "rollWhoSee" ] = pre + "RollType";
            let tType = Earthdawn.safeString( Earthdawn.getAttrBN( this.charID, pre + "Target", "None"));
            if( Earthdawn.getAttrBN( this.charID, "condition-Blindsided", "0") === "1" && tType.startsWith( "Ask:" ) && tType.slice( 6,7) === "D" )
              this.chat( "Warning! Character " + this.tokenInfo.name + " is Blindsided. Can he take this action?", Earthdawn.whoFrom.apiWarning );

            switch( special ) {
              case "Recovery":
              case "Recovery-WoodSkin": this.misc[ "headcolor" ] = "recovery";      break;
              case "Initiative":        this.misc[ "headcolor" ] = "initrep";       break;
              case "Knockdown":         this.misc[ "headcolor" ] = "knockdown";     break;
              default:
              switch( modtype ) {
                case "Action":          this.misc[ "headcolor" ] = "action";        break;
                case "Effect":          this.misc[ "headcolor" ] = "effect";        break;
                case "Attack":          this.misc[ "headcolor" ] = "attack";        break;
                case "Attack CC":       this.misc[ "headcolor" ] = "attackcc";      break;
                case "Damage":          this.misc[ "headcolor" ] = "damage";        break;
                case "Damage Poison":   this.misc[ "headcolor" ] = "damagepoison";  break;
                case "Damage CC":       this.misc[ "headcolor" ] = "damagecc";      break;
                case "JumpUp":          this.misc[ "headcolor" ] = "jumpup";        break;

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
              if( Earthdawn.getAttrBN( this.charID, "combatOption-DefensiveStance", "0" ) === "1" ) {
                let x = Earthdawn.getAttrBN( this.charID, pre + "Defensive", "0", true );
                if ( [ 1, 2, 3, 4, 5, 6, 7 ].includes( x )) {
                  step -= Earthdawn.getAttrBN( this.charID, "Misc-DefStance-Penalty", "-3", true );      // Since this talent is defensive, we need to add this value that is about to be subtracted with the standard modifiers, back in.
                  this.misc[ "Defensive" ] = x;  // Since step was modified for being defensive, tell people.
                }
                if ( [ 1, 2, 4, 5 ].includes( x ))
                  step += Earthdawn.getAttrBN( this.charID, "Misc-DefStance-Bonus", "3", true );        // This Talent actually gets a bonus for being in defensive stance.
              }
              if( Earthdawn.getAttrBN( this.charID, "combatOption-AggressiveAttack", "0" ) === "1" ) {
                let x = Earthdawn.getAttrBN( this.charID, pre + "Defensive", "0", true );
                if( [ 1, 2, 3 ].includes( x )) {
                  step += Earthdawn.getAttrBN( this.charID, "Misc-AggStance-Penalty", "-3", true );      // Since this talent is defensive, it gets a penalty for being in aggressive stance.
                  this.misc[ "Aggressive" ] = x;  // Since step was modified for being defensive, tell people.
              } }

              if( Earthdawn.getAttrBN( this.charID, "condition-KnockedDown", "0" ) === "1" )
                if( Earthdawn.getAttrBN( this.charID, pre + "Resistance", "0" ) === "1" ) {
                  step += 3;
                  this.misc[ "Resistance" ] = true;   // Resistance is depreciated 8/22
            }   }
            if( Earthdawn.getAttrBN( this.charID, pre + "MoveBased", "0" ) == "1" ) {
              let tstep = Earthdawn.getAttrBN( this.charID, "condition-ImpairedMovement", "0" );
              if( tstep > 0 ) {
                step -= tstep;
                this.misc[ "MoveBased" ] = (tstep == 2) ? "Partial" : "Full";
            } }
            if( Earthdawn.getAttrBN( this.charID, pre + "VisionBased", "0" ) == "1" ) {    // VisionBased depreciated 8/22
              let tstep = Earthdawn.getAttrBN( this.charID, "condition-Darkness", "0" );
              if( tstep > 0 ) {
                step -= tstep;
                this.misc[ "VisionBased" ] = (tstep == 2) ? "Partial" : "Full";
            } }
            this.misc[ "sayTotalSuccess" ] = Earthdawn.getAttrBN( this.charID, pre + "sayTotalSuccess", "0" ) == "1";
          } break;
          case "ska":
          case "skc":
            def_attr = "Cha";
            this.misc[ "rollWhoSee" ] = pre + "RollType";
            this.misc[ "headcolor" ] = "action";
            break;
          case "skk":
            this.doLater += "~Karma: kcdef: -1: " + pre + "Karma";
            def_attr = "Per";
            this.misc[ "rollWhoSee" ] = pre + "RollType";
            this.misc[ "headcolor" ] = "action";
            break;
          case "wpn":
            stepAttrib = "Effective-Rank";
            let strain = this.strainCalc( pre );
            this.doLater += "~Karma: " + pre + "Karma" + (strain ? "~Strain:" + strain : "");

            switch (Earthdawn.getAttrBN( this.charID, pre + "CloseCombat", "1" )) {
              case "-1": case "-2":   // Missile, Thrown
                modtype = "Damage";
                def_attr = "Str";
                this.misc[ "headcolor" ] = "damage";
                break;
              case "-3": case "-4":   // Firearm, Heavy.
                modtype = "Damage Firearm";
                def_attr = "0";
                this.misc[ "headcolor" ] = "damage";
                break;
              default:                // 1 Melee, 2 Unarmed, 3 Attached.
                modtype = "Damage CC";
                def_attr = "Str";
                this.misc[ "headcolor" ] = "damagecc";
            }
/*            if (state.Earthdawn.gED)
              modtype = ((Earthdawn.getAttrBN( this.charID, pre + "CloseCombat", "1", true ) < 0) ? "Damage": "Damage CC" );
            else {    // WPN_Type exists in 1879 only
              let typ = Earthdawn.getAttrBN( this.charID, pre + "Type", "0" );
              switch (typ) {
                case "0": case "1" case "2":
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
*/
            armortype = "PA";
            break;
          default:
            this.chat( "Error! Action() parameter ssa[1] not 'T', 'NAC', 'SK', 'SKA', 'SKK', or 'WPN'. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError );
        } // end case ssa[1]

        if( modtype === undefined )
          modtype = "Action";
        else if (modtype.startsWith( "Attack" ))
          this.Bonus( [ 0, "Adjust-Attacks-Bonus" ] );
        else if (modtype.startsWith( "Damage" ) && modtype !== "Damage Poison" ) {
          this.Bonus( [ 0, "Adjust-Damage-Bonus" ] );
          if( ssa[ 1 ].toUpperCase() === "WPN" )
            this.Bonus([ 0, pre + "BonusDice" ]);
        }
        this.misc[ "ModType" ] = modtype;
        this.misc[ "rsPrefix" ] = pre;

        if( armortype !== undefined && armortype !== "N/A" && modtype.startsWith( "Damage" ))
          switch ( Earthdawn.safeString( armortype ).trim().toLowerCase() ) {
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
        let attr, modtypevalue = 0;
        if( ssa[1] !== "skk" && ssa[1] !== "skac" && ssa[1] !== "skc" && ssa[1] !== "wpn" )
            attr = Earthdawn.getAttrBN( this.charID, pre + "Attribute", undefined);
        if( attr === undefined )
            attr = def_attr;
        if( attr != "0" && attr !== "" && attr !== undefined) {              // There is an attribute other than "None".     Find it's value.
            step += this.getValue( attr + "-Step");
            step += this.getValue( attr + "-Mods");
        }


        if( modtype == "JumpUp"  
          || modtype.search( /Armor/ ) != -1         // Armor and "@{Adjust-All-Tests-Total}+(-1*@{Armor-IP})" are obsolete with V3.1
          )   // JumpUp has replaced Armor IP, and has full IP applying
          modtypevalue = this.getValue( "Adjust-All-Tests-Total" )
              + (Earthdawn.getAttrBN( this.charID, "condition-KnockedDown", "0" ) == "1" ? 3 : 0) - this.getValue( "IP" );
        else if( modtype == "Init" )   // Init calculation has been modified, so the Misc-Adjust was not necessary anymore because included in the Attribute
          modtypevalue = this.getValue( "Initiative-Mod-Auto");
        else if (modtype == "0" || modtype == "(0)" || modtype == "NoRoll" )
          modtypevalue = 0;
        else if( modtype == "Action" )
          modtypevalue = this.getValue( "Adjust-All-Tests-Total" );
        else if( modtype == "Effect" )
          modtypevalue = this.getValue( "Adjust-Effect-Tests-Total" );
        else {
          let postfix = modtype.endsWith( "CC" ) ? "-CC" : "";
          if( modtype.search( /Attack/ ) != -1 )
            modtypevalue = this.getValue( "Adjust-Attacks-Total" + postfix );
          else if( modtype === "Damage Poison" )   // Damage Poison is NOT adjusted by Adjust-Damage-Total
            modtypevalue = 0;
          else if( modtype.search( /Damage/ ) != -1 )
            modtypevalue = this.getValue( "Adjust-Damage-Total" + postfix );
          else modtypevalue = 0;
        }

        let actType = Earthdawn.getAttrBN( this.charID, pre + "Action", (ssa[ 1 ] === "wpn" ) ? "Simple" : "Standard" );
        if( actType !== "NA" )
          this.misc[ "actType" ] = actType;
        this.misc[ "step" ] = (this.misc[ "step" ] || 0) + step + modtypevalue + this.getValue( pre + stepAttrib) + this.getValue( pre + "Mods" ) - this.mookWounds();
//log("Step Calculation " + " thistep " +(this.misc[ "step" ] || 0) + " step " +step + " modtype " +modtypevalue + " rank " +this.getValue( pre + stepAttrib) + " mods " +this.getValue( pre + "Mods" ));
        this.misc[ "ModValue" ] = modtypevalue;
        this.misc[ "rollName" ] = Earthdawn.getAttrBN( this.charID, pre + "Name", "").trim();
        this.misc[ "reason" ] = this.misc[ "rollName" ] + ((ssa[ 1 ] === "wpn") ? " damage" : "");
        let newssa = ssa.splice( 2);

        if ( special != undefined && special == "Initiative" ) {
          if( Earthdawn.getAttrBN( this.charID, "Creature-Ambushing", "0" ) == "1" )
            this.misc[ "step" ] += Earthdawn.getAttrBN( this.charID, "Creature-Ambushing_max", "0", true );
          newssa[ 0 ] = "Init";
          this.Roll( newssa );

        } else if ( modtype == "(0)" || modtype == "NoRoll" ) {
          this.doNow();
          if( "strain" in this.misc && this.misc[ "strain" ] > 0 )
            this.misc[ "subheader" ] = Earthdawn.constant( "colonalt" ) + this.misc[ "strain" ] + " strain.";
          this.rollFormat( this.WhoSendTo());
        } else {
          newssa[ 0 ] = "Roll";
          this.ForEachHit( newssa );
        }
      } catch(err) { Earthdawn.errorLog( "ED.Action() error caught: " + err, this ); }
    } // End ParseObj.Action()




        // Delete and rebuild all abilities for this character in order to make sure they are all correct.
        // On every token drop, check to see if all token actions that should exist do, and that none that should not exist don't. Ask user what to do.
        // ssa[0] addGraphic: from on add graphic (graphic drop event). Test to see if Token Actions are up to date.
        // ssa[0] abilityRebuild: addGraphic event might present user with menu choices that they can take.
        //  ssa[1]
        //  forceTest: FixRepSec forces this routine to run by user command even when user does not want it automatically run on token drop.
        //  Menu: test, and present the user with a menu of possible fixes. 
        //  fixAll: Usually called from Menu, fix everything. 
        //  addOne ssa[2]: Usually called from menu. Fix one named ability. 
        //  removeOne ssa[2]: Usually called from menu, remove one named ability. 
        //  Never: Usually called from menu, Never test this characters abilities unless specifically told to by running repsecfix. 
        //  batch: This is being run by RepSecBatch, and ALL characters are calling this in quick succession. Mostly same as forceTest but with minimum verbiage. 
        //  batchFix: Same as Batch and Fixall. Just quietly fix everything that can be fixed. 
    this.abilityRebuild = function ( ssa ) {
      'use strict';
      let po = this;
      try {
        let cID = this.charID,
            problems = 0,
            txt = "",
            oldTlength = 0,
            addGraphic = ssa.includes( "addGraphic" ),
            batch = ssa.includes( "batch" ),          // batch is GM command to verify / fix all characters, asking what to do.
            batchFix = ssa.includes( "batchFix" ),    // batchFix is GM command to verify / fix all characters, automatically fixing everything fixable without asking.
            forceTest = ssa.includes( "forceTest" ),
            silent = ssa.includes( "silent" ),
            newChar = (state.Earthdawn.newChars.indexOf( cID ) != -1);      // This character was created within the last few seconds. 

                // what == -1 do a fix all on everything.
                // what ==  0 just basic test, If problems are found then we will give them a menu button and suggest they run it.
                // what ==  1 test and set the details into txt for the menu. Menu will give options for fixall, or for each specific problem found. 
        function buildTA( what) {   // go through and get information needed to figure out what the token actions should be.
          'use strict';             // This routine also does the actual destruction and rebuilding of the TA depending upon the value of what.

          let oldab = [],       // List of token actions that DO exist.
              newab = [],       // List we build of token actions we think ought to exist.
              spmrowid = new Map(),
              contains = new Map(),
              candidate = [];   // List of attributes ending in _name that might ought to have token actions.

          function addit( nm, ab ) {    // Make this token action.
            'use strict';
            if( what === -1 )     // If fixing all, then just recreate all candidates.
              Earthdawn.abilityAdd( cID, nm, ab);
            else
              newab.push( { name: nm ,action: ab });
          } // end addit()

                  // first look at the existing Token Actions.
          _.each( findObjs({ _type: "ability", _characterid: cID}), function( abObj ) {
            let act = abObj.get( "action" );
            if( act.startsWith( "!Earthdawn" ) || act.startsWith( "!edToken" ) || act.startsWith( "!edsdr" ) || act.startsWith( "!edInit" ) )
              if( what === -1 )   // If fixing everything, just get rid of all existing token actions and build from scratch.
                abObj.remove();
              else
                oldab.push({ id: abObj.get( "_id" ), name: abObj.get( "name" ), action: act });
          });

                  // second, look at all talents, knacks, etc. that ought to have a token action.
          _.each( findObjs({ _type: "attribute", _characterid: cID }), function( att ) {
            let sa = att.get( "name" ) || "";
            if( sa.startsWith( "repeating_" )) {      // This loop only deals with repitems
              if( sa.endsWith( "T_Special" ) && att.get( "current" ) == "Corrupt Karma" ) {
                addit( Earthdawn.constant( "Target" ) + "Activate-Corrupt-Karma",
                        "!edToken~ SetToken: @{target|to have Karma Corrupted|token_id}~ Misc: CorruptKarma: ?{How many karma to corrupt|1}" );
              } else if( sa.endsWith( "_spmRowID" )) {
                if( att.get( "current" ).length > 2 )
                  spmrowid.set( Earthdawn.repeatSection( 2, sa ), att.get( "current" ));
              } else if( sa.endsWith( "_SPM_Contains" )) {
                contains.set( Earthdawn.repeatSection( 2, sa ), att.get( "current" ));
              } else if( sa.endsWith( "_Name" )) {                    //Dealing with T, NAC, SK, SKA, SKK, SPN and SP/SPM
                let code = Earthdawn.repeatSection( 3, sa );
                if ((code === "T" || code === "NAC" || code === "SK" || code === "SKA" || code === "SKK" || code === "WPN" || code === "SP"))    // All except SPM
                  candidate.push( att );
            } }
          });

              // Now we actually process the candidates, using the list of SPM rowid's and the spell contains list we got in the previous loop.
          _.each( candidate, function( att ) {
            let sa = att.get( "name" ),
                code = Earthdawn.repeatSection( 3, sa);
            if( getAttrByName( cID, Earthdawn.buildPre( sa ) + "CombatSlot" ) == "1" ) {
              if( code === "SP" ) {
                let spmID = spmrowid.get( Earthdawn.repeatSection( 2, sa ) );
                if( spmID && spmID.length > 1 ) {
                  let cont = contains.get( spmID );
                  if( cont && cont.length > 1 )
                    addit( Earthdawn.constant( "Spell" ) + cont, "!edToken~ %{selected|" + Earthdawn.buildPre("SPM", spmID) + "Roll}" );
                  else
                    Earthdawn.errorLog( "abilityRebuild:BuildTA: " + sa + " could not find out what: " + spmID + " contains.", po );
                }
              } else            // All except SP/SPM
                addit( Earthdawn.constant( code ) + "-" + att.get("current"), "!edToken~ %{selected|" + Earthdawn.buildPre( code, Earthdawn.repeatSection( 2, sa ) ) + "Roll}" );
            }
          });

                //Attack, Charge, Ambush, Grimoire, Spell, and Quester DP.
          if( Earthdawn.getAttrBN( cID, "NPC", "1", true) > 0 && Earthdawn.getAttrBN( cID, "Attack-Rank", 0) != 0)     // NPC or Mook and have a generic attack value.
            addit( "Attack", "!edToken~ %{selected|Attack}");
          if( Earthdawn.getAttrBN( cID, "Creature-DivingCharging_max", "0" ) != "0" )
            addit( "Charge",  "!edToken~ ForEach~ marker: divingcharging: t")
          if( Earthdawn.getAttrBN( cID, "Creature-Ambushing_max", "0" ) != "0" )
            addit( "Ambush",  "!edToken~ ForEach~ marker: ambushing: t");
          if( Earthdawn.getAttrBN( cID, "Hide-Spells-Tab", "1" ) != "1" ) {
            addit( Earthdawn.constant( "Spell" ) + "Grimoire",  "!edToken~ ChatMenu: Grimoire");
            addit( Earthdawn.constant( "Spell" ) + "Spells",  "!edToken~ ChatMenu: Spells");
          }
          if( Earthdawn.getAttrBN( cID, "Questor", "None" ) != "None" ) {
            addit( "DP-Roll", "!edToken~ %{selected|DevotionOnly}" );
            addit( "DP-T", "!edToken~ !Earthdawn~ ForEach~ marker: devpnt: t" );
          }
//log( oldab); log(newab);
                // We now have a list of old abilities and new abilities. compare them.   Ignore it if the only difference is the name, we are only care about ability actions.
                // For each thing that is not up to date, give button to fix just that.
          let oldmap = _.map( oldab, function( o ) { return o.action; });     // oldmap and newmap are JUST the actions, not the id or name. We want to test only the actions and don't care if the names are different.
          let newmap = _.map( newab, function( o ) { return o.action; });
                // We want to know oldab that are not in newab (These probably need to be removed).
          let extra = _.difference( oldmap, newmap );
          if( extra.length > 0 ) {
//log("x" ); log(oldmap); log(newmap ); log(extra);
            txt += "Unknown Token Action" + ((extra.length > 1) ? "s" : "") + " found. " + ((what == 1) ? "Do you want to remove: " : "Removing: " );
            _.each( extra, function( a ) {
              ++problems;
              let old = _.filter( oldab, function ( ab ) { return ab.action === a});
              _.each( old, function( a ) {
                if( what == 1 )   // menu entry asking if want to remove it. 
                  txt += " " + Earthdawn.makeButton( a.name, "!Earthdawn~ charID: " + po.charID + "~ abilityRebuild: removeOne: " + a.id
                        , "This will remove the named Token Action.", Earthdawn.Colors.param, Earthdawn.Colors.paramfg );
                else if( what == -1 ) {   // automatically remove it. 
                  txt += " " + a.name;
                  abiltiyRebuild( "removeOne", a.id );
                }
              });
            });
            if( txt.length > oldTlength ) {
              txt += "?<br>";
              oldTlength = txt.length
          } }
                // We want to know newab that are not in oldab (probably need to be created)
          let build = _.difference( newmap, oldmap );
          if( build.length > 0 ) {
//log("z" ); log(oldmap); log(newmap ); log(build); log(oldab); log(newab);
            txt += "Missing Token Action" + ((build.length > 1) ? "s" : "") + ". " + ((what == 1) ? "Do you want to create: " : "Creating: " );
            _.each( build, function( a ) {
              ++problems;
              let nw = _.filter( newab, function ( ab ) { return ab.action === a});
              _.each( nw, function( a ) {
                if( what == 1 )   // menu entry asking if want to create it. 
                  txt += " " + Earthdawn.makeButton( a.name, "!Earthdawn~ charID: " + po.charID + "~ abilityRebuild: buildOne: "
                        + a.name + ": " + Earthdawn.tildiFix( a.action )
                        , "This will create a Token Action for the named ability.", Earthdawn.Colors.param, Earthdawn.Colors.paramfg );
                else if( what == -1 ) {   // automatically build it. 
                  txt += " " + a.name;
                  abiltiyRebuild( "buildOne", a.id, Earthdawn.tildiFix( a.action ) );
                }
              });
            });
            if( txt.length > oldTlength ) {
              txt += "?<br>";
              oldTlength = txt.length
          } }

                  // look for duplicate token actions (they might have different names, but the action is identical). Ask if any should be deleted.
          let group = _.groupBy( oldmap, function( a ) { return a; });
          _.each( group, function( act ) {
            if( act.length > 1 ) {    // duplicates
              txt += "Duplicate Token Actions found. Do you want to delete:";
              let old = _.filter( oldab, function ( ab ) { return ab.action === act[ 0 ]});
              _.each( old, function( a ) {
                ++problems;
                if( what == 1 )   // menu entry asking if want to remove it. 
                  txt += " " + Earthdawn.makeButton( a.name, "!Earthdawn~ charID: " + po.charID + "~ abilityRebuild: removeOne: " + a.id
                        , "This will remove the named Token Action.", Earthdawn.Colors.param, Earthdawn.Colors.paramfg );
                else if( what == -1 ) {   // automatically remove it. 
                  txt += " " + a.name;
                  abiltiyRebuild( "removeOne", a.id );
                }
              });
              if( txt.length > oldTlength ) {
                txt += "?<br>";
                oldTlength = txt.length
            } }
          });
          if (problems > 0) {
            log( problems +" problems found. Details: " + txt);
          }
        } // end buildTA


        if( newChar )       // This is a brand new character, just created from roll20 or a compendium drop. 
          buildTA( -1 );
                // case addGraphic, case forceTest, and case batch   (token drop, repsecfix is run, or the GM special command is run). 
        else if( addGraphic || forceTest || batch ) {
          if ( addGraphic && (Earthdawn.getAttrBN( cID, "abilityRebuildControl", "" ) === "Never" ))
            return;     // If this character is set to never do this action on an addGraphic, exit this routine.
          buildTA( 0 );
          if( problems > 0 )      // This block just writes a chat window message and a button warning that there is a problem.
            this.chat( problems + " token actions were not as expected.   "
                + Earthdawn.makeButton( "Menu", "!Earthdawn~ charID: " + this.charID + "~ abilityRebuild: Menu"
                , "This will present a menu of options on how to deal with this.", Earthdawn.Colors.param, Earthdawn.Colors.paramfg ) + " to fix."
                , Earthdawn.whoFrom.character | Earthdawn.whoTo.player | Earthdawn.whoTo.gm | Earthdawn.whoFrom.noArchive );
        } else if ( ssa.length < 2 )
          Earthdawn.errorLog( "ED:abilityRebuild() Warning, bad SSA " + JSON.stringify( ssa ));
        else {      // We have something in ssa[1]
          switch ( Earthdawn.safeString( ssa[ 1 ] ).toLowerCase() ) {
            case "buildone":    // Rebuild a Token Action.
              if( ssa.length > 3 ) {
                let abObj = getObj( "ability", ssa[ 2 ]);
                if( abObj )       // If already there, get rid of it.
                  abObj.remove();
                Earthdawn.abilityAdd( cID, ssa[ 2 ], Earthdawn.tildiRestore( ssa[ 3 ]));
                this.chat( ssa[ 2 ] + " added.", Earthdawn.whoFrom.character | Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive );
              } else
                Earthdawn.errorLog( "ED:abilityRebuild() warning bad build: "  + JSON.stringify( ssa ), po);
            break;
            case "batchfix":
            case "fixall":     // Rebuild all Token Actions.
              buildTA( -1 );
              if( !batchFix ) this.chat( "Attempting to fix all issues. Retesting...", Earthdawn.whoFrom.character | Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive );
              this.abilityRebuild( [ "abilityRebuild", "Menu", "silent" ] );
            break;
            case "menu":    // Present a menu asking what to do about it.
              buildTA( 1 );
              if( problems > 0 )
                this.chat( Earthdawn.makeButton( "Fix All", "!Earthdawn~ charID: " + this.charID + "~ abilityRebuild: fixAll",
                        "This will delete all Token Actions for this character that use this API module and recreate them correctly.",
                        Earthdawn.Colors.param, Earthdawn.Colors.paramfg ) + "<br>"
                  + Earthdawn.makeButton( "Never", "!Earthdawn~ charID: " + this.charID + "~ abilityRebuild: Never",
                        "This button will set it so that this character will never perform this test of Token Actions again except as part of the fix/restore special function.",
                        Earthdawn.Colors.param, Earthdawn.Colors.paramfg ) + " test TA again.<br>"
                  + txt.trim(), Earthdawn.whoFrom.character | Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive );
              else if (!silent) 
                this.chat( "No problems found.", Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive, "API" );
            break;
            case "never":    // skip this routine in the future.
              Earthdawn.setWW( "abilityRebuildControl" , "Never", cID );
              this.chat( "It will no longer test the token actions when the token is dropped.", Earthdawn.whoFrom.character | Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive );
            break;
            case "removeone":    // remove one token action by name
              let abObj = getObj( "ability", ssa[ 2 ]);
              if( abObj ) {
                this.chat( abObj.get( "name" ) + " removed.", Earthdawn.whoFrom.character | Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive );
                abObj.remove();
              } else {
                this.chat( "Warning bad remove.", Earthdawn.whoFrom.character | Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive);
                Earthdawn.errorLog( "ED:abilityRebuild() warning bad remove: "  + JSON.stringify( ssa ), po);
              }
            break;
            default:
              Earthdawn.errorLog( "ED:abilityRebuild() Warning, unknown command " + JSON.stringify( ssa ));
        } }
      } catch(err) { Earthdawn.errorLog( "ED:abilityRebuild() error caught: " + err, po ); }
    } // End abilityRebuild



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
      } catch(err) { Earthdawn.errorLog( "ED.Bonus() error caught: " + err, this ); }
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

        let lu = 0;
        switch ( Earthdawn.safeString( ssa[ 1 ] ).toLowerCase() ) {
        case "jumpup":
            lu = Earthdawn.getAttrBN( this.charID, "Dex", 5, true );      // This includes All-Tests-Total.
            lu += Earthdawn.getAttrBN( this.charID, "condition-KnockedDown", "0", true ) * 3;
            lu += Earthdawn.getAttrBN( this.charID, "Jumpup-Adjust", "0", true );
            lu -= Earthdawn.getAttrBN( this.charID, "Armor-IP", 0, true ) + this.mookWounds();    // Note that this is only Armor-IP, not shield or misc mods.
        break;
        } // End switch

        lu += this.ssaMods( ssa, 2);
        this.misc[ "step" ] = ( this.misc[ "step" ] || 0) + lu;
      } catch(err) { Earthdawn.errorLog( "ED.calculateStep() error caught: " + err, this ); }
      return false;
    } // End calculateStep()



          // ParseObj.chat()
          // For handiness, we have a version of this in both edClass and edParse.
          // Just call the edClass one.
    this.chat = function ( newMsg, iFlags, customFrom ) {
      'use strict';
      this.edClass.chat( newMsg, iFlags, customFrom, this );
    }; // end chat()



          // ParseObj.ChatMenu()
          // We have a request to display a menu in the chat window.
          // attrib, damage, editspell2: (dur, MenuAddExtraThread, AddExtraThread, MenuRemoveExtraThread, RemoveExtraThread),
          // fxSet: (sequnce of submenus), gmstate / gmspecial, grimoire, help, languages, link, linkAdd1, linkAdd2, linkRemove, linkRemoveHalf,
          // oppmnvr, RolltypeEdit, RolltypeMulti, skills, spells, stateEdit, status, talents.
    this.ChatMenu = function( ssa )  {
      'use strict';
      let edParse = this;
      try {
        let lst,
          entryPoint,
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
            if( isFinite( t ) )
              return label + " " + t.toString();
          }
          return label;
        }


        switch( Earthdawn.safeString( ssa[ 1 ] ).toLowerCase()) {
          case "attrib": {
            lst = this.getUniqueChars( 1 );
            if ( Earthdawn.safeArray( lst).length === 1 )
              for( let k in lst )
                id = k;
            let spacer = " / ",
            nl = "<br>";

            s +=nl;
            addSheetButtonCall( buildLabel( "Actn Tests", "Adjust-All-Tests-Misc" ), "Adjust-All-Tests-Misc", "Adjust the modifier to all Action Tests." );
            addSheetButtonCall( buildLabel( "Attacks", "Adjust-Attacks-Misc" ), "Adjust-Attacks-Misc", "Adjust the modifier to all Close Combat Attack tests." );
            addSheetButtonCall( buildLabel( "Attack Bonuses", "Adjust-Attacks-Bonus" ), "Adjust-Attacks-Bonus", "Adjust the bonus step added to all Attacks." );
            addSheetButtonCall( buildLabel( "Damage", "Adjust-Damage-Misc" ), "Adjust-Damage-Misc", "Adjust the modifier to all Close Combat Damage tests." );
            addSheetButtonCall( buildLabel( "Bonus Damage", "Adjust-Damage-Bonus" ), "Adjust-Damage-Bonus", "Adjust the bonus step to all Damage rolls." );
            addSheetButtonCall( buildLabel( "Defenses", "Adjust-Defenses-Misc" ), "Adjust-Defenses-Misc", "Adjust the modifier to Physical and Mystic (but not Social) Defenses." );
            addSheetButtonCall( buildLabel( "Efct Tests", "Adjust-Effect-Tests-Misc" ), "Adjust-Effect-Tests-Misc", "Adjust the modifier to all Effect Tests." );
            addSheetButtonCall( buildLabel( "TN", "Adjust-TN-Misc" ), "Adjust-TN-Misc", "Adjust the modifier to all Action Target Numbers." );

            s += nl + buildLabel( "PD" ) + " ";
            addSheetButtonCall( buildLabel( "Buff", "PD-Buff" ), "PD-Buff", "Adjust the modifier to Physical Defense." );
            s += spacer + buildLabel( "MD" ) + " ";
            addSheetButtonCall( buildLabel( "Buff", "MD-Buff" ), "MD-Buff", "Adjust the modifier to Mystic Defense." );
            s += spacer + buildLabel( "SD" ) + " ";
            addSheetButtonCall( buildLabel( "Buff", "SD-Buff" ), "SD-Buff", "Adjust the modifier to Social Defense." );
            s += spacer + buildLabel( "PA", "Physical-Armor" ) + " ";
            addSheetButtonCall( buildLabel( "Buff", "PA-Buff" ), "PA-Buff", "Adjust the modifier to Physical Armor." );
            s += spacer + buildLabel( "MA", "Mystic-Armor" ) + " ";
            addSheetButtonCall( buildLabel( "Buff", "MA-Buff" ), "MA-Buff", "Adjust the modifier to Mystic Armor." );
            s += nl + buildLabel( "Move", "Movement" ) + spacer;
            s += buildLabel( "Wnds", "Wounds" ) + spacer;
            s += buildLabel( "Dmg", "Damage" ) + spacer;
            if( id )
              s += "Unc " + Earthdawn.getAttrBN( id, "Damage-Unc-Rating", 20 ).toString() + spacer;
            s += buildLabel( "Dth", "Damage-Death-Rating" ) + spacer;
            s += buildLabel( "W Thr", "Wound-Threshold" ) + spacer;
            s += buildLabel( "Karma" ) + spacer;
            if( id )
              s += "K max " + Earthdawn.getAttrBN( id, "Karma_max", 0 ).toString() + spacer;
            s += buildLabel( "DP" ) + spacer;
            if( id )
              s += "DP max " + Earthdawn.getAttrBN( id, "DP_max", 0 ).toString() + spacer;
            s += nl;
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
            s += nl;
            s += Earthdawn.makeButton( buildLabel( "Init", "Initiative"), "!edToken~ " + Earthdawn.constant( "percent" ) + "{selected|Dex-Initiative-Check}",
                  "Roll Initiative for this character.", Earthdawn.Colors.effect, Earthdawn.Colors.effectfg );
            s += Earthdawn.makeButton( "JumpUp", "!edToken~ " + Earthdawn.constant( "percent" ) + "{selected|JumpUp}",
                  "Make a jump-up test. 2 strain, Target #6", Earthdawn.Colors.action, Earthdawn.Colors.actionfg );
            let x;
            if( id )
              x = this.getValue("Knockdown", id) + this.getValue("Adjust-Effect-Tests-Total", id);

            s += Earthdawn.makeButton( "Knockdown" + (x ? " " + x.toString() : ""),
                  "!edToken~ " + Earthdawn.constant( "percent" ) + "{selected|Knockdown}", "Make a standard Knockdown test.", Earthdawn.Colors.action, Earthdawn.Colors.actionfg );

            s += Earthdawn.makeButton( buildLabel( "Recovery", "Recovery-Step" ),
                  "!edToken~ " + Earthdawn.constant( "percent" ) + "{selected|Recovery}", "Make a Recovery test for this character.", Earthdawn.Colors.health, Earthdawn.Colors.healthfg );
            if( id )
              x = this.getValue("Recovery-Step", id) + this.getValue("Wil", id);
            s += Earthdawn.makeButton( "Recov Stun" + (x ? " " + x.toString() : ""),
                  "!edToken~ " + Earthdawn.constant( "percent" ) + "{selected|RecoveryStun}", "Make a Stun Damage only Recovery test for this character.", Earthdawn.Colors.health, Earthdawn.Colors.healthfg );
            s += Earthdawn.makeButton( "New Day", "!Earthdawn~ charID: " + Earthdawn.constant( "at" ) + "{selected|character_id}~ ForEach: c~ Misc: NewDay",
                  "Set characters recovery tests used to zero and refill karma to max", Earthdawn.Colors.health, Earthdawn.Colors.healthfg );
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
            s += Earthdawn.makeButton( "PA", "!Earthdawn~ foreach: st~ Damage: ?{Damage)|1}: ?{Type of damage|Damage|Stun} : PA",
                  "The Selected Token(s) take damage. Physical Armor applies.", Earthdawn.Colors.health, Earthdawn.Colors.healthfg );
            s += Earthdawn.makeButton( "MA", "!Earthdawn~ foreach: st~ Damage: ?{Damage)|1}: ?{Type of damage|Damage|Stun} : MA",
                  "The Selected Token(s) take damage. Mystic Armor applies.", Earthdawn.Colors.health, Earthdawn.Colors.healthfg );
            s += Earthdawn.makeButton( "NA", "!Earthdawn~ foreach: st~ Damage: ?{Damage)|1}: ?{Type of damage|Damage|Stun|Strain} : NA",
                  "The Selected Token(s) take damage. No Armor applies.", Earthdawn.Colors.health, Earthdawn.Colors.healthfg );
            s += Earthdawn.makeButton( "Other", "!Earthdawn~ foreach: st~ Damage: ?{Damage)|1}: ?{Type of damage|Damage|Stun|Strain} : ?{Armor| None,NA| Physical,PA| Mystic,MA| Nat PA,PA-Nat| Nat MA,MA-Nat}",
                  "The Selected Token(s) take damage, which might be of type Stun, Strain, or Normal. Armors may be applied.", Earthdawn.Colors.health, Earthdawn.Colors.healthfg );
            s += Earthdawn.makeButton( "1 Strain", "!Earthdawn~ foreach: st ~ Damage: Strain: 1: Verbose",
                  "The Selected Token(s) take 1 strain.", Earthdawn.Colors.health, Earthdawn.Colors.healthfg );
            s += Earthdawn.makeButton( "X Strain", "!Earthdawn~ foreach: st~ Damage: Strain: ?{How much Strain|2} : Verbose",
                  "The Selected Token(s) take 1 strain.", Earthdawn.Colors.health, Earthdawn.Colors.healthfg );
            s += "<br>Give Dmg to Target Token - ";
            s += Earthdawn.makeButton( "PA", "!Earthdawn~ setToken: @{target|token_id}~ Damage: ?{Damage)|1}: ?{Type of damage|Damage|Stun} : PA",
                  "Give damage to a Target token. Physical Armor applies.", Earthdawn.Colors.damage, Earthdawn.Colors.damagefg );
            s += Earthdawn.makeButton( "MA", "!Earthdawn~ setToken: @{target|token_id}~ Damage: ?{Damage)|1}: ?{Type of damage|Damage|Stun} : MA",
                  "Give damage to a Target token. Mystic Armor applies.", Earthdawn.Colors.damage, Earthdawn.Colors.damagefg );
            s += Earthdawn.makeButton( "NA", "!Earthdawn~ setToken: @{target|token_id}~ Damage: ?{Damage)|1}: ?{Type of damage|Damage|Stun|Strain} : NA",
                  "Give damage to a Target token. No Armor applies.", Earthdawn.Colors.damage, Earthdawn.Colors.damagefg );
            s += Earthdawn.makeButton( "Other", "!Earthdawn~ setToken: @{target|token_id}~ Damage: ?{Damage)|1}: ?{Type of damage|Damage|Stun|Strain} : ?{Armor| None,NA| Physical,PA| Mystic,MA| Nat PA,PA-Nat| Nat MA,MA-Nat }",
                  "Give damage to a Target token, which might be of type Stun, Strain, or Normal. Armors may be applied.", Earthdawn.Colors.damage, Earthdawn.Colors.damagefg );
            s += "<br>Roll Dmg - ";
            s += Earthdawn.makeButton( "Fire", "!Earthdawn~ Quick: Fire: ?{Size of fire|Torch,Torch: 4|Small Campfire,Small Campfire: 6"
                  + "|Large Campfire,Large Campfire: 8|House fire,House fire: 10|Forest fire,Forest fire: 12}~ foreach: st~ Roll", 
                  "The Selected Token(s) take Fire damage. Physical Armor applies.", Earthdawn.Colors.health, Earthdawn.Colors.healthfg );
            s += Earthdawn.makeButton( "Fall", "!Earthdawn~ Quick: Fall: "
                  + "?{Distance Fallen|2-3 Yrd,2-3: 5|4-6 Yrd,4-6: 10|7-10 Yrd,7-10: 15|11-20 Yrd,11-20: 20 (2)|21-30 Yrd,21-30: 25 (2)|31-50 Yrd,31-50: 25 (3)"
                  + "|51-100 Yrd,51-100: 30 (3)|101-150 Yrd,101-150: 30 (4)|151-200 Yrd,150-200: 35 (4)|201 Yrd or more,201 or more: 35 (5)}~ foreach: st~ Roll",
                  "The Selected Token(s) take Falling damage. No Armor applies.", Earthdawn.Colors.health, Earthdawn.Colors.healthfg );
            lst = this.getUniqueChars( 1 );
            if ( Earthdawn.safeArray( lst).length === 1 )
              for( let k in lst )
                id = k;
            if (id) {
              let t = "", t1 = "",
                attributes = findObjs({ _type: "attribute", _characterid: id });
              _.each( attributes, function (att) {
                if (att.get("name").endsWith( "_WPN_Name" ))
//                   if( Earthdawn.getAttrBN(id, att.get( "name" ).slice( 0, -5) + "_CombatSlot", "0") != "1")
                    t += Earthdawn.makeButton( att.get( "current" ),
                        "!edToken~ " + Earthdawn.constant( "percent" ) + "{" + id + "|" + Earthdawn.safeString( att.get( "name" )).slice(0, -4) + "Roll}",
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
                this.setWW( nm + "Duration", dur );
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
                let et = "," + Earthdawn.safeString( aobj.get( "current" )) + ",";
                if( et.length < 4 )
                  et = ",";
                Earthdawn.set( aobj, "current", (et + Earthdawn.safeString( ssa[ 4 ] ) + ",").slice( 1, -1 ));
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
                let et = "," + Earthdawn.safeString( aobj.get( "current" )).trim() + ",";
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
                if( Earthdawn.safeString( ssa[ 7 ]).startsWith( "Custom" ) ) {
                  let cust = findObjs({ _type: 'custfx', name: Earthdawn.safeString( ssa[ 7 ]).slice( 7 ).trim() })[0];
                  if( cust && cust.get( "_id" )) {
                    ssa[ 8 ] = "";    // This is to fall though to the next question with this question left blank.
                    ssa[ 2 ] = Earthdawn.parseInt2( submenu ) + 2;
                    already = ssa.join( ":" );
                  } else {
                    this.chat( "Error! Can not find a Custom FX of name: '" + Earthdawn.safeString( ssa[ 7 ]).slice(7) + "'.", Earthdawn.whoFrom.apiWarning | Earthdawn.whoFrom.noArchive );
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
                let typ = Earthdawn.safeString( ss2[ 5 ] ).toLowerCase();
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
              this.chat( "Only GM can do this!", Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "gmState" );
            else {
              let t = JSON.parse( JSON.stringify( state.Earthdawn ) );      // To get a deep copy, turn it into a string and back into an object.
              t.RollType = undefined;     // We want to get rid of RollType from the initial listing, since it can be very long and has its own section. 
              s += JSON.stringify( t ) + "   ";
//              s += Earthdawn.makeButton("RollType", "!Earthdawn~ ChatMenu: RollType: Menu",
//                  "Determine the visibility of different roll results by type. For example some rolls might be public, others might be displayed to GM only." ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
              s += Earthdawn.makeButton("Rolltype Editor", "!Earthdawn~ ChatMenu: RolltypeEdit: state.Earthdawn.Rolltype: : Display",
                  "Change Rolltype. Change defaults, add or remove exceptions, Set an override." ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);

              s += Earthdawn.makeButton("Result Style", "!Earthdawn~ Misc: State: Style: ?{What roll results style do you want|Vague Roll Result,2|Vague Success (not recommended),1|Full,0}",
                  "Switch API to provide different details on roll results. Vague Roll result is suggested. It does not say what the exact result is, but says how much it was made by. Vague Success says exactly what the roll was, but does not say the TN or how close you were." ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
//              s += Earthdawn.makeButton("Default RollType", "!Earthdawn~ Misc: State: ?{What category of character do you want to change|NPC|Mook|PC}: ?{Should new characters of that type default to Public or GM Only rolls|Public,0|GM Only,1}",
//                  "By default, PCs default to public rolls, but NPCs and Mooks default to rolls visible only by the GM. This can be changed." ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
              s += Earthdawn.makeButton("Show Dice", "!Earthdawn~ Misc: State: showDice: ?{Show roll results dice on seperate line|False,0|True,1}",
                  "If True dice roll details are displayed as a seperate line. Otherwise they are in the tooltip of the yellow Results box." ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
              s += Earthdawn.makeButton("Change Edition", "!Earthdawn~ Misc: State: edition: ?{What rules Edition|Earthdawn Forth Ed,4 ED|1879 1st Ed,-1 1879|Earthdawn Third Ed,3 ED|Earthdawn First Ed,1 ED}",
                  "Switch API and Character sheet to Earthdawn 1st/3rd/4th Edition or 1879 1st Edition. Note this NEEDs to also be done in campaign default sheet settings." ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
//              s += Earthdawn.makeButton("Default Karma Ritual", "!Earthdawn~ Misc: State: KarmaRitual: ?{What should the default for each new characters Karma Ritual be set to?|Fill to max,-1|Refill by Circle,-2|Refill by Racial Modifier,-3|Refill Nothing,0|Refill 1,1|Refill 2,2|Refill 3,3|Refill 4,4|Refill 5,5|Refill 6,6|Refill 7,7|Refill 8,8|Refill 9,9|Refill 10,10}",
//                  "At charcter creation each charcters Karma Ritual behavior is set to this value. By default, The 'New Day' button refills a characters Karma pool up to Full." ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
              s += Earthdawn.makeButton("Curse Luck Silent", "!Earthdawn~ Misc: State: CursedLuckSilent: ?{Does the Cursed Luck Horror power work silently|No,0|Yes,1}?{Does No-pile-on-dice work silently|No,0|Yes,1}?{Does No-pile-on-step work silently|No,0|Yes,1}",
                  "Normally the system announces when a dice roll has been affected by Cursed Luck. However the possibility exists that a GM might want it's effects to be unobtrusive. When this is set to 'yes', then the program just silently changes the dice rolls." ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
              s += Earthdawn.makeButton("No Pile on - Dice", "!Earthdawn~ Misc: State: NoPileonDice: ?{Enter max number of times each die may explode. -1 to disable|-1}",
                  "If a GM desires a less lethal game, or to reduce risk in specific encounters, they can use this option to keep NPC dice from exploding too many times. This controls the maximum number of times a single dice can 'explode' (be rolled again after rolling a max result). -1 is the standard default of unlimited. "
                  + "0 means no dice will ever explode. 2 (for example) means a dice can explode twice, but not three times. This is done quietly, without announcing it to the players." ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
              s += Earthdawn.makeButton("No Pile On - Step", "!Earthdawn~ Misc: State: NoPileonStep: ?{Enter multiple of step number to limit result to. -1 to disable|-1}",
                  "If a GM desires a less lethal game, or to reduce risk in specific encounters, they can use this option to keep NPC roll results from exceeding a specific multiple the step number. If zero or -1, this is disabled and roll results are unlimited. if 1, then the dice result will never be very much greater than the step result. "
                  + "If (for example) the value is 3.5, then the result will never get very much greater than 3.5 times the step being rolled. This is done quietly, without announcing it to the players." ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
              s += Earthdawn.makeButton("API Logging", "!Earthdawn~ Misc: State: ?{What API logging event should be changed|LogStartup|LogCommandline|LogMsg}: ?{Should the API log this event|Yes,1|No,0}",
                  "What API events should the API log to the console?" ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
              s += Earthdawn.makeButton("Version", "!Earthdawn~ Misc: State: ?{API version or HTML version|API|HTML}: ?{Version number to store}",
                  "You can change the html or javascript version number stored in the state. This can force character sheet update routines to be run next startup." ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
              s += Earthdawn.makeButton("ToAPI", "!Earthdawn~ Misc: toAPI: ?{Remove API|Never Mind|Set Characters noAPI,Set|Fully remove API,noAPI}",
                  "FromAPI will set all sheets to use noAPI buttons and remove all Earthdawn state variables (can be run just before deactivating API or uninstalling sheet to clean things up)" ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
              s += Earthdawn.makeButton("Verify/Fix All", "!Earthdawn~ Debug: ?{Do you want to run Verify Fix on ALL characters (use Special Function to run on just one sheet). Have console log open to see results.|Cancel|Yes but ask about each fix,RepSecBatch|Yes and automatically fix them,RepSecBatchFixAll}",
                  "Verify/Fix All sheets will run a routine for each character that will check all attributes looking for problems and fixing what it can." ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
              s += Earthdawn.makeButton("Set all attribute", "!Earthdawn~ Debug: SetAttribAll: ?{Attribute name} : ?{Attribute Value}: ?{Confirm really do this|No|Yes}",
                  "Go through every character in the whole campaign and set a variable to the same value." ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
              s += Earthdawn.makeButton("State Editor", "!Earthdawn~ ChatMenu: StateEdit: state.Earthdawn: : Display",
                  "A general state editor. Can change anything in the state variable." ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
//              s += Earthdawn.makeButton("ToAPI", "!Earthdawn~ Misc: toAPI: ?{Set all characters to use API or noAPI|API|noAPI}",
//                  "ToAPI will set all sheets to use API. FromAPI will set all sheets to use noAPI buttons and remove all Earthdawn state variables (can be run just before deactivating API or uninstalling sheet to clean things up)" ,Earthdawn.Colors.param ,Earthdawn.Colors.paramfg);
              this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "gmState" );
          } } break;  // end gmstate and gmspecial
          case "grimoire": {
            lst = this.getUniqueChars( 1 );
            for( let k in lst ) {
              id = k;
              let attributes = findObjs({ _type: "attribute", _characterid: id });
              s = "";
              let attflt= attributes.filter( function (att) { return att.get( "name" ).endsWith( "_SPP_Name" )});
              _.each( attflt, function ( att ) {
                  let tmpPre = Earthdawn.buildPre( att.get( "name" ));
                 s += Earthdawn.makeButton( att.get("current"),
                      "!edToken~ " + Earthdawn.constant( "percent" ) + "{" + id + "|" + tmpPre + "Load}"
                      , "Load Preset "
                      //+ Earthdawn.getAttrBN( id, tmpPre + "Preset", "")
                      ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg);
              }); // End for each attribute.
              if(s.length>0)
                this.chat( "What Spell Preset ?" + s, Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive,  getAttrByName( id, "character_name" ) + " - Grimoire" );
              s = "What Spell? ";
              attflt= attributes.filter( function (att) { return att.get( "name" ).endsWith( "_SP_Name" )});
              _.each( attflt, function ( att ) {
                  let tmpPre = Earthdawn.buildPre( att.get( "name" ));
                  let matrix = Earthdawn.getAttrBN( id, tmpPre + "spmRowID", "0" );
                  let bnot = (typeof matrix !== 'string') || (matrix.length < 2);
                  if( Earthdawn.getAttrBN( id, tmpPre+"Type","Spell") =="Spell") { //Only display Spells, not Knacks and Binding Secrets
                 s += Earthdawn.makeButton( att.get("current"),
                      "!edToken~ " + Earthdawn.constant( "percent" ) + "{" + id + "|" + tmpPre + "Roll}"
                      , (bnot ? "" :"Spell in Matrix, use the Spells Menu instead! - ")
                      + Earthdawn.getParam( Earthdawn.getAttrBN( id, tmpPre + "DisplayText", ""), 1, "~") + " "
                      + Earthdawn.getParam( Earthdawn.getAttrBN( id, tmpPre + "SuccessText", ""), 1, "~")
                      , bnot ? Earthdawn.Colors.param : Earthdawn.Colors.param2, bnot ? Earthdawn.Colors.paramfg : Earthdawn.Colors.param2fg );
                }
              }); // End for each attribute.
              this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive,  getAttrByName( id, "character_name" ) + " - Grimoire" );
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
                          getAttrByName( id, "character_name" ) + " - Languages" );
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
// debug code
//if( ssa[ 5 ].length < 2 ) ssa[5] = "Air Sailor";
            if( ssa.length < 6 || !ssa[ 2 ] || !ssa[ 3 ] || !ssa[ 4 ] || ssa[ 5 ].length < 2 ) {  // Make sure got a valid command line.
              this.chat( "Error! linkadd1 not correctly formed.", Earthdawn.whoFrom.apiError );
              log( ssa );
              return;
            }
            let attrib = (ssa[ 4 ] === "Attribute"),    skipmost = false;
            if( attrib ) {      // Check for the "real" attributes first, and if you find one, don't search for any more.
              let tar = [ "dex", "str", "tou", "per", "wil", "cha" ],
                t = Earthdawn.safeString( ssa[ 5 ] ).toLowerCase(),
                effect = ( t.indexOf( "-effect" ) !== -1 ),
                step = ( t.indexOf( "-step" ) !== -1 );
              for( let i = 0; i < tar.length; ++i )
                if( t.indexOf( tar[ i ] ) !== -1 ) {
                  ssa[ 5 ] = Earthdawn.safeString( tar[ i ].slice(0, 1)).toUpperCase() + tar[ i ].slice( 1 ) + (effect ? "-Effect" : "") + (step ? "-Step" : "");
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
                  strMatch = Earthdawn.safeString( ssa[ 5 ] ).toLowerCase();
                _.each( attributes, function (att) {
                  if( Earthdawn.safeString( att.get("name")).endsWith( lookfor ) && Earthdawn.safeString( att.get( "current")).toLowerCase().indexOf( strMatch ) != -1)
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
          case "linkadd2": {      // User has pressed a button telling us which exact one to link to OR we fell through from above due to only finding only one candidate.
                  // Here we do the actual linking.
                  // ChatMenu: linkadd2: (code: T, NAC, SK, SPM, WPN): (rowID): (Attribute, T, SK, DSP, TI, or WPN): link rowID or attribute name
                  // First code/rowID combo is row that is making link (getting a value).
                  // Second code/rowID combo is row that is being linked to (providing a value).
                  // Can make a link   T, NAC, SK,   SPM,  WPN
                  // Can link to    T, SK, WPN, DSP, TI, attributes???.  Maybe static talents.         // note removed NAC
            if( ssa.length < 6 || !ssa[ 2 ] || !ssa[ 3 ] || !ssa[ 4 ] || ssa[ 5 ].length < 2 ) {  // Make sure got a valid command line.
              this.chat( "Error! linkadd2 not correctly formed.", Earthdawn.whoFrom.apiError );
              log( ssa );
              return;
            }
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
                  Earthdawn.errorLog( "Warning! internal data mismatch in linkadd2.", edParse);
                  log( dlst );
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

              let sflag = false;
              if( linkName.startsWith( "repeating_" ) ) {
                let code = Earthdawn.repeatSection( 3, linkName )
                if( code === "T" || code === "NAC" || code === "SK" || code === "WPN" || code === "SPM" )
                  sflag = true;
              } else
                sflag = true;
              if( sflag )
//{
//                edParse.addSWflag( "Trigger2", linkName );
                edParse.toSheet( "Trigger2", linkName );
//log(333); log(linkName);}

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
                l);   // LinksGetValue are of form comma delimited list of fully qualified attributes, maybe more than one separated by plus signs.
            if( !att )      // LinksProviceValue are comma delimited lists of form (code);(rowID).
              linkAdd( Earthdawn.buildPre( ssa[ 4 ], ssa[ 5 ]) + "LinksProvideValue",
                    Earthdawn.getAttrBN( this.charID, Earthdawn.buildPre( ssa[ 2 ], ssa[ 3 ] ) + "Name", "" ).replace( /[\,|\+]/g, ""),
                    ssa[ 2 ] + ";" + ssa[ 3 ]);
            this.chat( "Linked " + ssa[ 4 ] + "-" + t, Earthdawn.whoFrom.apiWarning | Earthdawn.whoFrom.noArchive, "API" );
//            this.sendSWflag();
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
                  Earthdawn.errorLog( "Warning! internal data mismatch in linkRemove.", edParse);
                  log( dlst );
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

              let sflag = false;
              if( linkName.startsWith( "repeating_" ) ) {
                let code = Earthdawn.repeatSection( 3, linkName )
                if( code === "T" || code === "NAC" || code === "SK" || code === "WPN" || code === "SPM" )
                  sflag = true;
              } else
                sflag = true;
              if( sflag )
//                edParse.addSWflag( "Trigger2", linkName );
                edParse.toSheet( "Trigger2", linkName );
            } // end linkRemove


            if( Earthdawn.safeString( ssa[ 1 ] ).toLowerCase() === "linkremovehalf") {
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
//            this.sendSWflag();
          } break;  // end linkRemove
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

            let sectPlayer = new HtmlBuilder( "", "", {
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
                    d = Earthdawn.getAttrBN( cID, pre + "Desc", "").replace(/\n/g, "   ");
                  if( n.length > 0 || d.length > 0 )
                    makeButtonLocal( n, "Custom" + arr[ i ], ": ?{How many successes to spend on this maneuver|1}", d.replace( "\n", "   ") );
            } } }
            sectPlayer.append( "", t);
            this.chat( "Opponent Maneuvers " + sectPlayer.toString(), Earthdawn.whoTo.gm | Earthdawn.whoTo.player | Earthdawn.whoFrom.player | Earthdawn.whoFrom.character | Earthdawn.whoFrom.noArchive); // added the GM : objective is to have the GM see the buttons pushed in combat to help novice players
          } break;  // end oppmnvr
          case "skills": {      // List out all skills
                        // Called from a macro Token action (visible when any character is selected).
            lst = this.getUniqueChars( 1 );
            for( let k in lst ) {
              id = k;
              let s1 = [], s2 = [], s3 = [];
              s = "";
                                          // go through all attributes for this character and look for ones we are interested in
              let attributes = findObjs({ _type: "attribute", _characterid: id });
              _.each( attributes, function (att) {
                if (att.get("name").endsWith( "_SK_Name" )) {
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
              this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive, getAttrByName( id, "character_name" ) + " - Skills" );
            }
          } break;  // end Skills
          case "spells": {      // List out all the spellcasting skills, spells in matrix, and spells in grimour.
                        // Called from a macro Token Action. Visible when a character who does not have spells hidden is selected.
            lst = this.getUniqueChars( 1 );
            let s2 = "";
            for( let k in lst ) {
              id = k;
              s = "";

              let attributes = findObjs({ _type: "attribute", _characterid: id });
              _.each( attributes, function (att) {      // First we are listing all the spellcasting Talents.
                if (att.get( "name" ).endsWith( "_T_Special" ) && att.get( "current" ).startsWith( "SPL-" )){
                  let pre = Earthdawn.buildPre(att.get( "name" ));
                  s += Earthdawn.makeButton( getAttrByName( id, pre + "Name" ), "!edToken~ " + Earthdawn.constant( "percent" )
                        + "{" + id + "|" + pre + "Roll}"
                        , Earthdawn.getParam( Earthdawn.getAttrBN( id, pre + "DisplayText", "" ), 1, "~") + " "
                        + Earthdawn.getParam( Earthdawn.getAttrBN( id, pre + "SuccessText", "" ), 1, "~")
                        , att.get("current").endsWith("Willforce") ? Earthdawn.Colors.effect
                        : Earthdawn.Colors.action,att.get("current").endsWith("Wilforce") ? Earthdawn.Colors.effectfg: Earthdawn.Colors.actionfg );
                }
                if (att.get("name").endsWith( "_SPM_Contains" ))    // Then all the spells in the grimoire
                  s2 += Earthdawn.makeButton( att.get("current"), "!edToken~ " + Earthdawn.constant( "percent" ) + "{" + id + "|"
                      + Earthdawn.buildPre( "SPM", att.get("name")) + "Roll}"
                      , Earthdawn.getParam( Earthdawn.getAttrBN( id, Earthdawn.buildPre( att.get("name")) + "DisplayText", "" ), 1, "~") + " "
                      + Earthdawn.getParam( Earthdawn.getAttrBN( id, Earthdawn.buildPre( att.get("name")) + "SuccessText", "" ), 1, "~")
                      , Earthdawn.Colors.param, Earthdawn.Colors.paramfg );
              }); // End for each attribute.
            }
            this.chat( s.trim() + "<br>" + s2.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive, "Spells" );
          } break;  // end Spells
          case "rolltypeedit":  // specialized case of stateedit.
            entryPoint = 2;
          case "stateedit" : {  // a general purpose state editor. Other options in GM Special commands change specific state values. With this you can add, change or remove ANY state value or collection.
                                // chatMenu: stateEdit: (scope): (unused): Display:
                                    // write all of the scope to the chat menu, and if not at top level (state) give button to go up a level. 
                                    // Also give a button to go down into each lower level that is already a collection.
                                    // and give buttons to add a new sub-level, and add a new value.
                                // chatMenu: stateEdit: (scope): : Up.  Go up one level of scope and then do a Display.
                                // chatMenu: stateEdit: (2)(scope): (3) (name): (4) Add: (5)Type: (6)value (string and number only)
                                // chatMenu: stateEdit: (2)(scope): (3) (name): (4) Change: (5)value (string and number only)
                                // chatMenu: stateEdit: (scope): (name) : Delete
            if( !playerIsGM( this.edClass.msg.playerid ) )
              this.chat( "Only GM can do this stuff!", Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "gmState" );
            else {
              if( entryPoint === undefined ) entryPoint = 1;
              let scope = ssa[ 2 ].trim(),
                  name = ssa[ 3 ].trim(),
                  currentScope,
                  up = 0;
              let walk = scope.split( "." );

              function walkit( s ) {      // get a pointer to a subset of state that only holds scope. If scope is state.Earthdawn.Rolltype.NPC, then currentScope would only hold NPC and it's values.
                let cs = s;
                for( let i = 1; i < (walk.length - up); ++i )
                  if( walk[ i ] in cs )
                    cs = cs[ walk[ i ]];
                  else {
                    edParse.chat( "Warning! internal data mismatch in stateEdit.  " + walk[ i ] + " not found.", Earthdawn.whoFrom.apiError);
                    return;
                  }
                return cs;
              }

              function change( whereFrom, value, type ) {      // get a value of the correct type, ready to be set into currentScope[name] (defined external). 
                    // wherefrom 1 = addArray, 2 = add, 3 = edit.
              let r, t2, set = (whereFrom !== 1), doMsg = (whereFrom !== 1), recursive = false, fake = false;
                if( type === undefined )
                  if((typeof (currentScope[ name ])) !== undefined )
                    type = typeof (currentScope[ name ]);
                  else if( value !== undefined )
                    type = typeof value;
                if( type === "object" && Array.isArray( currentScope[ name ] )) 
                  type = "array";                  

                switch( Earthdawn.safeString( type ).toLowerCase()) {
                  case "number":
                    r = ( Earthdawn.safeString( value ).indexOf( "." ) == -1 ) ? Earthdawn.parseInt2( value ) : parseFloat( value );
                    t2 = r;
                    break;
                  case "null":
                    r = null;
                    t2 = "null";
                    break;
                  case "undefined":
                    r = undefined;
                    t2 = "undefined";
                    break;
                  case "string":
                    r = Earthdawn.safeString( value ).trim();
                    t2 = r;
                    break;
                  case "boolean":
                    if( value === "true" || value == "1" )
                      r = true;
                    else
                      r = false;
                    t2 = r.toString();
                    break;
                  case "boolean true":
                    r = true;
                    t2 = "true";
                    break;
                  case "boolean false":
                    r = false;
                    t2 = "false";
                    break;
                  case "array":
                    r = [];           // Here an array is simply set to empty. Adding and removing properties are other routines.
                    t2 = "empty array";
                    fake = true;
                    break;
                  case "object":
                    r = {};           // Here an object is simply set to empty. Adding and removing properties are other routines.
                    recursive = true;
                    t2 = "empty object";
                    fake = true;
                    break;
                  default: 
                }

                if( set || fake )   // AddArray does its own setting. Add and Edit are set here. 
                  currentScope[ name ] = r;
                if( doMsg || fake )
                  edParse.chat( name + " changed to " + t2, Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "gmStateEdit" );
                if( recursive )
                  edParse.ChatMenu( ["ChatMenu", "StateEdit", scope + "." + name, "", "Display" ] );   // recursive call with the new scope.

                return fake ? "fake" : r;
              } // end change()

                    // chatMenu, stateEdit, (2) scope, (3) property name to operate on, ***(4)*** subcommand, (others). 
              switch( Earthdawn.safeString( ssa[ 4 ] ).toLowerCase()) {
                case "up":
                  up = 1;
                case "in":   // chatMenu: stateEdit: (scope): In: (a key to be added to scope).
                  if( !up ) {    // if we are in in, without falling down from up.
                    scope += "." + name;
                    walk.push( name );
                  }
                case "display": {   // chatMenu: stateEdit: (scope): : Display:

                  function tipText( k ) {
                    let t4;
                    switch( k ) {
                      case false:
                      case "No Override":       t4 = "Override not in effect. Dice Rolls sent as specified in defaults and exceptions.";  break;
                      case "GM Only":           t4 = "Dice Rolls sent to GMs only. Useful for making test rolls with monsters.";  break;
                      case "Public":            t4 = "Dice Rolls sent to everybody."; break;
                      case "Player and GM":     t4 = "Dice Rolls sent to Player and GM but not to anybody else.";   break;
                      case "Controlling Only":  t4 = "Dice Rolls sent only to the Player who requested the roll. Useful for a GM making test rolls with monsters.";   break;
                      case "Sheet":             t4 = "Turn this feature off, and send Dice Rolls where the sheet tells them to using the old system.";    break;
                      default:                  t4 = "rolltypeedit data mismatch " + k;
                    }
                    return t4;
                  }

                  currentScope = walkit( state );
                  if( entryPoint === 2 ) {    // RolltypeEdit
                    if( scope.endsWith( "PC" )) {    // We are in the PC or NPC section.
                      s += "<b>" + scope + "</b> " + "<br> ";
                      s += Earthdawn.makeButton( "Back to main level."    // + walk.slice( 0, -1).join( ".")
                            ,"!Earthdawn~ ChatMenu: rolltypeEdit: " + walk.slice( 0, -1).join( "." ) + ": : Display"
                            ,"Move back to the Rolltype root." ,Earthdawn.Colors.param, Earthdawn.Colors.paramfg );
                      s += Earthdawn.makeButton( "Default", "!Earthdawn~ ChatMenu: rolltypeEdit: " + scope + ": Default: Change : "
                            + "?{Change Dice Roll Display Default to|Public|GM Only|Player and GM|Controlling Only}", 
                            + "Change Default Dice Roll display."
                            ,Earthdawn.Colors.param, Earthdawn.Colors.paramfg )
                            + " " + currentScope[ "Default" ] + " ";
                      Object.entries( currentScope[ "Exceptions" ] ).forEach(([key, val]) => {
                        s += Earthdawn.makeButton( val[ "name" ]
                              ,"!Earthdawn~ ChatMenu: rolltypeEdit: " + scope + ": " + key + ": " 
                              + "?{Edit or Delete|Edit, exceptionEdit "
                              + ": ?{change roll display to" +  Earthdawn.constant( "pipe", 2 ) + "Public" +  Earthdawn.constant( "pipe", 2 ) + "GM Only" 
                              + Earthdawn.constant( "pipe", 2 ) + "Player and GM" +  Earthdawn.constant( "pipe", 2 ) + "Controlling Only" 
                              + Earthdawn.constant( "braceClose", 2 ) + "|Delete, exceptionDelete}"
                              ,"Edit or Delete exception." ,Earthdawn.Colors.param, Earthdawn.Colors.paramfg );
                        s += " " + val[ "display" ] + " ";
                      });   // end foreach exception();
                      s += Earthdawn.makeButton( "Add new Exception", "!Earthdawn~ ChatMenu: rolltypeEdit: " + scope + ": " 
                            + "?{Talent Skill or Knack name (exactly as it appears in the roll header)}: exceptionAdd : "
                            + "?{Display|Public|GM Only|Player and GM|Controlling Only}", 
                            + "Add a new exception."
                            ,Earthdawn.Colors.param, Earthdawn.Colors.paramfg );
                      s += Earthdawn.makeButton( "Refresh",
                            "!Earthdawn~ ChatMenu: rolltypeEdit: " + scope + ": : Display",
                            "Display this again, so that you can see what has changed." ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg );
                    } else {    // We are in the main menu. 
                      s += "<b>" + scope + "</b> " + "<br> ";
                      s += Earthdawn.makeButton( "Override", "!Earthdawn~ ChatMenu: StateEdit: " + scope + ": Override: Change :"
                            + "?{Change Dice Roll Override to|No Override, false: boolean|GM Only, GM Only: string|Public, Public: string|"
                            + "Player and GM, Player and GM: string|Controlling Only, Controlling Only: string}"
                            , "Change Override. Force all Dice Rolls to go to ther override destination. " 
                            + "Useful when testing monsters and you don't want the players to see the rolls." 
                            ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg );
                      s += Earthdawn.makeButton( currentScope[ "Override" ] === false ? "None" : currentScope[ "Override" ]
                            , "", tipText( currentScope[ "Override" ] ), Earthdawn.Colors.dflt, Earthdawn.Colors.dfltfg );    // This button does not do anything, it just providees a place to hang a tooltip.
                      [ "PC", "NPC" ].forEach( function( what ) {
                        'use strict';
                        s += "<br>";
                        s += Earthdawn.makeButton( what, "!Earthdawn~ ChatMenu: rolltypeEdit: " + scope + ": " + what + ": In", "Edit " + what + " default and exceptions", 
                            Earthdawn.Colors.param, Earthdawn.Colors.paramfg );
                        s += "<b>Default:</b> " + currentScope[ what ][ "Default" ] + "  "; 
                        s += "<b>Exceptions :</b> " + Object.keys( currentScope[ what ][ "Exceptions" ] ).length;
//                        s += "<b>Exceptions :</b> " + currentScope[ what ][ "Exceptions" ].length;
                      });   // end forEach()
                      s += Earthdawn.makeButton( "Refresh",
                            "!Earthdawn~ ChatMenu: rolltypeEdit: " + scope + ": : Display",
                            "Display this again, so that you can see what has changed." ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg );
                      s += Earthdawn.makeButton( "Help",
                            "!Earthdawn~ ChatMenu: rolltypeEdit: " + scope + ": : Help",
                            "Helpful hints as to how to set exceptions." ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg );
                    }
                  } else {    // stateEdit
                    s += "<b>" + scope + "</b> " + JSON.stringify( currentScope ) + "<br> ";   // Display all of the current scope
                    if( walk.length > 1 )
                      s += Earthdawn.makeButton( "Up to level " + walk.slice( 0, -1).join( "."),
                            "!Earthdawn~ ChatMenu: StateEdit: " + walk.slice( 0, -1).join( "." ) + ": : Display",
                            "Move one step closer to the root." ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg );
                    s += Earthdawn.makeButton( "Refresh",
                          "!Earthdawn~ ChatMenu: StateEdit: " + scope + ": : Display",
                          "Display this again, so that you can see what has changed." ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg );
                    s += Earthdawn.makeButton( "Add new element or collection ",
                          "!Earthdawn~ ChatMenu: StateEdit: " + scope + ": ?{Name}: Add: ?{Type" 
                          + "|Number" + Earthdawn.constant( "comma" ) + "Number: ?{Value" + Earthdawn.constant( "pipe", 2 ) + "0" + Earthdawn.constant( "braceClose", 2 ) 
                          + "|String" + Earthdawn.constant( "comma" ) + "String: ?{Value" + Earthdawn.constant( "braceClose", 2 ) + "|Boolean true|Boolean false|Array|Object}",
                          "Add an Element, Array or Collection." ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg );
                    _.each( currentScope, function( v, k ) {
                      let str, tip, bad = false;

                      switch( typeof v ) {
                                            // Note, we use nesting level two coding for the pipes and closing brackets.
                        case "null":
                        case "undefined":
                        case "string":    str = "?{Edit or Delete string " + k + "|Edit, Edit: ?{New Value" + Earthdawn.constant( "braceClose", 2 ) + "|Delete}";
                                          tip = "Edit or delete this string.";
                          break;
                        case "number":    str = "?{Edit or Delete number " + k + "|Edit, Edit: ?{New Value" + Earthdawn.constant( "pipe", 2 ) + "0" 
                                              + Earthdawn.constant( "braceClose", 2 ) + "|Delete}";
                                          tip = "Edit or delete this number.";
                          break;
                        case "boolean":   str = "?{New Value " + k + "|True, Edit: true|False, Edit: false|Delete}";
                                          tip = "Set this boolean value to true or false, or delete it.";
                          break;
                        case "object":
                          if( Array.isArray( v ) ) {    // This is best practices for building Roll20 nested chat menu queries. 
                                                        // The innermost query can be of the form ?{}. Inner queires must call Earthdawn.constant for pipe, comma, and braseClose. 
                            str = "?{What do you want to do with array \'" + k + "\'|" 
                                + "Delete|Add Elements, arrayAdd: " 
                                  + "?{Add Where (F for first. L for last. or after a zero based index number)" + Earthdawn.constant( "braceClose", 2 ) + ": "
                                  + "?{Add What type of element"
                                    + Earthdawn.constant( "pipe", 2 ) + "Number" + Earthdawn.constant( "comma", 2 ) 
                                    + "Number: ?{Value" + Earthdawn.constant( "pipe", 3 ) + "0" + Earthdawn.constant( "braceClose", 3 ) 
                                    + Earthdawn.constant( "pipe", 2 ) + "String" + Earthdawn.constant( "comma", 2 ) + "String: ?{Value" + Earthdawn.constant( "braceClose", 3 ) 
                                    + Earthdawn.constant( "pipe", 2 ) + "Boolean true" + Earthdawn.constant( "pipe", 2 ) + "Boolean false" 
                                    + Earthdawn.constant( "pipe", 2 ) + "Array" + Earthdawn.constant( "pipe", 2 ) + "Object" + Earthdawn.constant( "braceClose", 2 )
                                + "|Remove Elements, arrayRemove: " 
                                  + "?{Remove starting at what index number (zero based)" + Earthdawn.constant( "pipe", 2 ) + "0" + Earthdawn.constant( "braceClose", 2 )
                                  + ": ?{Number of items to remove" + Earthdawn.constant( "pipe", 2 ) + "1" + Earthdawn.constant( "braceClose", 2 )
                                +"|Set to Empty, change}";
                            tip = "This routine can not do anything with arrays yet except delete them, or set them to empty.";
                          } else {
                            str = "?{What do you want to do with object|Edit|Into object " + k + ",In|Delete}";
                            tip = "Make this object the current object, so that you can manipulate (edit or delete) its properties.";
                          }
                          break;
                        default: 
                          log("stateEdit error. Unknown typeof " + typeof v + " for " + k );
                          bad = true;
                      }
                      if( !bad ) s += Earthdawn.makeButton( k, "!Earthdawn~ ChatMenu: StateEdit: " + scope + ": " + k + ":" + str, tip ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg );
                    });
                  }   // end entrypoint 1
                  this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "gmStateEdit" );
                } break; // end display
                case "add": {
                  currentScope = walkit( state );
                  change( 2, ssa[ 6 ], ssa[ 5 ] );   // for array and object, ssa6 will be undefined, which is OK.
                } break;
                case "arrayadd": {    // Add an element to an existing array. Chatmenu: stateEdit: state: name of array: ArrayAdd: (5) F, L, or zero based index number: (6) type : (7) Value (number or string only).
                  if( ssa.length < 7 ) {
                    this.chat( "Warning!!! Data mismatch in editState: arrayAdd. Not enough arguments.", Earthdawn.whoFrom.apiWarning );
                    log( ssa );
                  } else {
                    currentScope = walkit( state );

                    if( !Array.isArray( currentScope[ name ] ))
                      this.chat( "Warning!!! Data mismatch in editState: arrayAdd. " + (typeof (currentScope[ name ])), Earthdawn.whoFrom.apiWarning );
                    else {
                      let t = change( 1, ssa[ 7 ], ssa[ 6 ]);
                      if( t !== "fake" ) {
                        let t3 = JSON.stringify( currentScope[ name ]);
                        if( ssa[ 5 ].toUpperCase() == "F" )
                          currentScope[ name ].unshift( t );
                        else if( ssa[ 5 ].toUpperCase() == "L" )
                          currentScope[ name ].push( t );
                        else 
                          currentScope[ name ].splice( Earthdawn.parseInt2( ssa[ 5 ]), 0, t );

                        this.chat( name + " changed from " + t3 + " to " + JSON.stringify( currentScope[ name ] ), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "gmStateEdit" );
                  } } } } break; // end arrayAdd
                case "arrayremove": {   // ChatMenu: StateEdit: (scope): arrayRemove: (index): (number)
                  if( ssa.length < 6 ) {
                    this.chat( "Warning!!! Data mismatch in editState: arrayRemove.", Earthdawn.whoFrom.apiWarning );
                    log( ssa );
                  } else {
                    currentScope = walkit( state );
                    if( !Array.isArray( currentScope[ name ] ))
                      this.chat( "Warning!!! Data mismatch in editState: arrayRemove." + (typeof currentScope[ name ]), Earthdawn.whoFrom.apiWarning );
                    else {

                      let i = Earthdawn.parseInt2( ssa[ 5 ] ),    // index number
                          n = Earthdawn.parseInt2( ssa[ 6 ] ),    // number to remove
                          l = currentScope[ name ].length;
                      if( l < i )
                        this.chat( "Warning!!! can't delete array element starting at " + i + " of an array of length " + l, Earthdawn.whoFrom.apiWarning );
                      else {
                        let t3 = JSON.stringify( currentScope[ name ]);
                        currentScope[ name ].splice( i, n );
                        this.chat( name + " changed from " + t3 + " to " + JSON.stringify( currentScope[ name ] ), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "gmStateEdit" );
                } } } } break;
                case "edit":
                case "change": {
                  currentScope = walkit( state );
                  change( 3, ssa[ 5 ], ssa[ 6 ] );
                } break;
                case "delete": {
                  currentScope = walkit( state );
                  delete currentScope[ name ];
                  this.chat( name + " deleted.", Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "gmStateEdit" );
                } break;
                case "exceptionadd":
                  currentScope = walkit( state )[ "Exceptions" ];
                  let ms = Earthdawn.matchString( name );
                  currentScope[ ms ] = { name: name, display: ssa[ 5 ] };
                  this.chat( currentScope[ ms ][ "name" ] + " added and set to " + ssa[ 5 ] + ".", Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "gmStateEdit" );
                  break;
                case "exceptiondelete":
                  currentScope = walkit( state )[ "Exceptions" ];
                  if( name in currentScope ) {
                    this.chat( "Exception '" + currentScope[ name ][ "name" ] + "' deleted.", Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "gmStateEdit" );
                    delete currentScope[ name ];
                  } else 
                    this.chat( "Exception not found.", Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "gmStateEdit" );
                break;
                case "exceptionedit":
                  currentScope = walkit( state )[ "Exceptions" ];
                  currentScope[ name ][ "display" ] = ssa[ 5 ]; 
                  this.chat( currentScope[ name ][ "name" ] + " changed to " + ssa[ 5 ] + ".", Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "gmStateEdit" );
                  break;
                case "help":      // helpful hints on how to use this subsystem.
                  this.chat( "Roll results can be sent to everybody (public) or the GM only. Player & GM allows rolls to go only to the two people who need to see them.<br>"
                  + "Setting an override changes all roll results systemwide. This would normally be done by a GM who wants to test out some creatures before a game without "
                  + "the players seeing what the creatures are. Setting to GM Only will do that. If there is more than one person with GM permissions, then setting to "
                  + "'Controling player only' will make it so that only the person who requested the roll will see the results.<br>"
                  + "By default all PC rolls are set to Public, and all NPC rolls are set to GM only, but these can be changed.<br>"
                  + "Exceptions can also be set on a per Talent or Knack name basis.<br>"
                  + "The easiest way to set an exception is to make a roll, and click on the icon in the upper right header.<br>"
                  + "That will give a menu where you can set an exception for rolls exactly like that roll.<br>"
                  + "Alternativly, you can use this menu to add an exception, spelling the header of the roll "
                  + "(for example Awareness) exactly as it is spelled in the Talent or Skill name."
                  , Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "gmStateEdit" );
                  break;
                case "nothing":   // they changed their mind. Do nothing.
                  break;
                default:
                  this.chat( "Earthdawn stateEdit Error. Unknown command " + ssa[ 4 ], Earthdawn.whoFrom.apiWarning  );
                  log( ssa );
          } } }
            break;    // end stateEdit
          case "rolltypemulti": {     // ssa[ 2 ] = state.Earthdawn.Rolltype.NPC, Others are ether exceptionIs or exceptionWouldBe entries.
//cdd 
            let except = ssa[ 2 ].endsWith( ".NPC" ) ? state.Earthdawn.Rolltype.NPC.Exceptions : state.Earthdawn.Rolltype.PC.Exceptions,
                wkey, wname, dname,
                s = "Do you want to: ";
            for( let i = 3; i < ssa.length; ++i ) {
              let tip;
              switch( ssa[ i ].toLowerCase() ) {
                case "skillexceptionis":
                  tip = "This display exception is setup by skill type: Knowledge or Artisan. Exceptions can also be setup by skill name.";
                case "exceptionis":
                  if( tip === undefined ) tip = "This display exception is setup by skill name. They can also be setup by skill type: Knowledge or Artisan.";
                  wname = ssa[ ++i ];
                  if( wname in except ) {
                    dname = except[ wname ][ "name" ];
                    s += "Edit display exception for " 
                      + Earthdawn.makeButton( dname, "!Earthdawn~ ChatMenu: RolltypeEdit: " + ssa[ 2 ] + ": " + wname
                      + ": ?{Edit display exception for '" + dname + "'|Change to Public, exceptionEdit: Public|Change to GM Only, exceptionEdit: GM Only"
                      + "| Change to Player and GM, exceptionEdit: Player and GM|Delete exception, exceptionDelete}"
                      , tip, Earthdawn.Colors.action, Earthdawn.Colors.actionfg ) + ".";
                  } else
                    this.chat( "Earthdawn rolltypeMulti data mismatch Error. " + wname + " not found.", Earthdawn.whoFrom.apiWarning  );
                break;
                case "skillexceptionwouldbe":
                case "exceptionwouldbe":
                  tip = "You can setup rolltype exceptions for Knowledge and Artisan skills ether by name or type.";
                  wname = ssa[ ++i ];
                  s += "Create a display exception for " 
                    + Earthdawn.makeButton( wname, "!Earthdawn~ ChatMenu: RolltypeEdit: " + ssa[ 2 ] + ": " + wname
                    + ": ?{Create a display exception for '" + wname
                    + "'|Public, exceptionAdd: Public|GM Only, exceptionAdd: GM Only|Player and GM, exceptionAdd: Player and GM}"
                    , tip, Earthdawn.Colors.action, Earthdawn.Colors.actionfg ) + ".";
                break;
                default:
                  this.chat( "Earthdawn rolltypeMulti Error. Unknown command " + ssa[ i ], Earthdawn.whoFrom.apiWarning  );
                  log( ssa );
            } }
            this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "gmStateEdit" );

// cdd
          } break;  // end RolltypeMulti
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
              let TokObj = getObj("graphic", id);
              markers = "," + TokObj.get( "statusmarkers" ) + ",";
            }

            _.each( Earthdawn.StatusMarkerCollection, function( menuItem ) {
              let sm = menuItem[ "submenu" ],
                shared = menuItem[ "shared" ];
                if(( shared !== undefined ) && ( Earthdawn.safeString( shared ).toLowerCase().startsWith( "pos" ) || Earthdawn.safeString( shared ).toLowerCase().startsWith( "neg" )))
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
            let non = Earthdawn.safeString( ssa[ 1 ] ).toLowerCase() === "talents-non";
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
                    if (special.startsWith( "Recovery" ))     { bg = Earthdawn.Colors.health; fg = Earthdawn.Colors.healthfg; }
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
                      getAttrByName( id, "character_name" ) + (non ? " - Talents Non-combat" :" - Talents" ));
            }
          } break;  // end Talents
          default:
            Earthdawn.errorLog( "edParse.ChatMenu() Illegal ssa. ", edParse );
            log( ssa );
        } // end main switch
      } catch(err) { Earthdawn.errorLog( "ED.ChatMenu() error caught: " + err, edParse ); log(ssa); }
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
          let row = Earthdawn.safeString( ssa[ 1 ] ).slice( 6 ).trim(),   // trim off the custom, leaving the rowID
              cID = Earthdawn.safeString( ssa[ 2 ] ),
              pre = Earthdawn.buildPre( "MAN", row),
              linenum = 0;
          if( Earthdawn.getAttrBN( cID, pre + "Type", "1") ) {    // type 1 is Creature
            let d = Earthdawn.getAttrBN( this.charID, pre + "Desc", "");
            if( d ) {
              let sectCP1 = Earthdawn.newSect();
              let bodyCP1 = Earthdawn.newBody( sectCP1 );
              bodyCP1.append( (( ++linenum % 2) ? ".odd" : ".even"), d.replace( /\n/g, "   "));
              this.chat( sectCP1.toString(), Earthdawn.whoFrom.noArchive, Earthdawn.getAttrBN( this.charID, pre + "Name", "") );
            }
          } else    // not type is Opponent
            if( Earthdawn.getAttrBN( cID, pre + "Show", "0") == "1" ) {
              let sectCP2 = Earthdawn.newSect();
              let bodyCP2 = Earthdawn.newBody( sectCP2 );
              bodyCP2.append( (( ++linenum % 2) ? ".odd" : ".even"), ssa[3] + " successes spent on " + Earthdawn.getAttrBN( cID, pre + "Name", "") + ". "
                    + Earthdawn.getAttrBN( cID, pre + "Desc", "").replace( /\n/g, "   "));
              this.chat( sectCP2.toString(), Earthdawn.whoFrom.noArchive );
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
                Earthdawn.errorLog( "CreaturePower had illegal ssa[1]", this );
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
                  let newpa = Earthdawn.parseInt2(Earthdawn.getAttrBN( this.charID, "Physical-Armor", "0")) - Earthdawn.parseInt2(ssa[ 2 ]);
                  if( newpa < 0 ) {
                    let newpabuff = Earthdawn.parseInt2( attr.get( "current" )) - (newpa + Earthdawn.parseInt2(ssa[ 2 ]));
                    Earthdawn.setWithWorker( attr, "current", newpabuff , 0 );
                    this.chat( "Spent " + ssa[2] + " successes Cracking the Shell but only needed " + (newpa + Earthdawn.parseInt2(ssa[ 2 ])) + " to remove all remaining armor. Physical armor has been reduced. Important! This is supposed to be done AFTER rolling for damage and applying it.", Earthdawn.whoFrom.noArchive );
                    this.MarkerSet([ "sheetDirect", "padebuff" , -newpabuff ]);
                  } else {
                    let newpabuff = Earthdawn.parseInt2( attr.get( "current" )) - Earthdawn.parseInt2(ssa[ 2 ]);
                    Earthdawn.setWithWorker( attr, "current", newpabuff, 0 );
                    this.chat( ssa[2] + " successes spent Cracking the Shell. Physical armor has been reduced. Important! This is supposed to be done AFTER rolling for damage and applying it.", Earthdawn.whoFrom.noArchive );
                    this.MarkerSet([ "sheetDirect", "padebuff" , -newpabuff ]);
                  }
                } else  this.chat( "You can't Crack the Shell of this opponent.", Earthdawn.whoFrom.noArchive );
                break;
              case "Defang":
                if( oflags & Earthdawn.flagsCreature.Defang )
                  this.chat( ssa[2] + " successes spent Defanging. Each one is -2 to Poison steps. If Wound then creature can't use Poison at all.", Earthdawn.whoFrom.noArchive );
                else  this.chat( "You can't defang this opponent.", Earthdawn.whoFrom.noArchive );
                break;
              case "Enrage":
                if( oflags & Earthdawn.flagsCreature.Enrage )
                  this.chat( ssa[2] + " successes spent Enraging. Each one is -1 to Attack tests and PD until the end of next round.", Earthdawn.whoFrom.noArchive );
                else  this.chat( "You can't Enrage this opponent.", Earthdawn.whoFrom.noArchive );
                break;
              case "Provoke":
                if( oflags & Earthdawn.flagsCreature.Provoke )
                  this.chat( "Two successes spent Provoking. This creature will not attack anybody but you for it's next set of attacks.", Earthdawn.whoFrom.noArchive );
                else  this.chat( "You can't provoke this opponent.", Earthdawn.whoFrom.noArchive );
                break;
              case "PryLoose":
                if( oflags & Earthdawn.flagsCreature.PryLoose )
                  this.chat( ssa[2] + " successes spent Prying Loose. A Grappled ally may make an immediate escape attempt at +2 per.", Earthdawn.whoFrom.noArchive );
                else  this.chat( "You can't pry anybody loose from this opponent.", Earthdawn.whoFrom.noArchive );
                break;
              default:
                Earthdawn.errorLog( "Opponent Maneuverer had illegal ssa[1]", this );
                log( ssa );
              }
              break;
            default:
              Earthdawn.errorLog( "CreaturePower had illegal ssa[0]", this );
              log( ssa );
        } } // end else end switch
      } catch(err) { Earthdawn.errorLog( "ED.CreaturePower() error caught: " + err, this ); }
    } // End CreaturePower()



          // This routine is passed a roll result. If this.misc.CursedLuck has been set, Curse the dice as per the horror power.
          // This routine also calculates and does
          //    noPileonDice: If this is set in state, then no individual NPC die will explode more than this many times.
          //    noPileonStep: If this is set in state, then the total roll result of NPCs will not be very much greater than this multiple of the step number.
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
            highItem,     // pointer to item with the highest roll (to be cursed).
            highj, highjEnd,
            resMod,       // Value of the dice to be cursed (and all exploding dice from it). 
            rollCopy = JSON.parse( JSON.stringify( roll ) ),      // We want a brand new copy of this, so turn it into a string and back into an object.
            working = rollCopy;     // working and rollCopy will point to the same underlying data structure, but they will point to different PARTS of the structure. ie: working will only point to subgroups within the main working structure.

          function walkCurse( item ) {      // Walk through the roll structure, extracting what we need.
            'use strict';
            switch ( item[ "type" ] ) {
            case "V":     // This is the outermost container. It should have ,"resultType":"sum","total":6 at the end. 
              for( let k1 = 0; k1 < item[ "rolls" ].length; ++k1)
                walkCurse( item[ "rolls" ][ k1 ] );
              break;
            case "G":     // This is a group delimited by brackets. {{1d4!-1}+d1}kh1 is two nested groups. "1d4!-1" and that and d1, with a keep highest 1.
              for( let k2 = 0; k2 < item[ "rolls" ].length; ++k2)
                for( let k3 = 0; k3 < item[ "rolls" ][ k2 ].length; ++k3 )
                  walkCurse( item[ "rolls" ][k2][ k3 ] );
              break;
            case "R":     // This is a sub-roll result. {"type":"R","dice":1,"sides":4,"mods":{"exploding":""},"results":[{"v":4},{"v":3}]}
              if( "results" in item )
                for( let j = 0; j < item[ "results" ].length; ++j )
                  if( "v" in item[ "results" ][ j ] ) {
                    let val = item[ "results" ][ j ][ "v" ];
                    if( val > highVal || (val == highVal && item[ "sides" ] == val)) {   // Gives highest value, In case of a tie it favors dice that will explode. If still tied, takes first non-exploding dice or last rolled exploding dice.
                      highVal = val;
                      resMod = val;         // value of the dice to be cursed. 
                      highItem = item;      // pointer to the curse candidate. 
                      highj = j;            // index within item of the roll to be cursed. 

                      if( ( "mods" in item) && ( "exploding" in item[ "mods" ]))
                        while( item[ "sides" ] == item[ "results" ][ j ][ "v" ] && ++j < item[ "results" ].length )
                          resMod += item[ "results" ][ j ][ "v" ];     // skip through any dice that are just explosions of this one.
                      highjEnd = j;
                  } }
              break;
            case "M":     // This is an expression, such as "+" between two items, or "-1" as a modifier to a roll.
              break;
            default:
              Earthdawn.errorLog( "Error in ED.CursedLuck()-A. Unknown type '" + item[ "type" ] + "' in rolls " + item + ". Complete roll is ...", this );
              log( JSON.stringify( rolls ));
            }
          } // end walkCurse()
          walkCurse( working );           // Find the highest result within this roll. 
          if( highVal > 1 ) {             // Then curse that dice. Which is to say, replace the high roll and all dice that exploded from it with a 1.
            highItem[ "results" ].splice( highj, highjEnd + 1 - highj, { v: 1});
            rollCopy[ "total" ] = rollCopy[ "total" ] + 1 - resMod;
          }
          roll = rollCopy;
          stuffDone |= 0x04;
        } // end while cursed luck


                    // No Pile-On Dice
        if( Earthdawn.getAttrBN( this.charID, "NPC", "1", true ) > 0 ) {      // Pile-on prevention is only done on NPC dice rolls. PCs can pile on all they want.
                      // Pile on prevention. Dice explosion method. Dice are only allowed to explode so many times (maybe zero times, maybe more).
                      // Find occurrences of when the dice exploded too many times, and remove the excess.
          if( state.Earthdawn.noPileonDice != undefined && state.Earthdawn.noPileonDice >= 0) {
            let rollCopy = JSON.parse( JSON.stringify( roll ) ),      // We want a brand new copy of this, so turn it into a string and back into an object.
                working = rollCopy;     // working and rollCopy will point to the same underlying data structure, but they will point to different PARTS of the structure. ie: working will only point to subgroups within the main working structure.

            function walkPileDice( item ) {      // Walk through the roll structure, extracting what we need.
              'use strict';
              let expcount = 0,
                  resMod = 0,
                  piled;

              switch ( item[ "type" ] ) {
              case "V":     // This is the outermost container. It should have ,"resultType":"sum","total":6 at the end. 
                for( let k1 = 0; k1 < item[ "rolls" ].length; ++k1)
                  walkPileDice( item[ "rolls" ][ k1 ] );
                break;
              case "G":     // This is a group delimited by brackets. {{1d4!-1}+d1}kh1 is two nested groups. "1d4!-1" and that and d1, with a keep highest 1.
                for( let k2 = 0; k2 < item[ "rolls" ].length; ++k2)
                  for( let k3 = 0; k3 < item[ "rolls" ][ k2 ].length; ++k3 )
                    walkPileDice( item[ "rolls" ][k2][ k3 ] );
                break;
              case "R":     // This is a sub-roll result. {"type":"R","dice":1,"sides":4,"mods":{"exploding":""},"results":[{"v":4},{"v":3}]}
                if( ("results" in item) && ("mods" in item) && ("exploding" in item[ "mods" ]))
                  for( let j = 0; j < item[ "results" ].length; ++j )
                    if( "v" in item[ "results" ][ j ] ) {
                      let val = item[ "results" ][ j ][ "v" ];
                      if( item[ "sides" ] == val) {          // explosion
                        if( ++expcount > state.Earthdawn.noPileonDice ) {
                          resMod += val;
                          if( piled === undefined )
                            piled = j;    // index of first explosion that was to much. 
                        }
                      } else {        // not explosion. Every results list will end with a dice that did  not explode.
                        if( piled !== undefined ) {
                          item[ "results" ].splice( piled, j - piled );   // Remove everything between the start of the pile, and the die that did not explode.
                          rollCopy[ "total" ] -= resMod;
                          resMod = 0;
                          j = piled;      // We removed entries from the list we were cycling through, so reset out index.
                          piled = undefined;
                          stuffDone |= 0x02;
                        }
                        expcount = 0;
                    } }
                break;
              case "M":     // This is an expression, such as "+" between two items, or "-1" as a modifier to a roll.
                break;
              default:
                Earthdawn.errorLog( "Error in ED.CursedLuck()-B. Unknown type '" + item[ "type" ] + "' in rolls " + item + ". Complete roll is ...", this );
                log( JSON.stringify( rolls ));
              }
            } // end walkPileDice()

            walkPileDice( working );
            roll = rollCopy;
          } // End noPileonDice


                // No Pile-On Step
                // Pile on prevention, Step method. The final result is not allowed to greatly exceed a certain multiple of the
                // effective step (converting karma, bonuses, and modifiers to steps) of the roll, or the Target Number, whichever is greater.
                // For example if noPileonStep is 2.0, then a step 20 roll should not produce a roll very much in excess of 40.
                // This section removes excess exploding dice or reduces non-exploding dice until the result is close to the multiple.
          let done = false,
              lowLimit = Math.max( Math.max( this.targetNum || 0, this.misc[ "effectiveStep" ] || 0) * (state.Earthdawn.noPileonStep || 1), 14);     // No matter how low the TN, step and multiplier, let it be at least 14 (number picked at arbitrarily)
          if( state.Earthdawn.noPileonStep )
            while ( !done && roll[ "total" ] >= (lowLimit + 3)) {
              done = true;
              let highVal = -1,
                highItem,
                highj, highjEnd, exploding,
                resMod,
                rollCopy = JSON.parse( JSON.stringify( roll ) ),      // We want a brand new copy of this, so turn it into a string and back into an object.
                working = rollCopy;     // working and rollCopy will point to the same underlying data structure, but they will point to different PARTS of the structure. ie: working will only point to subgroups within the main working structure.

              function walkPileStep( item ) {      // Walk through the roll structure, extracting what we need.
                'use strict';
                switch ( item[ "type" ] ) {
                case "V":     // This is the outermost container. It should have ,"resultType":"sum","total":6 at the end. 
                  for( let k1 = 0; k1 < item[ "rolls" ].length; ++k1)
                    walkPileStep( item[ "rolls" ][ k1 ] );
                  break;
                case "G":     // This is a group delimited by brackets. {{1d4!-1}+d1}kh1 is two nested groups. "1d4!-1" and that and d1, with a keep highest 1.
                  for( let k2 = 0; k2 < item[ "rolls" ].length; ++k2)
                    for( let k3 = 0; k3 < item[ "rolls" ][ k2 ].length; ++k3 )
                      walkPileStep( item[ "rolls" ][k2][ k3 ] );
                  break;
                case "R":     // This is a sub-roll result. {"type":"R","dice":1,"sides":4,"mods":{"exploding":""},"results":[{"v":4},{"v":3}]}
                  if( ("results" in item) && ("mods" in item) && ("exploding" in item[ "mods" ]))
                    for( let j = 0; j < item[ "results" ].length; ++j )
                      if( "v" in item[ "results" ][ j ] ) {
                        let val = item[ "results" ][ j ][ "v" ];
                                // highest dice that will not send total below the threshold we want.
                        if( val > highVal && (roll[ "total" ] - val) >= lowLimit ) {
                          highVal = val;
                          resMod = val;
                          exploding = (item[ "sides" ] == val);
                          highItem = item;
                          highj = j;
                      } }
                  break;
                case "M":     // This is an expression, such as "+" between two items, or "-1" as a modifier to a roll.
                  break;
                default:
                  Earthdawn.errorLog( "Error in ED.CursedLuck()-C. Unknown type '" + item[ "type" ] + "' in rolls " + item + ". Complete roll is ...", this );
                  log( JSON.stringify( rolls ));
                }
              } // end walkPileStep()

              walkPileStep( working );
              if( highVal > 3 ) {             // Remove or reduce this dice.
                if( exploding ) {
                  highItem[ "results" ].splice( highj, 1);
                  rollCopy[ "total" ] -= resMod;
                } else {      // replace it with a 1, 2, or 3.
                  let random = Math.floor(Math.random() * 3) + 1;
                  highItem[ "results" ][ highj ][ "v" ] = random;
                  rollCopy[ "total" ] += random - resMod;
                }
                stuffDone |= 0x01;
                done = false;
              }
              roll = rollCopy;
            } // End while noPileonStep
        } // End not NPC.

        this.misc[ "FunnyStuffDone" ] = stuffDone;
        return roll;
      } catch(err) { Earthdawn.errorLog( "ED.CursedLuck() error caught: " + err, this ); }
    } // End CursedLuck()



          // ParseObj.Damage ( ssa )
          // Apply Damage to Token/Char specified in tokenInfo.
          // ssa is an array that holds the parameters.
          //  Note: These top notes describe the old expected order of arguments, but the routine has been rewritten to accept the
          //    arguments in any order because sometimes it was difficult to supply them in order.
          //      0 - (optional) Damage (default), Strain, Stun, Recovery, Woodskin, notWoodskin;
          //      Also StrainSilent which does the strain, but does not send a message saying so.
          //      1 - Armor Mods: NA = No Armor, PA = subtract Physical Armor before applying damage, MA = Mystic Armor. PA-Nat, MA-Nat.
          //      2 - Damage:      Amount of damage to apply.   For "Recovery", "Woodskin" or "notWoodskin" this will be a negative number.
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
          armorType = "", armorAbrieve = "",
          dmg = 0,
          bRecovery = false,
          npc = Earthdawn.getAttrBN( this.charID, "NPC", "1" ),
          bMook = !((npc == Earthdawn.charType.pc) || (npc == Earthdawn.charType.npc)),
          Woodskin = 0,        // Obsolete Nov 2023.
          bStrain = false,
          bStrainSilent = false,
          bVerbose = false,
          bStun = (this.bFlags & Earthdawn.flags.RecoveryStun);
        for( let ind = 0; ind < ssa.length; ++ind) {    // Loop though getting any expected parameter, which may show up in various orders.
          if( isNaN( ssa[ ind ] )) {
            switch ( Earthdawn.safeString( ssa[ ind ] ).toUpperCase() ) {
            case "PA":
              armor = Earthdawn.getAttrBN( this.charID, "Physical-Armor", "0" );
              armorType = " Physical";
              armorAbrieve = "PA";
              break;
            case "PA-NAT":
              armor = Earthdawn.getAttrBN( this.charID, "PA-Nat", "0" );
              armorType = " Natural Physical";
              armorAbrieve = "PA";
              break;
            case "MA":
              armor = Earthdawn.getAttrBN( this.charID, "Mystic-Armor", "2" );
              armorType = " Mystic";
              armorAbrieve = "MA";
              break;
            case "MA-NAT":
              armor = Earthdawn.getAttrBN( this.charID, "MA-Nat", "2" );
              armorType = " Natural Mystic";
              armorAbrieve = "MA";
              break;
            case "NOTWOODSKIN":     // Obsolete Nov 2023.
              ++Woodskin;     // Woodskin = 2
            case "WOODSKIN":        // Obsolete Nov 2023.
              ++Woodskin;     // Woodskin = 1.   falls into recovery, as woodskin is also recovery. 
            case "RECOVERY":
            case "RECOVERY-WOODSKIN":
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
            case "VERBOSE":
              bVerbose = true;
              break;
            case "DAMAGE":    // This is the normal case and requires no handling. In fact in some cases we get this even when it really is Stun or Strain. So don't trust this to mean it is normal damage just because we are here.
            case "NA":      // No Armor, No action required.
              break;
            default:
              Earthdawn.errorLog( "ED.Damage() unparsable argument " + ind + ": " + JSON.stringify(ssa), this);
            }
          } else      // is number.
            dmg += Earthdawn.parseInt2( ssa[ ind ] );
        } // loop getting parameters.

        if( armor < 1 )
          armorType = "";
        if( bRecovery ? (dmg >= 0) : (dmg <= 0 ))        // If the passed damage evaluates to zero, just exit.
          return;
        if( bStrain ) {     // Edge case. Strain should normally not have armor specified, but Take-Damage and Damage-Target buttons allows user to choose strain and an armor. If they do, remove them.
          armor = 0;
          armorType = "";
        }

        dmg -= armor;
        if( dmg <= 0 && !bRecovery) {
            this.chat( "Attack glances off of " + this.tokenInfo.name +"'s" + (armorAbrieve ? " " + Earthdawn.addIcon( armorAbrieve, "l"): "") + armorType + " Armor." );
            return;
        }

        let newMsg = "", gmMsg = "", recMsg = this.tokenInfo.name;
        if( bStrain && !bVerbose ) {      // Strain normally (when part of some other action) does not have a separate strain message, since the strain is reported as part of the roll results.
          if( !bStrainSilent )
            this.misc[ "strain" ] = dmg;
        } else if (armor < 1 ) {    // No armor
          newMsg = this.tokenInfo.name + " took " + dmg + " " + (bStrain ? Earthdawn.addIcon( "strain", "l") + "Strain" 
                : (bStun ? Earthdawn.addIcon( "stun", "l") + "Stun" : Earthdawn.addIcon( "damage", "l") + "Damage"));
        } else if ( npc == Earthdawn.charType.pc ) {
          newMsg = this.tokenInfo.name + " took " + dmg + " " + (bStrain ? Earthdawn.addIcon( "strain", "l") + "Strain" 
                : (bStun ? Earthdawn.addIcon( "stun", "l") + "Stun" : Earthdawn.addIcon( "damage", "l") + "Damage")) 
                + " above" + (armorAbrieve ? " " + Earthdawn.addIcon(armorAbrieve, "l"): "") + armorType + " armor";
        } else {  // NPC
          newMsg = this.tokenInfo.name + "'s" + (armorAbrieve ? " " + Earthdawn.addIcon(armorAbrieve, "l"): "") + armorType + " armor absorbs ";
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
            if( currDmg < 0 ) {     // If all damage has been healed, we have to know whether this is a wood skin test or not, since those are handled differently. 
              if( "Recovery-WoodSkin" in this.misc )
                recMsg += " Wood Skin added " + (dmg * -1) + Earthdawn.addIcon( "damagehealth", "l" ) + " Health. New damage value " + currDmg + ".";
              else {   // We know this is NOT woodskin and we have negative damage, have the leftover heal stun damage.
                  recMsg += " recovered " + ((dmg - currDmg) * -1) + Earthdawn.addIcon( "damage", "l" ) + " damage. New value 0.";
                  bStun = true;
                  dmg = currDmg;
                  currDmg = 0;
              }
            } else      // after recovery, there is still damage. 
              recMsg += " recovered " + (dmg * -1) + Earthdawn.addIcon( "damage", "l" ) + " damage. New value " + currDmg + ".";
          }
          if( bToken )
              Earthdawn.set( this.tokenInfo.tokenObj, "bar3_value", currDmg );
            else
              Earthdawn.setWithWorker( attributeDmg, "current", currDmg, 0 );
        } // end normal damage section

        let unc = Earthdawn.getAttrBN( this.charID, "Damage_max", 20 );   // for pc's and npc's unc is current unc rating (with stun damage already subtracted). For mooks it is the core characters unc rating.
        if( bStun ) {     // Stun uses a different procedure than normal damage because of the calculated fields on the character sheet.
          let attributeStun, stunDmg;
          if( !bMook ) {      // This is not a Mook, so add the Stun to the character sheet where it will automatically flow to the token value 3.
            attributeStun = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "Damage-Stun" }, 0);
            stunDmg = Earthdawn.parseInt2(attributeStun.get( "current" ));
          } else      // Only if this is a Mook, take the core characters real unc rating and Subtract the value in bar3_max, which will give this mooks current stun damage.
            stunDmg = unc - Earthdawn.parseInt2( this.tokenInfo.tokenObj.get( "bar3_max" ));
          stunDmg += dmg;
          if( bRecovery && stunDmg != 0 && dmg != 0 ) {
            recMsg += (( this.tokenInfo.name.length === recMsg.length ) ? "" : " and" ) + " recovered " + ((stunDmg < 0) ? ((dmg - stunDmg) * -1) : (dmg * -1) )
                   + Earthdawn.addIcon( "stun", "l" ) + " stun. New value " + ((stunDmg < 0) ? 0 : stunDmg ) + ".";
            if( stunDmg < 0)
              stunDmg = 0;
          }
          if( !bMook ) {
            Earthdawn.setWithWorker( attributeStun, "current", stunDmg, 0 );
            unc -= dmg;       // Also subtract new dmg from the unc rating here, since we use it later, and the event that sets it probably will not have triggered yet.
          } else {
            Earthdawn.set( this.tokenInfo.tokenObj, "bar3_max", unc - stunDmg );    // For mooks, bar3 max is character unc rating, minus stunDmg. 
            unc -= stunDmg;   // for PCs (above) we just subtract out the new damage dealt. For Mooks we subtract out all stun damage ever dealt to get the number used in the calculations below.
          }
        } // end stun damage section.

        let WoundThreshold = Earthdawn.getAttrBN( this.charID, "Wound-Threshold", 7 ) || 0,
            currWound;
        if( !bStrain && !bStun && dmg >= WoundThreshold ) {     // wound.
          if( bToken && bMook ) {
            currWound = Earthdawn.parseInt2( this.tokenInfo.tokenObj.get( "bar2_value" ));    // Here we are setting the wound on the token.
            if( isNaN( currWound ) )
              currWound = 1;
            else
              currWound += 1;
            Earthdawn.set( this.tokenInfo.tokenObj, "bar2_value", currWound );
          } else {          // Here we are setting the wound on the character sheet for a non-mook.
            let attribute = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "Wounds" }, 0);
            currWound = Earthdawn.parseInt2(attribute.get( "current" ));
            currWound += 1;
            Earthdawn.setWithWorker( attribute, "current", currWound, 0 );
          }
          newMsg += ".<br>Takes wound " + currWound;
        } // end wound
// cdd todo. If stun would have caused a wound, set harried until end of round. 

        if( currDmg >= Earthdawn.getAttrBN( this.charID, "Damage-Death-Rating", 25 )) {
          newMsg += ".<br>Character is DEAD";
          this.MarkerSet( ["d", "healthdead", "s"] );
        } else if( currDmg >= ( unc || 0)) {
          newMsg += ".<br>Character is Unconscious";
          this.MarkerSet( ["d", "healthunconscious", "s"] );
        } else {
          this.MarkerSet( ["d", "healthunconscious", "u"] );
          if( dmg >= (WoundThreshold + 5)) {     // Character is wounded and need to make a Knockdown test
            let cname = getAttrByName( this.charID, "character_name" );
            newMsg += ".  Need to make a Knockdown Test";
            gmMsg   += " TN " + ( dmg - WoundThreshold ) + "<br>" +
                      Earthdawn.makeButton( "Knockdown",
                    "!Earthdawn~ " + (( this.tokenInfo !== undefined && this.tokenInfo.tokenObj !== undefined) 
                    ? "setToken: " + this.tokenInfo.tokenObj.get( "id" ) : "charID: " + this.charID )
                    + "~ TargetNum: " + ( dmg - WoundThreshold )
                    + ": Adjust-TN-Auto: Adjust-TN-Misc~ modValue: ?{Modification|0} ~ K-ask: @{" + cname + "|KarmaGlobalMode}@{"
                    + cname + "|Str-Karma-Ask}: @{" + getAttrByName( this.charID, "character_name") + "|DPGlobalMode}@{"
                    + cname + "|Str-DP-Ask}~ Value: Knockdown: Adjust-All-Tests-Total: Defensive: Resistance~ Roll"
                    ,"Make a standard Knockdown test.", Earthdawn.Colors.action, Earthdawn.Colors.actionfg );
            let attributes = findObjs({ _type: "attribute", _characterid: this.charID }),
              po = this;
            _.each( attributes, function (att) {
              if( att.get( "name" ).endsWith( "_Special" ) && att.get("current").startsWith( "Knockdown" )) {
                let pre = Earthdawn.buildPre( att.get( "name")),
                  name = Earthdawn.getAttrBN( po.charID, pre + "Name", "" ),
                  code = Earthdawn.repeatSection( 3, att.get( "name") ),
                  rid = Earthdawn.repeatSection( 2, att.get( "name") );
//log( "Talent Found " + pre + " " + name + " "  + code +" " + rid + " " + cname);
                gmMsg += Earthdawn.makeButton( name + " test",
                        "!Earthdawn~ " + (( po.tokenInfo !== undefined && po.tokenInfo.tokenObj !== undefined) 
                        ? "setToken: " + po.tokenInfo.tokenObj.get( "id" ) : "charID: " + po.charID )
                        + "~ TargetNum: " + ( dmg - WoundThreshold )
                        + ": Adjust-TN-Auto: Adjust-TN-Misc~ modValue: ?{Modification|0} ~ K-ask: @{" + cname + "|KarmaGlobalMode}@{"
                        + cname + "|" + pre + "Karma-Ask}: @{" + cname + "|DPGlobalMode}@{"
                        + cname + "|" + pre + "DP-Ask}~ Action: "+ code  +":" + rid
                        ,"Make a Knockdown test.", Earthdawn.Colors.action, Earthdawn.Colors.actionfg );
              }
            }); // End for each attribute.
        } }
      
        if(gmMsg && npc == Earthdawn.charType.pc) {  //gm message is sent separately to GM for NPCs and appended for PCs
          newMsg += gmMsg;
          gmMsg = "";
        }
        if( bRecovery && recMsg.length > 0)
          this.chat( recMsg, Earthdawn.whoTo.player | Earthdawn.whoTo.gm | Earthdawn.whoFrom.character);
        if( !bRecovery && newMsg.length > 0)
          this.chat( newMsg + "." );
        if( !bRecovery && gmMsg.length > 0)
          this.chat( gmMsg, Earthdawn.whoTo.gm | Earthdawn.whoFrom.noArchive);
      } catch(err) { Earthdawn.errorLog( "ED.Damage() error caught: " + err, this ); }
    } // End ParseObj.Damage() ssa )



          // ParseObj.Debug()
          // This is a collection of test or diagnostic commands.
          //
          // Most are probably invoked from the "Special Function" drop-down and button on the Adjustments page.
          // Cancel, Inspect, RepSecFix, RepSecBatch, RepSecBatchFixAll, SetAttribAll, sheetworkertest, showeach, test.
    this.Debug = function( ssa )  {
      'use strict';
      let batchFix = false,
          po = this;
      try {
        switch ( Earthdawn.safeString( ssa[ 1 ] ).toLowerCase() ) {
          case "cancel":                  // This does nothing. It is just a target for a repsecBatch - cancel that is meant to be ignored.
            break;
          case "inspect":            // This is test code that lets me see info on tokens and/or characters.
            log( ssa);
            switch( Earthdawn.safeString( ssa[ 2 ] ).toLowerCase() ) {
              case "getids": {        // Given a text fragment. Look in every attribute that ends in "_Name" to see if it contains the fragment.
                              // go through all attributes for this character and look for ones we are interested in
                let attributes = findObjs({ _type: "attribute", _characterid: this.charID });
                _.each( attributes, function (att) {
                  if (att.get("name").endsWith( "_Name" ) && att.get( "current" ).indexOf( ssa[ 3 ] ) != -1 )
                    po.chat( getAttrByName( po.charID, "character_name" ) + " " + "CharID: " + po.charID + "   " + att.get( "name" ) + ":   " + att.get( "current" ),
                        Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive, "Inspect" );
                }); // End for each attribute.
              } break;
              case "getvalue":      // Given an attribute name, give the value of the attribute.
                this.chat( getAttrByName( this.charID, "character_name" ) + " " + ssa[ 3 ] + ": " + getAttrByName( this.charID, ssa[ 3 ]),
                      Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive, "Inspect" );
                break;
              case "objectid": {      // Given an Object ID. Show what type of object it is and it's name.
                let objs = findObjs({ _id: ssa[ 3 ] });
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
                if( ssa[ 4 ] === "Full" ) {
                  let attributes = findObjs({ _type: "attribute", _characterid: po.charID });
                  _.each( attributes, function (att) {
                    let name = att.get( "name" );
                    if ( name.startsWith( "repeating_" ) && name.indexOf( ssa[3] ) > -1) {
                      po.chat( "_id: " + att.get( "_id" ) + "    name: " + att.get( "name" ) + "   current: " + att.get( "current" )
                            + ( att.get( "max" ) ? "   max: " + att.get( "max" ) : ""),
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
          case "repsecfix": {     // RepSecFix: Repeating Section Verify and Fix.   Note: This is now labeled Character Sheet Verify/Fix and fixes some things not in repeating sections.
                        // Sort the attributes by name, and see if any are duplicates, if so remove one.
                        // Find any row that does not have a RowID, and fix it.
                        // For each RowID found, see if any two are duplicates except for case, and if so merge them into the correct (mixed case) rowID.
                        // This will also repeat the AbilityRebuild test (This will force it to be done even if user has set it to Never do it automatically).
                        // LinkToken calls this routine in silent mode. If called by the menu, it puts notes into the console log.
            try {
              let orig = [],
                lcase = [],
                dup = [],
                needFixi  = [],
                needFix   = [],
                silent = ssa.includes( "silent" ),      // silent is not really silent, just logs less stuff to the console log.
                issues = 0,
                rep = 0,
                nonrep = 0,
                timer = Date.now();
              let attributes = findObjs({ _type: "attribute", _characterid: this.charID });
              let sorted = _.sortBy( attributes, function( att ){ return att.get("name"); });
              if( !silent ) log( "Debug RepSecFix: " + attributes.length + " attributes found.   Sorting took " + (Date.now() - timer) + " ms.");

              let save = sorted[ 0 ];
              for( let i = 1; i < sorted.length; ++i ) {    // Go through each and every attribute in sorted order.
                let att = sorted[ i ];
                if( att.get( "name" ) === save.get( "name" )) {     // We have two attributes with identical names. get rid of one of them.
                  let a = att.get( "current" ),
                      s = save.get( "current" ),
                      which;    // Which to get rid of 1 att, 2 save
                  if( !a ) which = 1;         // pick which one is most likely to be the best value to keep.
                  else if( !s ) which = 2;
                  else if( typeof a === "string" ) {
                    if( typeof s !== "string" ) which = 2;    // pick one that is not string.
                    else if( a.length < s.length ) which = 1;
                    else if( a.length > s.length ) which = 2;
                    else if( a < s ) which = 1;
                    else if( a > s ) which = 2;
                  } else {
                    if( typeof s == "string" ) which = 1;
                    else if( a < s ) which = 1;
                    else if( a > s ) which = 2;
                  }
                  if( which === 2 ) {
                    dup.push( save );   // mark the save attribute for deletion and skip to the next loop with the current attribute as the save.
                    save = att;
                    continue;
                  } else {
                    dup.push( att );    // mark this attribute for deletion and skip to th next loop with the same "save" as this loop.
                    continue;
                } }     // end have two attributes with identical names, get rid of one.

                save = att;     // We are done with save for this loop, so can set it up for next loop.
                if( att.get( "name" ).startsWith( "repeating_")) {    // Now we are specifically fixing repeating sections that have no rowID, or that are all lower or upper case.
                  ++rep;
                  let nm = Earthdawn.safeString( att.get("name") ),
                    rowID = Earthdawn.safeString( Earthdawn.repeatSection( 2, nm)),
                    code  = Earthdawn.safeString( Earthdawn.repeatSection( 3, nm));
                  if( !rowID || !code ) {
                    ++issues;
                    po.chat( "Error found, badly formated repeating section name. Deleting: " + nm, Earthdawn.whoFrom.apiWarning )
                    log( "Deleting " + JSON.stringify( att ));
                    att.remove();     // (From API to player ): Error found, badly formated repeating section name. Deleting: repeating_inventory_-MeU4hpDClwHqdkpTEmI_show-Inventory-details
                    continue;
                  }
                  if( rowID && Earthdawn.codeToName( rowID, true )) {    // We have seen cases where somehow a Code gets placed where a rowID should be. If we find that the rowID matches a valid code, then just delete the attribute.
                    po.chat( "Error found, badly formated rowID. Deleting: " + nm, Earthdawn.whoFrom.apiWarning )
                    ++issues;
                    log( "Deleting " + JSON.stringify( att ));
                    att.remove();
                    continue;
                  }
                  if( code && Earthdawn.testNoRowID( code ))    // Certain types of repeating sections do not need to test if there is a rowID. 
                    continue;
                  if( nm.endsWith( "_Name" )) {     // When we find a repeating section name, Make sure we have a RowID that matches the rowID of the name.
                              // Note, for a while I had a routine to look though the attributes we already had for the RowID, but I could not get it to work. So using system tools.
                    let attrib = findObjs({ _type: "attribute", _characterid: po.charID,  name: nm.slice( 0, -5) + "_RowID" });
                    if( !attrib || attrib.length == 0 ) {   // RowID does not exist at all for this item.
                      if( rowID !== rowID.toLowerCase()) {    // Don't do this if this row is likely corrupt anyway.
                        attrib = createObj( "attribute", { _characterid: po.charID,  name: nm.slice( 0, -5) + "_RowID","current": rowID });
                        po.chat( "Error found, " + att.get( "current" ) + " at " + nm + " did not have a rowID.", Earthdawn.whoFrom.apiWarning )
                        ++issues;
                      }
                    } else if( !attrib[ 0 ].get( "current" ) || attrib[ 0 ].get( "current" ) !== rowID) {
                      po.chat( "Error found, " + att.get( "current" ) + " at " + nm + " had incorrect rowID of - " + attrib[ 0 ].get( "current" ) + ". Fixed", Earthdawn.whoFrom.apiWarning )
                      attrib[ 0 ].set( "current", rowID);
                      ++issues;
                    }
                  } // end _name
                  if( orig.indexOf( rowID ) === -1 )  {   // This is a list of all unique rowID's we found.
                    orig.push( rowID );
                    lcase.push( rowID.toLowerCase() );
                  }
                  if( rowID === rowID.toLowerCase() || rowID === rowID.toUpperCase() ) {    // This rowID is all the same case which is almost certainly got stored wrong.
                    let t = needFixi.indexOf( rowID );
                    if( t == -1 ) {
                      t = needFixi.push( rowID ) -1;
                      needFix.push( [] );
                    }
                    needFix[ t ].push( att );
                  }
                } // end repeating.
                else {
                  if( att.get( "name" ) === "edition" ) {
                    if( att.get( "current" ) != Earthdawn.safeString( state.Earthdawn.edition ))
                      log( "was game edition " + att.get( "current" ) + "  new " + Earthdawn.safeString( state.Earthdawn.edition ));
                    if( att.get( "max" ) != Earthdawn.safeString( state.Earthdawn.sheetVersion ))
                      log( "was sheet edition " + att.get( "max" ) + "  new " + Earthdawn.safeString( state.Earthdawn.sheetVersion ));
                    Earthdawn.setWithWorker( att, "max", Earthdawn.safeString( state.Earthdawn.sheetVersion ));
                  }
                  ++nonrep;
                }
              } // End for each attribute.

              _.each( dup, function (att) {
                log( "repSecFix deleting duplicate attribute " + JSON.stringify( att ));
                att.remove();
              });

                      // needFixi is a one-dimensional array that contains rowIDs that need fixing because they are all lower case. It is used as the index for needFix.
                      // needFix is an array of arrays of objects that contain attributes that need fixing.  For example there are two attributes that have the same rowID in needFixi [ 0 ], then needFix[0][0] and needFix[0][1] will contain them.
              if( needFixi.length > 0 ) {
//log( "repSecFix" );   log( needFixi);   log( orig);   log( lcase);    log( needFix);
                for( let i = 0; i < needFixi.length; ++i ) {    // This is for each issue that needs fixed. RowIDs that are bad.
                  let cnt = [],   // This will hold the indexes of the RowIDs we are looking for.
                      f = lcase.indexOf( needFixi[ i ].toLowerCase());
                  while( f !== -1) {    // Look in list of all attributes (not just bad ones) for unique rowID's, that have the same value when lowercased.
                    cnt.push( f );
                    f = lcase.indexOf( needFixi[ i ].toLowerCase(), f +1);
                  }
                  f = undefined;
                  if( cnt.length > 1 )      // We have found more than one entry with the same lowercased rowID.  Almost certainly at least one of these is bad, hopefully at least one is good.
                    for( let j = 0; j < cnt.length; ++j ) {
                      let ocj = Earthdawn.safeString( orig[ cnt[ j ]] );
                      if( ocj !== ocj.toLowerCase() && ocj !== ocj.toUpperCase())
                        f = ocj;    // a rowID that is GOOD, that is the same when lowercased as a bad rowID.
                    }
                  if( f ) {     // This is the good (mixed case) RowID we want to use for all loop i attributes.
                    let lst = ", ",
                        pre;
//log( "needFix[ " + i + " ] length is " + needFix[ i ].length);   log( "new RowID " + f);
                    for( let j = 0; j < needFix[ i ].length; ++j ) {      // For each attribute that has the rowID we are correcting.
                      let obj = needFix[ i ][ j ];      // This is the "bad" attribute object
                      let nm = obj.get( "name" );
                      let n    = Earthdawn.repeatSection( 4, nm);
                      pre  = Earthdawn.buildPre( Earthdawn.repeatSection( 3, nm), f);     // This is the "good" rowID.
//log( nm);
                      let attrib = findObjs({ _type: "attribute", _characterid: po.charID,  name: pre + n });
                      if( attrib ) {
                        if( attrib.length > 0 ) {   // We found a correct entry of this name. delete the one that was bad.
                          po.chat( "Error found, both bad and good RowIds found for " + attrib[0].get( "name" ) + " deleting bad one.", Earthdawn.whoFrom.apiWarning )
                          obj.remove();
                          ++issues;      // We have already removed duplicates, so we don't need to test for more than one.
                        } else {      // There is not already a "good" attribute of this rowID. Fix in place the bad attribute.
                          lst += n + ", ";
                          Earthdawn.set( obj, "name", pre + n );
                    } } }
                    if( lst.length > 5) {
                      po.chat( "Errors found, " + lst.slice( 2 ).trim() + " fixed for " + pre, Earthdawn.whoFrom.apiWarning )
                      ++issues;
                    }

                  } else {    // We identified a problem rowID. But there were no attributes with a mixed case rowID we could use to know what it should be.
                    po.chat( "Errors found with " + needFix[ i ].length + " attributes of row " + needFix[ i ][0].get( "name") + " Deleting whole row.", Earthdawn.whoFrom.apiWarning )
                    log( needFix[ i ] );
                    for( let j = 0; j < needFix[ i ].length; ++j )
                      needFix[ i ][ j ].remove();
                    ++issues;
                  }
                } // end for each needFix
              } else if ( issues )
                this.chat( "All other RowID's found appear valid.", Earthdawn.whoFrom.apiWarning )

              this.abilityRebuild( [ "abilityRebuild", ssa.includes( "batchFix" ) ? "batchFix" : ( ssa.includes( "batch") ? "batch" : "forceTest" )]);

              if( !silent ) {
                log( rep + " attributes were in repeating sections.   " + nonrep + " were in non-repeating sections." );
                log( "Debug RepSecFix: Finished after " + (Date.now() - timer) + " ms.");
                if( !issues ) this.chat( Earthdawn.getAttrBN( this.charID, "character_name", "" ) + ": Verify / Fix: No issues found." );
              }
            } catch(err) { Earthdawn.errorLog( "Debug RepSecFix error caught: " + err, po ); }
          } break;    // end repsecfix
          case "repsecbatchfixall": batchFix = true;     // don't ask before fixing. 
          case "repsecbatch":                  // Run the previous routine for all characters (instead of just one).    These are called for SF func GM commands. 
            let charQueue = findObjs({ _type: "character" });      // create the queue we'll be processing.
            if( charQueue && charQueue.length > 0) {
              const fixBurndown = () => {     // function that will process the next element of the queue
                try {
                  if( charQueue.length > 0 ) {
                    let c = charQueue.shift();
                    log( "Verifying " + c.get( "name" ));
                    po.charID = c.get( "_id" );
                    po.Debug( [ "Debug", "repSecFix", "silent", batchFix ? "batchFix" : "batch" ] );
                    setTimeout( fixBurndown, 1);   // Do the next character
                  } else    // Have finished the last character.
                    this.chat( "RepSecBatch finished. Look in API console log for details.", Earthdawn.whoFrom.apiWarning | Earthdawn.whoTo.public );
                } catch(err) {
                  log( "RepSecBatch error caught: " + err );
              } }
              this.chat( "We are now Verifying all " + charQueue.length + " characters found.", Earthdawn.whoFrom.apiWarning | Earthdawn.whoTo.public );
              fixBurndown();   // start the execution by doing the first element. Each element will call the next.
            }
            break;    // end repsecBatch
          case "setattriball": {      // Set all attributes to a value. SetAttribAll: attribute name: Attribute value: Confirm ("yes")
            if( ssa.length < 5 || !ssa[ 2 ] ) {
              this.chat( "Error! badly formated command.", Earthdawn.whoFrom.apiError);
              log( ssa );
              return;
            }
            if( ssa[ 4 ].toLowerCase() !== "yes" )    // command was not confirmed, quietly exit. 
              return;

            let a = ssa[ 2 ];
            let m = a.endsWith( "_max" );
            if( m ) a = a.slice( 0, -4);  // trim the _max off if it was present. 
            let v = ssa[ 3 ];   // value is a string. empty strings are accepted. If (undefined) or (delete) then set to undefined. If (delete) and if the other value (current or max) is already undefined, delete the whole thing. 
            let s = ( v === "(delete)" ) ? 1: 0;

            let count = 0,
              charQueue = findObjs({ _type: "character" });      // create the queue we'll be processing.
            if( charQueue ) {
              const charBurndownSAA = () => {     // create the function that will process the next element of the queue
                if( charQueue.length ) {
                  let aObj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: charQueue.shift().charID, name: a }, 0, 0);
                  if( s === 0 )
                    aObj.set( m ? "max" : "current", v );
                  else if( s === 1 )
                    Aobj.remove();
                  setTimeout( charBurndownSAA, 1);   // Do the next character
                } else    // Have finished the last attribute.
                  ed.chat( count + " characters updated.", Earthdawn.whoFrom.apiWarning );
            } };
              ed.chat( "Updating all (" + charQueue.length + ") characters '" + ssa[ 2 ] + "' to '" + ssa[ 3 ] + "'", Earthdawn.whoFrom.apiWarning );
              charBurndownSAA();   // start the execution by doing the first element. Each element will call the next.
          } break;    // end setAttribAll
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


/*
              let tkns = findObjs({ _type: "graphic",  _subtype: "token" }),
                  c = 0;
              _.each( tkns, function (TokObj) {                   // Check all tokens on the page.
                ++c;
                let TokenName = TokObj.get("name");
                if( TokenName === "Truck" ) {
                  log( TokObj );
                  TokObj.remove();
                }
              }) // End ForEach Token
              log( "cnt " + c );
*/
//              this.chat( "!roll20AM --audio,nomenu,play|Leopard Pounce", Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive );

  //            this.chat( stem + Earthdawn.colonFix( slink ), Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive );
//              this.edClass.updateVersion3p000( this.charID, this.edClass, 0 );
/*
{"_tag":"div","_attrs":{"class":"sheet-rolltemplate-sect"},"_css":{},"_children":["",{"_tag":"div","_attrs":{"class":"sheet-rolltemplate-header sheet-rolltemplate-icon-action"},"_css":{},"_children":["Avoid Blow"]},{"_tag":"div","_attrs":{"class":"sheet-rolltemplate-subheadertext"},"_css":{},"_children":["vs. Ask: PD Target # 8.   1 strain."]},{"_tag":".body","_attrs":{"class":"sheet-rolltemplate-body"},"_css":{"odd":{"background":"#white"},"even":{"background":"#E9E9E9"}},"_children":["",{"_tag":".odd","_attrs":{},"_css":{},"_children":["<span style=\"background: lightgoldenrodyellow;\" title=\"2d6.   Base step 8\"><b>Step:</b> 8</span>."]},{"_tag":".even","_attrs":{},"_css":{},"_children":["<b>Result:</b> <span style=\"background-color: #FEF68E; border: 2px solid #FEF68E; padding: 0 3px 0 3px; font-weight: bold; cursor: help; font-size: 1.1em;\" title=\"Rolling 2d6! = (3+2)\">5</span>   <span style='color: red;'>Failure</span>!"]},{"_tag":".odd","_attrs":{},"_css":{},"_children":["<b>Action:</b> Free"]},{"_tag":".even","_attrs":{},"_css":{},"_children":["<b>Description</b><span style=\"border: solid 1px yellow;\" title=\"The adept avoids injury by dodging or parrying blows directed against him. When attacked in close or ranged combat, the adept may make an Avoid Blow test against his opponent’s Attack test result. If successful, the adept avoids the blow-he sees the attack coming and dodges or parries it at the last moment. The adept can avoid a maximum number of attacks equal to his Avoid Blow rank each round, but only one attempt per Attack test. An adept cannot use Avoid Blow if he is blindsided or surprised by his attacker.&#013;2023-4-16 : Entry update triggered by Addition of another ability - data comes from  unknown source &#013;\">(Hover)</span>"]}]}]}

{"_tag":"div","_attrs":{"class":"sheet-rolltemplate-sect"},"_css":{},"_children":["",{"_tag":"div","_attrs":{"class":"sheet-rolltemplate-header sheet-rolltemplate-icon-action"},"_css":{},"_children":["Avoid Blow"]},{"_tag":"div","_attrs":{"class":"sheet-rolltemplate-subheadertext"},"_css":{},"_children":["vs. Ask: PD Target # 8.   1 strain."]},{"_tag":".body","_attrs":{"class":"sheet-rolltemplate-body"},"_css":{"odd":{"background":"#white"},"even":{"background":"#E9E9E9"}},"_children":["",{"_tag":".odd","_attrs":{},"_css":{},"_children":["<span style=\"background: lightgoldenrodyellow;\" title=\"2d6.   Base step 8\"><b>Step:</b> 8</span>."]},{"_tag":".even","_attrs":{},"_css":{},"_children":["<b>Result:</b> <span style=\"background-color: #FEF68E; border: 2px solid #3FB315; padding: 0 3px 0 3px; font-weight: bold; cursor: help; font-size: 1.1em;\" title=\"Rolling 2d6! = (6+6+2+1)\">15</span>   <span style='color: green;'>Success</span>!<span style=\"background: lightgoldenrodyellow;\" title=\"2 total successes!\"> (1 EXTRA Success)</span>"]},{"_tag":".odd","_attrs":{},"_css":{},"_children":["<b>Action:</b> Free"]},{"_tag":".even","_attrs":{},"_css":{},"_children":["<b>Description</b><span style=\"border: solid 1px yellow;\" title=\"The adept avoids injury by dodging or parrying blows directed against him. When attacked in close or ranged combat, the adept may make an Avoid Blow test against his opponent’s Attack test result. If successful, the adept avoids the blow-he sees the attack coming and dodges or parries it at the last moment. The adept can avoid a maximum number of attacks equal to his Avoid Blow rank each round, but only one attempt per Attack test. An adept cannot use Avoid Blow if he is blindsided or surprised by his attacker.&#013;2023-4-16 : Entry update triggered by Addition of another ability - data comes from  unknown source &#013;\">(Hover)</span>"]}]}]}
"<div class=\"sheet-rolltemplate-sect\" style=\"\"><div class=\"sheet-rolltemplate-header sheet-rolltemplate-icon-action\" style=\"\">Avoid Blow</div><div class=\"sheet-rolltemplate-subheadertext\" style=\"\">vs. Ask: PD Target # 8.   1 strain.</div><div class=\"sheet-rolltemplate-body\" style=\"\"><div style=\"background: #white;\"><span style=\"background: lightgoldenrodyellow;\" title=\"2d6.   Base step 8\"><b>Step:</b> 8</span>.</div><div style=\"background: #E9E9E9;\"><b>Result:</b> <span style=\"background-color: #FEF68E; border: 2px solid #3FB315; padding: 0 3px 0 3px; font-weight: bold; cursor: help; font-size: 1.1em;\" title=\"Rolling 2d6! = (6+6+2+1)\">15</span>   <span style='color: green;'>Success</span>!<span style=\"background: lightgoldenrodyellow;\" title=\"2 total successes!\"> (1 EXTRA Success)</span></div><div style=\"background: #white;\"><b>Action:</b> Free</div><div style=\"background: #E9E9E9;\"><b>Description</b><span style=\"border: solid 1px yellow;\" title=\"The adept avoids injury by dodging or parrying blows directed against him. When attacked in close or ranged combat, the adept may make an Avoid Blow test against his opponent’s Attack test result. If successful, the adept avoids the blow-he sees the attack coming and dodges or parries it at the last moment. The adept can avoid a maximum number of attacks equal to his Avoid Blow rank each round, but only one attempt per Attack test. An adept cannot use Avoid Blow if he is blindsided or surprised by his attacker.&#013;2023-4-16 : Entry update triggered by Addition of another ability - data comes from  unknown source &#013;\">(Hover)</span></div></div></div>"

"<div class=\"sheet-rolltemplate-sect\" style=\"\">
<div class=\"sheet-rolltemplate-header sheet-rolltemplate-icon-action\" style=\"\">Avoid Blow</div>
<div class=\"sheet-rolltemplate-subheadertext\" style=\"\">vs. Ask: PD Target # 8.   1 strain.</div>
<div class=\"sheet-rolltemplate-body\" style=\"\">
<div style=\"background: #white;\"><span style=\"background: lightgoldenrodyellow;\" title=\"2d6.   Base step 8\"><b>Step:</b> 8</span>.</div>
<div style=\"background: #E9E9E9;\"><b>Result:</b> <span style=\"background-color: #FEF68E; border: 2px solid #3FB315; padding: 0 3px 0 3px; font-weight: bold; cursor: help; font-size: 1.1em;\" title=\"Rolling 2d6! = (6+6+2+1)\">15</span>
   <span style='color: green;'>Success</span>!<span style=\"background: lightgoldenrodyellow;\" title=\"2 total successes!\"> (1 EXTRA Success)</span></div>
   <div style=\"background: #white;\"><b>Action:</b> Free</div><div style=\"background: #E9E9E9;\"><b>Description</b><span style=\"border: solid 1px yellow;\" 
   title=\"The adept avoids injury by dodging or parrying blows directed against him. When attacked in close or ranged combat, the adept may make an Avoid Blow test against his opponent’s Attack test result. If successful, the adept avoids the blow-he sees the attack coming and dodges or parries it at the last moment. The adept can avoid a maximum number of attacks equal to his Avoid Blow rank each round, but only one attempt per Attack test. An adept cannot use Avoid Blow if he is blindsided or surprised by his attacker.&#013;2023-4-16 : Entry update triggered by Addition of another ability - data comes from  unknown source &#013;\">(Hover)
   </span></div></div></div>"
  let t = "<div class=\"sheet-rolltemplate-sect\" style=\"\"><div class=\"sheet-rolltemplate-header sheet-rolltemplate-icon-action\" style=\"\">Avoid Blow</div><div class=\"sheet-rolltemplate-subheadertext\" style=\"\">vs. Ask: PD Target # 8.   1 strain.</div><div class=\"sheet-rolltemplate-body\" style=\"\"><div style=\"background: #white;\"><span style=\"background: lightgoldenrodyellow;\" title=\"2d6.   Base step 8\"><b>Step:</b> 8</span>.</div><div style=\"background: #E9E9E9;\"><b>Result:</b> <span style=\"background-color: #FEF68E; border: 2px solid #3FB315; padding: 0 3px 0 3px; font-weight: bold; cursor: help; font-size: 1.1em;\" title=\"Rolling 2d6! = (6+6+2+1)\">15</span>   <span style='color: green;'>Success</span>!<span style=\"background: lightgoldenrodyellow;\" title=\"2 total successes!\"> (1 EXTRA Success)</span></div><div style=\"background: #white;\"><b>Action:</b> Free</div><div style=\"background: #E9E9E9;\"><b>Description</b><span style=\"border: solid 1px yellow;\" title=\"The adept avoids injury by dodging or parrying blows directed against him. When attacked in close or ranged combat, the adept may make an Avoid Blow test against his opponent’s Attack test result. If successful, the adept avoids the blow-he sees the attack coming and dodges or parries it at the last moment. The adept can avoid a maximum number of attacks equal to his Avoid Blow rank each round, but only one attempt per Attack test. An adept cannot use Avoid Blow if he is blindsided or surprised by his attacker.&#013;2023-4-16 : Entry update triggered by Addition of another ability - data comes from  unknown source &#013;\">(Hover)</span></div></div></div>";
  log( t );
  this.chat( t.replace( /(\r|\n)/g , " "), Earthdawn.whoTo.public | Earthdawn.whoFrom.player | Earthdawn.whoFrom.character );
  let t2 = t.replace( /style\=\".*?\"/gi, "" );
  log(t2);
  this.chat( t2.replace( /(\r|\n)/g , " "), Earthdawn.whoTo.public | Earthdawn.whoFrom.player | Earthdawn.whoFrom.character );
  let t3 = t.replace( /style\=\"background: lightgoldenrodyellow;\"/gi, "class=\"sheet-rolltemplate-extra\"" );
  log(t3);
  this.chat( t3.replace( /(\r|\n)/g , " "), Earthdawn.whoTo.public | Earthdawn.whoFrom.player | Earthdawn.whoFrom.character );
*/


/* findthis
          this.chat( sect.toString().replace( /(\r|\n)/g , " "), Earthdawn.whoTo.public | Earthdawn.whoFrom.player | Earthdawn.whoFrom.character );


              let attributes = findObjs({ _type: "attribute", _characterid: po.charID });
let cnt = 0;
log( attributes.length);
              _.each( attributes, function (att) {
                if( att.get("name").startsWith( "repeating_message_"))
                  log( att.get( "name" ) + "   '" + att.get("max") + "'   " + att.get("current"));
++cnt;
              }); // End for each attribute.
log( cnt);
//log("'".charCodeAt(0)); // 39 = Apostrophe
//log("`".charCodeAt(0)); // 96 = grave accent
*/
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
// Findtest, finddebug




            } catch(err) { Earthdawn.errorLog( "ED Test error caught: " + err, po ); }
          log( Earthdawn.timeStamp() + "Test Done" );
          break;
        }
      } catch(err) { Earthdawn.errorLog( "ED.Debug() error caught: " + err, po ); }
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
      } catch(err) { Earthdawn.errorLog( "ED.doNow() error caught: " + err, this ) }
    } // End ParseObj.DoNow()



          // ParseObj.findAllPagesAnyPlayterIsOn()
          //
          // Returns an array of pageIDs. 
          // if testOnline is false then list is of all pages, whether players are online or not. Otherwise it is only online players. Defaults to true.
    this.findAllPagesAnyPlayterIsOn = function( testOnline )  {
      'use strict';
      try {
        if( testOnline === undefined || testOnline ) testOnline = true;   // testOnline defaults to true. Set to native boolean so don't have to convert each loop.
        else testOnline = false;
        let pgs = Campaign().get( "playerspecificpages" ),            // object of pages that have players on them. 
            players = findObjs({ _type: "player", _online: true }),   // array of online players. 
            ret = [ Campaign().get( "playerpageid" ) ];               // the all players page.
        if( pgs )
          Object.entries( pgs ).forEach(([key, val]) => {
            if(( testOnline || ( key in players )) && ( !( key in ret)))    // If page is not already in ret, and page is an online player, add it to the list.
              ret.push( val );
          });
        players.forEach( function( item ) {
          'use strict';
          if( playerIsGM( item.get( "_id" )) && !ret.includes( item.get( "_lastpage" )))   // if player is gm and last page they visited is not already in ret, add it. 
            ret.push( item.get( "_lastpage" ));
        });
        return ret;
      } catch(err) { Earthdawn.errorLog( "ED.findAllPagesAnyPlayterIsOn() error caught: " + err, this ); }
    };     // End ParseObj.findAllPagesAnyPlayterIsOn



          // ParseObj.FindPageOfPlayer()
          //
          // Returns pageID of page this player is on. 
          //
          // Note that Jun 2024 I think the only routine that called this now calls findAllPagesAnyPlayerIsOn instead. So routine might be useless.
    this.FindPageOfPlayer = function( playerID )  {
      'use strict';
      try {
        let pgs = Campaign().get( "playerspecificpages" ),
        ret;
        if ( pgs && ( playerID in pgs ))
          ret = pgs[ playerID ];
        else    // player is on the all players page. 
          ret = Campaign().get( "playerpageid" );
        return ret;
      } catch(err) { Earthdawn.errorLog( "ED.FindPageOfPlayer() error caught: " + err, this ); }
    };     // End ParseObj.FindPageOfPlayer



          // ParseObj.ForEachToken ()
          // For Each selected token, perform some command.
          // ssa is an array that holds any modifiers for the ForEach command.  Look in the switch statement below for description of options.
    this.ForEachToken = function( ssa ) {
      'use strict';
      let edParse = this;
      try {
        this.tokenIDs = [];
        let bst = false,      // Do we want all selected tokens?
          bsct  = false,      // Do we want all selected character tokens?
          bust  = false,      // Do we want to look in unselected tokens if we can't find with the above?
          binmt = false,      // Do we want to ignore all selected tokens that do not match the character ID?
          btuc  = false,      // Token Unique Character - Ignore all except the first token for each unique character.
          bc    = false,      // Do we want character (if found nothing else)?
          flag  = 0,          // Instead of doing a ForEachToken loop:  1 - return a list of tokens.
          mooks = false,      // Do we want to ignore all selected non-mooks?
          notMooks = false,   // Do we want to ignore all selected mooks?
          PCs   = false,      // Do we want to ignore all selected NPCs?
          NPCs  = false,      // Do we want to ignore all selected PCs?
          notPCs = false,     // Do we want to ignore all selected non-PCs?
          objarr = [];

        for ( let i = 1; i < ssa.length; i++) {
          switch ( Earthdawn.safeString( ssa[ i ] ).toLowerCase() ) {
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
            let TokObj = getObj("graphic", sel._id);
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
              let npc = Earthdawn.getAttrBN( cID, "NPC", "1" );
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
              let pages = this.findAllPagesAnyPlayterIsOn(),
                  tkns = [];
              pages.forEach(( page ) => {
                tkns = _.union( tkns, findObjs({ _pageid: page, _type: "graphic",  _subtype: "token", represents: this.charID }));
              });
              _.each( tkns, function( TokObj ) {                   // Check all tokens found
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
          else if ( (bsct || binmt) && objarr.length > 1 && Earthdawn.getAttrBN( this.charID, "NPC", "1" ) != Earthdawn.charType.mook ) {
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
          } else {    // This is the more normal case. Call all the rest of the command line, with each token found.
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
      } catch(err) { Earthdawn.errorLog( "ED.ForEachToken() error caught: " + err, edParse ); }
    } // End ParseObj.ForEachToken()



          // ParseObj.ForEachTokenList()
          // We have been passed a list of Token IDs. (generated by a previous threads call to ForEachToken()
          // One by one, do a ForEach loop for each token id.
          // Note that this is usually the list of tokens we are doing the command for (not to). IE: Tokenlist is attacking TargetSet. 
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
      } catch(err) { Earthdawn.errorLog( "ED.ForEachTokenList() error caught: " + err, edParse ); }
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
      } catch(err) { Earthdawn.errorLog( "ED.checkForStoredTargets() error caught: " + err, this ); }
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
          if( this.bFlags & Earthdawn.flagsTarget.Highest ) {    // If target is looking for highest one in the list, find it and then continue with the rest of the commands (we don't do anything for each target, we just find the one target).
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
            }
          } else if( this.bFlags & Earthdawn.flagsTarget.Each ) {    // Save all the target numbers, since we will be comparing each of them to the rolled value later. Again this does not setup multiple rolls.
            this.eachTargets = [];
            for( let i = 0; i < this.targetIDs.length; ++i ) {
              let x = this.TargetCalc( this.targetIDs[ i ], this.bFlags );
              if( x !== undefined && x[ "val" ] )
                this.eachTargets.push({ tID: this.targetIDs[ i ], tName: x[ "name" ], tNum: x[ "val" ] });
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
            this.indexMsg = this.edClass.msgArray.length;         // Set edParse to be Done for the original copy (since have already done it for each copy).
        } }
      } catch(err) { Earthdawn.errorLog( "ED.ForEachTarget() error caught: " + err, this ); }
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
              let newParse = _.clone( this );
              newParse.Roll( ssa );
          } }
        } else  // No token has hits recorded. Just do it once for each token.
        this.Roll( ssa );
      } catch(err) { Earthdawn.errorLog( "ED.ForEachHit() error caught: " + err, this ); }
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
          if( Earthdawn.safeString( ss[ 0 ] ).toLowerCase() === "effect" && start == 0 )    // Effect tests usually (possibly always) only come through here once, so we need to simulate going through once per target.  Everything else should be going through this routine once per target already.
            end = this.targetIDs.length;

          for( let ind = start; ind < end; ++ind ) {
            let typ = (ss[ 1 ] + "-" + Earthdawn.safeString( ss[ 2 ]) ).toLowerCase();
            if( Earthdawn.safeString( ss[ 1 ]).startsWith( "Custom " )) {        // Custom Effect
              let cust = findObjs({ _type: 'custfx', name: Earthdawn.safeString( ss[ 1 ] ).slice( 7 ) })[0];
              if( cust && cust.get( "_id" ))
                typ = cust.get( "_id" );
              else {
                this.chat( "Error! Invalid Custom FX Name: '" + ss[ 1 ] + "'. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiWarning );
                return;
              }
            } // End custom effect.
            if (Earthdawn.safeString( ss[ 3 ] ).startsWith( "Ct" )) {     // An effect that travels between two points.
              if( this.tokenIDs == undefined || (this.tokenIDs[ this.indexToken || 0]) >= this.tokenIDs.length )
                Earthdawn.errorLog( "Error! bad tokenID in FX", this);
              else if (this.targetIDs [ ind ] == undefined)
                Earthdawn.errorLog( "Error! targetIDs[] undefined in FX.", this);
              else {
                let tokObj1 = getObj("graphic", this.tokenIDs[ this.indexToken || 0 ] ),    // Caster
                  tokObj2 = getObj("graphic", Earthdawn.getParam( this.targetIDs [ ind ], 1, ":"));     // Target.
                if( !tokObj1 )
                  Earthdawn.errorLog( "Error! Unable to get Caster Token in FX." + this.edClass.msg.content, this);
                else if ( !tokObj2 )
                  Earthdawn.errorLog( "Error! Unable to get Target Token " + ind + " (" + this.targetIDs [ ind ] + ") in FX.", this);
                else
                  spawnFxBetweenPoints({x: tokObj1.get( "left" ), y: tokObj1.get( "top" )}, {x: tokObj2.get( "left" ), y: tokObj2.get( "top" )}, typ, tokObj1.get( "_pageid" ));
              }
            } else {                        // A single point effect.
              let tokObj = getObj("graphic", (Earthdawn.safeString( ss[ 3 ]).startsWith( "CO" )) ? this.tokenIDs[ this.indexToken || 0 ]
                    : Earthdawn.getParam( this.targetIDs [ ind ], 1, ":"));     // Caster or Target.
              if( tokObj )
                spawnFx( tokObj.get( "left" ), tokObj.get( "top" ), typ, tokObj.get( "_pageid" ));
              else
                Earthdawn.errorLog( "Error! Unable to get Token in FX.", this);
          } }
        } else if( Earthdawn.safeString( ssa[ 0 ] ).toLowerCase() === "fxset" ) {     // Being called from Parse().
                  // FXset: (1)(code): (2)(rowID): (3)Set/Clear: (4)Attempt/Success: (5)Effect: (6)Color
          let to = "";
          if (ssa[ 3 ] === "Set" ) {    // If not Set, it is Clear, so just leave the empty string.
            if( Earthdawn.safeString( ssa[ 5 ] ).startsWith( "Custom " ))
              ssa[ 6 ] = "";      // Custom effects ignore color.
            ssa[ 5 ] = Earthdawn.safeString( ssa[ 5 ] ).replace( /}/g, "");     // Due to a system bug, I get an extra closing brace. Just remove it here.
            let typ = ssa[ 5 ].toLowerCase();
            if( Earthdawn.safeString( ssa[ 7 ] ).startsWith( "Ct" ) && ( typ !== "beam" && typ !== "breath" && typ !== "splatter" && !typ.startsWith( "custom" )))
              this.chat( "Warning! Only Beam, Breath, Splatter and Custom special effects can travel from the caster to a target. All others must affect only a single point, caster or targets. Try again.", Earthdawn.whoFrom.apiWarning );
            else if( !Earthdawn.safeString( ssa[ 7 ] ).startsWith( "Ct") && ( typ == "beam" || typ == "breath" || typ == "splatter" ))
              this.chat( "Warning! Beam, Breath, and Splatter special effects must travel from the caster to a target. Try again.", Earthdawn.whoFrom.apiWarning );
            else
              to = ssa.slice( 4 ).toString();     // separate out the special effects entries.
            this.chat( "Special Effects for " + Earthdawn.codeToName( Earthdawn.safeString( ssa[ 1 ] )) + " "
                + Earthdawn.safeString( Earthdawn.getAttrBN( this.charID, Earthdawn.buildPre( ssa[ 1 ], Earthdawn.safeString( ssa[ 2 ])) + "Name")) + " Set." );
          } else
            this.chat( "Special Effects for " + Earthdawn.codeToName( ssa[ 1 ] ) + " "
                  + Earthdawn.getAttrBN( this.charID, Earthdawn.buildPre( ssa[ 1 ], ssa[ 2 ]) + "Name") + " Cleared." );
          this.setWW( Earthdawn.buildPre( ssa[ 1 ], ssa[ 2 ] ) + "FX", to );
        } else
        this.chat( "Error! badly formed FX command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiWarning );
      } catch(err) { Earthdawn.errorLog( "ED.FX error caught: " + err, this ); }
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
          let CharObj = getObj( "character", TokenObj.get( "represents" )) || "";
          if (typeof CharObj === 'undefined' || CharObj == "")
            return;
          TokenName = CharObj.get("name");
        }
        return TokenName;
      } catch(err) { Earthdawn.errorLog( "ED.getTokenName() error caught: " + err, this ); }
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
//log("GetStatusToken ( " + JSON.stringify(ca) + " , " + JSON.stringify(sm) + " ) ")
        let mi = _.find( Earthdawn.StatusMarkerCollection, function(mio){ return mio["code"] == ca[ 0 ]; });
        if( mi !== undefined )
          ret = Earthdawn.parseInt2( getAttrByName( cID, mi["attrib"], 0 )) * ca[1];
      } catch(err) { Earthdawn.errorLog( "ED.GetTokenStatus() error caught: " + err, this ); }
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
      } catch(err) { Earthdawn.errorLog( "ED.GetTokenValue() error caught: " + err, this ); }
      return ret;
    } // End ParseObj.GetTokenValue()



          // if subfunct is 1, return collection of selected token ids and character ids, grouped by character.
          // if subfunct is 2, return list of selected character tokens, ungrouped.
          // This is an easy way to see how many different charcters are selected.
    this.getUniqueChars = function( subfunct )  {
      'use strict';
      let po = this;
      try {
        let arr = [];
        _.each( po.edClass.msg.selected, function( sel ) {                // Check selected tokens
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
      } catch(err) { Earthdawn.errorLog( "ED.getUniqueChars() error caught: " + err, po ); }
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
            attrib = Earthdawn.safeString( attrib.trim());
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
              raw = Earthdawn.safeString( raw );
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
                  processed = processed.slice(0, begin) + Earthdawn.safeString( this.getValue( tst )) + processed.slice( end + 1);
                  begin = processed.indexOf( "@{" );
              } }
              if( err )
                this.chat( "Error! getValue() failure. '" + attrib + "' = '" + raw + "'   Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError);
              else
                ret = eval( processed );
        } } }
      } catch(err) { Earthdawn.errorLog( "ParseObj.getValue() error caught: " + err, this ); }
//if( fSpecial == 2) log( "ret: '" + ret + "'");    // fSpecial == 2 is just an easy way to get logging on some values but not others.
//if( fSpecial == 2) log( "ret: '" + Earthdawn.parseInt2(ret) + "'");
    return ( fSpecial === 1 ) ? ret : Earthdawn.parseInt2( ret, true );
    } // End ParseObj.getValue()



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

        if( state.Earthdawn.sheetVersion < 1.8 || (!Earthdawn.isString( ssa) && !isNaN(ssa[ 1 ] ))) {
            // NOTE: KEEP THIS. even with versions greater than 2.0 we still get some calls with a real ssa, mainly "one karma only", and 
            // action puts a karma command into Dolater.  So this code is not dead.
            //
            // With version < 2.0, you are likely to get something called a "Karma-Control".
            //      ssa : Karma Control. -1 = Never, 0 or undefined = look to sheetwide karma. >1 = Always use this number of Karma.
            // Note: also accepts ssa[0] being "def", "kcdef", or "dpdef" and ssa[1] being a numeric literal value to use as default, with other actual values to follow.
            // Note: if kask and/or dpask are set, it just skips looking at karma control, so beware that an ask can overwrite karma control.
          if( Earthdawn.isString( ssa ))
            ssa = [ "", ssa ];
          let ttmp, kc, dp,
            realkcdef = true,   // We want to know if we were passed a real default for karma control, or whether we are assuming a default.
            realdpdef = true;
          if( kcdef === undefined)                          { kcdef = -1;     realkcdef = false;  }
          if( dpdef === undefined || state.Earthdawn.g1879) { dpdef = -1;     realdpdef = false;  }
          if((ssa !== undefined) && (ssa.length > 0 ))
            for( let i = 1; i < ssa.length; i++) {
              let skip = false;
              kc = kcdef;
              dp = dpdef;
              ttmp = ssa[ i ];
              if( Earthdawn.isString( ttmp )) {
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
                } else if( Earthdawn.safeString( ssa[ 0 ] ).toLowerCase().startsWith( "d" ))    // If we got a number, and ssa[0] starts with d, then it is DP, otherwise karma.
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
        } else {    // state.Earthdawn.sheetVersion 2.0 or greater. (except that some v 2.0 and greater calls get processed in the block above this). 
            // With Version >= 2.0 you will get a string.
            //    ssa: Dex-Karma
            // If this contains the word "karma" we also do the same thing with "DP".
            // (this assumes that if passed "Dex-Karma", then there will also be: Dex-Karma-Limit, Dex-Karma-Limit_max, Dex-Karma-Ask,
            // Dex-DP, Dex-LP-Limit, Dex-DP-Limit_max, and Dex-DP-Ask).

            // global karma has three modes, off, auto, and Ask.
            // Local karma has a max, and a value from 0 through max.  Auto
            // If global Off, no karma.   If Auto, use local.     If ask, and the spread of allowed values is greater than one, ask.
//          if( !_.String( ssa ))
//            Earthdawn.errorLog( "ParseObj.Karma() error, SSA is not a string in version 2.0", this );
          if( !_.isString( ssa ))
            if( ssa.length < 2 )
              Earthdawn.errorLog( "ParseObj.Karma() error, SSA is not a string and is of length less than 2 in version 2.0", this );
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
          } } } }   // end V2.0 and greater specific code. 

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
                log( Earthdawn.timeStamp() + "Note: the above error probably mean the token is not linked correctly, since the character sheet has karma, but the token does not." )
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

          if( ddice > 0 ) {     // Are we spending more than zero Devotion Points?    Note: Devotion is a bit simpler than karma, since it in on the sheet only, not in the token bar.
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
      } catch(err) { Earthdawn.errorLog( "ED.Karma() error caught: " + err, this ); }
    } // End ParseObj.Karma()



          // ParseObj.LinkToken ()
          // Make sure the character associated with CharID is ready to Link.
          // Link all selected tokens to this character.
          //
          // By default the routine both sets the token to some standards, and links it.
          // if ssa[1] is "SetToken", then set the token only, don't link it.
    this.LinkToken = function( ssa ) {
      'use strict';
      let edParse = this;
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
        let pc = Earthdawn.getAttrBN( this.charID, "NPC", "1");
        if( pc == Earthdawn.charType.mook && this.edClass.msg.selected.length > 1 )
        {
            this.chat( "Error! You can't link more than one token to a non-mook character!", Earthdawn.whoFrom.apiWarning );
            return;
        }

        let sName = "";
        let CharObj = getObj( "character", edParse.charID ),
          setTokenOnly = (ssa && ssa.length > 1) ? ssa[1].search( /SetToken/i ) !== -1 : false;

        _.each( edParse.edClass.msg.selected, function( sel ) {
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
          this.chat( "Token " + sName + " is linked" +  (pc == Earthdawn.charType.mook ? " as Mook." : 
                ( pc == Earthdawn.charType.pc ? " as PC." : ( pc == Earthdawn.charType.npc ? "as NPC." : " as Object."))), Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive );
        this.Debug( [ "Debug", "repSecFix", "silent" ] );
      } catch(err) { Earthdawn.errorLog( "ED.LinkToken error caught: " + err, edParse ); }
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

//log("this.Lookup " + JSON.stringify(ssa));
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
            switch ( Earthdawn.safeString( ssa[ i ] ).toLowerCase() ) {
              case "defensive":     // This action is defensive. If Defensive Stance is turned on, add 3 to compensate for the three that were subtracted previously.
                if( Earthdawn.getAttrBN( this.charID, "combatOption-DefensiveStance", "0" ) === "1" ) {
                  lu += Earthdawn.parseInt2(Earthdawn.getAttrBN( this.charID, "Misc-DefStance-Penalty", "3" ));
// CDD todo finish
// needs two things finished, whatever I was doing before, plus the defensive changes from binary to 8 values.
//log(" parsing the defensive " + Earthdawn.getAttrBN( this.charID, "Misc-DefStance-Penalty", "3" ));
                  this.misc[ "Defensive" ] = true;    // Since step was modified for being defensive, tell people.
                } break;
                        // note: resistance is depreciated.
              case "resistance":    // This action is a Resistance Roll. If character is knocked down, add 3 to compensate for the three that were subtracted previously.
                if( Earthdawn.getAttrBN( this.charID, "condition-KnockedDown", "0" ) === "1" ) {
                  lu += 3;
                  this.misc[ "Resistance" ] = true;     // Resistance is depreciated 8/22
                } break;
              case "movebased": {   // This action is Movement Based. If Movement Penalties are in effect, subtract them from this result.
                let tstep = Earthdawn.getAttrBN( this.charID, "condition-ImpairedMovement", "0" );
                if( tstep > 0 ) {
                  lu -= tstep;
                  this.misc[ "MoveBased" ] = (tstep == 2) ? "Partial" : Full;
                }
              } break;
                        // note: visionbased is depreciated. 
              case "visionbased": { // This action is Vision Based. If Vision Penalties are in effect, subtract them from this result.
                let tstep = Earthdawn.parseInt2(Earthdawn.getAttrBN( this.charID, "condition-Darkness", "0" ));
                if( tstep > 0 ) {
                  lu -= tstep;
                  this.misc[ "VisionBased" ] = (tstep == 2) ? "Partial" : Full;    // NotVisionBased depreciated 8/22
                }
              } break;
              default:
                let raw;
                if( ssa[ i ].charAt( 1 ) === "{" && ( ssa[ i ].charAt( 0 ) != "?" && ssa[ i ].charAt( 0 ) != "@" ))     // We want to filter out things that come from stuff like      modValue : x{Modification|0}
                  raw = 0;
                else {
                  raw = getAttrByName( this.charID, ssa[ i ] );
//log("looking for " + ssa[i] + " result " + raw);
                  if( raw !== undefined )
                    if( (typeof raw === "number") || (raw.indexOf( "@{") === -1))           // We have an actual number to use
                      lu += Earthdawn.parseInt2( raw );
                    else                            // we have a formula for getting an actual number.
                      rcmd += "+(@{" + Earthdawn.safeString( this.tokenInfo.characterObj.get( "name" )) + "|" + Earthdawn.safeString( ssa[ i ]) + "})";
          } }   }
//log("after ssa[i] " + ssa[i] + " lu is "+lu);

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
      } catch(err) { Earthdawn.errorLog( "ED.Lookup() error caught: " + err, this ); }
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
      } catch(err) { Earthdawn.errorLog( "ED.MacroDetail error caught: " + err, this ); }
    } // End ParseObj.MacroDetail()



          // ParseObj.MarkerSet ( ssa )
          // Set the Status Markers for current tokens
          //  ssa[ 0 ] This does not matter, except if it is "sheetDirect", then the value has been directly changed on the sheet, and we
          //      want to set the status marker, but we do NOT want to update the value on the sheet (again).
          //  ssa[ 1 ] is condition to be set OR name of marker to be set. IE: "aggressive" or "sentry-gun" both set the same marker.
          //  ssa[ 2 ] level.
          //        If boolean false, -1 or start with letter the letter U (unset) or O (for off - but not equal ON), remove the marker.
          //        If zero or not present or is ON or starts with S (set), set the marker without a badge.
          //        If starts with a "t" than toggle it from set to unset or visa versa, or if more than two valid values, to the next value in the sequence.
          //        If starts with a "z", expect a numeric value, except in this specific case, a zero means unset.
          //        If 1 - 9, or A-I set the marker with the number as a badge.
          //            Note: there is a weird thing in linking a token where it is better to have no digits in the menu. thus A-I substitute for 1-9.           //                  If ++, --, ++n, or --n then adjust from current level.
          //  NOTE: if the marker status collection has a submenu, it is important to pass exactly values in the submenu, IE: u for unset, b for 2, etc.
          //  Example: [ "", "aggressive", "Set"] or [ "", "sentry-gun", "Off"].
    this.MarkerSet = function( ssa )  {
      'use strict';
      let po = this;
      try {
//log("this.MarketSet ssa is : " + JSON.stringify(ssa));
        if( this.tokenInfo === undefined ) {
          this.chat( "Error! tokenInfo undefined in MarkerSet() command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError);
          return;
        }
        if( ssa.length < 3 ) {
          this.chat( "Error! bad MarkerSet() arguments (" + JSON.stringify( ssa ) + "). Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError);
          return;
        }
        if( this.tokenInfo.type === "token" ) {

                  // Find the status, icon, or attribute in the StatusMarkerCollection.
          function findMenuItem( lookup ) {   // This is reused at the bottom of MarkerSet.
            'use strict';
            let lowered = Earthdawn.safeString( lookup ).toLowerCase(),
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
          let mi = tmp.item,
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
            mook = (Earthdawn.getAttrBN( this.charID, "NPC", "1" ) == Earthdawn.charType.mook ),
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
// log("test " + JSON.stringify(valid));
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
              if( Earthdawn.safeString( tshared ).slice( 0, 3).toLowerCase() === "neg" ) {    // There are a pair of markers, one has negative buffs, and the other has positive buffs.
                for( let i = 9; i > 0; --i )
                  valid.push({ level: 0 - i, attrib: 0 - i, badge: i, marker: mark });
              } else if( Earthdawn.safeString( tshared ).slice( 0, 3).toLowerCase() === "pos" ) {
                for( let i = 1; i < 10; ++i )
                  valid.push({ level: i, attrib: i, badge: i, marker: mark });
              } else
                this.chat( "Earthdawn: Markerset Warning. Unable to parse " + JSON.stringify( mia[ i ] ), Earthdawn.whoFrom.apiWarning );
          } // end make list of validValues and validBadges
          valid = _.sortBy( valid, "level" );
//log(mi); log( JSON.stringify( valid));

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
                ss = Earthdawn.safeString( ssa[ 2 ] ).toLowerCase();
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
//log("level " + level);

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
              Earthdawn.errorLog( "Earthdawn markerSet serious error finding " + oldLevel + " giving up.", po);
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
          if( !setObj ) {
            this.chat( "Earthdawn: Markerset error. level is undefined.", Earthdawn.whoFrom.apiWarning );
            return;
          }
                    // end setting and/or adjusting level. We now know what we want to do.
                    // Do the actual marker setting.
//log( "level: " + level + "  setObj: " + JSON.stringify( setObj ));
          if( "marker" in setObj )
            Earthdawn.set( this.tokenInfo.tokenObj, "status_" + setObj[ "marker" ], setObj.badge );
//log( "have set 'status_" + setObj[ "marker" ] + "' to " + setObj.badge );

                    // If this character has not already been done, also change the character sheet.
          if( ssa[ 0 ] !== "sheetDirect" && !dupChar && ( attrib != undefined ) && !(mook && attrib === "condition-Health" )) {
//log("setting att. old is");
            let attribute = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: attrib }, 0);
//log(attribute);
            if( attribute[ "current" ] != setObj.attrib )
              Earthdawn.setWithWorker( attribute, "current", setObj.attrib );
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
        } } // End tokeninfo type is "Token"
//log("end MarkerSet");
      } catch(err) { Earthdawn.errorLog( "ParseObj.MarkerSet() error caught: " + err, po ); }
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
      let po = this;
      try {
        switch ( Earthdawn.safeString( ssa[ 1 ] ).toLowerCase() ) {
          case "add" :      // Add or subtract from an attribute.   ssa[2] an attribute, ssa[3] a value.
            try {
              if( ssa.length > 2 && Earthdawn.parseInt2( ssa[ 3  ] )) {
                let attribute2 = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: ssa[ 2 ].trim() });
                Earthdawn.setWithWorker( attribute2, "current", Earthdawn.parseInt2( ssa [ 3 ] ) + Earthdawn.parseInt2( attribute2.get( "current" )));
              }
            } catch(err) { Earthdawn.errorLog( "ED.funcMisc.Add error caught: " + err, po ); }
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
            } catch(err) { Earthdawn.errorLog( "ED.funcMisc.CorruptKarma error caught: " + err, po ); }
            break;
/*
          case "karmabuy":      // We know how many karma were bought, send out an accounting entry.
            try {
// Oct 23  obsolete. moved to sheetworker.
              if( ssa.length > 1 && Earthdawn.parseInt2( ssa[ 2  ] )) {
                let newKarma = Earthdawn.parseInt2( ssa [ 2 ] ),
                  today = new Date(),
                  stem = "&{template:chatrecord} {{header=" + getAttrByName( this.charID, "character_name" ) + "}}"
                        + "{{misclabel=Buy Karma}}{{miscval=" + newKarma + "}}"
                        + "{{lp=" + (newKarma * 10) + "}}",
                  slink = "{{button1=[Press here](!Earthdawn~ charID: " + this.charID
                        + "~ Record: ?{Posting Date|" + today.getFullYear() + "-" + (today.getMonth() +1) + "-" + today.getDate()
                        + "}: : LP: ?{Action Points to post|" + (newKarma * 10)
                        + "}: 0: Spend: ?{Reason|Buy " + newKarma + " Karma}";
                this.chat( stem + Earthdawn.colonFix( slink ) + ")}}", Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive );
              }
            } catch(err) { Earthdawn.errorLog( "ED.funcMisc.KarmaBuy error caught: " + err, po ); }
            break;
*/
          case "macrocreate":
            try {
              let cmd;
              if( ssa.length > 2 )
                cmd = Earthdawn.safeString( ssa[ 2 ] ).toLowerCase();
              if( cmd == "delete" || cmd == "refresh" ) {     // get rid of all macros that reference Earthdawn.
                let macs = findObjs({ _type: "macro" });
                _.each( macs, function (macObj) {
                  let act = macObj.get( "action" );
                  if( act.startsWith( "!Earthdawn" ) || act.startsWith( "!edToken" ) || act.startsWith( "!edsdr" ) || act.startsWith( "!edInit" ))
                    macObj.remove();
                });
              }
              if( cmd != "delete" && !(this.edClass && this.edClass.msg && this.edClass.msg.playerid && playerIsGM( this.edClass.msg.playerid ))) {
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
                this.MacroDetail( "Strain", "!edToken~ !Earthdawn~ setToken: @{target|token_id}~ Damage: ?{Damage)|1}: Strain: NA", true);
                this.MacroDetail( "KnockD", "!edToken~ %{selected|Knockdown}", true );
                this.MacroDetail( "Status", "!Earthdawn~ ChatMenu: Status", true );
                this.MacroDetail( Earthdawn.constant( "T" ) + "-Talents", "!Earthdawn~ ChatMenu: Talents", true );
                this.MacroDetail( Earthdawn.constant( "SK" ) + "-Skills", "!Earthdawn~ ChatMenu: Skills", true );
                this.MacroDetail( Earthdawn.constant( "WPN" ) + "-Damage", "!Earthdawn~ ChatMenu: Damage", true );
//                    this.MacroDetail( "•Status", "!edToken~ !Earthdawn~ ForEach~ Marker: ?{@{selected|bar2|max}}", true );
//                    this.MacroDetail( "⚡Cast", "!edToken~ %{selected|SP-Spellcasting}", true );   /* high voltage: 9889;
//              this.MacroDetail( Earthdawn.constant( "Target" ) + "Clear-Targets", "!Earthdawn~ charID: @{selected|character_id}~ ForEach~ TargetsClear", true);
//              this.MacroDetail( Earthdawn.constant( "Target" ) +   "Set-Targets", "!Earthdawn~ charID: @{selected|character_id}~ Target: Set", true);
                this.chat( "Macros created (look in collections tab).", this.WhoSendTo() | Earthdawn.whoFrom.api );
              }
            } catch(err) { Earthdawn.errorLog( "ED.funcMisc.MacroCreate error caught: " + err, po ); }
            break;
          case "newday":      // Recovery tests and Karma reset.   Some systems karma must be bought.
            try {
              let recov = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "Recovery-Tests" });
              let rt = (Earthdawn.parseInt2(recov.get( "max" )) || 2) + Earthdawn.getAttrBN( this.charID, "Misc-NewDayRecoveryOffset", "0", true);
//log(rt);
              Earthdawn.setWithWorker( recov, "current", rt.toString());           // set recovery tests available today to max.
              let karmaObj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "Karma" }, 0),
                  kparam  = ( ssa.length > 2 ) ? ssa[ 2 ] : Earthdawn.getAttrBN( this.charID, "Misc-KarmaRitual", "-1"),   // V3.19 and later karmaritual is passed.
                  dpparam = ( ssa.length > 3 ) ? ssa[ 3 ] : Earthdawn.getAttrBN( this.charID, "Misc-DPRitual", "-1"),
                  add;

              switch ( Earthdawn.parseInt2( kparam )) {
                case -1:      // set karma to it's max value
                  add = karmaObj.get( "max" );
                  break;
                case -2:      // Karma_ritual refills Circle per day
                  add = Earthdawn.getAttrBN( this.charID, "working-Circle", "0" );
                  break;
                case -3:      // Karma_ritual refills racial karma modifier per day
                  add = Earthdawn.getAttrBN( this.charID, "Karma-Modifier", "0" );
                  break;
                case -4: {    // There is a Karma Ritual Talent. Find it and use it's rank.
                          // go through all attributes for this character and look for ones we are interested in.
                  let po = this,
                      attributes = findObjs({ _type: "attribute", _characterid: this.charID });
                  _.each( attributes, function (att) {
                    if( att.get( "name" ).endsWith( "_Special" ))
                      if( att.get( "current" ) === "Karma Ritual" ) {
                        if( add === undefined ) {
                          let nm = att.get( "name" );
                          add = Earthdawn.getAttrBN( po.charID, Earthdawn.buildPre( Earthdawn.repeatSection( 3, nm), Earthdawn.repeatSection( 2, nm)) + "Effective-Rank", "0" );
                        } else
                          po.chat( "Warning, found more than one Talent/Knack/Skill with special Karma Ritual. Using the first found.", Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.apiWarning)
                      }
                  }); // End for each attribute.
                  if( add === undefined ) {
                    po.chat( "Warning, no Talent/Knack/Skill with special Karma Ritual. Using the Karma Modifier.", Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.apiWarning)
                    add = Earthdawn.getAttrBN( this.charID, "Karma-Modifier", "0" );
                  }
                } break;
                default :     // We were passed the number of karma to add. 
                  if( isNaN( kparam ) || ( kparam < 0))
                    this.chat( "ED.funcMisc.NewDay Warning, invalid karma parameter " + kparam + ".", Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.apiWarning)
                  else
                    add = kparam;
              };
              let newKarma = Math.min( Earthdawn.parseInt2( karmaObj.get( "max" )), Earthdawn.parseInt2(karmaObj.get( "current" )) + Earthdawn.parseInt2( add ))
                    + Earthdawn.getAttrBN( this.charID, "Misc-NewDayKarmaOffset", "0", true);
              Earthdawn.setWithWorker( karmaObj, "current", newKarma.toString());

              add = 0;
              switch ( Earthdawn.parseInt2( dpparam )) {
                case -1:      // set Add questor tier to their current devotion pool
                  add = Earthdawn.getAttrBN( this.charID, "IsQuestor", "0", true);
                  break;
                default :     // We were passed the number of karma to add. 
                  if( isNaN( dpparam ) || ( dpparam < 0))
                    this.chat( "ED.funcMisc.NewDay Warning, invalid DP parameter " + dpparam + ".", Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.apiWarning)
                  else
                    add = dpparam;
              };
              let added = "";
              if( add > 0 ) {
                let newDP = Math.min( Earthdawn.getAttrBN( this.charID, "DP_max", "0", true), Earthdawn.getAttrBN( this.charID, "DP", "0", true) + Earthdawn.parseInt2( add ));
                Earthdawn.setWithWorker( karmaObj, "current", newDP.toString());
                added = " " + add + " added to DP.";
              }
              this.chat( "New Day: Karma and Recovery tests reset." + added, this.WhoSendTo() | Earthdawn.whoFrom.character );
            } catch(err) { Earthdawn.errorLog( "ED.funcMisc.NewDay error caught: " + err, po ); }
            break;
          case "resetchars":      // reset all selected tokens to full health, karma, Recovery Tests, and no modifications or status markers.
            try {       // Note, when this routine enters, we will not have this.charID or TokenInfo set. So be careful what other functions get called.
              let lst = this.getUniqueChars( 1 ),
                  full = (ssa.length < 3) ? false : Earthdawn.safeString( ssa[ 2 ] ).toUpperCase().startsWith( "F" ),   // default to Mods Only. Full if Starts with F
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
                if( Earthdawn.getAttrBN( this.charID, "Creature-Ambushing_max", "0", true ) > 0 ) {    // If the creature can ambush, reset is that it is.
                  let mi = _.find( Earthdawn.StatusMarkerCollection, function(mio){ return mio[ "code" ] == "ambushing"; });
                  if( mi )
                    markers += Earthdawn.getIcon( mi ) + ",";
                }
                if( Earthdawn.getAttrBN( this.charID, "Creature-DivingCharging_max", "0", true ) > 0 ) {    // If the creature can charge, reset is that it is.
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
                    if( full && ( Earthdawn.getAttrBN( this.charID, "NPC", "1" ) == Earthdawn.charType.mook )) {   // We only need to process tokens if they are mooks. Otherwise everything is linked to the character.
                      Earthdawn.set( TokenObj, "bar1_value", karma);    // karma
                      Earthdawn.set( TokenObj, "bar2_value", 0);        // wounds
                      Earthdawn.set( TokenObj, "bar3_value", 0);        // damage
                      Earthdawn.set( TokenObj, "bar3_max",   unc );
                  } }   // end tokenObj
              } }
              this.chat( "Reset characters: " + nlist.slice( 0, -2 ) + ".", Earthdawn.whoTo.gm | Earthdawn.whoFrom.noArchive );
            } catch(err) { Earthdawn.errorLog( "ED.funcMisc.ResetChars error caught: " + err, po ); }
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
                } catch(err) { Earthdawn.errorLog( "ED.funcMisc.SetAdjust.copyCombatToAdjst error caught: " + err + "   On " + from + " to " + to, po ); }
              } // End copyCombatToAdjust()

              copyCombatToAdjust( "PD-Buff", "Defense-Phys-Adjust" );
              copyCombatToAdjust( "MD-Buff", "Defense-Myst-Adjust" );
              copyCombatToAdjust( "SD-Buff", "Defense-Soc-Adjust" );
              copyCombatToAdjust( "PD-ShieldBuff", "Shield-Phys" );
              copyCombatToAdjust( "MD-ShieldBuff", "Shield-Myst" );
              copyCombatToAdjust( "PA-Buff", "Armor-Phys-Adjust" );
              copyCombatToAdjust( "MA-Buff", "Armor-Myst-Adjust" );
              copyCombatToAdjust( "Movement-Buff", "Misc-Movement-Adjust" );
              copyCombatToAdjust( "Initiative-Mods",  (( state.Earthdawn.sheetVersion < 3.1 ) ? "Misc-Initiative-Adjust" : "Initiative-Adjust"));
              this.chat( "setAdjust: Temporary buffs have been set to permanent adjustments and cleared.", this.WhoSendTo() | Earthdawn.whoFrom.character );
            } catch(err) { Earthdawn.errorLog( "ED.funcMisc.SetAdjust error caught: " + err, po ); }
            break;
          case "state":
                      // Set various state.Earthdawn values.
                      // ssa is an array that holds the parameters.
                      //      Earthdawn~ State~ (one of the options below)~ (parameters).
            try {
              if( !playerIsGM( this.edClass.msg.playerid ) )
                this.chat( "Error! Only GM can set state variables.", Earthdawn.whoFrom.apiWarning );
              else {
                let logging = false, bitfield;
                switch( Earthdawn.safeString( ssa[ 2 ] ).toLowerCase() ) {
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
                  case "logmsg":
                    state.Earthdawn.logMsg = Earthdawn.parseInt2( ssa[ 3 ] ) ? true: false;
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
                  case "showdice":
                    state.Earthdawn.showDice = Earthdawn.parseInt2( ssa[ 3 ] ) ? true: false;
                    this.chat( "Campaign now set to showDice: " + state.Earthdawn.showDice );
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
                  default:
                    this.chat( "funcMisc:State bad command: " + ssa.toString( ssa ), Earthdawn.whoFrom.apiWarning );
                }
                if( bitfield ) {
                  state.Earthdawn.defRolltype = Earthdawn.parseInt2( ssa[ 3 ] ) ? (state.Earthdawn.defRolltype | bitfield) : (~state.Earthdawn.defRolltype & bitfield);
                  this.chat( "New character default RollType -   NPC: "   + ((state.Earthdawn.defRolltype & 0x01) ? "GM Only" : "Public")
                        + "   Mook: "   + ((state.Earthdawn.defRolltype & 0x02) ? "GM Only" : "Public") + "   PC: " + ((state.Earthdawn.defRolltype & 0x04) ? "GM Only" : "Public"));
                }
                if( logging )
                  this.chat( "Campaign now set to " + state.Earthdawn.game
                        + " - logging Startup: " + state.Earthdawn.logStartup + " -   "
                        + "Commandline: " + state.Earthdawn.logCommandline + " -   "
                        + "Msg: " + state.Earthdawn.logMsg + ".", Earthdawn.whoTo.player );
              }
            } catch(err) { Earthdawn.errorLog( "ED.funcMisc.State() error caught: " + err, po ); }
            break;
          case "toapi": {       // API, noAPI, Set, or Never Mind   If have not been using the API, then things are not setup correctly for API use. This sets it up. Can also be run as last thing before removing API to clean stuff up.
            if( ssa[ 2 ] === "Never Mind" )
              return;
            if( playerIsGM( this.edClass.msg.playerid )) {
              if( ssa[ 2 ] !== "Set" ) {
                let macs = findObjs({ _type: "macro" });      // to start with, remove all macros that reference earthdawn.
                _.each( macs, function (macObj) {
                  let act = macObj.get( "action" );
                  if( act.startsWith( "!Earthdawn" ) !== -1 || act.startsWith( "!edToken" ) !== -1 || act.startsWith( "!edsdr" ) !== -1 || act.startsWith( "!edInit" ) !== -1 )
                    macObj.remove();
                });
                let abs = findObjs({ _type: "ability" });      // then do the same for all abilities.
                _.each( abs, function (abObj) {
                  let act = abObj.get( "action" );
                  if( act.startsWith( "!Earthdawn" ) || act.startsWith( "!edToken" ) || act.startsWith( "!edsdr" ) || act.startsWith( "!edInit" ) )
                    abObj.remove();
                });
              }

              let attributes = findObjs({ _type: "attribute" }),
                noApi = ssa[ 2 ] === "noAPI";
              _.each( attributes, function (att) {
                let nm = att.get("name");
                if( nm === "API" )
                  att.set( "current", noApi ? "0" : "1" );
                else if ( nm.startsWith( "repeating_")) {
                  if( nm.endsWith( "_Name" ))     // No matter what, make sure we get the RowID set for this section.
                    Earthdawn.setWW( nm.slice( 0, -5) + "_RowID", Earthdawn.repeatSection( 2, nm), att.get( "_characterid" ));
                  else if ( nm.endsWith( "_CombatSlot" ) || (nm.endsWith( "_Contains" ) && (Earthdawn.repeatSection( 3, nm) === "SPM" ))) {
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
              this.chat( "Done.", this.WhoSendTo() | Earthdawn.whoFrom.api );
            }
          } break;
        } // end switch
      } catch(err) { Earthdawn.errorLog( "ED.funcMisc error caught: " + err, po ); }
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
        if( Earthdawn.getAttrBN( this.charID, "NPC", "1") != Earthdawn.charType.mook )
          return 0;
        if( this.tokenInfo === undefined || this.tokenInfo.type !== "token" )
          return 0;

        return Earthdawn.parseInt2( this.tokenInfo.tokenObj.get( "bar2_value" ) );
      } catch(err) { Earthdawn.errorLog( "ED.mookWounds error caught: " + err, this ); }
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
// This whole routine Obsolete Oct 23. Can be removed. 
    this.Record = function( ssa, clear ) {   // If clear is TRUE then clear out all the data entry fields on the record tab to prepare for next entry.
      'use strict';
      try {
log("Record Obsolete code. If you see this except on an 1879 sheet, please report to the API developer.");
        if( this.charID === undefined ) {
            this.chat( "Error! Trying Record() when don't have a CharID.", Earthdawn.whoFrom.apiError);
            return;
        }

        let nchar = 0,
          iyear,
          oldReal = "",
          oldThroalic = "",
          res,
          reason = "",
          kobj  = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "record-journal" }, ""),
          oldStr =  kobj.get( "current" );
        do {
            res = oldStr.slice( nchar, 28 + nchar).match( /\b\d{4}[\-\#\\\/\s]\d{1,2}[\-\#\\\/\s]\d{1,2}\b/g );   // find things  that looks like dates near the start of lines.
            if( res === null ) {
              nchar = oldStr.length;
              continue;
            }

            for( let i = 0; i < res.length; i++) {    // Find out what dates were on the last entry posted.
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
          if( ssa[i] ) reason += ":" + ssa[ i ];
        let Item = ssa[ 3 ],
          post =  (( ssa[ 1 ] === oldReal.trim())  ? "" : ( ssa[ 1 ] + " ")) +
                (( ssa[ 2 ] === oldThroalic.trim()) ? "" : ( ssa[ 2 ] + " ")) + String.fromCharCode( 0x25B6 ) + reason.slice(1) + " ";

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
            if( state.Earthdawn.gED ) {     // Earthdawn always just uses SP, we are going to figure it in copper.  upgrade would be to make change in GP if needed.
              let rawSP = ssa[ 5 ], borrow = 0, amount = 0;
              if( rawSP.trim().indexOf( "-" ) > 0 ) {
//                rawSP = rawSP.slice( 0, rawSP.indexOf( "-" ));     // The price is a range, such as 100 - 175.   Just lop off the 2nd half and assume they got the cheap price.
                let spa = rawSP.split( "-" );       // Rather than use cheapest, figure the average amount.
                for( let i = 0; i < spa.length; ++i )
                  amount += parseFloat( spa[ i ] );
                amount = amount / spa.length;
              }
              else 
                amount = parseFloat( rawSP );
              if( rawSP.toLowerCase().indexOf( "gp" ) !== -1 )          // If it does say it is gold, then convert gold to copper
                amount *= 100;
              else if( rawSP.toLowerCase().indexOf( "cp" ) === -1 )     // cIf it does not say it is already copper, convert silver to copper.
                amount *= 10;
              amount = Math.round( amount );      // Round to nearest CP.
              amount *= (( ssa[ 6 ] === "Spend" || ssa[ 6 ] === "Decrease" ) ? -1 : 1);
              if( amount != 0) {      // we have a non-zero amount
                let cobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "Wealth_Copper" }, 0),
                    sobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "Wealth_Silver" }, 100),
                    gobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "Wealth_Gold" }, 0);
                let oldCopper = Earthdawn.parseInt2( cobj.get( "current" )),
                    oldSilver = Earthdawn.parseInt2( sobj.get( "current" )),
                    oldGold = Earthdawn.parseInt2( gobj.get( "current" ));
                let newCopper = oldCopper + amount;
                while( newCopper < 0 ) {
                  ++borrow;
                  newCopper += 10;
                }
                if( newCopper != oldCopper )
                  Earthdawn.setWithWorker( cobj, "current", newCopper );
                let newSilver = oldSilver - borrow;
                borrow = 0;
                while (newSilver < 0 ) {
                  ++borrow;
                  newSilver += 10;
                }
                if( newSilver != oldSilver )
                  Earthdawn.setWithWorker( sobj, "current", newSilver );
                let newGold = oldGold - borrow;
                if( newGold != oldGold )
                  Earthdawn.setWithWorker( gobj, "current", newGold );
                post += ssa[ 6 ] + " " + rawSP + " " + (( rawSP.toLowerCase().indexOf( "p" ) == -1) ? "SP" : "") + " (new total " + ( newGold ? ( newGold + " gold, ") : "")
                      + ( newSilver + " silver") + ( newCopper ? ( ", " + newCopper + " copper") : "") + ") ";
              } // end Earthdawn money
            } else {    // 1879: £1/2/3 or £1/2/3 &4f or 2s/3, 2s/- or 3d & 4f.     If two, they are shillings and pence 5/2 = 5s/2d. If three they are pounds/shillings/pence.
              let mult = ( ssa[ 6 ] === "Spend" || ssa[ 6 ] === "Decrease" ) ? -1 : 1;
              let t = Earthdawn.safeString( ssa[ 5 ] ).replace( /-/g, "0").toLowerCase();
              if( t.trim().length > 0 && /\d/.test(t) ) {   // string is not blank, and contains a digit.

                function formatLSDF( gold, silver, copper, bronze) {
                  'use strict';
                  let c = 0, v = "";
                  if( gold )        { v = "£" + gold + "/"; c++; }
                  if( silver || c )   v += (silver ? silver : "-") + (c++ ? "" : "s") + "/";
                  v += (copper ? copper : "-") + (c++ ? "" : "d");
                  if( bronze )        v += " & " + bronze + "f";
                  return v;
                }

                let a = ssa[ 5 ].toLowerCase().replace( /l/g, "£").split( "/" );    // Allow L's for £.
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
           Earthdawn.setWithWorker( kobj, "current", post.trim() + ".\n" + oldStr );      // Post at top of page.
        else {    // This is the same date as the last post, so add this to the end of the entry for this day. 
            nchar = oldStr.indexOf( "\n" );
            if( nchar === -1 )
                nchar = oldStr.length;
            Earthdawn.setWithWorker( kobj, "current", oldStr.slice( 0, nchar) + "   " + post.trim() + "." + oldStr.slice( nchar ) );      // Post as a continuation of the top line.
        }
        if( post )
          this.chat( Earthdawn.getAttrBN(this.charID, "character_name") + " : " + post + ".", Earthdawn.whoTo.player | Earthdawn.whoTo.gm | Earthdawn.whoFrom.noArchive, null, this.charID);
        if( clear ) {
          this.setWW( "record-reason", "" );
          this.setWW( "record-amount-LP", 0 );
          if( state.Earthdawn.gED )
            this.setWW( "record-record-SP", 0 );
          else {    // 1879
          this.setWW( "record-amount-pound", 0 );
          this.setWW( "record-amount-shilling", 0 );
          this.setWW( "record-amount-pence", 0 );
          this.setWW( "record-amount-farthing", 0 );
        } }
      } catch(err) { Earthdawn.errorLog( "ED.Record() error caught: " + err, this ); }
    } // End parseObj.Record()



              // ParseObj.RerollNpcInit()
              // Go through all the initiatives currently existing, empty the list, but issue a command to have all conscious NPC's re-roll initiative.
    this.RerollNpcInit = function()  {
      'use strict';
      let po = this;
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
                  ( Earthdawn.getAttrBN( cID, "NPC", "1", true) > 0 ))   // Not Items, not PCs, and nobody unconscious.
            chatMsg += "~ SetToken : " + sel.id + "~ value : Initiative~ Init~ SetStep: 0~ SetResult: 0";
        });  // End for each selected token
        Campaign().set( "turnorder", JSON.stringify( newTO ));
        if( chatMsg.length > 0 )
          this.chat( "!Earthdawn" + chatMsg);
      } catch(err) { Earthdawn.errorLog( "ED.RerollNpcInit() error caught: " + err, po ); }
    } // End ParseObj.RerollNpcInit()



            // ParseObj.Roll ( ssa )
            // Roll a Test for selected token.
            //      ssa[] - Step modifiers.
    this.Roll = function( ssa )  {
      'use strict';
      try {
        let init = Earthdawn.safeString( ssa[ 0 ] ).toLowerCase() === "init";
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
        if( "step" in this.misc ) ssa.push( this.misc[ "step" ] );
        let dice,
          recipients = this.WhoSendTo(),
          step = this.ssaMods( ssa );   // Add any mods to roll.
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
        if( step == 0 && "reason" in this.misc && this.misc[ "reason" ].toLowerCase().indexOf( " only" ) !== -1 )    // One karma only and one devpoint only are allowed to make step zero rolls.
          ;
        else if ( step < 1 ) {
          if( init )
            this.misc[ "warnMsg" ] = "If anything other than armor and wounds are causing " + this.tokenInfo.tokenObj.get( "name" )
                    + " an initiative step of " + step + " it is probably illegal.";
          else if (this.misc[ "reason" ] && !this.misc[ "reason" ].startsWith( "1 " ) && !this.misc[ "reason" ].endsWith( " Only" ))
            this.misc[ "warnMsg" ] = "Warning!!! Step number " + step;
          step = 1;
        }
        dice = this.edClass.StepToDice( step );
        if( "moreSteps" in this.misc )
          for( let i = this.misc[ "moreSteps" ].reps; i > 1; --i )
            dice += "+" + this.edClass.StepToDice( this.misc[ "moreSteps" ].step );
        this.misc[ "finalStep" ] = (("moreSteps" in this.misc) && ("step" in this.misc)) ? this.misc[ "step" ]  : step;
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
        if( "targettype" in this.misc ) {
          let e = this.misc[ "targettype" ].endsWith( "-each" );
          sh += " " + (e ? "each " : "") + this.misc[ "targettype" ].replace( "p1p", " +1p").replace( "-each", "" );

//          .replace(
//              /^PD/, Earthdawn.constant( "commaalt" ) + "PD" ).replace( /^MD/, Earthdawn.constant( "commaalt" ) + "MD" ).replace( /^SD/, Earthdawn.constant( "commaalt" ) + "SD");
        }
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
//          sh += Earthdawn.constant( "colonalt" ) + this.misc[ "strain" ] + " strain.";
// Mar 2023 I think this is dead code, and probably ought to be stun anyway. 
//        if( "stun" in this.misc )
//          sh += this.misc[ "strain" ] + " stun damage.";
        if (sh.length > 3 )
          this.misc[ "subheader" ] = sh;
        let aobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: this.charID, name: "Creature-CursedLuck" }, 0),
          cluck = Earthdawn.parseInt2( aobj.get( "current" ));
        if( cluck > 0 ) {
          this.misc[ "CursedLuck" ] = cluck;
          aobj.setWithWorker( "current", 0);
        }
        if ((cluck > 0) || (Earthdawn.getAttrBN( this.charID, "NPC", "1") > 0 && ((state.Earthdawn.noPileonDice != undefined && state.Earthdawn.noPileonDice >= 0)
              || (state.Earthdawn.noPileonStep != undefined && state.Earthdawn.noPileonStep > 0))))
          this.misc[ "DiceFunnyStuff" ] = true;
        if( "FX" in this.misc && (this.misc[ "FX" ].startsWith( "Attempt" ) || this.misc[ "FX" ].startsWith( "Effect" )))
          this.FX( this.misc[ "FX" ] );
        if( dice === "" )   // If for some reason you are rolling a step zero without karma, just forget the whole thing.
          return;

        this.misc[ "natural" ] = ((this.targetNum || 0) == 0)     // The roll does not have a target number, and does not have several other conditions (such as being a recovery test) that need special processing.
              && !(recipients & Earthdawn.whoTo.player )
              && !( this.uncloned.bFlags & Earthdawn.flags.HitsFound )
              && !( this.bFlags & Earthdawn.flagsArmor.Mask )
              && !( this.bFlags & Earthdawn.flags.Recovery )
              && !( this.bFlags & Earthdawn.flagsTarget.Each )    // for vs Each, targetNum is not set yet.
              && !( "DiceFunnyStuff" in this.misc )
              && !( "AfterRoll" in this.misc )
              && !state.Earthdawn.showDice      // need the dice passed to rollFormat for this to work. 
              && !init;
        if ( this.misc[ "natural" ] ) {   // A natural roll is one without a callback. It just goes out, and the raw results are returned.  Done for rolls without target numbers, and rolls that are sent to both player and gm, but not public.
          this.misc[ "roll" ] = "[[" + dice + "]]";   // The actual roll is done as an inline roll when this is evaluated inside of rollformat. 
          this.rollFormat( recipients );
        } else {    // Not a "natural" roll. We are going to send it to the dice roller now, but capture the result for interpretation.
          let po = this;
          po.edClass.rollCount++;
          sendChat( "player|" + this.edClass.msg.playerid, "/r " + dice, function( ops ) {
            'use strict';
                  // NOTE THAT THIS IS THE START OF A CALLBACK FUNCTION
            if( ops.length !== 1 )
              Earthdawn.errorLog( "Earthdawn.js program warning! ops returned length of " + ops.length, this);
            let con = JSON.parse(ops[ 0 ].content);
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
              if( res < 0 ) {   // Failed
                po.misc[ "failBy" ] = Math.abs( res );
                if ( "SpellBuffSuccess" in po.misc )     // Did not actually succeed, but spell is a buff, so pretend we did.
                  po.edClass.countSuccess++;
                else
                  po.edClass.countFail++;
                if( po.misc[ "Special" ] === "Knockdown" ) {
//                  po.setWW( "condition-KnockedDown", "1" );     // MarkerSet does this now.
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
                if((( "Special" in po.misc ) && ((po.misc[ "Special" ] === "CursedLuck") || (po.misc[ "Special" ] === "CorruptKarma")
                      || (po.misc[ "Special" ] === "SPL-Spellcasting")) && ( "targetName" in po.misc ))   // We need rollESbutton to memorize hits on spellcasting tests
                      || (( po.bFlags & Earthdawn.flagsTarget.Mask) && (( "ModType" in po.misc ) && (po.misc[ "ModType" ].search( /Attack/ ) != -1)) //Attack rolls
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
                    link: "!Earthdawn~ setToken: " + Earthdawn.constant( "at" ) + "{target|Apply damage to which token|token_id}~ Damage: " +dcode[i]
                        + ": " + po.misc[ "result" ] + ": ?{Damage Mod ("
                        + ((po.bFlags & Earthdawn.flagsArmor.Natural) ? " Natural" : "") + dtext[i] + " Armor applies)|0}",
                    text: "Apply Dmg " + dcode[i] + (( po.bFlags & Earthdawn.flagsArmor.Natural) ? "-Nat" : "") + " - Targeted",
                    tip: "Apply this damage to the token you click upon."});
            } // end damage roll
            if( "AfterRoll" in po.misc ) {    // After the Roll, we might do something else with the result. 
              let sub = po.misc[ "AfterRoll" ].split(":");    // We have a command stored for additional processing of the result.
              if( sub[ 1 ].trim() === "buttonDamageBoth" || sub[ 1 ].trim() === "buttonDamageTargeted" )    // AfterRoll: buttonDamageBoth: (type of damage PA/NA)
                po.misc[ "cButtons" ].push({
                    link: "!Earthdawn~ setToken: " + Earthdawn.constant( "at" ) + "{target|Apply damage to which token|token_id}~ "
                        + "Damage: " + sub[ 2 ].trim() + ": " + po.misc[ "result" ] + ": ?{Damage Mod (" + sub[ 2 ].trim() + " Armor applies)|0}",
                    text: "Apply " + po.misc[ "result" ] + " Dmg (" + sub[ 2 ].trim() + ") to Targeted",
                    tip: "Apply this damage to the token you click upon."});
              if( sub[ 1 ].trim() === "buttonDamageBoth" || sub[ 1 ].trim() === "buttonDamageSelected" )
                po.misc[ "cButtons" ].push({
                    link: "!Earthdawn~ foreach: st~ Damage: " + sub[ 2 ].trim() + ": " + po.misc[ "result" ] + ": ?{Damage Mod (" + sub[ 2 ].trim() + " Armor applies)|0}",
                    text: "Apply " + po.misc[ "result" ] + " Dmg (" + sub[ 2 ].trim() + ") to all Selected",
                    tip: "Apply this damage to all selected tokens."});
            } // end AfterRoll

            if( init ) {      // This is an initiative roll.
              let TokenObj = po.tokenInfo.tokenObj,
                  tID = TokenObj.get( "id" ),
                  tt = Campaign().get( "turnorder" ),
                  turnorder = (tt == "") ? [] : ( JSON.parse( tt ));
              state.Earthdawn.actionCount[ tID ] = 0;     // New initiative, so reset the count of Standard Actions taken.
              turnorder = _.reject(turnorder, function( toremove )   { return toremove.id === tID });
              turnorder.push({ id: tID, _pageid: TokenObj.get( "pageid" ), pr: po.misc[ "result" ], secondary: ("000" + po.misc[ "result" ]).slice(-3)
                  + ((Earthdawn.getAttrBN( po.charID, "NPC", "1" ) == Earthdawn.charType.pc) ? "1" : "0" )
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
      } catch(err) { Earthdawn.errorLog( "ED.Roll() error caught: " + err, this ); }
    } // End ParseObj.Roll(ssa)





          // ParseObj.rollESbuttons()
          // create chat window buttons for the user to spend extra successes upon.
          // Also do the special coding required for powers such as Cursed Luck or Corrupt Karma here (instead of buttons).
    this.rollESbuttons = function()  {
      'use strict';
      let po = this;
      try {
        let suc = this.misc[ "extraSucc" ],
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
        for( let i = lstart; i < lend; ++i ) {      // do this for each target
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
                  cc = (( "ModType" in po.misc ) && (po.misc[ "ModType" ].endsWith( "CC" )) ? 1 : -1);
              _.each( attributes, function (att) {
                if (att.get("name").endsWith( "_WPN_Name" ))
                  if(( Earthdawn.getAttrBN(po.charID, att.get( "name" ).slice( 0, -5) + "_CloseCombat", "1", true) < 0) == ( cc < 0 ))    // We want to see if they have the same sign. So test (x<0 == y<0). If both are true or both is false, then true.
                    makeButtonLocal( targetName, att.get( "current" ),
                        "!edToken~ " + Earthdawn.constant( "percent" ) + "{" + po.charID + "|" + att.get( "name" ).slice(0, -4) + "Roll}",
                        "Roll a Weapon Damage.");

                if( att.get("name").endsWith( "_Mod-Type" ) && ( att.get( "current" ) == "Damage Poison" 
                        || (cc < 0 && att.get("current")=="Damage") || (cc > 0 && att.get("current")=="Damage CC") )){      // We want to list the damages corresponding to the Attack + Poisons
                  let pre = Earthdawn.buildPre( att.get( "name")),
                    name = Earthdawn.getAttrBN( po.charID, pre + "Name", "" )
                  makeButtonLocal( targetName, name, "!edToken~ " + Earthdawn.constant( "percent" ) + "{" + po.charID + "|" + pre + "Roll}", "Roll an Ability Damage.");
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
                      d = Earthdawn.getAttrBN( po.charID, pre + "Desc", "").replace(/\n/g, "   ");
                    if( n.length > 0 || d.length > 0 )
                      makeButtonLocal( targetName, Earthdawn.getAttrBN( po.charID, pre + "Name", "" ),
                            charStr1 + "~ CreaturePower: " + "Custom" + arr[ i ] + ": " + po.charID, d );
        } } } } } } // End it's a hit, and end foreach target
      } catch(err) { Earthdawn.errorLog( "ED.RollESbuttons() error caught: " + err, po ); }
    } // End ParseObj.RollESbuttons()



                // ParseObj.rollFormat()
                // create HTML to nicely format the roll results.
                //
                // The main card can go to public, GM only, or player and GM. 
                // GM might get a message with target numbers and buttons.
                // Player might get message with buttons that public did not get. 
    this.rollFormat = function( recipients, rolls )  {
      'use strict';
      let po = this;
      try {
        let sh = ( "subheader" in this.misc) ? this.misc[ "subheader" ] : undefined,
            pIsGM = playerIsGM( this.edClass.msg.playerid ),
            playerCard = !pIsGM && (recipients & Earthdawn.whoTo.gm) && !(recipients & Earthdawn.whoTo.player),   // Need a msg to player saying roll was sent to gm only. This has modifiers, but no roll results.
            playerCardNix = [],         // This is an array of index numbers of the child elements that should be removed from the card shown to the player when the roll is GM only. 
            whichMsgs = recipients & ( pIsGM ? ~Earthdawn.whoTo.player : ~0x00),    // This is recipients, but if pIsGM, then strips out the to player bit.
            sectMain = Earthdawn.newSect(),
            bsub = ( sh && ("reason" in this.misc) && ((this.misc[ "reason" ].length + sh.length) > 25)),
            bpc = (Earthdawn.getAttrBN( this.charID, "NPC", "1") == Earthdawn.charType.pc),
            buttonLine = "",
            linenum = 0;
                // Do a body append. If an icon is in the line, Add line-i to classes
                // Pass body, and the attributes for append. 
        function bAppend( b, tag, content, attrs) {
          'use strict';
          try {
            if( !b || !content ) {
              Earthdawn.errorLog( "ED.rollFormat invalid call: bAppend( " + b + ", " + tag + ", " + content + ", " + attrs  + " )" );
              return;
            }
            if( content.indexOf( "sheet-rolltemplate-icons-" ) == -1 )
              b.append( tag, content, attrs );      // There is no icon, so just post what is passed with no modification. 
            else {    // icon detected. 
              if( !attrs )      // No existing attras, so just supply one. 
                b.append( tag, content, { class: "sheet-rolltemplate-line-i" });
              else {
                if( "class" in attrs ) {
                  if( attrs[ "class" ].indexOf( "rolltemplate-line-i" ) == -1 )   // If not already have this class for some reason. 
                    attrs[ "class" ] += " sheet-rolltemplate-line-i";
                } else attrs[ "class" ] = "sheet-rolltemplate-line-i";
                b.append( tag, content, attrs);
            } }
          } catch(err) { Earthdawn.errorLog( "ED.rollFormat bAppend() error caught: " + err, po ); }
        } // end bAppend

        let whoString;
        switch( recipients & Earthdawn.whoTo.mask ) {
          case 0: whoString = "public";   break;
          case 1: whoString = "player";   break;
          case 2: whoString = "GM";       break;
          case 3: whoString = "PGM";      break;
          default:
            whoString = "public";
            Earthdawn.errorLog( "ED.rollFormat invalid recipents value: " + recipients, po );
        }
        let k, bis = 0, lt;
        if(( "skillExceptionIs" in this.misc) || ( "skillExceptionWouldBe" in this.misc )) {    // This is a knowledge or Artisan skill, which have special rolltype catagories. Send user to a special menu to ask which he wants. to set/edit.
          bis |= 0x04;
          lt = "!Earthdawn~ ChatMenu: RolltypeMulti: state.Earthdawn.Rolltype." + (bpc ? "PC" : "NPC" );
          if( "skillExceptionIs" in this.misc )
            lt += ": skillExceptionIs: " + this.misc[ "skillExceptionIs" ];
          if( "skillExceptionWouldBe" in this.misc )
            lt += ": skillExceptionWouldBe: " + this.misc[ "skillExceptionWouldBe" ];
          if( "exceptionIs" in this.misc )
            lt += ": exceptionIs: " + this.misc[ "exceptionIs" ];
          if( "exceptionWouldBe" in this.misc )
            lt += ": exceptionWouldBe: " + this.misc[ "exceptionWouldBe" ];
        } else {    // only one possible exception (talent name), not two (skill class).
          lt = "!Earthdawn~ ChatMenu: RolltypeEdit: state.Earthdawn.Rolltype." + (bpc ? "PC" : "NPC" ) + ": ";
          if( "exceptionIs" in this.misc ) {
            k = this.misc[ "exceptionIs" ];
            let  e = bpc ? state.Earthdawn.Rolltype.PC.Exceptions : state.Earthdawn.Rolltype.NPC.Exceptions;
            if( k in e ) {
              bis |= 0x01;
              lt += k + ": "
                  +"?{Edit display exception for '" + k
                  + "'|Change to Public, exceptionEdit: Public|Change to GM Only, exceptionEdit: GM Only"
                  + "| Change to Player and GM, exceptionEdit: Player and GM|Delete exception, exceptionDelete}"
            } else 
              edParse.chat( "Warning! Earthdawn internal data mismatch in rollFormat. key '" + k+ "' not found in exceptions.", Earthdawn.whoFrom.apiError);
          } else if ( "exceptionWouldBe" in this.misc ) {
            bis |= 0x02;
            lt += this.misc[ "exceptionWouldBe" ] + ":?{Create a display exception for '" + this.misc[ "exceptionWouldBe" ]
                + "'|Public, exceptionAdd: Public|GM Only, exceptionAdd: GM Only|Player and GM, exceptionAdd: Player and GM}";
        } }
// cdd
// test for knowledge and/or artisan, and add a dropdown to change for all of those instead of name.
        if( bis )
          sectMain.append( "span", Earthdawn.makeButton(
              Earthdawn.addIcon( whoString, "small" ), lt, 
              "This message is being sent to '" + whoString + (( "whoReason" in this.misc) ? "' due to " + this.misc[ "whoReason" ] : ""), "white" ),
              { class:  "sheet-rolltemplate-floatRight sheet-rolltemplate-RollTypeButton" });
        else if( state.Earthdawn.Rolltype.Override )
          sectMain.append( "span", Earthdawn.makeButton( " ! ", "!Earthdawn~ ChatMenu: RolltypeEdit: state.Earthdawn.Rolltype: : Display",
              "Override is on and being sent to '" + state.Earthdawn.Rolltype.Override + "'" ),
            { class:  "sheet-rolltemplate-floatRight sheet-rolltemplate-overrideOn" });

        sectMain.append( "", (("headcolor" in this.misc) ? Earthdawn.addIcon( Earthdawn.safeString( this.misc[ "headcolor" ] ).toLowerCase(), "l", this.misc[ "headcolor" ]) : "") 
              + this.misc[ "reason" ] + ((bsub || !sh ) ? "" : "  --  " + new HtmlBuilder( "span", sh, { class: "sheet-rolltemplate-subheadertext" })),       // Main Header
              {class : ("sheet-rolltemplate-header" + (("headcolor" in this.misc) ?
              " sheet-rolltemplate-header-" + Earthdawn.safeString( this.misc[ "headcolor" ] ).toLowerCase() : "" )) });      // The headers give the right colored thick line at bottom. 

        if( bsub )      // This is a subheader. If it was short enough it would have been appended to the main header.
          sectMain.append("", sh, { class: "sheet-rolltemplate-subheadertext"});
        let modBit = 0, x, x2,
            bodyMain = Earthdawn.newBody( sectMain ),
            txt = "";
        if( "warnMsg" in this.misc )
          bodyMain.append( "", this.misc[ "warnMsg" ], { class:  "sheet-rolltemplate-warnMsg" });

        if( "SP-Step" in this.misc )
          this.misc[ "ModType" ] = "@{Adjust-All-Tests-Total}";   // The spell-casting talents are talents too, make them look a bit more like the other talents.
        if( "ModType" in this.misc ) {    // Conditions and options that affected the step.
          let modtype = this.misc[ "ModType" ],
            extraMod = 0;

                      // 0x20 range are all effect tests. 0x10 range are all action tests.
          if ( modtype == "Action" )
            modBit = 0x11;
          else if (modtype.search( /Attack/ ) != -1) {
            if (modtype == "Attack CC" )
              modBit = 0x14;
            else
              modBit = 0x12;
          } else if( modtype == "JumpUp"
                  || modtype.search( /Armor/ ) != -1    // v3.1 Armor obsolete
                  )
            modBit = 0x18;
          else if (modtype == "Effect" )
            modBit = 0x21;
          else if (modtype.search( /Damage/ ) != -1) {
            if (modtype == "Damage CC" )
              modBit = 0x24;
            else if (modtype == "Damage Poison" )    // Poison has no modifier
              modBit = 0x40;
            else
              modBit = 0x22;
          } else if (modtype == "Init" )
            modBit = 0x28;
          else if (modtype === "0" )
            modBit = 0x40;

          if( modBit === 0x18 && (x = this.getValue( "IP" )) != 0)
            txt += Earthdawn.texttip( "   IP: -" + x, "Penalty from Armor and shield." );
          else if( modBit === 0x28 && ((x = this.getValue( "Initiative-Mods" ) + this.getValue( "Initiative-Mod-Auto" ) - this.getValue( "Adjust-Effect-Tests-Total" )) != 0))
             txt += Earthdawn.texttip( "  Init Mods: " + x, "Initiative Modifiers, such as Ambush for a Creature." );
          else if( modBit === 0x40 )
            txt += Earthdawn.texttip( "  Never. ", "This test never has any modifiers." );

          if((( modBit & 0x10 ) || ( modBit & 0x20 && Earthdawn.getAttrBN( this.charID, "effectIsAction", "0", true )))
                && (x = this.getValue( "Adjust-All-Tests-Misc" )) != 0)
            txt += Earthdawn.addIcon( "action", "s", "Action Misc: Misc modifiers that apply to Action Tests.", undefined, x );
          if(( modBit & 0x20 ) && !Earthdawn.getAttrBN( this.charID, "effectIsAction", "0", true ) && (x = this.getValue( "Adjust-Effect-Tests-Misc" )) != 0)
            txt += Earthdawn.addIcon( "effect", "s", "Effect Misc: Misc modifiers that apply to Effect Tests.", undefined, x );
          if(( modBit == 0x12 || modBit == 0x14 ) && (x = this.getValue( "Adjust-Attacks-Misc" )) != 0)
            txt += Earthdawn.addIcon( "attack", "s", "Attack Misc: Misc modifiers that apply to Attack Tests.", undefined, x );
          if(( modBit == 0x22 || modBit == 0x24 ) && (x = this.getValue( "Adjust-Damage-Misc" )) != 0)
            txt += Earthdawn.addIcon( "damage", "s", "Damage Misc: Misc modifiers that apply to Damage Tests.", undefined, x );
          if(( modBit & 0x04 ) && (this.getValue( "combatOption-AggressiveAttack" ) == "1" ))   // & 0x04 is -CC
            txt += Earthdawn.addIcon( "aggressive", "s", "Aggressive Stance: + " + Earthdawn.getAttrBN( this.charID, "Misc-AggStance-Bonus", "3" )
                + " bonus to Close Combat attack and damage tests. " + Earthdawn.getAttrBN( this.charID, "Misc-AggStance-Penalty", "-3")
                + " penalty to PD and MD. " + Earthdawn.getAttrBN( this.charID, "Misc-AggStance-Strain", "1") + " Strain per Attack."
                , undefined, Earthdawn.getAttrBN( this.charID, "Misc-AggStance-Bonus", "3" ));

//          if( "rsPrefix" in this.misc || "SP-Step" in this.misc ) {   // rsPrefix means came from "Action". SP-Step means spellcasting command line.
// Note, I don't think the above test was needed. But maybe it was.
          if(( modBit & 0x10 || modBit == 0x22 || modBit == 0x24 )) {
            if( "Defensive" in this.misc ) {
              if( [ 1, 2, 3, 4, 5, 6, 7 ].includes( this.misc[ "Defensive" ] ))
                extraMod -= Earthdawn.getAttrBN( this.charID, "Misc-DefStance-Penalty", "-3", true );    // extraMod is adding back in stuff that already subtracted from the base modifications if that modification does not apply to this test.
              if( [ 1, 2, 4, 5 ].includes( this.misc[ "Defensive" ] )) {
                extraMod += Earthdawn.getAttrBN( this.charID, "Misc-DefStance-Bonus", "3", true );    // And these ones get a bonus.
                txt += Earthdawn.addIcon( "defensive", "s", "Defensive Stance: +"  + Earthdawn.getAttrBN( this.charID, "Misc-DefStance-Bonus", "3" )
                    + " bonus to Active Defenses. " ) + Earthdawn.getAttrBN( this.charID, "Misc-DefStance-Bonus", "3" );
            } }
            if( "Aggressive" in this.misc && [ 1, 2, 3 ].includes( this.misc[ "Aggressive" ] )) {
              extraMod += Earthdawn.getAttrBN( this.charID, "Misc-AggStance-Penalty", "-3", true );    // Active defenses get penalty for being aggressive.
              txt += Earthdawn.addIcon( "aggressive", "s", "Aggressive Stance: +"  + Earthdawn.getAttrBN( this.charID, "Misc-AggStance-Penalty", "-3" )
                  + " penalty to Active Defenses. " ) + Earthdawn.getAttrBN( this.charID, "Misc-AggStance-Penalty", "-3" );
            }
          }
          if(( modBit & 0x10 ) && this.getValue( "condition-KnockedDown" ) == "1" && modtype != "JumpUp" )    //Need to skip the text with JumpUp tests.
            if ("Resistance" in this.misc )   // Resistance is depreciated 8/22.
              extraMod += 3;
            else
              txt += Earthdawn.addIcon( "knockdown", "s", "Knocked Down: -3 penalty on all defenses and tests. Movement 2. May not use Combat Option other than Jump-Up.", undefined, -3 );
          if( "MoveBased" in this.misc ) {
            extraMod -= this.getValue( "condition-ImpairedMovement" );
            txt += Earthdawn.addIcon(this.misc[ "MoveBased" ] == "Full" ? "impaired4" : "impaired", "s", 
                  "Impaired Movement: -5/-10 to Movement Rate (1 min). -2/-4 Penalty to movement based tests due to footing, cramping, or vision impairments. Dex test to avoid tripping or halting.",
                  undefined, this.misc[ "MoveBased" ] == "Full" ? -4 : -2 );
          }
          if( "VisionBased" in this.misc ) {
            extraMod -= this.getValue( "condition-Darkness" );    // NotVisionBased depreciated 8/22
            txt += Earthdawn.addIcon(this.misc[ "VisionBased" ] == "Full" ? "vision4" : "vision", "s", 
                  "Impaired Vision: -2/-4 Penalty to all sight based tests due to Darkness, Blindness or Dazzling.", undefined, this.misc[ "VisionBased" ] == "Full" ? -4: -2 );
          }
//          } // from Action() or spell.

          if(( modBit == 0x12 || modBit == 0x14) && this.getValue( "combatOption-CalledShot" ) == "1" && !("SP-Step" in this.misc))
            txt += Earthdawn.addIcon( "calledshot", "s", "Called Shot: -3.   Take one Strain; –3 penalty to Attack test; if successful, attack hits designated area. One automatic extra success for maneuver being attempted, other extra successes spent that way count twice.", undefined, -3 );
          if( modBit & 0x10 && this.getValue( "combatOption-SplitMovement" ) == "1" )
            txt += Earthdawn.addIcon( "split", "s", "Split Movement: Take 1 Strain and be Harried to attack during movement." );
          if( modBit & 0x10 && this.getValue( "combatOption-TailAttack" ) == "1" )
            txt += Earthdawn.addIcon( "tail", "s", "Tail Attack: T'Skrang only: Make extra Attack, Damage = STR. -2 to all Tests.", undefined, -2 );
          if(( modBit == 0x12 || modBit == 0x22 || modBit == 0x14 || modBit == 0x24)    // Note, -CC does not make any sense, but if they DID do it, let them, especially since the updateAdjustAttacks() routine lets them and it is too much of a pain to fix.
                && !("SP-Step" in this.misc) && this.getValue( "condition-RangeLong" ) == "1" )
            txt += Earthdawn.addIcon( "rangelong", "s", "The attack is being made at long range. -2 to attack and damage tests.", undefined, -2 );
          if( this.getValue( "condition-Surprised" ) == "1" )
            txt += Earthdawn.addIcon( "surprised", "s", "Surprised!   Acting character is surprised. Can it do this action?", undefined, "?" );

          if( modBit & 0x10 && (x = this.getValue( "condition-Harried" )) != "0" )
            txt += Earthdawn.addIcon( ((x > 2 && x < 6 ) ? "harried" + x.toString() : "harried"), "s", 
                    "Harried: Penalty to all Tests and to PD and MD.", undefined, x);
          if(( modBit & 0x02 || modBit & 0x04 || modBit == 28 )&& this.getValue( "Creature-Ambushing" ) != "0" )
            txt += Earthdawn.addIcon( "ambush", "s", "Ambush: Added to Initiative, Attack, and Damage.", undefined, this.getValue( "Creature-Ambushing_max" ));
          if(( modBit & 0x02 || modBit & 0x04 )&& this.getValue( "Creature-DivingCharging" ) != "0" )
            txt += Earthdawn.addIcon( "charging", "s", "Diving or Charging: Added to Attack, and Damage", undefined, this.getValue( "Creature-DivingCharging_max" ) );
          if(( modBit & 0x10 || modBit & 0x20 ) && ((x = this.getValue( "Wounds" )) > 0))
            if( this.getValue( "Creature-Fury" ) >= x )
              txt += Earthdawn.texttip( " Fury.", "Instead of suffering penalties, Wounds grant this creature a bonus to tests." );
            else if ((x2 = this.getValue( "Total-ResistPain" )) < x)
              txt += Earthdawn.addIcon( "wounds", "s", "Wounds: -1 penalty to all action and effect tests per wound.", undefined, 0-(x2 - x));
          let modvalue = this.misc[ "ModValue" ] + extraMod;
          if( txt.length > 0 || modvalue )
            bAppend( bodyMain, (( ++linenum % 2) ? ".odd" : ".even"), Earthdawn.texttip( "<b>Mods:</b> " + ((modvalue) ? modvalue.toString() + " " : " " ),
                  "Total of all bonuses and Penalties." ) + txt.trim());

          txt = "";   // Stuff under here flows down into target.
          if(( modBit == 0x12 || modBit == 0x14  || ("SP-Step" in this.misc)) && this.getValue( "condition-Blindsiding" ) == "1")
            txt += Earthdawn.addIcon( "blindsiding", "s", "Blindsiding: The acting character is blindsiding the targeted character, who takes -2 penalty to PD and MD. Can't use shield. No active defenses.", undefined, -2 );
          if(( modBit == 0x12 || modBit == 0x14 || "SP-Step" in this.misc) && this.getValue( "condition-TargetPartialCover" ) == "1")
            txt += Earthdawn.addIcon( "partialcover", "s", "Tgt Cover: The targeted character has cover from the acting character. +2 bonus to PD and MD.", undefined, "+2" );
          if( modBit & 0x10 && this.getValue( "combatOption-Reserved" ) == "1" )
            txt += Earthdawn.addIcon( "reserved", "s", "Reserved Action: +2 to all Target Numbers. Specify an event to interrupt.", undefined, "+2 TN" );
        }  // end modType

        if( "stepExtra" in this.misc )
          bodyMain.append( (( ++linenum % 2) ? ".odd" : ".even"), "<b>Extra Successes:</b> " + this.misc[ "stepExtra" ]);

        if( this.indexTarget !== undefined && modBit & 0x10 ) {
          let targetChar = Earthdawn.tokToChar( Earthdawn.getParam( this.targetIDs[ this.indexTarget ], 1, ":"));
          if ( targetChar ) {   // These are modifiers from the TARGET character.
            if((x = Earthdawn.getAttrBN( targetChar, "Adjust-Defenses-Misc", "0" )) != 0
                  && ( "targettype" in this.misc && this.misc[ "targettype" ].indexOf( "SD") == -1))
              txt += Earthdawn.addIcon( "defenses", "s", "Defenses Misc: Total of all bonuses and penalties to targets PD and MD.", undefined, x );
            if( Earthdawn.getAttrBN( targetChar, "combatOption-AggressiveAttack", "0" ) == "1" )
              txt += Earthdawn.addIcon( "aggressive", "s", "Aggressive: Target is in an Aggressive Stance, giving bonuses to Attack and Damage, but penalty to PD and MD."
                  , undefined, Earthdawn.getAttrBN( targetChar, "Misc-AggStance-Penalty", "-3" ));
            if( Earthdawn.getAttrBN( targetChar, "combatOption-DefensiveStance", "0" ) == "1" )
              txt += Earthdawn.addIcon( "defensive", "s", "Defensive: Target is in a Defensive Stance, giving a bonus to PD and MD."
                  , undefined, Earthdawn.getAttrBN( targetChar, "Misc-DefStance-Bonus", "3" ));
            if( Earthdawn.getAttrBN( targetChar, "condition-Blindsided", "0" ) == "1" )
              txt += Earthdawn.addIcon( "blindsided", "s", 
                    "Blindsided: Target is blindsided and takes -2 penalty to physical and mystic defenses. Can't use shield. No active defenses.", undefined, -2 );
            if( Earthdawn.getAttrBN( targetChar, "condition-KnockedDown", "0" ) == "1" )
              txt += Earthdawn.addIcon( "knockdown", "s", "Knocked Down: Target is Knocked Down and suffers a -3 penalty to all defenses.", undefined, -3 );
            if( Earthdawn.getAttrBN( targetChar, "condition-Surprised", "0" ) == "1" )
              txt += Earthdawn.addIcon( "surprised", "s",  "Surprised: Target is surprised and suffers a -3 penalty to all defenses.", undefined, -3 );
            if((x = Earthdawn.getAttrBN( targetChar, "condition-Cover", "0" )) != "0" )
              txt += Earthdawn.addIcon( "cover", "s",  "Cover Target has cover and gains bonus to PD and MD."
                  , undefined, ((x == "2") ? "Partial: -2" : "Full:<span style='color: red;'> Can't hit.</span>"));
            if((x = Earthdawn.getAttrBN( targetChar, "condition-Harried", "0", true )) != "0" )
              txt += Earthdawn.addIcon( ((x > 2 && x < 6 ) ? "harried" + x.toString() : "harried"), "s", 
                  "Harried: Target is Harried and suffers a penalty to PD and MD as well as action tests.", undefined, 0-x );
        } }
        if( txt.length > 0 )
          bAppend(bodyMain, (( ++linenum % 2) ? ".odd" : ".even"), "<b>Target:</b> <nbsp>" + txt.trim());

        let gmResult = "",
            karmanum = ( "karmaNum" in this.misc ) ? Earthdawn.parseInt2( this.misc[ "karmaNum" ] ) : undefined,
            dpnum = ( "DpNum" in this.misc ) ? Earthdawn.parseInt2( this.misc[ "DpNum" ] ) : undefined;
        if( this.misc[ "step" ] || this.misc[ "finalStep" ] || this.misc[ "dice" ] ) {      // if all three of these are undefined or zero, then skip this (this should probably only be the case for NoRoll).
          let tip = (( "dice" in this.misc)    ? this.misc[ "dice" ].replace( /!/g, "") + ".   " : "" )
                + (( "step" in this.misc)      ? "Base step " + this.misc[ "step" ] : "" )
                + (( "stepExtra" in this.misc) ? " plus " + this.misc[ "stepExtra" ] + " extra successes." : "");
          txt = (( "bonusStep" in this.misc )  ? " + step " + this.misc[ "bonusStep" ] + " bonus" : "")
                + (!karmanum ? "" : (" + " + Earthdawn.addIcon((karmanum == 2) ? "karma2" : ((karmanum == 3) ? "karma3" : "karma" ), "s", "karma", undefined, karmanum )))
                + (!dpnum    ? "" : (" + " + Earthdawn.addIcon((dpnum == 2) ? "devotion2" : ((dpnum == 3) ? "devotion3" : "devotion" ), "s", "Devotion Points", undefined, dpnum )))
                + (( "resultMod" in this.misc ) ? ((this.misc[ "resultMod" ] < 0) ? " - " : " + ") + Math.abs(this.misc[ "resultMod" ]) : "" )
                + (( "roll" in this.misc )    ? ". = " + this.misc[ "roll" ] : "." );     // the actual roll is done when this.misc[ "roll" ] gets evaluated as an inline roll. 
          bAppend( bodyMain, ( ++linenum % 2) ? ".odd" : ".even",
              new HtmlBuilder( "span", "<b>Step:</b> " + (( "finalStep" in this.misc ) ? this.misc[ "finalStep" ] : (( "step" in this.misc ) ? this.misc[ "step" ] : "")) ,{ 
                    style: { "background": "lightgoldenrodyellow", "color": "Black" },
                    title: Earthdawn.encode( Earthdawn.encode( tip )) }) + txt );
        }

        if( "CorruptedKarma" in this.misc )
          bodyMain.append( "", new HtmlBuilder( "span", this.misc[ "CorruptedKarma" ] + " karma corrupted.", {
                style: { "background-color": "Orange", "color": "Black" },
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
            bodyMain.append( "", txt + ". Roll was " + this.BuildRoll( "showResult" in this.misc && this.misc[ "showResult" ], this.misc[ "DiceOrigional" ].total, this.misc[ "DiceOrigional" ] ),
                { style: { "background-color": "Orange", "color": "Black" }});
            if( playerCard ) playerCardNix.push( bodyMain._children.length );
          }
          if(gmResult.length > 0 && (txt.length == 0 || !( "showResult" in this.misc && this.misc[ "showResult" ] )))
            gmResult += (gmResult.length > 0 ? ".   " : "") +  "<b>Orig Rslt was:</b> " + this.BuildRoll( true, this.misc[ "DiceOrigional" ].total, this.misc[ "DiceOrigional" ] );
        } // end funnystuff

        txt = "";
        if( "showResult" in this.misc && this.misc[ "showResult" ] )
          txt += "<b>Result:</b> " + this.BuildRoll( true, this.misc[ "result" ], rolls );
        else if ( rolls )
          gmResult += "   <b>Result:</b> " + this.BuildRoll( true, this.misc[ "result" ], rolls );
        if( "failBy" in this.misc ) {
          if ( "SpellBuffSuccess" in this.misc )     // Did not actually succeed, but spell is a buff, so pretend we did.
            txt += ((txt.length > 0) ? "   " : "" ) + "<span style='color: blue;'>Buff Spell: Auto succeed.</span> "
                + this.BuildRoll( true, this.misc[ "result" ], rolls ) + ".";
          else
            txt += ((txt.length > 0) ? "   " : "" ) + "<span style='color: red;'>Failure</span> "
                + ((( "StyleOverride" in this.misc ? this.misc[ "StyleOverride" ] : state.Earthdawn.style) != Earthdawn.style.VagueSuccess )
                ? " by " + this.BuildRoll( this.misc[ "showResult" ], this.misc[ "failBy" ], rolls ) + "." : "!" );
        }
        if( "succBy" in this.misc ) {
          let es = Earthdawn.parseInt2( "extraSucc" in this.misc ? this.misc[ "extraSucc" ] : 0 );
          txt += ((txt.length > 0) ? "   " : "" ) + "<span style='color: green;'>Success</span> "
                + ((( "StyleOverride" in this.misc ? this.misc[ "StyleOverride" ] : state.Earthdawn.style) != Earthdawn.style.VagueSuccess )
                ? " by " + this.BuildRoll( this.misc[ "showResult" ], this.misc[ "succBy" ], rolls ) : "!" )
                + (("sayTotalSuccess" in this.misc && this.misc[ "sayTotalSuccess" ] )
                ? new HtmlBuilder( "span", " (" + (es +1) + " Total)", {
                  style: { "background": "lavender" },
                  title: Earthdawn.encode( Earthdawn.encode( es + " extra success" + ((es != 1) ? "es!" : "!")
                    + (("grimCast" in this.misc) ? " One added assuming you are casting from your own Grimoire." : ""))) })
                : (( es > 0) ? new HtmlBuilder( "span", " (" + es + " Extra)", {
                  style: { "background": "lightgoldenrodyellow", "color": "Black" },
                  title: Earthdawn.encode( Earthdawn.encode((es +1) + " total success" + ((es != 0) ? "es!" : "!")
                    + (("grimCast" in this.misc) ? " One added assuming you are casting from your own Grimoire." : ""))) })
                  : "." ))
          if (this.misc[ "reason" ] === "Jumpup Test") {
            bodyMain.append( (( ++linenum % 2) ? ".odd" : ".even"), "No longer Knocked Down");
            this.MarkerSet( [ "rf", "knocked", "u" ] );
        } }
        if( "Willful" in this.misc )
          txt += " Note: Target is Willful";
        if( txt.length > 0 ) {
          bodyMain.append( (( ++linenum % 2) ? ".odd" : ".even"), txt, { class: "sheet-rolltemplate-ResultLine"});
          if( playerCard ) playerCardNix.push( bodyMain._children.length );
        }
        if( state.Earthdawn.showDice && rolls ) {
          txt = "<b>Dice:</b> " + this.buildDice( this.misc[ "showResult" ], rolls );
          bodyMain.append( (( ++linenum % 2) ? ".odd" : ".even"), txt);
          if( playerCard ) playerCardNix.push( bodyMain._children.length );
        }
        if( "RuleOfOnes" in this.misc ) {
          bodyMain.append( "", "Rule of Ones", { style: { "background-color": "DarkRed", "color": "white", "text-align":  "center" }});
          if( playerCard ) playerCardNix.push( bodyMain._children.length );
          delete this.misc[ "RuleOfOnes" ];   // Need to delete it, or will show up for other rolls in this group.
        }

        let TNall = (this.bFlags & Earthdawn.flags.VerboseRoll)
              || (( "StyleOverride" in this.misc ? this.misc[ "StyleOverride" ] : state.Earthdawn.style) === Earthdawn.style.Full);
        if( "secondaryResult" in this.misc ) {
          let es = Math.max(0, Math.floor(this.misc[ "secondaryResult" ] / 5 -1));
          txt = "<b>Cntr-Atk:</b>"
              + ( TNall ? " TN " + this.misc[ "targetNum2" ] : "" )
              + ((this.misc[ "secondaryResult" ] < 0)
                  ? " <span style='color: red;'>Failed</span>  by "
                  : " <span style='color: green;'>Succeeded</span> by ")
              + Math.abs( this.misc[ "secondaryResult" ])
              + (("sayTotalSuccess" in this.misc && this.misc[ "sayTotalSuccess" ] )
              ? new HtmlBuilder( "span", " (" + (es +1) + " TOTAL Success" + ((es != 0) ? "es)" : ")") + "   (After subtracting success required to Riposte)", {
                style: { "background": "lavender" },
                title: Earthdawn.encode( Earthdawn.encode( es + " extra success" + ((es != 1) ? "es!" : "!"))) })
              : (( es > 0) ? new HtmlBuilder( "span", " (" + es + " EXTRA Success" + ((es != 1) ? "es)" : ")"), {
                  style: { "background": "lightgoldenrodyellow", "color": "Black" },
                  title: Earthdawn.encode( Earthdawn.encode((es +1) + " total success" + ((es != 0) ? "es!" : "!") + "   (After subtracting success required to Riposte)")) })
                : "." ))
          if( txt.length > 0 ) {
            bodyMain.append( (( ++linenum % 2) ? ".odd" : ".even"), txt);
            if( playerCard ) playerCardNix.push( bodyMain._children.length );
        } }
        if( "Spell" in this.misc ) {
          let splines = this.Spell( this.misc[ "Spell" ] );     // Make a callback to Roll: Cast2, which will return additional lines to be added to the roll.
          if( Array.isArray( splines ))
            for( let i = 0; i < splines.length; ++i ){
//log(splines[i]);
              bodyMain.append( (( ++linenum % 2) ? ".odd" : ".even"), splines[ i ] );
        } }
        if( "actType" in this.misc ) {
          let t = "";
          if(( this.misc[ "actType" ] === "Standard" ) && (Campaign().get("initiativepage"))) {      // Only count the standard actions if the initiative page is being displayed.
            if( this.tokenInfo && this.tokenInfo.tokenObj ) {
              let nbr = Earthdawn.getAttrBN( this.charID, "Actions", "1", true ),
                  tID = this.tokenInfo.tokenObj.get( "id" ), 
                  count = 0;
              if( tID && nbr ) {
                if( tID in state.Earthdawn.actionCount )
                  count = state.Earthdawn.actionCount[ tID ];
                state.Earthdawn.actionCount[ tID ] = ++count;
                if( nbr > 1 || count > nbr )
                  t = " " + count + " of " + nbr;
          } } }
          bAppend( bodyMain, (( ++linenum % 2) ? ".odd" : ".even"), "<b>Action:</b> " + (( this.misc[ "actType" ] !== "NA") ? 
                  Earthdawn.addIcon( "action-" + this.misc[ "actType" ].toLowerCase(), "s", this.misc[ "actType" ]) : "" ) + t );
        }
        if( "StrainPerTurn" in this.misc && ( x = Earthdawn.parseInt2( this.misc[ "StrainPerTurn" ] )))
          bAppend( bodyMain, (( ++linenum % 2) ? ".odd" : ".even"), Earthdawn.addIcon( "strain" + ((x < 4) ? x.toString() : ""), "s",
              "On the Combat tab, it says to spend this much Strain every time initiative is rolled. This is probably from Blood Charms, Thread Items, Spells or some-such.", 
              "Strain Per Turn: ", x));
        if( "eachTargets" in this )     // We compare the roll result to each target number in the list.
          for( let i = 0; i < this.eachTargets.length; ++i ) {
            let res = po.misc[ "result" ] - this.eachTargets[ i ][ "tNum" ],
                t;
            if( res < 0 ) t = "Failed";
            else if (res < 5) t = "Succeeded";
            else t = (1 + Math.floor(res / 5)) + " Successes";
            bAppend( bodyMain, (( ++linenum % 2) ? ".odd" : ".even"), "<b>" + this.eachTargets[ i ][ "tName" ] + "</b>  "
                  + (( state.Earthdawn.style === Earthdawn.style.Full || state.Earthdawn.style === Earthdawn.style.VagueSuccess) 
                  ? Earthdawn.addIcon( "TN", "s") + "TN# " + this.eachTargets[ i ][ "tNum" ] + ":" : "" ) + "  " + t );
          }

        function procMsg( msg, otherTests, playernix ) {   // Anything before the first Tildi gets displayed to the user.
          if( otherTests && (msg in po.misc )) {
            let m = po.misc[ msg ];
            if( m.length > 1) {
              bodyMain.append( (( ++linenum % 2) ? ".odd" : ".even"), Earthdawn.getParam( m, 1, "~" ));
              if( !playernix )
                if( playerCard ) playerCardNix.push( bodyMain._children.length );
              let i = m.indexOf( "~" );
              if( i !== -1 )
                po.doLater += m.slice( i );      // Anything after the first Tildi gets treated as a command an run though the API parser.
        } } }
        procMsg( "displayMsg", true, true );
        procMsg( "successMsg", ( "succBy" in this.misc ) || !this.targetNum);    // if there is no targetNum, then display successMsg.
        procMsg( "failMsg", "failBy" in this.misc);

        if( ("endNote" in this.misc) && (this.misc[ "endNote" ].length > 1))
          bodyMain.append( (( ++linenum % 2) ? ".odd" : ".even"), this.misc[ "endNote" ]);
        if( ("endNoteSucc" in this.misc) && (this.misc[ "endNoteSucc" ].length > 1) && (( "succBy" in this.misc ) || !this.targetNum)) {
          bodyMain.append( (( ++linenum % 2) ? ".odd" : ".even"), this.misc[ "endNoteSucc" ]);
            if( playerCard ) playerCardNix.push( bodyMain._children.length );
        }
        if( ("endNoteFail" in this.misc) && (this.misc[ "endNoteFail" ].length > 1) && (( "failBy" in this.misc ) || !this.targetNum)) {
          bodyMain.append( (( ++linenum % 2) ? ".odd" : ".even"), this.misc[ "endNoteFail" ]);
            if( playerCard ) playerCardNix.push( bodyMain._children.length );
        }
        if(("cButtons" in this.misc) && this.misc[ "cButtons" ].length > 0) {
          let tName;
          for( let i = 0; i < this.misc[ "cButtons" ].length; ++i ) {
            if( tName != this.misc[ "cButtons" ][ i ].name ) {      // If this button has a different target name than the last button, display it.
              tName = this.misc[ "cButtons" ][ i ].name;
              buttonLine += "   " + tName + " ";
            }
            buttonLine += new HtmlBuilder( "a", this.misc[ "cButtons" ][ i ].text, Object.assign({}, {
              href: Earthdawn.colonFix( this.misc[ "cButtons" ][ i ].link ),
              class: "sheet-rolltemplate-button"}, "tip" in this.misc[ "cButtons" ][ i ] ? {
                title: Earthdawn.encode( Earthdawn.encode( this.misc[ "cButtons" ][ i ].tip.replace( /(\r|\n)/g , " "))),
              } : {}));
        } }

/* findthis */
 /* 
 ed3 211013.css
 mix-blend-mode experiments
 
 vISIBILITY ASK NOT WORKING. 
 */
        function addGmInfo( b ) {
          'use strict';
          try {
            if( !b ) {
              Earthdawn.errorLog( "ED.rollFormat invalid call: addGmInfo( " + b + " )" );
              return;
            }
            if ("gmTN" in po.misc) {
              bAppend( b, (( ++linenum % 2) ? ".odd" : ".even"), Earthdawn.addIcon( "TN", "s") + "<b>TN</b> " + po.misc[ "gmTN" ] );
              if( playerCard ) playerCardNix.push( b._children.length );
            } 
            if ( gmResult.length > 0 ) {
              bAppend( b, (( ++linenum % 2) ? ".odd" : ".even"), gmResult.trim() );
              if( playerCard ) playerCardNix.push( b._children.length );
            }
            if(( "secondaryResult" in po.misc ) && !TNall) {
              bAppend( b, (( ++linenum % 2) ? ".odd" : ".even"), Earthdawn.addIcon( "TN", "s") + "<b>Cntr-Atk: TN</b> " + po.misc[ "targetNum2" ] );
              if( playerCard ) playerCardNix.push( b._children.length );
            }
            if( buttonLine ) {
              b.append( (( ++linenum % 2) ? ".odd" : ".even"), buttonLine);
              if( playerCard ) playerCardNix.push( b._children.length );
            }
          } catch(err) { Earthdawn.errorLog( "ED.rollFormat addGmInfo() error caught: " + err, po ); }
        } // end addGmInfo

                  // Here we figure out what messages get sent where.
        if( whichMsgs === Earthdawn.whoTo.public ) {                        // public:    Main message to everybody. Maybe supplementary messages to player and/or gm.
          let gmline = "";
          this.chat( sectMain.toString().replace( /(\r|\n)/g , " "), Earthdawn.whoTo.public | Earthdawn.whoFrom.player | Earthdawn.whoFrom.character );
                        // But we also need player and GM cards. 
          if( ("gmTN" in this.misc) || gmResult.length > 0 || (( "secondaryResult" in this.misc ) && !TNall) || buttonLine) {
            let sectGM = Earthdawn.newSect( "s" ),
                bodyGM = Earthdawn.newBody( sectGM );
            addGmInfo( bodyGM );
            gmline = sectGM.toString().replace( /(\r|\n)/g , " ");
          }
          setTimeout(function() {
            try {     // After public message, supplementary message to GM with TN and buttons. 
                if( gmline )
                  po.chat( gmline, Earthdawn.whoTo.gm | Earthdawn.whoFrom.player | Earthdawn.whoFrom.character );
            } catch(err) {Earthdawn.errorLog( "ED.rollFormat setTimeout() error caught: " + err, po );}
          }, 500);
          if (buttonLine && !pIsGM )
            setTimeout(function() {                        // After public message, if player is not GM, supplementary message to player with buttons.
              try {
                let sectPlayer = Earthdawn.newSect( "s" );
                let bodyPlayer = Earthdawn.newBody( sectPlayer );
                bodyPlayer.append( (( ++linenum % 2) ? ".odd" : ".even"), buttonLine);
                po.chat( sectPlayer.toString().replace( /(\r|\n)/g , " "), Earthdawn.whoTo.player | Earthdawn.whoFrom.player | Earthdawn.whoFrom.character | Earthdawn.whoFrom.noArchive );
              } catch(err) {Earthdawn.errorLog( "ED.rollFormat setTimeout() error caught: " + err, po );}
            }, 700);    // end public message and GM and player info cards. 
        } else {    // Send GM message, and then Player message. 
          addGmInfo( bodyMain, true );

          this.chat( sectMain.toString().replace( /(\r|\n)/g , " "), Earthdawn.whoTo.gm | Earthdawn.whoFrom.player | Earthdawn.whoFrom.character, " sent Roll to GM" );
          if( !pIsGM ) {      // If the roll to GM was requested by a GM, don't send a duplicate to them as player.
            while( playerCardNix.length > 0 )
              bodyMain._children.splice( playerCardNix.pop() -1, 1);      // If identical messages are being sent to player and gm, this will do nothing. But if we are just sending a playercard to the player, this will remove the roll information. 
            this.chat( sectMain.toString().replace( /(\r|\n)/g , " "), Earthdawn.whoTo.player | Earthdawn.whoFrom.player | Earthdawn.whoFrom.character );
        } }
        this.doNow();
      } catch(err) { Earthdawn.errorLog( "ED.rollFormat() error caught: " + err, po ); }
    } // End ParseObj.rollFormat()



          // Build html to display a tool tip to show a roll result.
          // If howMuchDetail is true, then display all components of the roll. If false then only show 1's, maxes, and placeholders.
          // Main is what should appear in main span.
          // rolls is passed from dice roller and contains roll result.
          //
          // Note: I do something weird to handle very small step numbers, such as step 2 which has a roll like
          // {{1d4!-1}+d1}kh1    Which means roll 1d4 (exploding) then subtract one, then roll 1d1 (which will give a 1), and keep the highest of the two. ie: keep the higher of 1d4-1, or 1.
          // The {'s show up as type G Groups.
          // As long as the type is type V or G, I keep going deeper into it. When I find the first non V or G, I start processing the roll results.
          // This will result in processing the 1d4!-1 but not the rest, which is simpler and OK. This should work on all current rolls I expect to see right now,
          // but if somebody messes with the groupings on the dice in order to achieve some other effect, this might need to be rethought. See also CursedLuck which uses this same logic.
          // {"type":"V","rolls":[{"type":"G","rolls":[[{"type":"G","rolls":[[{"type":"R","dice":1,"sides":4,"mods":{"exploding":""},"results":[{"v":4},{"v":3}]},{"type":"M","expr":"-1"}]],"mods":{},"resultType":"sum","results":[{"v":6}]},{"type":"M","expr":"+"},{"type":"R","dice":1,"sides":1,"mods":{},"results":[{"v":1,"d":true}]}]],"mods":{"keep":{"end":"h","count":1}},"resultType":"sum","results":[{"v":6}]}],"resultType":"sum","total":6}
    this.BuildRoll = function( howMuchDetail, main, rolls ) {
      'use strict';
      try {
        let po = this,
//            tip1 = '<img src="/images/quantumrollwhite.png"> Rolling ',
            tip1 = 'Rolling ',
            tip2 = " = ",
            f, level = 0, dice = 0, ones = 0;
//log(JSON.stringify(rolls));
        function walk( item ) {      // Walk through the roll structure, extracting what we need.
          'use strict';
          switch ( item[ "type" ] ) {
          case "V":     // This is the outermost container. It should have ,"resultType":"sum","total":6 at the end. 
            for( let k1 = 0; k1 < item[ "rolls" ].length; ++k1)
              walk( item[ "rolls" ][ k1 ] );
            break;
          case "G":     // This is a group delimited by brackets. {{1d4!-1}+d1}kh1 is two nested groups. "1d4!-1" and that and d1, with a keep highest 1.
            tip1 += "{";
            if (( level === 0) && ( "results" in item )) {  // If we are at the lowest level of a group, and have results, take them here.  This should take care of {{d4-1}+d1}kh1 with the results of the whole thing.
                                                            // Note however that as written this group total will not be updated if Cursed Luck curses a dice in the group. This is a known bug that is considered not important and too much trouble to fix.
                                                            // If we did have to fix it, we would need to interpret inside the group, and figure out "keep high one" and any other strange stuff ourselves. 
                                                            // But as written, the totals are right, it is just the details of which dice got cursed by cursed luck that are not accurate. 
              if( item[ "results" ].length == 1 )
                tip2 += item[ "results" ][ 0 ][ "v" ];
              else {
                tip2 += "(";
                for( let k5 = 0; k5 < item[ "results" ].length; ++k5 )
                  tip2 += item[ "results" ][ k5 ][ "v" ];
                tip2 += ")";
            } }
            ++level;    // When this was zero, we were  not in a group. Now we are.
            for( let k2 = 0; k2 < item[ "rolls" ].length; ++k2)
              for( let k3 = 0; k3 < item[ "rolls" ][ k2 ].length; ++k3 )
                walk( item[ "rolls" ][k2][ k3 ] );
            tip1 += "}";
            if(( "mods" in item ) && ( "keep" in item[ "mods" ] ))
              tip1 += "k" + item[ "mods" ][ "keep" ][ "end" ] + item[ "mods" ][ "keep" ][ "count" ];
            --level;
            break;
          case "R":     // This is a sub-roll result. {"type":"R","dice":1,"sides":4,"mods":{"exploding":""},"results":[{"v":4},{"v":3}]}
            tip1 += ((( "dice" in item) && item[ "dice" ] > 1) ? item[ "dice" ] : "")
              + "d"
              + (( "sides" in item) ? item[ "sides" ] : "")
              + (( "mods" in item) ? (( "exploding" in item[ "mods" ]) ? "!" : "") : "");
            if(( level === 0 ) &&( "results" in item )) {
              tip2 += "(";
              for( let j = 0; j < item[ "results" ].length; ++j )
                if( "v" in item[ "results" ][ j ] ) {
                  ++dice;
                  let v = item[ "results" ][ j ][ "v" ];
                  if( v === item[ "sides" ] )
                    f = v;
                  else if( v == 1) {
                    f = v;
                    ++ones;
                  } else
                    f = howMuchDetail ? v : "?";
                  tip2 += (( j === 0) ? "" : "+") + f;
                }
              tip2 += ")";
            }
            break;
          case "M":     // This is an expression, such as "+" between two items, or "-1" as a modifier to a roll.
            if( level === 0 ) {
              tip1 += item[ "expr" ]
              tip2 += item[ "expr" ]
            }
            break;
          default:
            Earthdawn.errorLog( "Error in ED.BuildRoll(). Unknown type '" + item[ "type" ] + "' in rolls " + item + ". Complete roll is ...", po );
            log( JSON.stringify( rolls ));
          }
        } // end walk()

        walk( rolls );
        if( dice > 1 && dice === ones )
          this.misc[ "RuleOfOnes" ] = true;

        return new HtmlBuilder( "span", main.toString(), {
                style: { "background-color": "#FEF68E",
                    "padding"     : "0 3px 0 3px",
                    "font-weight" : "bold",
                    "cursor"      : "help",
                    "font-size"   : "1.1em" },
                    title: Earthdawn.encode( Earthdawn.encode( tip1 + tip2 )) });
      } catch(err) { Earthdawn.errorLog( "ED.BuildRoll() error caught: " + err, this ); }
    } // End ParseObj.BuildRoll()



          // Build html to display a detailed roll result showing all the dice.
    this.buildDice = function( howMuchDetail, rolls ) {
      'use strict';
      try {
        let po = this,
            txt = '<img src="/images/quantumrollwhite.png"> ',
            rov = [],
            groupIndex = 0;
//log(JSON.stringify(rolls));
        function walk( item ) {      // Walk through the roll structure, extracting what we need.
          'use strict';
//log(item);
          switch ( item[ "type" ] ) {
          case "V":     // This is the outermost container. It should have ,"resultType":"sum","total":6 at the end. 
            for( let k1 = 0; k1 < item[ "rolls" ].length; ++k1)
              walk( item[ "rolls" ][ k1 ] );
            break;
          case "G":     // This is a group delimited by brackets. {{1d4!-1}+d1}kh1 is two nested groups. "1d4!-1" and that and d1, with a keep highest 1.
                        // Do special parsing for this whole group. 
                        // Note that this probably only works if the roll results are of the exact form expected. {{1d4!-1}+d1}kh1.
/*
//"{\"type\":\"V\",\"rolls\":[{\"type\":\"G\",\"rolls\":[[{\"type\":\"G\",\"rolls\":[[{\"type\":\"R\",\"dice\":1,\"sides\":4,\"mods\":{\"exploding\":\"\"},\"results\":[{\"v\":2}]},{\"type\":\"M\",\"expr\":\"-2\"}]],\"mods\":{},\"resultType\":\"sum\",\"results\":[{\"v\":0}],\"d\":true},{\"type\":\"M\",\"expr\":\"+\"},{\"type\":\"R\",\"dice\":1,\"sides\":1,\"mods\":{},\"results\":[{\"v\":1}]}]],\"mods\":{\"keep\":{\"end\":\"h\",\"count\":1}},\"resultType\":\"sum\",\"results\":[{\"v\":1}]}],\"resultType\":\"sum\",\"total\":1}"
{\"type\":\"V\",\"rolls\":[
  {\"type\":\"G\",\"rolls\":
    [[
      {\"type\":\"G\",\"rolls\":
        [[
          {\"type\":\"R\",\"dice\":1,\"sides\":4,\"mods\":{\"exploding\":\"\"},\"results\":[
            {\"v\":2}]
          },
          {\"type\":\"M\",\"expr\":\"-2\"}
        ]]
        ,\"mods\":{},\"resultType\":\"sum\",\"results\":
        [{\"v\":0}],\"d\":true
      },
      {\"type\":\"M\",\"expr\":\"+\"},
      {\"type\":\"R\",\"dice\":1,\"sides\":1,\"mods\":{},\"results\":[{\"v\":1}]}
    ]],
    \"mods\":{\"keep\":{\"end\":\"h\",\"count\":1}},\"resultType\":\"sum\",\"results\":[{\"v\":1}]
  }],\"resultType\":\"sum\",\"total\":1
}
*/
            groupIndex = rov.length;    // Save the place in rov where we entered this group. That is where we need to make adjustments. 
            for( let k2 = 0; k2 < item[ "rolls" ].length; ++k2)
              for( let k3 = 0; k3 < item[ "rolls" ][ k2 ].length; ++k3 )
                walk( item[ "rolls" ][k2][ k3 ] );
            break;
          case "R":     // This is a sub-roll result. {"type":"R","dice":1,"sides":4,"mods":{"exploding":""},"results":[{"v":4},{"v":3}]}
            let bonus = false;
            if(( "results" in item ) && ( "sides" in item)) {
              if( item[ "sides" ] == 1) {    // skip results where side equals 1. Those are in keep highest one.
                if( rov.length > 0 && rov[ rov.length - 1 ] === "+" )
                  rov.pop();    // Throw away the last + sign saved.
              } else {
                for( let j = 0; j < item[ "results" ].length; ++j )     // For each dice
                  if( "v" in item[ "results" ][ j ] ) {
                    let obj = {};
                    if( "sides" in item )
                      obj[ "sides" ] = item[ "sides" ];
                    if( bonus )
                      obj[ "bonus" ] = true;
                    let v = item[ "results" ][ j ][ "v" ],
                        f;
                    if(( v == item[ "sides" ])) {
                      f = v;
                      obj[ "max" ] = true;
                      if( "exploding" in item[ "mods" ])
                        bonus = true;
                    } else if( v == 1) {
                      f = v;
                      obj[ "min" ] = true;
                      bonus = false;
                    } else {
                      f = howMuchDetail ? v : "?";
                      bonus = false;
                    }
                    obj[ "disp" ] = f;
                    obj[ "v" ] = v;
                    rov.push( obj );
            } }   }
            break;
          case "M":     // This is an expression, such as "+" between two items, or "-1" as a modifier to a roll.
            if(( "expr" in item) && item[ "expr" ].startsWith( "-" )) {
              let m = Earthdawn.parseInt2( item[ "expr" ] ),
                  old = Earthdawn.parseInt2( rov[ groupIndex ][ "v" ] );
              let n = old + m;    // There is a modifier, probably -1 or -2.
              if( n < 1 )
                n = 1;
              if( n == 1 || rov[ groupIndex ][ "disp" ] !== "?" )
                rov[ groupIndex ][ "disp" ] = n.toString();
              rov[ groupIndex ][ "v" ] = n.toString();
            } else
              rov.push( item[ "expr" ] );
            break;
          default:
            Earthdawn.errorLog( "Error in ED.Builddice(). Unknown type '" + item[ "type" ] + "' in rolls " + item + ". Complete roll is ...", po );
            log( JSON.stringify( rolls ));
          }
        } // end walk()
        walk( rolls );
        rov.forEach( function( item ) {
          'use strict';
          if( typeof item === "string" )
            txt += item;
          else if (typeof item === "object" ) {
            txt += "<span class='sheet-rolltemplate-diceroll";
            if( "sides" in item )
              txt += " sheet-rolltemplate-dice-d" + item[ "sides" ]
            if(( "bonus" in item) && item[ "bonus" ] )
              txt += " sheet-rolltemplate-dice-bonus";
            if(( "max" in item ) && item[ "max" ] )
              txt += " sheet-rolltemplate-dice-max";
            if(( "min" in item ) && item[ "min" ] )
              txt += " sheet-rolltemplate-dice-min";
            txt += "'>" + item[ "disp" ] + "</span>";    // single quote is end of class section, ending > is end of span opening. v is test within the span.
          }
        });
        return "<span>" + txt + "</span>";
//        return "<span class='sheet-rolltemplate-dicewrap'>" + txt + "</span>";
      } catch(err) { Earthdawn.errorLog( "ED.buildDice() error caught: " + err, this ); }
    } // End ParseObj.buildDice()



              // ParseObj.SetStatusToToken ()
              // Set the Token Status markers to match the Character sheet. Mostly just done when a new token is dropped on the VTT.
    this.SetStatusToToken = function()  {
      'use strict';
      let po = this;
      try {
        if( this.tokenInfo === undefined || this.tokenInfo.tokenObj === undefined ) {
          this.chat( "Error! tokenInfo undefined in SetStatusToToken() command.", Earthdawn.whoFrom.apiError);
          return;
        }
        let markers = "";

        _.each( Earthdawn.StatusMarkerCollection, function( item ) {
          let attName = item[ "attrib" ];
          if( attName === undefined )
              return;
          let attValue = Earthdawn.getAttrBN( po.charID, attName, 0 );
          if( "shared" in item ) {
            let shared = Earthdawn.safeString( item[ "shared" ] );
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
      } catch(err) { Earthdawn.errorLog( "ED.SetStatusToToken() error caught: " + err, po ); }
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
      } catch(err) { Earthdawn.errorLog( "ED.SetToken() error caught: " + err, this ); }
    } // End ParseObj.SetToken()




          // setWW    (note that there is also an EARTHDAWN.setWW that accepts cID)
          // helper routine that sets a value into an attribute and nothing else.
          // is part of parseObj so that have access to parseObj.char.ID
          // All that is required is name and val. To set max only, use the setMaxWW routine below. 
    this.setWW = function( attName, val, dflt, maxVal, maxDflt ) {
      'use strict';
      try {
        Earthdawn.setWW( attName, val, this.charID, dflt, maxVal, maxDflt );
      } catch(err) { Earthdawn.errorLog( "ParseObj.SetWW() error caught: " + err, this ); }
    } // End ParseObj.SetWW()

    this.setMaxWW = function( attName, val, dflt ) {
      'use strict';
      try {
        Earthdawn.setMaxWW( attName, val, this.charID, dflt );
      } catch(err) { Earthdawn.errorLog( "ParseObj.SetMaxWW() error caught: " + err, this ); }
    } // End ParseObj.SetMaxWW()



          // ParseObj.ssaMods ( ssa )
          //
          // ssa is an array of zero or more numbers. Sum them and return the result.
          // start is where to start processing the array if other than ssa[1]
          // fSpecial: if 1, then numbers are not additive. If a non-zero number does not explicitly start with plus or minus sign, it replaces all previous numbers instead of modifying them.
          // cID is an optional character ID, otherwise defaults to this.charID
          //
          // Note that you CAN pass this variable names so long as those variables contain simple numbers, but not character sheet auto-calculated fields.
    this.ssaMods = function( ssa, start, fSpecial, cID ) {
      'use strict';
      let ret = 0;
      try {
        if( start === undefined )
          start = 1;
        for( let i = start; i < ssa.length; i++ ) {
          let nomatch = true;
          if( typeof ssa[ i ] === "string" ) {
            let fnd = ssa[ i ].match( /\d+\s*\(\s*\d+\s*\)/g );      // Falling damage table uses a format nothing else does. step (reps). Look for it.
            if( fnd ) {
              let item = fnd[ 0 ];
              let fnd2 = item.match( /\(\s*\d+\s*\)/g );      // find number of repetitions inside the (). 
              if( fnd2 ) {
                let rep = Earthdawn.parseInt2( fnd2[ 0 ].slice( 1, -1 )),     // slice off the paren and get the reps.
                    stp = Earthdawn.parseInt2( item.replace( fnd2[ 0 ], "" ));
                if( rep > 0 && stp > 0 ) {
                  ret += stp;
                  this.misc[ "moreSteps" ] = { step: stp, reps: rep };
                  nomatch = false;
                } else Earthdawn.errorLog( "ParseObj.ssaMods failed to parse " + ssa[ i ] + " got " + rep + " and  " + stp ); 
              } else Earthdawn.errorLog( "ParseObj.ssaMods failed to parse " + ssa[ i ] ); 1
          } }
          if( nomatch ) {
            let j = this.getValue( ssa[ i ], cID, fSpecial);
            if( fSpecial != 1 )
              ret += j;
            else {
              let k = Earthdawn.parseInt2( j );
              if( i === start || j === "0" || j.startsWith( "-" ) || j.startsWith( "+" ))
                ret += k;
              else
                ret = k;
        } } }
      } catch(err) { Earthdawn.errorLog( "ParseObj.ssaMods() error caught: " + err, this ); }
      return ret;
    } // End ParseObj.ssaMods



        // Spell-casting Token action.
        //
        // Earthdawn.abilityAdd( this.charID, Earthdawn.constant( "Spell" ) + t,
        //  "!edToken~ %{selected|" + preTo + "Roll}" );
        //    ssa: (0) Spell (1) RowId (2) what {options} (n-1) G/M
        //    what: Info : Outputs spell information
        //      Sequence: displays the spell sequence menu
        //      New: Extra Threads Menu (called from the sequence menu)
        //      Extra: Adds Extra Thread (only called via the new command)
        //      Weave: T_RowID - Makes a Weaving test (called from the sequence menu, or offered after choosing extra thread)
        //      Cast: T_RowID -MAkes a Spellcasting test (called from the sequence menu or offered after weaving the last thread)
        //      Effect: T_RowID - Makes an Effect test (called from the sequence menu or offered after a successful test)
        //      Reset: Resets the whole sequence (offered from the sequence menu or after failing a spellcasting, or making an effect test)
        //
        //      TuneGrimoire/TuneGrimoire2: Attunes the Grimoire (appears on the Sequence menu when it is a starting sequence from SP)
        //      TuneOnFly: Triggers a Weaving test. (offered if starting a new Grimoire cast) If successful will offer to chose the Matrix, if failed offer to wipe Matrix
        //      Reset: Clear the current casting  section.
        //      WarpTest: Makes a Warping Test. Only appears after a spellcasting test detected as raw
        //      HorrorMark: Makes a Horror Mark test. See WarpTest
        //
        //    seq: (0) Cast, (1) G/M (Will be GA if casting from a Grimoire successfuly attuned and GR if casting Raw), (2) (spell or matrix row id), (3) SequenceStep, (4) Number threads pulled (including already in matrix), (5) Effect bonus from spellcasting (6+) extra threads.
        //    (3) SequenceStep = 0 new, 1 pulling threads, 2 pulled all threads, 3 spellcasting failed, 4 spellcasting succeeded, 5 an effect has been rolled.

        //   3.19 - Rewrite the sequence. Instead of reading the data from the SP or SPM Attributes, the Sequence will look for the data in a seqdata JSON that will store sequence ans spell data.
        //   This allows the spelldata to be dynamically overwritten if some Spell Knacks / Binding Secrets do change the sequence.
        //   spellseq { SeqStep, Type , RowId: (spell or matrix row id) , CurThreads, TotThreads, numExtraThreads, ExtraThreads, numExtraSuccesses   spelldata:{Name, SP_RowID, Circle, SThreads:Spell Threads base number    }}
        //    SequenceStep = 0 new, 1 pulling threads, 2 pulled all threads, 3 spellcasting failed, 4 spellcasting succeeded, 5 an effect has been rolled.
        //    Type: G/M (Will be GA if casting from a Grimoire successfuly attuned and GR if casting Raw)
        //    RowId: (spell or matrix row id) depending on Type
        //    TotThreads : Total number of Threads to be woven (including Extras), CurThreads: Currently Woven threads (including held in Matrix)
        //    numExtraThreads : Number of Extra Threads added to the Spell, ExtraThreads : Comma separated list of Extra Threads added to the spell
        //    numExtraSuccesses : Number of Extra Successes on the Spellcasting
        //    ESEffect : Added WIL Effect due to extra Successes, numExtraSuccesses: number of spellcasting extra Successes
        //    bGrim : Grimoire or Raw Casting, bGrimAtt: Grimoire Attuned
        //    inMatrix: SPM_RowID of the holding Matrix   MatrixType: code of the Matrix Orifin
    this.Spell = function( ssa ) {
      'use strict';
      let po = this;
      try {
//log("this.Spell ssa is " + JSON.stringify(ssa));
            //Interpreting the SSA Information coming directly from the Spell passed in the SSA
        let bGrim = Earthdawn.safeString( ssa[ ssa.length - 1 ] ).toLowerCase().startsWith( "g" ),          // false = Matrix(SPM). true = Spell (SP).
        pre = Earthdawn.buildPre( bGrim ? "SP" : "SPM", ssa[ 1 ] ),               // The prefix for the spell, SPM or SP depending where the call was made from
        presp = (bGrim ? pre : Earthdawn.buildPre( "SP", Earthdawn.getAttrBN( this.charID, pre + "spRowID" ))),     //The prefix for the SP, even if call was done from SPM
        inMatrix = Earthdawn.getAttrBN( this.charID, presp + "spmRowID", "0" );            // If the spell is in a matrix this is (at least one of) the rowID of the matrix it is in (or zero).
        if( bGrim && inMatrix != "0" ) {    // They pressed a grimoire button, but this spell is in a matrix, so just pretend they pressed the matrix button.
          bGrim = false;
          ssa[ ssa.length - 1 ] = "M";
          ssa[ 1 ] = inMatrix;
          pre = Earthdawn.buildPre( "SPM", inMatrix );
        }

        //Retrieving the info of the last active sequence (note that at this stage it could be a different spell from the SSA)
        let spellseqsaved= JSON.parse(Earthdawn.getAttrBN(this.charID, "SS-spellseq","{}" )||"{}"); //JSON.parse( this.TokenGet( "spellseq", true )||"{}");
//log("this.Spell ssa interpreted is " + JSON.stringify(ssa));
//log("this.Spell spellseqsaved is " + JSON.stringify(spellseqsaved));

            //We now compare the SSA info with the saved spellseq. Very detailed booleans to be able to actually well understand the situation in the whole code
            //As this stage it is possible that the spell in the SSA and the one in spellseq are different, so we should be careful where we recover the data
        let other = false,            // Is the current sequence from another spell than the one from the last this.Spell call
        noseqactive = (!spellseqsaved || spellseqsaved.SeqStep==undefined), // The sequence has been called from a clean start
        seqended = false,                 // Respectively is there an active sequence, and if there is, is it still active (i.e. didn't reach its normal end, like spellcasting failure)
        seqcontinue = false      // This indicates an active sequence, that is not finished, and not from another spell, so this is actually the "Normal" case where we are in sequence
        //Analysis of where we are in the sequence
        if( !noseqactive) {      // We know that we are in a sequence we have to determine if the sequence was a continuation of the previous one
          seqended = ( spellseqsaved.SeqStep == 3 || spellseqsaved.SeqStep == 5);     //Even if there is a sequence, it is actually ended
          other = (spellseqsaved.spelldata.RowId !== (bGrim ? ssa[1] : Earthdawn.getAttrBN( po.charID, pre   + "spRowID", ""))) && !seqended;  //This indicates that we were called on a different spell, that didn't finished its sequence
          seqcontinue= !seqended && !other; // Only here are we sure that we are continuing an existing sequence and can trust the data in the spellseq
        }

        //Initializing spell data, either from the saved one or from the one retrieved from SSA data
        //We need a set of spell data from the spell called in the ssa, which may be the same, or not
        let spellseq={};
        let fieldarray={"sThreads":"0","Casting":"MD1: @{target|Target|token_id}","Duration":"","Range":"","WilSelect":"None","Discipline":"","WilEffect":"0","Effect":"","Numbers":"","ExtraThreads":"None","SuccessLevels":"None","AoE":"","EffectArmor":"N/A","FailText":"","SuccessText":"","DisplayText":"","sayTotalSuccess":"0","FX":""};

        function initSpell() {    //Function to reinit a spell sequence. Need to get back to the original data
    //       log('this.Spell : initspell');
          spellseq.SeqStep=0;
          spellseq.RowId=ssa[1];
          spellseq.bGrim=bGrim;
          spellseq.bGrimAtt=false;
          spellseq.Type=bGrim ? "G" :"M";
          spellseq.ExtraThreads=[];
          if(!bGrim) {
            spellseq.inMatrix=inMatrix;
            spellseq.MatrixType=Earthdawn.getAttrBN( po.charID, pre   + "Type", "-10")
          }

          spellseq.spelldata={};
          spellseq.spelldata.Name=Earthdawn.getAttrBN( po.charID, presp   + "Name", "");
          spellseq.spelldata.RowId=bGrim ? ssa[1] : Earthdawn.getAttrBN( po.charID, pre   + "spRowID", "");
          spellseq.spelldata.Strain=Earthdawn.getAttrBN( po.charID, presp   + "Strain", "0");
          spellseq.spelldata.Strain=Earthdawn.getAttrBN( po.charID, presp   + "Strain_max", "0");
          spellseq.spelldata.Strain=Earthdawn.getAttrBN( po.charID, presp   + "StrainAdvanced", "");

          for(var key in fieldarray)
            spellseq.spelldata[key]=Earthdawn.getAttrBN( po.charID, presp   + key, fieldarray[key]);

          spellseq.spelldata.Notes=Earthdawn.getAttrBN( po.charID, presp   + "Notes", "");

          if(!bGrim && Earthdawn.getAttrBN( po.charID, pre + "EnhThread", "").length>2){
            spellseq.numExtraThreads=1;
            spellseq.ExtraThreads=[Earthdawn.getAttrBN( po.charID, pre + "EnhThread", "")];
          }
          spellseq.TotThreads=Earthdawn.parseInt2( spellseq.spelldata["sThreads"] ) + Earthdawn.parseInt2( spellseq.numExtraThreads );  //Total Number of Threads to be woven, Base + maybe one if there is an extra
          spellseq.CurThreads=(!bGrim && Earthdawn.parseInt2(Earthdawn.getAttrBN( po.charID, pre + "Type", "0" ))>0) ? 1 : 0; //Threads already woven, i.e. if we have an enhanced Matrix or similar
          spellseq.RemThreads=Earthdawn.parseInt2(spellseq.TotThreads)-Earthdawn.parseInt2(spellseq.CurThreads);

          spellseq.spelldata.Knacks=[];
          spellseq.spelldata.KnacksId=[];
          let lpv=spellseq.spelldata.LinksProvideValue=Earthdawn.getAttrBN( po.charID, presp   + "LinksProvideValue", "").split(","),
          lpvm=spellseq.spelldata.LinksProvideValueList=Earthdawn.getAttrBN( po.charID, presp   + "LinksProvideValueList", "").split(","),
          j=0;
           for(let i=0;i<lpvm.length;i++)
           if( lpvm[i] && lpvm[i].includes(";") && ["SpellKnack","BindingSecret"].includes( Earthdawn.getAttrBN( po.charID, Earthdawn.buildPre("SP", lpvm[i].split(";")[1] ) +"Type", "") ) ){ //LPVM is SP;RowID
            spellseq.spelldata.Knacks[j]=lpv[i];
            spellseq.spelldata.KnacksId[j]=lpvm[i].split(";")[1];
            j++;
          }
        }; //end InitSpell

        if(seqcontinue && !(Earthdawn.safeString(spellseqsaved.Type).startsWith("G") && inMatrix != "0" ))  //This indicates the spell has been put in Matrix since it was saved, reInit
          spellseq = spellseqsaved;
        else
          initSpell();
//log("spellseq " + JSON.stringify(spellseq));

            //Some basic data from the spell as declared in the SSA that will be useful to consider next steps
            // let sthrd = Earthdawn.parseInt2( spellseq.spelldata["sThreads"] ),                   //Spell Base Thread Number
            // thrd = Earthdawn.getAttrBN( this.charID, pre + (bGrim ? "sThreads" : "Threads"), "", true );  //Starting Threads, ignores any extra thread
        let nowil = (spellseq.spelldata["WilSelect"] !== "Wil" );     //Spell has no Will Effect.
        let bGrimAtt = Earthdawn.safeString( spellseq.Type ).toLowerCase().endsWith( "a" ),   //If a Grimoire is attuned we stored GA
        nxtextra =(spellseq.SeqStep == 0),    // We can only weave at the beginning of the sequence
        nxtwv = ((spellseq.SeqStep == 0 && spellseq.RemThreads > 0) || spellseq.SeqStep == 1 ),    // We begin weaving after chosing extra spells, or if we are in the middle of weaving and didn't pull them all
        nxtcst = (spellseq.SeqStep == 2 ||(spellseq.SeqStep <= 1 && spellseq.RemThreads <= 0)),    // We only recommend casting on a newly started sequence if there are no Threads
        nxtfx = (spellseq.SeqStep == 4);      // FX recommended if spellcasting was successful

        function SaveSeq() {    //Function to save the spell Sequence in the Token and Character Sheet
          po.setWW( "SS-Type", spellseq.Type );       //SS-Type stores info M/G/GA/GR
          po.setWW( "SS-SeqStep", spellseq.SeqStep );    //SS-SeqStep stores the current step of spellcasting
          po.setWW( "SS-Name", spellseq.spelldata.Name);
          po.setWW( "SS-CurThreads", spellseq.CurThreads + "/" + spellseq.TotThreads );
          po.setWW( "SS-WilSelect", spellseq.spelldata.WilSelect);
          po.setWW( "SS-WilEffect", spellseq.spelldata.WilEffect);
          po.setWW( "SS-Effect", spellseq.spelldata.Effect);
          po.setWW( "SS-Notes", spellseq.spelldata.Notes);
          po.setWW( "SS-Range", spellseq.spelldata.Range);
          po.setWW( "SS-Duration", spellseq.spelldata.Duration);
          po.setWW( "SS-EnhThread", spellseq.ExtraThreads ? spellseq.ExtraThreads.toString() : "");
          po.setWW( "SS-Knacks", spellseq.Knacks ? spellseq.Knacks.toString() : "x");
          po.setWW( "SS-Strain", spellseq.spelldata.Strain||"0");
          po.setWW( "SS-StrainAdvanced", spellseq.spelldata.StrainAdvanced||"");
          po.setWW( "SS-Strain_max", spellseq.spelldata.Strain_max||"0");
          po.setWW( "SS-Numbers", spellseq.spelldata.Numbers);
          po.setWW( "SS-Active", spellseq.RowId);              //SS-Active stores the info about the SP_RowID/SPM_Row ID
          po.setWW( "SS-Type", spellseq.Type);  //SS-Type stores info M/G/GA/GR
          po.setWW( "SS-SeqStep", spellseq.SeqStep);                //SS-SeqStep stores the current step of spellcasting
          po.setWW( "SS-spellseq", JSON.stringify(spellseq));
          //po.TokenSet( "clear", "spellseq", JSON.stringify(spellseq));
//log("seq saved with spellseq "+JSON.stringify(spellseq));
        }; //End SaveSeq

            //HTML functions for the menu
            //Initializes the sect for the future display if needed
        let sectSpell = new HtmlBuilder( "", "", {
          style: {
            "background-color": "white",
            "border": "solid 1px black",
            "border-radius": "5px",
            "overflow": "hidden",
            "width": "100%",
        }});
        sectSpell.append( "", spellseq.spelldata.Name, { style: {
          "background-color": "purple",
          "color": "white",
          "font-weight": "bold",
          "text-align": "center",
          "font-family": "Papyrus, fantasy",
          "font-size":      "120%",
          "line-height":  "130%",
        }});
        let linenum = 0,
        bodySpell = Earthdawn.newBody( sectSpell );

        function line( txt, tip) {
          bodySpell.append( (( ++linenum % 2) ? ".odd" : ".even"), (!tip ||tip=="")? txt: Earthdawn.texttip( txt, tip ));
        }

            //Initialization of the buttons that will be used in several of the places
        let rid, txtwv = "", txtcst = "",  txtwv2 = "", txtcst2 = "", txtfx="",txtfx2="", txtpatt = "", txtonfly = "",txtknack="";    //This are the buttons for each of the main stuff
        let disp = Earthdawn.dispToName( spellseq.spelldata.Discipline, "weaving" ),
        isng = (Earthdawn.getAttrBN( this.charID, "isNamegiver", "0")=="1");    // non namegivers use their spellcasting instead of thread weaving and don't matrix cast
        if(!isng) disp="Spellcasting";
//log("isnamegiver " + Earthdawn.getAttrBN( this.charID, "isNamegiver", "0"));

        let target = spellseq.spelldata.Casting,
        wilselect = spellseq.spelldata.WilSelect;
        if ( Earthdawn.safeString(target).startsWith( "MD1" ) &&  spellseq.ExtraThreads 
            && (spellseq.ExtraThreads.filter( str=>str.includes( "Target" )).length > 0 
            || spellseq.ExtraThreads.filter( str=>str.includes( "Tgt" )).length > 0 )) {   //Look for an Extra Thread that adds Targets
          target = "MDh";     // If we had an Extra Thread that adds Targets, change MD1 to MDh
          spellseq.spelldata.Casting = "MDh";
//log("Target is MD1 but Extra Thread for Add Tgt ");
        }

        if( wilselect == "Wil" ) {    //Initializing the Will Attribute
          txtfx += Earthdawn.makeButton( "WIL",
          "!Earthdawn~ charID: " + this.charID + "~ ForEach: inmt~ Spell: " + ssa[ 1 ] + ": Effect : Wil" +":" + ssa[ ssa.length -1 ] ,
          "Effect Test using Willpower Attribute." ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg);
          txtfx2 += Earthdawn.makeButton( "WIL",
          "!Earthdawn~ charID: " + this.charID + "~ ForEach: inmt~ Spell: " + ssa[ 1 ] + ": Effect : Wil" +":" + ssa[ ssa.length -1 ] ,
          "Effect Test using Willpower Attribute. NOTE : This is not the recommended next step of the Sequence" ,Earthdawn.Colors.param2,Earthdawn.Colors.param2fg);
        }

        let strainsp = "@{" + getAttrByName( this.charID, "character_name" ) + "|SS-Strain_max}";

        let attributes = findObjs({ _type: "attribute", _characterid: this.charID });
        _.each( attributes, function (att) {
          if (att.get( "name" ).endsWith( "_T_Special" ) && att.get( "current" ).startsWith( "SPL-" )) {      // If any of the SPL- Talents.
            rid = Earthdawn.getAttrBN( po.charID, Earthdawn.buildPre( att.get("name") ) + "RowID", "");
            let pre2 = Earthdawn.buildPre( att.get("name"));
            let charname = getAttrByName( po.charID, "character_name" );
            let kask = "modValue : ?{Modification|0} ~ K-ask: @{" + charname + "|KarmaGlobalMode}@{" + charname + "|" +  pre2 + "Karma-Ask}: @{"+charname +"|DPGlobalMode}@{" + charname + "|" + pre2 + "DP-Ask}~";
            //            let strain = Earthdawn.getAttrBN( po.charID, pre2 + "Strain", "", true),

            let straintlt = Earthdawn.parseInt2(getAttrByName( po.charID, pre2+"Strain")),
            //po.strainCalc( pre2, true ),JBF@CD : can't be straincalc... This must read the actual strain of the Talent
            straintxt = (straintlt >= 0) ? "Strain: " + straintlt + " ~":"",
            straintxt2 = "Strain: " + straintlt + " :" + strainsp + "  ~"; // To deal with the Spell Ask Strain

            if(att.get( "current" ).endsWith( disp )) {       // Thread Weaving.
              txtwv += Earthdawn.makeButton( Earthdawn.getAttrBN( po.charID, pre2 + "Name", ""),
              "!Earthdawn~ charID: " + po.charID + "~ ForEach: inmt~ " +straintxt+ kask + " Spell: " + ssa[ 1 ] + " : Weave : "+ rid + " : "+ssa[ ssa.length -1 ] ,
              "Weave using this Talent." ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg);
              txtwv2 += Earthdawn.makeButton( Earthdawn.getAttrBN( po.charID, pre2 + "Name", ""),
              "!Earthdawn~ charID: " + po.charID + "~ ForEach: inmt~ " + straintxt + kask + " Spell: " + ssa[ 1 ] + " : Weave : "+ rid + " : "+ssa[ ssa.length -1 ] ,
              "Weave using this Talent. NOTE : This is not the recommended next step of the Sequence" ,Earthdawn.Colors.param2,Earthdawn.Colors.param2fg);
              if( straintlt == 0)
              txtonfly += Earthdawn.makeButton( "Attune on the Fly",
              "!Earthdawn~ charID: " + po.charID + "~ ForEach: inmt~ Strain: 1~ "+ kask + " Spell: " + ssa[ 1 ] + " : TuneOnFly: " + rid + " : " + ssa[ ssa.length -1 ] ,
              "Attune Matrix on the Fly using " + Earthdawn.getAttrBN( po.charID, pre2 + "Name","") ,Earthdawn.Colors.param2,Earthdawn.Colors.param2fg);
            }
            if( att.get( "current" ).endsWith( "Spellcasting" )) {     // Spellcasting
              txtcst += Earthdawn.makeButton( Earthdawn.getAttrBN( po.charID, pre2 + "Name", ""),
              "!Earthdawn~ charID: " + po.charID +"~Target:" + target + "~ ForEach: inmt~ " + straintxt2 + kask + "Spell: " + ssa[ 1 ] + ": Cast : " + rid + " : " + ssa[ ssa.length -1 ] ,
              "Cast using this Talent. " ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg);
              txtcst2 += Earthdawn.makeButton( Earthdawn.getAttrBN( po.charID, pre2 + "Name", ""),
              "!Earthdawn~ charID: " + po.charID +"~Target:" + target + "~ ForEach: inmt~ " + straintxt2 + kask + "Spell: " + ssa[ 1 ] + ": Cast : " + rid + " : " + ssa[ ssa.length -1 ] ,
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
          if( wilselect == "Circle" && isng &&  att.get( "name" ).endsWith( "_DSP_Name" ) && ( disp == Earthdawn.dispToName( att.get( "current" ), "weaving" ))) {   //Effect based on Circle Namegiver
            rid = Earthdawn.getAttrBN( po.charID, Earthdawn.buildPre( att.get("name") ) + "RowID", "");
            txtfx += Earthdawn.makeButton( Earthdawn.dispToName( att.get( "current" ), "name" ) + " Circle",
            "!Earthdawn~ charID: " + po.charID + "~ ForEach: inmt~ Spell: " + ssa[ 1 ] + ": Effect : " + rid + ": " + ssa[ ssa.length -1 ] ,
            "Effect Test based on this Discipline Circle." ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg);
            txtfx2 += Earthdawn.makeButton( Earthdawn.dispToName( att.get( "current" ), "name" ) + " Circle",
            "!Earthdawn~ charID: " + po.charID + "~ ForEach: inmt~ Spell: " + ssa[ 1 ] + ": Effect : "+ rid + ": " + ssa[ ssa.length -1 ] ,
            "Effect Test based on this Discipline Circle. NOTE : This is not the recommended next step of the Sequence" ,Earthdawn.Colors.param2,Earthdawn.Colors.param2fg);
          }
          if( wilselect == "Circle" && !isng &&  att.get( "name" ).endsWith( "SrRating" )) {   //Effect based on Circle Namegiver

            txtfx += Earthdawn.makeButton( "Creature Circle ",
            "!Earthdawn~ charID: " + po.charID + "~ ForEach: inmt~ Spell: " + ssa[ 1 ] + ": Effect : " + att.get( "current" ) + ": " + ssa[ ssa.length -1 ] ,
            "Effect Test based on Creature Circle/SR." ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg);
            txtfx2 += Earthdawn.makeButton("Creature Circle",
            "!Earthdawn~ charID: " + po.charID + "~ ForEach: inmt~ Spell: " + ssa[ 1 ] + ": Effect : "+ att.get( "current" ) + ": " + ssa[ ssa.length -1 ] ,
            "Effect Test based on Creature Circle/SR. NOTE : This is not the recommended next step of the Sequence" ,Earthdawn.Colors.param2,Earthdawn.Colors.param2fg);
          }
        }); // End for each attribute.

        txtknack = Earthdawn.makeButton( "Spell Knacks","!Earthdawn~ charID: " + po.charID +  "~ Spell: " + ssa[ 1 ] + " : Knack ","Choose Knacks during Casting." ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg);

        //v3.19 : to be rethought to make extra and weave depending on SeqStep
        //v3.19 : to be rethgouth also to display the current status
        let txtextra = Earthdawn.makeButton( "Extra Threads", "!Earthdawn~ charID: " + this.charID + "~ ForEach: inmt~ Spell: " + ssa[ 1 ] + " : New : " + ssa[ ssa.length -1 ]
            , "Press this button to start a new casting and chose extra threads." 
            , (nxtextra ?Earthdawn.Colors.param:Earthdawn.Colors.param2),(nxtextra ?Earthdawn.Colors.paramfg:Earthdawn.Colors.param2fg));

        let txtreset = Earthdawn.makeButton( "Reset", "!Earthdawn~ charID: " + this.charID + "~ ForEach: inmt~ Spell: " + ssa[ 1 ] + ": Reset: " + ssa[ ssa.length -1 ],
            "Press this button to Reset the Spell Sequence." ,Earthdawn.Colors.param2,Earthdawn.Colors.param2fg);
        let txtinfo = Earthdawn.makeButton( "Info", "!Earthdawn~ charID: " + this.charID + "~ ForEach: inmt~ Spell: " + ssa[ 1 ] + ": Info: " +ssa[ ssa.length-1 ],
            "Press this button to get the details of the spell." ,Earthdawn.Colors.param2,Earthdawn.Colors.param2fg);
        let txttunematrix = Earthdawn.makeButton( "Attune Matrix", "!Earthdawn~ %{"+getAttrByName( this.charID, "character_name" ) +"|" + pre +"AttuneButton}" ,
            "Press this button to ReAttune this spell in a Matrix (using the 10 minute ritual)." ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg);
        let txtwipe = Earthdawn.makeButton( "Wipe All Matrix", "!Earthdawn~ charID: " + this.charID + "~ ForEach: inmt~ TuneMatrix: WipeMatrix",
            "When re-attuning on the fly, Spellcaster must remain concentrated (Wil/Willforce chack against any damage), and continue until success, or all his matrix are wiped." ,Earthdawn.Colors.param2,Earthdawn.Colors.param2fg);
        let txtwarp = Earthdawn.makeButton( "Warp Test", "!Earthdawn~ charID: " + this.charID + "~ ForEach: inmt~ Spell: " + ssa[ 1 ] + ": WarpTest: ?{ What is the region type? |Safe|Open|Tainted|Corrupt} :" + ssa[ ssa.length -1 ],
            "When Casting Raw Magic, the Astral Space can damage you. Make this test according to the Region Type. Test Against MD to know if character suffers Damage" ,Earthdawn.Colors.param2,Earthdawn.Colors.param2fg);
        let txtmark = Earthdawn.makeButton( "Horror Mark", "!Earthdawn~ charID: " + this.charID + "~  ForEach: inmt~ Spell: " + ssa[ 1 ] + ": HorrorMark: ?{ What is the region type? |Safe|Open|Tainted|Corrupt}:" +ssa[ ssa.length -1 ],
            "When Casting Raw Magic, The unmasked magic might attract unwanted attention from astral entities. Test Against MD to see if character was Horror Marked." ,Earthdawn.Colors.param2,Earthdawn.Colors.param2fg);

        if( txtwv == "")    { txtwv = "Weaving Talent missing!";        txtwv2 = "Weaving Talent missing!" }
        if( txtcst == "")   { txtcst = "Spellcasting Talent missing!";  txtcst2 = "Spellcasting Talent missing!"; }
        if( txtfx == "")
        switch( wilselect ) {
          case "Circle" : txtfx = txtfx2 = "No Corresponding Discipline!"; break;
          // case "Wil"    : txtfx = txtfx2 = "Effect Talent Missing! Creating it - Try Again.";
          // log("Earthdawn.Spell() No Wil detected - creating it");
          // let rowid = Earthdawn.generateRowID();
          // let pre2 = Earthdawn.buildPre( "T", rowid );
          // Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: pre2 + "Name" }, "Wil");
          // Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: pre2 + "Special" }, "SPL-Willforce");
          // Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: pre2 + "Mod-Type" }, "Effect");
          // Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: pre2 + "Attribute" }, "Wil");
          // Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: pre2 + "Action" }, "Free");
          // Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: pre2 + "Type" }, "Special");
          // Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: pre2 + "Target" }, "None");
          // Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: pre2 + "Karma-Limit_max" }, "0");
          // Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: pre2 + "Karma" }, "0");
          // Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: pre2 + "Parameters" },  "0");
          // Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: pre2 + "Notes" },  "This is a dummy Talent, that holds the willpower value that will be used for Spell Effect Tests. Do Not delete except if character is a non-spellcaster");
          // break;
          case "Rank"   : txtfx = txtfx2 = "Spellcasting Talent Missing!"; break;
          default :       txtfx  = Earthdawn.getAttrBN( po.charID, presp + "Effect", "None");
          txtfx2 = Earthdawn.getAttrBN( po.charID, presp + "Effect", "None") + " " + txtreset;
        }
        if( txtpatt == "")
          txtpatt="Patterncraft Talent missing!"
        switch( ssa[ 2 ] ) {
          case "Sequence": {    //This is the master sequence... Where the magic happens
            if( other ) {     //Another Sequence is in progress, but for now we didn't take any action to abort it, this may still be a mistake... But any further action will re-initiate the sequence
              line( "Other Sequence Active : <b>" + Earthdawn.makeButton( "Resume-"+spellseqsaved.spelldata.Name,
              "!Earthdawn~ charID: " + this.charID + "~ ForEach: inmt~  Spell: " + spellseqsaved.RowId + " : Sequence" ,
              "Resume Sequence." ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg),"");
              line( "Start new Sequence for: <b>" + spellseq.spelldata.Name +"</b>","");
            }
                //Header Logics when Grimoire/Raw
            if( isng && spellseq.bGrim ) { //isng because creatures cast raw, like if it was matrix
              if( spellseq.bGrimAtt )            // A Grimoire is attuned, this is definitely Grimoire Casting
              line("Grimoire Casting, Grimoire Attuned" ,"You successfully Attuned to a Grimoire and are casting from the Grimoire. This will grant you one extra spellcasting success");
              else if( nxtextra ) {     // We are at the beginning of the Grimoire/Raw, and we didn't
                line("Spell not in Matrix. ","You are currently casting a spell that you selected in your spellbook, so you have either to Attune to your Grimoire to cast it from your Grimoire (takes 10 min), to Attune your matrix (takes 10 min), or to Attune on the fly (takes 1 round, 1 strain, and you risk wiping all your Matrix). If yo select none of these options, this will be supposed to be raw casting, with risks of attracting Horror attention");
                line(txtpatt +txttunematrix + txtonfly,"");
              } else      // Grimoire Casting, with no Grimoire Attuned and sequence is started: This is Raw magic
              line("<b> Raw Magic ! </b>" ," You started to cast a spell not from Matrix and without attuning the Grimoire... Proceed at your own risks. Side Effects include Warping, Horror Marks, and potentially Death... or worse...");
            }
            //Sequence header
            // if(noseqactive || seqended) {     //This is a clean start either after a reset, or after ending correctly a sequence
            //   line("Ready to Start New Sequence","");
            //   //line(thrd + " threads needed ","");
            // } else
            if(!other) {
              switch(spellseq.SeqStep) {
                case 0 : line( "New Sequence.","To start the Sequence, choose extra Thread, or start Weaving or Casting"); break;
                case 1 : line( "Weaving Threads",""); break;
                case 2 : line( "All Threads Woven, Cast",""); break;
                case 3 : line( "Spellcasting Failed, press Reset","You can hit reset, but can also proceed with the sequence if it was a mistake.You can also just restart the sequence from any step."); break;
                case 4 : line( "Spellcasting Successful, Effect","Proceed with the Effect"); break;
                case 5 : line( "Effect Rolled, press Reset","You can hit reset, but can also proceed with rerolling the Effect if multi-round. You can also just restart the sequence from any step."); break;
              } }
              //Header : Info & Reset
              line( txtinfo+txtreset, "" );
              //Body Main Action buttons

              if((spellseq.spelldata.Knacks.length > 0 && spellseq.SeqStep == 0) || spellseq.Knacks)
                line("<b> Spell Knacks: </b>" + (spellseq.Knacks ? spellseq.Knacks.join(): "") + ((spellseq.SeqStep==0 && (!spellseq.Knacks  || spellseq.Knacks.length!==spellseq.spelldata.Knacks.length))? txtknack:""),"Choose Spell Knacks");
              line("<b> Extra Threads: </b>" + (spellseq.ExtraThreads ? spellseq.ExtraThreads.toString() : (spellseq.SeqStep==0 ? "" : "None") ) + (spellseq.SeqStep==0 ? txtextra : ""), "");
              line("<b> Weave (" + spellseq.CurThreads + " / " + spellseq.TotThreads +"): </b>" + (spellseq.SeqStep >=2 ? "Done" : (nxtwv ? txtwv : txtwv2)),
                  "Choose Talent to weave Threads. " + spellseq.CurThreads + " woven (including held in Matrix) out of "+spellseq.TotThreads + (spellseq.numExtraThreads>0 ? "including " + spellseq.numExtraThreads + " Extra" : ""));
              line("<b> Cast : </b>" + (spellseq.SeqStep==3 ? "Spellcasting Failed!" : spellseq.SeqStep==4 ? ((spellseq.spelldata.SuccessLevels && spellseq.numExtraSuccesses)? "Done - " + spellseq.spelldata.SuccessLevels + " x " + spellseq.numExtraSuccesses+ " ES":
                  "Spellcasting Successful" + (spellseq.numExtraSuccesses>0 ? " (" +spellseq.numExtraSuccesses +"Extra Success)":"" )): (nxtcst ? txtcst : txtcst2)), "");
              line("<b> Effect : </b>" + (nxtfx ? txtfx : txtfx2), "");

              this.chat( sectSpell.toString(), Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive | Earthdawn.whoFrom.character );
            } break; //End Sequence
          case "InfoPub":
          case "Info": {  //v3.19 No change because we want to stay with the unchanged data, i.e. read it directly from the sheet
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
                    + Earthdawn.getAttrBN( this.charID, pre + "Origin", "Free").replace("-link",""), "Rank of matrix, it's Type and Origin.");
            } else line( "<b>Matrix:</b> Not in Matrix.","");
            line( "<b>Min Threads:</b> " + Earthdawn.getAttrBN( this.charID, presp + "sThreads", "0"),
                  "Number of spell threads that must be woven in order to cast the base version of the spell.");
            line( "<b>Weave Diff:</b> " + Earthdawn.getAttrBN( this.charID, presp + "Numbers", ""),
                  "Weaving difficulty / Reattunment difficulty / Dispeling difficulty / Sensing difficulty.");
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
            if( Earthdawn.getAttrBN( this.charID, presp + "DisplayText", "").trim().length > 1 )
              line( "<b>Display Text:</b> " + Earthdawn.getAttrBN( this.charID, presp + "DisplayText", ""),
                    "This text is displayed when spellcasting is rolled. It can optionally be used to remind players of what the spell does and how it works. If there is a Tildi (~) then anything after the first Tildi is processed by the API");
            if( Earthdawn.getAttrBN( this.charID, presp + "SuccessText", "").trim().length > 1 )
              line( "<b>Success Text:</b> " + Earthdawn.getAttrBN( this.charID, presp + "SuccessText", ""),
                    "This text appears if the spellcasting test is successful. It can optionally be used to remind players of what the spell does and how it works. If there is a Tildi (~) then anything after the first Tildi is processed by the API");
            if( Earthdawn.getAttrBN( this.charID, presp + "FailText", "").trim().length > 1 )
              line( "<b>Fail Text:</b> " + Earthdawn.getAttrBN( this.charID, presp + "SuccessText", ""),
                    "This text appears if the spellcasting test is failed. If there is a Tildi (~) then anything after the first Tildi is processed by the API");
            line( "<b>Description</b>  (hover)", Earthdawn.getAttrBN( this.charID, presp + "Notes", "").replace( /\n/g, "&#013;"));
            if( !infoPub )
              line( Earthdawn.makeButton( "Post to all", "!Earthdawn~ charID: " + this.charID + "~ ForEach: inmt~ Spell: " + ssa[ 1 ] + ": InfoPub: " +ssa[ ssa.length-1 ],
                  "Press this button to send the details of the spell to all players." ,Earthdawn.Colors.param2,Earthdawn.Colors.param2fg ));
            this.chat( sectSpell.toString(), (infoPub ? Earthdawn.whoTo.public : Earthdawn.whoTo.player) | Earthdawn.whoFrom.noArchive | Earthdawn.whoFrom.character );
          } break;
          case "TuneGrimoire": {
            //Spell Sequence
            if( other ) {
              this.misc[ "warnMsg" ] = "Cancelling Sequence for " + spellseqsaved.spelldata.Name + ". Sequence Restarted .";
            }
            else if( !nxtextra ) {
              this.misc[ "warnMsg" ]= "Attuning Grimoire: " + spellseq.spelldata.Name //Reset Sequence instead
              + " but the Spell was already in sequence. Sequence Restarted .";
            }
            //Tune Grimoire is in any case a new sequence
            initSpell();

            let disp, tmp;
            if( bGrim )
            tmp = spellseq.spelldata.Discipline;
            else{
              this.chat( "Earthdawn Error : trying to Attune Grimoire with a Spell in a Matrix.", Earthdawn.whoFrom.apiWarning );
              return;
            }
            disp = Earthdawn.dispToName( tmp, "weaving" );  // Name of weaving talent
            let rid = ssa[ 3 ],
            pre2 = Earthdawn.buildPre( "T" ,rid );
            this.Karma( pre2 + "Karma", 0 );
            this.misc[ "rollName" ] = "Attuning";
            this.misc[ "reason" ] = "Attuning Grimoire " + Earthdawn.getAttrBN( this.charID, pre2 + "Name", "0") + " Test : " + spellseq.spelldata.Name;
            this.misc[ "headcolor" ] = "weave";
            this.bFlags |= Earthdawn.flags.VerboseRoll;
            this.Lookup( 1, [ "value", pre2 + "Step" ]);
            this.targetNum = Earthdawn.getParam( spellseq.spelldata.Numbers, 2, "/" );
            this.misc[ "sayTotalSuccess" ] = true;
            this.misc[ "endNoteSucc" ] = "Grimoire Successfully Attuned." + txtextra + (nxtwv? txtwv:txtwv2) + (nxtcst?txtcst:txtcst2);
            this.misc[ "endNoteFail" ] = "Grimoire Attuning Failed, Retry (takes 10 min) or cast Raw at your own risks";
            SaveSeq();
            ssa[ 2 ] = "TuneGrimoire2";
            this.misc[ "Spell" ] = ssa;
            this.Roll( [ "Roll" ] );
          } break; //End TuneGrimoire
          case "TuneGrimoire2": {     // Roll calls back to here.
            let lines = [];
            if("succBy" in this.misc) {
              spellseq.Type= "GA";     //Grimoire is attuned
              spellseq.bGrimAtt=true;
            }
            SaveSeq();
            return lines;
          } //End TuneGrimoire2
          case "TuneOnFly": {
            let disp= Earthdawn.dispToName( spellseq.spelldata.Discipline, "weaving" );
            if( !bGrim ){
              this.chat( "Earthdawn Error : trying to Attune Matrix with a Spell in a Matrix.", Earthdawn.whoFrom.apiWarning );
              return;
            }

            let rid = ssa[ 3 ],
            pre2 = Earthdawn.buildPre( "T" , rid);
            this.Karma( pre2 + "Karma", 0 );
            this.misc[ "rollName" ] = "Attuning";
            this.misc[ "reason" ] = "Attuning on the Fly " + Earthdawn.getAttrBN( this.charID, pre2 + "Name", "0") + " Test : " + spellseq.spelldata.Name;
            this.misc[ "headcolor" ] = "weave";
            this.bFlags |= Earthdawn.flags.VerboseRoll;
            this.Lookup( 1, [ "value", pre2 + "Step" ]);
            this.targetNum = Earthdawn.getParam( spellseq.spelldata.Numbers, 2, "/" );
            this.misc[ "sayTotalSuccess" ] = true;
            this.misc[ "endNoteSucc" ] = "Choose Matrix : " + txttunematrix;
            this.misc[ "endNoteFail" ] = "Attuning on the fly failure. Retry until success or " + txtwipe  ;
            if( other ) {
              this.misc[ "warnMsg" ]= "Cancelling Sequence for "+ spellseqsaved.spelldata.Name+ ". Sequence Restarted .";
              initSpell();
            }
            else if( !nxtextra ) {
              this.misc[ "warnMsg" ]= "Attuning Matrix on the Fly: " + spellseq.spelldata.Name + " but the Spell was already in sequence. Sequence Restarted .";//Reset Sequence instead
              initSpell();
            }
            ssa[ 2 ] = "TuneOnFly2";
            this.misc[ "Spell" ] = ssa;
            this.Roll( [ "Roll" ] );
          } break; //End TuneOnFly
          case "TuneOnFly2": {      // Roll calls back to here.
            let lines = [];
            SaveSeq();
            return lines;
          }
          case "Knack": {
            //Sequence Control. Normal Case is (noseqactive || seqended || (step==0 && !other)), if not go through different cases to issue warnings.
            //At this stage, no action was taken, so sequence must not be initialized yet
            if( !(noseqactive || seqended || (spellseq.SeqStep==0 && !other))) {
              if ( other ) {
                line( "Other Sequence Active : <b>" + Earthdawn.makeButton( "Resume-"+spellseqsaved.spelldata.Name,
                "!Earthdawn~ charID: " + this.charID + "~ ForEach: inmt~  Spell: " + spellseqsaved.RowId + " : Sequence" ,
                "Resume Sequence." ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg),"");
                line("Choose Spell Knack to start new sequence <b>" + spellseq.spelldata.Name +"</b>","");
              }  else if ( spellseq.SeqStep!==0 ) {
                line( "<b>Warning!</b> Trying to add Knack for:<b> " + Earthdawn.getAttrBN( this.charID, pre + (bGrim ? "Name" : "Contains"), "" )
                + "</b>When sequence was already started. Choosing a Knack will restart the sequence","Knacks Can only be selected when starting a sequence. ");
              }
            } else //Normal Case
              line("Choosing Spell Knacks & Binding Secrets");
            //end sequence control

            for( let i = 0; i < spellseq.spelldata.KnacksId.length; ++i ) {
              if(!spellseq.Knacks || !spellseq.Knacks.includes(spellseq.spelldata.Knacks[ i ]))
                line( Earthdawn.makeButton( spellseq.spelldata.Knacks[ i ], "!Earthdawn~ charID: " + this.charID + "~ Spell: " + ssa[ 1 ] + ": " + "Knack2: " + spellseq.spelldata.KnacksId[i],
                      "Press this button to add an optional spell knack to this casting." ,Earthdawn.Colors.action,Earthdawn.Colors.actionfg),"");
              else
                line("<b>"+spellseq.Knacks[ i ]+"</b>")
            }
            line( txtextra + nxtwv?txtwv:txtwv2+nxtcst?txtcst:txtcst2, "");
            this.chat( sectSpell.toString(), Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive | Earthdawn.whoFrom.character );
          } break;  //End Knacks
          case "Knack2": {
            //Sequence Control. Normal Case is (noseqactive || seqended || (step==0&!other)), if not go through different cases to issue warnings.
            //At this stage, Action was taken, so we actually
            if( !(noseqactive || seqended || (spellseq.SeqStep==0 && !other))) {
              line( "Previous Sequence reset. Sequence restarted and Knack added for : <b>" + spellseq.spelldata.Name +"</b>"
              ,"Knacks were selected while another spell was in sequence. Sequence restarted with current spell");
              initSpell(); //Action was taken initialize sequence
            } //else                    //Normal Case
            // if(noseqactive || seqended)
            // initSpell(); //Action was taken initialize sequence
            // //end sequence control

            let prenac = Earthdawn.buildPre("SP",ssa[3]),
                nacnm = Earthdawn.getAttrBN( this.charID, prenac+"Name","");
            line("Knack/BSecret added: <b>" + nacnm +"</b>");
            if(spellseq.Knacks)
              spellseq.Knacks.push(nacnm);
            else
              spellseq.Knacks=[nacnm];

            if(spellseq.KnacksId)
              spellseq.KnacksId.push(ssa[3]);
            else
              spellseq.KnacksId=[ssa[3]];

            //Update the spelldata
            for(var key in fieldarray)
             if(Earthdawn.getAttrBN( po.charID, prenac + key, "")!=="")
               spellseq.spelldata[key]=Earthdawn.getAttrBN( po.charID, prenac   + key);

            //spellseq.spelldata.Notes="****Knack " + nacnm+"\n"+Earthdawn.getAttrBN( po.charID, prenac + "Notes", "")+"\n\n"+(spellseq.Knacks.length==1 ? "****Spell\n " +spellseq.spelldata.Name:"")+spellseq.spelldata.Notes;

            spellseq.spelldata.Strain=Earthdawn.parseInt2(spellseq.spelldata.Strain) + Earthdawn.parseInt2(Earthdawn.getAttrBN( po.charID, prenac + "Strain", "0"));
            spellseq.spelldata.StrainAdvanced=Earthdawn.getAttrBN( po.charID, prenac + "StrainAdvanced", "")||spellseq.spelldata.StrainAdvanced;
            if(spellseq.spelldata.StrainAdvanced && spellseq.spelldata.StrainAdvanced.length > 1)
              spellseq.spelldata.Strain_max="?{How Many Strain?|" + spellseq.spelldata.Strain +"}";
            else
              spellseq.spelldata.Strain_max=spellseq.spelldata.Strain;
            this.setWW( "SS-Strain_max", spellseq.spelldata.Strain_max||"0");

            if(spellseq.bGrim && !spellseq.bGrimAtt) {
              line("No Attunement <b> Raw Magic</b>","");
              spellseq.Type = "GR";
            }
            SaveSeq();
            line( txtextra + (nxtwv?txtwv:txtwv2)+(nxtcst?txtcst:txtcst2), "");
            this.chat( sectSpell.toString(), Earthdawn.whoTo.player | Earthdawn.whoTo.gm | Earthdawn.whoFrom.noArchive | Earthdawn.whoFrom.character );
          } break; //End Knacks2
          case "New": {
                //Sequence Control. Normal Case is (noseqactive || seqended || (step==0 && !other)), if not go through different cases to issue warnings.
                //At this stage, no action was taken, so sequence must not be initialized yet
            if( !(noseqactive || seqended || (spellseq.SeqStep==0 && !other))) {
              if ( other ) {
                line( "Other Sequence Active : <b>" + Earthdawn.makeButton( "Resume-"+spellseqsaved.spelldata.Name,
                "!Earthdawn~ charID: " + this.charID + "~ ForEach: inmt~  Spell: " + spellseqsaved.RowId + " : Sequence" ,
                "Resume Sequence." ,Earthdawn.Colors.param,Earthdawn.Colors.paramfg),"");
                line("Choose Extra Thread to start new sequence <b>" + spellseq.spelldata.Name +"</b>","");
              }  else if ( spellseq.SeqStep!==0 ) {
                line( "<b>Warning!</b> Trying to add threads for:<b> " + Earthdawn.getAttrBN( this.charID, pre + (bGrim ? "Name" : "Contains"), "" )
                + "</b>When sequence was already started. Choosing an Extra Thread will restart the sequence","Extra Threads Can only be selected when starting a sequence.");
              }
            } //else //Normal Case
            line("Choosing extra Threads");
            //end sequence control

            let opt = _.without( Earthdawn.safeString(spellseq.spelldata.ExtraThreads).split( "," ), "");
            for( let i = 0; i < opt.length; ++i )
              line( Earthdawn.makeButton( opt[ i ], "!Earthdawn~ charID: " + this.charID + "~ Spell: " + ssa[ 1 ] + ": " + "Extra: " + opt[ i ],
                  "Press this button to add an optional extra thread to this casting." ,Earthdawn.Colors.action,Earthdawn.Colors.actionfg),"");
            line( txtwv, "");
            this.chat( sectSpell.toString(), Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive | Earthdawn.whoFrom.character );
          } break;
          case "Extra": {
                // Sequence Control. Normal Case is (noseqactive || seqended || (step==0&!other)), if not go through different cases to issue warnings.
                // At this stage, Action was taken, so we actually
            if( !(noseqactive || seqended || (spellseq.SeqStep==0 && !other))) {
              line( "Previous Sequence reset. Sequence restarted and extra thread added for : <b>" + spellseq.spelldata.Name +"</b>"
              ,"Extra Threads were selected while another spell was in sequence. Sequence restarted with current spell");
              initSpell(); //Action was taken initialize sequence
            } //else                    //Normal Case
            // if(noseqactive || seqended)
            // initSpell(); //Action was taken initialize sequence
            // //end sequence control
            spellseq.numExtraThreads=Earthdawn.parseInt2(spellseq.numExtraThreads)+1;
            spellseq.TotThreads=Earthdawn.parseInt2(spellseq.TotThreads)+1;
            spellseq.RemThreads=Earthdawn.parseInt2(spellseq.RemThreads)+1;
            line("Extra Thread added - Threads: " + spellseq.spelldata.sThreads + " + " + spellseq.numExtraThreads +" extra" );

            //v3.19 is it Necessary ??
            this.misc[ "esGoal" ] = spellseq.numExtraThreads;
            this.misc[ "esStart" ] = spellseq.TotThreads;
            if(spellseq.ExtraThreads) spellseq.ExtraThreads.push(ssa[3]); else spellseq.ExtraThreads=[ssa[3]];
            if(spellseq.bGrim && !spellseq.bGrimAtt) {
              line("No Attunement <b> Raw Magic</b>","");
              spellseq.Type = "GR";
            }
            SaveSeq();
            line( "Updated " + ssa[ 3 ],"" );
            line( txtwv, "");
            this.chat( sectSpell.toString(), Earthdawn.whoTo.player | Earthdawn.whoTo.gm | Earthdawn.whoFrom.noArchive | Earthdawn.whoFrom.character );
          } break; //End Extra
          case "Weave": {
                //Sequence Control.
                //At this stage, Action was taken, so we actually reset the sequence
            if( other && !seqended ) { //Another spell was in middle of an unfinished sequence
              this.misc[ "warnMsg" ]= "Cancelling Sequence for <b>" + spellseqsaved.spelldata.Name + "</b>. Sequence Restarted .";
              //initSpell();
            } else if( spellseq.SeqStep == 2 )      // We are not on a correct step
              this.misc[ "warnMsg" ] = "Note: Haven't you already pulled all the threads for this casting?";
            else if( spellseq.SeqStep == 4 ) {      // We are not on a correct step
              this.misc[ "warnMsg" ]= "Weaving threads for: " + spellseq.spelldata.Name + " but the spell just got cast. Sequence Restarted .";//Reset Sequence instead
              initSpell();
            }
            // else {                    //Normal Case
            //   if( noseqactive || seqended) initSpell();    //Action was taken initialize sequence
            // }
            //end sequence control

            let disp = Earthdawn.dispToName( spellseq.spelldata.Discipline, "weaving" );
            let rid = ssa[ 3 ],
            pre2 = Earthdawn.buildPre( "T" ,rid);
            this.Karma( pre2 + "Karma", 0 );
            this.misc[ "rollName" ] = "Weaving";
            this.misc[ "reason" ] = "Weaving " + Earthdawn.getAttrBN( this.charID, pre2 + "Name", "0") + " : " + spellseq.spelldata.Name;
            this.misc[ "headcolor" ] = "weave";
            this.bFlags |= Earthdawn.flags.VerboseRoll;
            this.Lookup( 1, [ "value", pre2 + "Step" ]);
            this.targetNum = Earthdawn.getParam( spellseq.spelldata.Numbers, 1, "/" );
            this.misc[ "sayTotalSuccess" ] = true;

            //v3.19 is is tuseful?
            this.misc[ "esGoal" ] = spellseq.TotThreads;
            this.misc[ "esStart" ] = spellseq.CurThreads;
            this.misc[ "woveTip" ] = spellseq.spelldata.sThreads + " base spell threads, plus " + spellseq.numExtraThreads + " Extra threads." ;
            if( spellseq.bGrim && !spellseq.bGrimAtt ) {
              this.misc[ "endNote" ] = "No Attunement <b> Raw Magic</b>";
              spellseq.Type = "GR";
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
            spellseq.CurThreads = esDone;
            spellseq.RemThreads=Math.max(0, spellseq.TotThreads-spellseq.CurThreads) ;
            spellseq.SeqStep = ( spellseq.RemThreads <=0) ? "2" : "1";
            if ( spellseq.RemThreads <=0) lines.push(txtcst);    //If Weaving finished, offer to cast
            SaveSeq();
            return lines;
          }
          case "Cast": {
                //Sequence Control.
                //At this stage, Action was taken, so we actually reset the sequence
            if( other && !seqended ) { //Another spell was in middle of an unfinished sequence
              this.misc[ "warnMsg" ]= "Canceling Sequence for "+ spellseqsaved.spelldata.Name + ". Sequence Restarted .";
              spellseq.SeqStep=2;
              spellseq.CurThreads = 99;     //Skipping Weaving altogether
              spellseq.RemThreads= 0;
            } else if( spellseq.SeqStep == 4 ) {
              this.misc[ "warnMsg" ] = "Note: You have already attempted to cast this spell. Resetting the sequence";
              spellseq.SeqStep=2;
              spellseq.CurThreads = 99;     //Skipping Weaving altogether
              spellseq.RemThreads= 0;
            } else if(spellseq.CurThreads < spellseq.TotThreads) // && ( spellseq.SeqStep == 1 || spellseq.SeqStep == 0 )  ??
              this.misc[ "warnMsg" ] = "Note: Have you pulled all the threads you need? Only " + spellseq.CurThreads + " of "  + spellseq.TotThreads + " done.";
            //Normal Case
      //      if(noseqactive || seqended)
        //    initSpell(this); //Action was taken initialize sequence
            //end sequence controlfieldarray

            let rid = ssa[ 3 ],
            pre2 = Earthdawn.buildPre( "T", rid);
            this.Karma( pre2 + "Karma", 0 );
            this.misc[ "rollName" ] = "Spell";
            this.misc[ "reason" ] = Earthdawn.getAttrBN( this.charID, pre2 + "Name", "0") + " : " + spellseq.spelldata.Name;
            this.misc[ "headcolor" ] = "action";
            this.misc[ "Special" ] = "SPL-Spellcasting";
            this.bFlags |= Earthdawn.flags.NoOppMnvr;
            this.Lookup( 1, [ "value", pre2 + "Step" ]);
            //JBF@JBF@CD Attempt at Targeting
            let tType=Earthdawn.getAttrBN( this.charID, pre2 + "Casting", "MD")
            if( tType && tType !== "None" )
            if( tType.startsWith( "Ask" ))
            this.misc[ "targettype" ] = tType.substring( 0, tType.lastIndexOf( ":" ));
            else if( tType.slice( 1, 3) === "D1")     // PD1, MD1, and SD1, go to just the first two characters.
            this.misc[ "targettype" ] = tType.slice( 0, 2);
            else if( tType.startsWith( "Riposte" ))
            this.misc[ "targettype" ] = "Riposte";
            else
            this.misc[ "targettype" ] = tType;fieldarray

            if( spellseq.bGrim && spellseq.bGrimAtt)
            this.misc[ "grimCast" ] = true;   // This is a spell being cast from a grimoire.  It counts as one extra success.

            let fx = spellseq.spelldata.FX;
            if( fx && ( fx.startsWith( "Attempt" ) || fx.startsWith( "Success")))
            this.misc[ "FX" ] = fx;
            this.misc[ "displayMsg" ] = spellseq.spelldata.DisplayText||"";
            this.misc[ "successMsg" ] = spellseq.spelldata.SuccessText||"";
            this.misc[ "failMsg" ] = spellseq.spelldata.FailText||"";
            let tt = spellseq.spelldata.sayTotalSuccess;
            this.misc[ "sayTotalSuccess" ] = (tt % 2) == 1;
            if( tt > 1 ) this.misc[ "SpellBuffSuccess" ] = true;
            ssa[ 2 ] = "Cast2";
            this.misc[ "Spell" ] = ssa;
            // this.Roll( [ "Roll" ] );
            this.ForEachHit( [ "Roll" ] );    // This makes a call to Roll and RollFormat. Cast2 below will be called, and then back to RollFormat.
          } break; //end Cast
          case "Cast2": {       // RollFormat calls back to here. We return additional formatted lines.fieldarray
            let lines = [];
            spellseq.SeqStep = ( "failBy" in this.misc ) ? "3" : (nowil ? "5":"4");     //If there is no will effect, we skip the step 4
            let fail = ("failBy" in this.misc) && !("SpellBuffSuccess" in this.misc);     // Will allow to skip unnecessary information in the roll template
            let es = ( "extraSucc" in this.misc ) ? Earthdawn.parseInt2(this.misc[ "extraSucc" ]) : 0;    //Number of extra successes
            if( bGrim && bGrimAtt )
              es += 1;    // Player Guide : Grimoire casting with own Grimoire automatically adds one success.
            let rid = ssa[ 3 ],
            pre2 = Earthdawn.buildPre( "T",rid );
            let cntdwn = 0;     //This is the duration in round for the countdownfieldarray
            if( es > 0 )
              spellseq.numExtraSuccesses=es;
            let esbonus = (es>=1) ? [spellseq.spelldata.SuccessLevels] : []; //Extra Success Bonuses
            let esdone = (es==0); // This will track if the extra successes were processed (or if it is ever needed)
            let etbonus = spellseq.ExtraThreads||[]; //Extra Thread Bonus
            let allbonus = esbonus.concat(etbonus);
            let bbonus = etbonus; // Will progressively be removed of the
            let rank = Earthdawn.getAttrBN( this.charID, pre2+"Effective-Rank", "0" );

            //log("allbonus " + JSON.stringify(allbonus));

            function extra( lbl, txtvar, lookup, def ) {      // Write out spell information, possibly modified by extra successes.
              'use strict';
              let incDur = false, // Will record if we are dealing with duration changed to minutes
              inc = 0,
              saved = "",
              t3 = "";
              //let txt = Earthdawn.getAttrBN( po.charID, presp + txtvar, def ).toString();
              let txt = Earthdawn.safeString(spellseq.spelldata[txtvar]).length>0 ? Earthdawn.safeString(spellseq.spelldata[txtvar]) : def;
              for( let i = (es ? 0 : 1); i < allbonus.length; ++i ) {     // If we don't have any extra successes, then we don't process the first value.
                if( allbonus[ i ].match( lookup ) ) {     //allbonus lists all bonus from Extra Success and Extra Threads
                  if ( i == 0 && es > 0 )
                    esdone = true;    // We are processing the ES, don't display them at the end
                  if( allbonus[ i ].match( /Inc.*Dur.*min.*/ig )) {     //Duration switched from Round to Min
                    incDur = true;
                    bbonus = _.without( bbonus, allbonus[ i ] );    // We found a line, we remove it
                    continue;
                  }
                  let i1 = allbonus[ i ].indexOf( "(" );    // This looks for what is between brackets
                  if( i1 != -1 ) {
                    let i2 = allbonus[ i ].indexOf( ")", i1 +1 );
                    if( i2 == -1)
                    i2 = allbonus[i].length;
                    let i3 = i1+1;
                    let number = new RegExp( /[\s\d+-]/ );
                    while ( number.test(allbonus[i].charAt( i3 )) )
                    ++i3;
                    inc += Earthdawn.parseInt2(allbonus[ i ].slice( i1+1, i3)) * (( i == 0 && es > 0 ) ? es : 1 );    // We get the increment, and for the extra success, we multiply by the number of es
                    saved = allbonus[ i ].slice( i3,i2 );
                  }
                  t3 += " " + (( i == 0 && es > 1 ) ? "+ " + es.toString() + " x " : "+ " ) + allbonus[i];
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
              if( lbl == "Duration" && txt.match(/R[oun]{0,3}d/gi)) {
                let txta = txt.split( "+" );
                for(let i=0; i < txta.length; i++)
                  cntdwn += Earthdawn.parseInt2( txta[i].replace( /[^\d]/gi, ""));    //Purge any non number
                cntdwn += Earthdawn.parseInt2( inc );
              }
              return inc;
            } // End function extra()

            if( fail )
              lines.push("End Sequence " + txtreset); //If failed, we don't display all the details of the results
            else {    // is successful
              extra( "Range", "Range", /R[a]{0,1}ng/gi, "" );     //Range, Rng
              let x3 = spellseq.spelldata.AoE;
              if( x3 && x3 != "x" && x3 != " " )
              extra( "AoE", "AoE", /Area/gi, " " );     //Area
              let nmbrs = spellseq.spelldata.Numbers;
              if( spellseq.spelldata.Discipline === "Illusionism" )
                lines.push( "<b>Dispel / Sense Diff:</b> " + Earthdawn.texttip( Earthdawn.getParam( nmbrs, 3, "/" ), "Target number to Dispel this spell.") + " <b>/</b> "
                    + Earthdawn.texttip( Earthdawn.getParam( nmbrs, 4, "/" ), "Target number to Sense an Illusion spell."));
              else
                lines.push( "<b>Dispel Diff:</b> " + Earthdawn.texttip( Earthdawn.getParam( nmbrs, 3, "/" ), "Target number to Dispel this spell."));
              extra( "Duration", "Duration", /Dur/gi, "" );
              let x4 = spellseq.spelldata.WilSelect;
              if( x4 && x4 !== "None") {
                spellseq.ESEffect = extra( "Effect :" + x4 + " +", "WilEffect", /Ef[fe]{0,2}ct.*Step/gi, "0" );
                let x2 = spellseq.spelldata.EffectArmor;
                if( x2 && x2 != "N/A" )
                  lines[ lines.length - 1 ] += " " + x2;
                lines.push( "<b>Effect :</b>" + txtfx );
              }
              extra( "Effect" , "Effect", /Ef[fe]{0,2}ct.*Other.*/gi, "" );

              if( !esdone )
                lines.push( "<b>" + "Extra Success" + "</b> " + esbonus.toString() + (( es >= 1) ? " x " + es : ""));     //ES was not processed, display at the end
              if( bbonus.length > 0 )
                lines.push( "<b>" + "Extra Threads" + "</b> " + bbonus.toString());     //Some ET not processed, display at the end
              if( spellseq.Knacks)
                for(let i=0 ; i < spellseq.Knacks.length ; i++ )
                  lines.push( "<b> Spell Knack :</b> " + Earthdawn.texttip(spellseq.Knacks[i], Earthdawn.getAttrBN( this.charID, Earthdawn.buildPre("SP",spellseq.KnacksId[i]) + "Notes", "")));
              lines.push( "<b>Description:</b>  "+ Earthdawn.texttip("(Hover)",Earthdawn.safeString(spellseq.spelldata.Notes) .replace( /\n/g, "&#013;")));
              if( !x4 || x4 == "None")
                lines.push("<b>No Will Effect</b> - End Sequence :" + txtreset);    //If no Will Effect, Sequence is finished
                  //This sends multi-round spells to the Turn Tracker
              if( cntdwn >= 2 ) {
                let tt = Campaign().get( 'turnorder' );
                let tracker = (tt == "") ? [] : JSON.parse( tt );
                let name = "CntDwn: " + spellseq.spelldata.Name;
                let custom = {id: "-1" , pr: "-" + cntdwn ,custom: name, formula: "1" };
                tracker.push( custom );
                Campaign().set('turnorder', JSON.stringify( tracker ));
              }
            } //End if successful
            if(spellseq.bGrim && !spellseq.bGrimAtt) {      //Raw Casting only
              lines.push("<b> Raw Magic </b>"+txtwarp+txtmark);
              //this.chat("<b> Raw Magic </b>"+ txtwarp+ " " + txtmark , Earthdawn.whoTo.gm | Earthdawn.whoFrom.noArchive | Earthdawn.whoFrom.character);
              spellseq.Type="GR";
            }
            SaveSeq();
            //log(JSON.stringify(lines));
            return lines;
          } //End Cast2
          case "Effect": {    // Spell Will Effect test.
                //For Circle, added the case for Creatures, where SrRating should be used
                //Need to take also into account the case of direct Will Attribute
            let skipseq  = false;
            if( other ) {
              this.misc[ "warnMsg" ]= "Rolling Effect for: " + spellseq.spelldata.Name + " but the spell in Sequence is: "
                  + spellseqsaved.spelldata.Name + ". Sequence will not be reset (in case it is a multiround effect)";
              skipseq = true;
            } else if( spellseq.SeqStep == "5" )
              this.misc[ "warnMsg" ] = "Warning: An Effect Test has already been rolled.";
            else if( spellseq.SeqStep != "4" )
              this.misc[ "warnMsg" ] = "Warning: The last thing you did was not to successfully cast the spell.";

            let rid = ssa[ 3 ],
            wilattr = (rid=="Wil"),
            code,n,n2, pre2;
            switch (wilselect) {
              case "Circle":  code = "DSP"; n = "Circle";         break;
              case "Rank":    code = "T";   n = "Effective-Rank"; break;
              default: code = "T"; n = "Step";
            }
            pre2 = wilattr ? "Wil-" : Earthdawn.buildPre( code, rid);
            if( n == "Step" ) {
              this.Karma( pre2 + "Karma", 0 );
              // if( Earthdawn.getAttrBN( this.charID, pre2 + "Strain","0", true ))
              //   this.misc[ "strain" ] = Earthdawn.getAttrBN( this.charID, pre2 + "Strain","0", true ); //JBF@CD : Bug in the way I was passing the strain in the spell sequence
            }
            this.misc[ "headcolor" ] = "effect";
            this.misc[ "rollName" ] = "Spell Effect";
            this.misc[ "reason" ] = spellseq.spelldata.Name + " Effect : ";
            if(wilselect=="Circle")
              this.misc[ "reason" ] += isng ? (disp + " Circle") : "Circle/SR";
            else if ( wilattr )
              this.misc[ "reason" ] += "Willpower";
            else
              this.misc[ "reason" ] +=(Earthdawn.getAttrBN( this.charID, pre2 + "Name", "0")) + ((wilselect=="Rank") ? " Rank" : "");
            let fx = spellseq.spelldata.FX;
            if( fx && fx.startsWith( "Effect" ))
            this.misc[ "FX" ] = fx;
            this.Parse( "armortype: " + spellseq.spelldata.EffectArmor );
            this.bFlags |= Earthdawn.flags.WillEffect; //JBF@JBF@CD is it still useful

            let t2 = Earthdawn.parseInt2( Earthdawn.getAttrBN( this.charID,
                (!isng && wilselect=="Circle") ? "SrRating" : (wilattr ? "Wil" : (pre2 + n)), 5));   //This is the step
            this.Lookup( 1, [ "value", spellseq.spelldata.WilEffect, t2.toString(),  spellseq.ESEffect||0  ] );
            if( !skipseq ) {
              spellseq.SeqStep = 5;
              SaveSeq();
              this.misc[ "endNote" ] = "Apply Dmg and then " + txtreset;
            }
            this.ForEachHit( [ "Roll" ] );
          } break;
          case "WarpTest": {
            let circle = spellseq.spelldata.Circle;
            let region=ssa[ 3 ];
            let step, dmg;
            switch( region ){
              case "Open":      step = circle + 5;  dmg = circle + 8;  break;
              case "Tainted":   step = circle +10;  dmg = circle +12;   break;
              case "Corrupt":   step = circle +15;  dmg = circle +16;  break;
              default:          step = circle;      dmg = circle + 4;  //Region Type Safe
            }
            this.misc[ "rollName" ] = "Warp";
            this.misc[ "reason" ] = "Warp Test " + region + " Astral Space";
            this.misc[ "headcolor" ] = "action";
            this.bFlags |= Earthdawn.flags.VerboseRoll;
            this.misc[ "step" ] = step;
            this.misc[ "targetChar" ] = this.charID;
            this.misc[ "targetName" ] =Earthdawn.getAttrBN( this.charID, "character_name", "0");
            this.misc[ "targettype" ] = "MD-Nat";
            this.targetNum =  Earthdawn.getAttrBN( this.charID, "MD-Nat", "0");
            this.misc[ "sayTotalSuccess" ] = true;
            this.misc[ "endNoteFail" ] = "No Warping Damage";
            this.misc[ "endNoteSucc" ] = Earthdawn.makeButton( "Warp Damage",
            "!Earthdawn~ charID:"+ this.charID + "~ armortype: MA-Nat~ Reason:Warp Damage ~ foreach~  Roll : " + dmg + ": ?{Modification|0}" ,
            // "!Earthdawn~ charID: " + this.charID + "~ Damage : MA-Nat : " + dmg,
            "Warping Damage done to the character" ,Earthdawn.Colors.damage,Earthdawn.Colors.damagefg);
            ssa[ 2 ] = "WarpTest2";
            this.misc[ "Spell" ] = ssa;
            this.Roll( [ "Roll"] );
          } break; //End TuneGrimoire
          case "WarpTest2": {     // Roll calls back to here.
            let lines = [];
            return lines;
          } //End WarpTest2
          case "HorrorMark": {
            let circle= spellseq.spelldata.Circle;
            let region=ssa[3];
            let step;
            switch( region ) {
              case "Open":    step = circle + 2;  break;
              case "Tainted": step = circle + 5;  break;
              case "Corrupt": step = circle +10;  break;
              default : this.chat(" Region is Safe, No Corruption!" ); return;  //Region Type Safe
            }
            this.misc[ "RollType" ] = "w gm";
            this.misc[ "rollName" ] = "Horror Mark";
            this.misc[ "reason" ] = "Horror Mark Test";
            this.misc[ "headcolor" ] = "action";
            this.bFlags |= Earthdawn.flags.VerboseRoll;
            this.misc[ "step" ] = step;
            this.misc[ "targetChar" ] = this.charID;
            this.misc[ "targetName" ] =Earthdawn.getAttrBN( this.charID, "character_name", "0");
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
          case "Reset": {
            this.setWW( "SS-Active", "0");
            //this.TokenSet( "clear", "SustainedSequence", "" );
            this.setWW( "SS-spellseq", "{}");
//                this.TokenSet( "clear", "spellseq", "{}" );
            this.chat("Spell Sequence Reset. Start a new one", Earthdawn.whoTo.player | Earthdawn.whoTo.gm | Earthdawn.whoFrom.character);
          } break;      // End Reset
        } // end main switch.
      } catch(err) { Earthdawn.errorLog( "ED.Spell() error caught: " + err, po ); }
    } // End ParseObj.Spell( ssa )




            // ParseObj.strainCalc()
            // pre = prefix with "Strain" after it.
            // ignoreStrainCommand. if this is defined, then it ignores strainCommand and will return strain for this routine. 
            //
            // For right now this is extremely simple, but will become much more complex once strain formulas are implemented. 
            /*
              T_Strain is still the input for the numeric part
              T_Strain_max is set by the sheetworker and is used in a ~Strain: @{T_STrain_max}. It is either equal to T_Strain or to a query with T_Strain as default
              T_StrainAdvanced is a drop-down that right now is either "" (fixed strain) or "Ask". This will become much more complex in the future, especially for 1879. 
              T_StrainAdvanced_max is the formula to be displayed to the user
              Example Strains from ED and 1879: (ones marked with * are currently supported. All others are not yet supported but will be in the future. 
               *Strain: 6
                Strain: 2 + target count
                Strain: 4 + TMD
                Strain: 4 + 1 per Spellcasting Test success
                Strain: 4 + 2 per success  
                Strain: 5+Rank
                Strain: 9 + 1 per target
                Strain: 1 + Casting Difficulty
                Strain: 5 + Force Rating of spirit  
            */
    this.strainCalc = function( pre, ignoreStrainCommand )  {
      'use strict';
      try {
        if( !ignoreStrainCommand && ("strainCommand" in this.misc))  return 0;       // Strain has already been applied.
        if( "strain" in this.misc )
          return Earthdawn.parseInt2( this.misc[ "strain" ] );    // Strain has already been calculated.
        return this.getValue( pre + "Strain" );
      } catch(err) { Earthdawn.errorLog( "ED.strainCalc() error caught: " + err, po ); }
    } // End ParseObj.strainCalc




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
              val -= 2;   // basic blindsided penalty to target number. 
              if (Earthdawn.getAttrBN( cID, "combatOption-DefensiveStance", "0", true) == "1" )
                val -= Earthdawn.getAttrBN( cID, "Misc-DefStance-Bonus", 3);    // remove the Defensive stance bonus target had when blindsided.
              if ( !(flags & Earthdawn.flagsTarget.Natural)       // remove any bonus attached to shield target had when blindsided.
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
      } catch(err) { Earthdawn.errorLog( "ED.TargetCalc() error caught: " + err, po ); }
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
            var tType = Earthdawn.safeString( ssa[ 1 ] );
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
            if( Earthdawn.safeString( this.edClass.msgArray[ i ] ).slice(0,10).toLowerCase().indexOf( "foreach" ) != -1 ) {     // If there was a foreach, replace it.
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
                if( !( Earthdawn.safeString( this.edClass.msgArray[ this.indexMsg ]).trim().toLowerCase().startsWith( "foreach" )))
                  t += Earthdawn.colonFix( "~ " + this.edClass.msgArray[ this.indexMsg ].trim() );
              s = "&{template:default} {{name=How many targets?  ";
              let a = [ "", "First", "Second", "Third", "Forth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth" ];
              for( let j = 1; j < 11; ++j ) {
                s += "[" + j.toString() + "](" + v + "~ TargetSet";
                for( let k = 1; k <= j; ++k )
                  s += Earthdawn.constant( "ColonAlt" ) + Earthdawn.constant( "at" ) + Earthdawn.constant( "braceOpen" ) + "target"
                        + Earthdawn.constant( "pipe" ) + a[k] + " Target" + Earthdawn.constant( "pipe" ) + "token_id" + Earthdawn.constant( "braceClose" );
//                  s += Earthdawn.colonFix( ": " + Earthdawn.constant( "at" ) + "{target|" + a[k] + " Target|token_id}");
                s += t + ")";
              }
              s += "}}";
              this.chat( s, Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive );
            }
            this.targetNum += this.ssaMods( ssa, 2) || 0;
        } }
      } catch(err) { Earthdawn.errorLog( "ED.TargetT() error caught: " + err, this ); }
      return;
    } // End ParseObj.TargetT()



              // ParseObj.TargetTypeToFlags()
              //
              // Passed a Target Type (PD, PDh, PDHp1p, PD-each, PD-Nat, etc)
              // Return the bFlags values corresponding to this target type.
    this.TargetTypeToFlags = function( tType ) {
    'use strict';
      let ret = 0;
      try {
        let tmp = Earthdawn.safeString( tType ).trim().toLowerCase();
        switch ( tmp.slice( 0, 2)) {
          case "no":      break;      // None
          case "se":      ret |= Earthdawn.flagsTarget.Set;     break;
          case "pd":      ret |= Earthdawn.flagsTarget.PD;      break;
          case "md":      ret |= Earthdawn.flagsTarget.MD;      break;
          case "sd":      ret |= Earthdawn.flagsTarget.SD;      break;
          default:        this.chat( "Failed to parse TargetType: '" + tmp + "' in msg: " + this.edClass.msg.content, Earthdawn.whoFrom.apiError );
        }
        if( ret & Earthdawn.flagsTarget.Mask ) {        // Do this only if found a valid string above.
          if( tmp.slice( 2, 3) === "h" )
            ret |= Earthdawn.flagsTarget.Highest;
          if( tmp.endsWith( "each"))
            ret |= Earthdawn.flagsTarget.Each;
          if( tmp.endsWith( "p1p"))
            ret |= Earthdawn.flagsTarget.P1pt;
          if( tmp.indexOf( "-nat" ) > -1)
            ret |= Earthdawn.flagsTarget.Natural;
        }
      } catch(err) { Earthdawn.errorLog( "ED.TargetTypeToFlags() error caught: " + err, this ); }
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
      } catch(err) { Earthdawn.errorLog( "ParseObj.TokenActionToggle() error caught: " + err, this ); }
    } // End ParseObj.TokenActionToggle()



          // TokenFind()
          // For some reason (almost certainly because there was a @{target} in the command macro - which caused the system to stupidly clear all selected tokens)
          // we don't have tokenInfo for a routine that needs it.
          // See if we can figure it out.
          // 1) If there is only one token for the charID on the current page, use that token.
    this.TokenFind = function()  {
      'use strict';
      try {
        if( this.charID === undefined ) {
            this.chat( "Error! TokenFind() when don't have a charID.", Earthdawn.whoFrom.apiError );
            return;
        }
        if( this.edClass.msg === undefined )
          return;
        let tl = Earthdawn.safeArray( this.ForEachToken( [ "ForEach", "list", "c", "ust" ] ));
        if( tl.length === 1 ) {
          this.tokenInfo = tl[ 0 ];
          return true;
        } else
          return false;
      } catch(err) { Earthdawn.errorLog( "ParseObj.TokenFind() error caught: " + err, this ); }
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
        let ch = getObj( "character", this.charID)
        if( !ch ) {
          log( "Error! TokenSet() for charID " + this.charID + " the character for this token is no longer valid." );
          return;
        }
        if( this.tokenInfo === undefined || this.tokenInfo.tokenObj === undefined )
          this.TokenFind();

        let bToken = (this.tokenInfo != undefined && this.tokenInfo.tokenObj != undefined);
        if( secondary !== undefined )
          secondary = secondary.replace( /,/g, Earthdawn.constant( "CommaAlt" )).replace( /:/g, Earthdawn.constant( "ColonAlt" ));
        if( tertiary !== undefined )
          tertiary = tertiary.replace( /,/g, Earthdawn.constant( "CommaAlt" ) ).replace( /:/g, Earthdawn.constant( "ColonAlt" ));
        key += ":";   // Key should end in colon to make it more readable when debugging.
        let changed = false,
            changedMark = false;
        let clr;
        switch ( Earthdawn.safeString( what ).toLowerCase().trim()) {
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

        let att = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "pseudoToken" }, "");
        let pt = "," + att.get( "current" );
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
      } catch(err) { Earthdawn.errorLog( "ParseObj.TokenSet() error caught: " + err, this ); }
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
            ret.push( markers.slice( i + key.length + 1, e).replace(new RegExp( Earthdawn.constant( "ColonAlt" ), "g"), ":").replace(new RegExp( Earthdawn.constant( "CommaAlt" ), "g"), ",") );
            i = markers.indexOf( "," + key, e-1 );
        }
      } catch(err) { Earthdawn.errorLog( "ParseObj.TokenGet() error caught: " + err, this ); }
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
            let e = markers.indexOf( ",", i + 1);
            ret.push( markers.slice( i + key.length + 1, e));
            i = markers.indexOf( "," + key, e-1 );
        }
      } catch(err) { Earthdawn.errorLog( "ParseObj.TokenGetWithID() error caught: " + err, this ); }
      return ret;
    } // End ParseObj.TokenGetWithID()



          // ParseObj.TuneMatrix()
          // Move a spell into a matrix.
          // This routine is called  twice. The character sheet calls this with ssa[1] = "Spell".
          //    This will generate a chat window button that when pressed calls this routine with ssa[1] = "Matrix"
          // ssa = Spell, spell row ID.
          // ssa = Matrix, spell row ID, Matrix row ID.
          // ssa = share or pseudo, spell row ID, (Std, Enh, Arm, Sha)
          // ssa = destroy"
    this.TuneMatrix = function( ssa ) {
      'use strict';
      let po = this;
      try {
        let pseudoType,pnm,prid;

        function WipeMatrix() {
          let attributes = findObjs({ _type: "attribute", _characterid: po.charID }),
           attflt= attributes.filter( function (att) { return att.get( "name" ).endsWith( "_SPM_Contains" )});
          _.each( attflt, function (att) {
            if( att.get( "name" ).endsWith( "_SPM_Contains" )) {
              Earthdawn.abilityRemove( po.charID, Earthdawn.constant( "Spell" ) + att.get( "current" ));
              let pre3=Earthdawn.buildPre( att.get("name"));
              if(Earthdawn.getAttrBN( po.charID, pre3 + "Origin" , "") == "Pseudo") {
                let attflt2= attributes.filter( function (att) { return att.get( "name" ).startsWith( pre3 )});
                _.each( attflt2, function (att2) {att2.remove();});
              } else {
                po.setWW(pre3 + "Contains", "Empty");
                po.setWW(pre3 + "Threads", "x");
                po.setWW(pre3 + "EnhThread", "x");
                po.setWW(pre3 + "Notes", "");
                po.setWW(pre3 + "spRowID", "");
                po.setWW(pre3 + "ChainCast", "0");
              }
            }
          }); //End each Attribute

          attflt= attributes.filter( function (att) { return att.get( "name" ).endsWith( "_SP_Name" )});
          _.each( attflt, function (att) { po.setWW( Earthdawn.buildPre( att.get( "name" )) + "spmRowID", "0" ); }); //End each Attribute

          po.setWW( "SS-Active", "0");
          po.setWW( "SS-spellseq", "{}");
          //this.TokenSet( "clear", "spellseq", "{}" );
          po.chat( "All Matrix have been wiped, and Spell Sequence reset" , Earthdawn.whoTo.player | Earthdawn.whoTo.gm | Earthdawn.whoFrom.character);
        } // End WipeMatrix


        switch ( Earthdawn.safeString( ssa[ 1 ] ).toLowerCase() ) {
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
                  if ( ( Earthdawn.getAttrBN( po.charID, Earthdawn.buildPre( "SPM", row ) + "Rank", 0, true) >= circle || Earthdawn.getAttrBN( po.charID, Earthdawn.buildPre( "SPM", row ) + "Origin", "") == "Pseudo" ) && !matrices.includes( row ))   // Only list the matrices of a rank ot hold this spell and are not already listed. Pseudo are now Rank 0, but listed anyway
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
                  s += Earthdawn.makeButton( pseu + t2 + (pseu ? "" : "-" + Earthdawn.getAttrBN( po.charID, prespm + "Rank", "0")) + " "
                          + Earthdawn.getAttrBN( po.charID, prespm + "Contains", ""),
                          "!Earthdawn~ charID: " + po.charID + "~ TuneMatrix: Matrix: " + ssa[2] + ": " + indexMatrix,
                          undefined , Earthdawn.Colors.param, Earthdawn.Colors.paramfg );
                  if( pseu )
                    s += " " + Earthdawn.makeButton( '&#x261A;X', "!Earthdawn~ charID: " + po.charID + "~ TuneMatrix: Destroy: " + indexMatrix
                          + ": ?{Confirm Destroy this pseudo matrix|No|Yes}",
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
                  // Note: this does NOT break; it falls down.
          case "matrix": {    // The user has told us to swap a spell into a certain matrix.
                  // TuneMatrix: matrix: (spellFrom ID): (spellTo ID)
            let spellFrom = ssa[ ssa.length -2 ],     // rowID of repeating_spell
                matrixTo = ssa[ ssa.length -1 ],      // rowID of repeating_matrix
                preFrom = Earthdawn.buildPre( "SP", spellFrom ),
                preTo = Earthdawn.buildPre( "SPM", matrixTo ),
                preFromOld= Earthdawn.buildPre( "SP", Earthdawn.getAttrBN( this.charID, preTo + "spRowID", "") ),//Prefix of the Spell that was in the Matrix before
                t = "",
                lnks = Earthdawn.getAttrBN( this.charID, preFrom + "LinksProvideValueList", "").split(","), //Variants of the spell that is currently Attuning in order to create the pseudo
                lnksold = Earthdawn.getAttrBN( this.charID, preFromOld + "LinksProvideValueList", "").split(","), //Variants of the spell that was previously Attuned in order to destroy the pseudos
                mattype = Earthdawn.getAttrBN( this.charID, preTo + "Type", "-10");

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
              //toMatrix( "Rank", 15 ); No Rank for Pseudo Matrix
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
            } } else{ //For non-Pseudo Matrix, we have to take care of the pseudos of the linked spells
              _.each(lnksold, function(sp) { //Destroy all the pseudo Matrices
                let x=sp.replace("SP;",""),
                  spm= Earthdawn.getAttrBN(po.charID,Earthdawn.buildPre("SP",x)+"spmRowID",""),
                  spmt=spm.length>0 ? Earthdawn.getAttrBN(po.charID,Earthdawn.buildPre("SPM",spm)+"Origin",""): "";
                if(x && x.length>0 && spmt=="Pseudo")
                  po.TuneMatrix(["TuneMatrix","Destroy",spm,"Yes"]);
              });
              _.each(lnks, function(sp) {
                let x=sp.replace("SP;",""),
                y;
                switch(mattype){
                  case "-20": y="Sha";break;
                  case "25" : y="Arm";break;
                  case "15" : y="Enh";break;
                  case "-10":
                  default: y="Std";
                }
                if(x && x.length>0 && Earthdawn.getAttrBN(po.charID,Earthdawn.buildPre("SP",x)+"Type","Spell")=="Spell")
                  po.TuneMatrix(["TuneMatrix","Pseudo",y,x])
              });
            }

            t = Earthdawn.dispToName(Earthdawn.getAttrBN( po.charID, preFrom + "Discipline", "0"), "short") + "-"
              + Earthdawn.getAttrBN( po.charID, preFrom + "Circle", "0") + " - "
              + Earthdawn.getAttrBN( po.charID, preFrom + "Name", "");
              // + Earthdawn.getAttrBN( po.charID, preFrom + "Circle", "0") + " '"
              // + Earthdawn.getAttrBN( po.charID, preFrom + "Name", "") + "'";


            let aobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: po.charID, name: preTo + "Contains" });
            Earthdawn.abilityRemove( this.charID, Earthdawn.constant( "Spell" ) + aobj.get( "current" ) );
            Earthdawn.setWithWorker( aobj, "current", t );
            if( Earthdawn.getAttrBN( po.charID, preFrom + "CombatSlot", 1, true))
              Earthdawn.abilityAdd( this.charID, Earthdawn.constant( "Spell" ) + t, "!edToken~ %{selected|" + preTo + "Roll}" );

            let mThreads = (Earthdawn.getAttrBN( po.charID, preTo + "Type", 0) > 0) ? 1 : 0,    // Uses SPM_Type to calculate how many threads the matrix can hold.
              sThreads = Earthdawn.parseInt2(Earthdawn.getAttrBN( po.charID, preFrom + "sThreads", "0" ));
            toMatrix( "spRowID", Earthdawn.getAttrBN( this.charID, preFrom + "RowID" ));
            toMatrix( "Threads", Math.max( sThreads - mThreads, 0));
            copySpell( "CombatSlot", "1");
//            let aobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: po.charID, name: preFrom + "spmRowID" });
//            Earthdawn.setWithWorker( aobj, "current", matrixTo );
            toMatrix( "EnhThread", "x");
            toMatrix( "ChainCast", "0");

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
              let ind = spellsInMatrix.indexOf( rID );
              Earthdawn.setWW( Earthdawn.buildPre( "SP", rID ) + "spmRowID", ((ind === -1) ? "0" : matrixes[ ind ]), po.charID );
            });
          } break;
          case "thread": {      // Set this extra thread option to be the enhanced thread.
            this.setWW( Earthdawn.buildPre( "SPM", ssa[ 2 ] ) + "EnhThread", ssa[ 3 ] );
            this.chat( "Updated to " + ssa[ 3 ], Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive);
          } break;
          case "destroy": {      // Destroy a pseudo matrix.    format Destroy: RowID
            if( Earthdawn.safeString( ssa[ 3 ] ).toUpperCase().startsWith( "Y" ) ) {
              let pre = Earthdawn.buildPre( "SPM", ssa[ 2 ] ),
                  attributes = findObjs({ _type: "attribute", _characterid: this.charID });
                  if(Earthdawn.getAttrBN( this.charID, pre + "spmRowID", "").length>0)
                    this.setWW( pre + "spmRowID","");
              _.each( attributes, function (att) {
                if( att.get( "name" ).startsWith( pre ) )
                  att.remove();
              }); // End for each attribute.
            }
          } break;
          case "presetnew": //Create a New Preset Line and Save
          pnm  = "Preset";
          prid = Earthdawn.generateRowID();
                        //Will flow in case Save
          case "save":{ //Saves a Preset of Spell Matrices
            let pst=[],
            pstm=[],
            attributes = findObjs({ _type: "attribute", _characterid: this.charID }),
            attflt = attributes.filter( function (att) { return att.get( "name" ).endsWith( "_SPM_RowID" )}),
            attarray = ["CombatSlot","RowID","spRowID","EnhThread","Contains","Threads","ChainCast"],
            attarray2 = ["Type","Origin","Rank","DR"];

            if( !prid ) prid = ssa[ 2 ];
            if( !pnm )  pnm  = Earthdawn.getAttrBN( po.charID, Earthdawn.buildPre( "SPP", ssa[ 2 ] ) + "Name", "");
            let prespp = Earthdawn.buildPre( "SPP" , prid );


            _.each( attflt, function (att) {
              let pre=Earthdawn.buildPre( att.get( "name" ) ),
                js={},
                t="";
                _.each( attarray, function (obj) { if(Earthdawn.getAttrBN( po.charID, pre + obj, "").length>0) js[obj]=Earthdawn.getAttrBN( po.charID, pre + obj, ""); });
                if(Earthdawn.getAttrBN( po.charID, pre + "Origin", "")=="Pseudo"){
                  _.each( attarray2, function (obj) { if(Earthdawn.getAttrBN( po.charID, pre + obj, "").length>0) js[obj]=Earthdawn.getAttrBN( po.charID, pre + obj, ""); });
                  t+="Pseudo:";
                }
                pstm.push(js);
                switch(Earthdawn.getAttrBN( po.charID, pre + "Type", "")){case "15" :t+="Enh:";break; case "25" : t+="Arm:";break; case "-20": t+="Sha:"; break; default:t+="Std:";}
                t+=Earthdawn.getAttrBN( po.charID, pre + "Contains", "");
                t+=Earthdawn.getAttrBN( po.charID, pre + "EnhThread", "x").length>1 ? ":"+Earthdawn.getAttrBN( po.charID, pre + "EnhThread", ""):"";
                pst.push(t);
            }); // End for each attribute.
              this.setWW( prespp + "RowID", prid);
              this.setWW( prespp + "Name", pnm);
              this.setWW( prespp + "Preset", pst.join("\n"));
              this.setMaxWW( prespp + "Preset", JSON.stringify(pstm));
              this.chat( "Preset " + pnm + " Saved" , Earthdawn.whoTo.player | Earthdawn.whoTo.gm | Earthdawn.whoFrom.character);
            break;
          } //End Save
          case "load":{ //Loads a Preset of Spell Matrices
            let prespp = Earthdawn.buildPre("SPP", ssa[ 2 ] ),
             js=JSON.parse(Earthdawn.getAttrBN( po.charID, prespp + "Preset_max","[]")),
             ok=true;
             WipeMatrix();
             setTimeout(function(){
             _.each( js, function (att) { //Each item saved in the Preset_max
              let pseudo = (att.Origin && att.Origin=="Pseudo"), //pseudo matrix will create a new one
              rid = pseudo ? Earthdawn.generateRowID() : att.RowID,
              prespm = Earthdawn.buildPre( "SPM" , rid);

              if(!pseudo && rid !== Earthdawn.getAttrBN( po.charID, prespm + "RowID","")) {
               ok=false;
                log("Earthdawn.TuneMatrix()  failed to load preset for Matrix "+ att.Contains)
              } else  if( !att.Contains || !(att.Contains.includes(Earthdawn.getAttrBN( po.charID, Earthdawn.buildPre( "SP" , att.spRowID ) + "Name","")))) {
                ok=false;
                log("Earthdawn.TuneMatrix() Failed to load preset, spell doesn't exist  "+ att.Contains)
              } else {
                po.setWW(Earthdawn.buildPre( "SP", att.spRowID ) + "spmRowID" , rid)
                for(var key in att)
                  po.setWW( prespm + key  , att[ key ] );
              }
              if( Earthdawn.getAttrBN( po.charID, Earthdawn.buildPre( "SP", att.spRowID ) + "CombatSlot", 1, true))
                Earthdawn.abilityAdd( po.charID, Earthdawn.constant( "Spell" ) + att.Contains, "!edToken~ %{selected|" + prespm + "Roll}" );


            }); // End for each attribute.
            if(ok)
              po.chat( "Preset " + Earthdawn.getAttrBN( po.charID, prespp + "Name", "") + " Successfully Loaded" , Earthdawn.whoTo.player | Earthdawn.whoTo.gm | Earthdawn.whoFrom.character);
            else
              po.chat( "Preset " + Earthdawn.getAttrBN( po.charID, prespp + "Name", "") + " Loaded with errors, recommended to save the preset back" , Earthdawn.whoTo.player | Earthdawn.whoTo.gm | Earthdawn.whoFrom.character);
            },500);

            break;
          } //End Load
          case "wipematrix":{ //Wipes all Matrices, Resets the Sequence and deletes Pseudo Matrices
            WipeMatrix();
            break;
          } //end wipematrix
          default:
            Earthdawn.errorLog( "ED.TuneMatrix() error - badly formed command.", po );
            log( ssa );
        } // end switch
      } catch(err) { Earthdawn.errorLog( "ED.TuneMatrix() error caught: " + err, po ); }
    } // End ParseObj.TuneMatrix()



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
      } catch(err) { Earthdawn.errorLog( "ED.UpdateDates() error caught: " + err, this ); }
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
          let rt;
          if( state.Earthdawn.Rolltype.Override === false ) {   // no override, check default and exceptions.
            if ( this.tokenInfo && ("tokenObj" in this.tokenInfo) && this.tokenInfo.tokenObj.get( "layer" ) === "gmlayer" ) {   // If the token is on the GM layer, it is always gm only!
              rt = "w gm";
              this.misc[ "whoReason" ] = "Token is on the GM layer.";
            } else {  // Token is not on gm layer. Check for exceptions, and then default.
              let bpc = (Earthdawn.getAttrBN( this.charID, "NPC", "1") == Earthdawn.charType.pc);
              let except = bpc ? state.Earthdawn.Rolltype.PC.Exceptions : state.Earthdawn.Rolltype.NPC.Exceptions;
              let rn;                    // first, lets see if we can find a rolltype or a reason to check. 
              if( "skillClass" in this.misc ) {     // check skill class first, but if there is a named exception, this class exception will be overriden.
                let rnc = Earthdawn.matchString( this.misc[ "skillClass" ] );    // striped and lowercased
                if( rnc in except ) {
                  rt = except[ rnc ][ "display" ];
                  this.misc[ "skillExceptionIs" ] = rnc;
                  this.misc[ "whoReason" ] = "an exception for " + this.misc[ "skillClass" ] + " skills.";
                } else
                  this.misc[ "skillExceptionWouldBe" ] = this.misc[ "skillClass" ];
              }
              if( "rollName" in this.misc )
                rn = this.misc[ "rollName" ];
              else if( "reason" in this.misc )      // Note that right now we are testing all reasons. We might have to narrow it down. 
                rn = this.misc[ "reason" ];
              if( rn ) {
                let rnc = Earthdawn.matchString( rn );    // striped and lowercased
                if( rnc in except ) {
                  rt = except[ rnc ][ "display" ];
                  this.misc[ "exceptionIs" ] = rnc;
                  this.misc[ "whoReason" ] = "an exception for this name.";
                } else        // no exception, use the default.
                  this.misc[ "exceptionWouldBe" ] = rn;
              }
//cdd
              if( rt === undefined ) {
                rt = bpc ? state.Earthdawn.Rolltype.PC.Default : state.Earthdawn.Rolltype.NPC.Default
                this.misc[ "whoReason" ] = "Default for " + (bpc ? "PCs." : "NPCs.");
              }
            } // end exceptions or default.
          } else if( state.Earthdawn.Rolltype.Override === "Sheet" ) {    // use the old system where things are controled on a per talent basis by the player.
            if( "RollType" in this.misc )           // Option was "Ask" and we got an rolltype that way.
              rt = this.misc[ "RollType"];    // ?{Who should be able to see the results|Public, |Player & GM,pgm|GM Only,/w gm}
            else if ( this.tokenInfo && ("tokenObj" in this.tokenInfo) && this.tokenInfo.tokenObj.get( "layer" ) === "gmlayer" )    // If the token is on the GM layer, it is always gm only!
              rt = "w gm";
            else if( "rollWhoSee" in this.misc )    // This will be something like (xxx)_T_Rolltype or RollType-Dex
              rt =  Earthdawn.getAttrBN( this.charID, this.misc[ "rollWhoSee" ], "@{RollType}" );

            if( rt === "default" || rt === "@{RollType}" )
              rt = undefined;
            if( !rt )
              rt = Earthdawn.getAttrBN( this.charID, "RollType", "" );    // This is the default for the whole sheet.
              this.misc[ "whoReason" ] = "sheet settings.";
          } else {   // An override is in effect.
            rt = state.Earthdawn.Rolltype.Override;
            this.misc[ "whoReason" ] = "an active Override.";
          }

          if ( rt != undefined ) {
            let r = rt.trim().toLowerCase();
            if(( r === "player and gm") || r.endsWith( "pgm"))
              ret = Earthdawn.whoTo.gm | Earthdawn.whoTo.player;
            else if(( r === "gm only" ) || r.endsWith( "w gm" ))
              ret = Earthdawn.whoTo.gm;
            else if(( r === "controlling only") || r.endsWith("plr" ))
              ret = Earthdawn.whoTo.player;
        } }
      } catch(err) { Earthdawn.errorLog( "ED.WhoSendTo() error caught: " + err, this ); }
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
        let loopvar;    // This is just a utility variable is mostly used for setting things depending upon which specific command is being called.

//log( cmdSegment);
        switch ( Earthdawn.safeString( subsegmentArray[ 0 ] ).toLowerCase() ) {
          case "!edinit":             // We need to skip to the old parsing method.
            this.edClass.msgArray.splice( 0, this.indexMsg);
            this.edClass.msgArray[0] = this.edClass.msgArray[0].trim();
            this.edClass.Initiative();
            falloutParse = true;
            break;
          case "!earthdawn":      // Just skip this. There will be an extra one of these on Token Actions.
          case "!edcustom":
          case "":                // Also just skip these. The RollType and Karma routines sometimes put extra fields that can be skipped.
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
          case "abilityrebuild":
            this.abilityRebuild ( subsegmentArray );
            break;
          case "action":
            this.Action( subsegmentArray );
            break;
          case "apiping":
            if( Earthdawn.getAttrBN( this.charID, "API", 1 ) == 1) {
              this.setWW( "API", 3 );     // We want the on change sheetworkers to trigger, so FIRST change to 3, and then change back to 1, so that there is actually a change. 
              let po = this;
              setTimeout(function() { try {
                po.setWW( "API", 1 );
                } catch(err) {Earthdawn.errorLog( "ED.APIping setTimeout() pingpong error caught: " + err, po );} }, 200);
            } else    // API is not 1, so set it to 1. 
              this.setWW( "API", 1 );
            break;
          case "armortype":
            if( subsegmentArray.length > 1 ) {
              switch( Earthdawn.safeString( subsegmentArray[ 1 ] ).toLowerCase()) {
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
            this.Bonus( subsegmentArray );    // There is a bonus die to set.
            break;
          case "calcstep":
          case "calculatestep":
          case "calcvalue":
          case "calculatevalue":
            switch ( Earthdawn.safeString( subsegmentArray[ 1 ] ).toLowerCase() ) {
            case "jumpup":
              this.Karma( "Dex-Karma" );
              this.misc[ "rollName" ] = "Jumpup";
              this.misc[ "reason" ] = "Jumpup Test";
              this.misc[ "ModType" ] = "@{Adjust-All-Tests-Total}";
              this.misc[ "StyleOverride" ] = Earthdawn.style.Full;
              this.misc[ "headcolor" ] = "knockdown" ;
              break;
            }
            falloutParse = this.calculateStep( subsegmentArray );
            break;
          case "charid":    //  "CharID: (xx)": This command came with character ID attached (attached by the macro). Store this character ID.
            if( 1 < subsegmentArray.length )
              this.charID = subsegmentArray[ 1 ];
            break;
          case "chatmenu":
            this.ChatMenu( subsegmentArray );
            break;
          case "creaturepower":
          case "opponentmaneuver":
            this.CreaturePower( subsegmentArray );
            break;
          case "display":     // This just causes everything after the first colon to display in the chat window.
          case "chat":
            this.chat( subsegmentArray.slice( 1 ).join( ": " ), Earthdawn.whoFrom.character );
            break;
          case "strain":      // This falls through into Damage, but with an extra parameter (no armor) inserted between "strain" and the value.
          case "strainsilent":
            subsegmentArray.splice( 1, 0, "NA" );
            this.misc[ "strainCommand" ] = true;
          case "damage":      // Apply damage to selected tokens.  Must be preceded by ForEach or SetToken
          case "stun":
          case "recovery":
          case "woodskin":        // Obsolete Nov 2023.
          case "notwoodskin":     // Obsolete Nov 2023.
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
          case "foreachtokenlist":      // Note that this is the list of tokens that we are to do the command FOR (not the list of targets). It is not unusual that the list will be one token that we are to do the command for.
          case "tokenlist":
          case "fet":
          case "fetl":
            this.ForEachTokenList( subsegmentArray );
            break;
          case "fxset":
            this.FX( subsegmentArray );
            break;
          case "dec":     // dec: Wounds   or dec: Wounds: 2
          case "decrement":
            loopvar = true;
          case "inc":
          case "increment":
            if( subsegmentArray.length < 3 ) subsegmentArray[ 2 ] = 1;    // default to incrementing 1.
            if( loopvar )   // Decrement
              subsegmentArray[ 2 ] = parseInt( subsegmentArray[ 2 ]) * -1;
            subsegmentArray.splice( 1, 0, subsegmentArray[ 1 ] );   //  We need the name doubled since the first tells it where to place it, and the 2nd what the original value was.
            falloutParse = this.Lookup( 4, subsegmentArray );       // 4 sets the character sheet attribute in the first ssa parameter.
            break;
          case "init":
            falloutParse = this.Roll( subsegmentArray );
            break;
          case "karma":
          case "kc":
          case "dev pnt":
          case "dev pnts":
          case "dev":
          case "dp":
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
          case "marker":         // Set the status marker for selected tokens.
            this.MarkerSet( subsegmentArray );
            break;
          case "max":   // max: variable: constant.   // If variable is is greater than constant, set it to equal constant.
          case "setmax": {
            let m = Earthdawn.parseInt2( Earthdawn.getAttrBN( this.charID, subsegmentArray[ 1 ], "0"));
            if( m > Earthdawn.parseInt2( subsegmentArray[ 2 ] ))
              this.setWW( subsegmentArray[ 1 ], subsegmentArray[ 2 ] );
          } break;
          case "min":
          case "setmin": {
            let m = Earthdawn.parseInt2( Earthdawn.getAttrBN( this.charID, subsegmentArray[ 1 ], "0"));
            if( m < Earthdawn.parseInt2( subsegmentArray[ 2 ] ))
              this.setWW( subsegmentArray[ 1 ], subsegmentArray[ 2 ] );
          } break;
          case "misc":
            this.funcMisc( subsegmentArray );
            break;
          case "quick":       // This is just a way to quickly and easily insert some commands into the processing, but unlike 'value' it does not attempt to do any lookups. 
            switch ( Earthdawn.safeString( subsegmentArray[ 1 ] ).toLowerCase()) {
              case "fire":       // quick: fire: (size): (step)
                this.misc[ "step" ] = subsegmentArray[ 3 ];
                this.misc[ "reason" ] = subsegmentArray[ 2 ] + " damage";
                this.misc[ "rollName" ] = "Fire Damage";
                this.misc[ "AfterRoll" ] = "AfterRoll: buttonDamageBoth: PA: Fire damage";
                this.misc[ "headcolor" ] = "damage";
                break;
              case "fall":       // quick: fall: (size): (step)
                this.misc[ "step" ] = subsegmentArray[ 3 ];
                this.misc[ "rollName" ] = "Falling Damage";
                this.misc[ "reason" ] = subsegmentArray[ 2 ] + " Yrd falling damage";
                this.misc[ "AfterRoll" ] = "AfterRoll: buttonDamageBoth: NA: Falling damage";
                this.misc[ "headcolor" ] = "damage";
                break;
            } // end quick switch
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
            if( subsegmentArray.length > 1 ) {
              this.misc[ "reason" ] = cmdSegment.slice( cmdSegment.indexOf( ":" ) + 1).trim();  // Use the raw cmdSegment to allow colons in reason.
// We might want to put this explicitly here. 
//               this.misc[ "rollName" ] = this.misc[ "reason" ];
            }
            break;
          case "recalc":                  // Recalc function is done by sheetworker, but after they do the work, need to reload combat slots.
            this.chat( "Note: Sheetworker Recalc is triggered by setting the dropdown TO recalc, not by pressing the button.", Earthdawn.whoTo.player );
            break;
// record and record2 obsolete Oct 23. Remove.
          case "record2":
            this.Record( subsegmentArray, true );
            break;
          case "record":
            this.Record( subsegmentArray );
            break;
          case "rerollnpcinit":
            this.RerollNpcInit();
            break;
                              // dead code, after I wrote it I decided I did not need it for that purpose (used quick instead). Keep it for now to see if it does come in handy. 
          case "replacethis": {  // We need to make a substitution in a following command.  ReplaceThis, string to replace, Where is the Source of the string to replace with, index number within source to replace with. 
            let source;
            if( subsegmentArray[ 2 ] === "AfterRoll" && "AfterRoll" in this.misc )    // source of replacement string
              source = this.misc[ "AfterRoll" ];
            else Earthdawn.errorLog( "ED.parse() Badly formed ReplaceThis command: " + cmdSegment, this );
            if( source ) {
              let tmp = source.split(":");
              if( tmp && tmp.length > subsegmentArray[ 3 ]) {
                let t = Earthdawn.safeString( tmp[ Earthdawn.parseInt2( subsegmentArray[ 3 ])]).trim();
                for( let ind = this.indexMsg + 1; ind < this.edClass.msgArray.length; ++ind )
                  this.edClass.msgArray[ ind ] = this.edClass.msgArray[ ind ].replace( subsegmentArray[ 1 ], t );
              } else Earthdawn.errorLog( "ED.parse() Could not perform ReplaceThis command: " + cmdSegment, this );
            }
          } break;
          case "afterroll":     // We have some special processing to be done after the roll. Save the command.
            this.misc[ "AfterRoll" ] = cmdSegment;
            break;
          case "roll":
            this.ForEachHit( subsegmentArray );
            break;
          case "rolltype":
            this.misc[ "RollType" ] = subsegmentArray[ 1 ];
            break;
          case "set":   // Set: ConditionJumpup: "1"    // Don't do anything fancy, just set attribute to argument.   except weirdness (? can't be in a button).
            this.setWW( subsegmentArray[ 1 ], subsegmentArray[ 2 ].replace( "weirdness", "?"));
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
            this.Spell( subsegmentArray );
            break;
          case "statustotoken":
            this.SetStatusToToken();
            break;
          case "step":            // Note also that THIS routine (unlike other routines such as ssaMods()) allows use off asynchronous process to interpret a calculated value.
          case "attribute":       // Note that ssa holds ether a numerical number, or an attribute that needs to be looked up (hopefully giving a numerical step number).
          case "value":
            switch ( Earthdawn.safeString( subsegmentArray[ 1 ] ).toLowerCase() ) {
            case "dex":                     this.Karma( "Dex-Karma" );    this.misc[ "reason" ] = "Dexterity Action Test";  this.misc[ "ModType" ] = "@{Adjust-All-Tests-Total}";   this.misc[ "rollWhoSee" ] = "RollType-Dex";   this.misc[ "headcolor" ] = "action";  break;
            case "str":                     this.Karma( "Str-Karma" );    this.misc[ "reason" ] = "Strength Action Test";   this.misc[ "ModType" ] = "@{Adjust-All-Tests-Total}";   this.misc[ "rollWhoSee" ] = "RollType-Str";   this.misc[ "headcolor" ] = "action";  break;
            case "tou":                     this.Karma( "Tou-Karma" );    this.misc[ "reason" ] = "Toughness Action Test";  this.misc[ "ModType" ] = "@{Adjust-All-Tests-Total}";   this.misc[ "rollWhoSee" ] = "RollType-Tou";   this.misc[ "headcolor" ] = "action";  break;
            case "per":                     this.Karma( "Per-Karma" );    this.misc[ "reason" ] = "Perception Action Test"; this.misc[ "ModType" ] = "@{Adjust-All-Tests-Total}";   this.misc[ "rollWhoSee" ] = "RollType-Per";   this.misc[ "headcolor" ] = "action";  break;
            case "wil":                     this.Karma( "Wil-Karma" );    this.misc[ "reason" ] = "Willpower Action Test";  this.misc[ "ModType" ] = "@{Adjust-All-Tests-Total}";   this.misc[ "rollWhoSee" ] = "RollType-Wil";   this.misc[ "headcolor" ] = "action";  break;
            case "cha":                     this.Karma( "Cha-Karma" );    this.misc[ "reason" ] = "Charisma Action Test";   this.misc[ "ModType" ] = "@{Adjust-All-Tests-Total}";   this.misc[ "rollWhoSee" ] = "RollType-Cha";   this.misc[ "headcolor" ] = "action";  break;
            case "dex-effect":              this.Karma( "Dex-Karma" );    this.misc[ "reason" ] = "Dexterity Effect Test";  this.misc[ "rollWhoSee" ] = "RollType-Dex";   this.misc[ "headcolor" ] = "effect";  break;
            case "str-effect":              this.Karma( "Str-Karma" );    this.misc[ "reason" ] = "Strength Effect Test";   this.misc[ "rollWhoSee" ] = "RollType-Str";   this.misc[ "headcolor" ] = "effect";  break;
            case "tou-effect":              this.Karma( "Tou-Karma" );    this.misc[ "reason" ] = "Toughness Effect Test";  this.misc[ "rollWhoSee" ] = "RollType-Tou";   this.misc[ "headcolor" ] = "effect";  break;
            case "per-effect":              this.Karma( "Per-Karma" );    this.misc[ "reason" ] = "Perception Effect Test"; this.misc[ "rollWhoSee" ] = "RollType-Per";   this.misc[ "headcolor" ] = "effect";  break;
            case "wil-effect":              this.Karma( "Wil-Karma" );    this.misc[ "reason" ] = "Willpower Effect Test";  this.misc[ "rollWhoSee" ] = "RollType-Wil";   this.misc[ "headcolor" ] = "effect";  break;
            case "cha-effect":              this.Karma( "Cha-Karma" );    this.misc[ "reason" ] = "Charisma Effect Test";   this.misc[ "rollWhoSee" ] = "RollType-Cha";   this.misc[ "headcolor" ] = "effect";  break;
            case "str-step":                this.Karma( "Str-Karma" );    this.misc[ "reason" ] = "Knockdown Test";         this.misc[ "headcolor" ] = "knockdown";       this.misc[ "Special" ] = "Knockdown"; break;
            case "knockdown":               this.Karma( "Str-Karma" );    this.misc[ "reason" ] = "Knockdown Test";         this.misc[ "headcolor" ] = "knockdown";       this.misc[ "Special" ] = "Knockdown"; break;
            case "initiative":              this.Karma( "Initiative-Karma" ); this.misc[ "reason" ] = "Initiative";         this.misc[ "headcolor" ] = "init";    break;
            case "ls-speak-rank":           this.Lookup( 1, [ "", "Per" ]);           this.misc[ "reason" ] = "Speak Language Test";  this.misc[ "headcolor" ] = "action";  if (state.Earthdawn.g1879) this.Damage( ["Strain", "NA", 1 ] );     break;  // 1879 and ED Talents have strain. ED Skill does not. This line is not for ED Talents.
            case "ls-readwrite-rank":       this.Lookup( 1, [ "", "Per" ]);           this.misc[ "reason" ] = "R/W Language Test";  this.misc[ "headcolor" ] = "action";  break;    // Skill does not have strain. In ED, Talent Does.
            case "recovery-step": {
              this.Karma( "Recovery-Karma", -1 );
              if( subsegmentArray.indexOf( "Wil" ) > 0 ) {
                this.bFlags |= Earthdawn.flags.Recovery | Earthdawn.flags.RecoveryStun;
                this.misc[ "reason" ] = "Stun Recovery Test";
              } else {
                this.bFlags |= Earthdawn.flags.Recovery;
                this.misc[ "reason" ] = "Recovery Test";
              }
              this.misc[ "headcolor" ] = "recovery";
              if (Earthdawn.getAttrBN( this.charID, "NPC", "1") != Earthdawn.charType.mook ) {
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
            this.chat( subsegmentArray[ 3 ] + " extra successes to go to next damage upon " + this.getTokenName( subsegmentArray[ 2 ] ), Earthdawn.whoTo.player | Earthdawn.whoTo.gm);
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
              for( let i = 1; i < subsegmentArray.length; i++ )
                this.TokenSet( "add", "TargetList", subsegmentArray[ i ]);
            } else
              this.forEachTarget( subsegmentArray );
            break;
          case "targetmod":
          case "modtarget":
          case "targetvalue":
            falloutParse = this.Lookup( 3, subsegmentArray );       // 1 = this.targetNum
            break;
    // Toggle option is obsolete and can be removed.
          case "toggle":      // toggle the token action for karma or willforce on or off.
            this.MarkerSet( [ "toggle", subsegmentArray[ 1 ], "t"] );
            break;
          case "token":                       // When called from a token action, "!edToken~ " is inserted ahead of another valid !Earthdawn~ command.
          case "!edtoken":
          case "edtoken":
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
      } catch( err ) { Earthdawn.errorLog( "ED.Parse() error caught: " + err, this ); }
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
    edParse.doNow();
  }; // End ED.ParseCmd();



//
// NOTE: Everything between this point and the similar note above is used with the PARSE command and interacts with the character sheet.
//
// So if you are just using the stepdice and initiative rollers, and are not using my Earthdawn character sheets, you can cut everything between this point and the note above.
//



            // NOTE: This is the continuation of the main CREATE thread for this object. It makes use of functions declared above
  if( origMsg !== undefined ) {
    origMsg.content = origMsg.content.replace( new RegExp( Earthdawn.constant( "ColonAlt" ), "g"), ":");      // Buttons don't like colons, so any colon has been changed to this weird character. Change them back.
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
//   log("ready");
//
//   on("change:attribute", function (attr,prev) {
//     'use strict';
//   let sa = attr.get( "name" );
//   log("Value has change " + sa);
//
//   if(sa==="testAPIbug" && (attr.get("current") !== attr.get("max"))){
//     log("Pinged by the value " + attr.get("current"));
//     attr.setWithWorker(  "max", attr.get("current"));
//     log("Ponged wth the value " + attr.get("max"));
// }
// }); // end  on("change:attribute"


  on("add:character", function( obj ) {     // Brand new character. Make sure that certain important attributes fully exist.
    'use strict';
    let ED = new Earthdawn.EDclass();
    ED.newCharacter( obj.get( "_id" ) );
  });


  on("add:graphic", function( obj ) {       // New Graphic. Set it's statusmarkers to character sheet conditions and options.
    'use strict';
    Earthdawn.tokenRefresh( obj );
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
//          log( "Earthdawn on destroy attribute() character does not exist: probably character deletion: " + nm );
          return false;
        }
        let aobj = findObjs({ _type: 'attribute', _characterid: attr.get( "_characterid" ), name: "edition" });
        if( aobj === undefined || aobj.length == 0 ) {
          log( Earthdawn.timeStamp() + "Earthdawn on destroy attribute() edition attribute not found, probably character deletion: + nm");
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
          } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn on destroy attribute() Links error caught: " + err ); }
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
          } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn on destroy attribute() spell Matrix error caught: " + err ); }
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
          } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn on destroy attribute() token action error caught: " + err ); }
        }, 2000 );    // end delay 10 seconds.
      }
    } catch(err) { log( Earthdawn.timeStamp() + "Earthdawn on destroy attribute() error caught: " + err ); }
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
    } catch(err) { log( Earthdawn.timeStamp() + "on Change Damage() error caught: " + err ); }
  }; // end  onChangeDamage();


  on("change:graphic:bar3_value", function (attr, prev) {
    onChangeDamage( "value", attr, prev );
  });


  on("change:graphic:bar3_max", function (attr, prev) {
    onChangeDamage( "max", attr, prev );
  });


/* functionality moved to sheetworker. 
  on("change:character:name", function (attr, prev) {
    let nm = attr.get("name")
    if( nm )
      Earthdawn.setWW( "character_name", nm, attr.get( "_id" ));
  }); // end on change character name
*/


      // The GM has moved the players to a new map.
  on("change:campaign:playerpageid", function (attr, prev) {
    'use strict';
    try {
//log( "on change campaign playerpageid"); log(attr); log(prev);
      let newpage = attr.get("playerpageid");
//let pobj = getObj( "page", newpage);
//log( "page " + pobj.get( "name" ));
      let tkns = findObjs({ _pageid: newpage, _type: "graphic",  _subtype: "token" });    // All tokens on the new page. 
      _.each( tkns, function (TokObj) {
        Earthdawn.tokenRefresh( TokObj );
      }) // End ForEach Token
    } catch(err) { Earthdawn.errorLog( "ED.on change campaign playerpageid() error caught: " + err, po ); }
  }); // end on change campaign playerpageid



      // The GM has moved a specific player to a new map. 
      // If a player was not on a specific page, or is now on a different page, process that page for that player. 
      // If a player was on a specific page, and now is not, process the all  players page for that player. 
  on("change:campaign:playerspecificpages", function (attr, prev) {
    'use strict';
    try {
//log( "on change campaign playerspecificpages"); log(attr); log(prev);
      function refreshpage( page ) {
      'use strict';
//log( "refreshing page " + page);
        let tkns = findObjs({ _pageid: page, _type: "graphic",  _subtype: "token" });    // All tokens on the new page. 
        _.each( tkns, function (TokObj) {
          Earthdawn.tokenRefresh( TokObj );
        }) // End ForEach Token
      }

      let added,
          unique = [ attr.get( "playerpageid" )];   // any player removed from the specific pages list went back to the all players page, so refresh that. 
      if( !prev[ "playerspecificpages" ] )      // if prev is empty, then everything in attr just got added. 
        added = attr.get( "playerspecificpages" );
      else 
        added = _.difference( attr.get( "playerspecificpages" ), prev[ "playerspecificpages" ] );     // current minus old. 
      for( let key in added )
        if( unique.indexOf( added[ key ] ) == -1 )
          unique.push( added[ key ] );
      for( let i = 0; i < unique.length; ++i ) {
        refreshpage( unique[ i ] );   // refresh all the tokens on any page a player just got sent to. 
      }
    } catch(err) { Earthdawn.errorLog( "ED.on change campaign playerspecificpages() error caught: " + err, po ); }
  }); // end on change campaign playerspecificpages


/*
  on("change:graphic:represents", function( attr, prev ) {
    'use strict';
    try {
log( "change graphic represents"); log( prev); log(attr);
    } catch(err) { log( Earthdawn.timeStamp() + "on change statusmarkers() error caught: " + err ); }
  }); // end on change statusmarkers
// click use selected token and on change character gets a default token.
  on("change:character:_defaulttoken", function( attr, prev ) {
    'use strict';
    try {
log( "change character"); log( prev); log(attr);
      attr.get("_defaulttoken", function( dt ) {
          log(dt);
        let TokObj = getObj("graphic", dt);
        if( TokObj ) { log(TokObj); log( TokObj.get( "represents" ));
        }
      });
    } catch(err) { log( Earthdawn.timeStamp() + "on change statusmarkers() error caught: " + err ); }
  }); // end on change statusmarkers
*/


        // a tokens statusmarkers have changed.
        // If it is not a mook, see if it is a status marker that has meaning to this sheet, and set the appropriate condition.
  on("change:graphic:statusmarkers", function( attr, prev ) {
    'use strict';
    try {
      let rep = attr.get( "represents" );
      if( rep && rep != "" ) {
//log("at change marker");
        let npc = Earthdawn.getAttrBN( rep, "NPC", "1" );
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
    } catch(err) { log( Earthdawn.timeStamp() + "on change statusmarkers() error caught: " + err ); }
  }); // end on change statusmarkers


    let ED = new Earthdawn.EDclass();
    ED.Ready();
}); // End on("ready")



on("chat:message", function(msg) {
  'use strict';
//log(msg);
  if(msg.type === "api" ) {
//log(msg);
                // Earthdawn or Token - Earthdawn Message to be sent to the parser to handle. Could be any of several commands.
    if ( msg.content.startsWith( "!Earthdawn" ) || msg.content.startsWith( "!edToken" ) || msg.content.startsWith( "!edCustom" )) {
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
//
/*
*/