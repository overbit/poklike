// Dependency-free Chrome DevTools Protocol smoke and offline e2e suite.
// Run: node tests/browser.mjs (requires Chromium and Python 3).
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {setTimeout as wait} from 'node:timers/promises';
import net from 'node:net';
import {toys} from '../toys.js';

const root=resolve(import.meta.dirname,'..');
const basePath=process.env.POKLIKE_BASE_PATH==='/poklike/'?'/poklike/':'/';
const artifacts=resolve(root,'test-artifacts');mkdirSync(artifacts,{recursive:true});
let assertions=0,failures=0;
const verify=(condition,message)=>{assert.ok(condition,message);assertions++;process.stdout.write('PASS '+message+'\n');};
const freePort=()=>new Promise((resolve,reject)=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const port=s.address().port;s.close(()=>resolve(port));});s.on('error',reject);});
const retry=async(fn,n=80)=>{let last;for(let i=0;i<n;i++){try{return await fn();}catch(e){last=e;await wait(120);}}throw last;};
let server,chrome,ws,tmp,requests=[],errors=[],pending=new Map(),nextId=1;
function terminateChrome(){
 if(!chrome?.pid)return;
 try{process.kill(-chrome.pid,'SIGKILL');}
 catch{try{chrome.kill('SIGKILL');}catch{}}
}

