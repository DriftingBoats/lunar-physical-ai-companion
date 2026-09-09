// Deterministic, offline host model. All times are injectable milliseconds.
export function sleeping(minutes, start = 1350, end = 480) {
  return start > end ? minutes >= start || minutes < end : minutes >= start && minutes < end;
}
export class LifeEngine {
  constructor(seed = 17) { this.seed = seed; this.state = 'idle'; this.next = 0; }
  update(now, date, weather, occupied, start = 1350, end = 480) {
    if (!Number.isFinite(date.getTime())) { this.state = 'idle'; return this.state; }
    if (occupied) return this.state;
    if (sleeping(date.getHours()*60+date.getMinutes(), start, end)) { this.state='sleep'; this.next=0; return this.state; }
    if (this.state === 'sleep') { this.state='wake'; this.next=now+4000; return this.state; }
    if (now >= this.next) {
      this.seed = (Math.imul(this.seed,1664525)+1013904223)>>>0;
      this.state = weather === 'rain' ? 'observe' : ['idle','play','observe'][this.seed%3];
      this.next = now + 30000 + (this.seed%151)*1000;
    }
    return this.state;
  }
}
