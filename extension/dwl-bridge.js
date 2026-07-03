// 일일 진행업무 앱 ↔ 확장 브리지.
// 앱 페이지가 window.postMessage 로 출퇴근을 요청하면, 백그라운드가
// 그룹웨어 근태 API를 호출(캡처된 SSO 토큰 사용)해 결과를 돌려준다.
(function () {
  window.addEventListener('message', function (e) {
    if (e.source !== window) return;
    const msg = e.data;
    if (!msg || msg.__dwl !== 'req' || msg.type !== 'get-worktimes') return;

    chrome.runtime.sendMessage(
      { type: 'dwl-get-worktimes', startYmd: msg.startYmd, endYmd: msg.endYmd },
      function (resp) {
        const err = chrome.runtime.lastError;
        window.postMessage(
          {
            __dwl: 'res',
            reqId: msg.reqId,
            ok: !err && !!(resp && resp.ok),
            data: resp && resp.data,
            error: err ? err.message : resp && resp.error,
          },
          '*'
        );
      }
    );
  });

  // 앱이 확장 설치 여부를 감지할 수 있도록 준비 신호를 보낸다.
  window.postMessage({ __dwl: 'ready' }, '*');
})();
