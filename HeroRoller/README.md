# HEROLLER: CARE AND KEEPING

# Introduction
Hero Roller (or, heroll, for short), works with the Hero character sheet. It takes a command line of arguments to describe the Hero power you want to use, then spits out all of the parameters that the roll would produce in game... hopefully in a visually appealing package.

## Arguments Are... Our Friends
Each argument is detected by a the presence of a space followed by a double dash in the command line. The following example is 3.5d6 (effectively, 3d6+1d3) with a designation of the normal mechanic and a name of "Doom Smack".

    !heroll --d:3.5d6 --mech:n --pname:Doom Smack

### Aliases
Each argument has various aliases that can be used in its place. For instance, you can supply the activation roll for a power using the argument  **_activation_**,  **_act_**, or even just  **_a_**. That means that this roll:

    !heroll --d:3d6 --a:14

...is the same as...

    !heroll --dice:3d6 --activation:14

...and represents a 3d6 power with an activation of 14 or less.

### Valid Options  
For some arguments, there are only a range of valid options you can pass. For instance, the  **_dkb_** ("does knockback") argument can only accept:  _yes, y, no, n, true, t, false_, or  _f_. If the supplied value does not pass validation, a default value is substituted in its place. See the section  *Output Structure: Verbose*  for the ability to see how the value you supply maps to the value used for the output.

### Templates  
Templates are collections of the various other arguments that can quickly get you many options at once. For instance, an "Aid" power will work differently than a "Blast." Templates are a starting point, not an end point. Each individual argument can still be explicitly over-ridden -- so that even if your designated template defaults to not doing knockback in an attack, you could override that by invoking the  **_dkb_** argument and setting it to  _true_. I suggest you try the arguments separately, first, so that you understand what they do, then consult the Template section to see what slate of options each template represents.

    !heroll --d:4d6 --t:flash --dkb:true

 
# Basic Roll Structure
Every roll must begin with:

    !heroll

...and it should include a dice argument/value pair (see below for roll equation options).

    !heroll --d:4d6+1k

The arguments can come in any order following the heroll API invocation.

    !heroll --of:sc --t:k --d:2.5d6 --um --location:random

 
