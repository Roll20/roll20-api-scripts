var DoorKnocker = DoorKnocker || (function() {let scriptStart = new Error;//Generates an error to localize the start of the script
    //converts the line number in the error to be line 1
    scriptStart = scriptStart.stack.match(/apiscript\.js:(\d+)/)[1]*1;
    'use strict';
    //Script variables that are updated/changed at some point in the script.
    let helpCharacter,
        helpLink,
        markdown = false,//enables/disables logging of markdown version of the help text. Used for easy updating of the script.json file
        defaultTokenImage = 'https://s3.amazonaws.com/files.d20.io/images/89593533/NjVfN1rZhwh0lbuuYTuQWA/max.png?1566172197',
        transparentTokenImage = 'https://s3.amazonaws.com/files.d20.io/images/4277467/iQYjFOsYC5JsuOPUCI9RGA/thumb.png?1401938659';
        
/*
Door Knocker script:
Author: Scott C.
Contact: https://app.roll20.net/users/459831/scott-c
Thanks to: KeithCurtis for being my guinea pig
state.DoorKnocker format:
state.DoorKnocker = {
    version:#.###,
    wallColor:#000000,
    doorColor:#000000,
    unlockedColor:#000000,
    hiddenColor:#000000
    windowColor:#000000,
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
//Script Constants
    const version = 1.211,
        lastUpdate = 1606175477,
        defaults = {
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
    
    //Functions called from other functions
    //Cleans the image link for use within Roll20 Objects
    cleanImgSrc = function(img){
        var parts = img.match(/(.*\/images\/.*)(thumb|med|original|max)(.*)$/);
        if(parts) {
            return parts[1]+'thumb'+parts[3];
        }
        return;
    },
    //Problem Character replacement
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
    //Error reporting function
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
            if( ! _.has(state,'DoorKnocker')){
                initialInstall();
            }else if(state.DoorKnocker.version !== version){
                if(state.DoorKnocker.version !== version){
                    log(`  > Door Knocker: Updating to v${version} <`);
                    updateScript();
                    log(`  > Door Knocker: Update Complete <`);
                    state.DoorKnocker.version = version;
                }
            }
            buildTemplates();
            updateHelp();
            helpLink = `https://journal.roll20.net/character/${state.DoorKnocker.help}`;
        }catch(err){
            sendError(err);
        }
    },
    
    //Begin update functions
    updateScript = function(){
        if(state.DoorKnocker.help && state.DoorKnocker.version < 1.01){
            updateTo1x01();
        }
        if(state.DoorKnocker.version < 1.03){
            updateTo1x03();
        }
        if(state.DoorKnocker.version < 1.14){
            updateTo1x14();
        }
        if(state.DoorKnocker.version < 1.17){
            updateTo1x17();
        }
        if(state.DoorKnocker.version < 1.20){
            updateTo1x20();
        }
    },
    
    updateTo1x20 = function(){
        state.DoorKnocker.windowColor = '#00ffff';
        log(`  > Door Knocker: Updated to v1.20 <`);
    },

    updateTo1x17 = function(){
        state.DoorKnocker.searchTime = 2;
        _.each(state.DoorKnocker.pairs,(id)=>{
            getObj('graphic',id).remove();
        });
        _.each(findObjs({type:'graphic',represents:state.DoorKnocker.help}),(graphic)=>{
            graphic.set({aura1_radius:'',aura2_radius:''});
        })
        log(`  > Door Knocker: Updated to v1.17 <`);
    },
    
    updateTo1x14 = function(){
        state.DoorKnocker.hiddenColor = state.DoorKnocker.hiddenColor || '#000000';
        _.each(state.DoorKnocker.pairs,(id)=>{
            let tok = getObj('graphic',id);
            tok.set({layer:'objects'});
            toBack(tok);
        });
        log(`  > Door Knocker: Updated to v1.14 <`);
    },
    
    updateTo1x03 = function(){
        Object.assign(state.DoorKnocker,{
            unlockedColor:'#00ff00',
            closeAura:'#00ff00',
            farAura:'#000000',
            pairs:{}
        });
        log(`  > Door Knocker: Updated to v1.03 <`);
    },
    
    updateTo1x01 = function(){
        let character = getObj('character',state.DoorKnocker.help);
        if(character){
            character.set({avatar:cleanImgSrc(defaultTokenImage)});
        }
        log(`  > Door Knocker: Updated to v1.01 <`);
    },
    
    initialInstall = function(){
        state.DoorKnocker=state.DoorKnocker||{
            wallColor:'#0000ff',
            hiddenColor:'#000000',
            doorColor:'#ff9900',
            auraDisplay:true,
            unlockedColor:'#00ff00',
            searchTime:2,
            windowColor:'#00ffff',
        };
        log(`  > Door Knocker: v${version} initial install complete <`);
    },
    //End Update functions
    
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
    //convert hex color to rgb for calculations
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
    
    updateHelpCharacterProperties = function(){
        helpCharacter = findObjs({type:'character',name:'DoorKnocker'})[0];
        if(!state.DoorKnocker.help || !getObj('character',state.DoorKnocker.help)){
            if(helpCharacter){
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
                toggle:false,
                pushOpen:false,
                pushClosed:false,
                pushToggle:false
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
                },
                pushOpen:{
                    name:'Open Unlocked Doors',
                    description:'Door Knocker Ability:pushOpen',
                    characterid:state.DoorKnocker.help,
                    action:'!knock --push|open',
                    istokenaction:true
                },
                pushClosed:{
                    name:'Close Unlocked Doors',
                    description:'Door Knocker Ability:pushClosed',
                    characterid:state.DoorKnocker.help,
                    action:'!knock --push|close',
                    istokenaction:true
                },
                pushToggle:{
                    name:'Toggle Unlocked Doors',
                    description:'Door Knocker Ability:pushToggle',
                    characterid:state.DoorKnocker.help,
                    action:'!knock --push|toggle',
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

    //Finds doors that are within range of a token. Only finds hidden doors if the token is not controlled by a player or if it is the door knocker token.
    //Also takes custom segmentedPaths to check
    findDoorsInDynamicRange = function(token,segmentedPaths,range){
        let tokenPoint = [token.get('left'),token.get('top'),1],
            findHidden = false,
            character = token.get('represents') !== '' ? getObj(token.get('represents')) : undefined,
            page = getObj('page',token.get('pageid')),
            scale = page ? page.get('scale_number') : 5,
            increment = page ? page.get('snapping_increment') : 1;
        let argObj ={
            token:token,
            segmentedPaths:segmentedPaths,
            range:range
        };

        range = ((range || scale)/scale)*increment*70 + token.get('width')/2;
        if(!segmentedPaths){
            if(token.get('represents')===state.DoorKnocker.help || (token.get('controlledby')==='' && (!character || character.get('controlledby')===''))){
                findHidden = true;
            }
            segmentedPaths = getSegmentedPaths(token,findHidden);
        }
        return _.reduce(_.keys(segmentedPaths),(memo,key)=>{
            let closestSeg = segmentedPaths[key].reduce((details,seg)=>{
                let distance = VecMath.ptSegDist([token.get('left'),token.get('top'),1],...seg);
                if(distance <= range){
                    if(details === null || distance < details){
                        details = distance;
                    }
                }
                return details;
            },null);
            if(closestSeg!==null){
                memo[key] = closestSeg;
            }
            return memo;
        },{});
    },

    getSegmentedPaths = function(token,findHidden){
        let page = getObj('page',token.get('pageid'));
        let objArray = [];
        ['door','unlocked','window'].forEach((type)=>{
            objArray = [...objArray,
            ...findObjs({type:'path',pageid:page.id,stroke:state.DoorKnocker[`${type}Color`],layer:'walls'}),
            ...findObjs({type:'path',pageid:page.id,stroke:`${state.DoorKnocker[`${type}Color`]}00`,layer:'map'})];
        });
        if(findHidden){
            objArray = [...objArray,
                ...findObjs({type:'path',pageid:page.id,stroke:`${state.DoorKnocker.hiddenColor||'#000000'}`,layer:'walls'}),
                ...findObjs({type:'path',pageid:page.id,stroke:`${state.DoorKnocker.hiddenColor||'#000000'}00`,layer:'map'})];
        }
        return _.reduce(objArray,(memo,path)=>{
            memo[path.id]=PathMath.toSegments(path);
            return memo;
        },{});
    },
    
    updateDoorColors = function(playerid,selection,type,enteredColor){
        let color;
        if(state.DoorKnocker[`${type}Color`]){
            if(!enteredColor){
                if(selection[0]._type === 'path'){
                    enteredColor = getObj('path',selection[0]._id).get('stroke');
                }else{
                    return;
                }
            }
            enteredColor.replace(/(#[a-f\d]{6}).*/,(match,hex)=>{
                color = hex;
            });
            if(!color || !/#(?:[a-f\d]{2}){3}$/.test(color)){
                return;
            }
            let existingDoors = [...findObjs({type:'path',stroke:color,layer:'walls'}),...findObjs({type:'path',stroke:`${color}00`,layer:'map'})],
                previousDoors = [...findObjs({type:'path',stroke:state.DoorKnocker[`${type}Color`],layer:'walls'}),...findObjs({type:'path',stroke:`${state.DoorKnocker[`${type}Color`]}00`,layer:'map'})],
                oldVectorTransform = 'M',
                newVectorTransform = 'L';
            if(type==='window'){
                oldVectorTransform = 'L';
                newVectorTransform = 'M';
            }
            existingDoors.forEach((door)=>{
                if(new RegExp(`,\\["${oldVectorTransform}"`).test(door.get('path'))){
                    let template = templatePath(door);
                    template._path = oldVectorTransform === 'M' ? toOpaquePath(template._path) : toTransparentPath(template._path);
                    door.remove();
                    createObj('path',template);
                }
            });
            if(type === 'window'){
                previousDoors.forEach((door)=>{
                    if(new RegExp(`,\\["${newVectorTransform}"`).test(door.get('path'))){
                        let template = templatePath(door);
                        template._path = toOpaquePath(template._path);
                        createObj('path',template);
                    }
                });
            }
            state.DoorKnocker[`${type}Color`] = color;
            if(state.DoorKnocker.cmd === 'settings'){
                updateHelp(playerid,selection,state.DoorKnocker.cmd);
            }
        }
    },

    updateSearchTime = function(playerid,selection,time){
        if(time*1){
            state.DoorKnocker.searchTime = time;
            if(state.DoorKnocker.cmd ==='settings'){
                updateHelp(playerid,selection,state.DoorKnocker.cmd);
            }
        }
    },
    
    //functions called from HandleInput
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
                        Welcome to Door Knocker. This script helps quickly open and close doors by controlling the dynamic lighting lines. If you 
                        have any questions, comments, or find a bug; please drop by the <a href="https://app.roll20.net/forum/post/7698809/script-door-knocker">Door Knocker forum thread</a>.
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
                        Open and close using the <b>key</b> or <b>push</b> keyword followed by an option to tell the script whether to open doors, close doors, or toggle doors. 
                        You can also pass an optional second option to tell the script to open/close/toggle all doors within range of the knocker token, on the page, or in the campaign. These commands 
                        look like:
                    </p>
                    <p>
                        <h4>Affecting obvious doors</h4>
                        <b>!knock --key/push|open/close/toggle|all/page/campaign/range</b>
                    </p>
                    <p>
                        <h4>Affecting hidden doors</h4>
                        <b>!knock --key|reveal/hide/togglehide|all/page/campaign/range</b>
                    </p>
                    <p>
                        <h4>Affecting obvious and/or hidden doors</h4>
                        <b>!knock --key|anydooropen/anydoorclose/anydoortoggle|all/page/campaign/range</b>
                    </p>
                    <p>
                        <h4>Affecting Windows</h4>
                        <b>!knock --key|openwindow/closewindow/togglewindow|all/page/campaign/range</b>
                    </p>
                    <p>
                        <h4>Affecting any doors and/or windows</h4>
                        <b>!knock --key|anyopen/anyclose/anytoggle|all/page/campaign/range</b>
                    </p>
                    <ul>
                        <li><b>key/push:</b> This is the keyword that tells the script to manipulate door dynamic lighting lines. The <b>key</b> keyword operates on both locked 
                        and unlocked doors and is GM only. The <b>push</b> keyword only operates on unlocked doors.</li>
                        <li><b>open/close/toggle</b> This option tells the script to open, close, or toggle (open closed doors and close open doors) the 
                        closest door (or all doors if also using the all option described below).</li>
                        <li><b>reveal/hide/togglehide</b> This option tells the script to open, close, or toggle the 
                        closest hidden door (or all doors if also using the all option described below).</li>
                        <li><b>anydooropen/anydoorclose/anydoortoggle</b> This option tells the script to open, close, or toggle the 
                        closest obvious or hidden door (or all doors if also using the all option described below).</li>
                        <li><b>openwindow/closewindow/togglewindow</b> This option tells the script to open, close, or toggle the 
                        closest window (or all windows if also using the all option described below).</li>
                        <li><b>anyopen/anyclose/anytoggle</b> This option tells the script to open, close, or toggle the 
                        closest obvious door, hidden door, or window (or everything in range if also using the all option described below).</li>
                        <li><b>all/page/campaign:</b> <i>Optional argument</i> This option tells the script to operate on all doors within range, all doors on a page, or all doors 
                        in the campaign. The <b>page</b> and <b>campaign</b> keywords are GM only and do not work with the <b>push</b> keyword. Range and the all/page/campaign keywords can be entered in any order relative to each other.</li>
                        <li><b>range:</b> <i>Optional argument</i> This option tells the script to operate at a custom range, entered in the units of the map (e.g. ft, meters, kilometers). Range and the all/page/campaign keywords can be entered in any order relative to each other.</li>
                    </ul>
                    <h3>Setting up the Door Knocker</h3>
                    <p>
                        Set the wall, door, and locked door stroke colors in the settings menu using hex color codes (e.g. #000000). You can also set these values 
                        by selecting an already created DL line. This functionality is only accessible to the GM. The command syntax for using a selected DL line looks like:
                    </p>
                    <p>
                        <b>!knock --preset|wall/door/unlocked/hidden/window|hex color</b>
                    </p>
                    <ul>
                        <li><b>preset:</b> This is the keyword that tells the script to change it's settings</li>
                        <li><b>wall/door/unlocked/window:</b> This option tells the script to update the color setting for walls, doors, unlocked doors, and windows</li>
                        <li><b>hex color:</b> <i>Optional argument</i> Passing a hex color here will set the script to consider all polygons on the Dynamic Lighting layer with a stroke of 
                        this color to be doors/walls. If this option is not passed the script will look for a selected polygon to pull a stroke color from.</li>
                    </ul>
                    <h3>Setting up your maps</h3>
                    <p>
                        The only map setup needed is to ensure your dynamic lighting doors are the appropriate color.  This functionality is only accessible to the GM. If you are adapting a module or add-on
                        to an already existing door color scheme you can select a door line and run the following chat command:
                    </p>
                    <p>
                        <b>!knock --adapt|door/wall/unlocked/hidden/window|campaign</b>
                    </p>
                    <ul>
                        <li><b>adapt:</b> This is the keyword that tells the script to update all polygons on the dynamic lighting layer with the same stroke color 
                        as the selected polygon(s) to have the script's door/wall stroke color</li>
                        <li><b>wall/door/unlocked:</b> This option tells the script to update the stroke color to that of walls, doors, or unlocked doors</li>
                        <li><b>campaign:</b> <i>Optional argument</i> adding this optional argument tells the script to update polygons on all pages, not just the current page.</li>
                    </ul>
                    <h3>Searching for Doors</h3>
                    <p>
                        When you search for doors using Door Knocker, it will copy door lines to a visible layer. If a gm initiates the search hidden doors are copied and all door lines are shown on the gm layer.
                        If a player initates the search, hidden doors are not displayed and the door lines are shown on the objects layer. How long door lines are visible for (in seconds) can be set from the settings page.
                    </p>
                    <p>
                        <b>!knock --search|range</b>
                    </p>
                    <ul>
                        <li><b>search:</b> This is the keyword that tells the script to display any nearby doors</li>
                        <li><b>range:</b> <i>Optional argument</i> Enter the search range, in the units of the map (e.g. feet, meters, kilometers). If you do not provide a range, it will default to the distance of a square on the map.</li>
                    </ul>
                    <p>
                        Note that searching does not currently reveal windows due to how the window paths are encoded. This functionality is being worked on.
                    </p>
                    <h3>Customizing the Script</h3>
                    <h4>Door knocker token</h4>
                    <p>
                        The script uses a generic key token as the door knocker token. You can customize this by changing the default token of this character. You also can run the script's commands from any selected token.
                    </p>
                    <h4>Script created abilities</h4>
                    <p>
                        The script also creates six abilities on this character as token actions. These can be disabled as token actions, but should not be deleted as 
                        the script will simply remake them. You can also add whatever other macros you want to this character.
                    </p>
                    <h3>Attributions</h3>
                    <p>
                        The default token image is from <a href="https://game-icons.net/">https://game-icons.net/</a> under the <a href="https://creativecommons.org/licenses/by/3.0/#">creative commons license</a>. Thanks to Keith Curtis for finding this awesome token.
                    </p>`,
                    settings:`<div>
                        <h3>Script Configurations</h3>
                            <h4><br>Interface Options:</h4>
                            <b>Display found doors for:</b>${makeButton(`!knock --preset|searchTime|?{Search time in seconds|${state.DoorKnocker.searchTime}}`,`${state.DoorKnocker.searchTime}s`,'black','white','Set how long doors are shown for when searching')}<br>
                            <h4><br><br>Color Relationships:</h4>
                            <b>Walls:</b>${makeButton(`!knock --preset|wall|?{What Color are your Walls|${state.DoorKnocker.wallColor}}`,state.DoorKnocker.wallColor,state.DoorKnocker.wallColor,setContrast(hexToRgb(state.DoorKnocker.wallColor)),'Enter the hex color of your dynamic lighting walls')}<br>
                            <b>Hidden Doors:</b>${makeButton(`!knock --preset|hidden|?{What Color are your Walls|${state.DoorKnocker.hiddenColor||'#000000'}}`,(state.DoorKnocker.hiddenColor||'#000000'),(state.DoorKnocker.hiddenColor||'#000000'),setContrast(hexToRgb((state.DoorKnocker.hiddenColor||'#000000'))),'Enter the hex color of your hidden doors')}<br>
                            <b>Locked Doors:</b>${makeButton(`!knock --preset|door|?{What Color are your Doors|${state.DoorKnocker.doorColor}}`,state.DoorKnocker.doorColor,state.DoorKnocker.doorColor,setContrast(hexToRgb(state.DoorKnocker.doorColor)),'Enter the hex color of your locked doors')}<br>
                            <b>Unlocked Doors:</b>${makeButton(`!knock --preset|unlocked|?{What Color are your unlocked Doors|${state.DoorKnocker.unlockedColor}}`,state.DoorKnocker.unlockedColor,state.DoorKnocker.unlockedColor,setContrast(hexToRgb(state.DoorKnocker.unlockedColor)),'Enter the hex color of your unlocked doors')}<br>
                            <br>
                            <h4>UDL Color Relationships</h4>
                            <b>Windows:</b>${makeButton(`!knock --preset|window|?{What Color are your windows|${state.DoorKnocker.windowColor}}`,state.DoorKnocker.windowColor,state.DoorKnocker.windowColor,setContrast(hexToRgb(state.DoorKnocker.windowColor)),'Enter the hex color of your windows')}<br>
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
                `${makeButton(`!knock --menu|home`,'Instructions',...coloring[`${/home/i.test(cmd)}`],'Learn how to use the script')}`+
                `${makeButton(`!knock --menu|settings`,'Settings',...coloring[`${!/home/i.test(cmd)}`],'Configure the script')}`;
        
        //set handout control
        let newBio = `<h1>Door Knocker v${version}</h1>${navigation}<hr>${helpText[cmd].replace(/>\n\s+/g,'>')}`;
        state.DoorKnocker.cmd = cmd;
        helpCharacter.set({bio:newBio});
        if(markdown){
            let markdownHelp = `<h1>Door Knocker v${version}</h1><hr>${helpText.home}`;
            log(`initial markdown: ${markdownHelp}`);
            markdownHelp = markdownHelp.replace(/\n+\s+|\n+\s+/g,'').replace(/<h(\d)>(.+?)<\/h\d>/g,(match,number,header)=>{
                return `${_.reduce(_.range(number*1),(memo,string)=>{
                    return memo+='#'
                },'\r')} ${header}`;
            }).replace(/<p>((?:.|\n)+?)<\/p>/g,'\r$1').replace(/<ul>/g,'').replace(/<\/ul>/g,"\r").replace(/<li>(.+?)<\/li>/g,'\r- $1').replace(/<a href="(.+?)">(.+?)<\/a>/g,"[$2]($1)").replace(/<\/?(i|b)>/g,(match,type)=>{
                let converter = {
                    i:'*',
                    b:'**'
                };
                return converter[type];
            }).replace(/<hr>/g,"\r___").replace(/^\r/,'');
            log(`Final markdown:${markdownHelp}`);
        }
    },
    
    toTransparentPath = (data) => JSON.stringify((typeof data === 'string' ? JSON.parse(data) : data).map(p=>['M',p[1],p[2]])),

    toOpaquePath = function(data){
        data = typeof data === 'string' ? JSON.parse(data) : data;
        return JSON.stringify([data[0],...(data.slice(1).map(p=>['L',p[1],p[2]]))]);
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
                let newPath = templatePath(path);
                newPath.stroke = state.DoorKnocker[`${type}Color`];
                if(/window|breakable/.test(type)){
                    newPath._path = toTransparentPath(newPath._path);
                }else{
                    newPath._path = toOpaquePath(newPath._path);
                }
                path.remove();
                createObj('path',newPath);
            });
    },
    
    pushDoor = function(playerid,selection,cmd,arg1,arg2){
        let page,
            allow = false,
            tokens = _.reduce(selection,(memo,sel)=>{
                if(sel._type === 'graphic'){
                    let tok = getObj(sel._type,sel._id);
                    page = tok.get('pageid');
                    memo.push(tok);
                    allow=true;
                }
                return memo;
            },[]),
            all,range;
        if(/all|page|campaign/.test(arg1)){
            all = arg1;
        }else if(/all|page|campaign/.test(arg2)){
            all = arg2;
        }
        if(/\d/.test(arg1)){
            range = arg1*1;
        }else if(/\d/.test(arg2)){
            range = arg2*1;
        };
        if(!allow){
            return;
        }
        page = getObj('page',page);
        let rawDoors = {type:'path'};
        if(all!=='campaign'){
            rawDoors.pageid=page.id;
        }
        if(/open/i.test(cmd)){
            rawDoors = findObjs(_.defaults(rawDoors,{type:'path',stroke:state.DoorKnocker.unlockedColor,layer:'walls'}));
        }else if(/close/i.test(cmd)){
            rawDoors = findObjs(_.defaults(rawDoors,{type:'path',stroke:`${state.DoorKnocker.unlockedColor}00`,layer:'map'}));
        }else if(!cmd||/toggle/i.test(cmd)){
            rawDoors = [...findObjs(_.defaults(rawDoors,{type:'path',stroke:state.DoorKnocker.unlockedColor,layer:'walls'})),
                        ...findObjs(Object.assign(rawDoors,{type:'path',stroke:`${state.DoorKnocker.unlockedColor}00`,layer:'map'}))];
        }else{
            return;
        }
        const doors = _.reduce(rawDoors,(memo,path)=>{
                memo[path.id]=PathMath.toSegments(path);
                return memo;
            },{});
        _.each(tokens,(token)=>{
            manipulateDoors(token,doors,cmd,all,range);
        });
    },
    
    keyTurn = function(playerid,selection,cmd,arg1,arg2){
        if(!playerIsGM(playerid)){
            return;
        }
        let page,
            allow = false,
            tokens = _.reduce(selection,(memo,sel)=>{
                if(sel._type === 'graphic'){
                    let tok = getObj(sel._type,sel._id);
                    page = tok.get('pageid');
                    memo.push(tok);
                    allow=true;
                }
                return memo;
            },[]),
            all,range;
        if(/all|page|campaign/.test(arg1)){
            all = arg1;
        }else if(/all|page|campaign/.test(arg2)){
            all = arg2;
        }
        if(/\d/.test(arg1)){
            range = arg1*1;
        }else if(/\d/.test(arg2)){
            range = arg2*1;
        };
        if(!allow && !/page|campaign/i.test(all)){
            return;
        }
        page = getObj('page',page);
        let rawObj = {type:'path'},
            rawDoors = [];
        if(all!=='campaign'){
            rawObj.pageid=page.id;
        }
        let doorArray = ['door','unlocked'];
        if(/^open$/i.test(cmd)){
            doorArray.forEach((type)=>{
                rawDoors = [...rawDoors,
                    ...findObjs({type:'path',stroke:state.DoorKnocker[`${type}Color`],layer:'walls'})]
            });
        }else if(/^close$/i.test(cmd)){
            doorArray.forEach((type)=>{
                rawDoors = [...rawDoors,
                    ...findObjs({type:'path',stroke:`${state.DoorKnocker[`${type}Color`]}00`,layer:'map'})]
            });
        }else if(/^toggle$/i.test(cmd)){
            doorArray.forEach((type)=>{
                rawDoors = [...rawDoors,
                    ...findObjs({type:'path',stroke:state.DoorKnocker[`${type}Color`],layer:'walls'}),
                    ...findObjs({type:'path',stroke:`${state.DoorKnocker[`${type}Color`]}00`,layer:'map'})]
            });
        }else if(/openwindow/i.test(cmd)){
            rawDoors = rawDoors = findObjs({type:'path',stroke:`${state.DoorKnocker.windowColor}`,layer:'walls'});
        }else if(/closewindow/i.test(cmd)){
            rawDoors = findObjs({type:'path',stroke:`${state.DoorKnocker.windowColor}00`,layer:'map'});
        }else if(/togglewindow/i.test(cmd)){
            rawDoors = [...findObjs({type:'path',stroke:`${state.DoorKnocker.windowColor}`,layer:'walls'}),
                        ...findObjs({type:'path',stroke:`${state.DoorKnocker.windowColor}00`,layer:'map'})];
        }
        else if(/reveal/i.test(cmd)){
            rawDoors = findObjs({type:'path',stroke:`${state.DoorKnocker.hiddenColor}`,layer:'walls'});
        }else if(/^hide/i.test(cmd)){
            rawDoors = findObjs({type:'path',stroke:`${state.DoorKnocker.hiddenColor}00`,layer:'map'});
        }else if(/togglehide/i.test(cmd)){
            rawDoors = [...findObjs({type:'path',stroke:`${state.DoorKnocker.hiddenColor}`,layer:'walls'}),
                        ...findObjs({type:'path',stroke:`${state.DoorKnocker.hiddenColor}00`,layer:'map'})];
        }else if(/anydoor/i.test(cmd)){
            doorArray.push('hidden')
            if(/open/i.test(cmd)){
                doorArray.forEach((type)=>{
                    rawDoors = [...rawDoors,
                        ...findObjs({type:'path',stroke:state.DoorKnocker[`${type}Color`],layer:'walls'})]
                });
            }else if(/close/i.test(cmd)){
                doorArray.forEach((type)=>{
                    rawDoors = [...rawDoors,
                        ...findObjs({type:'path',stroke:`${state.DoorKnocker[`${type}Color`]}00`,layer:'map'})]
                });
            }else if(/toggle$/i.test(cmd)){
                doorArray.forEach((type)=>{
                    rawDoors = [...rawDoors,
                        ...findObjs({type:'path',stroke:state.DoorKnocker[`${type}Color`],layer:'walls'}),
                        ...findObjs({type:'path',stroke:`${state.DoorKnocker[`${type}Color`]}00`,layer:'map'})]
                });
            }else{
                return;
            }
        }else if(/^any/i.test(cmd)){
            doorArray = [...doorArray,'hidden','window'];
            if(/open/i.test(cmd)){
                doorArray.forEach((type)=>{
                    rawDoors = [...rawDoors,
                        ...findObjs({type:'path',stroke:state.DoorKnocker[`${type}Color`],layer:'walls'})]
                });
            }else if(/close/i.test(cmd)){
                doorArray.forEach((type)=>{
                    rawDoors = [...rawDoors,
                        ...findObjs({type:'path',stroke:`${state.DoorKnocker[`${type}Color`]}00`,layer:'map'})]
                });
            }else if(/toggle$/i.test(cmd)){
                doorArray.forEach((type)=>{
                    rawDoors = [...rawDoors,
                        ...findObjs({type:'path',stroke:state.DoorKnocker[`${type}Color`],layer:'walls'}),
                        ...findObjs({type:'path',stroke:`${state.DoorKnocker[`${type}Color`]}00`,layer:'map'})]
                });
            }else{
                return;
            }
        }else{
            return;
        }
        const doors = _.reduce(rawDoors,(memo,path)=>{
                memo[path.id]=PathMath.toSegments(path);
                return memo;
            },{});
        _.each(tokens,(token)=>{
            manipulateDoors(token,doors,cmd,all,range);
        });
    },
    
    manipulateDoors = function(token,doors,cmd,all,range){
        let validDoors;
        let argObj ={
            token:token,
            doors:doors,
            cmd:cmd,
            all:all,
            range:range
        };
        range = range*1;
        if(!all || all === 'all' || range){
            validDoors = findDoorsInDynamicRange(token,doors,range);
            log('validDoors:');
            log(validDoors);
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
                path = getObj('path',id),
                fill = path.get('fill');
            if(/open/i.test(cmd)){
                setObj.layer = 'map';
                setObj.stroke = `${path.get('stroke')}00`;
                setObj.fill = /#\d.*$/.test(fill) ? `${fill}00` : 'transparent';
            }else if(/close/i.test(cmd)){
                setObj.layer = 'walls';
                setObj.stroke = path.get('stroke').replace(/00$/,'');
                setObj.fill = /#\d.*$/.test(fill) ? fill.replace(/00$/,'') : 'transparent';
            }else{
                setObj.layer = path.get('layer') === 'walls' ? 'map' : 'walls';
                if(setObj.layer === 'map'){
                    setObj.stroke = `${path.get('stroke')}00`;
                    setObj.fill = /#\d.*$/.test(fill) ? `${fill}00` : 'transparent';
                }else{
                    setObj.stroke = path.get('stroke').replace(/00$/,'');
                    setObj.fill = /#\d.*$/.test(fill) ? fill.replace(/00$/,'') : 'transparent';
                }
            }
            path.set(setObj);
        });
    },
    
    setPresets = function(playerid,selection,type,color){
        if((!selection && !color) || !playerIsGM(playerid)){
            return;
        }
        if(/^(?:wall|door|unlocked|hidden|window|breakable)$/.test(type)){
            updateDoorColors(playerid,selection,type,color);
        }else if(/^(?:far|close)aura$/i.test(type) && /#(?:[a-f\d]{2}){3}$/.test(color)){
            updateAuraColors(type.replace(/aura/i,''),color);
        }else if(/searchtime/i.test(type)){
            updateSearchTime(playerid,selection,color);
        }
    },
    
    searchForDoors = function(playerid,selection,radius){
        const graphics = [];
        let slave;
        if(_.every(selection,(sel)=>{
            if(sel._type==='graphic'){
                let temp = getObj('graphic',sel._id);
                if(temp.get('represents')!==state.DoorKnocker.help){
                    graphics.push(temp);
                }
            }
            return sel._type!=='graphic'})
        ){
            return;
        }
        activeSearch(playerid,graphics,radius);
    },
    
    activeSearch = function(playerid,graphics,radius){
        let findHidden = playerIsGM(playerid),
            segmentedPaths = getSegmentedPaths(graphics[0],findHidden),
            page = getObj('page',graphics[0].get('pageid')),
            scale = page ? page.get('scale_number') : 5,
            interArr=[];
        radius = (radius || scale)*1;
        log(`radius:${radius}`);
        
        _.each(graphics,(token)=>{
            let range = radius,
                doorSegs = findDoorsInDynamicRange(token,segmentedPaths,range);
            interArr = [...interArr,..._.keys(doorSegs)];
        });
        interArr = _.unique(interArr);
        let tempPaths = [];
        _.each(interArr,(pathID)=>{
            let oldPath = getObj('path',pathID);
            log(oldPath);
            template = templatePath(oldPath);
            template.layer = playerIsGM(playerid) ? 'gmlayer' : 'objects';
            template.stroke_width = 10;
            template.stroke = template.stroke.replace(/(.{7}).*/,'$1');
            template.fill = template.fill.replace(/(transparent|.{7}).*/i,"$1");
            let path = createObj('path',template);
            tempPaths.push(path);
        });
        setTimeout((arr)=>{
            _.each(arr,(path)=>{
                path.remove();
            });
        },state.DoorKnocker.searchTime*1000,tempPaths);
    },
    
    templatePath = function(path){
        let template = JSON.parse(JSON.stringify(path));
        _.each(['_id','_type'],(prop)=>{
            delete template[prop];
        });
        return template;
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
                    push:pushDoor,
                    preset:setPresets,
                    search:searchForDoors
                };
                
            if (msg.type !== 'api' || !/^!knock/.test(msg.content)){
                return;
            }
            args = msg.content.split(/\s+--/);//splits the message contents into discrete arguments
            if(args[1]){
                _.each(_.rest(args,1),(cmd) =>{
                    cmdDetails = cmdExtract(cmd);
                    if(cmdDetails.action && actionSwitch[cmdDetails.action.toLowerCase()]){
                        actionSwitch[cmdDetails.action.toLowerCase()](msg.playerid,msg.selected,...cmdDetails.things);
                    }else{
                        sendChat('Door Knocker',`/w "${getObj('player',msg.playerid).get('displayname')}" \`\`[Access the control panel](${helpLink})\`\``,null,{noarchive:true});
                    }
                });
            }else{
                let player = getObj('player',msg.playerid);
                let displayName = player.get('displayname');
                let message = `/w "${displayName}" [Access the control panel](${helpLink})`;
                sendChat('Door Knocker',message);//,null,{noarchive:true});
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

    handlePath = function(obj,prev){
        prev = prev||{};
        if(obj.get('layer')!=='walls'){
            return;
        }
        let newPath = templatePath(obj),
            colorRegex = new RegExp(`${state.DoorKnocker.windowColor}|${state.DoorKnocker.breakableColor}`),
            proceed = false;
        if(colorRegex.test(obj.get('stroke')) && /L|C|Q/.test(obj.get('_path'))){
            proceed = true;
            newPath._path = toTransparentPath(newPath._path);
        }else if(prev && colorRegex.test(prev.stroke) && /,\["M"/i.test(obj.get('path'))){
            proceed = true;
            newPath._path = toOpaquePath(newPath._path);
        }
        if(proceed){
            obj.remove();
            let newObj = createObj('path',newPath);
        }
    },
    
    RegisterEventHandlers = function() {
        on('chat:message', HandleInput);
        ['change:path:stroke','change:path:layer','add:path'].forEach((arg)=>{
            on(arg,handlePath);
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