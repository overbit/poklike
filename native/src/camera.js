// The original toy world is 960x600. Fill the screen, pan the cropped axis, or fit all.
export const WORLD_WIDTH=960, WORLD_HEIGHT=600;
const bound=(v,min,max)=>Math.max(min,Math.min(max,v));
export function computeCamera(width,height,position=null,fit=false){
 if(!(width>0&&height>0)||fit)return {x:0,y:0,width:960,height:600,canPan:false};
 const aspect=width/height,w=Math.min(WORLD_WIDTH,WORLD_HEIGHT*aspect),h=Math.min(WORLD_HEIGHT,WORLD_WIDTH/aspect);
 const maxX=WORLD_WIDTH-w,maxY=WORLD_HEIGHT-h;
 return {x:bound(position?.x??maxX/2,0,maxX),y:bound(position?.y??maxY/2,0,maxY),width:w,height:h,canPan:maxX>8||maxY>8};
}
export function pan(camera,direction){
 if(camera.width<WORLD_WIDTH-1)return {x:bound(camera.x+direction*camera.width*.76,0,WORLD_WIDTH-camera.width),y:camera.y};
 return {x:camera.x,y:bound(camera.y+direction*camera.height*.76,0,WORLD_HEIGHT-camera.height)};
}
export function toWorld(point,frame,camera){
 return {x:camera.x+(point.x-frame.x)*camera.width/frame.width,y:camera.y+(point.y-frame.y)*camera.height/frame.height};
}
