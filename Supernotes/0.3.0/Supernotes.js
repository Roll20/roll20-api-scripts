// Script:   Supernotes
// By:       Keith Curtis
// Contact:  https://app.roll20.net/users/162065/keithcurtis
// Changelog
// 0.3.0 Substantial internal update (framework migration + bug-fix pass).
//       No command, flag, or output-format changes unless noted.
//       - Migrated onto the standard script framework (Config/State/Logger/
//         Parser/Output/Commands); rewrote argument parsing and option
//         dispatch for readability.
//       - Fixed: --id targeting a deleted/missing token could crash the
//         sandbox; --template|name was ignored depending on flag order;
//         --tooltip/--tokenimage/--card/default-token multi-select reports
//         repeated the first selected token's data instead of each token's
//         own; a player/self-note routed to a handout could leak stale
//         GM-only text from an earlier, unrelated call; --image2/--image3+
//         could return stray bio prose instead of an image; a mislabeled
//         "Pathefinder 2e" config option.
//       - Removed dead code: the non-functional "!gmnote-Pattern" filter
//         shorthand, and a leftover debug block.
//       - Every option now whispers an explanation instead of failing
//         silently (no target selected, bad/deleted --id, token without a
//         character, empty field).
//       - Headers (h1-h6) in notes now take the surrounding template's own
//         text color instead of Roll20's fixed heading color.
//       - The "-----" GM-only divider now parses correctly regardless of
//         how Roll20's rich-text editor wraps it, and its whisper box no
//         longer displays when there's nothing readable after the divider.
//       - Fixed image links (including cache-busted, webp Roll20 URLs) not
//         rendering in chat: Supernotes now builds the <img>/<a> tags
//         itself instead of relying on Roll20 to auto-embed markdown
//         placed inside a roll template, which it does not do. Every
//         "is this an image" extension check is now one shared list.
//       - New: --menu whispers a compact, clickable button grid of every
//         reporting option for the selected token(s) — a GM sees both a
//         GM-facing and a player-facing row; anyone else sees only the
//         player-facing row.
// 0.2.8 Added webp support
// 0.2.7 Added Templates for 2024 sheet, Dark and Light
// 0.2.6 Reworked and updated Help system to use handout. Fixed logic issue Card output.
// 0.2.5 fixed trailing space problem in command line, fixed linebreak issue.

/* ============================================================================
 * Supernotes_Templates
 *
 * Deliberately declared OUTSIDE the Supernotes namespace/IIFE below, as a
 * plain global. Other One-Click scripts (currently ScriptCards/SuperCards)
 * read this object directly by name to render notes in a matching style, so
 * its name, location, and shape are a stable public contract — do not move
 * it inside the IIFE or rename it.
 * ========================================================================== */
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

    dark55: {
        boxcode: `<div style='color: #fff; font-family: proxima-nova, "Proxima Nova", sans-serif !important; border-radius: 8px; display: block; text-align: left; font-size: 14px; padding: 5px; margin-bottom: 2px; font-weight:normal;  white-space: pre-wrap; background-image: url(https://storage.googleapis.com/roll20-cdn/advanced-sheets-production-9b1f7af9/dnd2024byroll20/assets/bg-img.jpg); background-color: #0b0b0b;'>`,
        titlecode: `<div style='color:#fff; font-family: proxima-nova, "Proxima Nova", sans-serif !important; background-color:transparent; margin-right:3px; padding:3px; font-size:24px; line-height:26px;border-bottom: 1px solid #d72f2f; white-space: pre-wrap;'>`,
        textcode: "</div><div><div style='padding:3px;'>",
        buttonwrapper: `<div style='display:block; margin-top:15px; text-align: center; border-top: 1px solid #d72f2f;'>`,
        buttonstyle: `style='display:inline-block; color:#e16363; font-weight:bold; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle:  `style='display:inline-block; color:#e16363; font-weight:bolder; background-color: transparent;border-radius: 4px; margin:4px; padding: 2px 6px 2px 6px; border: none; font-family:"proxima nova", sans-serif;'`,
        buttondivider: ' | ',
        handoutbuttonstyle: `style='display:inline-block; color:#e16363; font-weight:bolder; background-color: transparent;border-radius: 4px; margin:4px; padding: 2px 6px 2px 6px; border: none; font-family:"proxima nova", sans-serif;'`,
        whisperStyle: `'background-color:#none; color:#ccc; display:block; padding:5px; margin-top:20px; border-top: 1px solid #d72f2f; font-weight:normal;'`,
        whisperbuttonstyle: `style='display:inline-block; color:#ccc; font-weight:bold; background-color: transparent;padding: 0px; border: none;`,
        footer: ""
    },

    light55: {
        boxcode: `<div style='color: #292218; font-family: proxima-nova, "Proxima Nova", sans-serif !important; border-radius: 8px; display: block; text-align: left; font-size: 14px; padding: 5px; margin-bottom: 2px; font-weight:normal;  white-space: pre-wrap; background-color: #eee;'>`,
        titlecode: `<div style='color:#615139; font-family: proxima-nova, "Proxima Nova", sans-serif !important; font-weight:bold; background-color:transparent; margin-right:3px; padding:3px; font-size:24px; line-height:26px;border-bottom: 1px solid #8E5620; white-space: pre-wrap;'>`,
        textcode: "</div><div><div style='padding:3px;'>",
        buttonwrapper: `<div style='display:block; margin-top:15px; text-align: center; border-top: 1px solid #8E5620;'>`,
        buttonstyle: `style='display:inline-block; color:#E16363; font-weight:bold; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle:  `style='display:inline-block; color:#E16363; font-weight:bold; background-color: transparent;border-radius: 4px; margin:4px; padding: 2px 6px 2px 6px; border: none; font-family:"proxima nova", sans-serif;'`,
        buttondivider: ' | ',
        handoutbuttonstyle: `style='display:inline-block; color:#E16363; font-weight:bold; background-color: transparent;border-radius: 4px; margin:4px; padding: 2px 6px 2px 6px; border: none; font-family:"proxima nova", sans-serif;'`,
        whisperStyle: `'background-color:#F1ECE6; color:#292218; display:block; padding:5px; margin-top:20px; border-top: 1px solid #8E5620; font-weight:normal;'`,
        whisperbuttonstyle: `style='display:inline-block; color:#E16363; font-weight:bold; background-color: transparent;padding: 0px; border: none;`,
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
        boxcode: `<div style='color: #fff; background-image: url(https://files.d20.io/images/459209465/bJ0zt44EhbkzDr-mo9X8lA/original.jpg); background-repeat: repeat; background-color: transparent; display: block; box-shadow: 0 0 3px #fff; text-align: left; font-size: 14px; padding: 12px 12px 12px 12px; margin-bottom: 2px; font-family: Palatino, serif; white-space: pre-wrap;'>`,
        titlecode: `<div style='font-weight:bold; color: #fff; background-color:#transparent; margin-bottom:0px; padding:3px;font-size: 18px; font-family: Luminari, palatino, Georgia, serif; text-align:center'>`,
        textcode: `</div><img style='margin-bottom:12px;' src='https://files.d20.io/images/459209460/b2DE-w5ANclivwN3EISjeQ/original.png'><div style='padding:3px; margin-bottom:0px; font-family: palatino, serif; text-shadow: 0 0 1px #000; line-height: 19px;'>`,
        buttonwrapper: `<div style='display:block; margin-top:12px;text-align:center;'>`,
        buttonstyle: `style='display:inline-block; color:#ccc; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle: `style='display:inline-block; color:#ccc; font-size:12px; font-weight:normal; background-color: transparent;padding: 0px; border: none;'`,
        buttondivider: `<img style='margin:0px 4px 0px 4px; width:14px;' src='https://files.d20.io/images/459209528/6mdldZcTCKMNLwC1UHZ7Lw/original.png'>`,
        handoutbuttonstyle: `style='display:inline-block; color:#ccc; font-size:12px; font-weight:normal; background-color: transparent; padding: 0px; border: none;'`,
        whisperStyle: `'background-color:#2b2130; color:#ddd; display:block; border-width: 1px; border-style: solid; border-color:#a3a681; padding:5px'`,
        whisperbuttonstyle: `style='display:inline-block; color:#aaa; background-color: transparent;padding: 0px; border: none'`,
        footer: ""
    },

    western: {
        boxcode: `<div style='color: #000; border: 1px solid #000; border-radius: 2px; box-shadow: 0px 0px 20px 0px #000 inset; background-image: url(https://files.d20.io/images/459209462/iw8RdsL5EVwrQkXPVR5nRQ/original.jpg); background-repeat: repeat; background-color: transparent; display: block; text-align: left; font-size: 16px; padding: 12px 10px 12px 10px; margin-bottom: 2px; font-family: "Times New Roman", serif; white-space: pre-wrap;'>`,
        titlecode: `<div style='font-weight:bold; color: #932; background-color:#transparent; margin-bottom:0px; padding:3px;font-size: 22px;   font-family: Rye, "Times New Roman", serif; text-align:center'>`,
        textcode: `</div><div style='text-align:center;'><img style='margin-bottom:12px;' src='https://files.d20.io/images/459209467/C0vr5RYuiDwvdCfFJiXmCg/original.png'></div><div style='padding:3px; margin-bottom:0px; font-family: "IM Fell DW Pica", "Times New Roman", serif; line-height: 19px;'>`,
        buttonwrapper: `<div style='display:block; margin-top:12px;text-align:center;'>`,
        buttonstyle: `style='display:inline-block; color:#000; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle: `style='display:inline-block; color:#7e2d40; background-color: transparent;padding: 0px; border: none'`,
        buttondivider: `<img style='margin:0px 4px 0px 4px; width:20px;' src='https://files.d20.io/images/459209588/xw0q8Qvdx1MCsWHP1XNmnw/original.png'>`,
        handoutbuttonstyle: `style='display:inline-block; color:#7e2d40; background-color: transparent;padding: 0px; border: none'`,
        whisperStyle: `'background-color:#382d1d; color:#ebcfa9; font-style: italic; display:block; border-width: 1px; border-style: solid; border-color:#a3a681; padding:5px; margin-top:5px'`,
        whisperbuttonstyle: `style='display:inline-block; color:#fabe69; background-color: transparent;padding: 0px; border: none'`,
        footer: ""
    },

    dragon: {
        boxcode: `<div style='color: #000; border: 1px solid #b5ac89; box-shadow: 2px 2px 4px #000, 0px 0px 20px 0px #d9bea0 inset; background-image: url(https://files.d20.io/images/459209594/g3-JSA2fW8dUWSyWbIG3bQ/original.jpg); background-size: auto; background-repeat: repeat-y;  background-color: #e6daae; display: block; text-align: left; font-size: 14px; line-height: 16px;padding: 12px 10px 8px 10px; margin-bottom: 2px; font-family: ""Times New Roman", serif; white-space: pre-wrap;'>`,
        titlecode: `<div style='font-weight:bold; color: #0e3365; text-transform: uppercase; background-color:#transparent; margin-bottom:2px;  border-bottom: 2px solid #0e3365; padding:3px 3ps 0px 3px;font-size: 20px; font-family: Luminari,"times new roman", times, baskerville, serif; text-align:right'>`,
        textcode: `</div><div style='padding:3px; margin-bottom:0px; font-family: Georgia, serif; line-height: 19px;'>`,
        buttonwrapper: `<div style='display:block; margin-top:14px ;text-align:center;font-family: Luminari,"times new roman"'>`,
        buttonstyle: `style='display:inline-block; color:#0e3365; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle: `style='display:inline-block; color: #0e3365; font-size:14px; background-color: transparent;padding: 0px; border: none'`,
        buttondivider: " &nbsp;&bull;&nbsp; ",
        handoutbuttonstyle: `style='display:inline-block; color: #0e3365; font-size:14px; background-color: transparent;padding: 0px; border: none'`,
        whisperStyle: `'display:block; border-width: 5px 0px 5px 0px; border-style: solid; border-color:#58170D; padding:5px; margin-top:9px;'`,
        whisperbuttonstyle: `style='display:inline-block; color:#0e3365; background-color: transparent;padding: 0px; border: none'`,
        footer: ""
    },



    wizard: {
        boxcode: `<div style='color: #000; border: 1px solid #b5ac89; box-shadow: 2px 2px 4px #000, 0px 0px 20px 0px #d9bea0 inset; background-image: url(https://files.d20.io/images/459209464/Gvxg3OZzRhp_4sK7NnZhXw/original.jpg); background-repeat: repeat; background-color: #e6daae; display: block; text-align: left; font-size: 14px; padding: 12px 10px 8px 10px; margin-bottom: 2px; font-family: "Times New Roman", serif; white-space: pre-wrap;'>`,
        titlecode: `<div style='font-weight:bold; color: #58170D; font-variant: small-caps; background-color:#transparent; margin-bottom:0px;  border-bottom: 2px solid #c9ad6a; padding:3px;font-size: 22px; font-family: "times new roman", times, baskerville, garamond, serif; text-align:left'>`,
        textcode: `</div><div style='padding:3px; margin-bottom:0px; font-family: Georgia, serif; line-height: 19px;'>`,
        buttonwrapper: `<div style='display:block; border-top: solid 1px #000; background-color: #E0E5C1; margin-top:12px ;text-align:center;font-family:arial, sans-serif'>`,
        buttonstyle: `style='display:inline-block; color:#58170D; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle: `style='display:inline-block; color: #000; font-size:12px; background-color: transparent;padding: 0px; border: none'`,
        buttondivider: " &nbsp;&bull;&nbsp; ",
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
    buttondivider: " &nbsp;&nbsp; ",
    handoutbuttonstyle: `style='display:inline-block; color: #eee; font-size:12px; background-color: #5e0000; padding: 0px 4px 0px 4px; border-style:solid; border-width: 2px 4px 2px 4px; border-color: #d9c484; text-transformation: all-caps; font-family: "gin", impact, "Arial Bold Condensed", sans-serif;'`,
    whisperStyle: `'background-color:#dbd1bc; color:#000; display:block; border-width: 1px; margin-top:15px; padding:5px; font-size: 15px; font-family: "Good OT", arial, sans-serif;'`,
    whisperbuttonstyle: `style='display:inline-block; color:#58170D; background-color: transparent; font-weight:bold; padding: 0px; border: none'`,
    footer: ""
},

