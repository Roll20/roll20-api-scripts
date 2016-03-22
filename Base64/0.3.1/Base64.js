// Github:   https://github.com/shdwjk/Roll20API/blob/master/Base64/Base64.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron
// modified from:  http://www.webtoolkit.info/
 
var Base64 = Base64 || (function () {
	'use strict';

    var version = '0.3.1',
        lastUpdate = 1427604235,
	    keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	checkInstall = function() {
        log('-=> Base64 v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
	},
 
    // private method for UTF-8 encoding
    utf8_encode = function (string) {
		var utftext = '',
			n, c1;
 
        for (n = 0; n < string.length; n++) {
 
            c1 = string.charCodeAt(n);
 
            if (c1 < 128) {
                utftext += String.fromCharCode(c1);
            }
            else if((c1 > 127) && (c1 < 2048)) {
                utftext += String.fromCharCode((c1 >> 6) | 192);
                utftext += String.fromCharCode((c1 & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c1 >> 12) | 224);
                utftext += String.fromCharCode(((c1 >> 6) & 63) | 128);
                utftext += String.fromCharCode((c1 & 63) | 128);
            }
 
        }
 
        return utftext;
    },
 
    // private method for UTF-8 decoding
    utf8_decode = function (utftext) {
        var string = '',
            i = 0,
			c1 = 0,
			c2 = 0,
			c3 = 0;
 
        while ( i < utftext.length ) {
 
            c1 = utftext.charCodeAt(i);
 
            if (c1 < 128) {
                string += String.fromCharCode(c1);
                i++;
            }
            else if((c1 > 191) && (c1 < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
 
        }
 
        return string;
    },

    encode = function (input) {
        var output = '',
            chr1, chr2, chr3, enc1, enc2, enc3, enc4,
            i = 0;
 
        input = utf8_encode(input);
 
        while (i < input.length) {
 
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
 
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
 
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
 
            output = output +
            keyStr.charAt(enc1) + keyStr.charAt(enc2) +
            keyStr.charAt(enc3) + keyStr.charAt(enc4);
 
        }
 
        return output;
    },
 
    // public method for decoding
    decode = function (input) {
        var output = '',
            chr1, chr2, chr3,
            enc1, enc2, enc3, enc4,
            i = 0;
 
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
        while (i < input.length) {
 
            enc1 = keyStr.indexOf(input.charAt(i++));
            enc2 = keyStr.indexOf(input.charAt(i++));
            enc3 = keyStr.indexOf(input.charAt(i++));
            enc4 = keyStr.indexOf(input.charAt(i++));
 
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
 
            output = output + String.fromCharCode(chr1);
 
            if (enc3 !== 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 !== 64) {
                output = output + String.fromCharCode(chr3);
            }
 
        }
 
        output = utf8_decode(output);
 
        return output;
 
    }
 
	;

	return {
		encode: encode,
		decode: decode,
		CheckInstall: checkInstall
	};
 
}());

on("ready",function(){
	'use strict';

	Base64.CheckInstall();
});
