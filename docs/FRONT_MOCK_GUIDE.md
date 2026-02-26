# Antigravity용 "프론트엔드 목업 완결" 싱글턴 프롬프트 작성 규격

────────────────────────────────────────────────────────
[이 문서의 목적]
────────────────────────────────────────────────────────

이 문서는 Antigravity를 사용하여
UI/UX 테스트용 프론트엔드 목업을 완결 수준으로 생성하기 위한
단일 입력 프롬프트 작성 규격이다.

이 단계의 목표는:

- 화면 완성도 극대화
- 사용자 흐름 완성
- 상태 전이 완성
- 실제 서비스처럼 동작하는 더미 기반 인터랙션 구현

데이터 모델 설계는 하지 않는다.
엔티티 정규화는 하지 않는다.
API 설계는 하지 않는다.
재사용은 고려하지 않는다.

오직 "페이지 완결"만 목표로 한다.

────────────────────────────────────────────────────────
[기술 스택 — 이 규격은 아래 스택을 전제로 한다]
────────────────────────────────────────────────────────

| 항목 | 버전/도구 |
|---|---|
| 프레임워크 | React 18 + TypeScript |
| 빌드 도구 | Vite |
| 라우팅 | React Router DOM v6 (`BrowserRouter` + `Routes` + `Route`) |
| 스타일링 | Tailwind CSS |
| 컴포넌트 | shadcn/ui (Vite 기준 초기화) |
| 애니메이션 | Framer Motion |
| 아이콘 | Lucide React |
| 토스트 | Sonner |

**Next.js가 아닌 순수 React (Vite) 프로젝트를 전제로 한다.**

- 서버 컴포넌트 없음 — 모든 컴포넌트는 클라이언트 컴포넌트
- 파일 기반 라우팅 없음 — `src/App.tsx` 에서 `<Routes>/<Route>` 로 명시적 라우팅
- SSR / SSG 없음 — 순수 CSR (Client Side Rendering)
- API 라우트 없음
- `next/router`, `next/link`, `next/image` 등 Next.js 전용 API 사용 금지
- 라우팅 훅: `useNavigate`, `useParams`, `useSearchParams` — 모두 `react-router-dom`에서 import

────────────────────────────────────────────────────────
[프로젝트 초기 파일 구조]
────────────────────────────────────────────────────────

```
src/
  main.tsx          ← BrowserRouter 감싸는 진입점
  App.tsx           ← Routes / Route 라우팅 설정
  pages/
    HomePage.tsx    ← "/" 라우트 컴포넌트
    SearchPage.tsx  ← "/search" 라우트 컴포넌트
    ...
  context/
    AuthContext.tsx  ← isLoggedIn 전역 상태 (Context API)
public/
  data/
    routes/
      home.json
      search.json
      ...
```

**`src/main.tsx` 기본 구조:**

```tsx
import { BrowserRouter } from "react-router-dom";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
```

**`src/App.tsx` 기본 구조:**

```tsx
import { Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/p/:productId" element={<ProductDetail />} />
      <Route path="/saved" element={<ProtectedRoute><SavedPage /></ProtectedRoute>} />
      <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
      <Route path="/report/:reportId" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
      <Route path="/auth" element={<AuthPage />} />
    </Routes>
  );
}
```

────────────────────────────────────────────────────────
[철학]
────────────────────────────────────────────────────────

1) UI First
   - 화면이 먼저다.
   - 데이터 구조는 나중에 해부해서 추출한다.

2) Router First
   - 모든 요구사항은 라우터 단위로 정의한다.

3) JSON 1:1
   - 라우터 1개당 JSON 파일 1개
   - 페이지에 필요한 모든 데이터는 해당 JSON 안에만 존재한다.

4) Zero Backend Assumption
   - 서버, DB, API, 외부 연동은 존재하지 않는다고 가정한다.
   - 네트워크 호출을 상상하지 않는다.

────────────────────────────────────────────────────────
[중요 선언 — 반드시 프롬프트 내부에 포함]
────────────────────────────────────────────────────────

이 프로젝트는 UI/UX 테스트용 프론트엔드 목업이다.

- 어떤 서버도 생성하지 않는다.
- 어떤 데이터베이스도 생성하지 않는다.
- 어떤 API route도 생성하지 않는다.
- 어떤 외부 요청도 하지 않는다.
- fetch/axios 같은 네트워크 코드를 만들지 않는다.
- 환경변수를 요구하지 않는다.
- 인증 시스템을 자동 생성하지 않는다.
- 결제 SDK를 설치하지 않는다.
- Next.js를 설치하지 않는다. React 18 + Vite 프로젝트다.

