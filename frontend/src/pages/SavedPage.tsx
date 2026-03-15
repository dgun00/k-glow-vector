import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { resolveProductImageUrl } from "@/lib/utils";
import { toast } from "sonner";

interface Product {
    id: string; name: string; brand: string; category: string;
    price_band: string; finish: string; tone_fit: string;
    tags: string[]; ingredients_top: string[]; ingredients_caution: string[];
    texture_desc: string; explain_short: string; image_url: string;
}

const CATEGORY_LABEL: Record<string, string> = {
    skincare: "스킨케어", base: "베이스", lip: "립", eye: "아이", suncare: "선케어",
};

export default function SavedPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [compareMode, setCompareMode] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    const [compareOpen, setCompareOpen] = useState(false);

    useEffect(() => {
        if (!user) return;
        (async () => {
            const { data } = await supabase
                .from("saved_products")
                .select("product_id, products(*)")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (data) {
                setProducts(data.map((r: any) => r.products).filter(Boolean) as Product[]);
            }
            setLoading(false);
        })();
    }, [user]);

    const toggleCompare = () => { setCompareMode((m) => !m); setSelected([]); };
    const toggleSelect = (id: string) => {
        setSelected((prev) => {
            if (prev.includes(id)) return prev.filter((x) => x !== id);
            if (prev.length >= 3) return prev;
            return [...prev, id];
        });
    };

    const removeProduct = async (id: string) => {
        if (!user) return;
        await supabase.from("saved_products").delete().eq("user_id", user.id).eq("product_id", id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        toast.success("저장이 해제되었습니다");
    };

    const selectedProducts = products.filter((p) => selected.includes(p.id));
    const compareRows = [
        ["브랜드", (p: Product) => p.brand],
        ["카테고리", (p: Product) => CATEGORY_LABEL[p.category] ?? p.category],
        ["가격대", (p: Product) => p.price_band],
        ["피니시", (p: Product) => p.finish],
        ["톤핏", (p: Product) => p.tone_fit],
        ["핵심 성분", (p: Product) => p.ingredients_top.slice(0, 3).join(", ")],
        ["주의 성분", (p: Product) => p.ingredients_caution.join(", ") || "없음"],
        ["태그", (p: Product) => p.tags.slice(0, 3).join(", ")],
    ] as const;

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
                <Header showSearch />
                <main className="flex-1 container mx-auto max-w-2xl px-4 py-6 space-y-3 animate-pulse">
                    {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-[var(--color-muted)] rounded-xl" />)}
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
            <Header showSearch />
            <main className="flex-1 container mx-auto max-w-2xl px-4 py-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-[var(--color-foreground)]">저장한 제품</h1>
                    <Button variant={compareMode ? "default" : "outline"} size="sm" className="rounded-full" onClick={toggleCompare}>
                        <GitCompare size={14} /> 비교 모드
                    </Button>
                </div>

                {compareMode && selected.length > 0 && (
                    <div className="gradient-glow-subtle rounded-xl p-3 flex items-center justify-between">
                        <span className="text-sm text-[var(--color-foreground)]">{selected.length}/3 선택됨</span>
                        <Button variant="glow" size="sm" className="rounded-full" disabled={selected.length < 2} onClick={() => setCompareOpen(true)}>비교 보기</Button>
                    </div>
                )}

                {products.length === 0 ? (
                    <div className="text-center py-16 space-y-4">
                        <p className="text-5xl">🛍️</p>
                        <p className="text-[var(--color-muted-foreground)] text-lg">저장한 제품이 없습니다</p>
                        <Button variant="glow" className="rounded-full" onClick={() => navigate("/")}>
                            <Search size={14} /> 검색하러 가기
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {products.map((product, i) => (
                            <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-4 flex gap-3">
                                {compareMode && (
                                    <div className="flex items-start pt-1">
                                        <input type="checkbox" checked={selected.includes(product.id)} onChange={() => toggleSelect(product.id)}
                                            className="w-4 h-4 accent-[var(--color-primary)] cursor-pointer" />
                                    </div>
                                )}
                                <div className="w-20 h-20 rounded-lg overflow-hidden bg-[var(--color-muted)] shrink-0">
                                    {product.image_url ? (
                                        <img src={resolveProductImageUrl(product.image_url)} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><span className="text-2xl">✨</span></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 space-y-1.5">
                                    <div>
                                        <p className="font-semibold text-[var(--color-foreground)] truncate">{product.name}</p>
                                        <p className="text-xs text-[var(--color-muted-foreground)]">{product.brand} | {CATEGORY_LABEL[product.category] ?? product.category} | {product.price_band}</p>
                                    </div>
                                    <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-2">{product.explain_short}</p>
                                    <div className="flex flex-wrap gap-1">
                                        {product.tags.slice(0, 3).map((t) => (
                                            <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]">{t}</span>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2 pt-1">
                                        <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => removeProduct(product.id)}>💔 저장 해제</Button>
                                        <Button variant="ghost" size="sm" className="text-[var(--color-primary)] ml-auto text-xs" onClick={() => navigate(`/p/${product.id}`)}>상세 보기 →</Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
                <DialogContent className="max-w-3xl overflow-x-auto">
                    <DialogHeader><DialogTitle>제품 비교</DialogTitle></DialogHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[var(--color-border)]">
                                    <th className="text-left py-2 pr-4 text-[var(--color-muted-foreground)] font-medium w-28">속성</th>
                                    {selectedProducts.map((p) => <th key={p.id} className="text-left py-2 px-3 text-[var(--color-foreground)] font-semibold">{p.name}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {compareRows.map(([label, getter]) => (
                                    <tr key={label} className="border-b border-[var(--color-border)]/50">
                                        <td className="py-2 pr-4 text-[var(--color-muted-foreground)] text-xs">{label}</td>
                                        {selectedProducts.map((p) => <td key={p.id} className="py-2 px-3 text-[var(--color-foreground)] text-xs">{getter(p)}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => setCompareOpen(false)}>닫기</Button>
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    );
}
