# TokenReference

TokenReference is a lightweight Roll20 API script that allows users to quickly retrieve a formatted reference card for tokens on a designated page.

Instead of searching through journals or the VTT, users can call up a token’s image, character link, and GM notes directly in chat with a simple command. Useful for embedding in journal command buttons.

---

## Features

- Displays a styled reference card in chat
- Includes:
  - Token image
  - Token name
  - Character sheet link
  - GM notes (formatted and cleaned)
- Supports Markdown-style links in GM notes
- Automatically converts links into clickable chat anchors
- Handles Unicode and encoded GM notes safely
- Player-safe output:
  - Truncates GM notes at `-----`
- GM enhancements:
  - Full GM notes visible
  - Character link displays actual character name

---

## Usage

### Basic Command

`!tokenref <token name>`

Displays the reference card for a token with the given name.

- Matching is **case-insensitive**
- Requires an **exact name match**

---

### Help Command

`!tokenref --help`

Displays usage instructions in chat.

---

## Configuration

### Token Page

The script looks for tokens on a page named: **Token Page**