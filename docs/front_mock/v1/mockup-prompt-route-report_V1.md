# 프론트엔드 목업 싱글턴 프롬프트 — Route: `/report/:reportId`

> **프로젝트**: K-Beauty Whisperer (K-Glow AI Search)
> **라우터**: `/report/:reportId`
> **파일 위치**: `src/pages/ReportPage.tsx`
> **더미 데이터**: `src/data/routes/report.json`
> **접근 권한**: Protected (로그인 필수)

---

## 중요 선언

이 프로젝트는 UI/UX 테스트용 프론트엔드 목업이다.

- 어떤 서버도 생성하지 않는다.
- fetch/axios 같은 네트워크 코드를 만들지 않는다.
- 환경변수를 요구하지 않는다.
- **Next.js를 사용하지 않는다. React 18 + Vite 프로젝트다.**
- `next/router`, `next/link`, `next/navigation` 등 Next.js API를 사용하지 않는다.

모든 데이터는 `src/data/routes/report.json` 로컬 파일에서 ES 모듈로 import한다.

```typescript
import reportJson from "../data/routes/report.json";
```


`:reportId` URL 파라미터로 `reports[reportId]` 객체를 매칭한다.  
`"report-"` 로 시작하는 동적 ID(PaymentModal 생성)는 `"default"` 리포트로 fallback한다.  
공유는 `navigator.clipboard` + Sonner toast로 시뮬레이션한다.  
PDF 다운로드는 `toast.info("PDF 다운로드는 준비 중입니다")` 로 처리한다.

---

## 기술 스택

| 항목 | 버전/도구 |
|---|---|
| 프레임워크 | React 18 + TypeScript + Vite |
| 라우팅 | React Router DOM v6 (`useParams`) |
| 스타일링 | Tailwind CSS |
| 아이콘 | Lucide React (`Share2`, `FileText`, `Search`, `Sun`, `Moon`) |
| 컴포넌트 | shadcn/ui Button |
| 토스트 | Sonner |

---

## 라우팅 훅

```typescript
import { useParams, useNavigate } from "react-router-dom";

const { reportId } = useParams<{ reportId: string }>();
const navigate = useNavigate();

// "report-{timestamp}" → "default" fallback 처리
const resolvedId = reportId?.startsWith("report-") ? "default" : reportId;

// 홈 이동
navigate("/");

// 대체 제품 이동
navigate(`/p/${altProduct.id}`);
```

---

## 라우터 명세

### 목적

AI가 생성한 K-뷰티 루틴 리포트를 표시한다.  
요약, AM/PM 루틴, 조합 근거, 주의 조합, 대체 제품을 섹션별로 제공한다.  
공유 링크 복사 및 PDF 다운로드 CTA를 포함한다.

### 진입 조건

- **Protected**: `isLoggedIn === true` 필수
- `:reportId` URL 파라미터 필수
- `PaymentModal` "결제 완료" 후 `navigate("/report/report-{timestamp}")` 진입
- `"report-"` 접두사 ID → JSON `reports["default"]` fallback
- JSON에 없는 ID → "리포트를 찾을 수 없습니다" 상태

---

## ASCII 레이아웃

### 정상 (success) 상태

