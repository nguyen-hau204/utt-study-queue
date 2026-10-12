// Sanitized UTT-shaped fixture. All progress and media here are fictional test data.
(function(root){
  const state = { rows: [
    ['Tuần 1','','','','','',''],
    ['Video C_01 *','Phải học tối thiểu 4 (phút)','---','---','1.5','1','Chưa hoàn thành'],
    ['Video_C_02 *','Phải học tối thiểu 19 (phút)','---','---','19','1','Đã hoàn thành'],
    ['Tuần 2','','','','','',''],
    ['C_23_Final *','Phải học tối thiểu 25 (phút)','---','---','0','0','Chưa hoàn thành'],
    ['Video không có ngưỡng','---','---','---','0','0','Chưa hoàn thành'],
    ['BÀI KIỂM TRA GIỮA KỲ *','---','8','1','0','1','Đã hoàn thành']
  ], opened:[], playing:'', video:null, notices:0, storage:{}, groupOpen:false, serverNoGain:false, wouldNavigate:0, autoResume:false, sessions:[], flow:null, reloads:0, navigations:[] };
  function install(window){
    const document=window.document;
    document.head.insertAdjacentHTML('beforeend','<base href="/">');
    document.body.innerHTML='<nav><a href="" role="tab" id="tab1">Nội dung</a><a href="" role="tab" id="tab2">Tiến trình học tập</a></nav><div id="tab1-panel" class="active"></div><div id="tab2-panel"></div><button id="showConfirm">Hiện xác nhận mẫu</button>';
    document.addEventListener('click',event=>{
      if(event.target.closest('a[role="tab"][href=""]') && !event.defaultPrevented) state.wouldNavigate++;
    });
    const isJSDOM=window.navigator.userAgent.includes('jsdom');
    if(isJSDOM) window.Element.prototype.getClientRects=function(){ return this.closest('[hidden]')?[]:[{width:10,height:10}]; };
    const send=async message=>{
      if(message.type==='notice')state.notices++;
      if(message.type==='flow-get')return {ok:true,flow:state.flow};
      if(message.type==='flow-clear')state.flow=null;
      if(['flow-put','navigate','reload'].includes(message.type))state.flow=JSON.parse(JSON.stringify(message.flow));
      if(message.type==='navigate')state.navigations.push(message.url);
      if(message.type==='reload')state.reloads++;
      return {ok:true};
    };
    const chrome={storage:{local:{get:async keys=>Object.fromEntries(keys.filter(k=>state.storage[k]).map(k=>[k,state.storage[k]])),set:async values=>{Object.assign(state.storage,JSON.parse(JSON.stringify(values)));}},session:{}},runtime:{sendMessage:send,onMessage:{addListener:()=>{}}}};
    if(!window.chrome)window.chrome={};
    window.chrome.storage=chrome.storage;window.chrome.runtime=chrome.runtime;
    function populateContent(){
      document.querySelector('#tab2-panel').className=''; document.querySelector('#tab2-panel').innerHTML='';
      const panel=document.querySelector('#tab1-panel');panel.className='active';
      panel.innerHTML='<div id="tnContentList"><div class="class-lesson-child"><div class="__lesson-name-child"><span class="arrow"><i class="fa fa-chevron-down"></i></span><a>Tuần 1</a></div><div id="lessons" hidden></div></div></div><div id="tnContentView"></div>';
      const list=document.querySelector('#lessons');
      function appendLesson(row, target){
        const lesson=document.createElement('div');lesson.className='class-lesson';
        const name=document.createElement('div');name.className='__lesson-name';
        const a=document.createElement('a');a.href='javascript:void(0)';a.textContent=row[0].replace('*','').trim();
        if(row[6]==='Đã hoàn thành')a.className='finished';
        name.append(a);lesson.append(name);target.append(lesson);
        a.onclick=()=>open(a,row);
      }
      const sessionRows = new Set(state.sessions.flatMap(s=>s.rows));
      state.rows.filter(row=>row[1] && !sessionRows.has(row)).forEach(row=>appendLesson(row,list));
      // A week can contain several distinct Vclass sessions, matching UTT nesting.
      state.sessions.forEach(session=>{
        const group=document.createElement('div');group.className='class-lesson-child';
        group.innerHTML='<div><div class="__lesson-name-child"><a></a></div><div class="__lesson-description"></div></div>';
        group.querySelector('a').textContent=session.name;
        session.rows.forEach(row=>appendLesson(row,group.querySelector('.__lesson-description')));
        list.append(group);
      });
      document.querySelector('.arrow').onclick=()=>{list.hidden=false;document.querySelector('.arrow i').className='fa fa-chevron-up';state.groupOpen=true;};
      if(state.autoResume && state.playing){
        const anchor=[...list.querySelectorAll('a')].find(a=>a.textContent===state.playing);
        const row=state.rows.find(r=>r[0].replace('*','').trim()===state.playing);
        if(anchor&&row)open(anchor,row);
      }
    }
    function open(a,row){
      document.querySelectorAll('.content-selected').forEach(x=>x.classList.remove('content-selected'));a.parentElement.classList.add('content-selected');
      state.playing=row[0].replace('*','').trim();state.opened.push(state.playing);
      const view=document.querySelector('#tnContentView');view.innerHTML='<div class="headcontent"><div class="col-md-10"><span id="tnContentButton"></span><span></span></div></div><video id="videoPlayer" controls></video>';
      view.querySelector('.headcontent span:last-child').textContent=state.playing;
      const v=view.querySelector('video');state.video=v;
      let time=0,paused=false,ended=false;
      Object.defineProperties(v,{duration:{get:()=>240},currentTime:{get:()=>time,set:n=>{time=n;ended=false;}},paused:{get:()=>paused},ended:{get:()=>ended},readyState:{get:()=>4},currentSrc:{get:()=>'/fixture/'+state.playing},seeking:{get:()=>false}});
      v.play=async()=>{paused=false;};v.pause=()=>{paused=true;};
      v.advance=seconds=>{if(!paused){time+=seconds;if(time>=240){time=240;ended=true;paused=true;}}};
      v.finish=()=>{time=240;ended=true;paused=true;};
    }
    function populateProgress(){
      document.querySelector('#tab1-panel').className=''; document.querySelector('#tab1-panel').innerHTML='';
      const panel=document.querySelector('#tab2-panel');panel.className='active';
      panel.innerHTML='<div class="class-detail-box"><div class="row"><div>Lớp học<span>:</span></div><div>Môn học mẫu</div></div></div><div class="class-detail-box"><span>Thời gian học/Yêu cầu</span><span class="content-minute">20.5 / 48</span></div><table><tbody></tbody></table>';
      const body=panel.querySelector('tbody');
      state.rows.forEach(cells=>{const tr=document.createElement('tr');cells.forEach(text=>{const td=document.createElement('td');td.textContent=text;tr.append(td);});body.append(tr);});
    }
    document.querySelector('#tab1').onclick=populateContent;document.querySelector('#tab2').onclick=populateProgress;
    function confirm(){
      const dialog=document.createElement('section');dialog.setAttribute('role','dialog');dialog.className='sample-dialog';
      dialog.innerHTML='<p>Xác nhận học tập: Bạn có tiếp tục học không?</p><button>Xác nhận</button><button>Không</button>';
      dialog.querySelector('button').onclick=()=>{state.accepted=(state.accepted||0)+1;dialog.remove();};
      dialog.querySelectorAll('button')[1].onclick=()=>dialog.remove();document.body.append(dialog);
      return dialog;
    }
    document.querySelector('#showConfirm').onclick=confirm;
    populateContent();state.confirm=confirm;state.renderProgress=populateProgress;state.renderContent=populateContent;
    return state;
  }
  root.UTTFixture={install,state};
  if(typeof module!=='undefined')module.exports={install,state};
})(typeof window!=='undefined'?window:globalThis);
