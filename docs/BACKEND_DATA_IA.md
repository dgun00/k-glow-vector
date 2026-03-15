# BACKEND_DATA_IA.md
# K-Glow AI Search — 라우터별 백엔드 데이터 IA

> 프론트엔드 목업(`/docs/front_mock/v1`)의 각 라우터 기준으로,  
> 백엔드 연결 시 필요한 데이터 엔티티와 CRUD 오퍼레이션을 페이지별로 정리한 문서입니다.

---

## 공통 엔티티

| 엔티티 | 설명 |
|---|---|
| `User` | 인증된 사용자 계정 |
| `Product` | K-뷰티 제품 마스터 데이터 |
| `UserPreferences` | 사용자 피부 조건 및 필터 설정 |
| `SavedProduct` | 사용자별 저장 제품 목록 |
| `SearchLog` | 사용자 검색 이력 |
| `Report` | AI 생성 루틴 리포트 |

---

## 1. `/` — Home Page

**역할**: 검색 진입점. 비로그인 사용자도 접근 가능.

### READ
| 데이터 | 엔티티 | 설명 |
|---|---|---|
| 최근 검색 이력 | `SearchLog` | `user_id` 기준, 최신 5건 조회 (로그인 시만) |
| 트렌드 태그 | `TrendingTag` (또는 집계 쿼리) | 최근 N일 내 검색 빈도 상위 태그 |
| 예시 칩/문장 | `ExampleQuery` | 관리자 설정 or 하드코딩 (정적 콘텐츠) |

### CREATE / UPDATE / DELETE
없음 (Home은 읽기 전용)

---

## 2. `/search?q=` — Search Results Page

**역할**: 자연어 쿼리로 벡터 검색 실행, 결과 반환.

### CREATE
| 데이터 | 엔티티 | 설명 |
|---|---|---|
| 검색 로그 저장 | `SearchLog` | 쿼리 제출 시 `{user_id, query, created_at, result_count}` 기록 |
| 저장 기록 추가 | `SavedProduct` | 검색 결과에서 ♥ 누를 때 `{user_id, product_id, created_at}` 생성 |

### READ
| 데이터 | 엔티티 | 설명 |
|---|---|---|
| 제품 검색 결과 | `Product` | 벡터 유사도 검색 (Supabase `match_documents` RPC) |
| 검색 메타 | (집계) | `total_count`, `top_brands`, `top_tags`, `category_distribution` |
| 저장 여부 | `SavedProduct` | 결과 제품 중 현재 유저가 이미 저장한 id 목록 |
| 사용자 선호도 필터 | `UserPreferences` | 검색 시 자동 필터링에 활용 (`exclude_ingredients`, `skin_type` 등) |

### UPDATE
| 데이터 | 엔티티 | 설명 |
|---|---|---|
| 저장 토글 (해제) | `SavedProduct` | 이미 저장된 경우 DELETE |

### DELETE
| 데이터 | 엔티티 | 설명 |
|---|---|---|
| 저장 해제 | `SavedProduct` | `{user_id, product_id}` 기준 삭제 |

---

## 3. `/p/:productId` — Product Detail Page

**역할**: 단일 제품 상세 정보 표시, 저장 토글, 루틴 리포트 CTA.

### READ
| 데이터 | 엔티티 | 필드 | 설명 |
|---|---|---|---|
| 제품 기본 정보 | `Product` | `id, name, brand, category, price_band, finish, tone_fit` | URL params의 `productId` 기준 |
| 추천 근거 | `Product` | `explain_short, explain_bullets` | AI 생성 필드 |
| 성분 정보 | `Product` | `ingredients_top, ingredients_caution, all_ingredients` | |
| 사용감/제형 | `Product` | `texture_desc, tags` | |
| 유사 제품 | `Product` (관계) | `similar_ids` → 각 Product 조회 | `product_similar` 관계 테이블 또는 벡터 유사도 |
| 저장 여부 | `SavedProduct` | | `{user_id, product_id}` 존재 여부 |

### CREATE
| 데이터 | 엔티티 | 설명 |
|---|---|---|
| 저장 추가 | `SavedProduct` | `{user_id, product_id, created_at}` |

### UPDATE
없음

### DELETE
| 데이터 | 엔티티 | 설명 |
|---|---|---|
| 저장 해제 | `SavedProduct` | `{user_id, product_id}` 삭제 |

---

## 4. `/saved` — Saved Products Page (Protected)

**역할**: 사용자가 저장한 제품 목록 관리, 비교 모드.

### READ
| 데이터 | 엔티티 | 설명 |
|---|---|---|
| 저장한 제품 목록 | `SavedProduct` JOIN `Product` | `user_id` 기준 전체 목록, `created_at` 내림차순 |
| 제품 상세 (비교용) | `Product` | `name, brand, category, price_band, finish, tone_fit, tags, ingredients_top, ingredients_caution` |

### DELETE
| 데이터 | 엔티티 | 설명 |
|---|---|---|
| 저장 해제 | `SavedProduct` | 목록에서 ♥ 해제 시 `{user_id, product_id}` 삭제 |

### CREATE / UPDATE
없음 (이 페이지에서는 저장 추가 없음)

---

## 5. `/account` — Account Page (Protected)

**역할**: 피부 조건 선호도 설정 저장/수정, 검색 이력 조회.

