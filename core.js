(function (root) {
  'use strict';
  const clean = value => String(value ?? '').replace(/\u00a0/g, ' ').replace(/\*/g, '').replace(/[\uE000-\uF8FF]/g, '').replace(/\s+/g, ' ').trim();
  const fold = value => clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  const key = (name, occurrence = 0) => `${fold(name)}::${occurrence}`;
  const number = value => {
    const s = clean(value).replace(',', '.');
    return /^\d+(\.\d+)?$/.test(s) ? Number(s) : null;
  };
  const minutesRequired = condition => {
    const match = fold(condition).match(/(?:toi thieu|it nhat)\s*([\d.,]+)\s*\(?phut/);
    return match ? number(match[1]) : null;
  };
  const isVideo = (name, condition = '') => {
    const n = fold(name);
    if (/kiem tra|bai thi|trac nghiem|diem danh|zalo|huongdan|huong dan/.test(n)) return false;
    if (/vclass/.test(n) && !/ghi hinh|video/.test(n)) return false;
    return /video|ghi hinh/.test(n) || minutesRequired(condition) !== null;
  };
  function parseRows(rows) {
    const occurrences = new Map();
    let group = '';
    return rows.flatMap(cells => {
      if (cells.length < 7) return [];
      const [name, condition, , , seen, , status] = cells.map(clean);
      if (!name) return [];
      if (!condition && !status) { group = name; return []; }
      // Count every leaf, so duplicate labels align with the content tree.
      const n = fold(name), occurrence = occurrences.get(n) || 0;
      occurrences.set(n, occurrence + 1);
      if (!isVideo(name, condition)) return [];
      const s = fold(status);
      return [{ id: key(name, occurrence), name, occurrence, group, required: minutesRequired(condition),
        credited: number(seen), complete: /da hoan thanh/.test(s), status, knownStatus: /(?:da|chua) hoan thanh/.test(s) }];
    });
  }
  function activeSeconds(previous, sample) {
    if (!previous || previous.id !== sample.id || previous.source !== sample.source ||
        previous.paused || sample.paused || previous.seeking || sample.seeking ||
        sample.readyState < 3 || sample.blocked || previous.blocked) return 0;
    const wall = (sample.now - previous.now) / 1000;
    const moved = sample.time - previous.time;
    if (wall <= 0 || wall > 6 || moved <= 0 || moved > wall * Math.max(1, sample.rate) + 1.5) return 0;
    return Math.min(wall, moved / Math.max(1, sample.rate));
  }
  function remaining(record) {
    if (record.complete) return 0;
    return record.required === null || record.credited === null ? null : Math.max(0, record.required - record.credited);
  }
  const isVclassRecording = name => /vclass/.test(fold(name)) && /ghi hinh|video/.test(fold(name));
  function sessionParts(name) {
    const n = fold(name);
    return { week: n.match(/tuan\s*(\d+)/)?.[1], date: n.match(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/)?.[0] };
  }
  function attendanceSkips(records, entries) {
    const byId = new Map(entries.map(e => [e.id, e]));
    const attendance = entries.filter(e => /diem danh/.test(fold(e.name)));
    return records.map(record => {
      const item = byId.get(record.id), parts = sessionParts(record.name);
      // Use the nearest lesson group, not a parent containing multiple sessions.
      // Pending attendance also participates in matching to reject ambiguity.
      const matches = isVclassRecording(record.name) && item?.group != null ? attendance.filter(e => {
        if (e.group !== item.group) return false;
        const other = sessionParts(e.name);
        return !(parts.week && other.week && parts.week !== other.week) &&
          !(parts.date && other.date && parts.date !== other.date);
      }) : [];
      const confirmed = matches.length === 1 && matches[0].complete ? matches[0] : null;
      return { ...record, skipped: !!confirmed, attendance: confirmed?.name || null };
    });
  }
  function vietnamDate(text) {
    const m = clean(text).match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
    if (!m) return null;
    const day = Number(m[1]), month = Number(m[2]), year = Number(m[3]);
    const utc = new Date(Date.UTC(year, month - 1, day));
    if (utc.getUTCDate() !== day || utc.getUTCMonth() !== month - 1) return null;
    return Date.UTC(year, month - 1, day) - 7 * 3600000;
  }
  function availability(records, entries, now = Date.now()) {
    const byId = new Map(entries.map(e => [e.id, e]));
    return records.map(r => {
      const date = !r.complete && !r.skipped && isVclassRecording(r.name) ? vietnamDate(r.name) ?? vietnamDate(byId.get(r.id)?.session) ?? vietnamDate(r.group) : null;
      return { ...r, deferredUntil: date !== null && date > now ? date : null };
    });
  }
  const needsPlayback = record => !record.complete && !record.skipped && !record.deferredUntil;
  const progressChanged = (before, after) => !!after?.complete || after?.credited !== null &&
    after?.credited !== undefined && (before?.credited == null || after.credited > before.credited);
  function courseSummary(records) {
    const pending = records.filter(needsPlayback);
    const known = pending.map(remaining).filter(n => n !== null);
    return { pending:pending.length, deferred:records.filter(r => !r.complete && !r.skipped && r.deferredUntil).length,
      skipped:records.filter(r => r.skipped).length, complete:records.filter(r => r.complete).length,
      minutes:known.reduce((a,b) => a+b,0), unknown:pending.filter(r => remaining(r) === null).length };
  }
  function discoveryProgress(flow) {
    const courses = flow?.courses || [];
    const ready = courses.filter(c => c.scanState === 'ready' && Array.isArray(c.videos)).length;
    const failed = courses.filter(c => c.scanState === 'error').length;
    const complete = flow?.catalogComplete === true && !flow.scanCancelled && ready === courses.length && !failed;
    const percent = complete ? 100 : courses.length ? Math.min(99, Math.floor(ready / courses.length * 100)) : 0;
    return {percent,ready,total:courses.length,failed,complete,
      videos:courses.reduce((n,c)=>n+(Array.isArray(c.videos)?c.videos.length:0),0)};
  }
  function isStudyCourse(name,status) {
    const n = fold(name);
    if (/^huong dan hoc tap tren he thong e\s*-?\s*learning(?:\s|_|$)/.test(n)) return false;
    return /^(dang hoc|khong du dieu kien thi)$/.test(fold(status));
  }
  function canStartCourses(flow) {
    if (!flow?.catalogComplete || flow.scanCancelled || !flow.courses?.every(c=>['ready','error'].includes(c.scanState))) return false;
    return flow.courses.some(c=>c.scanState==='ready' && c.selected && c.pending>0 &&
      Array.isArray(c.videos) && c.videos.length && (!c.videoIds || c.videoIds.length));
  }
  function learningConfirm(text) {
    const t = fold(text);
    if (/captcha|ma xac|kiem tra|bai thi|trac nghiem|dieu khoan|cam ket|thanh toan|mat khau|xoa|nop bai/.test(t)) return false;
    return /hoc tap|tiep tuc hoc|dang hoc|xem video|xem bai giang/.test(t) &&
      /xac nhan|tiep tuc|ban co|ban van|dong y/.test(t);
  }
  function confirmationButton(text) {
    return /^(xac nhan|dong y|co|ok|tiep tuc|tiep tuc hoc|toi dang hoc|toi van dang hoc)$/.test(fold(text));
  }
  const next = (records, selected, attempted = new Set()) => records.find(r => selected.has(r.id) && needsPlayback(r) && !attempted.has(r.id));
  const api = { clean, fold, key, number, minutesRequired, isVideo, parseRows, activeSeconds, remaining, isVclassRecording, attendanceSkips, vietnamDate, availability, needsPlayback, progressChanged, courseSummary, discoveryProgress, isStudyCourse, canStartCourses, learningConfirm, confirmationButton, next };
  root.UTTStudyCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
