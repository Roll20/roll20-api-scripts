## Interpreted sendChat

Provides a function for other scripts to use to assist in sending messages to the chat. This script is not intended to stand alone.

`bshields.sendChat` will send a message as the same user or character that was used in the message object passed as the first parameter. This is useful for sending messages on behalf of a user in response to an API command, for example.