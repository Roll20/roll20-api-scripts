# Gaslight TODO

## Done (v1.0.0)
- [x] Pre-setup split with test-first behavior
- [x] Merge (tear down Anchor, unassign players)
- [x] Anchor-mode sync (NPC + player tokens)
- [x] GM override (master child -> push to parent)
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

## Done (v2)
- [x] Peer sync mode (multi-controller tokens via chain-anchoring)
- [x] Configurable sync properties (gaslight_sync attribute with ! exclusion)
- [x] Mirror integration (non-spatial property sync)
- [x] !gaslight stage command (propagate tokens to player pages)
- [x] gaslight_stage character attribute (auto-propagate on add)
- [x] Cascade-delete linked tokens
- [x] Anchor chain-linking for player tokens (removed GM override listener)
- [x] !gaslight view (master/player view switching)
- [x] !gaslight relay (explicit command relay to views)
- [x] View interceptor (auto-relay commands from master page)
- [x] Player relay-commands (auto-relay configured commands from player pages)
- [x] !gaslight config (relay-add/relay-remove/relay-list)
- [x] Relay preserves selection order
- [x] Relay sends as invoking player (macros/permissions work)
- [x] Interceptor skips !gaslight, !mirror, !anchor
- [x] Loop prevention via {& select} check
- [x] Focus-ping players on split
- [x] Reaction suppression confirmed unnecessary (API moves don't trigger reactions)
- [x] !gaslight setup (quick group config from duplicate pages)

## Needs Testing (v2)
- [ ] gaslight_sync attribute (all combos: absent, empty, specific, !exclusion)
- [ ] Mirror chain setup/teardown on split/merge
- [ ] !gaslight stage + gaslight_stage auto-propagation
- [ ] Cascade-delete
- [ ] View interceptor + relay commands
- [ ] Player relay-commands config
- [ ] !gaslight setup workflow
- [ ] Focus-ping on split

## v3 Ideas
- [ ] Config handout (editable in-game, live reload)
- [ ] Group/page-level relay-command overrides
- [ ] Config visibility toggle (hide gaslight text in HTML comment)
- [ ] Near-match suggestions in step 4 warnings
- [ ] Per-status-marker sync granularity (manual for now)
- [ ] Replay command (re-run last N commands against different views)
- [ ] Conditional relay / per-player scripting (evaluate conditions per player page, run different commands based on results — e.g. stealth/perception visibility. Stored in pins or handouts as reusable logic scripts.)
- [ ] On-demand page cloning (if TruePageCopy exposes API)

## Known Issues
- None currently
