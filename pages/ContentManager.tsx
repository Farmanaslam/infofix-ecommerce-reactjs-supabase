import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Star } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { UpdateForm, UpdatePost } from "../types";
import { ContentRowSkeleton } from "./Skeleton";

const categories = [
  "Business & Student Laptops",
  "Refurbished vs New",
  "Accessories & Upgrades",
];

export const ContentManager: React.FC = () => {
  const [posts, setPosts] = useState<UpdatePost[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<UpdatePost | null>(null);
  const [loading, setLoading] = useState(true);
  const emptyForm: UpdateForm = {
    title: "",
    excerpt: "",
    category: categories[0],
    author: "Infofix Technical Team",
    image_url: "",
    is_featured: false,
  };
  const [formData, setFormData] = useState<UpdateForm>(emptyForm);

  // ================= FETCH =================
  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("updates")
      .select("*")
      .order("published_date", { ascending: false });

    if (data) setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // ================= SAVE =================
  const handleSave = async () => {
    if (editingPost) {
      await supabase.from("updates").update(formData).eq("id", editingPost.id);
    } else {
      const { error } = await supabase.from("updates").insert([
        {
          ...formData,
        },
      ]);
    }

    setIsOpen(false);
    setEditingPost(null);
    setFormData(emptyForm);
    fetchPosts();
  };

  // ================= DELETE =================
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Delete this update?");
    if (!confirmDelete) return;

    await supabase.from("updates").delete().eq("id", id);
    fetchPosts();
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Content Management
          </h1>
          <p className="text-sm text-gray-500">
            Manage blog updates & buying guides
          </p>
        </div>

        <button
          onClick={() => {
            setFormData(emptyForm);
            setEditingPost(null);
            setIsOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Update
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-160 text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-4 text-left">Title</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Featured</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <ContentRowSkeleton key={i} />
                ))
              ) : posts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-gray-400 font-medium"
                  >
                    No posts yet. Click "Add Update" to create one.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-4 font-semibold text-gray-900">
                      {post.title}
                    </td>
                    <td className="p-4">{post.category}</td>
                    <td className="p-4">
                      {new Date(post.published_date).toDateString()}
                    </td>
                    <td className="p-4">
                      {post.is_featured && (
                        <Star className="w-4 h-4 text-yellow-500" />
                      )}
                    </td>
                    <td className="p-4 text-right flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setEditingPost(post);
                          setFormData(post);
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black">
                {editingPost ? "Edit Update" : "Add New Update"}
              </h2>
              <button onClick={() => setIsOpen(false)}>
                <X />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-3 border rounded-xl"
              />

              <textarea
                placeholder="Excerpt"
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                className="w-full px-4 py-3 border rounded-xl"
                rows={4}
              />

              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-3 border rounded-xl"
              >
                {categories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Image URL"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                className="w-full px-4 py-3 border rounded-xl"
              />

              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_featured: e.target.checked,
                    })
                  }
                />
                Mark as Featured
              </label>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
            >
              {editingPost ? "Update" : "Publish"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
