function processInlinerolls(msg) {
    if (_.has(msg, 'inlinerolls')) {
        return _.chain(msg.inlinerolls)
                .reduce(function(previous, current, index) {
                    previous['$[[' + index + ']]'] = current.results || 0;
                    return previous;
                },{})
                .reduce(function(previous, current, index) {
                    return previous.replace(index, current);
                }, msg.content)
                .value();
    } else {
        return msg.content;
    }
}

function Semaphore(callback, initial, context) {
    var args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));

    this.lock = parseInt(initial, 10) || 0;
    this.callback = callback;
    this.context = context || callback;
    this.args = args.slice(3);
}

Semaphore.prototype = {
    v: function() { this.lock++; },
    p: function() {
        var parameters;

        this.lock--;

        if (this.lock === 0 && this.callback) {
            // allow sem.p(arg1, arg2, ...) to override args passed to Semaphore constructor
            if (arguments.length > 0) { parameters = arguments; }
            else { parameters = this.args; }

            this.callback.apply(this.context, parameters);
        }
    }
};

function getSenderForName(name, options) {
    var character = findObjs({
            type: 'character',
            name: name
        }, options)[0],
        player = findObjs({
            type: 'player',
            displayname: name.lastIndexOf(' (GM)') === name.length - 5 ? name.substring(0, name.length - 5) : name
        }, options)[0];
    
    if (player) {
        return 'player|' + player.id;
    }
    if (character) {
        return 'character|' + character.id;
    }
    return name;
}

