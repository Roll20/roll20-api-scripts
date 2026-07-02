# Trinkets & Trackers (T&T)

**Author:** [AmadeusVF](https://app.roll20.net/users/15900768/amadeusvf)  
**Version:** 1.3.5 Public Release

Trinkets & Trackers is a Roll20 API script for D&D games that adds chat-based
tools for inventory, shops, token setup, combat support, conditions, and
initiative management. It is designed to reduce manual bookkeeping during play
and give the DM faster control over common table actions.

For more information, visit my [patreon](https://www.patreon.com/c/AmadeusVF).

## Main Features

- **Chat-based interactive inventory:** use, equip, discard, and transfer items
  from character to character directly from chat menus.
- **Dynamic shop system:** manage shops, prices, stock, purchases, inventory
  delivery, currency, and campaign economy from Roll20.
- **Token management:** initialize tokens and configure vision, bars, size, and
  other token defaults used by the script.
- **Combat assistance:** challenge attacks against AC, apply damage, and handle
  resistance, vulnerability, immunity, healing, and concentration support.
- **Concentration tracker:** track active concentration effects and help the DM
  manage them during combat.
- **Condition applier:** apply common conditions to tokens from script menus.
- **Advanced Group Initiative:** manage initiative for selected groups more
  efficiently checking for advantage or disadvantage on rolls.

## Requirements

To use the interactive inventory and shop system, the campaign must include
these two handouts:

- `T&T Portable Database`
- `T&T Blueprints`

These handouts are used by the script to store and read item, shop, and
blueprint data. They should exist in the Roll20 campaign before using inventory
or shop features.

## Basic Use

- `!tntDM menu` opens the DM control console, where the DM can access inventory,
  shop, token, combat, and management tools.
- `!tntToken Init` initializes selected tokens so they can work with the script,
  including token setup, bars, vision, size, and saved token data.

Once the required handouts are present and tokens have been initialized, the DM
and players can use the chat menus to manage items, shops, combat actions,
conditions, healing, concentration, and initiative directly in Roll20.
