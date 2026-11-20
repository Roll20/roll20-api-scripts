# Modern Recipes

Firefights, explosions and city streets. See [the recipes guide](README.md) for what each command does.

## Tracer Fire

A machine gun nest raking a street with tracer rounds.

Put a token at the gun and select it.

```
!pagefx create Tracers
!pagefx fx beam-fire
!pagefx area 0
!pagefx direction 25 0
!pagefx interval 300 900
```

- Turn it on and off with `!pagefx toggle`, or with a trigger: `!pagefx trigger add round toggle`.
- For tracers that sweep, add a second layer aimed a little wider: `!pagefx layer add beam-fire`, then `!pagefx direction 25 3 --layer 2`.

## Sniper Shot

A sniper on a rooftop who fires on their turn.

Put a token at the sniper's window and select it.

```
!pagefx create Sniper
!pagefx fx beam-smoke
!pagefx area 0
!pagefx direction 12 8
!pagefx off
```

Add the sniper's token to the turn order, select it, and type `!pagefx trigger add turn fire --ids <effect token ID>`.

## Mortar Round

A mortar shell landing somewhere in the square every few rounds.

Put a token in the middle of the square, select it, and set the area to cover it.

```
!pagefx create Mortar
!pagefx fx explode-fire
!pagefx layer add bomb-smoke
!pagefx area 30
!pagefx off
!pagefx trigger add round fire every=3
```

- Each layer lands at its own random point. For the smoke to rise where the shell lands, give the effect just one layer.

## Smoke Grenade

Thick smoke filling a room or an alley.

Put a token where the grenade lands and select it.

```
!pagefx preset fog
!pagefx layer add burn-smoke
!pagefx interval 500 1500 --layer 2
!pagefx area 10
```

- Turn it off with `!pagefx off` when the smoke clears.

## Sprinklers

Fire sprinklers going off in an office.

Put a token in the middle of the office, select it, and set the area to cover it.

```
!pagefx preset spray
!pagefx area 20 square
```

## Live Wires

A downed power line sparking in the street.

Put a token on the wire and select it.

```
!pagefx preset sparks
!pagefx layer add glow-frost
!pagefx interval 1500 4000 --layer 2
!pagefx area 0
```
