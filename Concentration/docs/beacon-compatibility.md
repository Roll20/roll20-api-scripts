# Beacon Compatibility Notes

This document explains how Concentration v1.0.0 detects D&D 2024 / Beacon concentration spell cards and what to capture when behavior changes.

## Summary

- Beacon spell detection is based on Roll20 `advancedroll` chat output.
- Detection is intentionally fuzzy, but still depends on Roll20's current markup conventions.
- Some Beacon games may require the Experimental API server for expected behavior.

## What Is Detected

- The message must look like a spell-card style `advancedroll` output.
- Concentration is detected using multiple indicators, including:
  - `data-chip="concentration"` patterns
  - broader `data-*="concentration"` patterns
  - text fallback for `concentration` when the message still appears to be a spell card
- Character and spell extraction are defensive and tolerate missing fields where possible.

## Known Fragility

- If Roll20 changes class names, data attributes, or markup shape, auto-detection may miss concentration spells.
- False negatives are more likely than false positives because the script requires spell-card-like structure before using broad text matches.

## Diagnostic Workflow

1. Enable Debug Mode from the script config menu.
2. Cast one concentration spell and one non-concentration spell from the D&D 2024 sheet.
3. Capture the API log lines starting with `[Concentration v1]`.
4. Confirm API server mode (Default or Experimental).
5. Include this data in a support report.

## Report Checklist

- Concentration version
- Sheet used (D&D 2014 / D&D 2024)
- API server mode (Default / Experimental)
- Spell cast (name and whether it should be concentration)
- Debug log excerpt (anonymized if needed)
