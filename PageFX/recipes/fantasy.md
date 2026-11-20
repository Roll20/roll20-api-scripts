# Fantasy Recipes

Castles, dungeons and dragons. See [the recipes guide](README.md) for what each command does.

## Ballista Bolt

A bolt from a ballista every few seconds, straight across the map.

Put a small token at the ballista and select it.

```
!pagefx create Ballista
!pagefx fx beam-smoke
!pagefx area 0
!pagefx direction 20 0
!pagefx interval 4000 8000
```

- `20 0` shoots 20 cells to the right. Use `-20 0` for a ballista on the right-hand wall.
- For a ballista that only fires on its turn, add `!pagefx off`, then select the ballista's own token (the one in the turn order) and type `!pagefx trigger add turn fire --ids <effect token ID>`.

## Arrow Volley

Archers on a wall loosing arrows across the field, every round.

Put a token in the middle of the wall and select it.

```
!pagefx create Archers
!pagefx fx beam-smoke
!pagefx area 20 square
!pagefx direction 0 12
!pagefx off
!pagefx trigger add round burst count=8
```

- The square area spreads the arrows along the wall; each one flies 12 cells down the map.
- Make the area as wide as the wall, in your page's units.

## Fire Bolt That Flies

A ball of fire you can watch cross the room, from a turret, statue or trapped door.

Put a token where it starts and select it.

```
!pagefx create Fire bolt
!pagefx fx {"maxParticles":10,"emissionRate":10,"duration":10,"size":40,"sizeRandom":8,"lifeSpan":60,"lifeSpanRandom":0,"speed":10,"speedRandom":0.8,"angle":0,"angleRandom":1,"startColour":[255,180,50,1],"startColourRandom":[0,40,0,0],"endColour":[220,50,0,0.4],"endColourRandom":[0,0,0,0]}
!pagefx area 0
!pagefx interval 3000 6000
```

- It flies right (`"angle":0`) for about 8 cells (`speed` 10 × `lifeSpan` 60 = 600 pixels). Change `angle` to 180 to fly left, 90 down or 270 up. It takes about two seconds to get there.
- For frost, try `"startColour":[150,210,255,1]` and `"endColour":[60,120,255,0.4]`.

## Dragon Breath

A dragon breathing fire every other round.

Put a token at the dragon's mouth and select it.

```
!pagefx create Dragon breath
!pagefx fx breath-fire
!pagefx area 0
!pagefx direction 6 3
!pagefx off
!pagefx trigger add round burst every=2 count=3
```

- `6 3` breathes 6 cells right and 3 down. Turn the dragon by changing the direction.
- Try `breath-frost`, `breath-acid` or `breath-death` for other dragons.

## Dart Trap

Darts shoot across a corridor the first time someone steps on the pressure plate.

1. Put a token in the wall where the darts come from, select it, and type:

   ```
   !pagefx create Dart trap
   !pagefx fx beam-smoke
   !pagefx area 0
   !pagefx direction 0 4
   !pagefx off
   ```

2. Put a token on the pressure plate (GM layer). With no Aura 1, its area is the token itself.
3. Select the dart token, type `!pagefx edit`, then select the pressure plate and click **Token enters** on the card. Choose **Fire a burst**, **a player token**, **the selected token's aura**, and **Yes** for only the first time.

## Warding Glyph

A glyph that flares when anyone crosses it.

Put a token on the glyph and select it.

```
!pagefx create Glyph
!pagefx fx nova-magic
!pagefx area 0
!pagefx off
!pagefx trigger add enter burst count=3 who=all
```

- Use `nova-holy` for a temple ward, or `explode-fire` for a glyph that hurts.

## Haunted Forge

A forge that smoulders all the time and spits sparks now and then.

Put a token on the forge and select it.

```
!pagefx preset embers
!pagefx layer add burn-fire
!pagefx interval 2000 5000 --layer 2
!pagefx area 5
```

- More ready-made fantasy effects: `!pagefx preset magma`, `lava-spurts`, `arcane-motes`, `holy-glimmer`, `fireflies`.
