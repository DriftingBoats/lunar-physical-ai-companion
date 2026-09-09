import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HoldInput, initialState, reduce } from './state.js';
for (const duration of [349,350,351]) test(`A release at ${duration}ms`,()=>{const events=[];const input=new HoldInput(e=>events.push(e));input.down(0);input.up(duration);assert.deepEqual(events,duration<350?['interact']:['listen','release']);});
test('held key starts once, cancellation suppresses release',()=>{const events=[];const input=new HoldInput(e=>events.push(e));input.down(0);input.tick(350);input.tick(800);input.cancel();input.up(900);assert.deepEqual(events,['listen']);});
test('conversation preserves sleeping life and queued reminder',()=>{let s={...initialState(),life:'sleep',reminder:true};for(const event of ['listen','release','reply','finish'])s=reduce(s,event);assert.equal(s.life,'sleep');assert.equal(s.reminder,true);assert.equal(s.conversation,null);});
test('offline release returns home without reply',()=>{let s={...initialState(),online:false};s=reduce(reduce(s,'listen'),'release');assert.equal(s.conversation,null);assert.match(s.message,/离线/);assert.deepEqual(reduce(s,'reply'),s);});
test('menu cancels session and rejects stale reply and recording',()=>{const s=reduce(reduce(reduce(initialState(),'listen'),'release'),'menu');assert.equal(s.conversation,null);assert.deepEqual(reduce(s,'reply'),s);assert.deepEqual(reduce(s,'listen'),s);});
