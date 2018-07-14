/*
Roll20AM script:
Author: Scott C.
Contact: https://app.roll20.net/users/459831/scott-c
Thanks to: The Aaron, Arcane Scriptomancer and Stephen S. for their help Alpha and Beta Testing this script.  Recent modifications by Victor B.
*/

var Roll20AM = Roll20AM || (function() {
    'use strict';

    var version = '2.08',
        lastUpdate = 1491352004,
        schemaVersion = 2.01,
        debug = false,
        displayTrack = false,
        helpLink,
        delays = [],
        defaults = {
            css: {
                button: {
               //'border-radius': '1em',
                    'background-color': '#006dcc',
                    'margin': '0px',
                    'font-weight': 'bold',
                    'padding': '-5px',
                    'color': 'white',
                    'border-style':'none'
                }
            }
        },
        templates = {},
        playImage = '4',
        stopImage = '6',
        tagImage = '3',
        noTagImage = 'd',
        deleteImage = 'D',
        shuffleImage = ';',
        randomImage = '?',
        togetherImage = 'J',
        loopImage = 'r',
        singleImage = '1',
        lockImage = ')',
        unlockImage = '(',
        backImage = 'y',
        fadeInImage = '7',
        fadeOutImage = '8',
        decreaseImage = '<',
        increaseImage = '>',
        
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

     HE = (function(){
        const esRE = (s) => s.replace(/(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$|\-|\:)/g,'\\$1');
        const e = (s) => `&${s};`;
        const entities = {
            '<' : e('lt'),
            '>' : e('gt'),
            "'" : e('#39'),
            '@' : e('#64'),
            '{' : e('#123'),
            '|' : e('#124'),
            '}' : e('#125'),
            '[' : e('#91'),
            ']' : e('#93'),
            '"' : e('quot'),
            '-' : e('#45'),
            ':' : e('#58'),
            '.' : e('#46')
        };
        const re = new RegExp(`(${Object.keys(entities).map(esRE).join('|')})`,'g');
        return (s) => s.replace(re, (c) => (entities[c] || c) );
    })(),
    
    checkInstall = function() {
        log('-=> Roll20AM v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
        if( ! _.has(state,'Roll20AM') || state.Roll20AM.version !== schemaVersion) {
            state.Roll20AM=state.Roll20AM || {};
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.Roll20AM.version = schemaVersion;
		}
		initialize();
		if(!state.Roll20AM.help || !getObj('handout',state.Roll20AM.help)){
		    if(findObjs({type:'handout',name:'Roll20AM'})[0]){
		        state.Roll20AM.help = findObjs({type:'handout',name:'Roll20AM'})[0].id;
		    }else{
		        state.Roll20AM.help = createObj('handout',{
		            name:'Roll20AM',
		            inplayerjournals:'all',
		            archived:true
		        }).id;
		    }
		}
        log('  >Roll20AM has had a significant update. The command syntax has changed and any currently existing macros will need to be updated. Please check the **[forum thread](permalink to your release post)**');
		log('  >Stored settings loaded<');
//		storeTracks();
//		log('  >Tracks updated<');
		generateHelp();
		log('  >Help handout updated<');
		buildTemplates();
		helpLink = 'https://journal.roll20.net/handout/'+state.Roll20AM.help;
    },
    
    initialize = function(){
        state.Roll20AM={
            trackDetails:state.Roll20AM.trackDetails || {},/*object index by track id containing These properties:
                                                            volume: the tracks individual volume; is multiplied by the masterVolume to set the jukebox volume
                                                            delays: number of unresolved delays involving this track*/
            playLists:state.Roll20AM.playLists || {},/*Object of objects with the following properties indexed by playlist name
                                                            name: the name of the playlist
                                                            trackids: array of the trackids of tracks in this playlist
                                                            playing:true/false
                                                            mode: one of 'shuffle', 'trueRandom', 'together', single, or through (default is single). Null indicates the playlist should play in the default behavior of straight through
                                                            currentTrack:Array of the tracks this playlist is currently playing
                                                            shuffleids:Array of tracks ordered randomly
                                                            lastTrack:String containing the id of the last track to be played
                                                            delays:The number of times this playlist has been delayed. Incremented in handleInput, decremented in delayHandler. Actions are not completed if there are no delays to support them.
                                                            access:String defining whether the playlist is player accessible or not. 'gm' or 'player'*/
            masterVolume:state.Roll20AM.masterVolume || 50,//The mastervolume, all volumes are multiplied by this before being applied to the actual track. Maximum/Minimum volume levels applicable to tracks are 0-100, the multiplied final volume is set to the boundary if it is outside the range.
            fadeVolumeUp:state.Roll20AM.fadeVolumeUp || 50,//The fadevolume while increasing volume.  Default desired volume level. 
            fadeVolumeDown:state.Roll20AM.fadeVolumeDown || 0,//The fadevolume while decreasing volume.  Default desired volume level.
            fadeTime:state.Roll20AM.fadeTime || 10,//The default time to reach desired level in seconds
            delay:state.Roll20AM.delay || 0,//The default delay time in seconds.
            restrict:state.Roll20AM.restrict || 'on',//Whether player restrictions are on or not, string that will be either 'on' or 'off'
            API:state.Roll20AM.API || 'gm',//String denoting how API messages are treated. Either 'gm' or 'player'
            tag:state.Roll20AM.tag || '-players-',//the player access tag that should be appended to tracks that are player accessible
            menu:state.Roll20AM.menu

        };
    },

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
                '}) %> href="<%= command %>"><%= label %></a>'
        );
    },    
    makeImageButton = function(command, image, toolTip, backgroundColor,size){
        return '<a href="'+command+'" title= "'+toolTip+'" style="margin:0;padding:1px;background-color:'+backgroundColor+'"><span style="color:black;padding:0px;font-size:'+size+'px;font-family: \'Pictos\'">'+image+'</span></a>'
    },
    makeTextButton = function(command, label, backgroundColor, color){
        return '<a href="'+command+'" style="margin:0;border: 0;background-color:'+backgroundColor+'"><span style="font-style:bold;color:'+color+'">'+label+'</span></a>'
    },   
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
    outputConfig = function(menu,who,filter){
        var mvTextButton,tracksButton,playlistButton,restrictButton,volumeButton,muteButton,playButton,addButton,increaseButton,decreaseButton,fadeInButton,tagButton,
        deleteButton,APIButton,tagButton,templateButton,commandButton,rollButton,textButton,accessButton,modeButton,importButton,backButton,fadeOutButton,tagDeleteButton,
        output = '/w gm <div style="border: 1px solid black; background-color: white; padding: 3px 3px;margin-top:20px">'
        +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 100%;style="float:left;">';
        if (debug){
            log('Output Config:'+menu)
        }    
        if (menu){
            if (menu == 'tracks'){
                output += ' Roll20 AM('+version+')<b> Tracks</b></div>';
                 _.each(state.Roll20AM.trackDetails,(track)=>{
                    output += outputTrack(track,menu)
                });    
                backButton = makeImageButton('!roll20AM --config',backImage,'Return to Config','transparent');
                output += '<div style="float:right;display:inline-block;margin-top:5px">'+backButton+'</div>';
                output += '</div>';
            }else if (menu == 'tags'){
                output += ' Roll20 AM('+version+')<b> Tags</b></div>';
                 _.each(state.Roll20AM.playLists,(list)=>{ 
                    if (list.name == 'Tag1' || list.name == 'Tag2' || list.name == 'Tag3' || list.name == "Tag4"){
                        output += outputList(list,list.name,'tags')
                    }    
                });           
                backButton = makeImageButton('!roll20AM --config',backImage,'Return to Config','transparent');
                output += '<div style="float:right;display:inline-block;margin-top:5px">'+backButton+'</div>';
                output += '</div>';                
            }else if (menu == 'playlists'){
                output += ' Roll20 AM('+version+')<b> Playlists</b></div>';
                _.each(state.Roll20AM.playLists,(list)=>{ 
                    if (list.name != 'Tag1' && list.name != 'Tag2' && list.name != 'Tag3' && list.name != "Tag4"){
                        output += outputList(list,list.name,'playlists')
                    }    
                });
                backButton = makeImageButton('!roll20AM --config',backImage,'Return to Setup','transparent');
                output += '<div style="float:right;display:inline-block;margin-top:5px">'+backButton+'</div>';
                output += '</div>';
            }else if(state.Roll20AM.playLists[menu]){
                output += ' Roll20 AM('+version+')<b>'+menu+' Playlist</b></div>';
                _.each(state.Roll20AM.playLists[menu].trackids,(t)=>{
                    var track = getTrackDetails(t);
                    output += outputTrack(track,menu,menu)
                });    
                if (menu == 'Tag1' || menu == 'Tag2' || menu == 'Tag3' || menu == 'Tag4'){
                    backButton = makeImageButton('!roll20AM --config,menu=tags',backImage,'Return to Tags','transparent');
                }else{    
                    backButton = makeImageButton('!roll20AM --config,menu=playlists',backImage,'Return to Playlists','transparent');
                }
                output += '<div style="float:right;display:inline-block;margin-top:5px">'+backButton+'</div>';
                output += '</div>';
            }
        }else{
            output += ' Roll20 AM (' +version+ ') - <b> Setup</b></div><div style="padding-left:10px;margin-bottom:3px;">';
            //Master Volume Control
            mvTextButton = makeButton('!roll20AM --edit,volume,level=?{Volume Level (0-100)|'+state.Roll20AM.masterVolume+'} --config',state.Roll20AM.masterVolume+'%','white','black');
            output += '<b>Master Volume: </b><div style="display:inline-block">'+mvTextButton+'</div><br>';
            //Fade Time
            mvTextButton = makeButton('!roll20AM --edit,fade,time,level=?{Fade Time (Seconds) (0-200)|'+state.Roll20AM.fadeTime+'} --config',state.Roll20AM.fadeTime+' (Seconds)','white','black');
            output += '<b>Fade Time: </b><div style="display:inline-block">'+mvTextButton+'</div><br>';     
            //Delay Time
            mvTextButton = makeButton('!roll20AM --edit,delayed,level=?{Delayed (Seconds) (0-200)|'+state.Roll20AM.delay+'} --config',state.Roll20AM.delay+' (Seconds)','white','black');
            output += '<b>Delayed: </b><div style="display:inline-block">'+mvTextButton+'</div><br>';     
            //Playlists
            playlistButton = makeButton('!roll20AM --config,menu=playlists','Playlists','white','black');
            output += '<div>'+playlistButton+'</div>';
            //Tracks
            tracksButton = makeButton('!roll20AM --config,menu=tracks','Tracks','white','black');
            output += '<div>'+tracksButton +'</div>';
            //Tags
            tracksButton = makeButton('!roll20AM --config,menu=tags','Tags','white','black');
            output += '<div>'+tracksButton +'</div>';            
            //Tracks
            tracksButton = makeButton('!roll20AM --audio,stop|','Stop All Tracks','white','black');
            output += '<div>'+tracksButton +'</div>';            
            //Import Jukebox
            importButton = makeButton('!roll20AM --config,import','Import Jukebox','white','black');
            output += '<div>'+importButton+'</div>';
            //Import Jukebox
            importButton = makeButton('!roll20AM --config,remove','Remove All','white','black');
            output += '<div>'+importButton+'</div>';                    
            //ends the padding div begun before listenButton
            output += '</div>';   
        }
        //ends the first div
        output += '<div style="margin-bottom:30px;">'  
        output += '</div>';
        if (state.Roll20AM.menu != 'nomenu'){
            sendChat(who,output,null,{noarchive:true});
        }    
    },
    //output each individual track.  Called from menus above
    outputTrack = function(track,menu){
        var title = track.title.split('by'),output,accessButton,playButton,modeButton,increaseButton,decreaseButton,fadeButton,fadeOutButton,fadeInButton,playlistButton,tagButton,deleteButton,mvTextButton
        if (track.playing){
            output = '<div style="background-color:#33cc33;width:100%;padding:2px;font-style:bold;color:white">'+title[0]+'</div>'  
        }else{
            output = '<div style="background-color:#ff5050;width:100%;padding:2px;font-style:bold;color:white">'+title[0]+'</div>' 
        }
        //Access Toggle
        if(track.access === 'gm'){
            accessButton = makeImageButton('!roll20AM --edit,access,player|'+encodeURIComponent(track.title)+' --config,menu='+menu,unlockImage,'Set List Access to player','transparent',15);
        }else{
            accessButton = makeImageButton('!roll20AM --edit,access,gm|'+encodeURIComponent(track.title)+' --config,menu='+menu,lockImage,'Set List Access to gm only','transparent',15);
        }                        
        //Play Toggle
        if(track.playing){
            playButton = makeImageButton('!roll20AM --audio,stop|'+encodeURIComponent(track.title)+' --config,menu='+menu,stopImage,'Stop Track','transparent',15);
        }else{
            playButton = makeImageButton('!roll20AM --audio,play|'+encodeURIComponent(track.title)+' --config,menu='+menu,playImage,'Play Track','transparent',15);
        }
        //Shuffle Toggle
        if (track.mode == "single" ){  
            modeButton = makeImageButton('!roll20AM --edit,mode,loop|'+encodeURIComponent(track.title)+' --config,menu='+menu,singleImage,'Set the playlist playmode; currently single','transparent',15);
        }else if (track.mode == "loop" ){
            modeButton = makeImageButton('!roll20AM --edit,mode,single|'+encodeURIComponent(track.title)+' --config,menu='+menu,loopImage,'Set the playlist playmode; currently loop','transparent',15);
        }
        //Track Increase Button
        increaseButton = makeImageButton('!roll20AM --audio,increase|'+encodeURIComponent(track.title)+' --config,menu='+menu,increaseImage,'Increase Volume','transparent',15);
        //Track Decrease Button
        decreaseButton = makeImageButton('!roll20AM --audio,decrease|'+encodeURIComponent(track.title)+' --config,menu='+menu,decreaseImage,'Decrease Volume','transparent',15);
        //Track Decrease Button
        deleteButton = makeImageButton('!roll20AM --edit,remove|'+encodeURIComponent(track.title)+' --config,menu='+menu,deleteImage,'Delete Track','transparent',15);
        //Fade Out Button
        if (track.playing){
            fadeButton = makeImageButton('!roll20AM --audio,fade,out|'+encodeURIComponent(track.title),fadeOutImage,'Fade Out','transparent',15);                       
        }else{
            fadeButton = makeImageButton('!roll20AM --audio,fade,in|'+encodeURIComponent(track.title)+' --config,menu='+menu,fadeInImage,'Fade In','transparent,15');    
        }
        //Track Volume Control
        mvTextButton = makeButton('!roll20AM --edit,volume,level=?{Volume Level (0-100)|'+track.volume+'}|'+encodeURIComponent(track.title)+' --config,menu='+menu,track.volume+'%','white','black');
        playlistButton = '<div style="display:inline-block;font-size:10px;margin-right:3px"><b>Vol:</b>'+mvTextButton+'</div>';
        //Track Fade Time
        mvTextButton = makeButton('!roll20AM --edit,fade,time,level=?{Fade Time in Seconds (0-200)|'+track.fadetime+'}|'+encodeURIComponent(track.title)+' --config,menu='+menu,track.fadetime,'white','black');
        playlistButton += '<div style="display:inline-block;font-size:10px;margin-right:3px"><b>Fade Time:</b>'+mvTextButton+'</div>';  
        //Track Delay Time
        mvTextButton = makeButton('!roll20AM --edit,delayed,level=?{Delay Time in Seconds (0-200)|'+track.delay+'}|'+encodeURIComponent(track.title)+' --config,menu='+menu,track.delay,'white','black');
        playlistButton += '<div style="display:inline-block;font-size:10px"><b>Delayed:</b>'+mvTextButton+'</div>';          
  
         //Tags
        if (track.tags[0] == 'On'){
            tagButton = '<div style="font-size:80%;line-height:1em;display:inline-block;">1</div>'+makeImageButton('!roll20AM --edit,unset,tag1|'+encodeURIComponent(track.title)+' --config,menu='+menu,tagImage,'Assigned to Tag1','transparent',10);
        }else{
            tagButton = '<div style="font-size:80%;line-height:1em;display:inline-block;">1</div>'+makeImageButton('!roll20AM --edit,set,tag1|'+encodeURIComponent(track.title)+' --config,menu='+menu,noTagImage,'Not Assigned to Tag1','transparent',10);
        }  
        if (track.tags[1] == 'On'){
            tagButton += '<div style="font-size:80%;line-height:1em;display:inline-block;">2</div>'+makeImageButton('!roll20AM --edit,unset,tag2|'+encodeURIComponent(track.title)+' --config,menu='+menu,tagImage,'Assigned to Tag2','transparent',10);
        }else{
            tagButton += '<div style="font-size:80%;line-height:1em;display:inline-block;">2</div>'+makeImageButton('!roll20AM --edit,set,tag2|'+encodeURIComponent(track.title)+' --config,menu='+menu,noTagImage,'Not Assigned to Tag2','transparent',10);
        }     
        if (track.tags[2] == 'On'){
            tagButton += '<div style="font-size:80%;line-height:1em;display:inline-block;">3</div>'+makeImageButton('!roll20AM --edit,unset,tag3|'+encodeURIComponent(track.title)+' --config,menu='+menu,tagImage,'Assigned to Tag2','transparent',10);
        }else{
            tagButton += '<div style="font-size:80%;line-height:1em;display:inline-block;">3</div>'+makeImageButton('!roll20AM --edit,set,tag3|'+encodeURIComponent(track.title)+' --config,menu='+menu,noTagImage,'Not Assigned to Tag2','transparent',10);
        }     
        if (track.tags[3] == 'On'){
            tagButton += '<div style="font-size:80%;line-height:1em;display:inline-block;">4</div>'+makeImageButton('!roll20AM --edit,unset,tag4|'+encodeURIComponent(track.title)+' --config,menu='+menu,tagImage,'Assigned to Tag2','transparent',10);
        }else{
            tagButton += '<div style="font-size:80%;line-height:1em;display:inline-block;">4</div>'+makeImageButton('!roll20AM --edit,set,tag4|'+encodeURIComponent(track.title)+' --config,menu='+menu,noTagImage,'Not Assigned to Tag2','transparent',10);
        }     
        
        //Put it all together
        output+=playlistButton+'<div>'+playButton+' '+fadeButton+' '+decreaseButton+' '+increaseButton+' '+modeButton+' '+accessButton+' '+deleteButton +'<div style="display:inline-block;float:right;font-size:80%;">'+tagButton+'</div></div>'
        output+='<div style="margin-top:5px"></div>'
        return output;
    },
    outputList = function(list,menu,mainMenu){  
       var output,accessButton,playButton,modeButton,increaseButton,decreaseButton,fadeButton,fadeOutButton,fadeInButton,playlistButton,tagButton,deleteButton,mvTextButton    
       if(list.playing){
            playlistButton = '<div style="background-color:#33cc33;width:99%">'+makeTextButton('!roll20AM --config,menu='+menu,list.name,'transparent','white')+'</div>';                        
        }else{    
            playlistButton = '<div style="background-color:#ff5050;width:99%">'+makeTextButton('!roll20AM --config,menu='+menu,list.name,'transparent','white')+'</div>';                        
        }
        //Access Toggle
        if(list.access === 'gm'){
            accessButton = makeImageButton('!roll20AM --edit,access,player|'+encodeURIComponent(list.name)+' --config,menu='+mainMenu,unlockImage,'Set List Access to player','white',15);
        }else{
            accessButton = makeImageButton('!roll20AM --edit,access,gm|'+encodeURIComponent(list.name)+' --config,menu='+mainMenu,lockImage,'Set List Access to gm only','white',15);
        }
        //Play Toggle
        if(list.playing){
            playButton = makeImageButton('!roll20AM --audio,stop|'+encodeURIComponent(list.name)+' --config,menu='+mainMenu,stopImage,'Stop Playlist','white',15);
        }else{
            playButton = makeImageButton('!roll20AM --audio,play|'+encodeURIComponent(list.name)+' --config,menu='+mainMenu,playImage,'Play Playlist','white',15);
        }
        //Shuffle Toggle
        if (list.mode == "random"){
            modeButton = makeImageButton('!roll20AM --edit,mode,shuffle|'+encodeURIComponent(list.name)+' --config,menu='+mainMenu,randomImage,'Set the playlist playmode; currently random','white',15);
        }else if (list.mode == "shuffle" ){  
            modeButton = makeImageButton('!roll20AM --edit,mode,single|'+encodeURIComponent(list.name)+' --config,menu='+mainMenu,shuffleImage,'Set the playlist playmode; currently shuffled','white',15);
        }else if (list.mode == "single" ){  
            modeButton = makeImageButton('!roll20AM --edit,mode,loop|'+encodeURIComponent(list.name)+' --config,menu='+mainMenu,singleImage,'Set the playlist playmode; currently single','white',15);
        }else if (list.mode == "loop" ){
            modeButton = makeImageButton('!roll20AM --edit,mode,together|'+encodeURIComponent(list.name)+' --config,menu='+mainMenu,loopImage,'Set the playlist playmode; currently loop','white',15);
        }else{
            modeButton = makeImageButton('!roll20AM --edit,mode,random|'+encodeURIComponent(list.name)+' --config,menu='+mainMenu,togetherImage,'Set the playlist playmode; currently together','white');
        }
        //Increase Button
        increaseButton = makeImageButton('!roll20AM --audio,increase|'+encodeURIComponent(list.name)+' --config,menu='+mainMenu,increaseImage,'Increase Volume','white',15);
        //Decrease Button
        decreaseButton = makeImageButton('!roll20AM --audio,decrease|'+encodeURIComponent(list.name)+' --config,menu='+mainMenu,decreaseImage,'Decrease Volume','white',15);
        //Decrease Button
        deleteButton = makeImageButton('!roll20AM --edit,remove|'+encodeURIComponent(list.name)+' --config,menu='+mainMenu,deleteImage,'Delete Playlist','white');
        //Fade Button
        if (list.playing){
            fadeButton = makeImageButton('!roll20AM --audio,fade,out|'+encodeURIComponent(list.name)+' --config,menu='+mainMenu,fadeOutImage,'Fade Out','white',15);                       
        }else{
            fadeButton = makeImageButton('!roll20AM --audio,fade,in|'+encodeURIComponent(list.name)+' --config,menu='+mainMenu,fadeInImage,'Fade In','white',15);   
        }
        //Playlist Volume Control
        mvTextButton = makeButton('!roll20AM --edit,volume,level=?{Volume Level (0-100)|'+list.volume+'}|'+encodeURIComponent(list.name)+' --config,menu='+mainMenu,list.volume+'%','white','black');
        playlistButton += '<div style="display:inline-block;font-size:10px;margin-right:3px"><b>Vol:</b>'+mvTextButton+'</div>';
        //Playlist Fade Time
        mvTextButton = makeButton('!roll20AM --edit,fade,time,level=?{Fade Time in Seconds (0-200)|'+list.fadetime+'}|'+encodeURIComponent(list.name)+' --config,menu='+mainMenu,list.fadetime,'white','black');
        playlistButton += '<div style="display:inline-block;font-size:10px;margin-right:3px"><b>Fade Time:</b>'+mvTextButton+'</div>';  
        //Playlist Fade Time
        mvTextButton = makeButton('!roll20AM --edit,delayed,level=?{Delay Time in Seconds (0-200)|'+list.delay+'}|'+encodeURIComponent(list.name)+' --config,menu='+mainMenu,list.delay,'white','black');
        playlistButton += '<div style="display:inline-block;font-size:10px;"><b>Delayed:</b>'+mvTextButton+'</div>';          
        //Output of all of the above
        output = playlistButton+'<div style="float:center;">' +playButton+'  '+fadeButton+' '+decreaseButton+' '+increaseButton+' ' +modeButton+' '+accessButton+ ' ' +deleteButton + '</div>';
        output +='<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 90%;style="float:left;"></div>'   
        return output;
    },    
	//******************************************************************************************************************************
    //Handler Functions	
    // - RegisterEventHandlers drives this entire process.  These are events detected by roll20 outside of this script.  
    //    - chat message invokes inputHandler
    //    - Jukebox track finishes invokes changeHandler
    //    - Adding a new track to Jukebox updates state.Roll20AM 
    //    - Deleting a jukebox track updates state.Roll20AM
    // - inputHandler receives the Roll20AM command,parses it and processes it
    // - commandHandler processed input commands using setTimeout and Delay Time (if any)
    // - listHandler processes list related functions
    // - trackHandler processes track related functions
    // - editHandler processes list and track related edit functions
    // - configHandler processes configuration related functions, some send output to chat window
    //******************************************************************************************************************************   
    inputHandler = function(msg_orig) {
        //must be roll20AM to start all this
        if (msg_orig.content.indexOf('!roll20AM')!==0){
            return;
        }
        
        var msg = _.clone(msg_orig),cmdDetails,args,restrict,player,who
        
        if(state.Roll20AM.restrict==='off'||playerIsGM(msg.playerid) ||(msg.playerid==='API' && state.Roll20AM.API==='gm')){//If the gm has turned off player restrictions, or this is a gm, or it's an API generated message and the API is treated like a gm
            restrict = false;//set this run through of the script to not restrict access to tracks
        }else{
            restrict = true;//set this run through of the script to restrict access to tracks
        }
        if(msg.playerid==='API'){
            who = 'gm';//since we're going to be using who to determine who to send later chat messages to, it needs to be a valid option for /w. So, a generic "gm" will work for probably 95% of users
        }else{
            who = getObj('player', msg.playerid).get('displayname');
        }

		if(_.has(msg,'inlinerolls')){//calculates inline rolls
			msg.content = inlineExtract(msg);
		}
        //splits the message contents into discrete arguments
		args = msg.content.split(/\s+--/);
	    if(args[0] === '!roll20AM'){
            if(args[1]){
                _.each(_.rest(args,1),(cmd) =>{
                    //Extract Commands

                    cmdDetails = cmdExtract(cmd);
                    if (debug){
                        log(cmdDetails)
                    }

                    var tracklists=[],playlists=[],timer,list
                    
                    //cmdDetails.tracks holds tracks/playlists, everything after the |.  If playlist push into array
                    _.each(cmdDetails.tracks,(listName)=>{
                        if(state.Roll20AM.playLists[listName]){
                            playlists.push(listName);
                        };
                    });
                    //if track, pushing into array
                    _.each(cmdDetails.tracks,(trackTitle)=>{
                        if(state.Roll20AM.trackDetails[trackTitle]){
                            tracklists.push(trackTitle);
                        };
                    });   
                    if (debug){
                        log('Input Handler Action:' + cmdDetails.action)
                    }   
                    if (cmdDetails.details.nomenu){
                        state.Roll20AM.menu = cmdDetails.details.nomenu
                    }
                    //prevent players from doing things they shouldn't.  Playlist level actions and edit commands
                    if (restrict){
                        if (cmdDetails.action == 'edit' ){
                            sendChat(who,'Invalid Roll20AM Command. Restricted action not allowed by a player.',null,{noarchive:true});  
                            return;
                        }    
                    }  
                    commandHandler(cmdDetails,playlists,tracklists,restrict,who)
                })    
            }
    	}
	},  
	//Processes the commands based on Delay Time (if any)
	commandHandler = function(cmdDetails,playlists,tracklists,restrict,who){
	    if (debug){
	        log ('Command Handler')
	    }
	    setTimeout(function(){
            if (cmdDetails.action == 'audio'){
                if (playlists.length > 0){
                    _.each(playlists,(listName)=>{
                        listHandler(cmdDetails,getPlayList(listName),who,restrict);
                    });
                }
                if (tracklists.length > 0){
                    _.each(tracklists,(trackTitle)=>{
                        trackHandler(cmdDetails,getTrackDetails(getTrackID(trackTitle)),who,restrict);
                    });     
                }
                if (cmdDetails.details.stop){
                    if (playlists.length == 0 && tracklists.length == 0){
                        stopAll(who)
                    }
                }
            //edit commands    
            }else if (cmdDetails.action == 'edit'){
                if (playlists.length > 0){
                    _.each(playlists,(listName)=>{
                        editHandler(cmdDetails,getPlayList(listName),null,who,restrict)
                    });  
                }
                if (tracklists.length > 0){
                    _.each(tracklists,(trackTitle)=>{
                        editHandler(cmdDetails,null,getTrackDetails(getTrackID(trackTitle)),who,restrict)
                    });  
                }                        
                if (tracklists.length == 0 && playlists.length == 0 ){
                    editHandler(cmdDetails,null,null,who,restrict)
                } 
            //config commands    
            }else if (cmdDetails.action == 'config'){  
                configHandler(cmdDetails,who,restrict)
            }else{
                sendChat(who,'Invalid Roll20AM Command.  Valid commands are --audio, --edit, --config',null,{noarchive:true});
            } 	
	    },cmdDetails.details.delay)
	},
	//Extracts inline rolls
	inlineExtract = function(msg){
	    return _.chain(msg.inlinerolls)
				.reduce(function(m,v,k){
					m['$[['+k+']]']=v.results.total || 0;
					return m;
				},{})
				.reduce(function(m,v,k){
					return m.replace(k,v);
				},msg.content)
				.value();
	},
    //Extracts the command details from a command string passed from handleInput	
	cmdExtract = function(cmd){
	    var cmdSep = {
	        details:{}
	    },
	    vars,
	    raw,
	    tracks,
	    command,
	    details;
        if (debug){
            log('Command Extract')
            log('Command String:' + cmd)
        }    
        
        //split the commands from the tracks or playlists
        raw = cmd.split('|')
        command = raw[0];
        tracks = decodeURIComponent(raw[1]);
        
        //split multiple tracks into array
        if (tracks){
            tracks = tracks.split(',');
        }    
        if (debug){
            log('Command:' + command)
            log('Command Tracks:' + tracks)
        }
        
        cmdSep.tracks=_.map(tracks,(t)=>{
            return t.trim();
        });

        //find the action and set the cmdSep Action
	    cmdSep.action = command.match(/audio|config|edit/);
        //the ./ is an escape within the URL so the hyperlink works.  Remove it
        command.replace('./', '');
        //split additional command actions
	    _.each(command.replace(cmdSep.action+',','').split(','),(d)=>{
            vars=d.match(/(volTick|time|volume|delay|level|menu|mode|restrict|tag|API|access|tag|tag1|tag2|tag3|tag4|tag5|set|unset|filter|delayed|)(?:\:|=)([^,]+)/) || null;
            if(vars){
                cmdSep.details[vars[1]]=vars[2];
            }else{
                cmdSep.details[d]=d;
            }
        });

        cmdSep.details.delay = cmdSep.details.delay*1000 || 0;
        return cmdSep;
	},	
	//changeHandler invoked when a track finishes in Jukebox.  
	changeHandler = function(obj,prev){
	    var id, listFound = false, trackDetails
	    //we receive the track object from jukebox.  softstop is set to true upon finish
        if(obj.get('softstop')===true && prev.softstop === false){
            var trackDetails=getTrackDetails(obj.get('_id')),restrict

            if (debug){
                log('Change Handler')
                log('Track Finished:'+trackDetails.id)
            }    
            //find out of a playlist is currently playing
             _.each(state.Roll20AM.playLists,(list)=>{
                if(list.playing){
                    //check if this track in this playlist, if so, continue with playlist based on mode
                    if (list.currentTrack.indexOf(trackDetails.id) >= 0 ){
                        if (trackDetails.playing)
                        {
                            listFound = true
                            trackDetails.playing = false
                            if (debug){
                                log('Track Found in List:' + list.name)
                                log('List Mode:' + list.mode)
                            }
                            if (list.mode == 'loop'){
                                playListInOrder(list,null,trackDetails.who)
                            }
                            if (list.mode == 'random'){
                                playListRandom(list,null,trackDetails.who)
                            }
                            if (list.mode == 'shuffle'){
                                playListShuffle(list,null,trackDetails.who)
                            }            
                            if (list.mode == 'single'){
                                list.playing = false
                                outputConfig('playlists',trackDetails.who);
                            }                                 
                        }
                    }
                }     
            })
            
            // if track wasn't found in active playlist, set ROLL20AM state to not playing and output menu so icon changes from play to stop
            if (!listFound){
                trackDetails.playing = false;
                _.each(state.Roll20AM.playLists,list=>{
                    if (list.trackids.indexOf(trackDetails.id) >= 0){
                        list.playing = false
                    }
                })
                if (trackDetails.mode == 'loop'){
                    playTrack(trackDetails.id,trackDetails.volume,null,trackDetails.who)
                }else{
                    outputConfig(state.Roll20AM.menu,trackDetails.who);
                }    
            }    
        }    
	},	
    listHandler = function(cmdDetails,list,who,restrict){
        if (debug){
            log("List Handler Action:" + cmdDetails.action)
            log("List Handler List:" + list.name)
            log("List Handler Mode:" + list.mode)
        }
        
        if (restrict && list.access == 'gm'){
            sendChat(who,'Invalid Roll20AM Command. Restricted action not allowed by a player.',null,{noarchive:true});  
            return;
        }

        if (list.trackids.length == 0){
            sendChat(who,'Cannot launch Playlists.  No Tracks assigned.',null,{noarchive:true});
            return;
        }

        //play depending on mode 
        if (cmdDetails.details.play){
            if (list.mode == 'loop'){
                playListInOrder(list,null,who);
            }  
            if (list.mode == 'random'){
                playListRandom(list,null,who);
            }    
            if (list.mode == 'shuffle'){
                playListShuffle(list,null,who);
            }   
            if (list.mode == 'single'){
                playListInOrder(list,null,who);
            }   
            if (list.mode == 'together'){
                playListTogether(list,null,who);
            }               
        }else if (cmdDetails.details.stop){   
            stopList(list,who);
        }else if (cmdDetails.details.fade){
            if (cmdDetails.details.in){
                fadeListIn(list,who);
            }
            if (cmdDetails.details.out){
                fadeListOut(list,cmdDetails.details.nomenu,who); 
            }
        }else if (cmdDetails.details.increase){
            increaseList(list,who)
        }else if (cmdDetails.details.decrease){
            decreaseList(list,who)
        }else{
            showHelp(who);
        }
    },  
    // handles playlist actions, start/stop/fadein/fadeout
    trackHandler = function(cmdDetails,trackDetails,who,restrict){
        if (debug){
            log("Track Handler Action:" + cmdDetails.action)
            log("Track Handler Track:" + trackDetails.title)
            log("Track Handler Mode:" + trackDetails.mode)
        }    

        if (restrict && trackDetails.access == 'gm'){
            sendChat(who,'Invalid Roll20AM Command. Restricted action not allowed by a player.',null,{noarchive:true});  
            return;
        }        
        //play depending on mode 
        if (cmdDetails.details.play){
            if (trackDetails.mode == 'loop'){
                playTrack(trackDetails.id,trackDetails.volume,'loop',who);
            }  
            if (trackDetails.mode == 'single'){
                playTrack(trackDetails.id,trackDetails.volume,null,who);
            }
        }    
        if (cmdDetails.details.stop){   
            if (cmdDetails.details.ignore){
                
            } else { 
                stopTrack(trackDetails.id,who);
            }   
        }
        if (cmdDetails.details.fade){
            if (cmdDetails.details.in){
                fadeInTrack(trackDetails.id,trackDetails.volume,trackDetails.fadetime,who)
            } else if (cmdDetails.details.out){
                fadeOutTrack(trackDetails.id,trackDetails.volume,0,trackDetails.fadetime,cmdDetails.details.nomenu,who)
            } 
        }
        if (cmdDetails.details.increase){
            increaseTrack(trackDetails.id,who)
        } 
        if (cmdDetails.details.decrease){
          decreaseTrack(trackDetails.id,who)
        }        
    },      
    configHandler = function(cmdDetails,who,restrict){
        if (debug){
            log("Config Handler Action:" + cmdDetails.action)
        }       
        if (cmdDetails.details.import && !restrict){
            importJukebox(who);
        }else if (cmdDetails.details.remove && !restrict){
            removeJukebox(who);
        }else {            
            state.Roll20AM.menu = cmdDetails.details.menu
            outputConfig(cmdDetails.details.menu,who,cmdDetails.details.filter);
        }   
    },   
    editHandler = function(cmdDetails,list,trackDetails,who,restrict){
        var mode,access,tag1,tag2,tag3,tag4,tag5
        
        if (debug){
            log("Edit Handler Action:" + cmdDetails.action)
            if (list){
                log("Edit Handler List:" + list.name)
            }
            if (trackDetails){
                log("Edit Handler Track:" + trackDetails.title)
            }              
        }  
   
        if (cmdDetails.details.mode){
            if (cmdDetails.details.single){
               mode = cmdDetails.details.single
            } else if (cmdDetails.details.loop){
               mode = cmdDetails.details.loop
            } else if (cmdDetails.details.shuffle){
               mode = cmdDetails.details.shuffle
            } else if (cmdDetails.details.random){
               mode = cmdDetails.details.random
            } else {
               mode = cmdDetails.details.together
            }
        }   
        if (cmdDetails.details.set){
            if (cmdDetails.details.tag1){
                tag1 = 'On'
            }    
            if (cmdDetails.details.tag2){
                tag2 = 'On'
            }      
            if (cmdDetails.details.tag3){
                tag3 = 'On'
            }      
            if (cmdDetails.details.tag4){
                tag4 = 'On'
            }             
        }

        if (cmdDetails.details.unset){
            if (cmdDetails.details.tag1){
                tag1 = 'Off'
            }    
            if (cmdDetails.details.tag2){
                tag2 = 'Off'
            }      
            if (cmdDetails.details.tag3){
                tag3 = 'Off'
            }      
            if (cmdDetails.details.tag4){
                tag4 = 'Off'
            }
        }
        
        if (cmdDetails.details.access){
            if (cmdDetails.details.player){
                access = cmdDetails.details.player
            } else {
                access = cmdDetails.details.gm
            }
        }

        if (!list && !trackDetails){
            if (cmdDetails.details.volume){
                changeVolumeMaster(cmdDetails.details.level,who);
            }
            if (cmdDetails.details.delayed){
                changeDelayMaster(cmdDetails.details.level,who);
            }            
            if (cmdDetails.details.fade){
                if (cmdDetails.details.in){
                    changeFadeInMaster(cmdDetails.details.level,who);   
                }
                if (cmdDetails.details.out){
                    changeFadeOutMaster(cmdDetails.details.level,who); 
                }
                if (cmdDetails.details.time){
                    changeFadeTimeMaster(cmdDetails.details.level,who); 
                }
                if (cmdDetails.details.access){
                    edit(null,null,null,mode,access,who)
                }                 
            }
         }else if (list){
            if (cmdDetails.details.volume){
                changeVolumeList(list,cmdDetails.details.level,who);
            }
            if (cmdDetails.details.delayed){
                changeDelayList(list,cmdDetails.details.level,who);
            }            
            if (cmdDetails.details.mode){
                edit(list,null,null,mode,access,who)
            }
            if (cmdDetails.details.access){
                edit(list,null,null,mode,access,who)
            }            
            if (cmdDetails.details.remove){
                edit(list,null,cmdDetails.details.remove,null,null,who)
            }     
            if (cmdDetails.details.set){
                edit(list,null,cmdDetails.details.set,null,null,tag1,tag2,tag3,tag4,who)
            }     
            if (cmdDetails.details.unset){
                edit(list,null,cmdDetails.details.unset,null,null,tag1,tag2,tag3,tag4,who)
            }                 
            if (cmdDetails.details.fade){
                if (cmdDetails.details.in){
                    changeFadeInList(list,cmdDetails.details.level,who);     
                }
                if (cmdDetails.details.out){
                    changeFadeOutList(list,cmdDetails.details.level,who);  
                }
                if (cmdDetails.details.time){
                    changeFadeTimeList(list,cmdDetails.details.level,who); 
                }                
            }
         }else if (trackDetails){
            if (cmdDetails.details.volume){
                changeVolumeTrack(trackDetails.id,cmdDetails.details.level,who);
            }
            if (cmdDetails.details.delayed){
                changeDelayTrack(trackDetails.id,cmdDetails.details.level,who);
            }            
            if (cmdDetails.details.mode){
                edit(null,trackDetails.id,null,mode,access,who)
            }   
            if (cmdDetails.details.access){
                edit(null,trackDetails.id,null,mode,access,who)
            }   
            if (cmdDetails.details.remove){
                edit(null,trackDetails.id,cmdDetails.details.remove,mode,access,who)
            }               
            if (cmdDetails.details.unset){
                edit(null,trackDetails.id,cmdDetails.details.unset,null,null,tag1,tag2,tag3,tag4,who)
            }     
            if (cmdDetails.details.set){
                edit(null,trackDetails.id,cmdDetails.details.set,null,null,tag1,tag2,tag3,tag4,who)
            }                
            if (cmdDetails.details.fade){
                if (cmdDetails.details.in){
                    changeFadeInTrack(trackDetails.id,cmdDetails.details.level,who);     
                }
                if (cmdDetails.details.out){
                    changeFadeOutTrack(trackDetails.id,cmdDetails.details.level,who);  
                }
                if (cmdDetails.details.time){
                    changeFadeTimeTrack(trackDetails.id,cmdDetails.details.level,who); 
                }                
            }            
        }else{    
            showHelp(msg.playerid);
        }   
    },  
	//******************************************************************************
    //Common Functions
    //******************************************************************************       
	getPlayList = function(listName){
	    return state.Roll20AM.playLists[listName];
	},	
	getTrackDetails = function(trackID){
	    return _.findWhere(state.Roll20AM.trackDetails,{id:trackID});
	},
	getTrackID = function(trackTitle){
	    return state.Roll20AM.trackDetails[trackTitle].id;
	},	
	getJukeBox = function(trackID){
	    return getObj('jukeboxtrack',trackID);
	},    
	//******************************************************************************
    //Special - Stop all tracks
    //******************************************************************************      
	stopAll = function(who){
	    var jbTrack
	    if (debug){
	        log('Stopping All Tracks')
	    }
	    _.each(state.Roll20AM.playLists,(list)=>{
            if (list.playing){
                if (debug){
                    log('Stopping List:' + list)
                }
                list.playing = false;
                list.currentTrack = [];        
            }       
	    })    
        _.each(state.Roll20AM.trackDetails,(track)=>{
            if (track.playing){
                if (debug){
                    log('Stopping Track:' + track.id)
                }
                stopTrack(track.id,who)
            }    
        }); 
	},	
	//******************************************************************************
    //Audio Functions 	
    // - Play, Stop, Fade In, Fade Out, Increase, Decrease
    //    - Updates the List volume, Associated Tracks and JukeBox
    //    - state.Roll20AM.playlists, state.Roll20AM.tradkDetails
    //******************************************************************************    
    increaseList = function(list,who){
        var level
        
	    if (debug){
            log('Increase List:'+list.name)
	    }

        level = list.volume*1 + 5  
        list.volume = level;   
        
        _.each(list.trackids,(trackID)=>{
            increaseTrack(trackID,who)
        });    
    },	
    decreaseList = function(list,who){
	    if (debug){
	        log('Decreasing List Volume')
            log('Decrease List:'+list.name)
	    }
	    
        var newVolume, track

        newVolume = list.volume*1 - 5  
        list.volume = newVolume  
        
        _.each(list.trackids,(trackID)=>{
            decreaseTrack(trackID,who)
        });    
    },     
	fadeListIn = function(list,who){
	    if(debug){
    	    log('Fade List Name:' + list.name)
	    }
        //start the next track in playlist with a volume of 0, so we can fade  in
        if (list.mode == 'loop'){
            playListInOrder(list,0,who);
        }  
        if (list.mode == 'random'){
            playListRandom(list,0,who);
        }    
        if (list.mode == 'shuffle'){
            playListShuffle(list,0,who);
        }   
        if (list.mode == 'single'){
            playListInOrder(list,0,who);
        }   
        if (list.mode == 'together'){
            playListTogether(list,0,who);
        }  
        //refresh the list variable to get current playing track
        list = getPlayList(list.name);
        //fade in the track
        _.each(list.currentTrack,(trackID)=>{
            fadeInTrack(trackID,list.volume,list.fadetime,who)
        })   
	},
	fadeListOut = function(list,nomenu,who){
	    var trackDetails
        // verify that the list is actualy playing
        if(!list.playing){
            sendChat('Roll20AM','/w "'+who+'" In order to fade a list, it must be playing.',null,{noarchive:true})
            return;
        }
	    if(debug){
    	    log('Fade List Name:' + list.name)
	    }
	    list.playing = false
        //get current playing song(s) and fade out
        _.each(list.currentTrack,(trackID)=>{
            trackDetails = getTrackDetails(trackID)
            if (trackDetails.playing){
                fadeOutTrack(trackID,trackDetails.volume,0,trackDetails.fadetime,nomenu,who)
            }    
        })      
	},	
	//plays tracks in sequential order
	playListInOrder = function(list,startVolume,who){
	    if (debug){
            log('Playing List (In Order):'+list.name)
	    }
	    //Set list playing to true, used later to determine lists that are active
        list.playing = true;
        playNextTrack(list,list.trackids,startVolume,who)
	},  
	//plays tracks randomly
	playListRandom = function(list,startVolume,who){
	    if (debug){
            log('Playing Random List:'+list.name)
	    }

	    var trackID;
	    //Set list playing to true, used later to determine lists that are active.  Since random, we aren't tracking current played tracks
        list.playing = true;
        list.currentTrack = [];
        trackID = list.trackids[randomInteger(list.trackids.length)- 1]
        playNextTrack(list,[trackID],startVolume,who)
	},  
	//plays tracks randomly
	playListShuffle = function(list,startVolume,who){
	    if (debug){
            log('Playing Shuffle List:'+list.name)
	    }
	    //Set list playing to true, used later to determine lists that are active
        list.playing = true;
        if (list.shuffleIds.length == 0){
    	    if (debug){
    	        log('Creating Shuffle')
    	    }            
            //Copy trackids into shuffe tracks
            _.each(list.trackids,(t)=>{
                list.shuffleIds.push(t);
            });    
            //Use Durstenfeld method of shuffling list
            for (var i = list.shuffleIds.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = list.shuffleIds[i];
                list.shuffleIds[i] = list.shuffleIds[j];
                list.shuffleIds[j] = temp;
            }
        }  
        playNextTrack(list,list.shuffleIds,startVolume,who)
	},  
	//plays tracks randomly
	playListTogether = function(list,startVolume,who){
	    if (debug){
            log('Playing Together List:'+list.name)
	    }
	    var volume, trackID
	    //Set list playing to true, used later to determine lists that are active
        list.playing = true;
        //Set start volume
	    if (startVolume!=0){
	        volume = list.volume
	    }else{
	        volume = startVolume;
	    }
        if (debug){
            log('Start Volume:'+volume)
        }  
        //Play all songs at once.  Push all songs into currentTrack 
        _.each(list.trackids, (trackID) =>{
            list.currentTrack.push(trackID);
            playTrack(trackID,volume,null,who);
        }) 
	},  

	//stops the indicated tracks from playing
	stopList = function(list,who){
	    if (debug){
	        log('Stopping:' + list.name)
	    }
	    //stop list and clear current tracks
        list.playing = false;
        _.each(list.currentTrack,(trackID)=>{
            if (debug){
                log('Stopping:' + trackID)
            }
            stopTrack(trackID,who)
        }); 
        list.currentTrack = [];        
	},	
	//this takes input from one of the modes, find next track to play and plays it
	playNextTrack = function(list,listTracks,startVolume,who){
	    if (debug){
            log('Playing Next Track List:'+list.name)
	    }
	    //initialize
        var found = false, nexttrackID, trackID, volume	    
        //find next track to play    
        if (list.currentTrack.length > 0){
            //get each track from the playlist tracks
            _.each(listTracks,(trackID)=>{
                //if the track isn't in the current playlistm play it, Found switch makes next track is used
                if (list.currentTrack.indexOf(trackID) == -1){
                    if (!found){
                        nexttrackID = trackID
                        if (debug){
                            log('Next Track:' + nexttrackID)
                        }
                        found = true;
                    }    
                }
            });   
        };  
        //if entire play tracks are in current tracks, all have played, wipe out current tracks and get first one                
        if (!found){
            list.currentTrack = []
            nexttrackID = listTracks[0]
            if (debug){
                log('First Track:' + nexttrackID)
            }    
        }  
        //push this track into the current track list
        list.currentTrack.push(nexttrackID);
	    // volume may have been set to 0 by fading, reset to playlist or master volume.  For fade in, we want start volume at 0
	    if (startVolume!=0){
	        volume = list.volume
	    }else{
	        volume = startVolume;
	    }
        playTrack(nexttrackID,volume,null,who);
	},	
	//plays the track.  
	playTrack = function(trackID,level,loop,who){
	    var jbTrack=getJukeBox(trackID), trackDetails=getTrackDetails(trackID)
	    //set playing to true in Track Details, get Jukebox Object and set to playing
	    if (debug){
	        log("Starting Track:" + trackID)
	        log('Start Volume:'+level)
	    }
	    _.each(state.Roll20AM.playLists,list =>{
	        if (list.trackids.indexOf(trackID) >= 0){
	            list.playing = true
	        }
	    })
	    trackDetails.playing = true;
	    trackDetails.who = who;
        jbTrack.set({playing:true,softstop:false,volume:level});
        if (displayTrack){
            sendChat(who,'Now Playing:' + trackDetails.title ,null,{noarchive:true});
        }    
	}, 
	//stops the track.  Either Track ID or Track Title will come into this function
	stopTrack = function(trackID,extra){
	    var jbTrack=getJukeBox(trackID),trackDetails=getTrackDetails(trackID)

        log(trackID)
	    _.each(state.Roll20AM.playLists,list =>{
	        if (list.playing){
	            log(list)
	            log(list.trackids.indexOf(trackID))
	            if (list.trackids.indexOf(trackID) >= 0){
	                log('found')
	                list.playing = false
	            }
	        }     
	    })
	    
	    //set playing to true in Track Details, get Jukebox Object and set to playing
	    trackDetails.playing=false;
        jbTrack.set({playing:false,softstop:true,loop:false});
	},   
    //fade in starts at zero an incrementally increases volume to the fade in volume
	fadeInTrack = function(trackID,target,seconds,who){
	    var jbTrack=getJukeBox(trackID),trackDetails=getTrackDetails(trackID),levelChange,level,timer

	    //calc the volume change per second
	    level = 0
        levelChange = +target / +seconds;
        if(debug){
            log("Target:" + target)
            log("Time:" + seconds)
            log("Volume Change:" + levelChange)
        }
        
        // If track is being played outside of a list, start the track
        if (!trackDetails.playing){
             trackDetails.playing = true
             playTrack(trackID,0,null,who)       
        }
        
        //increment volume every 1 1/2 seconds until volume is at fade up volume.  ClearTimerout stops the setinterval function
        timer = setInterval(function(){
            log("New Volume:" + level)
            level = level + levelChange*1;
            if (+level <= +target){
                jbTrack.set({volume:level});
            }else{
                log('Clearing Timeout')
                clearTimeout(timer)
            }
        }, 1500 );   
	},	
	//fade out starts at fade in volunme an incrementally decreases volume to the fade out volume
	fadeOutTrack = function(trackID,level,target,seconds,nomenu,who){
	    var jbTrack=getJukeBox(trackID), trackDetails=getTrackDetails(trackID), levelChange, timer

        // verify that the list is actualy playing
        if(!trackDetails.playing){
            sendChat('Roll20AM','/w "'+who+'" In order to fade a track, it must be playing.',null,{noarchive:true})
            return;
        }
	    if(debug){
    	    log('Fade Out Track Name:' + trackID)
	        log('Fade Target' + target) 
    	    log('Fade Time' + seconds)
	    }
	    //calc the volume change per second
        levelChange = (+level - target*1) / seconds;
        if(debug){
            log("Volume Change:" + levelChange)
        }
        
        timer = setInterval(function(){
            if(debug){
                log("New Volume:" + level)
            }
            level = +level - levelChange;
            //Decrement volume every 1 1/2 seconds until volume is at fade down volume.  ClearTimerout stops the setinterval function. Output config refreshes the play button
            if ( +level > target){
                jbTrack.set({volume:level});
            }else{
                if(debug){    
                    log('Clearing Timer')
                }
                stopTrack(trackID,null)
                clearTimeout(timer)
                if (!nomenu){
                    outputConfig(state.Roll20AM.menu,who);
                }    
            }
        }, 1500 );   
	},	
	//******************************************************************************
    //Edit Master Functions 	
    // - Modify the master volume, playlists and tracks assigned to playlist
    //    - Volume, Fade In, Fade Out, Fade Time
    //    - Update the approprate element
    //******************************************************************************	
	changeVolumeMaster = function(level){
	    if (debug){
            log('Change Master Volume:'+level)
	    }	    
        state.Roll20AM.masterVolume = level 
        _.each(state.Roll20AM.playLists,(list)=>{
            changeVolumeList(list,level)
        });
	},	
	changeFadeInMaster = function(level){
	    if (debug){
            log('Change Fade In Master Volume:'+level)
	    }
        state.Roll20AM.fadeVolumeUp = level
        _.each(state.Roll20AM.playLists,(list)=>{
            changeFadeInList(list,level)
        });
	},
	changeFadeOutMaster = function(level){
	    if (debug){
            log('Change Fade Out Volume:'+level)
	    }
        state.Roll20AM.fadeVolumeDown = level
        _.each(state.Roll20AM.playLists,(list)=>{
            changeFadeOutList(list,level)
        });
	},	
	changeFadeTimeMaster = function(level){
	    if (debug){
            log('Change Fade Time Seconds:'+level)
	    }
        state.Roll20AM.fadeTime = level
        _.each(state.Roll20AM.playLists,(list)=>{
            changeFadeTimeList(list,level)
        });
	},		
	changeDelayMaster = function(level){
	    if (debug){
            log('Change Delay Seconds:'+level)
	    }
        state.Roll20AM.delay = level
        _.each(state.Roll20AM.playLists,(list)=>{
            changeDelayList(list,level)
        });
	},		
	//**************************************************************************
    //Edit List Functions 	
    // - Modify the volume in the playlists and tracks assigned to playlist
    //    - Volume, Fade In, Fade Out, Fade Time
    //    - Update the approprate element
    //**************************************************************************	
	changeVolumeList = function(list,level){
	    if (debug){
            log('Change List Volume:'+level)
	    }	    
        list.volume = level;
        _.each(list.trackids,(trackID)=>{
            changeVolumeTrack(trackID,level)
        })
	},		
	changeFadeInList = function(list,level){
	    if (debug){
            log('Change Fade In List Volume:'+level)
	    }	    
        list.fadeup = level;
        _.each(list.trackids,(trackID)=>{
            changeFadeInTrack(trackID,level)
        })
	},	
	changeFadeOutList = function(list,level){
	    if (debug){
            log('Change Fade Out List Volume:'+level)
	    }	    
        list.fadedown = level;
        _.each(list.trackids,(trackID)=>{
            changeFadeOutTrack(trackID,level)
        })        
	},	
	changeFadeTimeList = function(list,level){
	    if (debug){
            log('Change Fade Time List Seconds:'+level)
	    }	    
        list.fadetime = level;
        _.each(list.trackids,(trackID)=>{
            changeFadeTimeTrack(trackID,level)
        })            
	},	
	changeDelayList = function(list,level){
	    if (debug){
            log('Change Delay List Seconds:'+level)
	    }	    
        list.delay = level;
        _.each(list.trackids,(trackID)=>{
            changeDelayTrack(trackID,level)
        })            
	},		
	//******************************************************************************
    //Edit Track Functions 	
    // - Modify the volume in the trackDetails and in some cases, the Jukebox Track
    //    - Volume, Fade In, Fade Out, Fade Time, Increase, Decrease
    //    - Pull the details from state.Roll20AM.trackDetails and sometimes Jukebox
    //    - Update the approprate element
    //******************************************************************************
	changeVolumeTrack = function(trackID,level){
	    var trackDetails = getTrackDetails(trackID)
	    if (debug){
	        log('Change Track:'+trackID)
            log('Change Track Volume:'+level)
	    }	    
        trackDetails.volume = level
	},	
	changeFadeInTrack = function(trackID,level){
	    var trackDetails = getTrackDetails(trackID)
	    if (debug){
	        log('Change Fade In Track:'+trackID)
            log('Change Fade In Track Volume:'+level)
	    }	    
        trackDetails.fadeup = level;
	},	
	changeFadeOutTrack = function(trackID,level){
	    var trackDetails = getTrackDetails(trackID)
	    if (debug){
	        log('Change Fade Out Track:'+trackID)
            log('Change Fade Out Track Volume:'+level)
	    }	    
        trackDetails.fadedown = level;
	},	
	changeFadeTimeTrack = function(trackID,level){
	    var trackDetails = getTrackDetails(trackID)
	    if (debug){
	        log('Change Fade Time Track:'+trackID)
            log('Change Fade Time Track Seconds:'+level)
	    }	    
        trackDetails.fadetime = level;
	},	
	changeDelayTrack = function(trackID,level){
	    var trackDetails = getTrackDetails(trackID)
	    if (debug){
	        log('Change Delay Track:'+trackID)
            log('Change Delay Track Seconds:'+level)
	    }	    
        trackDetails.delay = level;
	},		
    increaseTrack = function(trackID,who){
        var level, trackDetails=getTrackDetails(trackID),jbTrack=getJukeBox(trackID) 
	    if (debug){
            log('Increase Track:'+trackDetails.title)
	    }
        level = trackDetails.volume*1 + 5
        trackDetails.volume = level
        jbTrack.set({volume:level});
    },	    
    decreaseTrack = function(trackID,who){
        var level, trackDetails=getTrackDetails(trackID),jbTrack=getJukeBox(trackID)     

	    if (debug){
            log('Increase Track:'+trackDetails.title)
	    }
        
        level = trackDetails.volume*1 - 5
        trackDetails.volume = level
        jbTrack.set({volume:level});
    },	
    //Import everything from Jukebox
    removeJukebox = function(who){  
        state.Roll20AM.playLists = {}   
        state.Roll20AM.trackDetails = {}  
        sendChat(who,'All Playlists and Tracks have been removed from Roll20AM',null,{noarchive:true});
    },    
    //Import everything from Jukebox
    importJukebox = function(who){
        var shuffleState = {'s':'shuffle','a':'together','b':'single'};
        var lists        = JSON.parse(Campaign().get('jukeboxfolder'));
        var tagName
            
        _.each(lists,list=>{
            if (list.n != undefined){
                importList(list.n)
                _.each(list.i,(t)=>{
                    if (state.Roll20AM.playLists[list.n].trackids.indexOf(t) == -1){
                        if (debug){
                            log('Importing Track:'+t) 
                        }   
                        state.Roll20AM.playLists[list.n].trackids.push(t)
                    }
                })
            } 
        })
        
       importList("Tag1")
       importList("Tag2")
       importList("Tag3")
       importList("Tag4")

        _.each(findObjs({type:'jukeboxtrack'}),(track)=>{
            var title = track.get('title')
            if (state.Roll20AM.trackDetails[title] == undefined){
                log('Importing Track:'+title) 
                state.Roll20AM.trackDetails[title] = {
                    id:track.get('_id'),
                    title:title,
                    playing:false,
                    access:'gm',
                    mode:'single',
                    delay:0,
                    tags:['Off','Off','Off','Off','Off'],
                    volume:state.Roll20AM.masterVolume,
                    fadeup:state.Roll20AM.fadeVolumeUp,
                    fadedown:state.Roll20AM.fadeVolumeDown,
                    fadetime:state.Roll20AM.fadeTime,
                    who:null
                }    
             }    
         })     
         sendChat(who,'All Playlists and Tracks have been imported',null,{noarchive:true});
    },	
    importList = function(listName,who){
        if (debug){
            log('Importing List:'+listName) 
        }        
        if (!state.Roll20AM.playLists[listName]){
            state.Roll20AM.playLists[listName] = {
                name:listName,
                trackids:[],
                shuffleIds:[],                        
                playing:false,
                currentTrack:[],
                lastTrack:null,
                access:'gm',
                mode:'loop',
                delay:0,
                volume:state.Roll20AM.masterVolume,
                fadeup:state.Roll20AM.fadeVolumeUp,
                fadedown:state.Roll20AM.fadeVolumeDown,
                fadetime:state.Roll20AM.fadeTime
            } 
        }     
    },
    //Edit the Playlist
    edit = function(list,trackID,action,mode,access,tag1,tag2,tag3,tag4,who){
        var trackDetails=getTrackDetails(trackID),list
	    if(debug){
	        if (list){
	            log('Edit List Name:' + list.name)
	        }
	        if (trackDetails){
	            log('Edit Track Name:' + trackDetails.title)
	        }	        
    	    log('Edit Mode:' + mode)
    	    log('Edit Access:' + access)
    	    log('Edit Action:' + action)
    	    log('Tag1:'+tag1)
	    }    
        
        if (!list && !trackDetails){
            state.Roll20AM.API = access
        }
        if (list){
            list.mode     = mode || list.mode;
            list.access   = access || list.access;
            if (action == 'remove'){
                state.Roll20AM.playLists.splice(state.Roll20AM.playLists.indexOf(list.name),1);
            }
        }
        if (trackDetails){
            trackDetails.mode     = mode   || trackDetails.mode;
            trackDetails.access   = access || trackDetails.access;   
            trackDetails.tags[0]  = tag1   || trackDetails.tags[0];  
            trackDetails.tags[1]  = tag2   || trackDetails.tags[1];  
            trackDetails.tags[2]  = tag3   || trackDetails.tags[2];  
            trackDetails.tags[3]  = tag4   || trackDetails.tags[3];  
            
            log(tag1)
            if (tag1 == "On"){
                list = getPlayList('Tag1')
                if (!list.trackids[trackDetails.id]){
                    list.trackids.push(trackDetails.id)
                }
            }else{
                list = getPlayList('Tag1')
                list.trackids.splice(list.trackids.indexOf(trackDetails.id),1);
            }
            if (tag2 == "On"){
                list = getPlayList('Tag2')
                if (!list.trackids[trackDetails.id]){
                    list.trackids.push(trackDetails.id)
                }
            }else{
                list = getPlayList('Tag2')
                list.trackids.splice(list.trackids.indexOf(trackDetails.id),1);
            }      
            if (tag3 == "On"){
                list = getPlayList('Tag3')
                if (!list.trackids[trackDetails.id]){
                    list.trackids.push(trackDetails.id)
                }
            }else{
                list = getPlayList('Tag3')
                list.trackids.splice(list.trackids.indexOf(trackDetails.id),1);
            }       
            if (tag4 == "On"){
                list = getPlayList('Tag4')
                if (!list.trackids[trackDetails.id]){
                    list.trackids.push(trackDetails.id)
                }
            }else{
                list = getPlayList('Tag4')
                list.trackids.splice(list.trackids.indexOf(trackDetails.id),1);
            }            
            if (action == 'remove'){
                delete state.Roll20AM.trackDetails[trackDetails.id];
                _.each(state.Roll20AM.playLists,(L)=>{
                    L.trackids.splice(L.trackids.indexOf(trackDetails.id),1);
                });
            }
        }
    },	
    //sets the indicated preference
    setPref = function(details){
        state.Roll20AM.restrict = details.restrict || state.Roll20AM.restrict;
		state.Roll20AM.API = details.API || state.Roll20AM.API;
		state.Roll20AM.tag = details.tag || state.Roll20AM.tag;
    },    
    //stores new tracks into the state with default volume and loop state
    // storeTracks = function(track){
    //     if(track){
    //         state.Roll20AM.trackDetails[track.id] = {
    //             volume:track.get('volume')/state.Roll20AM.masterVolume,
    //         };
    //     }else{
    //         _.each(findObjs({type:'jukeboxtrack'}),(t)=>{
    //             if(!_.contains(state.Roll20AM.trackids,t.id)){
    //                 state.Roll20AM.trackDetails[t.id] = {
    //                     volume:t.get('volume')/state.Roll20AM.masterVolume,
    //                 };
    //             }
    //         });
    //     }
    // },    
	//Returns the first jukeboxtrack to match the provided trackname (and the restriction tag if told to restrict)
// 	getTracks = function(trackNames,restrict,ignore){
// 	    return filterObjs((o)=>{
// 	        if(trackNames.length>0){
// 	            if(ignore){
// 	                if(restrict){
// 	                    return(o.get('type')==='jukeboxtrack' && _.every(trackNames,(i)=>{return o.get('title').replace(state.Roll20AM.tag,'').trim()!==i && o.get('title').indexOf(state.Roll20AM.tag)>-1;}));
// 	                }else{
// 	                    return(o.get('type')==='jukeboxtrack' && _.every(trackNames,(i)=>{return o.get('title').replace(state.Roll20AM.tag,'').trim()!==i;}));
// 	                }
// 	            }else{
// 	                if(restrict){
// 	                    return(o.get('type')==='jukeboxtrack' && _.some(trackNames,(i)=>{return o.get('title').replace(state.Roll20AM.tag,'').trim()===i && o.get('title').indexOf(state.Roll20AM.tag)>-1;}));
// 	                }else{
// 	                    return(o.get('type')==='jukeboxtrack' && _.some(trackNames,(i)=>{return o.get('title').replace(state.Roll20AM.tag,'').trim()===i;}));
// 	                }
// 	            }
// 	        }else{return false;}
//         });
// 	},
	showHelp = function(who){
	    sendChat('Roll20AM','/w "'+who+'"'
	        +'<div style="border: 2px solid black; background-color: white; padding: 3px 3px;">'
            +'<div style="border-bottom: 4px solid black;">'
            +'<div style="font-weight: bold;font-size: 130%;">'
            +'Roll20AM v'+version+' -- Hear the dice, hear the action!'
            +'</div></div>'
            +'For all the details on Roll20AM, please see the <u><b>[Roll20AM handout]('+helpLink+')</b></u>.',null,{noarchive:true}
	        );
	},
    //Generates the help handout
    //Need to make distinction between jukebox and script playlists more clear
    generateHelp = function(){
        var help = getObj('handout',state.Roll20AM.help),
        playerHelp = '<div style="border: 2px solid black; background-color: white; padding: 3px 3px;">'
            +'<div style="border-bottom: 4px solid black;">'
            +'<div style="font-weight: bold;font-size: 130%;">'
            +version+' Roll20AM -- Hear the dice, hear the action!'
            +'</div>'
            +"The Roll20 Audio Master's goal is to make the jukebox easier to use and more powerful. The script allows you to play, stop, and adjust the volume of tracks "
            +'via chat commands (and therefore macros). The script provides all the functionality that the standard jukebox interface does, plus the ability to '
            +'manipulate your tracks in several ways that were not possible before. This help menu is separated into two parts. The top of the handout is a basic '
            +'overview of the command syntax as well as those commands that are accessible by players. The GM Notes section of the handout describes the commands '
            +'that are GM only as well as covering the chat menu interface which is also only available to the GM.'
            +'</div>'
            +'<div style="padding-left:10px;margin-bottom:3px;font-weight: bold;font-size: 110%">'
            +'Basic Syntax'
            +'</div>'
            +'<div style="padding-left:10px;margin-bottom:3px;">'
            +'All Roll20AM commands use the same basic syntax. The contents of a command will change based on what you are doing, but the basic format will always look like this:'
            +'<ul><li style=>'
            +'<b><span style="font-family: serif;">!roll20AM --action,action settings, or options|track name to act on|or playlist name to act on</span></b> '
            +'<ul>'
            +'&'+'#8226'+'; Action keywords are preceded by a space followed by a double dash " --". The action keywords are: play, stop, listCreate, listEdit, vcontrol, delayCancel, and config.<br>'
            +'&'+'#8226'+'; Action keywords and settings/options are separted by a comma. The option keywords will be described below in their associated action keyword section.<br>'
            +'&'+'#8226'+'; For most actions, the settings/options are optional.<br>'
            +'&'+'#8226'+'; Track/playlist names are always separated by a bar "|". <br>'
            +'&'+'#8226'+'; Commands can be chained together by making a second (third, fourth, etc) action group. Action groups are acted on sequentially.'
            +'</ul>'
            +'</li></div>'
            +'<div style="padding-left:10px;margin-bottom:3px;">'
            +'<div style="font-weight: bold;font-size: 110%">'
            +'Player Accessible Action Keywords'
            +'</div>'
            +'Commands are shown with all possible settings. If a setting is optional, it will be enclosed in brackets. If only one of a series of settings will '
            +'be accepted, they are separated by a slash "/". The order of options does not matter as long as the action keyword begins the action group and the list of tracks ends the action group.'
            +'<div style="padding-left:10px;margin-bottom:3px;">'
            +'<ul><li style="border-top: 1px solid #ccc;">'
            +'<b><span style="font-family: serif;">--play,[swap],[loop],[mode:shuffle/trueRandom/together/single],[delay:<i>seconds</i>]|track/list to play|track/list to play|...</span></b><br> '
            +'Plays the indicated track(s) or playlist(s). When sent by a player, only those tracks/playlists that are tagged as player accessible will be played.'
            +'<ul>'
            +'&'+'#8226'+'; <b><span style="font-family: serif;">swap - </span></b>All other tracks will be stopped when the indicated tracks/lists begin playing.<br>'
            +'&'+'#8226'+'; <b><span style="font-family: serif;">loop - </span></b>The indicated tracks will loop. When playlists are specified, only applies when '
            +'the together option is indicated and then all tracks in the list will loop.<br>'
            +'&'+'#8226'+'; <b><span style="font-family: serif;">shuffle - </span></b>No effect on individual tracks. Will cause the indicated playlists to shuffle when played.<br>'
            +'&'+'#8226'+'; <b><span style="font-family: serif;">trueRandom - </span></b>As shuffle, but the same track may be played repeatedly.<br>'
            +'&'+'#8226'+'; <b><span style="font-family: serif;">together - </span></b>Plays all tracks in the indicated playlist(s) at once.<br>'
            +'&'+'#8226'+'; <b><span style="font-family: serif;">delay:<i>seconds</i> - </span></b>Delays the execution of the action group by this many seconds.<br>'
            +'</ul>'
            +'</li></ul>'
            +'<ul><li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
            +'<b><span style="font-family: serif;">--stop,[soft],[ignore],[delay:<i>seconds</i>]|track/list to stop|track/list to stop|...</span></b><br> '
            +'Stops the indicated track(s) or playlist(s). When sent by a player, only those tracks/playlists that are tagged as player accessible will be stopped.'
            +'<ul>'
            +'&'+'#8226'+';<b><span style="font-family: serif;">soft - </span></b>Allows the indicated track(s)/playlist(s) to finish their current playthrough before stopping them.<br>'
            +'&'+'#8226'+';<b><span style="font-family: serif;">ignore - </span></b>Inverts the command, stopping all tracks/playlists except those listed. If no track or playlist is listed, stops all tracks/playlists (respects player restrictions).<br>'
            +'&'+'#8226'+'; <b><span style="font-family: serif;">delay:<i>seconds</i> - </span></b>Delays the execution of the action group by this many seconds.<br>'
            +'</ul>'
            +'</li></ul>'
            +'</div>'
            +'</div></div>',
        gmHelp = '<div style="border: 2px solid black; background-color: white; padding: 3px 3px;">'
            +'<div style="padding-left:10px;margin-bottom:3px;font-weight: bold;font-size: 110%">'
            +'GM Only Features'
            +'</div>'
            +'<div style="padding-left:10px;margin-bottom:3px;">'
            +'<ul><li style="border-top: 1px solid #ccc;">'
            +'<b><span style="font-family: serif;">--vcontrol,volume:<i>value</i>,[ignore],[fade/mute/unmute,[tickTime:<i>seconds</i>],[volTick:<i>number</i>],[stop]],[delay:<i>seconds</i>]|track to change|track to change|...</span></b><br>'
            +'Adjusts the volume of the indicated tracks. Has no effect on playlists. Players can be given access to volume control by turning access restriction off in the config menu.'
            +'<ul>'
            +'&'+'#8226'+'; <b><span style="font-family: serif;">volume - </span></b>What to set the volume to. This can be a number, an expression, or mute/unmute. Valid expressions are -X,+X,/X,and *X.<br>'
            +'&'+'#8226'+'; <b><span style="font-family: serif;">ignore - </span></b>Inverts the command, adjusting the volume of all tracks/playlists except those listed. If no track or playlist is listed, adjusts the master volume.<br>'
            +'&'+'#8226'+'; <b><span style="font-family: serif;">fade - </span></b>Allows you to adjust the volume of the indicated track(s) gradually over time. The volume is adjusted to the value passed in volume as with a normal vcontrol command. Has three optional settings.<br>'
            +'<div style="padding-left:10px;">'
            +'&'+'#8226'+'; <b><span style="font-family: serif;">tickTime - </span></b>How frequently the volume should be adjusted during the fade<br>'
            +'&'+'#8226'+'; <b><span style="font-family: serif;">volTick - </span></b>How much to adjust the volume by each tick. Will be modified on the last tick if this change would bypass the target volume.<br>'
            +'&'+'#8226'+'; <b><span style="font-family: serif;">stop - </span></b>Stops the track(s) once they reach the target volume.<br>'
            +'</div>'
            +'&'+'#8226'+'; <b><span style="font-family: serif;">delay:<i>seconds</i> - </span></b>Delays the execution of the action group by this many seconds.<br>'
            +'</ul>'
            +'</li></div>'
            +'<div style="padding-left:10px;margin-bottom:3px;">'
            +'<ul><li style="border-top: 1px solid #ccc;">'
            +'<b><span style="font-family: serif;">--listCreate,listName:<i>name</i>,[access:gm/player][mode:shuffle/trueRandom/together/single]|track to add|track to add|...</span></b><br> '
            +'Creates a new script defined playlist. <b>Note:</b> These are different from the jukebox playlists, and have no relation to those as they are not API accessible.'
            +'<ul>'
            +'&'+'#8226'+'; <b><span style="font-family: serif;">listName - </span></b>The name of the new playlist. Must be unique among playlist <b>and</b> track names.<br>'
            +'&'+'#8226'+'; <b><span style="font-family: serif;">mode:shuffle - </span></b>Sets the default playlist behavior to shuffle.<br>'
            +'&'+'#8226'+'; <b><span style="font-family: serif;">mode:trueRandom - </span></b>Sets the default playlist behavior to trueRandom<br>'
            +'&'+'#8226'+'; <b><span style="font-family: serif;">mode:together - </span></b>Sets the default playlist behavior to together<br>'
            +'&'+'#8226'+'; <b><span style="font-family: serif;">mode:single - </span></b>Sets the default playlist behavior to single. Will play a random single track.<br>'
            +'&'+'#8226'+'; If no behavior is specified, will default to single.<br>'
            +'&'+'#8226'+'; <b><span style="font-family: serif;">access:<i>gm/player</i> - </span></b>Sets the access for this playlist to be player accessible or gm only. Default is gm only.<br>'
            +'</ul>'
            +'</li></ul>'
            +'<ul><li style="border-top: 1px solid #ccc;">'
            +'<b><span style="font-family: serif;">--listEdit,listName:name,[add/remove],[mode:shuffle/trueRandom/single/together],[access:gm/player]|track to add|track to add|...</span></b><br> '
            +'Edits the indicated playlist.'
            +'<ul>'
            +'&'+'#8226'+';<b><span style="font-family: serif;">add - </span></b>Adds the track(s) to the playlist<br>'
            +'&'+'#8226'+';<b><span style="font-family: serif;">remove - </span></b>Removes the tracks from the playlist. If no tracks are specified, deletes the playlist.<br>'
            +'</ul>'
            +'</li></ul>'
            +'<ul><li style="border-top: 1px solid #ccc;">'
            +'<b><span style="font-family: serif;">--cancelDelay</span></b><br> '
            +'Cancels all delays except for the fading of volumes. There is not currently a more specific cancellation of delays.'
            +'</li></ul>'
            +'<ul><li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
            +'<b><span style="font-family: serif;">--config,[menu:<i>Which Menu</i>]</span></b><br> '
            +'Brings up the chat based menu interface for the script'
            +'<ul>'
            +'&'+'#8226'+';<b><span style="font-family: serif;">menu:<i>Which Menu</i> - </span></b>Specifies one of the config menus to send to chat. Possibilities are:<br>'
            +'<ul>'
            +'&'+'#8226'+';<b><span style="font-family: serif;">playlists - </span></b>Brings up the list of created playlists and their current play state and player access state and the controls to play/stop them, add more playlists, toggle player access and see the details of an individual playlist.<br>'
            +'&'+'#8226'+';<b><span style="font-family: serif;">tracks - </span></b>Brings up the list of all tracks and their current volume and play state and controls to change these.<br>'
            +'&'+'#8226'+';<b><span style="font-family: serif;">restrict - </span></b>Brings up the menu to set how the script reacts to player and API messages and what denotes a player accessible track.<br>'
            +'&'+'#8226'+';<b><span style="font-family: serif;">playlist name - </span></b>Providing the name of a playlist will bring up the details menu for that playlist.<br>'
            +'</ul>'
            +'</ul>'
            +'</li></ul>'
            +'<ul><li style="border-bottom: 1px solid #ccc;">'
            +'<b><span style="font-family: serif;">--listImport,[listName:name]</span></b><br> '
            +'Imports playlists from the jukebox into the script. If the named playlist already exists, it will update that playlist with any missing tracks.'
            +'<ul>'
            +'&'+'#8226'+';<b><span style="font-family: serif;">listName:name - </span></b>Will only import or update the designated playlist.<br>'
            +'</ul>'
            +'</li></ul>'
            +'</div>'
            +'</div>';
        help.set({notes:playerHelp});
        help.set({gmnotes:gmHelp});
    },        
	//wipes out list or track
    destroyHandler = function(obj){
        delete state.Roll20AM.trackDetails[obj.id];
        _.each(state.Roll20AM.playLists,(L)=>{
            L.trackids.splice(L.trackids.indexOf(obj.id),1);
        });
    },
    RegisterEventHandlers = function() {
        on('chat:message', inputHandler);
        on('change:jukeboxtrack',changeHandler);
        // on('add:jukeboxtrack',storeTracks);
        on('destroy:jukeboxtrack',destroyHandler);
        on('destroy:handout',(obj)=>{
            if(obj.id === state.Roll20AM.help){
                log('-=> Roll20AM re-initializing; Roll20AM journal entry deleted.');
                sendChat('Roll20AM',"/w gm It looks like you have deleted the help document for the Roll20AM script. We're regenerating it so that you can easily "
                +"access all the information you need to utilize the script. It will be stored in your archived folder and won't clutter up your journal.",null,{noarchive:true});
                state.Roll20AM.help = createObj('handout',{
		            name:'Roll20AM',
		            inplayerjournals:'all',
		            archived:true
		        }).id;
		        generateHelp();
            }
        });
    };     
    
    return {
        CheckInstall: checkInstall,
    	RegisterEventHandlers: RegisterEventHandlers
	}
	
    
}());


on("ready",function(){
    'use strict';
    
    Roll20AM.CheckInstall();
    Roll20AM.RegisterEventHandlers();
});
