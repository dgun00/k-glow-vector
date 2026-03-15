import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Heart, ArrowRight, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { resolveProductImageUrl } from "@/lib/utils";

interface Product {
    id: string; name: string; brand: string; category: string;
    price_band: string; finish: string; tone_fit: string;
    tags: string[]; ingredients_top: string[]; ingredients_caution: string[];
    explain_short: string; image_url: string;
}

const CATEGORY_LABELS: Record<string, string> = {
    skincare: "스킨케어", base: "베이스", lip: "립", eye: "아이", suncare: "선케어",
};

const STEPS = ["쿼리 분석 중...", "제품 검색 중...", "결과 정리 중..."];

function LoadingSteps() {
    const [step, setStep] = useState(0);
    useEffect(() => {
        const t1 = setTimeout(() => setStep(1), 500);
        const t2 = setTimeout(() => setStep(2), 1000);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    return (
        <div className="gradient-glow-subtle rounded-xl p-6 space-y-4">
            <p className="text-sm font-medium text-[var(--color-muted-foreground)]">AI가 제품을 분석하는 중...</p>
            <div className="space-y-2">
                {STEPS.map((s, i) => (
                    <div key={s} className={`flex items-center gap-2 text-sm transition-colors ${i < step ? "text-[var(--color-primary)]" : i === step ? "text-[var(--color-muted-foreground)] animate-pulse" : "text-[var(--color-muted-foreground)]/40"}`}>
                        <span>{i < step ? "✓" : i === step ? "●" : "○"}</span>
                        <span>{s}</span>
                    </div>
                ))}
            </div>
            <div className="h-1 w-full rounded-full bg-[var(--color-muted)] overflow-hidden">
                <div className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
            </div>
        </div>
    );
}

const SEARCH_TIMEOUT_MS = 15000;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function searchProductsAI(q: string, filters?: any): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);

    try {
        const response = await fetch(
            `${SUPABASE_URL}/functions/v1/ai-search`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${ANON_KEY}`,
                    apikey: ANON_KEY,
                },
                body: JSON.stringify({ query: q, filters }),
                signal: controller.signal,
            }
        );
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error(`${response.status}`);
        return await response.json();
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { isLoggedIn, user } = useAuth();
    const q = searchParams.get("q") ?? "";

    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("all");
    const [visibleCount, setVisibleCount] = useState(10);
    const [savedIds, setSavedIds] = useState<string[]>([]);
    const [paymentOpen, setPaymentOpen] = useState(false);

    // 검색 실행
    useEffect(() => {
        if (!q) { navigate("/", { replace: true }); return; }
        setLoading(true);
        setActiveCategory("all");
        setVisibleCount(10);

        (async () => {
            try {
                // [1] AI 시맨틱 검색 시도 (Timeout 15s)
                const aiResult = await searchProductsAI(q);
                if (aiResult?.results?.length > 0) {
                    setResults(aiResult.results);
                    await supabase.from("search_logs").insert({
                        user_id: isLoggedIn && user ? user.id : null,
                        query: q,
                        result_count: aiResult.results.length,
                    });
                    setLoading(false);
                    return;
                }
            } catch (err) {
                console.warn("AI search failed, falling back to keyword search:", err);
            }

            // [2] 키워드 폴백 검색 (기존 로직 그대로 유지)
            // 텍스트 기반 검색 (name, brand, tags, explain_short ilike)
            const terms = q.trim().split(/\s+/);
            let query = supabase
                .from("products")
                .select("id, name, brand, category, price_band, finish, tone_fit, tags, ingredients_top, ingredients_caution, explain_short, image_url")
                .eq("is_active", true);

            // 각 단어 OR 검색
            const orFilters = terms.map(t =>
                `name.ilike.%${t}%,brand.ilike.%${t}%,explain_short.ilike.%${t}%`
            ).join(",");
            query = query.or(orFilters);

            const { data, error } = await query.limit(50);

            if (!error && data) {
                setResults(data);
                // 검색 로그 기록
                await supabase.from("search_logs").insert({
                    user_id: isLoggedIn && user ? user.id : null,
                    query: q,
                    result_count: data.length,
                });
            }
            setLoading(false);
        })();
    }, [q, navigate, isLoggedIn, user]);

    // 저장 상태 fetch
    useEffect(() => {
        if (!isLoggedIn || !user) { setSavedIds([]); return; }
        (async () => {
            const { data } = await supabase
                .from("saved_products")
                .select("product_id")
                .eq("user_id", user.id);
            if (data) setSavedIds(data.map((r) => r.product_id));
        })();
    }, [isLoggedIn, user]);

    const categories = ["all", ...Object.keys(CATEGORY_LABELS)];
    const filteredResults = activeCategory === "all" ? results : results.filter((p) => p.category === activeCategory);
    const visibleResults = filteredResults.slice(0, visibleCount);

    const toggleSave = async (id: string) => {
        if (!isLoggedIn || !user) {
            navigate(`/auth?next=${encodeURIComponent(`/search?q=${encodeURIComponent(q)}`)}&intent=save`);
            return;
        }
        if (savedIds.includes(id)) {
            await supabase.from("saved_products").delete().eq("user_id", user.id).eq("product_id", id);
            setSavedIds((prev) => prev.filter((x) => x !== id));
            toast.success("저장이 해제되었습니다");
        } else {
            await supabase.from("saved_products").insert({ user_id: user.id, product_id: id });
            setSavedIds((prev) => [...prev, id]);
            toast.success("저장되었습니다");
        }
    };

    const handleReport = () => {
        if (!isLoggedIn) {
            navigate(`/auth?next=${encodeURIComponent(`/search?q=${encodeURIComponent(q)}`)}&intent=buy_report`);
            return;
        }
        setPaymentOpen(true);
    };

    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
            <Header showSearch />
            <main className="flex-1 container mx-auto max-w-2xl px-4 py-6 space-y-4">
                {loading ? (
                    <LoadingSteps />
                ) : (
                    <>
                        {/* Search Insight */}
                        <div className="gradient-glow-subtle rounded-xl p-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-foreground)]">
                                <Sparkles size={14} className="text-[var(--color-primary)]" />
                                검색 결과
                            </div>
                            <p className="text-sm text-[var(--color-muted-foreground)]">
                                <span className="font-medium text-[var(--color-foreground)]">"{q}"</span>에 대해{" "}
                                {results.length}개 제품을 찾았습니다.
                            </p>
                            {results.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {[...new Set(results.flatMap((p) => p.tags).slice(0, 5))].map((tag) => (
                                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]">{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Filter bar */}
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {categories.map((cat) => (
                                <Button
                                    key={cat}
                                    variant={activeCategory === cat ? "default" : "chip"}
                                    size="sm"
                                    className="rounded-full shrink-0"
                                    onClick={() => { setActiveCategory(cat); setVisibleCount(10); }}
                                >
                                    {cat === "all" ? "전체" : CATEGORY_LABELS[cat] ?? cat}
                                    {activeCategory === cat && <span className="ml-1">●</span>}
                                </Button>
                            ))}
                        </div>

                        <p className="text-sm text-[var(--color-muted-foreground)]">
                            "{q}" 검색 결과 {filteredResults.length}개
                        </p>

                        {/* Product list */}
                        {filteredResults.length === 0 ? (
                            <div className="text-center py-16 space-y-4">
                                <p className="text-5xl">😢</p>
                                <p className="text-[var(--color-muted-foreground)]">결과가 없습니다</p>
                                <Button variant="outline" onClick={() => { setActiveCategory("all"); setVisibleCount(10); }}>
                                    <SlidersHorizontal size={14} className="mr-1" /> 필터 초기화
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {visibleResults.map((product, i) => {
                                    const saved = savedIds.includes(product.id);
                                    return (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-4 flex gap-3"
                                        >
                                            <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-[var(--color-muted)]">
                                                {product.image_url ? (
                                                    <img src={resolveProductImageUrl(product.image_url)} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center"><span className="text-2xl">✨</span></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-1.5">
                                                <div>
                                                    <p className="font-semibold text-[var(--color-foreground)] truncate">{product.name}</p>
                                                    <p className="text-xs text-[var(--color-muted-foreground)]">
                                                        {product.brand} | {CATEGORY_LABELS[product.category] ?? product.category} | {product.price_band}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-2">{product.explain_short}</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {product.tags.slice(0, 3).map((t) => (
                                                        <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]">{t}</span>
                                                    ))}
                                                    {product.ingredients_caution.length > 0 && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-destructive)]/10 text-[var(--color-destructive)]">⚠ {product.ingredients_caution[0]}</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 pt-1">
                                                    <Button variant={saved ? "default" : "outline"} size="sm" className="rounded-full" onClick={() => toggleSave(product.id)}>
                                                        <Heart size={12} className={saved ? "fill-current" : ""} />
                                                        {saved ? "저장됨" : "저장"}
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="text-[var(--color-primary)] ml-auto" onClick={() => navigate(`/p/${product.id}`)}>
                                                        상세 보기 <ArrowRight size={12} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                {visibleCount < filteredResults.length && (
                                    <div className="flex justify-center pt-2">
                                        <Button variant="outline" onClick={() => setVisibleCount((v) => v + 10)}>더 보기</Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Premium CTA */}
                        <div className="gradient-glow rounded-2xl p-6 text-center space-y-3">
                            <Sparkles className="mx-auto text-[var(--color-primary)]" size={28} />
                            <p className="font-bold text-[var(--color-foreground)]">프리미엄 루틴 리포트 만들기</p>
                            <p className="text-sm text-[var(--color-muted-foreground)]">AI가 AM/PM 루틴, 주의 조합, 대체 제품을 분석합니다</p>
                            <Button variant="secondary" className="rounded-full" onClick={handleReport}>
                                ✨ 프리미엄 루틴 리포트 만들기 — ₩4,900
                            </Button>
                        </div>
                    </>
                )}
            </main>

            {/* Payment Modal */}
            <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
                <DialogContent className="max-w-sm text-center space-y-4 p-8">
                    <DialogTitle>루틴 리포트</DialogTitle>
                    <p className="text-4xl">✨</p>
                    <p className="text-lg font-bold text-[var(--color-foreground)]">프리미엄 루틴 리포트</p>
                    <p className="text-2xl font-bold text-[var(--color-primary)]">₩4,900</p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">AI가 AM/PM 루틴, 성분 시너지, 주의 조합, 대체 제품을 분석합니다.</p>
                    <Button variant="glow" className="w-full rounded-xl" onClick={() => { setPaymentOpen(false); navigate(`/report/demo`); }}>
                        결제 완료 (데모)
                    </Button>
                    <Button variant="outline" className="w-full rounded-xl" onClick={() => setPaymentOpen(false)}>닫기</Button>
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    );
}
