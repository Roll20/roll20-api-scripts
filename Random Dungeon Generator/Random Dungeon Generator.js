var mapName = "GeomorphicMap";
var lineColor = "#00ff00";
var lineSize = 5;
var geomorphicMapId;
var geomorphicMapWidth;
var geomorphicMapHeight;
var geomorphicTilesArray = new Array();
var mapTilesArray = [];
var isError = false;
var errorType = "None.";
var sideString = "";
var tilePicked  = "Empty";
var tilePickedType = "Empty";
var tilePickedRotation = "Empty";
var numberTileRows = 0;
var numberTileCols = 0;
var lightArray = new Array();
var pathArray = new Array();

var geomorphicTilesInformation = [
    {tileName: "Geo_Type_A_0001", edge: false, corner: false, entrance: false, type: "d", rotation: 0  },
    {tileName: "Geo_Type_A_0002", edge: false, corner: false, entrance: false, type: "d", rotation: 0  },
    {tileName: "Geo_Type_A_0003", edge: false, corner: false, entrance: false, type: "d", rotation: 0  },
    {tileName: "Geo_Type_A_0004", edge: false, corner: false, entrance: false, type: "s", rotation: 0  },
    {tileName: "Geo_Type_A_0005", edge: false, corner: false, entrance: false, type: "s", rotation: 0  },
    {tileName: "Geo_Type_A_0006", edge: false, corner: false, entrance: false, type: "s", rotation: 0  },
    {tileName: "Geo_Type_A_0007", edge: false, corner: false, entrance: false, type: "s", rotation: 0  },
    {tileName: "Geo_Type_A_0008", edge: false, corner: false, entrance: false, type: "d", rotation: 0  },
	{tileName: "Geo_Type_A_0009", edge: false, corner: false, entrance: false, type: "d", rotation: 0  },
	{tileName: "Geo_Type_A_0010", edge: false, corner: false, entrance: false, type: "d", rotation: 0  },
	{tileName: "Geo_Type_A_0011", edge: false, corner: false, entrance: false, type: "d", rotation: 0  },
	{tileName: "Geo_Type_A_0012", edge: false, corner: false, entrance: false, type: "d", rotation: 0  },
	{tileName: "Geo_Type_A_0013", edge: false, corner: false, entrance: false, type: "d", rotation: 0  },
	{tileName: "Geo_Type_A_0014", edge: false, corner: false, entrance: false, type: "d", rotation: 0  },
	{tileName: "Geo_Type_A_0015", edge: false, corner: false, entrance: false, type: "d", rotation: 0  },
	{tileName: "Geo_Type_A_0016", edge: false, corner: false, entrance: false, type: "d", rotation: 0  },
	{tileName: "Geo_Type_A_0017", edge: false, corner: false, entrance: false, type: "d", rotation: 0  },
	{tileName: "Geo_Type_A_0018", edge: false, corner: false, entrance: false, type: "d", rotation: 0  },
	{tileName: "Geo_Type_A_0019", edge: false, corner: false, entrance: false, type: "d", rotation: 0  },
	{tileName: "Geo_Type_A_0020", edge: false, corner: false, entrance: false, type: "d", rotation: 0  },
	{tileName: "Geo_Type_A_0021", edge: false, corner: false, entrance: false, type: "d", rotation: 0  },
	{tileName: "Geo_Type_A_0022", edge: false, corner: false, entrance: false, type: "d", rotation: 0  },
	{tileName: "Geo_Type_A_0023", edge: false, corner: false, entrance: false, type: "d", rotation: 0  },
	{tileName: "Geo_Type_A_0024", edge: false, corner: false, entrance: false, type: "d", rotation: 0  },
	{tileName: "Geo_Type_A_0025", edge: false, corner: true,  entrance: false, type: "d", rotation: 180},
	{tileName: "Geo_Type_A_0026", edge: true,  corner: false, entrance: false, type: "d", rotation: 270},
	{tileName: "Geo_Type_A_0027", edge: true,  corner: false, entrance: true,  type: "d", rotation: 270},
	{tileName: "Geo_Type_A_0028", edge: true,  corner: false, entrance: true,  type: "d", rotation: 270},
	{tileName: "Geo_Type_A_0029", edge: true,  corner: false, entrance: false, type: "d", rotation: 270},
	{tileName: "Geo_Type_A_0030", edge: false, corner: false, entrance: false, type: "d", rotation: 0  },
	{tileName: "Geo_Type_A_0031", edge: false, corner: false, entrance: false, type: "d", rotation: 0  },
	{tileName: "Geo_Type_A_0032", edge: false, corner: false, entrance: false, type: "d", rotation: 0  },
	{tileName: "Geo_Type_A_0033", edge: false, corner: false, entrance: false, type: "r", rotation: 0  },
	{tileName: "Geo_Type_A_0034", edge: false, corner: false, entrance: false, type: "r", rotation: 0  },
	{tileName: "Geo_Type_A_0035", edge: false, corner: false, entrance: false, type: "r", rotation: 0  },
	{tileName: "Geo_Type_A_0036", edge: false, corner: false, entrance: false, type: "r", rotation: 0  },
	{tileName: "Geo_Type_A_0037", edge: false, corner: false, entrance: false, type: "r", rotation: 0  },
	{tileName: "Geo_Type_A_0038", edge: false, corner: false, entrance: false, type: "c", rotation: 0  },
	{tileName: "Geo_Type_A_0039", edge: true,  corner: false, entrance: false, type: "c", rotation: 90 },
	{tileName: "Geo_Type_A_0040", edge: false, corner: true,  entrance: false, type: "c", rotation: 0  },
	{tileName: "Geo_Type_A_0041", edge: false, corner: false, entrance: false, type: "c", rotation: 0  },
	{tileName: "Geo_Type_A_0042", edge: false, corner: false, entrance: false, type: "d", rotation: 0  },
	{tileName: "Geo_Type_A_0043", edge: false, corner: false, entrance: false, type: "d", rotation: 0  },
	{tileName: "Geo_Type_A_0044", edge: false, corner: false, entrance: false, type: "d", rotation: 0  },
	{tileName: "Geo_Type_A_0045", edge: false, corner: false, entrance: false, type: "d", rotation: 0  }
];

