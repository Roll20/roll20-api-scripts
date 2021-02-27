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


## !r-charges
*used for restoring charges that are user-controlled, such as "at dawn" or "under a full moon".

**+1d6**


## !r-ammo
no code is used here. The script looks for common ammo types: Crossbow bolts, Arrows, Bullets, etc. It rolls 1d2 for each piece of ammo expended. If the result is a "2", the ammo is recovered. The max and current values are adjusted to reflect the new total.

## !r-help
This will display the basic help syntax in chat.

## !r-list
This will list every resource that can be recovered without using a code. The script will recognize by name almost every recoverable class resource from an official sourcebook with the exception of ties such as Ravnica or Acquisitions, Inc.


### Short Rest Class Resources
Spell Slots, Warlock Spell Slots, Spell Points, Channel Divinity, Wild Shapes, Second Wind, Action Surge, Superiority Dice, Ki, Ki Points, Visions of the Past, Enthralling Performance, Words of Terror, Unbreakable Majesty, Spirit Totem, Arcane Shot, Detect Portal, Ethereal Step, Magic-Users Nemesis, Favored by the Gods, Wind Soul, Bladesong, Blade Song, Arcane Abeyance, Illusory Self, Shapechanger, Fey Step, Hidden Step, Firbolg Magic, Stones Endurance, Saving Face, Grovel Cower and Beg, Hungry Jaws, Fury of the Small, Breath Weapon, Psi-Powered Leap, Shadow Martyr, Invoked Cloud Rune, Invoked Fire Rune, Invoked Frost Rune, Invoked Stone Rune, Whispers of the Dead

### Long Rest Class Resources
Rage, Rages, Lay on Hands, Sorcery Points, Flash of Genius, Divine Intervention, Eyes of the Grave, Warding Flare, Wrath of the Storm, Cleansing Touch, War Priest Attack, Sentinel at Deaths Door, Embodiment of the Law, Universal Speech, Mantle of Majesty, Indomitable, Infectious Inspiration, Shadow Lore, Balm of the Summer Court, Natural Recovery, Fungal Infestation, Hidden Paths, Walker in Dreams, Faithful Summons, Fighting Spirit, Warding Maneuver, Strength Before Death, Unwavering Mark, Wholeness of Body, Glorious Defense, Undying Sentinel, Invincible Conqueror, Holy Nimbus, Living Legend, Emissary of Redemption, Elder Champion, Avenging Angel, Dread Lord, Hunters Sense, Unerring Eye, Spell Thief, Strength of the Grave, Tides of Chaos, Unearthly Recovery, Mystic Arcanum-6th, Mystic Arcanum-7th, Mystic Arcanum-8th, Mystic Arcanum-9th, Eldritch Master, Chronal Shift, Momentary Stasis, Benign Transposition, Instinctive Charm, Power Surge, Violent Attraction, Event Horizon, Necrotic Shroud, Radiant Soul, Radiant Consumption, Healing Hands, Duergar Magic, Dancing Lights, Faerie Fire, Darkness, Blessing of the Raven Queen, Mingle with the Wind, Merge with Stone, Reach to the Blaze, Burning Hands, Githyanki Psionics, Jump, Misty Step, Githerazi Psionics, Shield, Detect Thoughts, Control Air and Water, Poison Spray, Animal Friendship, Hellish Rebuke, Relentless Endurance, Luck, Arcane Jolt, Guardian, Perfected Armor Guardian, Restorative Reagents, Chemical Mastery, Magic Awareness, Magic Awareness, Performance of Creation, Animating Performance, Emboldening Bond, Eyes of Night, Steps of Night, Guiding Bolt, Cosmic Omen, Cauterizing Flames, Blazing Revival, Unleash Incarnation, Psionic Energy dice, Psi-Powered Leap, Shadow Martyr, Reclaim Potential, Bulwark of Force, Telekinetic Master, Telekinesis, Engraved Cloud Rune, Engraved Fire Rune, Engraved Frost Rune, Engraved Stone Rune, Engraved Hill Rune, Engraved Storm Rune, Inscribed Cloud Rune, Inscribed Fire Rune, Inscribed Frost Rune, Inscribed Stone Rune, Inscribed Hill Rune, Inscribed Storm Rune, Invoked Cloud Rune, Invoked Fire Rune, Invoked Frost Rune, Invoked Stone Rune, Invoked Hill Rune, Invoked Storm Rune, Giant's Might, Runic Shield, Master of Runes, Hand of Ultimate Mercy, Harness Divine Power, Glorious Defense, Living Legend, Mortal Bulwark, Fey Reinforcements, Summon Fey, Misty Wanderer, Misty Step, Writhing Tide, Swarming Dispersal, Whispers of the Dead, Wails from the Grave, Ghost Walk, Psychic Veil, Rend Mind, Warping Implosion, Restore Balance, Trance of Order, Clockwork Cavalcade, Tentacle of the Deeps, Tentacle, Grasping Tentacles, Evard's Black Tentacles, Fathomless Plunge, Bottled Respite, Elemental Gift, Bladesong, Awakened Spellbook, Manifest Mind, One with the Word

### Ammo Types
Crossbow bolts, Arrows, Bullets, Sling Bullets, Needles, Darts


**Bardic Inspiration** needs a +SR or +LR code, since the recovery rate changes at fifth level
