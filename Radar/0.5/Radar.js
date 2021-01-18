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
        --spacing|      <#>                             //Default=35. The spacing between waves, in pixels (lower number = slower wavefront)
        --wavedelay|    <#>                             //Default=50. How much time to wait before next wave, in ms (higher number = slower wavefront)
        --wavelife|     <#>                             //Default=200. How long each wave wil remain on screen, in ms (higher number = more waves present at any one time)
        --pinglife|     <#>                             //Default=2000. How long each "RadarPing" token wil remain on screen, in ms 
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
        
        --units|        <u/units/squares/square/hexes/hex> for "u", or <anything else> to just use map settings, e.g. ft, km, miles
                                                        //Only affects Display output
                                                        //for GRIDLESS MAP, this command must be included or else all results will be INFINITY
        //--------------------------------------------------------------------------------------
        //THE FOLLOWING TWO COMMANDS ARE USED WHEN CALLING RADAR FROM ANOTHER API SCRIPT 
        //  e.g. sendChat(scriptName, `!radar --selectedID|${msg.selected[0]._id} --playerID|${msg.playerid}`
        --selectedID|   <ID of the selected token>              //used to identify the radar origin token
        --playerID|     <ID of the player calling the script>   //used to determine who gets whispered the results
        //--------------------------------------------------------------------------------------
        
        //--------------------------------------------------------------------------------------
        //ONLY CHOOSE ONE OF THESE TWO FILTERS: (tokfilter or charfilter)
                //if used, output template will group by filter keyword
                
        --tokfilter|    <property>:<includeText1<optional #color>,..., -exclude text>  
                        e.g. "bar3_value:celestial, fiend, undead, -cloak"
                                                                                //only pings tokens where bar3_value contains either celestial, fiend, or undead. Ignore tokens with "cloak"
                                                                                //the only valid <properties> are:
                                                                                    // "bar1_value"
                                                                                    // "bar2_value"
                                                                                    // "bar3_value"
                                                                                    // "bar1_max"
                                                                                    // "bar2_max"
                                                                                    // "bar3_max"
                                                                                    // "gmnotes"
                        e.g. with optional color coded auras by filter group
                            "bar3_value:celestial#yellow, fiend#red, undead#blue, -cloak"
                                                                                    //Valid aura colors:
                                                                                    // "#red"  (default)
                                                                                    // "#green"
                                                                                    // "#blue"
                                                                                    // "#yellow"
                                                                                    // "#9900ff" (any custom html color accepted)
         
        --charfilter|   <attribute>:<includeText1, includeText2, -excludeText>  
                        e.g. "npc_type:celestial, fiend, undead, -nondetection"
                                                                                //only ping tokens where npc_type attribute contains either celestial, fiend, or undead. Ignore tokens with "cloak"
                                                                                //any text may be entered for <attribute>
                                                                                    //if attribute doesn't exist on character sheet, token is ignored
                                                                                    //if token does not represent a character, it is ignored if this filter is used
                        e.g. with optional color coded auras by filter group
                            "npc_type:celestial#yellow, fiend#red, undead#blue, -cloak"
                                                                                    //same colors available as for tokfilter
        //--------------------------------------------------------------------------------------
    }}
