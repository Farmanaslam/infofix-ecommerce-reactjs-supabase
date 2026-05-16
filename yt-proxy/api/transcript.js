export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: "videoId required" });

  const API_KEY = process.env.YOUTUBE_API_KEY;

  try {
    // Get caption tracks
    const listRes = await fetch(
      `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${API_KEY}`
    );
    const listData = await listRes.json();

    if (listData.error) {
      return res.status(500).json({ error: listData.error.message });
    }

    if (!listData.items?.length) {
      // Fallback: timedtext API (no auth needed)
      const timedRes = await fetch(
        `https://www.youtube.com/api/timedtext?v=${videoId}&lang=hi&fmt=json3`
      );
      const timedData = await timedRes.json().catch(() => null);
      const text = (timedData?.events ?? [])
        .flatMap(e => e.segs ?? [])
        .map(s => s.utf8 ?? "")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (text) return res.status(200).json({ transcript: text });
      return res.status(500).json({ error: "No captions found" });
    }

    // Pick Hindi or first track
    const track =
      listData.items.find(t => t.snippet.language === "hi") ||
      listData.items[0];

    // timedtext fetch using language code
    const lang = track.snippet.language;
    const timedRes = await fetch(
      `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}&fmt=json3`
    );
    const timedData = await timedRes.json().catch(() => null);
    const text = (timedData?.events ?? [])
      .flatMap(e => e.segs ?? [])
      .map(s => s.utf8 ?? "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (!text) return res.status(500).json({ error: "Transcript empty" });
    return res.status(200).json({ transcript: text });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}