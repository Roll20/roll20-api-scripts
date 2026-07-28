# ScriptKit TODO

## Planned Features

### `ScriptKit.MyScript.usage(msg)`
API that consumer scripts can call from their default/unknown-command handler. Could:
- Show the full help text (like `showHelp`)
- Fuzzy-match the unrecognized subcommand against registered commands and suggest "Did you mean X?"
- Whisper the suggestion to the player who sent the message

### CompareVersion override
- `compareVersion` override in registration opts (custom comparator for [new] badges and determining whether migrations should go up or down)
