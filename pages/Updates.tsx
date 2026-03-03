import React, { useEffect, useState } from "react";
import { Calendar, User, ChevronRight, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { UpdatePost } from "../types";

export const Updates: React.FC = () => {
  const [posts, setPosts] = useState<UpdatePost[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedPost, setSelectedPost] = useState<UpdatePost | null>(null);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fallbackPosts: UpdatePost[] = [
    {
      id: "1",
      title: "Why Business-Series Laptops Are Better Than Home-Series Laptops",
      excerpt:
        "Business laptops are designed for durability and long-term performance.",
      category: "Business & Student Laptops",
      author: "Infofix Technical Team",
      image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
      published_date: "2024-10-12",
      is_featured: true,
    },
  ];
  useEffect(() => {
    const fetchUpdates = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("updates")
        .select("*")
        .order("published_date", { ascending: false });

      if (error || !data) {
        setPosts([]);
      } else {
        setPosts(data);
      }

      setLoading(false);
    };

    fetchUpdates();
  }, []);

  const categories = [
    "All",
    "Business & Student Laptops",
    "Refurbished vs New",
    "Accessories & Upgrades",
  ];

  const filteredPosts =
    activeCategory === "All"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  return (
    <div className="py-24 max-w-7xl mx-auto px-4">
      {/* Hero */}
      <div className="mb-16 text-center space-y-6">
        <h1 className="text-5xl font-black text-gray-900">
          Tech Updates & Buying Guides
        </h1>
        <p className="text-gray-500 text-lg max-w-3xl mx-auto">
          Learn before you buy. Stay updated with Infofix Computers.
        </p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-4 justify-center mb-16">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2 rounded-full text-sm font-bold transition ${
              activeCategory === cat
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="grid grid-cols-1 gap-16">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="group grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div className="relative aspect-video overflow-hidden rounded-[40px] shadow-2xl">
              <img
                src={post.image_url}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                alt={post.title}
              />
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-6 text-sm font-bold text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.published_date).toDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {post.author}
                </div>
              </div>

              <h2 className="text-4xl font-black text-gray-900">
                {post.title}
              </h2>

              <p className="text-gray-500 text-lg font-medium">
                {post.excerpt}
              </p>

              <button
                onClick={() => setSelectedPost(post)}
                className="text-indigo-600 font-bold flex items-center gap-2 hover:gap-4 transition-all"
              >
                Read More <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ARTICLE MODAL */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
          <div className="bg-white max-w-4xl w-full rounded-3xl overflow-auto max-h-[90vh] p-10 relative">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-6 right-6"
            >
              <X />
            </button>

            <img
              src={selectedPost.image_url}
              className="w-full rounded-2xl mb-8"
            />

            <h2 className="text-4xl font-black mb-6">{selectedPost.title}</h2>

            <p className="text-gray-600 leading-relaxed text-lg">
              {selectedPost.excerpt}
            </p>
          </div>
        </div>
      )}

      {/* Trust Section */}
      <div className="mt-32 text-center bg-gray-50 p-12 rounded-3xl">
        <h2 className="text-3xl font-black text-gray-900 mb-4">
          Written by Real Technicians
        </h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          All updates are created by experienced technicians at Infofix
          Computers based on real customer needs.
        </p>
      </div>
    </div>
  );
};