모든 데이터는 로컬 JSON 더미 파일에서만 가져온다.
모든 인터랙션은 로컬 상태 변화로만 시뮬레이션한다.

────────────────────────────────────────────────────────
1) 프로젝트 메타
────────────────────────────────────────────────────────

- 프로젝트명:
- 목적:
- 서비스 유형:
- MVP 범위:
- 이 문서는 프론트엔드 목업 완결 전용임을 명시

────────────────────────────────────────────────────────
2) PRD 요약 (UI 기준)
────────────────────────────────────────────────────────

1. What
2. Value
3. JTBD
4. Primary Personas (2~3)
5. Non-Goals
6. MVP Metrics

※ 기술 스택, DB, API 언급 금지

────────────────────────────────────────────────────────
3) 라우터 확정 (IA 고정)
────────────────────────────────────────────────────────

- 5~8개 권장
- public / auth 여부만 표시
- 파라미터 명시

예:

- "/"
- "/search?q="
- "/detail/:id"
- "/saved"
- "/profile"

라우터 확정 후에는 변경하지 않는다.
이 문서 내에서만 진화한다.

────────────────────────────────────────────────────────
4) 공통 UI 규칙
────────────────────────────────────────────────────────

- Header 구성
- Footer 구성
- 공통 카드 디자인
- 버튼 스타일 규칙
- 입력창 규칙
- Loading UI
- Empty UI
- Error UI

디자인 시스템 정의는 가능하나
컴포넌트 추상화는 하지 않는다.

────────────────────────────────────────────────────────
5) 라우터별 JSON 더미 규격
────────────────────────────────────────────────────────

파일 위치 예:
- `public/data/routes/{routeKey}.json`

JSON import 방식 (Vite ESM):

```typescript
// Vite에서는 public/ 디렉토리 파일을 정적으로 서빙
// 또는 src/ 내부 JSON은 ES 모듈로 직접 import
import homeData from "../../public/data/routes/home.json";
```

구조:

{
  "__mock": { "mode": "success" },
  "page": { ... },
  "view": { ... },
  "actions": { ... }
}

규칙:

- 페이지에 필요한 모든 필드는 여기에 포함한다.
- 다른 라우터와 구조를 맞출 필요 없다.
- 중복 허용.
- 구조 변경 자유.

────────────────────────────────────────────────────────
6) 라우터별 상세 명세
────────────────────────────────────────────────────────

각 라우터는 반드시 포함:

[Route: {PATH}]

- 목적
- 진입 조건
- 레이아웃 (위→아래 섹션 순서)
- 표시 데이터(JSON 경로 명시)
- 버튼 목록
- 이벤트명
- 클릭 시 UI 변화
- 상태 머신:
  - initial
  - loading
  - success
  - empty
  - error
- ASCII Layout

────────────────────────────────────────────────────────
7) 핵심 사용자 플로우
────────────────────────────────────────────────────────

형식:

"/" 
→ EVENT_NAME
→ "/next-route"
→ EVENT_NAME
→ "/next-route"

최소 3개 플로우 작성

────────────────────────────────────────────────────────
8) QA 체크리스트
────────────────────────────────────────────────────────

□ 라우터 단위 진입 가능
□ JSON 기반 렌더링
□ 버튼 이벤트 정상
□ 상태 전이 확인
□ 네비게이션 정상
□ 각 라우터 독립 수정 가능

────────────────────────────────────────────────────────
[Antigravity용 단일 입력 템플릿]
────────────────────────────────────────────────────────

프로젝트명:
목적:
서비스 유형:
MVP 범위:

기술 스택:
- React 18 + TypeScript + Vite
- React Router DOM v6
- Tailwind CSS
- shadcn/ui (Vite 기준)
- Framer Motion, Lucide React, Sonner

중요 선언:
(백엔드 생성 금지 문장 포함)
(Next.js가 아닌 React + Vite 프로젝트임을 명시)

[PRD 요약]

[라우터 목록]

[공통 UI 규칙]

[라우터별 JSON]

[라우터별 상세]

[사용자 플로우]

[QA 체크리스트]

이 문서를 그대로 입력하면
프론트엔드 목업이 완결 형태로 생성되어야 한다.
