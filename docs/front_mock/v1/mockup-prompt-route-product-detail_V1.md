# 프론트엔드 목업 싱글턴 프롬프트 — Route: `/p/:productId`

> **프로젝트**: K-Beauty Whisperer (K-Glow AI Search)
> **라우터**: `/p/:productId`
> **파일 위치**: `src/pages/ProductDetail.tsx`
> **더미 데이터**: `src/data/routes/product-detail.json`

---

## 중요 선언

이 프로젝트는 UI/UX 테스트용 프론트엔드 목업이다.

- 어떤 서버도 생성하지 않는다.
- fetch/axios 같은 네트워크 코드를 만들지 않는다.
- 환경변수를 요구하지 않는다.
- **Next.js를 사용하지 않는다. React 18 + Vite 프로젝트다.**
- `next/router`, `next/link`, `next/navigation` 등 Next.js API를 사용하지 않는다.

모든 데이터는 `src/data/routes/product-detail.json` 로컬 파일에서 ES 모듈로 import한다.

```typescript
import productDetailJson from "../data/routes/product-detail.json";
```


`productId` URL 파라미터로 JSON 내 `products[productId]` 객체를 매칭한다.  
로딩은 `setTimeout(800)` 으로 시뮬레이션한다.  
저장 토글은 로컬 상태 변화로만 처리한다.

---

## 기술 스택

| 항목 | 버전/도구 |
|---|---|
| 프레임워크 | React 18 + TypeScript + Vite |
| 라우팅 | React Router DOM v6 (`useParams`, `useNavigate`) |
| 스타일링 | Tailwind CSS |
| 애니메이션 | Framer Motion |
| 아이콘 | Lucide React (`ArrowLeft`, `Heart`, `Share2`, `Sparkles`, `ChevronDown`) |
| 컴포넌트 | shadcn/ui Button |
| 토스트 | Sonner |

---

## 라우팅 훅

```typescript
import { useParams, useNavigate } from "react-router-dom";

const { productId } = useParams<{ productId: string }>();
const navigate = useNavigate();

// 뒤로 가기
navigate(-1);

// 유사 제품 이동
navigate(`/p/${similar.id}`);

// 인증 필요 시
navigate(`/auth?next=/p/${productId}&intent=save`);
```

---

## 라우터 명세

### 목적

개별 제품의 상세 정보, 추천 근거, 성분 분석, 사용감/제형,  
유사 제품 그리드, 루틴 리포트 CTA를 제공한다.

### 진입 조건

- Public (비로그인도 열람 가능)
- `:productId` URL 파라미터 필수
- JSON에 없는 `productId` → "제품을 찾을 수 없습니다" 상태 표시

---

## ASCII 레이아웃

### 정상 (success) 상태

