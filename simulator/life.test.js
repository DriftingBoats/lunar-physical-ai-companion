import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LifeEngine,sleeping} from './life.js';
test('cross-midnight sleep boundaries',()=>{assert.equal(sleeping(1349),false);assert.equal(sleeping(1350),true);assert.equal(sleeping(479),true);assert.equal(sleeping(480),false);});
test('offline autonomous behavior is deterministic and bounded',()=>{const a=new LifeEngine(),b=new LifeEngine();const date=new Date(2026,8,9,12);for(let t=0;t<7200000;t+=1000){assert.equal(a.update(t,date,'clear',false),b.update(t,date,'clear',false));assert.ok(a.next>t);assert.ok(a.next-t<=180000);}});
test('sleep wakes without replaying missed days',()=>{const a=new LifeEngine();assert.equal(a.update(0,new Date(2026,8,9,23),'clear',false),'sleep');assert.equal(a.update(864000000,new Date(2026,8,19,9),'clear',false),'wake');});
test('invalid time is safe idle and rain directs observation',()=>{const a=new LifeEngine();assert.equal(a.update(0,new Date(NaN),'rain',false),'idle');assert.equal(a.update(1,new Date(2026,8,9,12),'rain',false),'observe');});
