# Science Fiction Recipes

Starships, stations and laser fire. See [the recipes guide](README.md) for what each command does.

## Broadside Between Two Ships

Two ships on opposite sides of the map, firing at each other all the time. Make one effect for each ship.

Put a token on the left-hand ship's guns and select it.

```
!pagefx create Left ship
!pagefx fx beam-fire
!pagefx area 0
!pagefx direction 30 0
!pagefx interval 1500 4000
```

Then put a token on the right-hand ship's guns, select it, and type the same with the direction the other way and another colour:

```
!pagefx create Right ship
!pagefx fx beam-frost
!pagefx area 0
!pagefx direction -30 0
!pagefx interval 1500 4000
```

- Count the cells between the two ships and use that in place of 30.
- For ships in opposite corners, go across and down: `30 20` from the top-left, `-30 -20` from the bottom-right.
- To fire from the whole length of each ship, use a bigger area, such as `!pagefx area 15 square`.

## Missiles That Fly

Missiles you can watch cross the map, rather than a beam drawn all at once.

Put a token on the launcher and select it.

```
!pagefx create Missiles
!pagefx fx {"maxParticles":10,"emissionRate":10,"duration":10,"size":36,"sizeRandom":8,"lifeSpan":90,"lifeSpanRandom":0,"speed":12,"speedRandom":1,"angle":0,"angleRandom":1,"startColour":[255,240,200,1],"startColourRandom":[0,0,0,0],"endColour":[255,90,20,0.5],"endColourRandom":[0,0,0,0]}
!pagefx area 0
!pagefx interval 2000 5000
```

- They fly right (`"angle":0`) for about 15 cells (`speed` 12 × `lifeSpan` 90 = 1,080 pixels; a cell is 70). They take about three and a half seconds, start white-hot and burn orange, with a short trail behind. Raise or lower `lifeSpan` to stop them at the other ship.
- For the other ship, make a second effect with `"angle":180` so its missiles fly left.
- For a corner-to-corner shot, `"angle":34` flies 3 cells across for every 2 down, and `"angle":214` comes back the other way.
- Add a hit at the far end with a second effect on the target ship: `!pagefx fx explode-fire`, `!pagefx area 10` and `!pagefx interval 2000 5000`.

## Laser Turret

A turret that fires on its own turn in combat.

Put a token at the turret's barrel and select it.

```
!pagefx create Turret
!pagefx fx beam-magic
!pagefx area 0
!pagefx direction 0 8
!pagefx off
```

Add the turret's own token to the turn order, select it, and type `!pagefx trigger add turn burst count=3 --ids <effect token ID>`. Or use the **On a turn** button on the effect's card with the turret's token selected.

## Point Defence

Flak bursts around a ship when anything comes close.

Put a token in the middle of the ship and select it.

```
!pagefx create Point defence
!pagefx fx explode-smoke
!pagefx area 20
!pagefx off
!pagefx trigger add enter burst count=6 who=all
```

- The bursts land at random points in the area, and go off whenever a token moves into it.

## Damaged Console

A console that sparks and smokes after a hit.

Put a token on the console and select it.

```
!pagefx preset sparks
!pagefx layer add burn-smoke
!pagefx interval 2000 6000 --layer 2
!pagefx area 0
```

## Steam Leak

A burst pipe venting along a corridor.

Put a token on the pipe and select it.

```
!pagefx preset steam
!pagefx area 5
```

- For a jet that blows one way, use `!pagefx fx breath-smoke` and `!pagefx direction 3 0` instead.
