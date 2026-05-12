// 공용 상수 + 함수 (background.js / popup.js 모두에서 사용)

const FIREBASE_API_KEY = 'AIzaSyDI5VxCwhP6RVtFcdvUBJnfpMvRiP7A0us';
const FIREBASE_DB_URL = 'https://calendar-6df01-default-rtdb.firebaseio.com';
const ALLOWED_EMAILS = ['miracle0938@gmail.com', 'miracle38@jiran.com'];

const GROUPWARE_ORG_ID = 165;          // 품질관리팀
const SYNC_THROTTLE_MS = 60 * 60 * 1000; // 1시간

function currentYear() {
    return new Date().getFullYear();
}

function annualSummaryUrl(year, orgId) {
    return 'https://jiran.api.groupware.pro/v1/hr/mss/employeeinfo/annualsummary'
        + '?currentYear=' + year
        + '&organizationId=' + orgId
        + '&pageNumber=1&limitNumber=100&searchType=ANNUAL';
}

// ===== Firebase Auth (REST) =====

async function signInWithPassword(email, password) {
    const res = await fetch(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + FIREBASE_API_KEY,
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, returnSecureToken: true }) }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data && data.error && data.error.message || 'Login failed');
    if (ALLOWED_EMAILS.indexOf(data.email) === -1) {
        throw new Error('허용되지 않은 계정입니다: ' + data.email);
    }
    return {
        email: data.email,
        idToken: data.idToken,
        refreshToken: data.refreshToken,
        expiresAt: Date.now() + (Number(data.expiresIn) - 30) * 1000, // -30s 여유
    };
}

async function refreshIdToken(refreshToken) {
    const res = await fetch(
        'https://securetoken.googleapis.com/v1/token?key=' + FIREBASE_API_KEY,
        { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(refreshToken) }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data && data.error && data.error.message || 'Refresh failed');
    return {
        idToken: data.id_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (Number(data.expires_in) - 30) * 1000,
    };
}

async function getValidAuth() {
    const stored = await chrome.storage.local.get(['auth']);
    if (!stored.auth) return null;
    if (stored.auth.expiresAt > Date.now()) return stored.auth;
    try {
        const refreshed = await refreshIdToken(stored.auth.refreshToken);
        const merged = { ...stored.auth, ...refreshed };
        await chrome.storage.local.set({ auth: merged });
        return merged;
    } catch (e) {
        await chrome.storage.local.remove(['auth']);
        return null;
    }
}

// ===== 그룹웨어 API → 캘린더 Firebase 푸시 =====

async function fetchGroupwarePayload() {
    const url = annualSummaryUrl(currentYear(), GROUPWARE_ORG_ID);
    const res = await fetch(url, { method: 'GET', credentials: 'include',
                                    headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('그룹웨어 API HTTP ' + res.status);
    const data = await res.json();
    if (!data || !data.success || !Array.isArray(data.payload)) {
        throw new Error('그룹웨어 응답 비정상');
    }
    return data.payload;
}

function transformPayload(payload, year) {
    const now = Date.now();
    const byName = {};
    for (const emp of payload) {
        const name = (emp.employeeName || '').trim();
        if (!name) continue;
        byName[name] = {
            employeeId: String(emp.employeeId || ''),
            name,
            yearNum: Number(emp.yearNum) || 0,
            totalUsedNum: Number(emp.totalUsedNum) || 0,
            remainNum: Number(emp.remainNum) || 0,
            organizationName: emp.organizationName || '',
            dutyName: emp.dutyName || '',
            hireYmd: emp.hireYmd || '',
            standardYear: emp.standardYear || String(year),
            startYmd: emp.startYmd || '',
            endYmd: emp.endYmd || '',
            updatedAt: now,
        };
    }
    return byName;
}

async function writeFirebase(year, byName, idToken) {
    const yearUrl = FIREBASE_DB_URL + '/annual_leave/' + year + '.json?auth=' + encodeURIComponent(idToken);
    const metaUrl = FIREBASE_DB_URL + '/annual_leave/_meta.json?auth=' + encodeURIComponent(idToken);

    const yearRes = await fetch(yearUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(byName) });
    if (!yearRes.ok) {
        const t = await yearRes.text();
        throw new Error('Firebase write failed: ' + yearRes.status + ' ' + t);
    }
    const meta = {
        lastSyncAt: Date.now(),
        lastSyncYear: String(year),
        lastSyncCount: Object.keys(byName).length,
        lastSyncSource: 'extension',
    };
    await fetch(metaUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(meta) });
}

async function runSync({ force = false } = {}) {
    const auth = await getValidAuth();
    if (!auth) throw new Error('로그인 필요 — 확장 팝업에서 로그인하세요');

    if (!force) {
        const { lastSyncAt = 0 } = await chrome.storage.local.get(['lastSyncAt']);
        if (Date.now() - lastSyncAt < SYNC_THROTTLE_MS) {
            return { skipped: true, reason: 'throttled', nextEligibleAt: lastSyncAt + SYNC_THROTTLE_MS };
        }
    }

    const payload = await fetchGroupwarePayload();
    const year = currentYear();
    const byName = transformPayload(payload, year);
    await writeFirebase(year, byName, auth.idToken);

    const lastSyncAt = Date.now();
    await chrome.storage.local.set({ lastSyncAt, lastSyncCount: Object.keys(byName).length });
    return { skipped: false, count: Object.keys(byName).length, year };
}
