/*
EcounterHelper.js
Script Author : Kurt Jaegers
Version       : 1.0.10
Last Update   : 2020-10-01

Purpose       :	Provides a set of chat commands to manage "Encounters", or groups of tokens on a single
				map page. A single command can be used to bring all of the tokens associated with an
				encounter to the Token layer (from the GM Layer) or place them back on the GM Layer.

Requirements  :	On any map page that you wish to define and use encounters, you will need to create a token
				called "Encounter Token" This token can be on the GM Layer, and have any graphic you wish. 
				The "gmnotes" attribute on the token will be used to store information about encounters on 
				this map.
				
Updates		  : 1.0.10 - Added the ability to rename encounters with !eh rename (or via the list)

				1.0.9 - Added !eh update_reset_info command to refresh the saved values for token resets.
				
				1.0.8 - Added a series of attributes for tokens that are saved along with the encounter. These
                are configurable by updating the "resetValues" constant below. By default, EH will store the
				position and size of each token, the value/max of Bar 3, and the Status Markers applied to
				each token.

Commands      : Note: Encounter Names are case sensitive.

	!eh list
		The command that will be used most often in-game. Lists all encounters that have defined
		on the current page, along with buttons to show, hide, display details, or remove (delete)
		the encounter. These generally just call the other !eh commands.
	
	!eh pagelist
		List all of the pages that have "Encounter Token" tokens on them and allows you to activate any
		of those pages as the page you will currently be working on. If no page is active, the player
		ribbon location will be used as the active page.
		
	!eh create <Encounter Name>
		Requires one or more tokens to be selected. Will create (or replace) an encounter defined
		on the current page with the selected tokens and name.

		example: !eh create A05 - Ghouls in the West Wing

	!eh show <Encounter Name>
		Moves all tokens associated with an encounter to the Object/Token layer. Note that you would
		probably not type this out, but rather pick the show icon from an !eh list output.

		example: !eh show A05 - Ghouls in the West Wing

	!eh hide <Encounter Name>
		Moves all tokens associated with an encounter to the GM Info layer. Note that you would
		probably not type this out, but rather pick the show icon from an !eh list output.

		example: !eh hide A05 - Ghouls in the West Wing

	!eh display <Encounter Name>
		Outputs a table of all of the tokens associated with the named encounter to the chat window as
		a whisper to the GM. Includes name, HP (it will try to figure out what bar you use for this),
		and armor class.

		example: !eh display A05 - Ghouls in the West Wing

	!eh remove <Encounter Name>
		Removes the encounter from the encounters list. Does not impact the associated tokens.

		example: !eh remove A05 - Ghouls in the West Wing
		
	!eh promptreset <Encounter Name>
		Creates a button that can be pressed to reset the encounter to its initial saved state. This command
		is used in the encounter list to allow for a button to reset the encounter.
		
	!eh reset <Encounter Name>
		Resets the encounter to its initial state (called by promptreset)
		
	!eh update <Encounter Name>
		Does note require tokens to be selected. Updates the tokens for the given encounter by storing
		the current reset data values back into the encounter. Can be used after adjusting the positions or
		attributes of tokens that you want to become their defaults on a reset.
		
	!eh update_all_reset_info
		Runs !eh update for all encounters on the page, as a one-shot way to store reset data for all
		page encounters at the same time.
		
	!eh reset_all_encounters
		Runs !eh reset for all encounters on the page.
		
	!eh setactivepage <pageid>
		Sets the currently active page to the passed page id. You will probably never use this, but it
		is the command called by the Activate button on the pagelist.
		
	!eh configmenu
		Displays the configuration menu.
		
	!eh rename <existing encounter name>|<new encounter name>
		Rename the existing encounter with a new name.
		
 */