```
┌─────────────────────────────────────────────────────────┐
│  HEADER (showSearch 모드)                               │
├─────────────────────────────────────────────────────────┤
│  MAIN (container max-w-3xl, py-6, space-y-6)            │
│                                                         │
│  ┌── 리포트 헤더 ────────────────────────────────────┐  │
│  │  글로우 피부 맞춤 K-뷰티 루틴 리포트             │  │
│  │  2026. 2. 26.                                     │  │
│  │                                                   │  │
│  │  [↗ 공유] (outline sm)                           │  │
│  │  [📄 PDF] (outline sm)                           │  │
│  │  [🔍 새 검색] (glow sm)                          │  │
│  │  (sm: flex-row, xs: flex-col 배치)               │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌── 요약 (gradient-glow-subtle p-5 rounded-xl) ──────┐ │
│  │  요약                                              │ │
│  │  지성·쿨톤 피부를 위한 글로우 중심 루틴입니다.    │ │
│  │  수분-광채 밸런스를 유지하면서도 과도한 유분을    │ │
│  │  제어하는 성분 조합으로 구성했습니다.             │ │
│  │  (text-sm text-muted-foreground leading-relaxed)  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌── AM/PM 루틴 (grid sm:grid-cols-2 gap-4) ──────────┐ │
│  │  ┌──────────────────────┐  ┌──────────────────────┐ │
│  │  │ ☀ AM 루틴           │  │ 🌙 PM 루틴          │ │
│  │  │ (Sun 아이콘, accent) │  │ (Moon 아이콘, primary)│ │
│  │  │                      │  │                      │ │
│  │  │ 1단계: 폼 클렌징     │  │ 1단계: 오일 클렌징   │ │
│  │  │ 2단계: 토너          │  │ 2단계: 폼 클렌징     │ │
│  │  │ 3단계: 세럼 (그린티) │  │ 3단계: 앰플 (비타C)  │ │
│  │  │ 4단계: 수분크림      │  │ 4단계: 세럼          │ │
│  │  │ 5단계: 선크림        │  │ 5단계: 나이트 크림   │ │
│  │  │ (text-sm, space-y-3)│  │ (text-sm, space-y-3)│ │
│  │  └──────────────────────┘  └──────────────────────┘ │
│  │  (각 카드: bg-card border border-border p-5 rounded-xl)│
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌── 조합 근거 ────────────────────────────────────────┐ │
│  │  조합 근거                                          │ │
│  │  ┌──────────────────────────────────────────────┐  │ │
│  │  │ • 히알루론산과 녹차 추출물은 수분·진정 시너지│  │ │
│  │  │ • 비타민C는 PM에만 사용해 산화 방지           │  │ │
│  │  │ • 지성 피부에 과도한 오일 성분 제한           │  │ │
│  │  │ • 쿨톤 피부에 블루 히알루론이 광채 강조       │  │ │
│  │  └──────────────────────────────────────────────┘  │ │
│  │  (각 항목: flex gap-2, 불릿: h-1.5 w-1.5 rounded   │ │
│  │   -full bg-primary mt-2 flex-shrink-0)             │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌── ⚠ 주의 조합 (warnings.length > 0 일 때만) ──────┐ │
│  │  ⚠ 주의 조합                                       │ │
│  │  (text-destructive font-semibold)                  │ │
│  │  ┌──────────────────────────────────────────────┐  │ │
│  │  │ border border-destructive/30                 │  │ │
│  │  │ bg-destructive/5 p-4 rounded-xl space-y-2    │  │ │
│  │  │                                               │  │ │
│  │  │ 레티놀과 비타민C를 같은 날 함께 사용하면      │  │ │
│  │  │ 자극이 생길 수 있습니다.                      │  │ │
│  │  │ 레티놀은 비타C 제품과 격일 사용을 권장합니다. │  │ │
│  │  └──────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌── 대체 제품 (altProducts.length > 0 일 때만) ──────┐ │
│  │  대체 제품                                          │ │
│  │  ┌──────┐  ┌──────┐  ┌──────┐                    │ │
│  │  │이미지│  │이미지│  │이미지│                    │ │
│  │  │1:1   │  │1:1   │  │1:1   │                    │ │
│  │  └──────┘  └──────┘  └──────┘                    │ │
│  │  제품명    제품명    제품명                        │ │
│  │  브랜드    브랜드    브랜드                        │ │
│  │  (grid grid-cols-2 sm:grid-cols-3 gap-3)          │ │
│  │  (hover: glow-shadow, cursor-pointer)             │ │
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
│  MAIN (py-8)                                            │
│  [h-64 w-full bg-muted rounded-xl animate-pulse]        │
└─────────────────────────────────────────────────────────┘
```

### 리포트 없음 상태

```
┌─────────────────────────────────────────────────────────┐
│  HEADER                                                 │
│  MAIN (py-16 text-center space-y-4)                     │
│  리포트를 찾을 수 없습니다.                             │
│  (text-muted-foreground)                                │
│  [홈으로]  (outline 버튼)                               │
│  FOOTER                                                 │
└─────────────────────────────────────────────────────────┘
```

---

## JSON 더미 파일

**경로**: `src/data/routes/report.json`

```json
{
  "__mock": { "mode": "success", "delay_ms": 700 },
  "reports": {
    "default": {
      "reportId": "default",
      "title": "글로우 피부 맞춤 K-뷰티 루틴 리포트",
      "created_at": "2026-02-26T10:00:00Z",
      "summary": "지성·쿨톤 피부를 위한 글로우 중심 루틴입니다. 수분-광채 밸런스를 유지하면서도 과도한 유분을 제어하는 성분 조합으로 구성했습니다.",
      "routine_am": [
        "1단계: 폼 클렌징 (저자극 계면활성제)",
        "2단계: 토너 (히알루론산 함유)",
        "3단계: 세럼 — 그린티 씨드 세럼 (이니스프리)",
        "4단계: 가벼운 젤 수분크림",
        "5단계: 선크림 SPF50+ PA++++"
      ],
      "routine_pm": [
        "1단계: 오일 클렌징",
        "2단계: 폼 클렌징 (더블 클렌징)",
        "3단계: 앰플 — 비타C 브라이트닝 앰플 (격일 사용)",
        "4단계: 세럼 — 워터뱅크 히알루론 세럼 (라네즈)",
        "5단계: 나이트 크림 (가벼운 텍스처)"
      ],
      "reasoning": [
        "히알루론산과 녹차 추출물은 수분 공급·진정 효과에서 시너지를 발휘합니다.",
        "비타민C는 자외선에 불안정하므로 PM에만 사용해 산화를 방지합니다.",
        "지성 피부에 과도한 오일 성분 대신 젤 타입 제형을 우선 선택했습니다.",
        "쿨톤 피부에는 블루 히알루론 성분이 밝고 투명한 광채를 강조합니다."
      ],
      "warnings": [
        "레티놀과 비타민C를 같은 날 함께 사용하면 자극이 생길 수 있습니다. 격일 사용을 권장합니다.",
        "AHA/BHA 계열 성분과 레티놀 동시 사용은 피부 장벽 손상을 유발할 수 있습니다."
      ],
      "alternatives": ["p003", "p004", "p005"]
    }
  },
  "alternativeProducts": {
    "p003": {
      "id": "p003",
      "name": "비타C 브라이트닝 앰플",
      "brand": "some by mi",
      "image_url": "/assets/products/skincare-default.jpg"
    },
    "p004": {
      "id": "p004",
      "name": "세라마이드 나이트 크림",
      "brand": "닥터자르트",
      "image_url": "/assets/products/skincare-default.jpg"
    },
    "p005": {
      "id": "p005",
      "name": "쿠션 파운데이션 N23",
      "brand": "클리오",
      "image_url": "/assets/products/makeup-default.jpg"
    }
  }
}
```

