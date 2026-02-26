# 프론트엔드 목업 싱글턴 프롬프트 — Route: `/account`

> **프로젝트**: K-Beauty Whisperer (K-Glow AI Search)
> **라우터**: `/account` (계정 / 내 조건)
> **파일 위치**: `src/pages/AccountPage.tsx`
> **더미 데이터**: `src/data/routes/account.json`
> **접근 권한**: Protected (로그인 필수)

---

## 중요 선언

이 프로젝트는 UI/UX 테스트용 프론트엔드 목업이다.

- 어떤 서버도 생성하지 않는다.
- fetch/axios 같은 네트워크 코드를 만들지 않는다.
- 환경변수를 요구하지 않는다.
- **Next.js를 사용하지 않는다. React 18 + Vite 프로젝트다.**
- `next/router`, `next/link`, `next/navigation` 등 Next.js API를 사용하지 않는다.

모든 데이터는 `src/data/routes/account.json` 로컬 파일에서 ES 모듈로 import한다.

```typescript
import accountJson from "../data/routes/account.json";
```


선호도 저장은 로컬 상태 유지 + Sonner `toast.success()` 로 시뮬레이션한다.  
초기화는 로컬 상태를 빈 값으로 리셋한다.

---

## 기술 스택

| 항목 | 버전/도구 |
|---|---|
| 프레임워크 | React 18 + TypeScript + Vite |
| 라우팅 | React Router DOM v6 |
| 스타일링 | Tailwind CSS |
| 아이콘 | Lucide React (없음, 커스텀 토글 스위치) |
| 컴포넌트 | shadcn/ui Button |
| 토스트 | Sonner (`toast.success`) |

---

## 라우팅 훅

```typescript
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

// 검색 로그 재실행
navigate(`/search?q=${encodeURIComponent(log.query)}`);
```

---

## 라우터 명세

### 목적

사용자의 피부 조건 선호도(내 조건)를 설정·저장하고,  
과거 검색 로그 이력을 확인하며 재실행할 수 있다.

### 진입 조건

- **Protected**: `isLoggedIn === true` 필수
- `isLoggedIn === false`: `navigate("/auth?next=/account")` redirect
- 탭 기반 레이아웃: "내 조건" / "검색 로그" 전환

---

## ASCII 레이아웃

### 정상 (success) 상태 — TAB: 내 조건

```
┌─────────────────────────────────────────────────────────┐
│  HEADER (showSearch 모드)                               │
├─────────────────────────────────────────────────────────┤
│  MAIN (container, py-6, space-y-4)                      │
│                                                         │
│  계정                                                   │
│  (text-2xl font-bold text-foreground)                  │
│                                                         │
│  ┌── 탭 네비게이션 ────────────────────────────────┐   │
│  │  [bg-muted p-1 rounded-xl w-fit]               │   │
│  │  ┌──────────────┐  ┌──────────────┐            │   │
│  │  │  내 조건  ●  │  │  검색 로그  │            │   │
│  │  │ (bg-card     │  │ (text-muted- │            │   │
│  │  │  shadow-sm)  │  │  foreground) │            │   │
│  │  └──────────────┘  └──────────────┘            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌── 선호도 폼 (bg-card border border-border rounded-xl p-6) ┐
│  │                                                       │
│  │  피부 타입                                            │
│  │  [건성]  [지성●]  [복합]  [민감]                    │
│  │  (chip 버튼: 선택됨=variant default, 미선택=chip)   │
│  │                                                       │
│  │  톤                                                   │
│  │  [웜]  [쿨●]  [뉴트럴]  [모름]                     │
│  │                                                       │
│  │  고민  (복수 선택 가능)                               │
│  │  [홍조●]  [트러블]  [속건조●]  [모공]              │
│  │  [각질]   [잡티]   [주름]     [다크서클]            │
│  │                                                       │
│  │  무향 선호                                            │
│  │  ●────○  (토글 스위치, primary 색상)               │
│  │  (ON: bg-primary, OFF: bg-muted)                    │
│  │  (썸: w-4 h-4 rounded-full bg-primary-foreground)  │
│  │  (ON: translate-x-5, OFF: translate-x-0)           │
│  │                                                       │
│  │  제외 성분  (복수 선택 가능)                          │
│  │  [향료●]  [에탄올]  [실리콘]  [파라벤]             │
│  │                                                       │
│  │  예산  (단일 선택)                                    │
│  │  [1-3만●]  [3-5만]  [5만+]                         │
│  │                                                       │
│  │  ┌──────────────┐  ┌──────────────┐                 │
│  │  │  저장  (glow) │  │ 초기화(outline)│               │
│  │  └──────────────┘  └──────────────┘                 │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  FOOTER                                                 │
└─────────────────────────────────────────────────────────┘
```

