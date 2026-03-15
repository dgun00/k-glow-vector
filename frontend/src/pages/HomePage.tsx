import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

const EXAMPLE_CHIPS = [
    "민감 피부 수분 세럼",
    "촉촉한 선크림",
    "쿨톤 립",
    "레티놀 입문",
    "모공 케어",
    "무향 크림",
];

const EXAMPLE_SENTENCES = [
    "하루 종일 촉촉한데 끈적이지 않는 선크림 있나요?",
    "민감 피부인데 레티놀 써도 되는 세럼",
    "쿨톤에 어울리는 봄 립 추천해줘",
    "기초 케어 입문용 클렌징부터 세럼까지",
];

interface SearchLog {
    query: string;
    created_at: string;
    result_count?: number;
}

export default function HomePage() {
    const navigate = useNavigate();
    const { isLoggedIn, user } = useAuth();
    const [query, setQuery] = useState("");
    const [trendTags, setTrendTags] = useState<string[]>([]);
    const [recentSearches, setRecentSearches] = useState<SearchLog[]>([]);

    // 트렌드 태그 fetch
    useEffect(() => {
        (async () => {
            const { data } = await supabase
                .from("trending_tags")
                .select("tag, count")
                .order("count", { ascending: false })
                .limit(8);
            if (data) setTrendTags(data.map((r) => `#${r.tag}`));
        })();
    }, []);

    // 최근 검색 fetch (로그인 시)
    useEffect(() => {
        if (!isLoggedIn || !user) { setRecentSearches([]); return; }
        (async () => {
            const { data } = await supabase
                .from("search_logs")
                .select("query, created_at, result_count")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(5);
            if (data) setRecentSearches(data);
        })();
    }, [isLoggedIn, user]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim().length >= 2) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    const goSearch = (q: string) => navigate(`/search?q=${encodeURIComponent(q)}`);

    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
            <Header />

            <main className="flex-1 container mx-auto max-w-2xl px-4 py-12 flex flex-col items-center gap-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center space-y-3 w-full"
                >
                    <h1 className="text-4xl font-bold">
                        <span className="gradient-text">K-Glow</span>{" "}
                        <span className="text-[var(--color-foreground)]">AI Search</span>
                    </h1>
                    <p className="text-[var(--color-muted-foreground)] text-lg">
                        말하듯 검색하면 AI가 내 피부에 맞는 K-뷰티를 찾아드려요
                    </p>
                </motion.div>

                {/* Search bar */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    onSubmit={handleSearch}
                    className="w-full"
                >
                    <div className="relative flex items-center">
                        <Search className="absolute left-4 text-[var(--color-muted-foreground)]" size={20} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="검색어를 입력하세요... (예: 민감 피부 수분 세럼)"
                            className="w-full pl-12 pr-14 py-4 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] text-base transition-all"
                        />
                        <button
                            type="submit"
                            disabled={query.trim().length < 2}
                            className="absolute right-2 w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center disabled:opacity-40 transition-all cursor-pointer hover:opacity-90 glow-shadow"
                        >
                            <ArrowRight size={18} className="text-[var(--color-primary-foreground)]" />
                        </button>
                    </div>
                </motion.form>

                {/* Example chips */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-wrap gap-2 justify-center w-full"
                >
                    {EXAMPLE_CHIPS.map((chip) => (
                        <motion.button
                            key={chip}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => goSearch(chip)}
                            className="px-4 py-1.5 rounded-full border border-[var(--color-border)] text-sm text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors cursor-pointer"
                        >
                            {chip}
                        </motion.button>
                    ))}
                </motion.div>

                {/* Example sentences */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="w-full"
                >
                    <p className="text-sm text-[var(--color-muted-foreground)] mb-3 flex items-center gap-2">
                        <span>💬</span> 이렇게도 검색해 보세요
                    </p>
                    <div className="border border-[var(--color-border)] rounded-xl overflow-hidden divide-y divide-[var(--color-border)]">
                        {EXAMPLE_SENTENCES.map((sentence) => (
                            <motion.button
                                key={sentence}
                                whileHover={{ x: 4 }}
                                onClick={() => goSearch(sentence)}
                                className="group w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--color-muted)] text-left text-sm text-[var(--color-foreground)] transition-colors cursor-pointer"
                            >
                                <span>"{sentence}"</span>
                                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-primary)] shrink-0 ml-2" />
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Recent searches (logged in only) */}
                {isLoggedIn && recentSearches.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="w-full"
                    >
                        <p className="text-sm text-[var(--color-muted-foreground)] mb-3">최근 검색</p>
                        <div className="border border-[var(--color-border)] rounded-xl overflow-hidden divide-y divide-[var(--color-border)]">
                            {recentSearches.map((item) => (
                                <div key={item.query + item.created_at} className="flex items-center justify-between px-4 py-3 bg-[var(--color-card)]">
                                    <span className="text-sm text-[var(--color-foreground)]">"{item.query}"</span>
                                    <Button variant="ghost" size="sm" onClick={() => goSearch(item.query)} className="text-xs text-[var(--color-primary)]">
                                        다시 보기
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Trend tags */}
                {trendTags.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex flex-wrap gap-2 justify-center"
                    >
                        {trendTags.map((tag) => (
                            <span key={tag} className="text-sm text-[var(--color-muted-foreground)]/70">{tag}</span>
                        ))}
                    </motion.div>
                )}
            </main>

            <Footer />
        </div>
    );
}
