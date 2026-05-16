import { YoutubeTranscript } from 'youtube-transcript';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: "videoId required" });

  try {
    // Try Hindi first (hi), then auto-Hindi (a.hi), then English
    let transcript = null;
    for (const lang of ["hi", "a.hi", "en", "a.en"]) {
      try {
        const result = await YoutubeTranscript.fetchTranscript(videoId, { lang });
        if (result?.length) { transcript = result; break; }
      } catch (_) {}
    }

    if (!transcript) {
      // Last resort: fetch without lang param
      transcript = await YoutubeTranscript.fetchTranscript(videoId);
    }

    const text = transcript.map(t => t.text).join(" ");
    res.status(200).json({ transcript: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}