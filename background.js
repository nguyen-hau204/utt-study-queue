'use strict';
let operations = Promise.resolve();
function validFlow(flow) {
  return flow && typeof flow.token === 'string' && flow.token.length <= 100 &&
    ['catalog','enter','scan','return','review','play','resume'].includes(flow.phase) &&
    ['scan','play','single'].includes(flow.kind) && Array.isArray(flow.courses) && flow.courses.length <= 100 &&
    JSON.stringify(flow).length < 500000;
}
function destination(value) {
  try {
    const url = new URL(value, 'https://hoctructuyen.utt.edu.vn');
    if (url.origin !== 'https://hoctructuyen.utt.edu.vn' || url.hash || url.username || url.password) return null;
    if (url.pathname === '/danh-sach-lop-dang-hoc' && url.search === '?statusId=0' ||
        /^\/learn\/lop-hoc\/chi-tiet\/[a-zA-Z0-9-]+\/?$/.test(url.pathname) && !url.search) return url.href;
  } catch { /* Reject malformed destinations. */ }
  return null;
}
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (!sender.tab || !sender.url?.startsWith('https://hoctructuyen.utt.edu.vn/')) return false;
  if (message.type === 'notice') {
    chrome.notifications.create('utt-study-notice', { type: 'basic', iconUrl: 'icon.png',
      title: 'Danh sách học UTT', message: message.kind === 'done' ? 'Đã xử lý xong danh sách video. Mở danh sách để xem bài đã đạt và buổi Vclass được bỏ qua.' : 'Trang học đang cần bạn kiểm tra hoặc xác nhận.', priority: 1 }).catch(() => {});
    respond({ ok: true }); return false;
  }
  if (['flow-get','flow-put','flow-clear','navigate','reload'].includes(message.type)) {
    const key = 'flow:' + sender.tab.id;
    operations = operations.catch(() => {}).then(async () => {
      if (message.type === 'flow-get') {
        const flow = (await chrome.storage.session.get(key))[key];
        respond({ok:true,flow:validFlow(flow) && flow.expires > Date.now() ? flow : null}); return;
      }
      if (message.type === 'flow-clear') {
        await chrome.storage.session.remove(key);
        const owner = (await chrome.storage.session.get('journey-owner'))['journey-owner'];
        if (owner?.tab === sender.tab.id) await chrome.storage.session.remove('journey-owner');
        respond({ok:true}); return;
      }
      const url = message.type === 'navigate' ? destination(message.url) : null;
      if (!validFlow(message.flow) || message.type === 'navigate' && !url ||
          message.type === 'reload' && !destination(sender.url)) { respond({ok:false}); return; }
      const active = message.flow.phase !== 'review';
      const owner = (await chrome.storage.session.get('journey-owner'))['journey-owner'];
      if (active && owner && owner.tab !== sender.tab.id && owner.expires > Date.now()) { respond({ok:false}); return; }
      if (active && message.flow.kind === 'scan') {
        const sessions = await chrome.storage.session.get(null);
        if (Object.entries(sessions).some(([key,value])=>key.startsWith('owner:') && value?.tab !== sender.tab.id && value?.expires > Date.now())) {
          respond({ok:false}); return;
        }
      }
      const values = {[key]:{...message.flow,expires:Date.now()+12*3600000}};
      if (active) values['journey-owner']={tab:sender.tab.id,token:message.flow.token,expires:Date.now()+120000};
      await chrome.storage.session.set(values);
      if (!active && owner?.tab === sender.tab.id) await chrome.storage.session.remove('journey-owner');
      respond({ok:true});
      // Persist the continuation before unloading the sender document.
      if (message.type === 'navigate') await chrome.tabs.update(sender.tab.id,{url});
      if (message.type === 'reload') await chrome.tabs.reload(sender.tab.id);
    }).catch(() => respond({ok:false}));
    return true;
  }
  if (!['lease', 'release'].includes(message.type) || !/^[a-zA-Z0-9-]{1,100}$/.test(message.course || '') || typeof message.run !== 'string' || message.run.length > 100) return false;
  operations = operations.catch(() => {}).then(async () => {
    const storageKey = 'owner:' + message.course;
    const owner = (await chrome.storage.session.get(storageKey))[storageKey];
    if (message.type === 'release') {
      if (owner?.tab === sender.tab.id && owner.run === message.run) await chrome.storage.session.remove(storageKey);
      respond({ ok: true }); return;
    }
    if (owner && owner.tab !== sender.tab.id && owner.expires > Date.now()) { respond({ ok: false }); return; }
    if (owner && owner.run !== message.run && !message.acquire && owner.expires > Date.now()) { respond({ ok: false }); return; }
    await chrome.storage.session.set({ [storageKey]: { tab: sender.tab.id, run:message.run, expires: Date.now() + 35000 } });
    respond({ ok: true });
  }).catch(() => respond({ ok: false }));
  return true;
});
chrome.action.onClicked.addListener(tab => {
  if (tab.url?.startsWith('https://hoctructuyen.utt.edu.vn/')) chrome.tabs.sendMessage(tab.id, { type: 'toggle' }).catch(() => {});
});
chrome.tabs.onRemoved.addListener(tabId => {
  operations = operations.catch(() => {}).then(async () => {
    const owners = await chrome.storage.session.get(null);
    const keys = Object.keys(owners).filter(k => k.startsWith('owner:') && owners[k]?.tab === tabId);
    if (keys.length) await chrome.storage.session.remove(keys);
    await chrome.storage.session.remove('flow:' + tabId);
    if (owners['journey-owner']?.tab === tabId) await chrome.storage.session.remove('journey-owner');
  });
});
