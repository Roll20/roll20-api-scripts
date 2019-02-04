on("ready", function () {

    let lastTime = Date.now();
    let lastSecond = Math.floor(lastTime / 1000) * 1000;
    let rotPerSec = 360 / 60;
    const updateSpeed = 250;

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


    const doUpdates = () => {
        let nextSecond = false;
        let time = Date.now();
        let deltaS = time - lastSecond;
        lastTime = time;

        findObjs({
            type: 'graphic',
            gmnotes: 'game.clock'
        }, { caseInsensitive: true })
            .forEach((obj) => {
                let c = {
                    bar3_value: obj.get('bar3_value') || "0",
                    bar1_value: obj.get('bar1_value') || "0",
                    bar2_value: obj.get('bar2_value') || "0",
                    rotation: ((((parseInt(obj.get('bar2_value')) || 0) * rotPerSec) + (rotPerSec * (deltaS / 1000)) % 360 + 360) % 360) + (parseInt(obj.get('light_losangle')) || 0)
                };
                if (deltaS > 1000) {
                    let h = parseInt(c.bar3_value);
                    let m = parseInt(c.bar1_value);
                    let s = parseInt(c.bar2_value);
                    s += 1;
                    m += (s >= 60 ? 1 : 0);
                    s %= 60;
                    h += (m >= 60 ? 1 : 0);
                    m %= 60;
                    c.bar3_value = `${h}`;
                    //c.bar1_value = `${m}`;
                    //c.bar2_value = `${s}`;
                    c.bar1_value = (`${m}` < 10) ? '0' + `${m}` : `${m}`;
                    c.bar2_value = (`${s}` < 10) ? '0' + `${s}` : `${s}`;
                    c.name = c.bar3_value + ':' + c.bar1_value + ':' + c.bar2_value;
                    let phase = (s % (statusLookup.length));
                    c.statusmarkers = statusLookup[phase];
                    nextSecond = true;
                }
                obj.set(c);
            });
        if (nextSecond) {
            lastSecond += 1000;
        }
    };
    setInterval(
        doUpdates,
        updateSpeed
    );
});
