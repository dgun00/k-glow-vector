# 프론트엔드 목업 싱글턴 프롬프트 — Route: `/auth`

> **프로젝트**: K-Beauty Whisperer (K-Glow AI Search)
> **라우터**: `/auth?next={path}&intent={intent}`
> **파일 위치**: `src/pages/AuthPage.tsx`
> **더미 데이터**: `src/data/routes/auth.json`
> **접근 권한**: Public

---

## 중요 선언

이 프로젝트는 UI/UX 테스트용 프론트엔드 목업이다.

- 어떤 서버도 생성하지 않는다.
- 어떤 데이터베이스도 생성하지 않는다.
- 실제 Google OAuth를 구현하지 않는다.
- 실제 이메일 인증을 구현하지 않는다.
- fetch/axios 같은 네트워크 코드를 만들지 않는다.
- **Next.js를 사용하지 않는다. React 18 + Vite 프로젝트다.**
- `next/router`, `next/link`, `next/navigation` 등 Next.js API를 사용하지 않는다.

모든 인증은 로컬 상태 전환으로 시뮬레이션한다.

```typescript
import authJson from "../data/routes/auth.json";
```


"로그인" 버튼 클릭 → `setTimeout(800)` → `isLoggedIn = true` → `navigate(next)`.  
"회원가입" 클릭 → `setTimeout(800)` → `signupSuccess = true` (이메일 확인 화면).

---

## 라우팅 훅

```typescript
import { useSearchParams, useNavigate } from "react-router-dom";

const [searchParams] = useSearchParams();
const navigate = useNavigate();

const next = searchParams.get("next") ?? "/";
const intent = searchParams.get("intent") ?? "";

// 로그인 성공 후 이동 (replace: true로 auth 페이지를 히스토리에서 제거)
navigate(decodeURIComponent(next), { replace: true });

// 이미 로그인 상태이면 즉시 redirect
useEffect(() => {
  if (isLoggedIn) navigate(decodeURIComponent(next), { replace: true });
}, [isLoggedIn]);
```

---

## 기술 스택

| 항목 | 버전/도구 |
|---|---|
| 프레임워크 | React 18 + TypeScript + Vite |
| 라우팅 | React Router DOM v6 (`useSearchParams`, `useNavigate`) |
| 스타일링 | Tailwind CSS |
| 애니메이션 | Framer Motion |
| 아이콘 | Google SVG 인라인 (4색), 없음 (Lucide 미사용) |
| 컴포넌트 | shadcn/ui Button |
| 이미지 | `/assets/auth-visual.png` (좌측 가치 제안 영역) |

---

## 라우터 명세

### 목적

로그인/회원가입 진입점.  
저장, 리포트 구매 등 보호된 액션 시도 시 리다이렉트 대상.  
`?intent=` 파라미터로 맥락에 따른 안내 메시지를 표시한다.

### 진입 조건

- **Public**: 누구나 접근 가능
- `?next=` : 로그인 후 돌아갈 경로 (기본값: `"/"`)
- `?intent=` : 진입 맥락 (`"save"` | `"buy_report"`)
- `isLoggedIn === true` 이미 로그인 상태이면 `?next` 경로로 즉시 redirect

### URL 파라미터 예시

| URL | 설명 |
|---|---|
| `/auth` | 기본 진입 |
| `/auth?next=/saved` | 저장 페이지 이동 후 로그인 |
| `/auth?next=/p/p001&intent=save` | 제품 저장 시도 → 로그인 필요 |
| `/auth?next=/search?q=글로우&intent=buy_report` | 리포트 구매 시도 → 로그인 필요 |

---

## ASCII 레이아웃

### 로그인 폼 (기본 상태)

