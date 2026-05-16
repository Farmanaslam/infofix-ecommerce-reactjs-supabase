import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Star, Youtube, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { UpdateForm, UpdatePost } from "../types";
import { ContentRowSkeleton } from "./Skeleton";

const categories = ["Laptops", "Custom Build PCs", "Desktop PCs", "Videos"];

function extractVideoId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /youtu\.be\/([^?&\s]+)/,
    /youtube\.com\/watch\?v=([^&\s]+)/,
    /youtube\.com\/shorts\/([^?&\s]+)/,
    /youtube\.com\/embed\/([^?&\s]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}


async function fetchYouTubeTranscript(videoId: string): Promise<string> {
  const proxy = import.meta.env.VITE_TRANSCRIPT_PROXY;
  if (!proxy) throw new Error("VITE_TRANSCRIPT_PROXY not set in .env");
  
  const res = await fetch(`${proxy}/api/transcript?videoId=${videoId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Transcript fetch failed. Make sure video has captions enabled.");
  }
  const data = await res.json();
  if (!data.transcript) throw new Error("No transcript found. Enable auto-captions on YouTube first.");
  return data.transcript;
}

async function generateFromTranscript(
  transcript: string
): Promise<{ en: string; hinglish: string }> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const prompt = `You are helping Infofix Computers, a computer shop in Durgapur, India, create blog descriptions from a YouTube video transcript.

The transcript below is from a YouTube video (may be in Hindi or mixed language):

"${transcript.slice(0, 3000)}"

Generate TWO blog descriptions based on what was said in the video:
1. en: English version, 150-200 words, SEO-friendly, natural English. Mention Infofix Computers, Durgapur naturally if relevant.
2. hinglish: Hinglish version, 150-200 words. Mix Hindi words naturally into English sentences. Example: "Yaar is laptop ka performance ekdum mast hai, aur price bhi pocket-friendly hai". Casual, local, relatable.

Return ONLY valid JSON, no markdown, no extra text:
{"en": "...", "hinglish": "..."}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1200 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message ?? "Gemini API error");
  }

  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const clean = raw.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);
  return { en: parsed.en ?? "", hinglish: parsed.hinglish ?? "" };
}
export const ContentManager: React.FC = () => {
  const [posts, setPosts] = useState<UpdatePost[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<UpdatePost | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [postType, setPostType] = useState<"article" | "video">("article");
  const [descTab, setDescTab] = useState<"en" | "hinglish">("en");

  const emptyForm: UpdateForm = {
    title: "",
    excerpt: "",
    category: categories[0],
    author: "Infofix Technical Team",
    image_url: "",
    is_featured: false,
    video_url: "",
    description_en: "",
    description_hinglish: "",
  };
  const [staffDescription, setStaffDescription] = useState("");
  const [formData, setFormData] = useState<UpdateForm>(emptyForm);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("updates")
      .select("*")
      .order("published_date", { ascending: false });
    if (data) setPosts(data);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleSave = async () => {
    const payload = { ...formData };
    if (postType === "article") {
      payload.video_url = "";
      payload.description_en = "";
      payload.description_hinglish = "";
    }
    if (editingPost) {
      await supabase.from("updates").update(payload).eq("id", editingPost.id);
    } else {
      await supabase.from("updates").insert([payload]);
    }
    setIsOpen(false);
    setEditingPost(null);
    setFormData(emptyForm);
    setPostType("article");
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this post?")) return;
    await supabase.from("updates").delete().eq("id", id);
    fetchPosts();
  };

 const handleGenerate = async () => {
    if (!videoId) {
      alert("Paste a valid YouTube URL first.");
      return;
    }
    setAiLoading(true);
    try {
      const transcript = await fetchYouTubeTranscript(videoId);
      const result = await generateFromTranscript(transcript);
      setFormData((f) => ({
        ...f,
        excerpt: result.en,
        description_en: result.en,
        description_hinglish: result.hinglish,
      }));
      setDescTab("en");
    } catch (err: any) {
      alert("Failed: " + (err?.message ?? "Unknown error"));
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const videoId = formData.video_url ? extractVideoId(formData.video_url) : null;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Content Management</h1>
          <p className="text-sm text-gray-500">Manage blog posts, guides & video posts</p>
        </div>
        <button
          onClick={() => {
            setFormData(emptyForm);
            setEditingPost(null);
           setPostType("article");
            setDescTab("en");
            setStaffDescription("");
            setIsOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" /> Add Post
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-160 text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-4 text-left">Title</th>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Featured</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <ContentRowSkeleton key={i} />)
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 font-medium">
                    No posts yet. Click "Add Post" to create one.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-4 font-semibold text-gray-900 max-w-xs truncate">{post.title}</td>
                    <td className="p-4">
                      {post.video_url
                        ? <span className="flex items-center gap-1 text-red-500 font-bold text-xs"><Youtube className="w-3.5 h-3.5" /> Video</span>
                        : <span className="text-gray-400 text-xs font-bold">Article</span>}
                    </td>
                    <td className="p-4">{post.category}</td>
                    <td className="p-4">{new Date(post.published_date).toDateString()}</td>
                    <td className="p-4">{post.is_featured && <Star className="w-4 h-4 text-yellow-500" />}</td>
                    <td className="p-4 text-right flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setEditingPost(post);
                          setFormData({
                            title: post.title,
                            excerpt: post.excerpt,
                            category: post.category,
                            author: post.author,
                            image_url: post.image_url,
                            is_featured: post.is_featured,
                            video_url: post.video_url ?? "",
                            description_en: post.description_en ?? "",
                            description_hinglish: post.description_hinglish ?? "",
                          });
                         setPostType(post.video_url ? "video" : "article");
                          setDescTab("en");
                          setStaffDescription("");
                          setIsOpen(true);
                        }}
                        className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black">{editingPost ? "Edit Post" : "Add New Post"}</h2>
              <button onClick={() => setIsOpen(false)}><X /></button>
            </div>

            {/* TYPE TOGGLE */}
            <div className="flex gap-3">
              <button
                onClick={() => setPostType("article")}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition ${postType === "article" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"}`}
              >
                📝 Article Blog
              </button>
              <button
                onClick={() => setPostType("video")}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${postType === "video" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-500"}`}
              >
                <Youtube className="w-4 h-4" /> Video Blog
              </button>
            </div>

            <div className="space-y-4">

              {/* ── VIDEO BLOG FLOW ── */}
              {postType === "video" && (
                <>
                  {/* STEP 1: YouTube URL */}
                  <div className="rounded-2xl border-2 border-gray-100 p-4 space-y-3">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Step 1 — Paste YouTube Link</p>
                    <input
                      type="text"
                      placeholder="https://youtu.be/xxxxx  or  youtube.com/watch?v=xxx  or  /shorts/xxx"
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      className="w-full px-4 py-3 border rounded-xl text-sm"
                    />
                    {videoId && <p className="text-xs text-green-600 font-bold ml-1">✅ Valid — Video ID: {videoId}</p>}
                    {formData.video_url && !videoId && <p className="text-xs text-red-500 font-bold ml-1">❌ Invalid YouTube URL</p>}

                    {/* Thumbnail preview */}
                    {videoId && (
                      <div className="rounded-xl overflow-hidden aspect-video border">
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                          alt="thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                   <div className="space-y-3">
                    <div>
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Title</label>
                      <input
                        type="text"
                        placeholder="Write your blog title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 border rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 border rounded-xl text-sm"
                      >
                        {categories.map((cat) => <option key={cat}>{cat}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* STEP 2: AI Generate */}
               <div className="rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-4 space-y-3">
                    <p className="text-xs font-black text-indigo-700 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Step 2 — Auto-Generate Descriptions from Video
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      Fetches your video's Hindi captions → generates English + Hinglish descriptions automatically.
                    </p>
                    <button
                      onClick={handleGenerate}
                      disabled={aiLoading || !videoId}
                      className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      {aiLoading
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Fetching transcript + generating…</>
                        : <><Sparkles className="w-4 h-4" /> Generate from Video</>}
                    </button>
                  </div>

                  {/* STEP 3: Review & edit generated content */}
                  {(formData.description_en || formData.description_hinglish) && (
                    <div className="rounded-2xl border-2 border-green-100 bg-green-50/30 p-4 space-y-4">
                      <p className="text-xs font-black text-green-700 uppercase tracking-widest">Step 3 — Review & Edit</p>

                      {/* Title */}
                      <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Title</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-4 py-3 border rounded-xl text-sm"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Category</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-4 py-3 border rounded-xl text-sm"
                        >
                          {categories.map((cat) => <option key={cat}>{cat}</option>)}
                        </select>
                      </div>

                      {/* Description tabs */}
                      <div>
                        <div className="flex gap-2 mb-3">
                          <button
                            onClick={() => setDescTab("en")}
                            className={`px-4 py-1.5 rounded-full text-xs font-black transition ${descTab === "en" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"}`}
                          >🇬🇧 English</button>
                          <button
                            onClick={() => setDescTab("hinglish")}
                            className={`px-4 py-1.5 rounded-full text-xs font-black transition ${descTab === "hinglish" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"}`}
                          >🤙 Hinglish</button>
                        </div>
                        {descTab === "en" ? (
                          <textarea
                            value={formData.description_en}
                            onChange={(e) => setFormData({ ...formData, description_en: e.target.value, excerpt: e.target.value })}
                            className="w-full px-4 py-3 border rounded-xl text-sm"
                            rows={5}
                          />
                        ) : (
                          <textarea
                            value={formData.description_hinglish}
                            onChange={(e) => setFormData({ ...formData, description_hinglish: e.target.value })}
                            className="w-full px-4 py-3 border rounded-xl text-sm"
                            rows={5}
                          />
                        )}
                        <p className="text-xs text-gray-400 mt-1.5 ml-1">Edit freely. English version = used for SEO meta description.</p>
                      </div>

                      <label className="flex items-center gap-2 text-sm font-medium">
                        <input
                          type="checkbox"
                          checked={formData.is_featured}
                          onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        />
                        Mark as Featured
                      </label>
                    </div>
                  )}

                  {/* Show title+category+featured even before generate if editing */}
                  {!formData.description_en && editingPost && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 border rounded-xl"
                      />
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 border rounded-xl"
                      >
                        {categories.map((cat) => <option key={cat}>{cat}</option>)}
                      </select>
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <input
                          type="checkbox"
                          checked={formData.is_featured}
                          onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        />
                        Mark as Featured
                      </label>
                    </div>
                  )}
                </>
              )}

              {/* ── ARTICLE BLOG FLOW ── */}
              {postType === "article" && (
                <>
                  <input
                    type="text"
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border rounded-xl"
                  />
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border rounded-xl"
                  >
                    {categories.map((cat) => <option key={cat}>{cat}</option>)}
                  </select>
                  <textarea
                    placeholder="Excerpt / Description"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-4 py-3 border rounded-xl"
                    rows={4}
                  />
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-3 border rounded-xl"
                  />
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    />
                    Mark as Featured
                  </label>
                </>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={
                !formData.title ||
                (postType === "video" && !videoId) ||
                (postType === "video" && !formData.description_en)
              }
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingPost ? "Update" : "Publish"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};