var ABFRoll = ABFRoll || (function() {
    'use strict';
    
    var who;
    
    var rollType = "";
    var template = "";
    var name = "";
    var subname = "";
    
    var arrayCrit = [];
    var upperCrit = 90;
    var lowerFumble = 3;
    
    var firstResult = 0;
    var bonus = 0;
    
    var critique = false;
    var fumble = false;
    var noCrit = false;;
    var mastery = false;
    
    var detailDice = "";
    var numberDice = 1;
    var double = 0;
    var total = 0;
    var modFumble = 0;
    
    var arrayAttack = [];
    var arrayBlock = [];
    var arrayDodge = [];
    var arrayProjOff = [];
    var arrayProjDef = [];
    var arrayProj = [];
    
    var semChat = new Semaphore(function(lastAsync) 
	{
	    sendChat(who, rollType+'&{template:'+template+'} '+lastAsync);
	    
	    total = 0;
	    double = 0;
	    critique = false;
	    fumble = false;
	    bonus = 0;
	    numberDice = 1;
	    detailDice = "";
	    rollType = "";
	    name = "";
	    subname = "";
	    arrayCrit = [];
	    
	});
    
    var sem = new Semaphore(function(lastAsync) 
	{
	    var dice = Number(lastAsync);

	    if(critique == true)
	    {
	        numberDice += 1;
	        detailDice += "+"+dice;
	        total += dice;
	        
	        if(double > 0)
	        {
	            if(numberDice != 3)
	            {
    	            if(arrayCrit.indexOf(dice) == double)
                    {
                        sendChat('', "/roll 1d100", function(diceResult) 
            			{
            				sem.v();
            				var msgContent = JSON.parse(diceResult[0].content);
            				var	result = msgContent.total;
            				sem.p(result);
            			});
                    }
                    else
                    {
                        sendResult();
                    }
	            }
	            else if(numberDice == 3)
	            {
	                detailDice = "100";
	                total = 100;
	                
	                sendResult();
	            }
	        }
	        else
	        {
                if(dice >= upperCrit)
                {
                    if(upperCrit >= 100)
                        upperCrit = 100;
                    else
                        upperCrit += 1;
                    
                    
                    sendChat('', "/roll 1d100", function(diceResult) 
        			{
        				sem.v();
        				var msgContent = JSON.parse(diceResult[0].content);
        				var	result = msgContent.total;
        				sem.p(result);
        			});
                }
                else
                {
                    sendResult();
                }
	        }
	    }
	    else if(fumble == true)
	    {
	        if(mastery == true)
	        {
	            if(firstResult >= 2)
	                modFumble = 15;
	            else if(firstResult == 1)
	                modFumble = 0;
	        }
	        else
	        {
	            if(firstResult >= 3)
	                modFumble = 15;
	            else if(firstResult == 2)
	                modFumble = 0;
	            else if(firstResult == 1)
	                modFumble = -15;
	        }

	        total = modFumble-dice;
	        detailDice = dice;
	        
	        sendResult();
	    }
	});
    
    var inlineRolls = function(msg)
    {
        var index = -1;
		for(var i = 0;i < msg.inlinerolls.length;i++)
		{
			if(msg.inlinerolls[i].expression.match(/1d100[A-z0-9]+/) || msg.inlinerolls[i].expression.match(/0d100[A-z0-9]+/))
			{
				index = i;
			}
		}
		
		return index;
    };
    
    var turnOrder = function(tot)
    {
        var aName = "";
        var aName = name.toString();
        aName = aName.replace("{{name=", "");
        aName = aName.replace("}}", "");
        
    	var turnorder;
        if(Campaign().get("turnorder") == "") turnorder = []; //NOTE: We check to make sure that the turnorder isn't just an empty string first. If it is treat it like an empty array.
        else turnorder = JSON.parse(Campaign().get("turnorder"));
        
        var found = false;
        
		for(var i=0; i < turnorder.length; ++i)
		{
			if(aName === turnorder[i].custom)
			{
				turnorder[i].pr=tot;
				found=true;
				break;
			}
		}
		
		if(!found)
		{
			//Add a new custom entry to the end of the turn order.
            turnorder.push({
                id: "-1",
                pr: tot,
                custom: aName
            });
		}
        
        turnorder = _.sortBy(turnorder, (t) => -parseInt(t.pr));
						
		//If the initiative window is not displayed, open it.
		Campaign().set('initiativepage',true);
        
        Campaign().set("turnorder", JSON.stringify(turnorder));
    };
    
    var customCF = function(array)
    {
        var type;

        for(var i = 0;i < array.customCrit.length;i++)
		{
		    type = array.customCrit[i].comp;
		    
		    if(type == "==")
		    {
		        arrayCrit.push(array.customCrit[i].point);
		    }
		    if(type == ">=")
		    {
                upperCrit = array.customCrit[i].point;
		    }
		}
		
		for(var i = 0;i < array.customFumble.length;i++)
		{
		    type = array.customFumble[i].comp;
		    
		    if(type == "<=")
		    {
                lowerFumble = array.customFumble[i].point;
		    }
		}
		
    };
    
    var getMastery = function(msg)
    {
        var index = -1;
        var inCalc = "";
		for(var i = 0;i < msg.inlinerolls.length;i++)
		{
			if(msg.inlinerolls[i].expression.match(/[0-9]+\+[0-9]+\+[0-9]+\-[0-9]+/))
			{
				index = i;
				
			}
		}
		
		if(index != -1)
		{
		    inCalc = msg.inlinerolls[index].expression.split("-");
		    
		    if(inCalc[1] == "1")
		    {
		        mastery = true;
		    }
		}
    };
    
    var traitement = function()
    {
        var nResult = Number(firstResult);
        detailDice = firstResult;
    
        if(noCrit != true)
        {
            if(arrayCrit.indexOf(firstResult) != -1)
            {
                critique = true;
                double = arrayCrit.indexOf(firstResult);
            }
            else if(nResult >= upperCrit)
            {
                critique = true;
                upperCrit += 1;
            }
            else if(nResult <= lowerFumble)
                fumble = true;
            
            total = nResult;
            
            if(critique == true)
            {
                sendChat('', "/roll 1d100", function(diceResult) 
    			{
    				sem.v();
    				var msgContent = JSON.parse(diceResult[0].content);
    				var	result = msgContent.total;
    				sem.p(result);
    			});
            }
            else if(fumble == true)
            {
                sendChat('', "/roll 1d100", function(diceResult) 
    			{
    				sem.v();
    				var msgContent = JSON.parse(diceResult[0].content);
    				var	result = msgContent.total;
    				sem.p(result);
    			});
            }
            else
            {
                sendResult();
            }
        }
        else
        {
            sendResult();
        }
    };
    
    var sendResult = function()
    {
        var sendBonus = +bonus;
        var sendTotal = total+sendBonus;
        var spec = "";
        var aName = "";

        var aName = name.toString();
        aName = aName.replace("{{name=", "");
        aName = aName.replace("}}", "");
        
        if(critique == true)
            spec = 'style="color:green;"'
        else if(fumble == true)
            spec = 'style="color:red;"'
            
        if(subname == "{{subname=^{attack}}}")
        {
            var length = arrayAttack.length;
            arrayAttack.push("{{^{attack} ("+length+")=["+aName+"("+sendTotal+")](!ABFCompare;attack;"+aName+";"+sendTotal+";?{Opponent's result|0};?{AT/IP|0})}}");
        }
        else if(subname == "{{subname=^{block}}}")
        {
             var length = arrayBlock.length;
            arrayBlock.push("{{^{block} ("+length+")=["+aName+"("+sendTotal+")](!ABFCompare;block;"+aName+";"+sendTotal+";?{Opponent's result|0};?{AT/IP|0})}}");
        }
        else if(subname == "{{subname=^{dodge}}}")
        {
             var length = arrayDodge.length;
            arrayDodge.push("{{^{dodge} ("+length+")=["+aName+"("+sendTotal+")](!ABFCompare;dodge;"+aName+";"+sendTotal+";?{Opponent's result|0};?{AT/IP|0})}}");
        }
        else if(subname == "{{subname=^{magic-projection} (^{offensive})}}")
        {
             var length = arrayProjOff.length;
            arrayProjOff.push("{{^{magic-projection} (^{offensive}) ("+length+")=["+aName+"("+sendTotal+")](!ABFCompare;projoff;"+aName+";"+sendTotal+";?{Opponent's result|0};?{AT/IP|0})}}");
        }
        else if(subname == "{{subname=^{magic-projection} (^{defensive})}}")
        {
             var length = arrayProjDef.length;
            arrayProjDef.push("{{^{magic-projection} (^{defensive}) ("+length+")=["+aName+"("+sendTotal+")](!ABFCompare;projdef;"+aName+";"+sendTotal+";?{Opponent's result|0};?{AT/IP|0})}}");
        }
        else if(subname == "{{subname=^{psychic-projection}}}")
        {
             var length = arrayProj.length;
            arrayProj.push("{{^{psychic-projection} ("+length+")=["+aName+"("+sendTotal+")](!ABFCompare;proj;"+aName+";"+sendTotal+";?{Opponent's result|0};?{AT/IP|0};?{Attack or Defense ?|Attack,att|Defense,def})}}");
        }
        
        if(subname == "{{subname=^{initiative}}}")
		{
		    turnOrder(sendTotal);
		}
		
        if(noCrit != true)
        {
            if(fumble == true)
            {
                sendChat('', name+' '+subname+' {{result=<span class="inlinerollresult showtip tipsy-n-right" title="'+bonus+'-1D100('+detailDice+')+'+modFumble+'"><b '+spec+'>'+sendTotal+'</b></span>}}', function(R) 
        		{
        			semChat.v();
        			var msgContent = R[0].content;
        			semChat.p(msgContent);
        		});
            }
            else
            {
                sendChat('', name+' '+subname+' {{result=<span class="inlinerollresult showtip tipsy-n-right" title="1D100('+detailDice+')+'+bonus+'"><b '+spec+'>'+sendTotal+'</b></span>}}', function(R) 
        		{
        			semChat.v();
        			var msgContent = R[0].content;
        			semChat.p(msgContent);
        		});
            }
        }
        else
        {
            sendChat('', name+' '+subname+' {{result=<span class="inlinerollresult showtip tipsy-n-right" title="'+bonus+'"><b>'+sendTotal+'</b></span>}}', function(R) 
    		{
    			semChat.v();
    			var msgContent = R[0].content;
    			semChat.p(msgContent);
    		});
        }
    };
    
    var listen = function ()
	{
		on("chat:message", function (msg) {
            /* Exit if not an api command */
            if (msg.type != "api") return;
            
            var str = msg.content;
			
			if(str.startsWith("!ABFAPI") == true)
			{
			    who = getSenderForName(msg.who);
			    total = 0;
			    bonus = 0;

				str = str.replace("!ABFAPI", "");

				//TYPE DE JETS
				if(str.includes("/w gm ") == true || playerIsGM(msg.playerid))
				{
				    rollType = "/w gm ";
				    str = str.replace("/w gm ", "");
				}
				
				if(str.includes("Public Roll") == true)
				{
				    str = str.replace("Public Roll", "");
				}
				
				//NOM PERSONNAGE
				name = str.match(/{{name=[\-\'(){}^a-zA-Z0-9ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ_\s]+}}/);
				str = str.replace(/{{name=[\-\'(){}^a-zA-Z0-9ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ_\s]+}}/, "");
				
				//TEMPLATE
				template = msg.rolltemplate;
				
				//NOM JET
				subname = str.match(/{{subname=[\-\'(){}^a-zA-Z0-9ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ_\s]+}}/);
				str = str.replace(/{{subname=[\-\'(){}^a-zA-Z0-9ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ_\s]+}}/, "");
				
				//traitement du jet
				var roll = msg.inlinerolls[inlineRolls(msg)];

				customCF(roll.results.rolls[0].mods);
				
				//Maîtrise ?
				getMastery(msg);
				
				if(roll.results.rolls[0].dice > 0)
			        firstResult = roll.results.rolls[0].results[0].v;
			    else
			    {
			        firstResult = 0;
			        noCrit = true;
			    }
			    
			    var bonusToSplit = 0+roll.results.rolls[1].expr;
			
				var bonusSplit = bonusToSplit.split("+");
				
				for(var i = 0;i < bonusSplit.length;i++)
				{
				    bonus += Number(bonusSplit[i]);
				}
				//NETTOYAGE
				str = str.replace(/{{result=[${}^A-z0-9\s]+}}/, "");
				
				traitement();
			}
		
		    
		    if(str.startsWith("!ABFCompare") == true)
			{
			    str = processInlinerolls(msg);
			    
			    var split = str.split(";");
			    var type = split[1];
			    var compName = split[2];
			    var compTotal = Number(split[3]);
			    var opposed = Number(split[4]);
			    var IP = Number(split[5]);
			    var spec = split[6];
			    var absorption = 2*10;
			    
			    var marge = 0;
			    var degats = 0;
			    var dStr = "";
			    var contreA = 0;
			    var CAStr = "";
			    
			    switch(type)
			    {
			        case "attack":
			            marge = compTotal-opposed;
			            type = "^{attack}";
			        break;
			        
			        case "block":
			            marge = opposed-compTotal;
			            type = "^{block}";
			        break;
			        
			        case "dodge":
			            marge = opposed-compTotal;
			            type = "^{dodge}";
			        break;
			        
			        case "projoff":
			            marge = compTotal-opposed;
			            type = "^{magic-projection} (^{offensive})";
			        break;
			        
			        case "projdef":
			            marge = opposed-compTotal;
			            type = "^{magic-projection} (^{defensive})";
			        break;
			        
			        case "proj":
			            if(spec == "att")
			                marge = compTotal-opposed;
			            else if(spec == "def")
			                marge = opposed-compTotal;
			                
			            type = "^{psychic-projection}";
			        break;
			    }
			    
	            if(marge > 0)
	            {
	                degats = marge-absorption-(IP*10);
	                
	                degats = Math.floor(degats/10)*10;
	                
	                dStr = "{{dmg="+degats+"%}}";
	            }
			    else if(marge == 0)
			    {
			        
			    }
			    else if(marge < 0)
			    {
			        contreA = Math.floor((marge/2)/5)*5
			        contreA = contreA*-1;
			        
			        if(contreA > 150)
			            contreA = 150;
			            
			        CAStr = "{{contreA="+contreA+"}}"
			    }
			    var msgSend = "/w gm &{template:APICompare} {{name="+compName+"}} {{subtitle="+type+"}} {{marge="+marge+"}} {{IP="+IP+"}} "+dStr+" "+CAStr;

			    sendChat("System", msgSend);
			}
		
		    if(str.startsWith("!ABFList") == true)
			{
			    var list = "";
			    
			    list = arrayAttack.join(" ");
			    list = list+" "+arrayBlock.join(" ");
			    list = list+" "+arrayDodge.join(" ");
			    list = list+" "+arrayProjOff.join(" ");
			    list = list+" "+arrayProjDef.join(" ");
			    list = list+" "+arrayProj.join(" ");
			    
			    sendChat("System", "/w gm &{template:APIList} "+list);
			}
		    
		    if(str.startsWith("!ABFClean") == true)
			{
			    sendChat("System", "/w gm clean list");
			    
			    arrayAttack.splice(0,arrayAttack.length);
			    arrayBlock.splice(0,arrayBlock.length);
			    arrayDodge.splice(0,arrayDodge.length);
			    arrayProjOff.splice(0,arrayProjOff.length);
			    arrayProjDef.splice(0,arrayProjDef.length);
			    arrayProj.splice(0,arrayProj.length);
			}
		});
	};
	
	return {
        Listen: listen
    };
}());

on("ready", function() 
{
	ABFRoll.Listen();
});