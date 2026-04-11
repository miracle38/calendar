// @ts-check
const { test, expect } = require('@playwright/test');

const URL = 'https://miracle38.github.io/calendar/';

// ============================================================
// 1. 페이지 로딩 / 초기 표시
// ============================================================
test.describe('1. 페이지 로딩 / 초기 표시', () => {

    test('1-1 페이지 초기 로딩', async ({ page }) => {
        await page.goto(URL);
        await expect(page.locator('#calendarDays')).toBeVisible();
    });

    test('1-2 타이틀 표시', async ({ page }) => {
        await page.goto(URL);
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        // 범위 보정
        const displayYear = year < 2026 ? 2026 : (year > 2030 ? 2030 : year);
        await expect(page.locator('#calTitle')).toContainText('품질관리팀');
        await expect(page.locator('#calTitle')).toContainText('일정표');
    });

    test('1-3 로고 표시', async ({ page }) => {
        await page.goto(URL);
        const logo = page.locator('#calTitle img');
        await expect(logo).toBeVisible();
        await expect(logo).toHaveAttribute('src', 'logo_v2.png');
    });

    test('1-4 요일 헤더', async ({ page }) => {
        await page.goto(URL);
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        for (const day of weekdays) {
            await expect(page.locator('.weekday-cell', { hasText: day })).toBeVisible();
        }
        // 일요일 빨간색 확인
        await expect(page.locator('.weekday-cell.sun')).toHaveCSS('color', 'rgb(231, 76, 60)');
        // 토요일 파란색 확인
        await expect(page.locator('.weekday-cell.sat')).toHaveCSS('color', 'rgb(52, 152, 219)');
    });

    test('1-5 오늘 날짜 강조', async ({ page }) => {
        await page.goto(URL);
        const todayCell = page.locator('.day.today');
        const count = await todayCell.count();
        if (count > 0) {
            await expect(todayCell.locator('.date-number')).toHaveCSS('color', 'rgb(255, 255, 255)');
        }
    });

    test('1-6 비로그인 상태 버튼', async ({ page }) => {
        await page.goto(URL);
        await page.waitForTimeout(2000); // Firebase 인증 확인 대기
        // 보이는 버튼 확인
        await expect(page.locator('button', { hasText: '◀ 이전' })).toBeVisible();
        await expect(page.locator('button', { hasText: '다음 ▶' })).toBeVisible();
        await expect(page.locator('.btn-today')).toBeVisible();
        await expect(page.locator('.btn-print')).toBeVisible();
        await expect(page.locator('#authBtn')).toContainText('로그인');
    });

    test('1-7 브라우저 탭 타이틀', async ({ page }) => {
        await page.goto(URL);
        await expect(page).toHaveTitle('지란지교소프트 품질관리팀 일정표');
    });

    test('1-8 파비콘', async ({ page }) => {
        await page.goto(URL);
        const favicon = page.locator('link[rel="icon"]');
        await expect(favicon).toHaveAttribute('href', /svg/);
    });
});

