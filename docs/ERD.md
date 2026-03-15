# SQL.md — K-Glow 데이터베이스 테이블 설계

> 참고: `BACKEND_DATA_IA.md` 기준  
> 플랫폼: **Supabase (PostgreSQL)**  
> 아직 SQL 작성 전 단계 — 테이블 구조 및 속성 설계 문서

---

## 설계 원칙

- Supabase Auth(`auth.users`)를 User 원천으로 사용
- 공개 스키마는 `public`
- 벡터 검색은 `pgvector` 확장 사용 (`vector` 타입)
- Soft delete 없음 (명시적 DELETE 사용)
- 타임스탬프는 모두 `timestamptz`(UTC)
- `id`는 전부 `uuid` (Supabase 기본)

---

## 테이블 목록

| # | 테이블명 | 설명 |
|---|---|---|
| 1 | `profiles` | 사용자 프로필 (auth.users 확장) |
| 2 | `user_preferences` | 피부 조건 및 필터 설정 |
| 3 | `products` | K-뷰티 제품 마스터 |
| 4 | `product_similars` | 제품 간 유사도 관계 |
| 5 | `saved_products` | 사용자별 저장 제품 |
| 6 | `search_logs` | 검색 이력 |
| 7 | `reports` | AI 생성 루틴 리포트 |
| 8 | `payments` | 리포트 결제 기록 |
| 9 | `trending_tags` | 트렌드 태그 집계 |

---

## 1. `profiles`

Supabase `auth.users`와 1:1 매핑. 추가 프로필 정보 저장.

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | `uuid` | PK, FK → `auth.users.id` | Supabase 사용자 ID |
| `email` | `text` | NOT NULL, UNIQUE | 이메일 (auth와 동기화) |
| `name` | `text` | NULLABLE | 표시 이름 (회원가입 시 선택 입력) |
| `avatar_url` | `text` | NULLABLE | Google OAuth 프로필 이미지 URL |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | 가입 시각 |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT now() | 마지막 수정 시각 |

**관계**
- `auth.users` 1 ─── 1 `profiles`

---

## 2. `user_preferences`

사용자별 피부 조건 및 검색 필터 설정.  
Row가 없으면 필터 없이 검색. 최대 1 row per user.

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT gen_random_uuid() | |
| `user_id` | `uuid` | FK → `profiles.id`, UNIQUE, NOT NULL | 사용자 (1:1) |
| `skin_type` | `text` | NULLABLE | `'건성' \| '지성' \| '복합' \| '민감'` |
| `tone` | `text` | NULLABLE | `'웜' \| '쿨' \| '뉴트럴' \| '모름'` |
| `concerns` | `text[]` | NOT NULL, DEFAULT `'{}'` | 복수 선택: 홍조, 트러블, 속건조, 모공, 각질, 잡티, 주름, 다크서클 |
| `fragrance_free` | `boolean` | NOT NULL, DEFAULT false | 무향 선호 여부 |
| `exclude_ingredients` | `text[]` | NOT NULL, DEFAULT `'{}'` | 제외 성분: 향료, 에탄올, 실리콘, 파라벤 |
| `budget_band` | `text` | NULLABLE | `'1-3만' \| '3-5만' \| '5만+'` |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT now() | |

**관계**
- `profiles` 1 ─── 0..1 `user_preferences`

---

## 3. `products`

K-뷰티 제품 마스터 데이터. 벡터 임베딩 포함.

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | `text` | PK | 예: `'p001'` (외부 ID 또는 uuid) |
| `name` | `text` | NOT NULL | 제품명 |
| `brand` | `text` | NOT NULL | 브랜드명 |
| `category` | `text` | NOT NULL | `'skincare' \| 'base' \| 'lip' \| 'eye' \| 'suncare'` |
| `price_band` | `text` | NULLABLE | `'1-3만' \| '3-5만' \| '5만+'` |
| `finish` | `text` | NULLABLE | `'글로우' \| '새틴' \| '매트' \| '크리미'` |
| `tone_fit` | `text` | NULLABLE | `'cool' \| 'warm' \| 'any'` |
| `tags` | `text[]` | NOT NULL, DEFAULT `'{}'` | 제품 특성 태그 |
| `ingredients_top` | `text[]` | NOT NULL, DEFAULT `'{}'` | 주요 성분 상위 3~5개 |
| `ingredients_caution` | `text[]` | NOT NULL, DEFAULT `'{}'` | 주의 성분 |
| `all_ingredients` | `text` | NULLABLE | 전성분 원문 텍스트 |
| `texture_desc` | `text` | NULLABLE | 사용감/제형 설명 |
| `explain_short` | `text` | NULLABLE | AI 생성 단문 추천 근거 |
| `explain_bullets` | `text[]` | NOT NULL, DEFAULT `'{}'` | AI 생성 불릿 포인트 (3~5개) |
| `image_url` | `text` | NULLABLE | 제품 이미지 경로 |
| `embedding` | `vector(1536)` | NULLABLE | text-embedding-3-small 임베딩 벡터 |
| `is_active` | `boolean` | NOT NULL, DEFAULT true | 비활성 제품 숨김 처리용 |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT now() | |

**인덱스 (설계 기준)**
- `embedding` 컬럼 → IVFFlat 또는 HNSW 벡터 인덱스
- `category` → B-tree 인덱스 (필터링)
- `brand` → B-tree 인덱스 (필터링)

---

## 4. `product_similars`

