import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, filters } = await req.json().catch(() => ({}));
    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. 쿼리 → 벡터 변환
    // @ts-ignore - Supabase builtin AI
    const session = new Supabase.ai.Session("gte-small");
    const queryEmbedding = await session.run(query, {
      mean_pool: true,
      normalize: true,
    });

    // 2. 벡터 유사도 검색 (RPC)
    const { data: matches, error: rpcError } = await supabase.rpc(
      "match_products",
      {
        query_embedding: Array.from(queryEmbedding),
        match_threshold: 0.2, // threshold 조정 가능
        match_count: 30,
      }
    );

    if (rpcError) throw rpcError;

    if (!matches || matches.length === 0) {
      return new Response(
        JSON.stringify({
          intent_summary: `"${query}"에 대한 검색 결과가 없습니다.`,
          results: [],
          search_meta: null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // `match_products` 함수가 제품의 기본 정보까지 반환하도록 설계되었다면 추가 조회가 불필요하지만,
    // 만약 `matches`에 모든 제품 정보(id, name, brand, image_url 등)가 다 들어있다면 필터 처리만 해주면 됩니다.
    // 기존 match_products 함수는 모든 주요 컬럼과 similarity를 포함하여 리턴합니다.
    let results = matches;

    // 필터 적용 (예: 카테고리 필터가 있다면)
    if (filters?.category) {
      results = results.filter((m: any) => m.category === filters.category);
    }

    // 기타 필터 (예: 스킨타입 등 클라이언트 사이드 필터가 있다면 여기에 추가)

    // 유사도 순으로 다시 정렬 (이미 쿼리에서 정렬되어 있을 수 있지만, 필터링 후 확인 목적)
    results = results.sort((a: any, b: any) => b.similarity - a.similarity);

    // 5. 검색 메타데이터 계산
    const similarities = results.map((r: any) => r.similarity);
    const searchMeta = {
      model: "gte-small",
      embedding_dim: 384,
      match_threshold: 0.2,
      candidates_found: matches.length,
      results_after_filter: results.length,
      top_similarity: similarities.length > 0
        ? Math.round(Math.max(...similarities) * 1000) / 1000
        : 0,
      avg_similarity: similarities.length > 0
        ? Math.round(
          (similarities.reduce((a: number, b: number) => a + b, 0) /
            similarities.length) *
          1000
        ) / 1000
        : 0,
    };

    // 6. 응답
    return new Response(
      JSON.stringify({
        intent_summary: `"${query}" 검색으로 ${results.length}개 결과를 찾았습니다.`,
        results,
        search_meta: searchMeta,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("ai-search error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