// ============================================================
// 2. 월 이동 / 네비게이션
// ============================================================
test.describe('2. 월 이동 / 네비게이션', () => {

    test('2-1 이전 월 이동', async ({ page }) => {
        await page.goto(URL);
        // 먼저 특정 월로 이동 (오늘 기준)
        const titleBefore = await page.locator('#calTitle').textContent();
        await page.click('button:has-text("◀ 이전")');
        const titleAfter = await page.locator('#calTitle').textContent();
        expect(titleAfter).not.toBe(titleBefore);
    });

    test('2-2 다음 월 이동', async ({ page }) => {
        await page.goto(URL);
        const titleBefore = await page.locator('#calTitle').textContent();
        await page.click('button:has-text("다음 ▶")');
        const titleAfter = await page.locator('#calTitle').textContent();
        expect(titleAfter).not.toBe(titleBefore);
    });

    test('2-3 최소 연도 제한 (2026년 1월)', async ({ page }) => {
        await page.goto(URL);
        // 2026년 1월까지 이동
        for (let i = 0; i < 200; i++) {
            await page.click('button:has-text("◀ 이전")');
        }
        await expect(page.locator('#calTitle')).toContainText('2026년 1월');
        // 한 번 더 이전 클릭
        await page.click('button:has-text("◀ 이전")');
        await expect(page.locator('#calTitle')).toContainText('2026년 1월');
    });

    test('2-4 연도 넘김 (12월→1월)', async ({ page }) => {
        await page.goto(URL);
        // 12월까지 이동
        for (let i = 0; i < 20; i++) {
            const title = await page.locator('#calTitle').textContent();
            if (title.includes('12월')) break;
            await page.click('button:has-text("다음 ▶")');
        }
        await expect(page.locator('#calTitle')).toContainText('12월');
        await page.click('button:has-text("다음 ▶")');
        await expect(page.locator('#calTitle')).toContainText('1월');
    });

    test('2-5 최대 연도 제한 (2040년 12월)', async ({ page }) => {
        await page.goto(URL);
        // 2040년 12월까지 이동
        for (let i = 0; i < 250; i++) {
            await page.click('button:has-text("다음 ▶")');
        }
        await expect(page.locator('#calTitle')).toContainText('2040년 12월');
        await page.click('button:has-text("다음 ▶")');
        await expect(page.locator('#calTitle')).toContainText('2040년 12월');
    });

    test('2-6 오늘 버튼', async ({ page }) => {
        await page.goto(URL);
        // 다른 월로 이동
        await page.click('button:has-text("◀ 이전")');
        await page.click('button:has-text("◀ 이전")');
        // 오늘 클릭
        await page.click('.btn-today');
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        if (year >= 2026 && year <= 2030) {
            await expect(page.locator('#calTitle')).toContainText(`${year}년 ${month}월`);
        }
    });

    test('2-8 월 이동 시 영문 서브타이틀 갱신', async ({ page }) => {
        await page.goto(URL);
        await page.click('button:has-text("다음 ▶")');
        const subtitle = await page.locator('#calSubtitle').textContent();
        expect(subtitle).toContain('Quality Management Team');
    });
});

// ============================================================
// 3. 공휴일 표시
// ============================================================
test.describe('3. 공휴일 표시', () => {

    test('3-1 공휴일 날짜 색상 (빨간색)', async ({ page }) => {
        await page.goto(URL);
        // 2026년 1월로 이동 (신정)
        for (let i = 0; i < 50; i++) {
            const title = await page.locator('#calTitle').textContent();
            if (title.includes('2026년 1월')) break;
            await page.click('button:has-text("◀ 이전")');
        }
        const holidayDay = page.locator('.day.holiday').first();
        await expect(holidayDay.locator('.date-number')).toHaveCSS('color', 'rgb(231, 76, 60)');
    });

    test('3-2 공휴일 이름 표시 (신정)', async ({ page }) => {
        await page.goto(URL);
        for (let i = 0; i < 50; i++) {
            const title = await page.locator('#calTitle').textContent();
            if (title.includes('2026년 1월')) break;
            await page.click('button:has-text("◀ 이전")');
        }
        await expect(page.locator('.holiday-name', { hasText: '신정' })).toBeVisible();
    });

    test('3-3 설날 연휴 (2026년 2월)', async ({ page }) => {
        await page.goto(URL);
        for (let i = 0; i < 50; i++) {
            const title = await page.locator('#calTitle').textContent();
            if (title.includes('2026년 2월')) break;
            await page.click('button:has-text("◀ 이전")');
        }
        if ((await page.locator('#calTitle').textContent()).includes('2026년 2월')) {
            await expect(page.locator('.holiday-name', { hasText: '설날' }).first()).toBeVisible();
        } else {
            // 2월이 범위를 벗어난 경우 다음으로 이동
            await page.click('button:has-text("다음 ▶")');
            await page.click('button:has-text("다음 ▶")');
        }
    });

    test('3-5 선거일 (2026년 6월)', async ({ page }) => {
        await page.goto(URL);
        // 2026년 6월로 이동
        for (let i = 0; i < 50; i++) {
            const title = await page.locator('#calTitle').textContent();
            if (title.includes('2026년 6월')) break;
            if (title.includes('2026년') && parseInt(title.match(/(\d+)월/)[1]) < 6) {
                await page.click('button:has-text("다음 ▶")');
            } else {
                await page.click('button:has-text("◀ 이전")');
            }
        }
        await expect(page.locator('.holiday-name', { hasText: '지방선거' })).toBeVisible();
    });

    test('3-6 근로자의날 (2026년 5월)', async ({ page }) => {
        await page.goto(URL);
        for (let i = 0; i < 50; i++) {
            const title = await page.locator('#calTitle').textContent();
            if (title.includes('2026년 5월')) break;
            if (title.includes('2026년') && parseInt(title.match(/(\d+)월/)?.[1] || '99') < 5) {
                await page.click('button:has-text("다음 ▶")');
            } else {
                await page.click('button:has-text("◀ 이전")');
            }
        }
        await expect(page.locator('.holiday-name', { hasText: '근로자의날' })).toBeVisible();
    });
});

