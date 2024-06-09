var API_Meta = API_Meta || {};
API_Meta.Supernotes = {
    offset: Number.MAX_SAFE_INTEGER,
    lineCount: -1
}; {
    try {
        throw new Error('');
    } catch (e) {
        API_Meta.Supernotes.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (7));
    }
}

// Supernotes_Templates can be called by other scripts. At this point ScriptCards is the only One Click script that does this.
let Supernotes_Templates = {
    generic: {
        boxcode: `<div style='color: #000; border: 1px solid #000; background-color: white; box-shadow: 0 0 3px #000; display: block; text-align: left; font-size: 13px; padding: 5px; margin-bottom: 2px; font-family: sans-serif; white-space: pre-wrap;'>`,
        titlecode: `<div style='font-weight:bold; color:#fff; background-color:#404040; margin-right:3px; padding:3px;'>`,
        textcode: "</div><div><div style='padding:3px;'>",
        buttonwrapper: `<div style='display:block; margin-top:5px'>`,
        buttonstyle: `style='display:inline-block; color:#ce0f69 !important; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle: `style='display:inline-block; color:#ce0f69; background-color: transparent;padding: 0px; border: none;'`,
        buttondivider: ' | ',
        handoutbuttonstyle: `style='display:inline-block; color:#ce0f69; background-color: transparent;padding: 0px; border: none;'`,
        whisperStyle: `'background-color:#2b2130; color:#fbfcf0; display:block; border-width: 1px; border-style: solid; border-color:#a3a681; padding:5px'`,
        whisperbuttonstyle: `style='display:inline-block; color:#bbb; background-color: transparent;padding: 0px; border: none'`,
        footer: ""
    },

    dark: {
        boxcode: `<div style='color: #fff; border: 1px solid #000; background-color: black; box-shadow: 0 0 3px #fff; display: block; text-align: left; font-size: 13px; padding: 5px; margin-bottom: 2px; font-family: sans-serif; white-space: pre-wrap;'>`,
        titlecode: `<div style='font-weight:bold; color:#000; background-color:#ccc; margin-right:3px; padding:3px;'>`,
        textcode: "</div><div><div style='padding:3px;'>",
        buttonwrapper: `<div style='display:block; margin-top:5px'>`,
        buttonstyle: `style='display:inline-block; color:#a980bd; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle: `style='display:inline-block; color:#a980bd; background-color: transparent;padding: 0px; border: none;'`,
        buttondivider: ' | ',
        handoutbuttonstyle: `style='display:inline-block; color:#a980bd; background-color: transparent;padding: 0px; border: none;'`,
        whisperStyle: `'background-color:#2b2130; color:#fbfcf0; display:block; border-width: 1px; border-style: solid; border-color:#a3a681; padding:5px'`,
        whisperbuttonstyle: `style='display:inline-block; color:#bbb; background-color: transparent;padding: 0px; border: none'`,
        footer: ""
    },
    
    
    roll20dark: {
        boxcode: `<div style='color: #fff; border: 1px solid #000; background-image: linear-gradient(210deg, #4c2951, #0e0d49); background-color: transparent; display: block; text-align: left; font-size: 14px; padding: 5px; margin-bottom: 2px; font-family: "proxima nova", sans-serif; white-space: pre-wrap;'>`,
        titlecode: `<div style='font-weight:bolder; color:#e7339d; background-color:transparent; margin-right:3px; padding:3px; font-size:24px; line-height:26px; font-family:"nunito black", nunito;>'>`,
        textcode: "</div><div><div style='padding:3px;'>",
        buttonwrapper: `<div style='display:block; margin-top:15px; text-align: center;'>`,
        buttonstyle: `style='display:inline-block; color:#a980bd; font-weight:bold; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle:  `style='display:inline-block; color:#fff; font-weight:bolder; background-color: #e7339d;border-radius: 4px; margin:4px; padding: 2px 6px 2px 6px; border: none; font-family:"proxima nova", sans-serif; ;'`,
        buttondivider: '',
        handoutbuttonstyle: `style='display:inline-block; color:#fff; font-weight:bolder; background-color: #e7339d;border-radius: 4px; margin:4px; padding: 2px 6px 2px 6px; border: none;font-family:"nunito black", nunito;'`,
        whisperStyle: `'background-color:#f9cce7; color:#111; display:block; padding:5px; margin-top:20px;'`,
        whisperbuttonstyle: `style='display:inline-block; color:#702c91; font-weight:bold; background-color: transparent;padding: 0px; border: none'`,
        footer: ""
    },

    roll20light: {
        boxcode: `<div style='color: #111; background-color: #eee; border: 1px solid #000; display: block; text-align: left; font-size: 14px; padding: 5px; margin-bottom: 2px; font-family: "proxima nova", sans-serif; white-space: pre-wrap;'>`,
        titlecode: `<div style='font-weight:bolder; color:#e7339d; background-color:transparent; margin-right:3px; padding:3px; font-size:24px; line-height:26px; font-family:"Nunito Black", nunito;>'>`,
        textcode: "</div><div><div style='padding:3px;'>",
        buttonwrapper: `<div style='display:block; margin-top:15px; text-align: center;'>`,
        buttonstyle: `style='display:inline-block; color:#702c91; font-weight:bold; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle:  `style='display:inline-block; color:#fff; font-weight:bolder; background-color: #e7339d;border-radius: 4px; margin:4px; padding: 2px 6px 2px 6px; border: none; font-family:"proxima nova", sans-serif; ;'`,
        buttondivider: '',
        handoutbuttonstyle: `style='display:inline-block; color:#fff; font-weight:bolder; background-color: #e7339d;border-radius: 4px; margin:4px; padding: 2px 6px 2px 6px; border: none; font-family:"Nunito Black", nunito;'`,
        whisperStyle: `'background-color:#f9cce7; color:#111; display:block; padding:5px; margin-top:20px;'`,
        whisperbuttonstyle: `style='display:inline-block; color:#702c91; font-weight:bold; background-color: transparent;padding: 0px; border: none'`,
        footer: ""
    },


    lcars: {
        boxcode: `<div style='color: #fff; border: 1px solid #000; border-radius:16px 0px 0px 16px; background-color: black; background-image: linear-gradient(to bottom right, black,#111,black,#222,black); box-shadow: 0 0 3px #fff; display: block; text-align: left; font-size: 13px; padding: 5px; color:#fce5bb; margin-bottom: 2px; font-family: Tahoma, sans-serif; white-space: pre-wrap;'>`,
        titlecode: `<div style= 'width:100%;background-color:#ffae21; border-radius: 10px 0px 0px 0px;'><span style='font-weight:bold; color:#ffae21; background-color:black; margin-left: 20px;padding:0px 6px 2px 6px; font-size: 16px; font-family: Anton,Impact,Tahoma, sans-serif; font-stretch: extra-condensed !important; text-transform: uppercase;'>`,
        textcode: "</span></div><div style='border-left: 10px solid #9b98ff; border-radius: 0px 0px 0px 10px;padding-left: 15px; margin-top:3px;'>",
        buttonwrapper: `<div style='display:block'>`,
        buttonstyle: `style='display:inline-block; color:#cc6060; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle: `style='display:inline-block; border:none; color:black; background-color: #cc6060; border-radius: 10px 0px 0px 10px; padding: 2px 4px 2px 4px;margin-top: 12px; font-size: 10px; font-family: Tahoma, sans-serif; font-stretch: condensed !important; text-transform: uppercase;'`,
        buttondivider: '',
        handoutbuttonstyle: `style='display:inline-block; border:none; color:black; background-color: #cc6060; border-radius: 0px 10px 10px 0px; padding: 2px 4px 2px 4px;margin-top: 12px; margin-left:4px; font-size: 10px; font-family: Tahoma, sans-serif; font-stretch: condensed !important; text-transform: uppercase;'`,
        whisperStyle: `'border-radius: 10px 0px 0px 10px; color:#ffae21; border-color: #ffae21; display:block; border-width: 0px 0px 5px 15px; border-style: solid; padding:5px'`,
        whisperbuttonstyle: `style='display:inline-block; color:#cc6060; background-color: transparent;padding: 0px; border: none'`,
        footer: ""
    },

    faraway: {
        boxcode: `<div style='color: #feda4a; border: 1px solid #000; background-color: black; box-shadow: 0 0 3px #fff; display: block; text-align: left; font-size: 13px; padding: 5px; margin-bottom: 2px; font-family: sans-serif; white-space: pre-wrap;'>`,
        titlecode: `<div style='font-weight:bold; text-transform: uppercase; color: #000; text-shadow: -1px 1px 2px #feda4a, 1px 1px 2px #feda4a,  1px -1px 0 #feda4a, -1px -1px 0 #feda4a; background-color:#transparent; margin-bottom:8px; padding:3px;font-size: 18px; text-align:center'>`,
        textcode: "</div><div><div style='padding:3px;margin-bottom:0px;'>",
        buttonwrapper: `<div style='display:block; margin-top:8px;'>`,
        buttonstyle: `style='display:inline-block; color:#13f2fc; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle: `style='display:inline-block; color:#13f2fc; font-weight:normal; background-color: transparent;padding: 0px; border: none;'`,
        buttondivider: `<span style=  'color:#13f2fc; margin:0px;'> • </span>`,
        handoutbuttonstyle: `style='display:inline-block; color:#13f2fc; font-weight:normal; background-color: transparent; padding: 0px; border: none;'`,
        whisperStyle: `'background-color:transparent; color:#feda4a; display:block; border-width: 8px; border-style: solid; border-radius:5px; border-color:#feda4a; padding:15px; margin-top:10px;'`,
        whisperbuttonstyle: `style='display:inline-block; color:#13f2fc; background-color: transparent;padding: 0px; border: none'`,
        footer: ""
    },

    strange: {
        boxcode: `<div style='color: #ff1515; border: 1px solid #000; background-color: #1e193c; box-shadow: 0 0 5px #ff1515; display: block; text-align: left; font-size: 14px; padding: 5px; margin-bottom: 2px; font-family: "Della Respira", Tahoma; white-space: pre-wrap;'>`,
        titlecode: `<div style='font-weight:bold; text-transform: uppercase; color: #1e193c; text-shadow: -1px 1px 2px #ff1515, 1px 1px 2px #ff1515,  1px -1px 0 #ff1515, -1px -1px 0 #ff1515; background-color:#transparent; font-family: "Goblin One"; border-style: solid none solid none; 1px #ff1515; border-color: #ff1515; border-width: 1px; margin-bottom:8px; padding:3px;font-size: 18px; text-align:center'>`,
        textcode: "</div><div><div style='padding:3px;margin-bottom:0px;color:#bbb; line-height: 19px;'>",
        buttonwrapper: `<div style='display:block; text-align:center; font-size 8px; margin-top:8px;'>`,
        buttonstyle: `style='display:inline-block; color:#ff1515; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle: `style='display:inline-block; color:#ff1515; font-family: "Goblin One"; font-weight:normal; font-size: 10px; background-color: transparent;padding: 0px; border: none;'`,
        buttondivider: `<span style=  'color:#ff1515; margin:0px;'> • </span>`,
        handoutbuttonstyle: `style='display:inline-block; color:#ff1515; font-family: "Goblin One"; font-weight:normal;  font-size: 10px; background-color: transparent; padding: 0px; border: none;'`,
        whisperStyle: `'background-color:##4f0606; color:#ff1515; display:block;  border: 1px solid #000; box-shadow: 0 0 5px #ff1515; padding:5px; margin-top:10px'`,
        whisperbuttonstyle: `style='display:inline-block; color:#bbb; background-color: transparent;padding: 0px; border: none'`,
        footer: ""
    },

    gothic: {
        boxcode: `<div style='color: #fff; background-image: url(https://i.imgur.com/cLCx0Ih.jpg); background-repeat: repeat; background-color: transparent; display: block; box-shadow: 0 0 3px #fff; text-align: left; font-size: 14px; padding: 12px 12px 12px 12px; margin-bottom: 2px; font-family: Palatino, serif; white-space: pre-wrap;'>`,
        titlecode: `<div style='font-weight:bold; color: #fff; background-color:#transparent; margin-bottom:0px; padding:3px;font-size: 18px; font-family: Luminari, palatino, Georgia, serif; text-align:center'>`,
        textcode: `</div><img style='margin-bottom:12px;' src='https://i.imgur.com/j8SCVod.png'><div style='padding:3px; margin-bottom:0px; font-family: palatino, serif; text-shadow: 0 0 1px #000; line-height: 19px;'>`,
        buttonwrapper: `<div style='display:block; margin-top:12px;text-align:center;'>`,
        buttonstyle: `style='display:inline-block; color:#ccc; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle: `style='display:inline-block; color:#ccc; font-size:12px; font-weight:normal; background-color: transparent;padding: 0px; border: none;'`,
        buttondivider: `<img style='margin:0px 4px 0px 4px; width:14px;' src='https://i.imgur.com/RGoRhcK.png'>`,
        handoutbuttonstyle: `style='display:inline-block; color:#ccc; font-size:12px; font-weight:normal; background-color: transparent; padding: 0px; border: none;'`,
        whisperStyle: `'background-color:#2b2130; color:#ddd; display:block; border-width: 1px; border-style: solid; border-color:#a3a681; padding:5px'`,
        whisperbuttonstyle: `style='display:inline-block; color:#aaa; background-color: transparent;padding: 0px; border: none'`,
        footer: ""
    },

    western: {
        boxcode: `<div style='color: #000; border: 1px solid #000; border-radius: 2px; box-shadow: 0px 0px 20px 0px #000 inset; background-image: url(https://i.imgur.com/GKuncRd.jpg); background-repeat: repeat; background-color: transparent; display: block; text-align: left; font-size: 16px; padding: 12px 10px 12px 10px; margin-bottom: 2px; font-family: "Times New Roman", serif; white-space: pre-wrap;'>`,
        titlecode: `<div style='font-weight:bold; color: #932; background-color:#transparent; margin-bottom:0px; padding:3px;font-size: 22px;   font-family: Rye, "Times New Roman", serif; text-align:center'>`,
        textcode: `</div><div style='text-align:center;'><img style='margin-bottom:12px;' src='https://i.imgur.com/fFFX0wW.png'></div><div style='padding:3px; margin-bottom:0px; font-family: "IM Fell DW Pica", "Times New Roman", serif; line-height: 19px;'>`,
        buttonwrapper: `<div style='display:block; margin-top:12px;text-align:center;'>`,
        buttonstyle: `style='display:inline-block; color:#000; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle: `style='display:inline-block; color:#7e2d40; background-color: transparent;padding: 0px; border: none'`,
        buttondivider: `<img style='margin:0px 4px 0px 4px; width:20px;' src='https://i.imgur.com/x41nAwF.png'>`,
        handoutbuttonstyle: `style='display:inline-block; color:#7e2d40; background-color: transparent;padding: 0px; border: none'`,
        whisperStyle: `'background-color:#382d1d; color:#ebcfa9; font-style: italic; display:block; border-width: 1px; border-style: solid; border-color:#a3a681; padding:5px; margin-top:5px'`,
        whisperbuttonstyle: `style='display:inline-block; color:#fabe69; background-color: transparent;padding: 0px; border: none'`,
        footer: ""
    },

    dragon: {
        boxcode: `<div style='color: #000; border: 1px solid #b5ac89; box-shadow: 2px 2px 4px #000, 0px 0px 20px 0px #d9bea0 inset; background-image: url(https://i.imgur.com/YoWsOow.jpg); background-size: auto; background-repeat: repeat-y;  background-color: #e6daae; display: block; text-align: left; font-size: 14px; line-height: 16px;padding: 12px 10px 8px 10px; margin-bottom: 2px; font-family: ""Times New Roman", serif; white-space: pre-wrap;'>`,
        titlecode: `<div style='font-weight:bold; color: #0e3365; text-transform: uppercase; background-color:#transparent; margin-bottom:2px;  border-bottom: 2px solid #0e3365; padding:3px 3ps 0px 3px;font-size: 20px; font-family: Luminari,"times new roman", times, baskerville, serif; text-align:right'>`,
        textcode: `</div><div style='padding:3px; margin-bottom:0px; font-family: Georgia, serif; line-height: 19px;'>`,
        buttonwrapper: `<div style='display:block; margin-top:14px ;text-align:center;font-family: Luminari,"times new roman"'>`,
        buttonstyle: `style='display:inline-block; color:#0e3365; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle: `style='display:inline-block; color: #0e3365; font-size:14px; background-color: transparent;padding: 0px; border: none'`,
        buttondivider: " &nbsp;&bull;&nbsp; ", //`<img style='margin:0px 4px 0px 4px; width:20px;' src='https://i.imgur.com/x41nAwF.png'>`,
        handoutbuttonstyle: `style='display:inline-block; color: #0e3365; font-size:14px; background-color: transparent;padding: 0px; border: none'`,
        whisperStyle: `'display:block; border-width: 5px 0px 5px 0px; border-style: solid; border-color:#58170D; padding:5px; margin-top:9px;'`,
        whisperbuttonstyle: `style='display:inline-block; color:#0e3365; background-color: transparent;padding: 0px; border: none'`,
        footer: ""
    },



    wizard: {
        boxcode: `<div style='color: #000; border: 1px solid #b5ac89; box-shadow: 2px 2px 4px #000, 0px 0px 20px 0px #d9bea0 inset; background-image: url(https://i.imgur.com/fYJp37l.jpg); background-repeat: repeat; background-color: #e6daae; display: block; text-align: left; font-size: 14px; padding: 12px 10px 8px 10px; margin-bottom: 2px; font-family: "Times New Roman", serif; white-space: pre-wrap;'>`,
        titlecode: `<div style='font-weight:bold; color: #58170D; font-variant: small-caps; background-color:#transparent; margin-bottom:0px;  border-bottom: 2px solid #c9ad6a; padding:3px;font-size: 22px; font-family: "times new roman", times, baskerville, garamond, serif; text-align:left'>`,
        textcode: `</div><div style='padding:3px; margin-bottom:0px; font-family: Georgia, serif; line-height: 19px;'>`,
        buttonwrapper: `<div style='display:block; border-top: solid 1px #000; background-color: #E0E5C1; margin-top:12px ;text-align:center;font-family:arial, sans-serif'>`,
        buttonstyle: `style='display:inline-block; color:#58170D; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle: `style='display:inline-block; color: #000; font-size:12px; background-color: transparent;padding: 0px; border: none'`,
        buttondivider: " &nbsp;&bull;&nbsp; ", //`<img style='margin:0px 4px 0px 4px; width:20px;' src='https://i.imgur.com/x41nAwF.png'>`,
        handoutbuttonstyle: `style='display:inline-block; color: #000; font-size:12px; background-color: transparent;padding: 0px; border: none'`,
        whisperStyle: `'background-color:#E0E5C1; color:#000; display:block; border-width: 1px; border-width: 1px 0px 1px 0px; border-style: solid; border-color:#58170D; padding:5px'`,
        whisperbuttonstyle: `style='display:inline-block; color:#58170D; background-color: transparent;padding: 0px; border: none'`,
        footer: ""
    },

path: {
    boxcode: `<div style='color: #000; border: 1px solid #b5ac89; background-color: #f0ede8; box-shadow:inset 0 0 20px #9b8f79; display: block; text-align: left; font-size: 16px; padding: 12px 10px 8px 10px; margin-bottom: 2px; font-family: "Times New Roman", serif; white-space: pre-wrap;'>`,
    titlecode: `<div style='font-weight:bold; color: #5e0000; font-variant: small-caps; background-color:#transparent; margin-bottom:0px;  border-bottom: 1px solid #000; padding:3px;font-size: 22px; text-transformation: all-caps; font-family: "gin", anton, impact, "Arial Bold Condensed", sans-serif; text-align:left'>`,
    textcode: `</div><div style='padding:3px; margin-bottom:0px; font-family: "times new roman", Georgia, serif; line-height: 19px;'>`,
    buttonwrapper: `<div style='display:block; background-color: transparent; margin-top:12px ;text-align:center;font-family:arial, sans-serif'>`,
    buttonstyle: `style='display:inline-block; color:#5e0000; font-weight:bold; background-color: transparent; padding: 0px; border: none'`,
    playerbuttonstyle: `style='display:inline-block; color: #eee; font-size:12px; background-color: #5e0000; padding: 0px 4px 0px 4px; border-style:solid; border-width: 2px 4px 2px 4px; border-color: #d9c484; text-transformation: all-caps; font-family: "gin", impact, "Arial Bold Condensed", sans-serif;'`,
    buttondivider: " &nbsp;&nbsp; ", //`<img style='margin:0px 4px 0px 4px; width:20px;' src='https://i.imgur.com/x41nAwF.png'>`,
    handoutbuttonstyle: `style='display:inline-block; color: #eee; font-size:12px; background-color: #5e0000; padding: 0px 4px 0px 4px; border-style:solid; border-width: 2px 4px 2px 4px; border-color: #d9c484; text-transformation: all-caps; font-family: "gin", impact, "Arial Bold Condensed", sans-serif;'`,
    whisperStyle: `'background-color:#dbd1bc; color:#000; display:block; border-width: 1px; margin-top:15px; padding:5px; font-size: 15px; font-family: "Good OT", arial, sans-serif;'`,
    whisperbuttonstyle: `style='display:inline-block; color:#58170D; background-color: transparent; font-weight:bold; padding: 0px; border: none'`,
    footer: ""
},

apoc: {
        boxcode: `<div style='color: 000; background-image: url(https://i.imgur.com/vql1NqV.jpg); background-size: 100%; background-repeat: repeat-y; background-color: transparent; display: block; box-shadow: 0 0 3px #fff; text-align: left; font-size: 17px; padding: 0px; margin-bottom: 2px; font-family: "Shadows Into Light", Monaco,"Courier New", monospace; white-space: pre-wrap;'>`,
        titlecode: `<div style='font-weight:bold; color: #000; background-color:transparent; margin:20px 24px 0px 24px; padding:12px 3px 8px 3px;font-size: 18px; font-family: "IM Fell DW Pica", verdana, tahoma, sans-serif; text-align:center'>`,
        textcode: `</div><div><div style='padding:0px 3px 0px 3px; margin:0px 24px 0px 24px; color: #000;font-family: "Shadows Into Light", Monaco,"Courier New", monospace; line-height: 26px;'>`,
        buttonwrapper: `<div style='display:block; margin-top:12px;text-align:center;'>`,
        buttonstyle: `style='display:inline-block; color:#555; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle: `style='display:inline-block; color:#000; font-size:14px; font-weight:normal; background-color: transparent;padding: 0px; border: none;'`,
        buttondivider: " / ",
        handoutbuttonstyle: `style='display:inline-block; color:#000; font-size:14px; font-weight:normal; background-color: transparent; padding: 0px; border: none;'`,
        whisperStyle: `'background-color:#403f3d; color:#ddd; display:block; padding:5px !important; margin:5px; font-family: "Shadows Into Light", Monaco,"Courier New", monospace !important; '`,
        whisperbuttonstyle: `style='display:inline-block; color:#bbb; background-color: transparent;padding: 0px; border: none'`,
        footer: `<img style = 'margin: 0px !important; padding:0px;width:100%' src = 'https://i.imgur.com/ssWzyQy.png'>`
    },
    
    roman: {
        boxcode: `<div style='color: 000; background-image: url(https://i.imgur.com/aSthlxE.png); background-size: 100%; background-repeat: repeat-y; background-color: transparent; display: block; box-shadow: 0 0 3px #fff; text-align: left; font-size: 17px; padding: 0px; margin-bottom: 2px; font-family: "Shadows Into Light", Monaco,"Courier New", monospace; white-space: pre-wrap;'><div style = 'display:block; text-align:center;'><img style='margin-bottom:-25px; margin-top:0px; text-align:center;' src='https://i.imgur.com/oS3hgTt.png'></div>`,
        titlecode: `<div style='font-weight:bold; color: #666; background-color:transparent; margin:20px 12px 0px 12px; padding:12px 3px 8px 3px;font-weight: 900; font-size: 24px; line-height:24px; text-transform: uppercase; text-shadow: -1px -1px rgba(0,0,0,0.5), 1px 1px rgba(255,255,255,0.5); font-family: "Crimson Text", times,"Times New Roman", serif; text-align:center'>`,
        textcode: `</div><div><div style='padding:0px 3px 0px 3px; margin:0px 12px 0px 12px; color: #333; font-weight: 900; font-size: 13px; text-transform: uppercase; text-shadow: -1px -1px rgba(0,0,0,0.25), 1px 1px rgba(255,255,255,0.5); font-family: "Crimson Text", times,"Times New Roman", serif; line-height: 20px;'>`,
        buttonwrapper: `<div style='display:block; margin: 12px -10px 0px -10px; text-align:center;'>`,
        buttonstyle: `style='display:inline-block; color:#7c6f39; font-weight: bold; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle: `style='display:inline-block; color:#000; font-size:12px; font-weight:normal; background-color: transparent;padding: 0px; border: none;'`,
        buttondivider: " | ",
        handoutbuttonstyle: `style='display:inline-block; color:#000; font-size:12px; font-weight:normal; background-color: transparent; padding: 0px; border: none;'`,
        whisperStyle: `'background-image: url(https://i.imgur.com/SkkPm0h.jpg); background-repeat: no-repeat; background-size: 100% 100%; background-color:#403f3d; color:#ddd; display:block; padding:8px !important; margin:5px 0px; text-shadow: none; line-height:16px;'`,
        whisperbuttonstyle: `style='display:inline-block; color:#bbaa55; font-weight: bolder !important; background-color: transparent;padding: 0px; border: none'`,
        footer: `<img style = 'margin: 0px !important; padding:0px;width:100%' src = 'https://i.imgur.com/0h3lMRE.png'>`
    },

    notebook: {
        boxcode: `<div style='color: 000; border-radius:10px; background-image: url(https://i.imgur.com/2tWlJSg.jpg); background-size: auto; background-repeat: repeat-y; background-color: transparent; display: block; box-shadow: 0 0 3px #fff; line-height 16px; text-align: left; font-size: 14px; padding: 8px 8px 8px 30px; margin-bottom: 2px; font-family: "Patrick Hand", Monaco,"Courier New", monospace; white-space: pre-wrap;'>`,
        titlecode: `<div style='font-weight:bold; font-style: italic; font-weight:bolder; color: #000; background-color:transparent; margin-bottom:0px; padding:3px;font-size: 20px; Monaco,"Courier New", monospace; text-align:center'>`,
        textcode: `</div><div><div style='padding:3px; margin:7px 0px 0px 10px; color: #000;font-family: "Patrick Hand", Monaco,"Courier New", monospace; line-height: 16px;'>`,
        buttonwrapper: `<div style='display:block; margin:12px 0px 0px -9px; text-align:center;'>`,
        buttonstyle: `style='display:inline-block; color: red; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle: `style='display:inline-block; color:red; font-size:10px; font-weight:normal; background-color: transparent;padding: 0px; border: none;'`,
        buttondivider: `<span style='color:red;'>/</span>`,
        handoutbuttonstyle: `style='display:inline-block; color:red; font-size:10px; font-weight:normal; background-color: transparent; padding: 0px; border: none;'`,
        whisperStyle: `'color:red; display:block; padding-top:7px; font-family: "Patrick Hand", Monaco,"Courier New", monospace; line-height: 16px;'`,
        whisperbuttonstyle: `style='display:inline-block; color:#333; background-color: transparent;padding: 0px; border: none'`,
        footer: ""
    },

    steam: {
        boxcode: `<div style='color: #000; background-image: linear-gradient(to bottom right,#e3b76f,#ebcc99,#b28f57); background-color: transparent; display: block; box-shadow: 0 0 3px #fff; text-align: left; font-size: 14px; padding: 1px 10px 2px 10px; margin-top:30px; margin-bottom: 2px; font-family: 'Gill Sans', sans-serif; white-space: pre-wrap;'><div style = 'display:block; text-align:center;'><img style='margin-bottom:0px; margin-top:-30px; text-align:center;' src='https://i.imgur.com/NucuvsF.png'></div>`,
        titlecode: `<div style='font-weight:bold; color: #000; text-align:center; background-color:#transparent; margin-bottom:0px; padding:3px;font-size: 18px; font-family: 'Gill Sans', sans-serif; text-align:center'>`,
        textcode: "</div><div><div style='padding:3px;margin-bottom:0px;text-shadow: 0 0 1px #000;line-height:19px;font-family: 'Gill Sans', sans-serif;'>",
        buttonwrapper: `<div style='display:block; margin-top:12px;text-align:center;'>`,
        buttonstyle: `style='display:inline-block; color:#056b20; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle: `style='display:inline-block; color:#056b20; font-size:12px; font-weight:normal; background-color: transparent;padding: 0px; border: none;'`,
        buttondivider: `<img style='margin:0px 4px 0px 4px; width:30px;' src='https://i.imgur.com/jiyBaoz.png'>`,
        handoutbuttonstyle: `style='display:inline-block; color:#056b20; font-size:12px; font-weight:normal; background-color: transparent; padding: 0px; border: none;'`,
        whisperStyle: `'background-color:#2b2130; color:#fbfcf0; display:block; border-width: 1px; border-style: solid; border-color:#a3a681; padding:5px'`,
        whisperbuttonstyle: `style='display:inline-block; color:#fff; background-color: transparent;padding: 0px; border: none'`,
        footer: ""
    },

    treasure: {
        boxcode: `<div style='color: #eee;  background-image: linear-gradient(to bottom right,#e3b76f,#ebcc99,#b28f57); background-color: transparent; display: block; box-shadow: 0 0 3px #fff; text-align: left; font-size: 14px; padding: 1px 10px 2px 10px; margin-top:30px; margin-bottom: 2px; font-family: Tahoma, sans-serif; white-space: pre-wrap;'><div style = 'display:block; text-align:center;'><img style='margin-bottom:0px; margin-top:-30px; text-align:center;' src='https://i.imgur.com/NPrhhwN.png'></div>`,
        titlecode: `<div style='font-weight:bold; color: #401e00; text-align:center; background-color:#transparent; margin-bottom:0px; padding:3px;font-size: 18px; font-family: "Goblin One", sans-serif; text-align:center'>`,
        textcode: "</div><div style='padding:3px;margin-bottom:0px;text-shadow: 0 0 1px #111;line-height:19px;color:#111;'>",
        buttonwrapper: `<div style='display:block; margin-top:12px;text-align:center;'>`,
        buttonstyle: `style='display:inline-block; color:#8a4100; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle: `style='display:inline-block; color:#634401; font-size:14px; font-weight:normal; background-color: transparent;padding: 0px; border: none;'`,
        buttondivider: `<img style='margin:0px 4px 0px 4px; width:30px;' src='https://i.imgur.com/Gl0bnca.png'>`,
        handoutbuttonstyle: `style='display:inline-block; color:#401e00; font-size:14px; font-weight:normal; background-color: transparent; padding: 0px; border: none;'`,
        whisperStyle: `'background-color:#401e00; color:#eee; font-family: Tahoma, serif;  display:block; border-width: 1px; border-style: solid; border-color:#a3a681; margin-top:10px;padding:5px'`,
        whisperbuttonstyle: `style='display:inline-block; color:#e3b76f; background-color: transparent;padding: 0px; border: none'`,
        footer: ""
    },

choices: {
        boxcode: `<div style='color: #b98968; background-color: rgba(0, 0, 0, 0.8); box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.8); display: block; text-align: left; font-size: 16px; padding: 12px 10px 8px 10px; margin-bottom: 2px; font-family: "minion", "minion pro", merriweather, baskerville, garamond, serif; white-space: pre-wrap;'>`,
        titlecode: `<div style='font-weight:bold; color: #eee; background-color:#transparent; margin-bottom:0px; padding:3px;line-height: 28px; font-size: 24px; font-family: "minion", "minion pro", merriweather, baskerville, garamond, serif; text-align:Center'>`,
        textcode: `</p></div><div style='padding:3px; color: #eee; margin-top:8px; margin-bottom:0px; font-family: "minion", "minion pro", merriweather, baskerville, garamond, serif;  line-height: 24px;'>`,
        buttonwrapper: `<div style='display:block; color: #eada8d; background-image: linear-gradient(to bottom,#261d22,#472a53); background-color: transparent; margin:12px -12px -12px -12px; padding: 10px; text-align:center;font-family: "minion", "minion pro", merriweather, baskerville, garamond, serif;'>`,
        buttonstyle: `style='display:inline-block; color:#eee; hover: yellow; background-color: transparent;padding: 0px; border: none; '`,
        playerbuttonstyle: `style='display:inline-block; color: #eee; font-size:16px; font-family: "Minion", "Minion Pro", serif; background-color: transparent;padding: 0px; border: none'`,
        buttondivider: " &nbsp;&FilledSmallSquare;&nbsp; ", //`<img style='margin:0px 4px 0px 4px; width:20px;' src='https://i.imgur.com/x41nAwF.png'>`,
        handoutbuttonstyle: `style='display:inline-block; color: #eee; font-size:16px; font-family: "Minion", "Minion Pro", serif; background-color: transparent;padding: 0px; border: none'`,
        whisperStyle: `'background-image: linear-gradient(to bottom,#4b443d,#3f3732,#4b443d); background-color: transparent; color:#f8e8a6; display:block; border-width: 1px; border: 1px solid #4f4841; margin: 20px, -12px, 15px, -12px; padding:10px, 10px'`,
        whisperbuttonstyle: `style='display:inline-block; color:#eee; background-color: transparent;padding: 0px; border: none'`,
        footer: ""
},
gate3: {
        boxcode: `<div style='color: #b98968; background-image: linear-gradient(to bottom,#261f1a,#221e20,#392c33); background-color: transparent; border: 3px solid #815228; border-radius: 20px; box-shadow: 2px 2px 4px #000; display: block; text-align: left; font-size: 16px; padding: 12px 10px 8px 10px; margin-bottom: 2px; font-family: "Minion", "Minion Pro", serif; white-space: pre-wrap;'>`,
        titlecode: `<div style='font-weight:bold; color: #eee; background-color:#transparent; margin-bottom:0px; padding:3px;line-height: 28px; font-size: 26px; font-family: "minion", "minion pro", times, baskerville, garamond, serif; text-align:left'>`,
        textcode: `</div><div style='padding:3px; margin-top:8px; margin-bottom:0px; font-family: Georgia, serif; line-height: 19px;'>`,
        buttonwrapper: `<div style='display:block; color: #bc8e1d; background-image: linear-gradient(to bottom,#261d22,#472a53); background-color: transparent; margin:12px -12px -12px -12px; padding: 10px; border-radius: 0px 0px 18px 18px; text-align:center;font-family: "Minion", "Minion Pro", serif;'>`,
        buttonstyle: `style='display:inline-block; color:#eada8d; background-color: transparent;padding: 0px; border: none; '`,
        playerbuttonstyle: `style='display:inline-block; color: #eee; font-size:16px; font-family: "Minion", "Minion Pro", serif; background-color: transparent;padding: 0px; border: none'`,
        buttondivider: " &nbsp;&FilledSmallSquare;&nbsp; ", //`<img style='margin:0px 4px 0px 4px; width:20px;' src='https://i.imgur.com/x41nAwF.png'>`,
        handoutbuttonstyle: `style='display:inline-block; color: #eee; font-size:16px; font-family: "Minion", "Minion Pro", serif; background-color: transparent;padding: 0px; border: none'`,
        whisperStyle: `'background-image: linear-gradient(to bottom,#4b443d,#3f3732,#4b443d); background-color: transparent; color:#f8e8a6; display:block; border-width: 1px; border: 1px solid #4f4841; margin: 20px, -12px, 15px, -12px; padding:10px, 10px'`,
        whisperbuttonstyle: `style='display:inline-block; color:#eee; background-color: transparent;padding: 0px; border: none'`,
        footer: ""
},


    crt: {
        boxcode: `<div style='color: #0eb350; font-weight: bold; border: 1px solid #0eb350; border-radius: 12px; background-image: url("https://i.imgur.com/DTYvEus.png"); background-image: repeat; background-color: #0a2b07; box-shadow: 0 0 3px #000; display: block; text-align: left; font-size: 18px; padding: 5px; margin-bottom: 2px; font-family: Monaco, monospace; white-space: pre-wrap;'>`,
        titlecode: `<div style='color: #000; text-shadow: 0.5px 0.5px 0.5px #0a7a37; background-color: #0eb350; box-shadow: 0 0 3px #0eb350; display: block; text-align: left; font-size: 16px; padding: 5px; margin: 5px 3px 3px 3px; font-family: 'Courier New', monospace; white-space: pre-wrap;'>`,
        textcode: "</div><div style='font-size: 14px !important; font-family: Monaco, monospace; padding:3px;'>",
        buttonwrapper: `<div style='display:block'>`,
        buttonstyle: `style='display:inline-block; color:#fff; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle: `style='display:inline-block;font-weight:bold; color:white; background-color: transparent;padding: 0px; border: none;font-size: 12px'`,
        buttondivider: '|',
        handoutbuttonstyle: `style='display:inline-block;font-weight:bold; color:white; background-color: transparent;padding: 0px; border: none;font-size: 12px'`,
        whisperStyle: `'background-color:#2b2130; color:#fbfcf0; display:block; border-width: 1px; border-style: solid; border-color:#a3a681; padding:5px'`,
        whisperbuttonstyle: `style='display:inline-block; color:#fff; background-color: transparent;padding: 0px; border: none'`,
        footer: ""
    },

    news: {
        boxcode: `<div style='color: #444; background-image: url("https://i.imgur.com/Jws5NQS.png"); background-image: repeat; box-shadow: 5px 5px 3px #000; display: block; text-align: justify; font-size: 18px; padding: 5px; margin-bottom: 2px; font-family: Monaco, monospace; white-space: pre-wrap;'>`,
        titlecode: `<div style='color: #444; text-align:center; display: block; border: 0px 0px 1px 0px solid #444; font-size: 24px; padding: 5px; margin: 5px 3px 3px 3px; line-height:26px; font-family: Anton; text-transform: uppercase; white-space: pre-wrap;'>`,
        textcode: `</div><div style='font-size: 16px !important; margin:5px 0px 5px 0px;  line-height:19px; font-family: "Times New Roman", serif; padding:3px;'>`,
        buttonwrapper: `<div style='display:block'>`,
        buttonstyle: `style='display:inline-block; color:#222; text-decoration:underline; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle: `style='display:inline-block;float:right; margin-top:5px; font-weight:bold; color:#444; background-color: transparent;padding: 0px; border: none;font-size: 12px'`,
        buttondivider: ' ',
        handoutbuttonstyle: `style='display:inline-block;float:left; margin-top:5px; font-weight:bold; color:#444; background-color: transparent;padding: 0px; border: none;font-size: 12px'`,
        whisperStyle: `'background-color: rgba(0, 0, 0, 0.1); color:#444; font-size: 14px;font-family: arial, helvetica, sans-serif; padding:8px; display:block; border: 1px solid #444;'`,
        whisperbuttonstyle: `style='display:inline-block; color:#444; text-decoration:underline; background-color: transparent; padding: 0px; border: none'`,
        footer: ""
    },

    scroll: {
        boxcode: `<div style='color: #000; background-image: url(https://i.imgur.com/8Mm94QY.png); background-size: 100% 100%; background-color: transparent; display: block; text-align: left; font-size: 14px; padding: 5px 8px 8px 5px; margin-bottom: 2px; font-family: 'Times New Roman', serif; white-space: pre-wrap;'>`,
        titlecode: `<div style='color: #58170D; background-color: transparent: display: block; text-align: Center; line-height:24px; font-size: 24px; padding: 5px; margin: 5px 3px 0px 3px; font-family: Luminari,"Times New Roman", serif; white-space: pre-wrap;'>`,
        textcode: `</div><div><div style='text-align:center; font-size: 14px !important; font-family: "Times New Roman", serif; padding:3px;'>`,
        buttonwrapper: `<div style='display:block'>`,
        buttonstyle: `style='display:inline-block; color:#7e2d40; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle: `style='display:inline-block; color:#7e2d40; background-color: transparent;padding: 0px; border: none'`,
        buttondivider: ' | ',
        handoutbuttonstyle: `style='display:inline-block; color:#7e2d40; background-color: transparent;padding: 0px; border: none'`,
        whisperStyle: `'background-color:#58170d; color:#d9bf93; display:block; padding:5px'`,
        whisperbuttonstyle: `style='display:inline-block; color:#fce5bb; background-color: transparent;padding: 0px; border: none'`,
        footer: ""
    },
    
    scroll2: {
        boxcode: `<div style='color: #000; background-image: url(https://i.imgur.com/R8W7TAC.png); background-size: 100%; background-repeat: repeat-y; background-color: transparent; display: block; text-align: left; font-size: 14px; margin-top:30px; margin-bottom: 2px; padding:0px 5px 0px 5px;font-family: 'Gill Sans', sans-serif; white-space: pre-wrap;'><div style = 'display:block; text-align:center;'><img style='margin-bottom:0px; margin-top:-30px; text-align:center;  background-size: 100%; ' src='https://i.imgur.com/jnbV00f.png'></div>`,
        titlecode: `<div style='color: #58360d; background-color: transparent: display: block; text-align: Center; line-height:24px; font-size: 24px; padding: 5px 15px 5px 10px; margin: 0px 3px 0px 3px; font-family: "Kaushan Script", Luminari,"Times New Roman", serif; white-space: pre-wrap;'>`,
        textcode: `</div><div><div style='text-align:center; font-size: 14px !important; line-height: 18px; font-family: "Della Respira", "Patrick Hand", Times New Roman", serif; padding:3px 20px 3px 20px;'>`,
        buttonwrapper: `<div style='display:block font-size: 14px !important; '>`,
        buttonstyle: `style='display:inline-block; color:#58170D; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle: `style='display:inline-block; font-size: 14px !important; color:#58170D; background-color: transparent;padding: 0px; border: none'`,
        buttondivider: ' | ',
        handoutbuttonstyle: `style='display:inline-block; font-size: 14px !important; color:#58170D; background-color: transparent;padding: 0px; border: none'`,
        whisperStyle: `'background-color:#241605; color:#eee; box-shadow: 0px 0px 5px 5px #241605; display:block; border-radius:15px; padding:5px; margin: 15px 5px 10px 5px'`,
        whisperbuttonstyle: `style='display:inline-block; color:#fcdd6d; background-color: transparent;padding: 0px; border: none'`,
        footer: `<img style = 'margin: 0px !important; padding:0px; position:relative; top:9px; width:100%' src = 'https://i.imgur.com/TxTk1EB.png'>`
    },
    
    vault: {
        boxcode: `<div style='color: #111; background-image: url(https://i.imgur.com/Y0UtYyf.png); background-size: 100%; background-repeat: repeat-y; background-color: transparent; display: block;  text-shadow: 3px 3px 15px #74a4dc, -3px -3px 15px #74a4dc, 3px -3px 15px #74a4dc, -3px 3px 15px #74a4dc; text-align: left; font-size: 14px;  margin-bottom: 2px; padding:10px 5px 5px 5px;font-family: 'Contrail One', sans-serif; white-space: pre-wrap;'>`,
        titlecode: `<div style='color: #111; background-color: #transparent; background-image: url(https://i.imgur.com/fv9RnvZ.png);  border-radius:3px; display: block; text-align: Center; text-shadow: none; line-height:24px; font-size: 24px; padding: 5px 15px 5px 10px; margin: -5px 0px 15px 0px; font-style:bold; font-family: "Contrail One", serif; white-space: pre-wrap;'>`,
        textcode: `</div><div><div style='text-align:left; font-size: 14px !important; line-height: 20px; font-family: "Contrail One","Della Respira", "Patrick Hand", Times New Roman", serif; padding:3px 20px 3px 20px;'>`,
        buttonwrapper: `<div style='display:block; font-size: 15px !important; text-align:center; margin:0px -15px 0px -15px;'>`,
        buttonstyle: `style='display:inline-block; color:#111; text-decoration: underline; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle:  `style='display:inline-block; font-size: 15px !important; color:#fef265; text-shadow: 2px 2px 2px #111; background-color: transparent;padding: 0px; border: none'`,
        buttondivider: `&nbsp; <img style='margin:0px 4px 0px 4px; width:30px;' src='https://i.imgur.com/96UIW36.png'> &nbsp;`,
        handoutbuttonstyle: `style='display:inline-block; font-size: 15px !important; color:#fef265; text-shadow: 2px 2px 2px #111;background-color: transparent;padding: 0px; border: none'`,
        whisperStyle: `'background-color: #transparent; background-image: url(https://i.imgur.com/fv9RnvZ.png); color:#111; display:block;  text-shadow: none; text-align:center; font-family: "Contrail One"; border-radius:3px; padding:5px; margin: 15px -20px 10px -20px'`,
        whisperbuttonstyle: `style='display:inline-block; color:#284a73; background-color: transparent;padding: 0px; border: none'`,
        footer: ``
    },
    
    osrblue: {
        boxcode: `<div style='color: #333; background-image: url(https://i.imgur.com/94Fyegx.png); box-shadow:inset 0 0 70px #f4f2db, 2px 2px 5px #111; background-size: 25%; background-repeat: repeat; background-color: transparent; display: block; font-weight: bolder; text-align: left; font-size: 14px;  margin-bottom: 2px; padding:10px 5px 5px 5px; font-family: "Courier One", courier , sans-serif; white-space: pre-wrap;'>`,
        titlecode: `<div style='color: #729aa5; background-color: transparent;  border-radius:3px; display: block; text-align: Center; line-height:24px; font-size: 24px; padding: 5px 15px 5px 10px; margin: -5px 0px 3px 0px; font-style:bold; font-family: Anton, serif; white-space: pre-wrap;'>`,
        textcode: `</div><div style='display:inline-block; text-align:left; font-size: 14px !important; line-height: 20px; font-weight: bolder; font-family: "Courier One", courier, "Della Respira", "Patrick Hand", Times New Roman", serif; padding:3px 20px 3px 20px;'>`,
        buttonwrapper: `<div style='display:block !important; font-size: 14px !important; text-align:center; margin:0px -20px 0px -20px;'>`,
        buttonstyle: `style='display:inline-block !important; color:#333; text-decoration: underline; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle:  `style='display:inline-block; font-size: 14px !important; color:#333; text-decoration: underline; background-color: transparent;padding: 0px; border: none'`,
        buttondivider: `|`,
        handoutbuttonstyle: `style='display:inline-block; font-size: 14px !important; color:#333; text-decoration: underline; background-color: transparent;padding: 0px; border: none'`,
        whisperStyle: `'background-color: #729aa5; color:#eee; display:block; text-align:center; font-family: "Arial"; padding:5px; margin: 15px -20px 10px -20px'`,
        whisperbuttonstyle: `style='display:inline-block; color:#eee; text-decoration: underline;  background-color: transparent;padding: 0px; border: none'`,
        footer: ``
    }

};

