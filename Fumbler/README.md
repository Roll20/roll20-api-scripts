Fumbler
=======

This is a simple and sometimes humorous fumble generator. 

----------

How to use
----------------

In the chat box enter `!fumble` and a random fumble will be output:

> **Fumbler**: 35% **Clumsy**
Fall down. Roll DEX or drop primary weapon.

You can also enter an optional percent like `!fumble 93`

> **Fumbler**: 93% **Very Unaware**
Hit friend, normal damage. Friend stunned for 1 round.


`!fumble 90`

> **Fumbler**: 90% **Useless Moron**
Hit self. Double damage. Stunned for 1 round.

New in version 0.2.0
--------------------
You can create your own fumbler charts in your handouts.
Create a handout with the name fumbler-name_of_chart

In the notes place JSON code in the format:

```
[
    {low: 1,  high: 10, result: "Distracted", effect: "Roll DEX or fall down."},
    {low: 11, high: 14, result: "Negligent", effect: "Fall down."},
    ...
]
```

To use your fumbler handout chart set the first parameter as your chart name. For example if you created a handout named fumbler-disaster then you can tell fumbler to use it like so:

`!fumble disaster`

or 

`fumble disaster 91`