### TAB: 검색 로그

```
┌─────────────────────────────────────────────────────────┐
│  [탭 네비게이션 — 검색 로그 활성]                       │
│                                                         │
│  ┌── 검색 기록 (bg-card border divide-y divide-border)┐ │
│  │  ┌───────────────────────────────────────────────┐ │ │
│  │  │  "글로우 세럼"                                │ │ │
│  │  │  2026. 2. 24.             [다시 보기] (ghost) │ │ │
│  │  ├───────────────────────────────────────────────┤ │ │
│  │  │  "쿨톤 쿠션 파운데이션"                       │ │ │
│  │  │  2026. 2. 23.             [다시 보기]         │ │ │
│  │  ├───────────────────────────────────────────────┤ │ │
│  │  │  "무향 수분크림 민감 피부"                    │ │ │
│  │  │  2026. 2. 22.             [다시 보기]         │ │ │
│  │  ├───────────────────────────────────────────────┤ │ │
│  │  │  "레티놀 세럼 초보자"                         │ │ │
│  │  │  2026. 2. 21.             [다시 보기]         │ │ │
│  │  ├───────────────────────────────────────────────┤ │ │
│  │  │  "진정 앰플 트러블성 피부"                    │ │ │
│  │  │  2026. 2. 20.             [다시 보기]         │ │ │
│  │  └───────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 로딩 상태

```
┌─────────────────────────────────────────────────────────┐
│  [h-48 w-full bg-muted rounded-xl animate-pulse]        │
└─────────────────────────────────────────────────────────┘
```

### 검색 로그 없음

```
┌─────────────────────────────────────────────────────────┐
│  p-6 text-center text-muted-foreground                  │
│  "검색 기록이 없습니다"                                 │
└─────────────────────────────────────────────────────────┘
```

---

## JSON 더미 파일

**경로**: `src/data/routes/account.json`

```json
{
  "__mock": { "mode": "success", "delay_ms": 600 },
  "view": {
    "preferences": {
      "skin_type": "지성",
      "tone": "쿨",
      "concerns": ["홍조", "속건조"],
      "fragrance_free": true,
      "exclude_ingredients": ["향료"],
      "budget_band": "1-3만"
    },
    "searchLogs": [
      { "query": "글로우 세럼", "created_at": "2026-02-24T10:30:00Z", "result_count": 18 },
      { "query": "쿨톤 쿠션 파운데이션", "created_at": "2026-02-23T14:00:00Z", "result_count": 11 },
      { "query": "무향 수분크림 민감 피부", "created_at": "2026-02-22T09:15:00Z", "result_count": 24 },
      { "query": "레티놀 세럼 초보자", "created_at": "2026-02-21T18:00:00Z", "result_count": 9 },
      { "query": "진정 앰플 트러블성 피부", "created_at": "2026-02-20T11:20:00Z", "result_count": 15 }
    ]
  },
  "options": {
    "skinTypes": ["건성", "지성", "복합", "민감"],
    "tones": ["웜", "쿨", "뉴트럴", "모름"],
    "concerns": ["홍조", "트러블", "속건조", "모공", "각질", "잡티", "주름", "다크서클"],
    "excludeOpts": ["향료", "에탄올", "실리콘", "파라벤"],
    "budgets": ["1-3만", "3-5만", "5만+"]
  },
  "actions": {
    "savePreferences": {
      "description": "prefs 로컬 상태 유지, toast.success('조건이 저장되었습니다')"
    },
    "resetPreferences": {
      "description": "prefs = { skin_type:'', tone:'', concerns:[], fragrance_free:false, exclude_ingredients:[], budget_band:'' }"
    },
    "rerunSearch": {
      "description": "navigate('/search?q={log.query}')"
    }
  }
}
```

---

## 상태 머신

| 상태 | 진입 조건 | UI |
|---|---|---|
| `loading` | 페이지 마운트 | animate-pulse h-48 skeleton |
| `success` | setTimeout 600ms 후 | 탭 + 폼 또는 로그 목록 |
| `tab=prefs` | 기본 탭 | 선호도 폼 표시 |
| `tab=logs` | 탭 전환 | 검색 로그 목록 표시 |
| `logs-empty` | `logs.length === 0` | "검색 기록이 없습니다" 텍스트 |

---

## 로컬 상태 정의

```typescript
const [tab, setTab] = useState<"prefs" | "logs">("prefs");
const [prefs, setPrefs] = useState<UserPreferences | null>(null);
const [logs, setLogs] = useState<SearchLog[]>([]);
const [loading, setLoading] = useState(true);
```

**UserPreferences 타입**:
```typescript
interface UserPreferences {
  skin_type: string;           // "건성" | "지성" | "복합" | "민감" | ""
  tone: string;                // "웜" | "쿨" | "뉴트럴" | "모름" | ""
  concerns: string[];          // 복수 선택
  fragrance_free: boolean;
  exclude_ingredients: string[]; // 복수 선택
  budget_band: string;         // "1-3만" | "3-5만" | "5만+" | ""
}
```

**toggleArray 헬퍼**:
```typescript
const toggleArray = (arr: string[], val: string) =>
  arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
