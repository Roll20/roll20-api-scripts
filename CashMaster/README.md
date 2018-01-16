# CashMaster

A currency management script for the D&D 5e OGL sheets on roll20.net.

Please use `!cmhelp` for inline help and examples.

## Usage

First, select one or several party members. 

Then use 

- `!cm` to get an
**overview** over the party's cash, 
- `!cmshare` to **share** the money equally
between party members, converting the amount into the best combination of gold, silver and copper (this should be used in smaller stores),
- `!cmconvert` to **convert and share** the money equally between party members, converting the amount into the best combination of platinum, gold, electrum, silver and copper (this should only be used in larger stores that have a fair amount of cash),
- `!cmadd [amount][currency]` to add/subtract an equal amount of money from each selected party member,
- `!cmhoard [amount][currency]` to share a certain amount of coins between the party members. Note that in this case, no conversion between the different coin types is made - if a party of 5 shares 4 pp, then 4 party members receive one pp each, and the last member won't get anything.

### Examples

1. `!cm` will show a cash overview.
2. `!cmshare` will collect all the money and share it evenly on the members, using gp, sp and cp only (pp and ep will be converted). Can also be used for one character to 'exchange' money.
3. `!cmconvert` - same as `!cmshare`, but will also use platinum and electrum.
4. `!cmadd 50gp` will add 50 gp to every selected character.
5. `!cmhoard 50gp` will (more or less evenly) distribute 50 gp among the party members.

**Note:** If you substract more coins than a character has, the coin value will become negative. Use `!cmshare` on that one character to balance the coins (see examples below).

### Advanced uses

1. **Changing multiple values at once:** `!cmadd -1gp 10sp` will substract 1 gp and add 10 sp at the same time.
2. **Paying services:** `!cmadd -6cp` will subtract 6cp from each selected party member. Use `!cmshare` or `!cmconvert` afterwards to balance the amount of coins (e.g. it will substract 1 sp and add 4 cp if the character didn't have copper pieces before).
3. **Paying services, alternative:** `!cmhoard -50gp` will deduct 50 gp from the party in total. Again, you might have to balance negative coin amounts, like described under 1. or 2. 