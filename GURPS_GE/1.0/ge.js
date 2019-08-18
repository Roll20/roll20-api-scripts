function processInlinerolls(msg) {
    if (_.has(msg, 'inlinerolls')) {
        return _.chain(msg.inlinerolls)
            .reduce(function (m, v, k) {
                var ti = _.reduce(v.results.rolls, function (m2,
                    v2) {
                    if (_.has(v2, 'table')) {
                        m2.push(_.reduce(v2.results,
                            function (m3,
                                v3) {
                                m3.push(v3
                                    .tableItem
                                    .name);
                                return m3;
                            }, []).join(', '));
                    }
                    return m2;
                }, []).join(', ');
                m['$[[' + k + ']]'] = (ti.length && ti) || v
                    .results
                    .total || 0;
                return m;
            }, {})
            .reduce(function (m, v, k) {
                return m.replace(k, v);
            }, msg.content)
            .value();
    }
    else {
        return msg.content;
    }
}
// Gather Energy
on("chat:message", function (msg) {
    if (msg.type === "api" && /^!ge/.test(msg.content)) {
        let cmd = processInlinerolls(msg).split(/\s+/);
        var who = getObj('player', msg.playerid).get(
                '_displayname')
            .split(' ')[0];
        //var character = getObj('character', cmd[1]);
        //var name = getAttrByName(character.id, 'character_name');
        //var whisper = getAttrByName(character.id, 'whispermode');
        var level = Number(cmd[1]);
        var energy = Number(cmd[2]);
        var time = Number(cmd[3]);
        // Variables from API
        var roll;
        var margin;
        var d = 0;
        var e = 0;
        var t = 0;
        var i = 0;
        var q = 0;
        var result;
        var skill;
        // Send Template to Chat	
        log(msg.content);

        do {
            if (++d == 3) {
                level = level - 1;
                skill = "Skill dropped to " + level;
                d = 0;
            }
            else {
                skill = "";
            }
            // ========== Roll Logic ==========
            roll = Number(randomInteger(6) + randomInteger(6) + randomInteger(6));
            if (roll === 3 || roll === 4) {
                margin = Math.max(1, (level - roll));
                result = "";
                time = 1;
            }
            else if (roll === 5 && level >= 15) {
                margin = Math.max(1, (level - roll));
                result = "";
                time = 1;
            }
            else if (roll === 6 && level >= 16) {
                margin = Math.max(1, (level - roll));
                result = "";
                time = 1;
            }
            else if (roll <= level) {
                margin = Math.max(1, (level - roll));
                result = "";
                time = time;
            }
            // A roll of 18 is always a critical failure.
            else if (roll === 18) {
                result = "Critical Failure";
                time = time;
                break;
            }
            // A roll of 17 is a critical failure if your effective skill is 15 or less; otherwise, it is an ordinary failure.
            else if (roll === 17 && level <= 15) {
                result = "Critical Failure";
                time = time;
                break;
            }
            // Any roll of 10 greater than your effective skill is a critical failure
            else if (roll > level && margin <= -10) {
                result = "Critical Failure";
                time = time;
                break;
            }
            else if (roll > level) {
                margin = 1;
                q = q + 1;
                result = "Quirks: " + q;
                time = time;
            }
            e = e + margin;
            t = t + time;
            ++i;
            sendChat(msg.who, "[" + i + "] Roll: " + roll +
                " vs. Level: " + level +
                " Energy Gathered: " + e + "/" + energy +
                " Time: " + t + " " + result);
            sendChat(msg.who, skill);
        }
        while (e <= energy);
		if (e > energy) {
			sendChat(msg.who, "Ritual Complete" + "Total Energy Gathered: " + e + " Elapsed Time: " + t + " " + result);
		}
    }
	
});