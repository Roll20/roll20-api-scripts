const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const code=fs.readFileSync(require('path').join(__dirname,'../1.5.0/InitiativePulse.js'),'utf8');let count=0;
function test(name,fn){fn();count++;console.log('PASS '+name);}
function setup(legacy=false,options={}){
 const state=legacy?{MANUAL_CONCENTRATION:{spells:{a:'Legacy spell'}}}:{};
 const tokens={},chars={ca:{get:k=>k==='controlledby'?'owner':''}},attrs={constitution_save_bonus:'3',warcaster:'0'},chat=[],dice=[];
 for(const id of ['a','b']) tokens[id]={id,p:{_subtype:'token',name:id,bar1_value:'40',represents:'ca',controlledby:'',layer:'objects',statusmarkers:legacy&&id==='a'?'chained-heart':''},get(k){return this.p[k]},set(k,v){this.p[k]=v}};
 let handlers={},polls=[],timers=[],order=[{id:'a',pr:20},{id:'b',pr:10}],rolls=0;
 const emit=(e,...args)=>(handlers[e]||[]).forEach(f=>f(...args));
 function boot(){handlers={};polls=[];timers=[];vm.runInNewContext(code,{state,on:(e,f)=>(handlers[e]||(handlers[e]=[])).push(f),Campaign:()=>({get:()=>JSON.stringify(order)}),getObj:(t,id)=>t==='graphic'?tokens[id]:chars[id],findObjs:q=>q._type==='graphic'?Object.values(tokens):[],getAttrByName:(id,n)=>(options.attributesByCharacter&&options.attributesByCharacter[id]||attrs)[n],getSheetItem:options.getSheetItem,playerIsGM:id=>id==='gm',sendChat:(s,m)=>chat.push(m),log:()=>{},setTimeout:(f,ms)=>timers.push({f,ms}),setInterval:f=>polls.push(f),randomInteger:()=>{rolls++;return dice.length?dice.shift():10}});emit('ready');}
 function cmd(content,ids=['a'],playerid='gm'){emit('chat:message',{type:'api',content,playerid,selected:ids.map(_id=>({_type:'graphic',_id}))});}
 const checks=()=>Object.keys(state.InitiativePulse.concentration.checks);
 function damage(value,native=true){const prev={bar1_value:tokens.a.get('bar1_value')};tokens.a.set('bar1_value',String(value));if(native){emit('change:graphic:bar1_value',tokens.a,prev);emit('change:graphic',tokens.a,prev);}}
 const poll=()=>polls.forEach(f=>f());
 const roll=(id=checks()[0],who='owner',extra='')=>cmd('!concentration roll --token a --check '+id+extra,[],who);
 const add=(name='Haste',n=10)=>cmd('!pulse effect '+name+' %% '+n+' %% ⭐ %% yes');
 boot();return {state,tokens,chars,attrs,chat,dice,boot,emit,cmd,checks,damage,poll,roll,add,rolls:()=>rolls,timeout:()=>timers.filter(t=>t.ms===10000).forEach(t=>t.f())};
}
test('damage prompts once across property, broad and polling updates',()=>{const h=setup();h.add();h.damage(32);h.poll();assert.equal(h.checks().length,1);assert.equal(h.state.InitiativePulse.concentration.checks[h.checks()[0]].dc,10);assert.ok(h.chat.some(m=>m.includes('Haste')&&m.includes('Click to Roll')));assert.equal(h.rolls(),0);});
test('large damage uses half damage DC; healing needs no check',()=>{const h=setup();h.tokens.a.set('bar1_value','100');h.add();h.damage(60);assert.equal(h.state.InitiativePulse.concentration.checks[h.checks()[0]].dc,20);h.damage(80);assert.equal(h.checks().length,1);});
test('script-only damage detected by polling',()=>{const h=setup();h.add();h.damage(35,false);h.poll();assert.equal(h.checks().length,1);});
test('failed save removes concentration but retains ordinary effect',()=>{const h=setup();h.add();h.cmd('!pulse effect Buff %% 4');h.damage(30);h.dice.push(1);h.roll();assert.equal(h.tokens.a.get('statusmarkers'),'');assert.equal(h.state.InitiativePulse.effects.length,1);assert.equal(h.tokens.a.get('name'),'a 🔹4');});
test('successful save and single-use button',()=>{const h=setup();h.add();h.damage(30);const id=h.checks()[0];h.dice.push(15);h.roll(id);h.roll(id);assert.equal(h.rolls(),1);assert.ok(h.tokens.a.get('statusmarkers').includes('chained-heart'));});
test('War Caster takes higher die',()=>{const h=setup();h.attrs.warcaster='1';h.add();h.damage(30);h.dice.push(1,18);h.roll();assert.equal(h.rolls(),2);assert.ok(h.tokens.a.get('statusmarkers').includes('chained-heart'));assert.ok(h.chat.some(m=>m.includes('War Caster Advantage')));});
test('old button cannot affect recast of same named effect',()=>{const h=setup();h.add();h.damage(30);const id=h.checks()[0];h.add();h.roll(id);assert.equal(h.rolls(),0);assert.equal(h.state.InitiativePulse.effects[0].remaining,10);});
test('unauthorised player cannot consume a check or stop concentration',()=>{const h=setup();h.add();h.damage(30);h.roll(h.checks()[0],'stranger');h.cmd('!concentration stop --token a',[],'stranger');assert.equal(h.rolls(),0);assert.equal(h.checks().length,1);assert.ok(h.tokens.a.get('statusmarkers'));});
test('stored DC cannot be overridden in button command',()=>{const h=setup();h.tokens.a.set('bar1_value',100);h.add();h.damage(60);h.dice.push(10);h.roll(h.checks()[0],'owner',' --dc 1');assert.equal(h.tokens.a.get('statusmarkers'),'');});
test('missing save attribute blocks rolling without consuming request',()=>{const h=setup();delete h.attrs.constitution_save_bonus;h.add();h.damage(30);h.roll();assert.equal(h.rolls(),0);assert.equal(h.checks().length,1);h.attrs.constitution_save_bonus='4';h.roll();assert.equal(h.rolls(),1);});
test('zero HP immediately breaks concentration',()=>{const h=setup();h.add();h.damage(0);assert.equal(h.state.InitiativePulse.effects.length,0);assert.equal(h.tokens.a.get('name'),'a');assert.equal(h.checks().length,0);});
test('all configured breaking markers end concentration',()=>{for(const marker of ['interdiction','pummeled','frozen-orb','fist','sleepy']){const h=setup();h.add();h.tokens.a.set('statusmarkers','chained-heart,'+marker);h.poll();assert.equal(h.state.InitiativePulse.effects.length,0);assert.equal(h.tokens.a.get('statusmarkers'),marker);}});
test('blank HP is not interpreted as zero',()=>{const h=setup();h.tokens.a.set('bar1_value','');h.add();h.poll();assert.equal(h.state.InitiativePulse.effects.length,1);assert.equal(h.checks().length,0);});
test('start at zero or while incapacitated is refused',()=>{const h=setup();h.tokens.a.set('bar1_value',0);h.add();assert.equal(h.state.InitiativePulse.effects.length,0);h.tokens.a.set('bar1_value',30);h.tokens.a.set('statusmarkers','sleepy');h.add();assert.equal(h.state.InitiativePulse.effects.length,0);});
test('manual start/check/stop works for token controller',()=>{const h=setup();h.cmd('!concentration start --token a --name Manual Spell',[],'owner');h.cmd('!concentration check --token a --dc 12',[],'owner');assert.equal(h.checks().length,1);h.cmd('!concentration stop --token a',[],'owner');assert.equal(h.checks().length,0);assert.equal(h.tokens.a.get('statusmarkers'),'');});
test('legacy names import once without altering old source state',()=>{const h=setup(true);assert.equal(h.state.InitiativePulse.concentration.sessions.a.name,'Legacy spell');h.damage(30);assert.ok(h.chat.some(m=>m.includes('Legacy spell')));assert.equal(h.state.MANUAL_CONCENTRATION.spells.a,'Legacy spell');});
test('old unsigned roll button rejected',()=>{const h=setup();h.add();h.cmd('!concentration roll --token a --dc 10',[],'owner');assert.equal(h.rolls(),0);});
test('restart preserves pending bound check and takes a new HP baseline',()=>{const h=setup();h.add();h.damage(30);const id=h.checks()[0];h.boot();assert.equal(h.checks()[0],id);h.dice.push(15);h.roll(id);assert.equal(h.rolls(),1);});
test('hidden token damage reports are GM-only',()=>{const h=setup();h.tokens.a.set('layer','gmlayer');h.add();h.damage(30);const reports=h.chat.filter(m=>m.includes('Click to Roll'));assert.equal(reports.length,1);assert.ok(reports[0].startsWith('/w gm'));});
test('two distinct damage changes create two single-use checks',()=>{const h=setup();h.add();h.damage(35);h.damage(30);assert.equal(h.checks().length,2);h.dice.push(15);h.roll();assert.equal(h.checks().length,1);});
test('new concentration replaces old counter and pending checks only',()=>{const h=setup();h.add('Old');h.cmd('!pulse effect Ordinary %% 4');h.damage(30);const old=h.checks()[0];h.add('New');assert.equal(h.state.InitiativePulse.effects.filter(e=>e.concentration).length,1);assert.ok(!h.state.InitiativePulse.effects.some(e=>e.name==='Old'));assert.ok(h.state.InitiativePulse.effects.some(e=>e.name==='Ordinary'));h.roll(old);assert.equal(h.rolls(),0);});
test('settings persist and custom HP bar detects damage',()=>{const h=setup();h.cmd('!pulse config hpBar 2');h.tokens.a.set('bar2_value',40);h.boot();h.add();h.tokens.a.set('bar2_value',30);h.emit('change:graphic:bar2_value',h.tokens.a,{bar2_value:40});assert.equal(h.checks().length,1);});
test('alternate sheet attributes are used',()=>{const h=setup();h.attrs.custom_save='5';h.attrs.custom_adv='1';h.cmd('!pulse config saveAttribute custom_save');h.cmd('!pulse config warcasterAttribute custom_adv');h.add();h.damage(30);h.dice.push(1,10);h.roll();assert.equal(h.rolls(),2);assert.ok(h.tokens.a.get('statusmarkers'));});
test('custom concentration marker and custom condition mapping work',()=>{const h=setup();h.cmd('!pulse config marker Focus::123');h.cmd('!pulse config conditions Stop::456=Stunned');h.add();assert.equal(h.tokens.a.get('statusmarkers'),'Focus::123');h.tokens.a.set('statusmarkers','Focus::123,Stop::456');h.poll();assert.equal(h.state.InitiativePulse.effects.length,0);assert.equal(h.tokens.a.get('statusmarkers'),'Stop::456');});
test('players cannot alter settings and invalid settings are rejected',()=>{const h=setup();h.cmd('!pulse config hpBar 2',[],'owner');assert.equal(h.state.InitiativePulse.config,undefined);h.cmd('!pulse config hpBar 4');assert.equal(h.state.InitiativePulse.config,undefined);});
test('marker cannot be changed mid-concentration',()=>{const h=setup();h.add();h.cmd('!pulse config marker skull');assert.equal(h.tokens.a.get('statusmarkers'),'chained-heart');assert.equal(h.state.InitiativePulse.config,undefined);});
test('condition monitoring can be explicitly disabled',()=>{const h=setup();h.cmd('!pulse config conditions none');h.add();h.tokens.a.set('statusmarkers','chained-heart,sleepy');h.poll();assert.equal(h.state.InitiativePulse.effects.length,1);});
test('settings changes invalidate pending saves',()=>{const h=setup();h.add();h.damage(30);const id=h.checks()[0];h.cmd('!pulse config saveAttribute constitution_save_bonus');h.roll(id);assert.equal(h.rolls(),0);});

