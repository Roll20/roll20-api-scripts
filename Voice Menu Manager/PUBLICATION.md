# Publication candidate — Voice Menu Manager 1.0.0

Author: **Kingkiller546**

The generic public edition is independent of any private campaign script. It uses `!vmm`, stores its settings in `state.VoiceMenuManager`, and contains no private campaign names, NPCs, recordings or file paths.

## Live validation reported by the author — 15 October 2026

Kingkiller546 tested the public version in a clean Roll20 test game and reported these flows working as intended:

- Setup wizard and menu creation.
- One recording, then adding a second recording.
- Playing another voice before the first finished.
- Renaming the linked table and generated macro without breaking operation.
- Narration character menus working as intended.

These are author-reported live results. Automated checks separately cover the mock workflow tests and metadata validation. Other management operations, including detach/archive/restore and player permissions, are covered by mocks but are not claimed as live-tested.

Author metadata is complete: public alias **Kingkiller546**, numeric Roll20 ID **2978722**.

## Before submission

1. Review the reported live results above and the remaining optional management checks in README.md. Automated mock tests do not prove every live-client behaviour.
2. Retain the verified author metadata: `authors` is **Kingkiller546** and `roll20userid` is **2978722**, supplied by the author.
3. Run `node --test tests/VoiceMenuManager.test.cjs` and `node tests/validate-package.cjs --release`.
4. Copy this complete `Voice Menu Manager` folder into a fork of Roll20/roll20-api-scripts. The root script and version-folder script must remain identical.
5. Open a pull request for review under the repository's MIT licensing terms. This package has not been pushed or submitted.

Official repository requirements checked on 15 October 2026:

- https://github.com/Roll20/roll20-api-scripts/blob/master/README.md
- https://github.com/Roll20/roll20-api-scripts/blob/master/script.json.schema

The included schema is a snapshot of blob `caba5afc2c38874e22e2e16a996d926d5609447d`. Recheck the repository requirements if they change before submission.

## Suggested pull request description

Voice Menu Manager creates table-backed voice macros through a GM chat wizard. GMs can configure settlement-only or kingdom-and-settlement NPC menus, manage locations and link existing tables by ID. A separate narration menu supports Session Intros, Scenes, Dreams and Visions, with configurable character names and recording prefixes.

Generated menus sort naturally and append Cancel at every level. The standalone script includes direct/weighted-table playback, configurable track prefixes, missing-track audits, recording editing and reversible menu archiving. No campaign-specific data is bundled.

Validation: 20 automated mock Roll20 workflow tests; official-schema metadata validation; author-reported live tests of setup, one- and two-recording menus, switching voices mid-playback, table/macro renaming, and narration character menus.
