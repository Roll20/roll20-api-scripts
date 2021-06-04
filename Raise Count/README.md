## Raise Count

Counts the "raises" of a die roll for the _Savage Worlds_ game system.

Use `!rc roll target` to roll. _roll_ should be a dice expression (do **not** include `/r`, `/roll`, or inline roll brackets `[[]]`), while _target_ should be the target number of the roll.

### Output Format

You can change the formatting of the script's output message by altering the `Output Format` string. In the string, `{0}` will end up as an inline roll, `{1}` will be _target_, and `{2}` will be the number of raises that resulted from the roll.

### Raise Size

You can chage the size of raises by modifying `Raise Size`.