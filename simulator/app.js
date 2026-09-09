import { initialState, reduce, HoldInput } from './state.js';
import { LifeEngine } from './life.js';
import { drawCharacter, preset } from './lunar.js';
const engine = new LifeEngine();
let characterBounds = null, selection = 0;
const $ = id => document.getElementById(id);
const ctx = $('screen').getContext('2d');
let state = initialState(), timers = [];
function clearJobs() { timers.forEach(clearTimeout); timers = []; }
function send(event) {
  if(event==='interact' && state.panel==='menu'){state.panel=['translator','memory','settings'][selection];return;}
  clearJobs(); state = reduce(state, event);
  if(event==='interact' && !state.panel)state.message=preset.interaction;
  if (state.conversation === 'think') timers.push(setTimeout(() => send('reply'), 1000));
  if (state.conversation === 'speak' || state.message) timers.push(setTimeout(() => send('finish'), 2600));
  $('status').textContent = state.message || ({listen:'正在倾听（模拟）',think:'正在思考（模拟）',speak:'今天也一起慢慢来吧。（模拟）'}[state.conversation]) || state.life;
}
const hold = new HoldInput(send);
for (const [id, name] of Object.entries({up:'上',down:'下',left:'左',right:'右'})) {
  $(id).onclick = () => { if(state.panel==='menu' && (id==='up'||id==='down')) selection=(selection+(id==='down'?1:2))%3; $('input-status').textContent = `已收到方向${name}输入`; };
}
const cancel = event => { hold.cancel(); send(event); };
$('a').onpointerdown = e => { if (e.button !== 0) return; e.preventDefault(); $('a').setPointerCapture(e.pointerId); hold.down(performance.now()); };
$('a').onpointerup = () => hold.up(performance.now());
$('a').onpointercancel = () => cancel('back');
$('b').onclick = () => cancel('back');
$('start').onclick = () => cancel('menu');
$('select').onclick = () => cancel('context');
window.addEventListener('blur', () => cancel('back'));
document.addEventListener('keydown', e => {
  if (['SELECT','INPUT','BUTTON'].includes(e.target.tagName) || e.repeat) return;
  const key = e.key.toLowerCase();
  if (!['a','b','enter','s'].includes(key)) return;
  e.preventDefault();
  if (key === 'a') hold.down(performance.now());
  else cancel({b:'back',enter:'menu',s:'context'}[key]);
});
document.addEventListener('keyup', e => { if (e.key.toLowerCase() === 'a') hold.up(performance.now()); });
$('screen').onclick = e => { const rect = e.target.getBoundingClientRect(); const x = (e.clientX-rect.left)*320/rect.width, y = (e.clientY-rect.top)*240/rect.height; const b=characterBounds;if(b && x>=b.x && x<=b.x+b.w && y>=b.y && y<=b.y+b.h && !state.panel && !state.conversation) send('interact'); };
for (const id of ['life','online','reminder']) $(id).onchange = () => { cancel('finish'); state = {...state, [id]:id === 'life' ? $(id).value : $(id).checked}; };
function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h);}
function text(value,x,y,color='#5c6354',size=10){ctx.fillStyle=color;ctx.font=`${size}px "Microsoft YaHei", sans-serif`;ctx.fillText(value,x,y);}
function draw(now) {
  hold.tick(now);
  const date = new Date(), mode = $('time').value;
  if(mode==='day')date.setHours(9,41,0);if(mode==='night')date.setHours(23,0,0);
  const weather=$('weather').value;
  state.life=$('life').value==='auto'?engine.update(now,date,weather,Boolean(state.conversation||state.panel||state.message)):$('life').value;
  const night = mode === 'night' || (mode === 'live' && (date.getHours() >= 19 || date.getHours() < 7));
  const time = date.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false});
  const wall = night?'#434b60':'#ecebd5', ink = night?'#d9dfdf':'#626950';
  rect(0,0,320,240,wall);rect(0,180,320,60,night?'#656476':'#d6d7b8');rect(0,178,320,3,night?'#858291':'#b5bea0');
  text(time,12,17,ink,11);text(state.online?'':'离线',218,17,ink,9);
  if(weather!=='unknown')text(weather==='rain'?'雨 24°':weather==='hot'?'晴 35°':'晴 27°',151,17,ink,10);
  rect(274,8,29,11,ink);rect(276,10,25,7,wall);rect(303,11,2,5,ink);
  if($('battery').value !== 'unknown')rect(277,11,Math.round(Number($('battery').value)*.23),5,Number($('battery').value)<20?'#bc805f':ink);else text('?',285,17,ink,9);
  rect(27,43,80,91,night?'#abb1b4':'#a8b393');rect(31,47,72,83,night?'#28374d':'#c3d7ce');
  if(night){rect(78,57,10,10,'#eeebc3');rect(39,68,2,2,'#d2d6d2');rect(69,88,2,2,'#d2d6d2');}else{rect(43,65,25,7,'#f5f4df');rect(70,93,28,6,'#e9edda');}
  rect(65,47,3,83,night?'#abb1b4':'#a8b393');rect(31,89,72,3,night?'#abb1b4':'#a8b393');rect(22,133,90,5,night?'#95929d':'#b8bc9d');
  if(weather==='rain'){for(let i=0;i<10;i++)rect(34+i*7,50+(now/35+i*13)%75,1,6,'#829da7');}
  if(night){rect(235,73,26,12,'#e2c28d');rect(247,85,2,45,'#b29c79');rect(237,129,23,3,'#b29c79');}
  rect(248,145,27,30,'#b3987c');rect(251,130,5,20,'#788b68');rect(258,116,5,33,'#7a906b');rect(263,125,10,7,'#8a9e73');rect(245,126,13,6,'#8a9e73');
  rect(105,203,110,8,night?'#575c6c':'#bfc7a6');
  characterBounds=drawCharacter(ctx,state.life==='away'?'away':state.conversation||(state.message?'interact':state.life),now);
  if(state.life==='away')text(`${preset.name} 出门了。`,112,169,ink,12);
  if(state.life==='return'){rect(187,183,14,18,'#eee6c8');text('回来了，带了一张贴纸。',81,229,ink,10);}
  if(weather==='hot' && state.life!=='sleep' && state.life!=='away'){rect(204,176,10,15,'#a4bcc3');rect(210,168,2,10,'#edf0dc');}
  const message = ({listen:'在听呢… 松开 A 结束',think:'让我想一想…',speak:preset.reply}[state.conversation]) || state.message;
  if(message){rect(58,64,213,29,night?'#e0e0cf':'#faf8e9');text(message,69,83,'#59614f',11);}
  if(state.reminder && !state.conversation){rect(0,208,320,32,night?'#3b4352':'#e4e7cd');text('10 分钟后 · 起来活动一下',14,229,ink,11);}
  if(state.panel){rect(35,44,250,157,'#f6f4e6');const titles={menu:'功能',context:'今天的小简报',translator:'翻译',memory:'回忆',settings:'设置'};text(titles[state.panel],52,70,'#53614d',13);const lines=state.panel==='menu'?['翻译','回忆','设置'].map((v,i)=>(i===selection?'› ':'  ')+v):state.panel==='context'?['当前：'+state.life,'网络：'+(state.online?'模拟在线':'离线'),'时间：'+time]:['此功能尚未接入','当前仅验证页面入口'];lines.forEach((v,i)=>text(v,52,98+i*23,'#737969',11));text('B 返回',52,185,'#737969',9);}
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
