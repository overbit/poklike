import {toys,ids,toyById,initialState,renderToy,interact,moveDrag,tickToy,marblePosition,C} from './toys.js';
import {renderPortraitToy,toModel,toPortrait,portraitDragToModel,PORTRAIT_DRAG_LIFT} from './portrait-toys.js';
import {renderWideToy,richWideIds} from './wide-toys.js';
import {AGE_BANDS,INTERESTS,normalizeProfile,recommendedToyIds} from './profile.js';

const KEY='poklike-state-v1', PREF='poklike-prefs-v1', PROFILE='poklike-profile-v1';
const app=document.querySelector('#app');
const icon=(kind)=>({back:'<path d="M19 12H5m0 0 7-7m-7 7 7 7"/>',reset:'<path d="M4 11a8 8 0 1 1 2 6m-2 2v-7h7"/>',adult:'<path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v5l3 2"/>',sound:'<path d="M4 9v6h4l5 4V5L8 9H4Zm12 0a4 4 0 0 1 0 6"/>'}[kind]||'');
const svgIcon=kind=>`<svg viewBox="0 0 24 24" role="img" aria-hidden="true">${icon(kind)}</svg>`;
const escapeHtml=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const savedRead=key=>{try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}};
let profile=normalizeProfile(savedRead(PROFILE));
const states=Object.create(null);
const savedStates=savedRead(KEY);
const preferences={sound:true,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,...(savedRead(PREF)||{})};
preferences.sound=preferences.sound!==false;
preferences.reducedMotion=preferences.reducedMotion===true;
let offline={phase:'loading',message:'Preparing offline play…'};
let currentToy=null,ctx=null,installPrompt=null,visited=new Set();
const gestures=new Map();
let sliderIgnoreClickUntil=0;
const safeId=id=>ids.has(id)?id:null;
const boundedNumber=(value,fallback,min=-9999,max=9999)=>typeof value==='number'&&Number.isFinite(value)?Math.max(min,Math.min(max,value)):fallback;
function sanitized(id,input){
 const template=initialState(id),s={...template};
 if(!input||typeof input!=='object'||Array.isArray(input))return s;
 for(const [key,fallback]of Object.entries(template)){
  if(!Object.hasOwn(input,key))continue;
  const val=input[key];
  if(typeof fallback==='number')s[key]=boundedNumber(val,fallback,key==='number'?1:0,key==='number'?12:10000);
  else if(typeof fallback==='boolean')s[key]=typeof val==='boolean'?val:fallback;
  else if(typeof fallback==='string')s[key]=typeof val==='string'?val.slice(0,50):fallback;
  else if(Array.isArray(fallback)){
   if(!Array.isArray(val))continue;
   if(key==='strokes')s.strokes=val.slice(-150).map(line=>({c:boundedNumber(line?.c,0,0,5),w:boundedNumber(line?.w,9,1,40),points:Array.isArray(line?.points)?line.points.slice(0,1500).filter(p=>Array.isArray(p)&&p.length===2).map(p=>[boundedNumber(p[0],0,0,960),boundedNumber(p[1],0,0,600)]):[]}));
   else if(key==='basket'||key==='touched')s[key]=val.slice(-35).filter(x=>typeof x==='string').map(x=>x.replace(/[^0-9:]/g,'').slice(0,12));
   else if(key==='ingredients')s[key]=val.slice(-24).map(x=>Math.floor(boundedNumber(x,0,0,3)));
   else if(key==='steps')s.steps=template.steps.map((row,i)=>row.map((v,j)=>val[i]?.[j]===true));
   else if(key==='switches'||key==='valves'||key==='cupboards'||key==='placed')s[key]=fallback.map((v,i)=>typeof val[i]==='boolean'?val[i]:v);
   else if(key==='commands'||key==='sliders'||key==='dials')s[key]=fallback.map((v,i)=>boundedNumber(val[i],v,0,key==='sliders'?1:5));
   else if(key==='pieces')s.pieces=val.slice(0,12).map((item,i)=>({x:boundedNumber(item?.x,220,60,885),y:boundedNumber(item?.y,250,85,440),c:Math.floor(boundedNumber(item?.c,i%6,0,5)),r:Math.floor(boundedNumber(item?.r,0,0,359))}));
    else s[key]=val.slice(0,key==='blocks'?18:12).map((item,i)=>{
    if(!item||typeof item!=='object')return fallback[i]||{x:480,y:300};
    return Object.fromEntries(Object.entries(item).filter(([k,v])=>['x','y','c'].includes(k)).map(([k,v])=>[k,boundedNumber(v,0,0,k==='x'?960:k==='y'?600:5)]));
   });
  }
  else if(fallback&&typeof fallback==='object')s[key]={x:boundedNumber(val?.x,fallback.x,0,960),y:boundedNumber(val?.y,fallback.y,0,600)};
 }
 if(id==='code-factory'&&input.crates===undefined)s.playing=true;
 const limits={appliance:3,face:4,body:3,eyes:3,head:3,outfit:6,preset:3,form:5,weather:2,stir:12};
 for(const [key,max]of Object.entries(limits))if(Object.hasOwn(s,key))s[key]=Math.floor(Math.max(0,s[key]))%max;
 if(id==='geometry')s.selected=Math.max(0,Math.min(s.pieces.length-1,Math.floor(s.selected)));
 return s;
}
for(const id of ids)states[id]=sanitized(id,savedStates&&Object.hasOwn(savedStates,id)?savedStates[id]:null);
function loadState(id){
 if(!states[id])states[id]=initialState(id);
 return states[id];
}
function save(){
 try{localStorage.setItem(KEY,JSON.stringify(states));localStorage.setItem(PREF,JSON.stringify(preferences));localStorage.setItem(PROFILE,JSON.stringify(profile));return true;}
 catch(error){console.warn('Local save unavailable:',error);return false;}
}
function setMotion(){document.body.dataset.reduced=String(preferences.reducedMotion);}
setMotion();
function status(){return `<span class="connection-status ${offline.phase==='ready'?'ready':offline.phase==='error'?'error':''}" role="status" aria-live="polite">${escapeHtml(offline.message)}</span>`;}
function brand(){return `<span class="brand-symbol" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>Poklike`;}
function refreshStatus(){document.querySelectorAll('.connection-status').forEach(el=>{el.textContent=offline.message;el.className='connection-status '+(offline.phase==='ready'?'ready':offline.phase==='error'?'error':'');});}
function previewArt(id){
 const state=loadState(id);
 if(id==='drawing'&&(!state.strokes||state.strokes.length===0)){
  const stroke=(c,w,points)=>({c,w,points});
  const sun=Array.from({length:33},(_,i)=>{const a=i*Math.PI/16;return [710+48*Math.cos(a),166+48*Math.sin(a)];});
  const hills=Array.from({length:27},(_,i)=>[60+i*34,438-44*Math.sin(i*.29)]);
  const waves=Array.from({length:23},(_,i)=>[170+i*28,326+25*Math.sin(i*.57)]);
  const petal=a=>Array.from({length:17},(_,i)=>{const t=i*Math.PI/8;return [300+45*Math.cos(t)+22*Math.cos(a),470+31*Math.sin(t)+19*Math.sin(a)];});
  const art=[stroke(1,21,sun),stroke(2,22,hills),stroke(3,15,waves),
   ...[0,Math.PI/2,Math.PI,3*Math.PI/2].map(a=>stroke(0,16,petal(a))),
   stroke(1,23,[[300,466],[302,469]])];
  return renderToy(id,{...state,strokes:art}).art;
 }
 return (renderWideToy(id,state)||renderToy(id,state)).art;
}
function recommendationShelf(){
 const picks=recommendedToyIds(toys,profile);
 if(!picks.length)return '';
 return `<section class="recommendations" aria-labelledby="recommendations-title"><h2 id="recommendations-title">A few ideas for today</h2><p>Chosen from the themes your grown-up picked. Every toy is still here to explore.</p><div class="recommendation-list">${picks.map(id=>{const toy=toyById(id);return `<a href="#/toy/${id}" data-recommendation="${id}"><span aria-hidden="true"><svg viewBox="0 0 960 600">${previewArt(id)}</svg></span><strong>${escapeHtml(toy.title)}</strong></a>`;}).join('')}</div></section>`;
}
function gallery(){
 currentToy=null;gestures.clear();document.body.classList.remove('playing');document.title='Poklike — A little world of play';
 app.innerHTML=`<main class="shell">
 <header class="topbar"><a class="brand" href="#/" aria-label="Poklike home">${brand()}</a><div class="toolbar-actions">${status()}<button class="icon-button" data-adult aria-label="Grown-ups area">${svgIcon('adult')}</button></div></header>
 <section class="hero" aria-label="Welcome"><div class="hero-copy"><h1>Little worlds,<br><em>big wonder.</em></h1><p>A cozy collection of tiny adventures. Make music, build anything, draw a new world and follow your curiosity. There's no right way to play.</p></div><div class="hero-display" aria-hidden="true"><div class="disk"></div><div class="cone"></div><div class="block"></div><div class="dot"></div></div></section>
 ${recommendationShelf()}<section aria-labelledby="collection-title"><div class="collection-heading"><h2 id="collection-title">Choose something to explore</h2><span>${toys.length} little adventures</span></div>
 <div class="toys-grid">${toys.map((toy,i)=>{
  const art=previewArt(toy.id);
  return `<button class="toy-card ${i===0?'featured':''}" style="--accent:${toy.color}" data-toy="${toy.id}" aria-label="Play ${escapeHtml(toy.title)}">
   <span class="toy-preview" aria-hidden="true"><svg viewBox="0 0 960 600" preserveAspectRatio="xMidYMid slice">${art}</svg></span>
   <span class="toy-description"><span class="toy-name">${escapeHtml(toy.title)}</span><span class="toy-tagline">${escapeHtml(toy.tagline)}</span></span>
  </button>`;
 }).join('')}</div></section>
 <footer class="home-footer"><span class="disclaimer">Made as an independent, free, original playroom. No ads, accounts, tracking or network needed once the app says it's ready offline.</span><div><button class="plain-button" data-adult>Grown-ups & settings</button><button id="install-button" class="plain-button ${installPrompt?'available':''}" data-install>Install on this device</button></div></footer>
 </main>`;
}
function isPortraitPlay(){
 return matchMedia('(max-width: 1024px) and (orientation: portrait)').matches;
}
function wideViewBox(id){
 if(id==='drawing')return '0 0 960 600';
 const ratio=innerWidth/Math.max(1,innerHeight);
 const height=Math.max(430,Math.min(600,960/ratio));
 const top=Math.round((600-height)/2);
 return `0 ${top} 960 ${Math.round(height)}`;
}
function sceneAspect(){
 const frame=app.querySelector('.stage-wrap')?.getBoundingClientRect();
 return frame?.width&&frame?.height?frame.width/frame.height:innerWidth/Math.max(1,innerHeight);
}
function buildScene(id){
 if(isPortraitPlay())return renderPortraitToy(id,loadState(id),sceneAspect());
 const wide=renderWideToy(id,loadState(id))||renderToy(id,loadState(id));
 return {...wide,viewBox:wideViewBox(id)};
}
function stageMarkup(id){
 const scene=buildScene(id),portrait=isPortraitPlay();
 return `<svg class="toy-canvas" data-stage="${id}" data-layout="${portrait?'portrait':'landscape'}" data-offset-x="${scene.offsetX||0}" data-offset-y="${scene.offsetY||0}" xmlns="http://www.w3.org/2000/svg" viewBox="${scene.viewBox}" preserveAspectRatio="xMidYMid meet" aria-label="Interactive ${escapeHtml(toyById(id).title)} play area" role="group">${scene.art}</svg>`;
}
function showToy(id){
 id=safeId(id);if(!id){location.hash='#/';return;}
 currentToy=id;gestures.clear();visited.add(id);document.body.classList.add('playing');
 const toy=toyById(id),scene=renderToy(id,loadState(id));
 document.title=toy.title+' — Poklike';
 app.innerHTML=`<main class="game-shell ${!isPortraitPlay()&&richWideIds.has(id)?'rich-wide':''}">
  <header class="game-header"><button class="home-link" data-home aria-label="Return to all toys">${svgIcon('back')}<span>All toys</span></button><div class="game-heading"><h1>${escapeHtml(toy.title)}</h1><p>${escapeHtml(toy.tagline)}</p></div><button class="game-reset" data-reset aria-label="Reset this toy">${svgIcon('reset')}<span>Start fresh</span></button></header>
  <section class="game-content" aria-label="${escapeHtml(toy.title)} playground"><div class="stage-wrap">${stageMarkup(id)}</div>
   <div class="play-controls" aria-label="${escapeHtml(toy.title)} tools">${scene.tools.map(t=>`<button class="play-control" data-act="${escapeHtml(t.act)}">${escapeHtml(t.label)}</button>`).join('')}</div>
   <p class="game-help">${escapeHtml(scene.hint)}</p></section>
 </main>`;
 const stage=app.querySelector('[data-stage]');
 stage.addEventListener('pointerdown',pointerDown);
 stage.addEventListener('pointermove',pointerMove);
 stage.addEventListener('pointerup',pointerUp);
 stage.addEventListener('pointercancel',pointerUp);
 requestAnimationFrame(responsiveStage);
}
function replaceKeepingFocus(container,html){
 const active=document.activeElement,keys=['data-slider','data-drag','data-act'];
 const key=container.contains(active)?keys.find(k=>active.hasAttribute(k)):null;
 const value=key?active.getAttribute(key):null;
 container.innerHTML=html;
 if(key){const replacement=[...container.querySelectorAll(`[${key}]`)].find(el=>el.getAttribute(key)===value);replacement?.focus({preventScroll:true});}
}
function updateStage(){
 if(!currentToy||gestures.size)return;
 const stage=app.querySelector('[data-stage]');
 if(stage)replaceKeepingFocus(stage,buildScene(currentToy).art);
}
function handleAction(action){
 if(!currentToy)return;
 const st=loadState(currentToy);interact(currentToy,st,action);
 if(preferences.sound){
  if(currentToy==='musical-blobs')sound([262,330,392,523][st.mode%4],.24);
  else sound(180+(st.turn%6)*43,.095);
 }
 save();updateStage();
 const scene=renderToy(currentToy,st);
 const controls=app.querySelector('.play-controls');
 if(controls)replaceKeepingFocus(controls,scene.tools.map(t=>`<button class="play-control" data-act="${escapeHtml(t.act)}">${escapeHtml(t.label)}</button>`).join(''));
}
function point(ev,svg){
 const pt=svg.createSVGPoint();pt.x=ev.clientX;pt.y=ev.clientY;
 const ctm=svg.getScreenCTM();if(!ctm)return {x:0,y:0};
 const p=pt.matrixTransform(ctm.inverse());
 return {x:p.x-Number(svg.dataset.offsetX||0),y:p.y-Number(svg.dataset.offsetY||0)};
}
function pointerDown(ev){
 if(!currentToy||gestures.has(ev.pointerId))return;
 const svg=ev.currentTarget,at=point(ev,svg),target=ev.target instanceof Element?ev.target:null;
 const portrait=isPortraitPlay();
 const movable=target?.closest('[data-drag]');
 if(movable){
  if(currentToy==='geometry')loadState('geometry').selected=Number(movable.dataset.drag.split(':')[1]);
  if(currentToy==='musical-blobs'&&preferences.sound){
   const index=Number(movable.dataset.drag?.split(':')[1]||0);
   const notes=[262,294,330,392,440];
   sound(notes[(index+loadState('musical-blobs').mode)%notes.length],.19);
  }
  const match=(movable.getAttribute('transform')||'').match(/translate\(([-\d.]+)[ ,]([-\d.]+)\)/);
  const x=Number(match?.[1]||0),y=Number(match?.[2]||0);
  gestures.set(ev.pointerId,{kind:'move',key:movable.dataset.drag,element:movable,offset:{x:x-at.x,y:y-at.y},x,y,portrait});
  try{svg.setPointerCapture(ev.pointerId);}catch{}ev.preventDefault();return;
 }
 const slider=portrait?target?.closest('[data-slider]'):null;
 if(slider&&currentToy==='busy-board'){
  const index=Number(slider.dataset.slider);
  gestures.set(ev.pointerId,{kind:'slider',index,element:slider});
  setSlider(index,at.x,slider);
  try{svg.setPointerCapture(ev.pointerId);}catch{}ev.preventDefault();return;
 }
 if(currentToy==='busy-book'&&!target?.closest('[data-act],[data-drag]')){
  gestures.set(ev.pointerId,{kind:'page',startX:ev.clientX,startY:ev.clientY});
  try{svg.setPointerCapture(ev.pointerId);}catch{}
  ev.preventDefault();return;
 }
 if(currentToy==='drawing'&&!target?.closest('[data-act]')){
  const inBounds=portrait?at.x>22&&at.x<457&&at.y>177&&at.y<710:at.y<424&&at.y>78&&at.x>92&&at.x<868;
  if(!inBounds)return;
  const st=loadState('drawing'),model=portrait?toModel(at):{x:(at.x-92)*960/776,y:(at.y-78)*600/346};
  if(st.strokes.length>=150)st.strokes.shift();
  const line={c:st.color,w:st.width,points:[[model.x,model.y]]};st.strokes.push(line);
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('fill','none');path.setAttribute('stroke',([C.coral,C.sun,C.teal,C.blue,C.plum,C.leaf])[st.color]);
  path.setAttribute('stroke-width',String(portrait?st.width*.7:st.width));
  path.setAttribute('stroke-linejoin','round');path.setAttribute('stroke-linecap','round');(portrait?svg.querySelector('[data-world]'):svg.querySelector('[data-ink]')).appendChild(path);
  gestures.set(ev.pointerId,{kind:'draw',line,path,portrait});
  try{svg.setPointerCapture(ev.pointerId);}catch{}ev.preventDefault();
 }
}
function setSlider(index,x,element){
 if(index<0||index>1)return;
 const value=Math.max(0,Math.min(1,(x-64)/350));
 loadState('busy-board').sliders[index]=value;
 element.setAttribute('aria-valuenow',String(Math.round(value*100)));
 element.querySelector('[data-slider-fill]')?.setAttribute('width',String(350*value));
 element.querySelectorAll('[data-slider-knob]').forEach(knob=>knob.setAttribute('cx',String(64+350*value)));
 sliderIgnoreClickUntil=performance.now()+450;
}
function pointerMove(ev){
 const d=gestures.get(ev.pointerId);if(!d)return;
 const svg=ev.currentTarget,at=point(ev,svg);
 if(d.kind==='slider')setSlider(d.index,at.x,d.element);
 else if(d.kind==='draw'){
  const inBounds=d.portrait?at.x>22&&at.x<457&&at.y>177&&at.y<710:at.x>=92&&at.x<=868&&at.y>=78&&at.y<=424;
  if(inBounds&&d.line.points.length<1500){
   const m=d.portrait?toModel(at):{x:(at.x-92)*960/776,y:(at.y-78)*600/346};d.line.points.push([m.x,m.y]);
   d.path.setAttribute('d',d.line.points.map((p,i)=>{const pos=d.portrait?toPortrait({x:p[0],y:p[1]}):{x:p[0],y:p[1]};return `${i?'L':'M'}${pos.x} ${pos.y}`;}).join(' '));
  }
 }else if(d.kind==='move'){
  const lift=d.portrait?(PORTRAIT_DRAG_LIFT[currentToy]||0):0;
  const range=d.portrait?{left:48,right:432,top:Math.max(145,119+lift),bottom:currentToy==='geometry'?590:725}:{left:60,right:885,top:85,bottom:currentToy==='geometry'?365:520};
  d.x=Math.max(range.left,Math.min(range.right,at.x+d.offset.x));
  d.y=Math.max(range.top,Math.min(range.bottom,at.y+d.offset.y));
  d.element.setAttribute('transform',`translate(${d.x} ${d.y})`);
 }
 ev.preventDefault();
}
function pointerUp(ev){
 const d=gestures.get(ev.pointerId);if(!d)return;
 gestures.delete(ev.pointerId);
 if(d.kind==='page'&&ev.type==='pointerup'){
  const dx=ev.clientX-d.startX,dy=ev.clientY-d.startY;
  if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4)handleAction(dx<0?'next':'prev');
 }
 if(d.kind==='move'){
  const model=d.portrait?portraitDragToModel(currentToy,{x:d.x,y:d.y}):{x:d.x,y:d.y};
  const state=loadState(currentToy),before=state.collisions||0;
  moveDrag(currentToy,state,d.key,model.x,model.y,d.portrait?'portrait':'wide');
  if(preferences.sound){
   sound(245+(d.key.length*41)%340,.12);
   if(currentToy==='musical-blobs'&&state.collisions>before){
    const note=[262,294,330,392][Number(d.key.split(':')[1])%4]||330;
    sound(note,.3);setTimeout(()=>sound(note*1.5,.22),95);
   }
  }
 }else if(d.kind==='draw'&&d.line.points.length===1){
  const [x,y]=d.line.points[0];d.line.points.push([x+.5,y+.5]);
 }
 try{ev.currentTarget.releasePointerCapture(ev.pointerId);}catch{}
 save();updateStage();ev.preventDefault();
}
function sound(freq=330,duration=.12){
 if(!preferences.sound||!freq)return;
 try{
  if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();
  if(ctx.state==='suspended')ctx.resume();
  const osc=ctx.createOscillator(),gain=ctx.createGain(),now=ctx.currentTime;
  osc.type='sine';osc.frequency.setValueAtTime(Math.max(110,Math.min(freq,1200)),now);
  gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.07,now+.025);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
  osc.connect(gain).connect(ctx.destination);osc.start(now);osc.stop(now+duration+.02);
 }catch{/* Sound is optional; offline play must still work. */}
}
function route(){
 const match=location.hash.match(/^#\/toy\/([a-z-]+)$/);if(match&&safeId(match[1]))showToy(match[1]);else gallery();
}
function dialog(content){
 document.querySelector('#adult-dialog')?.remove();
 const modal=document.createElement('dialog');modal.id='adult-dialog';modal.innerHTML=`<div class="dialog-inner"><button class="dialog-close" data-close aria-label="Close dialog">×</button>${content}</div>`;
 document.body.appendChild(modal);modal.addEventListener('close',()=>modal.remove());modal.querySelector('[data-close]').addEventListener('click',()=>modal.close());modal.showModal();return modal;
}
function grownUps(){
 const a=9+Math.floor(Math.random()*8),b=6+Math.floor(Math.random()*9);
 const modal=dialog(`<h2>Just for grown-ups</h2><p>This area controls the playroom on this device. Solve this little sum to continue.</p><form id="grown-up-check"><label class="field">What is ${a} + ${b}?<input required name="answer" type="number" min="0" max="60" inputmode="numeric" autocomplete="off" autofocus /></label><div class="dialog-error" role="alert" id="gate-error"></div><button class="primary-button" type="submit">Continue</button></form>`);
 modal.querySelector('input').focus();
 modal.querySelector('form').addEventListener('submit',ev=>{ev.preventDefault();if(Number(modal.querySelector('input').value)===a+b){modal.close();settings();}else{modal.querySelector('#gate-error').textContent='That answer did not match. Please try again.';modal.querySelector('input').select();}});
}
function settings(){
 const modal=dialog(`<h2>Grown-ups & settings</h2><p>Everything stays here on this device. No account, subscriptions or advertising.</p>
 <label class="setting-row"><span>Gentle sounds<small>Little synthesized notes, never streamed audio</small></span><input class="toggle" id="setting-sound" type="checkbox" ${preferences.sound?'checked':''}/></label>
 <label class="setting-row"><span>Reduce movement<small>Less passive animation</small></span><input class="toggle" id="setting-motion" type="checkbox" ${preferences.reducedMotion?'checked':''}/></label>
 <fieldset class="profile-settings"><legend>Ideas for your playroom</legend><p>Optional recommendations use locally chosen themes, not the original app’s algorithm. No name or birthday is needed. These choices stay on this device and in backups you choose to save.</p><label class="setting-row"><span>Show a few toy ideas</span><input id="profile-enabled" type="checkbox" ${profile.enabled?'checked':''} /></label><label class="field">Age range<select id="profile-age">${AGE_BANDS.map(b=>`<option value="${b.id}" ${profile.ageBand===b.id?'selected':''}>${b.label}</option>`).join('')}</select></label><div class="interest-options">${INTERESTS.map(i=>`<label><input type="checkbox" data-interest="${i.id}" ${profile.interests.includes(i.id)?'checked':''} />${i.label}</label>`).join('')}</div><button class="secondary-button" id="clear-profile">Clear recommendations</button></fieldset>
 <div class="button-row"><button class="secondary-button" id="export-save">Save a backup</button><label class="secondary-button" for="import-save" role="button" tabindex="0">Restore a backup</label><input type="file" id="import-save" accept="application/json,.json" hidden /></div>
 <p class="notice">${escapeHtml(offline.message)}. ${offline.phase==='ready'?'After the initial download all 25 toys can reopen without a connection.':'Open over HTTPS or localhost, keep this page open until it reports offline readiness.'} Browser storage can be erased by the device or browser.</p>
 <div class="danger-zone"><strong>Start the whole playroom fresh</strong><label class="field">Type CLEAR to remove saved creations. Sound, movement and recommendations are kept<input id="clear-confirm" placeholder="CLEAR" autocomplete="off" /></label><button class="danger" id="clear-all" disabled>Erase saved play</button></div>
 <p class="dialog-error" id="settings-message" role="status"></p>`);
 const message=text=>{modal.querySelector('#settings-message').textContent=text;};
 const persist=()=>{const ok=save();message(ok?'Saved on this device.':'Could not save on this device. Changes may be lost when you close the app.');return ok;};
 const updateProfile=()=>{profile=normalizeProfile({enabled:modal.querySelector('#profile-enabled').checked,ageBand:modal.querySelector('#profile-age').value,interests:[...modal.querySelectorAll('[data-interest]:checked')].map(el=>el.dataset.interest)});persist();};
 modal.querySelector('#profile-enabled').addEventListener('change',updateProfile);modal.querySelector('#profile-age').addEventListener('change',updateProfile);modal.querySelectorAll('[data-interest]').forEach(el=>el.addEventListener('change',updateProfile));
 modal.querySelector('#clear-profile').addEventListener('click',()=>{profile=normalizeProfile(null);modal.querySelector('#profile-enabled').checked=false;modal.querySelector('#profile-age').value='any';modal.querySelectorAll('[data-interest]').forEach(el=>el.checked=false);persist();});
 modal.addEventListener('close',()=>{if(!currentToy)gallery();});
 modal.querySelector('#setting-sound').addEventListener('change',e=>{preferences.sound=e.target.checked;persist();});
 modal.querySelector('#setting-motion').addEventListener('change',e=>{preferences.reducedMotion=e.target.checked;setMotion();persist();});
 modal.querySelector('#export-save').addEventListener('click',()=>{
  const payload={format:'poklike-backup-1',saved:new Date().toISOString(),preferences,states,profile};
  const url=URL.createObjectURL(new Blob([JSON.stringify(payload)],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download='poklike-playroom-backup.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
  modal.querySelector('#settings-message').textContent='Backup download requested. Keep the downloaded file somewhere safe.';
 });
 modal.querySelector('#import-save').addEventListener('change',async(e)=>{
  const file=e.target.files?.[0];if(!file)return;
  if(file.size>250000){modal.querySelector('#settings-message').textContent='This backup is too large.';return;}
  try{
   const json=JSON.parse(await file.text());
   if(!json||json.format!=='poklike-backup-1'||!json.states||typeof json.states!=='object'||Array.isArray(json.states))throw new Error('Invalid backup');
   const nextStates=Object.create(null);
   for(const id of ids)if(Object.hasOwn(json.states,id))nextStates[id]=sanitized(id,json.states[id]);
   const importedPreferences=json.preferences&&typeof json.preferences==='object'&&!Array.isArray(json.preferences)?json.preferences:{};
   const nextPreferences={sound:!Object.hasOwn(importedPreferences,'sound')||importedPreferences.sound!==false,reducedMotion:Object.hasOwn(importedPreferences,'reducedMotion')&&importedPreferences.reducedMotion===true};
   const nextProfile=Object.hasOwn(json,'profile')?normalizeProfile(json.profile):normalizeProfile(profile);
   // All parsing and normalization completes before any live state changes.
   Object.assign(states,nextStates);Object.assign(preferences,nextPreferences);profile=nextProfile;setMotion();
   if(save())message('Backup restored on this device. Reopen a toy to see its saved state.');
   else message('Backup opened, but could not be saved on this device. Keep a copy of your backup.');
  }catch{modal.querySelector('#settings-message').textContent='Could not read this backup. Please select a Poklike backup file.';}
 });
 const input=modal.querySelector('#clear-confirm'),clear=modal.querySelector('#clear-all');
 input.addEventListener('input',()=>{clear.disabled=input.value!=='CLEAR';});
 clear.addEventListener('click',()=>{for(const id of ids)states[id]=initialState(id);message(save()?'Saved creations were erased. Preferences and recommendations were kept.':'Creations cleared for now, but storage could not be updated. Previously saved play may return.');input.value='';clear.disabled=true;});
}
function verifyOffline(worker){return new Promise((resolve,reject)=>{
 const channel=new MessageChannel();const timeout=setTimeout(()=>reject(new Error('Timed out checking offline files')),12000);
 channel.port1.onmessage=ev=>{clearTimeout(timeout);channel.port1.close();resolve(ev.data);};
 worker.postMessage({type:'VERIFY'},[channel.port2]);
});}
async function prepareOffline(){
 if(!('serviceWorker'in navigator)||!window.isSecureContext){offline={phase:'error',message:'Offline install needs HTTPS'};refreshStatus();return;}
 try{
  await navigator.serviceWorker.register('./sw.js',{scope:'./'});
  const registration=await navigator.serviceWorker.ready;
  const result=await verifyOffline(registration.active);
  if(!result?.ready)throw new Error((result?.missing||[]).join(', ')||result?.error||'Offline files missing');
  offline={phase:'ready',message:'Ready offline'};
 }catch(error){offline={phase:'error',message:'Offline setup failed — reload online'};console.error('Could not prepare offline play:',error);}
 refreshStatus();
}
app.addEventListener('click',ev=>{
 const target=ev.target instanceof Element?ev.target:null;if(!target)return;
 if(target.closest('[data-home]')){location.hash='#/';return;}
 const toy=target.closest('[data-toy]');if(toy){location.hash='#/toy/'+toy.dataset.toy;return;}
 if(target.closest('[data-reset]')&&currentToy){states[currentToy]=initialState(currentToy);save();showToy(currentToy);return;}
 if(target.closest('[data-adult]')){grownUps();return;}
 if(target.closest('[data-close]')){target.closest('dialog')?.close();return;}
 if(target.closest('[data-install]')){
  if(installPrompt){installPrompt.prompt();installPrompt=null;document.querySelector('#install-button')?.classList.remove('available');}
  else dialog('<h2>Keep your playroom handy</h2><p>On an iPhone or iPad, open the Share menu in Safari and choose Add to Home Screen. On Android, use your browser menu and choose Install app or Add to Home screen.</p><p>Wait for Ready offline before disconnecting from the internet.</p>');
  return;
 }
 const control=target.closest('[data-act]');if(control&&currentToy){if(control.closest('[data-slider]')&&performance.now()<sliderIgnoreClickUntil)return;handleAction(control.dataset.act);}
});
document.addEventListener('keydown',ev=>{
 if(ev.key==='Escape'&&!document.querySelector('dialog[open]')&&currentToy){location.hash='#/';return;}
 const slider=ev.target instanceof Element?ev.target.closest('svg [data-slider]'):null;
 if(slider&&currentToy==='busy-board'&&['ArrowLeft','ArrowRight'].includes(ev.key)){
  ev.preventDefault();
  const i=Number(slider.dataset.slider),st=loadState('busy-board');
  st.sliders[i]=Math.max(0,Math.min(1,Math.round((st.sliders[i]+(ev.key==='ArrowRight'?.1:-.1))*10)/10));
  save();updateStage();return;
 }
 const drag=ev.target instanceof Element?ev.target.closest('svg [data-drag]'):null;
 if(!drag&&currentToy==='busy-book'&&ev.target instanceof Element&&ev.target.closest('svg')&&['ArrowLeft','ArrowRight'].includes(ev.key)){
  ev.preventDefault();handleAction(ev.key==='ArrowRight'?'next':'prev');return;
 }
 if(drag&&currentToy==='geometry'&&(ev.key==='Enter'||ev.key===' ')){ev.preventDefault();handleAction('select:'+drag.dataset.drag.split(':')[1]);return;}
 if(drag&&currentToy&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(ev.key)){
  ev.preventDefault();
  const [x,y]=((drag.getAttribute('transform')||'').match(/translate\(([-\d.]+)[ ,]([\d.]+)\)/)||[]).slice(1).map(Number);
  const dx=ev.key==='ArrowRight'?20:ev.key==='ArrowLeft'?-20:0,dy=ev.key==='ArrowDown'?20:ev.key==='ArrowUp'?-20:0;
  if(Number.isFinite(x)&&Number.isFinite(y)){const p=isPortraitPlay()?portraitDragToModel(currentToy,{x:x+dx,y:y+dy}):{x:x+dx,y:y+dy};if(moveDrag(currentToy,loadState(currentToy),drag.dataset.drag,p.x,p.y,isPortraitPlay()?'portrait':'wide')){save();updateStage();}}
 }
 const control=ev.target instanceof Element?ev.target.closest('svg [data-act]'):null;
 if(control&&(ev.key==='Enter'||ev.key===' ')){ev.preventDefault();handleAction(control.dataset.act);}
});
window.addEventListener('hashchange',route);
let currentLayout='';
function responsiveStage(){
 if(!currentToy||gestures.size)return;
 const stage=app.querySelector('[data-stage]');if(!stage)return;
 const layout=isPortraitPlay()?'portrait':'landscape',scene=buildScene(currentToy);
 const changed=stage.dataset.layout!==layout||stage.getAttribute('viewBox')!==scene.viewBox;
 stage.setAttribute('viewBox',scene.viewBox);
 stage.setAttribute('preserveAspectRatio','xMidYMid meet');
 stage.dataset.offsetX=String(scene.offsetX||0);stage.dataset.offsetY=String(scene.offsetY||0);
 app.querySelector('.game-shell')?.classList.toggle('rich-wide',layout==='landscape'&&richWideIds.has(currentToy));
 if(changed){stage.dataset.layout=layout;replaceKeepingFocus(stage,scene.art);}
}
window.addEventListener('resize',responsiveStage);
window.visualViewport?.addEventListener('resize',responsiveStage);
window.addEventListener('beforeinstallprompt',ev=>{ev.preventDefault();installPrompt=ev;document.querySelector('#install-button')?.classList.add('available');});
window.addEventListener('appinstalled',()=>{installPrompt=null;document.querySelector('#install-button')?.classList.remove('available');});
// The marble uses frame time and one persistent SVG element. Replacing the whole
// scene every 350ms makes it jump, especially on tall portrait screens.
let marbleFrameTime=0,marbleLastSave=0;
const MARBLE_STEPS=140,MARBLE_GAP=14,MARBLE_RATE=18;
function animateMarble(now){
 const dt=marbleFrameTime?Math.min(64,now-marbleFrameTime):0;
 marbleFrameTime=now;
 if(currentToy==='marble-machine'&&!gestures.size){
  const state=loadState('marble-machine');
  if(state.running&&dt)state.marble=(state.marble+dt*MARBLE_RATE/1000)%(MARBLE_STEPS+MARBLE_GAP);
  const stage=app.querySelector('[data-stage]'),ball=stage?.querySelector('[data-marble-ball]');
  if(ball){
   if(state.marble>=MARBLE_STEPS)ball.setAttribute('visibility','hidden');
   else{
    ball.removeAttribute('visibility');
    const position=marblePosition(state.marble,isPortraitPlay()?'portrait':'landscape');
    ball.setAttribute('transform',`translate(${position.x.toFixed(2)} ${position.y.toFixed(2)})`);
   }
  }
  if(state.running&&now-marbleLastSave>1800){save();marbleLastSave=now;}
 }
 requestAnimationFrame(animateMarble);
}
requestAnimationFrame(animateMarble);
setInterval(()=>{
 if(!currentToy||currentToy==='marble-machine'||gestures.size||preferences.reducedMotion&&['shapes'].includes(currentToy))return;
 const st=loadState(currentToy),notes=tickToy(currentToy,st);
 if(notes!==null){if(notes.length&&preferences.sound)notes.forEach((f,i)=>setTimeout(()=>sound(f,.18),i*65));updateStage();}
},350);
route();prepareOffline();
