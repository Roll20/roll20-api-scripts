# PinNote Script

The **PinNote** script sends information from linked or custom map pins to chat using any Supernotes template.  
You must have Supernotes installed.

---

## Arguments

Arguments are case-insensitive and use the format:

```
--key|value
```

---

### `--to|<target>`

Controls where the message is sent.

#### `--to|pc`

Sends a public message to chat.

- GM notes are **never included**.

---

#### `--to|gm`

Whispers the message to the GM only.

- GM notes **are included**.

---

#### `--to|self`

Whispers the message to the invoking player.

- GM notes are included **only if the invoker is a GM**.

---

If a non-GM runs the command, `--to` is ignored and treated as `pc`.

---

### `--template|<name>` (optional)

Selects a Supernotes display template.

- If omitted or invalid, the **generic** template is used silently.

---

## Examples

```
!pinnote
!pinnote --to|gm
!pinnote --to|self --template|dark
!pinnote --template|wizard
```

---

## Requirements

- Exactly **one map pin** must be selected.
  - If none are selected, the script reports an error.
  - If multiple are selected, only the first pin is used.

- The pin may be:
  - A **linked pin** (pulls data from its linked handout), or  
  - A **custom pin** (uses its Notes field).

- A custom pin must contain notes.
  - If the Notes field is empty, nothing is sent and an error is shown.

- **Supernotes must be installed.**
  - If missing, the script exits and notifies the GM.
