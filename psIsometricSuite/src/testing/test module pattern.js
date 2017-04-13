// test module pattern



var module1 = module1 || (function module1() {
	"use strict";

	var innerFunction = function(passedString) {
		return passedString;
	};
	

	
	return { // expose functions to outside world
		innerFunction: innerFunction
	};

}());


var module2 = module2 || (function module2() {
	"use strict";
	
	var begin = function() {
		var scope = "module2";
		var testInterModuleFunctions = module1.innerFunction;
		log( testInterModuleFunctions("passed") );

		
	};

	return {
		begin: begin
	};

}());


on('ready', module2.begin );

