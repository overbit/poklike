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
let assertions=0,failures=0,server,chrome,ws,tmp,requests=[],errors=[],pending=new Map(),nextId=0,serverUrl;
function terminateChrome(){if(!chrome?.pid)return;try{process.kill(-chrome.pid,'SIGKILL');}catch{try{chrome.kill('SIGKILL');}catch{}}}
const verify=(condition,message)=>{
  assert.ok(condition,message);
  assertions++;
  process.stdout.write('PASS '+message+'\n');
};
const freePort=()=>new Promise((resolve,reject)=>{
  const s=net.createServer();
  s.listen(0,'127.0.0.1',()=>{const port=s.address().port;s.close(()=>resolve(port));});
  s.on('error',reject);
});
const retry=async(fn,n=80)=>{
  let last;
  for(let i=0;i<n;i++){
    try{return await fn();}catch(e){last=e;await wait(120);}}
  throw last;
};

function send(method,params={}){
  return new Promise((resolve,reject)=>{
    const id=++nextId;
    pending.set(id,{resolve,reject});
    ws.send(JSON.stringify({id,method,params}));
    setTimeout(()=>{const p=pending.get(id);if(p){pending.delete(id);reject(new Error('CDP timeout: '+method));}},12000).unref();
  });
}
async function evaluate(expression){
  const output=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});
  if(output.exceptionDetails)throw Error(output.exceptionDetails.text+' : '+output.exceptionDetails.exception?.description);
  return output.result?.value;
}
async function until(expression,message,tries=80){
  for(let i=0;i<tries;i++){
    try{if(await evaluate(expression))return true;}catch{}
    await wait(120);
  }
  console.error('DEBUG timeout',message, 'body=',await evaluate('document.body?.innerText?.slice(0,800)').catch(()=>'<unavailable>'), 'errors=',errors, '5xx=',requests);
  throw Error('Timeout: '+message);
}
function mouse(type,x,y,buttons=0){
  return send('Input.dispatchMouseEvent',{type,x,y,button:type==='mouseMoved'?'none':'left',buttons,clickCount:1});
}
const keyCodes={Enter:{code:'Enter',windowsKeyCode:13},Escape:{code:'Escape',windowsKeyCode:27}};
function keyDown(key){
  const meta=keyCodes[key]||{code:`Key${key}`,windowsKeyCode:key.charCodeAt(0)};
  return send('Input.dispatchKeyEvent',{type:'rawKeyDown',key,windowsKeyCode:meta.windowsKeyCode,code:meta.code});
}
function keyUp(key){
  const meta=keyCodes[key]||{code:`Key${key}`,windowsKeyCode:key.charCodeAt(0)};
  return send('Input.dispatchKeyEvent',{type:'keyUp',key,windowsKeyCode:meta.windowsKeyCode,code:meta.code});
}
async function start(){
  const port=await freePort();serverUrl='http://127.0.0.1:'+port+basePath;tmp=mkdtempSync(join(tmpdir(),'poklike-flows-'));
  server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',basePath==='/'?root:resolve(root,'..')],{stdio:'ignore'});
  let pages=null;const launchErrors=[];
  for(let attempt=0;attempt<3;attempt++){
    const remote=await freePort();
    let stderr='';
    chrome=spawn(process.env.CHROMIUM||'/usr/bin/chromium',['--headless=new','--no-sandbox','--no-zygote','--disable-gpu','--disable-extensions','--disable-background-networking','--disable-dev-shm-usage','--disable-first-run-ui','--no-default-browser-check','--remote-allow-origins=*',`--remote-debugging-port=${remote}`,`--user-data-dir=${join(tmp,'chrome-'+attempt)}`,'--window-size=1280,900','about:blank'],{stdio:['ignore','ignore','pipe'],detached:true});
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
async function importBackup(payload){
  const jsonStr=JSON.stringify(payload);
  const result=await send('Runtime.evaluate',{expression:`(()=>{const blob=new Blob([${JSON.stringify(jsonStr)}],{type:'application/json'});const dt=new DataTransfer();dt.items.add(new File([blob],'flow.json',{type:'application/json'}));document.querySelector('#import-save').files=dt.files;document.querySelector('#import-save').dispatchEvent(new Event('change',{bubbles:true}));return true})()`,returnByValue:true,userGesture:true});
  if(result.exceptionDetails)throw Error(result.exceptionDetails.text);
  await wait(80);
}
async function openSettings(){
  await evaluate(`location.hash='#/'`);await until(`document.querySelectorAll('[data-toy]').length===25`,'return to gallery');
  await evaluate(`document.querySelector('[data-adult]').click()`);await until(`document.querySelector('#grown-up-check')`,'adult gate visible');
  await evaluate(`(()=>{const text=document.querySelector('#grown-up-check label').textContent;const m=text.match(/([0-9]+) \\+ ([0-9]+)/);const input=document.querySelector('#grown-up-check input');input.value=Number(m[1])+Number(m[2]);document.querySelector('#grown-up-check').requestSubmit()})()`);
  await until(`document.querySelector('#profile-enabled')`,'profile settings unlocked');
}
async function run(){
  await start();
  // Profile is only editable after the adult gate, and is disabled by default.
  verify(await evaluate(`document.querySelector('[data-adult]')!==null`),'adult gate button present at collection');
  verify(await evaluate(`document.querySelector('#profile-enabled')===null`),'profile controls hidden before adult gate');
  verify(await evaluate(`!document.querySelector('[data-recommendation]')`),'no recommendation shelf by default');
  await openSettings();
  verify(await evaluate(`document.querySelector('#profile-enabled')!==null`),'profile editor appears after adult gate');
  await evaluate(`(()=>{document.querySelector('#profile-age').value='6-8';document.querySelector('#profile-age').dispatchEvent(new Event('change',{bubbles:true}));const music=document.querySelector('[data-interest="music"]');music.checked=true;music.dispatchEvent(new Event('change',{bubbles:true}));const enabled=document.querySelector('#profile-enabled');enabled.checked=true;enabled.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  await evaluate(`document.querySelector('[data-close]').click()`);
  await until(`document.querySelectorAll('[data-recommendation]').length===4`,'four recommendations after profile enable');
  const originalOrder=toys.map(x=>x.id);
  verify(JSON.stringify(await evaluate(`Array.from(document.querySelectorAll('[data-toy]'),e=>e.dataset.toy)`))===JSON.stringify(originalOrder),'25 original toys retain exact order with recommendations');
  // 4. Reload persists profile
  await send('Page.reload');
  await until(`document.querySelectorAll('[data-toy]').length===25`,'gallery after reload');
  await until(`document.querySelectorAll('[data-recommendation]').length===4`,'recommendations persisted after reload');
  verify(await evaluate(`document.querySelectorAll('[data-toy]').length===25`),'reload persists 25 toys');
  // Save a real drawing, then clear recommendations through the UI.
  await evaluate(`location.hash='#/toy/drawing'`);await until(`document.querySelector('[data-stage]')?.dataset.stage==='drawing'`,'drawing for clear-profile');
  const drawPoint=await evaluate(`(()=>{const el=document.querySelector('[data-stage]');const p=el.createSVGPoint();p.x=360;p.y=230;const a=p.matrixTransform(el.getScreenCTM());p.x=480;p.y=280;const b=p.matrixTransform(el.getScreenCTM());return {a:{x:a.x,y:a.y},b:{x:b.x,y:b.y}}})()`);
  await mouse('mouseMoved',drawPoint.a.x,drawPoint.a.y);await mouse('mousePressed',drawPoint.a.x,drawPoint.a.y,1);
  for(let i=1;i<=5;i++)await mouse('mouseMoved',drawPoint.a.x+(drawPoint.b.x-drawPoint.a.x)*i/5,drawPoint.a.y+(drawPoint.b.y-drawPoint.a.y)*i/5,1);
  await mouse('mouseReleased',drawPoint.b.x,drawPoint.b.y);
  verify(await evaluate(`JSON.parse(localStorage.getItem('poklike-state-v1')).drawing.strokes.length>=1`),'real pointer drag creates a saved drawing');
  await openSettings();
  await evaluate(`document.querySelector('#clear-profile').click()`);
  await evaluate(`document.querySelector('[data-close]').click()`);
  await until(`document.querySelectorAll('[data-recommendation]').length===0`,'recommendations cleared through UI');
  verify(await evaluate(`!document.querySelector('[data-recommendation]')`),'clear recommendations removes suggestions');
  verify(await evaluate(`JSON.parse(localStorage.getItem('poklike-state-v1')).drawing.strokes.length>=1`),'clear recommendations keeps saved drawing');
  // 6. JSON File upload through the real #import-save change handler.
  await openSettings();
  await importBackup({format:'poklike-backup-1',preferences:{sound:false},states:{drawing:{strokes:[]}},profile:{enabled:true,ageBand:'6-8',interests:['music']}});
  verify(await evaluate(`JSON.parse(localStorage.getItem('poklike-profile-v1')).ageBand==='6-8'`),'File upload handler restores profile');
  const beforeInvalid=await evaluate(`JSON.stringify([localStorage.getItem('poklike-state-v1'),localStorage.getItem('poklike-profile-v1')])`);
  await importBackup({format:'poklike-backup-1',states:null,profile:{enabled:false}});
  verify(await evaluate(`JSON.stringify([localStorage.getItem('poklike-state-v1'),localStorage.getItem('poklike-profile-v1')])===${JSON.stringify(beforeInvalid)}`),'null states backup rejected without mutation');
  await importBackup({format:'poklike-backup-1',states:[],profile:{enabled:false}});
  verify(await evaluate(`JSON.stringify([localStorage.getItem('poklike-state-v1'),localStorage.getItem('poklike-profile-v1')])===${JSON.stringify(beforeInvalid)}`),'array states backup rejected without mutation');
  await importBackup({format:'poklike-backup-1',states:{drawing:{strokes:[{c:999,w:999,points:[[999999,-99]]}]}},preferences:{sound:true}});
  verify(await evaluate(`(()=>{const d=JSON.parse(localStorage.getItem('poklike-state-v1')).drawing.strokes[0];return d.c<=5&&d.w<=40&&d.points[0][0]===960&&d.points[0][1]===0})()`),'hostile drawing fields are bounded by real file import');
  await importBackup({format:'poklike-backup-1',states:{drawing:{strokes:[]}}});
  verify(await evaluate(`JSON.parse(localStorage.getItem('poklike-profile-v1')).ageBand==='6-8'`),'legacy backup without profile retains current profile');
  // 7. CLEAR UI erases creations but retains prefs/profile
  // Ensure CLEAR proves it erases non-empty creation state.
  await importBackup({format:'poklike-backup-1',states:{drawing:{strokes:[{c:1,w:9,points:[[20,20],[80,80]]}]}},profile:{enabled:true,ageBand:'6-8',interests:['music']},preferences:{sound:true}});
  const profileBeforeClear=await evaluate(`localStorage.getItem('poklike-profile-v1')`);
  await openSettings();
  await evaluate(`(()=>{const input=document.querySelector('#clear-confirm');input.value='CLEAR';input.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('#clear-all').click()})()`);
  await wait(150);
  await evaluate(`document.querySelector('[data-close]').click()`);
  verify(await evaluate(`JSON.parse(localStorage.getItem('poklike-state-v1')).drawing.strokes.length===0`),'CLEAR resets drawings');
  verify(await evaluate(`localStorage.getItem('poklike-profile-v1')===${JSON.stringify(profileBeforeClear)}`),'CLEAR retains exact profile value');
  verify(await evaluate(`JSON.parse(localStorage.getItem('poklike-prefs-v1')).sound===true`),'CLEAR retains sound preference');
  // 8. SVG guest repeated Enter focus and generic house toolbar focus retained
  await evaluate(`location.hash='#/toy/cooking'`);await until(`document.querySelector('[data-stage]')?.dataset.stage==='cooking'`,'cooking guests');
  await evaluate(`(()=>{const g=document.querySelector('[data-stage] [data-act="guest:1"]');g?.focus();})()`);
  await keyDown('Enter');await keyUp('Enter');await wait(50);
  verify(await evaluate(`document.activeElement?.getAttribute('data-act')==='guest:1'`),'guest button focus via Enter key retained');
  await keyDown('Enter');await keyUp('Enter');await wait(50);
  verify(await evaluate(`document.activeElement?.getAttribute('data-act')==='guest:1'`),'guest button retains focus through repeated Enter activation');
  await evaluate(`location.hash='#/toy/house'`);await until(`document.querySelector('[data-stage]')?.dataset.stage==='house'`,'house toolbar');
  await evaluate(`(()=>{const b=document.querySelector('.play-controls [data-act]');b?.focus()})()`);
  await keyDown('Enter');await keyUp('Enter');await wait(50);
  verify(await evaluate(`document.activeElement?.closest('.play-controls')!==null`),'house toolbar retains focus after Enter');
  // Passive factory focus should survive multiple passive updates.
  await evaluate(`location.hash='#/toy/code-factory'`);await until(`document.querySelector('[data-stage]')?.dataset.stage==='code-factory'`,'factory scene');
  await evaluate(`(()=>{const g=document.querySelector('[data-stage] [data-act]');g?.focus()})()`);
  const factoryFocus=await evaluate(`document.activeElement?.getAttribute('data-act')`);
  await wait(850);
  verify(await evaluate(`document.activeElement?.getAttribute('data-act')===${JSON.stringify(factoryFocus)}&&document.activeElement?.closest('[data-stage]')!==null`),'factory SVG action retains exact focus through passive ticks');
  // 10. new Cooking/Geometry/Pawn UI actions saved after reload
  await evaluate(`location.hash='#/toy/cooking'`);await until(`document.querySelector('[data-stage]')?.dataset.stage==='cooking'`,'cooking for action');
  await evaluate(`document.querySelector('[data-stage] [data-act="scene"]')?.dispatchEvent(new MouseEvent('click',{bubbles:true}))`);
  await until(`document.querySelector('[data-stage] [data-act="appliance:1"]')`,'Cooking kitchen');
  await evaluate(`document.querySelector('[data-stage] [data-act="ingredient:1"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))`);
  const cookingBefore=await evaluate(`JSON.parse(localStorage.getItem('poklike-state-v1')).cooking`);
  verify(await evaluate(`!!document.querySelector('[data-stage] [data-act="appliance:1"]')&&!!document.querySelector('[data-stage] [data-act="prepare"]')`),'Cooking appliance and chop actions exist');
  await evaluate(`document.querySelector('[data-stage] [data-act="appliance:1"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));document.querySelector('[data-stage] [data-act="prepare"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))`);
  const cookingChanged=await evaluate(`JSON.parse(localStorage.getItem('poklike-state-v1')).cooking`);
  verify(Number.isFinite(cookingChanged.appliance)&&cookingChanged.appliance===1&&cookingChanged.prepared===true&&cookingChanged.ingredients.length===cookingBefore.ingredients.length&&cookingChanged.appliance!==cookingBefore.appliance,'Cooking appliance and chop actions change saved fields');
  await send('Page.reload');
  await until(`document.querySelector('[data-stage]')?.dataset.stage==='cooking'`,'reload cooking');
  verify(await evaluate(`(()=>{const s=JSON.parse(localStorage.getItem('poklike-state-v1')).cooking;return s.appliance===${cookingChanged.appliance}&&s.prepared===${cookingChanged.prepared}})()`),'Cooking appliance and chop fields persist exactly after reload');
  await evaluate(`location.hash='#/toy/geometry'`);await until(`document.querySelector('[data-stage]')?.dataset.stage==='geometry'`,'geometry scene');
  const geometryBefore=await evaluate(`JSON.parse(localStorage.getItem('poklike-state-v1')).geometry.pieces[0]`);
  const rotateExists=await evaluate(`!!document.querySelector('[data-stage] [data-act="rotate"]')`);
  verify(rotateExists,'Geometry rotate action exists in actual scene');
  await evaluate(`document.querySelector('[data-stage] [data-act="rotate"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))`);
  const geometryChanged=await evaluate(`JSON.parse(localStorage.getItem('poklike-state-v1')).geometry.pieces[0]`);
  verify(geometryChanged.r!==geometryBefore.r&&geometryChanged.r!==0,'Geometry rotate changes selected piece rotation');
  await send('Page.reload');await until(`document.querySelector('[data-stage]')?.dataset.stage==='geometry'`,'geometry reload');
  verify(await evaluate(`JSON.parse(localStorage.getItem('poklike-state-v1')).geometry.pieces[0].r===${geometryChanged.r}`),'Geometry rotation persists exactly after reload');
  await evaluate(`location.hash='#/toy/pawn-maker'`);await until(`document.querySelector('[data-stage]')?.dataset.stage==='pawn-maker'`,'pawn scene');
  const pawnButton=await evaluate(`!!document.querySelector('[data-stage] [data-act="face"]')`);
  verify(pawnButton,'Pawn Maker skin action exists');
  await evaluate(`document.querySelector('[data-stage] [data-act="face"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))`);
  await send('Page.reload');await until(`document.querySelector('[data-stage]')?.dataset.stage==='pawn-maker'`,'pawn reload');
  verify(await evaluate(`JSON.parse(localStorage.getItem('poklike-state-v1'))['pawn-maker'].face===1`),'Pawn Maker skin action persists after reload');
  // 11. Draw in portrait with a real pointer, then rotate through landscape and back.
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true,screenOrientation:{type:'portraitPrimary',angle:0}});
  await wait(350);
  await evaluate(`location.hash='#/toy/drawing'`);await until(`document.querySelector('[data-stage]')?.dataset.stage==='drawing'&&document.querySelector('[data-stage]')?.dataset.layout==='portrait'`,'portrait drawing available');
  const coords=await evaluate(`(()=>{const el=document.querySelector('[data-stage]');const p=el.createSVGPoint();p.x=220;p.y=330;const a=p.matrixTransform(el.getScreenCTM());p.x=340;p.y=450;const b=p.matrixTransform(el.getScreenCTM());return {a:{x:a.x,y:a.y},b:{x:b.x,y:b.y}}})()`);
  await mouse('mouseMoved',coords.a.x,coords.a.y);await mouse('mousePressed',coords.a.x,coords.a.y,1);
  for(let i=1;i<=5;i++)await mouse('mouseMoved',coords.a.x+(coords.b.x-coords.a.x)*i/5,coords.a.y+(coords.b.y-coords.a.y)*i/5,1);
  await mouse('mouseReleased',coords.b.x,coords.b.y);
  const drawingBefore=await evaluate(`JSON.parse(localStorage.getItem('poklike-state-v1')).drawing.strokes.at(-1).points`);
  verify(Array.isArray(drawingBefore)&&drawingBefore.length>1,'portrait pointer creates nonempty saved drawing points');
  await send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:true,screenOrientation:{type:'landscapePrimary',angle:90}});
  await wait(350);await until(`document.querySelector('[data-stage]')?.dataset.layout==='landscape'`,'drawing switches to landscape layout');
  verify(await evaluate(`document.querySelector('[data-stage]')?.querySelectorAll('[data-ink] path').length>0`),'drawing path renders in landscape after rotation');
  verify(JSON.stringify(await evaluate(`JSON.parse(localStorage.getItem('poklike-state-v1')).drawing.strokes.at(-1).points`))===JSON.stringify(drawingBefore),'exact drawing points survive portrait-to-landscape rotation');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true,screenOrientation:{type:'portraitPrimary',angle:0}});
  await wait(350);await until(`document.querySelector('[data-stage]')?.dataset.layout==='portrait'`,'drawing returns to portrait');
  verify(JSON.stringify(await evaluate(`JSON.parse(localStorage.getItem('poklike-state-v1')).drawing.strokes.at(-1).points`))===JSON.stringify(drawingBefore),'exact drawing points survive return rotation');
  // 12. Network offline reload with enabled profile -> suggestions + 25 and cache actual profile.js entry
  await evaluate(`location.hash='#/'`);await until(`document.querySelectorAll('[data-toy]').length===25`,'gallery before offline readiness');
  await until(`document.querySelector('.connection-status')?.textContent.includes('Ready offline')`,'offline bundle ready before disconnecting');
  await send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
  await evaluate(`location.hash='#/'`);await until(`document.querySelectorAll('[data-toy]').length===25`,'gallery before offline reload');
  await send('Page.reload');await until(`document.querySelectorAll('[data-toy]').length===25`,'offline gallery',100);
  verify(await evaluate(`document.querySelectorAll('[data-toy]').length===25`),'offline collection 25 toys');
  // verify suggestions appear with profile enabled
  verify(await evaluate(`document.querySelector('[data-recommendation]')!==null`),'suggestions appear offline with profile');
  // verify profile.js is cached
  const cached=await evaluate(`(async()=>{const c=await caches.open('poklike-v10');return (await c.keys()).some(r=>r.url.includes('profile.js'))})()`);
  verify(cached,'profile.js is cached in v10');
  verify(errors.length===0,'no uncaught browser exceptions: '+errors.join(', '));
  verify(requests.length===0,'no HTTP 500 responses: '+requests.join(', '));
  // 13. Capture the actual exported Blob payload by intercepting createObjectURL before click.
  await send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
  await evaluate(`location.hash='#/'`);await until(`document.querySelectorAll('[data-toy]').length===25`,'gallery for export');
  // Verify Escape closes the real settings dialog after opening it via the adult gate.
  await evaluate(`document.querySelector('[data-adult]').click()`);await until(`document.querySelector('#grown-up-check')`,'adult gate for Escape');
  await evaluate(`(()=>{const m=document.querySelector('#grown-up-check label').textContent.match(/([0-9]+) \\+ ([0-9]+)/);const i=document.querySelector('#grown-up-check input');i.value=Number(m[1])+Number(m[2]);document.querySelector('#grown-up-check').requestSubmit()})()`);
  await until(`document.querySelector('#profile-enabled')`,'settings for Escape');
  await evaluate(`document.querySelector('[data-close]').click()`);
  await until(`!document.querySelector('dialog[open]')`,'settings closed before Escape test');
  await evaluate(`document.querySelector('[data-adult]').click()`);await until(`document.querySelector('#grown-up-check')`,'adult gate second open');
  await evaluate(`(()=>{const m=document.querySelector('#grown-up-check label').textContent.match(/([0-9]+) \\+ ([0-9]+)/);const i=document.querySelector('#grown-up-check input');i.value=Number(m[1])+Number(m[2]);document.querySelector('#grown-up-check').requestSubmit()})()`);
  await until(`document.querySelector('#profile-enabled')`,'settings second open');
  await evaluate(`document.querySelector('#profile-enabled').focus()`);
  await send('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});await wait(250);
  verify(await evaluate(`!document.querySelector('#adult-dialog')`),'Escape key closes adult settings dialog');
  await openSettings();
  await evaluate(`(()=>{window.__backupBlob=null;const original=URL.createObjectURL.bind(URL);URL.createObjectURL=(blob)=>{window.__backupBlob=blob;return original(blob)};document.querySelector('#export-save').click()})()`);
  const exported=await evaluate(`window.__backupBlob?.text()`);
  verify(!!exported&&JSON.parse(exported).format==='poklike-backup-1'&&JSON.parse(exported).profile.ageBand==='6-8','export produces backup Blob with profile payload');
  process.stdout.write(`\nPASSED ${assertions} flows assertions\n`);
}
try{await run();}catch(error){console.error('\nFLOWS TEST FAILURE',error);failures++;process.exitCode=1;}
finally{try{ws?.close();}catch{};try{server?.kill('SIGKILL');}catch{};terminateChrome();await wait(450);if(tmp)try{rmSync(tmp,{recursive:true,force:true,maxRetries:4,retryDelay:300});}catch{}}