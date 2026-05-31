import React, { useEffect, useRef, useState } from "react";
import { Calendar, User, ChevronRight, ArrowLeft, Clock, Play, Youtube } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { UpdatePost } from "../types";
import { UpdateCardSkeleton } from "./Skeleton";
import { useStore } from "../context/StoreContext";
import { SECTION_ACCENT } from "@/lib/sectionTheme";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[₹&@#%\+\*\(\)\[\]]/g, '')
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function readTime(text: string): number {
  return Math.max(1, Math.ceil(text.split(" ").length / 200));
}

function extractVideoId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

const categoryStyle: Record<string, { bg: string; text: string; label: string }> = {
  Laptops: { bg: "#f0fdf4", text: "#166534", label: "💻 Laptops" },
  "Custom Build PCs": { bg: "#eff6ff", text: "#1e40af", label: "🖥️ Custom PCs" },
  "Desktop PCs": { bg: "#fff7ed", text: "#9a3412", label: "🖱️ Desktops" },
  Videos: { bg: "#fff1f2", text: "#9f1239", label: "🎬 Videos" },
};

// ── Video Card Thumbnail with hover-preview ───────────────────────────────────
const VideoCard: React.FC<{
  post: UpdatePost;
  videoId: string;
  theme: { accent: string };
  onClick: () => void;
}> = ({ post, videoId, theme, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const [muted, setMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cat = categoryStyle[post.category];

  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(() => setHovered(true), 600);
  };
  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHovered(false);
    setMuted(true); // reset mute on leave
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMuted = !muted;
    setMuted(newMuted);
    // postMessage to YouTube iframe
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: newMuted ? "mute" : "unMute", args: [] }),
      "*"
    );
  };

  return (
    <article
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="cursor-pointer group flex flex-col rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white"
    >
      <div className="aspect-video overflow-hidden relative bg-black">
        {hovered ? (
          <div className="relative w-full h-full">
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&enablejsapi=1`}
              className="w-full h-full"
              allow="autoplay"
              title={post.title}
            />
            {/* Sound icon — bottom right, z-index over iframe, icon only */}
            <button
              onClick={toggleMute}
              className="absolute bottom-2 right-2 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center transition-all duration-200"
              title={muted ? "Unmute" : "Mute"}
            >
              {muted
                ? <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
                : <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
              }
            </button>
          </div>
        ) : (
          <>
            <img
              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
              alt={post.title}
              loading="lazy"
              width={480}
              height={360}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <Play className="w-6 h-6 text-white fill-white ml-1" />
              </div>
            </div>
            <div className="absolute top-3 right-3 bg-black/70 rounded-lg px-2 py-1 flex items-center gap-1">
              <Youtube className="w-3.5 h-3.5 text-red-500" />
              <span className="text-white text-xs font-bold">Video</span>
            </div>
          </>
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        {cat && (
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-3 w-fit"
            style={{ background: cat.bg, color: cat.text }}
          >{cat.label}</span>
        )}
        <h2 className="text-lg font-black text-gray-900 leading-snug mb-3 group-hover:underline flex-1">
          {post.title}
        </h2>
        <p className="text-sm text-gray-500 font-medium line-clamp-2 mb-5">{post.excerpt}</p>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
            <span>{new Date(post.published_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
          </div>
          <span
            className="text-xs font-black flex items-center gap-1 group-hover:gap-2 transition-all"
            style={{ color: theme.accent }}
          >Watch <ChevronRight className="w-3.5 h-3.5" /></span>
        </div>
      </div>
    </article>
  );
};

// ── Read More text ─────────────────────────────────────────────────────────────
const ReadMoreText: React.FC<{ text: string }> = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  const LIMIT = 400;
  if (!text) return null;
  const isLong = text.length > LIMIT;
  return (
    <div>
      <p className="text-gray-700 leading-relaxed text-lg font-medium whitespace-pre-line">
        {expanded || !isLong ? text : text.slice(0, LIMIT) + "…"}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-sm font-black text-indigo-600 hover:underline"
        >
          {expanded ? "Show less ↑" : "Read more ↓"}
        </button>
      )}
    </div>
  );
};

export const Updates: React.FC = () => {
  const { selectedStoreSection } = useStore();
  const theme = SECTION_ACCENT[selectedStoreSection];
  const [posts, setPosts] = useState<UpdatePost[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [descTab, setDescTab] = useState<"en" | "hinglish">("en");
  const [videoPlaying, setVideoPlaying] = useState(false);
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();

  const selectedPost = slug
    ? posts.find((p) => toSlug(p.title) === slug) ?? null
    : null;

  useEffect(() => {
    const fetchUpdates = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("updates")
        .select("*")
        .order("published_date", { ascending: false });
      setPosts(data ?? []);
      setLoading(false);
    };
    fetchUpdates();
  }, []);

  // Reset video state on post change
  useEffect(() => {
    setVideoPlaying(false);
    setDescTab("en");
  }, [slug]);

  const categories = ["All", "Laptops", "Custom Build PCs", "Desktop PCs", "Videos"];
  const filtered = activeCategory === "All" ? posts : posts.filter((p) => p.category === activeCategory);
  const featured = posts.find((p) => p.is_featured);
  if (slug && !loading && posts.length > 0 && !selectedPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-black text-gray-900 mb-4">Article not found</h1>
          <Link to="/blog" className="text-indigo-600 font-bold hover:underline">← Back to Blog</Link>
        </div>
      </div>
    )
  }
  // ── ARTICLE/VIDEO DETAIL VIEW ─────────────────────────────────────────────
  if (selectedPost) {
    const cat = categoryStyle[selectedPost.category];
    const videoId = extractVideoId(selectedPost.video_url ?? "");
    const isVideo = !!videoId;
    const mins = readTime(selectedPost.excerpt);
    const descText = descTab === "en" ? selectedPost.description_en : selectedPost.description_hinglish;

    return (
      <div className="min-h-screen bg-white">
        <Helmet>
          <title>{selectedPost.title} | Infofix Computers Blog</title>
          <meta name="description" content={selectedPost.excerpt.slice(0, 160)} />
          <meta name="keywords" content={`${selectedPost.title}, ${selectedPost.category}, Infofix, laptop, Durgapur, Asansol, Ukhra`} />
          <link rel="canonical" href={`https://infofixcomputers.com/blog/${toSlug(selectedPost.title)}`} />
          <meta property="og:title" content={selectedPost.title} />
          <meta property="og:description" content={selectedPost.excerpt.slice(0, 160)} />
          <meta property="og:image" content={isVideo ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : selectedPost.image_url} />
          <meta property="og:type" content={isVideo ? "video.other" : "article"} />
          {isVideo && <meta property="og:video" content={selectedPost.video_url} />}
          <meta property="og:url" content={`https://infofixcomputers.com/blog/${toSlug(selectedPost.title)}`} />
          <meta name="twitter:card" content="summary_large_image" />
          <script type="application/ld+json">{JSON.stringify(
            isVideo ? {
              "@context": "https://schema.org",
              "@type": "VideoObject",
              "name": selectedPost.title,
              "description": selectedPost.excerpt.slice(0, 300),
              "thumbnailUrl": [
                `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
              ],
              "uploadDate": selectedPost.published_date,
              "duration": "PT5M",
              "embedUrl": `https://www.youtube.com/embed/${videoId}`,
              "contentUrl": `https://www.youtube.com/watch?v=${videoId}`,
              "url": `https://infofixcomputers.com/blog/${toSlug(selectedPost.title)}`,
              "publisher": {
                "@type": "Organization",
                "name": "Infofix Computers",
                "logo": { "@type": "ImageObject", "url": "https://infofixcomputers.com/icons/logo.png" }
              }
            } : {
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": selectedPost.title,
              "description": selectedPost.excerpt.slice(0, 160),
              "image": selectedPost.image_url,
              "author": { "@type": "Organization", "name": selectedPost.author ?? "Infofix Technical Team" },
              "publisher": { "@type": "Organization", "name": "Infofix Computers", "logo": { "@type": "ImageObject", "url": "https://infofixcomputers.com/icons/logo.png" } },
              "datePublished": selectedPost.published_date,
            }
          )}</script>
          <script type="application/ld+json">{JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://infofixcomputers.com" },
              { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://infofixcomputers.com/blog" },
              { "@type": "ListItem", "position": 3, "name": selectedPost.category, "item": `https://infofixcomputers.com/blog?cat=${selectedPost.category}` },
              { "@type": "ListItem", "position": 4, "name": selectedPost.title }
            ]
          })}</script>
        </Helmet>

        <div className="max-w-4xl mx-auto px-4 pt-8 pb-4">
          <Link
            to="/blog"
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-4">
            <span className="cursor-pointer hover:underline" onClick={() => navigate("/blog")}>Home</span>
            {" › Blog › "}{selectedPost.category}
          </p>
        </div>

        {/* MEDIA — Video or Image */}
        <div className="max-w-5xl mx-auto px-4 mb-10">
          <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black relative">
            {isVideo ? (
              videoPlaying ? (
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                  className="w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  title={selectedPost.title}
                />
              ) : (
                <>
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                    alt={selectedPost.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                    }}
                  />
                  {/* Big play button */}
                  <button
                    onClick={() => setVideoPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center group"
                  >
                    <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-9 h-9 text-white fill-white ml-1" />
                    </div>
                  </button>
                </>
              )
            ) : (
              <img src={selectedPost.image_url} alt={selectedPost.title} className="w-full h-full object-cover" />
            )}
          </div>
        </div>

        <article className="max-w-3xl mx-auto px-4 pb-24">
          {cat && (
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6"
              style={{ background: cat.bg, color: cat.text }}
            >{cat.label}</span>
          )}

          <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-6">
            {selectedPost.title}
          </h1>

          <div className="flex flex-wrap items-center gap-5 text-sm font-bold text-gray-400 mb-10 pb-10 border-b border-gray-100">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(selectedPost.published_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span className="flex items-center gap-2"><User className="w-4 h-4" />{selectedPost.author}</span>
            {!isVideo && <span className="flex items-center gap-2"><Clock className="w-4 h-4" />{mins} min read</span>}
            {isVideo && (
              <span className="flex items-center gap-2 text-red-500">
                <Youtube className="w-4 h-4" /> Video Post
              </span>
            )}
          </div>

          {/* VIDEO: tabs + descriptions */}
          {isVideo && (selectedPost.description_en || selectedPost.description_hinglish) ? (
            <div>
              {/* Tab switcher */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setDescTab("en")}
                  className={`px-5 py-2 rounded-full text-sm font-black transition ${descTab === "en" ? "text-white" : "bg-gray-100 text-gray-500"}`}
                  style={descTab === "en" ? { background: theme.accent } : {}}
                >
                  🇬🇧 English
                </button>
                <button
                  onClick={() => setDescTab("hinglish")}
                  className={`px-5 py-2 rounded-full text-sm font-black transition ${descTab === "hinglish" ? "text-white" : "bg-gray-100 text-gray-500"}`}
                  style={descTab === "hinglish" ? { background: theme.accent } : {}}
                >
                  🤙 Hinglish
                </button>
              </div>
              <ReadMoreText text={descText ?? selectedPost.excerpt} />
            </div>
          ) : (
            // Article: show excerpt with read more
            <ReadMoreText text={selectedPost.excerpt} />
          )}

          <div
            className="mt-16 rounded-3xl p-8 text-center"
            style={{ background: theme.accent + "0f", border: `1px solid ${theme.accent}22` }}
          >
            <h3 className="text-2xl font-black text-gray-900 mb-3">Ready to buy?</h3>
            <p className="text-gray-500 font-medium mb-6">
              Visit Infofix Computers in Durgapur, Asansol, or Ukhra or browse our online store.
            </p>
            <Link
              to="/shop"
              className="text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest inline-block"
              style={{ background: theme.accent }}
            >
              Shop Now →
            </Link>
          </div>

          {/* Related */}
          <div className="mt-20">
            <h2 className="text-2xl font-black text-gray-900 mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {posts
                .filter((p) => p.id !== selectedPost.id && p.category === selectedPost.category)
                .slice(0, 2)
                .map((p) => {
                  const relVideoId = extractVideoId(p.video_url ?? "");
                  return (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/blog/${toSlug(p.title)}`)}
                      className="cursor-pointer group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all"
                    >
                      <div className="aspect-video overflow-hidden relative">
                        <img
                          src={relVideoId ? `https://img.youtube.com/vi/${relVideoId}/hqdefault.jpg` : p.image_url}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {relVideoId && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: theme.accent }}>{p.category}</p>
                        <h3 className="font-black text-gray-900 text-base leading-snug group-hover:underline">{p.title}</h3>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </article>
      </div>
    );
  }

  // ── BLOG LIST VIEW ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Tech Blog — Laptop & PC Buying Guides | Infofix Computers</title>
        <meta name="description" content="Expert laptop and PC buying guides, comparisons, and local tech advice from Infofix Computers, Durgapur." />
        <link rel="canonical" href="https://infofixcomputers.com/blog" />
        <meta property="og:title" content="Tech Blog — Infofix Computers" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "Infofix Computers Tech Blog",
          "url": "https://infofixcomputers.com/blog",
          "publisher": { "@type": "Organization", "name": "Infofix Computers" },
        })}</script>
      </Helmet>

      <div className="app-container py-10 md:py-16">
        <div className="mb-14 text-center space-y-4">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest"
            style={{ background: theme.accent + "12", color: theme.accent }}
          >📖 Infofix Tech Blog</span>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter">
            Guides That Save<br />
            <span style={{ color: theme.accent }}>You Money.</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
            Honest buying guides, comparisons, and local tech advice — written by real technicians at Infofix Computers, Durgapur, Asansol, and Ukhra.
          </p>
        </div>

        {/* Featured */}
        {!loading && featured && (() => {
          const featVideoId = extractVideoId(featured.video_url ?? "");
          return (
            <div
              onClick={() => navigate(`/blog/${toSlug(featured.title)}`)}
              className="cursor-pointer group mb-20 grid grid-cols-1 lg:grid-cols-2 rounded-4xl overflow-hidden shadow-2xl border border-gray-100 hover:shadow-3xl transition-all"
            >
              <div className="aspect-video lg:aspect-auto overflow-hidden relative bg-black">
                <img
                  src={featVideoId ? `https://img.youtube.com/vi/${featVideoId}/hqdefault.jpg` : featured.image_url}
                  alt={featured.title}
                  width={640} height={360}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {featVideoId && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 text-white fill-white ml-1" />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4 w-fit"
                  style={{ background: theme.accent + "15", color: theme.accent }}
                >⭐ Featured</span>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-4 group-hover:underline">
                  {featured.title}
                </h2>
                <p className="text-gray-500 font-medium line-clamp-3 mb-6">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                  <span>{new Date(featured.published_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  {featVideoId
                    ? <><span>·</span><span className="text-red-500 flex items-center gap-1"><Youtube className="w-3 h-3" /> Video</span></>
                    : <><span>·</span><span>{readTime(featured.excerpt)} min read</span></>
                  }
                </div>
              </div>
            </div>
          );
        })()}

        {/* Category filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-black uppercase tracking-widest transition-all ${activeCategory === cat ? "text-white shadow-lg" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
              style={activeCategory === cat ? { background: theme.accent, boxShadow: `0 4px 14px ${theme.accent}44` } : {}}
            >{cat}</button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <UpdateCardSkeleton key={i} />)
            : filtered.length === 0
              ? <p className="col-span-3 text-center text-gray-400 font-medium py-12">No posts in this category.</p>
              : filtered.map((post) => {
                const videoId = extractVideoId(post.video_url ?? "");
                const cat = categoryStyle[post.category];
                const mins = readTime(post.excerpt);

                if (videoId) {
                  return (
                    <VideoCard
                      key={post.id}
                      post={post}
                      videoId={videoId}
                      theme={theme}
                      onClick={() => navigate(`/blog/${toSlug(post.title)}`)}
                    />
                  );
                }

                return (
                  <article
                    key={post.id}
                    onClick={() => navigate(`/blog/${toSlug(post.title)}`)}
                    className="cursor-pointer group flex flex-col rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        width={480}
                        height={270}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      {cat && (
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-3 w-fit"
                          style={{ background: cat.bg, color: cat.text }}
                        >{cat.label}</span>
                      )}
                      <h2 className="text-lg font-black text-gray-900 leading-snug mb-3 group-hover:underline flex-1">
                        {post.title}
                      </h2>
                      <p className="text-sm text-gray-500 font-medium line-clamp-2 mb-5">{post.excerpt}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                          <span>{new Date(post.published_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                          <span>·</span>
                          <span>{mins} min read</span>
                        </div>
                        <span
                          className="text-xs font-black flex items-center gap-1 group-hover:gap-2 transition-all"
                          style={{ color: theme.accent }}
                        >Read <ChevronRight className="w-3.5 h-3.5" /></span>
                      </div>
                    </div>
                  </article>
                );
              })}
        </div>

        {/* Trust */}
        <div className="mt-10 md:mt-24 text-center rounded-3xl p-12" style={{ background: theme.accent + "08", border: `1px solid ${theme.accent}18` }}>
          <h2 className="text-3xl font-black text-gray-900 mb-3">Written by Real Technicians</h2>
          <p className="text-gray-500 max-w-2xl mx-auto font-medium">
            All guides written by technicians at Infofix Computers, Durgapur, Asansol, Ukhra.
          </p>
        </div>
      </div>
    </div>
  );
};