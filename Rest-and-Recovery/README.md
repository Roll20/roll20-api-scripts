# Rest and Recovery
A Roll20 API script to handle recovery on the resource attributes on the D&D 5th Edition by Roll20 sheet.
To use this script, resources must include a code in their name, separated from the name by a plus sign. You can include standard dice expressions as well. "1d6" is used in all examples, but you can do 2d6+3, 3d20, etc. Here are examples of the commands given and the codes that are affected.

## !r-short
*Used for Short Rest*

**+SR** This resource will return to its maximumm value

**+SR1d6** This resource will add 1d6 to the resource up to its maximum value


## !r-long
*Used for Long Rest*

**+LR** This resource will return to its maximumm value

**+LR1d6** This resource will add 1d6 to the resource up to its maximum value


## !r-Charges
*used for restoring charges that are user-controlled, such as "at dawn" or "under a full moon".

**+1d6**


## !r-Ammo
no code is used here. The script looks for common ammo types: Crossbow bolts, Arrows, Bullets, etc. It rolls 1d2 for each piece of ammo expended. If the result is a "2", the ammo is recovered. The max and current values are adjusted to reflect the new total.


## Special Cases
Finally, the following special cases exist. Class Resources that have any of the following names are recognized and handled appropriately:

### These are recovered on a Short or Long Rest:
- Spell Slots, Warlock Spell Slots
- Channel Divinity
- Wild Shape
- Superiority Dice
- Ki Points, Ki

 ### These are recovered on a Long Rest.
- Rages
- Lay on Hands
- Sorcery Points



**Bardic Inspiration** needs a +SR or +LR code, since the recovery rate changes at fifth level
