# 프론트엔드 목업 — 핵심 사용자 플로우 & QA 체크리스트

> **프로젝트**: K-Beauty Whisperer (K-Glow AI Search)
> **문서 위치**: `docs/mockup-prompt-flows-qa.md`

---

## 공통 UI 규칙

### Header 구성

| 요소 | 설명 |
|---|---|
| 좌측 로고 | "K-Glow" (gradient-text) — 클릭 시 `navigate("/")` |
| 중앙 검색창 | `showSearch=true` 일 때만 표시 (compact 크기) |
| 우측 다크모드 토글 | `Moon/Sun` 아이콘, `html.dark` 클래스 토글 |
| 우측 "저장" | `Heart` 아이콘, 비로그인 → `/auth?next=/saved` |
| 우측 "계정" | `User` 아이콘, 비로그인 → `/auth?next=/account` |
| 우측 "로그아웃" | 로그인 상태일 때만 표시, 클릭 → `isLoggedIn=false` |

### Footer 구성

```
┌─────────────────────────────────────────────────────────┐
│  © 2026 K-Glow                                          │
│  서비스 소개  |  개인정보 처리방침  |  문의             │
└─────────────────────────────────────────────────────────┘
```

- `text-xs text-muted-foreground`
- 각 링크는 `hover:underline` 처리 (클릭 시 toast 또는 아무 동작 없음)

### 공통 ProductCard 디자인

```
┌──────────────────────────────────────────────────────┐
│  ┌──────┐  제품명                                    │
│  │이미지│  브랜드  |  카테고리  |  가격대             │
│  │80x80 │  AI 추천 근거 한 줄 (text-sm muted)        │
│  │      │  [태그1] [태그2] [태그3]                   │
│  └──────┘  [♡ 저장]                   [상세 보기→]  │
└──────────────────────────────────────────────────────┘
```

- 배경: `bg-card border border-border rounded-xl p-4`
- 이미지: `rounded-lg object-cover`
- 태그: `text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground`
- 저장 버튼: `variant="outline"/"default"` 토글, `Heart` 아이콘
- 상세 보기: `ArrowRight` 아이콘, `text-primary text-sm`
- Framer Motion: `initial={{ opacity:0, y:10 }}` stagger 애니메이션

### 버튼 스타일 규칙

| variant | 용도 | 스타일 |
|---|---|---|
| `default` | 일반 주요 액션 | `bg-primary text-primary-foreground` |
| `glow` | CTA (루틴 리포트, 검색하러 가기) | `bg-primary` + `glow-shadow` 효과 |
| `outline` | 보조 액션 | `border border-border text-foreground` |
| `ghost` | 약한 액션 (다시 보기) | `text-foreground hover:bg-accent` |
| `chip` | 필터/선택 칩 | `rounded-full border border-border text-muted-foreground` |
| `secondary` | 배너 내 버튼 (리포트 만들기) | `bg-secondary text-secondary-foreground` |

### 입력창 공통 스타일

```
rounded-xl border border-border bg-background
px-4 py-3 text-sm text-foreground
placeholder:text-muted-foreground
focus:outline-none focus:ring-2 focus:ring-ring
```

### Loading UI

- **ProductCard 목록**: `animate-pulse` skeleton (h-24 × n개)
- **제품 상세**: `animate-pulse` skeleton (h-64 + h-6 + h-4)
- **리포트**: `animate-pulse` skeleton (h-64)
- **계정/선호도**: `animate-pulse` skeleton (h-48)
- **검색 결과**: `LoadingSteps` 3단계 진행 바 컴포넌트

### Empty UI

| 페이지 | 이미지 | 메시지 |
|---|---|---|
| 검색 결과 없음 | `empty-search.png` 128×128 | "결과가 없습니다 😢" |
| 저장한 제품 없음 | `empty-saved.png` 128×128 | "저장한 제품이 없습니다" |
| 검색 로그 없음 | 없음 (텍스트만) | "검색 기록이 없습니다" |

### Error UI

```
text-center py-16 space-y-4
  p.text-destructive  → 에러 메시지
  div.flex.gap-2.justify-center
    Button variant="outline" → 다시 시도
    Button variant="ghost" → 홈으로
```

---

## 커스텀 CSS 클래스 명세

| 클래스 | 용도 |
|---|---|
| `gradient-text` | "K-Glow" 로고 등 그라디언트 텍스트 |
| `glow-shadow` | 버튼/카드 hover 시 빛나는 그림자 |
| `glow-shadow-lg` | 더 강한 glow 효과 |
| `gradient-glow` | 루틴 리포트 CTA 배너 배경 |
| `gradient-glow-subtle` | 추천 근거, 요약, SearchInsight 배경 |
| `glass` | `backdrop-filter: blur` 반투명 배경 |

