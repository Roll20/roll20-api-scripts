on("ready", function () {
    let lastTime = Date.now();
    let lastSecond = Math.floor(lastTime / 1000) * 1000;
    let rotPerSec = 360 / 60;
    const updateSpeed = 250;
    let bar2Splitor = /^(\w|)(\w|)(\w|)(\w|)([.]|)(\w+|)/i;
    let bar2numSplitor = [/[-][-](\d+)/i];
    let bar2num2Splitor = /[.](\d+)/i;
    let bar1max2Splitor = [/[:]([\s\S]+)/i];
    const statusLookup = [
        "red",
        "red,blue",
        "red,blue,green",
        "red,blue,green,brown",
        "red,blue,green,brown,purple",
        "red,blue,green,brown,purple,yellow",
        "red,blue,green,brown,purple",
        "red,blue,green,brown",
        "red,blue,green",
        "red,blue"
    ];
    const aura1_colorLookup = [
        "#ff0000", "#ffff00", "#00ff00", "#0000ff", "#ff00ff"
    ];
    const aura1_radiusLookup = [
        "0.7", "0.8", "0.9", "1", "1.1"
    ];
    const doUpdates = () => {
        try {
            let time = Date.now();
            let deltaS = time - lastSecond;
            lastTime = time;

            findObjs({
                type: 'graphic',
                bar1_value: 'game.clock'
            }, {
                    caseInsensitive: true
                })
                .forEach((obj) => {
                    let key = bar2Splitor.exec(obj.get('bar2_value'));
                    if (key.indexOf("o") === -1) {
                        let c = {
                            bar3_value: obj.get('bar3_value') || "0",
                            bar2_value: obj.get('bar2_value') || "",
                            name: obj.get('name') || '00:00:00',
                            showname: true
                        };
                        let sec = parseInt(c.bar3_value);
                        if (key.indexOf("r") === -1) {
                            c.rotation =
                                (((((parseInt(obj.get('bar3_value')) || 0) % 60) * rotPerSec) + (rotPerSec * (deltaS / 1000)) % 360 + 360) % 360) + parseInt(key[6] || 0)

                        }
                        else {
                            c.rotation = parseInt(key[6] || 0);
                        }
                        if (key.indexOf("s") === -1) {
                            let phase = (sec % (statusLookup.length));
                            c.statusmarkers = statusLookup[phase];
                        } else {
                            c.statusmarkers = ""
                        }
                        if (key.indexOf("a") === -1) {
                            let phase = (sec % (aura1_colorLookup.length));
                            c.aura1_color = aura1_colorLookup[phase];
                            c.aura1_radius = aura1_radiusLookup[phase];
                        } else {
                            c.aura1_radius = ""
                        }
                        if (deltaS > 1000) {
                            ++sec;
                            let h = Math.floor(sec / 3600);
                            if (h < 10) h = '0' + h;
                            let m = Math.floor((sec - (h * 60)) / 60);
                            let s = Math.floor(sec % 60);
                            c.bar3_value = `${sec}`;
                            c.name = obj.get('bar1_max') + `${`${h}`}:${`00${m}`.slice(-2)}:${`00${s}`.slice(-2)}`;
                        }
                        obj.set(c);
                    };
                });
            if (deltaS > 1000) {
                lastSecond += 1000;
            }

        }
        catch (e) { }
    };
    setInterval(
        doUpdates,
        updateSpeed
    );
    on('chat:message', (msg) => {
        if ('api' === msg.type && /^!game.clock\b/i.test(msg.content)) {
            let cmd = msg.content.toLowerCase().split(/\s+/);
            let create = cmd.includes('--create') || cmd.includes('-c');
            let toggle = cmd.includes('--toggle') || cmd.includes('-t');
            let reset = cmd.includes('--reset') || cmd.includes('-re');
            let rotation = cmd.includes('--rotation') || cmd.includes('-ro');
            let marker = cmd.includes('--marker') || cmd.includes('-m');
            let aura = cmd.includes('--aura') || cmd.includes('-a');
            let angle = bar2numSplitor.some(check => check.test(cmd));
            let name = bar1max2Splitor.some(check => check.test(cmd));
            (msg.selected || [])
                .map((o) => getObj('graphic', o._id))
                .filter(o => undefined !== o)
                .filter((o) => create || 'game.clock' === o.get('bar1_value'))
                .forEach((o) => {
                    let c = {};
                    c.bar2_value = o.get('bar2_value');
                    if (create) {
                        c.bar1_value = 'game.clock';
                        c.showname = true;
                        //c.bar2_value = 1;
                        //c.rotation = 0;
                        //c.statusmarkers = '';
                        //c.name = '00:00:00';
                    }
                    if (reset) {
                        c.bar3_value = 0;
                        c.bar2_value = "";
                        c.rotation = 0;
                        c.statusmarkers = '';
                        c.name = '00:00:00';
                    }
                    if (toggle) {
                        c.bar2_value = (c.bar2_value.indexOf("o") === -1 ? 'o' + c.bar2_value : c.bar2_value.replace("o", ""));
                    }
                    if (rotation) {
                        c.bar2_value = (c.bar2_value.indexOf("r") === -1 ? 'r' + c.bar2_value : c.bar2_value.replace("r", ""));
                    }
                    if (marker) {
                        c.bar2_value = (c.bar2_value.indexOf("s") === -1 ? 's' + c.bar2_value : c.bar2_value.replace("s", ""));
                    }
                    if (aura) {
                        c.bar2_value = (c.bar2_value.indexOf("a") === -1 ? 'a' + c.bar2_value : c.bar2_value.replace("a", ""));
                    }
                    if (angle) {
                        c.bar2_value = (c.bar2_value.match(/[.](\d+)/i) ? (c.bar2_value.replace(bar2num2Splitor, "." + msg.content.match(/[-][-](\d+)/i)[1])) : c.bar2_value + "." + msg.content.match(/[-][-](\d+)/i)[1]);
                    }
                    if (name) {
                        c.bar1_max = (msg.content.match(/[:]([\s\S]+)/i)[1]);
                    }
                    o.set(c);
                });
        }
    });
});