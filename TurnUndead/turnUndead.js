// Authors:aquaalex & the-aaron
// Key/Level not existing means not able to TURN.
// TARGET=0 means auto turn or dispel based on TEXT 
// with number of creatures affected based on NUMBERAFFECTED",
var TurningUndead = {
	"Skeleton": {
		1: {"Target":10, "NumberAffected":"2d6",     "Text":"Turned"},
		2: {"Target":7, "NumberAffected":"2d6",     "Text":"Turned"},
		3: {"Target":4, "NumberAffected":"2d6",     "Text":"Turned"},
		4: {"Target":0, "NumberAffected":"2d6",     "Text":"Turned"},
		5: {"Target":0, "NumberAffected":"2d6",     "Text":"Turned"},
		6: {"Target":0, "NumberAffected":"2d6",     "Text":"Dispeled"},
		7: {"Target":0, "NumberAffected":"2d6",     "Text":"Dispeled"},
		8: {"Target":0, "NumberAffected":"2d6+2d4", "Text":"Dispeled"},
		9: {"Target":0, "NumberAffected":"2d6+2d4", "Text":"Dispeled"},
		10: {"Target":0, "NumberAffected":"2d6+2d4", "Text":"Dispeled"},
		11: "Target":0, "NumberAffected":"2d6+2d4", "Text":"Dispeled"},
		12: {"Target":0, "NumberAffected":"2d6+2d4", "Text":"Dispeled"},
		13: {"Target":0, "NumberAffected":"2d6+2d4", "Text":"Dispeled"},
		14: {"Target":0, "NumberAffected":"2d6+2d4", "Text":"Dispeled"}
	},
	"Zombie": {
		1: {"Target":13, "NumberAffected":"2d6",     "Text":"Turned"},
		2: {"Target":10, "NumberAffected":"2d6",     "Text":"Turned"},
		3: {"Target":7, "NumberAffected":"2d6",     "Text":"Turned"},
		4: {"Target":4, "NumberAffected":"2d6",     "Text":"Turned"},
		5: {"Target":0, "NumberAffected":"2d6",     "Text":"Turned"},
		6: {"Target":0, "NumberAffected":"2d6",     "Text":"Turned"},
		7: {"Target":0, "NumberAffected":"2d6",     "Text":"Dispeled"},
		8: {"Target":0, "NumberAffected":"2d6",     "Text":"Dispeled"},
		9: {"Target":0, "NumberAffected":"2d6+2d4", "Text":"Dispeled"},
		10: {"Target":0, "NumberAffected":"2d6+2d4", "Text":"Dispeled"},
		11: {"Target":0, "NumberAffected":"2d6+2d4", "Text":"Dispeled"},
		12: {"Target":0, "NumberAffected":"2d6+2d4", "Text":"Dispeled"},
		13: {"Target":0, "NumberAffected":"2d6+2d4", "Text":"Dispeled"},
		14: {"Target":0, "NumberAffected":"2d6+2d4", "Text":"Dispeled"}
	},
 /* ... */
};

var TypeUndead = {
	1: {"Type":"Skeleton"},
	2: {"Type":"Ghoul"},
	3: {"Type":"Shadow"},
	4: {"Type":"Shadow"},
	5: {"Type":"Wight"},
	6: {"Type":"Wraith"},
	7: {"Type":"Mummy"},
	8: {"Type":"Spectre"},
	9: {"Type":"Vampire"},
	10: {"Type":"Ghost"},
	11: {"Type":"Lich"}
};

// Converts Hit Dice to named undead for lookup in function checkTurning
function setUndead(HD) {
	if isInt(HD) === false {
		return "INVALID";
	}
	if HD > 11 {
		HD = 11;
	}
	return TypeUndead[HD];
};

// Checks that number is an integer
function isInt(value) {
  var x;
  if (isNaN(value)) {
    return false;
  }
  x = parseFloat(value);
  return (x | 0) === x;
}
	
// returns Target number to turn, Number affected and text
function undeadTurning (undead,level){
  if( TurningUndead[undead] ) {
    if( TurningUndead[undead][level] ) {
      return TurningUndead[undead][level];
    }
  } else {
    log('Attempt to turn "'+undead+'" is invalid.  Use one of: '+_.keys(TurningUndead).join(', ')); 
  }

  return { Target: 9999, NumberAffected: "0d0", Text: "Impossible"};
};

var checkTurning = undeadTurning ("Skeleton", 5);