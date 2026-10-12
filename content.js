(() => {
  'use strict';
  if (document.getElementById('utt-study-extension')) return;
  const C = UTTStudyCore, A = UTTStudyAdapter;
  const host = document.createElement('div'); host.id = 'utt-study-extension';
  document.documentElement.append(host);
  const ui = host.attachShadow({ mode: 'open' });
  ui.innerHTML = `<style>
    :host{all:initial;font:14px/1.45 system-ui,-apple-system,Segoe UI,sans-serif;color:#182338}
    *{box-sizing:border-box} button,input,select{font:inherit}button{cursor:pointer;border:1px solid #d9e0eb;background:white;color:#182338;border-radius:9px;padding:9px 12px}button:hover{background:#f0f4fa}button:disabled{cursor:default;opacity:.5}button:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #f49a45;outline-offset:2px}
    #launcher{position:fixed;right:22px;bottom:22px;z-index:2147483647;border:0;border-radius:24px;background:#172d50;color:white;box-shadow:0 6px 24px #18233840;font-weight:650}
    #panel{position:fixed;right:18px;top:24px;width:560px;max-width:calc(100vw - 28px);max-height:calc(100vh - 48px);z-index:2147483646;background:#fff;border:1px solid #dfe5ee;border-radius:16px;box-shadow:0 16px 70px #172d5040;display:flex;flex-direction:column;overflow:hidden}#panel[hidden]{display:none}
    header{background:#172d50;color:#fff;padding:18px 20px;display:flex;justify-content:space-between;align-items:flex-start}header small{font-size:10px;letter-spacing:2px;color:#bbcce4}h1{font-size:21px;margin:5px 0 0;font-weight:650}header button{border:0;background:#ffffff18;color:white;padding:4px 11px;font-size:22px}#course{margin-top:4px;font-size:12px;color:#d8e3f3;max-width:440px}
    .body{padding:16px;overflow:auto}.stats{display:flex;gap:8px;margin-bottom:12px}.stat{flex:1;background:#f3f6fb;border-radius:10px;padding:9px 11px}.stat b{display:block;font-size:20px}.stat span{font-size:11px;color:#64748b}.toolbar{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:10px}.primary{background:#ec7926;border-color:#ec7926;color:white;font-weight:650}.primary:hover{background:#d96616}.danger{color:#af273e}#status{padding:10px 12px;border-left:3px solid #ec7926;background:#fff7ef;border-radius:6px;margin:10px 0;font-size:12px}
    .filters{display:flex;gap:7px;margin:12px 0 8px}input[type=search]{min-width:0;flex:1;border:1px solid #d9e0eb;border-radius:8px;padding:8px}select{border:1px solid #d9e0eb;background:white;border-radius:8px;padding:7px;color:#182338}.selection{display:flex;gap:6px;margin:8px 0}.selection button{font-size:11px;padding:6px 9px}.list{border:1px solid #e0e6ef;border-radius:10px;overflow:hidden}.row{display:grid;grid-template-columns:20px minmax(110px,1fr) 58px 58px 58px;gap:7px;padding:11px 9px;border-top:1px solid #e9edf3;align-items:center}.row:first-child{border-top:0}.row.head{background:#f3f6fb;font-size:10px;color:#64748b;text-align:right}.row.head span:nth-child(2){text-align:left}.row.active{background:#fff6eb}.name{min-width:0}.name button{border:0;padding:0;background:none;text-align:left;width:100%;font-size:12px;font-weight:650;overflow-wrap:anywhere}.name small{display:block;font-size:10px;color:#738299}.badge{font-size:10px;color:#9a581c}.badge.ok{color:#16825a}.num{text-align:right;font-size:12px;font-variant-numeric:tabular-nums}.unit{font-size:10px;color:#64748b}input[type=checkbox]{accent-color:#e97824;width:15px;height:15px;margin:0}.empty{padding:24px;text-align:center;color:#64748b;font-size:12px}
    #now{margin:12px 0;padding:11px 12px;background:#f3f6fb;border-radius:10px;font-size:12px}#now b{display:block}.track{height:5px;background:#dce4ee;border-radius:3px;margin:7px 0;overflow:hidden}.track div{height:100%;background:#e97824}.settings{border-top:1px solid #e4e9f1;margin-top:14px;padding-top:12px;font-size:12px}.settings label{display:flex;gap:8px;align-items:center;margin:9px 0}.note{font-size:11px;color:#66768b;margin:9px 0 0}.footer{font-size:10px;color:#6f7e91;margin-top:10px;display:flex;justify-content:space-between}.footer button{font-size:10px;padding:4px 7px}#confirmBox{border:1px solid #f0be74;background:#ffefcf;border-radius:10px;padding:10px;font-size:12px;margin:9px 0}#confirmBox[hidden]{display:none}
    @media(max-width:520px){#panel{top:10px;right:8px;max-height:calc(100vh - 20px)}.row{grid-template-columns:17px minmax(70px,1fr) 43px 43px 43px;gap:4px}.body{padding:10px}}
  </style>
  <button id="launcher" aria-label="Mở danh sách học UTT">📚 Danh sách học</button>
  <section id="panel" aria-label="Danh sách học UTT" hidden>
    <header><div><small>UTT · TRỢ LÝ VIDEO · 1.2.2</small><h1>Danh sách học</h1><div id="course">Mở một môn học để bắt đầu</div></div><button id="hide" aria-label="Thu gọn">×</button></header>
    <div class="body">
      <section id="discovery" style="padding:12px;border:1px solid #dfe5ee;border-radius:10px;margin-bottom:12px;background:#f3f6fb"><div style="display:flex;justify-content:space-between;gap:8px"><b id="scanLabel">Chuẩn bị lấy video tất cả môn</b><b id="scanPercent">0%</b></div><progress id="scanProgress" max="100" value="0" aria-label="Tiến độ lấy video tất cả môn" style="width:100%;height:12px;accent-color:#e97824;margin-top:8px"></progress><div id="scanMessage" class="note" role="status" aria-live="polite">Đang chuẩn bị đọc danh sách môn đang học…</div></section>
      <div class="stats"><div class="stat"><b id="total">0</b><span>video</span></div><div class="stat"><b id="done">0</b><span>đã đạt yêu cầu</span></div><div class="stat"><b id="left">—</b><span>phút cần phát đã biết</span></div></div>
      <p id="skipCount" class="note" hidden></p><p id="deferredCount" class="note" hidden></p>
      <details id="journeyBox"><summary>Video cần học của tất cả môn</summary><div class="toolbar" style="margin-top:9px"><button id="scanCourses">↻ Đọc lại tất cả môn</button><button id="startCourses" class="primary">▶ Phát danh sách đã chọn</button></div><div id="courseList" style="max-height:260px;overflow:auto"></div><p class="note">Video chạy lần lượt theo môn và bài. Sau lượt đọc, môn lỗi được để lại; bạn vẫn có thể phát các môn đã đọc.</p></details>
      <div class="toolbar"><button id="sync">↻ Đọc tiến độ</button><button id="start" class="primary">▶ Phát đã chọn</button><button id="stop" class="danger" disabled>■ Dừng</button></div>
      <div id="status" role="status" aria-live="polite">Bấm Đọc tiến độ để lấy danh sách đầy đủ từ trang.</div>
      <div id="confirmBox" hidden><b>Trang đang yêu cầu xác nhận học tập.</b><div id="confirmText"></div><button id="focusConfirm">Đưa tới hộp xác nhận</button></div>
      <div id="now">Chưa chọn video.</div>
      <div class="filters"><input id="search" type="search" placeholder="Tìm video…" aria-label="Tìm video"><select id="filter" aria-label="Lọc trạng thái"><option value="all">Tất cả</option><option value="pending">Cần xem</option><option value="done">Đã đạt</option><option value="skipped">Bỏ qua · đã điểm danh</option><option value="deferred">Chưa đến ngày</option><option value="error">Video lỗi</option><option value="selected">Đã chọn</option></select></div>
      <div class="selection"><button id="selectPending">Chọn cần xem</button><button id="selectVisible">Chọn kết quả lọc</button><button id="clear">Bỏ chọn</button><span class="unit" id="selectedCount"></span></div>
      <div id="list" class="list"></div>
      <div class="settings"><label>Chuyển bài <select id="mode"><option value="required">Khi trường ghi nhận đã đạt</option><option value="full">Khi phát hết video và đã đạt</option></select></label>
      <label><input id="auto" type="checkbox"> Tự xác nhận tiếp tục học khi đang phát danh sách</label>
      <div class="note">Chỉ nhận hộp xác nhận tiếp tục học có nút rõ ràng. Hộp khác sẽ dừng danh sách để bạn xử lý.</div>
      <label><input id="recover" type="checkbox" checked> Tải lại và mở lại bài nếu 3 phút phát không có tiến độ tăng</label><div class="note">Lưu vị trí xem trước khi tải lại. Tối đa 2 lần cho một bài khi tiến độ vẫn không tăng; bài lỗi được để lại rồi chuyển bài.</div><label><input id="sound" type="checkbox" checked> Báo khi cần thao tác</label>
      <p class="note">Các cột thời gian tính bằng phút, lấy từ “Tiến trình học tập”. Thời gian extension đếm là tham khảo. Phát video ở tốc độ 1×; trạng thái “đạt” theo trang.</p></div>
      <div class="footer"><span id="updated">Chưa đọc tiến độ</span><button id="export">Xuất tiến độ</button></div>
    </div>
  </section>`;
  const $ = id => ui.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, x => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[x]));
  const fmt = n => n === null || n === undefined ? '—' : new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(n);
  let courseId = null, records = [], selected = new Set(), snapshot = null;
  let running = false, busy = false, generation = 0, saveTimer = null, previous = null;
  let playingId = null, syncing = false, lastNotice = 0, nativeBlocked = false, currentDialog = null;
  let auto = false, sound = true, mode = 'required', attempted = new Set(), failures = 0, lastCheck = 0, endedId = null;
  let lastList = '', audio = null, leasePending = false, activeLease = null, missingSince = 0;
  let autoDialogEl = null, autoDialogAt = 0, alertedDialog = null;
  let journey = null, navigating = false, recoverEnabled = true, recoveryMap = {}, watch = null;
  let lastCourseList = '', booting = false, autoScanStarted = false, manualWatching = false;
  const alive = (token, id) => token === generation && courseId === id && A.course() === id;
  const validRun = token => () => running && alive(token, courseId);
  function status(message) { $('status').textContent = message; }
  function bridge() { document.dispatchEvent(new CustomEvent('utt-study-confirm-setting', { detail: auto && running && !!courseId })); }
  function scheduleSave() {
    clearTimeout(saveTimer);
    const id = courseId;
    saveTimer = setTimeout(() => {
      if (!id || id !== courseId) return;
      chrome.storage.local.set({ ['course:' + id]: { records, selected: [...selected], snapshot }, options: { auto, sound, mode, recoverEnabled } }).catch(() => status('Không lưu được dữ liệu. Hãy tải lại trang sau khi cập nhật extension.'));
    }, 400);
  }
  async function saveCurrent() {
    clearTimeout(saveTimer);
    if (courseId) await chrome.storage.local.set({['course:' + courseId]:{records,selected:[...selected],snapshot},options:{auto,sound,mode,recoverEnabled}});
  }
  async function saveFlow() {
    if (!journey) return;
    const result = await chrome.runtime.sendMessage({type:'flow-put',flow:journey});
    if (!result?.ok) throw new Error('Tab khác đang chạy các môn, hoặc chưa lưu được phiên học.');
  }
  function renderCourses() {
    const courses = journey?.courses || [];
    const active = busy || running || navigating || journey && !['review','return'].includes(journey.phase);
    const markup = courses.length ? courses.map((c,i) => `<div><label style="display:flex;gap:8px;align-items:flex-start;padding:8px 0;border-top:1px solid #e4e9f1;font-size:12px"><input type="checkbox" data-course="${i}" aria-label="Chọn môn ${escape(c.name)}" ${c.selected?'checked':''} ${active||!(c.pending>0)?'disabled':''}><span><b>${escape(c.name)}</b><small style="display:block;color:#66768b">${c.pending==null?'Chưa đọc':`${c.pending} video còn thiếu · ${fmt(c.minutes)} phút đã biết${c.unknown?` · ${c.unknown} video chưa rõ số phút`:''}`}${c.deferred?` · ${c.deferred} chưa đến ngày`:''}${c.error?` · ${escape(c.error)}`:''}</small></span></label>${c.videos?.length?`<details data-video-group="${i}" style="padding:0 0 10px 22px;font-size:12px"><summary>${c.videos.length} video cần học · ${c.videoIds?.length??c.videos.length} đã chọn</summary>${c.videos.map(v=>`<label style="display:flex;gap:7px;padding:7px 0"><input type="checkbox" data-course-video="${i}" data-video-id="${escape(v.id)}" aria-label="Chọn ${escape(v.name)} trong ${escape(c.name)}" ${c.selected&&(c.videoIds||c.videos.map(v=>v.id)).includes(v.id)?'checked':''} ${active?'disabled':''}><span>${escape(v.name)}<small style="display:block;color:#66768b">${escape(v.group)} · đã học ${fmt(v.credited)} / ${fmt(v.required)} phút · còn ${fmt(v.remaining)}</small></span></label>`).join('')}</details>`:''}</div>`).join('') : '<p class="note">Đang lấy danh sách môn và video cần học.</p>';
    if (markup !== lastCourseList) {
      const expanded = new Set([...$('courseList').querySelectorAll('details[open]')].map(el=>el.dataset.videoGroup));
      $('courseList').innerHTML = markup;
      $('courseList').querySelectorAll('details').forEach(el=>{el.open = expanded.has(el.dataset.videoGroup);});
      lastCourseList = markup;
    }
  }
  function renderDiscovery() {
    const p = C.discoveryProgress(journey);
    $('scanProgress').value = p.percent; $('scanPercent').textContent = p.percent + '%';
    $('scanLabel').textContent = p.complete ? 'Đã lấy đủ video tất cả môn' : journey?.scanCancelled ? 'Đã dừng lấy danh sách' : p.failed ? 'Chưa lấy đủ video' : 'Đang lấy video tất cả môn';
    const current = journey?.kind === 'scan' && !['return','review'].includes(journey.phase) ? journey.courses[journey.index]?.name : null;
    $('scanMessage').textContent = p.complete ? `Đã đọc ${p.total}/${p.total} môn đang học · ${p.videos} video cần học. Bấm Phát danh sách đã chọn để xem lần lượt.` : `${p.ready}/${p.total} môn đã đọc${current?` · ${current}`:''}${p.failed?` · ${p.failed} môn lỗi, bấm Đọc lại tất cả môn`:''}${journey?.scanCancelled?' · danh sách chưa đầy đủ':''}`;
  }
  const pendingVideos = rows => rows.filter(C.needsPlayback).map(r=>({id:r.id,name:r.name,group:r.group,credited:r.credited,required:r.required,remaining:C.remaining(r)}));
  async function waitReady(test, valid, timeout = 30000) {
    const until = Date.now() + timeout;
    while (Date.now() < until) {
      if (!valid()) throw new Error('Đã dừng thao tác.');
      if (test()) return;
      await A.sleep(200);
    }
    throw new Error('Trang chưa tải xong môn học; hãy kiểm tra đăng nhập hoặc kết nối.');
  }
  async function transition(path, phase) {
    const token = generation, flow = journey;
    await saveCurrent();
    if (token !== generation || flow !== journey) return;
    journey.phase = phase; journey.expected = path;
    running = false; busy = true; navigating = true; bridge(); A.video()?.pause(); render();
    const result = await A.navigate(path,journey);
    if (!result?.ok) { navigating = false; throw new Error('Không chuyển được trang; phiên học đã dừng.'); }
  }
  const coursePath = id => '/learn/lop-hoc/chi-tiet/' + id;
  async function scanCourses() {
    if (busy || running || navigating) return;
    const r = currentRecord(), v = A.video();
    const origin = {course:courseId,name:snapshot?.title||'',url:courseId?coursePath(courseId):A.LIST_PATH,
      lessonId:r?.id,time:v?.currentTime||0,selected:[...selected],wasPlaying:v ? !v.paused : false};
    autoScanStarted = true; manualWatching = false;
    journey = {token:crypto.randomUUID(),kind:'scan',phase:'catalog',courses:[],index:0,origin,catalogComplete:false,scanCancelled:false,catalogVersion:3};
    status('Đang tìm các môn đang học. Mỗi môn sẽ được mở để đọc tiến độ video.');
    $('panel').hidden = false; $('journeyBox').open = true; render();
    try {
      if (A.catalogPage()) { await saveFlow(); await continueFlow(); }
      else await transition(A.LIST_PATH,'catalog');
    } catch (error) { stop(error.message); }
  }
  async function continueFlow() {
    if (booting || navigating) return;
    booting = true;
    const token = generation, valid = () => token === generation && !navigating;
    try {
      const data = await chrome.runtime.sendMessage({type:'flow-get'});
      if (!valid()) return;
      if ((!data?.flow || data.flow.kind === 'scan' && data.flow.catalogVersion !== 3) && !autoScanStarted && A.discoveryPage()) {
        booting = false; await scanCourses(); return;
      }
      if (!data?.flow) return;
      autoScanStarted = true;
      journey = data.flow; $('panel').hidden = false; $('journeyBox').open = true; render();
      if (journey.phase === 'review') return;
      if (!courseId && !A.catalogPage()) {
        const target = journey.phase === 'resume' && journey.resume?.course ? coursePath(journey.resume.course) : journey.expected;
        if (target && ['/', '/trang-chu'].includes(location.pathname) && !(journey.redirects > 0)) {
          journey.redirects = 1; status('Trang đã trở về Trang chủ. Đang khôi phục đúng môn của phiên học…');
          await transition(target,journey.phase); return;
        }
        if (journey.kind === 'scan' && journey.phase === 'scan' && journey.courses[journey.index] && ['/', '/trang-chu'].includes(location.pathname)) {
          const failed = journey.courses[journey.index];
          Object.assign(failed,{pending:null,selected:false,scanState:'error',videos:[],videoIds:[],error:'Trang môn học trở về Trang chủ sau khi thử lại.'});
          journey.index++; journey.redirects = 0;
          await transition(journey.index < journey.courses.length ? A.LIST_PATH : journey.origin.url,journey.index < journey.courses.length ? 'enter' : 'return'); return;
        }
        throw new Error('Trang đã đổi hoặc cần đăng nhập. Phiên học dừng để bạn kiểm tra.');
      }
      if (journey.phase === 'resume') {
        const resume = journey.resume;
        if (!resume || resume.course !== courseId) throw new Error('Trang đã đổi môn. Đã hủy tự khôi phục để giữ đúng bài học.');
        busy = false; booting = false;
        await start({resume}); return;
      }
      if (journey.phase === 'return') {
        const origin = journey.origin;
        busy = true;
        if (courseId) { await waitReady(()=>!!document.querySelector('#tab2'),valid); await A.content(valid); }
        journey.phase = 'review'; journey.resume = null; await saveFlow();
        if (courseId && origin?.course === courseId && origin.lessonId) {
          const record = records.find(r => r.id === origin.lessonId);
          if (record) {
            busy = true;
            const v = await A.open(record,valid);
            if (valid() && Number.isFinite(v.duration)) v.currentTime = Math.min(origin.time,Math.max(0,v.duration - 0.2));
            v.pause();
          }
        }
        A.video()?.pause();
        const loaded = C.discoveryProgress(journey);
        status(loaded.complete ? `Đã lấy đủ ${loaded.videos} video cần học của ${loaded.total} môn. Bấm Phát danh sách đã chọn để xem lần lượt.` : `Đã đọc ${loaded.ready}/${loaded.total} môn. Còn ${loaded.failed} môn lỗi; bạn có thể chọn các môn đã đọc để phát hoặc Đọc lại tất cả môn.`);
        busy = false; render(); return;
      }
      if (A.catalogPage()) {
        busy = true;
        if (journey.phase === 'catalog') {
          journey.courses = (await A.catalog(valid)).map(c=>({...c,id:null,pending:null,selected:false,scanState:'pending',videos:[],videoIds:[]}));
          journey.catalogComplete = true;
          const origin = journey.courses.find(c=>C.fold(c.name) === C.fold(journey.origin?.name));
          if (origin) origin.id = journey.origin.course;
          if (!journey.courses.length) { await transition(journey.origin.url,'return'); return; }
          journey.index = 0; journey.phase = 'enter'; await saveFlow();
        }
        const target = journey.courses[journey.index];
        if (!target || journey.phase !== 'enter') throw new Error('Đã đổi trang ngoài phiên học. Hãy tìm lại danh sách môn.');
        status(`Đang mở ${target.name} (${journey.index+1}/${journey.courses.length})…`);
        await A.catalog(valid,target.name);
        await waitReady(()=>!!A.course(),valid);
        busy = false; booting = false;
        await loadCourse(A.course()); return;
      }
      const target = journey.courses[journey.index];
      if (!courseId || !target || target.id && target.id !== courseId) throw new Error('Trang không khớp môn của phiên học. Đã dừng chuyển môn.');
      target.id = courseId;
      if (journey.kind === 'scan') {
        busy = true; journey.phase = 'scan'; status(`Đọc ${target.name} (${journey.index+1}/${journey.courses.length})…`);
        journey.expected = coursePath(courseId); await saveFlow();
        try {
          await waitReady(()=>!!document.querySelector('#tab2'),valid);
          await sync(token,false); A.video()?.pause();
          if (snapshot?.title && C.fold(snapshot.title) !== C.fold(target.name)) throw new Error('Tên môn trên trang không khớp danh sách.');
          Object.assign(target,C.courseSummary(records)); target.selected = target.pending > 0; target.error = null;
          target.videos = pendingVideos(records); target.videoIds = target.videos.map(v=>v.id); target.scanState = 'ready';
          await saveCurrent();
        } catch (error) {
          if (!valid()) return;
          target.pending = null; target.selected = false; target.error = error.message;
          target.scanState = 'error'; target.videos = []; target.videoIds = [];
        }
        journey.index++; journey.redirects = 0;
        if (journey.index < journey.courses.length) await transition(A.LIST_PATH,'enter');
        else await transition(journey.origin.url,'return');
      } else if (journey.kind === 'play') {
        await waitReady(()=>!!document.querySelector('#tab2'),valid);
        journey.phase = 'play'; journey.resume = null; recoveryMap = {}; await saveFlow();
        busy = false; booting = false; await start({all:true,ids:target.videoIds});
      }
    } catch (error) { if (token === generation) { stop(error.message); notice(); } }
    finally { booting = false; if (!navigating && !running) busy = false; render(); }
  }
  async function startCourses() {
    if (busy || running || navigating || !journey) return;
    if (!C.canStartCourses(journey)) { status('Chưa có môn đã đọc đủ video được chọn. Hãy chờ đọc xong hoặc đọc lại môn bị lỗi.'); return; }
    const index = journey.courses.findIndex(c=>c.selected && c.pending>0);
    if (index < 0) { status('Không có môn đã chọn còn thiếu tiến độ video.'); return; }
    journey = {...journey,token:crypto.randomUUID(),kind:'play',index,resume:null};
    recoveryMap = {}; watch = null;
    try {
      const c = journey.courses[index];
      status(`Bắt đầu danh sách môn với ${c.name}…`);
      await transition(c.id ? coursePath(c.id) : A.LIST_PATH,c.id?'play':'enter');
    } catch (error) { stop(error.message); }
  }
  async function nextCourse(token) {
    if (!validRun(token)() || !journey) return;
    const item = journey.courses[journey.index];
    if (item) {
      Object.assign(item,C.courseSummary(records));
      item.videos = pendingVideos(records);
      if (item.videoIds) item.videoIds = item.videoIds.filter(id=>item.videos.some(v=>v.id===id));
      const errors = records.filter(r=>selected.has(r.id) && r.loadError);
      item.error = errors.length ? `${errors.length} video lỗi được để lại` : null;
    }
    let next = journey.index + 1;
    while (next < journey.courses.length && !(journey.courses[next].selected && journey.courses[next].pending>0)) next++;
    stop('Đã hết video có thể xem của môn hiện tại.',true);
    if (next >= journey.courses.length) {
      journey.phase = 'review'; journey.resume = null; await saveFlow();
      const pending = journey.courses.reduce((n,c)=>n+(c.pending||0),0), deferred = journey.courses.reduce((n,c)=>n+(c.deferred||0),0);
      status(`Đã chạy hết các môn đã chọn. Còn ${pending} video cần kiểm tra lại và ${deferred} ghi hình chưa đến ngày.`);
      render(); notice(pending?'attention':'done'); return;
    }
    journey.index = next; journey.resume = null; recoveryMap = {};
    const target = journey.courses[next];
    status(`Đang chuyển sang ${target.name}…`);
    await transition(target.id ? coursePath(target.id) : A.LIST_PATH,target.id?'play':'enter');
  }
  async function recoverVideo(record,token,time,reason) {
    if (!record || !validRun(token)() || navigating) return;
    busy = true; previous = null; A.video()?.pause();
    const previousRecovery = recoveryMap[record.id];
    const count = C.progressChanged(previousRecovery,record) ? 0 : previousRecovery?.count || 0;
    if (!recoverEnabled || count >= 2) {
      record.loadError = `${reason} Đã để lại bài sau ${count} lần tải lại.`;
      attempted.add(record.id); watch = null; busy = false; scheduleSave(); await advance(token); return;
    }
    recoveryMap[record.id] = {count:count+1,credited:record.credited};
    const flow = journey?.kind === 'play' && journey.phase === 'play' ? journey : {...(journey || {}),token:journey?.token||crypto.randomUUID(),kind:'single',courses:journey?.courses||[]};
    flow.phase = 'resume'; flow.resume = {course:courseId,lessonId:record.id,time,selected:[...selected],attempted:[...attempted],recovery:recoveryMap};
    journey = flow;
    status(`${reason} Đang lưu vị trí và tải lại trang (${count+1}/2), sau đó mở lại ${record.name}.`);
    render(); await saveCurrent();
    if (!validRun(token)()) return;
    navigating = true; running = false; bridge();
    const result = await A.reload(flow);
    if (!result?.ok) { navigating = false; stop('Không tải lại được trang. Đã giữ danh sách và vị trí trong phiên để bạn kiểm tra.'); }
  }
  function visibleRecords() {
    const search = C.fold($('search').value), filter = $('filter').value;
    return records.filter(r => C.fold(r.name + ' ' + r.group).includes(search) &&
      (filter === 'all' || filter === 'pending' && C.needsPlayback(r) || filter === 'done' && r.complete || filter === 'skipped' && r.skipped || filter === 'deferred' && !!r.deferredUntil || filter === 'error' && !!r.loadError || filter === 'selected' && selected.has(r.id)));
  }
  function currentRecord() {
    const active = A.links().find(a => a.el.parentElement.classList.contains('content-selected'));
    return records.find(r => r.id === active?.id) || records.find(r => C.fold(r.name) === C.fold(A.current()));
  }
  function render() {
    $('course').textContent = snapshot?.title || (courseId ? 'Môn học đang mở' : 'Mở một môn học để bắt đầu');
    $('total').textContent = records.length;
    $('done').textContent = records.filter(r => r.complete).length;
    const known = records.filter(r => !r.skipped && !r.deferredUntil).map(C.remaining).filter(n => n !== null);
    $('left').textContent = known.length ? fmt(known.reduce((a,b) => a+b,0)) : '—';
    const skips = records.filter(r => r.skipped).length;
    $('skipCount').hidden = !skips;
    $('skipCount').textContent = `${skips} video ghi hình Vclass được bỏ qua vì đã điểm danh cùng buổi.`;
    const selectedSkips = records.filter(r => r.skipped && selected.has(r.id)).length;
    $('selectedCount').textContent = `${selected.size} đã chọn${selectedSkips ? ` · ${selectedSkips} bỏ qua` : ''}`;
    ['sync','start','selectPending','selectVisible','clear','mode'].forEach(id => { $(id).disabled = busy || running || !courseId; });
    if (journey?.kind === 'scan' && !C.discoveryProgress(journey).complete) $('start').disabled = true;
    $('stop').disabled = !busy && !running && !navigating;
    $('scanCourses').disabled = busy || running || navigating;
    $('startCourses').disabled = busy || running || navigating || !C.canStartCourses(journey);
    $('deferredCount').hidden = !records.some(r => r.deferredUntil);
    $('deferredCount').textContent = records.filter(r => r.deferredUntil).length + ' ghi hình Vclass chưa đến ngày; sẽ chuyển sang bài hoặc môn khác.';
    renderCourses();
    renderDiscovery();
    $('updated').textContent = snapshot ? `Đọc lúc ${new Date(snapshot.updated).toLocaleTimeString('vi-VN')}` : 'Chưa đọc tiến độ';
    const list = visibleRecords();
    const markup = `<div class="row head"><span></span><span>Video / trạng thái</span><span>Đã học</span><span>Cần đạt</span><span>Còn thiếu</span></div>` +
      (list.length ? list.map(r => `<div class="row ${r.id === playingId ? 'active' : ''}">
        <input type="checkbox" data-select="${escape(r.id)}" aria-label="Chọn ${escape(r.name)}" ${selected.has(r.id)?'checked':''} ${running||busy||r.skipped||r.deferredUntil?'disabled':''}>
        <div class="name"><button data-open="${escape(r.id)}" ${busy||running?'disabled':''}>${escape(r.name)}</button><small>${escape(r.group)}</small><span class="badge ${r.complete?'ok':''}">${r.deferredUntil?'◷ Chưa đến ngày':r.loadError?'⚠ Video lỗi · để lại':r.skipped?'↷ Bỏ qua · đã điểm danh':r.complete?'● Đạt yêu cầu':r.knownStatus?'○ Chưa đạt':'? Chưa rõ trạng thái'}</span>${r.skipped?`<small>${escape(r.attendance)}</small>`:''}${r.loadError?`<small>${escape(r.loadError)}</small>`:''}<small>Extension đếm: ${fmt((r.local || 0)/60)} phút${r.playedEnd?' · đã phát hết':''}</small></div>
        <span class="num">${fmt(r.credited)}</span><span class="num">${fmt(r.required)}</span><span class="num">${fmt(C.remaining(r))}</span></div>`).join('') : '<div class="empty">Chưa có video trong danh sách này.<br>Đọc tiến độ hoặc đổi bộ lọc.</div>');
    if (markup !== lastList) { $('list').innerHTML = markup; lastList = markup; }
    const r = currentRecord(), v = A.video();
    if (r && v) {
      const pct = Number.isFinite(v.duration) && v.duration > 0 ? Math.min(100,v.currentTime/v.duration*100) : 0;
      $('now').innerHTML = `<b>${escape(r.name)}</b><div class="track"><div style="width:${pct}%"></div></div><span>${v.paused?'Tạm dừng':'Đang phát'} · ${fmt(v.currentTime/60)} / ${fmt(Number.isFinite(v.duration)?v.duration/60:null)} phút video</span><div class="unit">Trường ghi nhận: ${fmt(r.credited)} phút · còn thiếu ${fmt(C.remaining(r))} phút${(r.since || 0)>0 ? ` · phát thêm khoảng ${fmt(r.since/60)} phút từ lần đọc` : ''}</div>`;
    } else $('now').textContent = syncing ? 'Đang đọc bảng tiến độ…' : 'Chọn tên video để mở, hoặc chọn nhiều bài rồi bấm Phát đã chọn.';
  }
  async function notice(kind = 'attention') {
    if (!sound || Date.now() - lastNotice < 15000) return;
    lastNotice = Date.now();
    chrome.runtime.sendMessage({ type:'notice', kind }).catch(() => {});
    try {
      if (!audio) audio = new AudioContext();
      if (audio.state === 'suspended') await audio.resume();
      const tone = audio.createOscillator(), volume = audio.createGain();
      tone.frequency.value = 660; volume.gain.value = 0.09;
      tone.connect(volume); volume.connect(audio.destination); tone.start(); tone.stop(audio.currentTime + 0.25);
    } catch { /* System notifications still work when sound is blocked. */ }
  }
  function stop(message = 'Đã dừng danh sách. Bạn có thể chọn video và phát lại.', keepFlow = false) {
    generation++; running = false; busy = false; syncing = false; playingId = null; previous = null; navigating = false; watch = null;
    if (!keepFlow) {
      if (journey?.kind === 'scan' && !['review','return'].includes(journey.phase)) journey.scanCancelled = true;
      if (journey) journey = {...journey, phase:'review', resume:null};
      chrome.runtime.sendMessage(journey ? {type:'flow-put',flow:journey} : {type:'flow-clear'}).catch(() => {});
    }
    A.video()?.pause(); bridge();
    if (activeLease) chrome.runtime.sendMessage({ type:'release', ...activeLease }).catch(() => {});
    activeLease = null;
    status(message); scheduleSave(); render();
  }
  async function loadCourse(id) {
    if (running || busy) stop('Đã dừng vì bạn chuyển môn học.');
    const token = ++generation;
    courseId = id; records = []; selected = new Set(); snapshot = null; playingId = null; previous = null; lastList = '';
    $('panel').hidden = !id && !A.catalogPage(); render();
    if (!id) { bridge(); status('Bấm Tìm môn thiếu tiến độ để đọc các môn đang học.'); await continueFlow(); return; }
    try {
      const data = await chrome.storage.local.get(['course:' + id, 'options']);
      if (!alive(token,id)) return;
      const cache = data['course:' + id];
      records = (cache?.records || []).map(r => ({ ...r, since:0 }));
      selected = new Set(cache?.selected || []); snapshot = cache?.snapshot || null;
      ({ auto = false, sound = true, mode = 'required', recoverEnabled = true } = data.options || {});
      $('auto').checked = auto; $('sound').checked = sound; $('mode').value = mode; $('recover').checked = recoverEnabled;
      status(cache ? 'Đã tải dữ liệu lưu trên máy. Bấm Đọc tiến độ để cập nhật từ trang.' : 'Bấm Đọc tiến độ để lấy tất cả video và số phút cần đạt.');
      bridge(); render(); await continueFlow();
    } catch { status('Chưa truy cập được bộ nhớ extension. Hãy tải lại trang.'); }
  }
  async function sync(token, restore = true) {
    const id = courseId, valid = () => alive(token,id) && busy;
    const old = currentRecord(), oldName = A.current(), v = A.video();
    const time = v?.currentTime || 0, wasPaused = v?.paused ?? true;
    if (v) v.pause(); previous = null; syncing = true;
    status('Đang đọc tiến độ từ trang. Video sẽ được mở lại sau khi đọc.'); render();
    const fresh = await A.progress(valid);
    if (!valid()) return;
    const oldMap = new Map(records.map(r => [r.id,r]));
    records = fresh.records.map(r => ({ ...r, local:oldMap.get(r.id)?.local || 0, playedEnd:oldMap.get(r.id)?.playedEnd || false, loadError:oldMap.get(r.id)?.loadError || null, since:0 }));
    snapshot = { title:fresh.title, total:fresh.total, updated:fresh.updated };
    selected = new Set([...selected].filter(s => records.some(r => r.id === s)));
    await A.content(valid);
    const entries = A.attendanceEntries();
    records = C.availability(C.attendanceSkips(records, entries), entries);
    if (restore && oldName) {
      const target = records.find(r => r.id === old?.id) || records.find(r => C.fold(r.name) === C.fold(oldName));
      if (target) {
        const restored = await A.open(target, valid);
        if (!valid()) return;
        if (Number.isFinite(restored.duration)) restored.currentTime = Math.min(time, Math.max(0,restored.duration - 0.2));
        if (!wasPaused && time < (restored.duration || Infinity) - 0.3) await restored.play().catch(() => {});
        else restored.pause();
      }
    }
    syncing = false; previous = null; scheduleSave(); render();
  }
  async function manualSync() {
    if (busy || running || !courseId) return;
    busy = true; const token = ++generation; render();
    try { await sync(token); if (token === generation) status(`Đã đọc ${records.length} video. Chọn các bài muốn phát.`); }
    catch (e) { if (token === generation) status(e.message); }
    finally { if (token === generation) { busy = false; syncing = false; render(); } }
  }
  async function playRecord(record, token, bookmark = null) {
    playingId = record.id; endedId = null; previous = null; busy = true; render();
    const v = await A.open(record, validRun(token));
    if (!validRun(token)()) return;
    v.playbackRate = 1; v.loop = false;
    record.loadError = null;
    if (bookmark && Number.isFinite(bookmark.time) && Number.isFinite(v.duration)) v.currentTime = Math.min(Math.max(0, bookmark.time), Math.max(0,v.duration - 0.2));
    if (!watch || watch.id !== record.id) watch = {id:record.id, seconds:0};
    await v.play();
    if (!validRun(token)()) { v.pause(); return; }
    busy = false; lastCheck = Date.now(); failures = 0;
    const target = C.remaining(record);
    status(`Đang phát ${record.name}. ${target===null?'Chưa biết thời gian tối thiểu; sẽ kiểm tra sau khi video kết thúc.':`Trang còn yêu cầu ${fmt(target)} phút.`}`); render();
  }
  async function advance(token, bookmark = null) {
    if (!validRun(token)()) return;
    const record = C.next(records,selected,attempted);
    if (!record) {
      if (journey?.kind === 'play' && journey.phase === 'play') { await nextCourse(token); return; }
      const stillPending = records.filter(r => selected.has(r.id) && C.needsPlayback(r));
      const deferred = records.filter(r => selected.has(r.id) && r.deferredUntil).length;
      const skipped = records.filter(r => selected.has(r.id) && r.skipped).length;
      stop(stillPending.length ? 'Còn video lỗi hoặc chưa được trường ghi nhận đạt. Các bài này được để lại để thử lại sau.' : deferred ? `Đã hết video có thể xem; ${deferred} ghi hình Vclass chưa đến ngày.` : skipped ? `Đã xong danh sách: ${skipped} ghi hình Vclass được bỏ qua vì đã điểm danh; các video còn lại đã đạt yêu cầu.` : 'Tất cả video đã chọn đã được trang ghi nhận đạt yêu cầu.');
      if (!stillPending.length) notice('done');
      return;
    }
    try { await playRecord(record,token,bookmark?.id === record.id ? bookmark : null); }
    catch (error) {
      if (!validRun(token)()) return;
      if (error.code !== 'VIDEO_UNAVAILABLE') throw error;
      await recoverVideo(record, token, 0, error.message);
    }
  }
  async function start(settings = {}) {
    if (busy || running || !courseId) return;
    if (!settings.all && !settings.resume && journey?.kind === 'scan' && !C.discoveryProgress(journey).complete) {
      status('Chưa đọc đủ tất cả môn; hãy chờ 100% trước khi phát danh sách.'); return;
    }
    if (!selected.size && !settings.all) { status('Chọn ít nhất một video trước khi phát.'); return; }
    busy = true; const id = courseId, token = ++generation, lease = {course:courseId,run:crypto.randomUUID()}; activeLease = lease; render();
    try {
      const owner = await chrome.runtime.sendMessage({ type:'lease', ...lease, acquire:true });
      if (!alive(token,id)) { await chrome.runtime.sendMessage({type:'release',...lease}); return; }
      if (!owner?.ok) throw new Error('Một tab khác đang phát danh sách trong môn này. Dừng tab đó trước.');
      await sync(token,false);
      if (!alive(token,id)) return;
      if (settings.all) selected = new Set(records.filter(r=>C.needsPlayback(r) && (!settings.ids || settings.ids.includes(r.id))).map(r => r.id));
      if (settings.resume) {
        selected = new Set(settings.resume.selected.filter(s => records.some(r => r.id === s)));
        recoveryMap = settings.resume.recovery || {};
        const restored = records.find(r => r.id === settings.resume.lessonId);
        if (restored && C.progressChanged({credited:recoveryMap[restored.id]?.credited ?? restored.credited},restored)) delete recoveryMap[restored.id];
      }
      const renewed = await chrome.runtime.sendMessage({ type:'lease', ...lease });
      if (!alive(token,id)) return;
      if (!renewed?.ok) throw new Error('Tab khác đã bắt đầu phát môn này. Đã dừng tab hiện tại.');
      running = true; attempted = new Set(settings.resume?.attempted || []); watch = null;
      if (journey?.phase === 'resume') { journey.phase = journey.kind === 'play' ? 'play' : 'review'; journey.redirects = 0; await saveFlow(); }
      bridge(); await advance(token, settings.resume ? {id:settings.resume.lessonId,time:settings.resume.time} : null);
    } catch (e) { if (token===generation) stop(e.name === 'NotAllowedError' ? 'Chrome chặn tự phát. Bấm Play trên video rồi thử Phát đã chọn.' : e.message); }
  }
  async function checkpoint(token, atEnd) {
    if (busy || !validRun(token)()) return;
    busy = true; render();
    const id = playingId, before = records.find(r => r.id===id), oldFailures = failures, time = A.video()?.currentTime || 0;
    try {
      await sync(token, !atEnd);
      if (!validRun(token)()) return;
      const record = records.find(r => r.id===id);
      if (!record) throw new Error('Bài học đã thay đổi. Hãy đọc lại tiến độ.');
      if (C.progressChanged(before,record)) { watch = {id,seconds:0}; delete recoveryMap[id]; }
      if (record.skipped || record.deferredUntil || record.complete && (mode==='required' || atEnd)) {
        attempted.add(id); busy = false; await advance(token); return;
      }
      failures = record.credited !== null && record.credited > (before?.credited ?? -1) ? 0 : oldFailures + 1;
      if (recoverEnabled && (watch?.seconds >= 180 || atEnd) && !C.progressChanged(before,record)) {
        await recoverVideo(record,token,atEnd ? 0 : time,'Tiến độ không tăng sau khi phát.'); return;
      }
      if (failures >= 3) {
        record.loadError = 'Ba lần đọc chưa thấy tiến độ tăng.'; attempted.add(id); busy = false; await advance(token); return;
      }
      if (atEnd) {
        const savedFailures = failures;
        busy = false; await playRecord(record,token); failures = savedFailures;
        status(`Video đã phát hết nhưng trang chưa ghi nhận đạt. Đang phát lại ${record.name}; còn thiếu ${fmt(C.remaining(record))} phút.`);
      } else {
        busy = false; lastCheck = Date.now(); status(`Trang ghi nhận ${fmt(record.credited)} phút cho ${record.name}. Tiếp tục phát để cập nhật đủ yêu cầu.`);
      }
    } catch (e) { if (token===generation) { if (e.code === 'VIDEO_UNAVAILABLE') await recoverVideo(before,token,time,e.message); else {stop(e.message); notice();} } }
    finally { if (token===generation) { syncing = false; busy = false; render(); } }
  }
  function processDialogs() {
    const all = A.dialogs();
    const learning = A.learningDialog();
    if (!learning) { autoDialogEl = null; alertedDialog = null; }
    currentDialog = learning;
    $('confirmBox').hidden = !learning && !nativeBlocked;
    if (learning) {
      $('confirmText').textContent = C.clean(learning.el.textContent).slice(0,220);
      if (running && auto && learning.button && autoDialogEl !== learning.el) {
        autoDialogEl = learning.el; autoDialogAt = Date.now(); learning.button.click();
        status('Đã xác nhận tiếp tục học theo tùy chọn bạn bật.');
      } else if (running && auto && autoDialogEl === learning.el && Date.now()-autoDialogAt>5000) {
        stop('Hộp xác nhận vẫn mở sau khi bấm. Hãy xác nhận trực tiếp trên trang.'); notice();
      } else if (running && alertedDialog !== learning.el) { alertedDialog = learning.el; notice(); }
    }
    if (running && all.length && (!learning || !learning.button)) {
      stop('Có hộp thoại cần bạn xử lý trên trang. Đã dừng danh sách.'); notice();
    }
  }
  function tick() {
    if (navigating || booting) return;
    if (A.course() !== courseId) { loadCourse(A.course()); return; }
    processDialogs();
    const v = A.video(), r = currentRecord();
    if (!running && !manualWatching && journey?.kind === 'scan') v?.pause();
    if (running && !busy && !syncing) {
      if (v?.error) { recoverVideo(records.find(r => r.id === playingId),generation,v.currentTime || 0,'Trình phát báo lỗi nguồn video.').catch(e => stop(e.message)); return; }
      if (!v || !r) {
        missingSince ||= Date.now();
        if (Date.now()-missingSince>15000) {recoverVideo(records.find(r => r.id === playingId),generation,0,'Trang không còn hiện video.').catch(e => stop(e.message));return;}
      } else missingSince=0;
    } else missingSince=0;
    if (v && r && !syncing) {
      const sample = { id:r.id, source:v.currentSrc || v.querySelector('source')?.src || '', now:performance.now(), time:v.currentTime, rate:v.playbackRate,
        paused:v.paused, seeking:v.seeking, readyState:v.readyState, blocked:nativeBlocked || !!currentDialog || !!A.dialogs().length };
      const delta = C.activeSeconds(previous,sample); previous = sample;
      if (delta && running && !busy && watch?.id === r.id) watch.seconds += delta;
      if (delta) { r.local = (r.local||0) + delta; r.since = (r.since||0) + delta; scheduleSave(); }
      if (v.ended) { r.playedEnd = true; endedId = r.id; }
      if (running && !busy) {
        if (r.id !== playingId) { stop('Bạn đã đổi video. Danh sách tạm dừng; bấm Phát đã chọn để tiếp tục.'); return; }
        if (sample.blocked) { render(); return; }
        const remaining = C.remaining(r), threshold = remaining === null ? Infinity : remaining * 60 + 8;
        if (v.ended || recoverEnabled && watch?.seconds >= 180 || (mode==='required' && (r.complete || (r.since||0)>=threshold) && Date.now()-lastCheck>60000)) checkpoint(generation,v.ended);
      }
    } else { previous = null; }
    render();
  }
  $('launcher').onclick = () => { $('panel').hidden = !$('panel').hidden; };
  $('hide').onclick = () => { $('panel').hidden = true; };
  $('sync').onclick = manualSync; $('start').onclick = start; $('stop').onclick = () => stop();
  $('scanCourses').onclick = scanCourses; $('startCourses').onclick = startCourses;
  $('courseList').onchange = e => {
    const index = e.target.dataset.course ?? e.target.dataset.courseVideo, course = journey?.courses[index];
    if (index === undefined || busy || running || navigating || !course || !Array.isArray(course.videos)) return;
    if (e.target.dataset.courseVideo !== undefined) {
      const id = e.target.dataset.videoId;
      if (!course.videos.some(v=>v.id===id)) return;
      const ids = new Set(course.videoIds || course.videos.map(v=>v.id));
      e.target.checked ? ids.add(id) : ids.delete(id);
      course.videoIds = [...ids]; course.selected = ids.size > 0;
    } else {
      course.selected = e.target.checked;
      course.videoIds = e.target.checked ? course.videos.map(v=>v.id) : [];
    }
    saveFlow().catch(error=>status(error.message)); render();
  };
  $('search').oninput = render; $('filter').onchange = render;
  $('selectPending').onclick = () => { selected = new Set(records.filter(C.needsPlayback).map(r=>r.id)); scheduleSave(); render(); };
  $('selectVisible').onclick = () => { visibleRecords().filter(r=>!r.skipped && !r.deferredUntil).forEach(r=>selected.add(r.id)); scheduleSave(); render(); };
  $('clear').onclick = () => { selected.clear(); scheduleSave(); render(); };
  $('list').onchange = e => { const id=e.target.dataset.select; if (!id || busy || running) return; e.target.checked?selected.add(id):selected.delete(id); scheduleSave(); render(); };
  $('list').onclick = async e => {
    const id=e.target.closest('[data-open]')?.dataset.open; if (!id || running || busy) return;
    const r=records.find(x=>x.id===id); if (!r) return;
    manualWatching = true;
    busy=true; const token=++generation; render();
    try { const v=await A.open(r,()=>alive(token,courseId)&&busy); if (token===generation) { await v.play().catch(()=>{}); status(`Đã mở ${r.name}. Bấm Play trên video nếu Chrome chặn tự phát.`); } }
    catch(e) { if(token===generation) status(e.message); }
    finally { if(token===generation) {busy=false;render();} }
  };
  $('auto').onchange = () => { auto=$('auto').checked; bridge(); scheduleSave(); };
  $('recover').onchange = () => { recoverEnabled=$('recover').checked; scheduleSave(); };
  $('sound').onchange = () => { sound=$('sound').checked; scheduleSave(); };
  $('mode').onchange = () => { mode=$('mode').value; scheduleSave(); };
  $('focusConfirm').onclick = () => {
    $('panel').hidden=true;
    const el=currentDialog?.button || currentDialog?.el;
    el?.scrollIntoView({block:'center'}); el?.focus();
  };
  $('export').onclick = () => {
    const data={course:snapshot?.title||courseId,readAt:snapshot?.updated?new Date(snapshot.updated).toISOString():null,
      videos:records.map(r=>({video:r.name,group:r.group,schoolMinutes:r.credited,requiredMinutes:r.required,remainingMinutes:C.remaining(r),schoolComplete:r.complete,queueSkipped:!!r.skipped,deferredUntil:r.deferredUntil?new Date(r.deferredUntil).toISOString():null,videoError:r.loadError||null,completedAttendance:r.attendance||null,localPlaybackMinutes:Number(((r.local||0)/60).toFixed(2)),selected:selected.has(r.id)}))};
    const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
    const a=document.createElement('a'); a.href=url; a.download=`utt-tien-do-${courseId||'video'}.json`; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  document.addEventListener('utt-study-native-confirm', e => {
    nativeBlocked=e.detail?.phase==='open'; previous=null;
    if(nativeBlocked && !e.detail?.auto) { $('confirmText').textContent='Hộp xác nhận gốc của Chrome đang mở. Hãy xác nhận ngay trong hộp đó.'; notice(); }
    if(e.detail?.phase==='closed' && e.detail?.auto) status('Đã tự xác nhận tiếp tục học theo tùy chọn bạn bật.');
    if(e.detail?.phase==='closed' && !e.detail?.accepted && running) stop('Bạn đã từ chối xác nhận. Đã dừng danh sách.');
  });
  chrome.runtime.onMessage.addListener(message => { if(message.type==='toggle') $('panel').hidden=!$('panel').hidden; });
  setInterval(tick,1000);
  setInterval(async () => {
    if(!running || leasePending) return;
    leasePending=true; const lease=activeLease, token=generation;
    try { const result=await chrome.runtime.sendMessage({type:'lease',...lease}); if(token===generation && !result?.ok) stop('Tab khác đang phát môn này. Đã dừng tab hiện tại.'); }
    catch { if(token===generation) stop('Mất kết nối extension. Hãy tải lại trang.'); }
    finally { leasePending=false; }
  },10000);
  window.addEventListener('pagehide',()=>{if(activeLease) chrome.runtime.sendMessage({type:'release',...activeLease}).catch(()=>{});});
  loadCourse(A.course());
})();
