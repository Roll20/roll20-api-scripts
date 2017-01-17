function MythicGM(_odds, _chaos) {
	this.odds = _odds;
	this.chaos = _chaos;
	this.version = 1.0;
	this.lastUpdate = 1480514000;
}

MythicGM.prototype.FateChart = {
	"impossible":	{
						1: {"left": 0, "middle": -20, "right": 77},
						2: {"left": 0, "middle": 0, "right": 81},
						3: {"left": 0, "middle": 0, "right": 81},
						4: {"left": 1, "middle": 5, "right": 82},
						5: {"left": 1, "middle": 5, "right": 82},
						6: {"left": 2, "middle": 10, "right": 83},
						7: {"left": 3, "middle": 15, "right": 84},
						8: {"left": 5, "middle": 25, "right": 86},
						9: {"left": 10, "middle": 50, "right": 91},
					},
	"no way":		{
						1: {"left": 0, "middle": 0, "right": 81},
						2: {"left": 1, "middle": 5, "right": 82},
						3: {"left": 1, "middle": 5, "right": 82},
						4: {"left": 2, "middle": 10, "right": 83},
						5: {"left": 3, "middle": 15, "right": 84},
						6: {"left": 5, "middle": 25, "right": 86},
						7: {"left": 7, "middle": 35, "right": 88},
						8: {"left": 10, "middle": 50, "right": 91},
						9: {"left": 15, "middle": 75, "right": 96},
					},
	"very unlikely": {
						1: {"left": 1, "middle": 5, "right": 82},
						2: {"left": 1, "middle": 5, "right": 82},
						3: {"left": 2, "middle": 10, "right": 83},
						4: {"left": 3, "middle": 15, "right": 84},
						5: {"left": 5, "middle": 25, "right": 86},
						6: {"left": 9, "middle": 45, "right": 90},
						7: {"left": 10, "middle": 50, "right": 91},
						8: {"left": 13, "middle": 65, "right": 94},
						9: {"left": 16, "middle": 85, "right": 97},
					},
	"unlikely":		{
						1: {"left": 1, "middle": 5, "right": 82},
						2: {"left": 2, "middle": 10, "right": 83},
						3: {"left": 3, "middle": 15, "right": 84},
						4: {"left": 4, "middle": 20, "right": 85},
						5: {"left": 7, "middle": 35, "right": 88},
						6: {"left": 10, "middle": 50, "right": 91},
						7: {"left": 11, "middle": 55, "right": 92},
						8: {"left": 15, "middle": 75, "right": 96},
						9: {"left": 18, "middle": 90, "right": 99},
					},
	"50/50":		{
						1: {"left": 2, "middle": 10, "right": 83},
						2: {"left": 3, "middle": 15, "right": 84},
						3: {"left": 5, "middle": 25, "right": 86},
						4: {"left": 7, "middle": 35, "right": 88},
						5: {"left": 10, "middle": 50, "right": 91},
						6: {"left": 13, "middle": 65, "right": 94},
						7: {"left": 15, "middle": 75, "right": 96},
						8: {"left": 16, "middle": 85, "right": 97},
						9: {"left": 19, "middle": 95, "right": 100},
					},
	"somewhat likely":		{
						1: {"left": 4, "middle": 20, "right": 85},
						2: {"left": 5, "middle": 25, "right": 86},
						3: {"left": 9, "middle": 45, "right": 90},
						4: {"left": 10, "middle": 50, "right": 91},
						5: {"left": 13, "middle": 65, "right": 94},
						6: {"left": 16, "middle": 80, "right": 97},
						7: {"left": 16, "middle": 85, "right": 97},
						8: {"left": 18, "middle": 90, "right": 99},
						9: {"left": 19, "middle": 95, "right": 100},
					},
	"likely":		{
						1: {"left": 5, "middle": 25, "right": 86},
						2: {"left": 7, "middle": 35, "right": 88},
						3: {"left": 10, "middle": 50, "right": 91},
						4: {"left": 11, "middle": 55, "right": 92},
						5: {"left": 15, "middle": 75, "right": 96},
						6: {"left": 16, "middle": 85, "right": 97},
						7: {"left": 18, "middle": 90, "right": 99},
						8: {"left": 19, "middle": 95, "right": 100},
						9: {"left": 20, "middle": 100, "right": 0},
					},
	"very likely":	{
						1: {"left": 9, "middle": 45, "right": 90},
						2: {"left": 10, "middle": 50, "right": 91},
						3: {"left": 13, "middle": 65, "right": 94},
						4: {"left": 15, "middle": 75, "right": 96},
						5: {"left": 16, "middle": 85, "right": 97},
						6: {"left": 18, "middle": 90, "right": 99},
						7: {"left": 19, "middle": 95, "right": 100},
						8: {"left": 19, "middle": 95, "right": 100},
						9: {"left": 21, "middle": 105, "right": 0},
					},
	"near sure thing":	{
						1: {"left": 10, "middle": 50, "right": 91},
						2: {"left": 11, "middle": 55, "right": 92},
						3: {"left": 15, "middle": 75, "right": 96},
						4: {"left": 16, "middle": 80, "right": 97},
						5: {"left": 18, "middle": 90, "right": 99},
						6: {"left": 19, "middle": 95, "right": 100},
						7: {"left": 19, "middle": 95, "right": 100},
						8: {"left": 20, "middle": 100, "right": 0},
						9: {"left": 23, "middle": 115, "right": 0},
					},
	"a sure thing":	{
						1: {"left": 11, "middle": 55, "right": 92},
						2: {"left": 13, "middle": 65, "right": 94},
						3: {"left": 16, "middle": 80, "right": 97},
						4: {"left": 16, "middle": 85, "right": 97},
						5: {"left": 18, "middle": 90, "right": 99},
						6: {"left": 19, "middle": 95, "right": 100},
						7: {"left": 19, "middle": 95, "right": 100},
						8: {"left": 22, "middle": 110, "right": 0},
						9: {"left": 25, "middle": 125, "right": 0},
					},
	"has to be":	{
						1: {"left": 16, "middle": 80, "right": 97},
						2: {"left": 16, "middle": 85, "right": 97},
						3: {"left": 18, "middle": 90, "right": 99},
						4: {"left": 19, "middle": 95, "right": 100},
						5: {"left": 19, "middle": 95, "right": 100},
						6: {"left": 20, "middle": 100, "right": 0},
						7: {"left": 20, "middle": 100, "right": 0},
						8: {"left": 26, "middle": 130, "right": 0},
						9: {"left": 26, "middle": 145, "right": 0},
					}
};

