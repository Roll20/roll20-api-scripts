var ExExp = ExExp || {
    parseExpression: function(s, until){
	// constants
	var BINARY_PRECEDENCE = {
	    '?': 1, ':': 2,
	    '||': 3, '&&': 4,
	    '|': 5, '^': 6, '&': 7,
	    '=': 8, '!=': 8,
	    '>=': 9, '>': 9, '<': 9, '<=': 9,
	    '<<': 10, '>>': 10,
	    '+': 11, '-': 11,
	    '*': 12, '/': 12, '%': 12,
	    '**': 14,
	    't': 98, 'd': 99
	};
	var UNARY_PRECEDENCE = {'!': 13, '~': 13, '-': 13};
	var CLOSERS = {'(': ")", '{': "}"};

	// local variables
	var operators = [{'precedence': 0}], operands = [];

	// helper functions
	function getToken(s){
	    if (!s){ return s; }

	    var m;

	    function retVal(tokType, matchObj){
		return {'type': tokType, 'text': matchObj[0], 'match': matchObj};
	    }

	    m = s.match(/^\s+/);
	    if (m){ return retVal("whitespace", m); }
	    m = s.match(/^[({]/);
	    if (m){ return retVal("opengroup", m); }
	    m = s.match(/^[)}]/);
	    if (m){ return retVal("closegroup", m); }
	    m = s.match(/^((\d+(\.\d+)?)|(\.\d+))/);
	    if (m){ return retVal("number", m); }
	    m = s.match(/^['"]/);
	    if (m){ return retVal("quote", m); }
	    m = s.match(/^((\|\|)|(&&)|(!=)|(>=)|(<=)|(<<)|(>>)|(\*\*)|[?:|^&=><%!~])/);
	    if (m){ return retVal("extoperator", m); }
	    m = s.match(/^[-+*/td]/);
	    if (m){ return retVal("baseoperator", m); }
	    m = s.match(/^\[([^\]]+)\]/);
	    if (m){ return retVal("label", m); }
	    m = s.match(/^\${([^'"($}][^}]*)}/);
	    if (m){ return retVal("variable", m); }
	    m = s.match(/^\${/);
	    if (m){ return retVal("openvariable", m); }

	    return {'type': "raw", 'text': s.charAt(0)};
	}

	function popToken(state){
	    state.tok = getToken(state.s);
	    if (state.tok){
		state.s = state.s.substring(state.tok.text.length);
	    }
	    return state;
	}

	function popString(state, delim){
	    var i = -1, j = i;
	    // find first index of delim not preceeded by an odd number of backslashes
	    while (((i - j) & 1) == 0){
		i = state.s.indexOf(delim, i + 1);
		if (i < 0){ return; }
		j = i - 1;
		while ((j >= 0) && (state.s.charAt(j) == '\\')){ j--; }
	    }
	    // unescape string to be returned
	    function replaceEscapes(s){
		return s.replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t").replace(/\\/g, "");
	    }
	    var retval = state.s.substring(0, i).split("\\\\").map(replaceEscapes).join("\\");
	    // point state delim, then pop off the delimiter token
	    state.s = state.s.substring(i);
	    popToken(state);
	    return retval;
	}

	function popOperator(){
	    var op = operators.pop();
	    var right = operands.pop();
	    if (op.unary){
		operands.push({'type': (op.type == "baseoperator" ? "unop" : "unopex"),
				'datatype': right.datatype,
				'operator': op.text, 'operand': right});
		return;
	    }
	    var left = operands.pop();
	    if (op.text != ":"){
		var datatype;
		if ((op.text == "d") || (op.text == "t")){ datatype = "number"; }
		else if (left.datatype == right.datatype){ datatype = left.datatype; }
		else if ((left.datatype == "string") || (right.datatype == "string")){ datatype = "string"; }
		operands.push({'type': (op.type == "baseoperator" ? "binop" : "binopex"),
				'datatype': datatype,
				'operator': op.text, 'left': left, 'right': right,
				'mods': op.mods, 'label': op.label});
		return;
	    }
	    op = operators.pop();
	    if (op.text != "?"){ return "Error: Expected ? but got " + op.text; }
	    var cond = operands.pop();
	    operands.push({'type': "cond", 'cond': cond, 'left': left, 'right': right,
			    'datatype': (left.datatype == right.datatype ? left.datatype : undefined)});
	}

	function pushOperator(op){
	    var err;
	    op.precedence = (op.unary ? UNARY_PRECEDENCE[op.text] : BINARY_PRECEDENCE[op.text]) || 0;
	    while (operators[operators.length - 1].precedence >= op.precedence){
		err = popOperator();
		if (err){ return err; }
	    }
	    operators.push(op);
	}

	function parseHelper(){
	    var err;

	    popToken(s);
	    if (!s.tok){ return "Error: Unrecognized token: " + s.s.split(" ", 1)[0]; }
	    while (s.tok.type == "whitespace"){
		popToken(s);
		if (!s.tok){ return "Error: Unrecognized token: " + s.s.split(" ", 1)[0]; }
	    }
	    switch (s.tok.type){
	    case "number":
		operands.push({'type': "number", 'datatype': "number", 'value': parseFloat(s.tok.text)});
		return;
	    case "variable":
		operands.push({'type': "variable", 'value': s.tok.match[1]});
		return;
	    case "quote":
		var str = popString(s, s.tok.text);
		if (typeof(str) != typeof("")){
		    return "Error: Unterminated string";
		}
		operands.push({'type': "string", 'datatype': "string", 'value': str});
		return;
	    case "opengroup":
		var opener = s.tok.text, closer = CLOSERS[opener];
		operands.push(ExExp.parseExpression(s, closer));
		if (s.tok.text != closer){
		    return "Error: Expected '" + closer + "' to close '" + opener + "', but got '" + s.tok.text + "'";
		}
		return;
	    case "openvariable":
		var varExp = ExExp.parseExpression(s, "}");
		if (s.tok.text != "}"){
		    return "Error: Expected '}' to close '${', but got '" + s.tok.text + "'";
		}
		operands.push({'type': "variable", 'value': varExp});
		return;
	    case "extoperator":
	    case "baseoperator":
		if (!UNARY_PRECEDENCE[s.tok.text]){ return "Error: " + s.tok.text + " is not a unary operator"; }
		s.tok.unary = true;
		err = pushOperator(s.tok);
		if (err){ return err; }
		return parseHelper();
	    }
	    return "Error: Unrecognized token: " + s.tok.text;
	}

	// if we were given a string, construct a state object
	if (typeof(s) == typeof("")){
	    s = {'s': s};
	}

	// push operators and operands to their respective stacks, building sub-ASTs in the operand stack as needed
	var err = parseHelper();
	if (err){ return err; }
	for (popToken(s); (s.tok) && (s.tok.text != until) && ((until) || (s.tok.type != "raw")); popToken(s)){
	    switch(s.tok.type){
	    case "extoperator":
	    case "baseoperator":
		rollOperator = (s.tok.text == "d" ? s.tok : null);
		err = pushOperator(s.tok);
		if (err){ return err; }
		if ((rollOperator) && (s.s.charAt(0) == 'F')){
		    operands.push({'type': "rollspec", 'value': "F"})
		    s.s = s.s.substring(1);
		}
		else if (s.tok.text == "t"){
		    if (s.s.charAt(0) != '['){ return "Error: 't' operator requires '[table]' argument"; }
		    var m = s.s.match(/^\[([^'"$(\]][^\]]*)\]/);
		    var tableExp;
		    if (m){
			tableExp = m[1];
			s.s = s.s.substring(m[0].length);
		    }
		    else{
			s.s = s.s.substring(1);
			tableExp = ExExp.parseExpression(s, "]");
			if (s.tok.text != "]"){
			    return "Error: Expected ']' to close 't[', but got '" + s.tok.text + "'";
			}
		    }
		    operands.push({'type': "tablename", 'value': tableExp});
		}
		else{
		    err = parseHelper();
		    if (err){ return err; }
		}
		if (rollOperator){
		    var m = s.s.match(/^[acdfhkloprs0-9<=>!]+/);
		    if (m){
			rollOperator.mods = m[0];
			s.s = s.s.substring(m[0].length)
		    }
		}
		break;
	    case "label":
		if ((operators.length > 0) && (operators[operators.length - 1].text == "d")){
		    // set label on "d" operator instead of operand (e.g. "1d6[foo]" is "(1d6)[foo]", not "1d(6[foo])")
		    operators[operators.length - 1].label = s.tok.match[1];
		    break;
		}
		var operand = operands.pop();
		if (operand){
		    operand.label = s.tok.match[1];
		    operands.push(operand);
		}
		break;
	    }
	}
	// no more input; collapse remaining operators and operands into a single AST
	while (operators.length > 1){
	    err = popOperator();
	    if (err){ return err; }
	}

	return operands.pop();
    },

    write: function(s, who, style, from){
	if (who){
	    who = "/w " + who.split(" ", 1)[0] + " ";
	}
	sendChat(from, who + s.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>"));
    },

    sendCommand: function(chunks, asts, evalResults, inline, from, labels){
	// constants
	var BINARY_FUNCTIONS = {
	    '||':	function(x, y){ return x || y; },
	    '&&':	function(x, y){ return x && y; },
	    '|':	function(x, y){ return x | y; },
	    '^':	function(x, y){ return x ^ y; },
	    '&':	function(x, y){ return x & y; },
	    '=':	function(x, y){ return x == y; },
	    '!=':	function(x, y){ return x != y; },
	    '>=':	function(x, y){ return x >= y; },
	    '>':	function(x, y){ return x > y; },
	    '<':	function(x, y){ return x < y; },
	    '<=':	function(x, y){ return x <= y; },
	    '<<':	function(x, y){ return x << y; },
	    '>>':	function(x, y){ return x >> y; },
	    '+':	function(x, y){ return x + y; },
	    '-':	function(x, y){ return x - y; },
	    '*':	function(x, y){ return x * y; },
	    '/':	function(x, y){ return x / y; },
	    '%':	function(x, y){ return x % y; },
	    '**':	Math.pow,
	    'd':	function(x, y){
			    var retval = 0;
			    for (var i = 0; i < x; i++){ retval += randomInteger(y); }
			    return retval;
			}
	};
	var UNARY_FUNCTIONS = {
	    '!':	function(x){ return !x; },
	    '~':	function(x){ return ~x; },
	    '-':	function(x){ return -x; }
	};


	// local variables
	var references = {}, unevalRefs = [], evalReqs = [];

	// helper functions
	function lazyEval(t, labels, references, unevalRefs, evalReqs, force){
	    var x, y;

	    if (t.label){ labels[t.label] = t; }

	    switch(t.type){
	    case "number":
	    case "rollspec":
		t.baseValid = true;
		// fall through
	    case "string":
		return t;
	    case "tablename":
		if (typeof(t.value) != typeof("")){
		    x = lazyEval(t.value, labels, references, unevalRefs, evalReqs, true);
		    if (typeof(x) == typeof("")){ return x; } // error
		    if (x.type == "number"){
			// number node; coerce to string
			x.value = "" + x.value;
			x.type = "string"
		    }
		    if (x.type != "string"){
			// unable to fully evaluate table name
			if (t.baseValid){ t.baseValid = false; }
			unevalRefs.push(t.value);
			return t;
		    }
		    // successfully evaluated table name
		    t.value = x.value;
		}
		// if we got here, t.value is the name of a rollable table
		t.baseValid = true;
		return t;
	    case "unop":
	    case "unopex":
		force = force || (t.type != "unop");
		x = lazyEval(t.operand, labels, references, unevalRefs, evalReqs, force);
		if (typeof(x) == typeof("")){ return x; } // error
		if (force){
		    if (x.type != "number"){
			// unable to fully evaluate operand
			if (t.baseValid){ t.baseValid = false; }
			return t;
		    }
		    // successfully evaluated operand
		    t.type = "number";
		    t.datatype = "number";
		    t.value = UNARY_FUNCTIONS[t.operator](x.value);
		    delete t.operator;
		    if (t.operand.label){ labels[t.operand.label] = x; }
		    delete t.operand;
		    t.baseValid = true;
		}
		else{ t.baseValid = x.baseValid; }
		return t;
	    case "binop":
	    case "binopex":
		force = force || (t.type != "binop") || (t.left.datatype == "string") || (t.right.datatype == "string");
		var forceSubtrees = force || (t.operator == "d") || (t.operator == "t");
		x = lazyEval(t.left, labels, references, unevalRefs, evalReqs, forceSubtrees);
		if (typeof(x) == typeof("")){ return x; } // error
		y = lazyEval(t.right, labels, references, unevalRefs, evalReqs, forceSubtrees);
		if (typeof(y) == typeof("")){ return y; } // error
		if (force){
		    if ((x.type != "number") && (x.type != "string")){
			// unable to fully evaluate left operand
			if (t.baseValid){ t.baseValid = false; }
			return t;
		    }
		    if ((y.type != "number") && (y.type != "string") && (y.type != "rollspec") && (y.type != "tablename")){
			// unable to fully evaluate right operand
			if (t.baseValid){ t.baseValid = false; }
			return t;
		    }
		    if ((y.type == "rollspec") && (t.operator != "d")){
			return "Rollspec operand is only compatible with 'd' operator";
		    }
		    if ((t.operator == "t") && (y.type != "tablename")){
			return "'t' operator requires tablename operand";
		    }
		    // successfully evaluated both operands
		    if ((t.operator == "t") || ((t.operator == "d") && (t.mods))){
			// operator is rollable table or is roll with mods; must submit to base system for evaluation
			evalReqs.push(t);
			return t;
		    }
		    t.value = BINARY_FUNCTIONS[t.operator](x.value, y.value);
		    delete t.operator;
		    if (t.left.label){ labels[t.left.label] = x; }
		    delete t.left;
		    if (t.right.label){ labels[t.right.label] = y; }
		    delete t.right;
		    t.type = (typeof(t.value) == typeof("") ? "string" : "number");
		    t.datatype = t.type;
		    t.baseValid = (t.datatype == "number");
		}
		else if ((x.datatype == "number") && (y.datatype == "number")){
		    t.datatype = "number";
		    t.baseValid = true;
		}
		return t;
	    case "cond":
		x = lazyEval(t.cond, labels, references, unevalRefs, evalReqs, true);
		if (typeof(x) == typeof("")){ return x; } // error
		if ((x.type != "number") && (x.type != "string")){
		    // unable to fully evaluate condition
		    t.baseValid = false;
		    return t;
		}
		// successfully evaluated condition; replace t with t.left or t.right as appropriate
		y = (x.value ? t.left : t.right);
		if (t.cond.label){ labels[t.cond.label] = x; }
		delete t.cond;
		delete t.left;
		delete t.right;
		for (var k in y){
		    t[k] = y[k];
		}
		return lazyEval(t, labels, references, unevalRefs, evalReqs, force);
	    case "variable":
		if (typeof(t.value) != typeof("")){
		    x = lazyEval(t.value, labels, references, unevalRefs, evalReqs, true);
		    if (typeof(x) == typeof("")){ return x; } // error
		    if (x.type == "number"){
			// number node; coerce to string
			x.value = "" + x.value;
			x.type = "string"
		    }
		    if (x.type != "string"){
			// unable to fully evaluate variable name
			if (t.baseValid){ t.baseValid = false; }
			unevalRefs.push(t.value);
			return t;
		    }
		    // successfully evaluated variable name
		    t.value = x.value;
		}
		// if we got here, t.value is the name of a variable
		if ((labels[t.value]) && ((labels[t.value].type == "string") || (labels[t.value].type == "number"))){
		    // variable exists and has been fully evaluated
		    t.type = labels[t.value].type;
		    t.datatype = labels[t.value].datatype;
		    t.baseValid = labels[t.value].baseValid;
		    t.value = labels[t.value].value;
		}
		else{
		    // variable not yet defined or not yet fully evaluated
		    if (!references[t.value]){ references[t.value] = []; }
		    references[t.value].push(t);
		    if (t.baseValid){ t.baseValid = false; }
		}
		return t;
	    default:
		return "Unknown node type: " + t.type;
	    }
	}

	function hasUnevaluatedLabels(t){
	    // base types: fully evaluated
	    if ((t.type == "number") || (t.type == "string") || (t.type == "rollspec")){ return false; }

	    // if we got here, node is unevaluated
	    if (t.label){ return true; }

	    // node has no label; check children
	    switch(t.type){
	    case "tablename":
	    case "variable":
		if (typeof(t.value) == typeof("")){ return false; }
		return hasUnevaluatedLabels(t.value);
	    case "unop":
	    case "unopex":
		return hasUnevaluatedLabels(t.operand);
	    case "cond":
		if (hasUnevaluatedLabels(t.cond)){ return true; }
		// fall through
	    case "binop":
	    case "binopex":
		if (hasUnevaluatedLabels(t.left)){ return true; }
		return hasUnevaluatedLabels(t.right);
	    }
	}

	function flattenAST(t){
	    var retval;

	    switch(t.type){
	    case "number":
	    case "rollspec":
		retval = t.value;
		break;
	    case "tablename":
		retval = "[" + t.value + "]";
		break;
	    case "unop":
		retval = "(" + t.operator + flattenAST(t.operand) + ")";
		break;
	    case "binop":
		retval = "(" + flattenAST(t.left) + t.operator + flattenAST(t.right) + (t.mods || "") + ")";
		if ((t.label) && (t.operator == "d")){ retval += "[" + t.label + "]"; }
		break;
	    default:
		return "Unknown node type: " + t.type;
	    }

	    return retval;
	}

	function astToCmd(t, inline){
	    if (t.type == "string"){ return t.value; }
	    var retval = flattenAST(t);
	    if (inline){ retval = "[[" + retval + "]]"; }
	    else if (t.type == "number"){ retval = "1d0 + " + retval; }
	    return retval;
	}

	function reportError(err){
	    ExExp.write("Error: " + err, from);
	}

	// substitute in results of base evaluation
	for (var i = 0; i < evalResults.length; i++){
	    var t = evalResults[i][0];
	    delete t.operator;
	    delete t.left;
	    delete t.right;
	    t.type = "number";
	    t.datatype = "number";
	    t.value = evalResults[i][1];
	    t.baseValid = true;
	}

	// traverse ASTs, collapsing as much as possible
	for (var i = 0; i < asts.length; i++){
	    if (asts[i].baseValid){ continue; } // can be handled by base expression evaluator
	    if ((asts[i].type == "string") || (asts[i].type == "number")){ continue; } // tree is fully evaluated
	    var err = lazyEval(asts[i], labels, references, unevalRefs, evalReqs, false);
	    if (typeof(err) == typeof("")){ return reportError(err); }
	}

	// do variable substitution; repeat until we don't make any more progress
	var doSubstitution = true;
	while (doSubstitution){
	    doSubstitution = false;
	    // substitute in values for variables for which we already have names
	    for (var label in references){
		if (!labels[label]){
		    return reportError("Variable '" + label + "' not defined");
		}
		if ((labels[label].type != "string") && (labels[label].type != "number")){
		    // variable exists but not yet evaluated; try to evaluate
		    var err = lazyEval(labels[label], labels, references, unevalRefs, evalReqs, true);
		    if (typeof(err) == typeof("")){ return reportError(err); }
		}
		if ((labels[label].type == "string") || (labels[label].type == "number")){
		    // variable fully evaluated; substitute it in
		    for (var i = 0; i < references[label].length; i++){
			references[label][i].type = labels[label].type;
			references[label][i].datatype = labels[label].datatype;
			references[label][i].value = labels[label].value;
			references[label][i].baseValid = labels[label].baseValid;
		    }
		    delete references[label];
		    doSubstitution = true;
		}
	    }
	    // try to get names for variables and tables with unevaluated names
	    var newUneval = [];
	    while (unevalRefs.length > 0){
		var r = lazyEval(unevalRefs.shift(), labels, references, unevalRefs, evalReqs, true);
		if (typeof(r) == typeof("")){ return reportError(err); }
		if ((r.type == "string") || (r.type == "number")){ doSubstitution = true; }
		else{ newUneval.push(r); }
	    }
	    unevalRefs = newUneval;
	}

	// flatten fully evaluated ASTs into strings and splice into chunks
	for (var i = asts.length - 1; i >= 0; i--){
	    if ((!asts[i].baseValid) && (asts[i].type != "number") && (asts[i].type != "string")){ continue; }
	    if ((unevalRefs.length > 0) & (hasUnevaluatedLabels(asts[i]))){ continue; }
	    chunks.splice(i, 2, (chunks[i] || "") + astToCmd(asts.splice(i, 1)[0], inline) + (chunks[i + 1] || ""));
	}

	if (evalReqs.length > 0){
	    // need to submit some expressions to the base evaluator; recurse via sendChat callback
	    var cmd = evalReqs.map(astToInline).join(" ");
	    var evalRecurse = function(msg){
		var evalResults = [];
		for (var i = 0; i < evalReqs.length; i++){
		    evalResults.push([evalReqs[i], msg.inlinerolls[i].results.total]);
		}
		ExExp.sendCommand(chunks, asts, evalResults, inline, from, labels);
	    };
	    sendChat(from, cmd, evalRecurse);
	}
	if (asts.length > 0){
	    // need to finish evaluating some ASTs; recurse directly
	    return ExExp.sendCommand(chunks, asts, [], inline, from, labels)
	}
	// if we got here, we're done evaluating everything; submit results via sendChat
	sendChat(from, chunks.join(""));
    },

    showHelp: function(who){
	var helpMsg = "";
	helpMsg += "Usage: !exroll command\n";
	helpMsg += "  or:  !extend command\n";
	helpMsg += "The first form acts as &quot;&#47;roll command&quot; with extended expression syntax.\n";
	helpMsg += "In the second form, expressions enclosed in backticks (`) will be treated as inline rolls.\n";
	ExExp.write(helpMsg, who, "", "ExExp");
	helpMsg = "Extended Operators:\n";
	helpMsg += "Unary:\n";
	helpMsg += "  !x            Logical NOT\n";
	helpMsg += "  ~x            Bitwise NOT\n";
	helpMsg += "  -x            Negation\n";
	helpMsg += "Binary:\n";
	helpMsg += "  x ** y        Exponentiation\n";
	helpMsg += "  x * y         Multiplication\n";
	helpMsg += "  x / y         Division\n";
	helpMsg += "  x % y         Modulus\n";
	helpMsg += "  x + y         Addition\n";
	helpMsg += "  x - y         Subtraction\n";
	helpMsg += "  x << y        Left shift\n";
	helpMsg += "  x >> y        Right shift\n";
	helpMsg += "  x >= y        Comparison (greater than or equal)\n";
	helpMsg += "  x > y         Comparison (strictly greater than)\n";
	helpMsg += "  x < y         Comparison (strictly less than)\n";
	helpMsg += "  x <= y        Comparison (less than or equal)\n";
	helpMsg += "  x = y         Equality\n";
	helpMsg += "  x != y        Inequality\n";
	helpMsg += "  x & y         Bitwise AND\n";
	helpMsg += "  x ^ y         Bitwise XOR\n";
	helpMsg += "  x | y         Bitwise OR\n";
	helpMsg += "  x && y        Logical AND\n";
	helpMsg += "  x || y        Logical OR\n";
	helpMsg += "Ternary:\n";
	helpMsg += "  x ? y : z     Conditional evaluation\n";
	helpMsg += "Additional Syntax:\n";
	helpMsg += "  exp[label]    Apply label to preceeding expression for later reference\n";
	helpMsg += "  ${label}      Substitute in value of referenced expression\n";
	ExExp.write(helpMsg, who, "font-size: small; font-family: monospace", "ExExp");
    },

    handleExExpMessage: function(tokens, msg){
	if ((tokens.length < 2) || (tokens[1] == "-h") || (tokens[1] == "--help")){
	    return ExExp.showHelp(msg.who);
	}

	function fixupCommand(cmd, inlineRolls){
	    function replaceInlines(s){
		if (!inlineRolls){ return s; }
		var i = parseInt(s.substring(3, s.length - 2));
		if ((i < 0) || (i >= inlineRolls.length) || (!inlineRolls[i]) || (!inlineRolls[i]['expression'])){
		    return s;
		}
		return "[[" + inlineRolls[i]['expression'] + "]]";
	    }
	    return cmd.replace(/\$\[\[\d+\]\]/g, replaceInlines);
	}

	var chunks = [], asts = [], cmd = msg.content.substring(tokens[0].length).replace(/^\s+/, "");
	if (msg.rolltemplate){
	    cmd = "&{template:" + msg.rolltemplate + "} " + cmd;
	}
	var state = {'s': fixupCommand(cmd, msg.inlinerolls || [])};
	var inline;

	if (tokens[0] == "!exroll"){
	    inline = false;
	    chunks.push("/roll ");
	    asts.push(ExExp.parseExpression(state, null));
	    state.s = " " + ((state.tok || {'text': ""}).text || "") + state.s;
	}
	else{
	    inline = true;
	    for (var i = state.s.indexOf('`'); i >= 0; i = state.s.indexOf('`')){
		chunks.push(state.s.substring(0, i));
		state.s = state.s.substring(i + 1);
		asts.push(ExExp.parseExpression(state, '`'));
	    }
	}
	chunks.push(state.s);
	ExExp.sendCommand(chunks, asts, [], inline, msg.who, {});
    },

    handleChatMessage: function(msg){
	if (msg.type != "api"){ return; }
	if ((msg.content.indexOf("!exroll") != 0) && (msg.content.indexOf("!extend") != 0)){ return; }

	return ExExp.handleExExpMessage(msg.content.split(" "), msg);
    },

    registerExExp: function(){
	if ((typeof(Shell) != "undefined") && (Shell) && (Shell.registerCommand)){
	    Shell.registerCommand("!exroll", "!exroll command", "/roll command with extended expression syntax", ExExp.handleExExpMessage);
	    Shell.permissionCommand(["!shell-permission", "add", "!exroll"], {'who': "gm"});
	    Shell.registerCommand("!extend", "!extend command", "Chat command with extended inline expression syntax", ExExp.handleExExpMessage);
	    Shell.permissionCommand(["!shell-permission", "add", "!extend"], {'who': "gm"});
	    if (Shell.write){
		ExExp.write = Shell.write;
	    }
	}
	else{
	    on("chat:message", ExExp.handleChatMessage);
	}
    }
};

on("ready", function(){ ExExp.registerExExp(); });
