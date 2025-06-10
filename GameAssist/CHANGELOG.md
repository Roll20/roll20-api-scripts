# Changelog

All notable changes to this project will be documented in this file.

---

## [0.1.1.2] – 2025-06-10

### CritFumble Module

- **Natural 1 Detection Bugfix:**  
  Refactored the `hasNaturalOne` function to robustly detect natural 1s on all d20 attack rolls, regardless of template complexity or non-standard inline roll formats. This eliminates `"Cannot read properties of undefined (reading 'r')"` errors and ensures that all valid attack rolls are properly checked for critical fumbles.

- **GM Visibility Improvement:**  
  The ❓ **Confirm Critical Miss** confirmation menu is now whispered to both the GM and the player, not just the player. This makes GM oversight consistent across all critical miss event prompts.

---

## [0.1.1.1] – 2025-05-30

### Core Framework

- **Quiet Startup Option:**  
  Added `flags.QUIET_STARTUP` (default: `true`). GMs can now silence per-module “Ready” chat lines during sandbox boot, except for the single Core summary line.

- **Logging Improvements:**  
  - Re-implemented `GameAssist.log` for better output and log hygiene.
  - Logs now automatically escape user text, split multiline output into properly prefixed `/w gm` blocks, and preserve message order and formatting.
  - `log()` accepts `{ startup: true }` metadata, so modules can control which messages are suppressed by QUIET_STARTUP.

- **Core-Ready Announcement:**  
  - The core “ready” message is never suppressed, even in QUIET_STARTUP mode.

- **Status Command Update:**  
  - `!ga-status` now uses real newline characters for clearer output.
  - Output remains grouped in a single whisper for better readability.

- **Module Announcements:**  
  - All bundled modules (CritFumble, NPCManager, ConcentrationTracker, NPCHPRoller) now mark their “Ready” lines with `{ startup:true }` so they respect QUIET_STARTUP.  
  - NPCHPRoller conforms to this output pattern.

- **Summary:**  
  No functional changes to gameplay. All updates focus on GM chat output quality-of-life, reducing log clutter, and clarifying startup diagnostics.

---

## [0.1.1.0] – 2025-05-29

- Initial public release of GameAssist.
- Bundled the core loader with four modules: CritFumble, NPCManager, ConcentrationTracker, and NPCHPRoller.
- Laid foundation for future modular expansion and customization.

---

*This changelog will track all future updates, enhancements, and bug fixes.*

