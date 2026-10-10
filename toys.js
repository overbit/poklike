// Original, offline SVG toy mechanics. No proprietary artwork, images or sounds.
export const C = Object.freeze({ paper:'#fffdf8',cream:'#f9f6ef',ink:'#273845',muted:'#526a73',coral:'#e76d56',sun:'#efc95a',teal:'#49a99a',blue:'#75a9d1',plum:'#a080b8',leaf:'#75aa72',sand:'#e9d8b8',pink:'#f5b8aa',light:'#e9f2ef',night:'#27394d' });
export const colors = [C.coral,C.sun,C.teal,C.blue,C.plum,C.leaf];
export const toys = [
 ['drawing','Drawing','Leave a trail of imagination','Make marks with your fingers',C.coral],
 ['busy-board','Busy Board','Little switches, big discoveries','Push, spin and slide',C.blue],
 ['musical-blobs','Musical Blobs','Every shape has a song','Tap and move the singing blobs',C.plum],
 ['busy-book','Busy Book','A world on every page','Explore each picture',C.sun],
 ['town','Town','A place full of stories','Move people and vehicles around',C.teal],
 ['house','House','Make yourself at home','Explore the rooms and furniture',C.coral],
 ['forest','Forest','A pocket-sized wilderness','Help the forest come alive',C.leaf],
 ['islands','Islands','Sail wherever you like','Explore the sea and islands',C.blue],
 ['shapes','Shapes','Slow and lovely surprises','Touch the moving shapes',C.plum],
 ['dress-up','Dress-Up','A wardrobe for everyone','Mix up a marvelous outfit',C.sun],
 ['silly-blocks','Silly Blocks','Build something unexpected','Stack, scatter and invent',C.coral],
 ['marble-machine','Marble Machine','Follow the rolling marbles','Make the marble find a new way',C.blue],
 ['sequencer','Sequencer','Make a tiny music pattern','Tap steps to write a beat',C.teal],
 ['radio','Radio','Tune into your own rhythm','Play with musical stations',C.sun],
 ['world-puzzle','World Puzzle','Put a little world together','Slide the pieces into place',C.leaf],
 ['dinosaurs','Dinosaurs','Make prehistoric friends','Discover a world of giants',C.coral],
 ['connect-the-dots','Connect the Dots','A picture in the making','Connect the numbered stars',C.plum],
 ['shops','Shops','An imaginary shopping day','Fill your basket with surprises',C.teal],
 ['geometry','Geometry','Shape up your own ideas','Move the colorful pieces',C.blue],
 ['space','Space','Take a trip among the stars','Send a rocket exploring',C.plum],
 ['number-journey','Number Journey','Count curious things','Grow your counting garden',C.sun],
 ['phonics','Phonics','Play with letters and sounds','Find sounds in little words',C.coral],
 ['pawn-maker','Pawn Maker','Meet your newest character','Invent a friendly face',C.leaf],
 ['cooking','Cooking','What is on the menu?','Mix something good in the pot',C.sun],
 ['code-factory','Code Factory','Put directions into motion','Guide a little factory robot',C.teal]
].map(([id,title,tagline,hint,color])=>({id,title,tagline,hint,color}));
export const ids = new Set(toys.map(t=>t.id));
const v=n=>Math.round(Number(n)*10)/10;
const e=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const R=(x,y,w,h,fill,rx=12,attrs='')=>`<rect x="${v(x)}" y="${v(y)}" width="${v(w)}" height="${v(h)}" rx="${rx}" fill="${fill}" ${attrs}/>`;
const O=(x,y,r,fill,attrs='')=>`<circle cx="${v(x)}" cy="${v(y)}" r="${v(r)}" fill="${fill}" ${attrs}/>`;
const L=(x1,y1,x2,y2,stroke,width=8,attrs='')=>`<line x1="${v(x1)}" y1="${v(y1)}" x2="${v(x2)}" y2="${v(y2)}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" ${attrs}/>`;
const T=(x,y,value,size=26,fill=C.ink,attrs='')=>`<text x="${v(x)}" y="${v(y)}" fill="${fill}" font-family="ui-rounded, system-ui, sans-serif" font-size="${size}" font-weight="750" text-anchor="middle" dominant-baseline="middle" ${attrs}>${e(value)}</text>`;
const P=(pts,fill,attrs='')=>`<polygon points="${pts}" fill="${fill}" ${attrs}/>`;
const hit=(act,inner,label=act,extra='')=>`<g data-act="${e(act)}" role="button" tabindex="0" aria-label="${e(label)}" class="toy-hit" ${extra}>${inner}</g>`;
const drag=(key,x,y,inner,label='Move object')=>`<g data-drag="${e(key)}" transform="translate(${v(x)} ${v(y)})" role="button" tabindex="0" aria-label="${e(label)}. Use arrow keys to move." class="toy-drag">${inner}</g>`;
const wave=(y,shade=C.blue)=>`<path d="M0 ${y} Q120 ${y-42} 240 ${y} T480 ${y} T720 ${y} T960 ${y} V600 H0Z" fill="${shade}"/>`;
const cloud=(x,y,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})">${O(0,15,33,'white')}${O(36,0,43,'white')}${O(78,18,30,'white')}${R(-8,15,98,29,'white',17)}</g>`;
const flower=(x,y,col=C.coral)=>`<g>${L(x,y+8,x,y+66,C.leaf,6)}${[0,72,144,216,288].map(a=>O(x+Math.cos(a*Math.PI/180)*20,y+Math.sin(a*Math.PI/180)*20,15,col)).join('')}${O(x,y,15,C.sun)}</g>`;
const tree=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">${R(-12,0,24,105,'#956855',7)}${O(0,-35,67,C.leaf)}${O(-40,-5,39,C.teal)}${O(42,-13,44,C.leaf)}</g>`;
const star=(x,y,r=16,col=C.sun)=>P(Array.from({length:10},(_,i)=>{let a=(i*Math.PI/5)-Math.PI/2,rr=i%2?r*.45:r;return `${v(x+Math.cos(a)*rr)},${v(y+Math.sin(a)*rr)}`}).join(' '),col);
const person=(x,y,col=C.teal,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">${R(-22,38,17,55,C.ink,8)}${R(6,38,17,55,C.ink,8)}${R(-33,-5,65,55,col,19)}${O(0,-33,34,C.sun)}${O(-12,-36,3,C.ink)}${O(12,-36,3,C.ink)}${L(-9,-17,10,-17,C.coral,3)}</g>`;
const bird=(x,y,col=C.coral)=>`<g transform="translate(${x} ${y})">${O(0,0,24,col)}${P('17,-6 43,2 17,10',C.sun)}${O(-10,-8,3,C.ink)}${L(-6,20,-6,33,C.ink,3)}${L(5,20,5,33,C.ink,3)}</g>`;
const wheel=(x,y,r=19)=>`${O(x,y,r,C.ink)}${O(x,y,r*.5,C.paper)}`;
const car=(x,y,col=C.coral)=>`<g>${R(x,y,120,43,col,13)}${P(`${x+19},${y} ${x+37},${y-33} ${x+87},${y-33} ${x+105},${y}`,col)}${R(x+40,y-26,42,22,C.light,5)}${wheel(x+23,y+41)}${wheel(x+97,y+41)}</g>`;
const tileBtn=(x,y,w,h,act,label,col=C.paper)=>hit(act,`${R(x,y,w,h,col,17,`stroke="${C.sand}" stroke-width="2"`)}${T(x+w/2,y+h/2,label,26)}`,label);
const bg=(fill=C.paper)=>R(0,0,960,600,fill,0);
const ground=(y=490,color=C.sand)=>`${R(0,y,960,600-y,color,0)}`;
const arc=(x,y,r,start,end)=>{let a=(start*Math.PI)/180,b=(end*Math.PI)/180;return `M ${v(x+r*Math.cos(a))} ${v(y+r*Math.sin(a))} A ${r} ${r} 0 ${end-start>180?1:0} 1 ${v(x+r*Math.cos(b))} ${v(y+r*Math.sin(b))}`};
const control=(label,act)=>({label,act});
const deterministic=(n,salt=0)=>{let x=Math.sin(n*93.43+salt*17.37)*43758.5453;return x-Math.floor(x)};
const randomColor=i=>colors[(Math.abs(i))%colors.length];
export function initialState(id){
 const base={turn:0,count:0,color:0,selected:0,mode:0,active:false};
 switch(id){
  case 'drawing':return {...base,strokes:[],width:9};
  case 'busy-board':return {...base,switches:[false,true,false,true],sliders:[.2,.7],dials:[0,1]};
  case 'musical-blobs':return {...base,collisions:0,blobs:[{x:210,y:230},{x:400,y:350},{x:650,y:230},{x:780,y:420}]};
  case 'busy-book':return {...base,page:0,touched:[]};
  case 'town':return {...base,vehicle:{x:100,y:352},people:[{x:520,y:380},{x:760,y:440}]};
  case 'house':return {...base,room:0,light:true,figure:{x:675,y:360}};
  case 'forest':return {...base,day:true,creatures:[{x:300,y:430},{x:690,y:390}]};
  case 'islands':return {...base,boat:{x:450,y:360},island:0};
  case 'shapes':return {...base,form:0,phase:0};
  case 'dress-up':return {...base,hair:0,shirt:0,hat:0,skin:0};
  case 'silly-blocks':return {...base,blocks:[{x:280,y:280,c:0},{x:400,y:290,c:1},{x:540,y:260,c:2},{x:650,y:345,c:3}]};
  case 'marble-machine':return {...base,marble:0,valves:[false,false,true],running:true};
  case 'sequencer':return {...base,steps:Array.from({length:4},(_,i)=>Array.from({length:8},(_,j)=>i===j%4)),playing:false,beat:0};
  case 'radio':return {...base,station:0,playing:false,volume:3};
  case 'world-puzzle':return {...base,tiles:[{x:140,y:430},{x:420,y:420},{x:690,y:430},{x:220,y:520},{x:520,y:520},{x:780,y:520}]};
  case 'dinosaurs':return {...base,weather:0,egg:0,dino:{x:340,y:370}};
  case 'connect-the-dots':return {...base,connected:0,shape:0};
  case 'shops':return {...base,shop:0,basket:[]};
  case 'geometry':return {...base,pieces:[{x:220,y:250},{x:380,y:280},{x:560,y:240},{x:700,y:330},{x:300,y:420}]};
  case 'space':return {...base,planet:0,rocket:{x:330,y:340},stars:0};
  case 'number-journey':return {...base,number:3,kind:0};
  case 'phonics':return {...base,word:0,letter:0,placed:[false,false,false]};
  case 'pawn-maker':return {...base,face:0,body:0,eyes:0,head:0};
  case 'cooking':return {...base,ingredients:[],heat:false,stir:0,guest:0,craving:0,served:0,rejected:0,water:false,cupboards:[false,false,false]};
  case 'code-factory':return {...base,commands:[1,1,2,1,0,1],robot:0,playing:true,crates:0,goods:0,mess:0};
  default:return base;
 }
}
export function toolItems(id,s){
 switch(id){
  case 'drawing':return [control('Stamp a dot','stamp'),control('Undo','undo'),control('Brush size','size'),control('Erase all','clear')];
  case 'busy-book':return [control('Previous page','prev'),control('Next page','next')];
  case 'house':return [control('Change room','room'),control('Lights','light')];
  case 'forest':return [control('Day / night','day'),control('Grow flower','grow')];
  case 'islands':return [control('New island','island'),control('Sea breeze','breeze')];
  case 'shapes':return [control('New shape','form'),control('Spin shape','spin')];
  case 'dress-up':return [control('Hair','hair'),control('Outfit','shirt'),control('Hat','hat'),control('Skin tone','skin')];
  case 'silly-blocks':return [control('Add block','add'),control('Scatter','scatter')];
  case 'marble-machine':return [control(s.running?'Pause':'Roll','run'),control('Another marble','marble')];
  case 'sequencer':return [control(s.playing?'Pause beat':'Play beat','play'),control('New pattern','pattern')];
  case 'radio':return [control(s.playing?'Stop':'Play radio','play'),control('Next station','station'),control('Volume','volume')];
  case 'world-puzzle':return [control('Shuffle pieces','shuffle')];
  case 'dinosaurs':return [control('Weather','weather'),control('Hatch egg','egg')];
  case 'connect-the-dots':return [control('New pattern','pattern'),control('Start again','restart')];
  case 'shops':return [control('Next shop','shop'),control('Empty basket','empty')];
  case 'geometry':return [control('New shapes','randomize'),control('Rotate pieces','rotate')];
  case 'space':return [control('Next planet','planet'),control('Make stars','stars')];
  case 'number-journey':return [control('One less','minus'),control('One more','plus'),control('New things','kind')];
  case 'phonics':return [control('Another word','word'),control('Sound a letter','sound')];
  case 'pawn-maker':return [control('Face','face'),control('Body','body'),control('Eyes','eyes'),control('Hat','head')];
  case 'cooking':return [control('Turn heat on / off','heat'),control('Stir','stir'),control('Fresh pot','fresh')];
  case 'code-factory':return [control(s.playing?'Pause robot':'Run robot','run'),control('New route','route')];
  case 'town':return [control('Change vehicle color','paint'),control('New neighbor','visitor')];
  case 'musical-blobs':return [control('Change sound','tone'),control('New colors','paint')];
  default:return [];
 }
}
const palette=(y=540,selected=0)=>colors.map((c,i)=>hit(`color:${i}`,`${O(184+i*100,y,27,c,selected===i?'stroke="'+C.ink+'" stroke-width="5"':'')}`,`Color ${i+1}`)).join('');
const hills=(y=460)=>`<path d="M0 ${y} Q160 ${y-70} 320 ${y-10} T640 ${y+4} T960 ${y-25} V600 H0Z" fill="${C.light}"/>`;
const words=[['M','O','O','N'],['F','I','S','H'],['S','U','N'],['T','R','E','E'],['B','I','R','D'],['B','O','A','T'],['S','T','A','R']];
const dotsPatterns=[[[280,410],[380,160],[480,390],[160,255],[550,255]],[[160,240],[270,140],[420,150],[560,240],[520,400],[380,450],[200,410]],[[160,420],[160,240],[340,100],[520,240],[520,420],[380,420],[380,310],[290,310],[290,420]]];
const shopNames=['Bakery','Flower shop','Fruit market','Pet corner'];
const shopThings=[['Bread','Buns','Cookies','Cake'],['Rose','Tulip','Daisy','Leaves'],['Apple','Pear','Berry','Melon'],['Fish','Bird','Cat','Bunny']];
const bookPages=['In the garden','At the seaside','Around town','Under the stars','In the kitchen'];
const letters=[['SUN','S','U','N'],['FISH','F','I','SH'],['TREE','T','R','EE'],['MOON','M','OO','N'],['BIRD','B','IR','D']];
const bodyShape=(skin=0,shirt=0,hat=0,hair=0)=>{
 const skins=['#f0bc86','#b97f5d','#e2ad87','#805c49'];
 return `${R(392,330,176,156,colors[shirt%6],54)}${R(415,466,56,102,C.ink,18)}${R(492,466,56,102,C.ink,18)}${R(352,342,48,121,skins[skin%4],25)}${R(559,342,48,121,skins[skin%4],25)}${O(480,263,90,skins[skin%4])}${hair%3===0?`<path d="M390 247 Q384 168 480 170 Q571 171 571 251 Q524 205 480 218 Q430 205 390 247Z" fill="${C.ink}"/>`:hair%3===1?`${O(480,175,72,C.ink)}${O(408,214,38,C.ink)}${O(546,215,38,C.ink)}`:`${R(394,172,172,65,C.ink,27)}`}${O(447,268,7,C.ink)}${O(515,268,7,C.ink)}<path d="M453 308 Q480 328 505 308" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>${hat%3===1?`${R(365,177,230,23,C.sun,12)}${R(413,122,136,71,C.sun,22)}`:hat%3===2?`${P('430,189 485,107 550,189',C.coral)}${O(485,103,15,C.sun)}`:''}`;
};
const knob=(x,y,on=false)=>`${O(x,y,29,on?C.sun:C.paper,`stroke="${C.ink}" stroke-width="5"`)}${L(x,y-18,x,y-5,C.ink,5)}`;
const noteHoles=(x,y)=>[0,1,2,3,4,5].map(i=>O(x+i*34,y+Math.sin(i)*20,9,randomColor(i))).join('');
export function renderToy(id,s){
 let art='',hint=toys.find(t=>t.id===id)?.hint||'Play with everything';
 switch(id){
 case 'drawing':{
  art=bg('#fffef9')+`${R(62,35,836,440,'#fffaf0',28,`stroke="${C.sand}" stroke-width="3"`)}`+Array.from({length:14},(_,i)=>L(105,70+i*27,850,70+i*27,'#efe9dd',1)).join('')+
   (s.strokes||[]).map(line=>`<path d="${line.points.map((p,i)=>`${i?'L':'M'}${v(p[0])} ${v(p[1])}`).join(' ')}" stroke="${colors[(line.c||0)%6]}" stroke-width="${line.w||9}" stroke-linejoin="round" stroke-linecap="round" fill="none"/>`).join('')+
   `${T(480,60,'',30)}`+palette(545,s.color);
  break;
 }
 case 'busy-board':{
  art=bg('#f1e4cc')+R(74,62,812,470,'#e2c49b',40,`stroke="#c3a679" stroke-width="12"`)+
   [0,1,2,3].map((i)=>{let x=175+i*204,on=s.switches[i];return hit(`switch:${i}`,`${R(x-51,100,102,164,C.paper,23)}${R(x-24,on?127:165,48,71,on?C.teal:C.muted,12)}${O(x,360,44,C.paper,`stroke="${C.ink}" stroke-width="3"`)}${knob(x,360,on)}${T(x,432,['CLICK','FLIP','TURN','TAP'][i],18,C.muted)}`,`Toggle gadget ${i+1}`)}).join('')+
   [0,1].map(i=>{let x=235+i*490;return hit(`slide:${i}`,`${R(x-115,470,230,21,C.muted,12)}${O(x-105+(s.sliders[i]||0)*210,480,32,C.coral,`stroke="${C.paper}" stroke-width="6"`)}`,`Move slider ${i+1}`)}).join('');
  break;
 }
 case 'musical-blobs':{
  art=bg('#faf7ff')+noteHoles(400,90)+
   (s.blobs||[]).map((b,i)=>drag(`blob:${i}`,b.x,b.y,`${O(0,0,[76,100,83,64][i],randomColor(i+s.mode))}${O(-19,-5,7,C.ink)}${O(19,-5,7,C.ink)}<path d="M-22 23 Q0 43 22 23" stroke="${C.ink}" stroke-width="5" fill="none" stroke-linecap="round"/>${star(40,-55,22,C.paper)}`,`Move and play music blob ${i+1}`)).join('')+
   `<path d="M0 530 Q160 490 320 530 T640 530 T960 530" fill="none" stroke="${C.plum}" stroke-width="6" stroke-dasharray="8 17"/>`;
  break;
 }
 case 'busy-book':{
  const page=s.page%bookPages.length;
  art=bg(page===3?'#34465a':'#faf7e9')+R(105,72,750,470,page===3?'#435c75':C.paper,28,`stroke="${C.sand}" stroke-width="12"`)+
    T(480,125,bookPages[page],39,page===3?C.paper:C.ink)+
    (page===0?`${ground(415,'#dcedcc')}${tree(680,365,.9)}${[240,390,530].map((x,i)=>hit(`book:${i}`,flower(x,285+((i%2)*50),randomColor(i)),'Discover a flower')).join('')}${bird(600,212)}`:
    page===1?`${wave(342,'#9fcbd7')}${wave(430,C.blue)}${[210,390,605].map((x,i)=>hit(`book:${i}`,`${O(x,330+i%2*50,30,randomColor(i))}${P(`${x+10},310 ${x+56},332 ${x+10},355`,C.sun)}`,'Explore a sea creature')).join('')}`:
    page===2?`${ground(420,'#dceada')}${[160,385,615].map((x,i)=>hit(`book:${i}`,`${R(x,280,130,145,randomColor(i),12)}${P(`${x-10},280 ${x+65},218 ${x+140},280`,C.ink)}${R(x+47,355,42,70,C.paper,8)}`,'Explore a building')).join('')}`:
    page===3?`${[0,1,2,3,4,5,6,7].map(i=>star(175+(i*107)%650,196+(i*43)%235,12+i%3*6)).join('')}${hit('book:moon',O(470,325,75,C.sun),'Meet the moon')}`:
    `${R(190,275,600,200,C.sand,32)}${[0,1,2].map(i=>hit(`book:${i}`,`${O(285+i*185,370,66,randomColor(i))}${O(268+i*185,359,10,C.paper)}`,'See the food')).join('')}`)+
    tileBtn(115,500,90,61,'prev','←')+tileBtn(760,500,90,61,'next','→');
  break;
 }
 case 'town':{
  art=bg('#e9f4f2')+R(0,392,960,140,'#bdc8ca',0)+L(0,465,960,465,C.paper,5,'stroke-dasharray="30 35"')+
    [95,330,590,760].map((x,i)=>{let h=[215,260,175,245][i];return hit(`building:${i}`,`${R(x,380-h,170,h,[C.coral,C.sun,C.teal,C.blue][i],9)}${R(x+55,300,60,80,C.paper,7)}${P(`${x-14},${380-h} ${x+86},${350-h} ${x+183},${380-h}`,C.ink)}${T(x+83,380-h+56,['HOME','SHOP','LIBRARY','PARK'][i],16,C.ink)}`,`Visit ${['home','shop','library','park'][i]}`)}).join('')+
    drag('vehicle',s.vehicle.x,s.vehicle.y,car(0,0,colors[s.color]),'Move the car')+
    s.people.map((p,i)=>drag(`person:${i}`,p.x,p.y,person(0,0,randomColor(i),.65),'Move neighbor')).join('')+cloud(500,50,.75);
  break;
 }
 case 'house':{
  let room=s.room%3;
  art=bg('#f9eddb')+P('110,194 480,56 850,194',C.coral)+R(125,190,710,310,room===1?'#e3efe9':room===2?'#e8e2f2':'#fce8cc',0)+R(125,490,710,45,'#bd9b78',0)+
   [315,615].map(x=>L(x,195,x,490,'#ceb9a4',8)).join('')+R(405,192,148,190,C.blue,15)+R(421,208,116,158,s.light?'#d4eef2':'#394a66',12)+L(480,208,480,365,C.paper,6)+L(421,285,537,285,C.paper,6)+
   (room===0?`${R(165,372,235,101,C.teal,26)}${R(180,333,197,61,C.leaf,27)}${R(535,385,225,93,C.sand,12)}${R(610,320,70,66,C.sun,9)}`:
    room===1?`${R(172,330,212,160,C.blue,14)}${R(230,365,64,123,C.paper,4)}${R(558,350,233,130,C.coral,13)}${O(675,342,55,C.paper)}`:
    `${R(165,331,251,164,C.sun,14)}${R(170,311,245,50,C.paper,9)}${R(560,345,178,146,C.plum,13)}${O(642,328,37,C.paper)}`)+
   hit('light',`${O(746,224,30,s.light?C.sun:'#58637f')}${L(746,255,746,290,C.ink,5)}`,'Switch the lights')+
   drag('figure',s.figure.x,s.figure.y,person(0,0,C.coral,.8),'Move family member');
  break;
 }
 case 'forest':{
  art=bg(s.day?'#e1f3e5':'#354967')+(s.day?`${O(820,120,56,C.sun)}${cloud(130,70,.85)}`:`${O(805,126,48,C.sun)}${O(823,109,48,'#354967')}${[0,1,2,3,4,5].map(i=>star(100+i*127,80+(i%3)*56,9)).join('')}`)+hills(428)+ground(508,'#9bc690')+
   [120,360,615,860].map((x,i)=>tree(x,400,[1.1,.82,1.23,.9][i])).join('')+
   s.creatures.map((p,i)=>drag(`creature:${i}`,p.x,p.y,`${O(0,0,28,randomColor(i))}${O(-8,-8,4,C.ink)}${P('18,0 44,9 17,18',C.sun)}`,'Move woodland friend')).join('')+
   Array.from({length:Math.min(9,3+s.count)},(_,i)=>flower(140+i*94,520-(i%3)*21,randomColor(i))).join('')+hit('day',O(820,120,70,'transparent'),'Change day or night');
  break;
 }
 case 'islands':{
  art=bg('#d6edf2')+cloud(135,83)+cloud(725,92,.8)+wave(345,'#a2d4db')+wave(430,C.blue)+
   [160,690].map((x,i)=>hit(`island:${i}`,`${P(`${x-105},375 ${x-55},290 ${x+54},265 ${x+120},370`,i?s.mode%2?C.sand:C.sun:C.sand)}${tree(x,300,.55)}${O(x-60,398,12,C.paper)}`,`Explore island ${i+1}`)).join('')+
   drag('boat',s.boat.x,s.boat.y,`${P('-86,24 88,24 58,62 -57,62',C.coral)}${L(0,21,0,-117,C.ink,7)}${P('6,-109 6,4 82,4',C.paper)}${O(-20,44,5,C.paper)}`,'Sail the boat')+
   Array.from({length:8},(_,i)=>O(110+i*95,480+(i%2)*21,4,C.paper)).join('');
  break;
 }
 case 'shapes':{
  let c=s.form%5;
  art=bg(['#f8f0ee','#e8eff5','#f6efdc','#e8f0e8','#f1ecf7'][c])+O(480,300,225,'none',`stroke="${C.sand}" stroke-width="3" stroke-dasharray="4 15"`)+
    [0,1,2,3,4].map(i=>{let a=(i*72+s.phase*18)*Math.PI/180,x=480+Math.cos(a)*(155+(i%2)*34),y=300+Math.sin(a)*(155+(i%2)*34); let form=(i+c)%4;return hit(`shape:${i}`,form===0?O(x,y,45,randomColor(i+c)):form===1?R(x-42,y-42,84,84,randomColor(i+c),10):form===2?P(`${x},${y-56} ${x+51},${y+35} ${x-51},${y+35}`,randomColor(i+c)):star(x,y,60,randomColor(i+c)),`Transform shape ${i+1}`)}).join('')+
    O(480,300,92,randomColor(c))+O(455,283,9,C.ink)+O(506,283,9,C.ink)+`<path d="M449 321 Q480 346 512 321" fill="none" stroke="${C.ink}" stroke-width="7"/>`;
  break;
 }
 case 'dress-up':{
  art=bg('#f2ebdd')+R(75,90,270,400,'#e8dacc',24)+R(650,90,230,400,'#e8dacc',24)+
    [0,1,2].map(i=>hit(`hair:${i}`,`${O(160+i%2*100,180+Math.floor(i/2)*165,52,i%2?C.ink:C.coral)}${O(148+i%2*100,165+Math.floor(i/2)*165,9,C.paper)}`,'Change hairstyle')).join('')+
    [0,1,2].map(i=>hit(`shirt:${i}`,`${R(707,135+i*105,126,84,randomColor(i),18)}${P(`${707},${155+i*105} 682,${182+i*105} 714,${210+i*105}`,randomColor(i))}`,'Change clothes')).join('')+
    bodyShape(s.skin,s.shirt,s.hat,s.hair)+T(490,65,'',20);
  break;
 }
 case 'silly-blocks':{
  art=bg('#fcf9f3')+ground(508,'#f1e6d1')+L(0,505,960,505,C.ink,4)+
   s.blocks.map((b,i)=>drag(`block:${i}`,b.x,b.y,`${i%3===0?R(-49,-50,98,98,randomColor(b.c),8):i%3===1?O(0,0,53,randomColor(b.c)):P('-55,44 0,-50 55,44',randomColor(b.c))}${O(-18,-8,7,C.ink)}${O(18,-8,7,C.ink)}${L(-13,25,13,25,C.ink,5)}`,'Drag block')).join('')+
   tileBtn(60,65,160,55,'add','ADD A BLOCK');
  break;
 }
 case 'marble-machine':{
  const px=[125,255,405,515,645,785,835],py=[125,215,150,310,360,230,480];
  art=bg('#f5f8f5')+Array.from({length:15},(_,i)=>L(35+i*65,70,35+i*65,535,'#e0e8e3',2)).join('')+
    `<path d="M125 125 L255 215 L405 150 L515 310 L645 360 L785 230 L835 480" fill="none" stroke="${C.sun}" stroke-width="42" stroke-linecap="round" stroke-linejoin="round"/>`+
    `<path d="M125 125 L255 215 L405 150 L515 310 L645 360 L785 230 L835 480" fill="none" stroke="${C.paper}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>`+
    [1,3,5].map((j,i)=>hit(`valve:${i}`,`${O(px[j],py[j],38,s.valves[i]?C.teal:C.coral)}${L(px[j]-22,py[j],px[j]+22,py[j],C.paper,7)}`,`Turn valve ${i+1}`)).join('')+
    O(px[(Math.floor(s.marble/10))%7]||125,py[(Math.floor(s.marble/10))%7]||125,18,C.blue,`stroke="${C.ink}" stroke-width="3"`)+
    R(715,493,165,58,C.teal,14)+T(797,522,s.running?'ROLLING':'PAUSED',22,C.paper);
  break;
 }
 case 'sequencer':{
  art=bg('#f5f4ea')+R(73,75,814,453,'#e5e0d0',34)+R(108,103,740,78,C.ink,20)+T(478,141,'A LITTLE BEAT',37,C.paper)+
    s.steps.map((row,i)=>row.map((on,j)=>hit(`step:${i}:${j}`,`${R(135+j*87,206+i*76,69,57,on?randomColor(i):C.paper,11,`stroke="${s.beat===j&&s.playing?C.ink:C.sand}" stroke-width="${s.beat===j&&s.playing?6:2}"`)}${on?O(169+j*87,235+i*76,9,C.paper):''}`,`Toggle beat ${j+1} sound ${i+1}`)).join('')).join('')+
    [0,1,2,3].map(i=>T(106,235+i*76,['BOOM','TICK','BELL','PLINK'][i],16,C.ink,'text-anchor="start"')).join('');
  break;
 }
 case 'radio':{
  art=bg('#edf3f0')+R(142,108,673,410,'#d29f78',54)+R(183,147,598,326,'#e8bb95',31)+
    R(220,175,495,155,C.ink,21)+Array.from({length:27},(_,i)=>L(239+i*17,190,239+i*17,314,'#536875',4)).join('')+
    O(310,400,57,C.paper)+O(650,400,57,C.paper)+O(310,400,33,C.teal)+O(650,400,33,C.coral)+
    L(311,399,310+Math.sin(s.station)*32,400-Math.cos(s.station)*32,C.ink,7)+
    hit('station',`${R(378,375,202,65,C.paper,18)}${T(480,409,['GARDEN','BUBBLES','MOONLIGHT','SUNSHINE'][s.station%4],22,C.ink)}`,'Choose next radio channel')+
    [0,1,2,3,4,5,6].map(i=>O(345+i*47,248+Math.sin((i+s.turn)*1.1)*29,8+i%3*4,randomColor(i))).join('')+T(480,80,'TUNE YOUR DAY',35,C.ink);
  break;
 }
 case 'world-puzzle':{
  art=bg('#eaf2f0')+R(126,66,711,325,'#d0e3d9',24,`stroke="${C.teal}" stroke-width="6"`)+
   [0,1,2,3,4,5].map(i=>{let x=130+(i%3)*233,y=70+Math.floor(i/3)*162;return `${R(x+8,y+6,219,151,C.paper,4,`stroke="${C.sand}" stroke-width="2" stroke-dasharray="11 9"`)}`}).join('')+
   s.tiles.map((p,i)=>{let col=[C.coral,C.sun,C.teal,C.blue,C.leaf,C.plum][i];return drag(`tile:${i}`,p.x,p.y,`${R(-73,-44,145,90,col,9)}${i%2?cloud(-10,-20,.4):`${O(13,-5,23,C.sun)}${P('-40,28 -7,-22 31,28',C.ink)}`}`,`Move world puzzle tile ${i+1}`)}).join('')+
   T(480,41,'BUILD A WORLD',23);
  break;
 }
 case 'dinosaurs':{
  art=bg(s.weather%2?'#f5e8d0':'#dfefe5')+O(815,111,63,C.sun)+hills(450)+ground(495,'#add098')+
    [85,760,920].map((x,i)=>tree(x,432,.65+i%2*.25)).join('')+
    drag('dino',s.dino.x,s.dino.y,`${O(0,0,115,C.teal)}${O(87,-92,54,C.teal)}${L(92,-51,113,-25,C.teal,48)}${P('-99,-18 -224,-94 -185,54',C.teal)}${R(-52,70,40,88,C.teal,10)}${R(45,70,40,88,C.teal,10)}${O(104,-107,9,C.ink)}${[0,1,2].map(i=>P(`${-72+i*59},-105 ${-47+i*59},-156 ${-20+i*59},-90`,C.sun)).join('')}`,'Move the dinosaur')+
    hit('egg',`${O(740,460,69,C.paper)}${[0,1,2].map(i=>O(715+i*25,438+i%2*31,11,C.coral)).join('')}${s.egg%2?bird(735,402,C.coral):''}`,'Tap to hatch an egg');
  break;
 }
 case 'connect-the-dots':{
  const pts=dotsPatterns[s.shape%3];let connected=Math.min(s.connected,pts.length);
  art=bg('#fffaf0')+R(93,66,775,449,'#f3ead4',25)+
    pts.slice(0,connected).map((p,i)=>i?L(pts[i-1][0],pts[i-1][1],p[0],p[1],colors[s.color],8):'').join('')+
    pts.map((p,i)=>hit(`dot:${i}`,`${O(p[0],p[1],31,i<connected?C.teal:C.paper,`stroke="${C.ink}" stroke-width="3"`)}${T(p[0],p[1],i+1,23,i<connected?C.paper:C.ink)}`,`Connect dot ${i+1}`)).join('')+
    T(480,558,'FOLLOW THE LITTLE DOTS',24);
  break;
 }
 case 'shops':{
  let shelf=shopThings[s.shop%4];
  art=bg('#f9f2e6')+R(86,96,768,396,'#f0d8b5',20)+R(117,120,702,79,colors[s.shop%6],13)+T(470,159,shopNames[s.shop%4].toUpperCase(),37,C.paper)+
    [0,1].map(i=>R(145,245+i*133,600,16,'#ad7962',6)).join('')+
    shelf.map((name,i)=>{let x=198+i%4*151,y=258+(i%2)*136;return hit(`buy:${i}`,`${O(x,y,45,randomColor(i+s.shop))}${i%2?star(x,y,25,C.paper):O(x-12,y-8,12,C.paper)}${T(x,y+70,name,20,C.ink)}`,`Put ${name.toLowerCase()} in basket`)}).join('')+
    R(758,344,144,135,C.sand,15)+T(828,381,'BASKET',18)+T(828,438,s.basket.length,50,C.ink)+T(467,558,'TAKE SOMETHING HOME',24);
  break;
 }
 case 'geometry':{
  art=bg('#f3f5f2')+R(100,76,760,421,'#e6eee9',18,`stroke="${C.sand}" stroke-width="3"`)+
    [0,1,2,3,4].map(i=>{let b=s.pieces[i];return drag(`piece:${i}`,b.x,b.y,i%4===0?O(0,0,59,randomColor(i+s.color)):i%4===1?R(-55,-55,110,110,randomColor(i+s.color),12):i%4===2?P('0,-67 69,50 -69,50',randomColor(i+s.color)):P('-75,-35 0,-75 75,-35 75,35 0,75 -75,35',randomColor(i+s.color)),`Drag shape ${i+1}`)}).join('')+
   T(480,548,'PLACE • COMBINE • EXPLORE',22);
  break;
 }
 case 'space':{
  art=bg('#26334f')+Array.from({length:52},(_,i)=>O(35+deterministic(i,1)*890,25+deterministic(i,8)*530,i%4?2:4,i%3===0?C.sun:C.paper)).join('')+
    O(715,310,175,'none',`stroke="#8390a8" stroke-width="4" stroke-dasharray="5 18"`)+
    hit('planet',`${O(716,305,115,[C.blue,C.coral,C.sun,C.teal][s.planet%4])}${P('612,322 675,290 770,325 813,277 805,341 703,359',s.planet%2?C.cream:C.leaf)}`,'Change planet')+
    drag('rocket',s.rocket.x,s.rocket.y,`${P('-36,52 -38,-35 0,-90 38,-35 36,52',C.paper)}${O(0,-20,18,C.blue)}${P('-35,34 -64,66 -33,77',C.coral)}${P('35,34 64,66 33,77',C.coral)}${P('-21,69 0,126 21,69',C.sun)}`,'Fly the rocket')+
    T(160,105,'UP, UP, AWAY',33,C.paper);
  break;
 }
 case 'number-journey':{
  const n=s.number;
  art=bg('#f7f1e1')+R(116,83,726,401,C.paper,34)+T(480,195,n,134,C.ink)+
    Array.from({length:n},(_,i)=>{let x=225+(i%6)*105,y=310+Math.floor(i/6)*92;return hit(`count:${i}`,s.kind%3===0?flower(x,y,randomColor(i)):s.kind%3===1?star(x,y,32,randomColor(i)):O(x,y,29,randomColor(i)),`Count item ${i+1}`)}).join('')+
    tileBtn(275,506,150,65,'minus','−')+tileBtn(536,506,150,65,'plus','+');
  break;
 }
 case 'phonics':{
  const w=letters[s.word%letters.length],chunks=w.slice(1);
  art=bg('#f8efe3')+R(102,82,756,434,C.paper,31)+
    (w[0]==='SUN'?`${O(484,228,73,C.sun)}${Array.from({length:8},(_,i)=>{let a=i*Math.PI/4;return L(484+Math.cos(a)*87,228+Math.sin(a)*87,484+Math.cos(a)*122,228+Math.sin(a)*122,C.coral,8)}).join('')}`:
     w[0]==='MOON'?`${O(485,226,95,C.sun)}${O(522,196,90,C.paper)}`:
     w[0]==='FISH'?`${O(485,225,74,C.blue)}${P('525,225 615,166 615,284',C.teal)}${O(452,213,8,C.ink)}`:
     w[0]==='TREE'?tree(480,235,1):bird(485,225,C.coral))+
    chunks.map((ch,i)=>hit(`letter:${i}`,`${R(248+i*(468/chunks.length),372,440/chunks.length-10,90,i===s.letter?C.sun:C.light,15)}${T(248+i*(468/chunks.length)+(440/chunks.length-10)/2,416,ch,41)}`,`Hear ${ch} sound`)).join('')+T(480,550,w[0],28);
  break;
 }
 case 'pawn-maker':{
  art=bg('#eaf0e5')+R(290,58,380,506,'#f9f5e8',35)+
    bodyShape(s.face,s.body,s.head,s.eyes)+
    [0,1,2].map(i=>hit(`face:${i}`,`${O(122,150+i*140,39,['#f0bc86','#b97f5d','#805c49'][i])}${O(110,145+i*140,5,C.ink)}${O(134,145+i*140,5,C.ink)}`,'Change face')).join('')+
    [0,1,2].map(i=>hit(`body:${i}`,R(750,115+i*142,101,97,randomColor(i),20),'Change body')).join('');
  break;
 }
 case 'cooking':{
  art=bg('#f9efe2')+R(75,102,810,395,'#f2d8bf',25)+R(370,155,326,85,'#b7c4c1',30)+
    O(515,340,180,C.ink)+O(515,340,149,'#87999b')+O(515,333,120,s.heat?'#f4b76c':'#f4e0b6')+
    s.ingredients.slice(-15).map((ing,i)=>{let a=i*2.4,r=23+(i%4)*26,x=515+Math.cos(a)*r,y=329+Math.sin(a)*r;return `${O(x,y,19,randomColor(ing+i))}${O(x-5,y-5,4,C.paper)}`}).join('')+
    [0,1,2,3].map(i=>hit(`ingredient:${i}`,`${O(150,190+i*85,34,randomColor(i))}${T(211,191+i*85,['PEA','CARROT','TOMATO','SPICE'][i],19,C.ink)}`,`Add ${['peas','carrot','tomato','spice'][i]}`)).join('')+
    hit('stir',`${R(700,248,88,190,C.paper,25)}${L(744,280,744,382,C.ink,9)}`,'Stir the pot')+T(516,549,s.heat?'SIMMERING NICELY':'READY TO MIX',27);
  break;
 }
 case 'code-factory':{
  const row=3,col=6,cw=112,ox=142,oy=230;
  art=bg('#ebf1ee')+R(100,113,755,355,'#dae6e2',25)+
    s.commands.map((dir,i)=>{let x=ox+i*cw,y=oy+(i%2)*18;return hit(`command:${i}`,`${R(x-40,y-47,91,100,dir===0?C.sun:dir===1?C.teal:C.blue,14)}${T(x+5,y+6,['↑','→','↓','←'][dir%4],54,C.paper)}`,`Change direction tile ${i+1}`)}).join('')+
    `<path d="M132 360 H840" stroke="${C.ink}" stroke-width="5" stroke-dasharray="13 17" fill="none"/>`+
    `${R(126+Math.min(s.robot,5)*cw,343,69,64,C.coral,16)}${O(149+Math.min(s.robot,5)*cw,363,7,C.paper)}${O(172+Math.min(s.robot,5)*cw,363,7,C.paper)}${L(160+Math.min(s.robot,5)*cw,343,160+Math.min(s.robot,5)*cw,319,C.ink,5)}${O(160+Math.min(s.robot,5)*cw,314,8,C.sun)}`+
    T(480,78,'THE LITTLE FACTORY',34)+T(480,525,'TAP AN ARROW TO CHANGE ITS PATH',22);
  break;
 }
 default:art=bg()+T(480,300,'Let’s make something',54);
 }
 return {art,hint,tools:toolItems(id,s)};
}
export function interact(id,s,action){
 s.turn=(s.turn||0)+1;
 const parts=String(action).split(':'),a=parts[0],n=Number(parts[1]);
 if(a==='color'){s.color=n%6;return s;}
 switch(id){
 case 'drawing':
  if(a==='stamp'&&s.strokes.length<150){const x=210+(s.turn*79)%540,y=120+(s.turn*51)%280;s.strokes.push({c:s.color,w:s.width,points:[[x,y],[x+1,y+1]]});}
  if(a==='undo')s.strokes.pop();
  if(a==='size')s.width=([5,10,18,28].indexOf(s.width)+1)%4===0?5:[5,10,18,28][([5,10,18,28].indexOf(s.width)+1)%4];
  if(a==='clear')s.strokes=[];
  break;
 case 'busy-board':
  if(a==='switch')s.switches[n]=!s.switches[n];
  if(a==='slide')s.sliders[n]=((s.sliders[n]||0)+.25)%1.01;
  if(a==='dial'&&Number.isInteger(n)&&n>=0&&n<s.dials.length)s.dials[n]=(s.dials[n]+1)%4;
  // Meshed gears turn in opposite directions. Each is independently tappable.
  if(a==='gear'&&Number.isInteger(n)&&n>=0&&n<s.dials.length){
   s.dials[n]=(s.dials[n]+1)%4;
   s.dials[1-n]=(s.dials[1-n]+3)%4;
  }
  break;
 case 'musical-blobs':
  if(a==='tone')s.mode=(s.mode+1)%4;
  if(a==='paint')s.mode=(s.mode+1)%6;
  break;
 case 'busy-book':
  if(a==='prev')s.page=(s.page+bookPages.length-1)%bookPages.length;
  if(a==='next')s.page=(s.page+1)%bookPages.length;
  if(a==='book'&&Number.isInteger(n)&&n>=0&&n<3){
   const key=`${s.page}:${n}`,old=s.touched||[];
   s.touched=old.includes(key)?old.filter(item=>item!==key):[...old.slice(-29),key];
  }
  break;
 case 'town':
  if(a==='paint')s.color=(s.color+1)%6;
  if(a==='visitor'&&s.people.length<9)s.people.push({x:190+s.people.length*65,y:390});
  if(a==='building')s.mode=n;
  break;
 case 'house':
  if(a==='room')s.room=(s.room+1)%3;
  if(a==='light')s.light=!s.light;
  break;
 case 'forest':
  if(a==='day')s.day=!s.day;
  if(a==='grow')s.count=Math.min(6,s.count+1);
  break;
 case 'islands':
  if(a==='island')s.island=(s.island+1)%3;
  if(a==='breeze')s.mode=(s.mode+1)%2;
  break;
 case 'shapes':
  if(a==='form'||a==='shape')s.form=(s.form+1)%5;
  if(a==='spin')s.phase=(s.phase+2)%20;
  break;
 case 'dress-up':
  if(['hair','shirt','hat','skin'].includes(a))s[a]=(n>=0&&parts.length>1?n:s[a]+1)%(['skin'].includes(a)?4:3);
  break;
 case 'silly-blocks':
  if(a==='add'&&s.blocks.length<18){let i=s.blocks.length;s.blocks.push({x:170+(i*113)%650,y:150+(i*31)%230,c:i%6});}
  if(a==='scatter')s.blocks.forEach((b,i)=>{b.x=135+(i*169)%700;b.y=175+(i*93)%300;});
  break;
 case 'marble-machine':
  if(a==='valve')s.valves[n]=!s.valves[n];
  if(a==='run')s.running=!s.running;
  if(a==='marble')s.marble=0;
  break;
 case 'sequencer':
  if(a==='step') {let row=n,col=Number(parts[2]);s.steps[row][col]=!s.steps[row][col];}
  if(a==='play')s.playing=!s.playing;
  if(a==='pattern')s.steps=s.steps.map((row,i)=>row.map((_,j)=>(j+i+s.turn)%4===0));
  break;
 case 'radio':
  if(a==='play')s.playing=!s.playing;
  if(a==='station')s.station=(s.station+1)%4;
  if(a==='volume')s.volume=(s.volume+1)%5;
  break;
 case 'world-puzzle':
  if(a==='shuffle')s.tiles.forEach((p,i)=>{p.x=125+(i*159+s.turn*37)%680;p.y=405+i%2*92;});
  break;
 case 'dinosaurs':
  if(a==='weather')s.weather=(s.weather+1)%2;
  if(a==='egg')s.egg++;
  break;
 case 'connect-the-dots':
  if(a==='dot'&&n===s.connected)s.connected++;
  if(a==='restart')s.connected=0;
  if(a==='pattern'){s.shape=(s.shape+1)%3;s.connected=0;}
  break;
 case 'shops':
  if(a==='shop')s.shop=(s.shop+1)%4;
  if(a==='buy'&&s.basket.length<30)s.basket.push(`${s.shop}:${n}`);
  if(a==='empty')s.basket=[];
  break;
 case 'geometry':
  if(a==='randomize')s.pieces.forEach((p,i)=>{p.x=175+(i*151+s.turn*55)%610;p.y=180+(i*71)%270;});
  if(a==='rotate')s.color=(s.color+1)%6;
  break;
 case 'space':
  if(a==='planet')s.planet=(s.planet+1)%4;
  if(a==='stars')s.stars++;
  break;
 case 'number-journey':
  if(a==='plus')s.number=Math.min(12,s.number+1);
  if(a==='minus')s.number=Math.max(1,s.number-1);
  if(a==='kind')s.kind++;
  break;
 case 'phonics':
  if(a==='word'){s.word=(s.word+1)%letters.length;s.letter=0;s.placed=[false,false,false];}
  if(a==='letter'){s.letter=n;if(Number.isInteger(n)&&n>=0&&n<s.placed.length)s.placed[n]=true;}
  if(a==='sound')s.letter=(s.letter+1)%3;
  break;
 case 'pawn-maker':
  if(['face','body','eyes','head'].includes(a))s[a]=(s[a]+1)%(['face'].includes(a)?4:3);
  break;
 case 'cooking':
  if(a==='scene')s.mode=(s.mode+1)%2;
  if(a==='guest'&&Number.isInteger(n)&&n>=0&&n<3){s.guest=n;s.craving=(s.craving+1+n)%4;}
  if(a==='serve'){
   if(s.ingredients.length){s.served++;s.guest=(s.guest+1)%3;s.ingredients=[];s.rejected=0;}
   else s.rejected++;
  }
  if(a==='cupboard'&&Number.isInteger(n)&&n>=0&&n<s.cupboards.length)s.cupboards[n]=!s.cupboards[n];
  if(a==='ingredient'&&s.ingredients.length<35)s.ingredients.push(n);
  if(a==='water')s.water=!s.water;
  if(a==='heat')s.heat=!s.heat;
  if(a==='stir')s.stir++;
  if(a==='fresh'){s.ingredients=[];s.heat=false;s.water=false;}
  break;
 case 'code-factory':
  if((a==='command'||a==='director')&&Number.isInteger(n)&&n>=0&&n<s.commands.length)s.commands[n]=(s.commands[n]+1)%4;
  if(a==='run')s.playing=!s.playing;
  if(a==='route'){s.robot=0;s.commands=s.commands.map((c,i)=>(c+i+1)%4);}
  if(a==='crate'){s.crates++;s.goods++;s.mess=Math.min(6,s.mess+1);}
  if(a==='clean')s.mess=0;
  break;
 }
 return s;
}
export function moveDrag(id,s,key,x,y,layout='wide'){
 x=Math.max(60,Math.min(885,v(x)));y=Math.max(85,Math.min(520,v(y)));
 const [type,num]=key.split(':'),n=Number(num);
 if(id==='musical-blobs'&&type==='blob'&&s.blobs[n]){s.blobs[n]={x,y};if(s.blobs.some((p,i)=>i!==n&&Math.hypot(p.x-x,p.y-y)<175))s.collisions=(s.collisions||0)+1;return true;}
 if(id==='phonics'&&type==='phoneme'&&Number.isInteger(n)&&n>=0&&n<3){if(y>=330)s.placed[n]=true;return true;}
 if(id==='town'){
  // Touching a building with a resident or vehicle changes the active place.
  const visit=()=>{
   if(layout!=='portrait')return;
   const px=x/2,py=y*1.4;
   if(px>=25&&px<=458&&py>=195&&py<=589)
    s.mode=(py>=394?2:0)+(px>=240?1:0);
  };
  if(type==='vehicle'){s.vehicle={x,y};visit();return true;}
  if(type==='person'&&s.people[n]){s.people[n]={x,y};visit();return true;}
 }
 if(id==='house'&&type==='figure'){s.figure={x,y};return true;}
 if(id==='forest'&&type==='creature'&&s.creatures[n]){s.creatures[n]={x,y};return true;}
 if(id==='islands'&&type==='boat'){s.boat={x,y};return true;}
 if(id==='silly-blocks'&&type==='block'&&s.blocks[n]){s.blocks[n]={...s.blocks[n],x,y};return true;}
 if(id==='world-puzzle'&&type==='tile'&&s.tiles[n]){
  const tx=244+(n%3)*233,ty=151+Math.floor(n/3)*162;
  if(Math.abs(x-tx)<90&&Math.abs(y-ty)<75){x=tx;y=ty;}
  s.tiles[n]={x,y};return true;
 }
 if(id==='dinosaurs'&&type==='dino'){s.dino={x,y};return true;}
 if(id==='geometry'&&type==='piece'&&s.pieces[n]){s.pieces[n]={x,y};return true;}
 if(id==='space'&&type==='rocket'){s.rocket={x,y};return true;}
 return false;
}
// Returns notes to synthesize when a running music activity advances.
export function tickToy(id,s){
 if(id==='sequencer'&&s.playing){s.beat=(s.beat+1)%8;return s.steps.flatMap((row,i)=>row[s.beat]?[220,330,440,550][i]:[]);}
 if(id==='radio'&&s.playing){s.turn++;return [[262,330,392,440],[220,277,330,370],[330,392,440,523],[262,349,392,494]][s.station%4].slice(s.turn%4,s.turn%4+1).map(f=>f*(s.volume?1:0));}
 if(id==='marble-machine'&&s.running){s.marble=(s.marble+3)%70;return [];}
 if(id==='code-factory'&&s.playing){s.robot=(s.robot+1)%6;return s.robot===0?[220+s.commands[0]*110]:[];}
 return null;
}
export const toyById=id=>toys.find(t=>t.id===id);
export const allToyIds=()=>toys.map(t=>t.id);
