/*
PAGENAVIGATOR script:
Author: Scott C.
Contact: https://app.roll20.net/users/459831/scott-c
Thanks to: The Aaron, Arcane Scriptomancer and Stephen S. for their help Alpha and Beta Testing this script.
*/

var Roll20AM = Roll20AM || (function() {
    'use strict';

    var version = '1.02',
        lastUpdate = 1480777688,
        schemaVersion = 1.02,
        helpLink,
        delays = [],
        defaults = {
            css: {
                button: {
                    'border': '1px solid #cccccc',
                    //'border-radius': '1em',
                    'background-color': '#006dcc',
                    'margin': '0 .1em',
                    'font-weight': 'bold',
                    'padding': '.1em .1em',
                    'color': 'white'
                }
            }
        },
        templates = {},
        playImage = "https://s3.amazonaws.com/files.d20.io/images/25123304/oWcUORm9x8AaMLacuyqz3Q/original.png",
        stopImage = "https://s3.amazonaws.com/files.d20.io/images/25118010/R2S6uU9J5XPvOvc32oD51w/original.png",
        unmuteImage = "https://s3.amazonaws.com/files.d20.io/images/25118009/E5-c4ghYMKJPRqTS5hS88A/original.png",
        muteImage = "https://s3.amazonaws.com/files.d20.io/images/25118012/FUq8mY_pCSkhvwiAe6dw2g/original.png",
        addImage = "https://s3.amazonaws.com/files.d20.io/images/25125216/T5Khlsmk3yp_S9DVWCGbog/original.png",
        deleteImage = "https://s3.amazonaws.com/files.d20.io/images/25125727/M2DhnihuhfrtINL3FYqVAQ/original.png",
        shuffleImage = "https://s3.amazonaws.com/files.d20.io/images/25305795/ze37IdzkqMTcD9m0UXiaIQ/original.png",
        togetherImage = "https://s3.amazonaws.com/files.d20.io/images/25306035/2db_Ff5b2rJQSsLa6dDl5A/max.png",
        singleImage = "https://s3.amazonaws.com/files.d20.io/images/25306104/KL1o9uTeuj5-f8TSyAlR5g/max.png",

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
            ':' : '&'+'#58'+';',
            //'-' : '&'+'mdash'+';'
        },
        re=new RegExp('('+_.map(_.keys(entities),esRE).join('|')+')','g');
        return function(s){
            return s.replace(re, function(c){ return entities[c] || c; });
        };
    }()),
    
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
		log('  >Stored settings loaded<');
		storeTracks();
		log('  >Tracks updated<');
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
                                                            lastTrack:String containing the id of the last track to be played
                                                            delays:The number of times this playlist has been delayed. Incremented in handleInput, decremented in delayHandler. Actions are not completed if there are no delays to support them.
                                                            access:String defining whether the playlist is player accessible or not. 'gm' or 'player'*/
            masterVolume:state.Roll20AM.masterVolume || 1,//The mastervolume, all volumes are multiplied by this before being applied to the actual track. Maximum/Minimum volume levels applicable to tracks are 0-100, the multiplied final volume is set to the boundary if it is outside the range.
            restrict:state.Roll20AM.restrict || 'on',//Whether player restrictions are on or not, string that will be either 'on' or 'off'
            API:state.Roll20AM.API || 'gm',//String denoting how API messages are treated. Either 'gm' or 'player'
            tag:state.Roll20AM.tag || '-players-',//the player access tag that should be appended to tracks that are player accessible
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
                '}) %> href="<%= command %>"><%= label||"Button" %></a>'
        );
    },
    
    makeImageButton = function(command, image, toolTip, backgroundColor){
        return '<a style="background-color: '+backgroundColor+'; padding: 0;" href="'+command+'" title= "'+toolTip+'">'
            +'<div style="width: 16px; height: 16px; '
            +'display:inline-block; margin: 0; border:0; cursor: pointer;padding:0;background-image: url(\''+image+'\');'
            +'background-repeat:no-repeat;"></div></a>'
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
    
    /*
    Outputs the configuration menu
    options include:
        Roll Listeners: Toggles roll listening on/off, when on the Roll Listeners title becomes a button to access the Roll Listeners config page
            List of Created Roll Listeners sorted by name:
                Name of the listener
                The listener's trigger
            Create Listener button
                Brings up roll queries to create a new roll listener -- This can also be done manually via chat command
        Master Volume: a slider showing the current master volume level with a text box to the left of it showing the actual value
        Tracks: Access a list of all tracks and their current individual status
            Volume: a slider showing the track's current volume level with a text box to the left of it showing the actual value. Volume can 
            Sorted by Playing/not-playing and then alphabetically
        Playlists: Access a list of all playlists created in the script and their current status
            playing/not-playing
            Current Track(s)
            Clicking on the playlist name will bring up the full playlist details and CBMI for adding/removing tracks
        Player Restrictions: Access the options for restricting player access to tracks and controls
            Command toggle: Toggle player restriction of commands on/off
            Track toggle: Toggle player restriction of track and playlist access on/off
                Player accessible tag input
        Delays: Access interface for canceling specific delays ****Potential Feature****
    */
    outputConfig = function(menu){
        var mvTextButton,tracksButton,playlistButton,restrictButton,volumeButton,muteButton,playButton,addButton,
        deleteButton,APIButton,tagButton,templateButton,commandButton,rollButton,textButton,accessButton,modeButton,
        output = '/w gm <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
        +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">';
        switch(menu){
            case 'tracks':
                output += version+' Roll20 AM<br><b> Track Info</b>'+'</div>'+'<div style="padding-left:10px;margin-bottom:3px;">'
                +'<b><u>Track Name</u></b>'+'<div style="float:right;"><b><u>Volume</u></b></div><br><br>';
                _.each(findObjs({type:'jukeboxtrack'}),(t)=>{
                    if(!t.get('playing') || (t.get('playing') && t.get('softstop') && !t.get('loop'))){
                        playButton = makeImageButton('!roll20AM --play|'+t.get('title').replace(state.Roll20AM.tag,'')
                        +' --config,menu=tracks',playImage,'Play Track','transparent');
                    }else{
                        playButton = makeImageButton('!roll20AM --stop|'+t.get('title').replace(state.Roll20AM.tag,'')
                        +' --config,menu=tracks',stopImage,'Stop Track','transparent');
                    }
                    if(t.get('volume')===0){
                        muteButton = makeImageButton('!roll20AM --vcontrol,volume=unmute|'+t.get('title').replace(state.Roll20AM.tag,'')
                        +' --config,menu=tracks',muteImage,'Unmute Track;no effect if track or master volume set to 0','transparent');
                    }else{
                        muteButton = makeImageButton('!roll20AM --vcontrol,volume=mute|'+t.get('title').replace(state.Roll20AM.tag,'')
                        +' --config,menu=tracks',unmuteImage,'Mute Track','transparent');
                    }
                    volumeButton = makeButton('!roll20AM --vcontrol,volume=?{Volume (0-&'+'#x221e'+';)|'+state.Roll20AM.trackDetails[t.id].volume+'}|'+t.get('title').replace(state.Roll20AM.tag,'')
                    +' --config,menu=tracks',state.Roll20AM.trackDetails[t.id].volume+'%','white','black');
                    output += t.get('title').replace(state.Roll20AM.tag,'')+'<div style="float:right;">'+volumeButton+muteButton+playButton+'</div><br><br>';
                });
                output+= '</div>';
                break;
            case 'playlists':
                output += version+' Roll20 AM<br><b> Playlist Info</b></div><div style="padding-left:10px;margin-bottom:3px;"><br>';
                _.each(state.Roll20AM.playLists,(l)=>{
                    if(l){
                        if(l.access === 'gm'){
                            accessButton = makeImageButton('!roll20AM --listEdit,listName='+l.name+',access=player'
                            +' --config,menu=playlists',null,'Set List Access to player','red');
                        }else{
                            accessButton = makeImageButton('!roll20AM --listEdit,listName='+l.name+',access=gm'
                            +' --config,menu=playlists',null,'Set List Access to gm only','green');
                        }
                        if(l.playing){
                            playButton = makeImageButton('!roll20AM --stop|'+l.name
                            +' --config,menu=playlists',stopImage,'Stop Playlist','transparent');
                        }else{
                            playButton = makeImageButton('!roll20AM --play|'+l.name
                            +' --config,menu=playlists',playImage,'Play Playlist','transparent');
                        }
                        switch(l.mode){
                            case 'shuffle':
                                modeButton = makeImageButton('!roll20AM --listEdit,listName='+l.name+',mode=?{Play mode|shuffle|trueRandom|together|single}'
                                +' --config,menu=playlists',shuffleImage,'Set the playlist playmode; currently shuffled','transparent');
                                break;
                            case 'single':
                                modeButton = makeImageButton('!roll20AM --listEdit,listName='+l.name+',mode=?{Play mode|shuffle|trueRandom|together|single}'
                                +' --config,menu=playlists',singleImage,'Set the playlist playmode; currently single','transparent');
                                break;
                            case 'trueRandom':
                                modeButton = makeImageButton('!roll20AM --listEdit,listName='+l.name+',mode=?{Play mode|shuffle|trueRandom|together|single}'
                                +' --config,menu=playlists',shuffleImage,'Set the playlist playmode; currently true random','transparent');
                                break;
                            case 'together':
                                modeButton = makeImageButton('!roll20AM --listEdit,listName='+l.name+',mode=?{Play mode|shuffle|trueRandom|together|single}'
                                +' --config,menu=playlists',togetherImage,'Set the playlist playmode; currently together','transparent');
                                break;
                            default:
                             modeButton = '';
                        }
                        deleteButton = makeImageButton('!roll20AM --listEdit,listName='+l.name+',remove --config,menu=playlists',
                        deleteImage,'Delete Playlist','transparent');
                        playlistButton=makeButton('!roll20AM --config,menu='+l.name,
                        l.name,'white','black');
                        output+=playlistButton+'<div style="float:right;">'+accessButton+ '           ' +modeButton+ '           ' +playButton + '           ' + deleteButton + '</div><br><br>';
                    }
                });
                addButton = makeImageButton('!roll20AM --listCreate,listName=?{Playlist Name|Enter Name},mode=?{Play mode|shuffle|trueRandom|together|single}'+
                ' --config,menu=playlists',addImage,'Create Playlist','transparent');
                output+='<div style="float:right;">'+addButton+'</div><br><br>';
                output+= '</div>';
                break;
            case 'restrict':
                output += version+' Roll20 AM<br><b> Access Restrictions</b></div><div style="padding-left:10px;margin-bottom:3px;"><br>';
                //API Restriction - treat API generated messages as player or GM
                if(state.Roll20AM.API === 'gm'){
                    APIButton = makeButton('!roll20AM --set,API=player --config,menu=restrict',
                    state.Roll20AM.API,'transparent','black');
                }else{
                    APIButton = makeButton('!roll20AM --set,API=gm --config,menu=restrict',
                    state.Roll20AM.API,'transparent','black');
                }
                output += 'API messages treated as:<div style="float:right;">'+APIButton+'</div><br><br>';
                //Player Restriciton - on/off; if on set tag to custom
                if(state.Roll20AM.restrict === 'on'){
                    restrictButton = makeButton('!roll20AM --set,restrict=off --config,menu=restrict',
                    state.Roll20AM.restrict,'green','white');
                    tagButton = 'Player Access Tag:<div style="float:right;">'+makeButton('!roll20AM --set,tag=?{Player access tag|'+state.Roll20AM.tag+'} --config,menu=restrict',
                    state.Roll20AM.tag,'transparent','black')+'</div><br><br>';
                }else{
                    restrictButton = makeButton('!roll20AM --set,restrict=on --config,menu=restrict',
                    state.Roll20AM.restrict,'red','white');
                    tagButton = '';
                }
                output += 'Restricted access:<div style="float:right;">'+restrictButton+'</div><br><br>'+tagButton;
                output += '</div>';
                break;
            default:
                if(state.Roll20AM.playLists[menu]){
                    output += version+' Roll20 AM<br><b> '+menu+' playlist</b></div><div style="padding-left:10px;margin-bottom:3px;"><br>';
                    _.each(state.Roll20AM.playLists[menu].trackids,(t)=>{
                        deleteButton = makeImageButton('!roll20AM --listEdit,listName='+menu+',remove|'+getObj('jukeboxtrack',t).get('title').replace(state.Roll20AM.tag,'')+' --config,menu='+menu,
                        deleteImage,'Remove Track from Playlist','transparent');
                        output += getObj('jukeboxtrack',t).get('title').replace(state.Roll20AM.tag,'') + '<div style="float:right;">' + deleteButton + '</div><br><br>';
                    });
                    addButton = makeImageButton('!roll20AM --listEdit,listName='+menu+',add|?{What track would you like to add|Track Name without Restriction Tag} --config,menu='+menu,
                        addImage,'Add a New Track to This Playlist','transparent');
                    output += '<div style="float:right;">' + addButton + '</div><br><br>';
                    output += '</div>';
                }else{
                    output += version+' Roll20 AM<br><b> Options</b></div><div style="padding-left:10px;margin-bottom:3px;"><br>';
                    //Master Volume Control
                    mvTextButton = makeButton('!roll20AM --vcontrol,ignore,volume=?{Volume (0-100)|'+state.Roll20AM.masterVolume*100+'}',
                    state.Roll20AM.masterVolume*100+'%','white','black');
                    output += '<b>Master Volume: </b><div style="float:right;">'+mvTextButton+'</div><br><br>';
                    //Tracks
                    tracksButton = makeButton('!roll20AM --config,menu=tracks',
                    'Tracks','white','black');
                    output += '<b>View:</b><br>'+tracksButton;
                    //Playlists
                    playlistButton = makeButton('!roll20AM --config,menu=playlists',
                    'Playlists','white','black');
                    output += '<div style="float:right;">'+playlistButton+'</div><br><br>';
                    //Player Restrictions
                    restrictButton = makeButton('!roll20AM --config,menu=restrict',
                    'Access Restrictions','white','black');
                    output += restrictButton+'<br><br>';
                    //ends the padding div begun before listenButton
                    output+= '</div>';
                }
        }
        //ends the first div
        output += '</div>';
        sendChat('',output);
    },
    
    //sets the indicated preference
    setPref = function(details){
        state.Roll20AM.restrict = details.restrict || state.Roll20AM.restrict;
		state.Roll20AM.API = details.API || state.Roll20AM.API;
		state.Roll20AM.tag = details.tag || state.Roll20AM.tag;
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
    
    //stores new tracks into the state with default volume and loop state
    storeTracks = function(track){
        if(track){
            state.Roll20AM.trackDetails[track.id] = {
                volume:track.get('volume')/state.Roll20AM.masterVolume,
            };
        }else{
            _.each(findObjs({type:'jukeboxtrack'}),(t)=>{
                if(!_.contains(state.Roll20AM.trackids,t.id)){
                    state.Roll20AM.trackDetails[t.id] = {
                        volume:t.get('volume')/state.Roll20AM.masterVolume,
                    };
                }
            });
        }
    },
    
    importFilter = function(l){
        var shuffleState = {
                's':'shuffle',
                'a':'together',
                'b':'single'
            },
            tracks;
        if(state.Roll20AM.playLists[l.n]){
            _.each(l.i,t=>{
                if(!_.some(state.Roll20AM.playLists[l.n].trackids,(id)=>{return id === t;})){
                    state.Roll20AM.playLists[l.n].trackids.push(t);
                }
            });
        }else{
            tracks = _.map(l.i,(t)=>{
                return getObj('jukeboxtrack',t);
            });
            createList({listName:l.n,access:'gm',mode:shuffleState[l.s]},tracks);
        }
    },
    
    importList = function(listName){
        var lists = JSON.parse(Campaign().get('jukeboxfolder'));
        lists = _.filter(lists,(l)=>{return l.n});
        if(listName){
            _.some(lists,(l)=>{
                if(l.n === listName){
                    importFilter(l);
                    outputConfig(listName);
                }
                return l.n === listName;
            });
        }else{
            _.each(lists,(l)=>{
                importFilter(l);
            });
            outputConfig('playlists');
        }
    },
    
    //Creates the user defined playlists and stores them to the state
    createList = function(details, tracks){
        if(state.Roll20AM.playLists[details.listName]){
            log('list already exists');
            showHelp(playerid);
            return;
        }
        if(_.some(findObjs({type:'jukeboxtrack'}),(t)=>{return t.get('title').replace(state.Roll20AM.tag,'') === details.listName;})){
            showHelp(playerid);
            return;
        }
        state.Roll20AM.playLists[details.listName] = {
            name:details.listName,
            trackids:[],
            playing:false,
            currentTrack:[],
            lastTrack:null,
            access:details.access || 'gm',
            mode:details.mode || 'single'
        };
        _.each(tracks,(n)=>{
            state.Roll20AM.playLists[details.listName].trackids.push(n.id);
        });
    },
    
    editList = function(listname,action,tracks,det){
        if(!state.Roll20AM.playLists[listname]){
            showHelp(playerid);
            return;
        }
        state.Roll20AM.playLists[listname].mode=det.mode || state.Roll20AM.playLists[listname].mode;
        state.Roll20AM.playLists[listname].access = det.access || state.Roll20AM.playLists[listname].access;
        switch(action){
            case 'add':
                _.each(tracks,(t)=>{
                    state.Roll20AM.playLists[listname].trackids.push(t.id);
                });
                break;
            case 'remove':
                if(tracks.length>0){
                    _.each(tracks,(t)=>{
                        state.Roll20AM.playLists[listname].trackids.splice(state.Roll20AM.playLists[listname].trackids.indexOf(t.id),1);
                    });
                }else{
                    state.Roll20AM.playLists[listname]=undefined;
                }
                break;
        }
    },
	
	//Returns the first jukeboxtrack to match the provided trackname (and the restriction tag if told to restrict)
	getTracks = function(trackNames,restrict,ignore){
	    return filterObjs((o)=>{
	        if(trackNames.length>0){
	            if(ignore){
	                if(restrict){
	                    return(o.get('type')==='jukeboxtrack' && _.every(trackNames,(i)=>{return o.get('title').replace(state.Roll20AM.tag,'')!==i && o.get('title').indexOf(state.Roll20AM.tag)>-1;}));
	                }else{
	                    return(o.get('type')==='jukeboxtrack' && _.every(trackNames,(i)=>{return o.get('title').replace(state.Roll20AM.tag,'')!==i;}));
	                }
	            }else{
	                if(restrict){
	                    return(o.get('type')==='jukeboxtrack' && _.some(trackNames,(i)=>{return o.get('title').replace(state.Roll20AM.tag,'')===i && o.get('title').indexOf(state.Roll20AM.tag)>-1;}));
	                }else{
	                    return(o.get('type')==='jukeboxtrack' && _.some(trackNames,(i)=>{return o.get('title').replace(state.Roll20AM.tag,'')===i;}));
	                }
	            }
	        }else{return false;}
        });
	},
	
	//getLists = function(trackNames,restrict,ignore)
	
	//Changes the volume associated with a track. If the command passed a relative change (+/-,/,or*) it applies that relative change to the track's volume.
	//Once a new volume has been reached it multiplies the new track volume by the masterVolume to determine the new active volume. If the active volume is 
	//outside the range of 0-100, it is set to the closest boundary.
	//Master volume change is accepted in percentage format (0-100) and is converted to decimals (0-1)
	changeVolume = function(tracks,change){
	    var ops = {
            '*': (a,b)=>a*b,
            '/': (a,b)=>a/b,
            '+': (a,b)=>a+b,
            '-': (a,b)=>a-b,
            '=': (a,b)=>b
        },
        adj=(''+change).match(/^\s*([+-\/*]?)(\d+)\s*$/);
        if(adj){
            adj[2]=parseInt(adj[2],10);
            adj[1]=adj[1]||'=';
            if(tracks==='MASTER'){
                state.Roll20AM.masterVolume =ops[adj[1]](state.Roll20AM.masterVolume,adj[2]/100);
                _.each(findObjs({type:'jukeboxtrack'}),(t)=>{
                    t.set({volume:Math.min(Math.max(state.Roll20AM.trackDetails[t.id].volume * state.Roll20AM.masterVolume,0),100)});
                });
            }else{
                _.each(tracks,(t)=>{
                    state.Roll20AM.trackDetails[t.id].volume = ops[adj[1]](state.Roll20AM.masterVolume,adj[2]);
                    t.set({volume:Math.min(Math.max((state.Roll20AM.trackDetails[t.id].volume * state.Roll20AM.masterVolume),0),100)});
                });
            }
        }
	},
	
	//Recurses through tracks to fade them, if 'stop' is true, stops the tracks once they reach the target volume. If time is defined, dynamically sets the change/tick, otherwise
	//uses 5 Volume/1000 mSec.(TBD)
	//Target volume can be either a number (e.g. 0 or 50) or an expression (e.g. /2, +5, *4).
	fadeTracks = function(tracks,target,tick,stop,volTick){//still occasionally passes an invalid argument for target
	//                    Array str/nmbr nmbr Str   nmbr
	    var change,finalTarget,tickTarget,
	    expression = false,
	    volTick = volTick || 5,
	    tick = tick || 200,
	    target = target || 0,
	    ops = {
            '*': (a,b)=>a*b,
            '/': (a,b)=>a/b,
            '+': (a,b)=>a+b,
            '-': (a,b)=>a-b,
            '=': (a,b)=>b
        },
        adj;
        adj=(''+target).match(/^\s*([+-\/*]?)(\d+)\s*$/);
        if(adj){
            adj[2]=parseInt(adj[2],10)/100;
            adj[1]=adj[1]||'=';
            if(tracks==='MASTER'){
                finalTarget =ops[adj[1]](state.Roll20AM.masterVolume,adj[2]);
                if(finalTarget < state.Roll20AM.masterVolume){
                    tickTarget = Math.max(finalTarget,state.Roll20AM.masterVolume - volTick);
                }else if(finalTarget > state.Roll20AM.masterVolume){
                    tickTarget = Math.min(finalTarget,state.Roll20AM.masterVolume + volTick);
                }
                if(tickTarget || tickTarget === 0){
                    changeVolume('MASTER',tickTarget);
                }
                if(finalTarget === state.Roll20AM.masterVolume){
                    if(stop){
                        stopTrack(findObjs({type:'jukeboxtrack'}));
                    }
                }else{
                    _.delay(fadeTracks,tick,'MASTER',finalTarget,tick,stop,volTick);
                }
            }else{
                _.each(tracks,(t)=>{
                    finalTarget = ops[adj[1]](state.Roll20AM.masterVolume,adj[2]);
                    if(finalTarget < state.Roll20AM.masterVolume){
                        tickTarget = Math.max(finalTarget,state.Roll20AM.masterVolume - volTick);
                    }else if(finalTarget > state.Roll20AM.masterVolume){
                        tickTarget = Math.min(finalTarget,state.Roll20AM.masterVolume + volTick);
                    }
                    if(tickTarget || tickTarget === 0){
                        changeVolume([t],tickTarget);
                    }
                    if(finalTarget === state.Roll20AM.trackDetails[t.id].volume){
                        if(stop){
                            stopTrack([t]);
                        }
                    }else{
                        _.delay(fadeTracks,tick,[t],finalTarget,tick,stop,volTick);
                    }
                });
            }
        }else{
            showHelp(playerid);
            return;
        }
	},
	
	//plays tracks it is passed based on the values passed for stop (whether to stop other tracks or not) and extra (whether to loop the track or not)
	play = function(tracks,stop,extra){
	   //           Array  str  Object
	    if(stop){
	        stopTrack(findObjs({type:'jukeboxtrack'}));
	    }
        _.each(tracks,(t)=>{
            t.set({playing:true,softstop:false});
            if(extra){
                t.set(extra,true);
            }
        });
	},
	
	//Plays playlists it is passed based on the values passed for stop (whether to stop other tracks or not) and extra (whether to loop, randomize(ala CD player), true randomize, or play all tracks together
    playlist = function(list,action,extra){
        var listTracks = [],
            whileTrack = 0,
        playtype = extra.mode || state.Roll20AM.playLists[list].mode;
        state.Roll20AM.playLists[list].playing = true;
        state.Roll20AM.playLists[list].mode=playtype;
        
        switch(action){
            case 'play':
                switch(playtype){
                case 'together':
                    //play all tracks in the playlist at once, set those tracks to loop if desired
                    _.each(state.Roll20AM.playLists[list].trackids,(id)=>{
                        stopTrack([getObj('jukeboxtrack',id)],extra.soft);
                        listTracks.push(getObj('jukeboxtrack',id));
                    });
                    if(listTracks.length>0){
                        state.Roll20AM.playLists[list].currentTrack=_.map(listTracks,(t)=>{return t.id;});
                        play(listTracks,null,extra.loop);
                    }
                    break;
                case 'single':
                    playtype = 'shuffle';
                    //deliberate fall-through
                case 'shuffle':
                //play the list shuffled
                    do{
                        listTracks = [getObj('jukeboxtrack',state.Roll20AM.playLists[list].trackids[randomInteger(state.Roll20AM.playLists[list].trackids.length)- 1])];
                        whileTrack++;
                    }while(whileTrack < 6 && _.some(state.Roll20AM.playLists[list].currentTrack,(t)=>{return listTracks[0].id === t}));
                    if(listTracks.length === 0){
                        listTracks = [getObj('jukeboxtrack',state.Roll20AM.playLists[list].trackids[0])];
                    }
                    if(listTracks[0]){
                        state.Roll20AM.playLists[list].lastTrack = _.clone(state.Roll20AM.playLists[list].currentTrack[0]);
                        state.Roll20AM.playLists[list].currentTrack=[listTracks[0].id];
                        play(listTracks,null,null);
                    }
                    break;
                case 'trueRandom':
                //play the list totally randomly, may repeat the same track
                    listTracks = [getObj('jukeboxtrack',state.Roll20AM.playLists[list].trackids[randomInteger(state.Roll20AM.playLists[list].trackids.length)- 1])];
                    if(listTracks.length>0){
                        state.Roll20AM.playLists[list].currentTrack=[listTracks[0].id];
                        play(listTracks,null,null);
                    }
                    break;
                default:
                //play in order
                    for(var i = 0;i<state.Roll20AM.playLists[list].trackids.length;i++){
                        if(_.some(state.Roll20AM.playLists[list].currentTrack,(t)=>{return state.Roll20AM.playLists[list].trackids[i]===t;})){
                            listTracks = [getObj('jukeboxtrack',state.Roll20AM.playLists[list].trackids[i + 1])];
                            i = state.Roll20AM.playLists[list].trackids.length;
                        }
                    }
                    if(!listTracks[0]){
                        listTracks = [getObj('jukeboxtrack',state.Roll20AM.playLists[list].trackids[0])];
                    }
                    if(listTracks[0]){
                        state.Roll20AM.playLists[list].currentTrack=[listTracks[0].id];
                        play(listTracks,null,null);
                    }
                    break;
                }
                break;
            case 'stop':
                state.Roll20AM.playLists[list].playing = false;
                listTracks = _.map(state.Roll20AM.playLists[list].currentTrack,(t)=>{
                    state.Roll20AM.playLists[list].currentTrack.splice(state.Roll20AM.playLists[list].currentTrack.indexOf(t),1);
                    state.Roll20AM.playLists[list].lastTrack = t;
                    return getObj('jukeboxtrack',t);
                });
                listTracks = _.reject(listTracks,(t)=>{return _.isUndefined(t)});
                if(listTracks.length>0){
                    stopTrack(listTracks,extra.soft);
                }
                break;
        }
    },
	
	//mutes/unmutes tracks
	muteTrack = function(tracks,mute){
	    if(tracks === 'MASTER'){
	        tracks === findObjs({type:'jukeboxtrack'});
	    }
	    if(mute === 'mute'){
	        _.each(tracks,(t)=>{
	            t.set({volume:0});
	        });
	    }else{
	        _.each(tracks,(t)=>{
	            t.set({volume:state.Roll20AM.trackDetails[t.id].volume});
	        });
	    }
	},
	
	//stops the indicated tracks from playing
	stopTrack = function(tracks,soft){
	    if(soft){
	        _.each(tracks,(t)=>{
                t.set({softstop:true,loop:false});
            });
	    }else{
	        _.each(tracks,(t)=>{
                t.set({playing:false,softstop:false,loop:false});
            });
	    }
	},
	
	//show the help screen
	//Possible to create help documentation in character Bio/GMnotes and access via hyperlink in chat?
	//--If so, do this when switch from storing in state to storing in character
	showHelp = function(id){
	    sendChat('Roll20AM','/w "'+getObj('player',id).get('displayname')+'"'
	        +'<div style="border: 2px solid black; background-color: white; padding: 3px 3px;">'
            +'<div style="border-bottom: 4px solid black;">'
            +'<div style="font-weight: bold;font-size: 130%;">'
            +'Roll20AM v'+version+' -- Hear the dice, hear the action!'
            +'</div></div>'
            +'For all the details on Roll20AM, please see the <u><b>[Roll20AM handout]('+helpLink+')</b></u>.'
	        );
	},
	
    delayHandler = function(cmdDetails,tracks,playlists,playerid){
        var restrict;
        if(playerIsGM(playerid) || !state.Roll20AM.restrict){
		    restrict = false;
		}else{
		    restrict = true;
		}
        switch(cmdDetails.action){
            //Play controls
            //New Play Syntax:
            //!roll20AM --play,[swap],[loop],[shuffle],[truerandom],[together]|track/list to play|track/list to play|...
            case 'play':
                if(tracks){
                    play(tracks,cmdDetails.details.swap,cmdDetails.details.loop);
                }
                if(!tracks && cmdDetails.details.swap && !restrict){
                    stopTrack(findObjs({type:'jukeboxtrack'}));
                }
                _.each(playlists,(n)=>{
                    if(!restrict || state.Roll20AM.playLists[n].access === 'player'){
                        playlist(n,cmdDetails.action,cmdDetails.details);
                    }
                });
                if(!tracks && playlist.length <1){
                    showHelp(playerid);
                }
                break; 
            //playlist handling
            //import existing playlists from jukebox
            //syntax: !roll20AM --listImport,[listName:name]
            case 'listImport':
                if(!restrict){
                    importList(cmdDetails.details.listName);
                }
                break;
            //create playlist
            //syntax: !roll20AM --listCreate,listName:name|track to add|track to add|...
            case 'listCreate':
                if(!restrict){
                    if(cmdDetails.details.listName && tracks){
                        createList(cmdDetails.details,tracks);
                    }else{
                        //send error: not enough arguments
                    }
                }
                break;
            case 'listEdit':
                if(!restrict){
                    if(cmdDetails.details.listName){
                        editList(cmdDetails.details.listName,cmdDetails.details.add || cmdDetails.details.remove,tracks,cmdDetails.details);
                    }
                }
                break;
            //Volume Control
            //Volume Control Syntax:
            //!roll20AM --vcontrol,[advance keyword[,options thereof]],[[ignore],[stop]],volume:volume change|track/list to change|track/list to change|...
            case 'vcontrol':
                if(!restrict){
                    if(cmdDetails.details.ignore && tracks.length === 0){
                        tracks = 'MASTER';
                    }
                    if(tracks.length>0){
                        if(cmdDetails.details.fade){
                            if(tracks !== 'MASTER'){
                                fadeTracks(tracks,cmdDetails.details.volume,parseInt(cmdDetails.details.tickTime),cmdDetails.details.stop,parseInt(cmdDetails.details.volTick))
                            }else{
                                showHelp(playerid);
                            }
                        }else if(cmdDetails.details.volume === 'mute' || cmdDetails.details.volume === 'unmute'){
                            muteTrack(tracks,cmdDetails.details.volume);
                        }else{
                            changeVolume(tracks,cmdDetails.details.volume);
                        }
                    }else{
                        showHelp(playerid);
                    }
                }else{
                    sendChat('roll20AM','/w "'+getObj('player',playerid).get('displayname')+'" Script control of track volume is GM only. If audio is '
                    +'too loud/soft please adjust your master music volume under the settings tab. This setting is not accessible by the API.')
                }
                break;
            //Stop playing
            //swap all syntax for the ignore behavior in volume control
            //Syntax: !roll20AM --stop,[softstop],[ignore]|track/list to stop|track/list to stop|...
            case 'stop':
                _.each(playlists,(n)=>{
                    if(state.Roll20AM.playLists[n] && (!restrict || state.Roll20AM.playLists[n].access === 'player')){
                        playlist(n,cmdDetails.action,cmdDetails.details);
                    }
                });
                if(tracks){
                    stopTrack(tracks,cmdDetails.details.soft);
                }else{
                    showHelp(playerid);
                }
                break;
            case 'config':
                if(!restrict){
                    outputConfig(cmdDetails.details.menu);
                }
                break;
            case 'set':
                if(!restrict){
                    setPref(cmdDetails.details);
                }
                break;
            case 'cancelDelay':
                if(!restrict){
                    _.each(delays,(d)=>{
                        clearTimeout(d);
                    });
                    delays = [];
                    sendChat('Roll20AM','/w gm Delays cleared');
                }
                break;
            default:
                showHelp(playerid);
            break;
        }
    },
    
    //Handles chat input
    //Command Syntax: !roll20AM --action,[options]|tracks/lists to affect|tracks/lists to affect|... --action2,[options|tracks/lists to affect|tracks/lists to affect|...
    HandleInput = function(msg_orig) {
        var msg = _.clone(msg_orig),
			stopOther = true,
            cmdDetails,args,restrict,tracks,
            playlists = [],
            listTracks = [],
            eachTracker,
            tempId;
            
        if (msg.type !== 'api'){
            return;
        }
		if(msg.playerid === 'API' && state.Roll20AM.API === 'gm'){
            msg.playerid = filterObjs((o)=>{
                return(o.get('type') === 'player' && playerIsGM(o.id));
            })[0].id;
		}
		if(playerIsGM(msg.playerid) || !state.Roll20AM.restrict){
		    restrict = false;
		}else{
		    restrict = true;
		}
		
		if(_.has(msg,'inlinerolls')){//calculates inline rolls
			msg.content = inlineExtract(msg);
		}
        
		args = msg.content.split(/\s+--/);//splits the message contents into discrete arguments
	    if(args[0] === '!roll20AM'){
            if(args[1]){
                _.each(_.rest(args,1),(cmd) =>{
                    cmdDetails = cmdExtract(cmd);
                    tracks = getTracks(cmdDetails.tracks,restrict,cmdDetails.details.ignore);
                    _.each(cmdDetails.tracks,(n)=>{
                        if(state.Roll20AM.playLists[n]){
                            playlists.push(n);
                        };
                    });
                    delays.push(setTimeout(delayHandler,cmdDetails.details.delay,cmdDetails,tracks,playlists,msg.playerid));
                });
            }else{
                showHelp(msg.playerid);
            }
    	}
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
	    details;
	    cmdSep.tracks = cmd.split('|');
	    details = cmdSep.tracks.shift();
	    cmdSep.action = details.match(/play|stop|vcontrol|config|listCreate|listEdit|cancelDelay|set|listImport/);
	    if(cmdSep.action){
	        cmdSep.action = cmdSep.action[0];
	    }
	    _.each(details.replace(cmdSep.action+',','').split(','),(d)=>{
            vars=d.match(/(volTick|tickTime|volume|delay|listName|menu|mode|listen|restrict|tag|API|access)(?:\:|=)([^,]+)/) || null;
            if(vars){
                cmdSep.details[vars[1]]=vars[2];
            }else{
                cmdSep.details[d]=d;
            }
        });
        cmdSep.details.delay = cmdSep.details.delay*1000 || 0;
        return cmdSep;
	},
	
	//Handles addition and deletion of tracks, and changing of track properties (e.g. name, volume) via the jukebox interface
	changeHandler = function(obj,prev){
        if(obj.get('softstop')===true && prev.softstop === false){
            _.each(state.Roll20AM.playLists,(list)=>{
                if(list.playing && list.mode !== 'single'){
                    if(list.currentTrack.indexOf(obj.id)>-1){
                        if(list.mode === 'together'){
                            list.currentTrack.splice(obj.id,1);
                            if(list.currentTrack.length===0){
                                playlist(list.name,'play',{});
                            }
                        }else{
                            playlist(list.name,'play',{});
                        }
                    }
                }else if(list.mode === 'single'){
                    state.Roll20AM.playLists[list.name].playing === false;
                }
            });
        }else if(obj.get('volume') !== prev.volume){
            state.Roll20AM.trackDetails[obj.id].volume = obj.get('volume')/state.Roll20AM.masterVolume;
        }
	},
	
    destroyHandler = function(obj){
        delete state.Roll20AM.trackDetails[obj.id];
        _.each(_state.Roll20AM.playLists,(L)=>{
            L.trackids.splice(L.trackids.indexOf(obj.id),1);
        });
    },
    
    RegisterEventHandlers = function() {
        on('chat:message', HandleInput);
        on('change:jukeboxtrack',changeHandler);
        on('add:jukeboxtrack',storeTracks);
        on('destroy:jukeboxtrack',destroyHandler);
        on('destroy:handout',(obj)=>{
            if(obj.id === state.Roll20AM.help){
                log('-=> Roll20AM re-initializing; Roll20AM journal entry deleted.');
                sendChat('Roll20AM',"/w gm It looks like you have deleted the help document for the Roll20AM script. We're regenerating it so that you can easily "
                +"access all the information you need to utilize the script. It will be stored in your archived folder and won't clutter up your journal.");
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
	};
    
}());


on("ready",function(){
    'use strict';
    
    Roll20AM.CheckInstall();
    Roll20AM.RegisterEventHandlers();
});
