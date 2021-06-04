# It's A Trap! - Roleplaying is Magic 4E theme

This is a My Little Pony: Roleplaying is Magic 4th edition theme for the It's A Trap! script,
built for use with the Roleplaying is Magic 4E character sheet.

## Theme-specific properties
The following trap properties are specific to this trap theme script.

### Damage
A dice roll expression for the trap's damage.

### Miss - Half Damage
This property specifies whether the trap still deals half damage, even on a miss.

### Skill Check
This property specifies the skill roll needed to avoid the trap.

The first prompt asks for the name of the skill.

The second prompt asks for the primary attribute the skill is based on.

The third prompt asks for the skill check's difficulty.

### Spot DC
This property specifies the Perception skill check difficulty for
passively noticing the trap.

### Note about passive Perception

The Roleplaying is Magic 4E system doesn't actually have any defined rolls for
passive skill checks. For the purpose of this script, a character's passive Perception is
calculated as follows:

```
4 + (total Advantage/Disadvantage modifier) + Mind + (3 if trained) + (2 if improved) + (1 if greater) + (total Misc modifiers)
```

So for example, a character not trained in Perception with a Mind of 2 would
have a passive Perception of 6. A character trained in Perception with a Mind
of 4 would have a passive Perception of 11.

## Help

Due to complications with the API reading attributes from certain character sheets,
there have been issues in the past with things such as saving throws or passive perception
not being correct. If this happens, first try adjusting the values for these on
your character sheet or try re-creating the character sheet from scratch to see
if that resolves the problem.

If you continue to experience any issues while using this script,
need help using it, or if you have a neat suggestion for a new feature, please reply to this thread:
https://app.roll20.net/forum/post/3280344/script-its-a-trap-v2-dot-3
or shoot me a PM:
https://app.roll20.net/users/46544/stephen-l

## Show Support

If you would like to show your appreciation and support for the work I do in writing,
updating, and maintaining my API scripts, consider buying one of my art packs from the Roll20 marketplace (https://marketplace.roll20.net/browse/search/?keywords=&sortby=newest&type=all&genre=all&author=Stephen%20Lindberg)
or, simply leave a thank you note in the script's thread on the Roll20 forums.
Either is greatly appreciated! Happy gaming!
