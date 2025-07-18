// Daggerheart Fear Points Tracker (Card Style, Max Cap, No Token Needed, Set Command)
// Version 1.0 – May 2025
// Author: Kim Jacobsen
//
// Description:
// Tracks Fear Points for a single character with immersive chat cards.
// Works without needing a token or custom character sheet.
//
// 📌 Setup Instructions:
// 1. Create a character in your Roll20 Journal with the exact name below:
//    let characterName = "Kim the Brave"; // <-- Change this if needed
// 2. The script will automatically create an attribute called "fear_points".
//
// 🛠️ Customization:
// - Change the name in `characterName` to target another character
// - Change `MAX_FEAR` to increase or decrease the fear cap
//
// 💬 Chat Commands:
// !fear +2        → Add 2 fear points
// !fear -1        → Remove 1 fear point
// !fear set 5     → Set fear points to exactly 5
// !fear show      → Display current fear points
//
// 🧠 Tip: You can create macros or abilities for these commands
//        for easier in-game use.

on('chat:message', function(msg) {
    if (msg.type !== 'api') return;
    if (!msg.content.startsWith('!fear')) return;

    let args = msg.content.split(' ');
    let cmd = args[1] || 'show';
    let amount = parseInt(args[1], 10);

    // Set your maximum here!
    const MAX_FEAR = 12;

    // Always use the same character (set your character's name here)
    let characterName = "Kim the Brave";
    let character = findObjs({ type: 'character', name: characterName })[0];

    if (!character) {
        sendChat('Fear Points', '/w "' + msg.who + '" Character sheet not found! Please check the name in the script.');
        return;
    }

    let attr = findObjs({ type: 'attribute', characterid: character.id, name: 'fear_points' })[0];

    if (!attr) {
        attr = createObj('attribute', {
            characterid: character.id,
            name: 'fear_points',
            current: 0
        });
    }
    let current = parseInt(attr.get('current'), 10) || 0;

    function fearCard(title, body, total, maxed = false) {
        return `/direct <div style="border: 2px solid #c53030; border-radius: 10px; background: #fff8b3; padding: 10px 20px; color: #1a1a1a; box-shadow: 0 2px 10px #c5303030; max-width: 350px;">
            <div style="font-size:1.2em; font-weight:bold; color: #b7791f; letter-spacing:1px; margin-bottom: 3px;">
                😱 ${title}
            </div>
            <div style="font-size:1em; margin-bottom:5px;">
                ${body}
                ${maxed ? "<div style='color:#c53030;font-weight:bold;'>⚠️ Maximum Fear reached!</div>" : ""}
            </div>
            <div style="font-size:1.1em; font-weight:bold; color:#b7791f; text-align:right;">
                Total: <span style="font-size:1.4em; color: #c53030;">${total}</span> / ${MAX_FEAR}
            </div>
        </div>`;
    }

    if (cmd === 'set' && !isNaN(args[2])) {
        let setTo = Math.max(0, Math.min(parseInt(args[2], 10), MAX_FEAR));
        attr.set('current', setTo);
        sendChat('Fear Points', fearCard(
            character.get('name') + "'s Fear Points Set!",
            `Fear Points set to <b>${setTo}</b>.`,
            setTo,
            setTo === MAX_FEAR
        ));
    } else if (cmd === 'show' || isNaN(amount)) {
        sendChat('Fear Points', fearCard(
            character.get('name') + "'s Fear Points",
            `You currently have <b>${current}</b> Fear Point${current === 1 ? '' : 's'}.`,
            current,
            current >= MAX_FEAR
        ));
    } else if (amount > 0) {
        let newTotal = Math.min(current + amount, MAX_FEAR);
        attr.set('current', newTotal);
        sendChat('Fear Points', fearCard(
            character.get('name') + ' Gained Fear!',
            `Gained <b>${Math.min(amount, MAX_FEAR - current)}</b> Fear Point${Math.min(amount, MAX_FEAR - current) === 1 ? '' : 's'}!`,
            newTotal,
            newTotal === MAX_FEAR
        ));
    } else if (amount < 0) {
        let newTotal = Math.max(0, current + amount);
        attr.set('current', newTotal);
        sendChat('Fear Points', fearCard(
            character.get('name') + ' Lost Fear',
            `Lost <b>${Math.abs(amount)}</b> Fear Point${Math.abs(amount) === 1 ? '' : 's'}.`,
            newTotal
        ));
    }
});