```
┌─────────────────────────────────────────────────────────┐
│  HEADER (showSearch 모드)                               │
│  [K-Glow 로고]  [검색창 compact]  [다크모드] [저장] [계정]│
├─────────────────────────────────────────────────────────┤
│  MAIN (container max-w-4xl, py-6, space-y-8)            │
│                                                         │
│  ← 뒤로  (navigate(-1), text-muted-foreground)         │
│                                                         │
│  ┌── 제품 Hero (motion.div opacity 0→1) ──────────────┐ │
│  │  ┌──────────────────┐  이니스프리 그린티 씨드 세럼  │ │
│  │  │                  │  이니스프리                   │ │
│  │  │    제품 이미지   │                               │ │
│  │  │    320x320       │  [스킨케어] [글로우]          │ │
│  │  │    rounded-2xl   │  [any] [1-3만]                │ │
│  │  │    object-cover  │  (rounded-full 뱃지)          │ │
│  │  │                  │                               │ │
│  │  └──────────────────┘  [♡ 저장] [↗ 공유]          │ │
│  │  (md: flex-row, sm 이하: flex-col)                  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌── 추천 근거 ────────────────────────────────────────┐ │
│  │  추천 근거                                          │ │
│  │  ┌──────────────────────────────────────────────┐  │ │
│  │  │ (gradient-glow-subtle 배경, p-4, rounded-xl) │  │ │
│  │  │ 녹차 추출물이 항산화 작용을 하며              │  │ │
│  │  │ 수분 세럼 중 가성비가 뛰어납니다.             │  │ │
│  │  │                                               │  │ │
│  │  │  • 수분충전에 효과적인 히알루론산 함유         │  │ │
│  │  │  • 민감 피부에도 자극 없는 진정 성분          │  │ │
│  │  │  • 가볍고 산뜻한 흡수력                       │  │ │
│  │  └──────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌── 성분 요약 ────────────────────────────────────────┐ │
│  │  성분 요약                                          │ │
│  │  핵심 성분: 녹차추출물, 히알루론산, 판테놀          │ │
│  │  주의 성분: (없음 또는 text-destructive 표시)      │ │
│  │                                                     │ │
│  │  [전체 성분 보기 ∨]  ← ChevronDown 토글 버튼       │ │
│  │                                                     │ │
│  │  (펼쳐진 상태)                                     │ │
│  │  ┌──────────────────────────────────────────────┐  │ │
│  │  │ bg-muted p-3 rounded-lg                      │  │ │
│  │  │ 녹차추출물, 히알루론산, 판테놀,              │  │ │
│  │  │ 정제수, 글리세린, 부틸렌글라이콜             │  │ │
│  │  └──────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌── 사용감 / 제형 ────────────────────────────────────┐ │
│  │  사용감 / 제형                                      │ │
│  │  [수분충전] [글로우] [진정] [산뜻한]  ← tags 앞 4개│ │
│  │  산뜻하게 흡수되며 끈적임 없이 수분을 채워줍니다.  │ │
│  │  (text-muted-foreground, text-sm)                  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌── 유사 제품 (similar_ids 있을 때만) ───────────────┐ │
│  │  유사 제품                                          │ │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐          │ │
│  │  │이미지│  │이미지│  │이미지│  │이미지│          │ │
│  │  │aspect│  │aspect│  │aspect│  │aspect│          │ │
│  │  │square│  │square│  │square│  │square│          │ │
│  │  └──────┘  └──────┘  └──────┘  └──────┘          │ │
│  │  제품명    제품명    제품명    제품명              │ │
│  │  브랜드    브랜드    브랜드    브랜드              │ │
│  │  (grid-cols-2 sm:3 md:4, hover: glow-shadow)      │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌── 루틴 리포트 CTA (gradient-glow 배경) ────────────┐ │
│  │           ✨ (Sparkles 아이콘)                      │ │
│  │  이 제품 포함 루틴 리포트 만들기                    │ │
│  │  AI가 AM/PM 루틴, 주의 조합, 대체 제품을 분석합니다│ │
│  │                                                     │ │
│  │       [리포트 만들기 — ₩4,900]  (secondary 버튼)  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  FOOTER                                                 │
└─────────────────────────────────────────────────────────┘
```

### 로딩 상태

```
┌─────────────────────────────────────────────────────────┐
│  HEADER                                                 │
│  MAIN (animate-pulse)                                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │  [h-64 w-full bg-muted rounded-xl]               │  │
│  └──────────────────────────────────────────────────┘  │
│  [h-6 w-1/3 bg-muted rounded]                          │
│  [h-4 w-1/4 bg-muted rounded]                          │
└─────────────────────────────────────────────────────────┘
```

### 제품 없음 상태

```
┌─────────────────────────────────────────────────────────┐
│  HEADER                                                 │
│  MAIN (py-16 text-center, space-y-4)                    │
│  제품을 찾을 수 없습니다.                               │
│  (text-muted-foreground)                                │
│  [홈으로]  (outline 버튼)                               │
│  FOOTER                                                 │
└─────────────────────────────────────────────────────────┘
```

---

## JSON 더미 파일

**경로**: `src/data/routes/product-detail.json`

```json
{
  "__mock": { "mode": "success", "delay_ms": 800 },
  "products": {
    "p001": {
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
      "texture_desc": "산뜻하게 흡수되며 끈적임 없이 수분을 채워줍니다.",
      "explain_short": "녹차 추출물이 항산화 작용을 하며 수분 세럼 중 가성비가 뛰어납니다.",
      "image_url": "/assets/products/skincare-default.jpg",
      "similar_ids": ["p002", "p003", "p004"]
    },
    "p002": {
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
      "texture_desc": "물처럼 가볍고 즉각적인 수분 공급으로 피부 장벽을 강화합니다.",
      "explain_short": "5중 히알루론산 복합체로 피부 깊숙이 수분을 공급합니다.",
      "image_url": "/assets/products/skincare-default.jpg",
      "similar_ids": ["p001", "p003"]
    },
    "p003": {
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
      "texture_desc": "가벼운 에센스 타입으로 흡수가 빠르고 밝은 피부 표현에 효과적입니다.",
      "explain_short": "비타민C 유도체로 잡티를 개선하고 글로우 피부를 완성합니다.",
      "image_url": "/assets/products/skincare-default.jpg",
      "similar_ids": ["p001", "p002"]
    },
    "p004": {
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
      "texture_desc": "풍부하고 영양감 있는 크림으로 수면 중 피부 장벽을 회복시킵니다.",
      "explain_short": "5가지 세라마이드로 손상된 피부 장벽을 빠르게 회복합니다.",
      "image_url": "/assets/products/skincare-default.jpg",
      "similar_ids": ["p001"]
    },
    "p005": {
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
      "texture_desc": "가볍게 발리며 오래 지속되는 쿠션 타입.",
      "explain_short": "쿨톤 피부에 최적화된 N23 쉐이드로 자연스러운 커버를 제공합니다.",
      "image_url": "/assets/products/makeup-default.jpg",
      "similar_ids": ["p002"]
    }
  },
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
    "share": { "description": "navigator.clipboard → toast '링크가 복사되었습니다'" },
    "toggleIngredients": { "description": "showIngredients 불리언 토글" },
    "openPayment": { "description": "PaymentModal open=true" },
    "clickSimilar": { "description": "navigate('/p/{similar.id}')" }
  }
}
```

