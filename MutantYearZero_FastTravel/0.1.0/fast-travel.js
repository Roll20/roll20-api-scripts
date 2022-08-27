
function rollFailures(numFailures) {
    let grubLost = 0;
    let waterLost = 0;
    let timeLost = 0;
    let noEffect = 0;
    for(f = 0; f < numFailures; f++) {
      let failRoll = Math.floor(Math.random() * (6 - 1 + 1)) + 1;
      if (failRoll < 4) {
        noEffect++;
      }
      else if (failRoll < 5) {
        let grubRoll = Math.floor(Math.random() * (6 - 1 + 1)) + 1;
        grubLost = grubLost + grubRoll;
      }
      else if (failRoll < 6) {
        let waterRoll = Math.floor(Math.random() * (6 - 1 + 1)) + 1;
        waterLost = waterLost + waterRoll;
      }
      else {
        let timeRoll = Math.floor(Math.random() * (6 - 1 + 1)) + 1;
        timeLost = timeLost + timeRoll;
      }
    }
    return [grubLost, waterLost, timeLost];
  }
  
  function getRollResults(numRolls)
  {
    let successes = 0;
    let failures = 0;
    for(let x = 0; x < numRolls; x++) {
      let roll = Math.floor(Math.random() * (6 - 1 + 1)) + 1;
      if (roll == 6) { successes++; }
      if (roll == 1) { failures++; }
    }
    return [successes, failures];
  }

let sayTravel = function(msg, public) {
    let msg2 = msg;
    if(!public) {
        msg2 = `/w gm ${msg}`;
    }
    sendChat("GM", msg2);
}

on("chat:message", function(msg) {
    if (msg.type != "api" ||
    	(msg.content.indexOf("!fast") !== 0 && msg.content.indexOf("!") !== 0)
    	) {
        return;
    }
    let public = false;
    var args = msg.content.split(/\s+/);
    if (msg.content.indexOf("--public") >= 0) {
        public = true;
    }
    if (msg.content.indexOf("!fast-travel") >= 0) {
        let pieces = args[1];
        pieces = pieces.split(':')
        let travelHoursPerDay = parseInt(pieces[0]);
        let oasisRotSectors = parseInt(pieces[1]);
        let weakRotSectors = parseInt(pieces[2]);
        let heavyRotSectors = parseInt(pieces[3]);
        let stalkerAgility = parseInt(pieces[4]);
        let stalkerFindThePath = parseInt(pieces[5]);
        let stalkerGearBonuses = parseInt(pieces[6]);
        let nightHoursMarched = parseInt(pieces[7]);
        
        let numExploredSectors = oasisRotSectors + weakRotSectors + heavyRotSectors;


// we take our rolls for nights based on estimated days travel although actual travel time could impact number of 
// nights on a long journey, but probably an edge case so skipping that logic
let daysTraveled = numExploredSectors / 24;
let dailyTravelHours = travelHoursPerDay + nightHoursMarched;
let sleepHoursPerDay = 24 - dailyTravelHours;
let rollMod = 0;
if(Math.trunc(daysTraveled) >= 1) {
    rollMod = sleepHoursPerDay * Math.trunc(daysTraveled);
}
log(stalkerAgility)
log(stalkerFindThePath)
log(stalkerGearBonuses)
log(numExploredSectors)
log(rollMod)
let numRolls = (stalkerAgility + stalkerFindThePath + stalkerGearBonuses) * (numExploredSectors - rollMod);
let results = getRollResults(numRolls);
const successes = results[0];
const failures = results[1];
const stunts = successes - numExploredSectors;
let timeSaved = stunts * .5;
let failureRolls = failures/10;
failureRolls = failureRolls.toFixed(0)
let failureResults = rollFailures(failureRolls);
let grubLost = failureResults[0];
let waterLost = failureResults[1];
let timeLost = failureResults[2];
let totalTime = numExploredSectors - timeSaved + timeLost;
let sleepHours = 0;
let moreThanOneDay = false;
let day = 1;
let totalTimeCopy = totalTime;
while(totalTimeCopy > dailyTravelHours) {  
  sleepHours += sleepHoursPerDay;
  totalTimeCopy = totalTimeCopy - travelHoursPerDay;
  day++;
}
let weakExposure = weakRotSectors * 0.0416;
let rotSleeping = sleepHours * 0.0416;
//rotSleeping = rotSleeping.toFixed(2);
let weakTotalExposure = weakExposure + rotSleeping;
weakTotalExposure = weakExposure.toFixed(2);
let rotExposure =  heavyRotSectors + parseFloat(weakTotalExposure);
let timeSavedPercentage = totalTime/numExploredSectors;
let rotSaved = rotExposure * timeSavedPercentage;
rotSaved = rotExposure - rotSaved;
rotSaved = rotSaved.toFixed(0);


// console.log(`days to travel: ${daysTraveled}`);
// console.log(`sleeping hours: ${rollMod}`);
// console.log(`going to roll ${numRolls} dice.`);
// console.log(`successes: ${successes}`);
// console.log(`failures: ${failures}`);
// console.log(`stunts: ${stunts}`);
// console.log(`rolling ${failureRolls} failures`)
// console.log('FAILURES');
// console.log(failureResults);
// console.log('------------ TIME ----------------');
// console.log(`time saved by stunts: ${timeSaved} hours`);
// console.log(`time lost from failures: ${timeLost} hours`);
// console.log(`total travel time: ${totalTime}`);
// console.log(`hours slept per day: ${sleepHoursPerDay}`)
// console.log(`Hours Slept: ${sleepHours}`)

// console.log(`weakExposure: ${weakExposure}`);
// console.log(`rot sleeping: ${rotSleeping}`);
// console.log(`rotExposure: ${rotExposure}`);
// console.log(`timeSavedPercentage: ${timeSavedPercentage}`);
// console.log(`rot taken: ${rotSaved}`);

        let output = '<small><table style="border: 1px solid black"><tr style="border: 1px solid black">';
        output += `<tr style="border: 1px solid black"><td style="padding: 2px;" colspan="3">Explored Sectors: ${numExploredSectors}</td></tr>`;
        output += `<tr style="border: 1px solid black"><td style="padding: 2px;" colspan="3">numRolls: ${numRolls}</td></tr>`;
        output += '<tr style="border: 1px solid black">';
        output += `<td style="border: 1px solid black; padding: 2px;">Days Traveled: ${daysTraveled}</td>`;
        output += `<td style="border: 1px solid black; padding: 2px;">Hours Slept: ${sleepHours}</td>`;
        output += `<td style="border: 1px solid black; padding: 2px;">Number Dice Rolled: ${numRolls}</td>`;
        output += '</tr>'
        output += '<tr style="border: 1px solid black">';
        output += `<td style="border: 1px solid black; padding: 2px;">Successes: ${successes}</td>`;
        output += `<td style="border: 1px solid black; padding: 2px;">Failures: ${failures}</td>`;
        output += `<td>Stunts: ${stunts}</td>`;
        output += '</tr>'
        output += '</table></small>'
        sayTravel(output);
    }
});

