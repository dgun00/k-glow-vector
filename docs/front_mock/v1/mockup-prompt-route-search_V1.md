# 프론트엔드 목업 싱글턴 프롬프트 — Route: `/search`

> **프로젝트**: K-Beauty Whisperer (K-Glow AI Search)
> **라우터**: `/search?q={query}`
> **파일 위치**: `src/pages/SearchPage.tsx`
> **더미 데이터**: `src/data/routes/search.json`

---

## 중요 선언

이 프로젝트는 UI/UX 테스트용 프론트엔드 목업이다.

- 어떤 서버도 생성하지 않는다.
- fetch/axios 같은 네트워크 코드를 만들지 않는다.
- 환경변수를 요구하지 않는다.
- **Next.js를 사용하지 않는다. React 18 + Vite 프로젝트다.**
- `next/router`, `next/link`, `next/navigation` 등 Next.js API를 사용하지 않는다.

모든 데이터는 `src/data/routes/search.json` 로컬 파일에서 ES 모듈로 import한다.

```typescript
import searchJson from "../data/routes/search.json";
```

---

## 기술 스택

| 항목 | 버전/도구 |
|---|---|
| 프레임워크 | React 18 + TypeScript + Vite |
| 라우팅 | React Router DOM v6 (`useSearchParams`, `useNavigate`) |
| 스타일링 | Tailwind CSS |
| 애니메이션 | Framer Motion |
| 아이콘 | Lucide React (`Search`, `SlidersHorizontal`, `Sparkles`, `X`) |
| 컴포넌트 | shadcn/ui Button, Dialog (PaymentModal) |
| 토스트 | Sonner |

---

## 라우팅 훅

```typescript
import { useSearchParams, useNavigate } from "react-router-dom";

const [searchParams] = useSearchParams();
const navigate = useNavigate();

const q = searchParams.get("q") ?? "";

// q가 없으면 홈으로 redirect
useEffect(() => {
  if (!q) navigate("/", { replace: true });
}, [q]);

// 검색 제출 시 URL 업데이트
navigate(`/search?q=${encodeURIComponent(newQuery)}`);
```

---

## 라우터 명세

### 목적

사용자의 자연어 검색 쿼리에 맞는 K-뷰티 제품 목록을 표시한다.  
AI SearchInsight, 카테고리 FilterBar, ProductCard 목록을 포함한다.  
프리미엄 루틴 리포트 PaymentModal CTA를 제공한다.

### 진입 조건

- Public (비로그인도 검색 가능)
- `?q=` 파라미터 필수 — 없으면 `/` redirect
- `?q=` 파라미터 변경 시 상태 초기화 후 데이터 재로드

---

## ASCII 레이아웃

### 로딩 상태

