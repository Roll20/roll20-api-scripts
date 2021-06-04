 //
// Earthdawn Step Dice Roller
// Plus Earthdawn 4th edition character sheet helper class, which also serves as helper for the 1879 (FASA Official) character sheet. 
//
// By Chris Dickey 
// Version: See line two of code below.
// Last updated: 2019 April
//
// Earthdawn (FASA Official) Character sheet and associated API Copyright 2015-2019 by Christopher D. Dickey. 
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
// This module also contains a great deal of code that works with the Earthdawn and 1879 character sheets authored by me.
// This is all within the ParseObj class. If that class is removed, the stepdice roller will still work, but not the character sheet buttons.
//
// All commands that invoke this section of the code start with         !Earthdawn~
// See the comments in the ParseObj.Parse() routine and the individual routines for additional information on each of them.
//


//
// Define a Name-space
var Earthdawn = Earthdawn || {};
            // define any name-space constants
Earthdawn.Version = "1.000";

Earthdawn.whoFrom = {
	player:    0x08,
	character: 0x10,
    api:       0x20,
    apierror:  0x40,
	noArchive: 0x80,
    mask:      0xF8};    // This can be &'ed to get only the whoFrom part.
Earthdawn.whoTo = {     // Note: whoTo: 0 is broadcast to everybody.    WhoTo 3 is both player and GM.
	public:    0x00,
    player:    0x01,
    gm:        0x02,
    mask:      0x03};     // This can be &'ed to get only the whoTo part

Earthdawn.flagsArmor = {	// Note: This describes the contents of the edParse bFlags 
    na:				0x0001,
    PA:				0x0002,
    MA:				0x0004,
    None:			0x0008,
	Unknown:		0x0010,
	Natural:	0x01000000,
    Mask:		0x0100001F};	// This can be &'ed to get only the flagsArmor part.
Earthdawn.flagsTarget = {	// Note: This describes the contents of the edParse bFlags 
    PD:				0x0020,
    MD:				0x0040,
    SD:				0x0080,
    Highest:		0x0100,		// Modifies above, such as Highest MD of all targets. 
    P1pt:			0x0200,		// Plus one per target.
	Riposte:		0x0400,
    Ask:			0x0800,
    Set:			0x1000,		// Set means attach the targetList to the token. 
	Natural:	0x02000000,
    Mask:		0x02001FE0};	// This can be &'ed to get only the flagsTarget part.
Earthdawn.flags = {   		// Note: This describes the contents of the edParse bFlags 
    HitsFound:		0x2000,		// At least one of the selected tokens has recorded a hit that has not been cleared.
	HitsNot:    	0x4000,
	WillEffect: 	0x8000,		// This roll is for a will effect.
	NoOppMnvr:	  0x010000,		// This to-hit does not do extra damage on successes.
	VerboseRoll:  0x020000,		// Don't keep this roll information as secret as most rolls.
	Recovery:  	  0x040000 };	// This is a recovery test. Add result to health.
Earthdawn.flagsCreature = { 	// Note, if you ever change this, it also needs changing in sheetworkers updateCreatureFlags().
    Fury:					0x0001,
	ResistPain:				0x0002,
	HardenedArmor: 			0x0004,
	GrabAndBite:    		0x0100,
	Hamstring:      		0x0200,
	Overrun:				0x0400,
	Pounce:					0x0800,
	SqueezeTheLife: 		0x1000,
	CreatureCustom1:		0x2000,
	CreatureCustom2:		0x4000,
	CreatureCustom3:		0x8000,
	CreatureMask:    		0xffff,
	ClipTheWing:		0x00100000,
	CrackTheShell:		0x00200000,
	Defang:				0x00400000,
	Enrage:				0x00800000,
	Provoke:			0x01000000,
	PryLoose:			0x02000000,
	OpponentCustom1:	0x04000000,
	OpponentCustom2:	0x08000000,
	OpponentCustom3:	0x10000000,
	OpponentMask:		0x1ff00000 };
Earthdawn.style = {
	Full:				0,		// Give all information about the roll and target number. IE: Target number 12, Result 18, succeeded by 6 with 1 extra success.
	VagueSuccess:		1,		// Give full result of roll, but don't give detail upon target number or exactly how close to success roll was. IE: Result: 18. 1 extra success. 
	VagueRoll:			2 };	// Default. Don't give detail on the roll or the target number, just say how much succeeded or failed by. IE: Succeeded by 6 with 1 extra success.
Earthdawn.Constants = {
	CommaReplace:		"Ñ",		// Character	Ñ	Character name	LATIN CAPITAL LETTER N WITH Tildi		Hex code point	00D1		Decimal code point	219			Hex UTF-8 bytes	C3 91
	ColonReplace:		"Ò",		// Buttons don't like colons, so anytime we want one in a button, replace it for a while with this.   Character	Ò	Character name	LATIN CAPITAL LETTER O WITH GRAVE		Hex code point	00D2		Decimal code point	210			Hex UTF-8 bytes	C3 92
	SymbolTalent: 		"ı",		// small i dotless:	&# 305;
	SymbolKnack: 		"ķ",		// K with cedilla: 	&# 311;
	SymbolSkill: 		"ş",		// S with cedilla: 	&# 351;
	SymbolWeapon:		"⚔",		// Crossed swords: 	&# 9876;
	SymbolSpell:		"⚡​" };		// Lightning Bolt or High Voltage: &# 9889;



	

				//	These are namespace utility functions.

                    // If a named ability does not exist for this character, create it.
	Earthdawn.abilityAdd = function ( cID, Ability, ActionStr )  {
        'use strict';

        try {
            let aobj = findObjs({ _type: "ability", _characterid: cID, name: Ability })[0];
            if ( aobj === undefined )
                createObj("ability", { characterid: cID, name: Ability, action: ActionStr, istokenaction: true });
        } catch(err) {
            log( "Earthdawn:abilityAdd() error caught: " + err );
        }   // end catch
    } // End addAbiltiy


					// If a named ability exists for this character, remove it.
	Earthdawn.abilityRemove = function ( cID, Ability )  {
        'use strict';

        try {
            let aobj = findObjs({ _type: "ability", _characterid: cID, name: Ability })[0];
            if ( aobj !== undefined )
                aobj.remove();
        } catch(err) {
            log( "Earthdawn:abilityRemove() error caught: " + err );
        }   // end catch
    } // End removeAbiltiy

	
				// Chat buttons don't like colons.   Change them to something else. They will be changed back later. 
	Earthdawn.colonFix = function ( txt ) {
		'use strict';
		return txt.replace( /:/g, Earthdawn.Constants.ColonReplace);
    }; // end colonFix()

				// Chat buttons don't like colons.   Change them to something else. They will be changed back later. 
	Earthdawn.colon = function () {
		'use strict';
		return Earthdawn.Constants.ColonReplace;
    }; // end colon()
	Earthdawn.parenOpen = function () {
		'use strict';
		return '&'+'#40'+';';
    };
	Earthdawn.parenClose = function () {
		'use strict';
		return '&'+'#41'+';';
    };
	Earthdawn.at = function () {
		'use strict';
		return '&'+'#64'+';';
    };
	Earthdawn.pipe = function () {
		'use strict';
		return '&'+'#124'+';';
    };
	Earthdawn.percent = function () {
		'use strict';
		return '&'+'#37'+';';
    };
	Earthdawn.braceOpen = function () {
		'use strict';
		return '&'+'#123'+';';
    };
	Earthdawn.braceClose = function () {
		'use strict';
		return '&'+'#125'+';';
    };
    Earthdawn.encode = (function(){
		'use strict';
	
		let esRE = function (s) {
			var escapeForRegexp = /(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g;
			return s.replace(escapeForRegexp,"\\$1");
		}
		let entities={
              //' ' : '&'+'nbsp'+';',
              '/n'  : '<'+'br//'+'>',
              '<' : '&'+'lt'+';',
              '>' : '&'+'gt'+';',
              "'" : '&'+'#39'+';',
              '@' : '&'+'#64'+';',
              '{' : '&'+'#123'+';',
              '|' : '&'+'#124'+';',
              '}' : '&'+'#125'+';',
              '[' : '&'+'#91'+';',
              ']' : '&'+'#93'+';',
              '"' : '&'+'quot'+';'
        },
        re = new RegExp('('+_.map(_.keys(entities),esRE).join('|')+')','g');
		return function(s){
			return s.replace(re, function(c){ return entities[c] || c; });
		};
    }());


			// Code = SP, SPM, WPN, etc.
			// rowID may EATHER be a rowID, or it may be a whole repeating section attribute name, in which case this routine will extract just the rowID needed.
	Earthdawn.buildPre = function ( code, rowID ) {
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
			case "DSP": ret = "repeating_discipline_"	+ rowID + "_" + code + "_";	break;
			case "T": 	ret = "repeating_talents_" 		+ rowID + "_" + code + "_";	break;
			case "NAC":	ret = "repeating_knacks_"		+ rowID + "_" + code + "_";	break;
			case "SK":	ret = "repeating_skills_"		+ rowID + "_" + code + "_";	break;
			case "SKK":	ret = "repeating_skillk_"		+ rowID + "_" + code + "_";	break;
			case "SKAC":
			case "SKA":	ret = "repeating_skilla_"		+ rowID + "_" + code + "_";	break;
			case "SKL":	ret = "repeating_skilll_"		+ rowID + "_" + code + "_";	break;
			case "SPM":	ret = "repeating_matrix_"		+ rowID + "_" + code + "_";	break;
			case "SP": 	ret = "repeating_spell_"		+ rowID + "_" + code + "_";	break;
			case "WPN":	ret = "repeating_weapons_"		+ rowID + "_" + code + "_";	break;
			case "MNT":	ret = "repeating_mount_"		+ rowID + "_" + code + "_";	break;
			case "TI": 	ret = "repeating_threads_"		+ rowID + "_" + code + "_";	break;
			default: log( "Earthdawn:buildPre() error. Unknown code: " + code + "   RowID: " + rowID );
			}
			return ret;
        } catch(err) {
            log( "Earthdawn:buildPre() error caught: " + err );
		}
	};	// end buildPre

			// This routine returns just one section of a repeating section name. 
			// section: 0 = repeating. 1 = talents, knacks, weapons, etc. 2 = rowID, 3 = code (SP, WPN, etc.), 4 is the attribute name. 
			// Note that this assumes that the attribute name does NOT contain an underscore, but allows for the rowID to contain one. 
	Earthdawn.repeatSection = function ( section, str ) {
        'use strict';

		try {
			let x = str.split("_");
			if( section < 2 )
				return x[ section ];
			else if (section == 3 )
				return x[ x.length -2 ].toUpperCase();
			else if (section == 4 )
				return x[ x.length -1 ];
			else {			// There is a possibility that the RowID might contain an underscore. 
				x.pop();
				x.pop();
				x.shift();
				x.shift();
				return x.join("_");
			}
        } catch(err) {
            log( "Earthdawn:repeatSection() error caught: " + err );
		}
	};	// end repeatSection



    Earthdawn.findOrMakeObj = function ( attrs, deflt ) {
        'use strict';

        try {
			let obj = findObjs( attrs )[0];
			if( obj === undefined && "_type" in attrs ) {
				let type = attrs[ "_type" ];
				delete attrs[ "_type" ];
				obj = createObj( type, attrs);
				if( obj && deflt !== undefined )
					obj.setWithWorker( "current", deflt );
			}
			return obj;
        } catch(err) {
            log( "Earthdawn:findOrMakeObj() error caught: " + err );
        }   // end catch
    }; // end findOrMakeObj()



	// getAttrBN - get attribute by name. If does not exist, return the default value.
	// This is a replacement for the official system function getAttrByName() which I think still has bugs in it. 
    Earthdawn.getAttrBN = function ( cID, nm, dflt ) {
        'use strict';

        try {
			let attrib = findObjs({ _type: "attribute", _characterid: cID, name: nm });
			if( attrib.length > 0 )
				return attrib[ 0 ].get("current");
			else
				return dflt;
        } catch(err) {
            log( "Earthdawn:getAttrBN() error caught: " + err );
        }   // end catch
    }; // end getAttrBN()
/*
log( nm);
//			let attrib = findObjs({ _type: "attribute", _characterid: cID, name: nm });
			let attrib;
			if( nm.startsWith( "repeating_" ) ) {
attrib = findObjs({ _type: "attribute", _characterid: cID, name: nm });
//				let aobj = findObjs({ _type: "attribute", _characterid: cID });
//log( aobj.length);
//				attrib = aobj.filter ( function (fobj) { return fobj.get("name") === nm; });
			} else attrib = findObjs({ _type: "attribute", _characterid: cID, name: nm });
log( attrib);
log( attrib.length);
if( attrib.length > 0 )
  log( attrib[0].get("current"));
			if( attrib.length > 0 )
				return attrib[ 0 ].get("current");
			else
				return (dflt == undefined) ? "" : dflt;
*/


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
			let found, count = 0, j, i = -1;
			do {
				j = i + 1;
				i = str.indexOf( delim, i+1);
			} while ( (++count < num) && (i !== -1) );
			if( count === num) {
				if( i < 0)
					i = str.length;
				found = str.slice( j, i).trim();
			}
			return found;
        } catch(err) {
            log( "Earthdawn:getParam() error caught: " + err );
        }   // end catch
    }; // end getParam()



					// This routine generates a (hopefully) unique rowID you can use to add a row to a repeating section.
// CDD Very important note.  generate UUID might need to be declared outside of this and global. I don't know.

	Earthdawn.generateRowID = function () {
		"use strict";

		var EarthdawnGenerateUUID = (function() {
			"use strict";

			var a = 0, b = [];
			return function() {
				var c = (new Date()).getTime() + 0, d = c === a;
				a = c;
				for (var e = new Array(8), f = 7; 0 <= f; f--) {
					e[f] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c % 64);
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

		return EarthdawnGenerateUUID().replace(/_/g, "Z");
	};



                    // Look to see if an attribute exists for a certain character sheet. If not - create it with a default attribute.
	Earthdawn.SetDefaultAttribute = function( cID, attr, dflt, maxdflt )  {
		'use strict';

		let aobj = findObjs({ _type: 'attribute', _characterid: cID, name: attr })[0];
		if ( aobj === undefined ) {
			aobj = createObj("attribute", { name: attr, characterid: cID });
			if ( dflt !== undefined && isNaN( parseInt(aobj.get("current"))) )
				aobj.setWithWorker( "current", dflt );
			if ( maxdflt !== undefined && isNaN( parseInt(aobj.get("max"))) )
				aobj.setWithWorker( "max", maxdflt );
		}
	} // end of SetDefaultAttribute()



    Earthdawn.tokToChar = function ( tokenID ) {
        'use strict';

        try {
			if ( tokenID ) {
				let TokObj = getObj("graphic", tokenID); 
				if( TokObj !== undefined ) {
					let targetChar = TokObj.get("represents");
					if( targetChar )
						return targetChar;
			}	}
        } catch(err) {
            log( "Earthdawn:tokToChar() error caught: " + err );
        }   // end catch
    }; // end tokToChar()





            // Define the Earthdawn Class   EDclass
Earthdawn.EDclass = function( origMsg ) {
  'use strict';

            // define any class vvariables
    this.msg = origMsg;
    this.msgArray = [];           // msg parsed by tilde ~ characters.  msgArray[0] will hold !Earthdawn which we have already tested for and can ignore.
    this.countSuccess = 0;        // If there is a target number, this is a count of how many attacks, or attacks on separate targets had at least one success.
    this.countFail = 0;
    this.rollCount = 0;           // This is a count of how many async rolls are still outstanding. 
    // Note: This thread CONTINUES to execute at the bottom of object declaration - after all functions are defined. 




            // Log the ready event.
    this.Ready = function () {
        'use strict';
                    // Check if the namespaced property exists, creating it if it doesn't
        if( ! state.Earthdawn ) {
            state.Earthdawn = {
					game:			"ED",
					gED:			true,
					g1879:			false,
                    edition:        4,
					effectIsAction: false,
                    logCommandline: false,
                    logStartup:     true,
                    style:          Earthdawn.style.VagueRoll,
                    version:        Earthdawn.Version
            };
        }

//log( state);
                    // Check to see if the current version of code is the same number as the previous version of code.
					// This will update all character sheets when a new API is loaded. 
					// If a new character sheet is loaded without a new API version, each will be updated individually when the sheet is first opened.
        if( state.Earthdawn.version != Earthdawn.Version ) {        // This code will be run ONCE when a new version is loaded.
            if( state.Earthdawn.version < "0.301") {
				let count = 0;
				this.EDchat( "Updating all characters to new character sheet version 0.301" );
				var ed = this;
				var chars = findObjs({ _type: "character" });
				_.each( chars, function (charObj) {
					var cid = charObj.get( "_id" );
					log( "Updating " + charObj.get( "name" ));
					ed.updateVersion0p301( cid );
					++count;
				}) // End ForEach character
				this.EDchat( count + " character sheets updated." );
            }
            if( state.Earthdawn.version < "0.303") {
				let count = 0;
				this.EDchat( "Updating all characters to new character sheet version 0.303" );
				var ed = this;
				var chars = findObjs({ _type: "character" });
				_.each( chars, function (charObj) {
					var cid = charObj.get( "_id" );
					log( "Updating " + charObj.get( "name" ));
					ed.updateVersion0p303( cid );
					++count;
				}) // End ForEach character
				this.EDchat( count + " character sheets updated." );
            }
            if( state.Earthdawn.version < "0.304") {
				let count = 0;
				this.EDchat( "Updating all characters to new character sheet version 0.304" );
				var ed = this;
				var chars = findObjs({ _type: "character" });
				_.each( chars, function (charObj) {
					let cid = charObj.get( "_id" );
					let attCount = ed.updateVersion0p304( cid );
					log( "Updated " + attCount + " attributes for " + charObj.get( "name" ));
					++count;
				}) // End ForEach character
				this.EDchat( count + " character sheets updated." );
            }
            if( state.Earthdawn.version < "00.305") {
				let count = 0;
				this.EDchat( "Updating all characters to new character sheet version 00.305" );
				var ed = this;
				var chars = findObjs({ _type: "character" });
				_.each( chars, function (charObj) {
					let cid = charObj.get( "_id" );
					let attCount = ed.updateVersion00p305( cid );
					log( "Updated " + attCount + " attributes for " + charObj.get( "name" ));
					++count;
				}) // End ForEach character
				this.EDchat( count + " character sheets updated." );
            }

            state.Earthdawn.version = Earthdawn.Version;    
        }

        var style;
        switch (state.Earthdawn.style) {
        case Earthdawn.style.VagueSuccess: 	style = " - Vague Successes."; 	break;
        case Earthdawn.style.VagueRoll: 	style = " - Vague Roll.";   	break;
        case Earthdawn.style.Full:
        default:  							style = " - Full."; 			break;
        }

        if( state.Earthdawn.logStartup ) {
            log( "---Earthdawn.js Version: " + Earthdawn.Version + " loaded.   For " + state.Earthdawn.game 
					+ " Edition: " + state.Earthdawn.edition + " ---");
			log( "---  Roll Style: " + state.Earthdawn.style + style 
					+ "   Options: Effect tests " + (state.Earthdawn.effectIsAction ? "are" : "are NOT") + " Action tests. ---" );
			log( "---  CursedLuckSilent is " + ((state.Earthdawn.CursedLuckSilent && state.Earthdawn.CursedLuckSilent & 0x04 ) ? "Silent" : "not Silent")
					+ ".   NoPileonDice is " + state.Earthdawn.noPileonDice + ((state.Earthdawn.CursedLuckSilent && state.Earthdawn.CursedLuckSilent & 0x02 ) ? " Silent" : " not Silent")
					+ ".   NoPileonStep is " + state.Earthdawn.noPileonStep + ((state.Earthdawn.CursedLuckSilent && state.Earthdawn.CursedLuckSilent & 0x01 ) ? " Silent" : " not Silent")
					+ ". ---");
		}

        setTimeout(function() {		// Put anything that you want to happen 5 seconds after startup here. 
			try {
				StatusTracker.RegisterCallback( "AnnounceTurn", callbackStAnnounceTurn );
				StatusTracker.RegisterCallback( "TokenType", callbackStTokenType );
			} catch(err) {
				log( "Warning! Earthdawn.js  -> StatusTracker integration failed!  Error: " + err );
				log( "   The sheet will still work, but without StatusTraicker integration!" );
			}
			try {
				if( WelcomePackage ) 
					if( WelcomePackage.onAddCharacter )
						WelcomePackage.onAddCharacter( callbackWelcomePackage );
					else if( WelcomePackage.OnAddCharacter )
						WelcomePackage.OnAddCharacter( callbackWelcomePackage );
			} catch(err) {
				log( "Warning! Earthdawn.js  -> WelcomePackage integration failed!  Error: " + err );
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



    this.EDchat = function ( newMsg, iFlags, customFrom ) {
        'use strict';

//log( newMsg);
        iFlags = iFlags || 0;
        if ( iFlags & Earthdawn.whoFrom.apierror ) {
            log( newMsg );
            iFlags |= Earthdawn.whoFrom.api | Earthdawn.whoTo.player;
        }
        var wf;
		if( customFrom )
			wf = customFrom;
		else if ( !this.msg || (iFlags & Earthdawn.whoFrom.api) || (this.msg.playerid === "API"))
			wf = "API";
		else 
			wf = "player|" + this.msg.playerid ;

        if( !( iFlags & Earthdawn.whoTo.mask))         // If no whoTo specified, send to all.
            sendChat( wf, newMsg, null, (iFlags & Earthdawn.whoFrom.noArchive) ? {noarchive:true} : null );
        else {
            if( iFlags & Earthdawn.whoTo.gm )
                sendChat( wf, "/w gm " + newMsg, null, (iFlags & Earthdawn.whoFrom.noArchive) ? {noarchive:true} : null );
            if(( iFlags & Earthdawn.whoTo.player) && !((iFlags & Earthdawn.whoTo.gm) && (playerIsGM( this.msg.playerid ) || this.msg.playerid === "API")))       // Send to player, unless the player is the gm and already sent to the gm.
                sendChat( wf, '/w "' + this.msg.who.replace(" (GM)","") +'" ' +  newMsg, null, (iFlags & Earthdawn.whoFrom.noArchive) ? {noarchive:true} : null ); 
        }
    }; // end EDchat()


				// This update gets rid of combat slots and moves weapons into a repeating section. A field named Combat_Slots gets renamed to CombatSlots.
	this.updateVersion0p301 = function( cid ) {
        'use strict';
        try {
							// go through all attributes for this character and look for ones we are interested in
			var ability = findObjs({ _type: "ability", _characterid: cid });
			var col = {}, x;
			_.each( ability, function (att) {
				let nm = att.get("name");
				if ( nm.startsWith( Earthdawn.Constants.SymbolWeapon ) || nm.startsWith( Earthdawn.Constants.SymbolTalent ))
					att.remove();
            }); // End for each ability.

							// go through all attributes for this character and look for ones we are interested in
			var attributes = findObjs({ _type: "attribute", _characterid: cid });
			_.each( attributes, function (att) {
				let nm = att.get("name");
				if ( nm.endsWith( "_Combat_Slot" )) {
					att.set( "name", nm.slice( 0, -12) + "_CombatSlot" );
					if( att.get( "current" ) > 0 ) {
						att.set( "current", "1" );
						if( nm.startsWith( "repeating_tal" ) || nm.startsWith( "repeating_ski" ))
							Earthdawn.abilityAdd( cid, Earthdawn.Constants.SymbolTalent + Earthdawn.getAttrBN( cid, nm.slice( 0, -12) + "_Name", ""), 
										"!edToken~ %{selected|" + nm.slice( 0, -12) + "_Roll}" );
					}
				}
				if( nm.slice( 0,2 ) === "CB" && nm.slice( 3, 4) === "_" )
					att.remove();
				if( nm.slice( 0, 6) === "Weapon" && nm.slice( 7, 8) === "-" ) {
					let n = nm.slice( 6, 7);
					if( !(n in col)) {
						x = Earthdawn.generateRowID();
						col[ n ] = x;
					} 
					else
						x = col[ n ];
					let newNameShort = Earthdawn.buildPre( "WPN", x);
					let newName = newNameShort + nm.slice( 8 );
					let aobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: cid, name: newName }, att.get( "current"));
					att.remove();
					if( newName.slice( -5 ) === "_Name" )
						Earthdawn.abilityAdd( cid, Earthdawn.Constants.SymbolWeapon + att.get( "current"), "!edToken~ %{selected|" + newNameShort + "Roll}" );        
				}
            }); // End for each attribute.
        } catch(err) {
                log( "ED.updateVersion0p301() error caught: " + err );
        }   // end catch
    }; // end updateVersion0p301()



				// This update changes all _Attribute values.
	this.updateVersion0p303 = function( cid ) {
        'use strict';
        try {
							// go through all attributes for this character and look for ones we are interested in
			var attributes = findObjs({ _type: "attribute", _characterid: cid });
			_.each( attributes, function (att) {
				let nm = att.get("name");
				if ( nm.endsWith( "_Attribute" ) && nm.startsWith( "repeating_" )) {
					switch( att.get( "current" ) ) {
						case "(@{Dex-Step}+@{Dex-Mods})": 		att.set( "current", "(@{Dex-Step}+@{Dex-Adjust}+@{Dex-Mods})" );		break;
						case "(@{Str-Step}+@{Str-Mods})": 		att.set( "current", "(@{Str-Step}+@{Str-Adjust}+@{Str-Mods})" );		break;
						case "(@{Tou-Step}+@{Tou-Mods})": 		att.set( "current", "(@{Tou-Step}+@{Tou-Adjust}+@{Tou-Mods})" );		break;
						case "(@{Per-Step}+@{Per-Mods})": 		att.set( "current", "(@{Per-Step}+@{Per-Adjust}+@{Per-Mods})" );		break;
						case "(@{Wil-Step}+@{Wil-Mods})": 		att.set( "current", "(@{Wil-Step}+@{Wil-Adjust}+@{Wil-Mods})" );		break;
						case "(@{Cha-Step}+@{Cha-Mods})": 		att.set( "current", "(@{Cha-Step}+@{Cha-Adjust}+@{Cha-Mods})" );		break;
						default: 
							log( "updateVersion0p303: don't know what to do with...");
							log( att);
					}
				}
            }); // End for each attribute.
        } catch(err) {
                log( "ED.updateVersion0p303() error caught: " + err );
        }   // end catch
    }; // end updateVersion0p303()



				// This update changes some values.
	this.updateVersion0p304 = function( cid ) {
        'use strict';
        try {
							// go through all attributes for this character and look for ones we are interested in
			let attributes = findObjs({ _type: "attribute", _characterid: cid }),
				count = 0;
			_.each( attributes, function (att) {
				let nm = att.get("name");
				function ifEndsWith( from, to, name, obj ) {
					if ( from.endsWith( to )) {
						att.set( "name", nm.slice( 0, 0 - from.length) + to);
						++count;
					}
				}
				ifEndsWith( "_Effective_Rank", "_Effective-Rank" );
				ifEndsWith( "_Mod_Type", "_Mod-Type" );
				ifEndsWith( "_Result_Mods", "_Result-Mods" );
				ifEndsWith( "_Mod_Type_ArmorType", "_ModType-ArmorType" );
				ifEndsWith( "SP_WilEffect_Karma-Control", "SP-WilEffect-Karma-Control" );
				ifEndsWith( "SP_WilEffect_DP-Control", "SP-WilEffect-DP-Control" );
				ifEndsWith( "SP_Spellcasting_Karma-Control", "SP-Spellcasting-Karma-Control" );
				ifEndsWith( "SP_Spellcasting_DP-Control", "SP-Spellcasting-DP-Control" );
				ifEndsWith( "SP_Patterncraft_Karma-Control", "SP-Patterncraft-Karma-Control" );
				ifEndsWith( "SP_Patterncraft_DP-Control", "SP-Patterncraft-DP-Control" );
				ifEndsWith( "SP_Elementalism_Karma-Control", "SP-Elementalism-Karma-Control" );
				ifEndsWith( "SP_Elementalism_DP-Control", "SP-Elementalism-DP-Control" );
				ifEndsWith( "SP_Illusionism_Karma-Control", "SP-Illusionism-Karma-Control" );
				ifEndsWith( "SP_Illusionism_DP-Control", "SP-Illusionism-DP-Control" );
				ifEndsWith( "SP_Nethermancy_Karma-Control", "SP-Nethermancy-Karma-Control" );
				ifEndsWith( "SP_Nethermancy_DP-Control", "SP-Nethermancy-DP-Control" );
				ifEndsWith( "SP_Wizardry_Karma-Control", "SP-Wizardry-Karma-Control" );
				ifEndsWith( "SP_Wizardry_DP-Control", "SP-Wizardry-DPKarma-Control" );
				ifEndsWith( "SP_WillForce_Karma-Control", "SP-WillForce-Karma-Control" );
				ifEndsWith( "SP_WillForce_DP-Control", "SP-WillForce-DP-Control" );
				ifEndsWith( "_SPM_Cast_R", "_SPM_Cast-R" );
				if ( nm === "MA-Natural" )			att.set( "name", "MA-Base" );
				if ( nm === "PD-Blindsided" )		att.remove();
				if ( nm === "MD-Blindsided" )		att.remove();
            }); // End for each attribute.
			return count;
        } catch(err) {
                log( "ED.updateVersion0p304() error caught: " + err );
        }   // end catch
    }; // end updateVersion0p304()
	


				// This update changes some values.
	this.updateVersion00p305 = function( cID ) {
        'use strict';
        try {
							// go through all attributes for this character and look for ones we are interested in
			let attributes = findObjs({ _type: "attribute", _characterid: cID }),
				count = 0;
			_.each( attributes, function (att) {
				if( att.get("name").indexOf( "RollType" ) > -1 ) {
					switch (att.get( "current" ).trim().toLowerCase()) {
					case "default":		att.set( "current", "@{RollType}" );	break;
					case "edsdr":		att.set( "current", " " );				break;
					case "edsdrGM": 	att.set( "current", "pgm" );			break;
					case "edsdrHidden":	att.set( "current", "/w gm" );			break;
					}
					++count;
				}
            }); // End for each attribute.
			Earthdawn.SetDefaultAttribute( cID, "API", 1, 0 );
			return count;
        } catch(err) {
			log( "ED.updateVersion00p305() error caught: " + err );
        }   // end catch
	}; // end updateVersion00p305()



/*
Step/Action Dice Table
1 D4-2		11 D10+D8 		21 D20+2D8		31 2D20+D8+D6
2 D4-1		12 2D10 		22 D20+D10+D8	32 2D20+2D8
3 D4		13 D12+D10 		23 D20+2D10  	33 2D20+D10+D8
4 D6		14 2D12 		24 D20+D12+D1	34 2D20+2D100
5 D8		15 D12+2D6 		25 D20+2D12  	35 2D20+D12+D10
6 D10		16 D12+D8+D6 	26 D20+D12+2D	36 2D20+2D126
7 D12		17 D12+2D8 		27 D20+D12+D8	37 2D20+D12+2D6+D6
8 2D6		18 D12+D10+D8 	28 D20+D12+2D	38 2D20+D12+D8+D68
9 D8+D6		19 D20+2D6 		29 D20+D12+D1	39 2D20+D12+2D80+D8
10 2D8		20 D20+D8+D6 	30 2D20+2D6  	40 2D20+D12+D10+D8
*/
            // Takes an Earthdawn step number, and returns a string containing the dice to be rolled.
            // If step is less than 1, returns an empty string.
    this.StepToDice = function( stepNum )  {
        'use strict';
        var dice = "";

        if ( stepNum < 0 )
            stepNum = 0;
        if ( stepNum < 8 ) {         // The step numbers less than 8 don't follow the same pattern as the rest of the table and should just be set to the correct value.
            switch( stepNum ) {
                case 1:     dice = ((state.Earthdawn.gED && state.Earthdawn.edition == 3) ? "{{1d6!-3}+d1}kh1+" : "{{1d4!-2}+d1}kh1+" );     break;         // Roll a d4 minus something, but also roll a "d1" and keep only the highest one.
                case 2:     dice = ((state.Earthdawn.gED && state.Earthdawn.edition == 3) ? "{{1d6!-2}+d1}kh1+" : "{{1d4!-1}+d1}kh1+" );     break;
                case 3:     dice = ((state.Earthdawn.gED && tate.Earthdawn.edition == 3) ? "{{1d6!-1}+d1}kh1+" : "d4!+" );     break;
                case 4:     dice = "d6!+";      break;
                case 5:     dice = "d8!+";      break;
                case 6:     dice = "d10!+";     break;
                case 7:     dice = "d12!+";     break;
            }
        }  // end step 7 or less
        else if( state.Earthdawn.gED && state.Earthdawn.edition == 3 ) {        // Earthdawn 3rd edition.
            var baseNum = stepNum - 6;
            var twelves = 0;
            if( stepNum > 12 ) {        // Calculate the number of d12's we need to roll.
                twelves = Math.floor( baseNum / 7);
            }
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
            if( stepNum > 18 ) {        // Calculate the number of d20's we need to roll.
                dice = Math.floor( baseNum / 11).toString() + "d20!+";
            }
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
    };  //   End Earthdawn.EDclass.StepToDice()




            // If a message includes any inline rolls, go through the message and replace the in-line roll markers with the roll results.
    this.ReconstituteInlineRolls = function( origMsg ) {
        'use strict';
        
        var msg = origMsg;
        if(_.has(msg,"inlinerolls")) {
            msg.content = _.chain(msg.inlinerolls)
                .reduce(function(m,v,k){
                    m['$[['+k+']]']=v.results.total || 0;
                    return m;
                },{})
                .reduce(function(m,v,k){
                    return m.replace(k,v);
                },msg.content)
				.value();
		}
        return msg;
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

// log(msg);
        var edc = this;
        var MsgType;
        var newMsg;
        var rollMsg;

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
        var step = parseInt( this.msgArray[1] );
        if( step < 1 )
        {
            this.EDchat( "Warning!!! Step Number " + step );
            step = 0;
            rollMsg += "d0";
        } else
            rollMsg += this.StepToDice( step );

        if (this.msgArray.length > 2) {
            var karmaControl = Earthdawn.getParam( this.msgArray[2], 2, ":");
            var karmaDice;
            if( karmaControl === "-1" )
                karmaDice = 0;
            else if( parseInt( karmaControl ) > 0 )
                karmaDice = this.StepToDice( parseInt( karmaControl ) * 4 );
            else 
                karmaDice = this.StepToDice( parseInt( Earthdawn.getParam( this.msgArray[2], 1, ":" )));          // karma or bonus step number
            if( karmaDice != "" ) {
                newMsg = newMsg + " plus " + karmaDice.replace( /!|\+/g, "");
                rollMsg = rollMsg + "+" + karmaDice;
            }
            if (this.msgArray.length > 3) {
                newMsg = newMsg + " " + this.msgArray[ 3 ] + ".";              // This is the "reason" or flavor text
            }     // End 3rd elements.
        }     // End msgArray has at least two elements.
 
        this.EDchat( newMsg, MsgType );
        if ((MsgType != (Earthdawn.whoTo.gm | Earthdawn.whoTo.player)) && (this.msgArray.length < 5 || parseInt( this.msgArray[ 4 ] ) < 1)) {
            this.EDchat( rollMsg, 0); 
        } else {       // We have a target number, so have the results of the roll sent to a callback function to be processed.
            sendChat("player|" + this.msg.playerid, rollMsg, function( ops )  {  // This is a callback function that sendChat will callback as soon as it finishes rolling the dice.
                'use strict';

                     // NOTE THAT THIS IS THE START OF A CALLBACK FUNCTION

//    log(ops[0]);
                                // Standard. Tell what rolled, vague about how much missed by.
                                // Full: Tell exact roll result and how much made or missed by. 
                                // Vague. Done tell roll result, but tell how much made or missed by. 
                var RollResult = JSON.parse(ops[0].content);
                var EchoMsg =  "Rolling " + ops[0].origRoll.replace( /!/g, "") + ":";
                if ( state.Earthdawn.style != Earthdawn.style.VagueRoll)
                    EchoMsg += "  Rolled a " + RollResult.total + ".";

                if (edc.msgArray.length > 4 && parseInt( edc.msgArray[ 4 ] ) > 0) {
                    var result = RollResult.total - parseInt( edc.msgArray[4] );
                    if( result < 0 ) {
                        EchoMsg += "   FAILURE" + (( state.Earthdawn.style != Earthdawn.style.VagueSuccess ) ? " by " + Math.abs(result) + "!" : "!" );
                    } else if ( result < 5 ) {
                        EchoMsg += "   SUCCESS" + (( state.Earthdawn.style != Earthdawn.style.VagueSuccess ) ? " by " + Math.abs(result) + "." : "." );
                    } else
                        EchoMsg += "   SUCCESS" + (( state.Earthdawn.style != Earthdawn.style.VagueSuccess ) ? " by " + Math.abs(result) : "" ) + " (" + ( Math.floor(result / 5) ).toString() + " extra success" + ((result < 10) ? "!)" : "es!)");
                } // End we have a target number
                else if ( state.Earthdawn.style == Earthdawn.style.VagueRoll)
                    EchoMsg += "  Rolled a " + RollResult.total + ".";
                edc.EDchat( EchoMsg, MsgType);
            });  // End of callback function
        }    // 4th element.
    }; 	// End StepDiceRoller();



                // edInit - Initiative
    this.Initiative = function()  {
        'use strict';

                // Expects an initiative step, rolls the initiative for each selected token and puts them in the turn order the selected token.
                // There may also optionaly be a karma step.
                //
                // The following roll20 macro will generate a string that this will process.
                // edInit~ ?{Initiative Step}~ ?{Karma Step | 0}~ for Initiative
// log(msg);
        var edc = this;
        var step = parseInt( this.msgArray[1] );
        var rollMsg;
        if ( step < 1 ) {
            this.EDchat( "Illegal Initiative step of " + step );
            step = 0;
            rollMsg = "/r d0";
        }
        else
            rollMsg = "/r " + this.StepToDice( step );
        var newMsg = " rolled step " + step;
        if (this.msgArray.length > 2) {
            var karmaDice = this.StepToDice( parseInt( this.msgArray[2] ) );          // karma or bonus step number
            if( karmaDice != "" ) {
                newMsg = newMsg + " plus " + karmaDice.replace( /!|\+/g, "");
                rollMsg = rollMsg + "+" + karmaDice;
            }
        }

        var Count = 0;
        try {
            _.each(edc.msg.selected, function( sel ) { 
                var TokenObj = getObj("graphic", sel._id); 
                if (typeof TokenObj === 'undefined' ) 
                    return;

                var TokenName = TokenObj.get("name"); 
                var CharObj = getObj("character", TokenObj.get("represents")) || ""; 
                if (typeof CharObj === 'undefined')
                    return;

                if( TokenName.length < 1 )
                    TokenName = CharObj.get("name"); 
                Count = Count + 1;
                sendChat( "player|" + edc.msg.playerid, rollMsg + "~" + TokenName + "~" + sel._id, function( ops ) {  
                    'use strict';
                                            // NOTE THAT THIS IS THE START OF A CALLBACK FUNCTION

                    var RollResult = JSON.parse(ops[0].content);
                    var result = RollResult.total;
                    var ResultArray = ops[0].origRoll.split("~");
                    var Reason = "for initiative";
                    if (edc.msgArray.length > 3)
                        Reason = edc.msgArray[3];
                    edc.EDchat( ResultArray[1] + newMsg + ": [" + ResultArray[0] +"] " + Reason +" and got " + result + "."); 
                    var turnorder = (Campaign().get("turnorder") == "") ? [] : JSON.parse(Campaign().get("turnorder"));
                    turnorder = _.reject(turnorder, function( toremove ){ return toremove.id === sel._id });
                    turnorder.push({ id: sel._id, pr: result }); 
                    turnorder.sort( function(a,b) { 'use strict'; return (b.pr - a.pr) });
                    Campaign().set("turnorder", JSON.stringify(turnorder)); 
                });  // End of callback function
            });  // End for each selected token
            if( Count == 0)  { 
                edc.EDchat( "Error! Need to have a token selected to Roll Initiative.", Earthdawn.whoFrom.apierror ); 
            }
        } catch(err) {
            log( "EDInit error caught: " + err );
        }   // end catch
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
  		    return (getAttrByName(rep, "AnnounceTurn" ) == "1")
        return;
    };     // End callbackStAnnounceTurn;

                // This routine is a StatusTracker callback function that tells StatusTracker what type of token it is. PC, NPC, or Mook.
    var callbackStTokenType = function( token )  {
        'use strict';

		let ret = "none";
		switch (getAttrByName(token.get('represents'), "NPC" )) {
			case "-1":	ret = "Object";	break;
			case "0": 	ret = "PC";		break;
			case "1": 	ret = "NPC";	break;
			case "2": 	ret = "Mook";	break;
		}
        return ret;
    };     // End callbackStTokenType;



                // This routine runs when a new character is added. 
				// It can be called from events "on character add" when one is created manually, or 
				// It can be called from WelcomePackage when it makes one. 
//    var newCharacter = function( cID )  {
    this.newCharacter = function( cID )  {
        'use strict';

        Earthdawn.SetDefaultAttribute( cID, "edition", state.Earthdawn.edition, "0.0" );			// Make sure these exist. 
        Earthdawn.SetDefaultAttribute( cID, "effectIsAction", state.Earthdawn.effectIsAction );
        Earthdawn.SetDefaultAttribute( cID, "API", 1, 0 );
        Earthdawn.SetDefaultAttribute( cID, "Karma", 0, 0 );
        Earthdawn.SetDefaultAttribute( cID, "Wounds", 0 );
        Earthdawn.SetDefaultAttribute( cID, "Damage", 0, 0 );
        Earthdawn.SetDefaultAttribute( cID, "Race", 0 );
        Earthdawn.SetDefaultAttribute( cID, "KarmaStep", 4 );
        Earthdawn.SetDefaultAttribute( cID, "Karma-Roll", 0 );
        Earthdawn.SetDefaultAttribute( cID, "LP-Current", 0 );
        Earthdawn.SetDefaultAttribute( cID, "LP-Total", 0 );
        Earthdawn.SetDefaultAttribute( cID, "Wealth_Silver", 0 );
        Earthdawn.SetDefaultAttribute( cID, "record-date-real", "" );
        Earthdawn.SetDefaultAttribute( cID, "record-date-throalic", "" );
        Earthdawn.SetDefaultAttribute( cID, "record-item", "LP" );
        Earthdawn.SetDefaultAttribute( cID, "record-type", "Gain" );
        Earthdawn.SetDefaultAttribute( cID, "SP-Elementalist", "0" );
        Earthdawn.SetDefaultAttribute( cID, "SP-Illusionist", "0" );
        Earthdawn.SetDefaultAttribute( cID, "SP-Nethermancer", "0" );
        Earthdawn.SetDefaultAttribute( cID, "SP-Wizard", "0" );
        Earthdawn.SetDefaultAttribute( cID, "Questor", "None" );
        Earthdawn.SetDefaultAttribute( cID, "MaskList", "0" );
        Earthdawn.abilityAdd( cID, Earthdawn.Constants.SymbolSpell + "​Grimoire",  "!edToken~ ChatMenu: Grimoire");
        Earthdawn.abilityAdd( cID, Earthdawn.Constants.SymbolSpell + "Spells",  "!edToken~ ChatMenu: Spells");
    };     // End newCharacter;


	
                // This routine is a callback that WelcomePackage runs when a new character is added. 
    var callbackWelcomePackage = function( character )  {
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
		this.doLater = "";				// This is a command we are saving to do immediately before the Roll()
        this.indexMsg = 0;              // The command is a tilde (~) segmented list. As we parse this message, this is the index that points to the current segment being parsed. 
        this.indexTarget = undefined;   // Index to targetIDs.
		this.indexToken = undefined;	// Index to tokenIDs.
		this.StatusMarkerCollection = undefined;
        this.targetIDs = [];			// array of IDs of targets.
		this.tokenIDs = [];				// array of IDs of tokens we are processing with this command.
        this.targetNum = undefined;     // If this action involves a target number, it is stored here. 
        this.tokenAction = false;       // If this is set to true, then we were called from a Token Action. If false, from a character sheet button.
                                        // Note that this controls how many of the commands behave. For example ForEach behaves differently if called from a Token Action.
        this.tokenInfo = undefined;     // { type: "token" or "character", name: (name), tokenObj: (API token object), characterObj: (API character object) }
		this.uncloned = this;			// ForEach makes a copy of this class that each loop can modify at will. If you want to make changes or check values in the original, use this.uncloned.
		this.misc = {};					// An object to store miscellaneous values that don't really need a dedicated space on this top level. It starts out empty, but many routines store various stuff here. 
						// Among the things stored here in .misc are:
							// bonusStep:	This holds bonus steps to be added to a step dice roll.
							// bonusDice:	This holds bonus dice to be added to a step dice roll. It is held as a string ready to be appended to a roll query.
							// charIDsUnique:	When MarkerSet is called to toggle status markers, store unique character ids between iterations of each token. 
							// karmaNum:	This holds karma steps to be added to a step dice roll.
							// karmaDice:	This holds karma dice to be added to a step dice roll. It is held as a string ready to be appended to a roll query.
							// reason:		Text that is sent back as part of the result message. 
							// result:		Result of the roll is stored here. Before the roll, modifiers to the result can be stored here. 
							// rollWhoSee:	If this action has a specific customizable roll type (whether roll is public, player/gm, or GM-only), the string describing it is stored here.
							// step:		This is the step number to be rolled for the talent or skill being used. Set with Value.
							// strain: 		How much strain was taken this action.
							// targetName:	Name of the current target token.
							// targetNum2:	On an Action command when the target is Riposte, this stores the 2nd target number. 
						// There are also a number of values that are prepared in the Action, Roll or other routines to be outputted in the RollFormat routine. 
						// These include: 
							// 	headcolor, subheader, succMsg, targetName, targettype, etc.

		




                    // ParseObj.Action()
                    // We are passed an action to take.  Lookup the necessary values from the appropriate character sheet(s) and roll the correct dice.
                    //  ssa[1]: Action - T, SK, SKA, SKK, or SKL.
                    //  ssa[2]: RowID
                    //  ssa[3]: Mods
                    //    value="!Earthdawn~ charID: @{character_id}~ foreach: sct: ust~ Target: @{T_Target}~ Action: T: @(T_RowID): ?{Modification|0}"
        this.Action = function( ssa )  {
            'use strict';

            try {
                if( ssa.length < 3 ) {
                    this.chat( "Error! Action() parameters not correctly formed. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror ); 
                    return;
                }
                if( ssa[ 2 ].length < 1 ) {
                    this.chat( "Error! Action() not passed RowID. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror ); 
                    return;
                }
                if( this.tokenInfo === undefined ) 
					if( this.charID === undefined ) {
						this.chat( "Error! tokenInfo and charID undefined in Action() command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror); 
						return;
					} else {
                        let CharObj = getObj("character", this.charID);
                        if (typeof CharObj != 'undefined')
							this.tokenInfo = { type: "character", name: CharObj.get("name"), characterObj: CharObj };      // All we have is character information.
						else {
							this.chat( "Error! Invalid charID in Action() command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror); 
							return;
						}
					}

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
                case "nac": {
					if( ssa[ 1 ] !== "sk" ) {			// Put anything that is _T_ and _NAC_ but not _SK_ here.
						this.misc[ "result" ] = (this.misc[ "result" ] || 0) + this.getValue( pre + "Result-Mods");
						let fx = Earthdawn.getAttrBN( this.charID, pre + "FX", "");
						if( fx )
							this.misc[ "FX" ] = fx;
						if( ssa[ 1 ] === "t" )
							stepAttrib = "Effective-Rank";
						else if( ssa[ 1 ] === "nac" )
							stepAttrib = "Linked";
					}
                    def_attr = "0";
                    modtype = Earthdawn.getAttrBN( this.charID, pre + "Mod-Type", "0");
					armortype = Earthdawn.getAttrBN( this.charID, pre + "ArmorType", "N/A");
					this.misc[ "succMsg" ] = Earthdawn.getAttrBN( this.charID, pre + "SuccessText", "");
                    if( modtype != "(0)")
						this.doLater += "~Karma: def: 0: " + pre + "Karma-Control"; 
					this.doLater += "~Strain:" + (this.getValue( pre + "Strain")		// Strain from this action, aggressive attacks, called shots and split movement.
								+ (( modtype === "@{Adjust-Attacks-Total}" || modtype === "@{Adjust-Attacks-Total-CC}" )
								? (this.getValue( "combatOption-AggressiveAttack") * this.getValue( "Misc-Aggressive-Strain") ) 
								+ this.getValue( "combatOption-CalledShot") : 0)
								+ (( Earthdawn.getAttrBN( this.charID, pre + "Action") === "Standard" ) ? this.getValue( "combatOption-SplitMovement") : 0));
					special = Earthdawn.getAttrBN( this.charID, pre + "Special", "None");
					if( special && special !== "None" )
						this.misc[ "Special" ] = special;
					if( special === "Recovery" ) {				// Recovery Test
						this.bFlags |= Earthdawn.flags.Recovery;
						if (getAttrByName( this.charID, "NPC") != "2") {
							let aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "Recovery-Tests" }, 0);
							if( aobj.get( "current" ) >= getAttrByName( this.charID, "Recovery-Tests", "max")) {
								this.chat( this.tokenInfo.name + " does not have a recover test to spend." );
								return;
							} else
								aobj.setWithWorker( "current", (parseInt( aobj.get( "current" )) || 0) +1 );
						}
					}
					this.misc[ "rollWhoSee" ] = pre + "RollType";
                    let tType = Earthdawn.getAttrBN( this.charID, pre + "Target", "None");
					if( getAttrByName( this.charID, "condition-Blindsided") === "1" && tType.startsWith( "Ask:" ) && tType.slice( 6,7) === "D" )
						this.chat( "Warning! Character " + this.tokenInfo.name + " is Blindsided. Can he take this action?" ); 

					if (special === "Recovery")
						this.misc[ "headcolor" ] = "recoveryrep";
					else if ( special === "Initiative" )
						this.misc[ "headcolor" ] = "initrep";
					else if( tType.startsWith( "Ask" ) || tType.startsWith( "Riposte"))
						this.misc[ "headcolor" ] = "ask";
					else if ( tType.indexOf( "PD" ) != -1 )
						this.misc[ "headcolor" ] = "pd";
					else if ( tType.indexOf( "MD" ) != -1 )
						this.misc[ "headcolor" ] = "md";
					else if ( tType.indexOf( "SD" ) != -1 )
						this.misc[ "headcolor" ] = "sd";
					else if ( modtype === "@{Adjust-All-Tests-Total}" )
						this.misc[ "headcolor" ] = "action";
					else if ( modtype === "@{Adjust-Effect-Tests-Total}" )
						this.misc[ "headcolor" ] = "effect";
					else if ( modtype === "@{Adjust-Attacks-Total}" )
						this.misc[ "headcolor" ] = "attack";
					else if ( modtype === "@{Adjust-Attacks-Total-CC}" )
						this.misc[ "headcolor" ] = "attackcc";
					else if ( modtype === "@{Adjust-Damage-Total}" )
						this.misc[ "headcolor" ] = "damage";
					else if ( modtype === "@{Adjust-Damage-Total-CC}" )
						this.misc[ "headcolor" ] = "damagecc";
					else
						this.misc[ "headcolor" ] = "none";

					if( tType && tType !== "None" )
						if( tType.startsWith( "Ask" ))
							this.misc[ "targettype" ] = tType.substring( 0, tType.lastIndexOf( ":" ));
						else if( tType.slice( 1, 3) === "D1")			// PD1, MD1, and SD1, go to just the first two characters.
							this.misc[ "targettype" ] = tType.slice( 0, 2);
						else if( tType.startsWith( "Riposte" ))
							this.misc[ "targettype" ] = "Riposte";
						else
							this.misc[ "targettype" ] = tType;

					if( Earthdawn.getAttrBN( this.charID, pre + "ActnEfct", "1" ) === "1") {
						if( getAttrByName( this.charID, "combatOption-DefensiveStance" ) === "1" )
							if ( Earthdawn.getAttrBN( this.charID, pre + "Defensive", "0" ) === "1" ) {
								step += 3;			// Since this talent is defensive, we need to add this value that has already been subtracted out back in. 
								this.misc[ "Defensive" ] = true;	// Since step was modified for being defensive, tell people.
							}
						if( getAttrByName( this.charID, "condition-KnockedDown" ) === "1" )
							if( Earthdawn.getAttrBN( this.charID, pre + "Resistance", "0" ) === "1" ) {
								step += 3;
								this.misc[ "Resistance" ] = true;
							}
					}
					if( Earthdawn.getAttrBN( this.charID, pre + "NotMoveBased", "0" ) != "1" ) {		// Unlike the above two, these two have not already been subtracted from the step, so we need to subtract them now.
						let tstep = getAttrByName( this.charID, "condition-ImpairedMovement" );
						if( tstep > 0 ) {
							step -= tstep;
							this.misc[ "MoveBased" ] = (tstep == 2) ? "Partial" : "Full";
						}
					}
					if( Earthdawn.getAttrBN( this.charID, pre + "NotVisionBased", "0" ) != "1" ) {
						let tstep = getAttrByName( this.charID, "condition-Darkness" );
						if( tstep > 0 ) {
							step -= tstep;
							this.misc[ "VisionBased" ] = (tstep == 2) ? "Partial" : "Full";
						}
					}
                } break;
                case "ska":
                case "skac":
                    def_attr = "Cha";
					this.misc[ "rollWhoSee" ] = pre + "RollType";
					this.misc[ "headcolor" ] = "action";
                break;
                case "skk":
					this.doLater += "~Karma: def: 0: " + pre + "Karma-Control"; 
                    def_attr = "Per";
					this.misc[ "rollWhoSee" ] = pre + "RollType";
					this.misc[ "headcolor" ] = "action";
                break;
                case "wpn":
					stepAttrib = "Base";
					this.doLater += "~Karma: def: 0: " + pre + "Karma-Control"; 
					modtype = ((Earthdawn.getAttrBN( this.charID, pre + "CloseCombat", "0" ) == "1") ? "@{Adjust-Damage-Total-CC}": "@{Adjust-Damage-Total}" );
                    def_attr = "Str";
					this.misc[ "headcolor" ] = "damage";
					armortype = "PA";
                break;
                default:
                    this.chat( "Error! Action() parameter ssa[1] not 'T', 'NAC', 'SK', 'SKA', or 'SKK'. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror ); 
                }

                if( modtype === undefined )
                    modtype = "@{Adjust-All-Tests-Total}";
				else if (modtype.slice( 2, 18) === "Adjust-Attacks-T" )
					this.Bonus( [ 0, "Adjust-Attacks-Bonus" ] );
				else if (modtype.slice( 2, 17) === "Adjust-Damage-T" )
					this.Bonus( [ 0, "Adjust-Damage-Bonus" ] );
				this.misc[ "ModType" ] = modtype;
				this.misc[ "rsPrefix" ] = pre;

				if( armortype !== undefined && armortype !== "N/A" )
					switch ( armortype.trim().toLowerCase() ) {
					case "pa":		this.bFlags |= Earthdawn.flagsArmor.PA;			break;
					case "ma":		this.bFlags |= Earthdawn.flagsArmor.MA;			break;
					case "pa-nat":	this.bFlags |= Earthdawn.flagsArmor.PA | Earthdawn.flagsArmor.Natural;		break;
					case "ma-nat":	this.bFlags |= Earthdawn.flagsArmor.MA | Earthdawn.flagsArmor.Natural;		break;
					case "na":
					case "noarmor":
					case "none":	this.bFlags |= Earthdawn.flagsArmor.None;		break;
					case "unknown":
					case "unk":		this.bFlags |= Earthdawn.flagsArmor.Unknown;	break;
					}

                            // First we want to know what attribute this action uses, and what it's value is. 
                let attr, modtypevalue;
                if( ssa[1] !== "skk" && ssa[1] !== "skac" && ssa[1] !== "wpn" )
                    attr = Earthdawn.getAttrBN( this.charID, pre + "Attribute", "0");
                if( attr === undefined )            // Undefined means it is still at it's default value (and will clutter the console output with an error message. )
                    attr = def_attr;
                else
                    attr = attr.slice(3,6);
                if( attr != "0" && attr !== "" && attr !== undefined) {              // There is an attribute other than "None".     Find it's value. 
                    step += this.getValue( attr + "-Step");
                    step += this.getValue( attr + "-Mods");
                }

//				if( stepAttrib === "Linked" )		// We need some but not all of the elements of NAC_Step. 
//					step += this.getValue( pre + "Attribute");
				modtypevalue = this.getValue( modtype.replace( /[@\(\{\}\)]/g, "")) * ( modtype.endsWith( "IP}" ) ? -1 : 1 );			// Initiative Penalties need to be subtracted instead of added. 
                this.misc[ "step" ] = step + modtypevalue + this.getValue( pre + stepAttrib) + this.getValue( pre + "Mods" ) - this.mookWounds();
				this.misc[ "ModValue" ] = modtypevalue;
                this.misc[ "reason" ] = Earthdawn.getAttrBN( this.charID, pre + "Name", "").trim() + ((ssa[ 1 ] === "wpn") ? " damage" : "");

                let newssa = ssa.splice( 2);
                if ( special != undefined && special == "Initiative" ) {
					if( getAttrByName( this.charID, "Creature-Ambushing" ) == "1" )
						this.misc[ "step" ] += parseInt(getAttrByName( this.charID, "Creature-Ambush" )) || 0;
                    newssa[ 0 ] = "Init";
                    this.Roll( newssa );
                } else if ( modtype == "(0)" ) {			// modtype "(0)" Is No Roll
					this.doNow();
                    this.chat( "For Rank " + this.misc[ "step" ] + " " + this.misc[ "reason" ].slice(0,-5));
                } else {
                    newssa[ 0 ] = "Roll";
                    this.ForEachHit( newssa );
				}
            } catch(err) {
                log( "ED.Action() error caught: " + err );
            }   // end catch
        } // End ParseObj.Action()



                    // ParseObj.Bonus ( ssa )
                    // Add a bonus dice to the next roll.
                    // ssa is an array that holds the parameters.
                    //      1 - Step of the bonus dice (defaults to step 0).
        this.Bonus = function( ssa )  {
            'use strict';

            try {
                var kstep = 0;
                if( ssa.length > 1 )
                    kstep = this.getValue( ssa[ 1 ] );

                if( kstep > 0 ) {       // do we really have a bonus dice?
					this.misc[ "effectiveStep" ] = (("effectiveStep" in this.misc) ? this.misc[ "effectiveStep" ] : 0 ) + kstep;
                    let t = this.edClass.StepToDice( kstep );
                    this.misc[ "bonusStep" ] = ( ("bonusStep" in this.misc) ? this.misc[ "bonusStep" ] + "+" : "" ) + kstep;
                    this.misc[ "bonusDice" ] = ( ("bonusDice" in this.misc) ? this.misc[ "bonusDice" ] : "" ) + "+" + t;
                }
            } catch(err) {
                log( "ED.Bonus() error caught: " + err );
            }   // end catch
        } // End ParseObj.Bonus() ssa )




                    // ParseObj.CalculateStep()
                    // This subroutine has a purpose similar to Lookup, but the processing needed is to complex to be passed on the command line. 
                    // So we are passed an identifier in ssa [ 1 ] which tells us what needs to be calculated. 
                    // This routine looks up whatever info is needed and performs the calculation.
                    // Anything after ssa[1] is added to this total.
                    // The results are put in this.misc.step.
					//
					// So far this routine can calculate:
					//		Jump-up step
        this.calculateStep = function( ssa )  {
            'use strict';

            try {
                if( ssa.length < 2 ) {
                    this.chat( "Error! calculateStep() not passed a value to lookup. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror ); 
                    return false;
                } 
                if( this.charID === undefined ) {
                    this.chat( "Error! charID undefined in calculateStep(). Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror); 
                    return false;
                }

                var lu = 0;
                switch ( ssa[ 1 ].toLowerCase() ) {
                case "jumpup":
                    lu = parseInt( getAttrByName( this.charID, "Dex" ) || 0);
                    lu += parseInt( getAttrByName( this.charID, "condition-KnockedDown" ) || 0) * 3;
                    lu -= parseInt( getAttrByName( this.charID, "Armor-IP" ) || 0) + this.mookWounds();		// Note that this is only Armor-IP, not shield or misc mods.
                break;
                } // End switch

                lu += this.ssaMods( ssa, 2);
                this.misc[ "step" ] = ( this.misc[ "step" ] || 0) + lu;
            } catch(err) {
                log( "edParse.calculateStep() error caught: " + err );
            }   // end catch
            return false;
        } // End calculateStep()



                    // ParseObj.chat()
					// For various reasons it was decided to have a chat within ParseObj, and a separate EDchat in the ED class. 
					// Be careful you know which one is being called!
		this.chat = function ( newMsg, iFlags, customFrom ) {
			'use strict';

	//log( newMsg);
			iFlags = iFlags || 0;
			if ( iFlags & Earthdawn.whoFrom.apierror ) {
				log( newMsg );
				iFlags |= Earthdawn.whoFrom.api | Earthdawn.whoTo.player;
			}
			let wf;
			if( customFrom )
				wf = customFrom;
			else if ((iFlags & Earthdawn.whoFrom.player) && (iFlags & Earthdawn.whoFrom.character))
				wf = this.edClass.msg.who.replace(" (GM)","") + " - " + this.tokenInfo[ "name" ];
			else if (iFlags & Earthdawn.whoFrom.character)
				wf = this.tokenInfo[ "name" ];
			else if ((iFlags & Earthdawn.whoFrom.api) || (this.edClass.msg.playerid === "API"))
				wf = "API";
			else 
				wf = this.edClass.msg.who.replace(" (GM)","");

			if( !( iFlags & Earthdawn.whoTo.mask))         // If no whoTo specified, send to all.
				sendChat( wf + " to Public", newMsg, null, (iFlags & Earthdawn.whoFrom.noArchive) ? {noarchive:true} : null );
			else {
				if( iFlags & Earthdawn.whoTo.gm )
					sendChat( wf + (( iFlags & Earthdawn.whoTo.player) ? " to GM&P " : " to GM"), "/w gm " + newMsg, null, (iFlags & Earthdawn.whoFrom.noArchive) ? {noarchive:true} : null );
				if(( iFlags & Earthdawn.whoTo.player) 
							&& !((iFlags & Earthdawn.whoTo.gm) 
							&& (playerIsGM( this.edClass.msg.playerid ) || this.edClass.msg.playerid === "API")))       // Send to player, unless the player is the gm and already sent to the gm.
					sendChat( wf + (( iFlags & Earthdawn.whoTo.gm) ? " to GM&P " : " to Player"), '/w "' + this.edClass.msg.who.replace(" (GM)","") +'" ' +  newMsg, null, (iFlags & Earthdawn.whoFrom.noArchive) ? {noarchive:true} : null ); 
			}
		}; // end chat()



                    // ParseObj.ChatMenu()
					// We have a request to display a menu in the chat window. 
					// attrib, damage, editspell2 (dur, MenuAddExtraThread, AddExtraThread, MenuRemoveExtraThread, RemoveExtraThread),
					// gmstate, grimoire, help, languages, link, skills, spells, status, talents-non, oppmnvr.
        this.ChatMenu = function( ssa )  {
            'use strict';

            try {
				var edParse = this,
					lst,
					id;
				let s = "",
					ind = 0,
					basic = true;
				function addItemValue( label, item, tip, bgColor ) {
					s += edParse.makeButton( label, "!Earthdawn~ foreach: st~ Value: " + item + "~ Roll: ?{Modification|0}", tip, bgColor, "black" );
				}
				function addSheetButtonCall( label, item, tip ) {
					s += edParse.makeButton( label, 
							"!Earthdawn~ foreach: st: tuc~ SetAttrib: " + item + ":?{" + Earthdawn.getParam(label, 1, " ") 
							+ Earthdawn.pipe() + Earthdawn.at() + Earthdawn.braceOpen() + "selected" 
							+ Earthdawn.pipe() + item + Earthdawn.braceClose() + "}", tip, "lightskyblue", "black" );
				}
				function addCharID( label, item, tip, color ) {
					s += edParse.makeButton( label, "!Earthdawn~ charID: " + edParse.charID + "~ " + item, tip, color, "black" );
				}
				function buildLabel( label, item ) {
					if( !item ) 
						item = label;
					return ( id ? label + " " + edParse.getValue(item, id).toString() : label);
				}


				switch (ssa[ 1 ].toLowerCase()) {
				case "attrib": {
					lst = this.getUniqueChars( 1 );
					if ( _.size( lst) === 1 )
						for( let k in lst ) {
							id = k; 
						}
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
					s += "Unc " + getAttrByName( id, "Damage", "max" ).toString() + "&nbsp;&nbsp; ";
					s += buildLabel( "Dth", "Damage-Death-Rating" )+"&nbsp;&nbsp; ";
					s += buildLabel( "W Thr", "Wound-Threshold" )+"&nbsp;&nbsp; ";
					s += buildLabel( "Karma" )+"&nbsp;&nbsp; ";
					s += "K max " + getAttrByName( id, "Karma", "max" ).toString() + "&nbsp;&nbsp; ";
					s += buildLabel( "DP" )+"&nbsp;&nbsp; ";
					s += "DP max " + getAttrByName( id, "DP", "max" ).toString() + "&nbsp;&nbsp; ";

					addItemValue( buildLabel( "Dex" ), "Dex", null, "lawngreen" );
					addItemValue( buildLabel( "FX", "Dex-Effect" ), "Dex-Effect", null, "greenyellow" );
					addItemValue( buildLabel( "Str" ), "Str", null, "lawngreen" );
					addItemValue( buildLabel( "FX", "Str-Effect" ), "Str-Effect", null, "greenyellow" );
					addItemValue( buildLabel( "Tou" ), "Tou", null, "lawngreen" );
					addItemValue( buildLabel( "FX", "Tou-Effect" ), "Tou-Effect", null, "greenyellow" );
					addItemValue( buildLabel( "Per" ), "Per", null, "lawngreen" );
					addItemValue( buildLabel( "FX", "Per-Effect" ), "Per-Effect", null, "greenyellow" );
					addItemValue( buildLabel( "Wil" ), "Wil", null, "lawngreen" );
					addItemValue( buildLabel( "FX", "Wil-Effect" ), "Wil-Effect", null, "greenyellow" );
					addItemValue( buildLabel( "Cha" ), "Cha", null, "lawngreen" );
					addItemValue( buildLabel( "FX", "Cha-Effect" ), "Cha-Effect", null, "greenyellow" );
					s += this.makeButton( buildLabel( "Init", "Initiative"), "!Earthdawn~ foreach: st~ value : Initiative~ Init: ?{Modification|0}", 
								"Roll Initiative for this character.", "limegreen", "black" );
					var x;
					if( id )
						x = this.getValue("Str-Step", id) + this.getValue("Str-Adjust", id) + this.getValue("Str-Mods", id) 
								+ this.getValue("Knockdown-Adjust", id) + this.getValue("Adjust-Defensive-Total", id);
					addItemValue( x ? "Knockdown-" + x.toString() : "Knockdown", 
								"Str-Step: Str-Adjust: Str-Mods: Knockdown-Adjust: Adjust-Defensive-Total", "Make a standard Knockdown test.", "limegreen", "black" );
					s += this.makeButton( "JumpUp", "!Earthdawn~ foreach: st~ TargetNum: 6: Adjust-TN-Total~ foreach~ Strain: 2~ calculateValue: JumpUp~ Roll: ?{Modification|0}", 
								"Make a jump-up test.", "limegreen", "black" );
					addItemValue( buildLabel( "Recovery", "Recovery-Step"), "Recovery-Step", null, "limegreen" );
					addItemValue( buildLabel( "Will Effect", "Will-Effect" ), "Will-Effect", null, "limegreen" );
                                        // go through all attributes for this character and look for ones we are interested in
                    let attributes = findObjs({ _type: "attribute", _characterid: id });
                    _.each( attributes, function (att) {
                        if (att.get("name").endsWith( "_DSP_Name" ))
							s += edParse.makeButton( att.get("current") + " " + edParse.getValue( Earthdawn.buildPre( "DSP", att.get("name") ) + "Circle", id), 
										"!edToken~ " + Earthdawn.percent() + "{" + id + "|" + Earthdawn.buildPre( "DSP", att.get("name") ) + "halfMagic}", 
										"Half Magic test.", "green", "white" );
                    }); // End for each attribute.
					this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "Attributes" );
				}	break;
				case "damage": {
					s = "<br>Take - ";
					s += this.makeButton( "PA", "!Earthdawn~ foreach: st~Damage : PA : ?{Damage - Physical Armor applies|1}",  
								"The Selected Token(s) take damage. Physical Armor applies.", "red", "white" );
					s += this.makeButton( "MA", "!Earthdawn~ foreach: st~Damage : MA : ?{Damage - Mystic Armor applies|1}",  
								"The Selected Token(s) take damage. Mystic Armor applies.", "red", "white" );
					s += this.makeButton( "No Armor", "!Earthdawn~ foreach: st~Damage : NA : ?{Damage - No Armor|1}",
								"The Selected Token(s) take damage. No Armor applies.", "red", "white" );
					s += this.makeButton( "PA-Nat", "!Earthdawn~ foreach: st~Damage : PA-Nat : ?{Damage - Natural Physical Armor applies|1}",  
								"The Selected Token(s) take damage. Only Natural Physical Armor applies.", "red", "white" );
					s += this.makeButton( "MA-Nat", "!Earthdawn~ foreach: st~Damage : MA-Nat : ?{Damage - Natural Mystic Armor applies|1}",  
								"The Selected Token(s) take damage. Only Natural Mystic Armor applies.", "red", "white" );
					s += "<br>Give - ";
					s += this.makeButton( "PA", "!Earthdawn~ setToken: @{target|token_id}~ Damage : PA : ?{Damage - Physical Armor applies|1}", 
								"Give damage to a Target token. Physical Armor applies.", "green", "white" );
					s += this.makeButton( "MA", "!Earthdawn~ setToken: @{target|token_id}~ Damage : MA : ?{Damage - Mystic Armor applies|1}",  
								"Give damage to a Target token. Mystic Armor applies.", "green", "white" );
					s += this.makeButton( "No Armor", "!Earthdawn~ setToken: @{target|token_id}~ Damage : NA : ?{Damage - No Armor|1}",  
								"Give damage to a Target token. No Armor applies.", "green", "white" );
					s += this.makeButton( "PA-Nat", "!Earthdawn~ setToken: @{target|token_id}~ Damage : PA-Nat : ?{Damage - Natural Physical Armor applies|1}", 
								"Give damage to a Target token. Only Natural Physical Armor applies.", "green", "white" );
					s += this.makeButton( "MA-Nat", "!Earthdawn~ setToken: @{target|token_id}~ Damage : MA-Nat : ?{Damage - Natural Mystic Armor applies|1}",  
								"Give damage to a Target token. Only Natural Mystic Armor applies.", "green", "white" );
                    this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "Damage" );
				}	break;
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
						let aobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: this.charID, name: nm + "Duration" }, "");
						aobj.setWithWorker( "current", dur );
						s = "Duration updated";
					}	break;
					case "MenuAddExtraThread": {
						addCharID( "ET Add Target", "chatMenu: editSpell2: " + ssa[ 2 ] + ": AddExtraThread: Add Tgt (+?{How many Additional Targets or Additional Effects|Rank})", null, "silver" );
						addCharID( "ET Inc Area", "chatMenu: editSpell2: " + ssa[ 2 ] + ": AddExtraThread: Inc Area (?{How much increased area|2 Yards})", null, "silver" );
						addCharID( "ET Inc Dur (minutes)", "chatMenu: editSpell2: " + ssa[ 2 ] + ": AddExtraThread: Inc Dur (min)", null, "silver" );
						addCharID( "ET Inc Dur", "chatMenu: editSpell2: " + ssa[ 2 ] + ": AddExtraThread: Inc Dur (?{How many units})", null, "silver" );
						addCharID( "ET Inc Effect Step", "chatMenu: editSpell2: " + ssa[ 2 ] + ": AddExtraThread: Inc Efct Step (?{How many units|2})", null, "silver" );
						addCharID( "ET Inc Effect (other)", "chatMenu: editSpell2: " + ssa[ 2 ] + ": AddExtraThread: Inc Efct (Other) (?{How many units|2})", null, "silver" );
						addCharID( "ET Inc Range", "chatMenu: editSpell2: " + ssa[ 2 ] + ": AddExtraThread: Inc Rng (?{How many units|10 yards})", null, "silver" );
						addCharID( "ET Special", "chatMenu: editSpell2: " + ssa[ 2 ] + ": AddExtraThread: Special (?{What is the text of the Extra Thread Effect})", null, "silver" );
						addCharID( "ET Remove Targets", "chatMenu: editSpell2: " + ssa[ 2 ] + ": AddExtraThread: Rmv Tgt (?{How many targets to remove|-Rank})", null, "silver" );
						addCharID( "ET Not Applicable", "chatMenu: editSpell2: " + ssa[ 2 ] + ": AddExtraThread: NA", null, "silver" );
					} 	break;
					case "AddExtraThread": {
						let aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: nm + "ExtraThreads" }, "");
						let et = "," + aobj.get( "current" ) + ",";
						if( et.length < 4 )
							et = ",";
						aobj.set( "current", (et + ssa[ 4 ] + ",").slice( 1, -1 ));
						s = "Updated";
					}	break;
					case "MenuRemoveExtraThread": {
						let et = Earthdawn.getAttrBN( this.charID, nm + "ExtraThreads", "0" );
						let aet = et.split( "," );
						for( let i = 0; i < aet.length; ++i )
							if( aet[ i ].trim().length > 0 )
								addCharID( "Remove " + aet[ i ].trim(), "chatMenu: editSpell2: " + ssa[ 2 ] + ": RemoveExtraThread: " + aet[ i ].trim(), null, "salmon" );
					}	break;
					case "RemoveExtraThread": {
						let aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: nm + "ExtraThreads" }, "");
						let et = "," + aobj.get( "current" ).trim() + ",";
						let net = et.replace( "," + ssa[ 4 ] + ",", "," );
						if( et != net ) {
							aobj.set( "current", net.slice( 1, -1 ));
							s = "Updated";
						}
					} 	break;
					}
					if( s.length > 1 )
						this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "Edit Spell: " 
								+ Earthdawn.getAttrBN( this.charID, Earthdawn.buildPre( "SP", ssa[ 2 ] ) + "Name", "" ));
				}	break;
				case "gmstate": {
					if( !playerIsGM( this.edClass.msg.playerid ) )
						this.chat( "Error! Only GM can change state variables!", Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "gmState" );
					else {
						if( ssa[ 2 ] === "1879" )
							s += this.makeButton("Change Edition", "!Earthdawn~ Misc: State: edition: 1 1879", 
									"Switch API and Character sheet to 1879 First Edition" );
						else
							s += this.makeButton("Change Edition", "!Earthdawn~ Misc: State: edition: ?{What Earthdawn rules Edition|Forth Edition,4 ED|Third Edition,3 ED|First Edition,1 ED}", 
									"Switch API and Character sheet to Earthdawn 1st/3rd/4th Edition" );
						s += this.makeButton("Result Style", "!Earthdawn~ Misc: State: Style: ?{What roll results style do you want|Vague Roll Result,2|Vague Success (not recommended),1|Full,0}",
								"Switch API to provide different details on roll results. Vague Roll result is suggested. It does not say what the exact result is, but says how much it was made by. Vague Success says exactly what the roll was, but does not say the TN or how close you were." );
						s += this.makeButton("Effect is Action", "!Earthdawn~ Misc: State: EffectIsAction: ?{Is an Effect test to be treated identically to an Action test|No,0|Yes,1}", 
								"Two schools of thought. Effect Tests are Action tests, and modifiers that affect Action Tests also affect Effect Tests, or they are not and they don't." );
						s += this.makeButton("Curse Luck Silent", "!Earthdawn~ Misc: State: CursedLuckSilent: ?{Does the Cursed Luck Horror power work silently|No,0|Yes,1}?{Does No-pile-on-dice work silently|No,0|Yes,1}?{Does No-pile-on-step work silently|No,0|Yes,1}", 
								"Normally the system announces when a dice roll has been affected by Cursed Luck. However the possibility exists that a GM might want it's effects to be unobtrusive. When this is set to 'yes', then the program just silently changes the dice rolls." );
						s += this.makeButton("No Pile on - Dice", "!Earthdawn~ Misc: State: NoPileonDice: ?{Enter max number of times each die may explode. -1 to disable|-1}", 
								"If a GM desires a less lethal game, or to reduce risk in specific encounters, they can use this option to keep NPC dice from exploding too many times. This controls the maximum number of times a single dice can 'explode' (be rolled again after rolling a max result). -1 is the standard default of unlimited. 0 means no dice will ever explode. 2 (for example) means a dice can explode twice, but not three times. This is done quietly, without announcing it to the players." );
						s += this.makeButton("No Pile On - Step", "!Earthdawn~ Misc: State: NoPileonStep: ?{Enter multiple of step number to limit result to. -1 to disable|-1}", 
								"If a GM desires a less lethal game, or to reduce risk in specific encounters, they can use this option to keep NPC roll results from exceeding a specific multiple the step number. If zero or -1, this is disabled and roll results are unlimited. if 1, then the dice result will never be very much greater than the step result. If (for example) the value is 3.5, then the result will never get very much greater than 3.5 times the step being rolled. This is done quietly, without announcing it to the players." );
						s += this.makeButton("API Logging", "!Earthdawn~ Misc: State: ?{What API logging event should be changed|LogStartup|LogCommandline}: ?{Should the API log this event|Yes,1|No,0}", 
								"What API events should the API log to the console?" );
						this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "gmState" );
				}	} break;
				case "grimoire": {
					s = "Load what spell into Matrix? ";
					lst = this.getUniqueChars( 1 );
					for( let k in lst ) {
						id = k; 
                                        // go through all attributes for this character and look for ones we are interested in
                        var attributes = findObjs({ _type: "attribute", _characterid: id });
                        _.each( attributes, function (att) {
                            if (att.get("name").endsWith( "_SP_Name" ))
								s += edParse.makeButton( att.get("current"), 
										"!edToken~ " + Earthdawn.percent() + "{" + id + "|" + Earthdawn.buildPre( "SP", att.get("name")) + "EditButton}",
										Earthdawn.getAttrBN( id, Earthdawn.buildPre( att.get("name") ) + "SuccessText", "" ), "burlywood", "Black" );
                        }); // End for each attribute.
						this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive,	getAttrByName( id, "character_name" ) + " - Grimoire" );
					}
				}	break;
				case "help": {
//					s = this.makeButton( "Wiki Link", "https://wiki.roll20.net/Earthdawn_4e_(Integrated)", 
//					s = this.makeButton( "Wiki Link", "https://wiki.roll20.net/Earthdawn_(FASA_Official)", 
					s = this.makeButton( "Wiki Link", "https://wiki.roll20.net/Earthdawn_-_FASA_Official", 
								"This button will open this character sheets Wiki Documentation, which should answer most of your questions about how to use this sheet. <br\>Note that you should tell your browser to open this link in another tab.", 
								"black", "white", true );
//                    s = "&{template:chathelp} " + Earthdawn.braceOpen() + Earthdawn.braceOpen() + 
//							"button1=[this link](https://wiki.roll20.net/Earthdawn_(FASA_Official" + 
//							Earthdawn.parenClose() + Earthdawn.parenClose() + Earthdawn.braceClose() + Earthdawn.braceClose(), 
                    this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "API" );
				}	break;
				case "inspect": {
					s = "Inspect: "
						+ this.makeButton( "Lookup Value", "!Earthdawn~ foreach: st: tuc~ Debug: Inspect : GetValue: ?{Enter full name}", 
								"Enter an attribute name (simple or whole repeating section name), and get the value.", "CornflowerBlue" )
						+ this.makeButton( "IDs from Name", "!Earthdawn~ foreach: st: tuc~ Debug: Inspect : GetIDs: ?{Enter Name fragment}", 
								"Enter a text fragment, and get IDs of every repeating section name that contains that fragment.", "CornflowerBlue" )
						+ this.makeButton( "TokenObj", "!Earthdawn~ foreach: st~ Debug: Inspect : TokenObj", 
								"Test code to cause selected tokens to display TokenInfo to chat.", "CornflowerBlue" )
						+ this.makeButton( "Repeating section", "!Earthdawn~ charID: ?{Char ID|@{selected|character_id}}~ Debug: Inspect: RepeatSection: ?{RowID}", 
								"Test code to show information on a row.", "CornflowerBlue" )
						+ this.makeButton( "Object ID", "!Earthdawn~ Debug: Inspect: ObjectID: ?{Object ID}", 
								"Test code to show information on what an ID is. Character ID, Token ID, etc.", "CornflowerBlue" )
						+ this.makeButton( "Statusmarkers", "!Earthdawn~ foreach: st~ Debug: Inspect : statusmarkers", 
								"Test code to cause selected tokens to display statusmarkers to Chat.", "CornflowerBlue" );
                    this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "API" );
				}	break;
				case "languages": {
					lst = this.getUniqueChars( 1 );
					for( let k in lst ) {
						id = k; 
						s = '<div>';
                                        // got through all attributes for this character and look for ones we are interested in
                        let attributes = findObjs({ _type: "attribute", _characterid: id });
                        _.each( attributes, function (att) {
							if (att.get("name").endsWith( "_SKL_Name" )) {
								s += "<div><strong>";
									pre = Earthdawn.buildPre( "SKL", att.get("name") );
								s += Earthdawn.getAttrBN( id, pre + "Name", ""); 
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
						this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, 
								getAttrByName( id, "character_name" ) + " - Languages" );
					}
				}	break;
				case "linknac": {			// chatmenu: LinkNAC: NAC rowID
											// Link from NAC DoStuff. List all existing links and ask if to be removed. Also button to add a link. 
					addCharID( "Add a Link", "ChatMenu: Linkadd1: " + ssa[ 2 ] + 
								": ?{What are we linking|Talent,T|Knack,NAC|Attribute|Weapon,WPN}: ?{Name to link to (Make sure substring is an exact match)}",
								"Link this Knack to an Attribute, Talent, Knack, or Weapon, such that this Knack will use that items Step." );
//					addCharID( "Link Other", "ChatMenu: LinkaddOther: " + ssa[ 2 ] + ": ?{Character name to link to (exact)}"
//								": ?{What are we linking|Talent,T|Knack,NAC|Attribute|Weapon,WPN}: ?{Name of thing to link to (Make sure substring is an exact match)}",
//								"Link this Knack to an Attribute, Talent, Knack, or Weapon on a DIFFERENT character, such that this Knack will use that items Step. (For example Charge damage can link to a mounts STR)" );
					lst = Earthdawn.getAttrBN( this.charID, Earthdawn.buildPre( "NAC", ssa[ 2 ]) + "LinkDisplay", "" );
					let lst2 = Earthdawn.getAttrBN( this.charID, Earthdawn.buildPre( "NAC", ssa[ 2 ] ) + "Linked", "" );
					if( lst2.length < 5 )
						lst2 = "";		// strip out any (0) that was put here.
					if( lst )
						lst = lst.split( "," );
					if( !lst || !lst2 || lst.length == 0 )
						s += "Existing links: None.";
					else for( let i = 0; i < lst.length; ++i ) {
						let t = Earthdawn.getParam( lst2, i + 1, ")+(" ),
							att = !t.startsWith( "repeating_" ),
							mid = Earthdawn.getParam( t, 4, "_" );
						s += "Remove ";
						if( att )
							addCharID( lst[ i ].trim(), "ChatMenu: LinkRemove: " + ssa[ 2 ] + ": Attribute: "  + lst[ i ], "Make this Knack no longer linked to this Attribute.");
						else
							addCharID( lst[ i ].trim(), 
									"ChatMenu: LinkRemove: " + ssa[ 2 ] + ": " + mid + ": "  + Earthdawn.getParam( t, 3, "_" ),
									"Make this Knack no longer linked to this " + (mid === "NAC" ? "Knack." : (mid === "WPN" ? "Weapon." : "Talent.")));
					}
                    this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "API" );
				}	break;
//				case "linkaddother":
//					var other = ssa.splice( 3, 1 );
//                    let attributes = findObjs({ _type: "attribute", _characterid: ( other ) ? other: this.charID }),
				case "linkadd1": {			// ChatMenu: linkadd1: NAC rowID: (Attribute, T, NAC, or WPN) : (name string to search for)
											// User has given us a string to attempt to link to. Search all entries to see if there is a match. Confirm the match.
                    let attributes = findObjs({ _type: "attribute", _characterid: this.charID }),
						att = ssa[ 3 ] === "Attribute",
						found = [];
					if( att ) {
						_.each( attributes, function (att) {
							if ( att.get( "name" ).indexOf( ssa[ 4 ] ) != -1)
								found.push( att );
                    }); // End for each attribute.
					} else {
						let lookfor = "_" + ssa[ 3 ] + "_Name";
						_.each( attributes, function (att) {
							if (att.get("name").endsWith( lookfor ) && att.get( "current").indexOf( ssa[ 4 ] ) != -1)
								found.push( att );
                    }); } // End for each attribute.
					if( found.length == 0 ) {
						this.chat( "No matches found.", Earthdawn.whoFrom.apierror); 
						break;
					} else if ( found.length == 1 )
						ssa[ 4 ] = att ? found[ 0 ].get( "name" ) : Earthdawn.getParam( found[ 0 ].get( "name" ), 3, "_" );
								// This option falls into lindadd2.
					else {
						s = found.length + " matches found. Select which to Link: ";
						for( let i = 0; i < found.length; ++i ) 
							addCharID(  ssa[ 3 ] + " " + ( att ? found[ i ].get( "name" ) + " " : "") + found[ i ].get( "current" ), 
									"ChatMenu: Linkadd2: " + ssa[ 2 ] + ": " + ssa[ 3 ] + ": " + (att ? found[ i ].get( "name" ) : Earthdawn.getParam( found[ i ].get( "name" ), 3, "_" )),
									"Link Knack to this." );
						this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "API" );
						break;
					}
				}
				case "linkadd2": {			// ChatMenu: linkadd2: NAC rowID: (T, NAC, or WPN): link rowID
											// User has pressed a button telling us which exact one to link to OR we fell through from above due to only finding  one candidate. 
											// Here we do the actual linking.
					let dobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: this.charID, name: Earthdawn.buildPre( "NAC", ssa[ 2 ] ) + "LinkDisplay" }),
						lobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: this.charID, name: Earthdawn.buildPre( "NAC", ssa[ 2 ] ) + "Linked" }),
						att = ssa[ 3 ] === "Attribute";
					let dlst = dobj.get( "current" ),
						llst = lobj.get( "current" );
					if( !llst || llst.length < 5 ) {			// there are no existing links, so we are adding the first one.
						llst = [];
						dlst = [];
					} else {
						llst = llst.replace( /\)\+\(/g, "),(").split( "," );
						dlst = dlst.split( "," ); 
						if( llst.length != dlst.length ) {
							this.chat( "Warning! internal data mismatch is linkadd2.", Earthdawn.whoFrom.apierror); 
							log( dlst);
							log( llst);
							llst = [];
							dlst = [];
						}
					}
					let t =  att ? ssa[ 4 ] : Earthdawn.getAttrBN( this.charID, Earthdawn.buildPre( ssa[ 3 ], ssa[ 4 ] ) + "Name", "" ),
						po = this,
						l;
					dlst.push( t );
					function lnk() {
						l = "";
						for( let i = 0; i < arguments.length; ++i ) {
							let tmp = (att ? "" : Earthdawn.buildPre( ssa[ 3 ], ssa[ 4 ] )) + arguments[ i ];
							Earthdawn.SetDefaultAttribute( edParse.charID, tmp, 0);				// Due to system bug, calculated field values need to actually exist or calculation fails and gets blank.
							l += ((i === 0) ? "(@{" : "+@{" ) + tmp + "}";
						}
						l += ")";
					};
					switch( ssa[ 3 ] ) {
						case "Attribute": 	lnk( ssa[ 4 ] );					break;
						case "T":			lnk( "Effective-Rank", "Mods" );	break;
						case "NAC":			lnk( "Step" );						break;
						case "WPN":			lnk( "Base", "Mods" );				break;
					}
					llst.push( l );
					dobj.setWithWorker( "current", dlst.join());
					lobj.setWithWorker( "current", llst.join( "+"));
                    this.chat( "Linked " + ssa[ 3 ] + "-" + t, Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "API" );
				}	break;
				case "linkremove": {		// ChatMenu: linkRemove: NAC rowID: (T, NAC, or WPN): linked rowID to be removed.
					let dobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: this.charID, name: Earthdawn.buildPre( "NAC", ssa[ 2 ] ) + "LinkDisplay" }),
						lobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: this.charID, name: Earthdawn.buildPre( "NAC", ssa[ 2 ] ) + "Linked" });
					let dlst = dobj.get( "current" ),
						llst = lobj.get( "current" ),
						done = 0;
					llst = (llst === "(0)") ? [] : llst.replace( /\)\+\(/g, "),(").split( "," );
					dlst = dlst.split( "," ); 
					if( llst.length != dlst.length ) {
						this.chat( "Warning! internal data mismatch is linkRemove.", Earthdawn.whoFrom.apierror); 
						log( dlst);
						log( llst);
						llst = [];
						dlst = [];
					}
					for( let i = llst.length - 1; i > -1; --i )
						if(( ssa[ 3 ] === "Attribute" && ssa[ 4 ] === dlst[ i ] ) || ( llst[ i ].indexOf( "_" + ssa[ 4 ] + "_" ) > 0 )) {
							llst.splice( i, 1);
							dlst.splice( i, 1);
							++done;
						}
					dobj.setWithWorker( "current", dlst.join());
					lobj.setWithWorker( "current", llst.length ? llst.join( "+") : "(0)");
                    this.chat( done + " links removed.", Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "API" );
				}	break;
				case "mask": {		// ChatMenu: Mask
									// give a button for each mask present, allowing that mask to be removed.
					addCharID( "Add Mask", "Mask: Add: ?{Name of Mask}: ?{Paste the entire Mask text block into here}",
								"Use this button to add a Mask Template to this character. You will need to paste the template text block." );
					lst = getAttrByName( this.charID, "MaskList" );
					if( lst.length < 2 )
						lst = "";		// strip out any remnant that was put here.
					if( lst )
						lst = lst.split( "," );
					if( !lst || lst.length == 0 )
						s += "Existing Masks: None.";
					else for( let i = 0; i < lst.length; ++i ) {
						s += "Remove ";
						addCharID( lst[ i ].trim(), "Mask: Remove: " + lst[ i ].trim(), "Remove this Mask Template from this character." );
					}
					this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "API" );
				}	break;
				case "skills": {
					let s1 = [], s2 = [], s3 = [];
					lst = this.getUniqueChars( 1 );
					for( let k in lst ) {
						id = k; 
                                        // go through all attributes for this character and look for ones we are interested in
                        var attributes = findObjs({ _type: "attribute", _characterid: id });
                        _.each( attributes, function (att) {
                            if (att.get("name").endsWith( "_SK_CombatSlot" )) {
								if( att.get("current") != "1" )
									s1.push( { a: Earthdawn.getAttrBN( id, Earthdawn.buildPre( "SK", att.get("name"))  + "Name", ""), 
											b: "!Earthdawn~ charID:" + id + "~ Target: " + Earthdawn.getAttrBN( id, Earthdawn.buildPre( "SK", att.get("name") ) + "Target", "None" )
											+ "~ foreach: sct~Action: SK: " + Earthdawn.repeatSection( 2, att.get("name")) + ": ?{Modification|0}", 
											c: Earthdawn.getAttrBN( id, Earthdawn.buildPre( att.get("name") ) + "SuccessText", "" ) });
							} else if (att.get("name").endsWith( "_SKK_Name" )) {
								s2.push( { a: Earthdawn.getAttrBN( id, Earthdawn.buildPre( "SKK", att.get("name") ) + "Name", ""), 
										b: "!Earthdawn~ charID:" + id + "~ foreach: sct~ Action: SKK: " + a[2] + ": ?{Modification|0}" });
							} else if (att.get("name").endsWith( "_SKA_Name" ))
								s3.push( { a: Earthdawn.getAttrBN( id, Earthdawn.buildPre( "SKA", att.get("name") ) + "Name", ""), 
										b: "!Earthdawn~ charID:" + id + "~ foreach: sct~ Action: SKA: " + Earthdawn.repeatSection( 2, att.get("name")) + ": ?{Modification|0}" });
                        }); // End for each attribute.
						for( let j = 0; j < s1.length; ++j )
							s += edParse.makeButton( s1[j].a, s1[j].b, s1[j].c, "green", "White");
						for( let j = 0; j < s2.length; ++j )
							s += edParse.makeButton( s2[j].a, s2[j].b, null, "limegreen", "Black" );
						for( let j = 0; j < s3.length; ++j )
							s += edParse.makeButton( s3[j].a, s3[j].b, null, "lawngreen", "Black" );

						s += edParse.makeButton( "Languages", "!Earthdawn~ foreach: st: tuc~ chatmenu: languages", null, "lightskyblue", "Black" );
						this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, getAttrByName( id, "character_name" ) + " - Skills" );
					}
				}	break;
				case "spells": {
					function addItemSpell( label, item, tip ) {
						s += edParse.makeButton( label, 
									"!Earthdawn~ Target: " + item + "~ foreach: st~ TargetMod: Adjust-TN-Total~ Value: SP-Spellcasting-Step~ Roll: ?{Modification|0}", 
									tip, "blanchedalmond", "black" );
					}
					lst = this.getUniqueChars( 1 );
					if ( _.size( lst) === 1 )
						for( let k in lst ) {
							id = k; 
						}
					s += this.makeButton( buildLabel("Patterncraft", "SP-Patterncraft-Step"), 
								"!Earthdawn~ Target: Ask: ?{Target Number|0}~ foreach: st~ Value: SP-Patterncraft-Step~ Roll: ?{Modification|0}", 
								null , "blanchedalmond", "black" );

                    if( edParse.getValue("SP-Elementalist", id) == "1") 
						addItemValue( buildLabel("Elementalism", "SP-Elementalism-Step"), "SP-Elementalism-Step", null, "antiquewhite" );
                    if( edParse.getValue("SP-Illusionist", id) == "1") 
						addItemValue( buildLabel("Illusionism", "SP-Illusionism-Step"), "SP-Illusionism-Step", null, "antiquewhite" );
                    if( edParse.getValue("SP-Nethermancer", id) == "1") 
						addItemValue( buildLabel("Nethermancy", "SP-Nethermancy-Step"), "SP-Nethermancy-Step", null, "antiquewhite" );
                    if( edParse.getValue("SP-Wizard", id) == "1") 
						addItemValue( buildLabel("Wizardry", "SP-Wizardry-Step"), "SP-Wizardry-Step", null, "antiquewhite" );

					addItemValue( buildLabel("Spellcast", "SP-Spellcasting-Step"), "SP-Spellcasting-Step", "Make a spellcasting test. Do not target a specific token.", "blanchedalmond" );
					addItemSpell( "Spell-MD",   "MD", "Make a spellcasting test against one targets Mystic Defense." );
					addItemSpell( "​Spell-hMD",  "MDh", "Make a spellcasting test against the highest Mystic Defense among all the targets. " );
					addItemSpell( "Spell-hMD+", "MDhp1p", "Make a spellcasting test against the highest Mystic Defense among all the targets, plus one for each additional target." );
					addItemSpell( "​Spell-MD-Nat","MD-Nat", "Make a spellcasting test against the Natural Mystic Defense of the targets. " );

					s += this.makeButton( buildLabel("WillEfct-No A", "Will-Effect"), "!Earthdawn~ armortype: None~ foreach: st~ Value: Will-Effect~ Roll: ?{Modification|0}", 
								"Will Effect - NO Armor applies.", "antiquewhite", "black" );
					s += this.makeButton( "WillEfct-PA", "!Earthdawn~ armortype: PA~ foreach: st~ Value: Will-Effect~ Roll: ?{Modification|0}", 
								"Will Effect - Physical Armor applies.", "antiquewhite", "black" );
					s += this.makeButton( "WillEfct-MA", "!Earthdawn~ armortype: MA~ foreach: st~ Value: Will-Effect~ Roll: ?{Modification|0}", 
								"Will Effect - Mystic Armor applies.", "antiquewhite", "black" );

					lst = this.getUniqueChars( 1 );
					for( let k in lst ) {
						id = k; 
                                        // go through all attributes for this character and look for ones we are interested in  (CombatSlot items already have token actions).
                        var attributes = findObjs({ _type: "attribute", _characterid: id });
                        _.each( attributes, function (att) {
                            if (att.get("name").endsWith( "_SPM_Contains" ))
								s += edParse.makeButton( att.get("current"), "!Earthdawn~ " + Earthdawn.percent() + "{" + id + "|" 
											+ Earthdawn.buildPre( "SPM", att.get("name") ) + "Cast_R}", 
											Earthdawn.getAttrBN( id, Earthdawn.buildPre( "SPM", att.get("name") ) + "SuccessText", "" ), "khaki", "black" );
                        }); // End for each attribute.
					}
                    this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "Spells" );
				}	break;
				case "status": {
					function buildLabelStatus( mi, markers ) {
						let label = mi["prompt"],
							bset = (markers.indexOf( "," + mi[ "icon" ] + ",") != -1),
							vset = (markers.indexOf( "," + mi[ "icon" ] + "@") != -1);
						basic = false;
						if( !bset && !vset)		// this icon is not set on the token - just use label
						{
							basic = true;
							return label;
						}
						else if ( mi["submenu"] === undefined )		// There is no submenu, so it is a boolean toggel that is on.
							return label;
						else if( mi["code"] === "health" ) {		// Health is special case that needs to be hardcoded as it uses two icons.
							if( markers.indexOf( "," + "skull" + ",") != -1 )
								return label + "-Dying";
							else
								return label + "-Unconscious";
						} else {		// The icon is set on the token, and there is a submenu.  Figure out what the submenu item is that is set.
							let res = markers.match( new RegExp( "," + mi["icon"] + "@\\d" ) );
							if( res === null ) 
								return label;
							let badge = res[0].slice(-1),
								badge2 = String.fromCharCode( badge.charCodeAt( 0 ) + 48 ),		// This should translate 1, 2, 3, etc into a, b, c, etc.
								t = mi["submenu"],
								res2 = t.match( new RegExp( "\\|[\\w\\s]+,\\[\\d\\^" + badge2 ) );
							if( res2 === null )
								return label + "-" + badge;
							else
								return label + " - " + Earthdawn.getParam( res2[0], 1, "," ).slice( 1 ).trim(); 
						}
					}

					lst = this.getUniqueChars( 2 );
					var markers = ",,";

					if ( lst.length > 0 ) {
						id = lst[0].token;		// Use first token as template
						var TokObj = getObj("graphic", id); 
						markers = "," + TokObj.get( "statusmarkers" ) + ",";
					}
					this.GetStatusMarkerCollection();
					_.each( edParse.StatusMarkerCollection, function( menuItem ) {
						let sm = menuItem["submenu"];
										// If there is no submenu, toggle the current value from set to unset or visa versa.
										// If there is a submenu, but it just asks for a numeric value ( no [n^a] structure ), prefix the  value with a "z".
										// Otherwise, strip the [n^a] structure of everything except the alpha bit.
						s += edParse.makeButton( buildLabelStatus( menuItem, markers ), 
								"!Earthdawn~ foreach: st~ marker : " + menuItem["code"] 
								+ ((sm === undefined) ? ":t" : (( sm.indexOf( "^" ) === -1) ? ":z" + sm : ":" + sm.replace(/\[([\w\-]+)\^([\w\-]+)\]/g, "$2"))), 
								null, basic ? "cyan": "lightskyblue", "black" );
					});
                    this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "Status" );
				}	break;
				case "talents-non": {			// Talents and Knacks that are not Token Actions.
					lst = this.getUniqueChars( 1 );
					for( let k in lst ) {
						id = k; 
						s = "";
                                        // go through all attributes for this character and look for ones we are interested in (CombatSlot items already have token actions).
                        let attributes = findObjs({ _type: "attribute", _characterid: id });
                        _.each( attributes, function (att) {
                            if (att.get("name").endsWith( "_T_CombatSlot" ) || att.get("name").endsWith( "_NAC_CombatSlot"))
								if( att.get("current") != "1" )
									s += edParse.makeButton( Earthdawn.getAttrBN( id, Earthdawn.buildPre( att.get("name") ) + "Name", ""), 
											"!Earthdawn~ charID:" + id + "~ Target: " + Earthdawn.getAttrBN( id, Earthdawn.buildPre( att.get("name") ) + "Target", "None" ) + 
											"~ foreach: sct:c~ Action: " + Earthdawn.repeatSection( 3, att.get("name")) + ": " + Earthdawn.repeatSection( 2, att.get("name")) 
											+ ": ?{Modification|0}", Earthdawn.getAttrBN( id, Earthdawn.buildPre( att.get("name") ) + "SuccessText", "" ),
											(Earthdawn.repeatSection( 3, att.get("name")) === "T") ? "aquamarine" : "aqua", "Black" );
                        }); // End for each attribute.
						this.chat( s.trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, 
								getAttrByName( id, "character_name" ) + " - Talents Non-combat" );
					}
				}	break;
				case "oppmnvr":	{	// Opponent Maneuverer.		Here we are just displaying a list of buttons that are possible. 
					let t="";		// Input string is "!Earthdawn~ chatmenu: oppmnvr: SetToken/CharID: id: target ID
					function makeButton( txt, lnk, lnk2, tip ) {
						ssa.splice( 0, 2, "OpponentManoeuvre", lnk);
						let tssa = "!Earthdawn~ " + ssa.join( ":") + ((lnk2) ? lnk2 : "");
						t += edParse.makeButton( txt, tssa, tip );
					};

					let sectplayer = new HtmlBuilder( "", "", {
							style: {
							"background-color": "white",
							"border": "solid 1px black",
							"border-radius": "5px",
							"overflow": "hidden",
							"width": "100%",
							"text-align": 	"left"
						}});

					makeButton( "Clip the Wing", "ClipTheWing", undefined,
						"The attacker may spend two additional successes from an Attack test to remove the creature’s ability to fly until the end of the next round. If the attack causes a Wound, the creature cannot fly until the Wound is healed. If the creature is in flight, it falls and suffers falling damage for half the distance fallen." );
					makeButton( "Crack the Shell", "CrackTheShell", ": ?{How many successes to spend Cracking the Shell|1}",
						"The attacker may spend extra successes from physical attacks (not spells) to reduce the creature’s Physical Armor by 1 per success spent. This reduction takes place after damage is assessed, and lasts until the end of combat." );
					makeButton( "Defang", "Defang", ": ?{How many successes to spend Defanging|1}",
						"The opponent may spend additional successes to affect the creature’s ability to use its poison. Each success spent reduces the Poison’s Step by 2. If the attack causes a Wound, the creature cannot use its Poison power at all until the Wound is healed." );
					makeButton( "Enrage", "Enrage", ": ?{How many successes to spend Enraging|1}",
						"An opponent may spend additional successes from an Attack test to give a -1 penalty to the creature’s Attack tests and Physical Defense until the end of the next round. Multiple successes may be spent for a cumulative effect." );
					makeButton( "Provoke", "Provoke", undefined,
						"The attacker may spend two additional successes from an Attack test to enrage the creature and guarantee he will be the sole target of the creature’s next set of attacks. Only the most recent application of this maneuver has any effect." );
					makeButton( "Pry Loose", "PryLoose", ": ?{How many successes to spend Prying Loose|1}",
						"The attacker may spend additional successes from an Attack test to allow a grappled ally to immediately make an escape attempt with a +2 bonus per success spent on this maneuver." );
					let cID = Earthdawn.tokToChar( ssa[ 2 ] );
					let oflags = getAttrByName( cID, "CreatureFlags" );
					if (oflags & Earthdawn.flagsCreature.OpponentCustom1)
						makeButton( getAttrByName( cID, "Opponent-Custom1Name"), "oCustom1", ": ?{How many successes to spend on this maneuver|1}", getAttrByName( cID, "Opponent-Custom1Desc") );
					if (oflags & Earthdawn.flagsCreature.OpponentCustom2)
						makeButton( getAttrByName( cID, "Opponent-Custom2Name"), "oCustom2", ": ?{How many successes to spend on this maneuver|1}", getAttrByName( cID, "Opponent-Custom2Desc") );
					if (oflags & Earthdawn.flagsCreature.OpponentCustom3)
						makeButton( getAttrByName( cID, "Opponent-Custom3Name"), "oCustom3", ": ?{How many successes to spend on this maneuver|1}", getAttrByName( cID, "Opponent-Custom3Desc") );
					sectplayer.append( "", t);
					this.chat( sectplayer.toString(), Earthdawn.whoTo.player | Earthdawn.whoFrom.player | Earthdawn.whoFrom.character | Earthdawn.whoFrom.noArchive);
				}	break;
				default: 
					log( "edParse.ChatMenu() Illegal ssa. " );
					log( ssa );
				}
            } catch(err) {
                log( "edParse.ChatMenu() error caught: " + err );
            }   // end catch
            return false;
        } // End ChatMenu()




                    // ParseObj.CreaturePower ( ssa )
					// user has pressed button to spend successes activating a creaturepower. 
					// ssa[0]:
					//		CreaturePower: Name of Power: Target ID
					//		OpponentManoeuvre: Name of Power: Target ID: [Optional] number of hits.
        this.CreaturePower = function( ssa )  {
            'use strict';

            try {
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
					case "cCustom1":
						this.chat( getAttrByName( this.charID, "Creature-Custom1Desc"), Earthdawn.whoFrom.noArchive );
						break;
					case "cCustom2":
						this.chat( getAttrByName( this.charID, "Creature-Custom2Desc"), Earthdawn.whoFrom.noArchive );
						break;
					case "cCustom3":
						this.chat( getAttrByName( this.charID, "Creature-Custom3Desc"), Earthdawn.whoFrom.noArchive );
						break;
					default: 
						log( "CreaturePower had illegal ssa[1]" );
						log( ssa );
					}
					break;
				case "OpponentManoeuvre":
					let cID = Earthdawn.tokToChar( ssa[ 2 ] );
					let oflags = getAttrByName( cID, "CreatureFlags" );

					switch (ssa[ 1 ] ) {
					case "ClipTheWing":
						if( oflags & Earthdawn.flagsCreature.ClipTheWing ) 
							this.chat( "Two successes spent Clipping the Wing. Creature can not fly until the end of next round. If flying, creature falls. If wound, can't fly until heal it.", Earthdawn.whoFrom.noArchive );
						else	this.chat( "You can/'t Clip the Wing of this opponent.", Earthdawn.whoFrom.noArchive );
						break;
					case "CrackTheShell":
						if( oflags & Earthdawn.flagsCreature.CrackTheShell ) 
							this.chat( ssa[3] + " successes spent Cracking the Shell. This is not automated yet. Remember to manually add bonus damage to all damage effects after this one to represent reduced armor. IE: if you cracked the shell three times, then on all damage tests after the current one, you would roll damage as normal, but apply +3 to the result when applying damage.", Earthdawn.whoFrom.noArchive );
						else	this.chat( "You can't Crack the Shell of this opponent.", Earthdawn.whoFrom.noArchive );
						break;
					case "Defang":
						if( oflags & Earthdawn.flagsCreature.Defang ) 
							this.chat( ssa[3] + " successes spent Defanging. Each one is -2 to Poison steps. If Wound then creature can't use Poison at all.", Earthdawn.whoFrom.noArchive );
						else	this.chat( "You can't defang this opponent.", Earthdawn.whoFrom.noArchive );
						break;
					case "Enrage":
						if( oflags & Earthdawn.flagsCreature.Enrage ) 
							this.chat( ssa[3] + " successes spent Enraging. Each one is -1 to Attack tests and PD until the end of next round.", Earthdawn.whoFrom.noArchive );
						else	this.chat( "You can't Enrage this opponent.", Earthdawn.whoFrom.noArchive );
						break;
					case "Provoke":
						if( oflags & Earthdawn.flagsCreature.Provoke ) 
							this.chat( "Two successes spent Provoking. This creature will not attack anybody but you for it's next set of attacks.", Earthdawn.whoFrom.noArchive );
						else	this.chat( "You can't provoke this opponent.", Earthdawn.whoFrom.noArchive );
						break;
					case "PryLoose":
						if( oflags & Earthdawn.flagsCreature.PryLoose ) 
							this.chat( ssa[3] + " successes spent Prying Loose. A Grappled ally may make an immediate escape attempt at +2 per.", Earthdawn.whoFrom.noArchive );
						else	this.chat( "You can't pry anybody loose from this opponent.", Earthdawn.whoFrom.noArchive );
						break;
					case "oCustom1":
						if( (oflags & Earthdawn.flagsCreature.OpponentCustom1) && getAttrByName( cID, "Opponent-Custom1Show") == "1") 
							this.chat( ssa[3] + " successes spent on " + getAttrByName( cID, "Opponent-Custom1Name") + ". "+ getAttrByName( cID, "Opponent-Custom1Desc"), Earthdawn.whoFrom.noArchive );
						else	this.chat( "You can't do Opponent Custom Maneuver 1 to this opponent", Earthdawn.whoFrom.noArchive );
						break;
					case "oCustom2":
						if( (oflags & Earthdawn.flagsCreature.OpponentCustom2) && getAttrByName( cID, "Opponent-Custom2Show") == "1") 
							this.chat( ssa[3] + " successes spent on " + getAttrByName( cID, "Opponent-Custom2Name") + ". "+ getAttrByName( cID, "Opponent-Custom2Desc"), Earthdawn.whoFrom.noArchive );
						else	this.chat( "You can't do Opponent Custom Maneuver 2 to this opponent", Earthdawn.whoFrom.noArchive );
						break;
					case "oCustom3":
						if( (oflags & Earthdawn.flagsCreature.OpponentCustom3) && getAttrByName( cID, "Opponent-Custom3Show") == "1") 
							this.chat( ssa[3] + " successes spent on " + getAttrByName( cID, "Opponent-Custom3Name") + ". "+ getAttrByName( cID, "Opponent-Custom3Desc"), Earthdawn.whoFrom.noArchive );
						else	this.chat( "You can't do Opponent Custom Maneuver 3 to this opponent", Earthdawn.whoFrom.noArchive );
						break;
					default: 
						log( "Opponent Maneuverer had illegal ssa[1]" );
						log( ssa );
					}
					break;
				default: 
					log( "CreaturePower had illegal ssa[0]" );
					log( ssa );
				}
            } catch(err) {
                log( "edParse.CreaturePower() error caught: " + err );
            }   // end catch
        } // End CreaturePower()



					// This routine is passed a roll result. If this.misc.CursedLuck has been set, Curse the dice as per the horror power.
					// This routine also calculates and does 
					//		noPileonDice: If this is set in state, then no individual die will explode more than this many times.
					//		noPileonStep: If this is set in state, then the total roll result will not be very much greater than this multiple of the step number. 
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

//log( roll);
								// The Cursed Luck horror power has been used. Find The highest dice rolled, and replace them with 1's. 
				while ( "CursedLuck" in this.misc && curse-- > 0 ) {
					let highVal = -1,
						highi,
						highj, highjEnd,
						resMod,
						rollCopy = JSON.parse( JSON.stringify( roll ) ),			// We want a brand new copy of this, so turn it into a string and back into an object. 
						working = rollCopy;			// working and rollCopy will point to the same underlying data structure, but they will point to different PARTS of the structure. ie: working will only point to subgroups within the main working structure. 

					while ( working[ "type" ] === "V" )			// Skip through these 
						working = working[ "rolls" ];
					while ( working[0][ "type" ] === "G" )		// Skip through these groups.
						working = working[0][ "rolls" ][0];
					for( let i = 0; i < working.length; ++i) {
						let r = working[ i ];
						switch ( r[ "type" ] ) {
						case "R":
							if( "results" in r )
								for( let j = 0; j < r[ "results" ].length; ++j )
									if( "v" in r[ "results" ][ j ] ) {
										let v = r[ "results" ][ j ][ "v" ];
										if( v > highVal || (v == highVal && r[ "sides" ] == v)) {		// Gives highest value, In case of a tie it favors dice that will explode. If still tied, takes first non-exploding dice or last rolled exploding dice.
											highVal = v;
											resMod = v;
											highi = i;
											highj = j;
											if( ( "mods" in r) && ( "exploding" in r[ "mods" ]))
												while( r[ "sides" ] == v && ++j < r[ "results" ].length )
													resMod += r[ "results" ][ j ][ "v" ];			// skip through any dice that are just explosions of this one.
											highjEnd = j;
										}
									}
							break;
						case "M":
							break;
						default:
							log( "Error in ED.CursedLuck(). Unknown type '" + r[ "type" ] + "' in rolls " + i + ". Complete roll is ..." );
							log( rolls );
						}
					}

					if( highVal > 1 ) {							// Then curse that dice. Which is to say, replace the high roll and all dice that exploded from it with a 1.
						let r = working[ highi ];
						r[ "results" ].splice( highj, highjEnd + 1 - highj, { v: 1});
						rollCopy[ "total" ] = rollCopy[ "total" ] + 1 - resMod;
					}
					roll = rollCopy;
					stuffDone |= 0x04;
				} // end cursed luck

				if( getAttrByName( this.charID, "NPC") > 0 ) {			// Pile-on prevention is only done on NPC dice rolls. PCs can pile on all they want. 
											// Pile on prevention. Dice explosion method. Dice are only allowed to explode so many times (maybe zero times, maybe more).
											// Find occurrences of when the dice exploded too many times, and remove the excess. 
					if( state.Earthdawn.noPileonDice != undefined && state.Earthdawn.noPileonDice >= 0) {
						let rollCopy = JSON.parse( JSON.stringify( roll ) ),			// We want a brand new copy of this, so turn it into a string and back into an object. 
							working = rollCopy;			// working and rollCopy will point to the same underlying data structure, but they will point to different PARTS of the structure. ie: working will only point to subgroups within the main working structure. 

						while ( working[ "type" ] === "V" )			// Skip through these 
							working = working[ "rolls" ];
						while ( working[0][ "type" ] === "G" )		// Skip through these groups.
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
											if( r[ "sides" ] == v) {					// explosion
												if( ++expcount > state.Earthdawn.noPileonDice ) {
													resMod += v;
													if( piled === undefined )
														piled = j;
												}
											} else {				// not explosion
												if( piled !== undefined ) {
													r[ "results" ].splice( piled, j - piled );
													rollCopy[ "total" ] -= resMod;
													resMod = 0;
													j = piled;
													piled = undefined;
													stuffDone |= 0x02;
												}
												expcount = 0;
											}
										}
								break;
							case "M":
								break;
							default:
								log( "Error in ED.CursedLuck(). Unknown type '" + r[ "type" ] + "' in rolls " + i + ". Complete roll is ..." );
								log( rolls );
							}
						}
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
							rollCopy = JSON.parse( JSON.stringify( roll ) ),			// We want a brand new copy of this, so turn it into a string and back into an object. 
							working = rollCopy;			// working and rollCopy will point to the same underlying data structure, but they will point to different PARTS of the structure. ie: working will only point to subgroups within the main working structure. 

						while ( working[ "type" ] === "V" )			// Skip through these 
							working = working[ "rolls" ];
						while ( working[0][ "type" ] === "G" )		// Skip through these groups.
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
											if( v > highVal	&& (roll[ "total" ] - v) >= ( state.Earthdawn.noPileonStep * this.misc[ "effectiveStep" ] )) {
												highVal = v;
												resMod = v;
												exploding = (r[ "sides" ] == v);
												highi = i;
												highj = j;
											}
										}
								break;
							case "M":
								break;
							default:
								log( "Error in ED.CursedLuck(). Unknown type '" + r[ "type" ] + "' in rolls " + i + ". Complete roll is ..." );
								log( rolls );
							}
						}

						if( highVal > 3 ) {							// Remove or reduce this dice.
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
            } catch(err) {
                log( "edParse.CursedLuck() error caught: " + err );
            }   // end catch
        } // End CursedLuck()



                    // ParseObj.Damage ( ssa )
                    // Apply Damage to Token/Char specified in tokenInfo.
                    // ssa is an array that holds the parameters.
                    //      0 - (optional) Damage, Strain, or Recovery;
                    //      1 - Armor Mods: NA = No Armor, PA = subtract Physical Armor before applying damage, MA = Mental Armor. PA-Nat, MA-Nat.
                    //      2 - Damage:      Amount of damage to apply
        this.Damage = function( ssa )  {
            'use strict';

            try {
                if( ssa.length < 3 ) {
                    this.chat( "Error! Not enough arguments passed for Damage() command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror ); 
                    return;
                }
                if( this.tokenInfo === undefined ) {
                    this.chat( "Error! tokenInfo undefined in Damage() command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror); 
                    return;
                }
                var bToken = ( this.tokenInfo.type === "token" );           // We have both a token and a character object.
                ssa[1] = ssa[1].toUpperCase();
                var armor = 0,
					armorType = "";
				switch ( ssa[ 1 ] ) {
					case "PA":
						armor = getAttrByName( this.charID, "Physical-Armor" ) || 0;
						armorType = " Physical";
						break;
					case "PA-NAT":
						armor = getAttrByName( this.charID, "PA-Nat" ) || 0;
						armorType = " Natural Physical";
						break;
					case "MA":
						armor = getAttrByName( this.charID, "Mystic-Armor" ) || 0;
						armorType = " Mystic";
						break;
					case "MA-NAT":
						armor = getAttrByName( this.charID, "MA-Nat" ) || 0;
						armorType = " Natural Mystic";
						break;
				}
				if( armor < 1 )
					armorType = "";
                var dmg = this.ssaMods(ssa, 2 );
                if( dmg <= 0 && ssa[ 0 ] !== "Recovery" )
                    return;         // If the passed damage evaluates to zero, just exit.
                dmg -= armor;
                if( dmg <= 0 && ssa[ 0 ] !== "Recovery") {
                    this.chat( "Attack glances off of " + this.tokenInfo.name +"'s" + armorType + " Armor." ); 
                    return;
                }

				var newMsg = "";
				if( ssa[0].toLowerCase().startsWith( "s" )) {		// Strain
					if( ssa[0].toLowerCase() !== "strainsilent" )
						this.misc[ "strain" ] = dmg;
				} else if (armor < 1 ) {		// No armor 
					newMsg = this.tokenInfo.name + " took " + dmg + " " + ssa[0].toLowerCase();
				} else if ( getAttrByName( this.charID, "NPC") == "0" ) {		// PC
					newMsg = this.tokenInfo.name + " took " + dmg + " " + ssa[0].toLowerCase() + " above" + armorType + " armor";
				} else { 	// NPC
					newMsg = this.tokenInfo.name + "'s" + armorType + " armor absorbs ";
					if( dmg < armor )
						newMsg += "most";
					else if ( dmg <= (armor * 2))
						newMsg += "some";
					else 
						newMsg += "little";
					newMsg += " of the damage";
				}

                if( bToken ) {
                    var currDmg = parseInt( this.tokenInfo.tokenObj.get( "bar3_value" ) || 0);
					if( isNaN( currDmg ) )
						currDmg = dmg;
					else
						currDmg += dmg;
					if( ssa[ 0 ] === "Recovery" && currDmg < 0 ) {
						this.chat( this.tokenInfo.name + " only needed " + ((dmg - currDmg) * -1) + " to restore to full health." );
						currDmg = Math.max( 0, currDmg);
					}
                    this.tokenInfo.tokenObj.set( "bar3_value", currDmg );
                } else {
                    var attribute = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "Damage" }, 0);
                    var currDmg = parseInt(attribute.get( "current" )) || 0;
                    currDmg += dmg;
					if( ssa[ 0 ] === "Recovery" && currDmg < 0 ) {
						this.chat( this.tokenInfo.name + " only needed " + ((dmg - currDmg) * -1) + " to restore to full health." );
						currDmg = Math.max( 0, currDmg);
					}
                    attribute.setWithWorker( "current", currDmg );
                }
                var WoundThreshold = getAttrByName( this.charID, "Wound-Threshold" ) || 0;
                if( dmg >= WoundThreshold ) {
                    if( bToken ) {
                        var currWound = parseInt( this.tokenInfo.tokenObj.get( "bar2_value" ) || 0);
						if( isNaN( currWound ) )
							currWound = 1;
						else
							currWound += 1;
                        this.tokenInfo.tokenObj.set( "bar2_value", currWound );
                    } else {
                        attribute = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "Wounds" }, 0);
                        var currWound = parseInt(attribute.get( "current" ) || 0);
                        currWound += 1;
                        attribute.setWithWorker( "current", currWound );
                    }
                    newMsg += ". Takes wound " + currWound;
                } // end wound
                if( currDmg >= ( getAttrByName( this.charID, "Damage-Death-Rating" ) || 0)) {
                    newMsg += ". Character is DEAD";
					this.MarkerSet( ["", "Health", "a"] );
                } else if( currDmg >= ( getAttrByName( this.charID, "Damage", "max" ) || 0)) {
                    newMsg += ". Character is Unconscious";
					this.MarkerSet( ["", "Health", "s"] );
                } else if( dmg >= (WoundThreshold + 5))
                    newMsg += ".  Need to make a Knockdown test TN " + ( dmg - WoundThreshold );
				if( ssa[ 0 ] !== "Recovery" && newMsg.length > 0)
					this.chat( newMsg + "." ); 
            } catch(err) {
                log( "ED.Damage() error caught: " + err );
            }   // end catch
        } // End ParseObj.Damage() ssa )



                    // ParseObj.Debug()
                    // This is a collection of test or diagnostic commands. 
					//
					// Most are probably invoked from the "Special Function" drop-down and button on the Adjustments page. 
        this.Debug = function( ssa )  {
            'use strict';

            try {
				switch ( ssa[ 1 ].toLowerCase() ) {
				case "inspect":            // This is test code that lets me see info on tokens and/or characters.
log( ssa);
					switch( ssa[ 2 ].toLowerCase() ) {
						case "getids": {				// Given a text fragment. Look in every attribute that ends in "_Name" to see if it contains the fragment.
														// go through all attributes for this character and look for ones we are interested in
							let attributes = findObjs({ _type: "attribute", _characterid: this.charID }),
								po = this;
							_.each( attributes, function (att) {
								if (att.get("name").endsWith( "_Name" ) && att.get( "current" ).indexOf( ssa[ 3 ] ) != -1 )
									po.chat( getAttrByName( po.charID, "character_name" ) + " " + "CharID: " + po.charID + "   " + att.get( "name" ) + ":   " + att.get( "current" ), 
											Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "Inspect" );
							}); // End for each attribute.
						}	break;
						case "getvalue":			// Given an attribute name, give the value of the attribute.
							this.chat( getAttrByName( this.charID, "character_name" ) + " " + ssa[ 3 ] + ": " + getAttrByName( this.charID, ssa[ 3 ]), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "Inspect" );
							break;
						case "objectid": {			// Given an Object ID. Show what type of object it is and it's name. 
							let po = this,
								objs = findObjs({ _id: ssa[ 3 ] });
							_.each(objs, function(obj) {
								let typ = obj.get( "type" );
								let name = obj.get( "name" );
								if( typ )
									if( name )
										po.chat( "Type: " + typ + "\nName: " + name, Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "Inspect" );
									else
										po.chat( "Type: " + typ, Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "Inspect" );
								po.chat( JSON.stringify( obj ), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "Inspect" );
							});
						}	break;
						case "repeatsection": {		// Given a character ID (defaulting to current character) and a repeating section ID. show what it is for. 
							let po = this;

							function checkRepeat() {
								for( let i = 1; i < arguments.length; ++i ) {
									let aobj = findObjs({ _type: 'attribute', _characterid: po.charID, name: arguments[ 0 ] + arguments[ i ] })[0];
									if ( aobj != undefined )
										po.chat( JSON.stringify( aobj ), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "Inspect" );
								}
							};
							checkRepeat( Earthdawn.buildPre( "DSP", ssa[3] ), "Code", "Name", "Circle" );
							checkRepeat( Earthdawn.buildPre( "T", ssa[3] ), "Name", "Step" );
							checkRepeat( Earthdawn.buildPre( "NAC", ssa[3] ), "Name", "Step" );
							checkRepeat( Earthdawn.buildPre( "SK", ssa[3] ), "Name", "Step" );
							checkRepeat( Earthdawn.buildPre( "SKK", ssa[3] ), "Name" );
							checkRepeat( Earthdawn.buildPre( "SKA", ssa[3] ), "Name" );
							checkRepeat( Earthdawn.buildPre( "SKL", ssa[3] ), "SKL_Name" );
							checkRepeat( Earthdawn.buildPre( "SPM", ssa[3] ), "Type", "Origin", "Contains" );
							checkRepeat( Earthdawn.buildPre( "SP", ssa[3] ), "Name", "Circle", "Discipline" );
							checkRepeat( Earthdawn.buildPre( "WPN", ssa[3] ), "Name" );
							checkRepeat( Earthdawn.buildPre( "MNT", ssa[3] ), "Name" );
							checkRepeat( Earthdawn.buildPre( "TI", ssa[3] ), "Name" );
						}	break;
						case "statusmarkers":		// Show status markers of selected tokens. 
							this.chat( this.tokenInfo.tokenObj.get( "statusmarkers" ), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "Inspect" );
							this.chat( "psuedoToken: " + getAttrByName( this.charID, "psuedoToken"), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "Inspect" );
							break;
						case "tokenobj":			// Show tokenInfo for selected tokens. 
							if ( this.tokenInfo ) {
							this.chat( "Type: " + this.tokenInfo[ "type" ]
									+ "\nName: " + this.tokenInfo[ "name" ]
									+ (("tokenObj" in this.tokenInfo) ? "\ntokenID: " + this.tokenInfo.tokenObj.get("id") + "\nToken" + JSON.stringify( this.tokenInfo.tokenObj ) : "")
									+ (("characterObj" in this.tokenInfo) ?  "\ncharID: " + this.tokenInfo.characterObj.get("id") + "\nChar" + JSON.stringify( this.tokenInfo.characterObj ) : ""), 
									Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "Inspect" );
							} else 
								this.chat( "tokenInfo undefined.", Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "Inspect" );
							break;
					}
				case "sheetworkertest":      // Do nothing (this function is done by sheet-worker)
					break;

				case "showeach":        // showeach is basically just debug code that lets me look inside of repeating sections. Show attributes that match the passed parameters.
					if( this.charID === undefined ) {
						this.chat( "Error! Trying ShowEach() when don't have a CharID.", Earthdawn.whoFrom.apierror); 
						return;
					} 
					let searchString = "CB2",			// Whatever you want to look for can be hard-coded here.
						searchString2 = undefined;

					if( ssa.length > 2 )
						if( ssa[ 2 ] !== "API" ) {
							searchString = ssa[ 2 ];
							if( ssa.length > 3 )
								searchString2 = ssa[ 3 ];
					}
                            // Go through all attributes for this character and look for ones that have the search strings
					var attributes = findObjs({ _type: "attribute", _characterid: this.charID });
					_.each( attributes, function (indexAttributes) {
						if ( indexAttributes.get("name").indexOf( searchString ) > -1 ) 
							if (( searchString2 === undefined ) || (indexAttributes.get("name").indexOf( searchString2 ) > -1 ) ) {
								log( "Name: " + indexAttributes.get("name") + "   Val: " + indexAttributes.get("current") );
							}
					}); // End for each attribute.
					break;

				case "test": 		// This is just temporary test code. Try stuff out here and see if it works. 
					try {
//						this.charID = "-KFHMqGnoSEfqM6_6dYm";
//						log( getAttrByName(         this.charID, "repeating_spell_-kfhnhmgljt4-2v4iihp_SP_sThreads"));
//						log( Earthdawn.getAttrBN( this.charID, "repeating_spell_-kfhnhmgljt4-2v4iihp_SP_sThreads"));
						this.charID = "-LO1ZORHw6d3inxQHD-t";
//						log( getAttrByName(         this.charID, "repeating_spell_-lp4t-1gsu4yb3w0qdf6_s_SP_sThreads"));
//						log( Earthdawn.getAttrBN( this.charID, "repeating_spell_-lp4t-1gsu4yb3w0qdf6_s_SP_sThreads"));
						log( getAttrByName(         this.charID, "Damage"));
						log( Earthdawn.getAttrBN( 	this.charID, "Damage"));
						log( getAttrByName(         this.charID, "repeating_spell_-LP4T-1gsu4yb3W0qdf6_SP_sThreads"));
						log( Earthdawn.getAttrBN( this.charID, "repeating_spell_-LP4T-1gsu4yb3W0qdf6_SP_sThreads"));


//						this.charID = "-JvAdIYpXgVyt2yd07hv";
//						this.Parse( "Mask: Add: cxvxv: Deformed (No change) DEX: 0 Initiative: 0 Unconsciousness: +3 STR: +1 Physical Defense: -2 Death: +4 TOU: +1 Mystic Defense: -2 Wound: +1 PER: 0 Social Defense: -2 Knockdown: +1 WIL: 0 Physical Armor: +1 Recovery Tests: 0 CHA: -2 Mystic Armor: 0 Move: 0 Actions: 0; Attack +2 (Damage +2) Powers: Fury (+2): As the creature power, Gamemaster’s Guide, p. 251. Willful (+1): As the creature power, Gamemaster’s Guide, p. 251. Special Maneuvers: Enrage (Opponent): As the common maneuver, Gamemaster’s Guide, p. 252. Provoke (Opponent, Close Combat): As the common maneuver, Gamemaster’s Guide, p. 252." );

					} catch(err) {
						log( "edParse Test error caught: " + err );
					}
					log("Test Done");
					break;
				}
            } catch(err) {
                log( "ED.Debug() error caught: " + err );
            }   // end catch
        } // End ParseObj.Debug()




                    // If there are any commands that we saved to do later. Do them now. 
        this.doNow = function()  {
            'use strict';

            try {
				if( this.doLater !== "" ) {			// These are commands we did not want to do when we first saw them, and only want to do at the last moment.
					let ta = this.doLater.split( "~" );
					for( let i = 1; i < ta.length; ++i)
						this.Parse( ta[ i ] );
					this.doLater = "";
				}
            } catch(err) {
                log( "ED.doNow() error caught: " + err );
            }   // end catch
        } // End ParseObj.DoNow()



                    // ParseObj.ForEachToken ()
                    // For Each selected token, perform some command.
                    // ssa is an array that holds any modifiers for the ForEach command.  Look in the switch statement below for description of options.
        this.ForEachToken = function( ssa )  {
            'use strict';

            try {
				this.tokenIDs = [];
                var bst   = false,      // Do we want all selected tokens?
					bsct  = false,      // Do we want all selected character tokens?
					bust  = false,      // Do we want to look in unselected tokens if we can't find with the above?
					binmt = false,      // Do we want to ignore all selected tokens that do not match the character ID?
					btuc  = false,		// Token Unique Character - Ignore all except the first token for each unique character. 
					bc    = false,      // Do we want character (if found nothing else)?
					flag = 0,           // Instead of doing a ForEachToken loop:  1 - return a list of tokens.
					mooks = false,      // Do we want to ignore all selected non-mooks?
					notMooks = false,   // Do we want to ignore all selected mooks?
					PCs   = false,      // Do we want to ignore all selected NPCs?
					NPCs  = false,      // Do we want to ignore all selected PCs?
					notPCs = false,		// Do we want to ignore all selected non-PCs?
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
                    case "mooks":   	// Keep Mooks only. Ignore selected characters that are not mooks.
                    case "mook":
                        mooks = true;
                        break;
                    case "notmooks":   	// Keep PCs and NPCs that are not mooks. Ignore selected characters that are mooks. 
                    case "notmook":
                        notMooks = true;
                        break;
                    case "npcs":    	// Keep NPCs (including mooks) only. Ignore selected characters that are PCs.
                    case "npc":
                        NPCs = true;
                        break;
										// Note: Could add NpcNotMook here if needed. So far have not needed it. 
                    case "pcs":     	// Keep PCs only. Ignore selected characters that are NPCs or Mooks.
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
                    case "uc":							// Token unique character
                        btuc = true;					// NEEDS TO BE combined with some other directive such as st. Will give only one token for each selected character or mook.
                        break;
                    case "unselectedtokens":    // If you did not find any selected character tokens, look in the unselected tokens as well. 
                    case "ust":                 // Note that if you select this option WITHOUT st or sct, it will always find all character tokens, selected or not.
                        bust = true;
                        break;
                }   } // end ssa[1] switch

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

                if( bst || bsct || binmt )
                    _.each( this.edClass.msg.selected, function( sel ) {                // Check selected tokens
                        var TokObj = getObj("graphic", sel._id); 
                        if (typeof TokObj === 'undefined' )
                            return;
                        var cID = TokObj.get("represents"); 
						if( btuc ) {
							for( let i = 0; i < objarr.length; ++i )
								if( objarr[ i ]["characterObj"]["_id"] === cID )
									return;
						}
                        if( bst || (( edParse.charID !== undefined) && (cID === edParse.charID ))) {          // This will get all selected tokens on a token action, and all selected tokens that match this character on a sheet action.
                            var CharObj = getObj("character", cID); 
                            if (typeof CharObj === 'undefined') 
                                return;
							let npc = getAttrByName( cID, "NPC");
//                            if(( mooks && ( npc == "2" )) || ( notMooks && ( npc != "2" )) || ( NPCs && ( npc != "0" )) || ( PCs && ( npc == "0" ))) {
                            if(( !mooks || ( npc == "2" )) && ( !notMooks || ( npc != "2" )) && ( !NPCs || ( npc != "0" )) && ( !PCs || ( npc == "0" ))) {
                                var TokenName = TokObj.get("name"); 
                                if( TokenName.length < 1 )
                                    TokenName = CharObj.get("name");
								edParse.tokenIDs.push(sel._id);
                                objarr.push({ type: "token", name: TokenName, tokenObj: TokObj, characterObj: CharObj }); 
                            }
                        }
                    });  // End for each selected token

                if( this.charID !== undefined ) {        // If we did not find any of this character in the selected tokens, look for unselected tokens with this charID. 
                    if( bust && ((objarr.length || 0) < 1 )) {
                        var CharObj = getObj("character", this.charID);
                        if (typeof CharObj != 'undefined') {
                            var page = this.FindPageOfPlayer( this.edClass.msg.playerid );
                            var tkns = findObjs({ _pageid: page, _type: "graphic",  _subtype: "token", represents: this.charID });
                            _.each( tkns, function (TokObj) {                   // Check all tokens on the page.
								if( btuc && objarr.length > 0 )
									return;
                                var TokenName = TokObj.get("name"); 
                                if( TokenName.length < 1 )
                                    TokenName = CharObj.get("name");
								edParse.tokenIDs.push( TokObj.get("id") );
                                objarr.push({ type: "token", name: TokenName, tokenObj: TokObj, characterObj: CharObj }); 
                            }) // End ForEach Token
                        }; // End charObj found
                    } // End - This characters token was not selected. Search for it.

                    if( bc && (objarr.length || 0) == 0) {
                        var CharObj = getObj("character", this.charID);
                        if (typeof CharObj != 'undefined') {
                            objarr.push({ type: "character", name: CharObj.get("name"), characterObj: CharObj });      // All we have is character information.
                        }
                    }
                    else if ( (bsct || binmt) && objarr.length > 1 && getAttrByName( this.charID, "NPC" ) != 2 ) {
                        this.chat( "Error! ForEachToken() with non-mook character and more than one token for that character, none of which were selected.", Earthdawn.whoFrom.apierror); 
                        objarr = [];
                    }
                }

                            // Now that we have a list of tokens, have the parser go through each remaining items in the command line individually, once for each token.
                if( (objarr.length || 0) > 0) {
                    if( flag === 1 )
                        return objarr;
                    else if ( flag === 2) {
                        var edpS1 = edParse.tokenInfo;
                        var edpS2 = edParse.charID;
                        var ret = false;
                        _.each( objarr, function ( obj ) {
                            edParse.tokenInfo = obj;
                            edParse.charID = obj.characterObj.get( "id");
                            if( edParse.TokenGet( status ).length > 0)
                                ret = true;
                        }); // End for each Token
                        edParse.tokenInfo = edpS1;
                        edParse.charID = edpS2;
                        return ret; 
                    } else {
						let miscsave = _.clone( edParse.misc );			// Otherwise this gets passed by reference and all copies end up sharing the same object. So save a clone, and explicitly clone the clone back in.
						this.indexToken = 0;
                        _.each( objarr, function ( obj ) {
                            var newParse = _.clone( edParse );
							newParse.misc = _.clone( miscsave );
                            newParse.tokenInfo = obj;
                            newParse.charID = obj.characterObj.get( "id");          // Make sure that charID is set to the correct character for this token.
							if( newParse.tokenInfo.type === "token" && newParse.tokenInfo.tokenObj.get("id") !== edParse.tokenIDs[ edParse.indexToken] )
								newParse.chat( "Warning! Possible error in ForEachToken() tokenID of " + newParse.tokenInfo.tokenObj.get("id") + " not equal " + edParse.tokenIDs[ edParse.indexToken], Earthdawn.whoFrom.apierror); 
                            newParse.checkForStoredTargets();
							++edParse.indexToken;
                        }); // End for each Token
                    }
                    edParse.indexMsg = edParse.edClass.msgArray.length;         // Set edParse to be Done for the original copy (since have already done it for each copy).
//log( "outside ForEachToken loop");
                } else {
                    this.chat( "Error! No token selected.", Earthdawn.whoFrom.apierror); 
					this.indexMsg = this.edClass.msgArray.length;
				}
            } catch(err) {
                log( "ED.ForEachToken() error caught: " + err );
            }   // end catch
        } // End ParseObj.ForEachToken()



                    // ParseObj.ForEachTokenList()
                    // We have been passed a list of Token IDs. (generated by a previous threads call to ForEachToken()
                    // One by one, do a ForEach loop for each token id.
        this.ForEachTokenList = function( ssa )  {
            'use strict';

            try {
                var edParse = this;
				this.tokenIDs = [];
                for( let i = 1; i < ssa.length; i++)
					this.tokenIDs.push( ssa[ i ] );
                for( this.indexToken = 0; this.indexToken < this.tokenIDs.length; this.indexToken++) {
                    var TokObj = getObj("graphic", this.tokenIDs[ this.indexToken ]); 
                    if (typeof TokObj === 'undefined' )
                        continue;

                    var cID = TokObj.get("represents"); 
                    var CharObj = getObj("character", cID) || ""; 
                    if (typeof CharObj === 'undefined') 
                        continue;

                    var TokenName = TokObj.get("name"); 
                    if( TokenName.length < 1 )
                        TokenName = CharObj.get("name");
                    var newParse = _.clone( edParse );
                    newParse.charID = cID; 
                    newParse.tokenInfo = { type: "token", name: TokenName, tokenObj: TokObj, characterObj: CharObj };
                    newParse.checkForStoredTargets();
                }
                edParse.indexMsg = edParse.edClass.msgArray.length;         // Set edParse to be Done for the origional copy (since have already done it for each copy).
            } catch(err) {
                log( "ED.ForEachTokenList() error caught: " + err );
            }   // end catch
            edParse.indexMsg = edParse.edClass.msgArray.length;         // Set edParse to be Done for the origional copy (since have already done it for each copy).
            return;
        } // End ParseObj.ForEachTokenList()




					//	If the current token has previously set targets, call forEachTarget(). 
					//	otherwise just call to ParseLoop as a targetlist is coming in a separate command.
		this.checkForStoredTargets = function()  {
            'use strict';

            try {
                if( this.targetIDs.length !== 0 )
                    this.chat( "Warning! checkForStoredTargets() already has targetIDs defined. Check for bugs.   Msg: " + this.edClass.msg.content + "   Index = " + this.indexMsg, Earthdawn.whoFrom.apierror); 

                if( !( this.bFlags & Earthdawn.flagsTarget.Mask ) 
						|| ( this.bFlags & (Earthdawn.flagsTarget.Ask | Earthdawn.flagsTarget.Riposte))
						|| ( this.bFlags & Earthdawn.flagsTarget.Set ))   // target type is none or ask, so no target tokens involved.
                    this.ParseLoop();
                else {
                    let t = this.TokenGet( "TargetList" );
                    if( t.length === 0)
                        this.ParseLoop();
					else {		// a target list was stored for this token. Do all following commands for each target.
                        this.targetIDs = t;
						this.forEachTarget();
					}
                }
            } catch(err) {
                log( "ED.checkForStoredTargets() error caught: " + err );
            }   // end catch
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
        this.forEachTarget = function( ssa )  {
            'use strict';

            try {
                this.TokenSet( "clear", "Hit");			// Clear any hits that may be attached to any tokens. 

                if( ssa !== undefined ) {       // ssa is a target list that should be stored. 
					this.targetIDs = [];
                    for( let i = 1; i < ssa.length; i++ )
                        this.targetIDs.push( ssa[ i ] );
                }
				if( this.targetIDs.length === 0 )
					this.chat( "Warning! ForEachTarget() has no targets. Check for bugs.   Msg: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror); 
				else {				// If we have targets (ether from preset targets or a TargetSet command)
									// If target is looking for highest one in the list, find it and call parseloop for that target only. 
                    if( this.bFlags & Earthdawn.flagsTarget.Highest ) {
                        let highnum = -999;
                        let highindex;
                        for( this.indexTarget = 0; this.indexTarget < this.targetIDs.length; this.indexTarget++ ) {
                            let x = this.TargetCalc( this.targetIDs[ this.indexTarget ], this.bFlags );
                            if( x !== undefined && x["val"] > highnum ) {
                                highindex = this.indexTarget;
                                highnum = x["val"];
                                this.misc[ "targetName" ] = x["name"];
                            }
                        }
                        if( highindex !== undefined ) {
							if( this.targetIDs.length > 1 )
								this.misc[ "targetName" ] += " and " + ( this.targetIDs.length -1 ).toString() + " others";
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
								var newParse = _.clone( this );
									newParse.misc = JSON.parse( cloneMisc );		// Make certain we get rid of stuff from the last loop. 
								var x =  newParse.TargetCalc( newParse.targetIDs[ newParse.indexTarget ], newParse.bFlags );
								if( x !== undefined ) {
									newParse.targetNum = (newParse.targetNum || 0) + x["val"];
									newParse.misc[ "targetName" ] = x["name"];
									newParse.ParseLoop();
								}
							}
                        }
                        this.indexMsg = this.edClass.msgArray.length;         // Set edParse to be Done for the origional copy (since have already done it for each copy).
                    }
                }
            } catch(err) {
                log( "ED.ForEachTarget() error caught: " + err );
            }   // end catch
            return;
        } // End ParseObj.ForEachTarget()




                    // If this is not a damage roll, just call Roll()
					// If this is a damage roll, see if any of the tokens being processed, have a recorded hit.
					// 		If so, call Roll once for each hit (which might be zero, one, or more).
					//		Otherwise, just call Roll once for each token.
        this.ForEachHit = function( ssa )  {
            'use strict';

            try {
				if( !( this.bFlags & Earthdawn.flagsArmor.Mask )) {		// This is not a damage roll, so just proceed to Roll().
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
					if( this.bFlags & Earthdawn.flags.WillEffect ){		// if it is a will effect damage roll, there is only one roll made.
						this.indexTarget = 0;
						this.Roll( ssa );
					}
					else {			// Otherwise we make one roll per hit	
						for( this.indexTarget = 0; this.indexTarget < this.targetIDs.length; ++this.indexTarget ) {
							var newParse = _.clone( this );
							newParse.Roll( ssa );
						}
					}
                } else	// No token has hits recorded. Just do it once for each token.
					this.Roll( ssa );
            } catch(err) {
                log( "ED.ForEachHit() error caught: " + err );
            }   // end catch
            return;
        } // End ParseObj.ForEachHit()



                    // Special Effects. 
					// This routine does two things. If ssa [ 0 ] == FXset then a button has been pressed to set FX to a Talent, Knack or Spell.
					// If it is a string that contains an FX entry, Then we need to generate an FX. 
        this.FX = function( ssa )  {
            'use strict';
            try {

				if( typeof ssa === "string" ) {			// Being called from one of two places in Roll().
					let txt = "",
						ss = ssa.split( "," );

					if( ss[ 3 ].endsWith( "FTO" ) && (this.indexTarget || 0) != 0 )
						return;			// Effect is for first target only, and this is not the first target.

					let start = this.indexTarget || 0;
					let end = start + 1;
					if( ss[ 0 ].toLowerCase() === "effect" && start == 0 )		// Effect tests usually (possibly always) only come through here once, so we need to simulate going through once per target.  Everything else should be going through this routine once per target already.
						end = this.targetIDs.length;
					
					for( let ind = start; ind < end; ++ind ) {
						let typ = (ss[ 1 ] + "-" + ss[ 2 ]).toLowerCase();
						if( ss[ 1 ].startsWith( "Custom " )) {				// Custom Effect
							let cust = findObjs({ _type: 'custfx', name: ss[ 1 ].slice( 7 ) })[0];
							if( cust && cust.get( "_id" ))
								typ = cust.get( "_id" );
							else {
								this.chat( "Error! Invalid Custom FX Name: '" + ss[ 1 ] + "'. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror ); 
								return;
							}
						}	// End custom effect.
						if (ss[ 3 ].startsWith( "Ct" )) {			// An effect that travels between two points. 
							if( this.tokenIDs == undefined || (this.tokenIDs[ this.indexToken || 0]) >= this.tokenIDs.length )
								log( "Error! bad tokenID in FX. Msg is: " + this.edClass.msg.content);
							else if (this.targetIDs [ ind ] == undefined)
								log( "Error! targetIDs[] undefined in FX. Msg is: " + this.edClass.msg.content);
							else {
								let tokObj1 = getObj("graphic", this.tokenIDs[ this.indexToken || 0 ] ), 		// Caster
									tokObj2 = getObj("graphic", Earthdawn.getParam( this.targetIDs [ ind ], 1, ":")); 		// Target.
								if( !tokObj1 )
									log( "Error! Unable to get Caster Token in FX. Msg is: " + this.edClass.msg.content); 
								else if ( !tokObj2 )
									log( "Error! Unable to get Target Token " + ind + " (" + this.targetIDs [ ind ] + ") in FX. Msg is: " + this.edClass.msg.content); 
								else
									spawnFxBetweenPoints({x: tokObj1.get( "left" ), y: tokObj1.get( "top" )}, {x: tokObj2.get( "left" ), y: tokObj2.get( "top" )}, typ, tokObj1.get( "_pageid" ));
							}
						} else {												// A single point effect.
							let tokObj = getObj("graphic", (ss[ 3 ].startsWith( "CO" )) ? this.tokenIDs[ this.indexToken || 0 ] 
										: Earthdawn.getParam( this.targetIDs [ ind ], 1, ":")); 		// Caster or Target.
							if( tokObj ) 
								spawnFx( tokObj.get( "left" ), tokObj.get( "top" ), typ, tokObj.get( "_pageid" ));
							else
								log( "Error! Unable to get Token in FX. Msg is: " + this.edClass.msg.content); 
						}
					}
				} else if( ssa[ 0 ].toLowerCase() === "fxset" ) {			// Being called from Parse().
					let pre = Earthdawn.buildPre( ssa[ 1 ], ssa[ 2 ] ) + "FX";
					let aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: pre }),
						to = "";
					if (ssa[ 3 ] === "Set" ) {		// If not Set, it is Clear, so just leave the empty string. 
						if( ssa[ 5 ].startsWith( "Custom " ))
							ssa[ 6 ] = "";			// Custom effects ignore color. 
						ssa[ 5 ] = ssa[ 5 ].replace( /}/g, "");			// Due to a system bug, I get an extra closing brace. Just remove it here. 
						let typ = ssa[ 5 ].toLowerCase();
						if( ssa[ 7 ].startsWith( "Ct" ) && ( typ !== "beam" && typ !== "breath" && typ !== "splatter" && !typ.startsWith( "custom" )))
							this.chat( "Warning! Only Beam, Breath, Splatter and Custom special effects can travel from the caster to a target. All others must affect only a single point, caster or targets. Try again." ); 
						else if( !ssa[ 7 ].startsWith( "Ct") && ( typ == "beam" || typ == "breath" || typ == "splatter" ))
							this.chat( "Warning! Beam, Breath, and Splatter special effects must travel from the caster to a target. Try again." ); 
						else
							to = ssa.slice( 4 ).toString();
					}
					aobj.set( "current", to );
				} else
                    this.chat( "Error! badly formed FX command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror ); 
            } catch(err) {
                log( "ED.FX error caught: " + err );
            }   // end catch
        } // End ParseObj.FX()


/*
                    // try to figure out what the current character ID is. 
        this.getCharID = function( )  {
            'use strict';
            try {
				if( this.charID )
					return this.charID;
				if( this.tokenIDs && this.tokenIDs.length > 0 )
					return this.tokenIDs[ this.indexToken ];
				return undefined;
            } catch(err) {
                log( "ED.getCharID error caught: " + err );
            }   // end catch
        } // End ParseObj.getCharID()
*/


                    // ParseObj.GetStatusMarkerCollection()
                    // Get a collection of objects that fully describe status markers available.
                    // Note: submenu is a bit of a bastardization of the real submenu and the codes used on the character sheets.
                    //      In submenu, [x,y] is as follows: x is code for this  option on the character sheet ie: 2 for partial. y is coded for menu.
                    //      In submenu, [x,y] ether [x,] or [,y] will ususally be removed at start of processing, leaving only x or y, not both.
        this.GetStatusMarkerCollection = function()  {
            'use strict';

            try {
				if ( this.StatusMarkerCollection != undefined )
					return;

                var smc = [];			// IMPORTAINT NOTE!!! if you make changes that affect any attrib, also edit attribute section of the on ready event near the bottom of this file and the chat menu section dealing with status's.
                smc.push ( { code: "karma", prompt: "Karma", attrib: "Karma-Roll", icon: "lightning-helix", submenu: "?{Karma|None,[0^u]|One,[1^s]|Two,[2^b]|Three,[3^c]}" } );
				if( state.Earthdawn.gED )
					smc.push ( { code: "devpnt", prompt: "Dev Pnts", attrib: "Devotion-Roll", icon: "angel-outfit", submenu: "?{Dev Pnts|None,[0^u]|One,[1^s]|Two,[2^b]|Three,[3^c]}" } );
                smc.push ( { code: "willforce", prompt: "WillForce", attrib: "SP-Willforce-Use", icon: "chemical-bolt" } );
                                    // Combat options: - Not shown - Attack to knockdown, Attack to Stun, Jump-up, setting against a charge, shatter shield.
                smc.push ( { code: "aggressive", prompt: "Aggressive Attack", attrib: "combatOption-AggressiveAttack", icon: "sentry-gun" } );
                smc.push ( { code: "defensive", prompt: "Defensive Stance", attrib: "combatOption-DefensiveStance", icon: "white-tower" } );
                smc.push ( { code: "called", prompt: "Called Shot", attrib: "combatOption-CalledShot", icon: "archery-target" } );
                smc.push ( { code: "split", prompt: "Split Movement", attrib: "combatOption-SplitMovement", icon: "tread" } );
                smc.push ( { code: "tail", prompt: "Tail Attack", attrib: "combatOption-TailAttack", icon: "purple" } );
                smc.push ( { code: "reserved", prompt: "Reserved Action", attrib: "combatOption-Reserved", icon: "stopwatch" } );
                                    // Conditions
                smc.push ( { code: "noshield", prompt: "NoShield", attrib: "condition-NoShield", icon: "broken-shield" } );
                smc.push ( { code: "blindsided", prompt: "Blindsided", attrib: "condition-Blindsided", icon: "arrowed" } );
                smc.push ( { code: "blindsiding", prompt: "Blindsiding", attrib: "condition-Blindsiding", icon: "interdiction" } );
                smc.push ( { code: "targetpartialcover", prompt: "Tgt Partial Cover", attrib: "condition-TargetPartialCover", icon: "half-heart" } );
                smc.push ( { code: "knocked", prompt: "Knocked Down", attrib: "condition-KnockedDown", icon: "back-pain" } );
                smc.push ( { code: "range", prompt: "Long Range", attrib: "condition-RangeLong", icon: "half-haze" } );
                smc.push ( { code: "surprised", prompt: "Surprised", attrib: "condition-Surprised", icon: "sleepy" } );

                smc.push ( { code: "entangled", prompt: "Entangled/Grappled", icon: "fishing-net" } );
                smc.push ( { code: "poison", prompt: "Poisoned", icon: "death-zone", submenu: "?{Amount|0}" } );
                smc.push ( { code: "stealth", prompt: "Stealth", icon: "ninja-mask", submenu: "?{Amount|0}" } );
                smc.push ( { code: "flying", prompt: "Flying", icon: "fluffy-wing", submenu: "?{Amount|0}" } );
                smc.push ( { code: "buffed", prompt: "buffed", icon: "strong", submenu: "?{Amount|0}" } );
                smc.push ( { code: "buff2", prompt: "buff2", icon: "aura", submenu: "?{Amount|0}" } );
                smc.push ( { code: "debuff", prompt: "debuff", icon: "broken-skull", submenu: "?{Amount|0}" } );
                smc.push ( { code: "debuff2", prompt: "debuff2", icon: "screaming", submenu: "?{Amount|0}" } );

                smc.push ( { code: "ambushing", prompt: "Ambushing", attrib: "Creature-Ambushing", icon: "red" } );
                smc.push ( { code: "divingcharging", prompt: "Diving/Charging", attrib: "Creature-DivingCharging", icon: "purple" } );
 //               smc.push ( { code: "pd", prompt: "PD minus", icon: "bolt-shield", submenu: "?{Amount to subtract from PD|0}" } );
 //               smc.push ( { code: "md", prompt: "MD minus", icon: "frozen-orb", submenu: "?{Amount to subtract from MD|0}" } );
 //               smc.push ( { code: "sd", prompt: "SD minus", icon: "chained-heart", submenu: "?{Amount to subtract from SD|0}" } );
 //               smc.push ( { code: "pa", prompt: "PA minus", icon: "broken-shield", submenu: "?{Amount to subtract from PA|0}" } );
 //               smc.push ( { code: "ma", prompt: "MA minus", icon: "radioactive", submenu: "?{Amount to subtract from MA|0}" } );
//                smc.push ( { code: "penalty", prompt: "All Tests Penalty", icon: "black-flag", submenu: "?{Penalty to Action tests|0}" } );
//                smc.push ( { code: "penalty", prompt: "All Tests Penalty", attrib: "Adjust-All-Tests-Misc", icon: "black-flag", submenu: "?{Penalty to Action tests|0}" } );
                smc.push ( { code: "cover", prompt: "Cover", attrib: "condition-Cover", icon: "three-leaves", submenu: "?{Cover|None,[0^u]|Partial,[2^b]|Full,[99^s]}" } );
                smc.push ( { code: "harried", prompt: "Harried", attrib: "condition-Harried", icon: "all-for-one", submenu: "?{Harried|Not Harried,[0^u]|Harried,[2^s]|Overwhelmed,[3^a]|Overwhelmed II,[4^b]|Overwhelmed III,[5^c]|Increase,++|Decrease,--}" } );
                smc.push ( { code: "move", prompt: "Movement Impaired", attrib: "condition-ImpairedMovement", icon: "snail", submenu: "?{Impaired Movement|None,[0^u]|Partial,[2^b]|Full,[4^d]}" } );
                smc.push ( { code: "vision", prompt: "Vision Impaired", attrib: "condition-Darkness", icon: "bleeding-eye", submenu: "?{Impaired Vision|None,[0^u]|Partial,[2^b]|Full,[4^d]}" } );
                smc.push ( { code: "health", prompt: "Health", attrib: "condition-Health", icon: "dead", submenu: "?{Health|OK,[0^u]|Unconscious,[5^s]|Dead,[-5^a]}" } );

                this.StatusMarkerCollection = smc;
		return;
            } catch(err) {
                log( "ED.GetStatusMarkerCollection() error caught: " + err );
            }   // end catch
        } // End ParseObj.GetStatusMarkerCollection()



                    // return the token name of the passed tokenID
        this.getTokenName = function( tID )  {
            'use strict';

            try {
                var TokenObj = getObj("graphic", tID); 
                if (typeof TokenObj === 'undefined' ) 
                    return;

                var TokenName = TokenObj.get("name"); 
                if( TokenName === undefined || TokenName.length < 1 ) {
					var CharObj = getObj("character", TokenObj.get("represents")) || ""; 
					if (typeof CharObj == 'undefined' || CharObj == "")
						return;
					TokenName = CharObj.get("name"); 
				}
		
				return TokenName;
            } catch(err) {
                log( "ED.getTokenName() error caught: " + err );
            }   // end catch
        } // End ParseObj.getTokenName()



                    // ParseObj.GetTokenStatus()
                    // ca:      Condition Array [0]: Code, [1] multiplier.
                    // cID:     character ID
                    // sm       status markers.
                    //
                    // Return: 
        this.GetTokenStatus = function( ca, cID, sm )  {
            'use strict';

            var ret = 0;
            try {
                var mi = _.find( this.StatusMarkerCollection, function(mio){ return mio["code"] == ca[ 0 ]; });
                if( mi !== undefined ) {
                    ret = parseInt( getAttrByName( cID, mi["attrib"] ) || 0 ) * ca[1];
                    
                }
            } catch(err) {
                log( "ED.GetTokenStatus() error caught: " + err );
            }   // end catch
log( "ca " + ca + "   ret " + ret);
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

            var ret = 0;
            try {
                var TokObj = getObj("graphic", tokenID.trim()); 
                if (typeof TokObj == 'undefined' )
                    this.chat( "Error! Bad Token. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror); 
                else {
                    var cID = TokObj.get("represents");
                    if ( cID === undefined || cID.length < 3)
                        this.chat( "Error! Token not linked to character. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror); 
                    else {
//                        var sm = TokObj["statusmarkers"];
//                        var bases;
//                        var conditionsPlus;
//                        var conditionsMinus;
//                        var t;
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
                            ret += parseInt( getAttrByName( cID, base ) || 0 );
log( "t  " + t +  "  raw  " + ret);
                        }) // End ForEach base in bases

log( 444);
                        this.GetStatusMarkerCollection();
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
            } catch(err) {
                log( "ED.GetTokenValue() error caught: " + err );
            }   // end catch
            return ret;
        } // End ParseObj.GetTokenValue()


		
					// if subfunct is 1, return collection of selected token ids and character ids, grouped by character.  
					// if subfunct is 2, return list of selected character tokens, ungrouped.
					// This is an easy way to see how many different charcters are selected.
        this.getUniqueChars = function( subfunct )  {
            'use strict';

            try {
				var arr = [];
                _.each( this.edClass.msg.selected, function( sel ) {                // Check selected tokens
                    var TokObj = getObj("graphic", sel._id); 
                    if (typeof TokObj === 'undefined' )
                        return;
					if ( TokObj.get( "_subtype" ) !== "token")
						return;
                    var cID = TokObj.get("represents"); 
					if( cID )
						arr.push( { token: TokObj.get("_id"), character: cID } );
				});
				return (( subfunct === 1) ? _.groupBy( arr, "character" ) : arr );
            } catch(err) {
                log( "edParse.getUniqueChars() error caught: " + err );
            }   // end catch
        } // End getUniqueChars()




                    // attrib is an attribute to lookup. Get the value with all safety. Return the result.
                    // cID (optional) defaults to this.charID
					// fSpecial (optional) if 1 then return value as a string, not a number.
                    //
                    // Note that this routine now should work with character sheet autocalculated fields. 
        this.getValue = function( attrib, cID, fSpecial )  {
            'use strict';

            var ret = 0;
            try {
                if( attrib !== undefined ) {
					if( (typeof attrib) == "string" )
						attrib = attrib.trim();
                    if( !isNaN( attrib) ) {            // If it is a number, just use it as a modifier to any result obtained elsewhere.
						ret = attrib;
                    } else {				// We have a string of some sort, quite possibly a variable name. 
                        if( cID === undefined )
                            if( this.charID === undefined )
                                this.chat( "Error! charID undefined in getValue() command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror); 
                            else
                                cID = this.charID;

						let raw;
                        if( attrib.endsWith( "_max" ))
							raw = getAttrByName( cID, attrib.slice( 0, -4), "max");
						if( raw === undefined )
							raw = getAttrByName( cID, attrib );				// Treat this as a raw variable name and see what we get. 
                        if( raw === undefined )			// Bug in getAttrByName() when dealing with repeating values, returns undefined if the value does not exist rather than the default value. This value might (or might not) be valid. Return zero for want of anything better to do. 
                            ret = "0";
                        else if( !isNaN( raw ) )		// We have an actual number to use
                            ret = raw;
                        else {							// we probably have a formula for getting an actual number. 
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
									if( attrib.startsWith( "repeating_" ) && tst.startsWith( Earthdawn.repeatSection( 3, attrib) + "_" )) {		// if the original attrib has a listed repeating section and rowID, and the derived numbers are from the same section, add the prefix to all the derived numbers.
										tst = Earthdawn.buildPre( attrib ) + tst.slice( tst.indexOf( "_" ) +1);
									}
									processed = processed.slice(0, begin) + this.getValue( tst ) + processed.slice( end + 1);
									begin = processed.indexOf( "@{" );
								}
							}
							if( err )
								this.chat( "Error! getValue() failure. '" + attrib + "' = '" + raw + "'   Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror); 
							else
								ret = eval( processed );
						}
                    }
				}
            } catch(err) {
                log( "ParseObj.getValue() error caught: " + err );
            }   // end catch
			return ( fSpecial === 1 ) ? ret : parseInt( ret);
        } // End ParseObj.getValue()





                    // ParseObj.Karma ( ssa )
                    // Set the correct karma bonus into misc.karmaDice, and adjust the karma total.
                    //      ssa : Karma Control. -1 = Never, 0 or undefined = look to sheetwide karma. >1 = Always use this number of Karma.
					// Note: also accepts ssa[0] being "def", "kcdef", or "dpdef" and ssa[1] being a numeric literal value to use as default, with other actual values to follow.
        this.Karma = function( ssa, kcdef, dpdef )  {
            'use strict';

            try {
                if( this.tokenInfo === undefined ) {
                    this.chat( "Error! tokenInfo undefined in Karma() command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror); 
                    return;
                }
                if( kcdef === undefined)
                    kcdef = -1;
                if( dpdef === undefined || state.Earthdawn.g1879)
                    dpdef = -1;

                let ttmp,
					kc,
					dp,
					kdice = 0,
					ddice = 0;
                if( _.isString( ssa ))
                    ssa = [ "", ssa ];
                if((ssa !== undefined) && (ssa.length > 0 ))
                    for( let i = 1; i < ssa.length; i++) {
                        kc = kcdef;
						dp = dpdef;
                        ttmp = ssa[ i ];
                        if( _.isString( ttmp )) {
							switch (ttmp.toLowerCase()) {
							case "def":
							case "kcdef":
								kcdef = parseInt( ssa[ ++i ]);
								continue;
							case "dpdef":
								dpdef = parseInt( ssa[ ++i ]);
								continue;
							}
                            if( isNaN( ttmp )) {
                                let ttmp2 = getAttrByName( this.charID, ttmp );
								if( ttmp2 !== undefined && ttmp2 !== "") {
									let kc2 = parseInt( ttmp2 );
									if( !isNaN( kc2 ) )
										kc = kc2;
								}
								if( state.Earthdawn.gED ) {
									ttmp2 = getAttrByName( this.charID, ttmp.replace( /Karma-/g, "DP-") );
									if( ttmp2 !== undefined && ttmp2 !== "") {
										let dp2 = parseInt( ttmp2 );
										if( !isNaN( dp2 ) )
											dp = dp2;
									}
								}
							} else if( ssa[ 0 ].toLowerCase().startsWith( "d" ))		// If we got a number, and ssa[0] starts with d, then it is DP, otherwise karma.
								dp = parseInt( ttmp );
							else
								kc = parseInt( ttmp );
                        }
                        if (kc > 0)
                            kdice += kc;
                        else if ( kc === 0)
                            kdice += parseInt( getAttrByName( this.charID, "Karma-Roll" ) || 0);
                        if (dp > 0)
                            ddice += dp;
                        else if ( dp === 0 && state.Earthdawn.gED)
                            ddice += parseInt( getAttrByName( this.charID, "Devotion-Roll" ) || 0);
                    }

                if( kdice > 0 ) {   // Are we spending more than zero karma?
                    let kstep = parseInt( getAttrByName( this.charID, "KarmaStep" ) || 0);
                    if( kstep === null || kstep < 1 )
                        kstep = 4;  // default

                    if( this.tokenInfo.type === "token" ) {
                        var currKarma = parseInt( this.tokenInfo.tokenObj.get( "bar1_value" ) || 0);
						if( isNaN( currKarma ) )
							currKarma = 0;
                    } else {
                        var attribute = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "Karma" }, 0);
                        var currKarma = parseInt(attribute.get( "current" ) || 0);
                    }

                    if( kdice > currKarma ) {
                        this.chat( "Error! " + this.tokenInfo.name + " does not have " + kdice + " karma to spend.", Earthdawn.whoFrom.apierror ); 
                        kdice = currKarma;
                    }
                    if( kdice > 0 ) {
                        currKarma -= kdice;
                        if( this.tokenInfo.type === "token" )
                            this.tokenInfo.tokenObj.set( "bar1_value", currKarma );
                        else
                            attribute.setWithWorker( "current", currKarma );

                        let corruptObj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "Creature-CorruptKarma" }, 0),
							corruptNum = parseInt(corruptObj.get( "current" ) || 0),
							realdice = Math.max( 0, kdice - corruptNum ),
							corrupted = kdice - realdice;
						if( corrupted > 0 ) {
							this.misc[ "CorruptedKarma" ] = corrupted;
							corruptObj.set( "current", corruptNum - corrupted);
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

                if( ddice > 0 ) {			// Are we spending more than zero Devotion Points?
                    let kstep = parseInt( getAttrByName( this.charID, "DevotionStep" ) || 0);
                    if( !kstep )
                        kstep = 3;  // default

                    var attribute = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "DP" }, 0);
                    let currDP = parseInt(attribute.get( "current" ) || 0);
                    if( ddice > currDP ) {
                        this.chat( "Error! " + this.tokenInfo.name + " does not have " + ddice + " Devotion Points to spend.", Earthdawn.whoFrom.apierror ); 
                        ddice = currDP;
                    }
                    if( ddice > 0 ) {
                        currDP -= ddice;
                        attribute.setWithWorker( "current", currDP );

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
            } catch(err) {
                log( "ED.Karma() error caught: " + err );
            }   // end catch
        } // End ParseObj.Karma()





                    // ParseObj.LinkToken ()
                    // Make sure the character associated with CharID (already passed) is ready to Link.
                    // Link all selected tokens to this character.
        this.LinkToken = function()  {
            'use strict';

            try {
                if( this.charID === undefined ) {
                    this.chat( "Error! Trying to Link Token when don't have a CharID.", Earthdawn.whoFrom.apierror ); 
                    return;
                } 
                if( this.tokenAction ) {
                    this.chat( "Error! Linktoken must be a character sheet action, never a token action.", Earthdawn.whoFrom.apierror); 
                    return;
                } 
                if( this.edClass.msg.selected === undefined ) {
                    this.chat( "Error! You must have exactly one token selected to Link the character sheet to the Token.", Earthdawn.whoFrom.apierror); 
                    return;
                } 
                let Count = 0;
                let mook = (getAttrByName( this.charID, "NPC" ) == "2") ;
                if( !mook && this.edClass.msg.selected.length > 1 )
                {
                    this.chat( "Error! You can't link more than one token to a non-mook character!", Earthdawn.whoFrom.apierror);
                    return;
                }
                var edParse = this,
					sName = "";
                _.each( this.edClass.msg.selected, function( sel ) { 
                    var TokenObj = getObj("graphic", sel._id); 
//log( TokenObj );
                    if (typeof TokenObj === 'undefined' ) 
                        return;

                    TokenObj.set("represents", edParse.charID );
					sName = TokenObj.get( "name");
					if( sName === undefined || sName.length < 1 ) {
						let CharObj = getObj("character", edParse.charID ) || ""; 
						if (typeof CharObj !== 'undefined' && CharObj !== "") {
							sName = CharObj.get("name");
							TokenObj.set("name", sName);
						}
					}
                    TokenObj.set("bar1_link", "");
                    TokenObj.set("bar2_link", "");
                    TokenObj.set("bar3_link", "");
                    TokenObj.set("bar1_value", getAttrByName( edParse.charID, "Karma" ));
                    TokenObj.set("bar1_max",   getAttrByName( edParse.charID, "Karma", "max" ));
                    TokenObj.set("bar2_value", getAttrByName( edParse.charID, "Wounds" ));
                    TokenObj.set("bar2_max",   getAttrByName( edParse.charID, "Wounds", "max" ));
                    TokenObj.set("bar3_value", getAttrByName( edParse.charID, "Damage" ));
                    TokenObj.set("bar3_max",   getAttrByName( edParse.charID, "Damage", "max" ));
                    TokenObj.set("showname", true );
                    TokenObj.set("showplayers_name", true );
                    TokenObj.set("showplayers_bar1", true );
                    TokenObj.set("showplayers_bar2", true );
                    TokenObj.set("showplayers_bar3", true );
                    TokenObj.set("showplayers_aura1", true );
                    TokenObj.set("showplayers_aura2", true );
                    if( mook != 1 ) {        // Not a mook - so unique character
                        var kobj  = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: edParse.charID, name: "Karma" }, 0);
                        var kid = kobj.get("_id");
                        if( kid !== undefined )
                           TokenObj.set("bar1_link", kid );
                        kobj  = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: edParse.charID, name: "Wounds" }, 0);
                        kid = kobj.get("_id");
                        if( kid !== undefined )
                           TokenObj.set("bar2_link", kid );
                        kobj  = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: edParse.charID, name: "Damage" }, 0);
                        kid = kobj.get("_id");
                        if( kid !== undefined )
                           TokenObj.set("bar3_link", kid );
                    } // End not mook

                    var CharObj = getObj("character", edParse.charID); 
                    if (typeof CharObj != 'undefined' ) {
                        setDefaultTokenForCharacter( CharObj, TokenObj);
                        Count = Count + 1;
                    }
                });  // End for each selected token
                if( Count == 0) 
                    this.chat( "Error! No selected token to link.", Earthdawn.whoFrom.apierror | Earthdawn.whoTo.player); 
                 else      // _defaulttoken is readonly, so user must do the last step.
                    this.chat( "Token " + sName + " is linked.", Earthdawn.whoFrom.api | Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive ); 
            } catch(err) {
                log( "ED.LinkToken error caught: " + err );
            }   // end catch
        } // End ParseObj.LinkToken()




                    // ParseObj.Lookup()
                    // We are passed a character attribute and/or a modifier to an attribute. Lookup the value(s) from the character sheet.
                    // Note: This is setup like this so that several tags can direct to the same function, and that ether PD or @(PD) will work. 
                    //      mod : PD : -2       // Find the Physical Defense, subtract 2 from it, and place it in "step" or add it to what is already there.
                    //
                    // wherePlace:  Where does the result go?  1 = this.misc.step, 2 = this.misc.result, 3 - this.targetNum.   
					//				4 - The character sheet attribute named in ssa[1].
					//
					// Note that if we are told to lookup a value that is an autocalculated field, it passes control to an asynchronous callback function to accomplish it. 
                    // Return: whether Parse should fallout or not. IE: return false unless this thread has launched an asynchronous callback. 
        this.Lookup = function( wherePlace, ssa )  {
            'use strict';

            try {
                if( ssa.length < 2 ) {
                    this.chat( "Error! Lookup() not passed a value to lookup. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror ); 
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
						case 1:     po.misc[ "step" ]  	= ( po.misc[ "step" ] || 0) + what - po.mookWounds();       break;
						case 2:     po.misc[ "result" ]	= ( po.misc[ "result" ] || 0) + what;     break;
						case 3:     po.targetNum    	= ( po.targetNum || 0) + what;  break;
						case 4:
							let attribute = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: attName });
							attribute.setWithWorker("current", what);
						}
					return;
				} // end of luResult()


				if( wherePlace === 4 )
					attName = ssa[ ++i ];

                while( ++i < ssa.length ) {
                    if( !isNaN( ssa[ i ]))            // If it is a number, just use it as a modifier to any result obtained elsewhere.
                        lu += parseInt( ssa[ i ]);
                    else {
                        if( this.tokenInfo === undefined ) {
                            this.chat( "Error! tokenInfo undefined in Lookup() command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror); 
                            return false;
                        }
						switch ( ssa[ i ].toLowerCase() ) {
						case "defensive":		// This action is defensive. If Defensive Stance is turned on, add 3 to compensate for the three that were subtracted previously.
							if( getAttrByName( this.charID, "combatOption-DefensiveStance" ) === "1" ) {
								lu += 3;
								this.misc[ "Defensive" ] = true;	// Since step was modified for being defensive, tell people.
							} break;
						case "resistance":		// This action is a Resistance Roll. If character is knocked down, add 3 to compensate for the three that were subtracted previously.
							if( getAttrByName( this.charID, "condition-KnockedDown" ) === "1" ) {
								lu += 3;
								this.misc[ "Resistance" ] = true;
							} break;
						case "movebased": {		// This action is Movement Based. If Movement Penalties are in effect, subtract them from this result.
							let tstep = getAttrByName( this.charID, "condition-ImpairedMovement" );
							if( tstep > 0 ) {
								lu -= tstep;
								this.misc[ "MoveBased" ] = (tstep == 2) ? "Partial" : Full;
							}
						}	break;
						case "visionbased":	{	// This action is Vision Based. If Vision Penalties are in effect, subtract them from this result.
							let tstep = getAttrByName( this.charID, "condition-Darkness" );
							if( tstep > 0 ) {
								lu -= tstep;
								this.misc[ "VisionBased" ] = (tstep == 2) ? "Partial" : Full;
							}
						}	break;
						default:
							let raw = getAttrByName( this.charID, ssa[ i ] );
							if( raw !== undefined )
								if( (typeof raw === "number") || (raw.indexOf( "@{") === -1))           // We have an actual number to use
									lu += parseInt( raw );
								else                            // we have a formula for getting an actual number. 
									rcmd += "+(@{" + this.tokenInfo.characterObj.get( "name" ) + "|" + ssa[ i ] + "})"
						}
                    }
                } // end for each ssa item

                if( rcmd === "" )
                    luResult( lu, this );
                else {              // The main thread is to STOP PROCESSING THIS ITERATION! Control is being passed to callback thread.
                    var po = this;
                    sendChat( "API", "/r [[" + rcmd.slice( 1 ) + "]]", function( ops ) {  
                        'use strict';
                                                // NOTE THAT THIS IS THE START OF A CALLBACK FUNCTION
                        var RollResult = JSON.parse(ops[0].content);
                        luResult( lu + RollResult.total, po );

                        po.ParseLoop();         // This callback thread is to continue parseing this. 
                    }, {noarchive:true});  // End of callback function
                    return true;
                }

            } catch(err) {
                log( "edParse.Lookup() error caught: " + err );
            }   // end catch
            return false;
        } // End Lookup()



                    // ParseObj.MacroDetail()
                    // Check if named Macro Exists, if not create it.
                        // macName: Name of Macro
                        // macText: Text of Macro
                        // macTokenAction: true of this is a token action.
        this.MacroDetail = function( macName, macText, macTokenAction )  {
            'use strict';

            try {
                var macObj = findObjs({ _type: "macro", name: macName });
                if( macObj == undefined || macObj.length === 0 ) {
                    macObj = createObj("macro", {
                            _playerid:      this.edClass.msg.playerid,
                            name:           macName,
                            action:         macText,
                            visibleto:      "all",
                            istokenaction:  macTokenAction });
                }
            } catch(err) {
                log( "ED.MacroDetail error caught: " + err );
            }   // end catch
        } // End ParseObj.MacroDetail()



                    // makeButton()
                    // Make a self contained html button that can be sent to the chat window. 
					// noColonFix true: don't do ColonFix or encode, false: do ColonFix and Encode it. 
        this.makeButton = function( buttonDisplayTxt, linkText, tipText, buttonColor, txtColor, noColonFix )  {
            'use strict';

            try {
				return new HtmlBuilder( "a", buttonDisplayTxt, Object.assign({}, {
					href: noColonFix ? linkText : Earthdawn.encode( Earthdawn.colonFix( linkText )),
					style: Object.assign({}, { 
						"padding":		"0px, 3px",
						"border":		"1px solid black",
						"margin":		"1px, 0px",
						"min-width":	"auto",
						"white-space":	"nowrap"
					}, 
					buttonColor ? { "background-color": buttonColor } : {},
					txtColor ? { "color": txtColor } : {} )},
					tipText ? {
						class: "showtip tipsy",
						title: Earthdawn.encode( Earthdawn.encode( tipText )),
					} : {})) + " ";
            } catch(err) {
                log( "ED.makeButton error caught: " + err );
            }   // end catch
        } // end makeButton()



                    // ParseObj.MarkerSet ( ssa )
                    // Set the Status Markers for current tokens
                    //  ssa[ 1 ] is condition to be set OR name of marker to be set. IE: "aggressive" or "sentry-gun" both set the same marker.
                    //  ssa[ 2 ] level. If -1 or start with letter the letter U (unset) or O (for off - but not equal ON), remove the marker.   
                    //                  If zero or not present or is ON or starts with S (set), set the marker without a badge.
					//					If starts with a "t" than toggle it from set to unset or visa versa. 
					//					If it starts with a z, expect a numeric value, except in this specific case, a zero means unset. 
                    //                  If 1 - 9, or A-I set the marker with the number as a badge. 
                    //                          Note: there is a weird thing in linking a token where it is better to have no digits in the menu. thus A-I substitute for 1-9.
                    //                  If ++, --, ++n, or --n then adjust from current level.
					//  Example: [ "", "aggressive", "Set"] or [ "", sentry-gun", Off].
        this.MarkerSet = function( ssa )  {
            'use strict';

            try {
                if( this.tokenInfo === undefined ) {
                    this.chat( "Error! tokenInfo undefined in MarkerSet() command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror); 
                    return;
                }
                if( this.tokenInfo.type === "token" ) {
                    let marker,
						ss,
						level = 0,
						adjust = 0,
						lu = ssa[1].toLowerCase();
                    this.GetStatusMarkerCollection();
                    let mi = _.find( this.StatusMarkerCollection, function(mio){ return mio["code"] == lu; });
                    if( mi === undefined )
                        marker = ssa[ 1 ];
                    else
                        marker = mi["icon"];
                    let	sm = mi["submenu"],
						raw = this.tokenInfo.tokenObj.get( "status_" + marker ),
						mook = (getAttrByName( this.charID, "NPC" ) == "2" ),
						dupChar = false;

                    if( ssa.length > 1) {
                        if( ssa.length > 2)
                            ss = ssa[ 2 ].toLowerCase();
                        else
                            ss = "s";
						if( ss.substring( 0, 2) === "z0" )
							level = -1;
						else if ( ss.substring( 0, 1 ) === "z" )
							ss = ss.slice( 1 );

                        if( ss.substring( 0, 2) === "--" )      // Decrement the current value by this amount.
                            adjust = -1;
                        else if ( ss.substring( 0, 2) === "++" )
                            adjust = 1;
                        else if( ss.substring( 0, 1) == "s" || ss.substring( 0, 2) == "on" || ss.substring( 0, 1) == "0" )        // On or Set
                            level = 0;
                        else if( ss.substring( 0, 1) == "u" || ss.substring( 0, 1) == "o" || ss.substring( 0, 2) == "-1" )     // If starts with -1 or an O for Off or U for Unset.
                            level = -1;
						else if ( ss.substring( 0, 1) === "t" ) {			// Toggle it set to unset or visa versa
												// First we want to find out what the character sheet value of the value was before we started flipping stuff.
							if( !("charIDsUnique" in this.uncloned.misc))
								this.uncloned.misc.charIDsUnique = [];
							let indx = this.uncloned.misc.charIDsUnique.indexOf( this.charID );
							if( indx != -1) {		// If we have already processed this character
								level = this.uncloned.misc.charIDsUnique[ indx + 1 ];
								dupChar = true;
							} else if( mi["attrib"] != undefined ) {
								var attribute = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: mi["attrib"] }, 0);
								level = (parseInt(attribute.get( "current" ) ) == "1") ? -1: 0;
								this.uncloned.misc.charIDsUnique.push( this.charID );
								this.uncloned.misc.charIDsUnique.push( level );
							} else
								level = (( raw === false) ? 0 : -1 );
						} else if ( '0' <= ss[ 0 ] && ss[ 0 ] <= '9' )
                            level = ss.charCodeAt( 0 ) - 48;
                        else if ( 'a' <= ss[ 0 ] && ss[ 0 ] <= 'i' )
                            level = ss.charCodeAt( 0 ) - 96;
                        if( adjust != 0 && ss.length > 2 ) {
                            var t = 1;
                            if ( '0' <= ss[ 2 ] && ss[ 2 ] <= '9' )
                                t = ss.charCodeAt( 2 ) - 48;        // 48 is zero
                            else if ( 'a' <= ss[ 2 ] && ss[ 2 ] <= 'i' )
                                t = ss.charCodeAt( 2 ) - 96;        // 97 is 'a'
                                adjust = adjust * t;
                        }
                    }

                    if( adjust !== 0 ) {
                        if( raw === false )
                            level = -1;
                        else if ( raw === true )
                            level = 0;
                        else
                            level = parseInt( raw );
                        level += adjust;
                    }

                    if( marker === "dead" ) {       // Dead is a special case: If dead < 0 then skull and dead are off. If dead == 0 then skull is off but dead is on. If dead > 0 then both skull and dead are on without badge.
                        if( level < 0 )
                            this.tokenInfo.tokenObj.set( "status_skull", false );
                        else {
                            this.tokenInfo.tokenObj.set( "status_skull", ( level === 0 ) ? false : true );
                            level = 0;      // Set this so "dead" is true below;
                        }
                    }
//log( "marker: " + marker + "   level: " + level);
                    this.tokenInfo.tokenObj.set( "status_" + marker, (( level < 0 ) ? false : (( level == 0 ) ? true : level.toString() )) );

                    if( !dupChar && ( mi["attrib"] != undefined ) && !(mook && lu === "health")) {       // If this character has not already been done, also change the character sheet.
                        var attribute = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: mi["attrib"] }, 0);
                        var oldAtt = parseInt(attribute.get( "current" ) );
                        var newAtt;
                        if( sm == undefined ) {         // This means it is a checkbox that is ether 1 (checked) or 0 (unchecked)
                            if( level < 0 ) {
                                if( oldAtt != 0)
                                    newAtt = 0;
                            }
                            else {
                                if( oldAtt != 1)
                                    newAtt = 1;
                            }
                        } else {        // There is a submenu
                            if( ss === "++" || ss === "--") {
                                if( level < 0 )
                                    ss = "u";
                                else if ( level == 0 )
                                    ss = "s";
                                else
                                    ss = String.fromCharCode( level + 96);
                            }
                            var ind = sm.indexOf( "^" + ss + "]");
                            if( ind != -1) {
                                var lio = sm.lastIndexOf( "[", ind);
                                if( lio != -1 ) {
                                    newAtt = sm.slice( lio + 1, ind);
                                }
                            } else if ( ss === "t" )
								newAtt = level ? "0" : "1";
                        }
                        if( newAtt !== undefined && oldAtt != newAtt) {
                            attribute.setWithWorker("current", newAtt);
                        }
                    } // End Character (not mook)
                    if( lu === "health" && !mook) {
                        if( this.tokenInfo.tokenObj.get("status_ninja-mask") == false )				// If unc or dead, mark blindsided. As a general rule (but this possibly will not be 100% accurate) if waking up, unblindside).
                            this.MarkerSet( [ "m", "blindsided", level >= 0 ? "s": "u" ] );
                        if( this.tokenInfo.tokenObj.get("status_back-pain") == false && level >= 0)		// If new status is unc or dead, make sure knocked down is on.
                            this.MarkerSet( [ "m", "knocked" ] );
                    }
//                } else {        // tokeninfo type is not "Token"
                } // End tokeninfo type is "Token"
            } catch(err) {
                log( "ParseObj.MarkerSet() error caught: " + err );
            }   // end catch
        } // End ParseObj.MarkerSet( ssa )




                    // ParseObj.Mask()
                    // Add or Remove a Mask template from this character. 
        this.Mask = function( ssa )  {
            'use strict';

            try {
				let po = this;

				function parseMask( multiplier, txt ) {
					'use strict';

					let followup = "",
						manually = "",
						first = 999999;
					let powersInd = findToken( "Powers" ),
						maneuversInd = findToken( "Special Maneuvers" );
					let block = txt.slice( 0, powersInd ),
						powers = txt.slice( powersInd + 7, maneuversInd ),
						maneuvers = txt.slice( maneuversInd + 18 );

					function findToken( toFind ) {
						'use strict';
						let tf = toFind.replace( /\s+/g, "\\s*" ) + "\\s*:\\s*";		// rationalize all whitespace.
						let fnd = txt.match( new RegExp( tf, "g" ) );
						if( fnd )
							return txt.indexOf( fnd[ 0 ] );
						else
							followup += "Warning! Failed to find: " + toFind + ".\n";
					}

					function modify( attrib, val) {
						'use strict';
						let aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: po.charID, name: attrib }, 0);
//		log( attrib + "  " + aobj.get( "current" ) + "  " + parseInt( val ));
						let newVal = (val === "Set") ? ((multiplier == -1) ? "0" : "1") : ((parseInt( aobj.get( "current" )) || 0) + ((parseInt( val) || 0) * multiplier ));
							aobj.setWithWorker( "current", newVal);
						return newVal;
					}
					function statBlock( toFind, attrib, noColon ) {
						'use strict';
						let tf = toFind.replace( /\s+/g, "\\s*" ) + "\\s*:\\s*",		// rationalize all whitespace.
							tf2 = toFind.replace( /\s+/g, "\\s*" ) + "\\s*:\\s*[+-\\d]+\\s*";
						if( noColon ) {
							tf = toFind.replace( /\s+/g, "\\s*" ) + "\\s*",		// rationalize all whitespace.
							tf2 = toFind.replace( /\s+/g, "\\s*" ) + "\\s*[+-\\d]+\\s*";
						}
						let fnd = block.match( new RegExp( tf2, "gi" ) );
						if( fnd && fnd.length > 0) {
							let i = fnd.length;
							while( --i > -1 ) {
								let curr = block.indexOf( fnd[ i ] );
								if( curr < first )
									first = curr;
								block = block.slice( 0, curr) + block.slice( curr + fnd[ i ].length );
								let fnd2 = fnd[ i ].match( new RegExp( tf, "gi" ));
								if (fnd2 )
									if( attrib )
										modify( attrib, parseInt( fnd[ i ].slice( fnd2[ 0 ].length )));
									return parseInt( fnd[ i ].slice( fnd2[ 0 ].length ));
							}
						} else
							followup += "Warning! Failed to find Stat Block entry: " + toFind + ".\n";
					}
					statBlock( "DEX", "Dex-Adjust" );
					statBlock( "STR", "Str-Adjust" );
					statBlock( "TOU", "Tou-Adjust" );
					statBlock( "PER", "Per-Adjust" );
					statBlock( "WIL", "Wil-Adjust" );
					statBlock( "CHA", "Cha-Adjust" );
					statBlock( "Initiative", "Misc-Initiative-Adjust" );
					statBlock( "Physical Defense", "Defense-Phys-Adjust" );
					statBlock( "Mystic Defense", "Defense-Myst-Adjust" );
					statBlock( "Social Defense", "Defense-Soc-Adjust" );
					statBlock( "Physical Armor", "Armor-Phys-Adjust" );
					statBlock( "Mystic Armor", "Armor-Myst-Adjust" );
					statBlock( "Unconsciousness", "Damage-Unconscious-Adjust" );
					statBlock( "Death", "Damage-Death-Rating-Adjust" );
					statBlock( "Wound", "Wound-Threshold-Adjust" );
					statBlock( "Knockdown", "Knockdown-Adjust" );
					statBlock( "Recovery Tests", "Recovery-Tests-Misc-Adjust" );
					statBlock( "Move", "Misc-Movement-Adjust" );
					statBlock( "Actions", "Actions" );

					let atk = statBlock( "Attack", "Adjust-Attacks-Misc", true );
					let dmg = statBlock( "Damage", "Adjust-Damage-Misc", true );
					if( atk || dmg )
						followup += "Remember to manually " + ((multiplier == -1) ? "subtract " : "add ")
								+ ( atk != undefined ? + atk + " to all attacks ": "" ) + (( atk != undefined && dmg != undefined) ? "and " : "") 
								+ ( dmg != undefined ? + dmg + " to all damages ": "" ) + "and to everything (such as creature powers) that act as attacks or damage."
								+ " For now they were added to Adjust-x-Misc above\n";

					block = block.slice( first ).replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ");		// Strip off any text before the first text block entry, then strip out everything that is not text. See if have anything left.
					if( block.length > 2 )
						followup += "Failed to parse '" + block + "' in Stat Block. You will have to figure that out manually.\n";
						
					// find last colon. find start or previous punctuation that is not paren. That is key. Everything from colon to end is value.  repeat. 
					let doing = powers,
						section = "Powers";
					function findItem () {
						let colon = doing.lastIndexOf( ":" );
						if ( colon == -1 ) {
							let tmp = doing;
							tmp = tmp.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ");		// Strip out everything that is not text. See if have anything left.
							if( tmp.length > 2 )
								followup += "Failed to parse '" + doing + "' in " + section + ". You will have to figure that part out manually.\n";
							return false;
						}
						let keyInd = Math.max( doing.lastIndexOf( ":", colon -1), doing.lastIndexOf( ".", colon -1));
						let key = doing.slice( keyInd + 1, colon).trim(),
							value = doing.slice( colon +1 );
						let k = key.toLowerCase();
						doing = doing.slice( 0, keyInd + 1 );
//log( key);
//log(value);
//log( doing)
						function checkbx( label, attrib ) {
							if( k.startsWith( label.toLowerCase() )) {
								modify( attrib, "Set" );
								if( multiplier == -1 )
									followup += "Unchecked '" + label + "' as part of removing mask. But you should double-check that this was not present in the base creature.\n";
								return true;
							} else
								return false;
						}
						function hasValue( label, attrib ) {
							if( k.startsWith( label.toLowerCase() )) {
								let val = modify( attrib, k.slice( label.length ).replace( /[()]/g, "") );
//log( "new val = " + val);
								return true;
							} else
								return false;
						}

						if( hasValue( "Fury", "Creature-Fury" )) {}
						else if( hasValue( "Resist Pain", "Creature-ResistPain" )) {}
						else if( hasValue( "Willful", "Creature-Willful" )) {}
						else if ( checkbx( "Grab and Bite", "Creature-GrabAndBite" )) {}
						else if ( checkbx( "Hamstring", "Creature-Hamstring" )) {}
						else if ( checkbx( "Hardened Armor", "Creature-HardenedArmor" )) {}
						else if ( checkbx( "Overrun", "Creature-Overrun" )) {}
						else if ( checkbx( "Pounce", "Creature-Pounce" )) {}
						else if ( checkbx( "Squeeze the Life", "Creature-SqueezeTheLife" )) {}

						else if ( checkbx( "Clip the Wing", "Opponent-ClipTheWing" )) {}
						else if ( checkbx( "Crack the Shell", "Opponent-CrackTheShell" )) {}
						else if ( checkbx( "Defang", "Opponent-Defang" )) {}
						else if ( checkbx( "Enrage", "Opponent-Enrage" )) {}
						else if ( checkbx( "Provoke", "Opponent-Provoke" )) {}
						else if ( checkbx( "Pry Loose", "Opponent-PryLoose" )) {}

									// These should never show up as masks, but no harm putting them here. 
						else if( hasValue( "Corrupt Karma", "Creature-CorruptKarma" )) {}
						else if( hasValue( "Cursed Luck", "Creature-CursedLuck" )) {}

						else
							manually += key + ":" + value + "   ";

						return true;
					} // end findItem ()

					while ( findItem() ) 
					{}

					doing = maneuvers;
					section = "Special Maneuvers";
					while ( findItem() )
					{}
					if( followup.length || manually.length)
						po.chat( ((manually.length ? "You will need to manually " + ((multiplier == -1) ? "remove" : "enter") + " the following powers: "  + manually + " ": "")
								+ (followup.length ? followup : "")).trim(), Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "API" );
					return true;
				} // end parseMask

				switch( ssa[ 1 ].toLowerCase().trim() ) {
					case "add": {
						let attribute = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "MaskList" }, "");
						let lst = attribute.get( "current" ).trim(),
							block = ssa.slice(3).join( ":" );		// Colons in the ssa[3] text block got treated as delimiters. Rebuild it. 
						if( lst.length < 2 )
							lst = [];		// strip out any remnant that was put here.
						else
							lst = lst.split( "," );
						lst.push( ssa[ 2 ] );
						let attribute2 = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "MaskDetail" }, ""),
							lst2 = attribute2.get( "current" ).trim();
						if( lst2.length < 2 )
							lst2 = "";		// strip out any remnant that was put here.
						let txt = "\n***** Start Mask " + ssa[ 2 ] + " *****\n" + block
								+ "\n***** End Mask " + ssa[ 2 ] + " *****";
						if ( parseMask( 1, block ) ) {
							attribute.setWithWorker( "current", lst.join());
							attribute2.setWithWorker( "current", (lst2 + txt).trim());
							this.chat( "Mask " + ssa[ 2 ].trim() + " added.", Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "API" );
						}
					}	break;
					case "remove": {
						let attribute = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "MaskList" }, "");
						let lst = attribute.get( "current" ).trim();
						lst = lst.split( "," );
						let ind = lst.indexOf( ssa[ 2 ] );
						if( ind > -1 ) {
							lst.splice( ind, 1);
							lst = lst.join();

							let attribute2 = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "MaskDetail" }, ""),
							lst2 = attribute2.get( "current" ).trim();
							if( lst2.length < 2 )
								lst2 = "";		// strip out any remnant that was put here.
							let indStart = lst2.indexOf( "***** Start Mask " + ssa[ 2 ] + " *****" ),
								indEnd = lst2.indexOf( "***** End Mask " + ssa[ 2 ] + " *****" );
							if( indStart != -1 && indEnd != -1 ) {
								indEnd += 21 + ssa[ 2 ].length;
								let block = lst2.slice( indStart, indEnd);
								lst2 = lst2.slice( 0, indStart).trim() + lst2.slice( indEnd).trim();
								if( parseMask( -1, block )) {
									attribute.setWithWorker( "current", lst ? lst : "0");
									attribute2.setWithWorker( "current", lst2 );
									this.chat( "Removed Mask " + ssa[ 2 ], Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "API" );
								}
							} else
								this.chat( "Mask data mismatch error. Removed Mask " + ssa[ 2 ] + " from MaskList, but was unable to find it in MaskDetail",  Earthdawn.whoFrom.apierror );
						}
						else 
							this.chat( "Unable to remove Mask " + ssa[ 2 ], Earthdawn.whoTo.player | Earthdawn.whoFrom.api | Earthdawn.whoFrom.noArchive, "API" );
					}	break;
					default: 
						log( "edParse.Mask() Unknown command" );
						log( ssa );
				}
            } catch(err) {
                log( "ParseObj.Mask() error caught: " + err );
            }   // end catch
        } // End ParseObj.Mask( ssa )



                    // ParseObj.funcMisc()
                    // This is a collection of several minor functions that don't deserve their own subroutines. 
					//
					// CorruptKarma
					// MacroCreate
					// SetAdjust
					// State - GM set values into the State.
        this.funcMisc = function( ssa )  {
            'use strict';

            try {
				switch ( ssa[ 1 ].toLowerCase() ) {
				case "corruptkarma": 
					try {
						if( playerIsGM( this.edClass.msg.playerid )) {
							let aobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: this.charID, name: "Creature-CorruptKarmaBank" }, 0),
								bobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: this.charID, name: "Creature-CorruptKarma" }, 0);
							let	num = parseInt( ssa[ 2 ] ),
								bank = parseInt( aobj.get( "current" )),
								kc = parseInt( bobj.get( "current" ));
							let realnum =( num <= bank ) ? num: bank,
								txt = "";
							if( realnum != 0 ) {
								aobj.setWithWorker( "current", bank - realnum );
								bobj.setWithWorker( "current", kc + realnum );
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
							this.chat( "Error! Must be GM to Corrupt Karma.", Earthdawn.whoFrom.apierror ); 
					} catch(err) {
						log( "ED.funcMisc.CorruptKarma error caught: " + err );
					}   // end catch
					break;
				case "macrocreate": 
					try {
						var cmd;
						if( ssa.length > 2 )
							cmd = ssa[ 2 ].toLowerCase();
						if( cmd == "delete" || cmd == "refresh" ) {
							var macs = findObjs({ _type: "macro", _playerid: this.edClass.msg.playerid, visibleto: "all" });
							_.each( macs, function (macObj) {
								macObj.remove();
							})
						}
						if( cmd != "delete" && !playerIsGM( this.edClass.msg.playerid ) ) {
							this.chat( "Error! Only GM is allowed to do run MacroCreate.", Earthdawn.whoFrom.apierror); 
						} else if( cmd == "create" || cmd == "refresh" ) {
							this.MacroDetail( "Roll-Public", "!edsdr~ ?{Step|0}~ ?{Bonus or Karma Step|0}~ for ?{reason| no reason}", false );
							this.MacroDetail( "Roll-Player-GM", "!edsdrGM~ ?{Step|0}~ ?{Bonus or Karma Step|0}~ for ?{reason| no reason}", false );
							this.MacroDetail( "Roll-GM-Only", "!edsdrHidden~ ?{Step|0}~ ?{Bonus or Karma Step|0}~ for ?{reason| no reason}", false );
							this.MacroDetail( "NpcReInit", "!Earthdawn~ rerollnpcinit", false );
									/* Leave Test in here. It can be uncommented when it is actually needed. */ 
//							this.MacroDetail( "Test", "!edToken~ %{selected|Test}", true ); 
							this.MacroDetail( "Token", "!edToken~", false );

							this.MacroDetail( "​Attrib", "!Earthdawn~ ChatMenu: Attrib", true );
							this.MacroDetail( "Damage", "!Earthdawn~ ChatMenu: Damage", true );
							this.MacroDetail( "Init", "!edToken~ %{selected|Dex-Initiative-Check}", true );
							this.MacroDetail( "Karma", "!edToken~ !Earthdawn~ ForEach~ marker: karma :t", true );
							this.MacroDetail( "Skills", "!Earthdawn~ ChatMenu: Skills", true );
							this.MacroDetail( "Status", "!Earthdawn~ ChatMenu: Status", true );
							this.MacroDetail( "Talents", "!Earthdawn~ ChatMenu: Talents-Non", true );
/*                    this.MacroDetail( "•Status", "!edToken~ !Earthdawn~ ForEach~ Marker: ?{@{selected|bar2|max}}", true );
*/ /*                    this.MacroDetail( "⚡Cast", "!edToken~ %{selected|SP-Spellcasting}", true );   /* high voltage: 9889; 
*/

							this.MacroDetail( "➴Clear-Targets", "!Earthdawn~ charID: @{selected|character_id}~  ForEach~ TargetsClear", true);
							this.MacroDetail( "➴Set-Targets", "!Earthdawn~ charID: @{selected|character_id}~ Target: Set", true);
						}
					} catch(err) {
						log( "ED.funcMisc.MacroCreate error caught: " + err );
					}   // end catch
					break;
				case "setadjust":
                    // For the current character, copy all the buffs from the Combat Tab as adjustments on the Adjustments tab.
					// This makes it easier for the GM to enter monsters. enter Buffs on the Combat tab until the values are right, then use this option to copy 
					// them all to the Adjustments tab.
					try {
						let po = this;

						function copyCombatToAdjust( from, to, noClear )  {
							'use strict';

							let aobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: po.charID, name: from }, 0),
								bobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: po.charID, name: to }, 0);
							bobj.setWithWorker( "current", parseInt( aobj.get( "current" )) + parseInt( bobj.get( "current" )) );
							if( !noClear )
								aobj.setWithWorker( "current", 0 );
						} // End copyCombatToAdjust()

						copyCombatToAdjust( "PD-Buff", "Defense-Phys-Adjust" );
						copyCombatToAdjust( "MD-Buff", "Defense-Myst-Adjust" );
						copyCombatToAdjust( "SD-Buff", "Defense-Soc-Adjust" );
						copyCombatToAdjust( "PD-ShieldBuff", "Shield-Phys" );
						copyCombatToAdjust( "MD-ShieldBuff", "Shield-Myst" );
						copyCombatToAdjust( "PA-Buff", "Armor-Phys-Adjust" );
						copyCombatToAdjust( "MA-Buff", "Armor-Myst-Adjust" );
						copyCombatToAdjust( "Movement-Buff", "Misc-Movement-Adjust" );
						copyCombatToAdjust( "Health-Buff", "Damage-Unconscious-Adjust", true );
						copyCombatToAdjust( "Health-Buff", "Damage-Death-Rating-Adjust" );
						copyCombatToAdjust( "Recovery-Buff", "Recovery-Adjust" );
						copyCombatToAdjust( "Wound-Threshold-Buff", "Wound-Threshold-Adjust" );
						copyCombatToAdjust( "Misc-IP-Buff", "Misc-IP-Adjust" );
						copyCombatToAdjust( "Misc-Initiative-Buff", "Misc-Initiative-Adjust" );
					} catch(err) {
						log( "ED.funcMisc.SetAdjust error caught: " + err );
					}   // end catch
					break;
				case "state":
                    // Set various state.Earthdawn values. 
                    // ssa is an array that holds the parameters.
                    //      Earthdawn~ State~ (one of the options below)~ (parameters). 
					try {
						if( !playerIsGM( this.edClass.msg.playerid ) ) 
							this.chat( "Error! Only GM can set state variables." );
						else {
							var logging = false;
							switch( ssa[ 2 ].toLowerCase() ){
							case "cursedlucksilent": {
								let t = parseInt( ssa[ 3 ], 2 );
								state.Earthdawn.CursedLuckSilent = ( isNaN( t ) || t <= 0 ) ? undefined: t;
								this.chat( "Campaign now set so that CursedLuckSilent is " + state.Earthdawn.CursedLuckSilent, Earthdawn.whoFrom.api | Earthdawn.whoTo.gm | Earthdawn.whoFrom.noArchive);
							}	break;
							case "edition":
								state.Earthdawn.g1879 = (ssa[ 3 ].slice( -4 ) === "1879");
								state.Earthdawn.gED = !state.Earthdawn.g1879;
								state.Earthdawn.game = state.Earthdawn.gED ? "ED" : "1879";
								state.Earthdawn.edition = parseInt( ssa[ 3 ] );
								this.chat( "Campaign now set to use " + state.Earthdawn.game + " Edition " + state.Earthdawn.edition + " rules."  );
								var count = 0;

								var chars = findObjs({ _type: "character" });
								_.each( chars, function (charObj) {
									var cid = charObj.get( "_id" );
									var att = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: cid, name: "edition" });
									att.setWithWorker("current", state.Earthdawn.edition );
									++count;
								}) // End ForEach character
								this.chat( count + " character sheets updated." );
								break;
							case "effectisaction":
								state.Earthdawn.effectIsAction = parseInt( ssa[ 3 ] ) ? true : false;
								this.chat( "Campaign now set so that Action tests " + (state.Earthdawn.effectIsAction ? "are" : "are NOT") + " Effect tests."  );
								var count = 0;

								var chars = findObjs({ _type: "character" });
								_.each( chars, function (charObj) {
									var cid = charObj.get( "_id" );
									var att = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: cid, name: "effectIsAction" });
									att.setWithWorker("current", state.Earthdawn.effectIsAction );
									++count;
								}) // End ForEach character
								this.chat( count + " character sheets updated." );
								break;
							case "logstartup":
								state.Earthdawn.logStartup = parseInt( ssa[ 3 ] ) ? true: false;
								logging = true;
								break;
							case "logcommandline":
								state.Earthdawn.logCommandline = parseInt( ssa[ 3 ] ) ? true: false;
								logging = true;
								break;
							case "nopileondice": {
								let t = parseInt( ssa[ 3 ] );
								state.Earthdawn.noPileonDice = ( isNaN( t ) || t < 0 ) ? undefined: t;
								this.chat( "Campaign now set so that noPileOnDice is " + state.Earthdawn.noPileonDice, Earthdawn.whoFrom.api | Earthdawn.whoTo.gm | Earthdawn.whoFrom.noArchive);
							}	break;
							case "nopileonstep": {
								let t = parseFloat( ssa[ 3 ] );
								state.Earthdawn.noPileonStep = ( isNaN( t ) || t <= 0 ) ? undefined: t;
								this.chat( "Campaign now set so that noPileOnStep is " + state.Earthdawn.noPileonStep, Earthdawn.whoFrom.api | Earthdawn.whoTo.gm | Earthdawn.whoFrom.noArchive);
							}	break;
								
							case "style":
								state.Earthdawn.style = parseInt( ssa[ 3 ] );
								let style;
								switch (state.Earthdawn.style) {
									case Earthdawn.style.VagueSuccess: 	style = " - Vague Successes."; break;
									case Earthdawn.style.VagueRoll: 	style = " - Vague Roll.";   break;
									case Earthdawn.style.Full:
									default:  							style = " - Full."; break;
								}
								this.chat( "Campaign now set to use result style: " + state.Earthdawn.style + style  );
								break;
							}
							if( logging )
								this.chat( "Campaign now set to " + state.Earthdawn.game 
											+ " - logging Startup: " + state.Earthdawn.logStartup + " -   " 
											+ "Commandline: " + state.Earthdawn.logCommandline + "."  );
						}
					} catch(err) {
						log( "ED.funcMisc.State() error caught: " + err );
					}   // end catch
					break;
				case "uninstall":                     // remove all Earthdawn entries from state. 
					if( playerIsGM( this.edClass.msg.playerid )) {
								// go through all attributes for all characters, and if the attribute is API, set it to false. 
						let attributes = findObjs({ _type: "attribute" });
						_.each( attributes, function (att) {
							if( att.get("name") === "API" )
								att.set( "current", "0" );
						}); // End for each attribute.
						state.Earthdawn = undefined;
					}
					break;
				}
            } catch(err) {
                log( "ED.funcMisc error caught: " + err );
            }   // end catch
        } // End ParseObj.funcMisc()


                    // If this is being processed for a single token,
					// and that token is a mook, then 
					// return the number of wounds that mook has, as recorded on the token bar2_value
        this.mookWounds = function()  {
            'use strict';
            try {
                if( this.tokenInfo === undefined ) {
                    this.chat( "Error! tokenInfo undefined in mookWounds() command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror); 
                    return 0;
                }
                if( this.charID === undefined ) {
                    this.chat( "Error! charID undefined in mookWounds() command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror); 
                    return 0;
                }
				if( getAttrByName( this.charID, "NPC") != "2" )
					return 0;
                if( this.tokenInfo.type !== "token" )
					return 0;

				return parseInt( this.tokenInfo.tokenObj.get( "bar2_value" ) );
            } catch(err) {
                log( "ED.mookWounds error caught: " + err );
            }   // end catch
        } // End ParseObj.mookWounds()



                    // ParseObj.Record ()
                    // Post an accounting journal entry for SP, LP, or Dev points gained or spent. 
                    // ssa[ 1] Real Date
                    // ssa[ 2] Throalic Date
                    // ssa[ 3] Item: SP, LP, Dev, or Other
                    // ssa[ 4] Amount
                    // ssa[ 5] Type: Gain, Spend, Decrease (ungain), or Refund (unspend).
                    // ssa[ 6] Reason - Text.
        this.Record = function( ssa )  {
            'use strict';

            try {
                if( this.charID === undefined ) {
                    this.chat( "Error! Trying Record() when don't have a CharID.", Earthdawn.whoFrom.apierror); 
                    return;
                } 

                var nchar = 0;
                var iyear;
                var oldReal = "";
                var oldThroalic = "";
                var res;
				var reason = ":";
                var post;
                var kobj  = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "record-journal" }, "");
                var oldStr =  kobj.get( "current" );

                do {
                    res = oldStr.slice( nchar, 28 + nchar).match( /\b\d{4}[\-\#\\\/\s]\d{1,2}[\-\#\\\/\s]\d{1,2}\b/g );
                    if( res === null ) {
						nchar = oldStr.length;
                        continue;
					}

                    for( var i = 0; i < res.length; i++) {		// Find out what dates were on the last entry posted.
                        iyear = parseInt( res[ i ]);
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

                var iAmount = parseInt( ssa[ 4 ]);
                var Item = ssa[ 3 ];
                var lookup;
				if( Item != "Dev" && Item != "SP" && Item != "LP" && Item != "Other")
					Item = "LP";	// A bug sometimes sends a wierd value. 
                if( Item !== "Other" && iAmount != 0 ) {
                    if( Item === "Dev" )
                        lookup = "Devotion-Points";
                    else if( Item === "SP" )
                        lookup = "Wealth_Silver";
                    else
                        lookup = "LP-Current";
                    if(  ssa[ 5 ] == "Spend" || ssa[ 5 ] == "Decrease" )
                        iAmount *= -1;
                    var newTotal = iAmount;
                    let aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: lookup }, 0);
                    newTotal += parseInt( aobj.get( "current" ) || 0 );
                    if( isNaN( newTotal  ))
                        newTotal = iAmount;
					if( Item === "SP" ) {		// If don't have enough silver, automatically convert gold to silver to cover.
						var gobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "Wealth_Gold" }, 0);
						var gold = parseInt( gobj.get( "current" ) || 0 );
						while( newTotal < 0 && gold > 0 ) {
							--gold;
							newTotal += 10;
						}
						gobj.setWithWorker("current", gold );
					}
                    aobj.setWithWorker("current", newTotal );
                } // End not Other

				for( let i = 6; i < ssa.length; i++ ) 		// If there was a colon in the reason, put it back in.
					reason += ":" + ssa[ i ];
                post =  (( ssa[ 1 ] === oldReal.trim() )    ? "" : ( ssa[ 1 ] + "   ")) +
                        (( ssa[ 2 ] === oldThroalic.trim()) ? "" : ( ssa[ 2 ] + "   ")) +
                        (( ssa[ 3 ] === "Other")            ? "" : ( ssa[ 5 ] + " " + parseInt( ssa[ 4 ]) + " " + Item + " ")) +
                        (( newTotal === undefined)          ? "" : ( "(new total " + (( gold === undefined ) ? "" : gold + " GP and " ) + 
																	newTotal + " " + Item + ") "  )) +
                        reason.slice(1);

                if( Item === "LP" && (ssa[ 5 ] === "Gain" || ssa[ 5 ] === "Decrease")) {
                    var newTotal2 = iAmount;
                    let aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "LP-Total" }, 0);
                    newTotal2 += parseInt( aobj.get( "current" ) || 0 );
                    if( isNaN( newTotal2  ))
                        newTotal2 = iAmount;
                    post +=  " (new career total " + newTotal2 + ") ";
                    aobj.setWithWorker("current", newTotal2 );
                }
// log( post);
                if ( ( ssa[ 1 ] !== oldReal.trim()) || ( ssa[ 2 ] !== oldThroalic.trim()) )
                   kobj.setWithWorker("current", post + "\n" + oldStr );      // Post at top of page.
                else {
                    nchar = oldStr.indexOf( "\n" );
                    if( nchar === -1 )
                        nchar = oldStr.length;
                    kobj.setWithWorker("current", oldStr.slice( 0, nchar) + "   " + post + oldStr.slice( nchar ) );      // Post as a continuation of the top line.
                }
            } catch(err) {
                log( "ED.Record() error caught: " + err );
            }   // end catch
        } // End parseObj.Record()



                    // ParseObj.RerollNpcInit()
                    // Go through all the initiatives currently existing, empty the list, but issue a command to have all conscious NPC's re-roll initiative.
        this.RerollNpcInit = function()  {
            'use strict';

            try {
                var turnorder = ( Campaign().get("turnorder") == "") ? [] : JSON.parse( Campaign().get("turnorder") );
                Campaign().set("turnorder", ""); 
                var chatMsg = "";
                _.each( turnorder, function( sel ) {
                    var TokObj = getObj("graphic", sel.id); 
                    if (typeof TokObj === 'undefined' )
                        return;

                    var cID = TokObj.get("represents"); 
                    var CharObj = getObj("character", cID) || ""; 
                    if (typeof CharObj === 'undefined') 
                        return;
                        
                    if ((parseInt( TokObj.get( "bar3_value" ) || 0) < (getAttrByName( cID, "Damage", "max" ) || 0)) &&
                                ( parseInt(getAttrByName( cID, "NPC")) > 0 ))		// Not Items, and not PCs. 
                        chatMsg += "~ SetToken : " + sel.id + "~ value : Initiative~ Init~ SetStep: 0~ SetResult: 0";
                });  // End for each selected token

                if( chatMsg.length > 0 )
                    this.chat( "!Earthdawn" + chatMsg);
            } catch(err) {
                log( "ED.RerollNpcInit() error caught: " + err );
            }   // end catch
        } // End ParseObj.RerollNpcInit()




                    // ParseObj.Roll ( ssa )
                    // Roll a Test for selected token.
                    //      ssa[] - Step modifiers. 
        this.Roll = function( ssa )  {
            'use strict';
            try {
				let init = ssa[ 0 ].toLowerCase() === "init";
                if( this.tokenInfo === undefined || (init && this.tokenInfo.tokenObj === undefined)) {
					if( init ) 		this.chat( "Initiative requires a token be selected. Do you have a token selected?"); 
					else			this.chat( "Error! tokenInfo undefined in Roll() command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror); 
                    return;
                }
                if( init && ("step" in this.misc === false)) {
                    this.chat( "Error! Step value undefined in Roll() command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror); 
                    return;
                }
				this.misc[ "cButtons" ] = [];
                var dice;
                var recipients = this.WhoSendTo();
                var step = (this.misc[ "step" ] || 0) + this.ssaMods( ssa );   // Add any mods to roll.
				if( this.indexTarget !== undefined ) {
					let tokChar = Earthdawn.tokToChar( Earthdawn.getParam( this.targetIDs[ this.indexTarget ], 1, ":")); 
					this.misc[ "targetChar" ] = tokChar;
					if ( this.uncloned.bFlags & Earthdawn.flags.HitsFound ) {
						let extra = parseInt( Earthdawn.getParam( this.targetIDs[ this.indexTarget ], 2, ":"));
						if( extra > 0 ) {
							step += extra * ((getAttrByName( tokChar, "Creature-HardenedArmor") == "1") ? 1: 2);
							this.misc[ "stepExtra" ] = extra;
						}
					}
				}
				if( init && getAttrByName( this.charID, "Misc-StrainPerTurn" ) > 0 ) {
					this.misc[ "StrainPerTurn" ] = getAttrByName( this.charID, "Misc-StrainPerTurn" );
					this.doLater += "~StrainSilent:" + this.misc[ "StrainPerTurn" ];
				}

				this.doNow();
                if ( step < 1 ) {
                    dice = "d0";
					if( init )		
						this.misc[ "warnMsg" ] = "If anything other than armor and wounds are causing " + this.tokenInfo.tokenObj.get( "name" )
											+ " an initiative step of " + step + " it is probably illegal.";
					else if (!this.misc[ "reason" ].startsWith( "1 " ) && !this.misc[ "reason" ].endsWith( " Only" ))
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
                    dice += "+" + this.misc[ "result" ];
					this.misc[ "resultMod" ] = this.misc[ "result" ];
					this.misc[ "effectiveStep" ] += this.misc[ "result" ];
				}
				if( dice.startsWith( "+" ))
					dice = dice.slice( 1 );
				this.misc[ "dice" ] = dice;
				let sh = "vs.";
                if( "targetName" in this.misc )
					sh += " " + this.misc[ "targetName" ];
                if( "targettype" in this.misc )
					sh += " " + this.misc[ "targettype" ];
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
				if (sh.length > 3 )
					this.misc["subheader"] = sh;
				let aobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: this.charID, name: "Creature-CursedLuck" }, 0),
					cluck = parseInt( aobj.get( "current" ));
				if( cluck > 0 ) {
					this.misc[ "CursedLuck" ] = cluck;
					aobj.setWithWorker( "current", 0);
				}
				if ((cluck > 0) || (getAttrByName( this.charID, "NPC") > 0 && ((state.Earthdawn.noPileonDice != undefined && state.Earthdawn.noPileonDice >= 0) 
						|| (state.Earthdawn.noPileonStep != undefined && state.Earthdawn.noPileonStep > 0))))
					this.misc[ "DiceFunnyStuff" ] = true;
				if( "FX" in this.misc && (this.misc[ "FX" ].startsWith( "Attempt" ) || this.misc[ "FX" ].startsWith( "Effect" )))
					this.FX( this.misc[ "FX" ] );

				this.misc[ "natural" ] = ((this.targetNum || 0) == 0) 
							&& !(recipients & Earthdawn.whoTo.player ) 
							&& !( this.uncloned.bFlags & Earthdawn.flags.HitsFound ) 
							&& !( this.bFlags & Earthdawn.flags.Recovery )
							&& !( "diceFunnyStuff" in this.misc )
							&& !init;
                if ( this.misc[ "natural" ] ) {		// A natural roll is one without a callback. It just goes out, and the raw results are returned.  Done for rolls without target numbers, and rolls that are sent to both player and gm, but not public.
					this.misc[ "roll" ] = "[[" + dice + "]]";
                    this.rollFormat( recipients );
                } else {		// Not a "natural" roll. We are going to send it to the dice roller now, but capture the result for interpretation.
                    var po = this;
                    po.edClass.rollCount++;
                    sendChat( "player|" + this.edClass.msg.playerid, "/r " + dice, function( ops ) {  
                        'use strict';
                                                // NOTE THAT THIS IS THE START OF A CALLBACK FUNCTION
						if( ops.length !== 1 )
							log( "Earthdawn.js program warning! ops returned length of " + ops.length);
                        let con = JSON.parse(ops[0].content);
						if ( "DiceFunnyStuff" in po.misc ) {
							po.misc[ "DiceOrigional" ] = con;
							con = po.CursedLuck( po.misc[ "CursedLuck" ], con );
						}
						po.misc[ "result" ] = con.total;
						po.misc[ "showResult" ] = (( "StyleOverride" in po.misc ? po.misc[ "StyleOverride" ] : state.Earthdawn.style) != Earthdawn.style.VagueRoll) 
									|| ( po.bFlags & Earthdawn.flags.VerboseRoll ) 
									|| ((po.targetNum || 0) == 0) || init
									|| (recipients == Earthdawn.whoTo.gm);		// going to gm only.

											// We have a target number. Count successes.
                        if ((po.targetNum || 0) > 0) {
                            let res = po.misc[ "result" ] - po.targetNum;
                            if( res < 0 ) {
								po.misc[ "failBy" ] = Math.abs(res);
                                po.edClass.countFail++;
                            } else {		// Have target number and succeeded.
								po.misc[ "succBy" ] = Math.abs(res);
								po.misc[ "extraSucc" ] = Math.floor(res / 5) + (("grimCast" in po.misc) ? 1 : 0);
                                po.edClass.countSuccess++;
								if( "FX" in po.misc && po.misc[ "FX" ].startsWith( "Success" ))
									po.FX( po.misc[ "FX" ] );
								if( (po.bFlags & Earthdawn.flagsTarget.Riposte) && po.misc[ "extraSucc" ] > 0 && ("targetNum2" in po.misc))		// Special situation, Since the test succeeded against the first target number, compare it against a 2nd target number to count the successes!
									po.misc[ "secondaryResult" ] = po.misc[ "result" ] - po.misc[ "targetNum2" ];
                                if( po.bFlags & Earthdawn.flagsTarget.Mask && po.targetIDs[ po.indexTarget] !== undefined ) 		// The 2nd half of this keeps riposte tests from messing it up.
									po.rollESbuttons();
                            } 	// End have successes
                        } 	// End we have a target number

									// Apply Damage if appropriate. IE: if this was a damage roll, and hits were found on any of the selected tokens.
						if( po.uncloned.bFlags & Earthdawn.flags.HitsFound ) {
							let dcode, dtext;
							if (      po.bFlags & Earthdawn.flagsArmor.PA )   	{ dcode = ["PA"]; dtext = ["Physical"]; } 
							else if ( po.bFlags & Earthdawn.flagsArmor.MA )   	{ dcode = ["MA"]; dtext = ["Mystic"]; } 
							else if ( po.bFlags & Earthdawn.flagsArmor.None ) 	{ dcode = ["NA"]; dtext = ["No"]; }
							else if ( po.bFlags & Earthdawn.flagsArmor.Unknown) { dcode = ["PA", "MA", "NA"]; dtext = ["Physical","Mystic","No"]; }
							if( dcode !== undefined ) {
								let targs;
								if ( po.bFlags & Earthdawn.flags.WillEffect )
									targs = po.targetIDs;
								else
									targs = [po.targetIDs[ po.indexTarget ]]
								for( let ind = 0; ind < targs.length; ++ind ) {
									let tID = Earthdawn.getParam( targs[ ind ], 1, ":");
									for( let i = 0; i < dcode.length; ++i ) {
										if( po.bFlags & Earthdawn.flagsArmor.Natural )
											dcode[i] += "-Nat";
										po.misc[ "cButtons" ].push( { 
											link: "!Earthdawn~ setToken: " + tID + "~ Damage: " +dcode[i] + ": " + po.misc[ "result" ] 
											+ ": ?{Damage Mod (" + ((po.bFlags & Earthdawn.flagsArmor.Natural) ? " Natural" : "") + dtext[i] + " Armor applies)|0}",
											text: "Apply Dmg " + dcode[i] + " - " + po.getTokenName( tID ) });
									}
								}
							}
						} // End HitsFound

						if( init ) {			// This is an initiative roll.
							let tID = po.tokenInfo.tokenObj.get( "id" );
							let turnorder = (Campaign().get("turnorder") == "") ? [] : ( JSON.parse(Campaign().get("turnorder")));
							turnorder = _.reject(turnorder, function( toremove )   { return toremove.id === tID });
							turnorder.push({ id: tID, pr: po.misc[ "result" ], secondary: ("000" + po.misc[ "result" ]).slice(-3) + ((getAttrByName( po.charID, "NPC" ) == "0") ? "1" : "0" )
									+ ("000" + getAttrByName( po.charID, "Attrib-Dex-Curr" )).slice(-3) + ("000" + step).slice( -3)}); 
							turnorder.sort( function(a,b) { 
								'use strict'; 
								if( "secondary" in a && "secondary" in b ) {
									if( a.secondary < b.secondary ) return 1;
									else if ( a.secondary > b.secondary ) return -1;
									else return 0;
								} else
									return (b.pr - a.pr) 
							});	// End turnorder.sort();
							Campaign().set("turnorder", JSON.stringify(turnorder));
						}	// End Initiative

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
                    }, {noarchive:true});  // End of callback function
					if( init )
						return true;	// If this is an init roll, then parseLoop should fallout here. 
                }
            } catch(err) {
                log( "ED.Roll() error caught: " + err );
            }   // end catch
        } // End ParseObj.Roll(ssa)





                    // ParseObj.rollESbuttons()
                    // create chat window buttons for the user to spend extra successes upon. 
					// Also do the special coding required for powers such as Cursed Luck or Corrupt Karma here (instead of buttons). 
        this.rollESbuttons = function()  {
            'use strict';
            try {
				let suc = this.misc[ "extraSucc" ],
					po = this,
					targetName;

				function makeButton( nm, txt, lnk, tip ) {
						po.misc[ "cButtons" ].push( { name: nm, text: txt, link: lnk, tip: tip });
				};

				if (this.bFlags & Earthdawn.flagsTarget.Highest)
					var lstart = 0, lend = this.targetIDs.length;
				else
					var lstart = this.indexTarget, lend = this.indexTarget + 1;
				let charStr1 = "!Earthdawn~ " + (( this.tokenInfo !== undefined && this.tokenInfo.tokenObj !== undefined) 
								? "setToken: " + this.tokenInfo.tokenObj.get( "id" ) : "charID: " + this.charID );
				let numTargets = lend - lstart;
				for( let i = lstart; i < lend; ++i ) {
					if ( this.misc[ "Special" ] === "CorruptKarma" ) {
						if( playerIsGM( this.edClass.msg.playerid ) ) {
							let targetChar = Earthdawn.tokToChar( this.targetIDs[ i ] );
							if( targetChar ) {
								let aobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: targetChar, name: "Creature-CorruptKarmaBank" }, 0),
									val = parseInt(this.misc[ "extraSucc" ]) + 1 + parseInt( aobj.get( "current" ));
								aobj.setWithWorker( "current", val );
							}
						} else
							this.chat( "Error! Only GM is allowed to do run CorruptKarma powers!", Earthdawn.whoFrom.apierror); 
					} else if ( this.misc[ "Special" ] === "CursedLuck" ) {
						if( playerIsGM( this.edClass.msg.playerid ) ) {
							let targetChar = Earthdawn.tokToChar( this.targetIDs[ i ] );
							if( targetChar ) {
								let aobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: targetChar, name: "Creature-CursedLuck" });
								aobj.setWithWorker( "current", parseInt(this.misc[ "extraSucc" ]) + 1 );
							}
						} else 
							this.chat( "Error! Only GM is allowed to do Cursed Luck powers!", Earthdawn.whoFrom.apierror); 
					} else {		// It is a more generic hit, without any special coding. 
						this.TokenSet( "add", "Hit", this.targetIDs[ i ], "0");			// Make note that this token has hit that token.
						if( numTargets > 1 )
							targetName = this.getTokenName( this.targetIDs[ i ] );
						if( !(this.bFlags & Earthdawn.flags.NoOppMnvr )) {		// We don't record these extra successes as something that affects damage rolls.
							makeButton( targetName, "Bonus Dmg", charStr1 + "~ StoreInToken: Hit: " + this.targetIDs[ i ] 
										+ ":?{How many of the extra successes are to be devoted to bonus damage to " + this.getTokenName( this.targetIDs[ i ] ) + "|" + suc + "}",
									"How many of the " + suc + " extra successes are to be devoted to bonus damage to " + this.getTokenName( this.targetIDs[ i ] ));
							makeButton( targetName, "Opp Mnvr", charStr1 + "~ ChatMenu: OppMnvr: " + this.targetIDs[ i ], "Choose Opponent Maneuvers that might or might not be applicable to this Target." );

							let cflags = getAttrByName( this.charID, "CreatureFlags" );
							if( cflags & Earthdawn.flagsCreature.CreatureMask ) {
								if( cflags & Earthdawn.flagsCreature.GrabAndBite ) 
									makeButton( targetName, "Grab & Bite", charStr1 + "~ CreaturePower: " + "GrabAndBite: " + this.targetIDs[ i ],
										"The creature may spend an additional success from an Attack test to automatically grapple an opponent. Grappled opponents automatically take bite damage each round until the grapple is broken." );
								if( cflags & Earthdawn.flagsCreature.Hamstring ) 
									makeButton( targetName, "Hamstring", charStr1 + "~ CreaturePower: " + "Hamstring: " + this.targetIDs[ i ],
										"The creature may spend an additional success from an Attack test to halve the opponent’s Movement until the end of the next round. If the attack causes a Wound, the penalty lasts until the Wound is healed." );
								if( cflags & Earthdawn.flagsCreature.Overrun ) 
									makeButton( targetName, "Overrun", charStr1 + "~ CreaturePower: " + "Overrun: " + this.targetIDs[ i ],
										"The creature may spend an additional success from an Attack test to force an opponent with a lower Strength Step to make a Knockdown test against a DN equal to the Attack test result." );
								if( cflags & Earthdawn.flagsCreature.Pounce ) 
									makeButton( targetName, "Pounce", charStr1 + "~ CreaturePower: " + "Pounce: " + this.targetIDs[ i ],
										"If the creature reaches its opponent with a leap and the opponent isn’t too much larger, the creature may spend an additional success from the Attack test to force the opponent to make a Knockdown test against a DN equal to the Attack test result." );
								if( cflags & Earthdawn.flagsCreature.SqueezeTheLife ) 
									makeButton( targetName, "Squeeze the Life", charStr1 + "~ CreaturePower: " + "SqueezeTheLife: " + this.targetIDs[ i ],
										"The creature may spend two additional successes from an Attack test to automatically grapple an opponent. Grappled opponents automatically take claw damage each round until the grapple is broken." );
								if( cflags & Earthdawn.flagsCreature.CreatureCustom1 ) 
									makeButton( targetName, getAttrByName( this.charID, "Creature-Custom1Name" ), charStr1 + "~ CreaturePower: " + "cCustom1: " + this.targetIDs[ i ], getAttrByName( this.charID, "Creature-Custom1Desc") );
								if( cflags & Earthdawn.flagsCreature.CreatureCustom2 ) 
									makeButton( targetName, getAttrByName( this.charID, "Creature-Custom2Name" ), charStr1 + "~ CreaturePower: " + "cCustom2: " + this.targetIDs[ i ], getAttrByName( this.charID, "Creature-Custom2Desc") );
								if( cflags & Earthdawn.flagsCreature.CreatureCustom3 ) 
									makeButton( targetName, getAttrByName( this.charID, "Creature-Custom3Name" ), charStr1 + "~ CreaturePower: " + "cCustom3: " + this.targetIDs[ i ], getAttrByName( this.charID, "Creature-Custom3Desc") );
							}
						}
					}	// End it's a hit.
				} // end foreach target
            } catch(err) {
                log( "ED.RollESbuttons() error caught: " + err );
            }   // end catch
        } // End ParseObj.RollESbuttons()



                    // ParseObj.rollFormat()
                    // create html to nicely format the roll results. 
        this.rollFormat = function( recipients, rolls )  {
            'use strict';

            try {
				let po = this,
					playerIsGM = this.edClass.msg.who.indexOf(" (GM)" ) !== -1;
				let whichMsgs = recipients & ( playerIsGM ? ~Earthdawn.whoTo.player : ~0x00);		// This is recipients, but if playerIsGM, then strips out the to player bit.

				function newSect() {
					return new HtmlBuilder( "", "", {
						style: {
						"background-color": "white",
						"border": "solid 1px black",
						"border-radius": "5px",
						"overflow": "hidden",
						"width": "100%"
				}})};

				function newBody( sect ) {
					let body = sect.append( ".body", "", {
						style: {
						"text-align": 	"left"
					}});
					body.setCss({
						odd: { },
						even: {	"background": "#E9E9E9" }
					});
					return body;
				};

				function texttip( txt, tip ) {
					'use strict';
					return new HtmlBuilder( "span", txt, {
						style: { "border": "solid 1px yellow" },
						class: "showtip tipsy",
						title: Earthdawn.encode( Earthdawn.encode( tip )) })
				}


				let sect = newSect(),
					bg = "black", 
					fg = "yellow",
					bsub = ( "subheader" in this.misc) && ("reason" in this.misc) && ((this.misc[ "reason" ].length + this.misc[ "subheader" ].length) > 25);
				if( "headcolor" in this.misc )
					switch ( this.misc[ "headcolor" ].toLowerCase()) {
					case "ask":			bg = "LightSalmon";		fg = "black";	break;
					case "pd":			bg = "MediumSpringGreen"; fg = "black";	break;
					case "md":			bg = "SpringGreen";		fg = "black";	break;
					case "sd":			bg = "PaleGreen";		fg = "black";	break;
					case "action":		bg = "LightGreen";		fg = "black";	break;
					case "effect":		bg = "LightPink";		fg = "black";	break;
					case "attack":		bg = "LightCoral";		fg = "white";	break;
					case "attackcc":	bg = "IndianRed";		fg = "white";	break;
					case "damage":		bg = "Crimson";			fg = "white";	break;
					case "damagecc":	bg = "DarkRed";			fg = "white";	break;
					case "init":		bg = "SkyBlue";			fg = "black";	break;
					case "initrep":		bg = "LightSkyBlue";	fg = "black";	break;
					case "recovery":	bg = "Gold";			fg = "black";	break;
					case "recoveryrep":	bg = "Gold";			fg = "black";	break;
					// "none" is also a possible value.
					}
				sect.append( "", this.misc[ "reason" ]			// Main Header
						+ ((bsub || !("subheader" in this.misc) )? "" : "   " + new HtmlBuilder( "span", this.misc[ "subheader" ], {		// Sub-Header
							style: {
							"line-height": 	"0.8em",
							"font-size":	"0.8em",
							"font-weight": 	"lighter",
						}})
						), {
						style: {
						"background-color": bg,
						"color": fg,
						"font-weight": "bold",
						"text-align": "center"
				}});

				if( bsub)
					sect.append("", this.misc[ "subheader" ], {		// Sub-Header
						style: {
						"background-color": bg,
						"color": 		fg,
						"line-height": 	"0.8em",
						"font-size":	"0.8em",
						"font-weight": 	"lighter",
						"text-align": 	"center",
						"margin-top":	"-0.2em"
					}});

				let linenum = 0,
					body = newBody( sect );

				if( "warnMsg" in this.misc )
					body.append( "", this.misc[ "warnMsg" ], {
						style: {
						"background-color": "Orange",
						"text-align": 	"center"
					}});

				let action = 0;		// No test or no modifiers.
				if( "ModType" in this.misc ) {		// Conditions and options that affected the step.
					let modtype = this.misc[ "ModType" ],
						txt = "",
						extraMod = 0;
					
					if ( modtype === "@{Adjust-All-Tests-Total}" || modtype.startsWith( "@{Adjust-Attacks-" ))
						action = 1;		// Action.
					else if ( modtype.length > 10 )
						action = -1;	// Effect.

					if( getAttrByName( this.charID, "Wounds" ) > 0 )
						txt += texttip( " " + getAttrByName( this.charID, "Wounds" ) + " Wounds.", "-1 penalty to all action and effect tests per wound." );
					if( getAttrByName( this.charID, "combatOption-AggressiveAttack" ) == "1" ) {
						if( modtype.endsWith( "-CC}" ))
							txt += texttip( " Aggressive.", "Aggressive Stance: +3 bonus to Close Combat attack and damage tests. -3 Penalty to PD and MD. 1 Strain per Attack." );
					}
					if( "rsPrefix" in this.misc ) {
						if( getAttrByName( this.charID, "combatOption-DefensiveStance" ) == "1" && (action == 1 || modtype.startsWith( "@{Adjust-Damage-" ))) {
							if ( ("Defensive" in this.misc ) )
								extraMod += 3;
							else
								txt += texttip( " Defensive.", "Defensive Stance: +3 Bonus to PD and MD. -3 to all actions except defensive rolls and Knockdown tests." );
						}
						if( getAttrByName( this.charID, "condition-KnockedDown" ) == "1" && action == 1 ) {
							if ( ("Resistance" in this.misc ) )
								extraMod += 3;
							else
								txt += texttip( " Knocked Down.", "Knocked Down: -3 penalty on all defenses and tests. Movement 2. May not use Combat Option other than Jump-Up." );
						}
						if( "MoveBased" in this.misc ) {
							extraMod -= getAttrByName( this.charID, "condition-ImpairedMovement" );
							txt += texttip( " Impaired Move: " + this.misc[ "MoveBased" ], "Impaired Movement: -5/-10 to Movement Rate (1 min). -2/-4 Penalty to movement based tests due to footing, cramping, or vision impairments. Dex test to avoid tripping or halting." );
						}
						if( "VisionBased" in this.misc ) {
							extraMod -= getAttrByName( this.charID, "condition-Darkness" );
							txt += texttip( " Impaired Vision: " + this.misc[ "VisionBased" ], "Impaired Vision: -2/-4 Penalty to all sight based tests due to Darkness, Blindness or Dazzling." );
						}
					}
					if( getAttrByName( this.charID, "combatOption-CalledShot" ) == "1" ) {
						if( modtype.slice(2, 16 ) === "Adjust-Attacks" )
							txt += texttip( " Called Shot.", "Take one Strain; –3 penalty to Attack test; if successful, attack hits designated area. One automatic extra success for maneuver being attempted, other extra successes spent that way count twice." );
					}
					if( getAttrByName( this.charID, "combatOption-SplitMovement" ) == "1" && action == 1 )
						txt += texttip( " Split Move.", "Split Movement: Take 1 Strain and be Harried to attack during movement." );
					if( getAttrByName( this.charID, "combatOption-TailAttack" ) == "1" && action == 1 )
						txt += texttip( " Tail Attack.", "Tail Attack: T'Skrang only: Make extra Attack, Damage = STR. -2 to all Tests." );
					if( getAttrByName( this.charID, "condition-RangeLong" ) == "1" && (modtype == "@{Adjust-Attacks-Total}" || modtype == "@{Adjust-Damage-Total}" ))
						txt += texttip( " Long Range.", "The attack is being made at long range. -2 to attack and damage tests." );
					if( getAttrByName( this.charID, "condition-Blindsiding" ) == "1" && modtype.slice( 2, 17) === "Adjust-Attacks-" )
						txt += texttip( " Blindsiding.", "The acting character is blindsiding the targeted character, who takes -2 penalty to PD and MD. Can't use shield. No active defenses." );
					if( getAttrByName( this.charID, "condition-TargetPartialCover" ) == "1" && modtype.slice( 2, 17) === "Adjust-Attacks-" )
						txt += texttip( " Tgt Cover.", "The targeted character has cover from the acting character. +2 bonus to PD and MD." );
					if( getAttrByName( this.charID, "condition-Surprised" ) == "1" )
						txt += texttip( " Surprised!", "Acting character is surprised. Can it do this action?" );
					if( getAttrByName( this.charID, "combatOption-Reserved" ) == "1" && action == 1)
						txt += texttip( " Reserved actn", "Reserved Action: +2 to all Target Numbers. Specify an event to interrupt." );
					if( getAttrByName( this.charID, "condition-Harried" ) != "0" )
						txt += texttip( " Harried:" + getAttrByName( this.charID, "condition-Harried" ), "Harried: Penalty to all Tests and to PD and MD." );
						
					let modvalue = this.misc[ "ModValue" ] + extraMod;
					if( txt.length > 0 || modvalue )
						body.append( (( ++linenum % 2) ? ".odd" : ".even"), texttip( "<b>Mods:</b> " + ((modvalue) ? modvalue.toString() + " "  : " " ), "Total of all bonuses and Penalties." ) + txt);
				}

				if( this.indexTarget !== undefined && action == 1) {
					let txt = "",
					targetChar = Earthdawn.tokToChar( Earthdawn.getParam( this.targetIDs[ this.indexTarget ], 1, ":")); 
					if ( targetChar ) {
						if( getAttrByName( targetChar, "Adjust-Defenses-Total" ) != 0 && this.misc[ "targettype" ].indexOf( "SD") == -1)
							txt += texttip( " " + getAttrByName( targetChar, "Adjust-Defenses-Total" ) + " ", "Total of all bonuses and penalties to targets PD and MD." );
						if( getAttrByName( targetChar, "combatOption-AggressiveAttack" ) == "1" )
							txt += texttip( " Aggressive.", "Target is in an Aggressive Stance, giving bonuses to Attack and Damage, but -3 penalty to PD and MD." );
						if( getAttrByName( targetChar, "combatOption-DefensiveStance" ) == "1" )
							txt += texttip( " Defensive.", "Target is in a Defensive Stance, giving a +3 bonus to PD and MD." );
						if( getAttrByName( targetChar, "condition-Blindsided" ) == "1" )
							txt += texttip( " Blindsided.", "Target is blindsided and takes -2 penalty to physical and mystic defenses. Can't use shield. No active defenses." );
						if( getAttrByName( targetChar, "condition-KnockedDown" ) == "1" )
							txt += texttip( " Knocked Down.", "Target is Knocked Down and suffers a -3 penalty to all defenses." );
						if( getAttrByName( targetChar, "condition-Surprised" ) == "1" )
							txt += texttip( " Surprised!", "Target is surprised and suffers a -3 penalty to all defenses." );
						if( getAttrByName( targetChar, "condition-Cover" ) != "0" )
							txt += texttip( " Cover:" + ((getAttrByName( targetChar, "condition-Cover" ) == "2") ? "Partial." : "Full."), "Target has cover and gains bonus to PD and MD." );
						if( getAttrByName( targetChar, "condition-Harried" ) != "0" )
							txt += texttip( " Harried:" + getAttrByName( targetChar, "condition-Harried" ) + ".", "Target is Harried and suffers a penalty to PD and MD as well as action tests." );
					}
					if( txt.length > 0 )
						body.append( (( ++linenum % 2) ? ".odd" : ".even"), "<b>Target:</b>" + txt);
				}

				let tip = (( "dice" in this.misc) 		? this.misc[ "dice" ].replace( /!/g, "") + ".   " : "" )
						+ (( "step" in this.misc) 		? "Base step " + this.misc[ "step" ] : "" )
						+ (( "stepExtra" in this.misc)	? " plus " + this.misc[ "stepExtra" ] + " extra successes." : ""),
					txt = (( "bonusStep" in this.misc )	? " + step " + this.misc[ "bonusStep" ] + " bonus" : "")
						+ (( "karmaNum" in this.misc )	? " + " + this.misc[ "karmaNum" ] + " karma" : "")
						+ (( "DpNum" in this.misc )		? " + " + this.misc[ "DpNum" ] + " Dev Pnts" : "")
						+ (( "resultMod" in this.misc )	? ((this.misc[ "resultMod" ] < 0) ? " - " : " + ") + Math.abs(this.misc[ "resultMod" ]) : "" ) 
						+ "."
						+ (( "roll" in this.misc )		? " = " + this.misc[ "roll" ] : "" ),
					gmResult = "";
				body.append( ( ++linenum % 2) ? ".odd" : ".even", 
						new HtmlBuilder( "span", "<b>Step:</b> " + (( "finalStep" in this.misc ) ? this.misc[ "finalStep" ] : ""), {
							style: { "background": "lightgoldenrodyellow" },
							class: "showtip tipsy",
							title: Earthdawn.encode( Earthdawn.encode( tip )) }) 
					+ txt );

				if( "CorruptedKarma" in this.misc )
					body.append( "", new HtmlBuilder( "span", this.misc[ "CorruptedKarma" ] + " karma corrupted.", {
								style: { "background-color": "Orange" },
								class: "showtip tipsy",
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

					if( txt.length > 0 ) 
						body.append( "", txt + ". Roll was " + this.BuildRoll( "showResult" in this.misc && this.misc[ "showResult" ], this.misc[ "DiceOrigional" ].total, this.misc[ "DiceOrigional" ] ), 
								{ style: { "background-color": "Orange" }});
					if(gmResult.length > 0 && (txt.length == 0 || !( "showResult" in this.misc && this.misc[ "showResult" ] )))
						gmResult += (gmResult.length > 0 ? ".   " : "") +  "<b>Orig Rslt was:</b> " + this.BuildRoll( true, this.misc[ "DiceOrigional" ].total, this.misc[ "DiceOrigional" ] );
				}

				txt = "";
				if( "showResult" in this.misc && this.misc[ "showResult" ] )
					txt += "<b>Result:</b> " + this.BuildRoll( true, this.misc[ "result" ], rolls );
				else if ( rolls )
					gmResult += "   <b>Result:</b> " + this.BuildRoll( true, this.misc[ "result" ], rolls );
				if( "failBy" in this.misc )
					txt += ((txt.length > 0) ? "   " : "" ) + "<span style='color: red;'>Failure</span> " 
							+ ((( "StyleOverride" in this.misc ? this.misc[ "StyleOverride" ] : state.Earthdawn.style) != Earthdawn.style.VagueSuccess ) 
							? " by " + this.BuildRoll( this.misc[ "showResult" ], this.misc[ "failBy" ], rolls ) + "." : "!" );
				if( "succBy" in this.misc )
					txt += ((txt.length > 0) ? "   " : "" ) + "<span style='color: green;'>Success</span> " 
							+ ((( "StyleOverride" in this.misc ? this.misc[ "StyleOverride" ] : state.Earthdawn.style) != Earthdawn.style.VagueSuccess ) 
							? " by " + this.BuildRoll( this.misc[ "showResult" ], this.misc[ "succBy" ], rolls ) : "!" )
							+ (( "extraSucc" in this.misc && this.misc[ "extraSucc" ] > 0) 
							? new HtmlBuilder( "span", " (" + this.misc[ "extraSucc" ] + " ES)", {
								style: { "background": "lightgoldenrodyellow" },
								class: "showtip tipsy",
								title: Earthdawn.encode( Earthdawn.encode( this.misc[ "extraSucc" ] 
									+ " extra success" + (( this.misc[ "extraSucc" ] < 2) ? "!" : "es!") + (("grimCast" in this.misc) ? " One added assuming you are casting from your own Grimoire." : "") )) }) 
							: ".");
				if( "Willful" in this.misc )
					txt += " Note: Target is Willful";
				if( txt.length > 0 )
					body.append( (( ++linenum % 2) ? ".odd" : ".even"), txt);

				if( "secondaryResult" in this.misc ) {
					var TNall = (this.bFlags & Earthdawn.flags.VerboseRoll) 
							|| (( "StyleOverride" in this.misc ? this.misc[ "StyleOverride" ] : state.Earthdawn.style) === Earthdawn.style.Full);
					txt = "<b>Cntr-Atk:</b>" 
							+ ( TNall ? " TN# " + this.misc[ "targetNum2" ] : "" )
							+ ((this.misc[ "secondaryResult" ] < 0) 
									? " <span style='color: red;'>Failed</span>  by " 
									: " <span style='color: green;'>Succeeded</span> by ") 
							+ Math.abs( this.misc[ "secondaryResult" ])
							+ ((this.misc[ "secondaryResult" ] > 9) 
							? new HtmlBuilder( "span", " (" + Math.floor((this.misc[ "secondaryResult" ] - 5) / 5) + " ES)", {
								style: { "background": "lightgoldenrodyellow" },
								class: "showtip tipsy",
								title: Earthdawn.encode( Earthdawn.encode( Math.floor((this.misc[ "secondaryResult" ] - 5) / 5)
									+ " extra success" + ((this.misc[ "secondaryResult" ] < 14) ? "!" : "es!") )) }) 
							: ".");
					if( txt.length > 0 )
						body.append( (( ++linenum % 2) ? ".odd" : ".even"), txt);
				}
				if( "Spell" in this.misc ) {
					let splines = this.Spell( this.misc[ "Spell" ] );
					if( _.isArray( splines ))
						for( let i = 0; i < splines.length; ++i )
							body.append( (( ++linenum % 2) ? ".odd" : ".even"), splines[ i ] );
				}
				if( "StrainPerTurn" in this.misc ) {
					body.append( (( ++linenum % 2) ? ".odd" : ".even"), texttip("Strain Per Turn: " + this.misc[ "StrainPerTurn" ], "On the Combat tab, it says to spend this much Strain every time initiative is rolled. This is probably from Blood Charms, Thread Items, Spells or some-such.") );
				}

				if( ("succMsg" in this.misc) && ( "succBy" in this.misc ) && this.misc[ "succMsg" ].length > 1)
					body.append( (( ++linenum % 2) ? ".odd" : ".even"), this.misc[ "succMsg" ]);

				if(("cButtons" in this.misc) && this.misc[ "cButtons" ].length > 0) {
					var buttonLine = "";
					let	tName;

					for( let i = 0; i < this.misc[ "cButtons" ].length; ++i ) {
						if( tName != this.misc[ "cButtons" ][ i ].name ) {			// If this button has a different target name than the last button, display it.
							tName = this.misc[ "cButtons" ][ i ].name;
							buttonLine += "   " + tName + " ";
						}
						buttonLine += new HtmlBuilder( "a", this.misc[ "cButtons" ][ i ].text, Object.assign({}, {
							href: Earthdawn.colonFix( this.misc[ "cButtons" ][ i ].link ),
							style: { 
								"background-color":	bg,
								"color":	fg,
								"padding":	"0px, 5px",
								"border":	"1px solid black",
								"margin":	"1px, 5px",
								"min-width": "auto"
							}}, "tip" in this.misc[ "cButtons" ][ i ] ? {
								class: "showtip tipsy",
								title: Earthdawn.encode( Earthdawn.encode( this.misc[ "cButtons" ][ i ].tip )),
							} : {}));
					}
				}

									// Here we figure out what messages get sent where.
				if( whichMsgs === Earthdawn.whoTo.public ) {												// public:    Main message to everybody. Maybe supplementary messages to player and/or gm.
//body.append( (( ++linenum % 2) ? ".odd" : ".even"), "<b>public</b> " );
					this.chat( sect.toString(), Earthdawn.whoTo.public | Earthdawn.whoFrom.player | Earthdawn.whoFrom.character ); 
					if( ("gmTN" in this.misc) || gmResult.length > 0 || (( "secondaryResult" in this.misc ) && !TNall)) {
						var bgmline = true;
						var sectgm = newSect();
						var bodygm = newBody( sectgm );
						if ( playerIsGM && buttonLine )
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
								if( buttonLine && (!playerIsGM || !bgmline)) {
									let sectplayer = newSect();
									let bodyplayer = newBody( sectplayer );
									bodyplayer.append( (( ++linenum % 2) ? ".odd" : ".even"), buttonLine);
									po.chat( sectplayer.toString(), Earthdawn.whoTo.player | Earthdawn.whoFrom.player | Earthdawn.whoFrom.character | Earthdawn.whoFrom.noArchive );
								}
								if( bgmline )
									po.chat( sectgm.toString(), Earthdawn.whoTo.gm | Earthdawn.whoFrom.player | Earthdawn.whoFrom.character );
							} catch(err) { 
								log( "ED.rollFormat setTimeout() error caught: " + err );
							}
						}, 500);
				} else if ( whichMsgs ===  Earthdawn.whoTo.gm ) {								// gm only
//body.append( (( ++linenum % 2) ? ".odd" : ".even"), "<b>gm only</b> " );
					if( buttonLine )
						body.append( (( ++linenum % 2) ? ".odd" : ".even"), buttonLine);
					if ("gmTN" in this.misc)
						body.append( (( ++linenum % 2) ? ".odd" : ".even"), "<b>TN#</b> " + this.misc[ "gmTN" ] + gmResult );
					else if ( gmResult.length > 0 )
						body.append( (( ++linenum % 2) ? ".odd" : ".even"), gmResult );
					if(( "secondaryResult" in this.misc ) && !TNall)
						body.append( (( ++linenum % 2) ? ".odd" : ".even"), "<b>Cntr-Atk: TN#</b> " + this.misc[ "targetNum2" ] );
					this.chat( sect.toString(), recipients | Earthdawn.whoFrom.player | Earthdawn.whoFrom.character ); 
				} else if ( whichMsgs === (Earthdawn.whoTo.gm | Earthdawn.whoTo.player) ) {		// Player and GM, and we know that the player is not the gm. 
					var popto = body._children.length;
//body.append( (( ++linenum % 2) ? ".odd" : ".even"), "<b>player of playergm</b> " );
					if( buttonLine )
						body.append( (( ++linenum % 2) ? ".odd" : ".even"), buttonLine);
					this.chat( sect.toString(), Earthdawn.whoTo.player | Earthdawn.whoFrom.player | Earthdawn.whoFrom.character ); 
					while (body._children.length > popto )			// Pop off the player only entries, and push on the gm only entries.
						body._children.pop();
//body.append( (( ++linenum % 2) ? ".odd" : ".even"), "<b>gm of playergm</b> " );
					if ("gmTN" in this.misc)
						body.append( (( ++linenum % 2) ? ".odd" : ".even"), "<b>TN#</b> " + this.misc[ "gmTN" ] + gmResult );
					else if ( gmResult.length > 0 )
						body.append( (( ++linenum % 2) ? ".odd" : ".even"), gmResult );
					if(( "secondaryResult" in this.misc ) && !TNall)
						body.append( (( ++linenum % 2) ? ".odd" : ".even"), "<b>Cntr-Atk: TN#</b> " + this.misc[ "targetNum2" ] );
					this.chat( sect.toString(), Earthdawn.whoTo.gm | Earthdawn.whoFrom.player | Earthdawn.whoFrom.character ); 
				} else 
                    this.chat( "API Error! rollFormat() got whichMsgs of (" + whichMsgs + "). Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror ); 
            } catch(err) {
                log( "ED.rollFormat() error caught: " + err );
            }   // end catch
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
        this.BuildRoll = function( howMuchDetail, main, rolls )  {
            'use strict';
            try {
//				let tip1 = '<img src="/images/quantumrollwhite.png"> Rolling ', 
				let tip1 = 'Rolling ', 
					tip2 = " = ",
					f;
//log(rolls);
				let border = 0, 	// zero = reddish for rule of 1's, 1 is normal yellowish, 2 is greenish for max dice rolls.. 
					dice = 0,
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
										f = '<strong style=&quot;color: #90ee90;&quot;>' + v + "</strong>";		// Value is max. Greenish
									} else if( v == 1)
										f = '<strong style=&quot;color: #f08080;&quot;>' + v + "</strong>";		// Value is 1. Reddish. 
									else {
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
						log( "Error in ED.BuildRoll(). Unknown type '" + r[ "type" ] + "' in rolls " + i + ". Complete roll is ..." );
						log( rolls );
					}
				}
				if( border === 2 )
					var	bordColor = "2px solid #3FB315";	// Greenish
				else if( border === 0 && dice > 1)
					bordColor = "2px solid #B31515";		// Reddish
				else
					bordColor = "2px solid #FEF68E";		// Normal Yellowish.
				return new HtmlBuilder( "span", main.toString(), {
								style: { "background-color": "#FEF68E",
										"border"		: bordColor,
										"padding"		: "0 3px 0 3px",
										"font-weight"	: "bold",
										"cursor"		: "help",
										"font-size"		: "1.1em" },
								class: "showtip tipsy",
								title: Earthdawn.encode( Earthdawn.encode( tip1 + tip2 )) }); 
            } catch(err) {
                log( "ED.BuildRoll() error caught: " + err );
            }   // end catch
		} // End ParseObj.BuildRoll()




                    // ParseObj.SetStatusToToken ()
                    // Set the Token Status markers to match the Character sheet.
        this.SetStatusToToken = function()  {
            'use strict';

            try {
                if( this.tokenInfo === undefined || this.tokenInfo.tokenObj === undefined ) {
                    this.chat( "Error! tokenInfo undefined in SetStatusToToken() command."); 
                    return;
                }
                this.GetStatusMarkerCollection();
                var markers = "";
                var attName;
                var attValue;
                var po = this;

                _.each( this.StatusMarkerCollection, function( item ) {
                    attName = item["attrib"];
                    if( attName === undefined )
                        return;

                    attValue = parseInt( getAttrByName( po.charID, attName ) || 0);
//log( attName + "   " + attValue);
                    if( attValue === 0 ) 
                        return;
                        
                    if( attValue == -5)
                        markers += ",skull";
                    if( attName == "condition-Harried") {
                        markers += "," + item["icon"];
                        if( attValue > 2)
                            markers += "@" + (attValue -2).toString();
                    } else if ( attValue == 2 || attValue == 4 )
                        markers += "," + item["icon"] + "@" + attValue;
                    else
                        markers += "," + item["icon"];
                });
//log( markers);
                this.tokenInfo.tokenObj.set( "statusmarkers", markers.slice(1));
//                this.MarkerMenu();
            } catch(err) {
                log( "ED.SetStatusToToken() error caught: " + err );
            }   // end catch
        } // End ParseObj.SetStatusToToken()




                    // ParseObj.SetToken ()
                    // We have been passed a tokenID to act upon.   Set TokinInfo and CharID.
                    //  ssa[1]   Token ID
        this.SetToken = function( ssa )  {
            'use strict';

            try {
                if( ssa.length > 1 ) {
                    var TokObj = getObj("graphic", ssa[ 1 ]); 
                    if (typeof TokObj != 'undefined' ) {
                        this.charID = TokObj.get("represents"); 
                        var CharObj = getObj("character", this.charID) || ""; 
                        if (typeof CharObj != 'undefined') { 
                            var TokenName = TokObj.get("name"); 
                            if( TokenName.length < 1 )
                                TokenName = CharObj.get("name");
                            this.tokenInfo = { type: "token", name: TokenName, tokenObj: TokObj, characterObj: CharObj };
                        } // End CharObj defined
                    } // end TokenObj undefined
                }
            } catch(err) {
                log( "ED.SetToken() error caught: " + err );
            }   // end catch
        } // End ParseObj.SetToken()




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
			if( start === undefined )
				start = 1;
            try {
                for( var i = start; i < ssa.length; i++ ) {
                    j = this.getValue( ssa[ i ], cID, fSpecial);
					if( fSpecial != 1 )
						ret += j;
					else {
						let k = parseInt( j );
						if( i === start || j === "0" || j.startsWith( "-" ) || j.startsWith( "+" ))
							ret += k;
						else
							ret = k;
					}
				}
            } catch(err) {
                log( "ParseObj.ssaMods() error caught: " + err );
            }   // end catch
            return ret;
        } // End ParseObj.ssaMods


		
		
		
                    // Spell-casting Token action.
        this.Spell = function( ssa ) {
            'use strict';
            try {
				let pre = Earthdawn.buildPre(( ssa[ 0 ].toLowerCase() === "spell" ) ? "SPM" : "SP", ssa[ 1 ] ),
				bGrim = !(ssa[ 0 ].toLowerCase() === "spell");			// false = Matrix. true = Grimoire
					// 		Earthdawn.abilityAdd( this.charID, Earthdawn.Constants.SymbolSpell + t, "!edToken~ spell: " + matrixTo
					//		+ ": ?{" + t + " What|Info"
					//		+ "|Start New Casting,New: ?{Matrix or Grimoire cast|Matrix,M|Grimoire,G}"
					//		+ "|Weave Threads, Weave: ?{Modifier|0}" 
					//		+ "|Cast, Cast: ?{Modifier|0}: @(SP_Casting)
					//		+ "|Effect,Effect: ?{Modifier|0} " + "}" );
					//
					//		(0) Cast, (1) G/M, (2) (spell or matrix row id), (3) Sequence, (4) Number threads pulled (including already in matrix), (5) Effect bonus from spellcasting (6+) extra threads.
					//		Sequence = 0 new, 1 pulling threads, 2 pulled all threads, 3 spellcasting failed, 4 spellcasting succeeded, 5 an effect has been rolled.
				var po = this,
					what = ssa[ 2 ];

				function texttip( txt, tip ) {
					'use strict';
					return new HtmlBuilder( "span", txt, {
						class: "showtip tipsy",
						title: Earthdawn.encode( Earthdawn.encode( tip )) });
				}

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
							"text-align": 	"left"
						}});
					body.setCss({
						odd: { },
						even: {	"background": "#E9E9E9" }
					});

					function line( txt, tip) {
						body.append( (( ++linenum % 2) ? ".odd" : ".even"), texttip( txt, tip ));
					}

					let mattype = "Std ";
					if( !bGrim ) {
						switch( Earthdawn.getAttrBN( this.charID, pre + "Type", "-10") ) {
							case  "15": 	mattype = "Enhanced"; 	break;
							case  "25": 	mattype = "Armored"; 	break;
							case  "-20": 	mattype = "Shared"; 	break;
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
						line( "<b>AoE:</b> " + Earthdawn.getAttrBN( this.charID, pre + "AoE", ""), 
								"Area of Effect.");
					line( "<b>Duration:</b> " + Earthdawn.getAttrBN( this.charID, pre + "Duration", ""), 
							"Duration of Effect.");
					{	let x1 = "<b>Effect:</b>";
						let efctArmor = Earthdawn.getAttrBN( this.charID, pre + "EffectArmor", "N/A");
						if( efctArmor != "N/A" )
							x1 += " WIL +" + Earthdawn.getAttrBN( this.charID, pre + "WilEffect", "0") + " " + efctArmor + ".";
						if (Earthdawn.getAttrBN( this.charID, pre + "Effect", "").trim().length > 1)
							x1 += " " + Earthdawn.getAttrBN( this.charID, pre + "Effect", "")
						if( x1.length > 16 )
							line( x1, "Spell Effect: Some spells have Willpower effects. Some of these WIL effects get modified by the targets armor. Many spells also have none WIL effects." );
					}
					line( "<b>Success Levels:</b> " + Earthdawn.getAttrBN( this.charID, pre + "SuccessLevels", "None"), 
							"Getting more than one success upon the spellcasting test often provides a bonus effect.");
					line( "<b>Extra Threads:</b> " + Earthdawn.getAttrBN( this.charID, pre + "ExtraThreads", ""), 
							"Extra Threads indicates what enhanced effects the caster can add to their spell by weaving additional threads into the spell pattern.");
					{	let enhThread = bGrim ? "x" : Earthdawn.getAttrBN( this.charID, pre + "EnhThread", "");
						if( enhThread && enhThread !== "x" )
							line( "<b>Pre-woven Thread:</b> " + enhThread.toString(), "EnhThread: This spell is in a matrix that can hold a pre-woven thread, and this is the extra thread option pre-woven into this matrix." );
					}
					if( Earthdawn.getAttrBN( this.charID, pre + "SuccessText", "").trim().length > 1 )
						line( "<b>Display Text:</b> " + Earthdawn.getAttrBN( this.charID, pre + "SuccessText", ""), 
								"This text appears if the spellcasting test is successful. It can optionally be used to remind players of what the spell does and how it works.");
					line( "<b>Description</b> (hover)", Earthdawn.getAttrBN( this.charID, pre + "Notes", "").replace( /\n/g, "<br/>"));

					this.chat( sect.toString(), Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive | Earthdawn.whoFrom.character ); 
				}	break;
				case "New": {
					let txt = "Spell requires " + Earthdawn.getAttrBN( this.charID, pre + "sThreads", "0") + " threads. Extra Threads? ";
					let opt = Earthdawn.getAttrBN( this.charID, pre + "ExtraThreads", "").split( "," );
					for( let i = 0; i < opt.length; ++i )
						txt += this.makeButton( opt[ i ], "!Earthdawn~ charID: " + this.charID + "~ Spell: " + ssa[ 1 ] + ": " + "Extra: " + opt[ i ], 
								"Press this button to add an optional extra thread to this casting." );

					this.chat( txt, Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive | Earthdawn.whoFrom.character ); 
					let thrd = bGrim ? 0 : Earthdawn.getAttrBN( this.charID, pre + "mThreads", "0");
					let enh = bGrim ? "x" : Earthdawn.getAttrBN( this.charID, pre + "EnhThread", "");
					if( !enh || enh == "x" ) 
						thrd = "0";
					this.TokenSet( "clear", "SustainedSequence", "Cast," + (bGrim ? "G," : "M,") + ssa[ 1 ] + ",0," + thrd + ",-1" );
				}	break;
				case "Extra": {
					let seq = this.TokenGet( "SustainedSequence", true );
					if( !seq )
						this.chat( "Error! Need to have started a new Casting. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror ); 
					else if ( Earthdawn.getParam( seq, 1, "," ) !== "Cast" )
						this.chat( "Error! Extra Threads may only be selected after starting a new Casting. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror ); 
					else if ( Earthdawn.getParam( seq, 4, "," ) != "0" )
						this.chat( "Error! Extra Threads may only be selected immediately after starting a new Casting. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror ); 
					else {
						this.TokenSet( "clear", "SustainedSequence", seq + "," + ssa[ 3 ] );
						this.chat( "Updated " + ssa[ 3 ], Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive | Earthdawn.whoFrom.character ); 
					}
				}	break;
				case "Weave": {
					let disp, tmp;
					if( bGrim )
						tmp = Earthdawn.getAttrBN( this.charID, pre + "Discipline", "0");
					else
						tmp = Earthdawn.getAttrBN( this.charID, Earthdawn.buildPre( "SP", Earthdawn.getAttrBN( this.charID, pre + "spRowID" )) + "Discipline", "0");
                    switch( tmp ) {
						case "5.3":		disp = "Elementalism";	break;
						case "6.3":		disp = "Illusionism";	break;
						case "7.3":		disp = "Nethermancy";	break;
						case "16.3":	disp = "Wizardry";		break;
						default:		disp = "Wizardry";		break;
					}
					this.Karma( "SP_" + disp + "_Karma-Control", 0 );
					this.misc[ "reason" ] = "Weave Thread " + disp;
					this.misc[ "headcolor" ] = "ask";
					this.bFlags |= Earthdawn.flags.VerboseRoll;
					this.Lookup( 1, [ "value", "SP-" + disp + "-Step", ssa[ 3 ] ] );
					this.targetNum = Earthdawn.getParam( Earthdawn.getAttrBN( this.charID, pre + "Numbers", ""), 1, "/" );

					let seq = this.TokenGet( "SustainedSequence", true );
					if( !seq ) {
						this.chat( "Error! Need to have started a new Casting. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror ); 
						return;
					} else if ( Earthdawn.getParam( seq, 1, "," ) !== "Cast" ) {
						this.chat( "Error! Thread Weaving may only be selected after starting a new Casting. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror ); 
						return;
					}
					let needed = Earthdawn.getAttrBN( this.charID, pre + "sThreads", "0" );
					let aseq = seq.split( "," );
					if( ssa[ 1 ] !== aseq[ 2 ] ) {
						this.chat( "Error! Trying to pull threads for: " + Earthdawn.getAttrBN( this.charID, pre + (bGrim ? "Name" : "Contains"), "" )
								+ " but the last spell started was: " 
								+ Earthdawn.getAttrBN( this.charID,  Earthdawn.buildPre( bGrim ? "SP" : "SPM", aseq[ 2 ] ) + bGrim ? "Name" : "Contains", "") + ".", Earthdawn.whoFrom.apierror ); 
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
					this.misc[ "esGoal" ] = parseInt( needed ) + aseq.length - 6;
					this.misc[ "esStart" ] = parseInt( aseq [ 4 ] );
					this.misc[ "woveTip" ] = needed + " base spell threads, plus " + (aseq.length - 6).toString() + " Extra threads." ;
					this.TokenSet( "clear", "SustainedSequence", aseq.toString() );

					ssa[ 2 ] = "Weave2";
					this.misc[ "Spell" ] = ssa;
					this.Roll( [ "Roll" ] );
				}	break;
				case "Weave2": {			// Roll callbacks to here. 
					let lines = [];
					let esDone = this.misc[ "esStart" ] + (( "succBy" in this.misc ) ? 1 : 0 ) + (( "extraSucc" in this.misc ) ? this.misc[ "extraSucc" ] : 0 );
					lines.push( "<b>Wove:</b> " + esDone + " of " + texttip( this.misc[ "esGoal" ] + " threads.", this.misc[ "woveTip" ] ));

					let aseq = this.TokenGet( "SustainedSequence", true ).split( "," );
					aseq [ 4 ] = esDone;
					aseq [ 3 ] = ( aseq[ 4 ] < this.misc[ "esGoal" ]) ? "1" : "2" ;
					this.TokenSet( "clear", "SustainedSequence", aseq.toString() );
					return lines;
				}
				case "Cast": {
					this.misc[ "headcolor" ] = "md";
					this.bFlags |= Earthdawn.flags.NoOppMnvr;
					this.misc[ "reason" ] = Earthdawn.getAttrBN( this.charID, pre + (!bGrim ? "Contains" : "Name" ), "") + " Spellcasting Test";
					this.Lookup( 1, [ "value", "SP-Spellcasting-Step", ssa[ 3 ]  ] );
					this.Karma( "SP-Spellcasting-Karma-Control", 0 );
					if( bGrim )
						this.misc[ "grimCast" ] = true;		// This is a spell being cast from a grimoire.  It counts as one extra success. 

					let seq = this.TokenGet( "SustainedSequence", true );
					if( !seq ) {
						this.chat( "Error! Need to have started a new Casting. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror ); 
						return;
					}
					let	aseq = seq.split( "," );
					if ( aseq[ 0 ] !== "Cast" ) {
						this.chat( "Error! Spell Casting may only be selected after starting a new Casting. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror ); 
						return;
					} else if( ssa[ 1 ] !== aseq[ 2 ] ) {
						this.chat( "Error! Trying to cast: " + Earthdawn.getAttrBN( this.charID, pre + (!bGrim ? "Contains" : "Name"), "" )
								+ " but the last spell started was: " 
								+ Earthdawn.getAttrBN( this.charID,  Earthdawn.buildPre( bGrim ? "SP" : "SPM", aseq[ 2 ] ) + bGrim ? "Name" : "Contains", "") + ".", Earthdawn.whoFrom.apierror ); 
						return;
					} else if( (parseInt(Earthdawn.getAttrBN( this.charID, pre + "sThreads", "0" )) + aseq.length - 6) > (bGrim ? 0 : parseInt( Earthdawn.getAttrBN( this.charID, pre + "mThreads", "0" )) ))	// We can skip this test is threads are not needed.
						if( aseq [ 3 ] != "2" )
							this.misc[ "warnMsg" ] = "Note: Have you pulled all the threads you need? Only " + aseq [ 4 ] + " of " 
													+ (parseInt(Earthdawn.getAttrBN( this.charID, pre + "sThreads", "0" )) + aseq.length - 6) + " done.";
					let fx = Earthdawn.getAttrBN( this.charID, pre + "FX", "");
					if( fx && ( fx.startsWith( "Attempt" ) || fx.startsWith( "Success")))
						this.misc[ "FX" ] = fx;

					ssa[ 2 ] = "Cast2";
					this.misc[ "Spell" ] = ssa;
					this.Roll( [ "Roll" ] );
				}	break;
				case "Cast2": {				// Roll calls back to here.
					let lines = [];
					let po = this;
					let aseq = this.TokenGet( "SustainedSequence", true ).split( "," );
					aseq [ 3 ] = ( "succBy" in this.misc ) ? "4" : "3";
					let bonus = Earthdawn.getAttrBN( this.charID, pre + "SuccessLevels", "None" ) + "," + (bGrim ? "x" : Earthdawn.getAttrBN( this.charID, pre + "EnhThread", "0" ));
					let abonus = bonus.split( "," ).concat( aseq.slice( 6 ) ).filter( function (condition) { return condition && condition != "x" });
					let bbonus = abonus;
					let rank = getAttrByName( this.charID, "SP-Spellcasting-Effective-Rank" );

					let es = ( "extraSucc" in this.misc ) ? this.misc[ "extraSucc" ] : 0;
					if( !es ) 
						bbonus = _.without( bbonus, abonus[ 0 ] );

					function extra( label, text, lookup, def ) {			// Write out spell information, possibly modified by extra successes. 
						'use strict';
						let t1 = (text ? ((lookup === null) ? text : Earthdawn.getAttrBN( po.charID, pre + text, def )) : ""),
							incDur = false,
							inc = 0,
							saved = "",
							t3 = "";
						let txt = t1 ? t1 : "";
						if( lookup )
							for( let i = (es ? 0 : 1); i < abonus.length; ++i )		// If we don't have any extra successes, then we don't process the first value.
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
											inc += parseInt(abonus[ i ].slice( i1+1, i2)) * (( i == 0 && es > 0 ) ? es : 1 );
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
							lines.push( "<b>" + label + "</b> " + (inc ? texttip( txt + " + " + inc.toString() + (saved ? " " + saved : ""), t3) : txt + " " + t3));
						}
						return inc;
					}

					extra( "Range", "Range", "Inc Rng", "" );
					let x3 = Earthdawn.getAttrBN( po.charID, pre + "AoE", " " );
					if( x3 && x3 != "x" && x3 != " " )
						extra( "AoE", "AoE", "Inc Area", " " );
					extra( "Duration", "Duration", "Inc Dur", "" );
					aseq[ 5 ] = extra( "Will Effect +", "WilEffect", "Inc Efct Step", "0" );
					let x2 = Earthdawn.getAttrBN( this.charID, pre + "EffectArmor", "N/A" );
					if( x2 && x2 != "N/A" )
						lines[ lines.length - 1 ] += " " + x2;
					extra( "Effect" , "Effect", "Inc Efct (Other)", "" );
					if( bbonus.length > 0 )
						extra( "Extra Threads", bbonus.toString(), null );

					this.TokenSet( "clear", "SustainedSequence", aseq.toString() );
					return lines; 
				}
				case "Effect": {		// Spell Will Effect test.
					let seq = this.TokenGet( "SustainedSequence", true );
					if( !seq ) {
						this.chat( "Error! Need to have started a new Casting. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror ); 
						return;
					}
					let	aseq = seq.split( "," );
					if ( aseq[ 0 ] !== "Cast" ) {
						this.chat( "Error! Effect tests may only be selected after casting a spell. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror ); 
						return;
					} else if( ssa[ 1 ] !== aseq[ 2 ] ) {
						this.chat( "Error! Trying to roll a will effect for: " + Earthdawn.getAttrBN( this.charID, pre + (!bGrim ? "Contains" : "Name"), "")
								+ " but the last spell started was: " 
								+ Earthdawn.getAttrBN( this.charID,  Earthdawn.buildPre( bGrim ? "SP" : "SPM", aseq[ 2 ] ) + bGrim ? "Name" : "Contains", "") + ".", Earthdawn.whoFrom.apierror ); 
						return;
					} else if( aseq [ 3 ] == "5" )
						this.misc[ "warnMsg" ] = "Warning: A Will Effect Test has already been rolled.";
					else if( aseq [ 3 ] != "4" )
						this.misc[ "warnMsg" ] = "Warning: The last thing you did was not to successfully cast the spell.";

					this.misc[ "headcolor" ] = "effect";
					if (getAttrByName( this.charID, "SP-Willforce-Use") == "1") {
						this.doLater += "~Karma: SP-WilEffect-Karma-Control: SP-WillForce-Karma-Control" + "~Strain: 1";
						this.misc[ "reason" ] = Earthdawn.getAttrBN( this.charID, pre + (!bGrim ? "Contains" : "Name"), "") + " WillForce Effect";
					} else {
						this.doLater += "~Karma: SP-WilEffect-Karma-Control"; 
						this.misc[ "reason" ] = Earthdawn.getAttrBN( this.charID, pre + (!bGrim ? "Contains" : "Name"), "") + " Will Effect";
					}
					let fx = Earthdawn.getAttrBN( this.charID, pre + "FX", "");
					if( fx && fx.startsWith( "Effect" ))
						this.misc[ "FX" ] = fx;

					this.Parse( "armortype: " + Earthdawn.getAttrBN( this.charID, pre + "EffectArmor", "N/A") );
					this.bFlags |= Earthdawn.flags.WillEffect;
					let t2 = parseInt( getAttrByName( this.charID, "Will-Effect") || 0 ) - parseInt(getAttrByName( this.charID, "Will-Eff-Mods") || 0);		// This is generic willpower / willforce.
					this.Lookup( 1, [ "value", pre + "WilEffect", t2.toString(), ssa[ 3 ], aseq[ 5 ]  ] );			// Add in the spells will effect, the modifiers passed, plus any additions from the casting. 
					aseq[ 3 ] = "5";
					this.TokenSet( "clear", "SustainedSequence", aseq.toString() );

					this.ForEachHit( [ "Roll" ] );
				}	break;
				}
            } catch(err) {
                log( "ED.Spell() error caught: " + err );
            }   // end catch
        } // End ParseObj.Spell( ssa )




                    // ParseObj.TargetCalc()
                    // get or calculate the target number for an upcoming roll.
        this.TargetCalc = function( targetID, flags )  {
            'use strict';

            let ret, val = 0,
				po = this;
            try {
                let TokObj = getObj("graphic", targetID.trim() ); 
                if (typeof TokObj != 'undefined' ) {
                    let cID = TokObj.get("represents");			// cID is TARGET character id.
					
					function getDefs( what, what2 ) {
						val = po.getValue( ((flags & Earthdawn.flagsTarget.Natural) ? what + "-Nat" : what), cID);
										// If the target is NOT blindsided (in which case we already have the blindsided value), 
										// but the current sheet IS blindsiding, need to figure out the targets blindsided value. 
						if ((getAttrByName( cID, "condition-Blindsided") != "1" ) && (getAttrByName( po.charID, "condition-Blindsiding") == "1" )) {
							val -= 2;
							if ( !(flags & Earthdawn.flagsTarget.Natural) 
									&& (state.Earthdawn.g1879 || (state.Earthdawn.gED && state.Earthdawn.edition == 4)) 
									&& getAttrByName( cID, "condition-NoShield") != "1" )
								val -= parseInt( getAttrByName( cID, "Shield-" + what2) || 0) + parseInt( getAttrByName( cID, what + "-ShieldBuff") || 0)
						}
					}

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
						if( this.charID && getAttrByName( this.charID, "condition-TargetPartialCover") == "1" && getAttrByName( cID, "condition-Cover") == "0")
							val += 2;		// Get bonus for target token being marked as having Cover, or attacking token being marked as target having Cover, not both.  
						val += parseInt( getAttrByName( this.charID, "Adjust-TN-Total" ));		// If this character has a condition which causes it's target numbers to be adjusted. 
                        ret = { val: val, name: TokObj.get( "name")};
                    }
                } // end TokenObj defined
            } catch(err) {
                log( "ED.TargetCalc() error caught: " + err );
            }   // end catch
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
					//      Ask: PD (or MD or SD): +/-(number)		// This is not a combo of the other two. PD is ACTING tokens PD, not a TARGET token. if a normal non-zero integer is entered after it, it replaces and overwrites the PD based target number, the modifier number only modifies the target number if it starts with a plus or a minus sign.
																	// Note: if this turns out to be a problem later, can easily change this to something other than "Ask".
        this.TargetT = function( ssa )  {
            'use strict';

            try {
                var flg, oneTarg;
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
						case "ri":	// Riposte
							this.bFlags |= this.TargetTypeToFlags( ssa[ 3 ] ) | Earthdawn.flagsTarget.Riposte;
                            this.targetNum = this.ssaMods( ssa, 3, 1);
							let tar2 = this.TargetCalc( ssa[ 2 ], this.bFlags );
							this.misc[ "targetNum2" ] = tar2[ "val" ];		// The 2nd target number, of the PD of the counterattack target.
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
                            this.chat( "Error! ED.TargetT() unknown target type '"+ tType +"'. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror); 
                        }
                    }
                }
				if( oneTarg === true ) {			// we are not going to process this command as is.  Instead we are going to make new commands and insert them into the command line.
													// See Notes at the top of the routine. 
					this.edClass.msgArray.splice( this.indexMsg + 1, 0, "TargetType: " + ssa[ 1 ].slice(0, -1) );		// TargetType is what was passed to us, with the trailing "1" stripped off.
					let r = this.indexMsg + 3;	// default is three steps from current.
					if( ssa.length > 3 && ssa[ 3 ] ) {
						++r;
						this.edClass.msgArray.splice( this.indexMsg + 3, 0, "Tokenlist: " + ssa[ 3 ] );
					}
					for( var i = this.indexMsg + 2; i < this.edClass.msgArray.length; ++i )
						if( this.edClass.msgArray[ i ].slice(0,10).toLowerCase().indexOf( "foreach" ) != -1 ) {			// If there was a foreach, replace it. 
							this.edClass.msgArray.splice( i, 1, "TargetSet: " + ssa[ 2 ] );			// Target ID was also passed.
							i = 99;
						}
					if( i < 99 )
						this.edClass.msgArray.splice( r, 0, "Tokenlist: " + ssa[ 3 ], "TargetSet: " + ssa[ 2 ] );			// Target ID was also passed.
//log( this.edClass.msgArray);
				} else if( flg !== undefined ) {
                    var s = this.ForEachToken( ["ForEach", "Status", "TargetList"]);
                    if( s === undefined)
                        this.bFlags |= this.TargetTypeToFlags( tType );
                    else {
                        if( s && flg === 1 )            // There are already targets assigned to at least one of these tokens. 
                            this.bFlags |= this.TargetTypeToFlags( tType );
                        else {
							var v;
							var t = "";
							if( this.tokenIDs.length === 0 ) 
								v = Earthdawn.colonFix( "!Earthdawn~ TargetType: " + tType + "~ charID: " + this.charID );		// There are no selected tokens, just pass the charID.
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
									s += Earthdawn.colon() + Earthdawn.at() + Earthdawn.braceOpen() + "target" 
											+ Earthdawn.pipe() + a[k] + " Target" + Earthdawn.pipe() + "token_id" + Earthdawn.braceClose();
//									s += Earthdawn.colonFix( ": &#64;{target|" + a[k] + " Target|token_id}");
								s += t + ")";
							}
							s += "}}";
                            this.chat( s, Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive );
                        }
                        this.targetNum += this.ssaMods( ssa, 2) || 0;
                    }
                }
//log( this.targetNum);
            } catch(err) {
                log( "ED.TargetT() error caught: " + err );
            }   // end catch
            return;
        } // End ParseObj.TargetT()



                    // ParseObj.TargetTypeToFlags()
                    //
                    // Passed a Target Type (PD, PDh, PDHp1p, PD-Nat, etc)
                    // Return the bFlags values corresponding to this target type.
        this.TargetTypeToFlags = function( tType )  {
            'use strict';

            var ret = 0;
            try {
                var tmp = tType.trim().toLowerCase();
                switch ( tmp.slice( 0, 2)) {
                case "no":      break;      // None
                case "se":      ret |= Earthdawn.flagsTarget.Set;     break;
                case "pd":      ret |= Earthdawn.flagsTarget.PD;      break;
                case "md":      ret |= Earthdawn.flagsTarget.MD;      break;
                case "sd":      ret |= Earthdawn.flagsTarget.SD;      break;
                default:        this.chat( "Failed to parse TargetType: '" + tmp + "' in msg: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror );
                }
                if( ret & Earthdawn.flagsTarget.Mask ) {        // Do this only if found a valid string above. 
                    if( tmp.slice( 2, 3) === "h")
                        ret |= Earthdawn.flagsTarget.Highest;
                    if( tmp.endsWith( "p1p"))
                        ret |= Earthdawn.flagsTarget.P1pt;
					if( tmp.indexOf( "-nat" ) > -1)
						ret |= Earthdawn.flagsTarget.Natural;
                }
            } catch(err) {
                log( "ED.TargetTypeToFlags() error caught: " + err );
            }   // end catch
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
//smc.push ( { code: "karma", prompt: "Karma", attrib: "Karma-Roll", icon: "lightning-helix", submenu: "?{Karma|None,[0^u]|One,[1^s]|Two,[2^b]|Three,[3^c]}" } );
//smc.push ( { code: "willforce", prompt: "WillForce", attrib: "SP-Willforce-Use", icon: "ni-willforce" } );

                var name;
                var actn = "!edToken~ !Earthdawn~ ForEach~ marker: " + lu + ":t";
                if (lu === "willforce")
                    name = Earthdawn.Constants.SymbolSpell + "​​​WilFrc"

                if( name != undefined ) {
                    if( !show )
                        Earthdawn.abilityRemove( this.charID, name );

                    if( show )
                        Earthdawn.abilityAdd( this.charID, name, actn)
                }
            } catch(err) {
                log( "ParseObj.TokenActionToggle() error caught: " + err );
            }   // end catch
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
                    this.chat( "Error! TokenFind() when don't have a CharID.", Earthdawn.whoFrom.apierror ); 
                    return;
                }
				let tl = this.ForEachToken( [ "ForEach", "list", "c", "ust" ] );
				if( tl.length === 1 ) {
					this.tokenInfo = tl[ 0 ];
					return true;
				} else 
					return false;
            } catch(err) {
                log( "ParseObj.TokenFind() error caught: " + err );
            }   // end catch
            return;
        } // End ParseObj.TokenFind()





                    // TokenSet()
                    // store a value among a tokens statusmarkers.
                    // Stores it as a 'statusmarker' whose name is key:secondary:tertiary. 
                    //  what:	clear:  	clear all entries with this key.   Afterwards add key:secondary:tertiary if they were passed.
                    //          replace: 	remove all key/secondary combinations. Replace with new values if passed.
                    //          add:    	clear nothing - add this key/secondary/tertiary combo.
					// Usage:  
					//		key is a keyword that indicates the category. Such as "Hits". 
					//		secondary is a value associated with the key, such as the token ID that was hit.
					//		tertiary is a value (or sequence of values separated by anything but commas) that is stored and accessed via the key/secondary combo.
                    // Note that if you don't clear old entries out, you can have multiple entries with the same keys.
					// Note that comma's and colons are used in these structures. if secondary or tertiary contain any commas or colons, they are turned into a less common symbol and TokenGet restores them.
        this.TokenSet = function( what, key, secondary, tertiary)  {
            'use strict';

//log( "TokenSet " + what + " " + key + " " + secondary + " " + tertiary);
//log( this.tokenInfo);
            try {
                if( what === undefined ) {
                    this.chat( "Error! TokenSet() 'what' undefined. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror); 
                    return;
                }
                if( key === undefined ) {
                    this.chat( "Error! TokenSet() 'key' undefined. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror); 
                    return;
                }
                if( this.tokenInfo === undefined || this.tokenInfo.tokenObj === undefined )
					this.TokenFind();

				let bToken = (this.tokenInfo != undefined && this.tokenInfo.tokenObj != undefined);
				if( secondary !== undefined )
					secondary = secondary.replace( /,/g, Earthdawn.Constants.CommaReplace ).replace( /:/g, Earthdawn.Constants.ColonReplace);
				if( tertiary !== undefined )
					tertiary = tertiary.replace( /,/g, Earthdawn.Constants.CommaReplace ).replace( /:/g, Earthdawn.Constants.ColonReplace);
				key += ":";		// Key should end in colon to make it more readable when debugging.
                var changed = false,
					changedMark = false;
                var clr;
                switch (what.toLowerCase().trim()) {
                case "clear":   clr = -1;   break;      // This means clear all old secondaries out, before adding new value if it exists. 
                case "add":     clr =  0;   break;
                case "remove":
                case "replace": clr =  1;   break;
                default: 
                    this.chat( "Error! TokenSet() unknown 'what' value of " + what +". Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror); 
                    return;
                }

				let markers = "," + ( bToken ? this.tokenInfo.tokenObj.get( "statusmarkers" ) : "");
				if (markers.length > 3) 
					markers += ",";

                let att = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "psuedoToken" }, ""),
					pt = "," + att.get( "current" );
				if( pt.length > 3 )
					pt += ",";		// It is easier to assume that every marker has a comma before it and after it. 

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
				}
				markers = remove( markers);
				changedMark = changed;		changed = false;
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
					att.setWithWorker( "current", pt.slice(1, -1));
            } catch(err) {
                log( "ParseObj.TokenSet() error caught: " + err );
            }   // end catch
            return;
        } // End ParseObj.TokenSet()



                    // TokenGet()
                    // return all values stored among a tokens statusmarkers for a specific key.
					// if retString is true, then return first thing found as a string. Otherwise return an array of every key found. 
					// Also return anything stored in character attribute "pseudoToken", where we might have stashed something when we could not figure out what token is being used.
        this.TokenGet = function( key, retString )  {
            'use strict';

            var ret = [];
            try {
                if( this.tokenInfo === undefined || this.tokenInfo.tokenObj === undefined )
					this.TokenFind();
				key += ":";		// Key should end in colon to make it more readable when debugging.

				let markers = "," + ( (this.tokenInfo && this.tokenInfo.tokenObj) ? this.tokenInfo.tokenObj.get( "statusmarkers" ) : "");
				if (markers.length > 3) 
					markers += ",";
                let att = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "psuedoToken" }, ""),
					pt = att.get( "current" );

				if( pt.length > 2 )
					markers = pt + "," + markers;		// It is easier to assume that every marker has a comma before it and after it. 

                var i = markers.indexOf( "," + key );
                while ( i > -1 ) {
                    var e = markers.indexOf( ",", i + 1);
                    ret.push( markers.slice( i + key.length + 1, e).replace(new RegExp( Earthdawn.Constants.ColonReplace, "g"), ":").replace(new RegExp( Earthdawn.Constants.CommaReplace, "g"), ",") );
                    i = markers.indexOf( "," + key, e-1 );
                }
            } catch(err) {
                log( "ParseObj.TokenGet() error caught: " + err );
            }   // end catch
            return retString ? (ret.length == 0 ? "" : ret[ 0 ]) : ret;
        } // End ParseObj.TokenGet()



                    // return all values stored among a tokens statusmarkers for a specific key.
					// This version is passed a tokenID instead of already having the information in tokenObj.
        this.TokenGetWithID = function( key, tokenID )  {
            'use strict';

            var ret = [];
            try {
				let TokObj = getObj("graphic", tokenID); 
                if (typeof TokObj === 'undefined' )
                    return;
				key += ":";		// Key should end in colon to make it more readable when debugging.
                var markers = "," + TokObj.get( "statusmarkers" ) + ",";       // It is easier to assume that every marker has a comma before it and after it. 
                var i = markers.indexOf( "," + key );
                while ( i > -1 ) {
                    var e = markers.indexOf( ",", i + 1);
                    ret.push( markers.slice( i + key.length + 1, e));
                    i = markers.indexOf( "," + key, e-1 );
                }
            } catch(err) {
                log( "ParseObj.TokenGetWithID() error caught: " + err );
            }   // end catch
            return ret;
        } // End ParseObj.TokenGetWithID()



                    // ParseObj.TuneMatrix()
                    // Move a spell into a matrix.
                    // This routine is called  twice. The character sheet calls this with ssa[1] = "Spell". This will generate a chat window button 
                    //      that when pressed calls this routine with ssa[1] = "Matrix"
                    // ssa = Spell, spell row ID.
                    // ssa = Matrix, spell row ID, Matrix row ID.
        this.TuneMatrix = function( ssa )  {
            'use strict';

            try {
				let bShare = false;
                switch ( ssa[ 1 ].toLowerCase() ) {
                case "spell": {		// The user has chosen "Attune" from the button in the spell list. Send a message to the chat window asking what matrix to put this spell into.
                    if( ssa === undefined || ssa.length < 3 || ssa[2] === "") {
                        this.chat("ED.TuneMatrix() error - There was an error, Could not read RowID for the spell. Go to the spell you tried to tune, and change the name, then change it back. That should force the system to save the RowID.", Earthdawn.whoFrom.apierror );
                    } else {
                                        // go through all attributes for this character and look for ones that end in "_SPM_RowID". 
                        let attributes = findObjs({ _type: "attribute", _characterid: this.charID });
                        let  matrices = [];
                        _.each( attributes, function (indexAttributes) {
                            if (indexAttributes.get("name").indexOf( "_SPM_RowID" ) > 0)
                                matrices.push( indexAttributes.get("current") );
                        }); // End for each attribute.
                        if( matrices.length > 0) {      // For each matrix found, make a chat button.
                            let po = this;
                            let t2;
                            let s = "";
                            _.each( matrices, function (indexMatrix) {
                                switch( Earthdawn.getAttrBN( po.charID, Earthdawn.buildPre( "SPM", indexMatrix ) + "Type", "-10") ) {
                                    case  "15":     t2 = "Enh";     break;
                                    case  "25":     t2 = "Armd";    break;
                                    case "-20":     t2 = "Shrd";    break;
                                    case "-10":
                                    default:        t2 = "Std";
                                }
                                s += "[" + t2 + "-" + Earthdawn.getAttrBN( po.charID, Earthdawn.buildPre( "SPM", indexMatrix ) + "Rank", "0") + 
                                            " " + Earthdawn.getAttrBN( po.charID, Earthdawn.buildPre( "SPM", indexMatrix ) + "Contains", "") + 
                                            "](!Earthdawn~ charID: " + po.charID + "~ TuneMatrix: Matrix: " + ssa[2] + ": " + indexMatrix + ")";
                            }); /// End each spell matrix
                            this.chat( "&{template:default} {{name=Load " + Earthdawn.getAttrBN( po.charID, Earthdawn.buildPre( "SP", ssa[2] ) + "Name", "") 
										+ " into which Matrix? " +  Earthdawn.colonFix( s ) + "}}", Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive);      // Chat buttons don't like colons.   Change them to something else. They will be changed back later. 
                        } else
                            log("ED.TuneMatrix() error - You don't have any matrices to attune.");
                    }
                }	break;
				case "share":	// Create a matrix and move a spell into it.
					bShare = true;
					ssa[ 3 ] = Earthdawn.generateRowID();
								// Note: this does NOT break, it falls down. 
                case "matrix": {		// The user has told us to swap a spell into a certain matrix.
                    let spellFrom = ssa[2];			// rowID of repeating_spell
                    let matrixTo = ssa[3];			// rowID of repeating_matrix
                    let po = this;
                    let t = "";

                    function toMatrix( base, val )  {
                        'use strict';
						if( val ) {				// Error: Firebase.update failed: First argument contains undefined in property 'current'
							let aobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: po.charID, name: Earthdawn.buildPre( "SPM", matrixTo ) + base });
							aobj.setWithWorker( "current", val );
						}
                    } // End ToMatrix()
                                    // This local function looks up the correct value (if it can find it) and copies it to the matrix
                    function copySpell( base, dflt )  {
                        'use strict';
                        let val = Earthdawn.getAttrBN( po.charID, Earthdawn.buildPre( "SP", spellFrom ) + base, dflt);
						if( base === "AoE" && (val === "x" || val === " ")) val = dflt;
						toMatrix( base, val === undefined ? dflt : val );
                    } // End CopySpell()


					if ( bShare ) {
						toMatrix( "RowID", ssa[ 3 ] );
						toMatrix( "DR", "10");
						toMatrix( "mThreads", "0");
						toMatrix( "Type", "-10");
						toMatrix( "Origin", "Sharing" );
					}
                    switch( Earthdawn.getAttrBN( po.charID, Earthdawn.buildPre( "SP", spellFrom ) + "Discipline", "0") ) {
                        case  "5.3":    t = "El-";      break;
                        case  "6.3":    t = "Il-";      break;
                        case  "7.3":    t = "Ne-";      break;
                        case "16.3":    t = "Wz-";      break;
                        case   "98":    t = "Oth-";     break;
                        case   "99":    t = "Pwr-";     break;
                    }
                    t += Earthdawn.getAttrBN( po.charID, Earthdawn.buildPre( "SP", spellFrom ) + "Circle", "0") + " '"
                       + Earthdawn.getAttrBN( po.charID, Earthdawn.buildPre( "SP", spellFrom ) + "Name", "") + "'";

                    let aobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: po.charID, name: Earthdawn.buildPre( "SPM", matrixTo ) + "Contains" });
					Earthdawn.abilityRemove( this.charID, Earthdawn.Constants.SymbolSpell + aobj.get( "current" ) );
                    aobj.setWithWorker( "current", t );
					Earthdawn.abilityAdd( this.charID, Earthdawn.Constants.SymbolSpell + t, 
							"!edToken~ charID: " + this.charID
							+ "~ ?{" + t + " What|Info," + Earthdawn.encode( "spell: " + matrixTo + ": Info" )
							+ "|Start New Casting," + Earthdawn.encode( "ForEach: inmt~ spell: " + matrixTo + ": New: ?{Matrix or Grimoire cast|Matrix,M|Grimoire,G}" )
							+ "|Weave Threads,"     + Earthdawn.encode( "ForEach: inmt~ spell: " + matrixTo + ": Weave: ?{Modifier|0}" )
							+ "|Cast,"              + Earthdawn.encode( "Target: " + Earthdawn.getAttrBN( po.charID, Earthdawn.buildPre( "SP", spellFrom ) + "Casting", "MDh") 
																	   + "~ ForEach: inmt~ spell: " + matrixTo + ": Cast: ?{Modifier|0}" )
							+ "|Effect," 			+ Earthdawn.encode( "ForEach: inmt~ spell: " + matrixTo + ": Effect: ?{Modifier|0} " ) + "}" );

                    toMatrix( "spRowID", Earthdawn.getAttrBN( this.charID, Earthdawn.buildPre( "SP", spellFrom ) + "RowID" ));
                    copySpell( "sThreads", "0");
                    copySpell( "Numbers", "0");
                    copySpell( "Casting", "");
                    copySpell( "Range", "");
                    copySpell( "AoE", " ");
                    copySpell( "Duration", "");
                    copySpell( "WilEffect", "0");
                    copySpell( "EffectArmor", "N/A");
                    copySpell( "Effect", "");
                    copySpell( "SuccessLevels", "");
                    copySpell( "ExtraThreads", "");
                    toMatrix( "EnhThread", "x");
                    copySpell( "SuccessText", "");
                    copySpell( "FX", "");
                    copySpell( "Notes", "");
					let txt = t + " loaded into Matrix.";

					if( Earthdawn.getAttrBN( po.charID, Earthdawn.buildPre( "SPM", matrixTo ) + "mThreads", "0" ) > 0 &&
								Earthdawn.getAttrBN( po.charID, Earthdawn.buildPre( "SP", spellFrom ) + "sThreads", "0" ) < 1 ) {
						txt += "<br/>What Extra Thread do you wish to tie into the matrix? ";
						let opt = Earthdawn.getAttrBN( this.charID, Earthdawn.buildPre( "SPM", matrixTo ) + "ExtraThreads", "").split( "," );
						for( let i = 0; i < opt.length; ++i )
							txt += " " + this.makeButton( opt[ i ], "!Earthdawn~ charID: " + this.charID + "~ TuneMatrix: thread: " + matrixTo + ":" + opt[ i ], 
								"Press this button to tie this extra thread option into the matrix.", "MediumAquaMarine", "Black" );
					}

                    this.chat( txt, Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive);
				}	break;
                case "thread": {			// Set this extra thread option to be the enhanced thread.
                    let aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: Earthdawn.buildPre( "SPM", ssa[ 2 ] ) + "EnhThread" });
                    aobj.set("current", ssa[ 3 ] );
                    this.chat( "Updated to " + ssa[ 3 ], Earthdawn.whoTo.player | Earthdawn.whoFrom.noArchive);
                }	break;
                default:
                    log("ED.TuneMatrix() error - badly formed command.");
                    log( ssa );
                }
            } catch(err) {
                log( "ED.TuneMatrix() error caught: " + err );
            }   // end catch
        } // End ParseObj.TuneMatrix()



					// ParseObj.FindPageOfPlayer()
                    // 
                    // Returns pageID of page
        this.FindPageOfPlayer = function( playerID )  {
            'use strict';

            var pg = Campaign().get("playerspecificpages");
            if ( pg )
                pg = pg.get( playerID );
            if( !pg )
                pg = Campaign().get("playerpageid");
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
                    this.chat( "Error! Trying updateDates() when don't have a CharID.", Earthdawn.whoFrom.apierror ); 
                    return;
                } 
                var kobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "record-date-throalic" });
                kobj.setWithWorker("current", ssa[ 1 ] );
                var date = new Date();
                var ds = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
                kobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "record-date-real" });
                kobj.setWithWorker("current", ds );
            } catch(err) {
                log( "ED.UpdateDates() error caught: " + err );
            }   // end catch
        } // End ParseObj.UpdateDates()



                    // ParseObj.WhoSendTo ()
                    // Look up how this character is to report  activity (public, gm, or hidden)
        this.WhoSendTo = function()  {
            'use strict';

            var ret = 0;    // Default is public. 
            try {
                if( this.charID === undefined )
                    this.chat( "Error! charID undefined in WhoSendTo() command. Msg is: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror);
                else {
                    let rolltype;
					if( "RollType" in this.misc )
						rolltype = this.misc[ "RollType"];
					else if( "rollWhoSee" in this.misc )
						rolltype =  getAttrByName( this.charID, this.misc[ "rollWhoSee" ] );
					if( rolltype === "default" || rolltype === "@{RollType}" )
					    rolltype = undefined;
					if( !rolltype ) {
						rolltype = getAttrByName( this.charID, "RollType" );
					}
                    if ( rolltype != undefined )
                        if( rolltype.trim().toLowerCase().endsWith( "pgm"))
                            ret = Earthdawn.whoTo.gm | Earthdawn.whoTo.player;
                        else if( rolltype.trim().toLowerCase().endsWith( "w gm" ))
                            ret = Earthdawn.whoTo.gm;
                }
            } catch(err) {
                log( "ED.WhoSendTo() error caught: " + err );
            }   // end catch
            return ret;
        } // End ParseObj.WhoSendTo()



                    // ParseObj.Parse - A message segment that needs to be parsed. It could do any of several functions.
                    // The basic form is that a parse message is tilde delimited (~). 
                    // Many message segments have subsegments that are colon (:) delimited. 
                    //
                    // This routine parses a message segment and it's subsegments. 
        this.Parse = function( cmdSegment )  {
            'use strict';
			
			var falloutParse = false;
            try {
				var SubsegmentArray = cmdSegment.split(":");      // Split out any subsegments into an array by colon : delimiter. 
				for( let i = 0; i < SubsegmentArray.length; ++i )
					SubsegmentArray[ i ] = SubsegmentArray[ i ].trim();

//log( cmdSegment);
				switch ( SubsegmentArray[ 0 ].toLowerCase() ) {
				case "!edinit":             // We need to skip to the old parsing method.
					this.edClass.msgArray.splice( 0, this.indexMsg);
					this.edClass.msgArray[0] = this.edClass.msgArray[0].trim();
					this.edClass.Initiative();
					falloutParse = true;
					break;
				case "!earthdawn":            // Just skip this. There will be an extra one of these on Token Actions.
					break;
				case "!edsdr":
				case "!edsdrgm":
				case "!edsdrhidden":
					if( SubsegmentArray[ 0 ].charAt( 0 ) === "!" ) {
						this.edClass.msgArray.splice( 0, this.indexMsg);
						this.edClass.msgArray[0] = this.edClass.msgArray[0].trim();
						if ( this.edClass.msgArray.length > 1 )
							this.edClass.StepDiceRoller();
						falloutParse = true;
					}
					break;
				case "action":
					this.Action( SubsegmentArray );
					break;
				case "armortype":
					if( SubsegmentArray.length > 1) {
						switch (SubsegmentArray[ 1 ].toLowerCase()) {
						case "n/a":     this.bFlags |= Earthdawn.flagsArmor.na;      break;		// Not Applicable.
						case "pa":      this.bFlags |= Earthdawn.flagsArmor.PA;      break;
						case "ma":      this.bFlags |= Earthdawn.flagsArmor.MA;      break;
						case "pa-nat":	this.bFlags |= Earthdawn.flagsArmor.PA | Earthdawn.flagsArmor.Natural;		break;
						case "ma-nat":	this.bFlags |= Earthdawn.flagsArmor.MA | Earthdawn.flagsArmor.Natural;		break;
						case "na":																// No Armor. 
						case "noarmor":
						case "none":	this.bFlags |= Earthdawn.flagsArmor.None;    break;
						case "unknown":
						case "unk":     this.bFlags |= Earthdawn.flagsArmor.Unknown; break;
						}
					}
					break;
				case "bonus":                       // Need to have called SetToken or Foreach before this.
					this.Bonus( SubsegmentArray );      // There is a bonus die to set.
					break;
				case "calcstep":
				case "calculatestep":
				case "calcvalue":
				case "calculatevalue":
					switch ( SubsegmentArray[ 1 ].toLowerCase() ) {
					case "jumpup":          this.Karma( "Karma-Control-JumpUp", -1 );       this.misc[ "reason" ] = "Jumpup Test";		this.misc[ "StyleOverride" ] = Earthdawn.style.Full;		break;
					}
					falloutParse = this.calculateStep( SubsegmentArray );
					break;
				case "charid": { 	//  "CharID: (xx)": This command came with character ID attached (attached by the macro). Store this character ID.
					if( 1 < SubsegmentArray.length ) {
						this.charID = SubsegmentArray[ 1 ];
						function who_p( whom ) {
							return whom.endsWith( " (GM)" ) ? '/w gm ' : '/w "' + whom +'" ';
						}
						let attribute = Earthdawn.findOrMakeObj({_type: 'attribute', _characterid: this.charID,	name: "playerWho"});
						attribute.set("current", who_p( this.edClass.msg.who ));
				}	} break;
				case "chatmenu":
					this.ChatMenu( SubsegmentArray );
					break;
				case "creaturepower" :
				case "opponentmanoeuvre" :
					this.CreaturePower( SubsegmentArray );
					break;
				case "strain":        // This falls through into Damage, but with an extra parameter inserted between "strain" and the value. 
				case "strainsilent":
					SubsegmentArray.splice( 1, 0, "NA");
				case "damage":         // Apply damage to selected tokens.  Must be preceeded by ForEach or SetToken
					this.Damage( SubsegmentArray );
					break;
				case "debug":
					this.Debug( SubsegmentArray );
					break;
				case "foreach":         // "ForEach : CB1 : Wpn1":  For Each selected token, perform the following macros.
				case "foreachtoken":
					this.ForEachToken( SubsegmentArray );
					break;
				case "foreachtokenlist":
				case "tokenlist":
				case "fet":
				case "fetl":
					this.ForEachTokenList( SubsegmentArray );
					break;
				case "fxset":
					this.FX( SubsegmentArray );
					break;
				case "init":
					falloutParse = this.Roll( SubsegmentArray );
					break;
				case "dev pnt":
				case "dev pnts":
				case "dev":
				case "dp":
				case "karma":
				case "kc":
					this.Karma( SubsegmentArray );
					break;
				case "linktoken":        // Link selected token(s) to CharId (that has been previously parsed)
					this.LinkToken();
					break;
				case "recalc":                  // Recalc function is done by sheetworker, but after they do the work, need to reload combat slots. 
					this.chat( "Note: Sheetworker Recalc is triggered by setting the dropdown TO recalc, not by pressing the button.", Earthdawn.whoTo.player ); 
					break;
	// Toggle option is obsolete and can be removed.
				case "toggle":			// toggle the token action for karma or willforce on or off.
					this.MarkerSet( [ "toggle", SubsegmentArray[ 1 ], "t"] );
					break;
				case "marker":         // Set the statusmarker for selected tokens.
					this.MarkerSet( SubsegmentArray );
					break;
				case "mask":
					this.Mask( SubsegmentArray );
					break;
				case "misc":
					this.funcMisc( SubsegmentArray );
					break;
				case "mod": 
				case "adjust": 
				case "modadjust": 
				case "adjustmod": 
				case "adjustresult": 
				case "resultadjust": 
					falloutParse = this.Lookup( 2, SubsegmentArray );       // 2 is this.misc.result.
	//                this.misc[ "result" ] = (this.misc[ "result" ] || 0) + parseInt( SubsegmentArray[ 1 ] );    // Mod : x - Adds X to any result obtained.
					break;
				case "reason":
					if( SubsegmentArray.length > 1 )
						this.misc[ "reason" ] = cmdSegment.slice( cmdSegment.indexOf( ":" ) + 1).trim();	// Use the raw cmdSegment to allow colons in reason.
					break;
				case "record":
					this.Record( SubsegmentArray );
					break;
				case "rerollnpcinit":
					this.RerollNpcInit();
					break;
				case "roll":
					this.ForEachHit( SubsegmentArray );
					break;
				case "rolltype":
					this.misc[ "RollType" ] = SubsegmentArray[ 1 ];
					break;
				case "setattrib":
					falloutParse = this.Lookup( 4, SubsegmentArray );       // 4 sets the character sheet attribute in the first ssa parameter.
					break;
				case "setresult":
					this.misc[ "result" ] = this.ssaMods( SubsegmentArray );
					break;
				case "setstep":
					this.misc[ "step" ] = this.ssaMods( SubsegmentArray );
					break;
				case "settoken":            // We are being passed a token ID. Set it into tokenInfo
					this.SetToken( SubsegmentArray );
					break;
				case "spell":
				case "grim":
					this.Spell( SubsegmentArray );
					break;
				case "statustotoken":
					this.SetStatusToToken();
					break;
				case "attribute":       // Note that ssa holds ether a numerical number, or an attribute that needs to be looked up (hopefully giving a numerical step number).
				case "step":            // Note also that THIS routine (unlike other routines such as ssaMods()) allows use off asynchronis process to interprite a calculated value. 
				case "value":
					switch ( SubsegmentArray[ 1 ].toLowerCase() ) {
					case "dex":                     this.Karma( "Karma-Control-Dex", -1 );              this.misc[ "reason" ] = "Dexterity Action Test";  this.misc[ "rollWhoSee" ] = "RollType-Dex";		this.misc[ "headcolor" ] = "action";	break;
					case "str":                     this.Karma( "Karma-Control-Str", -1 );              this.misc[ "reason" ] = "Strength Action Test";   this.misc[ "rollWhoSee" ] = "RollType-Str";		this.misc[ "headcolor" ] = "action";	break;
					case "tou":                     this.Karma( "Karma-Control-Tou", -1 );              this.misc[ "reason" ] = "Toughness Action Test";  this.misc[ "rollWhoSee" ] = "RollType-Tou";		this.misc[ "headcolor" ] = "action";	break;
					case "per":                     this.Karma( "Karma-Control-Per", -1 );              this.misc[ "reason" ] = "Perception Action Test"; this.misc[ "rollWhoSee" ] = "RollType-Per";		this.misc[ "headcolor" ] = "action";	break;
					case "wil":                     this.Karma( "Karma-Control-Wil", -1 );              this.misc[ "reason" ] = "Willpower Action Test";  this.misc[ "rollWhoSee" ] = "RollType-Wil";		this.misc[ "headcolor" ] = "action";	break;
					case "cha":                     this.Karma( "Karma-Control-Cha", -1 );              this.misc[ "reason" ] = "Charisma Action Test";   this.misc[ "rollWhoSee" ] = "RollType-Cha";		this.misc[ "headcolor" ] = "action";	break;
					case "dex-effect":              this.Karma( "Karma-Control-Dex", -1 );              this.misc[ "reason" ] = "Dexterity Effect Test";  this.misc[ "rollWhoSee" ] = "RollType-Dex";		this.misc[ "headcolor" ] = "effect";	break;
					case "str-effect":              this.Karma( "Karma-Control-Str", -1 );              this.misc[ "reason" ] = "Strength Effect Test";   this.misc[ "rollWhoSee" ] = "RollType-Str";		this.misc[ "headcolor" ] = "effect";	break;
					case "tou-effect":              this.Karma( "Karma-Control-Tou", -1 );              this.misc[ "reason" ] = "Toughness Effect Test";  this.misc[ "rollWhoSee" ] = "RollType-Tou";		this.misc[ "headcolor" ] = "effect";	break;
					case "per-effect":              this.Karma( "Karma-Control-Per", -1 );              this.misc[ "reason" ] = "Perception Effect Test"; this.misc[ "rollWhoSee" ] = "RollType-Per";		this.misc[ "headcolor" ] = "effect";	break;
					case "wil-effect":              this.Karma( "Karma-Control-Wil", -1 );              this.misc[ "reason" ] = "Willpower Effect Test";  this.misc[ "rollWhoSee" ] = "RollType-Wil";		this.misc[ "headcolor" ] = "effect";	break;
					case "cha-effect":              this.Karma( "Karma-Control-Cha", -1 );              this.misc[ "reason" ] = "Charisma Effect Test";   this.misc[ "rollWhoSee" ] = "RollType-Cha";		this.misc[ "headcolor" ] = "effect";	break;
					case "str-step":                this.Karma( "Karma-Control-KnockDown", -1 );        this.misc[ "reason" ] = "Knockdown Test";     	this.misc[ "headcolor" ] = "ask";		break;
					case "initiative":              this.Karma( "Karma-Control-Initiative", -1 );       this.misc[ "reason" ] = "Initiative";    		this.misc[ "headcolor" ] = "init";		break;
					case "attack-step":             this.Lookup( 3, [ "PD", "Adjust-TN-Total" ]);       this.misc[ "reason" ] = "Attack Test";        	this.misc[ "headcolor" ] = "attack";	this.Damage( ["Strain", "NA", this.getValue( "combatOption-AggressiveAttack") * this.getValue( "Misc-Aggressive-Strain") ] );		this.Bonus( [ 0, "Adjust-Attacks-Bonus" ] );	break;
					case "sp-spellcasting-step":    this.Karma( "SP-Spellcasting-Karma-Control", 0 );   this.misc[ "reason" ] = "Spellcasting";  		this.misc[ "headcolor" ] = "md";		break;
					case "sp-patterncraft-step":    this.Karma( "SP-Patterncraft-Karma-Control", 0 );   this.misc[ "reason" ] = "Patterncraft";  		this.misc[ "headcolor" ] = "ask";		break;
					case "sp-elementalism-step":    this.Karma( "SP-Elementalism-Karma-Control", 0 );   this.misc[ "reason" ] = "Elementalism";  		this.misc[ "headcolor" ] = "ask";		this.bFlags |= Earthdawn.flags.VerboseRoll;		break;
					case "sp-illusionism-step":     this.Karma( "SP-Illusionism-Karma-Control", 0 );    this.misc[ "reason" ] = "Illusionism";   		this.misc[ "headcolor" ] = "ask";		this.bFlags |= Earthdawn.flags.VerboseRoll;		break;
					case "sp-nethermancy-step":     this.Karma( "SP-Nethermancy-Karma-Control", 0 );    this.misc[ "reason" ] = "Nethermancy";   		this.misc[ "headcolor" ] = "ask";		this.bFlags |= Earthdawn.flags.VerboseRoll;		break;
					case "sp-wizardry-step":        this.Karma( "SP-Wizardry-Karma-Control", 0 );       this.misc[ "reason" ] = "Wizardry";      		this.misc[ "headcolor" ] = "ask";		this.bFlags |= Earthdawn.flags.VerboseRoll;		break;

					case "recovery-step": {
						this.Karma( "Karma-Control-Recovery", -1 );
						this.misc[ "reason" ] = "Recovery Test";
						this.bFlags |= Earthdawn.flags.Recovery;
						this.misc[ "headcolor" ] = "recovery";
						if (getAttrByName( this.charID, "NPC") != "2") {
							let aobj = Earthdawn.findOrMakeObj({ _type: 'attribute', _characterid: this.charID, name: "Recovery-Tests" });
							if( aobj.get( "current" ) >= getAttrByName( this.charID, "Recovery-Tests", "max")) {
								this.chat( this.tokenInfo.name + " does not have a recover test to spend." );
								falloutParse = true;
							} else
								aobj.setWithWorker( "current", (parseInt( aobj.get( "current" )) || 0) +1 );
						}
					}	break;

					case "casting": {
						let base = Earthdawn.buildPre( "SPM", SubsegmentArray[2] );
						this.misc[ "headcolor" ] = "md";
						if( Earthdawn.getAttrBN( this.charID, base + "SuccessLevels", "None") !== "Effect +2 Inc")
							this.bFlags |= Earthdawn.flags.NoOppMnvr;
						this.doLater += "~Karma: SP-Spellcasting-Karma-Control";
						this.misc[ "reason" ] = Earthdawn.getAttrBN( this.charID, base + "Contains", "") + " Spellcasting Test";
						SubsegmentArray = [ "value", "SP-Spellcasting-Step" ];
					}	break;
					case "spm_wileffect": 
					case "spm_wil_effect": {
// cdd ToDo
log( "spm_wil_effect  I think this is dead code. used to be old button inside of spm if you ever see it, it is not");
						let base = Earthdawn.buildPre( "SPM", SubsegmentArray[2] );
						this.misc[ "headcolor" ] = "effect";
						if (getAttrByName( this.charID, "SP-Willforce-Use") == "1") {
							this.doLater += "~Karma: SP-WilEffect-Karma-Control: SP-WillForce-Karma-Control" + "~Strain: 1";
							this.misc[ "reason" ] = Earthdawn.getAttrBN( this.charID, base + "Contains", "") + " WillForce Effect";
						} else {
							this.doLater += "~Karma: SP-WilEffect-Karma-Control"; 
							this.misc[ "reason" ] = Earthdawn.getAttrBN( this.charID, base + "Contains", "") + " Will Effect";
						}
						this.Parse( "armortype: " + Earthdawn.getAttrBN( this.charID, base + "EffectArmor", "N/A") );
						this.bFlags |= Earthdawn.flags.WillEffect;
						let t2 = parseInt( getAttrByName( this.charID, "Will-Effect") || 0 ) - parseInt(getAttrByName( this.charID, "Will-Eff-Buff") || 0);
						SubsegmentArray = [ "value", base + "WilEffect", t2.toString()];
					}	break;
					case "will-effect":		// Generic casting will effect button. 
						this.misc[ "headcolor" ] = "effect";
						if (getAttrByName( this.charID, "SP-Willforce-Use") == "1") {
							this.doLater += "~Karma: SP-WilEffect-Karma-Control: SP-WillForce-Karma-Control" + "~Strain: 1";
							this.misc[ "reason" ] = "WillForce Effect"; 
						} else {
							this.doLater += "~Karma: SP-WilEffect-Karma-Control"; 
							this.misc[ "reason" ] = "Will Effect";
						}
						this.bFlags |= (Earthdawn.flagsArmor.Unknown & Earthdawn.flags.WillEffect );
						break;
					default:
						this.chat( "Failed to parse 'value' in msg segment: '" + cmdSegment + "' in msg: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror );
					}		// End Value, Step, or Attribute.    Note that this falls into the Lookup below. 

				case "stepmod":
				case "modstep":
				case "modvalue":
					if( !falloutParse )
						falloutParse = this.Lookup( 1, SubsegmentArray );       // 1 = this.misc.step
					break;
				case "storeintoken":
					this.TokenSet( "replace", SubsegmentArray[ 1 ], SubsegmentArray[2], SubsegmentArray[ 3 ]);
					this.chat( SubsegmentArray[ 3 ] + " extra successes to go to next damage upon " + this.getTokenName( SubsegmentArray[ 2 ] ));
					break;
				case "target":
				case "targetnum":
					this.TargetT( SubsegmentArray );
					break;
				case "targetspell": {
					let tt = Earthdawn.getAttrBN( this.charID, Earthdawn.buildPre( "SPM", SubsegmentArray[1] ) + "Casting", "MDh");
					let sa = ( "targetspell:" + tt ).split( ":" );
					this.TargetT( sa );
				}   break;
				case "targettype":      // PD:  (or MD or SD) with optional h = highest, p1p = plus one per person, -Nat. This marks that this is the secondary chat message.
					if( SubsegmentArray.length > 1)
						this.bFlags |= this.TargetTypeToFlags( SubsegmentArray[ 1 ] );
					break;
				case "targetclear":
				case "targetsclear":
					this.TokenSet( "clear", "TargetList");
					break;
				case "targetid":
				case "targetset":
					if( this.bFlags & Earthdawn.flagsTarget.Set ) {
						this.TokenSet( "clear", "TargetList");
						for( var i = 1; i < SubsegmentArray.length; i++ )
							this.TokenSet( "add", "TargetList", SubsegmentArray[ i ]);
					} else
						this.forEachTarget( SubsegmentArray );
					break;
				case "targetmod":
				case "modtarget":
				case "targetvalue":
					falloutParse = this.Lookup( 3, SubsegmentArray );       // 1 = this.targetNum
					break;
				case "!edtoken":
				case "edtoken":
				case "token":                       // When called from a token action, "!edToken~ " is inserted ahead of another valid !Earthdawn~ command.
					this.tokenAction = true;        // This lets us know we were called from a token action. Without this. we were called directly from a character sheet.
					break;                          // This is done by creating a macro named Token, and inserting #Token in front of any other action you want a token action to preform.
				case "tunematrix":
					this.TuneMatrix( SubsegmentArray );
					break;
				case "updatedates":
					this.UpdateDates( SubsegmentArray );
					break;
				default:
					this.chat( "Failed to parse msg segment: '" + cmdSegment + "' in msg: " + this.edClass.msg.content, Earthdawn.whoFrom.apierror );
				} // End Switch
            } catch(err) {
                log( "ED.Parse() error caught: " + err );
            }   // end catch

            return falloutParse;
        };     // End ParseObj.Parse();



                    // ParseOjb.ParseLoop - Loop through as long as there are message segments left to process.
                    //
                    // Note that with asynchronous code, ParseLoop() is usually the place to reenter the loop. 
                    // IE: the old thread is told to fallout, and  the new thread takes over processing and continues with 
                    // a call to ParseLoop() to process any remaining tokens. 
        this.ParseLoop = function()  {
            'use strict';

            var falloutLoop = false;
            while ( !falloutLoop && (++this.indexMsg < this.edClass.msgArray.length )) {
                falloutLoop = this.Parse( this.edClass.msgArray[ this.indexMsg ].trim() );
            }
        };     // End ParseObj.ParseLoop();



    };  // End of ParseObj;



                // ED.ParseCmd ()
                // This routine is the control routine that sets up the loop. The real work is done by routines called by this one.
    this.ParseCmd = function()  {
        'use strict';

        var edParse = new this.ParseObj( this );    // This object is used to parse the message into segments delimited by tilde (~) characters and to process each individual segment.
        if ( this.msgArray[ 0 ].trim()  === "!edToken" )
            edParse.tokenAction = true;             // This lets us know we were called from a token action. Without this. we were called directly from a character sheet.
        edParse.ParseLoop();
    };     // End ED.ParseCmd();



//
// NOTE: Everything between this point and the similar note above is used with the PARSE command and interacts with the character sheet.
// 
// So if you are just using the stepdice and initiative rollers, and are not using my Earthdawn character sheets, you can cut everything between this point and the note above.
//


                // NOTE: This is the continuation of the main CREATE thread for this object. It makes use of functions declared above
    if( origMsg !== undefined ) {
        origMsg.content = origMsg.content.replace( new RegExp( Earthdawn.Constants.ColonReplace, "g"), ":");      // Buttons don't like colons, so any colon has been changed to this weird character. Change them back.
        this.msg = this.ReconstituteInlineRolls( origMsg );
        this.msgArray = origMsg.content.split("~");
        if ( this.msgArray.length < 2)
            this.chat( "Error! Earthdawn.js was unable to parse string. msg was: " + this.msg.content, Earthdawn.whoFrom.apierror );

        if( state.Earthdawn.logCommandline )
            log( this.msg );
    }

};  // End of EDclass;






	


on("ready", function() {
    'use strict';

                // Brand new character. Make sure that certain important attributes fully exist.
    on("add:character", function( obj ) {
        'use strict';
		let ED = new Earthdawn.EDclass();
		ED.newCharacter( obj.get( "_id" ) );
	});



                // New Graphic. Set it's statusmarkers to character sheet conditions and options.
    on("add:graphic", function( obj ) {
        'use strict';

        var ED = new Earthdawn.EDclass();
        var rep = obj.get("represents");
        if( rep != "" ) {
            var edParse = new ED.ParseObj( ED );
            edParse.tokenInfo = { type: "token", name: obj.name, tokenObj: obj, characterObj: getObj("character", rep ) };
            edParse.charID = rep;
            edParse.SetStatusToToken();
        }
    });



			// An attribute for some character has changed. See if it is one that needs special processing and do it. 
    function attribute( attr, prev ) {
        'use strict';

        try {
//log( attr);		// use attr.get("name") and attr.get("current").
//log( prev);		// use prev["name"] and prev["current"]
            let sa = attr.get("name");
			if( sa === "APIflag" && attr.get( "current" ) ) {		// a value in APIflag is sent from the sheetworker script for processing here. We tend to get two, one with "current" blank when it is created, and a 2nd one with the real value. Only pay attention to the 2nd one.
				let cmd = attr.get( "current" );

				function shouldUpdate( ver ) {			// "SheetUpdate," + origSheetVersion.toString() + "," + newSheetVersion.toString()
					return (parseFloat( Earthdawn.getParam( cmd, 2, ",")) < ver && ver <= parseFloat( Earthdawn.getParam( cmd, 3, ",")));
				};
				var ED = new Earthdawn.EDclass();

				switch ( Earthdawn.getParam( cmd, 1, ",") ) {
				case "SheetUpdate":
					let game = Earthdawn.getParam( cmd, 4, ",");
					state.Earthdawn.gED = !game || (game !== "1879" );
					state.Earthdawn.g1879 = !state.Earthdawn.gED;
					state.Earthdawn.game = state.Earthdawn.gED ? "ED" : "1879";

					if( shouldUpdate( 0.301 ))
						ED.updateVersion0p301( attr.get( "_characterid" ));
					if( shouldUpdate( 0.303 ))
						ED.updateVersion0p303( attr.get( "_characterid" ));
					if( shouldUpdate( 0.304 ))
						ED.updateVersion0p304( attr.get( "_characterid" ));
					if( shouldUpdate( 0.305 ))
						ED.updateVersion00p305( attr.get( "_characterid" ));
					break;
				default:
					log( "Unknown command in APIflag: " + cmd);
				}
				attr.remove();
			}


			
			function recordWrap( wrapper ) {
				'use strict';
//log( wrapper);

				let rankTo = attr.get("current");
				if( rankTo === "" )			// This is a newly created row, and has not really been set yet. No need to do anything until data is entered.
					return;
				let	rankFrom = prev ? prev["current"]: 0;
				let	rankDiff = rankTo - rankFrom;
				if( !rankDiff )				// If there are no actual rank changes.
					return;
				let cID = attr.get("_characterid");
				if( getAttrByName( cID, "NPC" ) != "0" )		// If this is an NPC, don't bother with the accounting.
					return;

				let lp = 0,
					silver = 0,
					iTime = 0,
					lpBasis = 0,
					misclabel = "", miscval,
					header, 
					sTime, 
					stepValue,
					bCount,
					type;

                switch( wrapper ) {
                case "DSP_Circle":
					if((rankTo + rankFrom) < 2 )		// First circle in first discipline is free. First circle in all other disciplines is complex.
						return;
					header = Earthdawn.getAttrBN( cID, sa.slice( 0, -10 ) + "DSP_Name", "" );
					misclabel = "Discipline";
					miscval = rankFrom + " -> " + rankTo;
					break;
                case "Questor":
					header = "";
					misclabel = "Questor Devotion";
					miscval = rankFrom + " -> " + rankTo;
					lpBasis = 1;
					break;
                case "SP_Circle":
					header = Earthdawn.getAttrBN( cID, sa.slice( 0, -6 ) + "Name", "" );
					misclabel = "Spell";
					miscval = "Circle " + rankTo + (( rankFrom > 0 ) ? " (changed from circle "  + rankFrom + ")" : "");
					if( rankTo > 0 )
						lp = fibonacci( rankTo ) * 100;
					if( rankFrom > 0 )
						lp -= fibonacci( rankFrom ) * 100;
					silver = rankDiff * 100;
					break;
                case "NAC_Requirements":
					header = Earthdawn.getAttrBN( cID, sa.slice( 0, -12 ) + "Name", "" );
					misclabel = "Knack";
					miscval = "Rank " + rankTo + (( rankFrom > 0 ) ? " (changed from Rank "  + rankFrom + ")" : "");
					if( rankTo > 0 )
						lp = fibonacci( rankTo ) * 100;
					if( rankFrom > 0 )
						lp -= fibonacci( rankFrom ) * 100;
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
					misclabel = "Novice Discipline Talent";
					miscval = rankFrom + " -> " + rankTo;
					lpBasis = 0;
					break;
                case "Rank":
					miscval = rankFrom + " -> " + rankTo;
					switch ( Earthdawn.getParam( sa, 4, "_")) {
					case "SPM":
						switch ( Earthdawn.getAttrBN( cID, sa.slice( 0, -4 ) + "Type", "-10" ) ) {
						case "15": 	header = "Enh Matrix";		break;
						case "25": 	header = "Armor Matrix";	break;
						case "-20": header = "Shared Matrix";	break;
                        case "-10":
						default:	header = "Std Matrix";
						}
						type = Earthdawn.getAttrBN( cID, sa.slice( 0, -4 ) + "Origin", "Free" );
					case "T":
						bCount = "T";
						if( type === undefined ) {
							header = Earthdawn.getAttrBN( cID, sa.slice( 0, -4 ) + "Name", "" );
							type = Earthdawn.getAttrBN( cID, sa.slice( 0, -4 ) + "Type", "D1-Novice" );
						}
						if( type.indexOf( "-" ) > 0 ) {
							let tier = Earthdawn.getParam( type, 2, "-"), 
								disc = Earthdawn.getParam( type, 1, "-");
							if( disc === "QD" ) {			// Questor
								lpBasis = 1;
								misclabel = tier + " Granted Questor Devotion.";
							} else {
								lpBasis = disc.slice( -1 ) - 1;
								misclabel = tier + " " + [ "", "2nd ", "3rd", "4th" ][lpBasis] 
											+ ( disc.slice( 0, 2) == "TO" ? "Talent Option" : "Discipline Talent");
							}
							switch ( tier ) {
								case "Master": 							++lpBasis;
								case "Warden":		case "Exemplar":	++lpBasis;
								case "Journeyman": 	case "Adherent":	++lpBasis;
							}
						} else {		// Not from Discipline
							switch ( type ) {
							case "Dummy":
							case "Free":
							case "Item":
							case "Other":
								return;
//							case "Questor":
//								misclabel = "Questor Power";
//								lpBasis = 0;
//							break;
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
								log( "Error! ED Attribute recordWrap for: " + sa );
								log( "Continued: Got type: " + type );
							}
						}
						break;
					case "thread":
						header = Earthdawn.getAttrBN( cID, sa.slice( 0, -4 ) + "Name", "" );
						switch ( Earthdawn.getAttrBN( cID, sa.slice( 0, -4 ) + "Type", "Novice" ) ) {
                        case "Novice":		lpBasis = 0;	misclabel = "Thread Item Novice Tier";		break;
						case "Journeyman": 	lpBasis = 1;	misclabel = "Thread Item Journeyman Tier";	break;
						case "Warden": 		lpBasis = 2;	misclabel = "Thread Item Warden Tier";		break;
						case "Master": 		lpBasis = 3;	misclabel = "Thread Item Master Tier";		break;
						default:			return;
						} break;
					case "SK":
						bCount = "S";
						header = Earthdawn.getAttrBN( cID, sa.slice( 0, -4 ) + "Name", "" );
						misclabel = "Skill";
						
						switch ( Earthdawn.getAttrBN( cID, sa.slice( 0, -4 ) + "Type", "Novice" ) ) {
                        case "Novice":		lpBasis = 1;	misclabel = "Novice Skill";		break;
						case "Journeyman": 	lpBasis = 2;	misclabel = "Journeyman Skill";	break;
						case "Warden": 		lpBasis = 3;	misclabel = "Warden Skill";		break;
						case "Master": 		lpBasis = 4;	misclabel = "Master Skill";		break;
						default:			return;
						} break;
						break;
					case "SKK":
						bCount = "S";
						header = Earthdawn.getAttrBN( cID, sa.slice( 0, -4 ) + "Name", "" );
						misclabel = "Knowledge Skill";
						lpBasis = 1;
						break;
					case "SKA":
						bCount = "S";
						header = Earthdawn.getAttrBN( cID, sa.slice( 0, -4 ) + "Name", "" );
						misclabel = "Artisan Skill";
						lpBasis = 1;
						break;
					default:
						header = Earthdawn.getAttrBN( cID, sa.slice( 0, -4 ) + "Name", "" );
						log("Error! ED Attribute recordWrap got illigal value of: " + Earthdawn.getParam( sa, 4, "_"));
					}
					break;
                case "ReadWrite":
                case "Speak":
					if( !rankFrom )
						return;			// Some ranks are created at record creation. Ignore them first time we see them.
					bCount = "S";
					header = wrapper + " Language";
					misclabel = "Skill";
					miscval = rankFrom + " -> " + rankTo;
					lpBasis = 1;
					break;
                }



				function fibonacci(num, memo) {
					memo = memo || {};
					if (memo[num]) 
						return memo[num];
					if (num <= 1) 
						return 1;
					return memo[num] = fibonacci(num - 1, memo) + fibonacci(num - 2, memo);
				}


				let rankMin = Math.min( rankTo, rankFrom),
					rankMax = Math.max( rankTo, rankFrom),
					tdate,
					party = findObjs({ _type: "character", name: "Party" })[0],
					today = new Date();
				if( party !== undefined )			// First look for throalic date on the "Party" sheet.
					tdate = getAttrByName( party.get( "_id" ), "record-date-throalic" );
				if( !tdate )			// If you did not find a "Party" sheet, look on the current character sheet.
					tdate = getAttrByName( cID, "record-date-throalic" );
				if( !tdate )
					tdate = "1517-1-1";


                switch( wrapper ) {
				case "SP-Circle":
				case "NAC_Requirements":
					break;
				default:		// All except SP-Circle
					for( let ind = rankMin; ind < rankMax; ++ind) {			// We want this loop to go once for each rank being done.
						switch( wrapper ) {
						case "DSP_Circle":
							if( rankTo > 0 )
								silver = fibonacci( ind + 1 ) * 100;
							break;
						case "Increases":
							let stepValue = Math.floor(( 5 + ind + parseInt( Earthdawn.getAttrBN( cID, sa.slice( 0, -9 ) + "Race", "0" ))
											+ parseInt( Earthdawn.getAttrBN( cID, sa.slice( 0, -9 ) + "Orig", "0" ))) / 3);
							silver += stepValue * stepValue * 10;
							iTime += stepValue;
							sTime = iTime + " days.";
							lp += fibonacci( lpBasis + 1 + ind ) * 100;
							break;
						case "Questor":
						case "ReadWrite":
						case "Speak":
						case "Rank":
						case "SP-Rank":
							lp += fibonacci( lpBasis + 1 + ind ) * 100;
							if( bCount === "S" ) {
								iTime += ind + 1;
								silver += (ind + 1) * (ind + 1) * 10;
								sTime = iTime + " weeks" + (( wrapper === "Rank") ? "." : " plus a month." );
							}
						}
					}
				}

				let sdate = today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate();
				let	stem = "&{template:chatrecord} {{header=" + getAttrByName( cID, "character_name" ) + ": " + header + "}}" 
							+ ( rankDiff < 0 ? "{{refund=Refund}}" : "") + "{{throalic=" + tdate + "}}";
				let slink = "{{button1=[Press here](!Earthdawn~ charID: " + cID;

				if ( miscval )
					stem += "{{misclabel=" + misclabel + "}}{{miscval=" + miscval + "}}";

				if ( lp ) {
					stem += "{{lp=" + lp + "}}";
					slink += "~ Record: " + sdate + ": ?{Throalic Date|" + tdate
							+ "}: LP: ?{Legend Points to post|" + lp + "}: " + ( rankDiff < 0 ? "Refund: " : "Spend: ");
				}
				if ( silver ) {
					stem += "{{sp=" + silver + "}}";
					slink += "~ Record: " + sdate + ": ?{Throalic Date|" + tdate
							+ "}: SP: ?{Silver to post|" + silver + "}: " + ( rankDiff < 0 ? "Refund: " : "Spend: ");
				}
				slink += "?{Reason|" + header + (miscval ? " "+ misclabel + " " + miscval : "") + "}";
				if ( sTime ) {
						stem += "{{time=" + sTime + "}}";
						slink += "?{Time| and " + sTime + "}";
				}

				if(( rankFrom > 3 || rankTo > 3 ) && (wrapper !== "Speak" && wrapper !== "ReadWrite"))
					bCount = undefined;
				if( bCount === undefined )
					sendChat( "API", getAttrByName( cID, "playerWho" ) + stem + Earthdawn.colonFix( slink ) + ")}}", null, {noarchive:true} );
				else {		// We need to count Talents or Skills to see if these are free during character creation or need to post a cost.
					let send = getAttrByName( cID, "playerWho" ) + stem + Earthdawn.colonFix( slink ) + ")}}",
						count = parseInt( rankTo ),			// Don't get the stored rank of what is being updated, use this one instead. 
						maxcount,
						rkey,
						typ,
						single;
					if( bCount === "T" ) {		// Count Talents.		Talents, most matrices, and stuff on spell tab
						maxcount = 8;
						single = [ "SP-Spellcasting-Rank", "SP-Patterncraft-Rank", "SP-Elementalism-Rank", "SP-Illusionism-Rank", 
									"SP-Nethermancy-Rank", "SP-Wizardry-Rank", "SP-Willforce-Rank" ];
						rkey = [ "_T_Rank", "_SPM_Rank" ];
						typ = [ "_Type", "_Origin" ];
					} else {		// Count skills
						maxcount = 14;
						single = [ "SKL_TotalS-ReadWrite", "SKL_TotalS-Speak" ];
						rkey = [ "_SK_Rank", "_SKK_Rank", "SKA_Rank" ];
						typ = [ "_Type", , ];
					}

					for ( let item in single ) { 
						if( single[ item ] === sa )
							continue;
						let a = Earthdawn.getAttrBN( cID, single[ item ], "0" );
						if( a )
							count += Math.min( parseInt( a ), 3);
						if( count > maxcount )		// We already know this is not character creation, so don't need to bother to keep counting.
							break;
					}

					if( count <= maxcount ) {		// If we need to bother to keep counting.
                                        // go through all attributes for this character and look for ones we are interested in
                        var attributes = findObjs({ _type: "attribute", _characterid: cID });
                        _.each( attributes, function (att) {
							if( att.get("name") === sa )		// If this is the one being changed, skip it.
								return;
							if( !att.get("name").endsWith( "_Rank" ))		// If it does not end in _Rank skip it.
								return;
							let fnd = false;
							for( let i = 0; i < rkey.length; ++i ) {
								if( att.get("name").slice( -rkey[ i ].length ) != rkey[ i ] )
									continue;
								if( typ [ i ] ) {
									let b = Earthdawn.getAttrBN( cID, att.get("name").slice(0, -5 ) + typ[ i ] );
									if( (!b && typ[i] == "_Origin") || b === "Free" || b === "Questor" || b === "Special" || b === "Item" || b === "Dummy" || b === "Other" )
										return;
								}
								count += Math.min( att.get( "current" ), 3);
							}
                        }); // End for each attribute.
					}

					if( count > maxcount )
						sendChat( "API", send, null, {noarchive:true} );
				}
			} // End recordWrap()




                        // When change is in a repeating section...
            if( sa.startsWith( "repeating_" )) {
				let cID = attr.get("_characterid"),
					code = Earthdawn.repeatSection( 3, sa ),
					rowID = Earthdawn.repeatSection( 2, sa );
				if( sa.endsWith( "_Name" ) || (sa.endsWith( "_Rank") && !sa.endsWith( "_Effective-Rank" ))) {		// If a name or rank has changed, make sure we have saved the rowID.
					let aobj = Earthdawn.findOrMakeObj({ _type: "attribute", _characterid: cID, name: Earthdawn.buildPre( code, rowID ) + "RowID" });
					aobj.setWithWorker( "current", rowID );

					if(sa.endsWith( "_Rank" ))		// If a rank has changed, send chat message asking if want to pay LP for it. 
						recordWrap( "Rank" );

					if( code === "T" || code === "SK" || code === "NAC" || code === "WPN" )
						Earthdawn.SetDefaultAttribute( cID, Earthdawn.buildPre( code, rowID ) + "CombatSlot", 0 );
				}		// End it was a name or rank.

				if ( sa.endsWith( "_CombatSlot") || sa.endsWith( "_Name") && (code === "T" || code === "NAC" || code === "SK" || code === "WPN" )) {
										// No matter what, Remove the token action associated with the old name. 
					let nmo, nmn, symbol;
					if( code === "WPN" ) 		symbol = Earthdawn.Constants.SymbolWeapon;
					else if( code === "NAC" ) 	symbol = Earthdawn.Constants.SymbolKnack;
					else if( code === "SK" ) 	symbol = Earthdawn.Constants.SymbolSkill;
					else 											symbol = Earthdawn.Constants.SymbolTalent;
					if( sa.endsWith( "_Name" )) {		// Name has changed, get the old name. 
						nmo = prev ? prev[ "current" ] : undefined;
						nmn = attr.get( "current" );
					} else			// Combat slot as changed, so look up name.
						nmo = nmn = Earthdawn.getAttrBN( cID, Earthdawn.buildPre( code, rowID ) + "Name", "" );
					if( nmo )
						Earthdawn.abilityRemove( cID, symbol + nmo );
										// Only create new one if new supposed to. 
					let cbs;
					if( sa.endsWith( "_CombatSlot" ))
						cbs = attr.get( "current" ) == "1";
					else
						cbs = Earthdawn.getAttrBN( cID, Earthdawn.buildPre( code, rowID ) + "CombatSlot", "0" ) == "1";
                    if( cbs )
						Earthdawn.abilityAdd( cID, symbol + nmn, "!edToken~ %{selected|" + Earthdawn.buildPre( code, rowID ) + "Roll}" );        
				} // End Token Action maint.
				else if( sa.endsWith( "_SP_Circle" ))
						recordWrap( "SP_Circle" );
				else if( sa.endsWith( "_NAC_Requirements" ))
						recordWrap( "NAC_Requirements" );
				else if( sa.endsWith( "_DSP_Circle") && sa.startsWith( "repeating_discipline")) {
					if( Earthdawn.getAttrBN( cID, sa.slice( 0, -7) + "_DSP_Code", "0.0" ) === "99.0" )
						recordWrap( "Questor" );
					else
						recordWrap( "DSP_Circle" );
				} else if( sa.endsWith( "_T_Special" )) {
					if( attr.get("current") === "CorruptKarma" )
						Earthdawn.abilityAdd( cID, "Corrupt Karma", "!edToken~ SetToken: @{target|to have Karma Corrupted|token_id}~ Misc: CorruptKarma: ?{How many karma to corrupt|1}");					
					else 
						Earthdawn.abilityRemove( cID, "Corrupt Karma");
				}
			}	// End start with "repeating"
            else if( sa.startsWith( "Attrib-" ) && sa.endsWith( "-Increases" ))
				recordWrap( "Increases" );
			else if (sa === "Questor" ) {
				let cID = attr.get("_characterid");
				if( attr.get( "current" ) === "None" ) {
					Earthdawn.abilityRemove( cID, "DP Roll" );
					Earthdawn.abilityRemove( cID, "DP" );
				} else {
					Earthdawn.abilityAdd( cID, "DP Roll", "!edToken~ %{selected|DevotionOnly}" );
					Earthdawn.abilityAdd( cID, "DP", "!edToken~ !Earthdawn~ ForEach ~ marker: devpnt :t" );
				}
			} else if( sa.startsWith( "SP-" ) && sa.endsWith( "-Rank" )) {
				switch( sa ) {
				case "SP-Spellcasting-Rank":
				case "SP-Patterncraft-Rank":
				case "SP-Elementalism-Rank":
				case "SP-Illusionism-Rank":
				case "SP-Nethermancy-Rank":
				case "SP-Wizardry-Rank":
				case "SP-Willforce-Rank":
					recordWrap( "SP-Rank" );
				}
			}



            switch( sa ) {
            case "Karma-Roll":			// Changes made at the character sheet, affect all tokens, whether character or mook.  Update all tokens. 
            case "Devotion-Roll":
            case "SP-Willforce-Use":
            case "combatOption-AggressiveAttack":
            case "combatOption-DefensiveStance":
            case "combatOption-CalledShot":
            case "combatOption-SplitMovement":
            case "combatOption-TailAttack":
            case "combatOption-Reserved":
            case "condition-Blindsided":
            case "condition-Cover":
            case "condition-Harried":
            case "condition-KnockedDown":
            case "condition-RangeLong":
            case "condition-ImpairedMovement":
            case "condition-Surprised":
			case "Creature-Ambushing":
			case "Creature-DivingCharging":
            case "condition-Darkness":
            case "condition-Health": {
                let ED = new Earthdawn.EDclass();
                let edParse = new ED.ParseObj( ED );
                edParse.GetStatusMarkerCollection();
                let mi = _.find( edParse.StatusMarkerCollection, function(mio){ return mio["attrib"] == sa; });
                if( mi === undefined )
                    break;
                let sm = mi["submenu"];
				let code = mi["code"].trim(),
					op;
				if( sm === undefined )			// There is no submenu, so just set the marker to match the value.  value 0 unset, value 1 set.
					op = (( attr.get("current") === "0" ) ? "u" : "s");
				else {
					let i = sm.indexOf( "[" + attr.get("current") + "^" );
					if ( i != -1) {				// There is a [n^a] structure. 
						op = sm.charAt( sm.indexOf( "^", i) + 1);
					} else					// The submenu has no [n^a] structure, so just send the value with a z in front of it.
						op = "z" + attr.get("current");
				} 
				if( "a" <= op && op <= "j" )
					op = (op.charCodeAt( 0 ) - 96).toString();
								
				edParse.charID = attr.get("_characterid");
                let tkns = findObjs({ _type: "graphic",  _subtype: "token", represents: edParse.charID });
                    _.each( tkns, function (TokObj) {
						edParse.tokenInfo = { type: "token", tokenObj: TokObj }	
						edParse.MarkerSet( [ "marker", code, op] );
                    }) // End ForEach Token 
			}   break;
            case "NPC": {
                let cID = attr.get("_characterid");
                if( attr.get("current") != "0")			// NPC or Mook.
                    Earthdawn.abilityAdd( cID, "Attack", "!edToken~ %{selected|Attack-R}");
                else		// PC
                    Earthdawn.abilityRemove( cID, "Attack" );
            }	break;
			case "SP-WillforceShow":
                let ED = new Earthdawn.EDclass();
                let edParse = new ED.ParseObj( ED );
                edParse.charID = attr.get("_characterid");
                edParse.TokenActionToggle("willforce", attr.get("current") === "1" );
                break;
            case "SKL_TotalS-Speak":
				recordWrap( "Speak" );
				break;
            case "SKL_TotalS-ReadWrite":
				recordWrap( "ReadWrite" );
				break;
			case "Hide-Spells-Tab":	{	// If we are hiding the spell pages, also remove the spell token actions. 
                let cID = attr.get("_characterid");
                if( attr.get("current") == "1") {       // Checkbox is being turned on
					Earthdawn.abilityRemove( cID, Earthdawn.Constants.SymbolSpell + "​Grimoire" );
					Earthdawn.abilityRemove( cID, Earthdawn.Constants.SymbolSpell + "Spells" );
                } else {    	// Checkbox is being turned off
                    Earthdawn.abilityAdd( cID, Earthdawn.Constants.SymbolSpell + "Grimoire",  "!edToken~ ChatMenu: Grimoire");
                    Earthdawn.abilityAdd( cID, Earthdawn.Constants.SymbolSpell + "Spells",  "!edToken~ ChatMenu: Spells");
				}
			} 	break;
            }
 
        } catch(err) {
            log( "attribute() error caught: " + err );
        }   // end catch
    }   // End Attribute()



    on("add:attribute", function (attr) {
        'use strict';
        attribute( attr);
    });

                // change attribute. See if it needs some special processing. 
    on("change:attribute", function (attr, prev) {
        'use strict';
        attribute( attr, prev);
    }); // end  on("change:attribute"



                // change token damage. See if it needs some special processing. 
    on("change:graphic:bar3_value", function (attr, prev) {
        'use strict';
		if( attr.get("_subtype") !== "token")
			return;
		let rep = attr.get("represents")
		if( !rep ) 	return;

		function health( dmg ) {
			if( dmg < getAttrByName( rep, "Damage", "max" ))
				return "u";		// Set OK.
			else if( dmg < getAttrByName( rep, "Damage-Death-Rating" ))
				return "s";		// Set unconscious
			else
				return "a";	// Set to special value dead.
		}

		let whatcurr = health( attr.get("bar3_value"));
		if( !prev || (whatcurr !== health( prev[ "bar3_value" ]))) {		// Something changed.
			let ED = new Earthdawn.EDclass();
			let edParse = new ED.ParseObj( ED );
			edParse.charID = rep;
			edParse.tokenInfo = { type: "token", tokenObj: attr }	
			edParse.MarkerSet( [ "marker", "health", whatcurr] );
		}
    }); // end  on("change:graphic:bar3_value"


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
        }

                // edsdr - Earthdawn Step Dice Roller 
        else if( msg.content.startsWith( "!edsdr" )) {
            let ED = new Earthdawn.EDclass( msg );
            if ( ED.msgArray.length > 1 )
                ED.StepDiceRoller();
        }

                // edInit - Earthdawn Initiative
                // Rolls individual initiatives for all selected tokens
        else if( msg.content.startsWith( "!edInit" )) {
            let ED = new Earthdawn.EDclass( msg );
            if ( ED.msgArray.length > 1 )
                ED.Initiative();
        }
    }    // End if msgtype is api

// ToDo CDD

//
// Routines that need work.
// GetTokenValue:


});    // End ON Chat:message.


