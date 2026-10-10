// Instrument the original authored SVG AST with React Native SVG responder events.
// It is converted to native vector elements (not HTML, WebView, or network content).
export function wireScene(root,{onAction,onDragStart,onDragMove,onDragEnd}){
 const walk=node=>{
  if(!node||typeof node!=='object')return;
  const props=node.props||{},action=props.dataAct,drag=props.dataDrag;
  // DOM-only attributes are not supported by react-native-svg native views.
  for(const key of ['dataAct','dataDrag','ariaLabel','tabindex','role','class','xmlns'])delete props[key];
  // Native system font provides automatic locale and font fallback.
  if(props.fontFamily?.includes('ui-rounded'))delete props.fontFamily;
  if(action){
    props.onPress=()=>onAction(String(action));
    props.accessible=true;
    props.accessibilityLabel=String(action).replace(/:/g,' ');
  }
  if(drag){
    const key=String(drag),transform=String(props.transform||'');
    const match=transform.match(/translate\(([-\d.]+)[ ,]([-\d.]+)\)/);
    const at={x:Number(match?.[1]||0),y:Number(match?.[2]||0)};
    props.onStartShouldSetResponder=()=>true;
    props.onResponderGrant=e=>onDragStart(key,at,e.nativeEvent);
    props.onResponderMove=e=>onDragMove(key,e.nativeEvent);
    props.onResponderRelease=e=>onDragEnd(key,e.nativeEvent);
    props.onResponderTerminate=e=>onDragEnd(key,e.nativeEvent);
    props.accessible=true;
    props.accessibilityLabel='Move '+key.replace(/:/g,' ');
  }
  for(const child of node.children||[])walk(child);
 };
 walk(root);return root;
}