var dynamicLightingArray = [
{tileName: "Geo_Type_A_0001", path: [[0,105],[105,105],[105,0]]},
{tileName: "Geo_Type_A_0001", path: [[525,0],[525,35],[735, 35],[735,0]]},
{tileName: "Geo_Type_A_0001", path: [[105,840],[105,805],[315, 805],[315,840]]},
{tileName: "Geo_Type_A_0001", path: [[0,525],[124,525],[552,105],[840,105]]},
{tileName: "Geo_Type_A_0001", path: [[315,0],[315,170],[402,252]]},
{tileName: "Geo_Type_A_0001", path: [[0,315],[165,315],[250,400]]},
{tileName: "Geo_Type_A_0001", path: [[0,735],[265,735],[692,315],[840,315]]},
{tileName: "Geo_Type_A_0001", path: [[525,840],[525,668],[426, 577]]},
{tileName: "Geo_Type_A_0001", path: [[840,525],[675,525],[575,429]]},
{tileName: "Geo_Type_A_0001", path: [[735,840],[735,735],[840, 735]]},
{tileName: "Geo_Type_A_0002", path: [[0,105],[105,105],[105,0]]},
{tileName: "Geo_Type_A_0002", path: [[525,0],[525,35],[735, 35],[735,0]]},
{tileName: "Geo_Type_A_0002", path: [[105,840],[105,805],[315, 805],[315, 840]]},
{tileName: "Geo_Type_A_0002", path: [[0,525],[124,525],[552,105],[840,105]]},
{tileName: "Geo_Type_A_0002", path: [[315,0],[315,317]]},
{tileName: "Geo_Type_A_0002", path: [[0,315],[317,315]]},
{tileName: "Geo_Type_A_0002", path: [[0,735],[265,735],[692,315],[840,315]]},
{tileName: "Geo_Type_A_0002", path: [[525,840],[525,523]]},
{tileName: "Geo_Type_A_0002", path: [[840,525],[523,525]]},
{tileName: "Geo_Type_A_0002", path: [[735,840],[735,735],[840, 735]]},
{tileName: "Geo_Type_A_0003", path: [[105,0],[105,35]]},
{tileName: "Geo_Type_A_0003", path: [[315,0],[315,35]]},
{tileName: "Geo_Type_A_0003", path: [[525,0],[525,35]]},
{tileName: "Geo_Type_A_0003", path: [[735,0],[735,35]]},
{tileName: "Geo_Type_A_0003", path: [[0,315],[35,315],[35,525],[0,525]]},
{tileName: "Geo_Type_A_0003", path: [[840,315],[805,315],[805,525],[840,525]]},
{tileName: "Geo_Type_A_0003", path: [[0,735],[35,735],[35,805],[105,805],[105,840]]},
{tileName: "Geo_Type_A_0003", path: [[0,105],[35,105],[35, 35],[805, 35],[805,105],[840,105]]},
{tileName: "Geo_Type_A_0003", path: [[840,735],[805,735],[805,805],[735,805],[735,840]]},
{tileName: "Geo_Type_A_0003", path: [[315,840],[315,805],[525,805],[525,840]]},
{tileName: "Geo_Type_A_0004", path: [[315,0],[315,35],[525,35],[525,0]]},
{tileName: "Geo_Type_A_0004", path: [[840,105],[805,105],[805,35],[735,35],[735,0]]},
{tileName: "Geo_Type_A_0004", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0004", path: [[0,315],[35,315],[35,525],[0,525]]},
{tileName: "Geo_Type_A_0004", path: [[840,315],[805,315],[805,525],[840,525]]},
{tileName: "Geo_Type_A_0004", path: [[0,735],[35,735],[35,805],[105,805],[105,840]]},
{tileName: "Geo_Type_A_0004", path: [[840,735],[805,735],[805,805],[735,805],[735,840]]},
{tileName: "Geo_Type_A_0004", path: [[315,840],[315,805],[525,805],[525,840]]},
{tileName: "Geo_Type_A_0005", path: [[315,0],[315,35],[525,35],[525,0]]},
{tileName: "Geo_Type_A_0005", path: [[840,105],[805,105],[805,35],[735,35],[735,0]]},
{tileName: "Geo_Type_A_0005", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0005", path: [[0,315],[35,315],[35,525],[0,525]]},
{tileName: "Geo_Type_A_0005", path: [[840,315],[805,315],[805,525],[840,525]]},
{tileName: "Geo_Type_A_0005", path: [[0,735],[35,735],[35,805],[105,805],[105,840]]},
{tileName: "Geo_Type_A_0005", path: [[840,735],[805,735],[805,805],[735,805],[735,840]]},
{tileName: "Geo_Type_A_0005", path: [[315,840],[315,805],[525,805],[525,840]]},
{tileName: "Geo_Type_A_0006", path: [[315,0],[315,35],[525,35],[525,0]]},
{tileName: "Geo_Type_A_0006", path: [[840,105],[805,105],[805,35],[735,35],[735,0]]},
{tileName: "Geo_Type_A_0006", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0006", path: [[0,315],[35,315],[35,525],[0,525]]},
{tileName: "Geo_Type_A_0006", path: [[840,315],[805,315],[805,525],[840,525]]},
{tileName: "Geo_Type_A_0006", path: [[0,735],[35,735],[35,805],[105,805],[105,840]]},
{tileName: "Geo_Type_A_0006", path: [[840,735],[805,735],[805,805],[735,805],[735,840]]},
{tileName: "Geo_Type_A_0006", path: [[315,840],[315,805],[525,805],[525,840]]},
{tileName: "Geo_Type_A_0007", path: [[315,0],[315,35],[525,35],[525,0]]},
{tileName: "Geo_Type_A_0007", path: [[840,105],[805,105],[805,35],[735,35],[735,0]]},
{tileName: "Geo_Type_A_0007", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0007", path: [[0,315],[35,315],[35,525],[0,525]]},
{tileName: "Geo_Type_A_0007", path: [[840,315],[805,315],[805,525],[840,525]]},
{tileName: "Geo_Type_A_0007", path: [[0,735],[35,735],[35,805],[105,805],[105,840]]},
{tileName: "Geo_Type_A_0007", path: [[840,735],[805,735],[805,805],[735,805],[735,840]]},
{tileName: "Geo_Type_A_0007", path: [[315,840],[315,805],[525,805],[525,840]]},
{tileName: "Geo_Type_A_0008", path: [[0,105],[105,105],[105,0]]},
{tileName: "Geo_Type_A_0008", path: [[105,105],[315,105],[315,0]]},
{tileName: "Geo_Type_A_0008", path: [[315,105],[525,105],[525,0]]},
{tileName: "Geo_Type_A_0008", path: [[525,105],[735,105],[735,0]]},
{tileName: "Geo_Type_A_0008", path: [[735,105],[840,105]]},
{tileName: "Geo_Type_A_0008", path: [[0,315],[840,315]]},
{tileName: "Geo_Type_A_0008", path: [[0,525],[840,525]]},
{tileName: "Geo_Type_A_0008", path: [[735,0],[735,35]]},
{tileName: "Geo_Type_A_0008", path: [[315,315],[315,525]]},
{tileName: "Geo_Type_A_0008", path: [[525,315],[525,525]]},
{tileName: "Geo_Type_A_0008", path: [[735,315],[735,525]]},
{tileName: "Geo_Type_A_0008", path: [[0,735],[105,735],[105,840]]},
{tileName: "Geo_Type_A_0008", path: [[105,735],[315,735],[315,840]]},
{tileName: "Geo_Type_A_0008", path: [[315,735],[525,735],[525,840]]},
{tileName: "Geo_Type_A_0008", path: [[525,735],[735,735],[735,840]]},
{tileName: "Geo_Type_A_0008", path: [[735,735],[840,735]]},
{tileName: "Geo_Type_A_0008", path: [[105,315],[105,525]]},
{tileName: "Geo_Type_A_0009", path: [[0,105],[105,105],[105,0]]},
{tileName: "Geo_Type_A_0009", path: [[0,735],[105,735],[105,840]]},
{tileName: "Geo_Type_A_0009", path: [[0,315],[105,315],[105,525],[0,525]]},
{tileName: "Geo_Type_A_0009", path: [[315,0],[315,105],[525,105],[525,0]]},
{tileName: "Geo_Type_A_0009", path: [[315,840],[315,735],[525,735],[525,840]]},
{tileName: "Geo_Type_A_0009", path: [[840,105],[735,105],[735,0]]},
{tileName: "Geo_Type_A_0009", path: [[840,735],[735,735],[735,840]]},
{tileName: "Geo_Type_A_0009", path: [[840,315],[735,315],[735,525],[840,525]]},
{tileName: "Geo_Type_A_0010", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0010", path: [[840,105],[805,105],[805,35],[735,35],[735,0]]},
{tileName: "Geo_Type_A_0010", path: [[0,315],[105,315],[105,525],[0,525]]},
{tileName: "Geo_Type_A_0010", path: [[315,0],[315,35],[525,35],[525,0]]},
{tileName: "Geo_Type_A_0010", path: [[0,735],[105,735],[105,840]]},
{tileName: "Geo_Type_A_0010", path: [[105,735],[315,735],[315,840]]},
{tileName: "Geo_Type_A_0010", path: [[315,735],[525,735],[525,840]]},
{tileName: "Geo_Type_A_0010", path: [[525,735],[735,735],[735,840]]},
{tileName: "Geo_Type_A_0010", path: [[735,735],[840,735]]},
{tileName: "Geo_Type_A_0010", path: [[105,525],[315,525],[315,455]]},
{tileName: "Geo_Type_A_0010", path: [[840,525],[525,525],[525,455]]},
{tileName: "Geo_Type_A_0010", path: [[840,315],[735,315],[735,525],[840,525]]},
{tileName: "Geo_Type_A_0011", path: [[0,105],[105,105],[105,0]]},
{tileName: "Geo_Type_A_0011", path: [[0,315],[315,315],[315,0]]},
{tileName: "Geo_Type_A_0011", path: [[735,0],[735,105],[840,105]]},
{tileName: "Geo_Type_A_0011", path: [[525,0],[525,315],[840,315]]},
{tileName: "Geo_Type_A_0011", path: [[735,840],[735,735],[840,735]]},
{tileName: "Geo_Type_A_0011", path: [[525,840],[525,525],[840,525]]},
{tileName: "Geo_Type_A_0011", path: [[0,735],[105,735],[105,840]]},
{tileName: "Geo_Type_A_0011", path: [[0,525],[315,525],[315,840]]},
{tileName: "Geo_Type_A_0012", path: [[0,105],[105,105],[105,0]]},
{tileName: "Geo_Type_A_0012", path: [[0,315],[315,315],[315,0]]},
{tileName: "Geo_Type_A_0012", path: [[735,0],[735,105],[840,105]]},
{tileName: "Geo_Type_A_0012", path: [[735,840],[735,735],[840,735]]},
{tileName: "Geo_Type_A_0012", path: [[0,735],[105,735],[105,840]]},
{tileName: "Geo_Type_A_0012", path: [[840,315],[735,315],[735,525],[840,525]]},
{tileName: "Geo_Type_A_0012", path: [[525,840],[525,0]]},
{tileName: "Geo_Type_A_0012", path: [[0,525],[315,525],[315,840]]},
{tileName: "Geo_Type_A_0013", path: [[0,105],[105,105],[105,0]]},
{tileName: "Geo_Type_A_0013", path: [[0,735],[105,735],[105,840]]},
{tileName: "Geo_Type_A_0013", path: [[840,315],[735,315],[735,525],[840,525]]},
{tileName: "Geo_Type_A_0013", path: [[0,315],[525,315],[525,840]]},
{tileName: "Geo_Type_A_0013", path: [[735,840],[735,735],[840,735]]},
{tileName: "Geo_Type_A_0013", path: [[735,0],[735,105],[840,105]]},
{tileName: "Geo_Type_A_0013", path: [[315,0],[315,105],[525,105],[525,0]]},
{tileName: "Geo_Type_A_0013", path: [[0,525],[315,525],[315,840]]},
{tileName: "Geo_Type_A_0014", path: [[840,525],[805,525],[805,735],[840,735]]},
{tileName: "Geo_Type_A_0014", path: [[525,840],[525,805],[735,805],[735,840]]},
{tileName: "Geo_Type_A_0014", path: [[105,840],[105,805],[315,805],[315,840]]},
{tileName: "Geo_Type_A_0014", path: [[0,525],[35,525],[35,735],[0,735]]},
{tileName: "Geo_Type_A_0014", path: [[805,315],[840,315]]},
{tileName: "Geo_Type_A_0014", path: [[735,0],[735,35],[805,35],[805,105],[840,105]]},
{tileName: "Geo_Type_A_0014", path: [[525,0],[525,35],[35,35],[35,105],[35,315],[10,410],[35,525],[35,805],[315,805],[410,810],[525,805],[805,805],[805,315]]},
{tileName: "Geo_Type_A_0014", path: [[105,0],[105,35],[315,35],[315,0]]},
{tileName: "Geo_Type_A_0014", path: [[0,105],[35,105],[35,315],[0,315]]},
{tileName: "Geo_Type_A_0015", path: [[735,840],[735,735],[840,735]]},
{tileName: "Geo_Type_A_0015", path: [[735,315],[735,525],[840,525]]},
{tileName: "Geo_Type_A_0015", path: [[315,735],[525,735],[525,840]]},
{tileName: "Geo_Type_A_0015", path: [[315,840],[315,315],[840,315]]},
{tileName: "Geo_Type_A_0015", path: [[0,735],[105,735],[105,840]]},
{tileName: "Geo_Type_A_0015", path: [[0,315],[105,315],[105,525],[0,525]]},
{tileName: "Geo_Type_A_0015", path: [[315,0],[315,105],[525,105],[525,0]]},
{tileName: "Geo_Type_A_0015", path: [[735,0],[735,105],[840,105]]},
{tileName: "Geo_Type_A_0015", path: [[0,105],[105,105],[105,0]]},
{tileName: "Geo_Type_A_0016", path: [[665,315],[840,315]]},
{tileName: "Geo_Type_A_0016", path: [[315,840],[315,315],[455,315]]},
{tileName: "Geo_Type_A_0016", path: [[735,840],[735,735],[840,735]]},
{tileName: "Geo_Type_A_0016", path: [[735,315],[735,525],[840,525]]},
{tileName: "Geo_Type_A_0016", path: [[315,735],[525,735],[525,840]]},
{tileName: "Geo_Type_A_0016", path: [[0,735],[105,735],[105,840]]},
{tileName: "Geo_Type_A_0016", path: [[0,315],[105,315],[105,525],[0,525]]},
{tileName: "Geo_Type_A_0016", path: [[315,0],[315,105],[525,105],[525,0]]},
{tileName: "Geo_Type_A_0016", path: [[735,0],[735,105],[840,105]]},
{tileName: "Geo_Type_A_0016", path: [[0,105],[105,105],[105,0]]},
{tileName: "Geo_Type_A_0017", path: [[315,315],[315,840]]},
{tileName: "Geo_Type_A_0017", path: [[315,525],[840,525]]},
{tileName: "Geo_Type_A_0017", path: [[525,0],[525,525]]},
{tileName: "Geo_Type_A_0017", path: [[0,315],[525,315]]},
{tileName: "Geo_Type_A_0017", path: [[35,315],[35,525]]},
{tileName: "Geo_Type_A_0017", path: [[315,805],[525,805]]},
{tileName: "Geo_Type_A_0017", path: [[805,315],[805,525]]},
{tileName: "Geo_Type_A_0017", path: [[315,35],[525,35]]},
{tileName: "Geo_Type_A_0017", path: [[0,525],[105,525]]},
{tileName: "Geo_Type_A_0017", path: [[525,840],[525,735]]},
{tileName: "Geo_Type_A_0017", path: [[840,315],[735,315]]},
{tileName: "Geo_Type_A_0017", path: [[315,0],[315,105]]},
{tileName: "Geo_Type_A_0017", path: [[0,735],[35,735],[35,805],[105,805],[105,840]]},
{tileName: "Geo_Type_A_0017", path: [[840,735],[805,735],[805,805],[735,805],[735,840]]},
{tileName: "Geo_Type_A_0017", path: [[840,105],[805,105],[805,35],[735,35],[735,0]]},
{tileName: "Geo_Type_A_0017", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0018", path: [[315,0],[315,35],[525,35],[525,0]]},
{tileName: "Geo_Type_A_0018", path: [[840,525],[735,525],[735,315]]},
{tileName: "Geo_Type_A_0018", path: [[0,525],[105,525],[105,315]]},
{tileName: "Geo_Type_A_0018", path: [[665,315],[840,315]]},
{tileName: "Geo_Type_A_0018", path: [[0,315],[175,315]]},
{tileName: "Geo_Type_A_0018", path: [[315,840],[315,735],[525,735],[525,840]]},
{tileName: "Geo_Type_A_0018", path: [[840,735],[735,735],[735,840]]},
{tileName: "Geo_Type_A_0018", path: [[0,735],[105,735],[105,840]]},
{tileName: "Geo_Type_A_0018", path: [[840,105],[805,105],[805,35],[735,35],[735,0]]},
{tileName: "Geo_Type_A_0018", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0019", path: [[315,595],[245,595],[245,245],[595,245],[595,595],[525,595]]},
{tileName: "Geo_Type_A_0019", path: [[315,0],[315,35],[525,35],[525,0]]},
{tileName: "Geo_Type_A_0019", path: [[840,105],[805,105],[805,35],[735,35],[735,0]]},
{tileName: "Geo_Type_A_0019", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0019", path: [[0,315],[35,315],[35,525],[0,525]]},
{tileName: "Geo_Type_A_0019", path: [[840,315],[805,315],[805,525],[840,525]]},
{tileName: "Geo_Type_A_0019", path: [[0,735],[35,735],[35,805],[105,805],[105,840]]},
{tileName: "Geo_Type_A_0019", path: [[840,735],[805,735],[805,805],[735,805],[735,840]]},
{tileName: "Geo_Type_A_0019", path: [[315,840],[315,805],[525,805],[525,840]]},
{tileName: "Geo_Type_A_0020", path: [[455,525],[455,805]]},
{tileName: "Geo_Type_A_0020", path: [[383,525],[525,525]]},
{tileName: "Geo_Type_A_0020", path: [[385,315],[385,525]]},
{tileName: "Geo_Type_A_0020", path: [[315,315],[525,315]]},
{tileName: "Geo_Type_A_0020", path: [[735,525],[805,525]]},
{tileName: "Geo_Type_A_0020", path: [[805,525],[805,735]]},
{tileName: "Geo_Type_A_0020", path: [[105,805],[315,805]]},
{tileName: "Geo_Type_A_0020", path: [[35,315],[105,315]]},
{tileName: "Geo_Type_A_0020", path: [[735,315],[805,315]]},
{tileName: "Geo_Type_A_0020", path: [[315,0],[315,35],[525,35],[525,0]]},
{tileName: "Geo_Type_A_0020", path: [[840,105],[805,105],[805,35],[735,35],[735,0]]},
{tileName: "Geo_Type_A_0020", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0020", path: [[0,315],[35,315],[35,525],[0,525]]},
{tileName: "Geo_Type_A_0020", path: [[840,315],[805,315],[805,525],[840,525]]},
{tileName: "Geo_Type_A_0020", path: [[0,735],[35,735],[35,805],[105,805],[105,840]]},
{tileName: "Geo_Type_A_0020", path: [[840,735],[805,735],[805,805],[735,805],[735,840]]},
{tileName: "Geo_Type_A_0020", path: [[315,840],[315,805],[525,805],[525,840]]},
{tileName: "Geo_Type_A_0021", path: [[525,805],[735,805]]},
{tileName: "Geo_Type_A_0021", path: [[35,525],[35,735]]},
{tileName: "Geo_Type_A_0021", path: [[455,525],[455,805]]},
{tileName: "Geo_Type_A_0021", path: [[383,525],[457,525]]},
{tileName: "Geo_Type_A_0021", path: [[385,315],[385,525]]},
{tileName: "Geo_Type_A_0021", path: [[315,315],[525,315]]},
{tileName: "Geo_Type_A_0021", path: [[805,525],[805,735]]},
{tileName: "Geo_Type_A_0021", path: [[105,805],[315,805]]},
{tileName: "Geo_Type_A_0021", path: [[35,315],[105,315]]},
{tileName: "Geo_Type_A_0021", path: [[735,315],[805,315]]},
{tileName: "Geo_Type_A_0021", path: [[315,0],[315,35],[525,35],[525,0]]},
{tileName: "Geo_Type_A_0021", path: [[840,105],[805,105],[805,35],[735,35],[735,0]]},
{tileName: "Geo_Type_A_0021", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0021", path: [[0,315],[35,315],[35,525],[0,525]]},
{tileName: "Geo_Type_A_0021", path: [[840,315],[805,315],[805,525],[840,525]]},
{tileName: "Geo_Type_A_0021", path: [[0,735],[35,735],[35,805],[105,805],[105,840]]},
{tileName: "Geo_Type_A_0021", path: [[840,735],[805,735],[805,805],[735,805],[735,840]]},
{tileName: "Geo_Type_A_0021", path: [[315,840],[315,805],[525,805],[525,840]]},
{tileName: "Geo_Type_A_0022", path: [[525,805],[735,805]]},
{tileName: "Geo_Type_A_0022", path: [[455,525],[455,805]]},
{tileName: "Geo_Type_A_0022", path: [[383,525],[525,525]]},
{tileName: "Geo_Type_A_0022", path: [[385,315],[385,525]]},
{tileName: "Geo_Type_A_0022", path: [[315,315],[525,315]]},
{tileName: "Geo_Type_A_0022", path: [[735,525],[805,525]]},
{tileName: "Geo_Type_A_0022", path: [[805,525],[805,735]]},
{tileName: "Geo_Type_A_0022", path: [[105,805],[315,805]]},
{tileName: "Geo_Type_A_0022", path: [[35,315],[105,315]]},
{tileName: "Geo_Type_A_0022", path: [[735,315],[805,315]]},
{tileName: "Geo_Type_A_0022", path: [[315,0],[315,35],[525,35],[525,0]]},
{tileName: "Geo_Type_A_0022", path: [[840,105],[805,105],[805,35],[735,35],[735,0]]},
{tileName: "Geo_Type_A_0022", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0022", path: [[0,315],[35,315],[35,525],[0,525]]},
{tileName: "Geo_Type_A_0022", path: [[840,315],[805,315],[805,525],[840,525]]},
{tileName: "Geo_Type_A_0022", path: [[0,735],[35,735],[35,805],[105,805],[105,840]]},
{tileName: "Geo_Type_A_0022", path: [[840,735],[805,735],[805,805],[735,805],[735,840]]},
{tileName: "Geo_Type_A_0022", path: [[315,840],[315,805],[525,805],[525,840]]},
{tileName: "Geo_Type_A_0023", path: [[383,525],[735,525]]},
{tileName: "Geo_Type_A_0023", path: [[35,525],[35,735]]},
{tileName: "Geo_Type_A_0023", path: [[525,805],[735,805]]},
{tileName: "Geo_Type_A_0023", path: [[455,525],[455,805]]},
{tileName: "Geo_Type_A_0023", path: [[383,525],[525,525]]},
{tileName: "Geo_Type_A_0023", path: [[385,315],[385,525]]},
{tileName: "Geo_Type_A_0023", path: [[315,315],[525,315]]},
{tileName: "Geo_Type_A_0023", path: [[735,525],[805,525]]},
{tileName: "Geo_Type_A_0023", path: [[805,525],[805,735]]},
{tileName: "Geo_Type_A_0023", path: [[105,805],[315,805]]},
{tileName: "Geo_Type_A_0023", path: [[35,315],[105,315]]},
{tileName: "Geo_Type_A_0023", path: [[735,315],[805,315]]},
{tileName: "Geo_Type_A_0023", path: [[315,0],[315,35],[525,35],[525,0]]},
{tileName: "Geo_Type_A_0023", path: [[840,105],[805,105],[805,35],[735,35],[735,0]]},
{tileName: "Geo_Type_A_0023", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0023", path: [[0,315],[35,315],[35,525],[0,525]]},
{tileName: "Geo_Type_A_0023", path: [[840,315],[805,315],[805,525],[840,525]]},
{tileName: "Geo_Type_A_0023", path: [[0,735],[35,735],[35,805],[105,805],[105,840]]},
{tileName: "Geo_Type_A_0023", path: [[840,735],[805,735],[805,805],[735,805],[735,840]]},
{tileName: "Geo_Type_A_0023", path: [[315,840],[315,805],[525,805],[525,840]]},
{tileName: "Geo_Type_A_0024", path: [[315,315],[525,315]]},
{tileName: "Geo_Type_A_0024", path: [[525,805],[735,805]]},
{tileName: "Geo_Type_A_0024", path: [[35,525],[35,735]]},
{tileName: "Geo_Type_A_0024", path: [[805,525],[805,735]]},
{tileName: "Geo_Type_A_0024", path: [[105,805],[315,805]]},
{tileName: "Geo_Type_A_0024", path: [[35,315],[105,315]]},
{tileName: "Geo_Type_A_0024", path: [[735,315],[805,315]]},
{tileName: "Geo_Type_A_0024", path: [[315,0],[315,35],[525,35],[525,0]]},
{tileName: "Geo_Type_A_0024", path: [[840,105],[805,105],[805,35],[735,35],[735,0]]},
{tileName: "Geo_Type_A_0024", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0024", path: [[0,315],[35,315],[35,525],[0,525]]},
{tileName: "Geo_Type_A_0024", path: [[840,315],[805,315],[805,525],[840,525]]},
{tileName: "Geo_Type_A_0024", path: [[0,735],[35,735],[35,805],[105,805],[105,840]]},
{tileName: "Geo_Type_A_0024", path: [[840,735],[805,735],[805,805],[735,805],[735,840]]},
{tileName: "Geo_Type_A_0024", path: [[315,840],[315,805],[525,805],[525,840]]},
{tileName: "Geo_Type_A_0025", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0025", path: [[0,315],[35,315],[35,385],[385,385],[385,35],[315,35],[315,0]]},
{tileName: "Geo_Type_A_0026", path: [[315,840],[315,805],[385,805],[385,315]]},
{tileName: "Geo_Type_A_0026", path: [[0,735],[35,735],[35,805],[105,805],[105,840]]},
{tileName: "Geo_Type_A_0026", path: [[0,525],[35,525],[35,315]]},
{tileName: "Geo_Type_A_0026", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0026", path: [[0,315],[35,315],[385,315],[385,35],[315,35],[315,0]]},
{tileName: "Geo_Type_A_0027", path: [[0,315],[35,315],[35,525],[0,525]]},
{tileName: "Geo_Type_A_0027", path: [[385,525],[385,805],[315,805],[315,840]]},
{tileName: "Geo_Type_A_0027", path: [[0,735],[35,735],[35,805],[105,805],[105,840]]},
{tileName: "Geo_Type_A_0027", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0027", path: [[385,315],[385,35],[315,35],[315,0]]},
{tileName: "Geo_Type_A_0028", path: [[385,315],[385,525]]},
{tileName: "Geo_Type_A_0028", path: [[0,315],[35,315],[35,525],[0,525]]},
{tileName: "Geo_Type_A_0028", path: [[385,735],[385,805],[315,805],[315,840]]},
{tileName: "Geo_Type_A_0028", path: [[0,735],[35,735],[35,805],[105,805],[105,840]]},
{tileName: "Geo_Type_A_0028", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0028", path: [[385,105],[385,35],[315,35],[315,0]]},
{tileName: "Geo_Type_A_0029", path: [[385,735],[385,105]]},
{tileName: "Geo_Type_A_0029", path: [[0,315],[35,315],[35,525],[0,525]]},
{tileName: "Geo_Type_A_0029", path: [[385,735],[385,805],[315,805],[315,840]]},
{tileName: "Geo_Type_A_0029", path: [[0,735],[35,735],[35,805],[105,805],[105,840]]},
{tileName: "Geo_Type_A_0029", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0029", path: [[385,105],[385,35],[315,35],[315,0]]},
{tileName: "Geo_Type_A_0030", path: [[315,0],[315,35],[525,35],[525,0]]},
{tileName: "Geo_Type_A_0030", path: [[840,105],[805,105],[805,35],[735,35],[735,0]]},
{tileName: "Geo_Type_A_0030", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0030", path: [[0,315],[35,315],[35,525],[0,525]]},
{tileName: "Geo_Type_A_0030", path: [[840,315],[805,315],[805,525],[840,525]]},
{tileName: "Geo_Type_A_0030", path: [[0,735],[35,735],[35,805],[105,805],[105,840]]},
{tileName: "Geo_Type_A_0030", path: [[840,735],[805,735],[805,805],[735,805],[735,840]]},
{tileName: "Geo_Type_A_0030", path: [[315,840],[315,805],[525,805],[525,840]]},
{tileName: "Geo_Type_A_0033", path: [[315,0],[315,35],[525,35],[525,0]]},
{tileName: "Geo_Type_A_0033", path: [[840,105],[805,105],[805,35],[735,35],[735,0]]},
{tileName: "Geo_Type_A_0033", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0033", path: [[0,315],[35,315],[35,525],[0,525]]},
{tileName: "Geo_Type_A_0033", path: [[840,315],[805,315],[805,525],[840,525]]},
{tileName: "Geo_Type_A_0033", path: [[0,735],[35,735],[35,805],[105,805],[105,840]]},
{tileName: "Geo_Type_A_0033", path: [[840,735],[805,735],[805,805],[735,805],[735,840]]},
{tileName: "Geo_Type_A_0033", path: [[315,840],[315,805],[525,805],[525,840]]},
{tileName: "Geo_Type_A_0034", path: [[315,0],[315,35],[525,35],[525,0]]},
{tileName: "Geo_Type_A_0034", path: [[840,105],[805,105],[805,35],[735,35],[735,0]]},
{tileName: "Geo_Type_A_0034", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0034", path: [[0,315],[35,315],[35,525],[0,525]]},
{tileName: "Geo_Type_A_0034", path: [[840,315],[805,315],[805,525],[840,525]]},
{tileName: "Geo_Type_A_0034", path: [[0,735],[35,735],[35,805],[105,805],[105,840]]},
{tileName: "Geo_Type_A_0034", path: [[840,735],[805,735],[805,805],[735,805],[735,840]]},
{tileName: "Geo_Type_A_0034", path: [[315,840],[315,805],[525,805],[525,840]]},
{tileName: "Geo_Type_A_0035", path: [[315,0],[315,35],[525,35],[525,0]]},
{tileName: "Geo_Type_A_0035", path: [[840,105],[805,105],[805,35],[735,35],[735,0]]},
{tileName: "Geo_Type_A_0035", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0035", path: [[0,315],[35,315],[35,525],[0,525]]},
{tileName: "Geo_Type_A_0035", path: [[840,315],[805,315],[805,525],[840,525]]},
{tileName: "Geo_Type_A_0035", path: [[0,735],[35,735],[35,805],[105,805],[105,840]]},
{tileName: "Geo_Type_A_0035", path: [[840,735],[805,735],[805,805],[735,805],[735,840]]},
{tileName: "Geo_Type_A_0035", path: [[315,840],[315,805],[525,805],[525,840]]},
{tileName: "Geo_Type_A_0036", path: [[315,0],[315,35],[525,35],[525,0]]},
{tileName: "Geo_Type_A_0036", path: [[840,105],[805,105],[805,35],[735,35],[735,0]]},
{tileName: "Geo_Type_A_0036", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0036", path: [[0,315],[35,315],[35,525],[0,525]]},
{tileName: "Geo_Type_A_0036", path: [[840,315],[805,315],[805,525],[840,525]]},
{tileName: "Geo_Type_A_0036", path: [[0,735],[35,735],[35,805],[105,805],[105,840]]},
{tileName: "Geo_Type_A_0036", path: [[840,735],[805,735],[805,805],[735,805],[735,840]]},
{tileName: "Geo_Type_A_0036", path: [[315,840],[315,805],[525,805],[525,840]]},
{tileName: "Geo_Type_A_0037", path: [[315,0],[315,35],[525,35],[525,0]]},
{tileName: "Geo_Type_A_0037", path: [[840,105],[805,105],[805,35],[735,35],[735,0]]},
{tileName: "Geo_Type_A_0037", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0037", path: [[0,315],[35,315],[35,525],[0,525]]},
{tileName: "Geo_Type_A_0037", path: [[840,315],[805,315],[805,525],[840,525]]},
{tileName: "Geo_Type_A_0037", path: [[0,735],[35,735],[35,805],[105,805],[105,840]]},
{tileName: "Geo_Type_A_0037", path: [[840,735],[805,735],[805,805],[735,805],[735,840]]},
{tileName: "Geo_Type_A_0037", path: [[315,840],[315,805],[525,805],[525,840]]},
{tileName: "Geo_Type_A_0038", path: [[315,0],[315,35],[525,35],[525,0]]},
{tileName: "Geo_Type_A_0038", path: [[840,105],[805,105],[805,35],[735,35],[735,0]]},
{tileName: "Geo_Type_A_0038", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0038", path: [[0,315],[35,315],[35,525],[0,525]]},
{tileName: "Geo_Type_A_0038", path: [[840,315],[805,315],[805,525],[840,525]]},
{tileName: "Geo_Type_A_0038", path: [[0,735],[35,735],[35,805],[105,805],[105,840]]},
{tileName: "Geo_Type_A_0038", path: [[840,735],[805,735],[805,805],[735,805],[735,840]]},
{tileName: "Geo_Type_A_0038", path: [[315,840],[315,805],[525,805],[525,840]]},
{tileName: "Geo_Type_A_0039", path: [[425,35],[415,215],[290,420],[290,450],[420,650],[400,805]]},
{tileName: "Geo_Type_A_0039", path: [[315,0],[315,35],[525,35],[525,0]]},
{tileName: "Geo_Type_A_0039", path: [[840,105],[805,105],[805,35],[735,35],[735,0]]},
{tileName: "Geo_Type_A_0039", path: [[840,315],[805,315],[805,525],[840,525]]},
{tileName: "Geo_Type_A_0039", path: [[840,735],[805,735],[805,805],[735,805],[735,840]]},
{tileName: "Geo_Type_A_0039", path: [[315,840],[315,805],[525,805],[525,840]]},
{tileName: "Geo_Type_A_0040", path: [[805,420],[400,805]]},
{tileName: "Geo_Type_A_0040", path: [[840,735],[805,735],[805,805],[735,805],[735,840]]},
{tileName: "Geo_Type_A_0040", path: [[840,315],[805,315],[805,525],[840,525]]},
{tileName: "Geo_Type_A_0040", path: [[315,840],[315,805],[525,805],[525,840]]},
{tileName: "Geo_Type_A_0043", path: [[315,0],[315,35],[525,35],[525,0]]},
{tileName: "Geo_Type_A_0043", path: [[840,105],[805,105],[805,35],[735,35],[735,0]]},
{tileName: "Geo_Type_A_0043", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0043", path: [[0,315],[35,315],[35,525],[0,525]]},
{tileName: "Geo_Type_A_0043", path: [[840,315],[805,315],[805,525],[840,525]]},
{tileName: "Geo_Type_A_0043", path: [[0,735],[35,735],[35,805],[105,805],[105,840]]},
{tileName: "Geo_Type_A_0043", path: [[840,735],[805,735],[805,805],[735,805],[735,840]]},
{tileName: "Geo_Type_A_0043", path: [[315,840],[315,805],[525,805],[525,840]]},
{tileName: "Geo_Type_A_0043", path: [[315,0],[315,35],[525,35],[525,0]]},
{tileName: "Geo_Type_A_0043", path: [[840,105],[805,105],[805,35],[735,35],[735,0]]},
{tileName: "Geo_Type_A_0043", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0043", path: [[0,315],[35,315],[35,525],[0,525]]},
{tileName: "Geo_Type_A_0043", path: [[0,735],[35,735],[35,805],[105,805],[105,840]]},
{tileName: "Geo_Type_A_0043", path: [[840,735],[805,735],[805,805],[735,805],[735,840]]},
{tileName: "Geo_Type_A_0043", path: [[315,840],[315,805],[525,805],[525,840]]},
{tileName: "Geo_Type_A_0045", path: [[665,175],[595,245]]},
{tileName: "Geo_Type_A_0045", path: [[175,665],[245,595]]},
{tileName: "Geo_Type_A_0045", path: [[175,175],[245,245]]},
{tileName: "Geo_Type_A_0045", path: [[665,665],[595,595]]},
{tileName: "Geo_Type_A_0045", path: [[315,0],[315,35],[525,35],[525,0]]},
{tileName: "Geo_Type_A_0045", path: [[840,105],[805,105],[805,35],[735,35],[735,0]]},
{tileName: "Geo_Type_A_0045", path: [[0,105],[35,105],[35,35],[105,35],[105,0]]},
{tileName: "Geo_Type_A_0045", path: [[0,315],[35,315],[35,525],[0,525]]},
{tileName: "Geo_Type_A_0045", path: [[840,315],[805,315],[805,525],[840,525]]},
{tileName: "Geo_Type_A_0045", path: [[0,735],[35,735],[35,805],[105,805],[105,840]]},
{tileName: "Geo_Type_A_0045", path: [[840,735],[805,735],[805,805],[735,805],[735,840]]},
{tileName: "Geo_Type_A_0045", path: [[315,840],[315,805],[525,805],[525,840]]},
];
on("ready", function() {
    on("chat:message", function(msg) {if(msg.type == "api"){processMessage(msg)};});
});

processMessage = function(msg) {
    if(msg.type !== "api"){return};
    if(msg.content == "!setup"){setup();}
    if(msg.content == "!geo"){geomorph();};
    if(msg.content == "!light"){setPaths();};
    if(msg.content == "!right90"){rotateTile(msg, 90);};
    if(msg.content == "!left90"){rotateTile(msg, -90);};
    if(msg.content == "!turn180"){rotateTile(msg, 180);};
};

rotateTile = function(msg, degree) {
    var selectedObjs = msg.selected;
    	_.each(selectedObjs, function(obj) {
			if(obj._type == 'graphic'){
				var token = getObj('graphic', obj._id);
                		var newRotation = token.get("rotation");   
                		newRotation = newRotation + degree;                
                		token.set({"rotation": newRotation});        
			};
		});
};

setup = function() {
    var players = findObjs({_type: "player"});
    createObj("macro", {
        name: "Turn-180-Degrees",
        _playerid: players[0].get("_id"),
        visibleto: "all",
        action: "!turn180",
        istokenaction: true
    });
    createObj("macro", {
        name: "Turn-Left-90-Degrees",
        _playerid: players[0].get("_id"),
        visibleto: "all",
        action: "!left90",
        istokenaction: true
    });
    createObj("macro", {
        name: "Turn-Right-90-Degrees",
        _playerid: players[0].get("_id"),
        visibleto: "all",
        action: "!right90",
        istokenaction: true
    });
    createObj("macro", {
        name: "Add-Dynamic-Lighting-Paths",
        _playerid: players[0].get("_id"),
        visibleto: "all",
        action: "!light",
    });
    createObj("macro", {
        name: "Create-Map-Layer",
        _playerid: players[0].get("_id"),
        visibleto: "all",
        action: "!geo",
    });
};

geomorph = function() {
    mapCheck(); checkTileTable(); buildTileArray(); 
    if(isError == true){sendChat("API", errorType); isError = false; return;};
    gridOutMap(); createSides();
    placeCorners(); placeEdge(); fillFrame(); setSpin(); stepThroughMap();
};

setPaths = function() {
    var campaignPagesGeo = findObjs({ name: mapName, _type: "page"});
    if(campaignPagesGeo.length == 0){isError = true; errorType = mapName + " is missing.";};
    if(campaignPagesGeo.length > 1){isError = true; errorType = "More than one " + mapName + ".";};
    if(isError == true){sendChat("API", errorType); isError = false; return;};
    geomorphicMapId = campaignPagesGeo[0].get("_id");
    geomorphicMapWidth = campaignPagesGeo[0].get("width");
    geomorphicMapHeight = campaignPagesGeo[0].get("height");
    var geomorphicMapGraphics = findObjs({_pageid: geomorphicMapId, layer: "walls", _type: "path"});
    if(geomorphicMapGraphics.length != 0){isError = true; errorType = mapName + " has paths on it on the Dynamic Lighting layer. Please remove.";};
    if(geomorphicMapWidth % 12 !== 0){isError = true; errorType = "Map width must be disible by 12.";};
    if(geomorphicMapHeight % 12 !== 0){isError = true; errorType = "Map height must be disible by 12.";};
    if(geomorphicMapWidth < 36 || geomorphicMapHeight < 36){isError = true; errorType = "Map height must be 36 or larger.";};
    if(isError == true){sendChat("API", errorType); isError = false; return;};
    checkTileTable(); buildTileArray(); 
    readMap();
    
    _.each(pathArray, function(pathArrayEach) {
        var givenPath = pathArrayEach.path;
        var givenAngle = pathArrayEach.rotation;
        var givenX = pathArrayEach.left - 420;
        var givenY = pathArrayEach.top - 420;
        
        /* -------------------
        createPath function was most helpfully provided by Alex L.
        https://app.roll20.net/users/71687/alex-l
        ------------------- */    
        createPath(givenPath, givenAngle, givenX, givenY);
    });
};

mapCheck = function() {
    var campaignPagesGeo = findObjs({ name: mapName, _type: "page"});
    if(campaignPagesGeo.length == 0){isError = true; errorType = mapName + " is missing."; return;};
    if(campaignPagesGeo.length > 1){isError = true; errorType = "More than one " + mapName + "."; return;};
    geomorphicMapId = campaignPagesGeo[0].get("_id");
    var geomorphicMapGraphics = findObjs({_pageid: geomorphicMapId, _type: "graphic"});
    if(geomorphicMapGraphics.length != 0){isError = true; errorType = mapName + " has images on it."; return;};
    var geomorphicMapGraphics = findObjs({_pageid: geomorphicMapId, _type: "path"});
    if(geomorphicMapGraphics.length != 0){isError = true; errorType = mapName + " has paths on it."; return;};
    geomorphicMapWidth = campaignPagesGeo[0].get("width");
    geomorphicMapHeight = campaignPagesGeo[0].get("height");
    if(geomorphicMapWidth % 12 !== 0){isError = true; errorType = "Map width must be disible by 12."; return;};
    if(geomorphicMapHeight % 12 !== 0){isError = true; errorType = "Map height must be disible by 12."; return;};
    if(geomorphicMapWidth < 36 || geomorphicMapHeight < 36){isError = true; errorType = "Map height must be 36 or larger."; return;};
};

checkTileTable = function() {
    var geomorphicTilesTable = findObjs({ name: "GeomorphicTiles", _type: "rollabletable"});
    if(geomorphicTilesTable.length == 0){isError = true; errorType = "GeomorphicTiles rollable table is missing."; return;};
    if(geomorphicTilesTable.length > 1){isError = true; errorType = "More than one GeomorphicTiles rollable table."; return;};
    geomorphicTilesTableId = geomorphicTilesTable[0].get("_id");
    geomorphicTilesTableItems = findObjs({_rollabletableid: geomorphicTilesTableId, _type: "tableitem"});
    if(geomorphicTilesTableItems.length != geomorphicTilesInformation.length){isError = true; errorType = "Count of items in the rollable table is off."; return;};
};

buildTileArray = function() {
    geomorphicTilesArray = new Array();
    var count = 0
    _.each(geomorphicTilesTableItems, function(geomorphicTilesTableItemsEach) {    
        obj = _.find(geomorphicTilesInformation, function(obj) {return obj.tileName == geomorphicTilesTableItemsEach.get("name");});
        if(typeof(obj.rotation) != "undefined"){
            if(parseInt(geomorphicTilesTableItemsEach.get("weight")) > 0){
                var setRarity = parseInt(geomorphicTilesTableItemsEach.get("weight"));
                if (setRarity < 0){setRarity = 0;};
                if (setRarity > 100){setRarity = 100;};
                geomorphicTilesArray.push({
                    tileName: geomorphicTilesTableItemsEach.get("name"),
                    tileURL: geomorphicTilesTableItemsEach.get("avatar").replace("med.jpg?","thumb.jpg?"),
                    edge: obj.edge,
                    corner: obj.corner, 
                    entrance: obj.entrance, 
                    type: obj.type, 
                    rotation: obj.rotation,
                    rarity: parseInt(geomorphicTilesTableItemsEach.get("weight")), 
                    blocked: obj.blocked, 
                    side: count
                });
            count++
            };
        };
    });
};

gridOutMap = function() {
    cols = (geomorphicMapHeight / 12);
    rows = (geomorphicMapWidth / 12);
    numberTileCols = cols - 1;
    numberTileRows = rows - 1;
    mapTileTracker = [];
    for(var i=0; i < rows; i++){mapTileTracker.push([]); mapTileTracker[i].push( new Array(cols));
        for(var j=0; j < cols; j++){
            mapTileTracker[i][j] = {tileName: geomorphicTilesArray[0].tileName, tileType: geomorphicTilesArray[0].type, tileRotation: geomorphicTilesArray[0].rotation};};
    };
};

createSides = function() {
    _.each(geomorphicTilesArray, function(geomorphicTilesArrayEach) {
    sideString = sideString + geomorphicTilesArrayEach.tileURL+"|"
    });
    sideString = sideString.slice(0,-1);
};

placeCorners = function() {
    cornerTiles = _.where(geomorphicTilesArray, {corner: true});
    tileSelector(cornerTiles, "corner");
    mapTileTracker[0][0] = {tileName: tilePickedName, tileType: tilePickedType, tileRotation: tilePickedRotation};
    tileSelector(cornerTiles, "corner");
    mapTileTracker[0][numberTileCols] = {tileName: tilePickedName, tileType: tilePickedType, tileRotation: tilePickedRotation};
    tileSelector(cornerTiles, "corner");
    mapTileTracker[numberTileRows][0] = {tileName: tilePickedName, tileType: tilePickedType, tileRotation: tilePickedRotation};
    mapTileTracker[numberTileRows][numberTileCols] = {tileName: tilePickedName, tileType: tilePickedType, tileRotation: tilePickedRotation};
};

placeEdge = function() {
    edgeTiles = _.where(geomorphicTilesArray, {edge: true});
    tileSelector(edgeTiles, "edgeTop");
    tileSelector(edgeTiles, "edgeBottom");
    tileSelector(edgeTiles, "edgeLeft");
    tileSelector(edgeTiles, "edgeRight");
};

fillFrame = function() {
    fillTiles = _.where(geomorphicTilesArray, {edge: false, corner: false});
    tileSelector(fillTiles, "fillTiles");
};

setSpin = function() {
    mapTileTracker[0][numberTileCols].tileRotation = mapTileTracker[0][numberTileCols].tileRotation - 90;
    mapTileTracker[numberTileRows][0].tileRotation = mapTileTracker[numberTileRows][0].tileRotation + 90;
    mapTileTracker[numberTileRows][numberTileCols].tileRotation  = mapTileTracker[numberTileRows][numberTileCols].tileRotation - 180;
    for (var j=1;j<numberTileCols;j++){
        mapTileTracker[0][j].tileRotation = mapTileTracker[0][j].tileRotation - 90;
    };
    for (var j=1;j<numberTileCols;j++){
        mapTileTracker[numberTileRows][j].tileRotation = mapTileTracker[numberTileRows][j].tileRotation + 90;
    };
    for (var i=1;i<numberTileRows;i++){
        mapTileTracker[i][j].tileRotation = mapTileTracker[i][j].tileRotation + 180;
    };
    for (var i=1;i<numberTileRows;i++){ 
        for (var j=1;j<numberTileCols;j++){
            var spinner = Math.floor(Math.random() * 4) * 90;
            mapTileTracker[i][j].tileRotation = mapTileTracker[i][j].tileRotation + spinner; 
        };
    };
};

stepThroughMap = function() {
    for (var i=0;i<numberTileRows + 1;i++){ 
        for (var j=0;j<numberTileCols + 1;j++){
            placeTile(mapTileTracker[i][j].tileName,i,j,mapTileTracker[i][j].tileRotation); 
        };
    };
};

placeTile = function(name,l,t,spin) {
    obj = _.find(geomorphicTilesArray, function(obj) {return obj.tileName == name;});
    var left = (l * 840) + 420;
    var top = (t * 840) + 420;
    var url = obj.tileURL
    var r = spin;
    createObj("graphic", {_type: "graphic", _subtype: "token", _pageid: geomorphicMapId, layer: "map", width: 840, height: 840,
            left: left, top: top, imgsrc: url, rotation: r, sides: sideString, currentSide: obj.side}); 
};

tileSelector = function(tiles, whereAt) {
    if(whereAt == "corner"){
        var tries = 0; 
        tilePicked = "Empty";
        while ((tilePicked == "Empty") && (tries < 20)){
            tries++
            var randomPick = Math.floor(Math.random() * tiles.length);
            var rarityValue = tiles[randomPick].rarity;
            var rartityChance = Math.floor(Math.random() * 100) + 1;
            if(rartityChance <= rarityValue){
                tilePickedName = tiles[randomPick].tileName;
                tilePickedType = tiles[randomPick].type;
                tilePickedRotation = tiles[randomPick].rotation;
            };
        };
        if(tilePicked == "Empty"){
            tilePickedName = tiles[randomPick].tileName;
            tilePickedType = tiles[randomPick].type;
            tilePickedRotation = tiles[randomPick].rotation;  
        };
    };
    if(whereAt == "edgeTop" || whereAt == "edgeBottom"){
        if(whereAt == "edgeTop"){var row = 0;}else{var row = numberTileRows};
        var LeftType = mapTileTracker[row][0].tileType;
        var RightType = mapTileTracker[row][numberTileCols].tileType;
        var numberOfEdgeTiles = (geomorphicMapWidth / 12) - 2;
        for (var stepRight=1;stepRight<numberTileCols;stepRight++){
            var tries = 0;
            tilePicked = "Empty";
            typePicked = "x";
            while ((tilePicked == "Empty") && (tries < 20)){
                tries++
                var randomPick = Math.floor(Math.random() * tiles.length);
                var rarityValue = tiles[randomPick].rarity;
                if(mapTileTracker[row][stepRight - 1].tileType == "c" && tiles[randomPick].type != "c"){rarityValue = 10;};
                if(mapTileTracker[row][stepRight + 1].tileType == "c" && tiles[randomPick].type != "c"){rarityValue = 10;};
                if(mapTileTracker[row][stepRight - 1].tileType == "c" && tiles[randomPick].type == "c"){rarityValue = 90;};
                if(mapTileTracker[row][stepRight + 1].tileType == "c" && tiles[randomPick].type == "c"){rarityValue = 90;};
                var rartityChance = Math.floor(Math.random() * 100) + 1;
                if(rartityChance <= rarityValue){
                    tilePickedName = tiles[randomPick].tileName;
                    tilePickedType = tiles[randomPick].type;
                    tilePickedRotation = tiles[randomPick].rotation;
                };
            };
            if(tilePicked == "Empty"){
                tilePickedName = tiles[randomPick].tileName;
                tilePickedType = tiles[randomPick].type;
                tilePickedRotation = tiles[randomPick].rotation;
            };
            mapTileTracker[row][stepRight] = {tileName: tilePickedName, tileType: tilePickedType, tileRotation: tilePickedRotation};
        };
    };
    if(whereAt == "edgeLeft" || whereAt == "edgeRight"){
        if(whereAt == "edgeLeft"){var col = 0;}else{var col = numberTileCols};
        var TopType = mapTileTracker[0][col].tileType;
        var BottomType = mapTileTracker[numberTileRows][col].tileType;
        var numberOfEdgeTiles = (geomorphicMapHeight / 12) - 2;
        for (var stepDown=1;stepDown<numberTileRows;stepDown++){
            var tries = 0;
            tilePicked = "Empty";
            while ((tilePicked == "Empty") && (tries < 20)){
                tries++
                var randomPick = Math.floor(Math.random() * tiles.length);
                var rarityValue = tiles[randomPick].rarity;
                if(mapTileTracker[stepDown - 1][col].tileType == "c" && tiles[randomPick].type != "c"){rarityValue = 10;};
                if(mapTileTracker[stepDown + 1][col].tileType == "c" && tiles[randomPick].type != "c"){rarityValue = 10;};
                if(mapTileTracker[stepDown - 1][col].tileType == "c" && tiles[randomPick].type == "c"){rarityValue = 90;};
                if(mapTileTracker[stepDown + 1][col].tileType == "c" && tiles[randomPick].type == "c"){rarityValue = 90;};
                var rartityChance = Math.floor(Math.random() * 100) + 1;
                if(rartityChance <= rarityValue){
                    tilePickedName = tiles[randomPick].tileName;
                    tilePickedType = tiles[randomPick].type;
                    tilePickedRotation = tiles[randomPick].rotation;
                };
            };
            if(tilePicked == "Empty"){
                    tilePickedName = tiles[randomPick].tileName;
                    tilePickedType = tiles[randomPick].type;
                    tilePickedRotation = tiles[randomPick].rotation;
            };
            mapTileTracker[stepDown][col] = {tileName: tilePickedName, tileType: tilePickedType, tileRotation: tilePickedRotation};
        };
    };
    if(whereAt == "fillTiles"){
        for (var i=1;i<numberTileRows;i++){ 
            for (var j=1;j<numberTileCols;j++){
                var row = i;
                var col = j;
                var tries = 0;
                tilePicked = "Empty";
                while ((tilePicked == "Empty") && (tries < 20)){
                    tries++
                    var randomPick = Math.floor(Math.random() * tiles.length);
                    var rarityValue = tiles[randomPick].rarity;
                    if(mapTileTracker[row - 1][col].tileType == "c" && tiles[randomPick].type != "c"){rarityValue = 10;};
                    if(mapTileTracker[row + 1][col].tileType == "c" && tiles[randomPick].type != "c"){rarityValue = 10;};
                    if(mapTileTracker[row][col - 1].tileType == "c" && tiles[randomPick].type != "c"){rarityValue = 10;};
                    if(mapTileTracker[row][col + 1].tileType == "c" && tiles[randomPick].type != "c"){rarityValue = 10;};
                    if(mapTileTracker[row - 1][col].tileType == "c" && tiles[randomPick].type == "c"){rarityValue = 90;};
                    if(mapTileTracker[row + 1][col].tileType == "c" && tiles[randomPick].type == "c"){rarityValue = 90;};
                    if(mapTileTracker[row][col - 1].tileType == "c" && tiles[randomPick].type == "c"){rarityValue = 90;};
                    if(mapTileTracker[row][col + 1].tileType == "c" && tiles[randomPick].type == "c"){rarityValue = 90;};
                    if(mapTileTracker[row - 1][col].tileType == "s" && tiles[randomPick].type != "s"){rarityValue = 10;};
                    if(mapTileTracker[row + 1][col].tileType == "s" && tiles[randomPick].type != "s"){rarityValue = 10;};
                    if(mapTileTracker[row][col - 1].tileType == "s" && tiles[randomPick].type != "s"){rarityValue = 10;};
                    if(mapTileTracker[row][col + 1].tileType == "s" && tiles[randomPick].type != "s"){rarityValue = 10;};
                    if(mapTileTracker[row - 1][col].tileType == "s" && tiles[randomPick].type == "s"){rarityValue = 90;};
                    if(mapTileTracker[row + 1][col].tileType == "s" && tiles[randomPick].type == "s"){rarityValue = 90;};
                    if(mapTileTracker[row][col - 1].tileType == "s" && tiles[randomPick].type == "s"){rarityValue = 90;};
                    if(mapTileTracker[row][col + 1].tileType == "s" && tiles[randomPick].type == "s"){rarityValue = 90;};
                    if(mapTileTracker[row - 1][col].tileType == "r" && tiles[randomPick].type != "r"){rarityValue = 10;};
                    if(mapTileTracker[row + 1][col].tileType == "r" && tiles[randomPick].type != "r"){rarityValue = 10;};
                    if(mapTileTracker[row][col - 1].tileType == "r" && tiles[randomPick].type != "r"){rarityValue = 10;};
                    if(mapTileTracker[row][col + 1].tileType == "r" && tiles[randomPick].type != "r"){rarityValue = 10;};
                    if(mapTileTracker[row - 1][col].tileType == "r" && tiles[randomPick].type == "r"){rarityValue = 90;};
                    if(mapTileTracker[row + 1][col].tileType == "r" && tiles[randomPick].type == "r"){rarityValue = 90;};
                    if(mapTileTracker[row][col - 1].tileType == "r" && tiles[randomPick].type == "r"){rarityValue = 90;};
                    if(mapTileTracker[row][col + 1].tileType == "r" && tiles[randomPick].type == "r"){rarityValue = 90;};
                    if(mapTileTracker[row - 1][col].tileType == "c" && tiles[randomPick].type != "r"){rarityValue = 10;};
                    if(mapTileTracker[row + 1][col].tileType == "c" && tiles[randomPick].type != "r"){rarityValue = 10;};
                    if(mapTileTracker[row][col - 1].tileType == "c" && tiles[randomPick].type != "r"){rarityValue = 10;};
                    if(mapTileTracker[row][col + 1].tileType == "c" && tiles[randomPick].type != "r"){rarityValue = 10;};
                    if(mapTileTracker[row - 1][col].tileType == "c" && tiles[randomPick].type == "r"){rarityValue = 90;};
                    if(mapTileTracker[row + 1][col].tileType == "c" && tiles[randomPick].type == "r"){rarityValue = 90;};
                    if(mapTileTracker[row][col - 1].tileType == "c" && tiles[randomPick].type == "r"){rarityValue = 90;};
                    if(mapTileTracker[row][col + 1].tileType == "c" && tiles[randomPick].type == "r"){rarityValue = 90;};
                    var rartityChance = Math.floor(Math.random() * 100) + 1;
                    if(rartityChance <= rarityValue){
                        tilePickedName = tiles[randomPick].tileName;
                        tilePickedType = tiles[randomPick].type;
                        tilePickedRotation = tiles[randomPick].rotation;
                    };
                };
                if(tilePicked == "Empty"){
                    tilePickedName = tiles[randomPick].tileName;
                    tilePickedType = tiles[randomPick].type;
                    tilePickedRotation = tiles[randomPick].rotation;
                };
                mapTileTracker[row][col] = {tileName: tilePickedName, tileType: tilePickedType, tileRotation: tilePickedRotation};
            };
        };
    };
};

readMap = function() {
    var campaignPagesGeo = findObjs({ name: mapName, _type: "page"});
    geomorphicMapId = campaignPagesGeo[0].get("_id");
    var currentPageGraphics = findObjs({                              
        _pageid: geomorphicMapId, layer: "map"                          
    });
    lightArray = new Array();
    _.each(currentPageGraphics, function(obj) {
        tileData = _.where(geomorphicTilesArray, {side: obj.get("currentSide")});
        lightArray.push({
            tileName: tileData[0].tileName,
            left: obj.get("left"), 
            top: obj.get("top"),
            rotation: obj.get("rotation")
        });
    });
    pathArray = new Array();
    _.each(lightArray, function(lightArrayEach) {
        _.each(dynamicLightingArray, function(dynamicLightingArrayEach) {
            if(lightArrayEach.tileName == dynamicLightingArrayEach.tileName){
                pathArray.push({
                    left: lightArrayEach.left,
                    top: lightArrayEach.top,
                    rotation: lightArrayEach.rotation,
                    path: dynamicLightingArrayEach.path,
                });    
            };
        });
    });
};


/* -------------------
Below was most helpfully provided by Alex L.
https://app.roll20.net/users/71687/alex-l
------------------- */
function rot(angle, point) {
    var pointX = point[0], pointY = point[1], originX = 70*6, originY = 70*6; // total tile size is 12^2 squares = (12^2)*70 pixels, origin is the point that we rotate around.
    angle = angle * Math.PI / 180.0;
    
    return [
        Math.cos(angle) * (pointX-originX) - Math.sin(angle) * (pointY-originY) + originX,
        Math.sin(angle) * (pointX-originX) + Math.cos(angle) * (pointY-originY) + originY
    ];
}

function createPath(inputPath, angle, Xoffset, Yoffset) {
        var PathArray = []; // use a god dam copy you n00b :P
        if(!angle) angle = 0;
        if(!Xoffset) Xoffset = 0;
        if(!Yoffset) Yoffset = 0;
        //use these to work our how big the path is.
        var maxX = 0;
        var minX = false;
        var maxY = 0;
        var minY = false;

        //find the min and max X and Y. Rotate the cords in the array.
        for(var i = 0; i < inputPath.length; i++) {
            PathArray.push([inputPath[i][0], inputPath[i][1]]);
            PathArray[i] = rot(angle, PathArray[i]);
            if(PathArray[i][0] > maxX) maxX = PathArray[i][0];
            if(minX === false || Number(PathArray[i][0]) < Number(minX)) minX = PathArray[i][0];
            
            if(PathArray[i][1] > maxY) maxY = PathArray[i][1];
            if(minY === false || PathArray[i][1] < minY) minY = PathArray[i][1];
        }
        
        //work out the size and position the object within the 12^2 area.
        var objectWidth = maxX - minX;
        var objectHeight = maxY - minY;
        var objectTop = minY + (objectHeight/2); 
        var objectLeft = minX + (objectWidth/2);

        //fix array to remove positioning.
        for(var i = 0; i < PathArray.length; i++) {
            PathArray[i][0] = PathArray[i][0] - objectLeft + (objectWidth/2);
            PathArray[i][1] = PathArray[i][1] - objectTop + (objectHeight/2);
        }
        
        //Convert the array to a string.
        var pathString = "";
        for(var i = 0; i < PathArray.length; i++) {
            if(i != 0) {
                pathString += ",[\"L\"," + PathArray[i][0] + "," + PathArray[i][1] + "]";
            } else {
                pathString = "[\[\"M\"," + PathArray[i][0] + "," + PathArray[i][1] + "]";   
            }
        }
        pathString += "\]";
        objectTop = objectTop + Yoffset; //offset should be the relative position from the top left in multiples of 840.
        objectLeft = objectLeft + Xoffset;
        
        createObj("path",{
            layer: "walls",
            _path: pathString,
            width: objectWidth,    
            height: objectHeight,    
            top: objectTop, 
            left: objectLeft,
            rotation: 0,
            stroke: lineColor,
            pageid: geomorphicMapId,
            stroke_width: lineSize
        }); 
    }