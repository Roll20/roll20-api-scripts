// Github:   https://github.com/shdwjk/Roll20API/blob/master/Base64/Base64.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron
// modified from:  http://www.webtoolkit.info/

const Base64 = (() => { // eslint-disable-line no-unused-vars
    const version = '0.3.2';
    const lastUpdate = 1576507905;
    const keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    const checkInstall = () => {
        log('-=> Base64 v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
    };

    // private method for UTF-8 encoding
    const utf8_encode = (string) => {
        let utftext = '';

        for (let n = 0; n < string.length; n++) {

            let c1 = string.charCodeAt(n);

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
    };

    // private method for UTF-8 decoding
    const utf8_decode = (utftext) => {
        let string = '';
        let i = 0;

        while ( i < utftext.length ) {

            let c1 = utftext.charCodeAt(i);

            if (c1 < 128) {
                string += String.fromCharCode(c1);
                i++;
            }
            else if((c1 > 191) && (c1 < 224)) {
                let c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                let c2 = utftext.charCodeAt(i+1);
                let c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    };

    const encode = (input) => {
        let output = '';
        let i = 0;

        input = utf8_encode(input);

        while (i < input.length) {

            let chr1 = input.charCodeAt(i++);
            let chr2 = input.charCodeAt(i++);
            let chr3 = input.charCodeAt(i++);

            let enc1 = chr1 >> 2;
            let enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            let enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            let enc4 = chr3 & 63;

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
    };

    // public method for decoding
    const decode = (input) => {
        let output = '';
        let i = 0;

        input = input.replace(/[^A-Za-z0-9+/=]/g, "");

        while (i < input.length) {

            let enc1 = keyStr.indexOf(input.charAt(i++));
            let enc2 = keyStr.indexOf(input.charAt(i++));
            let enc3 = keyStr.indexOf(input.charAt(i++));
            let enc4 = keyStr.indexOf(input.charAt(i++));

            let chr1 = (enc1 << 2) | (enc2 >> 4);
            let chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            let chr3 = ((enc3 & 3) << 6) | enc4;

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

    };

    on("ready",()=>{
        checkInstall();
    });

    return {
        encode: encode,
        decode: decode
    };

})();

