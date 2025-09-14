# TokenGroups — Roll20 API Script (v0.7.0)

Create and manage **named groups of tokens** per page, then act on the whole group at once (move between layers, show/ping, list, purge, stats). Enhanced with ScriptCards integration for superior formatting and menus. Designed for GMs with clear menus and minimal footprint.


## Features

- **Page‑scoped groups**: a group name is tied to a single page.
- **Bulk actions**: move a whole group to `objects`, `gmlayer`, or `map`; ping/show locations.
- **Enhanced ScriptCards menus**: in‑chat buttons with superior formatting and styling.
- **Dual render modes**: HTML (basic) or ScriptCards (enhanced) formatting.
- **Stats & Purge**: see totals by page/group; remove missing token IDs from state.
- **Quoted names & `Name@Page`**: handle spaces; disambiguate duplicates across pages.
- **Startup whisper**: confirms load + enabled/disabled state to GM.
- **Small footprint**: namespaced state, no polling, minimal object writes.
- **Handout helper**: `!tgroup doc` creates/updates a GM handout with basics.

---

## Requirements

- **Roll20 Pro** (API access).
- **ScriptCards** (optional but recommended for enhanced formatting).
- Paste the TokenGroups v0.7.0 script into your game's **Settings → API Scripts → New Script**.

---

## Installation & First Run

1. Paste the script and **Save Script**. The API sandbox reloads.
2. You'll get a GM whisper like:  
   `TokenGroups v0.7.0 is loaded (currently disabled). Type !tgroup help.`
3. **Enable** the script (disabled by default, per Roll20 best practices):
   ```text
   !tgroup enable
   ```
4. (Optional) Configure render mode for ScriptCards integration:
   ```text
   !tgroup config render sc
   ```
5. (Optional) Generate a GM handout with quick instructions:
   ```text
   !tgroup doc
   ```

---

## Core Concepts

- A **group** is just a named list of token IDs on **one** Roll20 page.
- You can operate on a group from anywhere; the page doesn't need to be active.
- If a name exists on multiple pages, target with **`GroupName@PageNameOrID`**.
- Use **quotes** for names with spaces: `"Bandit Squad"`, and for pages: `"Dungeon L1"`.
- **ScriptCards mode** provides enhanced formatting, better buttons, and improved menus.

---

## Commands

### Basic Operations
| Command | Description |
|---------|-------------|
| `!tgroup help` | Show help and command list |
| `!tgroup enable` | Enable the script |
| `!tgroup disable` | Disable the script |
| `!tgroup status` | Show current status |

### Configuration
| Command | Description |
|---------|-------------|
| `!tgroup config render <html\|sc>` | Set render mode (HTML or ScriptCards) |
| `!tgroup config whisper <on\|off>` | Toggle whisper notifications |

### Group Management
| Command | Description |
|---------|-------------|
| `!tgroup create <name>` | Create group from selected tokens |
| `!tgroup add <name>` | Add selected tokens to group |
| `!tgroup remove <name[@page]>` | Remove selected tokens from group |
| `!tgroup rename <old[@page]> <new>` | Rename a group |
| `!tgroup delete <name[@page]>` | Delete a group |
| `!tgroup clear <name[@page]>` | Clear all tokens from group |

### Group Actions
| Command | Description |
|---------|-------------|
| `!tgroup move <name[@page]> <objects\|gmlayer\|map>` | Move group to specified layer |
| `!tgroup show <name[@page]>` | Show/ping group tokens |
| `!tgroup list` | List groups on current page |
| `!tgroup list all` | List all groups across all pages |
| `!tgroup list page <name\|id>` | List groups on specific page |

### Utilities
| Command | Description |
|---------|-------------|
| `!tgroup where <name[@page]>` | Find which page contains a group |
| `!tgroup purge [name\|all]` | Remove missing token IDs from state |
| `!tgroup stats` | Show overall statistics |
| `!tgroup stats group <name[@page]>` | Show group-specific stats |
| `!tgroup stats page <name\|id>` | Show page-specific stats |
| `!tgroup menu [<name[@page]>]` | Show interactive menu |
| `!tgroup doc` | Create/update GM handout |

---

## ScriptCards Integration

### Enhanced Features
- **Better formatting**: Rich text with `[b]`, `[i]`, `[c]`, `[color]`, etc.
- **Improved buttons**: Custom styling with colors and sizes
- **Enhanced menus**: ScriptCards-first design with better layout
- **Inline styles**: Superior presentation and readability

### Render Modes
- **HTML mode**: Basic HTML formatting (default)
- **ScriptCards mode**: Enhanced formatting with ScriptCards syntax

### Configuration
```text
!tgroup config render sc    # Enable ScriptCards mode
!tgroup config render html  # Use basic HTML mode
```

---

## Examples

### Creating and Managing Groups
```text
# Select some tokens, then:
!tgroup create "Goblin Squad"

# Add more tokens to the group:
!tgroup add "Goblin Squad"

# Move the entire group to the GM layer:
!tgroup move "Goblin Squad" gmlayer

# Show where the group is:
!tgroup show "Goblin Squad"
```

### Cross-Page Operations
```text
# Work with groups on different pages:
!tgroup move "Bandits@Dungeon Level 1" objects
!tgroup list page "Dungeon Level 1"
!tgroup stats page "Dungeon Level 1"
```

### Interactive Menus
```text
# Show main menu:
!tgroup menu

# Show group-specific menu:
!tgroup menu "Goblin Squad"
```

---

## Configuration Options

The script supports several configuration options:

- **enabled_on_boot**: Start enabled when API sandbox boots (default: true)
- **render_mode**: Choose between "html" or "sc" (ScriptCards) rendering
- **auto_menu**: Automatically show menu when creating/updating groups

---

## Troubleshooting

### Common Issues

1. **Script not responding**:
   - Check if script is enabled: `!tgroup status`
   - Enable if needed: `!tgroup enable`

2. **Groups not found**:
   - Use `!tgroup list all` to see all groups
   - Check page names with `!tgroup list page <name>`
   - Use `Name@Page` syntax for cross-page operations

3. **ScriptCards formatting not working**:
   - Ensure ScriptCards is installed
   - Check render mode: `!tgroup config render sc`
   - Verify ScriptCards is working with other scripts

### Debug Commands
```text
!tgroup status          # Check script status
!tgroup stats           # View overall statistics
!tgroup purge all       # Clean up missing tokens
!tgroup where <name>    # Find group location
```

---

## Support

For issues or questions:
1. Check the Roll20 API log for error messages
2. Use `!tgroup help` for command reference
3. Try `!tgroup status` to verify script state
4. Use `!tgroup doc` to generate a reference handout

---

## License

This script is provided as-is for use in Roll20 games.
