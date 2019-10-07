Eclipse Phase 1E Companion Script
=================================

This is a companion script to the [Eclipse Phase 1E sheet](https://github.com/Bathtor/EPSheet) for use with the API on [Roll20](http://roll20.net). The vast majority of its features will not work with any other sheet and no such support is planned/considered.

**Note**: If you are using this script with Roll20's 1-Click install, be aware that sometimes inconsistent updates between the sheet and the script can leave things not working, and you have little to no control over this (and neither have I, really). If you want a more reliable experience, install both sheet and script manually instead of using Roll20's automatic systems.

Contents
--------
<!-- run `doctoc README.md --maxlevel 4` to update this file -->
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Command Overview](#command-overview)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation-1)
    - [EPCompendium](#epcompendium)
    - [Updating](#updating)
- [Command Descriptions](#command-descriptions)
  - [Battle Manager](#battle-manager)
    - [Usage](#usage)
    - [Recommended Macros](#recommended-macros)
  - [Character Cleaner](#character-cleaner)
    - [Usage](#usage-1)
    - [Recommended Macros](#recommended-macros-1)
  - [Character Tools](#character-tools)
    - [Usage](#usage-2)
    - [Recommended Macros](#recommended-macros-2)
  - [GM Tools](#gm-tools)
    - [Usage](#usage-3)
    - [Recommended Macros](#recommended-macros-3)
  - [Group Rolls](#group-rolls)
    - [Usage](#usage-4)
    - [Recommended Macros](#recommended-macros-4)
  - [Special Rolls](#special-rolls)
    - [Usage](#usage-5)
    - [Recommended Macros](#recommended-macros-5)
  - [Token Setup](#token-setup)
    - [Usage](#usage-6)
    - [Recommended Macros](#recommended-macros-6)
  - [Compendium](#compendium)
    - [Usage](#usage-7)
    - [Recommended Macros](#recommended-macros-7)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

Command Overview
----------------
In this section we give a quick overview over all available commands. They describe in detail in later individual sections.

**Note**: You can always run `!<cmd> --help` in Roll20 chat to get a quick description of the options available for each `<cmd>`.


- **Battle Manager** (`!epbattleman`) manages Action Turns and Action Phases based on character speed, as well as rerolls iniative for everyone at the beginning of a new turn automatically.
- **Character Cleaner** (`!epclean`) resets or empties certain sections on the character sheet, in order to automate backups, or egocasts.
- **Character Tools** (`!epchar`) applies damage, wounds, stress, and traumas automatically, taking armour into account as appropriate.
- **GM Tools** (`!epgmtools`) can be configured to show skills for a whole party, in order to easily roll Perception checks, for example.
- **Group Rolls** (`!epgroup-roll`) can be used to roll EP specific common rolls like *Fray/2*, *Initiative*, or simply an arbitrary skill check, for a group of selected tokens.
- **Special Rolls** (`!epspecialroll`) is a script that manages rolling common EP rolls, without involving a character sheet. Convenient for the improvising GM, who doesn't have an NPC ready to import, but still needs it to shoot something, for example.
- **Token Setup** (`!eptoken`) generate token abilities for skills, *Fray/2*, or *Initiative*.
- **Compendium** manages data from the [Eclipse Phase Compendium](https://github.com/Bathtor/EPCompendium):
	- *Data* (`!epcompendium-data`) manages search, lookups, and display of compendium data to the chat.
	- *Export* (`!epcompendium-export`) can export custom morphs in a Compendium-compatible format, so they can be imported into other character sheets.
	- *Import* (`!epcompendium-import`) manages character, trait, morph, and item imports.

Installation
------------

### Prerequisites

- You must be a **Pro** subscriber of Roll20 to use API scripts in general, and this script in particular.
- You'll need a recent version of the [Eclipse Phase 1E sheet](https://github.com/Bathtor/EPSheet). I'll try to be clear in the documentation, which script version works with which sheet version, but generally the latest release of each should always work together. And if you picked the wrong versions, it should complain and not break anything.

### Installation

- Open the **raw** text of the latest release of the script. At the time of writing that is [v1.0.2](https://github.com/Bathtor/EPSheet/releases/download/script-v1.0.2/ep-script.js).
- Copy *all* the text -- **Ctrl+A** followed by **Ctrl+C** (**Cmd+A**, **Cmd+C** on a Mac)
- Go to the API Script page for your Roll20 campaign
- Paste the text into a new script, or override an older version if updating. Don't forget to give it a sensible name, e.g. `epscript.js`!
- Save the script
- Leave the Roll20 API Script page open, and open up your campaign view in a different tab/window. That should cause your sandbox to spin up. If no errors are reported, you should be good to go.

#### EPCompendium
If you would like access to the EPCompendium-related features, you must also install the data script for the compendium. Follow the same procedure as above for the latest release of the EPCompendium, [v6.0.0](https://github.com/Bathtor/EPCompendium/releases/tag/v6.0.0) at the time of writing. Each Compendium release also contains a number of macros prepared to use with the script that you can just c&p into your campaign.

**Note** that there's a load time dependency between the compendium script and the companion script, so make sure that the compendium script's tab is to the right of the companion script's.

#### Updating
If you need to update one of the script installed above, simply follow the same instructions as for a normal installation. Do make sure, that you always override old script versions, and never have two versions running in parallel!

Command Descriptions
--------------------

### Battle Manager
**Command**: `!epbattleman`

The EP Battle Manager deals with EP's hierarchical combat timing structure based on *Action Turns* and *Action Phases* in Roll20's Turn Order mechanism. Each *Action Turn* begins by rolling iniative. Then every participant may take perform actions in the iniative order in the first *Action Phase*. For participants with `speed > 1` more *Action Phases* are added using the same initiative order, until no participant is left with `speed` greater than the current *Action Phase* number. Then the process starts over with rolling of new iniative and starting a new *Action Turn*.

#### Usage
1. Add tokens to the *Turn Order* in any manner you prefer.
2. Run `!epbattleman --start` to inialise the Battle Manager. This will sort the *Turn Order* and create marker entries for *Action Phase* and *Action Turn* boundaries. These have the form `|Round x|Phase y|`. *From now on, do NOT use any of the Roll20 Turn Order functions anymore, as they will interfere the Battle Manager's state!*
3. Proceed from character to character using `!epbattleman --next`. Characters without sufficient `speed` for the next *Action Phase* whill be dropped from the *Turn Order* as you go, but they are stored internally by the Battle Manager and will be added again at the beginning of the next *Action Turn*. At the beginning of the next *Action Turn* the Battle Manager will automatically roll new *Initiative* for all Tokens that have a Character Sheet associated with them.
4. Once the battle is over, run `!epbattleman --end` to clear the Battle Manager's state. It will also tell you how long the battle took in realtime, as well as the number of rounds and phases.

If you need to **add** or **remove** charaters during an ongoing battle, you *must* use the the commands `!epbattleman --add` or `!epbattleman --drop` respectively. Using any other mechanism will pollute the Battle Managers internal state and you will see some strange behaviour.

If you accidentally use the normal `Next` button or manually add or remove tokens from an ongoing battle, the script will output a warning message to the chat. This warning message also contains a `reset` button, which you can use to invoke `!epbattleman --reset`, thereby undoing your inconsistency-introducing change.

#### Recommended Macros

- **BStart**: `!epbattleman --start`
- **BNext**: `!epbattleman --next`
- **BEnd**: `!epbattleman --end`
- **BAdd**: `!epbattleman --add`
- **BDrop**: `!epbattleman --drop`

*In [Roll20 ES](https://github.com/SSStormy/roll20-enhancement-suite) Format*:
```json
{
    "schema_version": 2,
    "macros": [
        {
            "attributes": {
                "action": "!epbattleman --start",
                "istokenaction": false,
                "name": "BStart",
                "visibleto": ""
            },
            "macrobar": {
                "color": null,
                "name": null
            }
        },
        {
            "attributes": {
                "action": "!epbattleman --next",
                "istokenaction": false,
                "name": "BNext",
                "visibleto": ""
            },
            "macrobar": {
                "color": null,
                "name": null
            }
        },
        {
            "attributes": {
                "action": "!epbattleman --end",
                "istokenaction": false,
                "name": "BEnd",
                "visibleto": ""
            },
            "macrobar": {
                "color": null,
                "name": null
            }
        },
        {
            "attributes": {
                "action": "!epbattleman --add",
                "istokenaction": false,
                "name": "BAdd",
                "visibleto": ""
            },
            "macrobar": {
                "color": null,
                "name": null
            }
        },
        {
            "attributes": {
                "action": "!epbattleman --drop",
                "istokenaction": false,
                "name": "BDrop",
                "visibleto": ""
            },
            "macrobar": {
                "color": null,
                "name": null
            }
        }
    ]
}
```

### Character Cleaner
**Command**: `!epclean`

The Character Cleaner removes or resets sections of a Character Sheet that are not taken along during the **Egocast** or **Backup** procedure. This includes *Active Morph*, *Gear* (except *Software*), and *Armour* totals, as well as *Damage* and *Wounds*. *Egocast* and *Backup* behave similar in every way, except that during a backup the Character Sheet is renamed in order to differentiate it from the "live" sheet. You *should*, thus, run the *backup* command on a **copy** of the "live" sheet!

#### Usage

##### Egocast
1. Select a token representing the *target* Character Sheet.
2. Run `!epclean --egocast`.

##### Backup
1. Create a copy of the *target* Character Sheet.
2. Drag the copy onto a map to get a token for it. *(Double check that the token actually points to the new sheet, not the old one!)*
3. Select that token.
4. Run `!epclean --backup`.
5. Delete the token from the map and archive the backup sheet.

Optionally, you can also change the **prefix** the *backup* commands adds to the sheet name. To do so, invoke the backup command like `!epclean --backup --prefix <some prefix>` instead.

As an alternative to using the UI for duplicating the sheet, the following API script (found on [Roll20 Forums](https://app.roll20.net/forum/post/5687127/duplicate-character-sheet-plus-linked-token-script/?pageforid=5687407)) also works, and has the advantage that it properly relinks the token to the new sheet. Invoke it with `!dup-char-by-token`.
```javascript
on('ready',()=>{
    const simpleObj = (o)=>JSON.parse(JSON.stringify(o));
    const getCleanImgsrc = (imgsrc) => {
        let parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^?]*)(\?[^?]+)?$/);
        if(parts) {
            return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
        }
        return;
    };
    const resetAttrs = {"damage": 0, "wounds": 0};
    const duplicateCharacter = (o) => {
        let c = simpleObj(o.character);
        let oldCid = o.character.id;
        delete c.id;
        c.name=`(COPY) ${c.name}`;
        c.avatar=getCleanImgsrc(c.avatar)||'';

        let newC = createObj('character',c);
        
        _.each(findObjs({type:'attribute',characterid:oldCid}),(a)=>{
            let sa = simpleObj(a);
            delete sa.id;
            delete sa._type;
            delete sa._characterid;
            sa.characterid = newC.id;
            if (sa.name in resetAttrs) {
                sa.current = resetAttrs[sa.name];
            }
            createObj('attribute',sa);
        });
        _.each(findObjs({type:'ability',characterid:oldCid}),(a)=>{
            let sa = simpleObj(a);
            delete sa.id;
            delete sa._type;
            delete sa._characterid;
            sa.characterid = newC.id;
            createObj('ability',sa);
        });
        let oldBar1 = o.token.get('bar1_link');
        //log("Bar1 " + oldBar1);
        let oldBar2 = o.token.get('bar2_link');
        //log("Bar2 " + oldBar2);
        let oldBar3 = o.token.get('bar3_link');
        //log("Bar3 " + oldBar3);
        let findNewAttr = (oldBar) => {
            if (oldBar != undefined) {
                if (oldBar.startsWith("sheetattr")) {
                    return oldBar; // somehow this works in Roll20
                } else {
                    let barAttr = getObj('attribute', oldBar);
                    let name = barAttr.get('name');
                    let r = findObjs({type: 'attribute', characterid: newC.id, name: name});
                    if (r != undefined && r.length != 0) {
                        let id = r[0].id;
                        return id;
                    } else {
                        log("Could not find attribute "+name+" in char " + newC.id);
                        return undefined;
                    }
                }
            } else {
                log("Original attribute was undefined!");
                return undefined;
            }
        };
        let newBar1 = findNewAttr(oldBar1);
        let newBar2 = findNewAttr(oldBar2);
        let newBar3 = findNewAttr(oldBar3);       
        o.token.set('represents',newC.id);
        o.token.set('bar1_link', newBar1);
        o.token.set('bar2_link', newBar2);
        o.token.set('bar3_link', newBar3);        
        setDefaultTokenForCharacter(newC,o.token);
        o.token.set('represents',oldCid);
        o.token.set('bar1_link', oldBar1);
        o.token.set('bar2_link', oldBar2);
        o.token.set('bar3_link', oldBar3);
    };

    on('chat:message',(msg)=>{
        if('api'===msg.type && playerIsGM(msg.playerid) && /^!dup-char-by-token\b/.test(msg.content)){
            if(msg.selected){
                _.chain(msg.selected)
                    .map((o)=>getObj('graphic',o._id))
                    .reject(_.isUndefined)
                    .map(o=>({token: o, character: getObj('character',o.get('represents'))}))
                    .reject(o=>_.isUndefined(o.character))
                    .tap(o=>{
                        if(!o.length){
                            sendChat('',`/w gm <div style="color: #993333;font-weight:bold;">Please select one or more tokens which represent characters.</div>`);
                        } else {
                            sendChat('',`/w gm <div style="color: #993333;font-weight:bold;">Duplicating: ${o.map((obj)=>obj.character.get('name')).join(', ')}</div>`);
                        }
                    })
                    .each(duplicateCharacter);
            } else {
                sendChat('',`/w gm <div style="color: #993333;font-weight:bold;">Please select one or more tokens.</div>`);
            }
        }
    });
});
```

#### Recommended Macros

- **Copy**: `!dup-char-by-token`
- **Backup**: `!epclean --backup --prefix ?{Prefix}`
- **Egocast**: `!epclean --egocast`

*In [Roll20 ES](https://github.com/SSStormy/roll20-enhancement-suite) Format*:
```json
{
    "schema_version": 2,
    "macros": [
        {
            "attributes": {
                "action": "!dup-char-by-token",
                "istokenaction": false,
                "name": "Copy",
                "visibleto": ""
            }
        },
        {
            "attributes": {
                "action": "!epclean --backup --prefix ?{Prefix}",
                "istokenaction": false,
                "name": "Backup",
                "visibleto": ""
            }
        },
        {
            "attributes": {
                "action": "!epclean --egocast",
                "istokenaction": false,
                "name": "Egocast",
                "visibleto": ""
            }
        }
    ]
}
```

### Character Tools
**Command**: `!epchar`

The Character Tools script deals with *Damage* (DV) and *Stress* (SV) application. It automaticaly applies wounds and traumas, and reduces DV by armour taking *Armour Penetration* (AP) into account. It also outputs information on whether or not a character needs to roll to resist knockdown or unconsciouness, if the morph is bleeding out, if new derangements are acquired, and so on.

#### Usage

##### Damage
1. Select the token you want to apply damage to.
2. Determine DV (`<DV>`), applicable armour if any (`<Armour>` from *Kinetic*, *Energy*, *Untyped*, e.g. Psi Damage, *None*, e.g. a critical success), and AP if any (`<AP>`).
3. Run `!epchar --damage <DV> --armour <Armour> --ap <AP>` or, if you want only the GM to see the output, `!epchar --damage <DV> --armour <Armour> --ap <AP> --output GM`, replacing the variables as determined in step 2.
4. Sometimes the response of the script will tell you to roll something else, based on the result of damage application. In that case you should do so, by clicking the provided roll-button.

##### Stress
1. Select the token you want to apply stress to.
2. Determine SV (`<SV>`).
3. Run `!epchar --stress <SV>` or, if you want only the GM to see the output, `!epchar --stress <SV> --output GM`, replacing the variables as determined in step 2.
4. Sometimes the response of the script will tell you to pick new derangements or upgrade existing ones, as well as roll something else, all which you should do.

#### Recommended Macros

- **DV**: `!epchar --damage ?{DV} --armour ?{Apply Armour|None|Energy|Kinetic|Untyped} --ap ?{AP|0}`
- **GMDV**: `!epchar --damage ?{DV} --armour ?{Apply Armour|None|Energy|Kinetic|Untyped}  --ap ?{AP|0} --output GM`
- **SV**: `!epchar --stress ?{SV}`

*In [Roll20 ES](https://github.com/SSStormy/roll20-enhancement-suite) Format*:
```json
{
    "schema_version": 2,
    "macros": [
        {
            "attributes": {
                "action": "!epchar --damage ?{DV} --armour ?{Apply Armour|None|Energy|Kinetic|Untyped} --ap ?{AP|0}",
                "istokenaction": true,
                "name": "DV",
                "visibleto": "all"
            }
        },
        {
            "attributes": {
                "action": "!epchar --stress ?{SV}",
                "istokenaction": true,
                "name": "SV",
                "visibleto": "all"
            }
        },
        {
            "attributes": {
                "action": "!epchar --damage ?{DV} --armour ?{Apply Armour|None|Energy|Kinetic|Untyped}  --ap ?{AP|0} --output GM",
                "istokenaction": true,
                "name": "GMDV",
                "visibleto": ""
            }
        }
    ]
}
```

### GM Tools
**Command**: `!epgmtools`

A very simple command that collects information about skill values of a set of characters and sends them to the GM in sorted order. While in more static games like D&D simple bookkeeping would be sufficient to keep track of common skills like Perception, in EP those values are affected by traumas and wounds. Thus is can be convenient to get a quick snapshot of the state of your party with respect to certain skills. Particularly Perception and Kinesics are good candidates for this as they could be used in a "passive" manner without the players necessarily knowing about a failed check.

#### Usage

##### On Tokens
1. Select all relevant tokens (e.g., all player tokens).
2. Run `!epgmtools --best-mod --skill-name <SkillName>`, replacing `<SkillName>` with `Perception` or `Kinesics, for example.`

##### By Name
See macro below.
You can also specify character ids instead of names as trailing arguments, but it's not quite as convenient, perhaps.

#### Recommended Macros

- **CharSkill**: `!epgmtools --best-mod --skill-name ?{Skill Name|Perception|Kinesics}` and append one instance of `--char-name <CharName>` for each player character in your group with name `<CharName>`

### Group Rolls
**Command**: `!epgroup-roll`

The Group Rolls scripts enables rolling basic EP rolls like *Fray/2* or *Initiative*, as well as arbitrary *Active Skills*, for a group of selected token. For all rolls, a modifier to the roll must also be specified.

#### Usage

##### Fray/2
1. Select all relevant tokens.
2. Run `!epgmtools --fray-halved --mod <Mod>`, with `<Mod>` the GM's modifier on the roll.

##### Skill
1. Select all relevant tokens.
2. Run `!epgmtools --skill <SkillName> --mod <Mod>`, with `<SkillName>` the name of the skill to roll, `<Mod>` the GM's modifier on the roll.

##### Initiative
1. Select all relevant tokens.
2. Run `!epgmtools --ini`.

Rolled results go to the tracker automatically.


#### Recommended Macros

- **GroupIni**: `!epgroup-roll --ini`
- **GroupFray/2**: `!epgroup-roll --fray-halved --mod ?{Mod|0}`
- **GroupSkill**: `!epgroup-roll --skill ?{Skill|Fray} --mod ?{Mod|0}`

*In [Roll20 ES](https://github.com/SSStormy/roll20-enhancement-suite) Format*:
```json
{
    "schema_version": 2,
    "macros": [
        {
            "attributes": {
                "action": "!epgroup-roll --ini",
                "istokenaction": false,
                "name": "GroupIni",
                "visibleto": ""
            },
            "macrobar": {
                "color": null,
                "name": null
            }
        },
        {
            "attributes": {
                "action": "!epgroup-roll --fray-halved --mod ?{Mod|0}",
                "istokenaction": false,
                "name": "GroupFray/2",
                "visibleto": ""
            },
            "macrobar": {
                "color": null,
                "name": null
            }
        },
        {
            "attributes": {
                "action": "!epgroup-roll --skill ?{Skill|Fray} --mod ?{Mod|0}",
                "istokenaction": false,
                "name": "GroupSkill",
                "visibleto": ""
            },
            "macrobar": {
                "color": null,
                "name": null
            }
        }
    ]
}
```

### Special Rolls
**Command**: `!epspecialroll`

The Special Rolls script allows EP *Success* or *Damage* rolls, without involving a character sheet. While this is mostly meant for being used via buttons generated from *EPCompendium* output, one could also create macros for custom weapons or custom rolls, for example.

#### Usage

##### Success
The Success template has the form
```text
<Character>
-----------
<Label>
    <SubLabel>
1d100 vs <Target>
[Result]
```

To generate a Success template from the Special Rolls script, run `!epspecialrolls --success --target <Target>`, picking `<Target>` to be the target number including any modifiers.

While `<Character>` is always "API" when generated from this script, you may specify both `--label <Label>` and `--sublabel <SubLabel>` arbitrarily when invoking it. If no values are given, the subtitle will read "Success Roll".


##### Damage
The Damage template has the form
```text
<Character>
-----------
<Label>
    <SubLabel>
Inflicts: [DmgFormula] DV <DamageType>
<AP> AP or ignore if critical success
```
where `[DamageFormula]` is `<DamageDice>d10/<DamageDiv> + DamageConst`.

To generate a Damage template from the Special Rolls script, run `!epspecialrolls --damage --damage-dice <DamageDice> --damage-div <DamageDiv> --damage-const <DamageConst> --damage-type <DamageType> --ap <AP>`. The allowed values for `<DamageType>` are "Kinetic" and "Energy", and it will default to "Unspecified". `<AP>` simply takes the *Armour Penetration* value as expected.

Similar to above, while `<Character>` is always "API" when generated from this script, you may specify `--label <Label>` arbitrarily when invoking it. If no values are given, the subtitle will read "Damage Roll". Values for `--sublabel` are ignored in the Damage variant.

#### Recommended Macros
None, just use the *EPCompendium* buttons.


### Token Setup
**Command**: `!eptoken`

The Token Setup script manages EP-related token abilities. It can generate these abilities for *Initiative*, *Fray/2*, and any skill.
It can also be used to clear the existing token abilities.

#### Usage

##### Setup
1. Select all relevant tokens.
2. Run `!eptoken --ini`, to add an *Initiative* token ability.
Or run `!eptoken --fray`, to add an *Fray* token ability.
Or run `!eptoken --fray-halved`, to add an *Fray/2* token ability.
Or run `!eptoken --skill <SkillName>`, to add an `<SkillName>` token ability.
Or run a combination of the above, for example `!eptoken --ini --fray`.

Normally, the script does not override existing token abilities. This behaviour can be changed by specifiying `--force`.

##### Cleanup
1. Select all relevant tokens.
2. Run `!eptoken --clear`, to delete all token abilities.

#### Recommended Macros

- **TokenActions**: `!eptoken --fray --fray-halved --ini`
- **TokenSkill**: `!eptoken --skill ?{Skill|Perception}`

If you are using *The Aaron*'s [TokenMod](https://github.com/shdwjk/Roll20API/blob/master/TokenMod/TokenMod.js) script (as you should ;), I also recommend
**TokenSetup**: `!token-mod --on showname --set bar1_link|death_rating bar2_link|wounds bar3_link|damage`

*Note that in EP you should always link tokens to sheets, as otherwise you can't keep track of wounds and traumas, which affect subsequent rolls.*

*In [Roll20 ES](https://github.com/SSStormy/roll20-enhancement-suite) Format*:
```json
{
    "schema_version": 2,
    "macros": [
        {
            "attributes": {
                "action": "!eptoken --fray --fray-halved --ini",
                "istokenaction": false,
                "name": "TokenActions",
                "visibleto": ""
            }
        },
        {
            "attributes": {
                "action": "!token-mod --on showname --set bar1_link|death_rating bar2_link|wounds bar3_link|damage",
                "istokenaction": false,
                "name": "TokenSetup",
                "visibleto": ""
            }
        },
        {
            "attributes": {
                "action": "!eptoken --skill ?{Skill|Perception}",
                "istokenaction": false,
                "name": "TokenSkill",
                "visibleto": "all"
            }
        }
    ]
}
```

### Compendium
**Commands**: `!epcompendium-data`, `!epcompendium-export`, `!epcompendium-import`

The three Compendium scripts handle the [Eclipse Phase Compendium](https://github.com/Bathtor/EPCompendium) data (formats). For them to be of any use you must have some compendium data installed. Follow the instructions in the [Installation](#installation) section for the official data and/or feel free to add your own, for example by forking the compendium and generating your own data files.

The Data and Import script are typically used together, to first find some item in the compendium and then either simply display information about it, or import it into a character sheet.

The Export script doesn't interact with the compendium itself much, but uses the same data format. It can be used to export an item (currently only morphs) from a character sheet into a textual representation. The text always gets put into the **API Text Exchange** field on the **Options** tab in the Character sheet. *Note* that this field is only visible if the *Use API Script?* option under **Sheet Settings** is checked. There are two primary uses for this export feature. One is to simply move a custom item from one character to another. The other is use it to enrich the compendium with custom items for a campaign without having to go through the [Eclipse Phase Compendium](https://github.com/Bathtor/EPCompendium) code itself.

#### Usage

##### Search
Say you are looking for an item where you vaguely know the name contains `<NAME>`, for example every pistol contains the term `Pistol`. To get a listing in the chat of all these items, ranked by "match quality", run:
```text
!epcompendium-data --search <NAME> --name-only --rank
```

If you want to search only a single category, for example *weapons*, replace `--search` with the name of the category, e.g. `--weapons Pistol`. Within a category you can also ask for a random entry via `*`, e.g. `--weapons *` will return a random weapon.

Whenever you use the `--name-only` option, the output will be a list of item names followed by two symbols: Clicking on the `?` will pull up detailed info about the item (the same info you would get without the `--name-only` option). Clicking on the `⤺` will import the item into the character sheets of all currently selected tokens. The import option is also available on the detailed view.

##### Multi-Search
You can also search for more than one item at a time, and produce a list of best matches. To so for search terms `<TERM1>`, `<TERM2>`, `<TERM3>` run:
```text
!epcompendium-data --multi-search -- <TERM1>,<TERM2>,<TERM3>`
```
The output will have the format `<TERM> -> <BEST RESULT>`, if at least one result was found.
This feature is used by the EP Sheet to create a quick list of morph *Enhancements*, for example.

##### Import
There are multiple ways to import data into character sheets associated with selected tokens. The basic command is something like:
```text
!epcompendium-import --<CATEGORY> <EXACT NAME>
```
Since typing this out for every item would be pretty error prone and tedious, the following alternative methods are recommended instead:

1. Use the import (`⤺`) buttons on search output as described above.
2. Use the macros generated with every [EP Compendium Release](https://github.com/Bathtor/EPCompendium/releases).
3. To import a custom item from the **API Text Exchange** field use `!epcompendium-import --from-sheet` instead. You don't have to specify the item category in this case, as the format used for this is self-describing. This, however, also means that you can't simply c&p things between the Compendium Script and the **API Text Exchange** field. However, the export and import formats match.

##### Export
Currently, the script only supports exporting the currently active morph instance.

1. Select all relevant tokens. (They must have an active morph!)
2. Run `!epcompendium-export --morph`.
3. Go to the **API Text Exchange** field on the **Options** tab in the Character sheet and c&p the text there to where you need it, e.g. another sheet where you want to import this morph model.

#### Recommended Macros

- **Search**: `!epcompendium-data --search ?{Search for} --name-only --rank`
- **SheetImport**: `!epcompendium-import --from-sheet`
- **SheetExport**: `!epcompendium-export --morph`
- **RandomDerangement**: `!epcompendium-import --derangement * --duration [[floor(1d10/2)]]`

Plus all the macros generated for each [EP Compendium Release](https://github.com/Bathtor/EPCompendium/releases).

*In [Roll20 ES](https://github.com/SSStormy/roll20-enhancement-suite) Format*:
```json
{
    "schema_version": 2,
    "macros": [
        {
            "attributes": {
                "action": "!epcompendium-data --search ?{Search for} --name-only --rank",
                "istokenaction": false,
                "name": "Search",
                "visibleto": "all"
            },
            "macrobar": {
                "color": null,
                "name": null
            }
        },
        {
            "attributes": {
                "action": "!epcompendium-import --from-sheet",
                "istokenaction": true,
                "name": "SheetImport",
                "visibleto": "all"
            }
        },
        {
            "attributes": {
                "action": "!epcompendium-import --derangement * --duration [[floor(1d10/2)]]",
                "istokenaction": false,
                "name": "RandomDerangement",
                "visibleto": ""
            }
        },
        {
            "attributes": {
                "action": "!epcompendium-export --morph",
                "istokenaction": false,
                "name": "SheetExport",
                "visibleto": ""
            }
        }
    ]
}
```