MythicGM.prototype.ActionChart = ['Attainment','Starting','Neglect','Fight','Recruit','Triumph','Violate','Oppose','Malice','Communicate','Persecute','Increase',
'Decrease','Abandon','Gratify','Inquire','Antagonise','Move','Waste','Truce','Release','Befriend','Judge','Desert','Dominate',
'Procrastinate','Praise','Separate','Take','Break','Heal','Delay','Stop','Lie','Return','Immitate','Struggle','Inform','Bestow',
'Postpone','Expose','Haggle','Imprison','Release','Celebrate','Develop','Travel','Block','Harm','Debase','Overindulge','Adjourn',
'Adversity','Kill','Disrupt','Usurp','Create','Betray','Agree','Abuse','Oppress','Inspect','Ambush','Spy','Attach','Carry','Open',
'Carelessness','Ruin','Extravagance','Trick','Arrive','Propose','Divide','Refuse','Mistrust','Deceive','Cruelty','Intolerance',
'Trust','Excitement','Activity','Assist','Care','Negligence','Passion','Work hard','Control','Attract','Failure','Pursue',
'Vengeance','Proceedings','Dispute','Punish','Guide','Transform','Overthrow','Oppress','Change'];

MythicGM.prototype.SubjectChart = ['Goals','Dreams','Environment','Outside','Inside','Reality','Allies','Enemies','Evil','Good','Emotions','Opposition',
'War','Peace','The innocent','Love','The spiritual','The intellectual','New ideas','Joy','Messages','Energy','Balance',
'Tension','Friendship','The physical','A project','Pleasures','Pain','Possessions','Benefits','Plans','Lies','Expectations',
'Legal matters','Bureaucracy','Business','A path','News','Exterior factors','Advice','A plot','Competition','Prison',
'Illness','Food','Attention','Success','Failure','Travel','Jealousy','Dispute','Home','Investment','Suffering','Wishes',
'Tactics','Stalemate','Randomness','Misfortune','Death','Disruption','Power','A burden','Intrigues','Fears','Ambush',
'Rumor','Wounds','Extravagance','A representative','Adversities','Opulence','Liberty','Military','The mundane','Trials',
'Masses','Vehicle','Art','Victory','Dispute','Riches','Status quo','Technology','Hope','Magic','Illusions','Portals',
'Danger','Weapons','Animals','Weather','Elements','Nature','The public','Leadership','Fame','Anger','Information'];

