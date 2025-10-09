// libUUID v0.0.1 by GUD Team | Tired of copying and pasting a UUID function over and over? Me too. This script provides a couple of functions to generate UUIDs.
class libUUID {
    static base64Chars = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
    static base = 64;
    static previousTime = 0;
    static counter = new Array(12).fill(0);
    static toBase64(num, length) {
        let result = "";
        for (let i = 0; i < length; i++) {
            result = this.base64Chars[num % this.base] + result;
            num = Math.floor(num / this.base);
        }
        return result;
    }
    ;
    static generateRandomBase64(length) {
        let result = "";
        for (let i = 0; i < length; i++) {
            result += this.base64Chars[Math.floor(Math.random() * this.base)];
        }
        return result;
    }
    ;
    static generateUUID() {
        const currentTime = Date.now();
        const timeBase64 = this.toBase64(currentTime, 8);
        let randomOrCounterBase64 = "";
        if (currentTime === this.previousTime) {
            // Increment the counter
            for (let i = this.counter.length - 1; i >= 0; i--) {
                this.counter[i]++;
                if (this.counter[i] < this.base) {
                    break;
                }
                else {
                    this.counter[i] = 0;
                }
            }
            randomOrCounterBase64 = this.counter.map(index => this.base64Chars[index]).join("");
        }
        else {
            // Generate new random values and initialize counter with random starting values
            randomOrCounterBase64 = this.generateRandomBase64(12);
            // Initialize counter with random values instead of zeros to avoid hyphen-heavy sequences
            for (let i = 0; i < this.counter.length; i++) {
                this.counter[i] = Math.floor(Math.random() * this.base);
            }
            this.previousTime = currentTime;
        }
        return timeBase64 + randomOrCounterBase64;
    }
    ;
    static generateRowID() {
        return this.generateUUID().replace(/_/g, "Z");
    }
    ;
}
