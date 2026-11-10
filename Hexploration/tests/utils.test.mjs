import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { toChatColor, toPathV2Color } from '../src/utils.js';

describe('toChatColor', () => {
  it('turns colours with alpha into rgba()', () => {
    assert.equal(toChatColor('#8c877ae6'), 'rgba(140,135,122,0.9)');
    assert.equal(toChatColor('#f9730223'), 'rgba(249,115,2,0.14)');
    assert.equal(toChatColor('rgb(140,135,122,0.9)'), 'rgba(140,135,122,0.9)');
    assert.equal(toChatColor('#abc8'), 'rgba(170,187,204,0.53)');
  });

  it('turns opaque colours into #rrggbb', () => {
    assert.equal(toChatColor('#ABC'), '#aabbcc');
    assert.equal(toChatColor('#222222ff'), '#222222');
    assert.equal(toChatColor('rgb(0,128,255)'), '#0080ff');
  });

  it('leaves names alone', () => {
    assert.equal(toChatColor('red'), 'red');
  });
});

describe('toPathV2Color', () => {
  it('converts rgba() to #rrggbbaa', () => {
    assert.equal(toPathV2Color('rgba(34,34,34,0.5)'), '#22222280');
    assert.equal(toPathV2Color('rgba( 255 , 0 , 0 , 0 )'), '#ff000000');
    assert.equal(toPathV2Color('RGBA(100%,50%,0%,25%)'), '#ff800040');
  });

  it('converts rgb() with an alpha value, as a user reported', () => {
    assert.equal(toPathV2Color('rgb(140,135,122,0.9)'), '#8c877ae6');
  });

  it('drops a fully opaque alpha', () => {
    assert.equal(toPathV2Color('rgba(1,2,3,1)'), '#010203');
    assert.equal(toPathV2Color('rgb(0,128,255)'), '#0080ff');
  });

  it('expands short hex colours', () => {
    assert.equal(toPathV2Color('#abc'), '#aabbcc');
    assert.equal(toPathV2Color('#abc8'), '#aabbcc88');
  });

  it('leaves full hex colours and names alone', () => {
    assert.equal(toPathV2Color('#222222'), '#222222');
    assert.equal(toPathV2Color('#22222280'), '#22222280');
    assert.equal(toPathV2Color('transparent'), 'transparent');
  });
});
