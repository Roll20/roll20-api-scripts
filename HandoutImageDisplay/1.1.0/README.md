# HandoutImageDisplay

HandoutImageDisplay restores a practical image-only reveal workflow for Roll20 handouts. It copies the main image from a source handout into one reusable, player-safe **Image Display** handout without exposing the source handout's notes or GM notes.

The script reuses the same display handout for every image. It does not create a new handout for each reveal.

## Requirements

- A Roll20 game created by a Pro subscriber.
- No script dependencies.
- Commands are restricted to the GM.

## Installation

### Manual installation

1. Open the game's **Mod (API) Scripts** page.
2. Create a new script named `HandoutImageDisplay`.
3. Paste in `HandoutImageDisplay.js`.
4. Save the script and wait for the Mod sandbox to restart.

The reusable display handout is created automatically the first time an image is prepared.

Run the setup command once as each GM who wants the supplied Collections macro:

```text
!showimage --setup
```

This creates or repairs a macro named **Handout Image Display** for that GM. Roll20's **In Bar** setting is a personal interface choice, so tick it in Collections if the macro should appear on the Quick Bar.

## Commands

### Prepare an image

```text
!showimage|Handout Name
```

The name match is case-insensitive but must otherwise be exact. The script first uses the handout's main image. If no main image exists, it uses the first image embedded in the handout notes.

The source handout remains unchanged. The reusable display handout is made visible in all player journals and contains only the selected image.

### Share a clickable link

```text
!showimage --share
```

Posts a **View Image** link in public chat. Players can click it to open the reusable display handout.

### Hide the display

```text
!showimage --hide
```

Removes the reusable display handout from player journals. It does not delete the handout or its current image.

### Help

```text
!showimage --help
```

### Create or repair the Collections macro

```text
!showimage --setup
```

The command affects only the GM who runs it and will not overwrite an unrelated macro with the same name.

## Collections macro created by setup

```text
?{Image Display|Show Image,!showimage&#124;?{Handout Name&#125;|Hide Image,!showimage --hide}
```

This provides a single macro-bar menu with **Show Image** and **Hide Image** options.

## Safety behaviour

- Only GMs can use the commands.
- The script stores the ID of the handout it owns.
- It will not overwrite an unrelated handout merely because it is named `Image Display`.
- If that name is already in use, the script creates `Image Display (HandoutImageDisplay)` instead.
- A GM upgrading from version 1.0 can explicitly adopt the old display handout with `!showimage --adopt`.
- Duplicate source-handout names are reported rather than guessed.

### Upgrading from version 1.0

If version 1.0 already created a handout named **Image Display**, run this once after installing version 1.1:

```text
!showimage --adopt
```

The command refuses to guess if no exact match exists or several handouts share that name.

## Roll20 limitation

Mod scripts cannot invoke Roll20's client-side image lightbox or simulate **Shift+Z**. For the closest replacement to the former image-only reveal, prepare the image, open **Image Display**, and use Roll20's **Show to Players** control. Alternatively, use `!showimage --share` to post a player-accessible link.

## Licence

Released under the MIT Licence.
