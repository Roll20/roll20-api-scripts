# Initiative Standby

A simple script for when your encounters see a lot of turn skipping by yanking and restoring from initiative order.  

While a token is yanked, the `interdiction` icon will appear on the token and display its previous initiative order.  When it is restored, that value is consumed to reinsert it back where it was in initiative.  Ass Roll20 does not support non-digits in the status fields, it multiplies by 100 to shift the decimal place so no data is lost if you have tie-breakers configured.

- Author: [Michael Greene (Volt Cruelerz)](https://app.roll20.net/users/1583758/michael-g)
- Forum Thread: (doesn't exist yet)

## Commands
`!standby [yank|restore]` Will yank or restore the selected tokens.

## Verison History
- 1.0: Initial Release

## Alters
- `Campaign.turnorder`
- `Token.status_interdiction`