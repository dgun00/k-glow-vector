-- ============================================================
-- K-Glow AI Search — Supabase Schema
-- ERD.md + BACKEND_DATA_IA.md 기준
-- Supabase SQL Editor에서 전체 실행 가능
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 0. Extensions
-- ──────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists vector;


-- ──────────────────────────────────────────────────────────
-- 1. profiles
--    Supabase auth.users 와 1:1 매핑
-- ──────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  email       text        not null unique,
  name        text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 회원가입 시 profiles row 자동 생성 트리거
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- updated_at 자동 갱신 함수
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();


-- ──────────────────────────────────────────────────────────
-- 2. user_preferences
--    피부 조건 및 검색 필터 설정 (user당 최대 1 row)
-- ──────────────────────────────────────────────────────────
create table if not exists public.user_preferences (
  id                    uuid        primary key default gen_random_uuid(),
  user_id               uuid        not null unique references public.profiles(id) on delete cascade,
  skin_type             text        check (skin_type in ('건성', '지성', '복합', '민감')),
  tone                  text        check (tone in ('웜', '쿨', '뉴트럴', '모름')),
  concerns              text[]      not null default '{}',
  fragrance_free        boolean     not null default false,
  exclude_ingredients   text[]      not null default '{}',
  budget_band           text        check (budget_band in ('1-3만', '3-5만', '5만+')),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create trigger user_preferences_updated_at
  before update on public.user_preferences
  for each row execute procedure public.set_updated_at();


-- ──────────────────────────────────────────────────────────
-- 3. products
--    K-뷰티 제품 마스터 (벡터 임베딩 포함)
-- ──────────────────────────────────────────────────────────
create table if not exists public.products (
  id                    text        primary key,
  name                  text        not null,
  brand                 text        not null,
  category              text        not null check (category in ('skincare', 'base', 'lip', 'eye', 'suncare')),
  price_band            text        check (price_band in ('1-3만', '3-5만', '5만+')),
  finish                text        check (finish in ('글로우', '새틴', '매트', '크리미')),
  tone_fit              text        check (tone_fit in ('cool', 'warm', 'any')),
  tags                  text[]      not null default '{}',
  ingredients_top       text[]      not null default '{}',
  ingredients_caution   text[]      not null default '{}',
  all_ingredients       text,
  texture_desc          text,
  explain_short         text,
  explain_bullets       text[]      not null default '{}',
  image_url             text,
  embedding             vector(1536),
  is_active             boolean     not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- 벡터 인덱스 (IVFFlat, 데이터 적재 후 추가 권장)
-- create index products_embedding_idx on public.products
--   using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- 일반 인덱스
create index if not exists products_category_idx on public.products (category);
create index if not exists products_brand_idx    on public.products (brand);
create index if not exists products_is_active_idx on public.products (is_active);

create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();


-- ──────────────────────────────────────────────────────────
-- 4. product_similars
--    제품 간 유사도 관계
-- ──────────────────────────────────────────────────────────
create table if not exists public.product_similars (
  product_id  text    not null references public.products(id) on delete cascade,
  similar_id  text    not null references public.products(id) on delete cascade,
  score       real,
  primary key (product_id, similar_id),
  check (product_id <> similar_id)
);

create index if not exists product_similars_product_idx on public.product_similars (product_id);


-- ──────────────────────────────────────────────────────────
-- 5. saved_products
--    사용자별 저장 제품 목록
-- ──────────────────────────────────────────────────────────
create table if not exists public.saved_products (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  product_id  text        not null references public.products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists saved_products_user_idx on public.saved_products (user_id, created_at desc);


-- ──────────────────────────────────────────────────────────
-- 6. search_logs
--    검색 이력 (비로그인은 user_id = NULL)
-- ──────────────────────────────────────────────────────────
create table if not exists public.search_logs (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        references public.profiles(id) on delete set null,
  query           text        not null,
  result_count    integer,
  top_similarity  real,
  created_at      timestamptz not null default now()
);

create index if not exists search_logs_user_idx on public.search_logs (user_id, created_at desc);
create index if not exists search_logs_created_idx on public.search_logs (created_at desc);


-- ──────────────────────────────────────────────────────────
-- 7. reports
--    AI 생성 루틴 리포트
-- ──────────────────────────────────────────────────────────
create table if not exists public.reports (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references public.profiles(id) on delete cascade,
  title         text        not null,
  summary       text,
  routine_am    text[]      not null default '{}',
  routine_pm    text[]      not null default '{}',
  reasoning     text[]      not null default '{}',
  warnings      text[]      not null default '{}',
  alternatives  text[]      not null default '{}',
  source_query  text,
  created_at    timestamptz not null default now()
);

create index if not exists reports_user_idx on public.reports (user_id, created_at desc);


-- ──────────────────────────────────────────────────────────
-- 8. payments
--    리포트 결제 기록
-- ──────────────────────────────────────────────────────────
create table if not exists public.payments (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references public.profiles(id) on delete cascade,
  report_id         uuid        references public.reports(id) on delete set null,
  amount            integer     not null,
  currency          text        not null default 'KRW',
  status            text        not null default 'pending'
                                check (status in ('pending', 'completed', 'refunded')),
  pg_transaction_id text,
  created_at        timestamptz not null default now(),
  completed_at      timestamptz
);

create index if not exists payments_user_idx   on public.payments (user_id, created_at desc);
create index if not exists payments_status_idx on public.payments (status);


-- ──────────────────────────────────────────────────────────
-- 9. trending_tags
--    홈 트렌드 태그 집계
-- ──────────────────────────────────────────────────────────
create table if not exists public.trending_tags (
  tag           text        primary key,
  count         integer     not null default 0,
  period_start  timestamptz not null,
  period_end    timestamptz not null,
  updated_at    timestamptz not null default now()
);


-- ──────────────────────────────────────────────────────────
-- 10. Row Level Security (RLS)
-- ──────────────────────────────────────────────────────────

-- profiles
alter table public.profiles enable row level security;

create policy "프로필 자신만 조회" on public.profiles
  for select using (auth.uid() = id);

create policy "프로필 자신만 수정" on public.profiles
  for update using (auth.uid() = id);


-- user_preferences
alter table public.user_preferences enable row level security;

create policy "선호도 자신만 조회" on public.user_preferences
  for select using (auth.uid() = user_id);

create policy "선호도 자신만 삽입" on public.user_preferences
  for insert with check (auth.uid() = user_id);

create policy "선호도 자신만 수정" on public.user_preferences
  for update using (auth.uid() = user_id);


-- products (공개 읽기)
alter table public.products enable row level security;

create policy "제품 전체 공개 조회" on public.products
  for select using (is_active = true);


-- product_similars (공개 읽기)
alter table public.product_similars enable row level security;

create policy "유사 제품 전체 공개 조회" on public.product_similars
  for select using (true);


-- saved_products
alter table public.saved_products enable row level security;

create policy "저장 자신만 조회" on public.saved_products
  for select using (auth.uid() = user_id);

create policy "저장 자신만 삽입" on public.saved_products
  for insert with check (auth.uid() = user_id);

create policy "저장 자신만 삭제" on public.saved_products
  for delete using (auth.uid() = user_id);


-- search_logs
alter table public.search_logs enable row level security;

create policy "검색 로그 자신만 조회" on public.search_logs
  for select using (auth.uid() = user_id or user_id is null);

create policy "검색 로그 삽입 (인증 여부 무관)" on public.search_logs
  for insert with check (true);


-- reports
alter table public.reports enable row level security;

create policy "리포트 자신만 조회" on public.reports
  for select using (auth.uid() = user_id);

create policy "리포트 자신만 삽입" on public.reports
  for insert with check (auth.uid() = user_id);


-- payments
alter table public.payments enable row level security;

create policy "결제 자신만 조회" on public.payments
  for select using (auth.uid() = user_id);

create policy "결제 자신만 삽입" on public.payments
  for insert with check (auth.uid() = user_id);


-- trending_tags (공개 읽기)
alter table public.trending_tags enable row level security;

create policy "트렌드 태그 공개 조회" on public.trending_tags
  for select using (true);


-- ──────────────────────────────────────────────────────────
-- 11. 벡터 유사도 검색 RPC 함수
--     Edge Function 또는 클라이언트에서 호출
-- ──────────────────────────────────────────────────────────
create or replace function public.match_products(
  query_embedding  vector(1536),
  match_threshold  float   default 0.78,
  match_count      int     default 20
)
returns table (
  id                  text,
  name                text,
  brand               text,
  category            text,
  price_band          text,
  finish              text,
  tone_fit            text,
  tags                text[],
  ingredients_top     text[],
  ingredients_caution text[],
  explain_short       text,
  image_url           text,
  similarity          float
)
language sql
stable
as $$
  select
    p.id,
    p.name,
    p.brand,
    p.category,
    p.price_band,
    p.finish,
    p.tone_fit,
    p.tags,
    p.ingredients_top,
    p.ingredients_caution,
    p.explain_short,
    p.image_url,
    1 - (p.embedding <=> query_embedding) as similarity
  from public.products p
  where
    p.is_active = true
    and p.embedding is not null
    and 1 - (p.embedding <=> query_embedding) > match_threshold
  order by p.embedding <=> query_embedding
  limit match_count;
$$;
