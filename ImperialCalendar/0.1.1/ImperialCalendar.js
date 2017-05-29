// Github:   https://github.com/shdwjk/Roll20API/blob/master/ImperialCalendar/ImperialCalendar.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var ImperialCalendar = ImperialCalendar || (function() {
    'use strict';

    var version = '0.1.1',
        lastUpdate = 1485142047,
        schemaVersion = 0.2,
        Uw = (w)=>`&${w};`,
        Un = (n)=>`&#${n};`,
        Unx = (n)=>`&#x${n};`,
        colorHex = (c1,c2)=>`<span style="color:${c1||'#5e322f'};-webkit-text-stroke: ${c2||'#ea6566'} .2em;">${Unx('2b23')}</span>`,
        colorDot = (c1,c2,s1)=>`<span style="background-color: ${c1||'#5e322f'};border: ${(s1||0.8)/4}em solid ${c2||'#ea6566'};width: ${s1||0.8}em;height: ${s1||0.8}em;display:inline-block;border-radius: ${s1||0.8}em;">${Uw('nbsp')}</span>`,
        colors = {
            gm: { dark: '#5e322f', light: '#ea6566' },
            player: { dark: '#506872', light: '#8ac8e1' },
            all: { dark: '#3d6135', light: '#5bbd58' }
        },
        noteDot = {
            gm: colorDot(colors.gm.dark,colors.gm.light,0.6),
            player: colorDot(colors.player.dark,colors.player.light,0.6),
            all: colorDot(colors.all.dark,colors.all.light,0.6)
        },
        images = {
            headerTransparent: 'https://s3.amazonaws.com/files.d20.io/images/27543499/ys8wHPa69UFPqkxeqGNQEg/original.png?1484703811'
        },
        regex = {
            dateSpec: /^([\+-])?\s*(\d+(?:-\d+)?)?\s*([dDwWyY])?$/
        },
	esRE = function (s) {
          var escapeForRegexp = /(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g;
          return s.replace(escapeForRegexp,"\\$1");
        },

    HE = (function(){
      var entities={
              //' ' : '&'+'nbsp'+';',
              '<' : '&'+'lt'+';',
              '>' : '&'+'gt'+';',
              "'" : '&'+'#39'+';',
              '@' : '&'+'#64'+';',
              '{' : '&'+'#123'+';',
              '|' : '&'+'#124'+';',
              '}' : '&'+'#125'+';',
              '[' : '&'+'#91'+';',
              ']' : '&'+'#93'+';',
              '"' : '&'+'quot'+';'
          },
          re=new RegExp('('+_.map(_.keys(entities),esRE).join('|')+')','g');
      return function(s){
        return s.replace(re, function(c){ return entities[c] || c; });
      };
    }()),
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
    outputChat = function(msg){
        sendChat('',msg);
    },

    checkInstall = function() {
		log('-=> ImperialCalendar v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'ImperialCalendar') || state.ImperialCalendar.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.ImperialCalendar = {
                version: schemaVersion,
                config: {
                    holidayName: 'Holiday',
                    dayNames: [
                        'Wonday',
                        'Tuday',
                        'Thirday',
                        'Forday',
                        'Fiday',
                        'Sixday',
                        'Senday'
                    ],
                    showToolTip: true
                },
                current: 407340, // days starting at 0
                noteSeed: 1,
                notes: {
                }
            };
        }
    },

    getConfigOption_DayNames = function(){
        let stcc=state.ImperialCalendar.config,
            mkDay=(n,c,idx)=>`<div style="display:inline-block;padding:.1em .2em;border: 1px solid #666; background-color: #eee; border-radius:.3em;">${n} :: <a href="!cal-config --set-day-name|${idx}|?{Name for ${n}|${c}}">${c}</a></div>`;

        return `<div><div style="font-weight: bold;text-align:center;">Day Names</div>${mkDay('Holiday',stcc.holidayName,'H')}${mkDay('Monday',stcc.dayNames[0],0)}${mkDay('Tuesday',stcc.dayNames[1],1)}${mkDay('Wednesday',stcc.dayNames[2],2)}${mkDay('Thursday',stcc.dayNames[3],3)}${mkDay('Friday',stcc.dayNames[4],4)}${mkDay('Saturday',stcc.dayNames[5],5)}${mkDay('Sunday',stcc.dayNames[6],6)}</div>`;
    },

    getConfigOption_ShowToolTip = function(){
        var text = (state.ImperialCalendar.config.showToolTip ? 'On' : 'Off' );
        return '<div>'+
            'Showing Tool Tips is currently <b>'+ text+ '</b> '+
            '<a href="!cal-config --toggle-tool-tips">'+
                'Toggle'+
            '</a>'+
        '</div>';
    },

    getAllConfigOptions = function() {
        return getConfigOption_DayNames()+
                getConfigOption_ShowToolTip();
    },

    showHelp = function(who) {

        outputChat('/w "'+who+'" '+
'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
	'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
		'ImperialCalendar v'+version+
	'</div>'+
	'<div style="padding-left:10px;margin-bottom:3px;">'+
        '<p>ImperialCalendar provides a fully featured calendar as used in Traveller, Starts without Number, and other scifi games.  It supports notes (public, private, and player specific) and various display formats.</p>'+
        '<h2>Commands</h2>'+
        '<p><code>!cal [&lt;--help|--details|--sparse|--whisper|--set|--note|--remove-note|--show|--show-week|--show-4week|--show-5week|--show-year&gt;|&lt;parameter&gt; ...]</code></p>'+
        '<p><code>!wcal</code> -- An alias for <code>!cal --whisper</code>;</p>'+
        '<h3 >Date Format</h3>'+
        '<p>ImperialCalendar uses dates of the format <code>&lt;day&gt;-&lt;year&gt;</code>, such as <code>023-1116</code>.  The leading <code>0</code>s are optional, so <code>001-0001</code> is the same as <code>1-1</code>.  Anywhere you can use a date, you can also use a relative date by using a number prefixed by either <code>+</code> or <code>-</code>.  These numbers will be used as a day offset from the current day.  You can further suffice these numbers with one of <code>d</code>,<code>w</code>,<code>y</code> to specify days (default), weeks, or years.  (<code>D</code>,<code>W</code>,<code>Y</code> also work.)  In most cases, the <code>+</code> is also optional.  In fact, you can leave off the number and only specify a suffice.  <code>+7d</code> is the same as <code>7d</code>, <code>+7</code>, <code>d</code>, <code>D</code>, <code>+d</code>, <code>+D</code>, <code>+1w</code>, etc.</p>'+
        '<h3 >Display</h3>'+
        '<p>There are two display modes: <strong>Calendar</strong> and <strong>Journal</strong>.</p>'+
        '<h4 >Calendar</h4>'+
        '<p>Shows you days on a grid.  Hover on a day to see it'+ch("'")+'s notes (days with notes have a green background).  Click a day to see the journal for that day.</p>'+
        '<h4 >Journal</h4>'+
        '<p>Shows you the notes for the day or days.  Notes have a button allowing the owner to delete them.  There are buttons by each day for adding notes of each permission type.</p>'+
        '<h3 >Setting the Date</h3>'+
        '<ul>'+
        '<li><code>!cal --set|&lt;date&gt;</code> (GM Only) -- Use <code>--set</code> to adjust the current day.  The current day is what all relative days are calcualted from and is highlighted yellow in the display.  Anywhere you can omit the day in a command, the current day is used instead.  If you specify an invalid day, the current day is used.'+
        '</li>'+
        '<p><code>!cal --set|023-1116</code></p>'+
        '<p><code>!cal --set|+1w</code></p>'+
        '</ul>'+
        '<h3 >Show Commands</h3>'+
        '<p><code>--show[|&lt;date&gt;[|&lt;date&gt; ..]]</code> -- use <code>--show</code> to show a day.</p>'+
        '<p><code>--show-week[|&lt;date&gt;]</code> -- Show the week (Monday-Sunday or the Holiday week) surrounding the provided date or the current date.</p>'+
        '<p><code>--show-4week[|&lt;date&gt;]</code> -- As above, but shows also 1 week prior and 2 weeks hence from the date.</p>'+
        '<p><code>--show-5week[|&lt;date&gt;]</code> -- As above, but shows 2 weeks prior and 2 weeks hence.</p>'+
        '<p><code>--show-year[|&lt;date&gt;]</code> -- Shows the full year including the date.  </p>'+
        '<ul>'+
        '<li><strong>Note:</strong> This is the only command that will treat a bare number as a year. <code>!cal --show-year|1116</code> is equivolent to <code>!cal --show-year|001-1116</code>.</li>'+
        '</ul>'+
        '<p><code>--between|&lt;date&gt;|&lt;date&gt;</code> -- Shows all the days between the two dates.  Relative dates are still realtive to the current day.</p>'+
        '<h4 >Modifiers</h4>'+
        '<p><code>--details</code> -- Causes a list of days and notes to be shown, rather than a grid caldendar. (This is the default for <code>--show</code>)</p>'+
        '<p><code>--sparse</code> -- Causes a detail view to omit any days without notes.</p>'+
        '<h4 >Examples</h4>'+
        '<ul>'+
        '<li><code>!cal --show</code> -- show'+ch("'")+'s the current date.</li>'+
        '<li><code>!cal --show|+1d</code> -- show'+ch("'")+'s tomorrow.</li>'+
        '<li><code>!cal --show|-1w</code> -- show'+ch("'")+'s a week ago.</li>'+
        '<li><code>!cal --show|1-1116|10-1116|16-1116</code> -- show'+ch("'")+'s the 1st, 10th, and 16th days of the year 1116.</li>'+
        '<li><code>!cal --show-week</code> -- show'+ch("'")+'s the current week.</li>'+
        '<li><code>!cal --show-week|+w</code> -- show'+ch("'")+'s next week.</li>'+
        '<li><code>!cal --show-year</code> -- show'+ch("'")+'s the current year.</li>'+
        '<li><code>!cal --between|023-1116|043-1116</code> -- shows all the days from the 23rd to the 43rd of the year 1116.</li>'+
        '<li><code>!cal --between|023-1116|043-1116 --details --sparse</code> -- Shows the days with notes from the 23rd to the 43rd of the year 1116.</li>'+
        '</ul>'+
        '<h4 >Whisper Examples</h4>'+
        '<ul>'+
        '<li><code>!wcal --show</code> -- Whisper the current day.  Whispering is the only time that notes other than public notes are displayed.</li>'+
        '<li><code>!cal --show --whisper</code> -- Idential to the above.</li>'+
        '</ul>'+
        '<h3 >Note commands</h3>'+
        '<p><code>--note[|day][[|who] ...]|&lt;note text&gt;</code> -- adds a note.  If you omit the day, it is added for the current day.  You can specify who can see a note.  Use <code>gm</code> or <code>private</code> for a gm only note (also the default, you can just leave it off), <code>all</code> for a public note, or some part of a player'+ch("'")+'s name to restrict it to just the matching players.  You can specify multiple <code>|</code> separated players.</p>'+
        '<p><code>--remove-note[|day]|&lt;all|index&gt;</code> -- removes a note.  If you omit the date, it removes from the current day.  If you specify <code>all</code>, it will remove all the notes you created on that day (or all notes if you are the gm). If you specify a number, it will remove that index from the specified day (counting from the beginning, starting at 0).</p>'+
        '<h4 >Examples</h4>'+
        '<ul>'+
        '<li><code>!cal --note|all|Hi everyone</code> -- adds a note on the current day for all players.</li>'+
        '<li><code>!cal --note|Secret note.</code> -- adds a note for just the GM.</li>'+
        '<li><code>!cal --note|tom|Tom'+ch("'")+'s note.</code> -- adds a note for all players with <code>tom</code> in there name (ignoreing spaces and capitalization).</li>'+
        '<li><code>!cal --note|sally|tom|bob|Small group note.</code> -- adds a note for 3 or more players.</li>'+
        '<li><code>!cal --note|10-1116|Bomb goes off.</code> -- adds a GM note on the 10th of the year 1116.</li>'+
        '<li><code>!cal --note|10-1116|all|A good day to be off planet.</code> -- adds a note for all players on the 10th of the year 1116.</li>'+
        '<li><code>!cal --remove-note|0</code> -- removes the first note on the current day.</li>'+
        '<li><code>!cal --remove-note|all</code> -- removes all the notes on the current day.</li>'+
        '</ul>'+
    '</div>'+
	'<b>Configuration</b>'+
    getAllConfigOptions()+
'</div>'
        );
    },

    dayName = function(i){
        return (_.isNumber(i) ? state.ImperialCalendar.config.dayNames[((i%7)+7)%7] : state.ImperialCalendar.config.holidayName );
    },

    dayToDate = function(num){
        let y=Math.floor(num/365),
            d=((num%365)+365)%365,
            dow = (!d ? 'H' : (d-1)%7);
        return {
            year: y,
            doy: d+1,
            dow: dow,
            woy: Math.floor((d-1)/7),
            dayname: (!d ? 'Holiday' : dayName(dow))
        };
    },

    generateNoteID = function(){
        return ++state.ImperialCalendar.noteSeed;
    },

    parseDate = function(date){
        let p=(date+'').match(regex.dateSpec),
            day=state.ImperialCalendar.current;
        if(p){
            let rel=!!(p[1]&&p[1].length)||(p[3]&&p[3].length),
                dir=(rel&&parseInt((p[1]||'')+'1',10))||1,
                scale=({d:1, D:1, w:7, W:7, y:365, Y:365}[p[3]])||1,
                d=p[2]||'1',
                dParts=d.match(/(\d+)-(\d+)/);
            day=(rel?day:0)+(dir*(dParts?((parseInt(dParts[2],10)||0)*365+((parseInt(dParts[1],10)-1)||0)):(d*scale)));
        }
        return day;
    },

    zeroPad = function (num,d) {
        let neg = (num<0);
        d=d || 2;
        return ('0000000'+Math.abs(num)).slice(-d)+(neg?'-':'');
    },

    getNotes = function(range,opts){
        return _.chain(range)
            .reduce((m,d)=>{
                if(_.has(state.ImperialCalendar.notes,d)){
                    m[d]= _.filter(state.ImperialCalendar.notes[d],(n)=>(opts.whisper && (opts.isGM || _.contains(n.permissions,opts.whoID) || n.owner===opts.whoID)) || _.contains(n.permissions,'all') );
                    if(!m[d].length){
                        delete m[d];
                    }
                }
                return m;
            },{})
            .value();
    },

    formatDate = function(num){
        let d=dayToDate(num);
        return `${zeroPad(d.doy,3)}-${zeroPad(d.year,4)}`;
    },

    keyFormat = function(text) {
        return (text && text.toLowerCase().replace(/\s+/,'')) || undefined;
    },
    matchKey = function (keys,subject){
        return subject && !_.isUndefined(_.find(keys,(o)=>(-1 !== subject.indexOf(o))));
    },

    argHandlers = {
        'details': _.constant(true),
        'sparse': _.constant(true),
        'whisper': _.constant(true),
        'set': (args)=>parseDate(args[0].length ? args[0].shift() : ''),
        'show': (args)=>{
            return _.chain(args)
                .map((v)=>{
                    return  v.length ? _.map(v,parseDate) : state.ImperialCalendar.current;
                })
                .flatten()
                .sortBy(_.identity)
                .uniq()
                .value()
                ;
        },
        'show-week': (args)=>{
            let day= parseDate( args[0].length ? args[0].shift() : state.ImperialCalendar.current ),
                d=dayToDate(day);
            return (d.doy !== 1 ? [day-d.dow,day+(6-d.dow)] : [day,day]);
        },
        'show-4week': (args)=>{
            let day= parseDate( args[0].length ? args[0].shift() : state.ImperialCalendar.current ),
                d=dayToDate(day);
            return (d.doy !== 1 ? [day-d.dow-7,day+(6-d.dow)+14] : [day-7,day+14]);
        },
        'show-5week': (args)=>{
            let day= parseDate( args[0].length ? args[0].shift() : state.ImperialCalendar.current ),
                d=dayToDate(day);
            return (d.doy !== 1 ? [day-d.dow-14,day+(6-d.dow)+14] : [day-14,day+14]);
        },
        'show-year': (args)=>{
            let day= parseDate(args[0].length ? (args[0][0].match(/^\d*$/) ? '1-'+args[0][0] : args[0][0] ) : state.ImperialCalendar.current ),
                d=dayToDate(day),
                d0=d.year*365;
            return [d0,d0+364];
        },
        'between': (args)=>[parseDate( args[0].length ? args[0].shift() : state.ImperialCalendar.current ), parseDate( args[0].length ? args[0].shift() : state.ImperialCalendar.current )],
        'note': (args)=>_.map(args,(arg)=>{
            let retr={
                    text:arg.pop(),
                    day: false,
                    permissions:[]
                },
                playerKeys=[];
            _.each(arg,(a)=>{
                if(!retr.day && regex.dateSpec.test(a)){
                    retr.day = parseDate(a);
                } else {
                    a=a.toLowerCase();
                    switch(a){
                        case 'gm':
                        case 'private':
                            retr.permissions=[];
                            break;
                        case 'all':
                        case 'public':
                            retr.permissions=['all'];
                            break;
                        default:
                            playerKeys.push(keyFormat(a));
                            break;
                    }
                }
            });
            if(playerKeys.length && !_.contains(retr.permission, 'all') ){
                let playerids=_.chain(filterObjs((o)=>{
                        return o && o.get('type') ==='player' && matchKey(playerKeys,keyFormat(o.get('displayname')));
                    }))
                    .map(p=>p.id)
                    .uniq()
                    .value();
                retr.permissions=_.union(retr.permissions,playerids);
            }
            retr.day=retr.day||state.ImperialCalendar.current;
            return retr;
        }),
        'remove-note': (args)=>_.map(args,(arg)=>{
            let retr;
            if(2 === arg.length && /^(all|ID:\d+|\d+)$/i.test(arg[1])){
                retr={
                    day: parseDate(arg[0]),
                    id: (/^ID:/.test(arg[1]) ? parseInt(arg[1].substring(3),10) : undefined ),
                    index: ('all'===arg[1] ? 'all' : ( /^\d+$/.test(arg[1]) ? parseInt(arg[1],10) : undefined))
                };
            }
            return retr;
        })
    },

    paraphraseString = function(str,maxLen){
        if(str.len<=maxLen){
            return str;
        }
        return str.substring(0,maxLen)+'...';
    },

    parseArgs = function(args,defaults){
        return _.chain(args)
            .reduce((m,a)=>{
                let sp=a.split(/\|/),
                    aName = sp.shift();
                m[aName] = (m[aName]||[]);
                m[aName].push(sp);
                return m;
            },{})
            .pick(_.keys(argHandlers))
            .mapObject((v,k)=>argHandlers[k](v))
            .defaults(defaults)
            .value();
    },
    buttonMaker = function(command,text,tip,style){
        let tipExtra=(tip && state.ImperialCalendar.config.showToolTip ? `class="showtip tipsy" title="${HE(HE(tip))}"` :'');
        return `<a ${tipExtra} style="color:white;background-color:#dc2b19;border: 1px solid #dc2b19;border-radius:1em;display:inline-block;height:1em;line-height:1em;min-width:1em;padding:1px;margin:0;margin-left:.2em;text-align:center;${style||''}" href="${HE(command)}">${text}</a>`;
    },
    formatNote = function(note,opts){
        let noteType =(note.permissions.length ? (_.contains(note.permissions,'all')? 'all':'player'): 'gm'),
            symbol = noteDot[noteType],
            bullet = (s)=>`<span style="position:absolute;left:-1.25em;top:.15em;">${s}</span>`,
            row = (b,btn,txt,clr) => `<span style="display:block;position:relative;margin: 0 0 .1em 1.5em;padding: .1em .1em .1em .8em; border: 1px solid #666;border-bottom-left-radius: 1em;background-color: ${clr}">${b} ${btn} ${txt}</span>`,

            button = (opts.details ? `<span style="display:block;float:right;font-size:.8em;">${buttonMaker(`!wcal -?{Remove note "${paraphraseString(note.text,10)}", are you sure?|Yes,-|No,-no-}remove-note|${note.day}|ID:${note.id}`,Unx('20e0'),'Delete')}</span>` : '');

        return row(bullet(symbol),button,note.text,colors[noteType].dark);
    },

    formatDayFull = function(day,notes,opts){
        let d=dayToDate(day),
            dayColor=(day===state.ImperialCalendar.current ? '#fef900' : 'white'),
            addAll=buttonMaker(`!wcal --note|${day}|all|?{Note text (public)}`,'A','Add<br>Public<br>Note',`background-color:${colors.all.dark};border:1px solid ${colors.all.light};`),
            addPlayer=buttonMaker(`!wcal --note|${day}|?{List of Players separated by ${Unx('2502')} }|?{Note text (players)}`,'P','Add<br>Player<br>Note',`background-color:${colors.player.dark};border:1px solid ${colors.player.light};`),
            addGM=buttonMaker(`!wcal --note|${day}|gm|?{Note text (private)}`,'G','Add<br>Private<br>Note',`background-color:${colors.gm.dark};border:1px solid ${colors.gm.light};`),
            buttons=`<span style="display:block;float:right;font-size:.8em;">${addAll}${addPlayer}${addGM}</span>`;
        return `<div><div><b style="color:${dayColor};">${formatDate(day)} - ${d.dayname}</b> ${buttons}</div>${ _.isArray(notes) ? _.map(notes,(n)=>formatNote(n,opts)).join('') :'' }</div>`;
    },

    formatDaySmall = function(day,notes,opts){
        let d=dayToDate(day),
            borderColor=(day===state.ImperialCalendar.current ? '#fef900' : '#666'),
            dayHeader=`<span style="display:block;background-image: url('${images.headerTransparent}');background-position: bottom right;background-repeat: no-repeat;background-size: auto 1.5em;color: #fe0000;font-weight: bold;line-height:1em;font-size: 2em;text-align: center;font-style: italic;font-variant: small-caps;padding: .3em 1.3em .6em .2em;">${formatDate(day)}</span>`,
            tipExtra=( (_.isArray(notes) && notes.length) ? `class="showtip tipsy" title="${HE(HE(`<span style="margin:0;padding:.1em .3em;display:block;background-color:#231f20;color:white;width:200px;">${dayHeader}${_.map(notes,(n)=>formatNote(n,opts)).join('')}<span style="display:block;text-align:center;font-size:.8em;font-style:italic;">Click for Full Access</span></span>`))}"` : ''),
            styleExtra = (_.isArray(notes) && notes.length) ? `background-color:${colors.all.dark};` : '';

        return `<div ${tipExtra} style="display:inline-block;box-sizing:border-box;padding:.1em .2em; min-width:1em;border:1px solid ${borderColor};width:2em;text-align:right;${styleExtra}"><a style="padding:0;margin:0;background-color:transparent;line-height:1em;min-width:1em;color:inherit;border:0;display:inline;" href="${HE(`!wcal --show|${day} --details`)}">${zeroPad(d.doy,3)}</a></div>`;
    },
	formatDayEmpty = function(){
        return `<div style="display:inline-block;box-sizing:border-box;padding:.1em .2em; min-width:1em;border:1px solid #333;width:2em;text-align:right;">&nbsp;</div>`;
	},
    formatWeek = function(days){
        return `<div style="display:inline-block;white-space:nowrap;margin-right:.4em;">${days.join('')}</div>`;
    },
    createHolidayWeek = function(day,notes,opts){
        let d=dayToDate(day);
        return [`<div><div style="display:inline-block;margin-bottom:.5em;box-sizing:border-box;padding:.1em .2em; min-width:1em;border:1px solid #666;text-align:right;font-variant:small-caps; background-color:#425365;"><span style="font-size:.75em;">${d.dayname}</span></div>${formatDaySmall(day,notes,opts)}</div>`];
	},
    formatYear = function(year){
        return `<div style="margin-bottom: .5em;"><div style="border-bottom: .25em solid white;margin: .2em 0"><div style="font-weight: bold;font-size: 1em;border-color: white;border-width: 1px .3em 0 1px;border-radius: 0 3em 0 0;border-style: solid;display: inline-block;line-height: 2em;padding: 0.1em 4em 0.1em 3em;border-left: 1px solid #666;font-variant:small-caps;">Year ${year.year}</div></div>${year.weeks.join('')}</div>`;
    },

    

    showDays = function(begin,end,opts){
        let range;
        if(_.isArray(begin)){
            range = begin;
            opts=end;
        } else {
            let dateLow = (_.isNumber(begin)&&!_.isNaN(begin))? begin : state.ImperialCalendar.current ,
                dateHigh = (_.isNumber(end)&&!_.isNaN(end))?end:begin;
            if(dateHigh<dateLow){
                let dateTmp = dateHigh;
                dateHigh=dateLow;
                dateLow=dateTmp;
            }
            range = _.range(dateLow,dateHigh+1);
        }
            
        let notes=getNotes(range,opts),
            preface=(opts.whisper?`/w "${opts.who}" `:''),
            message,
            mainWrapper = (inner)=>`<div style="background-color: #231f20;border-radius:0.07em;padding: .1em; color: white;">${inner}</div>`,
            contentWrapper = (inner)=>`<div style="padding: .3em .8em;">${inner}</div>`,

            header=`<div style="background-image: url('${images.headerTransparent}');background-position: bottom right;background-repeat: no-repeat;background-size: auto 1.5em;color: #fe0000;font-weight: bold;line-height:1em;font-size: 2em;text-align: center;font-style: italic;font-variant: small-caps;padding: .3em 1.3em .6em .2em;">Imperial Calendar</div>`,
            bData=dayToDate(begin);

            // details is a list
            if(opts.details){
                if(opts.sparse) {
                    range=_.keys(notes);
                }
                message=_.map(range,(d)=>formatDayFull(d,notes[d],opts)).join('');
            } else {
                let years={};
                message = _.chain(range)
                    .reduce((years,d)=>{
                        let day=dayToDate(d),
                            pad=false;

                        if(!years[day.year]){
                            pad=true;
                            years[day.year]=(years[day.year]||{
                                year:day.year,
                                weeks:[],
                                accum:[]
                            });
                        }

                        if(1 === day.doy){
                            years[day.year].weeks.push(createHolidayWeek(d,notes[d],opts));
                        } else {
                            if(pad && day.dow){
                                _.times(day.dow,() => years[day.year].accum.push(formatDayEmpty()));
                            }
                            years[day.year].accum.push(formatDaySmall(d,notes[d],opts));

                            if(7===years[day.year].accum.length){
                                years[day.year].weeks.push(formatWeek(years[day.year].accum));
                                years[day.year].accum=[];
                            }
                        }
                        return years;
                    },{})
                    .map((y)=>{
                        if(y.accum.length){
                            _.times(7-y.accum.length,()=>y.accum.push(formatDayEmpty()));
                            y.weeks.push(formatWeek(y.accum));
                            y.accum=[];
                        }
                        return formatYear(y);
                    })
                    .value()
                    .join('');
            }

        outputChat(`${preface} ${mainWrapper(`${header} ${contentWrapper(message)}`)}`);
    },

    handleInput = function(msg) {
        var args,
            who,
                msgDefs={
                whisper:false,
                details:false
            };

        if (msg.type !== "api") {
            return;
        }
        who = (getObj('player',msg.playerid)||{get:_.noop}).get('displayname');

        args = msg.content.split(/\s+--/);
        switch(args.shift()) {
            case '!wcal':
                msgDefs.whisper=true;
                /* falls through */
            case '!cal':
                if(_.contains(args,'help')){
                    showHelp(who);
                    return;
                }

                args=parseArgs(args,msgDefs);
                args.who=who;
                args.whoID=msg.playerid;
                args.isGM=playerIsGM(msg.playerid);

                // change events
                _.each(args, (v,k)=>{
                    switch(k){
                        case 'set': 
                            if(args.isGM) {
                                state.ImperialCalendar.current=v;
                                args.show=_.sortBy(_.union((args.show||[]),[v]),_.identity);
                                args.details=true;
                                args.whisper=true;
                            }
                            break;

                        case 'note':
                            _.each(v,(n)=>{
                                n.owner=args.whoID;
                                n.id=generateNoteID();
                                state.ImperialCalendar.notes[n.day]=state.ImperialCalendar.notes[n.day]||[];
                                state.ImperialCalendar.notes[n.day].push(n);
                                args.show=_.sortBy(_.union((args.show||[]),[n.day]),_.identity);
                            });
                            args.details=true;
                            args.whisper=true;
                            break;

                        case 'remove-note':
                            _.each(v,(n)=>{
                                if(_.has(state.ImperialCalendar.notes,n.day)){
                                    if('all' === n.index) {
                                        if(args.isGM){
                                            delete state.ImperialCalendar.notes[n.day];
                                            args.show=_.sortBy(_.union((args.show||[]),[n.day]),_.identity);
                                        } else {
                                            let lenPre=state.ImperialCalendar.notes[n.day].length;
                                            _.each(_.reduce(state.ImperialCalendar.notes[n.day],(m,d,i)=>{
                                                if(d.owner===args.whoID){
                                                    m.push(i);
                                                }
                                                return m;
                                            },[]).sort().reverse(),(idx)=>state.ImperialCalendar.notes[n.day].splice(idx,1));
                                            if(lenPre !== state.ImperialCalendar.notes[n.day].length){
                                                args.show=_.sortBy(_.union((args.show||[]),[n.day]),_.identity);
                                            }
                                        }
                                    } else if(_.has(n,'id')) {
                                        let note = _.find(state.ImperialCalendar.notes[n.day],(o)=>o.id===n.id );
                                        if(note && (args.isGM || note.owner===args.whoid)){
                                            state.ImperialCalendar.notes[n.day]=_.without(state.ImperialCalendar.notes[n.day],note);
                                            args.show=_.sortBy(_.union((args.show||[]),[n.day]),_.identity);
                                        }
                                    } else if(_.has(state.ImperialCalendar.notes[n.day],n.index) && (args.isGM || state.ImperialCalendar.notes[n.day][n.index].owner===args.whoID) ) {
                                        state.ImperialCalendar.notes[n.day].splice(n.index,1);
                                        args.show=_.sortBy(_.union((args.show||[]),[n.day]),_.identity);
                                    }
                                }
                            });
                            args.details=true;
                            args.whisper=true;
                            break;
                            
                    }
                });

                if( !_.intersection(['show','show-week','show-4week','show-5week','show-year','between'],_.keys(args)).length ){
                    args.show=[state.ImperialCalendar.current];
                    args.details=true;
                }

                // display events
                _.each(args, (v,k)=>{
                    switch(k){

                        case 'show':
                            args.details=true;
                            showDays(v,args);
                            break;

                        case 'show-week':
                        case 'show-year':
                        case 'show-4week':
                        case 'show-5week':
                        case 'between':
                            showDays(v[0],v[1],args);
                            break;
                    }
                });

                break;

            case '!cal-config':
				if(!playerIsGM(msg.playerid)){
					return;
				}
                if(_.contains(args,'help')){
                    showHelp(who);
                    return;
                }
                if(!args.length) {
                    sendChat('','/w gm '+
                        '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                            '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
                                'ImperialCalendar v'+version+
                            '</div>'+
                            getAllConfigOptions()+
                        '</div>'
                    );
                    return;
                }
                _.each(args,function(a){
                    var opt=a.split(/\|/),
                        omsg='';
                    switch(opt.shift()) {
                        case 'toggle-tool-tips': 
                            state.ImperialCalendar.config.showToolTip = !state.ImperialCalendar.config.showToolTip;
                            sendChat('','/w gm '+
                                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                                    getConfigOption_ShowToolTip()+
                                '</div>'
                            );
                            break;
                        case 'set-day-name':
                            if('H'===opt[0]){
                                state.ImperialCalendar.config.holidayName=opt[1];
                            } else {
                                let key=parseInt(opt[0],10);
                                if(_.contains(_.keys(state.ImperialCalendar.config.dayNames),key)){
                                    state.ImperialCalendar.config.dayNames[key]=opt[1];
                                }
                            }
                            sendChat('','/w gm '+
                                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                                    getConfigOption_DayNames()+
                                '</div>'
                            );
                            break;
                    }
                });
                // Commands
                    // Settings
                    // Weekday names
                break;
        }
    },

    registerEventHandlers = function() {
        on('chat:message', handleInput);
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
    
}());

on('ready',function() {
    'use strict';

    ImperialCalendar.CheckInstall();
    ImperialCalendar.RegisterEventHandlers();
});




