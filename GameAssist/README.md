

# GameAssist

*Modular Roll20 API Framework*

## Overview

**GameAssist** is a modular, extensible API framework for Roll20, designed to automate and simplify game management for Game Masters and players alike. Built for the [D\&D 5E 2014 Character Sheet](https://wiki.roll20.net/5e_OGL_Character_Sheet), GameAssist provides robust tools for session automation, error reduction, and campaign consistency.

## Features

### Core System

* **Task Queue & Watchdog:** Ensures reliable, serialized execution of all automation and recovers gracefully from errors.
* **Handler Tracking:** Centralizes event and command bindings to prevent duplication and facilitate debugging.
* **State Management:** Maintains isolated, audited state for each module to safeguard your data.
* **RBAC (Role-Based Access Control):** Restricts sensitive commands to GMs, with support for future player-based permissions.

### Included Modules

#### CritFumble

* Detects critical misses and prompts players to specify attack type.
* Rolls from configurable fumble tables; supports Roll20’s rollable tables.
* Interactive player menu on crit fails.

#### NPC Manager

* Tracks and manages “dead” status for NPC tokens based on HP.
* Reports marker mismatches for easy correction (requires [TokenMod](https://wiki.roll20.net/TokenMod)).

#### Concentration Tracker

* Prompts for concentration saves when damage is detected.
* Supports advantage/disadvantage and automatic marker handling (requires TokenMod).
* Whispered results to player and GM.

#### NPC HP Roller

* Assigns randomized hit points to NPC tokens based on sheet formulas.
* Supports both selected tokens and entire pages (requires TokenMod).

---

## Installation

1. **Download or clone this repository.**
2. **Copy `GameAssist.js`** into your Roll20 game’s API Scripts panel.
3. **(Strongly recommended)**: Install [TokenMod](https://wiki.roll20.net/TokenMod) for marker automation and full feature support.
4. **Reload the API sandbox** in your game.

**Note:** GameAssist requires a Roll20 Pro subscription (API access).

---

## Usage

### Core Commands

* `!ga-config`
  View or set configuration options for all modules.
* `!ga-enable <module>` / `!ga-disable <module>`
  Enable or disable modules live, without reloading the sandbox.
* Module-specific commands:

  * **CritFumble:** `!critfail`, `!critfumble help`
  * **NPC Manager:** `!npc-death-report`
  * **Concentration Tracker:** `!concentration`, `!cc`
  * **NPC HP Roller:** `!npc-hp-all`, `!npc-hp-selected`

### Configuration Example

```
!ga-config set CritFumble debug=true
```

For a full list of options, use:

```
!ga-config list
```

or refer to the in-game help via module commands.

---

## Compatibility

* **Tested and optimized for:** D\&D 5E 2014 Character Sheet by Roll20.
* **Dependencies:** TokenMod (required for full automation).

Other character sheets and API scripts may be compatible but are not officially supported.

---

## Troubleshooting & Support

* **Issues & Feature Requests:**
  Use the [GitHub Issues page](https://github.com/Mord-Eagle/GameAssist/issues) to report bugs or suggest improvements.
* **Documentation:**
  See this README, the in-game `!ga-config` help, or the [GameAssist wiki](https://github.com/Mord-Eagle/GameAssist/wiki) (if available).

---

## Development & Contributions

Contributions are welcome!
If you wish to contribute:

* **Fork this repository** and create a feature branch.
* **Document your changes** and include tests where feasible.
* **Open a pull request** with a detailed description.

Testing is strongly encouraged within the Roll20 API sandbox.

---

## Changelog

See `CHANGELOG.md` for detailed version history.

---

## License

GameAssist is released under the [MIT License](LICENSE), as required by Roll20’s API repository.
By contributing, you agree your changes will be licensed under MIT.

---

# Analytical Breakdown

* **Clarity:** The revised README uses clear, structured prose with direct command explanations and explicit dependencies.
* **Compliance:** Follows Roll20’s requirements on license, accepted file types, command documentation, and usage of module names.
* **Description:** Module purposes and example commands are described up front, and the installation process is concise but explicit.
* **Support:** Directs users to GitHub Issues and provides both in-game and README documentation routes.
* **Extensibility:** Encourages safe contributions and outlines the PR process.
* **User Accessibility:** Links to TokenMod, Roll20 docs, and the character sheet to ensure new users understand dependencies and context.