---

## 핵심 사용자 플로우

### 플로우 1: 비로그인 사용자의 제품 탐색 → 저장 시도 → 가입 → 저장 완료

```
["/"]
  ↓ CLICK_EXAMPLE_CHIP ("글로우 세럼")

["/search?q=글로우 세럼"]  ← loading 1.5초
  ↓ (success: 24개 결과, SearchInsight 표시)
  ↓ CLICK_PRODUCT_CARD (p001 — 그린티 씨드 세럼)

["/p/p001"]  ← loading 0.8초
  ↓ (success: 제품 상세 표시, saved=false)
  ↓ CLICK_SAVE (♡ 저장) ← 비로그인 상태

["/auth?next=/p/p001&intent=save"]
  ↓ 좌측: "제품을 저장하려면 로그인이 필요합니다" 표시
  ↓ AUTH_GOOGLE (Google로 로그인)
  ↓ loading 1초

  ← isLoggedIn = true

["/p/p001"]  ← navigate(next)
  ↓ saved = true 자동 반영 (savedProductIds에 p001 추가)
  ↓ "♡ 저장됨" 버튼 상태 표시
```

---

### 플로우 2: 로그인 사용자의 루틴 리포트 구매 → 열람

```
["/"]
  ↓ SEARCH_SUBMIT ("민감 피부 진정 앰플")

["/search?q=민감 피부 진정 앰플"]  ← loading 1.5초
  ↓ (success: 15개 결과)
  ↓ CLICK_BUTTON "✨ 프리미엄 루틴 리포트 만들기" ← 로그인 상태

  [PaymentModal 오버레이 표시]
  ↓ CLICK_BUTTON "결제 완료"
  ↓ reportId = "report-" + Date.now() 생성
  ↓ PaymentModal 닫힘

["/report/report-1740567890000"]  ← loading 0.7초
  ↓ reportId.startsWith("report-") → reports["default"] fallback
  ↓ (success: 리포트 렌더)
  ↓ SHARE_REPORT "↗ 공유"
  ↓ toast.success("링크 복사됨")

  ↓ CLICK_ALTERNATIVE "비타C 브라이트닝 앰플"

["/p/p003"]  ← loading 0.8초
  ↓ (success: 제품 상세 표시)
```

---

### 플로우 3: 저장 제품 비교 → 비교 모달 확인

```
["/saved"]  ← loading 0.5초 (로그인 상태)
  ↓ (success: 3개 제품 목록)
  ↓ TOGGLE_COMPARE_MODE "⇄ 비교 모드"
  ↓ compareMode = true, 각 카드에 체크박스 표시

  ↓ SELECT_FOR_COMPARE (p001 체크박스 클릭)
  → selected = ["p001"]

  ↓ SELECT_FOR_COMPARE (p002 체크박스 클릭)
  → selected = ["p001", "p002"]

  ↓ "2/3 선택됨" 배너 표시, [비교 보기] 버튼 활성화

  ↓ OPEN_COMPARE_MODAL "비교 보기"

  [CompareModal 오버레이 표시]
  → 그린티 씨드 세럼 vs 워터뱅크 히알루론 세럼
  → 브랜드, 카테고리, 가격대, 성분 등 비교 테이블

  ↓ CLOSE_COMPARE_MODAL "닫기"

  ↓ TOGGLE_COMPARE_MODE (비교 모드 해제)
  → compareMode = false, selected = [], 체크박스 숨김
```

---

### 플로우 4: 계정 선호도 설정 → 다시 검색

```
["/account"]  ← loading 0.6초 (로그인 상태)
  ↓ (success: 내 조건 탭, 기존 선호도 표시)

  ↓ SELECT_SKIN_TYPE "복합" (기존 "지성" → "복합" 변경)
  ↓ TOGGLE_CONCERN "모공" (추가)
  ↓ TOGGLE_FRAGRANCE_FREE (ON → OFF)
  ↓ SELECT_BUDGET "3-5만"

  ↓ PREFERENCES_SAVE "저장"
  → toast.success("조건이 저장되었습니다")

  ↓ 탭 전환 → "검색 로그"
  ↓ RERUN_SEARCH "글로우 세럼" → [다시 보기]

["/search?q=글로우 세럼"]
  ↓ loading 1.5초 → success
```

---

### 플로우 5: 제품 상세 → 성분 확인 → 유사 제품 탐색