function send(method,params={}){return new Promise((resolve,reject)=>{const id=nextId++;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));setTimeout(()=>{const p=pending.get(id);if(p){pending.delete(id);reject(new Error('CDP timeout: '+method));}},12000).unref();});}
async function evaluate(expression){const output=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});if(output.exceptionDetails)throw Error(output.exceptionDetails.text+' : '+output.exceptionDetails.exception?.description);return output.result?.value;}
async function until(expression,message,tries=80){for(let i=0;i<tries;i++){try{if(await evaluate(expression))return true;}catch{}await wait(120);}console.error('DEBUG timeout',message, 'body=',await evaluate('document.body?.innerText?.slice(0,800)').catch(()=>'<unavailable>'), 'errors=',errors, '5xx=',requests);throw Error('Timeout: '+message);}
async function snapshot(name){const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});writeFileSync(join(artifacts,name+'.png'),Buffer.from(shot.data,'base64'));}
function mouse(type,x,y,buttons=0){return send('Input.dispatchMouseEvent',{type,x,y,button:type==='mouseMoved'?'none':'left',buttons,clickCount:1});}
async function start(){
 const port=await freePort();tmp=mkdtempSync(join(tmpdir(),'poklike-browser-'));
 server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',basePath==='/'?root:resolve(root,'..')],{stdio:'ignore'});
 let pages=null;const launchErrors=[];
 // GitHub-hosted Chromium occasionally fails to bind CDP on its first launch.
 // Every retry gets a new isolated profile, process group, and debugging port.
 for(let attempt=0;attempt<3;attempt++){
  const remote=await freePort();
  let stderr='';
  chrome=spawn(process.env.CHROMIUM||'/usr/bin/chromium',['--headless=new','--no-sandbox','--no-zygote','--disable-gpu','--disable-extensions','--disable-background-networking','--disable-dev-shm-usage','--no-first-run','--no-default-browser-check','--remote-allow-origins=*',`--remote-debugging-port=${remote}`,`--user-data-dir=${join(tmp,'chrome-'+attempt)}`,'--window-size=1280,900','about:blank'],{stdio:['ignore','ignore','pipe'],detached:true});
  chrome.stderr?.on('data',data=>{stderr=(stderr+data.toString()).slice(-2400);});
  try{
   pages=await retry(async()=>{
    const response=await fetch('http://127.0.0.1:'+remote+'/json');
    if(!response.ok)throw Error('CDP status '+response.status);
    const json=await response.json();
    if(!json.some(page=>page.type==='page'&&page.webSocketDebuggerUrl))throw Error('No CDP page');
    return json;
   },65);
   break;
  }catch(error){
   launchErrors.push('Attempt '+(attempt+1)+': '+String(error)+' '+stderr);
   terminateChrome();chrome=null;
   await wait(300);
  }
 }
 if(!pages)throw Error('Chromium startup failed: '+launchErrors.join(' | '));
 const page=pages.find(p=>p.type==='page');assert.ok(page?.webSocketDebuggerUrl);
 ws=new WebSocket(page.webSocketDebuggerUrl);
 await new Promise((res,rej)=>{ws.addEventListener('open',res,{once:true});ws.addEventListener('error',rej,{once:true});});
 ws.addEventListener('message',evt=>{
  const msg=JSON.parse(evt.data);
  if(msg.id){const p=pending.get(msg.id);if(p){pending.delete(msg.id);msg.error?p.reject(Error(msg.error.message)):p.resolve(msg.result);}return;}
  if(msg.method==='Runtime.exceptionThrown')errors.push(msg.params.exceptionDetails?.text||'uncaught exception');
  if(msg.method==='Network.responseReceived'&&msg.params.response?.status>=500)requests.push(msg.params.response.url+' '+msg.params.response.status);
 });
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable');
 await send('Page.navigate',{url:'http://127.0.0.1:'+port+basePath});
 await until(`document.querySelectorAll('[data-toy]').length===25`,'gallery visible');
}
async function run(){
 await start();
 verify(await evaluate(`document.querySelectorAll('[data-toy]').length===25`),'25 toys available from the collection');
 verify(await evaluate(`location.pathname===${JSON.stringify(basePath)}`),'site opens at expected base path');
 await until(`document.querySelector('.connection-status')?.textContent.includes('Ready offline')`,'offline status',100);
 const status=await evaluate(`document.querySelector('.connection-status').textContent.trim()`);
 verify(status==='Ready offline','offline status is confirmed by service worker');
 const cached=await evaluate(`(async()=>{const c=await caches.open('poklike-v10');return (await c.keys()).length})()`);
 verify(cached>=13,'all original and responsive assets are precached');
 verify(await evaluate(`document.querySelector('.toy-card.featured svg')?.querySelectorAll('path[stroke]').length>=5`),'empty Drawing gallery thumbnail shows original sample artwork without saving');
 await snapshot('collection-desktop');
 for(const toy of toys){
  await evaluate(`location.hash='#/toy/${toy.id}'`);
  await until(`document.querySelector('[data-stage]')?.dataset.stage==='${toy.id}'`,'scene '+toy.id);
  const details=await evaluate(`(()=>{const a=document.querySelector('[data-stage]');return {elements:a.children.length,actions:a.querySelectorAll('[data-act],[data-drag]').length,title:document.querySelector('.game-heading h1').textContent}})()`);
  verify(details.actions>0&&details.title===toy.title,`${toy.title} scene and interactive targets render`);
  const acted=await evaluate(`(()=>{const b=document.querySelector('.play-controls [data-act]')||document.querySelector('.toy-canvas [data-act]');if(!b)return false;if(typeof b.click==='function')b.click();else b.dispatchEvent(new MouseEvent('click',{bubbles:true}));return true;})()`);
  verify(acted,`${toy.title} accepts a visible action`);
 }
 // Back to collection and test drawing with real CDP pointer input.
 await evaluate(`location.hash='#/toy/drawing'`);
 await until(`document.querySelector('[data-stage]')?.dataset.stage==='drawing'`,'drawing available');
 const coords=await evaluate(`(()=>{const el=document.querySelector('[data-stage]');const p=el.createSVGPoint();p.x=360;p.y=230;const a=p.matrixTransform(el.getScreenCTM());p.x=480;p.y=280;const b=p.matrixTransform(el.getScreenCTM());return {a:{x:a.x,y:a.y},b:{x:b.x,y:b.y}}})()`);
 await mouse('mouseMoved',coords.a.x,coords.a.y);await mouse('mousePressed',coords.a.x,coords.a.y,1);
 for(let i=1;i<=5;i++)await mouse('mouseMoved',coords.a.x+(coords.b.x-coords.a.x)*i/5,coords.a.y+(coords.b.y-coords.a.y)*i/5,1);
 await mouse('mouseReleased',coords.b.x,coords.b.y);
 const strokes=await evaluate(`JSON.parse(localStorage.getItem('poklike-state-v1')).drawing.strokes.length`);
 verify(strokes>=1,'real pointer drag creates a saved drawing');
 await snapshot('drawing-desktop');
 await send('Page.reload');
 await until(`document.querySelector('[data-stage]')?.dataset.stage==='drawing'`,'reload drawing deep link');
 await evaluate(`location.hash='#/toy/drawing'`);await until(`document.querySelector('[data-stage]')?.dataset.stage==='drawing'`,'saved drawing');
 verify(await evaluate(`document.querySelector('[data-stage]').querySelectorAll('path[stroke]').length>0 && JSON.parse(localStorage.getItem('poklike-state-v1')).drawing.strokes.length>0`),'drawing survives a full page reload');
 await evaluate(`document.querySelector('[data-reset]').click()`);
 verify(await evaluate(`JSON.parse(localStorage.getItem('poklike-state-v1')).drawing.strokes.length===0`),'reset clears the current creation');
 // Adult gate: incorrect answer must fail before settings unlocks.
 await evaluate(`location.hash='#/'`);await until(`document.querySelector('[data-adult]')!==null`,'return to collection');
 await evaluate(`document.querySelector('[data-adult]').click()`);
 await until(`document.querySelector('#grown-up-check')!==null`,'adult gate');
 verify(await evaluate(`document.querySelector('#grown-up-check')!==null`),'adult gate protects settings');
 await evaluate(`document.querySelector('#grown-up-check input').value='0';document.querySelector('#grown-up-check').requestSubmit()`);
 verify(await evaluate(`!!document.querySelector('#gate-error').textContent`),'incorrect adult answer is rejected');
 await evaluate(`(()=>{const t=document.querySelector('#grown-up-check label').textContent;const m=t.match(/([0-9]+) [+] ([0-9]+)/);document.querySelector('#grown-up-check input').value=Number(m[1])+Number(m[2]);document.querySelector('#grown-up-check').requestSubmit()})()`);
 await until(`document.querySelector('#setting-sound')!==null`,'settings unlock');
 verify(await evaluate(`document.querySelector('#setting-motion')!==null`),'adult settings are usable');
 await evaluate(`(()=>{const c=document.querySelector('#setting-sound');c.checked=false;c.dispatchEvent(new Event('change',{bubbles:true}));})()`);
 verify(await evaluate(`JSON.parse(localStorage.getItem('poklike-prefs-v1')).sound===false`),'parent sound preference persists');
 await evaluate(`document.querySelector('[data-close]').click()`);
 // Verify full offline reopen *after* initial installation.
 await evaluate(`location.hash='#/'`);await until(`document.querySelectorAll('[data-toy]').length===25`,'gallery before offline');
 await send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
 await send('Page.reload');await until(`document.querySelectorAll('[data-toy]').length===25`,'offline gallery',100);
 verify(await evaluate(`document.querySelectorAll('[data-toy]').length===25`),'collection opens with network disabled');
 for(const toy of toys){
  await evaluate(`location.hash='#/toy/${toy.id}'`);
  await until(`document.querySelector('[data-stage]')?.dataset.stage==='${toy.id}'`,'offline scene '+toy.id);
  verify(await evaluate(`document.querySelector('[data-stage]')?.querySelectorAll('[data-act],[data-drag]').length>0`),`${toy.title} opens offline`);
 }
 await evaluate(`location.hash='#/'`);await until(`document.querySelectorAll('[data-toy]').length===25`,'mobile collection');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await wait(450);await snapshot('collection-mobile');
 verify(await evaluate(`document.documentElement.scrollWidth<=innerWidth+2`),'mobile gallery has no horizontal overflow');
 await evaluate(`location.hash='#/toy/cooking'`);await until(`document.querySelector('[data-stage]')?.dataset.stage==='cooking'`,'mobile toy');
 await snapshot('toy-mobile');
 verify(await evaluate(`document.documentElement.scrollWidth<=innerWidth+2`),'mobile toy has no horizontal overflow');
 verify(await evaluate(`(()=>{const svg=document.querySelector('[data-stage]'),box=svg.getBoundingClientRect(),view=svg.viewBox.baseVal;return svg.dataset.layout==='portrait'&&Math.abs(view.width/view.height-box.width/box.height)<.004})()`),'portrait game uses a composed vertical scene');
 verify(await evaluate(`document.querySelector('.stage-wrap').getBoundingClientRect().height>=innerHeight*.98`),'portrait play takes the full viewport');
 verify(await evaluate(`getComputedStyle(document.querySelector('.play-controls')).display==='none'`),'portrait play does not cover toys with a toolbar');
 for(const toy of toys){
  await evaluate(`location.hash='#/toy/${toy.id}'`);
  await until(`document.querySelector('[data-stage]')?.dataset.stage==='${toy.id}'`,'portrait '+toy.id);
  const audit=await evaluate(`(()=>{const scene=document.querySelector('[data-stage]'),targets=[...scene.querySelectorAll('[data-act],[data-drag]')];const box=scene.getBoundingClientRect(),view=scene.viewBox.baseVal;return {ratioOK:Math.abs(view.width/view.height-box.width/box.height)<.004,interactive:targets.length,inside:targets.some(el=>{const r=el.getBoundingClientRect();return r.width>=28&&r.height>=28&&r.x<innerWidth-20&&r.right>20&&r.y<innerHeight-50&&r.bottom>90})}})()`);
  verify(audit.ratioOK&&audit.interactive>0&&audit.inside,`${toy.title} portrait scene is interactive without horizontal camera controls`);
 }

 await evaluate(`location.hash='#/toy/marble-machine'`);
 await until(`document.querySelector('[data-stage]')?.dataset.stage==='marble-machine'`,'portrait marble machine');
 await evaluate(`document.querySelector('[data-reset]').click()`);
 verify(await evaluate(`JSON.parse(localStorage.getItem('poklike-state-v1'))['marble-machine'].running===true`),'marble starts running after resetting earlier test actions');
 const marbleStart=await evaluate(`(()=>{const e=document.querySelector('[data-marble-ball]');return e?.getAttribute('transform')})()`);
 await until(`document.querySelector('[data-marble-ball]')?.getAttribute('transform')!==${JSON.stringify(marbleStart)}`,'marble animation frame',35);
 const marbleNext=await evaluate(`document.querySelector('[data-marble-ball]')?.getAttribute('transform')`);
 verify(marbleStart!==marbleNext,'portrait marble animates independently of the coarse timer');
 const trackError=await evaluate(`(()=>{const s=document.querySelector('[data-stage]'),line=s.querySelector('[data-marble-track]'),ball=s.querySelector('[data-marble-ball]'),m=ball.transform.baseVal.consolidate().matrix;let best=1e6;for(let d=0;d<line.getTotalLength();d+=2){const p=line.getPointAtLength(d);best=Math.min(best,Math.hypot(p.x-m.e,p.y-m.f));}return best})()`);
 verify(trackError<3,'moving marble stays centered on its visible portrait track');
 await evaluate(`document.querySelector('[data-act="run"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))`);
 await wait(90);
 const marblePaused=await evaluate(`document.querySelector('[data-marble-ball]').getAttribute('transform')`);
 await wait(170);
 verify(await evaluate(`document.querySelector('[data-marble-ball]').getAttribute('transform')`)===marblePaused,'pause freezes rolling marble');
 await snapshot('marble-portrait');

 await evaluate(`location.hash='#/toy/cooking'`);
 await until(`document.querySelector('[data-stage]')?.dataset.stage==='cooking'`,'cooking portrait actions');
 const guests=await evaluate(`(()=>{const before=JSON.parse(localStorage.getItem('poklike-state-v1')).cooking;document.querySelector('[data-act="guest:1"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));const after=JSON.parse(localStorage.getItem('poklike-state-v1')).cooking;return after.guest===1})()`);
 verify(guests,'Cooking starts with interactive dinner guests');
 await evaluate(`document.querySelector('[data-act="scene"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))`);
 verify(await evaluate(`document.querySelector('[data-act="ingredient:1"]')!==null`),'Cooking kitchen has ingredients in the same viewport');
 const cooking=await evaluate(`(()=>{const before=JSON.parse(localStorage.getItem('poklike-state-v1')).cooking.ingredients.length;document.querySelector('[data-act="ingredient:1"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));const after=JSON.parse(localStorage.getItem('poklike-state-v1')).cooking.ingredients.length;return after===before+1})()`);
 verify(cooking,'tap ingredient changes real cooking state');
 await send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:true,screenOrientation:{type:'landscapePrimary',angle:90}});
 await wait(350);
 verify(await evaluate(`(()=>{const v=document.querySelector('[data-stage]').viewBox.baseVal;return v.width===960&&v.height<600})()`),'landscape switches to a non-distorted wide scene');
 verify(await evaluate(`document.querySelector('[data-stage] [data-act="scene"]')!==null`),'landscape Cooking retains guest/kitchen interactions');
 verify(await evaluate(`getComputedStyle(document.querySelector('.play-controls')).display==='none'`),'rich landscape toy does not cover the scene with generic tools');
 await snapshot('toy-landscape');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true,screenOrientation:{type:'portraitPrimary',angle:0}});
 await wait(320);
 verify(await evaluate(`(()=>{const svg=document.querySelector('[data-stage]'),box=svg.getBoundingClientRect(),view=svg.viewBox.baseVal;return svg.dataset.layout==='portrait'&&Math.abs(view.width/view.height-box.width/box.height)<.004})()`),'rotation returns to portrait without losing toy selection');
 await evaluate(`location.hash='#/toy/busy-book'`);await until(`document.querySelector('[data-stage]')?.dataset.stage==='busy-book'`,'busy book portrait');
 const book=await evaluate(`(()=>{
  const svg=document.querySelector('[data-stage]'),before=JSON.parse(localStorage.getItem('poklike-state-v1'))['busy-book'].page;
  svg.querySelector('[data-act="book:0"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));
  const touched=JSON.parse(localStorage.getItem('poklike-state-v1'))['busy-book'].touched.includes(before+':0');
  svg.dispatchEvent(new PointerEvent('pointerdown',{pointerId:303,clientX:310,clientY:460,bubbles:true}));
  svg.dispatchEvent(new PointerEvent('pointerup',{pointerId:303,clientX:90,clientY:460,bubbles:true}));
  const after=JSON.parse(localStorage.getItem('poklike-state-v1'))['busy-book'].page;
  return {touched,moved:after===(before+1)%5};
 })()`);
 verify(book.touched&&book.moved,'Busy Book taps illustrated objects and swipes between pages');
 await snapshot('busy-book-portrait');
  await evaluate(`location.hash='#/toy/busy-board'`);await until(`document.querySelector('[data-stage]')?.dataset.stage==='busy-board'`,'busy board portrait');
 const multiSlider=await evaluate(`(()=>{
  const svg=document.querySelector('[data-stage]'),p=svg.createSVGPoint(),world=(x,y)=>{p.x=x+Number(svg.dataset.offsetX||0);p.y=y+Number(svg.dataset.offsetY||0);const q=p.matrixTransform(svg.getScreenCTM());return [q.x,q.y]};
  const g0=svg.querySelector('[data-slider="0"]'),g1=svg.querySelector('[data-slider="1"]');
  const [ax,ay]=world(110,595),[bx,by]=world(110,673),[cx,cy]=world(394,595),[dx,dy]=world(350,673);
  const ptr=(el,type,id,x,y)=>el.dispatchEvent(new PointerEvent(type,{pointerId:id,clientX:x,clientY:y,bubbles:true,isPrimary:id===101}));
  ptr(g0,'pointerdown',101,ax,ay);ptr(g1,'pointerdown',102,bx,by);
  ptr(svg,'pointermove',101,cx,cy);ptr(svg,'pointermove',102,dx,dy);
  ptr(svg,'pointerup',101,cx,cy);ptr(svg,'pointerup',102,dx,dy);
  const val=JSON.parse(localStorage.getItem('poklike-state-v1'))['busy-board'].sliders;
  return val[0]>.8&&val[1]>.7;
 })()`);
 verify(multiSlider,'Busy Board sliders respond to two independent fingers');
 const linkedGear=await evaluate(`(()=>{
  const before=JSON.parse(localStorage.getItem('poklike-state-v1'))['busy-board'].dials;
  document.querySelector('[data-act="gear:0"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));
  const after=JSON.parse(localStorage.getItem('poklike-state-v1'))['busy-board'].dials;
  return after[0]===(before[0]+1)%4&&after[1]===(before[1]+3)%4;
 })()`);
 verify(linkedGear,'Busy Board gears spin together in opposite directions');
 await snapshot('busy-board-portrait');
 await evaluate(`location.hash='#/toy/world-puzzle'`);await until(`document.querySelector('[data-stage]')?.dataset.stage==='world-puzzle'`,'portrait puzzle');
 const snapped=await evaluate(`(()=>{
  const svg=document.querySelector('[data-stage]'),piece=svg.querySelector('[data-drag="tile:0"]'),transform=piece.getAttribute('transform');
  const match=transform.match(/translate\\(([-\\d.]+)[ ,]([-\\d.]+)\\)/);
  const ox=Number(svg.dataset.offsetX||0),oy=Number(svg.dataset.offsetY||0);
  const at=(x,y)=>{const p=svg.createSVGPoint();p.x=x+ox;p.y=y+oy;const q=p.matrixTransform(svg.getScreenCTM());return {x:q.x,y:q.y};};
  const start=at(Number(match[1]),Number(match[2])),end=at(122,303),id=331;
  piece.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:id,clientX:start.x,clientY:start.y}));
  svg.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerId:id,clientX:end.x,clientY:end.y}));
  svg.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:id,clientX:end.x,clientY:end.y}));
  const st=JSON.parse(localStorage.getItem('poklike-state-v1'))['world-puzzle'];
  const tile=svg.querySelector('[data-drag="tile:0"]')?.getAttribute('transform');
  return st.tiles[0].x===244&&st.tiles[0].y===151&&tile?.includes('122 ');
 })()`);
 verify(snapped,'puzzle piece visually snaps to a matching portrait board slot');
 const unobstructed=await evaluate(`(()=>{
  const svg=document.querySelector('[data-stage]'),shuffle=svg.querySelector('[data-act="shuffle"]'),tiles=[...svg.querySelectorAll('[data-drag^="tile:"]')];
  const a=shuffle.getBoundingClientRect();
  return tiles.every(tile=>{const b=tile.getBoundingClientRect();return b.top>a.bottom+10;});
 })()`);
 verify(unobstructed,'portrait puzzle staging tray does not cover its shuffle control');
 await snapshot('puzzle-portrait');
 await evaluate(`location.hash='#/toy/town'`);await until(`document.querySelector('[data-stage]')?.dataset.stage==='town'`,'portrait town');
 const visited=await evaluate(`(()=>{
  document.querySelector('[data-act="building:3"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));
  const s=JSON.parse(localStorage.getItem('poklike-state-v1')).town;
  return s.mode===3&&document.querySelector('[data-stage]').textContent.includes('Market');
 })()`);
 verify(visited,'Town buildings open distinct places by direct touch');
 await snapshot('town-portrait');
  for(const dims of [[320,568],[412,915]]){
  await send('Emulation.setDeviceMetricsOverride',{width:dims[0],height:dims[1],deviceScaleFactor:1,mobile:true,screenOrientation:{type:'portraitPrimary',angle:0}});
  await wait(140);
  verify(await evaluate(`(()=>{const stage=document.querySelector('[data-stage]'),rect=stage.getBoundingClientRect();return Math.abs(stage.viewBox.baseVal.width/stage.viewBox.baseVal.height-rect.width/rect.height)<.004&&rect.height>=innerHeight*.98&&document.documentElement.scrollWidth<=innerWidth+2})()`),`${dims[0]}px portrait keeps complete stage and no overflow`);
 }


 verify(errors.length===0,'browser produced no uncaught page exceptions: '+errors.join(','));
 verify(requests.length===0,'browser produced no 5xx responses: '+requests.join(','));
 process.stdout.write(`\nPASSED ${assertions} browser assertions, 25/25 online and 25/25 offline toy opens\n`);
}
try{await run();}catch(error){console.error('\nBROWSER TEST FAILURE',error);failures++;process.exitCode=1;}
finally{try{ws?.close();}catch{};try{server?.kill('SIGKILL');}catch{};terminateChrome();await wait(450);if(tmp)try{rmSync(tmp,{recursive:true,force:true,maxRetries:4,retryDelay:300});}catch{}}
