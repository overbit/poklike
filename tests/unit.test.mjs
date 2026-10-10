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
 assert.ok(Array.isArray(tickToy('code-factory',b)));
 interact('code-factory',b,'run');assert.equal(tickToy('code-factory',b),null);
});
test('world puzzle snaps close enough tiles into intended slot',()=>{
 const s=initialState('world-puzzle');moveDrag('world-puzzle',s,'tile:0',245,149);
 assert.equal(s.tiles[0].x,244);assert.equal(s.tiles[0].y,151);
});

import {renderPortraitToy,portraitFrame,toPortrait,toModel,portraitDragToModel,PORTRAIT_DRAG_LIFT} from '../portrait-toys.js';
for(const toy of toys){
 test(`${toy.title} has a portrait scene with direct interactive targets`,()=>{
  const art=renderPortraitToy(toy.id,initialState(toy.id));
  assert.equal(art.viewBox,'0 0 480 840');
  assert.ok(art.art.length>1200,`${toy.id} portrait scene missing detail`);
  assert.match(art.art,/data-act=|data-drag=/,`${toy.id} portrait toy must work without a bottom toolbar`);
  assert.ok(!art.art.includes('NaN'),`${toy.id} art contains invalid coordinates`);
 });
}
test('model and portrait coordinates round-trip for touch drag and drawing',()=>{
 const a={x:400,y:320};const b=toPortrait(a);assert.deepEqual(toModel(b),a);
});
test('Town residents can visit every place by dropping them on a building',()=>{
 const s=initialState('town');
 for(const [px,py,index] of [[125,285,0],[345,285,1],[125,476,2],[345,476,3]]){
  assert.equal(moveDrag('town',s,'person:0',px*2,py/1.4,'portrait'),true);
  assert.equal(s.mode,index);
 }
 const before=s.mode;
 moveDrag('town',s,'vehicle',390,240,'wide');
 assert.equal(s.mode,before,'wide Town must not use portrait drop-zone math');
});
test('all lifted portrait drags round-trip without jumping',()=>{
 const inputs=[
  ['house','figure',s=>s.figure],['islands','boat',s=>s.boat],
  ['silly-blocks','block:0',s=>s.blocks[0]],['world-puzzle','tile:0',s=>s.tiles[0]],
  ['dinosaurs','dino',s=>s.dino],['geometry','piece:0',s=>s.pieces[0]],
  ['space','rocket',s=>s.rocket]
 ];
 assert.equal(inputs.length,Object.keys(PORTRAIT_DRAG_LIFT).length);
 for(const [id,key,read] of inputs){
  const target={x:220,y:555},model=portraitDragToModel(id,target),state=initialState(id);
  assert.equal(moveDrag(id,state,key,model.x,model.y),true,id);
  const at=toPortrait(read(state));
  assert.ok(Math.abs(at.x-target.x)<1,id+' x jumped');
  assert.ok(Math.abs(at.y+PORTRAIT_DRAG_LIFT[id]-target.y)<1,id+' y jumped');
 }
});
test('portrait puzzle slots match the shared snap locations',()=>{
 const state=initialState('world-puzzle');
 for(let i=0;i<6;i++){
  const tx=244+(i%3)*233,ty=151+Math.floor(i/3)*162;
  assert.equal(moveDrag('world-puzzle',state,'tile:'+i,tx+12,ty+8),true);
  assert.deepEqual({x:state.tiles[i].x,y:state.tiles[i].y},{x:tx,y:ty});
 }
 const artwork=renderPortraitToy('world-puzzle',state).art;
 assert.match(artwork,/data-drag="tile:5"/);
});
test('Busy Board dials support repeatable tactile interactions',()=>{
 const st=initialState('busy-board');const before=st.dials[0];interact('busy-board',st,'dial:0');
 assert.equal(st.dials[0],(before+1)%4);interact('busy-board',st,'dial:0');
 assert.equal(st.dials[0],(before+2)%4);
});
test('Busy Board gears mesh while independent switches power the lamp',()=>{
 const state=initialState('busy-board'),a=state.dials.slice();
 interact('busy-board',state,'gear:0');
 assert.equal(state.dials[0],(a[0]+1)%4);
 assert.equal(state.dials[1],(a[1]+3)%4);
 interact('busy-board',state,'switch:0');
 assert.equal(state.switches[0],true);
 assert.match(renderPortraitToy('busy-board',state).art,/Turn connected gear/);
});
test('Busy Book has illustrations with reversible discoveries on every page',()=>{
 const state=initialState('busy-book');
 for(let page=0;page<5;page++){
  const screen=renderPortraitToy('busy-book',state).art;
  assert.match(screen,/data-act="book:0"/);
  assert.match(screen,/data-act="book:1"/);
  assert.match(screen,/data-act="book:2"/);
  const key=`${page}:0`;
  interact('busy-book',state,'book:0');
  assert.ok(state.touched.includes(key));
  interact('busy-book',state,'book:0');
  assert.ok(!state.touched.includes(key));
  interact('busy-book',state,'next');
 }
 assert.equal(state.page,0);
});
test('Musical Blobs register nearby collisions and remain draggable',()=>{
 const st=initialState('musical-blobs');const old=st.collisions;
 assert.equal(moveDrag('musical-blobs',st,'blob:0',400,350),true);
 assert.ok(st.collisions>old);
});

