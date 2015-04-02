/*! GUMSHOE Engine for Roll20 - v0.1 - 2015-03-13
* https://ramblurr.github.io/roll20-character-sheets/
* Copyright (c) 2015 Casey Link; Licensed MIT */
// vim:fdm=marker
// {{{ GUMSHOE Constants
var gumCONSTANTS = {

    rollCOMMAND : "!roll",
    gumshoeCOMMAND : "!gum",

    addAbilityFields: [ "dedicated", "iskills", "gskills" ],

    // The Macros available to players, not used yet
    rollMACROS: [],
};
// }}}

/*! GUMSHOE Engine for Roll20 - v0.1 - 2015-03-13
* https://ramblurr.github.io/roll20-character-sheets/
* Copyright (c) 2015 Casey Link; Licensed MIT */
/*! {{{ nodjs printf
 * Formats a string for printing.
 *
 * docs: http://nodejs.org/api/util.html#util_util_format_format
 * license: MIT - https://raw.github.com/joyent/node/v0.10.28/LICENSE
 *
 * Copyright Joyent, Inc. and other Node contributors.
 */
var formatRegexp                        = /%[sdj%]/g;
var format = function (f) {
    var args                            = Array.prototype.slice.call(arguments, 0);
    var argl                            = args.length;

    if (typeof f !== 'string') {
        var objects                     = [];
        while (argl--) {
            objects.unshift(args[i].toString());
        }

        return objects.join(' ');
    }

    var i                               = 1;
    var str = String(f).replace(formatRegexp, function (x) {
        if (x === '%%') return '%';
        if (i >= args) return x;
        switch (x) {
            case '%s' : return String(args[i++]);
            case '%d' : return Number(args[i++]);
            case '%j' : return JSON.stringify(args[i++]);
            default:
                return x;
        }
    });

    var x;
    while (i++ < argl) {
        x                               = args[i];
        if (x === null || typeof x !== 'object') {
            str                         = [str, x].join(' ')
        }
        else {
            str                         += [str, x.toString()].join();
        }
    }

    return str;
};
// }}}



/*! {{{ Kolorwheel library
 *
 * This small javascript library is designed for developers, who have no talent
 * and time to create professional color palettes. Pick a base color, build a
 * transformation chain, and if you haven't chose too weird parameters, the
 * result will be satisfactory.
 *
 * source: https://github.com/ern0/kolorwheel.js
 * project: http://linkbroker.hu/stuff/kolorwheel.js/
 * license: public domain
 */