---

## 상태 머신

| 상태 | 진입 조건 | UI |
|---|---|---|
| `loading` | 페이지 마운트 | animate-pulse h-64 skeleton |
| `success` | setTimeout 700ms 후 | 모든 섹션 렌더 |
| `not-found` | `reports[resolvedId]` 없음 | "리포트를 찾을 수 없습니다" + [홈으로] |

---

## 로컬 상태 정의

```typescript
const [report, setReport] = useState<Report | null>(null);
const [altProducts, setAltProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);
```

**초기화 로직 (reportId 매핑)**:
```typescript
useEffect(() => {
  setLoading(true);
  setTimeout(() => {
    // "report-{timestamp}" 형태이면 "default" fallback
    const resolvedId = reportId?.startsWith("report-") ? "default" : reportId;
    const data = reportJson.reports[resolvedId ?? ""];
    if (data) {
      setReport(data);
      const alts = data.alternatives
        .map(id => reportJson.alternativeProducts[id])
        .filter(Boolean);
      setAltProducts(alts);
    }
    setLoading(false);
  }, 700);
}, [reportId]);
```

---

## 버튼 목록 & 이벤트

### 1. "↗ 공유" 버튼
- **이벤트**: `SHARE_REPORT`
- **클릭 시**: `navigator.clipboard.writeText(window.location.href)` → `toast.success("링크 복사됨")`
- **스타일**: `variant="outline"`, `size="sm"`, `rounded-full`

### 2. "📄 PDF" 버튼
- **이벤트**: `DOWNLOAD_PDF`
- **클릭 시**: `toast.info("PDF 다운로드는 준비 중입니다")`
- **스타일**: `variant="outline"`, `size="sm"`, `rounded-full`

### 3. "🔍 새 검색" 버튼
- **이벤트**: `START_NEW_SEARCH`
- **클릭 시**: `navigate("/")`
- **스타일**: `variant="glow"`, `size="sm"`, `rounded-full`

### 4. 대체 제품 카드 클릭
- **이벤트**: `CLICK_ALTERNATIVE_PRODUCT`
- **클릭 시**: `navigate("/p/{altProduct.id}")`
- **hover**: `glow-shadow` CSS transition
- **이미지**: `loading="lazy"`, `aspect-square`, `rounded-lg`

---

## 섹션별 스타일 명세

| 섹션 | 배경/스타일 |
|---|---|
| 요약 박스 | `rounded-xl gradient-glow-subtle p-5` |
| AM 루틴 카드 | `rounded-xl bg-card border border-border p-5`, `Sun` 아이콘 `text-accent` |
| PM 루틴 카드 | `rounded-xl bg-card border border-border p-5`, `Moon` 아이콘 `text-primary` |
| 조합 근거 불릿 | `h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0` |
| 주의 조합 박스 | `rounded-xl border border-destructive/30 bg-destructive/5 p-4` |
| 주의 조합 제목 | `font-semibold text-destructive` |
| 대체 제품 카드 | `rounded-xl bg-card border border-border p-3 hover:glow-shadow cursor-pointer` |

---

## Report 타입 정의

```typescript
interface Report {
  reportId: string;
  title: string;
  created_at: string;
  summary: string;
  routine_am: string[];   // 단계별 문자열 배열
  routine_pm: string[];   // 단계별 문자열 배열
  reasoning: string[];    // 조합 근거 배열
  warnings: string[];     // 주의 조합 배열 (비어있을 수 있음)
  alternatives: string[]; // 대체 제품 id 배열
}
```