// ============================================================
// 4. 로그인 / 인증 (비로그인 상태에서 가능한 항목)
// ============================================================
test.describe('4. 로그인 / 인증', () => {

    test('4-1 로그인 모달 열기', async ({ page }) => {
        await page.goto(URL);
        await page.waitForTimeout(2000);
        await page.click('#authBtn');
        await expect(page.locator('#loginOverlay')).toHaveClass(/active/);
        await expect(page.locator('#loginEmail')).toBeVisible();
        await expect(page.locator('#loginPassword')).toBeVisible();
    });

    test('4-4 빈 입력 로그인 시도', async ({ page }) => {
        await page.goto(URL);
        await page.waitForTimeout(2000);
        await page.click('#authBtn');
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('이메일과 비밀번호를 입력하세요');
            await dialog.accept();
        });
        await page.click('.btn-login');
        await page.waitForTimeout(500);
    });

    test('4-11 로그인 모달 취소', async ({ page }) => {
        await page.goto(URL);
        await page.waitForTimeout(2000);
        await page.click('#authBtn');
        await expect(page.locator('#loginOverlay')).toHaveClass(/active/);
        await page.click('.btn-cancel');
        await expect(page.locator('#loginOverlay')).not.toHaveClass(/active/);
    });

    test('4-12 Enter키 로그인', async ({ page }) => {
        await page.goto(URL);
        await page.waitForTimeout(2000);
        await page.click('#authBtn');
        page.on('dialog', async dialog => {
            await dialog.accept();
        });
        await page.fill('#loginEmail', 'test@test.com');
        await page.fill('#loginPassword', 'wrongpass');
        await page.press('#loginPassword', 'Enter');
        await page.waitForTimeout(1000);
    });
});