```
["/search?q=쿨톤 쿠션"]  ← loading 1.5초
  ↓ CLICK_PRODUCT_CARD (p005 — 쿠션 파운데이션 N23)

["/p/p005"]  ← loading 0.8초
  ↓ 성분 요약 섹션: 주의 성분 "향료" (text-destructive 표시)
  ↓ TOGGLE_INGREDIENTS "전체 성분 보기 ∨"
  → showIngredients = true, ChevronDown rotate-180
  → 전체 성분 텍스트 박스 표시

  ↓ 유사 제품 그리드에서 p002 (라네즈) 클릭

["/p/p002"]  ← loading 0.8초
  ↓ (success: 라네즈 워터뱅크 히알루론 세럼 상세)
```

---

## QA 체크리스트

### 라우터 진입

- [ ] `/` → 진입 시 예시 칩·문장·트렌드 태그 즉시 렌더
- [ ] `/search?q=` → `?q=` 없으면 `/`로 redirect
- [ ] `/search?q=글로우` → loading 1.5초 후 결과 표시
- [ ] `/p/p001` → loading 0.8초 후 제품 상세 표시
- [ ] `/p/없는id` → "제품을 찾을 수 없습니다" + [홈으로]
- [ ] `/saved` → 비로그인 시 `/auth?next=/saved` redirect
- [ ] `/saved` → 로그인 시 loading 0.5초 후 목록 표시
- [ ] `/account` → 비로그인 시 `/auth?next=/account` redirect
- [ ] `/account` → 로그인 시 loading 0.6초 후 선호도 폼 표시
- [ ] `/report/report-123` → loading 0.7초 후 default 리포트 표시
- [ ] `/report/없는id` → "리포트를 찾을 수 없습니다" + [홈으로]
- [ ] `/auth?intent=buy_report` → 좌측 intent 메시지 표시

### JSON 기반 렌더링

- [ ] 홈: `home.json`의 `exampleChips` 배열이 칩으로 렌더됨
- [ ] 홈: `home.json`의 `exampleSentences` 배열이 문장 목록으로 렌더됨
- [ ] 검색: `search.json`의 `results` 배열이 ProductCard로 렌더됨
- [ ] 검색: `search.json`의 `search_meta`가 SearchInsight에 표시됨
- [ ] 제품상세: `product-detail.json`의 `products[id]`로 매칭됨
- [ ] 제품상세: `similar_ids` 배열로 유사 제품 그리드 렌더됨
- [ ] 저장: `saved.json`의 `savedProducts` 배열이 목록으로 렌더됨
- [ ] 계정: `account.json`의 `preferences`가 칩 선택 상태로 반영됨
- [ ] 계정: `account.json`의 `searchLogs`가 로그 목록으로 렌더됨
- [ ] 리포트: `report.json`의 `routine_am/pm`이 단계별로 렌더됨
- [ ] 리포트: `report.json`의 `warnings`가 주의 조합 섹션에 렌더됨
- [ ] 리포트: `report.json`의 `alternatives`로 대체 제품 그리드 렌더됨

### 버튼 이벤트

- [ ] 예시 칩 클릭 → `/search?q={chip}` 이동
- [ ] 예시 문장 클릭 → `/search?q={sentence}` 이동
- [ ] 검색 제출 → URL `?q=` 파라미터 업데이트
- [ ] 더 보기 → `visibleCount += 10`, 새 카드 표시
- [ ] FilterBar 카테고리 → 클라이언트 필터링 동작
- [ ] 저장 버튼 (비로그인) → `/auth` redirect
- [ ] 저장 버튼 (로그인) → `saved` 상태 토글
- [ ] 공유 버튼 → `toast.success("링크가 복사되었습니다")`
- [ ] PDF 버튼 → `toast.info("PDF 다운로드는 준비 중입니다")`
- [ ] "전체 성분 보기" → `showIngredients` 토글, ChevronDown 회전
- [ ] 비교 모드 → 체크박스 표시/숨김, `selected` 초기화
- [ ] 비교 모달 → 2개 미만 선택 시 [비교 보기] disabled
- [ ] 저장 해제 → `products` 배열에서 즉시 제거
- [ ] 선호도 저장 → `toast.success` 표시
- [ ] 선호도 초기화 → 모든 칩 선택 해제, 토글 OFF
- [ ] 검색 로그 "다시 보기" → `/search?q=` 이동
- [ ] 회원가입 → `signupSuccess=true` 화면 전환
- [ ] 로그인 성공 → `isLoggedIn=true`, `?next=` 경로 이동
- [ ] 루틴 리포트 버튼 (비로그인) → `/auth?intent=buy_report`
- [ ] 결제 완료 → `navigate("/report/report-{timestamp}")`

### 상태 전이