*/
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const Radar = (() => {
    
    const scriptName = "Radar";
    const version = '0.5';
    
    const PING_NAME = 'RadarPing'; 
    
    const hRED = '#ff0000';
    const hYELLOW = '#ffff00';
    const hGREEN = '#00ff00';
    const hBLUE = '#0000ff';
    
    const checkInstall = function() {
        log(scriptName + ' v' + version + ' initialized.');
    };
    
    const pt = function(x,y) {
        this.x = x,
        this.y = y
    };
    
    const getCleanImgsrc = function (imgsrc) {
        let parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^\?]*)(\?[^?]+)?$/);
            if(parts) {
                return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
            }
        return;
    };
    
    //sendChat output formatting styles, modified from a portion of TheAaron's Token-mod script
    const _h = {
        outer: (...o) => `<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">${o.join(' ')}</div>`,
        title: (t,v) => `<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">${t} v${v}</div>`,
        subhead: (...o) => `<b>${o.join(' ')}</b>`,
        minorhead: (...o) => `<u>${o.join(' ')}</u>`,
        optional: (...o) => `${ch('[')}${o.join(` ${ch('|')} `)}${ch(']')}`,
        required: (...o) => `${ch('<')}${o.join(` ${ch('|')} `)}${ch('>')}`,
        header: (...o) => `<div style="padding-left:10px;margin-bottom:3px;">${o.join(' ')}</div>`,
        section: (s,...o) => `${_h.subhead(s)}${_h.inset(...o)}`,
        paragraph: (...o) => `<p>${o.join(' ')}</p>`,
        experimental: (...o) => `<div style="display:inline-block;padding: .1em 1em; border: 1px solid #993333; border-radius:.5em;background-color:#cccccc;color:#ff0000;">${o.join(' ')}</div>`,
        items: (o) => `<li>${o.join('</li><li>')}</li>`,
        ol: (...o) => `<ol>${_h.items(o)}</ol>`,
        ul: (...o) => `<ul>${_h.items(o)}</ul>`,
        grid: (...o) => `<div style="padding: 12px 0;">${o.join('')}<div style="clear:both;"></div></div>`, 
        cell: (o) =>  `<div style="width: 200px; padding: 0 3px; float: left;">${o}</div>`,
        statusCell: (o) =>  {
            let text = `${o.getName()}${o.getName()!==o.getTag()?` [${o.getTag()}]`:''}`;
            return `<div style="width: auto; padding: .2em; margin: .1em .25em; border: 1px solid #ccc; border-radius: .25em; background-color: #eee; line-height:1.5em; height: 1.5em;float:left;">${o.getHTML()}${text}</div>`;
        },
        inset: (...o) => `<div style="padding-left: 10px;padding-right:20px">${o.join(' ')}</div>`,
        join: (...o) => o.join(' '),
        pre: (...o) =>`<div style="border:1px solid #e1e1e8;border-radius:4px;padding:8.5px;margin-bottom:9px;font-size:12px;white-space:normal;word-break:normal;word-wrap:normal;background-color:#f7f7f9;font-family:monospace;overflow:auto;">${o.join(' ')}</div>`,
        preformatted: (...o) =>_h.pre(o.join('<br>').replace(/\s/g,ch(' '))),
        code: (...o) => `<code>${o.join(' ')}</code>`,
        attr: {
            bare: (o)=>`${ch('@')}${ch('{')}${o}${ch('}')}`,
            selected: (o)=>`${ch('@')}${ch('{')}selected${ch('|')}${o}${ch('}')}`,
            target: (o)=>`${ch('@')}${ch('{')}target${ch('|')}${o}${ch('}')}`,
            char: (o,c)=>`${ch('@')}${ch('{')}${c||'CHARACTER NAME'}${ch('|')}${o}${ch('}')}`
        },
        bold: (...o) => `<b>${o.join(' ')}</b>`,
        italic: (...o) => `<i>${o.join(' ')}</i>`,
        font: {
            command: (...o)=>`<b><span style="font-family:serif;">${o.join(' ')}</span></b>`
        },
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
    
    //Circle building portion of function is modified from TheAaron's "dlcircle" script
    const buildCircle = function(rad) {
        const centerX = rad
        const centerY = rad
        const at = (theta) => ({x: Math.cos(theta)*rad, y: Math.sin(theta)*rad}); 
        //Reduced resolution from original script to ease DL processing strain
        let steps = Math.min(Math.max(Math.round( (Math.PI*2*Math.sqrt((2*rad*rad)/2))/35),4),20);
        //steps = Math.ceil(steps/10);
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
        
        //Some js wizardry from TheAaron with the array map function. I couldn't make it work without returning the outer (1st & last) square brackets
        //So, we will take this string, strip the last "]", then append the grid points to the path
        let circlePoints = JSON.stringify(acc.map((v,i)=>([(i?'L':'M'),rad+v[0],rad+v[1]])));
        circlePoints = circlePoints.substring(0, circlePoints.length - 1);
        
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
    
    const DistBetweenPts = function(pt1, pt2) {
        dist = Math.sqrt( Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2) );
        return dist;
    }
    
    //finds distance between origin pt(center of origin token) to the CLOSEST corner of the target token
    const TokToOriginDistance = function(tok, originX, originY, gridIncrement) {
        let minDist;
        let dist;
        let tokX = tok.get("left");
        let tokY = tok.get("top");
        let w = tok.get("width");
        let h = tok.get("height");
        let rot = DegreesToRadians(tok.get("rotation"));  //rotation in radians
        let closestPt;
        let closestDist;
        let corners = [];
        
        //define the four corners of the target token as new points
            //we will also rotate those corners appropirately around the target tok center
        corners.push(RotatePoint(tokX, tokY, rot, new pt( tokX-w/2, tokY-h/2 )))     //Upper left
        corners.push(RotatePoint(tokX, tokY, rot, new pt( tokX+w/2, tokY-h/2 )))     //Upper right
        corners.push(RotatePoint(tokX, tokY, rot, new pt( tokX-w/2, tokY+h/2 )))     //Lower left
        corners.push(RotatePoint(tokX, tokY, rot, new pt( tokX+w/2, tokY+h/2 )))     //Lower right
        
        let pUL = new pt( tokX-w/2 + 35/gridIncrement, tokY-h/2 + 35/gridIncrement )     //Upper left
        let pUR = new pt( tokX+w/2 - 35/gridIncrement, tokY-h/2 + 35/gridIncrement )     //Upper right
        let pLL = new pt( tokX-w/2 + 35/gridIncrement, tokY+h/2 - 35/gridIncrement )     //Lower left
        let pLR = new pt( tokX+w/2 - 35/gridIncrement, tokY+h/2 - 35/gridIncrement )     //Lower right
        
        pUL = RotatePoint(tokX, tokY, rot, pUL);
        pUR = RotatePoint(tokX, tokY, rot, pUR);
        pLL = RotatePoint(tokX, tokY, rot, pLL);
        pLR = RotatePoint(tokX, tokY, rot, pLR);
        
        //Upper Left corner
        minDist = dist = Math.sqrt( Math.pow(originX - pUL.x, 2) + Math.pow(originY - pUL.y, 2) );
        closestPt = pUL;
        closestDist = dist;
        
        //Upper Right corner
        dist = Math.sqrt( Math.pow(originX - pUR.x, 2) + Math.pow(originY - pUR.y, 2) );
        if (dist < minDist) {
            minDist = dist;
            closestPt = pUR;
            closestDist = dist;
        }
        
        //Lower Left corner
        dist = Math.sqrt( Math.pow(originX - pLL.x, 2) + Math.pow(originY - pLL.y, 2) );
        if (dist < minDist) {
            minDist = dist;
            closestPt = pLL;
            closestDist = dist;
        }
        
        //Lower Right corner
        dist = Math.sqrt( Math.pow(originX - pLR.x, 2) + Math.pow(originY - pLR.y, 2) );
        if (dist < minDist) {
            minDist = dist;
            closestPt = pLR;
            closestDist = dist;
        }
        
        minDist = Math.round(minDist, 1); 
        
        //log(closestDist + ' => ' + closestPt.x + ', ' + closestPt.y)
        
        return minDist = {
            dist: minDist,
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
    
    const GetDirectionalInfo = function(tokX, tokY, originX, originY, distType, includeTotalDist, scaleNumber, scaleUnits, gridIncrement) {
        let retVal = "";
        let xDist;
        let yDist;
        let totalDist;
        
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
        totalDist = Math.sqrt( Math.pow(xDist, 2) + Math.pow(yDist, 2) );
        
        if (xDist > 0) {
            retVal = 'Right ' + _h.inlineResult(Math.round(xDist,1)) + ',';
        } else {
            retVal = 'Left ' + _h.inlineResult(Math.round(Math.abs(xDist), 1)) + ',';
        }
        
        if (yDist > 0) {
            retVal = retVal + 'Down ' + _h.inlineResult(Math.round(yDist, 1)) + '';
        } else {
            retVal = retVal + 'Up ' + _h.inlineResult(Math.round(Math.abs(yDist), 1)) + '';
        }
        
        retVal = retVal + '\n' + 'Distance = ' + _h.inlineResult(parseFloat(totalDist).toFixed(1));
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
            /*
            return {
                x: p0.x + (t * s1_x),
                y: p0.y + (t * s1_y)
            };
            */
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
    
    async function handleInput(msg) {
        let pathstring;             //JSON string for wavefront paths
        let selected;               //msg.selected object
        let selectedID;             //selected token
        let playerID;               //which player called the script. Will determine who gets whispered results 
        let oTok;                   //origin token
        let validArgs = "range, wavespacing, wavedelay, wavelife, pinglife, layer, charfilter, tokfilter, title, silent, units, LoS, selectedID, playerID";
        let range = 350;            //how far the radar range extends, in pixels
        let convertRange = "";      //will we need to convert range from pixels to "u" or another page-defined distance unit?
        let waveIncrement = 35;     //the spacing between waves, in pixels (lower number = slower wavefront)
        let waveDelay = 50;         //how much time to wait between each wave increment, in ms (higher number = slower wavefront)
        let waveLife = 200;         //how long each wave wil remain on screen, in ms (higher number = more waves present at any one time)
        let tokLife = 2000;         //how long each "RadarPing" token wil remain on screen, in ms 
        let layers = ['objects', 'gmlayer'];    //the layersin which to look for tokens. Default values are overriden if --layers command is used 
        let filter = {              //optional filters for which tokens will be actively pinged
            type: "",               //types include "char" and "tok"
            attr: "",               //key to filter on. e.g. "npc_type" attribute for a character sheet, or "bar3" for a token filter
            vals: [],                //array of values for which to filter against filter.attr     e.g. ["celestial", "fiend", "undead"]
            colors: []
        }
        let losBlocks = false;      //Will DL walls block radar sensor if completely obscured (will look at 5 pts per token to determine LoS)
        let title = "Radar Ping Results";             //title of the default template output
        let content = "";           //string value that will contain all the row content for default templates
        let displayOutput = true    //output results via sendChat (default template)
        let pageScaleNumber = 5;    //distance of one unit
        let pageScaleUnits = "ft";  //the type of units to use for the scale
        let PageGridIncrement = 1;  //how many gridlines per 70px
        let displayUnits = "u";         //output distances in "units" or use pageScaleUnits 
        let includeTotalDist = false;   //inlude the total range in the output, or just directional (X & Y distances)
        let hasSight = false;       //Will the RadarPing token grant temporary sight to the 
        let includeGM = false;      //Send a copy of the ouput to the GM chat if player calls script
        
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
        let retVal = [];            //array of potential error messages to pass back to main handleInput funtion
        
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
                            range = parseInt(param);
                            let u = param.match(/[a-z]/i);   //if not an empty string, we will use page settings to convert range to "u" or other map-defined units
                            if (u !== null) {
                                convertRange = u[0]
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
                        case "pinglife":
                            tokLife = parseInt(param);
                            break;
                        case "layers":
                            layers = [];    //delete default layers first
                            layers = param.split(",").map(layer => layer.trim() );
                            break;
                        case "charfilter":
                            filter.type = "char" 
                            let tempCharFilter = param.split(":").map(layer => layer.trim() );
                            filter.attr = tempCharFilter[0];
                            filter.vals = tempCharFilter[1].split(",").map(layer => layer.trim() );
                            //check for user-defined aura colors by filter value
                            filter.vals.forEach((val, index) => {
                                if ( val.match(/#/) ) {
                                    let f = val.split('#')
                                    switch (true) {
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
                                    filter.vals[index] = f[0];  //strips the color out of the filter
                                } else {
                                    //default color
                                    filter.colors.push(hRED)
                                }
                            });
                            break;
                        case "tokfilter":
                            filter.type = "tok" 
                            let tempTokFilter = param.split(":").map(layer => layer.trim() );
                            filter.attr = tempTokFilter[0];
                            filter.vals = tempTokFilter[1].split(",").map(layer => layer.trim() );
                            //check for user-defined aura colors by filter value
                            filter.vals.forEach((val, index) => {
                                if ( val.match(/#/) ) {
                                    let f = val.split('#')
                                    switch (true) {
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
                                    filter.vals[index] = f[0];  //strips the color out of the filter
                                } else {
                                    //default color
                                    filter.colors.push(hRED)
                                }
                            });
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
                            if (_.contains(['u', 'units', 'squares', 'square', 'hexes', 'hex'], param.toLowerCase())) {
                                displayUnits = 'u'
                            } else {
                                displayUnits = undefined;   //will re-define from the Page settings later.
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
                        default:
                            retVal.push('Unexpected argument identifier (' + option + '). Choose from: (' + validArgs + ')');
                            break;    
                    }
                }); //end forEach arg
                
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
                radius = (oTok.get("width"))/2; 
                pageID = oTok.get("pageid");
                originX = oTok.get("left");
                originY = oTok.get("top");
                originPt = new pt(originX, originY);
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
                    let originDist = TokToOriginDistance(tok, originX, originY, PageGridIncrement);
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
                        closestPt: originDist.closestPt,    //the center of the closest square
                        closestDist: originDist.closestDist,
                        corners: originDist.corners,        //not currently used. Will be if ray tracing LoS
                        filterKey: "",
                        losBlocks: false,
                        filterColor: hRED  //default aura = red
                    }
                });
               
                //Initial Filter: only those within range of the radar (meas from center of origin token to closet corner of target token)
                //toksInRange = tokIdDist.filter(tok => (tok.dist <= range) && (tok.id !== oTok.id) );
                toksInRange = tokIdDist.filter(tok => (tok.closestDist <= range) && (tok.id !== oTok.id) );
                
                
                //User may request to filter tokens by value of a character or token attribute
                if (filter.type==="char") {
                    toksInRange.map(tok => {
                        if (tok.represents) {
                            let tempAttr = findObjs({_type: "attribute", _characterid: tok.represents, name: filter.attr});
                            if (tempAttr.length >= 1) {
                                filter.vals.forEach((val,index) => {
                                    //If filter value starts with "-" or has already been tagged with 'ignore', then ignore this token if find a match against val
                                    if ( val.indexOf('-') === 0 || tok.filterKey.match('ignore') ) {   
                                        let regexVal = new RegExp(val.replace(/-/,''), "i");
                                        if (tempAttr[0].get("current").match(regexVal) ) {
                                            tok.filterKey = 'ignore';
                                        }
                                    } else {
                                        //If positive match, tag it
                                        let regexVal = new RegExp(val, "i");
                                        if (tempAttr[0].get("current").match(regexVal) ) {
                                            tok.filterKey = val;
                                            tok.filterColor = filter.colors[index];
                                        }
                                    }
                                });
                            }
                        }
                    });
                    toksInRange = tokIdDist.filter(tok => (tok.filterKey !=="" && tok.filterKey !== 'ignore') );
                } else if (filter.type==="tok") {
                    toksInRange.map(tok => {
                        filter.vals.forEach((val, index) => {
                            //If filter value starts with "-" or has already been tagged with 'ignore', then ignore this token if find a match against val
                            if ( val.indexOf('-') === 0 || tok.filterKey.match('ignore') ) {   
                                let tempVal = tok[filter.attr].toString() || "NoMatch";
                                let regexVal = new RegExp(val.replace(/-/,''), "i");
                                if (tempVal.replace(/-/,'').match(regexVal) ) {
                                    tok.filterKey = 'ignore';
                                }
                            } else {
                                //If positive match, tag it
                                let tempVal = tok[filter.attr].toString() || "NoMatch";
                                let regexVal = new RegExp(val, "i");
                                if (tempVal.match(regexVal) ) {
                                    tok.filterKey = val;
                                    tok.filterColor = filter.colors[index];
                                }
                            }
                        });
                    });
                    toksInRange = tokIdDist.filter(tok => (tok.filterKey !=="" && tok.filterKey !== 'ignore') );
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
                            if ( DistBetweenPts(originPt, vertices[i]) <= range || DistBetweenPts(originPt, vertices[i+1]) <= range ) {
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
                    
                    //sendChat('testing','pathSegs.length = ' + pathSegs.length);
                    //Find if LoS is blocked for each target token in range, and filter out if blocked
                    toksInRange.map(tok => {
                        tok.losBlocked = isLoSBlocked(originX, originY, tok, pathSegs);
                    });
                    
                    toksInRange = tokIdDist.filter(tok => (tok.losBlocked === false) );
                    
                }
                
                
                ///////////////////////////////////////////////////////////////////////////
                /////////       RADAR ANIMATION
                ///////////////////////////////////////////////////////////////////////////
                let i = 0;
                let oldRadius = 0;
                while ( radius <= range ) {
                    pathstring = buildCircle(radius);
                    
                    let useAnimation = true;
                    if (useAnimation === true) {
                        promise = new Promise((resolve, reject) => {
                            setTimeout(() => {
                                drawWave(pageID, pathstring, "transparent", "#ff0000", "objects", 3, radius, originX, originY, waveLife);
                                resolve("done!");
                            }, waveDelay);
                        });
                        
                        result = await promise;
                    }
                    
                    oldRadius = radius;
                    radius += waveIncrement;
                    
                    //Ping target tokens as the radar wavefront hits them
                    if (tokLife > 0) {
                        toksInRange.forEach( tok => {
                            if ( (tok.dist > oldRadius) && (tok.dist <= radius) ) {
                                spawnObj.get("_defaulttoken", async function(defaultToken) {
                                    result = await spawnTokenAtXY(who, defaultToken, pageID, tok["left"], tok["top"], tok["width"]+padding, tok["height"]+padding, controlledby, tokLife, tok.filterColor);
                                });
                                
                            }
                        });
                    }
                    
                }
                
                ///////////////////////////////////////////////////////////////////////////
                /////////       OPTIONAL OUTPUT
                /////////       results appear in order of proximity to origin. Possibly grouped by filter keywords
                ///////////////////////////////////////////////////////////////////////////
                if (displayOutput || includeGM) {
                    toksInRange.sort((a,b) => (a.dist > b.dist) ? 1 : ((b.dist > a.dist) ? -1 : 0));
                    let counter;
                    if (filter.type !== "") {
                        filter.vals.forEach( val => {
                            counter = 0
                            if ( val.indexOf('-') === 0 ) {
                                //this is an ignore filter, do not report anything
                            } else {
                                //filter on this value
                                content = content + '{{' + val + ':=';
                                toksInRange.forEach( tok => {
                                    if (tok.filterKey === val) {
                                        if (tok.layer === 'gmlayer' || tok.layer === 'walls') {
                                            //identify hidden tokens in chat
                                            content = content + _h.red(_h.bold(parseInt(counter+1) + '. ') + GetDirectionalInfo(parseInt(tok.closestPt.x), parseInt(tok.closestPt.y), originX, originY, displayUnits, includeTotalDist, pageScaleNumber, pageScaleUnits, pageGridIncrement)) + '\n';
                                        } else {
                                            //normal output
                                            content = content + _h.bold(parseInt(counter+1) + '. ') + GetDirectionalInfo(parseInt(tok.closestPt.x), parseInt(tok.closestPt.y), originX, originY, displayUnits, includeTotalDist, pageScaleNumber, pageScaleUnits, pageGridIncrement) + '\n';
                                        }
                                        counter +=1;
                                    }  
                                });
                                if (counter === 0) { content = content + 'N/A'; }
                                content = content + '}}';
                            }
                        });
                    } else {
                        //toksInRange.sort((a,b) => (a.dist > b.dist) ? 1 : ((b.dist > a.dist) ? -1 : 0));
                        for (let i = 0; i < toksInRange.length; i++) {
                            if (toksInRange[i].layer === 'gmlayer' || toksInRange[i].layer === 'walls') {
                                //identify hidden tokens in chat
                                content = content + '{{' + parseInt(i+1) + ':=' + _h.red(_h.bold(' ') + GetDirectionalInfo(parseInt(toksInRange[i].closestPt.x), parseInt(toksInRange[i].closestPt.y), originX, originY, displayUnits, includeTotalDist, pageScaleNumber, pageScaleUnits, pageGridIncrement)) + '}}';
                            } else {
                                //normal output
                                content = content + '{{' + parseInt(i+1) + ':=' + GetDirectionalInfo(parseInt(toksInRange[i].closestPt.x), parseInt(toksInRange[i].closestPt.y), originX, originY, displayUnits, includeTotalDist, pageScaleNumber, pageScaleUnits, pageGridIncrement) + '}}';
                            }
                        }
                    }
                    let output = `&{template:default} {{name=${title} (Units:${displayUnits})}}` + content;
                    if (displayOutput) {
                        sendChat(scriptName, `/w "${who}" `+ output);
                    }
                    if (includeGM && !playerIsGM(msg.playerid)) {
                        sendChat(scriptName, '/w gm ' + output);
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