---

## 상태 머신

| 상태 | 진입 조건 | UI |
|---|---|---|
| `loading` | 페이지 마운트 | animate-pulse skeleton (h-64 + h-6 + h-4) |
| `success` | setTimeout 800ms 후 | 모든 섹션 렌더 |
| `not-found` | `products[productId]` 없음 | "제품을 찾을 수 없습니다" + [홈으로] |

---

## 로컬 상태 정의

```typescript
const [product, setProduct] = useState<Product | null>(null);
const [similar, setSimilar] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);
const [saved, setSaved] = useState(false);
const [showIngredients, setShowIngredients] = useState(false);
const [paymentOpen, setPaymentOpen] = useState(false);
```

**초기화 로직**:
```typescript
useEffect(() => {
  setLoading(true);
  setTimeout(() => {
    const data = productDetailJson.products[productId];
    if (data) {
      setProduct(data);
      const simIds = data.similar_ids || [];
      setSimilar(simIds.map(id => productDetailJson.products[id]).filter(Boolean));
      setSaved(productDetailJson.view.savedProductIds.includes(productId));
    }
    setLoading(false);
  }, 800);
}, [productId]);
```

---

## 버튼 목록 & 이벤트

### 1. "← 뒤로" 버튼
- **이벤트**: `NAVIGATE_BACK`
- **클릭 시**: `navigate(-1)`
- **스타일**: `flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground`

### 2. "♡ 저장" / "저장됨" 버튼
- **이벤트**: `SAVE_TOGGLE`
- `isLoggedIn === false` → `navigate("/auth?next=/p/{productId}&intent=save")`
- `isLoggedIn === true` → `saved` 불리언 토글
- `saved === true`: `variant="default"`, `Heart` 아이콘 `fill-current`, 텍스트 "저장됨"
- `saved === false`: `variant="outline"`, `Heart` 아이콘 일반, 텍스트 "저장"
- **크기**: `size="sm"`, `rounded-full`

### 3. "↗ 공유" 버튼
- **이벤트**: `SHARE_PRODUCT`
- **클릭 시**: `toast.success("링크가 복사되었습니다")`
- **스타일**: `variant="outline"`, `size="sm"`, `rounded-full`

### 4. "전체 성분 보기 ∨" 토글
- **이벤트**: `TOGGLE_INGREDIENTS`
- **클릭 시**: `setShowIngredients(!showIngredients)`
- `showIngredients === true`: `ChevronDown` 아이콘 `rotate-180` (CSS transition)
- `showIngredients === false`: 기본 방향
- 전체 성분 박스: `text-xs text-muted-foreground bg-muted p-3 rounded-lg`

### 5. 유사 제품 카드 클릭
- **이벤트**: `CLICK_SIMILAR_PRODUCT`
- **클릭 시**: `navigate("/p/{similar.id}")`
- **hover**: `glow-shadow` 효과 (CSS transition)
- **로딩**: `loading="lazy"` img 속성

### 6. "리포트 만들기 — ₩4,900" 버튼
- **이벤트**: `OPEN_PAYMENT_MODAL`
- `isLoggedIn === false` → `navigate("/auth?next=/p/{productId}&intent=buy_report")`
- `isLoggedIn === true` → `setPaymentOpen(true)`
- **스타일**: `variant="secondary"`, `rounded-full`

---

## 섹션별 스타일 명세

| 섹션 | 배경/스타일 |
|---|---|
| 추천 근거 박스 | `rounded-xl gradient-glow-subtle p-4` |
| 성분 전체 보기 박스 | `text-xs text-muted-foreground bg-muted p-3 rounded-lg` |
| 사용감 태그 | `text-xs px-2.5 py-1 rounded-full bg-card border border-border` |
| 유사 제품 카드 | `rounded-xl bg-card border border-border p-3 hover:glow-shadow` |
| 루틴 CTA 배너 | `rounded-2xl gradient-glow p-6 text-center` |

---

## 카테고리 레이블 매핑

```typescript
const categoryLabel: Record<string, string> = {
  skincare: "스킨케어",
  base: "베이스",
  lip: "립",
  eye: "아이",
  suncare: "선케어",
};
```
