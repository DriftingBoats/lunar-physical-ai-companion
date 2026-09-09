// User-selected account reference; derived artwork, not official source assets.
export const preset = {id:'lunar-gmmtv-adaptation',version:4,name:'Lunar',approved:false,
  source:'https://x.com/lunar_GMMTV',
  personality:{tone:'活泼、俏皮、亲昵，爱分享小事',status:'沿用项目此前公开文案归纳；本轮账号访问403，待复核，非官方完整设定'},
  interaction:'嘿嘿，看到我啦！',reply:'等你忙完，听我说件小事呀。'};
const sheet=new Image();sheet.src='/lunar-poses.png';
export function drawCharacter(ctx,action,now){
  if(action==='away'||!sheet.complete||!sheet.naturalWidth)return null;
  const index=action==='sleep'?3:action==='observe'?2:['play','wake','interact','return'].includes(action)?1:0;
  const sw=sheet.naturalWidth/4,sh=sheet.naturalHeight,h=144,w=h*sw/sh;
  const x=action==='observe'?76:action==='return'?224:164,y=204;
  ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(sheet,index*sw,0,sw,sh,x-w/2,y-h,w,h);ctx.restore();
  return {x:x-w/2,y:y-h,w,h};
}