제품 간 유사도 관계 테이블 (양방향 저장 또는 단방향).

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `product_id` | `text` | FK → `products.id`, NOT NULL | 기준 제품 |
| `similar_id` | `text` | FK → `products.id`, NOT NULL | 유사 제품 |
| `score` | `float4` | NULLABLE | 유사도 점수 (0~1) |

**복합 PK**: `(product_id, similar_id)`

**관계**
- `products` N ─── M `products` (through `product_similars`)

---

## 5. `saved_products`

사용자별 저장한 제품 목록.

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT gen_random_uuid() | |
| `user_id` | `uuid` | FK → `profiles.id`, NOT NULL | |
| `product_id` | `text` | FK → `products.id`, NOT NULL | |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | 저장 시각 |

**UNIQUE**: `(user_id, product_id)` — 중복 저장 방지

**관계**
- `profiles` 1 ─── N `saved_products`
- `products` 1 ─── N `saved_products`

---

## 6. `search_logs`

사용자 검색 이력. 비로그인 검색도 `user_id = NULL`로 기록 가능.

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT gen_random_uuid() | |
| `user_id` | `uuid` | FK → `profiles.id`, NULLABLE | 비로그인 시 NULL |
| `query` | `text` | NOT NULL | 검색 쿼리 원문 |
| `result_count` | `int4` | NULLABLE | 결과 제품 수 |
| `top_similarity` | `float4` | NULLABLE | 최상위 유사도 점수 |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | 검색 시각 |

**인덱스**
- `(user_id, created_at DESC)` — 사용자별 최근 검색 목록 조회용

---

## 7. `reports`

AI 생성 루틴 리포트. 결제 완료 후 생성.

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT gen_random_uuid() | |
| `user_id` | `uuid` | FK → `profiles.id`, NOT NULL | 리포트 소유자 |
| `title` | `text` | NOT NULL | 리포트 제목 |
| `summary` | `text` | NULLABLE | AI 생성 요약 문장 |
| `routine_am` | `text[]` | NOT NULL, DEFAULT `'{}'` | AM 루틴 단계별 문자열 배열 |
| `routine_pm` | `text[]` | NOT NULL, DEFAULT `'{}'` | PM 루틴 단계별 문자열 배열 |
| `reasoning` | `text[]` | NOT NULL, DEFAULT `'{}'` | 조합 근거 배열 |
| `warnings` | `text[]` | NOT NULL, DEFAULT `'{}'` | 주의 조합 배열 (비어있을 수 있음) |
| `alternatives` | `text[]` | NOT NULL, DEFAULT `'{}'` | 대체 제품 product_id 배열 |
| `source_query` | `text` | NULLABLE | 리포트 생성 기반 검색 쿼리 |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | |

**관계**
- `profiles` 1 ─── N `reports`
- `payments` 1 ─── 1 `reports`

---

## 8. `payments`

리포트 결제 기록.

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT gen_random_uuid() | |
| `user_id` | `uuid` | FK → `profiles.id`, NOT NULL | |
| `report_id` | `uuid` | FK → `reports.id`, NULLABLE | 결제 후 리포트 생성 시 연결 |
| `amount` | `int4` | NOT NULL | 결제 금액 (원, 정수) |
| `currency` | `text` | NOT NULL, DEFAULT `'KRW'` | |
| `status` | `text` | NOT NULL, DEFAULT `'pending'` | `'pending' \| 'completed' \| 'refunded'` |
| `pg_transaction_id` | `text` | NULLABLE | PG사 트랜잭션 ID |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | |
| `completed_at` | `timestamptz` | NULLABLE | 결제 완료 시각 |

**관계**
- `profiles` 1 ─── N `payments`
- `reports` 1 ─── 0..1 `payments`

---

## 9. `trending_tags`

홈 화면 트렌드 태그 집계.  
주기적으로 `search_logs` 기반으로 배치 업데이트 (또는 Materialized View).

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `tag` | `text` | PK | 태그 문자열 |
| `count` | `int4` | NOT NULL, DEFAULT 0 | 집계 기간 내 검색 빈도 |
| `period_start` | `timestamptz` | NOT NULL | 집계 기간 시작 |
| `period_end` | `timestamptz` | NOT NULL | 집계 기간 종료 |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT now() | 마지막 갱신 시각 |

---

## 관계 다이어그램 (ERD 요약)

```
auth.users
    │ 1
    │
    ▼ 1
profiles ──────────────────────────────────────────┐
    │ 1                                             │
    ├──── N ──▶ user_preferences (0..1)             │
    ├──── N ──▶ saved_products ◀──── N ── products │
    ├──── N ──▶ search_logs                         │
    └──── N ──▶ reports ◀── 0..1 ── payments ───────┘

products ─── N ─── M ─── products (through product_similars)
```

---

## 미정/추후 결정 사항

| 항목 | 현재 상태 | 메모 |
|---|---|---|
| `products.id` 타입 | `text` (p001 형식) vs `uuid` | 외부 데이터 수집 방식에 따라 결정 |
| `product_similars` 방향 | 단방향 vs 양방향 | 삽입 비용 vs 조회 단순성 tradeoff |
| `trending_tags` 갱신 방식 | 배치 vs Materialized View | 트래픽 규모에 따라 결정 |
| `search_logs` 비로그인 식별 | NULL vs 익명 session_id | 개인정보 정책 검토 필요 |
| 결제 PG 연동 | 미정 | 포트원(아임포트), 토스페이먼츠 등 |
| RLS 정책 | 미정 | Supabase Row Level Security 설계 별도 필요 |
