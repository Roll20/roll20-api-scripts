/*
 * Saga Machine Roller
 * Designed for use with the Against the Dark Yogi and Shadows Over Sol character sheets.
 *
 * Adapted from the GURPS roll parser:
 * https://github.com/Roll20/roll20-character-sheets/blob/master/GURPS/script.js
 *
 */

var ENABLE_ROLL_PARSER = true;
var COMMANDS = ["roll vs", "r vs", "gmroll vs", "gmr vs", "roll", "r", "gmroll", "gmr"];

on("chat:message", function(message) {
    if (ENABLE_ROLL_PARSER && (message.type != "api")) {
        parse_chat(message);
    }
    else if (COMMANDS.length > 0 && (message.type == "api")) {
        parse_command(message);
    }
});


function parse_chat(message) {
    if (message.content.indexOf("Result=") == -1 || message.content.indexOf("Trump=") == -1) {
        // Rolls will include a result die and a trump die
        return;
    }

    if (message.inlinerolls != undefined && message.inlinerolls.length < 2) {
        // We need at least two numbers to add.
        return;
    }

    log("ROLLCOMP/ Received CHAT " + JSON.stringify(message));

    // Get the number of rolls
    var rollsNumber = message.inlinerolls.length;
    // We'll take the last number to be the trump die
    var trump = message.inlinerolls[rollsNumber-1].results.total;
    // We'll take the next to last number to be the result die
    var result = message.inlinerolls[rollsNumber-2].results.total;
    // We'll add all the remaining numbers
    var bonus = 0;
    if (rollsNumber >= 3) {
        for (var i = 0; i < rollsNumber-2; i++) {
            bonus += message.inlinerolls[i].results.total;
        }
    }

    // Has the loud flag been set? If so we'll want to print out some messages.
    var loud = (message.content.indexOf("--l") != -1);

    if (message.type == "whisper" && !loud) {
        roll_result(bonus, result, trump, "/w "+message.target_name);
        roll_result(bonus, result, trump, "/w "+message.who);
    }
    else {
        if (loud) {
            // Strip the original method of all inline rolls and print it to chat.
            strippedMessage = message.content.replace(/ \$\[\[\d*\]\]/g, "");
            strippedMessage = strippedMessage.replace(/--. /g, "");
            strippedMessage = strippedMessage.replace(/vs:/g, "vs.");
            sendChat("API", strippedMessage);
        }
        
        roll_result(bonus, result, trump);
    }
}

function parse_command(message) {
    var command;
    for (var i in COMMANDS) {
        if (message.content.indexOf("!" + COMMANDS[i]) == 0) {
            command = COMMANDS[i];
            break;
        }
    }

    if (command == undefined) {
        // No recognized command was found.
        return;
    }

    log("ROLLCOMP/ Received API " + JSON.stringify(message));

    var content = message.content.substring(command.length+1);
    content = content.trim();

    try {
        sendChat("", "[[" + content + "]] [[1d10]] [[1d10]]", function(results) {
            // Get the number of rolls
            var rollsNumber = results[0].inlinerolls.length;
            // We'll take the last number to be the trump die
            var trump = results[0].inlinerolls[rollsNumber-1].results.total;
            // We'll take the next to last number to be the result die
            var result = results[0].inlinerolls[rollsNumber-2].results.total;
            // We'll add all the remaining numbers
            var bonus = 0;
            if (rollsNumber >= 3) {
                for (var i = 0; i < rollsNumber-2; i++) {
                    bonus += results[0].inlinerolls[i].results.total;
                }
            }

            if (command.indexOf("gm") == 0) {
                roll_result(bonus, result, trump, "/w gm &{template:default} {{name=Rolling}} {{Bonus=[[" + bonus + "]]}} {{Result=[[" + result + "]]}} {{Trump=[[" + trump + "]]}}\n/w gm");
            }
            else {
                roll_result(bonus, result, trump, message.who + " &{template:default} {{name=Rolling}} {{Bonus=[[" + bonus + "]]}} {{Result=[[" + result + "]]}} {{Trump=[[" + trump + "]]}}\n");
            }
        });
    }
    catch (error) {
        log("ROLLCOMP/ Error: \"" + error + "\"");
    }
}

function roll_result(bonus, result, trump, output) {
    log("ROLLCOMP/ Result " + JSON.stringify(bonus) + " + " + JSON.stringify(result) + " vs " + JSON.stringify(trump));

    if (output == undefined) {
        output = "/direct";
    }

    var result_msg = null;

    if (result === 1 && trump === 1) {
        result_msg = "Critical Failure!";
    }
    else if (result === trump) {
        result_msg = "Trump! Total: " + (bonus + result + trump);
    }
    else {
        result_msg = "Total: " + (bonus + result);
    }

    log("ROLLCOMP/ " + result_msg);
    sendChat("API", output + " " + result_msg);
}