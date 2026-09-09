export const initialState = () => ({ life: 'idle', conversation: null, message: '', online: true, reminder: false, panel: null });
export function reduce(state, event) {
  switch (event) {
    case 'interact': return state.panel ? state : { ...state, message: '嗯，我在这里。' };
    case 'listen': return state.panel ? state : { ...state, conversation: 'listen', message: '' };
    case 'release': return state.conversation === 'listen' ? { ...state, conversation: state.online ? 'think' : null, message: state.online ? '' : '暂时离线，陪你待一会儿。' } : state;
    case 'reply': return state.conversation === 'think' ? { ...state, conversation: 'speak' } : state;
    case 'finish': return { ...state, conversation: null, message: '' };
    case 'back': return { ...state, panel: null, conversation: null, message: '' };
    case 'context': return { ...state, panel: state.panel === 'context' ? null : 'context', conversation: null, message: '' };
    case 'menu': return { ...state, panel: 'menu', conversation: null, message: '' };
    default: return state;
  }
}
export class HoldInput {
  constructor(emit) { this.emit = emit; this.downAt = null; this.long = false; }
  down(now) { if (this.downAt !== null) return; this.downAt = now; this.long = false; }
  tick(now) { if (this.downAt !== null && !this.long && now - this.downAt >= 350) { this.long = true; this.emit('listen'); } }
  up(now) { if (this.downAt === null) return; this.tick(now); this.emit(this.long ? 'release' : 'interact'); this.cancel(); }
  cancel() { this.downAt = null; this.long = false; }
}