function KolorWheel(a){this.resultList=[this];this.elm=null;if(typeof(a)=="undefined"){a="#000000"}if(typeof(a.validateHsl)=="function"){this.setHsl([a.h,a.s,a.l])}else{this.setColor(a)}}KolorWheel.prototype.setColor=function(a){if(typeof(a)=="undefined"){return}if(typeof(a)=="object"){this.setHsl(a)}else{this.setHex(a)}};KolorWheel.prototype.setHsl=function(a){this.h=a[0];this.s=a[1];this.l=a[2];this.validateHsl();return this};KolorWheel.prototype.validateHsl=function(){this.h=this.h%360;if(this.h<0){this.h+=360}if(this.s<0){this.s=0}if(this.s>100){this.s=100}if(this.l<0){this.l=0}if(this.l>100){this.l=100}};KolorWheel.prototype.setHex=function(e){if(e.substring(0,1)=="#"){e=e.substring(1)}var d=parseInt(e.substring(0,2),16);var c=parseInt(e.substring(2,4),16);var a=parseInt(e.substring(4,6),16);this.setRgb([d,c,a]);return this};KolorWheel.prototype.setRgb=function(e){var i=e[0]/255;var h=e[1]/255;var c=e[2]/255;var a=Math.max(i,h,c);var f=Math.min(i,h,c);this.h=(a+f)/2;this.s=this.h;this.l=this.h;if(a==f){this.h=0;this.s=0}else{var j=a-f;this.s=this.l>0.5?j/(2-a-f):j/(a+f);switch(a){case i:this.h=(h-c)/j+(h<c?6:0);break;case h:this.h=(c-i)/j+2;break;case c:this.h=(i-h)/j+4;break}this.h=this.h/6}this.h=360*this.h;this.s=100*this.s;this.l=100*this.l;return this};KolorWheel.prototype.hue2rgb=function(c,b,a){if(a<0){a+=1}if(a>1){a-=1}if(a<1/6){return c+(b-c)*6*a}if(a<1/2){return b}if(a<2/3){return c+(b-c)*(2/3-a)*6}return c};KolorWheel.prototype.getRgb=function(){this.validateHsl();var e=this.h/360;var d=this.s/100;var c=this.l/100;var i=c;var f=c;var a=c;if(d!=0){var j=c<0.5?c*(1+d):c+d-c*d;var k=2*c-j;i=this.hue2rgb(k,j,e+1/3);f=this.hue2rgb(k,j,e);a=this.hue2rgb(k,j,e-1/3)}return[Math.round(i*255),Math.round(f*255),Math.round(a*255)]};KolorWheel.prototype.getHex=function(){var a=this.getRgb();var b=this.toHexByte(a[0]);b+=this.toHexByte(a[1]);b+=this.toHexByte(a[2]);return"#"+b.toUpperCase()};KolorWheel.prototype.toHexByte=function(b){var a=b.toString(16);if(a.length<2){a="0"+a}return a};KolorWheel.prototype.getHsl=function(){this.validateHsl();return[this.h,this.s,this.l]};KolorWheel.prototype.multi=function(j,o,n,m,l,k,h,f,d,c){var e=[].concat(this.resultList);this.resultList=[];for(var b in e){var a=e[b];a.workList=[];if(j=="rel"){KolorWheel.prototype.spinSingle.call(a,"rel",o,n,m,l,k,h,f,d,c)}if(j=="abs"){KolorWheel.prototype.spinSingle.call(a,"abs",o,n,m,l,k,h,f,d,c)}this.resultList=this.resultList.concat(a.workList)}if(this.resultList.length==0){return this}var g=this.resultList[this.resultList.length-1];this.h=g.h;this.s=g.s;this.l=g.l;return this};KolorWheel.prototype.rel=function(d,c,a,b,e){return this.multi("rel",d,c,a,b,e)};KolorWheel.prototype.abs=function(d,c,a,b,g){var f=false;if(typeof(d)=="object"){if(typeof(d.validateHsl)=="function"){f=true}}else{if((""+d).substring(0,1)=="#"){f=true}if((""+d).length>4){f=true}}if(f){var e=new KolorWheel(d);return this.multi("abs",e.h,e.s,e.l,c,a)}else{return this.multi("abs",d,c,a,b,g)}};KolorWheel.prototype.spinSingle=function(i,l,f,j,d,c){var h=(i=="abs"?-1:0);if(typeof(l)=="undefined"){l=h}if(typeof(f)=="undefined"){f=h}if(typeof(j)=="undefined"){j=h}if(typeof(l)=="undefined"){d=12}var o=0;var k=0;var n=0;if(typeof(l)=="object"){o=l.length}if(typeof(f)=="object"){k=f.length}if(typeof(j)=="object"){n=j.length}if(typeof(d)=="undefined"){d=1;if(o>d){d=o}if(k>d){d=k}if(n>d){d=n}}if(typeof(c)=="undefined"){c=0}var e=null;if(typeof(d)=="object"){e=d;d=e.length}for(step=c;step<d;step++){var p=new KolorWheel(this);var a=(d==1?1:step/(d-1));var g;var m;var b;if(o>0){g=l[step%o]}else{g=l*a}if(k>0){m=f[step%k]}else{m=f*a}if(n>0){b=j[step%n]}else{b=j*a}if(i=="rel"){p.h+=g;p.s+=m;p.l+=b}else{if(l==h){p.h=this.h}else{if(o==0){p.h=this.calcLinearGradientStep(step,d,this.h,l)}else{p.h=g}}if(f==h){p.s=this.s}else{if(k==0){p.s=this.calcLinearGradientStep(step,d,this.s,f)}else{p.s=m}}if(j==h){p.l=this.l}else{if(n==0){p.l=this.calcLinearGradientStep(step,d,this.l,j)}else{p.l=b} }}p.step=step;if(e){p.elm=e.eq(step)}this.workList[step]=p}};KolorWheel.prototype.calcLinearGradientStep=function(d,c,e,f){var b=(d/(c-1));var a=e+((f-e)*b);return a};KolorWheel.prototype.each=function(b){for(var a in this.resultList){b.call(this.resultList[a],this.resultList[a].elm)}};KolorWheel.prototype.get=function(a){if(typeof(a)=="undefined"){a=0}return this.resultList[a]};KolorWheel.prototype.isDark=function(){return(!this.isLight())};KolorWheel.prototype.isLight=function(){var b=this.getRgb();var a=(0.299*b[0])+(0.587*b[1])+(0.114*b[2]);return(a>127)};
// }}}



