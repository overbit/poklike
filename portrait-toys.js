// Original portrait compositions for small screens. Coordinates are in a 480x840
// toy world; draggable state and drawing strokes still use the 960x600 model.
import {C,colors} from './toys.js';

export const PORTRAIT={width:480,height:840};
export const toPortrait=({x,y})=>({x:x/2,y:y*1.4});
export const toModel=({x,y})=>({x:x*2,y:y/1.4});
const n=v=>Math.round(v*10)/10;
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const r=(x,y,w,h,fill,rad=14,extras='')=>`<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${rad}" fill="${fill}" ${extras}/>`;
const c=(x,y,rad,fill,extras='')=>`<circle cx="${n(x)}" cy="${n(y)}" r="${rad}" fill="${fill}" ${extras}/>`;
const l=(x1,y1,x2,y2,col=C.ink,sw=6,extras='')=>`<path d="M${n(x1)} ${n(y1)} L${n(x2)} ${n(y2)}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" fill="none" ${extras}/>`;
const t=(x,y,str,size=23,col=C.ink,extra='')=>`<text x="${n(x)}" y="${n(y)}" fill="${col}" font-family="ui-rounded,system-ui,sans-serif" font-size="${size}" font-weight="800" text-anchor="middle" dominant-baseline="middle" ${extra}>${safe(str)}</text>`;
const path=(d,col,extra='')=>`<path d="${d}" fill="${col}" ${extra}/>`;
const action=(key,x,y,w,h,art,label)=>`<g data-act="${safe(key)}" tabindex="0" role="button" aria-label="${safe(label)}" class="toy-hit">${art}${r(x,y,w,h,'transparent',10)}</g>`;
const drag=(key,x,y,art,label)=>`<g data-drag="${safe(key)}" transform="translate(${n(x)} ${n(y)})" tabindex="0" role="button" aria-label="${safe(label)}" class="toy-drag">${art}</g>`;
const circleButton=(key,x,y,color,label,inside='')=>action(key,x-32,y-32,64,64,c(x,y,31,color)+inside,label);
const title=(txt,col=C.ink)=>t(240,117,txt,26,col);
const stage=(col=C.paper)=>r(0,0,480,840,col,0)+path('M0 0 H480 V100 Q235 135 0 100 Z', 'rgba(255,255,255,.22)');
const pill=(x,y,w,label,act,color=C.paper)=>action(act,x,y,w,65,r(x,y,w,65,color,21)+t(x+w/2,y+33,label,20),label);
const stars=(count,offset=0)=>Array.from({length:count},(_,i)=>c(40+((i*73+offset*21)%398),153+((i*139+offset*31)%485),3+i%3,'rgba(255,255,255,.6)')).join('');
const face=(x,y,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})">${c(-12,-5,3,C.ink)}${c(12,-5,3,C.ink)}${path('M-12 13 Q0 23 12 13','none',`stroke="${C.ink}" stroke-width="3" stroke-linecap="round"`)}</g>`;
const flower=(x,y,col=C.coral,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">${l(0,1,0,56,C.leaf,6)}${[0,72,144,216,288].map(a=>c(Math.cos(a*Math.PI/180)*22,Math.sin(a*Math.PI/180)*22,16,col)).join('')}${c(0,0,12,C.sun)}</g>`;
const bush=(x,y,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})">${c(-35,5,37,C.leaf)}${c(0,-18,47,C.teal)}${c(42,8,36,C.leaf)}${c(0,-16,7,C.cream)}</g>`;
const miniPerson=(x,y,shirt=C.teal)=>`<g transform="translate(${x} ${y})">${r(-11,21,9,31,C.ink,5)}${r(3,21,9,31,C.ink,5)}${r(-22,-8,44,38,shirt,16)}${c(0,-28,23,C.sun)}${face(0,-26,.6)}</g>`;
const shopIcon=(name,x,y)=>{
 const col=[C.coral,C.teal,C.sun,C.blue][['BAKERY','MARKET','FLORIST','TOYS'].indexOf(name)]||C.coral;
 return `${r(x-90,y-45,180,160,C.paper,17)}${r(x-93,y-57,186,48,col,13)}${r(x-69,y+13,58,100,'#dce9e8',6)}${r(x+14,y+14,50,40,C.sun,6)}${t(x,y-32,name,17,C.paper)}`;
};
const decorated=(col,content)=>stage(col)+content;

