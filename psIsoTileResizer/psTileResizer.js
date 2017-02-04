// Purpose: To automatically resize plexsoup marketplace assets, to their intended native dimensions
	// This makes creating dungeons dramatically easier. See youtube.com/user/plexsoup

// Usage: enter !psResize or !psTileResizer in chat




var psTileResizer = psTileResizer || (function psMarketplaceResizer() {
	"use strict";

    var info = {
        version: 0.2,
        authorName: "plexsoup"
    };

    var config = {
        debugDEFCON: 5,
		resizeOnAdd: true
    };

	
	
	var temp = {
		//campaignLoaded: false,
		GMPlayer: Campaign
	};

	var marketplaceTiles = [];
	
	
/*

	TODO:

		turn off automatic renaming tiles
		verify that tile is on map layer before messing with it.
	
*/
	
	
	
	
	
	
	
	
	
	var tile = function( marketplaceID, width, height, name, connectors ) { // constructor to make a new tile
		this.marketplaceID = marketplaceID;
		this.width = width;
		this.height = height;		
		this.name = name;
		this.connectors = connectors;

		
		// **** add a function to get the best connection point for lining things updateCommands
		
		// **** add a function to get dynamic lighting lines - consider using the lightrecorder script
		
	};




// *******************************************************************************

	var populateDatabase = function databasePopulator() {

		// new tile (marketplaceID, width, height, name, connectors)
		var psCaves = [
			["50279", 720, 720, "0002 Room", { ne: "", se: "", sw: "", nw: ""}],
			["50281", 643, 643, "0003 Passage", { ne: "", se: "", sw: "", nw: ""}],
			["50283", 748, 748, "0004 Passage Descent", { ne: "", se: "", sw: "", nw: ""}],
			["50285", 622, 622, "0005 Passage Descent", { ne: "", se: "", sw: "", nw: ""}],
			["50287", 696, 696, "0006 Passage Corner Gallery", { ne: "", se: "", sw: "", nw: ""}],
			["50289", 752, 752, "0007 Passage Corner", { ne: "", se: "", sw: "", nw: ""}],
			["50291", 411, 411, "0008 Passage Corner", { ne: "", se: "", sw: "", nw: ""}],
			["50293", 618, 618, "0009 Passage Corner", { ne: "", se: "", sw: "", nw: ""}],
			["50295", 620, 620, "0010 Passage Straight", { ne: "", se: "", sw: "", nw: ""}],
			["50297", 634, 634, "0011 Passage Twisty", { ne: "", se: "", sw: "", nw: ""}],
			["50299", 585, 585, "0012 Passage Twisty 2", { ne: "", se: "", sw: "", nw: ""}],
			["50301", 596, 596, "0013 Passage Twisty 3", { ne: "", se: "", sw: "", nw: ""}],
			["50303", 604, 604, "0014 Intersection X", { ne: "", se: "", sw: "", nw: ""}],
			["50305", 606, 606, "0015 Intersection T 1", { ne: "", se: "", sw: "", nw: ""}],
			["50307", 633, 633, "0016 Intersection T 2", { ne: "", se: "", sw: "", nw: ""}],
			["50309", 606, 606, "0017 Intersection Lava X", { ne: "", se: "", sw: "", nw: ""}],
			["50311", 678, 678, "0018 Passage Corner", { ne: "", se: "", sw: "", nw: ""}],
			["50313", 700, 700, "0019 Room Med", { ne: "", se: "", sw: "", nw: ""}],
			["50315", 650, 486, "0020 Room Med", { ne: "", se: "", sw: "", nw: ""}],
			["50317", 1093, 1093, "0021 Room Large", { ne: "", se: "", sw: "", nw: ""}],
			["50319", 1172, 1172, "0022 Room Large", { ne: "", se: "", sw: "", nw: ""}],
			["50321", 1043, 1043, "0023 Room Large", { ne: "", se: "", sw: "", nw: ""}],
			["50323", 1365, 1365, "0024 Room Very Large", { ne: "", se: "", sw: "", nw: ""}],
			["50325", 475, 475, "0025 Room Terminus 1", { ne: "", se: "", sw: "", nw: ""}],
			["50327", 462, 462, "0026 Room Terminus 2", { ne: "", se: "", sw: "", nw: ""}],

			["50329", 216, 216, "2-connecto", { ne: "", se: "", sw: "", nw: ""}],

			["50359", 643, 547, "a0003 Passage", { ne: "", se: "", sw: "", nw: ""}],
			["50361", 747, 747, "a0004 Passage Descent", { ne: "", se: "", sw: "", nw: ""}],
			["50363", 621, 621, "a0005 Passage Descent", { ne: "", se: "", sw: "", nw: ""}],
			["50365", 696, 696, "a0006 Passage Corner", { ne: "", se: "", sw: "", nw: ""}],
			["50367", 752, 752, "a0007 Passage Corner", { ne: "", se: "", sw: "", nw: ""}],
			["50369", 408, 408, "a0008 Passage Corner", { ne: "", se: "", sw: "", nw: ""}],
			["50371", 628, 628, "a0009 Passage Corner", { ne: "", se: "", sw: "", nw: ""}],
			["50373", 620, 620, "a0010 Passage Straight", { ne: "", se: "", sw: "", nw: ""}],
			["50375", 634, 634, "a0011 Passage Twisty", { ne: "", se: "", sw: "", nw: ""}],
			["50377", 585, 585, "a0012 Passage Twisty", { ne: "", se: "", sw: "", nw: ""}],
			["50379", 596, 596, "a0013 Passage Twisty", { ne: "", se: "", sw: "", nw: ""}],
			["50381", 1043, 1043, "a0014 Room Large", { ne: "", se: "", sw: "", nw: ""}],
			["50383", 1025, 1025, "a0015 flat grid", { ne: "", se: "", sw: "", nw: ""}],
			["50385", 1365, 1365, "a0016 Room Very Large Green", { ne: "", se: "", sw: "", nw: ""}],
			["50387", 604, 604, "a0017 Intersection Lava", { ne: "", se: "", sw: "", nw: ""}],
			["50389", 604, 604, "a0018 Intersection X ", { ne: "", se: "", sw: "", nw: ""}],
			["50391", 606, 606, "a0019 Intersection T", { ne: "", se: "", sw: "", nw: ""}],
			["50393", 720, 720, "a002 Room", { ne: "", se: "", sw: "", nw: ""}],
			["50395", 633, 633, "a0020 Intersection T", { ne: "", se: "", sw: "", nw: ""}],
			["50397", 753, 753, "a0021 Passage Corner", { ne: "", se: "", sw: "", nw: ""}],
			["50399", 700, 700, "a0022 Room Med", { ne: "", se: "", sw: "", nw: ""}],
			["50401", 652, 486, "a0023 Room Med", { ne: "", se: "", sw: "", nw: ""}],
			["50403", 1093, 1093, "a0024 Room Large", { ne: "", se: "", sw: "", nw: ""}],
			["50405", 1172, 1172, "a0025 Room Large", { ne: "", se: "", sw: "", nw: ""}],
			["50407", 720, 720, "b0002 Room Dark", { ne: "", se: "", sw: "", nw: ""}],
			["50409", 643, 643, "b0003 Passage Dark Ascent", { ne: "", se: "", sw: "", nw: ""}],
			["50411", 747, 747, "b0004 Passage Dark Descent", { ne: "", se: "", sw: "", nw: ""}],
			["50413", 621, 621, "b0005 Passage Descent", { ne: "", se: "", sw: "", nw: ""}],
			["50415", 696, 696, "b0006 Corner Gallery", { ne: "", se: "", sw: "", nw: ""}],
			["50417", 752, 752, "b0007 Passage Corner", { ne: "", se: "", sw: "", nw: ""}],
			["50419", 408, 408, "b0008 Dark Corner", { ne: "", se: "", sw: "", nw: ""}],
			["50421", 617, 617, "b0009 Passage Corner", { ne: "", se: "", sw: "", nw: ""}],
			["50423", 620, 620, "b0010 Passage Straight", { ne: "", se: "", sw: "", nw: ""}],
			["50425", 634, 634, "b0011 Passage Twisty", { ne: "", se: "", sw: "", nw: ""}],
			["50427", 585, 585, "b0012 Passage Twisty", { ne: "", se: "", sw: "", nw: ""}],
			["50429", 596, 596, "b0013 Passage Twisty", { ne: "", se: "", sw: "", nw: ""}],
			["50431", 1043, 1043, "b0014 Room Large Round", { ne: "", se: "", sw: "", nw: ""}],
			["50433", 1016, 516, "b0015 Large Flat Room Grayscale BW", { ne: "", se: "", sw: "", nw: ""}],
			["50435", 1357, 1357, "b0016 Very Large Room", { ne: "", se: "", sw: "", nw: ""}],
			["50437", 608, 608, "b0018 X-Intersection", { ne: "", se: "", sw: "", nw: ""}],
			["50439", 607, 607, "b0019 T-Intersection", { ne: "", se: "", sw: "", nw: ""}],
			["50441", 633, 633, "b0020 T-Intersection", { ne: "", se: "", sw: "", nw: ""}],
			["50443", 678, 678, "b0021 Passage Corner Dark", { ne: "", se: "", sw: "", nw: ""}],
			["50445", 700, 700, "b0022 Room Med Round", { ne: "", se: "", sw: "", nw: ""}],
			["50447", 648, 648, "b0023 Room Med", { ne: "", se: "", sw: "", nw: ""}],
			["50449", 1093, 1093, "b0024 Complex Large Room", { ne: "", se: "", sw: "", nw: ""}],
			["50451", 1172, 1172, "b0025 Room Large Gallery", { ne: "", se: "", sw: "", nw: ""}],

			["50331", 356, 356, "NPC Gelatinous Cube", { ne: "", se: "", sw: "", nw: ""}],
			["50333", 280, 280, "NPC Spider", { ne: "", se: "", sw: "", nw: ""}],
			["50335", 204, 204, "Prop Arch Light", { ne: "", se: "", sw: "", nw: ""}],
			["50337", 204, 204, "Prop Arch", { ne: "", se: "", sw: "", nw: ""}],
			["50339", 424, 437, "Prop Lava 2", { ne: "", se: "", sw: "", nw: ""}],
			["50341", 194, 194, "Prop Lava", { ne: "", se: "", sw: "", nw: ""}],
			["50343", 204, 204, "Prop Mushrooms", { ne: "", se: "", sw: "", nw: ""}],

			["50349", 342, 342, "Prop rocks3", { ne: "", se: "", sw: "", nw: ""}],
			["50345", 454, 454, "Prop Spiderweb2", { ne: "", se: "", sw: "", nw: ""}],
			["50347", 379, 379, "Prop Spiderweb", { ne: "", se: "", sw: "", nw: ""}],

			["50351", 409, 409, "Prop stalagtite 1", { ne: "", se: "", sw: "", nw: ""}],
			["50353", 408, 408, "Prop stalagtite 2", { ne: "", se: "", sw: "", nw: ""}],
			["50355", 292, 292, "Prop stalagtite 3", { ne: "", se: "", sw: "", nw: ""}],
			["50357", 185, 185, "Prop stone 1", { ne: "", se: "", sw: "", nw: ""}],

			["50867", 280, 256, "Prop Gems", { ne: "", se: "", sw: "", nw: ""}]

		];

		var psDungeon = [
			
			["46732", 194, 158, "Connector 2x2 Block", { ne: "", se: "", sw: "", nw: ""}],
			["46734", 192, 99, "Connector 2x2 Flat", { ne: "", se: "", sw: "", nw: ""}],
			["46736", 345, 194, "Connector Hall 4x2 L", { ne: "", se: "", sw: "", nw: ""}],
			["46738", 345, 194, "Connector Hall 4x2 R", { ne: "", se: "", sw: "", nw: ""}],

			["46744", 1024, 512, "Hall corner bottom", { ne: "", se: "", sw: "", nw: ""}],
			["46740", 640, 640, "Hall Corner side L", { ne: "", se: "", sw: "", nw: ""}],
			["46746", 640, 640, "Hall corner side R", { ne: "", se: "", sw: "", nw: ""}],
			["46748", 1024, 512, "Hall corner top", { ne: "", se: "", sw: "", nw: ""}],
			["46750", 1024, 640, "Hall straight L", { ne: "", se: "", sw: "", nw: ""}],
			["46752", 1024, 640, "Hall straight R", { ne: "", se: "", sw: "", nw: ""}],
			["46754", 1024, 640, "Hall t-intersection bottom L", { ne: "", se: "", sw: "", nw: ""}],
			["46756", 1024, 640, "Hall t-intersection bottom R", { ne: "", se: "", sw: "", nw: ""}],
			["46758", 1024, 640, "Hall t-intersection top L", { ne: "", se: "", sw: "", nw: ""}],
			["46760", 1024, 640, "Hall t-intersection top R", { ne: "", se: "", sw: "", nw: ""}],
			["46742", 1024, 640, "Hall X-intersection", { ne: "", se: "", sw: "", nw: ""}],
			["46846", 144, 281, "plex.Dungeon.Torchlit.Prop.Gate.Tall.Closed.2x1.1", { ne: "", se: "", sw: "", nw: ""}],
			["46848", 142, 281, "plex.Dungeon.Torchlit.Prop.Gate.Tall.Open.2x1.1", { ne: "", se: "", sw: "", nw: ""}],
			["46850", 142, 281, "plex.Dungeon.Torchlit.Prop.Gate.Tall.Open.2x1.2", { ne: "", se: "", sw: "", nw: ""}],
			["46852", 432, 394, "plex.Dungeon.Torchlit.Prop.Stairs.Bottom.1", { ne: "", se: "", sw: "", nw: ""}],
			["46854", 432, 394, "plex.Dungeon.Torchlit.Prop.Stairs.Bottom.2", { ne: "", se: "", sw: "", nw: ""}],
			["46856", 416, 210, "plex.Dungeon.Torchlit.Prop.Stairs.Curved.Up.1", { ne: "", se: "", sw: "", nw: ""}],
			["46858", 416, 210, "plex.Dungeon.Torchlit.Prop.Stairs.Curved.Up.2", { ne: "", se: "", sw: "", nw: ""}],
			["46762", 144, 170, "Prop Door Closed Double L", { ne: "", se: "", sw: "", nw: ""}],
			["46764", 144, 170, "Prop Door Closed Double R", { ne: "", se: "", sw: "", nw: ""}],
			["46766", 144, 185, "Prop Door Open Double L", { ne: "", se: "", sw: "", nw: ""}],
			["46768", 144, 185, "Prop Door Open Double R", { ne: "", se: "", sw: "", nw: ""}],
			["46770", 144, 281, "Prop Gate Tall Closed 2x1 R", { ne: "", se: "", sw: "", nw: ""}],
			["46772", 438, 400, "Prop Stairs Top L", { ne: "", se: "", sw: "", nw: ""}],
			["46774", 438, 400, "Prop Stairs Top R", { ne: "", se: "", sw: "", nw: ""}],
			["46776", 205, 111, "Prop Trap SpikedPit", { ne: "", se: "", sw: "", nw: ""}],
			["46778", 174, 222, "Prop Wall 2x1 L", { ne: "", se: "", sw: "", nw: ""}],
			["46780", 174, 222, "Prop Wall 2x1 R", { ne: "", se: "", sw: "", nw: ""}],
			["46782", 1024, 640, "Room 10x10 1Exit L", { ne: "", se: "", sw: "", nw: ""}],
			["46784", 1024, 640, "Room 10x10 1Exit R", { ne: "", se: "", sw: "", nw: ""}],
			["46786", 1024, 640, "Room 10x10 1Exit Top L", { ne: "", se: "", sw: "", nw: ""}],
			["46788", 1024, 640, "Room 10x10 1Exit Top R", { ne: "", se: "", sw: "", nw: ""}],
			["46790", 1024, 640, "Room 10x10 2Exits 180 L", { ne: "", se: "", sw: "", nw: ""}],
			["46792", 1024, 640, "Room 10x10 2exits 180 R", { ne: "", se: "", sw: "", nw: ""}],
			["46794", 1024, 640, "Room 10x10 3Exits L", { ne: "", se: "", sw: "", nw: ""}],
			["46796", 1024, 640, "Room 10x10 3Exits R", { ne: "", se: "", sw: "", nw: ""}],
			["46798", 1024, 640, "Room 10x10 4Exits", { ne: "", se: "", sw: "", nw: ""}],
			["46800", 734, 504, "Room 10x10 Round 0Exits Stairs", { ne: "", se: "", sw: "", nw: ""}],
			["46802", 734, 504, "Room 10x10 Round 0Exits", { ne: "", se: "", sw: "", nw: ""}],
			["46804", 870, 568, "Room 10x10 Round 1Exit Bottom L", { ne: "", se: "", sw: "", nw: ""}],
			["46806", 870, 568, "Room 10x10 Round 1Exit Bottom R", { ne: "", se: "", sw: "", nw: ""}],
			["46808", 869, 571, "Room 10x10 Round 1Exit Top L", { ne: "", se: "", sw: "", nw: ""}],
			["46810", 869, 571, "Room 10x10 Round 1Exit Top R", { ne: "", se: "", sw: "", nw: ""}],
			["46812", 1008, 573, "Room 10x10 Round 2Exits Bottom", { ne: "", se: "", sw: "", nw: ""}],
			["46814", 1024, 640, "Room 10x10 Round 2Exits Opposite L", { ne: "", se: "", sw: "", nw: ""}],
			["46816", 1024, 640, "Room 10x10 Round 2Exits Opposite R", { ne: "", se: "", sw: "", nw: ""}],
			["46818", 869, 625, "Room 10x10 Round 2Exits Side L", { ne: "", se: "", sw: "", nw: ""}],
			["46820", 869, 625, "Room 10x10 Round 2Exits Side R", { ne: "", se: "", sw: "", nw: ""}],
			["46822", 1005, 573, "Room 10x10 Round 2Exits Top", { ne: "", se: "", sw: "", nw: ""}],
			["46824", 848, 568, "Room 6x6 1Exit bottom L", { ne: "", se: "", sw: "", nw: ""}],
			["46826", 848, 568, "Room 6x6 1Exit bottom R", { ne: "", se: "", sw: "", nw: ""}],
			["46828", 846, 560, "Room 6x6 1Exit top L", { ne: "", se: "", sw: "", nw: ""}],
			["46830", 846, 560, "Room 6x6 1Exit top R", { ne: "", se: "", sw: "", nw: ""}],
			["46836", 1010, 557, "Room 6x6 2Exits Adjacent bottom", { ne: "", se: "", sw: "", nw: ""}],
			["46832", 848, 632, "Room 6x6 2Exits Adjacent Side L", { ne: "", se: "", sw: "", nw: ""}],
			["46834", 848, 632, "Room 6x6 2Exits Adjacent Side R", { ne: "", se: "", sw: "", nw: ""}],
			["46838", 1010, 553, "Room 6x6 2Exits Adjacent top", { ne: "", se: "", sw: "", nw: ""}],
			["46840", 1024, 639, "Room 6x6 2Exits Opposite L", { ne: "", se: "", sw: "", nw: ""}],
			["46842", 1024, 639, "Room 6x6 2Exits Opposite R", { ne: "", se: "", sw: "", nw: ""}],
			["46844", 512, 384, "Room Block Connector 4x4", { ne: "", se: "", sw: "", nw: ""}]		
			
		];
		
		var psSewer = [
			["47777", 176, 206, "Prop Wall Door Interface to Dungeon L", { ne: "", se: "", sw: "", nw: ""}],
			["47779", 176, 206, "Prop Wall Door Interface to Dungeon", { ne: "", se: "", sw: "", nw: ""}],
			["47781", 1109, 633, "Room Large 0 exits no walls", { ne: "", se: "", sw: "", nw: ""}],
			["47783", 1110, 766, "Room Large 0 exits", { ne: "", se: "", sw: "", nw: ""}],
			["47785", 623, 526, "Room Medium 6x6 0 exits", { ne: "", se: "", sw: "", nw: ""}],
			["47787", 526, 343, "Room Small 5x5 2", { ne: "", se: "", sw: "", nw: ""}],
			["47789", 525, 445, "Room Small 5x5", { ne: "", se: "", sw: "", nw: ""}],
			["47791", 291, 205, "Sewer Connector 3x3 no sludge", { ne: "", se: "", sw: "", nw: ""}],
			["47793", 291, 205, "Sewer Connector 3x3 sludge", { ne: "", se: "", sw: "", nw: ""}],
			["47795", 371, 274, "Sewer Connector Short Tunnel  Straight No-Walls L", { ne: "", se: "", sw: "", nw: ""}],
			["47797", 364, 407, "Sewer Connector Short Tunnel Straight L", { ne: "", se: "", sw: "", nw: ""}],
			["47799", 371, 274, "Sewer Connector Short Tunnel Straight No-Walls", { ne: "", se: "", sw: "", nw: ""}],
			["47801", 364, 407, "Sewer Connector Tunnel Short  Straight", { ne: "", se: "", sw: "", nw: ""}],
			//["47803", 384, 760, "Sewer Effect flameJet R", { ne: "", se: "", sw: "", nw: ""}],
			//["47805", 760, 384, "Sewer Effect flameJet", { ne: "", se: "", sw: "", nw: ""}],
			["47807", 1088, 769, "Sewer Interface to Dungeon L", { ne: "", se: "", sw: "", nw: ""}],
			["47809", 1088, 769, "Sewer Interface to Dungeon", { ne: "", se: "", sw: "", nw: ""}],
			//["47811", 459, 237, "Sewer NPC Croc", { ne: "", se: "", sw: "", nw: ""}],
			//["47813", 512, 238, "Sewer NPC Rat", { ne: "", se: "", sw: "", nw: ""}],
			["47815", 473, 316, "Sewer Prop Bridge 1L", { ne: "", se: "", sw: "", nw: ""}],
			["47817", 473, 316, "Sewer Prop Bridge 1", { ne: "", se: "", sw: "", nw: ""}],
			["47819", 446, 306, "Sewer Prop Bridge 2 L", { ne: "", se: "", sw: "", nw: ""}],
			["47821", 446, 306, "Sewer Prop Bridge 2", { ne: "", se: "", sw: "", nw: ""}],
			//["47823", 482, 592, "Sewer Prop Fat Pipe L", { ne: "", se: "", sw: "", nw: ""}],
			//["47825", 482, 592, "Sewer Prop Fat Pipe", { ne: "", se: "", sw: "", nw: ""}],

			//["47875", 238, 280, "Sewer Prop flame jet trap 2 inactive L", { ne: "", se: "", sw: "", nw: ""}],
			//["47877", 238, 280, "Sewer Prop flame jet trap 2 inactive", { ne: "", se: "", sw: "", nw: ""}],
			//["47873", 431, 280, "Sewer Prop flame jet trap 2 L", { ne: "", se: "", sw: "", nw: ""}],
			//["47879", 431, 280, "Sewer Prop flame jet trap 2", { ne: "", se: "", sw: "", nw: ""}],
			//["47881", 437, 497, "Sewer Prop flame jet trap active 2", { ne: "", se: "", sw: "", nw: ""}],
			//["47883", 437, 497, "Sewer Prop flame jet trap active", { ne: "", se: "", sw: "", nw: ""}],
			//["47885", 232, 384, "Sewer Prop flame jet trap inactive L", { ne: "", se: "", sw: "", nw: ""}],
			//["47887", 232, 384, "Sewer Prop flame jet trap inactive", { ne: "", se: "", sw: "", nw: ""}],

			//["47827", 145, 260, "Sewer Prop Ladder L", { ne: "", se: "", sw: "", nw: ""}],
			//["47829", 145, 260, "Sewer Prop Ladder", { ne: "", se: "", sw: "", nw: ""}],
			["47831", 240, 180, "Sewer Prop Ledge Blocks 2x3", { ne: "", se: "", sw: "", nw: ""}],
			["47833", 531, 324, "Sewer Prop Ledge Blocks", { ne: "", se: "", sw: "", nw: ""}],
			["47835", 226, 226, "Sewer Prop Pipe Short Outflow", { ne: "", se: "", sw: "", nw: ""}],

			//["47889", 539, 484, "Sewer Prop pipes L", { ne: "", se: "", sw: "", nw: ""}],
			//["47891", 539, 484, "Sewer Prop pipes", { ne: "", se: "", sw: "", nw: ""}],

			["47837", 195, 106, "Sewer Prop Pit Trap 2", { ne: "", se: "", sw: "", nw: ""}],
			["47839", 193, 104, "Sewer Prop Pit Trap 3", { ne: "", se: "", sw: "", nw: ""}],
			["47841", 195, 106, "Sewer Prop Pit Trap", { ne: "", se: "", sw: "", nw: ""}],
			["47843", 400, 201, "Sewer Prop Pool Round Sludge", { ne: "", se: "", sw: "", nw: ""}],
			["47845", 99, 92, "Sewer Prop Railing Construction", { ne: "", se: "", sw: "", nw: ""}],
			["47847", 99, 92, "Sewer Prop Railing Rust", { ne: "", se: "", sw: "", nw: ""}],
			["47849", 258, 226, "Sewer Prop Sludge Stream Fall 2", { ne: "", se: "", sw: "", nw: ""}],
			["47851", 258, 226, "Sewer Prop Sludge Stream Fall", { ne: "", se: "", sw: "", nw: ""}],
			["47853", 333, 168, "Sewer Prop Sludge Stream Flat 2 L", { ne: "", se: "", sw: "", nw: ""}],
			["47855", 333, 168, "Sewer Prop Sludge Stream Flat 2", { ne: "", se: "", sw: "", nw: ""}],
			["47857", 401, 289, "Sewer Prop Vat Round", { ne: "", se: "", sw: "", nw: ""}],
			["47859", 621, 338, "Sewer Prop Vat ", { ne: "", se: "", sw: "", nw: ""}],
			["47861", 159, 243, "Sewer Prop Wall Door L", { ne: "", se: "", sw: "", nw: ""}],
			["47863", 159, 243, "Sewer Prop Wall Door", { ne: "", se: "", sw: "", nw: ""}],
			["47865", 159, 243, "Sewer Prop Wall Open L", { ne: "", se: "", sw: "", nw: ""}],
			["47867", 159, 243, "Sewer Prop Wall Open", { ne: "", se: "", sw: "", nw: ""}],
			["47869", 164, 244, "Sewer Prop Wall Solid L", { ne: "", se: "", sw: "", nw: ""}],
			["47871", 164, 244, "Sewer Prop Wall Solid", { ne: "", se: "", sw: "", nw: ""}],

			["47893", 1095, 795, "Sewer Room Dark 2exits adjacent side", { ne: "", se: "", sw: "", nw: ""}],
			["47895", 1098, 765, "Sewer Room Dark Large 2exits adjacent bottom", { ne: "", se: "", sw: "", nw: ""}],
			["47897", 1104, 796, "Sewer Room Dark Large 2exits adjacent top", { ne: "", se: "", sw: "", nw: ""}],
			["47899", 1095, 795, "Sewer Room Dark Large 2exits opposite", { ne: "", se: "", sw: "", nw: ""}],
			["47901", 1095, 793, "Sewer Room Dark Large 3exits bottom", { ne: "", se: "", sw: "", nw: ""}],
			["47903", 1100, 796, "Sewer Room Dark Large 3exits top", { ne: "", se: "", sw: "", nw: ""}],
			["47905", 1100, 794, "Sewer Room Dark Large 4 exits", { ne: "", se: "", sw: "", nw: ""}],
			["47907", 1117, 778, "Sewer Room Lit Large 2Exits Adjacent Bottom", { ne: "", se: "", sw: "", nw: ""}],
			["47909", 1116, 775, "Sewer Room Lit Large 2Exits Adjacent Side L", { ne: "", se: "", sw: "", nw: ""}],
			["47911", 1116, 775, "Sewer Room Lit Large 2Exits Adjacent Side", { ne: "", se: "", sw: "", nw: ""}],
			["47913", 1115, 771, "Sewer Room Lit Large 2Exits Adjacent Top", { ne: "", se: "", sw: "", nw: ""}],
			["47915", 1116, 771, "Sewer Room Lit Large 2Exits Opposite L", { ne: "", se: "", sw: "", nw: ""}],
			["47917", 1116, 771, "Sewer Room Lit Large 2Exits Opposite", { ne: "", se: "", sw: "", nw: ""}],
			["47923", 1116, 777, "Sewer Room Lit Large 3Exits bottom L ", { ne: "", se: "", sw: "", nw: ""}],
			["47925", 1116, 777, "Sewer Room Lit Large 3Exits bottom ", { ne: "", se: "", sw: "", nw: ""}],
			["47919", 1113, 783, "Sewer Room Lit Large 3Exits Top L", { ne: "", se: "", sw: "", nw: ""}],
			["47921", 1113, 783, "Sewer Room Lit Large 3Exits Top", { ne: "", se: "", sw: "", nw: ""}],
			["47927", 1113, 777, "Sewer Room Lit Large Vat", { ne: "", se: "", sw: "", nw: ""}],
			["47929", 1097, 537, "Sewer Tunnel Dark Corner Bottom ", { ne: "", se: "", sw: "", nw: ""}],
			["47931", 620, 728, "Sewer Tunnel Dark Corner Side L", { ne: "", se: "", sw: "", nw: ""}],
			["47933", 620, 728, "Sewer Tunnel Dark Corner Side", { ne: "", se: "", sw: "", nw: ""}],
			["47935", 1084, 553, "Sewer Tunnel Dark Corner Top", { ne: "", se: "", sw: "", nw: ""}],
			["47937", 1088, 769, "Sewer Tunnel Dark Straight", { ne: "", se: "", sw: "", nw: ""}],
			["47939", 1088, 795, "Sewer Tunnel Dark T-Intersection Bottom L Dark", { ne: "", se: "", sw: "", nw: ""}],
			["47941", 1088, 795, "Sewer Tunnel Dark T-Intersection Bottom ", { ne: "", se: "", sw: "", nw: ""}],
			["47943", 1100, 771, "Sewer Tunnel Dark T-Intersection Top L", { ne: "", se: "", sw: "", nw: ""}],
			["47945", 1100, 771, "Sewer Tunnel Dark T-Intersection Top", { ne: "", se: "", sw: "", nw: ""}],
			["47947", 1098, 770, "Sewer Tunnel Dark X-Intersection", { ne: "", se: "", sw: "", nw: ""}],
			["47949", 1097, 537, "Sewer Tunnel Lit Bottom", { ne: "", se: "", sw: "", nw: ""}],
			["47951", 1084, 553, "Sewer Tunnel Lit Corner Top", { ne: "", se: "", sw: "", nw: ""}],
			["47953", 620, 770, "Sewer Tunnel Lit Side L", { ne: "", se: "", sw: "", nw: ""}],
			["47955", 620, 770, "Sewer Tunnel Lit Side", { ne: "", se: "", sw: "", nw: ""}],
			["47957", 1088, 769, "Sewer Tunnel Lit Straight", { ne: "", se: "", sw: "", nw: ""}],
			["47959", 1098, 770, "Sewer Tunnel Lit X-Intersection", { ne: "", se: "", sw: "", nw: ""}]
		];		
		
		
		var tileDefs = psCaves.concat(psDungeon).concat(psSewer);
		
		_.each(tileDefs, function(tileDef) { 
			marketplaceTiles.push(new tile(tileDef[0], tileDef[1], tileDef[2], tileDef[3], tileDef[4]));
		});

	
	}; 	
	
	
// ********************************************************************************	
	
	

	var whisper = function chatMessageSender(playerName, message) {
		// sends a chat message to a specific player. Can use gm as playerName
		sendChat("psTileResizer Script", '/w ' + playerName + " " + message);
	};

	var makeButton = function buttonMakerForChat(title, command) { // expects two strings. Returns encoded html for the chat stream
		var output = '['+title+']('+command+')';
		return output;
	};

	var ch = function (c) {
	// This function will take a single character and change it to it's equivalent html encoded value.
		// psNote: I tried alternate methods of regexps to encode the entire string, but I always ran into problems with | and [] characters.
		var entities = {
			'<' : 'lt',
			'>' : 'gt',
			"'" : '#39',
			'@' : '#64',
			'{' : '#123',
			'|' : '#124',
			'}' : '#125',
			'[' : '#91',
			']' : '#93',
			'"' : 'quot',
			'-' : 'mdash',
			' ' : 'nbsp'
		};

		if(_.has(entities,c) ){
			return ('&'+entities[c]+';');
		}
		return '';
	};
	

	
	var getCurrentPage = function pageGetter(playerID) {
		// this should check Campaign.get and GM.lastpage

		var playerObj = getObj("player", playerID);
		var playerspecificpages = Campaign().get("playerspecificpages");
		
		if (playerIsGM(playerID) && _.has(playerObj, "lastpage" )) {
			return playerObj.lastpage;			
		} else if ( Boolean(playerspecificpages) && _.has(playerspecificpages, playerID) ) {
			return Campaign().get("playerspecificpages")[playerID];
		} else {
			return Campaign().get("playerpageid");	// the player ribbon. most common		
		}
	};
	
	var findGM = function GMFinder() {
		var players = findObjs({type: "player"});
		var GM = _.find(players, function(player) { 
			return playerIsGM(player.get("id"));
		});
		return GM;
	};


	
	var getMarketplaceID = function marketplaceIDGetter(tileID) {
		if( tileID !== undefined ) {
			var tileObj = getObj("graphic", tileID);
			var tileImgSrc = tileObj.get("imgsrc");
			
			var pathChunks = tileImgSrc.split("/");
			var tileMarketplaceID = pathChunks[5];
			
			//whisper("gm", "tileMarketplaceID: " + tileMarketplaceID );
			
			//tileObj.set("showname", true);
			//tileObj.set("name", tileMarketplaceID);
			//tileObj.set("layer", "objects");
				
			return tileMarketplaceID;			
		}
	};
	
	
	var resizeTiles = function tileResizer(pageID, tileID, playerID) {
		// resize all the map tiles with known id and size in our wee database
		
		// parameters verification
		if (Boolean(playerID) === false) {
			playerID = findGM();
		}
		
		if (Boolean(tileID) === false) {
			tileID = "all";
		}
		
		if (Boolean(pageID) === false) {			
			var page = getCurrentPage(); 
		}
		
		if (tileID !== "all") {
			
			
			var tileMarketplaceID = getMarketplaceID(tileID);
			var template = _.findWhere(marketplaceTiles, {marketplaceID: tileMarketplaceID} );
			
			if (template !== undefined ) {

				var tileObj = getObj("graphic", tileID);
				// resize it
				
				tileObj.set({
					width: template.width,
					height: template.height				
				});										
			

			} else {
				// whisper("gm", "couldn't find the right template");
			}

		} else { // resize everything you can find
			var possibleMapTiles = findObjs({ type: "graphic", layer: "map" });
			
			_.each(possibleMapTiles, function(tile) {
				_.each(marketplaceTiles, function(template) {
					if ( template.marketplaceID !== "" && tile.get("imgsrc").indexOf(template.marketplaceID) !== -1 ) { // found one 
						
						tile.set({ width: template.width, height: template.height });							
						
					}
				});
			
			});
			
			
		}
		
		//whisper("gm", "received a request to resize tile " + tileID);
		
	};
	
	var handleInput = function inputHandler(msg) {
			
		if (msg.type == "api" && ( msg.content.indexOf("!psResize") !== -1 || msg.content.indexOf("!psTileResizer") !== -1 ) ) {

			var argsFromUser,
				who,
				errors=[],
				playerID,
				playerName,
				pageID,
				tileID,
				requestedToggle,
				userCommand;


			playerName = msg.who;
			playerID = msg.playerid;

            argsFromUser = msg.content.split(/ +/);
			userCommand = argsFromUser[1];
			tileID = argsFromUser[2];			
			requestedToggle = argsFromUser[2];

			//whisper("gm", "heard: " + userCommand);
			//whisper("gm", "heard: " + tileID);
			
			
			
			switch(userCommand) {
				case '--resize' :
					// resize marketplace tiles
						// if you get a token id, resize that one.
						// otherwise, resize everything? any way to get a confirmation first?
					
					if (Boolean(tileID) === false || tileID == "all") {
							resizeTiles(pageID, "all", playerID);
					} else {
						resizeTiles(pageID, tileID, playerID);
					}
					
				break;
				case '--getMarketplaceID':
					
					getMarketplaceID(tileID);
					
				
				break;
				
				case "--on":
					config.resizeOnAdd = true;
				break;
				
				case "--off":
					config.resizeOnAdd = false;
				break;
				
				case "--toggle":
					if ( requestedToggle == "resizeOnAdd") { 
						config.resizeOnAdd = !config.resizeOnAdd;
						if (config.resizeOnAdd) {
							whisper("gm", "Plexsoup isometric assets will now resize automatically when you drop them on the map");							
						} else {
							whisper("gm", "Plexsoup isometric assets will not resize automatically anymore. See help for more options.");
						}

					}
				
				break;
				
				case '--help':
					getHelp();
				break;
				
				case undefined:
					getHelp();
				break;
			}
			//getHelp();
		}
	};

	
	var showDetailedHelp = function showDetailedHelpTextInChat(playerName) {
		
		if (!playerName) { playerName = "gm";}



		var exampleStyle = '"background-color: #eee; font-size: smaller; margin-left: 40px;"';
		var warningStyle = '"background-color: AntiqueWhite; font-size: smaller;"';
		var exampleTokenSelect = ch('@') + ch('{') + 'selected' + ch('|') + 'token_id' + ch('}');

		var helpText = '';

		helpText += '<div style="font-size: smaller;">';
		helpText += 'psTileResizer is a script to resize isometric marketplace tiles to their original, intended dimensions.';
		helpText += "This dramatically helps lining up tiles for setting up dungeon-crawls.";
		helpText += "</div>";

		helpText += '<div style="font-size: smaller;">';		
		helpText += "To start, enter !psResizer in the chat window.";
		helpText += "</div>";
		
		helpText += '<div style="font-size: smaller;">';		
		helpText += "Configuration options to be aware of: ";
		helpText += "<ul>";
		helpText += 		"<li>Toggle On/Off - turns on automatic resizing, triggered whenever a plexsoup marketplace tile is added to the map.</li>";
		helpText += "</ul>";
		helpText += "</div>";
		

		
		helpText += "<div style='font-size: smaller'>";
		helpText += "In addition to the gui buttons, you can make macros to activate the features. Here are some commands to play with.";
		helpText += 		'<div style='+ exampleStyle +'> !psResize</div>';
		helpText += 		'<div style='+ exampleStyle +'> !psResize --resize all</div>';
		helpText += 		'<div style='+ exampleStyle +'> !psResize --resize ' + exampleTokenSelect + '</div>';		
		helpText += 		'<div style='+ exampleStyle +'> !psResize --toggle resizeOnLoad</div>';
		

		
		//whisper(playerName, helpText );
		var helpHandouts;
		helpHandouts = findObjs({
			_type: "handout",
			name: "psResize Help"
		});

		var helpHandout = helpHandouts[0];
		//log("helpHandout = " + helpHandout);
		
		if (!helpHandout) { // create it
			helpHandout = createObj('handout', {
				name: 'psResize Help',
				inplayerjournals: 'all'
			});
			helpHandout.set("notes", helpText);

		} else { // it exists, set it's contents to match the latest version of the script
			helpHandout.set("notes", helpText);
		}
		var handoutID = helpHandout.get("_id");

		var chatMessage = "";
		var buttonStyle = "'background-color: AntiqueWhite; text-align: center'";
		
		chatMessage += "<div style="+buttonStyle+"><a href='http://journal.roll20.net/handout/" + handoutID + "'>Additional Information</a></div>";
		
		return(chatMessage);
	};

	
	var getHelp = function helpGetter() {
		
		var helpText = "";
		
		helpText += "<div style='text-align: center;'>";
		
		helpText += makeButton("Toggle On/Off", "!psResize --toggle resizeOnAdd");
		helpText += makeButton("Resize all", "!psResize --resize all");
		
		var tokenSelect = ch('@') + ch('{') + 'selected' + ch('|') + 'token_id' + ch('}');
		helpText += makeButton("Resize Selected", "!psResize --resize " + tokenSelect );
		
		//helpText += makeButton("!psResize --getMarketplaceID", "!psResize --getMarketplaceID " + tokenSelect );

		helpText += "</div>";
		helpText += showDetailedHelp("gm");
		whisper("gm", helpText);
		
	};

	var getStatus = function statusGetter() {
		whisper("gm", "config: " + JSON.stringify(config) );
		whisper("gm", "tiles: " + JSON.stringify(marketplaceTiles) );
		
	};
    
	var registerEventHandlers = function() {
		on('chat:message', handleInput );
		

		
		on("add:graphic", function(obj) {
			if ( temp.campaignLoaded && config.resizeOnAdd ) { // don't futz with the graphics already in the campaign.
				// only after the campaign is loaded, for all new tiles, check to see if they need resizing.
				resizeTiles( getCurrentPage(), obj.get("id"), findGM() );				
			} else {
				log("temp.campaignLoaded: " + temp.campaignLoaded + ", config.resizeOnAdd: " + config.resizeOnAdd );
			}

		});
		
	};

    var checkInstall = function() {
        if ( Boolean(state.psMarketplaceResizer) === false ) {
            state.psMarketplaceResizer = { 
				info: info,
				config: config
			};
        }
    };

	var initialize = function() {
		temp.campaignLoaded = true;	// help on(add:graphic) know not to mess with all the graphics already in the campaign
		//log("temp.campaignLoaded: " + temp.campaignLoaded);		
	};
	
	return { // make these functions available outside the local namespace
		CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers,
		PopulateDatabase: populateDatabase,
		GetHelp: getHelp,
		GetStatus: getStatus,
		Initialize: initialize
	};


}());







on("ready", function() {
         
    //init();
    psTileResizer.CheckInstall();
	psTileResizer.Initialize();
    psTileResizer.RegisterEventHandlers();
	psTileResizer.PopulateDatabase();
	psTileResizer.GetHelp();
	//psTileResizer.GetStatus();
    

});

