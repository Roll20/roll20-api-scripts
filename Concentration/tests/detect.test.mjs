// Unit tests for spell detection, using the source modules directly.

import assert from 'node:assert/strict';
import { test } from 'node:test';

// debugLog reads the settings from the Roll20 state object.
globalThis.state = {};
globalThis.log = () => {};

const { detectBeaconSpellCast, detectLegacySpellCast, detectSpellCast } =
  await import('../src/detect.js');

test('reads the spell and caster from the 5e OGL spell template in either order', () => {
  for (const content of [
    '{{level=evocation 2}} {{name=Web}} {{concentration=1}} {{charname=Atala Dumein}}',
    '{{charname=Atala Dumein}} {{name=Web}} {{concentration=1}}',
  ]) {
    const { spellCast } = detectLegacySpellCast({ rolltemplate: 'spell', content });
    assert.equal(spellCast.spellName, 'Web');
    assert.equal(spellCast.characterName, 'Atala Dumein');
  }
});

test('ignores 5e OGL spells without concentration', () => {
  const result = detectLegacySpellCast({
    rolltemplate: 'spell',
    content: '{{name=Fire Bolt}} {{charname=Atala}}',
  });
  assert.equal(result.spellCast, null);
  assert.equal(result.reason, 'legacy-spell-not-concentration');
});

test('reads a D&D 2024 spell card, preferring the message character ID', () => {
  const { spellCast } = detectBeaconSpellCast({
    type: 'advancedroll',
    characterId: '-abc',
    content:
      '<div class="meta__character">Orkira Illdrex</div><div class="header__title">Bless</div><span data-chip="concentration"></span>',
  });
  assert.equal(spellCast.spellName, 'Bless');
  assert.equal(spellCast.characterName, 'Orkira Illdrex');
  assert.equal(spellCast.characterId, '-abc');
});

test('decodes entities in spell names', () => {
  const { spellCast } = detectBeaconSpellCast({
    type: 'advancedroll',
    content:
      '<div class="meta__character">Atala</div><div class="header__title">Tasha&#39;s Hideous Laughter</div> concentration',
  });
  assert.equal(spellCast.spellName, "Tasha's Hideous Laughter");
});

test('ignores ordinary chat', () => {
  assert.equal(detectSpellCast({ type: 'general', content: 'I concentrate really hard' }), null);
});
