# Changelog

All notable changes to this project will be documented in this file.

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

---

### Module-Specific Changelogs

#### CritFumble Module

**v0.2.4.8** (2025-06-01)
- Added `sanitizeWho()` helper to strip “ (GM)” from whisper targets.
- Confirm-table lookup is now case-insensitive via `CONFIRM_TABLES`.
- Refactored `rollConfirmTable()` logic, preserving debug logging.
- `showHelpMessage()` fully lists API commands and documents new behaviors.
- Maintained support for both manual and automatic fumble paths.

**v0.2.4.7** (2025-05-30)
- Initial v0.2.4.7 release.
- Detects natural 1 on supported templates and pops the fumble menu.
- Manual GM trigger via `!critfail`.
- Confirmation table support via `!confirm-crit-<type>`.
- Debug logging and emoji options in module config.

---

#### ConcentrationTracker Module

**v0.1.0.5** (2025-06-01)
- Refactored handler to normalize and lowercase incoming commands.
- Switched to `onEvent('chat:message')` for improved command matching.
- Added section headers and doc comments for easier customization.
- `showHelp()` lists all flags and usage patterns.
- Retained all manual and automatic options, plus tracking of last damage.

**v0.1.0.4k** (2025-05-02)
- Initial release.
- Three-button prompt for concentration checks, supports advantage/disadvantage.
- Rolls, toggles “Concentrating” marker, clears on module disable.
- Whispered output to both player and GM.

---

*This changelog will track all future updates, enhancements, and bug fixes.*
