// Technical placeholder only: replace this versioned preset/renderer with approved art.
export const preset = { id:'lunar-placeholder', version:1, name:'Lunar', approved:false,
  animations:['idle','play','observe','sleep','wake','listen','think','speak','away','return','interact'] };
export function drawCharacter(ctx, action, now) {
  if (!preset.animations.includes(action)) action='idle';
  if(action==='away') return null;
  let x=160,y=163;
  if(action==='observe') x=91;
  if(action==='return') x=228;
  const asleep=action==='sleep';
  if(asleep){x=185;y=184;}
  ctx.save();ctx.translate(x,y);
  const ellipse=(x,y,rx,ry,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();};
  ellipse(0,26,36,7,'#87937e');
  ellipse(0,asleep?9:0,asleep?34:26,asleep?17:32,'#f0edda');
  ctx.strokeStyle='#56634f';ctx.lineWidth=2;
  const shut=asleep||now%4800<140;
  for(const dx of [-9,9]){if(shut){ctx.beginPath();ctx.moveTo(dx-3,1);ctx.lineTo(dx+3,1);ctx.stroke();}else ellipse(dx,0,2.3,3.2,'#56634f');}
  ellipse(0,10,3,action==='speak'?2+Math.sin(now/90):1,'#79816b');
  if(action==='play'){ellipse(39,17+Math.sin(now/240)*8,8,8,'#bd946f');}
  if(action==='interact'||action==='wake'){ctx.beginPath();ctx.moveTo(23,8);ctx.lineTo(36,-12+Math.sin(now/160)*5);ctx.stroke();}
  ctx.fillStyle='#56634f';ctx.font='12px sans-serif';
  if(asleep)ctx.fillText('z z',31,-17);
  if(action==='think')ctx.fillText('· · ·',-12,-42);
  if(action==='listen'){ctx.strokeStyle='#b1c19a';ctx.beginPath();ctx.arc(0,0,37,-.7,.7);ctx.stroke();}
  ctx.restore();return {x:x-40,y:y-38,w:85,h:72};
}
