/*

CASHMASTER

A currency management script for the D&D 5e OGL sheets on roll20.net.
Please use `!cmhelp` for inline help and examples.

arthurbauer@me.com

*/

on('ready', function () {
          'use strict';

		  var v = "0.5"; 				// version number
		  var usd = 110;  				// conversion rate
		  
		  /* 
			Change this if you want to have a rough estimation of a character's wealth in USD. 
			After some research I believe a reasonable exchange ratio is roughly 1 gp = 110 USD	
			Set it to 0 to disable it completely.	  
		  */
		  
		  var scname = "CashMaster";		// script name
		  
		  log (globalconfig);
		  var selectedsheet="OGL";		  // You can set this to "5E-Shaped" if you're using the Shaped sheet 
		  
		  // detecting useroptions from one-click
		  if (globalconfig && globalconfig.cashmaster && globalconfig.cashmaster.useroptions) { selectedsheet = globalconfig.cashmaster.useroptions.selectedsheet;}
		  var rt="";
		  if (selectedsheet == "OGL") rt = ["desc","desc"];       	
		  else if (selectedsheet == "5E-Shaped") rt = ["5e-shaped","freetext"];
		   
		  log(scname+" v"+v+" online. Select one or more party members, then use `!cmhelp` ");
      

		  var pp,gp,ep,sp,cp,total,output,ppa,gpa,epa,spa,cpa,ppg,gpg,epg,spg,cpg,name,partycounter,tpken;

         on('chat:message', function(msg) {
          if (msg.type !== "api" && !playerIsGM(msg.playerid)) return;
          if (msg.content.startsWith("!cm")!== true) return;
		  if (msg.selected === null ){sendChat (scname,"/w gm **ERROR:** You need to select at least one character.");return;}
             var partytotal = 0;
             var output = "/w gm &{template:"+rt[0]+"} {{"+rt[1]+"=<b>Party's cash overview</b><hr>";
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
	              name = getAttrByName(character.id, "character_name");
                  pp = getattr(character.id, "pp")*1;
                  gp = getattr(character.id, "gp")*1;                  
                  ep = getattr(character.id, "ep")*1;                  
                  sp = getattr(character.id, "sp")*1;
                  cp = getattr(character.id, "cp")*1;
                  total = Math.round((pp*10+gp+ep*0.5+cp/100+sp/10)*10000)/10000;
                  partytotal = total+partytotal;
                  output+= "<b>"+name+"</b><br>has ";
                  if (pp!==0) output+=pp+" platinum, ";
                  if (gp!==0) output+=gp+" gold, ";
                  if (ep!==0) output+=ep+" electrum, ";
                  if (sp!==0) output+=sp+" silver,  ";
                  if (cp!==0) output+=cp+" copper.";
                  
                  output+="<br>Converted, this character has "+cm_usd(total)+" gp";
                  output+=" in total.<hr>";
              }
          });
          
          partytotal=Math.round(partytotal*100,0)/100;
          
          output+= "<b><u>Party total: "+cm_usd(partytotal)+" gp</u></b>}}";
          sendChat (scname,output); 

          if (msg.content === "!cmhelp")

		  {
			sendChat (scname,"/w gm <h2 id='setup'>Setup</h2><p>Make sure you use the correct sheet setting (<code>OGL</code> or <code>5E-Shaped</code>).</p><h2 id='usage'>Usage</h2><p>First, select one or several party members.</p><p>Then use</p><ul><li><code>!cm</code> to get an <strong>overview</strong> over the party’s cash,</li><li><code>!cmshare</code> to <strong>convert and share</strong> the money equally between party members, converting the amount into the best combination of gold, silver and copper (this should be used in smaller stores),</li><li><code>!cmconvert</code> to <strong>convert and share</strong> the money equally between party members, converting the amount into the best combination of platinum, gold, electrum, silver and copper (this should only be used in larger stores that have a fair amount of cash),</li><li><code>!cmadd [amount][currency]</code> to <strong>add</strong> an equal amount of money from each selected party member,</li><li><code>!cmhoard [amount][currency]</code> to <strong>share</strong> a certain amount of coins between the party members, like a found treasue. Note that in this case, no conversion between the different coin types is made - if a party of 5 shares 4 pp, then 4 party members receive one pp each, and the last member won’t get anything.</li><li><code>!cmpay [amount][currency]</code> to <strong>pay</strong> a certain amount of coins. The script will even try to take all higher and one lower coin type to get the full amount. E.g. to pay 1gp when the character has no gold, the script will use 1pp (and return 9gp), or it will take 2ep.</li></ul><p><strong>Note:</strong> You can add several coin values at once, e.g. <code>!cmhoard 50gp 150sp 2000cp</code></p><h3 id='examples'>Examples</h3><ol type='1'><li><code>!cm</code> will show a cash overview.</li><li><code>!cmshare</code> will collect all the money and share it evenly on the members, using gp, sp and cp only (pp and ep will be converted). Can also be used for one character to ‘exchange’ money.</li><li><code>!cmconvert</code> - same as <code>!cmshare</code>, but will also use platinum and electrum.</li><li><code>!cmadd 50gp</code> will add 50 gp to every selected character.</li><li><code>!cmhoard 50gp</code> will (more or less evenly) distribute 50 gp among the party members.</li><li><code>!cmpay 10gp</code> will subtract 10gp from each selected character. It will try to exchange the other coin types (e.g. it will use 1pp if the player doesn’t have 10gp).</li></ol>");  
			  
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
              
              sendChat (scname,"/w gm &{template:"+rt[0]+"} {{"+rt[1]+"=<b>Let's share this!</b><hr>Everyone receives the equivalent of "+cm_usd(cashshare)+" gp: "+pps+" platinum, "+gps+" gold, "+eps+" electrum, "+sps+" silver, and "+cps+" copper.}}");

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

    
          if (msg.content.startsWith("!cmadd") === true)
          {
              
              ppg=/([0-9 -]+)pp/;
              ppa=ppg.exec(msg.content);

              gpg=/([0-9 -]+)gp/;
              gpa=gpg.exec(msg.content);

              epg=/([0-9 -]+)ep/;
              epa=epg.exec(msg.content);

              spg=/([0-9 -]+)sp/;
              spa=spg.exec(msg.content);

              cpg=/([0-9 -]+)cp/;
              cpa=cpg.exec(msg.content);

			  output="";

              _.each(msg.selected, function(obj) {
              var token, character;
              token = getObj('graphic', obj._id);
              if (token) {
                  character = getObj('character', token.get('represents'));
              }
              if (character) {
				  partycounter++;
	              name = getAttrByName(character.id, "character_name");
	              pp = getattr(character.id, "pp")*1;
	              gp = getattr(character.id, "gp")*1;                  
	              ep = getattr(character.id, "ep")*1;                  
	              sp = getattr(character.id, "sp")*1;
	              cp = getattr(character.id, "cp")*1;
	              total = Math.round((pp*10+gp+ep*0.5+cp/100+sp/10)*10000)/10000;
	              partytotal = total+partytotal;
				  output+="<br><b>"+name+"</b>";
                  if (ppa) {setattr(character.id,"pp",parseInt(pp)+parseInt(ppa[1])); output+="<br> "+ppa[0];}
                  if (gpa) {setattr(character.id,"gp",parseInt(gp)+parseInt(gpa[1])); output+="<br> "+gpa[0];}
                  if (epa) {setattr(character.id,"ep",parseInt(ep)+parseInt(epa[1])); output+="<br> "+epa[0];}
                  if (spa) {setattr(character.id,"sp",parseInt(sp)+parseInt(spa[1])); output+="<br> "+spa[0];}
                  if (cpa) {setattr(character.id,"cp",parseInt(cp)+parseInt(cpa[1])); output+="<br> "+cpa[0];}
                  
                  
              }
              
		      });
              sendChat (scname,"/w gm &{template:"+rt[0]+"} {{"+rt[1]+"=<b>Cashing out - it's payday!</b><hr>"+output+"}}");
                      
      }
    
   if (msg.content.startsWith("!cmpay") === true)
          {
              
              
              ppg=/([0-9 -]+)pp/;
              ppa=ppg.exec(msg.content);

              gpg=/([0-9 -]+)gp/;
              gpa=gpg.exec(msg.content);

              epg=/([0-9 -]+)ep/;
              epa=epg.exec(msg.content);

              spg=/([0-9 -]+)sp/;
              spa=spg.exec(msg.content);

              cpg=/([0-9 -]+)cp/;
              cpa=cpg.exec(msg.content);


			  output="";

              _.each(msg.selected, function(obj) {
              var token, character;
              token = getObj('graphic', obj._id);
              if (token) {
                  character = getObj('character', token.get('represents'));
              }
              if (character) {
				  partycounter++;
	              name = getAttrByName(character.id, "character_name");
	              pp = getattr(character.id, "pp")*1;
	              gp = getattr(character.id, "gp")*1;                  
	              ep = getattr(character.id, "ep")*1;                  
	              sp = getattr(character.id, "sp")*1;
	              cp = getattr(character.id, "cp")*1;

				  // ! cmpay
				  var startamount = [pp,gp,ep,sp,cp];
				  if (ppa !== null) startamount=cm_changemoney(startamount,ppa[0]);
				  if (gpa !== null) startamount=cm_changemoney(startamount,gpa[0]);
				  if (epa !== null) startamount=cm_changemoney(startamount,epa[0]);
				  if (spa !== null) startamount=cm_changemoney(startamount,spa[0]);
				  if (cpa !== null) startamount=cm_changemoney(startamount,cpa[0]);
				  
				  output+="<br><b>"+name+"</b> has ";
				if (startamount == "ERROR: Not enough cash.") output+="not enough cash!";
					else {
					setattr(character.id,"pp",parseInt(startamount[0])); output+="<br> "+startamount[0]+"pp";
					setattr(character.id,"gp",parseInt(startamount[1])); output+="<br> "+startamount[1]+"gp";
					setattr(character.id,"ep",parseInt(startamount[2])); output+="<br> "+startamount[2]+"ep";
					setattr(character.id,"sp",parseInt(startamount[3])); output+="<br> "+startamount[3]+"sp";
					setattr(character.id,"cp",parseInt(startamount[4])); output+="<br> "+startamount[4]+"cp";
					}            
                  
              }
              
		      });
              sendChat (scname,"/w gm &{template:"+rt[0]+"} {{"+rt[1]+"=<b>Cashing out - it's payday!</b><hr>"+output+"}}");
                      
      }
   
   
   
if (msg.content.startsWith("!cmhoard") === true)
          {
              
              ppg=/([0-9 -]+)pp/;
              ppa=ppg.exec(msg.content);

              gpg=/([0-9 -]+)gp/;
              gpa=gpg.exec(msg.content);

              epg=/([0-9 -]+)ep/;
              epa=epg.exec(msg.content);

              spg=/([0-9 -]+)sp/;
              spa=spg.exec(msg.content);

              cpg=/([0-9 -]+)cp/;
              cpa=cpg.exec(msg.content);

			  output="";
			  partycounter = 0;
				  
			  _.each(msg.selected, function(obj) {
              var token, character;
              token = getObj('graphic', obj._id);
              if (token) {
                  character = getObj('character', token.get('represents'));
              }
              if (character) {
				  partycounter++;
	              name = getAttrByName(character.id, "character_name");
	              pp = getattr(character.id, "pp")*1;
	              gp = getattr(character.id, "gp")*1;                  
	              ep = getattr(character.id, "ep")*1;                  
	              sp = getattr(character.id, "sp")*1;
	              cp = getattr(character.id, "cp")*1;

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
              sendChat (scname,"/w gm &{template:"+rt[0]+"} {{"+rt[1]+"=<b>You are splitting up the coins among you</b><hr>"+output+"}}");                      
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

function cm_changemoney(startamount,addamount)
	{
		if (addamount !== null) {
		var currency=addamount.slice(-2);
		var amount2=-parseInt(addamount.substr(0,addamount.length-2));
		var origamount=startamount;
		var amount3=0;
		if (currency=="cp") amount3=amount2/100;
		if (currency=="sp") amount3=amount2/10;
		if (currency=="ep") amount3=amount2/2;
		if (currency=="gp") amount3=amount2;
		if (currency=="pp") amount3=amount2*10;
		if (startamount[0]*10+startamount[1]+startamount[2]/2+startamount[3]/10+startamount[4]/100>=-amount3) 
		{
			startamount[4]+=amount3*100;		
			while (startamount[4]<0) {startamount[4]+=10;startamount[3]--;} //cp
			while (startamount[3]<0) {if (startamount[4]>=10) {startamount[4]-=10;startamount[3]++} else {startamount[3]+=5;startamount[2]--;}} //sp
			while (startamount[2]<0) {if (startamount[3]>=5) {startamount[3]-=5;  startamount[4]++} else {startamount[2]+=2;startamount[1]--;}}   //ep
			while (startamount[1]<0) {if (startamount[2]>=2) {startamount[2]-=2;  startamount[1]++} else {startamount[1]+=10;startamount[0]--;}} //gp
			while (startamount[0]<0) {if (startamount[1]>=10) {startamount[1]-=10;  startamount[0]++} else {startamount=origamount;return "ERROR: Not enough cash.";}} //pp
			return startamount;
		}
		else return "ERROR: Not enough cash.";
		}
	}
	
function cm_usd(total,usd=110)
	{
	var output="";	
	if (usd>0) output="<span style='display:inline;' title='Equals roughly "+(Math.round((total*usd)/5)*5)+" USD'>"+total+"</span>";
	else output=total;
	return output;
	}	