import { createClient } from "@supabase/supabase-js";
import { writeFileSync, readFileSync } from "fs";
import { seoRoutes } from "./seo-routes.mjs";

const supabase = createClient(
  "https://lzvwoskpauxqfhphjyac.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6dndvc2twYXV4cWZocGhqeWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MjE1NjUsImV4cCI6MjA4NzQ5NzU2NX0.dCZA1HLawz3mHzJKxHET_jZp5cGBMUXfIFUUMN3rncM",
);

function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/[₹&@#%\+\*\(\)\[\]]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function extractVideoId(url) {
  if (!url) return null;
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
  ];
  for (const p of patterns) {
    const m = url?.match(p);
    if (m) return m[1];
  }
  return null;
}

const { data: posts } = await supabase
  .from("updates")
  .select("title, published_date, video_url, excerpt")
  .order("published_date", { ascending: false });

const { data: products } = await supabase
  .from("products")
  .select("id, name, updated_at")
  .eq("is_active", true);

const videoPosts = (posts ?? []).filter((p) => extractVideoId(p.video_url));
const articlePosts = (posts ?? []).filter((p) => !extractVideoId(p.video_url));

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n`;

// Static SEO routes
for (const [path, priority, freq] of seoRoutes) {
  xml += `  <url><loc>https://infofixcomputers.com${path}</loc><priority>${priority}</priority><changefreq>${freq}</changefreq></url>\n`;
}

// Article blog posts
for (const post of articlePosts) {
  const slug = toSlug(post.title);
  xml += `  <url><loc>https://infofixcomputers.com/blog/${slug}</loc><priority>0.8</priority><changefreq>monthly</changefreq><lastmod>${post.published_date}</lastmod></url>\n`;
}

// Video blog posts
for (const post of videoPosts) {
  const slug = toSlug(post.title);
  const videoId = extractVideoId(post.video_url);
  xml += `  <url>
    <loc>https://infofixcomputers.com/blog/${slug}</loc>
    <priority>0.8</priority>
    <changefreq>monthly</changefreq>
    <lastmod>${post.published_date}</lastmod>
    <video:video>
      <video:thumbnail_loc>https://img.youtube.com/vi/${videoId}/hqdefault.jpg</video:thumbnail_loc>
      <video:title>${post.title.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</video:title>
      <video:description>${(post.excerpt ?? "").slice(0, 200).replace(/&/g, "&amp;").replace(/</g, "&lt;")}</video:description>
      <video:content_loc>https://www.youtube.com/watch?v=${videoId}</video:content_loc>
      <video:player_loc>https://www.youtube.com/embed/${videoId}</video:player_loc>
      <video:publication_date>${post.published_date}</video:publication_date>
    </video:video>
  </url>\n`;
}

// Product pages
for (const p of products ?? []) {
  const slug = p.name
    .toLowerCase()
    .replace(/[₹&@#%\+\*\(\)\[\]]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
  const lastmod = p.updated_at ? p.updated_at.split("T")[0] : "";
  xml += `  <url><loc>https://infofixcomputers.com/products/${slug}-${p.id}</loc><priority>0.7</priority><changefreq>weekly</changefreq>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>\n`;
}

xml += `</urlset>`;
writeFileSync("public/sitemap.xml", xml);

// Update package.json reactSnap.include
const blogSlugs = (posts ?? []).map((p) => `/blog/${toSlug(p.title)}`);
const productSlugs = (products ?? []).map((p) => {
  const slug = p.name
    .toLowerCase()
    .replace(/[₹&@#%\+\*\(\)\[\]]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
  return `/products/${slug}-${p.id}`;
});

const allSnapUrls = [
  ...seoRoutes.map(([path]) => path),
  ...blogSlugs,
  ...productSlugs,
];

const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
pkg.reactSnap = pkg.reactSnap ?? {};
pkg.reactSnap.include = allSnapUrls;
writeFileSync("package.json", JSON.stringify(pkg, null, 2));

console.log(`✅ ${articlePosts.length} articles + ${videoPosts.length} videos + ${products?.length ?? 0} products`);
console.log(`✅ reactSnap.include: ${allSnapUrls.length} URLs`);