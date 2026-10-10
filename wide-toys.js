// Responsive wide companion compositions for source-grounded play activities.
// Entirely original art. Interactive objects share the same state as portrait.
import {C,colors} from './toys.js';
const e=str=>String(str).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[ch]));
const r=(x,y,w,h,color,rad=14,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rad}" fill="${color}" ${extra}/>`;
const c=(x,y,rad,color,extra='')=>`<circle cx="${x}" cy="${y}" r="${rad}" fill="${color}" ${extra}/>`;
const t=(x,y,msg,size=26,color=C.ink)=>`<text x="${x}" y="${y}" font-family="ui-rounded,system-ui,sans-serif" font-weight="800" font-size="${size}" dominant-baseline="middle" text-anchor="middle" fill="${color}">${e(msg)}</text>`;
const p=(d,col,extra='')=>`<path d="${d}" fill="${col}" ${extra}/>`;
const a=(key,x,y,w,h,inside,label)=>`<g data-act="${e(key)}" role="button" tabindex="0" aria-label="${e(label)}" class="toy-hit">${inside}${r(x,y,w,h,'transparent',8)}</g>`;
const drag=(key,x,y,inside,label)=>`<g data-drag="${e(key)}" transform="translate(${x} ${y})" tabindex="0" role="button" aria-label="${e(label)}" class="toy-drag">${inside}</g>`;
const base=col=>r(0,0,960,600,col,0);
const face=(x,y)=>c(x-13,y-4,4,C.ink)+c(x+13,y-4,4,C.ink)+p(`M${x-14} ${y+12} Q${x} ${y+26} ${x+14} ${y+12}`,'none',`stroke="${C.ink}" stroke-width="3.5" stroke-linecap="round"`);
const meal=(id,x,y,scale=1)=>{
 const col=[C.leaf,'#e99160',C.coral,C.sun][id%4];
 return `<g transform="translate(${x} ${y}) scale(${scale})">${id%4===1?p('M0 -28 Q28 5 2 35 Q-26 3 0 -28 Z',col):c(0,0,24,col)}${c(-6,-8,6,'rgba(255,255,255,.46)')}</g>`;
};
const pill=(x,y,w,label,act,col=C.paper)=>a(act,x,y,w,52,r(x,y,w,52,col,23)+t(x+w/2,y+26,label,19),label);
function cooking(s){
 if(s.mode%2===0){
  const skin=['#eac08d','#ad795a','#805742'];
  const people=[0,1,2].map(i=>{
   const x=236+i*246,y=273+(i%2*14);
   return a(`guest:${i}`,x-78,y-98,156,216,
    r(x-65,y+30,130,110,[C.teal,C.blue,C.coral][i],42)+
    c(x,y-20,72,skin[i])+face(x,y-17)+
    (s.guest===i?c(x,y-20,78,'none',`stroke="${C.sun}" stroke-width="6"`):''),`Choose dinner guest ${i+1}`);
  }).join('');
  return base('#f7e5d3')+
   r(75,84,810,163,'#e1b59d',24)+r(102,104,174,119,'#aad6cd',14)+
   p('M190 106 V222 M103 163 H276','none',`stroke="${C.paper}" stroke-width="9"`)+
   [0,1,2,3].map(i=>r(339+i*87,121,62,94,colors[i],18)).join('')+
   people+
   `<ellipse cx="480" cy="526" rx="462" ry="178" fill="#ab7657"/>`+
   `<ellipse cx="480" cy="495" rx="441" ry="167" fill="#e5b48b"/>`+
   `<ellipse cx="479" cy="449" rx="142" ry="96" fill="#fffdf8"/>`+
   `<ellipse cx="479" cy="447" rx="108" ry="73" fill="#f2e2c3"/>`+
   s.ingredients.slice(-8).map((v,i)=>meal(v,430+i*16,436+(i%2)*24,.43)).join('')+
   a(`guest:${s.guest}`,671,106,134,103,r(671,106,134,103,C.paper,34)+meal(s.craving,738,158,.8),'See dinner guest request')+
   pill(75,453,173,'Kitchen','scene')+pill(706,453,181,'Serve','serve',C.sun);
 }
 return base('#f6e7d6')+
  r(35,87,890,132,'#dfa080',20)+
  [0,1,2].map(i=>a(`cupboard:${i}`,56+i*295,104,267,104,
   r(56+i*295,104,268,104,s.cupboards[i]?'#b98a6a':'#f6d1af',12)+
   r(75+i*295,118,230,75,s.cupboards[i]?'#8c624d':'#f4bc9a',9)+c(284+i*295,156,9,C.ink),`Open cupboard ${i+1}`)).join('')+
  r(39,240,884,251,'#b3cac5',30)+
  a('water',55,265,213,189,r(71,271,185,169,C.paper,20)+c(162,364,68,s.water?C.blue:'#d5e7e8')+
    p('M130 334 V289 H190 V325','none',`stroke="${C.ink}" stroke-width="9"`),'Fill the kitchen sink')+
  c(608,356,146,C.ink)+c(608,356,119,'#839e9a')+c(608,356,96,s.heat?'#f3b66e':'#f8dcae')+
  s.ingredients.slice(-8).map((v,i)=>meal(v,571+(i%4)*24,333+Math.floor(i/4)*39,.4)).join('')+
  a('stir',752,255,128,169,p('M811 258 L757 409','none',`stroke="#765c4c" stroke-width="14"`)+c(745,422,28,C.ink),'Stir the pot')+
  [0,1,2,3].map(i=>a(`ingredient:${i}`,37+i*151,434,137,66,r(38+i*151,438,130,59,C.paper,16)+meal(i,75+i*151,466,.6)+t(126+i*151,469,['Pea','Carrot','Tomato','Spice'][i],14),`Add ingredient ${i+1}`)).join('')+
  pill(675,453,214,'Dinner table','scene')+
  pill(360,452,191,s.heat?'Turn heat off':'Heat on','heat',s.heat?C.coral:C.paper);
}
function factory(s){
 const workerX=114+(s.robot%6)*123;
 const levers=s.commands.slice(0,4).map((v,i)=>a(`director:${i}`,95+i*200,279,177,89,
  r(95+i*200,279,179,87,v%2?C.coral:C.sun,17)+c(162+i*200,321,23,C.paper)+
  p(`M${143+i*200} 320 H${185+i*200}`,'none',`stroke="${C.ink}" stroke-width="8"`),`Change director ${i+1}`)).join('');
 return base('#e6eeeb')+
  p('M62 173 H898 V488 H83 V173','none',`stroke="${C.ink}" stroke-width="42" stroke-linejoin="round"`)+
  p('M62 173 H898 V488 H83 V173','none',`stroke="#88aaa5" stroke-width="23" stroke-dasharray="20 16" stroke-linejoin="round"`)+
  levers+
  r(workerX-38,133,76,86,C.blue,16)+face(workerX,171)+
  a('crate',68,392,194,112,r(82,403,165,91,'#d29669',15)+p('M90 409 L239 493 M233 411 L91 493','none',`stroke="#956946" stroke-width="9"`),'Unbox a delivery crate')+
  r(640,388,209,118,'#f5d89a',16)+t(749,404,'MARKET',17)+
  Array.from({length:Math.min(6,s.goods)},(_,i)=>r(669+(i%3)*58,432+Math.floor(i/3)*43,48,35,colors[i],7)).join('')+
  Array.from({length:Math.min(7,s.mess)},(_,i)=>c(308+i*44,460+i%2*14,11,'#817a75')).join('')+
  pill(280,446,148,s.playing?'Pause':'Start','run')+pill(446,446,166,'Clean up','clean');
}
function phonics(s){
 const words=[['M','OO','N'],['F','I','SH'],['S','U','N'],['T','R','EE'],['B','IR','D']];
 const sound=words[s.word%words.length];
 const pieces=sound.map((str,i)=>{
  const x=371+i*141,y=s.placed[i]?397:186;
  return drag(`phoneme:${i}`,x,y,r(-50,-39,101,82,s.placed[i]?C.teal:C.paper,16)+t(0,0,str,29,s.placed[i]?C.paper:C.ink),`Move ${str} sound to its box`);
 }).join('');
 return base('#f8f1e5')+
  c(184,289,106,C.sun)+face(184,285)+t(184,407,['MOON','FISH','SUN','TREE','BIRD'][s.word%words.length],28)+
  [0,1,2].map(i=>r(304+i*147,358,119,96,s.placed[i]?'#cae5da':'#fffaf0',18,`stroke="${s.placed[i]?C.teal:'#bfcbc8'}" stroke-width="4"`)).join('')+
  pieces+pill(526,453,313,'Another word','word');
}
export function renderWideToy(id,s){
 const match={cooking,'code-factory':factory,phonics}[id];
 return match?{art:match(s),rich:true}:null;
}
export const richWideIds=new Set(['cooking','code-factory','phonics']);
