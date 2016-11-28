/*global
    _, log, on, Campaign, getObj, toBack, randomInteger, sendChat, findObjs, createObj, isGM
*/
/*jslint for:true */
var DungeonUtils = (function (module) {
    'use strict';
    // USAGE: Set the following 3 constants from images in your library
    // FLOOR_TILE_IMAGE should be the image you want to use as the dungeon floor
    // WALL_TILE_IMAGE is for rendering the edges of your dungeons
    // EMPTY_TILE_IMAGE is for tiles the players can't see. It can be an entirely black image you upload.
    // If you're lazy, WALL_TILE_IMAGE and EMPTY_TILE_IMAGE can be the same image.
    // Additionally, set the FLOOR_TILE_IMAGE_STRIDE if your tile image is multiple tiles wide
    var FLOOR_TILE_IMAGE = 'https://s3.amazonaws.com/files.d20.io/images/313023/EGpowtCaGhZOJ2tMKY4QpA/thumb.png?1351077365';
    var WALL_TILE_IMAGE = 'https://s3.amazonaws.com/files.d20.io/images/64971/thumb.jpg?1340946181';
    var EMPTY_TILE_IMAGE = 'https://s3.amazonaws.com/files.d20.io/images/7010402/aLTw_YWoccITUMNE5ZtLbw/thumb.png?1420511546';

    var FLOOR_TILE_IMAGE_STRIDE = 2; // The width of the floor tile image in tiles
    //----------------------------------------------------------------------------

    var TILE_EMPTY = 0;
    var TILE_WALL = 1;
    var TILE_FLOOR = 2;

    var SIDE_LENGTH = 70;
    var QUARTER_LENGTH = SIDE_LENGTH / 4;
    var HALF_LENGTH = SIDE_LENGTH / 2;
    var THREE_QUARTER_LENGTH = 3 * SIDE_LENGTH / 4;

    // TODO: Make this return the ID of the page the GM is viewing
    module.getPageId = function () {
        return new Campaign().get('playerpageid');
    };

    module.getPage = function () {
        return getObj('page', module.getPageId());
    };

    // Random dungeon generation algorithm
    // Credit to Big Bad Waffle for original algorithm (http://bigbadwofl.me/random-dungeon-generator/)
    module.getDungeonMap = function (minRoomSize, maxRoomSize) {
        var MAX_FAILURES = 50;

        var page = module.getPage();
        var mapWidth = page.get('width');
        var mapHeight = page.get('height');

        // Initialize 2d array
        var map = _.range(mapWidth).map(function () {
            return _.range(mapHeight).map(function () {
                return TILE_EMPTY;
            });
        });

        var rooms = [];

        // Checks to see if the proposed room
        // collides with (or touches) any other room in the dungeon
        function isCollision(room) {
            return rooms.some(function (other) {
                // Hitboxes are expanded by 1
                return !((room.right < other.left - 1) ||
                        (room.left > other.right + 1) ||
                        (room.bottom < other.top - 1) ||
                        (room.top > other.bottom + 1));
            });
        }

        function getDistance(roomA, roomB) {
            return Math.min(
                Math.abs(roomA.left - roomB.right),
                Math.abs(roomA.right - roomB.left),
                Math.abs(roomA.top - roomB.bottom),
                Math.abs(roomA.bottom - roomB.top)
            );
        }

        // Gets the closest other room
        function getClosestRoom(room) {
            if (rooms.length === 1) {
                // Edge case: Room can be considered
                // its own neighbor if it's the only room
                return room;
            }
            return rooms.filter(function (other) {
                return other !== room;
            }).reduce(function (prev, current) {
                if (getDistance(room, current) < getDistance(room, prev)) {
                    return current;
                } else {
                    return prev;
                }
            });
        }

        function getRandomInt(low, high) {
            return low - 1 + randomInteger(high - low + 1);
        }

        var failures = 0;
        var room;
        // Repeatedly attempt to place a random room
        while (failures < MAX_FAILURES) {
            room = {
                top: randomInteger(mapHeight - maxRoomSize - 1),
                left: randomInteger(mapWidth - maxRoomSize - 1),
                width: getRandomInt(minRoomSize, maxRoomSize),
                height: getRandomInt(minRoomSize, maxRoomSize)
            };
            room.bottom = room.top + room.height - 1;
            room.right = room.left + room.width - 1;
            if (isCollision(room)) {
                failures += 1;
            } else {
                rooms.push(room);
            }
        }

        // Fill in room tiles
        rooms.forEach(function (room) {
            var x;
            var y;
            for (x = room.left; x <= room.right; x += 1) {
                for (y = room.top; y <= room.bottom; y += 1) {
                    map[x][y] = TILE_FLOOR;
                }
            }
        });

        // Place hallways
        rooms.forEach(function (room) {
            var target = getClosestRoom(room);
            var x = getRandomInt(room.left, room.right);
            var y = getRandomInt(room.top, room.bottom);
            var targetX = getRandomInt(target.left, target.right);
            var targetY = getRandomInt(target.top, target.bottom);
            while (x !== targetX) {
                x += (x < targetX)
                    ? 1
                    : -1;
                map[x][y] = TILE_FLOOR;
            }
            while (y !== targetY) {
                y += (y < targetY)
                    ? 1
                    : -1;
                map[x][y] = TILE_FLOOR;
            }
        });

        // Mark floor-adjacent walls as walls
        map.forEach(function (col, x) {
            col.forEach(function (cell, y) {
                if (cell === TILE_FLOOR) {
                    var xx;
                    var yy;
                    for (xx = x - 1; xx <= x + 1; xx += 1) {
                        for (yy = y - 1; yy <= y + 1; yy += 1) {
                            if (map[xx][yy] === TILE_EMPTY) {
                                map[xx][yy] = TILE_WALL;
                            }
                        }
                    }
                }
            });
        });

        return map;
    };

    module.cleanup = function () {
        findObjs({
            _pageid: module.getPageId(),
            gmnotes: 'randommap_tile'
        }).forEach(function (item) {
            item.remove();
        });
        findObjs({
            _pageid: module.getPageId(),
            type: 'path'
        }).forEach(function (item) {
            item.remove();
        });
    };

    module.placeFloorTiles = function (image, stride) {
        var page = module.getPage();
        var pageId = page.get('id');
        var width = page.get('width');
        var height = page.get('height');
        var x;
        var y;
        stride = +(stride || FLOOR_TILE_IMAGE_STRIDE);
        for (x = 0; x < width; x += stride) {
            for (y = 0; y < height; y += stride) {
                toBack(createObj('graphic', {
                    imgsrc: image || FLOOR_TILE_IMAGE,
                    pageid: pageId,
                    top: x * SIDE_LENGTH + HALF_LENGTH * stride,
                    left: y * SIDE_LENGTH + HALF_LENGTH * stride,
                    width: SIDE_LENGTH * stride,
                    height: SIDE_LENGTH * stride,
                    layer: 'map',
                    gmnotes: 'randommap_tile'
                }));
            }
        }
    };

    module.placeDungeon = function (map) {
        map.forEach(function (col, x) {
            col.forEach(function (cellType, y) {
                module.placeTile(x, y, cellType);
            });
        });
    };

    module.placeDynamicLighting = function (map) {
        var pageId = module.getPageId();

        function safeIsWall(x, y) {
            var col = map[x];
            return !!col && col[y] === TILE_WALL;
        }

        map.forEach(function (col, x) {
            col.forEach(function (cellType, y) {
                if (cellType === TILE_WALL) {
                    // The boundaries of the dynamic lighting tile will depend
                    // on the neighbors. Two neighbors' lighting tiles will meet,
                    // but a wall next to floor will not have that edge completely
                    // covered so that players can see some of the wall.
                    var isLeftWall = safeIsWall(x - 1, y);
                    var isUpperWall = safeIsWall(x, y - 1);
                    var isRightWall = safeIsWall(x + 1, y);
                    var isLowerWall = safeIsWall(x, y + 1);
                    var isUpperLeftWall = safeIsWall(x - 1, y - 1);
                    var isUpperRightWall = safeIsWall(x + 1, y - 1);
                    var isLowerRightWall = safeIsWall(x + 1, y + 1);
                    var isLowerLeftWall = safeIsWall(x - 1, y + 1);
                    var x1 = isLeftWall
                        ? 0
                        : QUARTER_LENGTH;
                    var y1 = isUpperWall
                        ? 0
                        : QUARTER_LENGTH;
                    var x2 = isRightWall
                        ? SIDE_LENGTH
                        : THREE_QUARTER_LENGTH;
                    var y2 = isLowerWall
                        ? SIDE_LENGTH
                        : THREE_QUARTER_LENGTH;
                    var lines = [
                        [x1, y1],
                        [x2, y1],
                        [x2, y2],
                        [x1, y2]
                    ];
                    if (!isLowerLeftWall && isLowerWall && isLeftWall) {
                        lines.splice(3, 1,
                                [QUARTER_LENGTH, SIDE_LENGTH],
                                [QUARTER_LENGTH, THREE_QUARTER_LENGTH],
                                [0, THREE_QUARTER_LENGTH]);
                    }
                    if (!isLowerRightWall && isLowerWall && isRightWall) {
                        lines.splice(2, 1,
                                [SIDE_LENGTH, THREE_QUARTER_LENGTH],
                                [THREE_QUARTER_LENGTH, THREE_QUARTER_LENGTH],
                                [THREE_QUARTER_LENGTH, SIDE_LENGTH]);
                    }
                    if (!isUpperRightWall && isUpperWall && isRightWall) {
                        lines.splice(1, 1,
                                [THREE_QUARTER_LENGTH, 0],
                                [THREE_QUARTER_LENGTH, QUARTER_LENGTH],
                                [SIDE_LENGTH, QUARTER_LENGTH]);
                    }
                    if (!isUpperLeftWall && isUpperWall && isLeftWall) {
                        lines.splice(0, 1,
                                [0, QUARTER_LENGTH],
                                [QUARTER_LENGTH, QUARTER_LENGTH],
                                [QUARTER_LENGTH, 0]);
                    }
                    var first = lines.slice(-1)[0].slice();
                    lines.forEach(function (line) {
                        line.unshift('L');
                    });
                    first.unshift('M');
                    lines.unshift(first);
                    createObj('path', {
                        pageid: pageId,
                        // Note, gmnotes doesn't work as I expected
                        // for using findObjs. The cleanup function
                        // targets paths separately
                        gmnotes: 'randommap_tile',
                        fill: '#0000ff',
                        stroke: '#ff0000',
                        layer: 'walls',
                        top: y * SIDE_LENGTH + HALF_LENGTH,
                        left: x * SIDE_LENGTH + HALF_LENGTH,
                        stroke_width: 5,
                        width: SIDE_LENGTH,
                        height: SIDE_LENGTH,
                        //scaleX: SIDE_LENGTH,
                        //scaleY: SIDE_LENGTH,
                        path: JSON.stringify(lines)
                    });
                }
            });
        });
    };

    module.placeTile = function (x, y, type) {
        var tile;
        switch (type) {
        case TILE_EMPTY:
            tile = EMPTY_TILE_IMAGE;
            break;
        case TILE_WALL:
            tile = WALL_TILE_IMAGE;
            break;
        case TILE_FLOOR:
            // Floor tiles are handled separately
            return;
        }
        toBack(createObj('graphic', {
            imgsrc: tile,
            pageid: module.getPageId(),
            top: y * SIDE_LENGTH + HALF_LENGTH,
            left: x * SIDE_LENGTH + HALF_LENGTH,
            width: SIDE_LENGTH,
            height: SIDE_LENGTH,
            layer: 'map',
            gmnotes: 'randommap_tile'
        }));
    };

    return module;
}({}));

