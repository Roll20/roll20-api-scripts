Fumbler
=======

This is a simple and sometimes humorous fumble generator. 

----------

How to use
----------------

In the chat box enter `!fumble` and a random fumble will be output:

> **Fumbler**: Rolled 35/100 
**Clumsy**
Fall down. Roll DEX or drop primary weapon.

You can also enter an optional percent like `!fumble 93`

> **Fumbler**: Rolled 93/100 
**Very Unaware**
Hit friend, normal damage. Friend stunned for 1 round.


`!fumble 90`

> **Fumbler**: Rolled 35/100
 **Useless Moron**
Hit self. Double damage. Stunned for 1 round.


New in version 0.4.0
--------------------
**!removeFumble** command: Requires title field.  Will remove all fumbles with that title field
**!resetFumbleList** command: Resets fumble list to default values.  Required if previously using 0.3.0 and want to add to the table.
**!clearFumbleList** command: Completely removes all fumbles from table


Fumble Charts now support "weight" as a simpler apprach to setting up a table, making it easier to add and remove.
They also have the option to randomize dc rolls for you.  Don't add the dcLow and dcHigh field if not applicable.

[
    {"weight": 1, "result": "Distracted", "effect": "Roll DEX or fall down.", "dcLow": 8, "dcHigh": 20},
    {"weight": 2, "result": "Negligent", "effect": "Fall down."},
    ...
]

The only downside to this method is that it is harder for the user to specify the fumble (but who wants to do that???).


New in version 0.3.0
--------------------

You can add to the basic existing fumble options provided.  Currently, there is no way to remove them, so it should be done with care.
To do so, you use the command **!addFumble**.
This command expects you to format the request a specific way.
!addFumble [weight of fumble's occurence (number)] [title (one word)] [description]


So an example would be this:

`!addFumble 1 Whoopsie-Daisy You fall prone and provoke an attack of opportunity from any surrounding enemies within 5 feet`
> Fumble Added!

New in version 0.2.0
--------------------
You can create your own fumbler charts in your handouts.
Create a handout with the name fumbler-name_of_chart

In the notes place JSON code in the format:

```
[
    {"low": 1,  "high": 10, "result": "Distracted", "effect": "Roll DEX or fall down."},
    {"low": 11, "high": 14, "result": "Negligent", "effect": "Fall down."},
    ...
]
```

When creating this table, it's import there are no gaps in between your possible fumbles.
Something such as: 

```
[
    {"low": 1, "high":10, "result": "Some Result", "effect": "Some effect."},
    {"low": 15, "high":20, "result": "Other Result", "effect": "Other effect."}
]
```

will cause the an (occational) invalid percent error.

Also note that the fumble table does not have to be completed to 100.
Something such as: 

```
[
    {"low": 1,  "high": 10, "result": "Distracted", "effect": "Roll DEX or fall down."},
    {"low": 11, "high": 14, "result": "Negligent", "effect": "Fall down."},
    {"low": 15, "high": 25, "result": "Bad", "effect": "Start crying."},
    {"low": 26, "high": 35, "result": "Very Bad", "effect": "You accidently target a friend."},
]
```

will work fine.

To use your fumbler handout chart set the first parameter as your chart name. For example if you created a handout named fumbler-disaster then you can tell fumbler to use it like so:

`!fumble disaster`

or 

`fumble disaster 91`
