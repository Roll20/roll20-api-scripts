//Grimwild Companion API for Roll20 
//Version: v1.4 — Last updated 10.6.2025 
//Description: Intended to be used alongside the Grimwild character sheet to allow for enhanced rolls. 

var Grimwild = Grimwild || {};

on('ready', function() {
    log('=== Grimwild Dice System Loaded ===');
    log('Grimwild dice system is ready! v1.4');
});

on('chat:message', function(msg) {
    if (msg.type !== 'api') return;
    
    if (msg.content.indexOf('!grimwild') === 0) {
        Grimwild.handleGrimwildRoll(msg);
    }
    
    if (msg.content.indexOf('!grimpool') === 0) {
        Grimwild.handlePoolRoll(msg);
    }
    
    if (msg.content.indexOf('!grimpowerpool') === 0) {
        Grimwild.handlePowerPoolRoll(msg);
    }
    
    if (msg.content.indexOf('!story-menu') === 0) {
        Grimwild.handleStoryMenu(msg);
    }
    
    if (msg.content.indexOf('!story-') === 0 && msg.content !== '!story-menu') {
        Grimwild.handleStoryOption(msg);
    }
});

Grimwild.handleGrimwildRoll = function(msg) {
    const args = msg.content.split(' ');
    const poolSize = parseInt(args[1]);
    
    if (args[2] === 'menu') {
        Grimwild.handleStoryMenu(msg);
        return;
    }
    
    let thornCount = 0;
    let attributeName = 'Grimwild';
    let difficultyThorns = 0;
    let markHarmThorns = 0;
    let extraDice = 0;
    let wasMarked = false;
    let usedSpark = false;
    let sparkCount = 0;
    let masteryDiceCount = 0;
    let usingMastery = false;
    let isFrenzied = false;
    let frenzyMarks = 0;
    let oathDiceCount = 0;
    let usingOath = false;
    let expertiseDiceCount = 0;
    let usingExpertise = false;
    let expertiseType = '';
    let prowessDiceCount = 0;
    let usingProwess = false;
    
	for (let i = 2; i < args.length; i++) {
        const arg = args[i];
        if (arg.toLowerCase() === 'marked') {
            wasMarked = true;
        } else if (arg.toLowerCase() === 'spark') {
            usedSpark = true;
        } else if (arg.toLowerCase() === 'montage') {
            attributeName = 'Montage';
        } else if (arg.toLowerCase() === 'dropped') {
            attributeName = 'Dropped';
        } else if (arg.toLowerCase() === 'frenzy') {
            isFrenzied = true;
        } else if (arg.toLowerCase().startsWith('mastery') && arg.length > 7) {
            masteryDiceCount = parseInt(arg.slice(7)) || 0;
        } else if (arg.toLowerCase() === 'mastery') {
            usingMastery = true;
        } else if (arg.toLowerCase().startsWith('frenzymarks')) {
            frenzyMarks = parseInt(arg.slice(11)) || 0;
        } else if (arg.toLowerCase().startsWith('oath') && arg.length > 4) {
            oathDiceCount = parseInt(arg.slice(4)) || 0;
        } else if (arg.toLowerCase() === 'oath') {
            usingOath = true;
        } else if (arg.toLowerCase().startsWith('expertise') && arg.length > 9) {
            expertiseDiceCount = parseInt(arg.slice(9)) || 0;
        } else if (arg.toLowerCase() === 'expertise') {
            usingExpertise = true;
            if (i + 1 < args.length) {
                expertiseType = args[i + 1];
                i++;
            }
        } else if (arg.toLowerCase().startsWith('prowess') && arg.length > 7) {
            prowessDiceCount = parseInt(arg.slice(7)) || 0;
        } else if (arg.toLowerCase() === 'prowess') {
            usingProwess = true;
        } else if (arg.toLowerCase().startsWith('t')) {
            thornCount = parseInt(arg.slice(1)) || 0;
        } else if (arg.toLowerCase().startsWith('d')) {
            difficultyThorns = parseInt(arg.slice(1)) || 0;
        } else if (arg.toLowerCase().startsWith('m')) {
            markHarmThorns = parseInt(arg.slice(1)) || 0;
        } else if (arg.toLowerCase().startsWith('e')) {
            extraDice = parseInt(arg.slice(1)) || 0;
        } else if (arg.toLowerCase().startsWith('s')) {
            sparkCount = parseInt(arg.slice(1)) || 0;
        } else {
            attributeName = arg;
        }
    }
        
    if (isNaN(poolSize) || poolSize < 1 || poolSize > 12) {
        sendChat('Grimwild', '/w "' + msg.who + '" Usage: !grimwild [pool size] [thorns] [attribute]');
        return;
    }
    
    const mainDiceCount = poolSize;
    const sparkDiceCount = usedSpark ? sparkCount : 0;
    
    const mainDice = [];
    for (let i = 0; i < mainDiceCount; i++) {
        mainDice.push(randomInteger(6));
    }
    
    const sparkDice = [];
    for (let i = 0; i < sparkDiceCount; i++) {
        sparkDice.push(randomInteger(6));
    }
    
    const masteryDice = [];
    let masteryTriggeredCritical = false;
    let masteryTriggeredSpark = false;
    if (usingMastery && masteryDiceCount > 0) {
        for (let i = 0; i < masteryDiceCount; i++) {
            const masteryRoll = randomInteger(6);
            masteryDice.push(masteryRoll);
            if (masteryRoll === 6) {
                masteryTriggeredCritical = true;
            }
        }
    }
    
    const oathDice = [];
    if (usingOath && oathDiceCount > 0) {
        for (let i = 0; i < oathDiceCount; i++) {
            const oathRoll = randomInteger(6);
            oathDice.push(oathRoll);
        }
    }
    
    const expertiseDice = [];
    if (usingExpertise && expertiseDiceCount > 0) {
        for (let i = 0; i < expertiseDiceCount; i++) {
            const expertiseRoll = randomInteger(6);
            expertiseDice.push(expertiseRoll);
        }
    }
    
    const prowessDice = [];
    if (usingProwess && prowessDiceCount > 0) {
        for (let i = 0; i < prowessDiceCount; i++) {
            const prowessRoll = randomInteger(6);
            prowessDice.push(prowessRoll);
        }
    }
    
    const frenzyDice = [];
    if (isFrenzied && frenzyMarks > 0) {
        for (let i = 0; i < frenzyMarks; i++) {
            const frenzyRoll = randomInteger(6);
            frenzyDice.push(frenzyRoll);
        }
    }
    
	const allDice = [...mainDice, ...sparkDice];
    const allDiceIncludingMastery = [...allDice, ...masteryDice, ...oathDice, ...expertiseDice, ...prowessDice];
    const highest = Math.max(...allDiceIncludingMastery);
    const perfectCount = allDiceIncludingMastery.filter(d => d === 6).length;
    const normalPerfectCount = allDice.filter(d => d === 6).length;

    if (masteryTriggeredCritical) {
        if (normalPerfectCount > 0) {
            masteryTriggeredSpark = true;
        }
    }
        
    let difficultyThornResults = [];
    let markHarmThornResults = [];
    let totalThornCuts = 0;
    let displayMarkHarmThorns = markHarmThorns;
    
    if (isFrenzied && markHarmThorns > 0) {
        displayMarkHarmThorns = markHarmThorns;
        markHarmThorns = 0;
    }
    
    if (difficultyThorns > 0) {
        for (let i = 0; i < difficultyThorns; i++) {
            const thornRoll = randomInteger(8);
            difficultyThornResults.push(thornRoll);
            if (thornRoll >= 7) {
                totalThornCuts++;
            }
        }
    }
    
    if (displayMarkHarmThorns > 0) {
        for (let i = 0; i < displayMarkHarmThorns; i++) {
            const thornRoll = randomInteger(8);
            markHarmThornResults.push(thornRoll);
            if (thornRoll >= 7 && !isFrenzied) {
                totalThornCuts++;
            }
        }
    }
    
    let baseResult;
    let isCritical = false;

    if (masteryTriggeredCritical || perfectCount >= 2) {
        baseResult = 'critical';
        isCritical = true;
    } else if (highest === 6) {
        baseResult = 'perfect';
    } else if (highest >= 4) {
        baseResult = 'messy';
    } else {
        baseResult = 'grim';
    }
    
    let finalResult = baseResult;
    if (!isCritical && totalThornCuts > 0) {
        if (baseResult === 'perfect') {
            finalResult = totalThornCuts >= 1 ? 'messy' : 'perfect';
            if (totalThornCuts >= 2) finalResult = 'grim';
            if (totalThornCuts >= 3) finalResult = 'disaster';
        } else if (baseResult === 'messy') {
            finalResult = totalThornCuts >= 1 ? 'grim' : 'messy';
            if (totalThornCuts >= 2) finalResult = 'disaster';
        } else if (baseResult === 'grim') {
            finalResult = totalThornCuts >= 1 ? 'disaster' : 'grim';
        }
    }
    
    let resultDetails = {};
    switch(finalResult) {
        case 'critical':
            if (attributeName === 'Story') {
                resultDetails = {
                    resultname: 'CRITICAL',
                    resulttext: 'It\'s the optimal situation.'
                };
            } else if (attributeName === 'Montage') {
                resultDetails = {
                    resultname: 'CRITICAL',
                    resulttext: 'You do it, and choose a bonus.'
                };
            } else if (attributeName === 'Dropped') {
                resultDetails = {
                    resultname: 'CRITICAL',
                    resulttext: 'You remain in the scene!'
                };
            } else {
                resultDetails = {
                    resultname: 'CRITICAL',
                    resulttext: 'You did it, choose a bonus: greater effect, secondary effect, or setup.'
                };
            }
            break;
        case 'perfect':
            if (attributeName === 'Story') {
                resultDetails = {
                    resultname: 'PERFECT',
                    resulttext: 'It\'s an ideal situation.'
                };
            } else if (attributeName === 'Montage') {
                resultDetails = {
                    resultname: 'PERFECT',
                    resulttext: 'You did it, avoiding trouble.'
                };
            } else if (attributeName === 'Dropped') {
                resultDetails = {
                    resultname: 'PERFECT',
                    resulttext: 'You\'re out of the scene.'
                };
            } else {
                resultDetails = {
                    resultname: 'PERFECT',
                    resulttext: 'You do it, and avoid trouble.'
                };
            }
            break;
		case 'messy':
            if (attributeName === 'Story') {
                resultDetails = {
                    resultname: 'MESSY',
                    resulttext: 'It\'s okay, but there\'s a catch.'
                };
            } else if (attributeName === 'Montage') {
                resultDetails = {
                    resultname: 'MESSY',
                    resulttext: 'You did it, but with trouble.'
                };
            } else if (attributeName === 'Dropped') {
                resultDetails = {
                    resultname: 'MESSY',
                    resulttext: 'You\'re out of the scene, and it\'s bad (e.g., 4d dying, broken leg, trauma).'
                };
            } else {
                resultDetails = {
                    resultname: 'MESSY',
                    resulttext: 'You do it, but there\'s trouble.'
                };
            }
            break;
        case 'grim':
            if (attributeName === 'Story') {
                resultDetails = {
                    resultname: 'GRIM',
                    resulttext: 'Not good, and there\'s trouble.'
                };
            } else if (attributeName === 'Montage') {
                resultDetails = {
                    resultname: 'GRIM',
                    resulttext: 'You failed, and found trouble.'
                };
            } else if (attributeName === 'Dropped') {
                resultDetails = {
                    resultname: 'GRIM',
                    resulttext: 'You\'re out of the scene, and forever changed (e.g., death, insanity, morality shift).'
                };
            } else {
                resultDetails = {
                    resultname: 'GRIM',
                    resulttext: 'You fail, and there\'s trouble.'
                };
            }
            break;
        case 'disaster':
            if (attributeName === 'Story') {
                resultDetails = {
                    resultname: 'DISASTER',
                    resulttext: 'The worst case scenario.'
                };
            } else if (attributeName === 'Montage') {
                resultDetails = {
                    resultname: 'DISASTER',
                    resulttext: 'The worst case scenario.'
                };
            } else if (attributeName === 'Dropped') {
                resultDetails = {
                    resultname: 'DISASTER',
                    resulttext: 'The worst case scenario.'
                };
            } else {
                resultDetails = {
                    resultname: 'DISASTER',
                    resulttext: 'The worst case scenario.'
                };
            }
            break;
    }
    
    const playerName = msg.who.replace(' (GM)', '');
    
    let rollString = '&{template:grimwild}';
    rollString += ` {{charactername=${playerName}}}`;
    rollString += ` {{rollname=${attributeName}}}`;
    rollString += ` {{pool=1}}`;
    rollString += ` {{poolname=${attributeName}}}`;
    
    for (let i = 0; i < mainDice.length; i++) {
        rollString += ` {{dice${i+1}=${mainDice[i]}}}`;
    }
    
    if (usingMastery && masteryDice.length > 0) {
        rollString += ` {{mastery=1}}`;
        for (let i = 0; i < masteryDice.length; i++) {
            rollString += ` {{mastery${i+1}=${masteryDice[i]}}}`;
        }
    }
    
    if (usingOath && oathDice.length > 0) {
        rollString += ` {{oath=1}}`;
        for (let i = 0; i < oathDice.length; i++) {
            rollString += ` {{oath${i+1}=${oathDice[i]}}}`;
        }
    }
    
    if (usingExpertise && expertiseDice.length > 0) {
        rollString += ` {{expertise=1}}`;
        for (let i = 0; i < expertiseDice.length; i++) {
            rollString += ` {{expertise${i+1}=${expertiseDice[i]}}}`;
        }
    }
    
    if (usingProwess && prowessDice.length > 0) {
        rollString += ` {{prowess=1}}`;
        for (let i = 0; i < prowessDice.length; i++) {
            rollString += ` {{prowess${i+1}=${prowessDice[i]}}}`;
        }
    }
    
    if (usedSpark && sparkDice.length > 0) {
        rollString += ` {{spark=1}}`;
        for (let i = 0; i < sparkDice.length; i++) {
            rollString += ` {{spark${i+1}=${sparkDice[i]}}}`;
        }
    }
    
    if (difficultyThornResults.length > 0 || markHarmThornResults.length > 0) {
        if (difficultyThornResults.length > 0) {
            rollString += ` {{thorns=1}}`;
            
            for (let i = 0; i < difficultyThornResults.length; i++) {
                rollString += ` {{thorn${i+1}=${difficultyThornResults[i]}}}`;
            }
            
            if (markHarmThornResults.length > 0) {
                rollString += ` {{markharm=1}}`;
                for (let i = 0; i < markHarmThornResults.length; i++) {
                    rollString += ` {{mark${i+1}=${markHarmThornResults[i]}}}`;
                }
            }
        } else {
            rollString += ` {{markharmonly=1}}`;
            for (let i = 0; i < markHarmThornResults.length; i++) {
                rollString += ` {{mark${i+1}=${markHarmThornResults[i]}}}`;
            }
        }
    }
    
	rollString += ` {{result=1}}`;
    rollString += ` {{resultname=${resultDetails.resultname}}}`;
    rollString += ` {{resulttext=${resultDetails.resulttext}}}`;
    
    let notifications = [];

    if (usedSpark) {
        notifications.push(`${sparkCount} Spark used`);
    }

    if (usingMastery) {
        notifications.push(`Weapon Mastery adds ${masteryDiceCount}d`);
    }

    if (masteryTriggeredSpark) {
        notifications.push(`Take 1 Spark from Weapon Mastery`);
    }

    if (usingOath) {
        notifications.push(`Oath grants +1d and resists harm`);
    }
    
    if (usingExpertise && expertiseType) {
        const capitalizedType = expertiseType.charAt(0).toUpperCase() + expertiseType.slice(1);
        notifications.push(`${capitalizedType} Expertise used`);
    }
    
    if (usingProwess) {
        notifications.push(`Prowess used`);
    }

    if (isFrenzied && frenzyMarks > 0) {
        notifications.push(`Marks provide +${frenzyMarks}d`);
    }

    if (isFrenzied && (difficultyThornResults.length > 0 || markHarmThornResults.length > 0)) {
        notifications.push(`Marks and Harm ignored`);
    }

    if (!isFrenzied && totalThornCuts > 0) {
        notifications.push(`${totalThornCuts} Thorn cut${totalThornCuts > 1 ? 's' : ''}`);
    }
    
    if (wasMarked) {
        notifications.push(attributeName + ' Mark cleared');
    }  
    
    if (notifications.length > 0) {
        rollString += ` {{status=${notifications.join('<br>')}}}`;
    }
    
    sendChat('Grimwild', rollString);
};

