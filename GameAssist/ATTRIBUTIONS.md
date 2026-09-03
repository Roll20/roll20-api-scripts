# GameAssist Attribution and Third-Party Notices

GameAssist is independently developed and maintained by **Mord Eagle**. This document acknowledges projects whose published work informed or contributed to GameAssist and preserves the notices required by their licenses.

References to TokenMod, StatusInfo, Roll20, or their contributors do not imply sponsorship, endorsement, support, or affiliation.

## GameAssist MarkerService

`GameAssist.MarkerService` is an original GameAssist implementation for resolving, displaying, reading, changing, and observing Roll20 token status markers. Its compatibility goals were informed by the established marker behavior of **TokenMod**, including built-in artwork indexing, registered custom-marker image URLs, custom marker tags, numbered markers, duplicate entries, and preservation of unrelated token markers.

- GameAssist component: `GameAssist.MarkerService`
- Component version: `1.1.1`
- Project acknowledged: TokenMod
- Author: The Aaron, Arcane Scriptomancer
- Reference release: TokenMod `0.8.88`
- Pinned Roll20 repository snapshot: `9d634d3149985dcf10333920b3f4c41f215f39fc`
- TokenMod `0.8.88` file blob: `fc6c9cb45ec2f2ee254a24f849e089507a0e610a`
- Source: <https://github.com/Roll20/roll20-api-scripts/blob/9d634d3149985dcf10333920b3f4c41f215f39fc/TokenMod/0.8.88/TokenMod.js>
- License: MIT

## GameAssist ConditionAssist

`GameAssist.ConditionAssist` provides condition definitions, descriptions, marker artwork, selected-token menus, player-targeted announcements, permission controls, and supported `!condition` workflows. It uses `GameAssist.MarkerService` for every marker read, write, toggle, artwork lookup, and observation.

- GameAssist component: `ConditionAssist`
- Component version: `1.0.5`
- Compatibility and design foundation: StatusInfo
- Original author: Robin Kuiper
- Supplied reference release: StatusInfo `0.3.11`
- Published comparison release: StatusInfo package `0.3.12`
- Pinned Roll20 repository snapshot: `9d634d3149985dcf10333920b3f4c41f215f39fc`
- StatusInfo `0.3.12` file blob: `d3054aa8660f1eda47c424c4984e1850760e5c1a`
- Source: <https://github.com/Roll20/roll20-api-scripts/tree/9d634d3149985dcf10333920b3f4c41f215f39fc/StatusInfo>
- License: MIT

The published `0.3.12` package still declares internal script version `0.3.11`. Compared with the published `0.3.11` file, its executable change replaces the `character_sheet` attribute lookup with the character object's `charactersheetname` property. GameAssist does not adapt that sheet-specific synchronization path.

StatusInfo-derived compatibility concepts include the `!condition` command family, established configuration field names, the legacy `state.STATUSINFO` shape, its legacy condition catalog, marker associations, and displaying Roll20 marker artwork alongside condition text. ConditionAssist adds GameAssist lifecycle management, chat presentation, case-insensitive `!cond-<condition>` references, selected-character announcements, bounded private-reference buttons, permission feedback, validation, non-destructive migration, protected configuration, a structured API, 2014/2024 SRD wording profiles, campaign-custom descriptions, and MarkerService integration.

## GameAssist TokenAssist

`GameAssist.TokenAssist` provides general Roll20 token controls through `!token`, `!tokenassist`, `!token-assist`, and the shorter `!ta`/`!ta-*` forms. Older supported `!token-mod` macros remain deprecated compatibility aliases in GameAssist v2.0.0; their removal requires a separately announced migration release. New macros should use GameAssist's own command names. All status-marker operations are delegated to `GameAssist.MarkerService`.

- GameAssist component: `TokenAssist`
- Component version: `1.3.0`
- Compatibility and design foundation: TokenMod
- Original author: The Aaron, Arcane Scriptomancer
- Reference release: TokenMod `0.8.88`
- Pinned Roll20 repository snapshot: `9d634d3149985dcf10333920b3f4c41f215f39fc`
- TokenMod `0.8.88` path: `TokenMod/0.8.88/TokenMod.js`
- TokenMod `0.8.88` file blob: `fc6c9cb45ec2f2ee254a24f849e089507a0e610a`
- Source: <https://github.com/Roll20/roll20-api-scripts/blob/9d634d3149985dcf10333920b3f4c41f215f39fc/TokenMod/0.8.88/TokenMod.js>
- License: MIT

