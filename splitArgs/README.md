## splitArgs

Provides a function for splitting arguments of an API command. This script is not intended to stand alone. As a convenience, this function has been added to the String prototype.

This function is particularly useful for tokenizing API commands, as it allows the user to quote arguments. For example, `!command with parameters, "including 'with quotes'"` would be split into the array `["!command", "with", "parameters,", "including 'with quotes'"]`.