## Concentration

This is a community-maintained fork of Robin Kuiper's Concentration script.
It preserves the original command structure while updating documentation for current Roll20 Legacy and Beacon sheet behavior.

Concentration tracks character concentration and reminds players to make concentration checks.

It supports manual concentration toggling, automatic marker application from compatible spell cards, HP-loss concentration reminders, and optional save rolling.

### Supported Sheets

- D&D 2014 / 5e OGL-style sheets
- D&D 2024 / Beacon sheets

---

### Beacon Notes

- D&D 2024 / Beacon support may require the Experimental API server.
- Roll20 can change Beacon roll and chat output over time, which may affect automatic spell detection.
- Enable Debug Mode from the Config Menu when you need to capture why a spell card did or did not trigger concentration.
- See [docs/beacon-compatibility.md](docs/beacon-compatibility.md) for compatibility expectations and diagnostic guidance.

![Concentration Reminder](images/concentration-reminder.png 'Concentration Reminder')
![Spell Cast](images/spell-cast.png 'Spell Cast')

---

### Commands

| Command                                          | Who Can Use                | Description                                                                                                                     | Accepted Values                                                                                                       |
| ------------------------------------------------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `!concentration`                                 | GM, Players (with control) | GM: shows Config Menu if no tokens are selected. GM/Players: toggles concentration status marker on selected controlled tokens. | No extra values.                                                                                                      |
| `!concentration <spell name>`                    | GM, Players (with control) | Toggles concentration status marker on selected controlled tokens and includes spell name in announcement.                      | Any short text spell name (HTML characters are sanitized).                                                            |
| `!concentration config <key>\|<value>`           | GM                         | Updates a config setting.                                                                                                       | Chat command syntax is `!concentration config key\|value`; keys and values are listed in the Config Keys table below. |
| `!concentration reset`                           | GM                         | Resets saved script state/config to defaults.                                                                                   | No extra values.                                                                                                      |
| `!concentration advantage-menu`                  | GM                         | Opens the Advantage Menu.                                                                                                       | No extra values.                                                                                                      |
| `!concentration toggle-advantage <character_id>` | GM                         | Toggles saved Auto Roll Save advantage for a character.                                                                         | `<character_id>` must be a valid existing Roll20 character id.                                                        |
| `!concentration roll <pending_roll_id>`          | GM (normally via button)   | Resolves a pending concentration roll button without advantage.                                                                 | `<pending_roll_id>` format: `pr_<timestamp>_<suffix>`.                                                                |
| `!concentration advantage <pending_roll_id>`     | GM (normally via button)   | Resolves a pending concentration roll button with advantage.                                                                    | `<pending_roll_id>` format: `pr_<timestamp>_<suffix>`.                                                                |

---

### Config Keys

| Key                             | Purpose                                                           | Accepted Values                          |
| ------------------------------- | ----------------------------------------------------------------- | ---------------------------------------- |
| `command`                       | Main chat command keyword.                                        | 1-32 chars: letters, numbers, `_`, `-`   |
| `statusmarker`                  | Status marker used for concentration.                             | Any marker from the Marker dropdown menu |
| `bar`                           | HP bar watched for damage.                                        | `1`, `2`, `3`                            |
| `send_reminder_to`              | Where reminders/check prompts are sent.                           | `everyone`, `character`, `gm`            |
| `auto_add_concentration_marker` | Auto-mark on detected concentration spell.                        | `true`, `false`                          |
| `auto_roll_save`                | Automatically roll concentration saves.                           | `true`, `false`                          |
| `bonus_attribute`               | Attribute used for save modifier lookup.                          | Non-empty attribute name                 |
| `show_roll_button`              | Show Roll/Advantage chat buttons when Auto Roll Save is disabled. | `true`, `false`                          |
| `debug`                         | Enables debug output.                                             | `true`, `false`                          |
| `support_mode`                  | Debug verbosity level.                                            | `basic`, `detailed`                      |

---

### Config

![Config Menu](images/config-menu.png 'Config Menu')

