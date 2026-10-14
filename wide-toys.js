// Responsive wide companion compositions for source-grounded play activities.
// Entirely original art. Interactive objects share the same state as portrait.
import {C,colors} from './toys.js';
import {geometryPiece,pawnArt,cookingAppliance,cookingStatus} from './portrait-toys.js';
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
   pill(75,453,173,'Kitchen','scene')+pill(706,453,181,'Serve','serve',C.sun)+
    (s.rejected?t(480,536,'Perhaps cook something first?',20,'#8e4739'):s.served?t(480,536,'A happy guest had a meal!',20,C.ink):'')+
    (s.served?[0,1,2].map(i=>c(430+i*48,411-(i%2)*17,8,C.coral)).join(''):'');
 }
  return base('#f6e7d6')+
   [0,1,2].map(i=>pill(55+i*190,144,174,['Pot','Blender','Oven'][i],`appliance:${i}`,s.appliance===i?C.teal:C.paper)).join('')+
   [0,1,2].map(i=>a(`cupboard:${i}`,55+i*190,204,174,52,r(55+i*190,204,174,31,s.cupboards[i]?'#8e6655':'#eab194',12)+c(206+i*190,219,5,C.ink),`Open cupboard ${i+1}`)).join('')+
   r(40,239,880,260,'#b5c8c3',24)+
   a('water',60,269,145,141,c(133,335,61,s.water?C.blue:C.paper)+p('M109 313 V278 H151 V310','none',`stroke="${C.ink}" stroke-width="8"`),'Fill or empty water')+
   `<g transform="translate(507 351) scale(.9)">${cookingAppliance(s)}</g>`+
   a('process',391,238,237,214,r(391,238,237,214,'transparent'),'Stir, blend or bake')+
   pill(239,438,150,s.heat?'Heat on':'Heat off','heat',s.heat?C.coral:C.paper)+
   pill(400,438,170,s.prepared?'Chopped':'Chop','prepare',s.prepared?C.sun:C.paper)+
   t(491,514,cookingStatus(s),19)+
   [0,1,2,3].map(i=>a(`ingredient:${i}`,685+(i%2)*113,251+Math.floor(i/2)*99,100,88,r(685+(i%2)*113,251+Math.floor(i/2)*99,100,88,C.paper,17)+meal(i,735+(i%2)*113,289+Math.floor(i/2)*99,.7)+t(735+(i%2)*113,323+Math.floor(i/2)*99,['Pea','Carrot','Tomato','Spice'][i],13),`Add ingredient ${i+1}`)).join('')+
   pill(55,438,167,'Fresh bowl','fresh')+pill(677,438,219,'Dinner table','scene');
}
function drawing(s){
 return base('#fffef9')+r(92,78,776,346,'#fffaf0',24,`stroke="${C.sand}" stroke-width="3"`)+
 `<g data-ink="true" transform="translate(92 78) scale(${776/960} ${346/600})">`+s.strokes.map(line=>`<path d="${line.points.map((pt,i)=>`${i?'L':'M'}${pt[0]} ${pt[1]}`).join(' ')}" fill="none" stroke="${colors[line.c%6]}" stroke-width="${line.w}" stroke-linecap="round" stroke-linejoin="round"/>`).join('')+
 '</g>'+colors.map((col,i)=>a(`color:${i}`,94+i*90,435,76,76,c(132+i*90,473,30,col)+ (s.color===i?c(132+i*90,473,36,'none',`stroke="${C.ink}" stroke-width="3"`):''),`Choose drawing color ${i+1}`)).join('')+
 pill(658,445,103,'Brush','size')+c(712,519,s.width/2,C.ink)+pill(773,445,103,'Undo','undo');
}
function geometry(s){
 return base('#e9eff0')+Array.from({length:5},(_,i)=>Array.from({length:12},(_,j)=>c(84+j*70,120+i*75,3,'#bacbcb')).join('')).join('')+
 s.pieces.map((obj,i)=>drag(`piece:${i}`,obj.x,Math.min(375,obj.y),geometryPiece(obj,i,s.selected===i),`Select and move shape ${i+1}`)).join('')+
 ['Add','Turn','Color','Arrange','Mix','Discard'].map((label,i)=>pill(45+i*146,449,135,label,['add','rotate','paint','preset','randomize','discard'][i])).join('');
}
function pawn(s){
 return base('#e9efe4')+r(128,86,439,430,'#fffbf2',30)+`<g transform="translate(345 252) scale(.85)">${pawnArt(s)}</g>`+
 ['Skin','Body','Eyes','Hat','Color'].map((label,i)=>pill(628,102+i*82,211,label,['face','body','eyes','head','outfit'][i])).join('');
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
 const match={drawing,geometry,'pawn-maker':pawn,cooking,'code-factory':factory,phonics}[id];
 return match?{art:match(s),rich:true}:null;
}
export const richWideIds=new Set(['drawing','geometry','pawn-maker','cooking','code-factory','phonics']);
