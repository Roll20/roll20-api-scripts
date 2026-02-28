# Autolinker

## Purpose

Autolinker converts bracketed shorthand written in the **Notes** or **GMNotes** fields of handouts and characters into clickable Roll20 journal or compendium links when the entry is saved. This extends the basic linking functions built into Roll20.

---

## General Usage

These formats may be used in the Notes or GMNotes fields of any handout or character.

> Note: The script runs after a save event. Because the handout may refresh before processing finishes, you may need to close and reopen the handout (or click **Edit** again) to see the updated links.

---

## Journal Links


[goblin|Jimmy]


Creates a link to the handout or character named `goblin`, displayed as **Jimmy**.

If no display text is provided, standard Roll20 journal linking rules apply.

---

## Compendium Links


[5e:fireball]


Links to the D&D 5e compendium entry for *fireball*.


[5e:wall of fire|the wall]


Links to the D&D 5e compendium entry for *wall of fire*, displayed as **the wall**.

### Supported Compendium Prefixes

- `5e:` — D&D 5th Edition  
- `pf2:` — Pathfinder 2nd Edition  

---

## Handout Header Linking

Header links apply to **handouts only** and use the `#` character.

### Link to a Header in Another Handout


[Dungeon of Doom#6. Zombie Chorus|See Room 6]


Links to the header `6. Zombie Chorus` in the handout **Dungeon of Doom**, displayed as **See Room 6**.

---

### Link to a Header in the Same Handout


[#6. Zombie Chorus|See Room 6]


Links to the header `6. Zombie Chorus` in the current handout, displayed as **See Room 6**.

---

### Omit Display Text


[#6. Zombie Chorus]


If no display text is supplied, the header text is used as the link text.