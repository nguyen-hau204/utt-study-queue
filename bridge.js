// Page-world interop for course controls and study-specific native confirms.
// No progress or network hooks.
(() => {
  'use strict';
  if (window.__uttStudyConfirmInstalled) return;
  window.__uttStudyConfirmInstalled = true;
  document.addEventListener('utt-study-activate', event => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const courseControl = /^\/learn\/lop-hoc\/chi-tiet\/[a-zA-Z0-9-]+\/?$/.test(location.pathname) &&
      target.matches('#tab1, #tab2, #tnContentList a[href], #tnContentList .__lesson-name-child .fa-chevron-down');
    const listControl = location.pathname === '/danh-sach-lop-dang-hoc' &&
      (target.matches('tbody tr td:last-child a, tbody tr td:last-child button') && /vao hoc/.test(window.UTTStudyCore.fold(target.textContent)) ||
        target.matches('.ui-paginator-next:not(.ui-state-disabled), .ui-paginator-first:not(.ui-state-disabled)'));
    if (!courseControl && !listControl) return;
    event.preventDefault(); // Acknowledge to the isolated content script.
    const preventNavigation = click => click.preventDefault();
    target.addEventListener('click', preventNavigation, {capture:true, passive:false});
    try { target.click(); }
    finally { target.removeEventListener('click', preventNavigation, true); }
  });
  const original = window.confirm.bind(window);
  let enabled = false;
  document.addEventListener('utt-study-confirm-setting', event => {
    enabled = event.detail === true;
  });
  window.confirm = function (message) {
    const learning = window.UTTStudyCore.learningConfirm(message);
    if (learning) document.dispatchEvent(new CustomEvent('utt-study-native-confirm', { detail: { phase: 'open', auto: enabled } }));
    const accepted = learning && enabled ? true : original(message);
    if (learning) document.dispatchEvent(new CustomEvent('utt-study-native-confirm', { detail: { phase: 'closed', auto: enabled, accepted } }));
    return accepted;
  };
})();
