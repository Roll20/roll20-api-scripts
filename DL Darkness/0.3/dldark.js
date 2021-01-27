//This script creates a gridded circle on the Dynamic Lighting layer, based on a specific token to be used as magical darkness, then moves that token to the map
//      This is based on a darkness concept contributed by Avi on the forum:  
//      https://app.roll20.net/forum/post/5899495/stupid-roll20-tricks-and-some-clever-ones
//The circle approximation code is based on theAaron's !dlcircle script, simplified to handle only circles rather than ellipses
//To use:
//  Create a character whose token has the desired image of the darkness generated, and drag that token to the map.
//  Add an Ability macro to call !dldark and set as a token action
/*
SYNTAX
    !dldark <buffer> <makeGrid> <sendToMapLayer>
    
        "buffer"            < # >           Optional. Default = 0
                                                reduce the radius of the darkness by this many pixels. 
                                                allows the source of the darkness to be seen at the outer border of the darkness.
        "makeGrid"          < true/false >  Optional. Default = true
                                                draw a grid inside of the darkness circle. 
                                                the grid will be aligned with the map grid based on page settings
        "SendToMapLayer"    < true/false >  Optional. Default = true
                                                send the source token to the map layer after creating the DL path?
                                                if true, will send to map layer and peform a z-order "ToFront"
                                                if false, will keep on token layer and peform a z-order "ToBack"
STD EXAMPLES
    !dldark
    
    !dldark 15 true
    
    !dldark ?{buffer radius?|15} true false
    
De-linking EXAMPLES
    !dldarkclear token      unlinks selected token and corresponding dynamic lighting path (requires token selection)
    
    !dldarkclear tok        (Alias) unlinks selected token and corresponding dynamic lighting path (requires token selection)
    
    !dldarkclear page       unlinks all tokens and corresponding dynamic lighting paths from the current page (requires token selection)
    
    !dldarkclear campaign   unlinks all tokens and corresponding dynamic lighting paths from the ENTIRE CAMPAIGN (Use caution!)
*/

