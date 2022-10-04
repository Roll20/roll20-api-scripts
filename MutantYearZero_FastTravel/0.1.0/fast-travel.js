

function getRandomInt(min=1, max=100) {
  min = Math.ceil(min);
  max = Math.floor(max);
  const result = Math.floor(Math.random() * (max - min + 1)) + min;
  return result;
}

let rotLevelDefs = {
    'Oasis': range(11,12,1),
    'Weak': range(13,55,1),
    'Heavy': range(56,66,1),
}

function rollD66() {
    let ex = getD66Exclusions();
    let result = getRandomInt(1, 66);
    while (ex.includes(result)) {
        //TODO watch out for range assumption here
        result = getRandomInt(1, 66);
    }
  return result;
}

function getD66Exclusions(){
  let exclusions = range(1,10,1);
  let x1 = range(17, 20, 1);
  let x2 = range(27, 30, 1);
  let x3 = range(37, 40, 1);
  let x4 = range(47, 50, 1);
  let x5 = range(57, 60, 1);
  let x6 = range(67, 70, 1);
  exclusions.push(...x1);
  exclusions.push(...x2);
  exclusions.push(...x3);
  exclusions.push(...x4);
  exclusions.push(...x5);
  exclusions.push(...x6);
  return exclusions;
}


function getEntryD66Table(table) {

    let result = rollD66();

    for (x in table) {
        let hitrange = table[x];
        if(hitrange.includes(result)) {
          return x;
        }
    }
}

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

  function getRandomRot(numRolls) {
    let rotTotal = 0;
    for(let x = 0; x < numRolls; x++) {
        const rot = getEntryD66Table(rotLevelDefs);
        if (rot === "Weak") { rotTotal = rotTotal + 0.0416; }
        if (rot === "Heavy") { rotTotal = rotTotal + 1; }
    }
    return rotTotal.toFixed(2);
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
        pieces = pieces.split(':');
        log(pieces)
        let travelHoursPerDay = parseInt(pieces[0]);
        let vehicles = pieces[1];
        let isOcean = pieces [2];
        let oasisRotSectors = parseInt(pieces[3]);
        let weakRotSectors = parseInt(pieces[4]);
        let heavyRotSectors = parseInt(pieces[5]);
        let stalkerAgility = parseInt(pieces[6]);
        let stalkerFindThePath = parseInt(pieces[7]);
        let stalkerGearBonuses = parseInt(pieces[8]);
        let nightHoursMarched = parseInt(pieces[9]);
        
        let numExploredSectors = oasisRotSectors + weakRotSectors + heavyRotSectors;
        // we take our rolls for nights based on estimated days travel although actual travel time could impact number of 
        // nights on a long journey, but probably an edge case so skipping that logic
        let dayDivisor = (vehicles === "Yes") ? 24 : 12; // previously explored sectors are an hour in vehicle and two hours on foot.
        let daysTraveled = numExploredSectors / dayDivisor;
        let dailyTravelHours = travelHoursPerDay + nightHoursMarched;
        let sleepHoursPerDay = 24 - dailyTravelHours;
        log("--- INPUT DUMP ----")
        // log(rollMod)
        log(stalkerAgility)
        log(stalkerFindThePath)
        log(stalkerGearBonuses)
        log(numExploredSectors)
        
        let numRolls = (stalkerAgility + stalkerFindThePath + stalkerGearBonuses) * numExploredSectors;
        let results = getRollResults(numRolls);
        const successes = results[0];
        const failures = results[1];
        const stunts = successes - numExploredSectors;
        let timeSavedMultiplier = (vehicles === "Yes") ? .5 : 1;
        let timeSaved = stunts * timeSavedMultiplier;
        let failureRolls = failures/10;
        if (nightHoursMarched > 0)
        {
            failureRolls = failureRolls + ((nightHoursMarched/travelHoursPerDay) * numExploredSectors);
        }
        failureRolls = failureRolls.toFixed(0)
        let failureResults = rollFailures(failureRolls);
        let grubLost = failureResults[0];
        let waterLost = failureResults[1];
        let timeLost = failureResults[2];
        let travelHourMultiplier = (vehicles === "Yes") ? 1: 2;  // one hour per secton in vehicle, 2 on foot
        let sectorExploreHours = numExploredSectors * travelHourMultiplier;
        let totalTime = sectorExploreHours - timeSaved + timeLost;
        let sleepHours = 0;
        if (Math.trunc(daysTraveled) >= 1) {
            sleepHours = sleepHoursPerDay * (Math.trunc(daysTraveled) - 1);
        }
        let rotExposure = 0;
        if (isOcean === "Yes") {
            rotExposure = getRandomRot(numExploredSectors);
        }
        else {
            let weakExposure = weakRotSectors * 0.0416;
            let rotSleeping = sleepHours * 0.0416;
            let weakTotalExposure = weakExposure + rotSleeping;
            weakTotalExposure = weakExposure.toFixed(2);
            rotExposure =  heavyRotSectors + parseFloat(weakTotalExposure);
            if (vehicles === "No") {
                rotExposure = rotExposure * 2;
            }
        }
        let timeSavedPercentage = totalTime/numExploredSectors;
        let rotSaved = rotExposure * timeSavedPercentage;
        timeSavedPercentage = timeSavedPercentage * 100;
        timeSavedPercentage = timeSavedPercentage.toFixed(0); // mutating this for display as percentage
        let finalRot = rotExposure - rotSaved;
        finalRot = rotSaved.toFixed(0);
        daysTraveled = daysTraveled.toFixed(2); // mutate for display
        let output = '<small><table style="border: 1px solid black"><tr style="border: 1px solid black">';
        output += `<tr style="border: 1px solid black; vertical-align: top;  text-align:left; background-color:dark gray;color:white"><td style="padding: 2px;" colspan="3">Explored Sectors: ${numExploredSectors}</td></tr>`;
        output += `<tr style="border: 1px solid black; vertical-align: top;  text-align:left; background-color:dark gray;color:white"><td style="padding: 2px;" colspan="3">numRolls: ${numRolls}</td></tr>`;
        output += '<tr style="border: 1px solid black">';
        output += `<td style="border: 1px solid black; vertical-align: top;  text-align:left; padding: 2px; background-color:dark gray;color:white">Days Traveled:<br/>${daysTraveled}</td>`;
        output += `<td style="border: 1px solid black; vertical-align: top;  text-align:left; padding: 2px; background-color:dark gray;color:white">Hours Slept:<br/>${sleepHours}</td>`;
        output += `<td style="border: 1px solid black; vertical-align: top;  text-align:left; padding: 2px; background-color:dark gray;color:white">Number Dice Rolled:<br/>${numRolls}</td>`;
        output += '</tr>'
        output += '<tr style="border: 1px solid black">';
        output += `<td style="border: 1px solid black; vertical-align: top;  text-align:left; padding: 2px;background-color:dark green;color:white">Successes: ${successes}</td>`;
        output += `<td style="border: 1px solid black; vertical-align: top;  text-align:left; padding: 2px;background-color:dark red;color:white">Failures: ${failures}</td>`;
        output += `<td style="border: 1px solid black; vertical-align: top;  text-align:left; padding: 2px;background-color:dark blue;color:white">Stunts: ${stunts}</td>`;
        output += '</tr>'
        output += `<tr style="border: 1px solid black"><td style="padding: 2px;background-color:black;color:white" colspan="3">FAILURES: ${failureRolls}</td></tr>`;
        output += '<tr style="border: 1px solid black">';
        output += `<td style="border: 1px solid black; vertical-align: top;  text-align:left; padding: 2px; background-color:yellow;color:black"><b>Grub Lost:<br/>${grubLost}</b></td>`;
        output += `<td style="border: 1px solid black; vertical-align: top;  text-align:left; padding: 2px; background-color:yellow;color:black"><b>Water Lost:<br/>${waterLost}</b></td>`;
        output += `<td style="border: 1px solid black; vertical-align: top;  text-align:left; padding: 2px; background-color:yellow;color:black"><b>Time Lost:<br/>${timeLost}</b></td>`;
        output += '</tr>'
        output += '<tr style="border: 1px solid black">';
        output += `<td style="border: 1px solid black; background-color:dark gray;color:white; vertical-align: top;  text-align:left; padding: 2px;">Hours Slept: ${sleepHours}</td>`;
        output += `<td style="border: 1px solid black; background-color:dark gray;color:white; vertical-align: top;  text-align:left; padding: 2px;" colspan="2">Rot Exposure: ${rotExposure}</td>`;
        output += '</tr>'
        output += '<tr style="border: 1px solid black">';
        output += `<td style="border: 1px solid black; background-color:dark gray;color:white; vertical-align: top;  text-align:left; padding: 2px;" colspan="3">${sectorExploreHours} (Travel Hours) - ${timeSaved} (Time Saved) + ${timeLost} (Time Lost) hours (${timeSavedPercentage}%)</td>`;
        output += '</tr>';
        output += `<tr><td style="border: 1px solid black; background-color:dark blue;color:white; vertical-align: top;  text-align:left; padding: 2px;" colspan="3"><b>Total Time: ${totalTime} hours</b></td></tr>`;
        output += `<td style="border: 1px solid black; background-color:dark blue;color:white; vertical-align: top;  text-align:left; padding: 2px;" colspan="3"><b>Rot Damage: ${finalRot}</b></td>`;
        output += '</table></small>'
        sayTravel(output);
    }
});

