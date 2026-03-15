import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const BENEFITS = [
    "내 피부 조건으로 더 정확한 검색",
    "마음에 드는 제품 저장 및 비교",
    "AI 루틴 리포트로 맞춤 스킨케어",
];

const INTENT_MESSAGES: Record<string, string> = {
    save: "💾 제품을 저장하려면 로그인이 필요해요",
    buy_report: "✨ 루틴 리포트를 구매하려면 로그인이 필요해요",
};


export default function AuthPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    const next = searchParams.get("next") ?? "/";
    const intent = searchParams.get("intent") ?? "";

    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);

    useEffect(() => {
        if (isLoggedIn) navigate(decodeURIComponent(next), { replace: true });
    }, [isLoggedIn, next, navigate]);

    const handleEmail = async () => {
        if (!email || !password) { setError("이메일과 비밀번호를 입력해주세요"); return; }
        if (password.length < 6) { setError("비밀번호는 6자 이상이어야 합니다"); return; }
        setError("");
        setLoading(true);

        if (mode === "login") {
            const { error: err } = await supabase.auth.signInWithPassword({ email, password });
            setLoading(false);
            if (err) { setError(err.message === "Invalid login credentials" ? "이메일 또는 비밀번호가 올바르지 않습니다" : err.message); }
            // 로그인 성공 시 AuthContext의 onAuthStateChange가 자동으로 navigate 처리
        } else {
            const { error: err } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { name: name || undefined } },
            });
            setLoading(false);
            if (err) { setError(err.message); }
            else { setSignupSuccess(true); }
        }
    };

    if (signupSuccess) {
        return (
            <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
                <Header />
                <main className="flex-1 flex items-center justify-center py-12 px-4">
                    <div className="text-center space-y-4 max-w-md w-full">
                        <p className="text-5xl">📧</p>
                        <h1 className="text-xl font-bold text-[var(--color-foreground)]">이메일을 확인해주세요</h1>
                        <p className="text-[var(--color-muted-foreground)] text-sm">
                            {email}으로 인증 메일을 보냈습니다.<br />메일의 링크를 클릭하면 가입이 완료됩니다.
                        </p>
                        <Button variant="outline" onClick={() => { setSignupSuccess(false); setMode("login"); }}>
                            로그인으로 돌아가기
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
            <Header />
            <main className="flex-1 flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
                    {/* Left */}
                    <div className="hidden md:flex flex-col space-y-6">
                        <div className="w-48 h-48 mx-auto rounded-2xl bg-[var(--color-muted)] flex items-center justify-center">
                            <span className="text-6xl">✨</span>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">
                                <span className="gradient-text">K-Glow</span>와 함께
                            </h2>
                            <ul className="space-y-2">
                                {BENEFITS.map((b) => (
                                    <li key={b} className="flex items-start gap-2 text-sm text-[var(--color-muted-foreground)]">
                                        <span className="h-2 w-2 rounded-full bg-[var(--color-primary)] mt-1.5 shrink-0" />
                                        {b}
                                    </li>
                                ))}
                            </ul>
                            {intent && INTENT_MESSAGES[intent] && (
                                <p className="text-sm text-[var(--color-primary)] font-medium pt-2">
                                    {INTENT_MESSAGES[intent]}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right: Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-8 space-y-5"
                    >
                        <h1 className="text-xl font-bold text-center text-[var(--color-foreground)]">
                            {mode === "login" ? "로그인" : "회원가입"}
                        </h1>

                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-[var(--color-border)]" />
                            <span className="text-xs text-[var(--color-muted-foreground)]">이메일로 계속하기</span>
                            <div className="flex-1 h-px bg-[var(--color-border)]" />
                        </div>

                        <div className="space-y-3">
                            {mode === "signup" && (
                                <input
                                    type="text"
                                    placeholder="이름 (선택)"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={loading}
                                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] disabled:opacity-50"
                                />
                            )}
                            <input
                                type="email"
                                placeholder="이메일"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleEmail()}
                                disabled={loading}
                                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] disabled:opacity-50"
                            />
                            <input
                                type="password"
                                placeholder="비밀번호"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleEmail()}
                                disabled={loading}
                                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] disabled:opacity-50"
                            />
                        </div>

                        {error && <p className="text-sm text-[var(--color-destructive)] text-center">{error}</p>}

                        <Button variant="glow" className="w-full rounded-xl" disabled={loading} onClick={handleEmail}>
                            {loading ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}
                        </Button>

                        <p className="text-xs text-center text-[var(--color-muted-foreground)]">
                            {mode === "login" ? (
                                <>계정이 없으신가요?{" "}
                                    <button onClick={() => { setMode("signup"); setError(""); }} className="text-[var(--color-primary)] cursor-pointer hover:underline">회원가입</button>
                                </>
                            ) : (
                                <>이미 계정이 있으신가요?{" "}
                                    <button onClick={() => { setMode("login"); setError(""); }} className="text-[var(--color-primary)] cursor-pointer hover:underline">로그인</button>
                                </>
                            )}
                        </p>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
