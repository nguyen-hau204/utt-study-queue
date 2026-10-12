const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');
test('Tab lease excludes concurrent tabs and ignores stale releases from an old run',async()=>{
 const values={};let handler;const chrome={runtime:{onMessage:{addListener:h=>handler=h}},action:{onClicked:{addListener:()=>{}}},tabs:{onRemoved:{addListener:()=>{}}},storage:{session:{get:async k=>k===null?values:{[k]:values[k]},set:async data=>Object.assign(values,data),remove:async keys=>{for(const k of [].concat(keys))delete values[k];}}}};
 vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../background.js'),'utf8'),{chrome,Date});
 const send=(message,tab)=>new Promise(resolve=>handler(message,{tab:{id:tab},url:'https://hoctructuyen.utt.edu.vn/learn/lop-hoc/chi-tiet/course'},resolve));
 const lease=(run,acquire=true)=>({type:'lease',course:'course',run,acquire});
 assert.equal((await send(lease('one'),1)).ok,true);assert.equal((await send(lease('two'),2)).ok,false);
 assert.equal((await send(lease('new-run'),1)).ok,true);
 await send({type:'release',course:'course',run:'one'},1);
 assert.equal(values['owner:course'].run,'new-run');
 assert.equal((await send(lease('one',false),1)).ok,false);
 await send({type:'release',course:'course',run:'new-run'},1);
 assert.equal((await send(lease('two'),2)).ok,true);
});
test('Continuation is stored before navigation, is isolated per tab, and rejects external or unrelated URLs',async()=>{
 const values={},actions=[];let handler;const chrome={runtime:{onMessage:{addListener:h=>handler=h}},action:{onClicked:{addListener:()=>{}}},tabs:{
  onRemoved:{addListener:()=>{}},update:async(tab,opts)=>{assert.ok(values['flow:'+tab]);actions.push(opts.url);},reload:async tab=>{assert.ok(values['flow:'+tab]);actions.push('reload');}},
  storage:{session:{get:async k=>k===null?values:{[k]:values[k]},set:async data=>Object.assign(values,structuredClone(data)),remove:async keys=>{for(const k of [].concat(keys))delete values[k];}}}};
 vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../background.js'),'utf8'),{chrome,Date,URL});
 const send=(message,tab=1)=>new Promise(resolve=>handler(message,{tab:{id:tab},url:'https://hoctructuyen.utt.edu.vn/learn/lop-hoc/chi-tiet/course'},resolve));
 const flow={token:'test',phase:'play',kind:'play',courses:[]};
 for(const url of ['https://evil.test/','https://hoctructuyen.utt.edu.vn/thi-truc-tuyen','https://hoctructuyen.utt.edu.vn/learn/lop-hoc/chi-tiet/course?extra=1'])assert.equal((await send({type:'navigate',url,flow})).ok,false);
 assert.equal(actions.length,0);
 assert.equal((await send({type:'navigate',url:'/learn/lop-hoc/chi-tiet/next-course',flow})).ok,true);
 await send({type:'flow-get'});assert.equal(actions[0],'https://hoctructuyen.utt.edu.vn/learn/lop-hoc/chi-tiet/next-course');
 assert.equal((await send({type:'flow-get'},2)).flow,null);
 assert.equal((await send({type:'flow-put',flow},2)).ok,false,'Only one tab drives a multi-course journey');
 assert.equal((await send({type:'reload',flow:{...flow,phase:'resume'}})).ok,true);
 await send({type:'flow-get'});assert.equal(actions.at(-1),'reload');
 await send({type:'flow-clear'});assert.equal((await send({type:'flow-get'})).flow,null);
 assert.equal((await send({type:'flow-put',flow},2)).ok,true);
 values['flow:2'].expires=0;assert.equal((await send({type:'flow-get'},2)).flow,null);
 await send({type:'flow-clear'},2);
 values['owner:playing-course']={tab:2,run:'single',expires:Date.now()+10000};
 assert.equal((await send({type:'flow-put',flow:{...flow,kind:'scan',phase:'catalog'}},1)).ok,false,'Auto discovery must not interrupt playback in another tab');
 assert.equal((await send({type:'flow-put',flow:{...flow,kind:'scan',phase:'catalog'}},2)).ok,true);
});
