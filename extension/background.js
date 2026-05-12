// Service Worker — 그룹웨어 페이지 방문 감지 + 알람 주기 동기화
importScripts('common.js');

const ALARM_NAME = 'leave-sync-tick';
const TAB_THROTTLE_MS = 5 * 60 * 1000; // 같은 탭이 너무 자주 트리거되는 것 방지

// 설치/시작 시 알람 등록 (1시간마다)
chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create(ALARM_NAME, { delayInMinutes: 1, periodInMinutes: 60 });
});

chrome.runtime.onStartup.addListener(() => {
    chrome.alarms.get(ALARM_NAME, (a) => {
        if (!a) chrome.alarms.create(ALARM_NAME, { delayInMinutes: 1, periodInMinutes: 60 });
    });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name !== ALARM_NAME) return;
    await tryRunSync('alarm');
});

// 그룹웨어 페이지 방문/로드 감지 → 동기화 시도 (스로틀 안에서)
let lastTabTriggerAt = 0;
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
    if (info.status !== 'complete') return;
    if (!tab || !tab.url) return;
    if (!/^https:\/\/jiran\.groupware\.pro\//.test(tab.url)) return;
    if (Date.now() - lastTabTriggerAt < TAB_THROTTLE_MS) return;
    lastTabTriggerAt = Date.now();
    await tryRunSync('tab:' + new URL(tab.url).pathname);
});

async function tryRunSync(trigger) {
    try {
        const r = await runSync();
        if (r.skipped) {
            console.log('[leave-sync] skipped (' + trigger + '): ' + r.reason);
            return;
        }
        console.log('[leave-sync] ' + trigger + ' → ' + r.count + '명 동기화');
        notify('연차 동기화 완료', r.count + '명 (' + r.year + '년) — ' + new Date().toLocaleTimeString('ko-KR'));
    } catch (e) {
        const msg = String(e && e.message || e);
        console.warn('[leave-sync] failed (' + trigger + '): ' + msg);
        if (/로그인 필요/.test(msg) || /TOKEN/.test(msg)) {
            notify('연차 동기화 실패', '확장 팝업에서 로그인이 필요합니다');
        } else if (!/그룹웨어 API HTTP 4/.test(msg)) {
            // 401/403 은 SSO 만료라 사용자가 알 필요 없음 (그룹웨어 페이지 다시 보면 자동 재시도)
            notify('연차 동기화 실패', msg.substring(0, 120));
        }
    }
}

function notify(title, message) {
    try {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title,
            message,
            priority: 0,
        });
    } catch (_) {}
}

// 팝업 → 백그라운드 메시지: 수동 동기화 요청
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg && msg.type === 'sync-now') {
        runSync({ force: true })
            .then(r => sendResponse({ ok: true, result: r }))
            .catch(e => sendResponse({ ok: false, error: String(e && e.message || e) }));
        return true; // async
    }
});
