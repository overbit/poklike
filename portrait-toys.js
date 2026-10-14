// Original portrait compositions for small screens. Coordinates are in a 480x840
// toy world; draggable state and drawing strokes still use the 960x600 model.
import {C,colors} from './toys.js';

export const PORTRAIT={width:480,height:840};
export const toPortrait=({x,y})=>({x:x/2,y:y*1.4});
export const toModel=({x,y})=>({x:x*2,y:y/1.4});
// Local stage offsets make the initial wide-model objects visible in phone scenes.
// Reverse these offsets before persisting a drag, or pieces jump on release.
export const PORTRAIT_DRAG_LIFT=Object.freeze({
 house:85,islands:145,'silly-blocks':124,'world-puzzle':92,dinosaurs:105,geometry:104,space:135
});
export const portraitDragToModel=(id,point)=>toModel({x:point.x,y:point.y-(PORTRAIT_DRAG_LIFT[id]||0)});

const n=v=>Math.round(v*10)/10;
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const r=(x,y,w,h,fill,rad=14,extras='')=>`<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${rad}" fill="${fill}" ${extras}/>`;
const c=(x,y,rad,fill,extras='')=>`<circle cx="${n(x)}" cy="${n(y)}" r="${n(rad)}" fill="${fill}" ${extras}/>`;
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
 r(0,724,480,116,'#f5eee0',0)+palette+action('undo',340,116,112,57,r(340,116,112,57,'#f4e4ce',18)+t(396,145,'Undo',20),'Undo last mark')+action('size',32,116,112,57,r(32,116,112,57,'#e8eceb',18)+t(82,145,'Brush',20)+c(127,145,s.width*.35,C.ink),'Change brush size'));
}
function board(s){
 const ready=s.switches[0]&&s.switches[1];
 const screw=(x,y)=>c(x,y,5,'#9a8875')+l(x-3,y-3,x+3,y+3,'#eee3d2',2);
 const switches=s.switches.map((on,i)=>{
  const x=i%2===0?103:377,y=256+Math.floor(i/2)*118;
  return action(`switch:${i}`,x-60,y-47,120,100,
    r(x-58,y-44,116,88,'#fdf5e7',23,`stroke="#c4b7a3" stroke-width="3"`)+
    r(x-13,y-32,26,63,'#acb6b4',13)+
    c(x,y+(on?-21:21),27,on?C.teal:C.coral)+c(x-8,y+(on?-30:11),8,'rgba(255,255,255,.55)')+
    screw(x-45,y-30)+screw(x+45,y+30),`Flip switch ${i+1}`);
 }).join('');
 const gear=(x,y,i)=>{
  const angle=s.dials[i]*47,shade=i===0?C.blue:C.coral;
  const teeth=Array.from({length:10},(_,n)=>r(x-12,y-57,24,22,shade,5,`transform="rotate(${n*36} ${x} ${y})"`)).join('');
  const spokes=Array.from({length:5},(_,n)=>l(x,y,x,y-36,C.paper,8,`transform="rotate(${n*72} ${x} ${y})"`)).join('');
  return action(`gear:${i}`,x-64,y-63,128,126,
   r(x-64,y-61,128,122,'#fdf5e7',30)+
   `<g transform="rotate(${angle} ${x} ${y})">${teeth}${c(x,y,50,shade)}${spokes}</g>`+
   c(x,y,15,C.ink)+c(x-4,y-5,5,C.paper),
   `Turn connected gear ${i+1}`);
 };
 const sliders=s.sliders.map((value,i)=>{
  const y=595+i*78,x=64+350*value;
  return `<g data-slider="${i}" data-act="slide:${i}" role="slider" tabindex="0" aria-label="Slide track ${i+1}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(value*100)}" class="toy-hit">`+
    r(38,y-29,404,58,'#f8f2e9',22)+
    r(64,y-7,350,14,'#c1c5c0',7)+
    r(64,y-7,350*value,14,i?C.coral:C.blue,7,'data-slider-fill="true"')+
    c(x,y,29,C.ink,'data-slider-knob="true"')+c(x,y,22,i?C.sun:C.teal,'data-slider-knob="true"')+
    c(x-7,y-7,6,C.paper)+r(42,y-35,396,70,'transparent',12)+'</g>';
 }).join('');
 const powered=ready&&s.sliders[0]>.5,indicator=powered?C.sun:'#abb7b2';
 return decorated('#e4efe9',
  r(22,156,436,661,'#edd6b6',34,`stroke="#d2b18b" stroke-width="4"`)+
  title('Touch every little mechanism')+
  [36,444].flatMap(x=>[170,806].map(y=>screw(x,y))).join('')+
  l(240,173,240,229,'#bca48b',6)+
  c(240,212,33,'#fbf0d4')+c(240,212,23,indicator)+
  (powered?Array.from({length:8},(_,i)=>l(240+Math.cos(i*Math.PI/4)*36,212+Math.sin(i*Math.PI/4)*36,240+Math.cos(i*Math.PI/4)*47,212+Math.sin(i*Math.PI/4)*47,C.sun,5)).join(''):'')+
  switches+
  path('M160 456 H316','none','stroke="#b7a58e" stroke-width="9" stroke-dasharray="12 10"')+
  gear(171,487,0)+gear(309,487,1)+
  sliders+
  r(160,746,160,47,'#e9c49b',24)+t(240,769,powered?'LIGHT IS ON':'KEEP TRYING',16,C.ink));
}
function blobs(s){
 const pts=s.blobs.map(toPortrait),palette=[C.blue,C.coral,C.sun,C.teal];
 const harmony=(s.collisions||0)>0;
 const shape=(i,color)=>{
  if(i===0)return c(0,0,58,color)+c(-21,-25,14,'rgba(255,255,255,.4)');
  if(i===1)return path('M-52 -19 Q-60 -68 -9 -69 Q38 -84 51 -32 Q86 19 33 58 Q-11 77 -48 41 Q-76 11 -52 -19 Z',color)+
      c(-25,-25,12,'rgba(255,255,255,.37)');
  if(i===2)return r(-54,-52,108,108,color,37)+r(-35,-40,26,22,'rgba(255,255,255,.3)',11);
  return path('M3 -71 Q63 -30 63 18 Q61 66 6 69 Q-54 66 -59 22 Q-63 -26 3 -71 Z',color)+
   c(-23,-9,15,'rgba(255,255,255,.32)');
 };
 const floaters=pts.map((p,i)=>{
  const color=palette[(i+s.mode)%4],radius=73+((s.turn+i)%3)*3;
  return c(p.x,p.y,radius,'none',`stroke="${color}" stroke-width="2.6" opacity="${harmony?'.22':'.11'}"`)+
   (harmony?c(p.x,p.y,radius+13,'none',`stroke="${color}" stroke-width="2.5" stroke-dasharray="8 13" opacity=".21"`):'');
 }).join('');
 const pieces=pts.map((p,i)=>{
  const color=palette[(i+s.mode)%4];
  return drag(`blob:${i}`,p.x,p.y,
   c(0,0,77,'transparent')+
   `<g>${shape(i,color)}</g>`+
   [0,1].map(j=>c(-12+j*22,3,3,C.ink)).join('')+
   path('M-11 21 Q1 30 13 21','none',`stroke="${C.ink}" stroke-width="2.5" stroke-linecap="round"`),
   `Move sound shape ${i+1} to combine notes`);
 }).join('');
 const ribbons=harmony?Array.from({length:3},(_,i)=>{
  const y=661+i*20;return path(`M65 ${y} Q148 ${y-33} 240 ${y} T413 ${y}`,'none',`stroke="${palette[(s.collisions+i)%4]}" stroke-width="${i===0?5:3}" opacity=".4"`);
 }).join(''):'';
 return decorated('#f7f7f0',
  title('Move the sounds together')+
  [0,1,2,3,4].map(i=>l(36,206+i*96,444,206+i*96,'#e5e9df',2,'stroke-dasharray="2 19"')).join('')+
  floaters+pieces+ribbons+
  pill(99,747,284,'Change the melody','tone','#ecefe9')+
  (harmony?t(240,709,'That sounds lovely together',18,C.muted):t(240,709,'Try letting two shapes meet',18,C.muted)));
}
function book(s){
 const page=((s.page%5)+5)%5;
 const names=['The garden','Under the sea','Our neighborhood','After sunset','In the kitchen'];
 const bg=['#e4efdf','#dceef3','#f7e8d7','#2e4059','#f2e2d1'][page],dark=page===3;
 const touched=i=>s.touched?.includes(`${page}:${i}`);
 const discover=(i,x,y,w,h,illustration,label)=>action(`book:${i}`,x,y,w,h,illustration,`Explore ${label}`);
 let art='';
 if(page===0){
  art=r(29,190,422,485,'#d2e5cc',32)+
   path('M31 538 Q140 460 260 525 T449 517 V676 H31 Z','#a6cfa4')+
   [0,1,2].map(i=>{
    const x=99+i*139,y=425+(i%2)*49,on=touched(i);
    const flowerArt=flower(x,y,on?C.sun:colors[i],on?1.5:1.1);
    return discover(i,x-67,y-93,135,160,flowerArt+(on?Array.from({length:4},(_,j)=>c(x+Math.cos(j*1.57)*74,y+Math.sin(j*1.57)*68,8,C.sun)).join(''):''),
      `flower ${i+1}`);
   }).join('');
 }
 if(page===1){
  art=r(29,187,422,488,'#98d5df',32)+
   path('M30 332 Q110 299 190 337 T360 329 T449 329','none','stroke="rgba(255,255,255,.7)" stroke-width="9"')+
   [0,1,2].map(i=>{
    const x=106+i*130,y=416+(i%2)*93,on=touched(i),col=[C.coral,C.sun,C.teal][i];
    return discover(i,x-63,y-57,126,116,
       `<g transform="translate(${x} ${y}) rotate(${on?12:0})">`+
       path('M-49 -5 Q-17 -47 41 -20 Q71 -12 38 24 Q-14 47 -49 -5 Z',col)+
       path('M-38 -4 L-69 -36 L-64 36 Z',col)+
       c(24,-10,6,C.ink)+(on?c(-21,11,8,C.paper):'')+'</g>'+
       (on?Array.from({length:4},(_,j)=>c(x+64+j*12,y-44-j*15,6,C.paper)).join(''):''),
       `fish ${i+1}`);
   }).join('');
 }
 if(page===2){
  art=r(27,194,426,479,'#b4d5d5',31)+
   path('M27 575 Q130 533 242 570 T453 548 V674 H27 Z','#b9d3a1')+
   [0,1,2].map(i=>{
    const x=75+i*137,y=326,on=touched(i),col=[C.coral,C.blue,C.teal][i];
    const building=r(x-23,y-4,110,184,col,14)+
      path(`M${x-35} ${y+4} L${x+32} ${y-63} L${x+102} ${y+4} Z`,C.sun)+
      r(x+9,y+35,46,50,on?C.sun:C.paper,9)+r(x+28,y+106,38,74,'#f8ecd5',9)+
      c(x+56,y+146,4,C.ink);
    return discover(i,x-34,y-63,149,254,building,`${['market','school','library'][i]}`)+
      (on?miniPerson(x+40,608,col):'');
   }).join('');
 }
 if(page===3){
  art=r(29,188,422,489,'#304967',29)+stars(24,s.page+1)+
   [0,1,2].map(i=>{
    const x=104+i*133,y=310+i%2*100,on=touched(i);
    return discover(i,x-61,y-58,122,126,
      c(x,y,on?50:36,on?C.sun:[C.blue,C.coral,C.teal][i])+
      c(x-10,y-14,on?16:10,'rgba(255,255,255,.45)')+
      (on?Array.from({length:7},(_,j)=>l(x+Math.cos(j*6.28/7)*55,y+Math.sin(j*6.28/7)*55,x+Math.cos(j*6.28/7)*69,y+Math.sin(j*6.28/7)*69,C.sun,4)).join(''):''),
      `night-sky light ${i+1}`);
   }).join('');
 }
 if(page===4){
  art=r(29,186,422,490,'#e7c5a6',31)+r(43,520,393,135,'#b98664',18)+
   [0,1,2].map(i=>{
    const x=111+i*132,y=400,on=touched(i),col=[C.coral,C.leaf,C.sun][i];
    return discover(i,x-60,y-90,122,180,
      c(x,y,59,C.paper)+c(x,y,43,on?C.sun:'#f2e6ca')+
      (on?Array.from({length:5},(_,j)=>c(x-25+j*12,y-15+j%2*24,10,col)).join(''):c(x,y,20,col))+
      (on?path(`M${x-21} ${y-66} Q${x-40} ${y-99} ${x-16} ${y-117}`,'none','stroke="rgba(255,255,255,.7)" stroke-width="7"'):''),
      `dish ${i+1}`);
   }).join('');
 }
 const nav=action('prev',39,729,91,88,c(86,773,38,C.paper)+t(86,773,'‹',52),'Turn to previous page')+
  action('next',350,729,91,88,c(394,773,38,C.paper)+t(394,773,'›',52),'Turn to next page');
 const dots=[0,1,2,3,4].map(i=>c(180+i*30,767,i===page?9:6,i===page?C.sun:C.sand)).join('');
 return decorated(bg,
  r(18,173,444,523,dark?'#3e5770':'rgba(255,255,255,.47)',34)+
  title(names[page],dark?C.paper:C.ink)+art+
  t(240,708,'Tap the picture · swipe to turn',17,dark?C.paper:C.muted)+
  nav+dots);
}
function town(s){
 const places=[
  {name:'School',color:C.blue,icon:'school'},
  {name:'Farm',color:C.leaf,icon:'farm'},
  {name:'Library',color:C.coral,icon:'library'},
  {name:'Market',color:C.teal,icon:'market'}
 ];
 const selected=((s.mode%4)+4)%4;
 const placeArt=places.map((item,i)=>{
  const x=34+(i%2)*224,y=211+Math.floor(i/2)*187;
  const active=i===selected;
  const roof=path(`M${x-7} ${y+38} L${x+90} ${y-10} L${x+191} ${y+38} Z`,item.color);
  const facade=r(x+7,y+36,169,129,active?'#fff8e5':'#fdf9ec',15,`stroke="${active?C.sun:'#d4d7ce'}" stroke-width="${active?6:2}"`);
  let details='';
  if(i===0){
   details=[0,1].map(j=>r(x+30+j*82,y+59,57,47,'#b9e1ee',8)+l(x+59+j*82,y+58,x+59+j*82,y+108,C.paper,5)).join('')+
    t(x+91,y+128,active?'A B C':'1 2 3',22,C.ink);
  }
  if(i===1){
   details=[0,1,2].map(j=>flower(x+42+j*52,y+125,active?C.sun:colors[j],.34)).join('')+
    r(x+111,y+52,48,55,'#d7a67b',7);
  }
  if(i===2){
   details=[0,1,2,3].map(j=>r(x+28+j*35,y+69,27,72,colors[(j+(active?1:0))%6],5)+
     l(x+34+j*35,y+94,x+48+j*35,y+94,C.paper,3)).join('');
  }
  if(i===3){
   details=r(x+27,y+62,122,76,'#c9e5d9',8)+
    [0,1,2].map(j=>c(x+52+j*35,y+104,15,colors[(j+selected)%6])).join('');
  }
  return action(`building:${i}`,x-9,y-14,206,195,roof+facade+details+
   r(x+18,y+151,149,30,item.color,15)+t(x+91,y+167,item.name,16,C.paper)+
   (active?Array.from({length:3},(_,j)=>c(x+32+j*59,y+21,6,C.sun)).join(''):''),
   `Visit ${item.name.toLowerCase()}`);
 }).join('');
 const vehicle=toPortrait(s.vehicle);
 const carX=Math.max(90,Math.min(384,vehicle.x));
 const carY=Math.max(635,Math.min(716,vehicle.y));
 const visitors=s.people.slice(0,6).map((p,i)=>{
  const at=toPortrait(p),x=Math.max(62,Math.min(421,at.x)),y=Math.max(194,Math.min(700,at.y));
  return drag(`person:${i}`,x,y,`<g transform="scale(1.18)">${miniPerson(0,0,colors[(i+2)%6])}</g>${c(0,0,56,'transparent')}`,`Move neighbor ${i+1} to a place`);
 }).join('');
 const car=drag('vehicle',carX,carY,
  r(-74,-29,148,51,C.coral,18)+
  path('M-48 -28 L-28 -61 H37 L61 -27 Z','#ea826c')+
  r(-24,-53,57,28,'#b6e4e3',8)+
  c(-44,24,23,C.ink)+c(47,24,23,C.ink)+
  c(-44,24,11,C.paper)+c(47,24,11,C.paper)+
  r(-83,-60,166,107,'transparent',12),
  'Drive the town car');
 return decorated('#deefe5',
   title('Explore the little neighborhood')+
   path('M0 576 Q130 543 253 578 T480 569 V840 H0Z','#b0d5a7')+
   r(0,624,480,137,'#a7aaa6',0)+
   l(0,697,480,697,'#fbf4dd',6,'stroke-dasharray="18 22"')+
   placeArt+
   visitors+car+
   r(38,740,283,72,C.paper,25)+
   t(179,770,`Visiting ${places[selected].name}`,19)+
   pill(329,745,133,'New friend','visitor','#f0d4ab'));
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
  `<g transform="translate(${116+(i%2)*214} ${252+Math.floor(i/2)*165}) rotate(${spin*12+i*19})">${(i+s.form)%3===0?c(0,0,50,colors[(i+s.form)%6]):(i+s.form)%3===1?r(-49,-50,98,100,colors[(i+s.form)%6],16):path('M0 -57 L53 35 L-55 35 Z',colors[(i+s.form)%6])}</g>`, 'Spin shape')).join('')+
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
 const motif=i=>{
  if(i===0)return c(0,0,22,C.sun)+Array.from({length:8},(_,j)=>l(Math.cos(j*Math.PI/4)*30,Math.sin(j*Math.PI/4)*30,Math.cos(j*Math.PI/4)*41,Math.sin(j*Math.PI/4)*41,C.paper,5)).join('');
  if(i===1)return r(-7,-5,15,38,'#8b6d55',5)+c(0,-22,31,C.leaf)+c(-16,-12,17,C.teal);
  if(i===2)return flower(0,-6,C.coral,.65);
  if(i===3)return path('M-41 3 L41 3 L26 30 L-22 30 Z',C.coral)+path('M-3 -45 V3 H34 Z',C.paper)+l(-3,-44,-3,30,C.ink,3);
  if(i===4)return path('M-42 35 L-4 -36 L38 35 Z',C.paper)+path('M-19 -5 L-3 -36 L15 -6 Z','#c1dfe1');
  return c(0,1,28,C.blue)+path('M24 0 L47 -25 L47 26 Z',C.teal)+c(-10,-8,4,C.ink);
 };
 const slots=[0,1,2,3,4,5].map(i=>{
  const row=Math.floor(i/3),col=i%3,tx=70+col*116.5,ty=262+row*227;
  return r(tx,ty,105,91,'#faf7ec',16,`stroke="#a9bcbc" stroke-width="3" stroke-dasharray="8 8"`)+
   `<g opacity=".23" transform="translate(${tx+52} ${ty+45}) scale(.75)">${motif(i)}</g>`;
 }).join('');
 const tiles=s.tiles.slice(0,6).map((obj,i)=>{
  const at=toPortrait(obj),tx=244+(i%3)*233,ty=151+Math.floor(i/3)*162;
  const placed=Math.abs(obj.x-tx)<6&&Math.abs(obj.y-ty)<6;
  const x=Math.max(60,Math.min(420,at.x)),y=Math.max(215,Math.min(776,at.y+92));
  return drag(`tile:${i}`,x,y,
   r(-51,-44,102,90,colors[i],17,`stroke="${placed?C.ink:'rgba(255,255,255,.6)'}" stroke-width="${placed?5:2}"`)+
   motif(i)+
   (placed?c(37,-31,9,C.sun):'')+
   r(-55,-48,110,98,'transparent',15),
   `Move illustrated picture piece ${i+1} to matching spot`);
 }).join('');
 const finished=s.tiles.slice(0,6).every((obj,i)=>Math.abs(obj.x-(244+(i%3)*233))<6&&Math.abs(obj.y-(151+Math.floor(i/3)*162))<6);
 return decorated('#eaf0e6',
  title('Make your own little picture')+
  pill(144,172,193,'Mix the pieces','shuffle','#f9f5e9')+
  r(33,243,414,365,'#d7e5dc',28)+slots+
  (finished?t(240,625,'All the pieces found a home!',19,C.teal):'')+
  tiles);
}
function dinos(s){
 const at=toPortrait(s.dino),hatch=s.egg%4;
 return decorated(s.weather?'#cadce7':'#e5f0dc',title(s.weather?'A rainy afternoon':'A prehistoric afternoon')+
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
export function geometryPiece(obj,i,selected){
 const col=colors[(obj.c??i)%6];
 return (selected?c(0,0,62,'none',`stroke="${C.ink}" stroke-width="3" stroke-dasharray="5 7"`):'')+
 `<g transform="rotate(${obj.r||0})">${i%3===0?r(-43,-43,86,86,col,12):i%3===1?path('M0 -52 L51 40 L-51 40 Z',col):path('M-46 -43 H0 V0 H46 V43 H-46 Z',col)}${c(-21,-22,7,'rgba(255,255,255,.45)')}</g>`;
}
function geometry(s){
 return decorated('#e9eff0',title('Build, move and arrange')+
 Array.from({length:5},(_,i)=>Array.from({length:7},(_,j)=>c(42+j*66,190+i*88,3,'#bacbcb')).join('')).join('')+
 s.pieces.map((obj,i)=>{const at=toPortrait(obj);return drag(`piece:${i}`,Math.max(63,Math.min(410,at.x)),Math.min(590,at.y+104),geometryPiece(obj,i,s.selected===i),`Select and move shape ${i+1}`);}).join('')+
 t(240,647,s.pieces.length?'Move a shape to choose it':'Add a shape to begin',17,C.muted)+
 pill(22,675,137,'Add','add')+pill(171,675,137,'Turn','rotate')+pill(320,675,137,'Color','paint')+
 pill(22,752,137,'Arrange','preset')+pill(171,752,137,'Mix','randomize')+pill(320,752,137,'Discard','discard'));
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
 // Match the observed sound-slot pattern with movable grapheme units.
 const words=[['M','OO','N'],['F','I','SH'],['S','U','N'],['T','R','EE'],['B','IR','D']];
 const symbols=['MOON','FISH','SUN','TREE','BIRD'];
 const word=words[s.word%words.length],finished=s.placed.every(Boolean);
 const pieces=word.map((ch,i)=>{
  const x=114+i*126,y=s.placed[i]?566:261;
  return drag(`phoneme:${i}`,x,y,r(-46,-43,92,87,s.placed[i]?C.teal:C.paper,17)+t(0,0,ch,32,s.placed[i]?C.paper:C.ink),`Move ${ch} sound into its matching box`);
 }).join('');
 return decorated('#f9f1e5',title('Find the sounds')+
  c(240,407,115,C.sun)+face(240,410,1.7)+t(240,505,symbols[s.word%words.length],25)+
  [0,1,2].map(i=>r(64+i*121,522,108,99,s.placed[i]?'#c8e5d9':'#fcf9f0',16,`stroke="${s.placed[i]?C.teal:'#cccbc2'}" stroke-width="3"`)).join('')+
  pieces+
  (finished?t(240,690,'You found the sounds!',22,C.teal):t(240,680,'Drag the sounds to their boxes',18,C.muted))+
  pill(90,735,300,'Another word','word'));
}
export function pawnArt(s){
 const skin=['#edbe88','#d5a075','#ab7959','#85594c'][s.face%4],col=colors[s.outfit%6];
 const body=[r(-82,75,164,180,col,50),path('M-65 75 H65 L106 252 H-106 Z',col),r(-95,75,190,155,col,23)+r(-83,217,61,57,col,15)+r(22,217,61,57,col,15)][s.body%3];
 const eyes=[c(-30,-8,7,C.ink)+c(30,-8,7,C.ink),path('M-44 -7 Q-30 -26 -16 -7 M16 -7 Q30 -26 44 -7','none',`stroke="${C.ink}" stroke-width="6" stroke-linecap="round"`),c(-31,-8,17,C.paper)+c(31,-8,17,C.paper)+c(-27,-7,7,C.ink)+c(35,-7,7,C.ink)][s.eyes%3];
 const hat=s.head%3===1?r(-112,-87,224,20,C.sun,9)+r(-71,-150,142,70,C.sun,22):s.head%3===2?path('M-104 -83 Q-60 -168 27 -133 Q93 -120 98 -83 Z',C.teal)+r(-103,-90,230,19,C.teal,8):'';
 return body+r(-115,87,32,108,skin,16)+r(83,87,32,108,skin,16)+c(0,0,103,skin)+eyes+path('M-28 37 Q0 62 28 37','none',`stroke="${C.ink}" stroke-width="5" stroke-linecap="round"`)+hat;
}
function pawn(s){
 return decorated('#e9efe4',title('A new little friend')+r(57,170,366,459,'#fffbf2',30)+
 `<g transform="translate(240 347) scale(.88)">${pawnArt(s)}</g>`+
 pill(22,652,137,'Skin','face')+pill(171,652,137,'Body','body')+pill(320,652,137,'Eyes','eyes')+
 pill(78,736,151,'Hat','head')+pill(250,736,151,'Color','outfit'));
}
const ingredientArt=(id,x,y,size=1)=>{
 const art=[
  c(0,0,18,C.leaf)+c(-17,9,13,C.teal)+c(16,12,13,C.teal),
  path('M-13 -27 Q29 -16 12 33 Q-8 60 -22 18 Z','#ea8d5c')+path('M-9 -25 Q-8 -51 9 -47 Q23 -42 8 -25 Z',C.leaf),
  c(0,5,28,C.coral)+path('M-14 -17 L0 -36 L14 -17 L0 -23 Z',C.leaf),
  r(-20,-27,40,58,C.sun,9)+r(-12,-40,24,16,C.paper,5)+c(0,7,4,C.ink)
 ][id%4];
 return `<g transform="translate(${x} ${y}) scale(${size})">${art}</g>`;
};
function cooking(s){
 const needs=[0,1,2,3];
 const meal=s.ingredients.slice(-11).map((id,i)=>{
  const angle=i*2.4,rad=24+(i%3)*21;
  return ingredientArt(id,251+Math.cos(angle)*rad,465+Math.sin(angle)*rad,.44);
 }).join('');
 if(s.mode%2===0){
  // Guests and their food requests are the first activity, as in Pok Pok's
  // documented Cooking entry flow. All illustrations and rules are original.
  const selected=s.guest%3,skin=['#eac08d','#ad795a','#805742'];
  const guests=[0,1,2].map(i=>{
   const x=93+i*148,y=361+((i%2)*32),active=selected===i;
   const hair=i===0?path(`M${x-53} ${y-22} Q${x-59} ${y-97} ${x} ${y-81} Q${x+59} ${y-93} ${x+53} ${y-24} Q${x+10} ${y-75} ${x-53} ${y-22} Z`,'#634f49'):
     i===1?[c(x-30,y-55,24,'#503d37'),c(x,y-67,28,'#503d37'),c(x+29,y-52,22,'#503d37')].join(''):
     path(`M${x-55} ${y-21} Q${x-63} ${y-113} ${x+3} ${y-88} Q${x+64} ${y-93} ${x+57} ${y-17} L${x+45} ${y+60} L${x+36} ${y-48} Q${x} ${y-73} ${x-35} ${y-39} Z`,'#493b3b');
   return action(`guest:${i}`,x-57,y-96,114,176,
    r(x-41,y+25,82,96,[C.teal,C.blue,C.coral][i],31)+
    r(x-15,y+49,30,9,colors[(i+2)%6],5)+
    c(x,y-10,53,skin[i])+hair+c(x-18,y-10,4,C.ink)+c(x+18,y-10,4,C.ink)+
    path(`M${x-15} ${y+11} Q${x} ${y+26} ${x+15} ${y+11}`,'none',`stroke="${C.ink}" stroke-width="3.5" stroke-linecap="round"`)+
    (active?c(x,y-10,58,'none',`stroke="${C.sun}" stroke-width="5"`):''),`Choose dinner guest ${i+1}`);
  }).join('');
  return decorated('#f9e9d8',
   r(36,144,408,167,'#e6b8a2',23)+r(61,166,152,116,'#b1d9cf',14)+
   path('M136 168 V281 M61 224 H213','none',`stroke="${C.paper}" stroke-width="8"`)+
   [0,1,2].map(i=>r(254+i*55,186,40,77,['#f5d77b','#9ec9b6','#f9c2a5'][i],12)).join('')+
   title('Who is hungry?')+guests+
   `<ellipse cx="240" cy="650" rx="231" ry="139" fill="#b27d5e"/>`+
   `<ellipse cx="240" cy="632" rx="216" ry="125" fill="#e7b990"/>`+
   c(240,621,100,C.paper)+c(240,621,73,'#f4e6c8')+
   s.ingredients.slice(-6).map((id,i)=>ingredientArt(id,207+i*23,605+i%2*29,.48)).join('')+
   (s.rejected?t(240,727,'Perhaps cook something first?',20,'#8e4739'):s.served?t(240,727,'A happy guest had a meal!',20,C.teal):'')+
   action('guest:'+selected,277,198,136,100,r(277,198,136,98,C.paper,32)+ingredientArt(needs[s.craving%4],349,247,.7),'See what this guest would like')+
   pill(24,754,202,'Kitchen','scene',C.paper)+pill(244,754,212,'Serve plate','serve',C.sun));
 }
  return decorated('#f7e6d5',title('Experiment in the kitchen')+
   [0,1,2].map(i=>action(`appliance:${i}`,20+i*154,161,137,65,r(20+i*154,161,137,65,s.appliance===i?C.teal:C.paper,18)+t(88+i*154,194,['Pot','Blender','Oven'][i],19,C.ink),`Choose ${['pot','blender','oven'][i]}`)).join('')+
   [0,1,2].map(i=>action(`cupboard:${i}`,30+i*149,242,124,57,r(30+i*149,242,124,57,s.cupboards[i]?'#8e6655':'#eab194',12)+c(130+i*149,271,6,C.ink),`Open kitchen cupboard ${i+1}`)).join('')+
   r(22,315,436,290,'#b5c8c3',25)+
   action('water',36,345,94,105,c(83,391,42,s.water?C.blue:C.paper)+path('M68 370 V346 H98 V367','none',`stroke="${C.ink}" stroke-width="6"`),'Fill or empty water')+
   `<g transform="translate(294 432)">${cookingAppliance(s)}</g>`+
   action('process',172,322,260,209,r(172,322,260,209,'transparent',18),'Stir, blend or bake the ingredients')+
   action('heat',35,538,183,54,r(35,538,183,54,s.heat?C.coral:C.paper,18)+t(126,565,s.heat?'Heat on':'Heat off',19),'Turn heat on or off')+
   action('prepare',233,538,210,54,r(233,538,210,54,s.prepared?C.sun:C.paper,18)+t(338,565,s.prepared?'Chopped':'Chop ingredients',18),'Chop ingredients')+
   t(240,626,cookingStatus(s),18,C.ink)+
   [0,1,2,3].map(i=>action(`ingredient:${i}`,17+i*115,648,105,89,r(17+i*115,648,105,90,C.paper,18)+ingredientArt(i,69+i*115,682,.75)+t(70+i*115,720,['Peas','Carrot','Tomato','Spice'][i],13),`Add ${['peas','carrots','tomato','spice'][i]}`)).join('')+
   pill(22,754,141,'Fresh bowl','fresh')+pill(178,754,280,'Back to the table','scene'));
}
export const cookingStatus=s=>!s.ingredients.length?'Choose something delicious':s.mixed?'A colorful blend!':s.cooked?'Warm and ready to share':s.prepared?'Chopped into little pieces':'Fresh ingredients';
export function cookingAppliance(s){
 const meal=s.ingredients.slice(-12).map((id,i)=>{const a=i*2.4+s.stir*.5,rad=20+(i%3)*20;return ingredientArt(id,Math.cos(a)*rad,Math.sin(a)*rad,s.prepared?.3:.5);}).join('');
 const steam=s.cooked?[0,1,2].map(i=>path(`M${-38+i*38} -83 q-15 -20 0 -39`,'none',`stroke="${C.paper}" stroke-width="6" stroke-linecap="round"`)).join(''):'';
 const swirl=path(`M-42 0 Q0 ${s.stir%2?42:-42} 42 0`,'none',`stroke="${C.paper}" stroke-width="5" opacity=".7"`);
 if(s.appliance===1)return r(-76,-105,152,154,'#e5f3ec',18,`stroke="${C.ink}" stroke-width="5"`)+r(-83,45,166,37,C.teal,12)+(s.mixed?r(-65,-55,130,92,C.coral,12)+swirl:meal)+r(-83,-117,166,22,C.ink,9)+c(0,63,10,C.sun);
 if(s.appliance===2)return r(-111,-95,222,178,C.coral,22)+r(-91,-64,182,119,s.cooked?'#b77049':C.ink,12)+r(-67,-50,134,95,'#ebc89c',12)+meal+l(-68,-76,68,-76,C.paper,7)+steam;
 return c(0,0,106,C.ink)+c(0,0,87,s.cooked?'#e5a25f':'#f9dfb6')+(s.mixed?c(0,0,74,C.coral):meal)+swirl+l(75,-105,42,-13,'#775f50',11,`transform="rotate(${s.stir*12} 0 0)"`)+steam;
}

function factory(s){
 // Continuous factory loop with directable machines and crates, rather than a
 // static programming worksheet. Observable flow; detailed parity is pending.
 const belts=path('M45 243 H429 V519 H61 V243','none',`stroke="${C.ink}" stroke-width="30" stroke-linejoin="round"`)+
  path('M45 243 H429 V519 H61 V243','none',`stroke="#8aaca6" stroke-width="18" stroke-linejoin="round" stroke-dasharray="20 15"`);
 const workerX=88+(s.robot%6)*58;
 const levers=s.commands.slice(0,4).map((v,i)=>action(`director:${i}`,48+(i%2)*201,314+Math.floor(i/2)*104,182,91,
  r(48+(i%2)*201,314+Math.floor(i/2)*104,183,86,v%2?C.coral:C.sun,16)+
  c(92+(i%2)*201,357+Math.floor(i/2)*104,23,C.paper)+
  path(`M${81+(i%2)*201} ${357+Math.floor(i/2)*104} H${119+(i%2)*201}`,'none',`stroke="${C.ink}" stroke-width="7"`),`Change director button ${i+1}`)).join('');
 const goods=Array.from({length:Math.min(5,s.goods)},(_,i)=>r(317+i%2*53,573+Math.floor(i/2)*39,43,36,colors[i],7)).join('');
 return decorated('#e4efeb',title('A busy little factory')+
  belts+levers+
  r(workerX-30,199,60,71,C.blue,15)+c(workerX-12,229,6,C.paper)+c(workerX+14,229,6,C.paper)+
  r(297,548,154,149,'#f3d89a',17)+t(373,559,'MARKET',14)+goods+
  Array.from({length:Math.min(5,s.mess)},(_,i)=>c(58+i*32,584+i%2*36,12,'#817a75')).join('')+
  action('crate',27,540,143,124,r(31,545,140,113,'#d29669',14)+l(64,571,132,639,'#9a694d',8)+l(137,574,63,639,'#9a694d',8), 'Unbox a delivery crate')+
  pill(32,728,201,s.playing?'Pause loop':'Run loop','run')+
  pill(249,728,199,'Clean up','clean'));
}

// Expand the world around the *authored* composition. Changing the SVG aspect
// ratio or stretching circles/text made toys appear misshapen on tall phones.
export function portraitFrame(viewportAspect=PORTRAIT.width/PORTRAIT.height){
 const base=PORTRAIT.width/PORTRAIT.height;
 const ratio=Number.isFinite(viewportAspect)&&viewportAspect>0?Math.max(.25,Math.min(1.4,viewportAspect)):base;
 const width=ratio>base?Math.round(PORTRAIT.height*ratio*100)/100:PORTRAIT.width;
 const height=ratio<base?Math.round(PORTRAIT.width/ratio*100)/100:PORTRAIT.height;
 const offsetX=Math.round((width-PORTRAIT.width)*50)/100;
 const offsetY=Math.round((height-PORTRAIT.height)*50)/100;
 return {width,height,offsetX,offsetY,viewBox:`0 0 ${width} ${height}`};
}
export function renderPortraitToy(id,s,viewportAspect=PORTRAIT.width/PORTRAIT.height){
 const cases={drawing, 'busy-board':board,'musical-blobs':blobs,'busy-book':book,town,house,forest,islands,shapes,'dress-up':dress,'silly-blocks':blocks,'marble-machine':marble,sequencer:sequence,radio,'world-puzzle':puzzle,dinosaurs:dinos,'connect-the-dots':dots,shops,geometry,space,'number-journey':numbers,phonics,'pawn-maker':pawn,cooking,'code-factory':factory};
 const renderer=cases[id];
 if(!renderer)throw new Error('No portrait scene for '+id);
 const scene=renderer(s),frame=portraitFrame(viewportAspect);
 const background=scene.match(/^<rect[^>]*fill="([^"]+)"/)?.[1]||C.paper;
 const art=`<rect x="0" y="0" width="${frame.width}" height="${frame.height}" fill="${background}"/><g data-world="true" transform="translate(${frame.offsetX} ${frame.offsetY})">${scene}</g>`;
 return {...frame,art};
}
