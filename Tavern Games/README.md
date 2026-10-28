# Tavern Games

**Version 2.6.2 · Kingkiller546 · MIT**

Seven fantasy tavern dice games for Roll20 Mod/API: Liar's Dice, Three-Dragon Ante (a blackjack-style **dice variant**, not the official card game), Gelt, Goblin's Challenge, Classic Dice, Wizard's Duel and Treasure Hunt. Rules and house defaults below describe this implementation; no official publisher affiliation or complete commercial card-game implementation is claimed.

## Install and start

A Roll20 game with Mod/API access is required. Install **one copy** of `TavernGames.js`; use the matching version directory for manual installation. Do not install tests or the ScriptCards test fixture. When available through One-Click, select Tavern Games there instead of adding a second manual copy.

ScriptCards is **optional and recommended** for styled menus and dice fonts. Install it separately if desired; Tavern Games does not change it. The tested official ScriptCards runtime identifies itself as 3.0.23d (repository release 3.0.23). Missing ScriptCards, explicit plain menus or recipient names incompatible with ScriptCards's settings use native chat presentation. Metadata deliberately has no hard ScriptCards dependency because the games also work without it.

1. Enter `!tavern` or `!tavern games`, then choose a game. The selector has seven game-navigation buttons and an All game rules handout link.
2. GM opens **New Lobby** inside that game's menu. Players join characters they control, using a character ID from its Journal URL; GM adds named NPC seats.
3. For a wagering game, GM chooses CP/SP/EP/GP/PP and its stake/ante/bet, or free play. Amounts are nonnegative whole denomination units. Gelt has a separate reroll fee in the same denomination.
4. GM starts; use the refreshed private buttons. Rules are accessible to everyone. Only one game is active at a time; End before switching. Completed hands/rounds use GM Next Hand/Next Round/Next Hunt.

Join order is seat order. There is one player seat per joining player and one per character, including shared-controlled characters; the joining player owns that seat. A maximum of 12 seats applies: Liar/Ante/Gelt/Classic require 2-12, Goblin 3-6, Duel exactly 2 and Hunt 1-12. GM can run every NPC using explicit seat-labelled actions. Losing character control blocks that seat's actions/private access.

All currency is a **fictional ledger**. The script never reads or changes character money, points, conditions, sheet attributes or tokens. No bankroll, all-in, side-pot or currency-conversion rules are assumed. Safe-integer arithmetic rejects overflow before collection/settlement. Gelt reserves headroom for doubling; Classic checks signed net and gross returns.

## Commands and session controls

| Command | Use |
| --- | --- |
| `!tavern` | Current active game menu, or the game selector |
| `!tavern games` / `!tavern games-plain` | Seven-game selector, styled/plain |
| `!tavern rules` | Current game's rules (Liar's Dice if none active) |
| `!tavern GAME-menu` / `!tavern GAME-rules` | Specific game's menu/rules |
| `!tavern GAME-plain` | Plain menu; use `!tavern plain` for Liar's Dice |
| `!tavern refresh-rules` | GM-only maintained rules-handout refresh |

GAME prefixes are `liars`, `ante`, `gelt`, `goblin`, `classic`, `duel`, `hunt`; Liar's Dice uses the historical unprefixed mutation commands. Use generated buttons for setup, joining, bets and rolls: mutation commands carry revision tickets and explicit seat IDs where needed. Typing old button commands manually does not bypass permissions or stale-action checks. The legacy `!tavern hand`/NPC hand command remains compatible; inline private hands make separate hand buttons unnecessary.

GM **Pause/Resume** preserves seats, private dice, phase, turn, points, bets, pool and round without rerolls or charges. **Manual End** clears the entire active lobby/game and any unsettled/carried recorded pot **without payout**, invalidates buttons and emits one Game ended card. It does not automatically create a new lobby. Refresh and sandbox restart never collect or pay again. Restart preserves persistent games but expires old action buttons; refresh menus afterward.

## Rules and house defaults

### Liar's Dice

Each seat starts with five private d6. GM chooses first seat or random first player: highest sum of two d6, rerolling tied highest seats only. On your turn increase quantity with any face, or keep quantity and strictly increase face; never reduce quantity. Ones are wild for bids of faces 2-6; a bid of ones counts actual ones only. Bluffs above the available dice are legal.