test('NPC uses shared save bonus even when NPC-specific fields differ',()=>{const h=setup();Object.assign(h.attrs,{npc:'1',constitution_save_bonus:'+7',npc_con_save:'0',npc_con_save_base:'1',constitution_mod:'2'});h.add();h.damage(30);h.dice.push(3);h.roll();assert.ok(h.tokens.a.get('statusmarkers'));assert.ok(h.chat.some(m=>m.includes('3 + 7 =')));});
test('NPC explicit zero bonus is not replaced by other fields',()=>{const h=setup();Object.assign(h.attrs,{npc:'1',constitution_save_bonus:'0',npc_con_save:'5',constitution_mod:'5'});h.add();h.damage(30);h.dice.push(9);h.roll();assert.equal(h.tokens.a.get('statusmarkers'),'');});
test('NPC negative shared save bonus is used directly',()=>{const h=setup();Object.assign(h.attrs,{npc:'1',constitution_save_bonus:'-2',npc_con_save:'8',constitution_mod:'5'});h.add();h.damage(30);h.dice.push(11);h.roll();assert.equal(h.tokens.a.get('statusmarkers'),'');assert.ok(h.chat.some(m=>m.includes('11 − 2 =')));});
test('NPC shared bonus works without NPC-specific save fields',()=>{const h=setup();Object.assign(h.attrs,{npc:'1',constitution_save_bonus:'6'});h.add();h.damage(30);h.dice.push(4);h.roll();assert.ok(h.tokens.a.get('statusmarkers'));});
test('NPC missing shared bonus blocks without falling back or consuming request',()=>{const h=setup();Object.assign(h.attrs,{npc:'1',npc_con_save:'9',npc_con_save_base:'8',constitution_mod:'7'});delete h.attrs.constitution_save_bonus;h.add();h.damage(30);h.roll();assert.equal(h.rolls(),0);assert.equal(h.checks().length,1);});
test('NPC invalid shared bonus blocks instead of falling back silently',()=>{const h=setup();Object.assign(h.attrs,{npc:'1',constitution_save_bonus:'@{constitution_mod}',npc_con_save:'8',constitution_mod:'5'});h.add();h.damage(30);h.roll();assert.equal(h.rolls(),0);assert.equal(h.checks().length,1);});
test('custom save attribute applies to NPCs',()=>{const h=setup();Object.assign(h.attrs,{npc:'1',constitution_save_bonus:'0',custom_save:'8'});h.cmd('!pulse config saveAttribute custom_save');h.add();h.damage(30);h.dice.push(2);h.roll();assert.ok(h.tokens.a.get('statusmarkers'));});
test('diagnose identifies shared NPC save bonus and value',()=>{const h=setup();Object.assign(h.attrs,{npc:'1',constitution_save_bonus:'2',constitution_mod:'9'});h.cmd('!pulse diagnose');assert.ok(h.chat.some(m=>m.includes('save = 2 (attribute: constitution_save_bonus)')&&m.includes('save ready')));});
test('PC ignores NPC fields when NPC flag is off',()=>{const h=setup();Object.assign(h.attrs,{npc:'0',npc_con_save:'9'});h.add();h.damage(30);h.dice.push(6);h.roll();assert.equal(h.tokens.a.get('statusmarkers'),'');});

