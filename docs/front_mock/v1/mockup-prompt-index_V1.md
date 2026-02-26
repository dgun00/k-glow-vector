# K-Beauty Whisperer — 프론트엔드 목업 싱글턴 프롬프트 인덱스

> **프로젝트**: K-Beauty Whisperer (K-Glow AI Search)
> **문서 목적**: 이 문서들은 UI/UX 테스트용 프론트엔드 목업을 Cursor에서  
> 동일하게 재현하기 위한 라우터별 싱글턴 프롬프트 모음입니다.

---

## 사용 방법

각 MD 파일을 Cursor 채팅에 통째로 붙여넣으면  
해당 라우터의 프론트엔드 목업 페이지가 완결 형태로 생성됩니다.

**전제 조건**:
- React 18 + TypeScript + Vite 프로젝트 초기화 완료
- Tailwind CSS 설정 완료 (`tailwind.config.ts`, `content: ["./index.html", "./src/**/*.{ts,tsx}"]`)
- shadcn/ui 초기화 완료 (Vite 기준, `components.json`)
- Framer Motion, Lucide React, Sonner 설치 완료
- React Router DOM v6 설치 완료 (`npm install react-router-dom`)
- `src/main.tsx` 에 `<BrowserRouter>` 래핑 완료
- `src/App.tsx` 에 `<Routes>/<Route>` 라우팅 설정 완료

---

## 문서 목록

| 파일 | 라우터 | 접근 | 설명 |
|---|---|---|---|
| [`mockup-prompt-route-home_V1.md`](./mockup-prompt-route-home_V1.md) | `/` | Public | 홈 — 검색 진입, 예시 칩, 최근 검색 |
| [`mockup-prompt-route-search_V1.md`](./mockup-prompt-route-search_V1.md) | `/search?q=` | Public | 검색 결과 — AI 추천, 필터, 더 보기, 리포트 CTA |
| [`mockup-prompt-route-product-detail_V1.md`](./mockup-prompt-route-product-detail_V1.md) | `/p/:productId` | Public | 제품 상세 — 성분, 유사 제품, 저장, 리포트 CTA |
| [`mockup-prompt-route-saved_V1.md`](./mockup-prompt-route-saved_V1.md) | `/saved` | Protected | 저장 목록 — 비교 모드, CompareModal |
| [`mockup-prompt-route-account_V1.md`](./mockup-prompt-route-account_V1.md) | `/account` | Protected | 계정 — 피부 선호도 설정, 검색 로그 |
| [`mockup-prompt-route-report_V1.md`](./mockup-prompt-route-report_V1.md) | `/report/:reportId` | Protected | 루틴 리포트 — AM/PM 루틴, 주의 조합, 대체 제품 |
| [`mockup-prompt-route-auth_V1.md`](./mockup-prompt-route-auth_V1.md) | `/auth` | Public | 인증 — 로그인/회원가입, intent 메시지 |
| [`mockup-prompt-flows-qa_V1.md`](./mockup-prompt-flows-qa_V1.md) | 전체 | — | 공통 UI 규칙, 사용자 플로우 5개, QA 체크리스트 |

---

## 라우터 맵

```
/                        → 홈 (HomePage)
├── /search?q={query}    → 검색 결과 (SearchPage)
├── /p/:productId        → 제품 상세 (ProductDetail)
├── /saved               → 저장 목록 [Protected]
├── /account             → 계정/선호도 [Protected]
├── /report/:reportId    → 루틴 리포트 [Protected]
└── /auth                → 로그인/회원가입
    ?next={path}
    ?intent={save|buy_report}
```

---

## 프로젝트 파일 구조