```
┌─────────────────────────────────────────────────────────┐
│  HEADER (기본, 검색창 없음)                             │
│  [K-Glow 로고]                     [다크모드 토글]     │
├─────────────────────────────────────────────────────────┤
│  MAIN (flex-1 flex items-center justify-center py-12)   │
│                                                         │
│  ┌── 2열 그리드 (max-w-4xl grid md:grid-cols-2 gap-8)┐ │
│  │                                                     │ │
│  │  ┌── 좌측: 가치 제안 (hidden md:flex, flex-col) ─┐ │ │
│  │  │  ┌──────────────────────────────────────────┐  │ │ │
│  │  │  │  [auth-visual.png  192x192 object-contain]│  │ │ │
│  │  │  │  (mx-auto)                                │  │ │ │
│  │  │  └──────────────────────────────────────────┘  │ │ │
│  │  │                                                 │ │ │
│  │  │  K-Glow와 함께                                 │ │ │
│  │  │  (gradient-text "K-Glow" + 일반 텍스트)       │ │ │
│  │  │                                                 │ │ │
│  │  │  • 저장 기능으로 마음에 드는 제품 관리         │ │ │
│  │  │  • 내 조건 저장으로 추천 정확도 향상            │ │ │
│  │  │  • AI 루틴 리포트 구매 및 조회                 │ │ │
│  │  │  (각 항목: h-2 w-2 rounded-full bg-primary 불릿)│ │ │
│  │  │                                                 │ │ │
│  │  │  [intent 메시지 - text-sm text-primary font-medium]│ │ │
│  │  │  "프리미엄 리포트를 구매하려면 로그인이 필요합니다"│ │ │
│  │  │  (intent 파라미터 있을 때만 표시)              │ │ │
│  │  └─────────────────────────────────────────────┘  │ │
│  │                                                     │ │
│  │  ┌── 우측: 인증 폼 (rounded-2xl bg-card border p-8)┐│ │
│  │  │  로그인                                          ││ │
│  │  │  (text-xl font-bold text-center)                ││ │
│  │  │                                                  ││ │
│  │  │  ┌────────────────────────────────────────────┐ ││ │
│  │  │  │  [G SVG]  Google로 로그인  (outline)        │ ││ │
│  │  │  └────────────────────────────────────────────┘ ││ │
│  │  │                                                  ││ │
│  │  │  ──── 또는 ────                                  ││ │
│  │  │  (flex-1 h-px bg-border + text-xs muted)        ││ │
│  │  │                                                  ││ │
│  │  │  ┌────────────────────────────────────────────┐ ││ │
│  │  │  │  이메일                                     │ ││ │
│  │  │  └────────────────────────────────────────────┘ ││ │
│  │  │  ┌────────────────────────────────────────────┐ ││ │
│  │  │  │  비밀번호                                   │ ││ │
│  │  │  └────────────────────────────────────────────┘ ││ │
│  │  │  (rounded-xl border bg-background px-4 py-3   ││ │
│  │  │   focus:ring-2 focus:ring-ring)                ││ │
│  │  │                                                  ││ │
│  │  │  [에러 메시지 - text-sm text-destructive center]││ │
│  │  │                                                  ││ │
│  │  │  ┌────────────────────────────────────────────┐ ││ │
│  │  │  │  로그인  (glow, full-width, rounded-xl)    │ ││ │
│  │  │  └────────────────────────────────────────────┘ ││ │
│  │  │                                                  ││ │
│  │  │  계정이 없으신가요? [회원가입] (primary link)   ││ │
│  │  │  (text-xs text-center text-muted-foreground)    ││ │
│  │  └──────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 회원가입 폼 (mode = "signup")

```
┌── 우측: 인증 폼 (mode="signup") ─────────────────────┐
│  회원가입                                              │
│                                                        │
│  [G SVG]  Google로 가입  (outline)                    │
│  ──── 또는 ────                                        │
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │  이름 (선택) ← 회원가입 모드에서만 표시        │   │
│  └────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────┐   │
│  │  이메일                                         │   │
│  └────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────┐   │
│  │  비밀번호                                       │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  [에러 메시지]                                         │
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │  회원가입  (glow, full-width, rounded-xl)      │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  이미 계정이 있으신가요? [로그인]                      │
└────────────────────────────────────────────────────────┘
```

### 회원가입 완료 화면 (signupSuccess = true)

```
┌─────────────────────────────────────────────────────────┐
│  HEADER                                                 │
│  MAIN (flex-1 flex items-center justify-center py-12)   │
│                                                         │
│  ┌── text-center space-y-4 max-w-md ─────────────────┐  │
│  │  이메일을 확인해주세요 📧                          │  │
│  │  (text-xl font-bold text-foreground)               │  │
│  │                                                    │  │
│  │  user@example.com으로 인증 메일을 보냈습니다.     │  │
│  │  메일의 링크를 클릭하면 가입이 완료됩니다.         │  │
│  │  (text-muted-foreground)                           │  │
│  │                                                    │  │
│  │  [로그인으로 돌아가기]  (outline 버튼)             │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 로딩 상태 (loading = true)

```
┌── 우측: 인증 폼 (로딩 중) ──────────────────────────┐
│  [G SVG]  Google로 로그인  (disabled)               │
│  ──── 또는 ────                                      │
│  [이메일 input] (disabled)                           │
│  [비밀번호 input] (disabled)                         │
│  [처리 중...]  (glow 버튼, disabled)                 │
└──────────────────────────────────────────────────────┘
```

---

## JSON 더미 파일

**경로**: `src/data/routes/auth.json`

```json
{
  "__mock": { "mode": "success" },
  "view": {
    "intentMessages": {
      "save": "제품을 저장하려면 로그인이 필요합니다",
      "buy_report": "프리미엄 리포트를 구매하려면 로그인이 필요합니다"
    },
    "benefits": [
      "저장 기능으로 마음에 드는 제품 관리",
      "내 조건 저장으로 추천 정확도 향상",
      "AI 루틴 리포트 구매 및 조회"
    ]
  },
  "actions": {
    "googleLogin": {
      "description": "loading=true → setTimeout(1000) → isLoggedIn=true → navigate(next)"
    },
    "emailLogin": {
      "description": "유효성 검증 → loading=true → setTimeout(800) → isLoggedIn=true → navigate(next)",
      "validation": {
        "email": "비어있지 않음",
        "password": "6자 이상"
      }
    },
    "emailSignup": {
      "description": "유효성 검증 → loading=true → setTimeout(800) → signupSuccess=true",
      "validation": {
        "email": "비어있지 않음",
        "password": "6자 이상"
      }
    }
  }
}
```

