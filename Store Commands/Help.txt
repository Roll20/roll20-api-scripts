## Store Commands

Use `!delay time` (where _time_ is some number of milliseconds) to set the default delay between commands. If `!delay` is not used, nor is the _time_ parameter passed to `!store`, the time delay will be 500ms (0.5s).

Use `!store -time command` or `!store command` to store a command. The command stored can be anything, including commands that are normally GM-only such as /direct or /emas. This will not give you access to API commands whose scripts restrict their use to GMs.

Use `!clearstore` to clear the series of stored commands. This is the only way to remove commands from the sequence, meaning you can also use this script to store a series of commands you want to use over and over. Note that command sequences do not persist between game sessions, but they are unique per-player.

Use `!echostore` to see a list of the commands in your serquence.

Use `!run` to run the commands.