Grimwild.handlePoolRoll = function(msg) {
    const args = msg.content.split(' ');
    const poolSize = parseInt(args[1]);
    const customName = args.slice(2).join(' ');
    
    if (isNaN(poolSize) || poolSize < 1 || poolSize > 12) {
        sendChat('Grimwild', '/w "' + msg.who + '" Usage: !grimpool [pool size 1-12] [optional custom name]');
        return;
    }
    
    const dice = [];
    for (let i = 0; i < poolSize; i++) {
        dice.push(randomInteger(6));
    }
    
    const drops = dice.filter(d => d <= 3).length;
    const remaining = poolSize - drops;

    const isPowerPool = false;

    let specialMessage = '';
    if (remaining === 0) {
        specialMessage = '<br><br>Event occurs, situation ends, or resource is lost.';
    } else if (drops === 0 && poolSize === 1) {
        specialMessage = '<br><br>You can push yourself or spend suspense to deplete the pool!';
    } else if (drops === 0) {
        specialMessage = '<br><br>No dice dropped, take a secondary effect if triggered by a messy or perfect action.';
    }

    const statusText = `${drops} dice dropped from pool<br>`;

    let thornResults = '';
    let sparkResults = '';
    let powerGrimwildResult = '';

    if (isPowerPool) {
        const highest = Math.max(...dice);
        const perfectCount = dice.filter(d => d === 6).length;
        
        let finalResult;
        if (perfectCount >= 2) {
            finalResult = 'critical';
        } else if (highest === 6) {
            finalResult = 'perfect';
        } else if (highest >= 4) {
            finalResult = 'messy';
        } else {
            finalResult = 'grim';
        }
        
        let resultDetails = {};
        switch(finalResult) {
            case 'critical':
                resultDetails = {
                    resultname: 'CRITICAL',
                    resulttext: 'You did it, choose a bonus.'
                };
                break;
            case 'perfect':
                resultDetails = {
                    resultname: 'PERFECT',
                    resulttext: 'You do it, and avoid trouble.'
                };
                break;
            case 'messy':
                resultDetails = {
                    resultname: 'MESSY',
                    resulttext: 'You do it, but there\'s trouble.'
                };
                break;
            case 'grim':
                resultDetails = {
                    resultname: 'GRIM',
                    resulttext: 'You fail, and there\'s trouble.'
                };
                break;
        }
        
        powerGrimwildResult = ` {{powerresult=1}} {{powerresultname=${resultDetails.resultname}}} {{powerresulttext=${resultDetails.resulttext}}}`;
    }
        
    const playerName = msg.who.replace(' (GM)', '');
    
    let rollString = '&{template:grimwild}';
    rollString += ` {{charactername=${playerName}}}`;
    if (customName) {
        rollString += ` {{rollname=${customName}}}`;
        rollString += ` {{poolname=${customName} (${poolSize}d)}}`;
    } else {
        rollString += ` {{poolname=Pool (${poolSize}d)}}`;
    }
    rollString += ` {{pool=1}}`;
    rollString += ` {{poolroll=1}}`;
    
    for (let i = 0; i < dice.length; i++) {
        rollString += ` {{dice${i+1}=${dice[i]}}}`;
    }
    
    rollString += ` {{result=1}}`;
    rollString += ` {{resultname=POOL RESULT}}`;
    rollString += ` {{resulttext=<span style="font-size: 1em;">${remaining}d</span> Remaining${specialMessage}}}`;
    rollString += ` {{status=${statusText}}}`;
    rollString += thornResults;
    rollString += sparkResults;
    rollString += powerGrimwildResult;
   
    sendChat('Grimwild', rollString);
};