- [ ] `/search`: `initial` → `loading` → `success` 순서 확인
- [ ] `/search`: `success` 상태에서 필터 변경 시 클라이언트 필터링만 동작 (재로딩 없음)
- [ ] `/search`: `empty` 상태에서 [필터 초기화] 클릭 시 `success` 상태로 복귀
- [ ] `/p/:id`: `loading` → `success` → 저장 토글 → saved 상태 유지
- [ ] `/saved`: `success` → 저장 해제 → 마지막 항목 삭제 시 `empty` 상태 전환
- [ ] `/account`: `loading` → `success` → 칩 선택 → 저장 → toast
- [ ] `/auth`: `initial` → 버튼 클릭 → `loading` → `loginSuccess` → navigate(next)
- [ ] `/auth`: `initial` → `mode="signup"` → `loading` → `signupSuccess` 화면

### 네비게이션

- [ ] Header 로고 클릭 → `/`
- [ ] "← 뒤로" (`navigate(-1)`) → 이전 페이지
- [ ] "홈으로" 버튼 → `/`
- [ ] "새 검색" 버튼 → `/`
- [ ] 유사 제품 카드 → `/p/{id}`
- [ ] 대체 제품 카드 → `/p/{id}`
- [ ] 최근 검색 "다시 보기" → `/search?q={query}`

### 다크모드

- [ ] Header 다크모드 토글 클릭 → `document.documentElement.classList.toggle("dark")`
- [ ] 전환 시 모든 색상 변수(`--primary`, `--background` 등) 즉시 반영
- [ ] `dark` 클래스 기반으로 모든 컴포넌트 색상 전환 확인
- [ ] Next.js의 `ThemeProvider` 미사용 — 순수 classList 토글로만 처리

### 독립 수정 가능성

- [ ] `src/data/routes/home.json`만 수정해도 홈 페이지 독립 변경 가능
- [ ] `src/data/routes/search.json`만 수정해도 검색 결과 독립 변경 가능
- [ ] `src/data/routes/product-detail.json`에 새 제품 추가 → 해당 상세 페이지 즉시 반영
- [ ] `src/data/routes/report.json`에 새 리포트 추가 → `/report/{id}` 접근 가능
- [ ] 각 라우터 페이지 파일 (`src/pages/*.tsx`) 독립 수정 가능

---

## 데이터 파일 구조 요약

```
src/
  data/
    routes/
      home.json           → / 홈 페이지
      search.json         → /search?q= 검색 결과
      product-detail.json → /p/:productId 제품 상세
      saved.json          → /saved 저장 목록
      account.json        → /account 계정/선호도
      report.json         → /report/:reportId 루틴 리포트
      auth.json           → /auth 인증
```

각 페이지에서 ES 모듈로 import:

```typescript
import homeJson from "../data/routes/home.json";
import searchJson from "../data/routes/search.json";
// ... 등
```

### React Router DOM v6 라우팅 규칙

| 훅 | 사용 페이지 |
|---|---|
| `useNavigate` | 모든 페이지 (네비게이션) |
| `useParams` | `/p/:productId`, `/report/:reportId` |
| `useSearchParams` | `/search?q=`, `/auth?next=&intent=` |

```typescript
// 네비게이션 예시
navigate("/");
navigate(`/p/${productId}`);
navigate(`/search?q=${encodeURIComponent(query)}`);
navigate(-1); // 뒤로가기
navigate(decodeURIComponent(next), { replace: true }); // 인증 후 redirect
```

---

## 공통 타입 정의 요약

```typescript
// 제품
interface Product {
  id: string;
  name: string;
  brand: string;
  category: "skincare" | "base" | "lip" | "eye" | "suncare";
  price_band: "1-3만" | "3-5만" | "5만+";
  finish: string;
  tone_fit: "cool" | "warm" | "neutral" | "any";
  tags: string[];
  ingredients_top: string[];
  ingredients_caution: string[];
  texture_desc: string;
  explain_short: string;
  image_url: string;
  similar_ids: string[];
}

// 검색 메타
interface SearchMeta {
  model: string;
  embedding_dim: number;
  match_threshold: number;
  candidates_found: number;
  results_after_filter: number;
  top_similarity: number;
  avg_similarity: number;
  top_brands: string[];
  top_tags: string[];
  category_distribution: Record<string, number>;
}

// 사용자 선호도
interface UserPreferences {
  skin_type: string;
  tone: string;
  concerns: string[];
  fragrance_free: boolean;
  exclude_ingredients: string[];
  budget_band: string;
}

// 검색 로그
interface SearchLog {
  query: string;
  created_at: string;
  result_count?: number;
}

// 루틴 리포트
interface Report {
  reportId: string;
  title: string;
  created_at: string;
  summary: string;
  routine_am: string[];
  routine_pm: string[];
  reasoning: string[];
  warnings: string[];
  alternatives: string[];
}
```