---

## 상태 머신

| 상태 | 진입 조건 | UI |
|---|---|---|
| `initial` | 페이지 마운트 | `mode="login"` 폼 표시 |
| `mode=login` | 기본 | 이름 필드 없음 |
| `mode=signup` | 탭 전환 | 이름 필드 추가 표시 |
| `loading` | 버튼 클릭 후 | 버튼 `disabled`, 텍스트 "처리 중..." |
| `error` | 유효성 실패 또는 로그인 실패 | `error` 문자열 표시 |
| `signupSuccess` | 회원가입 완료 | 이메일 확인 안내 화면 전환 |
| `loginSuccess` | 로그인 완료 | `isLoggedIn=true`, `navigate(next)` |

---

## 로컬 상태 정의

```typescript
const [mode, setMode] = useState<"login" | "signup">("login");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [name, setName] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);
const [signupSuccess, setSignupSuccess] = useState(false);
```

---

## 버튼 목록 & 이벤트

### 1. "Google로 로그인/가입" 버튼
- **이벤트**: `AUTH_GOOGLE`
- **클릭 시**:
  ```typescript
  setError("");
  setLoading(true);
  setTimeout(() => {
    setIsLoggedIn(true); // 전역 Context 업데이트
    navigate(decodeURIComponent(next), { replace: true });
  }, 1000);
  ```
- **스타일**: `variant="outline"`, `w-full`, `rounded-xl`
- **Google SVG** (인라인, 4색 경로):
  ```svg
  <svg class="h-5 w-5 mr-2" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c..."/>
    <path fill="#34A853" d="M12 23c..."/>
    <path fill="#FBBC05" d="M5.84 14.09c..."/>
    <path fill="#EA4335" d="M12 5.38c..."/>
  </svg>
  ```

### 2. "로그인" / "회원가입" 이메일 버튼 (glow)
- **이벤트**: `AUTH_EMAIL`
- **유효성 검증**:
  - `email === "" || password === ""` → `setError("이메일과 비밀번호를 입력해주세요")`
  - `password.length < 6` → `setError("비밀번호는 6자 이상이어야 합니다")`
- **`mode="login"` 클릭 시**:
  ```typescript
  setLoading(true);
  setTimeout(() => {
    setIsLoggedIn(true);
    navigate(decodeURIComponent(next), { replace: true });
  }, 800);
  ```
- **`mode="signup"` 클릭 시**:
  ```typescript
  setLoading(true);
  setTimeout(() => {
    setLoading(false);
    setSignupSuccess(true);
  }, 800);
  ```
- **로딩 중**: 텍스트 "처리 중...", `disabled`
- **스타일**: `variant="glow"`, `flex-1`, `rounded-xl`

### 3. "회원가입" 링크 (모드 전환)
- **클릭 시**: `setMode("signup")`, `setError("")`
- 이름 입력 필드가 폼에 슬라이드-인

### 4. "로그인" 링크 (모드 전환)
- **클릭 시**: `setMode("login")`, `setError("")`
- 이름 입력 필드 숨김

### 5. "로그인으로 돌아가기" 버튼 (signupSuccess 화면)
- **클릭 시**: `setSignupSuccess(false)`, `setMode("login")`
- **스타일**: `variant="outline"`

---

## 유효성 검사 에러 메시지

| 조건 | 메시지 |
|---|---|
| 이메일 또는 비밀번호 미입력 | "이메일과 비밀번호를 입력해주세요" |
| 비밀번호 6자 미만 | "비밀번호는 6자 이상이어야 합니다" |
| 더미 로그인 실패 (임의 처리) | "이메일 또는 비밀번호가 올바르지 않습니다" |

---

## 입력창 공통 스타일

```
className="w-full rounded-xl border border-border bg-background
           px-4 py-3 text-sm text-foreground
           placeholder:text-muted-foreground
           focus:outline-none focus:ring-2 focus:ring-ring"
```

---

## 애니메이션 명세

| 대상 | 애니메이션 |
|---|---|
| 폼 전체 | `motion.div` initial `opacity:0 y:16` → `animate opacity:1 y:0` |
| 이름 입력 필드 | 회원가입 모드 시 조건부 렌더 (animate-in 없어도 무방) |
| 에러 메시지 | 조건부 렌더 (fadeIn 없어도 무방) |

---

## intent 메시지 매핑

```typescript
const intentMessages: Record<string, string> = {
  save: "제품을 저장하려면 로그인이 필요합니다",
  buy_report: "프리미엄 리포트를 구매하려면 로그인이 필요합니다",
};
// 좌측 가치 제안 하단에 primary 색상으로 표시
// intent 파라미터가 없거나 매핑 없으면 표시하지 않음
```
