on('ready', () => {
    on('chat:message', function (msg) {
        if (msg.type == "api" && msg.content.startsWith("!hengenojutsu")) {
            if (!msg.selected) {
                sendChat(msg.who, "<div class='sheet-rolltemplate-simple' style='margin-top:-7px;'><div class='sheet-container'><div class='sheet-label' style='margin-top:5px;'><span>" + "No token selected!" + "</span></div></div></div>");
            } else if (msg.selected.length > 1) {
                sendChat(msg.who, "<div class='sheet-rolltemplate-simple' style='margin-top:-7px;'><div class='sheet-container'><div class='sheet-label' style='margin-top:5px;'><span>" + "Too many tokens selected!" + "</span></div></div></div>");
            } else {
                let args = msg.content.split(/\s+/);
                if (args[1]) {
                    var table = findObjs({
                        name: args[1],
                        _type: "rollabletable"
                    });
                    if (table) {
                        var tablecontent = findObjs({
                            _rollabletableid: table[0].get("_id"),
                            _type: "tableitem"
                        });
                        var token = findObjs({
                            _id: msg.selected[0]._id
                        });

                        var getCleanImgsrc = function (imgsrc) {
                            var parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^\?]*)(\?[^?]+)?$/);
                            if (parts) {
                                return parts[1] + 'thumb' + parts[3] + (parts[4] ? parts[4] : `?${Math.round(Math.random()*9999999)}`);
                            }
                            return;
                        };

                        // putting the token to the map otherwise fx will be displayed under the token
                        token[0].set({
                            layer: "map"
                        });
                        spawnFx(token[0].get("left"), token[0].get("top") + 30, 'bomb-smoke');

                        if (getCleanImgsrc(token[0].get("imgsrc")) == getCleanImgsrc(tablecontent[0].get("avatar"))) {
                            var img = {
                                imgsrc: getCleanImgsrc(tablecontent[1].get("avatar"))
                            };
                        } else {
                            var img = {
                                imgsrc: getCleanImgsrc(tablecontent[0].get("avatar"))
                            };
                        }

                        token[0].set(img);
                        setTimeout(() => {
                            token[0].set({
                                layer: "objects"
                            });

                        }, 500);
                    }
                }
            }
        }
    });
});