/*! {{{ Chat Panels
 * Create pretty all purpose text panels in the chat. API only, no chat commands.
 *
 * author: Casey Link
 * version: v0.2
 * license: MIT
 */

/**
 */

function PanelColors (bg, head, border) {
    this.headBG   = bg,
    this.headText = head,
    this.border   = border
};

PanelColors.Error   = new PanelColors("rgb(242, 222, 222)",  "rgb(169, 68, 66)", "rgb(235, 204, 209)");
PanelColors.Info    = new PanelColors("rgb(217, 237, 247)", "rgb(49, 112, 143)", "rgb(188, 232, 241)");
PanelColors.Warning = new PanelColors("rgb(252, 248, 227)", "rgb(138, 109, 59)", "rgb(250, 235, 204)");
PanelColors.Success = new PanelColors("rgb(223, 240, 216)", "rgb(60, 118, 61)", "rgb(214, 233, 198)");

function Panel(colors) {
    this.panelMarkup = {
        outerDiv   : '<div style="background-color: rgb(255, 255, 255); border-bottom-color: COLOR_BORDER; border-bottom-left-radius: 4px; border-bottom-right-radius: 4px; border-bottom-style: solid; border-bottom-width: 1px; border-image-outset: 0px; border-image-repeat: stretch; border-image-slice: 100%; border-image-source: none; border-image-width: 1; border-left-color: COLOR_BORDER; border-left-style: solid; border-left-width: 1px; border-right-color: COLOR_BORDER; border-right-style: solid; border-right-width: 1px; border-top-color: COLOR_BORDER; border-top-left-radius: 4px; border-top-right-radius: 4px; border-top-style: solid; border-top-width: 1px; -webkit-box-shadow: rgba(0, 0, 0, 0.0470588) 0px 1px 1px 0px; box-shadow: rgba(0, 0, 0, 0.0470588) 0px 1px 1px 0px; box-sizing: border-box; color: rgb(51, 51, 51); display: block; font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; margin-bottom: 0px;">',
        headDiv    :  '<div style="  background-color: COLOR_BG; border-bottom-color: COLOR_BORDER; border-bottom-style: solid; border-bottom-width: 1px; border-left-color: COLOR_BORDER; border-right-color: COLOR_BORDER; border-top-color: COLOR_BORDER; border-top-left-radius: 3px; border-top-right-radius: 3px; box-sizing: border-box; color: COLOR_HEAD; display: block; font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; padding-bottom: 10px; padding-left: 15px; padding-right: 15px; padding-top: 10px;"> ',
        h3         : '<h3 style=" box-sizing: border-box; color: COLOR_HEAD; display: block; font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 500; line-height: 17.600000381469727px; margin-bottom: 0px; margin-top: 0px;"> ',
        contentDiv : '<div style=" box-sizing: border-box; color: rgb(51, 51, 51); display: block; font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; padding-bottom: 15px; padding-left: 15px; padding-right: 15px; padding-top: 15px;">',
    };
    this.colors = colors;
    this.format_colors = function(str) {
        return str.replace(/COLOR_HEAD/g, this.colors.headText).replace(/COLOR_BORDER/g, this.colors.border).replace(/COLOR_BG/g, this.colors.headBG);
    };
    this.render = function(head, detail) {
        var outerDiv = this.format_colors(this.panelMarkup.outerDiv),
        headDiv = this.format_colors(this.panelMarkup.headDiv),
        h3 = this.format_colors(this.panelMarkup.h3),
        contentDiv = this.panelMarkup.contentDiv,
        closeDiv = '</div>',
        closeh3 = '</h3>',
        str = outerDiv;

        if(head)
            str += headDiv + h3 + head + closeh3 + closeDiv;
        if(detail)
            str += contentDiv + detail + closeDiv;
        str += closeDiv;
        return str;
    };
};

