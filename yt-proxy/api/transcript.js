import { YoutubeTranscript } from 'youtube-transcript';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { videoId, lang } = req.query;
  if (!videoId) return res.status(400).json({ error: "videoId required" });

  try {
    // Try requested lang first, fallback to hi, then en
    const langs = [lang, "hi", "en", "a.hi", "a.en"].filter(Boolean);
    let transcript = null;
    let lastErr = null;

    for (const l of langs) {
      try {
        const result = await YoutubeTranscript.fetchTranscript(videoId, { lang: l });
        if (result?.length) { transcript = result; break; }
      } catch (e) { lastErr = e; }
    }

    if (!transcript) throw lastErr ?? new Error("No transcript found");

    const text = transcript.map(t => t.text).join(" ");
    return res.status(200).json({ transcript: text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}