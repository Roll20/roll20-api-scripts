# World-Aware NPC Generator

A world-aware random NPC generator for Roll20 Mod scripts.

Created by **Kingkiller546** — Roll20 ID **2978722**.

## What it does

The generator creates a compact GM-only NPC card containing:

- Name
- Sex
- Race
- Origin
- Age
- Affluence
- Influence
- Faction, when relevant

Names are selected from ancestry- and origin-aware pools rather than from one universal fantasy-name list. Dwarves, elves, halflings, dragonborn, orcs and other supported ancestries use distinct linguistic naming conventions. Humans use broad regional naming styles. Mixed-ancestry characters use their origin as cultural upbringing.

Changelings receive an assumed ancestry appropriate to their origin. Their card shows both the truth and disguise, such as “Changeling — posing as Human”, while their public name comes from the assumed identity.

Influence is rolled before faction. When the result is **No Influence**, faction is not rolled or displayed.

## Requirements

- A Roll20 campaign with access to Mod scripts.
- The script installed and enabled in the campaign's Mod Scripts page.

The generator uses Roll20 Rollable Tables and the persistent state object. It does not make external web requests.

## Installation

1. Open the Roll20 campaign.
2. Open **Settings → Mod Scripts**.
3. Create a new script.
4. Paste the complete contents of World-Aware-NPC-Generator.js.
5. Save the script.
6. In Roll20 chat, run:

       !npc-config

7. Select **Install Missing Tables**.
8. Generate an NPC with:

       !npc

## Commands

| Command | Purpose |
|---|---|
| !npc | Generate an NPC and whisper the card to the GM. |
| !npc-config | Open the GM-only Setup Manager. |
| !npc-check | Check that required tables exist and contain items. |

## Setup Manager

- **Install Missing Tables** creates only tables that do not already exist.
- **Repair Defaults** adds default items missing from installed tables.
- **Factions: On/Off** enables or disables faction generation.
- **Generate NPC** produces a test NPC.

Installing missing tables does not overwrite an existing table. Repairing defaults does not change existing items or weights, but it will restore any default item whose name is absent. Do not use **Repair Defaults** if you intentionally removed default items and do not want them restored.

## Rollable Tables

The script installs:

- NPC-Race
- NPC-Age
- NPC-Sex
- NPC-Origin
- NPC-Affluence
- NPC-Influence
- NPC-Faction

All generation respects Roll20 table-item weights. Change a result's likelihood by changing its weight in the Rollable Table Manager.

## Customisation

You may add, remove, rename or reweight items. The generator reads the live tables whenever it generates an NPC.

The supplied generic origins are:

- Central Kingdoms
- Northern Kingdoms
- Western Freeholds
- Southern Continent
- Island Nations
- Floating Isles
- Elven Realms
- Orc Territories

Renaming an origin may cause it to fall back to the general Medieval Human pool unless the corresponding key is also added to ORIGIN_PROFILES in the script.

Custom races without a configured language pool use the Human pool associated with their origin.

## Using it from a macro

Create a Roll20 macro containing:

    !npc

A menu button can call the generator directly:

    [NPC Generator](!npc)

## Generated card

The output is whispered to the GM and is not added to the archived chat log. The card includes **Generate Another** and **Setup** buttons.

Faction is hidden when Influence is **No Influence**, or when faction generation has been disabled through the Setup Manager.

## Troubleshooting

Run !npc-check and confirm every required table has at least one item. Table names must match exactly.

If a custom origin uses unexpected Human names, add its text to the correct ORIGIN_PROFILES keys array.

If faction does not appear, check the Influence result and confirm factions are enabled in !npc-config.

## Updating

Replace the previous script contents with the new version and save. Existing Rollable Tables and weights remain in the campaign. Run !npc-check after updating.

Avoid deleting and reinstalling tables unless you intend to lose custom table changes.

## Version history

### 1.0.0

- Initial public release.
- Automated table installation and validation.
- Race- and origin-aware naming.
- Changeling assumed identities.
- Optional faction generation.
- Compact Roll20-safe output card.