test('PC uses the save bonus even if the old mod attribute also exists',()=>{const h=setup();h.attrs.constitution_save_mod='0';h.attrs.constitution_save_bonus='7';h.add();h.damage(30);h.dice.push(3);h.roll();assert.ok(h.tokens.a.get('statusmarkers'));assert.ok(h.chat.some(m=>m.includes('3 + 7 =')));});
test('upgrade corrects the saved old default and invalidates pending saves',()=>{const h=setup();h.add();h.damage(30);h.state.InitiativePulse.config={saveAttribute:'constitution_save_mod',hpBar:1};delete h.state.InitiativePulse.playerSaveDefaultCorrected;h.boot();assert.equal(h.state.InitiativePulse.config.saveAttribute,'constitution_save_bonus');assert.equal(h.checks().length,0);h.cmd('!pulse diagnose');assert.ok(h.chat.some(m=>m.includes('attribute: constitution_save_bonus')));});
test('upgrade preserves other custom save attribute names',()=>{const h=setup();h.state.InitiativePulse.config={saveAttribute:'custom_save',sheet:'2014'};delete h.state.InitiativePulse.playerSaveDefaultCorrected;h.boot();assert.equal(h.state.InitiativePulse.config.saveAttribute,'custom_save');});
test('upgrade preserves an explicit custom legacy profile using the old name',()=>{const h=setup();h.state.InitiativePulse.config={saveAttribute:'constitution_save_mod',sheet:'custom'};delete h.state.InitiativePulse.playerSaveDefaultCorrected;h.boot();assert.equal(h.state.InitiativePulse.config.saveAttribute,'constitution_save_mod');});
const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
function deferred(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};}
async function asyncTest(name,fn){await fn();count++;console.log('PASS '+name);}
(async()=>{
await asyncTest('2024 reads the computed total and suppresses duplicate clicks',async()=>{
 const calls=[],d=deferred(),h=setup(false,{getSheetItem:(id,field)=>{calls.push([id,field]);return d.promise;}});
 h.cmd('!pulse setup sheet 2024');h.add();h.damage(30);h.dice.push(3);h.roll();h.roll();await flush();assert.equal(h.rolls(),0);
 d.resolve(7);await flush();assert.deepEqual(calls,[['ca','constitution_save_bonus']]);assert.equal(h.rolls(),1);assert.ok(h.tokens.a.get('statusmarkers'));assert.equal(h.checks().length,0);
});
await asyncTest('2024 zero total is valid and never falls back to legacy attributes',async()=>{
 const h=setup(false,{getSheetItem:async()=>0});h.cmd('!pulse setup sheet 2024');h.attrs.constitution_save_bonus='20';h.add();h.damage(30);h.dice.push(9);h.roll();await flush();assert.equal(h.tokens.a.get('statusmarkers'),'');
});
await asyncTest('2024 negative total is applied',async()=>{
 const h=setup(false,{getSheetItem:async()=>-2});h.cmd('!pulse setup sheet 2024');h.add();h.damage(30);h.dice.push(11);h.roll();await flush();assert.ok(h.chat.some(m=>m.includes('11 − 2 =')));assert.equal(h.tokens.a.get('statusmarkers'),'');
});
await asyncTest('mixed game resolves sheet per character and stores choices across restart',async()=>{
 const calls=[],h=setup(false,{getSheetItem:async(id,field)=>{calls.push(id);return 8;}});
 h.chars.cb={get:k=>k==='controlledby'?'owner':'Second'};h.tokens.b.set('represents','cb');
 h.cmd('!pulse setup selected-sheet 2024',['b']);h.boot();h.cmd('!pulse diagnose',['a','b']);await flush();
 assert.deepEqual(calls,['cb']);assert.ok(h.chat.some(m=>m.includes('sheet 2014')&&m.includes('save = 3')));assert.ok(h.chat.some(m=>m.includes('sheet 2024')&&m.includes('save = 8')));
 h.cmd('!pulse setup selected-sheet default',['b']);h.cmd('!pulse diagnose',['b']);await flush();assert.equal(calls.length,1);
});
await asyncTest('setup advantage Yes persists and works for 2024',async()=>{
 const h=setup(false,{getSheetItem:async()=>3});h.cmd('!pulse setup sheet 2024');h.cmd('!pulse setup advantage yes');h.boot();h.add();h.damage(30);h.dice.push(1,15);h.roll();await flush();assert.equal(h.rolls(),2);assert.ok(h.tokens.a.get('statusmarkers'));
});
await asyncTest('setup advantage No overrides legacy War Caster',async()=>{
 const h=setup();h.attrs.warcaster='1';h.cmd('!pulse setup advantage no');h.add();h.damage(30);h.dice.push(1,20);h.roll();assert.equal(h.rolls(),1);assert.equal(h.tokens.a.get('statusmarkers'),'');
});
await asyncTest('2024 default advantage never reads legacy War Caster',async()=>{
 const h=setup(false,{getSheetItem:async()=>3});h.attrs.warcaster='1';h.cmd('!pulse setup sheet 2024');h.add();h.damage(30);h.roll();await flush();assert.equal(h.rolls(),1);
});
await asyncTest('missing Beacon API keeps the request and explains sandbox requirement',async()=>{
 const h=setup();h.cmd('!pulse setup sheet 2024');h.add();h.damage(30);h.roll();assert.equal(h.rolls(),0);assert.equal(h.checks().length,1);assert.ok(h.chat.some(m=>m.includes('Experimental API sandbox')));
});
await asyncTest('rejected sheet read can be retried without consuming request',async()=>{
 let fail=true;const h=setup(false,{getSheetItem:async()=>{if(fail)throw Error('offline');return 4;}});
 h.cmd('!pulse setup sheet 2024');h.add();h.damage(30);h.roll();await flush();assert.equal(h.rolls(),0);assert.equal(h.checks().length,1);
 fail=false;h.roll();await flush();assert.equal(h.rolls(),1);
});
await asyncTest('non-numeric Beacon data blocks instead of guessing a modifier',async()=>{
 for(const value of ['',null,{},true,[],Infinity,'1d4+3',undefined]){
  const h=setup(false,{getSheetItem:async()=>value});h.cmd('!pulse setup sheet 2024');h.add();h.damage(30);h.roll();await flush();assert.equal(h.rolls(),0);assert.equal(h.checks().length,1);
 }
});
await asyncTest('timed-out reads allow retry and ignore the late first result',async()=>{
 const d=deferred();let calls=0;const h=setup(false,{getSheetItem:()=>++calls===1?d.promise:Promise.resolve(4)});
 h.cmd('!pulse setup sheet 2024');h.add();h.damage(30);h.roll();await flush();h.timeout();assert.equal(h.checks().length,1);h.roll();await flush();assert.equal(h.rolls(),1);
 d.resolve(-100);await flush();assert.equal(h.rolls(),1);assert.ok(h.tokens.a.get('statusmarkers'));
});
await asyncTest('spell replacement during a sheet read prevents stale roll',async()=>{
 const d=deferred(),h=setup(false,{getSheetItem:()=>d.promise});h.cmd('!pulse setup sheet 2024');h.add('Old');h.damage(30);h.roll();await flush();h.add('New');d.resolve(-100);await flush();assert.equal(h.rolls(),0);assert.equal(h.state.InitiativePulse.effects[0].name,'New');
});
await asyncTest('marker loss during a sheet read prevents stale roll',async()=>{
 const d=deferred(),h=setup(false,{getSheetItem:()=>d.promise});h.cmd('!pulse setup sheet 2024');h.add();h.damage(30);h.roll();await flush();h.tokens.a.set('statusmarkers','');d.resolve(10);await flush();assert.equal(h.rolls(),0);assert.equal(h.state.InitiativePulse.effects.length,0);
});
await asyncTest('zero HP during a sheet read prevents stale roll',async()=>{
 const d=deferred(),h=setup(false,{getSheetItem:()=>d.promise});h.cmd('!pulse setup sheet 2024');h.add();h.damage(30);h.roll();await flush();h.tokens.a.set('bar1_value','0');d.resolve(10);await flush();assert.equal(h.rolls(),0);
});
await asyncTest('settings changes during a sheet read invalidate the old request',async()=>{
 const d=deferred(),h=setup(false,{getSheetItem:()=>d.promise});h.cmd('!pulse setup sheet 2024');h.add();h.damage(30);h.roll();await flush();h.cmd('!pulse setup advantage yes');d.resolve(10);await flush();assert.equal(h.rolls(),0);assert.equal(h.checks().length,0);
});
await asyncTest('changed token character during a sheet read prevents stale roll',async()=>{
 const d=deferred(),h=setup(false,{getSheetItem:()=>d.promise});h.cmd('!pulse setup sheet 2024');h.add();h.damage(30);h.roll();await flush();h.tokens.a.set('represents','other');d.resolve(10);await flush();assert.equal(h.rolls(),0);
});
await asyncTest('controller permission is rechecked after a sheet read',async()=>{
 const d=deferred(),h=setup(false,{getSheetItem:()=>d.promise});h.cmd('!pulse setup sheet 2024');h.add();h.damage(30);h.roll();await flush();h.chars.ca={get:()=>''};d.resolve(10);await flush();assert.equal(h.rolls(),0);assert.equal(h.checks().length,1);
});
await asyncTest('setup is GM-only and rejects invalid choices',async()=>{
 const h=setup();h.cmd('!pulse setup sheet 2024',[],'owner');h.cmd('!pulse setup advantage yes',['a'],'owner');h.cmd('!pulse setup sheet typo');h.cmd('!pulse setup advantage typo');assert.equal(h.state.InitiativePulse.config,undefined);assert.equal(h.state.InitiativePulse.characterOptions,undefined);
});
await asyncTest('unlinked tokens cannot be configured or rolled',async()=>{
 const h=setup();h.tokens.a.set('represents','');h.cmd('!pulse setup advantage yes');assert.equal(h.state.InitiativePulse.characterOptions,undefined);h.add();h.damage(30);h.roll(undefined,'gm');assert.equal(h.rolls(),0);assert.ok(h.chat.some(m=>m.includes('Represents Character')));
});
await asyncTest('custom legacy profile also uses the configured shared save',async()=>{
 const h=setup();Object.assign(h.attrs,{npc:'1',npc_con_save:'20'});h.cmd('!pulse setup sheet custom');h.add();h.damage(30);h.dice.push(6);h.roll();assert.equal(h.tokens.a.get('statusmarkers'),'');
});
await asyncTest('computed property override is read from 2024 sheets',async()=>{
 const calls=[],h=setup(false,{getSheetItem:async(id,key)=>{calls.push(key);return 5;}});
 h.cmd('!pulse config computedSaveAttribute user.concentration_total');h.cmd('!pulse setup sheet 2024');h.cmd('!pulse diagnose');await flush();assert.deepEqual(calls,['user.concentration_total']);
});
console.log(count+' concentration engine scenarios passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
