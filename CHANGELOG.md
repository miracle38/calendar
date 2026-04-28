# Changelog

이 프로젝트의 모든 주요 변경사항을 이 파일에 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)을 따르며,
[유의적 버전(SemVer)](https://semver.org/lang/ko/)을 사용합니다.

- **MAJOR**: 기존 사용자 데이터/사용 흐름과 호환되지 않는 변경
- **MINOR**: 하위 호환되는 기능 추가
- **PATCH**: 하위 호환되는 버그 수정

## [Unreleased]

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

[Unreleased]: https://github.com/miracle38/calendar/compare/v1.0.5...HEAD
[1.0.5]: https://github.com/miracle38/calendar/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/miracle38/calendar/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/miracle38/calendar/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/miracle38/calendar/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/miracle38/calendar/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/miracle38/calendar/releases/tag/v1.0.0
