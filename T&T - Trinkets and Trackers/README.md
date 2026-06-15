# Trinkets & Trackers

# **IMPORTANT: THE API SANDBOX MUST BE SET TO EXPERIMENTAL**

Trinkets & Trackers will not finish loading if Roll20 is using the `DEFAULT`
API sandbox. In your game, the GM must go to **Mod Library** and set
**API Sandbox Version** to **Experimental** before using this script. If this is
not done, the script will warn the GM in chat and will not register its commands.

## What This Script Does

`TrinketsAndTrackers.js` is a Roll20 API script for managing character inventory,
currency, item catalogs, and shops in a D&D game.

It includes:

- Character inventory support through tokens linked to character sheets.
- Item usage, discarding, and item transfers between nearby tokens.
- Currency handling for `cp`, `sp`, and `gp`.
- Shops with open/closed/hidden states, stock, prices, and purchases.
- Item catalog search and item detail cards.
- Token actions for inventory, shops, search, initiative, ability checks,
  saving throws, and skill checks.

## Repository Files

- `TrinketsAndTrackers.js`: the main Roll20 API / One-Click Install script.
- `T&T Items Catalog.json`: the base item catalog.
- `T&T Items Template.json`: the base item template data used when creating
  inventory entries.
- `T&T Shop Catalog.json`: the base shop catalog and shop stock data.

## Installation

1. Install or add `TrinketsAndTrackers.js` as a Roll20 API Script / Mod.
2. In Roll20, go to **Mod Library**.
3. Set **API Sandbox Version** to **Experimental**.
4. Prepare the three `T&T` handouts described below.
5. Restart the API sandbox.
6. Confirm that chat shows the `Ready to Roll!` card.
7. Create the recommended GM macro buttons listed below.

## Preparing the Handouts

The script automatically loads its catalog data from three Roll20 handouts. The
handout names must match exactly, without the `.json` extension.

Create these handouts in the Roll20 Journal:

```text
T&T Items Catalog
T&T Items Template
T&T Shop Catalog
```

Then copy the full contents of each matching repository file into the matching
Roll20 handout:

- Copy all content from `T&T Items Catalog.json` into the handout named
  `T&T Items Catalog`.
- Copy all content from `T&T Items Template.json` into the handout named
  `T&T Items Template`.
- Copy all content from `T&T Shop Catalog.json` into the handout named
  `T&T Shop Catalog`.

Paste the JSON into the handout's main **Notes / Description** field. Do not
rename the handouts, and do not include `.json` in the handout name.

After the three handouts are ready, restart the API sandbox. On startup, the
script will automatically load the item catalog, item templates, and shop
catalog from those handouts.

## Recommended GM Macros

The GM only needs these 4 macros in the macro button bar:

```text
!tntToken init
```

Initializes token actions for the selected token. The selected token must be
linked to a character.

```text
!tntShop menu
```

Opens the GM shop administration menu.

```text
!tntItem search ?{Item Name|}
```

Opens a Roll20 query window asking for the item name. The `?{Item Name|}` part
is the Roll20 query syntax; whatever the GM types is inserted into the command,
and the script searches the catalog for matching items.

```text
!tntItem list
```

Shows the full item catalog to the GM.

## Useful Commands

- `!tnt` or `!tntHelp`: shows the available command help.
- `!tntInventory`: shows the selected token's inventory.
