export default function Footer() {
    return (
        <footer className="border-t border-[var(--color-border)] py-6 mt-auto">
            <div className="container mx-auto max-w-5xl px-4 flex flex-col items-center gap-2">
                <p className="text-xs text-[var(--color-muted-foreground)]">© 2026 K-Glow. All rights reserved.</p>
                <div className="flex gap-4 text-xs text-[var(--color-muted-foreground)]">
                    <button className="hover:underline cursor-pointer">서비스 소개</button>
                    <span>|</span>
                    <button className="hover:underline cursor-pointer">개인정보 처리방침</button>
                    <span>|</span>
                    <button className="hover:underline cursor-pointer">문의</button>
                </div>
            </div>
        </footer>
    );
}