Grimwild.handleStoryMenu = function(msg) {
    const playerName = msg.who.replace(' (GM)', '');
    const args = msg.content.split(' ');
    
    let difficultyThorns = 0;
    let markHarmThorns = 0;
    let extraDice = 0;
    let sparkCount = 0;
    let usingSpark = false;
    
    for (let i = 2; i < args.length; i++) {
        const arg = args[i];
        if (arg.toLowerCase().startsWith('d')) {
            difficultyThorns = parseInt(arg.slice(1)) || 0;
        } else if (arg.toLowerCase().startsWith('m')) {
            markHarmThorns = parseInt(arg.slice(1)) || 0;
        } else if (arg.toLowerCase().startsWith('e')) {
            extraDice = parseInt(arg.slice(1)) || 0;
        } else if (arg.toLowerCase().startsWith('s')) {
            sparkCount = parseInt(arg.slice(1)) || 0;
        } else if (arg.toLowerCase() === 'spark') {
            usingSpark = true;
        }
    }
    
    const totalThorns = difficultyThorns + markHarmThorns;
    const sparkText = usingSpark ? ' spark' : '';
    
    let menuOutput = '/w "' + playerName + '" ';
    menuOutput += '&{template:grimwild-menu} ';
    menuOutput += '{{rollname=' + playerName + ' | Story Choice}} ';
    menuOutput += '{{menu_title=SELECT A STORY ROLL}} ';
    
    let buttonOptions = '';
    buttonOptions += `[Bad Odds | 1d](!grimwild ${1 + extraDice} t${totalThorns} Story d${difficultyThorns} m${markHarmThorns} e${extraDice} s${sparkCount}${sparkText})<br>`;
    buttonOptions += `[Even Odds | 2d](!grimwild ${2 + extraDice} t${totalThorns} Story d${difficultyThorns} m${markHarmThorns} e${extraDice} s${sparkCount}${sparkText})<br>`;
    buttonOptions += `[Good Odds |3d](!grimwild ${3 + extraDice} t${totalThorns} Story d${difficultyThorns} m${markHarmThorns} e${extraDice} s${sparkCount}${sparkText})<br>`;
    buttonOptions += `[Montage | 2d](!grimwild ${2 + extraDice} t${totalThorns} Montage d${difficultyThorns} m${markHarmThorns} e${extraDice} s${sparkCount}${sparkText})`;
    
    menuOutput += `{{menu_options=${buttonOptions}}}`;
    
    sendChat('', menuOutput);
};

