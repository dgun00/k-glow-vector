# 프론트엔드 목업 싱글턴 프롬프트 — Route: `/saved`

> **프로젝트**: K-Beauty Whisperer (K-Glow AI Search)
> **라우터**: `/saved` (저장한 제품)
> **파일 위치**: `src/pages/SavedPage.tsx`
> **더미 데이터**: `src/data/routes/saved.json`
> **접근 권한**: Protected (로그인 필수)

---

## 중요 선언

이 프로젝트는 UI/UX 테스트용 프론트엔드 목업이다.

- 어떤 서버도 생성하지 않는다.
- fetch/axios 같은 네트워크 코드를 만들지 않는다.
- 환경변수를 요구하지 않는다.
- 실제 인증 시스템을 구현하지 않는다.
- **Next.js를 사용하지 않는다. React 18 + Vite 프로젝트다.**
- `next/router`, `next/link`, `next/navigation` 등 Next.js API를 사용하지 않는다.

모든 데이터는 `src/data/routes/saved.json` 로컬 파일에서 ES 모듈로 import한다.

```typescript
import savedJson from "../data/routes/saved.json";
```


인증 체크는 `isLoggedIn` 로컬 상태로 시뮬레이션한다.  
비로그인 시 `ProtectedRoute`가 `/auth?next=/saved` 로 redirect한다.  
저장 해제는 로컬 `products` 배열에서 해당 항목 제거로 처리한다.

---

## 기술 스택

| 항목 | 버전/도구 |
|---|---|
| 프레임워크 | React 18 + TypeScript + Vite |
| 라우팅 | React Router DOM v6 |
| 스타일링 | Tailwind CSS |
| 아이콘 | Lucide React (`Search`, `GitCompare`) |
| 컴포넌트 | shadcn/ui Button, Dialog (CompareModal) |
| 이미지 | `/assets/empty-saved.png` (빈 상태) |

---

## 라우팅 훅

```typescript
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

// 제품 상세 이동
navigate(`/p/${product.id}`);

// 홈 이동 (빈 상태)
navigate("/");
```

---

## 라우터 명세

### 목적

사용자가 저장한 K-뷰티 제품 목록 조회.  
비교 모드 진입 → 최대 3개 선택 → 비교 테이블 모달 표시.

### 진입 조건

- **Protected**: `isLoggedIn === true` 필수
- `isLoggedIn === false`: `navigate("/auth?next=/saved")` 자동 redirect
- `ProtectedRoute` 래퍼 컴포넌트로 감싸서 처리

---

## ASCII 레이아웃

### 정상 (success) 상태

```
┌─────────────────────────────────────────────────────────┐
│  HEADER (showSearch 모드)                               │
├─────────────────────────────────────────────────────────┤
│  MAIN (container, py-6, space-y-4)                      │
│                                                         │
│  ┌── 페이지 헤더 ────────────────────────────────────┐  │
│  │  저장한 제품              [⇄ 비교 모드] (outline) │  │
│  │  (text-2xl font-bold)     (비교 모드 활성: default)│  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ── [비교 모드 활성 + selected.length > 0 일 때] ──    │
│  ┌─────────────────────────────────────────────────┐   │
│  │  2/3 선택됨      [비교 보기] (glow, 2개 미만 disabled)│
│  │  (bg-glow-subtle p-3 rounded-xl)               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌── ProductCard ────────────────────────────────────┐  │
│  │  [☑] [이미지80x80] 그린티 씨드 세럼               │  │
│  │       이니스프리  |  스킨케어  |  1-3만            │  │
│  │       녹차 추출물이 항산화 작용을 하며...          │  │
│  │       [수분충전] [글로우] [진정]                  │  │
│  │       [♡ 저장 해제]             [상세 보기→]     │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌── ProductCard ────────────────────────────────────┐  │
│  │  [☑] [이미지] 워터뱅크 히알루론 세럼              │  │
│  │       ... (반복)                                   │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌── ProductCard ────────────────────────────────────┐  │
│  │  [ ] [이미지] 쿠션 파운데이션 N23                  │  │
│  │       ... (반복)                                   │  │
│  └───────────────────────────────────────────────────┘  │
│  (비교 모드: 카드 좌측 체크박스 표시, max 3개)         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  FOOTER                                                 │
└─────────────────────────────────────────────────────────┘
```

