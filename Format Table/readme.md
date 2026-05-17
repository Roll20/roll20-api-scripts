# Format Table

**Format Table** is a Roll20 API script that applies clean, consistent styling to all HTML tables inside a handout. It supports multiple prebuilt style presets tailored for popular tabletop systems and formatting conventions.

---

## Features

- Apply predefined visual styles to handout tables
- One-command formatting for all tables in a handout
- Interactive UI for easy style selection
- Supports multiple RPG systems and generic formats

---

## Usage

### Basic Command (UI Mode)

`!format-table`

Opens an interactive control panel with buttons for each available style. You will be prompted to enter a handout name or ID.

---

### Direct Command

!format-table --style|STYLE --handout|HANDOUT

#### Arguments

- `--style`  
  Name of the style to apply

- `--handout`  
  Handout name (case-insensitive) or ID

---

### Example

!format-table --style|5e --handout|Monster Stats

---

### Help Command

!format-table --help

Displays usage instructions and a list of available styles.

---

## Available Styles

The script includes the following built-in styles:

- `5e`
- `5.5e`
- `Wikitable`
- `Pathfinder 2`
- `OSR`
- `DnD 3`
- `Minimal`
- `Invisible`
- `Roll20 Default`

Each style defines:

- Table layout
- Row striping (odd/even)
- Header row formatting
- Cell padding and borders
- Font family and size

---

## Behavior Details

- Processes **all `<table>` elements** in the handout notes.
- Alternates row styling automatically (even/odd).
- First row is treated as a header when defined by the selected style.

---

## Notes & Limitations

- Existing table formatting will be overwritten.
- Only `<td>` elements are styled (`<th>` is not explicitly handled).
- Nested tables may not be processed correctly.
- Requires valid HTML tables in the handout notes.
- Large handouts may take longer to process.

---

## How It Works

- Parses handout HTML using regex to locate `<table>` elements.
- Applies style definitions from a centralized `STYLES` object.
- Converts JavaScript style objects into inline CSS.
- Rewrites table markup with consistent formatting.

---

## Modification

If you import instead of install, so you have access to the code, you can add new styles to the `STYLES` object