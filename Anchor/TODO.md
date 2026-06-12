# Anchor — TODO

## Future

- [ ] Attribute registration API — let extensions register custom components to track/lock/unlock
- [ ] Page tracking — if anchor changes pages, children follow (needs design: page move vs page copy)
- [ ] Sequence: register flipV/flipH/scale as virtual attributes (currently only position/rotation)
- [ ] Choreograph: example scenes using anchor (e.g. orbit via anchor rotation, formation via anchor position)

## Done

- [x] v2.1.0 rewrite (component flags, per-component lock, auto-created anchors, scripting API)
- [x] Sequence integration (anchor.left, anchor.top, anchor.rotation virtual attributes)
- [x] Choreograph integration (token variables, siblings/children, lifecycle hook)
- [x] Public API: getFlipV/H, setFlipV/H, getZOffset, getLocked, getUnlocked, lock, unlock
- [x] Flip semantics fix (true = flipped relative to parent)
- [x] Help handout + gen-dev-docs command
- [x] Null-safe refreshAnchor in Sequence attribute setters