// A rendered toy is not sufficient: one characteristic action per toy must
// change actual state, rather than merely incrementing the generic turn.
const characteristicActions=[
 ['drawing','stamp'],['busy-board','switch:0'],['musical-blobs','tone'],['busy-book','next'],
 ['town','visitor'],['house','room'],['forest','grow'],['islands','island'],
 ['shapes','form'],['dress-up','shirt'],['silly-blocks','add'],['marble-machine','run'],
 ['sequencer','play'],['radio','play'],['world-puzzle','shuffle'],['dinosaurs','egg'],
 ['connect-the-dots','dot:0'],['shops','buy:0'],['geometry','randomize'],['space','planet'],
 ['number-journey','plus'],['phonics','word'],['pawn-maker','face:0'],['cooking','ingredient:0'],
 ['code-factory','command:0']
];
test('state-changing actions cover every activity once',()=>{
 assert.deepEqual(new Set(characteristicActions.map(([id])=>id)),ids);
});
for(const [id,action] of characteristicActions){
 test(`${id} action ${action} changes play state`,()=>{
  const state=initialState(id),snapshot=JSON.stringify({...state,turn:0});
  interact(id,state,action);
  assert.notEqual(JSON.stringify({...state,turn:0}),snapshot,`${id} only incremented the generic turn counter`);
  assert.ok(renderPortraitToy(id,state).art.length>1000);
 });
}


test('Cooking begins at a guest table and exposes a second kitchen scene',()=>{
 const s=initialState('cooking');assert.equal(s.mode,0);
 assert.match(renderPortraitToy('cooking',s).art,/Who is hungry/);
 interact('cooking',s,'guest:1');assert.equal(s.guest,1);
 interact('cooking',s,'serve');assert.equal(s.rejected,1);
 interact('cooking',s,'scene');assert.equal(s.mode,1);
 assert.match(renderPortraitToy('cooking',s).art,/Kitchen|kitchen/);
 interact('cooking',s,'ingredient:0');interact('cooking',s,'water');
 assert.equal(s.water,true);
 interact('cooking',s,'scene');interact('cooking',s,'serve');
 assert.equal(s.served,1);assert.equal(s.ingredients.length,0);
});
test('Code Factory starts in continuous operation and a crate creates goods and mess',()=>{
 const s=initialState('code-factory');assert.equal(s.playing,true);
 interact('code-factory',s,'crate');assert.equal(s.goods,1);assert.equal(s.mess,1);
 interact('code-factory',s,'director:0');assert.equal(s.commands[0],2);
 interact('code-factory',s,'clean');assert.equal(s.mess,0);
});
test('Phonics can complete each of its sound slots by dragging a grapheme',()=>{
 const s=initialState('phonics');assert.deepEqual(s.placed,[false,false,false]);
 for(let i=0;i<3;i++)moveDrag('phonics',s,`phoneme:${i}`,460,410);
 assert.deepEqual(s.placed,[true,true,true]);
 interact('phonics',s,'word');assert.deepEqual(s.placed,[false,false,false]);
});

import {renderWideToy,richWideIds} from '../wide-toys.js';
for(const id of richWideIds){
 test(`${id} has coordinated portrait and landscape gameplay`,()=>{
  const landscape=renderWideToy(id,initialState(id));
  assert.ok(landscape.art.length>1400);
  assert.match(landscape.art,/data-act=|data-drag=/);
  assert.ok(renderPortraitToy(id,initialState(id)).art.length>1400);
 });
}

test('portrait aspect mapping preserves circles, touch areas and full 25-toy worlds',()=>{
 for(const [width,height] of [[320,568],[390,844],[412,915],[768,1024],[820,1180]]){
  const ratio=width/height,frame=portraitFrame(ratio);
  assert.ok(Math.abs(frame.width/frame.height-ratio)<.001);
  assert.ok(frame.width>=480&&frame.height>=840);
  assert.ok(frame.offsetX>=0&&frame.offsetY>=0);
  for(const toy of toys){
   const art=renderPortraitToy(toy.id,initialState(toy.id),ratio);
   assert.equal(art.viewBox,frame.viewBox);
   assert.match(art.art,/<g data-world="true" transform="translate\(/);
   assert.ok(art.art.includes('<circle')||art.art.includes('<rect'),'art must contain visible geometry');
   assert.ok(!art.art.includes('rx="NaN"')&&!art.art.includes('ry="NaN"'),'shape geometry must stay finite');
   assert.ok(!art.art.includes('NaN'));
  }
 }
});
