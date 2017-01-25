#KABOOM.js

Ever wonder why the tokens inside of your flimsy straw houses never budge when your players decide that fireball is the easiest solution to their troubles? It might have to do with the copious amounts of Sovereign Glue you keep around, but for everything else there is KABOOM!

##What can you use KABOOM for?
Creating explosions that force tokens to move away.
Creating whirlpools that drag things towards their centers
Creating explosions that suck things towards themselves?
Creating whirlpools that spit things out?
*Any area of effect that requires tokens to move a towards or away from a point*

##How do I use it?
You can call KABOOM through chat with a simple message, or you can use it with other scripts by calling KABOOM.NOW()!

###Chat Command:
The basic chat command follows this format:
`!KABOOM minimum-range [ maximum-range [ options [ --default-options]]]`


When you use KABOOM as a chat command, you need to have a token selected. ONLY minimum range is required.
Everything else is optional.

*<minimum-range>* is the minimum distance that everything should be shoved away by. This can be negative
                if you want to pull things towards the object instead of pushing away.

*<maximum-range>* is the maximum distance that the script search for objects to manipulate. If something is
                beyond this point, it will not move. Defaults to <minimum range> * explosion_ratio

*<options>* are either 'vfx', 'no-vfx', 'invisible', 'invis' to change whether an explosion effect appears,
          or 'scatter' if you want to scatter tokens away from the explosion/implosion point more randomly.

*<more-options>* can be found in the help menu, which is reached by typing "!KABOOM" or "!KABOOM --help" into chat.

###Through the API:
The simplest function call looks something like this:
```
KABOOM.NOW(15, [500,300])
```

Something more complicated may look like this:
```
on('change:token', function(obj) {
  if (obj.id === big_baddie.id) {
    KABOOM.NOW({minRange: 5, maxRange: 15, type: 'holy'}, obj)
  }
}
```

##Using KABOOM.NOW()

KABOOM.NOW() takes two parameters with fairly strict requirements.

The first parameter must be in one of two forms.

1. __An object that contains the ranges and type information about the explosion__
2. __A number that will be used as the minimum range__

If you decide to go with the first option, the object must be formatted as such:
```
object = {
    minRange: <any number>           // Required at all times
    maxRange: <any positive number>  // Required to be positive if minRange is negative
    type: <any Roll20 VFX type>
    vfx: <true or false>
    scatter: <true or false>
}
```

The second parameter must be in one of the following three forms.

1. __A Roll20 graphic object received from getObj()__
2. __An array of coordinates which will be used to determine the position of the explosion__
3. __An object that contains a position property with an array as its value__

If you decide to use the third option, the object must be formatted as such:
```
object = {
    position: [X_coordinate, Y_coordinate]  // Required at all times
    pageid: <a valid pageid>                // Defaults to the current player page
    layer: <objects or map>
}
```
