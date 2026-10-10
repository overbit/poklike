import test from 'node:test';
import assert from 'node:assert/strict';
import {toys,renderToy,initialState} from '../../toys.js';
import {computeCamera,pan,toWorld} from '../src/camera.js';
import {defaultStates,restoreStates,changeState,dragState} from '../src/state.js';
import {wireScene} from '../src/scene.js';
test('native app contains all 25 scenes without WebView',()=>{
 assert.equal(toys.length,25);
 for(const t of toys){const s=renderToy(t.id,initialState(t.id));assert.ok(s.art.includes('<'));assert.ok(s.art.length>500);}
});
test('native viewport fills iPhone and Android portrait',()=>{
 for(const [w,h] of [[390,844],[412,915],[320,568]]){const c=computeCamera(w,h);assert.equal(c.height,600);assert.ok(c.width<500);assert.ok(c.x>=0);assert.equal(c.canPan,true);}
});
test('landscape fills width and supports vertical panning',()=>{
 const c=computeCamera(844,390);assert.equal(c.width,960);assert.ok(c.height<600);assert.ok(pan(c,1).y>c.y);
});
test('child can reveal entire scene using fit',()=>{
 const c=computeCamera(390,844,null,true);assert.deepEqual(c,{x:0,y:0,width:960,height:600,canPan:false});
});
test('panning is bounded and transforms screen to toy coordinates',()=>{
 const c=computeCamera(390,844);assert.ok(pan(c,-20).x>=0);assert.ok(pan(c,20).x<=960-c.width);
 const center=toWorld({x:195,y:422},{x:0,y:0,width:390,height:844},c);assert.ok(Math.abs(center.x-480)<1);
});
test('each toy can persist and restore its own state',()=>{
 const prev=defaultStates(),after=changeState(prev,'cooking','ingredient:1');
 assert.equal(prev.cooking.ingredients.length,0);assert.equal(after.cooking.ingredients.length,1);
 assert.equal(restoreStates(after).cooking.ingredients.length,1);
 assert.deepEqual(restoreStates({cooking:{ingredients:[]}}).drawing,initialState('drawing'));
});
test('native drag uses shared game rules',()=>{
 const after=dragState(defaultStates(),'space','rocket',400,250);assert.equal(after.space.rocket.x,400);assert.equal(after.space.rocket.y,250);
});
test('AST middleware turns all interactive shapes into native handlers',()=>{
 let taps=[],drags=[];
 const root={props:{},children:[{props:{dataAct:'ingredient:0',role:'button',ariaLabel:'Add food'},children:[]},{props:{dataDrag:'rocket',transform:'translate(330 340)',tabindex:'0'},children:[]}]};
 wireScene(root,{onAction:a=>taps.push(a),onDragStart:(k,at)=>drags.push([k,at]),onDragMove(){},onDragEnd(){}});
 root.children[0].props.onPress();assert.deepEqual(taps,['ingredient:0']);
 root.children[1].props.onResponderGrant({nativeEvent:{pageX:1,pageY:2}});
 assert.deepEqual(drags,[['rocket',{x:330,y:340}]]);
 assert.equal(root.children[0].props.dataAct,undefined);
});