Panel.success = function(ctx, head, detail) {
    log("success: " + head + ": " + detail);
    var panel = new Panel(PanelColors.Success).render(head, detail);
    sendChat('', '/direct ' + panel);
};

Panel.warning = function (ctx, head, detail) {
    log("warning: " + head + ": " + detail);
    var panel = new Panel(PanelColors.Warning).render(head, detail);
    sendChat('', '/direct ' + panel);
};

Panel.info = function (ctx, head, detail) {
    log("info: " + head + ": " + detail);
    var panel = new Panel(PanelColors.Info).render(head, detail);
    sendChat('', '/direct ' + panel);
};

Panel.error = function (ctx, head, detail) {
    log("error: " + head + ": " + detail);
    var panel = new Panel(PanelColors.Error).render(head, detail);
    sendChat('', '/direct ' + panel);
};

Panel.player = function (ctx, head, detail) {
    var primary = ModUtils.getPlayerColor(ctx.playerid),
    wheel = new KolorWheel(primary),
    pal = wheel.rel( 0, 0,[-20,30,40]),
    colors = new PanelColors(pal.get(1).getHex(), pal.get(0).getHex(), pal.get(2).getHex()),
    panel = new Panel(colors).render(head, detail);
    sendChat(ctx.who, '/direct ' + panel);
}

// }}}



/*! {{{ Mod Utils
 * Commonly used functions for Roll20 script developers.
 *
 * author: Casey Link, Sam (Thequietcroc)
 * version: v0.1
 * license: MIT
 */

var ModUtils = ModUtils || {};

ModUtils.empty = function(container) {
    while(container.length > 0) {
        container.pop();
    }
}
ModUtils._split = function (attr) {
    var fields = attr.split('_');
    var category = fields[1];
    var index = fields[2];
    var name = fields[3];
    return { category: category, index: index, name:name, value:undefined, attr:attr };
}


ModUtils._collectRepeating = function(repeating) {
    var collected = [];
    _.each(repeating, function(category,cat_name,l) {
        var grouped = _.groupBy(category, 'index');
        _.each(_.values(grouped), function(attr_col,i,l) {
            var final = _.reduce(attr_col, function(memo,attr) {
                memo[attr.name] = {value: attr.value, attr: attr.attr};
                return memo;
            }, {'category':cat_name});
            collected.push(final);
        });
    });
    return collected;
}

ModUtils.getRepeatingAttributes = function(char_id) {
    var attributes = findObjs({type: "attribute", _characterid: char_id});
    var repeating = {};
    _.each(attributes, function(indexAttributes) {
        var attName = indexAttributes.get("name");
        if(attName.indexOf("repeating") > -1) {
            var name = indexAttributes.get('name');
            var attr = ModUtils._split(name);
            attr.value = indexAttributes.get('current');
            if(!repeating[attr.category])
               repeating[attr.category] = [];
            repeating[attr.category].push(attr);
        };
    });
    return ModUtils._collectRepeating(repeating);
}

