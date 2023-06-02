### Roll20-GreaterInvisibility
*Version 0.1.0*

A simple tool to add show invisibility for tokens in your game.

#### Features

- Converts all tokens on "GM" and "Objects" layer to multi-sided tokens, adding the "Invisible Token" image
- Supports toggling mutlipe tokens
- Adds Token Macro for `--toggle` automaticlly for users to toggle their own invisibility

#### Limitations

- Uses `aura_2` from tokens to indicate where a token is for controlling player when invisible.
- Does not automatically appear when character acts.
- Always defaults to side `1` on multi-sided tokens when reappearing, regardless of which side they were on when disappeard;

#### Usage

##### Configuration

1. Download and import to your art library a "Blank .png" image (like [THIS ONE](https://commons.wikimedia.org/wiki/File:Empty.png))
2. Drop the image onto a page as a token, select the token, and hit `z`.  Then right click on the image and select "Copy Image Url" to get the art library URL
3. Type `!gi --config` to configure your "Invisible Token" image and paste the art library URL from step 2.

##### Creating Tokens

1. Add any token to the "GM" or "Objects" layer.  The token will automatically be converted to a multi-sided token (if not already) with the "Invisible Token" image set as the first image

##### Commands

1. Select any number of tokens
2. Type `!gi [--toggle|--appear|--disappear]` to update all selected tokens
  - `--appear`: flips all selected tokens to `currentSide = 1` and makes them visible
  - `--disappear`: flips all selected tokens to `currentSide = 0` and makes them all invisible
  - `--toggle`: changes all selected tokens from `currentSide` of `1 -> 0` or `0 -> 1`