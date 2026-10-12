(() => {
  'use strict';
  const C = UTTStudyCore;
  const visible = el => !!el && !!(el.getClientRects().length) && getComputedStyle(el).visibility !== 'hidden';
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  function activate(element) {
    if (!element) throw new Error('Không tìm thấy nút thao tác của trang.');
    // Let the page-world bridge invoke UTT's Angular widget, with its own event
    // objects and prototypes. The bridge only accepts course navigation controls.
    const handled = !element.dispatchEvent(new CustomEvent('utt-study-activate', { bubbles:true, cancelable:true }));
    if (!handled) throw new Error('Chưa kết nối được với trang. Hãy tải lại trang sau khi cập nhật tiện ích.');
  }
  async function waitFor(get, valid = () => true, timeout = 15000) {
    const until = Date.now() + timeout;
    while (Date.now() < until) {
      if (!valid()) throw new Error('Đã dừng thao tác.');
      const found = get();
      if (found) return found;
      await sleep(180);
    }
    throw new Error('Trang phản hồi chậm hoặc chưa tải được nội dung.');
  }
  function course() { return location.pathname.match(/\/learn\/lop-hoc\/chi-tiet\/([a-zA-Z0-9-]+)/)?.[1] || null; }
  function current() {
    const a = document.querySelector('#tnContentList .content-selected a[href]');
    if (a) return C.clean(a.textContent);
    const head = document.querySelector('#tnContentView .headcontent .col-md-10');
    if (!head) return '';
    const clone = head.cloneNode(true);
    clone.querySelector('#tnContentButton')?.remove();
    // The nested span contains the course title, while the outer span is the lesson.
    clone.querySelectorAll('span span').forEach(s => s.remove());
    return C.clean(clone.textContent);
  }
  function video() { return document.querySelector('#tnContentView video'); }
  function links() {
    const counts = new Map();
    return [...document.querySelectorAll('#tnContentList a[href]')].map(el => {
      const name = C.clean(el.textContent), n = C.fold(name), occurrence = counts.get(n) || 0;
      counts.set(n, occurrence + 1);
      return { id: C.key(name, occurrence), name, el, complete: el.classList.contains('finished') };
    });
  }
  function attendanceEntries() {
    const groups = new Map();
    return links().map(item => {
      const group = item.el.closest('.class-lesson-child');
      if (group && !groups.has(group)) groups.set(group, groups.size);
      const header = group?.querySelector('.__lesson-name-child');
      return { id:item.id, name:item.name, complete:item.complete, group:group ? groups.get(group) : null,
        session:C.clean(header?.textContent) };
    });
  }
  async function expandAll(valid) {
    const attempted = new Set();
    for (let n = 0; n < 250; n++) {
      if (!valid()) throw new Error('Đã dừng thao tác.');
      const arrow = [...document.querySelectorAll('#tnContentList .__lesson-name-child .fa-chevron-down')]
        .find(el => visible(el) && !attempted.has(el.closest('.__lesson-name-child')));
      if (!arrow) return;
      attempted.add(arrow.closest('.__lesson-name-child'));
      activate(arrow); await sleep(100);
    }
    // Links also exist in collapsed groups. A decorative/stale arrow must not
    // prevent the queue from opening the actual lesson or loop on one group.
  }
  async function content(valid) {
    if (!document.querySelector('#tab1-panel.active')) {
      const tab = document.querySelector('#tab1');
      if (!tab) throw new Error('Hãy mở một môn học trong hệ thống UTT.');
      activate(tab);
    }
    await waitFor(() => document.querySelector('#tab1-panel.active #tnContentList'), valid);
    // Tab switching recreates the content component asynchronously. Allow its
    // automatic resume to settle before issuing another lesson request.
    await sleep(900);
    if (!valid()) throw new Error('Đã dừng thao tác.');
    await expandAll(valid);
  }
  function unavailable(message) { const error = new Error(message); error.code = 'VIDEO_UNAVAILABLE'; return error; }
  async function readyVideo(valid, changed = () => true) {
    try { return await waitFor(() => {
      const v = video();
      if (v?.error) throw unavailable('Trang báo lỗi nguồn video.');
      return v?.isConnected && v.readyState >= 1 && changed(v) ? v : null;
    }, valid, 20000); }
    catch (error) {
      if (!valid() || error.code) throw error;
      throw unavailable('Bài đã mở nhưng trang chưa tải được video.');
    }
  }
  async function open(record, valid) {
    await content(valid);
    if (C.fold(current()) === C.fold(record.name)) {
      // UTT already resumes this lesson on tab entry. Opening it again creates
      // overlapping learning sockets and the school can redirect to Home.
      return await readyVideo(valid);
    }
    const link = await waitFor(() => links().find(a => a.id === record.id), valid, 10000);
    const before = video(), beforeSource = before?.currentSrc || before?.querySelector('source')?.src;
    activate(link.el);
    // Wait for the selected lesson, then allow Angular to replace the old player.
    await waitFor(() => C.fold(current()) === C.fold(record.name), valid);
    await sleep(700);
    const v = await readyVideo(valid, next => {
      const source = next?.currentSrc || next?.querySelector('source')?.src;
      return next !== before || source !== beforeSource;
    });
    return v;
  }
  function rawRows() {
    return [...document.querySelectorAll('#tab2-panel tbody tr')].map(tr => [...tr.querySelectorAll(':scope > td')].map(td => td.textContent));
  }
  let settledCourse = null;
  async function settleCourse(valid) {
    if (settledCourse === course()) return;
    // UTT renders the tab bar before its initial course request finishes. That
    // request also schedules an automatic lesson resume one second later. Do
    // not start a second course request by switching tabs in the middle of it.
    await waitFor(() => links().length || rawRows().length, valid, 25000);
    await sleep(1800);
    if (!valid()) throw new Error('Đã dừng thao tác.');
    settledCourse = course();
  }
  async function progress(valid) {
    const tab = document.querySelector('#tab2');
    if (!tab) throw new Error('Không tìm thấy tab Tiến trình học tập.');
    await settleCourse(valid);
    if (document.querySelector('#tab2-panel.active')) {
      activate(document.querySelector('#tab1'));
      await sleep(200);
    }
    if (!valid()) throw new Error('Đã dừng thao tác.');
    activate(tab);
    await sleep(1500);
    await waitFor(() => rawRows().length, valid, 20000);
    let last = '', stable = 0;
    for (let n = 0; n < 35; n++) {
      if (!valid()) throw new Error('Đã dừng thao tác.');
      const rows = rawRows(), signature = JSON.stringify(rows);
      stable = signature === last ? stable + 1 : 0; last = signature;
      if (stable >= 2) {
        const records = C.parseRows(rows);
        const total = C.clean([...document.querySelectorAll('#tab2-panel .class-detail-box')].find(b => C.fold(b.textContent).includes('thoi gian hoc/yeu cau'))?.querySelector('.content-minute')?.textContent);
        const titleRow = [...document.querySelectorAll('#tab2-panel .class-detail-box .row')].find(r => /^lop hoc\s*:$/.test(C.fold(r.children[0]?.textContent)));
        return { records, total, title: C.clean(titleRow?.children[1]?.textContent), updated: Date.now() };
      }
      await sleep(250);
    }
    throw new Error('Bảng tiến độ chưa ổn định; hãy thử cập nhật lại.');
  }
  function dialogs() {
    return [...document.querySelectorAll('[role="dialog"], .ui-dialog, .modal.show, .swal2-popup, .sweet-alert')]
      .filter(visible).filter((el, i, all) => !all.some((other, j) => j !== i && other.contains(el)));
  }
  const LIST_PATH = '/danh-sach-lop-dang-hoc?statusId=0';
  function catalogPage() { return location.pathname === '/danh-sach-lop-dang-hoc'; }
  function discoveryPage() { return !!course() || catalogPage() || ['/', '/trang-chu'].includes(location.pathname); }
  function catalogRows() {
    return [...document.querySelectorAll('tbody tr')].flatMap(tr => {
      const cells = [...tr.querySelectorAll(':scope > td')];
      if (cells.length < 9) return [];
      const value = cell => C.clean(cell.querySelector('.ui-column-value')?.textContent || cell.textContent);
      const name = C.clean(cells[1].querySelector('a')?.textContent);
      const status = value(cells[7]);
      if (!name || !C.isStudyCourse(name,status)) return [];
      const el = [...cells[8].querySelectorAll('a,button')].find(el => C.fold(el.textContent).includes('vao hoc'));
      return el ? [{ name, status, el }] : [];
    });
  }
  function nextPage() { return document.querySelector('.ui-paginator-next:not(.ui-state-disabled):not([disabled])'); }
  async function catalog(valid, wanted = null) {
    const loaded = () => [...document.querySelectorAll('tbody tr')].some(tr =>
      tr.querySelectorAll(':scope > td').length >= 9 && C.clean(tr.querySelector('td:nth-child(2) a')?.textContent) ||
      tr.querySelector('td[colspan]') && /khong co du lieu|khong tim thay|no records/.test(C.fold(tr.textContent)));
    const settled = async () => {
      let previous = '', stable = 0;
      await waitFor(() => {
        if (!loaded()) { stable = 0; return false; }
        const signature = C.clean(document.querySelector('tbody')?.textContent);
        stable = signature === previous ? stable + 1 : 0; previous = signature;
        return stable >= 4;
      },valid,20000);
    };
    await settled();
    // Collecting the catalog leaves UTT on its last page. Every lookup must
    // start from page one, including a fresh scan started by the user there.
    const first = document.querySelector('.ui-paginator-first:not(.ui-state-disabled):not([disabled])');
    if (first) {
      const before = C.clean(document.querySelector('tbody')?.textContent);
      activate(first);
      await waitFor(()=>C.clean(document.querySelector('tbody')?.textContent)!==before,valid,15000);
      await settled();
    }
    const results = new Map(), visited = new Set();
    for (let page = 0; page < 100; page++) {
      if (!valid()) throw new Error('Đã dừng thao tác.');
      const rows = catalogRows();
      const signature = C.clean(document.querySelector('tbody')?.textContent);
      if (visited.has(signature)) throw new Error('Danh sách môn chưa chuyển trang đúng; chưa thể đọc đủ tất cả môn.');
      visited.add(signature);
      rows.forEach(r => {
        if (!wanted && results.has(C.fold(r.name))) throw new Error(`Có môn trùng tên trong danh sách: ${r.name}; chưa thể xác định đầy đủ môn.`);
        results.set(C.fold(r.name), {name:r.name,status:r.status});
      });
      if (wanted) {
        const matches = rows.filter(r => C.fold(r.name) === C.fold(wanted));
        if (matches.length > 1) throw new Error('Có hai môn trùng tên; hãy mở môn cần học thủ công.');
        if (matches.length === 1) { activate(matches[0].el); return true; }
      }
      const next = nextPage();
      if (!next) break;
      if (page === 99) throw new Error('Danh sách có quá nhiều trang; chưa đọc xong tất cả môn.');
      activate(next);
      await waitFor(() => C.clean(document.querySelector('tbody')?.textContent) !== signature, valid, 15000);
      await settled();
    }
    if (wanted) throw new Error(`Không còn tìm thấy môn đang học: ${wanted}.`);
    return [...results.values()];
  }
  function navigate(url, flow) { return chrome.runtime.sendMessage({type:'navigate', url, flow}); }
  function reload(flow) { return chrome.runtime.sendMessage({type:'reload', flow}); }
  function learningDialog() {
    for (const el of dialogs()) {
      if (!C.learningConfirm(el.textContent)) continue;
      const button = [...el.querySelectorAll('button, [role="button"], input[type="button"]')]
        .find(b => visible(b) && !b.disabled && C.confirmationButton(b.textContent || b.value));
      return { el, button };
    }
    return null;
  }
  window.UTTStudyAdapter = { course, current, video, links, attendanceEntries, content, open, progress, visible, dialogs, learningDialog, sleep, activate, catalogPage, discoveryPage, catalog, LIST_PATH, navigate, reload };
})();