apoc: {
        boxcode: `<div style='color: 000; background-image: url(https://files.d20.io/images/459209592/o4Ohe8PlNabBNbpXmyy09Q/original.jpg); background-size: 100%; background-repeat: repeat-y; background-color: transparent; display: block; box-shadow: 0 0 3px #fff; text-align: left; font-size: 17px; padding: 0px; margin-bottom: 2px; font-family: "Shadows Into Light", Monaco,"Courier New", monospace; white-space: pre-wrap;'>`,
        titlecode: `<div style='font-weight:bold; color: #000; background-color:transparent; margin:20px 24px 0px 24px; padding:12px 3px 8px 3px;font-size: 18px; font-family: "IM Fell DW Pica", verdana, tahoma, sans-serif; text-align:center'>`,
        textcode: `</div><div><div style='padding:0px 3px 0px 3px; margin:0px 24px 0px 24px; color: #000;font-family: "Shadows Into Light", Monaco,"Courier New", monospace; line-height: 26px;'>`,
        buttonwrapper: `<div style='display:block; margin-top:12px;text-align:center;'>`,
        buttonstyle: `style='display:inline-block; color:#555; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle: `style='display:inline-block; color:#000; font-size:14px; font-weight:normal; background-color: transparent;padding: 0px; border: none;'`,
        buttondivider: " / ",
        handoutbuttonstyle: `style='display:inline-block; color:#000; font-size:14px; font-weight:normal; background-color: transparent; padding: 0px; border: none;'`,
        whisperStyle: `'background-color:#403f3d; color:#ddd; display:block; padding:5px !important; margin:5px; font-family: "Shadows Into Light", Monaco,"Courier New", monospace !important; '`,
        whisperbuttonstyle: `style='display:inline-block; color:#bbb; background-color: transparent;padding: 0px; border: none'`,
        footer: `<img style = 'margin: 0px !important; padding:0px;width:100%' src = 'https://files.d20.io/images/459209596/RSmUyGMLL-vQ04zCmmWPGQ/original.png'>`
    },

    roman: {
        boxcode: `<div style='color: 000; background-image: url(https://files.d20.io/images/459209470/FuYxzu3hsKZZe7vP6czucg/original.png); background-size: 100%; background-repeat: repeat-y; background-color: transparent; display: block; box-shadow: 0 0 3px #fff; text-align: left; font-size: 17px; padding: 0px; margin-bottom: 2px; font-family: "Shadows Into Light", Monaco,"Courier New", monospace; white-space: pre-wrap;'><div style = 'display:block; text-align:center;'><img style='margin-bottom:-25px; margin-top:0px; text-align:center;' src='https://files.d20.io/images/459209530/dIxYg78Hg-J_cM6IC9AJcw/original.png'></div>`,
        titlecode: `<div style='font-weight:bold; color: #666; background-color:transparent; margin:20px 12px 0px 12px; padding:12px 3px 8px 3px;font-weight: 900; font-size: 24px; line-height:24px; text-transform: uppercase; text-shadow: -1px -1px rgba(0,0,0,0.5), 1px 1px rgba(255,255,255,0.5); font-family: "Crimson Text", times,"Times New Roman", serif; text-align:center'>`,
        textcode: `</div><div><div style='padding:0px 3px 0px 3px; margin:0px 12px 0px 12px; color: #333; font-weight: 900; font-size: 13px; text-transform: uppercase; text-shadow: -1px -1px rgba(0,0,0,0.25), 1px 1px rgba(255,255,255,0.5); font-family: "Crimson Text", times,"Times New Roman", serif; line-height: 20px;'>`,
        buttonwrapper: `<div style='display:block; margin: 12px -10px 0px -10px; text-align:center;'>`,
        buttonstyle: `style='display:inline-block; color:#7c6f39; font-weight: bold; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle: `style='display:inline-block; color:#000; font-size:12px; font-weight:normal; background-color: transparent;padding: 0px; border: none;'`,
        buttondivider: " | ",
        handoutbuttonstyle: `style='display:inline-block; color:#000; font-size:12px; font-weight:normal; background-color: transparent; padding: 0px; border: none;'`,
        whisperStyle: `'background-image: url(https://files.d20.io/images/459209597/cdZeKGAy2_NKcU1Wjkjeew/original.jpg); background-repeat: no-repeat; background-size: 100% 100%; background-color:#403f3d; color:#ddd; display:block; padding:8px !important; margin:5px 0px; text-shadow: none; line-height:16px;'`,
        whisperbuttonstyle: `style='display:inline-block; color:#bbaa55; font-weight: bolder !important; background-color: transparent;padding: 0px; border: none'`,
        footer: `<img style = 'margin: 0px !important; padding:0px;width:100%' src = 'https://files.d20.io/images/459209476/2ievKCGQVkd4dB0n-lNV4Q/original.png'>`
    },

    notebook: {
        boxcode: `<div style='color: 000; border-radius:10px; background-image: url(https://files.d20.io/images/459209466/589jHGhTwYfL3aaKtyRfNg/original.jpg); background-size: auto; background-repeat: repeat-y; background-color: transparent; display: block; box-shadow: 0 0 3px #fff; line-height 16px; text-align: left; font-size: 14px; padding: 8px 8px 8px 30px; margin-bottom: 2px; font-family: "Patrick Hand", Monaco,"Courier New", monospace; white-space: pre-wrap;'>`,
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
        boxcode: `<div style='color: #000; background-image: linear-gradient(to bottom right,#e3b76f,#ebcc99,#b28f57); background-color: transparent; display: block; box-shadow: 0 0 3px #fff; text-align: left; font-size: 14px; padding: 1px 10px 2px 10px; margin-top:30px; margin-bottom: 2px; font-family: 'Gill Sans', sans-serif; white-space: pre-wrap;'><div style = 'display:block; text-align:center;'><img style='margin-bottom:0px; margin-top:-30px; text-align:center;' src='https://files.d20.io/images/459209527/5g5sThb_gqMLy_GUtrfsPw/original.png'></div>`,
        titlecode: `<div style='font-weight:bold; color: #000; text-align:center; background-color:#transparent; margin-bottom:0px; padding:3px;font-size: 18px; font-family: 'Gill Sans', sans-serif; text-align:center'>`,
        textcode: "</div><div><div style='padding:3px;margin-bottom:0px;text-shadow: 0 0 1px #000;line-height:19px;font-family: 'Gill Sans', sans-serif;'>",
        buttonwrapper: `<div style='display:block; margin-top:12px;text-align:center;'>`,
        buttonstyle: `style='display:inline-block; color:#056b20; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle: `style='display:inline-block; color:#056b20; font-size:12px; font-weight:normal; background-color: transparent;padding: 0px; border: none;'`,
        buttondivider: `<img style='margin:0px 4px 0px 4px; width:30px;' src='https://files.d20.io/images/459209526/yH-u99jJ6ozufcxqs6B1UA/original.png'>`,
        handoutbuttonstyle: `style='display:inline-block; color:#056b20; font-size:12px; font-weight:normal; background-color: transparent; padding: 0px; border: none;'`,
        whisperStyle: `'background-color:#2b2130; color:#fbfcf0; display:block; border-width: 1px; border-style: solid; border-color:#a3a681; padding:5px'`,
        whisperbuttonstyle: `style='display:inline-block; color:#fff; background-color: transparent;padding: 0px; border: none'`,
        footer: ""
    },

    treasure: {
        boxcode: `<div style='color: #eee;  background-image: linear-gradient(to bottom right,#e3b76f,#ebcc99,#b28f57); background-color: transparent; display: block; box-shadow: 0 0 3px #fff; text-align: left; font-size: 14px; padding: 1px 10px 2px 10px; margin-top:30px; margin-bottom: 2px; font-family: Tahoma, sans-serif; white-space: pre-wrap;'><div style = 'display:block; text-align:center;'><img style='margin-bottom:0px; margin-top:-30px; text-align:center;' src='https://files.d20.io/images/459209531/PE_vEh7o1tWVK-10KNAeHg/original.png'></div>`,
        titlecode: `<div style='font-weight:bold; color: #401e00; text-align:center; background-color:#transparent; margin-bottom:0px; padding:3px;font-size: 18px; font-family: "Goblin One", sans-serif; text-align:center'>`,
        textcode: "</div><div style='padding:3px;margin-bottom:0px;text-shadow: 0 0 1px #111;line-height:19px;color:#111;'>",
        buttonwrapper: `<div style='display:block; margin-top:12px;text-align:center;'>`,
        buttonstyle: `style='display:inline-block; color:#8a4100; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle: `style='display:inline-block; color:#634401; font-size:14px; font-weight:normal; background-color: transparent;padding: 0px; border: none;'`,
        buttondivider: `<img style='margin:0px 4px 0px 4px; width:30px;' src='https://files.d20.io/images/459209461/emYYjkEI73UBCR4iXfTG9g/original.png'>`,
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
        buttondivider: " &nbsp;&FilledSmallSquare;&nbsp; ",
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
        buttondivider: " &nbsp;&FilledSmallSquare;&nbsp; ",
        handoutbuttonstyle: `style='display:inline-block; color: #eee; font-size:16px; font-family: "Minion", "Minion Pro", serif; background-color: transparent;padding: 0px; border: none'`,
        whisperStyle: `'background-image: linear-gradient(to bottom,#4b443d,#3f3732,#4b443d); background-color: transparent; color:#f8e8a6; display:block; border-width: 1px; border: 1px solid #4f4841; margin: 20px, -12px, 15px, -12px; padding:10px, 10px'`,
        whisperbuttonstyle: `style='display:inline-block; color:#eee; background-color: transparent;padding: 0px; border: none'`,
        footer: ""
},


    crt: {
        boxcode: `<div style='color: #0eb350; font-weight: bold; border: 1px solid #0eb350; border-radius: 12px; background-image: url("https://files.d20.io/images/459209468/jLXM3JXfaD7FL36c6RFC4Q/original.png"); background-image: repeat; background-color: #0a2b07; box-shadow: 0 0 3px #000; display: block; text-align: left; font-size: 18px; padding: 5px; margin-bottom: 2px; font-family: Monaco, monospace; white-space: pre-wrap;'>`,
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
        boxcode: `<div style='color: #444; background-image: url("https://files.d20.io/images/459209532/psepbax2MooUvZ273m0BtQ/original.png"); background-image: repeat; box-shadow: 5px 5px 3px #000; display: block; text-align: justify; font-size: 18px; padding: 5px; margin-bottom: 2px; font-family: Monaco, monospace; white-space: pre-wrap;'>`,
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
        boxcode: `<div style='color: #000; background-image: url(https://files.d20.io/images/459209486/IvS93nnQHpzNqcPwum44og/original.png); background-size: 100% 100%; background-color: transparent; display: block; text-align: left; font-size: 14px; padding: 5px 8px 8px 5px; margin-bottom: 2px; font-family: 'Times New Roman', serif; white-space: pre-wrap;'>`,
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
        boxcode: `<div style='color: #000; background-image: url(https://files.d20.io/images/459209540/G34O1t42pKh2eI9rffzolg/original.png); background-size: 100%; background-repeat: repeat-y; background-color: transparent; display: block; text-align: left; font-size: 14px; margin-top:30px; margin-bottom: 2px; padding:0px 5px 0px 5px;font-family: 'Gill Sans', sans-serif; white-space: pre-wrap;'><div style = 'display:block; text-align:center;'><img style='margin-bottom:0px; margin-top:-30px; text-align:center;  background-size: 100%; ' src='https://files.d20.io/images/459209533/McHJox7DYx1h7_OkBsQObw/original.png'></div>`,
        titlecode: `<div style='color: #58360d; background-color: transparent: display: block; text-align: Center; line-height:24px; font-size: 24px; padding: 5px 15px 5px 10px; margin: 0px 3px 0px 3px; font-family: "Kaushan Script", Luminari,"Times New Roman", serif; white-space: pre-wrap;'>`,
        textcode: `</div><div><div style='text-align:center; font-size: 14px !important; line-height: 18px; font-family: "Della Respira", "Patrick Hand", Times New Roman", serif; padding:3px 20px 3px 20px;'>`,
        buttonwrapper: `<div style='display:block font-size: 14px !important; '>`,
        buttonstyle: `style='display:inline-block; color:#58170D; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle: `style='display:inline-block; font-size: 14px !important; color:#58170D; background-color: transparent;padding: 0px; border: none'`,
        buttondivider: ' | ',
        handoutbuttonstyle: `style='display:inline-block; font-size: 14px !important; color:#58170D; background-color: transparent;padding: 0px; border: none'`,
        whisperStyle: `'background-color:#241605; color:#eee; box-shadow: 0px 0px 5px 5px #241605; display:block; border-radius:15px; padding:5px; margin: 15px 5px 10px 5px'`,
        whisperbuttonstyle: `style='display:inline-block; color:#fcdd6d; background-color: transparent;padding: 0px; border: none'`,
        footer: `<img style = 'margin: 0px !important; padding:0px; position:relative; top:9px; width:100%' src = 'https://files.d20.io/images/459209591/d_akXh9AwqutbUN1x1nsIQ/original.png'>`
    },

    vault: {
        boxcode: `<div style='color: #111; background-image: url(https://files.d20.io/images/459209599/XOj4c3B1Y9bOiNteobKe3Q/original.png); background-size: 100%; background-repeat: repeat-y; background-color: transparent; display: block;  text-shadow: 3px 3px 15px #74a4dc, -3px -3px 15px #74a4dc, 3px -3px 15px #74a4dc, -3px 3px 15px #74a4dc; text-align: left; font-size: 14px;  margin-bottom: 2px; padding:10px 5px 5px 5px;font-family: 'Contrail One', sans-serif; white-space: pre-wrap;'>`,
        titlecode: `<div style='color: #111; background-color: #transparent; background-image: url(https://files.d20.io/images/459209469/UA2E7Vyf-kncA8k1jUuyAg/original.png);  border-radius:3px; display: block; text-align: Center; text-shadow: none; line-height:24px; font-size: 24px; padding: 5px 15px 5px 10px; margin: -5px 0px 15px 0px; font-style:bold; font-family: "Contrail One", serif; white-space: pre-wrap;'>`,
        textcode: `</div><div><div style='text-align:left; font-size: 14px !important; line-height: 20px; font-family: "Contrail One","Della Respira", "Patrick Hand", Times New Roman", serif; padding:3px 20px 3px 20px;'>`,
        buttonwrapper: `<div style='display:block; font-size: 15px !important; text-align:center; margin:0px -15px 0px -15px;'>`,
        buttonstyle: `style='display:inline-block; color:#111; text-decoration: underline; background-color: transparent;padding: 0px; border: none'`,
        playerbuttonstyle:  `style='display:inline-block; font-size: 15px !important; color:#fef265; text-shadow: 2px 2px 2px #111; background-color: transparent;padding: 0px; border: none'`,
        buttondivider: `&nbsp; <img style='margin:0px 4px 0px 4px; width:30px;' src='https://files.d20.io/images/459209455/QovgYK36q9RuOE2Lv0d2JQ/original.png'> &nbsp;`,
        handoutbuttonstyle: `style='display:inline-block; font-size: 15px !important; color:#fef265; text-shadow: 2px 2px 2px #111;background-color: transparent;padding: 0px; border: none'`,
        whisperStyle: `'background-color: #transparent; background-image: url(https://files.d20.io/images/459209469/UA2E7Vyf-kncA8k1jUuyAg/original.png; color:#111; display:block;  text-shadow: none; text-align:center; font-family: "Contrail One"; border-radius:3px; padding:5px; margin: 15px -20px 10px -20px'`,
        whisperbuttonstyle: `style='display:inline-block; color:#284a73; background-color: transparent;padding: 0px; border: none'`,
        footer: ``
    },

    osrblue: {
        boxcode: `<div style='color: #333; background-image: url(https://files.d20.io/images/459209456/3MxudvaBU_ZNiVqfym2f9Q/original.png); box-shadow:inset 0 0 70px #f4f2db, 2px 2px 5px #111; background-size: 25%; background-repeat: repeat; background-color: transparent; display: block; font-weight: bolder; text-align: left; font-size: 14px;  margin-bottom: 2px; padding:10px 5px 5px 5px; font-family: "Courier One", courier , sans-serif; white-space: pre-wrap;'>`,
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

/* ============================================================================
 * Supernotes
 * ========================================================================== */
const Supernotes = (() => {
    'use strict';

    // ==================================================
    // Config
    // ==================================================

    const scriptName = 'Supernotes';
    const version = '0.3.0';
    const schemaVersion = 1.0;

    const DEBUG = false;

    // Local alias — the real registry lives in the global Supernotes_Templates
    // above (see the comment on that declaration for why it's global).
    const templates = Supernotes_Templates;

    // Fallback styling for the *native* Roll20 roll-template output path
    // (i.e. no --template|name given on the command). A custom template's
    // own boxcode/whisperStyle/buttonstyle from Supernotes_Templates always
    // takes precedence over these when one is chosen — see deliver() below.
    const CSS = {
        whisperStyle: (darkMode) => (darkMode
            ? `'background-color:#2b2130; color:#fbfcf0; display:block; border-width: 1px; border-style: solid; border-color:#a3a681; padding:5px'`
            : `'background-color:#fff; color:#000; display:block; border-width: 1px; border-style: solid; border-color:#a3a681; padding:5px'`),
        buttonStyle: (darkMode) => (darkMode
            ? `style='display:inline-block; color:#a980bd; font-size: 0.9em; background-color: transparent;padding: 0px; border: none'`
            : `style='display:inline-block; color:#ce0f69; font-size: 0.9em; background-color: transparent;padding: 0px; border: none'`)
    };

    // ==================================================
    // Logger
    // ==================================================

    const Logger = {
        log: (msg) => log(`${scriptName} | ${msg}`),
        debug: (msg) => { if (DEBUG) log(`${scriptName} [DEBUG] | ${msg}`); },
        error: (msg) => log(`${scriptName} [ERROR] | ${msg}`)
    };

    // ==================================================
    // State
    //
    // Pre-0.2.9 installs stored sheet/template/title/theText/sendToPlayers/
    // makeHandout/darkMode directly on state.Supernotes, with no version
    // field at all. State.initialize migrates that flat shape into config
    // the first time this version runs — preserving whatever the GM had
    // already chosen — then leaves it alone on later loads.
    // ==================================================

    const State = {
        initialize: () => {
            const existing = state[scriptName];

            if (!existing || existing.version !== schemaVersion) {
                Logger.log(`Updating Schema to v${schemaVersion}`);

                state[scriptName] = {
                    version: schemaVersion,
                    config: {
                        sheet: (existing && existing.sheet) || 'Default',
                        template: (existing && existing.template) || 'default',
                        title: (existing && existing.title) || 'name',
                        theText: (existing && existing.theText !== undefined) ? existing.theText : '',
                        sendToPlayers: (existing && existing.sendToPlayers !== undefined) ? existing.sendToPlayers : true,
                        makeHandout: (existing && existing.makeHandout !== undefined) ? existing.makeHandout : true,
                        darkMode: (existing && existing.darkMode !== undefined) ? existing.darkMode : false
                    }
                };
            }
        },

        config: () => state[scriptName].config
    };

    // ==================================================
    // Parser
    //
    // Chunks are split on "--"; several flags encode their value inline via
    // a pipe rather than a following token (--template|name,
    // --handout|Title|, --idTOKENID, --image3) — this grammar predates
    // --key/value style and is preserved exactly, since macros in live
    // campaigns depend on it.
    //
    // Each recognizer below owns one flag shape: `test` decides whether a
    // chunk is that flag, `apply` records it. A chunk no recognizer claims
    // is the command's "option" (--bio, --card, --tooltip, etc.) — last one
    // wins when more than one shows up.
    // ==================================================

    const ARGUMENT_FLAG_RECOGNIZERS = [
        {
            name: 'notitle',
            test: (chunk) => chunk === 'notitle',
            apply: (parsed) => { parsed.notitle = true; }
        },
        {
            name: 'id',
            test: (chunk) => chunk.includes('id-'),
            apply: (parsed, chunk) => { parsed.id = chunk.split(/id/)[1]; }
        },
        {
            name: 'handout',
            test: (chunk) => /handout\|.*?\|/.test(chunk),
            apply: (parsed, chunk) => { parsed.handoutTitle = chunk.match(/handout\|.*?\|/).toString().split('|')[1]; }
        },
        {
            name: 'template',
            test: (chunk) => chunk.includes('template|'),
            apply: (parsed, chunk) => { parsed.customTemplate = chunk.split(/\|/)[1]; }
        }
    ];

    const Parser = {

        parse: (content) => {
            const [command, ...flagChunks] = content.trim().split(/\s+--/);

            const parsed = {
                command,
                customTemplate: '',
                option: undefined,
                notitle: false,
                id: '',
                handoutTitle: ''
            };

            flagChunks.forEach(chunk => {
                const matches = ARGUMENT_FLAG_RECOGNIZERS.filter(r => r.test(chunk));

                if (matches.length > 0) {
                    matches.forEach(r => r.apply(parsed, chunk));
                } else {
                    parsed.option = chunk;
                }
            });

            return parsed;
        }
    };

    // ==================================================
    // Output — pure formatting helpers
    // ==================================================

    const decodeUnicode = (str) => str.replace(/%u[0-9a-fA-F]{2,4}/g, (m) => String.fromCharCode(parseInt(m.slice(2), 16)));

    const parseMarkdown = (markdownText) => {
        const htmlText = markdownText
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
            .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
            .replace(/\*(.*)\*/gim, '<i>$1</i>')
            .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
            .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>")
            .replace(/\n$/gim, '<br />');

        return htmlText.trim();
    };

    // Picks which bio image(s) to return for --image / --images / --imageN,
    // given an already-decoded character bio. Matches each <img ...> tag
    // individually (rather than one greedy match across all of them) so
    // any index works regardless of what text sits between the images.
    const pickCharacterArtwork = (decodedBio, option) => {
        const styledBio = decodedBio.replace(/<img /gi, "<img style = 'filter:none !important;' ");
        const images = styledBio.match(/<img[^>]*>/gi) || [];

        if (images.length === 0) {
            return 'No artwork exists for this character. Consider specifiying avatar.';
        }

        if (option === "images") {
            return images.join('');
        }

        let imageIndex = parseInt((option.match(/\d+/) || [])[0], 10);
        if (isNaN(imageIndex) || imageIndex < 1 || imageIndex > images.length) {
            imageIndex = 1;
        }

        return images[imageIndex - 1];
    };

    // Forces headers (<h1>-<h6>) in note/bio text to inherit the
    // surrounding box's text color, since Roll20's own chat/sheet CSS
    // otherwise gives them a fixed color that can be unreadable against a
    // dark template or a sheet's own dark-mode default template.
    const neutralizeHeadingColors = (html) => html.replace(
        /<(h[1-6])((?:\s+[^>]*)?)>/gi,
        (fullMatch, tag, attrs) => {
            if (/style\s*=/i.test(attrs)) {
                return `<${tag}${attrs.replace(/style\s*=\s*(['"])(.*?)\1/i, (m, quote, css) => `style=${quote}${css}; color: inherit !important;${quote}`)}>`;
            }
            return `<${tag}${attrs} style="color: inherit !important;">`;
        }
    );

    // True if html has any actual text once tags, &nbsp;, and whitespace
    // are stripped away — used to decide whether the GM-only whisper box
    // is worth showing at all. Content Roll20 itself hides
    // (style="display:none") is stripped first, since Roll20's rich text
    // editor auto-appends a hidden tracking block (a "TOKENHOME" div) to
    // GM Notes that would otherwise always count as "readable".
    const hasReadableText = (html) => html
        .replace(/<(div|span)[^>]*style\s*=\s*["'][^"']*display\s*:\s*none[^"']*["'][^>]*>[\s\S]*?<\/\1>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .trim().length > 0;

    // Matches a "-----" GM-only divider, including any block tag Roll20's
    // rich-text editor wraps around it when it's typed as its own line
    // (e.g. stored as "<div>-----</div>", not bare text) — matching the
    // whole wrapped divider as one unit keeps both halves well-formed HTML
    // instead of splitting through the middle of a tag. Falls back to
    // matching bare dashes when they aren't wrapped in anything.
    const GM_ONLY_DIVIDER = /(?:<(div|p)[^>]*>\s*)?-{5,}(?:\s*<\/\1>)?/i;

    // Splits note text on the GM-only divider: `before` is shown to
    // everyone, `after` is GM-only. With no divider present, `before` is
    // the whole text and `after` is empty.
    const splitGmOnlySection = (text) => {
        const match = text.match(GM_ONLY_DIVIDER);
        if (!match) {
            return { before: text, after: '' };
        }
        return {
            before: text.slice(0, match.index),
            after: text.slice(match.index + match[0].length)
        };
    };

    // Every extension Roll20 will auto-embed as an image, kept in one
    // place so every "is this url an image" check builds off it instead of
    // keeping its own copy.
    const IMAGE_EXTENSIONS = 'jpg|jpeg|png|gif|webm|webp';

    // [label](url) markdown is handled in two passes: any url that's
    // itself an image is turned into a real <img> tag directly (Roll20
    // does not auto-embed markdown placed inside a roll template's
    // {{key=value}} values — only plain typed/pasted chat text — so
    // Supernotes builds the tag itself rather than leaving that to Roll20);
    // whatever's left (ordinary links) becomes a plain clickable <a>. The
    // optional "?query"/"#fragment" after the extension matches Roll20's
    // own cache-busted, hosted image URLs.
    const IMAGE_MARKDOWN_LINK = new RegExp(`\\[([^\\]]*?)\\]\\(([^\\)]*?\\.(?:${IMAGE_EXTENSIONS})(?:\\?[^)]*)?(?:#[^)]*)?)\\)`, 'gi');
    const MARKDOWN_LINK = /\[([^\]]*?)\]\(([^\)]*?)\)/gim;

    // Does this HTML/text already contain an embedded image (an
    // <img src="...ext">, or [label](...ext) markdown, cache-buster
    // tolerated)? Used by --card to decide whether to prepend the token's
    // own portrait.
    const HAS_EMBEDDED_IMAGE = new RegExp(`\\.(?:${IMAGE_EXTENSIONS})(?:[?#][^\\s'"<>)]*)?`, 'i');

    // Replaces markdown image links with real <img> tags. imgStyle may be
    // '' for a bare <img src="..."> — chat/whisper output relies on
    // Roll20's own chat CSS to keep images from overflowing, same as the
    // existing --avatar/--tokenimage output.
    const embedMarkdownImages = (text, imgStyle) => (undefined !== text)
        ? text.replace(IMAGE_MARKDOWN_LINK, (full, alt, src) => `<img alt='${alt}' src='${src}'${imgStyle ? " style='" + imgStyle + "'" : ""}>`)
        : text;

    const cleanText = (text, buttonStyle) => {
        text = (undefined !== text)
            ? embedMarkdownImages(text, '').replace(MARKDOWN_LINK, "<a " + buttonStyle + "href='$2'>$1</a>").replace(/<p>/gm, "").replace(/<\/p>/gm, "<BR>").replace("padding:5px'></div><div>", "padding:5px'>")
            : "";
        text = text.replace('<a href=\"http://journal.roll20.net', '<a ' + buttonStyle + ' href=\"http://journal.roll20.net').replace('<a href=\"https://app.roll20.net', '<a ' + buttonStyle + ' href=\"https://app.roll20.net');
        text = text.replace('<a href=\"http', '<a ' + buttonStyle + ' href=\"http');
        text = text
            .replace(/\r?\n+/g, "<BR>")
            .replace(/<\s*br\s*\/?\s*>/gi, "<BR>")
            .replace(/(<BR>\s*){2,}/g, "<BR>")
            .trim();

        return text;
    };

    // ==================================================
    // Commands (Single Root)
    //
    // !gmnote / !pcnote / !selfnote stay three distinct top-level commands
    // (not folded into one "!supernotes --mode" root) since macros/buttons
    // in existing campaigns depend on those exact strings. All three funnel
    // through this one Commands.root dispatcher, and every button
    // Supernotes emits is itself a full command string, so there's one code
    // path for "typed" and "clicked".
    // ==================================================

    const Commands = {};

    Commands.config = (messagePrefix, template, title, theText, option) => {
        const cfg = State.config();
        const templateChoice = option.split('|')[1];

        if (templateChoice === undefined) {
            const message = 'Current sheet template:<BR><b>' + cfg.sheet + '</b><BR>Send to Players:<BR><b>' + cfg.sendToPlayers + '</b><BR><BR>Choose a template for Supernotes to use.<BR><BR>[Default Template - any sheet](!gmnote --config|default)<BR>[D&D 5th Edition by Roll20](!gmnote --config|dnd5e)<BR>[DnD 5e Shaped](!gmnote --config|5eshaped)<BR>[Pathfinder Community](!gmnote --config|pfcommunity)<BR>[Pathfinder by Roll20](!gmnote --config|pfofficial)<BR>[Pathfinder 2e by Roll20](!gmnote --config|pf2e)<BR>[Starfinder by Roll20](!gmnote --config|starfinder)<BR>[Call of Cthulhu 7th Edition by Roll20](!gmnote --config|callofcthulhu)<BR><BR>[Toggle Send to Players](!gmnote --config|sendtoPlayers)<BR>[Toggle Make Handout button](!gmnote --config|makeHandout)<BR>[Toggle Darkmode](!gmnote --config|darkMode)';
            sendChat('Supernotes', messagePrefix + '&{template:' + template + '}{{' + title + '=' + 'Config' + '}} {{' + theText + '=' + message + '}}');
            return;
        }

        switch (templateChoice) {
            case 'default':
                cfg.sheet = 'Default';
                cfg.template = 'default';
                cfg.title = 'name';
                cfg.theText = '';
                sendChat('Supernotes', '/w gm Supernotes set to Default roll template');
                break;
            case 'dnd5e':
                cfg.sheet = 'D&D 5th Edition by Roll20';
                cfg.template = 'npcaction';
                cfg.title = 'rname';
                cfg.theText = 'description';
                sendChat('Supernotes', '/w gm Supernotes set to ' + cfg.sheet);
                break;
            case '5eshaped':
                cfg.sheet = 'DnD 5e Shaped';
                cfg.template = '5e-shaped';
                cfg.title = 'title';
                cfg.theText = 'text_big';
                sendChat('Supernotes', '/w gm Supernotes set to ' + cfg.sheet);
                break;
            case 'pfcommunity':
                cfg.sheet = 'Pathfinder Community';
                cfg.template = 'pf_generic';
                cfg.title = 'name';
                cfg.theText = 'description';
                sendChat('Supernotes', '/w gm Supernotes set to ' + cfg.sheet);
                break;
            case 'pfofficial':
                cfg.sheet = 'Pathfinder by Roll20';
                cfg.template = 'npc';
                cfg.title = 'name';
                cfg.theText = 'descflag=1}} {{desc';
                sendChat('Supernotes', '/w gm Supernotes set to ' + cfg.sheet);
                break;
            case 'pf2e':
                // was mislabeled "Pathefinder 2e" — display label only, the
                // --config|pf2e flag itself is unchanged.
                cfg.sheet = 'Pathfinder 2e';
                cfg.template = 'rolls';
                cfg.title = 'header';
                cfg.theText = 'notes_show=[[1]]}} {{notes';
                sendChat('Supernotes', '/w gm Supernotes set to ' + cfg.sheet);
                break;
            case 'starfinder':
                cfg.sheet = 'Starfinder';
                cfg.template = 'sf_generic';
                cfg.title = 'title';
                cfg.theText = 'buttons0';
                sendChat('Supernotes', '/w gm Supernotes set to ' + cfg.sheet);
                break;
            case 'callofcthulhu':
                cfg.sheet = 'Call of Cthulhu 7th Edition by Roll20';
                cfg.template = 'callofcthulhu';
                cfg.title = 'title';
                cfg.theText = 'roll_bonus';
                sendChat('Supernotes', '/w gm Supernotes set to ' + cfg.sheet);
                break;
            case 'sendtoPlayers':
                cfg.sendToPlayers = !cfg.sendToPlayers;
                sendChat('Supernotes', '/w gm Send to Players set to ' + cfg.sendToPlayers);
                break;
            case 'makeHandout':
                cfg.makeHandout = !cfg.makeHandout;
                sendChat('Supernotes', '/w gm Make Handout button set to ' + cfg.makeHandout);
                break;
            case 'darkMode':
                cfg.darkMode = !cfg.darkMode;
                sendChat('Supernotes', '/w gm darkMode set to ' + cfg.darkMode);
                break;
            default:
                sendChat('Supernotes', `/w gm Supernotes: <code>${templateChoice}</code> isn't a recognized --config option. Use --config with no value to see the menu.`);
                break;
        }
    };

    Commands.help = () => {
        const HANDOUT_NAME = "Help: Supernotes";
        const HANDOUT_AVATAR = "https://files.d20.io/images/470559564/QxDbBYEhr6jLMSpm0x42lg/original.png?1767857147";

        const helpHtml = `
<h1>Supernotes</h1>
<p><span style="font-weight:normal;">Documentation for v.${version}</span></p>

<hr>

<h2>Overview</h2>

<p>
Supernotes pulls content from a token's <em>GM Notes</em> field and from other character fields not normally accessible to macros.
If a token represents a character, you may retrieve:
</p>

<ul>
<li>Character GM Notes</li>
<li>Character Bio</li>
<li>Character Avatar</li>
<li>Bio images (single, indexed, or all)</li>
<li>Token tooltip</li>
<li>Token image</li>
</ul>

<p>
Notes may be whispered to the GM, sent to all players, whispered to the sender, or written directly to a named handout.
A footer button may optionally appear on GM whispers, allowing the note to be forwarded to players.
</p>

<p>
Images, API command buttons, links, markdown image syntax <code>[x](imageURL)</code>, and most special characters pass through correctly in both chat and handouts.
</p>


<p><strong>Special Control Character for Inline GMnotes</strong></p>
<strong>-----</strong></p>
<p>Five dashes placed in the gmnotes of a token indicate that any following content is trested as gm-only text when sent to chat.
</p>

<hr>

<h2>Commands</h2>

<p><strong>!gmnote</strong>
Whispers note to GM.</p>

<p><strong>!pcnote</strong>
Sends note to all players.</p>

<p><strong>!selfnote</strong>
Whispers note to the command sender.</p>

<hr>

<h2>Parameters</h2>

<h3>Sources</h3>
<ul>
<li><strong>--token</strong>
Pull from selected token GM Notes (default). Token does not require a character.</li>

<li><strong>--charnote</strong>
Pull from represented character GM Notes.</li>

<li><strong>--bio</strong>
Pull from character Bio field.</li>

<li><strong>--avatar</strong>
Return character Avatar image.</li>

<li><strong>--image</strong>
Return first Bio image.</li>

<li><strong>--images</strong>
Return all Bio images.</li>

<li><strong>--image[number]</strong>
Return indexed Bio image (e.g. --image1, --image2).</li>

<li><strong>--tooltip</strong>
Return selected token tooltip.</li>

<li><strong>--tokenimage</strong>
Return selected token image.</li>

<li><strong>--card</strong>
Return token image and gmnotes in one report.</li>

<li><strong>--menu</strong>
Whisper a clickable menu of all the above, for the selected token(s). A GM sees a row of GM-whispering buttons and a row of player-facing buttons; anyone else sees only the player-facing row.</li>

</ul>

<h3>Options</h3>

<ul>
<li><strong>--notitle</strong>
Suppress title in chat output. May be added to any command in any order.</li>

<li><strong>--idTOKENID</strong>
Read notes from specific token ID. No space after --id. Example: <code>!gmnote --id-1234567890abcdef</code></li>

<li><strong>--handout|Handout Name|</strong>
Send output to named handout instead of chat.
Creates the handout if it does not exist.
Content above the automatic horizontal rule remains persistent.</li>


<li><strong>--help</strong>
Displays help.</li>

<li><strong>--config</strong>
Opens configuration dialog.</li>
</ul>

<hr>

<h2>Examples</h2>

<pre><code>!pcnote --bio</code></pre>
<p>Sends selected character Bio to all players.</p>

<pre><code>!gmnote --charnote</code></pre>
<p>Whispers character GM Notes to GM.</p>

<pre><code>!pcnote --image --notitle</code></pre>
<p>Sends first image without revealing title.</p>

<hr>

<h2>Templates</h2>

<p>
Add a template using:
</p>

<pre><code>--template|templatename</code></pre>

<p>
Example:
</p>

<pre><code>!gmnote --template|crt
!pcnote --template|notebook --bio
!pcnote --template|faraway --tokenimage</code></pre>

<p>
All templates include inline buttons and support Send to Players and Make Handout.
Handouts use Roll20's native styling for cross-platform reliability.
</p>

<hr>

<h3>Available Templates</h3>

<table style="width:100%; border-collapse:collapse; text-align:center;" border="1">
<tr>
<td><strong>generic</strong><div style="height:56px;">Just the facts, Ma'am. Nothing fancy here.</div><img src="https://files.d20.io/images/476231246/MaSnkvfTSYeLPhB1k1eFIw/original.png?1771312278"></td>
<td><strong>dark</strong><div style="height:56px;">As previous, but in reverse.</div><img src="https://files.d20.io/images/476231238/FXv82QZA8nwQwK2caOafXQ/original.png?1771312271"></td>
<td><strong>crt</strong><div style="height:56px;">Retro greenscreen for hacking and cyberpunk. Or for reports on that xenomorph hiding on your ship.</div><img src="https://files.d20.io/images/476231240/xlxLWtDh3sZsLiaTmZdDvw/original.png?1771312272"></td>
</tr>

<tr>
<td><strong>notebook</strong><div style="height:56px;">You know, for kids. Who like to ride bikes. Maybe they attend a school and solve mysteries.</div><img src="https://files.d20.io/images/476232399/DDyCwJrsCrDzxszjfuIqGQ/original.png?1771314689"></td>
<td><strong>gothic</strong><div style="height:56px;">Classic noire horror for contending with Universal monsters or maybe contending with elder gods.</div><img src="https://files.d20.io/images/476231248/eU24AoZbEVnq11joMJbO_w/original.png?1771312278"></td>
<td><strong>apoc</strong><div style="height:56px;">Messages scrawled on a wall. Crumbling and ancient, like the world that was.</div><img src="https://files.d20.io/images/476231241/HM9xFCyKe-mQQMHoA9QV0A/original.png?1771312274"></td>
</tr>

<tr>
<td><strong>scroll</strong><div style="height:56px;">High fantasy. Or low fantasy—we don't judge.</div><img src="https://files.d20.io/images/476231262/KEWXfStDBX82ce_PXgC4IA/original.png?1771312292"></td>
<td><strong>scroll2</strong><div style="height:56px;">An alternative to scroll, thats even scrollier.</div><img src="https://files.d20.io/images/476231263/fJqZlxUUL2wMtELdlNv0vA/original.png?1771312291"></td>
<td><strong>lcars</strong><div style="height:56px;">For opening hailing frequencies and to boldly split infinitives that no one has split before!</div><img src="https://files.d20.io/images/476231251/ZGlO2nETmK7GdrkY1zumnQ/original.png?1771312280"></td>
</tr>

<tr>
<td><strong>faraway</strong><div style="height:56px;">No animated title crawl, but still has that space wizard feel.</div><img src="https://files.d20.io/images/476231245/lY3_AuI9XmbogxHBhnQrEQ/original.png?1771312276"></td>
<td><strong>steam</strong><div style="height:56px;">Gears and brass have changed my life.</div><img src="https://files.d20.io/images/476231264/woEpZs-31xlsK8SnAVmZ1Q/original.png?1771312292"></td>
<td><strong>western</strong><div style="height:56px;">Return with us now to those thrilling days of yesteryear.</div><img src="https://files.d20.io/images/476231271/aDY3SfSfpbggLzIgCi-g9g/original.png?1771312299"></td>
</tr>

<tr>
<td><strong>dragon</strong><div style="height:56px;">Three-fivey style</div><img src="https://files.d20.io/images/476231237/90_t4YIPvWhSaZPdytxLGA/original.png?1771312272"></td>
<td><strong>wizard</strong><div style="height:56px;">A fifth edition of templates.</div><img src="https://files.d20.io/images/476231274/GA3WOxhk4ZBINMO_l93low/original.png?1771312299"></td>
<td><strong>strange</strong><div style="height:56px;">Other kids who ride bikes and play D&amp;D.</div><img src="https://files.d20.io/images/476231265/2P75LynFj6QfgIQvXiA3Ow/original.png?1771312292"></td>
</tr>

<tr>
<td><strong>gate3</strong><div style="height:56px;">For folks who like the GOTY based on D&amp;D.</div><img src="https://files.d20.io/images/476231247/gVC235_6Fgn4XCyCJfn-hg/original.png?1771312279"></td>
<td><strong>choices</strong><div style="height:56px;">A second gate-y style, suitable for for the same crowd.</div><img src="https://files.d20.io/images/476231239/CbVwgDupLta21aSna-ntSw/original.png?1771312270"></td>
<td><strong>roll20light</strong><div style="height:56px;">for when you want your notes to have the feeling of authority</div><img src="https://files.d20.io/images/476231259/iTXk_nSdNYvTWLIV9KubSA/original.png?1771312286"></td>
</tr>

<tr>
<td><strong>roll20dark</strong><div style="height:56px;">As before, but.... dark</div><img src="https://files.d20.io/images/476231258/DCdbh_mFj3LtnMxmwj3FwA/original.png?1771312287"></td>
<td><strong>news</strong><div style="height:56px;">Extra! Extra! Read all about it! The ink bleeds through from the other side of the newsprint.</div><img src="https://files.d20.io/images/476231254/Qkrunhj637kmQ3l3BKFtMw/original.png?1771312282"></td>
<td><strong>treasure</strong><div style="height:56px;">For listing all that loot.</div><img src="https://files.d20.io/images/476231268/7B11wl4kxn41lv8CtoXG3Q/original.png?1771312294"></td>
</tr>

<tr>
<td><strong>vault</strong><div style="height:56px;">A comforting style for sheltered people.</div><img src="https://files.d20.io/images/476231270/orY8UFw30iCPkZOvgPDIrA/original.png?1771312299"></td>
<td><strong>path</strong><div style="height:56px;">A style that works well with PF2 Adventure Paths</div><img src="https://files.d20.io/images/476231257/lFaSgWDZJivDtn9WkogS5w/original.png?1771312286"></td>
<td><strong>osrblue</strong><div style="height:56px;">Gygax-approved. Maybe. The graph paper even has yellowed edges</div><img src="https://files.d20.io/images/476231255/mpuSIYbfrYnCR9cxwJeK7g/original.png?1771312285"></td>
</tr>

<tr>
<td><strong>roman</strong><div style="height:56px;">Hail Caesar!</div><img src="https://files.d20.io/images/476231260/GEUPPczk_lEx9JE6wxq0Cw/original.png?1771312288"></td>
<td><strong>dark55</strong><div style="height:56px;">A style to complement the D&D 5.5e (2024) Sheet dark mode</div><img src="https://files.d20.io/images/485186667/f0H5QuQv4KDT9Lm8VZnzgA/original.png?1777483966"></td>
<td><strong>light55</strong><div style="height:56px;">A style to complement the D&D 5.5e (2024) Sheet light mode</div><img src="https://files.d20.io/images/485186668/7F7nWgCIRPfs1twOmiFUMw/original.png?1777483966"></td>
</tr>
</table>

<hr>

<h2>Configuration</h2>

<p>
On installation, Supernotes defaults to the Default roll template.
The configuration dialog allows you to:
</p>

<ul>
<li>Select a sheet roll template</li>
<li>Toggle the "Send to Players" footer button</li>
</ul>

<p>
Supported sheet templates include:
</p>

<ul>
<li>Default Template</li>
<li>D&amp;D 5th Edition by Roll20</li>
<li>5e Shaped</li>
<li>Pathfinder by Roll20</li>
<li>Pathfinder Community</li>
<li>Pathfinder 2e by Roll20</li>
<li>Starfinder</li>
</ul>

<hr>

<h3>Troubleshooting</h3>

<p>
If you experience template issues or configuration problems, you may use the buttons below to restore default behavior or re-open the configuration dialog.
</p>

<div style="margin:10px 0;">


<a href="!gmnote --config|default"
style="display:inline-block;
padding:6px 10px;
margin-right:8px;
background:#444;
color:#FFF;
text-decoration:none;
border-radius:4px;">
Restore Default Template
</a>

<a href="!gmnote --config"
style="display:inline-block;
padding:6px 10px;
background:#666;
color:#FFF;
text-decoration:none;
border-radius:4px;">
Re-Run Configuration
</a>

</div>

<p style="font-size:0.9em;">
<em>Restore Default Template</em> resets Supernotes to the Default roll template.<br>
<em>Re-Run Configuration</em> opens the configuration dialog to select a sheet template and toggle footer options.
</p>

`;

        let handout = findObjs({
            _type: "handout",
            name: HANDOUT_NAME
        })[0];

        if (!handout) {
            handout = createObj("handout", {
                name: HANDOUT_NAME,
                archived: false
            });
        }

        handout.set({
            notes: helpHtml,
            avatar: HANDOUT_AVATAR
        });

        const link = `http://journal.roll20.net/handout/${handout.get("_id")}`;

        const box =
            `<div style="background:#111; padding:10px; border:1px solid #555; border-radius:6px; color:#eee;">` +
            `<div style="font-size:110%; font-weight:bold; margin-bottom:5px;">Supernotes Help</div>` +
            `<a href="${link}" target="_blank" style="color:#00d4ff; font-weight:bold;">Open Help Handout</a>` +
            `</div>`;

        sendChat("Supernotes", `/w gm ${box}`, null, { noarchive: true });
    };

    Commands.root = (msg) => {
        const parsed = Parser.parse(msg.content);
        const { customTemplate, notitle, id, handoutTitle } = parsed;
        let option = parsed.option;

        const command = parsed.command;
        const sender = msg.who;
        const senderID = msg.playerid;
        const isGM = playerIsGM(senderID);

        let messagePrefix = '/w gm ';
        if (command === '!pcnote') {
            messagePrefix = '';
        }
        if (command === '!selfnote') {
            messagePrefix = '/w ' + sender + ' ';
        }


        // ---- Resolve the token(s) this command applies to ----
        // Targets are resolved lazily, per-option, via resolveTargets()
        // below; a target that doesn't resolve to a real graphic (deleted
        // token, stale --id) is simply skipped rather than crashing.
        const selectedObject = msg.selected;
        const theToken = id ? [{ "_id": id, "type": "graphic" }] : selectedObject;

        // ---- Resolve active sheet-template / footer config ----
        const cfg = State.config();
        const template = cfg.template;
        const title = cfg.title;
        const theText = cfg.theText;
        const sendToPlayers = cfg.sendToPlayers;
        const makeHandout = cfg.makeHandout || false;
        const darkMode = cfg.darkMode || false;
        const whisperStyle = CSS.whisperStyle(darkMode);
        const buttonstyle = CSS.buttonStyle(darkMode);

        // ---- deliver(): renders one report, either to chat or to a handout ----
        const deliver = (whom, message, tokenIdForButtons, playerButton, handoutButton) => {
            handoutButton = (handoutButton) ? handoutButton.replace(/NamePlaceholder/, whom) : handoutButton;

            if (message === "" && option.match(/^(bio|charnote|token|tooltip)/)) {
                message = `The information does not exist for the <code>${option}</code> option`;
            }

            if (handoutTitle === '') {
                // Applied before the GM-only split below so it covers both
                // the visible message and the GM-only whisper.
                message = neutralizeHeadingColors(message);

                let whisper = '';

                if (isGM) {
                    const split = splitGmOnlySection(message);
                    whisper = split.after;
                    message = split.before;
                }

                if (customTemplate.length > 0) {
                    let chosenTemplate = templates.generic;
                    switch (customTemplate) {
                        case "crt": chosenTemplate = templates.crt; break;
                        case "dark": chosenTemplate = templates.dark; break;
                        case "roll20light": chosenTemplate = templates.roll20light; break;
                        case "roll20dark": chosenTemplate = templates.roll20dark; break;
                        case "scroll": chosenTemplate = templates.scroll; break;
                        case "scroll2": chosenTemplate = templates.scroll2; break;
                        case "vault": chosenTemplate = templates.vault; break;
                        case "osrblue": chosenTemplate = templates.osrblue; break;
                        case "lcars": chosenTemplate = templates.lcars; break;
                        case "faraway": chosenTemplate = templates.faraway; break;
                        case "strange": chosenTemplate = templates.strange; break;
                        case "gothic": chosenTemplate = templates.gothic; break;
                        case "western": chosenTemplate = templates.western; break;
                        case "dragon": chosenTemplate = templates.dragon; break;
                        case "wizard": chosenTemplate = templates.wizard; break;
                        case "path": chosenTemplate = templates.path; break;
                        case "treasure": chosenTemplate = templates.treasure; break;
                        case "steam": chosenTemplate = templates.steam; break;
                        case "gate3": chosenTemplate = templates.gate3; break;
                        case "choices": chosenTemplate = templates.choices; break;
                        case "apoc": chosenTemplate = templates.apoc; break;
                        case "news": chosenTemplate = templates.news; break;
                        case "roman": chosenTemplate = templates.roman; break;
                        case "notebook": chosenTemplate = templates.notebook; break;
                        case "dark55": chosenTemplate = templates.dark55; break;
                        case "light55": chosenTemplate = templates.light55; break;
                        case "bob": break;
                        default: chosenTemplate = templates.generic; break;
                    }

                    playerButton = playerButton.split('\n')[1];
                    playerButton = (undefined !== playerButton) ? playerButton.replace(/\[(.*?)\]\((.*?)\)/gim, "<a " + chosenTemplate.playerbuttonstyle + "href='$2'>$1</a>") : "";
                    handoutButton = (undefined !== handoutButton) ? handoutButton.replace(/\[(.*?)\]\((.*?)\)/gim, "<a " + chosenTemplate.handoutbuttonstyle + "href='$2'>$1</a>").replace(" | <a", "<a") : "";

                    whisper = hasReadableText(whisper) ? "<div style =" + chosenTemplate.whisperStyle + ">" + whisper + "</div>" : "";

                    message = cleanText(message, chosenTemplate.buttonstyle);
                    whisper = cleanText(whisper, chosenTemplate.whisperbuttonstyle);
                    whisper = whisper.replace(/<\/span><BR>/i, "")
                        .replace(/<BR><span style=.*?>/i, '<span>')
                        .replace(/<BR><p style=.*?>/i, '<p>')
                        .replace(/(<p>|<\/p>)/, '')
                        .replace(/><BR>/i, '>');

                    if (command === '!pcnote') {
                        return sendChat(whom, messagePrefix + chosenTemplate.boxcode + chosenTemplate.titlecode + whom + chosenTemplate.textcode + message + '</div></div>' + chosenTemplate.footer + '</div>');
                    } else {
                        return sendChat(whom, messagePrefix + chosenTemplate.boxcode + chosenTemplate.titlecode + whom + chosenTemplate.textcode + message + whisper + chosenTemplate.buttonwrapper + playerButton + chosenTemplate.buttondivider + handoutButton + '</div></div></div>' + chosenTemplate.footer + '</div>');
                    }

                } else {
                    playerButton = (undefined !== playerButton) ? playerButton.replace(MARKDOWN_LINK, "<a " + buttonstyle + "href='$2'>$1</a>") : "";
                    handoutButton = (undefined !== handoutButton) ? handoutButton.replace(MARKDOWN_LINK, "<a " + buttonstyle + "href='$2'>$1</a>") : "";

                    // This default-template path never runs message/whisper
                    // through cleanText(), so image markdown is embedded
                    // directly here instead. Readability is decided BEFORE
                    // that conversion, since an image-only whisper would
                    // otherwise look "empty" once its brackets are gone.
                    const whisperHasContent = hasReadableText(whisper);
                    message = embedMarkdownImages(message, '');
                    whisper = embedMarkdownImages(whisper, '');
                    whisper = whisperHasContent ? "<div style =" + whisperStyle + ">" + whisper + "</div>" : "";
                    return sendChat(whom, messagePrefix + '&{template:' + template + '}{{' + title + '=' + whom + '}} {{' + theText + '=' + message + whisper + playerButton + handoutButton + '}}');
                }

            } else {
                let noteHandout = findObjs({ type: 'handout', name: handoutTitle });
                noteHandout = noteHandout ? noteHandout[0] : undefined;

                if (!noteHandout) {
                    noteHandout = createObj('handout', {
                        name: handoutTitle,
                        archived: false,
                        inplayerjournals: "",
                        controlledby: ""
                    });
                    const noteHandoutId = noteHandout.get("_id");
                    sendChat('Supernotes', `/w gm Supernotes has created a handout named <b>${handoutTitle}</b>. <BR>Click <a href="http://journal.roll20.net/handout/${noteHandoutId}">here</a> to open.`, null, { noarchive: true });
                }

                if (noteHandout) {
                    playerButton = '<BR><a href = "&#96;' + msg.content.replace(/!(gm|self)/, "!pc").replace(/\s(--|)handout\|.*\|/, "") + '">Send to Players in Chat</a>';
                    if (makeHandout) {
                        handoutButton = ((playerButton) ? ' | ' : '<BR>') + '<a href = "&#96;' + '!gmnote --id' + tokenIdForButtons + ' --handout|' + whom + '|">Make Handout</a>';
                    }

                    message = embedMarkdownImages(message, 'max-width:100%; max-height: 200px; float:right; padding-top:0px; margin-bottom:5px; margin-left:5px');
                    message = message.replace(MARKDOWN_LINK, '<a href="$2">$1</a>');
                    message = message.replace(/<img(.*)<(\/|)br(\/|)>/g, `<img$1`);

                    message = isGM ? message : splitGmOnlySection(message).before;

                    message = parseMarkdown(message);

                    // Declared fresh per call so a player/self-note never
                    // inherits stale GM-only text from an earlier, unrelated
                    // !gmnote call.
                    let gmnote = '';
                    if (isGM) {
                        const split = splitGmOnlySection(message);
                        gmnote = split.after;
                        message = split.before;
                    }

                    noteHandout.get("notes", (notes) => {
                        if (notes.match(/float:right; color:#aaa;'>\(\d*\)/)) {
                            const reportCount = notes.match(/(?<=<span style = 'float:right; color:#aaa;'>\()\d+/);
                            let newHeight = reportCount * 20;
                            if (newHeight > 500) { newHeight = 500; }
                            if (newHeight < 200) { newHeight = 200; }
                            message = message.replace(/201px/, newHeight + 'px');
                        }

                        if (notes.includes('<!---End Report--->')) {
                            if (notes.includes('!report')) {
                                notes = notes.split('<!---End Report--->')[0] + '<!---End Report--->';
                            } else {
                                notes = notes.split(/<hr>/i)[0] + '<!---End Report--->';
                            }
                        } else {
                            playerButton = '';
                            handoutButton = '';
                            notes = '';
                        }

                        noteHandout.set("gmnotes", gmnote);
                        noteHandout.set("notes", notes + "<h3>" + whom + "</h3>" + message + playerButton + handoutButton);
                    });
                } else {
                    sendChat('Supernotes', whom + `No handout named ${handoutTitle} was found.`, null, { noarchive: true });
                }
            }
        };

        // ---- Dispatch ----

        if (option !== undefined && option.includes('config')) {
            Commands.config(messagePrefix, template, title, theText, option);
            return;
        }

        if (option !== undefined && option.includes('help')) {
            Commands.help();
            return;
        }

        if (!(option + '').match(/^(card|bio|charnote|tokenimage|tooltip|avatar|menu|imag(e|es|e[1-9]))/)) {
            option = 'token';
        }

        // Builds the "Send to Players" / "Make Handout" button pair for one
        // report line, targeting a specific token id. Called per selected
        // token so each line's buttons point at that line's own token.
        const buildButtons = (btnTokenID) => {
            let pb = '';
            if (sendToPlayers && (command === '!gmnote' || command === '!selfnote')) {
                pb = '\n[Send to Players](' + msg.content.replace(/!(gm|self)/, "!pc") + ' --id' + btnTokenID + ')';
            }

            let hb = '';
            if (makeHandout && (command.includes('gmnote') || command.includes('selfnote'))) {
                hb = ((pb) ? ' | ' : '<BR>') + '[Make Handout](' + msg.content.replace(/!(pc|self)/, "!gm") + ' --id' + btnTokenID + ' --handout|NamePlaceholder|)';
            }

            return { playerButton: pb, handoutButton: hb };
        };

        // Finishes one target's report: applies --notitle, builds that
        // token's own Send-to-Players/Make-Handout buttons, and hands the
        // result to deliver().
        const sendReport = (tokenId, whom, message) => {
            const buttons = buildButtons(tokenId);
            deliver(notitle ? '' : whom, message, tokenId, buttons.playerButton, buttons.handoutButton);
        };

        // !pcnote and !selfnote never show the GM-only tail of a note (the
        // part after a "-----" marker); !gmnote's own whisper-only handling
        // of that section happens separately, inside deliver().
        const stripGmOnlySectionForPlayers = (message) => {
            if (command !== '!pcnote' && command !== '!selfnote') {
                return message;
            }
            return splitGmOnlySection(message).before;
        };

        // Resolves each targeted token to its graphic object and, when
        // requireCharacter is true, the character it represents — dropping
        // any target that can't be resolved (a deleted token, a stale
        // --id, or, when requireCharacter, a token with no character).
        const resolveTargets = (requireCharacter) => {
            const graphics = (theToken || [])
                .map(sel => getObj('graphic', sel._id))
                .filter(g => undefined !== g);

            if (!requireCharacter) {
                return graphics.map(g => ({ g }));
            }

            return graphics
                .map(g => ({ g, c: getObj('character', g.get('represents')) }))
                .filter(({ c }) => undefined !== c);
        };

        // Whispers an explanation to whoever ran the command when an
        // option had no target at all to report on (nothing selected, a
        // bad/deleted --id, or no represented character), rather than
        // failing silently.
        const explainNoTargets = (thisOption, requireCharacter) => {
            const graphics = (theToken || [])
                .map(sel => getObj('graphic', sel._id))
                .filter(g => undefined !== g);

            let reason;
            if (!theToken || theToken.length === 0) {
                reason = 'No token is selected, and no valid <code>--id</code> was given.';
            } else if (graphics.length === 0) {
                reason = id
                    ? `No token could be found with id <code>${id}</code>. It may have been deleted, or the id may be mistyped.`
                    : 'The selected token(s) could not be found — they may have been deleted.';
            } else if (requireCharacter) {
                reason = `The selected token(s) don't represent a character, and <code>--${thisOption}</code> needs one that does.`;
            } else {
                reason = `Nothing to report for <code>--${thisOption}</code>.`;
            }

            sendChat('Supernotes', `/w ${sender} Supernotes: ${reason}`, null, { noarchive: true });
        };

        // --menu: a compact, clickable options grid for one or more
        // selected tokens, covering every reporting option. Each button is
        // a real <a href='!command ...'> tag (not markdown left for later
        // conversion) so it renders under both the custom-template and
        // default-template paths, and embeds --id<tokenID> so it keeps
        // working after the token is deselected. A GM sees both a "To GM"
        // and a "To Players" row; anyone else sees only "To Players".
        if (option === 'menu') {
            const targets = resolveTargets(false);
            if (targets.length === 0) { explainNoTargets(option, false); return; }

            const MENU_ITEMS = [
                { label: 'Note', flag: '' },
                { label: 'Bio', flag: ' --bio' },
                { label: 'Char-gm', flag: ' --charnote' },
                { label: 'Avatar', flag: ' --avatar' },
                { label: 'Image', flag: ' --image' },
                { label: 'Images', flag: ' --images' },
                { label: 'Token', flag: ' --tokenimage' },
                { label: 'Tooltip', flag: ' --tooltip' },
                { label: 'Card', flag: ' --card' },
            ];

            const buildMenuRow = (cmd, tokenID) => MENU_ITEMS
                .map(({ label, flag }) => "<a " + buttonstyle + "href='" + cmd + flag + " --id" + tokenID + "'>" + label + "</a>")
                .join(' | ');

            targets.forEach(({ g }) => {
                const tokenID = g.get('_id');
                const rows = [];
                if (isGM) {
                    rows.push('<b>To GM</b><BR>' + buildMenuRow('!gmnote', tokenID));
                }
                rows.push('<b>To Players</b><BR>' + buildMenuRow('!pcnote', tokenID));

                sendReport(tokenID, g.get('name'), rows.join('<BR><BR>'));
            });
            return;
        }

        if (option === 'card') {
            const targets = resolveTargets(false);
            if (targets.length === 0) { explainNoTargets(option, false); return; }

            targets.forEach(({ g }) => {
                const rawGM = g.get('gmnotes') || '';
                let message = stripGmOnlySectionForPlayers(rawGM ? unescape(decodeUnicode(rawGM)) : '');

                if (!HAS_EMBEDDED_IMAGE.test(message)) {
                    const styledTokenImage = `<img src="${g.get('imgsrc')}" style="position:relative; top:-15px; float:right; width:100px; margin:0px 0px 3px 5px;">`;
                    message = styledTokenImage + (message || '<br><br>');
                }

                sendReport(g.get('_id'), g.get('name') || '', message);
            });
            return;
        }

        if (option === 'tooltip') {
            // Requires a represented character, though the tooltip text
            // itself still comes from the token, not the character.
            const targets = resolveTargets(true);
            if (targets.length === 0) { explainNoTargets(option, true); return; }

            targets.forEach(({ g }) => {
                sendReport(g.get('_id'), g.get('name'), g.get('tooltip'));
            });
            return;
        }

        if (option === 'tokenimage') {
            const targets = resolveTargets(false);
            if (targets.length === 0) { explainNoTargets(option, false); return; }

            targets.forEach(({ g }) => {
                const imgsrc = g.get('imgsrc');
                const message = imgsrc ? "<img src='" + imgsrc + "'>" : 'No image is set for this token.';
                sendReport(g.get('_id'), g.get('name'), message);
            });
            return;
        }

        if (option === 'avatar') {
            const targets = resolveTargets(true);
            if (targets.length === 0) { explainNoTargets(option, true); return; }

            targets.forEach(({ g, c }) => {
                const avatar = c.get('avatar');
                const message = avatar ? "<img src='" + avatar + "'>" : 'No avatar image is set for this character.';
                sendReport(g.get('_id'), c.get('name'), message);
            });
            return;
        }

        if (option.match(/^imag(e|es|e[1-9])/)) {
            const targets = resolveTargets(true);
            if (targets.length === 0) { explainNoTargets(option, true); return; }

            targets.forEach(({ g, c }) => c.get('bio', (val) => {
                const message = (null !== val && 'null' !== val && val.length > 0)
                    ? pickCharacterArtwork(decodeUnicode(val), option)
                    : 'No artwork exists for this character. Consider specifiying avatar.';
                sendReport(g.get('_id'), c.get('name'), message);
            }));
            return;
        }

        if (option === 'bio' || option === 'charnote') {
            const suboption = (option === 'charnote') ? 'gmnotes' : 'bio';
            const targets = resolveTargets(true);
            if (targets.length === 0) { explainNoTargets(option, true); return; }

            targets.forEach(({ g, c }) => c.get(suboption, (val) => {
                const whom = c.get('name');

                if (null !== val && 'null' !== val && val.length > 0) {
                    sendReport(g.get('_id'), whom, stripGmOnlySectionForPlayers(decodeUnicode(val)));
                } else {
                    sendReport(g.get('_id'), whom, `The information does not exist for the <code>${option}</code> option`);
                }
            }));
            return;
        }

        // default ('token') option — GM Notes straight off the selected
        // token(s). One message per selected token; a token with no GM
        // Notes gets an explanatory message instead of being silently
        // skipped.
        {
            const targets = resolveTargets(false);
            if (targets.length === 0) { explainNoTargets(option, false); return; }

            targets.forEach(({ g }) => {
                const gm = g.get('gmnotes');
                const message = (gm && gm.length > 0)
                    ? stripGmOnlySectionForPlayers(unescape(decodeUnicode(gm)))
                    : 'No GM Notes exist for this token.';
                sendReport(g.get('_id'), g.get('name'), message);
            });
        }
    };

    // ==================================================
    // Event Handling
    // ==================================================

    const handleInput = (msg) => {
        if (msg.type !== 'api') return;
        if (!msg.content.match(/^!(gm|pc|self)note\b/)) return;
        Commands.root(msg);
    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
    };

    // ==================================================
    // Initialization
    // ==================================================

    const sendWelcomeMessage = () => {
        const cfg = State.config();
        const message = 'Welcome to Supernotes! If this is your first time running it, the script is set to use the Default Roll Template. You can choose a different sheet template below, as well as decide whether you want the script to display a "Send to Players" footer at the end of every GM message. It is currently set to true.<BR><BR>[Default Template - any sheet](!gmnote --config|default)<BR>[D&D 5th Edition by Roll20](!gmnote --config|dnd5e)<BR>[DnD 5e Shaped](!gmnote --config|5eshaped)<BR>[Pathfinder by Roll20](!gmnote --config|pfofficial)<BR>[Pathfinder Community](!gmnote --config|pfcommunity)<BR>[Pathfinder 2e by Roll20](!gmnote --config|pf2e)<BR>[Starfinder by Roll20](!gmnote --config|starfinder)<BR>[Call of Cthulhu 7th Edition by Roll20](!gmnote --config|callofcthulhu)<BR><BR>[Toggle Send to Players](!gmnote --config|sendtoPlayers)';
        sendChat('Supernotes', '/w gm &{template:' + cfg.template + '}{{' + cfg.title + '=' + 'Config' + '}} {{' + cfg.theText + '=' + message + '}}');
    };

    const checkInstall = () => {
        const isFirstRun = !state[scriptName];

        State.initialize();

        if (isFirstRun) {
            sendWelcomeMessage();
        }

        Logger.log(`v${version} is ready! To set the template of choice or to toggle the send to players option, use the command !gmnote --config`);
        return true;
    };

    on('ready', () => {
        if (checkInstall()) {
            registerEventHandlers();
        }
    });

    // ==================================================
    // Public Interface
    // ==================================================

    return {};

})();
