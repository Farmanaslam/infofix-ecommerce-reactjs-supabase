import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
    images: string[];
    title: string;
    fallback?: string;
}

export const BranchCarousel: React.FC<Props> = ({ images, title, fallback }) => {
    const slides = images.length > 0 ? images : fallback ? [fallback] : [];
    const [current, setCurrent] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [direction, setDirection] = useState<"left" | "right">("right");
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [imgLoaded, setImgLoaded] = useState(false);
    // ─── Intersection Observer: only autoplay + preload when card is visible ───
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { rootMargin: "200px" }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const go = useCallback(
        (next: number, dir: "left" | "right") => {
            if (animating || slides.length <= 1) return;
            setDirection(dir);
            setAnimating(true);
            setTimeout(() => {
                setCurrent(next);
                setAnimating(false);
            }, 350);
        },
        [animating, slides.length]
    );

    const prev = () => go((current - 1 + slides.length) % slides.length, "left");
    const next = () => go((current + 1) % slides.length, "right");

    // ─── Auto-advance only when visible ───────────────────────────────────────
    useEffect(() => {
        if (slides.length <= 1 || !isVisible) return;
        const t = setInterval(() => go((current + 1) % slides.length, "right"), 3000);
        return () => clearInterval(t);
    }, [current, slides.length, go, isVisible]);

    return (
        <div ref={containerRef} className="relative h-72 overflow-hidden bg-gray-900">

            {/* ─── Only render img when container is near viewport ─── */}
            {isVisible ? (
                <img
                    key={current}
                    src={slides[current]}
                    alt={`${title} - photo ${current + 1}`}
                    width={800}
                    height={288}
                    loading={current === 0 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={current === 0 ? "low" : undefined}
                    className="w-full h-full object-cover"
                    onLoad={() => setImgLoaded(true)}
                    style={{
                        transform: animating
                            ? `translateX(${direction === "right" ? "-8%" : "8%"})`
                            : "translateX(0)",
                        opacity: animating ? 0 : 1,
                        transition: "transform 350ms ease, opacity 350ms ease",
                        willChange: animating ? "transform, opacity" : "auto",

                        filter: imgLoaded ? "none" : "blur(8px)",
                        scale: imgLoaded ? "1" : "1.05",
                    }}
                />
            ) : (
                <div className="w-full h-full bg-gray-800 animate-pulse" aria-hidden="true" />
            )}

            {isVisible && slides.length > 1 && (
                <link
                    rel="prefetch"
                    href={slides[(current + 1) % slides.length]}
                    as="image"
                />
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

            {/* Arrows */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); prev(); }}
                        aria-label="Previous photo"
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-indigo-600/80 transition-all z-20"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); next(); }}
                        aria-label="Next photo"
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-indigo-600/80 transition-all z-20"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </>
            )}

            {/* Dot indicators */}
            {slides.length > 1 && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => go(i, i > current ? "right" : "left")}
                            aria-label={`Go to photo ${i + 1}`}  // ← accessibility fix
                            className={`transition-all duration-300 rounded-full ${i === current
                                ? "w-6 h-1.5 bg-indigo-400"
                                : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
                                }`}
                        />
                    ))}
                </div>
            )}

            {/* Photo counter badge */}
            {slides.length > 1 && (
                <div className="absolute top-6 right-16 bg-black/40 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full border border-white/20 z-20">
                    {current + 1}/{slides.length}
                </div>
            )}
        </div>
    );
};