// ============================================================
// 11. 모달 동작
// ============================================================
test.describe('11. 모달 동작', () => {

    test('11-1 모달 열기', async ({ page }) => {
        await page.goto(URL);
        const dayCell = page.locator('.day:not(.empty)').first();
        await dayCell.click();
        await expect(page.locator('#modalOverlay')).toHaveClass(/active/);
    });

    test('11-2 모달 닫기 (X 버튼)', async ({ page }) => {
        await page.goto(URL);
        await page.locator('.day:not(.empty)').first().click();
        await expect(page.locator('#modalOverlay')).toHaveClass(/active/);
        await page.click('.modal-close');
        await expect(page.locator('#modalOverlay')).not.toHaveClass(/active/);
    });

    test('11-3 모달 닫기 (오버레이 클릭)', async ({ page }) => {
        await page.goto(URL);
        await page.locator('.day:not(.empty)').first().click();
        await expect(page.locator('#modalOverlay')).toHaveClass(/active/);
        // 오버레이의 왼쪽 상단(모달 바깥) 클릭
        await page.locator('#modalOverlay').click({ position: { x: 10, y: 10 } });
        await expect(page.locator('#modalOverlay')).not.toHaveClass(/active/);
    });

    test('11-4 모달 닫기 (ESC)', async ({ page }) => {
        await page.goto(URL);
        await page.locator('.day:not(.empty)').first().click();
        await expect(page.locator('#modalOverlay')).toHaveClass(/active/);
        await page.keyboard.press('Escape');
        await expect(page.locator('#modalOverlay')).not.toHaveClass(/active/);
    });

    test('11-5 빈 셀 클릭 시 모달 안 열림', async ({ page }) => {
        await page.goto(URL);
        const emptyCell = page.locator('.day.empty').first();
        const count = await emptyCell.count();
        if (count > 0) {
            await emptyCell.click();
            await expect(page.locator('#modalOverlay')).not.toHaveClass(/active/);
        }
    });

    test('11-6 일정 없는 날짜 모달', async ({ page }) => {
        await page.goto(URL);
        await page.locator('.day:not(.empty)').first().click();
        await expect(page.locator('#scheduleList')).toContainText('등록된 제품 일정이 없습니다');
        await expect(page.locator('#leaveList')).toContainText('등록된 연차가 없습니다');
    });

    test('11-7 모달 타이틀에 날짜+요일 표시', async ({ page }) => {
        await page.goto(URL);
        await page.locator('.day:not(.empty)').first().click();
        const title = await page.locator('#modalTitle').textContent();
        expect(title).toMatch(/\d+월 \d+일 \([일월화수목금토]\)/);
    });
});

// ============================================================
// 16. 반응형 / UI
// ============================================================
test.describe('16. 반응형 / UI', () => {

    test('16-1 데스크톱 레이아웃', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto(URL);
        const calendar = page.locator('.calendar');
        await expect(calendar).toBeVisible();
        const box = await calendar.boundingBox();
        expect(box.width).toBeLessThanOrEqual(1600 + 50); // max-width: 1600px + padding
    });

    test('16-4 주말 셀 크기', async ({ page }) => {
        await page.goto(URL);
        const sundayCell = page.locator('.day.sunday').first();
        const weekdayCell = page.locator('.day:not(.sunday):not(.saturday):not(.empty)').first();
        const sundayCount = await sundayCell.count();
        const weekdayCount = await weekdayCell.count();
        if (sundayCount > 0 && weekdayCount > 0) {
            const sunBox = await sundayCell.boundingBox();
            const weekBox = await weekdayCell.boundingBox();
            expect(sunBox.width).toBeLessThan(weekBox.width);
        }
    });

    test('16-5 호버 효과 (CSS 규칙 존재 확인)', async ({ page }) => {
        await page.goto(URL);
        // CSS에 hover 규칙이 정의되어 있는지 확인
        const hasHoverRule = await page.evaluate(() => {
            for (const sheet of document.styleSheets) {
                for (const rule of sheet.cssRules) {
                    if (rule.selectorText && rule.selectorText.includes('.day:hover:not(.empty)')) {
                        return true;
                    }
                }
            }
            return false;
        });
        expect(hasHoverRule).toBe(true);
    });
});

// ============================================================
// 17. XSS / 보안 (비로그인이라 입력은 불가하지만, escHtml 함수 검증)
// ============================================================
test.describe('17. XSS / 보안', () => {

    test('17-3 escHtml 함수 검증', async ({ page }) => {
        await page.goto(URL);
        const result = await page.evaluate(() => {
            // escHtml 함수가 전역에 있으므로 직접 호출
            return escHtml('<script>alert(1)</script> & "test" \'val\'');
        });
        expect(result).toBe('&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;test&quot; &#39;val&#39;');
    });
});
