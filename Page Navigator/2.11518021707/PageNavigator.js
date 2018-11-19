/*
    PAGENAVIGATOR script:
    Author: Scott C.
    Contact: https://app.roll20.net/users/459831/scott-c
    Thanks to: The Aaron Arcane Scriptomancer and Stephen for their help with the bulk of this script.
    
    Script goal: to simplify moving between maps in Roll20.
    Ways to have true teleporting (token deleted at origin, and created at arrival)
    -delete all tokens that "represent" moved player's default characters probably best way.
    -token deletion can be toggled on/off
*/
    var PAGENAVIGATOR= PAGENAVIGATOR|| (function(){
        'use strict';
          
        var version = '2.11518021707',
            lastUpdate = 1518021707,
            schemaVersion = 2.11518021707,
            defaults = {
                css: {
                    button: {
                        'border': '1px solid #cccccc',
                        'border-radius': '1em',
                        'background-color': '#006dcc',
                        'margin': '0 .1em',
                        'font-weight': 'bold',
                        'padding': '.1em 1em',
                        'color': 'white'
                    }
                }
            },
            statusColormap = ['#C91010', '#1076c9', '#2fc910', '#c97310', '#9510c9', '#eb75e1', '#e5eb75'],
            templates = {},
            allPages,
            destTokens = {},
            allPlayers,
            tokenNotes = {},
            allFolders = {
                'All':[],
                'Players':[]
            },
            folderAccess={/*folderName:access state*/},
            folderAbility,
            maps = {},
            statusquery = ['name','red','blue','green','brown','purple','pink','yellow','dead','skull','sleepy','half-heart','half-haze','interdiction','snail',
                            'lightning-helix','spanner','chained-heart','chemical-bolt','deathzone','drink-me','edge-crack','ninja-mask','stopwatch','fishing-net',
                            'overdrive','strong','fist','padlock','three-leaves','fluffy-wing','pummeled','tread','arrowed','aura','back-pain','black-flag',
                            'bleeding-eye','bolt-shield','broken-heart','cobweb','broken-shield','flying-flag','radioactive','trophy','broken-skull','frozen-orb',
                            'rolling-bomb','white-tower','grab','screaming','grenade','sentry-gun','all-for-one','angel-outfit','archery-target'],
            
        /*Provides handling of troublesome characters for sendChat*/
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
                ':' : '&'+'#58'+';'
                //'-' : '&'+'mdash'+';'
            },
            re=new RegExp('('+_.map(_.keys(entities),esRE).join('|')+')','g');
            return function(s){
                return s.replace(re, function(c){ return entities[c] || c; });
            };
          }()),
          
        /*Checks the API environment to make sure everything is prepped for the script*/
        checkInstall = function() {
            if(state.PAGENAVIGATOR){
                if(state.PAGENAVIGATOR.version && state.PAGENAVIGATOR.version <= 1.47){
                    if(!state.PAGENAVIGATOR.upgrade){
                        sendChat('Page Navigator','/w gm Page Navigator has been upgraded to version '+schemaVersion+'. This version makes significant '
                        +'changes to how the script functions. Please review the updates at the <b><u>[Page Navigator v2.X Forum Thread](https://app.roll20.net/forum'
                        +'/post/4905683/script-update-page-navigator-v2-dot-x/?pageforid=4905683#post-4905683)</u></b>. If you would like to use the new version of the script, '
                        +'please verify the upgrade below. If you do not wish to upgrade, please go to your campaign API script page and change your '
                        +'selected version for Page Navigator back to the previous verison. No changes have been made yet, and Page Navigator startup '
                        +'was aborted.<br>[Approve](!nav --upgrade)',null,{noarchive:true});
                        return;
                    }
                }
            }
            log('-=> Page Navigator v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
            if( ! _.has(state,'PAGENAVIGATOR') || state.PAGENAVIGATOR.version !== schemaVersion) {
                state.PAGENAVIGATOR = state.PAGENAVIGATOR || {};
                log('  > Updating Schema to v'+schemaVersion+' <');
                state.PAGENAVIGATOR.version = schemaVersion;
            }
            log('  =>Page Navigator Memory: loading Roll20 Objects');
            loadPlayers();
            loadPages();
            generateHelp();
            buildTemplates();
      	},
      	
        generateHelp = function(){
            var notes= '<h2>Page Navigator v'+version+'</h2>'
                        +'<p>Page Navigator allows you to more easily move your players from page to page. Movement can be triggered by chat command or token '
                        +'movement. The script will also handle creation of tokens on the new page for moved players.</p>'
                        +'<h4>Movement Commands & Token Setup</h4>'
                        +'<ul>'
                        +'<li><b>Chat Triggered page change:</b><br>'
                        +'All players, only those currently in the player ribbon, or specific players can be moved to any page in the game, or returned to the player ribbon.<br>'
                        +'The basic syntax for a move command is:<br>!nav --move,page=PAGENAME,landing=LANDINGTEXT|whole/current/characterid|characterid|characterid|...</li>'
                        +'<li><b>Token movement triggered page change:</b><br>'
                        +'Using this function requires that destination tokens be set up. Whenever a token controlled by a player ends its '
                        +'movement on a destination token, a chat prompt is sent to ask if the character should be moved to the page linked to '
                        +'that destination token or not. The prompt is sent to players only if the destination page is contained in a page folder '
                        +'that players have been given unrestricted access to. See the "Other Options" section below for more information about folders.<br>'
                        +"In order to setup a destination token, the token must be named the same as the page to which it links with the exception "
                        +"of any folder names the page has been tagged with.</li>"
                        +'<li><b>Token Teleportation:</b><br>'
                        +'When moving players to a page, the script can create tokens for each player at a destination token. The default '
                        +'characters to create tokens for for each player can be set in the config menu.<br>'
                        +"In order for teleportation to function, destination tokens (from above) must contain a JSON in their GM notes field of the following format:<br>"
                        +'<pre>{<br>    "landingLocation":"Location text of linked token", <=- Optional<br>    "location":"Location text", <=- Optional<br>    "chat":"Chat message/API command to send when moving to this destination token", <=- Optional<br>    "polygon":["Array of polygons limiting token generation"] <=- Only needed if location text is entered<br>}</pre>'
                        +'You can setup destination tokens by using the Destination Token Setup Wizard via the command !nav --setup. You must have a token selected when you enter the command.'
                        +'</ul>'
                        +'<h4>Miscellaeneous Commands and Other Functions</h4>'
                        +'<ul>'
                        +'<li><b>!nav --config</b> Brings up the config menu.</li>'
                        +'<li><b>Folders</b> are designated by tagging pages with whatever folder name you would like enclosed in square brackets '
                        +'(e.g. [FolderName]). Each folder name should be in its own set of square brackets. Any time you reference a page by name '
                        +'for the script, do not incude the folder tags in the name. The script automatically creates two folders, an "All" folder '
                        +'(which pages do not need to be tagged with) and a "Players" folder which can be used to tag pages as with any other folder '
                        +'name. Access restrictions for folders can be set in the config menu. If a page is contained in any folder that has '
                        +'player access, players will be able to send themselves to that page and any destinations therein without GM approval.</li>'
                        +'<li>When teleportation is enabled an additional option will be created in the config menu to automatically remove other tokens for teleporting players before creating new tokens for them.</li>'
                        +'</ul>'
                        +'<h4>Example Use Cases</h4>'
                        +'Assuming pages named Scrapwall [Numeria][Scrapwall] with locations of "Clockwork Chapel"(LinkLocation:entrance) and '
                        +'"Raider Hideout"(LinkLocation:entrance), Clockwork Chapel[Numeria][Scrapwall] with a location of "entrance"(linkLocation:"'
                        +'Clockwork Chapel"), and Raider Hideout with a location of "entrance"(linkLocation:"Raider Hideout").  And characters named Jonos,'
                        +'Kindle, and Violet.<br>'
                        +'<ul>'
                        +'<li>Move player(s) controlling Jonos to Raider Hideout: !nav --move,page=Raider Hideout|@{Jonos|character_id}</li>'
                        +'<li>Move as before and create default token(s) for the player(s): !nav --move,page=Raider Hideout,landing=entrance|@{Jonos|character_id}</li>'
                        +'<li>Return Jonos to the player ribbon: !nav --move,page=return|@{Jonos|character_id}</li>'
                        +'<li>Return as before, but query where to generate a token: !nav --move,page=return,landing=?|@{Jonos|character_id}</li>'
                        +'</ul>'
                        +'<h4>Full Command Syntax Guide</h4>'
                        +'This is the full guide of the chat commands available. Syntax is given with optional arguments enclosed in square brackets (e.g. '
                        +'Required Argument vs. [Optional Argument]). Mutually exclusive arguments are separated by a forward slash (/).'
                        +'<ul>'
                        +'<li>Move Command:<br>!nav --move,[page=PAGENAME/pageID=pageid],[landing=LOCATIONTEXT/?]|[PLAYERNAME/PLAYERID/CHARACTERID]|[PLAYERNAME/PLAYERID/CHARACTERID]|...'
                            +'<ul><li><b>page=PAGENAME:</b> The page name, without the folder tags, of the page to move to. If the command is sent by a player, it'
                            +'will be ignored if the page is not contained within a player accessible folder.</li>'
                            +'<li><b>pageID=PAGEID:</b> The page id of the page to move to. This will probably only be used by the script itself or other APIs as '
                            +'there is no way for users to access the page id.</li>'
                            +'<li><b>landing=LOCATIONTEXT:</b> This is the location text of the token where tokens should be created. If a "?" is entered as the '
                            +'location text, a menu prompt will be sent to the messaging player to ask what destination to use.</li>'
                            +'<li><b>PLAYERNAME/PLAYERID/CHARACTERID:</b> The player name, player ID, or character ID to be moved.</li>'
                            +'<li>If no page is specified a prompt will be sent to the messaging player to ask what page to send players to.</li>'
                            +'<li>If no player or character is specified the command will not be processed.</ul>'
                        +'<li>Configuration Option Controls:<br>!nav --config,[remove=on/off],[teleport=on/off],[folder=FOLDERNAME,access=gm/players],'
                        +'[control=whole/current/self],[dmarker=statusmarker name/name only]</li>'
                            +'<ul><li>If no additional options are entered, then the config menu will be displayed. Will only use the first of these the script encounters.</li>'
                            +'<li><b>remove:</b> This sets token removal on or off. Token removal causes all other instances of tokens representing teleporting '
                            +'characters to be removed before creating new tokens at a designated destination token.</li>'
                            +'<li><b>folder:</b> Designates what folder that you would like to change the access state of. Folder access information is stored in the Page Navigator character in an ability called <b>Page Folders</b>.</li>'
                                +'<ul><li><b>access:</b> This sets player access for the indicated folder.</li></ul>'
                            +"<li><b>control:</b> Sets player's ability to move others to new pages (whole=all players, current party=only those currently on the "
                            +"player toolbar, self=only themselves).</li>"
                            +'<li><b>dmarker:</b> Sets what status marker is used to define destination tokens. Can be the name of a statusmarker or "name". If "name" '
                            +'will only look for tokens that are named the same as a page.</li>'
                            +'<li><b>teleport:</b> Sets token teleportation on/off.</li></ul>'
                        +'<li>Destination Token Setup Wizard:<br>!nav --setup<br>Wizard Buttons:'
                            +'<ul><li><b>Token Name:</b> Clicking this button will bring up a query with options for the names of all current pages. You can also enter the name of yet to be created name by selecting the "PAGE NOT CREATED YET" option</li>'
                            +'<li><b>Boundary:</b> Select polygonal paths that you want to use to bound the token creation area for the destination token and then click this button. All polygons selected should create a closed shape as the script determines whether tokens can be created from a destination via a flood-fill algorithm.</li>'
                            +'<li><b>Location Text:</b> Clicking this button will bring up a query similar to that of the Token Name for selecting or entering custom text to describe the location of this destination.</li>'
                            +'<li><b>linkLocation Text:</b> As the button for Location text, but describes the location of the destination token this token links to.</li>'
                            +'<li><b>Chat Command:</b> Allows you to enter a line of text to be sent to chat when players are moved to this destination. Can be used to have the script send API commands based on party movement.</li></ul>'
                        +'</ul>',
                gmNotes='',
                help=getObj('character',state.PAGENAVIGATOR.help);
                
            if(!help){
                help = createObj('character',{name:'Page Navigator',archived:true,inplayerjournals:'all'});
                state.PAGENAVIGATOR.help = help.id;
            }
            
            help.set('bio',notes);
            
            storeFolders();
      	},
      	
      	cleanImgSrc = function(img){
            var parts = img.match(/(.*\/images\/.*)(thumb|med|original|max)(.*)$/);
            if(parts) {
                return parts[1]+'thumb'+parts[3];
            }
            return;
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
                '<a <%= templates.style({'+
                    'defaults: defaults,'+
                    'templates: templates,'+
                    'css: _.defaults(css,defaults.css.button)'+
                    '}) %> href="<%= command %>"><%= label||"Button" %></a>'
            );
        },
        
        //Makes the config option status buttons as they have a slightly different formatting than the rest of the buttons.
        makeStatusButton = function(status, button) {
            var i=_.indexOf(statusquery,status),
            backColor = 'transparent',
            command;
            if(!button){
                if(status===state.PAGENAVIGATOR.dmarker){
                    backColor = '#228b22';
                }
                command = '<a style="background-color: '+backColor+'; padding: 0;" href="!nav --config,dMarker='+status+' --config">';
            }else{
                command = command = '<a style="background-color: '+backColor+'">';
            }
            
            if(i===0){
                return command + '<div style ="color:black">Name Only<div style="width: 5px; height: 24px; '
                +'border-radius:20px; display:inline-block; margin: 0; border:0; cursor: pointer; text:Name Only "></div></a>'
            }else if(i>0 && i<8) {
                return command + '<div style="width: 24px; height: 24px; '
                +'border-radius:20px; display:inline-block; margin: 0; border:0; cursor: pointer;background-color: '+statusColormap[i-1]+'"></div></a>';
            }else if(i===8) {
                return command + '<div style="'
                +'font-family:Helvetica Neue,Helvetica, Arial, sans-serif;font-size:31px;font-weight:bold;color: red;width: 24px; height: 24px;'
                +'display:inline-block; margin: 0; border:0; cursor: pointer;background-color:">X</div></a>';
            }else if(i>8){
                return command + '<div style="width: 24px; height: 24px; '
                +'display:inline-block; margin: 0; border:0; cursor: pointer;padding:0;background-image: url(\'https://app.roll20.net/images/statussheet.png\');'
                +'background-repeat:no-repeat;background-position: '+((-34)*(i-9))+'px 0px;"></div></a>';
            }
        },
          
        /*Makes the API buttons used throughout the script*/
        makeButton = function(command, label, backgroundColor, color){
            return templates.button({
                command: command,
                label: label,
                templates: templates,
                defaults: defaults,
                css: {
                    color: color,
                    'background-color': backgroundColor
                }
            });
        },
        
        storeFolders = function(){
            var folderKeys=_.keys(allFolders),
                storedFolders;
                
            folderAbility = getObj('ability',state.PAGENAVIGATOR.folder);
            if(!folderAbility){
                folderAbility = createObj('ability',{characterid:state.PAGENAVIGATOR.help,name:'Page Folders'});
                state.PAGENAVIGATOR.folder = folderAbility.id;
            }
            try{
                storedFolders = JSON.parse(folderAbility.get('description'));
            }catch(err){
                storedFolders ={};
            }
            _.each(folderKeys,(k)=>{
                if(k==='Players'){
                    folderAccess[k]='players';
                }else{
                    folderAccess[k]=storedFolders[k]||'gm';
                }
            });
            folderAbility.set('description',folderAccess);
        },
        
        loadPlayers = function(){
            allPlayers = findObjs({type:'player'});
            state.PAGENAVIGATOR.players=state.PAGENAVIGATOR.players||{};
            _.each(allPlayers,function(p){
                state.PAGENAVIGATOR.players[p.id]=state.PAGENAVIGATOR.players[p.id]||[];
            });
            log('   >Page Navigator Memory: Player objects loaded');
        },
        
        loadPages = function(){
            allPages = findObjs({
                type:'page',
            });
            _.each(allPages,(p)=>{
                mapPage(p);
            });
        },
        
        mapPage = async function(p){
            var destMap;
            maps[p.id] = {};
            loadFolders(p);
            loadDests(p);
            //return await destMap;
        },
        //                  R20page
        loadDests = function(page){
            //3844
            var pageNames = _.map(allPages,(p) =>{
                return p.get('name').replace(/\[[^\[\]]*\]/g,'').trim();
            }),
            gnotes,parsedGnotes,destObj;
            
            destTokens[page.id] = _.map(findObjs({type:'graphic',pageid:page.id}),(d)=>{
                gnotes = undefined;
                parsedGnotes = undefined;
                if(state.PAGENAVIGATOR.dmarker === 'name'){
                    if(_.contains(pageNames,d.get('name'))===true && (d.get('layer')==='map'||d.get('layer')==='gmlayer')){
                        try{
                            gnotes = decodeURIComponent(d.get('gmnotes')).split(/<[/]?.+?>/g).join('');
                            if(gnotes.indexOf('{')===0){
                                parsedGnotes = JSON.parse(gnotes);
                            }
                        }catch(err){
                            sendChat('Page Navigator Load Error','/w gm The gmnotes of the destination token '+d.get('name')+' on page '+page.get('name')
                            +' is entered incorrectly. Please review the JSON formatting of the notes for this token. Current GM notes for this token are:<br>'+gnotes,null,{noarchive:true});
                        }
                        destObj = {
                            'token':d,
                            'parsedGM':parsedGnotes
                        }
                        return {'token':d,'parsedGM':parsedGnotes};
                    }
                }else{
                    if(_.contains(pageNames,d.get('name'))===true && (d.get('layer')==='map'||d.get('layer')==='gmlayer') && d.get('statusmarkers').indexOf(state.PAGENAVIGATOR.dmarker)>=0){
                        try{
                            gnotes = decodeURIComponent(d.get('gmnotes')).split(/<[/]?.+?>/g).join('');
                            if(gnotes.indexOf('{')===0){
                                parsedGnotes = JSON.parse(gnotes);
                            }
                        }catch(err){
                            sendChat('Page Navigator Load Error','/w gm The gmnotes of the destination token '+d.get('name')+' on page '
                            +page.get('name')+' is entered incorrectly. Please review the JSON formatting of the notes for this token. Current GM '
                            +'notes for this token are:<br>'+gnotes,null,{noarchive:true});
                        }
                        return {'token':d,'parsedGM':(parsedGnotes || {})};
                    }
                }
            });
            destTokens[page.id]=_.reject(destTokens[page.id],(d)=>{return _.isUndefined(d);})
        },
        
        loadFolders = function(page){
            var folders = page.get('name').match(/(?:\[([^\[\]]+)\])/g);
            allFolders['All'].push(page.id);
            _.each(folders,(f)=>{
                //state.PAGENAVIGATOR.folders[f.replace('[','').replace(']','')] = state.PAGENAVIGATOR.folders[f.replace('[','').replace(']','')] || 'gm';
                allFolders[f.replace('[','').replace(']','').trim()] = allFolders[f.replace('[','').replace(']','').trim()] || [];
                allFolders[f.replace('[','').replace(']','').trim()].push(page.id);
            });
        },
        
        /*mapPageObjects = function(page){
            var objects = findObjs({
                    type: 'graphic',
                    layer: 'objects',
                    pageid: page.id
                });
            _.each(objects,(o)=>{
                mapObject(o);
            });
        },*/
        
        //maps in the 2D array what squares are accessible teleport landings when landing at a destination token
        mapArea = async function(obj){
            var page = getObj('page',obj.get('pageid')),
                wallPaths = _.filter(destTokens[obj.get('pageid')],(d)=>{return d.token.id===obj.id})[0].parsedGM.polygon,
                coord = {x:(~~(obj.get('left')/70 - 0.5)),y:(~~(obj.get('top')/70 - 0.5))},
                wait;
                
            maps={};
            wallPaths = _.map(wallPaths,(p)=>{return getObj('path',p)});
            if(wallPaths.length===0){
                return;
            }
            await fillPolygon(obj.id,page,coord,wallPaths);
            return await mapAreaObjects(page);
        },
        
        fillPolygon = async function(id,page,coord,wallPaths){
            const xD = [-1,0,1,1,1,0,-1,-1],//relative x coordinates
                  yD = [-1,-1,-1,0,1,1,1,0];//relative y coordinates
            var accumulator = [],square,newCoord,squareCoord,newSquare;
                
            coord.x = Math.min((page.get('width')- 1),Math.max(0,coord.x));
            coord.y = Math.min((page.get('height')- 1),Math.max(0,coord.y));
            maps[coord.x+'X'+coord.y]={
                dest:[],
                object:[]
            }
            accumulator.push(coord);
            
            while(accumulator.length>0){
                square = accumulator.shift();
                squareCoord = [((square.x)*70 + 35),((square.y)*70 + 35),1];
                
                maps[square.x+'X'+square.y]['dest'].push(id);
                maps[square.x+'X'+square.y].x=square.x;
                maps[square.x+'X'+square.y].y=square.y;
                for(var i = 0;i<8;i++){
                    newSquare = {
                        x:Math.min((page.get('width')- 1),Math.max(0,(square.x+xD[i]))),
                        y:Math.min((page.get('width')- 1),Math.max(0,(square.y+yD[i])))
                    };
                    maps[newSquare.x+'X'+newSquare.y]=maps[newSquare.x+'X'+newSquare.y] || {
                        dest:[],
                        object:[]
                    };
                    if(!_.contains(maps[newSquare.x+'X'+newSquare.y].dest,id) && !_.some(accumulator,(a)=>{return (a.x===newSquare.x && a.y===newSquare.y)})){
                        newCoord = [((newSquare.x)*70 + 35),((newSquare.y)*70 + 35),1];
                        if(await accessible(wallPaths,squareCoord,newCoord,page)){
                            accumulator.push(newSquare);
                        }
                    }
                }
            }
            return await 'filled';
        },
        
        accessible = function(wallPaths,point1,point2,page){
            //return true;
            var wallSegments, blocked,wallSeg,clearChecker,
                squareSeg = [point1,point2],
                wallSegments = PathMath.toSegments(wallPaths),
                intersect;
                
            clearChecker = () => {
                wallSeg = wallSegments.shift();
                intersect = PathMath.segmentIntersection(squareSeg,wallSeg);
                if(!intersect){
                    if(wallSegments.length>0){
                        return new Promise((resolve,reject)=>{
                            setTimeout(()=>{resolve(clearChecker())},0);
                        });
                    }else{
                        return true;
                    }
                }else{
                    return false;
                }
            };
            return new Promise((resolve,reject)=>{
                resolve(clearChecker());
            });
        },
        
        //maps in the 2D array the location(rounded up to the nearest square, tokens smaller than a square count as a whole square) of the given object
        mapAreaObjects = function(page){
            var colStart,colEnd,rowStart,rowEnd,x,y,
                objects = findObjs({
                    type: 'graphic',
                    layer: 'objects',
                    pageid: page.id
                }),
                filted;
                
            filted = _.filter(objects,(obj)=>{
                var filt=false;
                colStart=Math.floor((obj.get('left')-obj.get('width')/2)/70);
                colEnd=Math.ceil((obj.get('left')+obj.get('width')/2)/70);
                rowStart=Math.floor((obj.get('top')-obj.get('height')/2)/70);
                rowEnd=Math.ceil((obj.get('top')+obj.get('height')/2)/70);
                _.each(_.range(rowStart,rowEnd),(h)=>{
                    _.each(_.range(colStart,colEnd), (w)=>{
                        if(maps[w+'X'+h]){
                            if(!_.isEmpty(maps[w+'X'+h].dest)){
                                filt = true;
                                maps[w+'X'+h].object.push(obj.id);
                            }
                        }
                    });
                });
                return filt;
            });
            return filted;
        },
        
        //converts standard pixel widths into squares
        //                  obj/R20graphic
        arrayUnits = function(obj){
            var width = obj.width || obj.get('width'),
                height = obj.height || obj.get('height'),
                tLeft,tTop,
                arrayTok;
            if(obj.id){
                tLeft = ~~obj.get('left')/70;
                tTop = ~~obj.get('top')/70;
            }
            arrayTok = {
                width: Math.ceil(width/70),
                height: Math.ceil(height/70),
                x: tLeft,
                y: tTop
            };
            return arrayTok;
        },
        
        //Maps the area around the landing location to find the closest squares open for the token
        //                  R20graphic  obj bool
        mapSurrounding = function(loc,token,ignore){
            //4119
            var land = arrayUnits(loc),
                tok = arrayUnits(token),
                fitSquares, closest,checkSquares,cdist=null,distance;
                
            fitSquares = _.filter(maps,(m)=>{
                checkSquares = [];
                _.each(_.range(tok.height),(h)=>{
                    _.each(_.range(tok.width), (w)=>{
                        checkSquares.push(maps[(m['x']+w)+'X'+(m['y']+h)]);
                    });
                });
                return _.every(checkSquares,(s)=>{
                    if(!s){
                        return false;
                    }
                    if(!ignore){
                        return (_.isEmpty(s.object) && _.contains(s.dest,loc.id));
                    }else{
                        return _.contains(s.dest,loc.id);
                    }
                });
            });
            _.each(fitSquares,(f)=>{
                distance = Math.hypot((land.x-f.x),(land.y-f.y));
                if(cdist===null || !closest){
                    cdist = distance;
                    closest = f;
                }else{
                    if(distance<cdist){
                        cdist = distance;
                        closest = f;
                    }
                }
            });
            return closest;
        },
        
        /*
        Is not detecting that there is enough room for tokens after the first. Should also look at revamping how the script determines if there is enough space
        for a token using new pathfinding/flood-fill knowledge.
        Also need to change script so that tokens are not loaded at startup, but are instead gotten from character at teleport time. Will also allow to pull
        token ata from currently existing tokens.
        */
        
        getToken = function(character){
            //log(character);
            var token = findObjs({
                    type:'graphic',
                    layer:'objects',
                    represents:character.id
                }),
                final,parsed;
                
            if(!_.isEmpty(token) && state.PAGENAVIGATOR.removal==='on'){
                //log('removal');
                final = {
                    //character ID
                    //'cid' : character.id,
                    //Represents
                    'represents' :token[0].get('represents') || '',
                    'name' :token[0].get('name') || '',
                    'controlledby' :token[0].get('controlledby') || '',
                    //Image/Token appearance
                    'imgsrc' :cleanImgSrc(token[0].get('imgsrc')),
                    'width' :token[0].get('width') || 70,
                    'height' :token[0].get('height') || 70,
                    'isdrawing' :token[0].get('isdrawing') || false,
                    'tint_color' :token[0].get('tint_color') || 'transparent',
                    'statusmarkers' :token[0].get('statusmarkers') || '',
                    //Token Fields
                    'gmnotes' :token[0].get('gmnotes') || '',
                    //Bars
                    'bar1_link' :token[0].get('bar1_link') || '',
                    'bar2_link' :token[0].get('bar2_link') || '',
                    'bar3_link' :token[0].get('bar3_link') || '',
                    'bar1_value' :token[0].get('bar1_value') || '',
                    'bar2_value' :token[0].get('bar2_value') || '',
                    'bar3_value' :token[0].get('bar3_value') || '',
                    'bar1_max' :token[0].get('bar1_max') || '',
                    'bar2_max' :token[0].get('bar2_max') || '',
                    'bar3_max' :token[0].get('bar3_max') || '',
                    //Auras 
                    'aura1_radius' :token[0].get('aura1_radius') || '',
                    'aura2_radius' :token[0].get('aura2_radius') || '',
                    'aura1_color' :token[0].get('aura1_color') || '#FFFF99',
                    'aura2_color' :token[0].get('aura2_color') || '#59E594',
                    'aura1_square' :token[0].get('aura1_square') || false,
                    'aura2_square' :token[0].get('aura2_square') || false,
                    //show attributes
                    'showname' :token[0].get('showname') || false,
                    'showplayers_name' :token[0].get('showplayers_name') || false,
                    'showplayers_bar1' :token[0].get('showplayers_bar1') || false,
                    'showplayers_bar2' :token[0].get('showplayers_bar2') || false,
                    'showplayers_bar3' :token[0].get('showplayers_bar3') || false,
                    'showplayers_aura1' :token[0].get('showplayers_aura1') || false,
                    'showplayers_aura2' :token[0].get('showplayers_aura2') || false,
                    //Edit attributes
                    'playersedit_name' :token[0].get('playersedit_name') || false,
                    'playersedit_bar1' :token[0].get('playersedit_bar1') || false,
                    'playersedit_bar2' :token[0].get('playersedit_bar2') || false,
                    'playersedit_bar3' :token[0].get('playersedit_bar3') || false,
                    'playersedit_aura1' :token[0].get('playersedit_aura1') || false,
                    'playersedit_aura2' :token[0].get('playersedit_aura2') || false,
                    //Dynamic Lighting
                    'light_radius' :token[0].get('light_radius') || '',
                    'light_dimradius' :token[0].get('light_dimradius') || '',
                    'light_otherplayers' :token[0].get('light_otherplayers') || false,
                    'light_hassight' :token[0].get('light_hassight') || false,
                    'light_angle' :token[0].get('light_angle') || '360',
                    'light_losangle' :token[0].get('light_losangle') || '360',
                    'light_multiplier' :token[0].get('light_multiplier') || '1'
                };
            }else{
                final = new Promise((resolve,reject)=>{
                    character.get('defaulttoken',(t)=>{
                        try{
                            parsed = JSON.parse(t);
                            parsed.imgsrc=cleanImgSrc(parsed.imgsrc);
                            resolve(parsed);
                        }catch(err){
                            log('Problem Characters in default token for '+character.get('name'));
                        }
                    });
                });
            }
            return final;
        },
        
        //Iterates through all the designated playerIds and generates tokens for each player's default characters at the landingToken
        //                                  R20graphic    array
        createTokenLanding = async function(landingToken, playerId){
            if(typeof landingToken ==='string'){
                landingToken = getObj('graphic',landingToken);
            };
            
            var characters = [],
                missed = [],
                start, surr={},
                arrayPoint, newToken,arrayDim;
                
            for(var i = 0;i<playerId.length;i++){
                for(var e = 0;e<state.PAGENAVIGATOR.players[playerId[i]].length;e++){
                    characters.push(await getToken(getObj('character',state.PAGENAVIGATOR.players[playerId[i]][e])));
                }
            }
            characters = _.sortBy(characters,(c)=>{return c.id ? (c.get('width')*c.get('height')*-1):(c.width*c.height*-1)});
            start = _.now();
            if(state.PAGENAVIGATOR.removal==='on'){
                _.each(characters,(c)=>{
                    _.each(findObjs({type:'graphic', represents: c.id ? c.get('represents') : c.represents}),(g)=>{
                        g.remove();
                    });
                });
            }
            await mapArea(landingToken);
            for(var i = 0;i<characters.length;i++){
                newToken = null;
                arrayPoint = null;
                arrayPoint = await mapSurrounding(landingToken,{width: characters[i].id ? characters[i].get('width') : characters[i].width,height: characters[i].id ? characters[i].get('height') : characters[i].height});
                if(arrayPoint){
                    arrayDim = arrayUnits(characters[i]);
                    _.each(_.range(arrayDim.width),(w)=>{
                        _.each(_.range(arrayDim.height),(h)=>{
                            maps[(arrayPoint.x+w)+'X'+(arrayPoint.y+h)]['object'].push(characters[i].name);
                        });
                    });
                    surr.x = arrayPoint.x*70 + 35;
                    surr.y = arrayPoint.y*70 + 35;
                    createObj('graphic',_.defaults({left:(surr.x+characters[i].width/2- 35),top:(surr.y+characters[i].height/2- 35),pageid:landingToken.get('pageid'),layer:'objects'},characters[i]));
                }else{
                    missed.push(characters[i]);
                }
            }
            for(var i =0;i<missed.length;i++){
                newToken = null;
                arrayPoint = null;
                arrayPoint = await mapSurrounding(landingToken,{width: missed[i].id ? missed[i].get('width') : missed[i].width,height: missed[i].id ? missed[i].get('height') : missed[i].height},true);
                if(arrayPoint){
                    maps[landingToken.get('pageid')][arrayPoint.x+'X'+arrayPoint.y]['object'].push(missed[i].name);
                    surr.x = arrayPoint.x*70 + 35;
                    surr.y = arrayPoint.y*70 + 35;
                    createObj('graphic',_.defaults({left:(surr.x+missed[i].width/2- 35),top:(surr.y+missed[i].height/2- 35),pageid:landingToken.get('pageid'),layer:'objects'},missed[i]));
                }
            };
        },
          
        //finds the token that is at the designated location. If multiple are at that location, will use the first one found.
        //                      array  string  string
        findEntrance = function(playerId,pageId,location){
            var landing,destGM;
            
            landing = _.filter(destTokens[pageId], function(d){
                return (d.parsedGM['location']===location);
            });
            
            if(landing.length>0){
                createTokenLanding(landing[0].token,playerId);
                if(landing[0].parsedGM.chat){
                    sendChat('',landing[0].parsedGM.chat);
                }
            }
        },
        
        //checks for collisions with destination tokens
        //                                  R20graphic
        getDestinationCollisions = function(token){
            if(token.get('controlledby').length===0 && (!token.get('represents') || getObj('character',token.get('represents')).get('controlledby').length===0)){
                return;
            }
            var pageId = token.get('pageid'),
                dTokens = _.map(destTokens[pageId],(d)=>{return d.token}),
                overlap,lastCollision,destination,
                destGM;
                
            lastCollision = _.last(TokenCollisions.getCollisions(token, dTokens))
            if(lastCollision){
                overlap = TokenCollisions.isOverlapping(token,lastCollision,false);
            }
            if(overlap){
                destination = _.filter(allPages,(p)=>{
                    return p.get('name').replace(/\[[^\[\]]*\]/g,'').trim()===lastCollision.get('name');
                })[0];
                if(state.PAGENAVIGATOR.teleport === 'on'){
                    try{
                        destGM = JSON.parse(decodeURIComponent(lastCollision.get('gmnotes')).split(/<[/]?.+?>/g).join(''));
                    }catch(err){
                        destGM = {};
                        //handling for incorrectly formatted GM notes
                    }
                }
                verifyMove(token,destination,destGM.linkLocation)
            }
        },
        
        //Still need to put in handling for player accessible vs. gm only pages for messaging
        //               R20graphic R20page  string
        verifyMove = function(token,page,destNotes){
            var controlList,tokenControl,button,msg, msgTarget,
                character = getObj('character',token.get('represents')) || token,
                command = '!nav --move,pageID='+page.id,
                playerQuery = '?{Who is moving?|All Players,whole|Current Party,current|',
                destQuery='?{Where should tokens be created|-|',
                pageFolders=page.get('name').match(/(?:\[[^\[\]]+\])/g);
                
            playerQuery+=character.get('name')+' only,';
            if(_.some(pageFolders,(f)=>{return folderAccess[f.replace(/\[|\]/g,'')]==='players'})){
                msgTarget = character.get('name');
            }else{
                msgTarget = 'gm';
            }
            controlList = character.get('controlledby').split(',').join('|');
            
            if(!destNotes && state.PAGENAVIGATOR.teleport === 'on'){
                _.each(destTokens[page.id],(t)=>{
                    destQuery += t.token.get('name')+'|';
                });
                destQuery += '}';
                command += 'landing='+destQuery;
            }else if(destNotes && state.PAGENAVIGATOR.teleport === 'on'){
                command += ',landing='+destNotes;
            }
            playerQuery += HE(controlList)+'}';
            command += '|'+playerQuery;
            button = makeButton(
                        command,
                        'Approve', '#009900', '#000000'
                    );
            log(msgTarget);
            msg = ' <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                + '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 110%;">'
                + character.get('name')+' would like to move to '+destNotes+' on '+page.get('name').replace(/\[[^\[\]]*\]/g,'').trim()+'. If this move is correct, please approve the move.'
                + '<p>' + button + '</p>'
                + '</div>';
            sendChat('Page Navigator','/w "'+msgTarget+'"'+msg,null,{noarchive:true});
        },
        
        //Moves the designated players to the designated page, and generates tokens at the designated destination if provided.
        //                 string  Array string  string
        moveToPage = function(id,players,pageId,destination){
            var party = [],
                separated = Campaign().get('playerspecificpages')||{},
                who = idToDisplayName(id),
                gm=playerIsGM(id),
                folders;
                
            if(pageId==='return'){
                pageId=Campaign().get('playerpageid');
            }
            if(!findObjs({type:'page',id:pageId})){
                return;
            }
            folders=getObj('page',pageId).get('name').match(/(?:\[([^\[\]]+)\])/g)||[];
            folders.push('All');
            //4220
            if(!_.some(folders,(f)=>{return folderAccess[f]==='players'}) && !gm){
                //Handling for inaccessible page
                return;
            }
            if(_.some(players,(p)=>{return p.match(/whole/)}) && (gm || state.PAGENAVIGATOR.control==='whole')){
                if(state.PAGENAVIGATOR.teleport === 'on'){
                    if(destination && destination !== '-'){
                        _.each(allPlayers,(p)=>{
                            party.push(p.id);
                        });
                        findEntrance(party,pageId,destination);
                    }
                }
                Campaign().set({playerspecificpages:false,playerpageid:pageId});
            }else if(_.some(players,(p)=>{return p.match(/current/)}) && (gm || state.PAGENAVIGATOR.control==='whole' || state.PAGENAVIGATOR.control==='current')){
                if(state.PAGENAVIGATOR.teleport === 'on'){
                    if(destination && destination !== '-'){
                        _.each(allPlayers,(p)=>{
                            if(!separated[p.id] || separated[p.id]===false){
                                party.push(p.id);
                            }
                        });
                        findEntrance(party,pageId,destination);
                    }
                }
                Campaign().set('playerpageid',pageId);
            }else{
                _.each(players,(p)=>{
                    party.push(p);
                    separated[p]=pageId;
                });
                if(state.PAGENAVIGATOR.teleport === 'on'){
                    findEntrance(party,pageId,destination);
                }
                Campaign().set('playerspecificpages',false);
                Campaign().set('playerspecificpages',separated);
            }
        },
        
        //generates query message to choose where to move (page &/or landing) to move designated players
        //                 string string array  string  string
        moveQuery = function(id,action,players,page,landing){
            var button,msg,
                command = '!nav --'+action+',pageID=',
                playerQuery = '?{Who is moving?|All Players,whole|Current Party,current}',
                destQuery='',
                folderKeys,destName,
                who = idToDisplayName(id),
                gm=playerIsGM(id),
                folders;
            
            if(!players || players.length===0){
                help(id);
                return;
            }
            msg = ' <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                + '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 110%;">'
                + 'Please specify where you would like to '+action+' the following players:<br>'+_.map(players,(p)=>{return idToDisplayName(p);}).join(', ')+'<br>'
                + '<p>';
            if(page && landing === '?'){
                folders=getObj('page',page).get('name').match(/(?:\[([^\[\]]+)\])/g)||[];
                folders.push('All');
                if(_.some(folders,(f)=>{return folderAccess[f]==='players'}) || gm){
                    command+=page;
                }else{
                    sendChat('Page Navigator','/w "'+who+'" That page is not accessible to players, please ask your gm to move you.',null,{noarchive:true});
                    return;
                }
                destQuery+='landing=?{Where should tokens be created|-';
                _.each(destTokens[page],(t)=>{
                    destQuery += '|';
                    destQuery += t.parsedGM['location'];
                });
                destQuery += '|}';
                command+=destQuery;
                button = makeButton(
                    command+'|'+players.join('|'),
                    'Specify Destination', '#009900', '#000000'
                );
                msg+= button + '</p>'
                    + '</div>';
            }else if(!page){
                folders=getObj('page',Campaign().get('playerpageid')).get('name').match(/(?:\[([^\[\]]+)\])/g)||[];
                folders.push('All');
                if(_.some(folders,(f)=>{return folderAccess[f]==='players'}) || gm){
                    if(landing==='?'){
                        destQuery=',landing=?{Where should tokens be created|-';
                        _.each(destTokens[Campaign().get('playerpageid')],(t)=>{
                            if(t.parsedGM.location){
                                destQuery+='|'+t.parsedGM.location;
                            }
                        });
                        destQuery+='}';
                    }
                    msg+=makeButton(
                        command+'return'+destQuery+'|'+players.join('|'),
                        'Return to '+getObj('page',Campaign().get('playerpageid')).get('name').replace(/(?:\[([^\[\]]+)\])/g,'').trim(), '#009900', '#000000'
                    );
                }
                folderKeys = _.keys(allFolders);
                _.each(folderKeys,(k)=>{
                    if(folderAccess[k]==='players'||gm){
                        if(allFolders[k].length>0){
                            var pageQuery = '?{Which page in folder '+k;
                            _.each(allFolders[k],(n)=>{
                                page = _.filter(allPages,(p)=>{
                                    return p.id===n;
                                })[0];
                                pageQuery+='|'+page.get('name').replace(/(?:\[([^\[\]]+)\])/g,'').trim()+','+page.id;
                                if(landing==='?'){
                                    destQuery=',landing=?{Where should tokens be created|-';
                                    _.each(destTokens[page.id],(t)=>{
                                        if(t.parsedGM['location']){
                                            destQuery += '|'+t.parsedGM['location'];
                                        }
                                    });
                                    destQuery+='|}';
                                    pageQuery += HE(destQuery);
                                }
                            });
                        }
                        pageQuery+='|}';
                        msg+=makeButton(
                            command+HE(pageQuery)+'|'+players.join('|'),
                            k+' folder', '#009900', '#000000'
                        );
                    }
                    
                    /*if(landing==='?'){
                        if(folderAccess[k]==='players'||gm){
                            if(allFolders[k].length>0){
                                folderQuery+='|'+k+',';
                                _.each(allFolders[k],(n)=>{
                                    page = _.filter(allPages,(p)=>{
                                        return p.id===n;
                                    })[0];
                                    _.each(destTokens[page.id],(t)=>{
                                        destQuery += '|';
                                        destQuery += t.parsedGM['location'];
                                    });
                                    destQuery += '|}';
                                    folderQuery+=HE(page.get('name').replace(/\[[^\[\]]*\]/g,'').trim()+HE(HE(','))+page.id+HE(',landing='+destQuery));
                                });
                            }
                        }
                    }else{
                        if(folderAccess[k]==='players'||gm){
                            if(folderAccess[k]==='players'||gm){
                                folderQuery+='|'+k+','+HE('?{Which Page|');
                                _.each(allFolders[k],(n)=>{
                                    page = _.filter(allPages,(p)=>{
                                        return p.id===n;
                                    })[0];
                                    folderQuery+=HE(page.get('name').replace(/\[[^\[\]]*\]/g,'').trim()+','+page.id+'|');
                                });
                                folderQuery+=HE('}');
                            }
                        }
                    }*/
                });
                msg+='</p></div>';
            }
            sendChat('Page Navigation','/w "'+who+'" '+msg,null,{noarchive:true});
        },
        
        //inserts the value in the string in front of the index
        /*insert = function (str, index, value) {
            return str.substr(0, index) + value + str.substr(index);
        },*/
        
        teleportConfig = function(){
            var teleportMsg='<div style="border-top: 1px solid #000000; border-radius: .2em; background-color: white; padding: .1em .3em;">',//Teleport section start div
                teleportButton,removalButton,playerButton,characters,charQuery,petQuery;
                
            if(state.PAGENAVIGATOR.teleport === 'on'){
                teleportButton = makeButton(
                        '!nav --config,teleport=off --config',
                        'On', 'green'
                );
                if(state.PAGENAVIGATOR.removal === 'on'){
                      removalButton = makeButton(
                            '!nav --config,remove=off --config',
                            'On','green'
                      );
                }else{
                      removalButton = makeButton(
                            '!nav --config,remove=on --config',
                            'Off','red','black'
                      );
                }
                teleportMsg+='Teleportation is <div style="float:right;">'+teleportButton+'</div><br><br>'
                            +'Token Removal is <div style="float:right;">'+removalButton+'</div><br><br>';
                _.each(allPlayers,function(p){
                    charQuery = '|';
                    petQuery = '';
                    characters = _.filter(findObjs({type: 'character',}), (c)=>{
                        return _.contains(c.get('controlledby').split(','),p.id);
                    });
                    _.each(characters, function(c){
                        charQuery += '|' + c.get('name') + ',' + c.id;
                    });
                    petQuery += '?{Primary Character'+charQuery+'}|'
                    +' ?{Number of followers'
                    +'|1,'+HE('?{Follower 1'+charQuery+'|none}')
                    +'|2,'+HE('?{Follower 1'+charQuery+'|none}|?{Follower 2'+charQuery+'}')
                    +'|3,'+HE('?{Follower 1'+charQuery+'|none}|?{Follower 2'+charQuery+'|none}|?{Follower 3'+charQuery+'|none}')
                    +'|4,'+HE('?{Follower 1'+charQuery+'|none}|?{Follower 2'+charQuery+'|none}|?{Follower 3'+charQuery+'|none}|?{Follower 4'+charQuery+'|none}')
                    +'|5,'+HE('?{Follower 1'+charQuery+'|none}|?{Follower 2'+charQuery+'|none}|?{Follower 3'+charQuery+'|none}|?{Follower 4'+charQuery+'|none}|?{Follower 5'+charQuery+'|none}')
                    +'}';
                    charQuery+='|Has pets/followers,';
                    playerButton = makeButton(
                        '!nav --config,tokens=' + p.id + '|?{'+p.get('displayname')+"'s default character"+charQuery+HE(HE(petQuery))+'} --config',
                        'Set Default Token', 'white', 'black'
                    );
                    teleportMsg+=p.get('displayname')
                        +'<div style="float:right;">'
                        +playerButton+'</div><br><br><br>';
                });
            }else{
                teleportButton = makeButton(
                    '!nav --config,teleport=on --config',
                    'Teleport Off', 'gray','white'
                );
                teleportMsg+=teleportButton;
            }
            teleportMsg+='</div>';//telport section end div
            return teleportMsg;
        },
        
        controlConfig = function(){
            var controlMsg = '<div style="border-top: 1px solid #000000; border-radius: .2em; background-color: white; padding: .1em .3em;">'
                            +'Players can move:',
                controlButton,accessButton;
                
            //Handling for setting ability of players to transition other players
            switch(state.PAGENAVIGATOR.control) {
                case 'whole':
                    controlButton = makeButton(
                            '!nav --config,control=?{Players can move all players. Who should they be able to move|Current Party only,current|Only Themselves,self} --config', 
                            '<b>The Whole Party</b>', '#228b22'
                    );
                    break;
                case 'current':
                    controlButton = makeButton(
                            '!nav --config,control=?{Players can move only the current party. Who should they be able to move|All players,whole|Only Themselves,self} --config', 
                            '<b>The Current Party</b>', '#ffff00', '#000000'
                    );
                    break;
                case 'self':
                    controlButton = makeButton(
                            '!nav --config,control=?{Players can move only themselves. Who should they be able to move|All players,whole|Current Party only,current} --config',
                            '<b>Themselves Only</b>', '#ff4500'
                    );
                    break;
            }
            controlMsg+='<div style="float:right;">'+controlButton+'</div><br><br><br></div>';
            //Page Access
            controlMsg+=folderConfig();
            return controlMsg;
        },
        
        folderConfig = function(){
            var folderMsg = '<div style="border-top: 1px solid #000000; border-radius: .2em; background-color: white; padding: .1em .3em;">'
                            +'Folders are either Player (<b>GREEN</b>) or GM only (<b>WHITE</b>) accessible.<br>',
                folderButton,
                acc={
                    'gm':'players',
                    'players':'gm'
                },
                accColor = {
                    'gm':'transparent',
                    'players':'green'
                };
                
            _.each(_.keys(folderAccess),(k)=>{
                folderButton = makeButton(
                    '!nav --config,folder='+k+',access='+acc[folderAccess[k]]+' --config',
                    '<b>'+k+'</b>', accColor[folderAccess[k]],'black'
                );
                folderMsg+=folderButton;
            });
                
            folderMsg+='</div>';
            return folderMsg;
        },
        
        markerConfig = function(){
            var dmarkerButton = '',
                markerMsg='<div style="border-top: 1px solid #000000; border-radius: .2em; background-color: white; padding: .1em .3em;">'//markermsg div start
                            +'<p><b>Destination tokens are marked by:</b></p>';
            _.each(statusquery, function(s){
                dmarkerButton += makeStatusButton(s);
            });
            markerMsg += dmarkerButton+'</div>';//end marker msg div
            return markerMsg;
        },
        
        configAssembler = function(who){
            var teleportMsg = teleportConfig(),
                controlMsg = controlConfig(),
                markerMsg = markerConfig(),
                menu = '/w "'+who+'" <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'//overall div for nice formatting of control panel
                        +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'//Control Panel Header div
                        +'Page Navigator v'+version+'<b> Options</b>'
                        +'</div>';//end Control Panel Header div
                menu+=controlMsg+markerMsg+teleportMsg;
                menu+='</div>'//end overall div
            sendChat('',menu,null,{noarchive:true});
        },
        
        //gets the current states, and outputs everything in a nicely formatted config screen
        configHandler = function(id,cmdDetails){
            var msg ='',
                dmarkerButton = '',
                updateButton = makeButton('!nav update', '<b>Update Destinations & Pages</b>', '#fff8dc', '#191970'),
                who = idToDisplayName(id);
                
            switch(false){
                case _.isUndefined(cmdDetails.details.remove):
                    if(cmdDetails.details.remove==='on'||cmdDetails.details.remove==='off'){
                        state.PAGENAVIGATOR.removal = cmdDetails.details.remove;
                    }else{
                        //handling for improper setting
                    }
                    break;
                case _.isUndefined(cmdDetails.details.folder):
                    if(_.contains(_.keys(folderAccess),cmdDetails.details.folder) && (cmdDetails.details.access==='players'||cmdDetails.details.access==='gm')){
                        folderAccess[cmdDetails.details.folder]=cmdDetails.details.access;
                        folderAbility.set('description',folderAccess);
                    }
                    break;
                case _.isUndefined(cmdDetails.details.control):
                    if(cmdDetails.details.control==='whole'||cmdDetails.details.control==='current'||cmdDetails.details.control==='self'){
                        state.PAGENAVIGATOR.control = cmdDetails.details.control;
                    }else{
                        //handling for improper setting
                    }
                    break;
                case _.isUndefined(cmdDetails.details.dMarker):
                    if(_.contains(statusQuery,cmdDetails.details.dMarker)){
                        state.PAGENAVIGATOR.dmarker = cmdDetails.details.dMarker;
                    }else{
                        //handling for incorrect dMarker
                    }
                    break;
                case _.isUndefined(cmdDetails.details.teleport):
                    if(cmdDetails.details.teleport==='on'||cmdDetails.details.teleport==='off'){
                        state.PAGENAVIGATOR.teleport = cmdDetails.details.teleport;
                    }else{
                        sendChat('Page Navigator Error','/w "'+who+'" You attempted to turn teleportation on or off, but used an incorrect argument. You used "'+cmdDetails.details.teleport+'", but only "on" or "off" can be used.',null,{noarchive:true});
                    }
                    break;
                case _.isUndefined(cmdDetails.details.tokens):
                    state.PAGENAVIGATOR.players[cmdDetails.details.tokens]=[];
                    _.each(cmdDetails.players,(p)=>{
                        if(p.length>0){
                            state.PAGENAVIGATOR.players[cmdDetails.details.tokens].push(p);
                        }
                    });
                    break;
                default:
                    configAssembler(who);
            }
        },
        
        //handles all logic for determining what move function to call
        //                      object    id    object
        moveHandler = function(cmdDetails,id,selected){
            //4659
            var page,token,character,folders;
            if(cmdDetails.players.length===0 && selected){
                _.each(selected,(s)=>{
                    token = getObj('graphic',s._id);
                    character = getObj('character',token.get('represents')) || token;
                    _.each(character.get('controlledby').split(','),(c)=>{
                        cmdDetails.players.push(c);
                    });
                });
                cmdDetails.players = _.reject(cmdDetails.players,(p)=>{return _.isUndefined(p);});
            }
            if(cmdDetails.details.page){
                if(cmdDetails.details.page!=='return'){
                    try{
                        page = _.filter(allPages,(p)=>{
                            return p.get('name').replace(/\[[^\[\]]*\]/g,'').trim()===cmdDetails.details.page;
                        })[0].id;
                    }catch(err){
                        sendChat('Page Navigator Error:','/w "'+who+'" no page was found by the name '+cmdDetails.details.page,null,{noarchive:true});
                        return;
                    }
                }else{
                    page = cmdDetails.details.page;
                }
            }else if(cmdDetails.details.pageID){
                page = cmdDetails.details.pageID;
            }
            if(page && page!=='return'){
                folders = getObj('page',page).get('name').match(/(?:\[([^\[\]]+)\])/g);
            }
            if(cmdDetails.players.length>0 && page && cmdDetails.details.landing!=='?'){
                moveToPage(id,cmdDetails.players,page,cmdDetails.details.landing);
            }else{
                moveQuery(id,cmdDetails.action,cmdDetails.players,page,cmdDetails.details.landing)
            }
        },
        
        help = function(id){
            var who = idToDisplayName(id),
                gm = playerIsGM(id),
                msg = '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'//overall div for nice formatting of control panel
                    +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'//Control Panel Header div
                    +'Page Navigator v'+version+' <b>Help</b></div>'
                    +'For detailed help, access the Bio & Info tab of the <u><b>[Page Navigator Character](https://journal.roll20.net/character/'+state.PAGENAVIGATOR.help
                    +')</b></u> for the full command and setup details. The available commands (with all possible options) are:'
                    +'<ul>'
                    +'<li>!nav --config,[folder:FOLDERNAME,[access=gm/players] ],[control=whole/current/self],[dmarker=statusmarker/name],[teleport=on/off],[remove=on/off]</li>'
                    +'<li>!nav --move/teleport,[page=PAGENAME/return],[landing=LOCATION TEXT/?]|playerID/characterID|...</li></ul></div>';
            sendChat('Page Navigator','/w "'+who+'" '+msg,null,{noarchive:true});
        },
        
        //converts a playerid to their displayname
        idToDisplayName = function(id){
            var player = getObj('player', id);
            if(player){
                return player.get('displayname');
            }else{
                return 'gm';
            }
        },
        
        setToken = function(tokens,whatValue,page){
            //4651
            var gnotes,settings;
                
            _.each(tokens,(token)=>{
                try{
                    settings = JSON.parse(decodeURIComponent(token.get('gmnotes')).split(/<[/]?.+?>/g).join(''));
                }catch(e){
                    settings = {};
                }
                _.each(_.keys(whatValue),(w)=>{
                    settings[w]=whatValue[w] || settings[w];
                });
                if(page){
                    token.set('name',page);
                }
                if(state.PAGENAVIGATOR.dMarker !== 'name' && !token.get('status_'+state.PAGENAVIGATOR.dMarker)){
                    token.set(state.PAGENAVIGATOR.dMarker,true);
                }
                token.set('gmnotes',JSON.stringify(settings));
            });
        },
        
        outputSetup = function(who,tokens){
            //4675
            var msg = '/w "'+who+'" <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'//overall div for nice formatting of control panel
                    +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'//Control Panel Header div
                    +'Page Navigator v'+version+' <b>Destination Token Setup</b></div>'
                    +'This wizard will setup your selected destination token(s) with the appropriate JSON. Simply click each button to setup that aspect of the destination.',//Control Panel Header closing div
                polygonButton,locationButton,llButton,chatButton,nameButton,nameButton,settings,llQuery,locationQuery,
                pageQuery = '?{Which Page|'+_.map(allPages,(p)=>{return p.get('name').replace(/\[[^\[\]]*\]/g,'').trim();}).join('|')+'|**PAGE NOT CREATED YET**,?{Page Name to be Created'+HE(HE('}'))+'}',
                tokenIDs = _.map(tokens,(t)=>{return t.id}).join('|');
                
            try{
                settings = JSON.parse(decodeURIComponent(tokens[0].get('gmnotes')).split(/<[/]?.+?>/g).join(''));
                if(!settings.polygon){
                    settings.polygon = '#50dead';
                }
            }catch(e){
                settings = {
                    location:'',
                    linkLocation:'',
                    polygon:undefined,
                    chat:''
                };
            }
            llQuery = '?{Link to Which Location|'+_.map(destTokens[_.filter(allPages,(p)=>{return p.get('name').replace(/\[[^\[\]]*\]/g,'').trim()===tokens[0].get('name')})[0].id],(t)=>{
                return t.parsedGM.location;
            }).join('|')+'|**LOCATION NOT LISTED**,?{linkLocation Text Free Type'+HE(HE('}'))+'}';
            locationQuery = '?{Describe This Location|'+_.map(destTokens[_.filter(allPages,(p)=>{return p.get('name').replace(/\[[^\[\]]*\]/g,'').trim()===tokens[0].get('name')})[0].id],(t)=>{
                return t.parsedGM.linkLocation;
            }).join('|')+'|**LOCATION NOT ALREADY LINKED**,?{location Text Free Type'+HE(HE('}'))+'}';
            nameButton = makeButton(
                    '!nav --setup,page='+pageQuery+'|'+tokenIDs+' --setup|'+tokenIDs,
                    tokens[0].get('name'),'transparent','black'
                );
            polygonButton = makeButton(
                    '!nav --setup,polygon|'+tokenIDs+' --setup|'+tokenIDs,
                    'Select Boundary','transparent','black'
                );
            locationButton = makeButton(
                    '!nav --setup,location='+locationQuery+'|'+tokenIDs+' --setup|'+tokenIDs,
                    (settings.location || ''),'transparent','black'
                );
            llButton = makeButton(
                    '!nav --setup,linkLocation='+llQuery+'|'+tokenIDs+' --setup|'+tokenIDs,
                    (settings.linkLocation || ''),'transparent','black'
                );
            chatButton = makeButton(
                    '!nav --setup,chat=?{What chat command would you like sent. Currently set to'+HE(':')+' '+HE(HE((settings.chat || '')))+'}|'+tokenIDs+' --setup|'+tokenIDs,
                    'Enter Chat Command to run','transparent','black'
                );
            msg+='<div style="border-bottom: 1px solid black;">'
                +'**Token Name:**<div style="float:right;">'+nameButton+'</div><div style="clear: both"></div></div>'
                +'<div style="border-bottom: 1px solid black;">'
                +'**Boundary:**<div style="float:right;">'+polygonButton+'</div><div style="clear: both"></div></div>'
                +'<div style="border-bottom: 1px solid black;">'
                +'**Location Text:**<div style="float:right;">'+locationButton+'</div><div style="clear: both"></div></div>'
                +'<div style="border-bottom: 1px solid black;">'
                +'**linkLocation Text:**<div style="float:right;">'+llButton+'</div><div style="clear: both"></div></div>'
                +'<div style="border-bottom: 1px solid black;">'
                +'**Chat Command:**<div style="float:right;">'+chatButton+'</div><div style="clear: both"></div></div>';
            msg+='</div>';//overall closing div
            sendChat('Page Navigator',msg,null,{noarchive:true});
        },
        
        setupHandler = function(playerid,cmdDetails,selected){
            var page = cmdDetails.details.page,
                settings = {
                    location : cmdDetails.details.location,
                    linkLocation : cmdDetails.details.linkLocation,
                    chat : cmdDetails.details.chat
                },
                tokens = _.map(cmdDetails.players,(p)=>{return getObj('graphic',p)}),
                who = idToDisplayName(playerid);
            tokens = _.reject(tokens,(t)=>{return _.isUndefined(t)});
            _.each(selected,(s)=>{
                var object = findObjs({id:s._id})[0];
                 if(object.get('type')==='graphic' && cmdDetails.players.length===0){
                    tokens.push(object);
                }else if(object.get('type')==='path' && cmdDetails.details.polygon){
                    settings.polygon = settings.polygon || [];
                    settings.polygon.push(object.id);
                }
            });
            
            if(tokens.length>0 && (settings.polygon || settings.location || settings.linkLocation || settings.chat || page)){
                setToken(tokens,settings,page);
            }else if(tokens.length>0){
                outputSetup(who,tokens);
            }else{
                sendChat('Page Navigator','/w "'+who+'" You attempted to activate the Destination Token Wizard. This wizard requires that you have a destination token(s) selected when you activate the wizard.',null,{noarchive:true});
            }
        },
        
        /*Self-explanatory, but handles chat input. Also passes the access of the user*/
        handleInput = function(msg_orig){
            var msg = _.clone(msg_orig),
                cmdDetails,
                args,
                access;
                
            if (msg.content.indexOf('!nav')!==0 || msg.playerid==='API') {
                return;
            }
            
            if(playerIsGM(msg.playerid)) {
                access = 'gm';
            }else if(!playerIsGM(msg.playerid)){
                access = 'player';
            }
            
            args = msg.content.split(/\s+--/);
            args.shift();
            if(args.length===0){
                help(msg.playerid);
            }
            
            _.each(args,(a)=>{
                cmdDetails = cmdExtract(a);
                switch(cmdDetails.action){
                    case 'upgrade':
                        state.PAGENAVIGATOR.upgrade = true;
                        checkInstall();
                        break;
                    case 'help':
                        help(msg.playerid);
                        break;
                    case 'move' || 'teleport':
                        moveHandler(cmdDetails,msg.playerid,msg.selected,access);
                        break;
                    case 'config':
                        if(access==='gm'){
                            configHandler(msg.playerid,cmdDetails);
                        }else{
                            //message to player that configuration options are GM only
                        }
                        break;
                    case 'setup':
                        if(access==='gm'){
                            setupHandler(msg.playerid,cmdDetails,msg.selected);
                        }
                        break;
                    default:
                        help(msg.playerid);
                }
            });
        },
          
        cmdExtract = function(cmd){
            var cmdSep = {
                details:{}
            },
            vars,
            details;
            cmdSep.players = cmd.split('|');
            details = cmdSep.players.shift();
            cmdSep.players=_.map(cmdSep.players,(t)=>{
                return t.trim();
            });
            cmdSep.action = details.match(/config|help|move|teleport|setup|upgrade/);
            if(cmdSep.action){
                cmdSep.action = cmdSep.action[0];
            }
            _.each(details.replace(cmdSep.action+',','').split(','),(d)=>{
                vars=d.match(/(folder|access|control|dMarker|update|page|pageID|pMarker|teleport|tokens|remove|landing|location|linkLocation|chat|polygon|token)(?:\:|=)([^,]+)/) || null;
                if(vars){
                    cmdSep.details[vars[1]]=vars[2];
                }else{
                    cmdSep.details[d]=d;
                }
            });
            return cmdSep;
      	},
      	
        destroyHandler = function(obj){
            var index, pIDs;
            switch(obj.get('type')){
                case 'page':
                    maps[obj.id]=undefined;
                    _.each(allFolders,(f)=>{
                        f = _.reject(f,(ids)=>{
                            return ids===obj.id;
                        });
                    });
                    allPages=_.reject(allPages,(p)=>{
                        return p.id===obj.id;
                    });
                    break;
                case 'graphic':
                    if(obj.get('layer')==='objects'){
                        _.each(maps[obj.get('pageid')],(m)=>{
                            if(_.contains(m.object,obj.id)){
                                index = m.object.indexOf(obj.id);
                                m.object = _.reject(m.object,(o)=>{
                                    o === obj.id;
                                })
                            }
                        });
                    }else if(obj.get('layer')==='gmlayer'||obj.get('layer')==='map'){
                        if(_.contains(state.PAGENAVIGATOR.destinationids,obj.id)){
                            destTokens[obj.get('pageid')] = _.reject(destTokens[obj.get('pageid')],(o)=>{
                                return o.token.id===obj.id;
                            });
                        }
                    }
                    break;
                case 'character':
                    pIDs = obj.get('controlledby').split(',');
                    _.each(pIDs,(id)=>{
                        if(_.contains(state.PAGENAVIGATOR.players[id],obj.id)){
                            index = state.PAGENAVIGATOR.players[id].indexOf(obj.id);
                            state.PAGENAVIGATOR.players[id].splice(index,1);
                        }
                    });
                    break;
                case 'player':
                    players = _.reject(players,(p)=>{
                        return p.id === obj.id;
                    });
                    state.PAGENAVIGATOR.players[obj.id]=undefined;
                    playerTokens[obj.id]=undefined;
                    break;
                //end of switch
      	    }
      	},
      	
      	changeHandler = function(obj,prev){
            var oldpIDs,newpIDs,index;
            switch(obj.get('type')){
                case 'graphic':
                    //object layer
                    if(obj.get('layer')==='objects' && (obj.get('left')!==prev.left || obj.get('top')!== prev.top || obj.get('width')!==prev.width || obj.get('height')!==prev.height || obj.get('layer')!==prev.layer)){
                        getDestinationCollisions(obj);
                    //gm or map layer
                    }
                    break;
                case 'page':
                    if(obj.get('name')!==prev.width){
                        loadFolders(obj);
                        storeFolders();
                    }
                    break;
                case 'character':
                    if(obj.get('controlledby')!==prev.controlledby){
                        oldpIDs = obj.get('controlledby').split(',');
                        newpIDs = prev.controlledby.split(',');
                        oldpIDs = _.filter(oldpIDs,(oid)=>{
                            return (!_.contains(newpIDs,oid));
                        });
                        _.each(oldpIDs,(oid)=>{
                            state.PAGENAVIGATOR.players[oid] = _.reject(state.PAGENAVIGATOR.players[oid],(p)=>{
                                return p === obj.id;
                            });
                        });
                    }
                    break;
            }
      	},
      	
      	addHandler = function(obj){
            switch(obj.get('type')){
                case 'graphic':
                    if(obj.get('layer')==='gmlayer'){
                        loadDests(getObj('page',obj.get('pageid')));
                    }
                    break;
                case 'page':
                    mapPage(obj);
                    loadfolders(obj);
                    storeFolders();
                    break;
                case 'player':
                    state.PAGENAVIGATOR.players[obj.id]=[];
                    loadPlayers();
                    break;
                //add Player add handling
      	    }
      	},
          
        RegisterEventHandlers = function() {
            //message handling
            on('chat:message', handleInput);
            
            //graphic handling
            on('add:graphic',addHandler);
            on('change:graphic', changeHandler);
            on('destroy:graphic',destroyHandler);
            
            //character handling
            on('add:character',addHandler);
            on('change:character',changeHandler);
            on('destroy:character',destroyHandler);
            
            //page handling
            on('add:page',addHandler);
            on('change:page',changeHandler);
            on('destroy:page',destroyHandler);
            
            //player handling
            on('add:player',addHandler);
            on('destroy:player',destroyHandler);
        };
          
        return {
            CheckInstall: checkInstall,
          	RegisterEventHandlers: RegisterEventHandlers
      	};
    }());
      
    on("ready",function(){
        'use strict';
        
        PAGENAVIGATOR.CheckInstall();
        PAGENAVIGATOR.RegisterEventHandlers();
    });
