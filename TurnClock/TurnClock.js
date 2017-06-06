on("ready", function() {
    "use strict";
    on("chat:message", function (msg) {
        var args;
        if (msg.type === "api"){
            args = msg.content.split(/\s+/);
            if (args[0].match(/^!Clock/i)){
                let time = parseInt(args[1],10)||0;
                if(time){
                    let due = _.now()+time*1000,
                        tokens = _.chain(msg.selected)
                            .map((o)=>getObj('graphic',o._id))
                            .reject(_.isUndefined)
                            .value(),
                        names = _.map(tokens,(t)=>t.get('name')),
                        numCheck,
                        updateClock = ()=>{
                            let num=Math.ceil((due-_.now())/1000);
                            if(num>0){
                                _.map(tokens,(t)=>t.set('status_stopwatch',num));
                                if (numCheck !== num){
                                    sendChat("", "Turn Time Remaining: " + num);
                                    numCheck = num;
                                }
                                _.delay(updateClock,200);
                            } else {
                                _.map(tokens,(t)=>t.set('status_stopwatch',false));
                                sendChat("TurnClock", "!Sound: Buzzer");
                                sendChat("", "Turn Over!");
                            }
                        };
                    sendChat("TurnClock", "!Sound: Ticking Clock");
                    sendChat("", "TurnClock Started on: " + names.join(', '));
                    updateClock();
                }
            }
        }
    });
    on("chat:message", function (msg) {
        if (msg.type === "api" && msg.content === "!Sound: Ticking Clock")  {
            PlaySound('Sound: Ticking Clock', 6000);
        };
        if (msg.type === "api" && msg.content === "!Sound: Buzzer")  {
            PlaySound('Sound: Buzzer', 1000);
        };
    });
});

function PlaySound(trackname, time) {
    var track = findObjs({type: 'jukeboxtrack', title: trackname})[0];
    if(track){
    if (track.get('playing') === false){
    
    track.set('playing',false);
    track.set('softstop',false);
    //track.set('volume', 100);
    log(track);
    if(track) {
        track.set('playing',true);
        log('playing');
        setTimeout(function() {track.set('playing',false);log('stopping sound');}, time);
        log(track);
    }
    else {
        log("No track found");
    }
    }
    else {track.set('playing', false);
    
    }}
}