const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');
const code = fs.readFileSync(require('path').join(__dirname,'../1.5.0/InitiativePulse.js'),'utf8');
let handlers, count=0;
const state={InitiativePulse:{schemaVersion:1,nextId:2,actions:[],effects:[{id:'E1',name:'Legacy',remaining:4}],lastRound:null,activeInitiative:null}};
const tokens={};
['a','b','c'].forEach(id=>tokens[id]={id,attrs:{name:id,_subtype:'token',showname:false},get(k){return this.attrs[k]},set(k,v){this.attrs[k]=v}});
const chats=[];
let order=[{id:'a',pr:20},{id:'b',pr:10},{id:'c',pr:5}];
const campaign={get:()=>JSON.stringify(order)};
function emit(e,...args){(handlers[e]||[]).forEach(fn=>fn(...args));}
function boot(){handlers={};vm.runInNewContext(code,{state,setTimeout:()=>{},setInterval:()=>{},on:(e,f)=>(handlers[e]||(handlers[e]=[])).push(f),getObj:(type,id)=>type==='graphic'&&tokens[id],Campaign:()=>campaign,playerIsGM:id=>id==='gm',sendChat:(s,m)=>chats.push(m),log:()=>{},findObjs:()=>[]});emit('ready');}
function cmd(content,ids=[],playerid='gm'){emit('chat:message',{type:'api',content,playerid,selected:ids.map(_id=>({_type:'graphic',_id}))});}
function setOrder(next){const prev={turnorder:JSON.stringify(order)};order=next;emit('change:campaign:turnorder',campaign,prev);}
function advance(){setOrder(order.slice(1).concat(order[0]));}
function effect(name,id){return state.InitiativePulse.effects.find(e=>e.name===name&&e.tokenId===id);}
function check(label,fn){fn();count++;console.log('PASS '+label);}
boot();
check('round notifications do not decrement legacy or token effects',()=>{
 cmd('!pulse effect Bless %% 3 %% 🔹',['a','b']);cmd('!pulse-round 1');cmd('!pulse-round 2');
 assert.equal(effect('Bless','a').remaining,3);assert.equal(state.InitiativePulse.effects[0].remaining,4);
});
check('only outgoing token decrements; action fires at initiative threshold',()=>{
 cmd('!pulse action Lair %% 15 %% yes');advance();
 assert.equal(effect('Bless','a').remaining,2);assert.equal(effect('Bless','b').remaining,3);
 assert.equal(tokens.a.get('name'),'a 🔹2');assert.ok(chats.some(m=>m.includes('<b>Lair</b>')));
});
check('other token end ticks its own effects independently',()=>{advance();assert.equal(effect('Bless','b').remaining,2);assert.equal(effect('Bless','a').remaining,2);});
check('repeating actions recur next initiative cycle',()=>{
 advance();advance();assert.equal(chats.filter(m=>m.startsWith('/direct ')&&m.includes('<b>Lair</b>')).length,2);assert.equal(effect('Bless','a').remaining,1);
});
check('backward rotation with three entries does not decrement',()=>{
 const before=JSON.stringify(state.InitiativePulse.effects);setOrder([order[2],order[0],order[1]]);assert.equal(JSON.stringify(state.InitiativePulse.effects),before);
});
check('expiry removes suffix and whispers GM',()=>{
 advance();assert.equal(effect('Bless','a'),undefined);assert.equal(tokens.a.get('name'),'a');assert.ok(chats.some(m=>m.startsWith('/w gm ')&&m.includes('has expired')));
});
check('bind migrates old global effect without resetting duration',()=>{
 cmd('!pulse bind E1',['b']);assert.equal(effect('Legacy','b').remaining,4);assert.equal(tokens.b.get('name'),'b 🔹4 🔹2');
});
check('new effects require selection; non-GM mutations denied',()=>{
 const before=JSON.stringify(state.InitiativePulse.effects);cmd('!pulse effect Missing %% 3');cmd('!pulse effect Bad %% 2',['a'],'player');cmd('!pulse clear',[],'player');
 assert.equal(JSON.stringify(state.InitiativePulse.effects),before);
});
check('priority edit, insertion, deletion and clearing do not tick',()=>{
 const before=JSON.stringify(state.InitiativePulse.effects);
 setOrder(order.map(e=>({...e,pr:Number(e.pr)+1})));
 setOrder(order.concat({id:'-1',pr:0,custom:'Round'}));setOrder(order.slice(0,-1));setOrder([]);
 assert.equal(JSON.stringify(state.InitiativePulse.effects),before);
});
check('token exiting onto custom round marker decrements once',()=>{
 cmd('!pulse token-effect Haste %% 2 %% ⭐',['a']);
 setOrder([{id:'a',pr:20},{id:'-1',pr:0,custom:'Round'},{id:'b',pr:10}]);advance();
 assert.equal(effect('Haste','a').remaining,1);cmd('!pulse-round 3');assert.equal(effect('Haste','a').remaining,1);
});
check('custom entry ending does not tick any token',()=>{const before=JSON.stringify(state.InitiativePulse.effects);advance();assert.equal(JSON.stringify(state.InitiativePulse.effects),before);});
check('tied initiative still decrements outgoing token',()=>{
 setOrder([{id:'a',pr:10},{id:'b',pr:10},{id:'c',pr:5}]);advance();assert.equal(effect('Haste','a'),undefined);
});
check('two-entry forward rotation is handled',()=>{
 cmd('!pulse effect Test %% 3',['a']);setOrder([{id:'a',pr:10},{id:'b',pr:5}]);advance();assert.equal(effect('Test','a').remaining,2);
});
check('unchanged or single-entry tracker does not invent turns',()=>{
 const before=effect('Test','a').remaining;setOrder([{id:'a',pr:10}]);setOrder([{id:'a',pr:10}]);assert.equal(effect('Test','a').remaining,before);
});
check('edit, rename and restart preserve counters',()=>{
 cmd('!pulse edit '+effect('Test','a').id+' %% 7');tokens.a.set('name','Renamed 🔹7');emit('change:graphic:name',tokens.a);boot();assert.equal(tokens.a.get('name'),'Renamed 🔹7');assert.equal(tokens.a.get('showname'),false);
});
check('clear restores names without changing tracker',()=>{
 const before=JSON.stringify(order);cmd('!pulse clear');assert.equal(tokens.a.get('name'),'Renamed');assert.equal(tokens.b.get('name'),'b');assert.equal(JSON.stringify(order),before);
});
check('sorting and initiative edits do not fire actions',()=>{
 cmd('!pulse action Sort guard %% 15 %% yes');const before=chats.filter(m=>m.startsWith('/direct ')).length;
 setOrder([{id:'a',pr:25},{id:'b',pr:10},{id:'c',pr:5}]);setOrder([{id:'c',pr:5},{id:'b',pr:10},{id:'a',pr:25}]);
 setOrder([{id:'c',pr:30},{id:'b',pr:10},{id:'a',pr:25}]);assert.equal(chats.filter(m=>m.startsWith('/direct ')).length,before);
});
console.log(count+' scenarios passed.');


