/*
Calendar for Eberron, Faerun, Greyhawk, Modern and Tal'Dorei Settings
Original created by Kirsty (https://app.roll20.net/users/1165285/kirsty)
Using NoteLog Script from Aaron (https://app.roll20.net/users/104025/the-aaron)
API Commands:
!cal - Shows the menu to the person that issued the Command. GM menu has more Options.
    --world {world}- Allows the GM to change the world to one of the Options (Eberron, Faerun, Greyhawk, Modern, Tal'Dorei)
    --adv {type} --{amount} - Allows the GM to advance the time by a certain amount and a certain type (Short Rest, Long Rest, Hour, Minute, Day, Week, Month, Year)
    --set {type} --{amount} - Allows the GM to set the day, month, year etc.
    --weather {type} - Allows the GM to set the weather. Putting "Random" will randomise the weather.
    --toggle {weather/moon} - Allows the GM to toggle the weather and moon Display.
    --moon {type} - Allows the GM to set the moon state. Putting "Random" will randomise it.
    --enc - Rolls on the Encounter table. (coming soon)
    --reset - Will reset everything.
!alarm --{number} - Lets you set a specific Alarm. Type a number from 1 to 10 in {number}.
    --title {title} - Sets the title of the Alarm.
    --date {date} - Sets the Alarm to a certain date. This uses the following format: DD.MM.YYYY (type the name of the month, number support coming soon)
    --time {time} - Sets the Alarm to a certain time. This uses the following format (24 Hour): HH:MM
*/
var Calendar = Calendar || (function() {
    'use strict';
    
    var version = "5.0c",
    
    setDefaults = function() {
        state.calendar = {
            now: {
                world: 1,
                ordinal: 1,
                year: 1486,
                divider: 1,
                day: 1,
                month: "Hammer",
                hour: 1,
                minute: 0,
                weather: "It is a cool but sunny day",
                moon: "Full Moon",
                moonImg: "",
                mtype: "ON",
                wtype: "ON"
            }
        };
    },
    
    setAlarmDefaults = function() {
        state.Alarm1 = {
            now: {
                day: 1,
                month: "",
                year: 1486,
                hour: 1,
                minute: 0,
                title: ""
            }
        };
    },
    
    handleInput = function(msg) {
        var args=msg.content.split(/\s+--/);
        if (msg.type!=="api") {
            return;
        }
        
        if (playerIsGM(msg.playerid)) {
            if (args[0]=="!cal") {
                if (!args[1] || args[1]=="") {
                    calmenu();
                    chkalarms();
                } else if ((args[1].toLowerCase()).includes("world")) {
                    let option=(args[1].toLowerCase()).replace("world ","");
                    if (option.includes("random")) {
                        let rand=randomInteger(5);
                        state.calendar.now.world=rand;
                    } else if (option.includes("eberron")) {
                        state.calendar.now.world=4;
                    } else if (option.includes("faerun")) {
                        state.calendar.now.world=1;
                    } else if (option.includes("greyhawk")) {
                        state.calendar.now.world=2;
                    } else if (option.includes("modern")) {
                        state.calendar.now.world=3;
                    } else if (option.includes("tal")) {
                        state.calendar.now.world=5;
                    }
                } else if ((args[1].toLowerCase()).includes("adv")) {
                    let type=String(args[1].toLowerCase()).replace("adv ","");
                    let amount=Number(args[2]);
                    switch (type) {
                        case 'short rest':
                            addtime(amount,"hour");
                            return;
                        case 'long rest':
                            addtime(amount*8,"hour");
                            return;
                        case 'hour':
                            addtime(amount,"hour");
                            return;
                        case 'minute':
                            addtime(amount,"minute");
                            return;
                        case 'day':
                            advdate(amount,"day");
                            return;
                        case 'weel':
                            advdate(amount*7,"day");
                            return;
                        case 'month':
                            advdate(amount,"month");
                            return;
                        case 'year':
                            advdate(amount,"year");
                            return;
                    }
                } else if ((args[1].toLowerCase()).includes("set")) {
                    let type=String(args[1].toLowerCase()).replace("set ","");
                    let amount=Number(args[2]);
                    if (type.includes("hour")) {
                        state.calendar.now.hour=amount;
                    } else if (type.includes("minute")) {
                        state.calendar.now.minute=amount;
                    } else if (type.includes("day")) {
                        switch (Number(state.calendar.now.world)) {
                            case 1:
                                getFaerunOrdinal(amount,state.calendar.now.month);
                                return;
                            case 2:
                                getGreyhawkOrdinal(amount,state.calendar.now.month);
                                return;
                            case 3:
                                getModernOrdinal(amount,state.calendar.now.month);
                                return;
                            case 4:
                                getEberronOrdinal(amount,state.calendar.now.month);
                                return;
                            case 5:
                                getTalOrdinal(amount,state.calendar.now.month);
                        }
                    } else if (type.includes("month")) {
                        let month=args[2].toLowerCase();
                        switch (Number(state.calendar.now.world)) {
                            case 1:
                                getFaerunOrdinal(state.calendar.now.day,month);
                                return;
                            case 2:
                                getGreyhawkOrdinal(state.calendar.now.day,month);
                                return;
                            case 3:
                                getModernOrdinal(state.calendar.now.day,month);
                                return;
                            case 4:
                                getEberronOrdinal(state.calendar.now.day,month);
                                return;
                            case 5:
                                getTalOrdinal(state.calendar.now.day,month);
                                return;
                        }
                    } else if (type.includes("year")) {
                        state.calendar.now.year=Number(args[2]);
                    }
                    calmenu();
                    chkalarms();
                } else if ((args[1].toLowerCase()).includes("weather")) {
                    weather((args[1].toLowerCase()).replace("weather ",""));
                    calmenu();
                    chkalarms();
                } else if ((args[1].toLowerCase()).includes("toggle")) {
                    let type=args[1].replace("toggle ","");
                    if (type=="weather") {
                        switch (state.Calendar.now.wtype) {
                            case 'ON':
                                state.Calendar.now.wtype="OFF";
                                return;
                            case 'OFF':
                                state.Calendar.now.wtype="ON";
                                return;
                        }
                    } else if (type=="moon") {
                        switch (state.Calendar.now.mtype) {
                            case 'ON':
                                state.Calendar.now.mtype="OFF";
                                return;
                            case 'OFF':
                                state.Calendar.now.mtype="ON";
                                return;
                        }
                    }
                    calmenu();
                } else if ((args[1].toLowerCase()).includes("moon")) {
                    moon((args[1].toLowerCase()).replace("moon ",""));
                    calmenu();
                    chkalarms();
                } else if ((args[1].toLowerCase()).includes("enc")) {
                    encounter();
                    calmenu();
                    chkalarms();
                } else if ((args[1].toLowerCase()).includes("reset")) {
                    reset();
                    calmenu();
                }
            } else if (args[0]=="!alarm") {
                if (!args[2]) {
                    alarmmenu(args[1]);
                } else {
                    createAlarm(args[1],args[2]);
                }
            }
        } else if (!playerIsGM(msg.playerid)) {
            if (args[0]=="!cal") {
                showcal(msg);
            }
        }
    },

    calmenu = function() {
        var divstyle = 'style="width: 220px; border: 1px solid black; background-color: #ffffff; padding: 5px;"';
        var astyle1 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 100px;';
        var astyle2 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 150px;';
        var tablestyle = 'style="text-align:center;"';
        var arrowstyle = 'style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid rgb(126, 45, 64); margin-bottom: 2px; margin-top: 2px;"';
        var headstyle = 'style="color: rgb(126, 45, 64); font-size: 18px; text-align: left; font-variant: small-caps; font-family: Times, serif;"';
        var substyle = 'style="font-size: 11px; line-height: 13px; margin-top: -3px; font-style: italic;"';
        var tdstyle = 'style="padding: 2px; padding-left: 5px; border: none;"';
        var world=getWorld();
        var moMenu = getMoMenu();
        var ordinal = state.calendar.now.ordinal;
        var nowDate;
        switch (Number(state.calendar.now.world)) {
            case 1:
                nowDate=getFaerunDate(ordinal).split(',');
                return;
            case 2:
                nowDate=getGreyhawkDate(ordinal).split(',');
                return;
            case 3:
                nowDate=getModernDate(ordinal).split(',');
                return;
            case 4:
                nowDate=getEberronDate(ordinal).split(',');
                return;
            case 5:
                nowDate=getTalDate(ordinal).split(',');
                return;
        }
        var month=nowDate[0];
        var day=nowDate[1];
        state.Calendar.now.day=day;
        state.Calendar.now.month=month;
        var suffix=getSuffix(day);
        var hour=state.calendar.now.hour;
        var min=state.calendar.now.minute;
        var year = state.calendar.now.year;
        if (hour<10) {
            hour="0"+hour;
        }
        if (min<10) {
            min="0"+min;
        }
        let weather;
        switch (state.Calendar.now.wtype) {
            case 'ON':
                weather=state.Calendar.now.weather;
                break;
            case 'OFF':
                weather=undefined;
                break;
        }
        let moon;
        switch (state.Calendar.now.mtype) {
            case 'ON':
                moon=state.Calendar.now.moon;
                break;
            case 'OFF':
                moon=undefined;
        }
        if (weather && moon) {
            sendChat("Calendar","/w gm <div " + divstyle + ">" + //--
                '<div ' + headstyle + '>Calendar</div>' + //--
                '<div ' + substyle + '>Menu</div>' + //--
                '<div ' + arrowstyle + '></div>' + //--
                '<table' + tablestyle + '>' + //--
                '<tr><td ' + tdstyle + '>World: </td><td ' + tdstyle + '>' + world + '</td></tr>' + //--
                '<tr><td ' + tdstyle + '>Day: </td><td ' + tdstyle + '><a ' + astyle1 + '" href="!cal --set Day --?{Day?|1}">' + day + suffix + '</a></td></tr>' + //--
                '<tr><td ' + tdstyle + '>Month: </td><td ' + tdstyle + '><a ' + astyle1 + '" href="!cal --set Month --' + moMenu + '">' + month + '</a></td></tr>' + //-- 
                '<tr><td ' + tdstyle + '>Year: </td><td ' + tdstyle + '><a ' + astyle1 + '" href="!cal --set Year --?{Year?|'+year+'}">' + year + '</a></td></tr>' + //--
                '<tr><td ' + tdstyle + '>Hour: </td><td ' + tdstyle + '><a ' + astyle1 + '" href="!cal --set Hour --?{Hour?|'+state.calendar.now.hour+'}">' + hour + '</a></td></tr>' + //--
                '<tr><td ' + tdstyle + '>Minute: </td><td ' + tdstyle + '><a ' + astyle1 + '" href="!cal --set Minute --?{Minute?|'+state.calendar.now.minute+'}">' + min + '</a></td></tr>' + //--
                '<tr><td ' + tdstyle + '>Moon: </td><td ' + tdstyle + '><a ' + astyle1 + '" href="!cal --moon ?{Moon?|Full Moon|Waning Gibbous|Last Quarter|Waning Crescent|New Moon|Waxing Crescent|First Quarter|Waxing Gibbous|Random}">' + moon + '</a></td></tr>' + //--
                '<tr><td ' + tdstyle + '>Weather: </td><td ' + tdstyle + '>' + weather + '</td></tr>' + //--
                '</table>' + //--
                '<div style="text-align:center;"><a ' + astyle2 + '" href="!cal --adv ?{Type?|Short Rest|Long Rest|Hour|Minute|Day|Week|Month|Year} --?{Amount?|1}">Advance the Date</a></div>' + //--
                '<div style="text-align:center;"><a ' + astyle2 + '" href="!cal --enc">Roll Encounter</a></div>' + //--
                '<div style="text-align:center;"><a ' + astyle2 + '" href="!cal --toggle weather">Toggle Weather Display</a></div>' + //--
                '<div style="text-align:center;"><a ' + astyle2 + '" href="!cal --toggle moon">Toggle Moon Display</a></div>' + //--
                '</div>'
            );
        } else if (weather && !moon) {
            sendChat("Calendar","/w gm <div " + divstyle + ">" + //--
                '<div ' + headstyle + '>Calendar</div>' + //--
                '<div ' + substyle + '>Menu</div>' + //--
                '<div ' + arrowstyle + '></div>' + //--
                '<table' + tablestyle + '>' + //--
                '<tr><td ' + tdstyle + '>World: </td><td ' + tdstyle + '>' + world + '</td></tr>' + //--
                '<tr><td ' + tdstyle + '>Day: </td><td ' + tdstyle + '><a ' + astyle1 + '" href="!cal --set Day --?{Day?|1}">' + day + suffix + '</a></td></tr>' + //--
                '<tr><td ' + tdstyle + '>Month: </td><td ' + tdstyle + '><a ' + astyle1 + '" href="!cal --set Month --' + moMenu + '">' + month + '</a></td></tr>' + //-- 
                '<tr><td ' + tdstyle + '>Year: </td><td ' + tdstyle + '><a ' + astyle1 + '" href="!cal --set Year --?{Year?|'+year+'}">' + year + '</a></td></tr>' + //--
                '<tr><td ' + tdstyle + '>Hour: </td><td ' + tdstyle + '><a ' + astyle1 + '" href="!cal --set Hour --?{Hour?|'+state.calendar.now.hour+'}">' + hour + '</a></td></tr>' + //--
                '<tr><td ' + tdstyle + '>Minute: </td><td ' + tdstyle + '><a ' + astyle1 + '" href="!cal --set Minute --?{Minute?|'+state.calendar.now.minute+'}">' + min + '</a></td></tr>' + //--
                '<tr><td ' + tdstyle + '>Weather: </td><td ' + tdstyle + '>' + weather + '</td></tr>' + //--
                '</table>' + //--
                '<div style="text-align:center;"><a ' + astyle2 + '" href="!cal --adv ?{Type?|Short Rest|Long Rest|Hour|Minute|Day|Week|Month|Year} --?{Amount?|1}">Advance the Date</a></div>' + //--
                '<div style="text-align:center;"><a ' + astyle2 + '" href="!cal --enc">Roll Encounter</a></div>' + //--
                '<div style="text-align:center;"><a ' + astyle2 + '" href="!cal --toggle weather">Toggle Weather Display</a></div>' + //--
                '<div style="text-align:center;"><a ' + astyle2 + '" href="!cal --toggle moon">Toggle Moon Display</a></div>' + //--
                '</div>'
            );
        } else if (!weather && moon) {
            sendChat("Calendar","/w gm <div " + divstyle + ">" + //--
                '<div ' + headstyle + '>Calendar</div>' + //--
                '<div ' + substyle + '>Menu</div>' + //--
                '<div ' + arrowstyle + '></div>' + //--
                '<table' + tablestyle + '>' + //--
                '<tr><td ' + tdstyle + '>World: </td><td ' + tdstyle + '>' + world + '</td></tr>' + //--
                '<tr><td ' + tdstyle + '>Day: </td><td ' + tdstyle + '><a ' + astyle1 + '" href="!cal --set Day --?{Day?|1}">' + day + suffix + '</a></td></tr>' + //--
                '<tr><td ' + tdstyle + '>Month: </td><td ' + tdstyle + '><a ' + astyle1 + '" href="!cal --set Month --' + moMenu + '">' + month + '</a></td></tr>' + //-- 
                '<tr><td ' + tdstyle + '>Year: </td><td ' + tdstyle + '><a ' + astyle1 + '" href="!cal --set Year --?{Year?|'+year+'}">' + year + '</a></td></tr>' + //--
                '<tr><td ' + tdstyle + '>Hour: </td><td ' + tdstyle + '><a ' + astyle1 + '" href="!cal --set Hour --?{Hour?|'+state.calendar.now.hour+'}">' + hour + '</a></td></tr>' + //--
                '<tr><td ' + tdstyle + '>Minute: </td><td ' + tdstyle + '><a ' + astyle1 + '" href="!cal --set Minute --?{Minute?|'+state.calendar.now.minute+'}">' + min + '</a></td></tr>' + //--
                '<tr><td ' + tdstyle + '>Moon: </td><td ' + tdstyle + '><a ' + astyle1 + '" href="!cal --moon ?{Moon?|Full Moon|Waning Gibbous|Last Quarter|Waning Crescent|New Moon|Waxing Crescent|First Quarter|Waxing Gibbous|Random}">' + moon + '</a></td></tr>' + //--
                '</table>' + //--
                '<div style="text-align:center;"><a ' + astyle2 + '" href="!cal --adv ?{Type?|Short Rest|Long Rest|Hour|Minute|Day|Week|Month|Year} --?{Amount?|1}">Advance the Date</a></div>' + //--
                '<div style="text-align:center;"><a ' + astyle2 + '" href="!cal --enc">Roll Encounter</a></div>' + //--
                '<div style="text-align:center;"><a ' + astyle2 + '" href="!cal --toggle weather">Toggle Weather Display</a></div>' + //--
                '<div style="text-align:center;"><a ' + astyle2 + '" href="!cal --toggle moon">Toggle Moon Display</a></div>' + //--
                '</div>'
            );
        } else if (!weather && !moon) {
            sendChat("Calendar","/w gm <div " + divstyle + ">" + //--
                '<div ' + headstyle + '>Calendar</div>' + //--
                '<div ' + substyle + '>Menu</div>' + //--
                '<div ' + arrowstyle + '></div>' + //--
                '<table' + tablestyle + '>' + //--
                '<tr><td ' + tdstyle + '>World: </td><td ' + tdstyle + '>' + world + '</td></tr>' + //--
                '<tr><td ' + tdstyle + '>Day: </td><td ' + tdstyle + '><a ' + astyle1 + '" href="!cal --set Day --?{Day?|1}">' + day + suffix + '</a></td></tr>' + //--
                '<tr><td ' + tdstyle + '>Month: </td><td ' + tdstyle + '><a ' + astyle1 + '" href="!cal --set Month --' + moMenu + '">' + month + '</a></td></tr>' + //-- 
                '<tr><td ' + tdstyle + '>Year: </td><td ' + tdstyle + '><a ' + astyle1 + '" href="!cal --set Year --?{Year?|'+year+'}">' + year + '</a></td></tr>' + //--
                '<tr><td ' + tdstyle + '>Hour: </td><td ' + tdstyle + '><a ' + astyle1 + '" href="!cal --set Hour --?{Hour?|'+state.calendar.now.hour+'}">' + hour + '</a></td></tr>' + //--
                '<tr><td ' + tdstyle + '>Minute: </td><td ' + tdstyle + '><a ' + astyle1 + '" href="!cal --set Minute --?{Minute?|'+state.calendar.now.minute+'}">' + min + '</a></td></tr>' + //--
                '</table>' + //--
                '<div style="text-align:center;"><a ' + astyle2 + '" href="!cal --adv ?{Type?|Short Rest|Long Rest|Hour|Minute|Day|Week|Month|Year} --?{Amount?|1}">Advance the Date</a></div>' + //--
                '<div style="text-align:center;"><a ' + astyle2 + '" href="!cal --enc">Roll Encounter</a></div>' + //--
                '<div style="text-align:center;"><a ' + astyle2 + '" href="!cal --toggle weather">Toggle Weather Display</a></div>' + //--
                '<div style="text-align:center;"><a ' + astyle2 + '" href="!cal --toggle moon">Toggle Moon Display</a></div>' + //--
                '</div>'
            );
        }
    },

    alarmmenu = function(num,title,date,time) {
        var divstyle = 'style="width: 220px; border: 1px solid black; background-color: #ffffff; padding: 5px;"';
        var astyle1 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 100px;';
        var astyle2 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 150px;';
        var tablestyle = 'style="text-align:center;"';
        var arrowstyle = 'style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid rgb(126, 45, 64); margin-bottom: 2px; margin-top: 2px;"';
        var headstyle = 'style="color: rgb(126, 45, 64); font-size: 18px; text-align: left; font-variant: small-caps; font-family: Times, serif;"';
        var substyle = 'style="font-size: 11px; line-height: 13px; margin-top: -3px; font-style: italic;"';
        var tdstyle = 'style="padding: 2px; padding-left: 5px; border: none;"';
        num=Number(num);
        if (title && date && time) {
            let splitDate=date.split('.');
            let splitTime=time.split(':');
            sendChat("Calendar","/w gm <div " + divstyle + ">" + //--
                '<div ' + headstyle + '>Alarm</div>' + //--
                '<div ' + substyle + '>Menu</div>' + //--
                '<div ' + arrowstyle + '></div>' + //--
                '<table ' + tablestyle + '>' + //--
                '<tr><td ' + tdstyle + '>Alarm: </td><td ' + tdstyle + '><a ' + astyle1 + '" href="!alarm --?{Number?|'+num+'}">' + num + '</a></td></tr>' + //--
                '<tr><td ' + tdstyle + '>Title: </td><td ' + tdstyle + '><a ' + astyle1 + '" href="!alarm --' + num + ' --title ?{Title?|'+title+'}">' + title + '</a></td></tr>' + //--
                '<tr><td ' + tdstyle + '>Date: </td><td ' + tdstyle + '><a ' + astyle1 + '" href="!alarm --' + num + ' --date ?{Day?|'+splitDate[0]+'}.?{Month?|'+splitDate[1]+'}.?{Year?|'+splitDate[2]+'}">' + date + '</a></td></tr>' + //--
                '<tr><td ' + tdstyle + '>Time: </td><td ' + tdstyle + '><a ' + astyle1 + '" href="!alarm --' + num + ' --time ?{Hour?|'+splitTime[0]+'}:?{Minute?|'+splitTime[1]+'}">' + time + '</a></td></tr>' + //--
                '</table>' + //--
                '</div>'
            );
        } else {
            getAlarm(num);
        }
    },

    createAlarm = function(num,type) {
        num=Number(num.replace("num ",""));
        let alarm=findObjs({
            _type: "handout",
            name: "Alarm #"+num
        }, {caseInsensitive: true})[0];
        if (!alarm) {
            alarm=createObj("handout",{
                name: "Alarm #"+num
            });
        }
        if (type.includes("title")) {
            type=type.replace("title ","");
            alarm.set("notes",type);
        } else if (type.includes("date")) {
            type=type.replace("date ","");
            alarm.get("gmnotes",function(gmnotes) {
                let notes=String(gmnotes);
                if (notes.includes(";")) {
                    notes=notes.split(';');
                    alarm.set("gmnotes",type+';'+notes[1]);
                } else {
                    alarm.set("gmnotes",type+";");
                }
            });
        } else if (type.includes("time")) {
            type=type.replace("time ","");
            alarm.get("gmnotes",function(gmnotes) {
                let notes=String(gmnotes);
                if (notes.includes(";")) {
                    notes=notes.split(';');
                    alarm.set("gmnotes",notes[0]+';'+type);
                } else {
                    alarm.set("gmnotes",";"+type);
                }
            });
        }
    },

    showcal = function() {
        var nowDate;
        var ordinal=state.Calendar.now.ordinal;
        var moon;
        switch (state.Calendar.now.world) {
            case 1:
                nowDate=getFaerunDate(ordinal).split(',');
                if (state.Calendar.now.mtype=="ON") {
                    moon = '<table style = "border: none;"><tr><td style="border: none; padding: 2px; padding-left: 5px;">Moon:</td><td style="border: none; padding: 2px; padding-left: 5px;">'+state.Calendar.now.moonImg+'</table>';
                } else {
                    moon=undefined;
                }
                break;
            case 2:
                nowDate=getGreyhawkDate(ordinal).split(',');
                if (state.Calendar.now.mtype=="ON") {
                    moon = '<table style = "border: none;"><tr><td style="border: none; padding: 2px; padding-left: 5px;">Moon:</td><td style="border: none; padding: 2px; padding-left: 5px;">'+state.Calendar.now.moonImg+'</table>';
                } else {
                    moon=undefined;
                }
                break;
            case 3:
                nowDate=getModernDate(ordinal).split(',');
                break;
            case 4:
                nowDate=getEberronDate(ordinal).split(',');
                break;
            case 5:
                nowDate=getTalDate(ordinal).split(',');
                break;
        }
        var month=nowDate[0];
        var day=nowDate[1];
        var suffix=getSuffix(day);
        var world=getWorld();
        var divstyle = 'style="width: 189px; border: 1px solid black; background-color: #ffffff; padding: 5px;"'
        var tablestyle = 'style="text-align:center;"';
        var arrowstyle = 'style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid ' + colour + '; margin-bottom: 2px; margin-top: 2px;"';
        var headstyle = 'style="color: ' + colour + '; font-size: 18px; text-align: left; font-variant: small-caps; font-family: Times, serif;"';
        var substyle = 'style="font-size: 11px; line-height: 13px; margin-top: -3px; font-style: italic;"';
        var weather;
        if (state.Calendar.now.wtype=="ON") {
            weather=state.Calendar.now.weather;
        } else if (state.Calendar.now.wtype=="OFF") {
            weather=undefined;
        }

    },

    getAlarm = function(num) {
        let alarm=findObjs({
            _type: "handout",
            name: "Alarm #"+num
        }, {caseInsensitive: true})[0];
        if (!alarm) {
            sendChat("Calendar","/w gm Could not find an Alarm with that Number!");
        } else {
            alarm.get("notes",function(notes) {
                let title=String(notes);
                alarm.get("gmnotes",function(gmnotes) {
                    let datetime=String(gmnotes);
                    datetime=datetime.split(';');
                    let date=String(datetime[0]);
                    let time=String(datetime[1]);
                    alarmmenu(num,title,date,time);
                });
            });
        }
    },

    chkalarms = function() {
        let alarms=findObjs({
            _type: 'handout'
        });
        _.each(alarms,function(alarm) {
            let name = alarm.get('name');
            if (name.includes("Alarm #")) {
                alarm.get("notes",function(notes) {
                    let title=String(notes);
                    alarm.get("gmnotes",function(gmnotes) {
                        let datetime=String(gmnotes);
                        datetime=datetime.split(';');
                        let date=String(datetime[0]);
                        let time=String(datetime[1]);
                        if (date) {
                            date=String(date).split('.');
                            let day=date[0];
                            let month=date[1];
                            let year=date[2];
                            time=String(time).split(':');
                            switch (state.Calendar.now.world) {
                                case 1:
                                    //Faerun Check
                                    if (month=="1"||month=="01"||month==1) {
                                        month="Hammer";
                                    } else if (month=="2"||month=="02"||month==2) {
                                        month="Alturiak";
                                    } else if (month=="3"||month=="03"||month==3) {
                                        month="Ches";
                                    } else if (month=="4"||month=="04"||month==4) {
                                        month="Tarsakh";
                                    } else if (month=="5"||month=="05"||month==5) {
                                        month="Mirtul";
                                    } else if (month=="6"||month=="06"||month==6) {
                                        month="Kythorn";
                                    } else if (month=="7"||month=="07"||month==7) {
                                        month="Flamerule";
                                    } else if (month=="8"||month=="08"||month==8) {
                                        month="Eleasis";
                                    } else if (month=="9"||month=="09"||month==9) {
                                        month="Eleint";
                                    } else if (month=="10"||month==10) {
                                        month="Marpenoth";
                                    } else if (month=="11"||month==11) {
                                        month="Uktar";
                                    } else if (month=="12"||month==12) {
                                        month="Nightal";
                                    }
                                    day=Number(day);
                                    year=Number(year);
                                    if (time) {
                                        hour=Number(time[0]);
                                        minute=Number(time[1]);
                                        if (year>=state.Calendar.now.year) {
                                            if (month==state.Calendar.now.month) {
                                                if (day>=state.Calendar.now.day) {
                                                    if (hour>=state.Calendar.now.hour) {
                                                        if (minute>=state.Calendar.now.minute) {
                                                            sendChat("Calendar","/w gm "+name+": "+title+" triggered!");
                                                            alarm.remove();
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        if (year>=state.Calendar.now.year) {
                                            if (month==state.Calendar.now.month) {
                                                if (day>=state.Calendar.now.day) {
                                                    sendChat("Calendar","/w gm "+name+": "+title+" triggered!");
                                                    alarm.remove();
                                                }
                                            }
                                        }
                                    }
                                    return;
                                case 2:
                                    //Greyhawk Check
                                    return;
                                case 3:
                                    //Modern Check
                                    return;
                                case 4:
                                    //Eberron Check
                                    return;
                                case 5:
                                    //Tal Check
                                    return;
                            }
                        }
                    });
                });
            }
        });
    },

    addtime = function(amount,type) {
        var hour=state.Calendar.now.hour;
        var minute=state.Calendar.now.minute;
        var day=state.Calendar.now.ordinal;
        var year=state.Calendar.now.year;
        if (type=="minute") {
            var newmin=Number(minute)+Number(amount);
            while (newmin>59) {
                newmin-=60;
                hour+=1;
            }
            while (hour>24) {
                hour-=24;
                day++;
            }
            while (day>360) {
                day-=360;
                year++;
            }
        } else if (type=="hour") {
            var newhour=Number(hour)+Number(amount);
            while (newhour>24) {
                newhour-=24;
                day++;
            }
            while (day>360) {
                day-=360;
                year++;
            }
        }
        state.Calendar.now.hour=hour;
        state.Calendar.now.minute=minute;
        state.Calendar.now.ordinal=ordinal;
        state.Calendar.now.year=year;
    },

    advdate = function(amount,type) {
        var ordinal=state.Calendar.now.ordinal;
        var day=state.Calendar.now.day;
        var month=state.Calendar.now.month;
        var year=state.Calendar.now.year;
        var monthlist;
        var monthNum;
        amount=Number(amount);
        switch (state.Calendar.now.world) {
            case 1:
                monthlist=["Hammer","Alturiak","Ches","Tarsakh","Mirtul","Kythorn","Flamerule","Eleasias","Eleint","Marpenoth","Uktar","Nightal"];
                for (let i=0;i<monthlist.length();i++) {
                    if (month==monthlist[i]) {
                        monthNum=i+1;
                    }
                }
                break;
            case 2:
                //Greyhawk Months
                break;
            case 3:
                //Modern Months
                break;
            case 4:
                //Eberron Months
                break;
            case 5:
                //Tal Months
                break;
        }
        if (type=="day") {
            ordinal+=amount;
            while (ordinal>360) {
                ordinal-=360;
                year++;
            }
            day+=amount;
            while (day>30) {
                day-=30;
                monthNum++;
            }
            while (monthNum>12) {
                monthNum-=12;
            }
            month=monthlist[monthNum-1];
        } else if (type=="month") {
            ordinal+=amount*30;
            while (ordinal>360) {
                ordinal-=360;
                year++;
            }
            monthNum+=amount;
            while (monthNum>12) {
                monthNum-=12;
            }
            month=monthlist[monthNum-1];
        } else if (type=="year") {
            year+=amount;
        }
        state.Calendar.now.ordinal=ordinal;
        state.Calendar.now.day=day;
        state.Calendar.now.month=month;
        state.Calendar.now.year=year;
    },

    getFaerunDate = function(ordinal) {
        var day=Number(ordinal);
        var date;
        var month;
        if (day>0 && day<=30) {
            month="Hammer"; 
            date=day;
        } else if (day>30 && day<=60) {
            month="Alturiak"; 
            date=day-30;
        } else if (day>60 && day<=90) {
            month="Ches";
            date=day-60;
        } else if (day>90 && day<=120) {
            month="Tarsakh";
            date=day-90;
        } else if (day>120 && day<=150) {
            month="Mirtul";
            date=day-120;
        } else if(day>150 && day<=180) {
            month="Kythorn";
            date=day-150;
        } else if(day>180 && day<=210) {
            month="Flamerule";
            date=day-180;
        } else if (day>210 && day<=240) {
            month="Eleasias"
            date=day-210;
        } else if (day>240 && day<=270){
            month="Eleint";
            date=day-240;
        } else if (day>270 && day<=300){
            month="Marpenoth";
            date=day-270;
        } else if (day>300 && day<=330){
            month="Uktar";
            date=day-300;
        } else if (day>330 && day<=360){
            month="Nightal";
            date=day-336;
        }
        var array=month+','+String(date);
        return array;
    },

    getGreyhawkDate = function(ordinal) {
        //Greyhawk Date
    },

    getModernDate = function(ordinal) {
        //Modern Date
    },

    getEberronDate = function(ordinal) {
        //Eberron Date
    },

    getTalDate = function(ordinal) {
        //Tal Date
    },

    getFaerunOrdinal = function(day,month) {
        let ordinal = state.Calendar.now.ordinal;
        switch (month) {
            case 'Hammer':
                ordinal=day;
                break;
            case 'Alturiak':
                ordinal=30+day;
                break;
            case 'Ches':
                ordinal=60+day;
                break;
            case 'Tarsakh':
                ordinal=90+day;
                break;
            case 'Mirtul':
                ordinal=120+day;
                break;
            case 'Kythorn':
                ordinal=150+day;
                break;
            case 'Flamerule':
                ordinal=180+day;
                break;
            case 'Eleasias':
                ordinal=210+day;
                break;
            case 'Eleint':
                ordinal=240+day;
                break;
            case 'Marpenoth':
                ordinal=270+day;
                break;
            case 'Uktar':
                ordinal=300+day;
                break;
            case 'Nightal':
                ordinal=330+day;
                break;
        }
        state.Calendar.now.ordinal=ordinal;
    },

    getGreyhawkOrdinal = function(day,month) {
        //Greyhawk Ordinal
    },

    getModernOrdinal = function(day,month) {
        //Modern Ordinal
    },

    getEberronOrdinal = function(day,month) {
        //Eberron Ordinal
    },

    getTalOrdinal = function(day,month) {
        //Tal Ordinal
    },

    getSuffix = function(day) {
        var suffix;
        if (String(day).includes("1") && day!==11) {
            suffix="st";
        } else if (String(day).includes("2") && day!==12) {
            suffix="nd";
        } else if (String(day).includes("3") && day!==13) {
            suffix="rd";
        } else {
            suffix="th";
        }
        return suffix;
    },

    weather = function(type) {
        if (state.Calendar.now.wtype=="ON") {
            var temp;
            var wind;
            var precip;
            var season;
            var ordinal=state.Calendar.now.ordinal;
            if (ordinal>330 || ordinal<=75) {
                season="Winter";
            } else if (ordinal<=170) {
                season="Spring";
            } else if (ordinal<=240) {
                season="Summer";
            } else if (ordinal<=330) {
                season="Fall";
            }
            if (type=="random") {
                var roll=randomInteger(21);
                if (roll>=15 && roll<=17) {
                    switch (season) {
                        case 'Winter':
                            temp="It is a bitterly cold winter day. ";
                            break;
                        case 'Spring':
                            temp="It is a cold spring day. ";
                            break;
                        case 'Summer':
                            temp="It is a cool summer day. ";
                            break;
                        case 'Fall':
                            temp="It is a cold fall day. ";
                            break;
                    }
                } else if (roll>=18 && roll<=20) {
                    switch (season) {
                        case 'Winter':
                            temp="It is a warm cold winter day. ";
                            break;
                        case 'Spring':
                            temp="It is a hot spring day. ";
                            break;
                        case 'Summer':
                            temp="It is a blisteringly hot summer day. ";
                            break;
                        case 'Fall':
                            temp="It is a hot fall day. ";
                            break;
                    }
                } else {
                    switch (season) {
                        case 'Winter':
                            temp="It is a cold winter day. ";
                            break;
                        case 'Spring':
                            temp="It is a mild spring day. ";
                            break;
                        case 'Summer':
                            temp="It is a warm summer day. ";
                            break;
                        case 'Fall':
                            temp="It is a mild fall day. ";
                            break;
                    }
                }
                roll=randomInteger(21);
                if (roll>=15 && roll<=17) {
                    wind="There is a light breeze and ";
                } else if (roll>=18 && roll<=20) {
                    wind="There is a howling wind and ";
                } else {
                    wind="The air is still and ";
                }
                roll=randomInteger(21);
                if (roll>=15 && roll<=17) {
                    if (season=="Winter") {
                        precip="snow falls softly on the ground.";
                    } else {
                        precip="it is raining lightly.";
                    }
                } else if (roll>=18 && roll<=20) {
                    if (season=="Winter") {
                        precip="snow falls thick and fast from the sky.";
                    } else {
                        precip="a torretial rain is falling.";
                    }
                } else {
                    roll=randomInteger(2);
                    if (roll==1) {
                        precip="the sky is overcast.";
                    } else {
                        precip="the sky is clear.";
                    }
                }
                var forecast=temp+wind+precip;
                state.Calendar.now.weather=forecast;
            } else {
                state.Calendar.now.weather=type;
            }
        }
    },

    moon = function(type) {
        if (type!=="random") {
            var year=state.Calendar.now.year;
            var ordinal=state.Calendar.now.ordinal;
            var array;
            var moon;
            if (state.Calendar.now.world==1) {
                var remainder = year/4 - Math.floor(year/4);
                if(remainder==0.25) {
                    array='array2';
                } else if (remainder==0.5) {
                    array='array3';
                } else if (remainder==0.75) {
                    array='array4';
                } else if (remainder==0) {
                    array='array1';
                }    
                var moonArray = getFaerunArray(array);    
                var moonNO = moonArray.split(",");
                var moonImg = moonNO[ordinal];
                var countStatement = '';    
                var full = moonNO[ordinal];
                var counter = 0;
                var nextDay = Number(ordinal)+1;    
                if (state.Calendar.now.mtype=="ON") {
                    while(full != 1){
                        if (nextDay > 360){
                            nextDay-=360;
                            if (array=='array1') {
                                array='array2';
                            }
                            if (array=='array2') {
                                array='array3';
                            }
                            if (array=='array3') {
                                array='array4';
                            }
                            if (array=='array4') {
                                array='array1';
                            }
                            moonArray = getFaerunArray(array);
                        } 
                        moonNO = moonArray.split(",");
                        full = moonNO[nextDay];
                        counter++;
                        nextDay++;
                    }
                    countStatement = '<tr><td colspan="2" style = "border:none; padding: 5px;">Days until full moon: '+counter+'</td></tr>';
                }
                moon = '<img src="'+getMoon(moonImg)+'" style="width:30px;height:30px;"></td></tr>';
                state.Calendar.now.moonImg=moon;
            } else if (state.Calendar.now.world==2) {
                var lunaArray = '0,7,8,8,9,10,10,11,12,12,13,13,14,14,15,15,16,16,1,2,2,3,4,4,5,5,6,6,7,7,8,8,9,10,10,11,12,12,13,13,14,14,15,15,16,16,1,2,2,3,4,4,5,5,6,6,7,7,8,8,9,10,10,11,12,12,13,13,14,14,15,15,16,16,1,2,2,3,4,4,5,5,6,6,7,7,8,8,9,10,10,11,12,12,13,13,14,14,15,15,16,16,1,2,2,3,4,4,5,5,6,6,7,7,8,8,9,10,10,11,12,12,13,13,14,14,15,15,16,16,1,2,2,3,4,4,5,5,6,6,7,7,8,8,9,10,10,11,12,12,13,13,14,14,15,15,16,16,1,2,2,3,4,4,5,5,6,6,7,7,8,8,9,10,10,11,12,12,13,13,14,14,15,15,16,16,1,2,2,3,4,4,5,5,6,6,7,7,8,8,9,10,10,11,12,12,13,13,14,14,15,15,16,16,1,2,2,3,4,4,5,5,6,6,7,7,8,8,9,10,10,11,12,12,13,13,14,14,15,15,16,16,1,2,2,3,4,4,5,5,6,6,7,7,8,8,9,10,10,11,12,12,13,13,14,14,15,15,16,16,1,2,2,3,4,4,5,5,6,6,7,7,8,8,9,10,10,11,12,12,13,13,14,14,15,15,16,16,1,2,2,3,4,4,5,5,6,6,7,7,8,8,9,10,10,11,12,12,13,13,14,14,15,15,16,16,1,2,2,3,4,4,5,5,6,6,7,7,8,8,9,10,10,11,12,12,13,13,14,14,15,15,16,16,1,2,2,3,4,4,5,5,6,6,7';
                var celeneArray = '0,16,16,16,1,2,2,2,2,2,2,2,3,3,3,3,3,3,3,4,4,4,4,4,4,4,5,6,6,6,6,6,6,6,7,7,7,7,7,7,7,8,8,8,8,8,8,8,9,9,10,10,10,10,10,10,10,11,11,11,11,11,11,11,12,12,12,12,12,12,12,12,13,14,14,14,14,14,14,14,15,15,15,15,15,15,15,16,16,16,16,16,16,16,16,1,2,2,2,2,2,2,2,3,3,3,3,3,3,3,4,4,4,4,4,4,4,5,6,6,6,6,6,6,6,7,7,7,7,7,7,7,8,8,8,8,8,8,8,9,9,10,10,10,10,10,10,10,11,11,11,11,11,11,11,12,12,12,12,12,12,12,12,13,14,14,14,14,14,14,14,15,15,15,15,15,15,15,16,16,16,16,16,16,16,16,1,2,2,2,2,2,2,2,3,3,3,3,3,3,3,4,4,4,4,4,4,4,5,6,6,6,6,6,6,6,7,7,7,7,7,7,7,8,8,8,8,8,8,8,9,9,10,10,10,10,10,10,10,11,11,11,11,11,11,11,12,12,12,12,12,12,12,12,13,14,14,14,14,14,14,14,15,15,15,15,15,15,15,16,16,16,16,16,16,16,16,1,2,2,2,2,2,2,2,3,3,3,3,3,3,3,4,4,4,4,4,4,4,5,6,6,6,6,6,6,6,7,7,7,7,7,7,7,8,8,8,8,8,8,8,9,9,10,10,10,10,10,10,10,11,11,11,11,11,11,11,12,12,12,12,12,12,12,12,13,14,14,14,14,14,14,14,15,15,15,15,15,15,15,16,16,16,16,16';
                
                var lunaNO = lunaArray.split(",");
                var lunaImg = lunaNO[ordinal];
                var Luna = getMoon(lunaImg);
                
                var celeneNO = celeneArray.split(",");
                var celeneImg = celeneNO[ordinal];
                var Celene = getMoon(celeneImg);
                
                var moon = '<img src="'+Luna+'" style="width:40px;height:40px;"><img src="'+Celene+'" style="width:30px;height:30px;"></td></tr>';
                state.Calendar.now.moonImg=moon;
            }
        } else {
            if (state.Calendar.now.world==1) {
                switch (type) {
                    case 'full moon':
                        moon = '<img src="'+getMoon(1)+'" style="width:30px;height:30px;"></td></tr>';
                        break;
                    case 'waning gibbous':
                        moon = '<img src="'+getMoon(2)+'" style="width:30px;height:30px;"></td></tr>';
                        break;
                    case 'last quarter':
                        moon = '<img src="'+getMoon(5)+'" style="width:30px;height:30px;"></td></tr>';
                        break;
                    case 'waning crescent':
                        moon = '<img src="'+getMoon(6)+'" style="width:30px;height:30px;"></td></tr>';
                        break;
                    case 'new moon':
                        moon = '<img src="'+getMoon(9)+'" style="width:30px;height:30px;"></td></tr>';
                        break;
                    case 'waxing crescent':
                        moon = '<img src="'+getMoon(10)+'" style="width:30px;height:30px;"></td></tr>';
                        break;
                    case 'first quarter':
                        moon = '<img src="'+getMoon(13)+'" style="width:30px;height:30px;"></td></tr>';
                        break;
                    case 'waxing gibbous':
                        moon = '<img src="'+getMoon(14)+'" style="width:30px;height:30px;"></td></tr>';
                        break;
                }
                state.Calendar.now.moonImg=moon;
            } else if (state.Calendar.now.world==2) {
                //Eberron Moon
            }
        }
    },

    getFaerunArray = function(array) {
        var moonArray;
        switch(array) {
            case 'array1':
                moonArray = '0,1,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,14,15,15,16,16,16,1,2,2,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,3,3,4,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,14,15,15,16,16,16,1,2,2,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,15,15,15,16,16,1';
                break;
            case 'array2':
                moonArray = '0,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,14,15,15,16,16,16,1,2,2,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,14,15,15,16,16,16,0,1,2,2,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,14,15,15,16,16,16,1,2,2,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,14,15,15,16,16,16,1,2,2,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,15,15,15,16,16,1';
                break;
            case 'array3':
                moonArray = '0,2,2,3,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,14,15,15,16,16,16,1,2,2,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,14,15,15,16,16,16,0,1,2,2,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,14,15,15,16,16,16,1,2,2,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,14,15,15,16,16,16,1,2,2,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1';
                break;
            case 'array4':
                moonArray = '0,2,2,3,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,14,15,15,16,16,16,1,2,2,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,14,15,15,16,16,16,1,2,2,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,15,16,16,0,1,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,14,15,15,16,16,16,1,2,2,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,15,16,16';
                break;
        }
        return moonArray;
    },

    getGreyhawkArray = function(array) {
        //Greyhawk Array
        sendChat("Calendar","/w gm Coming soon! ;)");
    },

    getModernArray = function(array) {
        //Modern Array
        sendChat("Calendar","/w gm Coming soon! ;)");
    },

    getEberronArray = function(array) {
        //Eberron Array
        sendChat("Calendar","/w gm Coming soon! ;)");
    },

    getTalArray = function(array) {
        //Tal Array
        sendChat("Calendar","/w gm Coming soon! ;)");
    },

    getMoon = function(moonNo) {
        var args  = moonNo;
        var moon;
        
        switch(args) {
            case '1':
                // moon = 'Full Moon';
                moon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Twemoji_1f315.svg/512px-Twemoji_1f315.svg.png';
                break;
            case '2':
                // moon = 'Waning Gibbous';
                moon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Twemoji_1f316.svg/512px-Twemoji_1f316.svg.png';
                break;
            case '3':
                // moon = 'Waning Gibbous';
                moon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Twemoji_1f316.svg/512px-Twemoji_1f316.svg.png';
                break;
            case '4':
                // moon = 'Waning Gibbous';
                moon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Twemoji_1f316.svg/512px-Twemoji_1f316.svg.png';
                break;
            case '5':
                // moon = 'Last Quarter';
                moon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Twemoji_1f317.svg/512px-Twemoji_1f317.svg.png';
                break;
            case '6':
                // moon = 'Waning Crescent';
                moon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Twemoji_1f318.svg/512px-Twemoji_1f318.svg.png';
                break;
            case '7':
                // moon = 'Waning Crescent';
                moon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Twemoji_1f318.svg/512px-Twemoji_1f318.svg.png';
                break;
            case '8':
                // moon = 'Waning Crescent';
                moon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Twemoji_1f318.svg/512px-Twemoji_1f318.svg.png';
                break;
            case '9':
                // moon = 'New Moon';
                moon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Twemoji_1f311.svg/512px-Twemoji_1f311.svg.png';
                break;
            case '10':
                // moon = 'Waxing Crescent';
                moon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Twemoji_1f312.svg/512px-Twemoji_1f312.svg.png';
                break;
            case '11':
                // moon = 'Waxing Crescent';
                moon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Twemoji_1f312.svg/512px-Twemoji_1f312.svg.png';
                break;
            case '12':
                // moon = 'Waxing Crescent';
                moon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Twemoji_1f312.svg/512px-Twemoji_1f312.svg.png';
                break;
            case '13':
                // moon = 'First Quarter';
                moon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Twemoji_1f313.svg/512px-Twemoji_1f313.svg.png';
                break;
            case '14':
                // moon = 'Waxing Gibbous';
                moon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Twemoji_1f314.svg/512px-Twemoji_1f314.svg.png';
                break;
            case '15':
                // moon = 'Waxing Gibbous';
                moon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Twemoji_1f314.svg/512px-Twemoji_1f314.svg.png';
                break;
            case '16':
                // moon = 'Waxing Gibbous';
                moon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Twemoji_1f314.svg/512px-Twemoji_1f314.svg.png';
                break;
        }
        return moon;
    },

    getWorld = function() {
        let worldnum=state.calendar.now.world;
        let world;
        switch (worldnum) {
            case 1:
                world="Faerûn";
            break;
            case 2:
                world="Greyhawk";
            break;
            case 3:
                world="Modern";
            break;
            case 4:
                world="Eberron";
            break;
            case 5:
                world="Tal\'Dorei";
            break;
        }
        return world;
    },

    checkInstall = function() {
        if (!state.Calendar) {
            setDefaults();
        }
        if (!state.Alarm) {
            setAlarmDefaults();
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
on("ready",function() {
    'use strict';
    Calendar.CheckInstall();
    Calendar.RegisterEventHandlers();
});
