const fs=require('fs'), vm=require('vm'), assert=require('assert/strict');
const code=fs.readFileSync(require('path').join(__dirname,'../1.5.0/InitiativePulse.js'),'utf8');
let total=0;
function scenario(label,fn){fn();total++;console.log('PASS '+label);}
function setup(itpFirst, single=false){
 const handlers={}, timers=[], polls=[], state={}, chat=[], tokens={};
 ['a','b','c'].forEach(id=>tokens[id]={id,attrs:{name:id,_subtype:'token'},get(k){return this.attrs[k]},set(k,v){this.attrs[k]=v}});
 let order=single?[{id:'a',pr:25},{id:'-1',pr:-100,custom:'▶ Round 1'}]:[{id:'a',pr:25},{id:'b',pr:15},{id:'c',pr:5},{id:'-1',pr:-100,custom:'▶ Round 1'}];
 const campaign={get:()=>JSON.stringify(order)};
 const on=(e,f)=>(handlers[e]||(handlers[e]=[])).push(f);
 const emit=(e,...args)=>(handlers[e]||[]).forEach(f=>f(...args));
 let paused=false, delayed=false;
 function move(){order.push(order.shift());if(order[0].id==='-1'){const marker=order.shift();marker.custom=marker.custom.replace(/\d+/,n=>String(Number(n)+1));order.push(marker);}}
 function itp(msg){if(msg.content==='!eot'&&!paused&&msg.playerid!=='denied'){if(delayed)timers.push(move);else move();}}
 if(itpFirst)on('chat:message',itp);
 vm.runInNewContext(code,{state,on,Campaign:()=>campaign,getObj:(t,id)=>tokens[id],playerIsGM:id=>id==='gm',sendChat:(s,m)=>chat.push(m),log:()=>{},setTimeout:f=>timers.push(f),setInterval:f=>polls.push(f),findObjs:()=>[]});
 emit('ready');if(!itpFirst)on('chat:message',itp);
 function cmd(content,selected=[],playerid='gm'){emit('chat:message',{type:'api',content,playerid,selected:selected.map(_id=>({_type:'graphic',_id}))});}
 function flush(){while(timers.length)timers.shift()();}
 function poll(){polls.forEach(f=>f());}
 function native(){const prev={turnorder:JSON.stringify(order)};move();emit('change:campaign:turnorder',campaign,prev);}
 cmd('!pulse effect Buff %% 8',['a','b','c']);cmd('!pulse action Lair %% 20 %% yes');
 return {emit,cmd,flush,poll,native,tokens,state,chat,order:()=>order,remaining:id=>state.InitiativePulse.effects.find(e=>e.tokenId===id).remaining,actions:()=>chat.filter(m=>m.startsWith('/direct ')&&m.includes('<b>Lair</b>')).length,pause:v=>paused=v,delay:v=>delayed=v,move};
}
for(const first of [true,false]){
 scenario('EOT clocks work with ITP '+(first?'before':'after')+' Pulse',()=>{
  const h=setup(first);h.cmd('!eot',[],'player');h.flush();h.poll();assert.equal(h.remaining('a'),7);assert.equal(h.remaining('b'),8);assert.equal(h.actions(),1);
  h.poll();h.flush();assert.equal(h.remaining('a'),7);assert.equal(h.actions(),1);
 });
 scenario('round separator auto-skip works with ITP '+(first?'before':'after'),()=>{
  const h=setup(first);for(let i=0;i<3;i++){h.cmd('!eot');h.flush();}h.poll();
  assert.equal(h.remaining('a'),7);assert.equal(h.remaining('b'),7);assert.equal(h.remaining('c'),7);assert.equal(h.order()[0].id,'a');
  h.cmd('!eot');h.flush();assert.equal(h.remaining('a'),6);assert.equal(h.actions(),2);
 });
 scenario('rapid EOT commands retain intermediate transitions '+first,()=>{
  const h=setup(first);for(let i=0;i<4;i++)h.cmd('!eot');h.flush();h.poll();assert.equal(h.remaining('a'),6);assert.equal(h.remaining('b'),7);assert.equal(h.remaining('c'),7);assert.equal(h.actions(),2);
 });
}
scenario('paused or denied EOT changes nothing',()=>{
 const h=setup(false);h.pause(true);h.cmd('!eot');h.flush();h.poll();h.pause(false);h.cmd('!eot',[],'denied');h.flush();h.poll();assert.equal(h.remaining('a'),8);assert.equal(h.actions(),0);
});
scenario('native buttons plus fallback do not double count',()=>{
 const h=setup(false);h.native();h.poll();h.poll();assert.equal(h.remaining('a'),7);assert.equal(h.actions(),1);h.cmd('!eot');h.flush();assert.equal(h.remaining('b'),7);
});
scenario('delayed script-only advance is detected',()=>{
 const h=setup(false);h.delay(true);h.cmd('!eot');h.flush();h.poll();assert.equal(h.remaining('a'),7);assert.equal(h.actions(),1);
});
scenario('single actor plus round marker completes a full cycle',()=>{
 const h=setup(false,true);h.cmd('!eot');h.flush();h.poll();assert.equal(h.remaining('a'),7);assert.equal(h.actions(),1);
 h.cmd('!eot');h.flush();assert.equal(h.remaining('a'),6);assert.equal(h.actions(),2);
});
scenario('round message does not double tick after EOT',()=>{
 const h=setup(true);h.cmd('!eot');h.flush();h.cmd('!pulse-round 2');h.poll();assert.equal(h.remaining('a'),7);
});
scenario('poll catches a script write without any chat or native event',()=>{
 const h=setup(true);h.move();h.poll();assert.equal(h.remaining('a'),7);assert.equal(h.actions(),1);
});
scenario('adding an effect after an unseen advance does not backdate its tick',()=>{
 const h=setup(true);h.move();h.cmd('!pulse effect New %% 4',['a']);h.poll();assert.equal(h.state.InitiativePulse.effects.find(e=>e.name==='New').remaining,4);assert.equal(h.remaining('a'),7);
});
scenario('concentration Yes adds marker while preserving other markers',()=>{
 const h=setup(true);h.tokens.a.set('statusmarkers','red@2,custom::42');h.cmd('!pulse effect Focus %% 3 %% ⭐ %% yes',['a']);
 assert.equal(h.tokens.a.get('statusmarkers'),'red@2,custom::42,chained-heart');assert.ok(h.state.InitiativePulse.effects.find(e=>e.name==='Focus').concentration);
});
scenario('No and omitted concentration leave markers unchanged',()=>{
 const h=setup(true);h.tokens.a.set('statusmarkers','blue');h.cmd('!pulse effect Plain %% 3 %% ⭐ %% no',['a']);assert.equal(h.tokens.a.get('statusmarkers'),'blue');
 h.cmd('!pulse effect Old macro %% 2',['a']);assert.equal(h.tokens.a.get('statusmarkers'),'blue');
});
scenario('last concentration expiry removes only its own marker',()=>{
 const h=setup(true);h.tokens.a.set('statusmarkers','red@2');h.cmd('!pulse effect Focus %% 1 %% ⭐ %% yes',['a']);h.cmd('!eot');h.flush();
 assert.equal(h.tokens.a.get('statusmarkers'),'red@2');assert.equal(h.remaining('a'),7);
});
scenario('replacement concentration keeps marker until replacement is removed',()=>{
 const h=setup(true);h.cmd('!pulse effect First %% 1 %% ⭐ %% yes',['a']);h.cmd('!pulse effect Second %% 3 %% 🔹 %% yes',['a']);h.cmd('!eot');h.flush();
 assert.equal(h.tokens.a.get('statusmarkers'),'chained-heart');const id=h.state.InitiativePulse.effects.find(e=>e.name==='Second').id;h.cmd('!pulse remove '+id);assert.equal(h.tokens.a.get('statusmarkers'),'');
});
scenario('re-adding with No releases the owned marker',()=>{
 const h=setup(true);h.cmd('!pulse effect Focus %% 3 %% ⭐ %% yes',['a']);h.cmd('!pulse effect Focus %% 3 %% ⭐ %% no',['a']);assert.equal(h.tokens.a.get('statusmarkers'),'');
});
scenario('new concentration replaces pre-existing concentration and cleans its marker',()=>{
 const h=setup(true);h.tokens.a.set('statusmarkers','chained-heart@2,red');h.cmd('!pulse effect Focus %% 1 %% ⭐ %% yes',['a']);h.cmd('!eot');h.flush();h.cmd('!pulse clear');assert.equal(h.tokens.a.get('statusmarkers'),'red');
});
scenario('clear and clean remove Pulse-owned concentration markers',()=>{
 const h=setup(true);h.cmd('!pulse effect Focus %% 3 %% ⭐ %% yes',['a','b']);h.cmd('!pulse clear');assert.equal(h.tokens.a.get('statusmarkers'),'');assert.equal(h.tokens.b.get('statusmarkers'),'');
 h.cmd('!pulse effect Focus %% 3 %% ⭐ %% yes',['a']);h.cmd('!pulse clean');assert.equal(h.tokens.a.get('statusmarkers'),'');
});
scenario('invalid concentration choice changes nothing',()=>{
 const h=setup(true);const before=JSON.stringify(h.state);h.cmd('!pulse effect Focus %% 3 %% ⭐ %% maybe',['a']);assert.equal(JSON.stringify(h.state),before);
});
scenario('damage script removal ends only concentration on affected token',()=>{
 const h=setup(true);h.cmd('!pulse effect Focus %% 3 %% ⭐ %% yes',['a','b']);h.cmd('!pulse effect Second %% 2 %% 💠 %% yes',['a']);
 h.tokens.a.set('statusmarkers','red@2');h.poll();
 assert.ok(!h.state.InitiativePulse.effects.some(e=>e.tokenId==='a'&&e.concentration));assert.equal(h.tokens.a.get('name'),'a 🔹8');assert.equal(h.tokens.a.get('statusmarkers'),'red@2');
 assert.ok(h.state.InitiativePulse.effects.some(e=>e.tokenId==='b'&&e.concentration));h.poll();assert.equal(h.chat.filter(m=>m.includes('Concentration ended')).length,1);
});
scenario('manual marker removal ends concentration immediately',()=>{
 const h=setup(true);h.cmd('!pulse effect Focus %% 3 %% ⭐ %% yes',['a']);h.tokens.a.set('statusmarkers','');h.emit('change:graphic:statusmarkers',h.tokens.a);
 assert.ok(!h.state.InitiativePulse.effects.some(e=>e.name==='Focus'));assert.equal(h.tokens.a.get('name'),'a 🔹8');
});
scenario('EOT after failed check never restores concentration marker',()=>{
 const h=setup(true);h.cmd('!pulse effect Focus %% 3 %% ⭐ %% yes',['a']);h.tokens.a.set('statusmarkers','');h.cmd('!eot');h.flush();h.poll();
 assert.equal(h.tokens.a.get('statusmarkers'),'');assert.equal(h.tokens.a.get('name'),'a 🔹7');assert.ok(!h.state.InitiativePulse.effects.some(e=>e.name==='Focus'));
});
scenario('successful check or unrelated marker edit leaves concentration running',()=>{
 const h=setup(true);h.cmd('!pulse effect Focus %% 3 %% ⭐ %% yes',['a']);h.tokens.a.set('statusmarkers','chained-heart@2,red');h.emit('change:graphic:statusmarkers',h.tokens.a);h.poll();
 assert.equal(h.state.InitiativePulse.effects.find(e=>e.name==='Focus').remaining,3);
});
scenario('fresh concentration can be added after a failed check',()=>{
 const h=setup(true);h.cmd('!pulse effect Focus %% 3 %% ⭐ %% yes',['a']);h.tokens.a.set('statusmarkers','');h.cmd('!pulse effect New %% 4 %% ⭐ %% yes',['a']);h.poll();
 assert.ok(!h.state.InitiativePulse.effects.some(e=>e.name==='Focus'));assert.equal(h.state.InitiativePulse.effects.find(e=>e.name==='New').remaining,4);assert.equal(h.tokens.a.get('statusmarkers'),'chained-heart');
});
console.log(total+' integration scenarios passed.');



