# Concentration v1.0.0 Manual Test Checklist

## Environments

- D&D 2014 / 5e OGL-style sheet game
- D&D 2024 / Beacon sheet game on Experimental API server
- D&D 2024 / Beacon sheet game on Default API server

## Manual Toggle Tests

- GM selects one linked token and runs `!concentration`.
- GM runs `!concentration Bless` on a selected token.
- Player selects a controlled token and runs `!concentration`.
- Player attempts an uncontrolled token and should be blocked.
- GM selects an unlinked token and runs `!concentration`.
- Character whisper mode works for a linked token.
- Character whisper mode does not crash for an unlinked token.

## Spell Detection Tests

### D&D 2014 / 5e OGL Sheet

- Cast a concentration spell and confirm the marker is added.
- Cast a non-concentration spell and confirm the marker is not added.
- Cast a concentration spell while already concentrating and confirm the reminder appears.

### D&D 2024 / Beacon Sheet

- Cast a concentration cantrip or spell and confirm the marker is added.
- Cast a concentration levelled spell and confirm the marker is added.
- Cast a non-concentration spell and confirm the marker is not added.
- Cast from the spell tab.
- Cast from a token action or macro if used in the game.
- Confirm the spell name shown in chat is correct.
- Confirm the character name shown in chat is correct.
- Confirm duplicate character names create a debug warning.

## HP Loss Tests

- Token with the concentration marker loses HP and receives a concentration prompt.
- DC is 10 for damage below 22.
- DC is half damage rounded down for damage above 20.
- Auto-roll succeeds and the marker remains.
- Auto-roll fails and the marker is removed.
- Manual Roll button works.
- Manual Advantage button works.
- Token names with spaces work.
- Token names with punctuation work.

## Marker Tests

- Removing the marker manually from one represented token removes it from the others.
- Removing the marker from an unlinked token does not crash.
- Changing unrelated status markers does not trigger concentration removal.

## Config Tests

- Change the command name and verify the new command works.
- Change the status marker and verify the new marker is used.
- Change the HP bar and restart the API if required.
- Change the reminder target.
- Toggle auto-add concentration marker.
- Toggle auto-roll save.
- Toggle show roll button.
- Toggle debug mode.

## Expected Outcome

- No uncaught exceptions in the API console.
- No regression in legacy sheet behavior.
- D&D 2024 concentration spells trigger on the Experimental API server.
- Failures provide enough debug information to diagnose.
- README behavior matches observed behavior.