```
┌─────────────────────────────────────────────────────────┐
│  HEADER (showSearch 모드)                               │
├─────────────────────────────────────────────────────────┤
│  MAIN (container, py-6, space-y-4)                      │
│                                                         │
│  ┌── LoadingSteps 컴포넌트 ───────────────────────────┐  │
│  │  AI가 제품을 분석하는 중...                        │  │
│  │  ✓ Step 1: 쿼리 분석 완료       (0.5s 후)         │  │
│  │  ✓ Step 2: 벡터 검색 완료       (1.0s 후)         │  │
│  │  ● Step 3: 개인화 필터링 중...  (1.5s 후)         │  │
│  │  [━━━━━━━━━━━━━━━━━━━━━━━━░░░░░] 진행 바          │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 정상 (success) 상태

```
┌─────────────────────────────────────────────────────────┐
│  HEADER (showSearch 모드)                               │
├─────────────────────────────────────────────────────────┤
│  MAIN (container, py-6, space-y-4)                      │
│                                                         │
│  ┌── SearchInsight (gradient-glow-subtle p-4 rounded-xl)┐│
│  │  ✨ AI 검색 인사이트                                 ││
│  │  "글로우 세럼"에 대해 24개 제품을 찾았습니다.      ││
│  │  상위 브랜드: 이니스프리, 라네즈, some by mi       ││
│  │  주요 태그: [수분충전] [글로우] [히알루론산]       ││
│  └──────────────────────────────────────────────────────┘│
│                                                         │
│  ┌── FilterBar ────────────────────────────────────────┐ │
│  │  [전체●] [스킨케어] [베이스] [립] [아이] [선케어] │ │
│  │  (rounded-full chip 버튼, 선택됨=default)           │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  "글로우 세럼" 검색 결과 24개                           │
│  (text-sm text-muted-foreground)                        │
│                                                         │
│  ┌── ProductCard (반복, space-y-3) ───────────────────┐ │
│  │  [이미지 80x80]  그린티 씨드 세럼                  │ │
│  │                  이니스프리 | 스킨케어 | 1-3만      │ │
│  │                  녹차 추출물이 항산화 작용을 하며... │ │
│  │                  [수분충전] [글로우] [진정]         │ │
│  │                  [♡ 저장]          [상세 보기→]    │ │
│  └────────────────────────────────────────────────────┘ │
│  (visibleCount개 표시, Framer Motion stagger 애니메이션)│
│                                                         │
│  [더 보기]  (visibleCount < filteredResults.length 시) │
│  (outline 버튼, mx-auto block)                          │
│                                                         │
│  ┌── 프리미엄 루틴 리포트 CTA (gradient-glow, rounded-2xl)┐│
│  │        ✨ (Sparkles 아이콘)                          ││
│  │  프리미엄 루틴 리포트 만들기                        ││
│  │  AI가 AM/PM 루틴, 주의 조합, 대체 제품을 분석합니다││
│  │                                                      ││
│  │  [✨ 프리미엄 루틴 리포트 만들기 — ₩4,900]         ││
│  │  (secondary 버튼, rounded-full)                     ││
│  └──────────────────────────────────────────────────────┘│
│                                                         │
├─────────────────────────────────────────────────────────┤
│  FOOTER                                                 │
└─────────────────────────────────────────────────────────┘
```

### 결과 없음 (empty) 상태

```
┌─────────────────────────────────────────────────────────┐
│  HEADER                                                 │
│  MAIN (py-16 text-center space-y-4)                     │
│                                                         │
│  [empty-search.png  128x128 object-contain]             │
│  결과가 없습니다 😢                                     │
│  (text-muted-foreground)                                │
│                                                         │
│  [필터 초기화]  (outline 버튼)                          │
│  FOOTER                                                 │
└─────────────────────────────────────────────────────────┘
```

---

## JSON 더미 파일

**경로**: `src/data/routes/search.json`

```json
{
  "__mock": { "mode": "success", "delay_ms": 1500 },
  "search_meta": {
    "model": "text-embedding-3-small",
    "embedding_dim": 1536,
    "match_threshold": 0.78,
    "candidates_found": 48,
    "results_after_filter": 24,
    "top_similarity": 0.94,
    "avg_similarity": 0.85,
    "top_brands": ["이니스프리", "라네즈", "some by mi"],
    "top_tags": ["수분충전", "글로우", "히알루론산"],
    "category_distribution": {
      "skincare": 18,
      "base": 4,
      "lip": 1,
      "suncare": 1
    }
  },
  "results": [
    {
      "id": "p001",
      "name": "그린티 씨드 세럼",
      "brand": "이니스프리",
      "category": "skincare",
      "price_band": "1-3만",
      "finish": "글로우",
      "tone_fit": "any",
      "tags": ["수분충전", "글로우", "진정", "산뜻한"],
      "ingredients_top": ["녹차추출물", "히알루론산", "판테놀"],
      "ingredients_caution": [],
      "explain_short": "녹차 추출물이 항산화 작용을 하며 수분 세럼 중 가성비가 뛰어납니다.",
      "image_url": "/assets/products/skincare-default.jpg",
      "similarity_score": 0.94
    },
    {
      "id": "p002",
      "name": "워터뱅크 블루 히알루론 세럼",
      "brand": "라네즈",
      "category": "skincare",
      "price_band": "3-5만",
      "finish": "글로우",
      "tone_fit": "any",
      "tags": ["수분폭탄", "글로우", "히알루론산"],
      "ingredients_top": ["히알루론산", "글리세린", "나이아신아마이드"],
      "ingredients_caution": [],
      "explain_short": "5중 히알루론산 복합체로 피부 깊숙이 수분을 공급합니다.",
      "image_url": "/assets/products/skincare-default.jpg",
      "similarity_score": 0.91
    },
    {
      "id": "p003",
      "name": "비타C 브라이트닝 앰플",
      "brand": "some by mi",
      "category": "skincare",
      "price_band": "1-3만",
      "finish": "새틴",
      "tone_fit": "any",
      "tags": ["글로우", "미백", "비타민C", "탄력"],
      "ingredients_top": ["비타민C 유도체", "나이아신아마이드", "알부틴"],
      "ingredients_caution": ["향료"],
      "explain_short": "비타민C 유도체로 잡티를 개선하고 글로우 피부를 완성합니다.",
      "image_url": "/assets/products/skincare-default.jpg",
      "similarity_score": 0.88
    },
    {
      "id": "p004",
      "name": "세라마이드 나이트 크림",
      "brand": "닥터자르트",
      "category": "skincare",
      "price_band": "5만+",
      "finish": "크리미",
      "tone_fit": "any",
      "tags": ["진정", "수면팩", "세라마이드", "장벽강화"],
      "ingredients_top": ["세라마이드", "판테놀", "스쿠알란"],
      "ingredients_caution": [],
      "explain_short": "5가지 세라마이드로 손상된 피부 장벽을 빠르게 회복합니다.",
      "image_url": "/assets/products/skincare-default.jpg",
      "similarity_score": 0.85
    },
    {
      "id": "p005",
      "name": "쿠션 파운데이션 N23",
      "brand": "클리오",
      "category": "base",
      "price_band": "3-5만",
      "finish": "새틴",
      "tone_fit": "cool",
      "tags": ["쿨톤", "커버력", "지속력", "글로우"],
      "ingredients_top": ["티타늄디옥사이드", "징크옥사이드"],
      "ingredients_caution": ["향료"],
      "explain_short": "쿨톤 피부에 최적화된 N23 쉐이드로 자연스러운 커버를 제공합니다.",
      "image_url": "/assets/products/makeup-default.jpg",
      "similarity_score": 0.82
    }
  ],
  "view": {
    "savedProductIds": ["p002"],
    "categoryLabels": {
      "skincare": "스킨케어",
      "base": "베이스",
      "lip": "립",
      "eye": "아이",
      "suncare": "선케어"
    }
  },
  "actions": {
    "saveToggle": { "description": "savedProductIds 배열에 id 추가/제거" },
    "filterCategory": { "description": "activeCategory 상태 변경 → filteredResults 재계산 (재로딩 없음)" },
    "loadMore": { "description": "visibleCount += 10" },
    "openPayment": { "description": "paymentOpen = true" }
  }
}
```

---

## 상태 머신

| 상태 | 진입 조건 | UI |
|---|---|---|
| `loading` | 페이지 마운트 또는 `q` 변경 | LoadingSteps 3단계 진행 표시 |
| `success` | setTimeout 1500ms 후, results.length > 0 | SearchInsight + FilterBar + ProductCard 목록 |
| `empty` | filteredResults.length === 0 (필터 적용 후) | empty-search 이미지 + "결과가 없습니다" + [필터 초기화] |

---

## 로컬 상태 정의

```typescript
const [results, setResults] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);
const [activeCategory, setActiveCategory] = useState<string>("all");
const [visibleCount, setVisibleCount] = useState(10);
const [savedIds, setSavedIds] = useState<string[]>([]);
const [paymentOpen, setPaymentOpen] = useState(false);

