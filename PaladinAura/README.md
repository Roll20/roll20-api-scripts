# Paladin Aura API

[![Version Button](https://badgen.net/https/gitlab.com/LaytonGB/Paladin-Aura-API/-/raw/master/builder/package.json?cache=300)](https://gitlab.com/LaytonGB/Paladin-Aura-API/-/raw/master/PaladinAura.js) [![Sponsor Button](https://badgen.net/badge/Sponsor%20me%20a%20Coffee/PayPal/?color=pink)](https://paypal.me/LaytonGB)

A Roll20 API that automatically shows when a token is in range to receive a Paladin's aura-bonus, and reminds users in the chat when the bonus should be applied.

Depreciated version (not optimized enough to work properly): [Roll20 Forum](https://app.roll20.net/forum/post/8228820/script-d-and-d-5e-ogl-sheet-paladin-aura/?pagenum=1) | [GitHub](https://github.com/LaytonGB/PaladinAura)

## Notes

The API is only compatible with the [D&D 5E by Roll20](wiki.roll20.net/D%26D_5E_by_Roll20) Sheet.

The API only runs on the player-ribbon page.

If a token that represents a character is manually included / excluded from a paladin's aura, it will apply to all of that character's tokens. For more, see [Aura-Bonus Inclusions / Exclusions](#aura-bonus-inclusions--exclusions).

## Usage

The API requires next-to-no user input. By default, measurements are calculated based on the page measurement settings, and any token that represents a non-npc will be granted a paladin's aura bonus.

### Aura-Bonus Inclusions / Exclusions

The paladin aura can be toggled for any token by the paladin. To do so, select the paladin token, and use the character ability that appears at the top of the screen: `~ToggleAuraTarget`

You will be prompted to select a target. Once you do so, whether the target is affected by the selected paladin's aura will be toggled. If the target has a character sheet, this will also apply to any other tokens representing that sheet.

### Saving Throws

When a saving throw is made using the Roll20 5E OGL Sheet template (even if the roll came from the Beyond20 browser plugin) the API will try to find a token who's name contains the first name of the name attached to the roll template. Upon finding one or more token(s), it will post to chat to remind the player of the aura-bonus.

## Issues

Either leave a message on the [API Forum Post](https://app.roll20.net/forum/post/9112039/script-paladin-aura-5e-d-and-d-api/?pagenum=1) or a [New Issue Report](https://gitlab.com/LaytonGB/Paladin-Aura-API/-/issues/new "Create a new issue report") on GitLab and I'll reply as soon as I can.

## Updates

1.1.2 - Bug fix for multi-class.

1.1.1 - Remove accidental log that was left over from bug fix.

1.1.0 - Patch a bug that causes a crash for some people (reason unknown).

1.0.2 - Character sheet saving throws are now detected.

1.0.1 - Improve chat output when a page is loaded.
