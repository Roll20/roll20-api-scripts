# Fallout Terminal

_v1.1 Updates:_
* There are now useroptions to specify the colors for the terminal screens.

With this script, you can set up a token to display an interactive
Fallout-like terminal in the chat.

## Creating a Terminal

To create a terminal, create a token whose name starts with 'terminal'
and copy-paste the JSON defining your terminal's content into its gmnotes.

## Activating a Terminal

When this script is installed, it creates a 'displayTerminal' token macro
for all the GM players. Just select the terminal's token and click the
token macro to activate the terminal.

## Terminal JSON specification

The JSON for defining a terminal's content has the following structure:

```
{
  "name": String, // The name of the terminal.
  "content": String, // The content of the terminal's first screen.
  "locked": [Boolean], // Whether the terminal is locked. Default false.
  "password": [String], // The password for the locked terminal.
  "attempts": [Number], // The number of attempts allowed to guess the locked terminal's password.
  "screens": [{ // The screens or screen IDs that the initial screen can access.
    {
      "name": String, // The name of this screen.
      "content": [String], // The content of this screen.
      "screens": [more screens] // Additional screens that can be accessed from this screen.
    }
  }]
}
```

### Terminal JSON Example

For an example of JSON used to display a terminal, see the example here:
https://raw.githubusercontent.com/Roll20/roll20-api-scripts/master/FalloutTerminal/example.json
