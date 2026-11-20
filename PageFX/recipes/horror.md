# Horror Recipes

Haunted houses, crypts and things in the dark. See [the recipes guide](README.md) for what each command does.

## Haunted Room

Cold mist that rises when the players walk in, and fades when they leave.

Put a token in the middle of the room, select it, and set the area to cover the room.

```
!pagefx create Haunted room
!pagefx preset necrotic-mist
!pagefx area 20 square
!pagefx off
!pagefx trigger add enter start
!pagefx trigger add leave stop
```

## Blood Spatter

Blood flicking across the walls of a slaughterhouse or a monster's lair.

Put a token in the room and select it.

```
!pagefx create Blood
!pagefx fx splatter-blood
!pagefx area 15
!pagefx direction random
!pagefx interval 3000 9000
```

## Spirit Lash

A ghost lashes out at the first player to reach the altar.

1. Put a token at the ghost and select it.

   ```
   !pagefx create Spirit lash
   !pagefx fx beam-death
   !pagefx area 0
   !pagefx direction 5 0
   !pagefx off
   ```

2. Put a token on the altar (GM layer) and give it an Aura 1 that covers the spot, such as 5 ft.
3. Select the ghost token, type `!pagefx edit`, then select the altar token and click **Token enters**. Choose **Fire a burst**, **a player token**, **the selected token's aura**, and **Yes** for only the first time.

- Point the direction at the altar: count the cells across and down from the ghost.

## Lightning Flicker

A storm outside the windows, with a flash now and then.

Put a token outside the house, select it, and set the area to cover the windows.

```
!pagefx preset thunderstorm
!pagefx area 30 square
```

- Add a no-effect area over the house so the rain stays outside: select a token covering the house and click **No-effect area** in the menu.

## Graveyard Mist

Low mist drifting between the graves, with will-o'-the-wisps.

Put a token in the graveyard and select it.

```
!pagefx preset fog
!pagefx layer add glow-death
!pagefx interval 4000 10000 --layer 2
!pagefx area 25
```

- More ready-made eerie effects: `!pagefx preset swamp-gas`, `drips`, `fireflies`.
