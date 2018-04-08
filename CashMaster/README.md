# CashMaster

A currency management script for the D&D 5e OGL and 5e Shaped sheets on Roll20.net.

Please use `!cm` for inline help and examples.

## Setup

Make sure you use the correct sheet setting (`OGL`, `5E-Shaped`, or `other`).

## Usage

First, select one or several party members. 

### Base commands

- `!cm` or `!cm -help` or `!cm -h` will show this help overview
- `!cm -overview` or `!cm -o` to get an **overview** over the party's cash
- `!cm -overview --usd` will also give you an overview and a rough conversion to USD (default value: 1 gp equals roughly 110 USD). 

### Payment commands

- `!cm -add [amount][currency]` or `!cm -a [amount][currency]` to **add** an equal amount of money to each selected party member,
- `!cm -loot [amount][currency]` or `!cm -l [amount][currency]` to **split up** a certain amount of coins between the party members, like a found treasure. Note that in this case, no conversion between the different coin types is made - if a party of 5 shares 4 pp, then 4 party members receive one pp each, and the last member won't get anything.
- `!cm -pay [amount][currency]` or `!cm -p [amount][currency]` to let each selected party member **pay** a certain amount. The script will even try to take higher and lower coin types to get the full amount. E.g. to pay 1gp when the character has no gold, the script will use 1pp (and return 9gp), or it will take 2ep, 10sp or 100cp - or any other valid combination of coins - to pay the desired amount.

### Conversion/Cleanup commands

- `!cm -share` or `!cm -s` to **convert and share** the money equally between party members, converting the amount into the best combination of gold, silver and copper (this should be used in smaller stores),
- `!cm -best-share` or `!cm -bs` to **convert and share** the money equally between party members, converting the amount into the best combination of platinum, gold, electrum, silver and copper (this should only be used in larger stores that have a fair amount of cash),


**Note:** You can use several coin values at once, e.g. `!cm -loot 50gp 150sp 2000cp` or `!cm -pay 2sp 5cp`.


### Examples

1. `!cm -overview` will show a cash overview.
2. `!cm -add 50gp` will add 50 gp to every selected character.
3. `!cm -loot 50gp` will (more or less evenly) distribute 50 gp among the party members.
4. `!cm -pay 10gp` will subtract 10gp from each selected character. It will try to exchange the other coin types (e.g. it will use 1pp if the player doesn't have 10gp).
5. `!cm -share` will collect all the money and share it evenly on the members, using gp, sp and cp only (pp and ep will be converted). Can also be used for one character to 'exchange' money.
6. `!cm -convert` - same as `!cm -share`, but will also use platinum and electrum.

## Credits

With thanks to [Kryx](https://app.roll20.net/users/277007/kryx)/[mlenser](https://github.com/mlenser) for his contributions.