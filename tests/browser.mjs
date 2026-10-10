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
function send(method,params={}){return new Promise((resolve,reject)=>{const id=nextId++;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));setTimeout(()=>{const p=pending.get(id);if(p){pending.delete(id);reject(new Error('CDP timeout: '+method));}},12000).unref();});}
async function evaluate(expression){const output=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});if(output.exceptionDetails)throw Error(output.exceptionDetails.text+' : '+output.exceptionDetails.exception?.description);return output.result?.value;}
async function until(expression,message,tries=80){for(let i=0;i<tries;i++){try{if(await evaluate(expression))return true;}catch{}await wait(120);}console.error('DEBUG timeout',message, 'body=',await evaluate('document.body?.innerText?.slice(0,800)').catch(()=>'<unavailable>'), 'errors=',errors, '5xx=',requests);throw Error('Timeout: '+message);}
async function snapshot(name){const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});writeFileSync(join(artifacts,name+'.png'),Buffer.from(shot.data,'base64'));}
function mouse(type,x,y,buttons=0){return send('Input.dispatchMouseEvent',{type,x,y,button:type==='mouseMoved'?'none':'left',buttons,clickCount:1});}
async function start(){
 const port=await freePort(),remote=await freePort();tmp=mkdtempSync(join(tmpdir(),'poklike-browser-'));
 server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',basePath==='/'?root:resolve(root,'..')],{stdio:'ignore'});
 chrome=spawn(process.env.CHROMIUM||'/usr/bin/chromium',['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-first-run','--no-default-browser-check','--remote-allow-origins=*',`--remote-debugging-port=${remote}`,`--user-data-dir=${tmp}`,'--window-size=1280,900','about:blank'],{stdio:'ignore'});
 await retry(async()=>{const r=await fetch('http://127.0.0.1:'+remote+'/json');if(!r.ok)throw Error(r.status);return r.json();});
 const pages=await retry(async()=>{const r=await fetch('http://127.0.0.1:'+remote+'/json');return r.json();});
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
 verify(await evaluate(`location.pathname===${JSON.stringify(basePath)}`),'site opens at its expected base path');
 await until(`document.querySelector('.connection-status')?.textContent.includes('Ready offline')`,'offline status',100);
 const status=await evaluate(`document.querySelector('.connection-status').textContent.trim()`);
 verify(status==='Ready offline','offline status is confirmed by service worker');
 const cached=await evaluate(`(async()=>{const c=await caches.open('poklike-v3');return (await c.keys()).length})()`);
 verify(cached>=7,'complete offline bundle is precached');
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
 verify(await evaluate(`(()=>{const b=document.querySelector('#clear-all');return b.disabled})()`),'bulk reset requires explicit confirmation');
 await evaluate(`(()=>{const c=document.querySelector('#setting-motion');c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}));})()`);
 verify(await evaluate(`document.body.dataset.reduced==='true'`),'reduced motion preference applies immediately');
 await evaluate(`document.querySelector('#export-save').click()`);
 verify(await evaluate(`document.querySelector('#settings-message').textContent.includes('Backup downloaded')`),'export offers a backup file');
 await evaluate(`document.querySelector('#clear-confirm').value='CLEAR';document.querySelector('#clear-confirm').dispatchEvent(new Event('input',{bubbles:true}));`);
 verify(await evaluate(`document.querySelector('#clear-all').disabled===false`),'bulk reset unlocks only after explicit confirmation');
 await evaluate(`document.querySelector('[data-close]').click()`);
 // Verify full offline reopen *after* initial installation.
 await evaluate(`location.hash='#/'`);
 await until(`document.querySelectorAll('[data-toy]').length===25`,'gallery before offline');
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
 const portrait=await evaluate(`(()=>{const a=document.querySelector('.toy-canvas'),b=document.querySelector('.stage-wrap').getBoundingClientRect(),v=a.viewBox.baseVal;return {height:b.height,width:b.width,innerHeight:innerHeight,worldWidth:v.width,worldHeight:v.height,arrows:document.querySelector('.camera-controls').hidden,home:document.querySelector('[data-home]').getBoundingClientRect().width,reset:document.querySelector('[data-reset]').getBoundingClientRect().width}})()`);
 verify(portrait.height>=portrait.innerHeight*.97,'iPhone portrait: playground fills at least 97% of viewport height');
 verify(portrait.worldWidth<500&&portrait.worldHeight>=590,'iPhone portrait: camera zooms to full-height interactive art');
 verify(!portrait.arrows,'iPhone portrait: pan arrows are available');
 verify(portrait.home>=44&&portrait.reset>=44,'iPhone portrait: navigation has touch-size buttons');
 const originalX=await evaluate(`document.querySelector('.toy-canvas').viewBox.baseVal.x`);
 await evaluate(`document.querySelector('[data-pan="1"]').click()`);
 verify(await evaluate(`document.querySelector('.toy-canvas').viewBox.baseVal.x`)>originalX+5,'camera arrow reveals more of the scene');
 await evaluate(`document.querySelector('[data-fit]').click()`);
 verify(await evaluate(`document.querySelector('.toy-canvas').viewBox.baseVal.width===960`),'See all reveals every part of the playground');
 await evaluate(`document.querySelector('[data-fit]').click()`);
 verify(await evaluate(`document.querySelector('.toy-canvas').viewBox.baseVal.width<500`),'Fill screen restores immersive play');
 await send('Emulation.setDeviceMetricsOverride',{width:412,height:915,deviceScaleFactor:1,mobile:true});
 await wait(180);
 const android=await evaluate(`(()=>({h:document.querySelector('.stage-wrap').getBoundingClientRect().height,visible:innerHeight,cropped:document.querySelector('.toy-canvas').viewBox.baseVal.width<500}))()`);
 verify(android.h>=android.visible*.97&&android.cropped,'Android portrait: full-height play and large art');
 await send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:true,screenOrientation:{type:'landscapePrimary',angle:90}});
 await wait(350);await evaluate(`window.dispatchEvent(new Event('resize'))`);await wait(100);
 const landscape=await evaluate(`(()=>({h:document.querySelector('.stage-wrap').getBoundingClientRect().height,visible:innerHeight,w:document.querySelector('.toy-canvas').viewBox.baseVal.width}))()`);
 console.log('Mobile landscape camera',JSON.stringify(landscape));
 verify(landscape.h>=landscape.visible*.97&&landscape.w>500,'Phone landscape: viewport fills and scene expands compared with portrait');
 await snapshot('toy-landscape');

 verify(errors.length===0,'browser produced no uncaught page exceptions: '+errors.join(','));
 verify(requests.length===0,'browser produced no 5xx responses: '+requests.join(','));
 process.stdout.write(`\nPASSED ${assertions} browser assertions, 25/25 online and 25/25 offline toy opens\n`);
}
try{await run();}catch(error){console.error('\nBROWSER TEST FAILURE',error);failures++;process.exitCode=1;}
finally{try{ws?.close();}catch{};server?.kill('SIGTERM');chrome?.kill('SIGTERM');await wait(700);if(tmp)try{rmSync(tmp,{recursive:true,force:true,maxRetries:4,retryDelay:300});}catch{}}
