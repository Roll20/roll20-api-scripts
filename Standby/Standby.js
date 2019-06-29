
on('ready', () => {
    const mcname = 'Standby';
    const StatusPrefix = 'status_';
    const StandbyIcon = 'interdiction';
    const v = 0.1;

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
        const isYank = msg.content.endsWith('yank');
        if(Campaign().get('turnorder') === '') {
            Campaign().set('turnorder','[]');
        }
        const oldOrder = JSON.parse(Campaign().get('turnorder'));
        const yankedIds = {};
        const restoredObjs = [];// NOTE: These are not yet in the string format required
        msg.selected.forEach((selection) => {
            let token = getObj('graphic', selection._id);

            // Yank it from initiative order and write
            if (isYank) {
                let pr = -1;
                for (let i = 0; i < oldOrder.length; i++) {
                    const entry = oldOrder[i];
                    if (entry['id'] === token._id) {
                        pr = parseFloat(entry['pr']);
                        yankedIds[entry['id']] = true;
                        break;
                    }
                }
                const noDecimal = 100*pr;
                //token.set(StandbyIcon, "" + noDecimal);
                UpdateStatusValue(token, StandbyIcon, noDecimal);
            }
            // Add back to initiative order and remove status value
            else {
                const initVal = GetStatusValue(token, StandbyIcon) / 100;
                restoredObjs.push({
                    id: selection._id,
                    pr: initVal
                });
            }
        });
        
        const newOrder = [];

        // Yank out the chosen ids
        if (isYank) {
            for (let i = 0; i < oldOrder.length; i++) {
                const entry = oldOrder[i];
                if (!yankedIds[entry['id']]) {
                    newOrder.push(entry);
                }
            }
        }
        // Insert the chosen ids, accounting for the circular nature of initiative
        else {
            // Sort the restored list
            restoredObjs.sort((a, b) => (a.pr > b.pr ? -1 : 1));

            // Get the location of the maximum so we know the offset in the future.
            let maxIndex = -1;
            let maxId = '';
            let maxVal = -2;
            const sortableOld = [];
            for (let i = 0; i < oldOrder.length; i++) {
                const entry = oldOrder[i];
                const val = parseFloat(entry['pr']);
                if (val > maxVal) {
                    maxVal = val;
                    maxId = entry['id'];
                    maxIndex = i;
                    sortableOld.push({
                        id: entry['id'],
                        pr: val
                    })
                }
            }
            sortableOld.sort((a, b) => (a.pr > b.pr ? -1 : 1));

            // Merge the lists into one sorted list
            let oldIndex = 0;
            let newIndex = 0;
            const merged = [];
            for (let i = 0; i < newOrder.length + sortableOld.length; i++){
                oldEntry = sortableOld[oldIndex];
                newEntry = newOrder[newIndex];
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
            while (merged.length > 0 && merged[0].id !== maxId) {
                merged.push(merged.shift());
            }

            // Convert to Roll20 version
            for (let i = 0; i < merged.length; i++) {
                newOrder.push({
                    'id': '' + merged[i].id,
                    'pr': '' + merged[i].pr
                });
            }
        }

        // Set
        Campaign().set('turnorder', JSON.stringify(newOrder));
    });
});