function drawing(s){
 const marks=s.strokes.map(line=>{const pts=line.points.map(toPortrait);return `<path d="${pts.map((p,i)=>`${i?'L':'M'} ${n(p.x)} ${n(p.y)}`).join(' ')}" fill="none" stroke="${colors[line.c%6]}" stroke-width="${n(line.w*.7)}" stroke-linecap="round" stroke-linejoin="round"/>`;}).join('');
 const palette=colors.map((col,i)=>circleButton(`color:${i}`,73+i*67,766,col,`Choose drawing color ${i+1}`,s.color===i?c(73+i*67,766,34,'none',`stroke="${C.ink}" stroke-width="3"`):'')).join('');
 return decorated('#fffdfa',r(18,101,444,627,'#fffaf0',19,`stroke="#e8dccb" stroke-width="2"`)+marks+
 r(0,724,480,116,'#f5eee0',0)+palette+action('undo',340,116,112,57,r(340,116,112,57,'#f4e4ce',18)+t(396,145,'Undo',20),'Undo last mark')+action('size',32,116,112,57,r(32,116,112,57,'#e8eceb',18)+t(88,145,'Brush',20),'Change brush size'));
}
function board(s){
 const switches=s.switches.map((on,i)=>{
  const x=81+(i%2)*192,y=202+Math.floor(i/2)*128;
  return action(`switch:${i}`,x-48,y-44,98,92,
    r(x-48,y-42,96,87,'#f3e8d3',17)+r(x-11,y-31,22,62,'#b9c6c3',12)+c(x,y+(on?-22:21),26,on?C.teal:C.coral)+c(x-6,y+(on?-30:13),7,'rgba(255,255,255,.56)'),`Toggle switch ${i+1}`);
 }).join('');
 const slider=s.sliders.map((v,i)=>{
  const y=501+i*100,x=64+350*v;
  return `<g data-slider="${i}" data-act="slide:${i}" tabindex="0" role="slider" aria-label="Move slider ${i+1}" class="toy-hit">${r(42,y-22,396,42,'#e5e4db',23)}${r(64,y-5,350,12,'#bdc7c7',6)}${r(64,y-5,350*v,12,i?C.coral:C.blue,6,'data-slider-fill="true"')}${c(64+350*v,y,31,C.ink,'data-slider-knob="true"')}${c(64+350*v,y,20,i?C.sun:C.teal,'data-slider-knob="true"')}${r(42,y-32,396,69,'transparent',15)}</g>`;
 }).join('');
 const dial=s.dials.map((v,i)=>{
  const x=132+i*210;return action(`dial:${i}`,x-61,648,122,114,c(x,704,51,'#e6ddd0')+c(x,704,39,C.paper)+l(x,704,x+30*Math.cos(v*Math.PI/2),704+30*Math.sin(v*Math.PI/2),C.ink,9)+c(x,704,7,C.coral),`Turn dial ${i+1}`);
 }).join('');
 return decorated('#edf3f0',r(30,154,420,655,'#fdfaf3',35,`stroke="#d3d9ce" stroke-width="3"`)+
  title('Touch, turn and slide')+switches+slider+dial);
}
function blobs(s){
 const positions=s.blobs.map(toPortrait);const mood=s.mode%4;
 const colorset=[C.sun,C.coral,C.teal,C.blue],orbits=positions.map((p,i)=>c(p.x,p.y,66+(s.turn%3)*4,'none',`stroke="${colorset[i%4]}" stroke-width="3" opacity=".2"`)).join('');
 const objects=positions.map((p,i)=>{
  const col=colorset[(i+mood)%4],size=46+i*4;
  const art=c(0,0,size,col)+c(-size*.3,-size*.4,size*.26,'rgba(255,255,255,.3)')+face(0,7,.9)+c(0,0,size+9,'transparent',`stroke="${col}" stroke-width="2" opacity=".5"`);
  return drag(`blob:${i}`,p.x,p.y,art,`Move musical shape ${i+1}`);
 }).join('');
 return decorated('#f9f8f3',title('Make a little melody')+stars(13)+orbits+objects+
  pill(112,731,256,'Another sound','tone','#f1ece6'));
}
function book(s){
 const page=s.page%5,names=['Garden','Ocean','Neighborhood','Night sky','Kitchen'];
 const col=['#e4f2e1','#d9eff6','#f5e2c9','#283954','#f5e3d6'][page],dark=page===3;
 let content='';
 if(page===0)content=[flower(171,370,C.coral,1.5),flower(322,480,C.blue,1.15),bush(242,613,1.2)].join('');
 if(page===1)content=path('M30 405 Q145 365 260 405 T450 405 V712 H30 Z','#83c9d9')+Array.from({length:5},(_,i)=>action(`book:${i}`,75+i*73,446+i%2*70,75,75,c(115+i*70,481+i%2*70,27,colors[i])+c(103+i*70,473+i%2*70,4,C.ink),`Meet sea creature ${i+1}`)).join('');
 if(page===2)content=shopIcon('MARKET',242,453)+miniPerson(144,640)+miniPerson(320,642,C.coral);
 if(page===3)content=stars(20,5)+c(330,285,70,C.sun)+c(358,257,70,col)+[150,270,370].map((x,i)=>c(x,544+i%2*54,24,colors[i])).join('');
 if(page===4)content=r(105,360,270,245,'#d6e4da',27)+c(240,495,110,C.ink)+c(240,495,86,C.sun)+[0,1,2].map(i=>c(175+i*65,480+i%2*45,24,colors[i])).join('');
 const objects=Array.from({length:3},(_,i)=>{
 const x=108+i*132,y=250+((i%2)*35),hit=s.touched?.includes(`${page}:${i}`);
 return action(`book:${i}`,x-40,y-39,80,78,c(x,y,32,hit?C.sun:dark?C.paper:C.paper)+t(x,y,['1','2','3'][i],24,C.ink),`Explore object ${i+1}`);
 }).join('');
 return decorated(col,r(29,167,422,556,'rgba(255,255,255,.5)',27)+title(names[page],dark?C.paper:C.ink)+content+objects+
 circleButton('prev',92,767,C.paper,'Previous book page',t(92,767,'<',29))+
 circleButton('next',388,767,C.paper,'Next book page',t(388,767,'>',29)));
}
function town(s){
 const modes=['MARKET','SCHOOL','FARM','PARK'];const mode=s.mode%4;
 const skyline=[C.coral,C.blue,C.sun,C.leaf][mode];
 const building=shopIcon(modes[mode],247,355);
 const vehicle=toPortrait(s.vehicle),folks=s.people.slice(0,7);
 return decorated('#dff0ec',path('M0 370 Q100 335 205 370 T480 370 V840 H0 Z','#c7e1bc')+r(0,595,480,167,'#aaa8a0',0)+l(0,679,480,679,'#f6f1dc',5,'stroke-dasharray="17 24"')+
  title('Around town')+building+
  drag('vehicle',Math.max(65,vehicle.x),Math.min(728,Math.max(570,vehicle.y+165)),r(-61,-26,122,62,C.coral,19)+c(-36,40,21,C.ink)+c(37,40,21,C.ink)+r(-37,-12,75,32,'#c1e4e3',12),'Drive the car')+
  folks.map((p,i)=>{const at=toPortrait(p);return drag(`person:${i}`,Math.max(60,at.x),Math.min(715,Math.max(510,at.y)),miniPerson(0,0,colors[i%6]),`Move resident ${i+1}`);}).join('')+
  modes.map((name,i)=>action(`building:${i}`,40+i*101,743,95,72,r(40+i*101,743,95,72,i===mode?skyline:C.paper,18)+t(87+i*101,777,['Shop','School','Farm','Park'][i],14,i===mode?C.paper:C.ink),`Visit ${name.toLowerCase()}`)).join(''));
}
function house(s){
 const room=s.room%3;
 const cols=['#f3e1d8','#ddecdb','#dbe6f1'];
 const items=[r(118,444,247,120,C.coral,26)+r(135,403,209,68,'#f2d4be',19),
   c(246,501,90,C.paper)+c(246,501,59,'#c1dfdf')+l(96,398,96,560,C.blue,17),
   r(121,422,231,151,'#a7b8da',20)+r(140,446,197,103,C.paper,17)][room];
 const at=toPortrait(s.figure);
 return decorated(cols[room],r(49,212,384,516,'rgba(255,255,255,.5)',23)+r(84,263,309,348,'#fdf8ee',24)+
  r(127,295,92,102,s.light?C.sun:'#808f9c',10)+r(315,295,47,135,'#e1a17e',13)+items+
  drag('figure',Math.max(68,Math.min(410,at.x)),Math.min(677,at.y+85),miniPerson(0,0,C.teal),'Move family member')+
  pill(38,730,194,'Next room','room')+pill(247,730,194,s.light?'Lights off':'Lights on','light')+title(['Living room','Bathroom','Bedroom'][room]));
}
function forest(s){
 const night=!s.day;
 const base=night?'#25384b':'#d9e9de';
 const trees=[92,274,390].map((x,i)=>r(x-15,342+i%2*30,32,331,'#99745e',12)+c(x,335+i%2*30,74,i%2?C.teal:C.leaf)).join('');
 const creatures=s.creatures.map((p,i)=>{const at=toPortrait(p);return drag(`creature:${i}`,Math.max(60,at.x),Math.min(713,at.y),c(0,0,40,i?C.coral:C.sun)+face(0,0),'Move woodland animal');}).join('');
 return decorated(base,stars(night?21:0)+title(night?'A quiet night':'A little forest',night?C.paper:C.ink)+trees+
  path('M0 630 Q160 583 275 644 T480 618 V840 H0 Z','#a2cba5')+creatures+
  Array.from({length:s.count||0},(_,i)=>flower(65+i*68,701,C.coral,.6)).join('')+
  pill(35,738,191,night?'Morning':'Nighttime','day')+pill(243,738,198,'Grow flowers','grow'));
}
function islands(s){
 const at=toPortrait(s.boat),island=s.island%3;
 return decorated('#d8f1f6',title('Sail the little sea')+
  path('M0 260 Q100 245 240 260 T480 260 V840 H0 Z','#7fc0d2')+
  [0,1,2].map((i)=>path(`M${50+i*120} ${440+i*66} Q${100+i*120} ${405+i*66} ${143+i*120} ${445+i*66}`,'none','stroke="rgba(255,255,255,.5)" stroke-width="8"')).join('')+
  c(200+island*37,330+island*42,89,C.sun)+bush(188+island*37,300+island*42,1.1)+
  drag('boat',Math.max(62,Math.min(410,at.x)),Math.min(725,at.y+145),path('M-67 -2 L73 -2 L43 34 L-42 34 Z',C.coral)+path('M-5 -94 L-5 -7 L68 -7 Z',C.paper)+l(-5,-94,-5,15,C.ink,5),'Sail the boat')+
  pill(85,740,310,'Explore another island','island'));
}
function shapes(s){
 const spin=s.phase%8;
 return decorated('#f8f6ec',title('Play with shapes')+
  [0,1,2,3,4].map((i)=>action('spin',25+(i%2)*214,187+Math.floor(i/2)*165,206,138,
  `<g transform="translate(${116+(i%2)*214} ${252+Math.floor(i/2)*165}) rotate(${spin*12+i*19})">${i%3===0?c(0,0,50,colors[i]):i%3===1?r(-49,-50,98,100,colors[i],16):path('M0 -57 L53 35 L-55 35 Z',colors[i])}</g>`, 'Spin shape')).join('')+
  pill(263,687,183,'New forms','form'));
}
function dress(s){
 const skins=['#e5ae77','#b77d54','#8b5b42','#f6cbaa'];
 const head=skins[s.skin%4],shirt=colors[s.shirt%6];
 return decorated('#f5e9e5',title('Make a character')+
  r(87,196,306,486,'#fdf9ec',32)+
  l(240,538,209,645,C.ink,24)+l(240,538,278,645,C.ink,24)+
  r(166,429,149,168,shirt,38)+r(168,433,30,111,shirt,13)+r(284,433,30,111,shirt,13)+
  c(240,340,96,head)+face(240,344,1.8)+
  (s.hair%3===0?path('M148 330 Q130 205 240 219 Q356 205 332 330 Q313 264 285 264 Q216 304 148 330 Z',C.ink):s.hair%3===1?c(238,262,72,C.ink):path('M149 327 Q135 240 205 247 Q300 212 331 310 L303 276 L269 244 L208 280 Z','#785a49'))+
  (s.hat%3?path('M143 264 Q181 220 240 219 Q310 210 336 267 L334 278 H148 Z',s.hat%3===1?C.sun:C.teal):'')+
  pill(24,714,132,'Hair','hair')+pill(172,714,132,'Clothes','shirt')+pill(319,714,136,'Features','skin'));
}
function blocks(s){
 const shapes=s.blocks.slice(0,16).map((obj,i)=>{
  const at=toPortrait(obj),color=colors[obj.c%6];
  return drag(`block:${i}`,Math.max(64,Math.min(417,at.x)),Math.min(725,Math.max(175,at.y+124)),r(-41,-37,82,77,color,13)+face(0,0),'Move building block');
 }).join('');
 return decorated('#e8efec',title('Anything can be a tower')+r(0,687,480,133,'#d6c4a6',0)+
  l(0,685,480,685,'#967960',7)+shapes+pill(45,741,181,'Add block','add')+pill(248,741,188,'Scatter','scatter'));
}
function marble(s){
 const marX=76+(s.marble%70)*4.5;
 return decorated('#fff6e7',title('A rolling experiment')+
  path('M54 210 H425 V265 H125 V319 H410 V382 H73 V446 H401 V507 H112 V584 H425','none',`stroke="${C.ink}" stroke-width="35" stroke-linejoin="round" stroke-linecap="round"`)+
  path('M54 210 H425 V265 H125 V319 H410 V382 H73 V446 H401 V507 H112 V584 H425','none',`stroke="${C.blue}" stroke-width="22" stroke-linejoin="round" stroke-linecap="round"`)+
  s.valves.map((open,i)=>action(`valve:${i}`,28+i*140,618,120,97,c(86+i*140,668,41,open?C.teal:C.coral)+l(86+i*140,644,86+i*140,693,C.paper,9,`transform="rotate(${open?90:0} ${86+i*140} 668)"`),`Turn valve ${i+1}`)).join('')+
  c(Math.min(405,marX),s.marble%2?253:214,19,C.sun)+c(Math.min(405,marX)-6,s.marble%2?248:209,5,C.paper)+
  pill(87,736,306,s.running?'Pause marbles':'Roll marbles','run'));
}
function sequence(s){
 // The four tracks wrap into a phone-friendly 4x8 grid, rather than eight tiny columns.
 const top=180,left=37,cell=103,rowH=68;
 const grid=s.steps.map((row,i)=>row.map((on,j)=>{
  const slot=i*8+j,column=slot%4,trackRow=Math.floor(slot/4),x=left+column*cell,y=top+trackRow*rowH;
  return action(`step:${i}:${j}`,x,y,96,62,
   r(x,y,94,60,on?colors[i]:C.paper,12)+c(x+47,y+30,on?18:9,on?C.paper:'#cdd9d6'),`Toggle beat ${i+1}-${j+1}`);
 }).join('')).join('');
 return decorated('#eff1e7',title('Make a pattern of sound')+grid+
  pill(42,744,191,s.playing?'Pause':'Play','play')+pill(250,744,195,'New beat','pattern'));
}
function radio(s){
 const stations=['Daylight','Clouds','Dancing','Dusk'];
 return decorated('#fae7d9',title('Little music station')+
  r(51,203,380,490,C.coral,44)+r(78,238,320,238,'#f3dba4',32)+
  [0,1,2,3].map(i=>l(109+i*72,292,109+i*72,420,C.ink,6,`opacity="${i===s.station%4?'.9':'.3'}"`)).join('')+
  t(242,503,stations[s.station%4],27,C.paper)+
  c(151,603,48,C.sun)+c(336,603,48,C.teal)+
  circleButton('station',151,603,C.sun,'Tune to another station',t(151,603,'< >',18))+
  circleButton('volume',336,603,C.teal,'Adjust volume',t(336,603,'VOL',17,C.paper))+
  pill(106,738,272,s.playing?'Stop the music':'Start the music','play'));
}
function puzzle(s){
 const tiles=s.tiles.slice(0,6).map((obj,i)=>{
 const at=toPortrait(obj);return drag(`tile:${i}`,Math.min(409,Math.max(63,at.x)),Math.max(417,Math.min(705,at.y+92)),r(-53,-50,106,100,colors[i],19)+c(0,0,19,C.paper),'Move puzzle piece');
 }).join('');
 return decorated('#e8ecdf',title('Find a place for every piece')+
 [0,1,2,3,4,5].map(i=>r(33+(i%3)*141,183+Math.floor(i/3)*113,116,94,C.paper,15,`stroke="#bfcbc7" stroke-width="3" stroke-dasharray="8 7"`)).join('')+
 tiles+pill(145,741,190,'Mix the pieces','shuffle'));
}
function dinos(s){
 const at=toPortrait(s.dino),hatch=s.egg%4;
 return decorated('#e5f0dc',title('A prehistoric afternoon')+
 c(344,210,60,C.sun)+bush(100,464,1.7)+bush(347,470,1.3)+
 drag('dino',Math.min(385,Math.max(96,at.x)),Math.min(656,at.y+105),
  path('M-91 21 Q-107 -61 -32 -72 Q26 -129 77 -48 L91 36 L56 55 L-47 55 Z',C.teal)+
  c(41,-70,58,C.leaf)+c(59,-75,7,C.ink)+c(-19,9,18,C.sun)+r(-53,52,26,38,C.teal,10)+r(44,52,26,38,C.teal,10),'Move dinosaur')+
 action('egg',153,598,180,147,c(243,650,77,hatch?C.paper:C.sun)+
  (hatch?path('M189 637 L215 658 L243 641 L273 662 L296 637','none',`stroke="${C.coral}" stroke-width="9"`):''), 'Hatch an egg')+
 pill(119,751,247,'Change the sky','weather'));
}
function dots(s){
 const coordinates=[[96,370],[174,218],[308,232],[395,397],[321,599],[144,630]];
 const visible=coordinates.map(([x,y],i)=>action(`dot:${i}`,x-33,y-33,66,66,c(x,y,22,i<s.connected?C.teal:C.sun)+t(x,y,String(i+1),20),`Connect point ${i+1}`)).join('');
 const joined=coordinates.slice(0,s.connected).map(([x,y],i)=>i?l(coordinates[i-1][0],coordinates[i-1][1],x,y,C.coral,9):'').join('');
 return decorated('#faf7ec',title('Follow a new line')+joined+visible+
 pill(79,739,321,'Another picture','pattern'));
}
function shops(s){
 const things=['BREAD','FLOWER','FRUIT','TOY'];
 return decorated('#f3e7d9',title(['At the bakery','At the florist','At the market','At the toy shop'][s.shop%4])+
  shopIcon(['BAKERY','FLORIST','MARKET','TOYS'][s.shop%4],240,339)+
  things.map((word,i)=>action(`buy:${i}`,33+i*106,538,97,95,r(33+i*106,538,94,92,colors[i],20)+t(80+i*106,584,word,13,C.paper),`Add ${word.toLowerCase()} to basket`)).join('')+
  r(71,657,338,67,C.paper,20)+t(237,691,`${s.basket.length} little finds`,24)+
  pill(91,741,298,'Next shop','shop'));
}
function geometry(s){
 return decorated('#e9eff0',title('Build, move and arrange')+
  Array.from({length:6},(_,i)=>Array.from({length:7},(_,j)=>c(42+j*66,175+i*85,3,'#bacbcb')).join('')).join('')+
  s.pieces.map((obj,i)=>{const at=toPortrait(obj);return drag(`piece:${i}`,Math.max(63,Math.min(410,at.x)),Math.min(697,at.y+104),i%3===0?c(0,0,47,colors[i]):i%3===1?r(-48,-48,96,96,colors[i],12):path('M0 -56 L56 48 L-55 48 Z',colors[i]),'Move geometric shape');}).join('')+
  pill(84,738,313,'Mix new shapes','randomize'));
}
function space(s){
 const at=toPortrait(s.rocket);
 return decorated('#27394d',title('Over the moon',C.paper)+stars(25,s.stars)+
  c(336,290,104,colors[s.planet%6])+c(307,249,21,'rgba(255,255,255,.3)')+
  drag('rocket',Math.max(72,Math.min(408,at.x)),Math.min(702,at.y+135),path('M0 -90 Q65 -46 54 52 L-53 52 Q-66 -48 0 -90 Z',C.paper)+c(0,-20,28,C.blue)+path('M-54 35 L-92 78 L-34 64 Z',C.coral)+path('M55 35 L90 77 L34 64 Z',C.coral),'Move rocket')+
  pill(81,740,321,'Explore new planet','planet',C.paper));
}
function numbers(s){
 const total=Math.min(12,s.number);
 return decorated('#faf1de',title('A garden of numbers')+t(240,322,String(total),160,C.ink)+
  Array.from({length:total},(_,i)=>flower(75+(i%4)*110,458+Math.floor(i/4)*76,colors[(i+s.kind)%6],.42)).join('')+
  pill(44,735,178,'Less','minus')+pill(262,735,178,'More','plus'));
}
function phonics(s){
 const words=['MOON','FISH','SUN','TREE','BIRD','BOAT','STAR'];const word=words[s.word%words.length];
 return decorated('#f9f1e5',title('Little sounds')+
  c(240,340,124,C.sun)+face(240,340,1.7)+
  word.split('').map((ch,i)=>action(`letter:${i}`,28+i*(418/word.length),555,405/word.length,105,
  r(28+i*(418/word.length),555,405/word.length-5,103,i===s.letter?C.teal:C.paper,18)+t(26+i*(418/word.length)+(405/word.length)/2,605,ch,35,i===s.letter?C.paper:C.ink),`Hear letter ${ch}`)).join('')+
  pill(98,728,284,'Another word','word'));
}
function pawn(s){
 const skin=['#edbe88','#d5a075','#ab7959','#85594c'][s.face%4];
 return decorated('#e9efe4',title('A new little friend')+
  r(86,174,306,527,'#fffbf2',28)+r(148,460,183,211,colors[s.body%6],60)+
  c(239,362,113,skin)+face(240,360,2)+
  (s.head%3?path('M145 324 Q162 231 240 236 Q322 232 335 324',C.ink):'')+
  pill(23,739,138,'Face','face')+pill(170,739,138,'Clothes','body')+pill(318,739,138,'Eyes','eyes'));
}
function cooking(s){
 const meal=s.ingredients.slice(-12).map((id,i)=>{
  const angle=i*2.399,radius=28+(i%3)*25,x=238+Math.cos(angle)*radius,y=458+Math.sin(angle)*radius;
  return c(x,y,22,colors[(id+i)%6])+c(x-6,y-7,5,'rgba(255,255,255,.52)');
 }).join('');
 const ingredients=['Peas','Carrot','Tomato','Spice'];
 return decorated('#f7e6d5',title('Make a little something')+
  r(25,174,430,154,'#de8f6f',21)+[0,1,2].map(i=>r(51+i*131,198,110,107,'#f8d4ac',11)).join('')+
  r(48,358,384,292,'#b5c8c3',24)+
  c(239,475,152,C.ink)+c(239,475,128,'#819d9c')+c(239,475,106,s.heat?'#f6bb67':'#f9dfb6')+meal+
  action('stir',331,345,105,184,l(397,353,366,511,'#6e5b4e',13)+c(360,526,25,C.ink),'Stir the pot')+
  ingredients.map((name,i)=>action(`ingredient:${i}`,23+i*111,666,103,112,
  r(23+i*111,666,102,105,C.paper,17)+c(74+i*111,707,26,colors[i])+t(74+i*111,748,name,14),`Add ${name.toLowerCase()}`)).join(''));
}
function factory(s){
 const dirs=['UP','RIGHT','DOWN','LEFT'];
 const tiles=s.commands.slice(0,6).map((d,i)=>action(`command:${i}`,37+(i%3)*140,268+Math.floor(i/3)*135,125,110,
  r(37+(i%3)*140,268+Math.floor(i/3)*135,124,107,colors[d%6],18)+t(99+(i%3)*140,319+Math.floor(i/3)*135,['^','>','v','<'][d%4],44,C.paper),`Change direction ${i+1}`)).join('');
 const robotX=85+(s.robot%6)*61;
 return decorated('#e6eee9',title('A little robot journey')+
  r(53,189,374,72,'#becbc9',24)+l(77,223,411,223,'#fdf9e7',6,'stroke-dasharray="14 14"')+
  tiles+path(`M64 626 H415`,'none',`stroke="${C.ink}" stroke-width="7" stroke-dasharray="13 13"`)+
  r(robotX-39,576,78,84,C.coral,17)+c(robotX-15,603,7,C.paper)+c(robotX+15,603,7,C.paper)+
  pill(101,738,283,s.playing?'Pause the robot':'Run the robot','run'));
}

export function renderPortraitToy(id,s){
 const cases={drawing, 'busy-board':board,'musical-blobs':blobs,'busy-book':book,town,house,forest,islands,shapes,'dress-up':dress,'silly-blocks':blocks,'marble-machine':marble,sequencer:sequence,radio,'world-puzzle':puzzle,dinosaurs:dinos,'connect-the-dots':dots,shops,geometry,space,'number-journey':numbers,phonics,'pawn-maker':pawn,cooking,'code-factory':factory};
 const renderer=cases[id];
 if(!renderer)throw new Error('No portrait scene for '+id);
 return {art:renderer(s),viewBox:'0 0 480 840'};
}
