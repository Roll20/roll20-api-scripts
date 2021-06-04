/**
 * compile macros written in extended language to standard roll20 language
 * compilation does the following:
 * (1) remove comments // this is a comment
 * (2) concatenate multi-line commands, indicated by \ at end of line
 * (3) replace "$include scriptname" lines with the content of scriptname (after applying steps 1-3 to content)
 * (4) substitute local $function expressions
 * (5) evaluate numerical expressions
 * by Henning Koehler
 */
on("chat:message", function(msg) {
    "use strict";

    /**
     * append value to expression exp (an array of strings and numbers), combining consecutive strings
     */
    function appendExp(exp, value) {
        if ( typeof(value) === 'string' && exp.length > 0 && typeof(exp[exp.length-1]) === 'string' )
            exp[exp.length-1] += value;
        else
            exp.push(value);
    }

    /**
     * appends all values in exp2 to exp1
     */
    function concatExp(exp1, exp2) {
        for ( let x of exp2 )
            appendExp(exp1, x);
    }

    /**
     * append value to expression after attempting to parse it as float
     */
    function parseAndPush(exp, string) {
        if ( string.length > 0 ) {
            // convert to number if possible
            var nr = parseFloat(string);
            if ( isNaN(nr) ) {
                exp.push(string);
            } else
                exp.push(nr);
        }
    }

    /**
     * split given expression (an array of strings and numbers) into array of maximal tokens
     * the following constitute a valid <token>:
     * - a number
     * - a string not containing '(' or ')'
     * - a sub-expression previously enclosed in matching brackets
     * when unmatched '(' or ')' are encountered, these are treated as regular (non-bracket) characters
     * composite tokens do not include enclosing brackets
     *  e.g. tokenize([ "$hit($bab,(", 0, "-2)) AC :-)" ]) = [ "$hit", ["$bab,(", 0, "-2)"], " AC :-)" ]
     */
    function tokenize(exp) {
        var result = [];
        var current = [];
        var level = 0;
        for ( let next of exp ) {
            if ( typeof(next) === 'number' ) {
                if ( level == 0 )
                    result.push(next);
                else
                    current.push(next);
            } else {
                for ( let char of next ) {
                    if ( char == '(' ) {
                        if ( level > 0 )
                            appendExp(current, char);
                        level += 1;
                    } else if ( char == ')' ) {
                        if ( level == 0 )
                            appendExp(result, char);
                        else {
                            level -= 1;
                            if ( level == 0 ) {
                                result.push(current);
                                current = [];
                            }
                            else
                                appendExp(current, char);
                        }
                    } else {
                        if ( level == 0 )
                            appendExp(result, char);
                        else
                            appendExp(current, char);
                    }
                }
            }
        }
        // handle unmatched '('
        if ( current.length > 0 ) {
            appendExp(result, '(');
            for ( let token of tokenize(current) )
                appendExp(result, token);
        }
        return result;
    }

    /**
     * split expression args (which must not contain unmatched brackets) into sub-expressions separated by ','
     *  e.g. splitArgs(["a+", 0, ",(b,c)," 1]) = [ ["a+", 0], ["(b,c)"], [1] ]
     */
    function splitArgs(args) {
        if ( args.length == 0 )
            return [];
        var result = [];
        var current = [];
        var level = 0;
        for ( let next of args ) {
            if ( typeof(next) === 'number' ) {
                current.push(next);
            } else {
                for ( let char of next ) {
                    if ( char == ',' && level == 0 ) {
                        result.push(current);
                        current = [];
                    } else {
                        appendExp(current, char);
                        if ( char == '(' )
                            level += 1;
                        else if ( char == ')' )
                            level -= 1;
                    }
                }
            }
        }
        result.push(current);
        return result;
    }

    /**
    * substitute {param} expressions in body with their position in parameters
    *  e.g. substArgs("[[1d20+$attack{bonus}]]", ["bonus"]) = [ "[[1d20+$attack", 0, "]]" ]
    */
    function substParam(body, parameters) {
        var result = [ body ];
        for ( var pos = 0; pos < parameters.length; pos++ ) {
            var subst = [];
            for ( let section of result ) {
                if ( typeof(section) === 'string' ) {
                    // substitute current argument
                    for ( let subSection of section.split("{" + parameters[pos] + "}") ) {
                        if ( subSection )
                            subst.push(subSection);
                        subst.push(pos);
                    }
                    subst.pop();
                } else {
                    subst.push(section);
                }
            }
            result = subst;
        }
        return result;
    }

    /**
    * substitute $function calls in expression exp with definitions in environment env
    *  e.g. substFn([ "for $rolld6(", 0, ") damage" ], { rolld6: [ "[[", 0, "d6]]" ] }) = [ "for [[", 0, "d6]] damage" ]
    * brackets can be omitted => makes arity-0 functions more readable
    *  e.g. substFn([ "Hello $name." ], { name: [ "World" ] }) = [ "Hello World." ]
    */
    function substFn(exp, env) {
        var result = [];
        var tokens = tokenize(exp);
        var token = null;
        while ( token || tokens.length > 0 ) {
            if ( !token ) {
                token = tokens[0];
                tokens = tokens.slice(1);
            }
            if ( typeof(token) === 'string' ) {
                // advance to next $function expression
                var fnPos = token.indexOf('$');
                if ( fnPos == -1 ) {
                    appendExp(result, token);
                    token = null;
                } else {
                    appendExp(result, token.substr(0, fnPos));
                    token = token.substr(fnPos + 1);
                    // lookup function definition
                    var fnName = token.match(/^(\w*)(\W.*|)$/)[1];
                    token = token.substr(fnName.length);
                    var fnBody = env[fnName];
                    if ( fnBody !== undefined ) {
                        // find args
                        var args = [];
                        if ( token.length == 0 && tokens.length > 0 && tokens[0].constructor === Array ) {
                            args = splitArgs(tokens[0]);
                            tokens = tokens.slice(1);
                        }
                        // insert function body, replacing positional values with arguments
                        for ( let section of fnBody )
                            if ( typeof(section) === 'number' ) {
                                var evalArg = substFn(args[section] || [], env);
                                concatExp(result, evalArg);
                            } else
                                appendExp(result, section);
                    } else {
                        // not found => no substitution
                        appendExp(result, '$' + fnName);
                    }
                }
            } else if ( typeof(token) === 'number') {
                appendExp(result, token);
                token = null;
            } else {
                // we got token of the form '(' ... ')', but brackets are not used to delimit function arguments
                appendExp(result, "(");
                concatExp(result, substFn(token, env));
                appendExp(result, ")");
                token = null;
            }
        }
        return result;
    }

    /**
     * evaluates a string into a number, or NaN on failure
     * supports brackets, operators + - * / and functions floor, ceil
     *  e.g. evalNumber("1.5+floor(10/4)") = 3.5
     */
    function evalNumber(sExp) {
        sExp.replace(/\s/g, '');
        var tokens = [];
        var current = '';
        // handle brackets, split by operators and parse numbers
        for ( let token of tokenize([sExp]) )
            if ( typeof(token) === 'string' ) {
                // token must be a bracket-free string - split by operators
                for ( let char of token )
                    if ( "+-/*".includes(char) ) {
                        parseAndPush(tokens, current);
                        current = '';
                        tokens.push(char);
                    } else
                        current += char;
            } else {
                if ( token.length != 1 ) {
                    return NaN;
                }
                parseAndPush(tokens, current);
                current = '';
                tokens.push(evalNumber(token[0]));
            }
        parseAndPush(tokens, current);
        // evaluate unary functions
        var nextTokens = [];
        for ( let i = 0; i < tokens.length; i++ ) {
            var token = tokens[i];
            if ( typeof(token) === 'string' && !"+-/*".includes(token) ) {
                // gobble up operand - all functions are unary
                var next = i+1 < tokens.length ? tokens[++i] : '';
                if ( typeof(next) !== 'number' ) {
                    return NaN;
                }
                if ( token === 'ceil' )
                    nextTokens.push(Math.ceil(next));
                else if ( token === 'floor' )
                    nextTokens.push(Math.floor(next));
                else {
                    return NaN;
                }
            } else
                nextTokens.push(token);
        }
        tokens = nextTokens;
        // evaluate unary - operator
        // minus is considered unary if previous token did not evaluate to a number
        // iterate in reverse to allow successive unary - operators
        nextTokens = [];
        current = '';
        for ( let i = tokens.length - 1; i >= 0; i-- ) {
            var token = tokens[i];
            if ( token === '-' && (i == 0 || typeof(tokens[i-1]) !== 'number')) {
                if ( typeof(current) !== 'number' )
                    return NaN;
                current = -current;
            } else {
                if ( current !== '' )
                    nextTokens.push(current);
                current = token;
            }
        }
        if ( current !== '' )
            nextTokens.push(current);
        tokens = nextTokens.reverse();
        // evaluate * and / operators
        nextTokens = [];
        current = NaN;
        for ( let i = 0; i < tokens.length; i++ ) {
            var token = tokens[i];
            if ( typeof(token) === 'number' ) {
                if ( isNaN(current) )
                    current = token;
                else
                    return NaN;
            } else if ( "*/".includes(token) ) {
                // gobble up right operand
                var next = i+1 < tokens.length ? tokens[++i] : '';
                if ( isNaN(current) || typeof(next) !== 'number' )
                    return NaN;
                else if ( token === '*' )
                    current *= next;
                else
                    current /= next;
            } else { // must be binary operator of lower precedence
                if ( isNaN(current) )
                    return NaN;
                nextTokens.push(current);
                nextTokens.push(token);
                current = NaN;
            }
        }
        if ( !isNaN(current) )
            nextTokens.push(current);
        tokens = nextTokens;
        // evaluate + and - binary operators
        current = NaN;
        for ( let i = 0; i < tokens.length; i++ ) {
            var token = tokens[i];
            if ( typeof(token) === 'number' ) {
                if ( isNaN(current) )
                    current = token;
                else
                    return NaN;
            } else {
                // gobble up right operand
                var next = i+1 < tokens.length ? tokens[++i] : '';
                if ( isNaN(current) || typeof(next) !== 'number' )
                    return NaN;
                else if ( token === '+' )
                    current += next;
                else
                    current -= next;
            }
        }
        return current;
    }

    /**
    * substitute variable and function expressions of the form
    *  $attack = 13
    *  $roll(mod) = [[1d20+[[$attack{mod}]]+?{bonus|0}]]
    *  /me swings his axe, hitting AC $roll.
    *  /me swings again, hitting AC $roll(-5).
    * into
    *  /me swings his axe, hitting AC [[1d20+[[13]]+?{bonus|0}]].
    *  /me swings again, hitting AC [[1d20+[[13-5]]+?{bonus|0}]].
    */
    function compileAction(action) {
        var env = {};
        var result = [];
        for ( let line of action.split("\n") ) {
            line = line.trim();
            var matches = line.match(/^\$(\w+)(\(\w+(,\w+)*\)|)\s*(:?=)\s*(.*)$/);
            if ( matches ) {
                // we have a local function definition
                var fnName = matches[1];
                var fnParams = matches[2] ? matches[2].substr(1, matches[2].length-2).split(',') : [];
                var fnAssign = matches[4]; // matches[3] is last match for (,\w+) 
                var fnBody = matches[5];
                // map parameters in body to positional values
                var bodyWithParams = substParam(fnBody, fnParams);
                // compile function body
                var bodyFinal = substFn(bodyWithParams, env);
                // evaluate function body
                if ( fnAssign === ":=" ) {
                    var nr = (bodyFinal.length == 1 && typeof(bodyFinal[0]) === 'string') ? evalNumber(bodyFinal[0]) : NaN;
                    bodyFinal = [ nr.toString() ];
                }
                // add function definition to environment
                env[fnName] = bodyFinal;
                //log("$" + fnName + " := " + JSON.stringify(bodyFinal).replace(/"/g, "'"));
            } else {
                var compiled = substFn(line, env)[0];
                if ( compiled )
                    result.push(compiled);
            }
        }
        return result.join("\n");
    }

    /**
     * remove comments and concatenate multi-line commands
     */
    function prepareAction(action) {
        // remove comments
        var preparedAction = (action + '\n').replace(/\/\/[^\n]*\n/g, '\n');
        // concatenate lines ending with "\" with follow-up line
        // leading spaces on the follow-up line are trimmed
        return preparedAction.replace(/\\\n\s*/g, '');
    }

    /**
     * substitude "$include macroname" lines with content of macro
     * content of macro is prepared prior to substitution, which includes $include substitutions
     * included macros must be owned by playerId, and not occur in alreadyIncluded
     * array alreadyIncluded will be updated with the names of included macros
     */
    function handleIncludes(action, playerId, alreadyIncluded) {
        var result = [];
        for ( let line of action.split("\n") ) {
            line = line.trim();
            var matches = line.match(/^\$include\s+(\w+)\s*$/);
            if ( matches ) {
                var macroName = matches[1];
                // silently skip already included macros
                if ( alreadyIncluded.includes(macroName) )
                    continue;
                var includeFound = findObjs({ type: 'macro', _playerid: playerId, name: macroName });
                if ( includeFound.length == 1 ) {
                    // tracking already included macros prevents circular includes
                    alreadyIncluded.push(macroName);
                    var includedAction = includeFound[0].get('action');
                    // need to prepare and handle includes, as this won't be done later
                    includedAction = prepareAction(includedAction);
                    includedAction = handleIncludes(includedAction, playerId, alreadyIncluded);
                    result.push(includedAction);
                    continue;
                }
                // if not found, just keep original $include line
            }
            result.push(line);
        }
        return result.join("\n");
    }

    /**
    * compile given macro into macro of given name
    */
    function compile(inputMacro, outputName) {
        if ( !outputName )
            outputName = '_' + inputMacro.get('name') + '_';

        var playerId = inputMacro.get('_playerid');
        var playerName = getObj('player', playerId).get("_displayname");
        var macroName = inputMacro.get('name');
        log(playerName + " compiles macro " + macroName + " into " + outputName);

        // remove comments and concatenate multi-line commands
        var action = prepareAction(inputMacro.get('action'));
        // handle $include directives
        var includedAction = handleIncludes(action, playerId, [macroName]);
        // handle local variable definition & substitution
        var compiledAction = compileAction(includedAction);

        // output to new (or old) macro
        var outputFound = findObjs({ type: 'macro', _playerid: playerId, name: outputName });
        if ( outputFound.length == 0 ) {
            createObj('macro', {
                _playerid: playerId,
                name: outputName,
                action: compiledAction,
            });
        } else {
            outputFound[0].set('action', compiledAction);
        }
    }

    /**
    * compile all source macros belonging to given player
    */
    function compileAll(playerId) {
        var inputFound = findObjs({ type: 'macro', _playerid: playerId });
        for ( let inputMacro of inputFound ) {
            var name = inputMacro.get('name');
            if ( name && name[0] != '_' ) {
                // skip sources that won't be affected by compile
                var action = inputMacro.get('action');
                if ( action.includes("\/\/") || action.includes("\\\n") || action.includes("$") )
                    compile(inputMacro);
            }
        }
    }

    function notify(who, msg) {
        sendChat("compile.js", "/w " + who + " " + msg, null, { noarchive: true });
    }

    const prefix = "!compile";
    if ( msg.type != "api" || msg.content.indexOf(prefix) != 0 )
        return;

    // parse parameters
    var matches = msg.content.substr(prefix.length).match(/^\s+([\w-]+)(\s+[\w-]+|)\s*$/);
    if ( !matches ) {
        notify(msg.who, "Syntax: !compile [input|input output|all]");
        return;
    }
    var inputName = matches[1].trim();
    var outputName = matches[2].trim();

    if ( inputName == 'all' && !outputName ) {
        compileAll(msg.playerid);
    } else {
        // identify input macro - must exist and be unique
        var inputFound = findObjs({ type: 'macro', _playerid: msg.playerid, name: inputName });
        if ( inputFound.length != 1 ) {
            notify(msg.who, "found " + inputFound.length + " macros matching " + inputName);
            return;
        }
        compile(inputFound[0], outputName);
    }
    notify(msg.who, "done");
});