```

---

## 버튼 목록 & 이벤트

### 1. "내 조건" 탭 버튼
- **클릭 시**: `setTab("prefs")`
- 활성: `bg-card text-foreground font-medium shadow-sm`
- 비활성: `text-muted-foreground`

### 2. "검색 로그" 탭 버튼
- **클릭 시**: `setTab("logs")`
- 활성/비활성 스타일 동일

### 3. 피부 타입 칩 (건성 / 지성 / 복합 / 민감)
- **이벤트**: `SELECT_SKIN_TYPE`
- **단일 선택**: `setPrefs({ ...prefs, skin_type: t })`
- 선택된 칩: `variant="default"`, 미선택: `variant="chip"`
- 이미 선택된 값 재클릭 시: `setPrefs({ ...prefs, skin_type: "" })` (선택 해제)

### 4. 톤 칩 (웜 / 쿨 / 뉴트럴 / 모름)
- **이벤트**: `SELECT_TONE`
- **단일 선택**: `setPrefs({ ...prefs, tone: t })`

### 5. 고민 칩 (복수 선택)
- **이벤트**: `TOGGLE_CONCERN`
- **클릭 시**: `setPrefs({ ...prefs, concerns: toggleArray(prefs.concerns, c) })`
- 선택됨: `variant="default"`, 미선택: `variant="chip"`

### 6. 무향 선호 토글 스위치
- **이벤트**: `TOGGLE_FRAGRANCE_FREE`
- **클릭 시**: `setPrefs({ ...prefs, fragrance_free: !prefs.fragrance_free })`
- **스타일**:
  ```html
  <button
    class="relative w-10 h-5 rounded-full transition-colors
           {prefs.fragrance_free ? 'bg-primary' : 'bg-muted'}">
    <span class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full
                 bg-primary-foreground transition-transform
                 {prefs.fragrance_free ? 'translate-x-5' : ''}"/>
  </button>
  ```

### 7. 제외 성분 칩 (복수 선택)
- **이벤트**: `TOGGLE_EXCLUDE_INGREDIENT`
- **클릭 시**: `setPrefs({ ...prefs, exclude_ingredients: toggleArray(prefs.exclude_ingredients, e) })`

### 8. 예산 칩 (1-3만 / 3-5만 / 5만+)
- **이벤트**: `SELECT_BUDGET`
- **단일 선택**: `setPrefs({ ...prefs, budget_band: b })`

### 9. "저장" 버튼 (glow)
- **이벤트**: `PREFERENCES_SAVE`
- **클릭 시**: `toast.success("조건이 저장되었습니다")`
- prefs는 로컬 상태 유지 (실제 저장 시뮬레이션)
- **스타일**: `variant="glow"`, `rounded-xl`

### 10. "초기화" 버튼 (outline)
- **이벤트**: `PREFERENCES_RESET`
- **클릭 시**:
  ```typescript
  setPrefs({
    skin_type: "", tone: "", concerns: [],
    fragrance_free: false, exclude_ingredients: [], budget_band: ""
  });
  ```
- 모든 칩 선택 해제, 토글 스위치 OFF

### 11. "다시 보기" 버튼 (검색 로그 항목)
- **이벤트**: `RERUN_SEARCH`
- **클릭 시**: `navigate("/search?q={encodeURIComponent(log.query)}")`
- **스타일**: `variant="ghost"`, `size="sm"`, `text-primary text-xs`

---

## 날짜 포맷

```typescript
// ko-KR 로케일로 날짜 표시
new Date(log.created_at).toLocaleDateString("ko-KR")
// 결과 예: "2026. 2. 24."
```
