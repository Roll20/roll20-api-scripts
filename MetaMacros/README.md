# Meta Macros

This script extends the Roll20 macro "language" by enabling:

* comments `// like this one`
* multi-line commands, indicated by `\` at end of line
* textual inclusion of other macros using `$include macroname`
* **textual substitution macros**

Macros written in this extended format can be cross-compiled into standard Roll20 macros for execution.

Note that the term *macro* in the Roll20 context refers to scripts containing multiple commands.
We use the term *meta-macro* to refer to C-style macros (i.e. textual substitution rules).

## Syntax

#### Comments

Whenever two forward-slashes `//` are encountered, the remainder of the line is treated as a comment and stripped.

#### Multi-line commands

Whenever a backslash `\` is encountered at the end of a line, the backslash will be stripped and the line will be concatenated with the following line.

#### Including macros

The `$include macroname` command (which must appear on a line of its own) will cause the content of the macro `macroname` to be included in the current macro, in place of the `$include` command.
An exception to this is that if a macro has previously been included, it won't be included again (this prevents infinite circular includes).

#### Meta-macros

Meta-macro definitions take the format

```
$name(param_0, ..., param_n) = body
```

where `name`, `param_0` ... `param_n` are identifiers, i.e., non-empty strings consisting of alpha-numberic characters and/or `_`.
For macros without any arguments, the `(` brackets `)` can be omitted.

After a meta-macro has been defined, any occurrance of `$name(arg_0, ..., arg_n)` will be replaced with the `body` of the macro definition.
Here any occurance of `{param_0}` ... `{param_n}` in `body` will  be replaced with `arg_0` ... `arg_n`, respectively.
If `arg_0` ... `arg_n` contain any meta-macro invocations, these will be resolved first.

## Example

\_inc\_stats:

```
$bab = 6 // base attack bonus
$str = 5 // strength modifier
```

attack:

```
$include _inc_stats
$pow = ?{PA|1}*floor(1+$bab/4) // power attack
$hit(mod) = [[1d20cs>19+[[$bab+$str{mod}-$pow]]+?{AB|0}]]
$dam(str_mult,bonus) = [[1d8+[[floor($str{str_mult}){bonus}]]]]
// main hand attack gets power attack bonus
$att_main(att_mod) = $hit({att_mod}) AC for $dam(,+2*$pow) damage
// offhand attack is light weapon => no power attack
$att_off(att_mod) = $hit({att_mod}) AC for $dam(*0.5) damage

&{template:default} {{name=Full Attack}} \
{{1st (MH) = $att_main}} \
{{2nd (MH) = $att_main(-5)}} \
{{1st (OH) = $att_off}} \
{{2nd (OH) = $att_off(-5)}}
```

Here macro *attack* will be compile into

```
&{template:default} {{name=Full Attack}} {{1st (MH) = [[1d20cs>19+[[6+5-?{PA|1}*floor(1+6/4)]]+?{AB|0}]] AC for [[1d8+[[floor(5)+2*?{PA|1}*floor(1+6/4)]]]] damage}} {{2nd (MH) = [[1d20cs>19+[[6+5-5-?{PA|1}*floor(1+6/4)]]+?{AB|0}]] AC for [[1d8+[[floor(5)+2*?{PA|1}*floor(1+6/4)]]]] damage}} {{1st (OH) = [[1d20cs>19+[[6+5-?{PA|1}*floor(1+6/4)]]+?{AB|0}]] AC for [[1d8+[[floor(5*0.5)]]]] damage}} {{2nd (OH) = [[1d20cs>19+[[6+5-5-?{PA|1}*floor(1+6/4)]]+?{AB|0}]] AC for [[1d8+[[floor(5*0.5)]]]] damage}}
```

which can be executed as normal.

## Chat commands

Note that all compilation will replace any existing content of the target macro.

#### Compile a specific source-macro into a target macro

The `!compile sourceMacro targetMacro` command will compile `sourceMacro` into `targetMacro`.

#### Compile a specific source-macro

The `!compile sourceMacro` command will compile `sourceMacro` into `_sourceMacro_`.

#### Compile all source-macros

The `!compile all` command will compile all macros which (1) do not start with `_`, and (2) contain extension-specific code.

To avoid unnecessary compilation of include files, it is recommended to start their name with `_`, e.g. `_inc_common_macros`.

## Known issues

#### Escaping special characters

There is currently no way to escape character `$`, `/` or `\` to ensure they are treated as "normal" characters.

#### String literals

String literals `"like this one"` in the macro text do not receive special treatment. This means that e.g.

```
/w "Guy with//weird name" Hello weirdo!
```

will be compiled into

```
/w "Guy with
```

#### Compile all

The `!compile all` command will consider a script to contain extension-specific code if any line in that script starts with `$`,
even if this line is not an `$include` statement or meta-macro definition.
