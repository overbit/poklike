import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {View,Text,Pressable,ScrollView,StyleSheet,StatusBar,Alert,ActivityIndicator} from 'react-native';
import {useLocalSearchParams,useRouter} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {parse,SvgAst} from 'react-native-svg';
import {useAudioPlayer} from 'expo-audio';
import * as Haptics from 'expo-haptics';
import {toys,toyById,renderToy,tickToy} from '../../toys.js';
import {useGame} from './store.jsx';
import {computeCamera,pan,toWorld} from './camera.js';
import {wireScene} from './scene.js';

const ink='#273845',paper='#fffdf8';
function StageButton({label,onPress,style,disabled=false,selected=false}){
 return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled,selected}}
  disabled={disabled} onPress={onPress} style={({pressed})=>[styles.bubble,style,disabled&&styles.disabled,pressed&&styles.pressed]}>
  <Text style={styles.bubbleText}>{label}</Text></Pressable>;
}
export default function NativeToy(){
 const {id:routeId}=useLocalSearchParams();
 const id=typeof routeId==='string'&&toyById(routeId)?routeId:toys[0].id;
 const router=useRouter(),insets=useSafeAreaInsets(),{states,ready,prefs,act,drag,mutate,reset}=useGame();
 const [size,setSize]=useState({width:390,height:844}),[position,setPosition]=useState(null),[fit,setFit]=useState(false);
 const frame=useRef({x:0,y:0,width:390,height:844}),stageRef=useRef(null),dragging=useRef(null),drawing=useRef(null);
 const player=useAudioPlayer(require('../assets/tone.wav'));
 const toy=toyById(id),state=states[id];
 const camera=useMemo(()=>computeCamera(size.width,size.height,position,fit),[size.width,size.height,position,fit]);
 const cameraRef=useRef(camera);cameraRef.current=camera;
 useEffect(()=>{setFit(false);setPosition(null);dragging.current=null;drawing.current=null;},[id]);
 const ping=useCallback(()=>{
  if(!prefs.sound)return;
  try{player.seekTo(0);player.play();}catch{}
 },[player,prefs.sound]);
 const onAction=useCallback(action=>{
  act(id,action);void Haptics.selectionAsync().catch(()=>{});ping();
 },[act,id,ping]);
 const locate=useCallback(event=>{
  const point={x:Number(event.pageX??event.touches?.[0]?.pageX??0),y:Number(event.pageY??event.touches?.[0]?.pageY??0)};
  return toWorld(point,frame.current,cameraRef.current);
 },[]);
 const onDragStart=useCallback((key,at,event)=>{
  const loc=locate(event);
  dragging.current={key,dx:at.x-loc.x,dy:at.y-loc.y};
 },[locate]);
 const onDragMove=useCallback((key,event)=>{
  const gesture=dragging.current;
  if(!gesture||gesture.key!==key)return;
  const loc=locate(event);
  drag(id,key,loc.x+gesture.dx,loc.y+gesture.dy);
 },[drag,id,locate]);
 const onDragEnd=useCallback((key,event)=>{
  if(dragging.current?.key===key){onDragMove(key,event);dragging.current=null;ping();}
 },[onDragMove,ping]);
 const scene=useMemo(()=>renderToy(id,state),[id,state]);
 const handlers=useMemo(()=>({onAction,onDragStart,onDragMove,onDragEnd}),[onAction,onDragStart,onDragMove,onDragEnd]);
 const ast=useMemo(()=>{
  try{return parse('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600">'+scene.art+'</svg>',root=>wireScene(root,handlers));}
  catch(error){console.warn('Toy scene failed to draw:',error);return null;}
 },[scene.art,handlers]);
 const touchPoint=ev=>locate(ev.nativeEvent);
 const drawStart=event=>{
  if(id!=='drawing')return;
  const at=touchPoint(event);
  if(at.x<60||at.x>900||at.y<35||at.y>478)return;
  const strokes=states[id].strokes;if(strokes.length>=150)return;
  const line={c:state.color,w:state.width,points:[[at.x,at.y]]};
  drawing.current=line;
  mutate(id,s=>s.strokes.push({...line,points:[...line.points]}));
 };
 const drawMove=event=>{
  if(!drawing.current)return;
  const at=touchPoint(event);
  if(at.x<60||at.x>900||at.y<35||at.y>478||drawing.current.points.length>=1500)return;
  drawing.current.points.push([at.x,at.y]);
  if(drawing.current.points.length%2===0){
   const points=[...drawing.current.points];
   mutate(id,s=>{if(s.strokes.length)s.strokes[s.strokes.length-1].points=points;});
  }
 };
 const drawEnd=()=>{
  if(!drawing.current)return;
  if(drawing.current.points.length===1){const [x,y]=drawing.current.points[0];drawing.current.points.push([x+.5,y+.5]);}
  const points=[...drawing.current.points];
  mutate(id,s=>{if(s.strokes.length)s.strokes[s.strokes.length-1].points=points;});
  drawing.current=null;ping();
 };
 useEffect(()=>{
  const active=id==='marble-machine'?state?.running:['radio','sequencer','code-factory'].includes(id)?state?.playing:false;
  if(!active)return;
  const timer=setInterval(()=>{
   mutate(id,s=>{const notes=tickToy(id,s);if(notes?.length&&prefs.sound)ping();});
  },350);
  return ()=>clearInterval(timer);
 },[id,state?.playing,state?.running,prefs.sound,ping,mutate]);
 if(!ready)return <View style={styles.loading}><ActivityIndicator size="large" color="#49a99a"/></View>;
 const canBack=(camera.width<960-1?camera.x:camera.y)>1;
 const canForward=camera.width<960-1?(camera.x+camera.width<959):(camera.y+camera.height<599);
 const move=direction=>setPosition(pan(camera,direction));
 const resetConfirm=()=>Alert.alert('Start this toy again?','Your creation in this toy will be reset.',[{text:'Keep playing',style:'cancel'},{text:'Start fresh',style:'destructive',onPress:()=>reset(id)}]);
 return <View style={styles.root}>
  <StatusBar hidden/>
  <View ref={stageRef} onLayout={ev=>{
    const {width,height}=ev.nativeEvent.layout;
    if(width>0&&height>0){setSize(prev=>prev.width===width&&prev.height===height?prev:{width,height});frame.current.width=width;frame.current.height=height;}
    stageRef.current?.measureInWindow((x,y,w,h)=>{frame.current={x,y,width:w,height:h};});
  }} onTouchStart={drawStart} onTouchMove={drawMove} onTouchEnd={drawEnd} onTouchCancel={drawEnd} style={styles.scene}>
   {ast?<SvgAst ast={ast} override={{width:'100%',height:'100%',viewBox:`${camera.x} ${camera.y} ${camera.width} ${camera.height}`,preserveAspectRatio:fit?'xMidYMid meet':'none'}}/>:
    <View style={styles.error}><Text style={styles.errorText}>This toy could not open. Return to the playroom and try again.</Text></View>}
  </View>
  <View pointerEvents="box-none" style={[styles.top,{top:insets.top+8,left:Math.max(insets.left,10),right:Math.max(insets.right,10)}]}>
   <StageButton label="All toys" onPress={()=>router.back()} style={styles.navButton}/>
   <View style={styles.titlePill}><Text style={styles.title} numberOfLines={1}>{toy.title}</Text></View>
   <StageButton label="Reset" onPress={resetConfirm} style={styles.navButton}/>
  </View>
  {!fit&&camera.canPan?<View pointerEvents="box-none" style={[styles.arrows,{top:size.height*.45,left:Math.max(insets.left,8),right:Math.max(insets.right,8)}]}>
   <StageButton label={camera.height<600?'Up':'Left'} onPress={()=>move(-1)} disabled={!canBack} style={styles.arrow}/>
   <StageButton label={camera.height<600?'Down':'Right'} onPress={()=>move(1)} disabled={!canForward} style={styles.arrow}/>
  </View>:null}
  <View style={[styles.viewRow,{bottom:insets.bottom+88,right:Math.max(insets.right,12)}]}>
   <StageButton label={fit?'Fill screen':'See all'} selected={fit} onPress={()=>setFit(previous=>!previous)}/>
  </View>
  <View style={[styles.controls,{bottom:insets.bottom+8,left:Math.max(insets.left,8),right:Math.max(insets.right,8)}]}>
   <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tools}>
    {scene.tools.map(t=><StageButton key={t.act} label={t.label} onPress={()=>onAction(t.act)} style={styles.toolButton}/>)}
   </ScrollView>
  </View>
 </View>;
}
const styles=StyleSheet.create({
 root:{flex:1,backgroundColor:paper},loading:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:paper},
 scene:{...StyleSheet.absoluteFillObject,backgroundColor:paper},error:{flex:1,alignItems:'center',justifyContent:'center',padding:30},
 errorText:{color:ink,fontSize:16,textAlign:'center'},
 top:{position:'absolute',flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8},
 titlePill:{flex:1,justifyContent:'center',alignItems:'center'},
 title:{maxWidth:'100%',fontSize:16,fontWeight:'900',color:ink,textAlign:'center',paddingVertical:10,paddingHorizontal:10,overflow:'hidden',backgroundColor:'rgba(255,253,248,.94)',borderRadius:22},
 bubble:{minHeight:50,minWidth:55,alignItems:'center',justifyContent:'center',paddingHorizontal:15,paddingVertical:8,borderRadius:24,backgroundColor:'rgba(255,253,248,.95)',elevation:4,shadowColor:ink,shadowOpacity:.15,shadowRadius:8,shadowOffset:{width:0,height:3}},
 bubbleText:{fontSize:15,fontWeight:'850',color:ink},disabled:{opacity:.26},pressed:{opacity:.72,transform:[{scale:.96}]},
 navButton:{minWidth:74,minHeight:54},arrows:{position:'absolute',flexDirection:'row',justifyContent:'space-between'},
 arrow:{minWidth:62,minHeight:66},viewRow:{position:'absolute'},
 controls:{position:'absolute',height:72,backgroundColor:'rgba(255,253,248,.96)',borderRadius:22,paddingHorizontal:8,paddingVertical:7,elevation:6,shadowColor:ink,shadowOpacity:.16,shadowRadius:11,shadowOffset:{width:0,height:5}},
 tools:{alignItems:'center',gap:8,paddingRight:6},toolButton:{minHeight:52,backgroundColor:'#f9f6ef'}
});
