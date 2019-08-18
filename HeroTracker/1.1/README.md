# HeroTracker


HeroTracker implements the turn sequence of the Hero Games system.  The Hero Games system utilizes a segment chart with 12 phases.  A character's speed determines how many and on which phases he/she gets to act.  HeroTracker will add a token to the Roll20 tracker multiple times to simulate this mechanic.

### Syntax


```!herotracker <parms>```

```!ht <parms>```

### Parameters:

* **--help**
* **--add**
* **--remove**
* **--id** <_token_id_>
* **--tag** <_label_>
* **--speed** <_number_>
* **--dex** <_number_>
* **--segment** <_number_>
* **--speed_field** <_name_>
* **--dex_field** <_name_>
* **--back**

---
To add tokens to the initiative tracker, select one or more tokens and then enter the chat command.


```!ht --add```

---
To remove entries, select one or more tokens and enter the chat command:

```!ht --remove```

---
Alternately, you can specify a single token by its ID rather than selecting it. For example, to add a specific token, selected or not, enter this chat command:

```!ht --add --id -L9sBx-soK0CQzQYCiFA --speed 5```

---
You can also add a static label to the tracker by entering this chat command:

```!ht --tag GAS-EFFECT --speed 4```

---
When adding a token, the speed and dex will be automatically derived from the token's attributes. However, you can override this by specifying your own speed and dex:

```!ht --add --speed 6 --dex 18```

---
You can add a token or label to just one segment by using this chat command:

```!ht --add --tag POST --segment 13```

---
Because the tracker can end up with a great many entries, it would normally create a cumbersome problem to cycle through the entire list should you accidentally move past a turn that isn't complete. As such, HeroTracker includes an option to rollback the tracker one turn:

```!ht --back```

---
Hero System begins a turn at segment 12. You can sort the tracker, with segment 12 at the top of the order, by using this command:

```!ht --start```

---
HeroTracker uses dex to break ties by appending a decimal value to the token's speed. The value is just the dex subtracted from 100. If you do not want to use this feature, you can specify a dex of zero using this command:

```!ht --add --dex 0```

---
By default, HeroTracker uses the character sheet fields **SPD** and **DEX** to derive the speed and dex values. You can override and choose your own field names using the parameters **--speed_field** and **--dex_field**. This can also be used for characters that use a different attribute to break ties, such as ego based characters. The command would look like this:

```!ht --add --dex_field EGO```

---
### Notes

The speed and dex of a selected token will be derived from the token's attributes **SPD** and **DEX** respectively.

If you specify a single token using the **--id** parameter, or create a custom label using the **--tag** parameter, you must also provide a speed or segment, and optionally a dex.

Entries are added (collated) into the existing initiative order without resorting.  So if you were just starting segment 5 and a new character enters the combat, you can add the new character normally and the turn order will still be at the start of segment 5.  This also makes it easy to change a token's speed or dex in the middle of a turn if needed.  So, for example, if a character was effected by a Drain SPD attack that reduced his SPD to 2, you would select the character's token and enter the following command:

```!ht --add --speed 2```

The following macro can be used to initiate combat with all selected tokens, beginning with segment 12:

```
!ht --add --tag SEGMENT --speed 12
!ht --add --tag POST_RECOVERY --segment 13
!ht --add --start
```