Any surviving seat except the current bidder can call **Liar** on the current bid, even out of turn. GM chooses the NPC challenger explicitly. Only the first valid current-bid call resolves it; older bid buttons cannot challenge later bids. Reveal all hands and count matches. If the actual count is below the quantity, the challenger wins; otherwise the bidder wins, including equality. Loser loses one die; all survivors reroll. Loser starts, or next surviving seat if eliminated. Last surviving seat wins the dice game.

Every surviving seat contributes the configured stake once per new round, including round 1. The challenge winner receives that round's entire pot; next round collects a fresh pot. There is no pot carryover or additional last-survivor payout. Last payout remains visible.

### Three-Dragon Ante — blackjack-style dice variant

This is a house-rule dice game, **not the official Three-Dragon Ante card game**. Each seat contributes the ante and receives private 3d6. Betting proceeds in seat order: Check only when nothing is owed, Call the amount owed, Raise by a positive integer increase to the target, or Fold. A raise reopens action for the other nonfolded seats; all remaining seats must respond and match the target before betting ends.

Remaining seats choose one public fourth die, d6 or d8. After all roll, reveal their original 3d6 and totals. Highest total at or below 21 wins. Tied winners split whole denomination units; odd coins go to lower tied seat numbers first. If all remaining seats bust, the pot carries to the next hand, which adds new antes. If everyone but one folds, the sole survivor receives the pot without forced rolls or private-hand reveal. Folded secrets stay private. GM starts Next Hand, retaining seats and setup.

### Gelt

Each seat contributes the entry and rolls one public d20. A natural 1 automatically loses and cannot reroll out of that loss. A natural 20 locks and waits for settlement. Other seats decide in seat order: Lock, or pay the configured fee for **one** reroll. The new roll replaces and locks the old result even when lower; no keep-best or second reroll. Its natural 1/20 rules still apply. Reroll fee enters the pot exactly once.

Highest eligible final result wins. Ties split whole coins with lower-seat odd coins. If the highest is 20, the house adds one final pot and the total payout is **twice the final pot once**, split among any tied 20s; it is not doubled separately for each winner. House contribution is shown. If everyone has natural 1, the pot carries to Next Hand, which adds new entries. No real house funds are tracked.

### Goblin's Challenge

3-6 seats, each with **2d12 and 3d6 for the entire game**. GM rolls one d20 challenge each round. Seat order applies; starting seat rotates each round, skipping exhausted seats. On your turn choose counts from your remaining d12/d6, at least one die, and roll that whole combination once. Every selected die is permanently spent, even on a miss. The selectors offer **0** and **Skip**, both meaning none of that die type; both types at zero is invalid and cannot pass a turn.

First total meeting/exceeding the target earns one point and ends the round immediately; later seats retain their unused dice. If all eligible seats miss, nobody scores. GM starts Next Round with a fresh target. When every inventory is exhausted, highest score wins; tied leaders share victory. No wagering.

### Classic Dice

Each shooter plays the configured equal bet **against the house**, not a shared contested pot. Explicitly roll 2d6. On the come-out roll, 7/11 wins; 2/3/12 loses; 4/5/6/8/9/10 establishes the point. After the point is set, **only the point wins and 7 loses**. Every other total, including 2/3/11/12, continues with the same shooter and point.

A win returns stake plus equal house profit: gross 2×stake, net +stake. A loss returns nothing: net -stake. No extra stake is collected during point rolls. Resolution advances to the next shooter; after all resolve, GM starts Next Round while retaining the net ledger. No automatic roll loop.

### Wizard's Duel

Exactly two seats start with **10 game-only points** each. Each submits one private 3d20 roll, held until both submissions are committed. Reveal together and compare original positions: die 1 vs die 1, etc.; never sort. For each strictly winning pair, the opponent loses one point. Ties cost neither side a point. Apply both sides' losses simultaneously, clamped at zero. One reaching zero loses; both reaching zero together is a draw.

Otherwise GM starts Next Round, retaining points and clearing submissions only. No rerolls or wagering. Submission tickets stay valid for that round until each seat commits, so simultaneous current-round submissions can both succeed once; pause/resume, restart and Next Round expire old tickets. Points never touch character sheets.

### Treasure Hunt

GM rolls **7d12** and adds them; final DC is **min(raw total, 70)**. All seven results, raw total and capped DC are shown. A difficult target is never automatically rerolled. Each seat clicks **Ascending** or **Descending** once, rolling the entire ordered set: `[d4,d6,d8,d10,d10,d12,d20]` or reverse. The two d10s are independent, not percentile dice; maximum possible player total is 70.

