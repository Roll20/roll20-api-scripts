var RollableTableManager = RollableTableManager || (function () {
    'use strict';

    var SCRIPT = 'Rollable Table Manager';
    var COMMAND = '!tables';
    var PAGE_SIZE = 25;

    function html(v) {
        return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function scText(v) {
        return html(v).replace(/\|/g, '&#124;')
            .replace(/\{\{/g, '&#123;&#123;')
            .replace(/\}\}/g, '&#125;&#125;');
    }

    function button(label, command, colour) {
        return '<a style="background:' + (colour || '#3f6b9a') +
            ';color:#fff;padding:4px 7px;margin:2px;border-radius:3px;' +
            'text-decoration:none;display:inline-block;" href="' +
            command + '">' + html(label) + '</a>';
    }

    function whisper(message) {
        sendChat(SCRIPT, '/w gm ' + message);
    }

    function data() {
        state.RollableTableManager = state.RollableTableManager || {};
        state.RollableTableManager.favorites =
            state.RollableTableManager.favorites || {};
        state.RollableTableManager.outputModes =
            state.RollableTableManager.outputModes || {};
        return state.RollableTableManager;
    }

    function favorites(playerId) {
        var d = data();
        d.favorites[playerId] = d.favorites[playerId] || {};
        return d.favorites[playerId];
    }

    function outputMode(playerId) {
        return data().outputModes[playerId] || 'native';
    }

    function setOutputMode(playerId, mode) {
        data().outputModes[playerId] =
            mode === 'scriptcards' ? 'scriptcards' : 'native';
    }

    function isFavorite(playerId, tableId) {
        return !!favorites(playerId)[tableId];
    }

    function toggleFavorite(playerId, tableId) {
        if (isFavorite(playerId, tableId)) {
            delete favorites(playerId)[tableId];
        } else {
            favorites(playerId)[tableId] = true;
        }
    }

    function getTables() {
        return findObjs({ _type: 'rollabletable' }).sort(function (a, b) {
            return a.get('name').localeCompare(b.get('name'), undefined, {
                sensitivity: 'base'
            });
        });
    }

    function getItems(tableId) {
        return findObjs({
            _type: 'tableitem',
            _rollabletableid: tableId
        }).sort(function (a, b) {
            return a.get('name').localeCompare(b.get('name'), undefined, {
                sensitivity: 'base'
            });
        });
    }

    function getFavoriteTables(playerId) {
        var saved = favorites(playerId);
        return getTables().filter(function (table) {
            return saved[table.id];
        });
    }

    function groupFor(name) {
        var first = String(name || '').charAt(0).toUpperCase();
        if (/^[A-Z]$/.test(first)) { return first; }
        if (/^[0-9]$/.test(first)) { return '0-9'; }
        return 'Other';
    }

    function makePage(items, requestedPage) {
        var total = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
        var current = Math.max(0, Math.min(requestedPage, total - 1));
        return {
            current: current,
            total: total,
            items: items.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE)
        };
    }

    function showLetters(playerId) {
        var counts = {};
        var groups = ['0-9'];
        var i;

        getTables().forEach(function (table) {
            var group = groupFor(table.get('name'));
            counts[group] = (counts[group] || 0) + 1;
        });

        for (i = 65; i <= 90; i++) {
            groups.push(String.fromCharCode(i));
        }
        groups.push('Other');

        var mode = outputMode(playerId);
        var output =
            '<div style="border:1px solid #444;background:#fff;padding:8px;">' +
            '<b>Rollable Tables</b><br>' +
            button('Favorites (' + getFavoriteTables(playerId).length + ')',
                COMMAND + ' --favorites --page 0', '#8b5a2b') +
            '<br><span style="font-size:0.9em;">Roll output: ' +
            (mode === 'scriptcards' ? 'ScriptCards' : 'Native') + '</span><br>' +
            button('Native', COMMAND + ' --output native',
                mode === 'native' ? '#447a4b' : '#777') +
            button('ScriptCards', COMMAND + ' --output scriptcards',
                mode === 'scriptcards' ? '#447a4b' : '#777') +
            '<br>Choose a starting letter:<br>';

        groups.forEach(function (group) {
            if (counts[group]) {
                output += button(group + ' (' + counts[group] + ')',
                    COMMAND + ' --letter ' + group + ' --page 0');
            }
        });

        whisper(output + '</div>');
    }

    function showTables(group, requestedPage, playerId) {
        var tables = getTables().filter(function (table) {
            return groupFor(table.get('name')) === group;
        });

        if (!tables.length) {
            whisper('No tables were found in that group.');
            return;
        }

        var view = makePage(tables, requestedPage);
        var output =
            '<div style="border:1px solid #444;background:#fff;padding:8px;">' +
            '<b>Tables: ' + html(group) + '</b> — page ' +
            (view.current + 1) + ' of ' + view.total + '<br>';

        view.items.forEach(function (table) {
            output += '<div style="margin:6px 0;border-top:1px solid #ddd;' +
                'padding-top:4px;"><b>' + html(table.get('name')) + '</b><br>' +
                button('Roll', COMMAND + ' --roll ' + table.id, '#447a4b') +
                button('Edit', COMMAND + ' --edit-table ' + table.id +
                    ' --page 0', '#8b5a2b') +
                button(
                    isFavorite(playerId, table.id) ?
                        '★ Unfavorite' : '☆ Favorite',
                    COMMAND + ' --favorite ' + table.id +
                        ' --from ' + group + ' --page ' + view.current,
                    '#70528a'
                ) +
                '</div>';
        });

        if (view.current > 0) {
            output += button('Previous', COMMAND + ' --letter ' +
                group + ' --page ' + (view.current - 1));
        }
        if (view.current < view.total - 1) {
            output += button('Next', COMMAND + ' --letter ' +
                group + ' --page ' + (view.current + 1));
        }

        output += button('Letters', COMMAND) + '</div>';
        whisper(output);
    }

    function showFavorites(playerId, requestedPage) {
        var list = getFavoriteTables(playerId);
        var view = makePage(list, requestedPage);
        var output =
            '<div style="border:1px solid #444;background:#fff;padding:8px;">' +
            '<b>Your Favorite Tables</b> — page ' + (view.current + 1) +
            ' of ' + view.total + '<br>';

        if (!list.length) {
            output += '<i>You have not starred any tables yet.</i><br>';
        }

        view.items.forEach(function (table) {
            output += '<div style="margin:6px 0;border-top:1px solid #ddd;' +
                'padding-top:4px;"><b>' + html(table.get('name')) + '</b><br>' +
                button('Roll', COMMAND + ' --roll ' + table.id, '#447a4b') +
                button('Edit', COMMAND + ' --edit-table ' + table.id +
                    ' --page 0', '#8b5a2b') +
                button('★ Unfavorite', COMMAND + ' --favorite ' + table.id +
                    ' --from favorites --page ' + view.current, '#a33') +
                '</div>';
        });

        if (view.current > 0) {
            output += button('Previous', COMMAND + ' --favorites --page ' +
                (view.current - 1));
        }
        if (view.current < view.total - 1) {
            output += button('Next', COMMAND + ' --favorites --page ' +
                (view.current + 1));
        }

        output += button('Letters', COMMAND) + '</div>';
        whisper(output);
    }

    function showEditor(tableId, requestedPage, playerId) {
        var table = getObj('rollabletable', tableId);

        if (!table) {
            whisper('That table no longer exists.');
            return;
        }

        var view = makePage(getItems(tableId), requestedPage);
        var output =
            '<div style="border:1px solid #444;background:#fff;padding:8px;">' +
            '<b>Editing: ' + html(table.get('name')) + '</b><br>' +
            button(
                isFavorite(playerId, tableId) ?
                    '★ Unfavorite' : '☆ Favorite',
                COMMAND + ' --favorite ' + tableId +
                    ' --from editor --page ' + view.current,
                '#70528a'
            ) +
            '<br>Items — page ' + (view.current + 1) + ' of ' +
            view.total + '<br>' +
            button('Add item', COMMAND + ' --add ' + tableId +
                ' --text ?{New item text|} --weight ?{Weight|1}', '#447a4b');

        if (!view.items.length) {
            output += '<br><i>This table has no items yet.</i>';
        }

        view.items.forEach(function (item) {
            output += '<div style="margin:6px 0;border-top:1px solid #ddd;' +
                'padding-top:4px;"><b>' + html(item.get('name')) +
                '</b> (weight: ' + html(item.get('weight')) + ')<br>' +
                button('Change', COMMAND + ' --change ' + item.id +
                    ' --table ' + tableId + ' --page ' + view.current +
                    ' --text ?{Replacement text|} --weight ?{New weight|' +
                    item.get('weight') + '}', '#8b5a2b') +
                button('Delete', COMMAND + ' --delete ' + item.id +
                    ' --table ' + tableId + ' --page ' + view.current +
                    ' --confirm ?{Delete this item?|No,0|Yes,1}', '#a33') +
                '</div>';
        });

        if (view.current > 0) {
            output += button('Previous', COMMAND + ' --edit-table ' +
                tableId + ' --page ' + (view.current - 1));
        }
        if (view.current < view.total - 1) {
            output += button('Next', COMMAND + ' --edit-table ' +
                tableId + ' --page ' + (view.current + 1));
        }

        output += button('Letters', COMMAND) + '</div>';
        whisper(output);
    }

    function outputRoll(playerId, tableName, result) {
        if (outputMode(playerId) === 'scriptcards') {
    sendChat(
        SCRIPT,
        '!scriptcard {{ ' +
        '--#whisper|GM ' +
        '--#title|' + scText(tableName) + ' ' +
        '--+Result|' + scText(result) +
        ' }}'
    );
    return;
}

        whisper(
            '<div style="border:1px solid #444;background:#fff;padding:8px;">' +
            '<b>Table:</b> ' + html(tableName) + '<br>' +
            '<b>Result:</b> ' + html(result) + '</div>'
        );
    }

    function rollTable(tableId, playerId) {
        var table = getObj('rollabletable', tableId);
        var items = getItems(tableId);
        var total = 0;
        var selected;

        if (!table || !items.length) {
            whisper('That table has no items to roll.');
            return;
        }

        items.forEach(function (item) {
            total += Math.max(0, parseInt(item.get('weight'), 10) || 0);
        });

        if (!total) {
            whisper('That table has no items with a usable weight.');
            return;
        }

        var target = randomInteger(total);

        items.some(function (item) {
            target -= Math.max(0, parseInt(item.get('weight'), 10) || 0);
            if (target <= 0) {
                selected = item;
                return true;
            }
            return false;
        });

        outputRoll(playerId, table.get('name'), selected.get('name'));
    }

    function handle(msg) {
        if (msg.type !== 'api' || msg.content.indexOf(COMMAND) !== 0 ||
                !playerIsGM(msg.playerid)) {
            return;
        }

        var pageMatch = msg.content.match(/--page\s+(\d+)/i);
        var currentPage = pageMatch ? parseInt(pageMatch[1], 10) : 0;
        var outputMatch = msg.content.match(/--output\s+(native|scriptcards)/i);
        var favoriteMatch = msg.content.match(
            /--favorite\s+(\S+)\s+--from\s+(\S+)\s+--page\s+(\d+)/i
        );
        var addMatch = msg.content.match(
            /--add\s+(\S+)\s+--text\s+([\s\S]*?)\s+--weight\s+(\S+)\s*$/i
        );
        var changeMatch = msg.content.match(
            /--change\s+(\S+)\s+--table\s+(\S+)\s+--page\s+(\d+)\s+--text\s+([\s\S]*?)\s+--weight\s+(\S+)\s*$/i
        );
        var deleteMatch = msg.content.match(
            /--delete\s+(\S+)\s+--table\s+(\S+)\s+--page\s+(\d+)\s+--confirm\s+1/i
        );
        var rollMatch = msg.content.match(/--roll\s+(\S+)/i);
        var editorMatch = msg.content.match(/--edit-table\s+(\S+)/i);
        var letterMatch = msg.content.match(/--letter\s+(\S+)/i);

        if (outputMatch) {
            setOutputMode(msg.playerid, outputMatch[1]);
            showLetters(msg.playerid);
            return;
        }

        if (favoriteMatch) {
            toggleFavorite(msg.playerid, favoriteMatch[1]);

            if (favoriteMatch[2] === 'favorites') {
                showFavorites(msg.playerid, parseInt(favoriteMatch[3], 10));
            } else if (favoriteMatch[2] === 'editor') {
                showEditor(favoriteMatch[1],
                    parseInt(favoriteMatch[3], 10), msg.playerid);
            } else {
                showTables(favoriteMatch[2],
                    parseInt(favoriteMatch[3], 10), msg.playerid);
            }
            return;
        }

        if (addMatch) {
            if (addMatch[2].trim()) {
                createObj('tableitem', {
                    _rollabletableid: addMatch[1],
                    name: addMatch[2].trim(),
                    weight: Math.max(1, parseInt(addMatch[3], 10) || 1)
                });
            }
            showEditor(addMatch[1], 0, msg.playerid);
            return;
        }

        if (changeMatch) {
            var item = getObj('tableitem', changeMatch[1]);
            if (item && changeMatch[4].trim()) {
                item.set({
                    name: changeMatch[4].trim(),
                    weight: Math.max(1, parseInt(changeMatch[5], 10) || 1)
                });
            }
            showEditor(changeMatch[2], parseInt(changeMatch[3], 10),
                msg.playerid);
            return;
        }

        if (deleteMatch) {
            var removed = getObj('tableitem', deleteMatch[1]);
            if (removed) { removed.remove(); }
            showEditor(deleteMatch[2], parseInt(deleteMatch[3], 10),
                msg.playerid);
            return;
        }

        if (rollMatch) {
            rollTable(rollMatch[1], msg.playerid);
            return;
        }

        if (editorMatch) {
            showEditor(editorMatch[1], currentPage, msg.playerid);
            return;
        }

        if (/--favorites/i.test(msg.content)) {
            showFavorites(msg.playerid, currentPage);
            return;
        }

        if (letterMatch) {
            showTables(letterMatch[1], currentPage, msg.playerid);
            return;
        }

        showLetters(msg.playerid);
    }

    on('ready', function () {
        on('chat:message', handle);
        log(SCRIPT + ' is ready. Run ' + COMMAND + ' as a GM.');
    });

    return {};
}());