on('ready', function() {
    if (!_.has(state, 'Supernotes')) {
        state.Supernotes = {
            sheet: 'Default',
            template: 'default',
            title: 'name',
            theText: '',
            sendToPlayers: true,
            makeHandout: true,
            darkMode: false
        };
        message = 'Welcome to Supernotes! If this is your first time running it, the script is set to use the Default Roll Template. You can choose a different sheet template below, as well as decide whether you want the script to display a "Send to Players" footer at the end of every GM message. It is currently set to true.<BR><BR>[Default Template - any sheet](!gmnote --config|default)<BR>[D&D 5th Edition by Roll20](!gmnote --config|dnd5e)<BR>[DnD 5e Shaped](!gmnote --config|5eshaped)<BR>[Pathfinder by Roll20](!gmnote --config|pfofficial)<BR>[Pathfinder Community](!gmnote --config|pfcommunity)<BR>[Pathfinder 2e by Roll20](!gmnote --config|pf2e)<BR>[Starfinder by Roll20](!gmnote --config|starfinder)<BR>[Call of Cthulhu 7th Edition by Roll20](!gmnote --config|callofcthulhu)<BR><BR>[Toggle Send to Players](!gmnote --config|sendtoPlayers)';
        sendChat('Supernotes', '/w gm &{template:' + state.Supernotes.template + '}{{' + state.Supernotes.title + '=' + 'Config' + '}} {{' + state.Supernotes.theText + '=' + message + '}}');
    }
});

