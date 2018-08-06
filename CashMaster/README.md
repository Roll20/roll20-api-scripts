# CashMaster

A currency management script for the D&D 5e OGL and 5e Shaped sheets on Roll20.net.

Please use `!cm` for inline help and examples.

## Setup

### Player Setup

1. Create a macro bar button for the command `!cm -menu`
2. Press the CashMaster button you just created.  It will display a menu in the chat log.
3. Click on your character token
4. Press the chat UI button titled Set Default Character.

### GM Setup

1. Set the character sheet setting (`OGL`, `5E-Shaped`, or `other`).
2. Create a macro bar button for the command `!cm -menu`
3. Press the CashMaster button you just created.  It will display a menu in the chat log.
4. Select the character tokens of ALL party members and companion NPCs.  Do not select pets or mounts unless the party considers them an equal member of the party (and thus should be a valid recipient for `-loot` and similar commands).  Such creatures must have full character sheets with currency fields.
5. Press the chat UI button titled Set Party to Selected.

## Player Commands

### Help Commands

- `!cm` or `!cm -help` or `!cm -h` will show this help overview
- `!cm -menu` or `!cm -tool` to bring up the user menu
- `!cm -status` or `!cm -ss` to display your current coin purse contents

### Accounting commands

A character has a tracked account if it has discrete values for its saved coins.  PCs necessarily have tracked accounts while NPCs usually do not, instead having as much gold as the DM feels is necessary at that moment.
- `!cm -transfer "[recipient character name]" [amount][currency]` or `!cm -t "[recipient character name]" [amount][currency]` to transfer coins to the recipient's tracked account.
- `!cm -invoice "[recipient character name]" [amount][currency]` or `!cm -i "[recipient character name]" [amount][currency]` to request coins to the recipient's tracked account.
- `!cm -giveNPC "[NPC Name, service rendered]" [amount][currency]` or `!cm -dropWithReason "[reason for dropping coins]" [amount][currency]` to move coins from the player's tracked account to an untracked account.

## GM Commands

In addition to the above commands, the GM has access to the following commands.

### Help commands

- `!cm` or `!cm -help` or `!cm -h` will show this help overview
- `!cm -overview` or `!cm -o` to get an **overview** over the party's cash
- `!cm -overview --usd` will also give you an overview and a rough conversion to USD (default value: 1 gp equals roughly 110 USD).

### Accounting Commands

These operations directly add and remove gold from party inventories.
- `!cm -add [amount][currency]` or `!cm -a [amount][currency]` to **add** an equal amount of money to each selected party member,
- `!cm -loot [amount][currency]` or `!cm -l [amount][currency]` to **split up** a certain amount of coins between the party members, like a found treasure. Note that in this case, no conversion between the different coin types is made - if a party of 5 shares 4 pp, then 4 party members receive one pp each, and the last member won't get anything.
- `!cm -sub [amount][currency]` or `!cm -pay [amount][currency]` or `!cm -p [amount][currency]` to let each selected party member **pay** a certain amount. The script will even try to take higher and lower coin types to get the full amount. E.g. to pay 1gp when the character has no gold, the script will use 1pp (and return 9gp), or it will take 2ep, 10sp or 100cp - or any other valid combination of coins - to pay the desired amount.

### Admin Commands

Use caution when using the below commands.
- `!cm -merge` or `!cm -m` to **merge** coins to the densest denomination possible.
- `!cm -share` or `!cm -s` to **reallocate and share** the money equally between selected party members, converting the amount into the best combination of gold, silver and copper (this should be used in smaller stores),
- `!cm -best-share` or `!cm -bs` to **reallocate and share** the money equally between selected party members, converting the amount into the best combination of platinum, gold, electrum, silver and copper (this should only be used in larger stores that have a fair amount of cash),
- `!cm -setParty` or `!cm -sp` to set the default party list.  These will be the default targets for party actions if you have nothing selected.
- `!cm -revert` or `!cm -r` reverts a given transaction id.  This is an internal command used to revert transactions.

## Tips

1. `-noToken` and `-nt` will cause CashMaster to disregard what character is selected.
2. You can use several coin values at once, e.g. `!cm -loot 50gp 150sp 2000cp` or `!cm -pay 2sp 5cp`.
3. You can combine multiple subcommands into a single chat command with a semicolon `;` between them.  For example, `!cm -add 5gp; -merge`
4. You can select multiple subjects and targets using **Advanced Mode**.  For example, `!cm -transfer -S "Billy Bob,Joe Bob" -T "Sarah Bob,Sonya Bob" -C "10gp"`.  When using multiple subjects and targets, it will perform an operation for each subject-target pair.  In that case, it will perform four transactions of 10gp each.
5. In **Advanced Mode**, you don't need to specify `-C "[amoung][currency]"` and can instead just use the standard `[amount][currency]`.  The ` -C ` currency tag allows you to specify the gp value at a particular point in the command in case you have strangley-named or inconveniently ID'd characters.
6. CashMaster will parse **both character IDs and character names**.  You can even mix and match!  If Billy Bob's ID was `-L4ncF3ych3ZLtWaY3uY`, Instead of the example in **Tip 4**, you could use `!cm -transfer -S "-L4ncF3ych3ZLtWaY3uY,Joe Bob" -T "Sarah Bob,Sonya Bob" -C "10gp"`.
7. CashMaster is compatible with `@{selected|character_id}` and `@{target|character_id}` as they will simply be parsed down to IDs.  As an example, your players could use `!cm -t -T "@{target|character_id}" 1gp` to transfer a gold amongst themselves.

## Examples

1. `!cm -overview` will show a cash overview.
2. `!cm -add 50gp` will add 50 gp to every selected character.
3. `!cm -loot 50gp` will (more or less evenly) distribute 50 gp among the party members.
4. `!cm -pay 10gp` will subtract 10gp from each selected character. It will try to exchange the other coin types (e.g. it will use 1pp if the player doesn't have 10gp).
5. `!cm -share` will collect all the money and share it evenly on the members, using gp, sp and cp only (pp and ep will be converted). Can also be used for one character to 'exchange' money.
6. `!cm -transfer "Tazeka Liranov" 40gp` will transfer 40 gp from the selected token to the character sheet named Tazeka Liranov.
7. `!cm -convert` - same as `!cm -share`, but will also use platinum and electrum.

## Credits

With thanks to [Kryx](https://app.roll20.net/users/277007/kryx)/[mlenser](https://github.com/mlenser) and [Michael G.](https://app.roll20.net/users/1583758/michael-g)/[VoltCruelerz](https://github.com/VoltCruelerz) for their contributions.
