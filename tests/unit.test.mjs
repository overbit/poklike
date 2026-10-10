import {test} from 'node:test';
import assert from 'node:assert/strict';
import {toys,ids,allToyIds,initialState,renderToy,interact,moveDrag,tickToy} from '../toys.js';

test('exactly 25 unique real activities in official inventory',()=>{
 assert.equal(toys.length,25);assert.equal(ids.size,25);
 assert.ok(allToyIds().includes('code-factory'));assert.ok(allToyIds().includes('busy-book'));
});
for(const toy of toys){
 test(`${toy.title} renders an interactive, standalone scene`,()=>{
  const st=initialState(toy.id),screen=renderToy(toy.id,st);
  assert.ok(screen.art.length>600,`${toy.id} content too short`);
  assert.ok(screen.art.includes('<rect')||screen.art.includes('<circle'));
  assert.ok((screen.art.match(/data-act=|data-drag=/g)||[]).length>0,`${toy.id} no active scene controls`);
  assert.ok(Array.isArray(screen.tools));
  assert.ok(screen.hint.length>6);
  const first=screen.art.match(/data-act="([^"]+)"/);
  const act=first?first[1]:screen.tools[0]?.act;
  if(act)assert.doesNotThrow(()=>interact(toy.id,st,act));
  assert.ok(renderToy(toy.id,st).art.length>500);
 });
}
test('drawing is bounded and undo does not destroy unrelated toy state',()=>{
 const s=initialState('drawing');s.strokes.push({c:0,w:5,points:[[100,100],[110,110]]});
 interact('drawing',s,'undo');assert.equal(s.strokes.length,0);
 const house=initialState('house');interact('house',house,'light');assert.equal(house.light,false);
});
test('dragging changes only the intended toy element',()=>{
 const s=initialState('silly-blocks'),old={...s.blocks[0]};
 assert.ok(moveDrag('silly-blocks',s,'block:0',620,370));
 assert.equal(s.blocks[0].x,620);assert.deepEqual(s.blocks[1],initialState('silly-blocks').blocks[1]);
 assert.notDeepEqual(s.blocks[0],old);
});
test('sequencer advances only when playing and produces notes',()=>{
 const s=initialState('sequencer');assert.equal(tickToy('sequencer',s),null);
 s.playing=true;const notes=tickToy('sequencer',s);assert.equal(s.beat,1);assert.ok(Array.isArray(notes));
});
test('marble machine and factory can pause without moving',()=>{
 const a=initialState('marble-machine'),b=initialState('code-factory');
 interact('marble-machine',a,'run');assert.equal(tickToy('marble-machine',a),null);
 interact('code-factory',b,'run');assert.ok(Array.isArray(tickToy('code-factory',b)));
});
test('world puzzle snaps close enough tiles into intended slot',()=>{
 const s=initialState('world-puzzle');moveDrag('world-puzzle',s,'tile:0',245,149);
 assert.equal(s.tiles[0].x,244);assert.equal(s.tiles[0].y,151);
});
