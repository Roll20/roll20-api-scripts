# HeroTracker


HeroTracker implements the turn sequence of the Hero Games system.  The Hero Games system utilizes a segment chart with 12 phases.  A character's speed determines how many and on which phases he/she gets to act.  HeroTracker will add a token to the Roll20 tracker multiple times to simulate this mechanic.


You can select one or more tokens, specify a single token id (**--id**), or create a custom label (**--tag**).

If you select tokens, the speed and dex will be derived from the token itself, using the attributes **SPD** and **DEX** respectively.

If you specify a single token or create a custom label, you must provide a speed and optionally dex.

---
To add tokens to the initiative tracker, select one or more tokens and then enter the chat command.


**!ht --add**

---
To remove entries, select one or more tokens and enter the chat command:

**!ht --remove**

---
Alternately, you can specify a single token by its ID rather than selecting it. For example, to add a specific token, selected or not, enter this chat command:

**!ht --add --id -L9sBx-soK0CQzQYCiFA**

---
You can also add a static label to the tracker by entering this chat command:

**!ht --tag GAS-EFFECT --speed 4**

---
When adding a token, the speed and dex will be automatically derived from the token's attributes. However, you can override this by specifying your own speed and dex:

**!ht --add --speed 6 --dex 18**

---
You can add a token or label to just one segment by using this chat command:

**!ht --add --tag POST --segment 13**

---
Because the tracker can end up with a great many entries, it would normally create a cumbersome problem to cycle through the entire list should you accidentally move past a turn that isn't complete. As such, HeroTracker includes an option to rollback the tracker one turn:

**!ht --back**

---
HeroTracker uses dex to break ties by appending a decimal value to the token's speed. The value is just the dex subtracted from 100. If you do not want to use this feature, you can specify a dex of zero using this command:

**!ht --add --dex 0**

---
By default, HeroTracker uses the character sheet fields **SPD** and **DEX** to derive the speed and dex values. You can override and choose your own field names using the parameters **--speed_field** and **--dex_field**. This can also be used for characters that use a different attribute to break ties, such as ego based characters. The command would look like this:

**!ht --add --dex_field EGO**

---
A custom label MUST have a speed specified. It does not default to zero.

---
HeroTracker does not sort the tracker. Do that using the tracker' own sort feature.

---

### Syntax


**!herotracker** <_parms_>

**!ht** _parms_

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
