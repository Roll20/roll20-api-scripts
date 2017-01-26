#KABOOM.js

Ever wonder why the tokens inside of your flimsy straw houses never budge when your players decide that fireball is the easiest solution to their troubles? It might have to do with the copious amounts of Sovereign Glue you keep around, but for everything else there is KABOOM!

##What can you use KABOOM for?
* Creating explosions that force tokens to move away
* Creating whirlpools that drag things towards their centers
* Creating explosions that suck things towards themselves?
* Creating whirlpools that spit things out?
* **Any area of effect that requires tokens to move a towards or away from a point**

##How do I use it?
You can call KABOOM through chat with a simple message, or you can use it with other scripts by calling KABOOM.NOW()!

###Chat Command:
The basic chat command follows this format:
`!KABOOM effect-power [ effect-radius [ options [ --default-options]]]`


When you use KABOOM as a chat command, you need to have a token selected. ONLY minimum range is required.
Everything else is optional.

**effect-power** is the strength of the force moving tokens away or towards from the explosion point. It is measured
                in the same units listed on the page. Effect power can be negative if you want to pull things towards the
                object instead of pushing away.

**effect-radius** is the maximum distance that the script search for objects to manipulate. If something is
                beyond this point, it will not move. Defaults to **minimum range * explosion_ratio**. This
                is always parsed as positive.

**options** are either 'vfx', 'no vfx', 'no-vfx', 'invisible', 'invis' to change whether an explosion effect appears,
          or 'scatter' and 'no scatter' if you want to scatter tokens away from the explosion/implosion point more randomly.

**--default-options** can be found in the help menu, which is reached by typing `!KABOOM` or `!KABOOM --help` into chat.

###Through the API:
The simplest function call looks something like this:
```
KABOOM.NOW(15, [500,300])
```

Something more complicated may look like this:
```
on('change:token', function(obj) {
  if (obj.id === big_baddie.id) {
    KABOOM.NOW({effectPower: 5, effectRadius: 15, type: 'death'}, obj)
  }
}
```

##Using KABOOM.NOW()

KABOOM.NOW() takes two parameters, detailed below

The first parameter must be in one of two forms.

1. __An object that contains the ranges and type information about the explosion__
2. __A number that will be used as the effect power__

If you decide to go with the first option, the object must be formatted as such:
```
object = {
    effectPower: <any number>            // Required at all times
    effectRadius: <any positive number>  // Required to be positive if effectPower is negative
    type: <any Roll20 VFX type>
    vfx: <true or false>
    scatter: <true or false>
}
```

The second parameter must be in one of the following three forms.

1. __A Roll20 graphic object received from getObj()__
2. __A coordinate array which will be used to determine the position of the explosion__
3. __An object that contains a position property with an array as its value__

If you decide to use the third option, the object must be formatted as such:
```
object = {
    position: [X_coordinate, Y_coordinate]  // Required at all times
    pageid: <a valid pageid>
    layer: <objects or map>
}
```
