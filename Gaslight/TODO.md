# Gaslight TODO

## Done (v1.0.0 — shipped in Gaslight branch PR)
- [x] Pre-setup split with test-first behavior
- [x] Merge (tear down Anchor + Mirror, unassign players)
- [x] Anchor-mode sync (NPC + player tokens via chain-linking)
- [x] Peer sync mode (multi-controller tokens via chain-anchoring)
- [x] Mirror integration (non-spatial property sync)
- [x] Configurable sync properties (gaslight_sync attribute with ! exclusion)
- [x] Token linking resolution (4-step cascade)
- [x] Manual linking (link/unlink/unlink --group)
- [x] Test command (dry-run)
- [x] Config storage (GM layer text objects with playerid)
- [x] Page resolution (selected token's page)
- [x] Party detection (selected -> tags fallback)
- [x] group/ungroup/status/--help
- [x] Startup dangling group warning
- [x] Sight stripping on children
- [x] Player disambiguation (clickable buttons)
- [x] !gaslight stage command + gaslight_stage auto-propagation
- [x] Cascade-delete linked tokens
- [x] !gaslight view (master/player view switching)
- [x] !gaslight relay (explicit command relay with dual-path)
- [x] View interceptor (auto-relay commands from master page)
- [x] Player relay-commands config
- [x] !gaslight config (relay-add/relay-remove/relay-list)
- [x] !gaslight setup (quick group config from duplicate pages)
- [x] Focus-ping players on split
- [x] Relay Path 2: ID replacement (immediate cross-page)
- [x] Relay Path 1: queue + _lastpage poll (selection-based)

## Needs Testing
- [ ] gaslight_sync attribute (all combos: absent, empty, specific, !exclusion)
- [ ] Mirror chain setup/teardown on split/merge
- [ ] !gaslight setup workflow end-to-end
- [ ] Cascade-delete
- [ ] View + relay with both paths
- [ ] Focus-ping on split

## v2 Ideas
- [ ] GM HUD system — persistent on-canvas indicators, each toggled via `!gaslight hud <name> [on|off]`:
  - `initiative` — on-canvas turn order display (tokens + text on foreground layer, one per entry). Deduplicates linked copies so GM sees a clean list.
  - `view` — big text showing current relay state (OFF / ALL / player name)
  - `links` — ascii-art boxes around linked tokens with sync/desync annotations
  - `group` — active group indicator
- [ ] Diff command (`!gaslight diff <player>`) — show what's different between master and a player's page
- [ ] Batch operations — `--all` flag on sync/desync to affect all linked tokens on the page
- [ ] `!gaslight relay all --except <player>` flag
- [ ] Config handout (editable in-game, live reload)
- [ ] Group/page-level relay-command overrides
- [ ] Config visibility toggle (hide gaslight text in HTML comment)
- [ ] Near-match suggestions in step 4 warnings
- [ ] Per-status-marker sync granularity
- [ ] Replay command (re-run last N commands against different views)
- [ ] Conditional relay / per-player scripting (evaluate conditions per player page, run different commands based on results -- e.g. stealth/perception visibility. Stored in pins or handouts as reusable logic scripts.)
- [ ] On-demand page cloning (if TruePageCopy exposes API)

## Known Issues
- WORKAROUND: Temporarily sets Fetch `playerscanids=true` during script execution because API sendChat sets `playerid='API'` and Fetch denies character access. Remove when Fetch treats API as GM-equivalent (reported to timmaugh).
- linkedTokens accumulates duplicates on repeated splits (cosmetic, deduped at use)