on('ready', function () {
    'use strict';
    log('DungeonUtils Ready');
    on('chat:message', function (msg) {
        log('DungeonUtils recieved message', msg);
        try {
            var content = msg.content.trim().split(/\s+/);
            var command = content[0];
            var subcommand = content[1];
            var params = content.slice(2).reduce(function (parms, item) {
                if (item.indexOf('=') >= 0) {
                    var parts = item.split('=');
                    parms[parts[0]] = parts[1];
                } else {
                    parms[item] = true;
                }
                return parms;
            }, {});

            // Handle aliases
            [['wall', 'w'], ['floor', 'f'], ['stride', 's']].forEach(function (param) {
                var option = param[0];
                var alias = param[1];
                if (params[alias]) {
                    if (params[option]) {
                        throw new Error('Parameter `' + alias + ' already specified with `' + option + '`');
                    }
                    params[option] = params[alias];
                }
            });

            if (msg.type === 'api' && (command === '!dungeonutils' || command === '!du')) {
                if (!playerIsGM(msg.playerid)) {
                    throw new Error('Insufficient privileges');
                }

                var map;
                switch (subcommand) {
                case 'dungeon':
                    DungeonUtils.cleanup();
                    map = DungeonUtils.getDungeonMap(
                        params.minRoomSize || 5,
                        params.maxRoomSize || 10
                    );
                    DungeonUtils.placeDungeon(map, params.wall);
                    DungeonUtils.placeDynamicLighting(map);

                    // Tiles move to back, so floor is placed last
                    DungeonUtils.placeFloorTiles(params.floor, params.stride);
                    break;
                case 'paper':
                    DungeonUtils.cleanup();
                    DungeonUtils.placeFloorTiles(params.floor, params.stride);
                    break;
                case 'clear':
                    DungeonUtils.cleanup();
                    break;
                default:
                    throw new Error('Subcommand `' + subcommand + '` not recognized');
                }
            }
        } catch (error) {
            sendChat('DungeonUtils', '/w ' + msg.who + ' ' + error);
        }
    });
});