- **Command** - The command this script listens for.
- **Status Marker** - The status marker used to indicate concentration.
- **HP Bar** - The HP bar monitored for damage.
- **Send Reminder To** - Who receives concentration reminders.
- **Auto Add Con. Marker** - Automatically adds the concentration status marker when a concentration spell is cast.
- **Auto Roll Save** - Automatically rolls the concentration save.
- **Bonus Attribute** - The attribute used for the save modifier (defaults to the 5e OGL constitution saving throw modifier).
- **Show Roll Button** - Shows Roll and Advantage buttons when Auto Roll Save is disabled.
- **Debug Mode** - Writes focused debug logs for spell detection, character resolution, and save modifier lookup.
- **Support Mode** - Controls debug detail level when Debug Mode is enabled.
  - **Basic**: concise support-friendly output.
  - **Detailed**: full structured diagnostics.
- **Advantage Menu** - Shows a list of characters where you can toggle advantage for Auto Roll Save concentration checks.

---

### Troubleshooting

Detailed troubleshooting steps are also available in [docs/troubleshooting.md](docs/troubleshooting.md).

- **Manual command works but spells do not auto-trigger**
  Turn on Debug Mode, cast the spell again, and capture the API log output. Beacon spell detection depends on Roll20's current chat markup.
- **HP loss does not trigger checks**
  Verify that the token has the configured concentration status marker and that the configured HP bar matches the bar being reduced.
- **CON modifier is 0**
  Check the configured Bonus Attribute. If the attribute is missing or non-numeric, the script falls back to `0` and logs the reason in Debug Mode.
- **Nothing happens on the D&D 2024 sheet**
  Confirm whether the game is using the Default or Experimental API server. Current Beacon support may require the Experimental API server.
- **Experimental API server is not active**
  Automatic Beacon spell detection may fail even though manual toggling and HP-loss checks still work.
- **Token is not linked to a character**
  Manual toggling still works, but sheet-derived CON save modifiers and represented-token syncing are limited for unlinked tokens.
- **Duplicate character names**
  The script uses the first exact name match as a fallback and logs a warning in Debug Mode. Unique character names are safer.

---

### Testing Checklist

The full v1.0.0 manual test matrix is in [docs/testing-checklist.md](docs/testing-checklist.md).

---

### Known Limitations

- Beacon roll and chat HTML may change over time and can break automatic spell detection until patterns are updated.
- Auto-detection depends on Roll20 spell-card output and cannot guarantee perfect matching for every custom macro format.
- Duplicate character names can cause fallback ambiguity; the script logs a warning and uses the first exact match.
- Unlinked tokens can be toggled manually but cannot provide reliable sheet-derived CON save modifiers.
- If the configured bonus attribute is missing or non-numeric, the modifier falls back to `0`.

---

### Support Request Format

```markdown
## Sheet and API Environment

- Sheet: D&D 2014 / D&D 2024 / Other
- API server: Default / Experimental
- Concentration version:
- Other related scripts:

## What happened

## What you expected

## Spell or action used

## Debug output

Paste relevant debug output, anonymizing character names if needed.
```

![Auto Roll](images/auto-roll.png 'Auto Roll')
![Advantage](images/advantage-menu.png 'Advantage')

---

[![Become a Patron](https://c5.patreon.com/external/logo/become_a_patron_button.png 'Become a Patron')](https://www.patreon.com/bePatron?u=10835266)

---

## Credits

### Creator Information

Original Author: Robin Kuiper

| Platform       | Details                                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------- |
| Skype          | RobinKuiper.eu                                                                                 |
| Discord        | Atheos#1095                                                                                    |
| Discord Server | https://discord.gg/AcC9VME                                                                     |
| Roll20 Profile | https://app.roll20.net/users/1226016/robin                                                     |
| Roll20 Wiki    | https://wiki.roll20.net/Script:Concentration                                                   |
| Roll20 Thread  | https://app.roll20.net/forum/post/6364317/script-concentration/?pageforid=6364317#post-6364317 |
| GitHub         | https://github.com/RobinKuiper/Roll20APIScripts                                                |
| Reddit         | https://www.reddit.com/user/robinkuiper/                                                       |
| Patreon        | https://patreon.com/robinkuiper                                                                |
| PayPal         | https://www.paypal.me/robinkuiper                                                              |

### Maintainer

Refactored and Maintained for v1 by Steve Roberts (AKA MidNiteShadow7)

---
