import {toys,initialState,interact,moveDrag} from '../../toys.js';
export const STATE_KEY='poklike-native-state-v1',PREF_KEY='poklike-native-prefs-v1';
export const defaultStates=()=>Object.fromEntries(toys.map(t=>[t.id,initialState(t.id)]));
export const defaultPreferences=()=>({sound:true,reducedMotion:false});
export function restoreStates(snapshot){
 const out=defaultStates();
 if(!snapshot||typeof snapshot!=='object'||Array.isArray(snapshot))return out;
 for(const t of toys){
  const candidate=snapshot[t.id];
  if(!candidate||typeof candidate!=='object'||Array.isArray(candidate))continue;
  const base=initialState(t.id);
  for(const [key,val] of Object.entries(base)){
   const other=candidate[key];
   if(typeof val==='number'&&typeof other==='number'&&Number.isFinite(other))base[key]=Math.max(0,Math.min(10000,other));
   else if(typeof val==='boolean'&&typeof other==='boolean')base[key]=other;
   else if(typeof val==='string'&&typeof other==='string')base[key]=other.slice(0,50);
   else if(Array.isArray(val)&&Array.isArray(other))base[key]=other.slice(0,key==='strokes'?150:35);
   else if(val&&typeof val==='object'&&other&&typeof other==='object')base[key]={x:Number(other.x)||0,y:Number(other.y)||0};
  }
  out[t.id]=base;
 }
 return out;
}
export function changeState(previous,id,action){
 if(!Object.prototype.hasOwnProperty.call(previous,id))return previous;
 const next={...previous},state=structuredClone(previous[id]);interact(id,state,action);next[id]=state;return next;
}
export function dragState(previous,id,key,x,y){
 if(!Object.prototype.hasOwnProperty.call(previous,id))return previous;
 const state=structuredClone(previous[id]);
 if(!moveDrag(id,state,key,x,y))return previous;
 return {...previous,[id]:state};
}
