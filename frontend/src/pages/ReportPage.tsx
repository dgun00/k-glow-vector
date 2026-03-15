import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Share2, FileText, Search, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
import { resolveProductImageUrl } from "@/lib/utils";

interface Report {
    id: string; title: string; created_at: string; summary: string;
    routine_am: string[]; routine_pm: string[];
    reasoning: string[]; warnings: string[]; alternatives: string[];
    source_query: string;
}

interface AltProduct { id: string; name: string; brand: string; image_url: string; }

// 데모용 리포트 (결제 미구현 시 데모 데이터 표시)
const DEMO_REPORT: Report = {
    id: "demo",
    title: "나만의 K-뷰티 스킨케어 루틴",
    created_at: new Date().toISOString(),
    summary: "민감 복합 피부에 맞춘 보습 중심의 AM/PM 루틴입니다. 수분 세럼과 시카 진정 에센스를 중심으로, 아침에는 가벼운 수분 보호막을, 저녁에는 집중 재생을 목표로 합니다.",
    routine_am: [
        "폼 클렌저 또는 미온수 세안",
        "히알루론산 100 세럼 (더페이스샵)",
        "시카 수딩 에센스 (닥터지)",
        "수분 크림 — 얇게 도포",
        "선케어 에센스 SPF50+ (이니스프리)",
    ],
    routine_pm: [
        "버블 또는 오일 클렌저로 이중 세안",
        "토너 — 수분 공급",
        "워터멜론 글로우 세럼 (글로우 레시피)",
        "레티놀 0.1 크림 (코스알엑스) — 주 3회",
        "수분 크림 또는 오일 마무리",
    ],
    reasoning: [
        "히알루론산으로 기초 수분을 충전한 후 세럼으로 고정",
        "레티놀은 주 3회로 자극 없이 피부 재생 촉진",
        "선크림은 무기자차로 민감 피부 자극 최소화",
        "시카 성분이 낮 시간 자극 받은 피부를 저녁에 회복",
    ],
    warnings: [
        "레티놀과 비타민C 세럼 동시 사용 주의 — 다른 날 교대 사용 권장",
        "향료 함유 제품 사용 시 민감 부위 패치 테스트 필요",
    ],
    alternatives: ["p004", "p006"],
    source_query: "민감 피부 수분 세럼",
};