### 로딩 상태

```
┌─────────────────────────────────────────────────────────┐
│  (animate-pulse, space-y-3)                             │
│  [h-24 bg-muted rounded-xl]                             │
│  [h-24 bg-muted rounded-xl]                             │
│  [h-24 bg-muted rounded-xl]                             │
└─────────────────────────────────────────────────────────┘
```

### 빈 상태

```
┌─────────────────────────────────────────────────────────┐
│  (text-center py-16 space-y-4)                          │
│                                                         │
│         [empty-saved.png  128x128 object-contain]       │
│         저장한 제품이 없습니다                          │
│         (text-muted-foreground text-lg)                 │
│                                                         │
│         [🔍 검색하러 가기]  (glow 버튼, rounded-full)  │
└─────────────────────────────────────────────────────────┘
```

### CompareModal (오버레이)

```
┌─────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────┐   │
│  │  제품 비교                                   [X] │   │
│  ├──────────────────┬──────────────┬──────────────┤  │
│  │  속성            │  제품 A      │  제품 B      │  │
│  ├──────────────────┼──────────────┼──────────────┤  │
│  │  브랜드          │  이니스프리  │  라네즈      │  │
│  │  카테고리        │  스킨케어    │  스킨케어    │  │
│  │  가격대          │  1-3만       │  3-5만       │  │
│  │  피니시          │  글로우      │  글로우      │  │
│  │  톤핏            │  any         │  any         │  │
│  │  핵심 성분       │  녹차, 히알  │  히알, 글리  │  │
│  │  주의 성분       │  없음        │  없음        │  │
│  │  태그            │  수분, 진정  │  수분폭탄    │  │
│  └──────────────────┴──────────────┴──────────────┘  │
│                              [닫기]  (outline)          │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
(shadcn/ui Dialog 기반, max-w-3xl)
```

---

## JSON 더미 파일

**경로**: `src/data/routes/saved.json`

```json
{
  "__mock": { "mode": "success", "delay_ms": 500 },
  "view": {
    "savedProducts": [
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
        "texture_desc": "산뜻하게 흡수되며 끈적임 없이 수분을 채워줍니다.",
        "explain_short": "녹차 추출물이 항산화 작용을 하며 수분 세럼 중 가성비가 뛰어납니다.",
        "image_url": "/assets/products/skincare-default.jpg",
        "similar_ids": ["p002"]
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
        "texture_desc": "물처럼 가볍고 즉각적인 수분 공급.",
        "explain_short": "5중 히알루론산 복합체로 피부 깊숙이 수분을 공급합니다.",
        "image_url": "/assets/products/skincare-default.jpg",
        "similar_ids": ["p001"]
      },
      {
        "id": "p005",
        "name": "쿠션 파운데이션 N23",
        "brand": "클리오",
        "category": "base",
        "price_band": "3-5만",
        "finish": "새틴",
        "tone_fit": "cool",
        "tags": ["쿨톤", "커버력", "지속력"],
        "ingredients_top": ["티타늄디옥사이드", "징크옥사이드"],
        "ingredients_caution": ["향료"],
        "texture_desc": "가볍게 발리며 오래 지속되는 쿠션 타입.",
        "explain_short": "쿨톤 피부에 최적화된 N23 쉐이드.",
        "image_url": "/assets/products/makeup-default.jpg",
        "similar_ids": []
      }
    ]
  },
  "actions": {
    "saveToggle": { "description": "savedProducts 배열에서 해당 id 항목 제거 (로컬)" },
    "compareSelect": { "description": "selected 배열에 id 추가/제거 (max 3개)" },
    "openCompare": { "description": "compareOpen = true" },
    "closeCompare": { "description": "compareOpen = false" }
  }
}
```

