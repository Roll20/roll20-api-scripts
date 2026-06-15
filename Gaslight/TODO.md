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

## v2 Remaining
- [ ] On-demand split (page cloning, adhoc flag, adhoc merge/cleanup)
- [ ] Ad-hoc test (no group arg)
- [ ] Reaction suppression (interactionTriggered reset)
- [ ] Focus-ping players on split
- [ ] Config visibility toggle (hide text in HTML comment)
- [ ] Near-match suggestions in step 4 warnings
- [ ] Per-status-marker sync granularity
- [ ] Master page view toggling
- [ ] Choreograph/Sequence integration

## Known Issues
- None currently
