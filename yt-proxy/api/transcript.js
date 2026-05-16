export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: "videoId required" });

  try {
    // Fetch YouTube page to get caption track URLs
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      }
    });
    const html = await pageRes.text();

    // Extract captionTracks from ytInitialPlayerResponse
    const match = html.match(/"captionTracks":(\[.*?\])/);
    if (!match) return res.status(500).json({ error: "No captions found on this video" });

    const tracks = JSON.parse(match[1]);
    
    // Prefer Hindi, fallback to first available
    const track = tracks.find(t => t.languageCode === "hi") 
      || tracks.find(t => t.languageCode === "en")
      || tracks[0];

    if (!track) return res.status(500).json({ error: "No caption track available" });

    // Fetch the actual transcript XML
    const xmlRes = await fetch(track.baseUrl);
    const xml = await xmlRes.text();

    // Parse XML to plain text
    const text = xml
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim();

    res.status(200).json({ transcript: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}