## Dice and the Roll Equation
Heroll breaks the roll equation down into a number of d6, a number of d3, and an adder (it also stores a mechanic shorthand and a rebuilt equation, but we'll get to those in a minute). Add .5 to the d6 portion of the roll to represent a d3. The adder represents the flat value to be add or subtracted from the total derived from the dice being rolled.

    ROLL        ==>   EVALUATES TO
    ----------------------------------  
    3d6         ==>   3d6  
    2.5d6+1     ==>   2d6+1d3+1  
    18.5        ==>   18d6+1d3  
    4d6-1       ==>   4d6 - 1  
    5.5d6       ==>   5d6+1d3

You do not need to include "d6" in the supplied equation unless you intend to use an adder. In other words, "3" will evaluate as 3d6, but if you need to include a +1 pip adder, you must supply "3d6+1".

### Inline Rolls
Heroll doesn't use inline rolls in the typical fashion. Instead, if you use inline rolls or character abilities in your  **_dice_** or  **_extradice_** arguments, they should evaluate to a number (i.e., a total), that the heroll engine will interpret as your total number of d6 (see *Breakout - Looking Under the Hood*).

### Mechanic Shorthand
The heroll engine will also look for (and store) a shorthand reference to the mechanic you want to use (n, k, l, or u). Include a mechanic shorthand to set the mechanic that the engine should use for the roll (see *Mechanic*).

    ROLL        ==>   EVALUATES TO  
    ----------------------------------  
    3d6k        ==>   3d6       killing  
    2.5d6+1n    ==>   2d6+1d3+1 normal  
    4l          ==>   4d6       luck
 

### Fixing Bad Rolls
The following rolls are INVALID:  

    BAD ROLL    ==>   DO THIS INSTEAD  
    ----------------------------------  
    2d6+1d3k    ==>   2.5d6k  
    3d3         ==>   1.5d6  
    5d6normal   ==>   5d6n  
    -2d6        ==>   contemplate your life choices

### Breakout - Looking Under the Hood  

Since the amount of d6 interpreted by the engine could be fractional, some processing of the roll equation happens based on your input. Obviously, the integer portion adds to the number of d6 to roll, while the fractional portion gets sent to the d6, d3, or adder values according to the chart, below:

    VALUE       ==>   MAPS TO  
    ----------------------------------  
       <-.333   ==>   +1 (adder)  
    .334-.666   ==>   1d3  
    .667->      ==>   1d6 - 1

After this, the dice are "normalized". Normalizing flattens multiple adders into more/less d3, and multiple d3 into more/less d6. Just as 2d3 should be treated as 1d6, a +2 adder should result in 1d3. Normalization occurs for both the  **_dice_** and  **_extradice_** arguments, as well as when those values are combined.

> **EXAMPLE**: Heretic has an attack that can do 6.5d6 of normal damage, but he can also add his STR dice to the roll. His STR dice are derived in an ability called "GetSTRDice" defined on his character sheet. He sends the following command to the chat:  
> `!heroll --d:6.5d6 --xd:%{Heretic|GetSTRDice}`  
> The dice argument (6.5d6) is interpreted as 6d6, 1d3, and 0 adder. The GetSTRDice ability reduces to an output of 2.5, which is interpreted as 2d6, 1d3, and 0 adder. Neither of those get changed when normalized, however before the roll is calculated, they are combined into 8d6, 2d3, and 0 adder. This amount of dice gets normalized into 9d6, 0d3, and 0 adder.

This may seem straightforward for a straightforward roll, but understanding how it happens is important to make sense of the ways certain rolls interact. A roll of 12d6-1, when combined with 2.8d6 (producing 2d6-1), does NOT become 14d6-2; it becomes 13.5d6.  

### Alternate Dice Value: *check*  

Supplying the value of *check* to the dice argument short-circuits the need to produce any BODY, STUN, KB, or POINTS output. Use this if there is a simple effect that must be rolled for (for example, a martial shove that does only a fixed amount of KB).

    !heroll --d:check --t:ha --pn:Get Back Jack --n:does 6m of shove

# Output Structure

There are two basic options for structuring the output, as well as a verbose option to add extra diagnostic information.

## Tall vs SideCar  

The output can fit in a vertical container roughly the default width of the chat window (_tall_), or it can have an additional "sidecar" (_sc_) only viewable if you expand your chat window slightly. The tall format will present all of the relevant information in a the same container utilizing more vertical space. The sidecar space presents only the most applicable information (like to-hit and damage information for an attack), and places other information (like the actual dice that were rolled to produce the effect) in the sidecar, for quicker readability. Set this option using the output format argument (_**of**_). The default option is  _tall_. Including only the argument name (or any of the argument aliases that refer to the  **_outputformat_**) without supplying a value will instruct the heroll engine to use the sidecar layout.

## Verbose  

What you supply might not always map to what you expect. In that case, you probably have an error in your command line. Use the  **_verbose_** argument to include a table of "what you provided" for each argument beside "what it mapped to." The table will not only show you the baked-in parameters that are available to you, it will also show you the parameters that you included which it didn't understand (handy for catching mis-spellings,etc.). This can be a very valuable debugging tool to make sure what you intended to send to the heroll engine is what was actually sent.

## Argument List  

The following arguments are available to use with the heroll script engine. Each argument can be aliased with various options (so you don't have to type "--activation" if you would prefer to use the shorter "--a"). Each argument has to pass certain validation checks (ensuring that it is a number, or a boolean true/false, for example), and if the validation fails, certain default values are used instead. The table below lists all of this information.
<details>
<summary>act</summary>

	aliases       : a, act, activation
	valid options : [number]
	default       : (none)
	flag value    : 
	notes         : 
</details>
<details>
<summary>dice</summary>

	aliases       : d, dice
	valid options : [see Dice and the Roll Equation]
	default       : 1d6
	flag value    : 
	notes         : 
</details>
<details>
<summary>dbody</summary>

	aliases       : db, dbody, doesbody
	valid options : y, yes, n, no, t, true, f, false
	default       : [per template]
	flag value    : true
	notes         : whether an attack should report BODY damage; also whether 
	                a Points-output should derive points from BODY
</details>
<details>
<summary>dkb</summary>

	aliases       : dkb, dknockback, doesknockback
	valid options : y, yes, n, no, t, true, f, false
	default       : [per template]
	flag value    : true
	notes         : 
</details>
<details>
<summary>dstun</summary>

	aliases       : ds, dstun, doesstun
	valid options : y, yes, n, no, t, true, f, false
	default       : [per template]
	flag value    : true
	notes         : whether an attack should report STUN damage; also whether 
	                a Points-output should derive points from STUN (default)
</details>
<details>
<summary>extradice</summary>

	aliases       : xd, xdice, extradice
	valid options : [number]
	default       : 0
	flag value    : 
	notes         : 
</details>
<details>
<summary>kbdicemod</summary>

	aliases       : xkb, extrakb, kbdice, kbdicemod
	valid options : [number]
	default       : 0
	flag value    : 
	notes         : 
</details>
<details>
<summary>loc</summary>

	aliases       : l, loc, location
	valid options : any, random, none, [hit location], [special shot]
	default       : none
	flag value    : random
	notes         : 
</details>
<details>
<summary>mechanic</summary>

	aliases       : rm, rollmech, rollmechanic, m, mech, mechanic
	valid options : n, k, l, u
	default       : [per template]
	flag value    : 
	notes         : This can be set in any of three places; see the Mechanic section.
</details>
<details>
<summary>ocv</summary>

	aliases       : o, ocv
	valid options : [number]
	default       : (none)
	flag value    : 
	notes         : supply an OCV to override any checking of a character sheet 
	                (including when you don't have a character sheet). This 
	                flattens all OCV mods to 0, including any originating from
	                a called-shot. Including the location argument will still invoke 
	                BODY and STUN multipliers.
</details>
<details>
<summary>outputformat</summary>

	aliases       : of, output, format, outputformat, sc
	valid options : tall, sc
	default       : tall
	flag value    : sc
	notes         : 
</details>
<details>
<summary>pointslabel</summary>

	aliases       : pl, plbl, plabel, ptsl, ptslbl, ptslabel, pointsl, pointslbl, pointslabel
	valid options : [string]
	default       : [per template]
	flag value    : 
	notes         : 
</details>
<details>
<summary>powername</summary>

	aliases       : pn, pname, powername
	valid options : [string]
	default       : [per template]
	flag value    : 
	notes         : 
</details>
<details>
<summary>primarycolor</summary>

	aliases       : c, col, color, pc, primarycolor
	valid options : 3- or 6-digit hex, with or without #
	default       : [per template]
	flag value    : 
	notes         : 
</details>
<details>
<summary>selective</summary>

	aliases       : s, sel, selective
	valid options : y, yes, n, no, t, true, f, false
	default       : false
	flag value    : true
	notes         : use for both Area Effect: Selective and Non-Selective
</details>
<details>
<summary>stunmod</summary>

	aliases       : xs, xstun, extrastun, stunmod
	valid options : [number]
	default       : 0
	flag value    : 
	notes         : 
</details>
<details>
<summary>target</summary>

	aliases       : tgt, target
	valid options : [list of token_ids]
	default       : (none)
	flag value    : 
	notes         : 
</details>
<details>
<summary>template</summary>

	aliases       : p, pwr, pow, power, t, tmp, template
	valid options : [see table, below]
	default       : c
	flag value    : 
	notes         : 
</details>
<details>
<summary>useomcv</summary>

	aliases       : mental, um, omcv, useomcv
	valid options : y, yes, n, no, t, true, f, false
	default       : false
	flag value    : true
	notes         : 
</details>
<details>
<summary>verbose</summary>

	aliases       : v, verbose
	valid options : yes, n, no, t, true, f, false
	default       : false
	flag value    : true
	notes         : 
</details>
<details>
<summary>recall</summary>

	aliases       : r, rc, recall
	valid options : last, [valid id]
	default       : [current speaker]
	flag value    : [current speaker]
	notes         : *in beta*
</details>

### Arguments Requiring No Value
Certain arguments don't require an explicit value declaration (following the ":"), because just by including them you are invoking the "true" state. These are listed below.

    ARGUMENT     ==> DEFAULT VALUE  
    ----------------------------------  
    dbody        ==>   true  
    dstun        ==>   true  
    dkb          ==>   true  
    outputformat ==>   "sc"  
    useomcv      ==>   true  
    verbose      ==>   true  
    recall       ==>   (current speaker)
    loc			 ==>	random

All aliases of these arguments will behave the same (so  **_sc_**, an alias of  **_outputformat_**, will invoke the sidecar layout if included as  **_--sc_**, and **_--l_**, an alias of **_location_**, will apply a random location).

# Mechanic

The  **_mechanic_** argument represents the way dice are totaled in the Hero system. Dice can be totaled as Normal (n), Killing (k), Luck (l), or Unluck (u). This is separate from how a power is output to the chat. For instance, an Aid power uses the "normal" mechanic to total the dice, gets the points of Aid done from the STUN counted, and then reports that total as "Points of Aid" (**_pointslabel_** argument).

## Priority of Assignment  

The mechanic can be set in a template default, in an explicit argument, or as a shorthand inclusion in the  **_dice_** argument (i.e., "3d6+1k" uses the shorthand "k" to trigger the killing mechanic). The order of precedence goes:

**_template_** is trumped by  **_mechanic_** argument is trumped by  a _**shorthand**_ 

That means that in the following line:  

    !heroll --d:5d6k --t:b --rm:l

...will evaluate to using the *killing* mechanic, despite the "blast" template designating the normal mechanic, and the  **_mechanic_** argument being explicitly set to luck.

## Points Based Powers and Mechanic  

Certain templates are set up to report as points instead of damage. Those points can be determined from either the STUN or BODY of a die roll. For this, use the ***doesbody*** and ***doesstun*** arguments. A points-based power will use the normal mechanic to total BODY and STUN. For a points-based output, the ***doesstun*** argument tells the roller to use the STUN. Use the ***doesbody*** argument to tell the engine to count the BODY, instead. If both are set to *true* (as they would be for a Healing power that heal both BODY and STUN), the output will show both values. If somehow both arguments are set to *false*, the engine will behave as if ***doesstun*** is *true*.
## Mechanic and Recall
Certain arguments are not available to be changed if you have invoked the ***recall*** argument to retrieve a previous roll; among them, the ***dice*** argument. This means that if you include a mechanic shorthand in your roll, you will be unable to change the mechanic in a subsequent recall of that roll (a shorthand mechanic trumps other places where the mechanic can be set, but as a part of the ***dice*** argument, it cannot be accessed during a recall). Read more under *Recall*.

# Templates  

Templates are collections of the above arguments that are tailored for the various powers in the Hero system, describing their most common implementation. They are the starting point to base out a power, setting the default values for the other arguments. Further customization, using explicit arguments, lets you craft various interactions of the arguments to get you to the goal you're looking for. Use the templates to get you close to the set of argument values you are looking for, then change only the arguments that require it (or that you want to).

There is no rule that says you have to use the Aid template to represent an Aid power. Since you're looking for a collection of argument values, you could use exactly the wrong template and then change all of the arguments to their correct value for your character's particular power... though why you'd want to do that, I couldn't say. The one component you should pay attention to is how the template reports (**_outputas_**), because that argument is not otherwise exposed to you. That means if you need a power that reports as damage, make sure you start with a template that produces an *attack* output (the default template, if none is declared, is a basic attack using the normal mechanic). On the other hand, if you need a power to report as *points*, you don't want to start with one designed to produce damage (the "p" template is a base points-based output, pulling from the STUN value of the roll).

Consult the tables, below, for the slate of options described by each template.

## Custom (default)
_**alias:**  c, cust, custom, def, default_

    template     : "c"
    powername    : "Attack"
    mechanic     : "n"
    dbody        : true
    dstun        : true
    dkb          : true
    primarycolor : "#b0c4de"
    pointslabel  : "POINTS"
    useomcv      : false
    outputas     : "attack"

## Aid
_**alias:**  a, aid_

    template     : "a"
    powername    : "Aid"
    mechanic     : "n"
    dbody        : false
    dstun        : true
    dkb          : false
    primarycolor : "#ffaa7b"
    pointslabel  : "POINTS OF AID"
    useomcv      : false
    outputas     : "points"

## Blast
_**alias:**  b, blast_

    template     : "b"
    powername    : "Blast"
    mechanic     : "n"
    dbody        : true
    dstun        : true
    dkb          : true
    primarycolor : "#5ac7ff"
    pointslabel  : "POINTS"
    useomcv      : false
    outputas     : "attack"

## Dispel
_**alias**: di, dispel_

    template     : "di"
    powername    : "Dispel"
    mechanic     : "n"
    dbody        : false
    dstun        : true
    dkb          : false
    primarycolor : "#b0c4de"
    pointslabel  : "POINTS OF DISPEL"
    useomcv      : false
    outputas     : "points"

## Drain
_**alias**: dr, drain_

    template     : "dr"
    powername    : "Drain"
    mechanic     : "n"
    dbody        : false
    dstun        : true
    dkb          : false
    primarycolor : "#ffaa7b"
    pointslabel  : "POINTS OF DRAIN"
    useomcv      : false
    outputas     : "points"

## Entangle
_**alias**: e, entangle_

    template     : "e"
    powername    : "Entangle"
    mechanic     : "n"
    dbody        : true
    dstun        : false
    dkb          : false
    primarycolor : "#b0c4de"
    pointslabel  : "ENTANGLE BODY"
    useomcv      : false
    outputas     : "points"

## Flash
_**alias**: f, flash_

    template     : "f"
    powername    : "Flash"
    mechanic     : "n"
    dbody        : true
    dstun        : false
    dkb          : false
    primarycolor : "#b0c4de"
    pointslabel  : "SEGMENTS OF FLASH"
    useomcv      : false
    outputas     : "points"

## Hand Attack
_**alias**: ha, hattack, handattack_

    template     : "ha"
    powername    : "Hand Attack"
    mechanic     : "n"
    dbody        : true
    dstun        : true
    dkb          : true
    primarycolor : "#0289ce"
    pointslabel  : "POINTS"
    useomcv      : false
    outputas     : "attack"

## Healing
_**alias**: he, heal, healing_

    template     : "he"
    powername    : "Healing"
    mechanic     : "n"
    dbody        : false
    dstun        : true
    dkb          : false
    primarycolor : "#ffaa7b"
    pointslabel  : "POINTS OF HEALING"
    useomcv      : false
    outputas     : "points"

## Killing Attack
_**alias**: hk, rk, k, ka, kattack, killingattack_

    template     : "ka"
    powername    : "Killing Attack"
    mechanic     : "k"
    dbody        : true
    dstun        : true
    dkb          : true
    primarycolor : "#ff5454"
    pointslabel  : "POINTS"
    useomcv      : false
    outputas     : "attack"

## Mental Blast
_**alias**: mb, mblast, mentalblast_

    template     : "mb"
    powername    : "Mental Blast"
    mechanic     : "n"
    dbody        : false
    dstun        : true
    dkb          : false
    primarycolor : "#c284ed"
    pointslabel  : "POINTS"
    useomcv      : true
    outputas     : "attack"

## Mental Illusions
_**alias**: mi, millusions, illusions, mentalillusions_

    template     : "mi"
    powername    : "Mental Illusions"
    mechanic     : "n"
    dbody        : false
    dstun        : true
    dkb          : false
    primarycolor : "#c284ed"
    pointslabel  : "POINTS OF ILLUSION"
    useomcv      : true
    outputas     : "points"

## Mind Control
_**alias**: mc, mcontrol, mindcontrol_

    template     : "mc"
    powername    : "Mind Control"
    mechanic     : "n"
    dbody        : false
    dstun        : true
    dkb          : false
    primarycolor : "#c284ed"
    pointslabel  : "POINTS OF MIND CONTROL"
    useomcv      : true
    outputas     : "points"

## Points
_**alias**: p, pts, points_

    template     : "p"
    powername    : "Points Power"
    mechanic     : "n"
    dbody        : false
    dstun        : true
    dkb          : false
    primarycolor : "#9d41e8"
    pointslabel  : "POINTS"
    useomcv      : false
    outputas     : "points"

## Transform
_**alias**: t, transform_

    template     : "t"
    powername    : "Transform"
    mechanic     : "n"
    dbody        : false
    dstun        : true
    dkb          : false
    primarycolor : "#ffaa7b"
    pointslabel  : "POINTS OF TRANSFORM"
    useomcv      : false
    outputas     : "points"

## Luck
_**alias**: l, luck_

    template     : "l"
    powername    : "Luck"
    mechanic     : "l"
    dbody        : false
    dstun        : false
    dkb          : false
    primarycolor : "#35e54e"
    pointslabel  : "POINTS OF LUCK"
    useomcv      : false
    outputas     : "points"

## Unluck
***alias**: u, unluck*

     template     : "u"
    powername    : "Unluck"
    mechanic     : "u"
    dbody        : false
    dstun        : false
    dkb          : false
    primarycolor : "#FF453B"
    pointslabel  : "POINTS OF UNLUCK"
    useomcv      : false
    outputas     : "points"

# Representing Area Effect With Targets
With update 1.2, the Hero Roller script gained the ability to process targets. This not only allows for target designation for a straightforward attack (1 target), but also Area Effect attacks (n-targets) with or without the Selective or Non-Selective modifier (both require individual to-hit rolls for targets within the affected area).

Targets can be designated with the  **_--target_**  (alias:  **_--tgt_**) argument, which accepts a list of token ids delimited by either a space or a comma. The  **_--selective_**  (aliases  **_--sel_**,  **_--s_**) argument,  tells the Hero Roller script to roll individual to-hit rolls for each designated target. The **_selective_** argument takes no value. (I will suggest my  [InsertArgs](https://app.roll20.net/forum/post/8842638/insertargs-substitution-script-with-custom-replacement-hooks) script here to help manage creating this list on the fly... currently in beta).

Multiple targets  _without_  **_selective_** and _without_ a **_location_** will render as many as 3 to a line. Invoking either **_selective_** or a **_location_** will force each target to its own line.

With Area Effect attacks (multiple targets), the top to-hit roll in the output panel is used to target the hex for the attack. **_Selective_** provides the individual to-hit rolls, if needed.

# Understanding the Output

The heroll engine does many things for you, but there are some things that it cannot do. You need to understand the boundaries and limitations so you know what will be left to you to figure either prior to invoking a call to the heroll engine, or after, interpreting the numbers that are presented to you.

## Knockback  

### Knockback Dice

Knockback is modified by a  **_kbdicemod_** argument. Treat this argument as what you are doing to the knockback dice. In other words, a -1 in this argument means you are rolling 1 less die, and therefore more likely to produce some knockback from your attack. There are many things that can raise or lower the number of dice you roll for knockback, but the only one that has a ready handle in the heroll engine is whether the attack uses the killing roll mechanic (1 extra knockback die). That means you DO NOT need to adjust the default number of knockback dice using the  **_kbdicemod_** argument just to account for your attack being a Killing Attack. Any other adjustment (for the target being in the air, or in water, or for the attack being a martial attack, etc.) can be passed into the  **_kbdicemod_** argument (and, honestly, use the shorter  **_xkb_** alias of that argument; we use the longer version in this manual just for readability for newcomers). You can use a macro to supply the options for this argument, and pick a different one for each invocation of the heroll script.

### Reading Knockback Result
Knockback is reported in game "inches," and must be multiplied by 2 to get meters.

## Damage Multipliers

### STUN Multiplier

The base STUN multiplier (either as provided by the location or from rolling a d3 for location-agnostic attacks) can be nudged up or down by implementing the  **_stunmod_** argument (again, the shorter version,  **_xs_**, is your friend). For this argument, you are directly modifying the STUN modifier, so a -1 in the  **_stunmod_** argument is effectively reducing the appropriate STUN modifier by 1.

### Reading Damage Results with Multipliers

If you see a damage multiplier in the results output of your roll, it means that you still have work to do, applying that modifier AFTER target defenses are taken into account. For instance, if you see a multiplier in the STUN results box (and/or in the sidecar if you are using that output), and you have a normal attack, that means that you must subtract the target's applicable defenses before then multiplying the remaining STUN by the multiplier shown. Obviously, if you are implementing location damage in your game, you should be familiar with the order of application.

If your game is not using locations for attack targets (even "random" locations figured if the attack lands), there is only 1 damage multiplier (a STUN multiplier for a killing attack power). It is also the only multiplier that applies fully, regardless of what defenses the target can bring to bear. You WILL NOT see the value of this multiplier in the output (though you can easily figure it out by comparing BODY and STUN values). Again, this means that there is no further figuring required to understand the amount of damage done by the attack.

## Dice Color

The dice shown as the pool of dice rolled are in one color for your d6, and in the alternate color for your d3 and/or adder. The actual color (primary vs alternate) is assigned based on the contrast-iness of the color you chose for the **_primarycolor_** argument.
## Target Information
A lot of data can be presented for a target. The number on a target's token image is the D(M)CV of the target (if there is a character sheet to pull it from. If the target has a D(M)CV and that target was hit by the to-hit roll, a target icon will also appear on the token image in the output panel. If either **_selective_** or a **_location_** was invoked, there will be information to the right of the token image in the output panel. **_Selective_** provides the first two, a "to-hit" roll and a "hit dcv". **_Location_** provides the next two, which are BODY and STUN modifiers for the location hit for each token.
# Recall
***Note:*** *this feature is still in beta.*
The last roll for each speaker is stored in the game's ***state*** variable (read more about the state variable on the wiki). Every roll for a speaker overwrites the previously stored roll for them. Using the ***recall*** argument, you can retrieve the last roll for yourself (default, no value required), for the most recent speaker (*last*), or for a given speaker (via their id).

Once the desired roll is retrieved, you can overwrite the various arguments to manipulate the output. For instance, you could add the ***verbose*** argument to see the verbose output, or you could change the ***color*** or ***outputformat***. You could change the mechanic from *killing* to *normal*. The main uses of this feature are:
 1. when you forgot to include some portion of the parameters (like forgetting an OCV override)
 2. when the previous roll turned out oddly, and you want to see the verbose output to see what information the script engine received
 3. when you join a game and forget to speak as your character, you can change your "chat as" and send the previous roll again as your character (to pull in OCV, etc.)
 4. if you have a need to "mimic" a previous roll for gameplay (a mimic villain?)

### Limitations
There are limitations to what can be done with the recalled roll. Re-rolling dice is not allowed (just make a new call/roll using the script for that). Also, you cannot use the template argument to change the template of the recalled roll (instead, you have to alter the arguments one at a time). The following arguments are not evaluated for a recalled roll:

 - ***dice***
 -  ***extradice***
 -  ***template***

### Recall Interactions
Because these arguments are unavailable to you, you should be aware that if your recalled roll included a mechanic shorthand, you will not be able to change the mechanic. Also, since the information for outputting to an attack, points, or check format is contained in the template, you will be unable to change a roll from an attack to luck, for example, nor can a blast become an entangle. Read more under the *Mechanic* and *Template* sections.

# Examples and Advanced Implementation

The following implements a 4d6 flash named Cosmic Flare, with notes describing mechanics, and designates a blue color:

    !heroll --d:4d6 --t:f --a:14 --pn:Cosmic Flare --n:flash to common sight, AoE (16m) Non-Selective --c:4b688b

Here is a similar implementation except using the *check* value to not output the results bar. This one also references an attribute called "color1" where the color for the panel is stored (for easy color coding or changing at a later date):

    !heroll --d:check --pn:Way of the Mountain --n:does 9m of shove --t:ha --col:@{Heretic|Color1}

The next utilizes the ***xd*** (extra dice) argument to read the velocity from the character's sheet and feed that as a modifier to a martial throw. It sends the output as the sidecar format:

    !heroll --d:6.5d6 --t:ha --pn:Way of the Wind --n:throw, target falls --sc --xd:[[@{Heretic|velocity}/10]] --col:@{Heretic|color1}

Another example using the *check* value to validate that the character created a wall of given size:

    !heroll  --p:pts --pn:Wall of Light --d:check --of:tall --pl:Wall of Light --n:8 PD, 8 ED, 6m long, 4m tall, .5m thick, dismiss, choose either not anchored or mobile --c:@{Prism|pwrcol}

The next example demonstrates a power the player can choose to "push" by a given amount. The player is asked for input, and the result is fed into the ***xd*** argument:  

    !heroll  --p:b --pn:Light Stix --d:10d6 --of:TALL --c:@{Duo|pwrcol} --xd:[[?{Supercharge Points|30}/10]] --n:4m radius select attack, no range, IIF vs PD

> Written with [StackEdit](https://stackedit.io/).