---

## 상태 머신

| 상태 | 진입 조건 | UI |
|---|---|---|
| `loading` | 페이지 마운트 | animate-pulse skeleton ×3 |
| `success` | setTimeout 500ms 후 | ProductCard 목록 |
| `empty` | `products.length === 0` | empty-saved 이미지 + [검색하러 가기] |
| `compareMode` | `compareMode === true` | 각 카드에 체크박스 추가 |
| `compareReady` | `selected.length >= 2` | [비교 보기] 버튼 활성화 |

---

## 로컬 상태 정의

```typescript
const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);
const [compareMode, setCompareMode] = useState(false);
const [selected, setSelected] = useState<string[]>([]);
const [compareOpen, setCompareOpen] = useState(false);
```

---

## 버튼 목록 & 이벤트

### 1. "⇄ 비교 모드" 버튼
- **이벤트**: `TOGGLE_COMPARE_MODE`
- `compareMode === false` → `true`: 각 카드에 체크박스 표시
- `compareMode === true` → `false`: 체크박스 숨김, `selected = []` 초기화
- 활성 시 `variant="default"`, 비활성 시 `variant="outline"`
- **스타일**: `size="sm"`, `rounded-full`

### 2. 체크박스 클릭 (비교 모드 활성 시 각 카드)
- **이벤트**: `SELECT_FOR_COMPARE`
- `selected.length < 3` 이면 배열에 id 추가
- 이미 포함된 id면 배열에서 제거
- `selected.length === 3` 이면 새 선택 무시 (3개 초과 방지)

### 3. "비교 보기" 버튼
- **이벤트**: `OPEN_COMPARE_MODAL`
- **활성 조건**: `selected.length >= 2`
- **비활성 조건**: `selected.length < 2` → `disabled` 속성
- **클릭 시**: `setCompareOpen(true)`
- **스타일**: `variant="glow"`, `size="sm"`, `rounded-full`

### 4. ProductCard "♡ 저장 해제" 버튼
- **이벤트**: `UNSAVE_PRODUCT`
- **클릭 시**: `setProducts(prev => prev.filter(p => p.id !== product.id))`
- 제거 후 `products.length === 0` 이면 빈 상태 자동 전환

### 5. ProductCard "상세 보기 →"
- **이벤트**: `CLICK_PRODUCT_CARD`
- **클릭 시**: `navigate("/p/{product.id}")`

### 6. "🔍 검색하러 가기" 버튼 (빈 상태)
- **클릭 시**: `navigate("/")`
- **스타일**: `variant="glow"`, `rounded-full`

### 7. CompareModal [X] / "닫기" 버튼
- **이벤트**: `CLOSE_COMPARE_MODAL`
- **클릭 시**: `setCompareOpen(false)`

---

## CompareModal 상세 명세

### 표시 데이터
`selected` 배열의 id에 해당하는 `products` 객체 2~3개를 비교 테이블로 표시.

### 비교 항목 (행)
1. 브랜드 (`brand`)
2. 카테고리 (`category` → `categoryLabel` 매핑)
3. 가격대 (`price_band`)
4. 피니시 (`finish`)
5. 톤핏 (`tone_fit`)
6. 핵심 성분 (`ingredients_top.slice(0,3).join(", ")`)
7. 주의 성분 (`ingredients_caution.join(", ")` 또는 "없음")
8. 태그 (`tags.slice(0,3).join(", ")`)

### 컴포넌트 구조
```
<Dialog open={compareOpen} onOpenChange={setCompareOpen}>
  <DialogContent className="max-w-3xl">
    <DialogHeader>
      <DialogTitle>제품 비교</DialogTitle>
    </DialogHeader>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>속성</TableHead>
          {selectedProducts.map(p => <TableHead>{p.name}</TableHead>)}
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* 각 속성 행 */}
      </TableBody>
    </Table>
    <Button onClick={() => setCompareOpen(false)}>닫기</Button>
  </DialogContent>
</Dialog>
```