// 클라이언트 필터링 (재로딩 없음)
const filteredResults = activeCategory === "all"
  ? results
  : results.filter(p => p.category === activeCategory);

const visibleResults = filteredResults.slice(0, visibleCount);
```

**초기화 로직**:
```typescript
useEffect(() => {
  if (!q) return;
  setLoading(true);
  setActiveCategory("all");
  setVisibleCount(10);
  setTimeout(() => {
    setResults(searchJson.results);
    setSavedIds(searchJson.view.savedProductIds);
    setLoading(false);
  }, 1500);
}, [q]);
```

---

## 버튼 목록 & 이벤트

### 1. 검색창 제출
- **이벤트**: `SEARCH_SUBMIT`
- **클릭 시**: `navigate(\`/search?q=${encodeURIComponent(newQuery)}\`)`
- 같은 쿼리 재검색 시 상태 초기화 후 재로드

### 2. FilterBar 카테고리 칩
- **이벤트**: `FILTER_CATEGORY`
- **클릭 시**: `setActiveCategory(cat)`, `setVisibleCount(10)`
- 클라이언트 필터링 — 재로딩 없음
- 활성: `variant="default"`, 비활성: `variant="chip"`

### 3. ProductCard "♡ 저장" 버튼
- **이벤트**: `SAVE_TOGGLE`
- `isLoggedIn === false` → `navigate(\`/auth?next=/search?q=${encodeURIComponent(q)}&intent=save\`)`
- `isLoggedIn === true` → `savedIds` 배열에 id 추가/제거
- `saved === true`: `variant="default"`, `Heart` 아이콘 `fill-current`
- `saved === false`: `variant="outline"`, `Heart` 아이콘 일반
- **크기**: `size="sm"`, `rounded-full`

### 4. ProductCard "상세 보기 →"
- **이벤트**: `CLICK_PRODUCT_CARD`
- **클릭 시**: `navigate(\`/p/${product.id}\`)`
- **스타일**: `ArrowRight` 아이콘, `text-primary text-sm`

### 5. "더 보기" 버튼
- **이벤트**: `LOAD_MORE`
- **표시 조건**: `visibleCount < filteredResults.length`
- **클릭 시**: `setVisibleCount(prev => prev + 10)`
- **스타일**: `variant="outline"`, `mx-auto block`

### 6. "✨ 프리미엄 루틴 리포트 만들기" 버튼
- **이벤트**: `OPEN_PAYMENT_MODAL`
- `isLoggedIn === false` → `navigate(\`/auth?next=/search?q=${encodeURIComponent(q)}&intent=buy_report\`)`
- `isLoggedIn === true` → `setPaymentOpen(true)`
- **스타일**: `variant="secondary"`, `rounded-full`

### 7. "필터 초기화" 버튼 (empty 상태)
- **이벤트**: `RESET_FILTER`
- **클릭 시**: `setActiveCategory("all")`, `setVisibleCount(10)`
- → `success` 상태로 자동 복귀 (results 배열에 데이터 있음)
- **스타일**: `variant="outline"`

---

## LoadingSteps 컴포넌트 명세

```typescript
// 3단계 진행 표시 (각 500ms 간격)
const steps = [
  "쿼리 분석 중...",
  "벡터 검색 중...",
  "개인화 필터링 중...",
];

// 0ms:    step 0 활성
// 500ms:  step 1 활성
// 1000ms: step 2 활성
// 1500ms: loading 종료
```

- 각 단계: `flex items-center gap-2`
- 완료된 단계: `text-primary` + ✓ 표시
- 현재 단계: `animate-pulse text-muted-foreground`
- 진행 바: `h-1 rounded-full bg-primary transition-all duration-500`

---

## SearchInsight 섹션 명세

```typescript
// search_meta 기반 표시
const meta = searchJson.search_meta;

// 표시 항목:
// "{q}"에 대해 {results_after_filter}개 제품을 찾았습니다.
// 상위 브랜드: {top_brands.join(", ")}
// 주요 태그: {top_tags} (chip 형태)
```

- 배경: `gradient-glow-subtle p-4 rounded-xl`
- 태그 칩: `text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground`

---

## PaymentModal 명세

```tsx
<Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
  <DialogContent className="max-w-sm text-center space-y-4 p-8">
    <DialogTitle>루틴 리포트</DialogTitle>
    <p className="text-4xl">✨</p>
    <p className="text-lg font-bold">프리미엄 루틴 리포트</p>
    <p className="text-2xl font-bold text-primary">₩4,900</p>
    <p className="text-sm text-muted-foreground">
      AI가 AM/PM 루틴, 성분 시너지, 주의 조합, 대체 제품을 분석합니다.
    </p>
    <Button
      variant="glow"
      className="w-full rounded-xl"
      onClick={() => {
        setPaymentOpen(false);
        navigate(`/report/report-${Date.now()}`);
      }}
    >
      결제 완료
    </Button>
    <Button
      variant="outline"
      className="w-full rounded-xl"
      onClick={() => setPaymentOpen(false)}
    >
      닫기
    </Button>
  </DialogContent>
</Dialog>
```
