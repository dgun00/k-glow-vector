# 프론트엔드 목업 싱글턴 프롬프트 — Route: `/`

> **프로젝트**: K-Beauty Whisperer (K-Glow AI Search)
> **라우터**: `/` (홈 페이지)
> **파일 위치**: `src/pages/HomePage.tsx`
> **더미 데이터**: `src/data/routes/home.json`

---

## 중요 선언

이 프로젝트는 UI/UX 테스트용 프론트엔드 목업이다.

- 어떤 서버도 생성하지 않는다.
- 어떤 데이터베이스도 생성하지 않는다.
- 어떤 API route도 생성하지 않는다.
- fetch/axios 같은 네트워크 코드를 만들지 않는다.
- 환경변수를 요구하지 않는다.
- 인증 시스템을 자동 생성하지 않는다.
- **Next.js를 사용하지 않는다. React 18 + Vite 프로젝트다.**
- `next/router`, `next/link`, `next/image` 등 Next.js API를 사용하지 않는다.

모든 데이터는 `src/data/routes/home.json` 로컬 파일에서 ES 모듈로 import한다.  
모든 인터랙션은 로컬 상태 변화로만 시뮬레이션한다.

---

## 기술 스택

| 항목 | 버전/도구 |
|---|---|
| 프레임워크 | React 18 + TypeScript + Vite |
| 라우팅 | React Router DOM v6 (`useNavigate`) |
| 스타일링 | Tailwind CSS (다크모드: `class` 방식) |
| 애니메이션 | Framer Motion |
| 아이콘 | Lucide React |
| 컴포넌트 | shadcn/ui |
| 커스텀 CSS | `gradient-text`, `glow-shadow`, `glass`, `gradient-glow-subtle` |
| 토스트 | Sonner |

**라우팅 훅**:
```typescript
import { useNavigate } from "react-router-dom";
const navigate = useNavigate();
// navigate("/search?q=글로우 세럼");
```

---

## PRD 요약

- **서비스**: K-뷰티 제품 AI 추천 검색 서비스
- **MVP 목표**: 검색 전환율, 예시 칩 클릭률, 회원 전환율
- **페르소나**:
  - 20대 여성, 피부 트러블·성분 민감 → 자연어로 "민감 피부 수분 세럼" 검색
  - 해외 K-뷰티 팬, 무드·감성 기반 제품 탐색

---

## 라우터 명세

### 목적

K-Glow AI 검색의 진입점. 사용자가 자연어 또는 예시 문장을 통해 검색을 시작하도록 유도한다.

### 진입 조건

- Public (비로그인/로그인 모두 접근 가능)
- 로그인 상태이면 **최근 검색 로그** 섹션이 추가 표시된다

---

## ASCII 레이아웃

```
┌─────────────────────────────────────────────────────────┐
│  HEADER                                                 │
│  [K-Glow 로고]          [다크모드 토글] [저장] [계정]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│           (배경: hero-bg.jpg, opacity 8%)              │
│                                                         │
│         ┌───────────────────────────────────┐          │
│         │  K-Glow  AI Search                │          │
│         │  (gradient-text + 일반 텍스트)    │          │
│         │  원하는 무드 · 피부 상태를         │          │
│         │  자연어로 입력하세요              │          │
│         └───────────────────────────────────┘          │
│                                                         │
│    ┌─────────────────────────────────────────┐         │
│    │  🔍  검색어를 입력하세요...        [→]  │         │
│    └─────────────────────────────────────────┘         │
│    (large SearchBar, rounded-full, glow on focus)      │
│                                                         │
│   [글로우 피부]  [무향 스킨케어]  [진정 앰플]          │
│   [쿨톤 쿠션]   [립 틴트]        [수분 크림]           │
│   (예시 칩 - rounded-full border, hover: scale 1.05)  │
│                                                         │
│  💬 이렇게도 검색해 보세요                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │ "하루종일 촉촉한데 끈적이지 않는 선크림 있나요" →│  │
│  ├──────────────────────────────────────────────────┤  │
│  │ "쿨톤에 어울리는 봄 립 추천해줘"               →│  │
│  ├──────────────────────────────────────────────────┤  │
│  │ "민감 피부인데 레티놀 써도 되는 세럼"           →│  │
│  └──────────────────────────────────────────────────┘  │
│  (hover: x축 4px 이동, ArrowRight 아이콘 fade-in)     │
│                                                         │
│  ── [로그인 시에만 표시] ──────────────────────────    │
│  최근 검색                                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │ "글로우 세럼"                       [다시 보기] │  │
│  │ "쿨톤 쿠션 파운데이션"              [다시 보기] │  │
│  │ "무향 수분크림"                     [다시 보기] │  │
│  └──────────────────────────────────────────────────┘  │
│  (motion.div opacity 0→1, delay 0.3s)                 │
│                                                         │
│  인기: #글로우  #수분충전  #무향  #진정                 │
│  (text-primary/70, 텍스트만, 클릭 불가)               │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  FOOTER                                                 │
│  서비스 소개  |  개인정보 처리방침  |  문의             │
└─────────────────────────────────────────────────────────┘
```

