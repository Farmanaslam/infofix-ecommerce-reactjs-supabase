
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

// ── Generate EN + Hinglish from pasted transcript ─────────────────────────────
async function generateDescriptions(
  transcript: string,
  videoTitle?: string
): Promise<{ en: string; hinglish: string }> {

  // Clean timestamps & line breaks before sending
  const cleanTranscript = transcript
    .replace(/\d+:\d+(?::\d+)?\s*/g, "")   // remove timestamps
    .replace(/\n+/g, " ")                    // flatten to one line
    .replace(/\s{2,}/g, " ")                 // collapse spaces
    .trim();

  const callGroq = async (prompt: string) => {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data?.choices?.[0]?.message?.content ?? "";
  };

  const base = `${videoTitle ? `Video Title: "${videoTitle}"\n` : ""}Transcript:\n"""\n${cleanTranscript}\n"""`;

  const enRaw = await callGroq(`You write SEO blog descriptions for Infofix Computers — a computer store in Durgapur, Asansol, Ukhra West Bengal, India that sells new and refurbished laptops, desktops, accessories, and custom-build PCs also through webiste and 5 physical stores..

${base}

Write a 200-300 word SEO blog post excerpt in fluent English based ONLY on what was spoken in the transcript above. Follow these rules:
- Paragraph 1 (3-4 sentences): What products, offers, specs, or highlights are shown/discussed. Include all key prices, brands, processor names, RAM, storage, warranty details mentioned.
- Paragraph 2 (2-3 sentences): What makes Infofix Computers the right place to buy — use only details spoken in the video (location, offers, free gifts, etc).
- Final sentence: Natural CTA mentioning infocomput.com or visiting the Infofix showroom.
- Do NOT invent details not in the transcript. Do NOT use phrases like "In this video". Write as a blog author, not a video summarizer.
- Tone: Helpful, knowledgeable, trustworthy local tech advisor.

Return ONLY plain text. No markdown, no headers, no bullet points.`);

  // wait 35s to avoid TPM limit
  await new Promise(r => setTimeout(r, 35000));

  const hinglishRaw = await callGroq(`You write Hinglish blog content for Infofix Computers — a computer store in Durgapur, West Bengal that sells new and refurbished laptops, desktops, accessories, and custom-build PCs.

${base}

Write a 200-250 word blog excerpt in Hinglish using ROMAN SCRIPT ONLY (absolutely no Devanagari/Hindi Unicode characters). Rules:
- Natural mix of Hindi and English words in Roman script, like: "yaar", "ekdum sahi deal hai", "bilkul brand new condition mein", "price sun ke hairan ho jaoge", "aaj hi visit karo".
- Casual, friendly tone — like a local Durgapur friend explaining a good deal.
- Paragraph 1: Cover all key products, prices, specs, and offers mentioned in the transcript.
- Paragraph 2: Why Infofix is worth visiting — only facts from the transcript.
- Final sentence: CTA — mention infocomput.com or visiting the showroom.
- Do NOT invent details. Do NOT use Devanagari script at all.

Return ONLY plain text. No markdown, no headers, no bullet points.`);

  return { en: enRaw.trim(), hinglish: hinglishRaw.trim() };
}

export const ContentManager: React.FC = () => {
  const [posts, setPosts] = useState<UpdatePost[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<UpdatePost | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState("");
  const [postType, setPostType] = useState<"article" | "video">("article");
  const [descTab, setDescTab] = useState<"en" | "hinglish">("en");
  const [pastedTranscript, setPastedTranscript] = useState("");

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
      payload.author = payload.author || "Infofix Technical Team";
    } else {
      payload.author = "Infofix Admin";
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
    if (!pastedTranscript.trim()) {
      alert("Paste the video transcript first.");
      return;
    }
    setAiLoading(true);
    setAiStatus("Generating descriptions…");
    try {
      const result = await generateDescriptions(pastedTranscript, formData.title || undefined);
      setFormData((f) => ({
        ...f,
        excerpt: result.en,
        description_en: result.en,
        description_hinglish: result.hinglish,
      }));
      setDescTab("en");
    } catch (err: any) {
      alert("Failed: " + (err?.message ?? "Unknown error"));
    } finally {
      setAiLoading(false);
      setAiStatus("");
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
            setPastedTranscript("");
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
                          setPastedTranscript("");
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
              {postType === "video" && (
                <>
                  {/* STEP 1 */}
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
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">
                        Title <span className="normal-case font-medium text-gray-400">(optional — helps AI)</span>
                      </label>
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

                  {/* STEP 2 */}
                  <div className="rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-4 space-y-3">
                    <p className="text-xs font-black text-indigo-700 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Step 2 — Paste Transcript & Generate
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      Paste transcript from YouTube (transcript tab or Studio) → AI writes a ~200-word SEO blog in English + Hinglish. Timestamps are stripped automatically. Takes ~40 sec.
                    </p>
                    <textarea
                      placeholder="Paste video transcript here…"
                      value={pastedTranscript}
                      onChange={(e) => setPastedTranscript(e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl text-sm resize-none"
                      rows={5}
                    />
                    <button
                      onClick={handleGenerate}
                      disabled={aiLoading || !pastedTranscript.trim()}
                      className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      {aiLoading
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> {aiStatus || "Working…"}</>
                        : <><Sparkles className="w-4 h-4" /> Generate Descriptions</>}
                    </button>
                  </div>

                  {/* STEP 3 */}
                  {(formData.description_en || formData.description_hinglish) && (
                    <div className="rounded-2xl border-2 border-green-100 bg-green-50/30 p-4 space-y-4">
                      <p className="text-xs font-black text-green-700 uppercase tracking-widest">Step 3 — Review & Edit</p>
                      <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Title</label>
                        <input
                          type="text"
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
                        <p className="text-xs text-gray-400 mt-1.5 ml-1">English version = SEO meta description.</p>
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