TokenMod compatibility concepts used by TokenAssist include selected-token and explicit-ID targeting; the `--on`, `--off`, `--flip`, `--set`, `--move`, `--order`, `--report`, page-filter, help, and `players-can-ids` command families; common token property names and aliases; relative numeric operations; movement units; report placeholders; and token-change observer behavior.

TokenAssist adds GameAssist lifecycle management, validation, help presentation, state migration, collision handling, diagnostics, MarkerService integration, command parsing, authorization boundaries, and the public `GameAssist.TokenAssist` API. Version 1.3.0 includes exact saved-attribute and supported computed-value reports, exact or unambiguous controller-list editing, privacy-aware report recipients, relative color and dimming controls, relative/random multi-sided-token selection, and MarkerService-backed duplicate-index, conditional, relative-count, and minimum/maximum expressions. These supported operations do not imply complete TokenMod command compatibility.

Persistent image-side stack editing, token-image replacement, and default-token writes are not included. TokenAssist provides its own help and manual rather than rebuilding TokenMod's help handout.

TokenAssist does not expose a global object named `TokenMod`. Its observer replacement is `GameAssist.TokenAssist.observeTokenChange()`. When standalone TokenMod is detected, TokenAssist leaves only the deprecated `!token-mod` alias to the standalone script and warns the GM, preventing one command from being applied twice; TokenAssist commands remain available.

## TokenMod

**TokenMod** was created by **The Aaron, Arcane Scriptomancer** and distributed through the Roll20 API Scripts repository under the MIT License.

GameAssist acknowledges TokenMod as an important design reference for token editing, command compatibility, marker handling, and script-to-script interoperability. Any TokenMod-derived code included in a GameAssist release retains the applicable copyright and permission notice below.

- Project: TokenMod
- Author: The Aaron, Arcane Scriptomancer
- Reference release: `0.8.88`
- Pinned source: <https://github.com/Roll20/roll20-api-scripts/blob/9d634d3149985dcf10333920b3f4c41f215f39fc/TokenMod/0.8.88/TokenMod.js>
- License: MIT

## StatusInfo

**StatusInfo** was created by **Robin Kuiper** and distributed through the Roll20 API Scripts repository under the MIT License.

GameAssist acknowledges StatusInfo as a design and compatibility reference for condition descriptions, condition menus, marker-driven status information, and related chat workflows. Any StatusInfo-derived code included in a GameAssist release retains the applicable copyright and permission notice below.

- Project: StatusInfo
- Author: Robin Kuiper
- Pinned source: <https://github.com/Roll20/roll20-api-scripts/tree/9d634d3149985dcf10333920b3f4c41f215f39fc/StatusInfo>
- License: MIT

## Roll20 API Scripts MIT Notice

TokenMod and StatusInfo are distributed through the Roll20 API Scripts repository under its MIT License.

Copyright (c) 2014-2018 Roll20 and/or Individual Authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Repository license: <https://github.com/Roll20/roll20-api-scripts/blob/master/LICENSE>

## D&D System Reference Documents

ConditionAssist includes adapted condition wording from SRD 5.1 for its 2014 profile and SRD 5.2.1 for its 2024 profile. GameAssist does not reproduce condition text from non-SRD sourcebooks.

### SRD 5.1 Attribution

This work includes material taken from the System Reference Document 5.1 ("SRD 5.1") by Wizards of the Coast LLC and available at <https://dnd.wizards.com/resources/systems-reference-document>. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License available at <https://creativecommons.org/licenses/by/4.0/legalcode>.

### SRD 5.2.1 Attribution

This work includes material from the System Reference Document 5.2.1 ("SRD 5.2.1") by Wizards of the Coast LLC, available at <https://www.dndbeyond.com/srd>. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License, available at <https://creativecommons.org/licenses/by/4.0/legalcode>.

## GameAssist License

Original GameAssist code is released under the MIT License. See [`LICENSE`](LICENSE) for the GameAssist copyright and permission notice.