The card shows all seven dice and running totals. Score is the earliest prefix length meeting/exceeding DC; later displayed dice do not change it. All seven below DC is no success. Every hunter finishes before fewest-roll successful score wins. Ties split whole coins with lower-seat odd coins. If nobody succeeds, the treasure carries to Next Hunt; GM Next Hunt adds new entries once and rolls a fresh target. Free play is supported.

Older partial attempts preserve already committed dice and locked order, then roll only their remaining set with one completion click. Already completed/settled attempts are not rerolled or paid again. Malformed saved dice fail closed; End and a fresh lobby provide recovery.

## Privacy and presentation

Commands authenticate real `msg.playerid`, not speaking-as names or a supplied identity. NPC and seat controls are checked on every action. Players receive only their own hidden hands; GMs may see NPC hands, not other players' unrevealed hands. Liar challenges and eligible Ante/Duel showdowns deliberately reveal their specified dice publicly. Folded Ante dice are not exposed. Public bids/turns never contain hidden hands.

Private recipients must be individually unambiguous (case-insensitive, whitespace-normalized), not collide with character names or contain rejected whisper syntax. Ordinary spaces, apostrophes, parentheses and Unicode work; punctuation unsafe for ScriptCards uses quoted native presentation. Unsafe/duplicate player recipients fail closed with reason-specific GM notices and console diagnostics, not broadcast hands.

For an authenticated GM whose name cannot safely receive a menu, non-player-secret controls/NPC cards may use Roll20's reserved **gm** recipient, visible to **all current GMs**. Player-owned hands, even if owned by a GM, never fall back to that group. Resolve the diagnostic's duplicate/collision/syntax cause before changing names.

Private hands persist in namespaced Roll20 `state` so restarts can recover them. Campaign administrators with script access can inspect that state; this is not administrator-proof secrecy. ScriptCards's final private output may enter the private chat archive because its interpreter does not forward Tavern Games's noarchive option. Native whispers request noarchive. No promise is made to erase existing chat history when End clears state.

## Generated rules handout

On ready the script creates **Tavern Games - Rules (generated)**, readable by all players (`inplayerjournals: all`) and editable only by GMs (`controlledby: ""`). It contains static rules, no current hands, seats or money. The selector links to its stored Journal ID. `!tavern refresh-rules` is GM-only.

Ownership is by stored ID and generated block, never by name. Restart/refresh is idempotent; a deleted handout is recovered. Version updates replace only the intact owned block, preserving additions before/after it, custom name/avatar and all GM Notes. Keep additions outside that block. If its contents were edited/reformatted so ownership cannot be verified, the old handout is preserved and a fresh maintained copy is linked; the console reports this fallback. Permissions on the maintained copy are enforced. GM Notes are never read or written.

## Compatibility, limits and maintenance

No global game variables/functions are exported; engines use isolated namespaced persistent state. There are no network calls, external assets, timers controlling play, sheet mutations or currency transactions. Fresh installation starts idle; only the documented static handout is created automatically. GM must create/start a game. Only one copy may be installed: old and One-Click copies together would register duplicate handlers.

The native tracker is not used or watched for gameplay. Upgrade-only migration can remove exact unchanged rows owned by old Tavern Games versions, preserving unrelated combat entries, edited rows and newer ordering. It never restores an old combat snapshot. Malformed tracker data remains untouched for manual recovery. Metadata discloses this limited campaign.turnorder write.

ScriptCards, TokenMod, GroupInitiative and TurnOrder Plus are not changed. Tavern Games invokes only ScriptCards for presentation. There are no known declared conflicts, but combined live campaign interoperability has not been tested. The `!tavern` namespace may collide with another custom script using it; resolve that before using both. Multi-campaign games, cross-currency accounts, betting side pots and official card-game decks are outside scope.

Source and tests target the Roll20 Mod JavaScript environment; Node is required only for local QA. Local validation includes 154 mocked Roll20 regressions and execution through official ScriptCards 3.0.23d. Local tests do not establish browser rendering, live whisper recipient selection, One-Click deployment or combined-script interoperability. Consult the submission PR for upstream CI results. Install/test in a separate campaign before broad use.

### Public release 2.6.2

First proposed repository release. Based on the tested 2.6.1 engine, with neutral public wording, author alias, full MIT notice, metadata, documentation and readable formatting. Game mechanics are unchanged. No unpublished development versions are listed as repository `previousversions`; future published releases should retain their version folders.

MIT applies to this script and documentation; see LICENSE.txt. ScriptCards remains a separate optional MIT-licensed project by its own contributors. Its official interpreter is used only in the separate QA bundle, not duplicated in the proposed runtime submission.
