# Changelog

이 프로젝트의 모든 주요 변경사항을 이 파일에 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)을 따르며,
[유의적 버전(SemVer)](https://semver.org/lang/ko/)을 사용합니다.

- **MAJOR**: 기존 사용자 데이터/사용 흐름과 호환되지 않는 변경
- **MINOR**: 하위 호환되는 기능 추가
- **PATCH**: 하위 호환되는 버그 수정

## [Unreleased]

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

[Unreleased]: https://github.com/miracle38/calendar/compare/v1.0.2...HEAD
[1.0.2]: https://github.com/miracle38/calendar/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/miracle38/calendar/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/miracle38/calendar/releases/tag/v1.0.0
