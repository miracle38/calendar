# Changelog

이 프로젝트의 모든 주요 변경사항을 이 파일에 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)을 따르며,
[유의적 버전(SemVer)](https://semver.org/lang/ko/)을 사용합니다.

- **MAJOR**: 기존 사용자 데이터/사용 흐름과 호환되지 않는 변경
- **MINOR**: 하위 호환되는 기능 추가
- **PATCH**: 하위 호환되는 버그 수정

## [Unreleased]

## [1.2.0] - 2026-05-12

### Added
- **일정에 URL 첨부** — 일정 등록/편집 모달에 URL 입력란 추가. `http(s)://` 미입력 시 자동으로 `https://` 부여, `javascript:`/`data:`/`vbscript:`/`file:` 스킴은 보안상 거부
- **새 탭 열기 아이콘** — 캘린더 타일의 일정 위에 마우스 오버 시 우상단에 🔗 아이콘 표시 → 클릭하면 새 탭(`target="_blank" rel="noopener noreferrer"`)으로 이동. **로그인 사용자에게만 노출**
- 모달 일정 리스트에도 동일한 🔗 아이콘 — 일정 텍스트 옆에 한 번 클릭으로 새 탭 이동

## [1.1.0] - 2026-05-12

### Added
- **Chrome 확장 프로그램** (`extension/`) — 그룹웨어 페이지 방문 시 잔여 연차를 자동으로 Firebase 에 동기화. PC가 꺼져 있어도 회사에서 그룹웨어 보다가 자연스럽게 갱신됨
- 확장 팝업에서 Firebase 이메일/비밀번호로 한 번 로그인 → 토큰 자동 갱신 (비밀번호 저장 안 함)
- 트리거: 그룹웨어 페이지 로드 이벤트 + 1시간 알람. 스로틀 1시간으로 API 부하 방지. 팝업의 "지금 동기화" 버튼은 스로틀 무시
- `/annual_leave/_meta.lastSyncSource` 필드 — 어느 경로(`"extension"`/스크래퍼)에서 마지막으로 갱신됐는지 식별

### Changed
- Firebase 규칙 `annual_leave.write` 를 `false` → 본인 이메일 인증 사용자에게 허용으로 변경 — Chrome 확장이 사용자 토큰으로 직접 쓸 수 있도록. 기존 스크래퍼(Admin SDK)는 영향 없음

## [1.0.9] - 2026-05-12

### Fixed
- 월간 연차 현황 패널 진입 시 연간 잔여/사용/총 수치가 **잠시 비었다가 나타나던 깜빡임** 문제 — Firebase 응답을 기다리지 않고 localStorage 캐시에서 즉시 표시 (`events`, 메모와 동일 패턴). `calendar:annualLeave:{year}`, `calendar:annualLeaveMeta` 키로 캐시. 로그아웃 시 캐시도 정리

## [1.0.8] - 2026-05-12

### Added
- 월간 연차 현황 패널에 **연간 잔여 연차** 표시 — 각 팀원 옆에 잔여/사용/총 부여 일수를 한 줄 프로그레스 바로 시각화. 잔여 0일은 빨강, 잔여 20% 이하는 주황으로 강조
- 패널 하단에 마지막 동기화 시각 표시 (`🔄 연차 동기화: 2시간 전 ...`). 7일 이상 경과 시 빨간색 경고
- Node.js 스크래퍼 (`scripts/sync-annual-leave.js`) — Playwright 영구 프로필(SSO 대응)로 `jiran.groupware.pro` 접속 → 첫 실행 시 본인이 직접 SSO 로그인 → 쿠키 저장 → 이후 `annualsummary` API 호출 → Firebase Realtime DB `/annual_leave/{year}/{name}` 에 저장. 비밀번호 저장 없이 동작. 실행: `npm run sync` (첫 로그인/재로그인: `npm run sync:debug`)
- Firebase 룰 `annual_leave` 경로 추가 — 로그인 사용자만 읽기, 쓰기는 Admin SDK(스크래퍼)에서만 가능

## [1.0.7] - 2026-05-06

### Fixed
- 페이지 진입 시 캘린더가 항상 4월로 표시되던 문제 — 초기값이 `2026, 4`로 하드코딩되어 있던 것을 `new Date()` 기반으로 변경. 이제 접속 시 오늘이 포함된 월(2026~2030 범위 내)이 기본 표시됨

## [1.0.6] - 2026-04-28

### Fixed
- 페이지 새로고침 시 캘린더 타일의 메모 📝 아이콘이 늦게 표시되던 문제 — Firebase Auth 비동기 로딩 중에 `currentUser`가 잠깐 null이라 도트 조건이 false였고, 동시에 노트 listener의 가드가 `dayNotes`를 빈 객체로 덮어쓰던 동작 수정. 이제 `loggedIn` 캐시가 있으면 첫 렌더부터 캐시된 메모 데이터로 아이콘이 즉시 표시됨

## [1.0.5] - 2026-04-28

### Added
- **이 날 메모** (날짜별 공유 메모, 로그인 전용) — 사이드 패널에서 선택한 날짜에 메모를 작성/공유. 캘린더 타일에는 메모가 있을 때 📝 아이콘으로 표시
- 메모 입력란에 서식 에디터 적용: 굵게/기울임/밑줄/취소선, 글머리표/번호 매기기, 형광펜·글자색, 링크 삽입, 서식 제거 (Ctrl+B/I/U, Ctrl+Enter로 저장)
- Firebase 룰 `calendar_notes` 경로 추가 — 비로그인 사용자는 메모 데이터에 접근 불가

## [1.0.4] - 2026-04-28

### Added
- 연차 유형에 '공가' 추가 (보라색 배지) — 차감 합계와는 별도로 `공가 N일` 형태로 카운트되어 휴가/반차 차감 일수와 분리 표시됨

## [1.0.3] - 2026-04-24

### Changed
- 버전 정보 팝업의 섹션 라벨을 한국어로 변경: `ADDED` / `CHANGED` / `FIXED` → `추가` / `변경` / `수정`

## [1.0.2] - 2026-04-24

### Added
- 메모 저장 전 모달을 닫아도 편집 내용이 브라우저에 자동 보관되어 다음에 열 때 복원됨 (localStorage 기반 드래프트)

### Changed
- 메모 팝업 타이틀: '📝 팀 공유 메모' → '📝 메모'

### Fixed
- 메모 모달이 빈 영역 클릭으로도 닫혀 드래그로 글 지우다가 꺼지던 문제 — 이제 [×] / [닫기] / Esc 로만 닫힘

## [1.0.1] - 2026-04-24

### Added
- 푸터 버전 번호 클릭 시 앱 내 팝업에서 버전 이력 확인

### Changed
- 푸터 버전 링크: GitHub Releases 외부 이동 → 앱 내 팝업으로 전환 (Releases 링크는 팝업 하단에 보조로 유지)

## [1.0.0] - 2026-04-24

버전 관리를 시작하는 기준점. 이후 모든 변경은 이 문서에 누적 기록한다.

### 주요 기능
- 월간 일정표 (지란지교소프트 품질관리팀)
- Firebase 기반 실시간 동기화 및 로그인
- 일정 CRUD: 타일 클릭 편집, D+클릭 삭제, 드래그 복사(Ctrl/Alt)
- 진행률 게이지 (예정 일정 기간 대비 현재 위치)
- 일정표 HTML 복사 (Shift+클릭 단축키)
- JSON 내보내기 / 불러오기
- 인쇄 지원
- 월간 연차 현황 플로팅 패널
- 메모 모달
- 2026~2030 한국 공휴일 내장

[Unreleased]: https://github.com/miracle38/calendar/compare/v1.0.7...HEAD
[1.0.7]: https://github.com/miracle38/calendar/compare/v1.0.6...v1.0.7
[1.0.6]: https://github.com/miracle38/calendar/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/miracle38/calendar/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/miracle38/calendar/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/miracle38/calendar/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/miracle38/calendar/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/miracle38/calendar/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/miracle38/calendar/releases/tag/v1.0.0
