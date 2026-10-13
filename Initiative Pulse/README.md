# Initiative Pulse

Version 1.5.0 — maintained by Kingkiller546.

**Upgrade from 1.0.0:** Effects now belong to selected tokens and tick at token turn-end. Existing unassigned Effects remain paused until bound in Inspect; round notifications no longer decrement them. Disable the separate Manual Concentration and TrackDuration scripts before enabling this version.

## WHAT IT DOES
Announces initiative Actions; shows duration counters in token names; handles
click-to-roll concentration saves after damage. Concentration loss removes the
associated effect and counter. Starting new concentration replaces the old
spell on that token and invalidates its outstanding save buttons.

## REQUIREMENTS
A Roll20 game with Mod/API access. No required companion scripts.
Initiative Tracker Plus is optional and supplies !eot if installed. Native turn
tracker buttons work too. ScriptCards is optional for its alternative menu.
This script neither sorts nor advances the tracker. TokenMod is not required.
Only numeric save attributes are supported; sheet formulas are not evaluated.
D&D 5E (2014) by Roll20 is the default. Optional 2024 sheet support uses
getSheetItem and requires the Experimental API sandbox; no companion Mod is needed.

## INSTALL
1. Back up the script/state or test in a copied game before upgrading.
2. Disable older Initiative Pulse copies, Manual Concentration and TrackDuration.
     Clear TrackDuration's own effects first to restore its token names.
3. Add the contents of 1.5.0/InitiativePulse.js as one custom Mod script and save/restart the sandbox.
4. Run !pulse setup (also available from !pulse-menu). Choose the game sheet
     and HP bar. Select linked tokens and use Check selected tokens to verify.
5. If using the optional ScriptCards macro, reinstall it from the Pulse menu.

Existing Pulse state is retained. Old effects with no token are paused; select
one token and use Bind in Inspect. Existing Manual Concentration names are
imported once if their tokens still have the configured concentration marker.
Unsigned save buttons from that older script are rejected; request a fresh save.
Legacy multiple concentration records are not silently deleted at startup;
starting new concentration replaces them together. Review old records in Inspect.

## QUICK START
Select token(s), run !pulse-menu and choose Add Effect. Supply a name, duration,
symbol and Concentration Yes/No. No is the default.
    !pulse effect Haste %% 10 %% ⭐ %% yes
    !pulse effect Poison %% 3 %% 🔹 %% no
Effects lose one count when the affected token's turn ends.
    !pulse action Lair Action %% 20 %% yes
Actions trigger when a forward advance crosses their initiative. Repeat takes
yes or no. Sorting, priority edits and unrecognised changes rebaseline without
announcing Actions. !pulse-round is retained for compatibility, not countdowns.

## CONCENTRATION
Each selected token is treated as its own concentrator. The new spell replaces
any prior concentration on that token. Ordinary effects stay in place. There
is no caster-to-other-target linking: do not select spell targets to represent
a different token's concentration.

Detected HP decreases prompt a save with DC max(10, floor(damage / 2)). Click to
roll; saves are not automatic. GM and token/character controllers can use the
button. On 2014/custom sheets the configured advantage attribute equals 1 to
roll two d20s, keep high. Setup can explicitly turn concentration advantage on
or off per character; 2024 characters default to no advantage until configured.
Missing/non-numeric save modifiers block the roll with a GM warning; fix the
attribute and retry the same button. Blank HP is unknown, not zero.
Failure, zero HP, a configured breaking condition, or removing the concentration
marker ends concentration and removes its counter. Marker changes made by other
scripts are checked every 250 ms; HP and conditions have a 500 ms fallback.
Save buttons are single-use and bound to their original concentration session.
Checks for hidden tokens go to the GM. Normal checks are public.

PCs and NPCs both use constitution_save_bonus by default. This is the total
saving throw bonus; no proficiency is added again. Zero and negative bonuses
are valid. Missing or non-numeric values block the roll; there is no fallback
to npc_con_save, npc_con_save_base or constitution_mod.
Setting a different saveAttribute applies that mapping to PCs and NPCs alike.
!pulse diagnose shows the attribute and value actually used.
Attribute reference: https://wiki.roll20.net/D%26D5E_by_Roll20