ModUtils.alterAttribute = function(char_id, attr_name, modVal) {
    var attribute = findObjs({
        _type: "attribute",
        _characterid: char_id,
        _name: attr_name
    })[0];

    if (attribute == undefined) {
        ModUtils.setAttribute(char_id, attr_name, modVal);
        return;
    }
    //log(attribute);
    attribute.set("current", (parseInt(attribute.get("current")) + modVal).toString());
    //log(attribute);
}
ModUtils.setAttribute = function(char_id, attr_name, newVal) {
    var attribute = findObjs({
        _type: "attribute",
        _characterid: char_id,
        _name: attr_name
    })[0];

    //log(attribute);
    if (attribute == undefined) {
        createObj("attribute", {
            name: attr_name,
            current: newVal,
            characterid: char_id
        });
    } else {
        attribute.set("current", newVal.toString());
    }
    //log(attribute);
}

ModUtils.hasAttribute = function(char_id, attr_name) {
    var attribute = findObjs({
        _type: "attribute",
        _characterid: char_id,
        _name: attr_name
    })[0];
    return attribute != undefined;
}

ModUtils.decrementAttribute = function(char_id, attr_name, curVal) {
    var attribute = findObjs({
        _type: "attribute",
        _characterid: char_id,
        _name: attr_name
    })[0];

    if (attribute == undefined) {
        ModUtils.setAttribute(char_id, attr_name, -1);
        return;
    }
    //log(attribute);
    attribute.set("current", (parseInt(curVal) - 1).toString());
    //log(attribute);
}

ModUtils.incrementAttribute = function(char_id, attr_name, curVal) {
    var attribute = findObjs({
        _type: "attribute",
        _characterid: char_id,
        _name: attr_name
    })[0];

    if (attribute == undefined) {
        ModUtils.setAttribute(char_id, attr_name, 1);
        return;
    }
    //log(attribute);
    attribute.set("current", (parseInt(curVal) + 1).toString());
    //log(attribute);
}



/**
 * Change the values of a token's bar
 */
ModUtils.alterBar = function(tokenID, barNum, modVal) {
    var token = getObj("graphic", tokenID);
    if (token == undefined || barNum < 1 && barNum > 3) return;

    var bar = "bar" + barNum;
    var barVal = parseInt(token.get(bar + "_value"));
    var barMax = parseInt(token.get(bar + "_max"));
    barVal += modVal;

    if (barVal > barMax) barVal = barMax;

    token.set(bar + "_value", barVal);
};

/**
 * Returns the players chat color
 */
ModUtils.getPlayerColor = function (playerid) {
    var player = getObj('player', playerid);
    return player.get('color');
}


/**
 * Returns a list of tokens on the current page that
 * represent the given player.
 * @playerid the player
 */
ModUtils.avatarForPlayer = function (playerid) {
    log("ModUtils.avatarForPlayer: " + playerid);

    var chars = findObjs({
        _type: "character",
        controlledby: playerid
    });

    var avatars = null;
    _.each(chars, function(toon) {
        avatars = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            represents: toon("_id")
        });
    });
    avatars = _.reject(avatars, function(toon) { toon == null; });
    return avatars;
}


ModUtils.onAttributeChange = function(char_id, attr, callback) {
    ModUtils._HandlersAttributes.push({char_id: char_id, attr:attr, callback: callback});
};

ModUtils._attrChange = function(obj, prev) {
    var obj_char_id = obj.get('_characterid');
    _.each(ModUtils._HandlersAttributes, function(record) {
        if(record.char_id === obj_char_id && record.attr === obj.get('_id')) {
            record.callback(obj, prev);
        }
    });
};

ModUtils.CheckInstall = function() {
    if( ! _.has(state,'ModUtils') || ! _.has(state.ModUtils,'version') || state.ModUtils.version != ModUtils.version )
        {
            state.ModUtils={
                version: ModUtils.version,
                callbacks: {
                    attributes: []
                },
                unknown: []
            };
        }
        if(ModUtils._HandlersAttributes === undefined) {
            ModUtils._HandlersAttributes = [];
        }

        /*
        state.ModUtils.unknown=_.difference(
            _.pluck(players,'id'),
            state.ModUtils.callbacks
        );
        ModUtils.active = (state.IsGM.unknown.length>0);
        */
};

