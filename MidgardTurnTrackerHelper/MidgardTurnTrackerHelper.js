// This script deals with the special needs of the turn order and the German RPG Midgard

var turnorder;
var command;
var player;

on('chat:message', function(msg) {
	
	let player = msg.playerid;
		
	if (!playerIsGM(player)) { return; } //Nur GMs dürfen die Chat-Commandos ausführen
	
	command = msg.content.split(/\s+/);//splits the message contents into discrete arguments
	
	switch(command[0]) {
			case '!midt': CommandList(msg);break; //Liste der Kommandos in den Chat ausgeben
		    case '!midtinit': InitTurnOrder(); break; // Turn Order initialisieren
			case '!midtclear': ClearTurnOrder(); break; // Turn Order löschen
			case '!midtsort': SortTurnOrder(); break; // Turnorder sortieren
	}

});

function CommandList(msg) { // Liste der Befehle in den Chat ausgeben mit Chatmenue
	}

function SortTurnOrder() { //Sortieren der Turn Order
	
	let turnorder = JSON.parse(Campaign().get('turnorder')).sort((b,a) => { return a.pr - b.pr });
	Campaign().set("turnorder", JSON.stringify(turnorder));
	
	}

function ClearTurnOrder() { // Turn Order löschen
		let turnorder = [];
		Campaign().set("turnorder", JSON.stringify(turnorder));
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
		pr: "0",
		custom: "==Rundenende=="
	});
	
	Campaign().set("turnorder", JSON.stringify(turnorder));
	SortTurnOrder();
 }
    