Grimwild.handleStoryOption = function(msg) {
    const option = msg.content.substring(1);
    let diceCount = 1;
    let rollName = 'Story';
    
    switch(option) {
        case 'story-bad': diceCount = 1; break;
        case 'story-even': diceCount = 2; break;
        case 'story-good': diceCount = 3; break;
        case 'story-montage': diceCount = 2; rollName = 'Montage'; break;
    }
    
    const grimwildCommand = `!grimwild ${diceCount} t0 ${rollName} d0 m0 e0`;
    Grimwild.handleGrimwildRoll({
        content: grimwildCommand,
        who: msg.who,
        type: 'api'
    });
};

Grimwild.handlePowerPoolRoll = function(msg) {
    const args = msg.content.split(' ');
    const poolSize = parseInt(args[1]);
    
    let customName = '';
    let difficultyThorns = 0;
    let bloodiedThorns = 0;
    let rattledThorns = 0;
    let usingSpark = false;
    
	let sparkCount = 0;

	let nameArgs = [];
	for (let i = 2; i < args.length; i++) {
		const arg = args[i].toLowerCase();

		if (/^t\d+$/.test(arg)) {
			difficultyThorns = parseInt(arg.slice(1)) || 0;
		} else if (/^b\d+$/.test(arg)) {
			bloodiedThorns = parseInt(arg.slice(1)) || 0;
		} else if (/^r\d+$/.test(arg)) {
			rattledThorns = parseInt(arg.slice(1)) || 0;
		} else if (/^s\d+$/.test(arg)) {
			sparkCount = parseInt(arg.slice(1)) || 0;
		} else if (arg === 'spark') {
			usingSpark = true;
		} else {
			nameArgs.push(args[i]);
		}
	}

    customName = nameArgs.join(' ');
    
    if (isNaN(poolSize) || poolSize < 1 || poolSize > 12) {
        sendChat('Grimwild', '/w "' + msg.who + '" Usage: !grimpowerpool [pool size 1-12] [optional custom name]');
        return;
    }
    
	const totalPoolSize = poolSize + (usingSpark ? sparkCount : 0);
    const dice = [];
    for (let i = 0; i < totalPoolSize; i++) {
        dice.push(randomInteger(6));
    }
    
    const drops = dice.filter(d => d <= 3).length;
    const remaining = totalPoolSize - drops;
    
    let specialMessage = '';
    if (remaining === 0) {
        specialMessage = '<br><br>Power pool is depleted.';
    }

    const statusText = `${drops} dice dropped from pool<br><br>`;
    
    const highest = Math.max(...dice);
    const perfectCount = dice.filter(d => d === 6).length;

    let difficultyThornResults = [];
    let markHarmThornResults = [];
    let totalThornCuts = 0;
    let thornResults = '';

    if (difficultyThorns > 0) {
        for (let i = 0; i < difficultyThorns; i++) {
            const thornRoll = randomInteger(8);
            difficultyThornResults.push(thornRoll);
            if (thornRoll >= 7) totalThornCuts++;
        }
    }

    const markHarmThorns = bloodiedThorns + rattledThorns;
    if (markHarmThorns > 0) {
        for (let i = 0; i < markHarmThorns; i++) {
            const thornRoll = randomInteger(8);
            markHarmThornResults.push(thornRoll);
            if (thornRoll >= 7) totalThornCuts++;
        }
    }

    if (difficultyThornResults.length > 0 || markHarmThornResults.length > 0) {
        if (difficultyThornResults.length > 0) {
            thornResults += ' {{thorns=1}}';
            for (let i = 0; i < difficultyThornResults.length; i++) {
                thornResults += ` {{thorn${i+1}=${difficultyThornResults[i]}}}`;
            }
            
            if (markHarmThornResults.length > 0) {
                thornResults += ' {{markharm=1}}';
                for (let i = 0; i < markHarmThornResults.length; i++) {
                    thornResults += ` {{mark${i+1}=${markHarmThornResults[i]}}}`;
                }
            }
        } else {
            thornResults += ' {{markharmonly=1}}';
            for (let i = 0; i < markHarmThornResults.length; i++) {
                thornResults += ` {{mark${i+1}=${markHarmThornResults[i]}}}`;
            }
        }
    }

    let baseResult;
    let isCritical = false;

    if (perfectCount >= 2) {
        baseResult = 'critical';
        isCritical = true;
    } else if (highest === 6) {
        baseResult = 'perfect';
    } else if (highest >= 4) {
        baseResult = 'messy';
    } else {
        baseResult = 'grim';
    }

    let finalResult = baseResult;
    if (!isCritical && totalThornCuts > 0) {
        if (baseResult === 'perfect') {
            finalResult = totalThornCuts >= 1 ? 'messy' : 'perfect';
            if (totalThornCuts >= 2) finalResult = 'grim';
            if (totalThornCuts >= 3) finalResult = 'disaster';
        } else if (baseResult === 'messy') {
            finalResult = totalThornCuts >= 1 ? 'grim' : 'messy';
            if (totalThornCuts >= 2) finalResult = 'disaster';
        } else if (baseResult === 'grim') {
            finalResult = totalThornCuts >= 1 ? 'disaster' : 'grim';
        }
    }
    
    let resultDetails = {};
    switch(finalResult) {
        case 'critical':
            resultDetails = {
                resultname: 'CRITICAL',
                resulttext: 'You did it, choose a bonus.'
            };
            break;
        case 'perfect':
            resultDetails = {
                resultname: 'PERFECT',
                resulttext: 'You do it, and avoid trouble.'
            };
            break;
        case 'messy':
            resultDetails = {
                resultname: 'MESSY',
                resulttext: 'You do it, but there\'s trouble.'
            };
            break;
        case 'grim':
            resultDetails = {
                resultname: 'GRIM',
                resulttext: 'You fail, and there\'s trouble.'
            };
            break;
        case 'disaster':
            resultDetails = {
                resultname: 'DISASTER',
                resulttext: 'The worst case scenario.'
            };
            break;
    }

    let powerNotifications = [];
    if (usingSpark) {
        powerNotifications.push('Spark used');
    }
    if (totalThornCuts > 0) {
        powerNotifications.push(`${totalThornCuts} thorn cut${totalThornCuts > 1 ? 's' : ''}`);
    }

    let powerStatusText = '';
    if (powerNotifications.length > 0) {
        powerStatusText = ` {{powerstatus=${powerNotifications.join('<br>')}}}`;
    }
    
    const playerName = msg.who.replace(' (GM)', '');
    
    let rollString = '&{template:grimwild}';
    rollString += ` {{charactername=${playerName}}}`;

	const displaySize = usingSpark ? `${poolSize}d+${sparkCount}d SPARK` : `${poolSize}d`;
    if (customName) {
        rollString += ` {{rollname=${customName} Power}}`;
        rollString += ` {{poolname=${customName} (${displaySize})}}`;
    } else {
        rollString += ` {{rollname=Power Pool}}`;
        rollString += ` {{poolname=Power Pool (${displaySize})}}`;
    }
    rollString += ` {{pool=1}}`;
    rollString += ` {{poolroll=1}}`;
    rollString += ` {{powerroll=1}}`;

    for (let i = 0; i < totalPoolSize; i++) {
        rollString += ` {{dice${i+1}=${dice[i]}}}`;
    }
    
    rollString += ` {{result=1}}`;
    rollString += ` {{resultname=POOL RESULT}}`;
    rollString += ` {{resulttext=<span style="font-size: 1em;">${remaining}d</span> Remaining${specialMessage}}}`;
    rollString += ` {{status=${statusText}}}`;
    
    rollString += thornResults;

    rollString += ` {{powerresult=1}}`;
    rollString += ` {{powerresultname=${resultDetails.resultname}}}`;
    rollString += ` {{powerresulttext=${resultDetails.resulttext}}}`;
    rollString += powerStatusText;
   
    sendChat('Grimwild', rollString);
};