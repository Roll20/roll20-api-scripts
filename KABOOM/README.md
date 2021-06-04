# KABOOM.js

Ever wonder why the tokens inside of your flimsy straw houses never budge when
your players decide that fireball is the easiest solution to their troubles? It
might have to do with the copious amounts of Sovereign Glue you keep around, but
for everything else there is KABOOM!

## What can you use KABOOM for?
* Creating explosions that force tokens to move away
* Creating whirlpools that drag things towards their centers
* Creating explosions that suck things towards themselves?
* Creating whirlpools that spit things out?
* **Any area of effect that requires tokens to move a towards or away from a point**

## How do I use it?
You can call KABOOM through chat with a simple message, or you can use it with
other scripts by calling KABOOM.NOW(@param1, @param2)

### Using KABOOM - Chat Commands:
The basic chat command follows this format:
`!KABOOM effect-power [ effect-radius [ options [ --default-options]]]`
`!KABOOM -15 50 no scatter --blood`

When you use KABOOM as a chat command, you need to have a token selected.
ONLY effect-power is required. Everything else is optional.

**effect-power** is the strength of the force moving tokens away or towards from
                the explosion point. It is measured in the same units listed on
                the page. Effect-power can be negative if you want to pull things
                towards the object instead of pushing away.

**effect-radius** is the maximum distance that the script search for objects to
                manipulate. If something is beyond this point, it will not move.
                Defaults to **effect-power * explosion_ratio**. This is always
                parsed as positive.

**options** are either 'vfx', 'no vfx', 'no-vfx', 'invisible', 'invis' to change
            whether an explosion effect appears, or 'scatter' and 'no scatter'
            if you want to scatter tokens away from the explosion/implosion point
            more randomly.

**--default-options** can be found in the help menu, which is reached by typing
                    `!KABOOM` or `!KABOOM --help` into chat.

### Using KABOOM - API calls:
The simplest function call looks something like this:
`KABOOM.NOW(15, [500,300])`

Something more complicated may look like this:
```
on('change:token', function(obj) {
    if (obj.id === bigBaddie.id) {
        KABOOM.NOW({effectPower: 5, effectRadius: 15, type: 'death'}, obj)
    }
}
```

## API calls to KABOOM.NOW()

@param1 accepts two formats:

1. __An object that contains the ranges and type information about the explosion__
2. __A number that will be used as the effect power__

```
@param1 = {
    effectPower: <any number>               // Required at all times
    effectRadius: <any positive number>     // Must be absolutely higher than effectPower
    type: <any Roll20 VFX type>
    vfx: <true or false>
    scatter: <true or false>
}
```

@param2 accepts three formats:

1. __A Roll20 graphic object received from getObj()__
2. __A coordinate array which will be used to determine the position of the explosion__
3. __An object that contains a position property with an array as its value__

```
@param2 = {
    position: [X_coordinate, Y_coordinate]  // Required at all times
    pageid: <a valid pageid>
    layer: <objects or map>
}
```


# KABOOM options
The following is a list of all stored settings that KABOOM uses. You can change these through chat commands
in the

### --vfx
This option determines if a Roll20 VFX effect will be created at the center of the effect.
It's mostly cool and you can choose to turn this off to make invisible explosions.

### --ignore-size
By default, the script values object sizes when determining if they should be moved.
If this is false, then weight will not be considered when calculating distances thrown.
Make sure that same-layer-only is true if this is false, or you may move your background tiles.

### --default-type
This option determines the colour of the VFX explosion if none is specified. The colours available are:
'acid', 'blood', 'charm', 'death', 'fire', 'frost', 'holy', 'magic', 'slime', 'smoke', and 'water'

### --same-layer-only
By default, this script does not affect objects on other layers. If this is false
then KABOOM will move graphics on all layers. Make sure that your background graphics
are larger than the max-size if this is false and that ignore-size is not true.

### --min-size
The value stored as min-size determines the size that objects must be if they
want to move the maximum distance (barring their distance from the explosion center).
It is measured in sq. units.

### --max-size
The value stored as max-size determines the maximum size that objects may be
before they are considered too heavy to move. It is measured in sq. units.

### --scattering
This option increases the randomness of movement done by the script. If this is
off, then KABOOM will always throw two objects in the same spot towards the same
location. If this is on, then it is randomized slightly.

### --default-layer
This determines the default layer that KABOOM will affect if you are using it
in another script. This option only affects calls of KABOOM.NOW() that do not
give the script a layer to use.

### --drawings-only
If this is on, then the script will only search for drawings to manipulate and
will ignore all other tokens.

### --walls
Turn walls on to force the script to obey walls on the dynamic lighting layer.
If it is off, then walls will be ignored when calculating distances thrown.


# Globalconfig options
These options can only be changed through the Script library panel at the API page.

### GM only
This setting changes whether you want to restrict the use of this command to GMs only or allow
access to players as well. KABOOM will still require that players select a token before using the
command, but this may be changed in the future to accept @{target1|token_id} macros.

### Explosion ratio
This ratio determines what the area of effect for KABOOM explosions will be if one is
not specified. By default, the script multiplies the effect power by this number to
use as the effect radius. It is suggested to keep close to 2, but we won't complain
if you go crazy.
