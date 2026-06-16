# Troubleshooting

## Manual Command Works But Spells Do Not Auto-Trigger

- Confirm **Auto Add Con. Marker** is enabled.
- If using D&D 2024 / Beacon, verify whether Experimental API is required in your game.
- Enable **Debug Mode**, cast again, and inspect `[Concentration v1]` logs.

## HP Loss Does Not Trigger Concentration Checks

- Confirm the token currently has the configured concentration marker.
- Confirm configured **HP Bar** matches the bar that is being reduced.
- Verify the token is taking HP loss on the same tracked bar.

## CON Modifier Is Always 0

- Check configured **Bonus Attribute**.
- Verify the attribute exists on the character sheet and has a numeric value.
- Use Debug Mode to confirm whether `getSheetItem` or `getAttrByName` fallback returned data.

## D&D 2024 Sheet Does Nothing

- Confirm your API server mode (Default vs Experimental).
- Cast a known concentration spell from the sheet's spell card output, not a custom text macro.
- Use Debug Mode and capture detection logs.

## Token Is Not Linked To A Character

- Manual marker toggling works.
- Automatic sheet-derived CON modifier lookup may not, because no represented character exists.

## Duplicate Character Names

- Character lookup falls back to the first exact name match if ID metadata is absent.
- Use unique character names to avoid ambiguous spell-card resolution.

## Roll/Advantage Button Says Expired

- Pending roll buttons expire automatically after a short window.
- Trigger a new concentration check to generate fresh buttons.
