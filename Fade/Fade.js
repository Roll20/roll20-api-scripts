var API_Meta = API_Meta||{};
API_Meta.Fade={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.Fade.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-3);}}

// Fade — Smooth opacity fading for Roll20 graphics
// !fade --in[|time] [--all]
// !fade --out[|time] [--all]

on('ready', () => {

        const version = '1.0.0'; //version number set here
        log('-=> Fade v' + version + ' is loaded. Command !fade --|<in/out>|<number of seconds> <--all>.');


on('chat:message', (msg) => {
    if (msg.type !== 'api' || !msg.content.startsWith('!fade')) return;

    const player = getObj('player', msg.playerid);
    const args = msg.content.split(/\s+--/).slice(1).map(a => a.trim()); //better


    const FADE_STEPS = 20;
    let activeIntervals = [];

    // Parse arguments
    let fadeIn = false;
    let fadeOut = false;
    let fadeTime = 1;
    let affectAll = false;

    args.forEach(arg => {
        const [keyRaw, valueRaw] = arg.split('|');
        const key = (keyRaw || '').trim().toLowerCase();
        const value = valueRaw ? valueRaw.trim() : undefined;

        if (key === 'in') {
            fadeIn = true;
            fadeTime = value ? parseFloat(value) : 1;
        } else if (key === 'out') {
            fadeOut = true;
            fadeTime = value ? parseFloat(value) : 1;
        } else if (key === 'all') {
            affectAll = true;
        }
    });
    // Defensive checks
    if (!fadeIn && !fadeOut) {
        sendChat('Fade', `/w "${player.get('displayname')}" You must specify --in or --out.`);
        return;
    }

    const targetOpacity = fadeIn ? 1.0 : 0.0;
let pageId =
    (player && player.get('lastpage')) ||
    Campaign().get('playerpageid');

    if (!affectAll && (!msg.selected || msg.selected.length === 0)) {
        sendChat('Fade', `/w "${player.get('displayname')}" No graphics selected. Use --all to affect the entire page.`);
        return;
    }

if (affectAll && !pageId) {
    sendChat('Fade', `/w "${player.get('displayname')}" Could not determine current page.`);
    return;
}


    // Collect target graphics
    let targets = affectAll
        ? findObjs({ _pageid: pageId, _type: 'graphic' }) || []
        : msg.selected
            .map(sel => getObj(sel._type, sel._id))
            .filter(obj => obj && obj.get('type') === 'graphic');

    if (targets.length === 0) {
        sendChat('Fade', `/w "${player.get('displayname')}" No valid graphics found to fade.`);
        return;
    }

    const stepInterval = (fadeTime * 1000) / FADE_STEPS;

    // Stop any active fades
    activeIntervals.forEach(interval => clearInterval(interval));
    activeIntervals = [];

    // Precompute fixed per-graphic fade steps
    const fadeData = targets.map(g => {
        const start = parseFloat(g.get('baseOpacity')) || 0;
        const diff = targetOpacity - start;
        return {
            g,
            start,
            step: diff / FADE_STEPS,
            currentStep: 0
        };
    }).filter(fd => Math.abs(fd.step) > 0.0001); // skip already at target

    if (fadeData.length === 0) return;

    const intervalId = setInterval(() => {
        let done = true;

        fadeData.forEach(fd => {
            if (fd.currentStep < FADE_STEPS) {
                const newVal = fd.start + fd.step * (fd.currentStep + 1);
                fd.g.set('baseOpacity', Math.max(0, Math.min(1, newVal)));
                fd.currentStep++;
                done = false;
            } else {
                fd.g.set('baseOpacity', targetOpacity);
            }
        });

        if (done) {
            clearInterval(intervalId);
            activeIntervals = activeIntervals.filter(id => id !== intervalId);
        }
    }, stepInterval);

    activeIntervals.push(intervalId);
});
});
{ try { throw new Error(''); } catch (e) { API_Meta.Fade.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.Fade.offset); } }