This update corrects the earlier pre-release default constitution_save_mod to
constitution_save_bonus. Saved defaults are migrated once on restart, including
settings saved before the Setup Manager existed. Custom attribute names and an
explicit custom legacy profile are preserved. Migration invalidates outstanding
save buttons; request fresh checks when needed.

## SETUP MANAGER
Run `!pulse setup`, or click Setup in the main Pulse menu. This menu does not
require ScriptCards. All Setup changes are GM-only and survive sandbox restarts.

- Game default: 2014, 2024 or custom legacy sheet. Installing this update keeps
  existing settings and uses 2014 until the GM chooses otherwise.
- Selected characters: choose a sheet override, or Use game default to remove
  the override. Mixed games are supported through these explicit choices;
  Pulse does not guess which sheet a character uses.
- Concentration advantage: Yes, No or Default for selected characters. Set Yes
  for War Caster. Default reads the configured legacy attribute on 2014/custom
  sheets; it means No on 2024 sheets. This does not automatically inspect feats.
- HP bar, concentration marker, breaking conditions and advanced save fields
  can be changed using the menu. Character choices apply to every token linked
  to that character; HP bar and marker choices apply to the whole game.
- Check selected tokens shows the resolved sheet, save field, numeric bonus,
  advantage and watched HP bar. Link each token to its character, and link the
  watched bar to the character's HP so sheet damage updates that bar.

For 2024 PCs and NPCs, Pulse reads the numeric `constitution_save_bonus`
computed property using Roll20's asynchronous `getSheetItem` API. It uses the
total directly, without adding proficiency again or reading legacy attributes.
If your sheet exposes a different total, change `computedSaveAttribute`.
Custom Beacon properties use the `user.` prefix. Other Beacon sheet systems
are not claimed supported.

2024 games must select the Experimental API sandbox and restart it. Missing,
invalid or failed sheet reads show a warning and preserve the save button for
retry. Reads time out after 10 seconds; late results are ignored. Duplicate
clicks cannot roll twice. A changed spell, configuration, character link,
controller permission, missing marker or zero HP prevents a stale result.
Only the numeric save total and explicit advantage choice are applied; special
feat rules, bonus dice and the sheet's full roll automation are not reproduced.
Sheet selection changes data access, not the concentration DC rule.

