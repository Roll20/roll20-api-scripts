// libUUID v0.0.1 by GUD Team | Tired of copying and pasting a UUID function over and over? Me too. This script provides a couple of functions to generate UUIDs.
var libUUID = (function () {
    'use strict';

    const base64Chars = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
    const base = 64;
    let previousTime = 0;
    const counter = new Array(12).fill(0);
    function toBase64(num, length) {
        let result = "";
        for (let i = 0; i < length; i++) {
            result = base64Chars[num % base] + result;
            num = Math.floor(num / base);
        }
        return result;
    }
    function generateRandomBase64(length) {
        let result = "";
        for (let i = 0; i < length; i++) {
            result += base64Chars[Math.floor(Math.random() * base)];
        }
        return result;
    }
    function generateUUID() {
        const currentTime = Date.now();
        const timeBase64 = toBase64(currentTime, 8);
        let randomOrCounterBase64 = "";
        if (currentTime === previousTime) {
            // Increment the counter
            for (let i = counter.length - 1; i >= 0; i--) {
                counter[i]++;
                if (counter[i] < base) {
                    break;
                }
                else {
                    counter[i] = 0;
                }
            }
            randomOrCounterBase64 = counter.map(index => base64Chars[index]).join("");
        }
        else {
            // Generate new random values and initialize counter with random starting values
            randomOrCounterBase64 = generateRandomBase64(12);
            // Initialize counter with random values instead of zeros to avoid hyphen-heavy sequences
            for (let i = 0; i < counter.length; i++) {
                counter[i] = Math.floor(Math.random() * base);
            }
            previousTime = currentTime;
        }
        return timeBase64 + randomOrCounterBase64;
    }
    function generateRowID() {
        return generateUUID().replace(/_/g, "Z");
    }
    var index = {
        generateUUID,
        generateRowID,
    };

    return index;

})();