ModUtils.RegisterEventHandlers = function() {
    /*
    on("change:attribute", function(obj, prev) {
        ModUtils._attrChange(obj, prev);
    });
    */
}


on('ready',function() {
    ModUtils.CheckInstall();
    ModUtils.RegisterEventHandlers();
});


var gumABILITIES = [
    {name:'archaeology',pretty:'Archaeology'},
    {name:'architecture',pretty:'Architecture'},
    {name:'art_history',pretty:'Art History'},
    {name:'biology',pretty:'Biology'},
    {name:'cthulhu_mythos',pretty:'Cthulhu Mythos'},
    {name:'geology',pretty:'Geology'},
    {name:'history',pretty:'History'},
    {name:'languages',pretty:'Languages'},
    {name:'law',pretty:'Law'},
    {name:'library_use',pretty:'Library Use'},
    {name:'medicine',pretty:'Medicine'},
    {name:'occult_studies',pretty:'Occult Studies'},
    {name:'physics',pretty:'Physics'},
    {name:'theology',pretty:'Theology'},
    {name:'military_science',pretty:'Military Science'},
    {name:'assess_honesty',pretty:'Assess Honesty'},
    {name:'bargain',pretty:'Bargain'},
    {name:'bureaucracy',pretty:'Bureaucracy'},
    {name:'cop_talk',pretty:'Cop Talk'},
    {name:'credit_rating',pretty:'Credit Rating'},
    {name:'flattery',pretty:'Flattery'},
    {name:'intimidation',pretty:'Intimidation'},
    {name:'oral_history',pretty:'Oral History'},
    {name:'reassurance',pretty:'Reassurance'},
    {name:'streetwise',pretty:'Streetwise'},
    {name:'accounting',pretty:'Accounting'},
    {name:'art',pretty:'Art'},
    {name:'astronomy',pretty:'Astronomy'},
    {name:'chemistry',pretty:'Chemistry'},
    {name:'craft',pretty:'Craft'},
    {name:'cryptography',pretty:'Cryptography'},
    {name:'evidence_collection',pretty:'Evidence Collection'},
    {name:'forensics',pretty:'Forensics'},
    {name:'interrogation',pretty:'Interrogation'},
    {name:'locksmith',pretty:'Locksmith'},
    {name:'outdoorsman',pretty:'Outdoorsman'},
    {name:'pharmacy',pretty:'Pharmacy'},
    {name:'photography',pretty:'Photography'},
    {name:'forgery',pretty:'Forgery'},
    {name:'athletics',pretty:'Athletics'},
    {name:'conceal',pretty:'Conceal'},
    {name:'disguise',pretty:'Disguise'},
    {name:'driving',pretty:'Driving'},
    {name:'electrical_repair',pretty:'Electrical Repair'},
    {name:'explosives',pretty:'Explosives'},
    {name:'filch',pretty:'Filch'},
    {name:'firearms',pretty:'Firearms'},
    {name:'first_aid',pretty:'First Aid'},
    {name:'fleeing',pretty:'Fleeing'},
    {name:'health',pretty:'Health'},
    {name:'hypnosis',pretty:'Hypnosis'},
    {name:'magic',pretty:'Magic'},
    {name:'mechanical_repair',pretty:'Mechanical Repair'},
    {name:'piloting',pretty:'Piloting'},
    {name:'preparedness',pretty:'Preparedness'},
    {name:'psychoanalysis',pretty:'Psychoanalysis'},
    {name:'riding',pretty:'Riding'},
    {name:'sanity',pretty:'Sanity'},
    {name:'scuffling',pretty:'Scuffling'},
    {name:'sense_trouble',pretty:'Sense Trouble'},
    {name:'stability',pretty:'Stability'},
    {name:'shadowing',pretty:'Shadowing'},
    {name:'stealth',pretty:'Stealth'},
    {name:'weapons',pretty:'Weapons'},
    {name:'espionage',pretty:'Espionage'},
    {name:'career',pretty:'Career'},
];