References: [Roll20 Beacon API guidance](https://help.roll20.net/hc/en-us/articles/30377793782423-How-to-Update-Mod-Scripts-API-for-D-D-2024-Beacon)
and [Roll20's published 2024 save fields](https://blog.roll20.net/posts/dd-2024-automations-are-here/).

## SETTINGS (GM ONLY; SAVED BETWEEN RESTARTS)
Run !pulse config to display the current settings. Set one option per command:
    !pulse config hpBar 1
    !pulse config sheet 2014
    !pulse config computedSaveAttribute constitution_save_bonus
    !pulse config saveAttribute constitution_save_bonus
    !pulse config warcasterAttribute warcaster
    !pulse config marker chained-heart
    !pulse config conditions interdiction=Incapacitated,pummeled=Paralysed,frozen-orb=Petrified,fist=Stunned,sleepy=Unconscious
    !pulse config conditions none
HP bar can be 1, 2 or 3. Attribute names must match your sheet. The defaults are
not a promise of compatibility with every 5e sheet. Verify with !pulse diagnose.
Condition labels above are inherited mappings, not universal Roll20 meanings;
set them to match your game or explicitly disable condition monitoring.
Custom marker tags such as Focus::123 are accepted; use the exact tag from your
campaign. End existing concentration before changing its marker.
Settings changes invalidate pending saves and reset HP baselines. If needed,
request fresh saves afterward. Only trusted GMs can alter settings.

## COMMAND REFERENCE
!pulse-menu                         Main menu
!pulse setup                        Setup Manager (GM only)
!pulse setup sheet 2024              Set game default (2014 / 2024 / custom)
!pulse setup selected-sheet 2024     Override selected characters (or default)
!pulse setup advantage yes           Selected character advantage (yes / no / default)
!pulse inspect                      Effects, Edit, Remove, Bind and Request Save
!pulse token-effect ...              Alias of !pulse effect
!pulse edit E3 %% 5                  Set remaining token turns; zero removes
!pulse remove E3                     Remove an effect by its displayed ID
!pulse bind E3                       Bind an unassigned effect to one selected token
!pulse config                       Display settings
!pulse diagnose                     Check selected tokens' sheet/HP settings
!pulse clear                        Clear Actions, Effects and named manual concentration
!pulse install-macro                Install main menu macro for the GM
!pulse install-clear-macro          Install Clear Combat macro for the GM
!pulse install-scriptcards-macro    Optional ScriptCards menu
!pulse clean                        Remove this GM's Pulse macros and reset Pulse state
!concentration start --token ID --name NAME
    Start concentration without a duration counter, replacing prior concentration.
!concentration stop --token ID
    End concentration and its effect.
!concentration check --token ID --dc 10
    Request a fresh single-use save button.
!concentration debug
    Toggle GM HP-change diagnostics.
!concentration roll --token ID --check ID
    Generated by save buttons. Do not substitute old --dc roll macros.

Token and concentration management through !pulse is GM/API-only. The standalone
!concentration commands allow the GM and controllers of the specified token.

## KNOWN LIMITS
- Two-entry forward/backward swaps look identical and count as forward. Rewinds
    do not restore expired effects. Correct remaining durations through Edit.
- One actor plus ITP's changing round marker works. A lone unchanged tracker
    entry cannot signal an end of turn.
- A manual one-step rotation is indistinguishable from a turn advance.
- Damage is inferred from HP decreases, not individual damage rolls. Temporary
    HP and multiple hits between polls require a manual check when not reflected
    correctly in the watched bar. A removal/re-add between polls can go unseen.
- Each token is independent. Duplicate tokens for one character may produce
    duplicate checks if both are marked; use one active concentrator token.
- Other scripts which continually overwrite token names/markers can conflict.
- Existing unrelated concentration markers are preserved on routine cleanup;
    an explicit stop or failed check removes the concentration marker.

## TESTING
Install only InitiativePulse.js in Roll20; do not install files under tests/.
Local regression tests use Node.js and mocked Roll20 objects, not a live VTT:
    node tests/test-token-clock.js
    node tests/test-itp-eot.js
    node tests/test-integrated-concentration.js
The local suite passes 105 simulated scenarios, including mixed sheet choices,
2024 reads, errors/timeouts, duplicate clicks and changes while reads are pending.
The maintainer previously confirmed the ScriptCards forms, EOT and marker-removal
behaviour live. The new Setup Manager and 2024 integration still require live
Roll20 testing; simulation results are not a claim of live sheet compatibility.

## Licence and attribution

Released under the repository’s [MIT licence](../LICENSE).

**Kingkiller546** authored both the original Initiative Pulse and Manual Concentration scripts and maintains this combined script.

Credit to **keithcurtis1** for the idea to merge the token countdown into Initiative Pulse. This acknowledges the merge idea, not authorship of Initiative Pulse or the concentration script.

Initiative Tracker Plus and ScriptCards are optional integrations, not bundled source.

## ScriptCards interactive launcher

Run `!pulse install-scriptcards-macro` after updating Pulse to replace the existing `Initiative-Pulse-ScriptCards` macro. Requires ScriptCards. Choose Action or Effect in the initial dropdown; only the chosen branch opens its interactive detail form. Repeat and Concentration accept yes or no. Effect duration uses affected-token turns.

Select the affected token before launching Effect. This form passes the first selected token ID explicitly to Pulse because API-to-API calls do not carry normal selection. The native `!pulse-menu` still supports selecting multiple tokens. Action does not require a token.