MythicGM.prototype.getFocus = function () {
	
	var roll = Math.floor(Math.random() * 100) + 1;
	
	if (roll >=1 && roll <=7) { return {Roll: roll, Answer: "Remote event"};}
	else if (roll >=8 && roll <=28) { return {Roll: roll, Answer: "NPC action"};}
	else if (roll >=29 && roll <=35) { return {Roll: roll, Answer: "Introduce a new NPC"};}
	else if (roll >=36 && roll <=45) { return {Roll: roll, Answer: "Move toward a thread"};}
	else if (roll >=46 && roll <=52) { return {Roll: roll, Answer: "Move away from a thread"};}
	else if (roll >=53 && roll <=55) { return {Roll: roll, Answer: "Close a thread"};}
	else if (roll >=56 && roll <=67) { return {Roll: roll, Answer: "PC negative"};}
	else if (roll >=68 && roll <=75) { return {Roll: roll, Answer: "PC positive"};}
	else if (roll >=76 && roll <=83) { return {Roll: roll, Answer: "Ambiguous event"};}
	else if (roll >=84 && roll <=92) { return {Roll: roll, Answer: "NPC negative"};}
	else if (roll >=93 && roll <=100) { return {Roll: roll, Answer: "NPC positive"}; }
	else  { return {Roll: -1, Answer: "Unknown"}; }
}

MythicGM.prototype.getAction = function () {
	
	var roll = Math.floor(Math.random() * 100) + 1;
	
	return {Roll: roll, Answer: this.ActionChart[roll]};
}

MythicGM.prototype.getSubject = function () {
	
	var roll = Math.floor(Math.random() * 100) + 1;
	
	return {Roll: roll, Answer: this.SubjectChart[roll]};
}

MythicGM.prototype.GM = function () {
	var response = {
		eventTriggered : false,
		GM : {
					Roll: 0,
					Answer: "N/A"
				},
		EventData:  {
			Focus: null,
			Action: null,
			Subject: null
		}
	};
	
	response.GM.Roll = Math.floor(Math.random() * 100) + 1;
	//response.GM.Roll = 55;
	
	var values = this.FateChart[this.odds][this.chaos];

	for (i=this.chaos;i>0;i--) {
		if (i*11 == response.GM.Roll) 
			response.eventTriggered = true;
	}
	
	if (response.GM.Roll <= values.middle) {
		if (response.GM.Roll <= values.left) {
			response.GM.Answer = "Exceptional Yes";
		}
		else  {
			response.GM.Answer = "Yes";
		}
	}
	else if (response.GM.Roll > values.middle) {
		if (response.GM.Roll < values.right) {
			response.GM.Answer = "No";
		}
		else  {
			response.GM.Answer = "Exceptional No";
		}
	}
	
	if (response.eventTriggered) {
		response.EventData.Focus = this.getFocus();
		response.EventData.Action = this.getAction();
		response.EventData.Subject = this.getSubject();
	}
	
	return response;
}