on('ready', () => {

    function parseMarkdown(markdownText) {
        const htmlText = markdownText
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
            .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
            .replace(/\*(.*)\*/gim, '<i>$1</i>')
            .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
            .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>")
            .replace(/\n$/gim, '<br />')

        return htmlText.trim()
    }

function cleanText(text,buttonStyle){
                            text = ((undefined !== text) ? text.replace(/\[([^\]]*?)\]\(([^\)]*?)\)(?<!\.jpg\)|\.png\)|\.gif\)|\.webm\)|\.jpeg\))/gim, "<a " + buttonStyle + "href='$2'>$1</a>").replace(/<p>/gm, "").replace(/<\/p>/gm, "<BR>").replace("padding:5px'></div><div>", "padding:5px'>") : "");
                        text = text.replace('<a href=\"http://journal.roll20.net', '<a ' + buttonStyle + ' href=\"http://journal.roll20.net').replace('<a href=\"https://app.roll20.net', '<a ' + buttonStyle + ' href=\"https://app.roll20.net');
                        text = text.replace('<a href=\"http', '<a ' + buttonStyle + ' href=\"http');
return text;
}


    const decodeUnicode = (str) => str.replace(/%u[0-9a-fA-F]{2,4}/g, (m) => String.fromCharCode(parseInt(m.slice(2), 16)));

    const version = '0.2.4';
    log('Supernotes v' + version + ' is ready! --offset ' + API_Meta.Supernotes.offset + 'To set the template of choice or to toggle the send to players option, Use the command !gmnote --config');

    on('chat:message', function(msg) {
        if ('api' === msg.type && msg.content.match(/^!(gm|pc|self)note\b/)) {
            let match = msg.content.match(/^!gmnote-(.*)$/);
let selectedObject = msg.selected;

//################## EXPERIMENTAL TO GET TOKEN ID FROM SUPPLIED VALUE
if(msg.content.includes("--token|")){
    virtualTokenID = msg.content.split(/--token\|/)[1].split(/\s/)[0];
sendChat ("notes","success. Virtual token id is " + virtualTokenID);
    if (virtualTokenID.length !== 20 && virtualTokenID.charAt(0) !== "-"){
        sendChat ("notes","this is not a token id :" + virtualTokenID);
        sendChat ("notes","player page id :" + Campaign().get("playerpageid"));
        
         selectedObject = findObjs({
            _type: "graphic",
            _id: virtualTokenID,
        });
        log ("selectedObject is " + selectedObject);
       // selectedObject = theToken[0];
    }
    if (selectedObject){
    sendChat ("notes", "number of 'selected' objects is " +selectedObject.length);
    } else{
    sendChat ("notes", "no passed value");
    }
//sendChat ("notes","virtual ID is " + selectedObject[0].get("_id"));
}
//################## EXPERIMENTAL TO GET TOKEN ID FROM SUPPLIED VALUE







            //define command                     
            let command = msg.content.split(/\s+--/)[0];
            let sender = msg.who;
            let senderID = msg.playerid;

            let isGM = playerIsGM(senderID);
            let messagePrefix = '/w gm ';
            if (command === '!pcnote') {
                messagePrefix = '';
            }

            if (command === '!selfnote') {
                messagePrefix = '/w ' + sender + ' ';
            }

            let secondOption = '';
            let args = msg.content.split(/\s+--/);

            let customTemplate = '';
            let option = '';
            let notitle = false;
            let id = '';
            let tokenImage = '';
            let tooltip = '';
            let tokenName = '';
            let trueToken = [];
            let tokenID = '';
            let handoutTitle = '';
            let whisper = '';

            let templates = Supernotes_Templates;




            function sendMessage(whom, messagePrefix, template, title, theText, message, tokenID, playerButton, handoutButton) {
                handoutButton = ((handoutButton) ? handoutButton.replace(/NamePlaceholder/, whom) : handoutButton);

                if (message === "" && option.match(/^(bio|charnote|token|tooltip)/)) {
                    message = `The information does not exist for the <code>${option}</code> option`
                }

                if (handoutTitle === '') {
                    //Crops out GM info on player messages
                    if (isGM) {
                        //message = (message.includes("-----") ? message.split('-----')[0] + "<div style= " + whisperStyle + ">" + message.split('-----')[1] + "</div>" : message);
                        whisper = (message.includes("-----") ? message.split('-----')[1] : "");
                        message = (message.includes("-----") ? message.split('-----')[0] : message);

                    }

                    if (customTemplate.length > 0) {
                        let chosenTemplate = templates.generic;
                        switch (customTemplate) {
                            case "crt":
                                chosenTemplate = templates.crt;
                                break;
                            case "dark":
                                chosenTemplate = templates.dark;
                                break;
                            case "roll20light":
                                chosenTemplate = templates.roll20light;
                                break;
                            case "roll20dark":
                                chosenTemplate = templates.roll20dark;
                                break;
                            case "scroll":
                                chosenTemplate = templates.scroll;
                                break;
                            case "scroll2":
                                chosenTemplate = templates.scroll2;
                                break;
                            case "vault":
                                chosenTemplate = templates.vault;
                                break;
                            case "osrblue":
                                chosenTemplate = templates.osrblue;
                                break;
                            case "lcars":
                                chosenTemplate = templates.lcars;
                                break;
                            case "faraway":
                                chosenTemplate = templates.faraway;
                                break;
                            case "strange":
                                chosenTemplate = templates.strange;
                                break;
                            case "gothic":
                                chosenTemplate = templates.gothic;
                                break;
                            case "western":
                                chosenTemplate = templates.western;
                                break;
                            case "dragon":
                                chosenTemplate = templates.dragon;
                                break;
                            case "wizard":
                                chosenTemplate = templates.wizard;
                                break;
                            case "path":
                                chosenTemplate = templates.path;
                                break;
                            case "treasure":
                                chosenTemplate = templates.treasure;
                                break;
                            case "steam":
                                chosenTemplate = templates.steam;
                                break;
                            case "gate3":
                                chosenTemplate = templates.gate3;
                                break;
                            case "choices":
                                chosenTemplate = templates.choices;
                                break;
                            case "apoc":
                                chosenTemplate = templates.apoc;
                                break;
                            case "news":
                                chosenTemplate = templates.news;
                                break;
                            case "roman":
                                chosenTemplate = templates.roman;
                                break;
                            case "notebook":
                                chosenTemplate = templates.notebook;
                                break;
                            case "bob":
                                break;
                            default:
                                chosenTemplate = templates.generic;
                                // code block
                        }




                        playerButton = playerButton.split('\n')[1];

                        playerButton = ((undefined !== playerButton) ? playerButton.replace(/\[(.*?)\]\((.*?)\)/gim, "<a " + chosenTemplate.playerbuttonstyle + "href='$2'>$1</a>") : "");
                        handoutButton = ((undefined !== handoutButton) ? handoutButton.replace(/\[(.*?)\]\((.*?)\)/gim, "<a " + chosenTemplate.handoutbuttonstyle + "href='$2'>$1</a>").replace(" | <a", "<a") : "");

                        //need to replace markdown hyperlinks without replacing markdown image codes.
whisper = ((whisper.length>0) ? "<div style =" + chosenTemplate.whisperStyle + ">" + whisper + "</div>" : "");


message = cleanText(message,chosenTemplate.buttonstyle);
//the following lines attempt to account for numerous Roll20 CSS and HTML oddities.
whisper = cleanText(whisper,chosenTemplate.whisperbuttonstyle);
whisper= whisper.replace(/<\/span><BR>/i,"")
.replace(/<BR><span style=.*?>/i,'<span>')
.replace(/<BR><p style=.*?>/i,'<p>')
.replace(/(<p>|<\/p>)/,'')
.replace(/><BR>/i,'>');






//                        message = ((undefined !== message) ? message.replace(/\[([^\]]*?)\]\(([^\)]*?)\)(?<!\.jpg\)|\.png\)|\.gif\)|\.webm\)|\.jpeg\))/gim, "<a " + chosenTemplate.buttonstyle + "href='$2'>$1</a>").replace(/<p>/gm, "").replace(/<\/p>/gm, "<BR>").replace("padding:5px'></div><div>", "padding:5px'>") : "");
//                        message = message.replace('<a href=\"http://journal.roll20.net', '<a ' + chosenTemplate.buttonstyle + ' href=\"http://journal.roll20.net').replace('<a href=\"https://app.roll20.net', '<a ' + chosenTemplate.buttonstyle + ' href=\"https://app.roll20.net');
//                        message = message.replace('<a href=\"http', '<a ' + chosenTemplate.buttonstyle + ' href=\"http');
                        //message = message.replace(whisperStyle,chosenTemplate.whisperStyle);
                        //message = message.replace("<br>\n<div style", "<br><br><div style");


                        //log("message = " + message);
                        //log ("whisperfinal = " +whisper);


                        if (command === '!pcnote') {
                            return sendChat(whom, messagePrefix + chosenTemplate.boxcode + chosenTemplate.titlecode + whom + chosenTemplate.textcode + message + '</div></div>' + chosenTemplate.footer + '</div>');

                        } else {

                            return sendChat(whom, messagePrefix + chosenTemplate.boxcode + chosenTemplate.titlecode + whom + chosenTemplate.textcode + message + whisper + chosenTemplate.buttonwrapper + playerButton + chosenTemplate.buttondivider + handoutButton + '</div></div></div>' + chosenTemplate.footer + '</div>');
                        }



                    } else {
                        playerButton = ((undefined !== playerButton) ? playerButton.replace(/\[([^\]]*?)\]\(([^\)]*?)\)(?<!\.jpg\)|\.png\)|\.gif\)|\.webm\)|\.jpeg\))/gim, "<a " + buttonstyle + "href='$2'>$1</a>") : "");
                        handoutButton = ((undefined !== handoutButton) ? handoutButton.replace(/\[([^\]]*?)\]\(([^\)]*?)\)(?<!\.jpg\)|\.png\)|\.gif\)|\.webm\)|\.jpeg\))/gim, "<a " + buttonstyle + "href='$2'>$1</a>") : "");
