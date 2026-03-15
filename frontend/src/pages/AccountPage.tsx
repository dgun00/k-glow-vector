import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

interface UserPreferences {
    skin_type: string; tone: string; concerns: string[];
    fragrance_free: boolean; exclude_ingredients: string[]; budget_band: string;
}

interface SearchLog {
    query: string; created_at: string; result_count?: number;
}

const SKIN_TYPES = ["건성", "지성", "복합", "민감"];
const TONES = ["웜", "쿨", "뉴트럴", "모름"];
const CONCERNS = ["홍조", "트러블", "속건조", "모공", "각질", "잡티", "주름", "다크서클"];
const EXCLUDE_OPTS = ["향료", "에탄올", "실리콘", "파라벤"];
const BUDGETS = ["1-3만", "3-5만", "5만+"];

const EMPTY_PREFS: UserPreferences = {
    skin_type: "", tone: "", concerns: [], fragrance_free: false, exclude_ingredients: [], budget_band: "",
};

const toggleArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

export default function AccountPage() {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [tab, setTab] = useState<"prefs" | "logs">("prefs");
    const [prefs, setPrefs] = useState<UserPreferences>(EMPTY_PREFS);
    const [prefId, setPrefId] = useState<string | null>(null);
    const [logs, setLogs] = useState<SearchLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        (async () => {
            // 선호도 fetch
            const { data: prefData } = await supabase
                .from("user_preferences")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle();
            if (prefData) {
                setPrefs({
                    skin_type: prefData.skin_type ?? "",
                    tone: prefData.tone ?? "",
                    concerns: prefData.concerns ?? [],
                    fragrance_free: prefData.fragrance_free ?? false,
                    exclude_ingredients: prefData.exclude_ingredients ?? [],
                    budget_band: prefData.budget_band ?? "",
                });
                setPrefId(prefData.id);
            }

            // 검색 로그 fetch
            const { data: logsData } = await supabase
                .from("search_logs")
                .select("query, created_at, result_count")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(20);
            if (logsData) setLogs(logsData);

            setLoading(false);
        })();
    }, [user]);

    const savePrefs = async () => {
        if (!user) return;
        const upsertData = {
            user_id: user.id,
            skin_type: prefs.skin_type || null,
            tone: prefs.tone || null,
            concerns: prefs.concerns,
            fragrance_free: prefs.fragrance_free,
            exclude_ingredients: prefs.exclude_ingredients,
            budget_band: prefs.budget_band || null,
        };
        if (prefId) {
            await supabase.from("user_preferences").update(upsertData).eq("id", prefId);
        } else {
            const { data } = await supabase.from("user_preferences").insert(upsertData).select().single();
            if (data) setPrefId(data.id);
        }
        toast.success("조건이 저장되었습니다");
    };

    const handleSignOut = async () => {
        await signOut();
        navigate("/");
        toast.success("로그아웃되었습니다");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
                <Header showSearch />
                <main className="flex-1 container mx-auto max-w-2xl px-4 py-6 animate-pulse">
                    <div className="h-48 w-full bg-[var(--color-muted)] rounded-xl" />
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
                    <h1 className="text-2xl font-bold text-[var(--color-foreground)]">계정</h1>
                    <Button variant="outline" size="sm" className="rounded-full" onClick={handleSignOut}>로그아웃</Button>
                </div>

                {user && (
                    <p className="text-sm text-[var(--color-muted-foreground)]">{user.email}</p>
                )}

                {/* Tab nav */}
                <div className="bg-[var(--color-muted)] p-1 rounded-xl w-fit flex gap-1">
                    {(["prefs", "logs"] as const).map((t) => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${tab === t ? "bg-[var(--color-card)] text-[var(--color-foreground)] shadow-sm" : "text-[var(--color-muted-foreground)]"}`}>
                            {t === "prefs" ? "내 조건" : "검색 로그"}
                        </button>
                    ))}
                </div>

                {tab === "prefs" && (
                    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 space-y-5">
                        {/* 피부 타입 */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-[var(--color-foreground)]">피부 타입</p>
                            <div className="flex flex-wrap gap-2">
                                {SKIN_TYPES.map((t) => (
                                    <Button key={t} variant={prefs.skin_type === t ? "default" : "chip"} size="sm" className="rounded-full"
                                        onClick={() => setPrefs({ ...prefs, skin_type: prefs.skin_type === t ? "" : t })}>{t}</Button>
                                ))}
                            </div>
                        </div>
                        {/* 톤 */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-[var(--color-foreground)]">톤</p>
                            <div className="flex flex-wrap gap-2">
                                {TONES.map((t) => (
                                    <Button key={t} variant={prefs.tone === t ? "default" : "chip"} size="sm" className="rounded-full"
                                        onClick={() => setPrefs({ ...prefs, tone: prefs.tone === t ? "" : t })}>{t}</Button>
                                ))}
                            </div>
                        </div>
                        {/* 고민 */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-[var(--color-foreground)]">고민 (복수 선택)</p>
                            <div className="flex flex-wrap gap-2">
                                {CONCERNS.map((c) => (
                                    <Button key={c} variant={prefs.concerns.includes(c) ? "default" : "chip"} size="sm" className="rounded-full"
                                        onClick={() => setPrefs({ ...prefs, concerns: toggleArray(prefs.concerns, c) })}>{c}</Button>
                                ))}
                            </div>
                        </div>
                        {/* 무향 */}
                        <div className="flex items-center gap-3">
                            <p className="text-sm font-medium text-[var(--color-foreground)]">무향 선호</p>
                            <button onClick={() => setPrefs({ ...prefs, fragrance_free: !prefs.fragrance_free })}
                                className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${prefs.fragrance_free ? "bg-[var(--color-primary)]" : "bg-[var(--color-muted)]"}`}>
                                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[var(--color-primary-foreground)] transition-transform ${prefs.fragrance_free ? "translate-x-5" : ""}`} />
                            </button>
                            <span className="text-xs text-[var(--color-muted-foreground)]">{prefs.fragrance_free ? "ON" : "OFF"}</span>
                        </div>
                        {/* 제외 성분 */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-[var(--color-foreground)]">제외 성분 (복수 선택)</p>
                            <div className="flex flex-wrap gap-2">
                                {EXCLUDE_OPTS.map((e) => (
                                    <Button key={e} variant={prefs.exclude_ingredients.includes(e) ? "default" : "chip"} size="sm" className="rounded-full"
                                        onClick={() => setPrefs({ ...prefs, exclude_ingredients: toggleArray(prefs.exclude_ingredients, e) })}>{e}</Button>
                                ))}
                            </div>
                        </div>
                        {/* 예산 */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-[var(--color-foreground)]">예산</p>
                            <div className="flex flex-wrap gap-2">
                                {BUDGETS.map((b) => (
                                    <Button key={b} variant={prefs.budget_band === b ? "default" : "chip"} size="sm" className="rounded-full"
                                        onClick={() => setPrefs({ ...prefs, budget_band: prefs.budget_band === b ? "" : b })}>{b}</Button>
                                ))}
                            </div>
                        </div>
                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <Button variant="glow" className="rounded-xl" onClick={savePrefs}>저장</Button>
                            <Button variant="outline" className="rounded-xl" onClick={() => setPrefs(EMPTY_PREFS)}>초기화</Button>
                        </div>
                    </div>
                )}

                {tab === "logs" && (
                    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden divide-y divide-[var(--color-border)]">
                        {logs.length === 0 ? (
                            <p className="p-6 text-center text-sm text-[var(--color-muted-foreground)]">검색 기록이 없습니다</p>
                        ) : (
                            logs.map((log) => (
                                <div key={log.query + log.created_at} className="flex items-center justify-between px-4 py-3">
                                    <div>
                                        <p className="text-sm text-[var(--color-foreground)]">"{log.query}"</p>
                                        <p className="text-xs text-[var(--color-muted-foreground)]">
                                            {new Date(log.created_at).toLocaleDateString("ko-KR")}
                                            {log.result_count !== undefined && ` · 결과 ${log.result_count}개`}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-xs text-[var(--color-primary)]"
                                        onClick={() => navigate(`/search?q=${encodeURIComponent(log.query)}`)}>
                                        다시 보기
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
