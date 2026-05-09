import React, { useEffect, useState } from "react";
import { Calendar, User, ChevronRight, ArrowLeft, Clock } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { UpdatePost } from "../types";
import { UpdateCardSkeleton } from "./Skeleton";
import { useStore } from "../context/StoreContext";
import { SECTION_ACCENT } from "@/lib/sectionTheme";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function readTime(text: string): number {
  return Math.max(1, Math.ceil(text.split(" ").length / 200));
}

const categoryStyle: Record<string, { bg: string; text: string; label: string }> = {
  Laptops: { bg: "#f0fdf4", text: "#166534", label: "💻 Laptops" },
  "Custom Build PCs": { bg: "#eff6ff", text: "#1e40af", label: "🖥️ Custom PCs" },
  "Desktop PCs": { bg: "#fff7ed", text: "#9a3412", label: "🖱️ Desktops" },
};

export const Updates: React.FC = () => {
  const { selectedStoreSection } = useStore();
  const theme = SECTION_ACCENT[selectedStoreSection];
  const [posts, setPosts] = useState<UpdatePost[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
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

  const categories = ["All", "Laptops", "Custom Build PCs", "Desktop PCs"];
  const filtered = activeCategory === "All" ? posts : posts.filter((p) => p.category === activeCategory);
  const featured = posts.find((p) => p.is_featured);

  // ── ARTICLE VIEW ──────────────────────────────────────────────────────────
  if (selectedPost) {
    const cat = categoryStyle[selectedPost.category];
    const mins = readTime(selectedPost.excerpt);
    return (
      <div className="min-h-screen bg-white">
        <Helmet>
          <title>{selectedPost.title} | Infofix Computers Blog</title>
          <meta name="description" content={selectedPost.excerpt.slice(0, 160)} />
          <meta name="keywords" content={`${selectedPost.title}, ${selectedPost.category}, Infofix, laptop, Durgapur, Asansol, Ukhra`} />
          <link rel="canonical" href={`https://infofixcomputers.com/blog/${toSlug(selectedPost.title)}`} />
          <meta property="og:title" content={selectedPost.title} />
          <meta property="og:description" content={selectedPost.excerpt.slice(0, 160)} />
          <meta property="og:image" content={selectedPost.image_url ?? ""} />
          <meta property="og:type" content="article" />
          <meta property="og:url" content={`https://infofixcomputers.com/blog/${toSlug(selectedPost.title)}`} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={selectedPost.title} />
          <meta name="twitter:description" content={selectedPost.excerpt.slice(0, 160)} />
          <script type="application/ld+json">{JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": selectedPost.title,
            "description": selectedPost.excerpt.slice(0, 160),
            "image": selectedPost.image_url,
            "author": { "@type": "Organization", "name": selectedPost.author ?? "Infofix Technical Team" },
            "publisher": {
              "@type": "Organization",
              "name": "Infofix Computers",
              "logo": { "@type": "ImageObject", "url": "https://infofixcomputers.com/icons/logo.png" }
            },
            "datePublished": selectedPost.published_date,
            "dateModified": selectedPost.published_date,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://infofixcomputers.com/blog/${toSlug(selectedPost.title)}`
            }
          })}</script>
        </Helmet>

        <div className="max-w-4xl mx-auto px-4 pt-8 pb-4">
          <button
            onClick={() => navigate("/blog")}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </button>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-4">
            <span className="cursor-pointer hover:underline" onClick={() => navigate("/blog")}>Home</span>
            {" › Blog › "}{selectedPost.category}
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-4 mb-10">
          <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl">
            <img src={selectedPost.image_url} alt={selectedPost.title} className="w-full h-full object-cover" />
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
            <span className="flex items-center gap-2"><Clock className="w-4 h-4" />{mins} min read</span>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed text-lg font-medium whitespace-pre-line">
            {selectedPost.excerpt}
          </div>

          <div
            className="mt-16 rounded-3xl p-8 text-center"
            style={{ background: theme.accent + "0f", border: `1px solid ${theme.accent}22` }}
          >
            <h3 className="text-2xl font-black text-gray-900 mb-3">Ready to buy?</h3>
            <p className="text-gray-500 font-medium mb-6">
              Visit Infofix Computers in Durgapur, Asansol, or Ukhra or browse our online store for the best deals.
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest"
              style={{ background: theme.accent }}
            >
              Shop Now →
            </button>
          </div>

          <div className="mt-20">
            <h2 className="text-2xl font-black text-gray-900 mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {posts
                .filter((p) => p.id !== selectedPost.id && p.category === selectedPost.category)
                .slice(0, 2)
                .map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/blog/${toSlug(p.title)}`)}
                    className="cursor-pointer group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: theme.accent }}>{p.category}</p>
                      <h3 className="font-black text-gray-900 text-base leading-snug group-hover:underline">{p.title}</h3>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </article>
      </div>
    );
  }

  // ── BLOG LIST VIEW ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Tech Blog — Laptop & PC Buying Guides | Infofix Computers</title>
        <meta name="description" content="Expert laptop and PC buying guides, comparisons, and local tech advice from Infofix Computers, Durgapur. Refurbished laptops, gaming PCs, student laptops and more." />
        <link rel="canonical" href="https://infofixcomputers.com/blog" />
        <meta property="og:title" content="Tech Blog — Infofix Computers" />
        <meta property="og:description" content="Buying guides, comparisons, and tech advice for laptops and PCs in India." />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "Infofix Computers Tech Blog",
          "url": "https://infofixcomputers.com/blog",
          "description": "Laptop & PC buying guides, comparisons, refurbished laptop advice, and local tech guides from Durgapur, Asansol, and Ukhra.",
          "publisher": { "@type": "Organization", "name": "Infofix Computers", "url": "https://infofixcomputers.com" },
          "blogPost": posts.slice(0, 5).map((p) => ({
            "@type": "BlogPosting",
            "headline": p.title,
            "url": `https://infofixcomputers.com/blog/${toSlug(p.title)}`,
            "datePublished": p.published_date,
            "author": { "@type": "Organization", "name": p.author }
          }))
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
            Honest buying guides, comparisons, and local tech advice — written by real technicians at Infofix Computers, Durgapur, Asansol, and Ukhra. Helping you find the perfect laptop or PC without the tech jargon.
          </p>
        </div>

        {/* Featured */}
        {!loading && featured && (
          <div
            onClick={() => navigate(`/blog/${toSlug(featured.title)}`)}
            className="cursor-pointer group mb-20 grid grid-cols-1 lg:grid-cols-2 rounded-4xl overflow-hidden shadow-2xl border border-gray-100 hover:shadow-3xl transition-all"
          >
            <div className="aspect-video lg:aspect-auto overflow-hidden">
              <img src={featured.image_url} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
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
                <span>·</span>
                <span>{readTime(featured.excerpt)} min read</span>
              </div>
            </div>
          </div>
        )}

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
                const cat = categoryStyle[post.category];
                const mins = readTime(post.excerpt);
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
            All guides written by technicians at Infofix Computers, Durgapur, Asansol, Ukhra — based on real customer questions and hands-on experience with machines we sell and build daily.
          </p>
        </div>
      </div>
    </div>
  );
};