// Entirely local once installed. New cache becomes active only after all assets succeed.
const VERSION='poklike-v4';
const ASSETS=['./','./index.html','./styles.css','./app.js','./toys.js','./portrait-toys.js','./manifest.webmanifest','./icons/poklike.svg','./icons/poklike-180.png','./icons/poklike-192.png','./icons/poklike-512.png'];
const normalize=url=>new URL(url,self.registration.scope).toString();
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(VERSION);
  await cache.addAll(ASSETS);
  for(const file of ASSETS){if(!await cache.match(normalize(file)))throw new Error('Offline bundle incomplete: '+file);}
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(VERSION);
  for(const file of ASSETS){if(!await cache.match(normalize(file)))throw new Error('Refusing to replace complete cache');}
  for(const key of await caches.keys()){if(key.startsWith('poklike-')&&key!==VERSION)await caches.delete(key);}
  await self.clients.claim();
 })());
});
self.addEventListener('message',event=>{
 if(event.data?.type!=='VERIFY')return;
 event.waitUntil((async()=>{
  try{
   const cache=await caches.open(VERSION);
   const missing=[];
   for(const file of ASSETS){if(!await cache.match(normalize(file)))missing.push(file);}
   event.ports?.[0]?.postMessage({ready:missing.length===0,missing,version:VERSION});
  }catch(error){event.ports?.[0]?.postMessage({ready:false,error:String(error)});}
 })());
});
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin)return;
 event.respondWith((async()=>{
  const cache=await caches.open(VERSION);
  const hit=await cache.match(req,{ignoreSearch:req.mode==='navigate'});
  if(hit)return hit;
  try{return await fetch(req);}catch{
   if(req.mode==='navigate'){const fallback=await cache.match(normalize('./index.html'));if(fallback)return fallback;}
   return new Response('Offline: this resource is not in the installed app',{status:503,headers:{'Content-Type':'text/plain'}});
  }
 })());
});
