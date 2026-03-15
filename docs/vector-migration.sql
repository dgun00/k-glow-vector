-- ============================================================
-- K-Glow AI Search — Vector Schema Migration
-- ============================================================

-- 1. 벡터 확장이 이미 켜져 있는지 확인
create extension if not exists vector;

-- 2. 제품 테이블의 기존 embedding(1536) 컬럼 삭제 (있는 경우)
ALTER TABLE public.products DROP COLUMN IF EXISTS embedding;

-- 3. 제품 테이블에 새로운 embedding(384) 컬럼 추가 및 텍스트 컬럼 추가
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS embedding vector(384);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS embedding_text text;

-- 4. 벡터 검색을 위한 매칭 함수 생성
DROP FUNCTION IF EXISTS public.match_products;

CREATE OR REPLACE FUNCTION public.match_products(
  query_embedding vector(384),
  match_threshold double precision DEFAULT 0.2,
  match_count integer DEFAULT 30
)
RETURNS TABLE (
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
  similarity          double precision
)
LANGUAGE sql STABLE
SET search_path TO 'public', 'extensions'
AS $$
  SELECT
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
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM public.products p
  WHERE p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
    AND p.is_active = true
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
$$;
