import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Moon, Sun, Heart, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface HeaderProps {
    showSearch?: boolean;
}

export default function Header({ showSearch = false }: HeaderProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { isLoggedIn, signOut } = useAuth();
    const [dark, setDark] = useState(
        document.documentElement.classList.contains("dark")
    );
    const [searchVal, setSearchVal] = useState("");

    const toggleDark = () => {
        const nextDark = !dark;
        document.documentElement.classList.toggle("dark", nextDark);
        localStorage.setItem("theme", nextDark ? "dark" : "light");
        setDark(nextDark);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchVal.trim().length >= 2) {
            navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`);
        }
    };

    const handleSaved = () => {
        if (!isLoggedIn) navigate(`/auth?next=${encodeURIComponent("/saved")}`);
        else navigate("/saved");
    };

    const handleAccount = () => {
        if (!isLoggedIn) navigate(`/auth?next=${encodeURIComponent("/account")}`);
        else navigate("/account");
    };

    const handleSignOut = async () => {
        await signOut();
        navigate("/");
        toast.success("로그아웃되었습니다");
    };

    const params = new URLSearchParams(location.search);
    const qParam = params.get("q") ?? "";

    return (
        <header className="sticky top-0 z-40 glass border-b border-[var(--color-border)] px-4">
            <div className="container mx-auto max-w-5xl flex items-center gap-3 h-14">
                {/* Logo */}
                <button
                    onClick={() => navigate("/")}
                    className="text-xl font-bold gradient-text shrink-0 cursor-pointer"
                >
                    K-Glow
                </button>

                {/* Search bar (compact) */}
                {showSearch && (
                    <form onSubmit={handleSearch} className="flex-1 flex items-center">
                        <div className="relative flex-1 max-w-md">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]"
                                size={14}
                            />
                            <input
                                type="text"
                                defaultValue={qParam}
                                key={qParam}
                                onChange={(e) => setSearchVal(e.target.value)}
                                onFocus={(e) => setSearchVal(e.target.value)}
                                placeholder="검색어를 입력하세요..."
                                className="w-full pl-8 pr-4 py-1.5 text-sm rounded-full border border-[var(--color-border)] bg-[var(--color-muted)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
                            />
                        </div>
                    </form>
                )}

                <div className="flex items-center gap-1 ml-auto shrink-0">
                    {/* Dark mode toggle */}
                    <Button variant="ghost" size="icon" onClick={toggleDark} title="다크모드 전환">
                        {dark ? <Sun size={16} /> : <Moon size={16} />}
                    </Button>

                    {/* Saved */}
                    <Button variant="ghost" size="icon" onClick={handleSaved} title="저장 목록">
                        <Heart size={16} />
                    </Button>

                    {/* Account */}
                    <Button variant="ghost" size="icon" onClick={handleAccount} title="내 계정">
                        <User size={16} />
                    </Button>

                    {/* 로그인 상태에 따라 표시 */}
                    {isLoggedIn ? (
                        <Button
                            variant="chip"
                            size="sm"
                            onClick={handleSignOut}
                            className="text-xs"
                            title="로그아웃"
                        >
                            로그아웃
                        </Button>
                    ) : (
                        <Button
                            variant="chip"
                            size="sm"
                            onClick={() => navigate("/auth")}
                            className="text-xs"
                            title="로그인"
                        >
                            로그인
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}
