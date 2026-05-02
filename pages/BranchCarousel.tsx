import React, { useState, useEffect, useCallback } from "react";
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

    // Auto-advance
    useEffect(() => {
        if (slides.length <= 1) return;
        const t = setInterval(() => go((current + 1) % slides.length, "right"), 3000);
        return () => clearInterval(t);
    }, [current, slides.length, go]);

    return (
        <div className="relative h-72 overflow-hidden bg-gray-900">
            {/* Slide */}
            <img
                key={current}
                src={slides[current]}
                alt={`${title} ${current + 1}`}
                className="w-full h-full object-cover transition-all duration-500"
                style={{
                    transform: animating
                        ? `translateX(${direction === "right" ? "-8%" : "8%"})`
                        : "translateX(0)",
                    opacity: animating ? 0 : 1,
                    transition: "transform 350ms ease, opacity 350ms ease",
                }}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

            {/* Floating top labels — keep same as before */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                {/* city badge + nav icon — passed as children or duplicated */}
            </div>

            {/* Arrows — only show if >1 image */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); prev(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-indigo-600/80 transition-all z-20"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); next(); }}
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