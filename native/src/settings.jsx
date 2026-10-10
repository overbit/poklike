import React,{useEffect,useState} from 'react';
import {Modal,View,Text,TextInput,Pressable,Switch,Alert,ScrollView,StyleSheet,Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useGame} from './store.jsx';
const ink='#273845',paper='#fffdf8',muted='#526a73';
export default function ParentSettings({visible,onClose}){
 const {prefs,setSound,setReducedMotion,resetAll,exportBackup,importBackup,storageError}=useGame();
 const [question,setQuestion]=useState(null),[answer,setAnswer]=useState(''),[error,setError]=useState(''),[unlocked,setUnlocked]=useState(false);
 useEffect(()=>{if(visible){setQuestion({a:9+Math.floor(Math.random()*8),b:6+Math.floor(Math.random()*9)});setAnswer('');setUnlocked(false);setError('');}},[visible]);
 const submit=()=>{if(Number(answer)===question.a+question.b&&answer.trim()){setUnlocked(true);setError('');}else setError('That is not quite right. Please try again.');};
 const exportNow=async()=>{try{await exportBackup();}catch(err){Alert.alert('Could not export',String(err.message||err));}};
 const importNow=async()=>{try{if(await importBackup())Alert.alert('Restored','Your toys and preferences are back.');}catch(err){Alert.alert('Could not restore',String(err.message||err));}};
 return <Modal visible={visible} animationType="slide" presentationStyle={Platform.OS==='ios'?'pageSheet':'fullScreen'} onRequestClose={onClose}>
  <SafeAreaView style={styles.page}><View style={styles.top}><Text style={styles.title}>{unlocked?'Grown-ups & settings':'Just for grown-ups'}</Text><Pressable style={styles.close} onPress={onClose} accessibilityLabel="Close settings" accessibilityRole="button"><Text style={styles.closeLabel}>Done</Text></Pressable></View>
  {!unlocked?<View style={styles.content}><Text style={styles.text}>Please answer this quick question to change how the playroom works.</Text><Text style={styles.sum}>What is {question?.a} + {question?.b}?</Text><TextInput style={styles.field} keyboardType="number-pad" autoFocus value={answer} onChangeText={setAnswer} maxLength={3} accessibilityLabel="Answer to grown-ups question"/>{error?<Text style={styles.error}>{error}</Text>:null}<Pressable onPress={submit} style={styles.primary} accessibilityRole="button"><Text style={styles.primaryText}>Continue</Text></Pressable></View>:
   <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Text style={styles.text}>All creations are stored privately on this device. No accounts, advertising or tracking.</Text>
    <View style={styles.row}><View style={styles.rowText}><Text style={styles.label}>Gentle sounds</Text><Text style={styles.hint}>Offline audio feedback</Text></View><Switch value={prefs.sound} onValueChange={setSound} trackColor={{true:'#49a99a'}} accessibilityLabel="Enable sound"/></View>
    <View style={styles.row}><View style={styles.rowText}><Text style={styles.label}>Reduce motion</Text><Text style={styles.hint}>Fewer passive animations</Text></View><Switch value={prefs.reducedMotion} onValueChange={setReducedMotion} trackColor={{true:'#49a99a'}} accessibilityLabel="Reduce motion"/></View>
    <Pressable onPress={exportNow} style={styles.action} accessibilityRole="button"><Text style={styles.label}>Share a backup</Text><Text style={styles.hint}>Save or share creations as a file</Text></Pressable>
    <Pressable onPress={importNow} style={styles.action} accessibilityRole="button"><Text style={styles.label}>Restore from backup</Text><Text style={styles.hint}>Choose your saved Poklike backup file</Text></Pressable>
    {storageError?<Text style={styles.error}>{storageError}</Text>:null}
    <Pressable accessibilityRole="button" style={[styles.action,{marginTop:30,backgroundColor:'#fae6df'}]} onPress={()=>Alert.alert('Erase saved play?','This deletes all 25 toys’ creations on this device.',[{text:'Cancel',style:'cancel'},{text:'Erase everything',style:'destructive',onPress:resetAll}])}><Text style={[styles.label,{color:'#8c3d31'}]}>Erase all creations</Text><Text style={styles.hint}>This cannot be undone without a backup</Text></Pressable>
   </ScrollView>}
  </SafeAreaView>
 </Modal>;
}
const styles=StyleSheet.create({
 page:{flex:1,backgroundColor:paper},top:{paddingHorizontal:20,paddingVertical:14,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10,borderBottomWidth:1,borderBottomColor:'#e9e4da'},
 title:{flex:1,fontSize:22,fontWeight:'900',color:ink},close:{minWidth:52,minHeight:48,justifyContent:'center',alignItems:'center'},closeLabel:{fontSize:16,fontWeight:'800',color:'#297d72'},
 content:{padding:24},text:{fontSize:16,color:muted,lineHeight:24,marginBottom:16},sum:{fontSize:27,color:ink,fontWeight:'850',marginTop:20},
 field:{borderWidth:2,borderColor:'#b4b8b0',borderRadius:16,minHeight:58,fontSize:24,color:ink,marginVertical:18,paddingHorizontal:18},
 error:{fontSize:14,color:'#963c32',marginBottom:12},primary:{minHeight:52,backgroundColor:ink,borderRadius:16,alignItems:'center',justifyContent:'center'},primaryText:{fontSize:17,fontWeight:'800',color:'white'},
 row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',minHeight:86,borderBottomWidth:1,borderBottomColor:'#e9e4da',gap:12},
 rowText:{flex:1},label:{fontSize:16,fontWeight:'800',color:ink},hint:{fontSize:13,color:muted,marginTop:5,lineHeight:18},
 action:{padding:18,minHeight:74,backgroundColor:'#f3efe5',borderRadius:14,marginTop:14}
});
