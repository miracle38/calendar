(async function() {
    const $ = (id) => document.getElementById(id);
    const loggedOut = $('loggedOut');
    const loggedIn = $('loggedIn');
    const bootStatus = $('bootStatus');
    const syncStatus = $('syncStatus');

    function show(state) {
        bootStatus.style.display = 'none';
        loggedOut.style.display = state === 'out' ? 'block' : 'none';
        loggedIn.style.display = state === 'in' ? 'block' : 'none';
    }

    function setStatus(el, text, kind) {
        el.textContent = text;
        el.className = 'status ' + (kind || 'info');
    }

    function fmtAgo(ts) {
        if (!ts) return '정보 없음';
        const diff = Date.now() - ts;
        const min = Math.floor(diff / 60000);
        const hr = Math.floor(diff / 3600000);
        const day = Math.floor(diff / 86400000);
        let ago;
        if (diff < 60000) ago = '방금 전';
        else if (min < 60) ago = min + '분 전';
        else if (hr < 24) ago = hr + '시간 전';
        else ago = day + '일 전';
        const d = new Date(ts);
        const stamp = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0')
                    + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
        return ago + ' (' + stamp + ')';
    }

    async function refreshStatusLine() {
        const { lastSyncAt, lastSyncCount } = await chrome.storage.local.get(['lastSyncAt', 'lastSyncCount']);
        if (!lastSyncAt) {
            setStatus(syncStatus, '최근 동기화: 정보 없음', 'info');
        } else {
            setStatus(syncStatus, '최근 동기화: ' + fmtAgo(lastSyncAt) + (lastSyncCount ? ' / ' + lastSyncCount + '명' : ''), 'success');
        }
    }

    const auth = await getValidAuth();
    if (auth) {
        $('userEmail').textContent = auth.email || '(unknown)';
        show('in');
        await refreshStatusLine();
    } else {
        show('out');
    }

    $('loginBtn').addEventListener('click', async () => {
        const btn = $('loginBtn');
        btn.disabled = true; btn.textContent = '로그인 중...';
        try {
            const email = $('email').value.trim();
            const password = $('password').value;
            if (!email || !password) throw new Error('이메일/비밀번호를 입력하세요');
            const result = await signInWithPassword(email, password);
            await chrome.storage.local.set({ auth: result });
            $('userEmail').textContent = result.email;
            show('in');
            await refreshStatusLine();
        } catch (e) {
            const tmp = document.createElement('div');
            tmp.className = 'status error';
            tmp.textContent = '로그인 실패: ' + (e && e.message || e);
            loggedOut.appendChild(tmp);
            setTimeout(() => tmp.remove(), 4000);
        } finally {
            btn.disabled = false; btn.textContent = '로그인';
        }
    });

    $('logoutBtn').addEventListener('click', async () => {
        await chrome.storage.local.remove(['auth', 'lastSyncAt', 'lastSyncCount']);
        show('out');
    });

    $('syncBtn').addEventListener('click', async () => {
        const btn = $('syncBtn');
        btn.disabled = true; btn.textContent = '동기화 중...';
        setStatus(syncStatus, '동기화 진행 중...', 'info');
        try {
            const resp = await chrome.runtime.sendMessage({ type: 'sync-now' });
            if (resp && resp.ok) {
                const r = resp.result || {};
                if (r.skipped) {
                    setStatus(syncStatus, '스로틀로 건너뜀 (' + r.reason + ')', 'info');
                } else {
                    setStatus(syncStatus, '동기화 완료 / ' + r.count + '명', 'success');
                }
            } else {
                setStatus(syncStatus, '실패: ' + ((resp && resp.error) || '응답 없음'), 'error');
            }
            await refreshStatusLine();
        } catch (e) {
            setStatus(syncStatus, '실패: ' + (e && e.message || e), 'error');
        } finally {
            btn.disabled = false; btn.textContent = '지금 동기화';
        }
    });
})();
