import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";
import { seoRoutes } from "./seo-routes.mjs";
import { readFileSync } from "fs";
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

const staticUrls = seoRoutes;
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
const blogSlugs = (posts ?? []).map(p => `/blog/${toSlug(p.title)}`);
const productSlugs = (products ?? []).map(p => {
  const slug = p.name.toLowerCase().replace(/[^a-z0-9\s-]/g,"").trim().replace(/\s+/g,"-").slice(0,80);
  return `/products/${slug}-${p.id}`;
});

const allSnapUrls = [
  ...seoRoutes.map(([path]) => path),
  ...blogSlugs,
  ...productSlugs,
];

const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
pkg.reactSnap.include = allSnapUrls;
writeFileSync("package.json", JSON.stringify(pkg, null, 2));

console.log(`✅ Sitemap generated: ${posts?.length ?? 0} blogs + ${products?.length ?? 0} products`);
console.log(`✅ reactSnap.include updated: ${allSnapUrls.length} URLs`);