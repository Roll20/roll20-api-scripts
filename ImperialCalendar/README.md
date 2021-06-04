ImperialCalendar provides a fully featured calendar as used in Traveller, Stars without Number, and other scifi games.  It supports notes (public, private, and player specific) and various display formats.

## Commands

```!cal [<--help|--details|--sparse|--whisper|--set|--note|--remove-note|--show|--show-week|--show-4week|--show-5week|--show-year>|<parameter> ...]```

```!wcal``` -- An alias for `!cal --whisper`;

### Date Format

ImperialCalendar uses dates of the format `<day>-<year>`, such as `023-1116`.  The leading `0`s are optional, so `001-0001` is the same as `1-1`.  Anywhere you can use a date, you can also use a relative date by using a number prefixed by either `+` or `-`.  These numbers will be used as a day offset from the current day.  You can further suffice these numbers with one of `d`,`w`,`y` to specify days (default), weeks, or years.  (`D`,`W`,`Y` also work.)  In most cases, the `+` is also optional.  In fact, you can leave off the number and only specify a suffice.  `+7d` is the same as `7d`, `+7`, `d`, `D`, `+d`, `+D`, `+1w`, etc.

### Display

There are two display modes: **Calendar** and **Journal**.

#### Calendar
Shows you days on a grid.  Hover on a day to see it's notes (days with notes have a green background).  Click a day to see the journal for that day.

#### Journal
Shows you the notes for the day or days.  Notes have a button allowing the owner to delete them.  There are buttons by each day for adding notes of each permission type.

### Setting the Date
* `!cal --set|<date>` (GM Only) -- Use `--set` to adjust the current day.  The current day is what all relative days are calcualted from and is highlighted yellow in the display.  Anywhere you can omit the day in a command, the current day is used instead.  If you specify an invalid day, the current day is used. 
	```
	!cal --set|023-1116
	!cal --set|+1w
	```

### Show Commands

`--show[|<date>[|<date> ..]]` -- use `--show` to show a day.

`--show-week[|<date>]` -- Show the week (Monday-Sunday or the Holiday week) surrounding the provided date or the current date.

`--show-4week[|<date>]` -- As above, but shows also 1 week prior and 2 weeks hence from the date.

`--show-5week[|<date>]` -- As above, but shows 2 weeks prior and 2 weeks hence.

`--show-year[|<date>]` -- Shows the full year including the date.  
* **Note:** This is the only command that will treat a bare number as a year. `!cal --show-year|1116` is equivolent to `!cal --show-year|001-1116`.

`--between|<date>|<date>` -- Shows all the days between the two dates.  Relative dates are still realtive to the current day.

#### Modifiers

`--details` -- Causes a list of days and notes to be shown, rather than a grid caldendar. (This is the default for `--show`)

`--sparse` -- Causes a detail view to omit any days without notes.

#### Examples
* `!cal --show` -- show's the current date.
* `!cal --show|+1d` -- show's tomorrow.
* `!cal --show|-1w` -- show's a week ago.
* `!cal --show|1-1116|10-1116|16-1116` -- show's the 1st, 10th, and 16th days of the year 1116.
* `!cal --show-week` -- show's the current week.
* `!cal --show-week|+w` -- show's next week.
* `!cal --show-year` -- show's the current year.
* `!cal --between|023-1116|043-1116` -- shows all the days from the 23rd to the 43rd of the year 1116.
* `!cal --between|023-1116|043-1116 --details --sparse` -- Shows the days with notes from the 23rd to the 43rd of the year 1116.

#### Whisper Examples
* `!wcal --show` -- Whisper the current day.  Whispering is the only time that notes other than public notes are displayed.
* `!cal --show --whisper` -- Idential to the above.


### Note commands
`--note[|day][[|who] ...]|<note text>` -- adds a note.  If you omit the day, it is added for the current day.  You can specify who can see a note.  Use `gm` or `private` for a gm only note (also the default, you can just leave it off), `all` for a public note, or some part of a player's name to restrict it to just the matching players.  You can specify multiple `|` separated players.

`--remove-note[|day]|<all|index>` -- removes a note.  If you omit the date, it removes from the current day.  If you specify `all`, it will remove all the notes you created on that day (or all notes if you are the gm). If you specify a number, it will remove that index from the specified day (counting from the beginning, starting at 0).

#### Examples
* `!cal --note|all|Hi everyone` -- adds a note on the current day for all players.
* `!cal --note|Secret note.` -- adds a note for just the GM.
* `!cal --note|tom|Tom's note.` -- adds a note for all players with `tom` in there name (ignoreing spaces and capitalization).
* `!cal --note|sally|tom|bob|Small group note.` -- adds a note for 3 or more players.
* `!cal --note|10-1116|Bomb goes off.` -- adds a GM note on the 10th of the year 1116.
* `!cal --note|10-1116|all|A good day to be off planet.` -- adds a note for all players on the 10th of the year 1116.
* `!cal --remove-note|0` -- removes the first note on the current day.
* `!cal --remove-note|all` -- removes all the notes on the current day.


## Settings

The settings are accessible via the help screen using `!cal --help`.

### Tool Tips

You can toggle the tool tips on the buttons in the `--details` display.  Once you know what the buttons do, the tool tips are a bit annoying.  Click the toggle button to adjust them.

### Day Names

Click the name button to change the name.


