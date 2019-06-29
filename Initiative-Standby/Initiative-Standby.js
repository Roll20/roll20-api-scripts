//if (MarkStart) MarkStart('Standby');
// ===============================================================================
// Initiative Standby
//
// Version 1.0
//
// Author: github.com/VoltCruelerz
// ===============================================================================

on('ready', () => {
    const sname = 'Standby';
    const StandbyIcon = 'interdiction';

    class Status {
        constructor(type, value) {
            this.Type = type;
            this.Value = value;
        }
    }

    const GetStatuses = (token) => {
        const rawStatus = token.get('statusmarkers');
        const oldStatusArray = rawStatus.split(',');
        const newStatusArray = [];
        let previousType = false;
        let prevStatus = null;
        oldStatusArray.forEach((entry) => {
            const statusFields = entry.split('@');
            const type = statusFields[0];
            const value = statusFields.length > 1
                ? statusFields[1]
                : true;
            let newStatus = null;
            // If we've already gotten one of this kind, we're seeing a duplicate, so add to previous
            if (type === previousType) {
                newStatus = prevStatus;
                prevStatus.Value = prevStatus.Value + value;
            } else {
                newStatus = new Status(type, value);
                newStatusArray.push(newStatus);
            }
            previousType = type;
            prevStatus = newStatus;
        });
        return newStatusArray;
    };

    const GetStatusValue = (token, type) => {
        const statuses = GetStatuses(token);
        for(let i = 0; i < statuses.length; i++) {
            const curStatus = statuses[i];
            if (type === curStatus.Type) {
                const intVal = parseInt(curStatus.Value);
                if (isNaN(intVal)) {
                    return curStatus.Value;
                } else {
                    return intVal;
                }
            }
        }
        return false;
    };

    const StringifyStatus = (status) => {
        if (status.Value === true) {
            return status.Type;
        } else {
            const strVal = status.Value + "";
            const digitArray = strVal.split('');
            const valArray = [];
            for (let i = 0; i < digitArray.length; i++) {
                let char = digitArray[i];
                valArray.push(status.Type + '@' + char);
            }
            return valArray.join(',');
        }
    };

    const UpdateStatusValue = (token, type, value) => {
        let alreadyExists = false;
        const statuses = GetStatuses(token);
        for(let i = 0; i < statuses.length; i++) {
            const curStatus = statuses[i];
            if (type === curStatus.Type) {
                curStatus.Value = value;
                alreadyExists = true;
                break;
            }
        }
        if (!alreadyExists) {
            statuses.push(new Status(type, value));
        }
        const statusStrings = [];
        for (let i = 0; i < statuses.length; i++) {
            const curStatus = statuses[i];
            statusStrings.push(StringifyStatus(curStatus));
        }
        const statusString = statusStrings.join(',');
        token.set('statusmarkers', statusString);
        return value;
    };

    on('chat:message', (msg) => {
        if (msg.type !== 'api') return;
        if (msg.content.startsWith('!standby') !== true) return;
        if (!msg.selected) {
            sendChat(sname, '/w gm Error: You must have tokens selected to use this script.');
            return;
        }
        const isYank = msg.content.endsWith('yank');
        const oldOrderStr = Campaign().get('turnorder');
        if(oldOrderStr === '' || oldOrderStr === '[]') {
            sendChat(sname, '/w gm Error: No initiative is loaded.');
            return;
        }
        const oldOrder = JSON.parse(oldOrderStr);
        const yankedIds = {};
        let yankCount = 0;
        const restoredObjs = [];// NOTE: These are not yet in the string format required
        msg.selected.forEach((selection) => {
            let token = getObj('graphic', selection._id);

            // Yank it from initiative order and write
            if (isYank) {
                let pr = -1;
                for (let i = 0; i < oldOrder.length; i++) {
                    const entry = oldOrder[i];
                    if (entry.id === selection._id) {
                        pr = parseFloat(entry.pr);
                        yankedIds[entry.id] = true;
                        yankCount++;
                        break;
                    }
                }
                // Don't do anything if it wasn't in init order
                if (pr === -1) {
                    return;
                }
                const noDecimal = 100*pr;
                token.set(StandbyIcon, "" + noDecimal);
                UpdateStatusValue(token, StandbyIcon, noDecimal);
            }
            // Add back to initiative order and remove status value
            else {
                const statusVal = GetStatusValue(token, StandbyIcon);
                if (isNaN(statusVal)) {
                    return;
                }
                const initVal = statusVal / 100;
                restoredObjs.push({
                    id: selection._id,
                    pr: initVal
                });
                token.set(StandbyIcon, false);
                UpdateStatusValue(token, StandbyIcon, false);
            }
        });

        // Yank out the chosen ids
        if (isYank) {
            if (yankCount === 0) {
                sendChat(sname, '/w gm Error: no yankable tokens selected.');
                return;
            }
            const newOrder = [];

            for (let i = 0; i < oldOrder.length; i++) {
                const entry = oldOrder[i];
                if (!yankedIds[entry.id]) {
                    newOrder.push(entry);
                }
            }

            // Set
            Campaign().set('turnorder', JSON.stringify(newOrder));
        }
        // Insert the chosen ids, accounting for the circular nature of initiative
        else {
            if (restoredObjs.length === 0) {
                sendChat(sname, '/w gm Error: no restorable tokens selected.');
                return;
            }
            // Sort the restored list
            restoredObjs.sort((a, b) => (a.pr > b.pr ? -1 : 1));

            // Get the location of the maximum so we know the offset in the future.
            let maxVal = -2;
            const sortableOld = [];
            let oldStarterPR = 0;
            for (let i = 0; i < oldOrder.length; i++) {
                const entry = oldOrder[i];
                const val = parseFloat(entry.pr);
                sortableOld.push({
                    id: entry.id,
                    pr: val
                })
                if (i === 0) {
                    oldStarterPR = entry.id;
                }
                if (val > maxVal) {
                    maxVal = val;
                }
            }
            sortableOld.sort((a, b) => (a.pr > b.pr ? -1 : 1));

            // Merge the lists into one sorted list
            let oldIndex = 0;
            let newIndex = 0;
            const merged = [];
            for (let i = 0; i < restoredObjs.length + sortableOld.length; i++){
                if (oldIndex === sortableOld.length) {
                    merged.push(restoredObjs[newIndex]);
                    newIndex++;
                    continue;
                } else if (newIndex === restoredObjs.length) {
                    merged.push(sortableOld[oldIndex]);
                    oldIndex++;
                    continue;
                }

                let oldEntry = sortableOld[oldIndex];
                let newEntry = restoredObjs[newIndex];
                if (oldEntry.pr >= newEntry.pr) {
                    merged.push(oldEntry);
                    oldIndex++;
                }
                if (oldEntry.pr <= newEntry.pr) {
                    merged.push(newEntry);
                    newIndex++;
                }

                // If there was a tie, increment i an extra time so we don't overrun the end
                if (oldEntry.pr === newEntry.pr) {
                    i++;
                }
            }

            // Rotate array
            while (merged[0].id !== oldStarterPR) {
                merged.push(merged.shift());
            }

            // Set
            Campaign().set('turnorder', JSON.stringify(merged));
            sendChat(sname, '/w gm Turn Order restored.');
        }
    });
});
//if (MarkStop) MarkStop('Standby');
