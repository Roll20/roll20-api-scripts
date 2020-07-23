# 5E Resting in Style

This script for the 5E OGL character sheet solves the error prone task of
updating your character sheet when resting. Using `!long-rest` and `!short-rest`
commands will update your sheet, and report to you everything it is doing.

## Short rest

Select your character, then run the `!short-rest` command. It will:

- check your hit points and hit dice, and remind you to use them if needed.

- replenish Warlock **Pact Magic** spell slots. This works correctly even if you
  are a multiclass spell caster.

- replenish class specific resources, like **Wild Shape**, **Second Wind** and **Channel Divinity**.

    :+1: It knows that Bards regain **Bardic Inspiration** at class level 5.

    :+1: It knows that Sorcerers gain 4 Sorcery Points at class level 20.

- replenish subclass specific resources, like **Superiority Dice** and **Hexblade's Curse**.

- remind Wizards to use **Arcane Recovery**, and Bards to use **Song of Rest**.

- turn off global modifiers with a short duration, like **Bless**, **Sacred Weapon** and **Shield of Faith**.

## Long rest

Select your character, then run the `!long-rest` command. It will:

- replenish your hit points.

- replenish the correct number of hit dice (even at lvl 1).

- remove temporary hit points.

- reduce exhaustion level.

- replenish spell slots.

- replenish class specific resources, like **Lay on Hands**, **Arcane Recovery** and **Rage**.

- replenish subclass specific resources, like **Consult the Spirits** and **Avenging Angel**.

- replenish race specific resources, like **Breath Weapon** and **Relentless Endurance**.

- turn off global modifiers with long durations, like **Mage Armor**.

## Usage

Resting in Style will generally do the right thing out of the box, as long as
you're using the 5th Edition OGL by Roll20 character sheet.

However, not all resources are automatically added to the Resource boxes. You
might have to add them yourself.

For instance, a Wizard starts with the **Arcane Recovery** skill. This is not
tracked in the sheet. Add a custom resource box, set the Total to 1, the value
to 1, and the name to "Arcane Recovery".

Resting in Style will detect the new resource by name, and start notifying you
to use it on short rests, and replenish it on long rests.

### I have a resource not covered by this script

No worries. If your skill is called "Homebrew Resource", you can rename it to
"Homebrew Resource [l]" to reset it every long rest. If you instead postfix it
with "[s]", then it is reset every short and long rest.

Also: Please let me know if I have missed any skills in the official source
books, I'll happily add the support.

### What about items with randomly regained charges?

Let's look at Wand of Magic Missiles. The wand regains 1d6+1 expended charges
daily at dawn. We can approximate that by tying it to a long rest like this:

```
Wand of Magic Missiles [l+1d6+1]
```

The first character in the brackets is a lower case L, meaning it will trigger
after a long rest. The `+1d6+1` is rolled and added to the resource (up to the
maximum).

You can replace the `l` with an `s` to trigger after a short rest. Thanks to
@keithcurtis1 who did this first in his [Rest and
Recovery](https://app.roll20.net/forum/post/8652406/script-rest-and-recovery)-script.

### Skills that let you use spells without spell slots

There are some skills that give characters access to spells that can be used
once a day without using spell slots:

- Drow Magic
- Firbolg Magic
- Mystic Arcanum (Warlock)
- Signature Spells (Wizard)
- Infernal Legacy (Tiefling)
- Githyanki Psionics (Gith)
- Control Air and Water (Triton)
- Innate Spellcasting (Yuan-ti Pureblood)
- Magic Initiate (Feat)

I'm not sure how these should be handled. You can easily fix it yourself by
adding the [l] postfix to a resource box, like this:

    Mystic Arcanum: Eyebite [l]

I would also like to support it out of the box somehow, but I'm not sure about
the best way to do it.

## Oddities

For technical reasons, if you want DeathTracker to notice changes in hitpoints
after resting, you must also install the TokenMod script.
