// Name:          HeroTracker, version 1.0
// Author:        Darren
// Last Updated:  4/18/2018
//
// Purpse:
//
//   HeroTracker implements the turn sequence of the Hero Games system.  The Hero Games system
//   utilizes a segment chart with 12 'phases'.  A character's speed determines how many and on
//   which phases he/she gets to act.  HeroTracker will add a token to the Roll20 tracker
//   multiple times to simulate this mechanic.
//
//
// Usage:
//
//   !herotracker <parms>
//
// Parameters:
//
//   --help
//   --add
//   --remove
//   --id <token_id>
//   --tag <label>
//   --speed <number>
//   --dex <number>
//   --segment <number>
//   --speed_field <name>
//   --dex_field <name>
//   --back

var HeroTracker = HeroTracker || {

    TURN: [
	//segment 0  1  2  3  4  5  6  7  8  9 10 11 12    speed 
			[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  //  0
			[ 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],  //  1
			[ 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],  //  2
			[ 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],  //  3
			[ 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],  //  4
			[ 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1],  //  5
			[ 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],  //  6
			[ 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1],  //  7
			[ 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1],  //  8
			[ 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],  //  9
			[ 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],  // 10
			[ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],  // 11
			[ 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], // 12

    write: function(s, who, style, from){
		if (who){
			who = "/w " + who.split(" ", 1)[0] + " ";
		}
		sendChat(from, who + s.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>"));
    },

    handleTrackerMessage: function(argv, msg){
		var gm;
		var pageid = Campaign().get("playerpageid");
		var who = msg.who;
		var token_id = "";
		var tokens;
		var add = 0;
		var remove = 0;
		var back = 0;
		var tag = "";
		var speed_field = "SPD";
		var dex_field = "DEX";
		var speed; // if undefined, get value from the token
		var dex;  // if undefined, get value from the token
		var segment;
		
		gm = playerIsGM(msg.playerid);
		
		// parse command parameters


        if (msg.selected) {
			tokens = _.reject(msg.selected, (o) => o._type !== 'graphic');
		}

//		tokens = msg.selected;
		msg = msg.content;

		argv.splice(0, 1);  // remove !HeroTracker
		
		if (argv.length == 0) { return HeroTracker.showTrackerHelp(who); }

		while (argv.length > 0) {

			switch (argv[0]){

			case "--id":
				if(argv.length<2) { return HeroTracker.write("--id parameter must be followed by a token_id", who, "", "HeroTracker" ); }
				token_id = argv[1];
				argv.splice(0, 2);
				break;

			case "--add":
				add = 1;
				argv.splice(0, 1);
				break;
				
			case "--remove":
				if(gm) {
					remove = 1;
				} else {
					return HeroTracker.write( "Only the GM can use the --remove parameter.", who, "", "HeroTracker" );
				}
				argv.splice(0, 1);
				break;

			case "--tag":
				if(argv.length<2) { return HeroTracker.write("--tag parameter must be followed by a string", who, "", "HeroTracker" ); }
				tag = argv[1];
				argv.splice(0, 2);
				break;
				
			case "--speed":
				if(argv.length<2) { return HeroTracker.write("--speed parameter must be followed by a number", who, "", "HeroTracker" ); }
				speed = argv[1];
				if(isNaN(parseInt(speed))) { return HeroTracker.write("speed was not a number", who, "", "HeroTracker" ); }
				argv.splice(0, 2);
				break;

			case "--dex":
				if(argv.length<2) { return HeroTracker.write("--dex parameter must be followed by a number", who, "", "HeroTracker" ); }
				dex = argv[1];
				if(isNaN(parseInt(dex))) { return HeroTracker.write("dex was not a number", who, "", "HeroTracker" ); }
				argv.splice(0, 2);
				break;

			case "--segment":
				if(argv.length<2) { return HeroTracker.write("--segment parameter must be followed by a number", who, "", "HeroTracker" ); }
				segment = argv[1];
				if(isNaN(parseInt(segment))) { return HeroTracker.write("segment was not a number", who, "", "HeroTracker" ); }
				argv.splice(0, 2);
				break;

			case "--back":
				back = 1;
				argv.splice(0, 1);
				break;

			case "--speed_field":
				if(argv.length<2) { return HeroTracker.write("--speed_field parameter requires an attribute name", who, "", "HeroTracker" ); }
				speed_field = argv[1];
				argv.splice(0, 2);
				break;

			case "--dex_field":
				if(argv.length<2) { return HeroTracker.write("--dex_field parameter requires an attribute name", who, "", "HeroTracker" ); }
				dex_field = argv[1];
				argv.splice(0, 2);
				break;

			case "--help":
				return HeroTracker.showTrackerHelp(who);
				break;

			default:
				return HeroTracker.write("unknown parameter", who, "", "HeroTracker" );
				break;
			}
			
		}
		
		// we have parsed all chat parameters
		

		// only the gm can to a 'back' action
		if( back == 1 && !gm ) {
			return HeroTracker.write("only a gm can do the 'back' action", who, "", "HeroTracker");
		}			
			
		// can't do more than one action: add, remove, back
		if( ( add + remove + back ) > 1  ) {
			return HeroTracker.write("can't do more than one action: 'add', 'remove', 'back'", who, "", "HeroTracker");
		}
		
		// must have a token or tag to add or remove or what are we even doing here?
		if( token_id == "" && tag == "" && ( tokens == undefined || tokens.length == 0 ) ) {
			return HeroTracker.write("nothing selected", who, "", "HeroTracker" );
		}

		// cannot specify both a token id and a tag
		if( token_id != "" && tag != "" ) {
			return HeroTracker.write("can't specify both a token id and a tag", who, "", "HeroTracker" );
		}
		
		// if we are doing an "add", we must have a speed or a segment.
		// if we have selected tokens, we can get the token's speed attribute.
		// but if we have no selected tokens, a speed or segment must have
		// been provided as part of the command parameters (--speed / --segment).
		if( add == 1 && (!speed) && (!segment) && ( tokens == undefined || tokens.length == 0 ) ) {
			return HeroTracker.write("no speed or segment specified", who, "", "HeroTracker" );
		}

		// cannot specify both a specified token id and a tag
		if( token_id != "" && tag != "" ) {
			return HeroTracker.write("can't specify both a token id and a tag", who, "", "HeroTracker" );
		}
		
		// cannot specify both a speed and a segment
		if( speed && segment ) {
			return HeroTracker.write("can't specify both a speed and a segment", who, "", "HeroTracker" );
		}
		
		// ok.  error checking done.
		
		if( add == 1 ) {
			if(!gm) sendChat("HeroTracker", "/w gm " + who + " add");

			Campaign().set("initiativepage", true);  // display initiative tracker
		
			if( ! tag == "" ) {
				// add custom tag to tracker
				HeroTracker.addToTracker("-1", (speed ? speed : 0), (dex ? dex : 0), segment, tag, who);
			} else if( ! token_id == "" ) {
				// add a token specified with the --id parameter
				var t; // individual token
				var c; // character_id
				var s; // speed attribute 
				var d; // dex attribute
				t = getObj('graphic', token_id);
				if( t ) {
					if( t.get('pageid') != pageid ) return HeroTracker.write("token is not on the player page", who, "", "HeroTracker")
					c = t.get("represents")
				}
				if( c ) {
					s = ( speed ? speed : getAttrByName(c, speed_field) );
					d = ( dex ? dex : getAttrByName(c, dex_field) );
					HeroTracker.removeFromTracker(token_id);
					HeroTracker.addToTracker(token_id, (s ? s : 0), (d ? d : 0), segment, tag, who);
				}
			} else {
				// add tokens based on current selection
				_.each(tokens, function(obj) {
					var t; // individual token
					var c; // character_id
					var s; // speed attribute 
					var d; // dex attribute

					t = getObj('graphic', obj._id);
					if( t ) {
						if( t.get('pageid') != pageid ) return HeroTracker.write("token is not on the player page", who, "", "HeroTracker")
						c = t.get("represents")
					}
					if( c ) {
						s = ( speed ? speed : getAttrByName(c, speed_field) );
						if(!s) return HeroTracker.write("could not find attribute: " + speed_field, who, "", "HeroTracker" );
						d = ( dex ? dex : getAttrByName(c, dex_field) );
						if(!d) return HeroTracker.write("could not find attribute: " + dex_field, who, "", "HeroTracker" );
						HeroTracker.removeFromTracker(obj._id);
						HeroTracker.addToTracker(obj._id, (s ? s : 0), (d ? d : 0), segment, tag, who);
					}
				});
			}
		}

		if( remove == 1 ) {
			if(!gm) sendChat("HeroTracker", "/w gm " + who + " remove");

			if( ! token_id == "" ) {
				// remove a token specified with the --id parameter
				HeroTracker.removeFromTracker(token_id);
			} else {
				// remove multiple tokens based on current selection
				_.each(tokens, function(obj) {
					HeroTracker.removeFromTracker(obj._id);
				});
			}
		}

		if( back == 1 ) {
			HeroTracker.backTrack(who);
		}

	},

    showTrackerHelp: function(who){
		if (who){ who = "/w " + who.split(" ", 1)[0] + " "; }

        sendChat( 'HeroTracker', who + ' ' +
			'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
				'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
					'HeroTracker'+
				'</div>'+
				'<div style="padding-left:10px;margin-bottom:3px;">'+
					'<p style="padding-top: 5px;">HeroTracker adds or removes tokens and labels to the initiative tracker.</p>'+
					'<p>You can select one or more tokens, specify a single token id (<b>--id</b>), or create a custom label (<b>--tag</b>).</p>'+
					'<p>If you select tokens, the speed and dex will be derived from the token itself, using the attributes <b>SPD</b> and <b>DEX</b> respectively.</p>'+
					'<p>If you specify a single token or create a custom label, you must provide a speed and optionally dex.</p>'+
					'<p style="padding-top: 5px; border-top: 1px solid #ccc;">To add tokens to the initiative tracker, select one or more tokens and then enter the chat command:</p>'+
					'<p><b>!ht --add</b></p>'+
					'<p style="padding-top: 5px; border-top: 1px solid #ccc;">To remove entries, select one or more tokens and enter the chat command: </p>'+
					'<p><b>!ht --remove</b></p>'+
					'<p style="padding-top: 5px; border-top: 1px solid #ccc;">Alternately, you can specify a single token by its ID rather than selecting it.  '+
					'For example, to add a specific token, selected or not, enter this chat command: </p>'+
					'<p><b>!ht --add --id -L9sBx-soK0CQzQYCiFA</b></p>'+
					'<p style="padding-top: 5px; border-top: 1px solid #ccc;">You can also add a static label to the tracker by entering this chat command: </p>'+
					'<p><b>!ht --tag GAS-EFFECT --speed 4</b></p>'+
					'<p style="padding-top: 5px; border-top: 1px solid #ccc;">When adding a token, the speed and dex will be automatically derived from the '+
					'token&apos;s attributes.  However, you can override this by specifying your own speed and dex: </p>'+
					'<p><b>!ht --add --speed 6 --dex 18</b></p>'+
					'<p style="padding-top: 5px; border-top: 1px solid #ccc;">You can add a token or label to just one segment by using this chat command:</p>'+
					'<p><b>!ht --add --tag POST --segment 13</b></p>'+
					'<p style="padding-top: 5px; border-top: 1px solid #ccc;">Because the tracker can end up with a great many entries, it would normally create '+
					'a cumbersome problem to cycle through the entire list should you accidentally move past a turn that isn&apos;t complete.  As such, HeroTracker '+
					'includes an option to rollback the tracker one turn: </p>'+
					'<p><b>!ht --back</b></p>'+
					'<p style="padding-top: 5px; border-top: 1px solid #ccc;">HeroTracker uses dex to break ties by appending a decimal value to the '+					
					'token&apos;s speed.  The value is just the dex subtracted from 100.  If you do not want to use this feature, you can specify a dex '+
					'of zero using this command:</p>'+
					'<p><b>!ht --add --dex 0</b></p>'+
					'<p style="padding-top: 5px; border-top: 1px solid #ccc;">By default, HeroTracker uses the character sheet fields <b>SPD</b> and <b>DEX</b> '+
					'to derive the speed and dex values.  You can override and choose your own field names using the parameters <b>--speed_field</b> and <b>--dex_field</b>.  '+
					'This can also be used for characters that use a different attribute to break ties, such as ego based characters.  The command would look like this:</p>'+
					'<p><b>!ht --add --dex_field EGO</b></p>'+
					'<p style="padding-top: 5px; border-top: 1px solid #ccc;">A custom label MUST have a speed specified.  It does not default to zero.</p>'+
					'<p style="padding-top: 5px; border-top: 1px solid #ccc;">HeroTracker does not sort the tracker.  Do that using the tracker&apos; own sort feature.</p>'+
					'<div style="padding-bottom: 10px; border-top: 1px solid #ccc;"/>'+
				'</div>'+
				'<p><b>Syntax</b></p>'+
				'<div style="padding-left:10px;">'+
					'<p><b>!herotracker</b> &lt;parms&gt;</p>' +
					'<p><b>!ht</b> &lt;parms&gt;</p>' +
					'<div style="padding-left: 10px;padding-right:20px">'+
						'<p>Parameters:</p>'+
						'<ul>'+
							'<li style="border-top: 1px solid #ccc;">'+
								'<b>--help</b>'+
							'</li> '+
							'<li style="border-top: 1px solid #ccc;">'+
								'<b>--add</b>'+
							'</li> '+
							'<li style="border-top: 1px solid #ccc;">'+
								'<b>--remove</b>'+
							'</li> '+
							'<li style="border-top: 1px solid #ccc;">'+
								'<b>--id</b> &lt;token_id&gt;'+
							'</li> '+
							'<li style="border-top: 1px solid #ccc;">'+
								'<b>--tag</b> &lt;label&gt;'+
							'</li> '+
							'<li style="border-top: 1px solid #ccc;">'+
								'<b>--speed</b> &lt;number&gt;'+
							'</li> '+
							'<li style="border-top: 1px solid #ccc;">'+
								'<b>--dex</b> &lt;number&gt;'+
							'</li> '+
							'<li style="border-top: 1px solid #ccc;">'+
								'<b>--segment</b> &lt;number&gt;'+
							'</li> '+
							'<li style="border-top: 1px solid #ccc;">'+
								'<b>--speed_field</b> &lt;name&gt;'+
							'</li> '+
							'<li style="border-top: 1px solid #ccc;">'+
								'<b>--dex_field</b> &lt;name&gt;'+
							'</li> '+
							'<li style="border-top: 1px solid #ccc;">'+
								'<b>--back</b>'+
							'</li> '+
						'</ul>'+
					'</div>'+
				'</div>'+
			'</div>'			
        );
    },
	
	addToTracker: function(token_id, speed, dex, segment, custom, who) {

        var turnorder;
        var tiebreaker = 0;

		/*
		HeroTracker.write("token_id: " + token_id, who, "", "HeroTracker" );
		HeroTracker.write("speed: " + speed, who, "", "HeroTracker" );
		HeroTracker.write("dex: " + dex, who, "", "HeroTracker" );
		HeroTracker.write("segment: " + segment, who, "", "HeroTracker" );
		HeroTracker.write("custom: " + custom, who, "", "HeroTracker" );
		*/

		if(speed) speed = parseInt(speed);
		if(dex) dex = parseInt(dex);
		
		// compute the tiebreaker value
		if (dex > 0) { tiebreaker = 1 - ( dex / 100 ); }
		
        if(Campaign().get("turnorder") == "") turnorder = []; //NOTE: We check to make sure that the turnorder isn't just an empty string first. If it is treat it like an empty array.
        else turnorder = JSON.parse(Campaign().get("turnorder"));

		if (token_id == "") { token_id = "-1"; }  // if no token id is present, set to -1 to use the custom arg
		
		// if a segment was provided, we skip speed and dex entirely
		if( segment ) {
			turnorder.push({
				id: token_id,
				pr: segment,
				custom: custom
			});
			Campaign().set("turnorder", JSON.stringify(turnorder));
			return;
		}

		// handle speeds greater than 12

		while (speed>12) {
			for (s=1;s<=12;s++) {
				turnorder.push({
					id: token_id,
					pr: Math.round( (s + tiebreaker + 0.00001) * 100 ) / 100,
					custom: custom
				});
				Campaign().set("turnorder", JSON.stringify(turnorder));
			}
			speed = speed - 12;
		}
				
		for (s=1;s<=12;s++) {
			if(HeroTracker.TURN[speed][s] == 1) {
				//Add a new custom entry to the end of the turn order.
				turnorder.push({
					id: token_id,

					pr: Math.round( (s + tiebreaker + 0.00001) * 100 ) / 100,
					custom: custom
				});
				Campaign().set("turnorder", JSON.stringify(turnorder));
			}
		}
    },

	removeFromTracker: function(token_id) {

        var turnorder;

        if(Campaign().get("turnorder") == "") return;
        else turnorder = JSON.parse(Campaign().get("turnorder"));
		
		for(i=0;i<turnorder.length;) {
			if(turnorder[i]['id'] == token_id) {
				turnorder.splice(i, 1);
			} else {
				i++;
			}
		};
		
		Campaign().set("turnorder", JSON.stringify(turnorder));
    },

	backTrack: function() {

        var turnorder;
		var turn;

        if(Campaign().get("turnorder") == "") return;
        else turnorder = JSON.parse(Campaign().get("turnorder"));

		turnorder.splice( 0, 0, turnorder.pop() );
		
		Campaign().set("turnorder", JSON.stringify(turnorder));
    },

	handleChatMessage: function(msg){
		if (msg.type != "api"){ return; }

		if ((msg.content == "!herotracker") || (msg.content.indexOf("!herotracker ") == 0) || (msg.content == "!ht") || (msg.content.indexOf("!ht ") == 0)){
			return HeroTracker.handleTrackerMessage(msg.content.split(" "), msg);
		}
    },

    registerHeroTracker: function(){
		// HeroTracker.initConfig();
		on("chat:message", HeroTracker.handleChatMessage);
    }

}

on("ready", function(){ HeroTracker.registerHeroTracker(); })