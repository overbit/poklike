import test from 'node:test';
import assert from 'node:assert/strict';
import { AGE_BANDS, INTERESTS, normalizeProfile, rankToys, recommendedToyIds } from '../profile.js';

const toys = ['drawing','busy-board','musical-blobs','busy-book','town','house','forest','islands','shapes','dress-up','silly-blocks','marble-machine','sequencer','radio','world-puzzle','dinosaurs','connect-the-dots','shops','geometry','space','number-journey','phonics','pawn-maker','cooking','code-factory'].map(id => ({ id }));

test('profile constants and normalization are allowlisted, canonical, fresh', () => {
  assert.deepEqual(AGE_BANDS.map(x => x.id), ['any','2-3','4-5','6-8']);
  assert.deepEqual(INTERESTS.map(x => x.id), ['making','music','stories','discovery','numbers']);
  for (const bad of [null, undefined, 1, 'x', [], true]) assert.deepEqual(normalizeProfile(bad), { enabled:false, ageBand:'any', interests:[] });
  const input = { enabled:true, ageBand:'6-8', interests:['music','making','music','invalid',2], extra:'discard' };
  const result = normalizeProfile(input);
  assert.deepEqual(result, { enabled:true, ageBand:'6-8', interests:['making','music'] });
  assert.notEqual(result, input);
  assert.notEqual(result.interests, input.interests);
  assert.deepEqual(normalizeProfile({ enabled:1, ageBand:'bogus', interests:['__proto__','constructor'] }), { enabled:false, ageBand:'any', interests:[] });
  const protoPayload = JSON.parse('{"enabled":true,"ageBand":"2-3","interests":["music"],"__proto__":{"polluted":true}}');
  assert.deepEqual(normalizeProfile(protoPayload), { enabled:true, ageBand:'2-3', interests:['music'] });
  assert.equal({}.polluted, undefined);
  const inherited = Object.create({ enabled:true, ageBand:'4-5', interests:['music'] });
  assert.deepEqual(normalizeProfile(inherited), { enabled:false, ageBand:'any', interests:[] });
});

test('ranking preserves unique IDs, stable ties and disabled source order', () => {
  const duplicate = [...toys, toys[0], { id:'unmapped' }];
  assert.deepEqual(rankToys(duplicate, {}), [...toys.map(t => t.id), 'unmapped']);
  const ranked = rankToys(duplicate, { enabled:true, interests:['music'] });
  assert.equal(ranked.length, 26);
  assert.equal(new Set(ranked).size, 26);
  assert.ok(ranked.indexOf('musical-blobs') < ranked.indexOf('drawing'));
  assert.ok(ranked.indexOf('sequencer') < ranked.indexOf('radio'));
  const making = rankToys(toys, { enabled:true, interests:['making'] });
  assert.ok(making.indexOf('drawing') < making.indexOf('radio'));
  assert.deepEqual(rankToys([{id:'a'},{id:'b'}], { enabled:true }), ['a','b']);
  const hostileIds = ['constructor', 'toString', '__proto__'];
  assert.deepEqual(rankToys(hostileIds.map(id => ({ id })), { enabled:true, interests:['making'] }), hostileIds);
  assert.deepEqual(rankToys(null, { enabled:true }), []);
  assert.deepEqual(rankToys('not a list', { enabled:true }), []);
  assert.deepEqual(rankToys([null, {}, { id: null }, { id: {} }], { enabled:true }), []);
  const ageOnly = rankToys(toys, { enabled:true, ageBand:'6-8' });
  assert.ok(ageOnly.indexOf('sequencer') < ageOnly.indexOf('drawing'));
});

test('recommendations require enabled and clamp limits', () => {
  const profile = { enabled:true, interests:['music'] };
  assert.deepEqual(recommendedToyIds(toys, { enabled:false }, 3), []);
  assert.equal(recommendedToyIds(toys, profile).length, 4);
  assert.equal(recommendedToyIds(toys, profile, 100).length, 25);
  assert.deepEqual(recommendedToyIds(toys, profile, -1), []);
  assert.deepEqual(recommendedToyIds(toys, profile, Infinity), []);
});

test('ranking and normalization do not mutate inputs', () => {
  const input = { enabled:true, interests:['music','music'] };
  const list = [...toys];
  const before = JSON.stringify([input, list]);
  normalizeProfile(input);
  rankToys(list, input);
  recommendedToyIds(list, input, 2);
  assert.equal(JSON.stringify([input, list]), before);
});