### READ
| 데이터 | 엔티티 | 필드 | 설명 |
|---|---|---|---|
| 현재 선호도 | `UserPreferences` | `skin_type, tone, concerns, fragrance_free, exclude_ingredients, budget_band` | `user_id` 기준 단건 |
| 검색 로그 | `SearchLog` | `query, created_at, result_count` | `user_id` 기준 최신 N건 |

### CREATE
| 데이터 | 엔티티 | 설명 |
|---|---|---|
| 선호도 초기 생성 | `UserPreferences` | 최초 저장 시 INSERT (row가 없을 때) |

### UPDATE
| 데이터 | 엔티티 | 설명 |
|---|---|---|
| 선호도 변경 저장 | `UserPreferences` | "저장" 버튼 클릭 시 UPSERT (`user_id` 기준) |

### DELETE
| 데이터 | 엔티티 | 설명 |
|---|---|---|
| 선호도 초기화 | `UserPreferences` | 모든 필드를 빈값/기본값으로 UPDATE (row 삭제 아님) |
| (선택) 검색 로그 삭제 | `SearchLog` | 개별 로그 삭제 (현재 목업 UX에는 없으나 고려 가능) |

---

## 6. `/report/:reportId` — Routine Report Page (Protected)

**역할**: AI가 생성한 AM/PM 루틴 리포트 열람.

### READ
| 데이터 | 엔티티 | 필드 | 설명 |
|---|---|---|---|
| 리포트 기본 정보 | `Report` | `id, title, created_at, summary` | `reportId` 기준 |
| AM 루틴 | `Report` | `routine_am: string[]` | 단계별 사용 제품 설명 |
| PM 루틴 | `Report` | `routine_pm: string[]` | |
| 조합 근거 | `Report` | `reasoning: string[]` | AI 설명 텍스트 배열 |
| 주의 조합 | `Report` | `warnings: string[]` | 비어있을 수 있음 |
| 대체 제품 ID 목록 | `Report` | `alternatives: string[]` | product_id 배열 |
| 대체 제품 상세 | `Product` | `id, name, brand, image_url` | `alternatives` 기반 JOIN 조회 |

### CREATE
| 데이터 | 엔티티 | 설명 |
|---|---|---|
| 리포트 생성 | `Report` | PaymentModal "결제 완료" → AI Edge Function 호출 → `Report` 저장 |
| 결제 기록 | `Payment` | `{user_id, report_id, amount, created_at, status}` |

### UPDATE / DELETE
없음 (리포트는 불변 문서)

---

## 7. `/auth` — Auth Page (Public)

**역할**: 로그인 / 회원가입 처리. Supabase Auth 연동.

### CREATE
| 데이터 | 엔티티 | 설명 |
|---|---|---|
| 회원가입 | `User` (Supabase Auth) | email + password → `auth.signUp()` → `User` 레코드 생성 |
| 프로필 초기 생성 | `UserPreferences` | 회원가입 완료 후 빈 선호도 row INSERT (trigger 또는 클라이언트) |

### READ
| 데이터 | 엔티티 | 설명 |
|---|---|---|
| 현재 세션 확인 | `Session` (Supabase Auth) | 페이지 마운트 시 이미 로그인 상태면 `?next=` 경로로 redirect |

### UPDATE
| 데이터 | 엔티티 | 설명 |
|---|---|---|
| 로그인 | `Session` | `auth.signInWithPassword()` → JWT 발급 |
| Google OAuth | `Session` | `auth.signInWithOAuth({ provider: 'google' })` |

### DELETE
없음 (로그아웃은 세션 파기 — `auth.signOut()`)

---

## 엔티티 전체 요약

| 엔티티 | 주요 필드 |
|---|---|
| `User` | `id, email, name, created_at` |
| `UserPreferences` | `user_id (FK), skin_type, tone, concerns[], fragrance_free, exclude_ingredients[], budget_band` |
| `Product` | `id, name, brand, category, price_band, finish, tone_fit, tags[], ingredients_top[], ingredients_caution[], all_ingredients, texture_desc, explain_short, explain_bullets[], image_url, embedding (vector)` |
| `ProductSimilar` | `product_id (FK), similar_id (FK)` — 유사 제품 관계 |
| `SavedProduct` | `id, user_id (FK), product_id (FK), created_at` |
| `SearchLog` | `id, user_id (FK, nullable), query, result_count, created_at` |
| `Report` | `id, user_id (FK), title, summary, routine_am[], routine_pm[], reasoning[], warnings[], alternatives[], created_at` |
| `Payment` | `id, user_id (FK), report_id (FK), amount, status, created_at` |
| `TrendingTag` | `tag, count, updated_at` (집계 view 또는 테이블) |

---

## CRUD 매트릭스 요약

| 라우터 | CREATE | READ | UPDATE | DELETE |
|---|---|---|---|---|
| `/` | ✗ | SearchLog, TrendingTag | ✗ | ✗ |
| `/search` | SearchLog, SavedProduct | Product, SavedProduct, UserPreferences | ✗ | SavedProduct |
| `/p/:id` | SavedProduct | Product, SavedProduct | ✗ | SavedProduct |
| `/saved` | ✗ | SavedProduct+Product | ✗ | SavedProduct |
| `/account` | UserPreferences | UserPreferences, SearchLog | UserPreferences | (SearchLog) |
| `/report/:id` | Report, Payment | Report, Product | ✗ | ✗ |
| `/auth` | User, UserPreferences | Session | Session | ✗ |
