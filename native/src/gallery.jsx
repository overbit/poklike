import React,{useMemo,useState} from 'react';
import {View,Text,FlatList,Pressable,StyleSheet,useWindowDimensions,StatusBar,ActivityIndicator} from 'react-native';
import {useRouter} from 'expo-router';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SvgXml} from 'react-native-svg';
import {toys,renderToy} from '../../toys.js';
import {useGame} from './store.jsx';
import ParentSettings from './settings.jsx';

const paper='#f9f6ef',ink='#273845',muted='#526a73',cream='#fffdf8';
function PetalMark(){
 return <View accessible={false} style={styles.mark}><View style={[styles.dot,{top:0,left:12,backgroundColor:'#e76d56'}]}/><View style={[styles.dot,{top:12,left:24,backgroundColor:'#efc95a'}]}/><View style={[styles.dot,{top:24,left:12,backgroundColor:'#49a99a'}]}/><View style={[styles.dot,{top:12,left:0,backgroundColor:'#75a9d1'}]}/><View style={[styles.dot,{top:12,left:12,width:11,height:11,backgroundColor:cream}]}/></View>;
}
function ToyPreview({toy,state,width}){
 const art=useMemo(()=>renderToy(toy.id,state).art,[toy.id,state]);
 const xml='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600">'+art+'</svg>';
 return <View style={{height:width*.74,width,overflow:'hidden',backgroundColor:toy.color}} pointerEvents="none">
  <SvgXml xml={xml} width={width} height={width*.74} preserveAspectRatio="xMidYMid slice"/>
 </View>;
}
export default function Gallery(){
 const router=useRouter(),{width}=useWindowDimensions(),{states,ready,storageError}=useGame();
 const [settingsVisible,setSettingsVisible]=useState(false);
 const columns=width>950?4:width>650?3:2;
 const padding=width>650?24:14,gap=12,cardWidth=(width-padding*2-gap*(columns-1))/columns;
 if(!ready)return <View style={styles.loading}><ActivityIndicator size="large" color="#49a99a"/><Text style={styles.subtitle}>Opening your playroom…</Text></View>;
 return <SafeAreaView style={styles.root}>
  <StatusBar hidden={false} barStyle="dark-content" backgroundColor={paper}/>
  <View style={styles.header}><View style={styles.brand}><PetalMark/><Text style={styles.brandTitle}>Poklike</Text></View>
   <Pressable accessibilityRole="button" accessibilityLabel="Open grown-ups area" onPress={()=>setSettingsVisible(true)} style={styles.adult}><Text style={styles.adultLabel}>Grown-ups</Text></Pressable></View>
  <FlatList key={columns} data={toys} keyExtractor={item=>item.id} numColumns={columns} showsVerticalScrollIndicator={false}
   contentContainerStyle={{paddingHorizontal:padding,paddingBottom:30}}
   ListHeaderComponent={<View style={styles.hero}><Text style={styles.title}>Little worlds,{"\n"}big wonder.</Text><Text style={styles.subtitle}>Pick a playground and follow your curiosity.</Text><Text style={styles.offline}>✓ Built for offline play · 25 toys</Text>{storageError?<Text style={styles.error}>{storageError}</Text>:null}</View>}
   columnWrapperStyle={{gap}}
   renderItem={({item})=><Pressable accessibilityRole="button" accessibilityLabel={'Play '+item.title} onPress={()=>router.push('/toy/'+item.id)} style={[styles.card,{width:cardWidth}]}>
     <ToyPreview toy={item} state={states[item.id]} width={cardWidth}/>
     <View style={styles.cardText}><Text numberOfLines={2} style={styles.cardTitle}>{item.title}</Text><Text numberOfLines={2} style={styles.caption}>{item.tagline}</Text></View>
    </Pressable>}/>
  <ParentSettings visible={settingsVisible} onClose={()=>setSettingsVisible(false)}/>
 </SafeAreaView>;
}
const styles=StyleSheet.create({
 root:{flex:1,backgroundColor:paper},loading:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:paper,gap:18},
 header:{paddingHorizontal:20,height:66,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
 brand:{flexDirection:'row',alignItems:'center',gap:12},brandTitle:{fontSize:25,fontWeight:'900',letterSpacing:-.6,color:ink},
 mark:{width:36,height:36,position:'relative'},dot:{width:18,height:18,borderRadius:10,position:'absolute'},
 adult:{paddingHorizontal:14,justifyContent:'center',minHeight:48,borderRadius:24,backgroundColor:cream},
 adultLabel:{fontSize:14,fontWeight:'800',color:ink},
 hero:{paddingTop:34,paddingBottom:26},title:{fontSize:41,fontWeight:'900',lineHeight:45,color:ink,letterSpacing:-1.4},
 subtitle:{fontSize:16,lineHeight:23,color:muted,marginTop:12},
 offline:{fontSize:13,fontWeight:'800',marginTop:18,color:'#297d72'},
 error:{fontSize:13,color:'#a13e34',marginTop:12,fontWeight:'700'},
 card:{marginBottom:12,borderRadius:18,overflow:'hidden',backgroundColor:cream,elevation:2,shadowColor:'#273845',shadowOpacity:.1,shadowRadius:8,shadowOffset:{width:0,height:4}},
 cardText:{paddingHorizontal:12,paddingVertical:13,minHeight:69},
 cardTitle:{fontSize:16,fontWeight:'900',color:ink},
 caption:{fontSize:12,lineHeight:17,marginTop:4,color:muted}
});