whisper = ((whisper.length>0) ? "<div style =" + whisperStyle + ">" + whisper + "</div>" : "");
//log ("whisper = " + whisper);

                        return sendChat(whom, messagePrefix + '&{template:' + template + '}{{' + title + '=' + whom + '}} {{' + theText + '=' + message + whisper + playerButton + handoutButton + '}}');
                    }

                } else {
                    let noteHandout = findObjs({
                        type: 'handout',
                        name: handoutTitle
                    });
                    noteHandout = noteHandout ? noteHandout[0] : undefined;

                    if (!noteHandout) {
                        noteHandout = createObj('handout', {
                            name: handoutTitle,
                            archived: false,
                            inplayerjournals: "all",
                            controlledby: "all"
                        });
                        let noteHandoutid = noteHandout.get("_id");
                        sendChat('Supernotes', `/w gm Supernotes has created a handout named <b>${handoutTitle}</b>. <BR>Click <a href="http://journal.roll20.net/handout/${noteHandoutid}">here</a> to open.`, null, {
                            noarchive: true
                        });
                    }
                    if (noteHandout) {

                        playerButton = '<BR><a href = "&#96;' + msg.content.replace(/!(gm|self)/, "!pc").replace(/\s(--|)handout\|.*\|/, "") + '">Send to Players in Chat</a>';
                        if (makeHandout) {
                            handoutButton = ((playerButton) ? ' | ' : '<BR>') + '<a href = "&#96;' + '!gmnote --id' + tokenID + ' --handout|' + whom + '|">Make Handout</a>';
                        }
                        message = message.replace(/\[.*?\]\((.*?\.(jpg|jpeg|png|gif))\)/g, `<img style=" max-width:100%; max-height: 200px; float:right; padding-top:0px; margin-bottom:5px; margin-left:5px" src="$1">`);
                        message = message.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
                        message = message.replace(/<img(.*)<(\/|)br(\/|)>/g, `<img$1`);

                        ((isGM) ? message = message : message = ((message.includes("-----") ? message.split('-----')[0] : message)));

                        message = parseMarkdown(message);
                        if (isGM) {
                            gmnote = (message.includes("-----") ? message.split('-----')[1] : '');
                            message = (message.includes("-----") ? message.split('-----')[0] : message);
                        }

                        noteHandout.get("notes", function(notes) {

//##############TEST FOR VARIABLE IMAGE HEIGHT BASED ON HEIGHT OF REPORT###################################################
// change 200 to 201 in line 447 to activate
                            if(notes.match(/float:right; color:#aaa;'>\(\d*\)/)) {
                                let reportCount= notes.match(/(?<=<span style = 'float:right; color:#aaa;'>\()\d+/);;
//log ("reportCount = " + reportCount);

let newHeight = reportCount * 20;
if (newHeight > 500){newHeight = 500};
if (newHeight < 200){newHeight = 200};
//log ("newHeight = " + newHeight);
message = message.replace(/201px/,newHeight+'px');

                            }
//##############TEST FOR VARIABLE IMAGE HEIGHT BASED ON HEIGHT OF REPORT###################################################

                            
                            if (notes.includes('<!---End Report--->')) {
                                if (notes.includes('!report')) {
                                    notes = notes.split('<!---End Report--->')[0] + '<!---End Report--->';
                                } else {
                                    notes = notes.split(/<hr>/i)[0] + '<!---End Report--->';
                                }
                            } else {
                                playerButton = '';
                                handoutButton = '';
                                notes = ''; //<!---End Report--->';
                            }
                            /*if (notes.includes('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')) {
                                notes = notes.split('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')[0] + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
                            } else {
                                notes = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
                            }*/
                            //message = '<div style="display:block;">' + message +'</div>';

                            noteHandout.set("gmnotes", gmnote);
                            noteHandout.set("notes", notes + "<h3>" + whom + "</h3>" + message + playerButton + handoutButton)
                            //THIS NEEDS A TOGGLE
                            //if(!tokenImage.includes("marketplace")){noteHandout.set("avatar", tokenImage+"?12345678")}
                        })
                    } else {
                        sendChat('Supernotes', whom + `No handout named ${handoutTitle} was found.`, null, {
                            noarchive: true
                        }, )
                    }

                }

            }

            let theToken = selectedObject;

            args.forEach(a => {
                if (a === 'notitle') {
                    notitle = true
                }
                if (a.includes('id-')) {
                    id = a.split(/id/)[1]
                }
                if (a.match(/handout\|.*?\|/)) {
                    handoutTitle = a.match(/handout\|.*?\|/).toString().split('|')[1]
                }
                if (a !== command && !(a.includes('id-')) && !(a.includes('handout|')) && a !== 'notitle') {
                    option = a
                }
                if (a.includes('template|')) {
                    customTemplate = a.split(/\|/)[1]
                }

            });

            ((id) ? theToken = [{
                "_id": id,
                "type": "graphic"
            }] : theToken = selectedObject);


            if (undefined !== theToken) {
                trueToken = getObj('graphic', theToken[0]._id);
                tokenImage = trueToken.get('imgsrc');
                tokenTooltip = trueToken.get('tooltip');
                tokenName = trueToken.get('name');
                tokenID = trueToken.get('_id');
            }



            const template = state.Supernotes.template;
            const title = state.Supernotes.title;
            const theText = state.Supernotes.theText;
            const sendToPlayers = state.Supernotes.sendToPlayers;
            const makeHandout = state.Supernotes.makeHandout || false;
            const darkMode = state.Supernotes.darkMode || false;
            const whisperStyle = ((darkMode) ? `'background-color:#2b2130; color:#fbfcf0; display:block; border-width: 1px; border-style: solid; border-color:#a3a681; padding:5px'` : `'background-color:#fff; color:#000; display:block; border-width: 1px; border-style: solid; border-color:#a3a681; padding:5px'`);

            const whisperColor = ((darkMode) ? "#2b2130" : "#fbfcf0");
            const whisperTextColor = ((darkMode) ? "#fff" : "#000");
            const buttonstyle = ((darkMode) ? `style='display:inline-block; color:#a980bd; font-size: 0.9em; background-color: transparent;padding: 0px; border: none'` : `style='display:inline-block; color:#ce0f69; font-size: 0.9em; background-color: transparent;padding: 0px; border: none'`);




            if (option !== undefined && option.includes('config')) {
                let templateChoice = option.split('|')[1]

                if (templateChoice === undefined) {
                    message = 'Current sheet template:<BR><b>' + state.Supernotes.sheet + '</b><BR>Send to Players:<BR><b>' + state.Supernotes.sendToPlayers + '</b><BR><BR>Choose a template for Supernotes to use.<BR><BR>[Default Template - any sheet](!gmnote --config|default)<BR>[D&D 5th Edition by Roll20](!gmnote --config|dnd5e)<BR>[DnD 5e Shaped](!gmnote --config|5eshaped)<BR>[Pathfinder Community](!gmnote --config|pfcommunity)<BR>[Pathfinder by Roll20](!gmnote --config|pfofficial)<BR>[Pathfinder 2e by Roll20](!gmnote --config|pf2e)<BR>[Starfinder by Roll20](!gmnote --config|starfinder)<BR>[Call of Cthulhu 7th Edition by Roll20](!gmnote --config|callofcthulhu)<BR><BR>[Toggle Send to Players](!gmnote --config|sendtoPlayers)<BR>[Toggle Make Handout button](!gmnote --config|makeHandout)<BR>[Toggle Darkmode](!gmnote --config|darkMode)'
                    sendChat('Supernotes', messagePrefix + '&{template:' + template + '}{{' + title + '=' + 'Config' + '}} {{' + theText + '=' + message + '}}');
                }


                switch (templateChoice) {
                    case 'default':
                        state.Supernotes.sheet = 'Default';
                        state.Supernotes.template = 'default';
                        state.Supernotes.title = 'name';
                        state.Supernotes.theText = '';
                        sendChat('Supernotes', '/w gm Supernotes set to Default roll template');
                        break;
                    case 'dnd5e':
                        state.Supernotes.sheet = 'D&D 5th Edition by Roll20';
                        state.Supernotes.template = 'npcaction';
                        state.Supernotes.title = 'rname';
                        state.Supernotes.theText = 'description';
                        sendChat('Supernotes', '/w gm Supernotes set to ' + state.Supernotes.sheet);
                        break;
                    case '5eshaped':
                        state.Supernotes.sheet = 'DnD 5e Shaped';
                        state.Supernotes.template = '5e-shaped';
                        state.Supernotes.title = 'title';
                        state.Supernotes.theText = 'text_big';
                        sendChat('Supernotes', '/w gm Supernotes set to ' + state.Supernotes.sheet);
                        break;
                    case 'pfcommunity':
                        state.Supernotes.sheet = 'Pathfinder Community';
                        state.Supernotes.template = 'pf_generic';
                        state.Supernotes.title = 'name';
                        state.Supernotes.theText = 'description';
                        sendChat('Supernotes', '/w gm Supernotes set to ' + state.Supernotes.sheet);
                        break;
                    case 'pfofficial':
                        state.Supernotes.sheet = 'Pathfinder by Roll20';
                        state.Supernotes.template = 'npc';
                        state.Supernotes.title = 'name';
                        state.Supernotes.theText = 'descflag=1}} {{desc';
                        sendChat('Supernotes', '/w gm Supernotes set to ' + state.Supernotes.sheet);
                        break;
                    case 'pf2e':
                        state.Supernotes.sheet = 'Pathefinder 2e';
                        state.Supernotes.template = 'rolls';
                        state.Supernotes.title = 'header';
                        state.Supernotes.theText = 'notes_show=[[1]]}} {{notes';
                        sendChat('Supernotes', '/w gm Supernotes set to ' + state.Supernotes.sheet);
                        break;
                    case 'starfinder':
                        state.Supernotes.sheet = 'Starfinder';
                        state.Supernotes.template = 'sf_generic';
                        state.Supernotes.title = 'title';
                        state.Supernotes.theText = 'buttons0';
                        sendChat('Supernotes', '/w gm Supernotes set to ' + state.Supernotes.sheet);
                        break;
                    case 'callofcthulhu':
                        state.Supernotes.sheet = 'Call of Cthulhu 7th Edition by Roll20';
                        state.Supernotes.template = 'callofcthulhu';
                        state.Supernotes.title = 'title';
                        state.Supernotes.theText = 'roll_bonus';
                        sendChat('Supernotes', '/w gm Supernotes set to ' + state.Supernotes.sheet);
                        break;
                    case 'sendtoPlayers':
                        if (state.Supernotes.sendToPlayers) {
                            state.Supernotes.sendToPlayers = false
                        } else {
                            state.Supernotes.sendToPlayers = true
                        };
                        sendChat('Supernotes', '/w gm Send to Players set to ' + state.Supernotes.sendToPlayers);
                        break;
                    case 'makeHandout':
                        if (state.Supernotes.makeHandout) {
                            state.Supernotes.makeHandout = false
                        } else {
                            state.Supernotes.makeHandout = true
                        };
                        sendChat('Supernotes', '/w gm Make Handout button set to ' + state.Supernotes.makeHandout);
                        break;
                    case 'darkMode':
                        if (state.Supernotes.darkMode) {
                            state.Supernotes.darkMode = false
                        } else {
                            state.Supernotes.darkMode = true
                        };
                        sendChat('Supernotes', '/w gm darkMode set to ' + state.Supernotes.darkMode);
                        break;
                }
            } else {
                if (option !== undefined && option.includes('help')) {
                    message = 'Supernotes pulls the contents from a token&#39;s GM Notes field. If the token represents a character, you can optionally pull in the Bio or GM notes from the character, as well as the avatar, or extract just the image from the bio field. The user can decide whether to whisper the notes to the GM or broadcast them to all players. Finally, there is the option to add a footer to notes whispered to the GM. This footer creates a chat button to give the option of sending the notes on to the players.<BR>This script as written is optimized for the D&amp;D 5th Edition by Roll20 sheet, but can be adapted easily suing the Configuration section below.<BR><BR><b>Commands:</b><BR><b>!gmnote</b> whispers the note to the GM<BR><b>!pcnote</b> sends the note to all players<BR><BR><b>Paramaters</b><BR><div style ="text-indent: -1em;margin-left: 1em;"><em>--token</em> Pulls notes from the selected token&#39;s gm notes field. This is optional. If it is missing, the script assumes --token<BR></div><div style ="text-indent: -1em;margin-left: 1em;"><em>--charnote</em> Pulls notes from the gm notes field of the character assigned to a token.<BR></div><div style ="text-indent: -1em;margin-left: 1em;"><em>--bio</em> Pulls notes from the bio field of the character assigned to a token.<BR></div><div style ="text-indent: -1em;margin-left: 1em;"><em>--avatar</em> Pulls the image from the avatar field of the character assigned to a token.<BR></div><div style ="text-indent: -1em;margin-left: 1em;"><em>--image</em> Pulls first image from the bio field of the character assigned to a token, if any exists. Otherwise returns notice that no artwork is available<BR></div><div style ="text-indent: -1em;margin-left: 1em;"><em>--images</em> Pulls all images from the bio field of the character assigned to a token, if any exist. Otherwise returns notice that no artwork is available<BR></div><div style ="text-indent: -1em;margin-left: 1em;"><em>--image[number]</em> Pulls indexed image from the bio field of the character assigned to a token, if any exist. <em>--image1</em> will pull the first image, <em>--image2</em> the second and so on. Otherwise returns first image if available. If no images are available, returns notice that no artwork is available.<BR></div><div style ="text-indent: -1em;margin-left: 1em;"><em>--template[templatename]</em> Instead of using the configured sheet roll template, you can choose from between more than 10 custom templates that  cover most common genres. Add the template command directly after the main prompt, followed by any of the regular parameters above. The current choices are: <BR></div><div style="text-indent:-1em; margin-left: 2em"><em>generic.</em> Just the facts, ma&#39;am. Nothing fancy here.<BR></div><div style="text-indent:-1em; margin-left: 2em"><em>dark.</em> As above, but in reverse.<BR></div><div style="text-indent:-1em; margin-left: 2em"><em>crt.</em> Retro greenscreen for hacking and cyberpunk. Or for reports on that xenomorph hiding on your ship.<BR></div><div style="text-indent:-1em; margin-left: 2em"><em>notebook.</em> You know, for kids. Who like to ride bikes. Maybe they attend a school and fight vampires or rescue lost extraterrestrials<BR></div><div style="text-indent:-1em; margin-left: 2em"><em>gothic.</em> Classic noire horror for contending with Universal monsters or maybe contending with elder gods.<BR></div><div style="text-indent:-1em; margin-left: 2em"><em>apoc.</em> Messages scrawled on a wall. Crumbling and ancient, like the world that was.<BR></div><div style="text-indent:-1em; margin-left: 2em"><em>scroll.</em> High fantasy. Or low fantasy—we don&#39;t judge.<BR></div><div style="text-indent:-1em; margin-left: 2em"><em>lcars.</em> For opening hailing frequencies and to boldly split infinitives that no one has split before!<BR></div><div style="text-indent:-1em; margin-left: 2em"><em>faraway.</em> No animated title crawl, but still has that space wizard feel.<BR></div><div style="text-indent:-1em; margin-left: 2em"><em>steam.</em> Gears and brass have changed my life.<BR></div><div style="text-indent:-1em; margin-left: 2em"><em>western.</em> Return with us now to those thrilling days of yesteryear!<BR><BR></div><div style ="text-indent: -1em;margin-left: 1em;"><em>--help</em> Displays help.<BR></div><div style ="text-indent: -1em;margin-left: 1em;"><em>--config</em> Returns a configuration dialog box that allows you to set which sheet&#39;s roll template to use, and to toggle the &quot;Send to Players&quot; footer.</div><BR><BR><b>Configuration</b><BR>When first installed, Supernotes is configured for the default roll template. It will display a config dialog box at startup that will allow you to choose a roll template based on your character sheet of choice, as well as the option  to toggle whether you want the &quot;Send to Players&quot; footer button to appear.<BR>You will need to edit the code of the script to create a custom configuration. The pre-installed sheets are:<BR><div style ="margin-left:10px;">Default Template<BR>D&amp;D 5th Edition by Roll20<BR>5e Shaped<BR>Pathfinder by Roll20<BR>Pathfinder Community<BR>Pathfinder 2e by Roll20<BR>Starfinder<BR>Call of Cthulhu 7th Edition by Roll20</div>';
                    sendMessage('Supernotes', messagePrefix, template, title, theText, message, false);

                } else {
                    if (!(option + '').match(/^(bio|charnote|tokenimage|tooltip|avatar|imag(e|es|e[1-9]))/)) {
                        option = 'token';
                    }

                    let playerButton = '';
                    if (sendToPlayers && (command === '!gmnote' || command === '!selfnote')) {
                        playerButton = '\n[Send to Players](' + msg.content.replace(/!(gm|self)/, "!pc") + ')';
                    }

                    let handoutButton = '';
                    if (makeHandout && (command.includes('gmnote') || command.includes('selfnote'))) {
                        handoutButton = ((playerButton) ? ' | ' : '<BR>') + '[Make Handout](' + msg.content.replace(/!(pc|self)/, "!gm") + ' --handout|NamePlaceholder|)';
                    } else {
                        //handoutButton = '\n[Make Handout](' + msg.content.replace(/!(pc|self)/, "!gm") +')';

                    }

                    let regex;
                    if (match && match[1]) {
                        regex = new RegExp(`^${match[1]}`, 'i');
                    }

                    let message = '';
                    let whom = '';



                    if (option === 'tooltip') {
                        (theToken || [])
                        .map(o => getObj('graphic', o._id))
                            .filter(g => undefined !== g)
                            .map(t => getObj('character', t.get('represents')))
                            .filter(c => undefined !== c)
                            .forEach(c => {
                                message = tokenTooltip;
                                whom = tokenName;
                                if (notitle) {
                                    whom = '';
                                }
                                sendMessage(whom, messagePrefix, template, title, theText, message, tokenID, playerButton, handoutButton);
                            });
                    } else {
                        if (option === 'tokenimage') {
                            (theToken || [])
                            .map(o => getObj('graphic', o._id))
                                .filter(g => undefined !== g)
                                /*                                .map(t => getObj('character', t.get('represents')))*/
                                .filter(c => undefined !== c)
                                .forEach(c => {
                                    message = "<img src='" + tokenImage + "'>";
                                    whom = tokenName;
                                    if (notitle) {
                                        whom = '';
                                    }
                                    sendMessage(whom, messagePrefix, template, title, theText, message, tokenID, playerButton, handoutButton);
                                });
                        } else {
                            if (option === 'avatar') {
                                (theToken || [])
                                .map(o => getObj('graphic', o._id))
                                    .filter(g => undefined !== g)
                                    .map(t => getObj('character', t.get('represents')))
                                    .filter(c => undefined !== c)
                                    .forEach(c => {
                                        message = "<img src='" + c.get('avatar') + "'>";
                                        whom = c.get('name');
                                        if (notitle) {
                                            whom = '';
                                        }
                                        sendMessage(whom, messagePrefix, template, title, theText, message, tokenID, playerButton, handoutButton);
                                    });
                            } else {

                                if (option.match(/^imag(e|es|e[1-9])/)) {


                                    (theToken || [])
                                    .map(o => getObj('graphic', o._id))
                                        .filter(g => undefined !== g)
                                        .map(t => getObj('character', t.get('represents')))
                                        .filter(c => undefined !== c)
                                        .forEach(c => c.get('bio', (val) => {
                                            if (null !== val && 'null' !== val && val.length > 0) {
                                                if (regex) {
                                                    message = _.filter(
                                                        decodeUnicode(val).split(/(?:[\n\r]+|<br\/?>)/),
                                                        (l) => regex.test(l.replace(/<[^>]*>/g, ''))
                                                    ).join('\r');
                                                    message = message.replace("<img ", "<img style = 'filter:none !important;' ");
                                                } else {
                                                    message = decodeUnicode(val);
                                                    message = message.replace("<img ", "<img style = 'filter:none !important;' ");

                                                }
                                                if (option === "images") {
                                                    artwork = message.match(/\<.* src.*?\>/g);
                                                    if (artwork === null) {
                                                        artwork = 'No artwork exists for this character. Consider specifiying avatar.'
                                                    };

                                                } else {
                                                    artwork = message.match(/\<.* src.*?\>/g);
                                                    artwork = String(artwork);
                                                    if (artwork === null) {
                                                        artwork = 'No artwork exists for this character. Consider specifiying avatar.'
                                                    };


                                                    imageIndex = option.match(/\d+/g);


                                                    if (isNaN(imageIndex) || !imageIndex) {
                                                        imageIndex = 1
                                                    }

                                                    if (imageIndex > (artwork.split(",")).length) {
                                                        imageIndex = 1
                                                    }

                                                    imageIndex = imageIndex - 1; //corrects from human readable

                                                    artwork = artwork.split(",")[imageIndex];

                                                }
                                                if (('' + artwork).length > 3) {
                                                    message = artwork;
                                                } else {
                                                    message = 'No artwork exists for this character.';
                                                }
                                                if (artwork === "null" || message === "null") {
                                                    message = 'No artwork exists for this character. Consider specifiying avatar.'
                                                };

                                                whom = c.get('name');

                                                //Sends the final message
                                                if (notitle) {
                                                    whom = '';
                                                }
                                                sendMessage(whom, messagePrefix, template, title, theText, message, tokenID, playerButton, handoutButton);

                                            }
                                        }));
                                } else {



                                    if ((option === 'bio') || (option === 'charnote')) {
                                        let suboption = (option === 'charnote') ? 'gmnotes' : 'bio';

                                        (theToken || [])
                                        .map(o => getObj('graphic', o._id))
                                            .filter(g => undefined !== g)
                                            .map(t => getObj('character', t.get('represents')))
                                            .filter(c => undefined !== c)
                                            .forEach(c => c.get(suboption, (val) => {
                                                if (null !== val && 'null' !== val && val.length > 0) {
                                                    if (regex) {
                                                        message = _.filter(
                                                            decodeUnicode(val).split(/(?:[\n\r]+|<br\/?>)/),
                                                            (l) => regex.test(l.replace(/<[^>]*>/g, ''))
                                                        ).join('\r');
                                                    } else {
                                                        message = decodeUnicode(val);
                                                    }
                                                    whom = c.get('name');
                                                    //Crops out GM info on player messages
                                                    if (command === '!pcnote' || command === '!selfnote') {
                                                        message = (message.includes("-----") ? message.split('-----')[0] : message);
                                                    }
                                                    //Sends the final message
                                                    if (notitle) {
                                                        whom = '';
                                                    }
                                                    sendMessage(whom, messagePrefix, template, title, theText, message, tokenID, playerButton, handoutButton);

                                                } else {
                                                    if (notitle) {
                                                        whom = ''
                                                    }
                                                    message = `The information does not exist for the <code>${option}</code> option`;
                                                    sendMessage(whom, messagePrefix, template, title, theText, message, tokenID, playerButton, handoutButton);

                                                }
                                            }));
                                    } else {
                                        (theToken || [])
                                        .map(o => getObj('graphic', o._id))
                                            .filter(g => undefined !== g)
                                            .filter((o) => o.get('gmnotes').length > 0)
                                            .forEach(o => {
                                                if (regex) {
                                                    message = _.filter(unescape(decodeUnicode(o.get('gmnotes'))).split(/(?:[\n\r]+|<br\/?>)/), (l) => regex.test(l)).join('\r');
                                                } else {
                                                    message = unescape(decodeUnicode(o.get('gmnotes')));
                                                }
                                                whom = o.get('name');

                                            });

                                        //Crops out GM info on player messages
                                        if (command === '!pcnote' || command === '!selfnote') {
                                            message = (message.includes("-----") ? message.split('-----')[0] : message);
                                        }

                                        //Sends the final message
                                        if (notitle) {
                                            whom = '';
                                        }
                                        sendMessage(whom, messagePrefix, template, title, theText, message, tokenID, playerButton, handoutButton);

                                    }

                                    /* Log Block. Turn on for debugging
                                                                    [
                                                                        `### REPORT###`,
                                                                        `THE MESSAGE =${message}`,
                                                                        `command = ${command}`,
                                                                        //                               `option = ${option}`,
                                                                        `secondOption = ${secondOption}`,
                                                                        `messagePrefix = ${messagePrefix}`,
                                                                        `whom = ${whom}`,
                                                                        `message =${message}`
                                                                    ].forEach(m => log(m));
                                                                    */
                                }
                            }
                        }
                    }
                }
            }
        }
    });
});

{ try { throw new Error(''); } catch (e) { API_Meta.Supernotes.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.Supernotes.offset); } }
