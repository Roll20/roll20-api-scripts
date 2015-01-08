/**
 * Splits a string into arguments using some separator. If no separator is
 * given, whitespace will be used. Most importantly, quotes in the original
 * string will allow you to group delimited tokens. Single and double quotes
 * can be nested one level.
 * 
 * As a convenience, this function has been added to the String prototype,
 * letting you treat it like a function of the string object.  
 * 
 * Example:

on('chat:message', function(msg) {
    var command, params;
    
    params = msg.content.splitArgs();
    command = params.shift().substring(1);
    
    // msg.content: !command with parameters, "including 'with quotes'"
    // command: command
    // params: ["with", "parameters,", "including 'with quotes'"]
});     
 */
var bshields = bshields || {};
bshields.splitArgs = (function() {
    'use strict';
    
    var version = 1.0;
    
    function splitArgs(input, separator) {
        var singleQuoteOpen = false,
            doubleQuoteOpen = false,
            tokenBuffer = [],
            ret = [],
            arr = input.split(''),
            element, i, matches;
        separator = separator || /\s/g;
        
        for (i = 0; i < arr.length; i++) {
            element = arr[i];
            matches = element.match(separator);
            if (element === '\'') {
                if (!doubleQuoteOpen) {
                    singleQuoteOpen = !singleQuoteOpen;
                    continue;
                }
            } else if (element === '"') {
                if (!singleQuoteOpen) {
                    doubleQuoteOpen = !doubleQuoteOpen;
                    continue;
                }
            }
            
            if (!singleQuoteOpen && !doubleQuoteOpen) {
                if (matches) {
                    if (tokenBuffer && tokenBuffer.length > 0) {
                        ret.push(tokenBuffer.join(''));
                        tokenBuffer = [];
                    }
                } else {
                    tokenBuffer.push(element);
                }
            } else if (singleQuoteOpen || doubleQuoteOpen) {
                tokenBuffer.push(element);
            }
        }
        if (tokenBuffer && tokenBuffer.length > 0) {
            ret.push(tokenBuffer.join(''));
        }
        
        return ret;
    }
    
    return splitArgs;
}());

String.prototype.splitArgs = String.prototype.splitArgs || function(separator) {
    return bshields.splitArgs(this, separator);
};