const EncounterHelper = (() => {

	// Used for the state storage system so it is transportable between API scripts.
	const APINAME = "EncounterHelper";
	
	// Configuration schema version. This represents the last time changes were made to the configuration values
	// saved between sessions, and is not necessarially the same as the API version number.
	const APIVERSION = "1.0.12";
	
	// Currently available languages are "english", "french", "spanish", and "german"
	var APILANGUAGE = "english";

	// To define the columns displayed in the "D" list, edit the array below. an entry consists of:
	//    either "bar" or "attr" depending on if you want to pull a bar from the token or an attribute from the character
	//    the column header that will be shown in the display list
	//    the details for the column : if a "bar" column, the bar number. If an attr column, the name of the attribute.
	const columns = ["bar|HP|3","attr|AC|npc_ac"];
	
	// These attribute values are saved with each token in an encounter, allowing encounters to be reset through the 
	// "reset" operation. you can modify this list (for example to change the bar used for HP) or add/remove values.
	const resetValues = ["left","top","width","height","bar3_value","bar3_max","statusmarkers"];

	var activeEncounterPage = undefined;
	
	// You can customize the look of the tables/output produced by EncounterHelper by changing these css entries.
	const buttonStyle = 'background-color:#000; color: #fff; text-align: center; vertical-align:middle; border-radius: 5px; border-color:goldenrod; font-size:x-small;';
	const tableStyle = 'width:100%; border: 2px solid #000; margin: 0; padding:1px; font-size:x-small; color:black; background-color:#ddd';
	const tableCellStyle = 'text-align: center; margin: { top:1px, left:1px; }; color:black; background-color:goldenrod; font-size:x-small;';
	const tableHeaderCellStyle = 'text-align: center; margin: { top:1px, left:1px; }; color:white; background-color:#813772;';
	
	// These entries determine what text will be on the button labels
	const buttonText = {
		show: "S",
		hide: "H",
		display: "&#128196;",
		remove: "&#9940;",
		rollinit: "&#127922;",
		groupinit: "Group-Init",
		resetbutton: "&#x21A9;",
		renamebutton: "&#127380;"
	};
	
	// Configuration settings and their on-screen equivalents. The idea of doing it this way is to potentially support localization
	// down the line.
	var configSettings = {
		"groupinit_include_players": {type: "toggle", name: "GroupInit Players?", defaultValue: false },
	}
		
	// Strings used to report setting values out to chat menus. Each string is listed as the internal value used followed by a translation
	// list. If one word is defined for a language, all words must be defined for that language to prevent crashes.
	//
	// This setup should allow for fairly easy localization.
	var translateList = {
		"true": { 
			english: "ON", 
			french: "Activé",
			spanish: "Activo",
			german: "Aktiv"
		},
		"false": { 
			english: "OFF", 
			french: "désactivé",
			spanish: "Inactivo",
			german: "Inaktiv"
		},
		"EncounterHelper": {
			english: "EncounterHelper", 
			french: "EncounterHelper",
			spanish: "EncounterHelper",
			german: "EncounterHelper"
		},
		"groupinit_include_players": {
			english: "GroupInit Players?", 
			french: "GroupInit joueur?",
			spanish: "¿GroupInit para jugadores?",
			german: "GroupInit für Spieler?"
		},
		"encounter": { 
			english: "Encounter", 
			french: "Rencontre" ,
			spanish: "Encuentro",
			german: "Begegnung"
		},
		"options": {
			english: "Options",
			french: "Options" ,
			spanish: "Opciones",
			german: "Optionen"
		},
		"player" : {
			english: "player",
			french: "joueur" ,
			spanish: "jugador",
			german: "Spieler"
		},
		"invalid_player" : {
			english: "Player [0] tried to use the [1] command.",
			french: "Le joueur [0] a essayé d'utiliser la commande [1].",
			spanish: "El jugador [0] intentó usar el comando [1].",
			german: "Spieler [0] hat versucht, den Befehl [1] zu verwenden."
		},
		"created_encounter" : {
			english: "Created encounter [0] with [1] tokens.",
			french: "Création de la rencontre [0] avec [1] jetons.",
			spanish: "Encuentro creado [0] con [1] fichas.",
			german: "Begegnung [0] mit [1] Token erstellt."
		},
		"select_tokens": {
			english: "Please select one or more tokens to be part of the encounter.", 
			french: "Veuillez sélectionner un ou plusieurs jetons pour faire partie de la rencontre.",
			spanish: "Seleccione uno o más fichas para ser parte del encuentro.",
			german: "Bitte wählen Sie einen oder mehrere Token aus, um Teil der Begegnung zu sein."
		},
		"delete_encounter": {
			english: "Deleting encounter [0]",
			french: "Suppression de la rencontre [0]",
			spanish: "Eliminando encuentro [0]",
			german: "Begegnung löschen [0]"
		},
		"encounter_shown": {
			english: "Encounter [0] moved to token layer.",
			french:"La rencontre [0] a été déplacée vers la couche de jetons.",
			spanish: "El encuentro [0] se movió a la capa de fichas.",
			german: "Begegnung [0] wurde zur Token-Ebene verschoben."
		},
		"active_page": {
			english: "Active page",
			french:"Page active",
			spanish: "Página activa",
			german: "Aktive Seite"
		},
		"token_name": {
			english: "Token Name",
			french: "Nom du jeton",
			spanish: "Nombre de fichas",
			german: "Token-Name"
		},
		"action" : {
			english: "Action",
			french: "action",
			spanish: "Acción",
			german: "Aktion"
		},
		"page" : {
			english: "Page",
			french: "Page",
			spanish: "Página",
			german: "Seite"
		},
		"activate" : {
			english: "Activate",
			french: "Activer",
			spanish: "Activar",
			german: "Betätigen"
		},
		"active_page_set" : {
			english: "Active page set to [0].",
			french: "Page active définie sur [0].",
			spanish: "Página activa establecida en [0].",
			german: "Aktive Seite auf [0] gesetzt."
		},
		"page_not_found" : {
			english: "Page not found. Active page not changed.",
			french: "Page non trouvée. La page active n'a pas été modifiée.",
			spanish: "Página no encontrada. La página activa no ha cambiado.",
			german: "Seite nicht gefunden. Aktive Seite nicht geändert."
		},
		"unknown_setting" : {
			english: "Unknown configuration setting [0]",
			french: "Paramètre de configuration inconnu [0]",
			spanish: "Configuración de configuración desconocida [0]",
			german: "Unbekannte Konfigurationseinstellung [0]"
		},
		"to_use_eh": {
			english: "To use Encounter Helper, you must create a token on this page named [0] to store encounter information.",
			french: "Pour utiliser Encounter Helper, vous devez créer un jeton sur cette page nommé [0] pour stocker les informations sur les rencontres.",
			spanish: "To use Encounter Helper, you must create a token on this page named [0] to store encounter information.",
			german: "Um Encounter Helper verwenden zu können, müssen Sie auf dieser Seite ein Token mit dem Namen [0] erstellen, um Begegnungsinformationen zu speichern."
		},
		"confirm_reset": {
			english: "Confirm Reset",
			french: "confirmer la réinitialisation",
			spanish: "confirmar reinicio",
			german: "Zurücksetzen bestätigen"
		},
		"reset_encounter": {
			english: "Resetting encounter [0] to initial state.",
			french: "Remise à l'état initial de la rencontre [0].",
			spanish: "Restableciendo el encuentro [0] al estado inicial.",
			german: "Begegnung [0] auf Ausgangszustand zurücksetzen."
		},
		"update_info_reset": {
			english: "Updating reset information for [0].",
			french: "Mise à jour des informations de réinitialisation pour [0].",
			spanish: "Actualizando la información de reinicio para [0].",
			german: "Aktualisieren der Rücksetzinformationen für [0].",
		},
		"page-wide-warning": {
			english: "Note: these buttons will modify all encounters on the page and cannot be undone.",
			french: "",
			spanish: "",
			german: ""
		},
		"Show Page-Wide Options": {
			english: "Show Page-Wide Options",
			french: "Afficher les options sur toute la page",
			spanish: "Mostrar opciones para toda la página",
			german: "Seitenweite Optionen anzeigen"
		},
		"Update All Reset Data": {
			english: "Update All Reset Data",
			french: "Mettre à jour toutes les données de réinitialisation",
			spanish: "Actualizar todos Restablecer datos",
			german: "Aktualisieren Sie alle Rücksetzdaten"
		},
		"update_all_desc": {
			english: "Update all encounters on this page by adding or replacing the stored reset data with current values.",
			french: "Mettez à jour toutes les rencontres sur cette page en ajoutant ou en remplaçant les données de réinitialisation stockées par les valeurs actuelles.",
			spanish: "Actualice todos los encuentros en esta página agregando o reemplazando los datos de restablecimiento almacenados con los valores actuales.",
			german: "Aktualisieren Sie alle Begegnungen auf dieser Seite, indem Sie die gespeicherten Rücksetzdaten hinzufügen oder durch aktuelle Werte ersetzen.",
		},
		"reset_all_desc": {
			english: "Reset all tokens for all encounters on the page, returning them to their stored data values.",
			french: "Réinitialisez tous les jetons pour toutes les rencontres sur la page, en les renvoyant à leurs valeurs de données stockées.",
			spanish: "Restablezca todos los tokens para todos los encuentros en la página, devolviéndolos a sus valores de datos almacenados.",
			german: "Setzen Sie alle Token für alle Begegnungen auf der Seite zurück und setzen Sie sie auf ihre gespeicherten Datenwerte zurück."
		},
		"Page Options": {
			english: "Page Options",
			french: "Options de page",
			spanish: "Opciones de página",
			german: "Seitenoptionen"
		},
		"rename_name_already_exists" : {
			english: "An encounter named [0] already exists. Cancelling rename request.",
			french: "Une rencontre nommée [0] existe déjà. Annulation de la demande de changement de nom.",
			spanish: "Ya existe un encuentro llamado [0]. Cancelando la solicitud de cambio de nombre.",
			german: "Eine Begegnung mit dem Namen [0] existiert bereits. Umbenennungsanforderung abbrechen.",
		},
		"rename_no_encounter": {
			english: "Could not find existing encounter [0] to rename.",
			french: "Impossible de trouver la rencontre existante [0] à renommer.",
			spanish: "No se pudo encontrar el encuentro existente [0] para cambiar el nombre.",
			german: "Vorhandene Begegnung [0] konnte nicht umbenannt werden."
		},
		"renamed_encounter": {
			english: "Encounter '[0]' renamed to '[1]'",
			french: "Rencontre «[0]» renommée en «[1]»",
			spanish: "El encuentro '[0]' ha cambiado de nombre a '[1]'",
			german: "Begegnung '[0]' umbenannt in '[1]'"
		},
		"rename_button": {
			english:"Rename Encounter",
			french: "Renommer la rencontre",
			spanish: "Cambiar nombre de encuentro",
			german: "Encounter umbenennen"			
		},
		"translation_template": {
			english: "",
			french: "",
			spanish: "",
			german: ""
		},
	}
	
	on('ready', function () {
		if (!state[APINAME]) {
			initializeState();
		}
		
		log(`-=> ${translate(APINAME)} v${APIVERSION} <=-`);
		
		var useroptions = (globalconfig && (globalconfig.EncounterHelper || globalconfig.encounterhelper )) ||	{ 'language': 'english', 'gi_players': 'false' };
		
		if (useroptions !== undefined) { 
			APILANGUAGE = useroptions.language;
		}
			
		on('chat:message', function (msg) {
			if (msg.type === "api") {
				if (!(playerIsGM(msg.playerid) && msg.who !== "Encounter Helper") && msg.who !== APINAME && msg.who !== translate(APINAME)) {
					if (msg.content.startsWith("!eh")) {
						sendChat(translate(APINAME), "/w gm " + translate("invalid_player").replace("[0]", msg.who).replace("[1]", msg.content));
						return;
					}
				}
				var args = msg.content.split(" ");
				var command = args[0];
				if (command === undefined) { return }
				args.shift();
				var encounterPageID = Campaign().get("playerpageid");
				if (activeEncounterPage !== undefined) {
					if (getObj("page",activeEncounterPage) !== undefined) {
						encounterPageID = activeEncounterPage;
					}
				}
				switch (command.toLowerCase()) {
				case "!enchelp":
				case "!eh":
					var operation = args[0];
					args.shift();
					if (operation === undefined) { 
						operation = "list"
					}

					switch (operation.toLowerCase()) {
					case "create":
					case "c":
						if (msg.selected !== undefined) {
							createEncounter(encounterPageID, args.join(" "), msg.selected);
							sendChat(translate(APINAME), "/w gm " + translate("created_encounter").replace("[0]", args.join(" ")).replace("[1]", msg.selected.length));
						} else {
							sendChat(translate(APINAME), "/w gm " + translate("select_tokens"));
						}
						break;

					case "remove":
					case "r":
						if (args.length > 0) {
							sendChat(translate(APINAME), "/w gm " + translate("delete_encounter").replace("[0]", args.join(" ")));
							var encName = args.join(" ");
							deleteEncounter(encounterPageID, encName);
						}
						break;

					case "rename":
					case "n":
						if (args.length > 0) {
							var p = args[0].split("|");
							if (p.length == 2) {
								var oldMobs = getEncounterMobsFullInfo(encounterPageID,p[0]);
								log(oldMobs);
								var checkExisting = getEncounterMobsFullInfo(encounterPageID,p[1]);
								log(checkExisting);
								if (checkExisting.length > 0) {
									sendChat(translate(APINAME), "/w gm " + translate("rename_name_already_exists").replace("[0]", p[1]));
								} else {
									if (oldMobs.length < 1) {
										sendChat(translate(APINAME), "/w gm " + translate("rename_no_encounter").replace("[0]", p[1]));
									} else {
										deleteEncounter(encounterPageID, p[0]);
										setEncounterMobs(encounterPageID, p[1], oldMobs);
										sendChat(translate(APINAME), "/w gm " + translate("renamed_encounter").replace("[0]",p[0]).replace("[1]",p[1]));
										sendChat(translate(APINAME), "!eh list");
									}
								}
							} else {								
								sendChat(translate(APINAME), "/w gm " + makeButton(translate("rename_button"), HE(HE("!eh rename [0]|[1]".replace("[0]", p[0]).replace("[1]",`?{New encounter name|${p[0]}}`)))));
							}
						}
						break;
						
					case "promptreset":
						sendChat(translate(APINAME), "/w gm " + makeButton(translate("confirm_reset").replace("[0]", args.join(" ")), `!eh reset ${args.join(" ")}`) + " for " + args.join(" "));
						break;
						
					case "reset":
						if (args.length > 0) {
							sendChat(translate(APINAME), "/w gm " + translate("reset_encounter").replace("[0]", args.join(" ")));
							var encName = args.join(" ");
							resetEncounter(encounterPageID, encName);
						}
						break;
						
					case "update_reset_info":
						if (args.length > 0) {
							var encName = args.join(" ");
							updateEncounterRestoreData(encounterPageID, args.join(" "));
							sendChat(translate(APINAME), "/w gm " + translate("update_info_reset").replace("[0]", args.join(" ")));
						}
						break;
						
					case "update_all_reset_info":
						var encounterList = getEncounterList(encounterPageID);
						encounterList.forEach(function(encounter){
							//var encounterName = encounter.split(":")[0].replace("(","&#40;").replace(")","&#41;");
							var encounterName = encounter.split(":")[0];
							log(encounterName);
							if (encounterName !== "") {
								sendChat(translate(APINAME), `!eh update_reset_info ${encounterName}`);
							}
						});
						break;
						
					case "reset_all_encounters":
						var encounterList = getEncounterList(encounterPageID);
						encounterList.forEach(function(encounter){
							//var encounterName = encounter.split(":")[0].replace("(","&#40;").replace(")","&#41;");
							var encounterName = encounter.split(":")[0];
							log(encounterName);
							if (encounterName !== "") {
								sendChat(translate(APINAME), `!eh reset ${encounterName}`);
							}
						});
						break;
						
					case "show":
					case "s":
						if (args.length > 0) {
							var encounterName = args.join(" ");
							setEncounterLayer(encounterPageID, encounterName, "objects");
							var message = "/w gm " + translate("encounter_shown").replace("[0]", args.join(" "));
							if (typeof GroupInitiative !== 'undefined') {
								var mobs = getEncounterMobs(encounterPageID, encounterName);
								var addPlayers = "";
								if (getConfigParameter("groupinit_include_players")) {
									addPlayers = " " + getPlayerTokenIDs(encounterPageID).join(" ");
								}
								message += makeButton(buttonText.groupinit, `!group-init --ids ${mobs.join(" ")}${addPlayers} --sort` );
							}
							sendChat("", message);
						}
						break;
						
					case "hide":
					case "h":
						if (args.length > 0) {
							setEncounterLayer(encounterPageID, args.join(" "), "gmlayer");
						}
						break;

					case "list":
					case "l":					
						var encounters = getEncounterList(encounterPageID);
						var page = getObj("page", encounterPageID);
						var colspan=6;
						if (typeof GroupInitiative !== 'undefined') { colspan = 6; }
						var chatMessage = "<br /><strong>" + translate("active_page") + " " + page.get("name") + "</strong><br /><table style='" + tableStyle + "'><tr><td style='" + tableHeaderCellStyle + "'>" + translate("encounter") + "</td><td  style='" + tableHeaderCellStyle + "' colspan=" + colspan + ">" + translate("options") + "</td></tr>";
						var endChatMessage = "</table>";

						encounters.forEach(function (encounter) {
							var encounterName = encounter.split(":")[0].replace("(","&#40;").replace(")","&#41;");
							if (encounterName !== undefined && encounterName !== "") {
								var showLink = `!enchelp show ${encounterName}`;
								var hideLink = `!enchelp hide ${encounterName}`;
								var displayLink = `!enchelp display ${encounterName}`;
								var removeLink = `!enchelp remove ${encounterName}`;
								var resetLink = `!enchelp promptreset ${encounterName}`;
								var renamelink = HE(HE("!enchelp rename [0]|[1]".replace("[0]", encounterName).replace("[1]",`?{Rename "${encounterName}" to|${encounterName}}`)));
								var groupInitButton = "";
								if (typeof GroupInitiative !== 'undefined') {
									var mobs = getEncounterMobs(encounterPageID, encounterName);
									groupInitButton = `<td style='${tableCellStyle}'>`;
									var addPlayers = "";
									if (getConfigParameter("groupinit_include_players")) {
										addPlayers = " " + getPlayerTokenIDs(encounterPageID).join(" ");
									}
									groupInitButton += makeButton(buttonText.rollinit, `!group-init --ids ${mobs.join(" ")}${addPlayers} --sort` );
									groupInitButton += "</td>";
								}
								
								chatMessage += `<tr><td style='${tableCellStyle}'>${encounterName}</td><td style='${tableCellStyle}'>${makeButton(buttonText.show, showLink)}</td><td style='${tableCellStyle}'>${makeButton(buttonText.hide, hideLink)}</td><td style='${tableCellStyle}'>${makeButton(buttonText.renamebutton, renamelink)}</td><td style='${tableCellStyle}'>${makeButton(buttonText.display, displayLink)}</td>${groupInitButton}<td style='${tableCellStyle}'>${makeButton(buttonText.remove, removeLink)}</td><td style='${tableCellStyle}'>${makeButton(buttonText.resetbutton, resetLink)}</td></tr>`;
							}
						});

						chatMessage += `<tr><td style='${tableCellStyle}' colspan=${colspan + 1}>${makeButton(translate("Show Page-Wide Options"),"!eh show_page_options")}</tr></tr>`;
						
						sendChat(translate(APINAME), `/w gm ${chatMessage}${endChatMessage}`);

						break;

					case "show_page_options":
						var page = getObj("page", encounterPageID);
						var chatMessage = "<br /><strong>" + translate("active_page") + " " + page.get("name") + "</strong><br /><table style='" + tableStyle + "'><tr><td colspan=2 style='" + tableHeaderCellStyle + "'>" + translate("Page Options") + "</td>";
						chatMessage += `<tr><td style='${tableCellStyle}'>${makeButton(translate("Update All Reset Data"), "!eh update_all_reset_info")}</td><td style='${tableCellStyle}'>${translate("update_all_desc")}</td></tr>`;
						chatMessage += `<tr><td style='${tableCellStyle}'>${makeButton(translate("Reset All Encounters"), "!eh reset_all_encounters")}</td><td style='${tableCellStyle}'>${translate("reset_all_desc")}</td></tr>`;
						chatMessage += `<tr><td colspan=2 style='${tableCellStyle}'><hr></td></tr>`;
						chatMessage += `<tr><td colspan=2 style='${tableCellStyle}'>${translate("page-wide-warning")}</td></tr>`;
						var endChatMessage = "</table>";

						sendChat(translate(APINAME), `/w gm ${chatMessage}${endChatMessage}`);

						break;
						
					case "display":
					case "d":
						var encounters = getEncounterList(encounterPageID);
						var encounterName = args.join(" ");
						var mobs = getEncounterMobs(encounterPageID, encounterName);
						var columnHeaders = "";
						columns.forEach(function(colInfo){
							var colDetails = colInfo.split("|");
							columnHeaders += `<td style='${tableHeaderCellStyle}'>${colDetails[1]}</td>`;
						});
						var chatMessage = `<table style='${tableStyle}'><tr><td style='${tableHeaderCellStyle}'>${translate("token_name")}</td>${columnHeaders}</tr>`;
						var endChatMessage = "</table>";

						mobs.forEach(function (mobid) {
							theToken = getObj("graphic", mobid);
							if (theToken !== undefined) {
								var theChar = getObj("character", theToken.get("represents"));
								if (theChar !== undefined) {
									var charName = theChar.get("name");
									var columnDisplay = "";
									columns.forEach(function(colInfo){
										var colDetails = colInfo.split("|");
										if (colDetails[0] == "bar") {
											if (theToken.get(`bar${colDetails[2]}_value`) !== undefined) {
												var cur = theToken.get(`bar${colDetails[2]}_value`);
												var max = theToken.get(`bar${colDetails[2]}_max`);
											} else {
												cur = "??";
												max = "??";
											}
											columnDisplay += `<td style='${tableCellStyle}'>${cur}/${max}</td>`;
										}
										if (colDetails[0] == "attr") {
											if (getAttrByName(theChar.id, colDetails[2])) {
												columnDisplay += `<td style='${tableCellStyle}'>${getAttrByName(theChar.id, colDetails[2])}</td>`;
											} else {
												columnDisplay += `<td style='${tableCellStyle}'>??</td>`;
											}
										}

									});
									chatMessage += `<tr><td style='${tableCellStyle}'>${charName}</td>${columnDisplay}</tr>`;
								}
							}

						});
						
						sendChat(translate(APINAME), `/w gm ${chatMessage}${endChatMessage}`);
						
						break;
						
					case "pagelist":
					case "pl":
						var pages = findObjs({type:"page"});
						var chatMessage = `<table style='${tableStyle}'><tr bgcolor='#543210'><td style='${tableHeaderCellStyle}'>${translate("page")}</td><td style='${tableHeaderCellStyle}'>${translate("action")}</td></tr>`;
						var endChatMessage = "</table>";
						pages.forEach(function(page) {
							pageid = page.get("_id");
							theToken = findObjs({
								type:"graphic",
								pageid:pageid,
								name:"Encounter Token"
							})[0];
							if (theToken !== undefined) {
								chatMessage += `<tr><td style='${tableCellStyle}'>${page.get("name")}</td>`;
								if (activeEncounterPage !== pageid) {
									var buttonurl = `!eh setactivepage ${pageid}`;
									chatMessage += `<td style='${tableCellStyle}'>${makeButton(translate("activate"),buttonurl)}</td>`;
								} else {
									chatMessage += "<td><strong>" + translate("active_page") + "</strong></td>";
								}
								chatMessage += "</tr>";
							}
						});
						sendChat(translate(APINAME), `/w gm ${chatMessage}${endChatMessage}`);
						break;

					case "groupinit":
						var encounters = getEncounterList(encounterPageID);
						var encounterName = args.join(" ");
						var mobs = getEncounterMobs(encounterPageID, encounterName);
						var players = findObjs({
							type: 'player'
						});						
						var theGM = "";
						players.forEach(function(player) {
							if (playerIsGM(player.get("id"))) {
								theGM = "player|" + player.get("id");
							}
						});
						sendChat(theGM, `group-init --ids ${mobs.join(" ")} --sort`);						
						sendChat('', `!group-init --ids ${mobs.join(" ")} --sort`);						
						break;
						
					case "setactivepage":
					case "sap":
						var page = getObj("page", args.join(" "));
						if (page !== undefined) {
							activeEncounterPage = page.get("_id");
							sendChat(translate(APINAME), "/w gm " + translate("active_page_set").replace("[0]", page.get("name")));
						} else {
							sendChat(translate(APINAME), "/w gm " + translate("page_not_found"));
						}
						break;
						
					case "toggle":
						// Used to toggle a configuration setting on or off (depending upon current value)
						var setting = args.join("_");
						if (configSettings[setting] !== undefined) {
							setConfigParameter(setting, !getConfigParameter(setting));
							//sendChat(translate(APINAME), `Setting ${configSettings[setting]} now set to ${translate(getConfigParameter(setting))}`);
							sendChat(translate(APINAME), "!eh configmenu");
						} else {
							sendChat(translate(APINAME), "/w gm" + translate("unknown_setting").replace("[0]",setting));
						}
						break;
											
					case "setconfig":
						break;
						
					case "configmenu":
						displayConfigMenu();
						break;

					sendChat(translate(APINAME), `/w gm ${chatMessage}${endChatMessage}`);
						
					}

					break;
					


				default:
					break;
				}
			}
		});
	});
	

	
	function displayConfigMenu() {
		var output = `<table style='${tableStyle}'>`;
		output += `<tr><td style='${tableHeaderCellStyle}' colspan=3>${APINAME}</td></tr>`
		output += generateMenuToggle("groupinit_include_players");
		output += "</table>";
		sendChat(translate(APINAME), `/w gm ${output}`);
		
	}
	
	function generateMenuToggle(configSetting, description) {
		var cellBase = `<td style='${tableCellStyle}'>`;
		var thisLine = `<tr>${cellBase}${translate(configSetting)}</td>`;
		thisLine += `${cellBase}${translate(getConfigParameter(configSetting))}</td>`;
		var toggleButton = makeButton("Toggle", `!eh toggle ${configSetting}`);
		thisLine += `${cellBase}${toggleButton}</td></tr>`;
		return thisLine;
	}

	function setEncounterLayer(pageid, encounterName, layer) {
		var mobs = getEncounterMobs(pageid, encounterName);
		mobs.forEach(function (mobid) {
			var thisObj = getObj("graphic", mobid);
			if (thisObj !== undefined) {
				thisObj.set("layer", layer);
			}
		});
	}
	
	function resetEncounter(pageid, encounterName) {
		var mobs = getEncounterMobsFullInfo(pageid, encounterName);
		mobs.forEach(function(mob) {
			var mobinfo = mob.split("#");
			var mobid = mobinfo[0];
			mobinfo.shift();
			var theToken = getObj("graphic", mobid);
			if (theToken !== undefined) {
				mobinfo.forEach(function(info){
					var infoData = info.split("=");
					theToken.set(infoData[0],infoData[1]);
				});			
			}
		});
	}
	
	function updateEncounterRestoreData(pageid, encounterName) {
		var mobs = getEncounterMobs(pageid, encounterName);
		var fakeSelectedList = [];
		mobs.forEach(function(mob) {
			var thisEntry = { _id: mob };
			fakeSelectedList.push(thisEntry);
		});
		if (fakeSelectedList.length > 0) {
			createEncounter(pageid, encounterName, fakeSelectedList)
		}
	}	

	function createEncounter(pageid, encounterName, selected) {
		var ids = [];
		selected.forEach(function (entity) {
			var extInfo = entity._id;
			var token = getObj("graphic", extInfo);
			resetValues.forEach(function(valName){
				var thisValue = token.get(valName);
				if (thisValue !== undefined) {
					extInfo += `#${valName}=${thisValue}`;
				} else {
					extInfo += `#${valName}=`;
				}
			});

			ids.push(extInfo);
		});

		if (ids.length > 0) {
			addEncounter(pageid, encounterName, ids);
		}
	}

	function getEncounterToken(pageid) {
		var thePage = findObjs({
				type: "page",
				id: pageid
			})[0];
		if (thePage !== undefined) {
			var tokenName = `Encounter Token`;
			
			var theToken = findObjs({
					type: "graphic",
					_pageid: pageid,
					name: tokenName
				})[0];
			if (theToken === undefined) {
				sendChat(translate(APINAME), "/w gm " + translate("to_use_eh").replace("[0]", tokenName));
			}
			return theToken;
		} else {
			return undefined;
		}
	}

	function deleteEncounterToken(pageid) {
		var token = getEncounterToken(pageid);
		if (token !== undefined) {
			token.remove();
		}
	}

	function getEncounterList(pageid) {
		var thePage = findObjs({
				type: "page",
				id: pageid
			});
		var ret = [];
		if (thePage !== undefined) {
			var encounterToken = getEncounterToken(pageid);
			if (encounterToken !== undefined) {
				var encNotes = encounterToken.get("gmnotes");
				var notes = decodeUrlEncoding(encNotes).replace(/\<p\>/g, "").replace(/\<\/p\>/g, "<br>").split("<br>");
				ret = notes;
			}
		}
		return ret;
	}

	function getEncounterMobsFullInfo(pageid, encounterName) {
		var encounterList = getEncounterList(pageid);
		ret = [];
		if (encounterList !== undefined) {
			encounterList.forEach(function (encounter, index) {
				var encInfo = encounter.split(":");
				if (encInfo[0] === encounterName) {
					ret = encInfo[1].split("|");
				}
			});
		}
		return ret;
	}
	
	function getEncounterMobs(pageid, encounterName) {
		var mobs = getEncounterMobsFullInfo(pageid, encounterName);
		for(x=0; x<mobs.length; x++) {
			mobs[x] = mobs[x].split("#")[0];
		}

		return mobs;
	}
	
	function saveEncounterList(pageid, encounterList) {
		encounterList.sort();
		var encounterText = encounterList.join("<br>");
		var theToken = getEncounterToken(pageid);
		if (theToken !== undefined) {
			theToken.set("gmnotes", encounterText);
		}
	}

	function addEncounter(pageid, encounterName, moblist) {
		deleteEncounter(pageid, encounterName);
		var currentList = getEncounterList(pageid);
		currentList.push(`${encounterName}:${moblist.join("|")}`);
		saveEncounterList(pageid, currentList);
	}

	function deleteEncounter(pageid, encounterName) {
		var encounterList = getEncounterList(pageid);
		var matchingIndex = -1;
		encounterList.forEach(function (encounter, index) {
			if (encounter.split(":")[0] === encounterName) {
				matchingIndex = index;
			}
		});
		if (matchingIndex !== -1) {
			encounterList.splice(matchingIndex, 1);
			saveEncounterList(pageid, encounterList);
		}
	}

	function setEncounterMobs(pageid, encounterName, moblist) {
		var existingMobs = getEncounterMobs(pageid, encounterName);
		if (existingMobs.length !== 0) {
			deleteEncounter(pageid, encounterName);
		}
		addEncounter(pageid, encounterName, moblist);
	}

	function makeButton(title, url) {
		return `<a style="${buttonStyle}" href="${url}">${title}</a>`;
	}
	
	function decodeUrlEncoding(t) {
		return t.replace(/%([0-9A-Fa-f]{1,2})/g, function (f, n) {
			return String.fromCharCode(parseInt(n, 16));
		})
	}
	
	const decodeEditorText = (t, o) =>{
		let w = t;
		o = Object.assign({ separator: '\r\n', asArray: false },o);
		if(/^%3Cp%3E/.test(w)){
			w = unescape(w);
		}
		if(/^<p>/.test(w)){
			let lines = w.match(/<p>.*?<\/p>/g)
			.map( l => l.replace(/^<p>(.*?)<\/p>$/,'$1'));
			return o.asArray ? lines : lines.join(o.separator);
		}
		return t;
	};

	function getPlayerTokenIDs(pageid) {
            var tokens = findObjs({
			    type:"graphic",
			    pageid:pageid,
			    isdrawing:false,
			    layer:"objects",
		    });
		    var repTokens = _.filter(tokens, function (token) { return (token.get("represents") !== ""); })
		    var conTokens = _.filter(repTokens, function (token) { return (getObj("character", token.get("represents")).get("controlledby") !== ""); })
		    var tokenList = [];
			conTokens.forEach(function(token){
				tokenList.push(token.get("_id"));
			});
			return tokenList;
	}
	
	
	/* 
		Below is my "generic" state storage system for my API Scripts. It is intended to be flexible enough to drop into
		any script I have now or create in the future.
	*/
	
	
	function initializeState() {
		if (APINAME == undefined || APINAME == "") {
			// Abort because APINAME isn't defined and we don't want to
			// mess up the game state object.
			return;
		}
		
		state[APINAME] = {
			module: APINAME,
			schemaVersion: APIVERSION,
			config: {},
		}
		
		// Set the defaults for configuration items.
		_.each(configSettings,function(item,key){
			state[APINAME].config[key] = item.defaultValue;
		});
	}
	
	function getConfigParameter(configItem) {
		if (APINAME == undefined || APINAME == "") {
			// Abort because APINAME isn't defined and we don't want to
			// mess up the game state object.
			return undefined;
		}
		
		return state[APINAME].config[configItem];
	}
	
	function setConfigParameter(configItem, value) {
		if (APINAME == undefined || APINAME == "") {
			// Abort because APINAME isn't defined and we don't want to
			// mess up the game state object.
			return;
		}
		
		switch (configSettings[configItem].type) {			
			case "toggle":
				if (value == true || value == "YES" || value == "yes" || value == "on" || value == "ON" || value == "Yes" || value == "On") {
					state[APINAME]["config"][configItem] = true;
				} else {
					state[APINAME]["config"][configItem] = false;
				}
				break;
			
			case "number":
				break;
				
			case "string":
				break;
			
			default:
				break;
		}
	}
	
	function translate(value) {
	    if (translateList[value.toString()] !== undefined) {
            return translateList[value.toString()][APILANGUAGE];
	    } else {
	        return value.toString();
	    }
    }
	
	// Code "borrowed" from The Aaron :)
	
	var esRE = function (s) {
		var escapeForRegexp = /(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g;
        return s.replace(escapeForRegexp,"\\$1");
    },
	
    HE = (function(){
		var entities={
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
        
		re=new RegExp('('+_.map(_.keys(entities),esRE).join('|')+')','g');
        return function(s){
			return s.replace(re, function(c){ return entities[c] || c; });
        };
      }());
	  
})();