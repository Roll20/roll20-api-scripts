// Calendar and down day counter for Faerun
// Created by Kirsty (https://app.roll20.net/users/1165285/kirsty)
// Updated by Julexar (https://app.roll20.net/users/9989180/julexar)

// API Commands:
// !cal - for the GM displays the menu in the chat window, for a player displays date, weather, moon, hour and minute

// Red Colour: #7E2D40

var Calendar = Calendar || (function() {
    'use strict';
    
    var version = '4.2',
    
    setDefaults = function() {
        state.Calendar = {
            now: {
                ordinal: 1,
                year: 1486,
                down: 0,
                divider: 1,
                day: 1,
                month: "",
                hour: 5,
                minute: 5,
                weather: "It is a cool but sunny day"
            },
        };
    },
    
    setAlarm1Defaults = function() {
        state.Alarm1 = {
            now: {
                day: 1,
                month: "",
                year: 1486,
                hour: 1,
                minute: 1,
                title: "",
            },
        };  
    },
    
    setAlarm2Defaults = function() {
        state.Alarm2 = {
            now: {
                day: 1,
                month: "",
                year: 1486,
                hour: 1,
                minute: 1,
                title: "",
            },
        };
    },
    
    setAlarm3Defaults = function() {
        state.Alarm3 = {
            now: {
                day: 1,
                month: "",
                year: 1486,
                hour: 1,
                minute: 1,
                title: "",
            },
        };
    },
    
    setAlarm4Defaults = function() {
        state.Alarm4 = {
            now: {
                day: 1,
                month: "",
                year: 1486,
                hour: 1,
                minute: 1,
                title: "",
            },
        };
    },
    
    setAlarm5Defaults = function() {
        state.Alarm5 = {
            now: {
                day: 1,
                month: "",
                year: 1486,
                hour: 1,
                minute: 1,
                title: "",
            },
        };
    },
    
    setAlarm6Defaults = function() {
        state.Alarm6 = {
            now: {
                day: 1,
                month: "",
                year: 1486,
                hour: 1,
                minute: 1,
                title: "",
            },
        };
    },
    
    setAlarm7Defaults = function() {
        state.Alarm7 = {
            now: {
                day: 1,
                month: "",
                year: 1486,
                hour: 1,
                minute: 1,
                title: "",
            },
        };
    },
    
    setAlarm8Defaults = function() {
        state.Alarm8 = {
            now: {
                day: 1,
                month: "",
                year: 1486,
                hour: 1,
                minute: 1,
                title: "",
            },
        };
    },
    
    setAlarm9Defaults = function() {
        state.Alarm9 = {
            now: {
                day: 1,
                month: "",
                year: 1486,
                hour: 1,
                minute: 1,
                title: "",
            },
        };
    },
    
    setAlarm10Defaults = function() {
        state.Alarm10 = {
            now: {
                day: 1,
                month: "",
                year: 1486,
                hour: 1,
                minute: 1,
                title: "",
            },
        };
    },
   
    handleInput = function(msg) {
        var args = msg.content.split(",");
        
        if (msg.type !== "api") {
			return;
		}
		
		if(playerIsGM(msg.playerid)){
		    switch(args[0]) {
		        case '!cal':
                    calmenu();
                    chkalarm1();
                    chkalarm2();
                    chkalarm3();
                    chkalarm4();
                    chkalarm5();
                    chkalarm6();
                    chkalarm7();
                    chkalarm8();
                    chkalarm9();
                    chkalarm10();
                    break;
                case '!setday':
                    getordinal(msg);
                    weather();
                    calmenu();
                    chkalarm1();
                    chkalarm2();
                    chkalarm3();
                    chkalarm4();
                    chkalarm5();
                    chkalarm6();
                    chkalarm7();
                    chkalarm8();
                    chkalarm9();
                    chkalarm10();
                    weather();
                    break;
                case '!setmonth':
                    getordinal(msg);
                    weather();
                    calmenu();
                    chkalarm1();
                    chkalarm2();
                    chkalarm3();
                    chkalarm4();
                    chkalarm5();
                    chkalarm6();
                    chkalarm7();
                    chkalarm8();
                    chkalarm9();
                    chkalarm10();
                    break;
                case '!setyear':
                    state.Calendar.now.year=args[1];
                    weather();
                    calmenu();
                    chkalarm1();
                    chkalarm2();
                    chkalarm3();
                    chkalarm4();
                    chkalarm5();
                    chkalarm6();
                    chkalarm7();
                    chkalarm8();
                    chkalarm9();
                    chkalarm10();
                    break;
                case '!addday':
                    addday(args[1]);
                    weather();
                    calmenu();
                    chkalarm1();
                    chkalarm2();
                    chkalarm3();
                    chkalarm4();
                    chkalarm5();
                    chkalarm6();
                    chkalarm7();
                    chkalarm8();
                    chkalarm9();
                    chkalarm10();
                    break;
                case '!sethour':
                    state.Calendar.now.hour=args[1];
                    calmenu();
                    chkalarm1();
                    chkalarm2();
                    chkalarm3();
                    chkalarm4();
                    chkalarm5();
                    chkalarm6();
                    chkalarm7();
                    chkalarm8();
                    chkalarm9();
                    chkalarm10();
                    break;
                case '!setminute':
                    state.Calendar.now.minute=args[1];
                    calmenu();
                    chkalarm1();
                    chkalarm2();
                    chkalarm3();
                    chkalarm4();
                    chkalarm5();
                    chkalarm6();
                    chkalarm7();
                    chkalarm8();
                    chkalarm9();
                    chkalarm10();
                    break;
                case '!advtime':
                    advtime(args[1],args[2]);
                    if (((args[1].toLowerCase()=="short rest" || args[1].toLowerCase()=="hours") && Number(args[2])>=8) || args[1].toLowerCase()=="long rest" || args[1].toLowerCase()=="months" || args[1].toLowerCase()=="days" || args[1].toLowerCase()=="years") {
                        weather();
                    }
                    calmenu();
                    chkalarm1();
                    chkalarm2();
                    chkalarm3();
                    chkalarm4();
                    chkalarm5();
                    chkalarm6();
                    chkalarm7();
                    chkalarm8();
                    chkalarm9();
                    chkalarm10();
                    break;
                case '!setalarm':
                    setalarm(args[1],args[2],args[3],args[4],args[5],args[6],args[7]);
                    calmenu();
                    chkalarm1();
                    chkalarm2();
                    chkalarm3();
                    chkalarm4();
                    chkalarm5();
                    chkalarm6();
                    chkalarm7();
                    chkalarm8();
                    chkalarm9();
                    chkalarm10();
                    break;
                case '!weather':
                    weather();
                    calmenu();
                    chkalarm1();
                    chkalarm2();
                    chkalarm3();
                    chkalarm4();
                    chkalarm5();
                    chkalarm6();
                    chkalarm7();
                    chkalarm8();
                    chkalarm9();
                    chkalarm10();
                    break;
                case '!playercal':
                    showcal(msg);
                    chkalarm1();
                    chkalarm2();
                    chkalarm3();
                    chkalarm4();
                    chkalarm5();
                    chkalarm6();
                    chkalarm7();
                    chkalarm8();
                    chkalarm9();
                    chkalarm10();
                    break;
                case '!enc':
                    encounter(args[1]);
                    chkalarm1();
                    chkalarm2();
                    chkalarm3();
                    chkalarm4();
                    chkalarm5();
                    chkalarm6();
                    chkalarm7();
                    chkalarm8();
                    chkalarm9();
                    chkalarm10();
                    break;
    	    }
		}else if(args[0]=='!cal'){
		    showcal(msg);
		}
    },
    
    calmenu = function() {
        var divstyle = 'style="width: 189px; border: 1px solid black; background-color: #ffffff; padding: 5px;"'
        var astyle1 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 100px;';
        var astyle2 = 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 150px;';
        var tablestyle = 'style="text-align:center;"';
        var arrowstyle = 'style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid rgb(126, 45, 64); margin-bottom: 2px; margin-top: 2px;"';
        var headstyle = 'style="color: rgb(126, 45, 64); font-size: 18px; text-align: left; font-variant: small-caps; font-family: Times, serif;"';
        var substyle = 'style="font-size: 11px; line-height: 13px; margin-top: -3px; font-style: italic;"';
        var down = state.Calendar.now.down;
        down = getdown(down);
        var nowdate = getdate(state.Calendar.now.ordinal).split(',');
        var month = nowdate[0];
        var day = nowdate[1];
        var moon = getmoon();
        
        
        sendChat('Calendar', '/w gm <div ' + divstyle + '>' + //--
            '<div ' + headstyle + '>Calendar</div>' + //--
            '<div ' + substyle + '>Menu</div>' + //--
            '<div ' + arrowstyle + '></div>' + //--
            '<table>' + //--
            '<tr><td>Day: </td><td><a ' + astyle1 + '" href="!setday,?{Day?|1},' + month +'">' + day + '</a></td></tr>' + //--
            '<tr><td>Month: </td><td><a ' + astyle1 + '" href="!setmonth,' + day + ',?{Month|Hammer|Midwinter|Alturiak|Ches|Tarsakh|Greengrass|Mirtul|Kythorn|Flamerule|Midsummer|Eleasias|Eleint|Highharvestide|Marpenoth|Uktar|Feast of the Moon|Nightal}">' + month + '</a></td></tr>' + //--
            '<tr><td>Year: </td><td><a ' + astyle1 + '" href="!setyear,?{Year?|1486}">' + state.Calendar.now.year + '</a></td></tr>' + //--
            '<tr><td>Hour: </td><td><a ' + astyle1 + '" href="!sethour,?{Hour?|5}">' + state.Calendar.now.hour + '</a></td></tr>' + //--
            '<tr><td>Minute: </td><td><a ' + astyle1 + '" href="!setminute,?{Minute?|5}">' + state.Calendar.now.minute + '</a></td></tr>' + //--
            '</table>' + //--
            '<br>Weather: ' + state.Calendar.now.weather + //--
            '<br><br>Moon: ' + moon + //--
            '<div style="text-align:center;"><a ' + astyle2 + '" href="!advtime,?{Format of Time?|Short Rest|Long Rest|Days|Months|Years},?{Amount?|5}">Advance the Time</a></div>' + //--
            '<div style="text-align:center;"><a ' + astyle2 + '" href="!weather">Roll Weather</a></div>' + //--
            '<div style="text-align:center;"><a ' + astyle2 + '" href="!setalarm,?{Alarmnumber?|Alarm1|Alarm2|Alarm3|Alarm4|Alarm5|Alarm6|Alarm7|Alarm8|Alarm9|Alarm10},?{Day?|5},?{Month?|Hammer|Alturiak|Ches|Tarsakh|Mirtul|Kythorn|Flamerule|Eleasias|Eleint|Marpenoth|Uktar|Nightal},?{Year?|1486},?{Hour?|5},?{Minute?|5},?{Title?|1}">Set an Alarm</a></div>' + //--
            '<div style="text-align:center;"><a ' + astyle2 + '" href="!playercal">Show to Players</a></div>' + //--
            '<div style="text-align:center;"><a ' + astyle2 + '" href="!enc,?{Location?|City|Wilderness}">Random Encounter</a></div>' + //--
            '</div>'
        );
    },
    
    showcal = function(msg) {
        var nowdate = getdate(state.Calendar.now.ordinal).split(',');
        var month = nowdate[0];
        var day = nowdate[1];
        var down = state.Calendar.now.down;
            down = getdown(down);
        var suffix = getsuffix(day);
        var divstyle = 'style="width: 189px; border: 1px solid black; background-color: #ffffff; padding: 5px;"'
        var tablestyle = 'style="text-align:center;"';
        var arrowstyle = 'style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid rgb(126, 45, 64); margin-bottom: 2px; margin-top: 2px;"';
        var headstyle = 'style="color: rgb(126, 45, 64); font-size: 18px; text-align: left; font-variant: small-caps; font-family: Times, serif;"';
        var substyle = 'style="font-size: 11px; line-height: 13px; margin-top: -3px; font-style: italic;"';
        var moon = getmoon();
        var downstr;
        var hour;
        var minute;
        if (Number(state.Calendar.now.hour)<10) {
            hour=`0${state.Calendar.now.hour}`;
        } else {
            hour=state.Calendar.now.hour;
        }
        if (Number(state.Calendar.now.minute)<10) {
            minute=`0${state.Calendar.now.minute}`;
        } else {
            minute=state.Calendar.now.minute;
        }
        
        
        sendChat(msg.who, '<div ' + divstyle + '>' + //--
            '<div ' + headstyle + '>Calendar</div>' + //--
            '<div ' + substyle + '>Player View</div>' + //--
            '<div ' + arrowstyle + '></div>' + //--
            day + suffix + ' of ' + month + ', ' + state.Calendar.now.year + //--
            '<br>Current Time: ' + hour + ':' + minute + //--
            '<br><br>Today\'s weather:<br>' + state.Calendar.now.weather + //--
            '<br><br>Moon: ' + moon
        );
    },
    
    getdate = function(options){
        var day = Number(options);
        var date;
        var month;
        
        if(day>0 && day<=30){
            month="Hammer";
            state.Calendar.now.month=String(month);
            date=day;
        }else if(day>30 && day<=60){
            month="Alturiak";
            state.Calendar.now.month=String(month);
            date=day-30;
        }else if(day>60 && day<=90){
            month="Ches";
            state.Calendar.now.month=String(month);
            date=day-60;
        }else if(day>90 && day<=120){
            month="Tarsakh";
            state.Calendar.now.month=String(month);
            date=day-90;
        }else if(day>120 && day<=150){
            month="Mirtul";
            state.Calendar.now.month=String(month);
            date=day-120;
        }else if(day>150 && day<=180){
            month="Kythorn";
            state.Calendar.now.month=String(month);
            date=day-150;
        }else if(day>180 && day<=210){
            month="Flamerule";
            state.Calendar.now.month=String(month);
            date=day-180;
        }else if(day>210 && day<=240){
            month="Eleasias";
            state.Calendar.now.month=String(month);
            date=day-210;
        }else if(day>240 && day<=270){
            month="Eleint";
            state.Calendar.now.month=String(month);
            date=day-240;
        }else if(day>270 && day<=300){
            month="Marpenoth";
            state.Calendar.now.month=String(month);
            date=day-270;
        }else if(day>300 && day<=330){
            month="Uktar";
            state.Calendar.now.month=String(month);
            date=day-300;
        }else if(day>330 && day<360){
            month="Nightal";
            state.Calendar.now.month=String(month);
            date=day-335;
        }
        state.Calendar.now.month=String(month);
        state.Calendar.now.day=date;
        var array=month+','+String(date);
        return array;    
    },
    
    getordinal = function(options){
        var args = options.content.split(",");
        var date = args[1];
        var month = args[2];
        var ordinal = state.Calendar.now.ordinal;
        date=date.replace("st","");
        date=date.replace("nd","");
        date=date.replace("rd","");
        date=date.replace("th","");
        date = Number(date);
        
        switch(month) {
            case 'Hammer':
                ordinal = date;
                state.Calendar.now.month=String(month);
                break;
            case 'Alturiak':
                ordinal = 30+date;
                state.Calendar.now.month=String(month);
                break;
            case 'Ches':
                ordinal = 60+date;
                state.Calendar.now.month=String(month);
                break;
            case 'Tarsakh':
                ordinal = 90+date;
                state.Calendar.now.month=String(month);
                break;
            case 'Mirtul':
                ordinal = 120+date;
                state.Calendar.now.month=String(month);
                break;
            case 'Kythorn':
                ordinal = 150+date;
                state.Calendar.now.month=String(month);
                break;
            case 'Flamerule':
                ordinal = 180+date;
                state.Calendar.now.month=String(month);
                break;
            case 'Eleasias':
                ordinal = 210+date;
                state.Calendar.now.month=String(month);
                break;
            case 'Eleint':
                ordinal = 240+date;
                state.Calendar.now.month=String(month);
                break;
            case 'Marpenoth':
                ordinal = 270+date;
                state.Calendar.now.month=String(month);
                break;
            case 'Uktar':
                ordinal = 300+date;
                state.Calendar.now.month=String(month);
                break;
            case 'Nightal':
                ordinal = 330+date;
                state.Calendar.now.month=String(month);
                break;
            }
        state.Calendar.now.ordinal = ordinal;
    },
    
    getsuffix = function(day) {
        
        var date = Number(day)
        var suffix
        
        if (date == 1 || date == 21 ){
            suffix = 'st';
        }else if (date == 2 || date == 22){
            suffix = 'nd';
        }else if (date == 3 || date == 23){
            suffix = 'rd';
        }else{
            suffix = 'th';
        }
        
        return suffix;
    },
    
    getdown = function(days) {
        var down = Number(days);
        var div = state.Calendar.now.div;
        
        if(div!=0){
            down = down/div;
        }
        
        return down;
    },
    
    addday = function(add) {
        var ordinal = Number(add);
        
        ordinal = ordinal + Number(state.Calendar.now.ordinal);
        
        state.Calendar.now.ordinal=ordinal;
    },
    
    weather = function() {
        var roll;
        var temperature;
        var wind;
        var precipitation;
        var season;
        var ordinal = Number(state.Calendar.now.ordinal);
        var rand;
        var temrand;
        
        if(ordinal > 330 || ordinal <= 70){
            season = 'Winter'
        }else if(ordinal > 70 && ordinal <= 160){
            season = 'Spring'
        }else if(ordinal > 160 && ordinal <=250 ){
            season = 'Summer'
        }else if(ordinal > 250 && ordinal <=330 ){
            season = 'Fall'
        }
        rand=randomInteger(100);
        temrand=randomInteger(100);
        switch (season) {
            case 'Summer':
                if (temrand<=90) {
                    temperature="It is an extremely hot summer day. It is recommended to drink more.";
                } else {
                    temperature="It is a hot summer day.";
                }
                if (rand<=70) {
                    temperature+=" The weather is clear. There won't be any sandstorms today.";
                } else if (rand<=80) {
                    temperature+=" A sandstorm is raging outside. It will last the entire day.";
                } else if (rand<=90) {
                    temperature+=" A sandstorm is raging outside. It will last for half of the day.";
                } else {
                    temperature+=" A sandstorm is raging outside. It will last for 8 hours.";
                }
                break;
            case 'Spring':
                if (temrand<=90) {
                    //Hot
                    temperature="It is a hot spring day.";
                } else {
                    //mild
                    temperature="It is a mild spring day, staying hydrated is easier.";
                }
                if (rand<=80) {
                    //No storm
                    temperature+=" The weather is clear. There won't be any sandstorms today.";
                } else if (rand<=90) {
                    //Half day storm
                    temperature+=" A sandstorm is raging outside. It will last for half of the day.";
                } else {
                    //8 hour storm
                    temperature+=" A sandstorm is raging outside. It will last for 8 hours.";
                }
                break;
            case 'Fall':
                if (temrand<=90) {
                    //hot
                    temperature="It is a hot fall day.";
                } else {
                    //mild
                    temperature="It is a mild fall day, staying hydrated is easier.";
                }
                if (rand<=80) {
                    //No storm
                    temperature+=" The weather is clear. There won't be any sandstorms today.";
                } else if (rand<=90) {
                    //half day storm
                    temperature+=" A sandstorm is raging outside. It will last for half of the day.";
                } else {
                    //8 hour storm
                    temperature+=" A sandstorm is raging outside. It will last for 8 hours.";
                }
                break;
            case 'Winter':
                if (temrand<=50) {
                    //mild
                    temperature="It is a mild winter day, staying hydrated is easier.";
                } else if (temrand<=90) {
                    //hot
                    temperature="It is a hot winter day.";
                } else {
                    //rain
                    temperature="It is a cooler winter day and it looks like it will rain.";
                }
                if (rand<=90) {
                    //No storm
                    temperature+=" The weather is clear. There won't be any sandstorms today.";
                } else {
                    //8 hour storm
                    temperature+=" A sandstorm is raging outside. It will last for 8 hours.";
                }
                break;
        }
        
        
        var forecast=temperature;
        state.Calendar.now.weather = forecast;
    },
    
    getmoon = function() {
        var ordinal = state.Calendar.now.ordinal;
        var moonNo;
        var moon;
        
        moonNo = Math.ceil(ordinal/3)-Math.floor(Math.ceil(ordinal/3)/8)*8;
        
        switch(moonNo) {
            case 1:
                moon = 'First Quarter';
                break;
            case 2:
                moon = 'Waxing Cresent';
                break;
            case 3:
                moon = 'New';
                break;
            case 4:
                moon = 'Waning Cresent';
                break;
            case 5:
                moon = 'Third Quarter';
                break;
            case 6:
                moon = 'Waning Gibbous';
                break;
            case 7:
                moon = 'Full';
                break;
            case 0:
                moon = 'Waxing Gibbous';
                break;
        }
        
        return moon;
    },
    
    advtime = function(type,amount) {
        var hour=Number(state.Calendar.now.hour);
        var minute=Number(state.Calendar.now.minute);
        var day=Number(state.Calendar.now.day);
        var year=Number(state.Calendar.now.year);
        var month=0;
        var rtype = type.toLowerCase();
        var ordinal=Number(state.Calendar.now.ordinal);
        var cmonth=String(state.Calendar.now.month);
        var rmonth;
        switch (cmonth) {
            case 'Hammer':
                rmonth=1;
                break;
            case 'Alturiak':
                rmonth=2;
                break;
            case 'Ches':
                rmonth=3;
                break;
            case 'Tarsakh':
                rmonth=4;
                break;
            case 'Mirtul':
                rmonth=5;
                break;
            case 'Kythorn':
                rmonth=6;
                break;
            case 'Flamerule':
                rmonth=7;
                break;
            case 'Eleasias':
                rmonth=8;
                break;
            case 'Eleint':
                rmonth=9;
                break;
            case 'Marpenoth':
                rmonth=10;
                break;
            case 'Uktar':
                rmonth=11;
                break;
            case 'Nightal':
                rmonth=12;
                break;
        }
        month=rmonth;
        for (let i=0;i<Number(amount);i++) {
            if (rtype=="short rest") {
                hour+=1;
            } else if (rtype=="long rest") {
                hour+=8;
            } else if (rtype=="days") {
                ordinal+=1;
                day+=1;
            } else if (rtype=="months") {
                ordinal+=30;
                month+=1;
            } else if (rtype=="years") {
                ordinal+=360;
            }
        }
        year+=Math.floor(ordinal/360);
        while (ordinal>360) {
            ordinal-=360;
        }
        day+=Math.floor(hour/24);
        while (hour>24) {
            hour-=12;
        }
        while (day>30) {
            day-=30;
        }
        while (month>12) {
            month-=12;
        }
        switch (month) {
            case 1:
                cmonth="Hammer";
                break;
            case 2:
                cmonth="Alturiak";
                break;
            case 3:
                cmonth="Ches";
                break;
            case 4:
                cmonth="Tarsakh";
                break;
            case 5:
                cmonth="Mirtul";
                break;
            case 6:
                cmonth="Kythorn";
                break;
            case 7:
                cmonth="Flamerule";
                break;
            case 8:
                cmonth="Eleasias";
                break;
            case 9:
                cmonth="Eleint";
                break;
            case 10:
                cmonth="Marpenoth";
                break;
            case 11:
                cmonth="Uktar";
                break;
            case 12:
                cmonth="Nightal";
                break;
        }
        state.Calendar.now.ordinal=ordinal;
        state.Calendar.now.day=day;
        state.Calendar.now.month=cmonth;
        state.Calendar.now.year=year;
        state.Calendar.now.hour=hour;
        state.Calendar.now.minute=minute;
    },
    
    setalarm = function(anum,tday,tmonth,tyear,thour,tminute,ttitle) {
        var day=Number(tday);
        var month=String(tmonth);
        var year=Number(tyear);
        var hour=Number(thour);
        var minute=Number(tminute);
        var title=String(ttitle);
        var maxday=30;
        var rday=0;
        var num=anum;
        if (Number(hour)<10) {
            hour=`0${hour}`;
        }
        if (Number(minute)<10) {
            minute=`0${minute}`;
        }
        sendChat("Calendar",`/w gm Your Alarm >>${title}<< has been set for Day ${day} of ${month} of the Year ${year} at ${hour}:${minute}`);
        if (day>maxday) {
            sendChat("Calendar","/w gm Error with the Input. The chosen month only has "+maxday+" days!");
        } else {
            
            if (month!="Hammer") {
                rday=Number(day)+30;
                if (month!="Alturiak") {
                    rday+=30;
                    if (month!="Ches") {
                        rday+=30;
                        if (month!="Tarsakh") {
                            rday+=30;
                            if (month!="Mirtul") {
                                rday+=30;
                                if (month!="Kythorn") {
                                    rday+=30;
                                    if (month!="Flamerule") {
                                        rday+=30;
                                        if (month!="Eleasias") {
                                            rday+=30;
                                            if (month!="Eleint") {
                                                rday+=30;
                                                if (month!="Marpenoth") {
                                                    rday+=30;
                                                    if (month!="Uktar") {
                                                        rday+=30;
                                                        if (month=="Nightal") {
                                                            rday+=30;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (num=="Alarm1") {
                state.Alarm1.now.day=Number(rday);
                state.Alarm1.now.month=month;
                state.Alarm1.now.year=Number(year);
                state.Alarm1.now.hour=Number(hour);
                state.Alarm1.now.minute=Number(minute);
                state.Alarm1.now.title=title;
                
            } else if (num=="Alarm2") {
                state.Alarm2.now.day=Number(rday);
                state.Alarm2.now.month=month;
                state.Alarm2.now.year=Number(year);
                state.Alarm2.now.hour=Number(hour);
                state.Alarm2.now.minute=Number(minute);
                state.Alarm2.now.title=title;
            } else if (num=="Alarm3") {
                state.Alarm3.now.day=Number(rday);
                state.Alarm3.now.month=month;
                state.Alarm3.now.year=Number(year);
                state.Alarm3.now.hour=Number(hour);
                state.Alarm3.now.minute=Number(minute);
                state.Alarm3.now.title=title;
            } else if (num=="Alarm4") {
                state.Alarm4.now.day=Number(rday);
                state.Alarm4.now.month=month;
                state.Alarm4.now.year=Number(year);
                state.Alarm4.now.hour=Number(hour);
                state.Alarm4.now.minute=Number(minute);
                state.Alarm4.now.title=title;
            } else if (num=="Alarm5") {
                state.Alarm5.now.day=Number(rday);
                state.Alarm5.now.month=month;
                state.Alarm5.now.year=Number(year);
                state.Alarm5.now.hour=Number(hour);
                state.Alarm5.now.minute=Number(minute);
                state.Alarm5.now.title=title;
            } else if (num=="Alarm6") {
                state.Alarm6.now.day=Number(rday);
                state.Alarm6.now.month=month;
                state.Alarm6.now.year=Number(year);
                state.Alarm6.now.hour=Number(hour);
                state.Alarm6.now.minute=Number(minute);
                state.Alarm6.now.title=title;
            } else if (num=="Alarm7") {
                state.Alarm7.now.day=Number(rday);
                state.Alarm7.now.month=month;
                state.Alarm7.now.year=Number(year);
                state.Alarm7.now.hour=Number(hour);
                state.Alarm7.now.minute=Number(minute);
                state.Alarm7.now.title=title;
            } else if (num=="Alarm8") {
                state.Alarm8.now.day=Number(rday);
                state.Alarm8.now.month=month;
                state.Alarm8.now.year=Number(year);
                state.Alarm8.now.hour=Number(hour);
                state.Alarm8.now.minute=Number(minute);
                state.Alarm8.now.title=title;
            } else if (num=="Alarm9") {
                state.Alarm9.now.day=Number(rday);
                state.Alarm9.now.month=month;
                state.Alarm9.now.year=Number(year);
                state.Alarm9.now.hour=Number(hour);
                state.Alarm9.now.minute=Number(minute);
                state.Alarm9.now.title=title;
            } else if (num=="Alarm10") {
                state.Alarm10.now.day=Number(rday);
                state.Alarm10.now.month=month;
                state.Alarm10.now.year=Number(year);
                state.Alarm10.now.hour=Number(hour);
                state.Alarm10.now.minute=Number(minute);
                state.Alarm10.now.title=title;
            }
        }
    },
    
    chkalarm1 = function() {
        if (Number(state.Calendar.now.year)==Number(state.Alarm1.now.year)) {
            if (Number(state.Calendar.now.ordinal)==Number(state.Alarm1.now.day)) {
                if (Number(state.Calendar.now.hour)>=Number(state.Alarm1.now.hour)) {
                    if (Number(state.Calendar.now.minute)>=Number(state.Alarm1.now.minute)) {
                        sendChat("Calendar",`/w gm Alarm >>${state.Alarm1.now.title}<< triggered!`);
                    }
                }
            }
        } 
    },
    
    chkalarm2 = function() {
        if (Number(state.Calendar.now.year)==Number(state.Alarm2.now.year)) {
            if (Number(state.Calendar.now.ordinal)==Number(state.Alarm2.now.day)) {
                if (Number(state.Calendar.now.hour)>=Number(state.Alarm2.now.hour)) {
                    if (Number(state.Calendar.now.minute)>=Number(state.Alarm2.now.minute)) {
                        sendChat("Calendar",`/w gm Alarm >>${state.Alarm2.now.title}<< triggered!`);
                    }
                }
            }
        }
    },
    
    chkalarm3 = function() {
        if (Number(state.Calendar.now.year)==Number(state.Alarm3.now.year)) {
            if (Number(state.Calendar.now.ordinal)==Number(state.Alarm3.now.day)) {
                if (Number(state.Calendar.now.hour)>=Number(state.Alarm3.now.hour)) {
                    if (Number(state.Calendar.now.minute)>=Number(state.Alarm3.now.minute)) {
                        sendChat("Calendar",`/w gm Alarm >>${state.Alarm3.now.title}<< triggered!`);
                    }
                }
            }
        }
    },
    
    chkalarm4 = function() {
        if (Number(state.Calendar.now.year)==Number(state.Alarm4.now.year)) {
            if (Number(state.Calendar.now.ordinal)==Number(state.Alarm4.now.day)) {
                if (Number(state.Calendar.now.hour)>=Number(state.Alarm4.now.hour)) {
                    if (Number(state.Calendar.now.minute)>=Number(state.Alarm4.now.minute)) {
                        sendChat("Calendar",`/w gm Alarm >>${state.Alarm4.now.title}<< triggered!`);
                    }
                }
            }
        }
    },
    
    chkalarm5 = function() {
        if (Number(state.Calendar.now.year)==Number(state.Alarm5.now.year)) {
            if (Number(state.Calendar.now.ordinal)==Number(state.Alarm5.now.day)) {
                if (Number(state.Calendar.now.hour)>=Number(state.Alarm5.now.hour)) {
                    if (Number(state.Calendar.now.minute)>=Number(state.Alarm5.now.minute)) {
                        sendChat("Calendar",`/w gm Alarm >>${state.Alarm5.now.title}<< triggered!`);
                    }
                }
            }
        }
    },
    
    chkalarm6 = function() {
        if (Number(state.Calendar.now.year)==Number(state.Alarm6.now.year)) {
            if (Number(state.Calendar.now.ordinal)==Number(state.Alarm6.now.day)) {
                if (Number(state.Calendar.now.hour)>=Number(state.Alarm6.now.hour)) {
                    if (Number(state.Calendar.now.minute)>=Number(state.Alarm6.now.minute)) {
                        sendChat("Calendar",`/w gm Alarm >>${state.Alarm6.now.title}<< triggered!`);
                    }
                }
            }
        }
    },
    
    chkalarm7 = function() {
        if (Number(state.Calendar.now.year)==Number(state.Alarm7.now.year)) {
            if (Number(state.Calendar.now.ordinal)==Number(state.Alarm7.now.day)) {
                if (Number(state.Calendar.now.hour)>=Number(state.Alarm7.now.hour)) {
                    if (Number(state.Calendar.now.minute)>=Number(state.Alarm7.now.minute)) {
                        sendChat("Calendar",`/w gm Alarm >>${state.Alarm7.now.title}<< triggered!`);
                    }
                }
            }
        }
    },
    
    chkalarm8 = function() {
        if (Number(state.Calendar.now.year)==Number(state.Alarm8.now.year)) {
            if (Number(state.Calendar.now.ordinal)==Number(state.Alarm8.now.day)) {
                if (Number(state.Calendar.now.hour)>=Number(state.Alarm8.now.hour)) {
                    if (Number(state.Calendar.now.minute)>=Number(state.Alarm8.now.minute)) {
                        sendChat("Calendar",`/w gm Alarm >>${state.Alarm8.now.title}<< triggered!`);
                    }
                }
            }
        }
    },
    
    chkalarm9 = function() {
        if (Number(state.Calendar.now.year)==Number(state.Alarm9.now.year)) {
            if (Number(state.Calendar.now.ordinal)==Number(state.Alarm9.now.day)) {
                if (Number(state.Calendar.now.hour)>=Number(state.Alarm9.now.hour)) {
                    if (Number(state.Calendar.now.minute)>=Number(state.Alarm9.now.minute)) {
                        sendChat("Calendar",`/w gm Alarm >>${state.Alarm9.now.title}<< triggered!`);
                    }
                }
            }
        }
    },
    
    chkalarm10 = function() {
        if (Number(state.Calendar.now.year)==Number(state.Alarm10.now.year)) {
            if (Number(state.Calendar.now.ordinal)==Number(state.Alarm10.now.day)) {
                if (Number(state.Calendar.now.hour)>=Number(state.Alarm10.now.hour)) {
                    if (Number(state.Calendar.now.minute)>=Number(state.Alarm10.now.minute)) {
                        sendChat("Calendar",`/w gm Alarm >>${state.Alarm10.now.title}<< triggered!`);
                    }
                }
            }
        }
    },
    
    encounter = function(loc) {
        var rand=Math.random();
        if (String(loc)=="Wilderness") {
            if (rand<=0.125) {
                sendChat("Calendar","/w gm No Encounters today!");
            } else if (rand<=0.5) {
                sendChat("Calendar","/w gm There is 1 Encounter today!");
            } else if (rand<=0.875) {
                sendChat("Calendar","/w gm There are 2 Encounters today!");
            } else {
                sendChat("Calendar","/w gm There are 3 Encounters today!");
            }
        } else if (String(loc)=="City") {
            if (rand<=0.125) {
                sendChat("Calendar","/w gm There are 2 Encounters today!");
            } else if (rand<=0.5) {
                sendChat("Calendar","/w gm There are 3 Encounters today!");
            } else if (rand<=0.875) {
                sendChat("Calendar","/w gm There are 4 Encounters today!");
            } else {
                sendChat("Calendar","/w gm There are 5 Encounters today!");
            }
        }
    },
    
    checkInstall = function() {
        // Check if the Calendar property exists, creating it if it doesn't
        if( ! state.Calendar ) {
            setDefaults();
        }
        if ( ! state.Alarm1 ) {
            setAlarm1Defaults();
        }
        if ( ! state.Alarm2 ) {
            setAlarm2Defaults();
        }
        if ( ! state.Alarm3 ) {
            setAlarm3Defaults();
        }
        if ( ! state.Alarm4 ) {
            setAlarm4Defaults();
        }
        if ( ! state.Alarm5 ) {
            setAlarm5Defaults();
        }
        if ( ! state.Alarm6 ) {
            setAlarm6Defaults();
        }
        if ( ! state.Alarm7 ) {
            setAlarm7Defaults();
        }
        if ( ! state.Alarm8 ) {
            setAlarm8Defaults();
        }
        if ( ! state.Alarm9 ) {
            setAlarm9Defaults();
        }
        if ( ! state.Alarm10 ) {
            setAlarm10Defaults();
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

on("ready",function(){
	'use strict';
	Calendar.CheckInstall();
	Calendar.RegisterEventHandlers();
});