// vim:fdm=marker

// {{{ Gumshoe Engine


var Gumshoe = Gumshoe || {};


Gumshoe.systemCheck = function (ctx) {
    log("Gumshoe.systemCheck");
    var resp = '<ul>';
    // check macros exist
    var macro_missing = false;
    _.each(gumCONSTANTS.rollMACROS, function(m) {
        var existing = findObjs({_type: "macro", name: m.name});
        if( existing.length == 0 ) {
            macro_missing = true;
            return;
        }
    });
    var everything_ok = !macro_missing && handouts.length != 0;
    if(everything_ok)
        resp += 'Everything looks ok!';

    resp += '</ul>';

    if( everything_ok )
        Panel.success(ctx, "GUMSHOE Engine", resp);
    else
        Panel.error(ctx, "GUMSHOE Engine", resp);
}

Gumshoe.createMacros = function (ctx) {
    log("Gumshoe.createMacros");
    // not used by GUMSHOE script
}

Gumshoe.getMacros = function (ctx) {
    log("Gumshoe.getMacros");
    var macros = findObjs({_type: "macro"});
    log(macros);
}

Gumshoe.resetState = function (ctx) {
    log("Gumshoe.resetState");
    Panel.success(ctx, "GUMSHOE Engine", "GUMSHOE Engine has been reset");
}

// }}}

Gumshoe.say = function (ctx, head, body) {
    if(ctx.silent)
        sendChat("Gumshoe", '/w ' + ctx.who + ' ' + head + ": " + (!body ? ' ' : body) );
    else
        Panel.player(ctx, head, body);
}

Gumshoe.isValidAbility = function(ability) {
        return true;
}

Gumshoe.getAddAbilities = function(char_id) {
    var repeating = ModUtils.getRepeatingAttributes(char_id);
    return _.filter(repeating, function(a) {
        return _.contains(gumCONSTANTS.addAbilityFields, a.category);
    });
}

// normalize user input for easy comparison
Gumshoe.normalize = function(str) {
    return str.toLowerCase();
}

Gumshoe.getAddAbility = function(char_id, input_ability) {
    var adds = Gumshoe.getAddAbilities(char_id);
    log(adds);
    var ability = _.filter(adds, function(a) {
        return Gumshoe.normalize(a.name.value) == input_ability;
    });
    if(ability.length == 0) {
        log(format("Gumshoe.getAddAbility(%s) failed to find ", input_ability));
        log(adds);
        return undefined;
    }
    return ability[0];
}

Gumshoe.attr = function(char_id, input_ability) {
    var ability = _.findWhere(gumABILITIES, {'name':input_ability});
    if(ability === undefined) {
        log(format("Gumshoe.attr(%s): unofficial", input_ability));
        var ability = Gumshoe.getAddAbility(char_id, input_ability);
        if ( ability === undefined )
            return ability;
        if ( ability.rating === undefined || ability.spent === undefined )
            return undefined;
        return {
            rating: ability.rating.attr,
            spent: ability.spent.attr
        };
    } else {
        log(format("Gumshoe.attr(%s): got official", input_ability));
        return {
            rating: input_ability + '_rating',
            spent: input_ability + '_spent',
        };
    }
}

Gumshoe.getPool = function (char_id, ability) {
    var attr = Gumshoe.attr(char_id, ability);
    var rating = getAttrByName(char_id, attr.rating);
    var spent = getAttrByName(char_id, attr.spent);
    log('getPool rating: ' + rating);
    log('getPool spent: ' + spent);
    return rating - spent;
}

Gumshoe.incPool = function (char_id, ability) {
    var attr = Gumshoe.attr(char_id, ability);
    var curVal = getAttrByName(char_id, attr.spent);
    ModUtils.decrementAttribute(char_id, attr.spent, curVal);
}

Gumshoe.decPool = function (char_id, ability) {
    var attr = Gumshoe.attr(char_id, ability);
    var curVal = getAttrByName(char_id, attr.spent);
    ModUtils.incrementAttribute(char_id, attr.spent, curVal);
}

