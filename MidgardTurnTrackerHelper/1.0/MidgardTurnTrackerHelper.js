// This script deals with the special needs of the turn order and the German RPG Midgard

let turnorder = [];
var command;
var player;
var message;
var menue;
let automatism = true;

on('chat:message', function(msg) {
	
	let player = msg.playerid;
	let message = msg;
		
	if (!playerIsGM(player)) { return; } //Nur GMs dürfen die Chat-Commandos ausführen
	
	command = msg.content.split(/\s+/);//splits the message contents into discrete arguments
	
	switch(command[0]) {
			case '!midt': CommandList(msg);break; //Liste der Kommandos in den Chat ausgeben
		    case '!midtinit': InitTurnOrder(); break; // Turn Order initialisieren
			case '!midtclear': ClearTurnOrder(); break; // Turn Order löschen
			case '!midtsort': SortTurnOrder(); break; // Turnorder sortieren
			case '!midttoggle': ToggleAuto(); break; // Schaltet den Automatismus an oder aus
	}

});

function CommandList(msg) { // Liste der Befehle in den Chat ausgeben mit Chatmenue
		let menue = "&{template:default} {{name=Midgard Turn Order Helfer}}" +
					"{{[!midt](!midt) = Dieses Menü}}" + 
					"{{[!midtinit](!midtinit) = Rundenphasen hinzufügen und sortieren}}" +
					"{{[!midtclear](!midtclear) = Rundentracker leeren}}" +
					"{{[!midtsort](!midtsort) = Rundentracker sortieren}}" +
					"{{[!midttoggle](!midttoggle) = Automatismus umschalten}}";
		
		sendChat("Turn Order","/w gm &{template:default}" + menue);
	}
	
function ToggleAuto() { // Automatismus umschalten
		if(automatism == true) {
			automatism = false;
			sendChat("Turn Order","/w gm Automatismus abgeschaltet!"); 
		} else if(automatism == false) {
			automatism = true;
			sendChat("Turn Order","/w gm Automatismus angeschaltet!");
		}
		CommandList(message); // Und Befehlsübersicht erneut aufrufen
	}

function SortTurnOrder() { //Sortieren der Turn Order
	
	let turnorder = JSON.parse(Campaign().get('turnorder')).sort((a,b) => { return b.pr - a.pr });
	Campaign().set("turnorder", JSON.stringify(turnorder));
	
	}

function ClearTurnOrder() { // Turn Order löschen
		turnorder = [];
		Campaign().set("turnorder", JSON.stringify(turnorder));
		InitTurnOrder(); // Und wieder die Defauleinträge setzen
	}

function InitTurnOrder() { // Turn Order mit Grunddaten initialisieren  
	if(Campaign().get("turnorder") == "") turnorder = []; //NOTE: We check to make sure that the turnorder isn't just an empty string first. If it is treat it like an empty array.
	else turnorder = JSON.parse(Campaign().get("turnorder"));

// Bewegunsphase und Rundenende in die Turnorder hinzufügen

		turnorder.push({
		id: "-1",
		pr: "999",
		custom: "==Bewegung=="
	});
	
	turnorder.push({
		id: "-1",
		pr: "-1",
		custom: "==Gw/2=="
	});
	
	turnorder.push({
		id: "-1",
		pr: "-2",
		custom: "==Rundenende=="
	});
	
	Campaign().set("turnorder", JSON.stringify(turnorder));
	SortTurnOrder();
 }
 
// Wenn die Turnorder geöffnet wird und leer ist, befüllen 
 
 on('change:campaign:initiativepage',(obj)=>{
        if(false === obj.get('initiativepage') || automatism == false){
            return;
        } else {
// Wenn Turnorder leer ist, diese initialisieren
			turnorder = Campaign().get("turnorder");
			if(turnorder === undefined || turnorder.length == 2) {
				InitTurnOrder();
			}
        }
    });