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
    const { batch_size = 5 } = await req.json().catch(() => ({}));

    // Check environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get total remaining count
    const { count: totalRemaining, error: countError } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .is("embedding", null)
      .eq("is_active", true); // only generate embedding for active products

    if (countError) throw countError;

    // Fetch records without embeddings
    const { data: rows, error } = await supabase
      .from("products")
      .select("id, name, brand, category, explain_short, explain_bullets, texture_desc, ingredients_top, tags")
      .is("embedding", null)
      .eq("is_active", true)
      .limit(batch_size);

    if (error) throw error;
    if (!rows || rows.length === 0) {
      return new Response(
        JSON.stringify({ message: "All records embedded", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // @ts-ignore - Supabase builtin AI
    const session = new Supabase.ai.Session("gte-small");

    let updated = 0;
    for (const row of rows) {
      // Create a combined text for embedding
      const embeddingText = [
        row.name,
        row.brand,
        `카테고리: ${row.category || ""}`,
        row.explain_short || "",
        ...(row.explain_bullets || []),
        row.texture_desc || "",
        ...(row.ingredients_top || []),
        ...(row.tags || [])
      ].filter(Boolean).join(" ");

      const embedding = await session.run(embeddingText, {
        mean_pool: true,
        normalize: true,
      });

      const { error: updateError } = await supabase
        .from("products")
        .update({
          embedding: Array.from(embedding),
          embedding_text: embeddingText,
        })
        .eq("id", row.id);

      if (!updateError) {
        updated++;
      } else {
        console.error(`Failed to update embedding for product ${row.id}`, updateError);
      }
    }

    return new Response(
      JSON.stringify({
        count: updated,
        remaining: (totalRemaining || 0) - updated,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Embedding generation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