export default function ReportPage() {
    const { reportId } = useParams<{ reportId: string }>();
    const navigate = useNavigate();
    const [report, setReport] = useState<Report | null>(null);
    const [altProducts, setAltProducts] = useState<AltProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        (async () => {
            // 데모 리포트 처리
            if (reportId === "demo") {
                setReport(DEMO_REPORT);
                // 대체 제품 fetch
                const { data } = await supabase.from("products").select("id, name, brand, image_url").in("id", DEMO_REPORT.alternatives);
                if (data) setAltProducts(data);
                setLoading(false);
                return;
            }

            // 실제 리포트 fetch
            const { data } = await supabase.from("reports").select("*").eq("id", reportId).single();
            if (data) {
                setReport(data);
                if (data.alternatives?.length) {
                    const { data: alts } = await supabase.from("products").select("id, name, brand, image_url").in("id", data.alternatives);
                    if (alts) setAltProducts(alts);
                }
            } else {
                // fallback: 데모 표시
                setReport(DEMO_REPORT);
            }
            setLoading(false);
        })();
    }, [reportId]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
                <Header showSearch />
                <main className="flex-1 container mx-auto max-w-3xl px-4 py-8 animate-pulse">
                    <div className="h-64 w-full bg-[var(--color-muted)] rounded-xl" />
                </main>
                <Footer />
            </div>
        );
    }

    if (!report) {
        return (
            <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
                <Header showSearch />
                <main className="flex-1 flex flex-col items-center justify-center py-16 space-y-4">
                    <p className="text-4xl">📄</p>
                    <p className="text-[var(--color-muted-foreground)]">리포트를 찾을 수 없습니다.</p>
                    <Button variant="outline" onClick={() => navigate("/")}>홈으로</Button>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
            <Header showSearch />
            <main className="flex-1 container mx-auto max-w-3xl px-4 py-6 space-y-6">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                    <h1 className="text-2xl font-bold text-[var(--color-foreground)]">{report.title}</h1>
                    <p className="text-sm text-[var(--color-muted-foreground)]">{new Date(report.created_at).toLocaleDateString("ko-KR")}</p>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="rounded-full" onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success("링크 복사됨"); }}>
                            <Share2 size={12} /> 공유
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-full" onClick={() => toast.info("PDF 다운로드는 준비 중입니다")}>
                            <FileText size={12} /> PDF
                        </Button>
                        <Button variant="glow" size="sm" className="rounded-full" onClick={() => navigate("/")}>
                            <Search size={12} /> 새 검색
                        </Button>
                    </div>
                </motion.div>

                {/* Summary */}
                <div className="gradient-glow-subtle rounded-xl p-5">
                    <p className="text-xs font-semibold text-[var(--color-primary)] mb-2">요약</p>
                    <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">{report.summary}</p>
                </div>

                {/* AM/PM Routines */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5 space-y-3">
                        <div className="flex items-center gap-2">
                            <Sun size={18} className="text-[var(--color-accent)]" />
                            <p className="font-bold text-[var(--color-foreground)]">AM 루틴</p>
                        </div>
                        <ol className="space-y-2">
                            {report.routine_am.map((step, i) => (
                                <li key={i} className="flex gap-2 text-sm text-[var(--color-muted-foreground)]">
                                    <span className="text-[var(--color-primary)] font-bold shrink-0">{i + 1}.</span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5 space-y-3">
                        <div className="flex items-center gap-2">
                            <Moon size={18} className="text-[var(--color-primary)]" />
                            <p className="font-bold text-[var(--color-foreground)]">PM 루틴</p>
                        </div>
                        <ol className="space-y-2">
                            {report.routine_pm.map((step, i) => (
                                <li key={i} className="flex gap-2 text-sm text-[var(--color-muted-foreground)]">
                                    <span className="text-[var(--color-primary)] font-bold shrink-0">{i + 1}.</span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>

                {/* Reasoning */}
                <div className="space-y-2">
                    <p className="font-semibold text-[var(--color-foreground)]">조합 근거</p>
                    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-4 space-y-2">
                        {report.reasoning.map((r, i) => (
                            <div key={i} className="flex gap-2 text-sm text-[var(--color-muted-foreground)]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)] mt-2 shrink-0" />
                                <span>{r}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Warnings */}
                {report.warnings.length > 0 && (
                    <div className="space-y-2">
                        <p className="font-semibold text-[var(--color-destructive)]">⚠ 주의 조합</p>
                        <div className="border border-[var(--color-destructive)]/30 bg-[var(--color-destructive)]/5 rounded-xl p-4 space-y-2">
                            {report.warnings.map((w, i) => <p key={i} className="text-sm text-[var(--color-muted-foreground)]">{w}</p>)}
                        </div>
                    </div>
                )}

                {/* Alternatives */}
                {altProducts.length > 0 && (
                    <div className="space-y-2">
                        <p className="font-semibold text-[var(--color-foreground)]">대체 제품</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {altProducts.map((p) => (
                                <button key={p.id} onClick={() => navigate(`/p/${p.id}`)}
                                    className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-3 hover:glow-shadow transition-all cursor-pointer text-left">
                                    <div className="aspect-square rounded-lg overflow-hidden bg-[var(--color-muted)] mb-2">
                                        {p.image_url ? (
                                            <img src={resolveProductImageUrl(p.image_url)} alt={p.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"><span className="text-xl">✨</span></div>
                                        )}
                                    </div>
                                    <p className="text-xs font-medium text-[var(--color-foreground)] line-clamp-2">{p.name}</p>
                                    <p className="text-xs text-[var(--color-muted-foreground)]">{p.brand}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
