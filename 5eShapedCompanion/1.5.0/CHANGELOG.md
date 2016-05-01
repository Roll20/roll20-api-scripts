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