---

## JSON 더미 파일

**경로**: `src/data/routes/home.json`

```json
{
  "__mock": { "mode": "success" },
  "page": {
    "title": "K-Glow AI Search",
    "subtitle": "원하는 무드 · 피부 상태를 자연어로 입력하세요"
  },
  "view": {
    "exampleChips": [
      "글로우 피부", "무향 스킨케어", "진정 앰플",
      "쿨톤 쿠션", "립 틴트", "수분 크림"
    ],
    "exampleSentences": [
      "하루종일 촉촉한데 끈적이지 않는 선크림 있나요",
      "쿨톤에 어울리는 봄 립 추천해줘",
      "민감 피부인데 레티놀 써도 되는 세럼"
    ],
    "trendTags": ["#글로우", "#수분충전", "#무향", "#진정", "#쿨톤"],
    "recentSearches": [
      { "query": "글로우 세럼", "created_at": "2026-02-24T10:30:00Z" },
      { "query": "쿨톤 쿠션 파운데이션", "created_at": "2026-02-23T14:00:00Z" },
      { "query": "무향 수분크림", "created_at": "2026-02-22T09:15:00Z" }
    ]
  },
  "actions": {
    "searchSubmit": { "navigateTo": "/search?q={query}" },
    "chipClick": { "navigateTo": "/search?q={chip}" },
    "sentenceClick": { "navigateTo": "/search?q={sentence}" },
    "recentSearchClick": { "navigateTo": "/search?q={query}" }
  }
}
```

**import 방식**:
```typescript
import homeData from "../data/routes/home.json";
```

---

## 상태 머신

| 상태 | 조건 | UI |
|---|---|---|
| `initial` | 페이지 진입 | JSON에서 칩/문장/트렌드 즉시 렌더 |
| `loggedIn` | `isLoggedIn === true` | recentSearches 섹션 추가 표시 (상위 3개) |
| `loggedOut` | `isLoggedIn === false` | recentSearches 섹션 숨김 |
| `loading` | 없음 | 즉시 렌더 (로딩 없음) |
| `error` | 없음 | 해당 없음 |

> `isLoggedIn`은 `AuthContext` (React Context API) 또는 로컬 `useState(false)`로 관리.  
> Header의 [계정] 버튼 옆에 토글 버튼을 추가해 로그인 상태를 목업 내에서 전환할 수 있게 한다.

---

## 버튼 목록 & 이벤트

### 1. SearchBar 제출
- **이벤트**: `SEARCH_SUBMIT`
- **조건**: 입력값 2자 이상
- **클릭 시**: `navigate("/search?q=" + encodeURIComponent(입력값))`

### 2. 예시 칩 버튼 (`exampleChips` 배열 렌더)
- **이벤트**: `CLICK_EXAMPLE_CHIP`
- **애니메이션**: `whileHover={{ scale: 1.05 }}`, `whileTap={{ scale: 0.97 }}`
- **클릭 시**: `navigate("/search?q=" + encodeURIComponent(chip))`

### 3. 예시 문장 버튼 (`exampleSentences` 배열 렌더)
- **이벤트**: `CLICK_EXAMPLE_SENTENCE`
- **hover 시**: x축 4px 이동, `ArrowRight` 아이콘 fade-in
- **클릭 시**: `navigate("/search?q=" + encodeURIComponent(sentence))`

### 4. 최근 검색 "다시 보기" (`isLoggedIn` 일 때만)
- **이벤트**: `RERUN_RECENT_SEARCH`
- **클릭 시**: `navigate("/search?q=" + encodeURIComponent(query))`

### 5. Header 다크모드 토글
- **이벤트**: `TOGGLE_DARK_MODE`
- **클릭 시**: `document.documentElement.classList.toggle("dark")`

### 6. Header "저장" 버튼
- `isLoggedIn === false` → `navigate("/auth?next=/saved")`
- `isLoggedIn === true` → `navigate("/saved")`

### 7. Header "계정" 버튼
- `isLoggedIn === false` → `navigate("/auth?next=/account")`
- `isLoggedIn === true` → `navigate("/account")`

---

## 애니메이션 명세

| 대상 | 애니메이션 |
|---|---|
| 페이지 전체 | `motion.div` opacity(0→1), y(20→0), duration 0.6s |
| recentSearches 섹션 | `motion.div` opacity(0→1), delay 0.3s |
| 예시 문장 hover | `whileHover={{ x: 4 }}` |
| 예시 칩 hover | `whileHover={{ scale: 1.05 }}`, `whileTap={{ scale: 0.97 }}` |
| ArrowRight 아이콘 | group-hover로 `opacity-0 → opacity-100` 전환 |
