# Initiative Pulse

Initiative Pulse is an independent Roll20 Mod (API) script for timed combat announcements. It stores GM-created Actions and Effects, but leaves the campaign turn order and token presentation entirely alone.

## Behavior

- Actions announce when normal descending initiative crosses their threshold. One-shot Actions are then removed; repeating Actions remain for later rounds.
- Effects decrement once for each distinct `!pulse-round` value and announce either their remaining duration or expiry.
- Initiative Tracker Plus (ITP) remains responsible for turns, halos, `!eot`, and round handling. Initiative Pulse observes `!eot` without replying to it or changing its behavior.
- `!itp -clear` also clears Initiative Pulse's stored Actions and Effects.
- Games without ITP can install a separate **Clear-Combat** macro to clear stored combat entries explicitly.

All commands that change or display Initiative Pulse data are GM-only. API-generated `!pulse-round` and `!itp -clear` messages are also accepted for integration.

## Commands

| Command | Purpose |
| --- | --- |
| `!pulse action Name %% Initiative %% Repeat` | Add an Action. Initiative may be any number. Repeat accepts `yes` or `no`. |
| `!pulse effect Name %% Duration` | Add an Effect lasting a positive whole number of rounds. |
| `!pulse-menu` | Open the native GM Action/Effect menu. |
| `!pulse install-macro` | Create or update the **Initiative-Pulse** GM macro, which opens the native menu. |
| `!pulse install-scriptcards-macro` | Create or update an optional ScriptCards menu macro when ScriptCards is installed. |
| `!pulse install-clear-macro` | Create or update the separate **Clear-Combat** GM macro. |
| `!pulse clear` | Clear all stored Actions and Effects without changing the tracker or ITP. |
| `!pulse inspect` | List current Actions and Effects. |
| `!pulse clean` | Remove the invoking GM's three Initiative Pulse macros and reset Initiative Pulse state. |

Examples:

```text
!pulse action Lair action %% 20 %% yes
!pulse action Falling portcullis %% 12.5 %% no
!pulse effect Bless %% 3
!pulse-round 4
```

## ITP integration

Configure ITP (or another GM/API workflow) to send a notification in this form once per round:

```text
!pulse-round ROUND_IDENTIFIER
```

The identifier can be a round number or other unique text. Repeating the same identifier does not decrement Effects twice. When ITP sends `!itp -clear`, Initiative Pulse clears its own combat entries while allowing ITP's handler to process the same message normally.

Initiative Pulse never calls an end-turn command and never writes `Campaign().turnorder`. Tracker changes are read only to detect movement from the previous active initiative value to the new one.

## ScriptCards

If ScriptCards is installed, `!pulse install-scriptcards-macro` creates a ScriptCards-styled launcher. ScriptCards is optional and is not a dependency of Initiative Pulse.

## License and provenance

Initiative Pulse was independently authored from the behavior described above. It contains no ACT or ACT2 source code and claims no credit for those projects. As part of the Roll20 API Scripts repository, this contribution is released under the repository's MIT License.
