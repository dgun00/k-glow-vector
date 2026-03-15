import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const IMAGE_FILE_RE = /\.(png|jpe?g|webp|gif|svg|avif)$/i;

export function resolveProductImageUrl(raw?: string | null): string {
    if (!raw) return "";
    const value = raw.trim();
    if (!value) return "";

    // Keep full URLs and data/blob URLs as-is.
    if (/^(https?:)?\/\//i.test(value) || /^(data|blob):/i.test(value)) {
        return value;
    }

    // Convert any local absolute path that contains /public/images/ to a web path.
    const publicImagesIndex = value.indexOf("/public/images/");
    if (publicImagesIndex >= 0) {
        const relativePath = value.slice(publicImagesIndex + "/public/images/".length);
        return relativePath ? `/images/${relativePath}` : "";
    }

    if (value.startsWith("public/images/")) {
        return `/images/${value.slice("public/images/".length)}`;
    }

    if (value.startsWith("/images/")) return value;
    if (value.startsWith("images/")) return `/${value}`;

    if (value.startsWith("/")) return value;

    if (IMAGE_FILE_RE.test(value)) {
        return `/images/${value}`;
    }

    return value;
}
