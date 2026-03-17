import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  { image: "/hero2.jpeg" },
  { image: "/hero1.jpeg" },
  { image: "/hero3.jpeg" },
];

export const HeroCarousel: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [dir, setDir] = useState<"next" | "prev">("next");
  const [animating, setAnimating] = useState(false);
  const currentRef = useRef(0);
  const animatingRef = useRef(false);

  const goTo = (index: number, direction: "next" | "prev" = "next") => {
    if (animatingRef.current || index === currentRef.current) return;
    animatingRef.current = true;
    setAnimating(true);
    setDir(direction);
    setPrev(currentRef.current);
    currentRef.current = index;
    setCurrent(index);
    setTimeout(() => {
      setPrev(null);
      setAnimating(false);
      animatingRef.current = false;
    }, 350);
  };

  const goPrev = () => {
    const idx =
      currentRef.current === 0 ? slides.length - 1 : currentRef.current - 1;
    goTo(idx, "prev");
  };

  const goNext = () => {
    const idx =
      currentRef.current === slides.length - 1 ? 0 : currentRef.current + 1;
    goTo(idx, "next");
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const idx =
        currentRef.current === slides.length - 1 ? 0 : currentRef.current + 1;
      goTo(idx, "next");
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0%); }
        }
        @keyframes slideOutLeft {
          from { transform: translateX(0%); }
          to   { transform: translateX(-100%); }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0%); }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0%); }
          to   { transform: translateX(100%); }
        }
        .slide-enter-next { animation: slideInRight 0.35s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
        .slide-exit-next  { animation: slideOutLeft 0.35s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
        .slide-enter-prev { animation: slideInLeft 0.35s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
        .slide-exit-prev  { animation: slideOutRight 0.35s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
      `}</style>

      <div className="relative rounded-none sm:rounded-2xl overflow-hidden h-48 sm:h-80 md:h-115 lg:h-125 bg-gray-200 group">
        {" "}
        {/* Exiting slide */}
        {prev !== null && (
          <div
            key={`prev-${prev}`}
            className={`absolute inset-0 z-10 ${dir === "next" ? "slide-exit-next" : "slide-exit-prev"}`}
          >
            <img
              src={slides[prev].image}
              alt=""
              className="w-full h-full object-cover object-top"
            />
          </div>
        )}
        {/* Entering slide */}
        <div
          key={`curr-${current}`}
          className={`absolute inset-0 z-20 ${animating ? (dir === "next" ? "slide-enter-next" : "slide-enter-prev") : ""}`}
        >
          <img
            src={slides[current].image}
            alt={`Slide ${current + 1}`}
            className="w-full h-full object-cover object-top"
          />
        </div>
        {/* Prev arrow */}
        <button
          onClick={goPrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        {/* Next arrow */}
        <button
          onClick={goNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > currentRef.current ? "next" : "prev")}
              className={`transition-all duration-300 rounded-full ${
                i === current
                  ? "w-6 h-2.5 bg-indigo-500"
                  : "w-2.5 h-2.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
};