var MyGM = MyGM || (function() {
    var version = 1.0, 
    lastUpdate = 1480514000,
    responseHeader = '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                            '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
                                '-=> MythicGM v'+version+' <=-' +
                            '</div>';
    
    checkInstall = function() {
        log('-=> MythicGM Emulator v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
    },
    
    ch = function (c) {
		var entities = {
			'<' : 'lt',
			'>' : 'gt',
			"'" : '#39',
			'@' : '#64',
			'{' : '#123',
			'|' : '#124',
			'}' : '#125',
			'[' : '#91',
			']' : '#93',
			'"' : 'quot',
			'-' : 'mdash',
			' ' : 'nbsp'
		};

		if(_.has(entities,c) ){
			return ('&'+entities[c]+';');
		}
		return '';
	},
    
    sendHelp = function () {
        sendChat('MythicGM', 
        responseHeader +
            '<div style="padding-left:10px;margin-bottom:3px;">'+
                '<p><b>NOTE: This provides the Game Master Emulation found in Mythic. It is Highly recommend that to fully understand this emulation you go and get a copy of the Mythic Game Master Emulator rule book.</b></p>'+
                '<p>Most Role-Playing Games operate under the principle that there are players and there is a Game Master. The GM prepares all the details of an adventure, and then "runs" the players through that adventure. This usually requires a great deal of preparation on the part of the GM.</p>'+
    			'<p>Mythic is different in that it requires no preparation from the GM. Mythic adventures are meant to be played off the cuff, with perhaps a few minutes of brainstorming to come up with the initial setup. Mythic can also be played entirely without a GM. The same mechanics in Mythic that allow a GM to run an adventure without preparation also allows a group of players to do without the GM.</p>'+
    			'<p>In a Mythic adventure, the GM (or players without a GM) can start an evening\'s entertainment with about five minutes of preparation. As the adventure unfolds, the GM is just as surprised by the twists and turns as the players are.</p>'+
    		'</div>'+
    		'<b>Commands</b>'+
    		'<div style="padding-left:10px;">'+
                '<b><span style="font-family: serif;">!MythicGM '+ch('[')+ch('<')+'Odds'+ch('>')+' '+ch('<')+'Chaos Factor'+ch('>')+' '+ch('[')+ch('<')+'Your Question'+ch('>')+ch(']')+ch(']')+'</span></b>'+
    			'<div style="padding-left: 10px;padding-right:20px">'+
    				'<p>By running the command with the arguments of Odds, Chaos Factor, and your question. The emulator with give you a response of Exceptional No, No, Yes, Exceptional Yes. As well generate random events.</p>'+
    				'<p><b>Note:</b> by supplying no arguments you get this message</p>' +
    				'<ul>'+
    					'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
    						'<b><span style="font-family: serif;">'+ch('<')+'Odds'+ch('>')+'</span></b> '+ch('-')+' are the likly odds of your question. The odds are the following:'+
    						'<ul>'+
    							'<li>Impossible</li>'+
    							'<li>No Way</li>'+
    							'<li>Very Unlikely</li>'+
    							'<li>Unlikely</li>'+
    							'<li>50'+ch('/')+'50</li>'+
    							'<li>Somewhat Likely</li>'+
    							'<li>Likely</li>'+
    							'<li>Very Likely</li>'+
    							'<li>Near Sure Thing</li>'+
    							'<li>A Sure Thing</li>'+
    							'<li>Has To Be</li>'+
    						'</ul> '+
    						'<p><b>Note:</b> this value is not case sensitive.</p>' +
    					'</li> '+
    					'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
    						'<b><span style="font-family: serif;">'+ch('<')+'Chaos Factor'+ch('>')+'</span></b> '+ch('-')+' A chaos factor ranging from 1 to 9. The higher the number, the more likely a “yes” answer is and more unexpected events occur.'+
    					'</li> '+
    					'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
    						'<b><span style="font-family: serif;">'+ch('<')+'Your Question'+ch('>')+'</span></b> '+ch('-')+' It\'s the question you would ask your normal GM like "Is that chest Trapped?" or "Is that NPC Hostile?". You can asked any question. '+
    					'</li> '+
    				'</ul> '+
    			'</div>' +
    		'</div>' +
    		'<div style="padding-left:10px;">'+
                '<b><span style="font-family: serif;">!MythicEvent</span></b>'+
    			'<div style="padding-left: 10px;padding-right:20px">'+
    				'<p>By running the command it will generate a random event.</p>'+
    			'</div>' +
    		'</div>' +
    		'<div style="padding-left:10px;">'+
                '<b><span style="font-family: serif;">!MythicFocus</span></b>'+
    			'<div style="padding-left: 10px;padding-right:20px">'+
    				'<p>By running the command it will generate a random event focus.</p>'+
    			'</div>' +
    		'</div>' +
    		'<div style="padding-left:10px;">'+
                '<b><span style="font-family: serif;">!MythicAction</span></b>'+
    			'<div style="padding-left: 10px;padding-right:20px">'+
    				'<p>By running the command it will generate a random event action.</p>'+
    			'</div>' +
    		'</div>' +
    		'<div style="padding-left:10px;">'+
                '<b><span style="font-family: serif;">!MythicSubject</span></b>'+
    			'<div style="padding-left: 10px;padding-right:20px">'+
    				'<p>By running the command it will generate a random event subject.</p>'+
    			'</div>' +
    		'</div>' +
		'</div>');
    },
    
    handleInput = function(msg) {
        var who;
        var re = /(impossible|no way|very unlikely|unlikely|50\/50|somewhat likely|likely|very likely|near sure thing|a sure thing|has to be)\s(\d+)/;
		
        if (msg.type !== "api") {
            return;
        }
        
		who = getObj('player',msg.playerid).get('_displayname');
		
		if (msg.content.toLowerCase().startsWith("!mythicgm ")) {
		    var cmd = msg.content.toLowerCase().replace('!mythicgm ','').trim().toLowerCase();
		    var found = re.exec(cmd);
		    
		    if (found) {
    			var odds = found[1];
    			var chaos = found[2];
    			var question = cmd.replace(odds,'').replace(chaos,'').trim();
    			
    			if (chaos <= 0 || chaos > 9) { sendHelp(); return; }
    
    			var mGM = new MythicGM(odds, chaos);
    			var results = mGM.GM();
    			var response = responseHeader;
    			
    			if (question.length > 0) {
    			    response = response + 
    			    '<div style="padding-left:10px;">'+
                        '<b><span style="font-family: serif;">'+who+' Asked:</span></b>'+
                        '<div style="padding-left: 10px;padding-right:20px">'+
			                question +
                        '</div>'+
                    '</div>';
    			}
    			
			    response = response + 
			    '<div style="padding-left:10px;">'+
                    '<b><span style="font-family: serif;">Anwser:</span></b>'+
                    '<div style="padding-left: 10px;padding-right:20px">'+
		                results.GM.Answer +
                    '</div>'+
                '</div>';
    			
    			

				if (results.eventTriggered) {
    			    response = response + 
                    '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
                        'Random Event Triggered!' +
                    '</div>' +
    			    '<div style="padding-left:10px;">'+
                        '<b><span style="font-family: serif;">Focus:</span></b>'+
                        '<div style="padding-left: 10px;padding-right:20px">'+
    		                results.EventData.Focus.Answer +
                        '</div>'+
                    '</div>' +
    			    '<div style="padding-left:10px;">'+
                        '<b><span style="font-family: serif;">Action:</span></b>'+
                        '<div style="padding-left: 10px;padding-right:20px">'+
    		                results.EventData.Action.Answer +
                        '</div>'+
                    '</div>' +
    			    '<div style="padding-left:10px;">'+
                        '<b><span style="font-family: serif;">Subject:</span></b>'+
                        '<div style="padding-left: 10px;padding-right:20px">'+
    		                results.EventData.Subject.Answer +
                        '</div>'+
                    '</div>';
				}
				response = response + "</div>";
				
				sendChat('MythicGM', response);
				
		    } else {
		        sendHelp();
		    }
		}
		else if (msg.content.toLowerCase() == "!mythicgm") {
		    sendHelp();
        }
        else if (msg.content.toLowerCase().startsWith("!mythicevent")) {
    		mGM = new MythicGM(1, 1);
    		Focus = mGM.getFocus();
    		Action = mGM.getAction();
    		Subject = mGM.getSubject();
    		
		    var response = responseHeader + 
                '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
                    'Your Mythic Event!' +
                '</div>' +
			    '<div style="padding-left:10px;">'+
                    '<b><span style="font-family: serif;">Focus:</span></b>'+
                    '<div style="padding-left: 10px;padding-right:20px">'+
		                Focus.Answer +
                    '</div>'+
                '</div>' +
			    '<div style="padding-left:10px;">'+
                    '<b><span style="font-family: serif;">Action:</span></b>'+
                    '<div style="padding-left: 10px;padding-right:20px">'+
		                Action.Answer +
                    '</div>'+
                '</div>' +
			    '<div style="padding-left:10px;">'+
                    '<b><span style="font-family: serif;">Subject:</span></b>'+
                    '<div style="padding-left: 10px;padding-right:20px">'+
		                Subject.Answer +
                    '</div>'+
                '</div>'
            '</div>';
            sendChat('MythicGM', response);
		
        }
        else if (msg.content.toLowerCase().startsWith("!mythicfocus")) {
    		mGM = new MythicGM(1, 1);
    		Focus = mGM.getFocus();
    		
		    var response = responseHeader + 
			    '<div style="padding-left:10px;">'+
                    '<b><span style="font-family: serif;">Focus:</span></b>'+
                    '<div style="padding-left: 10px;padding-right:20px">'+
		                Focus.Answer +
                    '</div>'+
                '</div>' +
            '</div>';
            sendChat('MythicGM', response);
        }
        else if (msg.content.toLowerCase().startsWith("!mythicaction")) {
    		mGM = new MythicGM(1, 1);
    		Action = mGM.getAction();
		    var response = responseHeader + 
			    '<div style="padding-left:10px;">'+
                    '<b><span style="font-family: serif;">Action:</span></b>'+
                    '<div style="padding-left: 10px;padding-right:20px">'+
		                Action.Answer +
                    '</div>'+
                '</div>' +
            '</div>';
            sendChat('MythicGM', response);
        }
        else if (msg.content.toLowerCase().startsWith("!mythicsubject")) {
    		mGM = new MythicGM(1, 1);
    		Subject = mGM.getSubject();
		    var response = responseHeader + 
			    '<div style="padding-left:10px;">'+
                    '<b><span style="font-family: serif;">Subject:</span></b>'+
                    '<div style="padding-left: 10px;padding-right:20px">'+
		                Subject.Answer +
                    '</div>'+
                '</div>'
            '</div>';
            sendChat('MythicGM', response);
        }
    },

    registerEventHandlers = function() {
        on('chat:message', handleInput);
    };
    
    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
}());

on('ready',function() {
    'use strict';

    MyGM.CheckInstall();
    MyGM.RegisterEventHandlers();
});