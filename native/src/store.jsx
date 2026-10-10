import React,{createContext,useContext,useEffect,useMemo,useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {File,Paths} from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import {STATE_KEY,PREF_KEY,defaultStates,defaultPreferences,restoreStates,changeState,dragState} from './state.js';
import {initialState} from '../../toys.js';

const Context=createContext(null);
const safePrefs=input=>({sound:input?.sound!==false,reducedMotion:input?.reducedMotion===true});

export function GameProvider({children}){
 const [states,setStates]=useState(defaultStates);
 const [prefs,setPrefs]=useState(defaultPreferences);
 const [ready,setReady]=useState(false);
 const [storageError,setStorageError]=useState('');
 useEffect(()=>{
  let alive=true;
  AsyncStorage.multiGet([STATE_KEY,PREF_KEY]).then(entries=>{
   if(!alive)return;
   try{if(entries[0][1])setStates(restoreStates(JSON.parse(entries[0][1])));}catch{}
   try{if(entries[1][1])setPrefs(safePrefs(JSON.parse(entries[1][1])));}catch{}
  }).catch(()=>{if(alive)setStorageError('Storage is unavailable on this device.');}).finally(()=>{if(alive)setReady(true);});
  return ()=>{alive=false;};
 },[]);
 useEffect(()=>{
  if(!ready)return;
  const timer=setTimeout(()=>{
   AsyncStorage.multiSet([[STATE_KEY,JSON.stringify(states)],[PREF_KEY,JSON.stringify(prefs)]])
     .then(()=>setStorageError('')).catch(()=>setStorageError('Unable to save on this device. Check free space.'));
  },220);
  return ()=>clearTimeout(timer);
 },[states,prefs,ready]);
 const value=useMemo(()=>({
  states,prefs,ready,storageError,
  act:(id,action)=>setStates(previous=>changeState(previous,id,action)),
  drag:(id,key,x,y)=>setStates(previous=>dragState(previous,id,key,x,y)),
  mutate:(id,fn)=>setStates(previous=>{
   if(!previous[id])return previous;
   const state=JSON.parse(JSON.stringify(previous[id]));fn(state);
   return {...previous,[id]:state};
  }),
  reset:id=>setStates(previous=>({...previous,[id]:initialState(id)})),
  resetAll:()=>setStates(defaultStates()),
  setSound:enabled=>setPrefs(previous=>({...previous,sound:enabled})),
  setReducedMotion:enabled=>setPrefs(previous=>({...previous,reducedMotion:enabled})),
  exportBackup:async()=>{
   const file=new File(Paths.cache,'poklike-backup.json');
   file.create({overwrite:true});file.write(JSON.stringify({version:1,states,prefs}));
   if(!await Sharing.isAvailableAsync())throw Error('Sharing is unavailable on this device.');
   await Sharing.shareAsync(file.uri,{mimeType:'application/json',dialogTitle:'Save Poklike backup'});
  },
  importBackup:async()=>{
   const result=await DocumentPicker.getDocumentAsync({type:'application/json',copyToCacheDirectory:true});
   if(result.canceled)return false;
   const file=new File(result.assets[0].uri);
   const content=JSON.parse(await file.text());
   if(content.version!==1||!content.states||typeof content.states!=='object')throw Error('This is not a Poklike backup.');
   setStates(restoreStates(content.states));setPrefs(safePrefs(content.prefs));
   return true;
  }
 }),[states,prefs,ready,storageError]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useGame(){const value=useContext(Context);if(!value)throw Error('Poklike provider missing');return value;}
