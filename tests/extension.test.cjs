const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const FakeTimers=require('@sinonjs/fake-timers');
const extension=path.resolve(__dirname,'..');
const C=require(path.join(extension,'core.js'));
test('Parse real UTT columns, fractional minutes, and unnamed video with minute requirement',()=>{
 const {state}=require('./fixture.js');const rows=C.parseRows(state.rows);
 assert.equal(rows.length,4);assert.equal(rows[0].credited,1.5);assert.equal(rows[0].required,4);
 assert.equal(C.remaining(rows[0]),2.5);assert.equal(rows[1].complete,true);assert.equal(C.remaining(rows[1]),0);
 assert.equal(rows[2].name,'C_23_Final');assert.equal(rows[3].required,null);
 assert.equal(C.number('---'),null);assert.equal(C.number('0'),0);assert.equal(C.number('3,7'),3.7);
 assert.equal(C.minutesRequired('Phải học tối thiểu\u00a09\u00a0(phút)'),9);
});
test('Normalize stars, spacing and duplicate labels without conflating occurrences',()=>{
 assert.equal(C.key('Video_C_12_Final\u00a0*'),C.key('Video_C_12_Final'));
 const rows=C.parseRows([['Video A','---','','','0','','Chưa hoàn thành'],['Video A','---','','','3','','Đã hoàn thành']]);
 assert.notEqual(rows[0].id,rows[1].id);
 assert.equal(C.next(rows,new Set(rows.map(r=>r.id))).id,rows[0].id);
 assert.equal(C.next(rows,new Set(rows.map(r=>r.id)),new Set([rows[0].id])),undefined);
});
test('Count moving playback only; reject seeking, pause, buffering, dialog and timer suspension',()=>{
 const p={id:'a',source:'v',now:1000,time:10,rate:1,paused:false,seeking:false,readyState:4,blocked:false};
 const s={...p,now:2000,time:11};
 assert.equal(C.activeSeconds(p,s),1);
 assert.equal(C.activeSeconds(p,{...s,time:80}),0);
 for(const change of [{paused:true},{seeking:true},{blocked:true},{readyState:2},{id:'b'},{source:'other'},{time:10},{now:10000,time:19}])assert.equal(C.activeSeconds(p,{...s,...change}),0);
 assert.equal(C.activeSeconds(p,{...s,time:12,rate:2}),1);
});
test('Auto confirmation recognizes only study prompts and exact affirmative buttons',()=>{
 assert.equal(C.learningConfirm('Xác nhận học tập: Bạn có tiếp tục học không?'),true);
 assert.equal(C.learningConfirm('Bạn vẫn đang học? Vui lòng xác nhận.'),true);
 for(const text of ['Xác nhận xóa môn học','Đồng ý điều khoản học tập','Xác nhận học tập bằng mã CAPTCHA','Xác nhận nộp bài kiểm tra','Bạn có thanh toán học phí không?'])assert.equal(C.learningConfirm(text),false,text);
 assert.equal(C.confirmationButton('Không'),false);assert.equal(C.confirmationButton('Xác nhận'),true);assert.equal(C.confirmationButton('Nộp bài'),false);
});
async function setup(configure=()=>{}){
 const dom=new JSDOM('<!doctype html><body></body>',{url:'https://hoctructuyen.utt.edu.vn/learn/lop-hoc/chi-tiet/demo-course',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;const clock=FakeTimers.withGlobal(w).install({now:Date.parse('2026-10-13T01:00:00Z'),toFake:['Date','performance','setTimeout','clearTimeout','setInterval','clearInterval']});
 w.eval(fs.readFileSync(path.join(__dirname,'fixture.js'),'utf8'));const f=w.UTTFixture.install(w);
 const after=configure(f,w);f.renderContent();
 let originalCalls=0;w.confirm=()=>{originalCalls++;return false;};
 for(const file of ['core.js','bridge.js','adapter.js','content.js'])w.eval(fs.readFileSync(path.join(extension,file),'utf8'));
 // Legacy lesson tests isolate playback; discovery has dedicated startup tests.
 w.UTTStudyAdapter.discoveryPage=()=>false;
 if(typeof after==='function')after(w);
 await clock.tickAsync(1);
 const ui=w.document.querySelector('#utt-study-extension').shadowRoot;
 const click=async(id,ms=1)=>{ui.getElementById(id).click();await clock.tickAsync(ms);};
 return {w,dom,clock,f,ui,click,originalCalls:()=>originalCalls,cleanup:()=>{clock.uninstall();dom.window.close();}};
}
test('UI reads school data, expands groups, selects pending and stops at a pending operation',async()=>{
 const t=await setup();try{
  await t.click('sync',6000);
  assert.equal(t.ui.getElementById('total').textContent,'4');assert.equal(t.ui.getElementById('done').textContent,'1');
  assert.equal(t.ui.getElementById('course').textContent,'Môn học mẫu');assert.equal(t.f.groupOpen,true);
  assert.ok(t.ui.getElementById('list').textContent.includes('2,5'));
  await t.click('selectPending');assert.equal(t.ui.querySelectorAll('input[data-select]:checked').length,3);
  await t.click('start',50);await t.click('stop',4000);
  assert.equal(t.f.opened.length,0,'Cancelled read must never open a video');assert.ok(t.ui.getElementById('status').textContent.includes('Đã dừng'));
 }finally{t.cleanup();}
});
test('Queue verifies completion from server, moves to next pending and handles auto confirmation',async()=>{
 const t=await setup();try{
  await t.click('sync',6000);await t.click('selectPending');
  t.ui.getElementById('auto').checked=true;t.ui.getElementById('auto').dispatchEvent(new t.w.Event('change'));
  await t.click('start',8000);
  assert.equal(t.f.playing,'Video C_01');
  const reused=t.f.confirm();await t.clock.tickAsync(1100);assert.equal(t.f.accepted,1);
  await t.clock.tickAsync(1100);t.w.document.body.append(reused);await t.clock.tickAsync(1100);assert.equal(t.f.accepted,2,'Reused dialog nodes must confirm again after disappearing');
  assert.equal(t.w.confirm('Xác nhận học tập: Bạn có tiếp tục học không?'),true);assert.equal(t.originalCalls(),0);
  assert.equal(t.w.confirm('Bạn có xóa dữ liệu không?'),false);assert.equal(t.originalCalls(),1);
  // Only the fictional school changes the official status, never extension accounting.
  t.f.rows[1][4]='4';t.f.rows[1][6]='Đã hoàn thành';t.f.video.finish();
  await t.clock.tickAsync(8000);
  assert.equal(t.f.playing,'C_23_Final');assert.ok(!t.f.opened.includes('Video_C_02'));
  await t.click('stop');assert.equal(t.f.video.paused,true);
  assert.equal(t.w.confirm('Xác nhận học tập: Bạn có tiếp tục học không?'),false,'Stop disables the native auto-confirm bridge');
 }finally{t.cleanup();}
});
test('Unknown dialogs stop automation; switching course clears prior selection',async()=>{
 const t=await setup();try{
  await t.click('sync',6000);await t.click('selectPending');await t.click('start',8000);
  const dialog=t.w.document.createElement('div');dialog.setAttribute('role','dialog');dialog.textContent='Nhập mã CAPTCHA để tiếp tục học';t.w.document.body.append(dialog);
  await t.clock.tickAsync(1100);assert.equal(t.f.video.paused,true);assert.ok(t.ui.getElementById('status').textContent.includes('hộp thoại'));
  dialog.remove();t.w.history.pushState(null,'','/learn/lop-hoc/chi-tiet/other-course');await t.clock.tickAsync(1100);
  assert.equal(t.ui.getElementById('total').textContent,'0');assert.equal(t.ui.querySelectorAll('input[data-select]:checked').length,0);
 }finally{t.cleanup();}
});
test('An ended video with unchanged school progress persists its continuation before refreshing',async()=>{
 const t=await setup();try{
  await t.click('sync',6000);await t.click('selectPending');await t.click('start',8000);
  t.f.video.finish();await t.clock.tickAsync(6000);
  assert.equal(t.f.reloads,1);assert.equal(t.f.flow.phase,'resume');
  assert.equal(t.f.flow.resume.lessonId,C.key('Video C_01'));assert.equal(t.f.flow.resume.time,0);
  assert.equal(t.f.video?.paused,true);
 }finally{t.cleanup();}
});
test('Empty-href UTT tabs never navigate home while reading, starting and checking completion',async()=>{
 const t=await setup();try{
  await t.click('sync',6000);
  assert.equal(t.f.wouldNavigate,0,'Reading progress must cancel both tab anchors default navigation');
  assert.equal(t.w.location.pathname,'/learn/lop-hoc/chi-tiet/demo-course');
  await t.click('selectPending');await t.click('start',8000);
  assert.equal(t.f.wouldNavigate,0,'Start must remain in the same course');
  assert.equal(t.f.playing,'Video C_01');assert.equal(t.f.video.paused,false);
  t.f.rows[1][4]='4';t.f.rows[1][6]='Đã hoàn thành';t.f.video.finish();await t.clock.tickAsync(8000);
  assert.equal(t.f.wouldNavigate,0,'Automatic checkpoints must stay in the course');
  assert.equal(t.f.playing,'C_23_Final');
 }finally{t.cleanup();}
});
test('Reuse the already loaded lesson instead of creating a second learning session',async()=>{
 const t=await setup();try{
  const record=C.parseRows(t.f.rows).find(r=>r.name==='Video C_01');
  const first=t.w.UTTStudyAdapter.open(record,()=>true);await t.clock.tickAsync(2000);const player=await first;
  assert.equal(t.f.opened.filter(n=>n==='Video C_01').length,1);
  const again=t.w.UTTStudyAdapter.open(record,()=>true);await t.clock.tickAsync(1200);
  assert.equal(await again,player);assert.equal(t.f.opened.filter(n=>n==='Video C_01').length,1);
 }finally{t.cleanup();}
});
test('Progress sync restores position without reopening the lesson automatically resumed by UTT',async()=>{
 const t=await setup();try{
  await t.click('sync',6000);
  const record=C.parseRows(t.f.rows).find(r=>r.name==='Video C_01');
  const opened=t.w.UTTStudyAdapter.open(record,()=>true);await t.clock.tickAsync(2000);await opened;
  t.f.video.currentTime=45;t.f.autoResume=true;const before=t.f.opened.length;
  await t.click('sync',5000);
  assert.equal(t.f.opened.length-before,1,'Only the school automatic resume may open the lesson');
  assert.equal(t.f.video.currentTime,45);assert.equal(t.f.video.paused,false);
  assert.match(t.ui.getElementById('status').textContent,/Đã đọc/);
 }finally{t.cleanup();}
});

test('Completed attendance skips only the matching Vclass recording and leaves school progress unchanged',()=>{
 const rows=C.parseRows([
  ['Ghi hình Vclass tuần 6','---','','','0','','Chưa hoàn thành'],
  ['Video bài giảng tuần 6','Phải học tối thiểu 4 (phút)','','','0','','Chưa hoàn thành']
 ]);
 const entries=[...rows.map(r=>({...r,group:1})),{id:'attendance',name:'Điểm danh vclass tuần 6 (28/09/2026)',group:1,complete:true}];
 const result=C.attendanceSkips(rows,entries);
 assert.equal(result[0].skipped,true);assert.equal(result[0].complete,false);assert.equal(result[0].credited,0);
 assert.equal(result[1].skipped,false);
 assert.equal(C.next(result,new Set(result.map(r=>r.id))).id,result[1].id);
 const reread=C.attendanceSkips(result,entries.map(e=>e.id==='attendance'?{...e,complete:false}:e));
 assert.equal(reread[0].skipped,false);assert.equal(reread[0].attendance,null);
});

test('Different groups, conflicting weeks or dates, and ambiguous attendance never skip a recording',()=>{
 const [record]=C.parseRows([['Ghi hình Vclass tuần 6 (28/09/2026)','---','','','0','','Chưa hoàn thành']]);
 const base={id:'a',name:'Điểm danh vclass tuần 6 (28/09/2026)',group:1,complete:true};
 for(const attendance of [
  [{...base,group:2}], [{...base,name:'Điểm danh vclass tuần 5 (28/09/2026)'}],
  [{...base,name:'Điểm danh vclass tuần 6 (21/09/2026)'}],
  [base,{...base,id:'b',complete:false}]
 ])assert.equal(C.attendanceSkips([record],[{...record,group:1},...attendance])[0].skipped,false);
 assert.equal(C.attendanceSkips([record],[{...record,group:null},{...base,group:null}])[0].skipped,false);
});

function vclassFixture(f){
 const make=(week,date,done)=>({name:`Buổi học trực tuyến (${date})`,rows:[
  [`Ghi hình Vclass tuần ${week}`,'---','---','---','0','0','Chưa hoàn thành'],
  [`Vclass tuần ${week}`,'---','---','---','0','1','Đã hoàn thành'],
  [`Điểm danh vclass tuần ${week} (${date})`,'---','---','---','0',done?'1':'0',done?'Đã hoàn thành':'Chưa hoàn thành']
 ]});
 f.sessions=[make(6,'28/09/2026',true),make(7,'05/10/2026',false),make(6,'29/09/2026',false)];
 f.sessions.forEach(s=>{f.rows.push([s.name,'','','','','',''],...s.rows);});
}

test('Live-shaped nested groups skip completed attendance but keep other sessions and ordinary lessons selectable',async()=>{
 const t=await setup(vclassFixture);try{
  await t.click('sync',6000);
  assert.equal(t.ui.getElementById('skipCount').textContent,'1 video ghi hình Vclass được bỏ qua vì đã điểm danh cùng buổi.');
  const recordings=[...t.ui.querySelectorAll('input[data-select]')].filter(el=>el.getAttribute('aria-label').includes('Ghi hình'));
  assert.equal(recordings.length,3);assert.equal(recordings[0].disabled,true);
  assert.equal(recordings[1].disabled,false,'Finished Vclass without attendance must still require playback');
  assert.equal(recordings[2].disabled,false,'Attendance in another session of the same week does not apply');
  assert.equal(t.ui.getElementById('done').textContent,'1','Attendance does not make the school recording complete');
  await t.click('selectPending');assert.equal(t.ui.querySelectorAll('input[data-select]:checked').length,5);
  t.ui.getElementById('filter').value='skipped';t.ui.getElementById('filter').dispatchEvent(new t.w.Event('change'));
  assert.equal(t.ui.querySelectorAll('input[data-select]').length,1);
  assert.match(t.ui.getElementById('list').textContent,/Bỏ qua · đã điểm danh/);
  // Changing the school attendance status must invalidate the previous local skip.
  t.f.sessions[0].rows[2][6]='Chưa hoàn thành';await t.click('sync',6000);
  assert.equal(t.ui.getElementById('skipCount').hidden,true);
  assert.equal(t.ui.querySelectorAll('input[data-select]').length,0);
 }finally{t.cleanup();}
});

test('A cached selected Vclass recording is skipped on start and the next ordinary video plays',async()=>{
 const t=await setup(f=>{
  vclassFixture(f);const records=C.parseRows(f.rows);
  f.storage['course:demo-course']={records,selected:[records.find(r=>r.name==='Ghi hình Vclass tuần 6').id,records[0].id]};
 });try{
  await t.click('start',8000);
  assert.equal(t.f.playing,'Video C_01');
  assert.equal(t.f.opened.some(n=>n.includes('Ghi hình')),false);
  assert.match(t.ui.getElementById('selectedCount').textContent,/1 bỏ qua/);
  assert.equal(t.f.wouldNavigate,0);
 }finally{t.cleanup();}
});

test('A selection containing only attended Vclass recordings finishes without opening video or claiming school completion',async()=>{
 const t=await setup(f=>{
  vclassFixture(f);const records=C.parseRows(f.rows);
  f.storage['course:demo-course']={records,selected:[records.find(r=>r.name==='Ghi hình Vclass tuần 6').id]};
 });try{
  await t.click('start',7000);
  assert.equal(t.f.opened.length,0);assert.equal(t.ui.getElementById('stop').disabled,true);
  assert.match(t.ui.getElementById('status').textContent,/1 ghi hình Vclass được bỏ qua vì đã điểm danh/);
  assert.doesNotMatch(t.ui.getElementById('status').textContent,/Tất cả video đã chọn đã được trang ghi nhận/);
 }finally{t.cleanup();}
});

test('Future Vclass recordings are deferred in Vietnam time, while ordinary videos in that week still play',()=>{
 const rows=C.parseRows([
  ['Buổi học trực tuyến (20/10/2026)','','','','','',''],
  ['Ghi hình Vclass tuần 8','---','','','0','','Chưa hoàn thành'],
  ['Video bài giảng tuần 8','Phải học tối thiểu 5 (phút)','','','0','','Chưa hoàn thành']
 ]);
 const before=C.availability(rows,[],Date.parse('2026-10-19T16:59:59Z'));
 assert.equal(before[0].deferredUntil,Date.parse('2026-10-19T17:00:00Z'));
 assert.equal(C.next(before,new Set(before.map(r=>r.id))).id,before[1].id);
 assert.equal(C.courseSummary(before).deferred,1);assert.equal(C.courseSummary(before).pending,1);
 assert.equal(C.availability(rows,[],Date.parse('2026-10-19T17:00:00Z'))[0].deferredUntil,null);
 assert.equal(C.vietnamDate('31/02/2026'),null);
});

test('A stuck decorative group arrow is clicked once and does not prevent a lesson from opening',async()=>{
 const t=await setup();try{
  let calls=0;const arrow=t.w.document.querySelector('.arrow');
  arrow.onclick=()=>{calls++;t.w.document.getElementById('lessons').hidden=false;};
  const opening=t.w.UTTStudyAdapter.open(C.parseRows(t.f.rows)[0],()=>true);await t.clock.tickAsync(2500);await opening;
  assert.equal(calls,1);assert.equal(t.f.playing,'Video C_01');
 }finally{t.cleanup();}
});

test('Three minutes of moving playback without credited progress refreshes and saves the exact lesson and position',async()=>{
 const t=await setup();try{
  await t.click('sync',6000);await t.click('selectPending');await t.click('start',8000);
  t.w.setInterval(()=>t.f.video?.advance(1),1000);
  await t.clock.tickAsync(210000);
  assert.equal(t.f.reloads,1,t.ui.getElementById('status').textContent);assert.equal(t.f.flow.resume.lessonId,C.key('Video C_01'));
  assert.ok(t.f.flow.resume.time>=170 && t.f.flow.resume.time<=205,t.f.flow.resume.time);
  assert.equal(t.f.flow.resume.recovery[C.key('Video C_01')].count,1);
  assert.equal(t.f.rows[1][4],'1.5','Local playback cannot alter the school credited minutes');
 }finally{t.cleanup();}
});

test('A paused video does not trigger a three-minute recovery',async()=>{
 const t=await setup();try{
  await t.click('sync',6000);await t.click('selectPending');await t.click('start',8000);
  t.f.video.pause();await t.clock.tickAsync(185000);assert.equal(t.f.reloads,0);
 }finally{t.cleanup();}
});

test('Credited progress after three minutes resets the watchdog without reloading',async()=>{
 const t=await setup();try{
  await t.click('sync',6000);await t.click('selectPending');await t.click('start',8000);
  t.w.setInterval(()=>t.f.video?.advance(1),1000);
  t.w.setTimeout(()=>{t.f.rows[1][4]='2.5';},150000);
  await t.clock.tickAsync(190000);assert.equal(t.f.reloads,0);assert.equal(t.f.video.paused,false);
 }finally{t.cleanup();}
});

function resumeFixture(f,count=1,time=65){
 const records=C.parseRows(f.rows), first=records[0];
 f.storage['course:demo-course']={records,selected:[first.id,records[2].id]};
 f.flow={token:'resume-test',kind:'single',phase:'resume',courses:[],resume:{course:'demo-course',lessonId:first.id,time,
  selected:[first.id,records[2].id],attempted:[],recovery:{[first.id]:{count,credited:first.credited}}}};
}

test('A real new document restores the persisted lesson and position and continues playback',async()=>{
 const t=await setup(f=>resumeFixture(f));try{
  await t.clock.tickAsync(8000);assert.equal(t.f.playing,'Video C_01');assert.equal(t.f.video.paused,false);
  assert.equal(t.f.video.currentTime,65);assert.equal(t.f.flow.phase,'review');
 }finally{t.cleanup();}
});

test('Two failed refreshes leave the lesson pending and advance instead of reloading forever',async()=>{
 const t=await setup(f=>resumeFixture(f,2));try{
  await t.clock.tickAsync(8000);t.f.video.finish();await t.clock.tickAsync(8000);
  assert.equal(t.f.reloads,0);assert.equal(t.f.playing,'C_23_Final');
  assert.match(t.ui.getElementById('list').textContent,/Video lỗi · để lại/);
  assert.equal(t.f.rows[1][6],'Chưa hoàn thành');
 }finally{t.cleanup();}
});

test('Stopping before a refresh removes its resume and preserves a stopped review for the next document',async()=>{
 const t=await setup(f=>resumeFixture(f));try{
  await t.clock.tickAsync(8000);await t.click('stop');assert.equal(t.f.flow.phase,'review');assert.equal(t.f.flow.resume,null);
  await t.clock.tickAsync(185000);assert.equal(t.f.reloads,0);assert.equal(t.f.video.paused,true);
 }finally{t.cleanup();}
});

test('Missing video after opening retries by page refresh instead of silently stopping',async()=>{
 const t=await setup();try{
  await t.click('sync',6000);await t.click('selectPending');
  t.w.UTTStudyAdapter.open=async()=>{const e=new Error('Không có video');e.code='VIDEO_UNAVAILABLE';throw e;};
  await t.click('start',7000);assert.equal(t.f.reloads,1);assert.equal(t.f.flow.resume.lessonId,C.key('Video C_01'));
 }finally{t.cleanup();}
});

test('A scanned course stores only pending video work and returns to the origin when scanning completes',async()=>{
 const t=await setup(f=>{
  f.flow={token:'scan-test',kind:'scan',phase:'scan',index:0,courses:[{id:'demo-course',name:'Môn học mẫu'}],origin:{url:'/learn/lop-hoc/chi-tiet/origin-course'}};
 });try{
  await t.clock.tickAsync(6500);
  assert.equal(t.f.flow.courses[0].pending,3);assert.equal(t.f.flow.courses[0].selected,true);
  assert.equal(t.f.flow.phase,'return');assert.equal(t.f.navigations[0],'/learn/lop-hoc/chi-tiet/origin-course');
 }finally{t.cleanup();}
});

test('When a course has only future Vclass recordings left, the multi-course queue moves to the next course',async()=>{
 const t=await setup(f=>{
  f.rows=[['Buổi học trực tuyến (20/10/2026)','','','','','',''],['Ghi hình Vclass tuần 8','---','','','0','','Chưa hoàn thành']];
  f.flow={token:'multi-test',kind:'play',phase:'play',index:0,courses:[{id:'demo-course',name:'Môn học mẫu',selected:true,pending:1},{id:'next-course',name:'Môn tiếp theo',selected:true,pending:2}]};
 });try{
  await t.clock.tickAsync(7000);
  assert.equal(t.f.opened.length,0);assert.equal(t.f.flow.index,1);
  assert.equal(t.f.flow.courses[0].deferred,1);assert.equal(t.f.flow.courses[0].pending,0);
  assert.equal(t.f.navigations[0],'/learn/lop-hoc/chi-tiet/next-course');
 }finally{t.cleanup();}
});

test('A finished multi-course pass reports deferred work and does not loop back to earlier courses',async()=>{
 const t=await setup(f=>{
  f.rows=[['Ghi hình Vclass tuần 8 (20/10/2026)','---','','','0','','Chưa hoàn thành']];
  f.flow={token:'multi-end',kind:'play',phase:'play',index:0,courses:[{id:'demo-course',name:'Môn học mẫu',selected:true,pending:1}]};
 });try{
  await t.clock.tickAsync(7000);assert.equal(t.f.navigations.length,0);assert.equal(t.f.flow.phase,'review');
  assert.match(t.ui.getElementById('status').textContent,/1 ghi hình chưa đến ngày/);
 }finally{t.cleanup();}
});
test('An unexpected Home redirect restores the saved course once without creating a redirect loop',async()=>{
 for (const redirects of [0,1]) {
  const t=await setup((f,w)=>{resumeFixture(f);f.flow.redirects=redirects;w.history.pushState(null,'','/');});
  try{
   await t.clock.tickAsync(100);
   if(!redirects){assert.equal(t.f.navigations[0],'/learn/lop-hoc/chi-tiet/demo-course');assert.equal(t.f.flow.redirects,1);}
   else {assert.equal(t.f.navigations.length,0);assert.equal(t.f.flow.phase,'review');assert.equal(t.f.flow.resume,null);}
  }finally{t.cleanup();}
 }
});

function discoveredFlow(f){
 const videos=C.parseRows(f.rows).filter(C.needsPlayback).map(r=>({id:r.id,name:r.name,group:r.group,credited:r.credited,required:r.required,remaining:C.remaining(r)}));
 return {token:'discovered',kind:'scan',phase:'review',catalogComplete:true,scanCancelled:false,index:0,
  courses:[{id:'demo-course',name:'Môn học mẫu',scanState:'ready',selected:true,pending:videos.length,minutes:30,videos,videoIds:videos.map(v=>v.id)}]};
}

test('Discovery can reach 100 only with a complete catalog and video records for every course',()=>{
 const ready={scanState:'ready',videos:[{id:'a'}]}, pending={scanState:'pending',videos:[]}, error={scanState:'error',videos:[]};
 assert.equal(C.discoveryProgress(null).percent,0);
 assert.equal(C.discoveryProgress({courses:[ready]}).complete,false);
 assert.equal(C.discoveryProgress({catalogComplete:true,courses:[ready,pending]}).percent,50);
 assert.equal(C.discoveryProgress({catalogComplete:true,courses:[ready,error]}).complete,false);
 assert.equal(C.discoveryProgress({catalogComplete:true,courses:[{pending:3}]}).percent,0,'A summary without videos is not loaded');
 assert.equal(C.discoveryProgress({catalogComplete:true,courses:[ready,ready]}).percent,100);
 assert.equal(C.discoveryProgress({catalogComplete:true,courses:[ready],scanCancelled:true}).complete,false);
 assert.equal(C.discoveryProgress({catalogComplete:true,courses:[]}).complete,true,'A fully read empty catalog is a valid result');
});

test('Opening a learning page automatically begins discovery and leaves playback stopped',async()=>{
 const t=await setup(()=>w=>{w.UTTStudyAdapter.discoveryPage=()=>true;});try{
  await t.clock.tickAsync(100);
  assert.equal(t.f.flow.kind,'scan');assert.equal(t.f.flow.phase,'catalog');assert.equal(t.f.flow.catalogComplete,false);
  assert.equal(t.f.navigations[0],'/danh-sach-lop-dang-hoc?statusId=0');
  assert.equal(t.ui.getElementById('scanPercent').textContent,'0%');assert.equal(t.ui.getElementById('startCourses').disabled,true);
  assert.equal(t.f.opened.length,0);
 }finally{t.cleanup();}
});

test('A scanned course persists video names, requirements and IDs as its share of the loader',async()=>{
 const t=await setup(f=>{
  f.flow={token:'scan-records',kind:'scan',phase:'scan',catalogComplete:true,index:0,courses:[{id:'demo-course',name:'Môn học mẫu',scanState:'pending'}],origin:{url:'/learn/lop-hoc/chi-tiet/demo-course'}};
 });try{
  await t.clock.tickAsync(6500);
  const c=t.f.flow.courses[0];assert.equal(c.scanState,'ready');assert.equal(c.videos.length,3);
  assert.equal(c.videos[0].id,C.key('Video C_01'));assert.equal(c.videos[0].remaining,2.5);
  assert.deepEqual(c.videoIds,c.videos.map(v=>v.id));
  assert.equal(t.ui.getElementById('scanProgress').value,100);
 }finally{t.cleanup();}
});

test('A failed course keeps the loader truthful but ready courses remain selectable after the pass',async()=>{
 const t=await setup(f=>{
  f.flow=discoveredFlow(f);f.flow.courses.push({id:'error-course',name:'Môn lỗi',scanState:'error',pending:null,selected:false,videos:[],videoIds:[],error:'Trang không tải được'});
 });try{
  await t.clock.tickAsync(100);assert.equal(t.ui.getElementById('scanProgress').value,50);
  assert.match(t.ui.getElementById('scanMessage').textContent,/1 môn lỗi/);
  assert.equal(t.ui.getElementById('startCourses').disabled,false);await t.click('startCourses',100);
  assert.equal(t.f.navigations[0],'/learn/lop-hoc/chi-tiet/demo-course');
 }finally{t.cleanup();}
});

test('Course filter includes only the two requested statuses and excludes the system guide even if incomplete',()=>{
 for(const status of ['Đang học','Không đủ điều kiện thi'])assert.equal(C.isStudyCourse('Môn chuyên ngành',status),true);
 for(const status of ['Đủ điều kiện thi','Đã hoàn thành','Chưa học','Khác'])assert.equal(C.isStudyCourse('Môn chuyên ngành',status),false);
 for(const status of ['Đang học','Không đủ điều kiện thi'])assert.equal(C.isStudyCourse('Hướng dẫn học tập trên hệ thống E-learning',status),false);
 assert.equal(C.isStudyCourse('Hướng dẫn học tập trên hệ thống E - learning_T8.26','Đang học'),false);
});

test('A pending or cancelled scan cannot start a partial queue before all courses have been attempted',()=>{
 const ready={scanState:'ready',selected:true,pending:1,videos:[{id:'a'}],videoIds:['a']};
 assert.equal(C.canStartCourses({catalogComplete:true,courses:[ready,{scanState:'pending'}]}),false);
 assert.equal(C.canStartCourses({catalogComplete:true,scanCancelled:true,courses:[ready]}),false);
 assert.equal(C.canStartCourses({catalogComplete:true,courses:[ready,{scanState:'error'}]}),true);
});

test('Catalog resets to the first page before finding a course after collecting all pages',async()=>{
 const t=await setup();try{
  t.w.history.pushState(null,'','/danh-sach-lop-dang-hoc?statusId=0');
  const box=t.w.document.createElement('div');box.innerHTML='<table><tbody></tbody></table><a class="ui-paginator-first ui-state-disabled" href="#">Đầu</a><a class="ui-paginator-next" href="#">Sau</a>';t.w.document.body.prepend(box);
  const body=box.querySelector('tbody'), first=box.querySelector('.ui-paginator-first'), next=box.querySelector('.ui-paginator-next');
  const row=name=>`<tr><td>1</td><td><a>${name}</a></td><td></td><td></td><td>01/01/2020</td><td></td><td></td><td><span class="ui-column-value">Đang học</span></td><td><a>Vào học</a></td></tr>`;
  let page=0,rewinds=0,opened='';
  const render=()=>{body.innerHTML=row(page?'Môn B':'Môn A');first.classList.toggle('ui-state-disabled',!page);next.classList.toggle('ui-state-disabled',!!page);body.querySelector('td:last-child a').onclick=()=>{opened=page?'Môn B':'Môn A';};};
  first.onclick=()=>{page=0;rewinds++;render();};next.onclick=()=>{page=1;render();};render();
  const collecting=t.w.UTTStudyAdapter.catalog(()=>true);await t.clock.tickAsync(2500);assert.equal((await collecting).length,2);assert.equal(page,1);
  const entering=t.w.UTTStudyAdapter.catalog(()=>true,'Môn A');await t.clock.tickAsync(2500);await entering;
  assert.equal(rewinds,1);assert.equal(opened,'Môn A');assert.equal(page,0);
  page=1;render();const fromLast=t.w.UTTStudyAdapter.catalog(()=>true);await t.clock.tickAsync(3000);
  assert.deepEqual(Array.from(await fromLast,c=>c.name),['Môn A','Môn B']);assert.equal(rewinds,2);
 }finally{t.cleanup();}
});

test('A course with no learning controls is recorded as an error and scanning moves on',async()=>{
 const t=await setup(f=>{
  f.flow={token:'locked-course',kind:'scan',phase:'scan',catalogComplete:true,index:0,courses:[{id:'demo-course',name:'Môn học mẫu',scanState:'pending'},{id:'next-course',name:'Môn tiếp theo',scanState:'pending'}],origin:{url:'/learn/lop-hoc/chi-tiet/demo-course'}};
  return w=>w.document.getElementById('tab2').remove();
 });try{
  await t.clock.tickAsync(31000);assert.equal(t.f.flow.courses[0].scanState,'error');
  assert.equal(t.f.flow.index,1);assert.equal(t.f.navigations[0],'/danh-sach-lop-dang-hoc?statusId=0');
  assert.match(t.f.flow.courses[0].error,/Trang chưa tải/);
 }finally{t.cleanup();}
});

test('Returning after discovery shows the complete queue without automatically playing the old lesson',async()=>{
 const t=await setup(f=>{
  const records=C.parseRows(f.rows);f.storage['course:demo-course']={records,selected:[records[0].id]};
  f.autoResume=true;f.playing='Video C_01';f.flow={...discoveredFlow(f),phase:'return',origin:{course:'demo-course',lessonId:records[0].id,time:45,wasPlaying:true}};
 });try{
  await t.clock.tickAsync(2500);assert.equal(t.ui.getElementById('scanProgress').value,100);
  assert.equal(t.ui.getElementById('startCourses').disabled,false);assert.equal(t.f.video.paused,true);
  assert.equal(t.f.video.currentTime,45);assert.match(t.ui.getElementById('courseList').textContent,/Video C_01/);
 }finally{t.cleanup();}
});

test('User-selected global video IDs survive navigation and are the only lessons played',async()=>{
 let nextFlow;
 const first=await setup(f=>{f.flow=discoveredFlow(f);});try{
  await first.clock.tickAsync(100);
  const ids=[...first.ui.querySelectorAll('[data-course-video]')].map(el=>el.dataset.videoId).filter(id=>id!==C.key('C_23_Final'));
  for(const id of ids){
   const input=[...first.ui.querySelectorAll('[data-course-video]')].find(el=>el.dataset.videoId===id);
   input.checked=false;input.dispatchEvent(new first.w.Event('change',{bubbles:true}));await first.clock.tickAsync(1);
  }
  assert.deepEqual(Array.from(first.f.flow.courses[0].videoIds),[C.key('C_23_Final')]);
  await first.click('startCourses',100);nextFlow=structuredClone(first.f.flow);
  assert.equal(first.f.navigations[0],'/learn/lop-hoc/chi-tiet/demo-course');assert.equal(nextFlow.phase,'play');
 }finally{first.cleanup();}
 const resumed=await setup(f=>{f.flow=nextFlow;});try{
  await resumed.clock.tickAsync(7000);assert.equal(resumed.f.playing,'C_23_Final');
  assert.equal(resumed.f.opened.includes('Video C_01'),false);
 }finally{resumed.cleanup();}
});

test('Cancelling discovery cannot advertise 100 or continue in another document',async()=>{
 const t=await setup(()=>w=>{w.UTTStudyAdapter.discoveryPage=()=>true;});try{
  await t.clock.tickAsync(100);await t.click('stop');assert.equal(t.f.flow.phase,'review');assert.equal(t.f.flow.resume,null);
  assert.equal(t.ui.getElementById('scanProgress').value,0);assert.match(t.ui.getElementById('scanLabel').textContent,/Đã dừng/);
  await t.clock.tickAsync(5000);assert.equal(t.f.navigations.length,1);assert.equal(t.f.opened.length,0);
 }finally{t.cleanup();}
});

test('Catalog discovery reads every pagination page and keeps the site route',async()=>{
 const t=await setup();try{
  t.w.history.pushState(null,'','/danh-sach-lop-dang-hoc?statusId=0');
  const container=t.w.document.createElement('div');container.innerHTML='<table><tbody id="catalog-fixture"></tbody></table><a class="ui-paginator-next" href="#">Trang sau</a>';t.w.document.body.prepend(container);
  const row=name=>`<tr><td>1</td><td><a>${name}</a></td><td></td><td>01/01/2026</td><td>31/12/2026</td><td></td><td></td><td><span class="ui-column-value">Đang học</span></td><td><a>Vào học</a></td></tr>`;
  const body=container.querySelector('tbody'), next=container.querySelector('.ui-paginator-next');body.innerHTML=row('Môn A');
  next.onclick=()=>{body.innerHTML=row('Môn B');next.classList.add('ui-state-disabled');};
  const result=t.w.UTTStudyAdapter.catalog(()=>true);await t.clock.tickAsync(2500);
  assert.deepEqual(Array.from(await result,c=>c.name),['Môn A','Môn B']);assert.equal(t.w.location.pathname,'/danh-sach-lop-dang-hoc');
 }finally{t.cleanup();}
});


test('Initial course loading finishes before progress tabs are switched',async()=>{
 const t=await setup((f)=>w=>{
  w.document.getElementById('tab1-panel').innerHTML='';
  w.setTimeout(()=>f.renderContent(),5000);
 });try{
  await t.click('sync',4000);
  assert.equal(t.w.document.getElementById('tab2-panel').className,'');
  assert.equal(t.ui.getElementById('total').textContent,'0');
  await t.clock.tickAsync(7000);
  assert.equal(t.ui.getElementById('total').textContent,'4');
  assert.equal(t.ui.getElementById('sync').disabled,false);
 }finally{t.cleanup();}
});

test('A repeated Home redirect marks only that course failed and continues the scan',async()=>{
 const t=await setup((f,w)=>{
  f.flow=discoveredFlow(f);f.flow.catalogVersion=3;f.flow.phase='scan';f.flow.index=1;f.flow.redirects=1;f.flow.expected='/learn/lop-hoc/chi-tiet/bad-course';f.flow.origin={url:'/danh-sach-lop-dang-hoc?statusId=0'};
  f.flow.courses.push({id:'bad-course',name:'Môn lỗi',scanState:'pending'},{id:'next-course',name:'Môn sau',scanState:'pending'});
  w.history.pushState(null,'','/');
 });try{
  await t.clock.tickAsync(100);
  assert.equal(t.f.flow.courses[0].scanState,'ready');assert.equal(t.f.flow.courses[0].videos.length,3);
  assert.equal(t.f.flow.courses[1].scanState,'error');assert.equal(t.f.flow.index,2);
  assert.equal(t.f.navigations[0],'/danh-sach-lop-dang-hoc?statusId=0');
 }finally{t.cleanup();}
});

test('A stopped scan stays stopped when the following page loads',async()=>{
 const t=await setup(f=>{
  f.flow={...discoveredFlow(f),catalogVersion:3,scanCancelled:true,resume:null};
  return w=>{w.UTTStudyAdapter.discoveryPage=()=>true;};
 });try{
  await t.clock.tickAsync(7000);
  assert.equal(t.f.navigations.length,0);assert.equal(t.f.flow.phase,'review');
  assert.equal(t.ui.getElementById('startCourses').disabled,true);
 }finally{t.cleanup();}
});

test('Scanning saves its actual course destination before awaiting progress',async()=>{
 const t=await setup(f=>{f.flow={...discoveredFlow(f),phase:'enter',catalogVersion:3};});try{
  await t.clock.tickAsync(100);
  assert.equal(t.f.flow.phase,'scan');assert.equal(t.f.flow.expected,'/learn/lop-hoc/chi-tiet/demo-course');
 }finally{t.cleanup();}
});


test('Pagination waits for asynchronously replaced names rather than reading the previous course twice',async()=>{
 const t=await setup();try{
  t.w.history.pushState(null,'','/danh-sach-lop-dang-hoc?statusId=0');
  const box=t.w.document.createElement('div');box.innerHTML='<table><tbody></tbody></table><a class="ui-paginator-next" href="#">Sau</a>';t.w.document.body.prepend(box);
  const body=box.querySelector('tbody'),next=box.querySelector('a');
  const row=name=>'<tr><td>1</td><td><a>'+name+'</a></td><td></td><td></td><td></td><td></td><td></td><td><span class="ui-column-value">Đang học</span></td><td><a>Vào học</a></td></tr>';
  body.innerHTML=row('Môn A');
  next.onclick=()=>{
   body.querySelector('td:first-child').textContent='2';
   t.w.setTimeout(()=>{body.innerHTML=row('Môn B');next.classList.add('ui-state-disabled');},600);
  };
  const task=t.w.UTTStudyAdapter.catalog(()=>true);await t.clock.tickAsync(3500);
  assert.deepEqual(Array.from(await task,c=>c.name),['Môn A','Môn B']);
 }finally{t.cleanup();}
});
