import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";

const supabase = createClient(
  "https://lzvwoskpauxqfhphjyac.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6dndvc2twYXV4cWZocGhqeWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MjE1NjUsImV4cCI6MjA4NzQ5NzU2NX0.dCZA1HLawz3mHzJKxHET_jZp5cGBMUXfIFUUMN3rncM",
);

function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

const { data: posts } = await supabase
  .from("updates")
  .select("title, published_date")
  .order("published_date", { ascending: false });

const { data: products } = await supabase
  .from("products")
  .select("id, name, updated_at")
  .eq("is_active", true);

const staticUrls = [
  ["/", "1.0", "daily"],
  ["/shop", "0.9", "daily"],
  ["/buy-laptop-durgapur", "0.9", "weekly"],
  ["/buy-laptop-asansol", "0.9", "weekly"],
  ["/buy-refurbished-laptop-durgapur", "0.9", "weekly"],
  ["/second-hand-laptop-durgapur", "0.9", "weekly"],
  ["/computer-shop-durgapur", "0.9", "weekly"],
  ["/computer-shop-asansol", "0.8", "weekly"],
  ["/laptop-shop-durgapur", "0.9", "weekly"],
  ["/gaming-pc-durgapur", "0.8", "weekly"],
  ["/custom-pc-build-durgapur", "0.8", "weekly"],
  ["/buy-gaming-laptop-durgapur", "0.8", "weekly"],
  ["/laptop-repair-durgapur", "0.8", "weekly"],
  ["/computer-repair-durgapur", "0.8", "weekly"],
  ["/laptop-repair-asansol", "0.8", "weekly"],
  ["/laptop-under-30000", "0.8", "weekly"],
  ["/laptop-under-50000", "0.8", "weekly"],
  ["/gaming-laptop-under-60000", "0.8", "weekly"],
  ["/best-laptop-for-students", "0.8", "weekly"],
  ["/best-laptop-for-programming", "0.8", "weekly"],
  ["/buy-refurbished-laptop", "0.9", "weekly"],
  ["/refurbished-laptop-india", "0.8", "weekly"],
  ["/certified-refurbished-laptop", "0.8", "weekly"],
  ["/wholesale-laptop-west-bengal", "0.8", "weekly"],
  ["/bulk-laptop-supplier-durgapur", "0.8", "weekly"],
  ["/buy-laptop-ukhra", "0.7", "weekly"],
  ["/computer-shop-ukhra", "0.7", "weekly"],
  ["/buy-laptop-near-me", "0.8", "weekly"],
  ["/blog", "0.8", "weekly"],
  ["/about", "0.6", "monthly"],
  ["/contact", "0.7", "monthly"],
  ["/services", "0.7", "monthly"],
  ["/branches", "0.7", "monthly"],
  ["/careers", "0.5", "monthly"],
];

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

for (const [path, priority, freq] of staticUrls) {
  xml += `  <url><loc>https://infofixcomputers.com${path}</loc><priority>${priority}</priority><changefreq>${freq}</changefreq></url>\n`;
}

// Blog posts
for (const post of posts ?? []) {
  const slug = toSlug(post.title);
  xml += `  <url><loc>https://infofixcomputers.com/blog/${slug}</loc><priority>0.8</priority><changefreq>monthly</changefreq><lastmod>${post.published_date}</lastmod></url>\n`;
}

// Product pages
for (const p of products ?? []) {
  const slug = p.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
  xml += `  <url><loc>https://infofixcomputers.com/products/${slug}-${p.id}</loc><priority>0.7</priority><changefreq>weekly</changefreq></url>\n`;
}

xml += `</urlset>`;

writeFileSync("public/sitemap.xml", xml);
console.log(
  `✅ Sitemap generated: ${posts?.length ?? 0} blogs + ${products?.length ?? 0} products`,
);
