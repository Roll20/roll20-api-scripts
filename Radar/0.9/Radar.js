////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  Overview
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
    The Radar script creates an animated wavefront from a selected token to reveal visible and invisible tokens on the map
        ---The radar temporarily "pings" all token objects on the layers specified by spawning the default token of a character named "RadarPing"
            ---the RadarPing token should be a completely transparent token with an aura not visible to all players, with no "controlled by" properties set
            ---the "controlled by" property is set by the api to be the player that initiated the radar wave, enabling that player to see the location of pinged tokens
        ---The RadarPing tokens will disappear after a period of time determined by the user
*/

/*
    SETUP:
        (1) Create a character named "RadarPing"
        (2) Set the default token to a 1x1 square transparent png, with a 0ft aura NOT visible to all players.
            (a) Leave the "represents" property of the token blank.
            (b) Leave "edited & controlled by" property blank. This will be assigned dynamically to the player calling the script 
        (3) Create a macro or ability using the commands & arguments described below
        (4) Select a token as the source of the radar prior to activating the macro
    
    OUTPUT:
        (1) Animated wavefront extending from the selected token out to the max range
        (2) Temporary "Ping" of target tokens satisfying filter criteria (if any). Silent mode is also available, with gives visuals but no chat template
            (a) if no filters used, will output a numbered list of all tokens within range, along with directional information and distance from the origin token
            (b) if filters are used, the output will be grouped by filter keyword, then sequentially numbered along with directional information and distance from the origin token
                
*/


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  Command descriptions 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
    !radar {{
        --range|        <# <optional units> >           //Default=350. How far the radar range extends, in pixels. Measured from center of selected token. Accepts inline rolls e.g. [[ 5*70 ]]
                                                            //optionally, can specify units in "u" or the units in Page settings. e.g. "60u" or "60ft"
        --wavetype|     <circle/square/5e <optional coneDirection/tokenID coneAngle>    
                                                        //default=circle. range determined by pythagorean theorem
                                                        //square. Diagonals squares count as one unit
                                                        //5e. will produce a cone of ~53.14 deg. The width of cone is equal to the cone legnth.
                                                        //coneDirection - the angle of the center of the cone (clockwise positive, 0deg is straight up). If a tokenID is entered, the angle between the source and target token will be used
                                                        //coneAngle - the angle of the cone in degrees
        --spacing|      <#>                             //Default=35. The spacing between waves, in pixels (lower number = slower wavefront)
        --wavedelay|    <#>                             //Default=50. How much time to wait before next wave, in ms (higher number = slower wavefront)
        --wavelife|     <#>                             //Default=200. How long each wave wil remain on screen, in ms (higher number = more waves present at any one time)
        --pinglife|     <#>                             //Default=2000. How long each "RaindarPing" token wil remain on screen, in ms 
        --layers|       <gmlayer, objects, walls, map>  //Default="gmlayer, objects". Which layers to look for tokens. any or all may be included
                                                            //accepts "gmlayer" or "gm"
                                                            //accepts "objects" or "tokens"
                                                            //accepts "walls" or "dl"
                                                            //accepts "map"
                                                            //NOTE: if target tokens are found on DL(walls) or map layer, output will be in red text, indicating token is invisible to selected token
        --LoS|          <yes/true/1> or <no/false/0>    //Default=false. Will DL walls block radar sensor if completely obscured? To block, all corners and the center of the target token must be in LoS with the center of origin token 
        --title|        <text>                          //Default="Radar Ping Results". The title of the output template. e.g. "Divine Sense", "Tremorsense"
        --silent|       <yes/true/1> or <no/false/0> <gm>   //Default=false. If true, no output template will be sent to chat. animations only.
                                                            // optional "gm" flag to send result output to gm chat
                                                                    //e.g. --silent| true gm will only output to gm chat
        
        --units|  <u/units/squares/square/hexes/hex, Optional 3.5/pf/5e>
                                                        //if optional 5e or omitted, this will only affect display output (5e will use diag=1sq)
							//if pf or 3.5 is used, then both the display output AND the determination of if tok is within range will use PF-style calcs, where every other diag=1.5sq
                                                        //for GRIDLESS MAP, this command must be included or else all results will be INFINITY
							//	however, the optional parameters will only work with a gridded map.
        --visible|       <yes/true/1> or <no/false/0>   //Default=true. Set to false/no/0 to prevent the drawing of the wavefront animation
        --graphoptions|   < grid/circles/rings/reticle > //Default is a plain background. Can add graphical elements to display. Circles/Rings are interchangeable aliases
        --output|         < graph, table, compact >         //Default=table. Can include one or all of these elements. Compact attempts to put the table output on a single line
        --groupby|	     < yes/true/1> or <no/false/0 > //Default=true. When a charFilter or tokFilter is used, this flag determines if table results are grouped by filter attribute
        //--------------------------------------------------------------------------------------
        //THE FOLLOWING TWO COMMANDS ARE USED WHEN CALLING RADAR FROM ANOTHER API SCRIPT 
        //  e.g. sendChat(scriptName, `!radar --selectedID|${msg.selected[0]._id} --playerID|${msg.playerid}`
        --selectedID|   <ID of the selected token>              //used to identify the radar origin token
        --playerID|     <ID of the player calling the script>   //used to determine who gets whispered the results
        //--------------------------------------------------------------------------------------
        
        //--------------------------------------------------------------------------------------
        //ONLY CHOOSE ONE OF THESE TWO FILTERS: (tokfilter or charfilter)
                //if used, output template will group by filter keyword
                
        --tokfilter|    <property>:<optional matchType><filterText1<optional #color>,..., -exclude text>  
                        e.g. "bar3_value:celestial, fiend, undead, -cloak"
                        e.g. "bar1_value:>0"
                                                                                //only pings tokens where bar3_value contains either celestial, fiend, or undead. Ignore tokens with "cloak"
                                                                                //the only valid <properties> are:
                                                                                    // "bar1_value"
                                                                                    // "bar2_value"
                                                                                    // "bar3_value"
                                                                                    // "bar1_max"
                                                                                    // "bar2_max"
                                                                                    // "bar3_max"
                                                                                    // "gmnotes"
                                                                                //optional matchTypes:
                                                                                    //"@" - exact match
                                                                                    //">" - greater than (numeric only)
                                                                                    //"<" - less than (numeric only)
                        e.g. with optional color coded auras by filter group
                            "bar3_value:celestial#yellow, fiend#red, undead#blue, -cloak"
                                                                                //Valid aura colors:
                                                                                    // "#red"  (default)
                                                                                    // "#green"
                                                                                    // "#blue"
                                                                                    // "#yellow"
                                                                                    // "#9900ff" (any custom html color accepted)
         
        --charfilter|   <attribute>:<optional matchType><filterText1, filterText2, -excludeText>  
                        e.g. "npc_type:celestial, fiend, undead, -nondetection"
                                                                                //only ping tokens where npc_type attribute contains either celestial, fiend, or undead. Ignore tokens with "cloak"
                                                                                //any text may be entered for <attribute>
                                                                                    //if attribute doesn't exist on character sheet, token is ignored
                                                                                    //if token does not represent a character, it is ignored if this filter is used
                                                                                //optional matchTypes:
                                                                                    //"@" - exact match
                                                                                    //">" - greater than (numeric only)
                                                                                    //"<" - less than (numeric only)
                        e.g. with optional color coded auras by filter group
                            "npc_type:celestial#yellow, fiend#red, undead#blue, -cloak"
                                                                                    //same colors available as for tokfilter
        //--------------------------------------------------------------------------------------
    }}
