<a name="9.0.0"></a>
# [9.0.0](https://github.com/symposion/roll20-shaped-scripts/compare/8.5.0...9.0.0) (2017-04-09)


### Bug Fixes

* **uses:** Fix legendary action uses decrementing ([5e1503b](https://github.com/symposion/roll20-shaped-scripts/commit/5e1503b)), closes [#461](https://github.com/symposion/roll20-shaped-scripts/issues/461)


### BREAKING CHANGES

* **uses:** This script no longer works with sheets
below version 11.4.0



<a name="8.5.0"></a>
# [8.5.0](https://github.com/symposion/roll20-shaped-scripts/compare/8.4.2...8.5.0) (2017-04-09)


### Bug Fixes

* **rests:** Stop crash on turn change ([511b17f](https://github.com/symposion/roll20-shaped-scripts/commit/511b17f)), closes [#453](https://github.com/symposion/roll20-shaped-scripts/issues/453)
* Prevent errors from occasionally being swallowed ([27edbb0](https://github.com/symposion/roll20-shaped-scripts/commit/27edbb0))
* Prevent missing attribute Roll20 error ([c2300ef](https://github.com/symposion/roll20-shaped-scripts/commit/c2300ef))
* **spell-list:** Fix problem with patching archetypes ([16ebf47](https://github.com/symposion/roll20-shaped-scripts/commit/16ebf47))
* **spell-slots:** Make Divine Smite deduct spell slots. ([2f5f9bf](https://github.com/symposion/roll20-shaped-scripts/commit/2f5f9bf)), closes [#420](https://github.com/symposion/roll20-shaped-scripts/issues/420)
* **statblock-import:** Log end of command correctly. ([e208c18](https://github.com/symposion/roll20-shaped-scripts/commit/e208c18))
* **token-defaults:** Fix a few bugs with new token defaults code ([106155f](https://github.com/symposion/roll20-shaped-scripts/commit/106155f))


### Features

* **import:** Make MM drag configure new characters ([9ce30c9](https://github.com/symposion/roll20-shaped-scripts/commit/9ce30c9)), closes [#430](https://github.com/symposion/roll20-shaped-scripts/issues/430)


### BREAKING CHANGES

* **token-defaults:** This version will no longer work with sheets
prior to 11.4.0



<a name="8.4.2"></a>
## [8.4.2](https://github.com/symposion/roll20-shaped-scripts/compare/8.4.1...8.4.2) (2017-03-30)



<a name="8.4.1"></a>
## [8.4.1](https://github.com/symposion/roll20-shaped-scripts/compare/8.4.0...8.4.1) (2017-03-30)


### Bug Fixes

* **rests:** Send whisper as resting character ([e9f1e79](https://github.com/symposion/roll20-shaped-scripts/commit/e9f1e79))
* **startup:** Fix version not found bug on startup ([8a75cb6](https://github.com/symposion/roll20-shaped-scripts/commit/8a75cb6)), closes [#441](https://github.com/symposion/roll20-shaped-scripts/issues/441)



<a name="8.4.0"></a>
# [8.4.0](https://github.com/symposion/roll20-shaped-scripts/compare/8.3.1...8.4.0) (2017-03-30)


### Bug Fixes

* **rests:** Fix auto-turn-rests ([1224120](https://github.com/symposion/roll20-shaped-scripts/commit/1224120)), closes [#445](https://github.com/symposion/roll20-shaped-scripts/issues/445)


### Features

* **rests:** Handle Rests running on the sheet ([f44374c](https://github.com/symposion/roll20-shaped-scripts/commit/f44374c)), closes [#398](https://github.com/symposion/roll20-shaped-scripts/issues/398)



<a name="8.3.1"></a>
## [8.3.1](https://github.com/symposion/roll20-shaped-scripts/compare/8.3.0...8.3.1) (2017-03-29)


### Bug Fixes

* **import:** Allow previous name to import spells for monster ([6cb8821](https://github.com/symposion/roll20-shaped-scripts/commit/6cb8821)), closes [#439](https://github.com/symposion/roll20-shaped-scripts/issues/439)
* **import:** Fix error with custom JSON that still has patch attribute ([30a8f4e](https://github.com/symposion/roll20-shaped-scripts/commit/30a8f4e))



<a name="8.3.0"></a>
# [8.3.0](https://github.com/symposion/roll20-shaped-scripts/compare/8.2.0...8.3.0) (2017-03-28)


### Bug Fixes

* **death-saves:** Don't moan about negative HP ([2c63292](https://github.com/symposion/roll20-shaped-scripts/commit/2c63292)), closes [#422](https://github.com/symposion/roll20-shaped-scripts/issues/422)
* **entity-lister:** Ensure classes are always listed for spells ([368a7a4](https://github.com/symposion/roll20-shaped-scripts/commit/368a7a4))
* **entity-lister:** Improve concentration/ritual presentation ([33b567d](https://github.com/symposion/roll20-shaped-scripts/commit/33b567d))
* **import:** Stop Errors being swallowed for monster import ([4f7dfda](https://github.com/symposion/roll20-shaped-scripts/commit/4f7dfda)), closes [#431](https://github.com/symposion/roll20-shaped-scripts/issues/431)


### Features

* **custom-json:** Implement better patch system for houserules ([ef93e8d](https://github.com/symposion/roll20-shaped-scripts/commit/ef93e8d)), closes [#433](https://github.com/symposion/roll20-shaped-scripts/issues/433)
* **monster-list:** Click to remove existing ([8f57685](https://github.com/symposion/roll20-shaped-scripts/commit/8f57685)), closes [#436](https://github.com/symposion/roll20-shaped-scripts/issues/436)
* **token-defaults:** Provide option to only link bars for PCs ([1876f40](https://github.com/symposion/roll20-shaped-scripts/commit/1876f40)), closes [#402](https://github.com/symposion/roll20-shaped-scripts/issues/402)



<a name="8.2.0"></a>
# [8.2.0](https://github.com/symposion/roll20-shaped-scripts/compare/8.1.0...8.2.0) (2017-03-23)


### Features

* **config:** Add settings for Automatically roll damage ([e7b0afc](https://github.com/symposion/roll20-shaped-scripts/commit/e7b0afc)), closes [#395](https://github.com/symposion/roll20-shaped-scripts/issues/395)
* **config:** Tidy up config display + align with latest sheet ([68e7146](https://github.com/symposion/roll20-shaped-scripts/commit/68e7146)), closes [#409](https://github.com/symposion/roll20-shaped-scripts/issues/409)
* **entity-lister:** Add filters for ritual and concentration ([b1cca99](https://github.com/symposion/roll20-shaped-scripts/commit/b1cca99)), closes [#403](https://github.com/symposion/roll20-shaped-scripts/issues/403)



<a name="8.1.0"></a>
# [8.1.0](https://github.com/symposion/roll20-shaped-scripts/compare/8.0.0...8.1.0) (2017-03-21)


### Features

* **import:** Add new spell/monster lister UI ([e5c31fc](https://github.com/symposion/roll20-shaped-scripts/commit/e5c31fc))
* **import:** Include SRD content in main script build ([74366e0](https://github.com/symposion/roll20-shaped-scripts/commit/74366e0))



<a name="8.0.0"></a>
# [8.0.0](https://github.com/symposion/roll20-shaped-scripts/compare/7.4.0...8.0.0) (2017-03-19)


### Bug Fixes

* **import:** Minor tweaks to improve efficiency of import ([85f755d](https://github.com/symposion/roll20-shaped-scripts/commit/85f755d))


### Chores

* Bump to next major sheet version ([115ebc0](https://github.com/symposion/roll20-shaped-scripts/commit/115ebc0))


### BREAKING CHANGES

* This script will now require 11.x sheet versions



<a name="7.4.0"></a>
# [7.4.0](https://github.com/symposion/roll20-shaped-scripts/compare/7.3.1...7.4.0) (2017-03-10)


### Features

* **spell-import:** Add command to delete spells ([c37de93](https://github.com/symposion/roll20-shaped-scripts/commit/c37de93)), closes [#391](https://github.com/symposion/roll20-shaped-scripts/issues/391)



<a name="7.3.1"></a>
## [7.3.1](https://github.com/symposion/roll20-shaped-scripts/compare/7.3.0...7.3.1) (2017-03-09)


### Bug Fixes

* **import:** Fix for the new !shaped-import-spell-list restriction ([d910905](https://github.com/symposion/roll20-shaped-scripts/commit/d910905))
* **import:** Rework --all options and limit !shaped-import-spell-list ([7f2bd9a](https://github.com/symposion/roll20-shaped-scripts/commit/7f2bd9a))



<a name="7.3.0"></a>
# [7.3.0](https://github.com/symposion/roll20-shaped-scripts/compare/7.2.1...7.3.0) (2017-03-04)


### Bug Fixes

* **startup:** Remove startup delay to test Riley's fixes ([c740d1e](https://github.com/symposion/roll20-shaped-scripts/commit/c740d1e))
* **token-defaults:** Only use default token label for new imports ([f8b4513](https://github.com/symposion/roll20-shaped-scripts/commit/f8b4513))


### Features

* **ammo:** Prompt for ammo recovery at end of combat ([5fe2d81](https://github.com/symposion/roll20-shaped-scripts/commit/5fe2d81)), closes [#74](https://github.com/symposion/roll20-shaped-scripts/issues/74)


### Reverts

* fix(startup): Remove startup delay to test Riley's fixes ([013609a](https://github.com/symposion/roll20-shaped-scripts/commit/013609a))



<a name="7.2.1"></a>
## [7.2.1](https://github.com/symposion/roll20-shaped-scripts/compare/7.2.0...7.2.1) (2017-03-03)


### Bug Fixes

* **import:** Default token bars not applied to 1st token ([a61f2b1](https://github.com/symposion/roll20-shaped-scripts/commit/a61f2b1))



<a name="7.2.0"></a>
# [7.2.0](https://github.com/symposion/roll20-shaped-scripts/compare/7.1.0...7.2.0) (2017-03-03)


### Bug Fixes

* **output:** Prevent duplicate messages when whispering to GM ([75aae55](https://github.com/symposion/roll20-shaped-scripts/commit/75aae55))
* **turn-recharge:** Tweaks to make it work better with GroupInit ([306b05a](https://github.com/symposion/roll20-shaped-scripts/commit/306b05a))


### Features

* **turn-recharge:** Add config option to turn turn recharges on/off ([5e2b355](https://github.com/symposion/roll20-shaped-scripts/commit/5e2b355))



<a name="7.1.0"></a>
# [7.1.0](https://github.com/symposion/roll20-shaped-scripts/compare/7.0.0...7.1.0) (2017-03-01)


### Bug Fixes

* **config:** All commands warn when config is not upgraded ([27384c1](https://github.com/symposion/roll20-shaped-scripts/commit/27384c1)), closes [#370](https://github.com/symposion/roll20-shaped-scripts/issues/370)
* **import:** Ensure saves/skills always include PB ([8e53615](https://github.com/symposion/roll20-shaped-scripts/commit/8e53615)), closes [#366](https://github.com/symposion/roll20-shaped-scripts/issues/366)
* **output:** Ensure GM sees whispered output as well ([85009cb](https://github.com/symposion/roll20-shaped-scripts/commit/85009cb))


### Features

* **output:** Whisper results if original command/trigger was whispered ([12eb86c](https://github.com/symposion/roll20-shaped-scripts/commit/12eb86c)), closes [#367](https://github.com/symposion/roll20-shaped-scripts/issues/367)
* **rests:** Implement recharge 5-6 style recharges ([46bb64b](https://github.com/symposion/roll20-shaped-scripts/commit/46bb64b)), closes [#374](https://github.com/symposion/roll20-shaped-scripts/issues/374)



<a name="7.0.0"></a>
# [7.0.0](https://github.com/symposion/roll20-shaped-scripts/compare/6.4.6...7.0.0) (2017-02-27)


### Chores

* Rename racial features to racial traits ([def82ef](https://github.com/symposion/roll20-shaped-scripts/commit/def82ef)), closes [#279](https://github.com/symposion/roll20-shaped-scripts/issues/279)


### Features

* **config:** Ask user before  upgrading + cmd to wipe config ([835ee05](https://github.com/symposion/roll20-shaped-scripts/commit/835ee05)), closes [#279](https://github.com/symposion/roll20-shaped-scripts/issues/279)


### BREAKING CHANGES

* The sheet has changed racial features to racial traits for
10.0.0; the script has changed to match and will no longer work properly with
pre 10.0.0 sheets.



<a name="6.4.6"></a>
## [6.4.6](https://github.com/symposion/roll20-shaped-scripts/compare/6.4.5...6.4.6) (2017-02-27)


### Bug Fixes

* **chat-output:** Ensure messages only get sent to correct user ([dcc8b32](https://github.com/symposion/roll20-shaped-scripts/commit/dcc8b32))
* **rests-and-hd:** Pay attention to reduced HP max ([34c8635](https://github.com/symposion/roll20-shaped-scripts/commit/34c8635)), closes [#359](https://github.com/symposion/roll20-shaped-scripts/issues/359)
* **startup:** Make startup delay longer - still some crashes happening ([964230c](https://github.com/symposion/roll20-shaped-scripts/commit/964230c))



<a name="6.4.5"></a>
## [6.4.5](https://github.com/symposion/roll20-shaped-scripts/compare/6.4.4...6.4.5) (2017-02-26)


### Bug Fixes

* **rests:** Fix error when resting as player not GM (again!) ([8491e0c](https://github.com/symposion/roll20-shaped-scripts/commit/8491e0c))



<a name="6.4.4"></a>
## [6.4.4](https://github.com/symposion/roll20-shaped-scripts/compare/6.4.3...6.4.4) (2017-02-26)


### Bug Fixes

* **import-spell:** Fix bug when importing duplicate spell ([3ef693a](https://github.com/symposion/roll20-shaped-scripts/commit/3ef693a))
* **rests:** Fix error when resting as player not GM ([0a7f157](https://github.com/symposion/roll20-shaped-scripts/commit/0a7f157))



<a name="6.4.3"></a>
## [6.4.3](https://github.com/symposion/roll20-shaped-scripts/compare/6.4.2...6.4.3) (2017-02-26)


### Bug Fixes

* **import-statblock:** Fix error reporting + bug with statblock import ([45e4014](https://github.com/symposion/roll20-shaped-scripts/commit/45e4014))



<a name="6.4.2"></a>
## [6.4.2](https://github.com/symposion/roll20-shaped-scripts/compare/6.4.1...6.4.2) (2017-02-26)


### Bug Fixes

* **startup:** Deal with really old sheets not being able to report version ([232c41e](https://github.com/symposion/roll20-shaped-scripts/commit/232c41e))
* **startup:** Try to avoid version not being set if API is really slow ([3f6cbd2](https://github.com/symposion/roll20-shaped-scripts/commit/3f6cbd2))



<a name="6.4.1"></a>
## [6.4.1](https://github.com/symposion/roll20-shaped-scripts/compare/6.4.0...6.4.1) (2017-02-26)


### Bug Fixes

* **startup:** Scale timeout to size of campaign ([155e45a](https://github.com/symposion/roll20-shaped-scripts/commit/155e45a)), closes [#341](https://github.com/symposion/roll20-shaped-scripts/issues/341)



<a name="6.4.0"></a>
# [6.4.0](https://github.com/symposion/roll20-shaped-scripts/compare/6.3.0...6.4.0) (2017-02-26)


### Bug Fixes

* **config:** Update hide settings for 9.x ([731819a](https://github.com/symposion/roll20-shaped-scripts/commit/731819a)), closes [#339](https://github.com/symposion/roll20-shaped-scripts/issues/339)
* **rests:** Make long rest HP behaviour more configurable ([b8fa697](https://github.com/symposion/roll20-shaped-scripts/commit/b8fa697)), closes [#284](https://github.com/symposion/roll20-shaped-scripts/issues/284)
* **startup:** Clean up all SHAPED_VERSION_TESTER characters ([f7b6d39](https://github.com/symposion/roll20-shaped-scripts/commit/f7b6d39))


### Features

* **spells:** Make automatic spell slot processing a per-character setting ([6c0ae62](https://github.com/symposion/roll20-shaped-scripts/commit/6c0ae62)), closes [#340](https://github.com/symposion/roll20-shaped-scripts/issues/340)



<a name="6.3.0"></a>
# [6.3.0](https://github.com/symposion/roll20-shaped-scripts/compare/6.2.1...6.3.0) (2017-02-26)


### Features

* **config:** Check against sheet version on startup ([35ba538](https://github.com/symposion/roll20-shaped-scripts/commit/35ba538)), closes [#12](https://github.com/symposion/roll20-shaped-scripts/issues/12)



<a name="6.2.1"></a>
## [6.2.1](https://github.com/symposion/roll20-shaped-scripts/compare/6.2.0...6.2.1) (2017-02-25)


### Bug Fixes

* **spell-import:** Added changes that got merged out before last release ([c40c952](https://github.com/symposion/roll20-shaped-scripts/commit/c40c952))



<a name="6.2.0"></a>
# [6.2.0](https://github.com/symposion/roll20-shaped-scripts/compare/6.1.1...6.2.0) (2017-02-25)


### Bug Fixes

* **import:** Attempt to dedup attributes more aggressively. ([4da25ce](https://github.com/symposion/roll20-shaped-scripts/commit/4da25ce))
* **slots:** Don't decrement for repeat casts (requires 9.2.2) ([53314f7](https://github.com/symposion/roll20-shaped-scripts/commit/53314f7)), closes [#329](https://github.com/symposion/roll20-shaped-scripts/issues/329)
* **spell-import:** Importing Spell List gives an error ([88019de](https://github.com/symposion/roll20-shaped-scripts/commit/88019de)), closes [#12](https://github.com/symposion/roll20-shaped-scripts/issues/12) [#334](https://github.com/symposion/roll20-shaped-scripts/issues/334)


### Features

* **slots:** Handle spell points as well ([696a269](https://github.com/symposion/roll20-shaped-scripts/commit/696a269))



<a name="6.1.1"></a>
## [6.1.1](https://github.com/symposion/roll20-shaped-scripts/compare/6.1.0...6.1.1) (2017-02-24)


### Bug Fixes

* **logging:** Improve logging output to track down odd bugs ([4162fba](https://github.com/symposion/roll20-shaped-scripts/commit/4162fba))



<a name="6.1.0"></a>
# [6.1.0](https://github.com/symposion/roll20-shaped-scripts/compare/6.0.1...6.1.0) (2017-02-24)


### Bug Fixes

* **import:** Make lair actions import properly again ([49a42b3](https://github.com/symposion/roll20-shaped-scripts/commit/49a42b3)), closes [#313](https://github.com/symposion/roll20-shaped-scripts/issues/313)


### Features

* **import:** Add option to use same label for all tokens ([89ed6b8](https://github.com/symposion/roll20-shaped-scripts/commit/89ed6b8)), closes [#276](https://github.com/symposion/roll20-shaped-scripts/issues/276)



<a name="6.0.1"></a>
## [6.0.1](https://github.com/symposion/roll20-shaped-scripts/compare/6.0.0...6.0.1) (2017-02-24)


### Bug Fixes

* **update-character:** Fix bug on update character ([cf625cd](https://github.com/symposion/roll20-shaped-scripts/commit/cf625cd)), closes [#321](https://github.com/symposion/roll20-shaped-scripts/issues/321)



<a name="6.0.0"></a>
# [6.0.0](https://github.com/symposion/roll20-shaped-scripts/compare/5.3.0...6.0.0) (2017-02-24)


### Bug Fixes

* **import:** Import wasn't whispering to GM/player ([1977527](https://github.com/symposion/roll20-shaped-scripts/commit/1977527))
* **import:** Workaround roll20 bug with max values under API sheetworkers ([d9c7292](https://github.com/symposion/roll20-shaped-scripts/commit/d9c7292)), closes [#317](https://github.com/symposion/roll20-shaped-scripts/issues/317)
* **spell-import:** Fix crash bug with !shaped-import-spell ([4ae2344](https://github.com/symposion/roll20-shaped-scripts/commit/4ae2344))
* **spell-slots:** Fix problem with Cantrips ([36df7ca](https://github.com/symposion/roll20-shaped-scripts/commit/36df7ca))
* **uses:** Fix crash when per_use is a non-integer value ([19aeb05](https://github.com/symposion/roll20-shaped-scripts/commit/19aeb05))


### Chores

* Temporary guard for removeWithWorker not existing ([adace36](https://github.com/symposion/roll20-shaped-scripts/commit/adace36))


### Features

* **config:** Add all latest 9.x options to !shaped-config ([d226e04](https://github.com/symposion/roll20-shaped-scripts/commit/d226e04)), closes [#298](https://github.com/symposion/roll20-shaped-scripts/issues/298)
* **import:** Add command that imports based on token names ([f03c5a8](https://github.com/symposion/roll20-shaped-scripts/commit/f03c5a8)), closes [#311](https://github.com/symposion/roll20-shaped-scripts/issues/311)
* **import:** Support API sheetworkers for cleaner import ([beacb13](https://github.com/symposion/roll20-shaped-scripts/commit/beacb13))
* **rests:** Support new recharge field for use recovery ([4864c10](https://github.com/symposion/roll20-shaped-scripts/commit/4864c10)), closes [#264](https://github.com/symposion/roll20-shaped-scripts/issues/264)
* **spell-import:** Add command to expand empty spells ([f20b305](https://github.com/symposion/roll20-shaped-scripts/commit/f20b305))
* **spell-slots:** Auto-decrement spell slots ([4516bd6](https://github.com/symposion/roll20-shaped-scripts/commit/4516bd6)), closes [#16](https://github.com/symposion/roll20-shaped-scripts/issues/16)
* **token-actions:** Add option for showing recharge on token actions ([c5c3648](https://github.com/symposion/roll20-shaped-scripts/commit/c5c3648)), closes [#272](https://github.com/symposion/roll20-shaped-scripts/issues/272)
* **upgrade:** Script-driven sheet update for all character sheets ([5401c56](https://github.com/symposion/roll20-shaped-scripts/commit/5401c56)), closes [#300](https://github.com/symposion/roll20-shaped-scripts/issues/300)
* **uses:** Decrement legendary points + restore on turn recharge ([d451c2a](https://github.com/symposion/roll20-shaped-scripts/commit/d451c2a)), closes [#312](https://github.com/symposion/roll20-shaped-scripts/issues/312)
* **uses:** Use uses for everything that  has them ([e123718](https://github.com/symposion/roll20-shaped-scripts/commit/e123718)), closes [#260](https://github.com/symposion/roll20-shaped-scripts/issues/260)


### BREAKING CHANGES

* This script no longer works with version of the sheet below 9.1.0, you have been warned!



<a name="5.3.0"></a>
# [5.3.0](https://github.com/symposion/roll20-shaped-scripts/compare/5.2.0...5.3.0) (2017-02-13)


### Features

* **token-actions:** Make abilities use ids to survive name changes ([7911049](https://github.com/symposion/roll20-shaped-scripts/commit/7911049)), closes [#295](https://github.com/symposion/roll20-shaped-scripts/issues/295)



<a name="5.2.0"></a>
# [5.2.0](https://github.com/symposion/roll20-shaped-scripts/compare/5.1.0...5.2.0) (2017-02-09)


### Features

* **config:** Update initiative settings for 9.1.0 ([4f06dc6](https://github.com/symposion/roll20-shaped-scripts/commit/4f06dc6)), closes [#292](https://github.com/symposion/roll20-shaped-scripts/issues/292)



<a name="5.1.0"></a>
# [5.1.0](https://github.com/symposion/roll20-shaped-scripts/compare/5.0.0...5.1.0) (2017-02-04)


### Bug Fixes

* **adv-tracker:** Fix broken auto-revert functionality ([abd1158](https://github.com/symposion/roll20-shaped-scripts/commit/abd1158))


### Features

* **death-saves:** Handling for crits/fails + reporting of final result ([13741e9](https://github.com/symposion/roll20-shaped-scripts/commit/13741e9))



<a name="5.0.0"></a>
# [5.0.0](https://github.com/symposion/roll20-shaped-scripts/compare/4.10.0...5.0.0) (2017-02-04)


### Bug Fixes

* **advantage-tracker:** Fix advantage reversion to work with new sheet ([830f93b](https://github.com/symposion/roll20-shaped-scripts/commit/830f93b)), closes [#263](https://github.com/symposion/roll20-shaped-scripts/issues/263)
* **config:** Update advantage options to match sheet 8.x.x ([f1bea77](https://github.com/symposion/roll20-shaped-scripts/commit/f1bea77))
* **config:** Update config to match 9.x sheet ([840e0fd](https://github.com/symposion/roll20-shaped-scripts/commit/840e0fd))
* **hp-roller:** Fix possible bug with sending HP info to chat ([4e73e67](https://github.com/symposion/roll20-shaped-scripts/commit/4e73e67))
* **monster-import:** Don't strip bracketed info from spell names ([1326c7a](https://github.com/symposion/roll20-shaped-scripts/commit/1326c7a)), closes [#261](https://github.com/symposion/roll20-shaped-scripts/issues/261)
* **spell-import:** Update spell attributes to match 9.x sheet ([6a3f5b2](https://github.com/symposion/roll20-shaped-scripts/commit/6a3f5b2))
* **token-actions:** Fix broken token action creation for individual spells ([cdf7d1d](https://github.com/symposion/roll20-shaped-scripts/commit/cdf7d1d)), closes [#273](https://github.com/symposion/roll20-shaped-scripts/issues/273)
* **traits:** Don't warn when no uses value present ([a2f0a68](https://github.com/symposion/roll20-shaped-scripts/commit/a2f0a68)), closes [#256](https://github.com/symposion/roll20-shaped-scripts/issues/256)


### Features

* **monster-import:** --as option for monsters ([5c14ef7](https://github.com/symposion/roll20-shaped-scripts/commit/5c14ef7)), closes [#255](https://github.com/symposion/roll20-shaped-scripts/issues/255)
* **spell-import:** Fix higher level text to be in its own field ([5a21361](https://github.com/symposion/roll20-shaped-scripts/commit/5a21361)), closes [#278](https://github.com/symposion/roll20-shaped-scripts/issues/278)
* **traits:** Decrement traits by per_use value if present ([90bcd49](https://github.com/symposion/roll20-shaped-scripts/commit/90bcd49)), closes [#265](https://github.com/symposion/roll20-shaped-scripts/issues/265)


### BREAKING CHANGES

* spell-import: More 9.x only changes!
* config: This version of the script will no longer work with sheet versions prior to 9.0. DO NOT UPGRADE if you are still on sheet 7.x - it will not work and it is extremely hard to downgrade the script again afterwards.
* advantage-tracker: This no longer works with old versions of the sheet
* config: This no longer works with old versions of the sheet



<a name="4.10.0"></a>
# [4.10.0](https://github.com/symposion/roll20-shaped-scripts/compare/4.9.0...4.10.0) (2017-01-08)


### Bug Fixes

* **apply-defaults:** Stop bar changes causing data corruption ([fc74192](https://github.com/symposion/roll20-shaped-scripts/commit/fc74192))
* **parser:** Traits should allow for parenthesis. ([8df5e0d](https://github.com/symposion/roll20-shaped-scripts/commit/8df5e0d)), closes [#262](https://github.com/symposion/roll20-shaped-scripts/issues/262)
* **token-numbering:** Fix failure to apply token numbering ([b6e0f72](https://github.com/symposion/roll20-shaped-scripts/commit/b6e0f72))


### Features

* **config:** Add hide cost option to new character options ([a828aff](https://github.com/symposion/roll20-shaped-scripts/commit/a828aff)), closes [#266](https://github.com/symposion/roll20-shaped-scripts/issues/266)



<a name="4.9.0"></a>
# [4.9.0](https://github.com/symposion/roll20-shaped-scripts/compare/4.8.0...4.9.0) (2016-10-14)


### Features

* **rests:** Regain spell points and warlock slots on rests ([eb52191](https://github.com/symposion/roll20-shaped-scripts/commit/eb52191)), closes [#131](https://github.com/symposion/roll20-shaped-scripts/issues/131)



<a name="4.8.0"></a>
# [4.8.0](https://github.com/symposion/roll20-shaped-scripts/compare/4.7.0...4.8.0) (2016-10-13)


### Features

* **json-import:** Internal improvements to JSON database loading ([7a62d0c](https://github.com/symposion/roll20-shaped-scripts/commit/7a62d0c)), closes [#248](https://github.com/symposion/roll20-shaped-scripts/issues/248)



<a name="4.7.0"></a>
# [4.7.0](https://github.com/symposion/roll20-shaped-scripts/compare/4.6.1...4.7.0) (2016-10-11)


### Features

* **config:** Add Hit Dice Output and Show Rests to "!shaped-config" ([d5ab14b](https://github.com/symposion/roll20-shaped-scripts/commit/d5ab14b)), closes [#246](https://github.com/symposion/roll20-shaped-scripts/issues/246)



<a name="4.6.1"></a>
## [4.6.1](https://github.com/symposion/roll20-shaped-scripts/compare/4.6.0...4.6.1) (2016-10-03)


### Bug Fixes

* **chat-output:** Fix bug with multiple players with same forename ([a2898ce](https://github.com/symposion/roll20-shaped-scripts/commit/a2898ce)), closes [#243](https://github.com/symposion/roll20-shaped-scripts/issues/243)



<a name="4.6.0"></a>
# [4.6.0](https://github.com/symposion/roll20-shaped-scripts/compare/4.5.1...4.6.0) (2016-10-03)


### Features

* **import-statblock:** Changes to support parsing Tome of Beasts text ([6ebd6c6](https://github.com/symposion/roll20-shaped-scripts/commit/6ebd6c6))



<a name="4.5.1"></a>
## [4.5.1](https://github.com/symposion/roll20-shaped-scripts/compare/4.5.0...4.5.1) (2016-09-25)



<a name="4.5.0"></a>
# [4.5.0](https://github.com/symposion/roll20-shaped-scripts/compare/4.4.8...4.5.0) (2016-09-25)


### Features

* **blah:** test commit ([1209c22](https://github.com/symposion/roll20-shaped-scripts/commit/1209c22))



<a name="4.4.8"></a>
## [4.4.8](https://github.com/symposion/roll20-shaped-scripts/compare/4.4.7...4.4.8) (2016-09-25)


### Bug Fixes

* **apply-defaults:** Ensure apply-defaults saves the default token ([314b61d](https://github.com/symposion/roll20-shaped-scripts/commit/314b61d)), closes [#230](https://github.com/symposion/roll20-shaped-scripts/issues/230)
* **token-numbering:** NUMBERED shouldn't be applied to PC tokens ([d74c529](https://github.com/symposion/roll20-shaped-scripts/commit/d74c529)), closes [#231](https://github.com/symposion/roll20-shaped-scripts/issues/231)


### Features

* **token-vision:** Automatically set vision for PCs from senses ([8ad9077](https://github.com/symposion/roll20-shaped-scripts/commit/8ad9077)), closes [#229](https://github.com/symposion/roll20-shaped-scripts/issues/229)



<a name="4.4.7"></a>
## [4.4.7](https://github.com/symposion/roll20-shaped-scripts/compare/4.4.6...4.4.7) (2016-09-21)


### Features

* **import:** Automatically set default token for new characters where available ([8be1d30](https://github.com/symposion/roll20-shaped-scripts/commit/8be1d30))



<a name="4.4.6"></a>
## [4.4.6](https://github.com/symposion/roll20-shaped-scripts/compare/4.4.5...4.4.6) (2016-07-24)


### Bug Fixes

* **apply-defaults:** Apply vision settings from senses to tokens using apply-defaults ([30a5534](https://github.com/symposion/roll20-shaped-scripts/commit/30a5534))
* **statblock-import:** Relax matching on legendary action point text ([ccce353](https://github.com/symposion/roll20-shaped-scripts/commit/ccce353))



<a name="4.4.5"></a>
## [4.4.5](https://github.com/symposion/roll20-shaped-scripts/compare/4.4.4...4.4.5) (2016-07-22)


### Bug Fixes

* **config:** Fix spell text size option for new characters ([0dbf43c](https://github.com/symposion/roll20-shaped-scripts/commit/0dbf43c)), closes [#223](https://github.com/symposion/roll20-shaped-scripts/issues/223)



<a name="4.4.4"></a>
## [4.4.4](https://github.com/symposion/roll20-shaped-scripts/compare/4.4.3...4.4.4) (2016-07-20)


### Bug Fixes

* **config:** Fix broken show character name option ([2cca256](https://github.com/symposion/roll20-shaped-scripts/commit/2cca256))



<a name="4.4.3"></a>
## [4.4.3](https://github.com/symposion/roll20-shaped-scripts/compare/4.4.2...4.4.3) (2016-07-20)


### Bug Fixes

* **config:** fix order of hide options in config ui ([1bda2d4](https://github.com/symposion/roll20-shaped-scripts/commit/1bda2d4))
* **spell-import:** Set toggle_details to 0 after importing spells ([ef5d22e](https://github.com/symposion/roll20-shaped-scripts/commit/ef5d22e)), closes [#215](https://github.com/symposion/roll20-shaped-scripts/issues/215)



<a name="4.4.2"></a>
## [4.4.2](https://github.com/symposion/roll20-shaped-scripts/compare/4.4.1...4.4.2) (2016-07-19)


### Bug Fixes

* **config:** fix broken text size UI ([715eea0](https://github.com/symposion/roll20-shaped-scripts/commit/715eea0)), closes [#211](https://github.com/symposion/roll20-shaped-scripts/issues/211)
* **token-config:** Round fractional numbers on darkvision ([2f718f0](https://github.com/symposion/roll20-shaped-scripts/commit/2f718f0)), closes [#210](https://github.com/symposion/roll20-shaped-scripts/issues/210)



<a name="4.4.1"></a>
## [4.4.1](https://github.com/symposion/roll20-shaped-scripts/compare/4.4.0...4.4.1) (2016-07-19)



<a name="4.4.0"></a>
# [4.4.0](https://github.com/symposion/roll20-shaped-scripts/compare/4.3.0...4.4.0) (2016-07-18)


### Features

* **config:** Add hidden option for specifying custom skills data ([feace4d](https://github.com/symposion/roll20-shaped-scripts/commit/feace4d)), closes [#190](https://github.com/symposion/roll20-shaped-scripts/issues/190)



<a name="4.3.0"></a>
# [4.3.0](https://github.com/symposion/roll20-shaped-scripts/compare/4.2.0...4.3.0) (2016-07-18)


### Bug Fixes

* **config:** Correct name for hide saving throw DC option ([c686588](https://github.com/symposion/roll20-shaped-scripts/commit/c686588))
* **config:** Correct name for hide_freetext ([81e8fcd](https://github.com/symposion/roll20-shaped-scripts/commit/81e8fcd))


### Features

* **config:** Make applying config to manually created chars optional ([7f4d837](https://github.com/symposion/roll20-shaped-scripts/commit/7f4d837))
* **token-action:** Add option for adv/dis without "normal" ([358f6e7](https://github.com/symposion/roll20-shaped-scripts/commit/358f6e7))



<a name="4.2.0"></a>
# [4.2.0](https://github.com/symposion/roll20-shaped-scripts/compare/4.1.0...4.2.0) (2016-07-17)


### Bug Fixes

* **ability-maker:** Adjust ordering of default token actions ([d4a8305](https://github.com/symposion/roll20-shaped-scripts/commit/d4a8305)), closes [#185](https://github.com/symposion/roll20-shaped-scripts/issues/185)


### Features

* **ability-maker:** Add short option for advantage token actions ([5409e58](https://github.com/symposion/roll20-shaped-scripts/commit/5409e58)), closes [#186](https://github.com/symposion/roll20-shaped-scripts/issues/186)
* **config:** Add expertise_as_advantage option for new characters ([edd36cc](https://github.com/symposion/roll20-shaped-scripts/commit/edd36cc))
* **config:** Add hide options for new characters ([6da9521](https://github.com/symposion/roll20-shaped-scripts/commit/6da9521)), closes [#189](https://github.com/symposion/roll20-shaped-scripts/issues/189)
* **parsing:** Add a couple of custom skills for Kryx ([ea4df01](https://github.com/symposion/roll20-shaped-scripts/commit/ea4df01)), closes [#191](https://github.com/symposion/roll20-shaped-scripts/issues/191)



<a name="4.1.0"></a>
# [4.1.0](https://github.com/symposion/roll20-shaped-scripts/compare/4.0.2...4.1.0) (2016-07-17)


### Bug Fixes

* **advantage-tracker:** Make advantage tracker silent for new installs ([8e18711](https://github.com/symposion/roll20-shaped-scripts/commit/8e18711)), closes [#169](https://github.com/symposion/roll20-shaped-scripts/issues/169)
* **config:** Don't create attributes for sheet options with default values ([2db8c3a](https://github.com/symposion/roll20-shaped-scripts/commit/2db8c3a)), closes [#150](https://github.com/symposion/roll20-shaped-scripts/issues/150)
* **json-import:** Fix broken version validation ([2642432](https://github.com/symposion/roll20-shaped-scripts/commit/2642432)), closes [#192](https://github.com/symposion/roll20-shaped-scripts/issues/192)


### Features

* **ability-maker:** Remove "small" options and replace with new text size menu ([d949733](https://github.com/symposion/roll20-shaped-scripts/commit/d949733)), closes [#168](https://github.com/symposion/roll20-shaped-scripts/issues/168)
* **command-proc:** Implement security check + send messages to correct players ([d13072c](https://github.com/symposion/roll20-shaped-scripts/commit/d13072c)), closes [#165](https://github.com/symposion/roll20-shaped-scripts/issues/165)
* **config:** Apply character defaults to manually created characters. ([b09bb27](https://github.com/symposion/roll20-shaped-scripts/commit/b09bb27)), closes [#164](https://github.com/symposion/roll20-shaped-scripts/issues/164)
* **config:** Implement configuration for custom Saving throws ([55731c3](https://github.com/symposion/roll20-shaped-scripts/commit/55731c3))



<a name="4.0.2"></a>
## [4.0.2](https://github.com/symposion/roll20-shaped-scripts/compare/4.0.1...4.0.2) (2016-07-17)


### Bug Fixes

* **spell-import:** Fix bug with spells with material cost ([3eb033f](https://github.com/symposion/roll20-shaped-scripts/commit/3eb033f)), closes [#177](https://github.com/symposion/roll20-shaped-scripts/issues/177)



<a name="4.0.1"></a>
## [4.0.1](https://github.com/symposion/roll20-shaped-scripts/compare/4.0.0...4.0.1) (2016-06-29)


### Bug Fixes

* **shaped-support:** Get player HD working again with new translated output ([30fe836](https://github.com/symposion/roll20-shaped-scripts/commit/30fe836)), closes [#173](https://github.com/symposion/roll20-shaped-scripts/issues/173)



<a name="4.0.0"></a>
# [4.0.0](https://github.com/symposion/roll20-shaped-scripts/compare/3.1.1...4.0.0) (2016-06-28)


### Features

* **spell-import:** Support translations for various spell fields ([88d9615](https://github.com/symposion/roll20-shaped-scripts/commit/88d9615))


### BREAKING CHANGES

* spell-import: Will not work correctly with character sheet < 5.0.2



<a name="3.1.1"></a>
## [3.1.1](https://github.com/symposion/roll20-shaped-scripts/compare/3.1.0...3.1.1) (2016-06-19)


### Bug Fixes

* **ammo-processing:** Fix bug introduced in ammo handling in 3.1.0 ([f4e7723](https://github.com/symposion/roll20-shaped-scripts/commit/f4e7723)), closes [#161](https://github.com/symposion/roll20-shaped-scripts/issues/161)



<a name="3.1.0"></a>
# [3.1.0](https://github.com/symposion/roll20-shaped-scripts/compare/3.0.0...3.1.0) (2016-06-19)


### Bug Fixes

* **ammo-handling:** Ensure that auto ammo handling only happens when switched on ([6503033](https://github.com/symposion/roll20-shaped-scripts/commit/6503033)), closes [#154](https://github.com/symposion/roll20-shaped-scripts/issues/154)
* **hit-dice:** Fix HD rolling for latest sheet ([c7a4309](https://github.com/symposion/roll20-shaped-scripts/commit/c7a4309))
* **rest-handling:** Fix errors on rest when HP and HD values not set ([b0f1858](https://github.com/symposion/roll20-shaped-scripts/commit/b0f1858)), closes [#157](https://github.com/symposion/roll20-shaped-scripts/issues/157)


### Features

* **spell-import:** Support adding casting stat to secondary damage (for Green Flame Blade) ([a33e59f](https://github.com/symposion/roll20-shaped-scripts/commit/a33e59f)), closes [#152](https://github.com/symposion/roll20-shaped-scripts/issues/152)



<a name="3.0.0"></a>
# [3.0.0](https://github.com/symposion/roll20-shaped-scripts/compare/2.5.0...3.0.0) (2016-06-12)


### Bug Fixes

* **command-parsing:** Allow spaces in option strings ([d56cceb](https://github.com/symposion/roll20-shaped-scripts/commit/d56cceb))
* **config:** Update configuration options to match changes for sheet 4.2.1 ([f28e8fe](https://github.com/symposion/roll20-shaped-scripts/commit/f28e8fe))


### BREAKING CHANGES

* config: This resets most of the default new character settings - you will need to put them back to your desired values using !shaped-config



<a name="2.5.0"></a>
# [2.5.0](https://github.com/symposion/roll20-shaped-scripts/compare/2.4.2...2.5.0) (2016-06-06)


### Features

* **abilities:** Add default token action option for spells ([456220e](https://github.com/symposion/roll20-shaped-scripts/commit/456220e)), closes [#143](https://github.com/symposion/roll20-shaped-scripts/issues/143)



<a name="2.4.2"></a>
## [2.4.2](https://github.com/symposion/roll20-shaped-scripts/compare/2.4.1...2.4.2) (2016-06-05)



<a name="2.4.1"></a>
## [2.4.1](https://github.com/symposion/roll20-shaped-scripts/compare/2.4.0...2.4.1) (2016-06-05)



<a name="2.4.0"></a>
# [2.4.0](https://github.com/symposion/roll20-shaped-scripts/compare/2.3.1...2.4.0) (2016-06-05)


### Bug Fixes

* **hp-rolling:** Fix HP rolling on drop bug introduced in last release ([66bc93f](https://github.com/symposion/roll20-shaped-scripts/commit/66bc93f)), closes [#136](https://github.com/symposion/roll20-shaped-scripts/issues/136)


### Features

* **abilities:** Add "spells" option for token actions ([21c0538](https://github.com/symposion/roll20-shaped-scripts/commit/21c0538)), closes [#137](https://github.com/symposion/roll20-shaped-scripts/issues/137)



<a name="2.3.1"></a>
## [2.3.1](https://github.com/symposion/roll20-shaped-scripts/compare/2.3.0...2.3.1) (2016-05-16)



<a name="2.3.0"></a>
# [2.3.0](https://github.com/symposion/roll20-shaped-scripts/compare/2.2.0...2.3.0) (2016-05-15)


### Features

* **configuration:** Allow configuring of default token actions ([3a9d8af](https://github.com/symposion/roll20-shaped-scripts/commit/3a9d8af))
* **configuration:** Make token-defaults apply character defaults ([9b25171](https://github.com/symposion/roll20-shaped-scripts/commit/9b25171))
* **import:** Update token bars for original token on import ([df4af6e](https://github.com/symposion/roll20-shaped-scripts/commit/df4af6e)), closes [#128](https://github.com/symposion/roll20-shaped-scripts/issues/128)



<a name="2.2.0"></a>
# [2.2.0](https://github.com/symposion/roll20-shaped-scripts/compare/2.1.1...2.2.0) (2016-05-04)


### Bug Fixes

* **abilities:** Fix multi-token ability creation([8572d0d](https://github.com/symposion/roll20-shaped-scripts/commit/8572d0d)), closes [#120](https://github.com/symposion/roll20-shaped-scripts/issues/120)
* **AdvTrack:** Command respects IgnoreNpcs option([3f40533](https://github.com/symposion/roll20-shaped-scripts/commit/3f40533))
* **AdvTrack:** Make output more consistent([a72090d](https://github.com/symposion/roll20-shaped-scripts/commit/a72090d))


### Features

* **abilities:** Add --attacksMacro to launch chat window attack macro([03e035c](https://github.com/symposion/roll20-shaped-scripts/commit/03e035c))
* **abilities:** Add rest options for ability creation([1b25670](https://github.com/symposion/roll20-shaped-scripts/commit/1b25670)), closes [#124](https://github.com/symposion/roll20-shaped-scripts/issues/124)
* **abilities:** Allow creation of abilities for individual traits([b108466](https://github.com/symposion/roll20-shaped-scripts/commit/b108466)), closes [#116](https://github.com/symposion/roll20-shaped-scripts/issues/116)



<a name="2.1.1"></a>
## [2.1.1](https://github.com/symposion/roll20-shaped-scripts/compare/2.1.0...2.1.1) (2016-05-03)


### Bug Fixes

* **AdvTrack:** Token selection no longer required([b2ad644](https://github.com/symposion/roll20-shaped-scripts/commit/b2ad644))



<a name="2.1.0"></a>
# [2.1.0](https://github.com/symposion/roll20-shaped-scripts/compare/2.0.0...2.1.0) (2016-05-02)


### Bug Fixes

* **config:** Make config UI fit on small displays([dfbbdfc](https://github.com/symposion/roll20-shaped-scripts/commit/dfbbdfc))


### Features

* **AT:** Support passing character ID([d4f1d11](https://github.com/symposion/roll20-shaped-scripts/commit/d4f1d11))



<a name="2.0.0"></a>
# [2.0.0](https://github.com/symposion/roll20-shaped-scripts/compare/1.5.1...2.0.0) (2016-05-01)


### Bug Fixes

* **config:** Fix up bad values in option lists([12b82f6](https://github.com/symposion/roll20-shaped-scripts/commit/12b82f6))
* **hpRolling:** Fix hp rolling after sheet macro name changes([722059c](https://github.com/symposion/roll20-shaped-scripts/commit/722059c))


### Features

* **abilities:** Support small text ability checks macros([44adbc4](https://github.com/symposion/roll20-shaped-scripts/commit/44adbc4)), closes [#67](https://github.com/symposion/roll20-shaped-scripts/issues/67)
* **config:** Add option for default char sheet page([2aac251](https://github.com/symposion/roll20-shaped-scripts/commit/2aac251)), closes [#105](https://github.com/symposion/roll20-shaped-scripts/issues/105)
* **tokens:** Auto-configure vision based on senses([633a708](https://github.com/symposion/roll20-shaped-scripts/commit/633a708)), closes [#15](https://github.com/symposion/roll20-shaped-scripts/issues/15)


### BREAKING CHANGES

* abilities: S: !shaped-abilities option names have changed to be camelCase to match
all the other options in the script. Sorry for any inconvenience but they were getting unreadable
and there's no reason for them to be different.



<a name="1.5.1"></a>
## [1.5.1](https://github.com/symposion/roll20-shaped-scripts/compare/1.5.0...1.5.1) (2016-05-01)


### Bug Fixes

* **import:** Fix bug with import commands introduced in 1.5.0([71e1f1a](https://github.com/symposion/roll20-shaped-scripts/commit/71e1f1a))



<a name="1.5.0"></a>
# [1.5.0](https://github.com/symposion/roll20-shaped-scripts/compare/1.4.3...1.5.0) (2016-04-30)


### Bug Fixes

* **abilities:** Alter macro names to fix naming collisions([acee188](https://github.com/symposion/roll20-shaped-scripts/commit/acee188)), closes [#4](https://github.com/symposion/roll20-shaped-scripts/issues/4)


### Features

* **rests:** Support passing character ID option([3dae840](https://github.com/symposion/roll20-shaped-scripts/commit/3dae840))
* **spell-import:** Allow spell import option to import spells according to criteria([9a730eb](https://github.com/symposion/roll20-shaped-scripts/commit/9a730eb)), closes [#9](https://github.com/symposion/roll20-shaped-scripts/issues/9)



<a name="1.4.3"></a>
## [1.4.3](https://github.com/symposion/roll20-shaped-scripts/compare/1.4.2...1.4.3) (2016-04-29)



<a name="1.4.2"></a>
## [1.4.2](https://github.com/symposion/roll20-shaped-scripts/compare/1.4.1...1.4.2) (2016-04-29)



<a name="1.4.1"></a>
## [1.4.1](https://github.com/symposion/roll20-shaped-scripts/compare/1.4.0...1.4.1) (2016-04-29)




<a name="1.4.0"></a>
# [1.4.0](https://github.com/symposion/roll20-shaped-scripts/compare/1.3.4...1.4.0) (2016-04-29)


### Bug Fixes

* **config:** Fix upgrade crash ([77bb76c](https://github.com/symposion/roll20-shaped-scripts/commit/77bb76c)), closes [#85](https://github.com/symposion/roll20-shaped-scripts/issues/85)
* **rests:** Fix crash on undefined trait uses ([4b84523](https://github.com/symposion/roll20-shaped-scripts/commit/4b84523))
* **rests:** Fix infinite loop of rest calls ([3879fb5](https://github.com/symposion/roll20-shaped-scripts/commit/3879fb5))
* **rests:** Quickly fix long/short rest buttons to respond to every press ([6d1327b](https://github.com/symposion/roll20-shaped-scripts/commit/6d1327b))
* **Rests:** Make recharge types more forgiving ([2f75d99](https://github.com/symposion/roll20-shaped-scripts/commit/2f75d99))
* **spell-import:** Fix duplicate spell description text on import ([95a8fbc](https://github.com/symposion/roll20-shaped-scripts/commit/95a8fbc)), closes [#84](https://github.com/symposion/roll20-shaped-scripts/issues/84)

### Features

* Add short/long rest command support ([30768fd](https://github.com/symposion/roll20-shaped-scripts/commit/30768fd))
* **rests:** Add new long rest house rule ([4f9ebcc](https://github.com/symposion/roll20-shaped-scripts/commit/4f9ebcc))
* **Rests:** Support sheet rest buttons ([57075db](https://github.com/symposion/roll20-shaped-scripts/commit/57075db))
* **traits:** Add auto consume traits ([68793ba](https://github.com/symposion/roll20-shaped-scripts/commit/68793ba))



<a name="1.3.4"></a>
## [1.3.4](https://github.com/symposion/roll20-shaped-scripts/compare/1.3.3...1.3.4) (2016-04-23)


### Bug Fixes

* **spell-slots:** Disable spell slot handling, not ready for use yet. ([dac9f21](https://github.com/symposion/roll20-shaped-scripts/commit/dac9f21))
* **spell-slots:** Prevent error when normal spell slots are missing - e.g. for warlock spells. ([5f75e45](https://github.com/symposion/roll20-shaped-scripts/commit/5f75e45))



<a name="1.3.3"></a>
## [1.3.3](https://github.com/symposion/roll20-shaped-scripts/compare/1.3.2...1.3.3) (2016-04-23)




<a name="1.3.2"></a>
## [1.3.2](https://github.com/symposion/roll20-shaped-scripts/compare/1.3.1...1.3.2) (2016-04-23)




<a name="1.3.1"></a>
## [1.3.1](https://github.com/symposion/roll20-shaped-scripts/compare/1.3.0...1.3.1) (2016-04-23)




<a name="1.3.0"></a>
# [1.3.0](https://github.com/symposion/roll20-shaped-scripts/compare/1.2.0...1.3.0) (2016-04-23)


### Bug Fixes

* irrelevant command line arguments are no lnger saved to state, fixes #34 ([afe41eb](https://github.com/symposion/roll20-shaped-scripts/commit/afe41eb)), closes [#34](https://github.com/symposion/roll20-shaped-scripts/issues/34)
* **json-import:** Make it more tolerant of patch versions of JSON files ([6e69ec6](https://github.com/symposion/roll20-shaped-scripts/commit/6e69ec6))
* **statblock-import:** Escape &lt; etc ([2341642](https://github.com/symposion/roll20-shaped-scripts/commit/2341642))

### Features

* **abilities:** Added advTracker query action ([1d03b56](https://github.com/symposion/roll20-shaped-scripts/commit/1d03b56))
* **abilities:** Added advTracker token actions ([9e48348](https://github.com/symposion/roll20-shaped-scripts/commit/9e48348))
* **advTracker:** Add auto revert option ([c43bb50](https://github.com/symposion/roll20-shaped-scripts/commit/c43bb50))
* **configUI:** Added additional Advantage Tracker options ([b94b9d3](https://github.com/symposion/roll20-shaped-scripts/commit/b94b9d3))
* **hpRolling:** Set values for all non-linked attributes, not just HP ([b1b51c2](https://github.com/symposion/roll20-shaped-scripts/commit/b1b51c2))
* **spell-slots:** Automatically decrement spell slots on casting ([4c98d13](https://github.com/symposion/roll20-shaped-scripts/commit/4c98d13))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/symposion/roll20-shaped-scripts/compare/1.1.2...1.2.0) (2016-04-19)


### Bug Fixes

* **abilities:** Don't create lots of junk token actions for multiple tokens from same char ([c53a4fe](https://github.com/symposion/roll20-shaped-scripts/commit/c53a4fe))
* **build:** Fix changelog compare links ([59436ed](https://github.com/symposion/roll20-shaped-scripts/commit/59436ed))
* **build:** Inject correct version number into released script. ([431c1d4](https://github.com/symposion/roll20-shaped-scripts/commit/431c1d4))
* **command-parser:** Report errors for unresolved options when comma-separated ([6e1cad9](https://github.com/symposion/roll20-shaped-scripts/commit/6e1cad9))
* **docs:** Prune TOC slightly and ensure README gets committed ([aa43e7a](https://github.com/symposion/roll20-shaped-scripts/commit/aa43e7a))
* **docs:** Unmangle docs for roll20 script page - they don't deal well with linebreaks. ([9e38035](https://github.com/symposion/roll20-shaped-scripts/commit/9e38035))

### Features

* **statblock-import:** Read statblocks from character GM notes as well as tokens. ([1b3d594](https://github.com/symposion/roll20-shaped-scripts/commit/1b3d594))



<a name="1.1.2"></a>
## [1.1.2](https://github.com/symposion/roll20-shaped-scripts/compare/1.1.1...1.1.2) (2016-04-19)




<a name="1.1.1"></a>
## [1.1.1](https://github.com/symposion/roll20-shaped-scripts/compare/1.1.0...1.1.1) (2016-04-19)


### Bug Fixes

* **spell-import:** Make it expand all gender pronoun placeholders in the emote ([acf580a](https://github.com/symposion/roll20-shaped-scripts/commit/acf580a)), closes [#39](https://github.com/symposion/roll20-shaped-scripts/issues/39)



<a name="1.1.0"></a>
# [1.1.0](https://github.com/symposion/roll20-shaped-scripts/compare/1.0.3...1.1.0) (2016-04-18)


### Bug Fixes

* **abilities:** Changed to not create a macro action when there are no corresponding actions. ([335fdd9](https://github.com/symposion/roll20-shaped-scripts/commit/335fdd9)), closes [#2](https://github.com/symposion/roll20-shaped-scripts/issues/2)
* **hpRoll:** Fix hp rolling to respect max setting for token bar ([b18e2a4](https://github.com/symposion/roll20-shaped-scripts/commit/b18e2a4)), closes [#23](https://github.com/symposion/roll20-shaped-scripts/issues/23)
* **statblock:** Support statblock abilities in two line format ([d7904b0](https://github.com/symposion/roll20-shaped-scripts/commit/d7904b0))

### Features

* **config:** Add auto HD and Roll HD on drop options to config UI ([4e08a92](https://github.com/symposion/roll20-shaped-scripts/commit/4e08a92)), closes [#25](https://github.com/symposion/roll20-shaped-scripts/issues/25)
* **config:** Support max dex for medium armor and half-proficiency saves houserules ([0868c9a](https://github.com/symposion/roll20-shaped-scripts/commit/0868c9a))



<a name="1.0.3"></a>
## [1.0.3](https://github.com/symposion/roll20-shaped-scripts/compare/1.0.2...1.0.3) (2016-04-17)




<a name="1.0.2"></a>
## [1.0.2](https://github.com/symposion/roll20-shaped-scripts/compare/1.0.1...1.0.2) (2016-04-16)


### Bug Fixes

* **build:** Attempt to fix not-deterministic problem with github releases ([c408f87](https://github.com/symposion/roll20-shaped-scripts/commit/c408f87))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/symposion/roll20-shaped-scripts/compare/1.0.0...1.0.1) (2016-04-16)




<a name="1.0.0"></a>
# [1.0.0](https://github.com/symposion/roll20-shaped-scripts/compare/58c2b63...1.0.0) (2016-04-16)


### Bug Fixes

* **build:** add push so that version numbering actually gets applies ([0e96b0b](https://github.com/symposion/roll20-shaped-scripts/commit/0e96b0b))
* **build:** another go at fixing the build ([2441bc9](https://github.com/symposion/roll20-shaped-scripts/commit/2441bc9))
* **build:** another go at fixing the build ([6dd25e3](https://github.com/symposion/roll20-shaped-scripts/commit/6dd25e3))
* **build:** Attempt to get changelog working ([58c2b63](https://github.com/symposion/roll20-shaped-scripts/commit/58c2b63))


### BREAKING CHANGES

* build: testing if this works