```
src/
  main.tsx                  ← React 진입점 (BrowserRouter 래핑)
  App.tsx                   ← Routes/Route 라우팅 설정
  pages/
    HomePage.tsx            ← "/" 라우트
    SearchPage.tsx          ← "/search" 라우트
    ProductDetail.tsx       ← "/p/:productId" 라우트
    SavedPage.tsx           ← "/saved" 라우트 (Protected)
    AccountPage.tsx         ← "/account" 라우트 (Protected)
    ReportPage.tsx          ← "/report/:reportId" 라우트 (Protected)
    AuthPage.tsx            ← "/auth" 라우트
  context/
    AuthContext.tsx          ← isLoggedIn 전역 상태 (Context API)
  components/
    ProtectedRoute.tsx       ← isLoggedIn 체크 후 /auth redirect
public/
  data/
    routes/
      home.json
      search.json
      product-detail.json
      saved.json
      account.json
      report.json
      auth.json
```

---

## `src/main.tsx` 기본 구조

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

---

## `src/App.tsx` 기본 구조

```tsx
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import ProductDetail from "./pages/ProductDetail";
import SavedPage from "./pages/SavedPage";
import AccountPage from "./pages/AccountPage";
import ReportPage from "./pages/ReportPage";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/p/:productId" element={<ProductDetail />} />
        <Route path="/saved" element={
          <ProtectedRoute><SavedPage /></ProtectedRoute>
        } />
        <Route path="/account" element={
          <ProtectedRoute><AccountPage /></ProtectedRoute>
        } />
        <Route path="/report/:reportId" element={
          <ProtectedRoute><ReportPage /></ProtectedRoute>
        } />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
      <Toaster />
    </>
  );
}
```

---

## 더미 데이터 파일 위치

```
public/data/routes/
  home.json
  search.json
  product-detail.json
  saved.json
  account.json
  report.json
  auth.json
```

JSON 파일은 `public/` 에 위치하며, Vite 개발 서버에서 `/data/routes/home.json` 경로로 정적 서빙된다.  
또는 `src/` 내부에 위치시켜 ES 모듈로 직접 import할 수 있다.

```typescript
// 방법 1: public/ 경로에서 정적 fetch (로딩 시뮬레이션 가능)
// fetch("/data/routes/home.json") — 이 프로젝트에서는 사용하지 않음

// 방법 2: src/ 내 JSON을 ES 모듈로 import (권장)
import homeData from "../data/routes/home.json";
```

---

## 핵심 설계 원칙

| 원칙 | 설명 |
|---|---|
| **UI First** | 화면이 먼저. 데이터 구조는 나중에 추출. |
| **Router First** | 모든 요구사항은 라우터 단위로 정의. |
| **JSON 1:1** | 라우터 1개당 JSON 파일 1개. |
| **Zero Backend** | 서버, DB, API, 외부 연동 없음. |
| **Local State Only** | 모든 인터랙션은 로컬 상태 변화로만 처리. |
| **CSR Only** | SSR/SSG 없음. 순수 클라이언트 사이드 렌더링. |

---

## 목업 vs 실제 구현 차이

| 항목 | 목업 (이 문서) | 실제 구현 |
|---|---|---|
| 데이터 소스 | 로컬 JSON 파일 (ES 모듈 import) | Supabase DB |
| 검색 | setTimeout 시뮬레이션 | Edge Function + pgvector |
| 인증 | 로컬 `isLoggedIn` 상태 (Context API) | Supabase Auth (Google OAuth) |
| 저장 | 로컬 배열 토글 | `saved_products` 테이블 |
| 결제 | 더미 reportId 생성 | 실제 결제 SDK |
| 선호도 저장 | 로컬 상태 + toast | `user_preferences` 테이블 |
| 라우팅 | React Router DOM v6 | React Router DOM v6 (동일) |

---

## React Router DOM v6 핵심 훅 참조

| 훅 | 용도 | import |
|---|---|---|
| `useNavigate()` | 프로그래매틱 라우팅 | `react-router-dom` |
| `useParams()` | URL 파라미터 (`:productId`) | `react-router-dom` |
| `useSearchParams()` | 쿼리스트링 (`?q=`) | `react-router-dom` |
| `useLocation()` | 현재 경로 정보 | `react-router-dom` |