*/
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// adding API_Meta for line offset
var API_Meta = API_Meta || {};
API_Meta.RadarWIP = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.RadarWIP.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (105)); }
}
//        log(`RadarWIP Offset: ${API_Meta.RadarWIP.offset}`);
const Radar = (() => {
    
    const scriptName = "Radar";
    const version = '0.9';
    
    const PING_NAME = 'RadarPing'; 
    const hRED = '#ff0000';
    const hYELLOW = '#ffff00';
    const hGREEN = '#00ff00';
    const hBLUE = '#0000ff';
    
    //settings for graphical html output
    let graphHeight = 230;
    let graphWidth = 230;
    
    //Title ribbon + Table
    let htmlTableTemplateStart = `<div style="width: 100%; min-height: 2em; z-index: 2; font-style:normal; font-size: 1em; text-align: center; line-height: 2em; font-weight: bold; color: #eeeeee; text-shadow: -1px 1px 0 #000, 1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000; background:#000000; background-image: radial-gradient(circle, #007700 0%, #006600 10%, #004400 40%, #003300 55%, #000000 80%, transparent 100%);border-width: 1px; border-style: solid; border-color: black; border-radius: 6px 6px 0px 0px;">=X=TITLE=X= (units:=X=UNITS=X=)</div>` +
                                 `<div style="display: table; position: relative; padding-top: 0em; padding-bottom: 0.2em; width:100%; border: 1px solid #000000; border-radius: 0px 0px 6px 6px; border-collapse: separate; line-height: 2em; background:#ffffff; z-index: 1;">`
	
	let htmlTableTemplateEnd = `</div><br />`;
    let tableLineCounter = 0;
    
    const checkInstall = function() {
        log(scriptName + ' v' + version + ' initialized.');
        log(`RadarWIP Offset: ${API_Meta.RadarWIP.offset}`);
    };
    
    const pt = function(x,y) {
        this.x = x,
        this.y = y
    };
    
    const buildRowOutput = function (useGroups, group, itemNum, text) {
        let cellContents = '';
        let rowHTML = '';
        
        tableLineCounter += 1;
        
        if (useGroups) {
            //results are grouped by a filter
            cellContents = `<div style="display: table-cell; padding-left: 5px"><b>${group}</b></div>` +
                           `<div style="display: table-cell; text-align: center"><b>${itemNum}</b></div>` +
                           `<div style="display: table-cell;">${text}</div>` 
        } else {
            //results are numbered individually
            cellContents = `<div style="display: table-cell; text-align: center"><b>${itemNum}</b></div>` +
                           `<div style="display: table-cell;">${text}</div>` 
        }
        
        if (tableLineCounter % 2 == 0) {
			rowHTML = `<div style="display: table-row; vertical-align: top; width:1px; white-space:nowrap; line-height: 1.7em; background:#dddddd;">` +
                cellContents +
            `</div>`
		} else {
			rowHTML = `<div style="display: table-row; vertical-align: top; width:1px; white-space:nowrap; line-height: 1.7em; background:#ffffff;">` +
                cellContents +
            `</div>`
		}
        
		return rowHTML;
	}
    
    
    const getCleanImgsrc = function (imgsrc) {
        let parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^\?]*)(\?[^?]+)?$/);
            if(parts) {
                return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
            }
        return;
    };
    
    //html output formatting styles, approach taken from TheAaron's Token-mod script
    const _h = {
        bold: (...o) => `<b>${o.join(' ')}</b>`,
        red: (...o) => `<span style="color: red">${o.join('')}</span>`,
        blue: (...o) => `<span style="color: blue">${o.join('')}</span>`,
        purple: (...o) => `<span style="color: rgba(112,32,130,1)">${o.join('')}</span>`,
        inlineResult: (...o) => `<span style="font-weight: bold;padding: .2em .2em; background-color:rgba(254,246,142,1);">${o.join('')}</span>`
    };
    
    
    const toFullColor = function(htmlstring, defaultAlpha = 'ff') {
        let s=htmlstring.toLowerCase().replace(/[^0-9a-f]/,'');
        switch(s.length){
            case 3:
                s=`${s[0]}${s[0]}${s[1]}${s[1]}${s[2]}${s[2]}${defaultAlpha}`;
                break;
            case 4:
                s=`${s[0]}${s[0]}${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
                break;
            case 6:
                s=`${s}${defaultAlpha}`;
                break;
        }
        return `#${s}`;
    };
    
    async function DeleteSpawnedToken(id, lifetime) {
        let tok;
        let result;
        
        let promise = new Promise(resolve => {
            setTimeout(() => {
                tok = getObj("graphic", id);
                resolve("done!");
            }, lifetime);
        });
        
        result = await promise;
        tok.remove();
    }
    
    const spawnTokenAtXY = function (who, tokenJSON, pageID, spawnX, spawnY, sizeX, sizeY, controlledby, lifetime, auraColor) {
        let spawnObj;
        let imgsrc;
        
        try {
            let baseObj = JSON.parse(tokenJSON);
            
            //set token properties
            baseObj.pageid = pageID;
            baseObj.left = spawnX;
            baseObj.top = spawnY;
            baseObj.width = sizeX;
            baseObj.height = sizeY;
            
            baseObj.controlledby = controlledby;
            baseObj.playersedit_aura1 = true;
            baseObj.aura1_color = auraColor;
            
            if (baseObj.aura1_radius === undefined) {
                baseObj.aura1_radius = 0;
            }
            
            baseObj.imgsrc = getCleanImgsrc(baseObj.imgsrc); //ensure that we're using the thumb.png
            
            //image must exist in personal Roll20 image library 
            if (baseObj.imgsrc ===undefined) {
                sendChat('Radar',`/w "${who}" `+ 'Unable to find imgsrc for default token of \(' + baseObj.name + '\)' + "<br>" + 'You must use an image file that has been uploaded to your Roll20 Library.')
                return;
            }
            
            
            //Spawn the Token!
            spawnObj = createObj('graphic',baseObj);
            
            //delete the token after a set lifetime (ms)
            DeleteSpawnedToken(spawnObj.id, lifetime);
            
            return new Promise(resolve => {
                resolve("done!");
            });
        }
        catch(err) {
          sendChat('Radar',`/w "${who}" `+ 'Unhandled exception: ' + err.message)
        }
    };
    
    //returns character object for given name
    const getCharacterFromName = function (charName) {
        let character = findObjs({
            _type: 'character',
            name: charName
        }, {caseInsensitive: true})[0];
        return character;
    };
    
    const get5eConePt = function (rad, theta) {
        let deg2rad = Math.PI/180;
        //change in "normal" polar coord conversion due to 0deg being straight up and positive Y being "down"
        let x = rad + rad * Math.sin(theta);
        let y = rad + rad * Math.cos(theta + deg2rad*180);
        return new pt(x,y);
    }
    
    const getSquareArcPt = function (rad, theta) {
        //theta in degrees
        let x, y;
        let deg2rad = Math.PI/180;
        switch (true) {
            case (theta === 0):
                x = rad;
                y = 0;
                break;
            case (theta>0 && theta<45):
                x = rad + rad*Math.tan(theta*deg2rad);
                y = 0;
                break;
            case (theta === 45):
                x = 2*rad;
                y = 0;
                break;
            case (theta>45 && theta<90):
                x = 2*rad;
                y = rad - rad*Math.tan(90*deg2rad - theta*deg2rad);
                break;
            case (theta === 90):
                x = 2*rad;
                y = rad;
                break;
            case (theta>90 && theta<135):
                x = 2*rad;
                y = rad + rad*Math.tan(theta*deg2rad - 90*deg2rad);
                break;
            case (theta === 135):
                x = 2*rad;
                y = 2*rad;
                break;
            case (theta>135 && theta<180):
                x = rad + rad*Math.tan(180*deg2rad-theta*deg2rad);
                y = 2*rad;
                break;
            case (theta === 180):
                x = rad;
                y = 2*rad;
                break;
            case (theta>180 && theta<225):
                x = rad - rad*Math.tan(theta*deg2rad - 180*deg2rad);
                y = 2*rad;
                break;
            case (theta === 225):
                x = 0;
                y = 2*rad;
                break;
            case (theta>225 && theta<270):
                x = 0;
                y = rad + rad*Math.tan(270*deg2rad-theta*deg2rad);
                break;
            case (theta === 270):
                x = 0;
                y = rad;
                break;
            case (theta>270 && theta<315):
                x = 0;
                y = rad - rad*Math.tan(theta*deg2rad-270*deg2rad);
                break;
            case (theta === 315):
                x = 0;
                y = 0;
                break;
            case (theta>315 && theta<360):
                x = rad - rad*Math.tan(360*deg2rad-theta*deg2rad);
                y = 0;
                break;
        }
        let tempPt = new pt(x, y);
        //log(tempPt.x + ', ' + tempPt.y);
        return tempPt;
    }
    
    const normalizeTo360deg = function(deg) {
        deg = deg % 360;
        if (deg < 0) {deg += 360;}
        return deg;
    }
    
    const isCoincidentPt = function(pt1, pt2) {
        let coincident = false;
        if (pt1.x === pt2.x && pt1.y === pt2.y) { coincident = true; }
        return coincident;
    }
    
    const addCornerPtsToCone = function(conePts, sqPts) {
        //sqPts = [UL, UR, LR, LL]
        //conePts = [pt1, pt2, pt3]     --pt2 is the "direction of the cone, pts 1&2 define the outer cone regions
        //coneAngles = [th1, th2, th3]  --
        //
        //            side1                     e.g.
        //      (UL)--------(UR)            (pt1)  (pt2) (UR)
        //        |           |                 \   /
        //  side0 |    (o)    | side2            \ /
        //        |           |                  (o)-----(pt3)
        //      (LL)--------(LR)                   
        //            side3                        
        //                                         
        
        let finalPts = [conePts[0]];    //first pt of final array is always pt1
        let conePtsSides = [-1, -1, -1];
        let sqPtsIncluded = [false, false, false, false];   //UL, UR, LR, LL
        let pt1Side = 0;
        let pt2Side = 0;
        let pt3Side = 0;
        let isCoincident = false;
        
        //find which sides of square each conePt resides
        for (let i=0; i<conePts.length; i++) {
            if (conePts[i].x ===sqPts[0].x) { conePtsSides[i] = 0 } 
            else if (conePts[i].y ===sqPts[1].y) { conePtsSides[i] = 1 }
            else if (conePts[i].x ===sqPts[2].x) { conePtsSides[i] = 2 }
            else if (conePts[i].y ===sqPts[3].y) { conePtsSides[i] = 3 }
        }
        
        //Look for corners between pts 1 & 2
            //corner inclusion is based on relative position of pts 1&2
        for (let i=0; i<4; i++) {   //for all possible sides of pt1
            isCoincident = isCoincidentPt(conePts[0], sqPts[i]);
            if (conePtsSides[0] === i && conePtsSides[1] === (i+2)%4) {   //pt1 & pt2 are opposite sides
                if (!isCoincident && !sqPtsIncluded[i]) {
                    finalPts.push(sqPts[i])     //pt1 not coincident with corner1 => add corner i if not already added
                    sqPtsIncluded[i] = true;
                    if (!sqPtsIncluded[(i+1)%4]) {  
                        finalPts.push(sqPts[(i+1)%4])       //add corner i+1 (wraps to 0), if not already added
                        sqPtsIncluded[(i+1)%4] = true;
                    }
                } else if (!sqPtsIncluded[(i+1)%4]) {
                    finalPts.push(sqPts[(i+1)%4])           //when pt1 is coincident with corner i => only add corner i+1 (wraps to 0), if not already added
                    sqPtsIncluded[(i+1)%4] = true;
                }
            } else if (conePtsSides[0] === i && conePtsSides[1] === (i+1)%4) {   //pt1 & pt2 are on adjacent sides
                if (!isCoincident) {
                    finalPts.push(sqPts[i])     //only add corner i
                    sqPtsIncluded[i] = true;
                }
            }
        }
        
        //add pt2
        finalPts.push(conePts[1]);  
        
        //Now, look for corners between pts 2 & 3
        for (let i=0; i<4; i++) {   //for all possible sides of pt1
            isCoincident = isCoincidentPt(conePts[1], sqPts[i]);
            if (conePtsSides[1] === i && conePtsSides[2] === (i+2)%4) {   //pt1 & pt2 are opposite sides
                if (!isCoincident && !sqPtsIncluded[i]) {
                    finalPts.push(sqPts[i])     //pt2 not coincident with corner1 => add corner i if not already added
                    sqPtsIncluded[i] = true;
                    if (!sqPtsIncluded[(i+1)%4]) {  
                        finalPts.push(sqPts[(i+1)%4])       //add corner i+1 (wraps to 0), if not already added
                        sqPtsIncluded[(i+1)%4] = true;
                    }
                } else if (!sqPtsIncluded[(i+1)%4]) {
                    finalPts.push(sqPts[(i+1)%4])           //when pt2 is coincident with corner i => only add corner i+1 (wraps to 0), if not already added
                    sqPtsIncluded[(i+1)%4] = true;
                }
            } else if (conePtsSides[1] === i && conePtsSides[2] === (i+1)%4) {   //pt2 & pt3 are on adjacent sides
                if (!isCoincident) {
                    finalPts.push(sqPts[i])     //only add corner i
                    sqPtsIncluded[i] = true;
                }
            }
        }
        
        //add pt3
        finalPts.push(conePts[2]);
        
        return finalPts;
    }
    
    /*
    ~~~~5e cone~~~~
    Have to size the svg [path] coordinate system to account for the corners of triangle potentially extending beyond the "radius" when rotated 
    
            maximum horiz dist from 0 to z = rsin(atan(0.5)) / tan(90-atan(0.5))
            Occurs when on one of the outer cone lines lies at 0/90/180/270deg
            
            (z,0)           (z+r,0)
    (0,0)    |              |                           (2*(z+r), 0)     
        O-----------------------------------------------O
        |                                               |
        |                                               |
        |                                               |
        |                                               |
        |       O                                       |
        |      * *                                      |
        |     *    *                                    |
        |    *       *                                  |
        |   **        *                                 |
        |  *    * r     *                               |
        | *         *    *                              |
        |*              *  *                            |
        O * z * * * * * * * O (origin)                  O (2*(z+r), z+r)
        |                     (z+r,z+r)                 |
        |                                               |
        |                                               |
        |                                               |
        |                                               |
        |                                               |
        |                                               |
        |                                               |
        |                                               |
        |                                               |
        |                                               |
        O_______________________________________________O(2*(z+r), 2*(z+r))
    (0,2*(z+r))
    
    
    
    //attempte picture of a pie slice cone inside of a triangle. Triangle is the 5e cone.
                O                                       
               * *                                      
              *  * *                                    
             * *     *                                  
            **        *                                 
           **    * r    *                               
          * *        *    *                              
         *   *        th *  *                            
        O * * * * * * * * * * O (origin)
        |--z--|-------r-------|
        
        a) From SOHCAHTOA -> sin(th) = (r/2) / (r+z)
        b) Also, half of cone width = (th) = atan(0.5) for a 5e cone, ~26.56deg
        So, solving for z from eq (a)
            z = (r / 2sin(th)) - r
        Substitute for theta from eq (b) gives us the ratio between z & r
            z = (r / 2sin(atan(0.5))) - r
    
    */
    
    const build5eCone = function(rad, z, coneWidth, coneDirection) {
        let pointsJSON = '';
        let deg2rad = Math.PI/180;
        //see above for details of what "z" is
        //let z = (rad / (2*Math.sin(Math.atan(0.5)))) - rad;
                
        let ptOrigin = new pt(rad+z, rad+z);
        let ptUL = new pt(0,0);
        let ptUR = new pt(2*(rad+z),0);
        let ptLR = new pt(2*(rad+z),2*(rad+z));
        let ptLL = new pt(0,2*(rad+z));
        /*
        log('rad = ' + rad);
        log('z = ' + z);
        log(ptOrigin);
        log(ptUL);
        log(ptUR);
        log(ptLR);
        log(ptLL);
        */
        let oX = oY = rad + z;
        //normalize rotation to 360deg and find defining angles (converted to radians)
        
        coneDirection = normalizeTo360deg(coneDirection);
        
        //define "cone" angles (in degrees)
        let th1 = deg2rad * (coneDirection - coneWidth/2);  //angle of trailing cone side
        let th2 = deg2rad * (coneDirection + coneWidth/2);  //angle of leading cone side

        //a 5e cone is defined by the orgin and two pts
        let pt1 = get5eConePt(rad+z, th1);
        let pt2 = get5eConePt(rad+z, th2);
        //let conePtsArr = [ptOrigin, pt1, pt2];
        
        //start path at the origin pt, connect to pts 1&2, then back to origin 
        pointsJSON = `[[\"M\",${ptOrigin.x},${ptOrigin.y}],[\"L\",${pt1.x},${pt1.y}],[\"L\",${pt2.x},${pt2.y}],[\"L\",${ptOrigin.x},${ptOrigin.y}],`;
        //add "phantom" single points to path corresponding to the four corners to keep the size computations correct
        pointsJSON = pointsJSON + `[\"M\",${ptUL.x},${ptUL.y}],[\"L\",${ptUL.x},${ptUL.y}],[\"M\",${ptUR.x},${ptUR.y}],[\"L\",${ptUR.x},${ptUR.y}],[\"M\",${ptLR.x},${ptLR.y}],[\"L\",${ptLR.x},${ptLR.y}],[\"M\",${ptLL.x},${ptLL.y}],[\"L\",${ptLL.x},${ptLL.y}],[\"M\",${ptUL.x},${ptUL.y}],[\"L\",${ptUL.x},${ptUL.y}]]`;
    
        //log(pointsJSON);
        return pointsJSON;
    };
    
    /*
    const build5eConeBAD = function(rad, coneWidth, coneDirection) {
        let pointsJSON = '';
        let deg2rad = Math.PI/180;
        let ptOrigin = new pt(rad, rad);
        let ptUL = new pt(0,0);
        let ptUR = new pt(2*rad,0);
        let ptLR = new pt(2*rad,2*rad);
        let ptLL = new pt(0,2*rad);
        
        let oX = oY = rad;
        //normalize rotation to 360deg and find defining angles (converted to radians)
        
        coneDirection = normalizeTo360deg(coneDirection);
        
        //define "cone" angles (in degrees)
        //let th1 = deg2rad * normalizeTo360deg(coneDirection - coneWidth/2);
        //let th2 = deg2rad * normalizeTo360deg(coneDirection + coneWidth/2);
        let th1 = deg2rad * (coneDirection - coneWidth/2);
        let th2 = deg2rad * (coneDirection + coneWidth/2);
        //a 5e cone is defined by the orgin and two pts
        let pt1 = get5eConePt(rad, th1);
        let pt2 = get5eConePt(rad, th2);
        let conePtsArr = [ptOrigin, pt1, pt2];
        
        //start path at the origin pt, connect to pts 1&2, then back to origin 
        pointsJSON = `[[\"M\",${ptOrigin.x},${ptOrigin.y}],[\"L\",${pt1.x},${pt1.y}],[\"L\",${pt2.x},${pt2.y}],[\"L\",${ptOrigin.x},${ptOrigin.y}],`;
        //add "phantom" single points to path corresponding to the four corners to keep the size computations correct
        pointsJSON = pointsJSON + `[\"M\",${ptUL.x},${ptUL.y}],[\"L\",${ptUL.x},${ptUL.y}],[\"M\",${ptUR.x},${ptUR.y}],[\"L\",${ptUR.x},${ptUR.y}],[\"M\",${ptLR.x},${ptLR.y}],[\"L\",${ptLR.x},${ptLR.y}],[\"M\",${ptLL.x},${ptLL.y}],[\"L\",${ptLL.x},${ptLL.y}],[\"M\",${ptUL.x},${ptUL.y}],[\"L\",${ptUL.x},${ptUL.y}]]`;
    
        //log(pointsJSON);
        return pointsJSON;
    };
    */
    
    const buildSquare = function(rad, coneWidth, coneDirection) {
        let squarePointsJSON = '';
        let deg2rad = Math.PI/180;
        let ptOrigin = new pt(rad, rad);
        let ptUL = new pt(0,0);
        let ptUR = new pt(2*rad,0);
        let ptLR = new pt(2*rad,2*rad);
        let ptLL = new pt(0,2*rad);
        let squarePtsArr = [ptUL, ptUR, ptLR, ptLL];     //array of square corner pts
        
        if (coneWidth % 360 === 0) {
            //Full square
            //squarePoints = `[[\"M\",0,0],[\"L\",0,${2*rad}],[\"L\",${2*rad},${2*rad}],[\"L\",${2*rad},0],[\"L\",0,0]]`;
            squarePointsJSON = `[[\"M\",${ptUL.x},${ptUL.y}],[\"L\",${ptUR.x},${ptUR.y}],[\"L\",${ptLR.x},${ptLR.y}],[\"L\",${ptLL.x},${ptLL.y}],[\"L\",${ptUL.x},${ptUL.y}]]`;
        } else {
            //take a "slice" of the square
            let oX = oY = rad;
            //normalize rotation to 360deg and find defining angles (converted to radians)
            coneDirection = normalizeTo360deg(coneDirection);
            
            //define "cone" angles (in degrees)
            let th1 = normalizeTo360deg(coneDirection - coneWidth/2);
            let th2 = normalizeTo360deg(coneDirection);
            let th3 = normalizeTo360deg(coneDirection + coneWidth/2);
            
            //a slice of square is defined by three pts, plus potentially one or more of the square corner pts
            let pt1 = getSquareArcPt(rad, th1);
            let pt2 = getSquareArcPt(rad, th2);
            let pt3 = getSquareArcPt(rad, th3);
            let conePtsArr = [pt1, pt2, pt3];
            
            //**********THIS WORKS!!!**********
            finalPtsArr = addCornerPtsToCone(conePtsArr, squarePtsArr);
            //*********************************
            //if isPointInCone(add stuff here for UL, UR, etc)
            
            //start path at the origin pt 
            squarePointsJSON = `[[\"M\",${oX},${oY}],`;
            for (let i=0; i<finalPtsArr.length; i++) {
                squarePointsJSON = squarePointsJSON + `[\"L\",${finalPtsArr[i].x},${finalPtsArr[i].y}],`
            }
            //connect back to the origin pt
            squarePointsJSON = squarePointsJSON + `[\"L\",${oX},${oY}],`
            //add "phantom" single points to path corresponding to the four corners to keep the size computations correct
            squarePointsJSON = squarePointsJSON + `[\"M\",${ptUL.x},${ptUL.y}],[\"L\",${ptUL.x},${ptUL.y}],[\"M\",${ptUR.x},${ptUR.y}],[\"L\",${ptUR.x},${ptUR.y}],[\"M\",${ptLR.x},${ptLR.y}],[\"L\",${ptLR.x},${ptLR.y}],[\"M\",${ptLL.x},${ptLL.y}],[\"L\",${ptLL.x},${ptLL.y}],[\"M\",${ptUL.x},${ptUL.y}],[\"L\",${ptUL.x},${ptUL.y}]]`;
            
        } 
        
        //log(squarePointsJSON);
        return squarePointsJSON;
    };
    
    //Circle building portion of function is modified from TheAaron's "dlcircle" script
    const buildCircle = function(rad, coneWidth, coneDirection) {
        let circlePoints;
        let steps, stepSize;
        let deg2rad = Math.PI/180;
        
        steps = Math.min(Math.max(Math.round( (Math.PI*2*Math.sqrt((2*rad*rad)/2))/35),4),20);
        
        const at = (theta) => ({x: Math.cos(theta)*rad, y: Math.sin(theta)*rad}); 
        
        if (coneWidth === 360) { 
            //Build a full circle
            stepSize = Math.PI/(2*steps);
            
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
            
            //Some js wizardry from TheAaron with the array map function. I couldn't make it work without returning the outer (1st & last) square brackets
            //So, we will take this string, strip the last "]", then append the grid points to the path
            circlePoints = JSON.stringify(acc.map((v,i)=>([(i?'L':'M'),rad+v[0],rad+v[1]])));
            circlePoints = circlePoints.substring(0, circlePoints.length - 1);
        } else {
            //build a cone instead
            steps = 50;
            stepSize = deg2rad * (coneWidth/(steps));
            
            let oX = oY = rad;
            let x, y;
            let startAngle = deg2rad * (coneDirection - coneWidth/2);
            let endAngle = deg2rad * (coneDirection + coneWidth/2);
            let ptUL = new pt(0,0);
            let ptUR = new pt(2*rad,0);
            let ptLR = new pt(2*rad,2*rad);
            let ptLL = new pt(0,2*rad);
            
            //start path at the origin pt 
            circlePoints = `[[\"M\",${oX},${oY}],`;
            
            //for loop takes into account cumulative floating point precision error
            for (let th=startAngle; th<endAngle+Number.EPSILON*steps; th+=stepSize) {
                //change in "normal" polar coord conversion due to 0deg being straight up and positive Y being "down"
                x = oX + oX * Math.sin(th);
                y = oY + oY * Math.cos(th + deg2rad*180);
                circlePoints = circlePoints + `[\"L\",${x},${y}],`
            }
            
            //connect back to the origin pt
            circlePoints = circlePoints + `[\"L\",${oX},${oY}],`;
            //add "phantom" single points to path corresponding to the four corners to keep the size computations correct
            circlePoints = circlePoints + `[\"M\",${ptUL.x},${ptUL.y}],[\"L\",${ptUL.x},${ptUL.y}],[\"M\",${ptUR.x},${ptUR.y}],[\"L\",${ptUR.x},${ptUR.y}],[\"M\",${ptLR.x},${ptLR.y}],[\"L\",${ptLR.x},${ptLR.y}],[\"M\",${ptLL.x},${ptLL.y}],[\"L\",${ptLL.x},${ptLL.y}],[\"M\",${ptUL.x},${ptUL.y}],[\"L\",${ptUL.x},${ptUL.y}]`;
        }
        
        //return  the path JSON
        return circlePoints + "]";
    };
    
    async function drawWave(pageID, pathstring, fill, stroke, layer, thickness, radius, x, y, lifetime) {
        let wave
        let waveID;
        let waveObj;
        let promise;
        let Result;
        
        wave = createObj("path", {                
            pageid: pageID,
            path: pathstring,
            fill: fill,
            stroke: stroke,
            layer: layer,
            stroke_width: thickness,
            width: radius*2,
            height: radius*2,
            left: x,
            top: y
        });
        waveID = wave.id
        
        promise = new Promise((resolve, reject) => {
            setTimeout(() => {
                waveObj = getObj("path", waveID);
                resolve("done!");
            }, lifetime);
        });
        
        result = await promise;
        waveObj.remove();
    }
    
    const  DegreesToRadians = function (degrees) {
      var pi = Math.PI;
      return degrees * (pi/180);
    }
    
    //cx, cy = coordinates of the center of rotation
    //angle = clockwise rotation angle
    //p = point object
    const RotatePoint = function (cX,cY,angle, p){
          s = Math.sin(angle);
          c = Math.cos(angle);
        
          // translate point back to origin:
          p.x -= cX;
          p.y -= cY;
        
          // rotate point
          newX = p.x * c - p.y * s;
          newY = p.x * s + p.y * c;
        
          // translate point back:
          p.x = newX + cX;
          p.y = newY + cY;
          return p;
        }
    
    const distBetweenPts = function(pt1, pt2, calcType='Euclidean', gridIncrement=-999, scaleNumber=-999, forDisplayOnly=false) {
        let distPx;     //distance in Pixels
        let distUnits;  //distance in units (gridded maps only)
        if ( (calcType === 'PF' || (calcType === '5e' && forDisplayOnly === true)) && gridIncrement !== -999 & scaleNumber !== -999) {
            //using 'Pathfinder' or '3.5e' distance rules, where every other diagonal unit counts as 1.5 units. 
            //..or using 5e diagonal rules where each diag only counts 1 square. 
            //..5e is special due to how t is constructed. We use Euclidean distance to determine if in cone, but we can display in 5e units. 
                //Only compatible with gridded maps
                //convert from pixels to units, do the funky pathfinder math, then convert back to pixels
            let dX = (Math.abs(pt1.x - pt2.x) * scaleNumber / 70) / gridIncrement;
            let dY = (Math.abs(pt1.y - pt2.y) * scaleNumber / 70) / gridIncrement;
            let maxDelta = Math.max(dX,dY);
            let minDelta = Math.min(dX, dY);
            let minFloor1pt5Delta;
            if (calcType === '5e') {
                //diagonals count as one square
                minFloor1pt5Delta = Math.floor(1.0 * minDelta);
            } else if (calcType === 'PF') {
                //every other diagonal counts as 1.5 squares
                minFloor1pt5Delta = Math.floor(1.5 * minDelta);
            }
            
            /*
            log(pt1);
            log(pt2);
            log('gridIncrement = ' + gridIncrement);
            log('scaleNumber = ' + scaleNumber);
            log('dX = ' + dX);
            log('dY = ' + dY);
            log('maxDelta = ' + maxDelta);
            log('MinDelta = ' + minDelta);
            log('minFloor1pt5Delta = ' + minFloor1pt5Delta);
            let temp = maxDelta - minDelta + minFloor1pt5Delta;
            log('distU = ' + temp);
            */
            
            //convert dist back to pixels
            distUnits = Math.floor( (maxDelta-minDelta + minFloor1pt5Delta) / scaleNumber ) * scaleNumber
            distPx = distUnits * 70 * gridIncrement / scaleNumber; 
            //floor( ( maxDelta-minDelta + minFloor1pt5Delta ) /5  )*5
            
            //log('distP = ' + distPx);
            /*
            [[ floor((([[{abs((@{position-x}-@{target|Target|position-x})*5/70),abs((@{position-y}-@{target|Target|position-y})*5/70)}kh1]]-
            [[{abs((@{position-x}-@{target|Target|position-x})*5/70),abs((@{position-y}-@{target|Target|position-y})*5/70)}kl1]])+
            floor(1.5*([[{abs((@{position-x}-@{target|Target|position-x})*5/70),abs((@{position-y}-@{target|Target|position-y})*5/70)}kl1]])))/5)*5]]
            */
        } else {
            //default Pythagorean theorem
            distPx = Math.sqrt( Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2) );
        }
        
        return distPx;
    }
    
    //finds distance between origin pt(center of origin token) to the CLOSEST corner of the target token
        //if nearestUnit===true, then round the distance to the nearest square. e.g. 5ft squares-> if distance is 30.4ft, round to 30ft.
    const TokToOriginDistance = function(tok, originX, originY, gridIncrement, scaleNumber, calcType) {
        let minDist;
        let dist;
        let centerDistX;    //used for graphical outout (set by top, left)
        let centerDistY;    //used for graphical outout (set by top, left)
        let tokX = tok.get("left");
        let tokY = tok.get("top");
        let w = tok.get("width");
        let h = tok.get("height");
        let rot = DegreesToRadians(tok.get("rotation"));  //rotation in radians
        let closestPt;
        let closestDist;
        let corners = [];
        
        //log('gridIncrement = ' + gridIncrement);
        //log('target token center point = ' + tokX + ', ' + tokY);
        centerDistX = tokX - originX; //used for graphical outout
        centerDistY = tokY - originY; //used for graphical outout
        
        //define the four corners of the target token as new points
            //we will also rotate those corners appropriately around the target tok center
            //These will be used to determine LoS blocking
        corners.push(RotatePoint(tokX, tokY, rot, new pt( tokX-w/2, tokY-h/2 )))     //Upper left
        corners.push(RotatePoint(tokX, tokY, rot, new pt( tokX+w/2, tokY-h/2 )))     //Upper right
        corners.push(RotatePoint(tokX, tokY, rot, new pt( tokX-w/2, tokY+h/2 )))     //Lower left
        corners.push(RotatePoint(tokX, tokY, rot, new pt( tokX+w/2, tokY+h/2 )))     //Lower right
        
        //Find the center of the squares corresponding to the corners of the target token (used to determine distance) 
        let pUL = new pt( tokX-w/2 + 35/gridIncrement, tokY-h/2 + 35/gridIncrement )     //Upper left
        let pUR = new pt( tokX+w/2 - 35/gridIncrement, tokY-h/2 + 35/gridIncrement )     //Upper right
        let pLL = new pt( tokX-w/2 + 35/gridIncrement, tokY+h/2 - 35/gridIncrement )     //Lower left
        let pLR = new pt( tokX+w/2 - 35/gridIncrement, tokY+h/2 - 35/gridIncrement )     //Lower right
        
        pUL = RotatePoint(tokX, tokY, rot, pUL);
        pUR = RotatePoint(tokX, tokY, rot, pUR);
        pLL = RotatePoint(tokX, tokY, rot, pLL);
        pLR = RotatePoint(tokX, tokY, rot, pLR);
        
        
        //log(originX + ', ' + originY);
        //log(pUL);
        //log(pUR);
        //log(pLL);
        //log(pLR);
        
        let pOrigin = new pt(originX, originY); //center pt of the origin token
        
        //Upper Left corner
        //minDist = dist = Math.sqrt( Math.pow(originX - pUL.x, 2) + Math.pow(originY - pUL.y, 2) );
        minDist = dist = distBetweenPts(pOrigin, pUL, calcType, gridIncrement, scaleNumber)
        
        closestPt = pUL;
        closestDist = dist;
        
        //Upper Right corner
        dist = distBetweenPts(pOrigin, pUR, calcType, gridIncrement, scaleNumber)
        //log('distUR = ' + dist);
        if (dist < minDist) {
            minDist = dist;
            closestPt = pUR;
            closestDist = dist;
        }
        
        //Lower Left corner
        dist = distBetweenPts(pOrigin, pLL, calcType, gridIncrement, scaleNumber)
        //log('distLL = ' + dist);
        if (dist < minDist) {
            minDist = dist;
            closestPt = pLL;
            closestDist = dist;
        }
        
        //Lower Right corner
        dist = distBetweenPts(pOrigin, pLR, calcType, gridIncrement, scaleNumber)
        //log('distLR = ' + dist);
        if (dist < minDist) {
            minDist = dist;
            closestPt = pLR;
            closestDist = dist;
        }
        
        if (calcType==='Euclidean') {
            //default case
            minDist = Math.round(minDist, 1); 
        } else {
            //No display rounding needed. This was handled previously in the distBetweenPts function
        }
        
        //log(closestDist + ' => ' + closestPt.x + ', ' + closestPt.y)
        
        return minDist = {
            dist: minDist,
            centerDistX: centerDistX,
            centerDistY: centerDistY,
            closestPt: closestPt,
            closestDist: closestDist,
            corners: corners
        };
    }
    
     function processInlinerolls(msg) {
    	if(_.has(msg,'inlinerolls')){
    		return _.chain(msg.inlinerolls)
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
    	} else {
    		return msg.content;
    	}
    }
    
    const parseArgs = function(msg) {
        msg.content = msg.content
            .replace(/<br\/>\n/g, ' ')
            .replace(/(\{\{(.*?)\}\})/g," $2 ")
        
        //Check for inline rolls for spawn qty e.g. [[1d4]] or [[ 1t[tableName] ]]
        inlineContent = processInlinerolls(msg);
        
        let args = inlineContent.split(/\s+--/).map(arg=>{
                let cmds = arg.split('|');
                return {
                    cmd: cmds.shift().toLowerCase().trim(),
                    params: cmds[0]
                };
            });
        return args;
    };
    
    function makeButton(name, link) {
        return '<a style = ' + buttonStyle + ' href="' + link + '">' + name + '</a>';
    }
    
    const addPingHTML = function (pingHTML, tok_X, tok_Y, tok_W, tok_H, graphWidth, graphHeight, pingH, pingW, pingColor, range2GraphicScale) {
        let borderWidth = '1'   //px
        
        let offsetX = (tok_X - (tok_W/2)) * range2GraphicScale;
        let offsetY = (tok_Y - (tok_H/2)) * range2GraphicScale;
        
        pingW = tok_W * range2GraphicScale;
        pingH = tok_H * range2GraphicScale;
        let avgSize = (pingW + pingH) / 2;
        let divSize = avgSize-borderWidth;
        
        let divLeft = graphWidth/2+offsetX;
        let divTop = graphWidth/2+offsetY;
        
        let html = pingHTML + `<div style=\"height: ${divSize}px; width: ${divSize}px; left: ${divLeft}px; top: ${divTop}px; border: ${borderWidth}px solid ${pingColor}; background-image: radial-gradient(circle, ${pingColor} 0%, #000000cc 70%, #000000cc 100%); border-radius: 50%; position: absolute;\"></div>`
        
        return html;
    }
    
    
    const buildBackgroundHTML = function (graphWidth, graphHeight, numRows, numCols, colWidth, rowHeight, useGrid, useCircles, useRadial) {
        let baseHTML = '';
        let circlesHTML = '';
        let radialHTML = '';
        let gridHTML = '';
        let borderWidth = '1'   //px
        let root2 = Math.sqrt(2);
        
        baseHTML = baseHTML = `<div style=\"display: table; overflow: hidden; height: ${graphHeight}px; width: ${graphWidth}px; border: ${borderWidth}px solid #000000; background: #000000; border-radius: 6px; border-collapse: separate; background-size: 100% 100%;\">`
        if (useCircles) {
            //add border around outer circle
            baseHTML = baseHTML + `<div style=\"height: ${graphHeight}px; width: ${graphWidth}px; border: ${borderWidth}px solid #00ff00; background-color: #999999; border-radius: 50%; border-collapse: separate; background-size: 100% 100%; position: relative; background-image: radial-gradient(circle, #007700 0%, #006600 10%, #004400 30%, #003300 45%, #000000 80%, transparent 100%)\">`
        } else {
            //no border around outer circle
            baseHTML = baseHTML + `<div style=\"height: ${graphHeight}px; width: ${graphWidth}px;  background-color: #999999; border-radius: 50%; border-collapse: separate; background-size: 100% 100%; position: relative; background-image: radial-gradient(circle, #007700 0%, #006600 10%, #004400 30%, #003300 45%, #000000 80%, transparent 100%);\">`
        }
        
        if (useRadial && useCircles) {
            //creates radial lines at 45deg increments - shrink divs to stop diagonals at outer circle
            //since transforms get stripped by the chat sanitizer, we make diagonals with narrow (1px) linear gradients
            //log (graphHeight-graphHeight/root2)
            radialHTML = `<div style=\"height: 115px; width: ${graphWidth}px; top: 0px; right: 0px; border-bottom: ${borderWidth}px solid rgba(0,255,0,0.9); position: absolute;\"></div>` +
                `<div style=\"height: ${graphHeight}px; width: ${graphWidth/2}px; top: 0px; left: 0px; border-right: ${borderWidth}px solid rgba(0,255,0,0.9); position: absolute;\"></div>` +
                `<div style=\"height: ${graphHeight/root2}px; width: ${graphWidth/root2}px; top: ${(graphHeight-graphHeight/root2)/2}px; left: ${(graphWidth-graphWidth/root2)/2}px; background-color: transparent; background-image: linear-gradient(45deg, transparent 100px ${graphWidth/2-0.5}px, #00ff00 ${graphWidth/2-0.5}px ${graphWidth/2+0.5}px, transparent ${graphWidth/2+0.5}px ${graphWidth}px); position: absolute;\"></div>` +
                `<div style=\"height: ${graphHeight/root2}px; width: ${graphWidth/root2}px; top: ${(graphHeight-graphHeight/root2)/2}px; left: ${(graphWidth-graphWidth/root2)/2}px; background-color: transparent; background-image: linear-gradient(-45deg, transparent 100px ${graphWidth/2-0.5}px, #00ff00 ${graphWidth/2-0.5}px ${graphWidth/2+0.5}px, transparent ${graphWidth/2+0.5}px ${graphWidth}px); position: absolute;\"></div>`
        } else if (useRadial && !useCircles) {
            //creates radial lines at 45deg increments - div diagonals extend fully
            radialHTML = `<div style=\"height: ${graphHeight/2}px; width: ${graphHeight}px; top: 0px; right: 0px; border-bottom: ${borderWidth}px solid rgba(0,255,0,0.9); position: absolute;\"></div>` +
                `<div style=\"height: ${graphHeight}px; width: ${graphWidth/2}px; top: 0px; left: 0px; border-right: ${borderWidth}px solid rgba(0,255,0,0.9); position: absolute;\"></div>` +
                `<div style=\"height: ${graphHeight}px; width: ${graphWidth}px; top: 0px; left: 0px; background-color: transparent; background-image: linear-gradient(45deg, transparent ${graphWidth/2}px ${graphWidth/root2-0.5}px, #00ff00dd ${graphWidth/root2-0.5}px ${graphWidth/root2+0.5}px, transparent ${graphWidth/root2+0.5}px ${graphWidth}px); position: absolute;\"></div>` +
                `<div style=\"height: ${graphHeight}px; width: ${graphWidth}px; top: 0px; left: 0px; background-color: transparent; background-image: linear-gradient(-45deg, transparent ${graphWidth/2}px ${graphWidth/root2-0.5}px, #00ff00dd ${graphWidth/root2-0.5}px ${graphWidth/root2+0.5}px, transparent ${graphWidth/root2+0.5}px ${graphWidth}px); position: absolute;\"></div>`
        }
        
        if (useGrid) {
            //horizontal grid lines
            gridHTML = `<div style=\"width: ${graphWidth}px; height: ${rowHeight}px; left: 0px; top: 0px; color: rgba(238,238,238,0.15); border-top: ${borderWidth}px solid; position: absolute;\"></div>`
            for (let row=0; row<numRows; row++) {
                gridHTML = gridHTML +`<div style=\"width: ${graphWidth}px; height: ${rowHeight}px; left: 0px; top: ${row*rowHeight}px; color: rgba(238,238,238,0.15); border-bottom: ${borderWidth}px solid; position: absolute;\"></div>`
            }
            //vertical grid lines
            gridHTML = gridHTML +`<div style=\"width: ${colWidth}px; height: ${graphHeight}px; left: 0px; top: 0px; color: rgba(238,238,238,0.15); border-left: ${borderWidth}px solid; position: absolute;\"></div>`
            for (let col=0; col<numCols; col++) {
                gridHTML = gridHTML +`<div style=\"width: ${colWidth}px; height: ${graphHeight}px; left: ${col*colWidth}px; top: 0px; color: rgba(238,238,238,0.15); border-right: ${borderWidth}px solid; position: absolute;\"></div>`
            }
        }
        
        if (useCircles) {
            //add four concentric circles
            circlesHTML = `<div style=\"height: ${graphHeight}px; width: ${graphWidth}px; top: -${borderWidth}px; left: -${borderWidth}px; border: ${borderWidth}px solid #00ff00; border-radius: 50%; position: absolute;\"></div>` +
                    `<div style=\"height: ${graphHeight*0.75-borderWidth*2}px; width: ${graphWidth*0.75-borderWidth*2}px; top: ${graphHeight*.25/2+borderWidth}px; left: ${graphWidth*.25/2+borderWidth}px; border: ${borderWidth}px solid #00ff00; border-radius: 50%; position: absolute;\"></div>` +
                    `<div style=\"height: ${graphHeight*0.5-borderWidth*2}px; width: ${graphWidth*0.5-borderWidth*2}px; top: ${graphHeight*.5/2+borderWidth}px; left: ${graphWidth*.5/2+borderWidth}px; border: ${borderWidth}px solid #00ff00; border-radius: 50%; position: absolute;\"></div>` +
                    `<div style=\"height: ${graphHeight*0.25-borderWidth*2}px; width: ${graphWidth*0.25-borderWidth*2}px; top: ${graphHeight*.75/2+borderWidth}px; left: ${graphWidth*.75/2+borderWidth}px; border: ${borderWidth}px solid #00ff00; border-radius: 50%; position: absolute;\"></div>`
        }
        
        let html = baseHTML + radialHTML + gridHTML + circlesHTML
        //log(html)
        
        return html;
    }

    //Calculates distance and direction from origin token. 
    const GetDirectionalInfo = function(tokX, tokY, originX, originY, distType, includeTotalDist, scaleNumber, scaleUnits, gridIncrement, outputCompact, calcType) {
        let retVal = "";
        let xDist;
        let yDist;
        let totalDist;
        let fixedDecimals = 1;
        let right = 'Right ';
        let left = 'Left ';
        let up = 'Up ';
        let down = 'Down ';
        
        if (outputCompact) {
            right = 'R ';
            left = 'L ';
            up = 'U ';
            down = 'D ';
        }
        //log(tokX + ',' + tokY + ',' + originX + ',' + originY);
        
        if (distType === "u") {
            xDist = ( (tokX - originX) / 70) / gridIncrement;
            yDist = ( (tokY - originY) / 70) / gridIncrement;
        } else {
            if ( gridIncrement === 0) { //gridless map support
                xDist = scaleNumber * ( (tokX - originX) / 70);
                yDist = scaleNumber * ( (tokY - originY) / 70);
            } else {
                xDist = scaleNumber * ( (tokX - originX) / 70) / gridIncrement;
                yDist = scaleNumber * ( (tokY - originY) / 70) / gridIncrement;
            }
        }
        
        //lazy coding. Going to re-assemble pts to pass to distance formula
        let tokPt = new pt(tokX, tokY);
        let originPt = new pt(originX, originY);
        
        if (calcType !== 'Euclidean') {
            let totalDistPx = distBetweenPts(tokPt, originPt, calcType, gridIncrement, scaleNumber, true);  //last "true" param means distance is for display only - 5e determines "in cone" with Euclidean, but can report distance with diags counting 1 square
            if (distType === "u") {
                totalDist = (totalDistPx  / 70) / gridIncrement;
            } else {
                totalDist = (totalDistPx * scaleNumber / 70) / gridIncrement;
            }
            fixedDecimals = 0;
        } else {
            if (distType === "u") {
                totalDist = (distBetweenPts(tokPt, originPt)  / 70) / gridIncrement;
            } else {
                totalDist = (distBetweenPts(tokPt, originPt) * scaleNumber / 70) / gridIncrement;
            }
            fixedDecimals = 1;
        }
        
        //totalDist = Math.sqrt( Math.pow(xDist, 2) + Math.pow(yDist, 2) );
        
        if (xDist > 0) {
            retVal = right + _h.inlineResult(Math.round(xDist,1)) + ',';
        } else {
            retVal = left + _h.inlineResult(Math.round(Math.abs(xDist), 1)) + ',';
        }
        
        if (yDist > 0) {
            retVal = retVal + down + _h.inlineResult(Math.round(yDist, 1)) + '';
        } else {
            retVal = retVal + up + _h.inlineResult(Math.round(Math.abs(yDist), 1)) + '';
        }
        
        
        //Format text output. Default is outputCompact=false
        if (outputCompact) {
            retVal = retVal + ',Dist ' + _h.inlineResult(parseFloat(totalDist).toFixed(fixedDecimals));
        } else {
            retVal = retVal + '<br>' + 'Distance = ' + _h.inlineResult(parseFloat(totalDist).toFixed(fixedDecimals));
        }
        
        return retVal;
    }
    
    //controlArray will look like ["M",0,0] or ["L",0,35] or ["Q",0,0,70,105], etc
    //This function grabs the control point from each array, which is the last two coordinates of the controlArray argument
        //also converts from relative path coords to absolute map coords
    const GetAbsoluteControlPt = function(controlArray, center, w, h, rot, scaleX, scaleY) {
        let len = controlArray.length;
        let point = new pt(controlArray[len-2], controlArray[len-1]);
        
        //translate relative x,y to actual x,y 
        point.x = scaleX*point.x + center.x - (scaleX * w/2);
        point.y = scaleY*point.y + center.y - (scaleY * h/2);
        
        point = RotatePoint(center.x, center.y, rot, point)
            
        return point;
    }
    
    /** Get relationship between a point and a polygon using ray-casting algorithm
     * @param {{x:number, y:number}} P: point to check
     * @param {{x:number, y:number}[]} polygon: the polygon
     * @returns true for inside or along edge; false if outside
     */
     //adapted from https://stackoverflow.com/posts/63436180/revisions
    const isPointInPolygon = function(P, polygon) {
        const between = (p, a, b) => p >= a && p <= b || p <= a && p >= b;
        let inside = false;
        for (let i = polygon.length-1, j = 0; j < polygon.length; i = j, j++) {
            const A = polygon[i];
            const B = polygon[j];
            // corner cases
            if (P.x == A.x && P.y == A.y || P.x == B.x && P.y == B.y) return true;
            if (A.y == B.y && P.y == A.y && between(P.x, A.x, B.x)) return true;
    
            if (between(P.y, A.y, B.y)) { // if P inside the vertical range
                // filter out "ray pass vertex" problem by treating the line a little lower
                if (P.y == A.y && B.y >= A.y || P.y == B.y && A.y >= B.y) continue
                // calc cross product `PA X PB`, P lays on left side of AB if c > 0 
                const c = (A.x - P.x) * (B.y - P.y) - (B.x - P.x) * (A.y - P.y)
                if (c == 0) return true;
                if ((A.y < B.y) == (c > 0)) inside = !inside
            }
        }
        
        return inside? true: false;
    }
    
    const getAngle2TargetToken = function(who, oPt, tokID) {
        let deg2rad = Math.PI/180;
        let tAngle;     //return value
        
        let tTok = getObj("graphic", tokID);
        if (tTok) {
            let tX = tTok.get("left");
            let tY = tTok.get("top");
            
            let dX = Math.abs(tX - oPt.x);
            let dY = Math.abs(tY - oPt.y);
            let smallAngle = Math.atan(dY / dX);    //this does not take into account the quadrant in which the angle lies. More tests req'd to determine correct relative angle 
           
            if (tX < oPt.x && tY < oPt.y) { //UL quadrant
                tAngle = 270*deg2rad + smallAngle;
            } else if (tX > oPt.x && tY < oPt.y) { //UR quadrant
                log('UR quadrant');
                tAngle = 90*deg2rad - smallAngle;
            } else if (tX > oPt.x && tY > oPt.y) { //LR quadrant
                tAngle = 90*deg2rad + smallAngle;
            } else if (tX < oPt.x && tY > oPt.y) { //LL quadrant
                tAngle = 270*deg2rad - smallAngle;
            } else if (tX === oPt.x && tY < oPt.y) { //straight up
                tAngle = 0*deg2rad;
            } else if (tX > oPt.x && tY === oPt.y) { //straight right
                tAngle = 90*deg2rad;
            } else if (tX === oPt.x && tY > oPt.y) { //straight down
                tAngle = 180*deg2rad;
            } else if (tX < oPt.x && tY === oPt.y) { //straight left
                tAngle = 270*deg2rad;
            }
            
            return tAngle/deg2rad;  //coneDirection expressed in angles
            
        } else {
            sendChat(scriptName, `/w "${who}" Target token ID (${tokID}) was not found. Unable to calculate cone angle. Setting to 0 degrees.`);
            return 0;
        }
    }
    
    const isPointInCone = function(pt, oPt, rad, coneDirection, coneWidth, isFlatCone, calcType='Euclidean', gridIncrement=-999, scaleNumber=-999) {
        let deg2rad = Math.PI/180;
        let pAngle;     //the angle between the cone origin and the test pt
        let smallAngle;
        let startAngle = deg2rad * normalizeTo360deg(coneDirection - coneWidth/2);
        let endAngle = deg2rad * normalizeTo360deg(coneDirection + coneWidth/2);
        let centerAngle = deg2rad * normalizeTo360deg(coneDirection);
        let halfConeWidth = deg2rad * (coneWidth/2);
        let criticalDist;
        
        // Calculate polar co-ordinates
        let polarRadius;
        if (calcType == 'PF' && gridIncrement !== -999 & scaleNumber !== -999) {
            polarRadius = distBetweenPts(oPt, pt, calcType, gridIncrement, scaleNumber)
        } else {
            polarRadius = distBetweenPts(oPt, pt)
        }
        
        let dX = Math.abs(pt.x - oPt.x);
        let dY = Math.abs(pt.y - oPt.y);
        
        //calculate "smallAngle" - this does not take into account the quadrant in which the angle lies. More tests req'd to determine correct relative angle 
        if (dX===0) {
            smallAngle = 90*deg2rad;
        } else {
            smallAngle = Math.atan(dY / dX);
        }
        
        if (pt.x < oPt.x && pt.y < oPt.y) { //UL quadrant
            pAngle = 270*deg2rad + smallAngle;
        } else if (pt.x > oPt.x && pt.y < oPt.y) { //UR quadrant
            pAngle = 90*deg2rad - smallAngle;
        } else if (pt.x > oPt.x && pt.y > oPt.y) { //LR quadrant
            pAngle = 90*deg2rad + smallAngle;
        } else if (pt.x < oPt.x && pt.y > oPt.y) { //LL quadrant
            pAngle = 270*deg2rad - smallAngle;
        } else if (pt.x === oPt.x && pt.y < oPt.y) { //straight up
            pAngle = 0*deg2rad;
        } else if (pt.x > oPt.x && pt.y === oPt.y) { //straight right
            pAngle = 90*deg2rad;
        } else if (pt.x === oPt.x && pt.y > oPt.y) { //straight down
            pAngle = 180*deg2rad;
        } else if (pt.x < oPt.x && pt.y === oPt.y) { //straight left
            pAngle = 270*deg2rad;
        }
        
        //2nd test angle: Add 360deg to pAngle (to handle cases where startAngle is a negative value and endAngle is positive)
        let pAngle360 = pAngle + 360*deg2rad;
        if (endAngle < startAngle) {
            endAngle = endAngle + 360*deg2rad;
        }
        
        /*
        log(pt);
        log(oPt);
        log('coneDirection = ' + coneDirection);
        log('coneWidth = ' + coneWidth);
        log('range = ' + rad);
        log('polarRadius = ' + polarRadius);
        log('startAngle = ' + startAngle/deg2rad);
        log('endAngle = ' + endAngle/deg2rad);
        log('smallAngle = ' + smallAngle/deg2rad);
        log('pAngle = ' + pAngle/deg2rad);
        log('pAngle360 = ' + pAngle360/deg2rad);
        */
        
        if (isFlatCone) {
            //for 5e-style cones. Basically a triangle (no rounded outer face)
            //let z = (rad / (2*Math.sin(Math.atan(0.5)))) - rad;
            dTheta = Math.abs(pAngle - centerAngle);
            //criticalDist = ((rad+z)*Math.cos(halfConeWidth)) / Math.cos(dTheta);
            criticalDist = rad / Math.cos(dTheta);
        } else {
            //compare to full radius cone
            criticalDist = rad
        }
        //log('criticalDist = ' + criticalDist);
        
        //test pAngle and pAngle360 against start/end Angles
        if ( (pAngle >= startAngle) && (pAngle <= endAngle) && (polarRadius <= criticalDist) || 
                (pAngle360 >= startAngle) && (pAngle360 <= endAngle) && (polarRadius <= criticalDist) ) {
           return true;
        } else {
            return false;
        }
    }
    
    //Intersection code obtained from:
        //  http://bl.ocks.org/nitaku/fdbb70c3baa36e8feb4e
    const  SegmentsIntersect = function(p0, p1, p2, p3) {
        let s, s1_x, s1_y, s2_x, s2_y, t;
        let denom;
        
        s1_x = p1.x - p0.x;
        s1_y = p1.y - p0.y;
        s2_x = p3.x - p2.x;
        s2_y = p3.y - p2.y;
        
        //If one or both line segments have a length of 0, ignore
        if ( (s1_x === 0 && s1_y === 0) || (s2_x === 0 && s2_y === 0) ) {
            return false;
        }
        
        denom = (-s2_x * s1_y + s1_x * s2_y)
        if (denom === 0) {
            return true;    //segments are colinear
        }
        
        s = (-s1_y * (p0.x - p2.x) + s1_x * (p0.y - p2.y)) / (-s2_x * s1_y + s1_x * s2_y);
        t = (s2_x * (p0.y - p2.y) - s2_y * (p0.x - p2.x)) / (-s2_x * s1_y + s1_x * s2_y);
        
        if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
            return true
        }
        return false;
    };
    
    const isLoSBlocked = function(oX, oY, tok, pathSegs) {
        let origin = new pt(oX, oY);
        let tokCenter = new pt(tok.left, tok.top)
        
        //------------------------------------------------------
        //create an array containing the 5 line segments from the center of the origin token to critical points on the target token 
                //critical points = the center and the 4 corners of the target token
        let originToTokSegs = [];
        let seg = {
            pt1: origin,
            pt2: tokCenter
        }
        originToTokSegs.push(seg);  //first element is the segment between the centers of the origin & target tokens
        for (let i = 0; i < tok.corners.length; i++) {
            seg = {
                pt1: origin,
                pt2: tok.corners[i]
            }
            originToTokSegs.push(seg);  //the next four elements are from origin token center to target token corners
        }
        //------------------------------------------------------
        
        //check for intersection of each Origin-to-Tok line segment against each DL path segment on the page
        let intersections = 0;
        let segBlocked = [];
        
            for (let os = 0; os < originToTokSegs.length; os++) {
                segBlocked.push(false);
                
                for (let ps = 0; ps < pathSegs.length; ps++) {
                   
                    if ( SegmentsIntersect(pathSegs[ps].pt1, pathSegs[ps].pt2, originToTokSegs[os].pt1, originToTokSegs[os].pt2) ) {
                        //intersections += 1;
                        segBlocked[os] = true;
                            //log('[' + pathSegs[ps].pt1.x + ',' + pathSegs[ps].pt1.y + ',' + pathSegs[ps].pt2.x + ',' + pathSegs[ps].pt2.y);
                            //log('[' + originToTokSegs[os].pt1.x + ',' + originToTokSegs[os].pt1.y + ',' + originToTokSegs[os].pt2.x + ',' + originToTokSegs[os].pt2.y);
                        break;  //stop checking path segments and begin eval of next originToTok segment
                    } 
                }
            }
            //LoS is blocked ONLY IF ALL FIVE origin-to-target line segments are blocked.
            let test = segBlocked.every(v => v === true);
            return test;
           
    }
    
    const checkFiltersForExcludeOnly = function(filterIgnores) {
        let includeCount = 0;
        
        filterIgnores.forEach(ignore => {
             if (ignore=== false) {
                 includeCount +=1;
             }
        });
        
        if (includeCount > 0) {
            return false;
        } else {
            return true;
        }
    }
    
    async function handleInput(msg) {
        let pathstring;             //JSON string for wavefront paths
        let pathstring_old;         //JSON string for wavefront paths
        let polygon = [];           //array containing points of leading animated wavefront
        let polygon_old = [];       //array containing points of trailing animated wavefront 
        let selected;               //msg.selected object
        let selectedID;             //selected token
        let playerID;               //which player called the script. Will determine who gets whispered results 
        let oTok;                   //origin token
        let validArgs = "range, wavespacing, wavedelay, wavelife, pinglife, layer, charfilter, tokfilter, title, silent, units, LoS, selectedID, playerID";
        let range = 350;            //how far the radar range extends, in pixels
        let convertRange = "";      //will we need to convert range from pixels to "u" or another page-defined distance unit?
        var wavetype = 'circle';    //wavefront will either be circular or square
        let waveIncrement = 35;     //the spacing between waves, in pixels (lower number = slower wavefront)
        let waveDelay = 50;         //how much time to wait between each wave increment, in ms (higher number = slower wavefront)
        let waveLife = 200;         //how long each wave wil remain on screen, in ms (higher number = more waves present at any one time)
        let waveColor = '#ff0000';
        let tokLife = 2000;         //how long each "RadarPing" token wil remain on screen, in ms 
        let layers = ['objects', 'gmlayer'];    //the layersin which to look for tokens. Default values are overriden if --layers command is used 
        let filter = {              //optional filters for which tokens will be actively pinged
            type: "",               //types include "char" and "tok"
            attr: "",               //key to filter on. e.g. "npc_type" attribute for a character sheet, or "bar3" for a token filter
            vals: [],                //array of values for which to filter against filter.attr     e.g. ["celestial", "fiend", "undead"]
            colors: [],
            compareType: [],        //possible values: 'contains'(val is somewhere in string), '@'(exact match), '>' or '<' (numeric comparison)
            ignore: [],             //flag to determine if the value is an ignore filter or a positive match filter
            anyValueAllowed: false,  //this flag will bypass normal checks. Used only for charFilters - The attribute just needs to exist in order for the token to be pinged 
            groups: []             //stores an array of filter groups formed based on tokens in range. Allows for tokens to be placed in composite groups (matching more than one condition)
        }
        let losBlocks = false;      //Will DL walls block radar sensor if completely obscured (will look at 5 pts per token to determine LoS)
        let title = "Radar Ping Results";             //title of the default template output
        let content = "";           //string value that will contain all the row content for default templates
        let displayOutput = true    //output results via sendChat (default template)
        let pageScaleNumber = 5;    //distance of one unit
        let pageScaleUnits = "ft";  //the type of units to use for the scale
        let pageGridIncrement = 1;  //how many gridlines per 70px
        let displayUnits = "u";         //output distances in "units" or use pageScaleUnits 
        let includeTotalDist = false;   //inlude the total range in the output, or just directional (X & Y distances)
        let hasSight = false;       //Will the RadarPing token grant temporary sight to the 
        let includeGM = false;      //Send a copy of the ouput to the GM chat if player calls script
        let seeAnimation = true;
        
        let gmToks = [];            //array of all tokens on GM layer
        let objToks = [];           //array of all tokens on object layer
        let wallToks = [];          //array of all tokens on walls (DL)  layer
        let mapToks = [];           //array of all tokens on map layer
        let allToks = [];           //concatenation of gmToks and allToks
        let tokIdDist = [];         //array of token(-ish) objects with properties {id, left, right, width, height, and dist to origin}
        let toksInRange = [];       //subset of allToks, thos ewithin range of origin token
        let padding = 20;           //ping object will be slightly larger than found tokens, to account for Roll20 zOrder "bug"
        let radius; 
        let pageID;
        let originX;
        let originY;
        let originPt;
        let controlledby;
        let retVal = [];                //array of potential error messages to pass back to main handleInput funtion
        let filterExcludeOnly = false;  //wil be set to true if token filters only include "ignore" tags
        let useGrid = false;            //default background html setting 
        let useCircles = false;         //default background html setting
        let useRadial = false;          //default background html setting
        let outputGraph = false;        
        let outputTable = false;
        let outputCompact = false;       //set to true for single line table output - total distance will not be included in output. 
        let coneWidth = 360;
        let coneDirection = 0;
        let outputLines = [];
        let groupBy = true;             //if filters are used, group tokens by filter condition in table output
        let calcType = 'Euclidean';     //Can set to 'PF' to use the 'every-other-diagonal-counts-as-1.5-units' math (only for gridded maps)
        
        try {
            if(msg.type=="api" && msg.content.indexOf("!radar") === 0 ) {
                
                //Parse msg into an array of argument objects [{cmd:params}]
                let args = parseArgs(msg);
                args.shift();
                
                //assign values to our params arrray based on args
                args.forEach((arg) => {
                    let option = arg["cmd"].toLowerCase().trim();
                    let param = arg["params"].trim();
                    
                    switch(option) {
                        case "range":
                            range = parseFloat(param);
                            let u = param.match(/[a-z]/i);   //if not an empty string, we will use page settings to convert range to "u" or other map-defined units
                            if (u !== null) {
                                convertRange = u[0]
                            }
                            break;
                        case "wavetype":
                            let w = param.toLowerCase();
                            if (w.includes('sq')) {
                                wavetype = 'square';
                            } else if (w.includes('5e')) {
                                wavetype = '5e';
                                coneWidth = 53.14;
                            } else {
                                wavetype = 'circle';
                            }
                            let tempConeParams = param.split(",").map(layer => layer.trim() );
                            if (tempConeParams.length > 1) {
                                coneDirection = tempConeParams[1];  //this may be an angle or a tokenID. Later, we will parseFloat or find the angle between selected & target tokens
                            }
                            if (tempConeParams.length > 2 && wavetype !== '5e') {
                                coneWidth = parseFloat(tempConeParams[2]);
                            }
                            break;
                        case "wavespacing":
                            waveIncrement = parseInt(param);
                            break;
                        case "wavedelay":
                            waveDelay = parseInt(param);
                            break;
                        case "wavelife":
                            waveLife = parseInt(param);
                            break;
                        case "wavecolor":
                            if ( param.match(/#/) ) {
                                let f = param.split('#')
                                waveColor = toFullColor(f[1])
                            }
                            break;
                        case "pinglife":
                            tokLife = parseInt(param);
                            break;
                        case "layers":
                            layers = [];    //delete default layers first
                            layers = param.split(",").map(layer => layer.trim() );
                            break;
                        case "charfilter":  //fall through
                        case "tokfilter":
                            filter.type = option==='charfilter' ? "char" : "tok";
                            let tempFilter = param.split(":").map(x => x.trim() );
                            filter.attr = tempFilter[0];
                            filter.vals = tempFilter[1].split(",").map(x => x.trim() );
                            //check for user-defined aura colors by filter value
                            filter.vals.forEach((val, index) => {
                                let tempVal;
                                if ( val.match(/#/) ) {
                                    let f = val.split('#')
                                    switch (true) {
                                        case f[1].toLowerCase().includes('red'):
                                            filter.colors.push(hRED);
                                            break;
                                        case f[1].toLowerCase().includes('yellow'):
                                            filter.colors.push(hYELLOW);
                                            break;
                                        case f[1].toLowerCase().includes('green'):
                                            filter.colors.push(hGREEN);
                                            break;
                                        case f[1].toLowerCase().includes('blue'):
                                            filter.colors.push(hBLUE);
                                            break;
                                        default:
                                            filter.colors.push(toFullColor(f[1]));
                                    }
                                    tempVal = f[0];  //strips the color out of the filter
                                } else {
                                    //default color
                                    filter.colors.push(hRED)
                                    tempVal = val;
                                }
                                
                                //check for filter comparison type (exact string, contains string, or numeric comparison)
                                if (val.indexOf('-') === 0) {
                                    //this is an ignore filter
                                    filter.ignore.push(true);
                                    tempVal = val.substring(1,val.length);  //strip the '-'
                                } else {
                                    //positive match filter
                                    filter.ignore.push(false);
                                }
                                
                                //log('tempVal.substring(0,1) = ' + tempVal.substring(0,1));
                                switch (tempVal.substring(0,1)) {
                                    case '@':
                                        // exact match
                                        filter.compareType.push('@');
                                        filter.vals[index] = tempVal.substring(1,tempVal.length)  
                                        filter.groups.push('@' + filter.vals[index])
                                        break;
                                    case '>':
                                        // numeric greater than comparison
                                        filter.compareType.push('>');
                                        filter.vals[index] = tempVal.substring(1,tempVal.length)
                                        filter.groups.push('&gt;' + filter.vals[index])
                                        break;
                                    case '<':
                                        // numeric less than comparison
                                        filter.compareType.push('<');
                                        filter.vals[index] = tempVal.substring(1,tempVal.length)
                                        filter.groups.push('&lt;' + filter.vals[index])
                                        break;  
                                    default:
                                        // string comparison (contains)
                                        filter.compareType.push('contains');
                                        if (tempVal==='*') { 
                                            filter.anyValueAllowed = true; 
                                            filter.vals[index] = filter.attr;
                                        } else {
                                            filter.vals[index] = tempVal;
                                        }
                                        filter.groups.push(filter.vals[index])
                                        break;
                                }
                            });
                            //log(filter);
                            break;
                        case "title":
                            title = param;
                            break;
                        case "silent":
                            let p = param.toLowerCase();
                            if (p.includes('true') || p.includes('yes') || p.includes('1') ) {
                                displayOutput = false;
                            } else if (p.includes('false') || p.includes('no') || p.includes('0')) {
                                displayOutput = true;
                            }
                            if (p.includes('gm')) {
                                includeGM = true;
                            }
                            break;
                        case "units":
                            let tempUnits = param.split(",").map(x => x.trim());
                            if (_.contains(['u', 'units', 'squares', 'square', 'hexes', 'hex'], tempUnits[0].toLowerCase())) {
                                displayUnits = 'u'
                            } else {
                                displayUnits = undefined;   //will re-define from the Page settings later.
                            }
                            if (tempUnits.length > 1) {
                                if (_.contains(['pf', 'pathfinder', '3.5'], tempUnits[1].toLowerCase())) {
                                    calcType = 'PF';
                                }
                                if (_.contains(['5e'], tempUnits[1].toLowerCase())) {
                                    calcType = '5e';
                                }
                            }
                            break
                        case "los":
                            if (_.contains(['true', 'yes', '1'], param.toLowerCase())) {
                                losBlocks = true;
                            } else if (_.contains(['false', 'no', '0'], param.toLowerCase())) {
                                losBlocks = false;
                            } 
                            break;
                        case "selectedid":
                            selectedID = param; 
                            break;
                        case "playerid":
                            playerID = param;
                            break;
                        case "visible":
                            let v = param.toLowerCase();
                            if (v.includes('true') || v.includes('yes') || v.includes('1') ) {
                                seeAnimation = true;
                            } else if (v.includes('false') || v.includes('no') || v.includes('0')) {
                                seeAnimation = false;
                            }
                            break;
                        case "graphoptions":
                            let options = param.split(",").map(opt => opt.trim());
                            options.forEach (o => {
                                if (o.match(/grid/i)) { useGrid = true; }
                                if (o.match(/circ/i) || o.match(/ring/i)) { useCircles = true; }
                                if (o.match(/retic/i)) { useRadial = true; }
                            });
                            break;
                        case "output":
                            let outputTypes = param.split(",").map(ot => ot.trim());
                            outputTypes.forEach (ot => {
                                if (ot.match(/graph/i)) { outputGraph = true; }
                                if (ot.match(/table/i)) { outputTable = true; }
                                if (ot.match(/compact/i)) { outputCompact = true; }
                            });
                            break;
                        case "groupby":
                            if (_.contains(['true', 'yes', '1'], param.toLowerCase())) {
                                groupBy = true;
                            } else if (_.contains(['false', 'no', '0'], param.toLowerCase())) {
                                groupBy = false;
                            } 
                            break;
                        default:
                            retVal.push('Unexpected argument identifier (' + option + '). Choose from: (' + validArgs + ')');
                            break;    
                    }
                }); //end forEach arg
                
                //double-check: if user wants output (to self and/or GM) but hasn't defined any, then revert to default (table-only)
                if (displayOutput===true && outputTable===false && outputGraph===false && includeGM===false) {
                    outputTable = true;
                }
                
                //------------------------------------------------------------------------
                //Check if !radar was called by another api script
                    //If so, it must pass both selected token ID and controlling playerid
                    //Otherwise, get values directly from the msg object
                //------------------------------------------------------------------------
                if('API' === msg.playerid) {
                    //RADAR WAS CALLED BY ANOTHER API SCRIPT
                    if (playerID === undefined || selectedID ===undefined) {
                        sendChat(scriptName, 'When Radar is called by another script, it must pass both the selected token ID and the playerID');
                        return;
                    }
                    who = getObj('player',playerID).get('_displayname');
                    controlledby = playerID;
                    oTok = getObj("graphic",selectedID);
                } else {
                    //RADAR WAS CALLED DIRECTLY BY A PLAYER VIA CHAT. Get values from msg *IF* they weren't explicitly passed as arguments
                    who = getObj('player',msg.playerid).get('_displayname');
                    
                    //Token select or ID validation
                    if (selectedID===undefined && msg.selected===undefined) {
                        sendChat(scriptName,`/w "${who}" `+ 'You must either select a token or pass the tokenID via --selectedID');
                        return;
                    }
                    //Get the origin token object from either msg or an explicitly defined tokenID
                    if (selectedID===undefined) {
                        oTok = getObj("graphic",msg.selected[0]._id);
                    } else {
                        //log(selectedID);
                        oTok = getObj("graphic",selectedID);
                    }
                    //Set controlledBy property of token to determine who will see the pings. Include all GMs
                    if (playerID===undefined) {
                        controlledby = msg.playerid;
                    } else {
                        controlledby = playerID;
                    }
                }
                
                 //First data validation checkpoint
                if (retVal.length > 0) {
                    sendChat(scriptName,`/w "${who}" `+ retVal);
                    return;
                };
                //------------------------------------------------------------------------
                
                //Get token values and page settings
                originWidth = oTok.get("width")
                originHeight = oTok.get("height")
                originAvgSize = (originWidth+originHeight)/2;
                radius = originWidth/2;         //starting radius for animated wavefront
                pageID = oTok.get("pageid");
                originX = oTok.get("left");
                originY = oTok.get("top");
                originPt = new pt(originX, originY);
                
                
                //check to see if a cone angle was given explicitly or via the angle between the selected and target token
                if (isNaN(coneDirection)) { 
                    //"coneDirection" is holding a tokenID right now
                    coneDirection = getAngle2TargetToken(who, originPt, coneDirection);
                } else {
                    //coneDirection is an explicitly defined angle
                    coneDirection = parseFloat(coneDirection);
                }
                
                //log('oTok_XY = ' + originX + ', ' + originY);
                
                let thePage = getObj("page", pageID);
                pageScaleNumber = thePage.get("scale_number");
                pageScaleUnits = thePage.get("scale_units");
                pageGridIncrement = thePage.get("snapping_increment");
                pageDL = thePage.get("showlighting") || thePage.get("dynamic_lighting_enabled")
                if (displayUnits === undefined) {
                    displayUnits = pageScaleUnits;
                }
                
                //possibly convert the range from user-supplied units to pixels
                if (convertRange !== "") {
                    if (pageGridIncrement !== 0) {  //grid map
                        if (convertRange === "u") {
                            range = range * 70 * pageGridIncrement;                 //convert from "u" to pixels
                        } else {
                            range = (range * 70 * pageGridIncrement) / pageScaleNumber; //convert from page units to pixels
                        }
                    } else {                        //gridless map, only use page settings
                        if (convertRange === "u") {
                            sendChat(scriptName,`/w "${who}" `+ 'Warning: Units \"u\" selected on a gridless map. Range will be calculated in pixels and will probably be much smaller than expected ');
                        } else {
                            range = (range * 70) / pageScaleNumber;
                        }
                    }
                }
                
                let spawnObj = getCharacterFromName(PING_NAME);
                if (spawnObj === undefined) {
                    sendChat(scriptName,`/w "${who}" `+ 'Error: Character \"RadarPing\" must be in the journal with a default token: ');
                    return;
                }
                
                //Only ping tokens on requested layers (DEFAULT is Objects and GMLayer)
                if  ( layers.includes('gmlayer') || layers.includes('gm') ) {
                    gmToks = findObjs({_pageid: pageID, _type: "graphic", _subtype: "token", layer: "gmlayer"});
                }
                if ( layers.includes('objects') || layers.includes('token') ) {
                    objToks = findObjs({_pageid: pageID, _type: "graphic", _subtype: "token", layer: "objects"});
                }
                if ( layers.includes('walls') || layers.includes('dl')  ) {
                    wallToks = findObjs({_pageid: pageID, _type: "graphic", _subtype: "token", layer: "walls"});
                }
                if ( layers.includes('map') ) {
                    mapToks = findObjs({_pageid: pageID, _type: "graphic", _subtype: "token", layer: "map"});
                }
                
                
                ///////////////////////////////////////////////////////////////////////////
                /////////       TOKEN FILTERS
                ///////////////////////////////////////////////////////////////////////////
                allToks = gmToks.concat(objToks, wallToks, mapToks);
                
                //Create an array of token-ish objects with only critical key values, PLUS distance to origin token, filter matches, and aura color by filter
                tokIdDist = allToks.map(function(tok) {
                    let originDist = TokToOriginDistance(tok, originX, originY, pageGridIncrement, pageScaleNumber, calcType);
                    return retObj = {
                        id: tok.id,
                        left: tok.get("left"),
                        top: tok.get("top"),
                        width: tok.get("width"),
                        height: tok.get("height"),
                        name: tok.get("name"),
                        layer: tok.get("layer"),
                        represents: tok.get("represents"),
                        bar1_value: tok.get("bar1_value"),
                        bar2_value: tok.get("bar2_value"),
                        bar3_value: tok.get("bar3_value"),
                        bar1_max: tok.get("bar1_max"),
                        bar2_max: tok.get("bar2_max"),
                        bar3_max: tok.get("bar3_max"),
                        gmnotes: tok.get("gmnotes"),
                        dist: originDist.dist,
                        centerDistX: originDist.centerDistX,    //used for table outout
                        centerDistY: originDist.centerDistY,    //used for table outout
                        closestPt: originDist.closestPt,    //the center of the closest square
                        closestDist: originDist.closestDist,
                        corners: originDist.corners,        //will contain 'ignore' or the name of the attribute or token property used for fltering
                        filterKey: "",
                        losBlocks: false,
                        filterColor: hRED,  //default aura = red
                        filterGroup: []
                    }
                });
                
                //Initial Filter: only those within range of the radar (meas from center of origin token to center of closest corner of target token)
                if (wavetype === 'circle') {
                    toksInRange = tokIdDist.filter(tok => {
                        if (tok.name.toLowerCase().indexOf('conetarget')>-1) {
                            return false;
                        } else if (coneWidth === 360) {
                            //simple range calculation
                            return (tok.closestDist <= range) && (tok.id !== oTok.id);
                        } else {
                            //only if tok is within the defined cone
                            return isPointInCone(tok.closestPt, originPt, range, coneDirection, coneWidth, false, calcType, pageGridIncrement, pageScaleNumber);  //false flag denotes a "true cone" (rounded outer face)
                        }
                    });
                } else if (wavetype === 'square') {    //square-shaped region. compare pt to full or "sliced" polygon
                    toksInRange = tokIdDist.filter(tok => {
                        if (tok.name.toLowerCase().indexOf('conetarget')>-1) {
                            return false;
                        } else {
                            polygon = [];
                            pathString = JSON.parse(buildSquare(range, coneWidth, coneDirection));
                            pathString.forEach((vert) => {
                                let tempPt = GetAbsoluteControlPt(vert, originPt, range*2, range*2, 0, 1, 1);
                                polygon.push(tempPt)
                            });
                            if (coneWidth !== 360) { polygon.splice(-11); }   //removes the "phantom" points added to the path JSON for scaling purposes
                            
                            return isPointInPolygon(tok.closestPt, polygon) && (tok.id !== oTok.id);
                        }
                    });
                } else if (wavetype === '5e') {
                    toksInRange = tokIdDist.filter(tok => {
                        if (tok.name.toLowerCase().indexOf('conetarget')>-1) {
                            return false;
                        } else {
                            return isPointInCone(tok.closestPt, originPt, range, coneDirection, coneWidth, true);   //true flag denotes a "flat cone"
                        }
                    });
                }
                
                //User may request to filter tokens by value of a character or token attribute
                filterExcludeOnly = checkFiltersForExcludeOnly(filter.ignore);
                
                if (filter.type==="char" || filter.type==="tok") {
                    toksInRange.map(tok => {
                        let tempGroup = [];
                        //if charFilter, only check tokens linked to sheets. If tokFilter, always check
                        if ( (filter.type==="char" && tok.represents) || (filter.type==="tok")  ) {
                            //populate attrCurrentVal with either char attr or token value
                            let attrCurrentVal = 'not found';
                            if (filter.type==="char") {
                                let tempAttr = findObjs({_type: "attribute", _characterid: tok.represents, name: filter.attr});
                                if (tempAttr.length >= 1) { attrCurrentVal = tempAttr[0].get("current") }
                            } else {
                                attrCurrentVal = tok[filter.attr].toString() || "NoMatch";
                            }
                            
                            if (attrCurrentVal !== 'not found') {
                                //let attrCurrentVal = tempAttr[0].get("current")
                                filter.vals.forEach((val,index) => {
                                    //if filter list only has "ignore values", then begin with  all tokens included 
                                    if (!tok.filterKey.match('ignore') && filterExcludeOnly) {
                                        tok.filterKey = 'include';
                                        tok.filterColor = filter.colors[index];
                                    }
                                });
                                
                                for (let i = 0; i<filter.vals.length; i++) {
                                    let regexVal = new RegExp(filter.vals[i], "i");
                                    if (filter.anyValueAllowed===true) {    //always include if there is some value for the attribute
                                        tok.filterKey = filter.vals[i];     
                                        tok.filterColor = filter.colors[i];
                                        if (filter.compareType[i] === 'contains') {
                                            tempGroup.push(filter.vals[i]);
                                        } else {
                                            tempGroup.push(filter.compareType[i] + filter.vals[i]);
                                        }
                                    } else {
                                        switch (filter.compareType[i]) {
                                            case 'contains':
                                                if ( (filter.ignore[i] || tok.filterKey.match('ignore')) && attrCurrentVal.toString().match(regexVal) ) {
                                                    tok.filterKey = 'ignore';   //found contains match - ignore
                                                } else if (attrCurrentVal.toString().match(regexVal)) {
                                                    tok.filterKey = filter.vals[i];     //found contains match - include
                                                    tok.filterColor = filter.colors[i];
                                                    tempGroup.push(filter.vals[i]);
                                                }
                                                break;
                                            case '@':   //exact match
                                                if ( (filter.ignore[i] || tok.filterKey.match('ignore')) && attrCurrentVal === filter.vals[i] ) {
                                                    tok.filterKey = 'ignore';   //found exact match - ignore
                                                } else if (attrCurrentVal === filter.vals[i]) {
                                                    tok.filterKey = filter.vals[i];     //found exact match - include
                                                    tok.filterColor = filter.colors[i];
                                                    tempGroup.push(filter.compareType[i] + filter.vals[i]);
                                                }
                                                break;
                                            case '>':
                                                if ( (filter.ignore[i] || tok.filterKey.match('ignore')) && (parseFloat(attrCurrentVal) > parseFloat(filter.vals[i])) ) {
                                                    tok.filterKey = 'ignore';   //found greater than match - ignore
                                                } else if ( parseFloat(attrCurrentVal) > parseFloat(filter.vals[i]) ) {
                                                    tok.filterKey = filter.vals[i];     //found greater than match - include
                                                    tok.filterColor = filter.colors[i];
                                                    tempGroup.push('&gt;' + filter.vals[i]);
                                                }
                                                break;
                                            case '<':
                                                if ( (filter.ignore[i] || tok.filterKey.match('ignore')) && (parseFloat(attrCurrentVal) < parseFloat(filter.vals[i])) ) {
                                                    tok.filterKey = 'ignore';   //found less than match - ignore
                                                } else if ( parseFloat(attrCurrentVal) < parseFloat(filter.vals[i]) ) {
                                                    tok.filterKey = filter.vals[i];     //found less than match - include
                                                    tok.filterColor = filter.colors[i];
                                                    tempGroup.push('&lt;' + filter.vals[i]);
                                                }
                                                break;
                                        }
                                    }
                                }
                                //build filter group string from array of matching filters
                                if (tempGroup.length > 0) {
                                    //assign filter group to token
                                    tok.filterGroup = tempGroup.join('<br>'); 
                                    if (!filter.groups.includes(tok.filterGroup)) {
                                        //add unique filter group to array of valid filter groups (used later for table output)
                                        filter.groups.push(tok.filterGroup);
                                    }
                                }
                            }
                        }
                    });
                    
                    //toksInRange = tokIdDist.filter(tok => (tok.filterKey !=="" && tok.filterKey !== 'ignore') );
                    toksInRange = toksInRange.filter(tok => (tok.filterKey !=="" && tok.filterKey !== 'ignore') );
                    
                }
                
                //LoS Filter. Test line segments from origin to 5pts per token (center & 4 corners). If all 5 intersect DL path segments, LoS is considered blocked 
                if ( losBlocks && pageDL ) {
                    let paths = findObjs({                              
                      _pageid: pageID,                              
                      _type: "path",
                      layer: "walls"
                    });
                    
                    let vertices = [];
                    let pathSegs = [];
                    let n = 0;
                    paths.forEach((pathObj) => {
                        let path = JSON.parse(pathObj.get("path"));
                        let center = new pt(pathObj.get("left"), pathObj.get("top"));
                        let w = pathObj.get("width");
                        let h = pathObj.get("height");
                        let rot = pathObj.get("rotation");
                        let scaleX = pathObj.get("scaleX");
                        let scaleY = pathObj.get("scaleY");
                        
                        //covert path vertices from relative coords to actual map coords
                        path.forEach((vert) => {
                            let tempPt = GetAbsoluteControlPt(vert, center, w, h, rot, scaleX, scaleY);
                            vertices.push(tempPt)
                        });
                       
                        for (let i = 0; i < vertices.length-1; i++) {
                            //we only want to count path segments with at least one vertex within range
                            if ( distBetweenPts(originPt, vertices[i]) <= range || distBetweenPts(originPt, vertices[i+1]) <= range ) {
                                pathSegs.push({
                                    pt1: new pt(vertices[i].x, vertices[i].y),
                                    pt2: new pt(vertices[i+1].x, vertices[i+1].y)
                                });
                            }
                        }
                        
                        //cleanup before next pathObj
                        n+=1;
                        vertices = [];
                    });
                    
                    //Find if LoS is blocked for each target token in range, and filter out if blocked
                    toksInRange.map(tok => {
                        tok.losBlocked = isLoSBlocked(originX, originY, tok, pathSegs);
                    });
                    
                    toksInRange = tokIdDist.filter(tok => (tok.losBlocked === false) );
                }
                
                ///////////////////////////////////////////////////////////////////////////
                /////////       RADAR ANIMATION
                ///////////////////////////////////////////////////////////////////////////
                let z;  //only use for 5e cones. See build5eCone function documentation for details
                let i = 0;
                let oldRadius = 0;
                polygon = [];
                while ( radius <= range ) {
                    if (wavetype === 'circle') {            //circular wavefront
                        pathstring = buildCircle(radius, coneWidth, coneDirection);
                    } else if (wavetype === 'square') {     //square wavefront
                        pathstring = buildSquare(radius, coneWidth, coneDirection);
                    } else if (wavetype === '5e') {         //5e-style cone  wavefront
                        z = (radius / (2*Math.sin(Math.atan(0.5)))) - radius;
                        pathstring = build5eCone(radius, z, coneWidth, coneDirection);
                    }
                    
                    //let seeAnimation = true;
                    if (seeAnimation === true) {
                        promise = new Promise((resolve, reject) => {
                            setTimeout(() => {
                                if (wavetype === '5e') {
                                    drawWave(pageID, pathstring, "transparent", waveColor, "objects", 3, radius, originX-z, originY-z, waveLife);
                                } else {
                                    drawWave(pageID, pathstring, "transparent", waveColor, "objects", 3, radius, originX, originY, waveLife);
                                }
                                resolve("done!");
                            }, waveDelay);
                        });
                        
                        result = await promise;
                    }
                    
                    oldRadius = radius;
                    radius += waveIncrement;
                    pathstring_old = pathstring;
                    
                    //Ping target tokens as the radar wavefront hits them
                    if (tokLife > 0) {
                        toksInRange.forEach( tok => {
                            //use euclidean distance calcs - circle wavefront
                            if ( (wavetype === 'circle') && (tok.closestDist > oldRadius) && (tok.closestDist <= radius) ) {
                                spawnObj.get("_defaulttoken", async function(defaultToken) {
                                    result = await spawnTokenAtXY(who, defaultToken, pageID, tok["left"], tok["top"], tok["width"]+padding, tok["height"]+padding, controlledby, tokLife, tok.filterColor);
                                });
                            }
                            
                            // square wavefront
                            if (wavetype === 'square') {
                                let sqPath = JSON.parse(pathstring);
                                
                                //use bounding box of the square
                                let bbUL_old = new pt(originX - oldRadius, originY - oldRadius);    //Upper Left of previous bounding box
                                let bbLR_old = new pt(originX + oldRadius, originY + oldRadius);    //Lower Right of previous bounding box
                                let bbUL_new = new pt(originX - radius, originY - radius);    //Upper Left of current bounding box
                                let bbLR_new = new pt(originX + radius, originY + radius);    //Lower Right of current bounding box
                                let tX = tok.closestPt.x;
                                let tY = tok.closestPt.y;
                                if ( (bbUL_new.x <= tX && tX <= bbLR_new.x && bbUL_new.y <= tY && tY <= bbLR_new.y) && !(bbUL_old.x <= tX && tX <= bbLR_old.x && bbUL_old.y <= tY && tY <= bbLR_old.y)) {
                                    spawnObj.get("_defaulttoken", async function(defaultToken) {
                                        result = await spawnTokenAtXY(who, defaultToken, pageID, tok["left"], tok["top"], tok["width"]+padding, tok["height"]+padding, controlledby, tokLife, tok.filterColor);
                                    });
                                }
                            }
                            
                            //5e cone
                            if (wavetype === '5e') {
                                //just check distance, since tokens outside of angle were already filtered out
                                
                                if (isPointInCone(tok.closestPt, originPt, radius, coneDirection, coneWidth, true) && !isPointInCone(tok.closestPt, originPt, oldRadius, coneDirection, coneWidth, true)) {
                                    spawnObj.get("_defaulttoken", async function(defaultToken) {
                                        result = await spawnTokenAtXY(who, defaultToken, pageID, tok["left"], tok["top"], tok["width"]+padding, tok["height"]+padding, controlledby, tokLife, tok.filterColor);
                                    });
                                }
                            }
                        });
                    }
                } 
               
                
                ///////////////////////////////////////////////////////////////////////////
                /////////       OPTIONAL OUTPUT
                /////////       results appear in order of proximity to origin. Possibly grouped by filter keywords
                ///////////////////////////////////////////////////////////////////////////
                if (displayOutput || includeGM) {
                    //------------------------------------------------------------------------------------
                    //Optional Graphical Output Part 1 - we're going to piggyback on the loop through toks in range
                    //-----------------------------------------------------------------------------------
                    let pingHTML = '';   //html string for graphical representation of pinged tokens
                    tableLineCounter = 0;
                    
                    //Calc number of cols & rows for grid
                    let numCols, numRows, rangeInUnits;
                    if (pageGridIncrement !== 0) {
                        //grid map
                        rangeInUnits = range / (70 * pageGridIncrement);
                        //twice the range plus one grid unit
                        numCols = rangeInUnits * 2 + 1;
                        numRows = numCols;
                        //The radar_range-to-graphic scaling factor. Range is already in pixels
                        range2GraphicScale = graphHeight / (range * 2 + (70 * pageGridIncrement)); 
                    } else {  
                        //gridless map
                        rangeInUnits = 2*(range * pageScaleNumber) / 70;
                        rangeInUnits = range / 70;
                        numCols = rangeInUnits * 2 + 1;
                        numRows = numCols;
                        range2GraphicScale = graphHeight / (range * 2 + 70); 
                    }
                    let rowHeight = graphHeight/numRows;
                    let colWidth = graphWidth/numCols;
                    let pingW = graphWidth/numCols;
                    let pingH = graphHeight/numRows;
                    //add ping for origin token 
                    if (outputGraph) {pingHTML = addPingHTML(pingHTML, 0, 0, originAvgSize, originAvgSize, graphWidth, graphHeight, pingH, pingW, '#ffffffcc', range2GraphicScale);}  //adds to html string for graphical output

                    //------------------------------------------------------------------------------------
                    //loop through toks in range for building text and/or graphical output
                    //------------------------------------------------------------------------------------
                    toksInRange.sort((a,b) => (a.dist > b.dist) ? 1 : ((b.dist > a.dist) ? -1 : 0));
                    let counter;
                    if (filter.type !== "" && filterExcludeOnly === false && groupBy === true) {
                        let group = '';
                        let rowData = '';
                        let addNewRowHeader = true; 
                        
                        //use user-defined filters
                        //for (let i = 0; i<filter.vals.length; i++) {
                        for (let i = 0; i<filter.groups.length; i++) {
                            addNewRowHeader = true;
                            counter = 0
                            //if ( filter.ignore[i] === true ) {
                                //this is an ignore filter, do not report anything
                            //} else {
                                //filter on this value
                                /*
                                if (filter.compareType[i].includes('@') || filter.compareType[i].includes('>') || filter.compareType[i].includes('<')) {
                                    group = filter.compareType[i] + filter.vals[i];
                                } else {
                                    group = filter.vals[i];
                                }
                                */
                                group = filter.groups[i];
                                toksInRange.forEach( tok => {
                                    if (tok.filterGroup === filter.groups[i]) {
                                        if (outputGraph) {pingHTML = addPingHTML(pingHTML, tok.centerDistX, tok.centerDistY, tok.width, tok.height, graphWidth, graphHeight, pingH, pingW, tok.filterColor, range2GraphicScale);}  //adds to html string for graphical output
                                        
                                        //check for "hidden" tokens
                                        if (group.indexOf('-')===-1 && (tok.layer === 'gmlayer' || tok.layer === 'walls')) {
                                            if (addNewRowHeader) {
                                                addNewRowHeader = false;
                                            } else {
                                                group = '';   //only want the row header on the first row of output for each filter
                                            }
                                            //identify hidden tokens in chat
                                            content = GetDirectionalInfo(parseInt(tok.closestPt.x), parseInt(tok.closestPt.y), originX, originY, displayUnits, includeTotalDist, pageScaleNumber, pageScaleUnits, pageGridIncrement, outputCompact, calcType);
                                            rowData = buildRowOutput(true, group, _h.red(parseInt(counter+1)+'.'), _h.red(content));
                                            outputLines.push(rowData);
                                        } else if (group.indexOf('-')===-1) {
                                            if (addNewRowHeader) {
                                                addNewRowHeader = false;
                                            } else {
                                                group = '';   //only want the row header on the first row of output for each filter
                                            }
                                            
                                            //normal output
                                            content = GetDirectionalInfo(parseInt(tok.closestPt.x), parseInt(tok.closestPt.y), originX, originY, displayUnits, includeTotalDist, pageScaleNumber, pageScaleUnits, pageGridIncrement, outputCompact, calcType);
                                            rowData = buildRowOutput(true, group, parseInt(counter+1)+'.', content);
                                            outputLines.push(rowData);
                                            group = '';   //only want the row header on the first row of output for each filter
                                        }
                                        counter +=1;
                                    }  
                                });
                                
                                if (counter === 0 && group.indexOf('-')===-1) { 
                                    content = 'N/A';
                                    rowData = buildRowOutput(true, group, parseInt(counter+1)+'.', content);
                                    outputLines.push(rowData);
                                }
                        }
                    } else {
                        //no filters used
                        if (toksInRange.length===0) {
                            content = 'N/A';
                            rowData = buildRowOutput(false, '', '1.', content);
                            outputLines.push(rowData);
                        } else {
                            for (let i = 0; i < toksInRange.length; i++) {
                                //graphical output stuff. Appends new graphical element to the string 
                                if (outputGraph) {pingHTML = addPingHTML(pingHTML, toksInRange[i].centerDistX, toksInRange[i].centerDistY, toksInRange[i].width, toksInRange[i].height, graphWidth, graphHeight, pingH, pingW, '#ff0000', range2GraphicScale)};  //adds to html string for graphical output
                                
                                //text output stuff
                                if (toksInRange[i].layer === 'gmlayer' || toksInRange[i].layer === 'walls') {
                                    //identify hidden tokens in chat
                                    content = GetDirectionalInfo(parseInt(toksInRange[i].closestPt.x), parseInt(toksInRange[i].closestPt.y), originX, originY, displayUnits, includeTotalDist, pageScaleNumber, pageScaleUnits, pageGridIncrement, outputCompact, calcType);
                                    rowData = buildRowOutput(false, '', _h.red(parseInt(i+1)+'.'), _h.red(content));
                                    outputLines.push(rowData);
                                } else {
                                    //normal output
                                    content = GetDirectionalInfo(parseInt(toksInRange[i].closestPt.x), parseInt(toksInRange[i].closestPt.y), originX, originY, displayUnits, includeTotalDist, pageScaleNumber, pageScaleUnits, pageGridIncrement, outputCompact, calcType);
                                    rowData = buildRowOutput(false, '', parseInt(i+1)+'.', content);
                                    outputLines.push(rowData);
                                }
                            }
                        }
                    }
                    
                    //------------------------------------------------------------------------------------
                    //Optional Graphical Output Part 2 - we've built the html for graphical token pings, so build the rest now 
                    //------------------------------------------------------------------------------------
                    let backgroundHTML = buildBackgroundHTML(graphWidth, graphHeight, numRows, numCols, colWidth, rowHeight, useGrid, useCircles, useRadial);
                    let graphicalOutput = backgroundHTML + pingHTML + '</div></div>';
                    if (displayOutput && outputGraph) {
                        sendChat(scriptName, `/w "${who}" `+ graphicalOutput);
                    }
                    if (includeGM && !playerIsGM(msg.playerid) && outputGraph) {
                        sendChat(scriptName, '/w gm ' + graphicalOutput);
                    }
                    
                    //Build final html output
                    let tableOutput = htmlTableTemplateStart.replace("=X=TITLE=X=", title).replace("=X=UNITS=X=", displayUnits);
				    
                    for (let x=0; x<outputLines.length; x++) {
						tableOutput += outputLines[x];
					}
					tableOutput += htmlTableTemplateEnd;
					
					if (displayOutput && outputTable) {
                        sendChat(scriptName, `/w "${who}" `+ tableOutput);
                    }
                    if (includeGM && !playerIsGM(msg.playerid) && outputTable) {
                        sendChat(scriptName, '/w gm ' + tableOutput);
                    }
                }
            }
        
        }
        catch(err) {
            if (who === undefined) {
                sendChat(scriptName,'Unhandled exception: ' + err.message);
            } else {
                sendChat(scriptName,`/w "${who}" `+ 'Unhandled exception: ' + err.message);
            }
        }
    };
    
    const registerEventHandlers = function() {
        on('chat:message', handleInput);
    };

    on("ready",() => {
        checkInstall();
        registerEventHandlers();
    });
})();
