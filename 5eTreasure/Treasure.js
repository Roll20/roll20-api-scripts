/*
 * Version 0.1.4
 * Made By Robin Kuiper
 * Skype: RobinKuiper.eu
 * Discord: Atheos#1095
 * Roll20: https://app.roll20.net/users/1226016/robin
 * Github: https://github.com/RobinKuiper/Roll20APIScripts
 * Reddit: https://www.reddit.com/user/robinkuiper/
 * Patreon: https://patreon.com/robinkuiper
 * Paypal.me: https://www.paypal.me/robinkuiper
*/

var Treasure = Treasure || (function() {
    'use strict';

    // Styling for the chat responses.
    const styles = {
        reset: 'padding: 0; margin: 0;',
        menu:  'background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;',
        button: 'background-color: #000; border: 1px solid #292929; border-radius: 3px; padding: 5px; color: #fff; text-align: center;',
        list: 'list-style: none;',
        float: {
            right: 'float: right;',
            left: 'float: left;'
        },
        overflow: 'overflow: hidden;',
        fullWidth: 'width: 100%;',
        underline: 'text-decoration: underline;',
        strikethrough: 'text-decoration: strikethrough'
    },
    script_name = 'Treasure',
    state_name = 'TREASURE',

    range = (start, end) => {
      return Array(end - start + 1).fill().map((_, idx) => start + idx)
    },

    treasureTables = {
        individual: [
            [
                { roll: range(1, 30), treasure: { cp: "5d6" } },
                { roll: range(31, 60), treasure: { sp: "4d6" } },
                { roll: range(61, 70), treasure: { ep: "3d6" } },
                { roll: range(71, 95), treasure: { gp: "3d6" } },
                { roll: range(96, 100), treasure: { pp: "1d6" } },
            ],
            [
                { roll: range(1, 30), treasure: { cp: "4d6*100", ep: "1d6*10" } },
                { roll: range(31, 60), treasure: { sp: "6d6*10", gp: "2d6*10" } },
                { roll: range(61, 70), treasure: { ep: "3d6*10", gp: "2d6*10" } },
                { roll: range(71, 95), treasure: { gp: "4d6*10" } },
                { roll: range(96, 100), treasure: { gp: "2d6*10", pp: "3d6" } },
            ],
            [
                { roll: range(1, 20), treasure: { sp: "4d6*100", gp: "1d6*100" } },
                { roll: range(21, 35), treasure: { ep: "1d6*100", gp: "1d6*100" } },
                { roll: range(36, 75), treasure: { gp: "2d6*100", pp: "1d6*10" } },
                { roll: range(76, 100), treasure: { gp: "2d6*100", pp: "2d6*10" } },
            ],
            [
                { roll: range(1, 15), treasure: { ep: "2d6*1000", gp: "8d6*100" } },
                { roll: range(16, 55), treasure: { gp: "1d6*1000", gp: "1d6*100" } },
                { roll: range(56, 100), treasure: { gp: "1d6*1000", pp: "2d6*100" } },
            ]
        ],
        hoard: [
            {
                coins: { cp: "6d6*100", sp: "3d6*100", gp: "2d6*10" },
                objects: [
                    { roll: range(1, 6) },
                    { roll: range(7, 16), treasure: [
                        { die: "2d6", type: "gems", worth: 10 },
                    ] },
                    { roll: range(17, 26), treasure: [
                        { die: "2d4", type: "art", worth: 25 }
                    ] },
                    { roll: range(27, 36), treasure: [
                        { die: "2d6", type: "gems", worth: 50 }
                    ] },
                    { roll: range(37, 44), treasure: [
                        { die: "2d6", type: "gems", worth: 10 },
                        { die: "1d6", type: "magic", table: "a"}
                    ] },
                    { roll: range(45, 52), treasure: [
                        { die: "2d4", type: "art", worth: 25 },
                        { die: "1d6", type: "magic", table: "a"}
                    ] },
                    { roll: range(53, 60), treasure:[
                        { die: "2d6", type: "gems", worth: 50 },
                        { die: "1d6", type: "magic", table: "a"}
                    ] },
                    { roll: range(61, 65), treasure: [
                        { die: "2d6", type: "gems", worth: 10 },
                        { die: "1d4", type: "magic", table: "b"}
                    ] },
                    { roll: range(66, 70), treasure: [
                        { die: "2d4", type: "art", worth: 25 },
                        { die: "1d4", type: "magic", table: "b"}
                    ] },
                    { roll: range(71, 75), treasure: [
                        { die: "2d6", type: "gems", worth: 50 },
                        { die: "1d4", type: "magic", table: "b"}
                    ] },
                    { roll: range(76, 78), treasure: [
                        { die: "2d6", type: "gems", worth: 10 },
                        { die: "1d4", type: "magic", table: "c"}
                    ] },
                    { roll: range(79, 80), treasure: [
                        { die: "2d4", type: "art", worth: 25 },
                        { die: "1d4", type: "magic", table: "c"}
                    ] },
                    { roll: range(81, 85), treasure: [
                        { die: "2d6", type: "gems", worth: 50 },
                        { die: "1d4", type: "magic", table: "c"}
                    ] },
                    { roll: range(86, 92), treasure: [
                        { die: "2d4", type: "art", worth: 25 },
                        { die: "1d4", type: "magic", table: "f"}
                    ] },
                    { roll: range(93, 97), treasure: [
                        { die: "2d6", type: "gems", worth: 50 },
                        { die: "1d4", type: "magic", table: "f"}
                    ] },
                    { roll: range(98, 99), treasure: [
                        { die: "2d4", type: "art", worth: 25 },
                        { die: "1", type: "magic", table: "g"}
                    ] },
                    { roll: [100], treasure: [
                        { die: "2d6", type: "gems", worth: 50 },
                        { die: "1", type: "magic", table: "g"}
                    ] },
                ]
            },
            {
                coins: { cp: "2d6*100", sp: "2d6*1000", gp: "6d6*100", pp: "3d6*10" },
                objects: [
                    { roll: range(1, 4) },
                    { roll: range(5, 10), treasure: [ 
                        { die: "2d4", worth: 25, type: "art" }
                    ] },
                    { roll: range(11, 16), treasure: [ 
                        { die: "3d6", worth: 50, type: "gems" }
                    ] },	
                    { roll: range(17, 22), treasure: [ 
                        { die: "3d6", worth: 100, type: "gems"}
                    ] },	
                    { roll: range(23, 28), treasure: [ 
                        { die: "2d4", worth: 250, type: "art" }
                    ] },		
                    { roll: range(29, 32), treasure: [ 
                        { die: "2d4", worth: 25, type: "art" }, 
                        { die: "1d6", table: "A", type: "magic" },
                    ] },
                    { roll: range(33, 36), treasure: [ 
                        { die: "3d6", worth: 50, type: "gems"	}, 
                        { die: "1d6", table: "A", type: "magic" },
                    ] },
                    { roll: range(37, 40), treasure: [ 
                        { die: "3d6", worth: 100, type: "gems"	}, 
                        { die: "1d6", table: "A", type: "magic" },
                    ] },
                    { roll: range(41, 44), treasure: [ 
                        { die: "2d4", worth: 250, type: "art" }, 
                        { die: "1d6", table: "A", type: "magic" },
                    ] },
                    { roll: range(45, 49), treasure: [ 
                        { die: "2d4", worth: 25, type: "art" }, 
                        { die: "1d4", table: "B", type: "magic" },
                    ] },
                    { roll: range(50, 54), treasure: [ 
                        { die: "3d6", worth: 50, type: "gems"	}, 
                        { die: "1d4", table: "B", type: "magic" },
                    ] },
                    { roll: range(55, 59), treasure: [ 
                        { die: "3d6", worth: 100, type: "gems"	}, 
                        { die: "1d4", table: "B", type: "magic" },
                    ] },
                    { roll: range(60, 63), treasure: [ 
                        { die: "2d4", worth: 250, type: "art" }, 
                        { die: "1d4", table: "B", type: "magic" },
                    ] },
                    { roll: range(64, 66), treasure: [ 
                        { die: "2d4", worth: 25, type: "art" }, 
                        { die: "1d4", table: "C", type: "magic" },
                    ] },
                    { roll: range(67, 69), treasure: [ 
                        { die: "3d6", worth: 50, type: "gems"	}, 
                        { die: "1d4", table: "C", type: "magic" },
                    ] },
                    { roll: range(70, 72), treasure: [ 
                        { die: "3d6", worth: 100, type: "gems"	}, 
                        { die: "1d4", table: "C", type: "magic" },
                    ] },
                    { roll: range(73, 74), treasure: [ 
                        { die: "2d4", worth: 250, type: "art" }, 
                        { die: "1d4", table: "C", type: "magic" },
                    ] },
                    { roll: range(75, 76), treasure: [ 
                        { die: "2d4", worth: 25, type: "art" }, 
                        { die: "1", table: "D", type: "magic" },
                    ] },
                    { roll: range(77, 78), treasure: [ 
                        { die: "3d6", worth: 50, type: "gems"	}, 
                        { die: "1", table: "D", type: "magic" },
                    ] },
                    { roll: [79], treasure: [ 
                        { die: "3d6", worth: 100, type: "gems"	}, 
                        { die: "1", table: "D", type: "magic" },
                    ] },
                    { roll: [80], treasure: [ 
                        { die: "2d4", worth: 250, type: "art" }, 
                        { die: "1", table: "D", type: "magic" },
                    ] },
                    { roll: range(81, 84), treasure: [ 
                        { die: "2d4", worth: 25, type: "art" }, 
                        { die: "1d4", table: "F", type: "magic" },
                    ] },
                    { roll: range(85, 88), treasure: [ 
                        { die: "3d6", worth: 50, type: "gems"	}, 
                        { die: "1d4", table: "F", type: "magic" },
                    ] },
                    { roll: range(89, 91), treasure: [ 
                        { die: "3d6", worth: 100, type: "gems"	}, 
                        { die: "1d4", table: "F", type: "magic" },
                    ] },
                    { roll: range(92, 94), treasure: [ 
                        { die: "2d4", worth: 250, type: "art" }, 
                        { die: "1d4", table: "F", type: "magic" },
                    ] },
                    { roll: range(95, 96), treasure: [ 
                        { die: "3d6", worth: 100, type: "gems"	}, 
                        { die: "1d4", table: "G", type: "magic" },
                    ] },
                    { roll: range(97, 98), treasure: [ 
                        { die: "2d4", worth: 250, type: "art" }, 
                        { die: "1d4", table: "G", type: "magic" },
                    ] },
                    { roll: [99], treasure: [ 
                        { die: "3d6", worth: 100, type: "gems"	}, 
                        { die: "1", table: "H", type: "magic" },
                    ] },
                    { roll:[100], treasure: [ 
                        { die: "2d4", worth: 250, type: "art" }, 
                        { die: "1", table: "H", type: "magic" },
                    ] },
                ]
            },
            {
                coins: { gp: "4d6*1000", pp: "5d6*100" },
                objects: [
                    { roll: range(1, 3) },
                    { roll: range(4, 6), treasure: [
                        { die: "2d4", worth: 250, type: "art" }, 
                    ] } ,
                    { roll: range(7, 9), treasure: [
                        { die: "2d4", worth: 750, type: "art" }, 
                    ] } ,
                    { roll: range(10, 12), treasure: [
                        { die: "3d6", worth: 500, type: "gems" }, 
                    ] } ,
                    { roll: range(13, 15), treasure: [
                        { die: "3d6", worth: 1000, type: "gems" }, 
                    ] } ,
                    { roll: range(16, 19), treasure: [
                        { die: "2d4", worth: 250, type: "art" }, 
                        { type: "magic", die: "1d4", table: "A" }, 
                        { type: "magic", die: "1d6", table: "B" }
                    ] } ,
                    { roll: range(20, 23), treasure: [
                        { die: "2d4", worth: 750, type: "art" }, 
                        { type: "magic", die: "1d4", table: "A" }, 
                        { type: "magic", die: "1d6", table: "B" }
                    ] } ,
                    { roll: range(24, 26), treasure: [
                        { die: "3d6", worth: 500, type: "gems" }, 
                        { type: "magic", die: "1d4", table: "A" }, 
                        { type: "magic", die: "1d6", table: "B" }
                    ] } ,
                    { roll: range(27, 29), treasure: [
                        { die: "3d6", worth: 1000, type: "gems" }, 
                        { type: "magic", die: "1d4", table: "A" }, 
                        { type: "magic", die: "1d6", table: "B" }
                    ] } ,
                    { roll: range(30, 35), treasure: [
                        { die: "2d4", worth: 250, type: "art" }, 
                        { type: "magic", die: "1d6", table: "C" },
                    ] } ,
                    { roll: range(36, 40), treasure: [
                        { die: "2d4", worth: 750, type: "art" }, 
                        { type: "magic", die: "1d6", table: "C" },
                    ] } ,
                    { roll: range(41, 45), treasure: [
                        { die: "3d6", worth: 500, type: "gems" }, 
                        { type: "magic", die: "1d6", table: "C" },
                    ] } ,
                    { roll: range(46, 50), treasure: [
                        { die: "3d6", worth: 1000, type: "gems" }, 
                        { type: "magic", die: "1d6", table: "C" },
                    ] } ,
                    { roll: range(51, 54), treasure: [
                        { die: "2d4", worth: 250, type: "art" }, 
                        { type: "magic", die: "1d4", table: "D" },
                    ] } ,
                    { roll: range(55, 58), treasure: [
                        { die: "2d4", worth: 750, type: "art" }, 
                        { type: "magic", die: "1d4", table: "D" },
                    ] } ,
                    { roll: range(59, 62), treasure: [
                        { die: "3d6", worth: 500, type: "gems" }, 
                        { type: "magic", die: "1d4", table: "D" },
                    ] } ,
                    { roll: range(63, 66), treasure: [
                        { die: "3d6", worth: 1000, type: "gems" }, 
                        { type: "magic", die: "1d4", table: "D" },
                    ] } ,
                    { roll: range(67, 68), treasure: [
                        { die: "2d4", worth: 250, type: "art" }, 
                        { type: "magic", die: 1, table: "E" },
                    ] } ,
                    { roll: range(69, 70), treasure: [
                        { die: "2d4", worth: 750, type: "art" }, 
                        { type: "magic", die: 1, table: "E" },
                    ] } ,
                    { roll: range(71, 72), treasure: [
                        { die: "3d6", worth: 500, type: "gems" }, 
                        { type: "magic", die: 1, table: "E" },
                    ] } ,
                    { roll: range(73, 74), treasure: [
                        { die: "3d6", worth: 1000, type: "gems" }, 
                        { type: "magic", die: 1, table: "E" },
                    ] } ,
                    { roll: range(75, 76), treasure: [
                        { die: "2d4", worth: 250, type: "art" }, 
                        { type: "magic", die: 1, table: "F" }                                  
                    ] } ,
                    { roll: range(77, 78), treasure: [
                        { die: "2d4", worth: 750, type: "art" }, 
                        { type: "magic", die: 1, table: "F" },
                        { type: "magic", die: "1d4", table: "G" },
                    ] } ,
                    { roll: range(79, 80), treasure: [
                        { die: "3d6", worth: 500, type: "gems" }, 
                        { type: "magic", die: 1, table: "F" },
                        { type: "magic", die: "1d4", table: "G" },
                    ] } ,
                    { roll: range(81, 82), treasure: [
                        { die: "3d6", worth: 1000, type: "gems" }, 
                        { type: "magic", die: 1, table: "F" },
                        { type: "magic", die: "1d4", table: "G" },
                    ] } ,
                    { roll: range(83, 85), treasure: [
                        { die: "2d4", worth: 250, type: "art" }, 
                        { type: "magic", die: "1d4", table: "H" },
                    ] } ,
                    { roll: range(86, 88), treasure: [
                        { die: "2d4", worth: 750, type: "art" }, 
                        { type: "magic", die: "1d4", table: "H" },
                    ] } ,
                    { roll: range(89, 90), treasure: [
                        { die: "3d6", worth: 500, type: "gems" }, 
                        { type: "magic", die: "1d4", table: "H" },
                    ] } ,
                    { roll: range(91, 92), treasure: [
                        { die: "3d6", worth: 1000, type: "gems" }, 
                        { type: "magic", die: "1d4", table: "H" },
                    ] } ,
                    { roll: range(93, 94), treasure: [
                        { die: "2d4", worth: 250, type: "art" }, 
                        { type: "magic", die: 1, table: "I" },
                    ] } ,
                    { roll: range(95, 96), treasure: [
                        { die: "2d4", worth: 750, type: "art" }, 
                        { type: "magic", die: 1, table: "I" },
                    ] } ,
                    { roll: range(97, 98), treasure: [
                        { die: "3d6", worth: 500, type: "gems" }, 
                        { type: "magic", die: 1, table: "I" },
                    ] } ,
                    { roll: range(99, 100), treasure: [
                        { die: "3d6", worth: 1000, type: "gems" }, 
                        { type: "magic", die: 1, table: "I" },
                    ] }
                ]
            },
            {
                coins: { gp: "12d6*1000", pp: "8d6*1000" },
                objects: [
                    { roll: range(1, 2) },
                    { roll: range(3, 5), treasure: [
                        { die: "3d6", worth: 1000, type: "gems" }, 
                        { type: "magic", die: "1d8", table: "C" },
                    ] } ,
                    { roll: range(6, 8), treasure: [
                        { die: "1d10", worth: 2500, type: "art" }, 
                        { type: "magic", die: "1d8", table: "C" },
                    ] } ,
                    { roll: range(9, 11), treasure: [
                        { die: "1d4", worth: 7500, type: "art" }, 
                        { type: "magic", die: "1d8", table: "C" },
                    ] } ,
                    { roll: range(12, 14), treasure: [
                        { die: "1d8", worth: 5000, type: "gems" }, 
                        { type: "magic", die: "1d8", table: "C" },
                    ] } ,
                    { roll: range(15, 22), treasure: [
                        { die: "3d6", worth: 1000, type: "gems" }, 
                        { type: "magic", die: "1d6", table: "D" },
                    ] } ,
                    { roll: range(23, 30), treasure: [
                        { die: "1d10", worth: 2500, type: "art" }, 
                        { type: "magic", die: "1d6", table: "D" },
                    ] } ,
                    { roll: range(31, 38), treasure: [
                        { die: "1d4", worth: 7500, type: "art" }, 
                        { type: "magic", die: "1d6", table: "D" },
                    ] } ,
                    { roll: range(39, 46), treasure: [
                        { die: "1d8", worth: 5000, type: "gems" }, 
                        { type: "magic", die: "1d6", table: "D" },
                    ] } ,
                    { roll: range(47, 52), treasure: [
                        { die: "3d6", worth: 1000, type: "gems" }, 
                        { type: "magic", die: "1d6", table: "E" },
                    ] } ,
                    { roll: range(53, 58), treasure: [
                        { die: "1d10", worth: 2500, type: "art" }, 
                        { type: "magic", die: "1d6", table: "E" },
                    ] } ,
                    { roll: range(59, 63), treasure: [
                        { die: "1d4", worth: 7500, type: "art" }, 
                        { type: "magic", die: "1d6", table: "E" },
                    ] } ,
                    { roll: range(64, 68), treasure: [
                        { die: "1d8", worth: 5000, type: "gems" }, 
                        { type: "magic", die: "1d6", table: "E" },
                    ] } ,
                    { roll: [69], treasure: [	
                        { die: "3d6", worth: 1000, type: "gems" }, 
                        { type: "magic", die: "1d4", table: "G" },
                    ] } ,
                    { roll: [70], treasure: [	
                        { die: "1d10", worth: 2500, type: "art" }, 
                        { type: "magic", die: "1d4", table: "G" },
                    ] } ,
                    { roll: [71], treasure: [	
                        { die: "1d4", worth: 7500, type: "art" }, 
                        { type: "magic", die: "1d4", table: "G" },
                    ] } ,
                    { roll: [72], treasure: [	
                        { die: "1d8", worth: 5000, type: "gems" }, 
                        { type: "magic", die: "1d4", table: "G" },
                    ] } ,
                    { roll: range(73, 74), treasure: [
                        { die: "3d6", worth: 1000, type: "gems" }, 
                        { type: "magic", die: "1d4", table: "H" },
                    ] } ,
                    { roll: range(75, 76), treasure: [
                        { die: "1d10", worth: 2500, type: "art" }, 
                        { type: "magic", die: "1d4", table: "H" },
                    ] } ,
                    { roll: range(77, 78), treasure: [
                        { die: "1d4", worth: 7500, type: "art" }, 
                        { type: "magic", die: "1d4", table: "H" },
                    ] } ,
                    { roll: range(79, 80), treasure: [
                        { die: "1d8", worth: 5000, type: "gems" }, 
                        { type: "magic", die: "1d4", table: "H" },
                    ] } ,
                    { roll: range(81, 85), treasure: [
                        { die: "3d6", worth: 1000, type: "gems" }, 
                        { type: "magic", die: "1d4", table: "I" },
                    ] } ,
                    { roll: range(86, 90), treasure: [
                        { die: "1d10", worth: 2500, type: "art" }, 
                        { type: "magic", die: "1d4", table: "I" },
                    ] } ,
                    { roll: range(91, 95), treasure: [
                        { die: "1d4", worth: 7500, type: "art" }, 
                        { type: "magic", die: "1d4", table: "I" },
                    ] } ,
                    { roll: range(96, 100), treasure: [
                        { die: "1d8", worth: 5000, type: "gems" }, 
                        { type: "magic", die: "1d4", table: "I" },
                    ] }
                ]
            }
        ]
    },

    gemTables = {
        10: [
            'Azurite (opaque mottled deep blue) (10G)',
            'Banded agate (translucent striped brown, blue, white, or red) (10G)',
            'Blue quartz (transparent pale blue) (10G)',
            'Eye agate (translucent circles of gray, white, brown, blue, or green) (10G)',
            'Hematite (opaque gray-black) (10G)',
            'Lapis lazuli (opaque light and dark blue with yellow flecks) (10G)',
            'Malachite (opaque striated light and dark green) (10G)',
            'Moss agate (translucent pink or yellow-white with mossy gray or green markings) (10G)',
            'Obsidian (opaque black) (10G)',
            'Rhodochrosite (opaque light pink) (10G)',
            'Tiger eye (translucent brown with golden center) (10G)',
            'Turquoise (opaque light blue-green) (10G)',
        ],
        50: [
            'Bloodstone (opaque dark gray with red flecks) (50G)',
            'Carnelian (opaque orange to red-brown) (50G)',
            'Chalcedony (opaque white) (50G)',
            'Chrysoprase (translucent green) (50G)',
            'Citrine (transparent pale yellow-brown) (50G)',
            'Jasper (opaque blue, black, or brown) (50G)',
            'Moonstone (translucent white with pale blue glow) (50G)',
            'Onyx (opaque bands of black and white, or pure black or white) (50G)',
            'Quartz (transparent white, smoky gray, or yellow) (50G)',
            'Sardonyx (opaque bands of red and white) (50G)',
            'Star rose quartz (translucent rosy stone with white star-shaped center) (50G)',
            'Zircon (transparent pale blue-green) (50G)',
        ],
        100: [
            'Amber (transparent watery gold to rich gold) (100G)',
            'Amethyst (transparent deep purple) (100G)',
            'Chrysoberyl (transparent yellow-green to pale green) (100G)',
            'Coral (opaque crimson) (100G)',
            'Garnet (transparent red, brown-green, or violet) (100G)',
            'Jade (translucent light green, deep green, or white) (100G)',
            'Jet (opaque deep black) (100G)',
            'Pearl (opaque lustrous white, yellow, or pink) (100G)',
            'Spinel (transparent red, red-brown, or deep green) (100G)',
            'Tourmaline (transparent pale green, blue, brown, or red) (100G)',
        ],
        500: [
            'Alexandrite (transparent dark green) (500G)',
            'Aquamarine (transparent pale blue-green) (500G)',
            'Black pearl (opaque pure black) (500G)',
            'Blue spinel (transparent deep blue) (500G)',
            'Peridot (transparent rich olive green) (500G)',
            'Topaz (transparent golden yellow) (500G)',
        ],
        1000: [
            'Black opal (translucent dark green with black mottling and golden flecks) (1.000G)',
            'Blue sapphire (transparent blue-white to medium blue) (1.000G)',
            'Emerald (transparent deep bright green) (1.000G)',
            'Fire opal (translucent fiery red) (1.000G)',
            'Opal (translucent pale blue with green and golden mottling) (1.000G)',
            'Star ruby (translucent ruby with white star-shaped center) (1.000G)',
            'Star sapphire (translucent blue sapphire with white star-shaped center) (1.000G)',
            'Yellow sapphire (transparent fiery yellow or yellow-green) (1.000G)',
        ],
        5000: [
            'Black sapphire (translucent lustrous black with glowing highlights) (5.000G)',
            'Diamond (transparent blue-white, canary, pink, brown, or blue) (5.000G)',
            'Jacinth (transparent fiery orange) (5.000G)',
            'Ruby (transparent clear red to deep crimson) (5.000G)',
        ]
    },

    artTables = {
        25: [
            'Silver ewer (25G)',
            'Carved bone statuette (25G)',
            'Small gold bracelet (25G)',
            'Cloth-of-gold vestments (25G)',
            'Black velvet mask stitched with silver thread (25G)',
            'Copper chalice with silver filigree (25G)',
            'Pair of engraved bone dice (25G)',
            'Small mirror set in a painted wooden frame (25G)',
            'Embroidered silk handkerchief (25G)',
            'Gold locket with a painted portrait inside (25G)',          
        ],
        250: [
            'Gold ring set with bloodstones (250G)',
            'Carved ivory statuette (250G)',
            'Large gold bracelet (250G)',
            'Silver necklace with a gemstone pendant (250G)',
            'Bronze crown (250G)',
            'Silk robe with gold embroidery (250G)',
            'Large well-made tapestry (250G)',
            'Brass mug with jade inlay (250G)',
            'Box of turquoise animal figurines (250G)',
            'Gold bird cage with electrum filigree (250G)',
        ],
        750: [
            'Silver chalice set with moonstones (750G)',
            'Silver-plated steel longsword with jet set in hilt (750G)',
            'Carved harp of exotic wood with ivory inlay and zircon gems (750G)',
            'Small gold idol (750G)',
            'Gold dragon comb set with red garnets as eyes (750G)',
            'Bottle stopper cork embossed with gold leaf and set with amethysts (750G)',
            'Ceremonial electrum dagger with a black pearl in the pommel (750G)',
            'Silver and gold brooch (750G)',
            'Obsidian statuette with gold fittings and inlay (750G)',
            'Painted gold war mask (750G)',
        ],
        2500: [
            'Fine gold chain set with a fire opal (2.500G)',
            'Old masterpiece painting (2.500G)',
            'Embroidered silk and velvet mantle set with numerous moonstones (2.500G)',
            'Platinum bracelet set with a sapphire (2.500G)',
            'Embroidered glove set with jewel chips (2.500G)',
            'Jeweled anklet (2.500G)',
            'Gold music box (2.500G)',
            'Gold circlet set with four aquamarines (2.500G)',
            'Eye patch with a mock eye set in blue sapphire and moonstone (2.500G)',
            'A necklace string of small pink pearls (2.500G)',
        ],
        7500: [
            'Jeweled gold crown (7.500G)',
            'Jeweled platinum ring (7.500G)',
            'Small gold statuette set with rubies (7.500G)',
            'Gold cup set with emeralds (7.500G)',
            'Gold jewelry box with platinum filigree (7.500G)',
            'Painted gold child’s sarcophagus (7.500G)',
            'Jade game board with solid gold playing pieces (7.500G)',
            'Bejeweled ivory drinking horn with gold filigree (7.500G)',
        ],
    },

    magicTables = {
        a: [
            { roll: range(1, 50), result: 'Potion of Healing' },
            { roll: range(51, 60), result: 'Spell Scroll (Cantrip)' },
            { roll: range(61, 70), result: 'Potion of Climbing' },
            { roll: range(71, 90), result: 'Spell Scroll (1st level)' },
            { roll: range(91, 94), result: 'Spell Scroll (2nd level)' },
            { roll: range(95, 98), result: 'Potion of Healing (Greater)' },
            { roll: [99], result: 'Bag of Holding' },
            { roll: [100], result: 'Driftglobe' },
        ],
        b: [
            { roll: range(1, 15), result: "Potion of healing (greater)" },
            { roll: range(16, 22), result: "Potion of fire breath" },
            { roll: range(23, 29), result: "Potion of resistance" },
            { roll: range(30, 34), result: "Ammunition, +1" },
            { roll: range(35, 39), result: "Potion of animal friendship" },
            { roll: range(40, 44), result: "Potion of hill giant strength" },
            { roll: range(45, 49), result: "Potion of growth" },
            { roll: range(50, 54), result: "Potion of water breathing" },
            { roll: range(55, 59), result: "Spell scroll (2nd level)" },
            { roll: range(60, 64), result: "Spell scroll (3rd level)" },
            { roll: range(65, 67), result: "Bag of holding" },
            { roll: range(68, 70), result: "Keoghtom’s ointment" },
            { roll: range(71, 73), result: "Oil of slipperiness" },
            { roll: range(74, 75), result: "Dust of disappearance" },
            { roll: range(76, 77), result: "Dust of dryness" },
            { roll: range(78, 79), result: "Dust of sneezing and choking" },
            { roll: range(80, 81), result: "Elemental gem" },
            { roll: range(82, 83), result: "Philter of love" },
            { roll: [84], result: "Alchemy jug" },
            { roll: [85], result: "Cap of water breathing" },
            { roll: [86], result: "Cloak of the manta ray" },
            { roll: [87], result: "Driftglobe" },
            { roll: [88], result: "Goggles of night" },
            { roll: [89], result: "Helm of comprehending languages" },
            { roll: [90], result: "Immovable rod" },
            { roll: [91], result: "Lantern of revealing" },
            { roll: [92], result: "Mariner’s armor" },
            { roll: [93], result: "Mithral armor" },
            { roll: [94], result: "Potion of poison" },
            { roll: [95], result: "Ring of swimming" },
            { roll: [96], result: "Robe of useful items" },
            { roll: [97], result: "Rope of climbing" },
            { roll: [98], result: "Saddle of the cavalier" },
            { roll: [99], result: "Wand of magic detection" },
            { roll: [100], result: "Wand of secrets" },
        ],
        c: [
            { roll: range(1, 15), result: "Potion of healing (superior)" },
            { roll: range(16, 22), result: "Spell scroll (4th level)" },
            { roll: range(23, 27), result: "Ammunition, +2" },
            { roll: range(28, 32), result: "Potion of clairvoyance" },
            { roll: range(33, 37), result: "Potion of diminution" },
            { roll: range(38, 42), result: "Potion of gaseous form" },
            { roll: range(43, 47), result: "Potion of frost giant strength" },
            { roll: range(48, 52), result: "Potion of stone giant strength" },
            { roll: range(53, 57), result: "Potion of heroism" },
            { roll: range(58, 62), result: "Potion of invulnerability" },
            { roll: range(63, 67), result: "Potion of mind reading" },
            { roll: range(68, 72), result: "Spell scroll (5th level)" },
            { roll: range(73, 75), result: "Elixir of health" },
            { roll: range(76, 78), result: "Oil of etherealness" },
            { roll: range(79, 81), result: "Potion of fire giant strength" },
            { roll: range(82, 84), result: "Quaal’s feather token" },
            { roll: range(85, 87), result: "Scroll of protection" },
            { roll: range(88, 89), result: "Bag of beans" },
            { roll: range(90, 91), result: "Bead of force" },
            { roll: [92], result: "Chime of opening" },
            { roll: [93], result: "Decanter of endless water" },
            { roll: [94], result: "Eyes of minute seeing" },
            { roll: [95], result: "Folding boat" },
            { roll: [96], result: "Heward’s handy haversack" },
            { roll: [97], result: "Horseshoes of speed" },
            { roll: [98], result: "Necklace of fireballs" },
            { roll: [99], result: "Periapt of health" },
            { roll: [100], result: "Sending stones" },
        ],
        d: [
            { roll: range(1, 20), result: "Potion of healing (supreme)" },
            { roll: range(21, 30), result: "Potion of invisibility" },
            { roll: range(31, 40), result: "Potion of speed" },
            { roll: range(41, 50), result: "Spell scroll (6th level)" },
            { roll: range(51, 57), result: "Spell scroll (7th level)" },
            { roll: range(58, 62), result: "Ammunition, +3" },
            { roll: range(63, 67), result: "Oil of sharpness" },
            { roll: range(68, 72), result: "Potion of flying" },
            { roll: range(73, 77), result: "Potion of cloud giant strength" },
            { roll: range(78, 82), result: "Potion of longevity" },
            { roll: range(83, 87), result: "Potion of vitality" },
            { roll: range(88, 92), result: "Spell scroll (8th level)" },
            { roll: range(93, 95), result: "Horseshoes of a zephyr" },
            { roll: range(96, 98), result: "Nolzur’s marvelous pigments" },
            { roll: [99], result: "Bag of devouring" },
            { roll: [100], result: "Portable hole" },
        ],
        e: [
            { roll: range(1, 30), result: "Spell scroll (8th level)" },
            { roll: range(31, 55), result: "Potion of storm giant strength" },
            { roll: range(56, 70), result: "Potion of healing (supreme)" },
            { roll: range(71, 85), result: "Spell scroll (9th level)" },
            { roll: range(86, 93), result: "Universal solvent" },
            { roll: range(94, 98), result: "Arrow of slaying" },
            { roll: range(99, 100), result: "Sovereign glue" },
        ],
        f: [
            { roll: range(1, 15), result: "Weapon, +1" },
            { roll: range(16, 18), result: "Shield, +1" },
            { roll: range(19, 21), result: "Sentinel shield" },
            { roll: range(22, 23), result: "Amulet of proof against detection and location" },
            { roll: range(24, 25), result: "Boots of elvenkind" },
            { roll: range(26, 27), result: "Boots of striding and springing" },
            { roll: range(28, 29), result: "Bracers of archery" },
            { roll: range(30, 31), result: "Brooch of shielding" },
            { roll: range(32, 33), result: "Broom of flying" },
            { roll: range(34, 35), result: "Cloak of elvenkind" },
            { roll: range(36, 37), result: "Cloak of protection" },
            { roll: range(38, 39), result: "Gauntlets of ogre power" },
            { roll: range(40, 41), result: "Hat of disguise" },
            { roll: range(42, 43), result: "Javelin of lightning" },
            { roll: range(44, 45), result: "Pearl of power" },
            { roll: range(46, 47), result: "Rod of the pact keeper, +1" },
            { roll: range(48, 49), result: "Slippers of spider climbing" },
            { roll: range(50, 51), result: "Staff of the adder" },
            { roll: range(52, 53), result: "Staff of the python" },
            { roll: range(54, 55), result: "Sword of vengeance" },
            { roll: range(56, 57), result: "Trident of fish command" },
            { roll: range(58, 59), result: "Wand of magic missiles" },
            { roll: range(60, 61), result: "Wand of the war mage, +1" },
            { roll: range(62, 63), result: "Wand of web" },
            { roll: range(64, 65), result: "Weapon of warning" },
            { roll: [66], result: "Adamantine armor (chain mail)" },
            { roll: [67], result: "Adamantine armor (chain shirt)" },
            { roll: [68], result: "Adamantine armor (scale mail)" },
            { roll: [69], result: "Bag of tricks (gray)" },
            { roll: [70], result: "Bag of tricks (rust)" },
            { roll: [71], result: "Bag of tricks (tan)" },
            { roll: [72], result: "Boots of the winterlands" },
            { roll: [73], result: "Circlet of blasting" },
            { roll: [74], result: "Deck of illusions" },
            { roll: [75], result: "Eversmoking bottle" },
            { roll: [76], result: "Eyes of charming" },
            { roll: [77], result: "Eyes of the eagle" },
            { roll: [78], result: "Figurine of wondrous power (silver raven)" },
            { roll: [79], result: "Gem of brightness" },
            { roll: [80], result: "Gloves of missile snaring" },
            { roll: [81], result: "Gloves of swimming and climbing" },
            { roll: [82], result: "Gloves of thievery" },
            { roll: [83], result: "Headband of intellect" },
            { roll: [84], result: "Helm of telepathy" },
            { roll: [85], result: "Instrument of the bards (Doss lute)" },
            { roll: [86], result: "Instrument of the bards (Fochlucan bandore)" },
            { roll: [87], result: "Instrument of the bards (Mac-Fuimidh cittern)" },
            { roll: [88], result: "Medallion of thoughts" },
            { roll: [89], result: "Necklace of adaptation" },
            { roll: [90], result: "Periapt of wound closure" },
            { roll: [91], result: "Pipes of haunting" },
            { roll: [92], result: "Pipes of the sewers" },
            { roll: [93], result: "Ring of jumping" },
            { roll: [94], result: "Ring of mind shielding" },
            { roll: [95], result: "Ring of warmth" },
            { roll: [96], result: "Ring of water walking" },
            { roll: [97], result: "Quiver of Ehlonna" },
            { roll: [98], result: "Stone of good luck (luckstone)" },
            { roll: [99], result: "Wind fan" },
            { roll: [100], result: "Winged boots" },
        ],
        g: [
            { roll: range(1, 11), result: "Weapon, +2" },
            { roll: range(12, 14), result: "Figurine of wondrous power (roll d8) \n 1 Figurine of wondrous power (Bronze griffon)\n 2 Figurine of wondrous power (Ebony fly) 3 Figurine of wondrous power (Golden lions) 4 Figurine of wondrous power (Ivory goats) 5 Figurine of wondrous power (Marble elephant) 6–7 Figurine of wondrous power (Onyx dog) 8 Figurine of wondrous power (Serpentine owl)" },
            { roll: [15], result: "Adamantine armor (breastplate)" },
            { roll: [16], result: "Adamantine armor (splint)" },
            { roll: [17], result: "Amulet of health" },
            { roll: [18], result: "Armor of vulnerability" },
            { roll: [19], result: "Arrow-catching shield" },
            { roll: [20], result: "Belt of dwarvenkind" },
            { roll: [21], result: "Belt of hill giant strength" },
            { roll: [22], result: "Berserker axe" },
            { roll: [23], result: "Boots of levitation" },
            { roll: [24], result: "Boots of speed" },
            { roll: [25], result: "Bowl of commanding water elementals" },
            { roll: [26], result: "Bracers of defense" },
            { roll: [27], result: "Brazier of commanding fire elementals" },
            { roll: [28], result: "Cape of the mountebank" },
            { roll: [29], result: "Censer of controlling air elementals" },
            { roll: [30], result: "Armor, +1 chain mail" },
            { roll: [31], result: "Armor of resistance (chain mail)" },
            { roll: [32], result: "Armor, +1 chain shirt" },
            { roll: [33], result: "Armor of resistance (chain shirt)" },
            { roll: [34], result: "Cloak of displacement" },
            { roll: [35], result: "Cloak of the bat" },
            { roll: [36], result: "Cube of force" },
            { roll: [37], result: "Daern’s instant fortress" },
            { roll: [38], result: "Dagger of venom" },
            { roll: [39], result: "Dimensional shackles" },
            { roll: [40], result: "Dragon slayer" },
            { roll: [41], result: "Elven chain" },
            { roll: [42], result: "Flame tongue" },
            { roll: [43], result: "Gem of seeing" },
            { roll: [44], result: "Giant slayer" },
            { roll: [45], result: "Glamoured studded leather" },
            { roll: [46], result: "Helm of teleportation" },
            { roll: [47], result: "Horn of blasting" },
            { roll: [48], result: "Horn of Valhalla (silver or brass)" },
            { roll: [49], result: "Instrument of the bards (Canaith mandolin)" },
            { roll: [50], result: "Instrument of the bards (Cli lyre)" },
            { roll: [51], result: "Ioun stone (awareness)" },
            { roll: [52], result: "Ioun stone (protection)" },
            { roll: [53], result: "Ioun stone (reserve)" },
            { roll: [54], result: "Ioun stone (sustenance)" },
            { roll: [55], result: "Iron bands of Bilarro" },
            { roll: [56], result: "Armor, +1 leather" },
            { roll: [57], result: "Armor of resistance (leather)" },
            { roll: [58], result: "Mace of disruption" },
            { roll: [59], result: "Mace of smiting" },
            { roll: [60], result: "Mace of terror" },
            { roll: [61], result: "Mantle of spell resistance" },
            { roll: [62], result: "Necklace of prayer beads" },
            { roll: [63], result: "Periapt of proof against poison" },
            { roll: [64], result: "Ring of animal influence" },
            { roll: [65], result: "Ring of evasion" },
            { roll: [66], result: "Ring of feather falling" },
            { roll: [67], result: "Ring of free action" },
            { roll: [68], result: "Ring of protection" },
            { roll: [69], result: "Ring of resistance" },
            { roll: [70], result: "Ring of spell storing" },
            { roll: [71], result: "Ring of the ram" },
            { roll: [72], result: "Ring of X-ray vision" },
            { roll: [73], result: "Robe of eyes" },
            { roll: [74], result: "Rod of rulership" },
            { roll: [75], result: "Rod of the pact keeper, +2" },
            { roll: [76], result: "Rope of entanglement" },
            { roll: [77], result: "Armor, +1 scale mail" },
            { roll: [78], result: "Armor of resistance (scale mail)" },
            { roll: [79], result: "Shield, +2" },
            { roll: [80], result: "Shield of missile attraction" },
            { roll: [81], result: "Staff of charming" },
            { roll: [82], result: "Staff of healing" },
            { roll: [83], result: "Staff of swarming insects" },
            { roll: [84], result: "Staff of the woodlands" },
            { roll: [85], result: "Staff of withering" },
            { roll: [86], result: "Stone of controlling earth elementals" },
            { roll: [87], result: "Sun blade" },
            { roll: [88], result: "Sword of life stealing" },
            { roll: [89], result: "Sword of wounding" },
            { roll: [90], result: "Tentacle rod" },
            { roll: [91], result: "Vicious weapon" },
            { roll: [92], result: "Wand of binding" },
            { roll: [93], result: "Wand of enemy detection" },
            { roll: [94], result: "Wand of fear" },
            { roll: [95], result: "Wand of fireballs" },
            { roll: [96], result: "Wand of lightning bolts" },
            { roll: [97], result: "Wand of paralysis" },
            { roll: [98], result: "Wand of the war mage, +2" },
            { roll: [99], result: "Wand of wonder" },
            { roll: [100], result: "Wings of flying" },
        ],
        h: [
            { roll: range(1, 10), result: "Weapon, +3" },
            { roll: range(11, 12), result: "Amulet of the planes" },
            { roll: range(13, 14), result: "Carpet of flying" },
            { roll: range(15, 16), result: "Crystal ball (very rare version)" },
            { roll: range(17, 18), result: "Ring of regeneration" },
            { roll: range(19, 20), result: "Ring of shooting stars" },
            { roll: range(21, 22), result: "Ring of telekinesis" },
            { roll: range(23, 24), result: "Robe of scintillating colors" },
            { roll: range(25, 26), result: "Robe of stars" },
            { roll: range(27, 28), result: "Rod of absorption" },
            { roll: range(29, 30), result: "Rod of alertness" },
            { roll: range(31, 32), result: "Rod of security" },
            { roll: range(33, 34), result: "Rod of the pact keeper, +3" },
            { roll: range(35, 36), result: "Scimitar of speed" },
            { roll: range(37, 38), result: "Shield, +3" },
            { roll: range(39, 40), result: "Staff of fire" },
            { roll: range(41, 42), result: "Staff of frost" },
            { roll: range(43, 44), result: "Staff of power" },
            { roll: range(45, 46), result: "Staff of striking" },
            { roll: range(47, 48), result: "Staff of thunder and lightning" },
            { roll: range(49, 50), result: "Sword of sharpness" },
            { roll: range(51, 52), result: "Wand of polymorph" },
            { roll: range(53, 54), result: "Wand of the war mage, +3" },
            { roll: [55], result: "Adamantine armor (half plate)" },
            { roll: [56], result: "Adamantine armor (plate)" },
            { roll: [57], result: "Animated shield" },
            { roll: [58], result: "Belt of fire giant strength" },
            { roll: [59], result: "Belt of frost giant strength (or stone)" },
            { roll: [60], result: "Armor, +1 breastplate" },
            { roll: [61], result: "Armor of resistance (breastplate)" },
            { roll: [62], result: "Candle of invocation" },
            { roll: [63], result: "Armor, +2 chain mail" },
            { roll: [64], result: "Armor, +2 chain shirt" },
            { roll: [65], result: "Cloak of arachnida" },
            { roll: [66], result: "Dancing sword" },
            { roll: [67], result: "Demon armor" },
            { roll: [68], result: "Dragon scale mail" },
            { roll: [69], result: "Dwarven plate" },
            { roll: [70], result: "Dwarven thrower" },
            { roll: [71], result: "Efreeti bottle" },
            { roll: [72], result: "Figurine of wondrous power (obsidian steed)" },
            { roll: [73], result: "Frost brand" },
            { roll: [74], result: "Helm of brilliance" },
            { roll: [75], result: "Horn of Valhalla (bronze)" },
            { roll: [76], result: "Instrument of the bards (Anstruth harp)" },
            { roll: [77], result: "Ioun stone (absorption)" },
            { roll: [78], result: "Ioun stone (agility)" },
            { roll: [79], result: "Ioun stone (fortitude)" },
            { roll: [80], result: "Ioun stone (insight)" },
            { roll: [81], result: "Ioun stone (intellect)" },
            { roll: [82], result: "Ioun stone (leadership)" },
            { roll: [83], result: "Ioun stone (strength)" },
            { roll: [84], result: "Armor, +2 leather" },
            { roll: [85], result: "Manual of bodily health" },
            { roll: [86], result: "Manual of gainful exercise" },
            { roll: [87], result: "Manual of golems" },
            { roll: [88], result: "Manual of quickness of action" },
            { roll: [89], result: "Mirror of life trapping" },
            { roll: [90], result: "Nine lives stealer" },
            { roll: [91], result: "Oathbow" },
            { roll: [92], result: "Armor, +2 scale mail" },
            { roll: [93], result: "Spellguard shield" },
            { roll: [94], result: "Armor, +1 splint" },
            { roll: [95], result: "Armor of resistance (splint)" },
            { roll: [96], result: "Armor, +1 studded leather" },
            { roll: [97], result: "Armor of resistance (studded leather)" },
            { roll: [98], result: "Tome of clear thought" },
            { roll: [99], result: "Tome of leadership and influence" },
            { roll: [100], result: "Tome of understanding" },
        ],
        i: [
            { roll: range(1, 5), result: "Defender" },
            { roll: range(6, 10), result: "Hammer of thunderbolts" },
            { roll: range(11, 15), result: "Luck blade" },
            { roll: range(16, 20), result: "Sword of answering" },
            { roll: range(21, 23), result: "Holy avenger" },
            { roll: range(24, 26), result: "Ring of djinni summoning" },
            { roll: range(27, 29), result: "Ring of invisibility" },
            { roll: range(30, 32), result: "Ring of spell turning" },
            { roll: range(33, 35), result: "Rod of lordly might" },
            { roll: range(36, 38), result: "Staff of the magi" },
            { roll: range(39, 41), result: "Vorpal sword" },
            { roll: range(42, 43), result: "Belt of cloud giant strength" },
            { roll: range(44, 45), result: "Armor, +2 breastplate" },
            { roll: range(46, 47), result: "Armor, +3 chain mail" },
            { roll: range(48, 49), result: "Armor, +3 chain shirt" },
            { roll: range(50, 51), result: "Cloak of invisibility" },
            { roll: range(52, 53), result: "Crystal ball (legendary version)" },
            { roll: range(54, 55), result: "Armor, +1 half plate" },
            { roll: range(56, 57), result: "Iron flask" },
            { roll: range(58, 59), result: "Armor, +3 leather" },
            { roll: range(60, 61), result: "Armor, +1 plate" },
            { roll: range(62, 63), result: "Robe of the archmagi" },
            { roll: range(64, 65), result: "Rod of resurrection" },
            { roll: range(66, 67), result: "Armor, +1 scale mail" },
            { roll: range(68, 69), result: "Scarab of protection" },
            { roll: range(70, 71), result: "Armor, +2 splint" },
            { roll: range(72, 73), result: "Armor, +2 studded leather" },
            { roll: range(74, 75), result: "Well of many worlds" },
            { roll: [76], result: "Magic armor (roll d12)\n 1–2 Armor, +2 half plate\n 3–4 Armor, +2 plate\n 5–6 Armor, +3 studded leather\n 7–8 Armor, +3 breastplate\n 9–10 Armor, +3 splint\n 11 Armor, +3 half plate\n 12 Armor, +3 plate" },
            { roll: [77], result: "Apparatus of Kwalish" },
            { roll: [78], result: "Armor of invulnerability" },
            { roll: [79], result: "Belt of storm giant strength" },
            { roll: [80], result: "Cubic gate" },
            { roll: [81], result: "Deck of many things" },
            { roll: [82], result: "Efreeti chain" },
            { roll: [83], result: "Armor of resistance (half plate)" },
            { roll: [84], result: "Horn of Valhalla (iron)" },
            { roll: [85], result: "Instrument of the bards (Ollamh harp)" },
            { roll: [86], result: "Ioun stone (greater absorption)" },
            { roll: [87], result: "Ioun stone (mastery)" },
            { roll: [88], result: "Ioun stone (regeneration)" },
            { roll: [89], result: "Plate armor of etherealness" },
            { roll: [90], result: "Armor of resistance (plate)" },
            { roll: [91], result: "Ring of air elemental command" },
            { roll: [92], result: "Ring of earth elemental command" },
            { roll: [93], result: "Ring of fire elemental command" },
            { roll: [94], result: "Ring of three wishes" },
            { roll: [95], result: "Ring of water elemental command" },
            { roll: [96], result: "Sphere of annihilation" },
            { roll: [97], result: "Talisman of pure good" },
            { roll: [98], result: "Talisman of the sphere" },
            { roll: [99], result: "Talisman of ultimate evil" },
            { roll: [100], result: "Tome of the stilled tongue" },
        ]
    },

    randomBetween = (min, max) => {
        return Math.floor(Math.random()*(max-min+1)+min);
    },

    handleInput = (msg) => {
        if (msg.type != 'api' || !playerIsGM(msg.playerid)) return;

        // Split the message into command and argument(s)
        let args = msg.content.split(' ');
        let command = args.shift().substring(1);
        let extracommand = args.shift();

        if (command == state[state_name].config.command) {
            switch(extracommand){
                case 'reset':
                    state[state_name] = {};
                    setDefaults(true);
                    sendConfigMenu();
                break;

                case 'config':
                    if(args.length > 0){
                        let setting = args.shift().split('|');
                        let key = setting.shift();
                        let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                        state[state_name].config[key] = value;
                    }

                    sendConfigMenu();
                break;

                default:
                    let type = (extracommand && extracommand.toLowerCase() === 'hoard') ? 'hoard' : 'individual',
                        cr = (extracommand === 'hoard') ? args.shift() : extracommand,
                        amount = parseInt(args.shift()),
                        table;

                        log("amount: " + amount)

                    if(cr){
                        switch(cr){
                            case '0': case '1': case '2': case '3': case '4':
                                table = treasureTables[type][0];
                            break;

                            case '5': case '6': case '7': case '8': case '9': case '10':
                                table = treasureTables[type][1];
                            break;

                            case '11': case '12': case '13': case '14': case '15': case '16':
                                table = treasureTables[type][2];
                            break;

                            default:
                                table = treasureTables[type][3];
                            break;
                        }

                        sendTreasureToChat(calculateTreasure(table, type, amount));
                    }
                break;
            }
        }
    },

    calculateTreasure = (table, type='individual', times=1) => {
        let d100,
            checkRoll, 
            treasure, 
            result = {
                currency: { 
                    cp: 0,
                    sp: 0,
                    ep: 0,
                    pp: 0,
                    gp: 0   
                },
                objects: []
            };

        times = (times) ? times : 1;
        for(var i = 0; i < times; i++){
            d100 = randomBetween(1, 100);
            checkRoll = (entry) => entry.roll.indexOf(d100) !== -1;
            treasure = {
                currency: (type === 'hoard') ? table.coins : _.find(table, checkRoll).treasure,
                objects: (type === 'hoard') ? _.find(table.objects, checkRoll).treasure : []
            };
            let amount;

            for(var currency in treasure.currency){
                result.currency[currency] += rollDieString(treasure.currency[currency]);
            }

            if(treasure.objects && treasure.objects.length > 0){
                treasure.objects.forEach(obj => {
                    switch(obj.type){
                        case 'gems':
                            amount = (obj.die === "1" || obj.die === 1) ? 1 :  rollDieString(obj.die);
                            result.objects.push({ object: gemTables[obj.worth][randomBetween(0, gemTables[obj.worth].length-1)], amount: amount, type: 'gems' });
                        break;

                        case 'art':
                            amount = (obj.die === "1" || obj.die === 1) ? 1 :  rollDieString(obj.die);
                            result.objects.push({ object: artTables[obj.worth][randomBetween(0, artTables[obj.worth].length-1)], amount: amount, type: 'art' });
                        break;

                        case 'magic':
                            let times = (obj.die === "1" || obj.die === 1) ? 1 :  rollDieString(obj.die);
                            for(var i = 0; i < times; i++){
                                d100 = randomBetween(1, 100);
                                checkRoll = (entry) => entry.roll.indexOf(d100) !== -1;
                                let item = _.find(magicTables[obj.table.toLowerCase()], checkRoll).result;

                                result.objects.push({ object: item, type: 'magic' })
                            }                    
                        break;
                    }
                });
            }
        }

        return result;
    },

    formatNumber = (number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },

    rollDieString = (dieStr) => {
        let die = parseDie(dieStr);

        let result = randomBetween(die.amount, die.dice*die.amount);

        if(!die.modifier) return result;

        switch(die.modifier){
            case '+':
                result += die.modifierAmount;
            break;

            case '-':
                result -= die.modifierAmount;
            break;

            case '*':
                result *= die.modifierAmount;
            break;

            case '/':
                result /= die.modifierAmount;
            break;
        }

        return result;
    },

    parseDie = (str) => {
        str.match(/(\d*)(D\d*)((?:[+*-](?:\d+|\([A-Z]*\)))*)(?:\+(D\d*))?/gi)

        let modifier = RegExp.$3;

        return {
            amount : parseInt(RegExp.$1),
            dice: parseInt(RegExp.$2.split('d')[1]),
            modifier: (modifier === '') ? null : modifier.substring(0, 1),
            modifierAmount: (modifier === '') ? null : parseInt(modifier.substring(1))
        }
    },

    groupBy = (array, keyGetter) => {
        let key, collection,
            map = new Map();

        array.forEach(item => {
            key = keyGetter(item);
            collection = map.get(key);

            if(!collection) map.set(key, [item]);
            else collection.push(item);
        });

        return map;
    },

    sendTreasureToChat = (treasure) => {
        let contents = '<h5>Currency</h5>';
        for(var currency in treasure.currency){
            if(treasure.currency[currency] > 0){
                contents += '<b>'+currency+'</b>: ' + formatNumber(treasure.currency[currency]) + '<br>';
            }
        }

        const grouped = groupBy(treasure.objects, object => object.type);

        if(grouped.get('gems') && grouped.get('gems').length){
            contents += "<br><h5>Gems</h5>";
            grouped.get('gems').forEach(obj => {
                contents += (obj.amount) ? obj.amount + 'x ' : '';
                contents += obj.object + '<br>';
            })
        }

        if(grouped.get('art') && grouped.get('art').length){
            contents += "<br><h5>Art Objects</h5>";
            grouped.get('art').forEach(obj => {
                contents += (obj.amount) ? obj.amount + 'x ' : '';
                contents += obj.object + '<br>';
            })
        }

        if(grouped.get('magic') && grouped.get('magic').length){
            contents += "<br><h5>Magic Items</h5>";
            grouped.get('magic').forEach(obj => {
                contents += (obj.amount) ? obj.amount + 'x ' : '';
                contents += obj.object + '<br>';
            })
        }

        makeAndSendMenu(contents, 'Treasure', (state[state_name].config.onlyGM) ? 'gm' : '');
    },

    sendConfigMenu = (first, message) => {
        let commandButton = makeButton('!'+state[state_name].config.command, '!' + state[state_name].config.command + ' config command|?{Command (without !)}', styles.button + styles.float.right);
        let onlyGMButton = makeButton(state[state_name].config.onlyGM, '!' + state[state_name].config.command + ' config onlyGM|'+!state[state_name].config.onlyGM, styles.button + styles.float.right);

        let listItems = [
            '<span style="'+styles.float.left+'">Command:</span> ' + commandButton,
            '<span style="'+styles.float.left+'">Send to GM:</span> ' + onlyGMButton,
        ];

        let resetButton = makeButton('Reset', '!' + state[state_name].config.command + ' reset', styles.button + styles.fullWidth);

        let title_text = (first) ? script_name + ' First Time Setup' : script_name + ' Config';
        message = (message) ? '<p>'+message+'</p>' : '';
        let contents = message+makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr><p style="font-size: 80%">You can always come back to this config by typing `!'+state[state_name].config.command+' config`.</p><hr>'+resetButton;
        makeAndSendMenu(contents, title_text, 'gm');
    },

    makeAndSendMenu = (contents, title, whisper) => {
        title = (title && title != '') ? makeTitle(title) : '';
        whisper = (whisper && whisper !== '') ? '/w ' + whisper + ' ' : '';
        sendChat(script_name, whisper + '<div style="'+styles.menu+styles.overflow+'">'+title+contents+'</div>', null, {noarchive:true});
    },

    makeTitle = (title) => {
        return '<h3 style="margin-bottom: 10px;">'+title+'</h3>';
    },

    makeButton = (title, href, style) => {
        return '<a style="'+style+'" href="'+href+'">'+title+'</a>';
    },

    makeList = (items, listStyle, itemStyle) => {
        let list = '<ul style="'+listStyle+'">';
        items.forEach((item) => {
            list += '<li style="'+itemStyle+'">'+item+'</li>';
        });
        list += '</ul>';
        return list;
    },

    pre_log = (message) => {
        log('---------------------------------------------------------------------------------------------');
        if(!message){ return; }
        log(message);
        log('---------------------------------------------------------------------------------------------');
    },

    checkInstall = () => {
        if(!_.has(state, state_name)){
            state[state_name] = state[state_name] || {};
        }
        setDefaults();

        log(script_name + ' Ready! Command: !'+state[state_name].config.command);
    },

    registerEventHandlers = () => {
        on('chat:message', handleInput);
    },

    setDefaults = (reset) => {
        const defaults = {
            config: {
                command: 'treasure',
                onlyGM: true
            }
        };

        if(!state[state_name].config){
            state[state_name].config = defaults.config;
        }else{
            if(!state[state_name].config.hasOwnProperty('command')){
                state[state_name].config.command = defaults.config.command;
            }
            if(!state[state_name].config.hasOwnProperty('onlyGM')){
                state[state_name].config.onlyGM = defaults.config.onlyGM;
            }
        }

        if(!state[state_name].config.hasOwnProperty('firsttime') && !reset){
            sendConfigMenu(true);
            state[state_name].config.firsttime = false;
        }
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    }
})();

on('ready',function() {
    'use strict';

    Treasure.CheckInstall();
    Treasure.RegisterEventHandlers();
});