Gumshoe.hasAbility = function(char_id, ability) {
    log(format('Gumshoe.hasAbility(%s,%s)', char_id, ability));
    if(!Gumshoe.isValidAbility(ability)) return false;

    var attr = Gumshoe.attr(char_id, ability);
    var rating = getAttrByName(char_id, attr.rating);
    if( rating > 0 ) return true;
    return false;
}

Gumshoe.canSpend = function(char_id, ability, amount) {
    if( !Gumshoe.hasAbility(char_id, ability) ) return false;

    var pool = Gumshoe.getPool(char_id, ability);
    var r = pool - amount;
    log("can spend pool  - r: " + pool + ' - ' + r);
    if((pool - amount) >= 0) return true;
    return false;
}

Gumshoe.spendPoint = function (char_id, ability, amount) {
    if( !Gumshoe.canSpend(char_id, ability, amount) ) return false;
    _(amount).times(function (n){ Gumshoe.decPool(char_id, ability); });
    return true;
}

Gumshoe.commandRoll= function(argv, ctx) {
    var chars = findObjs({
        _type: "character",
        controlledby: ctx.playerid
    });

    if(chars.length == 0) {
        Panel.error(ctx, "Token Error", "You don't have a destination selected nor a character assigned.");
        return;
    }
    var char_id = chars[0].id;

    var ability = argv[0];
    if( !Gumshoe.isValidAbility(ability) ) {
        Panel.error(ctx, "Error", "Invalid ability: " + ability);
        return;
    }

    var spend_str = argv[1];
    var spend = Number(spend_str);
    if(isNaN(spend)) {
        Gumshoe.say(ctx, "ERROR: Spend value not valid: " + spend_str);
        return;
    }

    var attr = Gumshoe.attr(char_id, ability);
    if( attr === undefined ) {
        Gumshoe.say(ctx, "Error", format("Attribute %s not found.", ability));
        return;
    }

    if(spend > 0 && !Gumshoe.spendPoint(char_id, ability, spend)) {
        Gumshoe.say(ctx, format("ERROR: You can't spend %d on %s.", spend, ability));
        return;
    }

    var roll_cmd = "/roll 1d6";
    if(spend > 0)
        roll_cmd += ' + ' + spend;

    Panel.player(ctx, "Rolling...", format("Rolling %s with %d point spend.", ability, spend));
    sendChat(ctx.who, roll_cmd);
}

Gumshoe.processCommands = function(argv, ctx) {
    log("Gumshoe.processCommands: " + argv);
    log("Gumshoe.processCommands: " + ctx.who);

    var script = Gumshoe.normalize(argv.shift());
    if(argv[0])
        argv[0] = Gumshoe.normalize(argv[0]);
    log("argv[0]: '" + argv[0]+"'");
    ctx.silent = false;
    switch(script) {
        case '!dim':
            var o = getObj(ctx.selected[0]['_type'], ctx.selected[0]['_id'])
            log(o.get('width'), o.get('height'))
        break;
        case gumCONSTANTS.gumshoeCOMMAND:
            switch(argv[0]) {
            case "setup":
                if( playerIsGM(ctx.playerid) ) gumshoeCreateMacros(ctx);
            case "reset":
                if( playerIsGM(ctx.playerid) ) gumshoeResetState(ctx);
            break;
        }
        break;
        case gumCONSTANTS.rollCOMMAND:
            Gumshoe.commandRoll(argv, ctx);
        break;
    }
};

Gumshoe.RegisterEventHandlers = function() {
    on("chat:message", function(msg) {
        var chatCommand = msg.content;

        var argv = chatCommand.split(' ');
        if (msg.type != 'api') {
            log("api message");
            return;
        }
        return Gumshoe.processCommands(argv, msg);
    });
};

Gumshoe.CheckInstall = function() {
};

// }}}

// {{{ Event Handling

on('ready',function(){
    Gumshoe.CheckInstall();
    Gumshoe.RegisterEventHandlers();
});

// }}}



