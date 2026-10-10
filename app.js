import {toys,ids,toyById,initialState,renderToy,interact,moveDrag,tickToy,C} from './toys.js';

const KEY='poklike-state-v1', PREF='poklike-prefs-v1';
const app=document.querySelector('#app');
const icon=(kind)=>({back:'<path d="M19 12H5m0 0 7-7m-7 7 7 7"/>',reset:'<path d="M4 11a8 8 0 1 1 2 6m-2 2v-7h7"/>',adult:'<path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v5l3 2"/>',sound:'<path d="M4 9v6h4l5 4V5L8 9H4Zm12 0a4 4 0 0 1 0 6"/>'}[kind]||'');
const svgIcon=kind=>`<svg viewBox="0 0 24 24" role="img" aria-hidden="true">${icon(kind)}</svg>`;
const escapeHtml=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const savedRead=key=>{try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}};
const states=Object.create(null);
const savedStates=savedRead(KEY);
const preferences={sound:true,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,...(savedRead(PREF)||{})};
preferences.sound=preferences.sound!==false;
preferences.reducedMotion=preferences.reducedMotion===true;
let offline={phase:'loading',message:'Preparing offline play…'};
let currentToy=null,dragging=null,ctx=null,installPrompt=null,visited=new Set();
const safeId=id=>ids.has(id)?id:null;
const boundedNumber=(value,fallback,min=-9999,max=9999)=>typeof value==='number'&&Number.isFinite(value)?Math.max(min,Math.min(max,value)):fallback;
function sanitized(id,input){
 const template=initialState(id),s={...template};
 if(!input||typeof input!=='object'||Array.isArray(input))return s;
 for(const [key,fallback]of Object.entries(template)){
  const val=input[key];
  if(typeof fallback==='number')s[key]=boundedNumber(val,fallback,key==='number'?1:0,key==='number'?12:10000);
  else if(typeof fallback==='boolean')s[key]=typeof val==='boolean'?val:fallback;
  else if(typeof fallback==='string')s[key]=typeof val==='string'?val.slice(0,50):fallback;
  else if(Array.isArray(fallback)){
   if(!Array.isArray(val))continue;
   if(key==='strokes')s.strokes=val.slice(-150).map(line=>({c:boundedNumber(line?.c,0,0,5),w:boundedNumber(line?.w,9,1,40),points:Array.isArray(line?.points)?line.points.slice(0,1500).filter(p=>Array.isArray(p)&&p.length===2).map(p=>[boundedNumber(p[0],0,0,960),boundedNumber(p[1],0,0,600)]):[]}));
   else if(key==='basket'||key==='touched')s[key]=val.slice(-35).filter(x=>typeof x==='string').map(x=>x.replace(/[^0-9:]/g,'').slice(0,12));
   else if(key==='ingredients')s[key]=val.slice(-35).map(x=>boundedNumber(x,0,0,4));
   else if(key==='steps')s.steps=template.steps.map((row,i)=>row.map((v,j)=>val[i]?.[j]===true));
   else if(key==='switches'||key==='valves')s[key]=fallback.map((v,i)=>typeof val[i]==='boolean'?val[i]:v);
   else if(key==='commands'||key==='sliders'||key==='dials')s[key]=fallback.map((v,i)=>boundedNumber(val[i],v,0,key==='sliders'?1:5));
   else s[key]=val.slice(0,key==='blocks'?18:12).map((item,i)=>{
    if(!item||typeof item!=='object')return fallback[i]||{x:480,y:300};
    return Object.fromEntries(Object.entries(item).filter(([k,v])=>['x','y','c'].includes(k)).map(([k,v])=>[k,boundedNumber(v,0,0,k==='x'?960:k==='y'?600:5)]));
   });
  }
  else if(fallback&&typeof fallback==='object')s[key]={x:boundedNumber(val?.x,fallback.x,0,960),y:boundedNumber(val?.y,fallback.y,0,600)};
 }
 return s;
}
for(const id of ids)states[id]=sanitized(id,savedStates?.[id]);
function loadState(id){
 if(!states[id])states[id]=initialState(id);
 return states[id];
}
function save(){
 try{localStorage.setItem(KEY,JSON.stringify(states));localStorage.setItem(PREF,JSON.stringify(preferences));return true;}
 catch(error){console.warn('Local save unavailable:',error);return false;}
}
function setMotion(){document.body.dataset.reduced=String(preferences.reducedMotion);}
setMotion();
function status(){return `<span class="connection-status ${offline.phase==='ready'?'ready':offline.phase==='error'?'error':''}" role="status" aria-live="polite">${escapeHtml(offline.message)}</span>`;}
function brand(){return `<span class="brand-symbol" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>Poklike`;}
function refreshStatus(){document.querySelectorAll('.connection-status').forEach(el=>{el.textContent=offline.message;el.className='connection-status '+(offline.phase==='ready'?'ready':offline.phase==='error'?'error':'');});}
function gallery(){
 currentToy=null;dragging=null;document.title='Poklike — A little world of play';
 app.innerHTML=`<main class="shell">
 <header class="topbar"><a class="brand" href="#/" aria-label="Poklike home">${brand()}</a><div class="toolbar-actions">${status()}<button class="icon-button" data-adult aria-label="Grown-ups area">${svgIcon('adult')}</button></div></header>
 <section class="hero" aria-label="Welcome"><div class="hero-copy"><h1>Little worlds,<br><em>big wonder.</em></h1><p>A cozy collection of tiny adventures. Make music, build anything, draw a new world and follow your curiosity. There's no right way to play.</p></div><div class="hero-display" aria-hidden="true"><div class="disk"></div><div class="cone"></div><div class="block"></div><div class="dot"></div></div></section>
 <section aria-labelledby="collection-title"><div class="collection-heading"><h2 id="collection-title">Choose something to explore</h2><span>${toys.length} little adventures</span></div>
 <div class="toys-grid">${toys.map((toy,i)=>{
  const {art}=renderToy(toy.id,loadState(toy.id));
  return `<button class="toy-card ${i===0?'featured':''}" style="--accent:${toy.color}" data-toy="${toy.id}" aria-label="Play ${escapeHtml(toy.title)}">
   <span class="toy-preview" aria-hidden="true"><svg viewBox="0 0 960 600" preserveAspectRatio="xMidYMid slice">${art}</svg></span>
   <span class="toy-description"><span class="toy-name">${escapeHtml(toy.title)}</span><span class="toy-tagline">${escapeHtml(toy.tagline)}</span></span>
  </button>`;
 }).join('')}</div></section>
 <footer class="home-footer"><span class="disclaimer">Made as an independent, free, original playroom. No ads, accounts, tracking or network needed once the app says it's ready offline.</span><div><button class="plain-button" data-adult>Grown-ups & settings</button><button id="install-button" class="plain-button ${installPrompt?'available':''}" data-install>Install on this device</button></div></footer>
 </main>`;
}
function stageMarkup(id){return `<svg class="toy-canvas" data-stage="${id}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600" preserveAspectRatio="xMidYMid meet" aria-label="Interactive ${escapeHtml(toyById(id).title)} play area" role="group">${renderToy(id,loadState(id)).art}</svg>`;}
function showToy(id){
 id=safeId(id);if(!id){location.hash='#/';return;}
 currentToy=id;dragging=null;visited.add(id);
 const toy=toyById(id),st=loadState(id),scene=renderToy(id,st);
 document.title=toy.title+' — Poklike';
 app.innerHTML=`<main class="game-shell">
  <header class="game-header"><button class="home-link" data-home aria-label="Return to all toys">${svgIcon('back')}<span>All toys</span></button><div class="game-heading"><h1>${escapeHtml(toy.title)}</h1><p>${escapeHtml(toy.tagline)}</p></div><button class="game-reset" data-reset aria-label="Reset this toy">${svgIcon('reset')}<span>Start fresh</span></button></header>
  <section class="game-content"><div class="stage-wrap">${stageMarkup(id)}</div><div class="play-controls" aria-label="${escapeHtml(toy.title)} tools">${scene.tools.map(t=>`<button class="play-control" data-act="${escapeHtml(t.act)}">${escapeHtml(t.label)}</button>`).join('')}</div><p class="game-help">${escapeHtml(scene.hint)}</p><p class="rotate-hint">On a small phone, try turning sideways for a bigger play space.</p></section>
 </main>`;
 const stage=app.querySelector('[data-stage]');
 stage.addEventListener('pointerdown',pointerDown);
 stage.addEventListener('pointermove',pointerMove);
 stage.addEventListener('pointerup',pointerUp);
 stage.addEventListener('pointercancel',pointerUp);
}
function updateStage(){if(!currentToy||dragging)return;const svg=app.querySelector('[data-stage]');if(svg)svg.innerHTML=renderToy(currentToy,loadState(currentToy)).art;}
function handleAction(action){
 if(!currentToy)return;
 const st=loadState(currentToy);interact(currentToy,st,action);
 if(preferences.sound)sound(180+(st.turn%6)*43, .095);
 save();
 const scene=renderToy(currentToy,st);
 updateStage();
 const controls=app.querySelector('.play-controls');
 if(controls)controls.innerHTML=scene.tools.map(t=>`<button class="play-control" data-act="${escapeHtml(t.act)}">${escapeHtml(t.label)}</button>`).join('');
}
function point(ev,svg){const pt=svg.createSVGPoint();pt.x=ev.clientX;pt.y=ev.clientY;const ctm=svg.getScreenCTM();if(!ctm)return {x:0,y:0};const p=pt.matrixTransform(ctm.inverse());return {x:p.x,y:p.y};}
function pointerDown(ev){
 if(!currentToy||dragging)return;
 const svg=ev.currentTarget,at=point(ev,svg),target=ev.target instanceof Element?ev.target:null;
 const movable=target?.closest('[data-drag]');
 if(movable){
  const trans=movable.getAttribute('transform')||'';const match=trans.match(/translate\(([-\d.]+)[ ,]([-\d.]+)\)/);
  const x=Number(match?.[1]||0),y=Number(match?.[2]||0);
  dragging={kind:'move',key:movable.dataset.drag,element:movable,origin:at,offset:{x:x-at.x,y:y-at.y},x,y,moved:false,id:ev.pointerId};
  try{svg.setPointerCapture(ev.pointerId);}catch{}ev.preventDefault();return;
 }
 if(currentToy==='drawing'&&!target?.closest('[data-act]')&&at.y<478&&at.y>35&&at.x>60&&at.x<900){
  const st=loadState('drawing');
  if(st.strokes.length>=150)st.strokes.shift();
  const line={c:st.color,w:st.width,points:[[at.x,at.y]]};st.strokes.push(line);
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('fill','none');path.setAttribute('stroke',([C.coral,C.sun,C.teal,C.blue,C.plum,C.leaf])[st.color]);path.setAttribute('stroke-width',String(st.width));path.setAttribute('stroke-linejoin','round');path.setAttribute('stroke-linecap','round');svg.appendChild(path);
  dragging={kind:'draw',line,path,id:ev.pointerId,moved:false};
  try{svg.setPointerCapture(ev.pointerId);}catch{}ev.preventDefault();
 }
}
function pointerMove(ev){
 if(!dragging||ev.pointerId!==dragging.id)return;
 const svg=ev.currentTarget,at=point(ev,svg);
 if(dragging.kind==='draw'){
  const line=dragging.line;if(line.points.length<1500&&at.x>=60&&at.x<=900&&at.y>=35&&at.y<=478){line.points.push([at.x,at.y]);dragging.moved=true;dragging.path.setAttribute('d',line.points.map((p,i)=>`${i?'L':'M'}${p[0]} ${p[1]}`).join(' '));}
 }else{
  dragging.x=Math.max(60,Math.min(885,at.x+dragging.offset.x));dragging.y=Math.max(85,Math.min(520,at.y+dragging.offset.y));
  if(Math.hypot(at.x-dragging.origin.x,at.y-dragging.origin.y)>6)dragging.moved=true;
  dragging.element.setAttribute('transform',`translate(${dragging.x} ${dragging.y})`);
 }ev.preventDefault();
}
function pointerUp(ev){
 if(!dragging||ev.pointerId!==dragging.id)return;
 const d=dragging;dragging=null;
 if(d.kind==='move'){moveDrag(currentToy,loadState(currentToy),d.key,d.x,d.y);if(preferences.sound)sound(245+((d.key.length*41)%340),.13);}
 else if(d.kind==='draw'&&d.line.points.length===1)d.line.points.push([d.line.points[0][0]+.5,d.line.points[0][1]+.5]);
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
 document.body.appendChild(modal);modal.addEventListener('close',()=>modal.remove());modal.showModal();return modal;
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
 <div class="button-row"><button class="secondary-button" id="export-save">Save a backup</button><label class="secondary-button" for="import-save" role="button" tabindex="0">Restore a backup</label><input type="file" id="import-save" accept="application/json,.json" hidden /></div>
 <p class="notice">${escapeHtml(offline.message)}. ${offline.phase==='ready'?'After the initial download all 25 toys can reopen without a connection.':'Open over HTTPS or localhost, keep this page open until it reports offline readiness.'} Browser storage can be erased by the device or browser.</p>
 <div class="danger-zone"><strong>Start the whole playroom fresh</strong><label class="field">Type CLEAR to remove saved creations on this device<input id="clear-confirm" placeholder="CLEAR" autocomplete="off" /></label><button class="danger" id="clear-all" disabled>Erase saved play</button></div>
 <p class="dialog-error" id="settings-message" role="status"></p>`);
 modal.querySelector('#setting-sound').addEventListener('change',e=>{preferences.sound=e.target.checked;save();});
 modal.querySelector('#setting-motion').addEventListener('change',e=>{preferences.reducedMotion=e.target.checked;setMotion();save();});
 modal.querySelector('#export-save').addEventListener('click',()=>{
  const payload={format:'poklike-backup-1',saved:new Date().toISOString(),preferences,states};
  const url=URL.createObjectURL(new Blob([JSON.stringify(payload)],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download='poklike-playroom-backup.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
  modal.querySelector('#settings-message').textContent='Backup downloaded to this device.';
 });
 modal.querySelector('#import-save').addEventListener('change',async(e)=>{
  const file=e.target.files?.[0];if(!file)return;
  if(file.size>250000){modal.querySelector('#settings-message').textContent='This backup is too large.';return;}
  try{
   const json=JSON.parse(await file.text());if(json.format!=='poklike-backup-1'||typeof json.states!=='object')throw new Error('Invalid backup');
   for(const id of ids)if(id in json.states)states[id]=sanitized(id,json.states[id]);
   preferences.sound=json.preferences?.sound!==false;preferences.reducedMotion=json.preferences?.reducedMotion===true;
   setMotion();save();modal.querySelector('#settings-message').textContent='Backup restored. Reopen a toy to see its saved state.';
  }catch{modal.querySelector('#settings-message').textContent='Could not read this backup. Please select a Poklike backup file.';}
 });
 const input=modal.querySelector('#clear-confirm'),clear=modal.querySelector('#clear-all');
 input.addEventListener('input',()=>{clear.disabled=input.value!=='CLEAR';});
 clear.addEventListener('click',()=>{for(const id of Object.keys(states))delete states[id];save();modal.querySelector('#settings-message').textContent='Saved play was erased on this device.';input.value='';clear.disabled=true;});
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
 const control=target.closest('[data-act]');if(control&&currentToy){handleAction(control.dataset.act);}
});
document.addEventListener('keydown',ev=>{
 if(ev.key==='Escape'&&!document.querySelector('dialog[open]')&&currentToy){location.hash='#/';return;}
 const drag=ev.target instanceof Element?ev.target.closest('svg [data-drag]'):null;
 if(drag&&currentToy&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(ev.key)){
  ev.preventDefault();
  const [x,y]=((drag.getAttribute('transform')||'').match(/translate\(([-\d.]+)[ ,]([\d.]+)\)/)||[]).slice(1).map(Number);
  const dx=ev.key==='ArrowRight'?20:ev.key==='ArrowLeft'?-20:0,dy=ev.key==='ArrowDown'?20:ev.key==='ArrowUp'?-20:0;
  if(Number.isFinite(x)&&Number.isFinite(y)&&moveDrag(currentToy,loadState(currentToy),drag.dataset.drag,x+dx,y+dy)){save();updateStage();}
 }
 const control=ev.target instanceof Element?ev.target.closest('svg [data-act]'):null;
 if(control&&(ev.key==='Enter'||ev.key===' ')){ev.preventDefault();handleAction(control.dataset.act);}
});
window.addEventListener('hashchange',route);
window.addEventListener('beforeinstallprompt',ev=>{ev.preventDefault();installPrompt=ev;document.querySelector('#install-button')?.classList.add('available');});
window.addEventListener('appinstalled',()=>{installPrompt=null;document.querySelector('#install-button')?.classList.remove('available');});
setInterval(()=>{
 if(!currentToy||dragging||preferences.reducedMotion&&['shapes'].includes(currentToy))return;
 const st=loadState(currentToy),notes=tickToy(currentToy,st);
 if(notes!==null){if(notes.length&&preferences.sound)notes.forEach((f,i)=>setTimeout(()=>sound(f,.18),i*65));updateStage();}
},350);
route();prepareOffline();
