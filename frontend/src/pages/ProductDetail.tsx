import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Share2, ChevronDown, Sparkles } from "lucide-react";
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
    all_ingredients: string; texture_desc: string; explain_short: string;
    explain_bullets: string[]; image_url: string;
}

const CATEGORY_LABEL: Record<string, string> = {
    skincare: "스킨케어", base: "베이스", lip: "립", eye: "아이", suncare: "선케어",
};

export default function ProductDetail() {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const { isLoggedIn, user } = useAuth();

    const [product, setProduct] = useState<Product | null>(null);
    const [similar, setSimilar] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);
    const [showIngredients, setShowIngredients] = useState(false);
    const [paymentOpen, setPaymentOpen] = useState(false);

    useEffect(() => {
        if (!productId) return;
        setLoading(true);
        setShowIngredients(false);

        (async () => {
            // 제품 상세 fetch
            const { data: prod } = await supabase
                .from("products")
                .select("*")
                .eq("id", productId)
                .single();

            if (prod) {
                setProduct(prod);

                // 유사 제품 fetch
                const { data: similarsRel } = await supabase
                    .from("product_similars")
                    .select("similar_id, score")
                    .eq("product_id", productId)
                    .order("score", { ascending: false })
                    .limit(4);

                if (similarsRel && similarsRel.length > 0) {
                    const simIds = similarsRel.map((r) => r.similar_id);
                    const { data: simProds } = await supabase
                        .from("products")
                        .select("id, name, brand, category, image_url")
                        .in("id", simIds);
                    if (simProds) setSimilar(simProds as Product[]);
                }
            }

            // 저장 상태 check
            if (isLoggedIn && user) {
                const { data: savedRow } = await supabase
                    .from("saved_products")
                    .select("id")
                    .eq("user_id", user.id)
                    .eq("product_id", productId)
                    .maybeSingle();
                setSaved(!!savedRow);
            }

            setLoading(false);
        })();
    }, [productId, isLoggedIn, user]);

    const toggleSave = async () => {
        if (!isLoggedIn || !user) {
            navigate(`/auth?next=${encodeURIComponent(`/p/${productId}`)}&intent=save`);
            return;
        }
        if (saved) {
            await supabase.from("saved_products").delete().eq("user_id", user.id).eq("product_id", productId!);
            setSaved(false);
            toast.success("저장이 해제되었습니다");
        } else {
            await supabase.from("saved_products").insert({ user_id: user.id, product_id: productId! });
            setSaved(true);
            toast.success("저장되었습니다");
        }
    };

    const handleReport = () => {
        if (!isLoggedIn) {
            navigate(`/auth?next=${encodeURIComponent(`/p/${productId}`)}&intent=buy_report`);
            return;
        }
        setPaymentOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
                <Header showSearch />
                <main className="flex-1 container mx-auto max-w-4xl px-4 py-6 animate-pulse space-y-4">
                    <div className="h-64 w-full bg-[var(--color-muted)] rounded-xl" />
                    <div className="h-6 w-1/3 bg-[var(--color-muted)] rounded" />
                    <div className="h-4 w-1/4 bg-[var(--color-muted)] rounded" />
                </main>
                <Footer />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
                <Header showSearch />
                <main className="flex-1 flex flex-col items-center justify-center text-center py-16 space-y-4">
                    <p className="text-4xl">🔍</p>
                    <p className="text-[var(--color-muted-foreground)]">제품을 찾을 수 없습니다.</p>
                    <Button variant="outline" onClick={() => navigate("/")}>홈으로</Button>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
            <Header showSearch />
            <main className="flex-1 container mx-auto max-w-4xl px-4 py-6 space-y-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors cursor-pointer">
                    <ArrowLeft size={14} /> 뒤로
                </button>

                {/* Hero */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
                    className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-64 h-48 md:h-64 rounded-2xl overflow-hidden bg-[var(--color-muted)] shrink-0">
                        {product.image_url ? (
                            <img src={resolveProductImageUrl(product.image_url)} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center"><span className="text-5xl">✨</span></div>
                        )}
                    </div>
                    <div className="flex-1 space-y-3">
                        <div>
                            <p className="text-xs text-[var(--color-muted-foreground)] mb-1">{product.brand}</p>
                            <h1 className="text-2xl font-bold text-[var(--color-foreground)]">{product.name}</h1>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {[CATEGORY_LABEL[product.category] ?? product.category, product.finish, product.tone_fit !== "any" ? product.tone_fit : null, product.price_band]
                                .filter(Boolean).map((badge) => (
                                    <span key={badge} className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]">{badge}</span>
                                ))}
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button variant={saved ? "default" : "outline"} size="sm" className="rounded-full" onClick={toggleSave}>
                                <Heart size={12} className={saved ? "fill-current" : ""} />
                                {saved ? "저장됨" : "저장"}
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-full" onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success("링크가 복사되었습니다"); }}>
                                <Share2 size={12} /> 공유
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* 추천 근거 */}
                <div className="space-y-2">
                    <p className="font-semibold text-[var(--color-foreground)]">추천 근거</p>
                    <div className="gradient-glow-subtle rounded-xl p-4 space-y-2">
                        <p className="text-sm text-[var(--color-muted-foreground)]">{product.explain_short}</p>
                        <ul className="space-y-1">
                            {(product.explain_bullets || []).map((b) => (
                                <li key={b} className="flex gap-2 text-sm text-[var(--color-muted-foreground)]">
                                    <span className="text-[var(--color-primary)] shrink-0">•</span>
                                    <span>{b}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* 성분 요약 */}
                <div className="space-y-2">
                    <p className="font-semibold text-[var(--color-foreground)]">성분 요약</p>
                    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-4 space-y-2">
                        <p className="text-sm text-[var(--color-muted-foreground)]">핵심 성분: {product.ingredients_top.join(", ")}</p>
                        {product.ingredients_caution.length > 0 && (
                            <p className="text-sm text-[var(--color-destructive)]">⚠ 주의 성분: {product.ingredients_caution.join(", ")}</p>
                        )}
                        <Button variant="ghost" size="sm" className="text-xs gap-1 px-0" onClick={() => setShowIngredients((v) => !v)}>
                            전체 성분 보기
                            <ChevronDown size={14} className={`transition-transform duration-200 ${showIngredients ? "rotate-180" : ""}`} />
                        </Button>
                        {showIngredients && (
                            <div className="text-xs text-[var(--color-muted-foreground)] bg-[var(--color-muted)] p-3 rounded-lg">{product.all_ingredients}</div>
                        )}
                    </div>
                </div>

                {/* 사용감/제형 */}
                <div className="space-y-2">
                    <p className="font-semibold text-[var(--color-foreground)]">사용감 / 제형</p>
                    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-4 space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                            {product.tags.slice(0, 4).map((t) => (
                                <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-muted-foreground)]">{t}</span>
                            ))}
                        </div>
                        <p className="text-sm text-[var(--color-muted-foreground)]">{product.texture_desc}</p>
                    </div>
                </div>

                {/* 유사 제품 */}
                {similar.length > 0 && (
                    <div className="space-y-2">
                        <p className="font-semibold text-[var(--color-foreground)]">유사 제품</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {similar.map((s) => (
                                <button key={s.id} onClick={() => navigate(`/p/${s.id}`)}
                                    className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-3 hover:glow-shadow transition-all text-left cursor-pointer">
                                    <div className="aspect-square rounded-lg overflow-hidden bg-[var(--color-muted)] mb-2">
                                        {s.image_url ? (
                                            <img src={resolveProductImageUrl(s.image_url)} alt={s.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"><span className="text-xl">✨</span></div>
                                        )}
                                    </div>
                                    <p className="text-xs font-medium text-[var(--color-foreground)] line-clamp-2">{s.name}</p>
                                    <p className="text-xs text-[var(--color-muted-foreground)]">{s.brand}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 루틴 리포트 CTA */}
                <div className="gradient-glow rounded-2xl p-6 text-center space-y-3">
                    <Sparkles className="mx-auto text-[var(--color-primary)]" size={28} />
                    <p className="font-bold text-[var(--color-foreground)]">이 제품 포함 루틴 리포트 만들기</p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">AI가 AM/PM 루틴, 주의 조합, 대체 제품을 분석합니다</p>
                    <Button variant="secondary" className="rounded-full" onClick={handleReport}>리포트 만들기 — ₩4,900</Button>
                </div>
            </main>

            <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
                <DialogContent className="max-w-sm text-center space-y-4 p-8">
                    <DialogTitle>루틴 리포트</DialogTitle>
                    <p className="text-4xl">✨</p>
                    <p className="text-lg font-bold text-[var(--color-foreground)]">프리미엄 루틴 리포트</p>
                    <p className="text-2xl font-bold text-[var(--color-primary)]">₩4,900</p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">AI가 AM/PM 루틴, 성분 시너지, 주의 조합, 대체 제품을 분석합니다.</p>
                    <Button variant="glow" className="w-full rounded-xl" onClick={() => { setPaymentOpen(false); navigate(`/report/demo`); }}>결제 완료 (데모)</Button>
                    <Button variant="outline" className="w-full rounded-xl" onClick={() => setPaymentOpen(false)}>닫기</Button>
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    );
}
