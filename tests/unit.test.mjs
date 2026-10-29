import {test} from 'node:test';
import assert from 'node:assert/strict';
import {toys,ids,allToyIds,initialState,renderToy,interact,moveDrag,tickToy,marblePosition,marbleTracks} from '../toys.js';

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

// Independent local mechanics: metadata suggested capabilities, not recovered rules.
const composedArt=(id,s)=>[renderPortraitToy(id,s).art,(renderWideToy(id,s)||renderToy(id,s)).art];
function visiblyChanges(id,state,action){const before=composedArt(id,state);interact(id,state,action);const after=composedArt(id,state);for(let i=0;i<2;i++)assert.notEqual(after[i],before[i],`${id} ${action} must change ${i?'wide':'portrait'} artwork`);}
test('formerly silent shape, weather and eye controls visibly change their scene',()=>{
 for(const [id,action]of [['shapes','form'],['dinosaurs','weather'],['pawn-maker','eyes']])visiblyChanges(id,initialState(id),action);
});
test('Cooking offers three distinct appliances and preparation in both layouts',()=>{
 const s=initialState('cooking');interact('cooking',s,'scene');
 for(const appliance of [0,1,2]){
  interact('cooking',s,'appliance:'+appliance);interact('cooking',s,'ingredient:1');
  visiblyChanges('cooking',s,'prepare');assert.equal(s.prepared,true);
  visiblyChanges('cooking',s,'process');assert.equal(appliance===1?s.mixed:s.cooked,appliance!==0);
  if(appliance===0){visiblyChanges('cooking',s,'heat');assert.equal(s.cooked,true);}
  for(const art of composedArt('cooking',s)){assert.match(art,/data-act="prepare"/);assert.match(art,/data-act="appliance:2"/);assert.match(art,/data-act="process"/);}
  visiblyChanges('cooking',s,'fresh');assert.equal(s.ingredients.length,0);assert.equal(s.cooked,false);assert.equal(s.mixed,false);
 }
});
test('Cooking serves a visible meal effect and bounds ingredients',()=>{
 const s=initialState('cooking');for(let i=0;i<40;i++)interact('cooking',s,'ingredient:0');assert.equal(s.ingredients.length,24);
 visiblyChanges('cooking',s,'serve');assert.equal(s.served,1);assert.equal(s.ingredients.length,0);
 for(const art of composedArt('cooking',s))assert.match(art,/happy guest/);
});
test('Geometry selected piece keeps its color and rotation when dragged',()=>{
 const s=initialState('geometry');visiblyChanges('geometry',s,'select:1');visiblyChanges('geometry',s,'rotate');visiblyChanges('geometry',s,'paint');
 assert.equal(s.pieces[1].r,45);assert.equal(s.pieces[1].c,2);assert.equal(s.pieces[0].r,0);
 moveDrag('geometry',s,'piece:1',650,320);assert.deepEqual(s.pieces[1],{x:650,y:320,r:45,c:2});assert.equal(s.selected,1);
 visiblyChanges('geometry',s,'preset');visiblyChanges('geometry',s,'randomize');visiblyChanges('geometry',s,'discard');assert.equal(s.pieces.length,4);
 visiblyChanges('geometry',s,'add');assert.equal(s.selected,4);
 for(let i=0;i<30;i++)interact('geometry',s,'add');assert.equal(s.pieces.length,12);
 for(let i=0;i<20;i++)interact('geometry',s,'discard');assert.equal(s.pieces.length,0);assert.doesNotThrow(()=>interact('geometry',s,'rotate'));visiblyChanges('geometry',s,'add');
});
test('Pawn Maker skin, silhouette, eyes, hats and colors are distinct in both layouts',()=>{
 const s=initialState('pawn-maker');for(const action of ['face','body','eyes','head','outfit']){
  visiblyChanges('pawn-maker',s,action);
  for(const art of composedArt('pawn-maker',s))assert.match(art,new RegExp(`data-act="${action}"`));
 }
 const saved=JSON.parse(JSON.stringify(s));assert.deepEqual(composedArt('pawn-maker',saved),composedArt('pawn-maker',s));
});
test('Drawing wide composition has its own palette and never seeds saved strokes',()=>{
 const s=initialState('drawing');const art=renderWideToy('drawing',s).art;
 assert.equal(s.strokes.length,0);assert.equal((art.match(/data-act="color:/g)||[]).length,6);assert.match(art,/width="76" height="76"/);
 assert.ok(richWideIds.has('drawing'));visiblyChanges('drawing',s,'color:1');visiblyChanges('drawing',s,'size');
});
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const appSource=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const sandbox={initialState};vm.createContext(sandbox);
vm.runInContext(appSource.slice(appSource.indexOf('const boundedNumber='),appSource.indexOf('for(const id of ids)states[id]='))+';globalThis.sanitize=sanitized;',sandbox);
test('save sanitizer preserves bounded new model fields and accepts old saves',()=>{
 const geometry=sandbox.sanitize('geometry',{pieces:[{x:400,y:300,c:4,r:135}],selected:0});assert.equal(geometry.pieces[0].r,135);assert.equal(geometry.pieces[0].c,4);
 const old=sandbox.sanitize('cooking',{ingredients:[1],heat:true});assert.equal(old.appliance,0);assert.equal(old.mixed,false);
 const cooked=sandbox.sanitize('cooking',{appliance:2,prepared:true,cooked:true,mixed:false,ingredients:Array(50).fill(2)});assert.equal(cooked.appliance,2);assert.equal(cooked.cooked,true);assert.equal(cooked.ingredients.length,24);
 const pawn=sandbox.sanitize('pawn-maker',{eyes:2,head:2,outfit:5});assert.equal(pawn.eyes,2);assert.equal(pawn.outfit,5);
 const bad=sandbox.sanitize('geometry',{pieces:Array(30).fill({x:Infinity,y:NaN,c:999,r:-30}),selected:Infinity});assert.equal(bad.pieces.length,12);for(const p of bad.pieces)assert.ok(Object.values(p).every(Number.isFinite));
 for(const id of ['geometry','pawn-maker','cooking'])for(const input of [null,[],{appliance:Infinity,eyes:-900,head:NaN}])for(const art of composedArt(id,sandbox.sanitize(id,input)))assert.ok(!art.includes('NaN'));
});

test('marble stays on its centerline without teleporting in either orientation',()=>{
 for(const layout of ['portrait','landscape']){
  const track=marbleTracks[layout];
  for(let step=0;step<140;step++){
   const p=marblePosition(step,layout);
   const gap=Math.min(...track.slice(1).map(([bx,by],i)=>{
    const [ax,ay]=track[i],dx=bx-ax,dy=by-ay;
    const fraction=Math.max(0,Math.min(1,((p.x-ax)*dx+(p.y-ay)*dy)/(dx*dx+dy*dy)));
    return Math.hypot(p.x-ax-dx*fraction,p.y-ay-dy*fraction);
   }));
   assert.ok(gap<1e-7,layout+' step '+step+' drifted by '+gap);
   if(step>0){
    const prev=marblePosition(step-1,layout);
    assert.ok(Math.hypot(p.x-prev.x,p.y-prev.y)<30,layout+' teleported at '+step);
   }
  }
 }
});
test('marble advances smoothly, pauses, resumes and resets',()=>{
 const state=initialState('marble-machine');
 for(let i=0;i<12;i++)tickToy('marble-machine',state);
 assert.equal(state.marble,12);
 interact('marble-machine',state,'run');tickToy('marble-machine',state);
 assert.equal(state.marble,12);
 interact('marble-machine',state,'run');tickToy('marble-machine',state);
 assert.equal(state.marble,13);
 interact('marble-machine',state,'marble');assert.equal(state.marble,0);
});

test('portrait rolling motion supports sub-step positions for smooth frame updates',()=>{
 const a=marblePosition(25,'portrait'),b=marblePosition(25.1,'portrait'),c=marblePosition(25.2,'portrait');
 assert.ok(Math.hypot(b.x-a.x,b.y-a.y)>0.01);
 assert.ok(Math.hypot(b.x-a.x,b.y-a.y)<5);
 assert.ok(Math.hypot(c.x-b.x,c.y-b.y)<5);
 const markup=renderPortraitToy('marble-machine',initialState('marble-machine')).art;
 assert.match(markup,/data-marble-track="true"/);
 assert.match(markup,/data-marble-ball="true"/);
});

test('portrait marble follows a descending rounded rail through every bend',()=>{
 const track=marbleTracks.portrait;
 assert.ok(track.length>100);
 for(let i=1;i<track.length;i++)assert.ok(track[i][1]>=track[i-1][1]-.001,'no uphill jumps');
 const start=marblePosition(0,'portrait'),end=marblePosition(139.95,'portrait');
 assert.ok(end.y-start.y>330);
 for(let step=.3;step<139.5;step+=.25){
  const a=marblePosition(step-.15,'portrait'),b=marblePosition(step,'portrait'),c=marblePosition(step+.15,'portrait');
  const first=Math.atan2(b.y-a.y,b.x-a.x),next=Math.atan2(c.y-b.y,c.x-b.x);
  const change=Math.abs(Math.atan2(Math.sin(next-first),Math.cos(next-first)));
  assert.ok(change<.35,'abrupt turn at '+step);
  assert.ok(Math.hypot(b.x-a.x,b.y-a.y)<2.1,'frame jump at '+step);
 }
 const markup=renderPortraitToy('marble-machine',initialState('marble-machine')).art;
 assert.match(markup,/d="M54 208 L 387 237 C/);
 assert.match(markup,/data-marble-spin="true"/);
 const gap=renderPortraitToy('marble-machine',{...initialState('marble-machine'),marble:143}).art;
 assert.match(gap,/data-marble-ball="true"[^>]*visibility="hidden"/);
});
