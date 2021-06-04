var DoorKnocker = DoorKnocker || (function() {var scriptStart = new Error;
    scriptStart = scriptStart.stack.match(/apiscript\.js:(\d+)/)[1]*1;
    'use strict';

    let version = 1.01,
        lastUpdate = 1566227029,
        helpCharacter,
        helpLink,
        IDqueue = {},
        defaultTokenImage = 'https://s3.amazonaws.com/files.d20.io/images/89593533/NjVfN1rZhwh0lbuuYTuQWA/max.png?1566172197';
        
/*
Door Knocker script:
Author: Scott C.
Contact: https://app.roll20.net/users/459831/scott-c
Thanks to: KeithCurtis for being my guinea pig
state.DoorKnocker format:
state.DoorKnocker = {
    version:#.###,
    wallColor:hexcolor,
    doorColor:hexcolor,
    hiddenColor:hexcolor,
    lockedColor:hexcolor
}

Script Scope:
Primary goal(s)
- Handling of door dl lines that requires the bare minimum of setup, preferably no more than simply creating dl lines.
- Door handling should be able to open/close a single door or multiple doors if needed
Secondary goal(s)
- Easy script initialization based on existing dl lines
- Apply color settings across a page or entire campaign easily
Possible stretch goal(s)
- implementation of lockpicking
- Hidden doors
*/
    const defaults = {
        css: {
            button: {
                'border': '0px',
                'border-radius':'1em',
                'background-color': '#006dcc',
                'margin': '0 .1em',
                'font-weight': 'bold',
                'padding': '0.1em .5em',
                'color': 'white'
            }
        }
    },
    templates = {},
    polyArrays = {},
    
    ch = function (c) {
        var entities = {
            '<' : 'lt',
            '>' : 'gt',
            "'" : '#39',
    		'@' : '#64',
			'{' : '#123',
			'|' : '#124',
			'}' : '#125',
			'[' : '#91',
			']' : '#93',
			'"' : 'quot',
			'-' : 'mdash',
			' ' : 'nbsp'
		};

		if(_.has(entities,c) ){
			return ('&'+entities[c]+';');
		}
		return '';
	},
	
	cleanImgSrc = function(img){
        var parts = img.match(/(.*\/images\/.*)(thumb|med|original|max)(.*)$/);
        if(parts) {
            return parts[1]+'thumb'+parts[3];
        }
        return;
    },
	
	esRE = function (s) {
        var escapeForRegexp = /(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g;
        return s.replace(escapeForRegexp,"\\$1");
    },

    HE = (function(){
        var entities={
            //' ' : '&'+'nbsp'+';',
            '&' : '&'+'amp'+';',
            '<' : '&'+'lt'+';',
            '>' : '&'+'gt'+';',
            "'" : '&'+'#39'+';',
            '@' : '&'+'#64'+';',
            //'{' : '&'+'#123'+';',
            '|' : '&'+'#124'+';',
            '}' : '&'+'#125'+';',
            ',' : '&'+'#44'+';',
            '[' : '&'+'#91'+';',
            ']' : '&'+'#93'+';',
            '"' : '&'+'quot'+';',
            ':' : '&'+'#58'+';',
            //'-' : '&'+'mdash'+';'
        },
        re=new RegExp('('+_.map(_.keys(entities),esRE).join('|')+')','g');
        return function(s){
            return s.replace(re, function(c){ return entities[c] || c; });
        };
    }()),
    
    sendError = function(err){
        var stackMatch = err.stack.match(/apiscript\.js:\d+/g);
        _.each(stackMatch,(s)=>{
            let sMatch = s.match(/\d+/)[0]*1;
            err.stack = err.stack.replace(new RegExp('apiscript\.js:'+sMatch),'apiscript.js:'+(sMatch-scriptStart+ 1));
        });
        var stackToSend = err.stack ? (err.stack.match(/([^\n]+\n[^\n]+)/) ? err.stack.match(/([^\n]+\n[^\n]+)/)[1].replace(/\n/g,'<br>') : 'Unable to parse error') : 'Unable to parse error';
        sendChat('Door Knocker Error Handling','/w gm <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'//overall div for nice formatting of control panel
            +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'//Control Panel Header div
            +'Door Knocker v'+version+'<b> Error Handling</b></div>'
            +'<div style="border-top: 1px solid #000000; border-radius: .2em; background-color: white;">'
            +'The following error occurred:<br><pre><div style="color:red"><b>'+err.message+'<br>'+stackToSend+'</b></div></pre>Please post this error report to the <b><u>[Script forum thread](https://app.roll20.net/forum/post/7698809/script-door-knocker/?pageforid=7698809#post-7698809)</u></b>.'
            +'</div>'
            +'</div>');
    },
    
    checkInstall = function() {
        try{
            log(`-=> DoorKnocker v${version} <=-  [${(new Date(lastUpdate*1000))}]`);
            if( ! _.has(state,'DoorKnocker') || state.DoorKnocker.version !== version) {
                state.DoorKnocker=state.DoorKnocker || {
                    wallColor:'#0000ff',
                    doorColor:'#ff9900',
                    auraDisplay:true
                };
                if(state.DoorKnocker.version){
                    log(`  > Door Knocker: Updating to v${version} <`);
                    if(state.DoorKnocker.help && state.DoorKnocker.version < 1.01){
                        let character = getObj('character',state.DoorKnocker.help);
                        if(character){
                            character.set({avatar:cleanImgSrc(defaultTokenImage)});
                        }
                    }
                }
                state.DoorKnocker.version = version;
    		}
            buildTemplates();
    		updateHelp();
    		helpLink = `https://journal.roll20.net/character/${state.DoorKnocker.help}`;
        }catch(err){
            sendError(err);
        }
    },
    
    /*Builds templates for use in all other functions*/
    buildTemplates = function() {
        templates.cssProperty =_.template(
            '<%=name %>: <%=value %>;'
        );
        
        templates.style = _.template(
            'style="<%='+
                '_.map(css,function(v,k) {'+
                    'return templates.cssProperty({'+
                        'defaults: defaults,'+
                        'templates: templates,'+
                        'name:k,'+
                        'value:v'+
                    '});'+
                '}).join("")'+
            ' %>"'
        );
          
        templates.button = _.template(
            '<a title="<%=title %>"<%= templates.style({'+
                'defaults: defaults,'+
                'templates: templates,'+
                'css: _.defaults(css,defaults.css.button)'+
                '}) %> href="<%= command %>"><%= label||"Button" %></a>'
        );
    },
    
    /*Makes the API buttons used throughout the script*/
    makeButton = function(command, label, backgroundColor, color,title,font){
        let obj = {
            title:title,
            command: command,
            label: label,
            templates: templates,
            defaults: defaults,
            css: {
                color: color,
                'background-color': backgroundColor,
                'font-family':font
            }
        };
        return templates.button(obj);
    },
    
    hexToRgb = hex => {
        // turn hex val to RGB
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result
            ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16)
              }
            : null
    },
    
    // calc to work out if it will match on black or white better
    setContrast = rgb => (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 > 125 ? 'black' : 'white',
    
    //Updates the help UI to reflect changes in settings and new menu templates
    updateHelp = function(playerid,selection,cmd){
        if(!cmd){
            updateHelpCharacterProperties();
        }
        const cmdSwitch = {},
            leftColumnCSS = `"display:inline-block;width:45%;padding-right:5px;border-right:1px solid black;"`,
            rightColumnCSS = `"display:inline-block;width:45%;padding-left:5px;border-left:1px solid black;"`,
            thCSS = `border:0px;text-align:center;padding:4px 0px;`,
            tableCSS = `border:0px;`,
            outertdCSS = `border:0px; width:50%;padding:0em 0em 0em 1em;`,
            selectedCSS = `background-color:#dee0e2;`,
            helpText ={
                home:`
                    <p>
                        Welcome to Door Knocker. This script helps quickly open and close doors by controlling the dynamic lighting lines.
                    </p>
                    <h3>Using Door Knocker</h3>
                    <p>
                        The script will move dynamic lighting lines used as doors to the map layer and make them transparent, opening the door. It determines 
                        what is a door and a wall based on the stroke color of the polygon and will only open doors within 1 square (default 70px) of the door knocker 
                        token.
                    </p>
                    <h3>Basic Command Syntax</h3>
                    <p>
                        The script uses a standardized API command syntax. All Door Knocker commands will begin with <b>!knock</b>. This will then be followed by
                        a space a double dash preceding a keyword and options group. This looks like this:
                    </p>
                    <p>
                        <b>!knock --keyWord|option1|option2|...</b>
                    </p>
                    <h3>Opening and Closing Doors</h3>
                    <p>
                        Open and close using the <b>key</b> keyword followed by an option to tell the script whether to open doors, close doors, or toggle doors. 
                        You can also pass an optional second option to tell the script to open/close/toggle all doors within range of the knocker token. These commands 
                        look like:
                    </p>
                    <p>
                        <b>!knock --key|open/close/toggle|all/page/campaign</b>
                    </p>
                    <ul>
                        <li><b>key:</b> This is the keyword that tells the script to manipulate door dynamic lighting lines</li>
                        <li><b>open/close/toggle:</b> This option tells the script to open, close, or toggle (open closed doors and close open doors) the closest door (or all doors if also using the all option)</li>
                        <li><b>all/page/campaign:</b> <i>Optional argument</i> This option tells the script to operate on all doors within range, all doors on a page, or all doors in the campaign.</li>
                    </ul>
                    <h3>Setting up the Door Knocker</h3>
                    <p>
                        Set the wall, door, and locked door stroke colors in the settings menu using hex color codes (e.g. #000000). You can also set these values 
                        by selecting an already created DL line. The command syntax for using a selected DL line looks like:
                    </p>
                    <p>
                        <b>!knock --preset|wall/door|hex color</b>
                    </p>
                    <ul>
                        <li><b>preset:</b> This is the keyword that tells the script to change it's settings</li>
                        <li><b>wall/door:</b> This option tells the script to update the color setting for walls or for doors</li>
                        <li><b>hex color:</b> <i>Optional argument</i> Passing a hex color here will set the script to consider all polygons on the Dynamic Lighting layer with a stroke of 
                        this color to be doors/walls. If this option is not passed the script will look for a selected polygon to pull a stroke color from.</li>
                    </ul>
                    <h3>Setting up your maps</h3>
                    <p>
                        The only map setup needed is to ensure your dynamic lighting doors are the appropriate color. If you are adapting a module or add-on
                        to an already existing door color scheme you can select a door line and run the following chat command:
                    </p>
                    <p>
                        <b>!knock --adapt|door/wall|campaign</b>
                    </p>
                    <ul>
                        <li><b>adapt:</b> This is the keyword that tells the script to update all polygons on the dynamic lighting layer with the same stroke color 
                        as the selected polygon(s) to have the script's door/wall stroke color</li>
                        <li><b>wall/door:</b> This option tells the script to update the stroke color to that of walls or doors</li>
                        <li><b>campaign:</b> <i>Optional argument</i> adding this optional argument tells the script to update polygons on all pages, not just the current page.</li>
                    </ul>
                    <h3>Customizing the Script</h3>
                    <h4>Door knocker token</h4>
                    <p>
                        The script uses a generic key token as the door knocker token. You can customize this by changing the default token of this character.
                    </p>
                    <h4>Script created abilities</h4>
                    <p>
                        The script also creates three abilities on this character as token actions. These can be disabled as token actions, but should not be deleted as 
                        the script will simply remake them. You can also add whatever other macros you want to this character.
                    </p>
                    <h4>Aura signalling nearby doors</h4>
                    <p>
                        By default the script will create two auras around the door knocker token when a door is with in range. Aura 1 will display the range to the 
                        closest door while aura 2 will display the range to the furthest door. You can customize what color these auras are by changing the aura color 
                        in the token's settings. The feature can be turned off (or back on) from the settings page of this help menu.
                    </p>`,
                    settings:`<div>
                        <h3>Script Configurations</h3>
                            <h4><br>Interface Options:</h4>
                            <b>Display aura when door in range:</b>${makeButton(`!knock --aura|${state.DoorKnocker.auraDisplay ? 'off':'on'}`,state.DoorKnocker.auraDisplay ? 'enabled':'disabled',state.DoorKnocker.auraDisplay ? 'green':'black','white','Toggle on/off display of an aura when a door is in range')}<br>
                            <h4><br><br>Color Relationships:</h4>
                            <b>Walls:</b>${makeButton(`!knock --preset|wall|?{What Color are your Walls|#ff9900}`,state.DoorKnocker.wallColor,state.DoorKnocker.wallColor,setContrast(hexToRgb(state.DoorKnocker.wallColor)),'Enter the hex color of your dynamic lighting walls')}<br>
                            <b>Doors:</b>${makeButton(`!knock --preset|door|?{What Color are your Doors|#ff9900}`,state.DoorKnocker.doorColor,state.DoorKnocker.doorColor,setContrast(hexToRgb(state.DoorKnocker.doorColor)),'Enter the hex color of your dynamic lighting doors')}<br>
                            </div>`
            },
            coloring={
                'false':['white','black'],
                'true':['black','white']
            };
        if(!cmd){
            cmd = state.DoorKnocker.cmd || 'home';
        }
        let menuInserts = '',
            configInserts = '',
            navigation =
                `${makeButton(`!knock --menu|home`,'Instructions',...coloring[`${cmd==='home'}`],'Learn how to use the script')}`+
                `${makeButton(`!knock --menu|settings`,'Settings',...coloring[`${cmd!=='home'}`],'Configure the script')}`;
        
        //set handout control
        let newBio = `<h1>Door Knocker v${version}</h1>${navigation}<hr>${helpText[cmd].replace(/>\n\s+/g,'>')}`;
        state.DoorKnocker.cmd = cmd;
        helpCharacter.set({bio:newBio});
    },
    
    updateHelpCharacterProperties = function(){
        if(!state.DoorKnocker.help || !getObj('character',state.DoorKnocker.help)){
            if(findObjs({type:'character',name:'DoorKnocker'})[0]){
                helpCharacter = findObjs({type:'character',name:'DoorKnocker UI'})[0];
                state.DoorKnocker.help = helpCharacter.id;
            }else{
                helpCharacter = createObj('character',{
                    name:'DoorKnocker UI'
                });
                state.DoorKnocker.help = helpCharacter.id;
            }
            helpCharacter.set({avatar:cleanImgSrc(defaultTokenImage)});
        }else{
            helpCharacter = getObj('character',state.DoorKnocker.help);
        }
        let abilities = findObjs({type:'ability',characterid:state.DoorKnocker.help});
        let expectedAbilities = {
                open:false,
                close:false,
                toggle:false
            },
            abilityTemplates = {
                open:{
                    name:'Open Doors',
                    description:'Door Knocker Ability:open',
                    characterid:state.DoorKnocker.help,
                    action:'!knock --key|open',
                    istokenaction:true
                },
                close:{
                    name:'Close Doors',
                    description:'Door Knocker Ability:close',
                    characterid:state.DoorKnocker.help,
                    action:'!knock --key|close',
                    istokenaction:true
                },
                toggle:{
                    name:'Toggle Doors',
                    description:'Door Knocker Ability:toggle',
                    characterid:state.DoorKnocker.help,
                    action:'!knock --key|toggle',
                    istokenaction:true
                }
            };
        _.each(abilities,(abi)=>{
            abi.get('description').replace(/^Door Knocker Ability:(.+)/,(match,keyword)=>{
                expectedAbilities[keyword]=true;
            });
        });
        _.each(_.keys(expectedAbilities),(key)=>{
            if(!expectedAbilities[key]){
                createObj('ability',abilityTemplates[key]);
            }
        })
        helpCharacter.get('defaulttoken',(token)=>{
            if(!token || token==='null'){
                let newToken = createObj('graphic',{
                    _pageid:Campaign().get('playerpageid'),
                    imgsrc:cleanImgSrc(defaultTokenImage),
                    name:'Door Knocker',
                    represents:helpCharacter.id,
                    top:0,
                    left:0,
                    width:70,
                    height:70,
                    isdrawing:true,
                    layer:'walls'
                });
                setDefaultTokenForCharacter(helpCharacter,newToken);
                newToken.remove();
            }
        });
    },
    
    adaptPolygons = function(playerid,selection,type,all){
        if(!selection || !type){
            return;
        }
        const colorsToFind = [];
        let currentPage,
            searchObj = {
                type:'path',
                layer:'walls'
            };
        _.each(selection,(sel)=>{
            if(sel._type==='path'){
                let poly = getObj('path',sel._id);
                colorsToFind.push(poly.get('stroke'));
                currentPage = poly.get('pageid');
            }
        });
        if(!all){
            searchObj.pageid = currentPage;
        }
        _.chain(colorsToFind)
            .map((color)=>{
                searchObj.stroke = color;
                return findObjs(searchObj);
            })
            .flatten()
            .each((path)=>{
                path.set({stroke:state.DoorKnocker[`${type}Color`]});
            });
    },
    
    keyTurn = function(playerid,selection,cmd,all){
        let page,
            allow = false,
            tokens = _.reduce(selection,(memo,sel)=>{
                if(sel._type === 'graphic'){
                    let tok = getObj(sel._type,sel._id);
                    if(tok.get('represents') === state.DoorKnocker.help){
                        page = tok.get('pageid');
                        memo.push(tok);
                        allow=true;
                    }
                }
                return memo;
            },[]);
        if(!allow){
            return;
        }
        page = getObj('page',page);
        let rawDoors = {type:'path'};
        if(all!=='campaign'){
            rawDoors.pageid=page.id;
        }
        if(cmd === 'open'){
            rawDoors = findObjs(_.defaults(rawDoors,{type:'path',stroke:state.DoorKnocker.doorColor,layer:'walls'}));
        }else if(cmd ==='close'){
            rawDoors = findObjs(_.defaults(rawDoors,{type:'path',stroke:`${state.DoorKnocker.doorColor}00`,layer:'map'}));
        }else if(!cmd||cmd==='toggle'){
            rawDoors = [...findObjs(_.defaults(rawDoors,{type:'path',stroke:state.DoorKnocker.doorColor,layer:'walls'})),
                        ...findObjs(Object.assign(rawDoors,{type:'path',stroke:`${state.DoorKnocker.doorColor}00`,layer:'map'}))];
        }else{
            return;
        }
        const doors = _.reduce(rawDoors,(memo,path)=>{
                memo[path.id]=PathMath.toSegments(path);
                return memo;
            },{});
        _.each(tokens,(token)=>{
            let validDoors;
            if(!all || all === 'all'){
                validDoors = findDoorsInRange(token,doors);
                if(!all){
                    validDoors = _.reduce(_.keys(validDoors),(memo,key)=>{
                        if(_.isEmpty(memo)){
                            memo = [key];
                        }else if(validDoors[key] < validDoors[memo]){
                            memo = [key];
                        }else if(validDoors[key] === validDoors[memo]){
                            memo.push(key);
                        }
                        return memo;
                    },[]);
                }else{
                    validDoors = _.keys(validDoors);
                }
            }else{
                validDoors = _.keys(doors);
            }
            _.each(validDoors,(id)=>{
                let setObj = {},
                    path = getObj('path',id);
                if(cmd === 'open'){
                    setObj.layer = 'map';
                }else if(cmd === 'close'){
                    setObj.layer = 'walls';
                }else{
                    setObj.layer = path.get('layer') === 'walls' ? 'map' : 'walls';
                }
                if(setObj.layer === 'map'){
                    setObj.stroke = `${state.DoorKnocker.doorColor}00`
                }else{
                    setObj.stroke = state.DoorKnocker.doorColor
                }
                path.set(setObj);
            });
        });
    },
    
    findDoorsInRange = function(token,segmentedPaths){
        let page = getObj('page',token.get('pageid'));
        if(!segmentedPaths){
            segmentedPaths = _.reduce(
                [...findObjs({type:'path',pageid:page.id,stroke:state.DoorKnocker.doorColor,layer:'walls'}),
                ...findObjs({type:'path',pageid:page.id,stroke:`${state.DoorKnocker.doorColor}00`,layer:'map'})],
                (memo,path)=>{
                    memo[path.id]=PathMath.toSegments(path);
                    return memo;
                },{});
        }
        return _.reduce(_.keys(segmentedPaths),(memo,key)=>{
            let distance = _.min(_.map(segmentedPaths[key],(seg)=>{
                return VecMath.ptSegDist([token.get('left'),token.get('top'),1],...seg);
            }));
            if(distance <= (token.get('width')*1.5)){
                memo[key] = distance;
            }
            return memo;
        },{});
    },
    
    auraSetting = function(playerid,selection,cmd){
        state.DoorKnocker.auraDisplay = cmd === 'on';
        let doorKnockers = findObjs({type:'graphic',represents:state.DoorKnocker.help});
        
        _.each(doorKnockers,(graphic)=>{
            if(state.DoorKnocker.auraDisplay){
                handleGraphic(graphic);
            }else{
                graphic.set({aura1_square:false,aura2_square:false,aura1_radius:'',aura2_radius:''});
            }
        });
        if(state.DoorKnocker.cmd === 'settings'){
            updateHelp(playerid,selection,state.DoorKnocker.cmd);
        }
    },
    
    handleGraphic = function(obj){
        try{
            if(obj.get('represents')!==state.DoorKnocker.help && state.DoorKnocker.auraDisplay){
                return;
            }
            let doorsInRange = findDoorsInRange(obj),
                setObj = {aura1_square:false,aura2_square:false,aura1_radius:'',aura2_radius:''};
            if(!_.isEmpty(doorsInRange)){
                doorsInRange = _.map(doorsInRange,(range)=>{return range});
                let doorRanges = [_.max([0,_.min(doorsInRange)]),_.min([_.max(doorsInRange),obj.get('width')*1.5])],
                    page = getObj('page',obj.get('pageid'));
                _.each([0,1],(n)=>{
                    setObj[`aura${n + 1}_radius`] = _.max([0,(doorRanges[n]-obj.get('width')/2)/(page.get('snapping_increment')*70)*page.get('scale_number')]);
                });
            }
            obj.set(setObj);
        }catch(err){
            sendError(err);
        }
    },
    
    debouncedGraphic = _.debounce(handleGraphic,100,true),
    
    setPresets = function(playerid,selection,type,color){
        if(!selection && !color){
            return;
        }
        if(state.DoorKnocker[`${type}Color`]){
            if(!color){
                if(selection[0]._type === 'path'){
                    color = getObj('path',selection[0]._id).get('stroke');
                }else{
                    return;
                }
            }
            if(!/#(?:[a-f\d]{2}){3}/.test(color)){
                return;
            }
            state.DoorKnocker[`${type}Color`] = color;
            if(state.DoorKnocker.cmd === 'settings'){
                updateHelp(playerid,selection,state.DoorKnocker.cmd);
            }
        }
    },
    
    //Handles chat input
    //Command Syntax: !DoorKnocker --action,[options]|tracks/lists to affect|tracks/lists to affect|... --action2,[options|tracks/lists to affect|tracks/lists to affect|...
    HandleInput = function(msg_orig) {
        try{
            var msg = _.clone(msg_orig),
                stopOther = true,
                cmdDetails,args,restrict,tracks,
                playlists = [],
                listTracks = [],
                eachTracker,
                tempId,
                actionSwitch = {
                    menu:updateHelp,
                    adapt:adaptPolygons,
                    key:keyTurn,
                    preset:setPresets,
                    aura:auraSetting
                };
                
            if (msg.type !== 'api' || !playerIsGM(msg.playerid) || !/^!knock/.test(msg.content)){
                return;
            }
            args = msg.content.split(/\s+--/);//splits the message contents into discrete arguments
            if(args[1]){
                _.each(_.rest(args,1),(cmd) =>{
                    cmdDetails = cmdExtract(cmd);
                    if(actionSwitch[cmdDetails.action]){
                        actionSwitch[cmdDetails.action](msg.playerid,msg.selected,...cmdDetails.things);
                    }else{
                        sendChat('Door Knocker',`/w "${getObj('player',msg.playerid).get('displayname')}" \`\`[Access the control panel](${helpLink})\`\``,null,{noarchive:true});
                    }
                });
            }else{
                sendChat('Door Knocker',`/w "${getObj('player',msg.playerid).get('displayname')}" \`\`[Access the control panel](${helpLink})\`\``);//,null,{noarchive:true});
            }
        }catch(err){
            sendError(err);
        }
	},
	
	cmdExtract = function(cmd){
        var cmdSep = {
                details:{}
            },
            vars,details;
            
        cmdSep.things = cmd.split('|');
        details = cmdSep.things.shift();
        cmdSep.things=_.map(cmdSep.things,(t)=>{
            return t.trim();
        });
        details = details.split(',');
        cmdSep.action = details.shift();
        _.each(details,(d)=>{
            vars=d.match(/(.*?)(?:\:|=)(.*)/) || null;
            if(vars){
                cmdSep.details[vars[1]]= (vars[1]==='limit'||vars[1]==='ignore') ? vars[2].split(/\s+/) : vars[2];
            }else{
                cmdSep.details[d]=d;
            }
        });
        return cmdSep;
    },
	
    RegisterEventHandlers = function() {
        on('chat:message', HandleInput);
        on('change:graphic:rotation',keyTurn);
        _.each(['left','top'],(position)=>{
            on(`change:graphic:${position}`,debouncedGraphic);
        });
    };
    
    return {
        CheckInstall: checkInstall,
    	RegisterEventHandlers: RegisterEventHandlers
	};
    
}());


on("ready",function(){
    'use strict';
    
    DoorKnocker.CheckInstall();
    DoorKnocker.RegisterEventHandlers();
});