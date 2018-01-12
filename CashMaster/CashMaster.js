/*

CASHMASTER

A currency management script for the D&D 5e OGL sheets on roll20.net.
Please use `!cmhelp` for inline help and examples.

arthurbauer@me.com

*/

on('ready', function () {
          'use strict';

		  var v="0.4.1";
		  
		  var usd=25; 
		  /* 
			Change this if you want to have a rough estimation of a character's wealth in USD. 
			Set it to something between 25 and 50 (25 USD per 1gp).	
			Set it to 0 to disable it completely.	  
		  */
		  
		  var scname="CashMaster";
      
		  log(scname+" v"+v+" online. Select one or more party members, then use `!cmhelp` ");
      
         on('chat:message', function(msg) {
          if (msg.type !== "api" && !playerIsGM(msg.playerid)) return;
          if (msg.content.startsWith("!cm")!== true) return;
             var partytotal = 0;
             var output = "/w gm &{template:desc} {{desc=<b>Party's cash overview</b><hr>";
             var partycounter = 0;
             var partymember = Object.entries(msg.selected).length;
          _.each(msg.selected, function(obj) {
              var token, character;
              token = getObj('graphic', obj._id);
              if (token) {
                  character = getObj('character', token.get('represents'));
              }
              if (character) {
	              partycounter++;
	              var name = getAttrByName(character.id, "character_name");
                  var pp = getattr(character.id, "pp")*1;
                  var gp = getattr(character.id, "gp")*1;                  
                  var ep = getattr(character.id, "ep")*1;                  
                  var sp = getattr(character.id, "sp")*1;
                  var cp = getattr(character.id, "cp")*1;
                  var total = Math.round((pp*10+gp+ep*0.5+cp/100+sp/10)*10000)/10000;
                  partytotal = total+partytotal;
                  output+= "<b>"+name+"</b><br>has ";
                  if (pp!=0) output+=pp+" platinum, ";
                  if (gp!=0) output+=gp+" gold, ";
                  if (ep!=0) output+=ep+" electrum, ";
                  if (sp!=0) output+=sp+" silver,  ";
                  if (cp!=0) output+=cp+" copper.";
                  
                  output+="<br>Converted, this character has ";
                  if (usd>0) output+="<span title='Equals roughly "+(Math.round((total*usd)/5)*5)+" USD'>";
                  output+=total+" gp";
                  if (usd>0) output+="</span>";
                  output+=" in total.<hr>";
              }
          });
          
          partytotal=Math.round(partytotal*100,0)/100;
          
          output+= "<b><u>Party total: "+partytotal+" gp</u></b>}}";
          sendChat (scname,output); 

          if (msg.content === "!cmhelp")

		  {
			sendChat (scname,"/w gm <h2>Usage</h2><p>First, select one or several party members.</p><p>Then use</p><ul><li><code>!cm</code> to get an <strong>overview</strong> over the party’s cash,</li><li><code>!cmshare</code> to <strong>share</strong> the money equally between party members, converting the amount into the best combination of gold, silver and copper (this should be used in smaller stores),</li><li><code>!cmconvert</code> to <strong>convert and share</strong> the money equally between party members, converting the amount into the best combination of platinum, gold, electrum, silver and copper (this should only be used in larger stores that have a fair amount of cash),</li><li><code>!cmadd [amount][currency]</code> to add/subtract an equal amount of money from each selected party member,</li><li><code>!cmhoard [amount][currency]</code> to share a certain amount of coins between the party members. Note that in this case, no conversion between the different coin types is made - if a party of 5 shares 4 pp, then 4 party members receive one pp each, and the last member won’t get anything.</li></ul><h3>Examples</h3><ol><li><code>!cm</code> will show a cash overview.</li><li><code>!cmshare</code> will collect all the money and share it evenly on the members, using gp, sp and cp only (pp and ep will be converted). Can also be used for one character to “exchange” money.</li><li><code>!cmconvert</code> - same as <code>!cmshare</code>, but will also use platinum and electrum.</li><li><code>!cmadd 50gp</code> will add 50 gp to every selected character.</li><li><code>!cmhoard 50gp</code> will (more or less evenly) distribute 50 gp among the party members.</li></ol><p><strong>Note:</strong> If you substract more coins than a character has, the coin value will become negative. Use <code>!cmshare</code> on that one character to balance the coins (see examples below).</p><h3>Advanced uses</h3><ol><li><strong>Changing multiple values at once:</strong> <code>!cmadd -1gp 10sp</code> will substract 1 gp and add 10 sp at the same time.</li><li><strong>Paying services:</strong> <code>!cmadd -6cp</code> will subtract 6cp from each selected party member. Use <code>!cmshare</code> or <code>!cmconvert</code> afterwards to balance the amount of coins (e.g. it will substract 1 sp and add 4 cp if the character didn’t have copper pieces before).</li></ol>");  
			  
		  }	
    
          if (msg.content === "!cmshare" || msg.content === "!cmconvert")
          {
              output="";
              var cashshare=partytotal/partycounter;
              var newcounter=0;
              var pps=Math.floor(cashshare/10);
              if (msg.content === "!cmshare") pps=0;
              var rest=cashshare-pps*10;
              var gps=Math.floor(rest);
              rest=(rest-gps)*2;
              var eps=Math.floor(rest);
              if (msg.content === "!cmshare") eps=0;
              rest=(rest-eps)*5;
              var sps=Math.floor(rest);
              rest=(rest-sps)*10;
              var cps=Math.round(rest);
              rest=(rest-cps)*partycounter;
              
              sendChat (scname,"/w gm &{template:desc} {{desc=<b>Let's share this!</b><hr>Everyone receives the equivalent of <b>"+cashshare+" gp:</b> "+pps+" platinum, "+gps+" gold, "+eps+" electrum, "+sps+" silver, and "+cps+" copper.}}");

              _.each(msg.selected, function(obj) {
              var token, character;
              newcounter++;
              token = getObj('graphic', obj._id);
              if (token) {
                  character = getObj('character', token.get('represents'));
              }
              if (character) {
                  setattr(character.id,"pp",pps);
                  setattr(character.id,"gp",gps);
                  setattr(character.id,"ep",eps);
                  setattr(character.id,"sp",sps);
                  // enough copper coins? If not, the last one in the group has to take the diff                  
                  if (rest>0.999 && newcounter==partycounter) cps=cps+Math.round(rest);
                  if (rest<-0.999 && newcounter==partycounter) cps=cps+Math.round(rest);
                  setattr(character.id,"cp",cps);
              }
              
      });
                      
      }

    
          if (msg.content.startsWith("!cmadd")== true)
          {
              
              var ppg=/([0-9 -]+)pp/;
              var ppa=ppg.exec(msg.content);

              var gpg=/([0-9 -]+)gp/;
              var gpa=gpg.exec(msg.content);

              var epg=/([0-9 -]+)ep/;
              var epa=epg.exec(msg.content);

              var spg=/([0-9 -]+)sp/;
              var spa=spg.exec(msg.content);

              var cpg=/([0-9 -]+)cp/;
              var cpa=cpg.exec(msg.content);

			  output="";

              _.each(msg.selected, function(obj) {
              var token, character;
              token = getObj('graphic', obj._id);
              if (token) {
                  character = getObj('character', token.get('represents'));
              }
              if (character) {
				  partycounter++;
	              var name = getAttrByName(character.id, "character_name");
	              var pp = getattr(character.id, "pp")*1;
	              var gp = getattr(character.id, "gp")*1;                  
	              var ep = getattr(character.id, "ep")*1;                  
	              var sp = getattr(character.id, "sp")*1;
	              var cp = getattr(character.id, "cp")*1;
	              var total = Math.round((pp*10+gp+ep*0.5+cp/100+sp/10)*10000)/10000;
	              partytotal = total+partytotal;
				  output+="<br><b>"+name+"</b>";
                  if (ppa) {setattr(character.id,"pp",parseInt(pp)+parseInt(ppa[1])); output+="<br> "+ppa[0];}
                  if (gpa) {setattr(character.id,"gp",parseInt(gp)+parseInt(gpa[1])); output+="<br> "+gpa[0];}
                  if (epa) {setattr(character.id,"ep",parseInt(ep)+parseInt(epa[1])); output+="<br> "+epa[0];}
                  if (spa) {setattr(character.id,"sp",parseInt(sp)+parseInt(spa[1])); output+="<br> "+spa[0];}
                  if (cpa) {setattr(character.id,"cp",parseInt(cp)+parseInt(cpa[1])); output+="<br> "+cpa[0];}
                  
                  
              }
              
		      });
              sendChat (scname,"/w gm &{template:desc} {{desc=<b>Cashing out - it's payday!</b><hr>"+output+"}}");
                      
      }
    
   
   
if (msg.content.startsWith("!cmhoard")== true)
          {
              
              var ppg=/([0-9 -]+)pp/;
              var ppa=ppg.exec(msg.content);

              var gpg=/([0-9 -]+)gp/;
              var gpa=gpg.exec(msg.content);

              var epg=/([0-9 -]+)ep/;
              var epa=epg.exec(msg.content);

              var spg=/([0-9 -]+)sp/;
              var spa=spg.exec(msg.content);

              var cpg=/([0-9 -]+)cp/;
              var cpa=cpg.exec(msg.content);

			  output="";
			  var partycounter = 0;
				  
			  _.each(msg.selected, function(obj) {
              var token, character;
              token = getObj('graphic', obj._id);
              if (token) {
                  character = getObj('character', token.get('represents'));
              }
              if (character) {
				  partycounter++;
	              var name = getAttrByName(character.id, "character_name");
	              var pp = getattr(character.id, "pp")*1;
	              var gp = getattr(character.id, "gp")*1;                  
	              var ep = getattr(character.id, "ep")*1;                  
	              var sp = getattr(character.id, "sp")*1;
	              var cp = getattr(character.id, "cp")*1;

				  if (ppa !== null) var ppt=cashsplit(ppa[1],partymember,partycounter);
				  if (gpa !== null) var gpt=cashsplit(gpa[1],partymember,partycounter);
				  if (epa !== null) var ept=cashsplit(epa[1],partymember,partycounter);
				  if (spa !== null) var spt=cashsplit(spa[1],partymember,partycounter);
				  if (cpa !== null) var cpt=cashsplit(cpa[1],partymember,partycounter);

				  output+="<br><b>"+name+"</b>";
                  if (ppa) {setattr(character.id,"pp",parseInt(pp)+parseInt(ppt)); output+="<br> "+ppt+"pp";}
                  if (gpa) {setattr(character.id,"gp",parseInt(gp)+parseInt(gpt)); output+="<br> "+gpt+"gp";}
                  if (epa) {setattr(character.id,"ep",parseInt(ep)+parseInt(ept)); output+="<br> "+ept+"ep";}
                  if (spa) {setattr(character.id,"sp",parseInt(sp)+parseInt(spt)); output+="<br> "+spt+"sp";}
                  if (cpa) {setattr(character.id,"cp",parseInt(cp)+parseInt(cpt)); output+="<br> "+cpt+"cp";}
              }
              
		      });
              sendChat (scname,"/w gm &{template:desc} {{desc=<b>You are splitting up the coins among you</b><hr>"+output+"}}");                      
      }        
    
    
});

});


function cashsplit(c,m,x)
{
var ct = 0;
var cr = 0;
if (c !== null)
	{
	ct = Math.floor(c / m);
	cr = c % m;
	if (cr >= x) ct++;
	else if (c<0 && cr<0 && -cr<x) ct++;
	}
return ct;
}

function getattr(cid,att)
{
let attr = findObjs({type:'attribute',characterid:cid,name:att})[0];
if(attr){
  let cur = attr.get('current'); // .get()
//  log(`${att}: ${cur}`);
  return cur;
} 	
}

function setattr(cid,att,val)
{
let attr = findObjs({type:'attribute',characterid:cid,name:att})[0];
if(attr){
 // log(`${att}: ${cur}->${val}`);
  attr.setWithWorker({current: parseInt(val)}); // .set()
} 	
}


