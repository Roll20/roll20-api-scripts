/**
 * Aziz Light!
 * This script allows you to quickly set and move the daylight brightness using dynamic lighting to different levels,
 * making it easy to macro light levels and mimic time passing.
 * 
 * Orbotik's Roll20 Scripts & Macros
 * https://orbotik.com
 * This script is © Christopher Eaton (aka @orbotik) and is licensed under CC BY-SA 4.0. 
 * To view a copy of this license, visit https://creativecommons.org/licenses/by-sa/4.0/
 * 
 * ## API Commands:
 * You can add exclamation points `!` to the end of any of the commands to animate the brightness change.
 * The more exclamation points, the faster the change! By default 1 exclamation point is a 1% change every 2seconds, 
 * and each subsequent exclamation divides the time. So 4 exclamation points would make a 1% increase every 1/2second
 * (2seconds / 4).
 * ### GM Only:
 * !aziz light                      90% daytime light.
 * !aziz eve                        20% daytime light.
 * !aziz dark                       daytime light off.
 * !aziz exactly [number]           +5% daytime light.
 * !aziz more                       +5% daytime light.
 * !aziz less                       -5% daytime light.
 */

class AzizLightScript {

    static VERSION = '1.0.0';

    interval = null;

    intervalTarget = null;

    intervalStep = 1;

    intervalCounter = 0;

    constructor() {
        on('chat:message', this.onMessage.bind(this));
    }

    /**
     * Stops and cleans up the animation.
     */
    resetAnimation() {
        clearInterval(this.interval);
        this.intervalCounter = 0;
        this.intervalStep = 1;
    }

    /**
     * Sets the page's brightness.
     * @param {Object} page
     * @param {Number} brightness 
     * @param {Boolean} animate 
     */
    lightTo(page, brightness, animate) {
        if (animate) {
            let currentLevel = (page.get('daylightModeOpacity') ?? 0) * 100;
            let time = 2000 / Math.max(Math.min(100, animate), 1);
            this.resetAnimation();
            this.intervalTarget = brightness;
            this.intervalStep = 1;
            if (Math.abs(currentLevel - brightness) > 50 && animate > 5) {
                this.intervalStep = 2; //with wide time gaps, if there is an imperative to go fast, then boost the step.
            }
            if (currentLevel === brightness) {
                return; //already there!
            } else if (currentLevel > brightness) {
                this.intervalStep *= -1; //reduce brightness instead of increase
            }
            this.interval = setInterval(() => {
                let level = (page.get('daylightModeOpacity') ?? 0) * 100;
                if (Math.abs(currentLevel - brightness) <= 3 && Math.abs(this.intervalStep) > 1) {
                    //ensure we don't overshoot when boosted.
                    this.intervalStep = (this.intervalStep > 0 ? 1 : -1);
                }
                this.lightTo(page, level + this.intervalStep);
                this.intervalCounter++;
                if (this.intervalCounter > 100 || Math.round(level + this.intervalStep) === Math.round(this.intervalTarget)) {
                    this.resetAnimation();
                }
            }, time);
            return;
        }
        if (brightness >= 5) {
            page.set({
                showlighting: true,
                daylight_mode_enabled: true,
                daylightModeOpacity: Math.max(0.05, Math.min(1, brightness / 100))
            });
        } else {
            page.set({
                showlighting: true,
                daylight_mode_enabled: false,
                daylightModeOpacity: 0.05
            });
        }
    }

    onMessage(msg) {
        if (msg.type === 'api' && !msg.rolltemplate && msg.playerid) {
            let args;
            if (msg.content.indexOf('"') > -1 || msg.content.indexOf('\'') > -1) {
                let matches = msg.content.substring(1).matchAll(/[^\s"']+|["']([^"']*)["']/gi);
                args = [];
                for (let m of matches) {
                    if (m[0]) {
                        args.push(m.length > 1 && !!m[1] ? m[1] : m[0])
                    }
                }
            } else {
                args = msg.content.substring(1).split(' ');
            }
            let command = args[0].toLowerCase();
            args.splice(0, 1);
            args = args.map(v => v.replaceAll(/[^a-zA-Z0-9 \._=@\-()&+!]/g, ''));
            if (command === 'aziz') {
                let currentPlayer = getObj('player', msg.playerid);
                if (currentPlayer) {
                    let gm = playerIsGM(currentPlayer.id);
                    if (gm) {
                        let page = getObj('page', currentPlayer.get('lastpage'));
                        let animate = false;
                        let hasAnimate = args[args.length - 1].match(/(!+)$/g);
                        if (hasAnimate?.length) {
                            animate = hasAnimate[0].length;
                            args[args.length - 1] = args[args.length - 1].replaceAll(/!+$/g, '');
                        }
                        let subCommand = (args[0] ?? '');
                        log(`subCommand=${subCommand}; animate=${animate}`);
                        this.resetAnimation();
                        switch (subCommand) {
                            case 'light': {
                                this.lightTo(page, 90, animate);
                                break;
                            }
                            case 'eve': {
                                this.lightTo(page, 20, animate);
                                break;
                            }
                            case 'dark': {
                                this.lightTo(page, 0, animate);
                                break;
                            }
                            case 'exactly': {
                                let level = parseInt(args[1] || 0);
                                if (isFinite(level) && level >= 0 && level <= 100) {
                                    this.lightTo(page, Math.round(level), animate);
                                }
                                break;
                            }
                            case 'less':
                            case 'more': {
                                let level = page.get('daylightModeOpacity');
                                level += subCommand === 'more' ? 0.05 : -0.05;
                                this.lightTo(page, level * 100, animate);
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

}

on('ready', () => {
    log(`Aziz Light! script v${AzizLightScript.VERSION} initializing.`);
    new AzizLightScript();
    log(`Aziz Light! script initialized.`);
});