const dldark = (() => {
    const scriptName = "DLdark";
    const version = '0.3';
    const schemaVersion = '0.1';
    const byTOKEN = 'TOKEN';
    const byPATH = 'PATH';
    const clearTOKEN = 'TOKEN';
    const clearALL = 'ALL';
    
    const checkInstall = function() {
        log(scriptName + ' v' + version + ' initialized.');
        
        //delete state[scriptName];
        
        if( ! _.has(state, scriptName) || state[scriptName].version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            switch(state[scriptName] && state[scriptName].version) {
                case 0.1:
                /* falls through */
                case 'UpdateSchemaVersion':
                    state[scriptName].version = schemaVersion;
                    break;

                default:
                    state[scriptName] = {
                        version: schemaVersion,
                        links: []
                    };
                    break;
            }
        }
        //log(state[scriptName]);
    };
    
    const clearCache = function(who, tokID=undefined, pageID=undefined) {
        
        //no arguments passed, clear all pinked pairs in ENTIRE CAMPAIGN
        if(!tokID && !pageID) {
            state[scriptName] = {
                version: schemaVersion,
                links: []
            };
            sendChat(scriptName,`/w "${who}" `+ 'DL darkness unlinked across ENTIRE CAMPAIGN!');
            return;
        }
        
        //token only
        if (tokID) {
            //iterate through linked pairs in state object to find pairs associated with tokID
            for (let i = state[scriptName].links.length-1; i>-1; i--) {
                if (state[scriptName].links[i].tokID === tokID) {
                    //remove linked pair ids from state object
                    state[scriptName].links.splice(i,1);
                    sendChat(scriptName,`/w "${who}" `+ 'DL darkness unlinked for tokID = ' + tokID);
                }
            }
        } 
        
        //all linked tokens in current page
        if (pageID) {
            //iterate through linked pairs in state object to find pairs associated with pageID
            for (let i = state[scriptName].links.length-1; i>-1; i--) {
                if (state[scriptName].links[i].pageID === pageID) {
                    //remove linked pair ids from state object
                    state[scriptName].links.splice(i,1);
                }
            }
            sendChat(scriptName,`/w "${who}" `+ 'DL darkness unlinked for all tokens in pageID = ' + pageID);
        } 
        //log(state[scriptName]);
    }
    
    const makeLinkedPair = function(tokID, pathID, pageID='') {
        let link =  {
            tokID: tokID,
            pathID: pathID,
            pageID: pageID
        };
        state[scriptName].links.push(link);
        return link;
    }
    
    //Return array of {tokID, pathID} pairs from state object, given tokenID or pathID based on searchType. Returns undefined if none found. 
    const getLinkedPairs = function(ID, searchType) {
        let pair = state[scriptName].links.filter(function (p) {
            if (searchType === byTOKEN) {
                return p.tokID === ID;
            } else {
                return p.pathID === ID;
            }
        });
        if (pair.length>0) {
            return pair;
        } else {
            return undefined;
        }
    }
    
    //Circle/ellipse building portion of function is modified from TheAaron's "dlcircle" script
    const buildCircleGrid = function(who, rad, left, top, makeGrid, gridSize) {
        const centerX = rad
        const centerY = rad
        let circlePoints;
        let gridPoints = ""
        
        try {
            const at = (theta) => ({x: Math.cos(theta)*rad, y: Math.sin(theta)*rad}); 
            let steps = Math.min(Math.max(Math.round( (Math.PI*2*Math.sqrt((2*rad*rad)/2))/35),4),20);
            const stepSize = Math.PI/(2*steps);
            let acc=[[],[],[],[]];
            let th=0;
            _.times(steps+1,()=>{
                let pt=at(th);
                acc[0].push([pt.x,pt.y]);
                acc[1].push([-pt.x,pt.y]);
                acc[2].push([-pt.x,-pt.y]);
                acc[3].push([pt.x,-pt.y]);
                th+=stepSize;
            });
            acc = acc[0].concat(
                acc[1].reverse().slice(1),
                acc[2].slice(1),
                acc[3].reverse().slice(1)
            );
           
            //We will take this string, strip the last "]", append the grid points to the path, then add the trailing "]" when we return the full JSON
            circlePoints = JSON.stringify(acc.map((v,i)=>([(i?'L':'M'),rad+v[0],rad+v[1]])));
            circlePoints = circlePoints.substring(0, circlePoints.length - 1);
            
            if (makeGrid) {
                //Define grid points & build JSON string
                let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
                let x = 0, y = 0;
                
                //Try to align the darkness path to the actual map grid
                        //remember, path coords are relative to (left, top) of the path object, NOT to the map grid.
                let startX = gridSize - (left-rad) % gridSize; 
                let startY = gridSize - (top-rad) % gridSize; 
                
                //build the grid
                for (x = startX; x <= 2*rad; x+=gridSize) {
                    if( x >= 0) {
                        //vertical lines
                        y1 = centerY + Math.sqrt(rad*rad-(x-centerX)*(x-centerX));
                        y2 = centerY - Math.sqrt(rad*rad-(x-centerX)*(x-centerX));
                        gridPoints = gridPoints + ",[\"M\"," + x.toString() + "," + y1.toString() + "]";
                        gridPoints = gridPoints + ",[\"L\"," + x.toString() + "," + y2.toString() + "]";
                        
                        for (y = startY; y <= 2*rad; y+=gridSize) {
                            if( y >= 0) {
                                //horizontal lines
                                x1 = centerX + Math. sqrt(rad*rad-(y-centerY)*(y-centerY));
                                x2 = centerX - Math. sqrt(rad*rad-(y-centerY)*(y-centerY));
                                gridPoints = gridPoints + ",[\"M\"," + x1.toString() + "," + y.toString() + "]";
                                gridPoints = gridPoints + ",[\"L\"," + x2.toString() + "," + y.toString() + "]";
                            }
                        }
                    }
                }
            }
            //this is the entire path
            return circlePoints + gridPoints + "]";
        } 
        catch(err) {
          sendChat(scriptName,`/w "${who}" `+ 'Unhandled exception: ' + err.message);
        }
    };
    
    //Move DL path to remain under source token
    const handleTokenChange = function(obj,prev) {
        //find all paths linked to token, returns an array of {tokID, pathID} pairs, or undefined
        let pair = getLinkedPairs(obj.get('id'), byTOKEN);
        
        if (pair && obj && prev) {
            //calc delta X & Y
            let dX = obj.get('left') - prev['left']
            let dY = obj.get('top') - prev['top']
            //move path object(s) based on source token movement
            for (let i = 0; i < pair.length; i++) {
                let path = getObj('path', pair[i].pathID);
                if (path) {
                    let newX = parseInt(path.get('left')) + dX;
                    let newY = parseInt(path.get('top')) + dY;
                    path.set({left:newX, top:newY});
                }
            }
        } 
    }
    
    const handleRemoveToken = function(obj) {
        let tokID = obj['id'];
        
        //iterate through linked pairs in state object to find pairs associated with tokID
        for (let i = state[scriptName].links.length-1; i>-1; i--) {
            if (state[scriptName].links[i].tokID === tokID) {
                //get associated path object and remove if it still exists
                let path = getObj('path',state[scriptName].links[i].pathID);
                if (path) {
                    path.remove();
                    //note: when the path is removed, the handleRemovePath function will take care of deleting the linked pair from state object
                } else {
                    //remove linked pair ids from state object (shouldn't ever get called, but here just in case)
                    state[scriptName].links.splice(i,1);
                }
            }
        }
        //log(state[scriptName]);
    };
    
    const handleRemovePath = function(obj) {
        let pathID = obj['id'];
        
        for (let i = state[scriptName].links.length-1; i>-1; i--) {
            if (state[scriptName].links[i].pathID === pathID) {
                //remove linked pair ids from state object
                state[scriptName].links.splice(i,1);
            }
        }
        //log(state[scriptName]);
    };
    
    
    const handleInput = function(msg) {
        let who, tok, tokID, pageID;
        
        try {
            //----------------------------------------------------------------------------
            //   Optional script operation - clears linked pairs
            //      e.g.    !dldarkclear tok    //clears all linked pairs associated with the selected token
            //              !dldarkclear page    //clears all linked pairs on current page
            //              !dldarkclear campaign    //clears all linked pairs in ENTIRE CAMPAIGN
            //----------------------------------------------------------------------------
            
            if(msg.type=="api" && msg.content.indexOf("!dldarkclear")==0) {
                who = getObj('player',msg.playerid).get('_displayname');
                
                let cmd = msg.content.split(/\s+/);
                
                if (cmd.length > 1) {
                    
                    if (msg.selected !== undefined) {
                        tokID = msg.selected[0]['_id'];
                        tok = getObj("graphic",tokID);
                        pageID = tok.get('pageid');
                    }
                    
                    switch(cmd[1].toLowerCase()) {
                        case 'tok':
                            if (tokID) {
                                let clearTok = clearCache(who, tokID);
                            } else {
                                sendChat(scriptName,`/w "${who}" `+ 'Error. You must select a token to proceed with this command.');
                                return;
                            }
                            break;
                        case 'token':
                            if (tokID) {
                                let clearTok = clearCache(who, tokID);
                            } else {
                                sendChat(scriptName,`/w "${who}" `+ 'Error. You must select a token to proceed with this command.');
                                return;
                            }
                            break;
                        case 'page':
                            if (tokID) {
                                let clearTok = clearCache(who, undefined, pageID);
                            } else {
                                sendChat(scriptName,`/w "${who}" `+ 'Error. You must select a token to proceed with this command.');
                                return;
                            }
                            break;
                        case 'campaign':
                            let clear = clearCache(who);
                            break;
                        default:
                            sendChat(scriptName,`/w "${who}" `+ 'Unknown argument. Format is \"!dldarkclear tok/page/campaign\"');
                            break;
                    }
                }
                return;
            }
            //--------------------------------------------------------------------
            //   Normal script operation
            //--------------------------------------------------------------------
            if(msg.type=="api" && msg.content.indexOf("!dldark")==0) {
                let selected = msg.selected;
                let buffer = 0;
                let makeGrid = true;
                let sendToMap = true;
                
                who = getObj('player',msg.playerid).get('_displayname');
                
                if (selected===undefined) {
                    sendChat(scriptName,`/w "${who}" `+ 'You must select a token to proceed');
                    return;
                }
                
                let cmd = msg.content.split(/\s+/);
                if (cmd.length > 1) {
                    if (isNaN(cmd[1])) {
                        sendChat(scriptName,`/w "${who}" `+ 'Non-numeric buffer detected. Format is \"!dldark # boolean boolean\"');
                        return;
                    } else {
                        buffer = parseInt(cmd[1]);
                    }
                }
                if (cmd.length > 2) {
                    if (_.contains(['true', 'yes', '1'], cmd[2].toLowerCase())) {
                        makeGrid = true;
                    } else if (_.contains(['false', 'no', '0'], cmd[2].toLowerCase())) {
                        makeGrid = false;
                    } else {
                        sendChat(scriptName,`/w "${who}" `+ 'Non-boolean makeGrid flag detected. Format is \"!dldark # boolean boolean\"');
                        return;
                    }
                }
                if (cmd.length > 3) {
                    if (_.contains(['true', 'yes', '1'], cmd[3].toLowerCase())) {
                        sendToMap = true;
                    } else if (_.contains(['false', 'no', '0'], cmd[3].toLowerCase())) {
                        sendToMap = false;
                    } else {
                        sendChat(scriptName,`/w "${who}" `+ 'Non-boolean sendToMapLayer flag detected. Format is \"!dldark # boolean boolean\"');
                        return;
                    }
                }
                
                tok = getObj("graphic",selected[0]._id);
                let left = tok.get("left");
                let top = tok.get("top");
                let pageID = tok.get("pageid");
                
                //page grid settings
                let thePage = getObj("page", pageID);
                //let pageScaleNumber = thePage.get("scale_number");
                let pageGridSize = 70 * thePage.get("snapping_increment");
                if ( pageGridSize === 0) { //gridless map support
                    //override user input
                    makeGrid = false;
                } 
                
                let radius = (tok.get("width"))/2 - buffer; 
                let pathstring = buildCircleGrid(who, radius, left, top, makeGrid, pageGridSize);
                
                let path = createObj("path", {                
                    pageid: tok.get("pageid"),
                    path: pathstring,
                    fill: "transparent",
                    stroke: "#ff0000",
                    layer: "walls",
                    stroke_width: 5,
                    width: radius*2,
                    height: radius*2,
                    left: tok.get("left"),
                    top: tok.get("top"),
                });
                
                //log(path.get("id"));
                
                if (path) {
                    if (sendToMap) {
                        tok.set("layer", "map");
                        toFront(tok);
                    } else {
                        toBack(tok);
                    }
                    
                    //create a link between the source token and the darkness path (stored in state object)
                    let newLink = makeLinkedPair(tok.get('_id'), path.get('_id'), tok.get('pageid'));
                    
                    sendChat(scriptName,`/w "${who}" `+ 'Darkness created on Dynamic Lighting layer');
                } else {
                    sendChat(scriptName,`/w "${who}" `+ 'Unknown error. createObj failed. DL path not created.');
                    return;
                }
            }
        } 
        catch(err) {
          sendChat('dldarkAPI',`/w "${who}" `+ 'Unhandled exception: ' + err.message);
        }
    };
    
    const registerEventHandlers = function() {
        on('chat:message', handleInput);
        on('change:graphic', handleTokenChange);
        on('destroy:graphic', handleRemoveToken);
        on('destroy:path', handleRemovePath);
    };

    on("ready",() => {
        checkInstall();
        registerEventHandlers();
    });
})();
