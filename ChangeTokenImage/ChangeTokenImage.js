// By:       Christopher Buchholz
//           with heavy copying from, I mean use of as a Pattern, TokenMod
var ChangeTokenImg = ChangeTokenImg || (function() {
    'use strict';
    var version = '0.1.32',
    lastUpdate = 1499262126,

    observers = {
            tokenChange: []
        },

    showHelp = function(id) {
        var who=getObj('player',id).get('_displayname').split(' ')[0];
        sendChat('',
            '/w '+who+' <div style="border: 1px solid black; background-color: white; padding: 3px 3px">'
            + '<div style="padding-bottom:5px">'
            + '<span style="font-size:130%;border-bottom:1px;font-weight:bold">ChangeTokenImg v'+version+ '</span>'
            + '</div><div style="padding-left:10px;padding-right:10px;padding-bottom:5px">'
            + 'Changes the image for selected token IF the tokens are from a Rollable Table.'
            + '<span style="color:#FF0000;">Currently works <b>ONLY</b> if images are in your personal library!</span>'
            + '</div><div>'
            + '<span style="border-bottom:1px;font-weight:bold">Usage:</span>'
            + '</div><div style="padding-left:10px;padding-right:10px;padding-bottom:5px">'
            + 'select token(s) to change, then type '
            + '<br/><b>!change-token-img</b> '
            + '<br/>with one of the following options.' 
            + '</div><div>'
            + '<span style="border-bottom:1px;font-weight:bold">Type of change:</span>'
            + '</div><div style="padding-left:10px;padding-right:10px;padding-bottom:5px">'
            + '<b>--flip</b> Flips image between 0 and 1 '
            + '<br/><b>--set</b> Set the image index, must be followed by a space and a number: --set 3 sets the token to the 4th image in the rollable table. '
            + '<br/><b>--incr</b> Increments the token to the next image in the rollable table '
            + '</div><div>'
            + '<br/><span style="border-bottom:1px;font-weight:bold">Modifiers:</span>'
            + '</div><div style="padding-left:10px;padding-right:10px;padding-bottom:5px">'
            + 'These can be used with any of the above options:'
            + '<br/><b>--notsame</b> Asserts scripts should NOT assume all tokens have same rollable table of images. Default is '
            + 'script assumes all selected tokens use same images.'
            + '</div><div>'
            + '<br/><span style="border-bottom:1px;font-weight:bold">Examples:</span>'
            + '</div><div style="padding-left:10px;padding-right:10px;padding-bottom:5px">'
            + '<b>!change-token-img --set 2 --notsame</b> change all tokens to image in index 2 (3rd image) of rollable table. For each token, '
            + 'check the rollable table for images, do NOT assume all tokens are the same.'
            + '<br/><b>!change-token-img --flip</b> for all selected tokens, check their current image displayed. If it is the first image, flip '
            + 'token to the second image. If it is set to the second image, then flip token to the first image. All tokens have the same rollable table of images.'
            + '<br/><b>!change-token-img --set 0</b> Set all tokens to the first image, assume they are all the same.'
            + '</div>'
        );
    },
    showError = function(id,n,tname,errortype) {
		var who=(getObj('player',id)||{get:()=>'API'}).get('_displayname');
        var errorstr = 'ChangeTokenImg: ';
        if (errortype == 'SIDES') {
            var sidestr='s';
            if (n == 1) {
                sidestr='';
            }
            errorstr = tname+' has only ' + n + ' side'+sidestr+'!';
        } else if (errortype == 'EMPTY') {
            errorstr = 'You must pick --flip, --set or --incr';
        } else if (errortype == 'ARG') {
            errorstr = n + ' is not a valid value for set parameter';            
        }
        sendChat('', `/w "${who}" <div>${errorstr}</div>`);
    },    
    getCleanImagesrc = function (imgsrc) {
        var parts = imgsrc.match(/(.*\/images\/.*)(thumb|max)(.*)$/);
        if(parts) {
            return parts[1]+'thumb'+parts[3];
        }
        return;
    },
    setImg = function (o,nextSide,allSides) {
        var nextURL = getCleanImagesrc(decodeURIComponent(allSides[nextSide]));
        o.set({
            currentSide: nextSide,
            imgsrc: nextURL
        });
        return nextURL;
    },
    setImgUrl = function (o, nextSide, nextURL) {
        o.set({
            currentSide: nextSide,
            imgsrc: getCleanImagesrc(nextURL)
        });		
    },
    isInt = function (value) {
        return !(value === undefined) &&  !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10)) && value >= 0;
    },
    handleInput = function(msg_orig) {
        var msg = (msg_orig),
            args, cmds,  allSides=[],  nextSide, nextURL, flipimg, setimg, incrementimg, sameimages, setval;
            flipimg = false;
            setimg = false;
            sameimages = false;
            incrementimg = false;
            nextURL='BLANK';
        if (msg.type !== "api") {
            return;
        }

        if(_.has(msg,'inlinerolls')){
            msg.content = _.chain(msg.inlinerolls)
            .reduce(function(m,v,k){
                var ti=_.reduce(v.results.rolls,function(m2,v2){
                    if(_.has(v2,'table')){
                        m2.push(_.reduce(v2.results,function(m3,v3){
                            m3.push(v3.tableItem.name);
                            return m3;
                        },[]).join(', '));
                    }
                    return m2;
                },[]).join(', ');
                m['$[['+k+']]']= (ti.length && ti) || v.results.total || 0;
                return m;
            },{})
            .reduce(function(m,v,k){
                return m.replace(k,v);
            },msg.content)
            .value();
        }

        args = msg.content
        .replace(/<br\/>\n/g, ' ')
        .replace(/(\{\{(.*?)\}\})/g," $2 ")
        .split(/\s+--/);
        var isthismethod= false;
        switch(args.shift()) {
            case '!change-token-img':
                isthismethod=true;
                while(args.length) {
                    cmds=args.shift().match(/([^\s]+[|#]'[^']+'|[^\s]+[|#]"[^"]+"|[^\s]+)/g);

                    switch(cmds.shift()) {
                        case 'help':
                            showHelp(msg.playerid);
                            return;
                        case 'set':
							if(cmds.length){
								setimg = true;
								setval =  cmds.shift();
								if (! isInt(setval)) {
									showError(msg.playerid,setval,'','ARG');
									return;
								}
							} else {
								showHelp(msg.playerid);
								return;
							}
                            break;
                        case 'flip':
                            flipimg = true;
                            break;
                        case 'incr':
                            incrementimg = true;
                            break;
                        case 'notsame':
                            sameimages = false;
                            break;
                    }
                }
        }
        if (isthismethod == false) {
            return;
        }
        if (setimg == false && flipimg == false && incrementimg == false ) {
            showError(msg.playerid,'','','EMPTY');
            return;
        } else {
            //loop through selected tokens
            _.chain(msg.selected)
            .uniq()
            .map(function(o){
                return getObj('graphic',o._id);
            })
            .reject(_.isUndefined)
            .each(function(o) {
                if (sameimages == false || allSides === undefined || allSides.length == 0  ) {
                    allSides = o.get("sides").split("|");
                }
                if ( allSides.length > 1) {
                    if (setimg == true) {
                        nextSide = setval;
                    } else {
                        nextSide = o.get("currentSide") ;
                        nextSide++;						
                        if (flipimg == true && nextSide > 1) {
                            nextSide = 0;
                        } else if (nextSide == allSides.length) {
                            nextSide = 0;
                        } 	
                    }
                    if (nextSide >= allSides.length) {
                        showError(msg.playerid,allSides.length,o.get("name"),'SIDES');
                        if (sameimages == true) {
                            //quit since they are all the same
                            return;
                        }
                    } else {
                        let prev=JSON.parse(JSON.stringify(o));
                        if (nextURL == 'BLANK' || sameimages == false) {
                            nextURL = setImg(o,nextSide,allSides);
                        } else {
                            setImgUrl(o,nextSide,nextURL);
                        }
                        notifyObservers('tokenChange',o,prev);
                    }
                } else {
                    showError(msg.playerid,allSides.length,o.get("name"),'SIDES');
                    if (sameimages == true) {
                        //quit since they are all the same
                        return;
                    }
                }
            });
        }
    },
    observeTokenChange = function(handler){
        if(handler && _.isFunction(handler)){
            observers.tokenChange.push(handler);
        }
    },
    notifyObservers = function(event,obj,prev){
        _.each(observers[event],function(handler){
            handler(obj,prev);
        });
    },
    checkInstall = function() {
        log('-=> ChangeTokenImg v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
    },
    registerEventHandlers = function() {
        on('chat:message', handleInput);
    };
    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers,
        ObserveTokenChange: observeTokenChange
    };
}());
on("ready",function(){
    'use strict';
    ChangeTokenImg.CheckInstall();
    ChangeTokenImg.RegisterEventHandlers();
});
