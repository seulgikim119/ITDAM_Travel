# ITDAM 작업 기록 (skill.md)

최종 업데이트: 2026-04-20  
작성 목적: 사용자 요청 수정 계획과 반영 범위를 지속 기록

---

## 1) 프로젝트 기준

- React 기반 반응형 웹앱
- 라우팅: React Router
- 전역 상태관리: Zustand
- 데이터: 백엔드 연동 없이 목업 기반
- 로컬 저장: `localStorage`
  - 사용자 취향 프로필
  - 찜 목록
  - 최근 본 여행지
  - 검색 프리셋
  - 로그인 상태
- 모바일 우선 설계 + 데스크톱 확장 대응
- 실시간 인기/커뮤니티/예약 정보는 목업 데이터 우선
- 실제 결제/예약 API 연동은 현재 범위 제외

---

## 2) 운영 규칙

- Rule (2026-04-20): 이후 사용자가 요청한 수정 계획은 모두 `skill.md`에 기록한다.

---

## 3) 요청 기록 (Rule 이후)

### 2026-04-20 요청 1

- 요청: 당일치기만 가능한 구조를 `2박3일 이상` 계획도 가능하게 확장
- 반영 계획:
  - `src/app/components/itgaebi-pick-page.tsx`
    - 시작일/종료일 기반 기간 계산 UI 및 로직 구성
    - `n박 n일` 계산값을 화면과 저장 데이터에 반영
  - `src/app/completed-plan-store.ts`
    - 기간 필드(`travelStartDate`, `travelEndDate`, `tripNights`, `tripDays`) 저장 구조 반영
  - `src/app/components/damggaebi-land-page.tsx`
    - 저장된 기간값 기반 일정 표기 보강

### 2026-04-20 요청 2

- 요청: "여정 가져오기" 아래에 날짜 선택 UI 배치
- 반영 계획:
  - `src/app/components/itgaebi-pick-page.tsx`
    - 날짜 선택 영역을 상단 "여정 가져오기" 섹션 하단으로 배치
    - 중복 날짜 입력 UI 제거 후 단일 진입점 유지

### 2026-04-20 요청 3

- 요청: 앱 내부가 아닌 웹 바깥(프레임 외부) 배경에 `BG.png` 적용
- 반영 계획:
  - `src/app/App.tsx`
    - 최상위 웹 래퍼에 배경 이미지 적용
  - `src/assets/BG.png`
    - 배경 리소스 등록
  - 참고: 앱 내부 배경 스타일은 유지/변경 대상에서 제외

### 2026-04-20 요청 4

- 요청: 지능형 타임라인 편집에 날짜별 탭 메뉴 추가(날짜별 여행 계획 수립)
- 반영 계획:
  - `src/app/components/itgaebi-pick-page.tsx`
    - 여행 기간(`tripDays`) 기준 `n일차` 탭 동적 생성
    - 날짜 탭별 `draftStops` 상태 분리 관리(`draftStopsByDay`)
    - 날짜 탭 전환 시 각 일차 데이터 독립 편집(순서/메모/체류시간)
    - 최종 확정 저장 시 전체 일차 스톱 합산 저장
    - 저장 메모에 `n일차` 정보 함께 반영

### 2026-04-20 Request 5

- Request: stabilize text movement when switching date tabs in intelligent timeline editing
- Plan:
  - Remove per-card rotate transform in the day timeline list
  - Replace Date.now-based placeholder stop ids with deterministic ids

### 2026-04-20 Request 6

- Request: itgaebi pick page does not open, check and fix
- Plan:
  - Diagnose runtime crash points in `itgaebi-pick-page.tsx`
  - Restore missing loop index used in timeline card label rendering
  - Rebuild and verify no compile-time/bundle errors

### 2026-04-20 Request 7

- Request: stabilize date-by-date planning flow in itgaebi pick page
- Plan:
  - Resolve state sync conflicts between `draftStopsByDay` and current-day `draftStops`
  - Prevent selection/edit state reset when same-day data sync occurs
  - Remove duplicate initialization path tied to `activeRoutine`

### 2026-04-20 Request 8

- Request: date-based planning still unstable, inspect and stabilize further
- Plan:
  - Remove feedback loop dependency that re-syncs current-day stops while editing
  - Keep day-change sync only on selected day / day-map updates
  - Rebuild and verify

### 2026-04-20 Request 9

- Request: bottom contents keep moving when clicking date tabs in intelligent timeline
- Plan:
  - Prevent stale write-back of previous-day `draftStops` during day tab switch
  - Track ownership day for `draftStops` and sync only when day context matches
  - Rebuild and verify stability

### 2026-04-20 Request 10

- Request: add lodging-location insertion feature in itgaebi pick page
- Plan:
  - Add lodging input UI (name/memo) in intelligent timeline section
  - Insert lodging stop into selected day timeline with dedicated badge/style
  - Extend completed-plan stop kind type to include `lodging`
  - Rebuild and verify

### 2026-04-20 Request 11

- Request: limit outside-web background image to max 1920x1080 and fill larger area with natural background color
- Plan:
  - Move web background image to a dedicated centered layer with max bounds (min(100vw,1920px) / min(100vh,1080px))
  - Keep root wrapper color as fallback canvas for areas outside image bounds
  - Preserve image ratio with `background-size: cover` inside bounded layer to avoid distortion-like stretching on ultra-wide screens
  - Rebuild and verify

### 2026-04-20 Request 12

- Request: prevent line wrapping for top helper text in web outside area
- Plan:
  - Add `w-max` to the top helper container in `App.tsx`
  - Add `whitespace-nowrap` to the text span to force single-line rendering

### 2026-04-20 Request 13

- Request: develop itgaebi-road exploration for long-trip curation with duration filter, stacked long-trip cards, and partial day pickup
- Plan:
  - Add top duration filters (당일 / 1박 2일 / 2박 3일+) and filter feed routines by selected period
  - Apply layered stack visual for long-trip cards and expose `N Days` badge for volume emphasis
  - Add partial pickup controls to clone specific day segments while keeping full-plan clone option
  - Rebuild and verify

### 2026-04-20 Request 14

- Request: restore broken Korean text across files
- Plan:
  - Audit project files for mojibake patterns and identify corrupted UI copy
  - Restore broken Korean strings in affected pages while preserving recent feature logic
  - Rebuild to verify no syntax/runtime regression after text restoration

### 2026-04-20 Request 15

- Request: add more route data tailored for 1박 2일 / 2박 3일 planning
- Plan:
  - Expand content-data.ts routines with additional multi-day routes
  - Keep existing route ids used by current screens and add new unique ids for long-trip entries
  - Ensure duration labels align with period filter logic (1박 2일, 2박 3일)
  - Rebuild and verify

### 2026-04-20 Request 16

- Request: resize entire app to iPhone 12 Pro size
- Plan:
  - Update app frame size to `390x844` in `App.tsx`
  - Replace remaining `393/852` hardcoded sizes in pick/land overlays and bottom-ticket math
  - Rebuild and verify

### 2026-04-20 Request 17

- Request: apply responsive sizing behavior
- Plan:
  - Keep mobile full-viewport layout as default
  - Change desktop frame height from fixed value to `100dvh` with `max-height: 844px`
  - Preserve iPhone 12 Pro width target (`390px`) while preventing viewport overflow
  - Rebuild and verify
