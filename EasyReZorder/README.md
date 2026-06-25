# EasyReZorder

Simple z-order manipulation for Roll20 tokens, paths, and text objects.

## Requirements

- Roll20 Pro subscription (API access required)
- Anchor (optional -- for propagating z-order changes to anchored children)

## Installation

Install from the Roll20 One-Click Script Library, or paste `EasyReZorder.js` into a new API script slot.

## Commands

| Command | Description |
|---------|-------------|
| `!z-order forward [n]` | Move selected objects forward n steps (default: 1) |
| `!z-order backward [n]` | Move selected objects backward n steps (default: 1) |
| `!z-order front` | Bring selected objects to front |
| `!z-order back` | Send selected objects to back |
| `!z-order ahead-of <id>` | Move selected objects ahead of a specific object |
| `!z-order behind <id>` | Move selected objects behind a specific object |
| `!z-order check` | Show z-order index of selected objects |
| `!z-order --help` | Show command reference |

All commands accept `ignore-selected` to skip the current selection, and explicit object IDs as arguments.

## Examples

```
!z-order forward 3          -- Move selected 3 steps forward
!z-order back               -- Send selected to back
!z-order ahead-of -ABC123   -- Move selected ahead of token -ABC123
!z-order check              -- Show z-index for selected objects
```

## Anchor Integration

When Anchor is installed, EasyReZorder automatically calls `Anchor.updateZOrder()` after any reordering operation. This propagates z-order changes to children that have z-order anchoring enabled (`-z` flag).

## License

MIT
